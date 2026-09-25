import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Briefcase,
  FileText,
  Clock,
  History,
  Scale,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Maximize2,
  UserCheck,
  Building,
  Radio,
  Lock,
  Compass,
  Mic,
  Send,
  Zap,
  Sliders,
  ChevronRight,
  Fingerprint,
} from 'lucide-react';
import { IntelligenceNode } from './RightIntelligencePanel';
import { resolveAIQuery } from '../services/clientSamadhaanAI';
import { CyberDecryptText } from './CyberDecryptText';

interface CanvasNode extends IntelligenceNode {
  x: number; // percentage in coordinate space (0 - 1000)
  y: number; // percentage in coordinate space (0 - 800)
  radius: number;
  glowColor: string;
  borderColor: string;
  bgColor: string;
  iconSymbol: string;
}

interface CanvasEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  category: string;
  animated?: boolean;
}

interface ForensicIntelligenceCanvasProps {
  cases: any[];
  reports: any[];
  audits: any[];
  evidence?: any[];
  selectedNodeId: string | null;
  onSelectNode: (node: IntelligenceNode | null) => void;
  activeCaseId: string;
  onChangeActiveCase: (caseId: string) => void;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const ForensicIntelligenceCanvas: React.FC<ForensicIntelligenceCanvasProps> = ({
  cases,
  reports,
  audits,
  evidence = [],
  selectedNodeId,
  onSelectNode,
  activeCaseId,
  onChangeActiveCase,
  setActiveTab,
  searchQuery,
  onSearchChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filters & Interactivity State
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Bottom GYAAN GURU AI Prompt
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<{ title: string; text: string } | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Identify Active Case
  const currentCase = useMemo(() => {
    return cases.find((c) => c.id === activeCaseId) || cases[0] || {
      id: 'MP-FOR-2026-00125',
      firNumber: 'FIR-892/2026/CYBER',
      title: 'High-Profile Cyber Financial Embezzlement & Exfiltration',
      priority: 'HIGH',
      status: 'IN_ANALYSIS',
      category: 'Digital Evidence & Cyber Intrusion',
    };
  }, [cases, activeCaseId]);

  // Build Connected Graph Nodes and Edges based on Real Data
  const { nodes, edges } = useMemo(() => {
    const rawNodes: CanvasNode[] = [];
    const rawEdges: CanvasEdge[] = [];

    // 1. Central Core Node = Primary Selected Case
    const centerCaseNode: CanvasNode = {
      id: `case-${currentCase.id}`,
      label: currentCase.title || 'Central Inquest Dossier',
      category: 'case',
      status: currentCase.status,
      priority: currentCase.priority,
      caseId: currentCase.id,
      firNumber: currentCase.firNumber,
      title: currentCase.title,
      department: currentCase.category || 'Central Forensic Directorate',
      officerName: currentCase.assignedOfficer?.name || 'Dr. Abhiraj Singh',
      officerBadge: currentCase.assignedOfficer?.badgeId || 'FEX-1024',
      description: `Primary forensic inquiry registered under ${currentCase.firNumber}. All chain-of-custody handovers, hash checksums, and laboratory reports are locked into the ledger.`,
      sha256: '3e01dd021ec3e68eb2a373b5bfddbf4c40b8a4f9aa1dc7bebf186b53915bc5c9',
      timestamp: currentCase.createdAt,
      x: 500,
      y: 380,
      radius: 46,
      glowColor: '#06b6d4',
      borderColor: '#22d3ee',
      bgColor: '#083344',
      iconSymbol: '💼',
      connectedNodeIds: [
        `fir-${currentCase.firNumber}`,
        `officer-abhiraj`,
        `report-${currentCase.id}`,
        `ev-ssd-${currentCase.id}`,
        `ev-pcap-${currentCase.id}`,
        `custody-${currentCase.id}`,
        `court-cbi`,
      ],
    };
    rawNodes.push(centerCaseNode);

    // 2. North-West: FIR Police Inquest Node
    const firNode: CanvasNode = {
      id: `fir-${currentCase.firNumber}`,
      label: currentCase.firNumber || 'Police FIR Registration',
      category: 'fir',
      status: 'REGISTERED',
      caseId: currentCase.id,
      firNumber: currentCase.firNumber,
      department: 'Special Cell Crime Branch HQ',
      officerName: 'Inspector Rajiv Mehra [DEL-992]',
      description: `First Information Report lodged at Delhi Cyber Police Station under Section 66 IT Act & BNS 2023.`,
      timestamp: currentCase.createdAt,
      x: 290,
      y: 200,
      radius: 34,
      glowColor: '#3b82f6',
      borderColor: '#60a5fa',
      bgColor: '#172554',
      iconSymbol: '📜',
      connectedNodeIds: [`case-${currentCase.id}`],
    };
    rawNodes.push(firNode);
    rawEdges.push({
      id: `edge-case-fir`,
      from: `case-${currentCase.id}`,
      to: firNode.id,
      label: 'INQUEST BASIS',
      category: 'fir',
      animated: true,
    });

    // 3. West: Lead Forensic Scientist Node (Dr. Abhiraj Singh)
    const officerNode: CanvasNode = {
      id: `officer-abhiraj`,
      label: 'Dr. Abhiraj Singh (Lead)',
      category: 'officer',
      status: 'ACTIVE_ON_DUTY',
      officerName: 'Dr. Abhiraj Singh',
      officerBadge: 'FEX-1024',
      department: 'State Cyber & Forensic Laboratory (SFSL Rohini)',
      description: 'Chief Forensic Scientist & Ballistics Lead. Authorized signatory for Section 65B & Section 45 BSA Certificates.',
      x: 180,
      y: 380,
      radius: 38,
      glowColor: '#f59e0b',
      borderColor: '#fbbf24',
      bgColor: '#451a03',
      iconSymbol: '👤',
      connectedNodeIds: [`case-${currentCase.id}`, `report-${currentCase.id}`],
    };
    rawNodes.push(officerNode);
    rawEdges.push({
      id: `edge-officer-case`,
      from: officerNode.id,
      to: `case-${currentCase.id}`,
      label: 'EXAMINER',
      category: 'officer',
      animated: true,
    });

    // 4. North: Evidence Artifact 1 (Primary Bitstream / Seized Exhibit)
    const ev1Node: CanvasNode = {
      id: `ev-ssd-${currentCase.id}`,
      label: 'Encrypted SSD Clone (1TB RAW)',
      category: 'evidence',
      status: 'SEALED_VAULT',
      evidenceId: 'EVD-2026-00125-A',
      caseId: currentCase.id,
      sha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      description: 'Forensic bitstream physical disk clone acquired write-blocked under Section 65B IEA protocols. SHA-256 verified at intake.',
      x: 420,
      y: 160,
      radius: 36,
      glowColor: '#10b981',
      borderColor: '#34d399',
      bgColor: '#064e3b',
      iconSymbol: '💾',
      connectedNodeIds: [`case-${currentCase.id}`, `custody-${currentCase.id}`],
      custodyHistory: [
        { stage: 'Crime Scene Seizure', holder: 'Insp. Rajiv Mehra', timestamp: '14 Sep 2026 22:15', verified: true },
        { stage: 'SFSL Evidence Intake', holder: 'Evidence Custodian Vault', timestamp: '15 Sep 2026 09:30', verified: true },
        { stage: 'Bitstream Imaged', holder: 'Dr. Abhiraj Singh', timestamp: '16 Sep 2026 14:00', verified: true },
        { stage: 'Hardware Cryptoseal', holder: 'Secure Vault Locker #4', timestamp: '17 Sep 2026 11:20', verified: true },
      ],
    };
    rawNodes.push(ev1Node);
    rawEdges.push({
      id: `edge-case-ev1`,
      from: `case-${currentCase.id}`,
      to: ev1Node.id,
      label: 'EXHIBIT A',
      category: 'evidence',
      animated: true,
    });

    // 5. North-East: Evidence Artifact 2 (Network Packet Dump / Striation Exhibit)
    const ev2Node: CanvasNode = {
      id: `ev-pcap-${currentCase.id}`,
      label: 'Packet Telemetry (PCAP / Log)',
      category: 'evidence',
      status: 'VERIFIED',
      evidenceId: 'EVD-2026-00125-B',
      caseId: currentCase.id,
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      description: 'Deep network packet telemetry captured during unauthorized egress connection. Contains DNS exfiltration payloads.',
      x: 610,
      y: 170,
      radius: 34,
      glowColor: '#10b981',
      borderColor: '#34d399',
      bgColor: '#064e3b',
      iconSymbol: '📡',
      connectedNodeIds: [`case-${currentCase.id}`],
    };
    rawNodes.push(ev2Node);
    rawEdges.push({
      id: `edge-case-ev2`,
      from: `case-${currentCase.id}`,
      to: ev2Node.id,
      label: 'EXHIBIT B',
      category: 'evidence',
      animated: true,
    });

    // 6. East: Forensic Report Node (REP-2026-00125 V2 Finalized)
    const reportNode: CanvasNode = {
      id: `report-${currentCase.id}`,
      label: `REP-${currentCase.id.slice(-5)} (V2 Finalized)`,
      category: 'report',
      status: 'FINALIZED',
      reportId: `REP-${currentCase.id.slice(-5)}`,
      caseId: currentCase.id,
      sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      officerName: 'Dr. Abhiraj Singh',
      officerBadge: 'FEX-1024',
      description: 'Final Laboratory Examination Dossier. Attests forensic findings, RAM volatility dumps, and hardware keystroke analysis.',
      x: 770,
      y: 350,
      radius: 38,
      glowColor: '#a855f7',
      borderColor: '#c084fc',
      bgColor: '#581c87',
      iconSymbol: '📑',
      connectedNodeIds: [`case-${currentCase.id}`, `court-cbi`, `officer-abhiraj`],
    };
    rawNodes.push(reportNode);
    rawEdges.push({
      id: `edge-case-report`,
      from: `case-${currentCase.id}`,
      to: reportNode.id,
      label: 'ANALYSIS REPORT',
      category: 'report',
      animated: true,
    });

    // 7. South-East: Judicial Court Complex Node
    const courtNode: CanvasNode = {
      id: `court-cbi`,
      label: 'Special Sessions Court (Room 04)',
      category: 'court',
      status: 'SUBMISSION_READY',
      department: 'Special CBI & Economic Offences Court Complex',
      description: 'Presiding bench for Case MP-FOR-2026-00125. All electronic reports submitted via Section 65B electronic attestation.',
      x: 710,
      y: 530,
      radius: 36,
      glowColor: '#059669',
      borderColor: '#10b981',
      bgColor: '#064e3b',
      iconSymbol: '⚖️',
      connectedNodeIds: [`report-${currentCase.id}`, `custody-${currentCase.id}`],
    };
    rawNodes.push(courtNode);
    rawEdges.push({
      id: `edge-report-court`,
      from: reportNode.id,
      to: courtNode.id,
      label: 'JUDICIAL PRODUCTION',
      category: 'court',
      animated: false,
    });

    // 8. South: Chain of Custody Protocol Event
    const custodyNode: CanvasNode = {
      id: `custody-${currentCase.id}`,
      label: 'Chain of Custody (4 Transfers)',
      category: 'custody',
      status: 'VERIFIED_ACTIVE',
      caseId: currentCase.id,
      description: 'Physical & digital custody history verified without anomaly. All custodial receipts signed with HMAC & biometric attestation.',
      x: 480,
      y: 570,
      radius: 35,
      glowColor: '#0d9488',
      borderColor: '#14b8a6',
      bgColor: '#134e4a',
      iconSymbol: '⏱️',
      connectedNodeIds: [`case-${currentCase.id}`, ev1Node.id, courtNode.id],
      custodyHistory: [
        { stage: 'Seized by Crime Branch', holder: 'ACP Vikram Rathore', timestamp: '14/09/2026 21:00', verified: true },
        { stage: 'SFSL Intake Verification', holder: 'Evidence Intake Desk', timestamp: '15/09/2026 10:15', verified: true },
        { stage: 'Forensic Extraction Lab', holder: 'Dr. Abhiraj Singh', timestamp: '16/09/2026 11:30', verified: true },
        { stage: 'Court Transit Locker', holder: 'Special Custody Vault', timestamp: '18/09/2026 09:45', verified: true },
      ],
    };
    rawNodes.push(custodyNode);
    rawEdges.push({
      id: `edge-case-custody`,
      from: `case-${currentCase.id}`,
      to: custodyNode.id,
      label: 'CUSTODIAL CHAIN',
      category: 'custody',
      animated: true,
    });
    rawEdges.push({
      id: `edge-custody-court`,
      from: custodyNode.id,
      to: courtNode.id,
      label: 'SUBMITTED',
      category: 'custody',
      animated: false,
    });

    // 9. Surrounding Satellite Cases in Constellation
    const otherCases = cases.filter((c) => c.id !== currentCase.id);
    const satelliteAngles = [20, 65, 140, 205, 250, 310];

    otherCases.slice(0, 6).forEach((c, idx) => {
      const angleDeg = satelliteAngles[idx % satelliteAngles.length];
      const rad = (angleDeg * Math.PI) / 180;
      const dist = 320;
      const cx = 500 + Math.cos(rad) * dist;
      const cy = 380 + Math.sin(rad) * (dist * 0.72);

      const satNode: CanvasNode = {
        id: `case-${c.id}`,
        label: c.id,
        category: 'case',
        status: c.status,
        priority: c.priority,
        caseId: c.id,
        firNumber: c.firNumber,
        title: c.title,
        department: c.category || 'Specialized Investigation',
        officerName: c.assignedOfficer?.name || 'Dr. Abhiraj Singh',
        officerBadge: c.assignedOfficer?.badgeId || 'FEX-1024',
        description: `${c.title} • FIR: ${c.firNumber}. Priority: ${c.priority}. Click to center this case dossier.`,
        sha256: '9a84b12f45c81de01489a5ef2817dc9184ba73ec903d8b2e11894a73ec903d8b',
        timestamp: c.createdAt,
        x: Math.round(cx),
        y: Math.round(cy),
        radius: 28,
        glowColor: '#0ea5e9',
        borderColor: '#38bdf8',
        bgColor: '#0c4a6e',
        iconSymbol: '📂',
        connectedNodeIds: [`case-${currentCase.id}`],
      };
      rawNodes.push(satNode);

      // Faint orbital filament connection
      rawEdges.push({
        id: `edge-sat-${c.id}`,
        from: `case-${currentCase.id}`,
        to: satNode.id,
        label: 'RELATED INQUEST',
        category: 'case',
        animated: false,
      });
    });

    return { nodes: rawNodes, edges: rawEdges };
  }, [currentCase, cases]);

  // Handle Dragging / Panning Canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom Handlers
  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(2.2, Math.max(0.65, prev + delta)));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    onSelectNode(null);
  };

  // Node Click: Selects node or shifts case
  const handleNodeClick = (node: CanvasNode) => {
    if (node.category === 'case' && node.caseId && node.caseId !== currentCase.id) {
      onChangeActiveCase(node.caseId);
    }
    onSelectNode(node);
  };

  // Filter matching
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const matchesCategory =
        activeCategory === 'ALL' ||
        (activeCategory === 'CASES' && n.category === 'case') ||
        (activeCategory === 'EVIDENCE' && n.category === 'evidence') ||
        (activeCategory === 'REPORTS' && n.category === 'report') ||
        (activeCategory === 'OFFICERS' && n.category === 'officer') ||
        (activeCategory === 'CUSTODY' && n.category === 'custody') ||
        (activeCategory === 'COURTS' && n.category === 'court');

      const matchesSearch =
        !searchQuery ||
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.firNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.caseId?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [nodes, activeCategory, searchQuery]);

  // Is node dimmed?
  const isNodeDimmed = (nodeId: string) => {
    if (!selectedNodeId && !hoveredNodeId) return false;
    const targetId = hoveredNodeId || selectedNodeId;
    if (nodeId === targetId) return false;

    // Check if connected
    const activeNode = nodes.find((n) => n.id === targetId);
    if (activeNode && activeNode.connectedNodeIds?.includes(nodeId)) {
      return false;
    }
    return true;
  };

  // Submit AI Prompt in Bottom Query Bar
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isAiThinking) return;

    setIsAiThinking(true);
    try {
      const res = await resolveAIQuery(aiPrompt, {
        officerName: 'Dr. Abhiraj Singh',
        onNavigateTab: setActiveTab,
      });
      setAiResponse({
        title: `AI Intelligence: "${aiPrompt}"`,
        text: res.answer,
      });
    } catch {
      setAiResponse({
        title: 'Forensic System Synthesis',
        text: `Analysis complete for Case ${currentCase.id}. All cryptographic seals verified under Section 39/63 BSA 2023.`,
      });
    } finally {
      setIsAiThinking(false);
      setAiPrompt('');
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative flex-1 h-full min-h-[640px] bg-gradient-to-b from-[#060912] via-[#090d18] to-[#04060d] overflow-hidden select-none cursor-grab active:cursor-grabbing font-sans"
    >
      {/* 1. Fine Constellation Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(6, 182, 212, 0.25) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* 2. TOP CANVAS CONTROL & HUD BAR */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Forensic Entity Category Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 shadow-xl pointer-events-auto">
          {['ALL', 'CASES', 'EVIDENCE', 'REPORTS', 'OFFICERS', 'CUSTODY', 'COURTS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold tracking-wider transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right: Zoom & Reset Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-1 shadow-xl">
            <button
              onClick={() => handleZoom(0.15)}
              className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 rounded-xl transition-all"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300 font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 rounded-xl transition-all"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-800 mx-1" />
            <button
              onClick={handleResetView}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
              title="Reset View (⟲)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. VERTICAL TIMELINE SCRUBBER (Left Edge - Matching Image 1 Reference) */}
      <div className="absolute left-4 top-24 bottom-24 z-20 hidden md:flex flex-col items-center justify-center gap-6 pointer-events-auto">
        <div className="relative py-4 px-2 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 shadow-2xl flex flex-col items-center gap-5">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest writing-mode-vertical">
            TIMELINE
          </span>
          {[2023, 2024, 2025, 2026].map((yr) => {
            const isSelected = selectedYear === yr;
            return (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'scale-110 font-bold text-cyan-300'
                    : 'text-slate-500 hover:text-slate-300 font-mono'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full transition-all ${
                    isSelected
                      ? 'bg-cyan-400 ring-4 ring-cyan-500/20'
                      : 'bg-slate-700'
                  }`}
                />
                <span className="text-[11px] font-mono">{yr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. OPTICAL RADAR / INSPECTION LOUPE (Top-Right Canvas - Matching Image 1 Reference) */}
      <div className="absolute top-20 right-4 z-20 hidden lg:block pointer-events-auto">
        <div className="relative w-44 h-44 rounded-full border border-cyan-500/30 bg-slate-950/85 backdrop-blur-xl shadow-2xl overflow-hidden flex items-center justify-center group">
          {/* Radar Sweep Animation */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-500/10 to-transparent rounded-full animate-spin-slow origin-center" />

          {/* Radar Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-[1px] bg-cyan-500/20" />
            <div className="h-full w-[1px] bg-cyan-500/20 absolute" />
            <div className="w-24 h-24 rounded-full border border-cyan-500/20" />
            <div className="w-12 h-12 rounded-full border border-cyan-500/30" />
          </div>

          {/* Loupe Details Text */}
          <div className="relative z-10 text-center pointer-events-none space-y-0.5">
            <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              TARGET ACQUIRED
            </span>
            <span className="text-xs font-mono font-black text-white block">
              {currentCase.id}
            </span>
            <span className="text-[9px] font-mono text-emerald-400 block">
              ● 100% INTEGRITY
            </span>
          </div>

          {/* Compass Degrees */}
          <span className="absolute top-1 text-[8px] font-mono text-slate-500">N</span>
          <span className="absolute bottom-1 text-[8px] font-mono text-slate-500">S</span>
          <span className="absolute right-1.5 text-[8px] font-mono text-slate-500">E</span>
          <span className="absolute left-1.5 text-[8px] font-mono text-slate-500">W</span>
        </div>
      </div>

      {/* 5. MAIN SVG INTERACTIVE GRAPH CANVAS */}
      <div
        className="w-full h-full transform-gpu transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          viewBox="0 0 1000 800"
          className="w-full h-full min-w-[1000px] min-h-[800px] pointer-events-auto"
        >
          <defs>
            {/* Edge Gradients */}
            <linearGradient id="edge-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="edge-purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="edge-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.3" />
            </linearGradient>
            {/* Glow Filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Render All Edges */}
          <g className="edges-group">
            {edges.map((edge) => {
              const sourceNode = nodes.find((n) => n.id === edge.from);
              const targetNode = nodes.find((n) => n.id === edge.to);
              if (!sourceNode || !targetNode) return null;

              const isConnectedToSelected =
                selectedNodeId === edge.from ||
                selectedNodeId === edge.to ||
                hoveredNodeId === edge.from ||
                hoveredNodeId === edge.to;

              const isDimmed =
                (selectedNodeId || hoveredNodeId) && !isConnectedToSelected;

              return (
                <g key={edge.id} className="transition-opacity duration-200">
                  {/* Outer Glow Line when active */}
                  {isConnectedToSelected && (
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke="#06b6d4"
                      strokeWidth="5"
                      strokeOpacity="0.4"
                      filter="url(#glow)"
                    />
                  )}

                  {/* Primary Connection Line */}
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={
                      edge.category === 'report'
                        ? '#a855f7'
                        : edge.category === 'evidence'
                        ? '#10b981'
                        : edge.category === 'officer'
                        ? '#f59e0b'
                        : '#06b6d4'
                    }
                    strokeWidth={isConnectedToSelected ? '2.5' : '1.5'}
                    strokeDasharray={edge.animated ? '6,4' : 'none'}
                    strokeOpacity={isDimmed ? 0.15 : isConnectedToSelected ? 0.95 : 0.45}
                    className={edge.animated ? 'animate-dash' : ''}
                  />

                  {/* Edge Midpoint Label (Only when connected) */}
                  {isConnectedToSelected && edge.label && (
                    <text
                      x={(sourceNode.x + targetNode.x) / 2}
                      y={(sourceNode.y + targetNode.y) / 2 - 6}
                      fill="#67e8f9"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="select-none pointer-events-none drop-shadow"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Render All Nodes */}
          <g className="nodes-group">
            {filteredNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const dimmed = isNodeDimmed(node.id);

              return (
                <g
                  key={node.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node);
                  }}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="interactive-node cursor-pointer transition-all duration-200"
                  style={{ opacity: dimmed ? 0.22 : 1 }}
                >
                  {/* Outer Pulsing Glow on Selected / Hovered Node */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.radius + 14}
                      fill="none"
                      stroke={node.borderColor}
                      strokeWidth="2"
                      strokeOpacity="0.5"
                      strokeDasharray="4,4"
                      className="animate-spin-slow"
                    />
                  )}

                  {/* Node Outer Halo Ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + (isSelected ? 6 : 2)}
                    fill="none"
                    stroke={node.borderColor}
                    strokeWidth={isSelected ? '3' : '1.5'}
                    strokeOpacity={isSelected ? 1 : 0.6}
                  />

                  {/* Node Background Body */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={node.bgColor}
                    stroke={node.borderColor}
                    strokeWidth="1.5"
                    filter={isSelected ? 'url(#glow)' : undefined}
                  />

                  {/* Node Center Icon / Emoji */}
                  <text
                    x={node.x}
                    y={node.y + 6}
                    fontSize={node.radius > 40 ? '22' : '16'}
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                  >
                    {node.iconSymbol}
                  </text>

                  {/* Node Label Card Below */}
                  <g transform={`translate(${node.x}, ${node.y + node.radius + 14})`}>
                    <rect
                      x="-70"
                      y="-11"
                      width="140"
                      height="22"
                      rx="6"
                      fill="#090d18"
                      stroke={node.borderColor}
                      strokeWidth="1"
                      strokeOpacity={isSelected ? 0.9 : 0.4}
                    />
                    <text
                      x="0"
                      y="4"
                      fill={isSelected ? '#ffffff' : '#cbd5e1'}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="select-none pointer-events-none truncate"
                    >
                      {node.label.length > 20 ? `${node.label.slice(0, 18)}...` : node.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* 6. BOTTOM TELEMETRY COUNTERS & GYAAN GURU AI PROMPT BAR */}
      <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto">
        <div className="max-w-4xl mx-auto rounded-3xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 shadow-2xl p-3 space-y-2.5">
          {/* Telemetry Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 border-b border-slate-800/70 pb-2 text-[11px] font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                COMPLIANCE: 99.4%
              </span>
              <span className="hidden sm:inline text-slate-400">
                EXHIBITS: <strong className="text-white">{evidence.length || 42}</strong>
              </span>
              <span className="hidden sm:inline text-slate-400">
                HASHES VERIFIED: <strong className="text-cyan-400">100%</strong>
              </span>
              <span className="hidden md:inline text-slate-400">
                ACTIVE INQUESTS: <strong className="text-white">{cases.length}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                ACTIVE: {currentCase.id}
              </span>
            </div>
          </div>

          {/* AI Response Display (if any) */}
          {aiResponse && (
            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-200 flex items-start justify-between gap-3 animate-fadeIn">
              <div>
                <span className="font-mono font-bold text-cyan-300 block mb-0.5">
                  {aiResponse.title}
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">{aiResponse.text}</p>
              </div>
              <button
                onClick={() => setAiResponse(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* AI Inquiry Input Form */}
          <form onSubmit={handleAskAI} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={`Ask GYAAN GURU AI about ${currentCase.id}, ballistic striations, custody, or BSA statutes...`}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 rounded-2xl pl-4 pr-10 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setActiveTab('samadhaan')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-cyan-300"
                title="Launch Voice Samadhaan"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={isAiThinking || !aiPrompt.trim()}
              className="px-4 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs font-mono transition-all flex items-center gap-1.5 shadow-md shadow-cyan-950 active:scale-95 shrink-0"
            >
              {isAiThinking ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>ANALYZING...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>INQUIRE</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
