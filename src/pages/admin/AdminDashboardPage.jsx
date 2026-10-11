import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { api } from '../../services/api.js';

import { AdminSidebar } from '../../components/admin/AdminSidebar.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { CertificateModal } from '../../components/common/CertificateModal.jsx';
import { MediaLibraryView } from '../../components/admin/media/MediaLibraryView.jsx';
import { ImageFieldInput } from '../../components/admin/media/ImageFieldInput.jsx';
import { ApplicationReviewView } from '../../components/admin/ApplicationReviewView.jsx';
import {
  ClipboardCheck,
  Users,
  BookOpen,
  GraduationCap,
  Award as AwardIcon,
  Trophy,
  FolderGit2,
  Calendar,
  Medal,
  Bell,
  Send,
  Settings,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Search,
  ExternalLink,
  Shield,
  KeyRound,
  RefreshCw,
  Download,
  CreditCard,
  Printer,
  QrCode,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Bot,
  Sun,
  Moon,
  Check,
  AlertTriangle,
  Sliders,
  Terminal,
  MessageSquare
} from
  'lucide-react';





export const AdminDashboardPage = ({ navigate }) => {
  const { member, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Data states
  const [overview, setOverview] = useState({
    totalMembers: 0,
    totalCourses: 0,
    completedCourses: 0,
    certificatesIssued: 0,
    awards: 0,
    projects: 0,
    upcomingEvents: 0
  });
  const [applicationsList, setApplicationsList] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [membersList, setMembersList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [enrollmentsList, setEnrollmentsList] = useState([]);
  const [certificatesList, setCertificatesList] = useState([]);
  const [awardsList, setAwardsList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [achievementsList, setAchievementsList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [settings, setSettings] = useState({
    clubName: 'ARX IT CLUB OF SJS',
    tagline: 'Learn. Build. Grow.',
    description: '',
    contactEmail: '',
    telegramBotUsername: 'ARXITCLUB_bot',
    telegramBotUrl: 'https://t.me/ARXITCLUB_bot',
    telegramChannelUrl: 'https://t.me/arxitclub',
    telegramChannelName: '@arxitclub',
    githubUrl: '',
    youtubeUrl: '',
    heroHeadline: '',
    heroSubheadline: '',
    meetingLocation: '',
    meetingSchedule: '',
    footerText: '',
    logoUrl: '/assets/arx-logo-light.jpg',
    compactLogoUrl: '/assets/arx-logo-light.jpg',
    logoDarkUrl: '/assets/arx-logo-dark.jpg',
    compactLogoDarkUrl: '/assets/arx-logo-dark.jpg',
    symbolUrl: '/uploads/arx-symbol-mark.png',
    heroImageUrl: '/uploads/hero-banner.svg',
    aboutImageUrl: '/uploads/about-campus.svg',
    certificateStampUrl: '/uploads/certificate-seal.svg'
  });

  // Filter/search
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilterStatus, setMemberFilterStatus] = useState('all');

  // Member Management Extended States
  const [selectedMemberDetail, setSelectedMemberDetail] = useState(






    null);
  const [selectedMemberBadge, setSelectedMemberBadge] = useState(null);
  const [resetPasswordMember, setResetPasswordMember] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [editMemberForm, setEditMemberForm] = useState({
    studentName: '',
    class: '',
    phoneNumber: '',
    telegramUsername: '',
    award: ''
  });

  const handleDownloadAwardFile = async (file) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/award-files/${file.id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download award file.');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.originalFilename || 'award-document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      showToast(`Downloaded ${file.originalFilename}`);
    } catch (err) {
      showToast(err.message || 'Error downloading award file', 'error');
    }
  };

  // Modals
  const [modalType, setModalType] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Webhook Diagnostics & Registration Lifecycle
  const [webhookInfo, setWebhookInfo] = useState(null);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookSyncing, setWebhookSyncing] = useState(false);
  const [webhookSyncMessage, setWebhookSyncMessage] = useState(null);

  // Telegram Bot Operations State
  const [botStatus, setBotStatus] = useState(null);
  const [botStatusLoading, setBotStatusLoading] = useState(false);
  const [botTokenInput, setBotTokenInput] = useState('');
  const [showBotToken, setShowBotToken] = useState(false);
  const [savingBotToken, setSavingBotToken] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(




    null);
  const [botCommandsList, setBotCommandsList] = useState([]);
  const [botCommandsLoading, setBotCommandsLoading] = useState(false);
  const [syncingCommands, setSyncingCommands] = useState(false);
  const [botContentSettings, setBotContentSettings] = useState(null);
  const [savingBotContent, setSavingBotContent] = useState(false);
  const [editingCommand, setEditingCommand] = useState(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [courseError, setCourseError] = useState(null);

  // Forms
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    longDescription: '',
    category: 'Web Development',
    difficulty: 'Beginner',
    duration: '4 weeks',
    instructor: 'IT Club Lead',
    status: 'Available',
    topics: ['Basics', 'Practical Projects'],
    learningObjectives: ['Gain core fluency'],
    requirements: ['None'],
    certificateInfo: 'Verified Certificate awarded upon completion.',
    thumbnailUrl: '',
    bannerUrl: '',
    thumbnailMediaId: '',
    bannerMediaId: '',
    isPublished: true
  });

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    technologies: ['React', 'TypeScript'],
    projectMembers: ['IT Club Members'],
    status: 'In Progress',
    category: 'Web App',
    date: '2026',
    imageUrl: '',
    mediaId: '',
    galleryImages: [],
    isPublished: true
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    date: '2026-05-15',
    time: '2:00 PM - 4:00 PM',
    location: 'Computer Lab 3, Block B',
    locationType: 'Onsite',
    description: '',
    organizer: 'IT Club Tech Committee',
    seatsAvailable: 30,
    status: 'Upcoming',
    imageUrl: '',
    coverImageUrl: '',
    mediaId: '',
    galleryImages: [],
    isPublished: true
  });

  const [certForm, setCertForm] = useState(




    {
      memberId: '',
      courseName: '',
      issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      certificateStampUrl: ''
    });

  const [awardForm, setAwardForm] = useState({
    memberId: '',
    title: '',
    description: '',
    category: 'Honor',
    badge: 'trophy'
  });

  const [achievementForm, setAchievementForm] = useState({
    title: '',
    category: 'club',
    recipient: '',
    description: '',
    date: '2026',
    rank: 'Winner',
    imageUrl: '',
    mediaId: '',
    isPublished: true
  });

  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  const showToast = (message, type = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [
        overviewRes,
        applicationsRes,
        membersRes,
        coursesRes,
        enrollmentsRes,
        certsRes,
        awardsRes,
        projectsRes,
        eventsRes,
        achRes,
        annRes,
        settingsRes] =
        await Promise.all([
          api.getAdminOverview().catch(() => ({ stats: overview })),
          api.getAdminApplications('all').catch(() => ({ applications: [] })),
          api.getAdminMembers().catch(() => ({ members: [] })),
          api.getAdminCourses().catch(() => ({ courses: [] })),
          api.getAdminEnrollments().catch(() => ({ enrollments: [] })),
          api.getAdminCertificates().catch(() => ({ certificates: [] })),
          api.getAdminAwards().catch(() => ({ awards: [] })),
          api.getAdminProjects().catch(() => ({ projects: [] })),
          api.getAdminEvents().catch(() => ({ events: [] })),
          api.getAdminAchievements().catch(() => ({ achievements: [] })),
          api.getAdminAnnouncements().catch(() => ({ announcements: [] })),
          api.getAdminSettings().catch(() => ({ settings }))]
        );

      if (overviewRes.stats) setOverview(overviewRes.stats);
      if (applicationsRes.applications) setApplicationsList(applicationsRes.applications);
      if (membersRes.members) setMembersList(membersRes.members);
      if (coursesRes.courses) setCoursesList(coursesRes.courses);
      if (enrollmentsRes.enrollments) setEnrollmentsList(enrollmentsRes.enrollments);
      if (certsRes.certificates) setCertificatesList(certsRes.certificates);
      if (awardsRes.awards) setAwardsList(awardsRes.awards);
      if (projectsRes.projects) setProjectsList(projectsRes.projects);
      if (eventsRes.events) setEventsList(eventsRes.events);
      if (achRes.achievements) setAchievementsList(achRes.achievements);
      if (annRes.announcements) setAnnouncementsList(annRes.announcements);
      if (settingsRes.settings) setSettings(settingsRes.settings);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Handlers for Student Applications Review
  const handleApproveApplication = async (id) => {
    const res = await api.approveAdminApplication(id);
    setApplicationsList((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'approved', isApproved: true } : app))
    );
    api.getAdminMembers().then((res) => { if (res.members) setMembersList(res.members); }).catch(() => { });
    api.getAdminOverview().then((res) => { if (res.stats) setOverview(res.stats); }).catch(() => { });
    return res;
  };

  const handleRejectApplication = async (id, rejectionReason) => {
    const res = await api.rejectAdminApplication(id, rejectionReason);
    setApplicationsList((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'rejected', isApproved: false, rejectionReason } : app))
    );
    api.getAdminOverview().then((res) => { if (res.stats) setOverview(res.stats); }).catch(() => { });
    return res;
  };

  const handleRefreshApplications = async () => {
    setLoadingApplications(true);
    try {
      const res = await api.getAdminApplications('all');
      if (res.applications) setApplicationsList(res.applications);
      const ovRes = await api.getAdminOverview();
      if (ovRes.stats) setOverview(ovRes.stats);
    } catch {
      showToast('Failed to refresh applications', 'error');
    } finally {
      setLoadingApplications(false);
    }
  };

  // Handlers for Courses
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setCourseError(null);

    const titleTrimmed = (courseForm.title || '').trim();
    if (!titleTrimmed) {
      setCourseError('Course title is required.');
      return;
    }

    // Auto-generate description if user leaves it blank so submission is never blocked
    const descriptionTrimmed = (courseForm.description || '').trim() ||
      `${titleTrimmed} - Comprehensive curriculum and hands-on training offered by the IT Club.`;

    const payload = {
      ...courseForm,
      title: titleTrimmed,
      description: descriptionTrimmed,
      longDescription: (courseForm.longDescription || '').trim() || descriptionTrimmed
    };

    setIsSavingCourse(true);
    try {
      if (activeItem?.id) {
        const res = await api.updateAdminCourse(activeItem.id, payload);
        const updatedCourse = res?.course || { ...activeItem, ...payload };
        setCoursesList((prev) => prev.map((c) => (c.id === activeItem.id ? updatedCourse : c)));
        showToast('Course updated successfully!');
      } else {
        const res = await api.createAdminCourse(payload);
        const newCourse = res?.course || { ...payload, id: `crs_${Date.now()}` };
        setCoursesList((prev) => [newCourse, ...prev.filter((c) => c.id !== newCourse.id)]);
        showToast('Course created successfully!');
      }
      setModalType(null);
      setCourseError(null);
      // Refresh overview stats asynchronously without overwriting coursesList
      api.getAdminOverview().then((ovRes) => {
        if (ovRes?.stats) setOverview(ovRes.stats);
      }).catch(() => {});
    } catch (err) {
      const msg = err.message || 'Error saving course. Please check all required fields.';
      setCourseError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.deleteAdminCourse(id);
      showToast('Course deleted.');
      setCoursesList((prev) => prev.filter((c) => c.id !== id));
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Projects
  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      if (activeItem?.id) {
        await api.updateAdminProject(activeItem.id, projectForm);
        showToast('Project updated!');
      } else {
        await api.createAdminProject(projectForm);
        showToast('Project published!');
      }
      setModalType(null);
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.deleteAdminProject(id);
      showToast('Project deleted.');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Events
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      if (activeItem?.id) {
        await api.updateAdminEvent(activeItem.id, eventForm);
        showToast('Event updated!');
      } else {
        await api.createAdminEvent(eventForm);
        showToast('Event created!');
      }
      setModalType(null);
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.deleteAdminEvent(id);
      showToast('Event deleted.');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Certificates
  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    if (!certForm.memberId || !certForm.courseName) {
      showToast('Please select a student and enter course title.', 'error');
      return;
    }
    try {
      const res = await api.issueAdminCertificate({
        memberId: certForm.memberId,
        courseName: certForm.courseName,
        issueDate: certForm.issueDate
      });
      showToast(`Certificate issued! ID: ${res.certificate.certificateId}`);
      setModalType(null);
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleCertificate = async (id) => {
    try {
      await api.toggleAdminCertificate(id);
      showToast('Certificate status toggled.');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Awards
  const handleCreateAward = async (e) => {
    e.preventDefault();
    if (!awardForm.memberId || !awardForm.title) return;
    try {
      await api.createAdminAward(awardForm);
      showToast('Award assigned to student!');
      setModalType(null);
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAward = async (id) => {
    if (!confirm('Delete this award?')) return;
    try {
      await api.deleteAdminAward(id);
      showToast('Award removed.');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Achievements
  const handleSaveAchievement = async (e) => {
    e.preventDefault();
    try {
      if (activeItem?.id) {
        await api.updateAdminAchievement(activeItem.id, achievementForm);
        showToast('Achievement updated!');
      } else {
        await api.createAdminAchievement(achievementForm);
        showToast('Achievement published!');
      }
      setModalType(null);
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAchievement = async (id) => {
    if (!confirm('Delete achievement?')) return;
    try {
      await api.deleteAdminAchievement(id);
      showToast('Achievement deleted.');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Member Management
  const handleOpenMemberDetail = async (id) => {
    try {
      const res = await api.getAdminMemberDetail(id);
      setSelectedMemberDetail(res);
      setModalType('memberDetail');
    } catch (err) {
      showToast(err.message || 'Failed to load member profile', 'error');
    }
  };

  const handleOpenEditMember = (m) => {
    setEditMemberForm({
      studentName: m.studentName,
      class: m.class,
      phoneNumber: m.phoneNumber,
      telegramUsername: m.telegramUsername,
      award: m.award
    });
    setActiveItem(m);
    setModalType('editMember');
  };

  const handleSaveMemberEdit = async (e) => {
    e.preventDefault();
    if (!activeItem?.id) return;
    try {
      await api.updateAdminMember(activeItem.id, editMemberForm);
      showToast('Member profile updated successfully!');
      setModalType(null);
      loadAllAdminData();
    } catch (err) {
      showToast(err.message || 'Error updating member', 'error');
    }
  };

  const handleOpenResetPassword = (m) => {
    setResetPasswordMember(m);
    setNewPasswordInput('');
    setModalType('resetMemberPassword');
  };

  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPasswordMember?.id) return;
    if (newPasswordInput.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    try {
      await api.resetAdminMemberPassword(resetPasswordMember.id, newPasswordInput);
      showToast(`Password for ${resetPasswordMember.studentName} has been reset.`);
      setModalType(null);
    } catch (err) {
      showToast(err.message || 'Error resetting password', 'error');
    }
  };

  const handleOpenBadge = (m) => {
    setSelectedMemberBadge(m);
    setModalType('memberBadge');
  };

  const handleExportMembersCSV = () => {
    if (membersList.length === 0) {
      showToast('No members to export.', 'error');
      return;
    }
    const headers = ['Member ID', 'Student Name', 'Class', 'Phone', 'Telegram', 'Role', 'Status', 'Registered At'];
    const rows = membersList.map((m) => [
      m.memberId,
      `"${m.studentName.replace(/"/g, '""')}"`,
      m.class,
      m.phoneNumber,
      m.telegramUsername,
      m.role,
      m.status,
      m.createdAt]
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `it_club_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Member roster exported successfully!');
  };

  const handleToggleMember = async (id) => {
    try {
      await api.toggleAdminMemberStatus(id);
      showToast('Member status changed.');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteMember = async (id) => {
    if (!confirm('Delete this member account permanently? This cannot be undone.')) return;
    try {
      await api.deleteAdminMember(id);
      showToast('Member account deleted.');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Settings & Telegram
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.updateAdminSettings(settings);
      showToast('Settings saved successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const loadWebhookInfo = async () => {
    setWebhookLoading(true);
    try {
      const res = await api.getTelegramWebhookInfo();
      setWebhookInfo(res);
    } catch {

      // fallback
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleSyncWebhook = async () => {
    setWebhookSyncing(true);
    setWebhookSyncMessage(null);
    try {
      const res = await api.syncTelegramWebhook();
      if (res.success) {
        setWebhookSyncMessage('✅ Webhook successfully registered with Telegram Bot API!');
        showToast('Webhook registered with Telegram!');
        await loadWebhookInfo();
      } else {
        setWebhookSyncMessage(
          `⚠️ Webhook registration failed: ${res.error || res.telegramResponse?.description || 'Check bot token.'}`
        );
        showToast('Failed to register webhook', 'error');
      }
    } catch (err) {
      setWebhookSyncMessage(`❌ Error: ${err.message || 'Failed to sync webhook'}`);
      showToast(err.message, 'error');
    } finally {
      setWebhookSyncing(false);
    }
  };

  const handleSetRegistrationStatus = async (status) => {
    try {
      const res = await api.setRegistrationStatus(status, settings.registrationClosedMessage);
      if (res.success && res.settings) {
        setSettings(res.settings);
        showToast(`Registration lifecycle changed to ${res.registrationStatus}!`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update registration status', 'error');
    }
  };

  const handleToggleRegistration = async () => {
    try {
      const res = await api.toggleRegistrationStatus({ closedMessage: settings.registrationClosedMessage });
      if (res.success && res.settings) {
        setSettings(res.settings);
        showToast(`Registration lifecycle changed to ${res.registrationStatus}!`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle registration', 'error');
    }
  };

  const handleToggleCourseRegistrationAvailability = async (course) => {
    try {
      const newAvailability = !(course.isAvailableForRegistration !== false);
      await api.updateAdminCourse(course.id, { isAvailableForRegistration: newAvailability });
      showToast(`Course "${course.title}" registration selection is now ${newAvailability ? 'OPEN' : 'CLOSED'}`);
      loadAllAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to update course registration status', 'error');
    }
  };

  const loadTelegramBotData = async () => {
    setBotStatusLoading(true);
    try {
      const [statusRes, commandsRes, contentRes] = await Promise.all([
        api.getAdminTelegramStatus().catch(() => ({ status: null })),
        api.getAdminBotCommands().catch(() => ({ commands: [] })),
        api.getAdminBotContent().catch(() => ({ content: null }))]
      );
      if (statusRes.status) setBotStatus(statusRes.status);
      if (commandsRes.commands) setBotCommandsList(commandsRes.commands);
      if (contentRes.content) setBotContentSettings(contentRes.content);
    } catch (err) {
      console.error('Failed to load telegram bot data', err);
    } finally {
      setBotStatusLoading(false);
    }
  };

  const handleSaveBotToken = async (e) => {
    e.preventDefault();
    const token = botTokenInput.trim();
    if (!token) {
      showToast('Please enter a valid Telegram bot token.', 'error');
      return;
    }
    setSavingBotToken(true);
    try {
      const res = await api.updateAdminTelegramToken(token);
      if (res.success) {
        showToast(res.message || 'Telegram Bot connected successfully!');
        setBotTokenInput('');
        await loadTelegramBotData();
        await loadWebhookInfo();
      } else {
        showToast(res.error || 'Failed to authenticate bot token', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update bot token', 'error');
    } finally {
      setSavingBotToken(false);
    }
  };

  const handleTestBotConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await api.testAdminTelegramConnection();
      setTestResult(res);
      if (res.success) {
        showToast('All Telegram connection checks passed!');
        await loadTelegramBotData();
      } else {
        showToast(res.error || 'Telegram connection test failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to run connection tests', 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleToggleCommand = async (cmd, field) => {
    const newVal = !cmd[field];
    try {
      const res = await api.updateAdminBotCommand(cmd.command, { [field]: newVal });
      if (res.success) {
        setBotCommandsList((prev) =>
          prev.map((c) => c.command === cmd.command ? { ...c, [field]: newVal } : c)
        );
        showToast(`Updated ${cmd.command} ${field === 'isEnabled' ? 'status' : 'menu visibility'}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update command', 'error');
    }
  };

  const handleSaveCustomReply = async (command, customReply) => {
    try {
      const res = await api.updateAdminBotCommand(command, { customReply: customReply.trim() || undefined });
      if (res.success) {
        setBotCommandsList((prev) =>
          prev.map((c) => c.command === command ? { ...c, customReply: customReply.trim() || undefined } : c)
        );
        setEditingCommand(null);
        showToast(`Custom reply for ${command} saved!`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to save custom reply', 'error');
    }
  };

  const handleSyncCommands = async () => {
    setSyncingCommands(true);
    try {
      const res = await api.syncAdminBotCommands();
      if (res.success) {
        showToast(res.message || 'Commands successfully synced to Telegram menu!');
        await loadTelegramBotData();
      } else {
        showToast(res.message || 'Failed to sync commands', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error syncing commands', 'error');
    } finally {
      setSyncingCommands(false);
    }
  };

  const handleSaveBotContent = async (e) => {
    e.preventDefault();
    if (!botContentSettings) return;
    setSavingBotContent(true);
    try {
      const res = await api.updateAdminBotContent(botContentSettings);
      if (res.success) {
        showToast('Bot message templates updated successfully!');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update bot templates', 'error');
    } finally {
      setSavingBotContent(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'telegram') {
      loadWebhookInfo();
      loadTelegramBotData();
    }
  }, [activeTab]);

  const handleChangeAdminPassword = async (e) => {
    e.preventDefault();
    if (adminPasswordInput.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    try {
      await api.changeAdminPassword(adminPasswordInput);
      showToast('Administrator password updated!');
      setAdminPasswordInput('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F7EFE8] dark:bg-[#071A14] text-[#282828] dark:text-[#F1F7F4] transition-colors duration-200">
      {/* Toast */}
      {feedback &&
        <div
          className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-md shadow-xl flex items-center gap-2 text-xs font-mono uppercase tracking-wider border animate-in fade-in ${feedback.type === 'success' ?
              'bg-emerald-900 text-emerald-100 border-emerald-700' :
              'bg-rose-900 text-rose-100 border-rose-700'}`
          }>

          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-300" /> : <XCircle className="w-4 h-4 text-rose-300" />}
          <span>{feedback.message}</span>
        </div>
      }

      {/* Admin Sidebar */}
      <AdminSidebar
        currentTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        navigate={navigate}
        pendingApplicationsCount={applicationsList.filter((a) => a.status === 'pending').length} />


      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 bg-[#F7EFE8] dark:bg-[#071A14] text-[#282828] dark:text-[#F1F7F4] overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282828]/10 dark:border-[#25473C] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-tight font-sans">
                  {activeTab === 'overview' ? 'Dashboard Overview' : activeTab.replace('-', ' ')}
                </h1>
                <Badge variant="blue" size="sm">Admin Role</Badge>
              </div>
              <p className="text-xs font-mono text-[#282828]/60 dark:text-[#B7C9C2] mt-1">
                Real-time club control, content management &amp; student records.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#282828]/15 dark:border-[#25473C] bg-white dark:bg-[#102B22] hover:bg-[#EFE6DE] dark:hover:bg-[#15362B] text-xs font-medium text-[#282828] dark:text-[#F1F7F4] transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}>

                {theme === 'dark' ?
                  <>
                    <Sun className="w-3.5 h-3.5 text-[#6BB89E]" />
                    <span>Light</span>
                  </> :

                  <>
                    <Moon className="w-3.5 h-3.5 text-[#282828]" />
                    <span>Dark</span>
                  </>
                }
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadAllAdminData}>

                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
              </Button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' &&
            <div className="space-y-6">
              {/* Pending Applications Alert Banner */}
              {applicationsList.filter((a) => a.status === 'pending').length > 0 && (
                <div
                  onClick={() => setActiveTab('applications')}
                  className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                        {applicationsList.filter((a) => a.status === 'pending').length} Pending Application{applicationsList.filter((a) => a.status === 'pending').length > 1 ? 's' : ''} Awaiting Review
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        New students have registered and require manual administrator review before they can access the portal.
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-semibold shrink-0">
                    Review Applications &rarr;
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] space-y-1 rounded-lg shadow-xs transition-colors">
                  <div className="flex items-center justify-between text-[#FC6454] dark:text-[#6BB89E]">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#282828]/50 dark:text-[#7F9990]">MEMBERS</span>
                  </div>
                  <p className="text-3xl font-bold font-mono text-[#282828] dark:text-[#F1F7F4] tabular-nums">{overview.totalMembers}</p>
                  <p className="text-xs font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#B7C9C2]">Total Members</p>
                </div>

                <div className="p-5 bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] space-y-1 rounded-lg shadow-xs transition-colors">
                  <div className="flex items-center justify-between text-[#FC6454] dark:text-[#6BB89E]">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#282828]/50 dark:text-[#7F9990]">TRACKS</span>
                  </div>
                  <p className="text-3xl font-bold font-mono text-[#282828] dark:text-[#F1F7F4] tabular-nums">{overview.totalCourses}</p>
                  <p className="text-xs font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#B7C9C2]">Total Courses</p>
                </div>

                <div className="p-5 bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] space-y-1 rounded-lg shadow-xs transition-colors">
                  <div className="flex items-center justify-between text-emerald-600 dark:text-[#58B889]">
                    <AwardIcon className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#282828]/50 dark:text-[#7F9990]">CREDENTIALS</span>
                  </div>
                  <p className="text-3xl font-bold font-mono text-emerald-600 dark:text-[#58B889] tabular-nums">{overview.certificatesIssued}</p>
                  <p className="text-xs font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#B7C9C2]">Certificates Issued</p>
                </div>

                <div className="p-5 bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] space-y-1 rounded-lg shadow-xs transition-colors">
                  <div className="flex items-center justify-between text-amber-600 dark:text-[#D6A84F]">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#282828]/50 dark:text-[#7F9990]">SESSIONS</span>
                  </div>
                  <p className="text-3xl font-bold font-mono text-[#282828] dark:text-[#F1F7F4] tabular-nums">{overview.upcomingEvents}</p>
                  <p className="text-xs font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#B7C9C2]">Upcoming Events</p>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-[#15362B] border border-[#282828]/10 dark:border-[#25473C] text-center rounded-lg shadow-xs transition-colors">
                  <p className="text-xl font-bold font-mono text-[#FC6454] dark:text-[#6BB89E] tabular-nums">{overview.completedCourses}</p>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#B7C9C2] mt-1">Completed Enrollments</p>
                </div>
                <div className="p-4 bg-white dark:bg-[#15362B] border border-[#282828]/10 dark:border-[#25473C] text-center rounded-lg shadow-xs transition-colors">
                  <p className="text-xl font-bold font-mono text-[#FC6454] dark:text-[#6BB89E] tabular-nums">{overview.projects}</p>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#B7C9C2] mt-1">Club Projects</p>
                </div>
                <div className="p-4 bg-white dark:bg-[#15362B] border border-[#282828]/10 dark:border-[#25473C] text-center rounded-lg shadow-xs transition-colors">
                  <p className="text-xl font-bold font-mono text-amber-600 dark:text-[#D6A84F] tabular-nums">{overview.awards}</p>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[#282828]/60 dark:text-[#B7C9C2] mt-1">Assigned Awards</p>
                </div>
              </div>

              {/* REGISTRATION LIFECYCLE MANAGEMENT CARD (Priority A & Requirement 13) */}
              <div className="p-6 bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] space-y-4 rounded-lg shadow-xs transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#282828]/10 dark:border-[#25473C] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#FC6454] dark:text-[#6BB89E]" />
                    <div>
                      <h3 className="text-sm font-bold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono">
                        Student Registration Lifecycle
                      </h3>
                      <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] font-sans">
                        Authoritative backend control over member registration availability.
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={settings.registrationStatus === 'CLOSED' ? 'rose' : 'emerald'}
                    size="md">

                    {settings.registrationStatus === 'CLOSED' ? 'Registration Closed' : 'Registration Open'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] font-sans space-y-2 leading-relaxed">
                    <p>
                      When <strong>Registration is Closed</strong>, public &ldquo;Join Club&rdquo;
                    </p>
                    <div className="font-mono text-[11px] text-[#282828]/60 dark:text-[#7F9990]">
                      Authoritative DB State: <strong className={settings.registrationStatus === 'CLOSED' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-[#58B889]'}>{settings.registrationStatus || 'OPEN'}</strong>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 justify-end">
                    <Button
                      type="button"
                      variant={settings.registrationStatus === 'CLOSED' ? 'primary' : 'outline'}
                      size="md"
                      onClick={() => handleSetRegistrationStatus('OPEN')}
                      className="w-full sm:w-auto font-mono text-xs">

                      Open Registration
                    </Button>
                    <Button
                      type="button"
                      variant={settings.registrationStatus === 'CLOSED' ? 'outline' : 'danger'}
                      size="md"
                      onClick={() => handleSetRegistrationStatus('CLOSED')}
                      className="w-full sm:w-auto font-mono text-xs">

                      Close Registration
                    </Button>
                  </div>
                </div>
              </div>

              {/* Welcome / Guidance Note */}
              <div className="p-6 bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] space-y-2 rounded-lg shadow-xs transition-colors">
                <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
                  Live Operational State (Real Records)
                </h3>
                <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed font-sans">
                  All metrics in this dashboard reflect actual database records. Use the sidebar to create
                  courses, post projects, schedule events, publish achievements, and issue verified credentials to students.
                </p>
              </div>
            </div>
          }

          {/* TAB: APPLICATION REVIEW */}
          {activeTab === 'applications' && (
            <ApplicationReviewView
              applications={applicationsList}
              loading={loadingApplications}
              onApprove={handleApproveApplication}
              onReject={handleRejectApplication}
              onRefresh={handleRefreshApplications}
              showToast={showToast}
            />
          )}

          {/* TAB: MEDIA LIBRARY */}
          {activeTab === 'media' &&
            <MediaLibraryView onNotify={showToast} />
          }

          {/* TAB 2: MEMBERS */}
          {activeTab === 'members' &&
            <div className="space-y-4">
              {/* Quick Member Stats Chips */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] flex items-center justify-between shadow-xs">
                  <div>
                    <p className="text-[10px] text-[#282828]/60 dark:text-[#B7C9C2] uppercase font-bold tracking-wider">Total Registered</p>
                    <p className="text-xl font-mono font-bold text-[#282828] dark:text-[#F1F7F4]">
                      {membersList.filter((m) => m.role === 'member').length}
                    </p>
                  </div>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] flex items-center justify-between shadow-xs">
                  <div>
                    <p className="text-[10px] text-[#282828]/60 dark:text-[#B7C9C2] uppercase font-bold tracking-wider">Active Students</p>
                    <p className="text-xl font-mono font-bold text-emerald-400">
                      {membersList.filter((m) => m.role === 'member' && m.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] flex items-center justify-between shadow-xs">
                  <div>
                    <p className="text-[10px] text-[#282828]/60 dark:text-[#B7C9C2] uppercase font-bold tracking-wider">Suspended Accounts</p>
                    <p className="text-xl font-mono font-bold text-rose-400">
                      {membersList.filter((m) => m.role === 'member' && m.status === 'suspended').length}
                    </p>
                  </div>
                  <XCircle className="w-5 h-5 text-rose-400" />
                </div>
              </div>

              {/* Search & Export Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search member name, ID, class..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/20 dark:border-[#294B40] text-xs text-[#282828] dark:text-[#F1F7F4] focus:outline-none focus:ring-1 focus:ring-blue-500" />

                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <select
                    value={memberFilterStatus}
                    onChange={(e) => setMemberFilterStatus(e.target.value)}
                    className="bg-white dark:bg-[#0C241C] border border-[#282828]/20 dark:border-[#294B40] text-xs text-[#282828] dark:text-[#F1F7F4] rounded-lg px-3 py-1.5">

                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] hover:bg-[#EFE6DE] dark:hover:bg-[#15362B]"
                    onClick={handleExportMembersCSV}>

                    <Download className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Export CSV
                  </Button>
                </div>
              </div>

              {membersList.length === 0 ?
                <Card className="p-12 text-center bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828]/60 dark:text-[#B7C9C2]">
                  <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-sm">No members registered yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Students will appear here once they register on the public site.</p>
                </Card> :

                <div className="overflow-x-auto rounded-xl border border-[#282828]/10 dark:border-[#25473C]">
                  <table className="w-full text-left text-xs text-[#282828] dark:text-[#F1F7F4] bg-white dark:bg-[#102B22]">
                    <thead className="bg-[#FAF4EE] dark:bg-[#0A211A] text-[#282828]/70 dark:text-[#B7C9C2] border-b border-[#282828]/10 dark:border-[#25473C] uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-3">Member ID</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Class</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Telegram</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#282828]/10 dark:divide-[#25473C] font-sans">
                      {membersList.
                        filter((m) => {
                          if (memberFilterStatus !== 'all' && m.status !== memberFilterStatus) return false;
                          if (!memberSearch) return true;
                          const s = memberSearch.toLowerCase();
                          return (
                            m.studentName.toLowerCase().includes(s) ||
                            m.memberId.toLowerCase().includes(s) ||
                            m.class.toLowerCase().includes(s));

                        }).
                        map((m) =>
                          <tr key={m.id} className="hover:bg-[#FAF4EE]/70 dark:hover:bg-[#15362B]">
                            <td className="p-3 font-mono font-bold text-[#FC6454] dark:text-[#6BB89E]">{m.memberId}</td>
                            <td className="p-3">
                              <div className="font-semibold text-[#282828] dark:text-[#F1F7F4] flex items-center gap-1.5 flex-wrap">
                                <span>{m.studentName}</span>
                                {m.awardFiles && m.awardFiles.length > 0 &&
                                  <span
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
                                    title={`${m.awardFiles.length} award document(s) uploaded`}>

                                    <FileText className="w-2.5 h-2.5" />
                                    {m.awardFiles.length} file{m.awardFiles.length > 1 ? 's' : ''}
                                  </span>
                                }
                              </div>
                            </td>
                            <td className="p-3 text-[#282828] dark:text-[#F1F7F4]">{m.class}</td>
                            <td className="p-3 font-mono text-[11px] text-[#282828]/60 dark:text-[#B7C9C2]">{m.phoneNumber}</td>
                            <td className="p-3 font-mono">
                              <span className="text-[#FC6454] dark:text-[#6BB89E] block text-xs font-semibold">{m.telegramUsername}</span>
                              <span className="text-[10px] text-[#282828]/50 dark:text-[#7F9990] mt-0.5 block">
                                {m.telegramActivated && m.telegramUserId ?
                                  <span className="text-emerald-600 dark:text-[#58B889]">ID: {m.telegramUserId}</span> :

                                  <span className="text-[#282828]/40 dark:text-[#7F9990]">Unlinked</span>
                                }
                              </span>
                            </td>
                            <td className="p-3">
                              <Badge variant={m.role === 'admin' ? 'purple' : 'slate'} size="sm">
                                {m.role}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant={m.status === 'active' ? 'emerald' : 'rose'} size="sm">
                                {m.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-right space-x-1 whitespace-nowrap">
                              {m.role !== 'admin' ?
                                <>
                                  <button
                                    onClick={() => handleOpenMemberDetail(m.id)}
                                    className="p-1.5 hover:text-[#FC6454] dark:hover:text-[#6BB89E] text-[#282828]/60 dark:text-[#B7C9C2] rounded hover:bg-[#EFE6DE] dark:hover:bg-[#15362B]"
                                    title="View Full Profile & Enrollments">

                                    <Eye className="w-3.5 h-3.5 inline" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditMember(m)}
                                    className="p-1.5 hover:text-blue-500 text-[#282828]/60 dark:text-[#B7C9C2] rounded hover:bg-[#EFE6DE] dark:hover:bg-[#15362B]"
                                    title="Edit Member Information">

                                    <Edit className="w-3.5 h-3.5 inline" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenResetPassword(m)}
                                    className="p-1.5 hover:text-amber-500 text-[#282828]/60 dark:text-[#B7C9C2] rounded hover:bg-[#EFE6DE] dark:hover:bg-[#15362B]"
                                    title="Reset Password">

                                    <KeyRound className="w-3.5 h-3.5 inline" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenBadge(m)}
                                    className="p-1.5 hover:text-purple-500 text-[#282828]/60 dark:text-[#B7C9C2] rounded hover:bg-[#EFE6DE] dark:hover:bg-[#15362B]"
                                    title="Generate Printable ID Card Badge">

                                    <CreditCard className="w-3.5 h-3.5 inline" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleMember(m.id)}
                                    className="p-1.5 hover:text-amber-500 text-[#282828]/60 dark:text-[#B7C9C2] rounded hover:bg-[#EFE6DE] dark:hover:bg-[#15362B]"
                                    title={m.status === 'active' ? 'Suspend Account' : 'Activate Account'}>

                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EFE6DE] dark:bg-[#15362B] text-[#282828] dark:text-[#F1F7F4]">
                                      {m.status === 'active' ? 'Suspend' : 'Activate'}
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMember(m.id)}
                                    className="p-1.5 text-rose-500 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                    title="Delete Member">

                                    <Trash2 className="w-3.5 h-3.5 inline" />
                                  </button>
                                </> :

                                <span className="text-[10px] text-[#282828]/40 dark:text-[#7F9990] font-mono">Protected Admin</span>
                              }
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              }
            </div>
          }

          {/* TAB 3: COURSES */}
          {activeTab === 'courses' &&
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">Total Courses: {coursesList.length}</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setActiveItem(null);
                    setCourseError(null);
                    setCourseForm({
                      title: '',
                      description: '',
                      longDescription: '',
                      category: 'Web Development',
                      difficulty: 'Beginner',
                      duration: '4 weeks',
                      instructor: 'IT Club Instructor',
                      status: 'Available',
                      topics: ['Introduction to Core Concepts', 'Hands-on Practice'],
                      learningObjectives: ['Build functional projects'],
                      requirements: ['Curiosity to learn'],
                      certificateInfo: 'Verified Certificate awarded upon completion.',
                      thumbnailUrl: '',
                      bannerUrl: '',
                      thumbnailMediaId: '',
                      bannerMediaId: '',
                      isPublished: true,
                      isAvailableForRegistration: true
                    });
                    setModalType('course');
                  }}>

                  <Plus className="w-3.5 h-3.5 mr-1" /> Add New Course
                </Button>
              </div>

              {coursesList.length === 0 ?
                <Card className="p-12 text-center bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828]/60 dark:text-[#B7C9C2]">
                  <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-sm">No courses have been added yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Click &ldquo;Add New Course&rdquo; above to publish your first course.</p>
                </Card> :

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coursesList.map((c) =>
                    <Card key={c.id} className="p-5 bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] space-y-3">
                      {c.thumbnailUrl &&
                        <div className="w-full h-32 rounded-lg overflow-hidden bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C]">
                          <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                        </div>
                      }
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="blue" size="sm">{c.category}</Badge>
                          <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4] mt-1">{c.title}</h3>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={c.status === 'Available' ? 'emerald' : 'slate'} size="sm">
                            {c.status}
                          </Badge>
                          <Badge
                            variant={c.isAvailableForRegistration !== false ? 'emerald' : 'amber'}
                            size="sm">

                            {c.isAvailableForRegistration !== false ? 'Reg: Open' : 'Reg: Closed'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-[#282828]/10 dark:border-[#25473C]">
                        <span>Instructor: {c.instructor}</span>
                        <span>{c.duration}</span>
                      </div>
                      <div className="pt-2 flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline-dark"
                          size="sm"
                          className="text-xs py-1"
                          onClick={() => handleToggleCourseRegistrationAvailability(c)}
                          title="Toggle whether new applicants can select this course during registration">

                          {c.isAvailableForRegistration !== false ? 'Close for Reg' : 'Open for Reg'}
                        </Button>
                        <Button
                          variant="outline-dark"
                          size="sm"
                          className="text-xs py-1"
                          onClick={() => {
                            setActiveItem(c);
                            setCourseError(null);
                            setCourseForm(c);
                            setModalType('course');
                          }}>

                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="text-xs py-1"
                          onClick={() => handleDeleteCourse(c.id)}>

                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              }
            </div>
          }

          {/* TAB 4: ENROLLMENTS */}
          {activeTab === 'enrollments' &&
            <div className="space-y-4">
              {enrollmentsList.length === 0 ?
                <Card className="p-12 text-center bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828]/60 dark:text-[#B7C9C2]">
                  <GraduationCap className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-sm">No student enrollments yet.</p>
                </Card> :

                <div className="overflow-x-auto rounded-xl border border-[#282828]/10 dark:border-[#25473C]">
                  <table className="w-full text-left text-xs text-[#282828] dark:text-[#F1F7F4] bg-white dark:bg-[#102B22]">
                    <thead className="bg-[#FAF4EE] dark:bg-[#0A211A] text-[#282828]/70 dark:text-[#B7C9C2] border-b border-[#282828]/10 dark:border-[#25473C] uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-3">Student</th>
                        <th className="p-3">Course</th>
                        <th className="p-3">Progress</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#282828]/10 dark:divide-[#25473C]">
                      {enrollmentsList.map((enr) =>
                        <tr key={enr.id}>
                          <td className="p-3 font-semibold text-[#282828] dark:text-[#F1F7F4]">{enr.studentName || enr.memberId}</td>
                          <td className="p-3">{enr.courseTitle}</td>
                          <td className="p-3 font-mono font-bold text-cyan-400">{enr.progress}%</td>
                          <td className="p-3">
                            <Badge variant={enr.progress === 100 ? 'emerald' : 'blue'} size="sm">
                              {enr.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            {enr.progress < 100 &&
                              <button
                                onClick={async () => {
                                  await api.updateAdminEnrollment(enr.id, { progress: 100, status: 'Completed' });
                                  showToast('Marked 100% completed.');
                                  loadAllAdminData();
                                }}
                                className="text-xs text-emerald-400 hover:underline">

                                Mark Complete
                              </button>
                            }
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              }
            </div>
          }

          {/* TAB 5: CERTIFICATES (LANDSCAPE) */}
          {activeTab === 'certificates' &&
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">Total Issued: {certificatesList.length}</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setCertForm({
                      memberId: membersList.find((m) => m.role === 'member')?.id || '',
                      courseName: '',
                      issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    });
                    setModalType('cert');
                  }}>

                  <Plus className="w-3.5 h-3.5 mr-1" /> Issue Certificate (Landscape)
                </Button>
              </div>

              {certificatesList.length === 0 ?
                <Card className="p-12 text-center bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828]/60 dark:text-[#B7C9C2]">
                  <AwardIcon className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-sm">No certificates have been issued yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Issue official landscape certificates to recognizing students.</p>
                </Card> :

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificatesList.map((cert) =>
                    <Card key={cert.id} className="p-5 bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-mono font-bold text-cyan-400">{cert.certificateId}</p>
                          <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4] mt-0.5">{cert.studentName}</h3>
                          <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2]">{cert.courseName}</p>
                        </div>
                        <Badge variant={cert.status === 'VERIFIED' ? 'emerald' : 'rose'} size="sm">
                          {cert.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">Issued On: {cert.issueDate}</p>

                      <div className="flex justify-end gap-2 pt-2 border-t border-[#282828]/10 dark:border-[#25473C]">
                        <Button
                          variant="outline-dark"
                          size="sm"
                          className="text-xs py-1"
                          onClick={() => setSelectedCertificate(cert)}>

                          <Eye className="w-3 h-3 mr-1" /> View Landscape
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-amber-400 hover:text-amber-300"
                          onClick={() => handleToggleCertificate(cert.id)}>

                          {cert.status === 'VERIFIED' ? 'Revoke' : 'Re-verify'}
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              }
            </div>
          }

          {/* TAB 6: AWARDS */}
          {activeTab === 'awards' &&
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">Total Awards: {awardsList.length}</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setAwardForm({
                      memberId: membersList.find((m) => m.role === 'member')?.id || '',
                      title: '',
                      description: '',
                      category: 'Honor',
                      badge: 'trophy'
                    });
                    setModalType('award');
                  }}>

                  <Plus className="w-3.5 h-3.5 mr-1" /> Assign Award
                </Button>
              </div>

              {awardsList.length === 0 ?
                <Card className="p-12 text-center bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828]/60 dark:text-[#B7C9C2]">
                  <Trophy className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-sm">No awards yet.</p>
                </Card> :

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {awardsList.map((a) =>
                    <Card key={a.id} className="p-5 bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-[#282828] dark:text-[#F1F7F4] text-sm">{a.title}</h4>
                        <Badge variant="amber" size="sm">{a.category}</Badge>
                      </div>
                      <p className="text-xs text-[#FC6454] dark:text-[#6BB89E]">Recipient: {a.studentName}</p>
                      <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2]">{a.description}</p>
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleDeleteAward(a.id)}
                          className="text-xs text-rose-400 hover:text-rose-300">

                          Remove Award
                        </button>
                      </div>
                    </Card>
                  )}
                </div>
              }
            </div>
          }

          {/* TAB 7: PROJECTS */}
          {activeTab === 'projects' &&
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">Total Projects: {projectsList.length}</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setActiveItem(null);
                    setProjectForm({
                      title: '',
                      description: '',
                      technologies: ['React', 'TypeScript'],
                      projectMembers: ['IT Club Members'],
                      status: 'In Progress',
                      category: 'Web App',
                      date: '2026',
                      isPublished: true
                    });
                    setModalType('project');
                  }}>

                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Project
                </Button>
              </div>

              {projectsList.length === 0 ?
                <Card className="p-12 text-center bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828]/60 dark:text-[#B7C9C2]">
                  <FolderGit2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-sm">No projects published yet.</p>
                </Card> :

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectsList.map((p) =>
                    <Card key={p.id} className="p-5 bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] space-y-2">
                      {p.imageUrl &&
                        <div className="w-full h-32 rounded-lg overflow-hidden bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] mb-1">
                          <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                      }
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-[#282828] dark:text-[#F1F7F4] text-base">{p.title}</h4>
                        <Badge variant={p.status === 'Completed' ? 'emerald' : 'blue'} size="sm">
                          {p.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] line-clamp-2">{p.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {p.technologies.map((t) =>
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-[#FAF4EE] dark:bg-[#0A211A] text-[#282828] dark:text-[#B7C9C2] border border-[#282828]/10 dark:border-[#25473C]">
                            {t}
                          </span>
                        )}
                      </div>
                      <div className="pt-2 flex justify-end gap-2 border-t border-[#282828]/10 dark:border-[#25473C]">
                        <Button
                          variant="outline-dark"
                          size="sm"
                          className="text-xs py-1"
                          onClick={() => {
                            setActiveItem(p);
                            setProjectForm(p);
                            setModalType('project');
                          }}>

                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="text-xs py-1"
                          onClick={() => handleDeleteProject(p.id)}>

                          Delete
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              }
            </div>
          }

          {/* TAB 8: EVENTS */}
          {activeTab === 'events' &&
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">Total Events: {eventsList.length}</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setActiveItem(null);
                    setEventForm({
                      title: '',
                      date: '2026-05-15',
                      time: '2:00 PM - 4:00 PM',
                      location: 'Computer Lab 3, Block B',
                      locationType: 'Onsite',
                      description: '',
                      organizer: 'IT Club Tech Committee',
                      seatsAvailable: 30,
                      status: 'Upcoming',
                      isPublished: true
                    });
                    setModalType('event');
                  }}>

                  <Plus className="w-3.5 h-3.5 mr-1" /> Create Event
                </Button>
              </div>

              {eventsList.length === 0 ?
                <Card className="p-12 text-center bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828]/60 dark:text-[#B7C9C2]">
                  <Calendar className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-sm">No upcoming events.</p>
                </Card> :

                <div className="space-y-3">
                  {eventsList.map((ev) =>
                    <Card key={ev.id} className="p-4 bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-3">
                        {(ev.imageUrl || ev.coverImageUrl) &&
                          <div className="w-16 h-14 rounded-lg overflow-hidden bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] shrink-0">
                            <img src={ev.imageUrl || ev.coverImageUrl} alt={ev.title} className="w-full h-full object-cover" />
                          </div>
                        }
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[#FC6454] dark:text-[#6BB89E] font-bold text-xs">{ev.date}</span>
                            <span className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">&bull; {ev.time}</span>
                            <Badge variant={ev.status === 'Upcoming' ? 'emerald' : 'slate'} size="sm">{ev.status}</Badge>
                          </div>
                          <h4 className="font-bold text-[#282828] dark:text-[#F1F7F4] text-sm mt-1">{ev.title}</h4>
                          <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2]">{ev.location} ({ev.locationType})</p>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end sm:self-center">
                        <Button
                          variant="outline-dark"
                          size="sm"
                          className="text-xs py-1"
                          onClick={() => {
                            setActiveItem(ev);
                            setEventForm(ev);
                            setModalType('event');
                          }}>

                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="text-xs py-1"
                          onClick={() => handleDeleteEvent(ev.id)}>

                          Delete
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              }
            </div>
          }

          {/* TAB 9: ACHIEVEMENTS */}
          {activeTab === 'achievements' &&
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">Total Achievements: {achievementsList.length}</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setActiveItem(null);
                    setAchievementForm({
                      title: '',
                      category: 'club',
                      recipient: '',
                      description: '',
                      date: '2026',
                      rank: 'Winner',
                      isPublished: true
                    });
                    setModalType('achievement');
                  }}>

                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Achievement
                </Button>
              </div>

              {achievementsList.length === 0 ?
                <Card className="p-12 text-center bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828]/60 dark:text-[#B7C9C2]">
                  <Medal className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-sm">No achievements published yet.</p>
                </Card> :

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievementsList.map((ach) =>
                    <Card key={ach.id} className="p-4 bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] space-y-2">
                      <div className="flex items-start gap-3">
                        {ach.imageUrl &&
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] shrink-0">
                            <img src={ach.imageUrl} alt={ach.title} className="w-full h-full object-cover" />
                          </div>
                        }
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-[#282828] dark:text-[#F1F7F4] text-sm truncate">{ach.title}</h4>
                            <Badge variant="amber" size="sm">{ach.rank || ach.category}</Badge>
                          </div>
                          <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] line-clamp-2 mt-1">{ach.description}</p>
                        </div>
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleDeleteAchievement(ach.id)}
                          className="text-xs text-rose-400 hover:text-rose-300">

                          Delete
                        </button>
                      </div>
                    </Card>
                  )}
                </div>
              }
            </div>
          }

          {/* TAB 10: TELEGRAM INTEGRATION & BOT OPERATIONS CONSOLE */}
          {activeTab === 'telegram' &&
            <div className="space-y-6 max-w-4xl">
              {/* HEADER & OVERVIEW */}
              <Card className="p-6 bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#282828] dark:text-[#F1F7F4] flex items-center gap-2">
                      <Bot className="w-5 h-5 text-[#FC6454] dark:text-[#6BB89E]" />
                      ARX IT CLUB OF SJS &mdash; Telegram Bot &amp; Channel Operations
                    </h3>
                    <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] mt-1">
                      Authoritative administration for Telegram member verification, automated student services, and channel sync.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        loadTelegramBotData();
                        loadWebhookInfo();
                      }}
                      disabled={botStatusLoading}
                      className="text-xs font-mono">

                      <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${botStatusLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <a
                      href={settings.telegramBotUrl || 'https://t.me/ARXITCLUB_bot'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FC6454] text-white hover:bg-[#eb5545] text-xs font-mono transition-colors shadow-sm">

                      <span>Open Bot (@{settings.telegramBotUsername || 'ARXITCLUB_bot'})</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* 1. LIVE CONNECTION STATUS & DIAGNOSTICS CARD */}
                <div className="p-4 rounded-xl bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#282828]/10 dark:border-[#25473C] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#282828] dark:text-[#F1F7F4]">
                        Connection Status:
                      </span>
                      {botStatus?.connectionStatus === 'CONNECTED' ?
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          CONNECTED &amp; ACTIVE
                        </span> :
                        botStatus?.connectionStatus === 'ERROR' ?
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            API CONNECTION ERROR
                          </span> :

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            TOKEN NOT CONFIGURED
                          </span>
                      }
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTestBotConnection}
                      disabled={testingConnection}
                      className="text-xs font-mono h-7">

                      <Terminal className="w-3.5 h-3.5 mr-1 text-[#FC6454] dark:text-[#6BB89E]" />
                      {testingConnection ? 'Testing API...' : 'Run Diagnostics'}
                    </Button>
                  </div>

                  {/* Bot Identity Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-2.5 bg-white dark:bg-[#15362B] rounded-lg border border-[#282828]/10 dark:border-[#25473C]">
                      <span className="text-[#282828]/60 dark:text-slate-400 block text-[10px] uppercase">Bot Handle</span>
                      <span className="font-bold text-[#FC6454] dark:text-cyan-300">
                        @{botStatus?.botUsername || settings.telegramBotUsername || 'ARXITCLUB_bot'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-[#15362B] rounded-lg border border-[#282828]/10 dark:border-[#25473C]">
                      <span className="text-[#282828]/60 dark:text-slate-400 block text-[10px] uppercase">Bot Display Name</span>
                      <span className="font-bold text-[#282828] dark:text-white">
                        {botStatus?.botDisplayName || 'ARX IT CLUB OF SJS Bot'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-[#15362B] rounded-lg border border-[#282828]/10 dark:border-[#25473C]">
                      <span className="text-[#282828]/60 dark:text-slate-400 block text-[10px] uppercase">Numeric Bot ID</span>
                      <span className="text-[#282828] dark:text-slate-200">
                        {botStatus?.botId ? String(botStatus.botId) : 'Authenticated via Token'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-[#15362B] rounded-lg border border-[#282828]/10 dark:border-[#25473C]">
                      <span className="text-[#282828]/60 dark:text-slate-400 block text-[10px] uppercase">Update Engine</span>
                      <span className="font-bold capitalize text-emerald-600 dark:text-emerald-400">
                        {botStatus?.updateMode === 'webhook' ? '🌐 Webhook (HTTPS)' : botStatus?.updateMode === 'polling' ? '⚡ Resilient Polling' : '○ None'}
                      </span>
                    </div>
                  </div>

                  {botStatus?.error &&
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-lg text-xs font-mono text-rose-700 dark:text-rose-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>Connection Error:</strong> {botStatus.error}
                      </div>
                    </div>
                  }

                  {/* Diagnostic Test Checklist (if executed) */}
                  {testResult &&
                    <div className="p-3.5 bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] rounded-lg space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="flex items-center gap-1.5 text-[#282828] dark:text-[#F1F7F4]">
                          <Terminal className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" />
                          End-to-End Diagnostic Results:
                        </span>
                        <span className={testResult.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {testResult.success ? 'ALL TESTS PASSED ✅' : 'CHECKS FAILED ❌'}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {testResult.steps.map((st, idx) =>
                          <div key={idx} className="flex items-start gap-2 text-xs font-mono">
                            {st.status === 'SUCCESS' ?
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> :

                              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            }
                            <div className="leading-tight">
                              <span className="font-bold text-[#282828] dark:text-white">{st.name}:</span>{' '}
                              <span className="text-[#282828]/70 dark:text-[#B7C9C2]">{st.detail}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  }
                </div>

                {/* 2. BOT TOKEN MANAGEMENT & AUTHENTICATION */}
                <div className="p-4 rounded-xl bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" />
                      2. Telegram Bot API Token Management
                    </span>
                    <Badge variant={botStatus?.configured ? 'emerald' : 'amber'} size="sm">
                      {botStatus?.configured ? 'Token Active' : 'Setup Required'}
                    </Badge>
                  </div>

                  <p className="text-xs text-[#282828]/80 dark:text-[#B7C9C2] font-sans leading-relaxed">
                    Telegram Bot API token is required to connect the ARX IT CLUB OF SJS bot. Please provide the token obtained from <strong>@BotFather</strong> on Telegram. The token is stored securely on the server and never exposed in the client.
                  </p>

                  <form onSubmit={handleSaveBotToken} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#282828] dark:text-[#F1F7F4] mb-1 font-mono">
                        Bot API Token
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showBotToken ? 'text' : 'password'}
                          value={botTokenInput}
                          placeholder={botStatus?.maskedToken ? `${botStatus.maskedToken} (Token saved - enter new to rotate)` : 'e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ'}
                          onChange={(e) => setBotTokenInput(e.target.value)}
                          className="w-full pl-3.5 pr-20 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-sm font-mono text-[#282828] dark:text-cyan-300 focus:outline-none focus:ring-1 focus:ring-[#FC6454] dark:focus:ring-blue-500" />

                        <button
                          type="button"
                          onClick={() => setShowBotToken(!showBotToken)}
                          className="absolute right-2 px-2 py-1 text-xs text-[#282828]/60 dark:text-slate-400 hover:text-[#282828] dark:hover:text-white">

                          {showBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={savingBotToken || !botTokenInput.trim()}
                        className="text-xs font-mono">

                        <KeyRound className="w-3.5 h-3.5 mr-1" />
                        {savingBotToken ? 'Authenticating with Telegram...' : 'Save & Verify Bot Token'}
                      </Button>
                      <span className="text-[11px] text-[#282828]/60 dark:text-[#7F9990] font-sans">
                        Requires permission to read messages &amp; register webhooks.
                      </span>
                    </div>
                  </form>
                </div>

                {/* 3. CHANNEL & REGISTRATION CONFIGURATION */}
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono flex items-center gap-2">
                        <Send className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" />
                        3. Official Channel &amp; Bot Handle Settings
                      </span>
                      <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 px-2 py-0.5 rounded">
                        OFFICIAL @arxitclub
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#282828] dark:text-[#F1F7F4] mb-1">
                          Bot Username (Target for /start deep-linking)
                        </label>
                        <input
                          type="text"
                          required
                          value={settings.telegramBotUsername || 'ARXITCLUB_bot'}
                          onChange={(e) => {
                            const u = e.target.value.replace(/^@/, '');
                            setSettings({
                              ...settings,
                              telegramBotUsername: u,
                              telegramBotUrl: `https://t.me/${u}`
                            });
                          }}
                          className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-sm font-mono text-[#282828] dark:text-cyan-300 focus:outline-none focus:ring-1 focus:ring-[#FC6454] dark:focus:ring-blue-500" />

                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#282828] dark:text-[#F1F7F4] mb-1">
                          Channel Handle (Target for student verification)
                        </label>
                        <input
                          type="text"
                          required
                          value={settings.telegramChannelName || '@arxitclub'}
                          onChange={(e) => setSettings({ ...settings, telegramChannelName: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-sm font-mono text-[#282828] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FC6454] dark:focus:ring-blue-500" />

                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#282828] dark:text-[#F1F7F4] mb-1">
                          Bot Link URL
                        </label>
                        <input
                          type="url"
                          required
                          value={settings.telegramBotUrl || 'https://t.me/ARXITCLUB_bot'}
                          onChange={(e) => setSettings({ ...settings, telegramBotUrl: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-sm font-mono text-[#282828] dark:text-cyan-300 focus:outline-none focus:ring-1 focus:ring-[#FC6454] dark:focus:ring-blue-500" />

                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#282828] dark:text-[#F1F7F4] mb-1">
                          Channel Invitation Link
                        </label>
                        <input
                          type="url"
                          required
                          value={settings.telegramChannelUrl || 'https://t.me/arxitclub'}
                          onChange={(e) => setSettings({ ...settings, telegramChannelUrl: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-sm font-mono text-[#282828] dark:text-cyan-300 focus:outline-none focus:ring-1 focus:ring-[#FC6454] dark:focus:ring-blue-500" />

                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button type="submit" variant="primary" size="sm" className="text-xs font-mono">
                        Save Handles
                      </Button>
                    </div>
                  </div>
                </form>

                {/* 4. BOT COMMAND DIRECTORY & MENU SYNCHRONIZATION */}
                <div className="p-4 rounded-xl bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" />
                        4. Bot Command Directory &amp; Client Menu
                      </span>
                      <p className="text-[11px] text-[#282828]/70 dark:text-[#B7C9C2] mt-0.5">
                        Configure enabled commands, customize replies, and sync with Telegram's quick-access command button (/ menu).
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleSyncCommands}
                      disabled={syncingCommands || !botStatus?.configured}
                      className="text-xs font-mono shrink-0">

                      <Send className="w-3.5 h-3.5 mr-1" />
                      {syncingCommands ? 'Syncing with Telegram...' : 'Sync Menu to Telegram'}
                    </Button>
                  </div>

                  {/* Commands Table */}
                  <div className="overflow-x-auto rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#0C241C]">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-[#FAF4EE] dark:bg-[#15362B] text-[#282828]/80 dark:text-slate-300 font-mono text-[11px] border-b border-[#282828]/10 dark:border-[#25473C]">
                        <tr>
                          <th className="py-2 px-3">Command</th>
                          <th className="py-2 px-3">Description</th>
                          <th className="py-2 px-3 text-center">Status</th>
                          <th className="py-2 px-3 text-center">Menu Button</th>
                          <th className="py-2 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#282828]/5 dark:divide-[#25473C]/50">
                        {botCommandsList.map((cmd) =>
                          <tr key={cmd.command} className="hover:bg-[#FAF4EE]/50 dark:hover:bg-[#15362B]/30 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#FC6454] dark:text-cyan-300">
                              {cmd.command}
                            </td>
                            <td className="py-2.5 px-3 text-[#282828]/80 dark:text-[#B7C9C2] max-w-xs truncate">
                              {cmd.description}
                              {cmd.customReply &&
                                <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                                  ★ Custom reply active
                                </span>
                              }
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleCommand(cmd, 'isEnabled')}
                                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer transition-colors ${cmd.isEnabled ?
                                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' :
                                    'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'}`
                                }>

                                {cmd.isEnabled ? 'ENABLED' : 'DISABLED'}
                              </button>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleCommand(cmd, 'showInMenu')}
                                className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${cmd.showInMenu ?
                                    'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 font-bold' :
                                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`
                                }>

                                {cmd.showInMenu ? 'VISIBLE' : 'HIDDEN'}
                              </button>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => setEditingCommand(cmd)}
                                className="text-xs text-[#FC6454] dark:text-cyan-400 hover:underline font-mono">

                                Custom Reply
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Modal or Popover for Custom Reply */}
                  {editingCommand &&
                    <div className="p-3.5 bg-white dark:bg-[#0C241C] border border-[#FC6454]/40 dark:border-cyan-500/40 rounded-lg space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#282828] dark:text-white flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-[#FC6454]" />
                          Customize Reply for {editingCommand.command}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingCommand(null)}
                          className="text-xs text-slate-400 hover:text-white">

                          ✕
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        defaultValue={editingCommand.customReply || ''}
                        id={`custom-reply-${editingCommand.command}`}
                        placeholder="Leave empty to use authoritative built-in handler logic."
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF4EE] dark:bg-[#15362B] border border-[#282828]/15 dark:border-[#25473C] text-xs font-sans text-[#282828] dark:text-[#F1F7F4] focus:outline-none focus:ring-1 focus:ring-[#FC6454]" />

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCommand(null)}
                          className="text-xs">

                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            const val = document.getElementById(`custom-reply-${editingCommand.command}`)?.value || '';
                            handleSaveCustomReply(editingCommand.command, val);
                          }}
                          className="text-xs">

                          Save Reply
                        </Button>
                      </div>
                    </div>
                  }
                </div>

                {/* 5. BOT CONTENT & TEMPLATE CUSTOMIZATION */}
                {botContentSettings &&
                  <form onSubmit={handleSaveBotContent} className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" />
                          5. Automated Message Templates
                        </span>
                        <span className="text-[10px] text-[#282828]/60 dark:text-[#7F9990] font-mono">
                          TELEGRAM FORMATTING
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-[#282828] dark:text-[#F1F7F4] mb-1">
                            Welcome Message (New applicants / Unlinked users)
                          </label>
                          <textarea
                            rows={3}
                            value={botContentSettings.welcomeMessageNew || ''}
                            onChange={(e) =>
                              setBotContentSettings({ ...botContentSettings, welcomeMessageNew: e.target.value })
                            }
                            className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-xs font-sans text-[#282828] dark:text-[#F1F7F4] focus:outline-none focus:ring-1 focus:ring-[#FC6454]" />

                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#282828] dark:text-[#F1F7F4] mb-1">
                            Welcome Message (Active Club Members)
                          </label>
                          <textarea
                            rows={2}
                            value={botContentSettings.welcomeMessageMember || ''}
                            onChange={(e) =>
                              setBotContentSettings({ ...botContentSettings, welcomeMessageMember: e.target.value })
                            }
                            className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-xs font-sans text-[#282828] dark:text-[#F1F7F4] focus:outline-none focus:ring-1 focus:ring-[#FC6454]" />

                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#282828] dark:text-[#F1F7F4] mb-1">
                            Support &amp; Lab 3 Office Hours Text
                          </label>
                          <textarea
                            rows={2}
                            value={botContentSettings.supportMessage || ''}
                            onChange={(e) =>
                              setBotContentSettings({ ...botContentSettings, supportMessage: e.target.value })
                            }
                            className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-xs font-sans text-[#282828] dark:text-[#F1F7F4] focus:outline-none focus:ring-1 focus:ring-[#FC6454]" />

                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          disabled={savingBotContent}
                          className="text-xs font-mono">

                          {savingBotContent ? 'Saving Templates...' : 'Save Message Templates'}
                        </Button>
                      </div>
                    </div>
                  </form>
                }

                {/* 6. WEBHOOK HEALTH & SYNC */}
                <div className="p-4 rounded-xl bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#282828] dark:text-[#F1F7F4] uppercase tracking-wider font-mono flex items-center gap-2">
                      <Send className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" />
                      6. Telegram Webhook Health &amp; Diagnostics
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadWebhookInfo}
                      disabled={webhookLoading}
                      className="text-[11px] font-mono h-7 px-2">

                      <RefreshCw className={`w-3 h-3 ${webhookLoading ? 'animate-spin' : ''}`} />
                      Refresh Status
                    </Button>
                  </div>

                  {webhookSyncMessage &&
                    <div className="p-3 bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] rounded text-xs font-mono text-[#FC6454] dark:text-cyan-300">
                      {webhookSyncMessage}
                    </div>
                  }

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 bg-white dark:bg-[#15362B] rounded border border-[#282828]/10 dark:border-[#25473C]">
                      <span className="text-[#282828]/60 dark:text-slate-500 block text-[10px] uppercase">Telegram Bot Token</span>
                      <span className={webhookInfo?.configured ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'}>
                        {webhookInfo?.configured ? '● Configured (Server-side)' : '○ Missing in Environment'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-[#15362B] rounded border border-[#282828]/10 dark:border-[#25473C]">
                      <span className="text-[#282828]/60 dark:text-slate-500 block text-[10px] uppercase">Webhook Status</span>
                      <span className={webhookInfo?.telegramResponse?.result?.url ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[#282828]/50 dark:text-slate-400'}>
                        {webhookInfo?.telegramResponse?.result?.url ? '● Registered on Telegram' : '○ Not Registered'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-[#15362B] rounded border border-[#282828]/10 dark:border-[#25473C] sm:col-span-2">
                      <span className="text-[#282828]/60 dark:text-slate-500 block text-[10px] uppercase">Registered Webhook URL</span>
                      <span className="text-[#FC6454] dark:text-cyan-300 text-[11px] break-all">
                        {webhookInfo?.telegramResponse?.result?.url || 'None (Updates not routed via Webhook)'}
                      </span>
                    </div>

                    {webhookInfo?.telegramResponse?.result?.last_error_message &&
                      <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-800/60 sm:col-span-2 text-rose-700 dark:text-rose-300">
                        <span className="text-rose-600 dark:text-rose-400 font-bold block text-[10px] uppercase">Last Delivery Error from Telegram</span>
                        <span>{webhookInfo.telegramResponse.result.last_error_message}</span>
                      </div>
                    }
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleSyncWebhook}
                      disabled={webhookSyncing || !botStatus?.configured}
                      className="text-xs font-mono inline-flex items-center gap-1.5">

                      <Send className="w-3 h-3" />
                      {webhookSyncing ? 'Registering...' : 'Sync Webhook with Telegram'}
                    </Button>
                    <span className="text-xs font-mono text-[#282828]/60 dark:text-slate-400">
                      Webhook Listener: <code className="text-[#FC6454] dark:text-cyan-400 font-mono">/api/telegram/webhook</code>
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          }

          {/* TAB 11: WEBSITE SETTINGS */}
          {activeTab === 'settings' &&
            <div className="space-y-6 max-w-2xl">
              {/* REGISTRATION MANAGEMENT SECTION */}
              <Card className="p-6 bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
                      Registration Management
                    </h3>
                    <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2]">
                      Authoritative switch to open or close applicant registration for ARX IT CLUB OF SJS.
                    </p>
                  </div>
                  <Badge
                    variant={settings.registrationStatus === 'CLOSED' ? 'rose' : 'emerald'}
                    size="md">

                    {settings.registrationStatus === 'CLOSED' ? 'Registration Closed' : 'Registration Open'}
                  </Badge>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant={settings.registrationStatus === 'CLOSED' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleSetRegistrationStatus('OPEN')}
                      className="text-xs font-mono">

                      🔓 Open Registration
                    </Button>
                    <Button
                      type="button"
                      variant={settings.registrationStatus === 'CLOSED' ? 'outline' : 'danger'}
                      size="sm"
                      onClick={() => handleSetRegistrationStatus('CLOSED')}
                      className="text-xs font-mono">

                      🔒 Close Registration
                    </Button>
                  </div>
                  <span className="text-xs font-mono text-[#282828]/60 dark:text-slate-400">
                    Status: <strong className={settings.registrationStatus === 'CLOSED' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>{settings.registrationStatus === 'CLOSED' ? 'Registration Closed' : 'Registration Open'}</strong>
                  </span>
                </div>
              </Card>

              <Card className="p-6 bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4] flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
                    Website Content &amp; Branding Settings
                  </h3>
                  <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2]">
                    Adjust public website content dynamically without modifying application code.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#282828] dark:text-[#F1F7F4] mb-1">Club Name</label>
                      <input
                        type="text"
                        value={settings.clubName}
                        onChange={(e) => setSettings({ ...settings, clubName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4]" />

                    </div>
                    <div>
                      <label className="block font-bold text-[#282828] dark:text-[#F1F7F4] mb-1">Tagline</label>
                      <input
                        type="text"
                        value={settings.tagline}
                        onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4]" />

                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#282828] dark:text-[#F1F7F4] mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4]" />

                  </div>

                  <div>
                    <label className="block font-bold text-[#282828] dark:text-[#F1F7F4] mb-1">Physical Lab Location</label>
                    <input
                      type="text"
                      value={settings.meetingLocation}
                      onChange={(e) => setSettings({ ...settings, meetingLocation: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4]" />

                  </div>

                  <div>
                    <label className="block font-bold text-[#282828] dark:text-[#F1F7F4] mb-1">Regular Meeting Schedule</label>
                    <input
                      type="text"
                      value={settings.meetingSchedule}
                      onChange={(e) => setSettings({ ...settings, meetingSchedule: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4]" />

                  </div>

                  {/* CLUB BRANDING & VISUAL ASSETS */}
                  <div className="pt-5 border-t border-[#282828]/10 dark:border-[#25473C] space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#282828] dark:text-[#F1F7F4] flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
                        Official Branding &amp; Website Visuals
                      </h4>
                      <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] mt-0.5">
                        Control the visual identity across the public website, headers, and certificates.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ImageFieldInput
                        label="ARX Official Full Logo (Light Theme)"
                        description="Main club branding used in navbar, footer, and verification pages (Light Theme)."
                        value={settings.logoUrl}
                        category="Branding"
                        aspectRatioHint="Recommended: SVG / Transparent PNG"
                        onChange={(url) => setSettings({ ...settings, logoUrl: url })} />

                      <ImageFieldInput
                        label="ARX Official Full Logo (Dark Theme)"
                        description="Main club branding used in navbar, footer, and verification pages (Dark Theme)."
                        value={settings.logoDarkUrl}
                        category="Branding"
                        aspectRatioHint="Recommended: SVG / Transparent PNG"
                        onChange={(url) => setSettings({ ...settings, logoDarkUrl: url })} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ImageFieldInput
                        label="Compact / Mobile Header Logo (Light)"
                        description="Condensed logo optimized for compact navigation and mobile screens."
                        value={settings.compactLogoUrl}
                        category="Branding"
                        aspectRatioHint="Recommended: Square or compact"
                        onChange={(url) => setSettings({ ...settings, compactLogoUrl: url })} />

                      <ImageFieldInput
                        label="Compact / Mobile Header Logo (Dark)"
                        description="Condensed logo optimized for compact navigation and mobile screens."
                        value={settings.compactLogoDarkUrl}
                        category="Branding"
                        aspectRatioHint="Recommended: Square or compact"
                        onChange={(url) => setSettings({ ...settings, compactLogoDarkUrl: url })} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ImageFieldInput
                        label="Club Symbol Mark / Watermark"
                        description="Official monogram mark for badges, certificate watermark, and favicon."
                        value={settings.symbolUrl}
                        category="Branding"
                        aspectRatioHint="Recommended: 1:1 square icon"
                        onChange={(url) => setSettings({ ...settings, symbolUrl: url })} />


                      <ImageFieldInput
                        label="Homepage Hero Visual Banner"
                        description="Featured interactive artwork or lab image displayed on the home page."
                        value={settings.heroImageUrl}
                        category="Branding"
                        aspectRatioHint="Recommended: 16:9 widescreen"
                        onChange={(url) => setSettings({ ...settings, heroImageUrl: url })} />

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ImageFieldInput
                        label="About Club Campus Photo"
                        description="Featured campus or lab photograph displayed on the About page."
                        value={settings.aboutImageUrl}
                        category="About"
                        aspectRatioHint="Recommended: 16:9 or 4:3 photo"
                        onChange={(url) => setSettings({ ...settings, aboutImageUrl: url })} />


                      <ImageFieldInput
                        label="Default Certificate Seal / Stamp"
                        description="Default official institutional stamp used on verified completion certificates."
                        value={settings.certificateStampUrl}
                        category="Certificates"
                        aspectRatioHint="Recommended: 1:1 circular seal"
                        onChange={(url) => setSettings({ ...settings, certificateStampUrl: url })} />

                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="primary" size="md">
                      Save All Website Settings
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          }

          {/* TAB 12: ADMIN PROFILE / PASSWORD */}
          {activeTab === 'profile' &&
            <Card className="p-6 bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] space-y-5 max-w-md">
              <div>
                <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
                  Change Administrator Password
                </h3>
                <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2]">
                  Update the password for administrator account <strong>{member?.memberId || 'ADMIN01'}</strong>.
                </p>
              </div>

              <form onSubmit={handleChangeAdminPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#282828] dark:text-[#F1F7F4] mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-sm text-[#282828] dark:text-[#F1F7F4] focus:outline-none focus:ring-1 focus:ring-[#FC6454] dark:focus:ring-blue-500" />

                </div>
                <Button type="submit" variant="primary" size="md">
                  Update Admin Password
                </Button>
              </form>
            </Card>
          }
        </div>
      </main>

      {/* MODAL: ADD / EDIT COURSE */}
      <Modal
        isOpen={modalType === 'course'}
        onClose={() => {
          setModalType(null);
          setCourseError(null);
        }}
        title={activeItem ? 'Edit Course' : 'Create New Course'}
        maxWidth="lg">

        <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
          {courseError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{courseError}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Course Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Full-Stack Development"
              value={courseForm.title}
              onChange={(e) => {
                setCourseForm({ ...courseForm, title: e.target.value });
                if (courseError) setCourseError(null);
              }}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Category</label>
              <select
                value={courseForm.category}
                onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40">

                <option>Web Development</option>
                <option>Programming</option>
                <option>Cybersecurity</option>
                <option>Networking</option>
                <option>Design</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Difficulty</label>
              <select
                value={courseForm.difficulty}
                onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40">

                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Duration</label>
              <input
                type="text"
                value={courseForm.duration}
                onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

            </div>
            <div>
              <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Instructor</label>
              <input
                type="text"
                value={courseForm.instructor}
                onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] rounded-lg">
            <div>
              <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Status</label>
              <select
                value={courseForm.status || 'Available'}
                onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg">

                <option value="Available">Available</option>
                <option value="Coming Soon">Coming Soon</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Catalog Visibility</label>
              <select
                value={courseForm.isPublished !== false ? 'published' : 'draft'}
                onChange={(e) => setCourseForm({ ...courseForm, isPublished: e.target.value === 'published' })}
                className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg">

                <option value="published">Published</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Registration Selection</label>
              <select
                value={courseForm.isAvailableForRegistration !== false ? 'open' : 'closed'}
                onChange={(e) => setCourseForm({ ...courseForm, isAvailableForRegistration: e.target.value === 'open' })}
                className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg">

                <option value="open">Open for Registration</option>
                <option value="closed">Closed for Registration</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Short Description</label>
            <textarea
              rows={2}
              placeholder="Brief course overview (optional, auto-generated if left blank)"
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Detailed Long Description</label>
            <textarea
              rows={3}
              placeholder="Comprehensive syllabus, objectives and weekly breakdown..."
              value={courseForm.longDescription}
              onChange={(e) => setCourseForm({ ...courseForm, longDescription: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>

          {/* Course Images */}
          <div className="space-y-3 pt-2 border-t border-[#282828]/10 dark:border-[#25473C]">
            <ImageFieldInput
              label="Course Thumbnail Image"
              description="Displayed in course catalog cards and member enrollment lists."
              value={courseForm.thumbnailUrl}
              mediaId={courseForm.thumbnailMediaId}
              category="Courses"
              aspectRatioHint="Recommended: 16:9 or 4:3"
              onChange={(url, mediaId) =>
                setCourseForm({ ...courseForm, thumbnailUrl: url, thumbnailMediaId: mediaId })
              } />

            <ImageFieldInput
              label="Course Header Banner"
              description="Wide banner displayed at the top of the course curriculum syllabus page."
              value={courseForm.bannerUrl}
              mediaId={courseForm.bannerMediaId}
              category="Courses"
              aspectRatioHint="Recommended: 16:9 or 21:9"
              onChange={(url, mediaId) =>
                setCourseForm({ ...courseForm, bannerUrl: url, bannerMediaId: mediaId })
              } />

          </div>

          <div className="sticky bottom-0 bg-white dark:bg-[#102B22] pt-3 pb-1 -mx-6 px-6 -mb-6 border-t border-[#282828]/10 dark:border-[#25473C] flex justify-end gap-2 z-10 shadow-xs">
            <Button type="button" variant="ghost" size="sm" onClick={() => { setModalType(null); setCourseError(null); }}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" loading={isSavingCourse}>
              {activeItem ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ISSUE LANDSCAPE CERTIFICATE */}
      <Modal
        isOpen={modalType === 'cert'}
        onClose={() => setModalType(null)}
        title="Issue Landscape Certificate"
        maxWidth="md">

        <form onSubmit={handleIssueCertificate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Select Student Member</label>
            <select
              required
              value={certForm.memberId}
              onChange={(e) => setCertForm({ ...certForm, memberId: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40">

              <option value="">-- Choose Member --</option>
              {membersList.
                filter((m) => m.role === 'member').
                map((m) =>
                  <option key={m.id} value={m.id}>
                    {m.studentName} ({m.memberId} - Class {m.class})
                  </option>
                )}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Course Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Web Development or Python Basics"
              value={certForm.courseName}
              onChange={(e) => setCertForm({ ...certForm, courseName: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>

          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Issue / Completion Date</label>
            <input
              type="text"
              required
              value={certForm.issueDate}
              onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>

          <p className="text-[11px] text-slate-500">
            A unique Certificate ID will be generated programmatically (e.g. <code>ITC-PY-2026-00001</code>) and
            formatted in academic landscape orientation with verification QR code.
          </p>

          <ImageFieldInput
            label="Certificate Stamp / Institutional Seal (Optional)"
            description="Attach a verified gold seal or club stamp to render on the certificate."
            value={certForm.certificateStampUrl}
            category="Certificates"
            aspectRatioHint="Recommended: 1:1 circular seal"
            onChange={(url) => setCertForm({ ...certForm, certificateStampUrl: url })} />


          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalType(null)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Issue Certificate</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ASSIGN AWARD */}
      <Modal
        isOpen={modalType === 'award'}
        onClose={() => setModalType(null)}
        title="Assign Award to Student"
        maxWidth="md">

        <form onSubmit={handleCreateAward} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Student Member</label>
            <select
              required
              value={awardForm.memberId}
              onChange={(e) => setAwardForm({ ...awardForm, memberId: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40">

              <option value="">-- Choose Member --</option>
              {membersList.
                filter((m) => m.role === 'member').
                map((m) =>
                  <option key={m.id} value={m.id}>
                    {m.studentName} ({m.memberId})
                  </option>
                )}
            </select>
          </div>
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Award Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Best Problem Solver 2026"
              value={awardForm.title}
              onChange={(e) => setAwardForm({ ...awardForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Description / Reason</label>
            <textarea
              rows={2}
              required
              value={awardForm.description}
              onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalType(null)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Assign Award</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CREATE PROJECT */}
      <Modal
        isOpen={modalType === 'project'}
        onClose={() => setModalType(null)}
        title={activeItem ? 'Edit Project' : 'Create Project'}
        maxWidth="md">

        <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Project Title</label>
            <input
              type="text"
              required
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Technologies (comma separated)</label>
            <input
              type="text"
              placeholder="React, TypeScript, Tailwind"
              value={Array.isArray(projectForm.technologies) ? projectForm.technologies.join(', ') : ''}
              onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value.split(',').map((t) => t.trim()) })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>

          {/* Project Image */}
          <div className="pt-2 border-t border-[#282828]/10 dark:border-[#25473C]">
            <ImageFieldInput
              label="Project Showcase Image"
              description="Primary image displayed in public showcase and project portfolios."
              value={projectForm.imageUrl}
              mediaId={projectForm.mediaId}
              category="Projects"
              aspectRatioHint="Recommended: 16:9 or 4:3"
              onChange={(url, mediaId) =>
                setProjectForm({
                  ...projectForm,
                  imageUrl: url,
                  mediaId,
                  galleryImages: url ? [url] : []
                })
              } />

          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalType(null)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Save Project</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CREATE EVENT */}
      <Modal
        isOpen={modalType === 'event'}
        onClose={() => setModalType(null)}
        title={activeItem ? 'Edit Event' : 'Create Event'}
        maxWidth="md">

        <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Event Title</label>
            <input
              type="text"
              required
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Date</label>
              <input
                type="date"
                required
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

            </div>
            <div>
              <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Time</label>
              <input
                type="text"
                required
                placeholder="2:00 PM - 4:00 PM"
                value={eventForm.time}
                onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

            </div>
          </div>
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Location</label>
            <input
              type="text"
              required
              value={eventForm.location}
              onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Description</label>
            <textarea
              rows={2}
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>

          {/* Event Cover Image */}
          <div className="pt-2 border-t border-[#282828]/10 dark:border-[#25473C]">
            <ImageFieldInput
              label="Event Cover Image"
              description="Banner displayed in upcoming activities, workshops, and event cards."
              value={eventForm.imageUrl || eventForm.coverImageUrl}
              mediaId={eventForm.mediaId}
              category="Events"
              aspectRatioHint="Recommended: 16:9"
              onChange={(url, mediaId) =>
                setEventForm({
                  ...eventForm,
                  imageUrl: url,
                  coverImageUrl: url,
                  mediaId,
                  galleryImages: url ? [url] : []
                })
              } />

          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalType(null)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Save Event</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CREATE ACHIEVEMENT */}
      <Modal
        isOpen={modalType === 'achievement'}
        onClose={() => setModalType(null)}
        title="Add Achievement"
        maxWidth="md">

        <form onSubmit={handleSaveAchievement} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Achievement Title</label>
            <input
              type="text"
              required
              placeholder="e.g. 1st Place School Hackathon"
              value={achievementForm.title}
              onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Description</label>
            <textarea
              rows={2}
              required
              value={achievementForm.description}
              onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Category</label>
              <select
                value={achievementForm.category}
                onChange={(e) => setAchievementForm({ ...achievementForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40">

                <option value="club">Club Achievement</option>
                <option value="member">Member Achievement</option>
                <option value="competition">Competition / Olympiad</option>
                <option value="award">Special Award</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Recipient (Optional)</label>
              <input
                type="text"
                placeholder="Club Team or Student Name"
                value={achievementForm.recipient || ''}
                onChange={(e) => setAchievementForm({ ...achievementForm, recipient: e.target.value })}
                className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

            </div>
          </div>

          {/* Achievement Image */}
          <div className="pt-2 border-t border-[#282828]/10 dark:border-[#25473C]">
            <ImageFieldInput
              label="Achievement / Trophy Badge Image"
              description="Optional trophy, award graphic, or medal image."
              value={achievementForm.imageUrl}
              mediaId={achievementForm.mediaId}
              category="Achievements"
              aspectRatioHint="Recommended: 1:1 or 4:3"
              onChange={(url, mediaId) =>
                setAchievementForm({ ...achievementForm, imageUrl: url, mediaId })
              } />

          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalType(null)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Publish</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW MEMBER DETAIL & ENROLLMENTS */}
      <Modal
        isOpen={modalType === 'memberDetail'}
        onClose={() => setModalType(null)}
        title="Member Profile & Records"
        maxWidth="lg">

        {selectedMemberDetail &&
          <div className="space-y-5 text-xs text-[#282828] dark:text-[#B7C9C2]">
            {/* Student Header */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FC6454] to-[#f87171] dark:from-[#2F8068] dark:to-[#6BB89E] text-white flex items-center justify-center font-bold text-2xl shadow-md">
                {selectedMemberDetail.member.studentName.charAt(0)}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#282828] dark:text-[#F1F7F4]">{selectedMemberDetail.member.studentName}</h3>
                  <Badge variant={selectedMemberDetail.member.status === 'active' ? 'emerald' : 'rose'} size="sm">
                    {selectedMemberDetail.member.status}
                  </Badge>
                </div>
                <p className="font-mono text-[#FC6454] dark:text-cyan-400 font-bold">{selectedMemberDetail.member.memberId}</p>
                <p className="text-[#282828]/60 dark:text-slate-400">Class {selectedMemberDetail.member.class} &bull; Member since {selectedMemberDetail.member.createdAt ? new Date(selectedMemberDetail.member.createdAt).toLocaleDateString() : 'Active'}</p>
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#282828]/60 dark:text-slate-400 block">Phone Number</span>
                <span className="font-mono font-semibold text-[#282828] dark:text-[#F1F7F4]">{selectedMemberDetail.member.phoneNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#282828]/60 dark:text-slate-400 block">Telegram Handle</span>
                <span className="font-mono font-semibold text-[#FC6454] dark:text-cyan-400">{selectedMemberDetail.member.telegramUsername || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#282828]/60 dark:text-slate-400 block">Telegram User ID</span>
                <span className="font-mono font-semibold text-[#282828] dark:text-[#F1F7F4]">
                  {selectedMemberDetail.member.telegramUserId ?
                    <span className="text-emerald-600 font-mono">ID: {selectedMemberDetail.member.telegramUserId}</span> :

                    <span className="text-slate-400 italic">Not Linked Yet</span>
                  }
                </span>
              </div>
            </div>

            {/* Enrolled Courses */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Course Enrollments ({selectedMemberDetail.enrollments.length})</h4>
              {selectedMemberDetail.enrollments.length === 0 ?
                <p className="text-slate-400 italic">No course enrollments on record.</p> :

                <div className="space-y-2">
                  {selectedMemberDetail.enrollments.map((enr) =>
                    <div key={enr.id} className="p-3 rounded-lg border border-[#282828]/10 dark:border-[#25473C] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#282828] dark:text-[#F1F7F4]">{enr.courseTitle}</span>
                        <Badge variant={enr.status === 'Completed' ? 'emerald' : 'blue'} size="sm">
                          {enr.status} ({enr.progress}%)
                        </Badge>
                      </div>
                      <div className="w-full bg-[#FAF4EE] dark:bg-[#0A211A] h-2 rounded-full overflow-hidden border border-[#282828]/10 dark:border-[#25473C]">
                        <div
                          className={`h-full rounded-full ${enr.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                          style={{ width: `${enr.progress}%` }} />

                      </div>
                    </div>
                  )}
                </div>
              }
            </div>

            {/* Earned Certificates */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Issued Certificates ({selectedMemberDetail.certificates.length})</h4>
              {selectedMemberDetail.certificates.length === 0 ?
                <p className="text-slate-400 italic">No certificates issued yet.</p> :

                <div className="space-y-1.5">
                  {selectedMemberDetail.certificates.map((c) =>
                    <div key={c.id} className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-emerald-900">{c.courseName}</p>
                        <p className="font-mono text-[10px] text-emerald-700">{c.certificateId} &bull; {c.issueDate}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs bg-white border-emerald-300 text-emerald-800 py-1"
                        onClick={() => {
                          setSelectedCertificate(c);
                        }}>

                        View Certificate
                      </Button>
                    </div>
                  )}
                </div>
              }
            </div>

            {/* Awards */}
            {selectedMemberDetail.awards.length > 0 &&
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-[#F1F7F4] text-sm">Awards &amp; Distinctions</h4>
                <div className="space-y-1.5">
                  {selectedMemberDetail.awards.map((a) =>
                    <div key={a.id} className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                      <p className="font-bold text-amber-900 dark:text-amber-300">{a.title}</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">{a.description}</p>
                    </div>
                  )}
                </div>
              </div>
            }

            {/* Uploaded Award Evidence / Certificates */}
            {(selectedMemberDetail.awardFiles && selectedMemberDetail.awardFiles.length > 0 ||
              selectedMemberDetail.member.awardFiles && selectedMemberDetail.member.awardFiles.length > 0) &&
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#282828] dark:text-[#F1F7F4] text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
                    <span>Uploaded Award Certificates ({(selectedMemberDetail.awardFiles || selectedMemberDetail.member.awardFiles || []).length})</span>
                  </h4>
                  <Badge variant="emerald" size="sm">Evidence Attached</Badge>
                </div>
                <div className="space-y-2">
                  {(selectedMemberDetail.awardFiles || selectedMemberDetail.member.awardFiles || []).map((af) =>
                    <div
                      key={af.id}
                      className="p-3 rounded-lg border border-[#282828]/10 dark:border-[#25473C] bg-[#FAF4EE]/50 dark:bg-[#0A211A]/50 flex items-center justify-between gap-3">

                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-md bg-white dark:bg-[#15362B] border border-[#282828]/15 dark:border-[#25473C] flex items-center justify-center shrink-0">
                          {af.mimeType.includes('pdf') ?
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 font-mono">PDF</span> :

                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono">IMG</span>
                          }
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-mono text-xs font-bold text-[#282828] dark:text-[#F1F7F4] truncate">
                            {af.originalFilename}
                          </p>
                          <p className="font-mono text-[10px] text-[#282828]/60 dark:text-[#7F9990]">
                            {af.formattedSize} &bull; {new Date(af.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-mono shrink-0 py-1 px-2.5"
                        onClick={() => handleDownloadAwardFile(af)}>

                        <Download className="w-3.5 h-3.5 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            }

            <div className="flex justify-end pt-2 border-t border-[#282828]/10 dark:border-[#25473C]">
              <Button variant="ghost" size="sm" onClick={() => setModalType(null)}>Close</Button>
            </div>
          </div>
        }
      </Modal>

      {/* MODAL: EDIT MEMBER INFORMATION */}
      <Modal
        isOpen={modalType === 'editMember'}
        onClose={() => setModalType(null)}
        title="Edit Member Information"
        maxWidth="md">

        <form onSubmit={handleSaveMemberEdit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Student Full Name</label>
            <input
              type="text"
              required
              value={editMemberForm.studentName || ''}
              onChange={(e) => setEditMemberForm({ ...editMemberForm, studentName: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Class / Section</label>
            <input
              type="text"
              required
              value={editMemberForm.class || ''}
              onChange={(e) => setEditMemberForm({ ...editMemberForm, class: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Phone Number</label>
            <input
              type="text"
              required
              value={editMemberForm.phoneNumber || ''}
              onChange={(e) => setEditMemberForm({ ...editMemberForm, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Telegram Username</label>
            <input
              type="text"
              required
              value={editMemberForm.telegramUsername || ''}
              onChange={(e) => setEditMemberForm({ ...editMemberForm, telegramUsername: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Special Distinction / Award Note (Optional)</label>
            <input
              type="text"
              value={editMemberForm.award || ''}
              onChange={(e) => setEditMemberForm({ ...editMemberForm, award: e.target.value })}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalType(null)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RESET MEMBER PASSWORD */}
      <Modal
        isOpen={modalType === 'resetMemberPassword'}
        onClose={() => setModalType(null)}
        title="Reset Member Password"
        maxWidth="sm">

        <form onSubmit={handleConfirmResetPassword} className="space-y-4 text-xs">
          {resetPasswordMember &&
            <p className="text-slate-600">
              Reset password for <strong>{resetPasswordMember.studentName}</strong> ({resetPasswordMember.memberId}).
            </p>
          }
          <div>
            <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">New Password (min 6 chars)</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Enter new password"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              className="w-full px-3 py-2 border border-[#282828]/20 dark:border-[#294B40] bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40" />

          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalType(null)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Set New Password</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: GENERATE & PRINT STUDENT ID CARD / BADGE */}
      <Modal
        isOpen={modalType === 'memberBadge'}
        onClose={() => setModalType(null)}
        title="Student Member ID Card Badge"
        maxWidth="md">

        {selectedMemberBadge &&
          <div className="space-y-5 text-center">
            {/* Printable ID Card Container */}
            <div
              id="printable-member-badge"
              className="w-full max-w-sm mx-auto bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 text-white rounded-2xl p-6 shadow-2xl border-2 border-cyan-500/40 relative overflow-hidden select-none">

              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400" />

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[#282828]/10 dark:border-[#25473C] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    &lt;/&gt;
                  </div>
                  <div className="text-left">
                    <h5 className="font-extrabold text-xs tracking-wider leading-none text-white">IT CLUB</h5>
                    <p className="text-[9px] text-cyan-400 font-mono">STUDENT MEMBER PASS</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold">
                  ACTIVE
                </span>
              </div>

              {/* Student Avatar & Identity */}
              <div className="space-y-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 text-slate-950 font-black text-3xl flex items-center justify-center mx-auto shadow-lg border-2 border-white/20">
                  {selectedMemberBadge.studentName.charAt(0)}
                </div>

                <div>
                  <h4 className="text-lg font-black text-white">{selectedMemberBadge.studentName}</h4>
                  <p className="text-xs text-slate-300 font-medium">Class {selectedMemberBadge.class}</p>
                </div>

                {/* Big Member ID */}
                <div className="py-2 px-3 rounded-xl bg-slate-900/90 border border-[#282828]/10 dark:border-[#25473C] font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Member ID</span>
                  <span className="text-2xl font-black text-cyan-400 tracking-wider">
                    {selectedMemberBadge.memberId}
                  </span>
                </div>

                {/* Barcode & Security Elements */}
                <div className="flex items-center justify-between pt-2 border-t border-[#282828]/10 dark:border-[#25473C]/80 text-left text-[10px] text-slate-400">
                  <div>
                    <p>Role: <strong className="text-slate-200 uppercase">{selectedMemberBadge.role}</strong></p>
                    <p>Telegram: <strong className="text-cyan-400">{selectedMemberBadge.telegramUsername}</strong></p>
                    <p className="font-mono text-[9px] text-slate-500 mt-1">Valid: 2026 Academic Year</p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded p-1 flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-slate-950" />
                  </div>
                </div>
              </div>
            </div>

            {/* Print action buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalType(null)}>

                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => window.print()}>

                <Printer className="w-4 h-4 mr-1.5" /> Print ID Card
              </Button>
            </div>
          </div>
        }
      </Modal>

      {/* Landscape Certificate Preview Modal */}
      <CertificateModal
        certificate={selectedCertificate}
        isOpen={!!selectedCertificate}
        onClose={() => setSelectedCertificate(null)} />

    </div>);

};