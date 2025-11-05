"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import analytics components to reduce initial bundle size
const WebVitals = dynamic(() => import("./WebVitals").then(mod => ({ default: mod.WebVitals })), { ssr: false });
const AnalyticsTracker = dynamic(() => import("./AnalyticsTracker").then(mod => ({ default: mod.AnalyticsTracker })), { ssr: false });
const GoogleAnalytics = dynamic(() => import("./GoogleAnalytics").then(mod => ({ default: mod.GoogleAnalytics })), { ssr: false });

/**
 * Deferred Analytics Component
 * Loads analytics components after page is interactive to improve initial load performance
 */
export function DeferredAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Load analytics after page is fully loaded and interactive
    if (typeof window !== "undefined") {
      // Wait for page to be fully loaded first
      const loadAnalytics = () => {
        // Use requestIdleCallback if available, otherwise setTimeout
        if (typeof window.requestIdleCallback === "function") {
          window.requestIdleCallback(() => {
            setShouldLoad(true);
          }, { timeout: 5000 }); // Longer timeout to ensure page is interactive
        } else {
          // Wait longer to ensure page is fully loaded
          setTimeout(() => {
            setShouldLoad(true);
          }, 3000);
        }
      };

      // Wait for page load event
      if (document.readyState === 'complete') {
        loadAnalytics();
      } else {
        window.addEventListener('load', loadAnalytics, { once: true });
      }
    }
  }, []);

  if (!shouldLoad) return null;

  return (
    <>
      <WebVitals />
      <AnalyticsTracker />
      <GoogleAnalytics />
    </>
  );
}

