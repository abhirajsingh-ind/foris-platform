import { prisma } from '../server/db';
import { calculateAuditHash, verifyAuditChain, GENESIS_AUDIT_HASH } from '../server/utils/crypto';

async function main() {
  const records = await prisma.auditEvent.findMany({
    orderBy: { sequenceIndex: 'asc' },
  });

  console.log(`Fixing cryptographic audit chain for ${records.length} records...`);

  let prevHash = GENESIS_AUDIT_HASH;
  let updatedCount = 0;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const expectedSeq = i + 1;

    const newHash = calculateAuditHash({
      sequenceIndex: expectedSeq,
      timestamp: record.timestamp,
      userId: record.userId,
      action: record.action,
      resourceType: record.resourceType,
      resourceId: record.resourceId,
      previousAuditHash: prevHash,
    });

    if (
      record.sequenceIndex !== expectedSeq ||
      record.previousAuditHash !== prevHash ||
      record.currentAuditHash !== newHash
    ) {
      await prisma.auditEvent.update({
        where: { id: record.id },
        data: {
          sequenceIndex: expectedSeq,
          previousAuditHash: prevHash,
          currentAuditHash: newHash,
        },
      });
      updatedCount++;
    }

    prevHash = newHash;
  }

  console.log(`Updated ${updatedCount} records in audit chain.`);

  // Verify immediately
  const freshRecords = await prisma.auditEvent.findMany({
    orderBy: { sequenceIndex: 'asc' },
  });

  const check = verifyAuditChain(freshRecords);
  console.log('Post-fix verification result:', check);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
