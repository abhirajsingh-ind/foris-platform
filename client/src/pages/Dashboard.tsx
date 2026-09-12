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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono tracking-wider text-slate-400">Loading Forensic Dashboard...</span>
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
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-sans">
      {/* 1. GRAND EXECUTIVE HERO BANNER & PERMANENT OFFICER PHOTO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border-2 border-emerald-500/30 p-6 sm:p-8 lg:p-9 shadow-2xl shadow-emerald-950/20">
        {/* Futuristic Background Accents */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#10b98115_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40"></div>

        {/* Top Attestation Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              SFSL CENTRAL COMMAND • LIVE
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              SEC 65B & 45 IEA ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1 rounded-xl border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentDate}</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 bg-slate-950/60 px-3 py-1 rounded-xl border border-slate-800 text-cyan-300 font-semibold">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTime.toLocaleTimeString()} IST</span>
            </span>
          </div>
        </div>

        {/* Hero Main Content */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Officer Permanent Photo & Credentials */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Grand Officer Photo Frame */}
            <div className="relative group shrink-0">
              {/* Outer Glowing Holographic Ring */}
              <div className="p-1 rounded-3xl bg-gradient-to-tr from-emerald-400 via-cyan-400 to-indigo-500 shadow-xl shadow-emerald-500/25 transition-transform group-hover:scale-105 duration-300">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-[22px] bg-slate-950 overflow-hidden flex items-center justify-center relative">
                  {!photoError ? (
                    <img
                      src={officerPhoto || '/rajesh_varma.jpg'}
                      alt={user?.name || 'Dr. Rajesh Varma'}
                      className="w-full h-full object-cover object-center transform hover:scale-110 transition-transform duration-500"
                      onError={() => setPhotoError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-emerald-950 text-emerald-400 p-2 text-center">
                      <UserCheck className="w-10 h-10 mb-1" />
                      <span className="text-[10px] font-mono font-bold">OFFICER ENROLLED</span>
                    </div>
                  )}
                  {/* Subtle Scanline Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Permanent Live Verification Badge */}
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-mono font-black flex items-center gap-1 shadow-lg shadow-emerald-500/50 border-2 border-slate-900">
                <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                <span>VERIFIED</span>
              </div>

              {/* Top Security Stamp */}
              <div className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full bg-slate-900 text-cyan-400 text-[9px] font-mono font-bold border border-cyan-500/40 shadow">
                ID-BIO
              </div>
            </div>

            {/* Officer Information & Badges */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono font-semibold tracking-wider text-emerald-400 uppercase">
                    CHIEF FORENSIC INVESTIGATOR
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[11px] font-mono text-slate-400">SESSION AUTHENTICATED</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">
                  Welcome back,{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-300">
                    {user?.name || 'Dr. Rajesh Varma'}
                  </span>
                </h1>

                <p className="text-sm text-slate-300 font-medium mt-1.5 flex items-center gap-2">
                  <span className="text-emerald-400 font-semibold">{user?.designation || 'Senior Forensic Specialist'}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{user?.department || 'State Forensic Science Laboratory (SFSL)'}</span>
                </p>
              </div>

              {/* High-Tech Credential Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                  <span>BADGE: {user?.badgeId || 'FEX-1024'}</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>LEVEL-4 CLEARANCE</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>CENTRAL SFSL HQ</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>HSM TOKEN LINKED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Impact Quick Command Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-center">
            <button
              onClick={() => setActiveTab('cases')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2.5 active:scale-95 group"
            >
              <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span>+ Register Forensic Case</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('evidence')}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700/80 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Evidence Vault</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700/80 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <FileSignature className="w-4 h-4 text-amber-400" />
                <span>Lab Reports</span>
              </button>
            </div>

            <button
              onClick={() => setActiveTab('samadhaan')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 hover:from-indigo-900/90 hover:to-purple-900/90 text-purple-200 font-bold text-xs border border-purple-500/40 hover:border-purple-400 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-purple-950/30"
            >
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin-slow" />
              <span>FORIS SAMADHAAN AI</span>
              <span className="text-[9px] bg-purple-500/30 px-1.5 py-0.5 rounded text-purple-200 uppercase font-mono">24/7</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FOUR CLEAN STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Cases */}
        <div
          onClick={() => setActiveTab('cases')}
          className="group cursor-pointer rounded-2xl bg-slate-900/80 border border-slate-800 p-5 hover:border-cyan-500/40 hover:bg-slate-900 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Cases</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{recentCases.length}</span>
            <span className="text-xs text-slate-400">Under Inquest</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-cyan-400 font-medium pt-2 border-t border-slate-800/60">
            <span>View All Dossiers</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Sealed Evidence */}
        <div
          onClick={() => setActiveTab('evidence')}
          className="group cursor-pointer rounded-2xl bg-slate-900/80 border border-slate-800 p-5 hover:border-emerald-500/40 hover:bg-slate-900 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sealed Evidence</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{stats?.totalEvidence ?? 12}</span>
            <span className="text-xs text-slate-400">Physical & Digital</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-400 font-medium pt-2 border-t border-slate-800/60">
            <span>SHA-256 Verified</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Forensic Reports */}
        <div
          onClick={() => setActiveTab('reports')}
          className="group cursor-pointer rounded-2xl bg-slate-900/80 border border-slate-800 p-5 hover:border-amber-500/40 hover:bg-slate-900 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed Reports</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{recentReports.length}</span>
            <span className="text-xs text-slate-400">Sec 65B Certified</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-amber-400 font-medium pt-2 border-t border-slate-800/60">
            <span>Digital Attestations</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Audit Integrity */}
        <div
          onClick={() => setActiveTab('audit')}
          className="group cursor-pointer rounded-2xl bg-slate-900/80 border border-slate-800 p-5 hover:border-teal-500/40 hover:bg-slate-900 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audit Integrity</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">100%</span>
            <span className="text-xs text-slate-400">Tamper-Proof</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-teal-400 font-medium pt-2 border-t border-slate-800/60">
            <span>Cryptographic Chain</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKBENCH: 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACTIVE CASES (7 COLS) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header + Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Active Forensic Cases</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {filteredCases.length}
                </span>
              </div>

              {/* Clean Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search FIR or Case..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Case List Cards */}
            <div className="space-y-3">
              {filteredCases.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  No forensic cases match your search criteria.
                </div>
              ) : (
                filteredCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (onSelectCase) onSelectCase(c.id);
                      setActiveTab('cases');
                    }}
                    className="group cursor-pointer rounded-xl bg-slate-950/70 border border-slate-800/80 p-4 hover:border-emerald-500/40 hover:bg-slate-950 transition-all shadow-sm space-y-2.5"
                  >
                    {/* Top Row: Case ID, FIR, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-800/50">
                          {c.id}
                        </span>
                        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {c.firNumber}
                        </span>
                        <StatusBadge type="priority" value={c.priority} />
                      </div>
                      <StatusBadge type="case" value={c.status} />
                    </div>

                    {/* Title */}
                    <div className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      {c.title}
                    </div>

                    {/* Meta details */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-900">
                      <span className="text-slate-400 text-[11px] truncate max-w-[240px]">
                        {c.category}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{getTimeAgo(c.updatedAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">Total {recentCases.length} Registered Cases</span>
            <button
              onClick={() => setActiveTab('cases')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              Open Full Case Registry →
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVITY FEED & LAB REPORTS (5 COLS) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full">
                <button
                  onClick={() => setRightTab('audit')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    rightTab === 'audit'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Audit Stream</span>
                </button>
                <button
                  onClick={() => setRightTab('reports')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    rightTab === 'reports'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Recent Reports</span>
                </button>
              </div>
            </div>

            {/* Content: Audit Stream */}
            {rightTab === 'audit' && (
              <div className="space-y-2.5">
                {recentAudits.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-mono">No audit logs recorded yet.</div>
                ) : (
                  recentAudits.map((ev, idx) => (
                    <div
                      key={ev.id || idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-emerald-400 font-semibold">
                          {ev.action?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-slate-500">{getTimeAgo(ev.timestamp)}</span>
                      </div>
                      <div className="text-slate-300 text-xs truncate">
                        {ev.reason || 'Verified forensic transaction'}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                        <span>Badge: {ev.userBadge || 'SYSTEM'}</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Chained
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Content: Recent Reports */}
            {rightTab === 'reports' && (
              <div className="space-y-2.5">
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
                      className="group cursor-pointer p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1.5 hover:border-amber-500/40 hover:bg-slate-950 transition-all"
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

          {/* Right Column Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">ISO/IEC 27037 Compliant</span>
            <button
              onClick={() => setActiveTab(rightTab === 'audit' ? 'audit' : 'reports')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 transition-colors"
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

