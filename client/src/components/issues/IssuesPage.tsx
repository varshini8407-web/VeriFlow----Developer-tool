import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCode2,
  Wrench,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Issue, IssueSeverity } from '../../types';
import { api } from '../../services/api';
import { sfx } from '../../services/audio';

export const IssuesPage: React.FC = () => {
  const { issues, applyFixAndRerun, refreshData, addToast, activeRun } = useApp();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(issues[0] || null);

  const filteredIssues =
    filterSeverity === 'all' ? issues : issues.filter((i) => i.severity === filterSeverity);

  const handleResolve = async (issueId: string) => {
    sfx.playClick();
    await api.resolveIssue(issueId);
    await refreshData();
    addToast('success', 'Issue Resolved', 'Issue marked as fixed.');
  };

  const getSeverityBadge = (sev: IssueSeverity) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <span>Verification Findings & Issues</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Critical logic bugs, timezone discrepancies, and security flaws intercepted by VeriFlow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'critical', 'high', 'medium'].map((s) => (
            <button
              key={s}
              onClick={() => {
                sfx.playClick();
                setFilterSeverity(s);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-colors ${
                filterSeverity === s
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-white/[0.02] text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Issues List */}
        <div className="col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
            Issues ({filteredIssues.length})
          </span>

          <div className="space-y-2">
            {filteredIssues.map((iss) => {
              const isSelected = (selectedIssue?.id === iss.id);
              return (
                <button
                  key={iss.id}
                  onClick={() => {
                    sfx.playClick();
                    setSelectedIssue(iss);
                  }}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-rose-500 bg-rose-500/10 text-white shadow-md shadow-rose-500/10'
                      : 'border-[#1c2333] bg-[#0f131c] text-slate-300 hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${getSeverityBadge(iss.severity)}`}>
                      {iss.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{iss.file}:{iss.lineNumber}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-2 leading-snug">{iss.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate mt-1">{iss.explanation}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Issue Detail View */}
        {selectedIssue && (
          <div className="col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getSeverityBadge(selectedIssue.severity)}`}>
                      {selectedIssue.severity}
                    </span>
                    <h3 className="text-base font-bold text-white">{selectedIssue.title}</h3>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    Location: {selectedIssue.file} (Line {selectedIssue.lineNumber})
                  </div>
                </div>

                <button
                  onClick={() => handleResolve(selectedIssue.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              </div>

              {/* Explanation & Evidence */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-[#1c2333]">
                  <span className="font-bold text-white block mb-1">Root Cause Explanation</span>
                  <p className="text-slate-300 leading-relaxed">{selectedIssue.explanation}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-[#1c2333]">
                  <span className="font-bold text-white block mb-1">Executable Evidence</span>
                  <p className="text-slate-300 leading-relaxed font-mono text-[11px]">{selectedIssue.evidence}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-[#1c2333]">
                  <span className="font-bold text-white block mb-1">Recommended Solution</span>
                  <p className="text-emerald-400 leading-relaxed">{selectedIssue.suggestedFix}</p>
                </div>
              </div>

              {/* Patch Diff */}
              {selectedIssue.patchDiff && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white block">Remediation Diff Patch</span>
                  <pre className="p-3.5 rounded-xl bg-[#07090e] border border-[#1c2333] font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
                    <code>{selectedIssue.patchDiff}</code>
                  </pre>
                </div>
              )}

              {/* Action Button */}
              {activeRun && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      sfx.playClick();
                      applyFixAndRerun(activeRun.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 shadow-md shadow-cyan-500/25"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Apply Patch & Re-Verify</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
