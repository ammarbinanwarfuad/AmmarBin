"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, startTransition } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  if (!mounted) {
    return (
      <div className="w-12 h-12 rounded-full bg-accent/50 animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  const handleToggle = () => {
    // Temporarily disable ALL transitions during theme change
    document.documentElement.classList.add("disable-transitions");
    setTheme(isDark ? "light" : "dark");
    
    // Re-enable after theme change completes
    setTimeout(() => {
      document.documentElement.classList.remove("disable-transitions");
    }, 300);
  };

  return (
    <motion.button
      onClick={handleToggle}
      className="relative w-12 h-12 rounded-full bg-accent border border-border flex items-center justify-center shadow-sm transition-none"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 25 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
          >
            <Moon className="h-5 w-5 text-yellow-500" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
          >
            <Sun className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
