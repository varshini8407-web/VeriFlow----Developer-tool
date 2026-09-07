import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  QrCode,
  Download,
  Share2,
  Lock,
  Sparkles,
  FileCheck2,
  Clock,
  Printer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import type { ProofOfShip } from '../../types';
import { sfx } from '../../services/audio';

export const ProofOfShipPage: React.FC = () => {
  const { proofOfShipList, selectedProofOfShip, setSelectedProofOfShip, addToast } = useApp();

  const activeCert = selectedProofOfShip || (proofOfShipList.length > 0 ? proofOfShipList[0] : null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    sfx.playClick();
    addToast('info', 'Copied to Clipboard', `${label} copied successfully.`);
  };

  const handlePrint = () => {
    sfx.playClick();
    window.print();
  };

  if (!activeCert) {
    return (
      <div className="p-12 text-center text-slate-400 bg-[#0f131c] rounded-2xl border border-[#232b3e]">
        <Award className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <h3 className="text-sm font-bold text-white">No Proof-of-Ship Certificates Yet</h3>
        <p className="text-xs text-slate-400 mt-1">
          Proof-of-Ship certificates appear automatically once a verification run passes with 100% executable evidence (SHIP).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-400" />
            <span>Proof-of-Ship Verification Certificates</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically sealed, evidence-backed release certificates for production deployments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] border border-white/[0.08]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Certificate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Certificate List Selector */}
        <div className="col-span-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
            Issued Certificates ({proofOfShipList.length})
          </span>

          <div className="space-y-2">
            {proofOfShipList.map((cert) => {
              const isSelected = activeCert.id === cert.id;
              return (
                <button
                  key={cert.id}
                  onClick={() => {
                    sfx.playClick();
                    setSelectedProofOfShip(cert);
                  }}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10'
                      : 'border-[#1c2333] bg-[#0f131c] text-slate-300 hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">{cert.certificateId}</span>
                    <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                      {cert.decision}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1.5">{cert.projectName}</h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{cert.requirementSummary}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Certificate Visual Presentation Card */}
        <div className="col-span-8">
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#0e141c] via-[#090d14] to-[#07090e] border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden space-y-6">
            {/* Holographic Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-500" />
            
            {/* Certificate Header */}
            <div className="flex items-start justify-between border-b border-emerald-500/20 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Award className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                      OFFICIAL RELEASE SEAL
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight mt-1">Proof-of-Ship Certificate</h3>
                  <p className="text-xs font-mono text-slate-400">{activeCert.certificateId}</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="p-2.5 rounded-xl bg-white p-2 shadow-xl shrink-0">
                <QRCodeSVG value={activeCert.qrCodeUrl || `https://veriflow.io/verify/${activeCert.certificateId}`} size={84} />
              </div>
            </div>

            {/* Target Details */}
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-slate-400 font-mono text-[10px] block">Project Repository</span>
                <span className="font-bold text-white mt-0.5 block">{activeCert.projectName}</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-slate-400 font-mono text-[10px] block">Verified Commit</span>
                <span className="font-mono text-cyan-400 font-bold mt-0.5 block truncate">
                  {activeCert.commitHash.substring(0, 12)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-slate-400 font-mono text-[10px] block">Timestamp</span>
                <span className="font-mono text-slate-200 mt-0.5 block">
                  {new Date(activeCert.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Verification Proof Summary */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Requirement Specification
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">{activeCert.requirementSummary}</p>
            </div>

            {/* Metrics Checklist */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Final Decision</span>
                <span className="text-sm font-extrabold text-white mt-0.5 block">{activeCert.decision}</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Tests Passed</span>
                <span className="text-sm font-extrabold text-emerald-400 mt-0.5 block font-mono">
                  {activeCert.testsPassed} / {activeCert.testsTotal}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Security Status</span>
                <span className="text-sm font-extrabold text-emerald-400 mt-0.5 block">{activeCert.securityStatus}</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Requirement Coverage</span>
                <span className="text-sm font-extrabold text-cyan-400 mt-0.5 block font-mono">
                  {activeCert.requirementCoverage}%
                </span>
              </div>
            </div>

            {/* Cryptographic SHA-256 Hash */}
            <div className="p-3.5 rounded-xl bg-[#07090e] border border-[#1c2333] flex items-center justify-between text-xs">
              <div className="truncate mr-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Cryptographic Proof Hash</span>
                <span className="font-mono text-slate-300 text-[11px] truncate block">{activeCert.verificationHash}</span>
              </div>
              <button
                onClick={() => copyToClipboard(activeCert.verificationHash, 'Verification Hash')}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Approvals Stamp */}
            {activeCert.approvals && activeCert.approvals.length > 0 && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Release Authorization Log
                </span>
                <div className="space-y-1.5">
                  {activeCert.approvals.map((app, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                      <div>
                        <span className="font-bold text-white">{app.approverName}</span> ({app.role})
                        <p className="text-[11px] text-slate-400 italic mt-0.5">"{app.comment}"</p>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase bg-emerald-500/20 px-2 py-0.5 rounded">
                        {app.channel} • {app.decision}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mandatory Disclaimer */}
            <div className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.04] text-[10px] text-slate-400 leading-relaxed text-center">
              {activeCert.disclaimer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
