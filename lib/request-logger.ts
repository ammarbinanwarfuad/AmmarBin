/**
 * Request Logging Utility
 * Logs important requests for debugging and monitoring
 */

import { logger } from './logger';

export interface RequestLog {
  method: string;
  path: string;
  status: number;
  duration: number;
  ip?: string;
  userAgent?: string;
}

export function logRequest(
  method: string,
  path: string,
  status: number,
  duration: number,
  options?: {
    ip?: string;
    userAgent?: string;
  }
) {
  const context = {
    method,
    path,
    status,
    duration,
    ip: options?.ip,
  };
  
  // Log slow requests (>1s) as warnings
  if (duration > 1000) {
    logger.warn('Slow request detected', context);
  } else if (process.env.NODE_ENV === 'production') {
    // Log all requests in production
    logger.info('Request completed', context);
  } else if (process.env.NODE_ENV === 'development' && duration > 500) {
    // Only log slow requests in development
    logger.warn('Slow request in development', context);
  }
}

/**
 * Extract client IP from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp.trim();
  }
  
  return 'unknown';
}

