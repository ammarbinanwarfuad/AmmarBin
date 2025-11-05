"use client";

import { useEffect } from "react";
import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from "web-vitals";

// Performance thresholds for alerting
const THRESHOLDS: Record<string, number> = {
  LCP: 2500, // Good: <2.5s, Great: <1.2s
  FCP: 1800, // Good: <1.8s, Great: <1.0s
  TTFB: 800, // Good: <800ms, Great: <600ms
  INP: 200, // Good: <200ms, Great: <100ms
  CLS: 0.1, // Good: <0.1, Great: <0.05
};

function sendToAnalytics(metric: Metric) {
  const threshold = THRESHOLDS[metric.name];
  
  // Alert on slow metrics in development
  if (process.env.NODE_ENV === 'development' && threshold && metric.value > threshold) {
    console.warn(
      `⚠️ Slow ${metric.name}: ${metric.value.toFixed(2)}ms (threshold: ${threshold}ms)`,
      {
        rating: metric.rating,
        url: window.location.href,
      }
    );
  }

  // Send to our API endpoint - fire and forget, don't block
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.sendBeacon) {
    // Use sendBeacon for better performance - doesn't block page
    const blob = new Blob([JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType,
      url: window.location.href,
      threshold: threshold,
      exceedsThreshold: threshold ? metric.value > threshold : false,
    })], { type: 'application/json' });
    
    navigator.sendBeacon('/api/rum', blob);
  } else {
    // Fallback to fetch with keepalive
    fetch("/api/rum", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        rating: metric.rating,
        delta: metric.delta,
        navigationType: metric.navigationType,
        url: window.location.href,
        threshold: threshold,
        exceedsThreshold: threshold ? metric.value > threshold : false,
      }),
      keepalive: true,
      // Don't wait for response
    }).catch(() => {
      // Silently fail
    });
  }
}

export function WebVitals() {
  useEffect(() => {
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics); // INP replaced FID in web-vitals v3+
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  }, []);

  return null;
}

