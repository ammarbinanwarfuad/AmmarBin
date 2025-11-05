import { NextResponse } from "next/server";

/**
 * Utility to add server timing headers to API responses
 * Helps with TTFB diagnostics and performance monitoring
 */
export function addTimingHeaders(
  response: NextResponse,
  timings: {
    total?: number;
    db?: number;
    cache?: number;
    [key: string]: number | undefined;
  }
): NextResponse {
  // Add X-Response-Time header (total response time)
  if (timings.total !== undefined) {
    response.headers.set('X-Response-Time', `${timings.total}ms`);
  }

  // Add X-DB-Time header (database query time)
  if (timings.db !== undefined) {
    response.headers.set('X-DB-Time', `${timings.db}ms`);
  }

  // Add X-Cache-Time header (cache lookup time)
  if (timings.cache !== undefined) {
    response.headers.set('X-Cache-Time', `${timings.cache}ms`);
  }

  // Add Server-Timing header (W3C standard for detailed timing)
  const serverTimingParts: string[] = [];
  if (timings.db !== undefined) {
    serverTimingParts.push(`db;dur=${timings.db}`);
  }
  if (timings.cache !== undefined) {
    serverTimingParts.push(`cache;dur=${timings.cache}`);
  }
  // Add any other custom timings
  Object.entries(timings).forEach(([key, value]) => {
    if (key !== 'total' && key !== 'db' && key !== 'cache' && value !== undefined) {
      serverTimingParts.push(`${key};dur=${value}`);
    }
  });
  if (serverTimingParts.length > 0) {
    response.headers.set('Server-Timing', serverTimingParts.join(', '));
  }

  return response;
}

/**
 * Helper to measure execution time of async functions
 */
export async function measureTime<T>(
  label: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Timing] ${label}: ${duration}ms`);
  }
  
  return { result, duration };
}

