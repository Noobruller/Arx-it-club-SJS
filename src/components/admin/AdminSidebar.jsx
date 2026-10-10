import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  BookOpen,
  GraduationCap,
  Award,
  Trophy,
  FolderGit2,
  Calendar,
  Medal,
  Bell,
  Send,
  Settings,
  UserCheck,
  LogOut,
  ExternalLink,
  Image as ImageIcon,
  Sun,
  Moon } from
'lucide-react';
import { ADMIN_LOGIN_PATH } from '../../config/adminRoute.js';























export const AdminSidebar = ({
  currentTab,
  onSelectTab,
  navigate,
  pendingApplicationsCount = 0
}) => {
  const { member, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'applications', label: 'Application Review', icon: ClipboardCheck, badge: pendingApplicationsCount },
  { id: 'media', label: 'Media Library', icon: ImageIcon },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'enrollments', label: 'Enrollments', icon: GraduationCap },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'awards', label: 'Awards', icon: Trophy },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'achievements', label: 'Achievements', icon: Medal },
  { id: 'announcements', label: 'Announcements', icon: Bell },
  { id: 'telegram', label: 'Telegram', icon: Send },
  { id: 'settings', label: 'Website Settings', icon: Settings },
  { id: 'profile', label: 'Admin Profile', icon: UserCheck }];


  return (
    <aside className="w-full lg:w-64 bg-[#EFE6DE]/60 dark:bg-[#0A211A] border-r border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] flex flex-col shrink-0 transition-colors duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#282828]/10 dark:border-[#25473C]">
        <div className="flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-transparent shrink-0">
            <img
              src="/assets/arx-logo-light.jpg"
              alt="ARX Compact Logo Light"
              className="w-full h-full object-cover rounded-full dark:hidden" />
            <img
              src="/assets/arx-logo-dark.jpg"
              alt="ARX Compact Logo Dark"
              className="w-full h-full object-cover rounded-full hidden dark:block" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-sans">Operations Console</h4>
            <p className="text-[10px] font-mono text-[#FC6454] dark:text-[#6BB89E] font-medium">ADMINISTRATIVE DESK</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
              active ?
              'bg-[#FC6454] text-white dark:bg-[#2F8068] dark:text-[#F1F7F4] font-semibold shadow-xs' :
              'text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-[#F1F7F4] hover:bg-[#FC6454]/10 dark:hover:bg-[#102B22]'}`
              }>
              
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-white dark:text-[#F1F7F4]' : 'text-[#282828]/40 dark:text-[#7F9990]'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {Boolean(item.badge && item.badge > 0) && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold leading-normal ${
                  active
                    ? 'bg-white text-[#FC6454] dark:bg-[#0A211A] dark:text-[#6BB89E]'
                    : 'bg-[#FC6454] text-white dark:bg-[#2F8068] dark:text-[#F1F7F4]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>);

        })}
      </nav>

      {/* Public Site Link & Theme Toggle & Logout */}
      <div className="p-3 border-t border-[#282828]/10 dark:border-[#25473C] space-y-1 bg-white/40 dark:bg-transparent">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#FC6454] dark:hover:text-[#6BB89E] hover:bg-[#FC6454]/10 dark:hover:bg-[#102B22] transition-colors cursor-pointer">
          
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-[#6BB89E]" /> : <Moon className="w-3.5 h-3.5 text-[#282828]" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Night Mode'}</span>
          </span>
          <span className="text-[10px] font-mono uppercase text-[#FC6454] dark:text-[#6BB89E]">Toggle</span>
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-[#F1F7F4] hover:bg-[#FC6454]/10 dark:hover:bg-[#102B22] transition-colors cursor-pointer">
          
          <span>View Public Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#282828]/40 dark:text-[#7F9990]" />
        </button>
        <button
          onClick={() => {
            logout();
            navigate(ADMIN_LOGIN_PATH);
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-950/30 transition-colors cursor-pointer">
          
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Console</span>
        </button>
      </div>
    </aside>);

};