import crypto from 'crypto';

export const GENESIS_AUDIT_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Computes standard SHA-256 hash in hexadecimal.
 */
export function sha256(data: string | Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Calculates a canonical, deterministic SHA-256 hash for forensic report contents.
 * Key ordering is strictly normalized to guarantee identical cryptographic output.
 */
export function calculateReportHash(fields: {
  evidenceExamined: string;
  examinationMethod: string;
  observations: string;
  findings: string;
  conclusion: string;
}): string {
  const normalized = {
    conclusion: fields.conclusion.trim(),
    evidenceExamined: fields.evidenceExamined.trim(),
    examinationMethod: fields.examinationMethod.trim(),
    findings: fields.findings.trim(),
    observations: fields.observations.trim(),
  };
  const canonicalString = JSON.stringify(normalized);
  return sha256(canonicalString);
}

/**
 * Computes the tamper-evident hash for an audit log entry.
 * Current Hash = SHA-256(sequenceIndex | timestamp | userId | action | resourceType | resourceId | previousAuditHash)
 */
export function calculateAuditHash(data: {
  sequenceIndex: number;
  timestamp: string | Date;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  previousAuditHash: string;
}): string {
  const timeStr = data.timestamp instanceof Date ? data.timestamp.toISOString() : new Date(data.timestamp).toISOString();
  const rawPayload = [
    data.sequenceIndex,
    timeStr,
    data.userId,
    data.action,
    data.resourceType,
    data.resourceId || '',
    data.previousAuditHash,
  ].join('|');

  return sha256(rawPayload);
}

export interface AuditRecordForVerification {
  sequenceIndex: number;
  timestamp: Date | string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  previousAuditHash: string;
  currentAuditHash: string;
}

/**
 * Sequentially verifies an entire chain of audit records from genesis to the latest.
 * Detects modified, inserted, or deleted audit records.
 */
export function verifyAuditChain(records: AuditRecordForVerification[]): {
  valid: boolean;
  totalRecords: number;
  brokenIndex?: number;
  details: string;
} {
  if (records.length === 0) {
    return { valid: true, totalRecords: 0, details: 'Audit trail is empty. Genesis state intact.' };
  }

  // Ensure records are ordered by sequenceIndex
  const sorted = [...records].sort((a, b) => a.sequenceIndex - b.sequenceIndex);

  let expectedPrevHash = GENESIS_AUDIT_HASH;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];

    // Check 1: Sequence index must be strictly consecutive 1, 2, 3...
    if (current.sequenceIndex !== i + 1) {
      return {
        valid: false,
        totalRecords: sorted.length,
        brokenIndex: current.sequenceIndex,
        details: `Audit sequence continuity violation: expected sequence ${i + 1} but found ${current.sequenceIndex}. Possible record deletion or insertion.`,
      };
    }

    // Check 2: Previous hash link must match the expected previous hash
    if (current.previousAuditHash !== expectedPrevHash) {
      return {
        valid: false,
        totalRecords: sorted.length,
        brokenIndex: current.sequenceIndex,
        details: `Audit chain link broken at sequence ${current.sequenceIndex}. Previous hash mismatch: expected '${expectedPrevHash.slice(0, 16)}...', got '${current.previousAuditHash.slice(0, 16)}...'.`,
      };
    }

    // Check 3: Current hash must match the calculated hash of the record's payload
    const recalculatedHash = calculateAuditHash({
      sequenceIndex: current.sequenceIndex,
      timestamp: current.timestamp,
      userId: current.userId,
      action: current.action,
      resourceType: current.resourceType,
      resourceId: current.resourceId,
      previousAuditHash: current.previousAuditHash,
    });

    if (current.currentAuditHash !== recalculatedHash) {
      return {
        valid: false,
        totalRecords: sorted.length,
        brokenIndex: current.sequenceIndex,
        details: `Cryptographic integrity mismatch at sequence ${current.sequenceIndex}. Record contents have been altered after recording. Expected '${recalculatedHash.slice(0, 16)}...', stored '${current.currentAuditHash.slice(0, 16)}...'.`,
      };
    }

    expectedPrevHash = current.currentAuditHash;
  }

  return {
    valid: true,
    totalRecords: sorted.length,
    details: `All ${sorted.length} audit trail blocks verified successfully against genesis anchor. Zero tampering detected.`,
  };
}
