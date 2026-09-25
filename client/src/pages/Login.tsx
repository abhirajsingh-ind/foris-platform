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

  const performLogin = async (id: string, pass: string) => {
    setError(null);
    if (!id.trim() || !pass) {
      setError('Please enter your Account Number and Password.');
      return;
    }

    setLoading(true);
    const result = await login(id.trim(), pass);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid Account Number or Password');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(badgeId, password);
  };

  const handleQuickLogin = async (id: string, pass: string) => {
    setBadgeId(id);
    setPassword(pass);
    await performLogin(id, pass);
  };

  return (
    <div
      className="min-h-[100dvh] w-full relative flex items-center justify-center lg:justify-end font-sans selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden"
      style={{
        backgroundImage: `url(${cyberLoginBg}?v=3)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 100% Pure Transparent Floating Form (Zero Card Border, Zero Tint, Completely Seamless) */}
      <div className="relative z-10 w-full max-w-[390px] mx-4 sm:mx-8 lg:mr-16 xl:mr-28 my-auto">
        <div className="w-full bg-transparent border-0 p-4 sm:p-6 text-slate-100 transition-all">
          {/* Header */}
          <div className="text-center mb-7">
            <h1 className="text-2xl sm:text-[26px] font-semibold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              User Login
            </h1>
            <p className="text-xs text-slate-300 mt-1.5 font-normal tracking-wide drop-shadow-[0_1px_5px_rgba(0,0,0,0.9)]">
              SFSL Security & Anti-Fraud Center
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-center gap-2 p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-medium animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            {/* Account Number Field - Fully Transparent Input */}
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
                className="w-full bg-transparent border border-white/20 focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition-all drop-shadow-sm"
              />
            </div>

            {/* Password Field - Fully Transparent Input */}
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
                className="w-full bg-transparent border border-white/20 focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff] rounded-lg pl-10 pr-10 py-3 text-sm text-white placeholder-slate-400 outline-none transition-all drop-shadow-sm"
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

          {/* Quick Demo Credentials (1-Click Instant Fast Access) */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                <Sparkles className="w-3 h-3 text-[#1890ff]" />
                Demo Credentials
              </span>
              <span className="text-[10px] text-[#1890ff] font-medium">1-Click Fast Login</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('FORIS-CFO-001', 'Forensic#Secure2026')}
                className={`p-2 rounded-lg border text-left transition-all text-xs flex flex-col justify-between ${
                  badgeId === 'FORIS-CFO-001'
                    ? 'bg-blue-600/30 border-[#1890ff] text-white'
                    : 'bg-transparent border-white/10 text-slate-200 hover:border-[#1890ff] hover:bg-white/5'
                }`}
              >
                <span className="font-semibold text-white flex items-center gap-1 truncate text-[11px] drop-shadow-sm">
                  <Shield className="w-3 h-3 text-[#1890ff] shrink-0" />
                  Dr. Abhiraj Singh
                </span>
                <span className="text-[9px] text-slate-300 truncate mt-0.5">Chief Forensic Officer</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('FORIS-CYBER-002', 'Cyber#Forensic2026')}
                className={`p-2 rounded-lg border text-left transition-all text-xs flex flex-col justify-between ${
                  badgeId === 'FORIS-CYBER-002'
                    ? 'bg-purple-600/30 border-purple-400 text-white'
                    : 'bg-transparent border-white/10 text-slate-200 hover:border-purple-400 hover:bg-white/5'
                }`}
              >
                <span className="font-semibold text-white flex items-center gap-1 truncate text-[11px] drop-shadow-sm">
                  <Cpu className="w-3 h-3 text-purple-400 shrink-0" />
                  Pooja Sharma
                </span>
                <span className="text-[9px] text-slate-300 truncate mt-0.5">Senior Cyber Expert</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('POLICE-INV-101', 'Police#Shield2026')}
                className={`p-2 rounded-lg border text-left transition-all text-xs flex flex-col justify-between ${
                  badgeId === 'POLICE-INV-101'
                    ? 'bg-blue-600/30 border-blue-400 text-white'
                    : 'bg-transparent border-white/10 text-slate-200 hover:border-blue-400 hover:bg-white/5'
                }`}
              >
                <span className="font-semibold text-white flex items-center gap-1 truncate text-[11px] drop-shadow-sm">
                  <User className="w-3 h-3 text-blue-400 shrink-0" />
                  Insp. Amit Singh
                </span>
                <span className="text-[9px] text-slate-300 truncate mt-0.5">Lead Investigator</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('JUDGE-SESS-901', 'Justice#Docket2026')}
                className={`p-2 rounded-lg border text-left transition-all text-xs flex flex-col justify-between ${
                  badgeId === 'JUDGE-SESS-901'
                    ? 'bg-amber-600/30 border-amber-400 text-white'
                    : 'bg-transparent border-white/10 text-slate-200 hover:border-amber-400 hover:bg-white/5'
                }`}
              >
                <span className="font-semibold text-white flex items-center gap-1 truncate text-[11px] drop-shadow-sm">
                  <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                  Justice Deshmukh
                </span>
                <span className="text-[9px] text-slate-300 truncate mt-0.5">Sessions Judge</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
