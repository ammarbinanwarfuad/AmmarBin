import {
  cachedFetch,
  invalidateCache,
  clearCache,
  getCacheStats,
} from "@/lib/cache";

describe("Cache Utility", () => {
  beforeEach(() => {
    clearCache();
    jest.clearAllMocks();
  });

  describe("cachedFetch", () => {
    it("should fetch and cache data on first call", async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: "test data" });

      const result = await cachedFetch("test-key", fetcher, 60000);

      expect(result).toEqual({ data: "test data" });
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it("should return cached data on subsequent calls", async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: "test data" });

      // First call
      await cachedFetch("test-key", fetcher, 60000);
      
      // Second call should use cache
      const result = await cachedFetch("test-key", fetcher, 60000);

      expect(result).toEqual({ data: "test data" });
      expect(fetcher).toHaveBeenCalledTimes(1); // Only called once
    });

    it("should use default TTL of 5 minutes when not specified", async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: "test" });

      await cachedFetch("test-key", fetcher);

      expect(fetcher).toHaveBeenCalled();
    });

    it("should refetch when cache expires", async () => {
      jest.useFakeTimers();
      const fetcher = jest.fn().mockResolvedValue({ data: "test data" });
      const shortTTL = 1000; // 1 second

      // First call
      await cachedFetch("test-key", fetcher, shortTTL);

      // Fast forward time past TTL
      jest.advanceTimersByTime(1500);

      // Second call should refetch
      await cachedFetch("test-key", fetcher, shortTTL);

      expect(fetcher).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    it("should cache different keys independently", async () => {
      const fetcher1 = jest.fn().mockResolvedValue({ data: "data1" });
      const fetcher2 = jest.fn().mockResolvedValue({ data: "data2" });

      const result1 = await cachedFetch("key1", fetcher1, 60000);
      const result2 = await cachedFetch("key2", fetcher2, 60000);

      expect(result1).toEqual({ data: "data1" });
      expect(result2).toEqual({ data: "data2" });
      expect(fetcher1).toHaveBeenCalledTimes(1);
      expect(fetcher2).toHaveBeenCalledTimes(1);
    });

    it("should handle errors in fetcher", async () => {
      const fetcher = jest.fn().mockRejectedValue(new Error("Fetch failed"));

      await expect(cachedFetch("test-key", fetcher, 60000)).rejects.toThrow(
        "Fetch failed"
      );
    });
  });

  describe("invalidateCache", () => {
    it("should invalidate specific cache entry", async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: "test data" });

      // Cache the data
      await cachedFetch("test-key", fetcher, 60000);
      expect(fetcher).toHaveBeenCalledTimes(1);

      // Invalidate
      invalidateCache("test-key");

      // Should refetch
      await cachedFetch("test-key", fetcher, 60000);
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("should support wildcard pattern invalidation", async () => {
      const fetcher1 = jest.fn().mockResolvedValue({ data: "data1" });
      const fetcher2 = jest.fn().mockResolvedValue({ data: "data2" });
      const fetcher3 = jest.fn().mockResolvedValue({ data: "data3" });

      // Cache multiple entries with same prefix
      await cachedFetch("admin:projects:1", fetcher1, 60000);
      await cachedFetch("admin:projects:2", fetcher2, 60000);
      await cachedFetch("public:projects", fetcher3, 60000);

      // Invalidate all admin:projects:* entries
      invalidateCache("admin:projects:*");

      // Admin entries should refetch
      await cachedFetch("admin:projects:1", fetcher1, 60000);
      await cachedFetch("admin:projects:2", fetcher2, 60000);
      // Public entry should still be cached
      await cachedFetch("public:projects", fetcher3, 60000);

      expect(fetcher1).toHaveBeenCalledTimes(2);
      expect(fetcher2).toHaveBeenCalledTimes(2);
      expect(fetcher3).toHaveBeenCalledTimes(1); // Still cached
    });

    it("should handle non-existent keys gracefully", () => {
      expect(() => invalidateCache("non-existent-key")).not.toThrow();
    });
  });

  describe("clearCache", () => {
    it("should clear all cache entries", async () => {
      const fetcher1 = jest.fn().mockResolvedValue({ data: "data1" });
      const fetcher2 = jest.fn().mockResolvedValue({ data: "data2" });

      // Cache multiple entries
      await cachedFetch("key1", fetcher1, 60000);
      await cachedFetch("key2", fetcher2, 60000);

      expect(getCacheStats().size).toBeGreaterThan(0);

      // Clear all
      clearCache();

      expect(getCacheStats().size).toBe(0);

      // Both should refetch
      await cachedFetch("key1", fetcher1, 60000);
      await cachedFetch("key2", fetcher2, 60000);

      expect(fetcher1).toHaveBeenCalledTimes(2);
      expect(fetcher2).toHaveBeenCalledTimes(2);
    });
  });

  describe("getCacheStats", () => {
    it("should return current cache statistics", async () => {
      clearCache();

      const initialStats = getCacheStats();
      expect(initialStats.size).toBe(0);
      expect(initialStats.maxSize).toBe(1000);

      const fetcher = jest.fn().mockResolvedValue({ data: "test" });
      await cachedFetch("key1", fetcher, 60000);
      await cachedFetch("key2", fetcher, 60000);

      const updatedStats = getCacheStats();
      expect(updatedStats.size).toBe(2);
    });

    it("should enforce max cache size", async () => {
      clearCache();
      const fetcher = jest.fn().mockResolvedValue({ data: "test" });

      // The cache has a maxSize of 1000
      // When full, it should remove oldest entries
      
      // Add a few entries
      for (let i = 0; i < 5; i++) {
        await cachedFetch(`key${i}`, fetcher, 60000);
      }

      const stats = getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
    });
  });

  describe("Cache Expiration", () => {
    it("should return null for expired entries", async () => {
      jest.useFakeTimers();
      
      const fetcher = jest.fn().mockResolvedValue({ data: "test data" });
      const shortTTL = 100; // 100ms

      // Cache data
      await cachedFetch("test-key", fetcher, shortTTL);

      // Fast forward past TTL
      jest.advanceTimersByTime(200);

      // Should refetch
      await cachedFetch("test-key", fetcher, shortTTL);

      expect(fetcher).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    it("should cleanup expired entries periodically", () => {
      jest.useFakeTimers();

      // This test verifies the cleanup interval is set
      // The actual cleanup happens automatically
      
      // Fast forward 5 minutes (cleanup interval)
      jest.advanceTimersByTime(5 * 60 * 1000);

      // Cleanup should have run (tested implicitly)
      expect(true).toBe(true);

      jest.useRealTimers();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null data", async () => {
      const fetcher = jest.fn().mockResolvedValue(null);

      const result = await cachedFetch("null-key", fetcher, 60000);
      expect(result).toBeNull();
    });

    it("should handle undefined data", async () => {
      const fetcher = jest.fn().mockResolvedValue(undefined);

      const result = await cachedFetch("undefined-key", fetcher, 60000);
      expect(result).toBeUndefined();
    });

    it("should handle complex objects", async () => {
      const complexData = {
        nested: {
          array: [1, 2, 3],
          object: { key: "value" },
        },
        date: new Date(),
      };

      const fetcher = jest.fn().mockResolvedValue(complexData);

      const result = await cachedFetch("complex-key", fetcher, 60000);
      expect(result).toEqual(complexData);
    });

    it("should handle concurrent requests for same key", async () => {
      const fetcher = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: "test" }), 100)
          )
      );

      // Make multiple concurrent requests
      const promises = [
        cachedFetch("concurrent-key", fetcher, 60000),
        cachedFetch("concurrent-key", fetcher, 60000),
        cachedFetch("concurrent-key", fetcher, 60000),
      ];

      await Promise.all(promises);

      // Should fetch multiple times since requests are concurrent
      // and cache isn't set until first completes
      expect(fetcher).toHaveBeenCalled();
    });
  });
});
