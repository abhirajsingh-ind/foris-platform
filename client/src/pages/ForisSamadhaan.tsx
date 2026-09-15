import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Shield,
  FileText,
  Briefcase,
  HardDrive,
  Scale,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Lock,
  Building2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Headphones,
  Play,
  Pause,
  Zap,
  Globe,
  Flame,
  Sliders,
  Activity,
  Cpu,
  Compass,
  Waves,
  Eye,
  Copy,
  Check,
  Code,
  Key,
  Database,
  Terminal,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  spokenAnswer?: string;
  category?: string;
  navigateTab?: string;
  executionTimeMs?: number;
  modelUsed?: string;
  provider?: string;
  relatedActions?: { label: string; tab: string }[];
  timestamp: string;
}

interface ForisSamadhaanProps {
  setActiveTab?: (tab: string) => void;
}

const renderInlineMarkdown = (content: string) => {
  const parts = content.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, pIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong
          key={pIdx}
          className="font-black text-white px-1 py-0.5 rounded bg-slate-800/80 border border-slate-700/80 text-cyan-200 tracking-wide inline-block"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={pIdx}
          className="px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800 font-mono text-[11px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-2xl border border-cyan-500/30 bg-slate-950 overflow-hidden shadow-xl ring-1 ring-cyan-950">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono">
        <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-[11px] font-medium"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>
      <pre className="p-3.5 text-[12px] font-mono text-emerald-300 overflow-x-auto leading-relaxed selection:bg-cyan-900">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const renderTextLines = (text: string, keyPrefix: string) => {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const k = `${keyPrefix}-${idx}`;
    if (line.startsWith('### ')) {
      const topicText = line.replace('### ', '');
      const lower = topicText.toLowerCase();
      let theme = {
        border: 'border-cyan-500/40',
        bg: 'from-cyan-950/60 via-slate-900 to-slate-950',
        text: 'text-cyan-300',
        icon: '⚡',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      };
      if (lower.includes('evidence') || lower.includes('vault') || lower.includes('sha') || lower.includes('hash')) {
        theme = {
          border: 'border-emerald-500/40',
          bg: 'from-emerald-950/60 via-slate-900 to-slate-950',
          text: 'text-emerald-300',
          icon: '🛡️',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      } else if (lower.includes('law') || lower.includes('legal') || lower.includes('section') || lower.includes('court') || lower.includes('report') || lower.includes('act')) {
        theme = {
          border: 'border-amber-500/40',
          bg: 'from-amber-950/60 via-slate-900 to-slate-950',
          text: 'text-amber-300',
          icon: '⚖️',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      } else if (lower.includes('audit') || lower.includes('hsm') || lower.includes('crypto') || lower.includes('blockchain') || lower.includes('key')) {
        theme = {
          border: 'border-purple-500/40',
          bg: 'from-purple-950/60 via-slate-900 to-slate-950',
          text: 'text-purple-300',
          icon: '🔮',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        };
      } else if (lower.includes('warning') || lower.includes('critical') || lower.includes('alert') || lower.includes('tamper') || lower.includes('error')) {
        theme = {
          border: 'border-rose-500/40',
          bg: 'from-rose-950/60 via-slate-900 to-slate-950',
          text: 'text-rose-300',
          icon: '🚨',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      }

      return (
        <div
          key={k}
          className={`my-3 p-3 rounded-xl bg-gradient-to-r ${theme.bg} border-2 ${theme.border} shadow-md space-y-1`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase">
              TOPIC FOCUS
            </span>
            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${theme.badge}`}>
              VERIFIED KNOWLEDGE
            </span>
          </div>
          <h3 className={`text-sm sm:text-base font-black uppercase tracking-wide flex items-center gap-2 ${theme.text} drop-shadow`}>
            <span>{theme.icon}</span>
            <span>{topicText}</span>
          </h3>
        </div>
      );
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const content = line.substring(2);
      return (
        <div key={k} className="flex items-start gap-1.5 pl-2 text-slate-200">
          <span className="text-emerald-400 font-bold shrink-0">•</span>
          <span>{renderInlineMarkdown(content)}</span>
        </div>
      );
    }
    if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+\.)\s(.*)$/);
      if (match) {
        return (
          <div key={k} className="flex items-start gap-1.5 pl-2 text-slate-200">
            <span className="text-cyan-400 font-bold font-mono text-[11px] shrink-0">{match[1]}</span>
            <span>{renderInlineMarkdown(match[2])}</span>
          </div>
        );
      }
    }
    if (line.trim() === '') {
      return <div key={k} className="h-1.5" />;
    }
    return (
      <p key={k} className="text-slate-200 leading-relaxed">
        {renderInlineMarkdown(line)}
      </p>
    );
  });
};

const renderFormattedText = (text: string) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      const textBefore = text.slice(lastIdx, match.index);
      parts.push(renderTextLines(textBefore, `pre-${lastIdx}`));
    }
    const lang = match[1] || 'python';
    const code = match[2];
    parts.push(<CodeBlock key={`code-${match.index}`} code={code} language={lang} />);
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    parts.push(renderTextLines(text.slice(lastIdx), `post-${lastIdx}`));
  }

  return parts;
};

export const ForisSamadhaan: React.FC<ForisSamadhaanProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice Interaction States
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voiceLang, setVoiceLang] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  // JARVIS Talkative Mode & Auto-Navigation
  const [isTalkativeMode, setIsTalkativeMode] = useState(true);
  const [navigationToast, setNavigationToast] = useState<string | null>(null);
  const isTalkativeModeRef = useRef(isTalkativeMode);
  isTalkativeModeRef.current = isTalkativeMode;

  // Voice Engine Tone & Tuning Customization
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.04);
  const [voicePitch, setVoicePitch] = useState<number>(1.0);
  const [voiceTone, setVoiceTone] = useState<'jarvis' | 'soft' | 'tactical' | 'hindi'>('jarvis');
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [turnDelayMs, setTurnDelayMs] = useState<number>(650);
  const [wakeWordEnabled, setWakeWordEnabled] = useState<boolean>(true);

  // Open-Source Engine Mode & API Key Configuration
  const [aiProvider, setAiProvider] = useState<'auto' | 'ollama' | 'groq'>('auto');
  const [customApiKey, setCustomApiKey] = useState<string>(() => localStorage.getItem('foris_groq_key') || '');
  const [keySavedToast, setKeySavedToast] = useState<boolean>(false);

  // Conversational Memory & Pronoun Context
  const lastTopicRef = useRef<string>('');
  const [activeContextTopic, setActiveContextTopic] = useState<string>('');

  // Browser-Installed Custom Voice System
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>(
    () => localStorage.getItem('foris_selected_voice_uri') || ''
  );

  // Load Installed Browser TTS Voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        setSystemVoices(v);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Web Audio API High-Tech Sound Synthesis (JARVIS Multi-Tone Harmonic Chimes)
  const playJarvisChime = (type: 'listening' | 'execute' | 'wake' | 'stop') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'wake') {
        // Futuristic Iron Man Arc Reactor boot chime (C5 -> E5 -> G5 -> C6)
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.08, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.19);
        });
      } else if (type === 'listening') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.23);
      } else if (type === 'execute') {
        // High-tech affirmative double-tone (A4 -> E5 -> A5)
        [440, 659.25, 880].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.07, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.16);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.17);
        });
      } else if (type === 'stop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.22);
      }
    } catch {}
  };

  // 60 FPS Fluid Dynamic Canvas Frequency Equalizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const barCount = 44;

    const renderWave = () => {
      phase += isSpeaking ? 0.12 : isListening ? 0.08 : 0.025;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / barCount) * 0.65;
      const barGap = (width / barCount) * 0.35;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + barGap) + barGap / 2;
        const normalized = i / barCount;
        const wave =
          Math.sin(phase + normalized * Math.PI * 4) *
          Math.cos(phase * 0.6 + normalized * Math.PI * 2);

        let amplitude = 0.12;
        if (isSpeaking) {
          amplitude = 0.28 + 0.72 * Math.abs(wave) * (0.85 + 0.15 * Math.sin(phase * 2.5 + i));
        } else if (isListening) {
          amplitude = 0.22 + 0.58 * Math.abs(wave);
        } else {
          amplitude = 0.1 + 0.08 * Math.abs(wave);
        }

        const barHeight = Math.max(4, amplitude * (height - 8));
        const y = (height - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isSpeaking) {
          grad.addColorStop(0, '#38bdf8');
          grad.addColorStop(0.5, '#818cf8');
          grad.addColorStop(1, '#06b6d4');
        } else if (isListening) {
          grad.addColorStop(0, '#34d399');
          grad.addColorStop(0.5, '#10b981');
          grad.addColorStop(1, '#059669');
        } else {
          grad.addColorStop(0, '#38bdf8');
          grad.addColorStop(1, '#1e293b');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        if ((ctx as any).roundRect) {
          (ctx as any).roundRect(x, y, barWidth, barHeight, 2.5);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isSpeaking, isListening, isVoiceMode]);

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      console.warn('Web Speech Recognition API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = voiceLang;

    recognition.onstart = () => {
      setIsListening(true);
      setLiveTranscript('');
      playJarvisChime('listening');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const current = finalTranscript || interimTranscript;
      setLiveTranscript(current);

      // Wake Word Audio Cue ("Hey Gyaan Guru" / "Gyaan Guru" / "Hey Jarvis")
      if (wakeWordEnabled && current) {
        const lower = current.toLowerCase();
        if (
          lower.includes('hey gyaan guru') ||
          lower.includes('gyaan guru') ||
          lower.includes('gyan guru') ||
          lower.includes('hey gyan guru') ||
          lower.includes('hey jarvis') ||
          lower.includes('hello jarvis') ||
          lower.includes('ok jarvis') ||
          (lower.startsWith('jarvis') && lower.length < 15)
        ) {
          playJarvisChime('wake');
        }
      }

      if (finalTranscript) {
        setInputMessage(finalTranscript);
        handleSendMessage(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('Microphone access was denied. Please allow microphone permissions in your browser.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

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
  }, [voiceLang, wakeWordEnabled]);

  // Update recognition language when toggled
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = voiceLang;
    }
  }, [voiceLang]);

  // Natural Voice Text-to-Speech Speak Function with Voice Tone Tuning
  const speakText = (text: string, messageId?: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (!text || text.trim().length === 0) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang;

    // Apply selected voice tone configuration
    if (voiceTone === 'soft') {
      utterance.rate = 0.92;
      utterance.pitch = 0.93;
    } else if (voiceTone === 'tactical') {
      utterance.rate = 1.22;
      utterance.pitch = 1.05;
    } else if (voiceTone === 'hindi') {
      utterance.lang = 'hi-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
    } else {
      // JARVIS Executive Tone
      utterance.rate = voiceSpeed;
      utterance.pitch = voicePitch;
    }

    // Try finding preferred natural or British/Hindi voice
    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        if (selectedVoiceUri) {
          const matched = voices.find((v) => v.voiceURI === selectedVoiceUri);
          if (matched) utterance.voice = matched;
        } else if (voiceTone === 'jarvis') {
          const jarvisVoice = voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.toLowerCase().includes('uk') ||
                v.name.toLowerCase().includes('george') ||
                v.name.toLowerCase().includes('daniel') ||
                v.name.toLowerCase().includes('natural') ||
                v.name.toLowerCase().includes('guy'))
          );
          if (jarvisVoice) utterance.voice = jarvisVoice;
        } else if (voiceTone === 'hindi' || voiceLang === 'hi-IN') {
          const hindiVoice = voices.find(
            (v) =>
              v.lang.includes('hi') ||
              v.name.toLowerCase().includes('hindi') ||
              v.name.toLowerCase().includes('kalpana') ||
              v.name.toLowerCase().includes('madhur')
          );
          if (hindiVoice) utterance.voice = hindiVoice;
        }
      }
    } catch {}

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (messageId) setCurrentlyPlayingId(messageId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentlyPlayingId(null);

      // JARVIS TALKATIVE MODE: Hands-free fluid conversation turn-taking
      if (isTalkativeModeRef.current && recognitionRef.current) {
        setTimeout(() => {
          try {
            playJarvisChime('listening');
            recognitionRef.current.start();
            setIsListening(true);
          } catch (e) {
            // mic already active
          }
        }, turnDelayMs);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentlyPlayingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentlyPlayingId(null);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      playJarvisChime('stop');
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  // Load Welcome Greeting & Initial Prompts from Server
  useEffect(() => {
    async function loadWelcome() {
      try {
        const token = localStorage.getItem('foris_token');
        const res = await fetch('/api/ai/samadhaan/welcome', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.greeting) {
            setMessages([
              {
                id: 'welcome-1',
                sender: 'ai',
                text: data.greeting,
                spokenAnswer: `Namaste Officer ${user?.name || 'Abhiraj Singh'}. GYAAN GURU Voice Core is online. Boliye Sir, main aapki kya madad karoon?`,
                category: 'SYSTEM_GREETING',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }
          if (data.suggestedQuestions) {
            setSuggestedQuestions(data.suggestedQuestions);
          }
        }
      } catch (err) {
        console.error('Failed to load welcome from Samadhaan:', err);
        setMessages([
          {
            id: 'welcome-fallback',
            sender: 'ai',
            text: `नमस्ते ऑफिसर ${user?.name || 'Dr. Abhiraj Singh'}! 🙏\n\nMain **GYAAN GURU (FORIS SAMADHAAN AI)** hoon. State Forensic Science Laboratory ke sabhi systems online hain. How can I assist you today, Sir?`,
            spokenAnswer: `Namaste Officer. Welcome to FORIS GYAAN GURU Voice Assistant. Systems are fully operational.`,
            category: 'SYSTEM_GREETING',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }

    loadWelcome();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputMessage).trim();
    if (!queryText || loading) return;

    // Stop speech recognition and cancel existing audio
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
    stopSpeaking();

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLiveTranscript('');
    setLoading(true);

    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch('/api/ai/samadhaan/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-ai-provider': aiProvider,
          'x-ai-key': customApiKey,
        },
        body: JSON.stringify({
          message: queryText,
          provider: aiProvider,
          apiKey: customApiKey,
          previousTopic: lastTopicRef.current,
          conversationHistory: messages.slice(-4).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            text: m.text,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.topic) {
          lastTopicRef.current = data.topic;
          setActiveContextTopic(data.topic);
        }
        const aiMsgId = `ai-${Date.now()}`;
        const aiMsg: Message = {
          id: aiMsgId,
          sender: 'ai',
          text: data.answer || 'Samadhaan resolution completed.',
          spokenAnswer: data.spokenAnswer,
          category: data.category,
          navigateTab: data.navigateTab,
          executionTimeMs: data.executionTimeMs,
          modelUsed: data.modelUsed,
          provider: data.provider,
          relatedActions: data.relatedActions,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Auto-navigate if voice command requested tab switch
        if (data.navigateTab && setActiveTab) {
          playJarvisChime('execute');
          setNavigationToast(`⚡ GYAAN GURU ACTION: Navigating to ${data.navigateTab.toUpperCase()}...`);
          setTimeout(() => {
            setActiveTab(data.navigateTab);
            setNavigationToast(null);
          }, 1400);
        }

        // Auto-speak reply immediately with zero delay
        if (autoSpeak) {
          const textToSpeak = data.spokenAnswer || data.answer.replace(/[#*`_]/g, '');
          speakText(textToSpeak, aiMsgId);
        }
      } else {
        const aiErrorMsg: Message = {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'FORIS SAMADHAAN service encountered a temporary network delay. Please retry your question.',
          spokenAnswer: 'Sorry, temporary network delay. Please retry your question.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiErrorMsg]);
        if (autoSpeak) speakText(aiErrorMsg.spokenAnswer || '', aiErrorMsg.id);
      }
    } catch (err) {
      const aiErrorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Network connection failed while reaching FORIS SAMADHAAN core.',
        spokenAnswer: 'Network connection failed while reaching FORIS SAMADHAAN.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiErrorMsg]);
      if (autoSpeak) speakText(aiErrorMsg.spokenAnswer || '', aiErrorMsg.id);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleActionClick = (tab: string) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  return (
    <div className="space-y-4 pb-10 max-w-6xl mx-auto font-sans text-slate-100 animate-fadeIn">
      {/* 1. GYAAN GURU HOLOGRAPHIC COMMAND HEADER */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 border-2 border-cyan-500/40 p-5 sm:p-6 shadow-2xl shadow-cyan-950/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          {/* Logo and Core Identity */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-indigo-600 text-white shadow-xl shadow-cyan-950 ring-2 ring-cyan-400/50">
                <Sparkles className="w-7 h-7 animate-pulse" />
              </div>
              {isSpeaking && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 border-2 border-slate-950 animate-ping"></div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>J.A.R.V.I.S. FORENSIC VOICE AI</span>
                  <span className="text-cyan-400 text-sm font-mono font-normal">v4.5</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  SUB-SECOND INTELLIGENCE
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-purple-400" />
                  OPEN SOURCE: {aiProvider === 'ollama' ? 'OLLAMA LOCAL' : aiProvider === 'groq' ? 'GROQ LLAMA-3.3' : 'WIKI + DDG (ZERO-CONFIG)'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-2">
                <span>State Forensic Science Laboratory (SFSL) Core</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400 font-mono">Hands-Free Conversational Turn-Taking</span>
              </p>
            </div>
          </div>

          {/* Voice Talk Action Station */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Talkative Mode Toggle */}
            <button
              onClick={() => {
                const next = !isTalkativeMode;
                setIsTalkativeMode(next);
                if (next) {
                  playJarvisChime('wake');
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md active:scale-95 ${
                isTalkativeMode
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/50'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-700'
              }`}
              title="Toggle GYAAN GURU Continuous Talkative Turn-Taking"
            >
              <Radio className={`w-3.5 h-3.5 ${isTalkativeMode ? 'text-emerald-300 animate-pulse' : ''}`} />
              <span>{isTalkativeMode ? '🎙️ Talkative Mode: ON' : 'Talkative Mode: OFF'}</span>
            </button>

            {/* Voice Audio Settings Toggle */}
            <button
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                showVoiceSettings
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/40'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500/40'
              }`}
              title="Open Voice Tone & Sensitivity Tuning"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audio Tuning</span>
            </button>

            {/* Toggle Fullscreen Voice Talk HUD */}
            <button
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
                isVoiceMode
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-cyan-500/30 ring-2 ring-cyan-400/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isVoiceMode ? 'Compact HUD' : 'Arc Reactor HUD'}</span>
            </button>

            {/* Language Selector */}
            <button
              onClick={() => setVoiceLang(voiceLang === 'hi-IN' ? 'en-IN' : 'hi-IN')}
              className="px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
              title="Toggle Voice Language"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{voiceLang === 'hi-IN' ? '🇮🇳 Hindi' : '🌐 English'}</span>
            </button>

            {/* Auto-Speak Toggle */}
            <button
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setAutoSpeak(!autoSpeak);
              }}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center ${
                autoSpeak
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={autoSpeak ? 'Voice output active' : 'Voice output muted'}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Audio Tuning Drawer (When Opened) */}
        {showVoiceSettings && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs animate-fadeIn">
            {/* Tone Presets */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <label className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Voice Personality Tone
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'jarvis', label: '🤖 Guru Executive' },
                  { id: 'soft', label: '🕊️ Soft Calm' },
                  { id: 'tactical', label: '⚡ Tactical' },
                  { id: 'hindi', label: '🇮🇳 Hindi Warm' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setVoiceTone(t.id as any)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      voiceTone === t.id
                        ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-900/50 ring-1 ring-cyan-400'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Speed */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 font-bold">
                <span>SPEECH TEMPO (SPEED)</span>
                <span className="text-white">{voiceSpeed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.35"
                step="0.05"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>0.8x (Deliberate)</span>
                <span>1.35x (Rapid)</span>
              </div>
            </div>

            {/* Voice Pitch */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 font-bold">
                <span>AUDIO PITCH RESONANCE</span>
                <span className="text-white">{voicePitch.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.25"
                step="0.05"
                value={voicePitch}
                onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>Deep Resonant</span>
                <span>Crisp High</span>
              </div>
            </div>

            {/* Wake Word & Silence Delay */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" /> "HEY GYAAN GURU" WAKE ARM
                </span>
                <button
                  onClick={() => setWakeWordEnabled(!wakeWordEnabled)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    wakeWordEnabled ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300' : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {wakeWordEnabled ? 'ACTIVE' : 'MUTED'}
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                <span className="text-[10px] text-slate-400 font-mono">Turn Pause:</span>
                <div className="flex gap-1">
                  {[500, 650, 900].map((ms) => (
                    <button
                      key={ms}
                      onClick={() => setTurnDelayMs(ms)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        turnDelayMs === ms
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {ms}ms
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Installed System Voices Dropdown & Audition */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Installed System Voices (Browser OS Speech Synthesis Engine)
                </label>
                <button
                  type="button"
                  onClick={() => speakText("J.A.R.V.I.S. voice synthesis test successful, Sir.")}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95"
                >
                  <Play className="w-3 h-3 text-cyan-300" /> Test Voice Sample
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={selectedVoiceUri}
                  onChange={(e) => {
                    setSelectedVoiceUri(e.target.value);
                    localStorage.setItem('foris_selected_voice_uri', e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="">⚡ Auto Smart Selection (Follows Selected Personality & Language)</option>
                  {systemVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang}) {v.default ? '★ Default' : ''}
                    </option>
                  ))}
                </select>
                {selectedVoiceUri && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVoiceUri('');
                      localStorage.removeItem('foris_selected_voice_uri');
                    }}
                    className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-300 text-xs font-mono shrink-0 transition-colors"
                    title="Reset to Auto"
                  >
                    Reset Auto
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Select from any installed local voices on your operating system (Microsoft George, Google Hindi, Natural English, etc.).
              </p>
            </div>

            {/* Open Source AI Engine Configuration Card */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/40 border border-purple-500/40 space-y-2.5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" /> Open-Source Conversational AI Engine ("Ushme Open Source Daalo")
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Converses on ANY topic: Science, Space, Coding, Cricket, Math, History, Life
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: 'auto',
                    title: '🌐 Auto: Open Knowledge Core',
                    sub: 'Wikipedia REST + DuckDuckGo + Multi-Domain Reasoner (Instant, Zero Setup)',
                  },
                  {
                    id: 'ollama',
                    title: '🦙 Local Ollama (Private)',
                    sub: 'Local runner at localhost:11434 (Llama 3, Mistral, Gemma, Phi)',
                  },
                  {
                    id: 'groq',
                    title: '⚡ Groq Cloud Llama-3.3 70B',
                    sub: 'Free open-source ultra-fast cloud model inference',
                  },
                ].map((prov) => (
                  <button
                    key={prov.id}
                    onClick={() => setAiProvider(prov.id as any)}
                    className={`p-2.5 rounded-xl text-left transition-all border ${
                      aiProvider === prov.id
                        ? 'bg-purple-950/90 border-purple-400 text-white ring-1 ring-purple-400/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>{prov.title}</span>
                      {aiProvider === prov.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">{prov.sub}</p>
                  </button>
                ))}
              </div>

              {aiProvider === 'groq' && (
                <div className="flex items-center gap-2 pt-1 animate-fadeIn">
                  <input
                    type="password"
                    placeholder="Enter Groq API Key (gsk_...)"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-purple-500/40 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    onClick={() => {
                      localStorage.setItem('foris_groq_key', customApiKey);
                      setKeySavedToast(true);
                      setTimeout(() => setKeySavedToast(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all flex items-center gap-1 shrink-0"
                  >
                    {keySavedToast ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Key className="w-3.5 h-3.5" />}
                    <span>{keySavedToast ? 'Saved to Browser!' : 'Save Key'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Auto-Navigation Toast Alert */}
      {navigationToast && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950 via-indigo-950 to-emerald-950 border-2 border-cyan-400 text-cyan-200 text-xs font-mono font-bold flex items-center justify-between shadow-2xl shadow-cyan-950/90 animate-pulse">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span className="tracking-wide">{navigationToast}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 uppercase">
            ⚡ SUB-SECOND EXECUTION
          </span>
        </div>
      )}

      {/* 2. GYAAN GURU HOLOGRAPHIC ARC REACTOR & AUDIO FREQUENCY VISUALIZER */}
      {isVoiceMode && (
        <div className="rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/60 border-2 border-cyan-500/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fadeIn">
          {/* Subtle Grid Matrix Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#08334415_1px,transparent_1px),linear-gradient(to_bottom,#08334415_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 max-w-4xl mx-auto">
            {/* Top Telemetry Row + Center Arc Reactor */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Left Telemetry Glass Card */}
              <div className="hidden md:flex flex-col gap-2.5 p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/30 text-left text-xs font-mono shadow-lg">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold pb-1 border-b border-slate-800 text-[11px]">
                  <Activity className="w-3.5 h-3.5" />
                  <span>NEURAL STATUS: ONLINE</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Latency:</span>
                  <span className="text-emerald-400 font-bold">⚡ &lt; 10ms (Sub-Sec)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Hash Seal:</span>
                  <span className="text-cyan-300">SHA-256 (RFC 3161)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Evidence Law:</span>
                  <span className="text-indigo-300">BSA 2023 §63 / IEA §65B</span>
                </div>
              </div>

              {/* Center Iron Man Arc Reactor 3D Hologram */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                  {/* Outer Compass Degree Ticks */}
                  <svg
                    className={`absolute inset-0 w-full h-full ${
                      isSpeaking
                        ? 'animate-[spin_9s_linear_infinite]'
                        : isListening
                        ? 'animate-[spin_12s_linear_infinite]'
                        : 'animate-[spin_26s_linear_infinite]'
                    }`}
                    viewBox="0 0 200 200"
                  >
                    <circle
                      cx="100"
                      cy="100"
                      r="94"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      className={isListening ? 'text-emerald-500/40' : 'text-cyan-500/40'}
                      strokeDasharray="4 6"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="86"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={isListening ? 'text-emerald-400/60' : 'text-cyan-400/60'}
                      strokeDasharray="18 22"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.8"
                      className="text-indigo-400/30"
                    />
                    <text x="100" y="14" fill="#38bdf8" fontSize="6" fontFamily="monospace" textAnchor="middle">0°</text>
                    <text x="186" y="102" fill="#38bdf8" fontSize="6" fontFamily="monospace" textAnchor="middle">90°</text>
                    <text x="100" y="192" fill="#38bdf8" fontSize="6" fontFamily="monospace" textAnchor="middle">180°</text>
                    <text x="14" y="102" fill="#38bdf8" fontSize="6" fontFamily="monospace" textAnchor="middle">270°</text>
                  </svg>

                  {/* Counter-Rotating Segmented Ring */}
                  <svg
                    className={`absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] ${
                      isSpeaking
                        ? 'animate-[spin_6s_linear_infinite_reverse]'
                        : isListening
                        ? 'animate-[spin_8s_linear_infinite_reverse]'
                        : 'animate-[spin_18s_linear_infinite_reverse]'
                    }`}
                    viewBox="0 0 160 160"
                  >
                    <circle
                      cx="80"
                      cy="80"
                      r="72"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={isListening ? 'text-teal-400/70' : 'text-cyan-400/70'}
                      strokeDasharray="28 14 8 14"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-sky-500/30"
                      strokeDasharray="4 12"
                    />
                  </svg>

                  {/* Glowing Energy Aura Ring */}
                  <div
                    className={`absolute inset-8 rounded-full blur-xl transition-all duration-500 ${
                      isListening
                        ? 'bg-emerald-500/40 scale-110'
                        : isSpeaking
                        ? 'bg-cyan-500/40 scale-115 animate-pulse'
                        : 'bg-cyan-500/20 scale-95'
                    }`}
                  />

                  {/* Center Action Core Button */}
                  <button
                    onClick={toggleListening}
                    className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 group ${
                      isListening
                        ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-slate-950 shadow-emerald-500/60 ring-4 ring-emerald-300 scale-105'
                        : isSpeaking
                        ? 'bg-gradient-to-tr from-cyan-600 via-indigo-600 to-blue-500 text-white shadow-cyan-500/60 ring-4 ring-cyan-300 animate-pulse'
                        : 'bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 text-cyan-300 border-2 border-cyan-500/50 hover:border-cyan-400 hover:shadow-cyan-500/30 hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    <div className="absolute inset-2 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
                    {isListening ? (
                      <>
                        <Mic className="w-9 h-9 animate-bounce text-slate-950 drop-shadow" />
                        <span className="text-[9px] font-mono font-black mt-1 uppercase tracking-widest text-slate-950">
                          LISTENING
                        </span>
                      </>
                    ) : isSpeaking ? (
                      <>
                        <Volume2 className="w-9 h-9 animate-pulse text-white drop-shadow" />
                        <span className="text-[9px] font-mono font-black mt-1 uppercase tracking-widest text-white">
                          SPEAKING
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-9 h-9 text-cyan-400 group-hover:rotate-12 transition-transform drop-shadow" />
                        <span className="text-[9px] font-mono font-black mt-1 text-cyan-300 tracking-wider">
                          GYAAN GURU VOICE
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Telemetry Glass Card */}
              <div className="hidden md:flex flex-col gap-2.5 p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/30 text-left text-xs font-mono shadow-lg">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold pb-1 border-b border-slate-800 text-[11px]">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>PLATFORM REGISTER</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Active Cases:</span>
                  <span className="text-cyan-300 font-bold">18 Files Online</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Evidence Vault:</span>
                  <span className="text-teal-300">42 Sealed Artifacts</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Wake Word:</span>
                  <span className={wakeWordEnabled ? "text-emerald-400" : "text-slate-500"}>
                    {wakeWordEnabled ? '"Hey Gyaan Guru" Armed' : 'Muted'}
                  </span>
                </div>
              </div>
            </div>

            {/* Fluid Canvas Audio Spectrum Visualizer */}
            <div className="w-full max-w-xl flex flex-col items-center space-y-2">
              <canvas
                ref={canvasRef}
                width={520}
                height={48}
                className="w-full max-w-lg h-12 rounded-xl bg-slate-950/60 border border-cyan-500/20 shadow-inner"
              />
              <div className="flex items-center justify-between w-full max-w-lg text-[10px] font-mono text-slate-500 px-1">
                <span>32-CH OSCILLATOR FREQUENCY</span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  SYNTHESIZED HARMONICS ACTIVE
                </span>
                <span>60 FPS REALTIME</span>
              </div>
            </div>

            {/* Status & Live Speech Transcript Box */}
            <div className="space-y-2 w-full max-w-xl">
              <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold">
                {isListening ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Microphone Active • Bolo Sir, main sun raha hoon...
                  </span>
                ) : isSpeaking ? (
                  <span className="text-cyan-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    GYAAN GURU Speaking Response...
                  </span>
                ) : loading ? (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-spin"></span>
                    Processing Instant Forensic Solution...
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-2">
                    <span>Click orb or say <strong>"Hey Gyaan Guru"</strong> to ask any question</span>
                  </span>
                )}
              </div>

              {/* Real-Time Live Transcript Preview */}
              {liveTranscript && (
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 text-cyan-200 text-sm font-medium shadow-inner animate-fadeIn">
                  "{liveTranscript}"
                </div>
              )}
            </div>

            {/* Stop Speaking Button */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-5 py-2 rounded-full bg-red-950/90 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95"
              >
                <VolumeX className="w-4 h-4" />
                <span>Silence Voice</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2B. QUICK ACTION COMMAND CARDS GRID (MULTI-TOPIC OPEN SOURCE INTELLIGENCE) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        {[
          { label: '🏏 Sachin Tendulkar', command: 'Sachin Tendulkar ke baare me batao', icon: Activity, color: 'text-amber-400', border: 'border-amber-500/30' },
          { label: '🌌 Space Black Hole', command: 'Space me black hole kya hota hai?', icon: Globe, color: 'text-cyan-400', border: 'border-cyan-500/30' },
          { label: '💻 Python Binary Search', command: 'Python code for binary search', icon: Code, color: 'text-emerald-400', border: 'border-emerald-500/30' },
          { label: '🌿 Photosynthesis Bio', command: 'Photosynthesis process explain karo', icon: Flame, color: 'text-teal-400', border: 'border-teal-500/30' },
          { label: '🧮 Fast Math (25 × 48)', command: '25 * 48 kitna hota hai', icon: Zap, color: 'text-purple-400', border: 'border-purple-500/30' },
          { label: '📂 SFSL Active Cases', command: 'Active cases ka status batao', icon: Briefcase, color: 'text-rose-400', border: 'border-rose-500/30' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.command)}
              className={`p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border ${item.border} hover:scale-102 active:scale-95 transition-all text-left flex flex-col justify-between h-20 shadow-md group`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform`} />
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <span className="font-semibold text-slate-200 text-[11px] leading-tight line-clamp-2">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN CHAT AREA */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col h-[580px] overflow-hidden">
        {/* Chat History Messages Scroll Container */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-950/70">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white ring-1 ring-emerald-400/40'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4 space-y-2 shadow-lg text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-950/80 border border-cyan-700/60 text-cyan-100 rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 font-mono pb-1 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                      {msg.sender === 'user' ? (
                        user?.name || 'Forensic Officer'
                      ) : (
                        <>
                          <span className="text-cyan-300">GYAAN GURU FORENSIC AI</span>
                          <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[9px] font-mono flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                            {msg.executionTimeMs ? `${msg.executionTimeMs}ms` : '<10ms'}
                          </span>
                          {msg.modelUsed && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-950/90 border border-purple-500/40 text-purple-300 text-[9px] font-mono flex items-center gap-1">
                              <Cpu className="w-2.5 h-2.5 text-purple-400" />
                              {msg.modelUsed}
                            </span>
                          )}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Read Aloud Button for AI Messages */}
                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => {
                          if (currentlyPlayingId === msg.id) {
                            stopSpeaking();
                          } else {
                            speakText(msg.spokenAnswer || msg.text, msg.id);
                          }
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold flex items-center gap-1 transition-all ${
                          currentlyPlayingId === msg.id
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 hover:bg-slate-700 text-cyan-300'
                        }`}
                        title="Read this answer aloud"
                      >
                        {currentlyPlayingId === msg.id ? (
                          <>
                            <Volume2 className="w-3 h-3 animate-pulse" />
                            <span>Speaking...</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Voice Play</span>
                          </>
                        )}
                      </button>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Formatted Text Content */}
                <div className="space-y-1.5 font-sans text-xs">
                  {renderFormattedText(msg.text)}
                </div>

                {/* Voice Navigation Executed Pill */}
                {msg.navigateTab && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[11px] font-mono font-semibold flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Executed Voice Command: <strong className="uppercase text-cyan-200">{msg.navigateTab}</strong> Screen</span>
                    </span>
                  </div>
                )}

                {/* Action Navigation Buttons */}
                {msg.relatedActions && msg.relatedActions.length > 0 && (
                  <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">Quick Navigation:</span>
                    {msg.relatedActions.map((act, actIdx) => (
                      <button
                        key={actIdx}
                        onClick={() => handleActionClick(act.tab)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-[11px] font-semibold transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                      >
                        <span>{act.label}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-md mr-auto">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none p-3.5 bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
                <span>GENERATING INSTANT PERFECT FORENSIC SOLUTION...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 4. SUGGESTED PROMPT SHORTCUTS */}
        {suggestedQuestions.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2 whitespace-nowrap text-xs">
              <span className="text-[10px] text-slate-500 font-mono shrink-0">Quick Queries:</span>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 text-[11px] font-medium transition-all shrink-0 active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. CHAT INPUT BAR WITH MICROPHONE BUTTON */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800 space-y-2">
          {/* Active Conversational Memory Context Banner */}
          {activeContextTopic && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-slate-300 text-[11px] font-mono flex items-center justify-between animate-fadeIn">
              <span className="flex items-center gap-1.5 text-cyan-300 truncate">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Active Conversation Context:</span>
                <strong className="text-white bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/40 truncate max-w-xs">{activeContextTopic}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  lastTopicRef.current = '';
                  setActiveContextTopic('');
                }}
                className="text-[10px] text-slate-400 hover:text-red-300 transition-colors ml-2 shrink-0"
                title="Reset conversation context"
              >
                Clear Context ✕
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Direct Microphone Button on Input Bar */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl font-bold transition-all flex items-center justify-center shrink-0 active:scale-95 shadow-md ${
                isListening
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/40 animate-pulse'
                  : 'bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-cyan-500/40 hover:border-cyan-300'
              }`}
              title={isListening ? 'Stop listening' : 'Speak your question (Voice Input)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isListening
                    ? 'Listening to your voice... (Boliye...)'
                    : 'Ask any forensic question verbally or type in Hindi / English...'
                }
                disabled={loading}
                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all font-sans ${
                  isListening
                    ? 'border-emerald-400 ring-2 ring-emerald-500/30'
                    : 'border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForisSamadhaan;
