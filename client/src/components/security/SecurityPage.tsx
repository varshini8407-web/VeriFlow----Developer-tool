import React from 'react';
import {
  Lock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCode2,
  Code2,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SecurityPage: React.FC = () => {
  const { activeRun } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Lock className="w-6 h-6 text-cyan-400" />
          <span>Security Taint Analysis & Gatekeeper</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Deterministic static analysis, source-to-sink taint tracking, and OWASP vulnerability prevention.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Taint Flow Visualizer */}
        <div className="col-span-8 p-6 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-4">
          <h3 className="text-sm font-bold text-white">Source-to-Sink Taint Tracking Flow</h3>
          <p className="text-xs text-slate-400">
            Traces untrusted user payload input across service layers down to execution sinks.
          </p>

          <div className="p-4 rounded-xl bg-[#07090e] border border-[#1c2333] space-y-3 font-mono text-xs text-slate-300">
            <div className="text-cyan-400 font-bold">Execution Taint Trace:</div>
            <div className="space-y-2 pl-3 border-l-2 border-cyan-500/40">
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                <span className="text-cyan-300 font-bold">[1. SOURCE]</span> User Input Parameter:{' '}
                <code>payload.get("code")</code>, <code>payload.get("user_id")</code>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                <span className="text-indigo-300 font-bold">[2. PROPAGATION]</span> Method Argument:{' '}
                <code>CouponService.validate_and_apply(...)</code>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                <span className="text-emerald-400 font-bold">[3. SINK (SAFE)]</span> SQLite Prepared Statement:
                Parameterized tuple binding <code>(? ,)</code> verified.
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                <span className="text-rose-400 font-bold">[4. SINK (VULN)]</span> Expiration & Idempotency logic:
                Unnormalized system clock comparison.
              </div>
            </div>
          </div>
        </div>

        {/* Security Rules Checklist */}
        <div className="col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Enforced Security Rules</h4>
            <div className="space-y-2 text-xs">
              {[
                { name: 'SQL Injection Barrier', status: 'Passed', sev: 'Critical' },
                { name: 'Dynamic Code Eval Ban', status: 'Passed', sev: 'Critical' },
                { name: 'Timing Attack Protection', status: 'Passed', sev: 'High' },
                { name: 'Idempotency Validation', status: 'Enforced', sev: 'Critical' }
              ].map((rule, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-white/[0.02] border border-[#1c2333] flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white block">{rule.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Severity: {rule.sev}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {rule.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
