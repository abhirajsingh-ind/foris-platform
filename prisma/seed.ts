import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { calculateReportHash, calculateAuditHash, sha256, GENESIS_AUDIT_HASH } from '../server/utils/crypto';

const prisma = new PrismaClient();

// CRC32 implementation for pure Node PNG generation
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const c = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(c, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Generate valid, visually distinct forensic crime scene photos in PNG format
function generateForensicPng(
  filename: string,
  category: string,
  markerNumber: number = 1
): { storedFilename: string; originalFilename: string; size: number; hash: string } {
  const uploadDir = path.resolve(process.cwd(), './uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const width = 640;
  const height = 440;
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(2, 9); // RGB color
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = pngChunk('IHDR', ihdr);

  // Determine category color accents
  let accentR = 16, accentG = 185, accentB = 129; // Emerald default
  if (category.includes('Cyber') || category.includes('Digital')) {
    accentR = 14; accentG = 165; accentB = 233; // Cyan
  } else if (category.includes('Ballistic') || category.includes('Weapon')) {
    accentR = 239; accentG = 68; accentB = 68; // Red/Crimson
  } else if (category.includes('Toxic') || category.includes('Narcotic') || category.includes('Poison')) {
    accentR = 168; accentG = 85; accentB = 247; // Purple
  } else if (category.includes('Document') || category.includes('Deed')) {
    accentR = 245; accentG = 158; accentB = 11; // Amber
  } else if (category.includes('DNA') || category.includes('Blood')) {
    accentR = 236; accentG = 72; accentB = 153; // Pink
  } else if (category.includes('Arson') || category.includes('Explosive')) {
    accentR = 234; accentG = 88; accentB = 12; // Orange
  }

  const rawData = Buffer.alloc(height * (width * 3 + 1));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData.writeUInt8(0, offset++); // Filter: None
    for (let x = 0; x < width; x++) {
      // Outer border
      const isOuterBorder = x < 5 || x >= width - 5 || y < 5 || y >= height - 5;
      // Inner framing
      const isInnerBorder = (x >= 12 && x <= 14) || (x >= width - 15 && x <= width - 13) ||
                            (y >= 12 && y <= 14) || (y >= height - 15 && y <= height - 13);
      // Metric ruler marks along top and left edges
      const isRulerTickTop = y >= 5 && y <= 12 && (x % 20 < 2);
      const isRulerTickLeft = x >= 5 && x <= 12 && (y % 20 < 2);
      // Yellow evidence tent marker in top-left
      const isTentMarker = (x >= 35 && x <= 75 && y >= 35 && y <= 75);
      // Center exhibit focal box
      const isFocalBox = (x >= 120 && x <= width - 120 && y >= 90 && y <= height - 90);
      const isFocalBorder = isFocalBox && (x <= 122 || x >= width - 122 || y <= 92 || y >= height - 92);
      // Center crosshair
      const isCrosshair = isFocalBox && (Math.abs(x - width / 2) < 1 || Math.abs(y - height / 2) < 1);

      if (isOuterBorder) {
        rawData.writeUInt8(accentR, offset++);
        rawData.writeUInt8(accentG, offset++);
        rawData.writeUInt8(accentB, offset++);
      } else if (isRulerTickTop || isRulerTickLeft) {
        rawData.writeUInt8(255, offset++);
        rawData.writeUInt8(255, offset++);
        rawData.writeUInt8(255, offset++);
      } else if (isTentMarker) {
        rawData.writeUInt8(245, offset++); // Bright yellow evidence tent
        rawData.writeUInt8(158, offset++);
        rawData.writeUInt8(11, offset++);
      } else if (isInnerBorder || isFocalBorder) {
        rawData.writeUInt8(accentR, offset++);
        rawData.writeUInt8(accentG, offset++);
        rawData.writeUInt8(accentB, offset++);
      } else if (isCrosshair) {
        rawData.writeUInt8(100, offset++);
        rawData.writeUInt8(140, offset++);
        rawData.writeUInt8(180, offset++);
      } else if (isFocalBox) {
        // Subtle texture inside exhibit window
        const darkPattern = Math.floor(18 + ((x * y) % 15));
        rawData.writeUInt8(darkPattern, offset++);
        rawData.writeUInt8(darkPattern + 4, offset++);
        rawData.writeUInt8(darkPattern + 12, offset++);
      } else {
        // Deep background gradient
        const base = Math.floor(10 + (y / height) * 15);
        rawData.writeUInt8(base, offset++);
        rawData.writeUInt8(base + 2, offset++);
        rawData.writeUInt8(base + 8, offset++);
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = pngChunk('IDAT', compressed);
  const iendChunk = pngChunk('IEND', Buffer.alloc(0));

  const pngBuffer = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  const safeFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = path.join(uploadDir, safeFilename);

  fs.writeFileSync(filePath, pngBuffer);
  const hash = sha256(pngBuffer);

  return { storedFilename: safeFilename, originalFilename: filename, size: pngBuffer.length, hash };
}

async function main() {
  console.log('[EXPANDED SEED] Resetting database records...');
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

  console.log('[EXPANDED SEED] Creating users...');
  const passwordHash = await bcrypt.hash('{123FORIS@', 10);

  const fexOfficer = await prisma.user.create({
    data: {
      badgeId: 'FEX-1024',
      name: 'Dr. Abhiraj Singh',
      email: 'abhirajsingh0904@gmail.com',
      passwordHash,
      role: 'FORENSIC_OFFICER',
      designation: 'Chief Forensic Scientist & Technical Director',
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
      department: 'Special Crime Investigation Branch',
    },
  });

  const judgeUser = await prisma.user.create({
    data: {
      badgeId: 'JDG-3012',
      name: 'Hon. Justice Manisha Sharma',
      email: 'judge3012@judiciary.gov.in',
      passwordHash,
      role: 'JUDGE',
      designation: 'Presiding Judge, Special Forensic & Sessions Court',
      department: 'High Court Special Bench 04',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      badgeId: 'ADMIN-001',
      name: 'Dr. Ananya Sen',
      email: 'admin@foris.gov.in',
      passwordHash,
      role: 'ADMINISTRATOR',
      designation: 'Director of Forensic Quality Assurance & Cryptography',
      department: 'Forensic Oversight Directorate',
    },
  });

  // 18 Comprehensive Cases Definitions
  const caseDefinitions = [
    {
      id: 'MP-FOR-2026-00125',
      firNumber: 'FIR-892/2026/CYBER',
      title: 'State v. Financial Infrastructure Cyber Intrusion & Ransomware Attack',
      description: 'Zero-day privilege escalation, Active Directory compromised ticket extraction, and exfiltration targeting state financial server infrastructure.',
      category: 'Digital Evidence & Cyber Intrusion',
      policeUnit: 'Cyber Crime Investigation Division',
      forensicUnit: 'SFSL Digital Forensics Laboratory',
      priority: 'CRITICAL',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-001', type: 'Encrypted 2TB NVMe M.2 SSD', desc: 'Samsung 990 Pro 2TB (S/N: S6X4NS0X192834) from primary domain controller server rack.', location: 'Forensic Cleanroom Station 02', status: 'IN_EXAMINATION' },
        { id: 'EV-002', type: 'Hardware Security Key (YubiKey 5 NFC)', desc: 'Black YubiKey 5 NFC (Serial: 2490182) recovered at perimeter access point.', location: 'High Security Safe B-14', status: 'SECURE_VAULT' },
        { id: 'EV-003', type: 'Cisco Core Router Memory Dump USB', desc: 'Kingston 64GB USB with volatile running memory captured during active packet egress.', location: 'Vault Locker A-01', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Crime_Scene_Server_Rack_Exfiltration.png',
        'Forensic_Acquisition_NVMe_Drive.png',
        'Memory_Dump_Terminal_Evidence.png',
      ],
      report: {
        id: 'REP-2026-00125',
        title: 'Digital Forensic Bit-Stream Extraction & Cobalt Strike Analysis Report',
        obs: 'Bit-stream image verified with SHA-256. Windows Server 2022 NTFS partition analyzed. Kerberos ticket-granting ticket request granted to unauthorized service account.',
        findings: 'Recovered 14 compressed .tar.gz archives containing SQL fragments and active session tokens. Cobalt Strike beacon identified with outbound C2 IP 185.220.101.5.',
        conclusion: 'Conclusive evidence of targeted APT intrusion. Acquired image integrity verified admissible under Sec 65B Indian Evidence Act / Sec 63 BSA.',
      },
    },
    {
      id: 'DL-FOR-2026-00094',
      firNumber: 'FIR-412/2026/BALLISTICS',
      title: 'State v. Central Bank Cash Van Armed Ambush & Ballistic Striation Comparison',
      description: 'Highway cash-in-transit armored vehicle ambush. Multiple 9mm rounds fired into windshield and door panels. Comparison against seized firearms.',
      category: 'Ballistics & Toolmarks',
      policeUnit: 'Special Task Force (STF) Counter-Crime Unit',
      forensicUnit: 'Central FSL Ballistics Division',
      priority: 'HIGH',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-004', type: '9x19mm Parabellum Spent Cartridge Casing', desc: 'Brass cartridge casing with circular firing pin indentation from vehicle hood.', location: 'Ballistics Secure Armory Locker 03', status: 'IN_EXAMINATION' },
        { id: 'EV-005', type: 'Deformed Copper-Jacketed 9mm Projectile', desc: 'Mushroomed bullet core extracted from reinforced driver windshield A-pillar.', location: 'Ballistics Vault Safe B-02', status: 'SECURE_VAULT' },
        { id: 'EV-006', type: 'Glock 19 Gen 5 Semi-Automatic Firearm', desc: 'Seized Glock 19 9mm pistol (S/N: GLK-98214) with loaded 15-round magazine.', location: 'Armory Firearms Vault Locker 08', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Bullet_Impact_Windshield_Macro.png',
        'Spent_Cartridge_Comparison_Microscope.png',
        'Seized_Glock19_Recovery_Bag.png',
      ],
      report: {
        id: 'REP-2026-00094',
        title: 'Comparison Microscopy & Ballistic Striation Match Attestation',
        obs: 'Microscopic examination of 6 right-hand lands and grooves. Breech face mark striations aligned under 40x comparison microscopy.',
        findings: 'Firing pin drag mark and extractor hook impression on EV-004 exhibit identical micro-features to test rounds fired from seized Glock 19 (EV-006).',
        conclusion: 'Confirmed positive match to the exclusion of all other weapons. Firearm was in working order at the time of discharge.',
      },
    },
    {
      id: 'MH-FOR-2026-00388',
      firNumber: 'FIR-109/2026/TOXICOLOGY',
      title: 'State v. Industrial Chemical Facility Cyanide Water Contamination',
      description: 'Acute toxic exposure incident at municipal downstream water canal. Analysis of industrial effluents and organ tissue specimens.',
      category: 'Toxicology & Chemical Narcotics',
      policeUnit: 'Environmental Crimes & Safety Unit',
      forensicUnit: 'SFSL Chemical Analysis Division',
      priority: 'CRITICAL',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-007', type: 'Sealed Viscera Sample Container #T-88', desc: 'Formalin-free liver and stomach contents sealed with tamper-evident red wax seal.', location: 'Cold Storage Refrigerator -20°C Unit 02', status: 'IN_EXAMINATION' },
        { id: 'EV-008', type: 'Downstream Effluent Water Sample Glass Flask', desc: '2.5L amber borosilicate flask collected 200m from primary discharge drain.', location: 'Chemical Vault Shelf C-04', status: 'SECURE_VAULT' },
        { id: 'EV-009', type: 'Industrial Sodium Cyanide Storage Bag', desc: '25kg burlap sack with industrial chemical supplier lot #CN-2025-99.', location: 'Hazardous Chemical Containment Locker', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Toxicology_Sealed_Viscera_Sample.png',
        'GC_MS_Chromatography_Peak_Analysis.png',
        'Chemical_Reagent_Testing_Vials.png',
      ],
      report: {
        id: 'REP-2026-00388',
        title: 'Gas Chromatography-Mass Spectrometry (GC-MS) Toxicological Report',
        obs: 'Microdiffusion test followed by GC-MS analysis of headspace volatile fractions and cyanomethemoglobin spectrophotometry.',
        findings: 'Potassium and sodium cyanide detected in lethal concentration of 3.8 mg/L in visceral homogenate. Canal water showed 14.2 ppm free cyanide.',
        conclusion: 'Cause of acute toxicity established as fatal cyanide poisoning resulting from unauthorized industrial discharge.',
      },
    },
    {
      id: 'KA-FOR-2026-00210',
      firNumber: 'FIR-301/2026/DOC',
      title: 'State v. Prime Commercial Land Forged Power of Attorney & Stamp Paper',
      description: 'Alleged fraudulent transfer of 18-acre prime IT corridor commercial real estate using forged non-judicial stamp papers dated 2012.',
      category: 'Questioned Documents & Handwriting',
      policeUnit: 'Economic Offences Wing (EOW)',
      forensicUnit: 'SFSL Questioned Documents Division',
      priority: 'HIGH',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-010', type: 'Questioned 2-Page Power of Attorney Document', desc: 'Non-judicial stamp paper #MH-2012-90182 with disputed signature of rightful owner.', location: 'Document Vault Dehumidified Drawer D-01', status: 'IN_EXAMINATION' },
        { id: 'EV-011', type: 'Genuine Standard Signatures Ledger 2010-2014', desc: 'Official bank signature card registers containing 24 admitted genuine signatures.', location: 'Document Vault Safe D-02', status: 'SECURE_VAULT' },
        { id: 'EV-012', type: 'Seized Laser Printer & Ink Cartridge Set', desc: 'HP LaserJet Pro M404n used to fabricate counterfeit stamp serial numbers.', location: 'Digital Evidence Storage Cage 01', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Forged_Deed_Signature_UV_Luminescence.png',
        'Stereomicroscopy_Ink_Pen_Line_Tremor.png',
        'Document_Stamp_Paper_Seal_Verification.png',
      ],
      report: {
        id: 'REP-2026-00210',
        title: 'Video Spectral Comparator (VSC-8000) & Handwriting Examination Report',
        obs: 'Infrared luminescence and oblique side lighting used to evaluate ink stroke sequence and line hesitation.',
        findings: 'Disputed signature exhibits slow, laboured execution with pen lifts, blunt starts, and unnatural tremors inconsistent with genuine fluency.',
        conclusion: 'The questioned signature on Exhibit EV-010 is a simulated forgery executed by a different writer.',
      },
    },
    {
      id: 'TN-FOR-2026-00067',
      firNumber: 'FIR-044/2026/HOMICIDE',
      title: 'State v. Coastal Highway Cold Case Homicide & 24-Locus STR DNA Profile',
      description: 'Re-investigation of 2021 highway homicide following recovery of biological trace evidence from vehicle passenger seat fabric.',
      category: 'DNA Profiling & Serology',
      policeUnit: 'Cold Case Homicide Special Squad',
      forensicUnit: 'Central FSL Biology & DNA Division',
      priority: 'CRITICAL',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-013', type: 'Passenger Seat Fabric with Bloodstain', desc: '15cm x 15cm fabric cutting #BL-102 showing dried dark brown biological spatter.', location: 'Cold Storage Freezer -80°C Unit 01', status: 'IN_EXAMINATION' },
        { id: 'EV-014', type: 'Sterile Buccal Swab Reference (Suspect R. Nair)', desc: 'Standard Cotton buccal swab collected under judicial magistrate supervision.', location: 'DNA Reference Sample Safe A-03', status: 'SECURE_VAULT' },
        { id: 'EV-015', type: 'Victim Clothing Fabric Cutting (Reference)', desc: 'Formalin-free blood card reference from original 2021 post-mortem.', location: 'DNA Archives Vault Locker 12', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Bloodstained_Clothing_Evidence_Grid.png',
        'Electropherogram_24_Locus_STR_Chart.png',
        'Biological_Swab_Evidence_Envelope.png',
      ],
      report: {
        id: 'REP-2026-00067',
        title: 'ABI 3500xl Capillary Electrophoresis 24-Locus STR DNA Profile Report',
        obs: 'DNA extraction using magnetic bead protocol. Multiplex PCR amplification of 24 autosomal STR loci.',
        findings: 'Complete single-source male STR DNA profile generated. Match confirmed across all 24 loci including Amelogenin, D8S1179, and FGA.',
        conclusion: 'Random match probability is 1 in 4.8 sextillion. The biological trace on EV-013 conclusively matches suspect R. Nair.',
      },
    },
    {
      id: 'GJ-FOR-2026-00441',
      firNumber: 'FIR-781/2026/NARCOTICS',
      title: 'State v. Cross-Border Synthetic Fentanyl & Methamphetamine Smuggling Syndicate',
      description: 'Maritime interdiction of unflagged fishing vessel in Arabian Sea. Seizure of 120kg concealed synthetic opioid and precursor chemicals.',
      category: 'Toxicology & Chemical Narcotics',
      policeUnit: 'Narcotics Control Bureau (NCB) Joint Task Force',
      forensicUnit: 'SFSL Narcotics & Chemical Analysis Division',
      priority: 'CRITICAL',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-016', type: 'Heat-Sealed Polythene Packet of White Powder', desc: 'Sample pack #NCB-A1 containing 1.05kg fine crystalline white substance.', location: 'Narcotics High Security Vault Cage 02', status: 'IN_EXAMINATION' },
        { id: 'EV-017', type: 'Seized Garmin Marine GPS Navigation Unit', desc: 'Garmin GPSMAP 78s with waypoint coordinates of offshore transfer point.', location: 'Digital Forensics Isolation Bench 03', status: 'SECURE_VAULT' },
        { id: 'EV-018', type: 'Chemical Precursor 4-ANPP Liquid Drum', desc: '5L plastic carboy of amber liquid labeled as industrial solvent.', location: 'Hazardous Chemicals Secure Cell 01', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Seized_Fentanyl_Pills_Blister_Pack.png',
        'Raman_Spectroscopy_Compound_ID.png',
        'Chemical_Reagent_Testing_Vials.png',
      ],
      report: {
        id: 'REP-2026-00441',
        title: 'FTIR & High-Performance Liquid Chromatography (HPLC) Drug Purity Report',
        obs: 'FTIR spectrum compared against NIST and SWGDRUG forensic reference chemical libraries.',
        findings: 'Sample contains Fentanyl Hydrochloride at 88.4% purity and Methamphetamine Hydrochloride at 8.2%. Scheduled under NDPS Act 1985.',
        conclusion: 'Exhibits confirm commercial quantity of illicit Class-A synthetic opioids.',
      },
    },
    {
      id: 'TS-FOR-2026-00512',
      firNumber: 'FIR-229/2026/CYBER',
      title: 'State v. Smart Contract Liquidity Pool Exfiltration & Hardware Ledger Seizure',
      description: 'Flash loan exploit draining $4.2M from decentralized finance platform. On-chain forensic tracing and hardware wallet seizure.',
      category: 'Digital Evidence & Cyber Intrusion',
      policeUnit: 'State Cyber Crime Police Station',
      forensicUnit: 'SFSL Cryptocurrency Intelligence Wing',
      priority: 'HIGH',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-019', type: 'Ledger Nano X Hardware Cryptocurrency Wallet', desc: 'Matte black Ledger Nano X (S/N: LN-90182) seized during suspect residence raid.', location: 'RF Faraday Evidence Safe 01', status: 'IN_EXAMINATION' },
        { id: 'EV-020', type: 'Custom Liquid-Cooled Mining Rig Workstation', desc: 'Custom ATX PC with 4x RTX 4090 GPUs used to compute smart contract exploits.', location: 'Hardware Vault Area 04', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Seized_Ledger_Hardware_Wallet_Desk.png',
        'Cryptocurrency_Blockchain_Flow_Graph.png',
      ],
      report: {
        id: 'REP-2026-00512',
        title: 'Blockchain Transaction Graphing & Flash Loan Attack Vector Analysis',
        obs: 'Transaction graph analysis of Ethereum mainnet block 19820144. Dissected decompiled EVM bytecode.',
        findings: 'Reentrancy flaw exploited via re-entrant fallback function. 1,420 ETH routed through Tornado Cash to seized hardware wallet.',
        conclusion: 'Direct cryptographic link established between the stolen liquidity and the private key residing in EV-019.',
      },
    },
    {
      id: 'UP-FOR-2026-00189',
      firNumber: 'FIR-518/2026/ARSON',
      title: 'State v. Commercial Warehouse Arson & Hydrocarbon Accelerant Analysis',
      description: 'Multi-crore electronics inventory warehouse completely gutted in suspicious midnight fire. Insurance claim fraud suspected.',
      category: 'Arson & Explosives',
      policeUnit: 'Crime Investigation Department (CID)',
      forensicUnit: 'SFSL Arson & Physical Evidence Laboratory',
      priority: 'HIGH',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-021', type: 'Charred Wooden Floorboard Cutting #A-1', desc: '30cm x 15cm burnt timber showing deep alligatoring and distinct V-pattern pour mark.', location: 'Vapor-Tight Evidence Canister Storage', status: 'IN_EXAMINATION' },
        { id: 'EV-022', type: 'Melted Plastic Jerrycan Spout Residue', desc: 'Recovered from rear fire exit alleyway with pungent hydrocarbon odor.', location: 'Arson Evidence Locker 02', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Charred_Vehicle_Engine_Bay_Photo.png',
        'Hydrocarbon_Sniffer_Positive_Hit.png',
      ],
      report: {
        id: 'REP-2026-00189',
        title: 'Gas Chromatography-Flame Ionization Detection (GC-FID) Accelerant Report',
        obs: 'Activated charcoal strip passive headspace extraction per ASTM E1412.',
        findings: 'Chromatogram reveals signature homologous series of n-alkanes (C9-C20) and alkylbenzenes characteristic of commercial kerosene.',
        conclusion: 'Fire origin was deliberate and accelerated using petroleum distillates.',
      },
    },
    {
      id: 'HR-FOR-2026-00277',
      firNumber: 'FIR-662/2026/CYBER',
      title: 'State v. AI Voice Clone & Synthetic Deepfake Video Extortion Syndicate',
      description: 'Extortion racket using real-time generative AI video and voice synthesis impersonating senior judicial officers to extort litigants.',
      category: 'Audio/Video Forensics & Deepfake Detection',
      policeUnit: 'Special Operations Group (Cyber Wing)',
      forensicUnit: 'SFSL Audio-Video Intelligence Wing',
      priority: 'HIGH',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-023', type: '128GB SanDisk Extreme SD Card from Trap Camera', desc: 'SanDisk MicroSD (S/N: SD-9921) with original uncompressed MP4 video recordings.', location: 'Digital Evidence Storage Cage 02', status: 'IN_EXAMINATION' },
        { id: 'EV-024', type: 'Apple MacBook Pro M3 Max (Suspect Device)', desc: 'Space Black MacBook Pro containing local Stable Diffusion and Voice-Clone weights.', location: 'Isolation Workstation 04', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Face_Warping_Artifact_Analysis.png',
        'Spectrogram_Synthetic_Voice_Glitch.png',
      ],
      report: {
        id: 'REP-2026-00277',
        title: 'Deepfake Biometric Artifact & Audio Spectral Consistency Analysis',
        obs: 'Frame-by-frame biological consistency check including blink rate and photoplethysmography (rPPG) pulse analysis.',
        findings: 'Facial boundary shows Gaussian blur blending anomalies at collar line. Audio spectrum displays unnatural cutoffs above 7.8 kHz.',
        conclusion: 'Confirmed synthetic multimedia generated by neural diffusion models with 99.8% statistical confidence.',
      },
    },
    {
      id: 'WB-FOR-2026-00335',
      firNumber: 'FIR-149/2026/PHARM',
      title: 'State v. Inter-State Counterfeit Oncology Medication & XRD Analysis',
      description: 'Raid on clandestine manufacturing unit manufacturing fake life-saving chemotherapy tablets sold to private oncology hospitals.',
      category: 'Toxicology & Chemical Narcotics',
      policeUnit: 'Drug Control Administration & Crime Branch',
      forensicUnit: 'Central FSL Pharmacy & Spectroscopy Division',
      priority: 'CRITICAL',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-025', type: 'Blister Pack of Counterfeit Imatinib 400mg', desc: 'Foil blister pack #LOT-IM-2025 with smudged manufacturing print.', location: 'Pharmacy Vault Cabinet P-01', status: 'IN_EXAMINATION' },
        { id: 'EV-026', type: 'Rotary Tablet Press Die and Punch Tool', desc: 'High-speed rotary punch tool with customized pharmaceutical logo impression.', location: 'Toolmarks Heavy Vault Floor', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Counterfeit_Medicine_Packaging_Comparison.png',
        'X_Ray_Diffraction_Tablet_Analysis.png',
      ],
      report: {
        id: 'REP-2026-00335',
        title: 'X-Ray Powder Diffraction (XRD) & Active Ingredient Assay Report',
        obs: 'XRD spectrum compared against authentic crystalline standard of Imatinib Mesylate.',
        findings: 'No active pharmaceutical ingredient (API) detected. Tablets comprised solely of chalk (calcium carbonate) and industrial talc.',
        conclusion: 'Spurious and dangerous counterfeit medication lacking any therapeutic efficacy.',
      },
    },
    {
      id: 'PB-FOR-2026-00419',
      firNumber: 'FIR-883/2026/SPYWARE',
      title: 'State v. Target Android Spyware Deployment & Exfiltrated Call Recording',
      description: 'Discovery of weaponized Android surveillance package delivered via zero-click SMS exploit to compromise industrial whistleblower.',
      category: 'Digital Evidence & Cyber Intrusion',
      policeUnit: 'State Counter-Intelligence Wing',
      forensicUnit: 'SFSL Mobile Device Forensics Lab',
      priority: 'HIGH',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-027', type: 'Target Samsung Galaxy S24 Ultra Smartphone', desc: 'Titanium Gray smartphone (IMEI: 359182049182019) with active spyware process.', location: 'Faraday Bag RF Shielded Drawer F-03', status: 'IN_EXAMINATION' },
        { id: 'EV-028', type: 'Cellebrite UFED Physical Extraction Dump', desc: '512GB encrypted bin dump containing complete physical NAND image.', location: 'Secure Server Array Node 01', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Cellebrite_UFED_Physical_Extraction.png',
        'Trojan_APK_Decompiled_Manifest.png',
      ],
      report: {
        id: 'REP-2026-00419',
        title: 'Mobile Firmware Extraction & Zero-Click Trojan APK Reverse Engineering',
        obs: 'JTAG and EDL physical chip-level extraction performed. Decoded APK manifests and DEX binaries.',
        findings: 'Trojan package "com.system.security.helper" granted root permissions, secretly recording microphone audio and transmitting to C2 server.',
        conclusion: 'Conclusive evidence of targeted commercial-grade espionage spyware installation.',
      },
    },
    {
      id: 'RJ-FOR-2026-00162',
      firNumber: 'FIR-330/2026/CRIME',
      title: 'State v. National Highway Hit-and-Run Multilayer Paint Micro-Spectroscopy',
      description: 'Fatal collision on highway involving pedestrian. Suspect fled scene; paint smears and plastic headlamp fragments recovered from victim bicycle.',
      category: 'Ballistics & Toolmarks',
      policeUnit: 'Highway Patrol Special Unit',
      forensicUnit: 'SFSL Physical & Trace Evidence Laboratory',
      priority: 'HIGH',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-029', type: 'Multilayer Automotive Paint Chip #P-1', desc: '2mm x 1mm 5-layer paint flake recovered from crumpled bicycle handlebar.', location: 'Trace Evidence Slide Cabinet S-04', status: 'IN_EXAMINATION' },
        { id: 'EV-030', type: 'Suspect SUV Front Bumper Scrape Sample', desc: 'Reference paint scrape from suspect Toyota Fortuner (Reg: RJ-14-UB-9912).', location: 'Trace Evidence Safe S-05', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Microscopic_Paint_Layer_Cross_Section.png',
        'Vehicle_Bumper_Impact_Damage.png',
      ],
      report: {
        id: 'REP-2026-00162',
        title: 'Fourier-Transform Infrared (FTIR) Microspectroscopy Paint Layer Analysis',
        obs: 'Cross-section mounted in resin and analyzed under polarized light microscope and micro-FTIR.',
        findings: 'Identical 5-layer system: electrocoat primer, primer surfacer, silver metallic basecoat, and polyurethane clearcoat.',
        conclusion: 'Paint chip on victim bicycle originated from the suspect vehicle to a scientific certainty.',
      },
    },
    {
      id: 'DL-FOR-2026-00299',
      firNumber: 'FIR-904/2026/ESPIONAGE',
      title: 'State v. Defense Contractor Insider Espionage & Encrypted Flash Storage',
      description: 'Unauthorized copying of classified aeronautical telemetry designs onto encrypted commercial USB drives by departing defense engineer.',
      category: 'Digital Evidence & Cyber Intrusion',
      policeUnit: 'Special Cell & Internal Vigilance Directorate',
      forensicUnit: 'SFSL Digital Forensics Laboratory',
      priority: 'CRITICAL',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-031', type: 'Kingston IronKey Locker+ 50 128GB USB Drive', desc: 'Hardware-encrypted USB drive recovered from suspect luggage at airport departure.', location: 'Forensic Isolation Lab Workstation 01', status: 'IN_EXAMINATION' },
        { id: 'EV-032', type: 'Corporate Dell Latitude 5530 Laptop', desc: 'Issued corporate machine showing registry artifacts of USB insertion at 23:14 UTC.', location: 'Hardware Evidence Vault Area 02', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Encrypted_USB_Drive_Seizure.png',
        'Slack_Message_Timestamp_Recovery.png',
      ],
      report: {
        id: 'REP-2026-00299',
        title: 'Hardware Cryptanalysis & Windows Shellbag Registry Artifact Report',
        obs: 'Hardware key recovery and forensic parsing of UserAssist, Shimcache, and Shellbag registry keys.',
        findings: '34 classified CAD schematics copied to USB volume labeled "DEF_ARCHIVE" on 2026-09-08.',
        conclusion: 'Direct evidence of intentional unauthorized exfiltration of proprietary defense schematics.',
      },
    },
    {
      id: 'MP-FOR-2026-00344',
      firNumber: 'FIR-701/2026/EXPLOSIVES',
      title: 'State v. Metro Transit Improvised Explosive Device (IED) & RDX Residue',
      description: 'Discovery of unexploded device planted inside passenger concourse luggage locker. Successfully disarmed by bomb disposal unit.',
      category: 'Arson & Explosives',
      policeUnit: 'Anti-Terror Squad (ATS)',
      forensicUnit: 'SFSL Explosives & Hazardous Chemistry Division',
      priority: 'CRITICAL',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-033', type: 'Deconstructed Digital Clock Timer Circuit', desc: 'Circuit board with soldered relay switch, 9V battery harness, and bridge wire.', location: 'Bomb Disposal Safe Storage Bunker', status: 'IN_EXAMINATION' },
        { id: 'EV-034', type: 'Gray Plastic Explosive Residue Swab #E-01', desc: 'Cotton swab of 450g high explosive dough recovered from container lining.', location: 'Explosives Storage Vault Cell 04', status: 'SECURE_VAULT' },
      ],
      photos: [
        'IED_Circuit_Timer_Recovery.png',
        'FTIR_Explosive_Residue_Spectrum.png',
      ],
      report: {
        id: 'REP-2026-00344',
        title: 'Explosive Residue Identification & Electronic Firing System Report',
        obs: 'Thin layer chromatography (TLC) and GC-MS thermal energy analysis of explosive residue.',
        findings: 'High explosive compound identified as Cyclotrimethylenetrinitramine (RDX) mixed with polyisobutylene plasticizer (C-4).',
        conclusion: 'Device was fully armed and capable of catastrophic detonation upon timer countdown expiry.',
      },
    },
    {
      id: 'KL-FOR-2026-00178',
      firNumber: 'FIR-245/2026/HERITAGE',
      title: 'State v. 8th Century Sandstone Heritage Idol Theft & Toolmark Provenance',
      description: 'Theft of ancient sandstone temple sculpture intended for illicit export to international auction houses. Chisel toolmark comparison.',
      category: 'Ballistics & Toolmarks',
      policeUnit: 'Idol Wing Special Investigation Team',
      forensicUnit: 'SFSL Heritage & Materials Forensic Laboratory',
      priority: 'HIGH',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-035', type: 'Sandstone Carving Fragment with Chisel Mark', desc: '12cm base fragment showing fresh fracture plane and mechanical chisel grooves.', location: 'Heritage Artifact Vault Locker H-01', status: 'IN_EXAMINATION' },
        { id: 'EV-036', type: 'Seized Hardened Steel Cold Chisel (25mm)', desc: 'Heavy steel chisel recovered from suspect vehicle trunk with stone dust residue.', location: 'Toolmarks Evidence Safe T-01', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Ancient_Sculpture_Toolmark_Macro.png',
        'XRF_Mineral_Composition_Chart.png',
      ],
      report: {
        id: 'REP-2026-00178',
        title: 'Comparative Toolmark Striation & X-Ray Fluorescence (XRF) Report',
        obs: 'Silicone casting of chisel tip striations compared under 30x stereomicroscopy.',
        findings: 'Micro-serration defects on seized chisel (EV-036) replicate microscopic ridges on temple pedestal fracture surface.',
        conclusion: 'The seized chisel was the specific mechanical instrument utilized to sever the idol from its temple sanctum.',
      },
    },
    {
      id: 'CH-FOR-2026-00205',
      firNumber: 'FIR-112/2026/JUDICIAL',
      title: 'State v. High Court Judicial Order Tampering & Digital Signature Verification',
      description: 'Fraudulent insertion of bail granting clauses into official PDF judicial pronouncement uploaded to court record repository.',
      category: 'Questioned Documents & Handwriting',
      policeUnit: 'High Court Vigilance Police Post',
      forensicUnit: 'SFSL Digital & Questioned Documents Lab',
      priority: 'HIGH',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-037', type: 'Disputed PDF Court Order Bail Granting Doc', desc: 'Tampered PDF file (CRL_OP_2026_8192.pdf) with altered paragraph 14 granting unconditional bail.', location: 'Secure Server Array Node 02', status: 'IN_EXAMINATION' },
        { id: 'EV-038', type: 'Court Server Authentic Master PDF Copy', desc: 'Master cryptographically signed PDF file signed with Judge PKI DSC token.', location: 'Secure Server Array Node 02', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Forged_Deed_Signature_UV_Luminescence.png',
        'Document_Stamp_Paper_Seal_Verification.png',
      ],
      report: {
        id: 'REP-2026-00205',
        title: 'PDF Structural Cross-Reference & PKI Digital Certificate Audit Report',
        obs: 'Hexadecimal inspection of PDF trailer objects, incremental updates, and Adobe Acrobat signature dictionary.',
        findings: 'Digital signature invalid: byte range hash check failed. Incremental update added unauthorized paragraph after valid signing.',
        conclusion: 'The document was altered post-signature, rendering the bail grant null, void, and fraudulent.',
      },
    },
    {
      id: 'BR-FOR-2026-00381',
      firNumber: 'FIR-490/2026/POISON',
      title: 'State v. Illegitimate Micro-Distillery Methanol Mass Poisoning Outbreak',
      description: 'Tragic mass casualty incident in rural jurisdiction resulting from consumption of adulterated moonshine liquor spiked with industrial methanol.',
      category: 'Toxicology & Chemical Narcotics',
      policeUnit: 'Excise & Prohibition Special Enforcement Squad',
      forensicUnit: 'SFSL Toxicology & Chemical Division',
      priority: 'CRITICAL',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-039', type: 'Seized Country Liquor Glass Bottle (750ml)', desc: 'Brown glass bottle labeled "Special Malt Country Spirit" seized from unlicensed retail shack.', location: 'Chemical Vault Shelf C-08', status: 'IN_EXAMINATION' },
        { id: 'EV-040', type: 'Hospital Patient Blood Serum Sample Set (10 Vials)', desc: '10x 5ml vacutainer tubes collected from intensive care admissions.', location: 'Cold Storage Freezer -20°C Unit 03', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Toxicology_Sealed_Viscera_Sample.png',
        'Chemical_Reagent_Testing_Vials.png',
      ],
      report: {
        id: 'REP-2026-00381',
        title: 'Headspace Gas Chromatography Quantitative Methanol Toxicity Report',
        obs: 'Gas chromatography with flame ionization detector (GC-FID) using n-propanol internal standard.',
        findings: 'Liquor exhibit EV-039 contains 42.6% (v/v) methanol. Patient serum levels averaged 68 mg/dL (severe toxic range).',
        conclusion: 'Deaths were directly caused by acute methanol poisoning and resulting metabolic acidosis.',
      },
    },
    {
      id: 'GA-FOR-2026-00092',
      firNumber: 'FIR-088/2026/SUBMERGED',
      title: 'State v. Luxury Yacht Submerged Mobile Device Flash Memory Desalination',
      description: 'Recovery of waterlogged iPhone 15 Pro submerged for 18 days in coastal seawater following fatal offshore yacht collision.',
      category: 'Digital Evidence & Cyber Intrusion',
      policeUnit: 'Coastal Marine Police Station',
      forensicUnit: 'SFSL Advanced Hardware Recovery Lab',
      priority: 'HIGH',
      status: 'UNDER_EXAMINATION',
      evidenceItems: [
        { id: 'EV-041', type: 'Submerged iPhone 15 Pro Max (Salt-Corroded)', desc: 'Natural Titanium iPhone 15 Pro with heavy saltwater corrosion across charging port and logic board.', location: 'Desalination Ultrasonic Cleaning Tank 01', status: 'IN_EXAMINATION' },
        { id: 'EV-042', type: 'NAND Flash Memory Chip Desoldered Package', desc: '512GB Apple BGA NAND chip cleaned, reballed, and mounted in specialized socket.', location: 'Chip-Off Station Clean Bench', status: 'SECURE_VAULT' },
      ],
      photos: [
        'Cellebrite_UFED_Physical_Extraction.png',
        'Forensic_Acquisition_NVMe_Drive.png',
      ],
      report: {
        id: 'REP-2026-00092',
        title: 'Ultrasonic Desalination, Chip-Off NAND Extraction & GPS Track Recovery Report',
        obs: 'Ultrasonic bath with deionized water, logic board bypass, and direct NAND reader communication.',
        findings: 'Successfully recovered 100% of encrypted file system blocks. Decrypted location logs showed yacht navigational speed of 28 knots at moment of impact.',
        conclusion: 'Conclusively demonstrates reckless maritime operation exceeding harbor speed limits.',
      },
    },
  ];

  console.log(`[EXPANDED SEED] Creating ${caseDefinitions.length} Forensic Cases with Evidence, Reports, and Photos...`);

  let currentAuditIndex = 1;
  let prevHash = GENESIS_AUDIT_HASH;

  for (const cDef of caseDefinitions) {
    // 1. Create Case
    const createdCase = await prisma.case.create({
      data: {
        id: cDef.id,
        firNumber: cDef.firNumber,
        title: cDef.title,
        description: cDef.description,
        category: cDef.category,
        policeUnit: cDef.policeUnit,
        forensicUnit: cDef.forensicUnit,
        status: cDef.status,
        priority: cDef.priority,
        assignedOfficerId: fexOfficer.id,
        createdById: policeOfficer.id,
      },
    });

    // Audit Case Creation
    const audit1Hash = calculateAuditHash({
      sequenceIndex: currentAuditIndex,
      previousAuditHash: prevHash,
      timestamp: new Date().toISOString(),
      userId: policeOfficer.id,
      action: 'CASE_CREATED',
      resourceType: 'CASE',
      resourceId: createdCase.id,
    });

    await prisma.auditEvent.create({
      data: {
        sequenceIndex: currentAuditIndex++,
        userId: policeOfficer.id,
        userBadge: policeOfficer.badgeId,
        userName: policeOfficer.name,
        role: policeOfficer.role,
        action: 'CASE_CREATED',
        caseId: createdCase.id,
        resourceType: 'CASE',
        resourceId: createdCase.id,
        reason: `Initial FIR registered: ${createdCase.firNumber}`,
        result: 'SUCCESS',
        severity: 'INFO',
        metadata: JSON.stringify({ firNumber: createdCase.firNumber, category: createdCase.category }),
        ipAddress: '10.0.4.12',
        previousAuditHash: prevHash,
        currentAuditHash: audit1Hash,
      },
    });
    prevHash = audit1Hash;

    // 2. Create Evidence Items
    const createdEvidenceList: any[] = [];
    for (const ev of cDef.evidenceItems) {
      const evHash = sha256(`${ev.id}|${createdCase.id}|${ev.type}|SI K. Verma`);
      const createdEv = await prisma.evidence.create({
        data: {
          id: ev.id,
          caseId: createdCase.id,
          evidenceType: ev.type,
          description: ev.desc,
          collectionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          collectorName: 'Inspector Rajesh Negi (SPO-2048)',
          initialCondition: 'Sealed in tamper-evident forensic container with numbered tamper seal.',
          currentCustodian: 'Dr. Abhiraj Singh (FEX-1024)',
          currentStatus: ev.status,
          storageLocation: ev.location,
          sha256Hash: evHash,
        },
      });
      createdEvidenceList.push(createdEv);

      // Create 3 Transfers for each Evidence
      const t1 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const t2 = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
      const t3 = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

      await prisma.evidenceTransfer.createMany({
        data: [
          {
            evidenceId: createdEv.id,
            fromParty: 'Crime Scene Recovery Squad',
            toParty: 'Police Station Evidence Malkhana',
            transferredAt: t1,
            purpose: 'Initial seizure, barcoding, and tamper-evident sealing',
            action: 'SEIZURE_AND_ENTRY',
            status: 'ACKNOWLEDGED',
            notes: 'Sealed with red numbered tamper tape',
            responsibleOfficerId: policeOfficer.id,
          },
          {
            evidenceId: createdEv.id,
            fromParty: 'Police Station Evidence Malkhana',
            toParty: 'SFSL Central Evidence Reception',
            transferredAt: t2,
            purpose: 'Dispatch to state laboratory under court requisition',
            action: 'TRANSIT_DISPATCH',
            status: 'ACKNOWLEDGED',
            notes: 'Delivered in locked security dispatch courier',
            responsibleOfficerId: policeOfficer.id,
          },
          {
            evidenceId: createdEv.id,
            fromParty: 'SFSL Central Evidence Reception',
            toParty: 'Dr. Abhiraj Singh (FEX-1024)',
            transferredAt: t3,
            purpose: 'Forensic examination and scientific analysis',
            action: 'EXAMINATION_HANDOVER',
            status: 'ACKNOWLEDGED',
            notes: 'Seal verified 100% intact before opening',
            responsibleOfficerId: fexOfficer.id,
          },
        ],
      });

      // Audit Evidence Logging
      const evAuditHash = calculateAuditHash({
        sequenceIndex: currentAuditIndex,
        previousAuditHash: prevHash,
        timestamp: new Date().toISOString(),
        userId: fexOfficer.id,
        action: 'EVIDENCE_SEALED',
        resourceType: 'EVIDENCE',
        resourceId: createdEv.id,
      });

      await prisma.auditEvent.create({
        data: {
          sequenceIndex: currentAuditIndex++,
          userId: fexOfficer.id,
          userBadge: fexOfficer.badgeId,
          userName: fexOfficer.name,
          role: fexOfficer.role,
          action: 'EVIDENCE_SEALED',
          caseId: createdCase.id,
          resourceType: 'EVIDENCE',
          resourceId: createdEv.id,
          reason: `Cryptographic SHA-256 seal assigned: ${ev.type}`,
          result: 'SUCCESS',
          severity: 'INFO',
          metadata: JSON.stringify({ sha256: evHash, location: ev.location }),
          ipAddress: '127.0.0.1',
          previousAuditHash: prevHash,
          currentAuditHash: evAuditHash,
        },
      });
      prevHash = evAuditHash;
    }

    // 3. Attach Case-Related Crime Scene Photos (Document records)
    for (let pIdx = 0; pIdx < cDef.photos.length; pIdx++) {
      const photoName = cDef.photos[pIdx];
      const generatedFile = generateForensicPng(photoName, cDef.category, pIdx + 1);
      const linkedEvidence = createdEvidenceList[pIdx % createdEvidenceList.length];

      await prisma.document.create({
        data: {
          caseId: createdCase.id,
          evidenceId: linkedEvidence?.id || null,
          originalFilename: generatedFile.originalFilename,
          storedFilename: generatedFile.storedFilename,
          mimeType: 'image/png',
          fileSize: generatedFile.size,
          sha256Hash: generatedFile.hash,
          uploadedById: fexOfficer.id,
        },
      });
    }

    // 4. Create Finalized Signed Forensic Report
    const repContent = {
      evidenceExamined: createdEvidenceList.map((e) => `${e.evidenceType} (${e.id})`).join('; '),
      examinationMethod: `Standard ISO/IEC 17025 accredited laboratory procedure: ${cDef.category} methodology. Dual hash verification before and after inspection.`,
      observations: cDef.report.obs,
      findings: cDef.report.findings,
      conclusion: cDef.report.conclusion,
    };

    const repHash = calculateReportHash(repContent);
    const repTimestamp = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const repSignature = sha256(`${repHash}|${fexOfficer.badgeId}|${fexOfficer.name}|${repTimestamp.toISOString()}`);

    const createdReport = await prisma.report.create({
      data: {
        id: cDef.report.id,
        caseId: createdCase.id,
        title: cDef.report.title,
        currentVersion: 1,
        status: 'FINALIZED',
        authorId: fexOfficer.id,
      },
    });

    await prisma.reportVersion.create({
      data: {
        reportId: createdReport.id,
        versionNumber: 1,
        evidenceExamined: repContent.evidenceExamined,
        examinationMethod: repContent.examinationMethod,
        observations: repContent.observations,
        findings: repContent.findings,
        conclusion: repContent.conclusion,
        sha256Hash: repHash,
        authorId: fexOfficer.id,
        isFinalized: true,
        finalizedAt: repTimestamp,
        signedByName: fexOfficer.name,
        signedById: fexOfficer.badgeId,
        signedByDesignation: fexOfficer.designation,
        signatureTimestamp: repTimestamp,
        signatureHash: repSignature,
        createdAt: repTimestamp,
      },
    });

    // Audit Report Signing
    const repAuditHash = calculateAuditHash({
      sequenceIndex: currentAuditIndex,
      previousAuditHash: prevHash,
      timestamp: new Date().toISOString(),
      userId: fexOfficer.id,
      action: 'REPORT_SIGNED',
      resourceType: 'REPORT',
      resourceId: createdReport.id,
    });

    await prisma.auditEvent.create({
      data: {
        sequenceIndex: currentAuditIndex++,
        userId: fexOfficer.id,
        userBadge: fexOfficer.badgeId,
        userName: fexOfficer.name,
        role: fexOfficer.role,
        action: 'REPORT_SIGNED',
        caseId: createdCase.id,
        resourceType: 'REPORT',
        resourceId: createdReport.id,
        reason: `Cryptographic digital signature affixed to V1 by ${fexOfficer.name}`,
        result: 'SUCCESS',
        severity: 'INFO',
        metadata: JSON.stringify({ sha256: repHash, signature: repSignature }),
        ipAddress: '127.0.0.1',
        previousAuditHash: prevHash,
        currentAuditHash: repAuditHash,
      },
    });
    prevHash = repAuditHash;
  }

  // Sample security alerts
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
        description: 'Automated daemon completed full verification of audit hash chain across all 18 forensic cases. 100% integrity confirmed.',
        status: 'RESOLVED',
        resolvedBy: 'Automated System Monitor',
        resolutionNotes: 'Chain valid from genesis.',
      },
    ],
  });

  const finalCaseCount = await prisma.case.count();
  const finalEvCount = await prisma.evidence.count();
  const finalRepCount = await prisma.report.count();
  const finalDocCount = await prisma.document.count();

  console.log('====================================================');
  console.log('🎉 EXPANDED FORENSIC SEEDING COMPLETE:');
  console.log(`- Active Cases:    ${finalCaseCount} (Expanded from 7)`);
  console.log(`- Sealed Evidence: ${finalEvCount} (Expanded from 12)`);
  console.log(`- Signed Reports:  ${finalRepCount} (Expanded from 6)`);
  console.log(`- Photos Attached: ${finalDocCount} (Crime scene photos generated for ALL cases)`);
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('[SEED ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
