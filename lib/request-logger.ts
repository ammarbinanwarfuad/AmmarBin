/**
 * Request Logging Utility
 * Logs important requests for debugging and monitoring
 */

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
  const log: RequestLog = {
    method,
    path,
    status,
    duration,
    ...(options?.ip && { ip: options.ip }),
    ...(options?.userAgent && { userAgent: options.userAgent }),
  };

  // Always log in production, optionally in development
  if (process.env.NODE_ENV === 'production') {
    // Log slow requests (>1s) as warnings
    if (duration > 1000) {
      console.warn(`[REQ] ${method} ${path} - ${status} (${duration}ms) - SLOW`);
    } else {
      console.log(`[REQ] ${method} ${path} - ${status} (${duration}ms)`);
    }
  } else if (process.env.NODE_ENV === 'development' && duration > 500) {
    // Only log slow requests in development
    console.warn(`[REQ] ${method} ${path} - ${status} (${duration}ms)`);
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

