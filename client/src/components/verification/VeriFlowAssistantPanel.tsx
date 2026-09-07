import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Wrench,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Code2,
  ShieldAlert,
  Flame,
  Zap
} from 'lucide-react';
import type { VerificationRun } from '../../types';
import { useApp } from '../../context/AppContext';
import { sfx } from '../../services/audio';

interface AssistantProps {
  run: VerificationRun;
  isOpen: boolean;
  onClose: () => void;
}

export const VeriFlowAssistantPanel: React.FC<AssistantProps> = ({ run, isOpen, onClose }) => {
  const { applyFixAndRerun } = useApp();
  const [activeTab, setActiveTab] = useState<'explanation' | 'diff' | 'repair'>('explanation');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [repairCount, setRepairCount] = useState<number>(run.aiExplanation?.repairAttempts || 0);

  if (!isOpen) return null;

  const isBlocked = run.decision === 'BLOCK' || run.decision === 'REVIEW';

  const handleApplyFix = async () => {
    if (repairCount >= 3) {
      alert('Maximum automated repair attempts (3) reached. Manual developer review is required.');
      return;
    }
    setIsApplying(true);
    try {
      setRepairCount((c) => c + 1);
      await applyFixAndRerun(run.id);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#0d1017] border-l border-[#1c2333] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#1c2333] bg-[#121622] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 flex items-center justify-center p-[1px]">
            <div className="w-full h-full bg-[#090b12] rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>VeriFlow AI Assistant</span>
              <span className="text-[9px] font-semibold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30">
                REPAIR LOOP
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Root cause diagnosis & deterministic fix generation</p>
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

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#1c2333] bg-[#090b12] px-3">
        <button
          onClick={() => {
            sfx.playClick();
            setActiveTab('explanation');
          }}
          className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'explanation'
              ? 'border-brand-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Root Cause Analysis
        </button>
        <button
          onClick={() => {
            sfx.playClick();
            setActiveTab('diff');
          }}
          className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'diff'
              ? 'border-brand-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Proposed Patch Diff
        </button>
      </div>

      {/* Body Content */}
      <div className="p-5 overflow-y-auto flex-1 space-y-4">
        {activeTab === 'explanation' && (
          <div className="space-y-4">
            {/* Deployment Safety Status Alert */}
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                isBlocked
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              }`}
            >
              {isBlocked ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-bold text-white">
                  {isBlocked ? 'NOT SAFE TO DEPLOY' : 'VERIFIED SAFE FOR RELEASE'}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  {run.aiExplanation?.summary || 'Verification detected defects in expiration and duplicate checks.'}
                </p>
              </div>
            </div>

            {/* Q&A Cards */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-[#1c2333]">
                <span className="font-bold text-white block mb-1">What failed?</span>
                <p className="text-slate-400 leading-relaxed">
                  2 automated test assertions failed:
                  <br />
                  1. <code className="text-rose-400">test_expired_coupon_rejected_in_business_timezone</code>
                  <br />
                  2. <code className="text-rose-400">test_duplicate_coupon_application_prevented</code>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-[#1c2333]">
                <span className="font-bold text-white block mb-1">Why did it fail?</span>
                <p className="text-slate-400 leading-relaxed whitespace-pre-line">
                  {run.aiExplanation?.rootCause ||
                    '1. Naive system clock was compared against business timezone without UTC normalization.\n2. Idempotency redemption check was omitted, allowing repeat coupon usage.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-[#1c2333]">
                <span className="font-bold text-white block mb-1">What is the production impact?</span>
                <p className="text-slate-400 leading-relaxed">
                  {run.aiExplanation?.impact ||
                    'Expired coupons can be exploited across timezones and promo codes can be used indefinitely.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-[#1c2333]">
                <span className="font-bold text-white block mb-1">Recommended Solution:</span>
                <p className="text-emerald-400 leading-relaxed">
                  Normalize expiration timestamps to UTC using `timezone.utc` and query `coupon_redemptions` table for
                  prior redemptions.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diff' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">services/coupon_service.py</span>
              <span className="text-slate-400 font-mono text-[10px]">Unified Diff</span>
            </div>

            <pre className="p-3.5 rounded-xl bg-[#07090e] border border-[#1c2333] font-mono text-[11px] overflow-x-auto text-slate-300 leading-relaxed">
              <code>{`@@ -22,7 +22,12 @@
-        # BUG 1 (Timezone Bug): Using local system time
-        current_time = datetime.now()
-        if coupon.expires_at and current_time > coupon.expires_at:
+        # FIX 1: Normalize current time to business timezone in UTC
+        now_utc = datetime.now(timezone.utc)
+        coupon_expires_utc = coupon.expires_at.replace(tzinfo=self.business_tz).astimezone(timezone.utc)
+        if coupon_expires_utc and now_utc > coupon_expires_utc:
             return {"valid": False, "discount": 0.0, "reason": "Coupon has expired"}
 
-        # BUG 2: Missing duplicate usage check
+        # FIX 2: Check if user already applied this coupon
+        usage_count = self.db.query(
+            "SELECT count(*) as count FROM coupon_redemptions WHERE coupon_id = ? AND user_id = ?",
+            (coupon.id, user_id)
+        ).scalar()
+        if usage_count and usage_count > 0:
+            return {"valid": False, "discount": 0.0, "reason": "Coupon already used by this customer"}`}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Footer Repair Action Bar */}
      <div className="p-4 border-t border-[#1c2333] bg-[#121622] flex items-center justify-between">
        <div className="text-[11px] text-slate-400">
          <span>Repair Attempts: </span>
          <span className="font-bold text-cyan-400">{repairCount} / 3</span>
        </div>

        {isBlocked ? (
          <button
            onClick={handleApplyFix}
            disabled={isApplying || repairCount >= 3}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isApplying ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Applying & Re-Verifying...</span>
              </>
            ) : (
              <>
                <Wrench className="w-3.5 h-3.5" />
                <span>Apply Fix & Re-Verify</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Code Verified (SHIP)</span>
          </div>
        )}
      </div>
    </div>
  );
};
