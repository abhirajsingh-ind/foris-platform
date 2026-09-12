import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { logAuditEvent } from '../middleware/auditLogger';

export const searchRouter = Router();
searchRouter.use(requireAuth);

// GET /api/search?q=...
searchRouter.get('/', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const q = ((req.query.q as string) || '').trim();

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        query: q,
        results: {
          cases: [],
          evidence: [],
          reports: [],
        },
      });
    }

    // Role-aware case search
    const caseWhere: any = {
      OR: [
        { id: { contains: q } },
        { firNumber: { contains: q } },
        { title: { contains: q } },
        { category: { contains: q } },
        { description: { contains: q } },
      ],
    };

    if (user.role === 'FORENSIC_OFFICER') {
      caseWhere.OR = [
        ...(caseWhere.OR || []),
        { assignedOfficerId: user.id },
      ];
    }

    const [cases, evidence, reports] = await Promise.all([
      prisma.case.findMany({
        where: caseWhere,
        take: 6,
        select: {
          id: true,
          firNumber: true,
          title: true,
          category: true,
          status: true,
          priority: true,
        },
      }),
      prisma.evidence.findMany({
        where: {
          OR: [
            { id: { contains: q } },
            { caseId: { contains: q } },
            { evidenceType: { contains: q } },
            { description: { contains: q } },
            { sha256Hash: { contains: q } },
          ],
        },
        take: 6,
        select: {
          id: true,
          caseId: true,
          evidenceType: true,
          description: true,
          currentCustodian: true,
          currentStatus: true,
          sha256Hash: true,
        },
      }),
      prisma.report.findMany({
        where: {
          OR: [
            { id: { contains: q } },
            { caseId: { contains: q } },
            { title: { contains: q } },
            { author: { name: { contains: q } } },
            { author: { badgeId: { contains: q } } },
          ],
        },
        take: 6,
        include: {
          author: {
            select: { name: true, badgeId: true },
          },
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
            select: { versionNumber: true, sha256Hash: true, isFinalized: true },
          },
        },
      }),
    ]);

    await logAuditEvent({
      userId: user.id,
      userBadge: user.badgeId,
      userName: user.name,
      role: user.role,
      action: 'GLOBAL_SEARCH_EXECUTED',
      resourceType: 'SEARCH',
      reason: `Search query: "${q}"`,
      result: 'SUCCESS',
      severity: 'INFO',
      metadata: {
        query: q,
        casesFound: cases.length,
        evidenceFound: evidence.length,
        reportsFound: reports.length,
      },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      query: q,
      results: {
        cases,
        evidence,
        reports,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Search operation failed.' });
  }
});
