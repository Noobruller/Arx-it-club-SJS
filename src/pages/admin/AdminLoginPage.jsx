import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { ADMIN_DASHBOARD_PATH } from '../../config/adminRoute.js';

export const AdminLoginPage = ({ navigate }) => {
  const { adminLogin } = useAuth();
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await adminLogin(memberId.trim(), password);
      if (res.success) {
        navigate(ADMIN_DASHBOARD_PATH);
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Invalid administrator credentials. Access denied.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-md mx-auto px-4 py-12 space-y-6">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs text-[#282828]/60 hover:text-[#282828] dark:text-[#B7C9C2] dark:hover:text-[#6BB89E] cursor-pointer self-start transition-colors">

        <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Site
      </button>

      <div className="text-center space-y-2.5">
        <div className="w-10 h-10 rounded-md bg-[#FAF4EE] dark:bg-[#15362B] border border-[#282828]/15 dark:border-[#25473C] flex items-center justify-center mx-auto p-1 text-[#FC6454] dark:text-[#6BB89E]">
          <ShieldCheck className="w-5 h-5 text-[#FC6454] dark:text-[#6BB89E]" />
        </div>
        <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider font-semibold">
          STAFF CONSOLE
        </span>
        <h1 className="text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight font-sans">IT Club Operations</h1>
        <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
          Internal administrative workspace for authorized officers and faculty advisors.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-xl border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] shadow-xs transition-colors">
        {errorMessage &&
          <div className="mb-5 p-3 rounded-md bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 text-red-800 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        }

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
              Admin Account Username
            </label>
            <input
              type="text"
              required
              placeholder="admin or ARX-admin"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
              Security Key / Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />

          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full">

              Sign In to Console
            </Button>
          </div>
        </form>
      </div>
    </div>);

};