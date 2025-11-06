"use client";

import { useEffect, useState } from 'react';

export function ServiceWorkerRegistration() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register in both dev and production (for testing)
      const shouldRegister = process.env.NODE_ENV === 'production' || 
                            process.env.NEXT_PUBLIC_ENABLE_SW === 'true';
      
      if (!shouldRegister) {
        return;
      }
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, prompt user to refresh
                  if (confirm('New version available! Refresh to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Handle offline/online events
      const handleOnline = () => {
        setIsOnline(true);
        console.log('[SW] Connection restored');
        // Optionally show a toast notification
        if (typeof window !== 'undefined' && 'toast' in window) {
          const toast = (window as { toast?: { success: (message: string) => void; error: (message: string) => void } }).toast;
          if (toast) {
            toast.success('Connection restored');
          }
        }
      };

      const handleOffline = () => {
        setIsOnline(false);
        console.log('[SW] Connection lost');
        // Optionally show a toast notification
        if (typeof window !== 'undefined' && 'toast' in window) {
          const toast = (window as { toast?: { success: (message: string) => void; error: (message: string) => void } }).toast;
          if (toast) {
            toast.error('You are offline. Some features may be limited.');
          }
        }
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Suppress unused variable warning - isOnline may be used in future
  void isOnline;

  return null; // This component doesn't render anything
}

