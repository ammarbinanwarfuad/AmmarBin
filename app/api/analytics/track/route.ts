import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PageView from "@/models/PageView";

// ⚡ Performance: Fire and forget - don't block response
export const dynamic = 'force-dynamic';
export const maxDuration = 5; // Max 5 seconds for edge cases

export async function POST(request: Request) {
  try {
    // Handle both JSON and Blob (from sendBeacon) requests
    let body: Record<string, unknown>;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      // Handle Blob from sendBeacon
      const blob = await request.blob();
      const text = await blob.text();
      body = JSON.parse(text);
    }
    const {
      path,
      referrer,
      userAgent: userAgentRaw,
      ipAddress,
      sessionId,
      duration,
      metadata,
    } = body;

    // Type guard: ensure userAgent is a string
    const userAgent = typeof userAgentRaw === 'string' ? userAgentRaw : undefined;

    // Determine device type from user agent
    let device = "unknown";
    if (userAgent) {
      if (/mobile|android|iphone|ipad/i.test(userAgent)) {
        device = /tablet|ipad/i.test(userAgent) ? "tablet" : "mobile";
      } else {
        device = "desktop";
      }
    }

    // Extract browser from user agent
    let browser = "unknown";
    if (userAgent) {
      if (userAgent.includes("Chrome")) browser = "Chrome";
      else if (userAgent.includes("Firefox")) browser = "Firefox";
      else if (userAgent.includes("Safari")) browser = "Safari";
      else if (userAgent.includes("Edge")) browser = "Edge";
    }

    // ⚡ CRITICAL: Return immediately, store in DB asynchronously
    // Use Promise.resolve().then() for serverless compatibility
    Promise.resolve().then(async () => {
      try {
        await connectDB();
        await PageView.create({
          path: typeof path === 'string' ? path : undefined,
          referrer: typeof referrer === 'string' ? referrer : undefined,
          userAgent: userAgent || undefined,
          ipAddress: typeof ipAddress === 'string' ? ipAddress : undefined,
          device,
          browser,
          sessionId: typeof sessionId === 'string' ? sessionId : `session-${Date.now()}-${Math.random()}`,
          duration: typeof duration === 'number' ? duration : undefined,
          metadata,
        });
      } catch (dbError) {
        // Silently fail - analytics shouldn't break the app
        if (process.env.NODE_ENV === 'development') {
          console.error("Error tracking page view:", dbError);
        }
      }
    }).catch(() => {
      // Ignore any errors in the background task
    });

    // Return immediately without waiting for DB
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    // Return success even on error to not break analytics
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

