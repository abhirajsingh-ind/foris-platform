import React from 'react';
import { EvidenceTransfer } from '../types';
import { ArrowDown, Shield, CheckCircle2, UserCheck, Calendar, Hash, FileText } from 'lucide-react';

interface ChainOfCustodyProps {
  transfers: EvidenceTransfer[];
  onTransferClick?: () => void;
  canTransfer?: boolean;
}

export const ChainOfCustody: React.FC<ChainOfCustodyProps> = ({
  transfers,
  onTransferClick,
  canTransfer = true,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-wide">Chain of Custody Ledger</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident unbroken custody log. Every transfer requires digital identity acknowledgment.
          </p>
        </div>

        {canTransfer && onTransferClick && (
          <button
            onClick={onTransferClick}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95"
          >
            <UserCheck className="w-4 h-4" />
            Log Custody Transfer
          </button>
        )}
      </div>

      <div className="mt-6 space-y-6 relative before:absolute before:top-4 before:bottom-4 before:left-6 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-blue-500 before:to-emerald-500">
        {transfers.map((t, idx) => (
          <div key={t.id || idx} className="relative flex items-start gap-5 group">
            {/* Step Counter Bubble */}
            <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-xl bg-slate-950 border-2 border-cyan-500/50 shadow-md group-hover:border-cyan-400 transition-colors">
              <span className="font-mono text-sm font-bold text-cyan-400">0{idx + 1}</span>
            </div>

            {/* Transfer Card */}
            <div className="flex-1 bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 transition-all shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold">
                    {t.action}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(t.transferredAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Custody Parties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Released By (From)
                  </span>
                  <span className="font-semibold text-slate-200 text-sm block">{t.fromParty}</span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-cyan-500/20">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-1">
                    Accepted By (To)
                  </span>
                  <span className="font-semibold text-white text-sm block">{t.toParty}</span>
                </div>
              </div>

              {/* Purpose & Notes */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <p>
                  <strong className="text-slate-400 font-medium">Purpose: </strong>
                  {t.purpose}
                </p>
                {t.notes && (
                  <p className="text-slate-400 italic">
                    <strong className="text-slate-500 not-italic font-medium">Notes: </strong>
                    {t.notes}
                  </p>
                )}
              </div>

              {/* Responsible Officer Signature Indicator */}
              {t.responsibleOfficer && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 font-mono">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Authenticated by {t.responsibleOfficer.name} [{t.responsibleOfficer.badgeId}]
                  </span>
                  <span className="text-slate-500">{t.responsibleOfficer.designation}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
