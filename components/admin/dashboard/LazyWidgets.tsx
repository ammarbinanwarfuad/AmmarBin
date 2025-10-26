// ✅ OPTIMIZED: Lazy-loaded dashboard widgets for faster initial load

// Lazy load heavy dashboard components
// These will only load when needed, reducing initial bundle size

// NOTE: These are infrastructure components ready to use when you create the widget components
// To use them, create the widget components in ./widgets/ directory and uncomment below

/*
export const LazyAnalyticsWidget = dynamic(
  () => import('./widgets/AnalyticsWidget').then(mod => ({ default: mod.AnalyticsWidget })),
  {
    loading: () => (
      <div className="h-64 bg-muted rounded-lg animate-pulse" />
    ),
    ssr: false, // Don't render on server (client-only)
  }
);

export const LazyWebVitalsChart = dynamic(
  () => import('./widgets/WebVitalsChart').then(mod => ({ default: mod.WebVitalsChart })),
  {
    loading: () => (
      <div className="h-96 bg-muted rounded-lg animate-pulse" />
    ),
    ssr: false,
  }
);

export const LazyLinkCheckerWidget = dynamic(
  () => import('./widgets/LinkCheckerWidget').then(mod => ({ default: mod.LinkCheckerWidget })),
  {
    loading: () => (
      <div className="h-48 bg-muted rounded-lg animate-pulse" />
    ),
    ssr: false,
  }
);

export const LazySEOWidget = dynamic(
  () => import('./widgets/SEOWidget').then(mod => ({ default: mod.SEOWidget })),
  {
    loading: () => (
      <div className="h-64 bg-muted rounded-lg animate-pulse" />
    ),
    ssr: false,
  }
);

export const LazyRecentMessagesWidget = dynamic(
  () => import('./widgets/RecentMessagesWidget').then(mod => ({ default: mod.RecentMessagesWidget })),
  {
    loading: () => (
      <div className="h-64 bg-muted rounded-lg animate-pulse" />
    ),
    ssr: false,
  }
);
*/

// Export a placeholder to prevent build errors
export const LazyWidgetsReady = true;
