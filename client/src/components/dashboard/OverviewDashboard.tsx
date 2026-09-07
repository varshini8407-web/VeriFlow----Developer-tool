import React from 'react';
import {
  ShieldCheck,
  FolderGit2,
  AlertTriangle,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Zap,
  Smartphone,
  Cpu,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { sfx } from '../../services/audio';

export const OverviewDashboard: React.FC<{ onOpenWizard: () => void }> = ({ onOpenWizard }) => {
  const {
    user,
    currentWorkspace,
    projects,
    verifications,
    issues,
    proofOfShipList,
    officeKit,
    viewRunDetails,
    setCurrentRoute
  } = useApp();

  const totalRuns = verifications.length;
  const passedRuns = verifications.filter((v) => v.decision === 'SHIP').length;
  const blockedRuns = verifications.filter((v) => v.decision === 'BLOCK').length;
  const openIssues = issues.filter((i) => i.status === 'open').length;

  const chartData = [
    { time: '09:00', passed: 3, failed: 0, review: 1 },
    { time: '11:00', passed: 5, failed: 1, review: 0 },
    { time: '13:00', passed: 4, failed: 2, review: 1 },
    { time: '15:00', passed: 8, failed: 1, review: 0 },
    { time: '17:00', passed: 10, failed: 2, review: 1 },
    { time: '19:00', passed: 14, failed: 2, review: 2 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0f131c] via-[#121826] to-[#0f131c] border border-[#232b3e] shadow-2xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              Release Gate Active
            </span>
            <span className="text-xs text-slate-400 font-mono">• {currentWorkspace?.name}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-2 tracking-tight">
            Good morning, {user?.name || 'Alex Mercer'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            VeriFlow is actively intercepting AI code generation to ensure 100% executable evidence before release.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sfx.playClick();
              onOpenWizard();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Verify New Code</span>
          </button>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0f131c] border border-[#1c2333]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold">Total Projects</span>
            <FolderGit2 className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">{projects.length}</div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" /> All active
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f131c] border border-[#1c2333]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold">Verification Runs</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">{totalRuns}</div>
          <span className="text-[10px] text-cyan-400 mt-1 block">Live pipeline</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f131c] border border-[#1c2333]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold">Passed (SHIP)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">{passedRuns}</div>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">100% Verified</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f131c] border border-[#1c2333]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold">Blocked Runs</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-400">{blockedRuns}</div>
          <span className="text-[10px] text-rose-400/80 mt-1 block">Intercepted bugs</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f131c] border border-[#1c2333]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold">Open Critical Issues</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">{openIssues}</div>
          <span className="text-[10px] text-amber-400/80 mt-1 block">Awaiting patch</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f131c] border border-[#1c2333]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold">Avg Verify Time</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">4.8s</div>
          <span className="text-[10px] text-indigo-400 mt-1 block">Deterministic SLA</span>
        </div>
      </div>

      {/* Main Dashboard Section: Activity Chart & Readiness Meter */}
      <div className="grid grid-cols-12 gap-6">
        {/* Verification Activity Chart */}
        <div className="col-span-8 p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Verification Activity Stream</h3>
              <p className="text-xs text-slate-400">Deterministic pipeline execution volume over time</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Passed (SHIP)</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Blocked</span>
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="passedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f131c', borderColor: '#232b3e', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="passed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#passedGrad)" />
                <Area type="monotone" dataKey="failed" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#failedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Release Readiness & Quick Actions */}
        <div className="col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-3">
            <h3 className="text-sm font-bold text-white">Release Readiness Gate</h3>
            <div className="p-4 rounded-xl bg-gradient-to-tr from-rose-500/10 via-amber-500/5 to-transparent border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Staging Gate Status</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  BLOCKED
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Coupon Checkout Service contains 2 failing assertions in timezone & idempotency logic.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => {
                  sfx.playClick();
                  setCurrentRoute('device-bridge');
                }}
                className="w-full p-2.5 rounded-xl bg-white/[0.02] border border-[#1c2333] hover:border-white/[0.15] text-left flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-300">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>Open Phone Device Bridge</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  sfx.playClick();
                  setCurrentRoute('office-kit');
                }}
                className="w-full p-2.5 rounded-xl bg-white/[0.02] border border-[#1c2333] hover:border-white/[0.15] text-left flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-300">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>Desk Indicator (Office Kit)</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Verification Runs Table */}
      <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Verification Runs</h3>
            <p className="text-xs text-slate-400">Latest pipeline executions and release decisions</p>
          </div>
          <button
            onClick={() => setCurrentRoute('verifications')}
            className="text-xs font-semibold text-cyan-400 hover:underline"
          >
            View All Runs ⟶
          </button>
        </div>

        <div className="divide-y divide-[#1c2333]">
          {verifications.slice(0, 4).map((run) => {
            const isShip = run.decision === 'SHIP';
            const isBlock = run.decision === 'BLOCK';
            return (
              <div key={run.id} className="py-3 flex items-center justify-between text-xs hover:bg-white/[0.01] px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isShip
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isBlock
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {isShip ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{run.projectName}</span>
                      <span className="font-mono text-[10px] text-slate-400">{run.changeTarget}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{run.requirementText}</span>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">Risk Score</span>
                    <span className={`font-mono font-bold ${run.riskScore === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {run.riskScore} / 100
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">Tests</span>
                    <span className="text-slate-300 font-mono">
                      {run.stats.testsPassed}/{run.stats.testsTotal}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      sfx.playClick();
                      viewRunDetails(run.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white transition-colors"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
