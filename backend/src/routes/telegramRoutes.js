import { Router } from 'express';
import { telegramController } from '../controllers/telegramController.js';

import { createRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

const botRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many Telegram bot requests. Please wait a moment.'
});

const channelVerifyLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many channel verification attempts. Please wait a moment.'
});

// Public Telegram configuration endpoint
router.get('/config', telegramController.getConfig);

// Broadcasts feed
router.get('/broadcasts', telegramController.getBroadcasts);
router.post('/broadcasts/:id/react', telegramController.reactToBroadcast);

// Bot console API
router.post('/bot', botRateLimiter, telegramController.handleBotCommand);

// Activation session lookup (for status checking & polling)
router.get('/activation-session/:token', botRateLimiter, telegramController.getActivationSession);

// Channel membership verification against @arxitclub
router.post('/verify-channel', channelVerifyLimiter, telegramController.verifyChannelMembership);

// Official Telegram Webhook listener (idempotent, deduplicated)
router.post('/webhook', telegramController.handleWebhook);

// Webhook diagnostics & sync endpoints
router.get('/webhook-info', telegramController.getWebhookInfo);
router.post('/sync-webhook', telegramController.syncWebhook);
router.post('/simulate-update', telegramController.simulateUpdate);

export default router;