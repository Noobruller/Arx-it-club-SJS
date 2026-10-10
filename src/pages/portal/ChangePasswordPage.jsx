import React, { useState } from 'react';
import { api } from '../../services/api.js';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { KeyRound, CheckCircle, ShieldAlert, Lock } from 'lucide-react';

export const ChangePasswordPage = () => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(
    null
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (form.newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Password changed successfully!' });
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to change password. Please check your current password.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="border-b border-[#282828]/10 dark:border-[#25473C] pb-4">
        <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider font-semibold">
          SECURITY &amp; ACCESS
        </span>
        <h1 className="text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight mt-1 font-sans">
          Change Password
        </h1>
        <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
          Ensure your account stays secure with an updated personal passphrase.
        </p>
      </div>

      {feedback &&
      <div
        className={`p-3 rounded-md text-xs flex items-center gap-2.5 ${
        feedback.type === 'success' ?
        'bg-emerald-50 dark:bg-[#15362B] text-emerald-800 dark:text-[#58B889] border border-emerald-200 dark:border-[#25473C]' :
        'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'}`
        }>
        
          {feedback.type === 'success' ?
        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-[#58B889] shrink-0" /> :

        <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
        }
          <span>{feedback.message}</span>
        </div>
      }

      <div className="p-6 sm:p-8 border border-[#282828]/10 dark:border-[#25473C] rounded-xl bg-white dark:bg-[#102B22] shadow-xs transition-colors">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
            
          </div>

          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
            
          </div>

          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Re-enter new password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
            
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full sm:w-auto">
              
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>);

};