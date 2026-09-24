import React, { useState } from 'react';
import officerAbhirajPhoto from '../assets/officer_abhiraj.jpg';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Briefcase,
  Layers,
  Clock,
  Download,
  Calendar,
  Sparkles,
  Zap,
  Target,
  Award,
  Activity,
  Users,
  Shield,
  Fingerprint,
} from 'lucide-react';

const OFFICER_PERFORMANCE = [
  {
    name: 'Dr. Abhiraj Singh',
    badgeId: 'FEX-1024',
    role: 'Chief Forensic Scientist',
    photo: officerAbhirajPhoto,
    casesHandled: 18,
    reportsSigned: 24,
    custodyIntegrityRate: '100.0%',
    avgTurnaroundDays: 2.9,
    status: 'ACTIVE_LEAD',
  },
  {
    name: 'Inspector Rajiv Mehra',
    badgeId: 'DEL-992',
    role: 'Crime Branch Team Lead',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    casesHandled: 12,
    reportsSigned: 0,
    custodyIntegrityRate: '100.0%',
    avgTurnaroundDays: 1.8,
    status: 'FIELD_OPERATIONS',
  },
  {
    name: 'Dr. Neha Deshmukh',
    badgeId: 'MED-409',
    role: 'Senior Forensic Pathologist',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    casesHandled: 9,
    reportsSigned: 12,
    custodyIntegrityRate: '100.0%',
    avgTurnaroundDays: 3.4,
    status: 'IN_AUTOPSY',
  },
  {
    name: 'Sub-Inspector K. Verma',
    badgeId: 'POL-782',
    role: 'Cyber Crime Inquest Officer',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    casesHandled: 14,
    reportsSigned: 8,
    custodyIntegrityRate: '100.0%',
    avgTurnaroundDays: 2.1,
    status: 'CYBER_LAB',
  },
  {
    name: 'P. Shinde',
    badgeId: 'VAULT-042',
    role: 'Central Vault Master Custodian',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    casesHandled: 128,
    reportsSigned: 0,
    custodyIntegrityRate: '100.0%',
    avgTurnaroundDays: 0.5,
    status: 'VAULT_DUTY',
  },
];

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | 'ALL'>('30D');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportAnalyticsReport = () => {
    const reportData = `================================================================================
FORIS PLATFORM - EXECUTIVE FORENSIC INTEGRITY & ANALYTICS REPORT
Generated: ${new Date().toISOString()}
Standard: Section 39 & Section 63, Bharatiya Sakshya Adhiniyam (BSA), 2023
Time Horizon: ${timeRange}
================================================================================

1. CRYPTOGRAPHIC SUMMARY:
- Cryptographic Fidelity: 100.0% (Zero Tamper Detected)
- Chained Audit Blocks Validated: 1,113 Blocks
- Genesis Root Parity: Matched to Root Genesis Block
- Judicial Privilege Violations Blocked: 100% Intercept Rate (Zero Mutations Permitted)

2. FORENSIC EVIDENCE BREAKDOWN:
- Ballistics & Firearms: 34% (164 exhibits)
- Cyber & Digital Storage Media: 28% (135 exhibits)
- Toxicology & Chemical Viscera: 18% (87 exhibits)
- Questioned Documents & Forgery: 12% (58 exhibits)
- DNA & Biological Serology: 8% (38 exhibits)
Total Evidence Artifacts Under Custody: 482

3. CASE INQUEST LIFECYCLE:
- Active Laboratory Examination: 46%
- Medico-Legal & Autopsy Inquest: 18%
- Versioned Report Signed (V1/V2): 16%
- Police FIR Registered: 14%
- Judicial Court Admitted: 6%

4. FORENSIC LEADERSHIP:
- Chief Forensic Scientist: Dr. Abhiraj Singh (FEX-1024)
  18 Inquests Led | 24 Reports Signed | 100% Hash Continuity
================================================================================
END OF EXECUTIVE REPORT`;

    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FORIS_EXECUTIVE_ANALYTICS_${timeRange}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setExportNotice('✓ Executive Forensic Analytics Briefing Report successfully exported.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header with Bold Main Topic */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border-2 border-cyan-500/30 shadow-xl shadow-cyan-950/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              TELEMETRY & AUDIT METRICS
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">REAL-TIME FORENSIC TELEMETRY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-emerald-300 to-indigo-300">
              Forensic Integrity Analytics & Audit Metrics
            </span>
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Cryptographic verification health, ledger continuity telemetry, and procedural chain-of-custody progression.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Time Horizon Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['7D', '30D', '90D', 'ALL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                  timeRange === r
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === 'ALL' ? 'All Time' : r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportAnalyticsReport}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/40 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Analytics Report</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 p-3.5 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 4 DISTINCT ARCHITECTURAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: CRYPTO INTEGRITY */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-lg shadow-emerald-950/30 relative overflow-hidden flex flex-col justify-between group hover:border-emerald-400 transition-all">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
              <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                // METRIC 01
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                PERFECT
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mt-2">
              SHA-256 INTEGRITY
            </span>
            <h3 className="text-xs font-black text-emerald-300 uppercase tracking-wider">
              Cryptographic Fidelity
            </h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white drop-shadow">100.0%</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zero Tamper
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-emerald-900/40 text-[10px] font-mono text-emerald-400/80 font-semibold">
            All 482 Artifacts Parity Verified
          </div>
        </div>

        {/* Card 2: HASH CONTINUITY */}
        <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-2xl p-5 shadow-lg shadow-cyan-950/30 relative overflow-hidden flex flex-col justify-between group hover:border-cyan-400 transition-all">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-cyan-900/40">
              <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                // METRIC 02
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                CONTINUOUS
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mt-2">
              BLOCKCHAIN MERKLE
            </span>
            <h3 className="text-xs font-black text-cyan-300 uppercase tracking-wider">
              Audit Hash Continuity
            </h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white drop-shadow">1,113</span>
              <span className="text-xs text-cyan-400 font-mono font-bold">
                Chained Blocks
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-cyan-900/40 text-[10px] font-mono text-cyan-400/80 font-semibold">
            Genesis to Head Zero Breakage
          </div>
        </div>

        {/* Card 3: VERSION PRESERVATION */}
        <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-2 border-purple-500/40 rounded-2xl p-5 shadow-lg shadow-purple-950/30 relative overflow-hidden flex flex-col justify-between group hover:border-purple-400 transition-all">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-purple-900/40">
              <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                // METRIC 03
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                IMMUTABLE
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mt-2">
              FORENSIC ARCHIVE
            </span>
            <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider">
              Historical Snapshots
            </h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white drop-shadow">100%</span>
              <span className="text-xs text-purple-300 font-mono font-bold">
                Zero Overwrite
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-purple-900/40 text-[10px] font-mono text-purple-400/80 font-semibold">
            Append-Only Differential Archive
          </div>
        </div>

        {/* Card 4: JUDICIAL VIOLATIONS */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl p-5 shadow-lg shadow-amber-950/30 relative overflow-hidden flex flex-col justify-between group hover:border-amber-400 transition-all">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-amber-900/40">
              <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                // METRIC 04
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                ZERO COMPROMISE
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mt-2">
              RULE ENFORCEMENT
            </span>
            <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider">
              Judicial Defense Shield
            </h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-amber-300 drop-shadow">0</span>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                Blocked at Core
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-amber-900/40 text-[10px] font-mono text-amber-400/80 font-semibold">
            Server Intercepted HTTP 403 Guards
          </div>
        </div>
      </div>

      {/* Analytics Visual Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Progression Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              Case Distribution by Procedural Stage
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 font-bold">Total: 42 Cases</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-sans">
                <span className="font-medium">Active Laboratory Examination (SFSL)</span>
                <span className="font-mono font-bold text-cyan-400">46% (19)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full w-[46%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-sans">
                <span className="font-medium">Medico-Legal Autopsy / Toxicological Analysis</span>
                <span className="font-mono font-bold text-purple-400">18% (8)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full w-[18%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-sans">
                <span className="font-medium">Versioned Forensic Report Signed (V1/V2)</span>
                <span className="font-mono font-bold text-blue-400">16% (7)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full w-[16%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-sans">
                <span className="font-medium">Police FIR Seizure & Inquest Intake</span>
                <span className="font-mono font-bold text-amber-400">14% (6)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full w-[14%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-sans">
                <span className="font-medium">Court Docket Admitted (Section 39 BSA)</span>
                <span className="font-mono font-bold text-emerald-400">6% (2)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full w-[6%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Types Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Evidence Exhibits by Forensic Discipline
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">Total: 482 Exhibits</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-sans">
                <span className="font-medium">Ballistics & Firearms (Glock, Spent Cartridges)</span>
                <span className="font-mono font-bold text-cyan-400">34% (164)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full w-[34%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-sans">
                <span className="font-medium">Cyber & Digital Storage Devices (SSD, NVMe)</span>
                <span className="font-mono font-bold text-indigo-400">28% (135)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-[28%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-sans">
                <span className="font-medium">Toxicology, Viscera & Narcotics</span>
                <span className="font-mono font-bold text-purple-400">18% (87)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full w-[18%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-sans">
                <span className="font-medium">Questioned Documents, Forgery & Ink Analysis</span>
                <span className="font-mono font-bold text-amber-400">12% (58)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[12%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-sans">
                <span className="font-medium">DNA, Blood Spatter & Serology</span>
                <span className="font-mono font-bold text-rose-400">8% (38)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full w-[8%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Officer Workload & Forensic Performance Roster (With Photos) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Forensic Personnel Workload & Cryptographic Velocity
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Individual investigator throughput, custody audit integrity rate, and average analytical turnaround time (TAT).
            </p>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
            100% CUSTODY COMPLIANCE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2">
          {OFFICER_PERFORMANCE.map((officer) => (
            <div
              key={officer.badgeId}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-cyan-500/40 transition-all shadow-md group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={officer.photo}
                  alt={officer.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-cyan-500/40 shadow-sm group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-xs truncate group-hover:text-cyan-300 transition-colors">
                    {officer.name}
                  </h4>
                  <p className="text-[10px] text-cyan-400 font-mono">{officer.badgeId}</p>
                  <p className="text-[10px] text-slate-400 truncate">{officer.role}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400 font-sans">Active Inquests:</span>
                  <span className="font-bold text-white">{officer.casesHandled}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400 font-sans">Reports Signed:</span>
                  <span className="font-bold text-cyan-300">{officer.reportsSigned}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400 font-sans">Avg Turnaround:</span>
                  <span className="font-bold text-emerald-400">{officer.avgTurnaroundDays}d</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400 font-sans">Custody Integrity:</span>
                  <span className="font-bold text-emerald-400">{officer.custodyIntegrityRate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
