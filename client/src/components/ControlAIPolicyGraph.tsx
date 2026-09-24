import React, { useState, useMemo, useRef } from 'react';
import {
  Shield,
  ShieldCheck,
  Scale,
  FileText,
  Cpu,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Zap,
  Mic,
  Send,
  Database,
  Lock,
  Compass,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sliders,
  History,
  Activity,
  Award,
  Radio,
  Camera,
  UserCheck,
  Calendar,
  Clock,
  Briefcase,
  GitBranch,
  Fingerprint,
} from 'lucide-react';

export interface GraphNode {
  id: string;
  label: string;
  category: 'core' | 'statute' | 'case' | 'evidence' | 'lab' | 'compliance';
  status: 'verified' | 'active' | 'warning' | 'audit';
  year: number;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  icon: string;
  citation?: string;
  description: string;
  sha256?: string;
  dependencies: string[];
  caseId?: string;
  reportId?: string;
  metrics?: { label: string; value: string }[];
}

interface ControlAIPolicyGraphProps {
  cases?: any[];
  reports?: any[];
  stats?: any;
  user?: any;
  officerPhoto?: string;
  onPhotoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectCase?: (caseId: string) => void;
  onSelectReport?: (reportId: string) => void;
  setActiveTab?: (tab: string) => void;
  viewMode?: 'graph' | 'matrix';
  onToggleViewMode?: (mode: 'graph' | 'matrix') => void;
}

export const ControlAIPolicyGraph: React.FC<ControlAIPolicyGraphProps> = ({
  cases = [],
  reports = [],
  stats,
  user,
  officerPhoto = '/officer_abhiraj.jpg',
  onPhotoUpload,
  onSelectCase,
  onSelectReport,
  setActiveTab,
  viewMode = 'graph',
  onToggleViewMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timeline State (2023 - 2026)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('core-bsa');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // Bottom GYAAN GURU AI Bar State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<{ title: string; text: string; confidence: number } | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Tactical Web Audio Chime
  const playTacticalChime = (freq = 660) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.19);
    } catch {}
  };

  // Node Ecosystem Definition (Representing Policy, Cases, Evidence, and Labs)
  const nodes: GraphNode[] = useMemo(() => {
    const rawNodes: GraphNode[] = [
      // 1. Central Core Anchor Node (Constitution of India & BSA 2023)
      {
        id: 'core-bsa',
        label: 'BHARATIYA SAKSHYA ADHINIYAM (BSA 2023)',
        category: 'core',
        status: 'verified',
        year: 2023,
        x: 50,
        y: 48,
        icon: '⚖️',
        citation: 'Ministry of Law & Justice, Govt of India (Act No. 47 of 2023)',
        description:
          'Sovereign legal foundation governing admissibility of electronic evidence, digital chain of custody, and forensic expert opinion in Indian Courts.',
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        dependencies: ['stat-sec63', 'stat-sec39', 'stat-sec45', 'comp-hash', 'comp-hsm'],
        metrics: [
          { label: 'Sovereign Basis', value: 'Act No. 47' },
          { label: 'Enacted', value: 'Dec 2023' },
          { label: 'Court Mandate', value: 'Mandatory' },
        ],
      },

      // 2. Statutory Legal Nodes
      {
        id: 'stat-sec63',
        label: 'Section 63 BSA (Electronic Evidence)',
        category: 'statute',
        status: 'verified',
        year: 2023,
        x: 35,
        y: 22,
        icon: '📜',
        citation: 'Section 63 (Sub-sections 1 to 4) BSA 2023',
        description:
          'Mandates cryptographic hash verification, digital source device attestation, and electronic chain of custody compliance.',
        dependencies: ['core-bsa', 'comp-sec65b', 'case-0482', 'evid-hdd'],
        metrics: [
          { label: 'Legal Weight', value: 'Primary Evid.' },
          { label: 'Hash Match', value: '100% Required' },
        ],
      },
      {
        id: 'stat-sec39',
        label: 'Section 39 BSA (Attestation of Evidence)',
        category: 'statute',
        status: 'verified',
        year: 2023,
        x: 65,
        y: 22,
        icon: '🛡️',
        citation: 'Section 39 Bharatiya Sakshya Adhiniyam 2023',
        description:
          'Authorizes scientific laboratory certification and immutable cryptographic attestation for court presentation.',
        dependencies: ['core-bsa', 'lab-cyber', 'comp-hash'],
        metrics: [
          { label: 'Certification', value: 'SFSL Official' },
          { label: 'Validity', value: 'Perpetual' },
        ],
      },
      {
        id: 'stat-sec45',
        label: 'Section 45 IEA / Sec 39 BSA (Expert Opinion)',
        category: 'statute',
        status: 'verified',
        year: 2023,
        x: 20,
        y: 48,
        icon: '🔬',
        citation: 'Expert Witness Certification Framework',
        description:
          'Establishes formal legal admissibility for opinions rendered by State Forensic Science Laboratory examiners.',
        dependencies: ['core-bsa', 'lab-ballistics', 'lab-dna'],
        metrics: [
          { label: 'Jurisdiction', value: 'High Court / Sessions' },
          { label: 'Expertise Level', value: 'Level-4 Specialist' },
        ],
      },
      {
        id: 'stat-bnss105',
        label: 'BNSS Section 105 (Mandatory Videography)',
        category: 'statute',
        status: 'verified',
        year: 2024,
        x: 80,
        y: 48,
        icon: '📹',
        citation: 'Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)',
        description:
          'Requires end-to-end digital video recording of search, seizure, and seal placement with zero-frame loss attestation.',
        dependencies: ['core-bsa', 'evid-cctv', 'comp-zkp'],
        metrics: [
          { label: 'Frame Integrity', value: 'SHA-256 Validated' },
          { label: 'Tamper Vector', value: 'Zero Detected' },
        ],
      },

      // 3. Active Cases Cluster (Populated with real user cases or rich defaults)
      {
        id: 'case-0482',
        label: cases[0]?.title || 'FIR #0482: Crypto Vault Breach',
        category: 'case',
        status: 'active',
        year: 2025,
        x: 25,
        y: 72,
        icon: '📂',
        caseId: cases[0]?.id || 'case-0482',
        citation: `FIR No: ${cases[0]?.firNumber || 'SFSL/CR/0482'}`,
        description:
          'High-stakes cyber financial heist involving cryptographic cold-wallet exfiltration and transaction ledger analysis.',
        sha256: cases[0]?.evidence?.[0]?.sha256Hash || '8c142c67679db4e7a83d782782e4e1a681c3c9b139dbb7d90d81ef3c59cf5c84',
        dependencies: ['core-bsa', 'stat-sec63', 'evid-hdd', 'lab-cyber'],
        metrics: [
          { label: 'Priority', value: 'HIGH' },
          { label: 'Items Sealed', value: '4 Evidence Bags' },
        ],
      },
      {
        id: 'case-0491',
        label: cases[1]?.title || 'FIR #0491: Critical Infrastructure Intrusion',
        category: 'case',
        status: 'verified',
        year: 2026,
        x: 42,
        y: 84,
        icon: '🚨',
        caseId: cases[1]?.id || 'case-0491',
        citation: `FIR No: ${cases[1]?.firNumber || 'SFSL/CY/0491'}`,
        description:
          'SCADA telemetry packet interception and dark-web ransomware vector reverse-engineering.',
        dependencies: ['core-bsa', 'evid-phone', 'lab-cyber', 'comp-hash'],
        metrics: [
          { label: 'Classification', value: 'National Security' },
          { label: 'Evidence Dump', value: '128 GB Volatile RAM' },
        ],
      },
      {
        id: 'case-0504',
        label: cases[2]?.title || 'FIR #0504: Ballistics Striation Audit',
        category: 'case',
        status: 'active',
        year: 2025,
        x: 75,
        y: 72,
        icon: '🎯',
        caseId: cases[2]?.id || 'case-0504',
        citation: `FIR No: ${cases[2]?.firNumber || 'SFSL/BAL/0504'}`,
        description:
          'Microscopic comparison microscope groove matching on recovered 9mm brass casing.',
        dependencies: ['core-bsa', 'evid-pistol', 'lab-ballistics'],
        metrics: [
          { label: 'Striation Match', value: '98.4% Confidence' },
          { label: 'Test Fire Tank', value: 'Recovered' },
        ],
      },

      // 4. Physical & Digital Evidence Items
      {
        id: 'evid-hdd',
        label: 'EnCase Image: 4TB NVMe SSD',
        category: 'evidence',
        status: 'verified',
        year: 2025,
        x: 14,
        y: 28,
        icon: '💾',
        citation: 'Evidence ID: EVID-CY-8821',
        description:
          'Bit-stream forensic mirror generated via write-blocker hardware. SHA-256 matches court record 100%.',
        sha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
        dependencies: ['case-0482', 'stat-sec63', 'lab-cyber'],
        metrics: [
          { label: 'Sector Count', value: '7,814,037,168' },
          { label: 'Integrity', value: 'Verified 100%' },
        ],
      },
      {
        id: 'evid-phone',
        label: 'UFED Physical Dump: iPhone 15 Pro',
        category: 'evidence',
        status: 'verified',
        year: 2026,
        x: 32,
        y: 92,
        icon: '📱',
        citation: 'Evidence ID: EVID-MOB-4410',
        description:
          'Full file-system acquisition with encrypted WhatsApp DB extraction and keychain decryption.',
        sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
        dependencies: ['case-0491', 'lab-cyber', 'comp-sec65b'],
        metrics: [
          { label: 'Extraction', value: 'Physical Dump' },
          { label: 'Messages Recovered', value: '14,289' },
        ],
      },
      {
        id: 'evid-pistol',
        label: '9mm Glock Pistol & Spent Shell Casing',
        category: 'evidence',
        status: 'active',
        year: 2025,
        x: 88,
        y: 65,
        icon: '🔫',
        citation: 'Evidence ID: EVID-BAL-0199',
        description:
          'Test-fired under water tank recovery. Striation grooves matched firing pin signature.',
        dependencies: ['case-0504', 'lab-ballistics'],
        metrics: [
          { label: 'Caliber', value: '9x19mm Parabellum' },
          { label: 'Serial Number', value: 'GLK-48192-IND' },
        ],
      },
      {
        id: 'evid-cctv',
        label: 'CCTV DVR Footage: 1080p H.265 Stream',
        category: 'evidence',
        status: 'verified',
        year: 2024,
        x: 86,
        y: 30,
        icon: '📽️',
        citation: 'Evidence ID: EVID-VID-9932',
        description:
          'Authenticated surveillance stream with cryptographic frame-by-frame hash integrity stamp.',
        dependencies: ['stat-bnss105', 'comp-hash', 'core-bsa'],
        metrics: [
          { label: 'FPS', value: '30 Fixed' },
          { label: 'Duration', value: '04h:22m:18s' },
        ],
      },

      // 5. Forensic Laboratory Units
      {
        id: 'lab-cyber',
        label: 'Digital & Cyber Forensics Lab (SFSL)',
        category: 'lab',
        status: 'verified',
        year: 2023,
        x: 10,
        y: 64,
        icon: '💻',
        citation: 'ISO/IEC 17025:2017 Accredited Forensic Testing Unit',
        description:
          'Specialized forensic division for memory dumps, malware analysis, volatile RAM capture, and cloud ledger extraction.',
        dependencies: ['core-bsa', 'case-0482', 'evid-hdd'],
        metrics: [
          { label: 'Accreditation', value: 'NABL Certified' },
          { label: 'Examiners', value: '6 Senior Officers' },
        ],
      },
      {
        id: 'lab-ballistics',
        label: 'Ballistics & Firearm Examination Division',
        category: 'lab',
        status: 'verified',
        year: 2023,
        x: 88,
        y: 84,
        icon: '🎯',
        citation: 'SFSL Specialized Arms Testing Division',
        description:
          'Comprehensive projectile velocity measurement, striation comparison, and trajectory reconstruction.',
        dependencies: ['core-bsa', 'case-0504', 'evid-pistol'],
        metrics: [
          { label: 'Equipment', value: 'Leica Comparison Scope' },
          { label: 'Chronograph', value: 'Optical Sensor 0.1%' },
        ],
      },
      {
        id: 'lab-dna',
        label: 'DNA Profiling & Serology Unit',
        category: 'lab',
        status: 'verified',
        year: 2024,
        x: 60,
        y: 92,
        icon: '🧬',
        citation: 'CODIS Compatible 24-Loci STR Testing Lab',
        description:
          'High-precision short tandem repeat analysis with 99.99999% statistical match probability thresholds.',
        dependencies: ['core-bsa', 'stat-sec45'],
        metrics: [
          { label: 'Loci Tested', value: '24 Autosomal STR' },
          { label: 'Thermal Cycler', value: 'Applied Biosystems' },
        ],
      },

      // 6. Compliance & Cryptographic Integrity Checkpoints
      {
        id: 'comp-hash',
        label: 'SHA-256 Cryptographic Hash Seal',
        category: 'compliance',
        status: 'verified',
        year: 2023,
        x: 50,
        y: 10,
        icon: '🔐',
        citation: 'NIST FIPS 180-4 Secure Hash Standard',
        description:
          'Immutable mathematical digest computed at moment of seizure. Mathematically proves zero tampering.',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        dependencies: ['core-bsa', 'stat-sec63', 'stat-sec39'],
        metrics: [
          { label: 'Algorithm', value: 'SHA-256 (256-bit)' },
          { label: 'Digest State', value: 'MATCHED 100%' },
        ],
      },
      {
        id: 'comp-sec65b',
        label: 'Section 65B Electronic Certificate Attestation',
        category: 'compliance',
        status: 'verified',
        year: 2024,
        x: 38,
        y: 36,
        icon: '🔏',
        citation: 'Legal Attestation Certificate Form B',
        description:
          'Signed digital affidavit certifying device custody, operational health, and examiner qualifications.',
        dependencies: ['core-bsa', 'stat-sec63', 'case-0482'],
        metrics: [
          { label: 'Certificate Hash', value: '7c89f2...99a1' },
          { label: 'Affidavit', value: 'Signed by Chief Examiner' },
        ],
      },
      {
        id: 'comp-zkp',
        label: 'Zero-Knowledge Custody Verification',
        category: 'compliance',
        status: 'verified',
        year: 2025,
        x: 62,
        y: 36,
        icon: '⚡',
        citation: 'Cryptographic Ledger Custody Protocol',
        description:
          'Verifies transfer chain of evidence between police, lab, and judicial magistrate without revealing sensitive contents.',
        dependencies: ['core-bsa', 'stat-bnss105'],
        metrics: [
          { label: 'Protocol', value: 'zk-SNARK Ledger' },
          { label: 'Anonymized', value: 'Court Verified' },
        ],
      },
      {
        id: 'comp-hsm',
        label: 'Hardware Security Module (HSM) Token Gate',
        category: 'compliance',
        status: 'verified',
        year: 2025,
        x: 50,
        y: 70,
        icon: '🛡️',
        citation: 'FIPS 140-3 Level 3 Cryptographic HSM',
        description:
          'Cryptographically signs all official lab attestations with Chief Forensic Officer private key.',
        dependencies: ['core-bsa', 'case-0482'],
        metrics: [
          { label: 'Hardware Key', value: 'YubiKey FIPS 140-3' },
          { label: 'Token Linked', value: 'Officer Dr. Abhiraj Singh' },
        ],
      },
    ];

    return rawNodes;
  }, [cases]);

  // Filter nodes based on selected timeline year and category filter
  const visibleNodes = useMemo(() => {
    return nodes.filter((node) => {
      const passesYear = node.year <= selectedYear;
      const passesCategory =
        activeCategory === 'ALL' ||
        (activeCategory === 'STATUTES' && (node.category === 'statute' || node.category === 'core')) ||
        (activeCategory === 'CASES' && node.category === 'case') ||
        (activeCategory === 'EVIDENCE' && node.category === 'evidence') ||
        (activeCategory === 'LABS' && node.category === 'lab') ||
        (activeCategory === 'COMPLIANCE' && node.category === 'compliance');
      return passesYear && passesCategory;
    });
  }, [nodes, selectedYear, activeCategory]);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  // Active highlighted dependencies
  const activeDependencyIds = useMemo(() => {
    const targetId = hoveredNodeId || selectedNodeId;
    if (!targetId) return new Set<string>();
    const node = nodes.find((n) => n.id === targetId);
    if (!node) return new Set<string>();
    return new Set<string>([node.id, ...node.dependencies]);
  }, [nodes, hoveredNodeId, selectedNodeId]);

  // Color scheme helpers
  const getNodeColor = (category: string) => {
    switch (category) {
      case 'core':
        return { border: 'border-cyan-400', bg: 'bg-cyan-950/90', text: 'text-cyan-300', glow: 'shadow-cyan-500/50', line: '#22d3ee' };
      case 'statute':
        return { border: 'border-emerald-400', bg: 'bg-emerald-950/90', text: 'text-emerald-300', glow: 'shadow-emerald-500/50', line: '#34d399' };
      case 'case':
        return { border: 'border-violet-400', bg: 'bg-violet-950/90', text: 'text-violet-300', glow: 'shadow-violet-500/50', line: '#a78bfa' };
      case 'evidence':
        return { border: 'border-amber-400', bg: 'bg-amber-950/90', text: 'text-amber-300', glow: 'shadow-amber-500/50', line: '#fbbf24' };
      case 'lab':
        return { border: 'border-sky-400', bg: 'bg-sky-950/90', text: 'text-sky-300', glow: 'shadow-sky-500/50', line: '#38bdf8' };
      case 'compliance':
      default:
        return { border: 'border-teal-400', bg: 'bg-teal-950/90', text: 'text-teal-300', glow: 'shadow-teal-500/50', line: '#2dd4bf' };
    }
  };

  // Run System Compliance Simulation
  const handleRunSimulation = () => {
    playTacticalChime(880);
    setSimulationRunning(true);
    setSimulationResult(null);

    setTimeout(() => {
      setSimulationRunning(false);
      setSimulationResult(
        '✅ SYSTEM COMPLIANCE VERIFIED: 100% of evidence items conform to Section 63 BSA & Section 105 BNSS. Cryptographic SHA-256 hashes are immutable and zero tamper vectors were detected.'
      );
      playTacticalChime(1046);
    }, 1800);
  };

  // Trigger GYAAN GURU AI Simulation / Query
  const handleAiAsk = (queryText?: string) => {
    const q = queryText || aiPrompt;
    if (!q.trim()) return;

    playTacticalChime(520);
    setIsThinking(true);
    setAiResponse(null);

    setTimeout(() => {
      setIsThinking(false);
      const lower = q.toLowerCase();

      if (lower.includes('bsa') || lower.includes('section 63') || lower.includes('compliance')) {
        setAiResponse({
          title: '⚖️ BSA 2023 Section 63 Compliance Audit',
          text: `Under Section 63 of Bharatiya Sakshya Adhiniyam 2023, digital records stored in NVMe/SATA media require dual cryptographic hash certification and examiner attestation. All ${cases.length || 4} active cases in SFSL records meet these requirements with 99.98% audit score.`,
          confidence: 99.8,
        });
      } else if (lower.includes('custody') || lower.includes('chain') || lower.includes('trace')) {
        setAiResponse({
          title: '🔗 Chain of Custody & Zero-Knowledge Verification',
          text: `Evidence custody log traced from Police Station Malkhana -> Forensic Transit -> Central SFSL Cryptographic Vault. Every handoff has an HSM-signed timestamp with zero gap in custody continuity.`,
          confidence: 100,
        });
      } else if (lower.includes('tamper') || lower.includes('hash') || lower.includes('sha')) {
        setAiResponse({
          title: '🛡️ SHA-256 Integrity Attestation',
          text: `Real-time mathematical checksums matched against the court attestation repository. No bit-level alterations detected across 24 forensic partitions. Integrity status: SEALED & ADMISSIBLE.`,
          confidence: 100,
        });
      } else {
        setAiResponse({
          title: '🤖 GYAAN GURU Tactical Assessment',
          text: `Query analyzed across the central forensic graph ecosystem. All ${visibleNodes.length} active nodes are synchronized with the Central State Forensic Science Laboratory standards. Ready for judicial export.`,
          confidence: 98.6,
        });
      }
      playTacticalChime(784);
    }, 1200);
  };

  const timelineYears = [
    { year: 2023, label: '2023', subtitle: 'BSA Enacted' },
    { year: 2024, label: '2024', subtitle: 'Digital Evid. Mandate' },
    { year: 2025, label: '2025', subtitle: 'Quantum CryptoSeal' },
    { year: 2026, label: '2026', subtitle: 'Live Active Stream' },
  ];

  return (
    <div className="relative rounded-3xl bg-[#060911] border border-slate-800/80 shadow-2xl overflow-hidden font-sans select-none backdrop-blur-2xl">
      {/* Background Cyber Grid & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d412_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50"></div>
      <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[480px] h-[480px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* ========================================================= */}
      {/* TOP FLOATING HEADER BAR (GEORGE RAILEAN DRIBBLE STYLE)     */}
      {/* ========================================================= */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        {/* Left: Brand Identity & Active Authority */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-cyan-300 font-black">
              <Scale className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black tracking-widest text-cyan-400 uppercase">
                CONTROL AI // POLICY & FORENSIC GRAPH
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[10px] font-mono text-emerald-300 font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40">
                SOVEREIGN SYSTEM ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>CENTRAL SFSL COMMAND</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-300">BHARATIYA SAKSHYA ADHINIYAM (BSA 2023)</span>
            </p>
          </div>
        </div>

        {/* Center: Live System Metrics Pills */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 font-mono text-xs shadow-inner">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/70 border border-emerald-500/30 text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">BSA COMPLIANCE: 99.8%</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/70 border border-cyan-500/30 text-cyan-300">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">SHA-256 SEALS: 100%</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/70 border border-violet-500/30 text-violet-300">
            <Activity className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-bold">{visibleNodes.length} NODES SYNCED</span>
          </div>
        </div>

        {/* Right: Circular Edge Radar + Officer Profile Capsule + View Switcher */}
        <div className="flex items-center gap-4">
          {/* Circular Edge Radar Widget (George Railean Dribbble Hallmark) */}
          <div className="relative group flex items-center gap-2.5 bg-slate-900/90 p-1.5 px-3 rounded-2xl border border-slate-800">
            <div className="relative w-7 h-7 rounded-full border border-cyan-500/50 flex items-center justify-center overflow-hidden bg-cyan-950/30">
              {/* Radar Grid Crosshairs */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-[1px] bg-cyan-500/20"></div>
                <div className="h-full w-[1px] bg-cyan-500/20"></div>
              </div>
              {/* Rotating Radar Sweep Beam */}
              <div className="absolute inset-0 origin-center animate-radarSpin bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(6,182,212,0.6)_360deg)] pointer-events-none"></div>
              {/* Center Dot */}
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 z-10 animate-ping"></div>
            </div>
            <div className="text-left font-mono">
              <span className="text-[9px] text-cyan-400 font-bold block uppercase tracking-wider">EDGE RADAR</span>
              <span className="text-[10px] text-white font-bold block">0 ANOMALIES</span>
            </div>
          </div>

          {/* Officer Profile Capsule (Dr. Abhiraj Singh) with 1-Click Photo Upload */}
          <div className="flex items-center gap-2.5 bg-slate-900/90 p-1.5 pr-3.5 rounded-2xl border border-slate-800 shadow-sm">
            <div
              className="relative w-9 h-9 rounded-xl overflow-hidden border-2 border-emerald-400 shadow-md shadow-emerald-500/30"
            >
              <img
                src={officerPhoto}
                alt={user?.name || 'Dr. Abhiraj Singh'}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="text-left font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white leading-tight">
                  {user?.name || 'Dr. Abhiraj Singh'}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <span className="text-[10px] text-emerald-400 font-bold block leading-tight">
                {user?.badgeId || 'BADGE: FEX-1024'}
              </span>
            </div>
          </div>

          {/* View Mode Switcher Pill */}
          {onToggleViewMode && (
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
              <button
                onClick={() => onToggleViewMode('graph')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'graph'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Graph</span>
              </button>
              <button
                onClick={() => onToggleViewMode('matrix')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'matrix'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Dossiers</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SIMULATION RESULT TOAST (IF TRIGGERED) */}
      {simulationResult && (
        <div className="relative z-30 mx-6 mt-3 p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 flex items-center justify-between gap-3 text-xs text-emerald-200 font-mono shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
            <span>{simulationResult}</span>
          </div>
          <button
            onClick={() => setSimulationResult(null)}
            className="text-emerald-400 hover:text-white text-xs px-2.5 py-1 rounded bg-emerald-900/80 border border-emerald-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN SPATIAL CANVAS WORKSPACE (FULL-WIDTH 3-COLUMN VIEW)  */}
      {/* ========================================================= */}
      <div className="relative w-full h-[600px] sm:h-[680px] lg:h-[720px] flex overflow-hidden">
        {/* ========================================================= */}
        {/* 1. LEFT SCRUBBABLE TIMELINE & DOMAIN FILTER TOOL RAIL     */}
        {/* ========================================================= */}
        <div className="w-24 sm:w-32 shrink-0 border-r border-slate-800/80 bg-slate-950/80 p-3.5 flex flex-col justify-between z-20 backdrop-blur-xl">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-wider flex items-center gap-1">
                <History className="w-3.5 h-3.5" /> Timeline
              </span>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">Scrub Law History</p>
            </div>

            {/* Domain Filter Pills */}
            <div className="space-y-1">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'STATUTES', label: 'Legislation' },
                { id: 'CASES', label: 'Cases' },
                { id: 'EVIDENCE', label: 'Evidence' },
                { id: 'LABS', label: 'Labs' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    playTacticalChime(700);
                    setActiveCategory(cat.id);
                  }}
                  className={`w-full text-left px-2 py-1 rounded-lg text-[10px] font-mono transition-all block font-bold ${
                    activeCategory === cat.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vertical Timeline Track with Scrub Marks */}
          <div className="relative flex flex-col items-center justify-center my-auto space-y-6 py-4">
            <div className="absolute top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500/50 via-emerald-500/50 to-slate-800"></div>

            {timelineYears.map((t) => {
              const isSelected = selectedYear === t.year;
              const isPast = selectedYear >= t.year;
              return (
                <button
                  key={t.year}
                  onClick={() => {
                    playTacticalChime(600 + (t.year - 2023) * 100);
                    setSelectedYear(t.year);
                  }}
                  className={`relative z-10 group flex flex-col items-center transition-all ${
                    isSelected ? 'scale-115' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border-2 transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/50'
                        : isPast
                        ? 'bg-slate-900 text-cyan-300 border-cyan-500/60'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    {t.year.toString().slice(-2)}
                  </div>
                  <span
                    className={`text-[9px] font-mono mt-1 text-center leading-tight transition-colors ${
                      isSelected ? 'text-cyan-300 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {t.label}
                  </span>
                  <span className="hidden sm:block text-[8px] text-slate-600 font-mono text-center">
                    {t.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Run Full Simulation Button */}
          <button
            onClick={handleRunSimulation}
            disabled={simulationRunning}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono text-[10px] font-black shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 fill-current ${simulationRunning ? 'animate-bounce' : ''}`} />
            <span>{simulationRunning ? 'RUNNING...' : 'SIMULATE'}</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* 2. CENTRAL SPATIAL NODE GRAPH CANVAS (SVG + LUMINOUS NODES)*/}
        {/* ========================================================= */}
        <div
          className="relative flex-1 h-full overflow-hidden cursor-grab active:cursor-grabbing transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {/* SVG Luminous Bezier Dependency Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="lineGlowCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.25" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Render Bezier Lines between related nodes */}
            {visibleNodes.map((sourceNode) => {
              return sourceNode.dependencies.map((depId) => {
                const targetNode = visibleNodes.find((n) => n.id === depId);
                if (!targetNode) return null;

                const isLineActive =
                  activeDependencyIds.has(sourceNode.id) && activeDependencyIds.has(targetNode.id);

                const midX = (sourceNode.x + targetNode.x) / 2;
                const midY = (sourceNode.y + targetNode.y) / 2 - 4; // slight arc

                return (
                  <g key={`${sourceNode.id}-${targetNode.id}`}>
                    <path
                      d={`M ${sourceNode.x * 10} ${sourceNode.y * 6.5} Q ${midX * 10} ${midY * 6.5} ${targetNode.x * 10} ${targetNode.y * 6.5}`}
                      fill="none"
                      stroke={isLineActive ? '#38bdf8' : '#1e293b'}
                      strokeWidth={isLineActive ? '2.5' : '1'}
                      strokeOpacity={isLineActive ? '0.9' : '0.4'}
                      strokeDasharray={isLineActive ? 'none' : '4 4'}
                      filter={isLineActive ? 'url(#glow)' : undefined}
                    />

                    {/* Animated moving pulse packet along active lines */}
                    {showParticles && isLineActive && (
                      <circle r="3.5" fill="#38bdf8" filter="url(#glow)">
                        <animateMotion
                          path={`M ${sourceNode.x * 10} ${sourceNode.y * 6.5} Q ${midX * 10} ${midY * 6.5} ${targetNode.x * 10} ${targetNode.y * 6.5}`}
                          dur="2.2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              });
            })}
          </svg>

          {/* HTML5 Interactive Node Badges Positioned Absolutely */}
          {visibleNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isConnected = activeDependencyIds.has(node.id);
            const colors = getNodeColor(node.category);
            const isCore = node.category === 'core';

            return (
              <div
                key={node.id}
                onClick={() => {
                  playTacticalChime(isCore ? 1046 : 740);
                  setSelectedNodeId(node.id);
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute z-10 cursor-pointer transition-all duration-300 group ${
                  isSelected
                    ? 'scale-115 z-30'
                    : isHovered
                    ? 'scale-110 z-20'
                    : isConnected
                    ? 'opacity-100'
                    : hoveredNodeId
                    ? 'opacity-35'
                    : 'opacity-90'
                }`}
              >
                {/* Central Anchor Core Node (Constitution & BSA 2023) */}
                {isCore ? (
                  <div className="relative flex flex-col items-center">
                    <div className="absolute -inset-5 rounded-full border border-cyan-500/30 animate-spin-slow pointer-events-none"></div>
                    <div className="absolute -inset-8 rounded-full border border-cyan-400/15 animate-reverse-spin pointer-events-none"></div>

                    <div className="px-6 py-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-950 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/50 flex items-center gap-3 ring-4 ring-cyan-500/20 backdrop-blur-xl">
                      <span className="text-2xl animate-pulse">{node.icon}</span>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                            CENTRAL CORE
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                        </div>
                        <h4 className="text-xs font-black text-white font-mono tracking-wide">
                          {node.label}
                        </h4>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Satellite Nodes (Legislation, Cases, Evidence, Labs)
                  <div
                    className={`px-3.5 py-2 rounded-xl border flex items-center gap-2.5 shadow-xl backdrop-blur-md transition-all ${colors.bg} ${colors.border} ${
                      isSelected
                        ? `ring-2 ring-cyan-400 ${colors.glow} scale-105`
                        : 'hover:border-white'
                    }`}
                  >
                    <span className="text-sm">{node.icon}</span>
                    <div className="text-left">
                      <span className="text-[10px] font-mono font-bold block text-slate-200 whitespace-nowrap group-hover:text-white">
                        {node.label}
                      </span>
                      {node.citation && (
                        <span className="text-[8px] font-mono text-slate-400 block truncate max-w-[130px]">
                          {node.citation}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Zoom and Display Controls */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 text-slate-400 text-xs shadow-lg">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
              className="p-1.5 hover:text-white rounded hover:bg-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
              className="p-1.5 hover:text-white rounded hover:bg-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 py-0.5 text-[10px] font-mono hover:text-white rounded hover:bg-slate-800 font-bold"
              title="Reset View"
            >
              100%
            </button>
            <span className="w-[1px] h-4 bg-slate-800"></span>
            <button
              onClick={() => setShowParticles(!showParticles)}
              className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${
                showParticles ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-500'
              }`}
              title="Toggle Live Data Particles"
            >
              PACKETS
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. RIGHT FLOATING NODE INSPECTOR DRAWER                    */}
        {/* ========================================================= */}
        <div className="w-80 sm:w-96 shrink-0 border-l border-slate-800/80 bg-slate-950/90 p-5 flex flex-col justify-between z-20 backdrop-blur-2xl overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{selectedNode.icon}</span>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-wider block">
                      NODE INSPECTOR
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      CAT: {selectedNode.category}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {selectedNode.status.toUpperCase()}
                </span>
              </div>

              {/* Node Title & Citations */}
              <div>
                <h3 className="text-base font-bold text-white leading-snug">
                  {selectedNode.label}
                </h3>
                {selectedNode.citation && (
                  <p className="text-xs font-mono text-emerald-400 font-bold mt-1">
                    {selectedNode.citation}
                  </p>
                )}
                <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">
                  {selectedNode.description}
                </p>
              </div>

              {/* Node Specific Key Metrics */}
              {selectedNode.metrics && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {selectedNode.metrics.map((m) => (
                    <div key={m.label} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono">
                      <span className="text-[9px] text-slate-500 block uppercase">{m.label}</span>
                      <span className="text-xs text-cyan-300 font-bold block mt-0.5">{m.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* SHA-256 Hash Seal (If applicable) */}
              {selectedNode.sha256 && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" /> SHA-256 HASH ATTESTATION:
                  </span>
                  <div className="text-[9px] font-mono text-cyan-300 break-all bg-slate-950 p-2 rounded border border-slate-800/80">
                    {selectedNode.sha256}
                  </div>
                </div>
              )}

              {/* Connected Dependencies Count */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                  Connected Dependencies ({selectedNode.dependencies.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.dependencies.map((depId) => {
                    const depNode = nodes.find((n) => n.id === depId);
                    return (
                      <button
                        key={depId}
                        onClick={() => setSelectedNodeId(depId)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-slate-900 hover:bg-cyan-950/70 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors"
                      >
                        {depNode ? depNode.label.split(':')[0] : depId}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {selectedNode.caseId && onSelectCase && (
                  <button
                    onClick={() => onSelectCase(selectedNode.caseId!)}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all"
                  >
                    <span>Open Case Dossier</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}

                {setActiveTab && (
                  <button
                    onClick={() => setActiveTab('evidence')}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-xs flex items-center justify-center gap-1.5 border border-slate-800 transition-all"
                  >
                    <span>View in Evidence Vault</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs font-mono">
              <Compass className="w-8 h-8 mb-2 opacity-40 animate-spin-slow" />
              <span>Select any node on the canvas to inspect legal dependencies</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. BOTTOM FLOATING GYAAN GURU AI INTEGRATION LAYER        */}
      {/* ========================================================= */}
      <div className="relative z-30 border-t border-slate-800/90 bg-slate-950/95 p-4 backdrop-blur-2xl space-y-3">
        {/* Quick AI Simulations Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Quick AI Simulations:
          </span>

          {[
            { label: '⚖️ Verify BSA Sec 63 Compliance', q: 'Verify Section 63 BSA compliance for all digital records' },
            { label: '🔗 Trace Evidence Custody', q: 'Trace complete chain of custody and zero knowledge logs' },
            { label: '🛡️ Detect Tamper Gaps', q: 'Simulate hash tamper attack on seized evidence items' },
            { label: '📜 Section 65B Form B Attestation', q: 'Generate Section 65B electronic attestation summary' },
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => {
                setAiPrompt(chip.q);
                handleAiAsk(chip.q);
              }}
              className="px-3 py-1 rounded-lg text-[10px] font-mono bg-slate-900/90 hover:bg-cyan-950/80 text-slate-300 hover:text-cyan-300 border border-slate-800/90 transition-all"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* AI Input Capsule */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-1.5 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all shadow-inner">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0 ml-1">
            <Cpu className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
            placeholder="Ask GYAAN GURU about policy, compliance, cases, or simulate impact..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 font-mono outline-none px-2"
          />

          <button
            onClick={() => handleAiAsk()}
            disabled={isThinking || !aiPrompt.trim()}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/30 disabled:opacity-40"
          >
            <span>{isThinking ? 'ANALYZING...' : 'RUN QUERY'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* GYAAN GURU Response Drawer (When Query is Analyzed) */}
        {aiResponse && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/40 shadow-xl space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">{aiResponse.title}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800 font-bold">
                  {aiResponse.confidence}% CONFIDENCE
                </span>
              </div>
              <button
                onClick={() => setAiResponse(null)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-0.5 rounded"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">{aiResponse.text}</p>
          </div>
        )}
      </div>
    </div>
  );
};
