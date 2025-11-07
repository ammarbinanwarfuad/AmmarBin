/**
 * Database initialization module
 * This module can be imported to pre-warm the database connection
 * Useful for server-side initialization in production environments
 */

import { preWarmConnection } from './db';
import { validateEnv } from './env-validation';

// Validate environment variables on module load
if (typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    console.error('[ENV] Environment validation failed:', error);
    // In production, this should fail fast
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

/**
 * Initialize database connection early
 * This function can be called from server components or API routes
 * to establish the connection before the first user request
 */
export async function initializeDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    // Pre-warm connection in production for faster first request
    await preWarmConnection();
  }
}

// Auto-initialize in production if this module is imported
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  // Only run on server-side
  initializeDatabase().catch((error) => {
    // Fail silently - connection will be established on first request anyway
    console.warn('DB: Auto-initialization failed:', error);
  });
}

