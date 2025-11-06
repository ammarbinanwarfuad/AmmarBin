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

        // Report to analytics endpoint
        if (process.env.NODE_ENV === 'production') {
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

    // Report all metrics after page load
    const timeout = setTimeout(() => {
      const exceeded = getExceededBudgets(metrics);
      if (exceeded.length > 0 && process.env.NODE_ENV === 'production') {
        console.warn(`[Performance Budget] ${exceeded.length} budget(s) exceeded:`, exceeded);
      }
    }, 5000); // Wait 5 seconds for all metrics to be collected

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return null; // This component doesn't render anything
}

