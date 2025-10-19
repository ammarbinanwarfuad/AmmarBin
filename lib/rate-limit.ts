/**
 * Rate Limiting Utility
 * Prevents brute force attacks on login
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    lockedUntil?: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now && !rateLimitStore[key].lockedUntil) {
      delete rateLimitStore[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxAttempts: number; // Maximum attempts allowed
  windowMs: number; // Time window in milliseconds
  lockoutDurationMs: number; // How long to lock after max attempts
}

const defaultConfig: RateLimitConfig = {
  maxAttempts: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutDurationMs: 30 * 60 * 1000, // 30 minutes lockout
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = defaultConfig
): { allowed: boolean; remainingAttempts: number; lockedUntil?: Date } {
  const now = Date.now();
  const entry = rateLimitStore[identifier];

  // If no entry exists, create one
  if (!entry) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  // Check if account is locked
  if (entry.lockedUntil && entry.lockedUntil > now) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: new Date(entry.lockedUntil),
    };
  }

  // Reset if window has passed
  if (entry.resetTime < now) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  // Increment attempt count
  entry.count++;

  // Lock if max attempts exceeded
  if (entry.count > config.maxAttempts) {
    entry.lockedUntil = now + config.lockoutDurationMs;
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: new Date(entry.lockedUntil),
    };
  }

  return {
    allowed: true,
    remainingAttempts: config.maxAttempts - entry.count,
  };
}

export function resetRateLimit(identifier: string): void {
  delete rateLimitStore[identifier];
}

export function getRateLimitStatus(identifier: string): {
  isLocked: boolean;
  attempts: number;
  lockedUntil?: Date;
} {
  const entry = rateLimitStore[identifier];
  const now = Date.now();

  if (!entry) {
    return { isLocked: false, attempts: 0 };
  }

  const isLocked = !!(entry.lockedUntil && entry.lockedUntil > now);

  return {
    isLocked,
    attempts: entry.count,
    lockedUntil: entry.lockedUntil ? new Date(entry.lockedUntil) : undefined,
  };
}

