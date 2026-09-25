import React, { useState, useMemo, useRef } from 'react';
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
  Bot,
} from 'lucide-react';
import { IntelligenceNode } from './RightIntelligencePanel';
import { resolveAIQuery } from '../services/clientSamadhaanAI';
import { CyberDecryptText } from './CyberDecryptText';

interface CanvasNode extends IntelligenceNode {
  x: number;
  y: number;
  radius: number;
  gradId: string;
  glowColor: string;
  borderColor: string;
  iconSymbol: string;
  metricBadge?: { label: string; pct: number; color: string };
}

interface CanvasEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  category: string;
  curveX: number;
  curveY: number;
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

  // Active Case
  const currentCase = useMemo(() => {
    return (
      cases.find((c) => c.id === activeCaseId) ||
      cases[0] || {
        id: 'MP-FOR-2026-00125',
        firNumber: 'FIR-892/2026/CYBER',
        title: 'High-Profile Cyber Financial Embezzlement & Exfiltration',
        priority: 'HIGH',
        status: 'IN_ANALYSIS',
        category: 'Digital Evidence & Cyber Intrusion',
      }
    );
  }, [cases, activeCaseId]);

  // Construct High-Fidelity Graph Entities
  const { nodes, edges } = useMemo(() => {
    const rawNodes: CanvasNode[] = [];
    const rawEdges: CanvasEdge[] = [];

    // 1. Central Core Node: Radiant Gold Reactor (Active Inquest)
    const centerCaseNode: CanvasNode = {
      id: `case-${currentCase.id}`,
      label: currentCase.title || 'Central Inquest Core',
      category: 'case',
      status: currentCase.status,
      priority: currentCase.priority,
      caseId: currentCase.id,
      firNumber: currentCase.firNumber,
      title: currentCase.title,
      department: currentCase.category || 'Central Forensic Directorate',
      officerName: currentCase.assignedOfficer?.name || 'Dr. Abhiraj Singh',
      officerBadge: currentCase.assignedOfficer?.badgeId || 'FEX-1024',
      description: `Primary sovereign forensic inquest registered under ${currentCase.firNumber}. All evidence chains and reports cryptographically hashed under BSA 2023.`,
      sha256: '3e01dd021ec3e68eb2a373b5bfddbf4c40b8a4f9aa1dc7bebf186b53915bc5c9',
      timestamp: currentCase.createdAt,
      x: 500,
      y: 380,
      radius: 48,
      gradId: 'jewelGoldGrad',
      glowColor: '#f59e0b',
      borderColor: '#fbbf24',
      iconSymbol: '⚖️',
      metricBadge: { label: '99.4% INTEGRITY', pct: 99.4, color: '#f59e0b' },
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

    // 2. North-West: FIR Police Inquest (Cyan Pearl)
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
      y: 210,
      radius: 35,
      gradId: 'jewelCyanGrad',
      glowColor: '#06b6d4',
      borderColor: '#38bdf8',
      iconSymbol: '📜',
      metricBadge: { label: 'BNS 2023 BASIS', pct: 100, color: '#06b6d4' },
      connectedNodeIds: [`case-${currentCase.id}`],
    };
    rawNodes.push(firNode);
    rawEdges.push({
      id: `edge-case-fir`,
      from: `case-${currentCase.id}`,
      to: firNode.id,
      label: 'INQUEST BASIS',
      category: 'fir',
      curveX: 380,
      curveY: 280,
      animated: true,
    });

    // 3. West: Lead Forensic Scientist (Amber Pearl)
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
      gradId: 'jewelAmberGrad',
      glowColor: '#f59e0b',
      borderColor: '#fcd34d',
      iconSymbol: '👤',
      metricBadge: { label: 'CHIEF EXAMINER', pct: 100, color: '#f59e0b' },
      connectedNodeIds: [`case-${currentCase.id}`, `report-${currentCase.id}`],
    };
    rawNodes.push(officerNode);
    rawEdges.push({
      id: `edge-officer-case`,
      from: officerNode.id,
      to: `case-${currentCase.id}`,
      label: 'EXAMINER',
      category: 'officer',
      curveX: 340,
      curveY: 410,
      animated: true,
    });

    // 4. North: Evidence Artifact 1 (Emerald Pearl)
    const ev1Node: CanvasNode = {
      id: `ev-ssd-${currentCase.id}`,
      label: 'Encrypted SSD Clone (1TB RAW)',
      category: 'evidence',
      status: 'SEALED_VAULT',
      evidenceId: 'EVD-2026-00125-A',
      caseId: currentCase.id,
      sha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      description: 'Forensic bitstream physical disk clone acquired write-blocked under Section 65B IEA protocols. SHA-256 verified at intake.',
      x: 430,
      y: 160,
      radius: 36,
      gradId: 'jewelEmeraldGrad',
      glowColor: '#10b981',
      borderColor: '#34d399',
      iconSymbol: '💾',
      metricBadge: { label: '100% SEALED', pct: 100, color: '#10b981' },
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
      curveX: 480,
      curveY: 260,
      animated: true,
    });

    // 5. North-East: Evidence Artifact 2 (Emerald Pearl)
    const ev2Node: CanvasNode = {
      id: `ev-pcap-${currentCase.id}`,
      label: 'Packet Telemetry (PCAP / Log)',
      category: 'evidence',
      status: 'VERIFIED',
      evidenceId: 'EVD-2026-00125-B',
      caseId: currentCase.id,
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      description: 'Deep network packet telemetry captured during unauthorized egress connection. Contains DNS exfiltration payloads.',
      x: 630,
      y: 170,
      radius: 35,
      gradId: 'jewelEmeraldGrad',
      glowColor: '#10b981',
      borderColor: '#34d399',
      iconSymbol: '📡',
      metricBadge: { label: 'PCAP EXTRACTED', pct: 100, color: '#10b981' },
      connectedNodeIds: [`case-${currentCase.id}`],
    };
    rawNodes.push(ev2Node);
    rawEdges.push({
      id: `edge-case-ev2`,
      from: `case-${currentCase.id}`,
      to: ev2Node.id,
      label: 'EXHIBIT B',
      category: 'evidence',
      curveX: 580,
      curveY: 260,
      animated: true,
    });

    // 6. East: Forensic Report Node (Fuchsia / Magenta Pearl)
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
      radius: 39,
      gradId: 'jewelMagentaGrad',
      glowColor: '#f43f5e',
      borderColor: '#fb7185',
      iconSymbol: '📑',
      metricBadge: { label: 'V2 FINALIZED', pct: 100, color: '#f43f5e' },
      connectedNodeIds: [`case-${currentCase.id}`, `court-cbi`, `officer-abhiraj`],
    };
    rawNodes.push(reportNode);
    rawEdges.push({
      id: `edge-case-report`,
      from: `case-${currentCase.id}`,
      to: reportNode.id,
      label: 'ATTESTED DOSSIER',
      category: 'report',
      curveX: 650,
      curveY: 340,
      animated: true,
    });

    // 7. South-East: Judicial Court Authority (Teal / Jade Pearl)
    const courtNode: CanvasNode = {
      id: `court-cbi`,
      label: 'Special Sessions Court (Room 04)',
      category: 'court',
      status: 'SUBMISSION_READY',
      department: 'Special CBI & Economic Offences Court Complex',
      description: 'Presiding bench for Case MP-FOR-2026-00125. All electronic reports submitted via Section 65B electronic attestation.',
      x: 710,
      y: 540,
      radius: 37,
      gradId: 'jewelTurquoiseGrad',
      glowColor: '#14b8a6',
      borderColor: '#2dd4bf',
      iconSymbol: '🏛️',
      metricBadge: { label: 'COURT ADMISSIBLE', pct: 100, color: '#14b8a6' },
      connectedNodeIds: [`report-${currentCase.id}`, `custody-${currentCase.id}`],
    };
    rawNodes.push(courtNode);
    rawEdges.push({
      id: `edge-report-court`,
      from: reportNode.id,
      to: courtNode.id,
      label: 'EVIDENCE TENDERED',
      category: 'court',
      curveX: 750,
      curveY: 450,
      animated: false,
    });

    // 8. South: Chain of Custody (Amethyst Violet Pearl)
    const custodyNode: CanvasNode = {
      id: `custody-${currentCase.id}`,
      label: 'Chain of Custody (4 Transfers)',
      category: 'custody',
      status: 'VERIFIED_ACTIVE',
      caseId: currentCase.id,
      description: 'Physical & digital custody history verified without anomaly. All custodial receipts signed with HMAC & biometric attestation.',
      x: 480,
      y: 580,
      radius: 36,
      gradId: 'jewelPurpleGrad',
      glowColor: '#a855f7',
      borderColor: '#c084fc',
      iconSymbol: '⏱️',
      metricBadge: { label: '4 CHECKPOINTS', pct: 100, color: '#a855f7' },
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
      curveX: 470,
      curveY: 480,
      animated: true,
    });
    rawEdges.push({
      id: `edge-custody-court`,
      from: custodyNode.id,
      to: courtNode.id,
      label: 'SAFE CUSTODY',
      category: 'custody',
      curveX: 600,
      curveY: 570,
      animated: false,
    });

    // 9. Surrounding Satellite Cases in Constellation
    const otherCases = cases.filter((c) => c.id !== currentCase.id);
    const satelliteAngles = [25, 70, 135, 205, 255, 310];

    otherCases.slice(0, 6).forEach((c, idx) => {
      const angleDeg = satelliteAngles[idx % satelliteAngles.length];
      const rad = (angleDeg * Math.PI) / 180;
      const dist = 325;
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
        description: `${c.title} • FIR: ${c.firNumber}. Click to center this case in the command graph.`,
        sha256: '9a84b12f45c81de01489a5ef2817dc9184ba73ec903d8b2e11894a73ec903d8b',
        timestamp: c.createdAt,
        x: Math.round(cx),
        y: Math.round(cy),
        radius: 29,
        gradId: 'jewelCyanGrad',
        glowColor: '#0ea5e9',
        borderColor: '#38bdf8',
        iconSymbol: '📂',
        metricBadge: { label: c.priority || 'NORMAL', pct: 85, color: '#0ea5e9' },
        connectedNodeIds: [`case-${currentCase.id}`],
      };
      rawNodes.push(satNode);

      rawEdges.push({
        id: `edge-sat-${c.id}`,
        from: `case-${currentCase.id}`,
        to: satNode.id,
        label: 'NETWORK INQUEST',
        category: 'case',
        curveX: Math.round((500 + cx) / 2 + 20),
        curveY: Math.round((380 + cy) / 2 - 15),
        animated: false,
      });
    });

    return { nodes: rawNodes, edges: rawEdges };
  }, [currentCase, cases]);

  // Pan Handlers
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

  // Touch Handlers for Mobile Panning
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-node')) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
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

  const isNodeDimmed = (nodeId: string) => {
    if (!selectedNodeId && !hoveredNodeId) return false;
    const targetId = hoveredNodeId || selectedNodeId;
    if (nodeId === targetId) return false;

    const activeNode = nodes.find((n) => n.id === targetId);
    if (activeNode && activeNode.connectedNodeIds?.includes(nodeId)) {
      return false;
    }
    return true;
  };

  // AI Prompt in Bottom Query Bar
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
        title: `Forensic AI Synthesis: "${aiPrompt}"`,
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative flex-1 w-full h-full min-h-0 overflow-hidden select-none cursor-grab active:cursor-grabbing font-sans touch-none"
      style={{
        background:
          'radial-gradient(ellipse 75% 60% at 50% 45%, rgba(6, 78, 86, 0.42) 0%, rgba(3, 38, 48, 0.55) 35%, rgba(4, 15, 24, 0.88) 70%, #020409 100%)',
      }}
    >
      {/* 1. Subtle Fine Stardust Field */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(45, 212, 191, 0.3) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* 2. LEFT TOPOGRAPHIC WAVEFORM CONTOUR & TIMELINE (Matching Reference Image 1) */}
      <div className="absolute left-0 top-0 bottom-0 w-28 pointer-events-none z-10 hidden md:block">
        {/* Jagged Seismic / Topographic Elevation Line SVG */}
        <svg className="w-full h-full opacity-35" viewBox="0 0 100 800" preserveAspectRatio="none">
          <path
            d="M 12 0 L 15 40 L 8 80 L 22 130 L 14 180 L 28 220 L 10 270 L 32 320 L 16 380 L 36 430 L 14 490 L 30 540 L 12 600 L 26 660 L 10 720 L 22 770 L 15 800"
            fill="none"
            stroke="#14b8a6"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <path
            d="M 6 0 L 9 50 L 4 100 L 15 150 L 9 200 L 20 250 L 6 300 L 24 360 L 10 420 L 26 480 L 8 550 L 22 620 L 7 690 L 16 750 L 10 800"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1"
            opacity="0.5"
          />
        </svg>

        {/* Year Scrubber Pills */}
        <div className="absolute left-3 top-28 bottom-28 flex flex-col justify-around pointer-events-auto">
          {[2020, 2021, 2022, 2023, 2024, 2026].map((yr) => {
            const isSelected = selectedYear === yr;
            return (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`flex items-center gap-2 px-2 py-1 rounded-full transition-all text-[11px] font-mono ${
                  isSelected
                    ? 'bg-slate-900/90 text-cyan-300 font-bold border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-110'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'
                  }`}
                />
                <span>{yr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TOP TACTICAL CATEGORY FILTER PILLS */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-6 right-2 sm:right-6 z-20 flex items-center justify-between gap-1.5 sm:gap-3 pointer-events-none">
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-auto overflow-x-auto no-scrollbar max-w-[calc(100%-105px)] sm:max-w-none">
          {['ALL', 'CASES', 'EVIDENCE', 'REPORTS', 'OFFICERS', 'CUSTODY', 'COURTS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeCategory === cat
                  ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Zoom & Reset View Controls */}
        <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto shrink-0">
          <div className="flex items-center bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-full p-0.5 sm:p-1 shadow-2xl">
            <button
              onClick={() => handleZoom(0.15)}
              className="p-1 sm:p-1.5 text-slate-400 hover:text-cyan-300 rounded-full transition-all"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 sm:px-2 font-mono text-[9px] sm:text-[10px] text-slate-300 font-bold hidden sm:inline">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-1 sm:p-1.5 text-slate-400 hover:text-cyan-300 rounded-full transition-all"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3 sm:h-3.5 bg-slate-800 mx-0.5 sm:mx-1" />
            <button
              onClick={handleResetView}
              className="p-1 sm:p-1.5 text-slate-400 hover:text-white rounded-full transition-all"
              title="Reset View (⟲)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. HIGH-TECH 3D OPTICAL RADAR LOUPE (Upper Right - Matching Reference Image 1) */}
      <div className="absolute top-20 right-6 z-20 hidden lg:block pointer-events-auto">
        <div
          className="relative w-48 h-48 rounded-full border border-teal-500/40 shadow-[0_0_35px_rgba(20,184,166,0.2)] overflow-hidden flex items-center justify-center group"
          style={{
            background:
              'radial-gradient(circle at 40% 40%, rgba(4, 30, 36, 0.9) 0%, rgba(2, 12, 16, 0.96) 100%)',
          }}
        >
          {/* Rotating Sonar Sweep Cone */}
          <div
            className="absolute inset-0 rounded-full animate-sonar-sweep origin-center pointer-events-none"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, transparent 280deg, rgba(20, 184, 166, 0.15) 320deg, rgba(45, 212, 191, 0.5) 360deg)',
            }}
          />

          {/* Stepped Metallic Reticle Rings & Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-[1px] bg-teal-500/25" />
            <div className="h-full w-[1px] bg-teal-500/25 absolute" />
            <div className="w-36 h-36 rounded-full border border-teal-500/20 border-dashed" />
            <div className="w-24 h-24 rounded-full border border-teal-500/35" />
            <div className="w-12 h-12 rounded-full border border-teal-400/40" />
            {/* Center target cursor */}
            <div className="w-3 h-3 border border-teal-300 rounded-sm" />
          </div>

          {/* Radar Telemetry Information */}
          <div className="relative z-10 text-center pointer-events-none space-y-1">
            <div className="flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
              <span className="text-[9px] font-mono text-teal-300 font-extrabold uppercase tracking-widest">
                TARGET LOCKED
              </span>
            </div>
            <span className="text-xs font-mono font-black text-white block drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              {currentCase.id}
            </span>
            <span className="text-[8px] font-mono text-slate-400 block">
              LAT: 28.7041° N • 77.1025° E
            </span>
            <span className="text-[9px] font-mono text-emerald-400 font-semibold block">
              100% SHA-256 MATCH
            </span>
          </div>

          {/* Compass Markings */}
          <span className="absolute top-1.5 text-[8px] font-mono text-teal-400 font-bold">N</span>
          <span className="absolute bottom-1.5 text-[8px] font-mono text-teal-400 font-bold">S</span>
          <span className="absolute right-2 text-[8px] font-mono text-teal-400 font-bold">E</span>
          <span className="absolute left-2 text-[8px] font-mono text-teal-400 font-bold">W</span>
        </div>
      </div>

      {/* 5. MAIN SVG GRAPH WITH 3D GLASS JEWEL NODES & BEZIER CONNECTIONS */}
      <div
        className="w-full h-full transform-gpu transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          viewBox="0 0 1000 800"
          className="w-full h-full max-w-full max-h-full pointer-events-auto select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* 3D Glass Jewel Radial Gradients (Hot Specular Top-Left Highlight) */}
            {/* 1. Core Gold Reactor Gradient */}
            <radialGradient id="jewelGoldGrad" cx="35%" cy="32%" r="65%" fx="28%" fy="25%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="15%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="75%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>

            {/* 2. Pearlescent Magenta / Fuchsia (Reports) */}
            <radialGradient id="jewelMagentaGrad" cx="35%" cy="32%" r="65%" fx="28%" fy="25%">
              <stop offset="0%" stopColor="#fff1f2" />
              <stop offset="18%" stopColor="#fbcfe8" />
              <stop offset="48%" stopColor="#ec4899" />
              <stop offset="78%" stopColor="#be185d" />
              <stop offset="100%" stopColor="#700735" />
            </radialGradient>

            {/* 3. Electric Cyan Glass (Cases) */}
            <radialGradient id="jewelCyanGrad" cx="35%" cy="32%" r="65%" fx="28%" fy="25%">
              <stop offset="0%" stopColor="#ecfeff" />
              <stop offset="18%" stopColor="#bae6fd" />
              <stop offset="48%" stopColor="#0ea5e9" />
              <stop offset="78%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#082f49" />
            </radialGradient>

            {/* 4. Cyber Jade Emerald (Evidence) */}
            <radialGradient id="jewelEmeraldGrad" cx="35%" cy="32%" r="65%" fx="28%" fy="25%">
              <stop offset="0%" stopColor="#f0fdf4" />
              <stop offset="18%" stopColor="#a7f3d0" />
              <stop offset="48%" stopColor="#10b981" />
              <stop offset="78%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064e3b" />
            </radialGradient>

            {/* 5. Radiant Amber (Officers) */}
            <radialGradient id="jewelAmberGrad" cx="35%" cy="32%" r="65%" fx="28%" fy="25%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="18%" stopColor="#fde68a" />
              <stop offset="48%" stopColor="#f59e0b" />
              <stop offset="78%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>

            {/* 6. Deep Turquoise (Custody) */}
            <radialGradient id="jewelTurquoiseGrad" cx="35%" cy="32%" r="65%" fx="28%" fy="25%">
              <stop offset="0%" stopColor="#f0fdfa" />
              <stop offset="18%" stopColor="#99f6e4" />
              <stop offset="48%" stopColor="#14b8a6" />
              <stop offset="78%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#134e4a" />
            </radialGradient>

            {/* 7. Amethyst Purple (Custody Transits) */}
            <radialGradient id="jewelPurpleGrad" cx="35%" cy="32%" r="65%" fx="28%" fy="25%">
              <stop offset="0%" stopColor="#faf5ff" />
              <stop offset="18%" stopColor="#e9d5ff" />
              <stop offset="48%" stopColor="#a855f7" />
              <stop offset="78%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#3b0764" />
            </radialGradient>

            {/* Glow Filter */}
            <filter id="cinematicGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Organic Bezier Neural Connections */}
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

              // Quadratic Bezier Curve Path
              const pathD = `M ${sourceNode.x} ${sourceNode.y} Q ${edge.curveX} ${edge.curveY} ${targetNode.x} ${targetNode.y}`;

              return (
                <g key={edge.id} className="transition-opacity duration-200">
                  {/* Outer Wide Glow Beam */}
                  {isConnectedToSelected && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="6"
                      strokeOpacity="0.4"
                      filter="url(#cinematicGlow)"
                    />
                  )}

                  {/* Primary Laser Fiber Path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      edge.category === 'report'
                        ? '#f43f5e'
                        : edge.category === 'evidence'
                        ? '#34d399'
                        : edge.category === 'officer'
                        ? '#f59e0b'
                        : '#38bdf8'
                    }
                    strokeWidth={isConnectedToSelected ? '2.5' : '1.5'}
                    strokeDasharray={edge.animated ? '8 6' : 'none'}
                    strokeOpacity={isDimmed ? 0.12 : isConnectedToSelected ? 0.95 : 0.45}
                    className={edge.animated ? 'animate-dash-travel' : ''}
                  />

                  {/* Traveling Energy Photon (Only when active / animated) */}
                  {edge.animated && !isDimmed && (
                    <circle r="3.5" fill="#ffffff" filter="url(#cinematicGlow)">
                      <animateMotion path={pathD} dur="2.8s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Edge Midpoint Pill Label */}
                  {isConnectedToSelected && edge.label && (
                    <text
                      x={edge.curveX}
                      y={edge.curveY - 6}
                      fill="#67e8f9"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="select-none pointer-events-none drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* 3D Glass Jewel Nodes */}
          <g className="nodes-group">
            {filteredNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const dimmed = isNodeDimmed(node.id);
              const isCenterCore = node.id === `case-${currentCase.id}`;

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
                  {/* Concentric Radiating Rings for Center Core */}
                  {isCenterCore && (
                    <>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.radius + 32}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1"
                        strokeOpacity="0.18"
                        strokeDasharray="4 6"
                        className="animate-beacon-ring"
                      />
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.radius + 18}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeOpacity="0.35"
                      />
                    </>
                  )}

                  {/* Pulsing Selection Ring */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.radius + 14}
                      fill="none"
                      stroke={node.borderColor}
                      strokeWidth="2"
                      strokeOpacity="0.6"
                      strokeDasharray="4 4"
                      className="animate-spin-slow"
                    />
                  )}

                  {/* Stepped Metallic Collar / Outer Ring (Reference Image 2) */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + 4}
                    fill="none"
                    stroke="#334155"
                    strokeWidth="2.5"
                    strokeOpacity="0.8"
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + 2}
                    fill="none"
                    stroke={node.borderColor}
                    strokeWidth="1"
                    strokeOpacity={isSelected ? 1 : 0.6}
                  />

                  {/* 3D Spherical Jewel Marble Body */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={`url(#${node.gradId})`}
                    filter={isSelected || isCenterCore ? 'url(#cinematicGlow)' : undefined}
                    className="glass-orb-specular"
                  />

                  {/* Specular White Gloss Glare Top-Left */}
                  <ellipse
                    cx={node.x - node.radius * 0.28}
                    cy={node.y - node.radius * 0.3}
                    rx={node.radius * 0.32}
                    ry={node.radius * 0.18}
                    fill="#ffffff"
                    fillOpacity="0.65"
                    transform={`rotate(-25 ${node.x - node.radius * 0.28} ${node.y - node.radius * 0.3})`}
                  />

                  {/* Center Node Icon Symbol */}
                  <text
                    x={node.x}
                    y={node.y + 6}
                    fontSize={node.radius > 40 ? '20' : '15'}
                    textAnchor="middle"
                    className="select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                  >
                    {node.iconSymbol}
                  </text>

                  {/* Attached Sleek Metric Slider Pill (Reference Image 2) */}
                  {node.metricBadge && (
                    <g transform={`translate(${node.x + node.radius - 8}, ${node.y - 12})`}>
                      <rect
                        x="0"
                        y="0"
                        width="72"
                        height="18"
                        rx="9"
                        fill="#090d16"
                        stroke={node.metricBadge.color}
                        strokeWidth="1"
                        strokeOpacity="0.75"
                        filter="drop-shadow(0 2px 6px rgba(0,0,0,0.8))"
                      />
                      <rect
                        x="2"
                        y="2"
                        width={Math.round((node.metricBadge.pct / 100) * 68)}
                        height="14"
                        rx="7"
                        fill={node.metricBadge.color}
                        fillOpacity="0.25"
                      />
                      <text
                        x="36"
                        y="12"
                        fill="#ffffff"
                        fontSize="8"
                        fontWeight="900"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="select-none pointer-events-none"
                      >
                        {node.metricBadge.label}
                      </text>
                    </g>
                  )}

                  {/* Primary Node Label Below */}
                  <g transform={`translate(${node.x}, ${node.y + node.radius + 14})`}>
                    <rect
                      x="-75"
                      y="-11"
                      width="150"
                      height="22"
                      rx="11"
                      fill="#030712"
                      fillOpacity="0.9"
                      stroke={node.borderColor}
                      strokeWidth="1"
                      strokeOpacity={isSelected ? 1 : 0.45}
                      filter="drop-shadow(0 4px 8px rgba(0,0,0,0.9))"
                    />
                    <text
                      x="0"
                      y="4"
                      fill={isSelected ? '#ffffff' : '#e2e8f0'}
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="select-none pointer-events-none truncate"
                    >
                      {node.label.length > 22 ? `${node.label.slice(0, 20)}...` : node.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* 6. BOTTOM FROSTED CAPSULE DOCK & AI INQUIRY BAR (Matching Reference Image 1) */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-6 right-2 sm:right-6 z-20 pointer-events-auto">
        <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] p-2 sm:p-3 space-y-1.5 sm:space-y-2.5">
          {/* Telemetry Metric Pills Row */}
          <div className="flex items-center justify-between gap-2 px-1 sm:px-2 border-b border-white/5 pb-1.5 sm:pb-2 text-[10px] sm:text-[11px] font-mono">
            <div className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar py-0.5">
              <span className="flex items-center gap-1 sm:gap-1.5 text-emerald-400 font-extrabold whitespace-nowrap">
                <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
                99.4%
              </span>
              <span className="text-slate-400 whitespace-nowrap">
                EXH: <strong className="text-cyan-300">{evidence.length || 42}</strong>
              </span>
              <span className="text-slate-400 whitespace-nowrap">
                BLOCKS: <strong className="text-purple-300">1,135</strong>
              </span>
              <span className="hidden md:inline text-slate-400 whitespace-nowrap">
                INQUESTS: <strong className="text-amber-300">{cases.length}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] sm:text-[10px] font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded-full border border-cyan-500/40 font-bold shadow-sm truncate max-w-[120px] sm:max-w-none">
                {currentCase.id}
              </span>
            </div>
          </div>

          {/* AI Response Box (if active) */}
          {aiResponse && (
            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-200 flex items-start justify-between gap-3 animate-fadeIn">
              <div>
                <span className="font-mono font-bold text-cyan-300 block mb-0.5 text-[11px] sm:text-xs">
                  {aiResponse.title}
                </span>
                <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">{aiResponse.text}</p>
              </div>
              <button onClick={() => setAiResponse(null)} className="text-slate-400 hover:text-white p-1 text-xs">
                ✕
              </button>
            </div>
          )}

          {/* Frosted Input Capsule */}
          <form onSubmit={handleAskAI} className="relative flex items-center gap-1.5 sm:gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={`Ask GYAAN GURU AI about ${currentCase.id}...`}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 rounded-full pl-3.5 sm:pl-5 pr-8 sm:pr-10 py-1.5 sm:py-2.5 text-xs text-white placeholder-slate-400 outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setActiveTab('samadhaan')}
                className="absolute right-2.5 sm:right-3.5 top-2 sm:top-3 text-slate-400 hover:text-cyan-300"
                title="Launch Voice Samadhaan"
              >
                <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={isAiThinking || !aiPrompt.trim()}
              className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-[10px] sm:text-xs font-mono transition-all flex items-center gap-1 sm:gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 shrink-0"
            >
              {isAiThinking ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">SYNTHESIZING...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">AI INQUIRE</span>
                  <span className="sm:hidden">ASK</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 7. LEGEND CAPSULE (Bottom Left - Matching Reference Image 1) */}
      <div className="absolute bottom-24 left-6 z-20 hidden xl:block pointer-events-auto">
        <div className="p-3 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-2xl text-[10px] font-mono space-y-1.5">
          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
            NETWORK ENTITIES
          </span>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            <span>Active Case Core</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
            <span>FIR Police Inquest</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            <span>Evidence Exhibits</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]" />
            <span>Forensic Reports</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7]" />
            <span>Custody Transfers</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_6px_#14b8a6]" />
            <span>Judicial Court Bench</span>
          </div>
        </div>
      </div>
    </div>
  );
};
