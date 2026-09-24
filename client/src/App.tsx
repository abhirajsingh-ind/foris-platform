import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { FaceVerification } from './pages/FaceVerification';
import { Dashboard } from './pages/Dashboard';
import { Cases } from './pages/Cases';
import { EvidencePage } from './pages/Evidence';
import { ReportsPage } from './pages/Reports';
import { AuditTrailPage } from './pages/AuditTrail';
import { SecurityCenterPage } from './pages/SecurityCenter';
import { UsersPage } from './pages/Users';
import { AnalyticsPage } from './pages/Analytics';
import { ForisSamadhaan } from './pages/ForisSamadhaan';
import { ForensicLensAI } from './pages/ForensicLensAI';
import { ChainOfCustodyPage } from './pages/Custody';

const AppContent: React.FC = () => {
  const { user, isLoading, faceVerified } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono tracking-wider">
          INITIALIZING FORIS FORENSIC CORE...
        </span>
      </div>
    );
  }

  // PAGE 1: Login (credentials only)
  if (!user) {
    return <Login />;
  }

  // PAGE 2: Face Recognition (after successful credential login)
  if (!faceVerified) {
    return <FaceVerification />;
  }

  // Authenticated dashboard and feature pages
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            setActiveTab={setActiveTab}
            onSelectCase={(caseId) => {
              setSelectedCaseId(caseId);
              setActiveTab('cases');
            }}
            onSelectReport={(repId) => {
              setSelectedReportId(repId);
              setActiveTab('reports');
            }}
          />
        );
      case 'cases':
        return (
          <Cases
            initialCaseId={selectedCaseId}
            setActiveTab={setActiveTab}
            onSelectReport={(repId) => {
              setSelectedReportId(repId);
              setActiveTab('reports');
            }}
          />
        );
      case 'evidence':
        return <EvidencePage initialEvidenceId={selectedEvidenceId} />;
      case 'reports':
        return <ReportsPage initialReportId={selectedReportId} />;
      case 'custody':
        return <ChainOfCustodyPage initialEvidenceId={selectedEvidenceId} setActiveTab={setActiveTab} />;
      case 'audit':
        return <AuditTrailPage />;
      case 'security':
        return <SecurityCenterPage />;
      case 'users':
        return <UsersPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'samadhaan':
        return <ForisSamadhaan setActiveTab={setActiveTab} />;
      case 'lens':
        return <ForensicLensAI setActiveTab={setActiveTab} />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
