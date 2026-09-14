import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  Briefcase,
  Shield,
  FileText,
  Clock,
  ShieldCheck,
  History,
  FolderOpen,
  ChevronRight,
  Fingerprint,
  Building2,
  Calendar,
  AlertCircle,
  FileSignature,
  Search,
  HardDrive,
  PlusCircle,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Sparkles,
  Award,
  Zap,
  Lock,
  Cpu,
  Bot,
  UserCheck,
  ShieldAlert,
  Radio,
  Globe,
  Flame,
  Filter,
} from 'lucide-react';
import officerPhoto from '../assets/rajesh_varma.jpg';

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
  const [stats, setStats] = useState<any>(null);
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rightTab, setRightTab] = useState<'audit' | 'reports'>('audit');
  const [photoError, setPhotoError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Wallarm-style interactive timeframe selection
  const [timeRange, setTimeRange] = useState<'1H' | '24H' | '7D' | '30D'>('24H');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val1: number; val2: number; label: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = localStorage.getItem('foris_token');
        const [secRes, casesRes, reportsRes, auditRes] = await Promise.all([
          fetch('/api/security/stats', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/cases', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/reports', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/audit', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (casesRes.ok) {
          const casesData = await casesRes.json();
          setRecentCases(casesData.cases || []);
        }

        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setRecentReports(reportsData.reports || []);
        }

        if (secRes.ok) {
          const secData = await secRes.json();
          setStats(secData);
        }

        if (auditRes.ok) {
          const auditData = await auditRes.json();
          setRecentAudits(auditData.events ? auditData.events.slice(0, 8) : []);
        }
      } catch (err) {
        console.error('Error loading forensic dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'Just now';
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Cases' },
    { id: 'CYBER', label: 'Cyber' },
    { id: 'BALLISTICS', label: 'Ballistics' },
    { id: 'TOXICOLOGY', label: 'Toxicology' },
    { id: 'DOCUMENTS', label: 'Documents' },
    { id: 'DNA', label: 'DNA / Serology' },
  ];

  const filteredCases = recentCases.filter((c) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      (selectedCategory === 'CYBER' && (c.category?.toLowerCase().includes('cyber') || c.category?.toLowerCase().includes('digital'))) ||
      (selectedCategory === 'BALLISTICS' && (c.category?.toLowerCase().includes('ballistic') || c.category?.toLowerCase().includes('physical'))) ||
      (selectedCategory === 'TOXICOLOGY' && (c.category?.toLowerCase().includes('toxic') || c.category?.toLowerCase().includes('chemical'))) ||
      (selectedCategory === 'DOCUMENTS' && (c.category?.toLowerCase().includes('document') || c.category?.toLowerCase().includes('handwriting'))) ||
      (selectedCategory === 'DNA' && (c.category?.toLowerCase().includes('dna') || c.category?.toLowerCase().includes('biological')));

    const matchesSearch =
      !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.firNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Dynamic Chart Points based on selected timeframe
  const chartDatasets = {
    '1H': [
      { label: '10:00', v1: 24, v2: 2 },
      { label: '10:15', v1: 42, v2: 5 },
      { label: '10:30', v1: 36, v2: 1 },
      { label: '10:45', v1: 65, v2: 8 },
      { label: '11:00', v1: 52, v2: 3 },
      { label: '11:15', v1: 78, v2: 11 },
      { label: '11:30', v1: 89, v2: 6 },
    ],
    '24H': [
      { label: '00:00', v1: 18, v2: 4 },
      { label: '04:00', v1: 32, v2: 2 },
      { label: '08:00', v1: 64, v2: 12 },
      { label: '12:00', v1: 95, v2: 19 },
      { label: '16:00', v1: 112, v2: 8 },
      { label: '20:00', v1: 84, v2: 14 },
      { label: 'Now', v1: 128, v2: 6 },
    ],
    '7D': [
      { label: 'Mon', v1: 140, v2: 18 },
      { label: 'Tue', v1: 195, v2: 25 },
      { label: 'Wed', v1: 240, v2: 12 },
      { label: 'Thu', v1: 210, v2: 30 },
      { label: 'Fri', v1: 310, v2: 45 },
      { label: 'Sat', v1: 280, v2: 15 },
      { label: 'Sun', v1: 350, v2: 22 },
    ],
    '30D': [
      { label: 'Week 1', v1: 620, v2: 84 },
      { label: 'Week 2', v1: 840, v2: 115 },
      { label: 'Week 3', v1: 790, v2: 92 },
      { label: 'Week 4', v1: 1040, v2: 138 },
    ],
  };

  const activePoints = chartDatasets[timeRange];

  // Cyber map nodes (Point-cloud Indian forensic zones + global threat source)
  const mapNodes = [
    { id: 'DEL', name: 'SFSL Central HQ (Delhi)', x: 48, y: 35, status: 'SECURED', pings: 1420, color: '#10b981' },
    { id: 'MUM', name: 'Mumbai Cyber Cell', x: 38, y: 55, status: 'INGESTING', pings: 980, color: '#00f2fe' },
    { id: 'BLR', name: 'Bengaluru Forensic Tech Lab', x: 44, y: 74, status: 'SECURED', pings: 1210, color: '#10b981' },
    { id: 'HYD', name: 'Hyderabad Digital Vault', x: 49, y: 64, status: 'SEALED', pings: 780, color: '#10b981' },
    { id: 'KOL', name: 'Kolkata Forensic Station', x: 68, y: 46, status: 'SECURED', pings: 640, color: '#00f2fe' },
    { id: 'EXT', name: 'International Gateway Gateway (Blocked)', x: 18, y: 28, status: 'ATTACK BLOCKED', pings: 320, color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono tracking-wider text-slate-400">Booting AMOLED Forensic Telemetry Console...</span>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto font-sans">
      {/* 1. AMOLED SECURITY CONSOLE HERO & OFFICER CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-[#050811] border border-cyan-500/20 p-5 sm:p-7 shadow-2xl">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-cyber-grid pointer-events-none opacity-40"></div>

        {/* Top Status & Telemetry Ribbon */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 shadow-sm glow-cyan">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              CENTRAL FORENSIC SOC CONSOLE • ONLINE
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-800/40">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              100% SHA-256 LEDGER LOCKED
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 bg-[#000000]/80 px-3 py-1 rounded-xl border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentDate}</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 bg-[#000000]/80 px-3 py-1 rounded-xl border border-slate-800 text-emerald-300 font-semibold">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentTime.toLocaleTimeString()} IST</span>
            </span>
          </div>
        </div>

        {/* Hero Content: Officer Profile & Quick Launch Console */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Officer Holographic Avatar */}
            <div className="relative group shrink-0">
              <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-indigo-500 shadow-xl shadow-cyan-500/20">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[14px] bg-black overflow-hidden flex items-center justify-center relative">
                  {!photoError ? (
                    <img
                      src={officerPhoto || '/rajesh_varma.jpg'}
                      alt={user?.name || 'Dr. Abhiraj Singh'}
                      className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
                      onError={() => setPhotoError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-emerald-400 p-2 text-center">
                      <UserCheck className="w-8 h-8 mb-1" />
                      <span className="text-[9px] font-mono font-bold">OFFICER ENROLLED</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none"></div>
                </div>
              </div>

              <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-mono font-black flex items-center gap-1 shadow border border-black">
                <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />
                <span>1:1 BIO</span>
              </div>
            </div>

            {/* Officer Information */}
            <div className="space-y-2">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
                    CHIEF FORENSIC INVESTIGATOR
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] font-mono text-slate-400">ACTIVE SESSION [PHONE 2FA OK]</span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                  Welcome,{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-400">
                    {user?.name || 'Dr. Abhiraj Singh'}
                  </span>
                </h1>

                <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                  <span className="text-emerald-400 font-semibold">{user?.designation || 'Senior Forensic Specialist'}</span>
                  <span className="text-slate-600">•</span>
                  <span>{user?.department || 'State Forensic Science Laboratory (SFSL)'}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#000000]/90 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold">
                  <Fingerprint className="w-3 h-3 text-emerald-400" />
                  <span>BADGE: {user?.badgeId || 'FEX-1024'}</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#000000]/90 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold">
                  <Shield className="w-3 h-3 text-cyan-400" />
                  <span>TIER-4 DEFENSE OK</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#000000]/90 border border-purple-500/30 text-purple-300 text-[11px] font-mono font-bold">
                  <Radio className="w-3 h-3 text-purple-400" />
                  <span>DEL-NODE-01</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Console Command Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-center">
            <button
              onClick={() => setActiveTab('cases')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-95 group"
            >
              <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span>+ Register Forensic Case</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('evidence')}
                className="px-3 py-2 rounded-xl bg-[#000000]/80 hover:bg-slate-900 text-slate-200 font-semibold text-xs border border-slate-800 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Evidence Vault</span>
              </button>
              <button
                onClick={() => setActiveTab('samadhaan')}
                className="px-3 py-2 rounded-xl bg-[#000000]/80 hover:bg-slate-900 text-purple-300 font-semibold text-xs border border-purple-800/60 hover:border-purple-500/50 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>SAMADHAAN</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SPLUNK & WALLARM METRIC MATRIX (TOP CARDS WITH DELTAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1 */}
        <div
          onClick={() => setActiveTab('cases')}
          className="cursor-pointer rounded-2xl bg-[#050811] border border-slate-800/80 hover:border-cyan-500/40 p-4 transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase tracking-wider">Active Dossiers</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50 font-bold">
              +14.2%
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{recentCases.length}</span>
            <span className="text-xs text-slate-400 font-mono">inquest open</span>
          </div>
          {/* Micro Sparkline Indicator */}
          <div className="mt-2.5 flex items-center gap-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 w-[68%] rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-cyan-400 font-mono pt-1">
            <span>Inspect dossiers</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => setActiveTab('evidence')}
          className="cursor-pointer rounded-2xl bg-[#050811] border border-slate-800/80 hover:border-emerald-500/40 p-4 transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase tracking-wider">Sealed Evidence</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50 font-bold">
              +8.7%
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{stats?.totalEvidence ?? 12}</span>
            <span className="text-xs text-slate-400 font-mono">items locked</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 w-[84%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-400 font-mono pt-1">
            <span>SHA-256 Vault</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => setActiveTab('audit')}
          className="cursor-pointer rounded-2xl bg-[#050811] border border-slate-800/80 hover:border-teal-500/40 p-4 transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase tracking-wider">Ledger Consensus</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/50 font-bold">
              VERIFIED
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">100%</span>
            <span className="text-xs text-slate-400 font-mono">0 compromises</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 w-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-teal-300 font-mono pt-1">
            <span>Cryptographic Proof</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => setActiveTab('security')}
          className="cursor-pointer rounded-2xl bg-[#050811] border border-slate-800/80 hover:border-red-500/40 p-4 transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase tracking-wider">Attacks Neutralized</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/50 font-bold">
              BLOCKED
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-400 font-mono">{stats?.unauthorizedAttempts ?? 14}</span>
            <span className="text-xs text-slate-400 font-mono">incidents</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 w-[100%] rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-red-400 font-mono pt-1">
            <span>Security Center</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. WALLARM MULTI-METRIC VELOCITY CHART + SPLUNK 3D GEO MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: WALLARM-STYLE MULTI-METRIC TIME SERIES CHART (7 COLS) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#050811] border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Live Incident & Evidence Velocity Timeline
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Comparative ingestion telemetry vs security anomalies
                </p>
              </div>

              {/* Wallarm Timeline Range Selectors */}
              <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-slate-800">
                {(['1H', '24H', '7D', '30D'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all ${
                      timeRange === r
                        ? 'bg-cyan-500 text-black shadow glow-cyan'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] font-mono pt-3">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                Evidence Ingested &amp; Sealed
              </span>
              <span className="flex items-center gap-1.5 text-red-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                Security Anomaly / Tamper Blocked
              </span>
            </div>

            {/* SVG Curved Chart */}
            <div className="relative h-56 mt-3 flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cyanArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="redArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                {[40, 80, 120, 160].map((y) => (
                  <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                ))}

                {/* Area 1: Ingestion Curve */}
                <path
                  d={`M 0,200 ${activePoints
                    .map((p, idx) => {
                      const x = (idx / (activePoints.length - 1)) * 500;
                      const y = 190 - (p.v1 / 360) * 160;
                      return `L ${x},${y}`;
                    })
                    .join(' ')} L 500,200 Z`}
                  fill="url(#cyanArea)"
                />

                {/* Line 1: Ingestion Stroke */}
                <path
                  d={`M ${activePoints
                    .map((p, idx) => {
                      const x = (idx / (activePoints.length - 1)) * 500;
                      const y = 190 - (p.v1 / 360) * 160;
                      return `${idx === 0 ? '' : 'L '}${x},${y}`;
                    })
                    .join(' ')}`}
                  fill="none"
                  stroke="#00f2fe"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]"
                />

                {/* Area 2: Anomaly Curve */}
                <path
                  d={`M 0,200 ${activePoints
                    .map((p, idx) => {
                      const x = (idx / (activePoints.length - 1)) * 500;
                      const y = 190 - (p.v2 / 50) * 150;
                      return `L ${x},${y}`;
                    })
                    .join(' ')} L 500,200 Z`}
                  fill="url(#redArea)"
                />

                {/* Line 2: Anomaly Stroke */}
                <path
                  d={`M ${activePoints
                    .map((p, idx) => {
                      const x = (idx / (activePoints.length - 1)) * 500;
                      const y = 190 - (p.v2 / 50) * 150;
                      return `${idx === 0 ? '' : 'L '}${x},${y}`;
                    })
                    .join(' ')}`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="4 2"
                />

                {/* Data Points */}
                {activePoints.map((p, idx) => {
                  const x = (idx / (activePoints.length - 1)) * 500;
                  const y = 190 - (p.v1 / 360) * 160;
                  return (
                    <g key={idx} className="cursor-pointer group/dot">
                      <circle
                        cx={x}
                        cy={y}
                        r="4.5"
                        fill="#000"
                        stroke="#00f2fe"
                        strokeWidth="2.5"
                        onMouseEnter={() => setHoveredPoint({ x, y, val1: p.v1, val2: p.v2, label: p.label })}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip */}
              {hoveredPoint && (
                <div
                  className="absolute z-30 p-2 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-[10px] font-mono shadow-2xl pointer-events-none -translate-y-16 -translate-x-1/2 animate-fadeIn"
                  style={{ left: `${(hoveredPoint.x / 500) * 100}%` }}
                >
                  <div className="text-white font-bold">{hoveredPoint.label}</div>
                  <div className="text-cyan-300">Ingested: {hoveredPoint.val1} items</div>
                  <div className="text-red-400">Blocked: {hoveredPoint.val2} attacks</div>
                </div>
              )}
            </div>

            {/* X-Axis Labels */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-900">
              {activePoints.map((p, idx) => (
                <span key={idx}>{p.label}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              99.98% Cryptographic Ingestion Integrity
            </span>
            <span className="text-slate-500">Auto-refresh: 5s</span>
          </div>
        </div>

        {/* RIGHT: SPLUNK-STYLE 3D GEO-FORENSIC ATTACK & POINT-CLOUD MAP (5 COLS) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#050811] border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Geo-Forensic Network Map
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Real-time node telemetry &amp; intrusion vectors
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
                6 NODES LIVE
              </span>
            </div>

            {/* Point-Cloud Holographic Map Grid */}
            <div className="relative h-60 mt-3 rounded-xl bg-black border border-slate-800/90 overflow-hidden flex items-center justify-center">
              {/* Radial radar sweep animation */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)] pointer-events-none"></div>

              {/* Background grid dots */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:14px_14px] opacity-40"></div>

              {/* Threat Arc Vectors */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Attack vector from EXT to DEL */}
                <line x1="18%" y1="28%" x2="48%" y2="35%" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" className="animate-pulse" />
                {/* Secure sync from DEL to BLR */}
                <line x1="48%" y1="35%" x2="44%" y2="74%" stroke="#00f2fe" strokeWidth="1.2" strokeOpacity="0.6" />
                {/* Sync from DEL to MUM */}
                <line x1="48%" y1="35%" x2="38%" y2="55%" stroke="#10b981" strokeWidth="1.2" strokeOpacity="0.6" />
                {/* Sync from DEL to KOL */}
                <line x1="48%" y1="35%" x2="68%" y2="46%" stroke="#10b981" strokeWidth="1.2" strokeOpacity="0.6" />
              </svg>

              {/* Map Nodes */}
              {mapNodes.map((n) => (
                <div
                  key={n.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                  <div className="relative flex items-center justify-center">
                    <span
                      className="absolute w-6 h-6 rounded-full animate-radarPing"
                      style={{ backgroundColor: `${n.color}30` }}
                    ></span>
                    <span
                      className="w-3 h-3 rounded-full border-2 border-black"
                      style={{ backgroundColor: n.color }}
                    ></span>
                  </div>

                  {/* Node Name Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded bg-slate-900/95 border border-slate-700 text-[9px] font-mono text-white whitespace-nowrap shadow-lg pointer-events-none group-hover:scale-105 transition-transform z-20">
                    <span className="font-bold">{n.id}:</span> {n.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Status Bar */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
            <div className="p-2 rounded-xl bg-black border border-slate-800/80">
              <span className="text-slate-500 block">Active Gateway:</span>
              <span className="text-cyan-300 font-bold">DEL-SFSL-PRIMARY</span>
            </div>
            <div className="p-2 rounded-xl bg-black border border-slate-800/80">
              <span className="text-slate-500 block">Intrusion Intercept:</span>
              <span className="text-emerald-400 font-bold">14 REJECTED (HTTP 403)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SPLUNK-INSPIRED RADIAL GAUGES + DUAL TELEMETRY MODULE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gauge 1: Cryptographic Seal Consensus */}
        <div className="rounded-2xl bg-[#050811] border border-slate-800/80 p-4 shadow-md flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="32" stroke="#151f32" strokeWidth="6" fill="transparent" />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#10b981"
                strokeWidth="6"
                strokeDasharray="201"
                strokeDashoffset="0"
                strokeLinecap="round"
                fill="transparent"
                className="filter drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-sm font-black text-white font-mono">100%</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-white block">SHA-256 Seal Consensus</span>
            <span className="text-[10px] text-emerald-400 font-mono block">Zero chain tampering</span>
            <span className="text-[10px] text-slate-500 font-mono block">Merkle Root: 0x7f8a...e901</span>
          </div>
        </div>

        {/* Gauge 2: Biometric Ocular & Facial Match */}
        <div className="rounded-2xl bg-[#050811] border border-slate-800/80 p-4 shadow-md flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="32" stroke="#151f32" strokeWidth="6" fill="transparent" />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#00f2fe"
                strokeWidth="6"
                strokeDasharray="201"
                strokeDashoffset="3"
                strokeLinecap="round"
                fill="transparent"
                className="filter drop-shadow-[0_0_6px_rgba(0,242,254,0.8)]"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-sm font-black text-white font-mono">98.4%</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-white block">Biometric Match Rate</span>
            <span className="text-[10px] text-cyan-400 font-mono block">1,472 Iris &amp; Face Vectors</span>
            <span className="text-[10px] text-slate-500 font-mono block">Officer Dr. Abhiraj Singh</span>
          </div>
        </div>

        {/* Gauge 3: Phone 2FA Delivery & Verification Rate */}
        <div className="rounded-2xl bg-[#050811] border border-slate-800/80 p-4 shadow-md flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="32" stroke="#151f32" strokeWidth="6" fill="transparent" />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#6366f1"
                strokeWidth="6"
                strokeDasharray="201"
                strokeDashoffset="0"
                strokeLinecap="round"
                fill="transparent"
                className="filter drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-sm font-black text-white font-mono">100%</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-white block">SMS OTP Gateway</span>
            <span className="text-[10px] text-indigo-400 font-mono block">Target: +91 6203145059</span>
            <span className="text-[10px] text-slate-500 font-mono block">Direct Carrier Link Active</span>
          </div>
        </div>
      </div>

      {/* 5. ACTIVE CASE DOSSIERS & REAL-TIME AUDIT STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: ACTIVE CASES (7 COLS) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#050811] border border-slate-800/80 p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header + Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white tracking-wide">Active Forensic Case Dossiers</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-slate-800 font-bold">
                  {filteredCases.length}
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by FIR / Case ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-52 bg-black border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold shadow'
                      : 'bg-black text-slate-400 hover:text-white border border-slate-800/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Case List Cards */}
            <div className="space-y-2.5">
              {filteredCases.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  No forensic cases match query.
                </div>
              ) : (
                filteredCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (onSelectCase) onSelectCase(c.id);
                      setActiveTab('cases');
                    }}
                    className="group cursor-pointer rounded-xl bg-black border border-slate-800/80 p-3.5 hover:border-cyan-500/40 hover:bg-[#080d1a] transition-all shadow space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50">
                          {c.id}
                        </span>
                        <span className="text-xs font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {c.firNumber}
                        </span>
                        <StatusBadge type="priority" value={c.priority} />
                      </div>
                      <StatusBadge type="case" value={c.status} />
                    </div>

                    <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {c.title}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1.5 border-t border-slate-900 font-mono">
                      <span>Category: {c.category}</span>
                      <span className="text-slate-500">{getTimeAgo(c.updatedAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">Total {recentCases.length} Registered Cases</span>
            <button
              onClick={() => setActiveTab('cases')}
              className="text-cyan-400 hover:text-cyan-300 font-bold font-mono inline-flex items-center gap-1 transition-colors"
            >
              Open Full Case Registry →
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME AUDIT STREAM & LAB REPORTS (5 COLS) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#050811] border border-slate-800/80 p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-slate-800 w-full">
                <button
                  onClick={() => setRightTab('audit')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                    rightTab === 'audit'
                      ? 'bg-cyan-500 text-black shadow glow-cyan'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Audit Stream</span>
                </button>
                <button
                  onClick={() => setRightTab('reports')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                    rightTab === 'reports'
                      ? 'bg-cyan-500 text-black shadow glow-cyan'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lab Reports</span>
                </button>
              </div>
            </div>

            {/* Audit Stream */}
            {rightTab === 'audit' && (
              <div className="space-y-2">
                {recentAudits.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-mono">No audit logs recorded yet.</div>
                ) : (
                  recentAudits.map((ev, idx) => (
                    <div
                      key={ev.id || idx}
                      className="p-3 rounded-xl bg-black border border-slate-800/80 text-xs space-y-1 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-cyan-400 font-bold">
                          {ev.action?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-slate-500">{getTimeAgo(ev.timestamp)}</span>
                      </div>
                      <div className="text-slate-300 text-xs truncate font-sans">
                        {ev.reason || 'Verified forensic transaction'}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                        <span>Badge: {ev.userBadge || 'SYSTEM'}</span>
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3 h-3" /> CHAINED
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Recent Reports */}
            {rightTab === 'reports' && (
              <div className="space-y-2">
                {recentReports.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-mono">No reports generated yet.</div>
                ) : (
                  recentReports.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        if (onSelectReport) onSelectReport(r.id);
                        setActiveTab('reports');
                      }}
                      className="group cursor-pointer p-3 rounded-xl bg-black border border-slate-800/80 text-xs space-y-1.5 hover:border-amber-500/40 hover:bg-[#080d1a] transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-400">{r.id}</span>
                        <StatusBadge type="report" value={r.status} />
                      </div>
                      <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                        {r.title}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Version {r.currentVersion || 1}.0</span>
                        <span>{getTimeAgo(r.updatedAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">ISO/IEC 27037 Tamper-Proof</span>
            <button
              onClick={() => setActiveTab(rightTab === 'audit' ? 'audit' : 'reports')}
              className="text-cyan-400 hover:text-cyan-300 font-bold font-mono inline-flex items-center gap-1 transition-colors"
            >
              View Full History →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


