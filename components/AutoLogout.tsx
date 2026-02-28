"use client";

import { useEffect, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before logout

export function AutoLogout() {
  const { status } = useSession();
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  const handleLogout = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        const savedTheme = localStorage.getItem('theme');
        localStorage.clear();
        if (savedTheme) localStorage.setItem('theme', savedTheme);
        sessionStorage.clear();
      }
      
      await signOut({ callbackUrl: '/admin/login?logout=1&reason=timeout' });
    } catch (error) {
      console.error('Auto-logout error:', error);
      window.location.href = '/admin/login?logout=1&reason=timeout';
    }
  }, []);

  useEffect(() => {
    // Only apply auto-logout to admin routes
    if (!isAdminRoute || status !== "authenticated") {
      return;
    }

    let inactivityTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);

      // Set warning timer
      warningTimer = setTimeout(() => {
        toast(
          (t) => (
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Session Timeout Warning</p>
              <p className="text-sm">
                You will be logged out in 5 minutes due to inactivity.
              </p>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resetTimer();
                }}
                className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
              >
                Stay Logged In
              </button>
            </div>
          ),
          {
            duration: WARNING_TIME,
            icon: "⚠️",
          }
        );
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      // Set logout timer
      inactivityTimer = setTimeout(() => {
        toast.error("You have been logged out due to inactivity.", {
          duration: 5000,
        });
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    };

    // Events that indicate user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Initial timer
    resetTimer();

    // Cleanup
    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [isAdminRoute, status, handleLogout]);

  return null; // This component doesn't render anything
}

