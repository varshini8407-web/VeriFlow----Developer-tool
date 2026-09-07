import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Key,
  Sliders,
  FileText,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import type { AuditLog } from '../../types';
import { sfx } from '../../services/audio';

export const SettingsPage: React.FC = () => {
  const { addToast } = useApp();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    api.getAuditLogs().then((logs) => setAuditLogs(logs)).catch(() => {});
  }, []);

  const handleSaveSettings = () => {
    sfx.playClick();
    addToast('success', 'Settings Saved', 'Risk engine weights & gate thresholds updated.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" />
          <span>Platform Settings & Risk Engine Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Tune automated risk scoring thresholds, override policies, and review the immutable release audit log.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Risk Thresholds */}
        <div className="col-span-6 p-6 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-4">
          <div className="flex items-center gap-2 text-brand-400">
            <Sliders className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">Risk Engine Scoring Weights</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-[#1c2333]">
              <div>
                <span className="font-bold text-white block">Critical Security Flaw</span>
                <span className="text-[11px] text-slate-400">Taint analysis SQL injection or secret leak</span>
              </div>
              <span className="font-mono font-bold text-rose-400">+40 pts (BLOCK)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-[#1c2333]">
              <div>
                <span className="font-bold text-white block">Automated Test Failure</span>
                <span className="text-[11px] text-slate-400">Any runtime unit, boundary, or security assertion fail</span>
              </div>
              <span className="font-mono font-bold text-rose-400">+35 pts (BLOCK)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-[#1c2333]">
              <div>
                <span className="font-bold text-white block">Unmet Acceptance Criteria</span>
                <span className="text-[11px] text-slate-400">Requirement lacking verified executable proof</span>
              </div>
              <span className="font-mono font-bold text-amber-400">+20 pts (REVIEW)</span>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Policies</span>
          </button>
        </div>

        {/* Audit Log History */}
        <div className="col-span-6 p-6 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <FileText className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">Immutable Release Audit Log</h3>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-white/[0.02] border border-[#1c2333] text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                  <span className="text-cyan-400 font-bold">{log.action}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-slate-200 font-semibold">{log.target}</div>
                <div className="text-[11px] text-slate-400">{log.details}</div>
                <div className="text-[10px] font-mono text-slate-400">Actor: {log.actor} • IP: {log.ip}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
