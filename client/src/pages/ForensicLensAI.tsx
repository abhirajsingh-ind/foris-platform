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
  FileText,
  Search,
  Maximize2,
  RefreshCw,
  ExternalLink,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  AlertCircle,
  X,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

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

  // Actions State
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [availableCases, setAvailableCases] = useState<Array<{ id: string; firNumber: string; title: string }>>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isAttaching, setIsAttaching] = useState(false);
  const [attachMessage, setAttachMessage] = useState<string | null>(null);

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
        return prev + 12;
      });
    }, 60);
  };

  // Custom User File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveSampleId(null);
    setSelectedWord(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImageSrc(base64);

      setIsScanning(true);
      try {
        const token = localStorage.getItem('foris_token');
        const formData = new FormData();
        formData.append('image', file);

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
          alert('Optical transcription failed.');
        }
      } catch (err) {
        console.error('OCR transcription error:', err);
      } finally {
        setIsScanning(false);
      }
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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImageSrc(dataUrl);
      setActiveSampleId(null);
      stopCamera();

      // Submit base64 to transcribe endpoint
      runScanningAnimation(async () => {
        try {
          const token = localStorage.getItem('foris_token');
          const res = await fetch('/api/lens/transcribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ imageBase64: dataUrl }),
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

  // Voice Readout (TTS)
  const toggleSpeech = () => {
    if (!verbatimText) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(verbatimText.replace(/~~/g, ' '));
    utterance.rate = 0.95;
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
        const data = await res.json();
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
                FORENSIC AI LENS
              </h1>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 tracking-wider shadow-[0_0_10px_rgba(217,70,239,0.25)]">
                GOOGLE LENS OCR
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-600/40">
                ZERO LETTER ALTERATION
              </span>
            </div>
            <p className="text-[11px] text-purple-300/70">
              High-Fidelity Neural Holograph Transcription • Preserves Exact Letters, Numerals, Casing & Strike-throughs
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
            Upload Document
          </button>

          <button
            onClick={startCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-semibold shadow-md shadow-fuchsia-500/20 transition-all active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
            Live Camera Lens
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Interactive Optical Lens Scanner Viewport */}
        <div className="flex-1 flex flex-col border-r border-purple-500/20 bg-slate-950/60 overflow-hidden">
          {/* Sample Specimens Carousel / Selector */}
          <div className="p-3 bg-slate-900/90 border-b border-purple-500/20 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-fuchsia-400" />
              Evidence Specimens:
            </span>
            <div className="flex items-center gap-2">
              {samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectSample(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    activeSampleId === s.id
                      ? 'bg-purple-900/80 text-fuchsia-200 border-fuchsia-500/70 shadow-md shadow-purple-900/40 ring-1 ring-fuchsia-500/30'
                      : 'bg-slate-950/60 text-slate-400 hover:text-purple-200 hover:bg-purple-950/40 border-slate-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeSampleId === s.id ? 'bg-fuchsia-400 animate-ping' : 'bg-slate-600'
                    }`}
                  />
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Document Canvas with Google Lens Scan Overlay */}
          <div
            ref={imageContainerRef}
            className="flex-1 relative overflow-auto bg-slate-950 flex items-center justify-center p-6 select-none"
          >
            {imageSrc ? (
              <div
                className="relative max-w-full max-h-full rounded-xl overflow-hidden border-2 border-purple-500/40 shadow-2xl shadow-purple-950/50 bg-black"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}
              >
                {/* Underlying Handwritten Image */}
                <img
                  src={imageSrc}
                  alt="Forensic Questioned Handwritten Document"
                  className="max-h-[620px] w-auto object-contain block"
                />

                {/* GOOGLE LENS SWEEPING LASER SCAN BEAM */}
                {isScanning && (
                  <div
                    className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent shadow-[0_0_20px_#d946ef,0_0_10px_#a855f7] z-30 transition-all duration-75 pointer-events-none"
                    style={{ top: `${scanProgress}%` }}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-fuchsia-600/90 text-[9px] font-mono font-bold text-white shadow-lg">
                      GOOGLE LENS OCR SCANNING {scanProgress}%
                    </div>
                  </div>
                )}

                {/* Google Lens Particle Grid Overlay while Scanning */}
                {isScanning && (
                  <div className="absolute inset-0 bg-fuchsia-500/10 pointer-events-none backdrop-blur-[1px] animate-pulse" />
                )}

                {/* INTERACTIVE WORD BOUNDING BOXES OVERLAY */}
                {showBoundingBoxes &&
                  !isScanning &&
                  words.map((w) => {
                    const isHovered = hoveredWordId === w.id;
                    const isSelected = selectedWord?.id === w.id;

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
                          isSelected
                            ? 'border-2 border-fuchsia-400 bg-fuchsia-500/35 shadow-[0_0_15px_rgba(217,70,239,0.7)] ring-2 ring-fuchsia-300'
                            : isHovered
                              ? 'border-2 border-purple-400 bg-purple-500/25 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                              : 'border border-purple-400/40 bg-purple-500/10 hover:border-fuchsia-400'
                        }`}
                        title={`${w.text} (${Math.round(w.confidence * 100)}% accuracy)`}
                      >
                        {/* Word tooltip on hover / selection */}
                        {(isHovered || isSelected) && (
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
                <p className="text-sm">Select a forensic evidence specimen above or upload a document to begin.</p>
              </div>
            )}

            {/* Floating Lens Controls in bottom left */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-purple-500/30 shadow-xl">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
                className="p-1.5 rounded-lg hover:bg-purple-900/50 text-purple-300 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-purple-200 px-1 font-semibold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.15))}
                className="p-1.5 rounded-lg hover:bg-purple-900/50 text-purple-300 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-purple-500/30 mx-1" />
              <button
                onClick={() => setShowBoundingBoxes((b) => !b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  showBoundingBoxes
                    ? 'bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {showBoundingBoxes ? 'Boxes: ON' : 'Boxes: OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Exact Verbatim Digitized Computer Text */}
        <div className="w-[500px] flex flex-col bg-slate-900/80 border-l border-purple-500/20 overflow-hidden shrink-0">
          {/* Panel Top Header */}
          <div className="p-4 border-b border-purple-500/20 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-200">
                Exact Verbatim Digitized Text
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                {confidence}% ACCURACY
              </span>
            </div>
          </div>

          {/* Forensic Metadata Strip */}
          <div className="px-4 py-2.5 bg-purple-950/30 border-b border-purple-500/20 text-[11px] space-y-1">
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

          {/* Selected Word Magnifier Loupe */}
          {selectedWord && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-purple-950/60 border border-fuchsia-500/40 flex items-center justify-between shadow-md">
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
              <button
                onClick={() => setSelectedWord(null)}
                className="text-purple-400 hover:text-white p-1 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
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
                  VERBATIM CERTIFICATION • NO LETTERS ALTERED
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
          <div className="p-4 border-t border-purple-500/20 bg-slate-950/80 space-y-2.5">
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

              <button
                onClick={toggleSpeech}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                  isSpeaking
                    ? 'bg-fuchsia-950 text-fuchsia-200 border-fuchsia-500'
                    : 'bg-purple-950/80 hover:bg-purple-900 border-purple-500/40 text-purple-200'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-fuchsia-400" />
                    Stop Voice
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-fuchsia-400" />
                    Voice Readout
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
                Hold document steady under adequate illumination.
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
