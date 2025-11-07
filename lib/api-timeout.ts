/**
 * Request Timeout Utility
 * Adds timeout protection to async operations
 */

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = 'Request timeout'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

/**
 * Timeout configuration for different operation types
 */
export const TIMEOUTS = {
  DATABASE: 10000, // 10 seconds
  API: 15000, // 15 seconds
  EXTERNAL: 30000, // 30 seconds
  DEFAULT: 10000, // 10 seconds
} as const;

