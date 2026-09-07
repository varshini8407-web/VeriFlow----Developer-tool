import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type {
  User,
  Workspace,
  Project,
  VerificationRun,
  PullRequest,
  ProofOfShip,
  Issue,
  Notification,
  OfficeKitState
} from '../types';
import { api, wsManager } from '../services/api';
import { sfx } from '../services/audio';
import confetti from 'canvas-confetti';

export type NavigationRoute =
  | 'overview'
  | 'projects'
  | 'verifications'
  | 'pull-requests'
  | 'issues'
  | 'proof-of-ship'
  | 'test-cases'
  | 'security'
  | 'integrations'
  | 'device-bridge'
  | 'office-kit'
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  user: User | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (ws: Workspace) => void;
  currentRoute: NavigationRoute;
  setCurrentRoute: (route: NavigationRoute) => void;
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedProject: Project | null;
  verifications: VerificationRun[];
  activeRun: VerificationRun | null;
  setActiveRun: (run: VerificationRun | null) => void;
  isVerifying: boolean;
  issues: Issue[];
  pullRequests: PullRequest[];
  proofOfShipList: ProofOfShip[];
  officeKit: OfficeKitState | null;
  notifications: Notification[];
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;
  startNewVerification: (params: {
    projectId: string;
    requirementText: string;
    changeType: string;
    changeTarget: string;
    verificationLevel: string;
  }) => Promise<VerificationRun>;
  applyFixAndRerun: (runId: string) => Promise<VerificationRun>;
  resetDemoState: () => Promise<void>;
  refreshData: () => Promise<void>;
  viewRunDetails: (runId: string) => void;
  viewProofOfShip: (id: string) => void;
  selectedProofOfShip: ProofOfShip | null;
  setSelectedProofOfShip: (cert: ProofOfShip | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [currentRoute, setCurrentRoute] = useState<NavigationRoute>('overview');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-coupon-demo');

  const [verifications, setVerifications] = useState<VerificationRun[]>([]);
  const [activeRun, setActiveRun] = useState<VerificationRun | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [issues, setIssues] = useState<Issue[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [proofOfShipList, setProofOfShipList] = useState<ProofOfShip[]>([]);
  const [selectedProofOfShip, setSelectedProofOfShip] = useState<ProofOfShip | null>(null);

  const [officeKit, setOfficeKit] = useState<OfficeKitState | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshData = async () => {
    try {
      const [userData, projs, runs, iss, prs, pos, oKit, notifs] = await Promise.all([
        api.getMe(),
        api.getProjects(),
        api.getVerifications(),
        api.getIssues(),
        api.getPullRequests(),
        api.getProofOfShipList(),
        api.getOfficeKit(),
        api.getNotifications()
      ]);

      setUser(userData.user);
      setWorkspaces(userData.workspaces);
      if (!currentWorkspace && userData.workspaces.length > 0) {
        setCurrentWorkspace(userData.workspaces[0]);
      }

      setProjects(projs);
      setVerifications(runs);
      if (runs.length > 0 && !activeRun) {
        setActiveRun(runs[0]);
      }
      setIssues(iss);
      setPullRequests(prs);
      setProofOfShipList(pos);
      setOfficeKit(oKit);
      setNotifications(notifs);
    } catch (err) {
      console.error('[App] Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    refreshData();
    wsManager.connect();

    const unsubscribe = wsManager.subscribe((event) => {
      console.log('[WS Event]', event.type, event.payload);

      if (event.type === 'VERIFICATION_STAGE_PROGRESS') {
        const { runId, stageId, status, logs, durationMs } = event.payload;
        setActiveRun((prev) => {
          if (!prev || prev.id !== runId) return prev;
          const updatedStages = prev.stages.map((s) =>
            s.id === stageId ? { ...s, status, logs: logs || s.logs, durationMs } : s
          );
          return { ...prev, stages: updatedStages };
        });
      } else if (event.type === 'VERIFICATION_COMPLETED') {
        const { decision, proofOfShipId } = event.payload;
        setIsVerifying(false);
        if (decision === 'SHIP') {
          sfx.playSuccess();
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          addToast('success', 'Release Certified: SHIP', 'All deterministic verification checks passed! Proof-of-Ship ready.');
        } else if (decision === 'BLOCK') {
          sfx.playFailure();
          addToast('error', 'Release BLOCKED', 'Critical test failures detected. Check VeriFlow Assistant for patch.');
        } else {
          addToast('warning', 'Release Under Review', 'Human approval required before production tag.');
        }
        refreshData();
      } else if (event.type === 'OFFICE_KIT_STATE_CHANGE') {
        setOfficeKit(event.payload);
      } else if (event.type === 'DEMO_RESET') {
        addToast('info', 'Demo Reset', 'Database reset to initial demo state.');
        refreshData();
      }
    });

    return () => unsubscribe();
  }, []);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || (projects.length > 0 ? projects[0] : null);

  const startNewVerification = async (params: {
    projectId: string;
    requirementText: string;
    changeType: string;
    changeTarget: string;
    verificationLevel: string;
  }) => {
    setIsVerifying(true);
    sfx.playClick();
    addToast('info', 'Verification Started', 'Executing 13-stage deterministic verification pipeline...');

    // Optimistic run
    const optimisticRun: VerificationRun = {
      id: `run-live-${Date.now()}`,
      projectId: params.projectId,
      projectName: selectedProject?.name || 'Coupon Checkout Service',
      changeType: params.changeType as any,
      changeTarget: params.changeTarget,
      requirementText: params.requirementText,
      verificationLevel: params.verificationLevel as any,
      status: 'RUNNING',
      decision: 'REVIEW',
      riskScore: 0,
      shipConfidence: 50,
      durationMs: 0,
      startedAt: new Date().toISOString(),
      stages: Array.from({ length: 13 }, (_, i) => ({
        id: i + 1,
        name: `Stage ${i + 1}`,
        description: 'Initializing...',
        status: i === 0 ? 'running' : 'pending',
        logs: []
      })),
      requirements: [],
      testCases: [],
      issues: [],
      evidence: [],
      dependencyGraph: { nodes: [], edges: [], affectedSummary: [] },
      stats: {
        requirementsTotal: 4,
        requirementsVerified: 0,
        testsTotal: 6,
        testsPassed: 0,
        testsFailed: 0,
        securityFindings: 0,
        filesChanged: 1,
        affectedModules: 3
      }
    };

    setActiveRun(optimisticRun);
    setCurrentRoute('verifications');

    try {
      const result = await api.startVerification(params);
      setActiveRun(result);
      await refreshData();
      return result;
    } finally {
      setIsVerifying(false);
    }
  };

  const applyFixAndRerun = async (runId: string) => {
    setIsVerifying(true);
    sfx.playClick();
    addToast('info', 'Patch Applied', 'Re-verifying with UTC timezone normalization & idempotency check...');
    try {
      const result = await api.applyFixAndRerun(runId);
      setActiveRun(result);
      await refreshData();
      return result;
    } finally {
      setIsVerifying(false);
    }
  };

  const resetDemoState = async () => {
    sfx.playClick();
    await api.resetDemo();
    await refreshData();
    if (verifications.length > 0) {
      setActiveRun(verifications[0]);
    }
  };

  const viewRunDetails = (runId: string) => {
    const run = verifications.find((v) => v.id === runId);
    if (run) {
      setActiveRun(run);
      setCurrentRoute('verifications');
    }
  };

  const viewProofOfShip = (id: string) => {
    const cert = proofOfShipList.find((p) => p.id === id || p.certificateId === id || p.verificationRunId === id);
    if (cert) {
      setSelectedProofOfShip(cert);
      setCurrentRoute('proof-of-ship');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        currentRoute,
        setCurrentRoute,
        projects,
        selectedProjectId,
        setSelectedProjectId,
        selectedProject,
        verifications,
        activeRun,
        setActiveRun,
        isVerifying,
        issues,
        pullRequests,
        proofOfShipList,
        officeKit,
        notifications,
        toasts,
        addToast,
        removeToast,
        startNewVerification,
        applyFixAndRerun,
        resetDemoState,
        refreshData,
        viewRunDetails,
        viewProofOfShip,
        selectedProofOfShip,
        setSelectedProofOfShip
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
