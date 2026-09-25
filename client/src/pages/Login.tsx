import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import cyberLoginBg from '../assets/cyber_login_bg.jpg';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Shield,
  Cpu,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();

  const [badgeId, setBadgeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!badgeId.trim() || !password) {
      setError('Please enter your Account Number and Password.');
      return;
    }

    setLoading(true);
    const result = await login(badgeId.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid Account Number or Password');
    }
  };

  return (
    <div
      className="min-h-[100dvh] w-full relative flex items-center justify-center lg:justify-end font-sans selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden bg-[#050811]"
      style={{
        backgroundImage: `url(${cyberLoginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 100% Pure Transparent Floating Login Card (Matches Left Side Scene Perfectly) */}
      <div className="relative z-10 w-full max-w-[400px] mx-4 sm:mx-8 lg:mr-16 xl:mr-28 my-auto">
        <div className="w-full bg-slate-950/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-7 sm:p-9 text-slate-100 transition-all">
          {/* Header */}
          <div className="text-center mb-7">
            <h1 className="text-2xl sm:text-[26px] font-semibold text-white tracking-tight drop-shadow-md">
              User Login
            </h1>
            <p className="text-xs text-slate-300/80 mt-1.5 font-normal tracking-wide drop-shadow-sm">
              SFSL Security & Anti-Fraud Center
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-center gap-2 p-3 rounded-lg bg-rose-950/60 backdrop-blur-md border border-rose-500/40 text-rose-200 text-xs font-medium animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            {/* Account Number Field - Fully Transparent Glass Input */}
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-300 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="account_number"
                value={badgeId}
                onChange={(e) => {
                  setBadgeId(e.target.value);
                  setError(null);
                }}
                placeholder="Account Number"
                autoComplete="off"
                spellCheck={false}
                required
                className="w-full bg-black/25 backdrop-blur-md border border-white/15 focus:border-[#1890ff] focus:bg-black/40 focus:ring-1 focus:ring-[#1890ff] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner"
              />
            </div>

            {/* Password Field - Fully Transparent Glass Input */}
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-300 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Password"
                autoComplete="new-password"
                required
                className="w-full bg-black/25 backdrop-blur-md border border-white/15 focus:border-[#1890ff] focus:bg-black/40 focus:ring-1 focus:ring-[#1890ff] rounded-lg pl-10 pr-10 py-3 text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-white transition-colors focus:outline-none"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Solid Electric Blue Login Button (Exact Match to Reference Photo 2) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#1890ff] hover:bg-[#1580e6] active:bg-[#0e70cc] text-white font-medium text-sm rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </div>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials (1-Click Fill) */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1.5 drop-shadow-sm">
                <Sparkles className="w-3 h-3 text-[#1890ff]" />
                Demo Credentials
              </span>
              <span className="text-[10px] text-[#1890ff] font-medium">1-Click Fill</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setBadgeId('FORIS-CFO-001');
                  setPassword('Forensic#Secure2026');
                  setError(null);
                }}
                className={`p-2 rounded-lg border text-left transition-all text-xs flex flex-col justify-between backdrop-blur-md ${
                  badgeId === 'FORIS-CFO-001'
                    ? 'bg-blue-600/30 border-[#1890ff] text-white shadow-sm'
                    : 'bg-black/20 border-white/10 text-slate-200 hover:border-white/20 hover:bg-black/40'
                }`}
              >
                <span className="font-semibold text-white flex items-center gap-1 truncate text-[11px]">
                  <Shield className="w-3 h-3 text-[#1890ff] shrink-0" />
                  Dr. Abhiraj Singh
                </span>
                <span className="text-[9px] text-slate-300/80 truncate mt-0.5">Chief Forensic Officer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBadgeId('FORIS-CYBER-002');
                  setPassword('Cyber#Forensic2026');
                  setError(null);
                }}
                className={`p-2 rounded-lg border text-left transition-all text-xs flex flex-col justify-between backdrop-blur-md ${
                  badgeId === 'FORIS-CYBER-002'
                    ? 'bg-purple-600/30 border-purple-400 text-white shadow-sm'
                    : 'bg-black/20 border-white/10 text-slate-200 hover:border-white/20 hover:bg-black/40'
                }`}
              >
                <span className="font-semibold text-white flex items-center gap-1 truncate text-[11px]">
                  <Cpu className="w-3 h-3 text-purple-400 shrink-0" />
                  Pooja Sharma
                </span>
                <span className="text-[9px] text-slate-300/80 truncate mt-0.5">Senior Cyber Expert</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBadgeId('POLICE-INV-101');
                  setPassword('Police#Shield2026');
                  setError(null);
                }}
                className={`p-2 rounded-lg border text-left transition-all text-xs flex flex-col justify-between backdrop-blur-md ${
                  badgeId === 'POLICE-INV-101'
                    ? 'bg-blue-600/30 border-blue-400 text-white shadow-sm'
                    : 'bg-black/20 border-white/10 text-slate-200 hover:border-white/20 hover:bg-black/40'
                }`}
              >
                <span className="font-semibold text-white flex items-center gap-1 truncate text-[11px]">
                  <User className="w-3 h-3 text-blue-400 shrink-0" />
                  Insp. Amit Singh
                </span>
                <span className="text-[9px] text-slate-300/80 truncate mt-0.5">Lead Investigator</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBadgeId('JUDGE-SESS-901');
                  setPassword('Justice#Docket2026');
                  setError(null);
                }}
                className={`p-2 rounded-lg border text-left transition-all text-xs flex flex-col justify-between backdrop-blur-md ${
                  badgeId === 'JUDGE-SESS-901'
                    ? 'bg-amber-600/30 border-amber-400 text-white shadow-sm'
                    : 'bg-black/20 border-white/10 text-slate-200 hover:border-white/20 hover:bg-black/40'
                }`}
              >
                <span className="font-semibold text-white flex items-center gap-1 truncate text-[11px]">
                  <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                  Justice Deshmukh
                </span>
                <span className="text-[9px] text-slate-300/80 truncate mt-0.5">Sessions Judge</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
