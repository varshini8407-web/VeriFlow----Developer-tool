import type {
  User,
  Workspace,
  Project,
  VerificationRun,
  PullRequest,
  ProofOfShip,
  Issue,
  Notification,
  AuditLog,
  OfficeKitState
} from '../types';

const API_BASE = '/api';

export const api = {
  // Auth & Workspaces
  async getMe(): Promise<{ user: User; workspaces: Workspace[] }> {
    const res = await fetch(`${API_BASE}/auth/me`);
    return res.json();
  },

  async getWorkspaces(): Promise<Workspace[]> {
    const res = await fetch(`${API_BASE}/workspaces`);
    return res.json();
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
  },

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    return res.json();
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async resetDemo(): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/demo/reset`, { method: 'POST' });
    return res.json();
  },

  // Verifications
  async getVerifications(): Promise<VerificationRun[]> {
    const res = await fetch(`${API_BASE}/verifications`);
    return res.json();
  },

  async getVerification(id: string): Promise<VerificationRun> {
    const res = await fetch(`${API_BASE}/verifications/${id}`);
    return res.json();
  },

  async startVerification(data: {
    projectId: string;
    requirementText: string;
    changeType: string;
    changeTarget: string;
    verificationLevel: string;
    customCode?: string;
  }): Promise<VerificationRun> {
    const res = await fetch(`${API_BASE}/verifications/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async applyFixAndRerun(runId: string): Promise<VerificationRun> {
    const res = await fetch(`${API_BASE}/verifications/${runId}/apply-fix-and-rerun`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  // Issues
  async getIssues(projectId?: string): Promise<Issue[]> {
    const url = projectId ? `${API_BASE}/issues?projectId=${projectId}` : `${API_BASE}/issues`;
    const res = await fetch(url);
    return res.json();
  },

  async resolveIssue(id: string): Promise<Issue> {
    const res = await fetch(`${API_BASE}/issues/${id}/resolve`, { method: 'POST' });
    return res.json();
  },

  // Pull Requests
  async getPullRequests(projectId?: string): Promise<PullRequest[]> {
    const url = projectId ? `${API_BASE}/pull-requests?projectId=${projectId}` : `${API_BASE}/pull-requests`;
    const res = await fetch(url);
    return res.json();
  },

  async getPullRequest(id: string): Promise<PullRequest> {
    const res = await fetch(`${API_BASE}/pull-requests/${id}`);
    return res.json();
  },

  // Proof of Ship
  async getProofOfShipList(): Promise<ProofOfShip[]> {
    const res = await fetch(`${API_BASE}/proof-of-ship`);
    return res.json();
  },

  async getProofOfShip(id: string): Promise<ProofOfShip> {
    const res = await fetch(`${API_BASE}/proof-of-ship/${id}`);
    return res.json();
  },

  async approveProofOfShip(
    id: string,
    data: { approverName?: string; comment?: string; channel?: 'WEB' | 'DEVICE_BRIDGE' | 'VOICE' }
  ): Promise<{ success: boolean; cert: ProofOfShip }> {
    const res = await fetch(`${API_BASE}/proof-of-ship/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Office Kit
  async getOfficeKit(): Promise<OfficeKitState> {
    const res = await fetch(`${API_BASE}/office-kit`);
    return res.json();
  },

  async setOfficeKitState(state: string, reason?: string): Promise<OfficeKitState> {
    const res = await fetch(`${API_BASE}/office-kit/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, reason })
    });
    return res.json();
  },

  // Device Bridge
  async getDeviceStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/device/status`);
    return res.json();
  },

  async sendDeviceCommand(command: string, runId?: string): Promise<{ success: boolean; command: string; reply: string }> {
    const res = await fetch(`${API_BASE}/device/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, runId })
    });
    return res.json();
  },

  // Notifications & Audit
  async getNotifications(): Promise<Notification[]> {
    const res = await fetch(`${API_BASE}/notifications`);
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' });
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit-logs`);
    return res.json();
  }
};

// WebSocket Service
export type WebSocketListener = (event: { type: string; payload: any; timestamp: string }) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private listeners: Set<WebSocketListener> = new Set();
  private reconnectTimer: any = null;

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WS] Connected to VeriFlow live server');
      };

      this.ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          this.listeners.forEach((listener) => listener(data));
        } catch (err) {
          console.error('[WS] Failed to parse message', err);
        }
      };

      this.ws.onclose = () => {
        console.warn('[WS] Disconnected. Reconnecting in 3s...');
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error('[WS] Error:', err);
      };
    } catch (err) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.connect(), 3000);
  }

  public subscribe(listener: WebSocketListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const wsManager = new WebSocketManager();
