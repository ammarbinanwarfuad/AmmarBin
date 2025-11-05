import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const start = Date.now();
    
    // If user is authenticated and trying to access login page, redirect to dashboard
    if (req.nextUrl.pathname === "/admin/login" && req.nextauth.token) {
      const response = NextResponse.redirect(new URL("/admin/dashboard", req.url));
      const duration = Date.now() - start;
      response.headers.set('X-Middleware-Duration', duration.toString());
      
      // Log slow middleware (>50ms is concerning)
      if (duration > 50) {
        console.warn(`Slow middleware: ${req.nextUrl.pathname} (${duration}ms)`);
      }
      
      return response;
    }
    
    // Additional custom logic can go here
    const response = NextResponse.next();
    const duration = Date.now() - start;
    response.headers.set('X-Middleware-Duration', duration.toString());
    
    // Log slow middleware (>50ms is concerning)
    if (duration > 50) {
      console.warn(`Slow middleware: ${req.nextUrl.pathname} (${duration}ms)`);
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

