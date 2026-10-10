import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRouter from './backend/src/routes/index.js';
import { CONFIG } from './backend/src/config/index.js';
import { startTelegramLongPolling } from './backend/src/controllers/telegramController.js';

// SEC-04 FIX: CORS — only allow configured origins, not the entire internet.
// Install with: bun add cors @types/cors   (or npm/yarn equivalent)

let cors = null;
try {
  cors = (await import('cors')).default;
} catch {
  console.warn('[Server] cors package not found. Install with: bun add cors — API is currently open to all origins.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // SEC-03 FIX: Lock trust proxy to 1 hop so X-Forwarded-For can't be spoofed.
  app.set('trust proxy', 1);

  // SEC-04 FIX: CORS — restrict to configured origins only.
  // In production, ALLOWED_ORIGINS MUST be set to the Vercel frontend domain.
  // Example: ALLOWED_ORIGINS=https://arx-website.vercel.app
  if (cors) {
    let allowedOrigins;
    if (process.env.ALLOWED_ORIGINS) {
      allowedOrigins = process.env.ALLOWED_ORIGINS
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
    } else if (isProduction) {
      // In production with no ALLOWED_ORIGINS set, only allow the configured APP_URL.
      // Never fall back to a wildcard.
      allowedOrigins = [CONFIG.APP_URL].filter(Boolean);
      if (allowedOrigins.length === 0) {
        console.error('[CORS] WARNING: No ALLOWED_ORIGINS or APP_URL configured in production. API will reject all cross-origin requests.');
      }
    } else {
      allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];
    }
    app.use(cors({
      origin: (origin, callback) => {
        // Allow server-to-server (no origin header) and whitelisted origins
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS policy: origin '${origin}' is not permitted.`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
  }

  // Request parsing with generous limits for image upload payloads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static uploads directory for public media files
  const uploadsDir = path.resolve(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Security: Private award files are protected from unauthenticated access.
  // Authorized administrators access award documents via /api/admin/award-files/:id/download.
  app.get('/uploads/awards/*', (_req, res) => {
    res.status(403).json({
      error: 'Access denied. Award documents are confidential and accessible only via authorized administrator endpoints.'
    });
  });

  app.use('/uploads', express.static(uploadsDir));
  app.use(express.static(path.resolve(__dirname, 'public')));

  // Direct routes for Vanilla HTML/JS frontend pages
  app.get('/admin-applications.html', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'admin-applications.html'));
  });
  app.get('/dashboard.html', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'dashboard.html'));
  });
  app.get('/application-status.html', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'application-status.html'));
  });

  // Mount API endpoints
  app.use('/api', apiRouter);

  if (!isProduction) {
    // Vite middleware in development mode with configFile: false to avoid .vite-temp generation loops under tsx watch
    const { createServer: createViteServer } = await import('vite');
    const react = (await import('@vitejs/plugin-react')).default;
    const tailwindcss = (await import('@tailwindcss/vite')).default;
    const vite = await createViteServer({
      configFile: false,
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.')
        }
      },
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 IT Club server running at http://0.0.0.0:${PORT}`);
    console.log(`🤖 Telegram Bot Target: @${CONFIG.TELEGRAM_BOT_USERNAME} (${CONFIG.TELEGRAM_BOT_URL})`);
    console.log(`📢 Preserved Official Channel: ${CONFIG.TELEGRAM_CHANNEL_HANDLE}`);
    console.log(`🔒 Telegram Bot API Token: ${CONFIG.TELEGRAM_BOT_TOKEN ? '[CONFIGURED]' : '[NOT CONFIGURED in environment]'}`);
    console.log(`🌐 Deployed Base URL: ${CONFIG.APP_URL || 'Not specified'}`);

    // Authoritative Telegram Connection Delivery Engine:
    // Cloud Run and AI Studio preview domains (*.run.app) use an auth/cookie proxy that intercepts external webhook POSTs with HTTP 302.
    // Long Polling uses outbound HTTPS requests from Node.js to api.telegram.org/getUpdates, guaranteeing 100% real-time update delivery.
    if (CONFIG.TELEGRAM_BOT_TOKEN) {
      const isCustomProductionWebhook =
        process.env.TELEGRAM_DELIVERY_MODE === 'webhook' &&
        CONFIG.APP_URL &&
        CONFIG.APP_URL.startsWith('https://') &&
        !CONFIG.APP_URL.includes('.run.app') &&
        !CONFIG.APP_URL.includes('localhost') &&
        !CONFIG.APP_URL.includes('127.0.0.1');

      if (isCustomProductionWebhook) {
        const webhookUrl = `${CONFIG.APP_URL}/api/telegram/webhook`;
        fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/getWebhookInfo`).
          then((r) => r.json()).
          then((info) => {
            if (info.ok) {
              console.log(`[Telegram Webhook Check] Current Telegram Webhook URL: "${info.result?.url}"`);
              if (info.result?.url !== webhookUrl) {
                console.log(`[Telegram Webhook Sync] Updating webhook registration to ${webhookUrl}...`);
                fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/setWebhook`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    url: webhookUrl,
                    secret_token: CONFIG.TELEGRAM_WEBHOOK_SECRET,
                    allowed_updates: ['message', 'callback_query'],
                    drop_pending_updates: false
                  })
                }).
                  then((r) => r.json()).
                  then((res) => {
                    console.log(`[Telegram Webhook Sync] Registration result: ${res.ok ? 'SUCCESS' : res.description}`);
                  }).
                  catch((e) => console.warn(`[Telegram Webhook Sync] Could not register webhook:`, e.message));
              } else {
                console.log(`[Telegram Webhook Check] Webhook is already synchronized.`);
              }
            }
          }).
          catch((e) => console.warn(`[Telegram Webhook Check] Could not verify webhook on boot:`, e.message));
      } else {
        console.log(`[Telegram Bot Engine] Starting Authoritative Long Polling Engine for @${CONFIG.TELEGRAM_BOT_USERNAME}...`);
        startTelegramLongPolling().catch((e) => {
          console.warn(`[Telegram Polling Engine] Failed to start long polling:`, e.message);
        });
      }
    } else {
      console.log(`[Telegram Bot Engine] TELEGRAM_BOT_TOKEN not configured. Set TELEGRAM_BOT_TOKEN in server environment to connect live Telegram.`);
    }
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});