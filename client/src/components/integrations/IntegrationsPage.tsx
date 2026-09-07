import React from 'react';
import {
  Boxes,
  GitPullRequest,
  GitBranch,
  MessageSquare,
  Terminal,
  Cpu,
  CheckCircle2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sfx } from '../../services/audio';

export const IntegrationsPage: React.FC = () => {
  const { addToast } = useApp();

  const integrations = [
    {
      id: 'github',
      name: 'GitHub PR Action',
      icon: GitPullRequest,
      desc: 'Automatic release verification status checks and bot PR review reports on every pull request.',
      status: 'CONNECTED',
      color: 'text-white'
    },
    {
      id: 'gitlab',
      name: 'GitLab CI / Merge Requests',
      icon: GitBranch,
      desc: 'Inject VeriFlow stage gates into .gitlab-ci.yml deployment pipelines.',
      status: 'AVAILABLE',
      color: 'text-orange-400'
    },
    {
      id: 'slack',
      name: 'Slack Release Bot',
      icon: MessageSquare,
      desc: 'Real-time notifications for SHIP, REVIEW, and BLOCK outcomes with 1-click team approvals.',
      status: 'CONNECTED',
      color: 'text-emerald-400'
    },
    {
      id: 'officekit',
      name: 'Office Kit IoT Device Bridge',
      icon: Cpu,
      desc: 'Physical desktop indicator hardware sync via WebSockets / REST webhooks.',
      status: 'CONNECTED',
      color: 'text-amber-400'
    }
  ];

  const handleToggle = (name: string) => {
    sfx.playClick();
    addToast('info', 'Integration Updated', `${name} settings saved.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Boxes className="w-6 h-6 text-brand-400" />
          <span>Release Gate Integrations</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Connect your Git providers, CI/CD runners, chat alert channels, and IoT hardware indicators.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {integrations.map((item) => {
          const Icon = item.icon;
          const isConnected = item.status === 'CONNECTED';
          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        isConnected
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/[0.05] text-slate-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">Webhook: /api/webhook/{item.id}</span>
                <button
                  onClick={() => handleToggle(item.name)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white transition-colors"
                >
                  Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
