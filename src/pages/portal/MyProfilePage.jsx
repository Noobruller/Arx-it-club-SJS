import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { User, Lock, CheckCircle, Shield, Send, Phone } from 'lucide-react';

export const MyProfilePage = () => {
  const { member, updateMemberState } = useAuth();
  const [form, setForm] = useState({
    studentName: '',
    class: '',
    phoneNumber: '',
    telegramUsername: '',
    award: ''
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(
    null
  );

  useEffect(() => {
    if (member) {
      setForm({
        studentName: member.studentName || '',
        class: member.class || '',
        phoneNumber: member.phoneNumber || '',
        telegramUsername: member.telegramUsername || '',
        award: member.award || ''
      });
    }
  }, [member]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await api.updateProfile(form);
      if (res.success && res.member) {
        updateMemberState(res.member);
        setFeedback({ type: 'success', message: 'Profile updated successfully!' });
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="border-b border-[#282828]/10 dark:border-[#25473C] pb-4">
        <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider">
          ACCOUNT SETTINGS
        </span>
        <h1 className="text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight mt-1">My Profile</h1>
        <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
          Manage your personal club information and contact preferences.
        </p>
      </div>

      {feedback &&
      <div
        className={`p-3 rounded-md text-xs flex items-center gap-2.5 ${
        feedback.type === 'success' ?
        'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60' :
        'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'}`
        }>
        
          {feedback.type === 'success' ?
        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> :

        <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
        }
          <span>{feedback.message}</span>
        </div>
      }

      <div className="p-6 sm:p-8 border border-[#282828]/10 dark:border-[#25473C] rounded-xl bg-white dark:bg-[#102B22] space-y-6 shadow-xs transition-colors">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Member ID (Non-editable strictly per brief) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2]">Member ID</label>
              <span className="text-[11px] font-mono text-[#282828]/50 dark:text-[#7F9990]">Immutable Identifier</span>
            </div>
            <div className="relative">
              <input
                type="text"
                disabled
                value={member?.memberId || 'TI------'}
                className="w-full px-3 py-2 rounded-md border border-[#282828]/10 dark:border-[#25473C] bg-[#FAF4EE] dark:bg-[#0A211A] text-[#FC6454] dark:text-[#6BB89E] font-mono text-xs cursor-not-allowed select-none font-bold" />
              
              <Lock className="w-3.5 h-3.5 text-[#282828]/40 dark:text-[#7F9990] absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990] mt-1">
              Assigned automatically upon registration. Used for logging in.
            </p>
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
              Student Full Name
            </label>
            <input
              type="text"
              required
              value={form.studentName}
              onChange={(e) => setForm({ ...form, studentName: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
            
          </div>

          {/* Class */}
          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">Class</label>
            <input
              type="text"
              required
              placeholder="e.g. 11A"
              value={form.class}
              onChange={(e) => setForm({ ...form, class: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
            
          </div>

          {/* Phone Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2]">Phone Number</label>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-[#58B889] bg-emerald-50 dark:bg-[#15362B] px-1.5 py-0.5 rounded-sm border border-emerald-200 dark:border-[#25473C]">
                CONFIDENTIAL
              </span>
            </div>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-[#282828]/40 dark:text-[#7F9990] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
              
            </div>
          </div>

          {/* Telegram Username */}
          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
              Telegram Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#282828]/40 dark:text-[#7F9990] font-mono text-xs">
                @
              </span>
              <input
                type="text"
                required
                value={form.telegramUsername.replace(/^@/, '')}
                onChange={(e) =>
                setForm({ ...form, telegramUsername: `@${e.target.value.replace(/^@/, '')}` })
                }
                className="w-full pl-7 pr-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
              
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1 mt-1 text-[11px] text-[#282828]/50 dark:text-[#7F9990]">
              <span>
                Bot: @ARXITCLUB_bot · Channel: @arxitclub
              </span>
              {member?.telegramActivated && member?.telegramUserId ?
              <span className="text-emerald-600 dark:text-[#58B889] font-medium">
                  Verified Telegram ID: {member.telegramUserId}
                </span> :

              <a
                href="https://t.me/ARXITCLUB_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FC6454] dark:text-[#6BB89E] hover:underline">
                
                  Link with @ARXITCLUB_bot &rarr;
                </a>
              }
            </div>
          </div>

          {/* Award (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2]">Awards / Honors</label>
              <span className="text-[11px] text-[#282828]/50 dark:text-[#7F9990]">Optional</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Web Development Beginner, Hackathon 2nd Place"
              value={form.award}
              onChange={(e) => setForm({ ...form, award: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
            
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
              className="w-full sm:w-auto">
              
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>);

};