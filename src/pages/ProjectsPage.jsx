import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';

import { Button } from '../components/common/Button.jsx';
import { FolderGit2, Users, Calendar, ExternalLink, Github } from 'lucide-react';





export const ProjectsPage = ({ navigate }) => {
  const [projects, setProjects] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  const statusFilters = ['All', 'Completed', 'In Progress', 'Planned'];

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const res = await api.getProjects(selectedStatus);
        if (res.projects) setProjects(res.projects);
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [selectedStatus]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-left space-y-2 border-b border-[#282828]/10 dark:border-[#25473C] pb-6">
        <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider">
          SOFTWARE REPOSITORY
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight">
          Member Projects
        </h1>
        <p className="text-sm text-[#282828]/70 dark:text-[#B7C9C2] max-w-2xl">
          Real tools, web applications, and embedded experiments created by student engineering teams
          in Computer Lab 3.
        </p>
      </div>

      {/* Status Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-[#EFE6DE]/60 dark:bg-[#0A211A] rounded-lg border border-[#282828]/10 dark:border-[#25473C] w-fit">
        {statusFilters.map((status) =>
        <button
          key={status}
          onClick={() => setSelectedStatus(status)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
          selectedStatus === status ?
          'bg-white dark:bg-[#102B22] text-[#282828] dark:text-[#F1F7F4] shadow-xs font-semibold' :
          'text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-[#F1F7F4]'}`
          }>
          
            {status}
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {loading ?
      <div className="py-20 text-center text-[#282828]/50 dark:text-[#7F9990] space-y-2">
          <div className="w-6 h-6 border-2 border-[#FC6454] dark:border-[#6BB89E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono">Loading project repository...</p>
        </div> :
      projects.length === 0 ?
      <div className="py-16 text-center bg-[#FAF4EE] dark:bg-[#102B22] rounded-lg border border-[#282828]/10 dark:border-[#25473C] p-8 space-y-2">
          <FolderGit2 className="w-8 h-8 text-[#282828]/40 dark:text-[#7F9990] mx-auto" />
          <h3 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4]">
            No projects found
          </h3>
          <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
            Student technology projects will appear here once published.
          </p>
        </div> :

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) =>
        <div
          key={project.id}
          className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] flex flex-col justify-between overflow-hidden hover:border-[#FC6454]/40 dark:hover:border-[#366656] transition-colors shadow-xs">
          
              <div>
                {project.imageUrl &&
            <div className="w-full h-44 bg-[#FAF4EE] dark:bg-[#071A14] border-b border-[#282828]/10 dark:border-[#25473C] overflow-hidden">
                    <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer" />
              
                  </div>
            }
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
                    <span className="font-medium text-[#FC6454] dark:text-[#6BB89E]">{project.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{project.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 dark:text-[#58B889] font-medium">{project.status}</span>
                  </div>

                  <h3 className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4] leading-snug">
                    {project.title}
                  </h3>
                  <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Technology Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.technologies.map((tech) =>
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded-sm text-[11px] font-mono bg-[#FAF4EE] dark:bg-[#15362B] text-[#282828] dark:text-[#F1F7F4] border border-[#282828]/10 dark:border-[#25473C]">
                  
                        {tech}
                      </span>
                )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#282828]/10 dark:border-[#25473C] bg-[#FAF4EE]/50 dark:bg-[#0A211A]/50 flex items-center justify-between text-xs">
                <div className="text-[#282828]/60 dark:text-[#B7C9C2] truncate max-w-[160px]">
                  Team: <strong className="text-[#282828] dark:text-[#F1F7F4] font-medium">{project.projectMembers.join(', ')}</strong>
                </div>
                {project.projectUrl &&
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#FC6454] dark:text-[#6BB89E] hover:underline font-medium">
              
                    <span>View Repo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
            }
              </div>
            </div>
        )}
        </div>
      }
    </div>);

};