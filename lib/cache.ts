// In-memory cache for API responses
// For production, consider using Redis for distributed caching

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private maxSize: number = 1000; // Maximum number of cache entries

  set<T>(key: string, data: T, ttl: number = 60000): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Delete all cache entries matching a pattern
   * Supports wildcard patterns like "admin:media:*"
   */
  deletePattern(pattern: string): void {
    if (pattern.includes('*')) {
      const prefix = pattern.replace('*', '');
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.delete(pattern);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
const memoryCache = new MemoryCache();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Cache API response with TTL
 * @param key - Cache key
 * @param fetcher - Function that returns the data to cache
 * @param ttl - Time to live in milliseconds (default: 5 minutes)
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> {
  // Check cache first
  const cached = memoryCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch and cache
  const data = await fetcher();
  memoryCache.set(key, data, ttl);
  return data;
}

/**
 * Invalidate cache entry
 * Supports wildcard patterns like "admin:media:*"
 */
export function invalidateCache(key: string): void {
  if (key.includes('*')) {
    memoryCache.deletePattern(key);
  } else {
    memoryCache.delete(key);
  }
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  memoryCache.clear();
}

/**
 * Get cache statistics (for monitoring)
 */
export function getCacheStats() {
  return {
    size: memoryCache['cache'].size,
    maxSize: memoryCache['maxSize'],
  };
}

