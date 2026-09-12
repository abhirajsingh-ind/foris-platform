import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { logAuditEvent } from '../middleware/auditLogger';
import { calculateReportHash, sha256 } from '../utils/crypto';
import { anomalyEngine } from '../utils/anomalyEngine';

export const reportsRouter = Router();

reportsRouter.use(requireAuth);

const VALID_AMENDMENT_REASONS = [
  'Typographical correction',
  'Additional evidence',
  'Re-examination',
  'Laboratory correction',
  'Court instruction',
  'Administrative correction',
  'Other',
];

// GET /api/reports - List forensic reports
reportsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { caseId } = req.query;
    const where: any = {};
    if (caseId && typeof caseId === 'string') {
      where.caseId = caseId;
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        case: {
          select: { id: true, firNumber: true, title: true, priority: true },
        },
        author: {
          select: { id: true, badgeId: true, name: true, designation: true },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
        _count: {
          select: { versions: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ success: true, reports });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve reports.' });
  }
});

// GET /api/reports/:id - Retrieve report dossier with full version history
reportsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        case: {
          include: {
            assignedOfficer: {
              select: { id: true, badgeId: true, name: true, designation: true },
            },
          },
        },
        author: {
          select: { id: true, badgeId: true, name: true, designation: true, department: true },
        },
        versions: {
          include: {
            author: {
              select: { id: true, badgeId: true, name: true, designation: true },
            },
          },
          orderBy: { versionNumber: 'desc' },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Forensic report not found.' });
    }

    await logAuditEvent({
      userId: user.id,
      userBadge: user.badgeId,
      userName: user.name,
      role: user.role,
      action: 'REPORT_VIEWED',
      caseId: report.caseId,
      resourceType: 'FORENSIC_REPORT',
      resourceId: report.id,
      result: 'SUCCESS',
      severity: 'INFO',
      metadata: { currentVersion: report.currentVersion, status: report.status },
      ipAddress: req.ip,
    });

    res.json({ success: true, report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to load report.' });
  }
});

// POST /api/reports - Create initial report V1 (Forensic Officer only; Judge/Police strictly blocked)
reportsRouter.post(
  '/',
  requireRoles(['FORENSIC_OFFICER', 'ADMINISTRATOR']),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const {
        id,
        caseId,
        title,
        evidenceExamined,
        examinationMethod,
        observations,
        findings,
        conclusion,
      } = req.body;

      if (!id || !caseId || !title || !evidenceExamined || !findings || !conclusion) {
        return res.status(400).json({
          success: false,
          error: 'Report ID, Case ID, Title, Evidence Examined, Findings, and Conclusion are required.',
        });
      }

      // Check case exists
      const forensicCase = await prisma.case.findUnique({ where: { id: caseId } });
      if (!forensicCase) {
        return res.status(404).json({ success: false, error: 'Case ID does not exist.' });
      }

      // Check unique report ID
      const existing = await prisma.report.findUnique({ where: { id } });
      if (existing) {
        return res.status(409).json({ success: false, error: `Report ID '${id}' is already assigned.` });
      }

      const reportHash = calculateReportHash({
        evidenceExamined,
        examinationMethod: examinationMethod || 'Standard Forensic Protocol',
        observations: observations || '',
        findings,
        conclusion,
      });

      const report = await prisma.$transaction(async (tx) => {
        const rep = await tx.report.create({
          data: {
            id: id.trim().toUpperCase(),
            caseId,
            title: title.trim(),
            currentVersion: 1,
            status: 'DRAFT',
            authorId: user.id,
          },
        });

        await tx.reportVersion.create({
          data: {
            reportId: rep.id,
            versionNumber: 1,
            evidenceExamined: evidenceExamined.trim(),
            examinationMethod: examinationMethod ? examinationMethod.trim() : 'Standard Laboratory Protocol',
            observations: observations ? observations.trim() : 'Preliminary observations recorded.',
            findings: findings.trim(),
            conclusion: conclusion.trim(),
            sha256Hash: reportHash,
            authorId: user.id,
            isFinalized: false,
          },
        });

        return rep;
      });

      await logAuditEvent({
        userId: user.id,
        userBadge: user.badgeId,
        userName: user.name,
        role: user.role,
        action: 'REPORT_CREATED',
        caseId,
        resourceType: 'FORENSIC_REPORT',
        resourceId: report.id,
        result: 'SUCCESS',
        severity: 'INFO',
        metadata: { version: 1, sha256: reportHash },
        ipAddress: req.ip,
      });

      res.status(201).json({ success: true, report });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to create forensic report.' });
    }
  }
);

// POST /api/reports/:id/finalize - Sign and finalize report version (locks V1/Vn permanently)
reportsRouter.post(
  '/:id/finalize',
  requireRoles(['FORENSIC_OFFICER', 'ADMINISTRATOR']),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { id } = req.params;

      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      });

      if (!report) {
        return res.status(404).json({ success: false, error: 'Report not found.' });
      }

      const latestVersion = report.versions[0];
      if (!latestVersion) {
        return res.status(400).json({ success: false, error: 'No report version exists to finalize.' });
      }

      if (latestVersion.isFinalized) {
        return res.status(409).json({
          success: false,
          error: `Version ${latestVersion.versionNumber} is already finalized and signed. Cannot re-finalize. To modify, submit a formal amendment.`,
        });
      }

      const now = new Date();
      // Generate simulated prototype digital signature hash
      const signaturePayload = `${latestVersion.sha256Hash}|${user.badgeId}|${user.name}|${now.toISOString()}`;
      const signatureHash = sha256(signaturePayload);

      await prisma.$transaction(async (tx) => {
        await tx.reportVersion.update({
          where: { id: latestVersion.id },
          data: {
            isFinalized: true,
            finalizedAt: now,
            signedByName: user.name,
            signedById: user.badgeId,
            signedByDesignation: user.designation,
            signatureTimestamp: now,
            signatureHash,
          },
        });

        await tx.report.update({
          where: { id: report.id },
          data: { status: 'FINALIZED' },
        });
      });

      await logAuditEvent({
        userId: user.id,
        userBadge: user.badgeId,
        userName: user.name,
        role: user.role,
        action: 'REPORT_SIGNED',
        caseId: report.caseId,
        resourceType: 'REPORT_VERSION',
        resourceId: latestVersion.id,
        reason: 'Forensic officer digital attestation and finalization',
        result: 'SUCCESS',
        severity: 'INFO',
        metadata: {
          reportId: report.id,
          version: latestVersion.versionNumber,
          signerBadge: user.badgeId,
          signatureHash,
          sha256: latestVersion.sha256Hash,
        },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: `Report ${report.id} Version ${latestVersion.versionNumber} successfully finalized and digitally signed.`,
        signature: {
          signedByName: user.name,
          signedById: user.badgeId,
          signedByDesignation: user.designation,
          signatureTimestamp: now,
          signatureHash,
          documentHash: latestVersion.sha256Hash,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to finalize report.' });
    }
  }
);

// POST /api/reports/:id/amend - Create a new report version (V2, V3...) preserving previous versions intact!
reportsRouter.post(
  '/:id/amend',
  requireRoles(['FORENSIC_OFFICER', 'ADMINISTRATOR']),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const {
        amendmentReason,
        amendmentDetails,
        evidenceExamined,
        examinationMethod,
        observations,
        findings,
        conclusion,
      } = req.body;

      // VALIDATE MANDATORY AMENDMENT REASON
      if (!amendmentReason || !VALID_AMENDMENT_REASONS.includes(amendmentReason)) {
        return res.status(400).json({
          success: false,
          error: `A mandatory amendment reason must be selected from approved forensic criteria: [${VALID_AMENDMENT_REASONS.join(', ')}].`,
        });
      }

      // If 'Other' is selected, a detailed explanation is strictly required
      if (amendmentReason === 'Other' && (!amendmentDetails || amendmentDetails.trim().length < 10)) {
        return res.status(400).json({
          success: false,
          error: "When selecting amendment reason 'Other', a detailed explanation (at least 10 characters) is mandatory.",
        });
      }

      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      });

      if (!report) {
        return res.status(404).json({ success: false, error: 'Report not found.' });
      }

      const previousVersion = report.versions[0];
      if (!previousVersion) {
        return res.status(400).json({ success: false, error: 'Cannot amend a report with no initial version.' });
      }

      const newVersionNumber = previousVersion.versionNumber + 1;

      // Prepare updated fields (fallback to previous values if not specified)
      const newEvidenceExamined = (evidenceExamined || previousVersion.evidenceExamined).trim();
      const newExaminationMethod = (examinationMethod || previousVersion.examinationMethod).trim();
      const newObservations = (observations || previousVersion.observations).trim();
      const newFindings = (findings || previousVersion.findings).trim();
      const newConclusion = (conclusion || previousVersion.conclusion).trim();

      // Compute new canonical SHA-256 hash
      const newReportHash = calculateReportHash({
        evidenceExamined: newEvidenceExamined,
        examinationMethod: newExaminationMethod,
        observations: newObservations,
        findings: newFindings,
        conclusion: newConclusion,
      });

      // Calculate diffs
      const changes: Array<{ field: string; oldVal: string; newVal: string }> = [];
      if (previousVersion.evidenceExamined !== newEvidenceExamined) {
        changes.push({ field: 'evidenceExamined', oldVal: previousVersion.evidenceExamined, newVal: newEvidenceExamined });
      }
      if (previousVersion.examinationMethod !== newExaminationMethod) {
        changes.push({ field: 'examinationMethod', oldVal: previousVersion.examinationMethod, newVal: newExaminationMethod });
      }
      if (previousVersion.observations !== newObservations) {
        changes.push({ field: 'observations', oldVal: previousVersion.observations, newVal: newObservations });
      }
      if (previousVersion.findings !== newFindings) {
        changes.push({ field: 'findings', oldVal: previousVersion.findings, newVal: newFindings });
      }
      if (previousVersion.conclusion !== newConclusion) {
        changes.push({ field: 'conclusion', oldVal: previousVersion.conclusion, newVal: newConclusion });
      }

      const now = new Date();
      // Prototype signature on the new amended version
      const sigPayload = `${newReportHash}|${user.badgeId}|${user.name}|${now.toISOString()}`;
      const newSignatureHash = sha256(sigPayload);

      const result = await prisma.$transaction(async (tx) => {
        // 1. Create new version V(n+1) - NOTE: previousVersion is NOT touched or overwritten!
        const createdVersion = await tx.reportVersion.create({
          data: {
            reportId: report.id,
            versionNumber: newVersionNumber,
            evidenceExamined: newEvidenceExamined,
            examinationMethod: newExaminationMethod,
            observations: newObservations,
            findings: newFindings,
            conclusion: newConclusion,
            sha256Hash: newReportHash,
            authorId: user.id,
            amendmentReason,
            amendmentDetails: amendmentDetails ? amendmentDetails.trim() : null,
            isFinalized: true,
            finalizedAt: now,
            signedByName: user.name,
            signedById: user.badgeId,
            signedByDesignation: user.designation,
            signatureTimestamp: now,
            signatureHash: newSignatureHash,
          },
        });

        // 2. Record field-level diff records
        for (const change of changes) {
          await tx.reportChange.create({
            data: {
              reportId: report.id,
              fromVersion: previousVersion.versionNumber,
              toVersion: newVersionNumber,
              fieldName: change.field,
              oldValue: change.oldVal,
              newValue: change.newVal,
              changedById: user.id,
              reason: amendmentReason + (amendmentDetails ? `: ${amendmentDetails}` : ''),
            },
          });
        }

        // 3. Update report currentVersion pointer and status
        await tx.report.update({
          where: { id: report.id },
          data: {
            currentVersion: newVersionNumber,
            status: 'AMENDED',
          },
        });

        return createdVersion;
      });

      // Anomaly detection hook: checks for rapid amendment frequency
      await anomalyEngine.recordReportAmendment(report.id, user.badgeId);

      // Tamper-evident audit logging
      await logAuditEvent({
        userId: user.id,
        userBadge: user.badgeId,
        userName: user.name,
        role: user.role,
        action: 'REPORT_AMENDED',
        caseId: report.caseId,
        resourceType: 'FORENSIC_REPORT',
        resourceId: report.id,
        reason: amendmentReason,
        result: 'SUCCESS',
        severity: 'INFO',
        metadata: {
          previousVersion: previousVersion.versionNumber,
          newVersion: newVersionNumber,
          amendmentReason,
          amendmentDetails,
          fieldsChanged: changes.map((c) => c.field),
          newSha256: newReportHash,
        },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: `New version V${newVersionNumber} created successfully. Prior version V${previousVersion.versionNumber} remains cryptographically preserved.`,
        version: result,
        changesCount: changes.length,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to create report amendment.' });
    }
  }
);

// GET /api/reports/:id/compare - Compare any two versions of a report
reportsRouter.get('/:id/compare', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fromVer = parseInt(req.query.from as string, 10);
    const toVer = parseInt(req.query.to as string, 10);

    if (isNaN(fromVer) || isNaN(toVer)) {
      return res.status(400).json({
        success: false,
        error: "Query parameters 'from' and 'to' must be valid version numbers (e.g. ?from=1&to=2).",
      });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        versions: {
          where: { versionNumber: { in: [fromVer, toVer] } },
          include: {
            author: {
              select: { id: true, badgeId: true, name: true, designation: true },
            },
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }

    const v1 = report.versions.find((v) => v.versionNumber === fromVer);
    const v2 = report.versions.find((v) => v.versionNumber === toVer);

    if (!v1 || !v2) {
      return res.status(404).json({
        success: false,
        error: `Could not find both versions (${fromVer} and ${toVer}) for comparison.`,
      });
    }

    const fieldsToCompare = [
      { key: 'evidenceExamined', label: 'Evidence Examined' },
      { key: 'examinationMethod', label: 'Examination Method' },
      { key: 'observations', label: 'Observations' },
      { key: 'findings', label: 'Findings' },
      { key: 'conclusion', label: 'Conclusion' },
      { key: 'sha256Hash', label: 'Cryptographic SHA-256' },
    ];

    const differences = fieldsToCompare.map((f) => {
      const oldVal = (v1 as any)[f.key];
      const newVal = (v2 as any)[f.key];
      const isDifferent = oldVal !== newVal;
      return {
        field: f.key,
        label: f.label,
        isDifferent,
        previousValue: oldVal,
        newValue: newVal,
      };
    });

    res.json({
      success: true,
      reportId: report.id,
      fromVersion: {
        versionNumber: v1.versionNumber,
        author: v1.author,
        createdAt: v1.createdAt,
        finalizedAt: v1.finalizedAt,
        sha256Hash: v1.sha256Hash,
        signature: v1.signatureHash,
        amendmentReason: v1.amendmentReason,
      },
      toVersion: {
        versionNumber: v2.versionNumber,
        author: v2.author,
        createdAt: v2.createdAt,
        finalizedAt: v2.finalizedAt,
        sha256Hash: v2.sha256Hash,
        signature: v2.signatureHash,
        amendmentReason: v2.amendmentReason,
        amendmentDetails: v2.amendmentDetails,
      },
      differences,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to perform version comparison.' });
  }
});

// POST /api/reports/:id/verify - Cryptographic SHA-256 verification of report content
reportsRouter.post('/:id/verify', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const versionNumber = req.body.versionNumber ? parseInt(req.body.versionNumber, 10) : undefined;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          ...(versionNumber ? { where: { versionNumber } } : { take: 1 }),
        },
      },
    });

    if (!report || report.versions.length === 0) {
      return res.status(404).json({ success: false, error: 'Report or target version not found.' });
    }

    const targetVersion = report.versions[0];

    // Recompute hash from the exact database fields
    const calculatedHash = calculateReportHash({
      evidenceExamined: targetVersion.evidenceExamined,
      examinationMethod: targetVersion.examinationMethod,
      observations: targetVersion.observations,
      findings: targetVersion.findings,
      conclusion: targetVersion.conclusion,
    });

    const isMatch = calculatedHash === targetVersion.sha256Hash;

    if (!isMatch) {
      await anomalyEngine.recordIntegrityMismatch(
        `REPORT-${report.id}-V${targetVersion.versionNumber}`,
        targetVersion.sha256Hash,
        calculatedHash,
        user.badgeId
      );
    }

    await logAuditEvent({
      userId: user.id,
      userBadge: user.badgeId,
      userName: user.name,
      role: user.role,
      action: 'INTEGRITY_CHECK',
      caseId: report.caseId,
      resourceType: 'FORENSIC_REPORT_VERSION',
      resourceId: targetVersion.id,
      result: isMatch ? 'SUCCESS' : 'WARNING',
      severity: isMatch ? 'INFO' : 'CRITICAL',
      metadata: {
        reportId: report.id,
        version: targetVersion.versionNumber,
        expectedHash: targetVersion.sha256Hash,
        calculatedHash,
        match: isMatch,
      },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      verified: isMatch,
      expectedHash: targetVersion.sha256Hash,
      calculatedHash,
      versionNumber: targetVersion.versionNumber,
      verifiedAt: new Date(),
      verifiedBy: `${user.name} [${user.badgeId}]`,
      signer: targetVersion.signedByName
        ? `${targetVersion.signedByName} (${targetVersion.signedById})`
        : 'Unsigned Draft',
      explanation:
        'Hashing is used for integrity verification, not encryption. SHA-256 confirms that the examined evidence, method, observations, findings, and conclusion match the exact signed state.',
      message: isMatch
        ? '✓ INTEGRITY VERIFIED: Report version content matches stored cryptographic hash.'
        : '⚠ INTEGRITY MISMATCH DETECTED: Report content differs from expected hash!',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Verification service error.' });
  }
});
