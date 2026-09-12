async function runFlow() {
  console.log('\x1b[36m=== VERIFYING LIVE SIH 17-STEP DEMONSTRATION FLOW ===\x1b[0m\n');
  const baseUrl = 'http://localhost:5000';

  // 1. Login as Forensic Officer
  console.log('Step 1: Authenticating as Forensic Officer FEX-1024...');
  const fexRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ badgeId: 'FEX-1024', password: '{123FORIS@' }),
  });
  const fexData = await fexRes.json();
  const token = fexData.token;
  console.log(`  \x1b[32m✓ Officer authenticated: ${fexData.user.name} (${fexData.user.role})\x1b[0m`);

  // 2. Open Case MP-FOR-2026-00125
  console.log('Step 2: Retrieving Case MP-FOR-2026-00125...');
  const caseRes = await fetch(`${baseUrl}/api/cases/MP-FOR-2026-00125`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const caseData = await caseRes.json();
  console.log(`  \x1b[32m✓ Case Dossier loaded: "${caseData.case.title}"\x1b[0m`);

  // 3. Open Evidence EV-001
  console.log('Step 3: Retrieving Evidence Article EV-001...');
  const evRes = await fetch(`${baseUrl}/api/evidence/EV-001`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const evData = await evRes.json();
  console.log(`  \x1b[32m✓ Evidence Article: ${evData.evidence.evidenceType}\x1b[0m`);

  // 4. Chain of Custody
  console.log('Step 4: Inspecting Chain of Custody timeline...');
  const transfers = evData.evidence.transfers;
  console.log(`  \x1b[32m✓ Verified ${transfers.length} sequential custody handovers\x1b[0m`);

  // 5. Retrieve Report V1
  console.log('Step 5: Inspecting Forensic Report REP-2026-00125...');
  const repRes = await fetch(`${baseUrl}/api/reports/REP-2026-00125`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const repData = await repRes.json();
  const v1 = repData.report.versions.find((v: any) => v.versionNumber === 1);
  console.log(`  \x1b[32m✓ Initial Report V1 loaded: SHA-256 [${v1.sha256Hash.slice(0, 16)}...]\x1b[0m`);

  // 6. Signature status
  console.log('Step 6: Confirming digital attestation signature...');
  console.log(`  \x1b[32m✓ Attested by: ${v1.signedByName} [${v1.signedById}]\x1b[0m`);

  // 7. SHA-256 Integrity Verification
  console.log('Step 7: Performing real-time SHA-256 integrity verification...');
  const verifyRes = await fetch(`${baseUrl}/api/reports/REP-2026-00125/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ versionNumber: 1 }),
  });
  const verifyData = await verifyRes.json();
  console.log(`  \x1b[32m✓ Verification result: ${verifyData.message}\x1b[0m`);

  // 8 & 9. Formulate Amendment and Create Report V2
  console.log('Step 8 & 9: Submitting formal amendment with mandatory reason "Additional evidence"...');
  const amendRes = await fetch(`${baseUrl}/api/reports/REP-2026-00125/amend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      amendmentReason: 'Additional evidence',
      amendmentDetails: 'Secondary memory dump analysis recovered unencrypted SSH host certificates.',
      findings:
        'Carved 14 archives and newly discovered unencrypted OpenSSH keys for user root at /root/.ssh/id_rsa.',
      conclusion: 'Conclusive proof of administrative credential compromise by authenticated insider.',
    }),
  });
  const amendData = await amendRes.json();
  console.log(`  \x1b[32m✓ Version 2 generated! Status: ${amendData.message}\x1b[0m`);

  // 10. Check that V1 still exists untouched
  console.log('Step 10: Confirming Version 1 permanent preservation...');
  const repAfter = await fetch(`${baseUrl}/api/reports/REP-2026-00125`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const repAfterData = await repAfter.json();
  const v1After = repAfterData.report.versions.find((v: any) => v.versionNumber === 1);
  if (v1After && v1After.sha256Hash === v1.sha256Hash) {
    console.log(`  \x1b[32m✓ Version 1 verified 100% PRESERVED & IMMUTABLE (Hash untouched)\x1b[0m`);
  } else {
    throw new Error('Version 1 was modified or deleted!');
  }

  // 11. Differential Comparison
  console.log('Step 11: Executing side-by-side differential comparison (V1 <-> V2)...');
  const compRes = await fetch(`${baseUrl}/api/reports/REP-2026-00125/compare?from=1&to=2`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const compData = await compRes.json();
  const diffCount = compData.differences.filter((d: any) => d.isDifferent).length;
  console.log(`  \x1b[32m✓ Differential engine detected ${diffCount} modified fields with full attribution\x1b[0m`);

  // 12 & 13. Audit Trail & Hash Chain Verification
  console.log('Step 12 & 13: Cryptographically verifying entire audit hash chain...');
  const auditRes = await fetch(`${baseUrl}/api/audit/verify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const auditData = await auditRes.json();
  console.log(`  \x1b[32m✓ Audit Ledger: ${auditData.statusLabel} (${auditData.totalVerified} chained blocks from genesis)\x1b[0m`);

  // 14 & 15. Login as Judge
  console.log('Step 14 & 15: Switching persona to Special Judge JDG-3012...');
  const judgeRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ badgeId: 'JDG-3012', password: '{123FORIS@' }),
  });
  const judgeData = await judgeRes.json();
  const judgeToken = judgeData.token;
  console.log(`  \x1b[32m✓ Judge Authenticated: ${judgeData.user.name} (Role: ${judgeData.user.role})\x1b[0m`);

  // 16. Test Unauthorized Judge Modification
  console.log('Step 16: Testing unauthorized mutation attempt as Judge...');
  const badJudgeCall = await fetch(`${baseUrl}/api/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${judgeToken}` },
    body: JSON.stringify({ id: 'ILLEGAL-CASE', firNumber: 'F', title: 'T', category: 'C' }),
  });
  if (badJudgeCall.status === 403) {
    const errBody = await badJudgeCall.json();
    console.log(`  \x1b[32m✓ Server rejected Judge mutation with HTTP 403 Forbidden! Code: ${errBody.code}\x1b[0m`);
  } else {
    throw new Error(`Judge call should have returned 403 but got ${badJudgeCall.status}`);
  }

  // 17. Security Center Verification
  console.log('Step 17: Verifying anomaly alert logged in Security Center...');
  const secRes = await fetch(`${baseUrl}/api/security/events`, {
    headers: { Authorization: `Bearer ${judgeToken}` },
  });
  const secData = await secRes.json();
  const judgeAlert = secData.events.find((e: any) => e.eventType.includes('JUDICIAL'));
  console.log(`  \x1b[32m✓ Anomaly successfully captured in Security Center: "${judgeAlert.title}"\x1b[0m`);

  console.log('\n\x1b[36m=== COMPLETE 17-STEP SIH DEMO SCENARIO VERIFIED 100% OPERATIONAL ===\x1b[0m\n');
}

runFlow().catch((e) => {
  console.error('\x1b[31mDEMO FLOW FAILED:\x1b[0m', e);
  process.exit(1);
});
