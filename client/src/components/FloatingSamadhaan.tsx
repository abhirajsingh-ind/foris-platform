import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  X,
  Send,
  User,
  ChevronRight,
  Maximize2,
  Bot,
  Shield,
  CornerDownLeft,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
  Radio,
} from 'lucide-react';

interface FloatingSamadhaanProps {
  onNavigateTab?: (tab: string) => void;
}

interface MiniMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  spokenAnswer?: string;
  navigateTab?: string;
  executionTimeMs?: number;
  timestamp: string;
}

// Tactical Web Audio Synthesizer for JARVIS Sound Cues
const playJarvisChime = (type: 'listening' | 'execute' | 'stop' | 'wake') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'listening') {
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'execute') {
      osc.frequency.setValueAtTime(440.00, now); // A4
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'wake') {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.frequency.setValueAtTime(440.00, now);
      osc.frequency.linearRampToValueAtTime(220.00, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch {}
};

export const FloatingSamadhaan: React.FC<FloatingSamadhaanProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MiniMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTalkativeMode, setIsTalkativeMode] = useState(true);
  const [navigationToast, setNavigationToast] = useState<string | null>(null);

  const isTalkativeModeRef = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    isTalkativeModeRef.current = isTalkativeMode;
  }, [isTalkativeMode]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const current = (finalTranscript || interimTranscript).toLowerCase();
      if (current.includes('hey jarvis') || current.includes('hello jarvis') || current.includes('jarvis')) {
        playJarvisChime('wake');
      }

      if (finalTranscript) {
        setInputMessage(finalTranscript);
        handleSend(finalTranscript);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (!text || !text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Continuous turn-taking in Talkative Mode
      if (isTalkativeModeRef.current) {
        setTimeout(() => {
          if (!isListening && recognitionRef.current) {
            try {
              playJarvisChime('listening');
              recognitionRef.current.start();
              setIsListening(true);
            } catch {}
          }
        }, 650);
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Edge.');
      return;
    }

    if (isListening) {
      playJarvisChime('stop');
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      playJarvisChime('listening');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Mic error:', err);
      }
    }
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'float-welcome',
          sender: 'ai',
          text: `नमस्ते Officer ${user?.name || 'Sir'}! 🙏\n\nMain hoon **JARVIS Forensic AI Voice**. Talkative mode active hai — aap mujhse seedha baat kar sakte hain ya voice command dekar platform navigate kar sakte hain (e.g., *"Open Evidence Vault"*, *"Cases dikhao"*, *"Forensic Lens khole"*). Fraction of a second me jawab milega!`,
          spokenAnswer: `Namaste Officer. JARVIS Forensic AI system online. Main aapki kya madad kar sakta hoon?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          executionTimeMs: 4,
        },
      ]);
      playJarvisChime('wake');
    }
  }, [isOpen, user, messages.length]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const userMsg: MiniMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('foris_token');
      const startTime = performance.now();
      const res = await fetch('/api/ai/samadhaan/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        const latency = data.executionTimeMs || Math.round(performance.now() - startTime);

        // Instant Voice Navigation Execution
        if (data.navigateTab && onNavigateTab) {
          playJarvisChime('execute');
          onNavigateTab(data.navigateTab);
          setNavigationToast(`Navigated to ${data.navigateTab.toUpperCase()} Screen`);
          setTimeout(() => setNavigationToast(null), 4000);
        }

        const aiMsg: MiniMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.answer || 'Solution processed.',
          spokenAnswer: data.spokenAnswer,
          navigateTab: data.navigateTab,
          executionTimeMs: latency,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

        if (autoSpeak) {
          const speakContent = data.spokenAnswer || data.answer.replace(/[#*`_]/g, '');
          speakText(speakContent);
        }
      }
    } catch (err) {
      console.error('Floating samadhaan error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Action Bubble Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-3 px-4 py-3 rounded-full bg-slate-950/90 border-2 border-cyan-400 text-cyan-200 font-bold text-xs shadow-2xl shadow-cyan-950/90 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all group backdrop-blur-xl"
        >
          {/* Rotating Arc Reactor Dash Ring */}
          <div className="relative w-5 h-5 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite]" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="6 4" />
            </svg>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-md shadow-cyan-400"></div>
          </div>
          <span className="tracking-widest font-mono font-black text-[11px] uppercase bg-gradient-to-r from-cyan-300 via-white to-teal-300 bg-clip-text text-transparent">
            J.A.R.V.I.S. AI
          </span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[9px] font-mono border border-cyan-500/40">
            ⚡ &lt;10ms
          </span>
        </button>
      )}

      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[550px] rounded-3xl bg-slate-900/95 border-2 border-cyan-500/40 shadow-2xl flex flex-col overflow-hidden animate-fadeIn backdrop-blur-2xl">
          {/* Header */}
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>JARVIS AI</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 text-cyan-400" />
                    SUB-SECOND
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">Conversational Voice Intelligence</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Talkative Mode Toggle */}
              <button
                onClick={() => setIsTalkativeMode(!isTalkativeMode)}
                className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-semibold transition-colors flex items-center gap-1 ${
                  isTalkativeMode
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
                title="Toggle continuous turn-taking talkative conversation"
              >
                <Radio className="w-3 h-3 text-emerald-400" />
                <span>{isTalkativeMode ? 'TALK: ON' : 'TALK: OFF'}</span>
              </button>

              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  autoSpeak
                    ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
                title="Toggle Voice Output"
              >
                {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {onNavigateTab && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateTab('samadhaan');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Open Full Screen AI Console"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Navigation Action Banner Notification */}
          {navigationToast && (
            <div className="px-3 py-1.5 bg-gradient-to-r from-cyan-950 to-blue-950 border-b border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center justify-between animate-fadeIn">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <strong>VOICE COMMAND:</strong> {navigationToast}
              </span>
              <button onClick={() => setNavigationToast(null)} className="text-cyan-400 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-950/70 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[92%] ${
                  m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] ${
                    m.sender === 'user'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white'
                  }`}
                >
                  {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`rounded-2xl p-3 text-xs leading-relaxed space-y-1.5 ${
                    m.sender === 'user'
                      ? 'bg-cyan-950/90 border border-cyan-700/60 text-cyan-100 rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {/* Voice Navigation Executed Pill */}
                  {m.navigateTab && (
                    <div className="pt-1">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono flex items-center gap-1 inline-flex">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Jumped to {m.navigateTab.toUpperCase()}</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-[9px] text-slate-500">
                    {m.sender === 'ai' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakText(m.spokenAnswer || m.text)}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                        >
                          <Volume2 className="w-2.5 h-2.5" /> Play Voice
                        </button>
                        <span className="text-emerald-400 font-mono flex items-center gap-0.5">
                          <Zap className="w-2 h-2" />
                          {m.executionTimeMs ? `${m.executionTimeMs}ms` : '<10ms'}
                        </span>
                      </div>
                    ) : (
                      <span>Officer</span>
                    )}
                    <span className="ml-auto">{m.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 max-w-[85%] mr-auto">
                <div className="w-6 h-6 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="rounded-xl p-2.5 bg-slate-900 border border-slate-800 text-[11px] text-cyan-400 flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  Processing Instant Answer...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Voice & Query Shortcuts */}
          <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[10px] scrollbar-none">
            <button
              onClick={() => handleSend('Open Evidence Vault')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/40 shrink-0 font-medium active:scale-95 transition-all flex items-center gap-1"
            >
              🔒 Open Vault
            </button>
            <button
              onClick={() => handleSend('Open Forensic Lens AI')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-800/40 shrink-0 font-medium active:scale-95 transition-all flex items-center gap-1"
            >
              🔍 Open Lens
            </button>
            <button
              onClick={() => handleSend('Active cases summary batao')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 font-medium active:scale-95 transition-all"
            >
              📂 Active Cases
            </button>
            <button
              onClick={() => handleSend('Section 65B Certificate process?')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 font-medium active:scale-95 transition-all"
            >
              📜 Sec 65B
            </button>
          </div>

          {/* Real-Time Acoustic Equalizer when Speaking */}
          {isSpeaking && (
            <div className="px-3 py-1 bg-slate-950 border-t border-cyan-500/20 flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                JARVIS Speaking...
              </span>
              <div className="flex items-center gap-1 h-3">
                <span className="w-1 bg-cyan-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-2.5"></span>
                <span className="w-1 bg-teal-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3"></span>
                <span className="w-1 bg-cyan-300 rounded-full animate-[pulse_0.3s_ease-in-out_infinite] h-2"></span>
                <span className="w-1 bg-blue-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-3"></span>
                <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-2.5"></span>
              </div>
            </div>
          )}

          {/* Input Box with Microphone */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 active:scale-95 ${
                  isListening
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 animate-pulse ring-2 ring-emerald-300 shadow-emerald-500/40 shadow-lg'
                    : isSpeaking
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-white animate-pulse'
                    : 'bg-slate-950 text-cyan-400 border border-slate-800 hover:border-cyan-400'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Tap to speak with JARVIS'}
              >
                {isListening ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isListening ? 'Listening to your voice...' : 'Ask JARVIS anything verbally...'}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

