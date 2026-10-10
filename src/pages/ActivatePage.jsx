import React, { useState } from 'react';
import { api } from '../services/api.js';
import { Button } from '../components/common/Button.jsx';
import { CheckCircle2, AlertCircle, KeyRound, ArrowRight, ExternalLink, Send, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';






export const ActivatePage = ({ navigate, initialCode = '' }) => {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [alreadyActiveInfo, setAlreadyActiveInfo] = useState(


    null);

  const [activationResult, setActivationResult] = useState(





    null);

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMessage('Please enter your activation code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setAlreadyActiveInfo(null);

    try {
      const res = await api.activateAccount(code.trim());

      if (res.alreadyActive) {
        setAlreadyActiveInfo({
          memberId: res.member?.memberId,
          studentName: res.member?.studentName
        });
        return;
      }

      if (res.success && res.member) {
        setActivationResult({
          memberId: res.member.memberId,
          studentName: res.member.studentName,
          class: res.member.class,
          telegramBotUrl: res.telegramBotUrl || 'https://t.me/ARXITCLUB_bot',
          telegramChannelUrl: res.telegramChannelUrl || 'https://t.me/arxitclub'
        });

        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {

          // ignore
        }} else {
        setErrorMessage(res.message || 'Activation failed. Please check the code and try again.');
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Something went wrong while activating your account. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS STATE
  if (activationResult) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-8">
        <div className="text-center space-y-2.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-[#102B22] text-emerald-600 dark:text-[#58B889] flex items-center justify-center mx-auto border border-emerald-200 dark:border-[#25473C]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="text-xs font-mono text-emerald-700 dark:text-[#58B889] uppercase tracking-wider font-semibold">
            STATUS · ACTIVATED
          </span>
          <h1 className="text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight font-sans">Account Activated</h1>
          <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2]">
            Welcome to ARX IT CLUB OF SJS, <strong>{activationResult.studentName}</strong>. Your membership is verified.
          </p>
        </div>

        <div className="p-6 sm:p-8 border border-[#282828]/10 dark:border-[#25473C] rounded-xl bg-white dark:bg-[#102B22] space-y-6 shadow-xs transition-colors">
          <div className="bg-[#FAF4EE] dark:bg-[#0A211A] rounded-lg p-5 text-center space-y-1.5 border border-[#282828]/10 dark:border-[#25473C]">
            <p className="text-[11px] uppercase tracking-wider text-[#282828]/60 dark:text-[#7F9990] font-mono">
              Assigned Member ID
            </p>
            <p className="font-mono text-3xl font-bold text-[#FC6454] dark:text-[#6BB89E] tracking-wider">
              {activationResult.memberId}
            </p>
            {activationResult.class &&
            <p className="text-xs font-mono text-[#282828]/60 dark:text-[#B7C9C2]">
                Classroom: <strong className="text-[#282828] dark:text-[#F1F7F4]">{activationResult.class}</strong>
              </p>
            }
          </div>

          <div className="p-4 bg-[#FAF4EE]/70 dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] rounded-lg space-y-2 text-left text-xs">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
              <span className="font-semibold text-[#282828] dark:text-[#F1F7F4]">
                Official Telegram Community
              </span>
            </div>
            <p className="text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed">
              Stay connected with club announcements, assignments, and workshops on our official channels:
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <a
                href={activationResult.telegramBotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between px-3 py-2 bg-white dark:bg-[#15362B] border border-[#282828]/10 dark:border-[#25473C] rounded-md text-[#282828] dark:text-[#F1F7F4] hover:text-[#FC6454] dark:hover:text-[#6BB89E] transition-colors">
                
                <span>ARX Bot (@ARXITCLUB_bot)</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#282828]/40 dark:text-[#7F9990]" />
              </a>
              <a
                href={activationResult.telegramChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between px-3 py-2 bg-white dark:bg-[#15362B] border border-[#282828]/10 dark:border-[#25473C] rounded-md text-[#282828] dark:text-[#F1F7F4] hover:text-[#FC6454] dark:hover:text-[#6BB89E] transition-colors">
                
                <span>Broadcast Channel (@arxitclub)</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#282828]/40 dark:text-[#7F9990]" />
              </a>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => navigate('/login')}>
              
              Sign In to Member Portal &rarr;
            </Button>
          </div>
        </div>
      </div>);

  }

  // ALREADY ACTIVE NOTICE
  if (alreadyActiveInfo) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="p-6 sm:p-8 border border-[#282828]/10 dark:border-[#25473C] rounded-xl bg-white dark:bg-[#102B22] text-center space-y-4 shadow-xs transition-colors">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-[#15362B] text-emerald-600 dark:text-[#58B889] flex items-center justify-center mx-auto border border-emerald-200 dark:border-[#25473C]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#282828] dark:text-[#F1F7F4]">Account Already Active</h2>
          <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2]">
            This account ({alreadyActiveInfo.memberId}) is already activated and ready for use.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="md" className="w-full" onClick={() => navigate('/login')}>
              Sign In to Portal
            </Button>
          </div>
        </div>
      </div>);

  }

  // ACTIVATION INPUT FORM
  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2.5">
        <div className="w-10 h-10 rounded-md bg-[#FAF4EE] dark:bg-[#15362B] flex items-center justify-center mx-auto border border-[#282828]/15 dark:border-[#25473C] p-1 text-[#FC6454] dark:text-[#6BB89E]">
          <KeyRound className="w-5 h-5 text-[#FC6454] dark:text-[#6BB89E]" />
        </div>
        <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider font-semibold">
          ACCOUNT VERIFICATION
        </span>
        <h1 className="text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight font-sans">Activate Account</h1>
        <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
          Enter the official single-use activation code received from the club Telegram bot.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-xl border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] shadow-xs transition-colors space-y-5">
        {/* Verification Instructions */}
        <div className="p-4 bg-[#FAF4EE]/70 dark:bg-[#0A211A] rounded-lg border border-[#282828]/10 dark:border-[#25473C] space-y-2 text-xs text-[#282828]/80 dark:text-[#B7C9C2]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#282828] dark:text-[#F1F7F4]">Activate with Telegram</span>
            <a
              href="https://t.me/ARXITCLUB_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-[#FC6454] dark:text-[#6BB89E] hover:underline">
              
              <span>@ARXITCLUB_bot</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 leading-relaxed pl-1 text-[11px]">
            <li>Open the <strong>ARX IT CLUB OF SJS Telegram Bot</strong></li>
            <li>Complete the verification process in Telegram</li>
            <li>The bot will send you your activation code</li>
            <li>Return here and enter that code below</li>
          </ol>
        </div>

        {errorMessage &&
        <div className="p-3 rounded-md bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 text-red-800 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        }

        <form onSubmit={handleActivate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
              Enter activation code
            </label>
            <input
              type="text"
              required
              placeholder="ARX-ACT-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#282828]/20 dark:border-[#294B40] text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] uppercase placeholder:normal-case placeholder:font-sans placeholder:tracking-normal" />
            
            <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990] mt-1 font-mono">
              Format: ARX-ACT-XXXX &bull; Single-use &bull; 5-minute expiry
            </p>
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full text-xs font-mono uppercase tracking-wider py-2.5">
              
              <KeyRound className="w-3.5 h-3.5 mr-1.5" />
              Activate Account
            </Button>
          </div>
        </form>

        <div className="pt-3 border-t border-[#282828]/10 dark:border-[#25473C] text-center text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
          Already activated?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#FC6454] dark:text-[#6BB89E] font-semibold hover:underline cursor-pointer">
            
            Sign In Here &rarr;
          </button>
        </div>
      </div>
    </div>);

};