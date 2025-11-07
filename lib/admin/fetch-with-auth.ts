import { headers } from "next/headers";

/**
 * Server-side fetch utility for admin API routes
 * 
 * IMPORTANT: When making fetch calls from Server Components to internal API routes,
 * cookies are NOT automatically forwarded. This utility manually passes cookies
 * from the incoming request headers to ensure authentication works correctly.
 * 
 * This fixes the 401 Unauthorized errors that occur when server components
 * fetch from authenticated API routes after login.
 * 
 * @param url - The API route path (e.g., '/api/admin/analytics')
 * @returns Promise resolving to the JSON response data, or null on error
 */
export async function fetchAdminData(url: string): Promise<unknown> {
  const startTime = Date.now();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  try {
    // Get cookies from the incoming request headers
    // This is necessary because Server Components don't automatically forward cookies
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie') || '';
    
    // Log cookie status for debugging (in both dev and production for troubleshooting)
    const hasCookies = cookieHeader.length > 0;
    const cookieCount = cookieHeader.split(';').filter(c => c.trim()).length;
    // Check for session cookie - NextAuth uses different names in dev vs production
    // In production with secure:true, it might use __Secure- prefix or __Host- prefix
    const hasSessionCookie = cookieHeader.includes('next-auth.session-token') 
      || cookieHeader.includes('__Secure-next-auth.session-token')
      || cookieHeader.includes('__Host-next-auth.session-token')
      || cookieHeader.match(/next-auth\.session-token[^;]*/); // Match any variant
    
    if (isDevelopment) {
      if (hasCookies) {
        console.log(`[Admin Fetch] ✅ Cookies found for ${url} (${cookieCount} cookie(s), session: ${hasSessionCookie ? 'YES' : 'NO'})`);
      } else {
        console.warn(`[Admin Fetch] ⚠️  No cookies found for ${url} - authentication may fail`);
      }
    } else {
      // In production, log warnings if cookies are missing (for debugging issues)
      if (!hasCookies) {
        console.warn(`[Admin Fetch] ⚠️  No cookies found for ${url}`);
      } else if (!hasSessionCookie) {
        console.warn(`[Admin Fetch] ⚠️  Cookies found but no session cookie for ${url}`);
      }
    }
    
    // For server-side fetches, use relative URLs to ensure cookies are properly handled
    // When using absolute URLs, Next.js makes external HTTP requests which may not
    // properly forward cookies. Using relative URLs ensures the request stays internal.
    const fetchUrl = url.startsWith('http') ? url : url;
    
    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      // For server-side internal API calls, we need to construct the full URL
      // but use the same protocol/host as the incoming request
      let fullUrl: string;
      
      if (url.startsWith('http')) {
        // Already a full URL
        fullUrl = url;
      } else {
        // For internal API calls, try to use the same origin
        // In production, use NEXTAUTH_URL; in dev, use localhost
        const baseUrl = process.env.NEXTAUTH_URL 
          || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
          || 'http://localhost:3000';
        fullUrl = `${baseUrl}${url}`;
      }
      
      const response = await fetch(fullUrl, {
        cache: 'no-store', // Always fetch fresh data
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Cookie': cookieHeader, // ✅ Critical: Pass cookies for authentication
          // Also forward other important headers
          'User-Agent': headersList.get('user-agent') || 'Next.js Server',
        },
      });
      
      clearTimeout(timeoutId);
      
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        // Enhanced error logging with context
        const errorContext = {
          url,
          status: response.status,
          statusText: response.statusText,
          duration: `${duration}ms`,
          hasCookies: cookieHeader.length > 0,
        };
        
        if (response.status === 401) {
          console.warn(`[Admin Fetch] 🔒 Unauthorized (401) for ${url}`, {
            ...errorContext,
            cookieCount,
            hasSessionCookie,
            cookiePreview: cookieHeader.substring(0, 100), // First 100 chars for debugging
          });
          if (!cookieHeader) {
            console.warn(`[Admin Fetch] 💡 Hint: No cookies were passed. Check if session is valid.`);
          } else if (!hasSessionCookie) {
            console.warn(`[Admin Fetch] 💡 Hint: Cookies present but no session cookie. Session may have expired.`);
          }
        } else {
          console.warn(`[Admin Fetch] ❌ Failed to fetch ${url}: ${response.status} ${response.statusText} (${duration}ms)`);
        }
        
        return null;
      }
      
      const data = await response.json();
      const totalDuration = Date.now() - startTime;
      
      // Log successful fetch in development
      if (isDevelopment) {
        console.log(`[Admin Fetch] ✅ Successfully fetched ${url} in ${totalDuration}ms`);
      }
      
      return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle timeout specifically
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        const duration = Date.now() - startTime;
        console.error(`[Admin Fetch] ⏱️  Timeout fetching ${url} after ${duration}ms`);
        return null;
      }
      
      throw fetchError;
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Enhanced error logging
    console.error(`[Admin Fetch] 💥 Error fetching ${url} after ${duration}ms:`, {
      error: errorMessage,
      url,
      duration: `${duration}ms`,
    });
    
    return null;
  }
}

