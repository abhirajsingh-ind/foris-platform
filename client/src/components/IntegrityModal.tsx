import React from 'react';
import { X, ShieldCheck, AlertTriangle, KeyRound, Clock, UserCheck, Info } from 'lucide-react';

interface IntegrityModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
  title?: string;
}

export const IntegrityModal: React.FC<IntegrityModalProps> = ({
  isOpen,
  onClose,
  result,
  title = 'Cryptographic Integrity Verification',
}) => {
  if (!isOpen || !result) return null;

  const isMatch = result.verified;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isMatch
              ? 'bg-emerald-950/30 border-emerald-500/20'
              : 'bg-red-950/30 border-red-500/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isMatch
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {isMatch ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">{title}</h2>
              <p className="text-xs text-slate-400">Standard SHA-256 Bitwise Cryptographic Verification</p>
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
              isMatch
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <span className="text-lg font-extrabold tracking-wider block">
              {isMatch ? '✓ INTEGRITY VERIFIED' : '⚠ INTEGRITY MISMATCH DETECTED'}
            </span>
            <p className="text-xs mt-1 text-slate-300">{result.message}</p>
          </div>

          {/* Hashes Comparison */}
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Expected (Stored Cryptographic Seal)
              </span>
              <span className="text-slate-300 break-all select-all font-semibold">
                {result.expectedHash}
              </span>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isMatch
                  ? 'bg-slate-950/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-1">
                Calculated (Live Recalculated Hash)
              </span>
              <span className="break-all select-all font-semibold">
                {result.calculatedHash}
              </span>
            </div>
          </div>

          {/* Metadata Attribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-300">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>
                Verified By: <strong className="text-white">{result.verifiedBy}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                Timestamp: <strong className="text-white">{new Date(result.verifiedAt).toLocaleString()}</strong>
              </span>
            </div>
          </div>

          {/* Non-Negotiable Explainer Rule */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>Security Protocol Notice: </strong>
              Hashing is used for integrity verification, not encryption. SHA-256 produces a deterministic 256-bit fingerprint confirming that not a single bit has been modified since signature.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
