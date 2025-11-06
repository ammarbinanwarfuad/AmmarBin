import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

/**
 * Generate ETag from data
 * Uses MD5 hash of JSON stringified data for consistency
 */
export function generateETag(data: unknown): string {
  const dataString = JSON.stringify(data);
  const hash = createHash('md5').update(dataString).digest('hex');
  return `"${hash}"`; // ETags should be quoted
}

/**
 * Check if request has matching ETag (304 Not Modified)
 */
export function checkETag(request: Request, etag: string): boolean {
  const ifNoneMatch = request.headers.get('if-none-match');
  if (!ifNoneMatch) return false;
  
  // ETag comparison (weak tags start with W/)
  const requestETags = ifNoneMatch.split(',').map(tag => tag.trim());
  return requestETags.some(tag => tag === etag || tag === `W/${etag}`);
}

/**
 * Create NextResponse with ETag support
 * Returns 304 Not Modified if ETag matches, otherwise returns data with ETag header
 */
export function createETagResponse(
  data: unknown,
  request: Request,
  headers?: Record<string, string>
): NextResponse {
  const etag = generateETag(data);
  
  // Check if client has matching ETag
  if (checkETag(request, etag)) {
    return new NextResponse(null, {
      status: 304,
      statusText: 'Not Modified',
      headers: {
        'ETag': etag,
        'Cache-Control': headers?.['Cache-Control'] || 'public, s-maxage=60, stale-while-revalidate=300',
        'CDN-Cache-Control': headers?.['CDN-Cache-Control'] || 'public, s-maxage=60',
      },
    });
  }
  
  // Return data with ETag header
  const responseHeaders = {
    'ETag': etag,
    ...headers,
  };
  
  return NextResponse.json(data, {
    headers: responseHeaders,
  });
}

