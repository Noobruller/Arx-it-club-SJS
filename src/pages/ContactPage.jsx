import React, { useState } from 'react';
import { Button } from '../components/common/Button.jsx';
import { MapPin, Mail, Clock, Send, CheckCircle } from 'lucide-react';

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    contactInfo: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-left space-y-2 border-b border-[#282828]/10 dark:border-[#25473C] pb-6">
        <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider">
          COMMUNICATIONS
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight">
          Contact ARX IT CLUB OF SJS
        </h1>
        <p className="text-sm text-[#282828]/70 dark:text-[#B7C9C2] max-w-2xl">
          Questions about membership enrollment, curriculum modules, project collaborations,
          or lab schedules? Send us a message or visit Computer Lab 3.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Col */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] space-y-4 shadow-xs">
            <h3 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono">
              Club Office &amp; Lab
            </h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#282828] dark:text-[#F1F7F4]">Physical Location</p>
                  <p className="text-[#282828]/70 dark:text-[#B7C9C2]">Computer Lab 3, Block B (Second Floor)</p>
                  <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990] mt-0.5">School Campus</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#282828] dark:text-[#F1F7F4]">Regular Lab Sessions</p>
                  <p className="text-[#282828]/70 dark:text-[#B7C9C2]">Monday &amp; Thursday: 3:30 PM &ndash; 5:30 PM</p>
                  <p className="text-[#282828]/70 dark:text-[#B7C9C2]">Saturday Hack Lab: 10:00 AM &ndash; 1:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#282828] dark:text-[#F1F7F4]">Official Correspondence</p>
                  <p className="text-[#282828]/70 dark:text-[#B7C9C2] font-mono">contact@arxitclub.org</p>
                </div>
              </div>
            </div>
          </div>

          {/* Telegram Community & Bot Cards */}
          <div className="p-6 rounded-xl border border-[#282828]/10 dark:border-[#25473C] bg-[#FAF4EE]/80 dark:bg-[#102B22] space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-[#FC6454] dark:text-[#6BB89E] font-medium text-xs font-mono uppercase tracking-wider">
              <Send className="w-3.5 h-3.5" />
              <span>Official Telegram Links</span>
            </div>
            <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed">
              Connect directly with our student assistant bot or follow daily broadcast announcements.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="https://t.me/arxitclub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] hover:text-[#FC6454] dark:hover:text-[#6BB89E] transition-colors">
                
                <span>Channel: @arxitclub</span>
                <Send className="w-3 h-3 text-[#FC6454] dark:text-[#6BB89E]" />
              </a>
              <a
                href="https://t.me/ARXITCLUB_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] hover:text-[#FC6454] dark:hover:text-[#6BB89E] transition-colors">
                
                <span>Bot: @ARXITCLUB_bot</span>
                <Send className="w-3 h-3 text-[#FC6454] dark:text-[#6BB89E]" />
              </a>
            </div>
          </div>
        </div>

        {/* Message Form Col */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-xl border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] shadow-xs">
            {submitted ?
            <div className="py-12 text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h3 className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4]">Message Dispatched</h3>
                <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] max-w-sm mx-auto">
                  Thank you for contacting ARX IT CLUB OF SJS. An officer or instructor will review your note
                  at the next lab session.
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    Send Another Note
                  </Button>
                </div>
              </div> :

            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono">
                  Send a Direct Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
                      Your Full Name
                    </label>
                    <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30" />
                  
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
                      Contact Email or Telegram
                    </label>
                    <input
                    type="text"
                    required
                    placeholder="e.g. alex@school.edu or @alex"
                    value={form.contactInfo}
                    onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30" />
                  
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
                    Inquiry Subject
                  </label>
                  <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30">
                  
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Membership & Registration">Membership &amp; Registration</option>
                    <option value="Curriculum & Workshop">Curriculum &amp; Workshop Tracks</option>
                    <option value="Project Collaboration">Project Collaboration</option>
                    <option value="Certificate Verification Assistance">Certificate Verification Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
                    Message
                  </label>
                  <textarea
                  required
                  rows={5}
                  placeholder="Type your message here..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 resize-none" />
                
                </div>

                <div className="pt-2">
                  <Button variant="primary" size="md" type="submit" className="w-full sm:w-auto">
                    Transmit Message
                  </Button>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </div>);

};