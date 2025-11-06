import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const start = Date.now();
    
    // Get user's country from Vercel Edge Network (or Cloudflare)
    const geo = (req as { geo?: { country?: string; city?: string; region?: string } }).geo;
    const country = geo?.country || req.headers.get('cf-ipcountry') || 'US';
    const city = geo?.city || req.headers.get('cf-ipcity') || '';
    const region = geo?.region || req.headers.get('cf-region') || '';
    
    // CDN Optimization Headers
    const url = req.nextUrl;
    const isProduction = process.env.NODE_ENV === 'production';
    
    // If user is authenticated and trying to access login page, redirect to dashboard
    if (url.pathname === "/admin/login" && req.nextauth.token) {
      const response = NextResponse.redirect(new URL("/admin/dashboard", req.url));
      const duration = Date.now() - start;
      response.headers.set('X-Middleware-Duration', duration.toString());
      response.headers.set('X-Country', country);
      if (city) response.headers.set('X-City', city);
      if (region) response.headers.set('X-Region', region);
      
      // Log slow middleware (>50ms is concerning)
      if (duration > 50) {
        console.warn(`Slow middleware: ${url.pathname} (${duration}ms)`);
      }
      
      return response;
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
      // Skip caching for authenticated/admin routes
      if (!url.pathname.startsWith('/api/admin/') && isProduction) {
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        response.headers.set('CDN-Cache-Control', 'public, s-maxage=60');
      }
    }
    
    // Pages - edge caching with revalidation
    if (!url.pathname.startsWith('/admin/') && !url.pathname.startsWith('/api/') && isProduction) {
      // Cache public pages at edge for faster global loads
      response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      response.headers.set('CDN-Cache-Control', 'public, s-maxage=3600');
    }
    
    const duration = Date.now() - start;
    response.headers.set('X-Middleware-Duration', duration.toString());
    
    // Log slow middleware (>50ms is concerning)
    if (duration > 50) {
      console.warn(`Slow middleware: ${url.pathname} (${duration}ms)`);
    }
    
    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Always allow access to the login page
        if (req.nextUrl.pathname === "/admin/login") {
          return true;
        }
        // For all other admin routes, require a valid token
        return !!token;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

// Protect all /admin routes
export const config = {
  matcher: ["/admin/:path*"],
};

