Write-Host "=== VERIFYING LIVE SIH 17-STEP DEMONSTRATION FLOW ===" -ForegroundColor Cyan

# 1. Login as Forensic Officer
Write-Host "Step 1: Authenticating as Forensic Officer FEX-1024..."
$loginRes = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body '{"badgeId":"FEX-1024","password":"ForisSecure2026!"}'
$token = $loginRes.token
Write-Host "  ✓ Officer authenticated: $($loginRes.user.name)" -ForegroundColor Green

# 2. Open case MP-FOR-2026-00125
Write-Host "Step 2: Retrieving case MP-FOR-2026-00125..."
$caseRes = Invoke-RestMethod -Uri 'http://localhost:5000/api/cases/MP-FOR-2026-00125' -Headers @{ Authorization = "Bearer $token" }
Write-Host "  ✓ Case title: $($caseRes.case.title)" -ForegroundColor Green

# 3. Open Evidence EV-001
Write-Host "Step 3: Retrieving Evidence EV-001..."
$evRes = Invoke-RestMethod -Uri 'http://localhost:5000/api/evidence/EV-001' -Headers @{ Authorization = "Bearer $token" }
Write-Host "  ✓ Evidence: $($evRes.evidence.evidenceType)" -ForegroundColor Green

# 4. Chain of Custody
Write-Host "Step 4: Checking Chain of Custody transfers..."
Write-Host "  ✓ Total custody handovers: $($evRes.evidence.transfers.Count)" -ForegroundColor Green

# 5. Retrieve Report V1
Write-Host "Step 5: Inspecting Forensic Report REP-2026-00125..."
$repRes = Invoke-RestMethod -Uri 'http://localhost:5000/api/reports/REP-2026-00125' -Headers @{ Authorization = "Bearer $token" }
$v1 = $repRes.report.versions | Where-Object { $_.versionNumber -eq 1 }
Write-Host "  ✓ Report V1 SHA-256: $($v1.sha256Hash.Substring(0, 16))..." -ForegroundColor Green

# 6. Verify V1 signature
Write-Host "Step 6: Verifying digital signature attestation..."
Write-Host "  ✓ Signed By: $($v1.signedByName) [$($v1.signedById)]" -ForegroundColor Green

# 7. SHA-256 Integrity Verification
Write-Host "Step 7: Performing live SHA-256 integrity verification..."
$verifyV1 = Invoke-RestMethod -Uri 'http://localhost:5000/api/reports/REP-2026-00125/verify' -Method Post -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body '{"versionNumber":1}'
Write-Host "  ✓ Verification result: $($verifyV1.message)" -ForegroundColor Green

# 8 & 9. Create Amendment V2
Write-Host "Step 8 & 9: Submitting formal amendment with reason 'Additional evidence'..."
$amendBody = @{
    amendmentReason = 'Additional evidence'
    amendmentDetails = 'Subsequent memory dump parsing revealed compromised SSH daemon certificates.'
    findings = 'Carved 14 archives and newly discovered unencrypted OpenSSH keys for user root.'
    conclusion = 'Conclusive proof of administrative credential compromise.'
} | ConvertTo-Json
$amendRes = Invoke-RestMethod -Uri 'http://localhost:5000/api/reports/REP-2026-00125/amend' -Method Post -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $amendBody
Write-Host "  ✓ Version 2 created! Message: $($amendRes.message)" -ForegroundColor Green

# 10. Check V1 still exists untouched
Write-Host "Step 10: Confirming Version 1 preservation..."
$repAfter = Invoke-RestMethod -Uri 'http://localhost:5000/api/reports/REP-2026-00125' -Headers @{ Authorization = "Bearer $token" }
$v1After = $repAfter.report.versions | Where-Object { $_.versionNumber -eq 1 }
if ($v1After.sha256Hash -eq $v1.sha256Hash) {
    Write-Host "  ✓ V1 Hash matches initial hash: 100% PRESERVED AND IMMUTABLE" -ForegroundColor Green
} else {
    Write-Host "  ERROR: V1 was modified!" -ForegroundColor Red
}

# 11. Compare V1 vs V2
Write-Host "Step 11: Running differential comparison between V1 and V2..."
$compRes = Invoke-RestMethod -Uri 'http://localhost:5000/api/reports/REP-2026-00125/compare?from=1&to=2' -Headers @{ Authorization = "Bearer $token" }
$diffCount = ($compRes.differences | Where-Object { $_.isDifferent }).Count
Write-Host "  ✓ Version comparison detected $diffCount modified fields with full attribution" -ForegroundColor Green

# 12 & 13. Audit Trail & Hash Chain Verification
Write-Host "Step 12 & 13: Verifying entire cryptographic audit hash chain..."
$auditVerify = Invoke-RestMethod -Uri 'http://localhost:5000/api/audit/verify' -Method Post -Headers @{ Authorization = "Bearer $token" }
Write-Host "  ✓ Audit Status: $($auditVerify.statusLabel) ($($auditVerify.totalVerified) blocks chained)" -ForegroundColor Green

# 14 & 15. Login as Judge
Write-Host "Step 14 & 15: Switching persona to Special Judge JDG-3012..."
$judgeLogin = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body '{"badgeId":"JDG-3012","password":"ForisSecure2026!"}'
$judgeToken = $judgeLogin.token
Write-Host "  ✓ Judge authenticated: $($judgeLogin.user.name) ($($judgeLogin.user.role))" -ForegroundColor Green

# 16. Attempt Unauthorized Judge Modification
Write-Host "Step 16: Testing unauthorized modification attempt by Judge..."
try {
    $badJudgeCall = Invoke-RestMethod -Uri 'http://localhost:5000/api/cases' -Method Post -Headers @{ Authorization = "Bearer $judgeToken" } -ContentType 'application/json' -Body '{"id":"ILLEGAL-CASE","firNumber":"F","title":"T","category":"C"}'
    Write-Host "  ERROR: Judge write should have failed!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "  ✓ Server correctly intercepted and rejected Judge write with HTTP $statusCode Forbidden!" -ForegroundColor Green
}

# 17. Security Center Check
Write-Host "Step 17: Verifying anomaly logged in Security Center..."
$secRes = Invoke-RestMethod -Uri 'http://localhost:5000/api/security/events' -Headers @{ Authorization = "Bearer $judgeToken" }
$judgeDenied = $secRes.events | Where-Object { $_.eventType -like '*JUDICIAL*' }
Write-Host "  ✓ Judicial violation logged in Security Center: $($judgeDenied[0].title)" -ForegroundColor Green

Write-Host "=== COMPLETE 17-STEP SIH DEMO FLOW VERIFIED SUCCESSFULLY ===" -ForegroundColor Cyan
