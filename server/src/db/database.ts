import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  User,
  Workspace,
  Project,
  VerificationRun,
  PullRequest,
  ProofOfShip,
  Notification,
  AuditLog,
  OfficeKitState,
  Issue,
  DeviceSession
} from './schema.js';
import {
  SEED_USER,
  SEED_WORKSPACES,
  SEED_PROJECTS,
  INITIAL_VERIFICATION_RUN,
  SEED_PULL_REQUESTS,
  SEED_PROOF_OF_SHIP,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
  SEED_OFFICE_KIT_STATE
} from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'veriflow_db.json');

export interface DatabaseState {
  user: User;
  workspaces: Workspace[];
  projects: Project[];
  verifications: VerificationRun[];
  issues: Issue[];
  pullRequests: PullRequest[];
  proofOfShip: ProofOfShip[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  officeKit: OfficeKitState;
  deviceSessions: DeviceSession[];
}

export class Database {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): DatabaseState {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.warn('[DB] Failed to parse existing db file, resetting to initial seed.');
      }
    }

    const initial: DatabaseState = {
      user: SEED_USER,
      workspaces: SEED_WORKSPACES,
      projects: SEED_PROJECTS,
      verifications: [INITIAL_VERIFICATION_RUN],
      issues: INITIAL_VERIFICATION_RUN.issues,
      pullRequests: SEED_PULL_REQUESTS,
      proofOfShip: SEED_PROOF_OF_SHIP,
      notifications: SEED_NOTIFICATIONS,
      auditLogs: SEED_AUDIT_LOGS,
      officeKit: SEED_OFFICE_KIT_STATE,
      deviceSessions: []
    };

    this.saveState(initial);
    return initial;
  }

  private saveState(customState?: DatabaseState) {
    try {
      const data = customState || this.state;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error writing to db file:', err);
    }
  }

  public resetToSeed(): DatabaseState {
    const fresh: DatabaseState = {
      user: SEED_USER,
      workspaces: SEED_WORKSPACES,
      projects: JSON.parse(JSON.stringify(SEED_PROJECTS)),
      verifications: [JSON.parse(JSON.stringify(INITIAL_VERIFICATION_RUN))],
      issues: JSON.parse(JSON.stringify(INITIAL_VERIFICATION_RUN.issues)),
      pullRequests: JSON.parse(JSON.stringify(SEED_PULL_REQUESTS)),
      proofOfShip: JSON.parse(JSON.stringify(SEED_PROOF_OF_SHIP)),
      notifications: JSON.parse(JSON.stringify(SEED_NOTIFICATIONS)),
      auditLogs: JSON.parse(JSON.stringify(SEED_AUDIT_LOGS)),
      officeKit: JSON.parse(JSON.stringify(SEED_OFFICE_KIT_STATE)),
      deviceSessions: []
    };
    this.state = fresh;
    this.saveState();
    return fresh;
  }

  // User & Workspace
  public getUser(): User {
    return this.state.user;
  }

  public getWorkspaces(): Workspace[] {
    return this.state.workspaces;
  }

  // Projects
  public getProjects(): Project[] {
    return this.state.projects;
  }

  public getProject(id: string): Project | undefined {
    return this.state.projects.find((p) => p.id === id);
  }

  public createProject(project: Project): Project {
    this.state.projects.unshift(project);
    this.saveState();
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const idx = this.state.projects.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.state.projects[idx] = { ...this.state.projects[idx], ...updates };
    this.saveState();
    return this.state.projects[idx];
  }

  public deleteProject(id: string): boolean {
    const initialLen = this.state.projects.length;
    this.state.projects = this.state.projects.filter((p) => p.id !== id);
    this.saveState();
    return this.state.projects.length < initialLen;
  }

  // Verification Runs
  public getVerifications(): VerificationRun[] {
    return this.state.verifications;
  }

  public getVerification(id: string): VerificationRun | undefined {
    return this.state.verifications.find((v) => v.id === id);
  }

  public saveVerification(run: VerificationRun): VerificationRun {
    const idx = this.state.verifications.findIndex((v) => v.id === run.id);
    if (idx >= 0) {
      this.state.verifications[idx] = run;
    } else {
      this.state.verifications.unshift(run);
    }

    // Also update/sync issues
    if (run.issues && run.issues.length > 0) {
      for (const iss of run.issues) {
        const issIdx = this.state.issues.findIndex((i) => i.id === iss.id);
        if (issIdx >= 0) {
          this.state.issues[issIdx] = iss;
        } else {
          this.state.issues.unshift(iss);
        }
      }
    }

    // Update Project last status
    this.updateProject(run.projectId, {
      lastVerificationDate: run.completedAt || run.startedAt,
      lastDecision: run.decision,
      openIssuesCount: run.issues.filter((i) => i.status === 'open').length
    });

    this.saveState();
    return run;
  }

  // Issues
  public getIssues(projectId?: string): Issue[] {
    if (projectId) {
      return this.state.issues.filter((i) => i.projectId === projectId);
    }
    return this.state.issues;
  }

  public getIssue(id: string): Issue | undefined {
    return this.state.issues.find((i) => i.id === id);
  }

  public updateIssue(id: string, updates: Partial<Issue>): Issue | undefined {
    const idx = this.state.issues.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    this.state.issues[idx] = { ...this.state.issues[idx], ...updates };
    this.saveState();
    return this.state.issues[idx];
  }

  // Pull Requests
  public getPullRequests(projectId?: string): PullRequest[] {
    if (projectId) {
      return this.state.pullRequests.filter((pr) => pr.projectId === projectId);
    }
    return this.state.pullRequests;
  }

  public getPullRequest(id: string): PullRequest | undefined {
    return this.state.pullRequests.find((pr) => pr.id === id);
  }

  public updatePullRequest(id: string, updates: Partial<PullRequest>): PullRequest | undefined {
    const idx = this.state.pullRequests.findIndex((pr) => pr.id === id);
    if (idx === -1) return undefined;
    this.state.pullRequests[idx] = { ...this.state.pullRequests[idx], ...updates };
    this.saveState();
    return this.state.pullRequests[idx];
  }

  // Proof of Ship
  public getProofOfShipList(): ProofOfShip[] {
    return this.state.proofOfShip;
  }

  public getProofOfShip(idOrCert: string): ProofOfShip | undefined {
    return this.state.proofOfShip.find(
      (p) => p.id === idOrCert || p.certificateId === idOrCert || p.verificationRunId === idOrCert
    );
  }

  public saveProofOfShip(cert: ProofOfShip): ProofOfShip {
    const idx = this.state.proofOfShip.findIndex((p) => p.id === cert.id);
    if (idx >= 0) {
      this.state.proofOfShip[idx] = cert;
    } else {
      this.state.proofOfShip.unshift(cert);
    }
    this.saveState();
    return cert;
  }

  // Notifications
  public getNotifications(): Notification[] {
    return this.state.notifications;
  }

  public addNotification(n: Notification): Notification {
    this.state.notifications.unshift(n);
    this.saveState();
    return n;
  }

  public markNotificationRead(id: string) {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveState();
    }
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.state.auditLogs;
  }

  public addAuditLog(log: AuditLog): AuditLog {
    this.state.auditLogs.unshift(log);
    this.saveState();
    return log;
  }

  // Office Kit
  public getOfficeKit(): OfficeKitState {
    return this.state.officeKit;
  }

  public updateOfficeKit(state: Partial<OfficeKitState>): OfficeKitState {
    this.state.officeKit = {
      ...this.state.officeKit,
      ...state,
      updatedAt: new Date().toISOString()
    };
    this.saveState();
    return this.state.officeKit;
  }

  // Device Sessions
  public getDeviceSessions(): DeviceSession[] {
    return this.state.deviceSessions;
  }

  public registerDeviceSession(session: DeviceSession): DeviceSession {
    const idx = this.state.deviceSessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      this.state.deviceSessions[idx] = session;
    } else {
      this.state.deviceSessions.push(session);
    }
    this.saveState();
    return session;
  }
}

export const db = new Database();
