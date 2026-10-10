import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { api } from '../services/api.js';

import {
  Compass,
  Target,
  Flag,
  Lightbulb,
  Cpu,
  Shield,
  Palette,
  Users,
  Send,
  Youtube,
  Github,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Globe,
  Share2,
  ArrowRight
} from
  'lucide-react';





export const AboutPage = ({ navigate }) => {
  const [aboutImage, setAboutImage] = useState('/uploads/about-campus.svg');
  const [clubName, setClubName] = useState('ARX IT CLUB OF SJS');
  const [aboutText, setAboutText] = useState('');
  const [governance, setGovernance] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loadingGovernance, setLoadingGovernance] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, govRes, socialRes] = await Promise.all([
          api.getPublicSettings().catch(() => ({ settings: null })),
          api.getGovernanceRoles().catch(() => ({ governance: [] })),
          api.getPublicSocialLinks().catch(() => ({ socialLinks: [] }))]
        );

        if (settingsRes?.settings) {
          if (settingsRes.settings.aboutImageUrl) setAboutImage(settingsRes.settings.aboutImageUrl);
          if (settingsRes.settings.clubName) setClubName(settingsRes.settings.clubName);
          if (settingsRes.settings.aboutText) setAboutText(settingsRes.settings.aboutText);
        }

        if (govRes?.governance) {
          setGovernance(govRes.governance);
        }

        if (socialRes?.socialLinks) {
          setSocialLinks(socialRes.socialLinks);
        }
      } catch (err) {
        console.error('Failed to load About page data', err);
      } finally {
        setLoadingGovernance(false);
      }
    }
    loadData();
  }, []);

  const getPlatformIcon = (platform, iconKey) => {
    const key = (iconKey || platform || '').toLowerCase();
    if (key.includes('telegram') || key === 'send') return <Send className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
    if (key.includes('youtube')) return <Youtube className="w-4 h-4 text-red-500" />;
    if (key.includes('git')) return <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" />;
    if (key.includes('instagram')) return <Instagram className="w-4 h-4 text-pink-500" />;
    if (key.includes('facebook')) return <Facebook className="w-4 h-4 text-blue-600" />;
    if (key.includes('linkedin')) return <Linkedin className="w-4 h-4 text-blue-500" />;
    if (key.includes('twitter') || key === 'x') return <Twitter className="w-4 h-4 text-cyan-500" />;
    if (key.includes('web') || key.includes('site') || key === 'globe') return <Globe className="w-4 h-4 text-emerald-500" />;
    return <Share2 className="w-4 h-4 text-slate-500" />;
  };

  const benefits = [
    {
      title: 'Practical Hands-on Projects',
      desc: 'Build real web portals, games, algorithms, and tools rather than purely theoretical textbook exercises.',
      icon: Cpu
    },
    {
      title: 'Peer Mentorship & Code Reviews',
      desc: 'Learn directly from senior student mentors and peers who share an enthusiasm for modern technology.',
      icon: Users
    },
    {
      title: 'Hackathons & Competitions',
      desc: 'Represent the school at regional coding challenges, algorithm contests, and international robotics fairs.',
      icon: Lightbulb
    },
    {
      title: 'Verified Technical Credentials',
      desc: 'Graduate from curriculum tracks with verifiable certificates featuring cryptographic IDs and QR codes.',
      icon: Shield
    }];


  return (
    <div className="space-y-16 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Intro Header */}
      <div className="text-left space-y-3 max-w-3xl border-b border-[#282828]/10 dark:border-[#25473C] pb-8">
        <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider font-semibold">
          ORGANIZATION CHARTER
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight font-sans">
          About {clubName}
        </h1>
        <p className="text-sm sm:text-base text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed">
          {aboutText ||
            `${clubName} is our school's student technology organization dedicated to software engineering, creative problem solving, and collaborative technical growth.`}
        </p>
      </div>


      {/* Mission / Vision / Goals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] space-y-3 shadow-xs transition-colors">
          <div className="w-9 h-9 rounded-md bg-[#FC6454]/15 dark:bg-[#2F8068]/30 text-[#FC6454] dark:text-[#6BB89E] flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono text-[#282828]/50 dark:text-[#7F9990] uppercase">DIRECTIVE 01</span>
          <h3 className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4]">Our Mission</h3>
          <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed">
            To create an environment where every curious student can learn programming,
            collaborate on meaningful software products, and develop practical skills for modern engineering.
          </p>
        </div>

        <div className="p-8 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] space-y-3 shadow-xs transition-colors">
          <div className="w-9 h-9 rounded-md bg-[#FC6454]/15 dark:bg-[#2F8068]/30 text-[#FC6454] dark:text-[#6BB89E] flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono text-[#282828]/50 dark:text-[#7F9990] uppercase">DIRECTIVE 02</span>
          <h3 className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4]">Our Vision</h3>
          <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed">
            To be a disciplined, respected student technology hub recognized for quality projects,
            ethical engineering practices, and collaborative camaraderie.
          </p>
        </div>

        <div className="p-8 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] space-y-3 shadow-xs transition-colors">
          <div className="w-9 h-9 rounded-md bg-[#FC6454]/15 dark:bg-[#2F8068]/30 text-[#FC6454] dark:text-[#6BB89E] flex items-center justify-center">
            <Flag className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono text-[#282828]/50 dark:text-[#7F9990] uppercase">DIRECTIVE 03</span>
          <h3 className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4]">Our Goals</h3>
          <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed">
            Equip members with coding confidence, run regular workshops and build sprints,
            support open student repositories, and issue recognized certificates.
          </p>
        </div>
      </div>

      {/* What Members Can Learn */}
      <div className="rounded-xl border border-[#282828]/10 dark:border-[#25473C] bg-[#EFE6DE]/60 dark:bg-[#102B22] p-8 sm:p-10 space-y-6 shadow-xs transition-colors">
        <div>
          <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider font-semibold">
            CURRICULUM DISCIPLINES
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight mt-1 font-sans">
            What Members Learn
          </h2>
          <p className="text-xs sm:text-sm text-[#282828]/70 dark:text-[#B7C9C2] mt-1 max-w-2xl">
            Whether you are writing your first script or architecting a database schema,
            we provide structured tracks across key technical disciplines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-lg bg-white dark:bg-[#15362B] border border-[#282828]/10 dark:border-[#25473C] space-y-2 transition-colors">
            <span className="text-xs font-medium text-[#FC6454] dark:text-[#6BB89E] flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> Web Engineering
            </span>
            <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed">
              Modern TypeScript, React, responsive layouts, HTTP APIs, and node backend routing.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-white dark:bg-[#15362B] border border-[#282828]/10 dark:border-[#25473C] space-y-2 transition-colors">
            <span className="text-xs font-medium text-[#FC6454] dark:text-[#6BB89E] flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" /> Algorithms &amp; Python
            </span>
            <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed">
              Data structures, automation scripts, algorithm complexity, and competitive coding logic.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-white dark:bg-[#15362B] border border-[#282828]/10 dark:border-[#25473C] space-y-2 transition-colors">
            <span className="text-xs font-medium text-[#FC6454] dark:text-[#6BB89E] flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Security &amp; Systems
            </span>
            <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed">
              Cybersecurity fundamentals, network concepts, authentication mechanics, and safe computing.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-white dark:bg-[#15362B] border border-[#282828]/10 dark:border-[#25473C] space-y-2 transition-colors">
            <span className="text-xs font-medium text-[#FC6454] dark:text-[#6BB89E] flex items-center gap-1.5">
              <Palette className="w-4 h-4" /> Interface Design
            </span>
            <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed">
              Design tokens, typography scales, accessibility guidelines, and usability testing.
            </p>
          </div>
        </div>
      </div>

      {/* Why Students Should Join */}
      <div className="space-y-6">
        <div className="border-b border-[#282828]/10 dark:border-[#25473C] pb-3">
          <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider font-semibold">
            BENEFITS
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight mt-1 font-sans">
            Why Students Should Join
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="p-6 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] space-y-2.5 transition-colors">
                <div className="w-8 h-8 rounded-md bg-[#FAF4EE] dark:bg-[#15362B] text-[#FC6454] dark:text-[#6BB89E] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4]">{b.title}</h4>
                <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed">{b.desc}</p>
              </div>);

          })}
        </div>
      </div>

      {/* Meet the Team Section */}
      <div className="space-y-6">
        <div className="border-b border-[#282828]/10 dark:border-[#25473C] pb-3">
          <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider font-semibold">
            OUR PEOPLE
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight mt-1 font-sans">
            Meet the Team
          </h2>
          <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] mt-1">
            The instructors and specialists driving each discipline forward.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Kidus Elisa', role: 'Cyber Security', specialty: 'Cyber Security', img: '/team/nathat.jpg' },
            { name: 'Nathan W', role: 'Web Development', specialty: 'Web Development', img: '/team/nathan.jpg' },
            { name: 'Yohannes', role: 'AI & Machine Learning', specialty: 'Artificial Intelligence', img: '/team/yohannes.jpg' },
            { name: 'Natan Yonas', role: 'Robotics', specialty: 'Robotics Engineering', img: '/team/me.jpg' },
          ].map((member, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 group"
            >
              {/* Photo */}
              <div className="relative h-56 w-full overflow-hidden bg-[#FAF4EE] dark:bg-[#15362B]">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              {/* Info */}
              <div className="p-5 space-y-1">
                <h4 className="text-sm font-bold text-[#282828] dark:text-[#F1F7F4]">{member.name}</h4>
                <p className="text-xs font-semibold text-[#FC6454] dark:text-[#6BB89E]">{member.role}</p>
                <p className="text-[11px] font-mono text-[#282828]/50 dark:text-[#7F9990] uppercase tracking-wide">{member.specialty}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Club Governance Section */}
      <div className="space-y-6">
        <div className="border-b border-[#282828]/10 dark:border-[#25473C] pb-3">
          <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider font-semibold">
            LEADERSHIP
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight mt-1 font-sans">
            Student Executive Leadership
          </h2>
          <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] mt-1">
            Elected officers and mentors supporting operations, curriculum, and community.
          </p>
        </div>

        {loadingGovernance ?
          <div className="py-12 text-center text-xs font-mono text-[#282828]/40 dark:text-[#7F9990]">Loading leadership index...</div> :
          governance.length === 0 ?
            <div className="text-center py-8 bg-[#FAF4EE] dark:bg-[#102B22] rounded-lg border border-[#282828]/10 dark:border-[#25473C] text-xs text-[#282828]/50 dark:text-[#7F9990]">
              Governance team profiles will appear here.
            </div> :

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {governance.map((leader) =>
                <div
                  key={leader.id}
                  className="p-6 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] text-center space-y-3 flex flex-col justify-between transition-colors">

                  <div className="space-y-3">
                    {/* Text-only: no profile photo displayed */}
                    <div className="w-14 h-14 rounded-full bg-[#FAF4EE] dark:bg-[#15362B] border border-[#282828]/15 dark:border-[#25473C] text-[#FC6454] dark:text-[#6BB89E] flex items-center justify-center font-mono font-bold text-lg mx-auto select-none">
                      {leader.name ? leader.name.charAt(0).toUpperCase() : 'L'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4]">{leader.name}</h4>
                      <p className="text-xs text-[#FC6454] dark:text-[#6BB89E] font-medium mt-0.5">{leader.role}</p>
                      <p className="text-[11px] font-mono text-[#282828]/50 dark:text-[#7F9990]">{leader.classGrade}</p>
                    </div>
                  </div>

                  {leader.bio &&
                    <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed border-t border-[#282828]/10 dark:border-[#25473C] pt-2">
                      {leader.bio}
                    </p>
                  }
                </div>
              )}
            </div>
        }
      </div>

      {/* CTA Footer for About page */}
      <div className="text-center py-8 space-y-4 border-t border-[#282828]/10 dark:border-[#25473C]">
        <h3 className="text-xl font-bold text-[#282828] dark:text-[#F1F7F4]">Interested in joining {clubName}?</h3>
        <p className="text-xs sm:text-sm text-[#282828]/70 dark:text-[#B7C9C2] max-w-md mx-auto">
          Admissions are open to all students interested in technology, regardless of prior coding experience.
        </p>
        <div className="pt-2">
          <Button variant="primary" size="md" onClick={() => navigate('/register')}>
            Register as Member
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>);

};