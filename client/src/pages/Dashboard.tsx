import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  ShieldCheck,
  Briefcase,
  FileText,
  Clock,
  History,
  Sparkles,
  Lock,
  Radio,
  Sliders,
  ChevronRight,
  Search,
  Scale,
  PanelRightClose,
  PanelRightOpen,
  FolderOpen,
  Filter,
} from 'lucide-react';
import officerPhotoDefault from '../assets/officer_abhiraj.jpg';
import { ForensicIntelligenceCanvas } from '../components/ForensicIntelligenceCanvas';
import { RightIntelligencePanel, IntelligenceNode } from '../components/RightIntelligencePanel';
import { CyberDecryptText } from '../components/CyberDecryptText';

const FALLBACK_CASES = [
  {
    id: 'MP-FOR-2026-00125',
    firNumber: 'FIR-892/2026/CYBER',
    title: 'High-Profile Cyber Financial Embezzlement & Exfiltration',
    category: 'Digital Evidence & Cyber Intrusion',
    status: 'IN_ANALYSIS',
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
    assignedOfficer: { name: 'Dr. Abhiraj Singh', badgeId: 'FEX-1024' },
    documents: [{ originalFilename: 'Encrypted_SSD_Clone.raw' }, { originalFilename: 'WireShark_Dump.pcap' }],
  },
  {
    id: 'MP-FOR-2026-00084',
    firNumber: 'FIR-412/2026/EOW',
    title: 'Central Bank Gateway Intrusion & SWIFT Relay Tampering',
    category: 'Digital Forensics',
    status: 'COMPLETED',
    priority: 'CRITICAL',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    assignedOfficer: { name: 'Dr. Abhiraj Singh', badgeId: 'FEX-1024' },
    documents: [{ originalFilename: 'Server_Memory_Image.raw' }],
  },
  {
    id: 'MH-FOR-2026-00319',
    firNumber: 'FIR-109/2026/CRIME',
    title: 'Ballistic Striae & Rifling Groove Comparative Examination',
    category: 'Ballistics & Firearms',
    status: 'IN_ANALYSIS',
    priority: 'HIGH',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    assignedOfficer: { name: 'Dr. Abhiraj Singh', badgeId: 'FEX-1024' },
    documents: [{ originalFilename: 'Striated_Cartridge_Casing.png' }, { originalFilename: 'Groove_Comparison.png' }],
  },
  {
    id: 'DL-FOR-2026-00502',
    firNumber: 'FIR-782/2026/TRAFFIC',
    title: 'Multi-Vehicle Highway Collision ECU Black-Box Reconstruction',
    category: 'Accident Reconstruction',
    status: 'EVIDENCE_SUBMITTED',
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    assignedOfficer: { name: 'Dr. Abhiraj Singh', badgeId: 'FEX-1024' },
    documents: [{ originalFilename: 'CANBus_Crash_Telemetry.csv' }],
  },
  {
    id: 'KA-FOR-2026-00741',
    firNumber: 'FIR-233/2026/DRUG',
    title: 'Pharma Supply-Chain Counterfeit & Chemical Adulteration Assay',
    category: 'Toxicology & Narcotics',
    status: 'IN_ANALYSIS',
    priority: 'CRITICAL',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    assignedOfficer: { name: 'Dr. Abhiraj Singh', badgeId: 'FEX-1024' },
    documents: [{ originalFilename: 'Mass_Spectrometry_GCMS.pdf' }],
  },
  {
    id: 'TN-FOR-2026-00889',
    firNumber: 'FIR-541/2026/CB-CID',
    title: 'Heritage Property Forged Will & Spectroscopic Ink Analysis',
    category: 'Questioned Documents',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    assignedOfficer: { name: 'Dr. Abhiraj Singh', badgeId: 'FEX-1024' },
    documents: [{ originalFilename: 'HighRes_Spectral_Scan.tiff' }],
  },
  {
    id: 'WB-FOR-2026-00214',
    firNumber: 'FIR-304/2026/IND',
    title: 'Industrial Chemical Plant Explosion & Arson Residue Assay',
    category: 'Arson & Explosives',
    status: 'IN_ANALYSIS',
    priority: 'HIGH',
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    assignedOfficer: { name: 'Dr. Abhiraj Singh', badgeId: 'FEX-1024' },
    documents: [{ originalFilename: 'Residue_Chromatogram.png' }],
  },
];

const FALLBACK_STATS = {
  totalEvidence: 42,
  totalCases: 7,
  totalReports: 6,
  unresolvedSecurityIncidents: 0,
};

const FALLBACK_REPORTS = [
  {
    id: 'REP-2026-00125',
    title: 'Digital Forensic Extraction & Ledger Analysis Report',
    currentVersion: 2,
    status: 'FINALIZED',
    createdAt: new Date().toISOString(),
    sha256Hash: '3e01dd021ec3e68eb2a373b5bfddbf4c40b8a4f9aa1dc7bebf186b53915bc5c9',
    author: { name: 'Dr. Abhiraj Singh', badgeId: 'FEX-1024' },
  },
  {
    id: 'REP-2026-00084',
    title: 'SWIFT Relay Packet Injection & Memory Volatility Analysis',
    currentVersion: 1,
    status: 'FINALIZED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    sha256Hash: '9a84b12f45c81de01489a5ef2817dc9184ba73ec903d8b2e11894a73ec903d8b',
    author: { name: 'Dr. Abhiraj Singh', badgeId: 'FEX-1024' },
  },
  {
    id: 'REP-2026-00319',
    title: 'Ballistic Comparison & Breech Face Impression Attestation',
    currentVersion: 1,
    status: 'FINALIZED',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    sha256Hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    author: { name: 'Dr. Abhiraj Singh', badgeId: 'FEX-1024' },
  },
];

const FALLBACK_AUDITS = [
  {
    id: 'aud-001',
    action: 'CASE_CREATION',
    timestamp: new Date().toISOString(),
    reason: 'New cyber forensic inquest registered under Sec 65B IEA',
    userBadge: 'FEX-1024',
  },
  {
    id: 'aud-002',
    action: 'EVIDENCE_SEALED',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    reason: 'Physical bitstream image SSD cryptographic hash sealed',
    userBadge: 'FEX-1024',
  },
  {
    id: 'aud-003',
    action: 'REPORT_SIGNED',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    reason: 'Forensic Ballistics striation report attested with HSM token',
    userBadge: 'FEX-1024',
  },
  {
    id: 'aud-004',
    action: 'INTEGRITY_CHECK',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    reason: 'Zero-anomaly blockchain ledger verification completed',
    userBadge: 'SYSTEM',
  },
  {
    id: 'aud-005',
    action: 'BIOMETRIC_ATTEST',
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    reason: 'Optical 1:1 facial biometric attestation verified (Score: 98.4%)',
    userBadge: 'FEX-1024',
  },
];

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onSelectCase?: (caseId: string) => void;
  onSelectReport?: (reportId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  onSelectCase,
  onSelectReport,
}) => {
  const { user } = useAuth();

  // Dashboard Data State
  const [stats, setStats] = useState<any>(FALLBACK_STATS);
  const [recentCases, setRecentCases] = useState<any[]>(FALLBACK_CASES);
  const [recentReports, setRecentReports] = useState<any[]>(FALLBACK_REPORTS);
  const [recentAudits, setRecentAudits] = useState<any[]>(FALLBACK_AUDITS);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);

  // Selected Active Case for Graph Core
  const [activeCaseId, setActiveCaseId] = useState<string>('MP-FOR-2026-00125');

  // Interactive Graph Node Selection State
  const [selectedNode, setSelectedNode] = useState<IntelligenceNode | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Right Panel Collapse Toggle on Smaller Screens
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);

  // Load Real Data on Mount
  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        const token = localStorage.getItem('foris_token');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const fetchOptions = {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        };

        const results = await Promise.allSettled([
          fetch('/api/security/stats', fetchOptions),
          fetch('/api/cases', fetchOptions),
          fetch('/api/reports', fetchOptions),
          fetch('/api/audit', fetchOptions),
          fetch('/api/evidence', fetchOptions),
        ]);
        clearTimeout(timeoutId);

        if (!isMounted) return;

        const [secRes, casesRes, reportsRes, auditRes, evRes] = results;

        if (casesRes.status === 'fulfilled' && casesRes.value.ok) {
          try {
            const casesData = await casesRes.value.json();
            if (casesData?.cases && Array.isArray(casesData.cases) && casesData.cases.length > 0) {
              setRecentCases(casesData.cases);
              if (!activeCaseId) {
                setActiveCaseId(casesData.cases[0].id);
              }
            }
          } catch {}
        }

        if (reportsRes.status === 'fulfilled' && reportsRes.value.ok) {
          try {
            const reportsData = await reportsRes.value.json();
            if (reportsData?.reports && Array.isArray(reportsData.reports) && reportsData.reports.length > 0) {
              setRecentReports(reportsData.reports);
            }
          } catch {}
        }

        if (secRes.status === 'fulfilled' && secRes.value.ok) {
          try {
            const secData = await secRes.value.json();
            if (secData && typeof secData === 'object') {
              setStats((prev: any) => ({ ...prev, ...secData }));
            }
          } catch {}
        }

        if (auditRes.status === 'fulfilled' && auditRes.value.ok) {
          try {
            const auditData = await auditRes.value.json();
            if (auditData?.events && Array.isArray(auditData.events) && auditData.events.length > 0) {
              setRecentAudits(auditData.events.slice(0, 8));
            }
          } catch {}
        }

        if (evRes.status === 'fulfilled' && evRes.value.ok) {
          try {
            const evData = await evRes.value.json();
            if (evData?.evidence && Array.isArray(evData.evidence) && evData.evidence.length > 0) {
              setEvidenceList(evData.evidence);
            }
          } catch {}
        }
      } catch (err) {
        console.warn('Dashboard background update skipped, using cached offline data:', err);
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectCase = (caseId: string) => {
    setActiveCaseId(caseId);
    setSelectedNode(null);
  };

  const handleSelectNodeById = (nodeId: string) => {
    // Check if node is a case
    const matchCase = recentCases.find((c) => nodeId.includes(c.id));
    if (matchCase) {
      setActiveCaseId(matchCase.id);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] min-h-[680px] flex flex-col font-sans -m-6 overflow-hidden bg-slate-950">
      {/* 1. TOP COMMAND & CASE TELEMETRY STRIP */}
      <div className="px-6 py-2.5 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="font-mono text-xs font-bold text-white tracking-wider flex items-center gap-2">
              <span>FORENSIC INTELLIGENCE COMMAND</span>
              <span className="text-[10px] text-cyan-400 font-normal px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-800/50">
                SFSL NODE 01
              </span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-slate-800">
            <span className="text-[10px] font-mono text-slate-400">ACTIVE DOSSIER:</span>
            <select
              value={activeCaseId}
              onChange={(e) => handleSelectCase(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold rounded-xl px-2.5 py-1 outline-none transition-all cursor-pointer"
            >
              {recentCases.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white font-mono">
                  {c.id} — {c.firNumber} ({c.title?.slice(0, 32)}...)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Action Shortcuts */}
        <div className="flex items-center gap-2">
          {/* Quick Tab Jump Buttons */}
          <button
            onClick={() => setActiveTab('cases')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-all hidden sm:flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cases ({recentCases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-emerald-300 transition-all hidden sm:flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Evidence ({stats.totalEvidence || 42})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-purple-300 transition-all hidden md:flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>Reports ({recentReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('custody')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-teal-300 transition-all hidden lg:flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>Custody</span>
          </button>

          <button
            onClick={() => setActiveTab('samadhaan')}
            className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 hover:from-purple-900/90 hover:to-indigo-900/90 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-950/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>AI SAMADHAAN</span>
          </button>

          {/* Toggle Right Intelligence Panel on Mobile / Tablet */}
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white lg:hidden transition-colors"
            title={isRightPanelOpen ? 'Collapse Intelligence Panel' : 'Open Intelligence Panel'}
          >
            {isRightPanelOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: CANVAS + RIGHT INTELLIGENCE PANEL */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Central Interactive Forensic Node Canvas */}
        <ForensicIntelligenceCanvas
          cases={recentCases}
          reports={recentReports}
          audits={recentAudits}
          evidence={evidenceList}
          selectedNodeId={selectedNode ? selectedNode.id : null}
          onSelectNode={setSelectedNode}
          activeCaseId={activeCaseId}
          onChangeActiveCase={handleSelectCase}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Right-Side Intelligence Panel */}
        {isRightPanelOpen && (
          <RightIntelligencePanel
            selectedNode={selectedNode}
            onClearSelection={() => setSelectedNode(null)}
            onSelectNodeById={handleSelectNodeById}
            stats={stats}
            cases={recentCases}
            reports={recentReports}
            audits={recentAudits}
            evidence={evidenceList}
            setActiveTab={setActiveTab}
            onSelectCase={onSelectCase}
            onSelectReport={onSelectReport}
            isCollapsed={!isRightPanelOpen}
            onToggleCollapse={() => setIsRightPanelOpen(!isRightPanelOpen)}
          />
        )}
      </div>
    </div>
  );
};
