// ✅ OPTIMIZED: API route caching wrapper for easy integration

import { NextResponse } from 'next/server';
import { getCached, invalidateCache, CACHE_TTL } from './redis-cache';

/**
 * Wrap API route handler with caching
 * 
 * @param handler - Async function that returns data
 * @param options - Caching options
 * @returns NextResponse with cached or fresh data
 * 
 * @example
 * export async function GET(request: Request) {
 *   return withCache(
 *     'projects',
 *     async () => {
 *       const projects = await Project.find();
 *       return { projects };
 *     },
 *     { ttl: CACHE_TTL.PROJECTS }
 *   );
 * }
 */
export async function withCache<T>(
  cachePrefix: string,
  handler: () => Promise<T>,
  options: {
    ttl?: number;
    cacheKey?: string;
    revalidate?: number;
  } = {}
): Promise<NextResponse> {
  const {
    ttl = CACHE_TTL.DASHBOARD,
    cacheKey = cachePrefix,
    revalidate = ttl,
  } = options;

  try {
    const data = await getCached(cacheKey, handler, ttl);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=${Math.floor(revalidate / 2)}`,
        'X-Cache-Key': cacheKey,
      },
    });
  } catch (error) {
    console.error(`[API Cache Error] ${cachePrefix}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Invalidate cache after mutation
 * Call this after POST, PUT, DELETE operations
 * 
 * @param patterns - Cache key patterns to invalidate
 * 
 * @example
 * // After creating a project
 * await invalidateCachePatterns(['projects:*', 'dashboard:*']);
 */
export async function invalidateCachePatterns(patterns: string[]): Promise<void> {
  await Promise.all(patterns.map(pattern => invalidateCache(pattern)));
}
