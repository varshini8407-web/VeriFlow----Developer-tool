import React from 'react';
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Radio,
  Wifi,
  Smartphone,
  Laptop,
  Flame,
  Code2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import type { DeviceState } from '../../types';
import { sfx } from '../../services/audio';

export const OfficeKitPage: React.FC = () => {
  const { officeKit, addToast } = useApp();

  const stateColors: Record<DeviceState, { ring: string; glow: string; text: string; bg: string }> = {
    IDLE: { ring: 'border-slate-600', glow: 'shadow-slate-500/10', text: 'text-slate-300', bg: 'bg-slate-500/10' },
    VERIFYING: { ring: 'border-cyan-500 animate-spin-slow', glow: 'shadow-cyan-500/30 shadow-2xl', text: 'text-cyan-400', bg: 'bg-cyan-500/15' },
    PASSED: { ring: 'border-emerald-500', glow: 'shadow-emerald-500/30 shadow-2xl', text: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    'REVIEW REQUIRED': { ring: 'border-amber-500 animate-pulse', glow: 'shadow-amber-500/30 shadow-2xl', text: 'text-amber-400', bg: 'bg-amber-500/15' },
    BLOCKED: { ring: 'border-rose-500 animate-pulse', glow: 'shadow-rose-500/40 shadow-2xl', text: 'text-rose-400', bg: 'bg-rose-500/15' },
    'APPROVAL REQUIRED': { ring: 'border-indigo-500 animate-pulse', glow: 'shadow-indigo-500/30 shadow-2xl', text: 'text-indigo-400', bg: 'bg-indigo-500/15' },
    DEPLOYED: { ring: 'border-emerald-400 animate-pulse-glow', glow: 'shadow-emerald-400/50 shadow-2xl', text: 'text-emerald-300', bg: 'bg-emerald-500/25' }
  };

  const currentState = officeKit?.state || 'IDLE';
  const styling = stateColors[currentState] || stateColors.IDLE;

  const handleManualState = async (state: DeviceState) => {
    sfx.playClick();
    if (state === 'DEPLOYED' || state === 'PASSED') sfx.playSuccess();
    if (state === 'BLOCKED') sfx.playFailure();

    await api.setOfficeKitState(state, `Manually simulated from desk console`);
    addToast('info', 'Hardware State Changed', `Office Kit desk indicator transitioned to ${state}`);
  };

  const allStates: DeviceState[] = [
    'IDLE',
    'VERIFYING',
    'PASSED',
    'REVIEW REQUIRED',
    'BLOCKED',
    'APPROVAL REQUIRED',
    'DEPLOYED'
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-6 h-6 text-amber-400" />
          <span>Office Kit — Physical Desk Release Indicator</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Ambient IoT desktop gadget that signals live release gate status to developers and engineering managers.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Hardware Device Simulator Box */}
        <div className="col-span-7">
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#151a24] via-[#0d1017] to-[#080a0f] border-2 border-[#2b3548] shadow-2xl space-y-6 relative overflow-hidden">
            {/* Device Hardware Bezel */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs font-mono font-bold text-slate-300 ml-2">VERIFLOW DESK-01 (ESP32-S3)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <Wifi className="w-4 h-4" />
                <span>2.4 GHz Connected</span>
              </div>
            </div>

            {/* Glowing Desk Indicator Ring */}
            <div className="flex flex-col items-center justify-center py-6 space-y-5">
              <div
                className={`w-52 h-52 rounded-full border-8 ${styling.ring} ${styling.bg} ${styling.glow} flex flex-col items-center justify-center transition-all duration-500 relative`}
              >
                <div className="text-center px-4 space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400 block">
                    CURRENT STATE
                  </span>
                  <span className={`text-xl font-black tracking-tight ${styling.text} block font-sans`}>
                    {currentState}
                  </span>
                  <span className="text-[10px] font-mono text-slate-300 block truncate max-w-[140px]">
                    {officeKit?.projectName || 'Coupon Checkout'}
                  </span>
                </div>
              </div>

              {/* Simulated OLED Status Display */}
              <div className="w-full max-w-md p-4 rounded-xl bg-[#000000] border border-white/[0.15] shadow-inner font-mono text-xs space-y-1 text-cyan-400">
                <div className="flex justify-between border-b border-cyan-500/20 pb-1 text-[10px] text-cyan-300">
                  <span>OLED DISPLAY [128x64]</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="pt-1 text-white">PROJECT: {officeKit?.projectName || 'Coupon Checkout Service'}</div>
                <div>STAGE: {officeKit?.stageName || 'Standby'}</div>
                <div className="text-[11px] text-slate-400">INFO: {officeKit?.reason || 'Awaiting command'}</div>
              </div>
            </div>

            {/* Connected Peripherals */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.08] text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <div>
                  <span className="font-bold text-white block">Alex's iPhone 16 Pro</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Paired via BLE & WS</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
                <Laptop className="w-5 h-5 text-indigo-400" />
                <div>
                  <span className="font-bold text-white block">MacBook Pro (M3 Max)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">VS Code IDE Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Manual Hardware State Overrides & IoT Webhook API */}
        <div className="col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-3">
            <h3 className="text-sm font-bold text-white">Simulate Hardware States</h3>
            <p className="text-xs text-slate-400">
              Click any state below to trigger physical LED ring and OLED changes in real-time.
            </p>

            <div className="grid grid-cols-1 gap-2">
              {allStates.map((st) => (
                <button
                  key={st}
                  onClick={() => handleManualState(st)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                    currentState === st
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-md'
                      : 'border-[#1c2333] bg-white/[0.02] text-slate-300 hover:border-white/[0.15]'
                  }`}
                >
                  <span>{st}</span>
                  {currentState === st && <span className="text-[10px] text-amber-400 font-mono">ACTIVE</span>}
                </button>
              ))}
            </div>
          </div>

          {/* IoT Webhook Specs */}
          <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Code2 className="w-4 h-4" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Physical Hardware API Endpoint</h4>
            </div>
            <p className="text-xs text-slate-400">
              Connect real ESP32 / Raspberry Pi microcontroller firmware to this webhook:
            </p>
            <pre className="p-3 rounded-xl bg-[#07090e] border border-[#1c2333] text-[11px] font-mono text-cyan-300 overflow-x-auto">
              <code>{`POST http://localhost:5000/api/office-kit/state
Content-Type: application/json

{
  "state": "DEPLOYED",
  "reason": "100% Verified Release"
}`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
