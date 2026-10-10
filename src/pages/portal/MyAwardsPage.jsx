import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Trophy, Calendar } from 'lucide-react';





export const MyAwardsPage = ({ navigate }) => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAwards() {
      try {
        const res = await api.getMemberAwards();
        if (res.awards) setAwards(res.awards);
      } catch (err) {
        console.error('Failed to load awards', err);
      } finally {
        setLoading(false);
      }
    }
    loadAwards();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#282828]/10 dark:border-[#25473C] pb-4">
        <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider">
          MEMBER RECOGNITIONS
        </span>
        <h1 className="text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight mt-1">My Awards</h1>
        <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
          Special recognitions, hackathon honors, and club distinctions recorded on your student profile.
        </p>
      </div>

      {loading ?
      <div className="py-16 text-center text-xs font-mono text-[#282828]/50 dark:text-[#7F9990]">Loading awards...</div> :
      awards.length === 0 ? (
      /* Empty State */
      <div className="p-12 text-center border border-[#282828]/10 dark:border-[#25473C] rounded-lg bg-white dark:bg-[#102B22] max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-[#15362B] text-amber-600 dark:text-[#D6A84F] border border-amber-200 dark:border-[#25473C] flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4]">No awards recorded yet</h3>
            <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] max-w-sm mx-auto leading-relaxed">
              Keep learning, building, and participating in hackathons and club events to earn official recognitions.
            </p>
          </div>
          <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/events')}>
          
            Explore Events
          </Button>
        </div>) :

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {awards.map((award) =>
        <div key={award.id} className="p-6 border border-[#282828]/10 dark:border-[#25473C] space-y-3 rounded-lg bg-white dark:bg-[#102B22] shadow-xs transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-md bg-amber-50 dark:bg-[#15362B] text-amber-600 dark:text-[#D6A84F] border border-amber-200 dark:border-[#25473C] flex items-center justify-center font-bold">
                  <Trophy className="w-4 h-4" />
                </div>
                <Badge variant="amber" size="sm">
                  {award.category}
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4]">{award.title}</h3>
                <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] mt-1 leading-relaxed">
                  {award.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#282828]/10 dark:border-[#25473C] flex items-center text-xs font-mono text-[#282828]/50 dark:text-[#7F9990] gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Awarded on {award.date}</span>
              </div>
            </div>
        )}
        </div>
      }
    </div>);

};