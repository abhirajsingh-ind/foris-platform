import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, AccentColor } from '../context/ThemeContext';
import { ThreeForensicCanvas } from '../components/ThreeForensicCanvas';
import { ThreeDCard } from '../components/ThreeDCard';
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
        return 'from-blue-600 via-cyan-600 to-sky-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-500/20';
      case 'amber':
        return 'from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-500/20';
      case 'violet':
        return 'from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-purple-500/20';
      case 'emerald':
      default:
        return 'from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-500/20';
    }
  };

  const getAccentBorderFocus = () => {
    switch (accent) {
      case 'cobalt':
        return 'focus:border-blue-400 focus:ring-blue-400/30 text-blue-400';
      case 'amber':
        return 'focus:border-amber-400 focus:ring-amber-400/30 text-amber-400';
      case 'violet':
        return 'focus:border-purple-400 focus:ring-purple-400/30 text-purple-400';
      case 'emerald':
      default:
        return 'focus:border-emerald-400 focus:ring-emerald-400/30 text-emerald-400';
    }
  };

  const getBrandGradient = () => {
    switch (accent) {
      case 'cobalt':
        return 'from-blue-600 via-cyan-600 to-indigo-600 ring-blue-400/40 shadow-blue-900/60';
      case 'amber':
        return 'from-amber-600 via-orange-600 to-yellow-600 ring-amber-400/40 shadow-amber-900/60';
      case 'violet':
        return 'from-purple-600 via-violet-600 to-indigo-600 ring-purple-400/40 shadow-purple-900/60';
      case 'emerald':
      default:
        return 'from-emerald-600 via-teal-600 to-cyan-600 ring-emerald-400/40 shadow-emerald-900/60';
    }
  };

  const getGlowColor = () => {
    switch (accent) {
      case 'cobalt':
        return 'rgba(59, 130, 246, 0.35)';
      case 'amber':
        return 'rgba(245, 158, 11, 0.35)';
      case 'violet':
        return 'rgba(139, 92, 246, 0.35)';
      case 'emerald':
      default:
        return 'rgba(16, 185, 129, 0.35)';
    }
  };

  const paletteOptions: { id: AccentColor; label: string; color: string }[] = [
    { id: 'emerald', label: 'Emerald', color: 'bg-emerald-500' },
    { id: 'cobalt', label: 'Cobalt', color: 'bg-blue-500' },
    { id: 'amber', label: 'Gold', color: 'bg-amber-500' },
    { id: 'violet', label: 'Violet', color: 'bg-purple-500' },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center p-4 lg:p-8 relative overflow-hidden transition-colors duration-300 ${
        isLight
          ? 'bg-slate-100 text-slate-900'
          : 'bg-slate-950 text-slate-100 bg-cyber-grid selection:bg-cyan-500/30 selection:text-cyan-200'
      }`}
    >
      {/* 3D WebGL Futuristic Quantum Forensic Canvas Background */}
      <ThreeForensicCanvas intensity={isLight ? 0.35 : 1.25} accent={accent} />

      {/* Radial Glow Overlay */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none"></div>

      {/* TOP-LEFT HOLOGRAPHIC TELEMETRY HUD */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 hidden md:flex flex-col gap-1 pointer-events-none animate-fadeIn">
        <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-wider text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>SFSL // SECURE GATEWAY v3.2</span>
        </div>
        <div className="text-[9px] font-mono text-slate-400">
          QUANTUM EVIDENCE VAULT • 256-BIT ENCRYPTION
        </div>
      </div>

      {/* BOTTOM-LEFT INTEGRITY STATUS */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-400 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>INTEGRITY MESH: ONLINE</span>
        <span className="text-slate-600">|</span>
        <span>NEURAL PLEXUS: 85 NODES</span>
      </div>

      {/* BOTTOM-RIGHT SENSOR TELEMETRY */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-400 pointer-events-none">
        <span>LASER SCANNER: 60 FPS</span>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-400 font-semibold">LATENCY: &lt;5MS</span>
      </div>

      {/* TOP FLOATING THEME BAR ON LOGIN SCREEN */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 shadow-xl">
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mr-1 hidden sm:inline-flex">
          <Palette className="w-3.5 h-3.5 text-emerald-400" />
          <span>Theme:</span>
        </span>

        {/* Color Palette Dots */}
        <div className="flex items-center gap-1.5 mr-1">
          {paletteOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setAccent(opt.id)}
              title={`${opt.label} Theme`}
              className={`w-5 h-5 rounded-full ${opt.color} transition-all flex items-center justify-center ${
                accent === opt.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {accent === opt.id && <Check className="w-3 h-3 text-white stroke-[3]" />}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-slate-700 mx-0.5"></div>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isLight ? 'Switch to Dark Cyber Theme' : 'Switch to Clean Light Theme'}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-xs font-semibold"
        >
          {isLight ? (
            <>
              <Moon className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] hidden sm:inline">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] hidden sm:inline">Light</span>
            </>
          )}
        </button>
      </div>

      {/* Login Container */}
      <div className="w-full max-w-md z-10 space-y-6 animate-fadeIn">
        {/* FORIS Header Branding */}
        <div className="text-center space-y-2">
          <div
            className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-tr ${getBrandGradient()} text-white shadow-2xl ring-2 glow-cyan`}
          >
            <Shield className="w-9 h-9 animate-pulseGlow" />
          </div>
          <div>
            <h1 className={`text-3xl font-black tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
              FORIS
            </h1>
            <p
              className={`text-xs font-mono tracking-widest uppercase font-semibold mt-0.5 ${
                accent === 'cobalt'
                  ? 'text-blue-500'
                  : accent === 'amber'
                  ? 'text-amber-500'
                  : accent === 'violet'
                  ? 'text-purple-500'
                  : 'text-emerald-500'
              }`}
            >
              Forensic Integrity & Evidence Management System
            </p>
          </div>
        </div>

        {/* 3D Tilt Login Card */}
        <ThreeDCard maxTilt={6} glowColor={getGlowColor()}>
          <div
            className={`rounded-3xl p-6 sm:p-8 shadow-2xl border backdrop-blur-2xl space-y-5 transition-colors relative overflow-hidden ${
              isLight
                ? 'bg-white/95 border-slate-200/90 shadow-slate-300 text-slate-900'
                : 'glass-panel border-cyan-500/30 bg-slate-900/85 text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.12)]'
            }`}
          >
            {/* Cyber Corner Brackets */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/70 rounded-tl-sm pointer-events-none"></div>
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/70 rounded-tr-sm pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/70 rounded-bl-sm pointer-events-none"></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/70 rounded-br-sm pointer-events-none"></div>

            {/* Glowing Scanline on the Card */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanline opacity-75 pointer-events-none"></div>

            {/* Card Header */}
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <span
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                  isLight ? 'text-slate-800' : 'text-white'
                }`}
              >
                <Lock className="w-4 h-4 text-emerald-500" />
                Secure Gateway Login
              </span>
              <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ENCRYPTED
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs font-medium animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
              {/* Officer Badge ID */}
              <div>
                <label
                  className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  Officer / User ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="foris_officer_id_field"
                    value={badgeId}
                    onChange={(e) => {
                      setBadgeId(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter your User ID (e.g. FEX-1024)"
                    autoComplete="off"
                    data-lpignore="true"
                    spellCheck={false}
                    className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 transition-all ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white ' +
                          getAccentBorderFocus()
                        : 'bg-slate-950/80 border border-slate-700/80 text-white placeholder:text-slate-600 ' +
                          getAccentBorderFocus()
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    name="foris_officer_pass_field"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    data-lpignore="true"
                    className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 transition-all ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white ' +
                          getAccentBorderFocus()
                        : 'bg-slate-950/80 border border-slate-700/80 text-white placeholder:text-slate-600 ' +
                          getAccentBorderFocus()
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Quick Persona Selector for Demo Testing */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Select Officer Persona (1-Click Fill)
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Demo Mode
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setBadgeId('FORIS-CFO-001');
                      setPassword('Forensic#Secure2026');
                      setError(null);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      badgeId === 'FORIS-CFO-001'
                        ? 'bg-cyan-500/20 border-cyan-500/80 shadow-sm shadow-cyan-500/30'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-[11px] text-white flex items-center gap-1 truncate">
                      <Shield className="w-3 h-3 text-cyan-400 shrink-0" />
                      Dr. Abhiraj Singh
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">Chief Forensic Officer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBadgeId('FORIS-CYBER-002');
                      setPassword('Cyber#Forensic2026');
                      setError(null);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      badgeId === 'FORIS-CYBER-002'
                        ? 'bg-purple-500/20 border-purple-500/80 shadow-sm shadow-purple-500/30'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-[11px] text-white flex items-center gap-1 truncate">
                      <Cpu className="w-3 h-3 text-purple-400 shrink-0" />
                      Pooja Sharma
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">Senior Cyber Expert</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBadgeId('POLICE-INV-101');
                      setPassword('Police#Shield2026');
                      setError(null);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      badgeId === 'POLICE-INV-101'
                        ? 'bg-blue-500/20 border-blue-500/80 shadow-sm shadow-blue-500/30'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-[11px] text-white flex items-center gap-1 truncate">
                      <User className="w-3 h-3 text-blue-400 shrink-0" />
                      Insp. Amit Singh
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">Lead Investigator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBadgeId('JUDGE-SESS-901');
                      setPassword('Justice#Docket2026');
                      setError(null);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      badgeId === 'JUDGE-SESS-901'
                        ? 'bg-amber-500/20 border-amber-500/80 shadow-sm shadow-amber-500/30'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-[11px] text-white flex items-center gap-1 truncate">
                      <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                      Justice Deshmukh
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">Sessions Judge</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 bg-gradient-to-r ${getAccentButtonGradient()} disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] hover:shadow-cyan-500/25`}
              >
                {loading ? (
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    AUTHENTICATING DIGITAL CREDENTIALS...
                  </span>
                ) : (
                  <>
                    <span>Authenticate & Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Info Footer */}
            <div
              className={`pt-3 border-t space-y-1.5 text-[10px] font-mono ${
                isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800/80 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" />
                <span>Step 1: Authenticate with assigned User ID and Password</span>
              </div>
              <div className="flex items-center gap-2">
                <Fingerprint className="w-3.5 h-3.5 text-emerald-500/80" />
                <span>Step 2: Biometric Face Verification (70% matching threshold)</span>
              </div>
              <div className="flex items-center gap-2">
                <Binary className="w-3.5 h-3.5 text-emerald-500/80" />
                <span>Cryptographic SHA-256 ledger integrity verification active</span>
              </div>
            </div>
          </div>
        </ThreeDCard>
      </div>
    </div>
  );
};

export default Login;

