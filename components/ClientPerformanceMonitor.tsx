"use client";

import { useEffect } from "react";
import { initPerformanceMonitoring } from "@/lib/performance-monitor";
import { initErrorTracking } from "@/lib/error-tracker";

/**
 * Client-side performance and error monitoring
 * Initializes performance tracking and error reporting
 */
export function ClientPerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring();
    
    // Initialize error tracking
    initErrorTracking();
  }, []);

  return null;
}

