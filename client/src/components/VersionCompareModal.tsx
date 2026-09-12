import React from 'react';
import { X, GitCompare, ArrowRight, ShieldCheck, User, Calendar, FileText, HelpCircle } from 'lucide-react';

interface VersionCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const VersionCompareModal: React.FC<VersionCompareModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen || !data) return null;

  const { fromVersion, toVersion, differences, reportId } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Forensic Report Differential Comparison
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono">
                  {reportId}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Comparing Version {fromVersion.versionNumber} against Version {toVersion.versionNumber} with tamper-evident audit attribution.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amendment Attribution Banner */}
        <div className="bg-amber-950/30 border-y border-amber-500/20 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
              Amendment Reason
            </span>
            <span className="font-medium text-white text-sm">{toVersion.amendmentReason}</span>
          </div>
          {toVersion.amendmentDetails && (
            <div className="text-slate-300 italic">
              &ldquo;{toVersion.amendmentDetails}&rdquo;
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Version Metadata Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From Version (V1) */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <span className="font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                  Baseline: Version {fromVersion.versionNumber}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {new Date(fromVersion.finalizedAt || fromVersion.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Author: {fromVersion.author?.name} [{fromVersion.author?.badgeId}]
                  </span>
                </div>
                <div className="text-slate-400 font-mono text-[11px] truncate">
                  <strong className="text-slate-500">SHA-256: </strong>
                  {fromVersion.sha256Hash}
                </div>
              </div>
            </div>

            {/* To Version (V2) */}
            <div className="bg-slate-950/60 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <span className="font-bold text-cyan-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  Amended: Version {toVersion.versionNumber}
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  {new Date(toVersion.finalizedAt || toVersion.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    Amended By: {toVersion.author?.name} [{toVersion.author?.badgeId}]
                  </span>
                </div>
                <div className="text-cyan-300 font-mono text-[11px] truncate">
                  <strong className="text-cyan-500">SHA-256: </strong>
                  {toVersion.sha256Hash}
                </div>
              </div>
            </div>
          </div>

          {/* Differential Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Field-by-Field Modification Analysis
            </h3>

            {differences.map((diff: any) => (
              <div
                key={diff.field}
                className={`rounded-xl border transition-all ${
                  diff.isDifferent
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'border-slate-800 bg-slate-950/40 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/60 rounded-t-xl">
                  <span className="font-semibold text-xs text-slate-200 flex items-center gap-2">
                    {diff.label}
                    {diff.isDifferent ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                        Modified
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                        Unchanged
                      </span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 p-4 text-xs font-mono leading-relaxed">
                  <div className="p-2 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Version {fromVersion.versionNumber} Content
                    </span>
                    <p className="text-slate-400 whitespace-pre-wrap">{diff.previousValue || '(empty)'}</p>
                  </div>

                  <div className="p-2 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">
                      Version {toVersion.versionNumber} Content
                    </span>
                    <p className={`whitespace-pre-wrap ${diff.isDifferent ? 'text-emerald-300 font-medium' : 'text-slate-400'}`}>
                      {diff.newValue || '(empty)'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Defense-in-depth guarantee: Previous versions are immutable and permanently preserved.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
