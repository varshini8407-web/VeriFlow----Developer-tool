import React, { useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GitBranch,
  ShieldCheck,
  Award,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { PullRequest } from '../../types';
import { sfx } from '../../services/audio';

export const PullRequestsPage: React.FC = () => {
  const { pullRequests, viewProofOfShip } = useApp();
  const [selectedPr, setSelectedPr] = useState<PullRequest>(pullRequests[0]);

  const isShip = selectedPr?.verificationDecision === 'SHIP';
  const isBlock = selectedPr?.verificationDecision === 'BLOCK';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <GitPullRequest className="w-6 h-6 text-indigo-400" />
          <span>Pull Requests & Release Reports</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Simulated GitHub Pull Request integration showcasing automated VeriFlow Release Bot verification comments.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* PR List */}
        <div className="col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
            Active Pull Requests ({pullRequests.length})
          </span>

          <div className="space-y-2">
            {pullRequests.map((pr) => {
              const isSelected = selectedPr?.id === pr.id;
              return (
                <button
                  key={pr.id}
                  onClick={() => {
                    sfx.playClick();
                    setSelectedPr(pr);
                  }}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-md shadow-indigo-500/10'
                      : 'border-[#1c2333] bg-[#0f131c] text-slate-300 hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-400">#{pr.number}</span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        pr.verificationDecision === 'SHIP'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : pr.verificationDecision === 'BLOCK'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {pr.verificationDecision}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-1.5">{pr.title}</h4>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-2">
                    <GitBranch className="w-3 h-3 text-slate-400" />
                    <span>{pr.branch}</span>
                    <span>⟶</span>
                    <span>{pr.targetBranch}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected PR Detail View */}
        {selectedPr && (
          <div className="col-span-7 space-y-4">
            {/* PR Header */}
            <div className="p-6 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-indigo-400">#{selectedPr.number}</span>
                    <h3 className="text-base font-bold text-white">{selectedPr.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-2">
                    <span>Author: {selectedPr.author.name}</span>
                    <span>•</span>
                    <span>Risk: {selectedPr.riskScore}/100</span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                    isShip
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {selectedPr.verificationDecision}
                </span>
              </div>

              {/* Bot Release Comment Container */}
              <div className="p-5 rounded-xl bg-[#07090e] border border-[#1c2333] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white pb-2 border-b border-white/[0.08]">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>VeriFlow Release Gate Bot</span>
                  <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded">BOT</span>
                </div>

                <div className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                  {selectedPr.reportMarkdown}
                </div>

                {selectedPr.proofOfShipId && (
                  <div className="pt-2 border-t border-white/[0.06] flex justify-end">
                    <button
                      onClick={() => {
                        sfx.playClick();
                        viewProofOfShip(selectedPr.proofOfShipId!);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/20"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>View Attached Proof-of-Ship</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
