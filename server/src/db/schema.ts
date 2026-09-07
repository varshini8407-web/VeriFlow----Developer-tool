export type VerificationDecision = 'SHIP' | 'REVIEW' | 'BLOCK';
export type VerificationStatus = 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'CANCELLED';
export type StageStatus = 'pending' | 'running' | 'passed' | 'warning' | 'failed' | 'skipped';
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type IssueStatus = 'open' | 'in_review' | 'fixed' | 'accepted_risk' | 'ignored';
export type TestCategory = 'positive' | 'negative' | 'boundary' | 'regression' | 'security' | 'integration';
export type DeviceState = 'IDLE' | 'VERIFYING' | 'PASSED' | 'REVIEW REQUIRED' | 'BLOCKED' | 'APPROVAL REQUIRED' | 'DEPLOYED';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  workspaceId: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  isDemo: boolean;
  projectsCount: number;
  createdAt: string;
}

export interface ProjectRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'critical' | 'high' | 'medium';
}

export interface ProjectFile {
  path: string;
  name: string;
  content: string;
  language: string;
  size: number;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  repoUrl: string;
  mainLanguage: string;
  defaultBranch: string;
  lastVerificationDate: string;
  lastDecision: VerificationDecision;
  openIssuesCount: number;
  environment: string;
  rules: ProjectRule[];
  files: ProjectFile[];
  createdAt: string;
}

export interface VerificationStage {
  id: number;
  name: string;
  description: string;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  logs: string[];
  findingsCount?: number;
  details?: Record<string, any>;
}

export interface Requirement {
  id: string;
  verificationRunId: string;
  code: string; // e.g. "REQ-001"
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  testable: boolean;
  status: 'passed' | 'failed' | 'unverified';
  relatedFiles: string[];
  relatedTests: string[];
  evidenceSummary: string;
}

export interface TestCase {
  id: string;
  verificationRunId: string;
  name: string;
  category: TestCategory;
  description: string;
  file: string;
  code: string;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  errorMessage?: string;
  stackTrace?: string;
  stdout?: string;
  stderr?: string;
}

export interface Issue {
  id: string;
  projectId: string;
  verificationRunId: string;
  title: string;
  severity: IssueSeverity;
  category: 'security' | 'logic_error' | 'timezone_bug' | 'concurrency' | 'dependency' | 'database';
  file: string;
  lineNumber: number;
  explanation: string;
  evidence: string;
  suggestedFix: string;
  patchDiff?: string;
  status: IssueStatus;
  assignedTo?: string;
  createdAt: string;
}

export interface EvidenceItem {
  id: string;
  verificationRunId: string;
  requirementCode: string;
  requirementTitle: string;
  evidenceType: 'Automated Test' | 'Boundary Test' | 'Security Taint Scan' | 'Static Analysis' | 'Integration Contract' | 'DB Verification';
  evidenceSource: string;
  result: 'Passed' | 'Failed' | 'Warning' | 'Incomplete';
  timestamp: string;
  details: string;
}

export interface DependencyNode {
  id: string;
  name: string;
  type: 'file' | 'function' | 'endpoint' | 'service' | 'database' | 'test';
  path?: string;
  risk: 'critical' | 'high' | 'medium' | 'low' | 'clean';
  changed: boolean;
  details: string;
}

export interface DependencyEdge {
  source: string;
  target: string;
  label?: string;
  type?: 'calls' | 'imports' | 'queries' | 'tests';
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  affectedSummary: string[];
}

export interface PullRequest {
  id: string;
  projectId: string;
  number: number;
  title: string;
  branch: string;
  targetBranch: string;
  author: {
    name: string;
    avatar: string;
  };
  status: 'open' | 'merged' | 'closed';
  verificationDecision: VerificationDecision;
  riskScore: number;
  changedFiles: string[];
  reviewers: string[];
  reportMarkdown: string;
  proofOfShipId?: string;
  createdAt: string;
}

export interface ProofOfShip {
  id: string;
  verificationRunId: string;
  projectId: string;
  projectName: string;
  commitHash: string;
  requirementSummary: string;
  timestamp: string;
  decision: VerificationDecision;
  riskScore: number;
  shipConfidence: number; // e.g. 98%
  testsPassed: number;
  testsTotal: number;
  securityStatus: 'CLEAN' | 'WARNINGS' | 'CRITICAL';
  requirementCoverage: number; // e.g. 100%
  environment: string;
  certificateId: string; // e.g. "VF-CERT-2026-99214"
  verificationHash: string; // SHA-256
  qrCodeUrl: string;
  approvals: {
    approverName: string;
    role: string;
    approvedAt: string;
    decision: 'APPROVED' | 'REJECTED';
    comment?: string;
    channel: 'WEB' | 'DEVICE_BRIDGE' | 'VOICE';
  }[];
  disclaimer: string;
}

export interface VerificationRun {
  id: string;
  projectId: string;
  projectName: string;
  changeType: 'branch' | 'pr' | 'commit' | 'upload' | 'manual';
  changeTarget: string; // e.g. "PR #142: feat(coupon)-discount-engine"
  requirementText: string;
  verificationLevel: 'quick' | 'standard' | 'strict';
  status: VerificationStatus;
  decision: VerificationDecision;
  riskScore: number; // 0 to 100
  shipConfidence: number; // 0 to 100
  durationMs: number;
  startedAt: string;
  completedAt?: string;
  stages: VerificationStage[];
  requirements: Requirement[];
  testCases: TestCase[];
  issues: Issue[];
  evidence: EvidenceItem[];
  dependencyGraph: DependencyGraph;
  proofOfShipId?: string;
  stats: {
    requirementsTotal: number;
    requirementsVerified: number;
    testsTotal: number;
    testsPassed: number;
    testsFailed: number;
    securityFindings: number;
    filesChanged: number;
    affectedModules: number;
  };
  aiExplanation?: {
    summary: string;
    rootCause: string;
    impact: string;
    affectedFiles: string[];
    suggestedFix: string;
    isSafeToDeploy: boolean;
    repairAttempts: number;
  };
}

export interface DeviceSession {
  id: string;
  deviceToken: string;
  deviceName: string;
  activeVerificationRunId?: string;
  connectedAt: string;
  lastPingAt: string;
  status: 'connected' | 'idle' | 'disconnected';
  state: DeviceState;
}

export interface OfficeKitState {
  device: string;
  state: DeviceState;
  projectId: string;
  projectName: string;
  verificationRunId?: string;
  reason?: string;
  stageName?: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  details: string;
  ip: string;
  timestamp: string;
}
