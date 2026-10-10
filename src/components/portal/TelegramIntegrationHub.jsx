import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

import { Card } from '../common/Card.jsx';
import { Badge } from '../common/Badge.jsx';
import { Button } from '../common/Button.jsx';
import {
  Send,
  Bot,
  MessageSquare,
  Sparkles,
  Pin,
  Clock,
  Eye,
  CheckCircle2,
  Search,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Terminal,
  Zap } from
'lucide-react';






export const TelegramIntegrationHub = ({
  member,
  navigate
}) => {
  const [activeTab, setActiveTab] = useState('channel');
  const [broadcasts, setBroadcasts] = useState([]);
  const [channelInfo, setChannelInfo] = useState(





    {
      name: 'ARX IT CLUB OF SJS Official Channel',
      handle: '@arxitclub',
      url: 'https://t.me/arxitclub',
      verified: true,
      subscribersCount: 260
    });
  const [loading, setLoading] = useState(true);
  const [filterTag, setFilterTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);
  const [activationUrl, setActivationUrl] = useState('https://t.me/ARXITCLUB_bot');
  const [activationToken, setActivationToken] = useState('');
  const [botConfig, setBotConfig] = useState(



    {
      botUsername: 'ARXITCLUB_bot',
      botUrl: 'https://t.me/ARXITCLUB_bot',
      configured: true
    });

  const fetchBroadcasts = async () => {
    try {
      const res = await api.getTelegramBroadcasts();
      if (res.broadcasts) setBroadcasts(res.broadcasts);
      if (res.channelInfo) setChannelInfo(res.channelInfo);
    } catch (err) {
      console.error('Failed to fetch telegram broadcasts', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBotConfig = async () => {
    try {
      const res = await api.getTelegramConfig();
      if (res) {
        setBotConfig({
          botUsername: res.telegramBotUsername || 'ARXITCLUB_bot',
          botUrl: res.telegramBotUrl || 'https://t.me/ARXITCLUB_bot',
          configured: Boolean(res.botConfigured)
        });
        if (res.telegramChannelName) {
          setChannelInfo((prev) => ({
            ...prev,
            handle: res.telegramChannelName,
            url: res.telegramChannelUrl || prev.url
          }));
        }
      }
    } catch (err) {
      console.warn('Could not fetch telegram config:', err);
    }
  };

  const fetchActivationSession = async () => {
    if (member && !member.telegramActivated) {
      try {
        const res = await api.createActivationToken();
        if (res.activationUrl) {
          setActivationUrl(res.activationUrl);
        }
        if (res.activationToken) {
          setActivationToken(res.activationToken);
        }
      } catch (err) {
        console.warn('Could not load activation token', err);
      }
    }
  };

  useEffect(() => {
    fetchBroadcasts();
    fetchBotConfig();
    fetchActivationSession();
  }, [member?.id, member?.telegramActivated]);

  const handleCopyActivationToken = () => {
    if (activationToken) {
      navigator.clipboard.writeText(activationToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleReact = async (id, emoji) => {
    try {
      const res = await api.reactToTelegramBroadcast(id, emoji);
      if (res.success && res.reactions) {
        setBroadcasts((prev) =>
        prev.map((b) => b.id === id ? { ...b, reactions: res.reactions } : b)
        );
      }
    } catch (err) {
      console.error('Failed to react to broadcast', err);
    }
  };

  const allTags = ['all', '#announcements', '#workshops', '#lab', '#certificates'];

  const filteredBroadcasts = broadcasts.filter((b) => {
    if (filterTag !== 'all' && !b.tags.includes(filterTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.content.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    }
    return true;
  });

  const botCommands = [
  { cmd: '/status', desc: 'Inspect your active membership ID, class, role, and course enrollments' },
  { cmd: '/courses', desc: 'Browse available technical curriculum and active workshop tracks' },
  { cmd: '/events', desc: 'View upcoming tech talks and hands-on lab sessions scheduled in Lab 3' },
  { cmd: '/certificates', desc: 'List your verified landscape certificates and credential IDs' },
  { cmd: '/attendance', desc: 'Check your total sessions attended and credential eligibility percentage' },
  { cmd: '/announcements', desc: 'Read latest club broadcasts and urgent campus notices' },
  { cmd: '/lab', desc: 'Get Computer Lab 3 opening hours, location details, and rules' },
  { cmd: '/contact', desc: 'Direct support contact information and academic leadership contacts' }];


  return (
    <div className="border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] text-[#282828] dark:text-[#F1F7F4] overflow-hidden rounded-xl shadow-xs transition-colors duration-200">
      {/* Header with Telegram Channel Info */}
      <div className="p-4 sm:p-5 bg-[#FAF4EE] dark:bg-[#0A211A] border-b border-[#282828]/10 dark:border-[#25473C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-white dark:bg-[#15362B] border border-[#282828]/15 dark:border-[#25473C] text-[#FC6454] dark:text-[#6BB89E] flex items-center justify-center">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight">
                {channelInfo.name}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-sm bg-[#FC6454]/10 dark:bg-[#2F8068]/30 text-[#FC6454] dark:text-[#6BB89E] border border-[#FC6454]/25 dark:border-[#25473C] uppercase">
                <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#282828]/60 dark:text-[#B7C9C2] mt-0.5">
              <a
                href={channelInfo.url}
                target="_blank"
                rel="noreferrer"
                className="text-[#FC6454] dark:text-[#6BB89E] font-medium hover:underline flex items-center gap-1">
                
                <span>{channelInfo.handle}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span>·</span>
              <span>{channelInfo.subscribersCount} Connected</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#EFE6DE]/70 dark:bg-[#071A14] p-1 rounded-lg border border-[#282828]/10 dark:border-[#25473C] self-start sm:self-auto gap-1">
          <button
            onClick={() => setActiveTab('channel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'channel' ?
            'bg-white dark:bg-[#15362B] text-[#282828] dark:text-[#F1F7F4] shadow-xs font-semibold' :
            'text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-[#F1F7F4]'}`
            }>
            
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Channel Feed</span>
          </button>
          <button
            onClick={() => setActiveTab('bot')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'bot' ?
            'bg-white dark:bg-[#15362B] text-[#282828] dark:text-[#F1F7F4] shadow-xs font-semibold' :
            'text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-[#F1F7F4]'}`
            }>
            
            <Bot className="w-3.5 h-3.5" />
            <span>Official Bot Hub</span>
          </button>
        </div>
      </div>

      {/* CONTENT TAB 1: CHANNEL BROADCAST FEED */}
      {activeTab === 'channel' &&
      <div className="p-4 sm:p-5 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#282828]/10 dark:border-[#25473C]">
            <div className="flex flex-wrap items-center gap-1">
              {allTags.map((tag) =>
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer border ${
              filterTag === tag ?
              'bg-[#FC6454] dark:bg-[#2F8068] text-white dark:text-[#F1F7F4] border-[#FC6454] dark:border-[#2F8068] font-bold' :
              'bg-[#FAF4EE] dark:bg-[#15362B] text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-[#F1F7F4] border-[#282828]/15 dark:border-[#25473C]'}`
              }>
              
                  {tag === 'all' ? 'All Updates' : tag}
                </button>
            )}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#282828]/40 dark:text-[#7F9990]" />
              <input
              type="text"
              placeholder="Filter broadcasts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 rounded-md bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#294B40] text-xs text-[#282828] dark:text-[#F1F7F4] focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30" />
            
            </div>
          </div>

          {/* Posts List */}
          {loading ?
        <div className="py-12 text-center text-xs font-mono text-[#282828]/40 dark:text-[#7F9990]">
              Loading Telegram broadcasts...
            </div> :
        filteredBroadcasts.length === 0 ?
        <div className="py-12 text-center text-[#282828]/50 dark:text-[#7F9990] space-y-1">
              <p className="text-xs">No broadcasts matching filter</p>
            </div> :

        <div className="space-y-3">
              {filteredBroadcasts.map((post) =>
          <div
            key={post.id}
            className={`p-4 rounded-lg bg-[#FAF4EE]/70 dark:bg-[#0A211A] border transition-all ${
            post.pinned ?
            'border-[#FC6454]/50 dark:border-[#6BB89E]/50' :
            'border-[#282828]/10 dark:border-[#25473C] hover:border-[#FC6454]/40 dark:hover:border-[#366656]'}`
            }>
            
                  {/* Post Top Meta */}
                  <div className="flex items-center justify-between text-xs text-[#282828]/60 dark:text-[#B7C9C2] pb-2 mb-2 border-b border-[#282828]/10 dark:border-[#25473C]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#282828] dark:text-[#F1F7F4] flex items-center gap-1.5 text-xs">
                        <Send className="w-3 h-3 text-[#FC6454] dark:text-[#6BB89E]" />
                        {post.author}
                      </span>
                      {post.pinned &&
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#FC6454] dark:text-[#6BB89E] bg-[#FC6454]/10 dark:bg-[#2F8068]/30 px-1.5 py-0.5 rounded-sm border border-[#FC6454]/30 dark:border-[#25473C] uppercase">
                          <Pin className="w-2.5 h-2.5" /> PINNED
                        </span>
                }
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#282828]/50 dark:text-[#7F9990] font-mono">
                      <span>{post.date}</span>
                      <span>{post.time}</span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="text-xs sm:text-sm text-[#282828]/80 dark:text-[#F1F7F4]/90 whitespace-pre-line leading-relaxed font-sans">
                    {post.content}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2.5">
                    {post.tags.map((t) =>
              <span
                key={t}
                className="text-[11px] font-mono text-[#FC6454] dark:text-[#6BB89E] bg-white dark:bg-[#15362B] px-1.5 py-0.5 rounded-sm border border-[#282828]/10 dark:border-[#25473C]">
                
                        {t}
                      </span>
              )}
                  </div>

                  {/* Post Footer / Live Reactions & Views */}
                  <div className="pt-2.5 mt-2.5 border-t border-[#282828]/10 dark:border-[#25473C] flex flex-wrap items-center justify-between gap-3">
                    {/* Reactions Bar */}
                    <div className="flex items-center gap-1">
                      {['🔥', '🚀', '💡', '❤️', '👍'].map((emoji) => {
                  const existing = post.reactions.find((r) => r.emoji === emoji);
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReact(post.id, emoji)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-[#15362B] hover:bg-[#EFE6DE] dark:hover:bg-[#1e4839] border border-[#282828]/10 dark:border-[#25473C] text-xs transition-colors cursor-pointer"
                      title={`React with ${emoji}`}>
                      
                            <span>{emoji}</span>
                            <span className="text-[10px] font-mono text-[#282828]/70 dark:text-[#B7C9C2]">
                              {existing ? existing.count : 0}
                            </span>
                          </button>);

                })}
                    </div>

                    {/* View counter */}
                    <div className="flex items-center gap-1 text-[11px] text-[#282828]/50 dark:text-[#7F9990] font-mono">
                      <Eye className="w-3 h-3" />
                      <span>{post.views} views</span>
                    </div>
                  </div>
                </div>
          )}
            </div>
        }
        </div>
      }

      {/* CONTENT TAB 2: REAL TELEGRAM BOT HUB & DEEP-LINK CENTER */}
      {activeTab === 'bot' &&
      <div className="p-4 sm:p-5 space-y-5">
          {/* Real Telegram Bot Identity Card */}
          <div className="p-4 rounded-xl bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#FC6454] to-[#f87f73] dark:from-[#2F8068] dark:to-[#4bb896] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm sm:text-base text-[#282828] dark:text-[#F1F7F4]">
                    ARX Official Telegram Bot
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-[#58B889] bg-emerald-50 dark:bg-[#102B22] px-2 py-0.5 rounded-sm border border-emerald-200 dark:border-[#25473C] uppercase font-semibold">
                    ONLINE
                  </span>
                </div>
                <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] mt-0.5 font-mono">
                  Official Handle: <strong className="text-[#FC6454] dark:text-[#6BB89E]">@{botConfig.botUsername}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
              href={member?.telegramActivated ? botConfig.botUrl : activationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FC6454] hover:bg-[#e85444] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer">
              
                <Bot className="w-4 h-4" />
                <span>{member?.telegramActivated ? 'Launch Bot in Telegram' : 'Activate in Telegram'}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
              <a
              href={channelInfo.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-[#15362B] border border-[#282828]/15 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] hover:bg-[#EFE6DE] dark:hover:bg-[#1e4839] text-xs font-medium transition-colors cursor-pointer">
              
                <Send className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" />
                <span>Join Channel</span>
              </a>
            </div>
          </div>

          {/* Member Telegram Account Status */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#15362B] border border-[#282828]/10 dark:border-[#25473C]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#282828]/10 dark:border-[#25473C]">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#282828]/50 dark:text-[#7F9990]">
                  Your Telegram Account Status
                </p>
                <h5 className="text-sm font-bold text-[#282828] dark:text-[#F1F7F4] mt-0.5">
                  {member?.studentName} · <span className="font-mono text-xs">{member?.memberId}</span>
                </h5>
              </div>

              {member?.telegramActivated ?
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-[#0A211A] border border-emerald-200 dark:border-[#25473C] text-emerald-800 dark:text-[#58B889] text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#4ADE80]" />
                  <span>Account Linked ({member.telegramUsername || `@user_${member.telegramUserId}`})</span>
                </div> :

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-[#20180B] border border-amber-200 dark:border-[#4D3B1C] text-amber-800 dark:text-amber-300 text-xs font-semibold">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Pending Telegram Connection</span>
                </div>
            }
            </div>

            {!member?.telegramActivated &&
          <div className="mt-3.5 pt-1 space-y-3">
                <p className="text-xs text-[#282828]/75 dark:text-[#B7C9C2] leading-relaxed">
                  To receive automated lab notifications, verified landscape credentials, and access to the interactive curriculum menu, activate your Telegram account using the secure one-click link below:
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-lg bg-[#FAF4EE] dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#294B40] font-mono text-xs text-[#282828] dark:text-[#F1F7F4] truncate select-all">
                    {activationUrl}
                  </div>
                  {activationToken &&
              <button
                onClick={handleCopyActivationToken}
                className="px-3.5 py-2 rounded-lg bg-white dark:bg-[#102B22] border border-[#282828]/15 dark:border-[#25473C] text-xs font-medium text-[#282828] dark:text-[#F1F7F4] hover:bg-[#EFE6DE] dark:hover:bg-[#15362B] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
                
                      {copiedToken ?
                <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#4ADE80]" />
                          <span className="text-emerald-700 dark:text-[#4ADE80]">Copied!</span>
                        </> :

                <>
                          <Copy className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" />
                          <span>Copy Token</span>
                        </>
                }
                    </button>
              }
                  <a
                href={activationUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-[#FC6454] hover:bg-[#e85444] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
                
                    <span>Connect in Telegram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-3 rounded-lg bg-[#FAF4EE]/70 dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] text-xs space-y-1.5 text-[#282828]/70 dark:text-[#B7C9C2]">
                  <p className="font-semibold text-[#282828] dark:text-[#F1F7F4] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" /> How connection works:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] leading-relaxed">
                    <li>Click <strong>Connect in Telegram</strong> to open <strong>@{botConfig.botUsername}</strong> on your phone or desktop.</li>
                    <li>Press the <strong>Start</strong> button in the Telegram chat to complete authorization.</li>
                    <li>Join the official <strong>{channelInfo.handle}</strong> channel to receive broadcast notices.</li>
                  </ol>
                </div>
              </div>
          }
          </div>

          {/* Bot Command Directory */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold font-mono uppercase tracking-wider text-[#282828] dark:text-[#F1F7F4]">
                  Official Telegram Commands Directory
                </h5>
                <p className="text-[11px] text-[#282828]/60 dark:text-[#B7C9C2]">
                  These commands can be sent directly to @{botConfig.botUsername} inside Telegram:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {botCommands.map((item) =>
            <div
              key={item.cmd}
              className="p-3 rounded-lg bg-[#FAF4EE]/60 dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] flex items-start justify-between gap-3 hover:border-[#FC6454]/40 dark:hover:border-[#366656] transition-colors">
              
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-[#FC6454] dark:text-[#6BB89E] bg-white dark:bg-[#15362B] px-1.5 py-0.5 rounded-sm border border-[#282828]/10 dark:border-[#25473C]">
                      {item.cmd}
                    </span>
                    <p className="text-xs text-[#282828]/75 dark:text-[#B7C9C2] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <a
                href={`https://t.me/${botConfig.botUsername}?start=${item.cmd.replace('/', '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-md bg-white dark:bg-[#15362B] border border-[#282828]/10 dark:border-[#25473C] text-[#282828]/60 dark:text-[#B7C9C2] hover:text-[#FC6454] dark:hover:text-[#6BB89E] transition-colors cursor-pointer shrink-0"
                title={`Send ${item.cmd} to bot in Telegram`}>
                
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
            )}
            </div>
          </div>
        </div>
      }
    </div>);

};