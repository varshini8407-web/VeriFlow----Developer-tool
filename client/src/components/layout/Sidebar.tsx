import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  ShieldCheck,
  GitPullRequest,
  AlertTriangle,
  Award,
  CheckCircle2,
  Lock,
  Boxes,
  Smartphone,
  Cpu,
  Settings,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { NavigationRoute } from '../../context/AppContext';
import { sfx } from '../../services/audio';

export const Sidebar: React.FC = () => {
  const { currentRoute, setCurrentRoute, user, currentWorkspace, issues, proofOfShipList, officeKit } = useApp();
  const [soundOn, setSoundOn] = React.useState(true);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sfx.enabled = next;
    if (next) sfx.playClick();
  };

  const navItems: { id: NavigationRoute; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'verifications', label: 'Verification Runs', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'pull-requests', label: 'Pull Requests', icon: <GitPullRequest className="w-4 h-4" /> },
    {
      id: 'issues',
      label: 'Issues',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: issues.filter((i) => i.status === 'open').length || undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
    },
    {
      id: 'proof-of-ship',
      label: 'Proof-of-Ship',
      icon: <Award className="w-4 h-4" />,
      badge: proofOfShipList.length || undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    },
    { id: 'test-cases', label: 'Test Cases', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Boxes className="w-4 h-4" /> },
    {
      id: 'device-bridge',
      label: 'Device Bridge',
      icon: <Smartphone className="w-4 h-4" />,
      badge: 'LIVE',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
    },
    {
      id: 'office-kit',
      label: 'Office Kit',
      icon: <Cpu className="w-4 h-4" />,
      badge: officeKit?.state || 'IDLE',
      badgeColor:
        officeKit?.state === 'PASSED' || officeKit?.state === 'DEPLOYED'
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : officeKit?.state === 'BLOCKED'
          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-64 bg-[#0c0f17] border-r border-[#1c2333] flex flex-col justify-between h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1c2333]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-[#090a0f] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">VeriFlow</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded border border-brand-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">Release Control Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
          Release Lifecycle
        </div>

        {navItems.map((item) => {
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sfx.playClick();
                setCurrentRoute(item.id);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600/15 text-white border border-brand-500/40 shadow-sm shadow-brand-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom User & Workspace Card */}
      <div className="p-3 border-t border-[#1c2333] bg-[#090b12]/80 space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[130px]">{currentWorkspace?.name || 'Demo Workspace'}</span>
          </div>
          <button
            onClick={toggleSound}
            title={soundOn ? 'Mute Audio Effects' : 'Unmute Audio Effects'}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
          </button>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
            alt="User avatar"
            className="w-8 h-8 rounded-full border border-brand-500/40 object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Alex Mercer'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.role || 'Lead Architect'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
