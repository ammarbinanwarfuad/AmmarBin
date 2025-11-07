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
  // Build log message with optional details
  const ipInfo = options?.ip ? ` [IP: ${options.ip}]` : '';
  const logMessage = `[REQ] ${method} ${path} - ${status} (${duration}ms)${ipInfo}`;
  
  // Always log in production, optionally in development
  if (process.env.NODE_ENV === 'production') {
    // Log slow requests (>1s) as warnings
    if (duration > 1000) {
      console.warn(`${logMessage} - SLOW`);
    } else {
      console.log(logMessage);
    }
  } else if (process.env.NODE_ENV === 'development' && duration > 500) {
    // Only log slow requests in development
    console.warn(logMessage);
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

