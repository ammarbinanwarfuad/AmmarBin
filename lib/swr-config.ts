// ✅ OPTIMIZED: Global SWR configuration with request deduplication

import { SWRConfiguration } from 'swr';

/**
 * Global SWR configuration
 * - Request deduplication enabled by default
 * - Optimized revalidation settings
 * - Error retry with exponential backoff
 */
export const swrConfig: SWRConfiguration = {
  // Request deduplication - prevent duplicate requests within time window
  dedupingInterval: 2000, // 2 seconds (default is 2000ms)
  
  // Revalidation settings
  revalidateOnFocus: false, // Don't revalidate when window regains focus
  revalidateOnReconnect: true, // Revalidate when network reconnects
  revalidateIfStale: true, // Revalidate if data is stale
  
  // Error retry with exponential backoff
  errorRetryCount: 3, // Retry failed requests 3 times
  errorRetryInterval: 5000, // Wait 5s before first retry
  
  // Prevent infinite retry loops
  shouldRetryOnError: (error) => {
    // Don't retry on 4xx errors (client errors)
    if (error?.status >= 400 && error?.status < 500) {
      return false;
    }
    return true;
  },
  
  // Loading timeout
  loadingTimeout: 3000, // Show loading state after 3s
  
  // Focus throttle - prevent too frequent revalidation
  focusThrottleInterval: 5000, // 5 seconds
  
  // Keep previous data while revalidating
  keepPreviousData: true,
};

/**
 * SWR configuration for admin pages
 * More aggressive caching and deduplication
 */
export const adminSwrConfig: SWRConfiguration = {
  ...swrConfig,
  dedupingInterval: 5000, // 5 seconds for admin (less frequent updates)
  revalidateOnFocus: false,
  revalidateOnMount: false, // Don't revalidate on mount if data exists
  refreshInterval: 0, // No auto-refresh (use manual refresh buttons)
};

/**
 * SWR configuration for public pages
 * Balance between freshness and performance
 */
export const publicSwrConfig: SWRConfiguration = {
  ...swrConfig,
  dedupingInterval: 2000, // 2 seconds
  revalidateOnFocus: false,
  revalidateOnMount: true,
  refreshInterval: 0, // No auto-refresh
};

/**
 * SWR configuration for real-time data
 * More frequent updates, less deduplication
 */
export const realtimeSwrConfig: SWRConfiguration = {
  ...swrConfig,
  dedupingInterval: 1000, // 1 second
  revalidateOnFocus: true,
  refreshInterval: 30000, // Refresh every 30 seconds
};
