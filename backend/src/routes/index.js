import { Router } from 'express';
import authRoutes from './authRoutes.js';
import memberRoutes from './memberRoutes.js';
import courseRoutes from './courseRoutes.js';
import certificateRoutes from './certificateRoutes.js';
import projectRoutes from './projectRoutes.js';
import eventRoutes from './eventRoutes.js';
import achievementRoutes from './achievementRoutes.js';
import statsRoutes from './statsRoutes.js';
import adminRoutes from './adminRoutes.js';
import telegramRoutes from './telegramRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import assignmentRoutes from './assignmentRoutes.js';
import { db } from '../services/db.js';

const apiRouter = Router();

// Ensure DB is initialized and hydrated from arx_database.json
apiRouter.use(async (_req, _res, next) => {
  try {
    if (typeof db.ensureInitialized === 'function') {
      await db.ensureInitialized();
    }
  } catch (err) {
    console.error('[DB] ensureInitialized middleware error:', err);
  }
  next();
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/members', memberRoutes);
apiRouter.use('/courses', courseRoutes);
apiRouter.use('/certificates', certificateRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/events', eventRoutes);
apiRouter.use('/achievements', achievementRoutes);
apiRouter.use('/stats', statsRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/telegram', telegramRoutes);
apiRouter.use('/attendance', attendanceRoutes);
apiRouter.use('/assignments', assignmentRoutes);

// Public settings endpoint (safe information: club name, tagline, telegram channel url, etc.)
apiRouter.get('/settings', (_req, res) => {
  const settings = db.getSettings();
  res.json({ settings });
});

// Public Social Media Links (Requirement 4 & 8)
apiRouter.get('/social-links', (_req, res) => {
  const socialLinks = db.getPublicSocialLinks();
  res.json({ socialLinks });
});

// Public Club Governance (Requirement 7)
apiRouter.get('/governance', (_req, res) => {
  const governance = db.getGovernanceRoles();
  res.json({ governance });
});

// Club Learning Resources
apiRouter.get('/resources', (_req, res) => {
  const resources = db.getClubResources();
  res.json({ resources });
});

// Announcements
apiRouter.get('/announcements', (_req, res) => {
  const announcements = db.getAnnouncements(true);
  res.json({ announcements });
});

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'IT Club API Server',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default apiRouter;