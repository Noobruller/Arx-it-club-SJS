






export function createRateLimiter(options)




{
  const store = new Map();
  const { windowMs, max, message = 'Too many requests from this address. Please wait a moment and try again.' } = options;

  // Cleanup old records periodically
  const cleanupInterval = Math.max(windowMs, 60000);
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (record.resetAt <= now) {
        store.delete(key);
      }
    }
  }, cleanupInterval).unref();

  return (req, res, next) => {
    const ip =
    options.keyGenerator?.(req) ||
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'unknown-client';

    const now = Date.now();
    const existing = store.get(ip);

    if (!existing || existing.resetAt <= now) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (existing.count >= max) {
      const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(429).json({
        error: message,
        retryAfter: retryAfterSeconds
      });
      return;
    }

    existing.count += 1;
    next();
  };
}