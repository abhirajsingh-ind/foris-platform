import { Request, Response, NextFunction } from 'express';
import { anomalyEngine } from '../utils/anomalyEngine';
import { logAuditEvent } from './auditLogger';

/**
 * Enforces role-based permissions on an endpoint.
 * Explicitly rejects and logs any write action attempted by a Judge.
 */
export function requireRoles(allowedRoles: Array<'FORENSIC_OFFICER' | 'POLICE_OFFICER' | 'JUDGE' | 'ADMINISTRATOR'>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required prior to authorization evaluation.',
        code: 'UNAUTHENTICATED',
      });
    }

    // STRICT JUDICIAL READ-ONLY RULE:
    // If user is a Judge and HTTP method is anything modifying state (POST, PUT, PATCH, DELETE)
    if (user.role === 'JUDGE' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      // Record in anomaly engine and audit log
      await anomalyEngine.recordUnauthorizedAttempt(
        user.badgeId,
        user.role,
        `${req.method} ${req.originalUrl}`,
        req.originalUrl,
        req.ip
      );

      await logAuditEvent({
        userId: user.id,
        userBadge: user.badgeId,
        userName: user.name,
        role: user.role,
        action: 'JUDICIAL_WRITE_ATTEMPT_DENIED',
        resourceType: 'API_ENDPOINT',
        resourceId: req.originalUrl,
        reason: 'Violation of strict constitutional judicial read-only access policy',
        result: 'DENIED',
        severity: 'HIGH',
        metadata: { method: req.method, path: req.originalUrl, bodySnippet: req.body },
        ipAddress: req.ip,
      });

      return res.status(403).json({
        success: false,
        error: 'Access Denied: Judicial credentials grant strictly READ-ONLY authority. All modification, drafting, or signing actions are prohibited by constitutional defense-in-depth policy.',
        code: 'JUDICIAL_READ_ONLY_VIOLATION',
        userRole: user.role,
      });
    }

    if (!allowedRoles.includes(user.role)) {
      await anomalyEngine.recordUnauthorizedAttempt(
        user.badgeId,
        user.role,
        `${req.method} ${req.originalUrl}`,
        req.originalUrl,
        req.ip
      );

      await logAuditEvent({
        userId: user.id,
        userBadge: user.badgeId,
        userName: user.name,
        role: user.role,
        action: 'PERMISSION_DENIED',
        resourceType: 'API_ENDPOINT',
        resourceId: req.originalUrl,
        reason: `Role '${user.role}' not permitted. Required one of: [${allowedRoles.join(', ')}]`,
        result: 'DENIED',
        severity: 'MEDIUM',
        metadata: { method: req.method, path: req.originalUrl },
        ipAddress: req.ip,
      });

      return res.status(403).json({
        success: false,
        error: `Access Denied: Your assigned role (${user.role}) lacks sufficient clearance for this operation.`,
        code: 'INSUFFICIENT_PRIVILEGES',
      });
    }

    next();
  };
}
