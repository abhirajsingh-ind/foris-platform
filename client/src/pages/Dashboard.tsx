import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  MoreHorizontal,
  Download,
  Crosshair,
  Activity,
  X,
  CheckCircle2,
  FileText,
  Clock,
  Shield,
  Filter,
  ArrowDownToLine,
  SlidersHorizontal,
} from 'lucide-react';
import officerPhoto from '../assets/rajesh_varma.jpg';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onSelectCase?: (caseId: string) => void;
  onSelectReport?: (reportId: string) => void;
}

// ============================================================================
// REALISTIC DRONE SVG ILLUSTRATIONS (Matching Reference Design 1:1)
// ============================================================================

const MavicDroneSvg: React.FC = () => (
  <svg viewBox="0 0 160 90" className="w-24 h-16 text-slate-800" fill="none">
    {/* Arms */}
    <line x1="42" y1="20" x2="118" y2="70" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="42" y1="70" x2="118" y2="20" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
    {/* Center Chassis Body */}
    <rect x="68" y="24" width="24" height="42" rx="7" fill="#0f172a" />
    <rect x="73" y="28" width="14" height="14" rx="3" fill="#334155" />
    {/* Front Gimbal Camera */}
    <circle cx="80" cy="20" r="5" fill="#020617" stroke="#475569" strokeWidth="1.5" />
    <circle cx="80" cy="20" r="2" fill="#0284c7" />
    {/* Motor Hubs */}
    <circle cx="40" cy="19" r="4.5" fill="#020617" />
    <circle cx="120" cy="19" r="4.5" fill="#020617" />
    <circle cx="40" cy="71" r="4.5" fill="#020617" />
    <circle cx="120" cy="71" r="4.5" fill="#020617" />
    {/* Dual Blades */}
    <ellipse cx="40" cy="19" rx="18" ry="3" fill="#64748b" opacity="0.6" transform="rotate(-15 40 19)" />
    <ellipse cx="120" cy="19" rx="18" ry="3" fill="#64748b" opacity="0.6" transform="rotate(15 120 19)" />
    <ellipse cx="40" cy="71" rx="18" ry="3" fill="#64748b" opacity="0.6" transform="rotate(15 40 71)" />
    <ellipse cx="120" cy="71" rx="18" ry="3" fill="#64748b" opacity="0.6" transform="rotate(-15 120 71)" />
  </svg>
);

const AvataDroneSvg: React.FC = () => (
  <svg viewBox="0 0 160 90" className="w-24 h-16 text-slate-800" fill="none">
    {/* 4 Ducted Propeller Guards */}
    <circle cx="58" cy="32" r="14" stroke="#1e293b" strokeWidth="4" fill="#f8fafc" />
    <circle cx="102" cy="32" r="14" stroke="#1e293b" strokeWidth="4" fill="#f8fafc" />
    <circle cx="58" cy="58" r="14" stroke="#1e293b" strokeWidth="4" fill="#f8fafc" />
    <circle cx="102" cy="58" r="14" stroke="#1e293b" strokeWidth="4" fill="#f8fafc" />
    {/* Center Frame & Battery Block */}
    <rect x="71" y="28" width="18" height="34" rx="4" fill="#0f172a" />
    <rect x="74" y="32" width="12" height="12" rx="2" fill="#475569" />
    {/* FPV Camera Nose */}
    <rect x="75" y="20" width="10" height="7" rx="2" fill="#020617" />
    <circle cx="80" cy="23.5" r="1.8" fill="#ef4444" />
    {/* Mini hubs inside ducts */}
    <circle cx="58" cy="32" r="3" fill="#334155" />
    <circle cx="102" cy="32" r="3" fill="#334155" />
    <circle cx="58" cy="58" r="3" fill="#334155" />
    <circle cx="102" cy="58" r="3" fill="#334155" />
  </svg>
);

const NeoDroneSvg: React.FC = () => (
  <svg viewBox="0 0 160 90" className="w-22 h-14 text-slate-800" fill="none">
    {/* Enclosed Oval Cage Frame */}
    <rect x="46" y="28" width="68" height="34" rx="17" stroke="#334155" strokeWidth="3" fill="#f8fafc" />
    <line x1="80" y1="28" x2="80" y2="62" stroke="#475569" strokeWidth="2" />
    {/* Slim Center Body */}
    <rect x="72" y="25" width="16" height="40" rx="5" fill="#0f172a" />
    <circle cx="80" cy="29" r="2.5" fill="#38bdf8" />
    {/* Propellers */}
    <circle cx="60" cy="45" r="8" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="2 2" />
    <circle cx="100" cy="45" r="8" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="2 2" />
    <circle cx="60" cy="45" r="2.5" fill="#1e293b" />
    <circle cx="100" cy="45" r="2.5" fill="#1e293b" />
  </svg>
);

const InspireDroneSvg: React.FC = () => (
  <svg viewBox="0 0 160 90" className="w-24 h-16 text-slate-800" fill="none">
    {/* Transformable Elevated Carbon Fiber Arms */}
    <line x1="80" y1="52" x2="48" y2="24" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="80" y1="52" x2="112" y2="24" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="80" y1="52" x2="80" y2="68" stroke="#1e293b" strokeWidth="3.5" />
    {/* Top Motor Hubs */}
    <circle cx="48" cy="23" r="5" fill="#020617" />
    <circle cx="112" cy="23" r="5" fill="#020617" />
    {/* Blades */}
    <ellipse cx="48" cy="23" rx="18" ry="3" fill="#64748b" opacity="0.6" transform="rotate(-18 48 23)" />
    <ellipse cx="112" cy="23" rx="18" ry="3" fill="#64748b" opacity="0.6" transform="rotate(18 112 23)" />
    {/* Zenmuse Cinema Camera Hanging Below */}
    <rect x="73" y="62" width="14" height="12" rx="3" fill="#0f172a" />
    <circle cx="80" cy="68" r="4" fill="#334155" stroke="#e2e8f0" strokeWidth="1" />
    <circle cx="80" cy="68" r="1.8" fill="#0284c7" />
    {/* Center Node */}
    <polygon points="80,40 72,52 88,52" fill="#334155" />
  </svg>
);

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  onSelectCase,
  onSelectReport,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDroneModel, setNewDroneModel] = useState('DJI Mavic 3 Enterprise');
  const [newPriority, setNewPriority] = useState('Flagged');

  // Active Investigations Data
  const [investigations, setInvestigations] = useState([
    {
      id: 'inv-1',
      caseId: 'MP-FOR-2026-00125',
      model: 'DJI Mavic',
      title: 'DJI Mavic Investigation #202...',
      time: '10 minutes ago',
      badge: 'Flagged',
      badgeClass: 'bg-rose-50 text-rose-500 border border-rose-100/80',
      svg: <MavicDroneSvg />,
    },
    {
      id: 'inv-2',
      caseId: 'MP-FOR-2026-00126',
      model: 'DJI Avata',
      title: 'DJI Avata Investigation #202...',
      time: '1 hour ago',
      badge: 'Analysis',
      badgeClass: 'bg-blue-50 text-blue-600 border border-blue-100/80',
      svg: <AvataDroneSvg />,
    },
    {
      id: 'inv-3',
      caseId: 'MP-FOR-2026-00127',
      model: 'DJI Neo',
      title: 'DJI Neo Investigation #2025-...',
      time: '10 minutes ago',
      badge: 'In Progress',
      badgeClass: 'bg-amber-50 text-amber-600 border border-amber-100/80',
      svg: <NeoDroneSvg />,
    },
    {
      id: 'inv-4',
      caseId: 'MP-FOR-2026-00128',
      model: 'DJI Inspire',
      title: 'DJI Inspire Investigation #20...',
      time: '1 hour ago',
      badge: 'Completed',
      badgeClass: 'bg-emerald-50 text-emerald-600 border border-emerald-100/80',
      svg: <InspireDroneSvg />,
    },
  ]);

  // Thread Feed Data (1:1 with Screenshot)
  const threadFeed = [
    {
      id: 'tf-1',
      title: 'New Drone Detection in Restricted Area',
      time: '10 minutes ago',
      type: 'drone',
    },
    {
      id: 'tf-2',
      title: 'Suspicious Flight Pattern Detected',
      time: '1 hour ago',
      type: 'flight',
    },
    {
      id: 'tf-3',
      title: 'New Drone Detection in Restricted Area',
      time: '1 hour ago',
      type: 'drone',
    },
    {
      id: 'tf-4',
      title: 'New Drone Detection in Restricted Area',
      time: '1 hour ago',
      type: 'drone',
    },
    {
      id: 'tf-5',
      title: 'Suspicious Flight Pattern Detected',
      time: '1 hour ago',
      type: 'flight',
    },
  ];

  // Recent Reports Data (3x2 Grid 1:1 with Screenshot)
  const recentReports = [
    {
      id: 'rep-1',
      title: 'Forensic Analysis Report',
      date: 'Generated on Jan 15, 2025',
      format: 'PDF',
      color: 'bg-[#ef4444]',
    },
    {
      id: 'rep-2',
      title: 'Monthly Summary Report',
      date: 'Generated on Jan 15, 2025',
      format: 'DOC',
      color: 'bg-[#3b82f6]',
    },
    {
      id: 'rep-3',
      title: 'Incident Analysis Report',
      date: 'Generated on Jan 15, 2025',
      format: 'CSV',
      color: 'bg-[#10b981]',
    },
    {
      id: 'rep-4',
      title: 'Forensic Analysis Report',
      date: 'Generated on Jan 15, 2025',
      format: 'TXT',
      color: 'bg-[#334155]',
    },
    {
      id: 'rep-5',
      title: 'Monthly Summary Report',
      date: 'Generated on Jan 15, 2025',
      format: 'PDF',
      color: 'bg-[#ef4444]',
    },
    {
      id: 'rep-6',
      title: 'Incident Analysis Report',
      date: 'Generated on Jan 15, 2025',
      format: 'DOC',
      color: 'bg-[#3b82f6]',
    },
  ];

  // Search filter
  const filteredInvestigations = investigations.filter((inv) =>
    inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateInvestigation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let badgeClass = 'bg-rose-50 text-rose-500 border border-rose-100/80';
    let SvgComponent = <MavicDroneSvg />;

    if (newPriority === 'Analysis') {
      badgeClass = 'bg-blue-50 text-blue-600 border border-blue-100/80';
      SvgComponent = <AvataDroneSvg />;
    } else if (newPriority === 'In Progress') {
      badgeClass = 'bg-amber-50 text-amber-600 border border-amber-100/80';
      SvgComponent = <NeoDroneSvg />;
    } else if (newPriority === 'Completed') {
      badgeClass = 'bg-emerald-50 text-emerald-600 border border-emerald-100/80';
      SvgComponent = <InspireDroneSvg />;
    }

    const newInv = {
      id: `inv-${Date.now()}`,
      caseId: `MP-FOR-2026-${Math.floor(100 + Math.random() * 900)}`,
      model: newDroneModel,
      title: newTitle,
      time: 'Just now',
      badge: newPriority,
      badgeClass,
      svg: SvgComponent,
    };

    setInvestigations([newInv, ...investigations]);
    setIsModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="min-h-full bg-[#f4f5f7] text-gray-900 font-sans p-6 sm:p-8">
      {/* ==================================================================== */}
      {/* TOP HEADER: DASHBOARD TITLE + SEARCH + NEW INVESTIGATION + AVATAR    */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-gray-500 font-normal mt-0.5">
            You have {investigations.length} Active Investigations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Clean Search Input */}
          <div className="relative flex items-center bg-white border border-gray-200/90 rounded-lg px-3 py-1.5 w-64 shadow-2xs focus-within:border-gray-300 transition-all">
            <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search anything"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none"
            />
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <kbd className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                ⌘
              </kbd>
              <kbd className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                F
              </kbd>
            </div>
          </div>

          {/* Primary Action Red Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-[#d91d18] hover:bg-[#b91512] text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Investigation</span>
          </button>

          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
            <img
              src={officerPhoto}
              alt={user?.name || 'Officer'}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MAIN 2-COLUMN GRID: ACTIVE INVESTIGATIONS (LEFT) + THREAD FEED (RIGHT)*/}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ------------------------------------------------------------------ */}
        {/* CARD 1: ACTIVE INVESTIGATIONS (7 Cols, 2x2 Grid)                   */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Active Investigations</h2>
            <button
              type="button"
              className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* 2x2 Clean Divide Grid */}
          <div className="border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {filteredInvestigations.slice(0, 4).map((inv, idx) => (
              <div
                key={inv.id}
                onClick={() => {
                  if (onSelectCase) onSelectCase(inv.caseId);
                  else setActiveTab('cases');
                }}
                className={`p-6 flex flex-col justify-between hover:bg-gray-50/70 transition-colors cursor-pointer group ${
                  idx >= 2 ? 'sm:border-t border-gray-100' : ''
                }`}
              >
                {/* Centered Realistic Drone SVG Illustration */}
                <div className="h-24 flex items-center justify-center mb-3">
                  <div className="transform group-hover:scale-105 transition-transform duration-200">
                    {inv.svg}
                  </div>
                </div>

                {/* Info and Status */}
                <div className="space-y-1">
                  <div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block ${inv.badgeClass}`}
                    >
                      {inv.badge}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                    {inv.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-normal">
                    {inv.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* CARD 2: THREAD FEED (5 Cols, 5 Rows)                               */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Thread Feed</h2>
            <button
              type="button"
              className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* 5 Rows */}
          <div className="border-t border-gray-100 divide-y divide-gray-100">
            {threadFeed.map((item) => (
              <div
                key={item.id}
                className="px-6 py-3.5 flex items-center gap-3.5 hover:bg-gray-50/70 transition-colors"
              >
                {/* Clean Circular Icon Badge */}
                <div className="w-8 h-8 rounded-full border border-gray-100 bg-[#f9fafb] flex items-center justify-center shrink-0">
                  {item.type === 'drone' ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="6" cy="6" r="2" />
                      <circle cx="18" cy="6" r="2" />
                      <circle cx="6" cy="18" r="2" />
                      <circle cx="18" cy="18" r="2" />
                      <path d="M12 9v6m-3-3h6" />
                      <path d="M7.5 7.5l9 9m0-9l-9 9" opacity="0.35" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        d="M4 15c2-3 4.5-6 7.5-3s5 6 8.5 3"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-medium text-gray-900 leading-snug truncate">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-gray-400 font-normal block mt-0.5">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* CARD 3: RECENT REPORTS (12 Cols, 3 Columns x 2 Rows)               */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-12 bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Reports</h2>
            <button
              type="button"
              className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* 3x2 Grid */}
          <div className="border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {recentReports.map((rep, idx) => (
              <div
                key={rep.id}
                onClick={() => {
                  if (onSelectReport) onSelectReport(rep.id);
                  else setActiveTab('reports');
                }}
                className={`p-5 flex items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors cursor-pointer group ${
                  idx >= 3 ? 'md:border-t border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* File Format Badge */}
                  <div
                    className={`w-7 h-7 rounded-md ${rep.color} text-white font-black text-[9px] flex items-center justify-center shrink-0 shadow-2xs`}
                  >
                    {rep.format}
                  </div>

                  {/* Title & Date */}
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                      {rep.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                      {rep.date}
                    </p>
                  </div>
                </div>

                {/* Subtle Download Tray Icon */}
                <button
                  type="button"
                  className="text-gray-400 group-hover:text-gray-700 p-1.5 rounded hover:bg-gray-100 transition-colors shrink-0"
                  title={`Download ${rep.format}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Downloading ${rep.title} (${rep.format})...`);
                  }}
                >
                  <ArrowDownToLine className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL: + NEW INVESTIGATION                                           */}
      {/* ==================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">New Investigation</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvestigation} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Investigation Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DJI Matrice Airspace Breach #2026-042"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-xs outline-none focus:border-red-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  UAV / Drone Target Hardware
                </label>
                <select
                  value={newDroneModel}
                  onChange={(e) => setNewDroneModel(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-xs outline-none focus:border-red-500 focus:bg-white"
                >
                  <option value="DJI Mavic 3 Enterprise">DJI Mavic 3 Enterprise</option>
                  <option value="DJI Avata FPV Cinewhoop">DJI Avata FPV Cinewhoop</option>
                  <option value="DJI Neo Palm UAV">DJI Neo Palm UAV</option>
                  <option value="DJI Inspire 3 Cinema">DJI Inspire 3 Cinema</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Initial Status
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-xs outline-none focus:border-red-500 focus:bg-white"
                >
                  <option value="Flagged">Flagged</option>
                  <option value="Analysis">Analysis</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#d91d18] hover:bg-[#b91512] text-white font-semibold text-xs shadow-sm transition-all"
                >
                  Create Investigation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
