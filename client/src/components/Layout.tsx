import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  FileText,
  BarChart2,
  Settings,
  Lock,
  RefreshCw,
  Share2,
  Plus,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  LogOut,
  X,
  User,
  CheckCircle2,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigateResource?: (type: 'case' | 'evidence' | 'report', id: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Navigation Items matching the reference design 1:1
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      targetTab: 'dashboard',
    },
    {
      id: 'investigations',
      label: 'Investigations',
      icon: Search,
      targetTab: 'cases',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      targetTab: 'reports',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart2,
      targetTab: 'analytics',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      targetTab: 'security',
    },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-[#e5e7eb] overflow-hidden font-sans select-none">
      {/* ==================================================================== */}
      {/* 1. TOP MACOS / BROWSER CHROME FRAME (Matching Screenshot 1:1)       */}
      {/* ==================================================================== */}
      <header className="h-10 bg-[#e5e7eb] border-b border-gray-300/80 px-4 flex items-center justify-between shrink-0 text-gray-600 text-xs">
        {/* Left: Window Dots & Navigation Controls */}
        <div className="flex items-center gap-3">
          {/* macOS Traffic Lights */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block shadow-2xs" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] inline-block shadow-2xs" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] inline-block shadow-2xs" />
          </div>

          {/* Sidebar Toggle & History Controls */}
          <div className="flex items-center gap-1 text-gray-500">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 hover:bg-gray-300/70 rounded transition-colors"
              title="Toggle sidebar"
            >
              <PanelLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:bg-gray-300/70 rounded transition-colors disabled:opacity-40">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:bg-gray-300/70 rounded transition-colors disabled:opacity-40">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: URL Address Bar */}
        <div className="flex items-center justify-center flex-1 max-w-md px-2">
          <div className="w-full bg-[#f3f4f6] border border-gray-300/90 rounded-md py-0.5 px-3 flex items-center justify-center gap-1.5 shadow-2xs">
            <Lock className="w-3 h-3 text-gray-500" />
            <span className="text-[11px] font-medium text-gray-800 tracking-tight">
              dronetrace.com
            </span>
            <RefreshCw className="w-2.5 h-2.5 text-gray-400 ml-1 hover:text-gray-700 cursor-pointer" />
          </div>
        </div>

        {/* Right: Action Icons */}
        <div className="flex items-center gap-2 text-gray-500">
          <button className="p-1 hover:bg-gray-300/70 rounded transition-colors" title="Share">
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:bg-gray-300/70 rounded transition-colors" title="New Tab">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:bg-gray-300/70 rounded transition-colors" title="View Tabs">
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. MAIN APP BODY: SIDEBAR (LEFT) + CONTENT (RIGHT)                   */}
      {/* ==================================================================== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ------------------------------------------------------------------ */}
        {/* SIDEBAR (Matching Reference 1:1)                                   */}
        {/* ------------------------------------------------------------------ */}
        {isSidebarOpen && (
          <aside className="w-56 bg-white border-r border-gray-200/90 flex flex-col justify-between shrink-0 p-4">
            <div className="space-y-4">
              {/* Brand Logo: Red & Black Delta Triangle + DRONETRACE */}
              <div className="flex items-center gap-2.5 px-1.5 py-1">
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none">
                  <path d="M12 21L3 5h18L12 21z" fill="#0f172a" />
                  <path d="M12 21L7.5 13h9L12 21z" fill="#d91d18" />
                  <path d="M12 5L7.5 13h9L12 5z" fill="#ffffff" opacity="0.25" />
                </svg>
                <span className="font-extrabold text-[12px] tracking-widest text-gray-900 uppercase">
                  DRONETRACE
                </span>
              </div>

              {/* Dotted Divider Line (Exactly as in Reference Screenshot) */}
              <div className="border-b border-dashed border-gray-200/90 mx-1" />

              {/* Navigation Links */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    (item.id === 'dashboard' && activeTab === 'dashboard') ||
                    (item.id === 'investigations' && activeTab === 'cases') ||
                    (item.id === 'reports' && activeTab === 'reports') ||
                    (item.id === 'analytics' && activeTab === 'analytics') ||
                    (item.id === 'settings' && (activeTab === 'security' || activeTab === 'users'));

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.targetTab)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'border border-gray-200/90 bg-white text-gray-900 font-semibold shadow-2xs'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-gray-800' : 'text-gray-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Section: Get Started (5/6 Completed) + Exit Session */}
            <div className="space-y-3 pt-4">
              {/* "Get Started" Progress Widget (Exactly as in Reference Screenshot) */}
              <div className="p-2.5 bg-white border border-gray-200/90 rounded-2xl shadow-2xs flex items-center gap-2.5">
                {/* Red Circular Progress Arc */}
                <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
                  <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-100"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#d91d18]"
                      strokeDasharray="83, 100"
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">Get Started</h4>
                  <p className="text-[10px] text-gray-400 font-medium">5/6 Completed</p>
                </div>
              </div>

              {/* Officer Account / Exit */}
              <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-gray-500 border-t border-gray-100">
                <span className="truncate font-medium">{user?.name || 'Dr. Abhiraj Singh'}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* MAIN CONTENT AREA: Renders Dashboard or Selected View             */}
        {/* ------------------------------------------------------------------ */}
        <main className="flex-1 overflow-y-auto bg-[#f4f5f7]">
          {children}
        </main>
      </div>
    </div>
  );
};
