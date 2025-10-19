/**
 * Error tracking utilities
 * Centralized error reporting for better debugging
 */

interface ErrorInfo {
  message: string;
  stack?: string;
  url: string;
  userAgent?: string;
  timestamp: number;
  userId?: string;
}

/**
 * Report error to tracking service
 */
export async function reportError(error: Error, context?: Record<string, unknown>) {
  try {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: Date.now(),
    };

    // In production, send to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with Sentry or similar service
      // Example: Sentry.captureException(error, { extra: context });
      
      // For now, log to console in production (safely)
      safeConsoleError('Error tracked:', errorInfo, context);
    } else {
      // In development, just log to console (safely)
      safeConsoleError('Error:', errorInfo, context);
    }

    // Optionally send to your own API endpoint
    if (typeof window !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ error: errorInfo, context })], {
        type: 'application/json',
      });
      navigator.sendBeacon('/api/errors', blob);
    }
  } catch (reportingError) {
    // Silently fail - error reporting shouldn't break the app
    safeConsoleError('Failed to report error:', reportingError);
  }
}

/**
 * Safe console.error wrapper that won't throw errors
 */
function safeConsoleError(...args: unknown[]) {
  try {
    // Use setTimeout to avoid issues with console in certain contexts
    setTimeout(() => {
      try {
        if (typeof console !== 'undefined' && console.error) {
          console.error(...args);
        }
      } catch {
        // Ignore any errors from console.error
      }
    }, 0);
  } catch {
    // Completely ignore if setTimeout fails
  }
}

/**
 * Initialize error tracking
 */
export function initErrorTracking() {
  if (typeof window === 'undefined') return;

  // Global error handler
  window.addEventListener('error', (event) => {
    reportError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    reportError(
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason)),
      { type: 'unhandledrejection' }
    );
  });
}

/**
 * Create error boundary handler
 */
export function handleErrorBoundary(error: Error, errorInfo: React.ErrorInfo) {
  reportError(error, {
    componentStack: errorInfo.componentStack,
    type: 'react-error-boundary',
  });
}

