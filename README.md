# FORIS — Forensic Integrity & Evidence Management Platform
### Preserving Evidence • Protecting Integrity • Strengthening Justice
*Smart India Hackathon (SIH) 2026 Reference Implementation*

---

## 1. System Overview

**FORIS** is a defense-in-depth, government-grade forensic case and evidence management platform. Its mission is to make every forensic record:
* **Traceable**: Comprehensive attribution of every record creation, transfer, and revision.
* **Verifiable**: Deterministic SHA-256 cryptographic verification for documents and reports.
* **Version-Controlled**: Finalized forensic reports are immutable; any amendment creates a new version while permanently preserving earlier versions.
* **Auditable**: Append-only audit trail anchored by sequential cryptographic hash chains ($\text{Hash}_i = \text{SHA-256}(\text{Record}_i \parallel \text{Hash}_{i-1})$).
* **Tamper-Evident**: Any post-facto modification or deletion immediately breaks the mathematical hash chain.
* **Role-Restricted**: Server-side RBAC and ABAC; judicial access is strictly read-only and attempts to modify state are blocked with HTTP 403 Forbidden.

> **Core Principle:** *"Our system does not prevent an authorized officer from making a legitimate correction. It ensures that every correction is attributable, traceable, versioned, and independently verifiable."*

---

## 2. Architecture & Defense-in-Depth

```
+-------------------------------------------------------------------------+
|                  FORIS React + TypeScript Web Client                    |
|      (Government-Tech Theme • Role Switcher • Visual Custody Flow)      |
+------------------------------------+------------------------------------+
                                     |  HTTP / REST + JSON
+------------------------------------v------------------------------------+
|                         Express Gateway & Security                      |
|   Helmet Headers • Rate Limiter • JWT Auth • Role & Judicial Guards     |
+------------------+-----------------------------+------------------------+
                   |                             |
+------------------v--------------+     +--------v------------------------+
|      Forensic Engine            |     |    Tamper-Evident Subsystems    |
| • Case Dossiers                 |     | • Canonical SHA-256 Hasher      |
| • Evidence Register             |     | • Recursive Audit Hash Chain    |
| • Chain of Custody Timeline     |     | • Rule-Based Anomaly Engine     |
| • Versioned Report Engine       |     | • Prototype Digital Signature   |
| • Differential Diff Engine      |     | • File Upload MIME Validator    |
+------------------+--------------+     +--------+------------------------+
                   |                             |
+------------------v-----------------------------v------------------------+
|                     Prisma Strongly Typed ORM                           |
+------------------------------------+------------------------------------+
                                     |
+------------------------------------v------------------------------------+
|                   Relational Database (dev.db)                          |
|    Users • Cases • Evidence • Transfers • Reports • Versions • Audit    |
+-------------------------------------------------------------------------+
```

---

## 3. Technology Stack

* **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite
* **Backend**: Node.js v20 LTS, Express, TypeScript, tsx
* **ORM & Database**: Prisma ORM with SQLite (ACID compliant, zero external service dependency, 100% portable for hackathons, schema prepared for PostgreSQL)
* **Security & Auth**: Helmet security headers, Express Rate Limit, bcryptjs, JSON Web Tokens (JWT)
* **Cryptographic Engine**: Node.js native `crypto` (SHA-256 canonical hashing and sequential audit chaining)
* **File Uploads**: Multer with MIME whitelisting, UUID storage naming, and byte-level SHA-256 hashing

---

## 4. Roles & Access Control Matrix

| Feature / Action | Forensic Officer (`FEX-1024`) | Senior Police (`SPO-2048`) | Judge (`JDG-3012`) |
| :--- | :---: | :---: | :---: |
| **Inspect Assigned / Authorized Cases** | ✓ | ✓ | ✓ (Full Court View) |
| **Register New Case Dossier** | ✓ | ✓ | ✗ (403 Forbidden) |
| **Log Seized Evidence** | ✓ | ✓ | ✗ (403 Forbidden) |
| **Perform Chain of Custody Handover** | ✓ | ✓ | ✗ (403 Forbidden) |
| **Create Initial Report (Draft V1)** | ✓ | ✗ (403 Forbidden) | ✗ (403 Forbidden) |
| **Finalize & Sign Report V1** | ✓ | ✗ (403 Forbidden) | ✗ (403 Forbidden) |
| **Amend Report (Create V2, V3)** | ✓ (Mandatory Reason) | ✗ (403 Forbidden) | ✗ (403 Forbidden) |
| **Overwrite / Delete Finalized V1** | **PROHIBITED (400/409)** | **PROHIBITED (403)** | **PROHIBITED (403)** |
| **Compare Versions (V1 ↔ V2)** | ✓ | ✓ | ✓ |
| **Verify SHA-256 Document Integrity** | ✓ | ✓ | ✓ |
| **Verify Audit Hash Chain Integrity** | ✓ | ✓ | ✓ |
| **Security Center Monitoring** | Standard View | Investigation View | Read-Only View |

---

## 5. Demonstration Credentials

All demonstration identities use the default password: **`ForisSecure2026!`**

| Role | Officer Name | Badge ID | Purpose in Demo |
| :--- | :--- | :---: | :--- |
| **Forensic Officer** | Dr. Abhiraj Singh | `FEX-1024` | Creates reports, signs V1, creates formal amendment V2 |
| **Senior Police Officer** | ACP Vikram Rathore | `SPO-2048` | Manages cases, views custody history, downloads evidence |
| **Special Judge** | Hon. Justice Manisha Sharma | `JDG-3012` | **STRICT READ-ONLY** court inspection, compares versions, triggers 403 test |
| **Administrator** | Dr. Ananya Sen | `ADMIN-001` | System audit overview and security governance |

---

## 6. The Complete 17-Step SIH Presentation Scenario

To demonstrate the full system in a 5–7 minute evaluation:

1. **Login as Forensic Officer**: Login with badge `FEX-1024`.
2. **Open Case**: Navigate to *Case Dossiers* and open `MP-FOR-2026-00125`.
3. **Inspect Evidence**: Navigate to *Evidence Register* and select `EV-001` (Encrypted NVMe SSD).
4. **Inspect Chain of Custody**: View the visual 4-step chronological handover ledger.
5. **View Forensic Report**: Open *Forensic Reports* to inspect `REP-2026-00125` (Version 1).
6. **Verify Attestation**: Observe digital attestation signature and canonical SHA-256 seal.
7. **Perform Integrity Verification**: Click **Verify SHA-256**. The modal confirms:
   $$\text{Expected Hash} = \text{Calculated Hash} \implies \text{✓ INTEGRITY VERIFIED}$$
8. **Formulate Formal Amendment**: Click **Create Formal Amendment**. Select reason: `Additional evidence`. Enter justification.
9. **Commit Report V2**: Submit the amendment. The system generates Version 2 with updated findings.
10. **Confirm V1 Preservation**: In the version tree, switch between Version 1 and Version 2. Version 1 is 100% intact and untouched.
11. **Differential Version Comparison**: Click **Compare V1 ↔ V2**. The side-by-side engine highlights WHO changed it, WHEN, WHAT changed, and WHY.
12. **Inspect Audit Trail**: Navigate to *Audit Trail*. Review append-only chronological events.
13. **Verify Audit Chain**: Click **Verify Audit Integrity**. The recursive mathematical validator confirms all blocks unbroken from genesis anchor (`000...000`).
14. **Switch to Judge Persona**: In the top bar, use the SIH demo switcher to select `JDG-3012`.
15. **Observe Judicial Read-Only Banner**: Notice the prominent amber judicial restriction banner.
16. **Execute Unauthorized Write Test**: Click **Test Unauthorized Judicial Mutation**. The server intercepts and returns `HTTP 403 Forbidden (JUDICIAL_READ_ONLY_VIOLATION)`.
17. **View Security Center**: Open *Security Center*. Confirm that the anomaly engine captured and logged the attempted judicial write violation.

---

## 7. Running & Testing

### Development Mode
```bash
# Install dependencies
npm install

# Push schema and seed demo data
npm run db:push
npm run db:seed

# Run backend and frontend concurrently
npm run dev
```

### Full-Stack Production Server
```bash
# Build frontend
npm run build

# Start production server (serves API and Frontend on http://localhost:5000)
npm start
```

### Automated Verification Suite
```bash
# Run automated API & security test suite
npm test

# Run 17-step demonstration scenario
npx tsx test_sih_flow.ts
```

---

## 8. Threat Model & Mitigations

| Threat Vector | Potential Impact | FORIS Defense-in-Depth Mitigation |
| :--- | :--- | :--- |
| **Insider Record Tampering** | Examiner silently modifies findings to favor a suspect | Reports are immutable upon finalization. Any change mandates an amendment reason, creates a new version, and retains previous versions. |
| **Retroactive Audit Alteration** | Malicious admin alters or deletes an embarrassing log | Sequential SHA-256 hash chaining: altering record $i$ invalidates hashes $i \dots n$, detected by `/api/audit/verify`. |
| **Judicial Overreach** | A judge attempts to inject evidence or alter reports | Server-side RBAC intercepts any non-GET request from judicial credentials, returns HTTP 403, and generates an anomaly alert. |
| **Evidence Custody Gaps** | Chain of custody records destroyed or disputed | Each transfer is a distinct append-only entity requiring digital acknowledgment. |
| **Malicious File Uploads** | Web shells or executables uploaded as evidence | Whitelisted MIME validation, UUID storage filenames, and raw byte-level SHA-256 calculation. |

---

## 9. Future Enhancements

* **National PKI / Aadhaar eSign Integration**: Legally binding digital signatures via C-DAC / NIC eSign gateway.
* **Hardware Security Module (HSM)**: Storing root signing keys inside FIPS 140-2 Level 3 cryptographic hardware.
* **Write-Once-Read-Many (WORM) Storage**: Offsite optical or cloud object lock mirroring for audit logs.
* **GovCloud SIEM Integration**: Streaming security and anomaly events into national SOC infrastructure.
