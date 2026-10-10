import React, { useState, useEffect } from 'react';
import {
  Send,
  Github,
  Youtube,
  Sparkles,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Globe,
  Share2,
  Bot } from
'lucide-react';
import { api } from '../../services/api.js';






export const Footer = ({ navigate }) => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [settings, setSettings] = useState({
    clubName: 'ARX IT CLUB OF SJS',
    tagline: 'Learn. Build. Grow.',
    footerText: 'Official ARX IT CLUB OF SJS. Empowering the next generation of builders.',
    telegramBotUsername: 'ARXITCLUB_bot',
    telegramBotUrl: 'https://t.me/ARXITCLUB_bot',
    telegramChannelUrl: 'https://t.me/arxitclub',
    telegramChannelName: '@arxitclub'
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, socialRes] = await Promise.all([
        api.getPublicSettings().catch(() => ({ settings: null })),
        api.getPublicSocialLinks().catch(() => ({ socialLinks: [] }))]
        );
        if (settingsRes?.settings) {
          setSettings(settingsRes.settings);
        }
        if (socialRes?.socialLinks && socialRes.socialLinks.length > 0) {
          setSocialLinks(socialRes.socialLinks);
        }
      } catch {

        // keep defaults
      }}
    loadData();
  }, []);

  const getPlatformIcon = (platform, iconKey) => {
    const key = (iconKey || platform || '').toLowerCase();
    if (key.includes('telegram') || key === 'send') return <Send className="w-4 h-4" />;
    if (key.includes('youtube')) return <Youtube className="w-4 h-4" />;
    if (key.includes('git')) return <Github className="w-4 h-4" />;
    if (key.includes('instagram')) return <Instagram className="w-4 h-4" />;
    if (key.includes('facebook')) return <Facebook className="w-4 h-4" />;
    if (key.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    if (key.includes('twitter') || key === 'x') return <Twitter className="w-4 h-4" />;
    if (key.includes('web') || key.includes('site') || key === 'globe') return <Globe className="w-4 h-4" />;
    return <Share2 className="w-4 h-4" />;
  };

  return (
    <footer className="bg-[#EFE6DE]/70 dark:bg-[#0A211A] text-[#282828]/75 dark:text-[#B7C9C2] border-t border-[#282828]/10 dark:border-[#25473C] mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer inline-flex group">
              
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-transparent shrink-0">
                <img
                  src={settings.logoUrl || '/assets/arx-logo-light.jpg'}
                  alt={`${settings.clubName || 'ARX IT CLUB OF SJS'} Official Logo Light`}
                  className="w-full h-full object-cover rounded-full dark:hidden"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/arx-logo-light.jpg';
                  }} />
                <img
                  src={settings.logoDarkUrl || settings.logoUrl || '/assets/arx-logo-dark.jpg'}
                  alt={`${settings.clubName || 'ARX IT CLUB OF SJS'} Official Logo Dark`}
                  className="w-full h-full object-cover rounded-full hidden dark:block"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/arx-logo-dark.jpg';
                  }} />
              </div>
              <span className="font-bold text-base tracking-tight text-[#282828] dark:text-[#F1F7F4] font-sans">
                {settings.clubName || 'ARX IT CLUB OF SJS'}
              </span>
            </div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#FC6454] dark:text-[#6BB89E]">
              &ldquo;{settings.tagline || 'Learn. Build. Grow.'}&rdquo;
            </p>
            <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] max-w-sm leading-relaxed">
              {settings.description ||
              'Empowering students with practical coding workshops, project mentorship, and verifiable technical skills.'}
            </p>

            {/* Social Media Links */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {socialLinks.length > 0 ?
              socialLinks.map((link) =>
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.name || link.platform}
                className="w-8 h-8 rounded-md bg-white dark:bg-[#102B22] hover:bg-[#FC6454]/15 dark:hover:bg-[#2F8068]/25 hover:text-[#FC6454] dark:hover:text-[#6BB89E] text-[#282828]/70 dark:text-[#B7C9C2] flex items-center justify-center border border-[#282828]/15 dark:border-[#25473C] transition-colors"
                aria-label={link.name || link.platform}>
                
                    {getPlatformIcon(link.platform, link.icon)}
                  </a>
              ) :

              <>
                  <a
                  href={settings.telegramChannelUrl || 'https://t.me/arxitclub'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-md bg-white dark:bg-[#102B22] hover:bg-[#FC6454]/15 dark:hover:bg-[#2F8068]/25 hover:text-[#FC6454] dark:hover:text-[#6BB89E] text-[#282828]/70 dark:text-[#B7C9C2] flex items-center justify-center border border-[#282828]/15 dark:border-[#25473C] transition-colors"
                  aria-label="Official Telegram Channel (@arxitclub)"
                  title="Official Telegram Channel (@arxitclub)">
                  
                    <Send className="w-3.5 h-3.5" />
                  </a>
                  <a
                  href={settings.telegramBotUrl || 'https://t.me/ARXITCLUB_bot'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-md bg-white dark:bg-[#102B22] hover:bg-[#FC6454]/15 dark:hover:bg-[#2F8068]/25 hover:text-[#FC6454] dark:hover:text-[#6BB89E] text-[#282828]/70 dark:text-[#B7C9C2] flex items-center justify-center border border-[#282828]/15 dark:border-[#25473C] transition-colors"
                  aria-label="Official Telegram Bot (@ARXITCLUB_bot)"
                  title="Official Telegram Bot (@ARXITCLUB_bot)">
                  
                    <Bot className="w-3.5 h-3.5" />
                  </a>
                  <a
                  href={settings.githubUrl || 'https://github.com/arx-itclub'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-md bg-white dark:bg-[#102B22] hover:bg-[#FC6454]/15 dark:hover:bg-[#2F8068]/25 hover:text-[#FC6454] dark:hover:text-[#6BB89E] text-[#282828]/70 dark:text-[#B7C9C2] flex items-center justify-center border border-[#282828]/15 dark:border-[#25473C] transition-colors"
                  aria-label="GitHub Organization">
                  
                    <Github className="w-3.5 h-3.5" />
                  </a>
                  <a
                  href={settings.youtubeUrl || 'https://youtube.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-md bg-white dark:bg-[#102B22] hover:bg-[#FC6454]/15 dark:hover:bg-[#2F8068]/25 hover:text-[#FC6454] dark:hover:text-[#6BB89E] text-[#282828]/70 dark:text-[#B7C9C2] flex items-center justify-center border border-[#282828]/15 dark:border-[#25473C] transition-colors"
                  aria-label="YouTube Channel">
                  
                    <Youtube className="w-3.5 h-3.5" />
                  </a>
                </>
              }
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#282828] dark:text-[#F1F7F4]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              {['Home', 'About', 'Courses', 'Projects', 'Events', 'Contact'].map((item) =>
              <li key={item}>
                  <button
                  onClick={() => navigate(item === 'Home' ? '/' : `/${item.toLowerCase()}`)}
                  className="text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#FC6454] dark:hover:text-[#6BB89E] transition-colors cursor-pointer">
                  
                    {item}
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Member Portal Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#282828] dark:text-[#F1F7F4]">
              Portal Access
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigate('/login')}
                  className="text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#FC6454] dark:hover:text-[#6BB89E] transition-colors cursor-pointer">
                  
                  Member Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/register')}
                  className="text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#FC6454] dark:hover:text-[#6BB89E] transition-colors cursor-pointer">
                  
                  Join Registration
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/portal/dashboard')}
                  className="text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#FC6454] dark:hover:text-[#6BB89E] transition-colors cursor-pointer">
                  
                  Portal Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/certificates')}
                  className="text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#FC6454] dark:hover:text-[#6BB89E] transition-colors cursor-pointer">
                  
                  Verify Certificates
                </button>
              </li>
            </ul>
          </div>

          {/* Community & Telegram channel banner */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#282828] dark:text-[#F1F7F4]">
              Channel Broadcast
            </h4>
            <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed">
              Official Telegram feed for school announcements, lab schedules, and workshop enrollments.
            </p>
            <a
              href={settings.telegramChannelUrl || 'https://t.me/arxitclub'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md bg-white dark:bg-[#102B22] text-[#282828] dark:text-[#6BB89E] border border-[#282828]/15 dark:border-[#25473C] hover:bg-[#FC6454]/10 dark:hover:bg-[#15362B] transition-colors">
              
              <Send className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" />
              <span>Join @arxitclub</span>
            </a>
            <div className="pt-1 text-[11px] text-[#282828]/60 dark:text-[#B7C9C2] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Official Student Technology Hub
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#282828]/10 dark:border-[#25473C] flex flex-col sm:flex-row items-center justify-between text-xs text-[#282828]/60 dark:text-[#7F9990] font-mono">
          <p>&copy; {new Date().getFullYear()} {settings.clubName || 'ARX IT CLUB OF SJS'}. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 text-[11px] text-[#282828]/50 dark:text-[#7F9990]">
            {settings.footerText || 'Empowering the next generation of builders.'}
          </p>
        </div>
      </div>
    </footer>);

};