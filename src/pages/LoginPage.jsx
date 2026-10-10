import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/common/Button.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { AlertCircle, ArrowRight, Clock } from 'lucide-react';





export const LoginPage = ({ navigate }) => {
  const { login } = useAuth();
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await login(memberId.trim(), password);
      if (res.success) {
        navigate('/portal/dashboard');
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Invalid Member ID or password. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2.5">
        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center mx-auto bg-transparent shrink-0">
          <img
            src="/assets/arx-logo-light.jpg"
            alt="ARX IT CLUB OF SJS Logo Light"
            className="w-full h-full object-cover rounded-full dark:hidden" />
          <img
            src="/assets/arx-logo-dark.jpg"
            alt="ARX IT CLUB OF SJS Logo Dark"
            className="w-full h-full object-cover rounded-full hidden dark:block" />
        </div>
        <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider font-semibold">
          MEMBER PORTAL
        </span>
        <h1 className="text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight font-sans">Sign In to Account</h1>
        <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
          Enter your unique Member ID and password to access your coursework and credentials.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-xl border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] shadow-xs transition-colors">
        {errorMessage && (
          errorMessage.toLowerCase().includes('under review') ? (
            <div className="mb-5 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <strong className="block font-semibold">Application Under Review</strong>
                <span className="text-[11px] text-amber-800 dark:text-amber-300">
                  {errorMessage}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-5 p-3 rounded-md bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 text-red-800 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
              Member ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ARX-2026-001"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
            
            <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990] mt-1">
              Your official club identifier format: &ldquo;ARX-2026-###&rdquo;.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
            
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#282828]/70 dark:text-[#B7C9C2]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#282828]/20 dark:border-[#294B40] text-[#FC6454] dark:text-[#6BB89E] focus:ring-0" />
              
              <span>Remember session</span>
            </label>
            <button
              type="button"
              onClick={() => setForgotModalOpen(true)}
              className="text-[#FC6454] dark:text-[#6BB89E] text-xs hover:underline cursor-pointer">
              
              Forgot Password?
            </button>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full">
              
              Sign In
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-[#282828]/10 dark:border-[#25473C] text-center text-xs text-[#282828]/60 dark:text-[#B7C9C2] space-y-2">
          <div>
            Don&apos;t have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-[#FC6454] dark:text-[#6BB89E] font-semibold hover:underline cursor-pointer">
              
              Register Here &rarr;
            </button>
          </div>
          <div>
            Received an activation code?{' '}
            <button
              onClick={() => navigate('/activate')}
              className="text-[#FC6454] dark:text-[#6BB89E] font-semibold hover:underline cursor-pointer">
              
              Activate Account &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Password Recovery">
        
        <div className="space-y-4 text-xs text-[#282828]/70 dark:text-[#B7C9C2]">
          <p>
            For student security, credentials can be reset by club administrators or verified via Telegram.
          </p>
          <div className="p-3.5 rounded-lg bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] space-y-1.5">
            <p className="font-semibold text-[#282828] dark:text-[#F1F7F4]">Reset Options:</p>
            <p>1. Visit Computer Lab 3 during Monday or Thursday sessions for an officer reset.</p>
            <p>2. Or message <strong>@ARXITCLUB_bot</strong> from your registered Telegram account.</p>
          </div>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setForgotModalOpen(false)}>
              
              Dismiss
            </Button>
          </div>
        </div>
      </Modal>
    </div>);

};