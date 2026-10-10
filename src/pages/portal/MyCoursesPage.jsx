import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { BookOpen, CheckCircle, ArrowRight, Play, Award } from 'lucide-react';






export const MyCoursesPage = ({
  navigate,
  openCertificateModal
}) => {
  const [enrollments, setEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [enrRes, crsRes] = await Promise.all([
        api.getMemberCourses().catch(() => ({ courses: [] })),
        api.getCourses().catch(() => ({ courses: [] }))]
        );
        if (enrRes.courses) setEnrollments(enrRes.courses);
        if (crsRes.courses) setAvailableCourses(crsRes.courses);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredEnrollments = enrollments.filter((e) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'In Progress') return e.progress > 0 && e.progress < 100;
    if (activeTab === 'Completed') return e.progress === 100 || e.status === 'Completed';
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282828]/10 dark:border-[#25473C] pb-4">
        <div>
          <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider">
            STUDENT ENROLLMENTS
          </span>
          <h1 className="text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight mt-1">My Courses</h1>
          <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
            Track your ongoing curriculum, learning progress, and milestone credentials.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/courses')}>
          
          Explore Catalog
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-[#EFE6DE]/60 dark:bg-[#0A211A] rounded-lg border border-[#282828]/10 dark:border-[#25473C] w-fit">
        {['All', 'In Progress', 'Completed', 'Available'].map((tab) =>
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
          activeTab === tab ?
          'bg-white dark:bg-[#15362B] text-[#282828] dark:text-[#F1F7F4] shadow-xs font-semibold' :
          'text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-[#F1F7F4]'}`
          }>
          
            {tab}
          </button>
        )}
      </div>

      {/* Content */}
      {loading ?
      <div className="py-16 text-center text-xs font-mono text-[#282828]/50 dark:text-[#7F9990]">Loading your courses...</div> :
      activeTab === 'Available' ? (
      /* Available Courses to enroll */
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableCourses.map((crs) =>
        <div key={crs.id} className="p-5 flex flex-col justify-between space-y-4 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] shadow-xs transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="blue" size="sm">{crs.category}</Badge>
                  <span className="text-xs font-mono text-[#282828]/50 dark:text-[#7F9990]">{crs.duration}</span>
                </div>
                <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4]">{crs.title}</h3>
                <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] line-clamp-2 leading-relaxed">{crs.description}</p>
              </div>
              <div className="pt-3 border-t border-[#282828]/10 dark:border-[#25473C] flex items-center justify-between text-xs">
                <span className="text-[#282828]/60 dark:text-[#7F9990]">Instructor: {crs.instructor}</span>
                <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/courses/${crs.id}`)}>
              
                  View Details
                </Button>
              </div>
            </div>
        )}
        </div>) :
      filteredEnrollments.length === 0 ?
      <div className="py-12 text-center bg-[#FAF4EE] dark:bg-[#102B22] rounded-lg border border-[#282828]/10 dark:border-[#25473C] p-8 space-y-3">
          <BookOpen className="w-8 h-8 text-[#282828]/40 dark:text-[#7F9990] mx-auto" />
          <h3 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4]">No courses in this section</h3>
          <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
            Browse our course catalog to find a learning track that fits your goals.
          </p>
          <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/courses')}>
          
            Explore Courses
          </Button>
        </div> : (

      /* Member Course Cards with Progress Bars */
      <div className="space-y-4">
          {filteredEnrollments.map((enr) => {
          const isCompleted = enr.progress === 100 || enr.status === 'Completed';

          return (
            <div key={enr.id} className="p-6 border border-[#282828]/10 dark:border-[#25473C] space-y-4 rounded-lg bg-white dark:bg-[#102B22] shadow-xs transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-md bg-[#EFE6DE]/60 dark:bg-[#15362B] text-[#FC6454] dark:text-[#6BB89E] border border-[#282828]/10 dark:border-[#25473C] flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4]">
                          {enr.courseTitle || enr.course?.title}
                        </h3>
                        {isCompleted ?
                      <Badge variant="emerald" size="sm">Completed</Badge> :
                      enr.progress > 0 ?
                      <Badge variant="blue" size="sm">In Progress</Badge> :

                      <Badge variant="slate" size="sm">Not Started</Badge>
                      }
                      </div>
                      <p className="text-xs font-mono text-[#282828]/50 dark:text-[#7F9990] mt-1">
                        Enrolled on {new Date(enr.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isCompleted && enr.certificateId ?
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCertificateModal(enr.certificateId)}>
                    
                        <Award className="w-3.5 h-3.5 mr-1.5 text-[#FC6454] dark:text-[#6BB89E]" />
                        View Certificate
                      </Button> :

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/courses/${enr.courseId}`)}>
                    
                        <BookOpen className="w-3.5 h-3.5 mr-1 text-[#FC6454] dark:text-[#6BB89E]" />
                        View Curriculum
                      </Button>
                  }
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2 border-t border-[#282828]/10 dark:border-[#25473C]">
                  <div className="flex justify-between text-xs font-mono text-[#282828]/70 dark:text-[#B7C9C2]">
                    <span className="text-[11px] tracking-wider text-[#282828]/50 dark:text-[#7F9990] uppercase">Course Progress</span>
                    <span className="font-bold text-[#FC6454] dark:text-[#6BB89E]">{enr.progress}%</span>
                  </div>
                  <div className="w-full bg-[#EFE6DE] dark:bg-[#15362B] h-1.5 rounded-full overflow-hidden">
                    <div
                    className={`h-full transition-all duration-500 ${
                    isCompleted ?
                    'bg-emerald-500 dark:bg-[#58B889]' :
                    enr.progress > 0 ?
                    'bg-[#FC6454] dark:bg-[#2F8068]' :
                    'bg-[#282828]/20 dark:bg-[#25473C]'}`
                    }
                    style={{ width: `${enr.progress}%` }} />
                  
                  </div>
                </div>
              </div>);

        })}
        </div>)
      }
    </div>);

};