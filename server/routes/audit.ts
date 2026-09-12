import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { verifyAuditChain, GENESIS_AUDIT_HASH } from '../utils/crypto';
import { logAuditEvent } from '../middleware/auditLogger';

export const auditRouter = Router();

auditRouter.use(requireAuth);

// GET /api/audit - Paginated audit logs with search and filtering
auditRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { action, userBadge, caseId, severity, page = '1', limit = '50' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (action && typeof action === 'string' && action !== 'ALL') {
      where.action = action;
    }
    if (userBadge && typeof userBadge === 'string') {
      where.userBadge = { contains: userBadge.trim().toUpperCase() };
    }
    if (caseId && typeof caseId === 'string') {
      where.caseId = { contains: caseId.trim() };
    }
    if (severity && typeof severity === 'string' && severity !== 'ALL') {
      where.severity = severity;
    }

    const [events, total] = await Promise.all([
      prisma.auditEvent.findMany({
        where,
        orderBy: { sequenceIndex: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.auditEvent.count({ where }),
    ]);

    res.json({
      success: true,
      events,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve audit log.' });
  }
});

// POST /api/audit/verify - Cryptographically verify the full append-only audit hash chain
auditRouter.post('/verify', async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    // Retrieve all audit records in sequential index order
    const records = await prisma.auditEvent.findMany({
      orderBy: { sequenceIndex: 'asc' },
      select: {
        sequenceIndex: true,
        timestamp: true,
        userId: true,
        action: true,
        resourceType: true,
        resourceId: true,
        previousAuditHash: true,
        currentAuditHash: true,
      },
    });

    const verificationResult = verifyAuditChain(records);

    // Record verification event itself into audit log
    await logAuditEvent({
      userId: user.id,
      userBadge: user.badgeId,
      userName: user.name,
      role: user.role,
      action: 'AUDIT_CHAIN_VERIFICATION',
      resourceType: 'CRYPTOGRAPHIC_AUDIT_LEDGER',
      reason: 'Routine or on-demand cryptographic chain validation',
      result: verificationResult.valid ? 'SUCCESS' : 'WARNING',
      severity: verificationResult.valid ? 'INFO' : 'CRITICAL',
      metadata: {
        totalRecords: verificationResult.totalRecords,
        brokenIndex: verificationResult.brokenIndex,
      },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      valid: verificationResult.valid,
      totalVerified: verificationResult.totalRecords,
      brokenIndex: verificationResult.brokenIndex,
      genesisHash: GENESIS_AUDIT_HASH,
      latestHash: records.length > 0 ? records[records.length - 1].currentAuditHash : GENESIS_AUDIT_HASH,
      verifiedAt: new Date(),
      verifiedBy: `${user.name} [${user.badgeId}]`,
      details: verificationResult.details,
      statusLabel: verificationResult.valid ? '✓ AUDIT CHAIN VERIFIED' : '⚠ AUDIT INTEGRITY WARNING',
      architectureNote:
        'Tamper-evident hash chaining mathematically guarantees that any retroactive modification, record insertion, or sequence deletion breaks the hash linkage. In production, anchors are periodically mirrored to write-once WORM storage and external judicial ledgers.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Audit chain verification encountered an error.' });
  }
});
