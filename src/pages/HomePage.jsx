import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';

import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { CourseMaterialVisual } from '../components/courses/CourseMaterialVisual.jsx';
import {
  Code,
  Laptop,
  Users,
  Award,
  ArrowRight,
  Calendar,
  Layers,
  ShieldCheck,
  ChevronRight,
  Send,
  MapPin,
  Clock,
  ExternalLink,
  Search
} from
  'lucide-react';






export const HomePage = ({ navigate }) => {
  const [stats, setStats] = useState({
    activeMembers: 0,
    coursesCount: 0,
    projectsCount: 0,
    eventsCount: 0
  });
  const [settings, setSettings] = useState({
    clubName: 'ARX IT CLUB OF SJS',
    tagline: 'Learn. Build. Grow.',
    description:
      'The school technology club giving students hands-on experience in software engineering, systems design, collaborative projects, and verified credentials.',
    contactEmail: 'contact@arxitclub.org',
    telegramBotUsername: 'ARXITCLUB_bot',
    telegramBotUrl: 'https://t.me/ARXITCLUB_bot',
    telegramChannelUrl: 'https://t.me/arxitclub',
    telegramChannelName: '@arxitclub',
    githubUrl: '',
    youtubeUrl: '',
    heroHeadline: 'Official Student Technology Hub',
    heroSubheadline: 'Learn. Build. Grow.',
    meetingLocation: 'Computer Lab 3, Block B',
    meetingSchedule: 'Monday & Thursday · 3:30 PM – 5:30 PM',
    footerText: ''
  });
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [lookupCertId, setLookupCertId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [statsRes, settingsRes, coursesRes, projectsRes, eventsRes, achRes] = await Promise.all([
          api.getStats().catch(() => ({ stats: { activeMembers: 0, coursesCount: 0, projectsCount: 0, eventsCount: 0 } })),
          api.getSettings().catch(() => ({ settings: null })),
          api.getCourses().catch(() => ({ courses: [] })),
          api.getProjects().catch(() => ({ projects: [] })),
          api.getEvents('Upcoming').catch(() => ({ events: [] })),
          api.getAchievements().catch(() => ({ achievements: [] }))]
        );

        if (statsRes.stats) setStats(statsRes.stats);
        if (settingsRes?.settings) setSettings(settingsRes.settings);
        if (coursesRes.courses) setCourses(coursesRes.courses.slice(0, 4));
        if (projectsRes.projects) setProjects(projectsRes.projects.slice(0, 3));
        if (eventsRes.events) setEvents(eventsRes.events.slice(0, 3));
        if (achRes.achievements) setAchievements(achRes.achievements.slice(0, 3));
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleVerifyLookup = (e) => {
    e.preventDefault();
    if (lookupCertId.trim()) {
      navigate(`/certificates?id=${encodeURIComponent(lookupCertId.trim())}`);
    } else {
      navigate('/certificates');
    }
  };

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* 1. HERO SECTION: Professional, Calm, Content-First */}
      <section className="border-b border-[#282828]/10 dark:border-[#25473C] bg-[#F7EFE8] dark:bg-[#071A14] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Organization Pitch */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Unboxed Status Kicker */}
              <div className="flex items-center gap-2 text-xs font-mono text-[#FC6454] dark:text-[#6BB89E]">
                <span className="w-2 h-2 rounded-full bg-[#FC6454] animate-pulse" />
                <span>OFFICIAL TECHNOLOGY ORGANIZATION</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#282828]/60 dark:text-[#F1F7F4]/60">2026 CYCLE</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#282828] dark:text-[#F1F7F4] leading-[1.08] text-balance">
                  {settings.clubName || 'ARX IT CLUB OF SJS'}
                </h1>
                <p className="text-lg sm:text-xl font-medium text-[#282828]/80 dark:text-[#F1F7F4]/90">
                  {settings.tagline || 'Learn. Build. Grow.'}
                </p>
              </div>

              <p className="text-sm sm:text-base text-[#282828]/70 dark:text-[#F1F7F4]/75 leading-relaxed max-w-2xl">
                {settings.description ||
                  'The official school IT Club giving students structured pathways to learn modern programming, develop software solutions in teams, and earn verified technical credentials.'}
              </p>

              {/* Functional CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {settings.registrationStatus === 'CLOSED' ?
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="border-amber-400 text-amber-700 dark:text-amber-300">

                    Admissions Closed
                  </Button> :

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/register')}>

                    Join Club
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                }
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/courses')}>

                  Explore Curriculum
                </Button>
                <a
                  href={settings.telegramChannelUrl || 'https://t.me/arxitclub'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-md text-xs font-medium text-[#282828] dark:text-[#F1F7F4] hover:text-[#FC6454] border border-[#282828]/15 dark:border-[#25473C] hover:bg-[#FC6454]/10 transition-colors">

                  <Send className="w-3.5 h-3.5 text-[#FC6454]" />
                  <span>@arxitclub</span>
                </a>
              </div>

              {/* Core Attributes */}
              <div className="pt-4 border-t border-[#282828]/10 dark:border-[#25473C] flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#282828]/60 dark:text-[#F1F7F4]/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Free Student Membership</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FC6454]" />
                  <span>Lab Project Mentorship</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Verified Credentials</span>
                </div>
              </div>
            </div>

            {/* Right Column: Operational Snapshot Panel (Bloomberg/Linear-grade dense scannability) */}
            <div className="lg:col-span-5 w-full">
              <div className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white/70 dark:bg-[#102B22] overflow-hidden shadow-xs">
                <div className="px-5 py-3 border-b border-[#282828]/10 dark:border-[#25473C] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#282828] dark:text-[#F1F7F4]">
                      OPERATIONS DESK
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#282828]/60 dark:text-[#F1F7F4]/60">
                    STATUS / ACTIVE
                  </span>
                </div>

                <div className="p-5 space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#F1F7F4]/60">
                      Headquarters &amp; Lab
                    </span>
                    <div className="flex items-start gap-2 text-[#282828] dark:text-[#F1F7F4] font-medium">
                      <MapPin className="w-4 h-4 text-[#FC6454] shrink-0 mt-0.5" />
                      <span>{settings.meetingLocation || 'Computer Lab 3, Block B'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#F1F7F4]/60">
                      Weekly Sessions
                    </span>
                    <div className="flex items-start gap-2 text-[#282828] dark:text-[#F1F7F4] font-medium">
                      <Clock className="w-4 h-4 text-[#FC6454] shrink-0 mt-0.5" />
                      <span>{settings.meetingSchedule || 'Monday & Thursday · 3:30 PM – 5:30 PM'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#282828]/10 dark:border-[#25473C] grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#EFE6DE]/60 dark:bg-[#071A14] rounded-md border border-[#282828]/10 dark:border-[#25473C]">
                      <p className="text-[11px] font-mono text-[#282828]/60 dark:text-[#F1F7F4]/60 uppercase">Enrolled Members</p>
                      <p className="text-lg font-bold text-[#282828] dark:text-[#F1F7F4] font-mono tabular-nums mt-0.5">
                        {stats.activeMembers}
                      </p>
                    </div>
                    <div className="p-3 bg-[#EFE6DE]/60 dark:bg-[#071A14] rounded-md border border-[#282828]/10 dark:border-[#25473C]">
                      <p className="text-[11px] font-mono text-[#282828]/60 dark:text-[#F1F7F4]/60 uppercase">Available Tracks</p>
                      <p className="text-lg font-bold text-[#FC6454] dark:text-[#6BB89E] font-mono tabular-nums mt-0.5">
                        {stats.coursesCount}
                      </p>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => navigate('/about')}
                      className="w-full py-2 text-center text-xs font-medium text-[#282828] dark:text-[#F1F7F4] hover:text-[#FC6454] bg-[#EFE6DE]/70 dark:bg-[#071A14] rounded-md border border-[#282828]/15 dark:border-[#25473C] transition-colors cursor-pointer">

                      View Organization Charter &amp; Leadership &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OPERATIONAL STATISTICS: Clean Hairline Division */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-[#FAF4EE] dark:bg-[#102B22] p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div className="space-y-1 sm:border-r border-[#282828]/10 dark:border-[#25473C] sm:pr-6">
              <span className="text-xs font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#F1F7F4]/60">
                Active Members
              </span>
              <p className="text-3xl sm:text-4xl font-bold text-[#282828] dark:text-[#F1F7F4] font-mono tabular-nums">
                {stats.activeMembers}
              </p>
              <p className="text-[11px] text-[#282828]/50 dark:text-[#F1F7F4]/50">Registered students</p>
            </div>

            <div className="space-y-1 md:border-r border-[#282828]/10 dark:border-[#25473C] md:pr-6">
              <span className="text-xs font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#F1F7F4]/60">
                Curriculum Courses
              </span>
              <p className="text-3xl sm:text-4xl font-bold text-[#FC6454] dark:text-[#6BB89E] font-mono tabular-nums">
                {stats.coursesCount}
              </p>
              <p className="text-[11px] text-[#282828]/50 dark:text-[#F1F7F4]/50">Structured training modules</p>
            </div>

            <div className="space-y-1 sm:border-r border-[#282828]/10 dark:border-[#25473C] sm:pr-6">
              <span className="text-xs font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#F1F7F4]/60">
                Software Projects
              </span>
              <p className="text-3xl sm:text-4xl font-bold text-[#282828] dark:text-[#F1F7F4] font-mono tabular-nums">
                {stats.projectsCount}
              </p>
              <p className="text-[11px] text-[#282828]/50 dark:text-[#F1F7F4]/50">Shipped student repos</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#F1F7F4]/60">
                Activities &amp; Labs
              </span>
              <p className="text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                {stats.eventsCount}
              </p>
              <p className="text-[11px] text-[#282828]/50 dark:text-[#F1F7F4]/50">Conducted workshops</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR CORE TECHNICAL TRACKS: Editorial, Non-Repetitive */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#282828]/10 dark:border-[#25473C] pb-4">
          <div>
            <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider">
              PILLARS / METHODOLOGY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight mt-1">
              Core Technical Tracks
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#282828]/60 dark:text-[#F1F7F4]/60 max-w-md">
            Four interconnected stages transforming classroom curiosity into production-grade software engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-[#282828]/60 dark:text-[#F1F7F4]/60 text-xs font-mono">
              <span>TRACK 01</span>
              <Laptop className="w-4 h-4 text-[#FC6454]" />
            </div>
            <h3 className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4]">Learn Fundamentals</h3>
            <p className="text-xs text-[#282828]/70 dark:text-[#F1F7F4]/70 leading-relaxed">
              Master web architectures, typed programming with TypeScript and Python, networking basics, and algorithm design.
            </p>
          </div>

          <div className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-[#282828]/60 dark:text-[#F1F7F4]/60 text-xs font-mono">
              <span>TRACK 02</span>
              <Code className="w-4 h-4 text-[#FC6454]" />
            </div>
            <h3 className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4]">Build Real Systems</h3>
            <p className="text-xs text-[#282828]/70 dark:text-[#F1F7F4]/70 leading-relaxed">
              Collaborate on real student web applications, automation bots, relational databases, and verifiable microservices.
            </p>
          </div>

          <div className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-[#282828]/60 dark:text-[#F1F7F4]/60 text-xs font-mono">
              <span>TRACK 03</span>
              <Award className="w-4 h-4 text-[#FC6454]" />
            </div>
            <h3 className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4]">Compete &amp; Ship</h3>
            <p className="text-xs text-[#282828]/70 dark:text-[#F1F7F4]/70 leading-relaxed">
              Represent our school in hackathons, algorithm competitions, and robotics challenges with faculty guidance.
            </p>
          </div>

          <div className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-[#282828]/60 dark:text-[#F1F7F4]/60 text-xs font-mono">
              <span>TRACK 04</span>
              <Users className="w-4 h-4 text-[#FC6454]" />
            </div>
            <h3 className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4]">Collaborate in Teams</h3>
            <p className="text-xs text-[#282828]/70 dark:text-[#F1F7F4]/70 leading-relaxed">
              Work under code reviews, git feature branches, peer programming sessions, and constructive design critiques.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FEATURED CURRICULUM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#282828]/10 dark:border-[#25473C] pb-4">
          <div>
            <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider">
              CURRICULUM / COURSES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight mt-1">
              Featured Training Modules
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/courses')}>
            <span>View All Courses</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {courses.length === 0 ?
          <div className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] p-8 text-center bg-[#FAF4EE] dark:bg-[#102B22]">
            <p className="text-sm font-medium text-[#282828] dark:text-[#F1F7F4]">No courses published yet</p>
            <p className="text-xs text-[#282828]/60 dark:text-[#F1F7F4]/60 mt-1">Courses created by club instructors will appear here.</p>
          </div> :

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) =>
              <div
                key={course.id}
                className="group rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] flex flex-col justify-between overflow-hidden hover:border-[#FC6454]/50 dark:hover:border-[#FC6454]/60 transition-colors shadow-xs">

                <div>
                  <CourseMaterialVisual course={course} variant="card" />
                  <div className="p-5 space-y-3">
                    {/* Unboxed Metadata with Typographic Separator */}
                    <div className="flex items-center gap-2 text-xs text-[#282828]/60 dark:text-[#F1F7F4]/60">
                      <span className="font-medium text-[#FC6454] dark:text-[#6BB89E]">{course.category || 'Engineering'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.duration}</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.level || 'All Levels'}</span>
                    </div>

                    <h3 className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4] leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#282828]/70 dark:text-[#F1F7F4]/70 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[#282828]/10 dark:border-[#25473C] bg-[#EFE6DE]/40 dark:bg-[#071A14]/50 flex items-center justify-between text-xs">
                  <span className="text-[#282828]/60 dark:text-[#F1F7F4]/60">
                    Lead: <strong className="text-[#282828] dark:text-[#F1F7F4] font-medium">{course.instructor}</strong>
                  </span>
                  <button
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="text-[#FC6454] dark:text-[#6BB89E] hover:underline font-medium flex items-center gap-1 cursor-pointer">

                    <span>View Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        }
      </section>

      {/* 5. SELECTED STUDENT PROJECTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#282828]/10 dark:border-[#25473C] pb-4">
          <div>
            <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider">
              SHOWCASE / REPOSITORIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight mt-1">
              Selected Member Projects
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
            <span>View All Projects</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {projects.length === 0 ?
          <div className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] p-8 text-center bg-[#FAF4EE] dark:bg-[#102B22]">
            <p className="text-sm font-medium text-[#282828] dark:text-[#F1F7F4]">No projects published yet</p>
            <p className="text-xs text-[#282828]/60 dark:text-[#F1F7F4]/60 mt-1">Student applications and code bases will be showcased here.</p>
          </div> :

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((proj) =>
              <div
                key={proj.id}
                className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] flex flex-col justify-between overflow-hidden hover:border-[#FC6454]/50 dark:hover:border-[#FC6454]/60 transition-colors shadow-xs">

                <div>
                  {proj.imageUrl &&
                    <div className="w-full h-40 bg-[#EFE6DE] dark:bg-[#071A14] border-b border-[#282828]/10 dark:border-[#25473C] overflow-hidden">
                      <img
                        src={proj.imageUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer" />

                    </div>
                  }
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[#282828]/60 dark:text-[#F1F7F4]/60">
                      <span className="font-mono">{proj.date || '2026'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">{proj.status}</span>
                    </div>

                    <h3 className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4] leading-snug">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-[#282828]/70 dark:text-[#F1F7F4]/70 line-clamp-3 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[#282828]/10 dark:border-[#25473C] bg-[#EFE6DE]/40 dark:bg-[#071A14]/50 flex items-center justify-between gap-2 text-xs">
                  <div className="text-[#282828]/60 dark:text-[#F1F7F4]/60 truncate max-w-[170px]">
                    Team: <span className="text-[#282828] dark:text-[#F1F7F4] font-medium">
                      {Array.isArray(proj.projectMembers) ? proj.projectMembers.join(', ') : (proj.projectMembers || 'IT Club Team')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(proj.githubUrl || proj.projectUrl) && (
                      <a
                        href={proj.githubUrl || proj.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#282828] dark:text-[#F1F7F4] hover:text-[#FC6454] dark:hover:text-[#6BB89E] font-medium transition-colors"
                        title="Repository">
                        <span>Code</span>
                      </a>
                    )}
                    {proj.liveDemoUrl && (
                      <a
                        href={proj.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#FC6454] dark:text-[#6BB89E] hover:underline font-medium transition-colors"
                        title="Live Demo">
                        <span>Demo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        }
      </section>

      {/* 7. VERIFICATION REGISTRY PROMOTION: Authoritative & Functional */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] p-8 sm:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#FC6454] dark:text-[#6BB89E]">
                <ShieldCheck className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
                <span>CRYPTOGRAPHIC CREDENTIAL REGISTRY</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight">
                Recognized Technical Certificates
              </h2>
              <p className="text-xs sm:text-sm text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed max-w-xl">
                Every certificate issued by ARX IT CLUB OF SJS carries a unique certificate ID,
                academic seal, and verification hash. Universities, competitions, and employers
                can verify credential authenticity directly on our public ledger.
              </p>

              {/* Direct Certificate Lookup Form */}
              <form onSubmit={handleVerifyLookup} className="flex flex-col sm:flex-row gap-2 max-w-md pt-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#282828]/40 dark:text-[#7F9990]" />
                  <input
                    type="text"
                    placeholder="Enter Certificate ID (e.g. ITC-...)"
                    value={lookupCertId}
                    onChange={(e) => setLookupCertId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-md border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] placeholder-[#282828]/40 dark:placeholder-[#7F9990] focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30" />

                </div>
                <Button variant="primary" size="md" type="submit">
                  Verify Credential
                </Button>
              </form>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-[#FAF4EE] dark:bg-[#0C241C] p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#282828]/10 dark:border-[#25473C]">
                  <span className="text-xs font-mono text-[#282828]/50 dark:text-[#7F9990] uppercase">Tamper-Proof Registry</span>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-[#58B889] bg-emerald-50 dark:bg-[#102B22] px-2 py-0.5 rounded-sm border border-emerald-200 dark:border-[#25473C]">
                    VERIFIED
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#282828]/70 dark:text-[#B7C9C2]">
                    <span>Algorithm</span>
                    <span className="font-mono text-[#282828] dark:text-[#F1F7F4]">SHA-256 Digest</span>
                  </div>
                  <div className="flex justify-between text-[#282828]/70 dark:text-[#B7C9C2]">
                    <span>Public Lookup</span>
                    <span className="font-mono text-[#FC6454] dark:text-[#6BB89E]">Enabled</span>
                  </div>
                  <div className="flex justify-between text-[#282828]/70 dark:text-[#B7C9C2]">
                    <span>Print Format</span>
                    <span className="font-mono text-[#282828] dark:text-[#F1F7F4]">A4 Landscape</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/certificates')}>

                  Open Credential Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. STUDENT GATEWAY / ONBOARDING */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
        <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider font-semibold">
          MEMBERSHIP / JOIN
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight font-sans">
          Ready to build with ARX IT CLUB OF SJS?
        </h2>
        <p className="text-sm text-[#282828]/70 dark:text-[#B7C9C2] max-w-xl mx-auto leading-relaxed">
          Join our active student cohort, receive your unique Member ID, attend weekly lab workshops,
          and start building meaningful software projects.
        </p>

        <div className="pt-2">
          {settings.registrationStatus === 'CLOSED' ?
            <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/register')}
                className="border-amber-400 text-amber-700 dark:text-amber-300">

                Admissions Notice
              </Button>
              <a
                href={settings.telegramChannelUrl || 'https://t.me/arxitclub'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors">

                <Send className="w-4 h-4" />
                <span>Join @arxitclub for Opening Announcements</span>
              </a>
            </div> :

            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}>

              Register as New Member
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          }
        </div>
      </section>
    </div>);

};