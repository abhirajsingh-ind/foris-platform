import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from './StatusBadge';
import { FloatingSamadhaan } from './FloatingSamadhaan';
import {
  Shield,
  Briefcase,
  FileText,
  Clock,
  History,
  ShieldAlert,
  Users,
  BarChart3,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Scale,
  Search,
  Cpu,
  Bell,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  X,
  Zap,
  HelpCircle,
} from 'lucide-react';
import officerPhoto from '../assets/rajesh_varma.jpg';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigateResource?: (type: 'case' | 'evidence' | 'report', id: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  onNavigateResource,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);
  const [judgeViolationFeedback, setJudgeViolationFeedback] = useState<string | null>(null);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    cases: any[];
    evidence: any[];
    reports: any[];
  }>({ cases: [], evidence: [], reports: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global search effect
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults({ cases: [], evidence: [], reports: [] });
      setShowSearchDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const token = localStorage.getItem('foris_token');
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results);
          setShowSearchDropdown(true);
        }
      } catch (e) {
        console.error('Search failed:', e);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'cases', label: 'Case Dossiers', icon: Briefcase },
    { id: 'evidence', label: 'Evidence Register', icon: Shield },
    { id: 'reports', label: 'Forensic Reports', icon: FileText },
    { id: 'custody', label: 'Chain of Custody', icon: Clock },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'security', label: 'Security Center', icon: ShieldAlert },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'samadhaan', label: 'FORIS SAMADHAAN (AI)', icon: Sparkles, isAi: true },
  ];

  const handleTestJudgeViolation = async () => {
    try {
      const res = await fetch('/api/security/test-judge-violation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('foris_token')}`,
        },
        body: JSON.stringify({ action: 'UNAUTHORIZED_JUDICIAL_WRITE' }),
      });
      const data = await res.json();
      if (res.status === 403) {
        setJudgeViolationFeedback(
          '✓ DEMO TEST PASSED: Server rejected mutation with HTTP 403 Forbidden and logged the security event.'
        );
        setTimeout(() => setJudgeViolationFeedback(null), 6000);
      } else {
        alert(data.message || 'Operation completed.');
      }
    } catch (e) {
      alert('Network request failed.');
    }
  };

  const handleSelectSearchResult = (type: 'case' | 'evidence' | 'report', id: string) => {
    setShowSearchDropdown(false);
    setIsSearchModalOpen(false);
    setSearchQuery('');
    if (type === 'case') {
      setActiveTab('cases');
    } else if (type === 'evidence') {
      setActiveTab('evidence');
    } else if (type === 'report') {
      setActiveTab('reports');
    }
    if (onNavigateResource) {
      onNavigateResource(type, id);
    }
  };

  const getActiveTabTitle = () => {
    const item = navItems.find((n) => n.id === activeTab);
    return item ? item.label : 'Dashboard';
  };

  const formattedDate = `Today, ${new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(currentTime)}`;

  return (
    <div className="flex h-screen bg-[#0c0d10] text-slate-100 overflow-hidden font-sans selection:bg-[#d4f938]/30 selection:text-[#d4f938] bg-dot-matrix">
      {/* Left Icon Navigation Rail (Matching Reference UI 1:1) */}
      <aside className="w-20 bg-[#0c0d10] border-r border-[#1a1c24] flex flex-col justify-between items-center py-5 shrink-0 z-40 select-none">
        {/* Top Logo */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-11 h-11 rounded-2xl bg-[#151720] border border-[#252838] flex items-center justify-center hover:border-[#d4f938]/60 transition-all shadow-lg group relative"
            title="State Forensic Science Laboratory - FORIS"
          >
            {/* Signature Slanted Double-Bar Glyph from Reference */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="transform -rotate-12 transition-transform group-hover:rotate-0"
            >
              <rect x="4" y="3" width="5" height="18" rx="2.5" fill="#d4f938" />
              <rect x="13" y="5" width="5" height="14" rx="2.5" fill="#ffffff" fillOpacity="0.85" />
            </svg>
          </button>

          {/* Navigation Icon List */}
          <nav className="flex flex-col items-center gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? 'bg-[#d4f938] text-black shadow-[0_0_20px_rgba(212,249,56,0.35)] scale-105'
                        : 'text-[#7e8597] hover:text-white hover:bg-[#161822]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  </button>

                  {/* Tooltip on Hover */}
                  <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#161822] text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-[#262a38] shadow-2xl flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.isAi && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#d4f938]/20 text-[#d4f938] font-mono">
                        AI
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Rail Actions: Settings, Roadmap & Logout */}
        <div className="flex flex-col items-center gap-3">
          {/* Demo Guide Shortcut */}
          <div className="relative group">
            <button
              onClick={() => setIsDemoGuideOpen(true)}
              className="w-11 h-11 rounded-2xl text-[#7e8597] hover:text-[#d4f938] hover:bg-[#161822] flex items-center justify-center transition-all"
              title="Demonstration Roadmap"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#161822] text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-[#262a38] shadow-2xl">
              Evaluation Roadmap
            </div>
          </div>

          {/* Quick Search Shortcut */}
          <div className="relative group">
            <button
              onClick={() => {
                setIsSearchModalOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className="w-11 h-11 rounded-2xl text-[#7e8597] hover:text-white hover:bg-[#161822] flex items-center justify-center transition-all"
              title="Search (Ctrl+K)"
            >
              <Search className="w-5 h-5" />
            </button>
            <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#161822] text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-[#262a38] shadow-2xl">
              Global Search (Ctrl+K)
            </div>
          </div>

          {/* Logout */}
          <div className="relative group">
            <button
              onClick={logout}
              className="w-11 h-11 rounded-2xl text-[#7e8597] hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all"
              title="Sign Out Officer"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#161822] text-red-400 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-red-500/30 shadow-2xl">
              Sign Out
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar (Matching Reference UI 1:1) */}
        <header className="h-16 bg-[#0c0d10]/95 backdrop-blur-md border-b border-[#1a1c24] px-8 flex items-center justify-between shrink-0 z-30">
          {/* Left Title */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {getActiveTabTitle()}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#161820] border border-[#262936] text-[10px] font-mono text-[#d4f938]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4f938] animate-pulse"></span>
              LIVE TELEMETRY
            </span>
          </div>

          {/* Right Header Elements: Date Stepper, Notifications, Officer Profile */}
          <div className="flex items-center gap-3.5">
            {/* Interactive Date Stepper Capsule */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161820] border border-[#262936] text-xs font-medium text-slate-300 shadow-sm">
              <button className="text-slate-400 hover:text-white transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-slate-200 font-medium select-none">{formattedDate}</span>
              <button className="text-slate-400 hover:text-white transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notification Bell Button with Amber/Lime Dot */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="w-9 h-9 rounded-full bg-[#161820] border border-[#262936] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#d4f938]/40 transition-all shadow-sm"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#d4f938] shadow-[0_0_6px_#d4f938]"></span>
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#14161f] border border-[#262938] shadow-2xl p-3.5 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#202433]">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Security Notifications
                    </span>
                    <span className="text-[10px] font-mono text-[#d4f938]">2 New</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#181b27] border border-[#252a3d]">
                      <div className="text-slate-200 font-semibold flex items-center justify-between">
                        <span>Biometric Auth Verified</span>
                        <span className="text-[9px] font-mono text-slate-400">Just now</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Officer {user?.name || 'Dr. Abhiraj Singh'} session authenticated with 99.4% match.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#181b27] border border-[#252a3d]">
                      <div className="text-slate-200 font-semibold flex items-center justify-between">
                        <span>Consensus Ledger Synced</span>
                        <span className="text-[9px] font-mono text-slate-400">2m ago</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Cryptographic hash chain validated across all forensic records.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Officer Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-[#161820] border border-[#262936] hover:border-[#d4f938]/50 transition-all shadow-sm group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#d4f938]/60 flex items-center justify-center bg-[#d4f938] text-black font-black text-xs shrink-0 shadow-sm">
                  {user?.badgeId === 'FEX-1024' ? (
                    <img
                      src={officerPhoto}
                      alt="Officer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{user?.name ? user.name.slice(0, 2).toUpperCase() : 'AS'}</span>
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-white block leading-tight group-hover:text-[#d4f938] transition-colors">
                    {user?.name || 'Dr. Abhiraj Singh'}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    @{user?.badgeId ? user.badgeId.toLowerCase() : 'abhirajsingh'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Role Switcher Dropdown */}
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#14161f] border border-[#262938] shadow-2xl p-2.5 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-[#202433]">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Switch Officer Role:
                    </span>
                    <span className="text-[9px] font-mono text-[#d4f938]">Active Session</span>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl hover:bg-[#1c202d] transition-colors flex items-center justify-between text-xs group ${
                      user?.badgeId === 'FEX-1024' ? 'bg-[#1c202d] border border-[#d4f938]/30' : ''
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        FEX-1024
                        <span className="text-[10px] font-normal text-[#d4f938] px-1.5 py-0.2 rounded bg-[#d4f938]/10 border border-[#d4f938]/30">
                          Forensic Officer
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Dr. Abhiraj Singh • Draft, Amend, Sign V1 → V2
                      </div>
                    </div>
                    {user?.badgeId === 'FEX-1024' && (
                      <span className="text-[#d4f938] font-bold text-sm">✓</span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl hover:bg-[#1c202d] transition-colors flex items-center justify-between text-xs group ${
                      user?.badgeId === 'SPO-2048' ? 'bg-[#1c202d] border border-blue-500/30' : ''
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        SPO-2048
                        <span className="text-[10px] font-normal text-blue-300 px-1.5 py-0.2 rounded bg-blue-950 border border-blue-800">
                          Senior Police
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        ACP Vikram Rathore • Cases & Evidence Custody
                      </div>
                    </div>
                    {user?.badgeId === 'SPO-2048' && (
                      <span className="text-blue-400 font-bold text-sm">✓</span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl hover:bg-[#1c202d] border border-transparent hover:border-amber-500/30 transition-colors flex items-center justify-between text-xs group ${
                      user?.badgeId === 'JDG-3012' ? 'bg-amber-950/30 border-amber-800/40' : ''
                    }`}
                  >
                    <div>
                      <div className="font-bold text-amber-300 flex items-center gap-2">
                        JDG-3012
                        <span className="text-[10px] font-bold text-amber-200 px-1.5 py-0.2 rounded bg-amber-900/50 border border-amber-600/50">
                          Special Judge (READ-ONLY)
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-400/80 mt-0.5">
                        Hon. Justice Manisha • Strict Court Read-Only Mode
                      </div>
                    </div>
                    {user?.badgeId === 'JDG-3012' && (
                      <span className="text-amber-400 font-bold text-sm">✓</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PROMINENT JUDICIAL READ-ONLY BANNER */}
        {user?.role === 'JUDGE' && (
          <div className="bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-amber-950/90 border-b border-amber-500/40 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg animate-fadeIn z-20">
            <div className="flex items-center gap-2.5 text-amber-300">
              <div className="p-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold tracking-wider uppercase text-amber-200">
                  READ-ONLY JUDICIAL ACCESS ACTIVE
                </span>
                <span className="text-[11px] text-amber-300/80 block sm:inline sm:ml-2">
                  (Dossier Inspection & Audit Verification Mode — State modifications prohibited)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestJudgeViolation}
                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/50 text-[11px] font-bold font-mono transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                Test Unauthorized Judicial Mutation (HTTP 403)
              </button>
            </div>
          </div>
        )}

        {/* Toast Feedback for Judge Violation Test */}
        {judgeViolationFeedback && (
          <div className="bg-[#14231b] border-b border-[#d4f938]/50 px-6 py-2.5 text-[#d4f938] text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-[#d4f938]" />
            <span>{judgeViolationFeedback}</span>
          </div>
        )}

        {/* Main Content Render Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0c0d10]">{children}</main>
      </div>

      {/* Global Search Modal (Ctrl+K) */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center pt-20 p-4">
          <div className="bg-[#14161f] border border-[#262a3d] rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-4 border-b border-[#202433] flex items-center gap-3">
              <Search className="w-5 h-5 text-[#d4f938]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search Cases, FIR, Evidence Hash, Forensic Reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto space-y-3">
              {isSearching && (
                <div className="py-8 text-center text-xs text-slate-400 font-mono">
                  Searching cryptographic ledger...
                </div>
              )}

              {!isSearching &&
                searchQuery.trim().length >= 2 &&
                searchResults.cases.length === 0 &&
                searchResults.evidence.length === 0 &&
                searchResults.reports.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No matching forensic records found.
                  </div>
                )}

              {/* Case Results */}
              {searchResults.cases.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#d4f938] block mb-2 px-1">
                    Cases ({searchResults.cases.length})
                  </span>
                  <div className="space-y-1.5">
                    {searchResults.cases.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectSearchResult('case', c.id)}
                        className="p-3 rounded-2xl bg-[#181b27] hover:bg-[#1e2233] cursor-pointer transition-colors border border-transparent hover:border-[#d4f938]/30 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span className="text-[#d4f938] font-mono">{c.id}</span>
                            <span className="text-slate-200">{c.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            FIR: {c.firNumber} • {c.category}
                          </div>
                        </div>
                        <StatusBadge type="case" value={c.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Results */}
              {searchResults.evidence.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#d4f938] block mb-2 px-1">
                    Evidence ({searchResults.evidence.length})
                  </span>
                  <div className="space-y-1.5">
                    {searchResults.evidence.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => handleSelectSearchResult('evidence', ev.id)}
                        className="p-3 rounded-2xl bg-[#181b27] hover:bg-[#1e2233] cursor-pointer transition-colors border border-transparent hover:border-[#d4f938]/30 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span className="text-[#d4f938] font-mono">{ev.id}</span>
                            <span className="text-slate-200">{ev.description}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-md">
                            SHA-256: {ev.sha256Hash}
                          </div>
                        </div>
                        <StatusBadge type="evidence" value={ev.currentStatus} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reports Results */}
              {searchResults.reports.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#d4f938] block mb-2 px-1">
                    Reports ({searchResults.reports.length})
                  </span>
                  <div className="space-y-1.5">
                    {searchResults.reports.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => handleSelectSearchResult('report', r.id)}
                        className="p-3 rounded-2xl bg-[#181b27] hover:bg-[#1e2233] cursor-pointer transition-colors border border-transparent hover:border-[#d4f938]/30 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span className="text-[#d4f938] font-mono">{r.id}</span>
                            <span className="text-slate-200">{r.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Author: {r.author?.name} [{r.author?.badgeId}] • V{r.currentVersion}
                          </div>
                        </div>
                        <StatusBadge type="report" value={r.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 17-Step Demo Guide Modal */}
      {isDemoGuideOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161f] border border-[#262a3d] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-[#202433] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#d4f938]/10 text-[#d4f938] border border-[#d4f938]/30">
                  <Sparkles className="w-5 h-5 text-[#d4f938]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Platform Demonstration Roadmap
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    5–7 Minute Master Demonstration Workflow
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDemoGuideOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a1d2b]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#181b27] border border-[#252a3d] space-y-1.5">
                  <span className="font-bold text-[#d4f938] font-mono">1. Persona Login</span>
                  <p className="text-slate-400">
                    Log in as Forensic Officer <span className="text-white font-mono">FEX-1024</span>.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#181b27] border border-[#252a3d] space-y-1.5">
                  <span className="font-bold text-[#d4f938] font-mono">2. Open Case Dossier</span>
                  <p className="text-slate-400">
                    Inspect <span className="text-white font-mono">MP-FOR-2026-00125</span> Cyber Case.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#181b27] border border-[#252a3d] space-y-1.5">
                  <span className="font-bold text-[#d4f938] font-mono">3 & 4. Chain of Custody</span>
                  <p className="text-slate-400">
                    Open <span className="text-white font-mono">EV-001</span> to view 4-stage custody timeline.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#181b27] border border-[#252a3d] space-y-1.5">
                  <span className="font-bold text-[#d4f938] font-mono">5, 6 & 7. Report V1 & SHA-256</span>
                  <p className="text-slate-400">
                    Open Report V1 → Click <span className="text-[#d4f938] font-semibold">Verify SHA-256</span>.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#181b27] border border-[#252a3d] space-y-1.5">
                  <span className="font-bold text-[#d4f938] font-mono">8 & 9. Formal Amendment</span>
                  <p className="text-slate-400">
                    Click <span className="text-[#d4f938] font-semibold">Amend Report</span> → Select "Additional evidence" → Submit V2.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#181b27] border border-[#252a3d] space-y-1.5">
                  <span className="font-bold text-[#d4f938] font-mono">10 & 11. Immutability & Diff</span>
                  <p className="text-slate-400">
                    Show V1 remains intact → Click <span className="text-[#d4f938] font-semibold">Compare V1 ↔ V2</span> for side-by-side diff.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#181b27] border border-[#252a3d] space-y-1.5">
                  <span className="font-bold text-[#d4f938] font-mono">12 & 13. Audit Hash Chain</span>
                  <p className="text-slate-400">
                    Open Audit Trail → Click <span className="text-[#d4f938] font-semibold">Verify Audit Integrity</span>.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#181b27] border border-[#252a3d] space-y-1.5">
                  <span className="font-bold text-amber-300 font-mono">14, 15 & 16. Judicial 403 Test</span>
                  <p className="text-slate-400">
                    Switch to Judge <span className="text-amber-300 font-mono">JDG-3012</span> → Click 403 test button → Server blocks write.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#181b27] border border-[#d4f938]/30 text-slate-300 text-[11px] leading-relaxed">
                <span className="font-bold text-[#d4f938] block mb-1">💡 Pro-Tip for Evaluation:</span>
                Explain to the judges: <em>"We do not prevent authorized amendments; we ensure that every amendment is permanent, versioned, cryptographically hashed, attributed to an officer, and verifiable by the court."</em>
              </div>
            </div>

            <div className="p-4 border-t border-[#202433] flex justify-end">
              <button
                onClick={() => setIsDemoGuideOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#d4f938] hover:brightness-110 text-black font-bold text-xs shadow-lg shadow-[#d4f938]/20"
              >
                Close Roadmap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Floating AI Assistant */}
      <FloatingSamadhaan onNavigateTab={setActiveTab} />
    </div>
  );
};
