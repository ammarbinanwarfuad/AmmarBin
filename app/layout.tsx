import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { DeferredAnalytics } from "@/components/DeferredAnalytics";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleTagManager, GoogleTagManagerNoscript } from "@/components/GoogleTagManager";
import { ClientPerformanceMonitor } from "@/components/ClientPerformanceMonitor";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { PerformanceBudgetMonitor } from "@/components/PerformanceBudgetMonitor";
import "./globals.css";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true, // Preload font for faster FCP
  variable: "--font-inter",
  adjustFontFallback: true, // Optimize font fallback rendering
  fallback: ["system-ui", "arial"], // Fast fallback fonts
  // Optimize font loading - only load variable font weights we actually use
  weight: ["400", "500", "600", "700"], // Only load weights we use (400=normal, 700=bold, etc.)
});

export const metadata: Metadata = {
  title: "Ammar Bin Anwar Fuad - Portfolio",
  description: "Modern portfolio website showcasing projects, skills, and experience",
  keywords: ["portfolio", "developer", "projects", "blog"],
  // Performance optimizations - only set metadataBase if URL is available
  openGraph: {
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash on load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var effectiveTheme = theme === 'system' ? systemTheme : theme;
                  if (effectiveTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (effectiveTheme === 'light') {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Critical resource hints - Load early for fastest TTFB */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Preload LCP image - Critical for Largest Contentful Paint - Reduced quality to 65 for faster load */}
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/ammarbin/image/upload/c_fill,w_384,h_384,f_avif,q_65,dpr_2/v1762075570/profile/fshoacntppx9mgjwvlca.jpg"
          fetchPriority="high"
          imageSrcSet="https://res.cloudinary.com/ammarbin/image/upload/c_fill,w_192,h_192,f_avif,q_65,dpr_1/v1762075570/profile/fshoacntppx9mgjwvlca.jpg 192w, https://res.cloudinary.com/ammarbin/image/upload/c_fill,w_384,h_384,f_avif,q_65,dpr_2/v1762075570/profile/fshoacntppx9mgjwvlca.jpg 384w"
          imageSizes="192px"
        />
        {/* Preload critical CSS */}
        <link
          rel="preload"
          href="/_next/static/css/app.css"
          as="style"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Font preloading handled by Next.js font optimization */}
        {/* Google Analytics resource hints - Defer to reduce blocking */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        {/* Google Tag Manager - Loaded asynchronously */}
        <GoogleTagManager gtmId={gtmId} />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <GoogleTagManagerNoscript gtmId={gtmId} />
        {/* Defer non-critical components to improve initial load */}
        <Providers>{children}</Providers>
        {/* Load analytics after page is interactive */}
        <DeferredAnalytics />
        {/* Performance monitoring */}
        <ClientPerformanceMonitor />
        {/* Performance budget monitoring */}
        <PerformanceBudgetMonitor />
        {/* Service Worker for offline support */}
        <ServiceWorkerRegistration />
        {/* Vercel Analytics - Auto-detects on Vercel, works without ID */}
        <Analytics />
        {/* Vercel Speed Insights - Auto-detects on Vercel, works without ID */}
        <SpeedInsights />
      </body>
    </html>
  );
}
