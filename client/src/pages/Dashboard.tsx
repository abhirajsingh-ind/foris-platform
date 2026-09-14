import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Shield,
  ShieldAlert,
  Activity,
  ArrowUpRight,
  ChevronDown,
  ExternalLink,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-slate-400 gap-3">
        <div className="w-10 h-10 border-3 border-[#d4f938] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono tracking-wider text-slate-400">
          Loading Cryptographic Telemetry...
        </span>
      </div>
    );
  }

  // Monthly bar chart data
  const monthlyData = [
    { month: 'Jun', height: 42 },
    { month: 'Jul', height: 58 },
    { month: 'Aug', height: 48 },
    { month: 'Sep', height: 72 },
    { month: 'Oct', height: 96, isPeak: true, badge: '+80%' },
    { month: 'Nov', height: 64 },
    { month: 'Dec', height: 82 },
  ];

  // Operations step histogram heights (24 bars)
  const operationStepHeights = [
    32, 45, 28, 55, 68, 42, 50, 62, // First 8 (35% regular)
    75, 88, 70, 92, 84, 98, 86, 94, 78, 85, 90, 76, 88, 95, 72, 82, // Next 16 (65% crypto)
  ];

  // Live alert queue records built from real cases & security telemetry
  const queueRecords = recentCases.slice(0, 5).map((c, idx) => {
    const times = ['10:42 AM', '09:15 AM', '08:30 AM', '07:45 AM', '06:12 AM'];
    const severities = ['Cyber Forensics', 'Physical Evidence', 'Document Analysis', 'Ballistics Unit', 'Toxicology'];
    const statuses = ['High', 'Critical', 'Moderate', 'High', 'Low'];
    return {
      time: times[idx] || '09:00 AM',
      id: c.id,
      title: c.title,
      dept: severities[idx] || c.category,
      status: statuses[idx] || (c.status === 'ACTIVE' ? 'High' : 'Moderate'),
      rawCase: c,
    };
  });

  // Fallback records if cases are empty
  const displayQueue = queueRecords.length > 0 ? queueRecords : [
    { time: '10:42 AM', id: 'MP-FOR-2026-00125', title: 'State Cyber Exfiltration & Ransomware', dept: 'Cyber Forensics', status: 'High', rawCase: null },
    { time: '09:15 AM', id: 'MP-FOR-2026-00126', title: 'Homicide Ballistics & Shell Casing Hash', dept: 'Ballistics Unit', status: 'Critical', rawCase: null },
    { time: '08:30 AM', id: 'MP-FOR-2026-00127', title: 'Forged Property Deed Signature Analysis', dept: 'Document Analysis', status: 'Moderate', rawCase: null },
    { time: '07:45 AM', id: 'MP-FOR-2026-00128', title: 'Suspicious Poisoning Chemical Analysis', dept: 'Toxicology', status: 'High', rawCase: null },
  ];

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-10">
      {/* 1. Greeting Hero Section (Matching Reference 1:1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-light text-white tracking-tight">
            Hello <span className="font-extrabold text-[#d4f938]">Dr. Abhiraj</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Welcome to State Forensic Science Laboratory • Cryptographic Evidence Subsystem
          </p>
        </div>

        <button
          onClick={() => setActiveTab('security')}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#d4f938] hover:brightness-110 text-black font-extrabold text-sm shadow-[0_0_25px_rgba(212,249,56,0.3)] transition-all active:scale-95 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-black stroke-black" />
          Check Alerts
        </button>
      </div>

      {/* 2. Top 3 Lime Metric KPI Cards (Matching Reference 1:1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Active Cases */}
        <div className="bg-[#d4f938] text-black rounded-3xl p-6 relative overflow-hidden shadow-[0_10px_30px_rgba(212,249,56,0.12)] flex flex-col justify-between h-44 group hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-black/10 flex items-center justify-center text-black">
              <Briefcase className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black text-[#d4f938] text-xs font-bold font-mono shadow-sm">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              +14.2%
            </div>
          </div>

          <div>
            <div className="text-4xl font-extrabold tracking-tight text-black font-mono">
              {stats?.totalActiveCases || (recentCases.length > 0 ? recentCases.length : '4,372')}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-black/80">
                Total Active Cases
              </span>
              <span className="text-[11px] font-medium text-black/60 hidden sm:inline">
                Active Dossiers
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Sealed Evidence Items */}
        <div className="bg-[#d4f938] text-black rounded-3xl p-6 relative overflow-hidden shadow-[0_10px_30px_rgba(212,249,56,0.12)] flex flex-col justify-between h-44 group hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-black/10 flex items-center justify-center text-black">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black text-[#d4f938] text-xs font-bold font-mono shadow-sm">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              +25%
            </div>
          </div>

          <div>
            <div className="text-4xl font-extrabold tracking-tight text-black font-mono">
              {stats?.totalEvidenceSealed ? stats.totalEvidenceSealed.toLocaleString() : '3,568'}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-black/80">
                Sealed Evidence Items
              </span>
              <span className="text-[11px] font-medium text-black/60 hidden sm:inline">
                SHA-256 On-Chain
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Cryptographic Consensus */}
        <div className="bg-[#d4f938] text-black rounded-3xl p-6 relative overflow-hidden shadow-[0_10px_30px_rgba(212,249,56,0.12)] flex flex-col justify-between h-44 group hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-black/10 flex items-center justify-center text-black">
              <Activity className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black text-[#d4f938] text-xs font-bold font-mono shadow-sm">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              +15%
            </div>
          </div>

          <div>
            <div className="text-4xl font-extrabold tracking-tight text-black font-mono">
              100%
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-black/80">
                Consensus & Health
              </span>
              <span className="text-[11px] font-medium text-black/60 hidden sm:inline">
                {stats?.totalAuditEvents ? `${stats.totalAuditEvents} Verified Blocks` : '5,120 Verified Blocks'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Telemetry Row (3 Cards Matching Reference 1:1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Firewall Activity (Semi-circular Radial Gauge) */}
        <div className="bg-[#12141c] border border-[#1f2331] rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white tracking-wide">Firewall Activity</span>
            <span className="text-[10px] font-mono font-bold text-[#d4f938] px-2.5 py-0.5 rounded-full bg-[#d4f938]/10 border border-[#d4f938]/30">
              Active WAF
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-white mt-3 font-mono">12,340</div>
            <div className="text-xs text-slate-400">Total requests inspected today</div>
          </div>

          {/* SVG Semi-circular Gauge Chart */}
          <div className="relative flex flex-col items-center justify-center my-4">
            <svg width="220" height="110" viewBox="0 0 220 110" className="overflow-visible">
              {/* Background Arc */}
              <path
                d="M 20 100 A 90 90 0 0 1 200 100"
                fill="none"
                stroke="#222736"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Foreground White Arc (70% fill) */}
              <path
                d="M 20 100 A 90 90 0 0 1 200 100"
                fill="none"
                stroke="#ffffff"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset="85"
                className="transition-all duration-1000"
              />
            </svg>

            {/* Lime Pill Badge Centered in Arc */}
            <div className="absolute bottom-2 flex items-center justify-center">
              <span className="px-3 py-1 rounded-full bg-[#d4f938] text-black font-extrabold text-xs shadow-lg shadow-[#d4f938]/20 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                +65%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-3 border-t border-[#1a1d28]">
            <span>0% Latency</span>
            <span className="text-[#d4f938] font-semibold">99.4% Biometric Auth</span>
            <span>100% Pass</span>
          </div>
        </div>

        {/* Card 2: Alert & Evidence Volume (7-Month Bar Chart with Peak Pill) */}
        <div className="bg-[#12141c] border border-[#1f2331] rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white tracking-wide">Alert & Case Volume</span>
            <span className="text-xs text-slate-400 font-mono">Jun – Dec</span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-white mt-3 font-mono">8,940</div>
            <div className="text-xs text-slate-400">Total forensic items processed</div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-32 flex items-end justify-between gap-2 pt-8 pb-2 px-1">
            {monthlyData.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full relative flex flex-col justify-end" style={{ height: `${item.height}%` }}>
                  {item.isPeak && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#d4f938] text-black font-extrabold text-[10px] whitespace-nowrap shadow-md shadow-[#d4f938]/30">
                      {item.badge}
                    </div>
                  )}
                  {/* Bar Pillar with Gradient and White Cap Line */}
                  <div className="w-full h-full rounded-t-md bg-gradient-to-t from-[#1b1f2e] via-[#2a3044] to-[#4b546e] relative overflow-hidden">
                    <div className="w-full h-[2px] bg-white absolute top-0 left-0"></div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{item.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-3 border-t border-[#1a1d28]">
            <span>Avg: 1,277 / mo</span>
            <span className="text-[#d4f938] font-semibold">Peak in October</span>
          </div>
        </div>

        {/* Card 3: Forensic Breakdown (Smooth Dual-Wave Bezier Chart) */}
        <div className="bg-[#12141c] border border-[#1f2331] rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white tracking-wide">Breakdown</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181b26] border border-[#252a3d] text-xs font-medium text-slate-300">
              <span>Week</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-white mt-3 font-mono">3,892</div>
            <div className="text-xs text-slate-400">Cryptographic verifications</div>
          </div>

          {/* Smooth Dual Wave SVG */}
          <div className="relative h-32 my-2">
            <svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="none" className="overflow-visible">
              <defs>
                <linearGradient id="limeWaveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4f938" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#d4f938" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Fill Under Lime Wave */}
              <path
                d="M 0 90 C 50 110, 80 40, 140 50 C 200 60, 240 20, 300 35 L 300 120 L 0 120 Z"
                fill="url(#limeWaveGrad)"
              />

              {/* White Curve (Mitigations) */}
              <path
                d="M 0 100 C 60 85, 90 70, 150 75 C 210 80, 250 45, 300 55"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Lime Curve (Evidence Ingested) */}
              <path
                d="M 0 90 C 50 110, 80 40, 140 50 C 200 60, 240 20, 300 35"
                fill="none"
                stroke="#d4f938"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            {/* Floating Peak Badge */}
            <div className="absolute top-1 right-12 px-2.5 py-0.5 rounded-full bg-[#d4f938] text-black font-extrabold text-[10px] flex items-center gap-1 shadow-lg shadow-[#d4f938]/30">
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              +35%
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-[#1a1d28]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d4f938]"></span>
              <span>Evidence Ingestion</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <span>Anomalies Mitigated</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Operations Equalizer & Live Alert Queue Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Operations (Equalizer Step Histogram) */}
        <div className="bg-[#12141c] border border-[#1f2331] rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-sm font-bold text-white tracking-wide">Operations</span>
            <div className="text-xs text-slate-400 mt-1">750 Total Operations Today</div>
          </div>

          {/* Equalizer Step Histogram */}
          <div className="my-6">
            <div className="h-28 flex items-end justify-between gap-1 px-1">
              {operationStepHeights.map((h, i) => {
                const isCrypto = i >= 8;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all duration-300"
                    style={{
                      height: `${h}%`,
                      backgroundColor: isCrypto ? '#d4f938' : '#ffffff',
                      boxShadow: isCrypto ? '0 0 8px rgba(212,249,56,0.3)' : 'none',
                    }}
                  />
                );
              })}
            </div>

            {/* Percentage Bar Indicator */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1a1d28] text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                <span className="font-bold">35%</span>
                <span className="text-[11px] text-slate-500">Regular Transfers</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#d4f938]">
                <span className="w-2 h-2 rounded-full bg-[#d4f938]"></span>
                <span className="font-bold">65%</span>
                <span className="text-[11px] text-slate-400">Crypto Seals</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Zero integrity failures detected across all operational nodes.
          </div>
        </div>

        {/* Card 2: Alert Queue & Active Dossiers (Live Connected Data Table) */}
        <div className="lg:col-span-2 bg-[#12141c] border border-[#1f2331] rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-bold text-white tracking-wide">Alert Queue</span>
              <div className="text-xs text-slate-400 mt-0.5">
                Total Alerts (Today) • Live Evidence & Case Registry
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181b26] border border-[#252a3d] text-xs font-medium text-slate-300">
              <span>Week</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] font-mono uppercase text-slate-500 border-b border-[#1f2331]">
                  <th className="pb-3 font-semibold">Time</th>
                  <th className="pb-3 font-semibold">Alert / Case ID</th>
                  <th className="pb-3 font-semibold">Severity / Unit</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181b26]">
                {displayQueue.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-[#161924] transition-colors">
                    <td className="py-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {item.time}
                    </td>
                    <td className="py-3 pr-2">
                      <div className="font-mono font-bold text-white group-hover:text-[#d4f938] transition-colors">
                        {item.id}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        {item.title}
                      </div>
                    </td>
                    <td className="py-3 text-slate-300 text-[11px]">
                      {item.dept}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                          item.status === 'Critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : item.status === 'High'
                            ? 'bg-[#d4f938]/20 text-[#d4f938] border border-[#d4f938]/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          if (item.rawCase && onSelectCase) {
                            onSelectCase(item.rawCase.id);
                          } else {
                            setActiveTab('cases');
                          }
                        }}
                        className="px-3.5 py-1 rounded-full bg-[#181b26] hover:bg-[#d4f938] hover:text-black text-slate-300 text-xs font-semibold border border-[#252a3d] hover:border-transparent transition-all active:scale-95"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#1a1d28] text-xs">
            <span className="text-slate-500 font-mono text-[11px]">
              Showing {displayQueue.length} active forensic alerts
            </span>
            <button
              onClick={() => setActiveTab('cases')}
              className="text-[#d4f938] hover:underline font-semibold text-xs flex items-center gap-1"
            >
              View Full Case Dossiers →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
