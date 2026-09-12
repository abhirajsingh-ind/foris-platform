import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Report, ReportVersion } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { VersionCompareModal } from '../components/VersionCompareModal';
import { IntegrityModal } from '../components/IntegrityModal';
import {
  FileText,
  ShieldCheck,
  GitCompare,
  Plus,
  Clock,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  KeyRound,
  Eye,
  Edit3,
  Layers,
  HelpCircle,
  X,
  FileSignature,
} from 'lucide-react';

interface ReportsProps {
  initialReportId?: string | null;
}

const AMENDMENT_REASONS = [
  'Typographical correction',
  'Additional evidence',
  'Re-examination',
  'Laboratory correction',
  'Court instruction',
  'Administrative correction',
  'Other',
];

export const ReportsPage: React.FC<ReportsProps> = ({ initialReportId }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeVersionNumber, setActiveVersionNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Comparison State
  const [compareData, setCompareData] = useState<any | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Integrity State
  const [integrityResult, setIntegrityResult] = useState<any | null>(null);
  const [isIntegrityOpen, setIsIntegrityOpen] = useState(false);

  // Amendment Modal State
  const [isAmendOpen, setIsAmendOpen] = useState(false);
  const [amendmentReason, setAmendmentReason] = useState('Additional evidence');
  const [amendmentDetails, setAmendmentDetails] = useState('');
  const [newFindings, setNewFindings] = useState('');
  const [newConclusion, setNewConclusion] = useState('');
  const [newEvidenceExamined, setNewEvidenceExamined] = useState('');
  const [newMethod, setNewMethod] = useState('');
  const [newObservations, setNewObservations] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch('/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);

        const targetId = initialReportId || (data.reports.length > 0 ? data.reports[0].id : null);
        if (targetId) {
          fetchReportDetails(targetId);
        }
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch(`/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedReport(data.report);
        if (data.report.versions && data.report.versions.length > 0) {
          setActiveVersionNumber(data.report.versions[0].versionNumber);
        }
      }
    } catch (err) {
      console.error('Failed to load report detail:', err);
    }
  };

  // Perform Real SHA-256 Integrity Verification
  const handleVerifyIntegrity = async (versionNum?: number) => {
    if (!selectedReport) return;
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch(`/api/reports/${selectedReport.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ versionNumber: versionNum || activeVersionNumber }),
      });
      const data = await res.json();
      setIntegrityResult(data);
      setIsIntegrityOpen(true);
    } catch (err) {
      alert('Integrity check call failed.');
    }
  };

  // Compare Two Versions (e.g. V1 <-> V2)
  const handleCompareVersions = async (fromVer: number, toVer: number) => {
    if (!selectedReport) return;
    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch(`/api/reports/${selectedReport.id}/compare?from=${fromVer}&to=${toVer}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCompareData(data);
        setIsCompareOpen(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Comparison error.');
      }
    } catch (err) {
      alert('Unable to load version comparison.');
    }
  };

  // Open Amendment Creator
  const openAmendmentModal = () => {
    if (!selectedReport) return;
    const currentVer = selectedReport.versions?.find((v) => v.versionNumber === selectedReport.currentVersion);
    if (currentVer) {
      setNewFindings(currentVer.findings);
      setNewConclusion(currentVer.conclusion);
      setNewEvidenceExamined(currentVer.evidenceExamined);
      setNewMethod(currentVer.examinationMethod);
      setNewObservations(currentVer.observations);
      setAmendmentReason('Additional evidence');
      setAmendmentDetails('');
      setIsAmendOpen(true);
    }
  };

  // Submit Amendment
  const handleAmendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    if (amendmentReason === 'Other' && amendmentDetails.trim().length < 10) {
      alert("When selecting 'Other', an explanation of at least 10 characters is mandatory.");
      return;
    }

    try {
      const token = localStorage.getItem('foris_token');
      const res = await fetch(`/api/reports/${selectedReport.id}/amend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amendmentReason,
          amendmentDetails,
          findings: newFindings,
          conclusion: newConclusion,
          evidenceExamined: newEvidenceExamined,
          examinationMethod: newMethod,
          observations: newObservations,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAmendOpen(false);
        await fetchReportDetails(selectedReport.id);
        await fetchReports();
        alert(`✓ Success: Version ${data.version.versionNumber} generated! Previous version preserved.`);
      } else {
        alert(data.error || 'Amendment rejected by server.');
      }
    } catch (err) {
      alert('Failed to submit report amendment.');
    }
  };

  const activeVersion = selectedReport?.versions?.find((v) => v.versionNumber === activeVersionNumber) || selectedReport?.versions?.[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              CORE USP FEATURE
            </span>
            <span className="text-xs text-slate-400">Non-Destructive Version Control</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Forensic Report Management & Version Control
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Every amendment generates an immutable new version with mandatory attribution and cryptographic hashing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Compare Button if multiple versions exist */}
          {selectedReport && selectedReport.versions && selectedReport.versions.length >= 2 && (
            <button
              onClick={() => handleCompareVersions(1, selectedReport.currentVersion)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-950/40 transition-all active:scale-95"
            >
              <GitCompare className="w-4 h-4" />
              Compare V1 ↔ V{selectedReport.currentVersion}
            </button>
          )}

          {/* Amend Button (Forensic Officer only; Judge strictly blocked) */}
          {user?.role === 'FORENSIC_OFFICER' && selectedReport && (
            <button
              onClick={openAmendmentModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-900/30 transition-all active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              Create Formal Amendment (V{selectedReport.currentVersion + 1})
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Reports & Version History Explorer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <span className="text-[11px] uppercase font-bold text-slate-400 block mb-3">
              Forensic Reports in Jurisdiction
            </span>

            <div className="space-y-2">
              {reports.map((r) => {
                const isSelected = selectedReport?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => fetchReportDetails(r.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-500/60 shadow-md shadow-cyan-950/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-400">{r.id}</span>
                      <StatusBadge type="reportStatus" value={r.status} />
                    </div>
                    <h4 className="text-xs font-semibold text-white mt-1 line-clamp-1">{r.title}</h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                      <span>Case: {r.caseId}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                        v{r.currentVersion}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Version Timeline for Selected Report */}
          {selectedReport && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Version History
                </span>
                <span className="text-[10px] text-slate-400">
                  {selectedReport.versions?.length} Versions Preserved
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedReport.versions?.map((ver) => {
                  const isActive = activeVersionNumber === ver.versionNumber;
                  return (
                    <div
                      key={ver.id}
                      onClick={() => setActiveVersionNumber(ver.versionNumber)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-950 border-cyan-400 shadow-md'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${ver.versionNumber === 1 ? 'bg-slate-400' : 'bg-cyan-400'}`}></span>
                          Version {ver.versionNumber}
                          {ver.versionNumber === selectedReport.currentVersion && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                              LATEST
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Finalized
                        </span>
                      </div>

                      {ver.amendmentReason && (
                        <div className="mt-2 text-[11px] text-amber-300 font-medium">
                          Reason: {ver.amendmentReason}
                        </div>
                      )}

                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{ver.author?.name?.split(' ')[1] || ver.author?.badgeId}</span>
                        <span>{new Date(ver.finalizedAt || ver.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Compare Quick Action if >= 2 versions */}
              {selectedReport.versions && selectedReport.versions.length >= 2 && (
                <button
                  onClick={() => handleCompareVersions(1, selectedReport.currentVersion)}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <GitCompare className="w-4 h-4" />
                  Compare Version 1 ↔ Version {selectedReport.currentVersion}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Active Version Dossier Viewer (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeVersion ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Official Forensic Header */}
              <div className="bg-slate-950 border-b border-slate-800 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block font-mono">
                      State Forensic Science Laboratory • Division of Forensic Sciences
                    </span>
                    <h1 className="text-lg font-extrabold text-white mt-1">
                      {selectedReport?.title}
                    </h1>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyIntegrity(activeVersion.versionNumber)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Verify SHA-256
                    </button>
                  </div>
                </div>

                {/* Metadata Ribbons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                      Report ID
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">{selectedReport?.id}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                      Version
                    </span>
                    <span className="font-mono text-white font-bold">
                      Version {activeVersion.versionNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                      Case Dossier
                    </span>
                    <span className="font-mono text-slate-200">{selectedReport?.caseId}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                      Attestation
                    </span>
                    <span className="text-emerald-400 font-medium">✓ Digitally Signed</span>
                  </div>
                </div>

                {/* If Amended, show amendment attribution banner */}
                {activeVersion.amendmentReason && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                        Official Amendment Attribution:
                      </span>
                      <span className="font-semibold text-white">{activeVersion.amendmentReason}</span>
                    </div>
                    {activeVersion.amendmentDetails && (
                      <p className="text-slate-300 italic text-[11px]">
                        &ldquo;{activeVersion.amendmentDetails}&rdquo;
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Report Formal Sections */}
              <div className="p-6 space-y-6 text-xs text-slate-200 leading-relaxed">
                {/* Section 1: Evidence Examined */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    1. Evidence Articles Examined
                  </h4>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 font-mono text-slate-300">
                    {activeVersion.evidenceExamined}
                  </div>
                </div>

                {/* Section 2: Examination Method */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    2. Forensic Examination Methodology
                  </h4>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    {activeVersion.examinationMethod}
                  </div>
                </div>

                {/* Section 3: Observations */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    3. Technical Observations
                  </h4>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    {activeVersion.observations}
                  </div>
                </div>

                {/* Section 4: Forensic Findings */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    4. Forensic Findings & Scientific Deductions
                  </h4>
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/20 text-slate-100">
                    {activeVersion.findings}
                  </div>
                </div>

                {/* Section 5: Conclusion */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    5. Definitive Expert Conclusion
                  </h4>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 font-medium">
                    {activeVersion.conclusion}
                  </div>
                </div>

                {/* Section 6: Cryptographic Hash & Prototype Digital Signature Box */}
                <div className="bg-gradient-to-r from-slate-950 via-slate-950 to-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileSignature className="w-5 h-5 text-emerald-400" />
                      <div>
                        <span className="font-bold text-white block">
                          Digital Signature & Attestation Certificate
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Legally logged under State Forensic Science Rules
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      AUTHENTICATED RECORD
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                        Attesting Forensic Examiner
                      </span>
                      <span className="text-white font-semibold">
                        {activeVersion.signedByName || activeVersion.author?.name} [{activeVersion.signedById || activeVersion.author?.badgeId}]
                      </span>
                      <span className="text-slate-400 text-[11px] block">
                        {activeVersion.signedByDesignation || activeVersion.author?.designation}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                        Attestation Timestamp
                      </span>
                      <span className="text-white font-mono">
                        {new Date(activeVersion.signatureTimestamp || activeVersion.finalizedAt || activeVersion.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Canonical Document SHA-256 Hash
                      </span>
                      <span className="text-cyan-300 break-all select-all font-semibold">
                        {activeVersion.sha256Hash}
                      </span>
                    </div>

                    {activeVersion.signatureHash && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                          Cryptographic Signature Hash
                        </span>
                        <span className="text-slate-400 break-all select-all">
                          {activeVersion.signatureHash}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Select a forensic report from the portfolio to inspect its full dossier and version tree.
            </div>
          )}
        </div>
      </div>

      {/* Amendment Creator Modal */}
      {isAmendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  Formulate Forensic Report Amendment (V{selectedReport?.currentVersion! + 1})
                </h3>
                <p className="text-xs text-slate-400">
                  Prior Version {selectedReport?.currentVersion} will remain permanently preserved in historical audit.
                </p>
              </div>
              <button onClick={() => setIsAmendOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAmendSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Mandatory Reason Selection */}
              <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded-xl space-y-3">
                <div>
                  <label className="text-amber-300 font-bold uppercase tracking-wider block mb-1">
                    * Mandatory Official Amendment Reason
                  </label>
                  <select
                    value={amendmentReason}
                    onChange={(e) => setAmendmentReason(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-lg p-2.5 text-white font-medium focus:outline-none focus:border-amber-400"
                    required
                  >
                    {AMENDMENT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Justification & Detailed Context {amendmentReason === 'Other' && '(Mandatory for "Other")'}
                  </label>
                  <textarea
                    value={amendmentDetails}
                    onChange={(e) => setAmendmentDetails(e.target.value)}
                    rows={2}
                    placeholder="Specify exact justification, court order references, secondary lab results..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                    required={amendmentReason === 'Other'}
                  />
                </div>
              </div>

              {/* Updated Content Fields */}
              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 font-semibold uppercase block mb-1">
                    Evidence Examined
                  </label>
                  <input
                    type="text"
                    value={newEvidenceExamined}
                    onChange={(e) => setNewEvidenceExamined(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold uppercase block mb-1">
                    Forensic Examination Methodology
                  </label>
                  <textarea
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold uppercase block mb-1">
                    Technical Observations
                  </label>
                  <textarea
                    value={newObservations}
                    onChange={(e) => setNewObservations(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-emerald-400 font-semibold uppercase block mb-1">
                    * Updated Forensic Findings
                  </label>
                  <textarea
                    value={newFindings}
                    onChange={(e) => setNewFindings(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-emerald-500/40 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-cyan-400 font-semibold uppercase block mb-1">
                    * Updated Conclusion
                  </label>
                  <textarea
                    value={newConclusion}
                    onChange={(e) => setNewConclusion(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-cyan-500/40 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAmendOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg shadow-md"
                >
                  Sign & Commit Version {selectedReport?.currentVersion! + 1}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      <VersionCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        data={compareData}
      />

      {/* Integrity Verification Modal */}
      <IntegrityModal
        isOpen={isIntegrityOpen}
        onClose={() => setIsIntegrityOpen(false)}
        result={integrityResult}
        title="Report Cryptographic Integrity Verification"
      />
    </div>
  );
};
