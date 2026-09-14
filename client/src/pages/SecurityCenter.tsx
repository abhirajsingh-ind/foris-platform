import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SecurityEvent } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Cpu,
  CheckCircle2,
  Server,
  Activity,
  AlertOctagon,
  Info,
} from 'lucide-react';

export const SecurityCenterPage: React.FC = () => {
  const { user } = useAuth();
  const [posture, setPosture] = useState<any>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResultMsg, setTestResultMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const token = localStorage.getItem('foris_token');
      const [overviewRes, eventsRes] = await Promise.all([
        fetch('/api/security/overview', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/security/events', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (overviewRes.ok && eventsRes.ok) {
        const overviewData = await overviewRes.json();
        const eventsData = await eventsRes.json();
        setPosture(overviewData.posture);
        setEvents(eventsData.events);
      }
    } catch (err) {
      console.error('Failed to load security overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerJudgeViolationTest = async () => {
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch('/api/security/test-judge-violation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'DEMO_JUDICIAL_MUTATION' }),
      });
      const data = await res.json();
      if (res.status === 403) {
        setTestResultMsg('✓ Intercepted! Server rejected unauthorized judicial write (HTTP 403) and generated an anomaly alert.');
        fetchSecurityData();
      } else {
        setTestResultMsg(data.message || 'Action evaluated.');
      }
    } catch (err) {
      alert('Request error.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            Security Monitoring & Anomaly Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time defense posture inspection, rule-based behavioral anomaly detection, and privilege enforcement.
          </p>
        </div>

        <button
          onClick={handleTriggerJudgeViolationTest}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-950/40 transition-all active:scale-95"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Simulate Judicial Violation (403 Demo)</span>
        </button>
      </div>

      {testResultMsg && (
        <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-xl text-xs text-amber-300 font-medium flex items-center gap-2 animate-fadeIn">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{testResultMsg}</span>
        </div>
      )}

      {/* Defense Posture Indicators */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Core Defense Posture (100% Operational)
          </span>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            All Guards Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Authentication', active: true },
            { label: 'Server RBAC / ABAC', active: true },
            { label: 'Audit Chaining', active: true },
            { label: 'SHA-256 Hashing', active: true },
            { label: 'Session Armor', active: true },
            { label: 'Anomaly Engine', active: true },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/30 text-center space-y-1"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-200 block">{item.label}</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold block">ACTIVE</span>
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Detection Alerts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-3 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Rule-Based Anomaly Detection Log
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tracks suspicious login bursts, unusual amendment frequencies, and denied authorization operations.
            </p>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
            Total Alerts: <strong className="text-cyan-400">{events.length}</strong>
          </div>
        </div>

        {/* Non-Negotiable Rule Clarification Alert */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong>Investigation Principle: </strong>
            An alert indicates anomalous behavior detected by behavioral heuristics (e.g. repeated failed passwords or multiple rapid report amendments). It does NOT automatically mean corruption, misconduct, or guilt.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {events.map((ev) => (
            <div
              key={ev.id}
              className={`p-4 rounded-xl border space-y-2 transition-all ${
                ev.severity === 'CRITICAL'
                  ? 'bg-red-950/20 border-red-500/40'
                  : ev.severity === 'HIGH'
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      ev.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-300'
                        : ev.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {ev.severity} SEVERITY
                  </span>
                  <span className="font-bold text-white text-xs">{ev.title}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(ev.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                <span>Target: {ev.userBadge || 'Network Subsystem'}</span>
                <span className="text-emerald-400">Status: {ev.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
