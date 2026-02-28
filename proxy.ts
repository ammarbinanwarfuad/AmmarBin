import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const start = Date.now();
  
  // Get user's country from Vercel Edge Network (or Cloudflare)
  const geo = (req as unknown as { geo?: { country?: string; city?: string; region?: string } }).geo;
  const country = geo?.country || req.headers.get('cf-ipcountry') || 'US';
  const city = geo?.city || req.headers.get('cf-ipcity') || '';
  const region = geo?.region || req.headers.get('cf-region') || '';
  
  // CDN Optimization Headers
  const url = req.nextUrl;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Check for session cookie (edge-compatible way)
  const sessionCookie = req.cookies.get('next-auth.session-token') 
    || req.cookies.get('__Secure-next-auth.session-token');
  const hasSession = !!sessionCookie;
  
  // Login page handling
  if (url.pathname === "/admin/login") {
    // If already authenticated, redirect to dashboard
    if (hasSession) {
      const dashboardUrl = new URL("/admin/dashboard", req.url);
      const response = NextResponse.redirect(dashboardUrl);
      const duration = Date.now() - start;
      
      // Prevent caching of redirects
      response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      response.headers.set('CDN-Cache-Control', 'no-store');
      response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
      response.headers.set('X-Middleware-Duration', duration.toString());
      response.headers.set('X-Country', country);
      if (city) response.headers.set('X-City', city);
      if (region) response.headers.set('X-Region', region);
      
      if (duration > 50) {
        console.warn(`[Middleware] Slow: ${url.pathname} (${duration}ms)`);
      }
      
      return response;
    }
    
    // Not authenticated - allow access to login page with no-cache headers
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('X-Country', country);
    if (city) response.headers.set('X-City', city);
    if (region) response.headers.set('X-Region', region);
    return response;
  }
  
  // Protect all other admin routes
  if (url.pathname.startsWith("/admin") && !hasSession) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", url.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Apply edge middleware optimizations
  const response = NextResponse.next();
  
  // Set geo headers for analytics and optimization
  response.headers.set('X-Country', country);
  if (city) response.headers.set('X-City', city);
  if (region) response.headers.set('X-Region', region);
  
  // Note: static asset and API cache headers are set in vercel.json.
  // This proxy only matches /admin/* (see config.matcher below), so those
  // paths never reach here — handling them here was dead code.

  const duration = Date.now() - start;
  response.headers.set('X-Middleware-Duration', duration.toString());
  
  // Log slow middleware (>50ms is concerning)
  if (duration > 50) {
    console.warn(`[Middleware] Slow: ${url.pathname} (${duration}ms)`);
  }
  
  return response;
}

// Protect all /admin routes
export const config = {
  matcher: [
    "/admin/:path*",
  ],
};

