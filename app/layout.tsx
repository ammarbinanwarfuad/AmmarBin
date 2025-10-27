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
      { url: '/light.png', media: '(prefers-color-scheme: light)' },
      { url: '/dark.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: [
      { url: '/light.png', media: '(prefers-color-scheme: light)' },
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
        <link rel="dns-prefetch" href="https://vercel.live" />
        <link rel="preconnect" href="https://vercel.live" crossOrigin="anonymous" />
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
        {/* Static favicon fallback for first paint and no-JS users */}
        <link rel="icon" type="image/png" href="/light.png" />
        <link rel="icon" type="image/png" href="/light.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" type="image/png" href="/dark.png" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/light.png" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon" href="/dark.png" media="(prefers-color-scheme: dark)" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {/* Defer non-critical components to improve initial load */}
        <Providers>{children}</Providers>
        {/* ⚡ Performance: Load analytics after page is interactive */}
        <DeferredAnalytics />
        {/* Performance monitoring */}
        <ClientPerformanceMonitor />
        {/* Performance budget monitoring */}
        <PerformanceBudgetMonitor />
        {/* Vercel Analytics - Auto-detects on Vercel, works without ID */}
        <Analytics />
        {/* Vercel Speed Insights - Auto-detects on Vercel, works without ID */}
        <SpeedInsights />
      </body>
    </html>
  );
}
