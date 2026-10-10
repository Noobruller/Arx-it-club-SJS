import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';

import { Button } from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { CourseMaterialVisual } from '../components/courses/CourseMaterialVisual.jsx';
import {
  Search,
  Clock,
  User,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  ArrowRight } from
'lucide-react';





export const CoursesPage = ({ navigate }) => {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const categories = [
  'All',
  'Web Development',
  'Programming',
  'Cybersecurity',
  'Robotics'];


  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      try {
        const res = await api.getCourses(selectedCategory, searchQuery);
        if (res.courses) setCourses(res.courses);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, [selectedCategory, searchQuery]);

  const handleEnroll = async (course) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (course.status === 'Coming Soon') {
      setErrorMessage('This course track is currently in preparation. Enrollment will open shortly.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    setEnrollingId(course.id);
    setErrorMessage(null);
    try {
      const res = await api.enrollCourse(course.id);
      setToastMessage(res.message || `Enrolled in ${course.title}!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Could not enroll in course.');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Toast Notification */}
      {toastMessage &&
      <div className="fixed top-20 right-4 z-50 bg-emerald-900 text-emerald-100 border border-emerald-700 px-4 py-2.5 rounded-md shadow-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
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
          ACADEMIC CURRICULUM
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight">
          Courses &amp; Training
        </h1>
        <p className="text-sm text-[#282828]/70 dark:text-[#B7C9C2] max-w-2xl">
          Structured student curriculum modules taught in Computer Lab 3 with hands-on projects,
          code reviews, and verified certificates.
        </p>
      </div>

      {/* Filters & Search: Linear / Vercel Segmented Control */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#EFE6DE]/70 dark:bg-[#102B22] rounded-lg border border-[#282828]/10 dark:border-[#25473C]">
          {categories.map((cat) =>
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            selectedCategory === cat ?
            'bg-white dark:bg-[#071A14] text-[#282828] dark:text-[#F1F7F4] shadow-xs font-semibold' :
            'text-[#282828]/70 dark:text-[#F1F7F4]/70 hover:text-[#282828] dark:hover:text-[#F7EFE8]'}`
            }>
            
              {cat}
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#282828]/40 dark:text-[#F1F7F4]/40" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-[#282828]/20 dark:border-[#25473C] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 bg-white dark:bg-[#102B22] text-[#282828] dark:text-[#F1F7F4]" />
          
        </div>
      </div>

      {/* Course List */}
      {loading ?
      <div className="py-20 text-center text-[#282828]/60 dark:text-[#F1F7F4]/60 space-y-2">
          <div className="w-6 h-6 border-2 border-[#FC6454] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-[#282828]/50 dark:text-[#F1F7F4]/50">Loading curriculum...</p>
        </div> :
      courses.length === 0 ?
      <div className="py-16 text-center bg-white/70 dark:bg-[#102B22] rounded-lg border border-[#282828]/10 dark:border-[#25473C] p-8 space-y-2">
          <GraduationCap className="w-8 h-8 text-[#282828]/40 dark:text-[#F1F7F4]/40 mx-auto" />
          <h3 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4]">
            {searchQuery || selectedCategory !== 'All' ?
          'No courses match your filter' :
          'No courses available yet'}
          </h3>
          <p className="text-xs text-[#282828]/60 dark:text-[#F1F7F4]/60">
            {searchQuery || selectedCategory !== 'All' ?
          'Try resetting your search query or selecting another category.' :
          'Courses will appear here once published by the club administrator.'}
          </p>
          {(searchQuery || selectedCategory !== 'All') &&
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedCategory('All');
            setSearchQuery('');
          }}>
          
              Clear Filters
            </Button>
        }
        </div> :

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) =>
        <div
          key={course.id}
          className="group rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] flex flex-col justify-between overflow-hidden hover:border-[#FC6454]/50 dark:hover:border-[#FC6454]/60 transition-colors shadow-xs">
          
              <div>
                <CourseMaterialVisual course={course} variant="card" />
                <div className="p-5 space-y-3">
                  {/* Unboxed clean metadata */}
                  <div className="flex items-center gap-2 text-xs text-[#282828]/60 dark:text-[#F1F7F4]/60">
                    <span className="font-medium text-[#FC6454] dark:text-[#6BB89E]">{course.category || 'Technology'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{course.duration}</span>
                    <span aria-hidden="true">·</span>
                    <span>{course.level || 'All Levels'}</span>
                  </div>

                  <h3 className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4] leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#282828]/70 dark:text-[#F1F7F4]/70 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#282828]/10 dark:border-[#25473C] bg-[#EFE6DE]/40 dark:bg-[#071A14]/50 flex items-center justify-between text-xs">
                <span className="text-[#282828]/60 dark:text-[#F1F7F4]/60">
                  By <strong className="text-[#282828] dark:text-[#F1F7F4] font-medium">{course.instructor}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs"
                onClick={() => navigate(`/courses/${course.id}`)}>
                
                    View Curriculum &rarr;
                  </Button>
                </div>
              </div>
            </div>
        )}
        </div>
      }
    </div>);

};