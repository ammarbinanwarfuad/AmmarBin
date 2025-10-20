/**
 * Performance Budgets Configuration
 * These budgets are used to monitor and alert on performance regressions
 */

export interface PerformanceBudget {
  metric: string;
  threshold: number;
  severity: 'error' | 'warning';
}

export const PERFORMANCE_BUDGETS: PerformanceBudget[] = [
  // Core Web Vitals
  {
    metric: 'FCP', // First Contentful Paint
    threshold: 1800, // 1.8s (Good threshold)
    severity: 'error',
  },
  {
    metric: 'LCP', // Largest Contentful Paint
    threshold: 2500, // 2.5s (Good threshold)
    severity: 'error',
  },
  {
    metric: 'TTFB', // Time to First Byte
    threshold: 800, // 800ms (Good threshold)
    severity: 'error',
  },
  {
    metric: 'INP', // Interaction to Next Paint
    threshold: 200, // 200ms (Good threshold)
    severity: 'error',
  },
  {
    metric: 'CLS', // Cumulative Layout Shift
    threshold: 0.1, // 0.1 (Good threshold)
    severity: 'error',
  },
  // Bundle Sizes
  {
    metric: 'initial-js-bundle',
    threshold: 200 * 1024, // 200KB gzipped
    severity: 'warning',
  },
  {
    metric: 'total-js-bundle',
    threshold: 500 * 1024, // 500KB gzipped
    severity: 'warning',
  },
  {
    metric: 'css-bundle',
    threshold: 50 * 1024, // 50KB gzipped
    severity: 'warning',
  },
  // Load Times
  {
    metric: 'first-load',
    threshold: 3000, // 3s
    severity: 'error',
  },
  {
    metric: 'repeat-visit',
    threshold: 1000, // 1s
    severity: 'warning',
  },
  {
    metric: 'route-navigation',
    threshold: 500, // 500ms
    severity: 'warning',
  },
  // API Response Times
  {
    metric: 'api-response-p95',
    threshold: 500, // 500ms (95th percentile)
    severity: 'error',
  },
  {
    metric: 'api-response-p99',
    threshold: 1000, // 1s (99th percentile)
    severity: 'warning',
  },
];

/**
 * Check if a metric value exceeds its budget
 */
export function checkBudget(
  metric: string,
  value: number
): { exceeded: boolean; budget: PerformanceBudget | null } {
  const budget = PERFORMANCE_BUDGETS.find((b) => b.metric === metric);
  
  if (!budget) {
    return { exceeded: false, budget: null };
  }

  const exceeded = value > budget.threshold;
  return { exceeded, budget };
}

/**
 * Get all exceeded budgets for a set of metrics
 */
export function getExceededBudgets(
  metrics: Record<string, number>
): Array<{ metric: string; value: number; budget: PerformanceBudget }> {
  const exceeded: Array<{ metric: string; value: number; budget: PerformanceBudget }> = [];

  for (const [metric, value] of Object.entries(metrics)) {
    const { exceeded: isExceeded, budget } = checkBudget(metric, value);
    if (isExceeded && budget) {
      exceeded.push({ metric, value, budget });
    }
  }

  return exceeded;
}

