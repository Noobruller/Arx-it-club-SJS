import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';

import { Button } from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { CourseMaterialVisual } from '../components/courses/CourseMaterialVisual.jsx';
import {
  ArrowLeft,
  Clock,
  User,
  ShieldCheck,
  CheckCircle,
  FileCode,
  BookOpen,
  CheckCircle2,
  AlertCircle } from
'lucide-react';






export const CourseDetailPage = ({ courseId, navigate }) => {
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.getCourseById(courseId);
        if (res.course) setCourse(res.course);
      } catch (err) {
        console.error('Failed to load course details', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!course) return;

    setEnrolling(true);
    setErrorMessage(null);
    try {
      const res = await api.enrollCourse(course.id);
      setFeedback(res.message || 'You have successfully enrolled in this course!');
    } catch (err) {
      setErrorMessage(err.message || 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-3">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-500">Loading course curriculum...</p>
      </div>);

  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#282828] dark:text-[#F1F7F4]">Course Not Found</h2>
        <p className="text-[#282828]/70 dark:text-[#B7C9C2] text-sm">The course you are looking for does not exist or was removed.</p>
        <Button variant="outline" onClick={() => navigate('/courses')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
        </Button>
      </div>);

  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/courses')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#282828]/60 hover:text-[#FC6454] dark:text-[#F1F7F4]/70 dark:hover:text-[#FD8072] cursor-pointer">
        
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Course Catalog
      </button>

      {/* Header Banner Card */}
      <div className="bg-white dark:bg-[#102B22] text-[#282828] dark:text-[#F1F7F4] rounded-xl overflow-hidden border border-[#282828]/10 dark:border-[#25473C] shadow-xs">
        <CourseMaterialVisual course={course} variant="banner" />
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#282828]/60 dark:text-[#F1F7F4]/60">
            <span className="font-semibold text-[#FC6454] dark:text-[#6BB89E]">{course.category}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">{course.status}</span>
            <span aria-hidden="true">·</span>
            <span>{course.difficulty}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#282828] dark:text-[#F1F7F4]">{course.title}</h1>
          <p className="text-xs sm:text-sm text-[#282828]/70 dark:text-[#F1F7F4]/75 max-w-3xl leading-relaxed">
            {course.longDescription || course.description}
          </p>

          {/* Quick Meta Row */}
          <div className="pt-4 border-t border-[#282828]/10 dark:border-[#25473C] flex flex-wrap items-center gap-6 text-xs text-[#282828]/60 dark:text-[#F1F7F4]/60 font-mono">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#FC6454]" />
              <span>Duration: <strong className="text-[#282828] dark:text-[#F1F7F4]">{course.duration}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#FC6454]" />
              <span>Instructor: <strong className="text-[#282828] dark:text-[#F1F7F4]">{course.instructor}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banners */}
      {feedback &&
      <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/portal/courses')}>
            Go to My Courses
          </Button>
        </div>
      }

      {errorMessage &&
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      }

      {/* Curriculum Details & Enrollment Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Syllabus */}
          {course.syllabus && course.syllabus.length > 0 &&
          <div className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] p-6 space-y-4">
              <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FC6454]" />
                Curriculum Syllabus
              </h3>
              <div className="divide-y divide-[#282828]/10 dark:divide-[#25473C]">
                {course.syllabus.map((item, idx) =>
              <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                    <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] font-bold shrink-0 mt-0.5">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span className="text-xs text-[#282828]/70 dark:text-[#F1F7F4]/75 leading-relaxed">{item}</span>
                  </div>
              )}
              </div>
            </div>
          }

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 &&
          <div className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] p-6 space-y-3">
              <h3 className="text-sm font-bold text-[#282828] dark:text-[#F1F7F4]">Prerequisites</h3>
              <ul className="space-y-1.5 text-xs text-[#282828]/60 dark:text-[#F1F7F4]/60">
                {course.prerequisites.map((p, idx) =>
              <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{p}</span>
                  </li>
              )}
              </ul>
            </div>
          }
        </div>

        {/* Enrollment Card Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-[#FAF4EE] dark:bg-[#102B22] p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono">
              Course Enrollment
            </h3>
            <p className="text-xs text-[#282828]/70 dark:text-[#F1F7F4]/70 leading-relaxed">
              Enrolling grants access to hands-on lab projects, course milestone quizzes, and eligibility
              for a verified completion certificate.
            </p>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                loading={enrolling}
                onClick={handleEnroll}>
                
                Enroll in Track
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>);

};