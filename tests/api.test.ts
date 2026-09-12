process.env.NODE_ENV = 'test';
import assert from 'assert';
import app from '../server/index';
import { prisma } from '../server/db';
import http from 'http';

let server: http.Server;
let baseUrl: string;

// Helper to make fetch requests
async function api(path: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('=== RUNNING FORIS AUTOMATED API TEST SUITE ===\n');

  // Start test server on random port
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address() as any;
      baseUrl = `http://localhost:${addr.port}`;
      console.log(`[TEST SERVER] Running on ${baseUrl}`);
      resolve();
    });
  });

  // Ensure test report is at pristine V1 state
  try {
    await prisma.reportChange.deleteMany({ where: { reportId: 'REP-2026-00125' } });
    await prisma.reportVersion.deleteMany({ where: { reportId: 'REP-2026-00125', versionNumber: { gt: 1 } } });
    await prisma.report.updateMany({ where: { id: 'REP-2026-00125' }, data: { currentVersion: 1, status: 'FINALIZED' } });
  } catch (e) {}

  try {
    // 1. AUTHENTICATION TESTS
    console.log('TEST 1: Authentication Gateway...');
    const badLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ badgeId: 'FEX-1024', password: 'WrongPassword!' }),
    });
    assert.strictEqual(badLogin.status, 401, 'Invalid password must return 401');
    assert.strictEqual(badLogin.data.success, false);
    console.log('  ✓ Invalid login properly rejected with 401 and security notice');

    const fexLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ badgeId: 'FEX-1024', password: '{123FORIS@' }),
    });
    assert.strictEqual(fexLogin.status, 200, 'Valid login must return 200');
    assert.ok(fexLogin.data.token, 'Token must be issued');
    const fexToken = fexLogin.data.token;
    console.log('  ✓ Forensic Officer FEX-1024 authenticated successfully');

    const judgeLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ badgeId: 'JDG-3012', password: '{123FORIS@' }),
    });
    assert.strictEqual(judgeLogin.status, 200);
    const judgeToken = judgeLogin.data.token;
    console.log('  ✓ Judge JDG-3012 authenticated successfully');

    // 2. JUDICIAL READ-ONLY RESTRICTION (RBAC/ABAC)
    console.log('\nTEST 2: Strict Judicial Read-Only Enforcement...');
    // Judge CAN read cases
    const judgeCaseRead = await api('/api/cases', { method: 'GET' }, judgeToken);
    assert.strictEqual(judgeCaseRead.status, 200, 'Judge can view authorized cases');
    console.log('  ✓ Judge permitted to read cases (HTTP 200)');

    // Judge CANNOT create a case
    const judgeCaseCreate = await api(
      '/api/cases',
      {
        method: 'POST',
        body: JSON.stringify({
          id: 'TEST-CASE-999',
          firNumber: 'FIR-999/2026',
          title: 'Judge Attempted Case',
          category: 'Test',
        }),
      },
      judgeToken
    );
    assert.strictEqual(judgeCaseCreate.status, 403, 'Judge write must return 403 Forbidden');
    assert.strictEqual(judgeCaseCreate.data.code, 'JUDICIAL_READ_ONLY_VIOLATION');
    console.log('  ✓ Judge case creation strictly blocked with 403 Forbidden');

    // Judge CANNOT create/amend report
    const judgeReportAmend = await api(
      '/api/reports/REP-2026-00125/amend',
      {
        method: 'POST',
        body: JSON.stringify({
          amendmentReason: 'Court instruction',
          findings: 'Judge modified findings',
        }),
      },
      judgeToken
    );
    assert.strictEqual(judgeReportAmend.status, 403, 'Judge report modification must return 403 Forbidden');
    console.log('  ✓ Judge report modification strictly blocked with 403 Forbidden');

    // 3. REPORT VERSIONING & IMMUTABILITY (CORE USP)
    console.log('\nTEST 3: Report Version Control & Preservation...');
    // Fetch current report
    const reportGet = await api('/api/reports/REP-2026-00125', { method: 'GET' }, fexToken);
    assert.strictEqual(reportGet.status, 200);
    const initialReport = reportGet.data.report;
    assert.strictEqual(initialReport.currentVersion, 1);
    const v1 = initialReport.versions.find((v: any) => v.versionNumber === 1);
    assert.ok(v1, 'Version 1 must exist');
    assert.strictEqual(v1.isFinalized, true);
    const v1HashBefore = v1.sha256Hash;
    console.log(`  ✓ Version 1 verified: Finalized with SHA-256 [${v1HashBefore.slice(0, 16)}...]`);

    // Attempt amendment without mandatory reason (MUST FAIL)
    const badAmend = await api(
      '/api/reports/REP-2026-00125/amend',
      {
        method: 'POST',
        body: JSON.stringify({
          findings: 'Attempt without reason',
        }),
      },
      fexToken
    );
    assert.strictEqual(badAmend.status, 400, 'Amendment without reason must be rejected with 400');
    console.log('  ✓ Amendment without mandatory reason rejected with 400');

    // Perform legitimate amendment with reason "Additional evidence"
    console.log('  -> Applying legitimate amendment: Additional Evidence...');
    const validAmend = await api(
      '/api/reports/REP-2026-00125/amend',
      {
        method: 'POST',
        body: JSON.stringify({
          amendmentReason: 'Additional evidence',
          amendmentDetails: 'Secondary analysis of decrypted volume partition recovered 3 additional SSH private keys.',
          findings:
            'Forensic data carving recovered 14 compressed .tar.gz archives containing active session cookies, SQL database dump fragments, and an executable script identified as a Cobalt Strike beacon payload. UPDATED: Further parsing revealed 3 unencrypted OpenSSH private keys (id_rsa_root).',
          conclusion:
            'The examined media confirms insider credential exfiltration and unauthorized command execution, with confirmed root access capabilities via recovered SSH certificates.',
        }),
      },
      fexToken
    );
    assert.strictEqual(validAmend.status, 201, 'Amendment must succeed and create V2');
    assert.strictEqual(validAmend.data.version.versionNumber, 2);
    console.log('  ✓ Version 2 successfully created with new cryptographic hash');

    // Verify Version 1 is 100% preserved
    const reportAfter = await api('/api/reports/REP-2026-00125', { method: 'GET' }, fexToken);
    const versions = reportAfter.data.report.versions;
    assert.strictEqual(versions.length, 2, 'Both V1 and V2 must exist simultaneously');
    const v1After = versions.find((v: any) => v.versionNumber === 1);
    assert.strictEqual(v1After.sha256Hash, v1HashBefore, 'Version 1 hash must be identical (NOT OVERWRITTEN)');
    console.log('  ✓ Version 1 verified 100% preserved and untouched in database');

    // 4. VERSION COMPARISON
    console.log('\nTEST 4: Version Comparison Diff Engine...');
    const compareRes = await api('/api/reports/REP-2026-00125/compare?from=1&to=2', { method: 'GET' }, judgeToken);
    assert.strictEqual(compareRes.status, 200);
    const diffs = compareRes.data.differences;
    const findingsDiff = diffs.find((d: any) => d.field === 'findings');
    assert.ok(findingsDiff && findingsDiff.isDifferent, 'Findings diff must be detected');
    console.log(`  ✓ Version comparison successful: detected changes in [${diffs.filter((d: any) => d.isDifferent).map((d: any) => d.label).join(', ')}]`);

    // 5. CRYPTOGRAPHIC SHA-256 INTEGRITY VERIFICATION
    console.log('\nTEST 5: SHA-256 Integrity Verification...');
    const verifyV1 = await api('/api/reports/REP-2026-00125/verify', {
      method: 'POST',
      body: JSON.stringify({ versionNumber: 1 }),
    }, judgeToken);
    assert.strictEqual(verifyV1.status, 200);
    assert.strictEqual(verifyV1.data.verified, true, 'V1 content hash must match');
    console.log('  ✓ Version 1 verified: ✓ INTEGRITY VERIFIED');

    const verifyV2 = await api('/api/reports/REP-2026-00125/verify', {
      method: 'POST',
      body: JSON.stringify({ versionNumber: 2 }),
    }, judgeToken);
    assert.strictEqual(verifyV2.status, 200);
    assert.strictEqual(verifyV2.data.verified, true, 'V2 content hash must match');
    console.log('  ✓ Version 2 verified: ✓ INTEGRITY VERIFIED');

    // 6. TAMPER-EVIDENT AUDIT HASH CHAIN VERIFICATION
    console.log('\nTEST 6: Tamper-Evident Audit Hash Chain Verification...');
    const auditVerify = await api('/api/audit/verify', { method: 'POST' }, judgeToken);
    assert.strictEqual(auditVerify.status, 200);
    assert.strictEqual(auditVerify.data.valid, true, 'Audit chain must be unbroken');
    console.log(`  ✓ Audit Chain: ${auditVerify.data.statusLabel} (${auditVerify.data.totalVerified} chained blocks)`);

    // 7. SECURITY MONITORING & ANOMALY ENGINE
    console.log('\nTEST 7: Security Center & Anomaly Monitoring...');
    const secOverview = await api('/api/security/overview', { method: 'GET' }, fexToken);
    assert.strictEqual(secOverview.status, 200);
    assert.strictEqual(secOverview.data.posture.authorizationActive, true);
    assert.strictEqual(secOverview.data.posture.auditLoggingActive, true);
    console.log('  ✓ Security posture indicators active and validated');

    console.log('\n=== ALL AUTOMATED API TESTS PASSED PERFECTLY ===\n');
  } catch (err: any) {
    console.error('TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    server.close();
    process.exit(process.exitCode || 0);
  }
}

runTests();
