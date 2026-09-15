import React from 'react';
import { BarChart3, TrendingUp, ShieldCheck, CheckCircle2, FileText, Briefcase } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Bold Main Topic */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border-2 border-cyan-500/30 shadow-xl shadow-cyan-950/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            TOPIC: SYSTEM METRICS & LEDGER AUDIT
          </span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-[10px] font-mono text-cyan-400 font-bold">REAL-TIME TELEMETRY</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-emerald-300 to-indigo-300">
            FORENSIC INTEGRITY ANALYTICS & AUDIT METRICS
          </span>
        </h2>
        <p className="text-xs text-slate-300 font-medium mt-1">
          Cryptographic verification health, ledger continuity telemetry, and procedural chain-of-custody progression.
        </p>
      </div>

      {/* 4 DISTINCT ARCHITECTURAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: CRYPTO INTEGRITY - Emerald Vault Archetype */}
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
              TOPIC: SHA-256 INTEGRITY
            </span>
            <h3 className="text-xs font-black text-emerald-300 uppercase tracking-wider">
              CRYPTOGRAPHIC FIDELITY
            </h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white drop-shadow">100.0%</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zero Tamper
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-emerald-900/40 text-[10px] font-mono text-emerald-400/80 font-semibold">
            All Hashes Matched to Genesis Root
          </div>
        </div>

        {/* Card 2: HASH CONTINUITY - Electric Cyan Merkle Archetype */}
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
              TOPIC: BLOCKCHAIN MERKLE
            </span>
            <h3 className="text-xs font-black text-cyan-300 uppercase tracking-wider">
              AUDIT HASH CONTINUITY
            </h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white drop-shadow">100.0%</span>
              <span className="text-xs text-cyan-400 font-mono font-bold">
                Chained Link
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-cyan-900/40 text-[10px] font-mono text-cyan-400/80 font-semibold">
            Genesis to Head Zero Breakage
          </div>
        </div>

        {/* Card 3: VERSION PRESERVATION - Neon Purple Layer Stack Archetype */}
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
              TOPIC: FORENSIC ARCHIVE
            </span>
            <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider">
              HISTORICAL SNAPSHOTS
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

        {/* Card 4: JUDICIAL VIOLATIONS - Sovereign Amber / Gold Armor Archetype */}
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
              TOPIC: RULE ENFORCEMENT
            </span>
            <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider">
              JUDICIAL DEFENSE SHIELD
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Case Progression Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            Case Distribution by Workflow Stage
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Under Laboratory Examination</span>
                <span className="font-mono font-bold text-cyan-400">50%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full w-1/2"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Forensic Report Filed</span>
                <span className="font-mono font-bold text-blue-400">50%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-1/2"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Court Docket Presentation</span>
                <span className="font-mono font-bold text-emerald-400">0%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-0"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Types */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Cryptographically Hashed Evidence Types
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Digital Media & Storage Devices</span>
                <span className="font-mono font-bold text-cyan-400">50%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full w-1/2"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Hardware Security Keys & Tokens</span>
                <span className="font-mono font-bold text-indigo-400">50%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-1/2"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Ballistics & Spent Casings</span>
                <span className="font-mono font-bold text-slate-400">0%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-slate-600 rounded-full w-0"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
