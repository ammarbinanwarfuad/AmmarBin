import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js only executes a file named `middleware.ts` at the root.
// The previous `proxy.ts` file was never picked up — meaning all /admin
// routes had ZERO edge-level protection. This file fixes that.

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Check for session cookie — must match both names (dev vs production)
  // In production we use __Secure- prefix (matches lib/auth.ts cookie config)
  const sessionCookie =
    req.cookies.get("__Secure-next-auth.session-token") ||
    req.cookies.get("next-auth.session-token");
  const hasSession = !!sessionCookie;

  // If already authenticated, redirect away from login page
  if (url.pathname === "/admin/login") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protect all other /admin routes
  if (!hasSession) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
