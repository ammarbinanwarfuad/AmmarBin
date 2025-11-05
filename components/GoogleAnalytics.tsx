'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  // Initialize Google Analytics on mount
  useEffect(() => {
    if (!gaId || typeof window === 'undefined') return;

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };

    // Load gtag.js script if not already loaded
    if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      // Configure GA after script loads
      script.onload = () => {
        window.gtag('js', new Date());
        window.gtag('config', gaId, {
          page_path: pathname,
        });
      };
    } else {
      // Script already loaded, just configure
      window.gtag('config', gaId, {
        page_path: pathname,
      });
    }
  }, [gaId, pathname]); // Include pathname as dependency

  // Track page views on route changes
  useEffect(() => {
    if (!gaId || typeof window === 'undefined' || !window.gtag) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    window.gtag('config', gaId, {
      page_path: url,
    });
  }, [gaId, pathname, searchParams]);

  // Don't render anything - this is a script-only component
  return null;
}

