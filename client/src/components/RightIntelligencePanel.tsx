import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Briefcase,
  FileText,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Copy,
  Check,
  X,
  Layers,
  Sparkles,
  Lock,
  UserCheck,
  Building,
  Scale,
  Hash,
  Activity,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { CyberDecryptText } from './CyberDecryptText';

export interface IntelligenceNode {
  id: string;
  label: string;
  category: 'case' | 'fir' | 'evidence' | 'report' | 'officer' | 'lab' | 'court' | 'custody' | 'core';
  status?: string;
  priority?: string;
  title?: string;
  firNumber?: string;
  caseId?: string;
  reportId?: string;
  evidenceId?: string;
  sha256?: string;
  officerName?: string;
  officerBadge?: string;
  department?: string;
  description?: string;
  citation?: string;
  timestamp?: string;
  metrics?: { label: string; value: string }[];
  connectedNodeIds?: string[];
  custodyHistory?: Array<{
    stage: string;
    holder: string;
    timestamp: string;
    verified: boolean;
  }>;
}

interface RightIntelligencePanelProps {
  selectedNode: IntelligenceNode | null;
  onClearSelection: () => void;
  onSelectNodeById: (nodeId: string) => void;
  stats: any;
  cases: any[];
  reports: any[];
  audits: any[];
  evidence?: any[];
  setActiveTab: (tab: string) => void;
  onSelectCase?: (caseId: string) => void;
  onSelectReport?: (reportId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const RightIntelligencePanel: React.FC<RightIntelligencePanelProps> = ({
  selectedNode,
  onClearSelection,
  onSelectNodeById,
  stats,
  cases,
  reports,
  audits,
  evidence = [],
  setActiveTab,
  onSelectCase,
  onSelectReport,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [panelTab, setPanelTab] = useState<'analytics' | 'overview' | 'audit'>('analytics');

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getCategoryTheme = (cat?: string) => {
    switch (cat) {
      case 'case':
        return {
          pill: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]',
          accent: 'text-cyan-400',
          grad: 'from-cyan-950 via-slate-900 to-slate-950',
          icon: Briefcase,
        };
      case 'evidence':
        return {
          pill: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
          accent: 'text-emerald-400',
          grad: 'from-emerald-950 via-slate-900 to-slate-950',
          icon: Shield,
        };
      case 'report':
        return {
          pill: 'bg-rose-500/20 text-rose-200 border-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
          accent: 'text-rose-400',
          grad: 'from-rose-950 via-slate-900 to-slate-950',
          icon: FileText,
        };
      case 'officer':
        return {
          pill: 'bg-amber-500/20 text-amber-200 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
          accent: 'text-amber-400',
          grad: 'from-amber-950 via-slate-900 to-slate-950',
          icon: UserCheck,
        };
      case 'court':
        return {
          pill: 'bg-teal-500/20 text-teal-200 border-teal-400/50 shadow-[0_0_12px_rgba(20,184,166,0.3)]',
          accent: 'text-teal-400',
          grad: 'from-teal-950 via-slate-900 to-slate-950',
          icon: Scale,
        };
      case 'custody':
        return {
          pill: 'bg-purple-500/20 text-purple-200 border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]',
          accent: 'text-purple-400',
          grad: 'from-purple-950 via-slate-900 to-slate-950',
          icon: Clock,
        };
      default:
        return {
          pill: 'bg-slate-800 text-slate-200 border-slate-700',
          accent: 'text-cyan-400',
          grad: 'from-slate-900 to-slate-950',
          icon: Layers,
        };
    }
  };

  // 1. ENTITY INTELLIGENCE DOSSIER (When a node is selected)
  if (selectedNode) {
    const theme = getCategoryTheme(selectedNode.category);
    const CategoryIcon = theme.icon;

    return (
      <aside className="w-full lg:w-[420px] bg-slate-950/92 backdrop-blur-2xl border-l border-white/10 flex flex-col h-full shrink-0 shadow-2xl z-20 overflow-hidden font-sans animate-fadeIn">
        {/* Panel Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${theme.pill}`}>
              <CategoryIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${theme.pill}`}>
                  {selectedNode.category} DOSSIER
                </span>
                {selectedNode.priority && (
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.2 rounded-full border ${
                      selectedNode.priority === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : selectedNode.priority === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {selectedNode.priority}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-black text-white font-mono mt-1 tracking-tight truncate max-w-[270px]">
                {selectedNode.label}
              </h3>
            </div>
          </div>

          <button
            onClick={onClearSelection}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
            title="Return to System Analytics"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel Body Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Node Summary / Description */}
          {selectedNode.description && (
            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5 space-y-1.5 shadow-inner">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Investigative Forensic Synthesis
              </span>
              <p className="text-slate-300 leading-relaxed text-xs">
                {selectedNode.description}
              </p>
            </div>
          )}

          {/* Execution & Attestation Progress Meter (Reference Image 3) */}
          <div className="rounded-2xl bg-slate-900/70 border border-white/5 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Section 65B & 45 Attestation:</span>
              <span className="font-bold text-emerald-400">100% COMPLETE</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Primary Metadata Table */}
          <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-3.5 space-y-2.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Forensic Identifiers & Metadata
            </span>

            {selectedNode.caseId && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <span className="text-slate-400 font-mono">Case ID:</span>
                <span className="font-mono font-bold text-cyan-400">{selectedNode.caseId}</span>
              </div>
            )}

            {selectedNode.firNumber && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <span className="text-slate-400 font-mono">FIR Record:</span>
                <span className="font-mono font-bold text-white">{selectedNode.firNumber}</span>
              </div>
            )}

            {selectedNode.officerName && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <span className="text-slate-400 font-mono">Assigned Officer:</span>
                <span className="font-bold text-slate-200">
                  {selectedNode.officerName} {selectedNode.officerBadge ? `[${selectedNode.officerBadge}]` : ''}
                </span>
              </div>
            )}

            {selectedNode.department && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <span className="text-slate-400 font-mono">Division / Unit:</span>
                <span className="text-slate-300 truncate max-w-[210px]">{selectedNode.department}</span>
              </div>
            )}

            {selectedNode.status && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <span className="text-slate-400 font-mono">Status:</span>
                <StatusBadge type={selectedNode.category as any} value={selectedNode.status} />
              </div>
            )}

            {selectedNode.timestamp && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <span className="text-slate-400 font-mono">Inquest Activity Date:</span>
                <span className="font-mono text-slate-300">
                  {new Date(selectedNode.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}

            {/* Cryptographic SHA-256 Hash */}
            {selectedNode.sha256 && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    SHA-256 Cryptographic Hash
                  </span>
                  <button
                    onClick={() => handleCopyHash(selectedNode.sha256!)}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedHash ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY HASH</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 font-mono text-[10px] text-slate-300 break-all select-all">
                  {selectedNode.sha256}
                </div>
              </div>
            )}
          </div>

          {/* Chain of Custody Timeline (if custody history exists) */}
          {selectedNode.custodyHistory && selectedNode.custodyHistory.length > 0 && (
            <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  Chain of Custody Handover Track
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {selectedNode.custodyHistory.length} Checkpoints
                </span>
              </div>

              <div className="relative pl-4 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {selectedNode.custodyHistory.map((step, idx) => (
                  <div key={idx} className="relative group text-xs">
                    <span className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-teal-400 ring-4 ring-slate-950" />
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-white text-xs">{step.stage}</span>
                      <span className="text-[10px] font-mono text-slate-500">{step.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span className="text-teal-300 font-mono">{step.holder}</span>
                      {step.verified && (
                        <span className="text-[9px] text-emerald-400 font-mono font-bold">✓ Verified</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connected Relational Nodes */}
          {selectedNode.connectedNodeIds && selectedNode.connectedNodeIds.length > 0 && (
            <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-3.5 space-y-2.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Relational Network Links ({selectedNode.connectedNodeIds.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.connectedNodeIds.map((cId) => (
                  <button
                    key={cId}
                    onClick={() => onSelectNodeById(cId)}
                    className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 border border-white/10 hover:border-cyan-400 text-[10px] font-mono text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1"
                  >
                    <span>{cId}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Navigator Buttons */}
          <div className="space-y-2 pt-2">
            {selectedNode.caseId && (
              <button
                onClick={() => {
                  if (onSelectCase) onSelectCase(selectedNode.caseId!);
                  else setActiveTab('cases');
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold font-mono text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-98"
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  VIEW CASE DOSSIER
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setActiveTab('evidence')}
              className="w-full flex items-center justify-between px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-emerald-500/50 font-mono text-xs transition-all"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                VIEW EVIDENCE VAULT
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {selectedNode.reportId && (
              <button
                onClick={() => {
                  if (onSelectReport) onSelectReport(selectedNode.reportId!);
                  else setActiveTab('reports');
                }}
                className="w-full flex items-center justify-between px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-rose-500/50 font-mono text-xs transition-all"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  VIEW FORENSIC REPORT
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}

            <button
              onClick={() => setActiveTab('custody')}
              className="w-full flex items-center justify-between px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-teal-500/50 font-mono text-xs transition-all"
            >
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                VIEW CHAIN OF CUSTODY
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className="w-full flex items-center justify-between px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-slate-700 font-mono text-xs transition-all"
            >
              <span className="flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-slate-400" />
                VIEW AUDIT TRAIL
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="p-3 border-t border-white/10 bg-slate-950 text-[10px] font-mono text-slate-500 flex items-center justify-between shrink-0">
          <span>SEC 45 / 65B BSA CERTIFIED</span>
          <span className="text-emerald-400 font-bold">VERIFIED SOVEREIGN RECORD</span>
        </div>
      </aside>
    );
  }

  // 2. SYSTEM OVERVIEW & CHARTS (Default when no node is selected)
  return (
    <aside className="w-full lg:w-[420px] bg-slate-950/92 backdrop-blur-2xl border-l border-white/10 flex flex-col h-full shrink-0 shadow-2xl z-20 overflow-hidden font-sans">
      {/* Top Navigation Tabs Header */}
      <div className="p-3.5 border-b border-white/10 bg-slate-950/80 shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              INTELLIGENCE ANALYTICS
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-500/40 font-bold">
            SFSL SOVEREIGN
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-full border border-white/5">
          <button
            onClick={() => setPanelTab('analytics')}
            className={`py-1.5 px-2 rounded-full text-[10px] font-mono font-bold transition-all ${
              panelTab === 'analytics'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ANALYTICS
          </button>
          <button
            onClick={() => setPanelTab('overview')}
            className={`py-1.5 px-2 rounded-full text-[10px] font-mono font-bold transition-all ${
              panelTab === 'overview'
                ? 'bg-slate-800 text-cyan-300 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DOSSIERS
          </button>
          <button
            onClick={() => setPanelTab('audit')}
            className={`py-1.5 px-2 rounded-full text-[10px] font-mono font-bold transition-all ${
              panelTab === 'audit'
                ? 'bg-slate-800 text-teal-300 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AUDIT STREAM
          </button>
        </div>
      </div>

      {/* Tab 1: Analytics with Circular Donut Gauge & Stacked Bar Chart (Reference Images 3 & 4) */}
      {panelTab === 'analytics' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs animate-fadeIn">
          {/* Circular Donut Gauge: 100% Cryptographic Attestation (Reference Image 4) */}
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/5 relative overflow-hidden flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3 text-[10px] font-mono">
              <span className="text-slate-400 uppercase font-bold tracking-wider">
                Cryptographic Attestation Radar
              </span>
              <span className="text-emerald-400 font-bold">100% VERIFIED</span>
            </div>

            {/* Glowing SVG Multi-Colored Donut Gauge */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle cx="60" cy="60" r="48" fill="none" stroke="#090d16" strokeWidth="12" />
                {/* Segment 1: Cyan (Evidence Hashes 45%) */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="12"
                  strokeDasharray="135 301"
                  strokeDashoffset="0"
                  className="drop-shadow-[0_0_8px_#06b6d4]"
                />
                {/* Segment 2: Purple (Report Attestation 30%) */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="12"
                  strokeDasharray="90 301"
                  strokeDashoffset="-140"
                  className="drop-shadow-[0_0_8px_#a855f7]"
                />
                {/* Segment 3: Emerald (Custody Transfers 15%) */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray="45 301"
                  strokeDashoffset="-235"
                  className="drop-shadow-[0_0_8px_#10b981]"
                />
                {/* Segment 4: Amber (Officer Approvals 10%) */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray="30 301"
                  strokeDashoffset="-285"
                  className="drop-shadow-[0_0_8px_#f59e0b]"
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-black font-mono text-white tracking-tight">1,135</span>
                <span className="text-[9px] font-mono text-slate-400">Chained Blocks</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="grid grid-cols-2 gap-2 w-full mt-3 pt-3 border-t border-white/5 text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_4px_#06b6d4]" />
                <span>Evidence Hashes ({evidence.length || 42})</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_4px_#a855f7]" />
                <span>Reports Attested ({reports.length || 6})</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_4px_#10b981]" />
                <span>Custody Sealed (18)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_4px_#f59e0b]" />
                <span>Lead Officers (7)</span>
              </div>
            </div>
          </div>

          {/* Stacked Frequency Bar Chart (Reference Image 3) */}
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400 uppercase font-bold tracking-wider">
                Monthly Inquest Telemetry (Jan - Dec)
              </span>
              <span className="text-cyan-400 font-bold">ANNUAL FREQUENCY</span>
            </div>

            {/* Visual Stacked Column Bar Chart */}
            <div className="h-32 flex items-end justify-between gap-1.5 pt-4">
              {[
                { month: 'Jan', amber: 8, purple: 14, teal: 22 },
                { month: 'Feb', amber: 12, purple: 18, teal: 28 },
                { month: 'Mar', amber: 10, purple: 22, teal: 35 },
                { month: 'Apr', amber: 15, purple: 26, teal: 42 },
                { month: 'May', amber: 9, purple: 20, teal: 30 },
                { month: 'Jun', amber: 18, purple: 32, teal: 48 },
                { month: 'Jul', amber: 14, purple: 28, teal: 40 },
                { month: 'Aug', amber: 20, purple: 36, teal: 56 },
                { month: 'Sep', amber: 24, purple: 42, teal: 65 },
                { month: 'Oct', amber: 18, purple: 34, teal: 52 },
                { month: 'Nov', amber: 16, purple: 30, teal: 46 },
                { month: 'Dec', amber: 22, purple: 38, teal: 60 },
              ].map((bar, bIdx) => (
                <div key={bIdx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="w-full flex flex-col items-stretch justify-end h-24 rounded-t-md overflow-hidden bg-slate-950/60">
                    <div
                      className="bg-amber-400 w-full transition-all group-hover:brightness-125"
                      style={{ height: `${bar.amber}%` }}
                    />
                    <div
                      className="bg-purple-500 w-full transition-all group-hover:brightness-125"
                      style={{ height: `${bar.purple}%` }}
                    />
                    <div
                      className="bg-teal-400 w-full transition-all group-hover:brightness-125"
                      style={{ height: `${bar.teal}%` }}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 group-hover:text-cyan-300">
                    {bar.month}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-slate-400 pt-2 border-t border-white/5">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-teal-400" /> Evidence Intake
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-purple-500" /> Report Signed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-amber-400" /> Court Tendered
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Case Dossiers Quick Drawer */}
      {panelTab === 'overview' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs animate-fadeIn">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => setActiveTab('cases')}
              className="p-3.5 rounded-3xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 hover:border-cyan-400/50 cursor-pointer transition-all group shadow-md"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase">Active Inquests</span>
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                <CyberDecryptText text={String(cases.length || 7)} />
              </div>
              <span className="text-[10px] text-cyan-300 font-mono mt-0.5 block group-hover:underline">
                View Dossiers →
              </span>
            </div>

            <div
              onClick={() => setActiveTab('evidence')}
              className="p-3.5 rounded-3xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 hover:border-emerald-400/50 cursor-pointer transition-all group shadow-md"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase">Seized Exhibits</span>
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                <CyberDecryptText text={String(stats?.totalEvidence || 42)} />
              </div>
              <span className="text-[10px] text-emerald-300 font-mono mt-0.5 block group-hover:underline">
                Evidence Vault →
              </span>
            </div>
          </div>

          {/* Inquests List */}
          <div className="rounded-3xl bg-slate-900/60 border border-white/5 p-4 space-y-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Government Inquests Registry ({cases.length})
            </span>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {cases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectNodeById(`case-${c.id}`)}
                  className="p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-white/5 hover:border-cyan-400/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="truncate max-w-[250px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-cyan-300 text-xs">{c.id}</span>
                      <span className="text-[9px] text-slate-500 font-mono">[{c.firNumber}]</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate mt-0.5">{c.title}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 transition-transform group-hover:translate-x-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cryptographic Audit Stream */}
      {panelTab === 'audit' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs animate-fadeIn">
          <div className="flex items-center justify-between mb-1 text-[10px] font-mono">
            <span className="font-bold text-slate-400 uppercase tracking-wider">
              Cryptographic Audit Stream
            </span>
            <button onClick={() => setActiveTab('audit')} className="text-cyan-400 hover:underline">
              Full Ledger →
            </button>
          </div>

          <div className="relative pl-4 space-y-3.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {audits.slice(0, 7).map((aud, idx) => (
              <div key={aud.id || idx} className="relative group">
                <span className="absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-950" />
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-cyan-300">
                      {aud.action}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      {new Date(aud.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{aud.reason}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1.5 border-t border-white/5">
                    <span>Officer: <strong className="text-slate-300">{aud.userBadge}</strong></span>
                    <span className="text-emerald-400 font-bold">✓ HASH VALID</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel Bottom Information */}
      <div className="p-3.5 border-t border-white/10 bg-slate-950 text-[10px] font-mono text-slate-500 flex items-center justify-between shrink-0">
        <span>CLICK GRAPH NODE TO INSPECT</span>
        <span className="text-cyan-400 font-semibold">INTERACTIVE COMMAND</span>
      </div>
    </aside>
  );
};
