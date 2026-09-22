import React, { useState, useMemo } from 'react';
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
}

interface ControlAIPolicyGraphProps {
  cases?: any[];
  reports?: any[];
  stats?: any;
  officerName?: string;
  onSelectCase?: (caseId: string) => void;
  onSelectReport?: (reportId: string) => void;
  setActiveTab?: (tab: string) => void;
}

export const ControlAIPolicyGraph: React.FC<ControlAIPolicyGraphProps> = ({
  cases = [],
  reports = [],
  stats,
  officerName = 'Dr. Abhiraj Singh',
  onSelectCase,
  onSelectReport,
  setActiveTab,
}) => {
  // Timeline State (2023 - 2026)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('core-bsa');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // Bottom GYAAN GURU AI Bar State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<{ title: string; text: string; confidence: number } | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // High-Tech Web Audio Chime
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

  // Node Ecosystem Definition
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
      },
      {
        id: 'stat-sec45',
        label: 'Section 45 IEA / Sec 39 BSA (Expert Opinion)',
        category: 'statute',
        status: 'verified',
        year: 2023,
        x: 22,
        y: 48,
        icon: '🔬',
        citation: 'Expert Witness Certification Framework',
        description:
          'Establishes formal legal admissibility for opinions rendered by State Forensic Science Laboratory examiners.',
        dependencies: ['core-bsa', 'lab-ballistics', 'lab-dna'],
      },
      {
        id: 'stat-bnss105',
        label: 'BNSS Section 105 (Mandatory Videography)',
        category: 'statute',
        status: 'verified',
        year: 2024,
        x: 78,
        y: 48,
        icon: '📹',
        citation: 'Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)',
        description:
          'Requires end-to-end digital video recording of search, seizure, and seal placement with zero-frame loss attestation.',
        dependencies: ['core-bsa', 'evid-cctv', 'comp-zkp'],
      },

      // 3. Active Cases Cluster
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
      },
      {
        id: 'case-0491',
        label: cases[1]?.title || 'FIR #0491: Critical Infrastructure Intrusion',
        category: 'case',
        status: 'verified',
        year: 2026,
        x: 44,
        y: 82,
        icon: '🚨',
        caseId: cases[1]?.id || 'case-0491',
        citation: `FIR No: ${cases[1]?.firNumber || 'SFSL/CY/0491'}`,
        description:
          'SCADA telemetry packet interception and dark-web ransomware vector reverse-engineering.',
        dependencies: ['core-bsa', 'evid-phone', 'lab-cyber', 'comp-hash'],
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
      },

      // 4. Physical & Digital Evidence Items
      {
        id: 'evid-hdd',
        label: 'EnCase Image: 4TB NVMe SSD',
        category: 'evidence',
        status: 'verified',
        year: 2025,
        x: 16,
        y: 30,
        icon: '💾',
        citation: 'Evidence ID: EVID-CY-8821',
        description:
          'Bit-stream forensic mirror generated via write-blocker hardware. SHA-256 matches court record 100%.',
        sha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
        dependencies: ['case-0482', 'stat-sec63', 'lab-cyber'],
      },
      {
        id: 'evid-phone',
        label: 'UFED Physical Dump: iPhone 15 Pro',
        category: 'evidence',
        status: 'verified',
        year: 2026,
        x: 36,
        y: 92,
        icon: '📱',
        citation: 'Evidence ID: EVID-MOB-4410',
        description:
          'Full file-system acquisition with encrypted WhatsApp DB extraction and keychain decryption.',
        sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
        dependencies: ['case-0491', 'lab-cyber', 'comp-sec65b'],
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
      },
      {
        id: 'evid-cctv',
        label: 'CCTV DVR Footage: 1080p H.265 Stream',
        category: 'evidence',
        status: 'verified',
        year: 2024,
        x: 84,
        y: 32,
        icon: '📽️',
        citation: 'Evidence ID: EVID-VID-9932',
        description:
          'Authenticated surveillance stream with cryptographic frame-by-frame hash integrity stamp.',
        dependencies: ['stat-bnss105', 'comp-hash', 'core-bsa'],
      },

      // 5. Forensic Laboratory Units
      {
        id: 'lab-cyber',
        label: 'Digital & Cyber Forensics Lab (SFSL)',
        category: 'lab',
        status: 'verified',
        year: 2023,
        x: 12,
        y: 62,
        icon: '💻',
        citation: 'ISO/IEC 17025:2017 Accredited Forensic Testing Unit',
        description:
          'Specialized forensic division for memory dumps, malware analysis, volatile RAM capture, and cloud ledger extraction.',
        dependencies: ['core-bsa', 'case-0482', 'evid-hdd'],
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
      },
      {
        id: 'lab-dna',
        label: 'DNA Profiling & Serology Unit',
        category: 'lab',
        status: 'verified',
        year: 2024,
        x: 62,
        y: 92,
        icon: '🧬',
        citation: 'CODIS Compatible 24-Loci STR Testing Lab',
        description:
          'High-precision short tandem repeat analysis with 99.99999% statistical match probability thresholds.',
        dependencies: ['core-bsa', 'stat-sec45'],
      },

      // 6. Compliance & Cryptographic Integrity Checkpoints
      {
        id: 'comp-hash',
        label: 'SHA-256 Cryptographic Hash Seal',
        category: 'compliance',
        status: 'verified',
        year: 2023,
        x: 50,
        y: 12,
        icon: '🔐',
        citation: 'NIST FIPS 180-4 Secure Hash Standard',
        description:
          'Immutable mathematical digest computed at moment of seizure. Mathematically proves zero tampering.',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        dependencies: ['core-bsa', 'stat-sec63', 'stat-sec39'],
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
        return { border: 'border-cyan-400', bg: 'bg-cyan-950/90', text: 'text-cyan-300', glow: 'shadow-cyan-500/40', line: '#22d3ee' };
      case 'statute':
        return { border: 'border-emerald-400', bg: 'bg-emerald-950/90', text: 'text-emerald-300', glow: 'shadow-emerald-500/40', line: '#34d399' };
      case 'case':
        return { border: 'border-violet-400', bg: 'bg-violet-950/90', text: 'text-violet-300', glow: 'shadow-violet-500/40', line: '#a78bfa' };
      case 'evidence':
        return { border: 'border-amber-400', bg: 'bg-amber-950/90', text: 'text-amber-300', glow: 'shadow-amber-500/40', line: '#fbbf24' };
      case 'lab':
        return { border: 'border-sky-400', bg: 'bg-sky-950/90', text: 'text-sky-300', glow: 'shadow-sky-500/40', line: '#38bdf8' };
      case 'compliance':
      default:
        return { border: 'border-teal-400', bg: 'bg-teal-950/90', text: 'text-teal-300', glow: 'shadow-teal-500/40', line: '#2dd4bf' };
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
    <div className="relative rounded-3xl bg-slate-950/95 border border-slate-800 shadow-2xl overflow-hidden font-sans select-none backdrop-blur-2xl">
      {/* Background Cyber Grid & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d415_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* TOP HEADER CONTROLS BAR (CONTROL AI POLICY PLATFORM) */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        {/* Left: Platform Title & Telemetry */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                CONTROL AI // POLICY & FORENSIC GRAPH
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40">
                ACTIVE ECOSYSTEM
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Interactive legal dependencies, active cases, and cryptographic chain of custody
            </p>
          </div>
        </div>

        {/* Right: Category Filters & Simulation Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Pills */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
            {[
              { id: 'ALL', label: `All Nodes (${nodes.length})` },
              { id: 'STATUTES', label: 'Statutes & BSA' },
              { id: 'CASES', label: 'Active Cases' },
              { id: 'EVIDENCE', label: 'Evidence Chain' },
              { id: 'LABS', label: 'Forensic Units' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  playTacticalChime(700);
                  setActiveCategory(cat.id);
                }}
                className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                  activeCategory === cat.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Run Simulation Button */}
          <button
            onClick={handleRunSimulation}
            disabled={simulationRunning}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-mono text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 fill-current ${simulationRunning ? 'animate-bounce' : ''}`} />
            <span>{simulationRunning ? 'SIMULATING...' : 'RUN SIMULATION'}</span>
          </button>
        </div>
      </div>

      {/* SIMULATION RESULT TOAST (IF TRIGGERED) */}
      {simulationResult && (
        <div className="relative z-30 mx-6 mt-3 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-between gap-3 text-xs text-emerald-200 font-mono shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{simulationResult}</span>
          </div>
          <button
            onClick={() => setSimulationResult(null)}
            className="text-emerald-400 hover:text-white text-xs px-2 py-0.5 rounded bg-emerald-900/60"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* MAIN GRAPH VIEWPORT WITH LEFT TIMELINE & RIGHT INSPECTOR */}
      <div className="relative w-full h-[540px] sm:h-[600px] lg:h-[640px] flex overflow-hidden">
        {/* ========================================================= */}
        {/* 1. LEFT SCRUBBABLE LEGISLATIVE & FORENSIC TIMELINE        */}
        {/* ========================================================= */}
        <div className="w-20 sm:w-28 shrink-0 border-r border-slate-800/80 bg-slate-950/70 p-3 flex flex-col justify-between z-10 backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <History className="w-3 h-3" /> Timeline
            </span>
            <p className="text-[9px] text-slate-500 font-mono">Scrub evolution</p>
          </div>

          {/* Vertical Timeline Track */}
          <div className="relative flex flex-col items-center justify-center my-auto space-y-6 py-4">
            {/* Connecting Vertical Line */}
            <div className="absolute top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500/40 via-emerald-500/40 to-slate-800"></div>

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
                    isSelected ? 'scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border-2 transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/50 scale-110'
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

          <div className="text-[9px] font-mono text-slate-500 text-center">
            <span>{visibleNodes.length} Nodes</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CENTRAL INTERACTIVE NODE GRAPH CANVAS (SVG + NODES)    */}
        {/* ========================================================= */}
        <div
          className="relative flex-1 h-full overflow-hidden cursor-crosshair transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {/* SVG Luminous Bezier Dependency Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="lineGlowCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="lineGlowEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
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

                // Calculate bezier control curve
                const startX = `${sourceNode.x}%`;
                const startY = `${sourceNode.y}%`;
                const endX = `${targetNode.x}%`;
                const endY = `${targetNode.y}%`;

                // SVG curve path calculation
                const midX = (sourceNode.x + targetNode.x) / 2;
                const midY = (sourceNode.y + targetNode.y) / 2 - 4; // slight arc

                const pathData = `M ${sourceNode.x} ${sourceNode.y} Q ${midX} ${midY} ${targetNode.x} ${targetNode.y}`;

                return (
                  <g key={`${sourceNode.id}-${targetNode.id}`}>
                    {/* Background faint path */}
                    <path
                      d={`M ${sourceNode.x * 10} ${sourceNode.y * 6} Q ${midX * 10} ${midY * 6} ${targetNode.x * 10} ${targetNode.y * 6}`}
                      fill="none"
                      stroke={isLineActive ? '#38bdf8' : '#1e293b'}
                      strokeWidth={isLineActive ? '2' : '0.8'}
                      strokeOpacity={isLineActive ? '0.85' : '0.35'}
                      strokeDasharray={isLineActive ? 'none' : '4 4'}
                      filter={isLineActive ? 'url(#glow)' : undefined}
                    />

                    {/* Animated moving pulse packet along active lines */}
                    {isLineActive && (
                      <circle r="3" fill="#38bdf8" filter="url(#glow)">
                        <animateMotion
                          path={`M ${sourceNode.x * 10} ${sourceNode.y * 6} Q ${midX * 10} ${midY * 6} ${targetNode.x * 10} ${targetNode.y * 6}`}
                          dur="2.4s"
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
                    ? 'opacity-30'
                    : 'opacity-90'
                }`}
              >
                {/* Core Anchor Node Special Styling (Central Constitution & BSA 2023) */}
                {isCore ? (
                  <div className="relative flex flex-col items-center">
                    {/* Concentric Glowing Orbital Rings */}
                    <div className="absolute -inset-4 rounded-full border border-cyan-500/30 animate-spin-slow pointer-events-none"></div>
                    <div className="absolute -inset-7 rounded-full border border-cyan-400/15 animate-reverse-spin pointer-events-none"></div>

                    <div className="px-5 py-3 rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-950/90 to-slate-950 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/50 flex items-center gap-3 ring-4 ring-cyan-500/20">
                      <span className="text-2xl animate-pulse">{node.icon}</span>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                            CORE FOUNDATION
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        </div>
                        <h4 className="text-xs font-black text-white font-mono tracking-wide">
                          {node.label}
                        </h4>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Standard Satellite Nodes
                  <div
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 shadow-lg backdrop-blur-md transition-all ${colors.bg} ${colors.border} ${
                      isSelected
                        ? `ring-2 ring-cyan-400 ${colors.glow} scale-105`
                        : 'hover:border-white'
                    }`}
                  >
                    <span className="text-sm">{node.icon}</span>
                    <div className="text-left">
                      <span className="text-[9px] font-mono font-bold block text-slate-300 whitespace-nowrap group-hover:text-white">
                        {node.label}
                      </span>
                      {node.citation && (
                        <span className="text-[8px] font-mono text-slate-400 block truncate max-w-[120px]">
                          {node.citation}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Zoom and Center View Controls */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-slate-400 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
              className="p-1 hover:text-white rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
              className="p-1 hover:text-white rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 py-0.5 text-[10px] font-mono hover:text-white rounded"
              title="Reset View"
            >
              100%
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. RIGHT NODE INSPECTOR DRAWER (DEEP LEGAL/EVIDENCE INFO) */}
        {/* ========================================================= */}
        <div className="w-72 sm:w-80 shrink-0 border-l border-slate-800/80 bg-slate-950/90 p-4 flex flex-col justify-between z-10 backdrop-blur-xl overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedNode.icon}</span>
                  <div>
                    <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                      NODE INSPECTOR
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      CAT: {selectedNode.category}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {selectedNode.status.toUpperCase()}
                </span>
              </div>

              {/* Node Title & Description */}
              <div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {selectedNode.label}
                </h3>
                {selectedNode.citation && (
                  <p className="text-[11px] font-mono text-emerald-400 font-semibold mt-1">
                    {selectedNode.citation}
                  </p>
                )}
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              {/* SHA-256 Hash Seal (If applicable) */}
              {selectedNode.sha256 && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-cyan-400" /> SHA-256 HASH ATTESTATION:
                  </span>
                  <div className="text-[9px] font-mono text-cyan-300 break-all bg-slate-950 p-1.5 rounded border border-slate-800/80">
                    {selectedNode.sha256}
                  </div>
                </div>
              )}

              {/* Connected Dependencies Count */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                  Connected Dependencies ({selectedNode.dependencies.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.dependencies.map((depId) => {
                    const depNode = nodes.find((n) => n.id === depId);
                    return (
                      <button
                        key={depId}
                        onClick={() => setSelectedNodeId(depId)}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-900 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors"
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
                    className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all"
                  >
                    <span>Open Case Dossier</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                {setActiveTab && (
                  <button
                    onClick={() => setActiveTab('evidence')}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-[11px] flex items-center justify-center gap-1.5 border border-slate-800 transition-all"
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
      {/* 4. BOTTOM DOCKED GYAAN GURU AI SIMULATION LAYER          */}
      {/* ========================================================= */}
      <div className="relative z-20 border-t border-slate-800/90 bg-slate-950/90 p-4 backdrop-blur-xl space-y-3">
        {/* Quick Simulation Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Quick AI Simulations:
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
              className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-slate-900/90 hover:bg-cyan-950/80 text-slate-300 hover:text-cyan-300 border border-slate-800/90 transition-all"
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
            placeholder="Ask GYAAN GURU to simulate legal compliance, trace evidence custody, or inspect gaps..."
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
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
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
