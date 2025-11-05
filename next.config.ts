import type { NextConfig } from "next";
// Bundle analyzer (toggle with ANALYZE=true)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' })

const nextConfig: NextConfig = {
  // Image Optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 0, // No caching
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
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
    optimizeCss: true,
    viewTransition: true, // ✅ Smooth native transitions between routes
  },

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
  output: 'standalone', // Reduces bundle size in production

  // Bundle size budgets (warnings, not failures)
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // Webpack Configuration for react-pdf and bundle budgets
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // Bundle size budgets (production only)
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor bundle (react, next, etc.)
            vendor: {
              name: 'vendors',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              enforce: true,
              maxSize: 250000, // 250KB warning threshold
            },
            // Framer Motion in separate chunk (now lazy loaded)
            framerMotion: {
              name: 'framer-motion',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              chunks: 'all',
              priority: 30,
              enforce: true,
            },
            // React Markdown in separate chunk (now lazy loaded)
            reactMarkdown: {
              name: 'react-markdown',
              test: /[\\/]node_modules[\\/]react-markdown[\\/]/,
              chunks: 'all',
              priority: 30,
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
          // No caching
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      {
        // API routes - no caching
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      {
        // Static assets - no caching
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      {
        // Images - no caching
        source: "/:path*\\.(jpg|jpeg|png|gif|webp|avif|svg|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
