"use client";

import { useEffect } from "react";
import { onCLS, onFCP, onLCP, onTTFB, onINP } from "web-vitals";
import { checkBudget, getExceededBudgets } from "@/lib/performance-budgets";

/**
 * Client-side performance budget monitoring
 * Tracks Core Web Vitals and alerts when budgets are exceeded
 */
export function PerformanceBudgetMonitor() {
  useEffect(() => {
    const metrics: Record<string, number> = {};

    // Track Core Web Vitals
    onCLS((metric) => {
      metrics.CLS = metric.value;
      checkAndReport(metric.name, metric.value);
    });

    onFCP((metric) => {
      metrics.FCP = metric.value;
      checkAndReport(metric.name, metric.value);
    });

    onLCP((metric) => {
      metrics.LCP = metric.value;
      checkAndReport(metric.name, metric.value);
    });

    onTTFB((metric) => {
      metrics.TTFB = metric.value;
      checkAndReport(metric.name, metric.value);
    });

    onINP((metric) => {
      metrics.INP = metric.value;
      checkAndReport(metric.name, metric.value);
    });

    function checkAndReport(metricName: string, value: number) {
      const { exceeded, budget } = checkBudget(metricName, value);

      if (exceeded && budget) {
        const message = `Performance Budget Exceeded: ${metricName} = ${value.toFixed(2)}ms (threshold: ${budget.threshold}ms)`;
        // Check if we're in development mode (client-side detection)
        const isDevelopment = typeof window !== 'undefined' && (
          window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1' ||
          process.env.NODE_ENV === 'development'
        );
        
        // In development, only log as info (not errors) since performance is naturally slower
        // In production, respect the severity level
        if (isDevelopment) {
          // In development, just log as info to avoid cluttering console with errors
          console.info(`[Performance Budget] ${message} (dev mode - slower performance expected)`);
        } else {
          // In production, use the configured severity
          if (budget.severity === 'error') {
            console.error(`[Performance Budget] ${message}`);
            
            // Send to error tracking service (if configured)
            if (typeof window !== 'undefined' && 'Sentry' in window) {
              const sentry = (window as { Sentry?: { captureMessage: (message: string, level: string) => void } }).Sentry;
              if (sentry) {
                sentry.captureMessage(message, 'warning');
              }
            }
          } else {
            console.warn(`[Performance Budget] ${message}`);
          }

          // Report to analytics endpoint (only in production)
          fetch('/api/admin/performance-alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              metric: metricName,
              value,
              threshold: budget.threshold,
              severity: budget.severity,
              url: window.location.href,
              timestamp: new Date().toISOString(),
            }),
          }).catch(() => {
            // Silently fail - don't block user experience
          });
        }
      }
    }

    // Report all metrics after page load (only in production)
    const timeout = setTimeout(() => {
      const isDevelopment = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        process.env.NODE_ENV === 'development'
      );
      
      if (!isDevelopment) {
        const exceeded = getExceededBudgets(metrics);
        if (exceeded.length > 0) {
          console.warn(`[Performance Budget] ${exceeded.length} budget(s) exceeded:`, exceeded);
        }
      }
    }, 5000); // Wait 5 seconds for all metrics to be collected

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return null; // This component doesn't render anything
}

