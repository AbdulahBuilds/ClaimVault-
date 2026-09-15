import { Request, Response, NextFunction } from '../types/http';

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default 60s)
  maxRequests?: number; // Max requests allowed per window (default 10)
  message?: string;
}

export const createRateLimiter = (options: RateLimitOptions = {}) => {
  const windowMs = options.windowMs || 60 * 1000;
  const maxRequests = options.maxRequests || 10;
  const message = options.message || 'Too many requests. Please slow down and try again in a minute.';

  return (req: Request, res: Response, next: NextFunction) => {
    // In test environment, allow high throughput unless specifically testing rate limiter
    if (process.env.NODE_ENV === 'test' && !req.headers['x-test-ratelimit']) {
      return next();
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const clientKey = `${ip}_${req.path}`;
    const now = Date.now();

    let record = rateLimitStore.get(clientKey);
    if (!record) {
      record = { timestamps: [] };
      rateLimitStore.set(clientKey, record);
    }

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    const remaining = Math.max(0, maxRequests - record.timestamps.length);

    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(remaining));

    if (record.timestamps.length >= maxRequests) {
      const oldestTimestamp = record.timestamps[0];
      const retryAfterSeconds = Math.ceil((windowMs - (now - oldestTimestamp)) / 1000);

      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        error: 'TooManyRequests',
        message,
        retryAfterSeconds,
      });
    }

    record.timestamps.push(now);
    next();
  };
};

export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Too many authentication attempts. Please wait 60 seconds before trying again.',
});

export const storageRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: 'Upload limit reached. Please wait before uploading more receipts.',
});
