import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Case, CaseDocument } from '../types';
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  ArrowRight,
  Shield,
  FileText,
  Calendar,
  UserCheck,
  Building,
  X,
  Clock,
  AlertOctagon,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Eye,
  Download,
  ShieldCheck,
  Camera,
  Paperclip,
  Maximize2,
  Lock,
  RefreshCw,
} from 'lucide-react';

interface CasesProps {
  onSelectReport?: (reportId: string) => void;
  setActiveTab?: (tab: string) => void;
}

interface PendingAttachment {
  id: string;
  file: File;
  previewUrl?: string;
  isImage: boolean;
  category: string;
  sha256Hash?: string;
  sizeStr: string;
}

export const Cases: React.FC<CasesProps> = ({ onSelectReport, setActiveTab }) => {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  // New Case Form State
  const [newId, setNewId] = useState('');
  const [newFir, setNewFir] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Digital Evidence & Cyber Intrusion');
  const [newDescription, setNewDescription] = useState('');
  const [newPoliceUnit, setNewPoliceUnit] = useState('Special Crime Branch');
  const [newPriority, setNewPriority] = useState('HIGH');
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);

  // Dossier File Upload & Lightbox state
  const [dossierUploading, setDossierUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string; hash: string; size: string } | null>(null);
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<{ id: string; verified: boolean; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dossierFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCases();
  }, [statusFilter, priorityFilter, searchQuery]);

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('foris_token');
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (priorityFilter !== 'ALL') params.append('priority', priorityFilter);

      const res = await fetch(`/api/cases?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases);
      }
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCaseDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch(`/api/cases/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedCase(data.case);
      }
    } catch (err) {
      console.error('Failed to load case details:', err);
    }
  };

  // Helper to compute SHA-256 hash in browser
  const computeFileSHA256 = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Handle file selection in registration modal
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: PendingAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/');
      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
      const sizeStr = formatFileSize(file.size);

      const defaultCat = isImage
        ? '📷 Crime Scene Photo'
        : file.name.toLowerCase().includes('fir')
        ? '📜 FIR Copy'
        : '📄 Seizure Memo / Doc';

      const item: PendingAttachment = {
        id: `file-${Date.now()}-${i}`,
        file,
        previewUrl,
        isImage,
        category: defaultCat,
        sizeStr,
      };

      newItems.push(item);
    }

    setPendingAttachments((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Compute hashes asynchronously
    for (const item of newItems) {
      try {
        const hash = await computeFileSHA256(item.file);
        setPendingAttachments((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, sha256Hash: hash } : p))
        );
      } catch (e) {
        console.error('Failed to compute hash for file:', item.file.name, e);
      }
    }
  };

  const handleRemovePendingFile = (id: string) => {
    setPendingAttachments((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  // Create Case and Upload Attached Files
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('Registering case dossier...');

    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: newId,
          firNumber: newFir,
          title: newTitle,
          category: newCategory,
          description: newDescription,
          policeUnit: newPoliceUnit,
          priority: newPriority,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Case registration rejected by authorization gateway.');
        setIsSubmitting(false);
        setSubmitStatus(null);
        return;
      }

      const createdCaseId = data.case.id;

      // Upload attached files if any
      if (pendingAttachments.length > 0) {
        for (let i = 0; i < pendingAttachments.length; i++) {
          const att = pendingAttachments[i];
          setSubmitStatus(`Uploading & Hashing file ${i + 1}/${pendingAttachments.length}: ${att.file.name}...`);

          const formData = new FormData();
          formData.append('file', att.file);
          formData.append('caseId', createdCaseId);

          try {
            await fetch('/api/documents/upload', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            });
          } catch (uploadErr) {
            console.error('File upload error:', uploadErr);
          }
        }
      }

      setSubmitStatus('✓ Case & Attachments Successfully Registered!');
      setTimeout(() => {
        setIsRegisterOpen(false);
        setNewId('');
        setNewFir('');
        setNewTitle('');
        setNewDescription('');
        setPendingAttachments([]);
        setIsSubmitting(false);
        setSubmitStatus(null);
        fetchCases();
      }, 800);
    } catch (err) {
      alert('Unable to connect to registry API.');
      setIsSubmitting(false);
      setSubmitStatus(null);
    }
  };

  // Upload additional photo/document directly to active Case Dossier
  const handleDossierUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCase || !e.target.files || e.target.files.length === 0) return;
    setDossierUploading(true);
    const token = localStorage.getItem('foris_token');

    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('caseId', selectedCase.id);

        await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }
      await fetchCaseDetails(selectedCase.id);
      fetchCases();
    } catch (err) {
      alert('Failed to upload document to case dossier.');
    } finally {
      setDossierUploading(false);
      if (dossierFileInputRef.current) dossierFileInputRef.current.value = '';
    }
  };

  // Verify Document SHA-256 byte integrity with backend
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
      setVerifyResult({
        id: docId,
        verified: data.verified,
        message: data.message,
      });
    } catch (e) {
      setVerifyResult({
        id: docId,
        verified: false,
        message: 'Verification check failed to reach integrity node.',
      });
    } finally {
      setVerifyingDocId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            Case Dossier Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official jurisdictional records with referential evidence tracking, crime scene photo logs, and audit linkage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/50 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Register Forensic Case
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Case ID, FIR, title or description..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNDER_EXAMINATION">Under Examination</option>
              <option value="REPORT_FILED">Report Filed</option>
              <option value="COURT_SUBMITTED">Court Docket</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cases.map((c) => (
          <div
            key={c.id}
            onClick={() => fetchCaseDetails(c.id)}
            className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-5 shadow-lg cursor-pointer transition-all space-y-3 group hover:shadow-cyan-950/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-mono text-xs font-bold text-cyan-400">{c.id}</span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge type="priority" value={c.priority} />
                  <StatusBadge type="caseStatus" value={c.status} />
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{c.description}</p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-3 border-t border-slate-800/60 mt-3">
                <div className="flex items-center justify-between">
                  <span>FIR:</span>
                  <span className="font-mono text-slate-300 font-semibold">{c.firNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Category:</span>
                  <span className="text-slate-300 truncate max-w-[180px]">{c.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Investigator:</span>
                  <span className="text-slate-300">{c.assignedOfficer?.name || 'Assigned Officer'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono">
                  {c._count?.evidence || 0} Evidences
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-300 font-mono flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  {c._count?.documents || 0} Docs/Photos
                </span>
              </div>
              <span className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold text-[11px]">
                Open &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Case Details Drawer / Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                      {selectedCase.id}
                    </span>
                    <StatusBadge type="caseStatus" value={selectedCase.status} />
                    <StatusBadge type="priority" value={selectedCase.priority} />
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">{selectedCase.title}</h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Dossier Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    FIR Number
                  </span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedCase.firNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Police Division
                  </span>
                  <span className="text-slate-200">{selectedCase.policeUnit}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Forensic Unit
                  </span>
                  <span className="text-slate-200">{selectedCase.forensicUnit}</span>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Case Narrative & Objectives
                </span>
                <p className="leading-relaxed">{selectedCase.description}</p>
              </div>

              {/* SECTION: Attached Case Documents & Crime Scene Photos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    Attached Crime Scene Photos & Case Documents ({selectedCase.documents?.length || 0})
                  </h3>
                  
                  {/* Inline Upload Additional Files button */}
                  <div>
                    <input
                      type="file"
                      ref={dossierFileInputRef}
                      onChange={handleDossierUpload}
                      multiple
                      accept="image/*,application/pdf,.docx,.txt"
                      className="hidden"
                    />
                    <button
                      onClick={() => dossierFileInputRef.current?.click()}
                      disabled={dossierUploading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 hover:border-cyan-500/50 transition-colors disabled:opacity-50"
                    >
                      {dossierUploading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          Attach Photo / File
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {verifyResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      verifyResult.verified
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/40 border-red-500/40 text-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>{verifyResult.message}</span>
                    </div>
                    <button
                      onClick={() => setVerifyResult(null)}
                      className="text-slate-400 hover:text-white text-xs ml-2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {(!selectedCase.documents || selectedCase.documents.length === 0) ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-2">
                    <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">No photos or documents attached yet to this case dossier.</p>
                    <p className="text-[11px] text-slate-500">
                      Use the "Attach Photo / File" button above to upload crime scene pictures, FIR scans, or seizure memos.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedCase.documents.map((doc: CaseDocument) => {
                      const isImage = doc.mimeType.startsWith('image/');
                      const token = localStorage.getItem('foris_token');
                      const viewUrl = `/api/documents/${doc.id}/view?token=${encodeURIComponent(token || '')}`;

                      return (
                        <div
                          key={doc.id}
                          className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex flex-col justify-between space-y-2.5 transition-all group"
                        >
                          <div>
                            {/* Image Thumbnail or Doc Icon */}
                            {isImage ? (
                              <div
                                onClick={() =>
                                  setPreviewPhoto({
                                    url: viewUrl,
                                    title: doc.originalFilename,
                                    hash: doc.sha256Hash,
                                    size: formatFileSize(doc.fileSize),
                                  })
                                }
                                className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer group-hover:border-cyan-500/50 transition-all"
                              >
                                <img
                                  src={viewUrl}
                                  alt={doc.originalFilename}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    // Fallback to placeholder if image fails
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                                  <Maximize2 className="w-4 h-4 text-cyan-300" />
                                  <span>View Photo</span>
                                </div>
                                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[10px] text-cyan-300 font-mono border border-cyan-500/30">
                                  PHOTO
                                </span>
                              </div>
                            ) : (
                              <div className="w-full h-20 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-2 text-slate-300">
                                <FileText className="w-6 h-6 text-cyan-400" />
                                <span className="text-xs font-semibold">
                                  {doc.mimeType.includes('pdf') ? 'PDF Document' : 'Case Document'}
                                </span>
                              </div>
                            )}

                            {/* File metadata */}
                            <div className="mt-2">
                              <h4 className="text-xs font-semibold text-white truncate" title={doc.originalFilename}>
                                {doc.originalFilename}
                              </h4>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                                <span>{formatFileSize(doc.fileSize)}</span>
                                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                              </div>
                              <div className="mt-1 text-[9px] font-mono text-slate-500 truncate" title={doc.sha256Hash}>
                                SHA: {doc.sha256Hash.slice(0, 16)}...
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                            <button
                              onClick={() => handleVerifyDocument(doc.id)}
                              disabled={verifyingDocId === doc.id}
                              className="px-2 py-1 rounded bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1 transition-colors"
                              title="Verify Cryptographic SHA-256 Byte Hash"
                            >
                              {verifyingDocId === doc.id ? (
                                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                              ) : (
                                <ShieldCheck className="w-2.5 h-2.5" />
                              )}
                              Verify SHA
                            </button>

                            <div className="flex items-center gap-1">
                              {isImage ? (
                                <button
                                  onClick={() =>
                                    setPreviewPhoto({
                                      url: viewUrl,
                                      title: doc.originalFilename,
                                      hash: doc.sha256Hash,
                                      size: formatFileSize(doc.fileSize),
                                    })
                                  }
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs"
                                  title="Expand Full Photo"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <a
                                  href={viewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs inline-block"
                                  title="Open Document"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </a>
                              )}

                              <a
                                href={`/api/documents/${doc.id}/download`}
                                download={doc.originalFilename}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs inline-block"
                                title="Download Certified Original"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Related Evidence */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  Seized Evidence Articles ({selectedCase.evidence?.length || 0})
                </h3>

                <div className="space-y-2">
                  {selectedCase.evidence?.map((ev: any) => (
                    <div
                      key={ev.id}
                      className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-400 font-bold">{ev.id}</span>
                          <span className="font-semibold text-white">{ev.evidenceType}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-1">{ev.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono block">
                          SHA-256: {ev.sha256Hash.slice(0, 16)}...
                        </span>
                        <span className="text-[11px] text-emerald-400 font-medium">
                          Custodian: {ev.currentCustodian}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Reports */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Forensic Reports ({selectedCase.reports?.length || 0})
                </h3>

                <div className="space-y-2">
                  {selectedCase.reports?.map((rep: any) => (
                    <div
                      key={rep.id}
                      className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400 font-bold">{rep.id}</span>
                          <span className="font-semibold text-white">{rep.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Current Version: v{rep.currentVersion} • Author: {rep.author?.name}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCase(null);
                          if (onSelectReport) onSelectReport(rep.id);
                          if (setActiveTab) setActiveTab('reports');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        Inspect Report &rarr;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Case Modal WITH Photo & Document Upload */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn font-sans">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Register Forensic Investigation Case</h3>
                  <p className="text-[11px] text-slate-400">Enter FIR details and upload crime scene photos / documents</p>
                </div>
              </div>
              <button
                onClick={() => !isSubmitting && setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold uppercase block mb-1">
                    Case ID (e.g. MP-FOR-2026-00999)
                  </label>
                  <input
                    type="text"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    placeholder="MP-FOR-2026-XXXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold uppercase block mb-1">
                    FIR Registration Number
                  </label>
                  <input
                    type="text"
                    value={newFir}
                    onChange={(e) => setNewFir(e.target.value)}
                    placeholder="FIR-123/2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold uppercase block mb-1">Case Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="State v. Suspect Title"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold uppercase block mb-1">Forensic Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option>Digital Evidence & Cyber Intrusion</option>
                    <option>Ballistics & Physical Evidence</option>
                    <option>Toxicology & Biochemical Analysis</option>
                    <option>Document & Signature Verification</option>
                    <option>DNA & Biological Forensic</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold uppercase block mb-1">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold uppercase block mb-1">
                  Investigation Summary
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="Official incident summary and forensic examination directive..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* UPLOAD SECTION: Crime Scene Photos, FIR Copies & Documents */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-xs">
                      Attach Crime Scene Photos & Case Documents
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {pendingAttachments.length} file(s) selected
                  </span>
                </div>

                {/* Drag-and-Drop / Browse Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-4 text-center cursor-pointer bg-slate-900/40 hover:bg-cyan-950/20 transition-all space-y-2 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFilesSelected}
                    multiple
                    accept="image/*,application/pdf,.docx,.txt"
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-3 text-cyan-400 group-hover:scale-105 transition-transform">
                    <Camera className="w-6 h-6 text-cyan-400" />
                    <UploadCloud className="w-6 h-6 text-teal-400" />
                    <FileText className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Click to upload Crime Scene Photos, FIR Copy, or Seizure Memo
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Supports JPEG, PNG, TIFF photos, PDF, DOCX (Auto SHA-256 Hashed)
                    </span>
                  </div>
                </div>

                {/* Selected Attachments List */}
                {pendingAttachments.length > 0 && (
                  <div className="space-y-2 mt-3 max-h-48 overflow-y-auto pr-1">
                    {pendingAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {att.isImage && att.previewUrl ? (
                            <img
                              src={att.previewUrl}
                              alt={att.file.name}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-cyan-400">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <span className="font-semibold text-white truncate block text-xs" title={att.file.name}>
                              {att.file.name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span>{att.sizeStr}</span>
                              <span>•</span>
                              <span className="text-cyan-400">{att.category}</span>
                            </div>
                            {att.sha256Hash ? (
                              <span className="text-[9px] font-mono text-emerald-400 block truncate" title={att.sha256Hash}>
                                SHA-256: {att.sha256Hash.slice(0, 18)}...
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono text-slate-500 block">
                                Calculating SHA-256 seal...
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRemovePendingFile(att.id)}
                            className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Remove attachment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {submitStatus && (
                <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>{submitStatus}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-lg font-bold shadow-md shadow-cyan-950/50 flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Registering & Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Case Registration
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crime Scene Photo Fullscreen Lightbox Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-fadeIn font-sans">
          <div className="relative max-w-5xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-xs">{previewPhoto.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">({previewPhoto.size})</span>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center bg-black/80 max-h-[75vh] overflow-hidden">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SHA-256: {previewPhoto.hash}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewPhoto.url}
                  download={previewPhoto.title}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download High-Res Photo
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
