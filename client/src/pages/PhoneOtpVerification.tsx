import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Key,
  Fingerprint,
  Sparkles,
  LogOut,
  ExternalLink,
  Info,
  Send,
  Zap,
  HelpCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Inbox,
  AtSign,
} from 'lucide-react';

export const PhoneOtpVerification: React.FC = () => {
  const {
    user,
    token,
    verifyPhoneOtp,
    resendPhoneOtp,
    logout,
  } = useAuth();

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [targetEmail, setTargetEmail] = useState<string>('abhirajsingh0904@gmail.com');
  const [maskedEmail, setMaskedEmail] = useState<string>('a****4@gmail.com');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showMailGuide, setShowMailGuide] = useState<boolean>(false);

  // 5-minute expiry countdown (300s)
  const [expirySeconds, setExpirySeconds] = useState<number>(300);

  // 30-second resend cooldown
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Trigger initial Email OTP dispatch on page mount
  useEffect(() => {
    let isMounted = true;

    const requestInitialOtp = async () => {
      try {
        if (!token) return;
        const res = await fetch('/api/auth/send-2fa-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success && isMounted) {
          if (data.email) setTargetEmail(data.email);
          if (data.maskedEmail) setMaskedEmail(data.maskedEmail);
          if (data.demoOtp) setDemoCode(data.demoOtp);
          setExpirySeconds(300);
          setCooldownSeconds(30);
          setSuccessMsg(`✓ 6-Digit Verification Code dispatched to ${data.email || 'abhirajsingh0904@gmail.com'}`);
          setTimeout(() => {
            if (isMounted) setSuccessMsg(null);
          }, 6000);
        }
      } catch (err) {
        console.error('Initial Email OTP error:', err);
      }
    };

    requestInitialOtp();

    // Auto-focus first input box
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 400);

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Expiry countdown interval
  useEffect(() => {
    if (expirySeconds <= 0) return;
    const timer = setInterval(() => {
      setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [expirySeconds]);

  // Resend cooldown countdown interval
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Handle digit input change
  const handleDigitChange = (index: number, val: string) => {
    setErrorMsg(null);
    const cleaned = val.replace(/[^0-9]/g, '');

    if (cleaned.length > 1) {
      handlePasteValue(cleaned);
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = cleaned;
    setOtpDigits(nextDigits);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits entered, auto-verify
    const fullCode = nextDigits.join('');
    if (fullCode.length === 6 && !nextDigits.includes('')) {
      submitOtp(fullCode);
    }
  };

  // Handle backspace key
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste full code
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pasteData) {
      handlePasteValue(pasteData);
    }
  };

  const handlePasteValue = (digitsStr: string) => {
    const chars = digitsStr.slice(0, 6).split('');
    const newDigits = ['', '', '', '', '', ''];
    chars.forEach((c, idx) => {
      newDigits[idx] = c;
    });
    setOtpDigits(newDigits);

    const targetIdx = Math.min(chars.length, 5);
    inputRefs.current[targetIdx]?.focus();

    if (chars.length >= 6) {
      submitOtp(chars.slice(0, 6).join(''));
    }
  };

  // Submit OTP
  const submitOtp = async (codeToSubmit?: string) => {
    const code = codeToSubmit || otpDigits.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the email verification code.');
      return;
    }

    if (expirySeconds <= 0) {
      setErrorMsg('Verification code has expired. Please click Resend Code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    const result = await verifyPhoneOtp(code);
    setIsVerifying(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Invalid verification code.');
      const nextDigits = [...otpDigits];
      nextDigits[5] = '';
      setOtpDigits(nextDigits);
      inputRefs.current[5]?.focus();
    }
  };

  // Resend OTP handler
  const handleResend = async () => {
    if (cooldownSeconds > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg(null);

    const result = await resendPhoneOtp();
    setIsResending(false);

    if (result.success) {
      setExpirySeconds(300);
      setCooldownSeconds(30);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setSuccessMsg(`✓ Fresh 6-digit verification code sent to ${targetEmail}`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } else {
      setErrorMsg(result.error || 'Failed to resend verification code.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none bg-cyber-grid">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 bg-amoled-radial pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500" />



      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-black/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wider text-white">FORIS</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/90 text-emerald-400 border border-emerald-500/30 tracking-widest uppercase">
                Gmail 2-Step Verification
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              STAGE 3/3 • Google Mail Cryptographic Identity Gate
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition-all shadow-sm"
          title="Sign out & return to login"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Exit Session</span>
        </button>
      </header>

      {/* Main Verification Container: Side-by-side on Desktop (Bagal me layout) */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10 my-2">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* ========================================================= */}
          {/* LEFT: 6-Digit OTP Entry Form (lg:col-span-7)              */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 bg-[#050811]/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden relative flex flex-col justify-between">
            {/* Glowing Top Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400" />

            <div className="p-6 sm:p-8 space-y-5">
              {/* Tier 2 Biometric Pass Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
                <div className="flex items-center space-x-2.5 text-emerald-300">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                    <Fingerprint className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-200">Biometric Face Recognition Passed</div>
                    <div className="text-[10px] text-emerald-400/80 font-mono">1:1 Landmark &amp; Feature Match: 99.4% Verified</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 self-start sm:self-center">
                  <CheckCircle2 className="w-3 h-3" /> Tier 2 Confirmed
                </span>
              </div>

              {/* Officer Header info */}
              <div className="text-center space-y-1.5">
                <div className="inline-flex p-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 shadow-inner text-emerald-400 mb-0.5">
                  <Mail className="w-7 h-7 animate-pulse" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Enter Gmail Verification Code
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Officer <span className="text-emerald-300 font-semibold">{user?.name || 'Dr. Abhiraj Singh'}</span> (<span className="font-mono text-slate-300">{user?.badgeId || 'FEX-1024'}</span>), enter the 6-digit cryptographic OTP dispatched to:
                </p>

                {/* Target Email Badge */}
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 text-emerald-200 font-mono text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/50">
                  <AtSign className="w-4 h-4 text-cyan-400" />
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="tracking-wide text-white">{targetEmail}</span>
                </div>
              </div>

              {/* Inline Quick OTP Bar (Right Above Inputs) */}
              {demoCode && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-400/40 text-xs shadow-md animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span className="text-slate-300 text-xs font-medium">Active Code:</span>
                    <span className="font-mono font-black text-amber-300 text-sm tracking-widest bg-black px-2 py-0.5 rounded border border-amber-400/40">
                      {demoCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePasteValue(demoCode)}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Auto-Fill</span>
                  </button>
                </div>
              )}

              {/* 6-Digit OTP Input Grid */}
              <div className="space-y-3">
                <div className="flex justify-center items-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      disabled={isVerifying}
                      className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-black rounded-xl bg-slate-950 border-2 transition-all outline-none ${
                        digit
                          ? 'border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20 bg-emerald-950/20'
                          : 'border-slate-700/80 text-white hover:border-slate-600 focus:border-emerald-500 focus:shadow-md focus:shadow-emerald-500/20'
                      } ${isVerifying ? 'opacity-50 cursor-wait' : ''}`}
                      autoComplete="off"
                    />
                  ))}
                </div>

                {/* Countdown Timer & Resend */}
                <div className="flex items-center justify-between px-2 text-xs font-mono">
                  <div className="flex items-center space-x-1.5">
                    <Clock className={`w-3.5 h-3.5 ${expirySeconds < 60 ? 'text-rose-400 animate-spin' : 'text-slate-400'}`} />
                    <span className={expirySeconds < 60 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                      Expires in: <span className="text-white font-bold">{formatTime(expirySeconds)}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldownSeconds > 0 || isResending}
                    className={`flex items-center space-x-1 font-semibold transition-all ${
                      cooldownSeconds > 0
                        ? 'text-slate-500 cursor-not-allowed'
                        : 'text-emerald-400 hover:text-emerald-300 underline underline-offset-4'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                    <span>{cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : 'Resend Code'}</span>
                  </button>
                </div>
              </div>

              {/* Error Message Toast */}
              {errorMsg && (
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-semibold animate-shake">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Message Toast */}
              {successMsg && (
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={() => submitOtp()}
                disabled={isVerifying || otpDigits.join('').length !== 6}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wider uppercase transition-all flex items-center justify-center space-x-2 shadow-lg ${
                  otpDigits.join('').length === 6 && !isVerifying
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white shadow-emerald-500/30 cursor-pointer transform hover:-translate-y-0.5'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                }`}
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>VERIFYING GMAIL TOKEN...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>VERIFY &amp; ACCESS DASHBOARD</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Left Box Footer */}
            <div className="bg-slate-950/80 px-6 py-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>TLS 1.3 • SHA-256 OTP Encrypted</span>
              </span>
              <span>SFSL GATEWAY v2.4</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: "BAGAL ME" Dedicated Live Email OTP Panel          */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 bg-[#050811]/95 border-2 border-emerald-400/80 rounded-2xl shadow-2xl shadow-emerald-950/60 backdrop-blur-xl overflow-hidden flex flex-col justify-between relative">
            {/* Top Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 animate-pulse" />

            <div className="p-6 sm:p-7 space-y-5">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      Live Gmail OTP
                    </h3>
                    <p className="text-[10px] text-emerald-400 font-mono">
                      DIRECT INBOX RELAY
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-[10px] font-mono font-bold text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  ONLINE
                </span>
              </div>

              {/* Target Email Info Card */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <AtSign className="w-3 h-3 text-cyan-400" />
                  <span>Target Recipient</span>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-200 truncate">
                  {targetEmail}
                </div>
              </div>

              {/* Big Prominent OTP Display Box */}
              <div className="bg-black/90 p-5 rounded-2xl border-2 border-emerald-500/40 text-center space-y-3 shadow-inner">
                <div className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Your 6-Digit Email Code</span>
                </div>

                {demoCode ? (
                  <div className="flex justify-center items-center gap-1.5 py-1">
                    {demoCode.split('').map((digit, i) => (
                      <span
                        key={i}
                        className="w-10 h-13 sm:w-11 sm:h-14 flex items-center justify-center rounded-xl bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300 font-mono font-black text-2xl shadow-lg shadow-emerald-500/20"
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-emerald-400/80 font-mono text-xs flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                    <span>Dispatching OTP to {targetEmail}...</span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400">
                  <span>Subject: SFSL 2FA Cryptographic Passkey</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => demoCode && handlePasteValue(demoCode)}
                  disabled={!demoCode}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>1-Click Auto-Fill &amp; Submit</span>
                </button>

                <button
                  type="button"
                  onClick={() => demoCode && copyToClipboard(demoCode)}
                  disabled={!demoCode}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-mono text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-bold">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy OTP Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Real Gmail SMTP Guide Collapsible */}
              <div className="pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowMailGuide(!showMailGuide)}
                  className="w-full flex items-center justify-between py-1.5 text-[11px] text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1 font-semibold">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real Gmail Inbox Setup (SMTP)</span>
                  </span>
                  {showMailGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showMailGuide && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] space-y-2 text-slate-300 animate-fadeIn">
                    <p className="leading-snug">
                      To deliver real emails to <strong className="text-emerald-300">abhirajsingh0904@gmail.com</strong>:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-400 text-[10px]">
                      <li>Go to Google Account (<span className="text-cyan-400">myaccount.google.com/apppasswords</span>).</li>
                      <li>Generate a 16-character <strong className="text-white">App Password</strong>.</li>
                      <li>Add <span className="font-mono text-emerald-300">SMTP_USER="abhirajsingh0904@gmail.com"</span> &amp; <span className="font-mono text-emerald-300">SMTP_PASS="..."</span> to Vercel env.</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>

            {/* Right Box Footer */}
            <div className="bg-slate-950/80 px-6 py-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>LIVE SYNC READY</span>
              </span>
              <span>DIRECT ACCESS</span>
            </div>
          </div>

        </div>
      </main>

      {/* Page Footer */}
      <footer className="text-center py-4 text-xs text-slate-600 border-t border-slate-900 bg-slate-950/40">
        <p>
          State Forensic Science Laboratory (SFSL) • Directorate of Forensic Services • Govt of India
        </p>
      </footer>
    </div>
  );
};
