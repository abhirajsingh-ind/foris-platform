import { prisma } from '../db';

interface FailedLoginTracker {
  count: number;
  lastAttempt: number;
}

interface AmendmentTracker {
  timestamps: number[];
}

const failedLogins = new Map<string, FailedLoginTracker>();
const amendmentHistory = new Map<string, AmendmentTracker>();
const deniedAttempts = new Map<string, number>();

/**
 * Anomaly Engine: Evaluates operational security rules and flags anomalous activities.
 * NOTE: As documented, an anomaly alert indicates behavior requiring review, not guilt.
 */
export const anomalyEngine = {
  /**
   * Tracks failed login attempts and triggers an alert if threshold exceeded.
   */
  async recordFailedLogin(badgeId: string, ipAddress?: string) {
    const now = Date.now();
    const entry = failedLogins.get(badgeId) || { count: 0, lastAttempt: now };

    // Reset window after 15 minutes
    if (now - entry.lastAttempt > 15 * 60 * 1000) {
      entry.count = 0;
    }

    entry.count += 1;
    entry.lastAttempt = now;
    failedLogins.set(badgeId, entry);

    if (entry.count >= 3) {
      await prisma.securityEvent.create({
        data: {
          eventType: 'MULTIPLE_FAILED_LOGINS',
          severity: entry.count >= 5 ? 'HIGH' : 'MEDIUM',
          title: `Multiple Failed Login Attempts for Badge [${badgeId}]`,
          description: `User identifier ${badgeId} experienced ${entry.count} consecutive failed authentication attempts within 15 minutes from IP: ${ipAddress || 'unknown'}. Security alert triggered for defense-in-depth monitoring. Note: Does not imply malicious intent.`,
          userBadge: badgeId,
          ipAddress: ipAddress || '127.0.0.1',
          status: 'UNRESOLVED',
        },
      });
    }
  },

  /**
   * Resets failed login count on successful authentication.
   */
  clearFailedLogin(badgeId: string) {
    failedLogins.delete(badgeId);
  },

  /**
   * Evaluates report amendment frequency. Flags unusual bursts of revisions.
   */
  async recordReportAmendment(reportId: string, userBadge: string) {
    const now = Date.now();
    const history = amendmentHistory.get(reportId) || { timestamps: [] };

    // Filter to last 30 minutes
    history.timestamps = history.timestamps.filter((ts) => now - ts < 30 * 60 * 1000);
    history.timestamps.push(now);
    amendmentHistory.set(reportId, history);

    if (history.timestamps.length >= 2) {
      await prisma.securityEvent.create({
        data: {
          eventType: 'UNUSUAL_AMENDMENT_FREQUENCY',
          severity: 'MEDIUM',
          title: `Rapid Report Revision Frequency Detected on ${reportId}`,
          description: `Report ${reportId} has received ${history.timestamps.length} amendments in under 30 minutes by Officer [${userBadge}]. High revision density flagged for forensic supervisor audit. Note: Does not imply improper conduct.`,
          userBadge,
          status: 'UNRESOLVED',
        },
      });
    }
  },

  /**
   * Logs unauthorized attempt, specifically Judicial modification or cross-officer breach.
   */
  async recordUnauthorizedAttempt(userBadge: string, role: string, action: string, resource: string, ipAddress?: string) {
    const current = (deniedAttempts.get(userBadge) || 0) + 1;
    deniedAttempts.set(userBadge, current);

    const isJudicial = role === 'JUDGE';

    await prisma.securityEvent.create({
      data: {
        eventType: isJudicial ? 'JUDICIAL_WRITE_ATTEMPT_DENIED' : 'UNAUTHORIZED_ACCESS_DENIED',
        severity: isJudicial ? 'HIGH' : 'MEDIUM',
        title: isJudicial
          ? `Strict Judicial Read-Only Violation Attempt by [${userBadge}]`
          : `Unauthorized Action Denied for [${userBadge}]`,
        description: `Server-side ABAC/RBAC intercepted and rejected an unauthorized ${action} on resource '${resource}' requested by ${role} [${userBadge}]. HTTP 403 Forbidden returned. Defense-in-depth enforcement active.`,
        userBadge,
        ipAddress: ipAddress || '127.0.0.1',
        status: 'UNRESOLVED',
      },
    });
  },

  /**
   * Records cryptographic mismatch alert
   */
  async recordIntegrityMismatch(resourceId: string, expectedHash: string, calculatedHash: string, userBadge: string) {
    await prisma.securityEvent.create({
      data: {
        eventType: 'CRYPTOGRAPHIC_INTEGRITY_MISMATCH',
        severity: 'CRITICAL',
        title: `CRITICAL: Hash Verification Mismatch on Resource [${resourceId}]`,
        description: `Integrity check detected payload alteration! Expected SHA-256: ${expectedHash.slice(0, 16)}..., Calculated SHA-256: ${calculatedHash.slice(0, 16)}... Initiated by [${userBadge}]. Immediate chain review required.`,
        userBadge,
        status: 'UNRESOLVED',
      },
    });
  },
};
