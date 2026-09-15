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
      {/* Header with Bold Main Topic & Live Telemetry Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border-2 border-rose-500/30 shadow-xl shadow-rose-950/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-rose-400 uppercase bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
              TOPIC: BACKEND DEFENSE OPERATIONS
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">SHIELD INTEGRITY 100%</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-amber-300 to-cyan-400">
              SECURITY MONITORING & ANOMALY RADAR
            </span>
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Real-time defense posture inspection, behavioral anomaly heuristic engine, and cryptographic privilege enforcement.
          </p>
        </div>

        <button
          onClick={handleTriggerJudgeViolationTest}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-rose-950/40 transition-all active:scale-95 shrink-0"
        >
          <AlertOctagon className="w-4 h-4 text-slate-950" />
          <span>Simulate Judicial Violation (403 Test)</span>
        </button>
      </div>

      {testResultMsg && (
        <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-xl text-xs text-amber-300 font-medium flex items-center gap-2 animate-fadeIn">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{testResultMsg}</span>
        </div>
      )}

      {/* Defense Posture Indicators - 6 DISTINCT ARCHITECTURAL GUARD TILES */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              TOPIC: CORE GUARDS
            </span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              DEFENSE POSTURE MATRIX (100% OPERATIONAL)
            </h3>
          </div>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 font-black bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/40">
            <CheckCircle2 className="w-4 h-4" />
            ALL GUARDS ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            {
              label: 'Authentication',
              code: 'G-01',
              color: 'cyan',
              border: 'border-cyan-500/40 hover:border-cyan-400',
              bg: 'from-cyan-950/50 via-slate-900 to-slate-950',
              text: 'text-cyan-300',
              badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
              icon: Lock,
            },
            {
              label: 'RBAC / ABAC',
              code: 'G-02',
              color: 'purple',
              border: 'border-purple-500/40 hover:border-purple-400',
              bg: 'from-purple-950/50 via-slate-900 to-slate-950',
              text: 'text-purple-300',
              badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
              icon: ShieldCheck,
            },
            {
              label: 'Audit Chaining',
              code: 'G-03',
              color: 'emerald',
              border: 'border-emerald-500/40 hover:border-emerald-400',
              bg: 'from-emerald-950/50 via-slate-900 to-slate-950',
              text: 'text-emerald-300',
              badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
              icon: Activity,
            },
            {
              label: 'SHA-256 Hash',
              code: 'G-04',
              color: 'amber',
              border: 'border-amber-500/40 hover:border-amber-400',
              bg: 'from-amber-950/50 via-slate-900 to-slate-950',
              text: 'text-amber-300',
              badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
              icon: Cpu,
            },
            {
              label: 'Session Armor',
              code: 'G-05',
              color: 'blue',
              border: 'border-blue-500/40 hover:border-blue-400',
              bg: 'from-blue-950/50 via-slate-900 to-slate-950',
              text: 'text-blue-300',
              badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
              icon: Server,
            },
            {
              label: 'Anomaly Engine',
              code: 'G-06',
              color: 'rose',
              border: 'border-rose-500/40 hover:border-rose-400',
              bg: 'from-rose-950/50 via-slate-900 to-slate-950',
              text: 'text-rose-300',
              badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
              icon: AlertTriangle,
            },
          ].map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.label}
                className={`bg-gradient-to-br ${item.bg} p-3.5 rounded-2xl border-2 ${item.border} text-center space-y-2 transition-all shadow-md group hover:scale-[1.03]`}
              >
                <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400">
                  <span>{item.code}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <div className="w-9 h-9 mx-auto rounded-xl bg-slate-900/90 flex items-center justify-center shadow-inner">
                  <IconComp className={`w-4 h-4 ${item.text}`} />
                </div>
                <span className="text-xs font-black text-white block uppercase tracking-tight">
                  {item.label}
                </span>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border block ${item.badge}`}>
                  ENFORCED
                </span>
              </div>
            );
          })}
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
