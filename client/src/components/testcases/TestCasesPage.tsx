import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Filter,
  Sparkles,
  Terminal,
  Code2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sfx } from '../../services/audio';

export const TestCasesPage: React.FC = () => {
  const { activeRun, isVerifying, applyFixAndRerun } = useApp();
  const [filter, setFilter] = useState<string>('all');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  const testCases = activeRun?.testCases || [];

  const filtered =
    filter === 'all'
      ? testCases
      : testCases.filter((t) => t.category === filter || t.status === filter);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span>Deterministic Test Harness</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated positive, negative, boundary, regression, and security test suites executed in isolated sandboxes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'positive', 'boundary', 'security', 'negative', 'passed', 'failed'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sfx.playClick();
                setFilter(cat);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-colors ${
                filter === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/[0.02] text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Test Cases List */}
      <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-[#1c2333] text-xs text-slate-400">
          <span>Test Suite: {activeRun?.projectName || 'Coupon Service'}</span>
          <span>{filtered.length} Test Cases</span>
        </div>

        <div className="space-y-3">
          {filtered.map((test) => {
            const isPass = test.status === 'passed';
            const isExpanded = expandedTestId === test.id;

            return (
              <div
                key={test.id}
                className={`p-4 rounded-xl border transition-all ${
                  isPass ? 'border-[#1c2333] bg-white/[0.01]' : 'border-rose-500/40 bg-rose-500/[0.04]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {isPass ? (
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

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-slate-400">{test.durationMs}ms</span>
                    <button
                      onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                      className="text-xs font-semibold text-cyan-400 hover:underline"
                    >
                      {isExpanded ? 'Collapse' : 'Details'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2 text-xs">
                    <div className="text-[10px] font-mono text-slate-400">File: {test.file}</div>
                    <pre className="p-3 rounded-lg bg-[#07090e] border border-[#1c2333] text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                      <code>{test.code}</code>
                    </pre>

                    {test.errorMessage && (
                      <div className="p-3 rounded-lg bg-[#07090e] border border-rose-500/30 text-rose-300 text-[11px] font-mono">
                        <span className="font-bold text-rose-400 block mb-1">Failure Assertion:</span>
                        <pre className="whitespace-pre-wrap">{test.stackTrace || test.errorMessage}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
