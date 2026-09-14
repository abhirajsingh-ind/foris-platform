import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { sha256 } from '../server/utils/crypto';

const prisma = new PrismaClient();

const REAL_PHOTOS_MAP: Record<string, string> = {
  // Case 1: Cyber
  'Crime_Scene_Server_Rack_Exfiltration.jpg': 'photo-1558494949-ef010cbdcc31',
  'Forensic_Acquisition_NVMe_Drive.jpg': 'photo-1591488320449-011701bb6704',
  'Memory_Dump_Terminal_Evidence.jpg': 'photo-1526374965328-7f61d4dc18c5',

  // Case 2: Ballistics
  'Bullet_Impact_Windshield_Macro.jpg': 'photo-1579783902614-a3fb3927b675',
  'Spent_Cartridge_Comparison_Microscope.jpg': 'photo-1595590424283-b8f17842773f',
  'Seized_Glock19_Recovery_Bag.jpg': 'photo-1595590424283-b8f17842773f',

  // Case 3: Toxicology Cyanide
  'Toxicology_Sealed_Viscera_Sample.jpg': 'photo-1532187863486-abf9dbad1b69',
  'GC_MS_Chromatography_Peak_Analysis.jpg': 'photo-1579154204601-01588f351e67',
  'Chemical_Reagent_Testing_Vials.jpg': 'photo-1582719478250-c89cae4dc85b',

  // Case 4: Forged Power of Attorney
  'Forged_Deed_Signature_UV_Luminescence.jpg': 'photo-1450133064473-71024230f91b',
  'Stereomicroscopy_Ink_Pen_Line_Tremor.jpg': 'photo-1455390582262-044cdead277a',
  'Document_Stamp_Paper_Seal_Verification.jpg': 'photo-1589829545856-d10d557cf95f',

  // Case 5: DNA Cold Case
  'Bloodstained_Clothing_Evidence_Grid.jpg': 'photo-1576086213369-97a306d36557',
  'Electropherogram_24_Locus_STR_Chart.jpg': 'photo-1530497610245-94d3c16cda28',
  'Biological_Swab_Evidence_Envelope.jpg': 'photo-1516321318423-f06f85e504b3',

  // Case 6: Synthetic Fentanyl Narcotics
  'Seized_Fentanyl_Pills_Blister_Pack.jpg': 'photo-1584308666744-24d5c474f2ae',
  'Raman_Spectroscopy_Compound_ID.jpg': 'photo-1587854692152-cbe660dbde88',
  'Seized_Chemical_Precursor_Drums.jpg': 'photo-1584017911766-d451b3d0e843',

  // Case 7: Smart Contract Crypto
  'Seized_Ledger_Hardware_Wallet_Desk.jpg': 'photo-1518770660439-4636190af475',
  'Cryptocurrency_Blockchain_Flow_Graph.jpg': 'photo-1621416894569-0f39ed31d247',

  // Case 8: Arson & Accelerant
  'Charred_Vehicle_Engine_Bay_Photo.jpg': 'photo-1509198397868-475647b2a1e5',
  'Hydrocarbon_Sniffer_Positive_Hit.jpg': 'photo-1563245372-f21724e3856d',

  // Case 9: Deepfake & Audio
  'Face_Warping_Artifact_Analysis.jpg': 'photo-1507003211169-0a1dd7228f2d',
  'Spectrogram_Synthetic_Voice_Glitch.jpg': 'photo-1598488035139-bdbb2231ce04',

  // Case 10: Counterfeit Oncology Medicine
  'Counterfeit_Medicine_Packaging_Comparison.jpg': 'photo-1471864190281-a93a3070b6de',
  'X_Ray_Diffraction_Tablet_Analysis.jpg': 'photo-1582719478250-c89cae4dc85b',

  // Case 11: Mobile Spyware
  'Cellebrite_UFED_Physical_Extraction.jpg': 'photo-1511707171634-5f897ff02aa9',
  'Trojan_APK_Decompiled_Manifest.jpg': 'photo-1580910051074-3eb694886505',

  // Case 12: Highway Hit-and-Run Multilayer Paint
  'Microscopic_Paint_Layer_Cross_Section.jpg': 'photo-1579154204601-01588f351e67',
  'Vehicle_Bumper_Impact_Damage.jpg': 'photo-1503376780353-7e6692767b70',

  // Case 13: Defense Insider Espionage
  'Encrypted_USB_Drive_Seizure.jpg': 'photo-1618410320928-25228d811631',
  'Corporate_Laptop_Registry_Artifact.jpg': 'photo-1588872657578-7efd1f1555ed',

  // Case 14: Metro Transit IED & RDX
  'IED_Circuit_Timer_Recovery.jpg': 'photo-1581092160607-ee22621dd758',
  'FTIR_Explosive_Residue_Spectrum.jpg': 'photo-1532187863486-abf9dbad1b69',

  // Case 15: Heritage Idol Theft
  'Ancient_Sculpture_Toolmark_Macro.jpg': 'photo-1564507592333-c60657eea523',
  'Chisel_Tool_Microscopic_Striations.jpg': 'photo-1504148455328-c376907d081c',

  // Case 16: High Court Order Tampering
  'Court_Order_Tampered_Paragraph_Scan.jpg': 'photo-1589829545856-d10d557cf95f',
  'Judicial_Embossed_Seal_Micrograph.jpg': 'photo-1450133064473-71024230f91b',

  // Case 17: Methanol Poisoning
  'Seized_Country_Liquor_Bottle_Evidence.jpg': 'photo-1527061011665-3652c757a4d4',
  'Blood_Serum_Methanol_GC_FID_Analysis.jpg': 'photo-1579154204601-01588f351e67',

  // Case 18: Yacht Submerged Mobile Device
  'Submerged_iPhone_Desalination_Chamber.jpg': 'photo-1511707171634-5f897ff02aa9',
  'Chip_Off_NAND_Reader_Workbench.jpg': 'photo-1591488320449-011701bb6704',
};

async function downloadPhoto(filename: string, unsplashId: string): Promise<{ storedFilename: string; size: number; hash: string }> {
  const uploadDir = path.resolve(process.cwd(), './uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const url = `https://images.unsplash.com/${unsplashId}?w=1200&auto=format&fit=crop&q=85`;
  const safeFilename = `REAL_${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = path.join(uploadDir, safeFilename);

  console.log(`[DOWNLOAD] Fetching real photograph for ${filename} (${unsplashId})...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: HTTP ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(filePath, buffer);
  const hash = sha256(buffer);

  return { storedFilename: safeFilename, size: buffer.length, hash };
}

export async function populateRealPhotos() {
  console.log('[REAL PHOTOS] Replacing documents with authentic high-resolution crime scene photographs...');
  const uploadDir = path.resolve(process.cwd(), './uploads');

  // Find all cases in database
  const cases = await prisma.case.findMany({
    include: {
      evidence: true,
      documents: true,
    },
  });

  const officer = await prisma.user.findFirst({ where: { badgeId: 'FEX-1024' } });
  if (!officer) {
    throw new Error('Officer FEX-1024 not found');
  }

  // Delete previous documents so we populate fresh real photos
  await prisma.document.deleteMany();

  // Case-by-case assignment of real photographs
  const casePhotosMapping: Record<string, string[]> = {
    'MP-FOR-2026-00125': [
      'Crime_Scene_Server_Rack_Exfiltration.jpg',
      'Forensic_Acquisition_NVMe_Drive.jpg',
      'Memory_Dump_Terminal_Evidence.jpg',
    ],
    'DL-FOR-2026-00094': [
      'Bullet_Impact_Windshield_Macro.jpg',
      'Spent_Cartridge_Comparison_Microscope.jpg',
      'Seized_Glock19_Recovery_Bag.jpg',
    ],
    'MH-FOR-2026-00388': [
      'Toxicology_Sealed_Viscera_Sample.jpg',
      'GC_MS_Chromatography_Peak_Analysis.jpg',
      'Chemical_Reagent_Testing_Vials.jpg',
    ],
    'KA-FOR-2026-00210': [
      'Forged_Deed_Signature_UV_Luminescence.jpg',
      'Stereomicroscopy_Ink_Pen_Line_Tremor.jpg',
      'Document_Stamp_Paper_Seal_Verification.jpg',
    ],
    'TN-FOR-2026-00067': [
      'Bloodstained_Clothing_Evidence_Grid.jpg',
      'Electropherogram_24_Locus_STR_Chart.jpg',
      'Biological_Swab_Evidence_Envelope.jpg',
    ],
    'GJ-FOR-2026-00441': [
      'Seized_Fentanyl_Pills_Blister_Pack.jpg',
      'Raman_Spectroscopy_Compound_ID.jpg',
      'Seized_Chemical_Precursor_Drums.jpg',
    ],
    'TS-FOR-2026-00512': [
      'Seized_Ledger_Hardware_Wallet_Desk.jpg',
      'Cryptocurrency_Blockchain_Flow_Graph.jpg',
    ],
    'UP-FOR-2026-00189': [
      'Charred_Vehicle_Engine_Bay_Photo.jpg',
      'Hydrocarbon_Sniffer_Positive_Hit.jpg',
    ],
    'HR-FOR-2026-00277': [
      'Face_Warping_Artifact_Analysis.jpg',
      'Spectrogram_Synthetic_Voice_Glitch.jpg',
    ],
    'WB-FOR-2026-00335': [
      'Counterfeit_Medicine_Packaging_Comparison.jpg',
      'X_Ray_Diffraction_Tablet_Analysis.jpg',
    ],
    'PB-FOR-2026-00419': [
      'Cellebrite_UFED_Physical_Extraction.jpg',
      'Trojan_APK_Decompiled_Manifest.jpg',
    ],
    'RJ-FOR-2026-00162': [
      'Microscopic_Paint_Layer_Cross_Section.jpg',
      'Vehicle_Bumper_Impact_Damage.jpg',
    ],
    'DL-FOR-2026-00299': [
      'Encrypted_USB_Drive_Seizure.jpg',
      'Corporate_Laptop_Registry_Artifact.jpg',
    ],
    'MP-FOR-2026-00344': [
      'IED_Circuit_Timer_Recovery.jpg',
      'FTIR_Explosive_Residue_Spectrum.jpg',
    ],
    'KL-FOR-2026-00178': [
      'Ancient_Sculpture_Toolmark_Macro.jpg',
      'Chisel_Tool_Microscopic_Striations.jpg',
    ],
    'CH-FOR-2026-00205': [
      'Court_Order_Tampered_Paragraph_Scan.jpg',
      'Judicial_Embossed_Seal_Micrograph.jpg',
    ],
    'BR-FOR-2026-00381': [
      'Seized_Country_Liquor_Bottle_Evidence.jpg',
      'Blood_Serum_Methanol_GC_FID_Analysis.jpg',
    ],
    'GA-FOR-2026-00092': [
      'Submerged_iPhone_Desalination_Chamber.jpg',
      'Chip_Off_NAND_Reader_Workbench.jpg',
    ],
  };

  let count = 0;

  for (const c of cases) {
    const photoFilenames = casePhotosMapping[c.id] || [
      'Crime_Scene_Server_Rack_Exfiltration.jpg',
      'Forensic_Acquisition_NVMe_Drive.jpg',
    ];

    for (let i = 0; i < photoFilenames.length; i++) {
      const filename = photoFilenames[i];
      const unsplashId = REAL_PHOTOS_MAP[filename] || 'photo-1558494949-ef010cbdcc31';
      const linkedEvidence = c.evidence[i % c.evidence.length];

      try {
        const fileInfo = await downloadPhoto(filename, unsplashId);

        await prisma.document.create({
          data: {
            caseId: c.id,
            evidenceId: linkedEvidence?.id || null,
            originalFilename: filename,
            storedFilename: fileInfo.storedFilename,
            mimeType: 'image/jpeg',
            fileSize: fileInfo.size,
            sha256Hash: fileInfo.hash,
            uploadedById: officer.id,
          },
        });
        count++;
        console.log(`[SUCCESS] Attached real photo: ${filename} to Case ${c.id}`);
      } catch (err: any) {
        console.error(`[ERROR] Failed to attach ${filename}:`, err.message);
      }
    }
  }

  console.log(`🎉 Successfully downloaded and attached ${count} REAL photographs across all cases!`);
}

populateRealPhotos()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
