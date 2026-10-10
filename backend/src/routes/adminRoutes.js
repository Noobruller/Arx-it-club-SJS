import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { mediaController } from '../controllers/mediaController.js';
import { adminMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Enforce backend authorization for ALL admin endpoints
router.use(adminMiddleware);

// Media Library Management
router.get('/media', mediaController.getAll);
router.get('/media/:id', mediaController.getById);
router.get('/media/:id/usage', mediaController.getUsage);
router.post('/media/upload', mediaController.upload);
router.put('/media/:id', mediaController.updateMetadata);
router.post('/media/:id/replace', mediaController.replaceImage);
router.delete('/media/:id', mediaController.delete);

// Overview
router.get('/overview', adminController.getOverview);

// Student Applications Review System
router.get('/applications', adminController.getApplications);
router.patch('/applications/:id/approve', adminController.approveApplication);
router.post('/applications/:id/approve', adminController.approveApplication);
router.patch('/applications/:id/reject', adminController.rejectApplication);
router.post('/applications/:id/reject', adminController.rejectApplication);

// Members
router.get('/members', adminController.getMembers);
router.get('/members/:id', adminController.getMemberDetail);
router.get('/members/:id/award-files', adminController.getMemberAwardFiles);
router.get('/award-files/:id/download', adminController.downloadAwardFile);
router.put('/members/:id', adminController.updateMember);
router.post('/members/:id/toggle-status', adminController.toggleMemberStatus);
router.post('/members/:id/reset-password', adminController.resetMemberPassword);
router.delete('/members/:id', adminController.deleteMember);

// Courses
router.get('/courses', adminController.getCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// Enrollments
router.get('/enrollments', adminController.getEnrollments);
router.put('/enrollments/:id', adminController.updateEnrollment);

// Certificates
router.get('/certificates', adminController.getCertificates);
router.post('/certificates/issue', adminController.issueCertificate);
router.post('/certificates/:id/toggle', adminController.toggleCertificate);
router.delete('/certificates/:id', adminController.deleteCertificate);

// Awards
router.get('/awards', adminController.getAwards);
router.post('/awards', adminController.createAward);
router.delete('/awards/:id', adminController.deleteAward);

// Projects
router.get('/projects', adminController.getProjects);
router.post('/projects', adminController.createProject);
router.put('/projects/:id', adminController.updateProject);
router.delete('/projects/:id', adminController.deleteProject);

// Events
router.get('/events', adminController.getEvents);
router.post('/events', adminController.createEvent);
router.put('/events/:id', adminController.updateEvent);
router.delete('/events/:id', adminController.deleteEvent);

// Achievements
router.get('/achievements', adminController.getAchievements);
router.post('/achievements', adminController.createAchievement);
router.put('/achievements/:id', adminController.updateAchievement);
router.delete('/achievements/:id', adminController.deleteAchievement);

// Announcements
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

// Social Media Links (Requirement 4)
router.get('/social-links', adminController.getSocialLinks);
router.post('/social-links', adminController.createSocialLink);
router.put('/social-links/:id', adminController.updateSocialLink);
router.delete('/social-links/:id', adminController.deleteSocialLink);

// Club Governance (Requirement 7)
router.get('/governance', adminController.getGovernance);
router.post('/governance', adminController.createGovernance);
router.put('/governance/:id', adminController.updateGovernance);
router.delete('/governance/:id', adminController.deleteGovernance);
router.post('/governance/reorder', adminController.reorderGovernance);

// Settings & Profile
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.post('/settings/toggle-registration', adminController.toggleRegistrationStatus);
router.post('/change-password', adminController.changeAdminPassword);

// Telegram Bot Operations (Requirement 3, 5, 8, 14, 21, 23, 24)
router.get('/telegram/status', adminController.getTelegramBotStatus);
router.post('/telegram/token', adminController.updateTelegramBotToken);
router.post('/telegram/test', adminController.testTelegramBotConnection);
router.get('/telegram/commands', adminController.getBotCommands);
router.put('/telegram/commands', adminController.updateBotCommand);
router.post('/telegram/commands/sync', adminController.syncBotCommands);
router.get('/telegram/content', adminController.getBotContent);
router.put('/telegram/content', adminController.updateBotContent);

export default router;