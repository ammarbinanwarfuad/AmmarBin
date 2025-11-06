import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Optimized cache invalidation utility
 * Designed to be non-blocking and performant
 */

// Cache path mappings for efficient lookups
const CONTENT_TYPE_PATHS: Record<string, string[]> = {
  projects: ['/', '/projects', '/api/projects'],
  blog: ['/', '/blog', '/api/blog'],
  skills: ['/', '/skills', '/api/skills'],
  education: ['/', '/education', '/api/education'],
  experience: ['/', '/experience', '/api/experience'],
  certifications: ['/', '/certifications', '/api/certifications'],
  profile: ['/', '/about', '/api/profile'],
  participation: ['/', '/participation', '/api/participation'],
};

// Pre-computed all paths for 'all' type
const ALL_PATHS = Object.values(CONTENT_TYPE_PATHS).flat();

/**
 * Invalidate cache for specific content types
 * Optimized for performance - runs asynchronously with timeout protection
 */
async function invalidateContentCache(
  contentType: 'projects' | 'blog' | 'skills' | 'education' | 'experience' | 'certifications' | 'profile' | 'participation' | 'all'
): Promise<boolean> {
  // Use AbortController for timeout protection (max 2 seconds)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    // Get paths to revalidate (pre-computed for performance)
    const pathsToRevalidate = contentType === 'all' 
      ? ALL_PATHS 
      : (CONTENT_TYPE_PATHS[contentType] || []);

    // Batch revalidate operations (non-blocking)
    const revalidatePromises = pathsToRevalidate.map(path => {
      try {
        // Revalidate both page and layout in parallel
        revalidatePath(path, 'page');
        revalidatePath(path, 'layout');
      } catch (error) {
        // Silently handle individual path errors
        console.warn(`Failed to revalidate path ${path}:`, error);
      }
    });

    // Revalidate by tag (single operation)
    // Note: revalidateTag may not be available in all Next.js versions
    // Using revalidatePath is sufficient for cache invalidation
    try {
      const tag = contentType === 'all' ? 'all-content' : contentType;
      // revalidateTag is available but may have type issues in some Next.js versions
      // The revalidatePath calls above are sufficient for cache invalidation
      if (typeof revalidateTag === 'function') {
        (revalidateTag as (tag: string) => void)(tag);
      }
    } catch (error) {
      console.warn(`Failed to revalidate tag ${contentType}:`, error);
    }

    // Wait for all revalidations (with timeout)
    await Promise.allSettled(revalidatePromises);

    // Optional: Purge Vercel cache (only if configured, with timeout)
    if (process.env.VERCEL_TOKEN && !controller.signal.aborted) {
      await purgeVercelCache(pathsToRevalidate, controller.signal).catch(() => {
        // Silently fail - revalidation is more important
      });
    }

    clearTimeout(timeout);
    return true;
  } catch (error) {
    clearTimeout(timeout);
    // Don't throw - cache invalidation failure shouldn't break the API
    console.warn('Cache invalidation completed with warnings:', error);
    return false;
  }
}

/**
 * Purge Vercel cache via API (optional, non-blocking)
 * 
 * This function requires VERCEL_TOKEN and VERCEL_PROJECT_ID environment variables.
 * 
 * To set up:
 * 1. Get VERCEL_TOKEN from: https://vercel.com/account/tokens
 * 2. Get VERCEL_PROJECT_ID from: Vercel Dashboard → Project → Settings → General
 * 3. Add both to Vercel Environment Variables
 * 
 * Note: Cache invalidation works without these (using Next.js revalidation),
 * but adding them enables additional Vercel CDN cache purging for faster updates.
 */
async function purgeVercelCache(
  paths: string[],
  signal: AbortSignal
): Promise<void> {
  // Only purge API routes (pages are handled by revalidatePath)
  const apiPaths = paths.filter(p => p.startsWith('/api/'));
  
  if (apiPaths.length === 0 || signal.aborted) {
    return;
  }

  // Use Vercel API to purge cache (fire and forget)
  // Note: This requires VERCEL_TOKEN and VERCEL_PROJECT_ID env vars
  const projectId = process.env.VERCEL_PROJECT_ID;
  const token = process.env.VERCEL_TOKEN;

  if (!projectId || !token) {
    // Silently skip if not configured (revalidation still works)
    return;
  }

  // Batch purge requests (max 5 at a time to avoid rate limits)
  const batchSize = 5;
  for (let i = 0; i < apiPaths.length; i += batchSize) {
    if (signal.aborted) break;
    
    const batch = apiPaths.slice(i, i + batchSize);
    
    // Fire and forget - don't wait for response
    Promise.allSettled(
      batch.map(path =>
        fetch(`https://api.vercel.com/v1/deployments/${projectId}/cache/purge`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paths: [path] }),
          signal,
        }).catch(() => {
          // Silently fail individual requests
        })
      )
    ).catch(() => {
      // Silently fail batch
    });
  }
}

/**
 * Quick helper to invalidate cache after content updates
 * 
 * ⚡ PERFORMANCE OPTIMIZED:
 * - Runs asynchronously (non-blocking)
 * - Fire-and-forget pattern
 * - 2-second timeout protection
 * - Error handling prevents API slowdown
 * - Minimal resource usage
 */
export async function invalidateCacheAfterUpdate(
  contentType: 'projects' | 'blog' | 'skills' | 'education' | 'experience' | 'certifications' | 'profile' | 'participation' | 'all'
): Promise<void> {
  // Fire and forget - don't block the API response
  // This ensures zero impact on response time
  // Use Promise.resolve().then() for universal compatibility
  Promise.resolve().then(() => {
    invalidateContentCache(contentType).catch((error) => {
      // Log but don't throw - cache invalidation is best-effort
      if (process.env.NODE_ENV === 'development') {
        console.warn('Background cache invalidation failed:', error);
      }
    });
  });
}

/**
 * Synchronous cache invalidation (use only when necessary)
 * ⚠️ Use sparingly - can add latency if called synchronously
 */
export async function invalidateCacheSync(
  contentType: 'projects' | 'blog' | 'skills' | 'education' | 'experience' | 'certifications' | 'profile' | 'participation' | 'all'
): Promise<boolean> {
  return invalidateContentCache(contentType);
}

