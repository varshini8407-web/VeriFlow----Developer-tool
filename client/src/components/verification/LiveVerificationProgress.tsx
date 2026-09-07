import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Terminal,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Ban,
  Activity
} from 'lucide-react';
import type { VerificationRun, VerificationStage } from '../../types';

interface ProgressProps {
  run: VerificationRun;
}

export const LiveVerificationProgress: React.FC<ProgressProps> = ({ run }) => {
  const [elapsed, setElapsed] = useState<number>(0);
  const [selectedStageId, setSelectedStageId] = useState<number>(1);
  const [autoScrollLogs, setAutoScrollLogs] = useState<boolean>(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const start = new Date(run.startedAt).getTime();
    const interval = setInterval(() => {
      const now = run.completedAt ? new Date(run.completedAt).getTime() : Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    }, 200);

    return () => clearInterval(interval);
  }, [run.startedAt, run.completedAt]);

  const passedStagesCount = run.stages.filter((s) => s.status === 'passed').length;
  const failedStagesCount = run.stages.filter((s) => s.status === 'failed').length;
  const runningStagesCount = run.stages.filter((s) => s.status === 'running').length;
  const progressPercent = Math.min(100, Math.round(((passedStagesCount + failedStagesCount * 0.8) / 13) * 100));

  const currentActiveStage = run.stages.find((s) => s.status === 'running') || run.stages.find((s) => s.status === 'failed') || run.stages[run.stages.length - 1];

  const selectedStage = run.stages.find((s) => s.id === selectedStageId) || currentActiveStage;

  useEffect(() => {
    if (currentActiveStage && currentActiveStage.status === 'running') {
      setSelectedStageId(currentActiveStage.id);
    }
  }, [currentActiveStage?.id, currentActiveStage?.status]);

  useEffect(() => {
    if (autoScrollLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedStage?.logs, autoScrollLogs]);

  const getStageIcon = (stage: VerificationStage) => {
    switch (stage.status) {
      case 'passed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'running':
        return <RotateCw className="w-4 h-4 text-cyan-400 animate-spin" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-slate-600 ml-1" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Header Status */}
      <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-500 via-cyan-400 to-indigo-500 animate-pulse" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Live Verification Pipeline</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full animate-pulse">
                  {run.status === 'RUNNING' ? 'EXECUTING' : run.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{run.changeTarget}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                <Clock className="w-3.5 h-3.5" />
                <span>Elapsed</span>
              </div>
              <span className="text-sm font-mono font-bold text-white">{elapsed}s</span>
            </div>
            <div className="text-right pl-4 border-l border-white/[0.08]">
              <div className="text-xs text-slate-400">Progress</div>
              <span className="text-sm font-mono font-bold text-cyan-400">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="mt-4 h-2 bg-[#161c28] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-cyan-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Stages Timeline & Live Logs */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: 13 Stages Timeline */}
        <div className="col-span-6 p-4 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-2 max-h-[580px] overflow-y-auto">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-[#1c2333]">
            <span className="text-xs font-bold text-white">Verification Pipeline Stages</span>
            <span className="text-[10px] text-slate-400">13 Total Deterministic Steps</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {run.stages.map((stage) => {
              const isSelected = selectedStageId === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStageId(stage.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-brand-500/10 border-brand-500/40 text-white shadow-sm'
                      : 'bg-white/[0.01] border-transparent text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-5 flex justify-center shrink-0">{getStageIcon(stage)}</div>
                    <div className="truncate">
                      <div className="text-xs font-semibold truncate text-slate-200">{stage.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{stage.description}</div>
                    </div>
                  </div>
                  {stage.durationMs !== undefined && (
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                      {stage.durationMs}ms
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Live Stage Terminal Output */}
        <div className="col-span-6 p-4 rounded-2xl bg-[#07090e] border border-[#232b3e] flex flex-col h-[580px] shadow-2xl">
          {/* Terminal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1c2333]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">
                Stage {selectedStage.id}: {selectedStage.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.05] text-slate-400">
                {selectedStage.status}
              </span>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-slate-300 space-y-1.5 selection:bg-cyan-500/30">
            {selectedStage.logs.length === 0 ? (
              <div className="text-slate-400 italic text-[11px] py-4 text-center">
                Waiting for stage execution...
              </div>
            ) : (
              selectedStage.logs.map((log, idx) => {
                const isError = log.includes('FAIL') || log.includes('Error') || log.includes('AssertionError');
                const isWarn = log.includes('WARN') || log.includes('Warning');
                const isPass = log.includes('PASS') || log.includes('OK') || log.includes('verified');

                return (
                  <div
                    key={idx}
                    className={`leading-relaxed ${
                      isError
                        ? 'text-rose-400 font-semibold'
                        : isWarn
                        ? 'text-amber-300'
                        : isPass
                        ? 'text-emerald-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Terminal Footer */}
          <div className="pt-2 border-t border-[#1c2333] flex items-center justify-between text-[10px] text-slate-400">
            <span>Sandboxed Isolated Subprocess</span>
            <span>stdout & stderr stream</span>
          </div>
        </div>
      </div>
    </div>
  );
};
