import 'dotenv/config';
import fs from 'fs';
import path from 'path';

function sanitizeTelegramHandle(raw, defaultHandle = 'ARXITCLUB_bot') {
  if (!raw) return defaultHandle;
  return raw.replace(/^https?:\/\/t\.me\//i, '').replace(/^@/, '').split('/')[0].split('?')[0].trim() || defaultHandle;
}

const rawBot = process.env.TELEGRAM_BOT_USERNAME || 'ARXITCLUB_bot';
const botUsername = sanitizeTelegramHandle(rawBot, 'ARXITCLUB_bot');

const rawChannel = process.env.TELEGRAM_CHANNEL_USERNAME || 'arxitclub';
const channelUsername = sanitizeTelegramHandle(rawChannel, 'arxitclub');

// ── Critical secret validation ──────────────────────────────────────────────
// Fail fast at startup when secrets required for security are absent.
// Never provide guessable fallbacks for JWT_SECRET or TELEGRAM_WEBHOOK_SECRET.
function requireEnv(name) {
  const val = (process.env[name] || '').trim();
  if (!val) {
    console.error(`[FATAL] Missing required environment variable: ${name}. Set it in your .env file and restart.`);
    process.exit(1);
  }
  return val;
}

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  APP_URL: (process.env.APP_URL || '').trim().replace(/\/$/, ''),
  // BUG-02 FIX: No guessable fallback — exits immediately if not set.
  JWT_SECRET: requireEnv('JWT_SECRET'),
  TOKEN_EXPIRY_SECONDS: 7 * 24 * 60 * 60, // 7 days
  // Official Telegram Bot Identity (ARX IT CLUB OF SJS)
  TELEGRAM_BOT_USERNAME: botUsername,
  TELEGRAM_BOT_DISPLAY_NAME: 'ARX IT CLUB OF SJS Official Bot',
  TELEGRAM_BOT_URL: `https://t.me/${botUsername}`,
  // Official Telegram Channel (@arxitclub)
  TELEGRAM_CHANNEL_USERNAME: channelUsername,
  TELEGRAM_CHANNEL_HANDLE: `@${channelUsername}`,
  TELEGRAM_CHANNEL_LINK: `https://t.me/${channelUsername}`,
  // Secure server-side Bot API Token (Never exposed to client)
  TELEGRAM_BOT_TOKEN: (process.env.TELEGRAM_BOT_TOKEN || '').trim(),
  // BUG-01 FIX: No hardcoded secret fallback — exits if not set.
  TELEGRAM_WEBHOOK_SECRET: requireEnv('TELEGRAM_WEBHOOK_SECRET'),
  CLUB_NAME: 'ARX IT CLUB OF SJS',
  CLUB_TAGLINE: 'Learn. Build. Grow.',
  AUTHORITY_SIGNER: 'ARX IT CLUB OF SJS Academic Council',
  AUTHORITY_PRESIDENT: 'ARX IT CLUB OF SJS President'
};

/**
 * Updates TELEGRAM_BOT_TOKEN in memory only.
 *
 * SEC-05 FIX: Removed disk-write behaviour. In containerised / cloud deployments
 * secrets must come from mounted secrets or environment variables, not runtime
 * file mutations. The bot token is kept in-memory for the lifetime of this process.
 * To persist a new token across restarts, update your .env or secret manager and redeploy.
 */
export function persistTelegramBotToken(newToken) {
  const cleanToken = (newToken || '').trim();
  CONFIG.TELEGRAM_BOT_TOKEN = cleanToken;
  process.env.TELEGRAM_BOT_TOKEN = cleanToken;
  console.log(`[Config] TELEGRAM_BOT_TOKEN updated in-memory (${cleanToken ? 'configured' : 'cleared'}). Redeploy to persist permanently.`);
}

/**
 * Updates Bot username and display identity dynamically
 */
export function setBotIdentity(username, displayName) {
  const cleanUsername = sanitizeTelegramHandle(username, CONFIG.TELEGRAM_BOT_USERNAME);
  CONFIG.TELEGRAM_BOT_USERNAME = cleanUsername;
  CONFIG.TELEGRAM_BOT_URL = `https://t.me/${cleanUsername}`;
  if (displayName) {
    CONFIG.TELEGRAM_BOT_DISPLAY_NAME = displayName;
  }
}