import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Helper key generator for reverse proxy / Cloud Run environments
const clientKeyGenerator = (req: Request): string => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
    if (ip) return ip.trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
};

// General API Rate Limiter
export const generalApiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes default
  limit: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 200, // 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientKeyGenerator,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
    forwardedHeader: false,
    keyGeneratorIpFallback: false,
  },
  handler: (req: Request, res: Response) => {
    return res.status(429).json({
      success: false,
      data: null,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'تعداد درخواست‌های ارسالی بیش از حد مجاز است. لطفاً کمی بعد مجدداً تلاش نمایید.',
      },
      meta: {
        requestId: req.requestId || `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: 'v1',
        locale: req.requestedLocale || 'fa-IR',
      },
    });
  },
});

// Stricter Rate Limiter for AI Endpoints
export const aiApiLimiter = rateLimit({
  windowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes default
  limit: Number(process.env.AI_RATE_LIMIT_MAX_REQUESTS) || 20, // 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientKeyGenerator,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
    forwardedHeader: false,
    keyGeneratorIpFallback: false,
  },
  handler: (req: Request, res: Response) => {
    return res.status(429).json({
      success: false,
      data: null,
      error: {
        code: 'AI_RATE_LIMIT_EXCEEDED',
        message: 'سهمیه استفاده از سرویس هوش مصنوعی تکمیل شده است. لطفاً پس از گذشت دوره محدودیت تلاش فرمایید.',
      },
      meta: {
        requestId: req.requestId || `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: 'v1',
        locale: req.requestedLocale || 'fa-IR',
      },
    });
  },
});
