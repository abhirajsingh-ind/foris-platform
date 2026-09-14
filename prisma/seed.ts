import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { calculateReportHash, calculateAuditHash, sha256, GENESIS_AUDIT_HASH } from '../server/utils/crypto';

const prisma = new PrismaClient();

function createForensicFile(filename: string, content: string): { storedFilename: string; originalFilename: string; size: number; hash: string } {
  const uploadDir = path.resolve(process.cwd(), './uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const safeFilename = `${Date.now()}_${filename}`;
  const filePath = path.join(uploadDir, safeFilename);
  fs.writeFileSync(filePath, content, 'utf8');
  const buffer = fs.readFileSync(filePath);
  const hash = sha256(buffer);
  return { storedFilename: safeFilename, originalFilename: filename, size: buffer.length, hash };
}

async function main() {
  console.log('[SEED] Clearing existing records for clean demo state...');
  await prisma.document.deleteMany();
  await prisma.reportChange.deleteMany();
  await prisma.reportVersion.deleteMany();
  await prisma.report.deleteMany();
  await prisma.evidenceTransfer.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.case.deleteMany();
  await prisma.securityEvent.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.user.deleteMany();

  console.log('[SEED] Creating fictional demo users...');
  const passwordHash = await bcrypt.hash('{123FORIS@', 10);

  const fexOfficer = await prisma.user.create({
    data: {
      badgeId: 'FEX-1024',
      name: 'Dr. Abhiraj Singh',
      email: 'fex1024@foris.gov.in',
      passwordHash,
      role: 'FORENSIC_OFFICER',
      designation: 'Senior Digital & Physical Forensic Specialist',
      department: 'State Forensic Science Laboratory (SFSL)',
    },
  });

  const policeOfficer = await prisma.user.create({
    data: {
      badgeId: 'SPO-2048',
      name: 'ACP Vikram Rathore',
      email: 'spo2048@police.gov.in',
      passwordHash,
      role: 'POLICE_OFFICER',
      designation: 'Assistant Commissioner of Police',
      department: 'Special Crime Branch & Cyber Cell',
    },
  });

  const judgeUser = await prisma.user.create({
    data: {
      badgeId: 'JDG-3012',
      name: 'Hon. Justice Manisha Sharma',
      email: 'judge3012@judiciary.gov.in',
      passwordHash,
      role: 'JUDGE',
      designation: 'Presiding Judge, Special Sessions & Forensic Court',
      department: 'High Court Judicial Special Bench 04',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      badgeId: 'ADMIN-001',
      name: 'Dr. Ananya Sen',
      email: 'admin@foris.gov.in',
      passwordHash,
      role: 'ADMINISTRATOR',
      designation: 'Director of Forensic Quality Assurance & Audit',
      department: 'Forensic Integrity Oversight Directorate',
    },
  });

  console.log('[SEED] Creating 6 Real-Life Forensic Cases...');

  // ==========================================
  // CASE 1: CYBER INTRUSION & RANSOMWARE
  // ==========================================
  const case1 = await prisma.case.create({
    data: {
      id: 'MP-FOR-2026-00125',
      firNumber: 'FIR-892/2026/CYBER',
      title: 'State v. Financial Infrastructure Cyber Intrusion & Ransomware Attack',
      description:
        'Investigation into unauthorized intrusion, credential theft, and encrypted data exfiltration targeting regional treasury server nodes. Zero-day exploit deployed via compromised domain controller.',
      category: 'Digital Evidence & Cyber Intrusion',
      policeUnit: 'Cyber Crime Investigation Division, Central Range',
      forensicUnit: 'SFSL Digital Forensics & Data Recovery Laboratory',
      status: 'UNDER_EXAMINATION',
      priority: 'CRITICAL',
      assignedOfficerId: fexOfficer.id,
      createdById: policeOfficer.id,
    },
  });

  const ev1Hash = sha256('EV-001|MP-FOR-2026-00125|Samsung 990 Pro 2TB NVMe M.2 Solid State Drive|SI K. Verma');
  const ev1 = await prisma.evidence.create({
    data: {
      id: 'EV-001',
      caseId: case1.id,
      evidenceType: 'Encrypted 2TB NVMe M.2 Solid State Drive',
      description:
        'Samsung 990 Pro 2TB (S/N: S6X4NS0X192834). Extracted from primary domain controller server rack at compromised data center.',
      collectionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      collectorName: 'Sub-Inspector K. Verma',
      initialCondition: 'Intact, enclosed in static-shielded tamper-evident forensic envelope #FE-90812',
      currentCustodian: 'Dr. Abhiraj Singh (FEX-1024)',
      currentStatus: 'IN_EXAMINATION',
      storageLocation: 'Forensic Isolation Lab Workstation 02',
      sha256Hash: ev1Hash,
    },
  });

  const ev2Hash = sha256('EV-002|MP-FOR-2026-00125|Hardware Security Key YubiKey 5 NFC|SI K. Verma');
  const ev2 = await prisma.evidence.create({
    data: {
      id: 'EV-002',
      caseId: case1.id,
      evidenceType: 'Hardware Security Key (YubiKey 5 NFC)',
      description:
        'Black YubiKey 5 NFC (Serial: 2490182). Recovered from physical workstation during perimeter breach search.',
      collectionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      collectorName: 'Sub-Inspector K. Verma',
      initialCondition: 'Minor physical scuffs, electronics intact and functional',
      currentCustodian: 'Secure Storage Vault Supervisor',
      currentStatus: 'SECURE_VAULT',
      storageLocation: 'High Security Safe B-14',
      sha256Hash: ev2Hash,
    },
  });

  // Transfers for Case 1
  const t1_1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const t1_2 = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  const t1_3 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const t1_4 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  await prisma.evidenceTransfer.createMany({
    data: [
      {
        evidenceId: ev1.id,
        fromParty: 'Crime Scene Recovery (SI K. Verma)',
        toParty: 'Police Station Malkhana (Evidence Custodian Insp. S. K. Gupta)',
        transferredAt: t1_1,
        purpose: 'Initial seizure, bagging, sealing with forensic barcode #BAR-90812',
        action: 'SEIZURE_AND_ENTRY',
        status: 'ACKNOWLEDGED',
        notes: 'Enclosed in ESD bag with tamper-evident red numbered seal #449102',
        responsibleOfficerId: policeOfficer.id,
      },
      {
        evidenceId: ev1.id,
        fromParty: 'Police Station Malkhana (Evidence Custodian)',
        toParty: 'Forensic Lab Intake Officer (Inspector Alok Mehra)',
        transferredAt: t1_2,
        purpose: 'Official transit of sealed digital evidence under Court Docket 2026/89',
        action: 'TRANSIT_DISPATCH',
        status: 'ACKNOWLEDGED',
        notes: 'Hand-delivered in armored courier dispatch lockbox',
        responsibleOfficerId: policeOfficer.id,
      },
      {
        evidenceId: ev1.id,
        fromParty: 'Forensic Lab Intake Officer (Inspector Alok Mehra)',
        toParty: 'Forensic Science Laboratory Evidence Reception',
        transferredAt: t1_3,
        purpose: 'Receival and accession verification at SFSL Central Intake',
        action: 'LAB_RECEIPT_AND_LOG',
        status: 'ACKNOWLEDGED',
        notes: 'Integrity seal #449102 inspected: intact with no tampering marks',
        responsibleOfficerId: adminUser.id,
      },
      {
        evidenceId: ev1.id,
        fromParty: 'Forensic Science Laboratory Evidence Reception',
        toParty: 'Forensic Examiner Dr. Abhiraj Singh (FEX-1024)',
        transferredAt: t1_4,
        purpose: 'Assigned for forensic bit-stream acquisition and partition analysis',
        action: 'EXAMINATION_HANDOVER',
        status: 'ACKNOWLEDGED',
        notes: 'Transferred to cleanroom digital acquisition terminal',
        responsibleOfficerId: fexOfficer.id,
      },
    ],
  });

  const fileDoc1 = createForensicFile(
    'Server_Node_04_Incident_Log_Exfiltration_Dump.txt',
    `FORENSIC INCIDENT EXTRACTION LOG
CASE REF: MP-FOR-2026-00125 | FIR-892/2026/CYBER
TARGET HOST: DC-PRIMARY-04.TREASURY.LOCAL (IP: 10.45.18.2)
EXTRACTION TIMESTAMP: 2026-09-02 03:14:22 UTC
ACQUIRED BY: Dr. Abhiraj Singh (FEX-1024)

[02:41:09] Kerberos TGT Ticket Request granted: User: srv_backup$
[02:42:15] Suspicious LSASS process memory dump detected (Process ID: 644)
[02:43:01] Outbound encrypted TLS tunnel initiated to 185.220.101.5:443
[02:44:18] Exfiltration volume: 4.82 GB compressed payloads (.tar.gz)
[02:45:00] Master Boot Record (MBR) overwrite attempt staged
SHA-256 HASH VERIFICATION: MATCH CONFIRMED`
  );

  await prisma.document.create({
    data: {
      caseId: case1.id,
      evidenceId: ev1.id,
      originalFilename: fileDoc1.originalFilename,
      storedFilename: fileDoc1.storedFilename,
      mimeType: 'text/plain',
      fileSize: fileDoc1.size,
      sha256Hash: fileDoc1.hash,
      uploadedById: fexOfficer.id,
    },
  });

  const c1ReportContent = {
    evidenceExamined: '1x Samsung 990 Pro 2TB NVMe Solid State Drive (Evidence ID: EV-001, S/N: S6X4NS0X192834)',
    examinationMethod:
      'Bit-stream physical forensic image acquired using Tableau T7u PCIe Bridge write-blocker to forensic workstation storage. Dual verification using SHA-256 and MD5 hashing before and after acquisition per ISO/IEC 27037 standards.',
    observations:
      'File system analysis shows Microsoft Windows Server 2022 installation with NTFS formatting. BitLocker volume header was located at sector 0x0040. Event logs indicate administrative privilege escalation at 02:41 UTC on 2026-09-02.',
    findings:
      'Forensic data carving recovered 14 compressed .tar.gz archives containing active session cookies, SQL database dump fragments, and an executable script identified as a Cobalt Strike beacon payload (SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855).',
    conclusion:
      'The examined evidence article contains conclusive digital artifacts demonstrating deliberate insider credential exfiltration and unauthorized command execution. The acquired disk image exhibits pristine evidentiary integrity admissible under Section 65B of the Indian Evidence Act / Section 63 BSA.',
  };

  const c1Hash = calculateReportHash(c1ReportContent);
  const rep1Date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const rep1Sig = sha256(`${c1Hash}|${fexOfficer.badgeId}|${fexOfficer.name}|${rep1Date.toISOString()}`);

  const report1 = await prisma.report.create({
    data: {
      id: 'REP-2026-00125',
      caseId: case1.id,
      title: 'Digital Forensic Examination & Server Artifact Extraction Report',
      currentVersion: 1,
      status: 'FINALIZED',
      authorId: fexOfficer.id,
    },
  });

  await prisma.reportVersion.create({
    data: {
      reportId: report1.id,
      versionNumber: 1,
      evidenceExamined: c1ReportContent.evidenceExamined,
      examinationMethod: c1ReportContent.examinationMethod,
      observations: c1ReportContent.observations,
      findings: c1ReportContent.findings,
      conclusion: c1ReportContent.conclusion,
      sha256Hash: c1Hash,
      authorId: fexOfficer.id,
      isFinalized: true,
      finalizedAt: rep1Date,
      signedByName: fexOfficer.name,
      signedById: fexOfficer.badgeId,
      signedByDesignation: fexOfficer.designation,
      signatureTimestamp: rep1Date,
      signatureHash: rep1Sig,
      createdAt: rep1Date,
    },
  });

  // ==========================================
  // CASE 2: BALLISTICS & ARMED AMBUSH
  // ==========================================
  const case2 = await prisma.case.create({
    data: {
      id: 'DL-FOR-2026-00094',
      firNumber: 'FIR-412/2026/PHYS',
      title: 'State v. Central Bank Cash Van Armed Ambush & Ballistic Striation Comparison',
      description:
        'Recovery of spent 9mm ammunition casings and projectile core from armored cash vehicle windshield. Comparison against seized Glock 19 semi-automatic firearm recovered from suspect cache.',
      category: 'Ballistics & Physical Evidence',
      policeUnit: 'Special Task Force (STF) Counter-Crime Unit',
      forensicUnit: 'Central FSL Ballistics & Toolmarks Division',
      status: 'REPORT_FILED',
      priority: 'HIGH',
      assignedOfficerId: fexOfficer.id,
      createdById: policeOfficer.id,
    },
  });

  const ev3Hash = sha256('EV-003|DL-FOR-2026-00094|9x19mm Parabellum Spent Cartridge Casing|Insp R. Negi');
  const ev3 = await prisma.evidence.create({
    data: {
      id: 'EV-003',
      caseId: case2.id,
      evidenceType: 'Spent 9x19mm Parabellum Cartridge Casing',
      description:
        'Brass cartridge casing with headstamp "KF 2024 9mm 2A". Recovered from driver floorboard of armored cash transit vehicle DL-1VB-9011.',
      collectionDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      collectorName: 'Inspector R. Negi (STF)',
      initialCondition: 'Soot deposits on neck, distinct firing pin indentation on primer cup',
      currentCustodian: 'Central FSL Ballistics Vault',
      currentStatus: 'SECURE_VAULT',
      storageLocation: 'Ballistics Evidence Locker B-08',
      sha256Hash: ev3Hash,
    },
  });

  const ev4Hash = sha256('EV-004|DL-FOR-2026-00094|Glock 19 Gen5 9mm Semi-Automatic Pistol|Insp R. Negi');
  const ev4 = await prisma.evidence.create({
    data: {
      id: 'EV-004',
      caseId: case2.id,
      evidenceType: 'Glock 19 Gen5 9mm Pistol (S/N: G19-892144-IN)',
      description:
        'Semi-automatic polymer-frame pistol with 15-round magazine and 6 live 9x19mm cartridges. Seized during cordon search at Dwarka Sector 19.',
      collectionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      collectorName: 'Inspector R. Negi (STF)',
      initialCondition: 'Intact, functional safety mechanism, barrel rifling clean with visible residue',
      currentCustodian: 'Central FSL Ballistics Laboratory',
      currentStatus: 'IN_EXAMINATION',
      storageLocation: 'Armory Storage Bay 3',
      sha256Hash: ev4Hash,
    },
  });

  // Transfers for Case 2
  await prisma.evidenceTransfer.createMany({
    data: [
      {
        evidenceId: ev3.id,
        fromParty: 'STF Crime Scene Unit (Insp R. Negi)',
        toParty: 'Police Headquarters Malkhana (Custody Officer Sub-Insp Tariq)',
        transferredAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        purpose: 'Seizure and packaging in rigid evidence capsule with Seal #BL-1092',
        action: 'SEIZURE_AND_ENTRY',
        status: 'ACKNOWLEDGED',
        notes: 'Cartridge casing labeled exhibit C-1',
        responsibleOfficerId: policeOfficer.id,
      },
      {
        evidenceId: ev3.id,
        fromParty: 'Police Headquarters Malkhana',
        toParty: 'Central FSL Ballistics Division (Dr. Abhiraj Singh)',
        transferredAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        purpose: 'Comparison microscopy and firing pin breech face mark examination',
        action: 'LAB_RECEIPT_AND_LOG',
        status: 'ACKNOWLEDGED',
        notes: 'Seal #BL-1092 verified intact under stereomicroscope',
        responsibleOfficerId: fexOfficer.id,
      },
    ],
  });

  const fileDoc2 = createForensicFile(
    'Comparison_Microscopy_Ballistic_Match_Certificate.txt',
    `FORENSIC BALLISTICS COMPARISON CERTIFICATE
CASE REF: DL-FOR-2026-00094 | FIR-412/2026/PHYS
CENTRAL FORENSIC SCIENCE LABORATORY (CFSL)
EXHIBIT C-1 (Spent Casing) vs. EXHIBIT F-1 (Test-Fired Casing from Glock 19 S/N: G19-892144-IN)

EXAMINATION PROTOCOL:
- Comparison Microscope: Leica FS CB Optical Comparison System at 40x and 100x magnification
- Striation Land & Groove Width: 6 lands and grooves with right-hand twist (hexagonal rifling)
- Breech Face Marks: Parallel vertical machining micro-grooves matched at 14 consecutive points
- Firing Pin Impression: Rectangular striker indent with concentric drag mark characteristic of Glock firing mechanism

CONCLUSION:
It is the positive and definite opinion of this examiner that the spent cartridge casing Exhibit C-1 was fired from the firearm Exhibit F-1 (Glock 19 Gen5 S/N: G19-892144-IN) to the exclusion of all other firearms.

Signed: Dr. Abhiraj Singh, Senior Ballistics Specialist`
  );

  await prisma.document.create({
    data: {
      caseId: case2.id,
      evidenceId: ev3.id,
      originalFilename: fileDoc2.originalFilename,
      storedFilename: fileDoc2.storedFilename,
      mimeType: 'text/plain',
      fileSize: fileDoc2.size,
      sha256Hash: fileDoc2.hash,
      uploadedById: fexOfficer.id,
    },
  });

  const c2ReportContent = {
    evidenceExamined:
      'Exhibit C-1: 1x Spent 9mm brass cartridge casing (EV-003). Exhibit F-1: 1x Glock 19 Gen5 9mm Pistol S/N G19-892144-IN (EV-004).',
    examinationMethod:
      'Macroscopic and stereo-microscopic inspection followed by comparison microscopy on Leica FS CB. Three test rounds fired into water recovery tank to produce standard comparison specimens.',
    observations:
      'Cartridge casing Exhibit C-1 exhibits rectangular primer aperture imprint and pronounced horizontal shearing marks along the chamber walls matching the polygonal barrel chamber.',
    findings:
      'Microscopic comparison of firing pin drag marks and breech face striations between Exhibit C-1 and test-fired casings revealed 14 coincident individual characteristics. No significant points of divergence were observed.',
    conclusion:
      'The questioned cartridge casing (Exhibit C-1) was conclusively fired from the seized Glock 19 pistol (Exhibit F-1). The physical and striation evidence is established beyond scientific doubt under Section 45 Indian Evidence Act / BSA.',
  };

  const c2Hash = calculateReportHash(c2ReportContent);
  const rep2Date = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
  const rep2Sig = sha256(`${c2Hash}|${fexOfficer.badgeId}|${fexOfficer.name}|${rep2Date.toISOString()}`);

  const report2 = await prisma.report.create({
    data: {
      id: 'REP-2026-00094',
      caseId: case2.id,
      title: 'Ballistic Comparison & Striation Match Examination Report',
      currentVersion: 1,
      status: 'FINALIZED',
      authorId: fexOfficer.id,
    },
  });

  await prisma.reportVersion.create({
    data: {
      reportId: report2.id,
      versionNumber: 1,
      evidenceExamined: c2ReportContent.evidenceExamined,
      examinationMethod: c2ReportContent.examinationMethod,
      observations: c2ReportContent.observations,
      findings: c2ReportContent.findings,
      conclusion: c2ReportContent.conclusion,
      sha256Hash: c2Hash,
      authorId: fexOfficer.id,
      isFinalized: true,
      finalizedAt: rep2Date,
      signedByName: fexOfficer.name,
      signedById: fexOfficer.badgeId,
      signedByDesignation: fexOfficer.designation,
      signatureTimestamp: rep2Date,
      signatureHash: rep2Sig,
      createdAt: rep2Date,
    },
  });

  // ==========================================
  // CASE 3: TOXICOLOGY & VISCERA POISONING
  // ==========================================
  const case3 = await prisma.case.create({
    data: {
      id: 'MH-FOR-2026-00341',
      firNumber: 'FIR-118/2026/TOXIC',
      title: 'State v. Industrialist Suspicious Demise & Viscera Toxicology GC-MS Screening',
      description:
        'Investigation into sudden unexplained collapse of victim following a corporate banquet. Post-mortem viscera and suspected drink residues submitted for volatile, heavy metal, and synthetic toxin analysis.',
      category: 'Toxicology & Chemical Analysis',
      policeUnit: 'Crime Branch Unit 09, Mumbai Police',
      forensicUnit: 'Regional Forensic Science Laboratory (RFSL) Toxicology Division',
      status: 'UNDER_EXAMINATION',
      priority: 'CRITICAL',
      assignedOfficerId: fexOfficer.id,
      createdById: policeOfficer.id,
    },
  });

  const ev5Hash = sha256('EV-005|MH-FOR-2026-00341|Preserved Stomach & Upper Intestine Viscera|Dr. S. Kulkarni');
  const ev5 = await prisma.evidence.create({
    data: {
      id: 'EV-005',
      caseId: case3.id,
      evidenceType: 'Preserved Human Viscera (Stomach & Upper Intestine)',
      description:
        'Viscera jar sealed in saturated sodium chloride solution containing 420g of gastric mucosa and partially digested stomach contents.',
      collectionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      collectorName: 'Dr. S. Kulkarni (Medical Examiner, JJ Hospital)',
      initialCondition: 'Sealed with official mortuary lead seal #ME-7712, refrigerated at 4°C',
      currentCustodian: 'Dr. Abhiraj Singh (FEX-1024)',
      currentStatus: 'IN_EXAMINATION',
      storageLocation: 'Cold Storage Specimen Freezer F-03',
      sha256Hash: ev5Hash,
    },
  });

  const ev6Hash = sha256('EV-006|MH-FOR-2026-00341|50ml Amber Glass Reagent Bottle with White Residue|SI D. Pawar');
  const ev6 = await prisma.evidence.create({
    data: {
      id: 'EV-006',
      caseId: case3.id,
      evidenceType: '50ml Amber Glass Chemical Bottle with Residue',
      description:
        'Amber glass bottle labeled "Industrial Analytical Solvent - Analytical Grade". Contains ~1.2g crystalline white solid residue recovered from suspect private locker.',
      collectionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      collectorName: 'Sub-Inspector D. Pawar (Crime Branch)',
      initialCondition: 'Tightly sealed with PTFE screw cap in double biohazard container',
      currentCustodian: 'RFSL Chemical Vault',
      currentStatus: 'SECURE_VAULT',
      storageLocation: 'Chemical Hazards Locker C-12',
      sha256Hash: ev6Hash,
    },
  });

  // Transfers for Case 3
  await prisma.evidenceTransfer.createMany({
    data: [
      {
        evidenceId: ev5.id,
        fromParty: 'Forensic Medicine Department, JJ Hospital',
        toParty: 'RFSL Mumbai Receiving Desk (Officer M. Shinde)',
        transferredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        purpose: 'Handover of post-mortem viscera in temperature-controlled cooler',
        action: 'SEIZURE_AND_ENTRY',
        status: 'ACKNOWLEDGED',
        notes: 'Seal #ME-7712 intact, temperature logged at 3.8°C',
        responsibleOfficerId: policeOfficer.id,
      },
      {
        evidenceId: ev5.id,
        fromParty: 'RFSL Mumbai Receiving Desk',
        toParty: 'Toxicology Section Examiner (Dr. Abhiraj Singh)',
        transferredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        purpose: 'Screening for organophosphorus, cyanide, and alkaloid toxins',
        action: 'LAB_RECEIPT_AND_LOG',
        status: 'ACKNOWLEDGED',
        notes: 'Aliquots prepared for steam distillation and micro-diffusion assay',
        responsibleOfficerId: fexOfficer.id,
      },
    ],
  });

  const fileDoc3 = createForensicFile(
    'GC_MS_Toxicological_Screening_Spectrum_Data.txt',
    `REGIONAL FORENSIC SCIENCE LABORATORY (RFSL) TOXICOLOGY REPORT
CASE: MH-FOR-2026-00341 | FIR-118/2026/TOXIC
INSTRUMENTATION: Agilent 7890B GC / 5977B MSD with MassHunter Workstation
SAMPLE: Acidic & Alkaline Ether Extract from Gastric Contents (Exhibit V-1)

ANALYTICAL FINDINGS:
1. Cyanide Screen:
   - Conway micro-diffusion method followed by Pyridine-Barbituric Acid Spectrophotometry: POSITIVE
   - Quantified Cyanide (CN-) Concentration: 4.8 mg/L (Lethal threshold in blood: > 2.5 mg/L)
2. Heavy Metals (ICP-MS):
   - Arsenic: 0.02 ppm (Normal baseline)
   - Lead: 0.05 ppm (Normal baseline)
3. Volatile Organic Hydrocarbons:
   - Negative for methanol, ethanol, chloroform

CONCLUSION:
Fatal concentration of Cyanide salt (Potassium/Sodium Cyanide) identified in stomach contents. Immediate cytotoxic hypoxia established as toxic mechanism.`
  );

  await prisma.document.create({
    data: {
      caseId: case3.id,
      evidenceId: ev5.id,
      originalFilename: fileDoc3.originalFilename,
      storedFilename: fileDoc3.storedFilename,
      mimeType: 'text/plain',
      fileSize: fileDoc3.size,
      sha256Hash: fileDoc3.hash,
      uploadedById: fexOfficer.id,
    },
  });

  const c3ReportContent = {
    evidenceExamined:
      'Exhibit V-1: Preserved Gastric Viscera (EV-005). Exhibit B-1: Amber Glass Chemical Residue (EV-006).',
    examinationMethod:
      'Conway micro-diffusion assay, Colorimetric Cyanide Spectrophotometry at 580nm, and Gas Chromatography-Mass Spectrometry (GC-MS) headspace analysis.',
    observations:
      'Bitter almond odour detected upon acidification during steam distillation. Prussian blue chemical confirmation test yielded immediate deep blue precipitate (Ferric ferrocyanide).',
    findings:
      'Viscera analysis confirmed presence of Potassium Cyanide (KCN) at 4.8 mg/L concentration in gastric contents. The white crystalline residue in Exhibit B-1 was identified as pure Potassium Cyanide (98.4% purity).',
    conclusion:
      'Death was caused by acute cyanide toxicity resulting in histotoxic hypoxia. The chemical profile of the viscera extract correlates identically with the seized chemical container.',
  };

  const c3Hash = calculateReportHash(c3ReportContent);
  const rep3Date = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
  const rep3Sig = sha256(`${c3Hash}|${fexOfficer.badgeId}|${fexOfficer.name}|${rep3Date.toISOString()}`);

  const report3 = await prisma.report.create({
    data: {
      id: 'REP-2026-00341',
      caseId: case3.id,
      title: 'Toxicological Chemical Analysis & Cyanide Determination Report',
      currentVersion: 1,
      status: 'FINALIZED',
      authorId: fexOfficer.id,
    },
  });

  await prisma.reportVersion.create({
    data: {
      reportId: report3.id,
      versionNumber: 1,
      evidenceExamined: c3ReportContent.evidenceExamined,
      examinationMethod: c3ReportContent.examinationMethod,
      observations: c3ReportContent.observations,
      findings: c3ReportContent.findings,
      conclusion: c3ReportContent.conclusion,
      sha256Hash: c3Hash,
      authorId: fexOfficer.id,
      isFinalized: true,
      finalizedAt: rep3Date,
      signedByName: fexOfficer.name,
      signedById: fexOfficer.badgeId,
      signedByDesignation: fexOfficer.designation,
      signatureTimestamp: rep3Date,
      signatureHash: rep3Sig,
      createdAt: rep3Date,
    },
  });

  // ==========================================
  // CASE 4: QUESTIONED DOCUMENTS & FORGERY
  // ==========================================
  const case4 = await prisma.case.create({
    data: {
      id: 'KA-FOR-2026-00219',
      firNumber: 'FIR-734/2026/DOC-E',
      title: 'State v. High-Value Commercial Property Dispute & Disputed Will Signature Forgery',
      description:
        'Forensic questioned document examination of purported last will and testament on ₹500 judicial stamp paper. Verification of signature hesitation marks, stroke sequence, and ink aging.',
      category: 'Questioned Documents & Handwriting',
      policeUnit: 'Economic Offences Wing (EOW), CID Karnataka',
      forensicUnit: 'State FSL Questioned Documents Division',
      status: 'UNDER_EXAMINATION',
      priority: 'MEDIUM',
      assignedOfficerId: fexOfficer.id,
      createdById: policeOfficer.id,
    },
  });

  const ev7Hash = sha256('EV-007|KA-FOR-2026-00219|Disputed Last Will & Testament on ₹500 Stamp Paper|Insp C. Gowda');
  const ev7 = await prisma.evidence.create({
    data: {
      id: 'EV-007',
      caseId: case4.id,
      evidenceType: 'Questioned Document (Disputed Will on Stamp Paper)',
      description:
        'Original 3-page document on ₹500 Government Non-Judicial Stamp Paper #IN-KA8821901. Purported signature of Late Sh. M. S. Rao on Page 3.',
      collectionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      collectorName: 'Inspector C. Gowda (EOW CID)',
      initialCondition: 'Enclosed in acid-free archival polyester sleeve, no folding or staple damage',
      currentCustodian: 'Dr. Abhiraj Singh (FEX-1024)',
      currentStatus: 'IN_EXAMINATION',
      storageLocation: 'Questioned Documents Humidity Safe QD-01',
      sha256Hash: ev7Hash,
    },
  });

  const ev8Hash = sha256('EV-008|KA-FOR-2026-00219|Standard Admitted Signatures Ledger 2018-2023|Insp C. Gowda');
  const ev8 = await prisma.evidence.create({
    data: {
      id: 'EV-008',
      caseId: case4.id,
      evidenceType: 'Standard Admitted Signature Records (Bank Specimen Cards)',
      description:
        'Official State Bank of India account opening card (Account #390182441) and registered lease deeds from 2018-2023 bearing 12 admitted standard signatures.',
      collectionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      collectorName: 'Inspector C. Gowda (EOW CID)',
      initialCondition: 'Authenticated by Chief Branch Manager with official bank seal',
      currentCustodian: 'Dr. Abhiraj Singh (FEX-1024)',
      currentStatus: 'IN_EXAMINATION',
      storageLocation: 'Questioned Documents Reference Vault',
      sha256Hash: ev8Hash,
    },
  });

  // Transfers for Case 4
  await prisma.evidenceTransfer.createMany({
    data: [
      {
        evidenceId: ev7.id,
        fromParty: 'EOW CID Special Investigation Team',
        toParty: 'SFSL Documents Division Reception',
        transferredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        purpose: 'Handover of disputed will under court production warrant Cr.P.C. 91',
        action: 'SEIZURE_AND_ENTRY',
        status: 'ACKNOWLEDGED',
        notes: 'Document placed in Mylar sleeve #DOC-KA-734',
        responsibleOfficerId: policeOfficer.id,
      },
      {
        evidenceId: ev7.id,
        fromParty: 'SFSL Documents Division Reception',
        toParty: 'Questioned Documents Expert (Dr. Abhiraj Singh)',
        transferredAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
        purpose: 'Video Spectral Comparator (VSC 8000) multi-spectral ink examination',
        action: 'LAB_RECEIPT_AND_LOG',
        status: 'ACKNOWLEDGED',
        notes: 'Multi-spectral imaging across 400nm-1000nm wavelengths initiated',
        responsibleOfficerId: fexOfficer.id,
      },
    ],
  });

  const fileDoc4 = createForensicFile(
    'VSC8000_Spectral_Luminescence_Ink_Analysis_Sheet.txt',
    `FOSTER + FREEMAN VSC 8000 SPECTRAL ANALYSIS LOG
CASE: KA-FOR-2026-00219 | FIR-734/2026/DOC-E
QUESTIONED SIGNATURE: Q-1 (Page 3 of Disputed Will)
STANDARD SIGNATURES: S-1 through S-12 (Bank Specimen Ledger)

1. ULTRAVIOLET FLUORESCENCE (365nm):
   - Stamp paper shows authentic security thread and government watermark.
   - Text toner exhibits uniform absorption across all 3 pages.

2. INFRARED LUMINESCENCE (780nm Filter):
   - Signature Q-1: Ink reflects IR radiation at 780nm (Ballpoint blue dye with glycol vehicle).
   - Witness signature W-1: Ink absorbs IR completely (Gel pen carbon black).
   - Line intersection analysis reveals Signature Q-1 was executed AFTER the typing of the text.

3. MICROSCOPIC HANDWRITING CHARACTERISTICS:
   - Tremors of hesitation observed in capital letter loops 'M' and 'R'.
   - Unnatural pen lifts at non-junction points.
   - Blunt starting and terminating stroke points consistent with simulated tracing.`
  );

  await prisma.document.create({
    data: {
      caseId: case4.id,
      evidenceId: ev7.id,
      originalFilename: fileDoc4.originalFilename,
      storedFilename: fileDoc4.storedFilename,
      mimeType: 'text/plain',
      fileSize: fileDoc4.size,
      sha256Hash: fileDoc4.hash,
      uploadedById: fexOfficer.id,
    },
  });

  const c4ReportContent = {
    evidenceExamined:
      'Questioned Signature Q-1 on Disputed Will (EV-007) and 12 Standard Signatures S-1 to S-12 (EV-008).',
    examinationMethod:
      'Non-destructive optical inspection using Foster+Freeman VSC 8000, stereomicroscopic stroke direction analysis, and handwriting biometric ratio measurement.',
    observations:
      'The questioned signature exhibits fundamental disparities in slant, rhythm, line quality, and speed when compared to the natural admitted handwriting of the deceased.',
    findings:
      'Microscopic examination established simulated freehand forgery with visible pencil guide trace remnants beneath the ink under infrared light. Line quality indicates slow, drawing-like pen movement rather than spontaneous execution.',
    conclusion:
      'The questioned signature Q-1 on the disputed will was not executed by Sh. M. S. Rao. It represents a simulated forgery manufactured by an unauthorized person.',
  };

  const c4Hash = calculateReportHash(c4ReportContent);
  const rep4Date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const rep4Sig = sha256(`${c4Hash}|${fexOfficer.badgeId}|${fexOfficer.name}|${rep4Date.toISOString()}`);

  const report4 = await prisma.report.create({
    data: {
      id: 'REP-2026-00219',
      caseId: case4.id,
      title: 'Questioned Document & Signature Forgery Forensic Examination Report',
      currentVersion: 1,
      status: 'FINALIZED',
      authorId: fexOfficer.id,
    },
  });

  await prisma.reportVersion.create({
    data: {
      reportId: report4.id,
      versionNumber: 1,
      evidenceExamined: c4ReportContent.evidenceExamined,
      examinationMethod: c4ReportContent.examinationMethod,
      observations: c4ReportContent.observations,
      findings: c4ReportContent.findings,
      conclusion: c4ReportContent.conclusion,
      sha256Hash: c4Hash,
      authorId: fexOfficer.id,
      isFinalized: true,
      finalizedAt: rep4Date,
      signedByName: fexOfficer.name,
      signedById: fexOfficer.badgeId,
      signedByDesignation: fexOfficer.designation,
      signatureTimestamp: rep4Date,
      signatureHash: rep4Sig,
      createdAt: rep4Date,
    },
  });

  // ==========================================
  // CASE 5: DNA STR PROFILING & HIT-AND-RUN
  // ==========================================
  const case5 = await prisma.case.create({
    data: {
      id: 'UP-FOR-2026-00512',
      firNumber: 'FIR-205/2026/CRIME',
      title: 'State v. Yamuna Expressway Hit-and-Run Homicide & 24-Locus STR DNA Profile Matching',
      description:
        'Extraction and STR amplification of blood spatter recovered from vehicle front bumper and wheel rim. Comparison against victim reference profile to confirm collision impact identity.',
      category: 'DNA Forensics & Biological Serology',
      policeUnit: 'Highway Patrol Division & Special Investigation Team (SIT)',
      forensicUnit: 'CFSL DNA Profiling & Molecular Biology Laboratory',
      status: 'REPORT_FILED',
      priority: 'CRITICAL',
      assignedOfficerId: fexOfficer.id,
      createdById: policeOfficer.id,
    },
  });

  const ev9Hash = sha256('EV-009|UP-FOR-2026-00512|Bloodstained Sterile Cotton Swab from SUV Fender|SI V. Yadav');
  const ev9 = await prisma.evidence.create({
    data: {
      id: 'EV-009',
      caseId: case5.id,
      evidenceType: 'Biological Sample (Bloodstain Swab from Vehicle Bumper)',
      description:
        'Sterile Dacron swab with dark brown bloodstain lifted from right front wheel arch of seized Toyota Fortuner (UP-16-AX-8900).',
      collectionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      collectorName: 'Sub-Inspector V. Yadav (SIT Highway)',
      initialCondition: 'Air-dried, packaged in sterile breathable paper envelope #DNA-UP-205',
      currentCustodian: 'CFSL DNA Division Vault',
      currentStatus: 'SECURE_VAULT',
      storageLocation: 'DNA Specimen Deep Freezer DF-02 (-20°C)',
      sha256Hash: ev9Hash,
    },
  });

  const ev10Hash = sha256('EV-010|UP-FOR-2026-00512|Buccal Swab Reference Profile Sample of Victim|Dr. A. Rastogi');
  const ev10 = await prisma.evidence.create({
    data: {
      id: 'EV-010',
      caseId: case5.id,
      evidenceType: 'Reference Biological Sample (Victim Buccal Swab)',
      description:
        'Reference buccal cell swab collected during post-mortem examination of deceased Sh. R. K. Mittal at District Hospital Mortuary.',
      collectionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      collectorName: 'Dr. A. Rastogi (Forensic Pathologist)',
      initialCondition: 'Sealed in sterile specimen tube with silica desiccant',
      currentCustodian: 'CFSL DNA Division Vault',
      currentStatus: 'SECURE_VAULT',
      storageLocation: 'DNA Reference Archive R-05',
      sha256Hash: ev10Hash,
    },
  });

  // Transfers for Case 5
  await prisma.evidenceTransfer.createMany({
    data: [
      {
        evidenceId: ev9.id,
        fromParty: 'Yamuna Expressway SIT Crime Scene Unit',
        toParty: 'CFSL Central Reception',
        transferredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        purpose: 'Transit of biological swabs under cold chain protocol',
        action: 'SEIZURE_AND_ENTRY',
        status: 'ACKNOWLEDGED',
        notes: 'Packaging intact, barcode #DNA-UP-205 verified',
        responsibleOfficerId: policeOfficer.id,
      },
      {
        evidenceId: ev9.id,
        fromParty: 'CFSL Central Reception',
        toParty: 'DNA Division Expert (Dr. Abhiraj Singh)',
        transferredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        purpose: 'Chelex DNA extraction and GlobalFiler PCR amplification',
        action: 'LAB_RECEIPT_AND_LOG',
        status: 'ACKNOWLEDGED',
        notes: 'Quantifiler Trio quantification yielded 0.84 ng/uL human DNA',
        responsibleOfficerId: fexOfficer.id,
      },
    ],
  });

  const fileDoc5 = createForensicFile(
    'ABI_3500xl_24_Locus_STR_Electropherogram_Report.txt',
    `CFSL DNA PROFILING & SEROLOGY LABORATORY
CASE: UP-FOR-2026-00512 | FIR-205/2026/CRIME
ANALYZER: Applied Biosystems 3500xl Genetic Analyzer (24-Capillary Array)
KIT: GlobalFiler Express 24-Locus STR PCR Amplification Kit

STR LOCI PROFILE COMPARISON (Exhibit B-1 vs. Reference R-1):
----------------------------------------------------------------------
LOCUS        EXHIBIT B-1 (Vehicle Blood)     EXHIBIT R-1 (Victim Reference)
----------------------------------------------------------------------
D3S1358      15, 17                         15, 17             [MATCH]
vWA          16, 18                         16, 18             [MATCH]
D16S539      11, 12                         11, 12             [MATCH]
CSF1PO       10, 11                         10, 11             [MATCH]
TPOX         8, 11                          8, 11              [MATCH]
TH01         6, 9.3                         6, 9.3             [MATCH]
D8S1179      13, 14                         13, 14             [MATCH]
D21S11       29, 31.2                       29, 31.2           [MATCH]
D18S51       14, 19                         14, 19             [MATCH]
Penta E      12, 14                         12, 14             [MATCH]
D5S818       11, 13                         11, 13             [MATCH]
D13S317      9, 11                          9, 11              [MATCH]
D7S820       10, 12                         10, 12             [MATCH]
AMELOGENIN   X, Y                           X, Y               [MATCH - MALE]
----------------------------------------------------------------------

STATISTICAL PROBABILITY:
Random Match Probability (RMP): 1 in 4.82 x 10^17 in the Indian population.
Likelihood Ratio (LR): Exceeds 10 Billion in favor of source identity.`
  );

  await prisma.document.create({
    data: {
      caseId: case5.id,
      evidenceId: ev9.id,
      originalFilename: fileDoc5.originalFilename,
      storedFilename: fileDoc5.storedFilename,
      mimeType: 'text/plain',
      fileSize: fileDoc5.size,
      sha256Hash: fileDoc5.hash,
      uploadedById: fexOfficer.id,
    },
  });

  const c5ReportContent = {
    evidenceExamined:
      'Exhibit B-1: Bloodstain swab from vehicle bumper (EV-009). Exhibit R-1: Victim reference buccal sample (EV-010).',
    examinationMethod:
      'Organic Chelex-100 extraction, Quantifiler Trio quantification, 24-locus GlobalFiler PCR amplification, and capillary electrophoresis on ABI 3500xl.',
    observations:
      'Pristine, non-degraded high-molecular-weight DNA extracted from vehicle swab with peak heights exceeding 1500 RFU across all 24 STR loci.',
    findings:
      'Complete 24-locus STR allelic concordance observed between the bloodstain lifted from the suspect vehicle and the reference DNA of the deceased.',
    conclusion:
      'The biological bloodstain found on the seized vehicle originated from the deceased Sh. R. K. Mittal. The probability of an unrelated individual sharing this profile is 1 in 480 quadrillion.',
  };

  const c5Hash = calculateReportHash(c5ReportContent);
  const rep5Date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const rep5Sig = sha256(`${c5Hash}|${fexOfficer.badgeId}|${fexOfficer.name}|${rep5Date.toISOString()}`);

  const report5 = await prisma.report.create({
    data: {
      id: 'REP-2026-00512',
      caseId: case5.id,
      title: 'DNA Profiling & 24-Locus STR Source Attribution Forensic Report',
      currentVersion: 1,
      status: 'FINALIZED',
      authorId: fexOfficer.id,
    },
  });

  await prisma.reportVersion.create({
    data: {
      reportId: report5.id,
      versionNumber: 1,
      evidenceExamined: c5ReportContent.evidenceExamined,
      examinationMethod: c5ReportContent.examinationMethod,
      observations: c5ReportContent.observations,
      findings: c5ReportContent.findings,
      conclusion: c5ReportContent.conclusion,
      sha256Hash: c5Hash,
      authorId: fexOfficer.id,
      isFinalized: true,
      finalizedAt: rep5Date,
      signedByName: fexOfficer.name,
      signedById: fexOfficer.badgeId,
      signedByDesignation: fexOfficer.designation,
      signatureTimestamp: rep5Date,
      signatureHash: rep5Sig,
      createdAt: rep5Date,
    },
  });

  // ==========================================
  // CASE 6: TRANSNATIONAL GOLD SMUGGLING & MOBILE EXTRACTION
  // ==========================================
  const case6 = await prisma.case.create({
    data: {
      id: 'TN-FOR-2026-00408',
      firNumber: 'FIR-561/2026/CYBER-EXP',
      title: 'State v. Transnational Gold Smuggling Syndicate & Encrypted Mobile Extraction',
      description:
        'Physical acquisition and cryptographic extraction of seized encrypted smartphones and disguised micro-storage media seized from international transit courier at Airport Customs.',
      category: 'Digital Forensics & Mobile Extraction',
      policeUnit: 'Air Intelligence Unit (AIU) & State Cyber Command',
      forensicUnit: 'SFSL Mobile Device Forensic Analysis Unit',
      status: 'REGISTERED',
      priority: 'HIGH',
      assignedOfficerId: fexOfficer.id,
      createdById: policeOfficer.id,
    },
  });

  const ev11Hash = sha256('EV-011|TN-FOR-2026-00408|Apple iPhone 15 Pro Titanium in Faraday Bag|Insp S. Murugan');
  const ev11 = await prisma.evidence.create({
    data: {
      id: 'EV-011',
      caseId: case6.id,
      evidenceType: 'Smartphone (Apple iPhone 15 Pro 256GB Titanium)',
      description:
        'Apple iPhone 15 Pro (Model A3102, IMEI: 359128091823102). Secured in RF-shielded Faraday pouch with SIM card removed.',
      collectionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      collectorName: 'Inspector S. Murugan (AIU Cyber)',
      initialCondition: 'Device powered on in Airplane Mode, passcode locked (6-digit alphanumeric)',
      currentCustodian: 'Dr. Abhiraj Singh (FEX-1024)',
      currentStatus: 'IN_EXAMINATION',
      storageLocation: 'Mobile Extraction Lab Faraday Enclosure 01',
      sha256Hash: ev11Hash,
    },
  });

  const ev12Hash = sha256('EV-012|TN-FOR-2026-00408|SanDisk Extreme 1TB MicroSD Card in False Sole|Insp S. Murugan');
  const ev12 = await prisma.evidence.create({
    data: {
      id: 'EV-012',
      caseId: case6.id,
      evidenceType: 'Micro-Storage Media (SanDisk Extreme 1TB MicroSD Card)',
      description:
        'SanDisk Extreme PRO 1TB MicroSDXC UHS-I Card recovered from concealed compartment in shoe sole.',
      collectionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      collectorName: 'Inspector S. Murugan (AIU Cyber)',
      initialCondition: 'Intact, physical pins undamaged, formatted with exFAT file system',
      currentCustodian: 'Secure Storage Vault Supervisor',
      currentStatus: 'SECURE_VAULT',
      storageLocation: 'Digital Evidence Vault Bay 07',
      sha256Hash: ev12Hash,
    },
  });

  // Transfers for Case 6
  await prisma.evidenceTransfer.createMany({
    data: [
      {
        evidenceId: ev11.id,
        fromParty: 'Air Intelligence Unit Customs Interception',
        toParty: 'SFSL Mobile Forensic Reception',
        transferredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        purpose: 'Handover of seized mobile communications equipment in Faraday bag',
        action: 'SEIZURE_AND_ENTRY',
        status: 'ACKNOWLEDGED',
        notes: 'Signal isolation confirmed (0 dBm RF transmission)',
        responsibleOfficerId: policeOfficer.id,
      },
      {
        evidenceId: ev11.id,
        fromParty: 'SFSL Mobile Forensic Reception',
        toParty: 'Digital Forensics Specialist (Dr. Abhiraj Singh)',
        transferredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        purpose: 'Cellebrite UFED Premium Advanced Logical & Full File System extraction',
        action: 'LAB_RECEIPT_AND_LOG',
        status: 'ACKNOWLEDGED',
        notes: 'Extraction workstation connected via write-blocking USB isolator',
        responsibleOfficerId: fexOfficer.id,
      },
    ],
  });

  const fileDoc6 = createForensicFile(
    'Cellebrite_UFED_Physical_Extraction_Certificate_Sec65B.txt',
    `FORENSIC MOBILE ACQUISITION CERTIFICATE (UNDER SEC 65B IEA / SEC 63 BSA)
CASE: TN-FOR-2026-00408 | FIR-561/2026/CYBER-EXP
AGENCY: State Cyber Forensics Command & Customs AIU
TOOL: Cellebrite UFED 4PC v7.68 / Physical Analyzer Enterprise

DEVICE ACQUISITION SUMMARY:
- Device Model: Apple iPhone 15 Pro (A3102)
- iOS Version: 17.5.1
- Unique Device Identifier (UDID): 00008130-001E58E23401001C
- Extraction Type: Advanced Full File System (FFS) & Keychain Decryption
- Extraction Hash (SHA-256): 9a1e8c0490b4e2f9d8a1c72098b1e4a5f63d0298e1b2c3d4e5f60718293a4b5c

EXTRACTED DIGITAL ARTIFACTS:
1. Instant Messaging Databases:
   - Recovered 1,842 deleted WhatsApp messages discussing consignment weights (24-karat gold bullion)
   - 4 Telegram secret chat channels with offshore coordination numbers (+971-50-xxx, +65-81-xxx)
2. Geolocation & EXIF Metadata:
   - 34 geo-tagged photographs locating transit drop-off points in Chennai harbour area
3. Cryptographic Wallets:
   - 12-word mnemonic recovery phrase found in encrypted SQLite notes database

CERTIFICATION:
The digital data was extracted in a controlled cleanroom environment without any alteration to source storage.`
  );

  await prisma.document.create({
    data: {
      caseId: case6.id,
      evidenceId: ev11.id,
      originalFilename: fileDoc6.originalFilename,
      storedFilename: fileDoc6.storedFilename,
      mimeType: 'text/plain',
      fileSize: fileDoc6.size,
      sha256Hash: fileDoc6.hash,
      uploadedById: fexOfficer.id,
    },
  });

  const c6ReportContent = {
    evidenceExamined:
      'Exhibit M-1: Apple iPhone 15 Pro 256GB (EV-011). Exhibit S-1: SanDisk Extreme 1TB MicroSD (EV-012).',
    examinationMethod:
      'Cellebrite UFED Premium Full File System physical extraction, SQLite relational carving, and timeline reconstruction per NIST SP 800-101 Guidelines.',
    observations:
      'The handset contained automated ephemeral message deletion scripts designed to erase messaging databases every 24 hours. Physical acquisition recovered unallocated WAL (Write-Ahead Log) pages.',
    findings:
      'Decrypted chat transcripts and geocoded photographic exhibits identify active communication with overseas gold consignors, flight manifest distribution lists, and Hawala settlement transaction ledgers.',
    conclusion:
      'The recovered mobile device artifacts establish direct operational participation in organized international bullion smuggling and unauthorized foreign exchange movements.',
  };

  const c6Hash = calculateReportHash(c6ReportContent);
  const rep6Date = new Date();
  const rep6Sig = sha256(`${c6Hash}|${fexOfficer.badgeId}|${fexOfficer.name}|${rep6Date.toISOString()}`);

  const report6 = await prisma.report.create({
    data: {
      id: 'REP-2026-00408',
      caseId: case6.id,
      title: 'Mobile Communication Forensics & Decrypted Syndicate Evidence Report',
      currentVersion: 1,
      status: 'FINALIZED',
      authorId: fexOfficer.id,
    },
  });

  await prisma.reportVersion.create({
    data: {
      reportId: report6.id,
      versionNumber: 1,
      evidenceExamined: c6ReportContent.evidenceExamined,
      examinationMethod: c6ReportContent.examinationMethod,
      observations: c6ReportContent.observations,
      findings: c6ReportContent.findings,
      conclusion: c6ReportContent.conclusion,
      sha256Hash: c6Hash,
      authorId: fexOfficer.id,
      isFinalized: true,
      finalizedAt: rep6Date,
      signedByName: fexOfficer.name,
      signedById: fexOfficer.badgeId,
      signedByDesignation: fexOfficer.designation,
      signatureTimestamp: rep6Date,
      signatureHash: rep6Sig,
      createdAt: rep6Date,
    },
  });

  // ==========================================
  // AUDIT TRAIL CONSTRUCTION
  // ==========================================
  console.log('[SEED] Building cryptographically chained audit trail across all cases...');
  const auditEntries = [
    {
      action: 'SYSTEM_GENESIS',
      user: adminUser,
      resourceType: 'FORENSIC_KERNEL',
      resourceId: 'FORIS-CORE-v2.0',
      reason: 'Cryptographic genesis state established with root certificate anchor',
      time: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'USER_REGISTERED',
      user: adminUser,
      resourceType: 'USER_CREDENTIAL',
      resourceId: fexOfficer.badgeId,
      reason: 'Officer onboarding and cryptographic identity provisioning for Dr. Abhiraj Singh',
      time: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'USER_REGISTERED',
      user: adminUser,
      resourceType: 'USER_CREDENTIAL',
      resourceId: policeOfficer.badgeId,
      reason: 'Police investigator credential activation for ACP Vikram Rathore',
      time: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'LOGIN_SUCCESS',
      user: policeOfficer,
      resourceType: 'AUTHENTICATION_GATEWAY',
      resourceId: policeOfficer.badgeId,
      reason: 'Duty shift authentication verified via Biometric FaceID & Master Key',
      time: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'CASE_CREATED',
      user: policeOfficer,
      resourceType: 'CASE_RECORD',
      resourceId: case4.id,
      caseId: case4.id,
      reason: 'Questioned document forgery FIR registered in State EOW ledger',
      time: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'CASE_CREATED',
      user: policeOfficer,
      resourceType: 'CASE_RECORD',
      resourceId: case2.id,
      caseId: case2.id,
      reason: 'Bank van ambush case registered with Special Task Force',
      time: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'EVIDENCE_REGISTERED',
      user: policeOfficer,
      resourceType: 'EVIDENCE_ITEM',
      resourceId: ev3.id,
      caseId: case2.id,
      reason: '9mm spent cartridge casing registered into evidence locker',
      time: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'CASE_CREATED',
      user: policeOfficer,
      resourceType: 'CASE_RECORD',
      resourceId: case5.id,
      caseId: case5.id,
      reason: 'Yamuna Expressway homicide FIR registered',
      time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'EVIDENCE_REGISTERED',
      user: policeOfficer,
      resourceType: 'EVIDENCE_ITEM',
      resourceId: ev9.id,
      caseId: case5.id,
      reason: 'Bumper blood swab sealed with barcode #DNA-UP-205',
      time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'CASE_CREATED',
      user: policeOfficer,
      resourceType: 'CASE_RECORD',
      resourceId: case1.id,
      caseId: case1.id,
      reason: 'Cyber intrusion case registered by Cyber Crime Division',
      time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'EVIDENCE_REGISTERED',
      user: fexOfficer,
      resourceType: 'EVIDENCE_ITEM',
      resourceId: ev1.id,
      caseId: case1.id,
      reason: 'Samsung 990 Pro NVMe logged with SHA-256 seal',
      time: t1_1,
    },
    {
      action: 'EVIDENCE_TRANSFERRED',
      user: fexOfficer,
      resourceType: 'CHAIN_OF_CUSTODY_TRANSFER',
      resourceId: ev1.id,
      caseId: case1.id,
      reason: 'Chain of custody transfer: Malkhana -> SFSL cleanroom',
      time: t1_4,
    },
    {
      action: 'REPORT_SIGNED',
      user: fexOfficer,
      resourceType: 'REPORT_VERSION',
      resourceId: `${report5.id}-V1`,
      caseId: case5.id,
      reason: 'DNA examiner formal digital attestation and finalization of 24-locus STR report',
      time: rep5Date,
    },
    {
      action: 'REPORT_SIGNED',
      user: fexOfficer,
      resourceType: 'REPORT_VERSION',
      resourceId: `${report2.id}-V1`,
      caseId: case2.id,
      reason: 'Ballistics specialist digital signing of striation match certificate',
      time: rep2Date,
    },
    {
      action: 'CASE_CREATED',
      user: policeOfficer,
      resourceType: 'CASE_RECORD',
      resourceId: case3.id,
      caseId: case3.id,
      reason: 'Suspicious poisoning FIR registered by Crime Branch Unit 09',
      time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'REPORT_SIGNED',
      user: fexOfficer,
      resourceType: 'REPORT_VERSION',
      resourceId: `${report1.id}-V1`,
      caseId: case1.id,
      reason: 'Forensic examiner formal digital attestation of Cyber Intrusion findings',
      time: rep1Date,
    },
    {
      action: 'CASE_CREATED',
      user: policeOfficer,
      resourceType: 'CASE_RECORD',
      resourceId: case6.id,
      caseId: case6.id,
      reason: 'Airport gold smuggling mobile seizure FIR registered',
      time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'REPORT_SIGNED',
      user: fexOfficer,
      resourceType: 'REPORT_VERSION',
      resourceId: `${report3.id}-V1`,
      caseId: case3.id,
      reason: 'Toxicology specialist formal signing of Cyanide determination report',
      time: rep3Date,
    },
    {
      action: 'REPORT_SIGNED',
      user: fexOfficer,
      resourceType: 'REPORT_VERSION',
      resourceId: `${report6.id}-V1`,
      caseId: case6.id,
      reason: 'Mobile forensics specialist signing of Cellebrite extraction findings',
      time: rep6Date,
    },
    {
      action: 'INTEGRITY_CHECK',
      user: fexOfficer,
      resourceType: 'FORENSIC_LEDGER',
      resourceId: 'FORIS-ALL-CASES',
      reason: 'Routine pre-submission cryptographic integrity verification across all 6 cases',
      time: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  ];

  let prevHash = GENESIS_AUDIT_HASH;
  for (let i = 0; i < auditEntries.length; i++) {
    const entry = auditEntries[i];
    const seq = i + 1;
    const currentAuditHash = calculateAuditHash({
      sequenceIndex: seq,
      timestamp: entry.time,
      userId: entry.user.id,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      previousAuditHash: prevHash,
    });

    await prisma.auditEvent.create({
      data: {
        sequenceIndex: seq,
        timestamp: entry.time,
        userId: entry.user.id,
        userBadge: entry.user.badgeId,
        userName: entry.user.name,
        role: entry.user.role,
        action: entry.action,
        caseId: entry.caseId || null,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        reason: entry.reason,
        result: 'SUCCESS',
        severity: 'INFO',
        ipAddress: '127.0.0.1',
        previousAuditHash: prevHash,
        currentAuditHash,
      },
    });

    prevHash = currentAuditHash;
  }

  console.log('[SEED] Creating sample security monitoring alerts...');
  await prisma.securityEvent.createMany({
    data: [
      {
        eventType: 'SUSPICIOUS_REMOTE_LOGIN_ATTEMPT',
        severity: 'MEDIUM',
        title: 'Unrecognized IP Range Detected during Authentication Probe',
        description: 'Authentication probe received from 198.51.100.42 targeting badge [FEX-1024]. Blocked by perimeter rate-limiter.',
        userBadge: 'FEX-1024',
        ipAddress: '198.51.100.42',
        status: 'RESOLVED',
        resolvedBy: 'Dr. Ananya Sen [ADMIN-001]',
        resolutionNotes: 'Confirmed external port scan blocked by network firewall.',
      },
      {
        eventType: 'SYSTEM_POSTURE_CHECK',
        severity: 'LOW',
        title: 'Cryptographic Subsystem Integrity Verification Passed',
        description: 'Automated daemon completed full verification of audit hash chain and stored report signatures. 100% integrity confirmed across all 6 forensic cases.',
        status: 'RESOLVED',
        resolvedBy: 'Automated System Monitor',
        resolutionNotes: 'Chain valid from genesis.',
      },
    ],
  });

  console.log('[SEED] Real-Life Cases Dataset seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('DEMO CREDENTIALS (Password for all: {123FORIS@)');
  console.log('1. Forensic Officer:       FEX-1024');
  console.log('2. Senior Police Officer:  SPO-2048');
  console.log('3. Judge (READ-ONLY):      JDG-3012');
  console.log('4. Forensic Administrator: ADMIN-001');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('[SEED ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

