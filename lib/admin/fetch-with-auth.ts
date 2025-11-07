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
    
    // Log cookie status in development for debugging
    if (isDevelopment) {
      const hasCookies = cookieHeader.length > 0;
      if (hasCookies) {
        console.log(`[Admin Fetch] ✅ Cookies found for ${url} (${cookieHeader.split(';').length} cookie(s))`);
      } else {
        console.warn(`[Admin Fetch] ⚠️  No cookies found for ${url} - authentication may fail`);
      }
    }
    
    // Determine base URL for API calls
    // Priority: NEXTAUTH_URL > VERCEL_URL > localhost (dev)
    const baseUrl = process.env.NEXTAUTH_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || 'http://localhost:3000';
    
    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(`${baseUrl}${url}`, {
        cache: 'no-store', // Always fetch fresh data
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Cookie': cookieHeader, // ✅ Critical: Pass cookies for authentication
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
          console.warn(`[Admin Fetch] 🔒 Unauthorized (401) for ${url}`, errorContext);
          if (isDevelopment && !cookieHeader) {
            console.warn(`[Admin Fetch] 💡 Hint: No cookies were passed. Check if session is valid.`);
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

