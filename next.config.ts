import type { NextConfig } from "next";

/* eslint-disable @typescript-eslint/no-require-imports */
// Bundle analyzer requires CommonJS module syntax
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' }) as (config: NextConfig) => NextConfig
/* eslint-enable @typescript-eslint/no-require-imports */

const nextConfig: NextConfig = {
  // Image Optimization
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
      // Note: via.placeholder.com and placehold.co are intentionally excluded.
      // Their DNS is unreliable on the server side — those images use unoptimized={true}
      // and are fetched directly by the browser.
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [65, 75, 90],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    minimumCacheTTL: 31536000, // Cache images for 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compiler Optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Experimental Features for Performance
  experimental: {
    optimizePackageImports: [
      "lucide-react", 
      "framer-motion", 
      "date-fns",
      "@radix-ui/react-dialog",
      "@radix-ui/react-popover",
      "@radix-ui/react-alert-dialog",
      "react-markdown",
      "react-hook-form",
      "@hookform/resolvers",
    ],
    optimizeCss: true,
    // View transitions only in production to avoid dev hot-reload conflicts
    viewTransition: process.env.NODE_ENV === 'production',
  },

  // Server external packages (moved from experimental in Next.js 16)
  serverExternalPackages: [
    'mongoose',
    'cloudinary',
    'sharp',
    'bcryptjs',
    'nodemailer',
  ],

  // Module optimization
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
  },

  // Production Optimizations
  reactStrictMode: true,
  poweredByHeader: false,

  // Compression
  compress: true,
  
  // Output optimization
  // Note: 'standalone' is for Docker/self-hosted. Vercel uses its own serverless infrastructure.
  // Remove or comment out for Vercel deployment
  // output: 'standalone',

  // Bundle size budgets (warnings, not failures)
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // Turbopack configuration (Next.js 16+)
  // Empty config to acknowledge we're using Turbopack and suppress warnings
  turbopack: {},

  // Webpack optimizations for bundle splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },

  // Security Headers & Performance Headers
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Performance headers for better TTFB
          {
            key: "Accept-CH",
            value: "DPR, Viewport-Width, Width",
          },
          // Cache-Control: No caching in dev, proper caching in production
          {
            key: "Cache-Control",
            value: isProduction
              ? "public, max-age=0, must-revalidate" // Allow CDN caching with revalidation
              : "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      {
        // API routes - Stale-While-Revalidate in production
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: isProduction
              ? "public, s-maxage=60, stale-while-revalidate=300" // CDN cache 60s, serve stale for 5min
              : "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: isProduction ? "public, s-maxage=60" : undefined,
          },
          {
            key: "Access-Control-Allow-Origin",
            value: isProduction
              ? "https://ammarbin.vercel.app"
              : "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ].filter((h): h is { key: string; value: string } => h.value !== undefined),
      },
      {
        // Static assets - Long-term caching in production
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: isProduction
              ? "public, max-age=31536000, immutable" // 1 year - immutable assets
              : "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: isProduction ? "public, max-age=31536000, immutable" : undefined,
          },
        ].filter((h): h is { key: string; value: string } => h.value !== undefined),
      },
      {
        // Images - cache for 1 year
        source: "/:path*\\.(jpg|jpeg|png|gif|webp|avif|svg|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: isProduction
              ? "public, max-age=31536000, immutable" // 1 year - images rarely change
              : "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: isProduction ? "public, max-age=31536000, immutable" : undefined,
          },
        ].filter((h): h is { key: string; value: string } => h.value !== undefined),
      },
      {
        // Public pages - cache for 1 minute, stale-while-revalidate for 1 hour
        source: "/((?!admin|api).*)",
        headers: [
          {
            key: "Cache-Control",
            value: isProduction
              ? "public, s-maxage=60, stale-while-revalidate=3600" // CDN cache 60s, serve stale for 1hr
              : "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      {
        // Auth routes - never cache
        source: "/api/auth/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      {
        // Admin login page - never cache
        source: "/admin/login",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        ],
      },
      {
        // Manifest - cache for 1 day
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, immutable",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
