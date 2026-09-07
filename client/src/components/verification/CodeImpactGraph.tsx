import React, { useState } from 'react';
import type { DependencyGraph, DependencyNode } from '../../types';
import { AlertTriangle, CheckCircle2, ShieldAlert, Database, Code2, Globe, Cpu } from 'lucide-react';

interface ImpactProps {
  graph: DependencyGraph;
}

export const CodeImpactGraph: React.FC<ImpactProps> = ({ graph }) => {
  const [selectedNode, setSelectedNode] = useState<DependencyNode | null>(graph.nodes[0] || null);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'function':
        return Code2;
      case 'service':
        return Cpu;
      case 'endpoint':
        return Globe;
      case 'database':
        return Database;
      case 'test':
        return CheckCircle2;
      default:
        return Code2;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'border-rose-500/40 bg-rose-500/10 text-rose-300 shadow-lg shadow-rose-500/10';
      case 'high':
        return 'border-amber-500/40 bg-amber-500/10 text-amber-300';
      case 'medium':
        return 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300';
      default:
        return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-white">Dependency & Blast Radius Architecture</h4>
            <p className="text-xs text-slate-400">
              Interactive structural diagram mapping changed functions to downstream endpoints, data layers, and test suites.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Critical Risk</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Clean / Verified</span>
            </span>
          </div>
        </div>

        {/* Visual Node Flowchart */}
        <div className="bg-[#07090e] border border-[#1c2333] rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
          <div className="grid grid-cols-5 gap-4 w-full max-w-4xl items-center">
            {graph.nodes.map((node, idx) => {
              const Icon = getNodeIcon(node.type);
              const isSelected = selectedNode?.id === node.id;
              const badgeClass = getRiskBadge(node.risk);

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                    isSelected ? 'ring-2 ring-cyan-400 scale-105' : 'hover:border-white/[0.2]'
                  } ${badgeClass}`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <span className="text-xs font-bold truncate max-w-full text-white">{node.name}</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75 mt-0.5">
                    {node.type}
                  </span>
                  {node.changed && (
                    <span className="mt-2 text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      MODIFIED
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Connection Arrows Flow description */}
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 pt-2">
            <span>validate_and_apply()</span>
            <span className="text-cyan-400">⟶</span>
            <span>CouponService</span>
            <span className="text-cyan-400">⟶</span>
            <span>POST /checkout</span>
            <span className="text-cyan-400">⟶</span>
            <span>OrderRepository</span>
            <span className="text-cyan-400">⟶</span>
            <span>test_coupon_service</span>
          </div>
        </div>

        {/* Selected Node Details Box */}
        {selectedNode && (
          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-[#1c2333] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Code2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h5 className="text-xs font-bold text-white">{selectedNode.name}</h5>
                <span className="text-[10px] font-mono uppercase bg-white/[0.05] text-slate-300 px-2 py-0.5 rounded">
                  {selectedNode.type}
                </span>
                <span className="text-[10px] font-bold text-rose-400">
                  Risk Level: {selectedNode.risk.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedNode.details}</p>
              {selectedNode.path && (
                <div className="text-[11px] font-mono text-cyan-400/80 mt-1.5">
                  File Path: {selectedNode.path}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Affected Modules Summary */}
      <div className="p-4 rounded-2xl bg-[#0f131c] border border-[#232b3e]">
        <h5 className="text-xs font-bold text-white mb-2">Affected Downstream Files & Sinks</h5>
        <div className="grid grid-cols-2 gap-2">
          {graph.affectedSummary.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs font-mono text-slate-300 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
