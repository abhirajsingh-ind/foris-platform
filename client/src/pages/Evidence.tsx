import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Evidence, EvidenceTransfer, CaseDocument } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ChainOfCustody } from '../components/ChainOfCustody';
import { IntegrityModal } from '../components/IntegrityModal';
import {
  Shield,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  UserCheck,
  Calendar,
  Hash,
  X,
  Send,
  Building,
  Camera,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Eye,
  Download,
  Maximize2,
  Lock,
  RefreshCw,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';

interface PendingPhoto {
  id: string;
  file: File;
  previewUrl: string;
  isImage: boolean;
  sha256Hash: string;
  sizeStr: string;
}

export const EvidencePage: React.FC = () => {
  const { user } = useAuth();
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [availableCases, setAvailableCases] = useState<Array<{ id: string; firNumber: string; title: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [integrityResult, setIntegrityResult] = useState<any | null>(null);
  const [isIntegrityModalOpen, setIsIntegrityModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatusMessage, setSubmitStatusMessage] = useState<string | null>(null);

  // New Evidence Form State
  const [newId, setNewId] = useState('');
  const [caseId, setCaseId] = useState('MP-FOR-2026-00125');
  const [evidenceType, setEvidenceType] = useState('');
  const [description, setDescription] = useState('');
  const [collectorName, setCollectorName] = useState('Sub-Inspector K. Verma');
  const [initialCondition, setInitialCondition] = useState('Intact under tamper-evident seal');
  const [storageLocation, setStorageLocation] = useState('Forensic Vault B-02');
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);

  // Transfer Form State
  const [toParty, setToParty] = useState('');
  const [purpose, setPurpose] = useState('');
  const [action, setAction] = useState('EXAMINATION_HANDOVER');
  const [transferNotes, setTransferNotes] = useState('');

  // Dossier Additional Attachment Upload State
  const [dossierUploading, setDossierUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string; hash: string; size: string } | null>(null);
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<{ id: string; verified: boolean; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dossierFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEvidence();
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
        }
      }
    } catch (err) {
      console.error('Failed to load cases list:', err);
    }
  };

  const fetchEvidence = async (selectId?: string) => {
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch('/api/evidence', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEvidenceList(data.evidence);
        const targetId = selectId || selectedEvidence?.id || (data.evidence.length > 0 ? data.evidence[0].id : null);
        if (targetId) {
          fetchEvidenceDetail(targetId);
        }
      }
    } catch (err) {
      console.error('Failed to load evidence:', err);
    }
  };

  const fetchEvidenceDetail = async (id: string) => {
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch(`/api/evidence/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedEvidence(data.evidence);
      }
    } catch (err) {
      console.error('Failed to load evidence detail:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const calculateFileSha256 = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPending: PendingPhoto[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/');
      let previewUrl = '';
      if (isImage) {
        previewUrl = URL.createObjectURL(file);
      }
      const sha256Hash = await calculateFileSha256(file);
      newPending.push({
        id: `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        isImage,
        sha256Hash,
        sizeStr: formatFileSize(file.size),
      });
    }

    setPendingPhotos((prev) => [...prev, ...newPending]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingPhoto = (id: string) => {
    setPendingPhotos((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleVerifyIntegrity = async (id: string) => {
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch(`/api/evidence/${id}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIntegrityResult(data);
      setIsIntegrityModalOpen(true);
    } catch (err) {
      alert('Verification call failed.');
    }
  };

  const handleVerifyDocument = async (docId: string) => {
    setVerifyingDocId(docId);
    setVerifyResult(null);
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch(`/api/documents/${docId}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerifyResult({
          id: docId,
          verified: data.matches,
          message: data.matches
            ? `Cryptographic match 100% verified. File matches SHA-256 seal.`
            : `Warning: Hash mismatch detected. File may have been altered.`,
        });
      } else {
        setVerifyResult({
          id: docId,
          verified: false,
          message: data.error || 'Verification failed.',
        });
      }
    } catch (err) {
      setVerifyResult({
        id: docId,
        verified: false,
        message: 'Network error during byte verification.',
      });
    } finally {
      setVerifyingDocId(null);
    }
  };

  const handleDossierFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedEvidence) return;
    setDossierUploading(true);
    try {
      const token = localStorage.getItem('foris_token');
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('caseId', selectedEvidence.caseId);
        formData.append('evidenceId', selectedEvidence.id);

        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to upload exhibit photo.');
        }
      }
      await fetchEvidenceDetail(selectedEvidence.id);
      await fetchEvidence();
    } catch (err: any) {
      alert(err.message || 'File upload failed.');
    } finally {
      setDossierUploading(false);
      if (dossierFileInputRef.current) dossierFileInputRef.current.value = '';
    }
  };

  const handleRegisterEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatusMessage('Generating SHA-256 Cryptographic Seal...');
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch('/api/evidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: newId.trim().toUpperCase(),
          caseId,
          evidenceType,
          description,
          collectorName,
          initialCondition,
          storageLocation,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Evidence registration rejected.');
      }

      const createdEvidenceId = data.evidence.id;

      // Upload all attached photos if any
      if (pendingPhotos.length > 0) {
        for (let i = 0; i < pendingPhotos.length; i++) {
          setSubmitStatusMessage(`Uploading Seized Photo ${i + 1} of ${pendingPhotos.length}...`);
          const photo = pendingPhotos[i];
          const formData = new FormData();
          formData.append('file', photo.file);
          formData.append('caseId', caseId);
          formData.append('evidenceId', createdEvidenceId);

          const upRes = await fetch('/api/documents/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });

          if (!upRes.ok) {
            console.error('Failed to upload exhibit:', photo.file.name);
          }
        }
      }

      setSubmitStatusMessage('Evidence article sealed & registered successfully!');
      setTimeout(() => {
        setIsRegisterOpen(false);
        setNewId('');
        setEvidenceType('');
        setDescription('');
        setPendingPhotos([]);
        setIsSubmitting(false);
        setSubmitStatusMessage(null);
        fetchEvidence(createdEvidenceId);
      }, 500);
    } catch (err: any) {
      alert(err.message || 'Failed to register evidence.');
      setIsSubmitting(false);
      setSubmitStatusMessage(null);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvidence) return;
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch(`/api/evidence/${selectedEvidence.id}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          toParty,
          purpose,
          action,
          notes: transferNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsTransferOpen(false);
        setToParty('');
        setPurpose('');
        setTransferNotes('');
        fetchEvidenceDetail(selectedEvidence.id);
        fetchEvidence();
      } else {
        alert(data.error || 'Custody transfer rejected.');
      }
    } catch (err) {
      alert('Failed to submit transfer.');
    }
  };

  const filteredEvidence = evidenceList.filter((ev) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ev.id.toLowerCase().includes(q) ||
      ev.evidenceType.toLowerCase().includes(q) ||
      ev.caseId.toLowerCase().includes(q) ||
      ev.currentCustodian.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Forensic Evidence Register & Custody Vault
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident custody chain with real-time SHA-256 cryptographic registration seals & seized photographic exhibits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              // Suggest next evidence ID
              const nextNum = evidenceList.length + 1;
              setNewId(`EV-${String(nextNum).padStart(3, '0')}`);
              setIsRegisterOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-900/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Register Seized Evidence
          </button>
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Evidence List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search evidence ID, type, case..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-md"
            />
          </div>

          <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
            {filteredEvidence.map((ev) => {
              const isSelected = selectedEvidence?.id === ev.id;
              const docCount = ev.documents?.length || ev._count?.documents || 0;
              const firstImageDoc = ev.documents?.find((d) => d.mimeType?.startsWith('image/'));

              return (
                <div
                  key={ev.id}
                  onClick={() => fetchEvidenceDetail(ev.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer shadow-md ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/60 shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <span className="font-mono text-xs font-bold text-cyan-400">{ev.id}</span>
                    <div className="flex items-center gap-2">
                      {docCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                          <Camera className="w-3 h-3 text-cyan-400" />
                          {docCount} {docCount === 1 ? 'Exhibit' : 'Exhibits'}
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-emerald-400">
                        {ev.currentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mt-2">
                    {firstImageDoc && (
                      <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-700/60 overflow-hidden flex-shrink-0">
                        <img
                          src={`/api/documents/${firstImageDoc.id}/view`}
                          alt={firstImageDoc.originalFilename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-white line-clamp-1">
                        {ev.evidenceType}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{ev.description}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Case: {ev.caseId}</span>
                    <span className="text-slate-300">
                      Custodian: {ev.currentCustodian.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Evidence Dossier & Exhibits & Chain of Custody (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedEvidence ? (
            <div className="space-y-6">
              {/* Evidence Overview Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                        {selectedEvidence.id}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Case: {selectedEvidence.caseId}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                      {selectedEvidence.evidenceType}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyIntegrity(selectedEvidence.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Verify SHA-256
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Current Custodian
                    </span>
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                      {selectedEvidence.currentCustodian}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Physical Storage Location
                    </span>
                    <span className="text-slate-200">{selectedEvidence.storageLocation}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Original Recovery Collector
                    </span>
                    <span className="text-slate-200">{selectedEvidence.collectorName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Initial Seal Condition
                    </span>
                    <span className="text-slate-200">{selectedEvidence.initialCondition}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 font-mono">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">
                    Cryptographic SHA-256 Registration Seal
                  </span>
                  <span className="text-slate-300 break-all select-all text-[11px]">
                    {selectedEvidence.sha256Hash}
                  </span>
                </div>
              </div>

              {/* Seized Photographic Exhibits & Documents Section */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-bold text-white">
                      Seized Photographic & Document Exhibits
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                      {selectedEvidence.documents?.length || 0}
                    </span>
                  </div>

                  {user?.role !== 'JUDGE' && (
                    <div>
                      <input
                        type="file"
                        ref={dossierFileInputRef}
                        onChange={(e) => handleDossierFileUpload(e.target.files)}
                        className="hidden"
                        accept="image/*,application/pdf"
                        multiple
                      />
                      <button
                        onClick={() => dossierFileInputRef.current?.click()}
                        disabled={dossierUploading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-cyan-300 hover:text-cyan-200 border border-slate-700 hover:border-cyan-500/50 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        {dossierUploading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Uploading Exhibit...
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            Attach Exhibit Photo
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Exhibits Gallery */}
                {selectedEvidence.documents && selectedEvidence.documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedEvidence.documents.map((doc) => {
                      const isImg = doc.mimeType?.startsWith('image/');
                      return (
                        <div
                          key={doc.id}
                          className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group"
                        >
                          {/* Image preview area */}
                          {isImg ? (
                            <div
                              onClick={() =>
                                setPreviewPhoto({
                                  url: `/api/documents/${doc.id}/view`,
                                  title: doc.originalFilename,
                                  hash: doc.sha256Hash,
                                  size: formatFileSize(doc.fileSize),
                                })
                              }
                              className="relative h-36 bg-black/50 overflow-hidden cursor-pointer group"
                            >
                              <img
                                src={`/api/documents/${doc.id}/view`}
                                alt={doc.originalFilename}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <span className="p-2 rounded-full bg-cyan-500/80 text-white shadow-lg backdrop-blur-sm">
                                  <Maximize2 className="w-4 h-4" />
                                </span>
                              </div>
                              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] text-cyan-300 font-mono">
                                {formatFileSize(doc.fileSize)}
                              </div>
                            </div>
                          ) : (
                            <div className="h-24 bg-slate-900/50 flex items-center justify-center border-b border-slate-800/80">
                              <FileText className="w-10 h-10 text-slate-500" />
                            </div>
                          )}

                          {/* Metadata and Actions */}
                          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between text-xs">
                            <div>
                              <p className="font-semibold text-white text-xs truncate" title={doc.originalFilename}>
                                {doc.originalFilename}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{formatFileSize(doc.fileSize)}</span>
                              </div>
                            </div>

                            {/* SHA-256 Badge */}
                            <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 text-[10px] font-mono">
                              <div className="flex items-center justify-between text-slate-500 text-[9px] uppercase font-bold mb-0.5">
                                <span>SHA-256 Seal</span>
                                <Lock className="w-2.5 h-2.5 text-cyan-400" />
                              </div>
                              <p className="text-slate-300 truncate select-all">{doc.sha256Hash}</p>
                            </div>

                            {/* Verification Result Message */}
                            {verifyResult && verifyResult.id === doc.id && (
                              <div
                                className={`p-2 rounded text-[10px] flex items-center gap-1.5 ${
                                  verifyResult.verified
                                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                                    : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                                }`}
                              >
                                {verifyResult.verified ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                ) : (
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                                )}
                                <span className="leading-tight">{verifyResult.message}</span>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                              <button
                                onClick={() => handleVerifyDocument(doc.id)}
                                disabled={verifyingDocId === doc.id}
                                className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-900/40 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                              >
                                {verifyingDocId === doc.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ShieldCheck className="w-3 h-3" />
                                )}
                                Verify
                              </button>

                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`/api/documents/${doc.id}/view`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800 transition-colors"
                                  title="View Full Resolution"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={`/api/documents/${doc.id}/download`}
                                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded border border-slate-800 transition-colors"
                                  title="Download Original Exhibit"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-300">
                        No photographic exhibits attached yet
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Attach high-resolution forensic photos, recovery scans, or forensic seizure reports.
                      </p>
                    </div>
                    {user?.role !== 'JUDGE' && (
                      <button
                        onClick={() => dossierFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950 text-cyan-300 border border-cyan-800/80 rounded-lg text-xs font-semibold hover:bg-cyan-900/60 transition-colors"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        Upload Exhibit Photo
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Chain of Custody Timeline Component */}
              <ChainOfCustody
                transfers={selectedEvidence.transfers || []}
                canTransfer={user?.role !== 'JUDGE'}
                onTransferClick={() => setIsTransferOpen(true)}
              />
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Select an evidence article from the registry to inspect its chain of custody & exhibits.
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for High-Resolution Evidence Photo View */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {previewPhoto.title}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">({previewPhoto.size})</span>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center overflow-auto bg-black/80 flex-1 min-h-[300px]">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                <span className="text-slate-500 uppercase font-bold text-[9px]">SHA-256:</span>
                <span className="truncate max-w-xs sm:max-w-md select-all text-cyan-400">
                  {previewPhoto.hash}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewPhoto.url}
                  download={previewPhoto.title}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Full-Res Exhibit
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Custody Modal */}
      {isTransferOpen && selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                Record Chain of Custody Handover
              </h3>
              <button onClick={() => setIsTransferOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Custodian (Releasing)</span>
                <span className="font-semibold text-cyan-300">{selectedEvidence.currentCustodian}</span>
              </div>

              <div>
                <label className="text-slate-400 font-semibold uppercase block mb-1">
                  Recipient Party (To)
                </label>
                <input
                  type="text"
                  value={toParty}
                  onChange={(e) => setToParty(e.target.value)}
                  placeholder="e.g. SFSL Forensic Examiner Dr. Varma / Special Sessions Court"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold uppercase block mb-1">Transfer Action</label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="EXAMINATION_HANDOVER">Examination Handover</option>
                    <option value="TRANSIT_DISPATCH">Transit Dispatch</option>
                    <option value="SECURE_VAULT_DEPOSIT">Vault Deposit</option>
                    <option value="COURT_PRESENTATION">Court Docket Presentation</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold uppercase block mb-1">Purpose</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Bit-stream disk imaging"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold uppercase block mb-1">
                  Custody Notes & Barcode Reference
                </label>
                <textarea
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  rows={2}
                  placeholder="Inspect packaging seals, security tag numbers, delivery pouch..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold shadow-md"
                >
                  Authenticate & Commit Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Evidence Modal with Photo & Document Attachment */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Register Seized Evidence Article
              </h3>
              <button
                onClick={() => {
                  if (!isSubmitting) setIsRegisterOpen(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterEvidence} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold uppercase block mb-1">
                    Evidence ID (e.g. EV-005)
                  </label>
                  <input
                    type="text"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    placeholder="EV-005"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold uppercase block mb-1">Case Identifier</label>
                  {availableCases.length > 0 ? (
                    <select
                      value={caseId}
                      onChange={(e) => setCaseId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white focus:outline-none focus:border-cyan-500"
                    >
                      {availableCases.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firNumber || c.id} — {c.title.substring(0, 30)}...
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={caseId}
                      onChange={(e) => setCaseId(e.target.value)}
                      placeholder="MP-FOR-2026-00125"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold uppercase block mb-1">
                  Evidence Item Name / Category
                </label>
                <input
                  type="text"
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  placeholder="e.g. Encrypted SanDisk Extreme 512GB Portable SSD"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold uppercase block mb-1">
                  Seizure Details & Serial Numbers
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Serial numbers, markings, physical traits, recovery location..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold uppercase block mb-1">Seizing Officer</label>
                  <input
                    type="text"
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold uppercase block mb-1">Vault Storage</label>
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Photo & Document Attachment Dropzone */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold uppercase flex items-center gap-1.5 text-xs">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    Seized Evidence Photographs & Exhibits
                  </label>
                  <span className="text-[10px] text-slate-500">
                    {pendingPhotos.length} Photo{pendingPhotos.length !== 1 ? 's' : ''} Selected
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                  accept="image/*,application/pdf"
                  multiple
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFilesSelected(e.dataTransfer.files);
                  }}
                  className="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 bg-slate-950/60 hover:bg-slate-950 rounded-xl p-4 text-center cursor-pointer transition-all group"
                >
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="p-2.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 group-hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-semibold text-slate-200">
                      Click to Browse or Drag & Drop Seized Evidence Photos
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Supports JPG, PNG, TIFF, PDF (High-Resolution Forensic Seizure Photos)
                    </div>
                  </div>
                </div>

                {/* Selected Photos Preview Grid */}
                {pendingPhotos.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 max-h-48 overflow-y-auto pr-1">
                    {pendingPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-2 flex items-center gap-2.5 relative group"
                      >
                        {photo.isImage && photo.previewUrl ? (
                          <div className="w-12 h-12 rounded bg-slate-900 overflow-hidden flex-shrink-0 border border-slate-700">
                            <img src={photo.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded bg-slate-900 flex items-center justify-center flex-shrink-0 border border-slate-700">
                            <FileText className="w-6 h-6 text-slate-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 pr-6">
                          <p className="font-semibold text-white truncate text-xs">{photo.file.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{photo.sizeStr}</p>
                          <div className="flex items-center gap-1 text-[9px] text-cyan-400 font-mono mt-0.5 truncate">
                            <Lock className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="truncate">{photo.sha256Hash}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePendingPhoto(photo.id);
                          }}
                          className="absolute right-2 top-2 text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Message */}
              {submitStatusMessage && (
                <div className="p-3 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-cyan-300 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>{submitStatusMessage}</span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sealing & Uploading...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Generate SHA-256 Seal & Register
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Integrity Verification Modal */}
      <IntegrityModal
        isOpen={isIntegrityModalOpen}
        onClose={() => setIsIntegrityModalOpen(false)}
        result={integrityResult}
        title="Evidence Article Cryptographic Seal Verification"
      />
    </div>
  );
};
