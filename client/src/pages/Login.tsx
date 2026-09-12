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
      {/* 3D WebGL Forensic Canvas Background (in dark mode) */}
      {!isLight && <ThreeForensicCanvas intensity={1.2} />}

      {/* Radial Glow Overlay */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none"></div>

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
        <ThreeDCard maxTilt={6} glowColor="rgba(16, 185, 129, 0.25)">
          <div
            className={`rounded-3xl p-6 sm:p-8 shadow-2xl border backdrop-blur-2xl space-y-5 transition-colors ${
              isLight
                ? 'bg-white/95 border-slate-200/90 shadow-slate-300 text-slate-900'
                : 'glass-panel border-slate-800/90 bg-slate-900/85 text-slate-100'
            }`}
          >
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 bg-gradient-to-r ${getAccentButtonGradient()} disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]`}
              >
                {loading ? (
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    VERIFYING CREDENTIALS...
                  </span>
                ) : (
                  <>
                    <span>Authenticate</span>
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
                <span>Step 2: Biometric Face Attestation required before access</span>
              </div>
              <div className="flex items-center gap-2">
                <Binary className="w-3.5 h-3.5 text-emerald-500/80" />
                <span>All authentication attempts recorded in tamper-evident ledger</span>
              </div>
            </div>
          </div>
        </ThreeDCard>
      </div>
    </div>
  );
};

export default Login;

