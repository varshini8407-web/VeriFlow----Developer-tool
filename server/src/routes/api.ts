import { Router } from 'express';
import { db } from '../db/database.js';
import { runVerificationPipeline } from '../engine/pipeline.js';
import { FIXED_COUPON_CODE, BUGGY_COUPON_CODE } from '../db/seed.js';
import { WebSocket } from 'ws';

export function createApiRouter(wsClients: Set<WebSocket>) {
  const router = Router();

  // Helper to broadcast WS messages
  const broadcast = (type: string, payload: any) => {
    const msg = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
    for (const client of wsClients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  };

  // Auth & Workspaces
  router.get('/auth/me', (req, res) => {
    res.json({ user: db.getUser(), workspaces: db.getWorkspaces() });
  });

  router.post('/auth/demo-login', (req, res) => {
    res.json({ success: true, user: db.getUser(), token: 'demo-jwt-token-alex-mercer' });
  });

  router.get('/workspaces', (req, res) => {
    res.json(db.getWorkspaces());
  });

  // Projects
  router.get('/projects', (req, res) => {
    res.json(db.getProjects());
  });

  router.get('/projects/:id', (req, res) => {
    const project = db.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  });

  router.post('/projects', (req, res) => {
    const { name, description, repoUrl, mainLanguage, environment } = req.body;
    const newProj = {
      id: `proj-${Date.now()}`,
      workspaceId: 'ws-demo-01',
      name: name || 'New Custom Project',
      description: description || 'Imported codebase repository for VeriFlow release certification.',
      repoUrl: repoUrl || 'https://github.com/custom/repo',
      mainLanguage: mainLanguage || 'TypeScript',
      defaultBranch: 'main',
      lastVerificationDate: new Date().toISOString(),
      lastDecision: 'REVIEW' as const,
      openIssuesCount: 0,
      environment: environment || 'Staging',
      rules: [
        { id: 'r-1', name: 'Zero-Blind-Trust Verification', description: 'Mandatory test coverage before ship.', enabled: true, severity: 'critical' as const }
      ],
      files: [],
      createdAt: new Date().toISOString()
    };
    db.createProject(newProj);
    res.json(newProj);
  });

  router.post('/projects/demo/reset', (req, res) => {
    const fresh = db.resetToSeed();
    broadcast('DEMO_RESET', { message: 'Database reset to initial demo state' });
    res.json({ success: true, state: fresh });
  });

  // Verifications
  router.get('/verifications', (req, res) => {
    res.json(db.getVerifications());
  });

  router.get('/verifications/:id', (req, res) => {
    const run = db.getVerification(req.params.id);
    if (!run) return res.status(404).json({ error: 'Verification run not found' });
    res.json(run);
  });

  router.post('/verifications/start', async (req, res) => {
    const { projectId, requirementText, changeType, changeTarget, verificationLevel, customCode } = req.body;
    
    // Broadcast run started
    broadcast('VERIFICATION_STARTED', { projectId, changeTarget });

    try {
      const run = await runVerificationPipeline(
        projectId || 'proj-coupon-demo',
        requirementText,
        changeType || 'pr',
        changeTarget || 'PR #142: feat(coupon)-discount-engine',
        verificationLevel || 'standard',
        customCode,
        (updatedRun, currentStage) => {
          broadcast('VERIFICATION_STAGE_PROGRESS', {
            runId: updatedRun.id,
            stageId: currentStage.id,
            stageName: currentStage.name,
            status: currentStage.status,
            logs: currentStage.logs,
            durationMs: currentStage.durationMs
          });
        }
      );

      broadcast('VERIFICATION_COMPLETED', {
        runId: run.id,
        decision: run.decision,
        riskScore: run.riskScore,
        proofOfShipId: run.proofOfShipId
      });

      res.json(run);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Pipeline execution error' });
    }
  });

  // Re-run or apply AI fix
  router.post('/verifications/:id/apply-fix-and-rerun', async (req, res) => {
    const existingRun = db.getVerification(req.params.id);
    if (!existingRun) return res.status(404).json({ error: 'Verification run not found' });

    // Update project file to FIXED version
    const project = db.getProject(existingRun.projectId);
    if (project) {
      const fileIdx = project.files.findIndex((f) => f.name === 'coupon_service.py');
      if (fileIdx >= 0) {
        project.files[fileIdx].content = FIXED_COUPON_CODE;
        db.updateProject(project.id, { files: project.files });
      }
    }

    // Run verification with fixed code
    const run = await runVerificationPipeline(
      existingRun.projectId,
      existingRun.requirementText,
      existingRun.changeType,
      `PR #142 (Patch Applied): Timezone Normalization & Idempotency`,
      existingRun.verificationLevel,
      FIXED_COUPON_CODE,
      (updatedRun, currentStage) => {
        broadcast('VERIFICATION_STAGE_PROGRESS', {
          runId: updatedRun.id,
          stageId: currentStage.id,
          stageName: currentStage.name,
          status: currentStage.status,
          logs: currentStage.logs,
          durationMs: currentStage.durationMs
        });
      }
    );

    broadcast('VERIFICATION_COMPLETED', {
      runId: run.id,
      decision: run.decision,
      riskScore: run.riskScore,
      proofOfShipId: run.proofOfShipId
    });

    res.json(run);
  });

  // Issues
  router.get('/issues', (req, res) => {
    const projectId = req.query.projectId as string | undefined;
    res.json(db.getIssues(projectId));
  });

  router.post('/issues/:id/resolve', (req, res) => {
    const updated = db.updateIssue(req.params.id, { status: 'fixed' });
    if (!updated) return res.status(404).json({ error: 'Issue not found' });
    res.json(updated);
  });

  // Pull Requests
  router.get('/pull-requests', (req, res) => {
    const projectId = req.query.projectId as string | undefined;
    res.json(db.getPullRequests(projectId));
  });

  router.get('/pull-requests/:id', (req, res) => {
    const pr = db.getPullRequest(req.params.id);
    if (!pr) return res.status(404).json({ error: 'Pull Request not found' });
    res.json(pr);
  });

  // Proof of Ship
  router.get('/proof-of-ship', (req, res) => {
    res.json(db.getProofOfShipList());
  });

  router.get('/proof-of-ship/:id', (req, res) => {
    const cert = db.getProofOfShip(req.params.id);
    if (!cert) return res.status(404).json({ error: 'Proof-of-Ship certificate not found' });
    res.json(cert);
  });

  router.post('/proof-of-ship/:id/approve', (req, res) => {
    const cert = db.getProofOfShip(req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });

    const { approverName, comment, channel } = req.body;
    cert.approvals.push({
      approverName: approverName || 'Alex Mercer',
      role: 'Lead Release Architect',
      approvedAt: new Date().toISOString(),
      decision: 'APPROVED',
      comment: comment || 'Approved for deployment via release control console.',
      channel: channel || 'WEB'
    });

    db.saveProofOfShip(cert);

    // Trigger Office Kit DEPLOYED state
    db.updateOfficeKit({
      state: 'DEPLOYED',
      reason: `Release approved by ${approverName || 'Alex Mercer'}`
    });

    broadcast('OFFICE_KIT_STATE_CHANGE', db.getOfficeKit());
    broadcast('RELEASE_APPROVED', { certificateId: cert.certificateId });

    res.json({ success: true, cert });
  });

  // Office Kit (IoT Desk Indicator)
  router.get('/office-kit', (req, res) => {
    res.json(db.getOfficeKit());
  });

  router.post('/office-kit/state', (req, res) => {
    const { state, reason } = req.body;
    const updated = db.updateOfficeKit({ state, reason });
    broadcast('OFFICE_KIT_STATE_CHANGE', updated);
    res.json(updated);
  });

  // Device Bridge
  router.get('/device/status', (req, res) => {
    res.json({
      activeRuns: db.getVerifications().slice(0, 3),
      latestRun: db.getVerifications()[0],
      officeKit: db.getOfficeKit()
    });
  });

  router.post('/device/command', async (req, res) => {
    const { command, runId } = req.body;
    const normalized = (command || '').toLowerCase().trim();
    let reply = '';

    const activeRun = runId ? db.getVerification(runId) : db.getVerifications()[0];

    if (normalized.includes('explain') || normalized.includes('failure') || normalized.includes('fail')) {
      reply = activeRun?.aiExplanation?.summary || 'The latest verification detected 2 critical test failures in timezone and duplicate checks.';
    } else if (normalized.includes('critical') || normalized.includes('issues')) {
      const issues = db.getIssues();
      reply = `There are ${issues.length} active issues: ${issues.map((i) => i.title).join(', ')}`;
    } else if (normalized.includes('files') || normalized.includes('affected')) {
      reply = `Affected files: ${activeRun?.dependencyGraph.affectedSummary.join(', ') || 'services/coupon_service.py'}`;
    } else if (normalized.includes('approve') || normalized.includes('deploy')) {
      const pos = db.getProofOfShipList()[0];
      if (pos) {
        pos.approvals.push({
          approverName: 'Alex Mercer',
          role: 'Voice Authorized Lead',
          approvedAt: new Date().toISOString(),
          decision: 'APPROVED',
          comment: 'Authorized via Phone Device Bridge voice command',
          channel: 'VOICE'
        });
        db.saveProofOfShip(pos);
        db.updateOfficeKit({ state: 'DEPLOYED', reason: 'Approved via Voice Command' });
        broadcast('OFFICE_KIT_STATE_CHANGE', db.getOfficeKit());
        reply = `Deployment approved! Office Kit switched to DEPLOYED. Proof-of-Ship ${pos.certificateId} stamped.`;
      } else {
        reply = 'Cannot deploy: No valid Proof-of-Ship exists for the current blocked run.';
      }
    } else if (normalized.includes('reject')) {
      db.updateOfficeKit({ state: 'BLOCKED', reason: 'Rejected via Voice Command' });
      broadcast('OFFICE_KIT_STATE_CHANGE', db.getOfficeKit());
      reply = 'Deployment was rejected. Release remains blocked.';
    } else if (normalized.includes('fix') || normalized.includes('generate')) {
      reply = 'Generated patch: Normalizing business timezone with UTC and adding customer redemption lookup.';
    } else if (normalized.includes('proof') || normalized.includes('certificate')) {
      const pos = db.getProofOfShipList()[0];
      reply = pos ? `Proof-of-Ship certificate ${pos.certificateId} is available with 100% test coverage.` : 'No Proof-of-Ship available yet.';
    } else {
      reply = `Command received: "${command}". Try "Explain failure", "Show critical issues", "Approve deployment", or "Show Proof-of-Ship".`;
    }

    broadcast('DEVICE_COMMAND_PROCESSED', { command, reply });
    res.json({ success: true, command, reply });
  });

  // Notifications & Audit Logs
  router.get('/notifications', (req, res) => {
    res.json(db.getNotifications());
  });

  router.post('/notifications/:id/read', (req, res) => {
    db.markNotificationRead(req.params.id);
    res.json({ success: true });
  });

  router.get('/audit-logs', (req, res) => {
    res.json(db.getAuditLogs());
  });

  return router;
}
