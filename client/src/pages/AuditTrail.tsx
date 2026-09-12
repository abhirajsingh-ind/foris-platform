import React, { useState, useEffect } from 'react';
import { AuditEvent } from '../types';
import { AuditChainModal } from '../components/AuditChainModal';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Link2,
  AlertTriangle,
  Clock,
  User,
  Hash,
  ArrowUpDown,
} from 'lucide-react';

export const AuditTrailPage: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [actionFilter, setActionFilter] = useState('ALL');
  const [badgeFilter, setBadgeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  // Verification modal state
  const [verifyResult, setVerifyResult] = useState<any | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, [page, actionFilter, badgeFilter, severityFilter]);

  const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem('foris_token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
      });
      if (actionFilter !== 'ALL') params.append('action', actionFilter);
      if (badgeFilter) params.append('userBadge', badgeFilter);
      if (severityFilter !== 'ALL') params.append('severity', severityFilter);

      const res = await fetch(`/api/audit?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch('/api/audit/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setVerifyResult(data);
      setIsVerifyModalOpen(true);
      fetchAuditLogs(); // reload logs to show the new AUDIT_CHAIN_VERIFICATION event
    } catch (err) {
      alert('Failed to execute audit chain verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Verification Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Append-Only Cryptographic Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident sequence linked via SHA-256 recursive hash chaining: Hash<sub>i</sub> = SHA256(Record<sub>i</sub> ‖ Hash<sub>i-1</sub>).
          </p>
        </div>

        <button
          onClick={handleVerifyChain}
          disabled={isVerifying}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isVerifying ? 'Validating Chain...' : 'Verify Audit Integrity'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-slate-400 font-semibold">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="CASE_CREATED">CASE_CREATED</option>
            <option value="CASE_VIEWED">CASE_VIEWED</option>
            <option value="EVIDENCE_REGISTERED">EVIDENCE_REGISTERED</option>
            <option value="EVIDENCE_TRANSFERRED">EVIDENCE_TRANSFERRED</option>
            <option value="REPORT_CREATED">REPORT_CREATED</option>
            <option value="REPORT_SIGNED">REPORT_SIGNED</option>
            <option value="REPORT_AMENDED">REPORT_AMENDED</option>
            <option value="INTEGRITY_CHECK">INTEGRITY_CHECK</option>
            <option value="JUDICIAL_WRITE_ATTEMPT_DENIED">JUDICIAL_WRITE_ATTEMPT_DENIED</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-semibold">Badge:</span>
          <input
            type="text"
            value={badgeFilter}
            onChange={(e) => setBadgeFilter(e.target.value)}
            placeholder="e.g. FEX-1024"
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <span>Total Records: <strong className="text-cyan-400">{total}</strong></span>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Seq #</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User Identifier</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Resource Target</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3 font-mono">Chained Block Hash (SHA-256)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-950/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                    #{ev.sequenceIndex}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {new Date(ev.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-white block">{ev.userName}</span>
                    <span className="font-mono text-[10px] text-slate-400">{ev.userBadge} ({ev.role})</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                        ev.action.includes('DENIED')
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : ev.action.includes('SIGNED') || ev.action.includes('VERIFIED')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-cyan-300'
                      }`}
                    >
                      {ev.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    <div>{ev.resourceType}</div>
                    {ev.resourceId && (
                      <span className="text-[10px] text-slate-500">{ev.resourceId}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        ev.result === 'SUCCESS'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : ev.result === 'DENIED'
                          ? 'text-red-400 bg-red-500/10 font-extrabold'
                          : 'text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {ev.result}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px]">
                    <div className="text-cyan-300 select-all" title={ev.currentAuditHash}>
                      {ev.currentAuditHash.slice(0, 20)}...
                    </div>
                    <div className="text-slate-500 text-[9px]" title={ev.previousAuditHash}>
                      &uarr; prev: {ev.previousAuditHash.slice(0, 12)}...
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-slate-800 disabled:opacity-50 text-white font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded bg-slate-800 disabled:opacity-50 text-white font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Audit Chain Modal */}
      <AuditChainModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        result={verifyResult}
      />
    </div>
  );
};
