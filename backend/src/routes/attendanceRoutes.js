import { Router } from 'express';
import { attendanceController } from '../controllers/attendanceController.js';
import { authMiddleware, optionalAuthMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import { createRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

const checkInLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many attendance submissions. Please wait a minute and try again.'
});

// Member routes
router.post('/check-in', checkInLimiter, optionalAuthMiddleware, attendanceController.checkIn);
router.get('/status', optionalAuthMiddleware, attendanceController.getStatus);
router.get('/my-history', authMiddleware, attendanceController.getMyHistory);

// Admin routes
router.get('/admin/records', authMiddleware, adminMiddleware, attendanceController.getAll);
router.post('/admin/manual', authMiddleware, adminMiddleware, attendanceController.createManual);
router.delete('/admin/records/:id', authMiddleware, adminMiddleware, attendanceController.deleteRecord);
router.get('/admin/sessions', authMiddleware, adminMiddleware, attendanceController.getConfigs);
router.put('/admin/sessions', authMiddleware, adminMiddleware, attendanceController.updateConfigs);

export default router;