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
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  spokenAnswer?: string;
  category?: string;
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
      return <strong key={pIdx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800 font-mono text-[11px]">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const renderFormattedText = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-sm font-bold text-emerald-300 pt-1.5 pb-0.5 flex items-center gap-1.5">
          {line.replace('### ', '')}
        </h3>
      );
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const content = line.substring(2);
      return (
        <div key={idx} className="flex items-start gap-1.5 pl-2 text-slate-200">
          <span className="text-emerald-400 font-bold shrink-0">•</span>
          <span>{renderInlineMarkdown(content)}</span>
        </div>
      );
    }
    if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+\.)\s(.*)$/);
      if (match) {
        return (
          <div key={idx} className="flex items-start gap-1.5 pl-2 text-slate-200">
            <span className="text-cyan-400 font-bold font-mono text-[11px] shrink-0">{match[1]}</span>
            <span>{renderInlineMarkdown(match[2])}</span>
          </div>
        );
      }
    }
    if (line.trim() === '') {
      return <div key={idx} className="h-1.5" />;
    }
    return (
      <p key={idx} className="text-slate-200 leading-relaxed">
        {renderInlineMarkdown(line)}
      </p>
    );
  });
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

  const recognitionRef = useRef<any>(null);

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
  }, [voiceLang]);

  // Update recognition language when toggled
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = voiceLang;
    }
  }, [voiceLang]);

  // Natural Voice Text-to-Speech Speak Function
  const speakText = (text: string, messageId?: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Cancel any ongoing speech

    if (!text || text.trim().length === 0) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang;
    utterance.rate = 1.05; // natural swift tempo without dragging
    utterance.pitch = 1.0;

    // Try finding Indian English or Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang === voiceLang ||
        v.lang.startsWith(voiceLang.split('-')[0]) ||
        v.name.includes('India') ||
        v.name.includes('Hindi')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (messageId) setCurrentlyPlayingId(messageId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentlyPlayingId(null);
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
                spokenAnswer: `Namaste Officer ${user?.name || 'Abhiraj Singh'}. Main hoon FORIS SAMADHAAN. Aap mujhse kisi bhi forensic case, Section 65B certificate, ballistics, toxicology ya evidence issue ka instant solution pooch sakte hain.`,
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
            text: `नमस्ते ऑफिसर ${user?.name || 'Dr. Abhiraj Singh'}! 🙏\n\nWelcome to **FORIS SAMADHAAN (फॉरेंसिक समाधान)** — State Forensic Science Laboratory (SFSL) AI Legal & Technical Intelligence Core.\n\nMain aapki forensic investigation, digital evidence hashing (SHA-256), Section 65B/45 Indian Evidence Act compliance, Chain of Custody tracking, ya FORIS platform ke kisi bhi issue ka 100% accurate solution dene ke liye ready hoon. How can I assist you?`,
            spokenAnswer: `Namaste Officer. Welcome to FORIS SAMADHAAN AI. Main aapki forensic investigation aur legal compliance me help ke liye ready hoon.`,
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
        },
        body: JSON.stringify({ message: queryText }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsgId = `ai-${Date.now()}`;
        const aiMsg: Message = {
          id: aiMsgId,
          sender: 'ai',
          text: data.answer || 'Samadhaan resolution completed.',
          spokenAnswer: data.spokenAnswer,
          category: data.category,
          relatedActions: data.relatedActions,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

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
      {/* 1. SAMADHAAN OFFICIAL HEADER WITH VOICE TALK CONTROLS */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Logo and Core Identity */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-950 ring-2 ring-emerald-400/40">
                <Sparkles className="w-7 h-7" />
              </div>
              {isSpeaking && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 border-2 border-slate-950 animate-ping"></div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  FORIS SAMADHAAN (फॉरेंसिक समाधान)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  AI VOICE INTELLIGENCE
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                SFSL 24x7 Real-Time Voice & Legal Intelligence • Zero-Latency Voice Q&A
              </p>
            </div>
          </div>

          {/* Voice Talk Action Station */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Toggle Fullscreen Voice Talk HUD */}
            <button
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md active:scale-95 ${
                isVoiceMode
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-cyan-500/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400'
              }`}
            >
              <Radio className={`w-4 h-4 ${isVoiceMode ? 'animate-pulse' : ''}`} />
              <span>{isVoiceMode ? 'Exit Voice HUD' : '🎙️ Open Voice Talk HUD'}</span>
            </button>

            {/* Language Selector */}
            <button
              onClick={() => setVoiceLang(voiceLang === 'hi-IN' ? 'en-IN' : 'hi-IN')}
              className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
              title="Toggle Voice Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{voiceLang === 'hi-IN' ? '🇮🇳 Hindi / Hinglish' : '🌐 Indian English'}</span>
            </button>

            {/* Auto-Speak Toggle */}
            <button
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setAutoSpeak(!autoSpeak);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                autoSpeak
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
              title="Toggle Auto-Speaking Voice"
            >
              {autoSpeak ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span className="hidden sm:inline">{autoSpeak ? 'Voice Output ON' : 'Muted'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE HANDS-FREE VOICE TALK HUD (WHEN EXPANDED) */}
      {isVoiceMode && (
        <div className="rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/50 border-2 border-cyan-500/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fadeIn">
          {/* Audio Background Glow Effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto">
            {/* Live Visualizer Wave Ring & Mic Button */}
            <div className="relative">
              {/* Pulsing Aura Rings */}
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"></div>
                  <div className="absolute -inset-4 rounded-full border-2 border-emerald-400/40 animate-pulse"></div>
                  <div className="absolute -inset-8 rounded-full border border-cyan-400/20 animate-spin-slow"></div>
                </>
              )}

              {isSpeaking && (
                <>
                  <div className="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping"></div>
                  <div className="absolute -inset-4 rounded-full border-2 border-cyan-400/50 animate-pulse"></div>
                </>
              )}

              {/* Big Center Action Mic Orb */}
              <button
                onClick={toggleListening}
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-90 ${
                  isListening
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/50 scale-105 ring-4 ring-emerald-300'
                    : isSpeaking
                    ? 'bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white shadow-cyan-500/50 ring-4 ring-cyan-300 animate-pulse'
                    : 'bg-gradient-to-tr from-slate-800 to-slate-900 text-slate-200 border-2 border-slate-700 hover:border-cyan-400 hover:scale-105'
                }`}
              >
                {isListening ? (
                  <>
                    <Mic className="w-10 h-10 animate-bounce" />
                    <span className="text-[10px] font-mono font-black mt-1 uppercase">LISTENING...</span>
                  </>
                ) : isSpeaking ? (
                  <>
                    <Volume2 className="w-10 h-10 animate-pulse" />
                    <span className="text-[10px] font-mono font-black mt-1 uppercase">SPEAKING...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-10 h-10" />
                    <span className="text-[10px] font-mono font-bold mt-1 text-slate-400">TAP TO SPEAK</span>
                  </>
                )}
              </button>
            </div>

            {/* Status & Live Speech Transcript Box */}
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold">
                {isListening ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Microphone Active • Bolo main sun raha hoon...
                  </span>
                ) : isSpeaking ? (
                  <span className="text-cyan-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    Samadhaan Voice Speaking Answer...
                  </span>
                ) : loading ? (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-spin"></span>
                    Processing Instant Forensic Answer...
                  </span>
                ) : (
                  <span className="text-slate-400">
                    Click mic to ask any question verbally (Hindi / English)
                  </span>
                )}
              </div>

              {/* Real-Time Live Transcript Preview */}
              {liveTranscript && (
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/40 text-emerald-200 text-sm font-medium shadow-inner animate-fadeIn">
                  "{liveTranscript}"
                </div>
              )}
            </div>

            {/* Quick Stop Audio Button */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-4 py-1.5 rounded-full bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Speaking</span>
              </button>
            )}
          </div>
        </div>
      )}

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
                  <span className="font-bold text-white">
                    {msg.sender === 'user' ? user?.name || 'Forensic Officer' : 'FORIS SAMADHAAN AI'}
                  </span>
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
        <div className="p-3.5 bg-slate-900 border-t border-slate-800">
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
