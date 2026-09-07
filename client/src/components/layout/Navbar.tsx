import React, { useState } from 'react';
import {
  Plus,
  RotateCcw,
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronDown,
  Cpu,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sfx } from '../../services/audio';

export const Navbar: React.FC<{ onOpenWizard: () => void }> = ({ onOpenWizard }) => {
  const {
    currentWorkspace,
    workspaces,
    setCurrentWorkspace,
    officeKit,
    notifications,
    resetDemoState,
    setCurrentRoute
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getOfficeKitBadge = () => {
    const st = officeKit?.state || 'IDLE';
    switch (st) {
      case 'PASSED':
      case 'DEPLOYED':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400 animate-pulse'
        };
      case 'BLOCKED':
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400 animate-pulse'
        };
      case 'VERIFYING':
        return {
          bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
          dot: 'bg-cyan-400 animate-spin'
        };
      default:
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400'
        };
    }
  };

  const badge = getOfficeKitBadge();

  return (
    <header className="h-14 bg-[#0c0f17]/90 backdrop-blur border-b border-[#1c2333] px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Workspace & Repo Switcher */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium text-slate-200 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            <span>{currentWorkspace?.name || 'Demo Workspace'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showWorkspaceMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#121622] border border-[#232b3e] rounded-xl shadow-2xl p-1.5 z-50">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                Select Workspace
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    sfx.playClick();
                    setCurrentWorkspace(ws);
                    setShowWorkspaceMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    currentWorkspace?.id === ws.id
                      ? 'bg-brand-500/20 text-white font-medium'
                      : 'text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.isDemo && (
                    <span className="text-[9px] font-bold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded">
                      DEMO
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Office Kit Desk Status Indicator Pill */}
        <button
          onClick={() => {
            sfx.playClick();
            setCurrentRoute('office-kit');
          }}
          title="Open Physical Desk Indicator Simulation"
          className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${badge.bg}`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold">Office Kit:</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
            <span className="text-[11px]">{officeKit?.state || 'IDLE'}</span>
          </div>
        </button>
      </div>

      {/* Right: Quick Actions & Notifications */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Button */}
        <button
          onClick={resetDemoState}
          title="Reset seeded demo repository and bugs"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reset Demo</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0c0f17]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#121622] border border-[#232b3e] rounded-xl shadow-2xl p-2 z-50">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/[0.06]">
                <span className="text-xs font-bold text-white">Notifications</span>
                <span className="text-[10px] text-slate-400">{notifications.length} total</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.04] mt-1">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-2 hover:bg-white/[0.03] rounded-lg transition-colors">
                    <div className="flex items-start gap-2">
                      {notif.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : notif.type === 'error' ? (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{notif.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{notif.message}</p>
                        <span className="text-[9px] text-slate-400 mt-1 block">
                          {new Date(notif.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary Action: New Verification Wizard Button */}
        <button
          onClick={() => {
            sfx.playClick();
            onOpenWizard();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Verification</span>
        </button>
      </div>
    </header>
  );
};
