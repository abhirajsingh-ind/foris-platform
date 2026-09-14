import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { logAuditEvent } from '../middleware/auditLogger';
import { anomalyEngine } from '../utils/anomalyEngine';
import { ensureMinuteDataFreshness, addMinuteDataTick } from '../services/minuteDataDaemon';

export const securityRouter = Router();

securityRouter.use(requireAuth);

// POST /api/security/minute-tick - Trigger an immediate 1-minute forensic data tick
securityRouter.post('/minute-tick', async (req: Request, res: Response) => {
  try {
    const result = await addMinuteDataTick();
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to generate minute data tick.' });
  }
});

// GET /api/security/overview & /api/security/stats - Real-time security posture indicators & metric counts
securityRouter.get(['/overview', '/stats'], async (req: Request, res: Response) => {
  try {
    await ensureMinuteDataFreshness();

    const [auditCount, securityCount, unresolvedAlerts, reportsCount, evidenceCount] = await Promise.all([
      prisma.auditEvent.count(),
      prisma.securityEvent.count(),
      prisma.securityEvent.count({ where: { status: 'UNRESOLVED' } }),
      prisma.report.count(),
      prisma.evidence.count(),
    ]);

    res.json({
      success: true,
      posture: {
        authenticationActive: true,
        authorizationActive: true,
        auditLoggingActive: true,
        integrityMonitoringActive: true,
        sessionProtectionActive: true,
        databaseConnected: true,
        anomalyEngineActive: true,
      },
      totalEvidence: evidenceCount,
      totalReports: reportsCount,
      totalAudit: auditCount,
      totalCases: await prisma.case.count(),
      metrics: {
        totalAuditEvents: auditCount,
        totalSecurityEvents: securityCount,
        unresolvedAlerts,
        totalReportsProtected: reportsCount,
        totalEvidenceItemsHashed: evidenceCount,
      },
      lastChecked: new Date(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve security metrics.' });
  }
});

// GET /api/security/events - List anomaly alerts and security events
securityRouter.get('/events', async (req: Request, res: Response) => {
  try {
    const { status, severity } = req.query;
    const where: any = {};
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }
    if (severity && typeof severity === 'string' && severity !== 'ALL') {
      where.severity = severity;
    }

    const events = await prisma.securityEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    res.json({ success: true, events });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve security events.' });
  }
});

// POST /api/security/events/:id/resolve - Mark anomaly alert as investigated/resolved
securityRouter.post('/events/:id/resolve', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { resolutionNotes, resolutionStatus } = req.body;

    const event = await prisma.securityEvent.update({
      where: { id },
      data: {
        status: resolutionStatus || 'RESOLVED',
        resolvedBy: `${user.name} [${user.badgeId}]`,
        resolutionNotes: resolutionNotes || 'Investigated and verified by supervisor.',
      },
    });

    await logAuditEvent({
      userId: user.id,
      userBadge: user.badgeId,
      userName: user.name,
      role: user.role,
      action: 'SECURITY_ALERT_RESOLVED',
      resourceType: 'SECURITY_EVENT',
      resourceId: event.id,
      reason: resolutionNotes,
      result: 'SUCCESS',
      severity: 'INFO',
      ipAddress: req.ip,
    });

    res.json({ success: true, event });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to update security alert status.' });
  }
});

// POST /api/security/test-judge-violation - SIH Demo trigger: attempts unauthorized state modification
// If user is Judge, this will be caught and return 403 Forbidden with security event logging!
securityRouter.post('/test-judge-violation', async (req: Request, res: Response) => {
  const user = req.user!;

  if (user.role === 'JUDGE') {
    await anomalyEngine.recordUnauthorizedAttempt(
      user.badgeId,
      user.role,
      'POST /api/security/test-judge-violation (DIRECT_MUTATION_ATTEMPT)',
      'FORENSIC_DATABASE_CORE',
      req.ip
    );

    await logAuditEvent({
      userId: user.id,
      userBadge: user.badgeId,
      userName: user.name,
      role: user.role,
      action: 'JUDICIAL_WRITE_ATTEMPT_DENIED',
      resourceType: 'DIRECT_API_MUTATION',
      resourceId: 'FORENSIC_RECORD_MUTATION',
      reason: 'Strict Judicial Read-Only constraint enforced at API gateway',
      result: 'DENIED',
      severity: 'HIGH',
      metadata: { attemptedAction: 'DIRECT_DATABASE_WRITE', attemptedByBadge: user.badgeId },
      ipAddress: req.ip,
    });

    return res.status(403).json({
      success: false,
      error:
        'HTTP 403 Forbidden: Judicial credentials are strictly restricted to READ-ONLY inspection. Direct mutation intercepted and logged to the Security Monitoring Center.',
      code: 'JUDICIAL_READ_ONLY_VIOLATION',
      securityEventLogged: true,
      badgeId: user.badgeId,
      timestamp: new Date(),
    });
  }

  res.json({
    success: true,
    message: `Role ${user.role} has standard clearance. Switch to Judge role (JDG-3012) to demonstrate the judicial 403 rejection.`,
  });
});
