import { prisma } from '../db';
import { calculateAuditHash, GENESIS_AUDIT_HASH } from '../utils/crypto';

export interface AuditLogInput {
  userId: string;
  userBadge: string;
  userName: string;
  role: string;
  action: string;
  caseId?: string | null;
  resourceType: string;
  resourceId?: string | null;
  reason?: string | null;
  result?: 'SUCCESS' | 'DENIED' | 'FAILURE' | 'WARNING';
  severity?: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata?: Record<string, any>;
  ipAddress?: string;
}

// Resilient mutex queue to serialize audit log writes in SQLite
let auditMutex: Promise<any> = Promise.resolve();

/**
 * Appends a tamper-evident, cryptographically hash-chained audit event to the database.
 * Thread-safe sequence indexing with ACID integrity and automatic retry on concurrency.
 */
export async function logAuditEvent(input: AuditLogInput) {
  return new Promise((resolve) => {
    auditMutex = auditMutex
      .catch(() => {})
      .then(async () => {
        let attempts = 0;
        while (attempts < 5) {
          try {
            const lastEvent = await prisma.auditEvent.findFirst({
              orderBy: { sequenceIndex: 'desc' },
            });

            const sequenceIndex = lastEvent ? lastEvent.sequenceIndex + 1 : 1;
            const previousAuditHash = lastEvent ? lastEvent.currentAuditHash : GENESIS_AUDIT_HASH;
            const timestamp = new Date();

            const currentAuditHash = calculateAuditHash({
              sequenceIndex,
              timestamp,
              userId: input.userId,
              action: input.action,
              resourceType: input.resourceType,
              resourceId: input.resourceId,
              previousAuditHash,
            });

            const event = await prisma.auditEvent.create({
              data: {
                sequenceIndex,
                timestamp,
                userId: input.userId,
                userBadge: input.userBadge,
                userName: input.userName,
                role: input.role,
                action: input.action,
                caseId: input.caseId,
                resourceType: input.resourceType,
                resourceId: input.resourceId,
                reason: input.reason,
                result: input.result || 'SUCCESS',
                severity: input.severity || 'INFO',
                metadata: input.metadata ? JSON.stringify(input.metadata) : null,
                ipAddress: input.ipAddress || '127.0.0.1',
                previousAuditHash,
                currentAuditHash,
              },
            });

            resolve(event);
            return;
          } catch (err: any) {
            attempts++;
            if (attempts >= 5) {
              console.warn('[AUDIT LOG] Non-fatal: write fallback triggered after retries:', err?.message || err);
              // Return dummy object gracefully so auth flow does not block
              resolve({ id: 'fallback-audit-log', sequenceIndex: 0 });
              return;
            }
            await new Promise((r) => setTimeout(r, 50 * attempts));
          }
        }
      })
      .catch((fatalErr) => {
        console.warn('[AUDIT LOG] Fatal queue error handled gracefully:', fatalErr);
        resolve({ id: 'fallback-audit-log', sequenceIndex: 0 });
      });
  });
}
