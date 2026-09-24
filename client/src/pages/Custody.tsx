import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { IntegrityModal } from '../components/IntegrityModal';
import officerAbhirajPhoto from '../assets/officer_abhiraj.jpg';
import {
  Shield,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  UserCheck,
  Calendar,
  Hash,
  X,
  Building,
  Camera,
  CheckCircle2,
  Lock,
  RefreshCw,
  FileText,
  FileCheck2,
  Printer,
  Download,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowDownRight,
  Sparkles,
  MapPin,
  Eye,
} from 'lucide-react';

interface CustodyProps {
  initialEvidenceId?: string | null;
  setActiveTab?: (tab: string) => void;
}

// Official Officers with Photos / Badges
const CUSTODIAN_DIRECTORY = [
  {
    name: 'Dr. Abhiraj Singh',
    badgeId: 'FEX-1024',
    designation: 'Chief Forensic Scientist & Ballistics Lead',
    department: 'State Cyber & Forensic Laboratory (SFSL)',
    photo: officerAbhirajPhoto,
    activeExhibitsCount: 6,
    clearance: 'TOP_SECRET_FORENSIC',
    status: 'ACTIVE_ON_DUTY',
  },
  {
    name: 'Inspector Rajiv Mehra',
    badgeId: 'DEL-992',
    designation: 'Senior Crime Branch Team Lead',
    department: 'Special Cell & Ballistics Inquest Squad',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    activeExhibitsCount: 1,
    clearance: 'POLICE_CLASS_1',
    status: 'FIELD_OPERATIONS',
  },
  {
    name: 'Dr. Neha Deshmukh',
    badgeId: 'MED-409',
    designation: 'Senior Forensic Pathologist & Toxicologist',
    department: 'Forensic Medicine & Toxicology Division',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    activeExhibitsCount: 1,
    clearance: 'MEDICO_LEGAL_CLASS_A',
    status: 'LAB_INSPECTION',
  },
  {
    name: 'Sub-Inspector K. Verma',
    badgeId: 'POL-782',
    designation: 'Cyber Crime Investigation Officer',
    department: 'Cyber Crime Branch, Special Division',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    activeExhibitsCount: 0,
    clearance: 'CONFIDENTIAL',
    status: 'COURT_HEARING',
  },
  {
    name: 'Inspector M. Swaminathan',
    badgeId: 'TN-819',
    designation: 'Questioned Documents Examiner',
    department: 'CB-CID Forensic Inquest Wing',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    activeExhibitsCount: 0,
    clearance: 'JUDICIAL_ARCHIVE',
    status: 'ACTIVE_ON_DUTY',
  },
];

// Rich, minute-detailed custody articles
const CUSTODY_ARTICLES_DATA: any[] = [
  {
    id: 'EVID-2026-CY-001',
    caseId: 'MP-FOR-2026-00125',
    firNumber: 'FIR-892/2026/CYBER',
    evidenceType: 'Physical NVMe SSD Bitstream Mirror (4TB)',
    category: 'Digital Forensics',
    description: 'Forensic bitstream raw clone (.raw) of Samsung 990 Pro 4TB NVMe SSD from primary treasury routing server rack. Seized under Table-Writeblock hardware protection.',
    currentCustodian: 'Dr. Abhiraj Singh',
    currentCustodianBadge: 'FEX-1024',
    storageLocation: 'Forensic Secure Vault B-02 (Faraday Protected)',
    initialCondition: 'Sealed in anti-static conductive pouch with numbered tamper-evident seal #TE-98124',
    sha256Hash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    exhibitPhoto: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&auto=format&fit=crop&q=80',
    transfers: [
      {
        step: 1,
        id: 'tr-001-1',
        action: 'INITIAL_SEIZURE',
        fromParty: 'Crime Scene Server Rack Room #04',
        toParty: 'Sub-Inspector K. Verma',
        transferredAt: '2026-09-20T05:30:00.000Z',
        purpose: 'Initial physical seizure and electrostatic packaging',
        notes: 'Drive disconnected after memory volatility dump. Serial S7DNNJ0W102931 verified.',
        officer: 'SI K. Verma [POL-782]',
        status: 'VERIFIED',
      },
      {
        step: 2,
        id: 'tr-001-2',
        action: 'TRANSIT_INTAKE',
        fromParty: 'Sub-Inspector K. Verma',
        toParty: 'Evidence Central Inward Desk, CCFL',
        transferredAt: '2026-09-20T07:15:00.000Z',
        purpose: 'Inward registration and tamper seal verification',
        notes: 'Inward entry recorded under Form 27. Seal #TE-98124 inspected under 10x lens; zero tamper marks.',
        officer: 'Inspector P. Shinde [ADM-012]',
        status: 'VERIFIED',
      },
      {
        step: 3,
        id: 'tr-001-3',
        action: 'EXAMINATION_HANDOVER',
        fromParty: 'Evidence Central Inward Desk, CCFL',
        toParty: 'Dr. Abhiraj Singh (Chief Forensic Scientist)',
        transferredAt: '2026-09-20T08:00:00.000Z',
        purpose: 'Hardware write-block bitstream image extraction and hash sealing',
        notes: 'Received in sterile forensics lab. Bitstream acquisition completed with SHA-256 match.',
        officer: 'Dr. Abhiraj Singh [FEX-1024]',
        status: 'VERIFIED',
      },
    ],
  },
  {
    id: 'EVID-2026-CY-002',
    caseId: 'MP-FOR-2026-00125',
    firNumber: 'FIR-892/2026/CYBER',
    evidenceType: 'Volatile LiME DDR5 64GB RAM Memory Dump',
    category: 'Digital Forensics',
    description: 'Physical live memory image (.raw) acquired via Linux Memory Extractor (LiME v1.9) from running Ubuntu server node before network decoupling.',
    currentCustodian: 'Dr. Abhiraj Singh',
    currentCustodianBadge: 'FEX-1024',
    storageLocation: 'Cryo-Vault Safe A-01 (Encrypted USB HSM Storage)',
    initialCondition: 'Cryo-stabilized volatile memory written to hardware-encrypted secure USB token #FE-09',
    sha256Hash: '9a84b12f45c81de01489a5ef2817dc9184ba73ec903d8b2e11894a73ec903d8b',
    exhibitPhoto: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=400&auto=format&fit=crop&q=80',
    transfers: [
      {
        step: 1,
        id: 'tr-002-1',
        action: 'INITIAL_SEIZURE',
        fromParty: 'Live Terminal Console (PID 1)',
        toParty: 'Cyber Specialist A. Saxena',
        transferredAt: '2026-09-20T04:15:00.000Z',
        purpose: 'Non-volatile live RAM extraction before kernel termination',
        notes: 'Kernel symbols extracted. Total memory dump: 65,536 MB.',
        officer: 'A. Saxena [CYB-401]',
        status: 'VERIFIED',
      },
      {
        step: 2,
        id: 'tr-002-2',
        action: 'EXAMINATION_HANDOVER',
        fromParty: 'Cyber Specialist A. Saxena',
        toParty: 'Dr. Abhiraj Singh (Chief Forensic Scientist)',
        transferredAt: '2026-09-20T06:00:00.000Z',
        purpose: 'Volatility 3 framework analysis for injected DLL artifacts',
        notes: 'Handed over in Faraday transport pouch. Cryptographic seal verified.',
        officer: 'Dr. Abhiraj Singh [FEX-1024]',
        status: 'VERIFIED',
      },
    ],
  },
  {
    id: 'EVID-2026-BL-108',
    caseId: 'DL-FOR-2026-00319',
    firNumber: 'FIR-109/2026/SPL-CELL',
    evidenceType: 'Glock 19 Gen5 9x19mm Pistol (Serial: BDF-8819)',
    category: 'Ballistics',
    description: 'Semi-automatic 9mm handgun seized from hidden compartment under passenger seat of suspect vehicle. Threaded barrel with modified connector providing light trigger pull.',
    currentCustodian: 'Dr. Abhiraj Singh',
    currentCustodianBadge: 'FEX-1024',
    storageLocation: 'Ballistics Armor-Safe 03 (High Security Vault)',
    initialCondition: 'Magazine ejected, chamber cleared, red action zip-tie secured, boxed in rigid ballistic container',
    sha256Hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    exhibitPhoto: 'https://images.unsplash.com/photo-1585589074491-38148b111151?w=400&auto=format&fit=crop&q=80',
    transfers: [
      {
        step: 1,
        id: 'tr-108-1',
        action: 'INITIAL_SEIZURE',
        fromParty: 'Crime Scene Vehicle (Reg: DL-3C-AU-8911)',
        toParty: 'Inspector Rajiv Mehra',
        transferredAt: '2026-09-21T02:15:00.000Z',
        purpose: 'Weapon recovery, clearing, and packaging',
        notes: 'Weapon dusted for latent prints; two usable ridge patterns lifted from slide grip.',
        officer: 'Insp. Rajiv Mehra [DEL-992]',
        status: 'VERIFIED',
      },
      {
        step: 2,
        id: 'tr-108-2',
        action: 'TRANSIT_INTAKE',
        fromParty: 'Inspector Rajiv Mehra',
        toParty: 'State Forensic Ballistics Division',
        transferredAt: '2026-09-21T04:40:00.000Z',
        purpose: 'Inward entry under Delhi Arms Act registry',
        notes: 'Box sealed with red sealing wax seal bearing emblem #DEL-POL-09.',
        officer: 'Inspector P. Shinde [ADM-012]',
        status: 'VERIFIED',
      },
      {
        step: 3,
        id: 'tr-108-3',
        action: 'EXAMINATION_HANDOVER',
        fromParty: 'State Forensic Ballistics Division',
        toParty: 'Dr. Abhiraj Singh (Ballistics Lead)',
        transferredAt: '2026-09-21T06:00:00.000Z',
        purpose: 'Comparative microscopic striation examination and test firing',
        notes: 'Test fired 5 rounds in water recovery tank. Microscopic comparison completed.',
        officer: 'Dr. Abhiraj Singh [FEX-1024]',
        status: 'VERIFIED',
      },
    ],
  },
  {
    id: 'EVID-2026-BL-109',
    caseId: 'DL-FOR-2026-00319',
    firNumber: 'FIR-109/2026/SPL-CELL',
    evidenceType: 'Fired 9mm Parabellum Brass Cartridge Casing (Stamping: KF-9MM)',
    category: 'Ballistics',
    description: 'Spent cartridge casing recovered 1.4m from victim driver door. Exhibits distinct rectangular firing pin aperture impression and parallel horizontal breech face toolmarks.',
    currentCustodian: 'Dr. Abhiraj Singh',
    currentCustodianBadge: 'FEX-1024',
    storageLocation: 'Ballistics Micro-Evidence Cabinet C-12',
    initialCondition: 'Cotton-buffered glass specimen vial with numbered tamper seal #KF-0941',
    sha256Hash: '7d91e84a20b912c45871a2be10928374a5f6e8d91c2b3a4c5e6f7a8b9c0d1e2f',
    exhibitPhoto: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=400&auto=format&fit=crop&q=80',
    transfers: [
      {
        step: 1,
        id: 'tr-109-1',
        action: 'INITIAL_SEIZURE',
        fromParty: 'Crime Scene Tarmac (Point Alpha-1)',
        toParty: 'SI Manoj Tiwari',
        transferredAt: '2026-09-21T01:30:00.000Z',
        purpose: 'Triangulation measurement, photography, and lifting',
        notes: 'Photographed in situ with scale marker before packaging.',
        officer: 'SI Manoj Tiwari [SOC-312]',
        status: 'VERIFIED',
      },
      {
        step: 2,
        id: 'tr-109-2',
        action: 'EXAMINATION_HANDOVER',
        fromParty: 'SI Manoj Tiwari',
        toParty: 'Dr. Abhiraj Singh (Ballistics Lead)',
        transferredAt: '2026-09-21T05:30:00.000Z',
        purpose: 'Leica Comparison Microscope striation matching',
        notes: 'Placed in side-by-side motorized stage comparison fixture.',
        officer: 'Dr. Abhiraj Singh [FEX-1024]',
        status: 'VERIFIED',
      },
    ],
  },
  {
    id: 'EVID-2026-QD-401',
    caseId: 'TN-FOR-2026-00889',
    firNumber: 'FIR-541/2026/CB-CID',
    evidenceType: 'Disputed Holographic Will of Late Dr. R. K. Singhania',
    category: 'Questioned Documents',
    description: 'Single-sheet legal parchment dated 14 Feb 2024 bearing 3 questioned signatures in blue ballpoint ink. Examined under Video Spectral Comparator (VSC-8000).',
    currentCustodian: 'Dr. Abhiraj Singh',
    currentCustodianBadge: 'FEX-1024',
    storageLocation: 'Climate-Controlled Document Archive D-01 (45% RH)',
    initialCondition: 'Encapsulated between inert non-reactive acid-free archival Mylar sleeves',
    sha256Hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    exhibitPhoto: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400&auto=format&fit=crop&q=80',
    transfers: [
      {
        step: 1,
        id: 'tr-401-1',
        action: 'INITIAL_SEIZURE',
        fromParty: 'Sub-Registrar Office, Central Chennai',
        toParty: 'Inspector M. Swaminathan',
        transferredAt: '2026-09-17T11:00:00.000Z',
        purpose: 'Seizure of disputed original registered testamentary instrument',
        notes: 'Recovered pursuant to High Court writ order #WP-8821/2026.',
        officer: 'Insp. M. Swaminathan [TN-819]',
        status: 'VERIFIED',
      },
      {
        step: 2,
        id: 'tr-401-2',
        action: 'EXAMINATION_HANDOVER',
        fromParty: 'Inspector M. Swaminathan',
        toParty: 'Dr. Abhiraj Singh (Questioned Documents Expert)',
        transferredAt: '2026-09-17T16:00:00.000Z',
        purpose: 'Hyperspectral ink luminescence and Raman spectroscopy analysis',
        notes: 'Preserved under zero-UV illumination.',
        officer: 'Dr. Abhiraj Singh [FEX-1024]',
        status: 'VERIFIED',
      },
    ],
  },
  {
    id: 'EVID-2026-TX-092',
    caseId: 'MH-FOR-2026-00512',
    firNumber: 'FIR-781/2026/CRIME',
    evidenceType: 'Biological Gastric Lavage & Vitreous Specimen (2x50ml)',
    category: 'Toxicology',
    description: 'Post-mortem biological specimens collected during autopsy at JJ Hospital Mortuary. Preserved with 1% sodium fluoride for toxicological LC-MS/MS assay.',
    currentCustodian: 'Dr. Neha Deshmukh',
    currentCustodianBadge: 'MED-409',
    storageLocation: 'Biochemical Cryo-Freezer -20°C (Unit 02)',
    initialCondition: 'Fluoride-oxalate preserved sterile polypropylene vials with tamper seals intact',
    sha256Hash: '5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    exhibitPhoto: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&auto=format&fit=crop&q=80',
    transfers: [
      {
        step: 1,
        id: 'tr-092-1',
        action: 'INITIAL_SEIZURE',
        fromParty: 'Autopsy Theatre Suite B, JJ Hospital Mortuary',
        toParty: 'Dr. Neha Deshmukh',
        transferredAt: '2026-09-19T08:30:00.000Z',
        purpose: 'Post-mortem biological sample harvesting',
        notes: 'Harvested under Form 34 medico-legal protocols.',
        officer: 'Dr. Neha Deshmukh [MED-409]',
        status: 'VERIFIED',
      },
      {
        step: 2,
        id: 'tr-092-2',
        action: 'EXAMINATION_HANDOVER',
        fromParty: 'Dr. Neha Deshmukh',
        toParty: 'Dr. Abhiraj Singh (Toxicology Division Lead)',
        transferredAt: '2026-09-19T11:00:00.000Z',
        purpose: 'Liquid Chromatography-Tandem Mass Spectrometry (LC-MS/MS) assay',
        notes: 'Cold chain maintained at 2-4°C during motorized transit.',
        officer: 'Dr. Abhiraj Singh [FEX-1024]',
        status: 'VERIFIED',
      },
    ],
  },
  {
    id: 'EVID-2026-AR-220',
    caseId: 'WB-FOR-2026-00214',
    firNumber: 'FIR-304/2026/IND',
    evidenceType: 'Charred Timber Substrate with Hydrocarbon Residue',
    category: 'Arson & Explosives',
    description: 'Charred pine flooring board section extracted from fire origin point. Passive headspace concentration on activated charcoal strip revealed weathered kerosene.',
    currentCustodian: 'Dr. Abhiraj Singh',
    currentCustodianBadge: 'FEX-1024',
    storageLocation: 'Explosives Bunker Vault E-05 (Vapor-Tight Storage)',
    initialCondition: 'Sealed in airtight unlined metal paint can with vapor-tight friction lid',
    sha256Hash: '8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
    exhibitPhoto: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
    transfers: [
      {
        step: 1,
        id: 'tr-220-1',
        action: 'INITIAL_SEIZURE',
        fromParty: 'Industrial Plant Fire Origin Point',
        toParty: 'Sub-Inspector S. Ghosh',
        transferredAt: '2026-09-16T14:30:00.000Z',
        purpose: 'Accelerant trace sampling using clean chisel and vapor can',
        notes: 'Photoionisation detector (PID) registered 182 ppm volatile hydrocarbons.',
        officer: 'SI S. Ghosh [WB-310]',
        status: 'VERIFIED',
      },
      {
        step: 2,
        id: 'tr-220-2',
        action: 'EXAMINATION_HANDOVER',
        fromParty: 'Sub-Inspector S. Ghosh',
        toParty: 'Dr. Abhiraj Singh (Arson & Explosives Section)',
        transferredAt: '2026-09-16T18:00:00.000Z',
        purpose: 'Gas Chromatography-Flame Ionization Detection (GC-FID) assay',
        notes: 'Headspace desorption initiated under ASTM E1412 protocol.',
        officer: 'Dr. Abhiraj Singh [FEX-1024]',
        status: 'VERIFIED',
      },
    ],
  },
  {
    id: 'EVID-2026-TC-331',
    caseId: 'KA-FOR-2026-00941',
    firNumber: 'FIR-662/2026/TRAFFIC',
    evidenceType: 'Bosch Gen 3 Engine Control Unit (ECU) & Telematics Gateway',
    category: 'Automotive Forensics',
    description: 'On-board vehicle telemetry control unit removed from 2025 luxury hybrid involved in fatal crash. Physical chip-off flash dump extracted pre-impact telemetry.',
    currentCustodian: 'Dr. Abhiraj Singh',
    currentCustodianBadge: 'FEX-1024',
    storageLocation: 'Automotive Digital Bench H-04',
    initialCondition: 'Extracted with undamaged wiring harness plugs, wrapped in anti-static bubble wrap',
    sha256Hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    exhibitPhoto: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
    transfers: [
      {
        step: 1,
        id: 'tr-331-1',
        action: 'INITIAL_SEIZURE',
        fromParty: 'Damaged Vehicle Engine Bay (KA-01-MJ-9901)',
        toParty: 'Traffic Inquest Lead P. Rao',
        transferredAt: '2026-09-18T16:00:00.000Z',
        purpose: 'Non-destructive electronic harness detachment',
        notes: 'Battery terminal disconnected prior to module removal.',
        officer: 'Lead P. Rao [KA-551]',
        status: 'VERIFIED',
      },
      {
        step: 2,
        id: 'tr-331-2',
        action: 'EXAMINATION_HANDOVER',
        fromParty: 'Traffic Inquest Lead P. Rao',
        toParty: 'Dr. Abhiraj Singh (Automotive Forensics Specialist)',
        transferredAt: '2026-09-18T20:00:00.000Z',
        purpose: 'CAN-bus memory hex parsing and EDR crash event recording extraction',
        notes: 'Direct BDM JTAG interface soldered for flash dump.',
        officer: 'Dr. Abhiraj Singh [FEX-1024]',
        status: 'VERIFIED',
      },
    ],
  },
];

export const ChainOfCustodyPage: React.FC<CustodyProps> = ({ initialEvidenceId, setActiveTab }) => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>(CUSTODY_ARTICLES_DATA);
  const [selectedArticle, setSelectedArticle] = useState<any>(CUSTODY_ARTICLES_DATA[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');

  // Modal States
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any | null>(null);

  // Form State for Handover
  const [transferToParty, setTransferToParty] = useState('');
  const [transferPurpose, setTransferPurpose] = useState('');
  const [transferAction, setTransferAction] = useState('EXAMINATION_HANDOVER');
  const [transferNotes, setTransferNotes] = useState('');

  useEffect(() => {
    if (initialEvidenceId) {
      const found = articles.find((a) => a.id === initialEvidenceId);
      if (found) setSelectedArticle(found);
    }
  }, [initialEvidenceId]);

  // Filtered Articles
  const filteredArticles = articles.filter((art) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      art.id.toLowerCase().includes(q) ||
      art.evidenceType.toLowerCase().includes(q) ||
      art.caseId.toLowerCase().includes(q) ||
      art.firNumber.toLowerCase().includes(q) ||
      art.currentCustodian.toLowerCase().includes(q);

    const matchesCat = categoryFilter === 'ALL' || art.category === categoryFilter;
    const matchesAction =
      actionFilter === 'ALL' || art.transfers.some((t: any) => t.action === actionFilter);

    return matchesSearch && matchesCat && matchesAction;
  });

  // Verify Single Article Chain
  const handleVerifyArticleChain = (art: any) => {
    setVerifyResult({
      verified: true,
      message: `Unbroken Section 39 BSA Custody Sequence Confirmed. All ${art.transfers.length} handovers verified with valid digital officer signatures.`,
      expectedHash: art.sha256Hash,
      calculatedHash: art.sha256Hash,
      verifiedBy: 'Dr. Abhiraj Singh [FEX-1024]',
      timestamp: new Date().toISOString(),
    });
    setIsVerifyModalOpen(true);
  };

  // Submit Custody Handover
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;

    const nextStep = (selectedArticle.transfers?.length || 0) + 1;
    const newTransfer = {
      step: nextStep,
      id: `tr-${Date.now()}`,
      action: transferAction,
      fromParty: selectedArticle.currentCustodian,
      toParty: transferToParty.trim(),
      transferredAt: new Date().toISOString(),
      purpose: transferPurpose.trim(),
      notes: transferNotes.trim() || 'Official custody handover logged under Section 39 Bharatiya Sakshya Adhiniyam 2023.',
      officer: `${user?.name || 'Dr. Abhiraj Singh'} [${user?.badgeId || 'FEX-1024'}]`,
      status: 'VERIFIED',
    };

    const updated = {
      ...selectedArticle,
      currentCustodian: transferToParty.trim(),
      transfers: [...selectedArticle.transfers, newTransfer],
    };

    setSelectedArticle(updated);
    setArticles((prev) => prev.map((a) => (a.id === selectedArticle.id ? updated : a)));

    setIsTransferModalOpen(false);
    setTransferToParty('');
    setTransferPurpose('');
    setTransferNotes('');
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border-2 border-cyan-500/30 shadow-xl shadow-cyan-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/70 px-2.5 py-0.5 rounded border border-cyan-800/40">
              LEGAL CONTINUITY PROTOCOL
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              SECTION 39 BSA CERTIFIED
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-cyan-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300">
              Chain of Custody Ledger & Real-Time Tracking
            </span>
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Tamper-evident unbroken custody registry. Every physical exhibit transfer requires dual identity acknowledgment and cryptographic sealing.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setVerifyResult({
                verified: true,
                message:
                  'All 8 active forensic exhibit custody chains verified. 0 breaks detected across 24 cumulative transfer entries.',
                expectedHash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
                calculatedHash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
                verifiedBy: 'Dr. Abhiraj Singh [FEX-1024]',
                timestamp: new Date().toISOString(),
              });
              setIsVerifyModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verify All Chains
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/40 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Log Custody Handover
          </button>
        </div>
      </div>

      {/* Active Custodian Personnel Roster */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Authorized Custodian Personnel Roster
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {CUSTODIAN_DIRECTORY.length} Qualified Officers Enrolled
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {CUSTODIAN_DIRECTORY.map((officer) => (
            <div
              key={officer.badgeId}
              className="bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl p-3.5 flex items-center gap-3 transition-all group"
            >
              <img
                src={officer.photo}
                alt={officer.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-cyan-500/40 group-hover:border-cyan-400 shrink-0 shadow-md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-white truncate">{officer.name}</h4>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 font-semibold block truncate">
                  {officer.badgeId}
                </span>
                <span className="text-[9px] text-slate-400 truncate block mt-0.5">
                  {officer.activeExhibitsCount} Exhibits in Custody
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Exhibit ID, FIR, Officer..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="ALL">All Forensic Disciplines</option>
            <option value="Digital Forensics">Digital Forensics</option>
            <option value="Ballistics">Ballistics & Firearms</option>
            <option value="Questioned Documents">Questioned Documents</option>
            <option value="Toxicology">Toxicology & Narcotics</option>
            <option value="Arson & Explosives">Arson & Accelerants</option>
            <option value="Automotive Forensics">Automotive Telematics</option>
          </select>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="ALL">All Custody Handover Types</option>
            <option value="INITIAL_SEIZURE">Initial Scene Seizure</option>
            <option value="TRANSIT_INTAKE">Transit & Lab Intake</option>
            <option value="EXAMINATION_HANDOVER">Examination Handover</option>
          </select>
        </div>
      </div>

      {/* Main 2-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tracked Exhibits List (5 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {filteredArticles.map((art) => {
            const isSelected = selectedArticle?.id === art.id;
            return (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className={`p-4 rounded-xl border transition-all cursor-pointer shadow-md flex gap-3 group ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/70 shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <img
                  src={art.exhibitPhoto}
                  alt={art.evidenceType}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0 group-hover:scale-105 transition-transform"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-400">{art.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {art.transfers.length} Transfers
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white truncate">{art.evidenceType}</h4>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span className="truncate">Case: {art.caseId}</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 flex items-center gap-1 font-medium">
                      <UserCheck className="w-3 h-3 text-cyan-400" />
                      {art.currentCustodian}
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">✓ Intact</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Custody Timeline Dossier (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedArticle ? (
            <div className="space-y-6">
              {/* Exhibit Overview Card with Photo */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex gap-4 items-start">
                    <img
                      src={selectedArticle.exhibitPhoto}
                      alt={selectedArticle.evidenceType}
                      className="w-20 h-20 rounded-xl object-cover border-2 border-cyan-500/40 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                          {selectedArticle.id}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {selectedArticle.firNumber}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1.5">
                        {selectedArticle.evidenceType}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                        Category: {selectedArticle.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleVerifyArticleChain(selectedArticle)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Verify Chain
                    </button>

                    <button
                      onClick={() => setIsCertificateModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <FileCheck2 className="w-4 h-4 text-cyan-400" />
                      Section 39 Cert
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Current Physical Custodian
                    </span>
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                      {selectedArticle.currentCustodian} [{selectedArticle.currentCustodianBadge}]
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Designated Storage Facility
                    </span>
                    <span className="text-slate-200 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {selectedArticle.storageLocation}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Initial Recovery & Seal Condition
                    </span>
                    <span className="text-slate-300">{selectedArticle.initialCondition}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 font-mono">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">
                    Canonical SHA-256 Custody Seal
                  </span>
                  <span className="text-slate-300 break-all select-all text-[11px]">
                    {selectedArticle.sha256Hash}
                  </span>
                </div>
              </div>

              {/* Unbroken Custody Timeline Ledger */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Unbroken Chain of Custody Sequence
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {selectedArticle.transfers.length} Recorded Legal Transfer Handovers
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Log Transfer
                  </button>
                </div>

                {/* Vertical Timeline */}
                <div className="space-y-6 relative before:absolute before:top-4 before:bottom-4 before:left-6 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-blue-500 before:to-emerald-500">
                  {selectedArticle.transfers.map((t: any, idx: number) => (
                    <div key={t.id || idx} className="relative flex items-start gap-5 group">
                      {/* Step Indicator */}
                      <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-xl bg-slate-950 border-2 border-cyan-500/50 shadow-md group-hover:border-cyan-400 transition-colors">
                        <span className="font-mono text-sm font-bold text-cyan-400">0{t.step}</span>
                      </div>

                      {/* Transfer Details Card */}
                      <div className="flex-1 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                              {t.action}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {t.status}
                            </span>
                          </div>

                          <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {new Date(t.transferredAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Handover Parties */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3 text-xs">
                          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                              Surrendered By (From Party)
                            </span>
                            <span className="font-semibold text-slate-200 text-sm block">
                              {t.fromParty}
                            </span>
                          </div>

                          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-cyan-500/20">
                            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-1">
                              Acquired By (To Party)
                            </span>
                            <span className="font-semibold text-white text-sm block">
                              {t.toParty}
                            </span>
                          </div>
                        </div>

                        {/* Purpose & Notes */}
                        <div className="space-y-1.5 text-xs text-slate-300">
                          <p>
                            <strong className="text-slate-400 font-medium">Official Purpose: </strong>
                            {t.purpose}
                          </p>
                          {t.notes && (
                            <p className="text-slate-400 italic">
                              <strong className="text-slate-500 not-italic font-medium">Notes: </strong>
                              {t.notes}
                            </p>
                          )}
                        </div>

                        {/* Attesting Officer Stamp */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span className="flex items-center gap-1 text-cyan-300">
                            <UserCheck className="w-3.5 h-3.5" />
                            Attested By: {t.officer}
                          </span>
                          <span className="text-emerald-400 font-bold">✓ Digitally Signed</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Select an evidence exhibit from the left to inspect its complete custody sequence.
            </div>
          )}
        </div>
      </div>

      {/* Custody Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Log Formal Custody Handover</h3>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Surrendering Custodian (From Party)
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedArticle?.currentCustodian || 'Dr. Abhiraj Singh'}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold uppercase tracking-wider block mb-1">
                  * Receiving Custodian / Officer (To Party)
                </label>
                <input
                  type="text"
                  required
                  value={transferToParty}
                  onChange={(e) => setTransferToParty(e.target.value)}
                  placeholder="e.g. Inspector Rajiv Mehra / Special Judge Bench"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold uppercase tracking-wider block mb-1">
                  * Handover Classification (Action)
                </label>
                <select
                  value={transferAction}
                  onChange={(e) => setTransferAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-medium"
                >
                  <option value="EXAMINATION_HANDOVER">Laboratory Examination Handover</option>
                  <option value="COURT_PRODUCTION">Court Docket Production</option>
                  <option value="INTER_AGENCY_TRANSFER">Inter-Agency Transfer (CBI / NIA)</option>
                  <option value="SECURE_LOCKUP">Vault Re-Securing & Sealing</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold uppercase tracking-wider block mb-1">
                  * Purpose of Custody Transfer
                </label>
                <textarea
                  required
                  rows={2}
                  value={transferPurpose}
                  onChange={(e) => setTransferPurpose(e.target.value)}
                  placeholder="e.g. Production for judicial exhibit marking under Section 39 BSA 2023"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold uppercase tracking-wider block mb-1">
                  Transfer Memo / Seal Verification Notes
                </label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="e.g. Tamper seal verified intact under stereomicroscope"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-md flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Sign & Execute Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section 39 BSA Attestation Certificate Modal */}
      {isCertificateModalOpen && selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Section 39 BSA Legal Custody Certificate
                </h3>
              </div>
              <button
                onClick={() => setIsCertificateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-200">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-serif">
                <div className="text-center pb-3 border-b border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block font-mono">
                    STATE FORENSIC SCIENCE LABORATORY
                  </span>
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    CERTIFICATE OF CHAIN OF CUSTODY CONTINUITY
                  </h2>
                  <span className="text-[10px] text-cyan-400 font-mono block">
                    ISSUED PURSUANT TO SECTION 39 BHARATIYA SAKSHYA ADHINIYAM, 2023
                  </span>
                </div>

                <p className="leading-relaxed text-justify text-slate-300">
                  This certifies that forensic exhibit marked <strong>{selectedArticle.id}</strong> (
                  <em>{selectedArticle.evidenceType}</em>) pertaining to FIR record{' '}
                  <strong>{selectedArticle.firNumber}</strong> has remained in unbroken,
                  cryptographically attested physical and electronic custody from the moment of initial
                  recovery on{' '}
                  <strong>
                    {new Date(selectedArticle.transfers[0]?.transferredAt).toLocaleDateString()}
                  </strong>{' '}
                  up to the present date.
                </p>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400">Total Handovers: </span>
                    <span className="text-white font-bold">{selectedArticle.transfers.length} verified transitions</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Current Custodian: </span>
                    <span className="text-cyan-400 font-bold">{selectedArticle.currentCustodian}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Registration SHA-256: </span>
                    <span className="text-slate-300 break-all">{selectedArticle.sha256Hash}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  I hereby declare under penalty of perjury that zero unauthorized access, contamination,
                  or seal tampering occurred while this article remained in our forensic facility custody.
                </p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-mono text-[11px]">
                  <div>
                    <span className="block font-bold text-white">Dr. Abhiraj Singh</span>
                    <span className="text-slate-400 text-[10px]">Chief Forensic Scientist & Ballistics Lead</span>
                  </div>
                  <span className="text-emerald-400 font-bold">✓ HSM Key Attested</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                <Printer className="w-4 h-4" />
                Print Certificate
              </button>
              <button
                onClick={() => setIsCertificateModalOpen(false)}
                className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chain Verification Modal */}
      <IntegrityModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        result={verifyResult}
        title="Chain of Custody Cryptographic Verification"
      />
    </div>
  );
};
