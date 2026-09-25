import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, AccentColor } from '../context/ThemeContext';
import cyberLoginBg from '../assets/cyber_login_bg.jpg';
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  AlertTriangle,
  Fingerprint,
  Binary,
  ShieldCheck,
  Sun,
  Moon,
  Palette,
  Sparkles,
  Check,
  Cpu,
  Radio,
  KeyRound,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme, accent, setAccent, isLight } = useTheme();

  // Never prefill credentials
  const [badgeId, setBadgeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!badgeId.trim() || !password) {
      setError('Officer Badge ID and Password are required.');
      return;
    }

    setLoading(true);
    const result = await login(badgeId.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid User ID or Password');
    }
  };

  const getAccentButtonGradient = () => {
    switch (accent) {
      case 'cobalt':
        return 'from-blue-600 via-cyan-600 to-sky-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/25';
      case 'amber':
        return 'from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/25';
      case 'violet':
        return 'from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-violet-500 shadow-purple-500/25';
      case 'emerald':
      default:
        return 'from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 shadow-cyan-500/25';
    }
  };

  const getAccentBorderFocus = () => {
    switch (accent) {
      case 'cobalt':
        return 'focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-blue-300';
      case 'amber':
        return 'focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 text-amber-300';
      case 'violet':
        return 'focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 text-purple-300';
      case 'emerald':
      default:
        return 'focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-cyan-300';
    }
  };

  const paletteOptions: { id: AccentColor; label: string; color: string }[] = [
    { id: 'emerald', label: 'Cyan / Emerald', color: 'bg-cyan-500' },
    { id: 'cobalt', label: 'Cobalt Blue', color: 'bg-blue-500' },
    { id: 'amber', label: 'Gold Amber', color: 'bg-amber-500' },
    { id: 'violet', label: 'Neon Violet', color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* ======================================================== */}
      {/* 1. LEFT HALF: 3D CYBER SECURITY SHIELD HERO STAGE */}
      {/* ======================================================== */}
      <div
        className="w-full lg:w-1/2 xl:w-7/12 h-72 sm:h-96 lg:h-auto min-h-[300px] lg:min-h-[100dvh] relative overflow-hidden bg-slate-950 flex flex-col justify-between p-6 sm:p-10 shrink-0"
        style={{
          backgroundImage: `url(${cyberLoginBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Subtle holographic scanline layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#030712] pointer-events-none" />

        {/* Top Floating Badge on Shield Stage */}
        <div className="relative z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-xl border border-cyan-500/40 shadow-xl shadow-cyan-950/50">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300">
              SFSL // SECURE PROTOCOL v7.1
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SHIELD ACTIVE • 8K RENDER</span>
          </div>
        </div>

        {/* Bottom Floating Telemetry Bar on Shield Stage */}
        <div className="relative z-10 hidden sm:flex items-center justify-between text-[11px] font-mono pointer-events-none pt-4">
          <div className="flex items-center gap-2 text-slate-300 bg-slate-950/80 backdrop-blur-xl border border-cyan-500/30 px-3.5 py-2 rounded-2xl shadow-xl">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>256-BIT CRYPTOGRAPHIC TAMPER PROTECTION</span>
          </div>

          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
            FIPS 140-3 COMPLIANT • SEC 65B BSA 2023
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. RIGHT HALF: HIGH-TECH CYBER LOGIN FORM CONSOLE */}
      {/* ======================================================== */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex-1 flex flex-col justify-between p-6 sm:p-10 xl:p-12 bg-[#050914] border-t lg:border-t-0 lg:border-l border-cyan-500/20 relative z-20 overflow-y-auto">
        {/* Top Control Bar: Theme & Palette Switcher */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              GATEWAY THEME:
            </span>
            <div className="flex items-center gap-1.5">
              {paletteOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAccent(opt.id)}
                  title={`${opt.label} Theme`}
                  className={`w-4 h-4 rounded-full ${opt.color} transition-all flex items-center justify-center ${
                    accent === opt.id ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {accent === opt.id && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono"
            title="Toggle Dark / Laboratory Mode"
          >
            {isLight ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span className="text-[10px] hidden sm:inline">{isLight ? 'Dark' : 'Light'}</span>
          </button>
        </div>

        {/* Center Container: Cyber Login Form */}
        <div className="max-w-md w-full mx-auto my-auto py-6 space-y-6">
          {/* Header Branding */}
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-widest">
              <KeyRound className="w-3 h-3 text-cyan-400" />
              RESTRICTED FORENSIC GATEWAY
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-sans">
              FORIS <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">PORTAL</span>
            </h1>

            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              Forensic Integrity & Evidence Management System. Enter officer credentials to access sovereign criminal casework.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-medium animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            {/* User ID Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  OFFICER / USER ID
                </span>
                <span className="text-[9px] text-slate-500">FORMAT: FEX-XXXX</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="foris_user_field"
                  value={badgeId}
                  onChange={(e) => {
                    setBadgeId(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. FEX-1024 or click demo persona below"
                  autoComplete="off"
                  spellCheck={false}
                  className={`w-full rounded-2xl pl-4 pr-4 py-3 text-xs font-mono bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 outline-none transition-all ${getAccentBorderFocus()}`}
                  required
                />
              </div>
            </div>

            {/* Passkey Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  SECURITY PASSKEY
                </span>
                <span className="text-[9px] text-slate-500">256-BIT HASHED</span>
              </div>

              <div className="relative">
                <input
                  type="password"
                  name="foris_pass_field"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter authorized passkey"
                  autoComplete="new-password"
                  className={`w-full rounded-2xl pl-4 pr-4 py-3 text-xs font-mono bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 outline-none transition-all ${getAccentBorderFocus()}`}
                  required
                />
              </div>
            </div>

            {/* 1-Click Officer Persona Selector */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Select Officer Persona (1-Click Fill)
                </span>
                <span className="text-[9px] font-mono text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Instant Demo
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBadgeId('FORIS-CFO-001');
                    setPassword('Forensic#Secure2026');
                    setError(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    badgeId === 'FORIS-CFO-001'
                      ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-[11px] text-white flex items-center gap-1.5 truncate">
                    <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    Dr. Abhiraj Singh
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">Chief Forensic Officer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBadgeId('FORIS-CYBER-002');
                    setPassword('Cyber#Forensic2026');
                    setError(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    badgeId === 'FORIS-CYBER-002'
                      ? 'bg-purple-950/80 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-[11px] text-white flex items-center gap-1.5 truncate">
                    <Cpu className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    Pooja Sharma
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">Senior Cyber Expert</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBadgeId('POLICE-INV-101');
                    setPassword('Police#Shield2026');
                    setError(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    badgeId === 'POLICE-INV-101'
                      ? 'bg-blue-950/80 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-[11px] text-white flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    Insp. Amit Singh
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">Lead Investigator</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBadgeId('JUDGE-SESS-901');
                    setPassword('Justice#Docket2026');
                    setError(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    badgeId === 'JUDGE-SESS-901'
                      ? 'bg-amber-950/80 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-[11px] text-white flex items-center gap-1.5 truncate">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Justice Deshmukh
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">Sessions Judge</span>
                </button>
              </div>
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 bg-gradient-to-r ${getAccentButtonGradient()} text-white text-xs font-mono font-bold uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>VERIFYING CRYPTOGRAPHIC ACCESS...</span>
                </span>
              ) : (
                <>
                  <span>INITIATE SECURE ACCESS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Protocols Footnote */}
          <div className="pt-4 border-t border-white/5 space-y-2 text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Step 1: Authenticate with assigned User ID and Passkey</span>
            </div>
            <div className="flex items-center gap-2">
              <Fingerprint className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Step 2: Biometric Face Verification (70% matching threshold)</span>
            </div>
            <div className="flex items-center gap-2">
              <Binary className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Cryptographic SHA-256 ledger integrity verification active</span>
            </div>
          </div>
        </div>

        {/* Bottom System Telemetry */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>FORIS-NODE-01 // SFSL-GOV-IN</span>
          <span className="text-emerald-400 font-bold">● SYSTEM SECURE</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
