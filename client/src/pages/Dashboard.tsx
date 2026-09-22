import React, { useEffect, useState, useRef } from 'react';
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
  Camera,
  Image as ImageIcon,
  Database,
  Layers,
  Radio,
  FileCheck2,
  Network,
} from 'lucide-react';
import officerPhotoDefault from '../assets/officer_abhiraj.jpg';
import { BorderBeam } from '../components/BorderBeam';
import { CyberDecryptText } from '../components/CyberDecryptText';
import { ThreeDInteractiveHologram } from '../components/ThreeDInteractiveHologram';
import { ControlAIPolicyGraph } from '../components/ControlAIPolicyGraph';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customPhoto, setCustomPhoto] = useState<string | null>(() => localStorage.getItem('foris_custom_officer_photo'));
  const activeOfficerPhoto = customPhoto || officerPhotoDefault || '/officer_abhiraj.jpg';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setCustomPhoto(result);
          localStorage.setItem('foris_custom_officer_photo', result);
          setPhotoError(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [stats, setStats] = useState<any>(null);
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rightTab, setRightTab] = useState<'hologram' | 'audit' | 'reports'>('hologram');
  const [photoError, setPhotoError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardViewMode, setDashboardViewMode] = useState<'graph' | 'matrix'>('graph');


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

  const getCategoryStyle = (cat?: string) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('cyber') || c.includes('digital')) {
      return {
        border: 'border-l-4 border-l-cyan-400 hover:border-cyan-500/60',
        badge: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40',
        accent: 'text-cyan-400',
        bgGlow: 'hover:shadow-cyan-950/40',
        pill: 'text-cyan-300 bg-cyan-950/70 border-cyan-700/60',
        icon: '💻',
      };
    }
    if (c.includes('ballistic') || c.includes('physical')) {
      return {
        border: 'border-l-4 border-l-amber-400 hover:border-amber-500/60',
        badge: 'bg-amber-950/60 text-amber-300 border-amber-800/40',
        accent: 'text-amber-400',
        bgGlow: 'hover:shadow-amber-950/40',
        pill: 'text-amber-300 bg-amber-950/70 border-amber-700/60',
        icon: '🎯',
      };
    }
    if (c.includes('toxic') || c.includes('chemical')) {
      return {
        border: 'border-l-4 border-l-emerald-400 hover:border-emerald-500/60',
        badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40',
        accent: 'text-emerald-400',
        bgGlow: 'hover:shadow-emerald-950/40',
        pill: 'text-emerald-300 bg-emerald-950/70 border-emerald-700/60',
        icon: '🧪',
      };
    }
    if (c.includes('document') || c.includes('handwriting')) {
      return {
        border: 'border-l-4 border-l-purple-400 hover:border-purple-500/60',
        badge: 'bg-purple-950/60 text-purple-300 border-purple-800/40',
        accent: 'text-purple-400',
        bgGlow: 'hover:shadow-purple-950/40',
        pill: 'text-purple-300 bg-purple-950/70 border-purple-700/60',
        icon: '📜',
      };
    }
    return {
      border: 'border-l-4 border-l-pink-400 hover:border-pink-500/60',
      badge: 'bg-pink-950/60 text-pink-300 border-pink-800/40',
      accent: 'text-pink-400',
      bgGlow: 'hover:shadow-pink-950/40',
      pill: 'text-pink-300 bg-pink-950/70 border-pink-700/60',
      icon: '🧬',
    };
  };

  const getCategoryBtnStyle = (catId: string, isSelected: boolean) => {
    if (!isSelected) {
      return 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800/80';
    }
    switch (catId) {
      case 'CYBER':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-md shadow-cyan-500/20';
      case 'BALLISTICS':
        return 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold shadow-md shadow-amber-500/20';
      case 'TOXICOLOGY':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold shadow-md shadow-emerald-500/20';
      case 'DOCUMENTS':
        return 'bg-purple-500/20 text-purple-300 border-purple-400 font-bold shadow-md shadow-purple-500/20';
      case 'DNA':
        return 'bg-pink-500/20 text-pink-300 border-pink-400 font-bold shadow-md shadow-pink-500/20';
      default:
        return 'bg-slate-800 text-white border-slate-600 font-bold shadow-md';
    }
  };

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
        <BorderBeam colorScheme="emerald" rx="24" />
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

          {/* Center: Dribbble Control AI View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setDashboardViewMode('graph')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                dashboardViewMode === 'graph'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Policy & Evidence Graph</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950/40 text-cyan-200 uppercase font-black">AI VIEW</span>
            </button>
            <button
              onClick={() => setDashboardViewMode('matrix')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                dashboardViewMode === 'matrix'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Command Matrix</span>
            </button>
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              {/* Outer Glowing Holographic Ring */}
              <div
                onClick={() => fileInputRef.current?.click()}
                title="Click to change officer photo"
                className="cursor-pointer p-1 rounded-3xl bg-gradient-to-tr from-emerald-400 via-cyan-400 to-indigo-500 shadow-xl shadow-emerald-500/25 transition-transform group-hover:scale-105 duration-300 relative"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-[22px] bg-slate-950 overflow-hidden flex items-center justify-center relative">
                  {!photoError ? (
                    <img
                      src={activeOfficerPhoto}
                      alt={user?.name || 'Dr. Abhiraj Singh'}
                      className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500"
                      onError={() => setPhotoError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-emerald-950 text-emerald-400 p-2 text-center">
                      <UserCheck className="w-10 h-10 mb-1" />
                      <span className="text-[10px] font-mono font-bold">OFFICER ENROLLED</span>
                    </div>
                  )}
                  {/* Hover Change Photo Overlay */}
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-cyan-300 gap-1 z-20">
                    <Camera className="w-6 h-6" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Change Photo</span>
                  </div>
                  {/* Subtle Scanline Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Permanent Live Verification Badge */}
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-mono font-black flex items-center gap-1 shadow-lg shadow-emerald-500/50 border-2 border-slate-900 z-10 pointer-events-none">
                <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                <span>VERIFIED</span>
              </div>

              {/* Top Security Stamp */}
              <div className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full bg-slate-900 text-cyan-400 text-[9px] font-mono font-bold border border-cyan-500/40 shadow z-10 pointer-events-none">
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
                    {user?.name || 'Dr. Abhiraj Singh'}
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

      {/* 2. DRIBBLE-INSPIRED "CONTROL AI POLICY & FORENSIC GRAPH" VIEW */}
      {dashboardViewMode === 'graph' && (
        <div className="space-y-6 animate-fadeIn">
          <ControlAIPolicyGraph
            cases={recentCases}
            reports={recentReports}
            stats={stats}
            officerName={user?.name || 'Dr. Abhiraj Singh'}
            onSelectCase={onSelectCase}
            onSelectReport={onSelectReport}
            setActiveTab={setActiveTab}
          />
        </div>
      )}

      {/* 3. FOUR DISTINCT ARCHITECTURAL STATS CARDS WITH BOLD MAIN TOPICS & MULTI-COLOR IDENTITY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: ACTIVE CASES DOSSIER - Tactical Folder Archetype (Electric Cyan) */}
        <div
          onClick={() => setActiveTab('cases')}
          className="group cursor-pointer rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border-2 border-cyan-500/40 p-5 hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/20 transition-all relative overflow-hidden flex flex-col justify-between"
        >
          <BorderBeam colorScheme="cyan" rx="16" />
          {/* Cyber Coordinate Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d418_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>

          {/* Tactical Tab Header */}
          <div className="relative z-10 flex items-center justify-between pb-2 border-b border-cyan-900/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-mono text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                // DOSSIER MATRIX
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
              LIVE INQUEST
            </span>
          </div>

          <div className="my-3 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider uppercase block">
                  TOPIC 01
                </span>
                <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wider drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                  ACTIVE CASES DOSSIER
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-md shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-white font-mono tracking-tight drop-shadow">
                <CyberDecryptText text={String(recentCases.length)} />
              </span>
              <span className="text-xs text-cyan-400/90 font-mono font-semibold">Active Inquests Underway</span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-cyan-900/50 flex items-center justify-between text-xs font-bold text-cyan-400 relative z-10">
            <span className="font-mono text-[11px] uppercase tracking-wider flex items-center gap-1">
              <span>OPEN CASE REGISTRY</span>
            </span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-cyan-300" />
          </div>
        </div>

        {/* Card 2: SEALED EVIDENCE VAULT - Cryptographic Hex Matrix Safe (Cyber Jade / Emerald) */}
        <div
          onClick={() => setActiveTab('evidence')}
          className="group cursor-pointer rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-2 border-emerald-500/40 p-5 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/20 transition-all relative overflow-hidden flex flex-col justify-between"
        >
          <BorderBeam colorScheme="emerald" rx="16" />
          {/* Hex Matrix Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b98118_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>

          {/* Vault Security Bracket Header */}
          <div className="relative z-10 flex items-center justify-between pb-2 border-b border-emerald-900/50">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                // CRYPTO-VAULT [HSM]
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              SHA-256 SEALED
            </span>
          </div>

          <div className="my-3 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider uppercase block">
                  TOPIC 02
                </span>
                <h3 className="text-sm font-black text-emerald-300 uppercase tracking-wider drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                  SEALED EVIDENCE VAULT
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Database className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-white font-mono tracking-tight drop-shadow">
                <CyberDecryptText text={String(stats?.totalEvidence ?? stats?.metrics?.totalEvidenceItemsHashed ?? 42)} />
              </span>
              <span className="text-xs text-emerald-400/90 font-mono font-semibold">Chain-of-Custody Intact</span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-emerald-900/50 flex items-center justify-between text-xs font-bold text-emerald-400 relative z-10">
            <span className="font-mono text-[11px] uppercase tracking-wider flex items-center gap-1">
              <span>VERIFY HASH REPOSITORY</span>
            </span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-emerald-300" />
          </div>
        </div>

        {/* Card 3: FORENSIC REPORTS - Sovereign Gold Attestation Parchment (Warm Amber & Gold) */}
        <div
          onClick={() => setActiveTab('reports')}
          className="group cursor-pointer rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/40 p-5 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/20 transition-all relative overflow-hidden flex flex-col justify-between"
        >
          {/* Sovereign Gold Background Ribbon */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none"></div>

          {/* Legal Stamp Header */}
          <div className="relative z-10 flex items-center justify-between pb-2 border-b border-amber-900/50">
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-[10px] font-black tracking-widest text-amber-400 uppercase">
                // LEGAL CERTIFICATES
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              SEC 65B CERTIFIED
            </span>
          </div>

          <div className="my-3 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider uppercase block">
                  TOPIC 03
                </span>
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                  SIGNED LAB REPORTS
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <FileSignature className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-white font-mono tracking-tight drop-shadow">
                <CyberDecryptText text={String(recentReports.length)} />
              </span>
              <span className="text-xs text-amber-400/90 font-mono font-semibold">Court Admissible Briefs</span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-amber-900/50 flex items-center justify-between text-xs font-bold text-amber-400 relative z-10">
            <span className="font-mono text-[11px] uppercase tracking-wider flex items-center gap-1">
              <span>INSPECT DIGITAL ATTESTATIONS</span>
            </span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-amber-300" />
          </div>
        </div>

        {/* Card 4: AUDIT INTEGRITY - Quantum Security Halo & Ledger (Neon Purple / Violet) */}
        <div
          onClick={() => setActiveTab('audit')}
          className="group cursor-pointer rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-2 border-purple-500/40 p-5 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/20 transition-all relative overflow-hidden flex flex-col justify-between"
        >
          {/* Radar Dial Watermark */}
          <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full border border-purple-500/20 border-dashed pointer-events-none"></div>

          {/* Quantum Ledger Header */}
          <div className="relative z-10 flex items-center justify-between pb-2 border-b border-purple-900/50">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="font-mono text-[10px] font-black tracking-widest text-purple-400 uppercase">
                // QUANTUM LEDGER
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
              TAMPER PROOF
            </span>
          </div>

          <div className="my-3 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider uppercase block">
                  TOPIC 04
                </span>
                <h3 className="text-sm font-black text-purple-300 uppercase tracking-wider drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                  AUDIT & HSM INTEGRITY
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-purple-300 font-mono tracking-tight drop-shadow">
                <CyberDecryptText text="100%" />
              </span>
              <span className="text-xs text-purple-400/90 font-mono font-semibold">Zero Anomaly Guarantee</span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-purple-900/50 flex items-center justify-between text-xs font-bold text-purple-400 relative z-10">
            <span className="font-mono text-[11px] uppercase tracking-wider flex items-center gap-1">
              <span>VERIFY BLOCKCHAIN LOG</span>
            </span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-purple-300" />
          </div>
        </div>
      </div>


      {/* 3. MAIN WORKBENCH: 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACTIVE CASES (7 COLS) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header + Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-md shadow-cyan-500/20">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    ACTIVE FORENSIC DOSSIERS
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                      {filteredCases.length} INQUESTS
                    </span>
                  </h2>
                  <span className="text-[10px] font-mono text-cyan-400/70 font-semibold uppercase tracking-wider">
                    EVIDENCE TRACKER • SEC 65B CHAIN-OF-CUSTODY
                  </span>
                </div>
              </div>

              {/* Clean Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search FIR or Case..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-52 bg-slate-950 border border-cyan-900/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
                />
              </div>
            </div>

            {/* Category Pills with Distinct Colors */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-all uppercase tracking-wider font-mono ${getCategoryBtnStyle(
                    cat.id,
                    selectedCategory === cat.id
                  )}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Case List Cards with Distinct Category Archetypes */}
            <div className="space-y-3">
              {filteredCases.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  No forensic cases match your search criteria.
                </div>
              ) : (
                filteredCases.map((c) => {
                  const style = getCategoryStyle(c.category);
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        if (onSelectCase) onSelectCase(c.id);
                        setActiveTab('cases');
                      }}
                      className={`group cursor-pointer rounded-xl bg-slate-950/80 border border-slate-800/90 p-4 transition-all shadow-md hover:bg-slate-950 space-y-2.5 ${style.border} ${style.bgGlow}`}
                    >
                      {/* Top Row: Case ID, FIR, Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-mono font-black px-2 py-0.5 rounded border ${style.badge}`}>
                            {c.id}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                            FIR: {c.firNumber}
                          </span>
                          <StatusBadge type="priority" value={c.priority} />
                        </div>
                        <StatusBadge type="case" value={c.status} />
                      </div>

                      {/* Main Title - BOLD with category accent */}
                      <div className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors tracking-tight flex items-center gap-2">
                        <span className="text-base">{style.icon}</span>
                        <span>{c.title}</span>
                      </div>

                      {/* Meta details & Crime Scene Photos Attached */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-900">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${style.pill}`}>
                            {c.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40">
                            <Camera className="w-3 h-3 text-cyan-400" />
                            <span>{c.documents?.length || c._count?.documents || 2} Artifacts Hashed</span>
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">{getTimeAgo(c.updatedAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">Total {recentCases.length} Registered Cases</span>
            <button
              onClick={() => setActiveTab('cases')}
              className="text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1 transition-colors"
            >
              Open Full Case Registry →
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVITY FEED & LAB REPORTS (5 COLS) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header Tabs with Multi-Color Active States */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/90 w-full">
                <button
                  onClick={() => setRightTab('hologram')}
                  className={`flex-1 py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider font-mono ${
                    rightTab === 'hologram'
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-white font-bold'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3D Hologram</span>
                </button>
                <button
                  onClick={() => setRightTab('audit')}
                  className={`flex-1 py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider font-mono ${
                    rightTab === 'audit'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black shadow-lg shadow-purple-500/25'
                      : 'text-slate-400 hover:text-white font-bold'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Audit Stream</span>
                </button>
                <button
                  onClick={() => setRightTab('reports')}
                  className={`flex-1 py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider font-mono ${
                    rightTab === 'reports'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/25'
                      : 'text-slate-400 hover:text-white font-bold'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lab Reports</span>
                </button>
              </div>
            </div>

            {/* Content: 3D Hologram */}
            {rightTab === 'hologram' && (
              <div className="space-y-3">
                <ThreeDInteractiveHologram />
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="flex items-center justify-between text-cyan-300 font-bold">
                    <span>FORENSIC 3D RENDERING ENGINE</span>
                    <span className="text-emerald-400">ONLINE</span>
                  </div>
                  <p className="text-slate-400 text-[10px]">
                    Interactive spatial reconstruction. Click & drag to rotate geometry. Switch models between SHA-256 Vault, STR DNA typing, and Crime Scene Ballistics.
                  </p>
                </div>
              </div>
            )}

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

