/**
 * Environment Variable Validation
 * Validates required environment variables at startup
 */

export function validateEnv() {
  const required = {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Validate NEXTAUTH_URL format in production
  if (process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL) {
    try {
      const url = new URL(process.env.NEXTAUTH_URL);
      if (url.protocol !== 'https:') {
        console.warn(
          '[ENV] Warning: NEXTAUTH_URL should use HTTPS in production'
        );
      }
    } catch {
      throw new Error('NEXTAUTH_URL must be a valid URL');
    }
  }
}

