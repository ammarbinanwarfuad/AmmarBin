"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const startTimeRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip tracking for admin routes
    if (pathname?.startsWith("/admin")) {
      return;
    }

    // Generate or get session ID
    const getSessionId = () => {
      let sessionId = sessionStorage.getItem("analytics_session_id");
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem("analytics_session_id", sessionId);
      }
      return sessionId;
    };

    // Track page view - fire and forget, don't block
    const trackPageView = () => {
      try {
        sessionIdRef.current = getSessionId();
        startTimeRef.current = Date.now();

        // Use sendBeacon if available for better performance
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify({
            path: pathname,
            referrer: document.referrer || undefined,
            userAgent: navigator.userAgent,
            sessionId: sessionIdRef.current,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          })], { type: 'application/json' });
          
          navigator.sendBeacon('/api/analytics/track', blob);
        } else {
          // Fallback to fetch with keepalive
          fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              path: pathname,
              referrer: document.referrer || undefined,
              userAgent: navigator.userAgent,
              sessionId: sessionIdRef.current,
              metadata: {
                timestamp: new Date().toISOString(),
              },
            }),
            keepalive: true,
          }).catch(() => {
            // Silently fail
          });
        }
      } catch {
        // Silently fail
      }
    };

    // Defer tracking to not block page load
    if (typeof window !== "undefined") {
      if (document.readyState === 'complete') {
        setTimeout(trackPageView, 100);
      } else {
        window.addEventListener('load', () => setTimeout(trackPageView, 100), { once: true });
      }
    }

    // Return cleanup function for tracking duration
    return () => {
      if (startTimeRef.current && sessionIdRef.current && pathname) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (duration > 0) {
          // Update duration (fire and forget) - use sendBeacon if available
          if (typeof navigator !== "undefined" && navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify({
              path: pathname,
              sessionId: sessionIdRef.current,
              duration,
              metadata: {
                timestamp: new Date().toISOString(),
              },
            })], { type: 'application/json' });
            
            navigator.sendBeacon('/api/analytics/track', blob);
          } else {
            fetch("/api/analytics/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                path: pathname,
                sessionId: sessionIdRef.current,
                duration,
                metadata: {
                  timestamp: new Date().toISOString(),
                },
              }),
              keepalive: true,
            }).catch(() => {
              // Ignore errors
            });
          }
        }
      }
    };
  }, [pathname]);

  return null;
}

