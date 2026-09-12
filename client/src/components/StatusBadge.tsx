import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Clock, Shield, Lock } from 'lucide-react';

interface StatusBadgeProps {
  type: 'caseStatus' | 'case' | 'priority' | 'role' | 'reportStatus' | 'report' | 'evidence' | 'integrity';
  value: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, className = '' }) => {
  if (type === 'priority') {
    const config: Record<string, { bg: string; text: string; border: string }> = {
      CRITICAL: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
      HIGH: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
      MEDIUM: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
      LOW: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
    };
    const c = config[value] || config.LOW;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${c.bg} ${c.text} ${c.border} ${className}`}>
        {value}
      </span>
    );
  }

  if (type === 'caseStatus' || type === 'case') {
    const config: Record<string, { bg: string; text: string; border: string; label: string }> = {
      OPEN: { bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-500/30', label: 'Open' },
      UNDER_EXAMINATION: { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30', label: 'Under Examination' },
      REPORT_FILED: { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30', label: 'Report Filed' },
      COURT_SUBMITTED: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30', label: 'Court Docket' },
      CLOSED: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30', label: 'Closed' },
    };
    const c = config[value] || config.OPEN;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border} ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {c.label}
      </span>
    );
  }

  if (type === 'evidence') {
    const config: Record<string, { bg: string; text: string; border: string; label: string }> = {
      COLLECTED: { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30', label: 'Collected at Scene' },
      TRANSFERRED_TO_LAB: { bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-500/30', label: 'Transferred to SFSL' },
      IN_EXAMINATION: { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30', label: 'In Examination' },
      SECURE_VAULT: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30', label: 'Secure Vault Sealed' },
      PRESENTED_IN_COURT: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', label: 'Presented in Court' },
    };
    const c = config[value] || { bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30', label: value };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border} ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {c.label}
      </span>
    );
  }

  if (type === 'role') {
    const config: Record<string, { bg: string; text: string; border: string; label: string }> = {
      FORENSIC_OFFICER: { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/40', label: 'Forensic Officer' },
      POLICE_OFFICER: { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/40', label: 'Senior Police Officer' },
      JUDGE: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/50', label: 'Judge (Read-Only)' },
      ADMINISTRATOR: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/40', label: 'System Administrator' },
    };
    const c = config[value] || config.FORENSIC_OFFICER;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wide border ${c.bg} ${c.text} ${c.border} ${className}`}>
        {c.label}
      </span>
    );
  }

  if (type === 'reportStatus' || type === 'report') {
    const config: Record<string, { bg: string; text: string; border: string }> = {
      FINALIZED: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      AMENDED: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
      SUBMITTED: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
      DRAFT: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
    };
    const c = config[value] || config.DRAFT;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border} ${className}`}>
        {value === 'FINALIZED' && <CheckCircle className="w-3 h-3" />}
        {value === 'AMENDED' && <Clock className="w-3 h-3" />}
        {value}
      </span>
    );
  }

  if (type === 'integrity') {
    const isVerified = value === 'VERIFIED' || value === 'true';
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
          isVerified
            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-900/30'
            : 'bg-red-950/60 text-red-400 border-red-500/40 shadow-sm shadow-red-900/30'
        } ${className}`}
      >
        {isVerified ? (
          <>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>✓ Integrity Verified</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>⚠ Integrity Mismatch</span>
          </>
        )}
      </span>
    );
  }

  return <span>{value}</span>;
};
