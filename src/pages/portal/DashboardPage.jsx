import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { api } from '../../services/api.js';

import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { TelegramIntegrationHub } from '../../components/portal/TelegramIntegrationHub.jsx';
import {
  BookOpen,
  GraduationCap,
  Award,
  Trophy,
  Copy,
  Clock,
  ArrowRight,
  FolderGit2,
  Calendar,
  Download,
  Code,
  Send,
  Bell,
  Check,
  CheckCircle2,
  FileText,
  Sun,
  Moon,
  Sparkles,
  CheckSquare,
  UserCheck,
  AlertTriangle,
  ShieldCheck } from
'lucide-react';






export const DashboardPage = ({ navigate }) => {
  const { member } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    certificatesCount: 0,
    awardsCount: 0
  });
  const [activities, setActivities] = useState([]);
  const [resources, setResources] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [activationUrl, setActivationUrl] = useState('https://t.me/ARXITCLUB_bot');
  const [resourceNotice, setResourceNotice] = useState(null);

  // Real Attendance & Assignments Data
  const [attendance, setAttendance] = useState(









    null);
  const [assignments, setAssignments] = useState(



    null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [dashRes, resRes, annRes, projRes, evtRes] = await Promise.all([
        api.getDashboardSummary().catch(() => ({ stats: null, recentActivities: [], attendance: null, assignments: null })),
        api.getClubResources().catch(() => ({ resources: [] })),
        api.getAnnouncements().catch(() => ({ announcements: [] })),
        api.getProjects().catch(() => ({ projects: [] })),
        api.getEvents('Upcoming').catch(() => ({ events: [] }))]
        );

        if (dashRes.stats) setStats(dashRes.stats);
        if (dashRes.recentActivities) setActivities(dashRes.recentActivities);
        if (dashRes.attendance) setAttendance(dashRes.attendance);
        if (dashRes.assignments) setAssignments(dashRes.assignments);
        if (resRes.resources) setResources(resRes.resources);
        if (annRes.announcements) setAnnouncements(annRes.announcements);
        if (projRes.projects) setProjects(projRes.projects.slice(0, 3));
        if (evtRes.events) setUpcomingEvents(evtRes.events.slice(0, 2));

        if (!member?.telegramActivated) {
          api.getMyActivation().
          then((act) => {
            if (act?.activationUrl) {
              setActivationUrl(act.activationUrl);
            }
          }).
          catch(() => {});
        }
      } catch (err) {
        console.error('Failed to load member dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [member?.telegramActivated]);

  const handleCheckIn = async () => {
    if (!member?.memberId) return;
    setCheckingIn(true);
    setCheckInMessage(null);
    try {
      const res = await api.checkInAttendance(member.memberId);
      if (res.success) {
        setCheckInMessage({ type: 'success', text: res.message || 'Check-in recorded successfully!' });
        const updated = await api.getDashboardSummary();
        if (updated.attendance) setAttendance(updated.attendance);
        if (updated.stats) setStats(updated.stats);
      } else {
        setCheckInMessage({ type: 'error', text: res.message || 'Check-in failed.' });
      }
    } catch (err) {
      setCheckInMessage({ type: 'error', text: err?.message || 'Failed to submit attendance.' });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCopyId = () => {
    if (member?.memberId) {
      navigator.clipboard.writeText(member.memberId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleAccessResource = (res) => {
    setResourceNotice(`Accessing "${res.title}". Document kit available in Computer Lab 3 repository.`);
    setTimeout(() => setResourceNotice(null), 4000);
  };

  const firstName = member?.studentName?.split(' ')[0] || 'Member';

  return (
    <div className="space-y-8">
      {/* 0. WORKSPACE HEADER & CONTEXT BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282828]/10 dark:border-[#25473C] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#282828]/60 dark:text-[#B7C9C2]">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-[#FC6454] dark:text-[#6BB89E] font-medium">Dashboard</span>
            <span>/</span>
            <span>Overview</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight mt-1 font-sans">
            Student Operations Desk
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md bg-[#EFE6DE]/60 dark:bg-[#15362B] text-[#282828]/70 dark:text-[#B7C9C2] border border-[#282828]/10 dark:border-[#25473C]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Lab 3 · Spring 2026
          </span>

          {/* Quick theme switch in portal header */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#282828]/15 dark:border-[#25473C] bg-white dark:bg-[#102B22] hover:bg-[#EFE6DE] dark:hover:bg-[#15362B] text-xs font-medium text-[#282828] dark:text-[#F1F7F4] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}>
            
            {theme === 'dark' ?
            <>
                <Sun className="w-3.5 h-3.5 text-[#6BB89E]" />
                <span>Light</span>
              </> :

            <>
                <Moon className="w-3.5 h-3.5 text-[#282828]" />
                <span>Dark</span>
              </>
            }
          </button>
        </div>
      </div>

      {/* 1. MEMBER IDENTITY HEADER: Who am I? */}
      <div className="rounded-xl border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs transition-colors duration-200">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight">
              Welcome back, {firstName}
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm bg-emerald-50 dark:bg-[#15362B] text-emerald-700 dark:text-[#58B889] border border-emerald-200 dark:border-[#25473C] font-medium">
              STATUS · ACTIVE
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs font-mono text-[#282828]/70 dark:text-[#B7C9C2]">
            {/* Member ID with 1-click copy */}
            <div className="flex items-center gap-1.5 bg-[#EFE6DE]/60 dark:bg-[#0A211A] px-2.5 py-1 rounded-md border border-[#282828]/10 dark:border-[#25473C]">
              <span className="text-[#282828]/50 dark:text-[#7F9990]">ID:</span>
              <strong className="text-[#FC6454] dark:text-[#6BB89E] font-bold">{member?.memberId || 'TI-2026-001'}</strong>
              <button
                onClick={handleCopyId}
                className="ml-1 text-[#282828]/50 hover:text-[#FC6454] dark:hover:text-[#6BB89E] transition-colors cursor-pointer"
                title="Copy Member ID">
                
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <span className="text-[#282828]/30 dark:text-[#25473C] hidden sm:inline">·</span>
            <div>
              <span className="text-[#282828]/50 dark:text-[#7F9990]">CLASS:</span>{' '}
              <strong className="text-[#282828] dark:text-[#F1F7F4]">{member?.class || '—'}</strong>
            </div>

            <span className="text-[#282828]/30 dark:text-[#25473C] hidden sm:inline">·</span>
            <div className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" />
              {member?.telegramActivated && member?.telegramUserId ?
              <span className="text-emerald-700 dark:text-[#58B889] font-medium">
                  Telegram Linked
                </span> :

              <a
                href={activationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FC6454] dark:text-[#6BB89E] hover:underline flex items-center gap-1 font-medium">
                
                  <span>Link Telegram Bot</span>
                </a>
              }
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/portal/courses')}>
            
            My Courses
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/portal/certificates')}>
            
            Certificates
          </Button>
        </div>
      </div>

      {/* Resource Action Notice Toast */}
      {resourceNotice &&
      <div className="p-3.5 bg-[#FC6454]/10 dark:bg-[#2F8068]/20 border border-[#FC6454]/30 dark:border-[#2F8068] rounded-md text-xs text-[#FC6454] dark:text-[#6BB89E] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E] shrink-0" />
          <span>{resourceNotice}</span>
        </div>
      }

      {/* PENDING TELEGRAM CALLOUT (Attention state) */}
      {!member?.telegramActivated &&
      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Send className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                Action Required · Complete Telegram Activation
              </h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                Link your account to <strong className="font-mono">@ARXITCLUB_bot</strong> to receive instant credentials, lab notifications, and join our broadcast channel.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
            href={activationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-md transition-colors">
            
              <Send className="w-3.5 h-3.5" />
              <span>Link Account</span>
            </a>
          </div>
        </div>
      }

      {/* 2. PROGRESS METRICS (Refined deep green surfaces in dark mode, crisp surfaces in light mode) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#15362B] space-y-1 shadow-xs transition-colors">
          <span className="text-xs font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#B7C9C2]">
            Enrolled Courses
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#282828] dark:text-[#F1F7F4] font-mono tabular-nums">
            {stats.totalCourses}
          </p>
          <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990]">Active learning tracks</p>
        </div>

        <div className="p-5 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#15362B] space-y-1 shadow-xs transition-colors">
          <span className="text-xs font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#B7C9C2]">
            Completed Tracks
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-[#58B889] font-mono tabular-nums">
            {stats.completedCourses}
          </p>
          <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990]">Finished curriculums</p>
        </div>

        <div className="p-5 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#15362B] space-y-1 shadow-xs transition-colors">
          <span className="text-xs font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#B7C9C2]">
            Verified Certificates
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#FC6454] dark:text-[#6BB89E] font-mono tabular-nums">
            {stats.certificatesCount}
          </p>
          <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990]">Issued credentials</p>
        </div>

        <div className="p-5 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#15362B] space-y-1 shadow-xs transition-colors">
          <span className="text-xs font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#B7C9C2]">
            Honors &amp; Awards
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#282828] dark:text-[#F1F7F4] font-mono tabular-nums">
            {stats.awardsCount}
          </p>
          <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990]">Competition records</p>
        </div>
      </div>

      {/* 2.5 REAL ATTENDANCE & LAB OPERATIONS SECTION */}
      <section id="attendance" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#282828]/10 dark:border-[#25473C] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
            <h2 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono">
              Computer Lab 3 Attendance &amp; Eligibility
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {attendance &&
            <Badge
              variant={attendance.isCertificateEligible ? 'emerald' : 'amber'}
              size="sm">
              
                {attendance.isCertificateEligible ? 'Eligible for Certificate (>=80%)' : 'Requires >=80% Attendance'}
              </Badge>
            }
          </div>
        </div>

        {/* Attendance Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#282828]/60 dark:text-[#7F9990] block">
              Attendance Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#FC6454] dark:text-[#6BB89E]">
                {attendance?.attendancePercentage ?? 100}%
              </span>
              <span className="text-[11px] text-[#282828]/50 dark:text-[#7F9990] font-mono">
                ({attendance?.totalSessions || 0} sessions)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#282828]/60 dark:text-[#7F9990] block">
              Present
            </span>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-[#58B889]">
              {attendance?.presentCount || 0}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#282828]/60 dark:text-[#7F9990] block">
              Late Check-ins
            </span>
            <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {attendance?.lateCount || 0}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#282828]/60 dark:text-[#7F9990] block">
              Absences
            </span>
            <p className="text-2xl font-bold font-mono text-[#282828]/60 dark:text-[#7F9990]">
              {attendance?.absentCount || 0}
            </p>
          </div>
        </div>

        {/* Lab Check-in Desk & Active Window */}
        <div className="p-5 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${attendance?.activeWindow ? 'bg-emerald-500 animate-pulse' : 'bg-[#282828]/30 dark:bg-[#25473C]'}`} />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#282828] dark:text-[#F1F7F4]">
                {attendance?.activeWindow ? `Lab Session Active: ${attendance.activeWindow.name}` : 'Next Scheduled Session: Computer Lab 3'}
              </h3>
            </div>
            <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2]">
              {attendance?.activeWindow ?
              <span>Window: {attendance.activeWindow.startTime} – {attendance.activeWindow.endTime}. Present status within {attendance.activeWindow.presentUntilMinutes}m.</span> :

              <span>Afternoon Session: 1:00 PM – 2:00 PM | Evening Session: 6:00 PM – 7:00 PM.</span>
              }
            </p>
            {attendance?.todayRecord &&
            <p className="text-xs font-mono text-emerald-700 dark:text-[#58B889] pt-1">
                ✓ Recorded today: <strong>{attendance.todayRecord.status}</strong> at {attendance.todayRecord.time} ({attendance.todayRecord.sessionName})
              </p>
            }
            {checkInMessage &&
            <p className={`text-xs font-mono pt-1 ${checkInMessage.type === 'success' ? 'text-emerald-600 dark:text-[#58B889]' : 'text-rose-600 dark:text-rose-400'}`}>
                {checkInMessage.text}
              </p>
            }
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {attendance?.todayRecord ?
            <Badge variant="emerald" size="md">
                <Check className="w-3.5 h-3.5 mr-1" />
                Checked In Today
              </Badge> :
            attendance?.activeWindow ?
            <Button
              variant="primary"
              size="md"
              loading={checkingIn}
              onClick={handleCheckIn}
              className="font-mono text-xs">
              
                <UserCheck className="w-4 h-4 mr-1.5" />
                Check In for Today's Lab
              </Button> :

            <Button
              variant="outline"
              size="md"
              disabled
              className="font-mono text-xs opacity-60 cursor-not-allowed">
              
                Window Closed
              </Button>
            }
          </div>
        </div>

        {/* Recent Attendance Records History */}
        <div className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#282828]/10 dark:border-[#25473C] flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#282828] dark:text-[#F1F7F4]">
              Recent Attendance History
            </h4>
            <span className="text-[11px] font-mono text-[#282828]/50 dark:text-[#7F9990]">
              Authority: Computer Lab 3
            </span>
          </div>

          {!attendance?.records || attendance.records.length === 0 ?
          <div className="p-8 text-center text-xs text-[#282828]/50 dark:text-[#7F9990] font-mono">
              No attendance records recorded yet. Attend scheduled lab workshops to build your record.
            </div> :

          <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#282828]/10 dark:border-[#25473C] bg-[#FAF4EE]/60 dark:bg-[#0A211A] text-[11px] font-mono text-[#282828]/60 dark:text-[#7F9990]">
                    <th className="px-5 py-2.5">Date</th>
                    <th className="px-5 py-2.5">Session</th>
                    <th className="px-5 py-2.5">Check-In Time</th>
                    <th className="px-5 py-2.5">Status</th>
                    <th className="px-5 py-2.5 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282828]/10 dark:divide-[#25473C]">
                  {attendance.records.slice(0, 5).map((rec) =>
                <tr key={rec.id} className="hover:bg-[#FAF4EE]/40 dark:hover:bg-[#15362B]/50 transition-colors">
                      <td className="px-5 py-3 font-mono text-[#282828] dark:text-[#F1F7F4]">{rec.date}</td>
                      <td className="px-5 py-3 text-[#282828] dark:text-[#F1F7F4]">{rec.sessionName}</td>
                      <td className="px-5 py-3 font-mono text-[#282828]/70 dark:text-[#B7C9C2]">{rec.time}</td>
                      <td className="px-5 py-3">
                        <Badge
                      variant={rec.status === 'Present' ? 'emerald' : rec.status === 'Late' ? 'amber' : 'rose'}
                      size="sm">
                      
                          {rec.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-[11px] text-[#282828]/50 dark:text-[#7F9990]">
                        {rec.verifiedBy === 'self-service' ? 'Student Self-Service' : 'Faculty Admin'}
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          }
        </div>
      </section>

      {/* 2.6 ASSIGNMENTS & CURRICULUM TASKS */}
      {assignments &&
      <section id="assignments" className="p-5 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#282828] dark:text-[#F1F7F4]">
                Curriculum Assignments
              </h3>
            </div>
            <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2]">
              Track your hands-on coding assignments, practical lab deliverables, and milestone grades.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-[#EFE6DE] dark:bg-[#15362B] text-[#282828] dark:text-[#F1F7F4]">
                Total: <strong>{assignments.total}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                Pending: <strong>{assignments.pending}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-[#58B889] border border-emerald-200 dark:border-emerald-800/60">
                Submitted: <strong>{assignments.submitted}</strong>
              </span>
            </div>
            <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/portal/courses')}
            className="font-mono text-xs">
            
              Browse Tasks &rarr;
            </Button>
          </div>
        </section>
      }

      {/* 3. ANNOUNCEMENTS / ATTENTION FEED */}
      {announcements.length > 0 &&
      <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[#282828]/10 dark:border-[#25473C] pb-2">
            <Bell className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
            <h2 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono">
              Club Announcements
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) =>
          <div
            key={ann.id}
            className="p-5 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] space-y-2 transition-colors">
            
                <div className="flex items-center justify-between text-xs">
                  <Badge
                variant={ann.priority === 'urgent' ? 'rose' : ann.priority === 'important' ? 'amber' : 'blue'}
                size="sm">
                
                    {ann.priority}
                  </Badge>
                  <span className="text-[#282828]/50 dark:text-[#7F9990] font-mono text-[11px]">{ann.publishedDate}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4]">{ann.title}</h3>
                <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>
              </div>
          )}
          </div>
        </section>
      }

      {/* 4. INTEGRATED TELEGRAM HUB */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#282828]/10 dark:border-[#25473C] pb-2">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
            <h2 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono">
              Telegram Broadcast &amp; Assistant
            </h2>
          </div>
          <span className="text-xs font-mono text-[#282828]/50 dark:text-[#7F9990]">Live Integration</span>
        </div>

        <TelegramIntegrationHub member={member} navigate={navigate} />
      </section>

      {/* 5. LAB RESOURCES & TOOLS */}
      <section id="resources" className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#282828]/10 dark:border-[#25473C] pb-2">
          <div>
            <h2 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono flex items-center gap-2">
              <Code className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
              Technical Resources &amp; Lab Kits
            </h2>
          </div>
          <span className="text-xs text-[#282828]/50 dark:text-[#7F9990] font-mono">Lab 3 Shared Repos</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((res) =>
          <div
            key={res.id}
            className="p-5 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] flex flex-col justify-between space-y-4 hover:border-[#FC6454]/40 dark:hover:border-[#366656] transition-colors">
            
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-xs font-medium text-[#FC6454] dark:text-[#6BB89E]">{res.category}</span>
                  <span className="font-mono text-[#282828]/50 dark:text-[#7F9990] text-[11px]">{res.format} · {res.fileSize}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4]">{res.title}</h3>
                <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed">{res.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {res.tags.map((t) =>
                <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-[#EFE6DE] dark:bg-[#15362B] text-[#282828] dark:text-[#F1F7F4] border border-[#282828]/10 dark:border-[#25473C]">
                      {t}
                    </span>
                )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#282828]/10 dark:border-[#25473C] flex items-center justify-between text-xs font-mono">
                <span className="text-[#282828]/50 dark:text-[#7F9990]">{res.version}</span>
                <button
                onClick={() => handleAccessResource(res)}
                className="inline-flex items-center gap-1.5 text-[#FC6454] dark:text-[#6BB89E] hover:underline font-medium cursor-pointer">
                
                  <Download className="w-3.5 h-3.5" />
                  <span>Access Resource</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. PROJECTS & UPCOMING ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#282828]/10 dark:border-[#25473C] pb-2">
            <h3 className="text-xs font-semibold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
              Club Repositories
            </h3>
            <button
              onClick={() => navigate('/portal/projects')}
              className="text-xs font-medium text-[#282828]/60 hover:text-[#282828] dark:text-[#B7C9C2] dark:hover:text-[#6BB89E] transition-colors">
              
              Browse All &rarr;
            </button>
          </div>

          {projects.length === 0 ?
          <div className="p-6 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-[#FAF4EE] dark:bg-[#102B22] text-center text-xs text-[#282828]/50 dark:text-[#7F9990]">
              No projects published yet. Team up with fellow members to create one.
            </div> :

          <div className="space-y-2.5">
              {projects.map((p) =>
            <div
              key={p.id}
              className="p-3.5 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] flex items-center justify-between gap-3">
              
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-[#282828] dark:text-[#F1F7F4] truncate">{p.title}</h4>
                    <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990] truncate mt-0.5 font-mono">
                      {p.category} · {Array.isArray(p.projectMembers) ? p.projectMembers.join(', ') : (p.projectMembers || 'IT Club Team')}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-[#EFE6DE] dark:bg-[#15362B] text-[#282828] dark:text-[#B7C9C2] border border-[#282828]/10 dark:border-[#25473C]">
                    {p.status}
                  </span>
                </div>
            )}
            </div>
          }
        </div>

        {/* Upcoming Activities Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#282828]/10 dark:border-[#25473C] pb-2">
            <h3 className="text-xs font-semibold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
              Upcoming Sessions
            </h3>
            <button
              onClick={() => navigate('/events')}
              className="text-xs font-medium text-[#282828]/60 hover:text-[#282828] dark:text-[#B7C9C2] dark:hover:text-[#6BB89E] transition-colors">
              
              All Events &rarr;
            </button>
          </div>

          {upcomingEvents.length === 0 ?
          <div className="p-6 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-[#FAF4EE] dark:bg-[#102B22] text-center text-xs text-[#282828]/50 dark:text-[#7F9990]">
              No upcoming events scheduled right now. Check back soon.
            </div> :

          <div className="space-y-2.5">
              {upcomingEvents.map((ev) =>
            <div
              key={ev.id}
              className="p-3.5 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] flex items-center justify-between gap-3">
              
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-md bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] font-mono uppercase text-[#FC6454] dark:text-[#6BB89E] font-bold">
                        {ev.formattedDate?.month || (ev.date ? new Date(ev.date + 'T00:00:00').toLocaleString('en-US', { month: 'short' }).toUpperCase() : 'EVT')}
                      </span>
                      <span className="text-xs leading-none font-mono font-bold text-[#282828] dark:text-[#F1F7F4]">
                        {ev.formattedDate?.day || (ev.date ? new Date(ev.date + 'T00:00:00').getDate() : '15')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-[#282828] dark:text-[#F1F7F4] truncate">{ev.title}</h4>
                      <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990] truncate font-mono">{ev.location}</p>
                    </div>
                  </div>
                  <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/events')}>
                
                    Details
                  </Button>
                </div>
            )}
            </div>
          }
        </div>
      </div>

      {/* 7. RECENT LOGGED ACTIVITIES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#282828]/10 dark:border-[#25473C] pb-2">
          <h2 className="text-xs font-semibold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#282828]/50 dark:text-[#7F9990]" />
            Recent Personal Activity
          </h2>
          <span className="text-xs font-mono text-[#282828]/50 dark:text-[#7F9990]">Activity Log</span>
        </div>

        <div className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] p-5 divide-y divide-[#282828]/10 dark:divide-[#25473C]">
          {loading ?
          <div className="py-6 text-center text-xs text-[#282828]/50 dark:text-[#7F9990]">Loading activities...</div> :
          activities.length === 0 ?
          <div className="py-6 text-center text-xs text-[#282828]/50 dark:text-[#7F9990]">
              No recorded activity yet. Complete workshop registrations or courses to start your log.
            </div> :

          activities.map((act) =>
          <div key={act.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-[#FAF4EE] dark:bg-[#15362B] text-[#FC6454] dark:text-[#6BB89E] flex items-center justify-center text-xs border border-[#282828]/10 dark:border-[#25473C]">
                    {act.type === 'certificate' ?
                <Award className="w-3.5 h-3.5" /> :

                <CheckCircle2 className="w-3.5 h-3.5" />
                }
                  </div>
                  <p className="text-xs font-medium text-[#282828] dark:text-[#F1F7F4]">{act.title}</p>
                </div>
                <span className="text-[11px] font-mono text-[#282828]/50 dark:text-[#7F9990] shrink-0">{act.timeAgo}</span>
              </div>
          )
          }
        </div>
      </div>
    </div>);

};