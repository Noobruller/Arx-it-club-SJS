import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';

import { Button } from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from
  'lucide-react';





export const EventsPage = ({ navigate }) => {
  const { member, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Upcoming');
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await api.getEvents(selectedStatus);
        if (res.events) setEvents(res.events);
      } catch (err) {
        console.error('Failed to load events', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [selectedStatus]);

  const handleRegister = async (event) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setRegisteringId(event.id);
    setErrorMessage(null);
    try {
      const res = await api.registerEvent(event.id, member?.id);
      setFeedback(res.message || `Registered for ${event.title}!`);
      setTimeout(() => setFeedback(null), 4000);
      const updated = await api.getEvents(selectedStatus);
      if (updated.events) setEvents(updated.events);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Toast Feedback */}
      {feedback &&
        <div className="fixed top-20 right-4 z-50 bg-emerald-900 text-emerald-100 border border-emerald-700 px-4 py-2.5 rounded-md shadow-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
          <span className="text-xs font-medium">{feedback}</span>
        </div>
      }

      {errorMessage &&
        <div className="fixed top-20 right-4 z-50 bg-rose-900 text-rose-100 border border-rose-700 px-4 py-2.5 rounded-md shadow-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
          <span className="text-xs font-medium">{errorMessage}</span>
        </div>
      }

      {/* Header */}
      <div className="text-left space-y-2 border-b border-[#282828]/10 dark:border-[#25473C] pb-6">
        <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider">
          CALENDAR &amp; ACTIVITIES
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight">
          Events &amp; Workshops
        </h1>
        <p className="text-sm text-[#282828]/70 dark:text-[#B7C9C2] max-w-2xl">
          Attend hands-on workshops, lab coding sessions, speaker seminars, and competitive hackathons.
        </p>
      </div>

      {/* Segmented Filter */}
      <div className="flex items-center gap-1 p-1 bg-[#EFE6DE]/60 dark:bg-[#0A211A] rounded-lg border border-[#282828]/10 dark:border-[#25473C] w-fit">
        <button
          onClick={() => setSelectedStatus('Upcoming')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${selectedStatus === 'Upcoming' ?
              'bg-white dark:bg-[#102B22] text-[#282828] dark:text-[#F1F7F4] shadow-xs font-semibold' :
              'text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-[#F1F7F4]'}`
          }>

          Upcoming Sessions
        </button>
        <button
          onClick={() => setSelectedStatus('Past')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${selectedStatus === 'Past' ?
              'bg-white dark:bg-[#102B22] text-[#282828] dark:text-[#F1F7F4] shadow-xs font-semibold' :
              'text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-[#F1F7F4]'}`
          }>

          Past Sessions
        </button>
      </div>

      {/* Events List */}
      {loading ?
        <div className="py-20 text-center text-[#282828]/50 dark:text-[#7F9990] space-y-2">
          <div className="w-6 h-6 border-2 border-[#FC6454] dark:border-[#6BB89E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono">Loading schedule...</p>
        </div> :
        events.length === 0 ?
          <div className="py-20 text-center bg-[#FAF4EE] dark:bg-[#071A14] rounded-2xl border border-[#282828]/10 dark:border-[#25473C] px-8 flex flex-col items-center gap-6 relative overflow-hidden">
            {/* Decorative orbital rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              <div className="w-64 h-64 rounded-full border border-dashed border-[#FC6454]/15 dark:border-[#6BB89E]/15 animate-[spin_18s_linear_infinite]" />
              <div className="absolute w-44 h-44 rounded-full border border-dashed border-[#FC6454]/10 dark:border-[#6BB89E]/10 animate-[spin_12s_linear_infinite_reverse]" />
              <div className="absolute w-24 h-24 rounded-full border border-[#FC6454]/20 dark:border-[#6BB89E]/20" />
            </div>

            {/* Central icon */}
            <div className="relative z-10 w-16 h-16 rounded-full bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] flex items-center justify-center shadow-lg">
              <Calendar className="w-7 h-7 text-[#FC6454] dark:text-[#6BB89E]" />
            </div>

            {/* Text */}
            <div className="relative z-10 space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#FC6454] dark:text-[#6BB89E]">
                SYSTEM STATUS
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight">
                No current event
              </h3>
              <p className="text-xs sm:text-sm text-[#282828]/60 dark:text-[#B7C9C2] max-w-sm mx-auto leading-relaxed">
                No events are currently orbiting or scheduled. New workshops and lab sessions
                will appear here once launched — follow the official channel for launch alerts.
              </p>
            </div>

            {/* Status badge */}
            <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] text-xs font-mono text-[#282828]/50 dark:text-[#7F9990]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              ORBIT CLEAR · {selectedStatus.toUpperCase()} QUEUE EMPTY
            </div>
          </div> :

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) =>
              <div
                key={event.id}
                className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] flex flex-col justify-between overflow-hidden hover:border-[#FC6454]/40 dark:hover:border-[#366656] transition-colors shadow-xs">

                <div>
                  {event.imageUrl || event.coverImageUrl ?
                    <div className="w-full h-44 bg-[#FAF4EE] dark:bg-[#071A14] border-b border-[#282828]/10 dark:border-[#25473C] overflow-hidden">
                      <img
                        src={event.imageUrl || event.coverImageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer" />

                    </div> :

                    <div className="w-full h-24 bg-[#FAF4EE] dark:bg-[#0C241C] border-b border-[#282828]/10 dark:border-[#25473C] p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] flex flex-col items-center justify-center">
                        <span className="text-[10px] font-mono uppercase text-[#FC6454] dark:text-[#6BB89E] font-bold">
                          {event.formattedDate?.month || (event.date ? new Date(event.date + 'T00:00:00').toLocaleString('en-US', { month: 'short' }).toUpperCase() : 'EVT')}
                        </span>
                        <span className="text-base font-bold text-[#282828] dark:text-[#F1F7F4] font-mono leading-none">
                          {event.formattedDate?.day || (event.date ? new Date(event.date + 'T00:00:00').getDate() : '15')}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-[#FC6454] dark:text-[#6BB89E]">{event.category || event.locationType || 'Session'}</span>
                        <p className="text-[11px] text-[#282828]/60 dark:text-[#7F9990] font-mono">{event.time}</p>
                      </div>
                    </div>
                  }
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
                      <span className="font-mono">{event.date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 dark:text-[#58B889] font-medium">{event.type || 'Workshop'}</span>
                    </div>

                    <h3 className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4] leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="pt-2 text-xs text-[#282828]/60 dark:text-[#B7C9C2] space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#282828]/40 dark:text-[#7F9990] shrink-0" />
                        <span>{event.location}</span>
                      </div>
                      {event.time &&
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#282828]/40 dark:text-[#7F9990] shrink-0" />
                          <span>{event.time}</span>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[#282828]/10 dark:border-[#25473C] bg-[#FAF4EE]/50 dark:bg-[#0A211A]/50 flex items-center justify-between text-xs">
                  <span className="text-[#282828]/60 dark:text-[#B7C9C2]">
                    {event.registeredCount ? `${event.registeredCount} enrolled` : 'Open access'}
                  </span>
                  {selectedStatus === 'Upcoming' &&
                    <Button
                      variant="primary"
                      size="sm"
                      loading={registeringId === event.id}
                      onClick={() => handleRegister(event)}>

                      Register
                    </Button>
                  }
                </div>
              </div>
            )}
          </div>
      }
    </div>);

};