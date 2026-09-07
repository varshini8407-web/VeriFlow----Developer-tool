import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Terminal,
  Lock,
  Code2,
  FileCheck2,
  Layers,
  Wrench,
  ChevronRight,
  ExternalLink,
  Copy,
  Clock
} from 'lucide-react';
import type { VerificationRun } from '../../types';
import { useApp } from '../../context/AppContext';
import { CodeImpactGraph } from './CodeImpactGraph';
import { VeriFlowAssistantPanel } from './VeriFlowAssistantPanel';
import { LiveVerificationProgress } from './LiveVerificationProgress';
import { sfx } from '../../services/audio';

export const VerificationResultPage: React.FC = () => {
  const { activeRun, isVerifying, applyFixAndRerun, viewProofOfShip, proofOfShipList, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<
    'summary' | 'requirements' | 'tests' | 'impact' | 'security' | 'logs' | 'evidence' | 'ai' | 'fixes'
  >('summary');
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [selectedTestFilter, setSelectedTestFilter] = useState<string>('all');

  if (!activeRun) {
    return (
      <div className="p-12 text-center text-slate-400">
        <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <h3 className="text-sm font-bold text-white">No Verification Run Selected</h3>
        <p className="text-xs text-slate-400 mt-1">Select a run from the history or start a new verification wizard.</p>
      </div>
    );
  }

  if (isVerifying || activeRun.status === 'RUNNING') {
    return <LiveVerificationProgress run={activeRun} />;
  }

  const isShip = activeRun.decision === 'SHIP';
  const isBlock = activeRun.decision === 'BLOCK';
  const isReview = activeRun.decision === 'REVIEW';

  const badgeStyle = isShip
    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 glow-ship'
    : isBlock
    ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 glow-block'
    : 'bg-amber-500/15 border-amber-500/40 text-amber-400 glow-review';

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Layers },
    { id: 'requirements', label: 'Requirement Coverage', icon: FileCheck2 },
    { id: 'tests', label: `Test Results (${activeRun.testCases.length})`, icon: CheckCircle2 },
    { id: 'impact', label: 'Code Impact Graph', icon: Code2 },
    { id: 'security', label: `Security (${activeRun.stats.securityFindings})`, icon: Lock },
    { id: 'logs', label: 'Runtime Logs', icon: Terminal },
    { id: 'evidence', label: 'Evidence Matrix', icon: Award },
    { id: 'ai', label: 'AI Diagnosis', icon: Sparkles },
    { id: 'fixes', label: 'Suggested Fixes', icon: Wrench }
  ];

  const filteredTests =
    selectedTestFilter === 'all'
      ? activeRun.testCases
      : activeRun.testCases.filter((t) => t.category === selectedTestFilter || t.status === selectedTestFilter);

  const matchedProofOfShip = proofOfShipList.find(
    (p) => p.verificationRunId === activeRun.id || p.id === activeRun.proofOfShipId
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Decision Card */}
      <div className="p-6 rounded-2xl bg-[#0f131c] border border-[#232b3e] shadow-2xl relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`px-4 py-3 rounded-2xl border flex flex-col items-center justify-center min-w-[110px] ${badgeStyle}`}>
              {isShip ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
              ) : isBlock ? (
                <XCircle className="w-8 h-8 text-rose-400 mb-1" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-400 mb-1" />
              )}
              <span className="text-base font-extrabold tracking-wider">{activeRun.decision}</span>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-white tracking-tight">{activeRun.projectName}</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                  {activeRun.changeTarget}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">{activeRun.requirementText}</p>
              
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(activeRun.startedAt).toLocaleString()}</span>
                </span>
                <span>•</span>
                <span>Duration: {(activeRun.durationMs / 1000).toFixed(2)}s</span>
                <span>•</span>
                <span className="uppercase text-cyan-400 font-bold">{activeRun.verificationLevel} Check</span>
              </div>
            </div>
          </div>

          {/* Right Metrics Score & Quick Actions */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-[#1c2333] text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Score</span>
                <span
                  className={`text-lg font-extrabold font-mono ${
                    activeRun.riskScore === 0 ? 'text-emerald-400' : activeRun.riskScore > 50 ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {activeRun.riskScore} / 100
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-[#1c2333] text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Ship Confidence</span>
                <span
                  className={`text-lg font-extrabold font-mono ${
                    activeRun.shipConfidence > 80 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {activeRun.shipConfidence}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* VeriFlow Assistant Trigger */}
              <button
                onClick={() => {
                  sfx.playClick();
                  setIsAssistantOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>VeriFlow Assistant</span>
              </button>

              {/* Proof of Ship Button */}
              {isShip && matchedProofOfShip && (
                <button
                  onClick={() => {
                    sfx.playClick();
                    viewProofOfShip(matchedProofOfShip.id);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>View Proof-of-Ship</span>
                </button>
              )}

              {/* Quick 1-Click Fix if Blocked */}
              {isBlock && (
                <button
                  onClick={() => {
                    sfx.playClick();
                    applyFixAndRerun(activeRun.id);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 shadow-md shadow-cyan-500/25 transition-all"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Apply Fix & Re-Verify</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Metric Summary Counters */}
        <div className="grid grid-cols-6 gap-3 mt-6 pt-5 border-t border-[#1c2333]">
          <div className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Requirements</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {activeRun.stats.requirementsVerified} / {activeRun.stats.requirementsTotal} Verified
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tests Passed</span>
            <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
              {activeRun.stats.testsPassed} / {activeRun.stats.testsTotal}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tests Failed</span>
            <span className={`text-sm font-bold mt-0.5 block ${activeRun.stats.testsFailed > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {activeRun.stats.testsFailed}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Security Findings</span>
            <span className={`text-sm font-bold mt-0.5 block ${activeRun.stats.securityFindings > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {activeRun.stats.securityFindings} Finding(s)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Files Changed</span>
            <span className="text-sm font-bold text-white mt-0.5 block">{activeRun.stats.filesChanged} file</span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Blast Radius</span>
            <span className="text-sm font-bold text-cyan-400 mt-0.5 block">{activeRun.stats.affectedModules} modules</span>
          </div>
        </div>
      </div>

      {/* Tabs Header Navigation */}
      <div className="flex border-b border-[#1c2333] bg-[#0c0f17] px-4 rounded-xl overflow-x-auto gap-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                sfx.playClick();
                setActiveTab(t.id as any);
              }}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                isActive
                  ? 'border-cyan-400 text-white bg-white/[0.02]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.01]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SUMMARY */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-3">
              <h4 className="text-sm font-bold text-white">Release Decision & Authoritative Findings</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeRun.aiExplanation?.summary ||
                  'The verification engine completed all deterministic checks across AST, security taint analysis, and runtime tests.'}
              </p>

              {isBlock && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1.5">
                  <span className="font-bold block">Hard Rule Violations:</span>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                    <li>Critical automated boundary test failed: Timezone comparison without UTC normalization.</li>
                    <li>Financial duplication check missing: No customer prior redemption verification.</li>
                  </ul>
                </div>
              )}

              {isShip && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1.5">
                  <span className="font-bold block">All Required Checks Passed:</span>
                  <p className="text-[11px] text-slate-300">
                    100% of requirement acceptance criteria, runtime assertions, and security taint checks passed. Code is certified for immediate production deployment.
                  </p>
                </div>
              )}
            </div>

            {/* Evidence Quick Preview */}
            <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Verification Evidence Summary</h4>
                <button
                  onClick={() => setActiveTab('evidence')}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Full Evidence Matrix</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {activeRun.evidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-[#1c2333] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{ev.requirementCode}</span>
                        <span className="text-slate-300 font-medium">{ev.requirementTitle}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">{ev.evidenceSource}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ev.result === 'Passed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {ev.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Blast Radius & Actions */}
          <div className="col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-3">
              <h4 className="text-sm font-bold text-white">Blast Radius & Impact Overview</h4>
              <div className="space-y-2">
                {activeRun.dependencyGraph.affectedSummary.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white/[0.02] border border-[#1c2333] text-xs text-slate-300 font-mono flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('impact')}
                className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-white transition-colors"
              >
                Inspect Visual Dependency Graph ⟶
              </button>
            </div>

            {/* VeriFlow AI Assistant Widget */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#121826] to-[#0f131c] border border-cyan-500/30 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">VeriFlow AI Diagnostics</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isBlock
                  ? 'AI repair assistant has analyzed the failed runtime assertions and generated a deterministic patch for timezone UTC normalization and customer idempotency.'
                  : 'All acceptance criteria and taint sinks passed. No fixes required.'}
              </p>
              <button
                onClick={() => {
                  sfx.playClick();
                  setIsAssistantOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20"
              >
                Open VeriFlow Assistant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REQUIREMENT COVERAGE */}
      {activeTab === 'requirements' && (
        <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Acceptance Criteria Verification Matrix</h4>
              <p className="text-xs text-slate-400">
                Coverage represents verified requirements with executable evidence, not blind AI approval.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Coverage Score</span>
              <span className="text-base font-bold font-mono text-cyan-400 ml-2">
                {Math.round((activeRun.stats.requirementsVerified / activeRun.stats.requirementsTotal) * 100)}%
              </span>
            </div>
          </div>

          <div className="divide-y divide-[#1c2333]">
            {activeRun.requirements.map((req) => (
              <div key={req.id} className="py-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        req.status === 'passed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {req.code}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white">{req.description}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">{req.evidenceSummary}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                      req.status === 'passed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono pt-1 pl-12">
                  <span>Related Files: {req.relatedFiles.join(', ')}</span>
                  <span>•</span>
                  <span>Related Tests: {req.relatedTests.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TEST RESULTS */}
      {activeTab === 'tests' && (
        <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Deterministic Test Results</h4>
              <p className="text-xs text-slate-400">
                Executed in sandboxed isolated execution environment.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {['all', 'passed', 'failed', 'boundary', 'security'].map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedTestFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase transition-colors ${
                    selectedTestFilter === f
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className={`p-4 rounded-xl border transition-all ${
                  test.status === 'passed'
                    ? 'border-[#1c2333] bg-white/[0.01]'
                    : 'border-rose-500/40 bg-rose-500/[0.04]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {test.status === 'passed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">{test.name}</span>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-300">
                          {test.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{test.description}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-400">{test.durationMs}ms</span>
                </div>

                {test.errorMessage && (
                  <div className="mt-3 p-3 rounded-lg bg-[#07090e] border border-rose-500/30 text-rose-300 font-mono text-[11px] leading-relaxed">
                    <span className="font-bold text-rose-400 block mb-1">Stack Trace:</span>
                    <pre className="whitespace-pre-wrap">{test.stackTrace || test.errorMessage}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CODE IMPACT GRAPH */}
      {activeTab === 'impact' && <CodeImpactGraph graph={activeRun.dependencyGraph} />}

      {/* TAB 5: SECURITY TAINT SCAN */}
      {activeTab === 'security' && (
        <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white">Security Taint Flow Analysis</h4>
            <p className="text-xs text-slate-400">
              Traces untrusted user payload input across service layers down to execution sinks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#07090e] border border-[#1c2333] space-y-3 font-mono text-xs text-slate-300">
            <div className="text-cyan-400 font-bold">Flow Analysis Log:</div>
            <div className="space-y-1.5 pl-3 border-l-2 border-cyan-500/40">
              <div>[SOURCE] HTTP POST /api/v1/checkout/apply-coupon (payload: `code`, `user_id`)</div>
              <div>[PROPAGATION] CouponService.validate_and_apply(code, cart_total, user_id)</div>
              <div>[SINK 1] SQLite Parameterized Query (SELECT * FROM coupons WHERE code = ?) ⟶ SAFE</div>
              <div>[SINK 2] Business Expiration Logic ⟶ {activeRun.issues.some((i) => i.category === 'timezone_bug') ? 'VULNERABILITY: NAIVE SYSTEM CLOCK' : 'SAFE: UTC NORMALIZED'}</div>
              <div>[SINK 3] Redemption Idempotency Store ⟶ {activeRun.issues.some((i) => i.category === 'logic_error') ? 'VULNERABILITY: MISSING REDEMPTION CHECK' : 'SAFE: IDEMPOTENT'}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RUNTIME LOGS */}
      {activeTab === 'logs' && (
        <div className="p-5 rounded-2xl bg-[#07090e] border border-[#232b3e] space-y-3 font-mono text-xs text-slate-300 max-h-[500px] overflow-y-auto">
          <div className="text-xs font-bold text-white pb-2 border-b border-[#1c2333]">
            Raw Sandboxed Container Execution Logs
          </div>
          {activeRun.stages.flatMap((s) => s.logs).map((l, idx) => (
            <div key={idx} className="leading-relaxed">
              {l}
            </div>
          ))}
        </div>
      )}

      {/* TAB 7: EVIDENCE MATRIX */}
      {activeTab === 'evidence' && (
        <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white">Auditable Release Evidence Matrix</h4>
            <p className="text-xs text-slate-400">
              Every final decision is verifiable and traceable to deterministic proof items.
            </p>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1c2333] text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Req Code</th>
                <th className="py-2.5 px-3">Requirement Title</th>
                <th className="py-2.5 px-3">Evidence Source</th>
                <th className="py-2.5 px-3">Evidence Type</th>
                <th className="py-2.5 px-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2333] font-mono">
              {activeRun.evidence.map((ev) => (
                <tr key={ev.id} className="hover:bg-white/[0.01]">
                  <td className="py-3 px-3 font-bold text-cyan-400">{ev.requirementCode}</td>
                  <td className="py-3 px-3 font-sans text-slate-200">{ev.requirementTitle}</td>
                  <td className="py-3 px-3 text-slate-400 truncate max-w-[220px]">{ev.evidenceSource}</td>
                  <td className="py-3 px-3 text-slate-400 font-sans">{ev.evidenceType}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ev.result === 'Passed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {ev.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 8: AI EXPLANATION */}
      {activeTab === 'ai' && (
        <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="w-5 h-5" />
            <h4 className="text-sm font-bold text-white">VeriFlow AI Diagnostic Engine</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-[#1c2333]">
              <span className="font-bold text-white block mb-1">Root Cause Explanation</span>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                {activeRun.aiExplanation?.rootCause || 'All deterministic checks succeeded.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-[#1c2333]">
              <span className="font-bold text-white block mb-1">Production Impact Assessment</span>
              <p className="text-slate-300 leading-relaxed">
                {activeRun.aiExplanation?.impact || 'Safe for immediate production deployment.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: SUGGESTED FIXES */}
      {activeTab === 'fixes' && (
        <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Automated Remediation Patch</h4>
              <p className="text-xs text-slate-400">
                Deterministic code change generated to resolve failed test assertions.
              </p>
            </div>
            {isBlock && (
              <button
                onClick={() => {
                  sfx.playClick();
                  applyFixAndRerun(activeRun.id);
                }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 shadow-md shadow-cyan-500/25"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Apply Patch & Re-Verify</span>
              </button>
            )}
          </div>

          <pre className="p-4 rounded-xl bg-[#07090e] border border-[#1c2333] font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
            <code>{`@@ services/coupon_service.py @@
-        current_time = datetime.now()
-        if coupon.expires_at and current_time > coupon.expires_at:
+        now_utc = datetime.now(timezone.utc)
+        coupon_expires_utc = coupon.expires_at.replace(tzinfo=self.business_tz).astimezone(timezone.utc)
+        if coupon_expires_utc and now_utc > coupon_expires_utc:
             return {"valid": False, "discount": 0.0, "reason": "Coupon has expired"}

+        usage_count = self.db.query("SELECT count(*) as count FROM coupon_redemptions WHERE coupon_id = ? AND user_id = ?", (coupon.id, user_id)).scalar()
+        if usage_count and usage_count > 0:
+            return {"valid": False, "discount": 0.0, "reason": "Coupon already used by this customer"}`}</code>
          </pre>
        </div>
      )}

      {/* Assistant Drawer */}
      <VeriFlowAssistantPanel
        run={activeRun}
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
};
