/**
 * Performance monitoring utilities
 * Tracks Core Web Vitals and performance metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
}

/**
 * Report performance metric to API
 */
export async function reportMetric(metric: PerformanceMetric) {
  try {
    // Use sendBeacon for reliable delivery (works even if page is unloading)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(metric)], {
        type: 'application/json',
      });
      navigator.sendBeacon('/api/rum', blob);
    } else {
      // Fallback to fetch
      await fetch('/api/rum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
        keepalive: true, // Keep request alive even if page unloads
      });
    }
  } catch (error) {
    // Silently fail - performance monitoring shouldn't break the app
    console.error('Failed to report performance metric:', error);
  }
}

/**
 * Measure and report performance metrics
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Report Web Vitals
  // Note: onFID is deprecated, use onINP instead
  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    onCLS((metric) => {
      reportMetric({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
        url: window.location.pathname,
      });
    });

    onFCP((metric) => {
      reportMetric({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
        url: window.location.pathname,
      });
    });

    onLCP((metric) => {
      reportMetric({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
        url: window.location.pathname,
      });
    });

    onTTFB((metric) => {
      reportMetric({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
        url: window.location.pathname,
      });
    });

    onINP((metric) => {
      reportMetric({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
        url: window.location.pathname,
      });
    });
  }).catch(() => {
    // web-vitals not available, skip
  });
}

/**
 * Wrap async functions with performance monitoring
 * Tracks execution time and logs slow operations
 */
export async function withPerformanceMonitoring<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`[PERF] ${name} took ${duration}ms`);
    }
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[PERF] ${name} failed after ${duration}ms:`, error);
    throw error;
  }
}

