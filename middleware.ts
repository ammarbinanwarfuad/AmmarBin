import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "./lib/logger";

export async function middleware(req: NextRequest) {
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
        logger.warn('Slow middleware execution', { pathname: url.pathname, duration });
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
  
  // Static assets - long-term caching
  if (url.pathname.startsWith('/_next/static/') || 
      url.pathname.startsWith('/_next/image') ||
      /\.(jpg|jpeg|png|gif|webp|avif|svg|ico|woff|woff2|ttf|eot)$/i.test(url.pathname)) {
    if (isProduction) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      response.headers.set('CDN-Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
  
  // API routes - edge caching with stale-while-revalidate
  if (url.pathname.startsWith('/api/')) {
    // Skip caching for authenticated/admin and auth routes
    if (!url.pathname.startsWith('/api/admin/') && !url.pathname.startsWith('/api/auth/') && isProduction) {
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      response.headers.set('CDN-Cache-Control', 'public, s-maxage=60');
    }
  }
  
  const duration = Date.now() - start;
  response.headers.set('X-Middleware-Duration', duration.toString());
  
  // Log slow middleware (>50ms is concerning)
  if (duration > 50) {
    logger.warn('Slow middleware execution', { pathname: url.pathname, duration });
  }
  
  return response;
}

// Protect all /admin routes
export const config = {
  matcher: [
    "/admin/:path*",
  ],
};

