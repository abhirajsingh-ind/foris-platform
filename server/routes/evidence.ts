import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { logAuditEvent } from '../middleware/auditLogger';
import { sha256 } from '../utils/crypto';

export const evidenceRouter = Router();

evidenceRouter.use(requireAuth);

// GET /api/evidence - List evidence items
evidenceRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { caseId } = req.query;
    const where: any = {};
    if (caseId && typeof caseId === 'string') {
      where.caseId = caseId;
    }

    const items = await prisma.evidence.findMany({
      where,
      include: {
        case: {
          select: { id: true, firNumber: true, title: true, priority: true },
        },
        transfers: {
          orderBy: { transferredAt: 'desc' },
          take: 1,
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        _count: {
          select: { transfers: true, documents: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, evidence: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve evidence catalogue.' });
  }
});

// GET /api/evidence/:id - Get evidence details with full chain-of-custody timeline
evidenceRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const item = await prisma.evidence.findUnique({
      where: { id },
      include: {
        case: true,
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        transfers: {
          include: {
            responsibleOfficer: {
              select: { id: true, badgeId: true, name: true, designation: true },
            },
          },
          orderBy: { transferredAt: 'asc' },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ success: false, error: 'Evidence article not found.' });
    }

    await logAuditEvent({
      userId: user.id,
      userBadge: user.badgeId,
      userName: user.name,
      role: user.role,
      action: 'EVIDENCE_VIEWED',
      caseId: item.caseId,
      resourceType: 'EVIDENCE_ITEM',
      resourceId: item.id,
      result: 'SUCCESS',
      severity: 'INFO',
      metadata: { evidenceType: item.evidenceType },
      ipAddress: req.ip,
    });

    res.json({ success: true, evidence: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch evidence record.' });
  }
});

// POST /api/evidence - Register new evidence (Judge strictly blocked via requireRoles)
evidenceRouter.post(
  '/',
  requireRoles(['FORENSIC_OFFICER', 'POLICE_OFFICER', 'ADMINISTRATOR']),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const {
        id,
        caseId,
        evidenceType,
        description,
        collectionDate,
        collectorName,
        initialCondition,
        storageLocation,
      } = req.body;

      if (!id || !caseId || !evidenceType || !description) {
        return res.status(400).json({
          success: false,
          error: 'Evidence ID, Case ID, Evidence Type, and Description are required.',
        });
      }

      // Check case exists
      const forensicCase = await prisma.case.findUnique({ where: { id: caseId } });
      if (!forensicCase) {
        return res.status(404).json({ success: false, error: 'Referenced case does not exist.' });
      }

      // Check unique evidence ID
      const existing = await prisma.evidence.findUnique({ where: { id } });
      if (existing) {
        return res.status(409).json({ success: false, error: `Evidence ID '${id}' is already registered.` });
      }

      // Compute deterministic cryptographic SHA-256 seal for the evidence record
      const evidencePayload = `${id}|${caseId}|${evidenceType}|${description}|${collectorName || user.name}`;
      const sha256Hash = sha256(evidencePayload);

      const collector = collectorName || user.name;
      const initialCustodian = user.name;

      const newEvidence = await prisma.$transaction(async (tx) => {
        const ev = await tx.evidence.create({
          data: {
            id: id.trim().toUpperCase(),
            caseId,
            evidenceType: evidenceType.trim(),
            description: description.trim(),
            collectionDate: collectionDate ? new Date(collectionDate) : new Date(),
            collectorName: collector,
            initialCondition: initialCondition || 'Intact in tamper-evident forensic seal',
            currentCustodian: initialCustodian,
            currentStatus: 'COLLECTED',
            storageLocation: storageLocation || 'Forensic Intake Vault A-01',
            sha256Hash,
          },
        });

        // Initialize genesis chain-of-custody transfer entry
        await tx.evidenceTransfer.create({
          data: {
            evidenceId: ev.id,
            fromParty: `Crime Scene Recovery (${collector})`,
            toParty: `${initialCustodian} (${user.role})`,
            transferredAt: new Date(),
            purpose: 'Initial evidence collection and forensic intake logging',
            action: 'RECOVERY_AND_SEALING',
            status: 'ACKNOWLEDGED',
            notes: 'Forensic custody chain initiated under official seal.',
            responsibleOfficerId: user.id,
          },
        });

        return ev;
      });

      await logAuditEvent({
        userId: user.id,
        userBadge: user.badgeId,
        userName: user.name,
        role: user.role,
        action: 'EVIDENCE_REGISTERED',
        caseId: newEvidence.caseId,
        resourceType: 'EVIDENCE_ITEM',
        resourceId: newEvidence.id,
        result: 'SUCCESS',
        severity: 'INFO',
        metadata: { evidenceType: newEvidence.evidenceType, sha256: sha256Hash },
        ipAddress: req.ip,
      });

      res.status(201).json({ success: true, evidence: newEvidence });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to register evidence item.' });
    }
  }
);

// POST /api/evidence/:id/transfer - Record a chain-of-custody transfer (Judge strictly blocked)
evidenceRouter.post(
  '/:id/transfer',
  requireRoles(['FORENSIC_OFFICER', 'POLICE_OFFICER', 'ADMINISTRATOR']),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const { toParty, purpose, action, notes, newStatus, newLocation } = req.body;

      if (!toParty || !purpose || !action) {
        return res.status(400).json({
          success: false,
          error: 'Recipient (toParty), Purpose of transfer, and Action are mandatory for chain of custody.',
        });
      }

      const evidence = await prisma.evidence.findUnique({ where: { id } });
      if (!evidence) {
        return res.status(404).json({ success: false, error: 'Evidence article not found.' });
      }

      const previousCustodian = evidence.currentCustodian;

      const transfer = await prisma.$transaction(async (tx) => {
        const t = await tx.evidenceTransfer.create({
          data: {
            evidenceId: evidence.id,
            fromParty: previousCustodian,
            toParty: toParty.trim(),
            transferredAt: new Date(),
            purpose: purpose.trim(),
            action: action.trim(),
            status: 'ACKNOWLEDGED',
            notes: notes ? notes.trim() : null,
            responsibleOfficerId: user.id,
          },
        });

        await tx.evidence.update({
          where: { id: evidence.id },
          data: {
            currentCustodian: toParty.trim(),
            currentStatus: newStatus || evidence.currentStatus,
            storageLocation: newLocation || evidence.storageLocation,
          },
        });

        return t;
      });

      await logAuditEvent({
        userId: user.id,
        userBadge: user.badgeId,
        userName: user.name,
        role: user.role,
        action: 'EVIDENCE_TRANSFERRED',
        caseId: evidence.caseId,
        resourceType: 'CHAIN_OF_CUSTODY_TRANSFER',
        resourceId: transfer.id,
        reason: purpose,
        result: 'SUCCESS',
        severity: 'INFO',
        metadata: {
          evidenceId: evidence.id,
          from: previousCustodian,
          to: toParty,
          action,
        },
        ipAddress: req.ip,
      });

      res.status(201).json({ success: true, transfer });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to record chain of custody transfer.' });
    }
  }
);

// POST /api/evidence/:id/verify - Verify evidence cryptographic seal
evidenceRouter.post('/:id/verify', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const evidence = await prisma.evidence.findUnique({ where: { id } });
    if (!evidence) {
      return res.status(404).json({ success: false, error: 'Evidence item not found.' });
    }

    const payload = `${evidence.id}|${evidence.caseId}|${evidence.evidenceType}|${evidence.description}|${evidence.collectorName}`;
    const calculatedHash = sha256(payload);
    const matches = calculatedHash === evidence.sha256Hash;

    await logAuditEvent({
      userId: user.id,
      userBadge: user.badgeId,
      userName: user.name,
      role: user.role,
      action: 'INTEGRITY_CHECK',
      caseId: evidence.caseId,
      resourceType: 'EVIDENCE_SEAL',
      resourceId: evidence.id,
      result: matches ? 'SUCCESS' : 'WARNING',
      severity: matches ? 'INFO' : 'CRITICAL',
      metadata: { expectedHash: evidence.sha256Hash, calculatedHash, matches },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      verified: matches,
      expectedHash: evidence.sha256Hash,
      calculatedHash,
      verifiedAt: new Date(),
      verifiedBy: `${user.name} [${user.badgeId}]`,
      message: matches
        ? '✓ INTEGRITY VERIFIED: Evidence seal and metadata match cryptographic registration signature.'
        : '⚠ INTEGRITY MISMATCH DETECTED: Evidence record has been altered or tampered with!',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Evidence verification failed.' });
  }
});
