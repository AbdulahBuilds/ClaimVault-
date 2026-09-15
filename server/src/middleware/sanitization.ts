import { Request, Response, NextFunction } from '../types/http';

/**
 * Strip dangerous HTML and script tags from string values
 */
export const sanitizeString = (val: string): string => {
  if (!val || typeof val !== 'string') return val;

  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove <iframe> tags
    .replace(/javascript:[^\s"']*/gi, '') // Remove javascript: pseudo protocol
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers (e.g. onload=...)
    .replace(/<[^>]*>?/gm, '') // Strip remaining HTML tags
    .trim();
};

/**
 * Recursively sanitize all string properties in an object or array
 */
export const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      // Don't sanitize password fields or base64 data URLs as strings that might break formatting
      if (key === 'password' || key === 'fileData' || key === 'receiptImageUrl') {
        sanitized[key] = obj[key];
      } else {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Middleware to sanitize incoming request bodies
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};
