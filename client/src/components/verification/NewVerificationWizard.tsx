import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FolderGit2,
  GitPullRequest,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileCode2,
  Lock,
  Flame
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sfx } from '../../services/audio';

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewVerificationWizard: React.FC<WizardProps> = ({ isOpen, onClose }) => {
  const { projects, startNewVerification, selectedProjectId } = useApp();

  const [step, setStep] = useState<number>(1);
  const [projectId, setProjectId] = useState<string>(selectedProjectId || 'proj-coupon-demo');
  const [changeType, setChangeType] = useState<'branch' | 'pr' | 'commit' | 'upload' | 'manual'>('pr');
  const [changeTarget, setChangeTarget] = useState<string>('PR #142: feat(coupon)-discount-engine');
  const [requirementText, setRequirementText] = useState<string>(
    'Add a coupon feature that allows users to apply a discount code before checkout. The coupon must expire according to the configured timezone and must not be applied twice.'
  );
  const [verificationLevel, setVerificationLevel] = useState<'quick' | 'standard' | 'strict'>('standard');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const quickPresets = [
    {
      title: 'Coupon Timezone & Duplicate Discount Engine',
      desc: 'Coupon feature with business timezone expiration and single-use idempotency.',
      text: 'Add a coupon feature that allows users to apply a discount code before checkout. The coupon must expire according to the configured timezone and must not be applied twice.'
    },
    {
      title: 'OAuth2 / OpenID SSO Gateway Auth',
      desc: 'Enforce constant-time timing-safe token comparison and JWT algorithm whitelist.',
      text: 'Enforce constant-time comparison for HMAC authorization tokens and reject unsigned tokens.'
    },
    {
      title: 'Stripe Webhook Signature Verification',
      desc: 'Cryptographic signature verification before financial payload ingest.',
      text: 'Validate HMAC signatures on incoming Stripe/PayPal webhooks before executing invoice ledger updates.'
    }
  ];

  const handleStart = async () => {
    setIsSubmitting(true);
    try {
      await startNewVerification({
        projectId,
        requirementText,
        changeType,
        changeTarget,
        verificationLevel
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0f131c] border border-[#232b3e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1c2333] flex items-center justify-between bg-[#121722]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">New Code Verification</h3>
              <p className="text-xs text-slate-400">Step {step} of 4: Release Certification Wizard</p>
            </div>
          </div>
          <button
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="h-1 bg-[#161c28] w-full flex">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-full flex-1 transition-all duration-300 ${
                s <= step ? 'bg-gradient-to-r from-brand-500 to-cyan-400' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: Select Project */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Select Target Project</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose an existing repository or pick the seeded demo service.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      sfx.playClick();
                      setProjectId(p.id);
                    }}
                    className={`p-3.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                      projectId === p.id
                        ? 'border-brand-500 bg-brand-500/10 text-white shadow-md shadow-brand-500/10'
                        : 'border-[#1c2333] bg-white/[0.02] text-slate-300 hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FolderGit2 className={`w-5 h-5 mt-0.5 ${projectId === p.id ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{p.name}</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-300">
                            {p.mainLanguage}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{p.description}</p>
                      </div>
                    </div>
                    {projectId === p.id && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Select Change */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Select Change Context</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Specify whether you are verifying a Pull Request, branch, or uploaded AI suggestion.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'pr', label: 'Pull Request', desc: 'Simulate GitHub PR check', icon: GitPullRequest },
                  { id: 'branch', label: 'Feature Branch', desc: 'Verify git branch diff', icon: FolderGit2 },
                  { id: 'upload', label: 'Uploaded Code ZIP', desc: 'Verify standalone bundle', icon: FileCode2 },
                  { id: 'manual', label: 'Manual Requirement', desc: 'Verify prompt directly', icon: Sparkles }
                ].map((c) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        sfx.playClick();
                        setChangeType(c.id as any);
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        changeType === c.id
                          ? 'border-brand-500 bg-brand-500/10 text-white'
                          : 'border-[#1c2333] bg-white/[0.02] text-slate-300 hover:border-white/[0.15]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-2 ${changeType === c.id ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold text-white">{c.label}</span>
                      <span className="text-[10px] text-slate-400">{c.desc}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Change Target / Reference ID
                </label>
                <input
                  type="text"
                  value={changeTarget}
                  onChange={(e) => setChangeTarget(e.target.value)}
                  className="w-full bg-[#090b12] border border-[#232b3e] rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 font-mono"
                  placeholder="e.g. PR #142: feat(coupon)-discount-engine"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Enter Requirement */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Enter Natural Language Requirement</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  VeriFlow AI will convert this requirement into verifiable acceptance criteria & test cases.
                </p>
              </div>

              <textarea
                rows={4}
                value={requirementText}
                onChange={(e) => setRequirementText(e.target.value)}
                className="w-full bg-[#090b12] border border-[#232b3e] rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500 leading-relaxed font-sans"
                placeholder="Describe the expected behavior, edge cases, and business rules..."
              />

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Presets
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {quickPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        sfx.playClick();
                        setRequirementText(preset.text);
                      }}
                      className="text-left p-2.5 rounded-lg border border-[#1c2333] bg-white/[0.02] hover:bg-white/[0.05] text-xs transition-colors"
                    >
                      <span className="font-semibold text-cyan-400 block">{preset.title}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{preset.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Select Verification Level */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Select Verification Rigor Level</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose the depth of static analysis, runtime tests, and security scans.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: 'quick',
                    title: 'Quick Check',
                    icon: Zap,
                    desc: 'Syntax, AST parse, basic unit tests, and dependency sanity.',
                    tag: '~1.5 sec'
                  },
                  {
                    id: 'standard',
                    title: 'Standard Check',
                    icon: ShieldCheck,
                    desc: 'Requirement analysis, impact graph, security taint tracking, runtime tests.',
                    tag: '~3.5 sec'
                  },
                  {
                    id: 'strict',
                    title: 'Strict Release',
                    icon: Flame,
                    desc: 'All standard checks + mutation tests, DB schema validation, and Proof-of-Ship.',
                    tag: '~5.0 sec'
                  }
                ].map((lvl) => {
                  const Icon = lvl.icon;
                  const isSelected = verificationLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => {
                        sfx.playClick();
                        setVerificationLevel(lvl.id as any);
                      }}
                      className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/10 text-white shadow-md shadow-brand-500/15'
                          : 'border-[#1c2333] bg-white/[0.02] text-slate-300 hover:border-white/[0.15]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400">
                            {lvl.tag}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white">{lvl.title}</h5>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{lvl.desc}</p>
                      </div>
                      {isSelected && (
                        <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-cyan-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Review Summary */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-[#1c2333] text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Target Project:</span>
                  <span className="text-slate-200 font-semibold">
                    {projects.find((p) => p.id === projectId)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Change:</span>
                  <span className="text-slate-200 font-mono">{changeTarget}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Level:</span>
                  <span className="text-cyan-400 font-bold uppercase">{verificationLevel} CHECK</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1c2333] flex items-center justify-between bg-[#121722]">
          {step > 1 ? (
            <button
              onClick={() => {
                sfx.playClick();
                setStep(step - 1);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] border border-white/[0.08]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => {
                sfx.playClick();
                setStep(step + 1);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin-slow" />
              <span>{isSubmitting ? 'Starting Pipeline...' : 'Start Verification'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
