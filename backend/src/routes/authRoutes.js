import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// ─── Rate Limiters ────────────────────────────────────────────────────────────
// All authentication endpoints are rate-limited by IP to defend against
// brute-force attacks, credential stuffing, and enumeration attempts.

// Login: 5 attempts per minute (covers both member and ARX-XXXX_XXXX code entry)
const loginLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many login attempts from this address. Please wait a minute and try again.'
});

// Registration: stricter — 5 per 5-minute window to prevent spam account creation
const registerLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: 'Too many registration requests. Please wait a few minutes and try again.'
});

// Activation (ARX-XXXX_XXXX code entry points): 8 per 2-minute window
// Protects all Telegram activation code submission routes from brute-force.
const activateLimiter = createRateLimiter({
  windowMs: 2 * 60 * 1000,
  max: 8,
  message: 'Too many activation attempts. Please wait two minutes before trying again.'
});

// Password reset: 5 per 5-minute window per IP to block enumeration and abuse
const forgotPasswordLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: 'Too many password reset requests. Please wait a few minutes and try again.'
});

// ─── Routes ──────────────────────────────────────────────────────────────────
router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/admin-login', loginLimiter, authController.adminLogin);

// ARX-XXXX_XXXX activation code entry: dedicated strict limiter to block brute-force
router.post('/activate', activateLimiter, authController.activateAccount);

router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);

// Forgot Password routes (Requirement 8)
router.post('/forgot-password/request', forgotPasswordLimiter, authController.forgotPasswordRequest);
router.post('/forgot-password/verify-code', forgotPasswordLimiter, authController.forgotPasswordVerifyCode);
router.post('/forgot-password/reset', forgotPasswordLimiter, authController.forgotPasswordReset);

export default router;