import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { api } from '../../services/api.js';
import { Button } from '../common/Button.jsx';
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
  Sun,
  Moon } from
'lucide-react';
import { ADMIN_DASHBOARD_PATH } from '../../config/adminRoute.js';






export const Navbar = ({ currentPath, navigate }) => {
  const { member, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/assets/arx-logo-light.jpg');
  const [logoDarkUrl, setLogoDarkUrl] = useState('/assets/arx-logo-dark.jpg');
  const [clubName, setClubName] = useState('ARX IT CLUB OF SJS');
  const [registrationStatus, setRegistrationStatus] = useState('OPEN');
  // Q-06 FIX: Ref for outside-click detection on the user dropdown.
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function loadBrandSettings() {
      try {
        const res = await api.getPublicSettings();
        if (res.settings) {
          if (res.settings.compactLogoUrl || res.settings.logoUrl) {
            setLogoUrl(res.settings.compactLogoUrl || res.settings.logoUrl || '/assets/arx-logo-light.jpg');
            setLogoDarkUrl(res.settings.compactLogoDarkUrl || res.settings.logoDarkUrl || res.settings.compactLogoUrl || res.settings.logoUrl || '/assets/arx-logo-dark.jpg');
          }
          if (res.settings.clubName) setClubName(res.settings.clubName);
          if (res.settings.registrationStatus) setRegistrationStatus(res.settings.registrationStatus);
        }
      } catch {

        // Silently keep default branding
      }}
    loadBrandSettings();
  }, []);

  // Q-06 FIX: Close dropdown when clicking anywhere outside it.
  useEffect(() => {
    if (!userDropdownOpen) return;
    function handleOutsideClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [userDropdownOpen]);

  const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Courses', path: '/courses' },
  { label: 'Projects', path: '/projects' },
  { label: 'Events', path: '/events' },
  { label: 'Contact', path: '/contact' }];


  const handleNav = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const isActive = (path) => {
    if (path === '/' && currentPath === '/') return true;
    // Q-06 FIX: Only match if the path segment ends exactly or is followed by '/' —
    // prevents '/about' matching '/about-us', '/events' matching '/events-archive', etc.
    if (path !== '/' && (currentPath === path || currentPath.startsWith(path + '/'))) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F7EFE8]/95 dark:bg-[#071A14]/95 backdrop-blur-md border-b border-[#282828]/10 dark:border-[#25473C] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element Brand mark with restrained icon */}
          <button
            onClick={() => handleNav('/')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FC6454] dark:focus-visible:ring-[#6BB89E] rounded-sm">
            
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-transparent shrink-0">
              <img
                src={logoUrl || '/assets/arx-logo-light.jpg'}
                alt={`${clubName} Logo Light`}
                className="w-full h-full object-cover rounded-full dark:hidden"
                onError={(e) => {
                  e.currentTarget.src = '/assets/arx-logo-light.jpg';
                }} />
              <img
                src={logoDarkUrl || '/assets/arx-logo-dark.jpg'}
                alt={`${clubName} Logo Dark`}
                className="w-full h-full object-cover rounded-full hidden dark:block"
                onError={(e) => {
                  e.currentTarget.src = '/assets/arx-logo-dark.jpg';
                }} />
            </div>
            <span className="font-semibold text-base tracking-tight text-[#282828] dark:text-[#F1F7F4] font-sans">
              {clubName}
            </span>
          </button>

          {/* Zone 2: 4-6 clean text navigation links with subtle hover/active states */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`px-3 py-1.5 text-xs font-medium tracking-tight transition-colors duration-150 cursor-pointer rounded-md ${
                  active ?
                  'text-[#FC6454] dark:text-[#6BB89E] font-semibold bg-[#FC6454]/15 dark:bg-[#2F8068]/20' :
                  'text-[#282828]/80 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-[#F1F7F4] hover:bg-[#FC6454]/10 dark:hover:bg-[#102B22]'}`
                  }>
                  
                  {link.label}
                </button>);

            })}
          </nav>

          {/* Zone 3: 1-2 primary actions + theme switch + profile */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#FC6454] dark:hover:text-[#6BB89E] hover:bg-[#FC6454]/10 dark:hover:bg-[#102B22] border border-[#282828]/15 dark:border-[#25473C] transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle visual theme">
              
              {theme === 'dark' ?
              <Sun className="w-4 h-4 text-[#6BB89E]" /> :

              <Moon className="w-4 h-4 text-[#282828]" />
              }
            </button>

            {isAuthenticated && member ?
            <div className="relative" ref={dropdownRef}>
                <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-[#102B22] hover:bg-[#EFE6DE] dark:hover:bg-[#15362B] border border-[#282828]/15 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] transition-colors cursor-pointer">
                
                  <div className="w-5 h-5 rounded-sm bg-[#FC6454]/15 dark:bg-[#2F8068]/30 text-[#FC6454] dark:text-[#6BB89E] flex items-center justify-center text-[10px] font-mono font-bold">
                    {member.studentName ? member.studentName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-medium text-[#282828] dark:text-[#F1F7F4] leading-none">
                      {member.studentName.split(' ')[0]}
                    </p>
                    <p className="text-[10px] font-mono text-[#FC6454] dark:text-[#6BB89E] tracking-wider">
                      {member.memberId}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#282828]/50 dark:text-[#B7C9C2]/60 ml-0.5" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen &&
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-[#102B22] border border-[#282828]/15 dark:border-[#25473C] py-1.5 shadow-lg text-[#282828] dark:text-[#F1F7F4] z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3.5 py-2 border-b border-[#282828]/10 dark:border-[#25473C]">
                      <p className="text-xs font-semibold text-[#282828] dark:text-[#F1F7F4]">{member.studentName}</p>
                      <p className="text-[10px] font-mono text-[#FC6454] dark:text-[#6BB89E]">
                        {member.memberId} &bull; Class {member.class}
                      </p>
                    </div>
                    {member.role === 'admin' &&
                <button
                  onClick={() => handleNav(ADMIN_DASHBOARD_PATH)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#FC6454] dark:text-[#6BB89E] hover:bg-[#FC6454]/10 dark:hover:bg-[#15362B] text-left font-medium transition-colors cursor-pointer">
                  
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" />
                        Admin Operations
                      </button>
                }
                    <button
                  onClick={() => handleNav(member.role === 'admin' ? ADMIN_DASHBOARD_PATH : '/portal/dashboard')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs hover:bg-[#FC6454]/10 dark:hover:bg-[#15362B] text-left transition-colors cursor-pointer">
                  
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#282828]/50 dark:text-[#B7C9C2]/70" />
                      {member.role === 'admin' ? 'Control Console' : 'Member Dashboard'}
                    </button>
                    {member.role !== 'admin' &&
                <button
                  onClick={() => handleNav('/portal/profile')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs hover:bg-[#FC6454]/10 dark:hover:bg-[#15362B] text-left transition-colors cursor-pointer">
                  
                        <User className="w-3.5 h-3.5 text-[#282828]/50 dark:text-[#B7C9C2]/70" />
                        My Profile
                      </button>
                }
                    <div className="border-t border-[#282828]/10 dark:border-[#25473C] my-1" />
                    <button
                  onClick={() => {
                    logout();
                    handleNav('/');
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 dark:text-rose-400 hover:bg-red-500/10 dark:hover:bg-rose-950/30 text-left transition-colors cursor-pointer">
                  
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
              }
              </div> :

            <>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNav('/login')}>
                
                  Sign In
                </Button>
                <Button
                variant={registrationStatus === 'CLOSED' ? 'outline' : 'primary'}
                size="sm"
                onClick={() => handleNav('/register')}
                className={registrationStatus === 'CLOSED' ? 'border-amber-400 text-amber-700 dark:text-amber-300' : ''}>
                
                  {registrationStatus === 'CLOSED' ? 'Admissions Closed' : 'Join Club'}
                </Button>
              </>
            }
          </div>

          {/* Mobile Actions & Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-[#282828]/70 dark:text-[#B7C9C2] hover:bg-[#FC6454]/10 dark:hover:bg-[#102B22] border border-[#282828]/15 dark:border-[#25473C]"
              aria-label="Toggle visual theme">
              
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#6BB89E]" /> : <Moon className="w-4 h-4 text-[#282828]" />}
            </button>
            {isAuthenticated &&
            <button
              onClick={() => handleNav('/portal/dashboard')}
              className="px-2.5 py-1 rounded-md bg-white dark:bg-[#102B22] border border-[#282828]/15 dark:border-[#25473C] text-xs font-medium text-[#282828] dark:text-[#6BB89E]">
              
                Portal
              </button>
            }
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-[#282828]/70 dark:text-[#B7C9C2] hover:bg-[#FC6454]/10 dark:hover:bg-[#102B22] border border-[#282828]/15 dark:border-[#25473C] transition-colors"
              aria-label="Toggle navigation menu">
              
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen &&
      <div className="md:hidden border-t border-[#282828]/10 dark:border-[#25473C] bg-[#F7EFE8] dark:bg-[#071A14] px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                active ?
                'bg-[#FC6454]/15 dark:bg-[#2F8068]/20 text-[#FC6454] dark:text-[#6BB89E] font-semibold' :
                'text-[#282828]/80 dark:text-[#B7C9C2] hover:bg-[#FC6454]/10 dark:hover:bg-[#102B22]'}`
                }>
                
                  {link.label}
                </button>);

          })}
          </div>

          <div className="pt-3 border-t border-[#282828]/10 dark:border-[#25473C] space-y-2">
            {isAuthenticated && member ?
          <div className="space-y-2">
                <div className="px-3 py-2 bg-white dark:bg-[#102B22] rounded-md border border-[#282828]/15 dark:border-[#25473C]">
                  <p className="text-xs font-semibold text-[#282828] dark:text-[#F1F7F4]">{member.studentName}</p>
                  <p className="text-[10px] font-mono text-[#FC6454] dark:text-[#6BB89E]">
                    ID: {member.memberId} &bull; Class {member.class}
                  </p>
                </div>
                <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => handleNav('/portal/dashboard')}>
              
                  Member Dashboard
                </Button>
                <Button
              variant="outline"
              size="sm"
              className="w-full text-red-600 dark:text-rose-400"
              onClick={() => {
                logout();
                handleNav('/');
              }}>
              
                  Sign Out
                </Button>
              </div> :

          <div className="grid grid-cols-2 gap-2">
                <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => handleNav('/login')}>
              
                  Sign In
                </Button>
                <Button
              variant={registrationStatus === 'CLOSED' ? 'outline' : 'primary'}
              size="md"
              className="w-full"
              onClick={() => handleNav('/register')}>
              
                  {registrationStatus === 'CLOSED' ? 'Admissions Closed' : 'Join Club'}
                </Button>
              </div>
          }
          </div>
        </div>
      }
    </header>);

};