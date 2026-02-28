import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { DeferredAnalytics } from "@/components/DeferredAnalytics";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClientPerformanceMonitor } from "@/components/ClientPerformanceMonitor";
import { PerformanceBudgetMonitor } from "@/components/PerformanceBudgetMonitor";
import "./globals.css";


// ⚡ Performance: Use Inter variable font for smaller file size
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true, // Preload font for faster FCP
  variable: "--font-inter",
  adjustFontFallback: true, // Optimize font fallback rendering
  fallback: ["system-ui", "arial"], // Fast fallback fonts
  // Variable font - no weight array needed, supports all weights dynamically
});

export const metadata: Metadata = {
  title: "Ammar Bin Anwar Fuad - Portfolio",
  description: "Modern portfolio website showcasing projects, skills, and experience",
  keywords: ["portfolio", "developer", "projects", "blog"],
  icons: {
    icon: [
      { url: '/dark.png', media: '(prefers-color-scheme: light)' },
      { url: '/dark.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: [
      { url: '/dark.png', media: '(prefers-color-scheme: light)' },
      { url: '/dark.png', media: '(prefers-color-scheme: dark)' },
    ],
  },
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
                  // Fall back to system theme when no preference is saved (e.g. after logout clears localStorage)
                  var effectiveTheme = (theme === 'system' || !theme) ? systemTheme : theme;
                  if (effectiveTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
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
        <link rel="dns-prefetch" href="https://vercel.live" />
        <link rel="preconnect" href="https://vercel.live" crossOrigin="anonymous" />
        {/* LCP image preload is handled inside HeroContent with fetchPriority="high" on the <Image> component
            so we don't hardcode a URL here that could fall out of sync when the profile image is updated */}
        {/* Preload critical CSS */}
        <link
          rel="preload"
          href="/_next/static/css/app.css"
          as="style"
        />
        {/* Google Fonts preconnect removed — Inter is self-hosted via next/font, no external fetch needed */}
        {/* Font preloading handled by Next.js font optimization (Inter is self-hosted — no Google Fonts connection needed) */}
        {/* Icons are declared via the metadata export above — no manual link tags needed */}
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {/* Defer non-critical components to improve initial load */}
        <Providers>{children}</Providers>
        {/* ⚡ Performance: Load analytics after page is interactive */}
        <DeferredAnalytics />
        {/* Performance monitoring — dev only, no overhead in production */}
        {process.env.NODE_ENV === 'development' && <ClientPerformanceMonitor />}
        {/* Performance budget monitoring — dev only */}
        {process.env.NODE_ENV === 'development' && <PerformanceBudgetMonitor />}
        {/* Vercel Analytics - Auto-detects on Vercel, works without ID */}
        <Analytics />
        {/* Vercel Speed Insights - Auto-detects on Vercel, works without ID */}
        <SpeedInsights />
      </body>
    </html>
  );
}
