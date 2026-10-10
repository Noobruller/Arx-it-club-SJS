import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Trophy,
  FolderGit2,
  Calendar,
  User,
  KeyRound,
  LogOut,
  Send } from
'lucide-react';






export const PortalSidebar = ({ currentPath, navigate }) => {
  const { member, logout } = useAuth();

  const navItems = [
  { label: 'Dashboard', path: '/portal/dashboard', icon: LayoutDashboard },
  { label: 'My Courses', path: '/portal/courses', icon: BookOpen },
  { label: 'My Certificates', path: '/portal/certificates', icon: Award },
  { label: 'My Awards', path: '/portal/awards', icon: Trophy },
  { label: 'My Projects', path: '/portal/projects', icon: FolderGit2 },
  { label: 'Events', path: '/events', icon: Calendar },
  { label: 'My Profile', path: '/portal/profile', icon: User },
  { label: 'Change Password', path: '/portal/change-password', icon: KeyRound }];


  return (
    <aside className="w-full lg:w-64 bg-[#EFE6DE]/60 dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] rounded-lg text-[#282828] dark:text-[#F1F7F4] flex flex-col shrink-0 overflow-hidden shadow-xs transition-colors duration-200">
      {/* Member mini card */}
      <div className="p-4 border-b border-[#282828]/10 dark:border-[#25473C] bg-white/40 dark:bg-[#0A211A]/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#FC6454]/15 dark:bg-[#2F8068]/30 border border-[#FC6454]/30 dark:border-[#2F8068] text-[#FC6454] dark:text-[#6BB89E] flex items-center justify-center font-mono font-bold text-xs shrink-0">
            {member?.studentName ? member.studentName.charAt(0).toUpperCase() : 'M'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-[#282828] dark:text-[#F1F7F4] truncate font-sans">
              {member?.studentName || 'Member'}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[10px] text-[#FC6454] dark:text-[#6BB89E] bg-[#FC6454]/10 dark:bg-[#071A14] px-1.5 py-0.2 rounded-sm border border-[#FC6454]/25 dark:border-[#25473C]">
                {member?.memberId || 'TI------'}
              </span>
              <span className="text-[10px] text-[#282828]/60 dark:text-[#B7C9C2]">Class {member?.class || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-2 space-y-0.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              active ?
              'bg-[#FC6454] text-white dark:bg-[#2F8068] dark:text-[#F1F7F4] font-semibold shadow-xs' :
              'text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-[#F1F7F4] hover:bg-[#FC6454]/10 dark:hover:bg-[#15362B]'}`
              }>
              
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-white dark:text-[#F1F7F4]' : 'text-[#282828]/40 dark:text-[#7F9990]'}`} />
              <span>{item.label}</span>
            </button>);

        })}
      </nav>

      {/* Channel Hub status callout */}
      <div className="p-3 mx-2.5 mb-3 rounded-md bg-white dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] text-xs">
        <div className="flex items-center justify-between text-[#FC6454] dark:text-[#6BB89E] font-medium mb-1">
          <span className="flex items-center gap-1.5 text-[11px] font-mono">
            <Send className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" /> Telegram Hub
          </span>
          <span className="text-[9px] font-mono text-emerald-700 dark:text-[#58B889] bg-emerald-50 dark:bg-[#102B22] px-1 py-0.2 rounded-sm border border-emerald-200 dark:border-[#25473C]">
            ACTIVE
          </span>
        </div>
        <p className="text-[11px] text-[#282828]/60 dark:text-[#B7C9C2] leading-relaxed">
          Official channel announcements and bot notifications connected.
        </p>
      </div>

      {/* Logout button */}
      <div className="p-2 border-t border-[#282828]/10 dark:border-[#25473C] bg-white/40 dark:bg-transparent">
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-red-600 dark:text-rose-400 hover:bg-red-500/10 dark:hover:bg-rose-950/30 transition-colors cursor-pointer">
          
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Session</span>
        </button>
      </div>
    </aside>);

};