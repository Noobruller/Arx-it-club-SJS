import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';

import { Trophy, Award, Medal, Star } from 'lucide-react';

export const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const achRes = await api.getAchievements().catch(() => ({ achievements: [] }));
        if (achRes.achievements) setAchievements(achRes.achievements);
      } catch (err) {
        console.error('Failed to load achievements data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredAchievements = achievements.filter((a) => {
    if (activeTab === 'all') return true;
    return a.category === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-left space-y-2 border-b border-[#282828]/10 dark:border-[#25473C] pb-6">
        <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider font-semibold">
          HONORS &amp; RECOGNITION
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight font-sans">
          Club Achievements
        </h1>
        <p className="text-sm text-[#282828]/70 dark:text-[#B7C9C2] max-w-2xl">
          Official recognitions, competitive victories, hackathon awards, and milestones earned by
          club members and student project teams.
        </p>
      </div>

      {/* Segmented Filter */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-[#FAF4EE] dark:bg-[#0A211A] rounded-lg border border-[#282828]/10 dark:border-[#25473C] w-fit">
        {[
        { id: 'all', label: 'All Honors' },
        { id: 'club', label: 'Club Milestones' },
        { id: 'member', label: 'Member Awards' },
        { id: 'competition', label: 'Competitions' },
        { id: 'award', label: 'Special Recognitions' }].
        map((tab) =>
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
          activeTab === tab.id ?
          'bg-white dark:bg-[#15362B] text-[#282828] dark:text-[#F1F7F4] shadow-xs font-semibold' :
          'text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-[#F1F7F4]'}`
          }>
          
            {tab.label}
          </button>
        )}
      </div>

      {/* Content */}
      {loading ?
      <div className="py-20 text-center text-[#282828]/60 dark:text-[#7F9990] space-y-2">
          <div className="w-6 h-6 border-2 border-[#FC6454] dark:border-[#6BB89E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono">Loading honors archive...</p>
        </div> :
      filteredAchievements.length === 0 ?
      <div className="py-16 text-center bg-[#FAF4EE] dark:bg-[#102B22] rounded-lg border border-[#282828]/10 dark:border-[#25473C] p-8 space-y-2">
          <Medal className="w-8 h-8 text-[#282828]/40 dark:text-[#7F9990] mx-auto" />
          <h3 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4]">
            No achievements published in this category
          </h3>
          <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
            Official club competition results and student recognitions will be posted here.
          </p>
        </div> :

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((item) =>
        <div
          key={item.id}
          className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] p-6 space-y-4 hover:border-[#FC6454]/40 dark:hover:border-[#366656] transition-colors shadow-xs">
          
              <div className="flex items-center justify-between">
                {item.imageUrl ?
            <div className="w-12 h-12 rounded-md overflow-hidden bg-[#FAF4EE] dark:bg-[#15362B] border border-[#282828]/15 dark:border-[#25473C]">
                    <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer" />
              
                  </div> :

            <div className="w-10 h-10 rounded-md bg-[#FAF4EE] dark:bg-[#15362B] text-[#FC6454] dark:text-[#6BB89E] border border-[#282828]/15 dark:border-[#25473C] flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
            }
                <span className="text-[11px] font-mono text-[#282828]/50 dark:text-[#7F9990]">{item.date}</span>
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4] leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#282828]/10 dark:border-[#25473C] flex items-center justify-between text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
                <span className="capitalize">{item.category} Category</span>
                <span className="text-[#FC6454] dark:text-[#6BB89E] font-medium font-mono text-[11px]">Verified Record</span>
              </div>
            </div>
        )}
        </div>
      }
    </div>);

};