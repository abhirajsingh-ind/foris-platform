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
  Scale,
  Search,
  Cpu,
  Bell,
  Sparkles,
  ExternalLink,
  Layers,
  FileSignature,
  CheckCircle2,
  X,
  Radio,
  Zap,
  Sun,
  Moon,
} from 'lucide-react';

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
        searchInputRef.current?.focus();
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
    { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
    { id: 'cases', label: 'Case Dossiers', icon: Briefcase },
    { id: 'evidence', label: 'Evidence Register', icon: Shield },
    { id: 'reports', label: 'Forensic Reports', icon: FileText, highlight: true },
    { id: 'custody', label: 'Chain of Custody', icon: Clock },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'security', label: 'Security Center', icon: ShieldAlert },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Left Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 shadow-xl z-20">
        <div>
          {/* Brand Logo & Subtitle */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/80">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 text-white shadow-md font-serif font-black text-sm">
                SFSL
              </div>
              <div>
                <span className="font-bold text-base tracking-wide text-white block">
                  FORIS Portal
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  State Forensic Laboratory
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                OFFICIAL SYSTEM
              </span>
              <span>SFSL-GOV-IN</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2.5 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? item.isAi
                        ? 'bg-emerald-950/60 text-emerald-300 border-l-4 border-emerald-400 shadow-sm'
                        : 'bg-slate-800 text-emerald-400 border-l-4 border-emerald-500 shadow-sm'
                      : item.isAi
                        ? 'text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-950/30 border-l-4 border-emerald-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? (item.isAi ? 'text-emerald-300 animate-pulse' : 'text-emerald-400') : (item.isAi ? 'text-emerald-400' : 'text-slate-400')}`} />
                  <span className="flex-1 text-left flex items-center justify-between">
                    {item.label}
                    {item.isAi && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-widest font-mono">
                        NEW
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Defense Status & Bottom Info */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Ledger Active
            </span>
            <span className="text-[10px] text-slate-500">SHA-256 Valid</span>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out Officer
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-slate-900/85 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 z-30">
          {/* Left section: Global Search & Current Title */}
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Global Search (Case ID, FIR, Evidence, Hash, Officer)... [Ctrl+K]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) setShowSearchDropdown(true);
                  }}
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 transition-all outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchDropdown(false);
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {showSearchDropdown && (
                <div className="absolute left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 mb-2 border-b border-slate-800">
                    <span className="font-bold uppercase tracking-wider text-cyan-400">
                      Search Results for "{searchQuery}"
                    </span>
                    <button
                      onClick={() => setShowSearchDropdown(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {searchResults.cases.length === 0 &&
                    searchResults.evidence.length === 0 &&
                    searchResults.reports.length === 0 && (
                      <div className="py-6 text-center text-xs text-slate-500">
                        {isSearching ? 'Searching cryptographic ledger...' : 'No matching forensic records found.'}
                      </div>
                    )}

                  {/* Cases */}
                  {searchResults.cases.length > 0 && (
                    <div className="mb-3">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1.5 px-1">
                        Case Dossiers ({searchResults.cases.length})
                      </span>
                      <div className="space-y-1">
                        {searchResults.cases.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleSelectSearchResult('case', c.id)}
                            className="p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-cyan-500/30 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                <span className="text-cyan-400 font-mono">{c.id}</span>
                                <span className="text-slate-300 truncate max-w-xs">{c.title}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                FIR: {c.firNumber} • {c.category}
                              </div>
                            </div>
                            <StatusBadge type="case" value={c.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evidence */}
                  {searchResults.evidence.length > 0 && (
                    <div className="mb-3">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1.5 px-1">
                        Evidence Register ({searchResults.evidence.length})
                      </span>
                      <div className="space-y-1">
                        {searchResults.evidence.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => handleSelectSearchResult('evidence', ev.id)}
                            className="p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-cyan-500/30 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                <span className="text-cyan-400 font-mono">{ev.id}</span>
                                <span className="text-slate-300 truncate max-w-xs">{ev.description}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate max-w-sm">
                                SHA-256: {ev.sha256Hash}
                              </div>
                            </div>
                            <StatusBadge type="evidence" value={ev.currentStatus} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reports */}
                  {searchResults.reports.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1.5 px-1">
                        Forensic Reports ({searchResults.reports.length})
                      </span>
                      <div className="space-y-1">
                        {searchResults.reports.map((r) => (
                          <div
                            key={r.id}
                            onClick={() => handleSelectSearchResult('report', r.id)}
                            className="p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-cyan-500/30 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                <span className="text-cyan-400 font-mono">{r.id}</span>
                                <span className="text-slate-300 truncate max-w-xs">{r.title}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Author: {r.author?.name} [{r.author?.badgeId}] • Active: V{r.currentVersion}
                              </div>
                            </div>
                            <StatusBadge type="report" value={r.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right section: System Telemetry, Demo Role Switcher & User Profile */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-md active:scale-95 ${
                theme === 'dark'
                  ? 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 hover:border-amber-400/50 text-slate-200 hover:text-amber-300'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 shadow-amber-900/10'
              }`}
              title={theme === 'dark' ? 'Switch to Official Laboratory Light Mode' : 'Switch to Tactical Dark Mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span className="font-semibold text-[11px] text-amber-300 hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-[11px] text-indigo-900 hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>

            {/* Live Clock & Epoch */}
            <div className="hidden xl:flex flex-col items-end text-right px-3 py-1 bg-slate-950/50 border border-slate-800/80 rounded-xl">
              <span className="text-[11px] font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {currentTime.toLocaleTimeString()} IST
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                {currentTime.toISOString().slice(0, 10)}
              </span>
            </div>

            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500/50 text-xs font-medium transition-all shadow-md active:scale-95"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400 hidden sm:inline">Role Persona:</span>
                <span className="font-bold text-white font-mono">{user?.badgeId}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl p-2.5 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Switch Officer Role:
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400">Instant Switch</span>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-between text-xs group ${user?.badgeId === 'FEX-1024' ? 'bg-slate-800/50 border border-cyan-800/40' : ''}`}
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        FEX-1024
                        <span className="text-[10px] font-normal text-cyan-300 px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800">
                          Forensic Officer
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Dr. Abhiraj Singh • Draft, Amend, Sign V1 $\to$ V2
                      </div>
                    </div>
                    {user?.badgeId === 'FEX-1024' ? (
                      <span className="text-cyan-400 font-bold text-sm">✓</span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-500 group-hover:text-cyan-400">LOGIN →</span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-between text-xs group ${user?.badgeId === 'SPO-2048' ? 'bg-slate-800/50 border border-blue-800/40' : ''}`}
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
                    {user?.badgeId === 'SPO-2048' ? (
                      <span className="text-blue-400 font-bold text-sm">✓</span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-500 group-hover:text-blue-400">LOGIN →</span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl hover:bg-amber-950/40 border border-transparent hover:border-amber-500/30 transition-colors flex items-center justify-between text-xs group ${user?.badgeId === 'JDG-3012' ? 'bg-amber-950/30 border-amber-800/40' : ''}`}
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
                    {user?.badgeId === 'JDG-3012' ? (
                      <span className="text-amber-400 font-bold text-sm">✓</span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-500 group-hover:text-amber-400">LOGIN →</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            {user && (
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800/80">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-cyan-950">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="hidden lg:block text-left">
                  <span className="text-xs font-bold text-white block leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono truncate max-w-[150px]">
                    {user.designation}
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* PROMINENT JUDICIAL READ-ONLY BANNER */}
        {user?.role === 'JUDGE' && (
          <div className="bg-gradient-to-r from-amber-950 via-amber-900/80 to-amber-950 border-b border-amber-500/50 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg animate-fadeIn z-20">
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
          <div className="bg-emerald-950/90 border-b border-emerald-500/50 px-6 py-2.5 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{judgeViolationFeedback}</span>
          </div>
        )}

        {/* Main Content Render Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950/40">{children}</main>
      </div>

      {/* 17-Step Demo Guide Modal */}
      {isDemoGuideOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
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
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-cyan-300 font-mono">1. Persona Login</span>
                  <p className="text-slate-400">
                    Log in as Forensic Officer <span className="text-white font-mono">FEX-1024</span>.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-cyan-300 font-mono">2. Open Case Dossier</span>
                  <p className="text-slate-400">
                    Inspect <span className="text-white font-mono">MP-FOR-2026-00125</span> Cyber Case.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-cyan-300 font-mono">3 & 4. Chain of Custody</span>
                  <p className="text-slate-400">
                    Open <span className="text-white font-mono">EV-001</span> to view 4-stage custody timeline.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-cyan-300 font-mono">5, 6 & 7. Report V1 & SHA-256</span>
                  <p className="text-slate-400">
                    Open Report V1 $\to$ Click <span className="text-emerald-300 font-semibold">Verify SHA-256</span>.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-cyan-300 font-mono">8 & 9. Formal Amendment</span>
                  <p className="text-slate-400">
                    Click <span className="text-cyan-300 font-semibold">Amend Report</span> $\to$ Select "Additional evidence" $\to$ Submit V2.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-cyan-300 font-mono">10 & 11. Immutability & Diff</span>
                  <p className="text-slate-400">
                    Show V1 remains intact $\to$ Click <span className="text-cyan-300 font-semibold">Compare V1 ↔ V2</span> for side-by-side diff.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-cyan-300 font-mono">12 & 13. Audit Hash Chain</span>
                  <p className="text-slate-400">
                    Open Audit Trail $\to$ Click <span className="text-emerald-300 font-semibold">Verify Audit Integrity</span>.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-amber-300 font-mono">14, 15 & 16. Judicial 403 Test</span>
                  <p className="text-slate-400">
                    Switch to Judge <span className="text-amber-300 font-mono">JDG-3012</span> $\to$ Click 403 test button $\to$ Server blocks write.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-slate-300 text-[11px] leading-relaxed">
                <span className="font-bold text-cyan-300 block mb-1">💡 Pro-Tip for Evaluation:</span>
                Explain to the judges: <em>"We do not prevent authorized amendments; we ensure that every amendment is permanent, versioned, cryptographically hashed, attributed to an officer, and verifiable by the court."</em>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                onClick={() => setIsDemoGuideOpen(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-900/30"
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
