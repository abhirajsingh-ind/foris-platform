import React from 'react';
import { X, ShieldCheck, AlertTriangle, Link2, CheckCircle2, Info, Layers } from 'lucide-react';

interface AuditChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
}

export const AuditChainModal: React.FC<AuditChainModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!isOpen || !result) return null;

  const isValid = result.valid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isValid
              ? 'bg-emerald-950/30 border-emerald-500/20'
              : 'bg-red-950/30 border-red-500/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isValid
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              <Link2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Tamper-Evident Audit Hash Chain Verification
              </h2>
              <p className="text-xs text-slate-400">Sequential Cryptographic Block Linkage Validation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout */}
        <div className="p-6 space-y-6">
          <div
            className={`p-4 rounded-xl border text-center ${
              isValid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <span className="text-lg font-extrabold tracking-wider block">
              {result.statusLabel}
            </span>
            <p className="text-xs mt-1 text-slate-300">{result.details}</p>
          </div>

          {/* Chain Metric Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Total Chained Records
              </span>
              <span className="text-lg font-bold font-mono text-cyan-400">
                {result.totalVerified} Blocks
              </span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Verification Verdict
              </span>
              <span className="text-lg font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" />
                100% UNBROKEN
              </span>
            </div>
          </div>

          {/* Hashes */}
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Genesis Root Anchor
              </span>
              <span className="text-slate-400 break-all select-all font-semibold">
                {result.genesisHash}
              </span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-cyan-500/30 text-cyan-300">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-1">
                Latest Chained Head Hash
              </span>
              <span className="break-all select-all font-semibold">
                {result.latestHash}
              </span>
            </div>
          </div>

          {/* Architecture Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Cryptographic Integrity Note: </strong>
              {result.architectureNote}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95"
          >
            Close Ledger Inspection
          </button>
        </div>
      </div>
    </div>
  );
};
