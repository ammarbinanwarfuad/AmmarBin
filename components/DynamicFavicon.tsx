"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function DynamicFavicon() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;

    const faviconPath = resolvedTheme === "dark" ? "/dark.png" : "/dark.png";

    // Remove all existing favicon-related links
    const oldLinks = document.querySelectorAll('link[rel*="icon"]');
    oldLinks.forEach(link => link.remove());

    // Create new favicon link elements
    const iconLink = document.createElement("link");
    iconLink.rel = "icon";
    iconLink.type = "image/png";
    iconLink.href = `${faviconPath}?t=${Date.now()}`;
    
    const shortcutLink = document.createElement("link");
    shortcutLink.rel = "shortcut icon";
    shortcutLink.type = "image/png";
    shortcutLink.href = `${faviconPath}?t=${Date.now()}`;

    const appleTouchLink = document.createElement("link");
    appleTouchLink.rel = "apple-touch-icon";
    appleTouchLink.href = `${faviconPath}?t=${Date.now()}`;

    // Append new links
    document.head.appendChild(iconLink);
    document.head.appendChild(shortcutLink);
    document.head.appendChild(appleTouchLink);

  }, [resolvedTheme]);

  return null;
}
