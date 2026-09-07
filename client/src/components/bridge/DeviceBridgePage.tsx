import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Mic,
  MicOff,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  QrCode,
  ShieldCheck,
  Zap,
  Volume2,
  Sparkles,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { sfx } from '../../services/audio';

export const DeviceBridgePage: React.FC = () => {
  const { verifications, proofOfShipList, officeKit, addToast, setCurrentRoute } = useApp();
  const [activeRun, setActiveRun] = useState(verifications[0] || null);

  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceQuery, setVoiceQuery] = useState<string>('');
  const [messages, setMessages] = useState<
    { sender: 'user' | 'assistant'; text: string; time: string; action?: string }[]
  >([
    {
      sender: 'assistant',
      text: 'VeriFlow Mobile Companion Connected. Ask questions using voice or tap quick actions below.',
      time: '12:00'
    }
  ]);

  useEffect(() => {
    if (verifications.length > 0) {
      setActiveRun(verifications[0]);
    }
  }, [verifications]);

  // Voice Command Speech Recognition setup
  const handleToggleVoice = () => {
    sfx.playClick();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast(
        'info',
        'Speech Recognition Unavailable',
        'Speech API is not supported in this browser. Please use the text input below.'
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        addToast('info', 'Listening...', 'Speak a command like "Explain the latest failure" or "Approve deployment".');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceQuery(transcript);
        handleSendCommand(transcript);
      };

      recognition.onerror = (err: any) => {
        console.warn('[Speech] Error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleSendCommand = async (cmdText?: string) => {
    const textToSend = cmdText || voiceQuery;
    if (!textToSend.trim()) return;

    sfx.playClick();
    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setVoiceQuery('');

    try {
      const res = await api.sendDeviceCommand(textToSend, activeRun?.id);
      const assistantMsg = {
        sender: 'assistant' as const,
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Failed to process command. Please verify network connection.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleApprove = async () => {
    const pos = proofOfShipList[0];
    if (pos) {
      sfx.playSuccess();
      await api.approveProofOfShip(pos.id, {
        approverName: 'Alex Mercer',
        comment: '1-Tap Approved via Phone Device Bridge',
        channel: 'DEVICE_BRIDGE'
      });
      addToast('success', 'Release Approved', `Proof-of-Ship ${pos.certificateId} stamped. Office Kit deployed!`);
    } else {
      addToast('error', 'Cannot Deploy', 'No active Proof-of-Ship certificate is available for release.');
    }
  };

  const isShip = activeRun?.decision === 'SHIP';
  const isBlock = activeRun?.decision === 'BLOCK';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-cyan-400" />
          <span>Phone Device Bridge</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Mobile companion interface for real-time release authorization, voice diagnostics, and alert dispatch.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left: Pairing QR Code & Connection Status */}
        <div className="col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-[#0f131c] border border-[#232b3e] text-center space-y-4">
            <h3 className="text-sm font-bold text-white">Pair Mobile Device</h3>
            <p className="text-xs text-slate-400">
              Scan with your phone camera or use the interactive smartphone emulator on the right.
            </p>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl">
              <QRCodeSVG value="https://veriflow.io/bridge?session=dev-alex-mercer-01" size={160} />
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono text-slate-300 flex items-center justify-between">
              <span>Session ID: VF-SESS-9921</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Supported Voice Commands</h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-300">
              {[
                '“Explain the latest failure”',
                '“Show critical issues”',
                '“What files were affected?”',
                '“Approve deployment”',
                '“Reject deployment”',
                '“Show Proof-of-Ship”'
              ].map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => handleSendCommand(cmd.replace(/[“”]/g, ''))}
                  className="p-2 rounded-lg bg-white/[0.02] border border-[#1c2333] hover:border-cyan-500/40 text-left font-mono text-cyan-300 text-[11px] transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Realistic Phone Frame Emulator */}
        <div className="col-span-7 flex justify-center">
          <div className="w-[360px] h-[700px] bg-[#000000] border-4 border-[#2b3346] rounded-[48px] shadow-2xl p-4 flex flex-col relative overflow-hidden ring-1 ring-white/10">
            {/* Dynamic Island / Speaker Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#161c28] ml-auto mr-3" />
            </div>

            {/* Mobile Screen Container */}
            <div className="w-full h-full bg-[#0b0e14] rounded-[36px] flex flex-col pt-7 pb-2 px-3 overflow-hidden text-xs">
              {/* Mobile Top App Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] px-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">VeriFlow Companion</h4>
                    <span className="text-[9px] text-slate-400 font-mono">Alex Mercer • Lead</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  <span>LIVE</span>
                </div>
              </div>

              {/* Active Verification Card on Mobile */}
              {activeRun && (
                <div className="mt-3 p-3 rounded-2xl bg-[#121622] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[160px]">
                      {activeRun.projectName}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        isShip
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isBlock
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {activeRun.decision}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-300">Risk: {activeRun.riskScore}/100</span>
                    <span className="text-cyan-400">Tests: {activeRun.stats.testsPassed}/{activeRun.stats.testsTotal}</span>
                  </div>

                  {/* 1-Tap Deployment Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleApprove}
                      className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>1-Tap Approve</span>
                    </button>
                    <button
                      onClick={() => handleSendCommand('Reject deployment')}
                      className="py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-bold text-[10px] flex items-center justify-center gap-1 border border-rose-500/30"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Voice / Chat Stream Container */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 px-1 font-sans">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-2.5 rounded-2xl max-w-[85%] text-[11px] leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-brand-600 text-white rounded-br-none'
                          : 'bg-white/[0.05] border border-white/[0.08] text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[8px] text-slate-400 mt-0.5 px-1 font-mono">{m.time}</span>
                  </div>
                ))}
              </div>

              {/* Voice & Text Input Bottom Bar */}
              <div className="pt-2 border-t border-white/[0.08] flex items-center gap-1.5">
                <button
                  onClick={handleToggleVoice}
                  className={`p-2 rounded-full transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                  }`}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={voiceQuery}
                  onChange={(e) => setVoiceQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
                  placeholder={isListening ? 'Listening...' : 'Type or speak command...'}
                  className="flex-1 bg-[#121622] border border-white/[0.08] rounded-full px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-cyan-500"
                />

                <button
                  onClick={() => handleSendCommand()}
                  className="p-2 rounded-full bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
