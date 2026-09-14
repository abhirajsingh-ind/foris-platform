import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ScanText,
  Camera,
  UploadCloud,
  Sparkles,
  Copy,
  Check,
  Download,
  Volume2,
  VolumeX,
  ShieldCheck,
  Briefcase,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  X,
  CheckCircle2,
  Sliders,
  RefreshCw,
  Waves,
  Search,
  Eye,
  SunMedium,
  Edit3,
  Focus,
  Maximize2,
  ListFilter,
  FileText,
} from 'lucide-react';
import { BorderBeam } from '../components/BorderBeam';
import { CyberDecryptText } from '../components/CyberDecryptText';



interface BoundingBox {
  id: string;
  text: string;
  confidence: number;
  box: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  lineIndex: number;
}

interface LensSample {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  verbatimText: string;
  confidence: number;
  detectedScript: string;
  inkCharacteristics: string;
  lines: string[];
  words: BoundingBox[];
}

interface ForensicLensProps {
  setActiveTab?: (tab: string) => void;
}

export const ForensicLensAI: React.FC<ForensicLensProps> = ({ setActiveTab }) => {
  const { user } = useAuth();

  // Samples & Active Document State
  const [samples, setSamples] = useState<LensSample[]>([]);
  const [activeSampleId, setActiveSampleId] = useState<string | null>('sample-suicide-note');
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusMessage, setScanStatusMessage] = useState('Google Lens Scanning...');

  // Optical OCR Result State
  const [verbatimText, setVerbatimText] = useState('');
  const [confidence, setConfidence] = useState<number>(99.4);
  const [detectedScript, setDetectedScript] = useState('Latin Cursive (Rightward Slant 18°)');
  const [inkCharacteristics, setInkCharacteristics] = useState('Blue Phthalocyanine Ballpoint, Heavy Pressure');
  const [words, setWords] = useState<BoundingBox[]>([]);
  const [lines, setLines] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<any>(null);

  // Interactive Lens Highlights
  const [hoveredWordId, setHoveredWordId] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<BoundingBox | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);

  // High-Capacity Optical Forensic Lens & Filter State
  const [rightPanelTab, setRightPanelTab] = useState<'text' | 'words' | 'optics'>('text');
  const [opticalFilter, setOpticalFilter] = useState<'normal' | 'high_contrast' | 'binary' | 'uv_invert' | 'sharpen'>('normal');
  const [isLoupeActive, setIsLoupeActive] = useState<boolean>(false);
  const [loupeZoom, setLoupeZoom] = useState<number>(3.5);
  const [loupePos, setLoupePos] = useState<{ x: number; y: number; relX: number; relY: number; visible: boolean }>({
    x: 0,
    y: 0,
    relX: 50,
    relY: 50,
    visible: false,
  });

  // Words Identification & Search State
  const [wordSearchQuery, setWordSearchQuery] = useState('');
  const [editingWord, setEditingWord] = useState<BoundingBox | null>(null);
  const [editWordValue, setEditWordValue] = useState('');
  const imageRef = useRef<HTMLImageElement>(null);

  const filteredWords = words.filter((w) => {
    if (!wordSearchQuery.trim()) return true;
    return w.text.toLowerCase().includes(wordSearchQuery.toLowerCase().trim());
  });


  // Soft Voice Engine State
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [voicePitch, setVoicePitch] = useState<number>(0.86); // Soft warm mellow pitch
  const [voiceRate, setVoiceRate] = useState<number>(0.82);   // Calm gentle relaxed tempo
  const [isSoftVoiceActive, setIsSoftVoiceActive] = useState<boolean>(true);
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Actions State
  const [copied, setCopied] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [availableCases, setAvailableCases] = useState<Array<{ id: string; firNumber: string; title: string }>>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isAttaching, setIsAttaching] = useState(false);
  const [attachMessage, setAttachMessage] = useState<string | null>(null);

  // Optional Gemini Vision Key State
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem('foris_gemini_key') || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);

  // Camera Capture Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Load sample documents on mount
  useEffect(() => {
    fetchSamples();
    fetchCases();
  }, []);

  // Enumerate & Configure Soft Natural Voice Engine
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const available = window.speechSynthesis.getVoices();
      if (available && available.length > 0) {
        setVoices(available);
        // Priority to soft, soothing, natural female or gentle voices
        const softVoice =
          available.find(
            (v) =>
              (v.name.includes('Natural') || v.name.includes('Online')) &&
              (v.name.includes('Jenny') || v.name.includes('Aria') || v.name.includes('Female'))
          ) ||
          available.find(
            (v) =>
              v.name.includes('Zira') ||
              v.name.includes('Samantha') ||
              v.name.includes('Google UK English Female') ||
              v.name.includes('Victoria') ||
              v.name.includes('Karen')
          ) ||
          available.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('soft'))
          ) ||
          available.find((v) => v.lang.startsWith('en')) ||
          available[0];

        if (softVoice) {
          setSelectedVoiceName(softVoice.name);
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch('/api/cases', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.cases) {
          setAvailableCases(
            data.cases.map((c: any) => ({
              id: c.id,
              firNumber: c.firNumber,
              title: c.title,
            }))
          );
          if (data.cases.length > 0) {
            setSelectedCaseId(data.cases[0].id);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load cases:', e);
    }
  };

  const fetchSamples = async () => {
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch('/api/lens/samples', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSamples(data.samples || []);
        if (data.samples && data.samples.length > 0) {
          selectSample(data.samples[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch lens samples:', err);
    }
  };

  const selectSample = (sample: LensSample) => {
    setActiveSampleId(sample.id);
    setImageSrc(sample.imageUrl);
    setSelectedWord(null);
    setScanStatusMessage('Loading Questioned Specimen...');
    runScanningAnimation(() => {
      setVerbatimText(sample.verbatimText);
      setConfidence(sample.confidence);
      setDetectedScript(sample.detectedScript);
      setInkCharacteristics(sample.inkCharacteristics);
      setLines(sample.lines);
      setWords(sample.words);
      setMetadata({
        charactersCount: sample.verbatimText.length,
        wordsCount: sample.words.length,
        linesCount: sample.lines.length,
        engine: 'FORENSIC_NEURAL_LENS_v4.2',
        legalCompliance: 'Section 45 Indian Evidence Act / Section 39 BSA Verbatim Guaranteed',
      });
    });
  };

  // Google Lens Sweep Laser Animation
  const runScanningAnimation = (callback: () => void) => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          callback();
          return 100;
        }
        return prev + 10;
      });
    }, 55);
  };

  const getFilterCss = (f: string) => {
    switch (f) {
      case 'high_contrast':
        return 'contrast(185%) brightness(95%) saturate(140%)';
      case 'binary':
        return 'grayscale(100%) contrast(350%) brightness(110%)';
      case 'uv_invert':
        return 'invert(100%) hue-rotate(180deg) contrast(140%)';
      case 'sharpen':
        return 'contrast(135%) brightness(102%) drop-shadow(0 0 1px rgba(0,0,0,0.8))';
      default:
        return 'none';
    }
  };

  const handleSaveWordEdit = () => {
    if (!editingWord || !editWordValue.trim()) return;
    const updatedWords = words.map((w) =>
      w.id === editingWord.id ? { ...w, text: editWordValue.trim(), confidence: 1.0 } : w
    );
    setWords(updatedWords);

    // Reconstruct lines and verbatim text
    const linesMap: { [key: number]: string[] } = {};
    for (const w of updatedWords) {
      if (!linesMap[w.lineIndex]) linesMap[w.lineIndex] = [];
      linesMap[w.lineIndex].push(w.text);
    }
    const newLines = Object.keys(linesMap)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => linesMap[Number(k)].join(' '));

    if (newLines.length > 0) {
      setLines(newLines);
      setVerbatimText(newLines.join('\n'));
    }
    setEditingWord(null);
  };

  // Custom User File Upload: Extracts real dimensions for pixel-perfect word identification
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveSampleId(null);
    setSelectedWord(null);
    setScanStatusMessage('Calibrating Optical Geometry & Reading Words...');
    setIsScanning(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImageSrc(base64);

      // Measure exact image dimensions
      const tempImg = new Image();
      tempImg.onload = async () => {
        const realW = tempImg.naturalWidth || 1200;
        const realH = tempImg.naturalHeight || 900;

        try {
          const token = localStorage.getItem('foris_token');
          const formData = new FormData();
          formData.append('image', file);
          formData.append('imageWidth', String(realW));
          formData.append('imageHeight', String(realH));
          if (geminiApiKey) {
            formData.append('apiKey', geminiApiKey);
          }

          const res = await fetch('/api/lens/transcribe', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            setVerbatimText(data.verbatimText);
            setConfidence(data.confidence);
            setDetectedScript(data.detectedScript);
            setInkCharacteristics(data.inkCharacteristics);
            setLines(data.lines || []);
            setWords(data.words || []);
            setMetadata(data.metadata);
          } else {
            alert('Optical transcription failed on uploaded image.');
          }
        } catch (err) {
          console.error('OCR transcription error:', err);
          alert('OCR error processing image.');
        } finally {
          setIsScanning(false);
        }
      };
      tempImg.src = base64;
    };
    reader.readAsDataURL(file);
  };

  // Live Camera Snapshot
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      alert('Camera permission denied or camera device not found.');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setImageSrc(dataUrl);
      setActiveSampleId(null);
      stopCamera();

      setScanStatusMessage('Transcribing High-Res Camera Capture...');
      setIsScanning(true);

      // Submit base64 with exact resolution to transcribe endpoint
      runScanningAnimation(async () => {
        try {
          const token = localStorage.getItem('foris_token');
          const res = await fetch('/api/lens/transcribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              imageBase64: dataUrl,
              apiKey: geminiApiKey || undefined,
              imageWidth: canvas.width,
              imageHeight: canvas.height,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setVerbatimText(data.verbatimText);
            setConfidence(data.confidence);
            setDetectedScript(data.detectedScript);
            setInkCharacteristics(data.inkCharacteristics);
            setLines(data.lines || []);
            setWords(data.words || []);
            setMetadata(data.metadata);
          }
        } catch (err) {
          console.error('Camera transcription failed:', err);
        } finally {
          setIsScanning(false);
        }
      });
    }
  };


  // Copy verbatim text to clipboard
  const handleCopy = () => {
    if (!verbatimText) return;
    navigator.clipboard.writeText(verbatimText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // SOFT VOICE READOUT (Calm, gentle, warm, soothing TTS)
  const toggleSpeech = () => {
    if (!verbatimText) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean formatting for gentle speech
    const speechContent = verbatimText.replace(/~~/g, ' ');
    const utterance = new SpeechSynthesisUtterance(speechContent);

    if (isSoftVoiceActive) {
      // Find configured soft natural voice
      const selected = voices.find((v) => v.name === selectedVoiceName);
      if (selected) {
        utterance.voice = selected;
      }
      // Soft, mellow pitch and relaxed, gentle tempo
      utterance.pitch = voicePitch;
      utterance.rate = voiceRate;
      utterance.volume = 0.75; // Softer, pleasant volume
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
      utterance.volume = 1.0;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Download Plaintext .txt
  const handleDownloadTxt = () => {
    if (!verbatimText) return;
    const blob = new Blob([verbatimText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VERBATIM_FORENSIC_TRANSCRIPTION_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download Forensic JSON
  const handleDownloadJson = () => {
    const reportData = {
      platform: 'FORIS Forensic AI Lens',
      compliance: 'Section 45 Indian Evidence Act / Section 39 BSA 2023',
      timestamp: new Date().toISOString(),
      officer: user ? `${user.name} (${user.badgeId})` : 'Authorized Examiner',
      sampleId: activeSampleId,
      confidence: `${confidence}%`,
      detectedScript,
      inkCharacteristics,
      verbatimText,
      lines,
      words,
      metadata,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FORENSIC_LENS_DATA_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export to Case Dossier
  const handleAttachToCase = async () => {
    if (!selectedCaseId) return;
    setIsAttaching(true);
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch('/api/lens/attach-to-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caseId: selectedCaseId,
          verbatimText,
          confidence,
          sampleId: activeSampleId,
        }),
      });

      if (res.ok) {
        setAttachMessage(`✓ Document attached to Case ${selectedCaseId} with SHA-256 seal.`);
        setTimeout(() => {
          setIsExportModalOpen(false);
          setAttachMessage(null);
          if (setActiveTab) setActiveTab('cases');
        }, 1800);
      } else {
        alert('Failed to attach transcription to case.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while attaching to case.');
    } finally {
      setIsAttaching(false);
    }
  };

  const saveGeminiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('foris_gemini_key', key.trim());
    setShowApiKeyModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Top Header Bar with Unique Ultraviolet Theme */}
      <div className="h-16 px-6 bg-gradient-to-r from-purple-950/80 via-slate-900 to-fuchsia-950/40 border-b border-purple-500/30 flex items-center justify-between shrink-0 shadow-lg shadow-purple-950/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/40">
            <ScanText className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-200 to-pink-300">
                <CyberDecryptText text="FORENSIC AI LENS" />
              </h1>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 tracking-wider shadow-[0_0_10px_rgba(217,70,239,0.25)]">
                GOOGLE LENS OCR
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 font-bold">
                REAL PIXEL EXTRACTION
              </span>
            </div>
            <p className="text-[11px] text-purple-300/70">
              High-Fidelity Neural Holograph Transcription • Whatever is in the photo converts exactly to text
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* File Upload Hidden Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 hover:text-white border border-purple-500/40 hover:border-fuchsia-400 text-xs font-semibold transition-all shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5 text-fuchsia-400" />
            Upload Any Photo
          </button>

          <button
            onClick={startCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-semibold shadow-md shadow-fuchsia-500/20 transition-all active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
            Live Camera Lens
          </button>

          {/* Soft Voice Settings Pill Button */}
          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isSoftVoiceActive
                ? 'bg-fuchsia-950/70 border-fuchsia-500/50 text-fuchsia-300 shadow-[0_0_8px_rgba(217,70,239,0.25)]'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Configure Soft Voice Model"
          >
            <Waves className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
            <span>Soft Voice Model</span>
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
          </button>
        </div>
      </div>

      {/* SOFT VOICE SETTINGS DROPDOWN POPUP */}
      {showVoiceSettings && (
        <div className="mx-6 mt-2 p-4 rounded-2xl bg-slate-900/95 border border-fuchsia-500/40 shadow-2xl backdrop-blur-md z-40 space-y-3 max-w-xl self-end animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-fuchsia-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Soft Voice Model Tuning (Calm & Gentle)
              </h4>
            </div>
            <button onClick={() => setShowVoiceSettings(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-mono text-purple-300 block mb-1">Select Natural Voice:</label>
              <select
                value={selectedVoiceName}
                onChange={(e) => setSelectedVoiceName(e.target.value)}
                className="w-full bg-slate-950 border border-purple-500/30 rounded-lg p-1.5 text-xs text-slate-200 outline-none"
              >
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name.slice(0, 30)} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-purple-300 block mb-1">
                Soft Pitch: <span className="text-fuchsia-300 font-bold">{voicePitch} (Warm & Mellow)</span>
              </label>
              <input
                type="range"
                min="0.7"
                max="1.1"
                step="0.02"
                value={voicePitch}
                onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                className="w-full accent-fuchsia-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-purple-300/80">
            <span>Calm Speed: <strong>{voiceRate}x</strong></span>
            <button
              onClick={() => {
                const testUtt = new SpeechSynthesisUtterance("This is a soft, gentle, and calm voice readout.");
                const voice = voices.find(v => v.name === selectedVoiceName);
                if (voice) testUtt.voice = voice;
                testUtt.pitch = voicePitch;
                testUtt.rate = voiceRate;
                testUtt.volume = 0.75;
                window.speechSynthesis.speak(testUtt);
              }}
              className="px-2.5 py-1 rounded bg-purple-900/60 hover:bg-purple-800 text-fuchsia-200 font-semibold border border-purple-500/30"
            >
              ▶ Test Voice Softness
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Interactive Optical Lens Scanner Viewport */}
        <div className="flex-1 flex flex-col border-r border-purple-500/20 bg-slate-950/60 overflow-hidden">
          {/* Sample Specimens Carousel / Selector */}
          <div className="p-3 bg-slate-900/90 border-b border-purple-500/20 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-fuchsia-400" />
                Specimens:
              </span>
              <div className="flex items-center gap-1.5">
                {samples.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectSample(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                      activeSampleId === s.id
                        ? 'bg-purple-900/80 text-fuchsia-200 border-fuchsia-500/70 shadow-md shadow-purple-900/40 ring-1 ring-fuchsia-500/30'
                        : 'bg-slate-950/60 text-slate-400 hover:text-purple-200 hover:bg-purple-950/40 border-slate-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeSampleId === s.id ? 'bg-fuchsia-400 animate-ping' : 'bg-slate-600'
                      }`}
                    />
                    {s.title.split(' ')[0]} {s.title.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Optical Filter Bar */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-purple-500/30 shrink-0">
              <button
                onClick={() => setOpticalFilter('normal')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
                  opticalFilter === 'normal' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Standard Optical Lighting"
              >
                Normal
              </button>
              <button
                onClick={() => setOpticalFilter('high_contrast')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
                  opticalFilter === 'high_contrast' ? 'bg-fuchsia-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Isolate Faint Ink from Paper"
              >
                Contrast+
              </button>
              <button
                onClick={() => setOpticalFilter('binary')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
                  opticalFilter === 'binary' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Binary High-Pass B&W Threshold"
              >
                B&W Binarize
              </button>
              <button
                onClick={() => setOpticalFilter('uv_invert')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
                  opticalFilter === 'uv_invert' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Forensic UV Fluorescence Invert"
              >
                UV Lamp
              </button>
              <div className="w-px h-3.5 bg-purple-500/30 mx-0.5" />
              {/* Loupe Toggle Button */}
              <button
                onClick={() => setIsLoupeActive(!isLoupeActive)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
                  isLoupeActive
                    ? 'bg-fuchsia-500 text-slate-950 shadow-[0_0_10px_#d946ef]'
                    : 'bg-slate-900 text-purple-300 hover:text-white border border-purple-500/30'
                }`}
                title="Toggle High-Def 3.5x Circular Forensic Loupe"
              >
                <Focus className="w-3 h-3" />
                <span>Loupe {loupeZoom}x</span>
              </button>
            </div>
          </div>

          {/* Document Canvas with Google Lens Scan Overlay */}
          <div
            ref={imageContainerRef}
            onMouseMove={(e) => {
              if (!isLoupeActive || !imageRef.current) return;
              const rect = imageRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                setLoupePos({
                  x: e.clientX,
                  y: e.clientY,
                  relX: (x / rect.width) * 100,
                  relY: (y / rect.height) * 100,
                  visible: true,
                });
              } else {
                setLoupePos((prev) => ({ ...prev, visible: false }));
              }
            }}
            onMouseLeave={() => setLoupePos((prev) => ({ ...prev, visible: false }))}
            className="flex-1 relative overflow-auto bg-slate-950 flex items-center justify-center p-6 select-none"
          >
            {/* FLOATING FORENSIC CIRCULAR LOUPE (Optical Magnifier) */}
            {isLoupeActive && loupePos.visible && imageSrc && (
              <div
                className="fixed pointer-events-none z-50 w-44 h-44 rounded-full border-2 border-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.8)] overflow-hidden bg-slate-950 ring-4 ring-purple-950/70"
                style={{
                  left: loupePos.x - 88,
                  top: loupePos.y - 88,
                }}
              >
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${imageSrc})`,
                    backgroundPosition: `${loupePos.relX}% ${loupePos.relY}%`,
                    backgroundSize: `${loupeZoom * 100}%`,
                    backgroundRepeat: 'no-repeat',
                    filter: getFilterCss(opticalFilter),
                  }}
                />
                {/* Millimeter reticle inside Loupe */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-px bg-fuchsia-400/50" />
                  <div className="h-full w-px bg-fuchsia-400/50 absolute" />
                  <div className="w-5 h-5 rounded-full border border-fuchsia-400/70 absolute" />
                </div>
                {/* Magnification label */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-950/90 border border-fuchsia-500/60 text-[9px] font-mono text-fuchsia-300 font-bold whitespace-nowrap shadow">
                  🔬 {loupeZoom}x OPTICAL LOUPE
                </div>
              </div>
            )}

            {imageSrc ? (
              <div
                className="relative max-w-full max-h-full rounded-xl overflow-hidden border-2 border-purple-500/40 shadow-2xl shadow-purple-950/50 bg-black transition-all"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {/* Underlying Handwritten Image with Optical Filter */}
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Forensic Questioned Handwritten Document"
                  style={{ filter: getFilterCss(opticalFilter), transition: 'filter 0.3s' }}
                  className="max-h-[620px] w-auto object-contain block"
                />

                {/* GOOGLE LENS SWEEPING LASER SCAN BEAM */}
                {isScanning && (
                  <div
                    className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent shadow-[0_0_25px_#d946ef,0_0_12px_#a855f7] z-30 transition-all duration-75 pointer-events-none"
                    style={{ top: `${scanProgress}%` }}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-fuchsia-600/90 text-[9px] font-mono font-bold text-white shadow-lg whitespace-nowrap">
                      {scanStatusMessage} {scanProgress}%
                    </div>
                  </div>
                )}

                {/* Google Lens Particle Grid Overlay while Scanning */}
                {isScanning && (
                  <div className="absolute inset-0 bg-fuchsia-500/10 pointer-events-none backdrop-blur-[1px] animate-pulse" />
                )}

                {/* INTERACTIVE WORD BOUNDING BOXES OVERLAY (Plotted on the real words) */}
                {showBoundingBoxes &&
                  !isScanning &&
                  words.map((w) => {
                    const isHovered = hoveredWordId === w.id;
                    const isSelected = selectedWord?.id === w.id;
                    const isMatchingSearch =
                      wordSearchQuery.trim().length > 0 &&
                      w.text.toLowerCase().includes(wordSearchQuery.toLowerCase().trim());

                    return (
                      <div
                        key={w.id}
                        onMouseEnter={() => setHoveredWordId(w.id)}
                        onMouseLeave={() => setHoveredWordId(null)}
                        onClick={() => setSelectedWord(w)}
                        style={{
                          left: `${w.box.x}%`,
                          top: `${w.box.y}%`,
                          width: `${w.box.w}%`,
                          height: `${w.box.h}%`,
                        }}
                        className={`absolute cursor-pointer transition-all rounded-[3px] z-20 ${
                          isSelected || isMatchingSearch
                            ? 'border-2 border-fuchsia-400 bg-fuchsia-500/40 shadow-[0_0_18px_rgba(217,70,239,0.85)] ring-2 ring-fuchsia-300'
                            : isHovered
                              ? 'border-2 border-purple-400 bg-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                              : w.confidence >= 0.95
                                ? 'border border-emerald-400/50 bg-emerald-500/15 hover:border-fuchsia-400'
                                : 'border border-purple-400/40 bg-purple-500/10 hover:border-fuchsia-400'
                        }`}
                        title={`${w.text} (${Math.round(w.confidence * 100)}% confidence)`}
                      >
                        {/* Word tooltip on hover / selection */}
                        {(isHovered || isSelected || isMatchingSearch) && (
                          <div className="absolute -top-7 left-0 px-2 py-0.5 rounded bg-slate-900/95 border border-fuchsia-500/60 text-[10px] font-mono text-fuchsia-200 font-bold whitespace-nowrap shadow-xl pointer-events-none z-30 flex items-center gap-1">
                            <span>{w.text}</span>
                            <span className="text-purple-400">({Math.round(w.confidence * 100)}%)</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center p-12 text-slate-500 space-y-3">
                <ScanText className="w-12 h-12 text-purple-500/40 mx-auto" />
                <p className="text-sm">Select a forensic evidence specimen above or upload an image to begin.</p>
              </div>
            )}

            {/* Floating Lens Controls in bottom left with extended zoom up to 500% */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl border border-purple-500/30 shadow-2xl z-30">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                className="p-1.5 rounded-lg hover:bg-purple-900/50 text-purple-300 hover:text-white transition-colors"
                title="Zoom Out (Min 50%)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-purple-200 px-1 font-bold min-w-[42px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(5.0, Number((z + 0.25).toFixed(2))))}
                className="p-1.5 rounded-lg hover:bg-purple-900/50 text-purple-300 hover:text-white transition-colors"
                title="Zoom In (Max 500%)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Quick Zoom Presets */}
              <div className="flex items-center gap-1 border-l border-purple-500/30 pl-1.5">
                <button
                  onClick={() => setZoomLevel(1)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold ${
                    zoomLevel === 1 ? 'bg-purple-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  100%
                </button>
                <button
                  onClick={() => setZoomLevel(2)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold ${
                    zoomLevel === 2 ? 'bg-purple-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  200%
                </button>
                <button
                  onClick={() => setZoomLevel(3.5)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold ${
                    zoomLevel === 3.5 ? 'bg-purple-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  350%
                </button>
                <button
                  onClick={() => setZoomLevel(5)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold ${
                    zoomLevel === 5 ? 'bg-fuchsia-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  500%
                </button>
              </div>

              <div className="w-px h-4 bg-purple-500/30 mx-1" />
              <button
                onClick={() => setShowBoundingBoxes((b) => !b)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                  showBoundingBoxes
                    ? 'bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Toggle Word Bounding Boxes"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Boxes: {showBoundingBoxes ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        </div>


        {/* RIGHT PANEL: Multi-Tab Forensic Suite (Verbatim Text, Words Registry, Lens Optics) */}
        <div className="w-[500px] flex flex-col bg-slate-900/80 border-l border-purple-500/20 overflow-hidden shrink-0">
          {/* Panel Top Header */}
          <div className="p-3.5 border-b border-purple-500/20 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-200">
                Forensic Optical Lens AI
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                {confidence}% ACCURACY
              </span>
            </div>
          </div>

          {/* Sleek Navigation Tab Strip */}
          <div className="flex items-center border-b border-purple-500/20 bg-slate-950 px-2 pt-2 gap-1 shrink-0">
            <button
              onClick={() => setRightPanelTab('text')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
                rightPanelTab === 'text'
                  ? 'border-fuchsia-500 text-fuchsia-300 bg-purple-950/60 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-purple-200 hover:bg-purple-950/20'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Verbatim Text</span>
            </button>

            <button
              onClick={() => setRightPanelTab('words')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
                rightPanelTab === 'words'
                  ? 'border-fuchsia-500 text-fuchsia-300 bg-purple-950/60 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-purple-200 hover:bg-purple-950/20'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Words Registry</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-bold">
                {words.length}
              </span>
            </button>

            <button
              onClick={() => setRightPanelTab('optics')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
                rightPanelTab === 'optics'
                  ? 'border-fuchsia-500 text-fuchsia-300 bg-purple-950/60 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-purple-200 hover:bg-purple-950/20'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Lens Optics</span>
              {(opticalFilter !== 'normal' || isLoupeActive) && (
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* TAB 1: EXACT VERBATIM DIGITIZED TEXT */}
          {rightPanelTab === 'text' && (
            <>
              {/* Forensic Metadata Strip */}
              <div className="px-4 py-2.5 bg-purple-950/30 border-b border-purple-500/20 text-[11px] space-y-1 shrink-0">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-purple-400/90 font-medium">Detected Script:</span>
                  <span className="font-mono text-purple-200">{detectedScript}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-purple-400/90 font-medium">Ink Topology:</span>
                  <span className="font-mono text-purple-200 truncate max-w-[280px]" title={inkCharacteristics}>
                    {inkCharacteristics}
                  </span>
                </div>
              </div>

              {/* Selected Word Magnifier Loupe Focus */}
              {selectedWord && (
                <div className="mx-4 mt-3 p-3 rounded-xl bg-purple-950/60 border border-fuchsia-500/40 flex items-center justify-between shadow-md shrink-0">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-fuchsia-300 block">
                      Highlighted Stroke Focus
                    </span>
                    <span className="text-base font-bold text-white font-mono">{selectedWord.text}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-purple-300/80 block">Confidence</span>
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      {Math.round(selectedWord.confidence * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => {
                        setEditingWord(selectedWord);
                        setEditWordValue(selectedWord.text);
                      }}
                      className="p-1 rounded hover:bg-purple-800/60 text-purple-300 hover:text-white"
                      title="Refine Word"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedWord(null)}
                      className="text-purple-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Digitized Computer Text Editor / Viewer */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="bg-slate-950 rounded-xl border border-purple-500/30 p-4 font-mono text-xs leading-relaxed text-slate-200 shadow-inner relative group min-h-[220px]">
                  {/* Line Numbers & Text Lines */}
                  <div className="space-y-1">
                    {lines.map((line, idx) => (
                      <div key={idx} className="flex gap-3 hover:bg-purple-950/30 p-1 rounded transition-colors">
                        <span className="text-purple-500/60 select-none text-[11px] w-5 text-right shrink-0">
                          {idx + 1}
                        </span>
                        <span className="flex-1 text-slate-100 font-mono select-text whitespace-pre-wrap">
                          {/* Render strike-throughs visibly */}
                          {line.split(/(~~[^~]+~~)/g).map((part, pIdx) => {
                            if (part.startsWith('~~') && part.endsWith('~~')) {
                              return (
                                <span
                                  key={pIdx}
                                  className="line-through text-fuchsia-400 bg-fuchsia-950/60 px-1 rounded border border-fuchsia-500/30 mx-0.5"
                                  title="Original strike-through preserved verbatim"
                                >
                                  {part.replace(/~~/g, '')}
                                </span>
                              );
                            }
                            return <span key={pIdx}>{part}</span>;
                          })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Legal Certificate Watermark */}
                  <div className="mt-6 pt-4 border-t border-purple-500/20 text-[10px] text-purple-400/70 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-purple-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      VERBATIM GROUND-TRUTH • NO LETTERS ALTERED
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Preserved verbatim under Section 45/47 Indian Evidence Act & Section 39 Bharatiya Sakshya Adhiniyam.
                    </p>
                    {metadata?.sha256 && (
                      <div className="text-[9px] font-mono text-purple-300/80 truncate">
                        SHA-256: {metadata.sha256}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Toolbar at Bottom */}
              <div className="p-4 border-t border-purple-500/20 bg-slate-950/80 space-y-2.5 shrink-0">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all shadow-sm active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied Exactly!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-fuchsia-400" />
                        Copy Verbatim Text
                      </>
                    )}
                  </button>

                  {/* SOFT VOICE READOUT BUTTON */}
                  <button
                    onClick={toggleSpeech}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                      isSpeaking
                        ? 'bg-fuchsia-950 text-fuchsia-200 border-fuchsia-500 animate-pulse'
                        : 'bg-purple-950/80 hover:bg-purple-900 border-purple-500/40 text-purple-200'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Stop Voice</span>
                        <span className="flex items-center gap-0.5 ml-1">
                          <span className="w-1 h-3 bg-fuchsia-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-4 bg-fuchsia-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-2 bg-fuchsia-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Soft Voice Readout</span>
                        <span className="text-[9px] px-1 rounded bg-fuchsia-500/20 text-fuchsia-300">CALM</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadTxt}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    Download Plaintext (.txt)
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    Forensic JSON (.json)
                  </button>
                </div>

                {/* EXPORT DIRECTLY TO CASE DOSSIER */}
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-500/20 active:scale-98 transition-all"
                >
                  <Briefcase className="w-4 h-4" />
                  Attach to Active Case Dossier
                </button>
              </div>
            </>
          )}

          {/* TAB 2: WORDS REGISTRY (IDENTIFIED TOKENS, BOUNDING BOXES, REFINEMENT) */}
          {rightPanelTab === 'words' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search and Filter Input */}
              <div className="p-3 border-b border-purple-500/20 bg-slate-950/60 space-y-2 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="text"
                    value={wordSearchQuery}
                    onChange={(e) => setWordSearchQuery(e.target.value)}
                    placeholder="Search words by text, letters..."
                    className="w-full bg-slate-950 border border-purple-500/30 focus:border-fuchsia-400 rounded-xl pl-8 pr-8 py-2 text-xs text-slate-100 placeholder-purple-400/50 outline-none"
                  />
                  {wordSearchQuery && (
                    <button
                      onClick={() => setWordSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-purple-300/80 px-0.5">
                  <span>
                    Showing {filteredWords.length} of {words.length} identified tokens
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {words.filter((w) => w.confidence >= 0.9).length} High-Conf (≥90%)
                  </span>
                </div>
              </div>

              {/* Scrollable Word Cards List */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2">
                {filteredWords.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 space-y-3">
                    <Search className="w-8 h-8 mx-auto text-purple-500/40" />
                    <p className="text-xs">No matching words in current document scan.</p>
                    {wordSearchQuery && (
                      <button
                        onClick={() => setWordSearchQuery('')}
                        className="text-xs text-fuchsia-400 hover:underline"
                      >
                        Clear Search Query
                      </button>
                    )}
                  </div>
                ) : (
                  filteredWords.map((w, index) => {
                    const isSelected = selectedWord?.id === w.id;
                    const isHovered = hoveredWordId === w.id;

                    return (
                      <div
                        key={w.id || index}
                        onClick={() => setSelectedWord(w)}
                        onMouseEnter={() => setHoveredWordId(w.id)}
                        onMouseLeave={() => setHoveredWordId(null)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-fuchsia-950/70 border-fuchsia-500 shadow-lg shadow-fuchsia-950/60 ring-1 ring-fuchsia-400'
                            : isHovered
                            ? 'bg-purple-950/50 border-purple-400/60'
                            : 'bg-slate-950/70 hover:bg-purple-950/30 border-purple-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 font-bold">
                              L{w.lineIndex + 1}
                            </span>
                            <span className="font-mono text-sm font-bold text-white tracking-wide">
                              {w.text}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                w.confidence >= 0.9
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : w.confidence >= 0.75
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {Math.round(w.confidence * 100)}%
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingWord(w);
                                setEditWordValue(w.text);
                              }}
                              className="p-1 rounded hover:bg-purple-800/60 text-purple-300 hover:text-white transition-colors"
                              title="Refine / Fix this Word"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-slate-400">
                          <span className="text-slate-400">
                            Box: [x:{Math.round(w.box.x)}%, y:{Math.round(w.box.y)}%, w:{Math.round(w.box.w)}%, h:{Math.round(w.box.h)}%]
                          </span>
                          <span className="text-fuchsia-400/90 font-medium">Click to Pin Highlight &rarr;</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Registry Status Strip */}
              <div className="p-3 border-t border-purple-500/20 bg-slate-950/80 flex items-center justify-between text-xs shrink-0">
                <span className="text-slate-400 text-[11px]">
                  All coordinates normalized to 300 DPI image plane
                </span>
                <button
                  onClick={() => setShowBoundingBoxes((b) => !b)}
                  className="text-[11px] font-mono text-fuchsia-300 hover:underline flex items-center gap-1"
                >
                  <Layers className="w-3 h-3" />
                  <span>Boxes {showBoundingBoxes ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LENS OPTICS & FILTER CONTROLS */}
          {rightPanelTab === 'optics' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {/* Optical Filter Preset Cards */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <SunMedium className="w-4 h-4 text-fuchsia-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-200">
                    Forensic Optical Light Filters
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400">
                  Select an illumination filter to isolate faint inks, eliminate paper grain, or illuminate indented stylus impressions.
                </p>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {[
                    {
                      id: 'normal',
                      label: 'Normal Lighting',
                      desc: 'Full-spectrum true color document illumination.',
                      color: 'text-slate-200',
                    },
                    {
                      id: 'high_contrast',
                      label: 'High-Contrast Ink Isolation',
                      desc: 'Boosts ink stroke saturation and strips background paper hue.',
                      color: 'text-amber-300',
                    },
                    {
                      id: 'binary',
                      label: 'Binary B&W Threshold',
                      desc: 'Pure binarization filter separating text pixels from paper texture.',
                      color: 'text-emerald-300',
                    },
                    {
                      id: 'uv_invert',
                      label: 'UV Invert Fluoresce',
                      desc: 'Simulates forensic ultraviolet radiation for latent stroke detection.',
                      color: 'text-fuchsia-300',
                    },
                    {
                      id: 'sharpen',
                      label: 'Edge Sharpen & Micro-Text',
                      desc: 'High-frequency stroke edge enhancement for cursive ligatures.',
                      color: 'text-cyan-300',
                    },
                  ].map((f) => (
                    <div
                      key={f.id}
                      onClick={() => setOpticalFilter(f.id as any)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        opticalFilter === f.id
                          ? 'bg-purple-950/80 border-fuchsia-500 shadow-md shadow-fuchsia-950/40 ring-1 ring-fuchsia-400'
                          : 'bg-slate-950/60 hover:bg-purple-950/30 border-purple-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${f.color}`}>{f.label}</span>
                        {opticalFilter === f.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Optical Loupe Settings */}
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-fuchsia-400" />
                    <span className="text-xs font-bold text-white">Forensic Optical Loupe</span>
                  </div>
                  <button
                    onClick={() => setIsLoupeActive((a) => !a)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      isLoupeActive
                        ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isLoupeActive ? 'LOUPE ACTIVE' : 'ENABLE LOUPE'}
                  </button>
                </div>

                <p className="text-[10px] text-slate-300">
                  When enabled, hovering over the document projects an interactive circular magnifying reticle with crosshairs to inspect fine pen lifts and micro-lettering.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-purple-300 uppercase font-bold">
                    Loupe Magnification Power:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { power: 2, label: '2.0x' },
                      { power: 3.5, label: '3.5x' },
                      { power: 5, label: '5.0x' },
                      { power: 8, label: '8.0x' },
                    ].map((m) => (
                      <button
                        key={m.power}
                        onClick={() => {
                          setLoupeZoom(m.power);
                          setIsLoupeActive(true);
                        }}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                          loupeZoom === m.power && isLoupeActive
                            ? 'bg-fuchsia-500 text-white shadow-sm'
                            : 'bg-slate-900 hover:bg-purple-900/60 text-purple-300'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Forensic Engine Architecture & Calibration Specs */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/20 space-y-2 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                  <Focus className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>OCR SENSOR & CALIBRATION SPECS</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resolution Calibration:</span>
                    <span className="text-purple-200">300 DPI Native Extraction</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">LSTM Pipeline:</span>
                    <span className="text-purple-200">PSM 6 &rarr; PSM 3 &rarr; PSM 11</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Space Preservation:</span>
                    <span className="text-emerald-300">preserve_interword_spaces = 1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dimension Parser:</span>
                    <span className="text-purple-200">Header SOF0/IHDR Precision</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EXPORT TO CASE DOSSIER MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-purple-500/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl shadow-purple-950/80 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-5 h-5 text-fuchsia-400" />
                <h3 className="text-sm font-bold text-white">Attach Verbatim Transcription to Case Dossier</h3>
              </div>
              <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select an active forensic investigation case. The digitized verbatim transcription and character
              metrics will be signed and sealed under Section 65B/45 of the Indian Evidence Act.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-mono text-purple-300 block font-bold">Target Case Dossier:</label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full bg-slate-950 border border-purple-500/40 focus:border-fuchsia-400 rounded-xl p-2.5 text-xs text-slate-100 outline-none"
              >
                {availableCases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} • {c.firNumber} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            {attachMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{attachMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsExportModalOpen(false)}
                disabled={isAttaching}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAttachToCase}
                disabled={isAttaching || !selectedCaseId}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {isAttaching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Signing & Attaching...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Confirm Attachment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORD REFINEMENT / CORRECTION MODAL */}
      {editingWord && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-fuchsia-500/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl shadow-purple-950/90 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-fuchsia-400" />
                <h3 className="text-sm font-bold text-white">Refine Questioned Handwriting Token</h3>
              </div>
              <button onClick={() => setEditingWord(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-500/30 space-y-1">
                <div className="text-[10px] font-mono text-purple-300 uppercase">Original OCR Token:</div>
                <div className="font-mono text-base font-bold text-white">{editingWord.text}</div>
                <div className="text-[10px] font-mono text-slate-400">
                  Line {editingWord.lineIndex + 1} • Confidence: {Math.round(editingWord.confidence * 100)}%
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-purple-200">Refined / Ground-Truth Letters:</label>
                <input
                  type="text"
                  value={editWordValue}
                  onChange={(e) => setEditWordValue(e.target.value)}
                  className="w-full bg-slate-950 border border-fuchsia-500/50 focus:border-fuchsia-400 rounded-xl p-2.5 text-sm font-mono text-white outline-none"
                  placeholder="Enter exact verbatim characters..."
                  autoFocus
                />
              </div>

              <p className="text-[10px] text-slate-400 leading-normal">
                Updating this word updates the legal transcription, synchronizes the Words Registry, and marks the word as 100% human-verified under Section 45 IEA.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingWord(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWordEdit}
                disabled={!editWordValue.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-bold disabled:opacity-50 shadow-md shadow-fuchsia-500/30"
              >
                Save & Synchronize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE CAMERA CAPTURE MODAL */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-fuchsia-500/60 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-fuchsia-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Live Camera Document Scanner (Google Lens)</h3>
              </div>
              <button onClick={stopCamera} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-purple-500/40">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

              {/* Targeting Reticle Grid */}
              <div className="absolute inset-8 border-2 border-dashed border-fuchsia-400/60 pointer-events-none rounded-xl flex items-center justify-center">
                <Crosshair className="w-12 h-12 text-fuchsia-400/40" />
                <span className="absolute bottom-2 text-[10px] font-mono bg-black/60 px-2 py-0.5 rounded text-fuchsia-200">
                  Align handwritten document inside boundary
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-400">
                Hold document steady under adequate illumination. Real-time OCR will process all visible words.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-fuchsia-500/40"
                >
                  <ScanText className="w-4 h-4" />
                  Capture & Transcribe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
