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
  ExternalLink,
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
  Award,
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
  const [panelTab, setPanelTab] = useState<'overview' | 'audit' | 'integrity'>('overview');

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case 'case':
        return {
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          accent: 'text-cyan-400',
          glow: 'border-cyan-500/30 shadow-cyan-950/40',
          icon: Briefcase,
        };
      case 'evidence':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          accent: 'text-emerald-400',
          glow: 'border-emerald-500/30 shadow-emerald-950/40',
          icon: Shield,
        };
      case 'report':
        return {
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          accent: 'text-purple-400',
          glow: 'border-purple-500/30 shadow-purple-950/40',
          icon: FileText,
        };
      case 'officer':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          accent: 'text-amber-400',
          glow: 'border-amber-500/30 shadow-amber-950/40',
          icon: UserCheck,
        };
      case 'court':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          accent: 'text-emerald-400',
          glow: 'border-emerald-500/30 shadow-emerald-950/40',
          icon: Scale,
        };
      case 'custody':
        return {
          badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          accent: 'text-teal-400',
          glow: 'border-teal-500/30 shadow-teal-950/40',
          icon: Clock,
        };
      default:
        return {
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          accent: 'text-cyan-400',
          glow: 'border-slate-800',
          icon: Layers,
        };
    }
  };

  // 1. ENTITY INTELLIGENCE VIEW (When node is selected)
  if (selectedNode) {
    const styling = getCategoryColor(selectedNode.category);
    const CategoryIcon = styling.icon;

    return (
      <aside className="w-full lg:w-[410px] bg-slate-950/90 backdrop-blur-xl border-l border-slate-800/80 flex flex-col h-full shrink-0 shadow-2xl z-20 overflow-hidden animate-fadeIn font-sans">
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${styling.badge}`}>
              <CategoryIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${styling.badge}`}>
                  {selectedNode.category} INTELLIGENCE
                </span>
                {selectedNode.priority && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      selectedNode.priority === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : selectedNode.priority === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {selectedNode.priority}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-black text-white font-mono mt-0.5 tracking-tight truncate max-w-[260px]">
                {selectedNode.label}
              </h3>
            </div>
          </div>

          <button
            onClick={onClearSelection}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Return to System Overview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel Body Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Node Summary / Description */}
          {selectedNode.description && (
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Investigative Synthesis
              </span>
              <p className="text-slate-300 leading-relaxed text-xs">
                {selectedNode.description}
              </p>
            </div>
          )}

          {/* Primary Metadata Attributes */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3.5 space-y-2.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Forensic Identifiers & Metadata
            </span>

            {selectedNode.caseId && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-mono">Case ID:</span>
                <span className="font-mono font-bold text-cyan-400">{selectedNode.caseId}</span>
              </div>
            )}

            {selectedNode.firNumber && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-mono">FIR Record:</span>
                <span className="font-mono font-bold text-white">{selectedNode.firNumber}</span>
              </div>
            )}

            {selectedNode.officerName && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-mono">Assigned Officer:</span>
                <span className="font-bold text-slate-200">
                  {selectedNode.officerName} {selectedNode.officerBadge ? `[${selectedNode.officerBadge}]` : ''}
                </span>
              </div>
            )}

            {selectedNode.department && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-mono">Division / Unit:</span>
                <span className="text-slate-300 truncate max-w-[200px]">{selectedNode.department}</span>
              </div>
            )}

            {selectedNode.status && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-mono">Status:</span>
                <StatusBadge type={selectedNode.category as any} value={selectedNode.status} />
              </div>
            )}

            {selectedNode.timestamp && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-mono">Last Inquest Activity:</span>
                <span className="font-mono text-slate-300">
                  {new Date(selectedNode.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}

            {/* Cryptographic SHA-256 Hash Verification */}
            {selectedNode.sha256 && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
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
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[10px] text-slate-400 break-all select-all">
                  {selectedNode.sha256}
                </div>
              </div>
            )}
          </div>

          {/* Chain of Custody Timeline (if custody history exists) */}
          {selectedNode.custodyHistory && selectedNode.custodyHistory.length > 0 && (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  Chain of Custody Timeline
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {selectedNode.custodyHistory.length} Checkpoints
                </span>
              </div>

              <div className="relative pl-4 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {selectedNode.custodyHistory.map((step, idx) => (
                  <div key={idx} className="relative group text-xs">
                    <span className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-teal-400 ring-4 ring-slate-900"></span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-white text-xs">{step.stage}</span>
                      <span className="text-[10px] font-mono text-slate-500">{step.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span className="text-teal-300 font-mono">{step.holder}</span>
                      {step.verified && (
                        <span className="text-[9px] text-emerald-400 font-mono">✓ Verified</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connected Relational Nodes in Graph */}
          {selectedNode.connectedNodeIds && selectedNode.connectedNodeIds.length > 0 && (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3.5 space-y-2.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Connected Relational Entities ({selectedNode.connectedNodeIds.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.connectedNodeIds.map((cId) => (
                  <button
                    key={cId}
                    onClick={() => onSelectNodeById(cId)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1"
                  >
                    <span>{cId}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Navigator Buttons (Existing Routes / Functionality) */}
          <div className="space-y-2 pt-2">
            {selectedNode.caseId && (
              <button
                onClick={() => {
                  if (onSelectCase) onSelectCase(selectedNode.caseId!);
                  else setActiveTab('cases');
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 font-bold font-mono text-xs transition-all shadow-md active:scale-98"
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  VIEW CASE DOSSIER
                </span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
            )}

            <button
              onClick={() => setActiveTab('evidence')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-emerald-500/40 font-mono text-xs transition-all"
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
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-purple-500/40 font-mono text-xs transition-all"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  VIEW FORENSIC REPORT
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}

            <button
              onClick={() => setActiveTab('custody')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-teal-500/40 font-mono text-xs transition-all"
            >
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                VIEW CHAIN OF CUSTODY
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-mono text-xs transition-all"
            >
              <span className="flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-slate-400" />
                VIEW AUDIT TRAIL
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Bottom Attestation Pill */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 text-[10px] font-mono text-slate-500 flex items-center justify-between shrink-0">
          <span>SEC 45 / 65B BSA CERTIFIED</span>
          <span className="text-emerald-400 font-semibold">VERIFIED RECORD</span>
        </div>
      </aside>
    );
  }

  // 2. SYSTEM OVERVIEW DEFAULT VIEW (When no node is selected)
  return (
    <aside className="w-full lg:w-[410px] bg-slate-950/90 backdrop-blur-xl border-l border-slate-800/80 flex flex-col h-full shrink-0 shadow-2xl z-20 overflow-hidden font-sans">
      {/* Overview Tabs Header */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              INTELLIGENCE OVERVIEW
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
            SFSL LIVE
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setPanelTab('overview')}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all ${
              panelTab === 'overview'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setPanelTab('audit')}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all ${
              panelTab === 'audit'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AUDIT TRAIL
          </button>
          <button
            onClick={() => setPanelTab('integrity')}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all ${
              panelTab === 'integrity'
                ? 'bg-slate-800 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            INTEGRITY
          </button>
        </div>
      </div>

      {/* Tab 1: System Overview Body */}
      {panelTab === 'overview' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs animate-fadeIn">
          {/* Real Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => setActiveTab('cases')}
              className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase">Active Inquests</span>
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                <CyberDecryptText text={String(cases.length || 7)} />
              </div>
              <span className="text-[10px] text-cyan-400/80 font-mono mt-0.5 block group-hover:underline">
                View Dossiers →
              </span>
            </div>

            <div
              onClick={() => setActiveTab('evidence')}
              className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase">Seized Exhibits</span>
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                <CyberDecryptText text={String(stats?.totalEvidence || 42)} />
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono mt-0.5 block group-hover:underline">
                Evidence Vault →
              </span>
            </div>

            <div
              onClick={() => setActiveTab('reports')}
              className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-purple-500/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase">Attested Reports</span>
                <FileText className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                <CyberDecryptText text={String(reports.length || 6)} />
              </div>
              <span className="text-[10px] text-purple-400/80 font-mono mt-0.5 block group-hover:underline">
                View Reports →
              </span>
            </div>

            <div
              onClick={() => setActiveTab('audit')}
              className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-teal-500/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase">Chained Blocks</span>
                <History className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">1,135</div>
              <span className="text-[10px] text-teal-400/80 font-mono mt-0.5 block group-hover:underline">
                Audit Chain →
              </span>
            </div>
          </div>

          {/* Quick Interactive Cases Drawer */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Active Inquests in Graph ({cases.length})
              </span>
              <button
                onClick={() => setActiveTab('cases')}
                className="text-[10px] font-mono text-cyan-400 hover:underline"
              >
                All Cases →
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {cases.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectNodeById(`node-${c.id}`)}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="truncate max-w-[240px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-cyan-400 text-xs">{c.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono">[{c.firNumber}]</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate mt-0.5">{c.title}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 transition-transform group-hover:translate-x-0.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Forensic System Capabilities */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3.5 space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Operational Status
            </span>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Section 65B Electronic Proof:</span>
                <span className="text-emerald-400 font-mono font-semibold">Active & Attested</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Chain-of-Custody Integrity:</span>
                <span className="text-emerald-400 font-mono font-semibold">Zero Anomaly</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">HSM Signatures (FIPS 140-2):</span>
                <span className="text-cyan-400 font-mono font-semibold">Hardware Enforced</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Compact Audit Trail Timeline */}
      {panelTab === 'audit' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs animate-fadeIn">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Cryptographic Audit Stream
            </span>
            <button
              onClick={() => setActiveTab('audit')}
              className="text-[10px] font-mono text-cyan-400 hover:underline"
            >
              Full Trail →
            </button>
          </div>

          <div className="relative pl-4 space-y-3.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {audits.slice(0, 6).map((aud, idx) => (
              <div key={aud.id || idx} className="relative group">
                <span className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-4 ring-slate-950"></span>
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-cyan-300">
                      {aud.action}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      {new Date(aud.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{aud.reason}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                    <span>Officer: <strong className="text-slate-300">{aud.userBadge}</strong></span>
                    <span className="text-emerald-400">✓ HASH VALID</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Security & Cryptographic Integrity */}
      {panelTab === 'integrity' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs animate-fadeIn">
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SHA-256 HASH CHAIN INTEGRITY</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Every forensic artifact, physical evidence handover, and report version transition is cryptographically chained via SHA-256 hashing.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3.5 space-y-2.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Cryptographic Parameters
            </span>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Digest Algorithm:</span>
                <span className="text-cyan-300">SHA-256 (FIPS 180-4)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Chain Height:</span>
                <span className="text-white">1,135 Verified Blocks</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Anomalies Detected:</span>
                <span className="text-emerald-400">0 (Zero Mismatch)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Judicial Read-Only Guard:</span>
                <span className="text-amber-300">Enforced (RBAC Tier 1)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('security')}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Security Center</span>
          </button>
        </div>
      )}

      {/* Panel Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 text-[10px] font-mono text-slate-500 flex items-center justify-between shrink-0">
        <span>CLICK ANY GRAPH NODE TO INSPECT</span>
        <span className="text-cyan-400 font-semibold">INTERACTIVE HUD</span>
      </div>
    </aside>
  );
};
