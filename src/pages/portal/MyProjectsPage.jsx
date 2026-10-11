import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { FolderGit2, Users, Calendar, Plus } from 'lucide-react';





export const MyProjectsPage = ({ navigate }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await api.getMemberProjects();
        if (res.projects) setProjects(res.projects);
      } catch (err) {
        console.error('Failed to load member projects', err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="emerald" size="sm">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="blue" size="sm">In Progress</Badge>;
      case 'Planned':
        return <Badge variant="amber" size="sm">Planned</Badge>;
      default:
        return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282828]/10 dark:border-[#25473C] pb-4">
        <div>
          <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider">
            PORTFOLIO &amp; REPOSITORIES
          </span>
          <h1 className="text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight mt-1">My Projects</h1>
          <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
            Collaborative initiatives and software products you have built or are actively developing.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/projects')}>
          
          Browse All Club Projects
        </Button>
      </div>

      {loading ?
      <div className="py-16 text-center text-xs font-mono text-[#282828]/50 dark:text-[#7F9990]">Loading your projects...</div> :
      projects.length === 0 ?
      <div className="p-12 text-center border border-[#282828]/10 dark:border-[#25473C] rounded-lg bg-white dark:bg-[#102B22] max-w-xl mx-auto space-y-4">
          <FolderGit2 className="w-10 h-10 text-[#282828]/40 dark:text-[#7F9990] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4]">
              No projects linked to your account yet
            </h3>
            <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] max-w-sm mx-auto">
              Collaborate with club members in Computer Lab 3 or propose a new software initiative to get started.
            </p>
          </div>
          <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/projects')}>
          
            Explore Projects
          </Button>
        </div> :

      <div className="space-y-4">
          {projects.map((proj) =>
        <div key={proj.id} className="p-6 border border-[#282828]/10 dark:border-[#25473C] space-y-4 rounded-lg bg-white dark:bg-[#102B22] shadow-xs transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#EFE6DE]/60 dark:bg-[#15362B] text-[#FC6454] dark:text-[#6BB89E] border border-[#282828]/10 dark:border-[#25473C] flex items-center justify-center font-bold">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4]">{proj.title}</h3>
                      {getStatusBadge(proj.status)}
                    </div>
                    <p className="text-xs font-mono text-[#282828]/50 dark:text-[#7F9990]">{proj.category}</p>
                  </div>
                </div>
                <span className="text-xs text-[#282828]/50 dark:text-[#7F9990] font-mono">{proj.date}</span>
              </div>

              <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed">{proj.description}</p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(Array.isArray(proj.technologies) ? proj.technologies : []).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-sm text-[11px] font-mono bg-[#EFE6DE] dark:bg-[#15362B] text-[#282828] dark:text-[#F1F7F4] border border-[#282828]/10 dark:border-[#25473C]">
                    {t}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-[#282828]/10 dark:border-[#25473C] flex items-center text-xs text-[#282828]/60 dark:text-[#B7C9C2] gap-2">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Team Members: <strong className="text-slate-800 dark:text-slate-200">
                    {Array.isArray(proj.projectMembers) ? proj.projectMembers.join(', ') : (proj.projectMembers || 'IT Club Team')}
                  </strong>
                </span>
              </div>
            </div>
        )}
        </div>
      }
    </div>);

};