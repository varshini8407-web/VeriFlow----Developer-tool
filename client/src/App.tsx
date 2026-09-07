import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { ProjectsPage } from './components/projects/ProjectsPage';
import { VerificationResultPage } from './components/verification/VerificationResultPage';
import { PullRequestsPage } from './components/pullrequests/PullRequestsPage';
import { IssuesPage } from './components/issues/IssuesPage';
import { ProofOfShipPage } from './components/proofofship/ProofOfShipPage';
import { TestCasesPage } from './components/testcases/TestCasesPage';
import { SecurityPage } from './components/security/SecurityPage';
import { DeviceBridgePage } from './components/bridge/DeviceBridgePage';
import { OfficeKitPage } from './components/officekit/OfficeKitPage';
import { IntegrationsPage } from './components/integrations/IntegrationsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { NewVerificationWizard } from './components/verification/NewVerificationWizard';

const MainContent: React.FC = () => {
  const { currentRoute } = useApp();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'overview':
        return <OverviewDashboard onOpenWizard={() => setIsWizardOpen(true)} />;
      case 'projects':
        return <ProjectsPage onOpenWizard={() => setIsWizardOpen(true)} />;
      case 'verifications':
        return <VerificationResultPage />;
      case 'pull-requests':
        return <PullRequestsPage />;
      case 'issues':
        return <IssuesPage />;
      case 'proof-of-ship':
        return <ProofOfShipPage />;
      case 'test-cases':
        return <TestCasesPage />;
      case 'security':
        return <SecurityPage />;
      case 'device-bridge':
        return <DeviceBridgePage />;
      case 'office-kit':
        return <OfficeKitPage />;
      case 'integrations':
        return <IntegrationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewDashboard onOpenWizard={() => setIsWizardOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#090a0f] text-slate-100 overflow-hidden font-sans">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar onOpenWizard={() => setIsWizardOpen(true)} />

        <main className="flex-1 overflow-y-auto px-8 py-6">
          {renderCurrentView()}
        </main>
      </div>

      {/* Verification Modal Wizard */}
      <NewVerificationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />

      {/* Toast System */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
