// Enhanced Service Worker for PWA with Advanced Caching Strategies
const CACHE_VERSION = 'portfolio-v2';
const IMAGE_CACHE = 'portfolio-images-v2';
const STATIC_CACHE = 'portfolio-static-v2';
const API_CACHE = 'portfolio-api-v2';
const OFFLINE_PAGE = '/offline';

// Assets to cache immediately on install
const CRITICAL_ASSETS = [
  '/',
  '/offline',
  '/about',
  '/blog',
  '/projects',
  '/skills',
  '/contact',
];

// Image domains to cache (Cloudinary, etc.)
const IMAGE_DOMAINS = [
  'res.cloudinary.com',
];

// API routes that can be cached
const CACHEABLE_API_ROUTES = [
  '/api/profile',
  '/api/projects',
  '/api/blog',
  '/api/skills',
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(
          CRITICAL_ASSETS.map(url => new Request(url, { credentials: 'same-origin' }))
        );
      }),
      // Pre-cache offline page
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.add(new Request(OFFLINE_PAGE, { credentials: 'same-origin' }));
      }),
    ])
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => 
              !name.startsWith('portfolio-') || 
              (name !== CACHE_VERSION && name !== IMAGE_CACHE && name !== STATIC_CACHE && name !== API_CACHE)
            )
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
      // Take control of all pages immediately
      self.clients.claim(),
    ])
  );
});

// Helper: Check if URL is an image
function isImageRequest(url) {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg|ico)(\?.*)?$/i.test(url.pathname) ||
         IMAGE_DOMAINS.some(domain => url.hostname.includes(domain));
}

// Helper: Check if URL is an API route
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Helper: Check if API route is cacheable
function isCacheableAPI(url) {
  return CACHEABLE_API_ROUTES.some(route => url.pathname.startsWith(route));
}

// Helper: Check if URL is an authentication route (should never be cached)
function isAuthRequest(url) {
  return url.pathname.startsWith('/api/auth/') || 
         url.pathname.startsWith('/admin/');
}

// Helper: Check if URL is a Next.js static asset (should never be cached by SW)
function isNextStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.startsWith('/_next/image') ||
         url.pathname.startsWith('/_next/webpack');
}

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // ⚠️ CRITICAL: Skip ALL authentication, admin routes, and Next.js static assets
  if (isAuthRequest(url) || isNextStaticAsset(url)) {
    // Don't intercept - let browser handle these directly
    return;
  }

  // Skip cross-origin requests (except images from allowed domains)
  if (url.origin !== self.location.origin && !isImageRequest(url)) {
    return;
  }

  // Strategy 1: Cache-First for Images (fastest loading)
  if (isImageRequest(url)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached image immediately
            return cachedResponse;
          }

          // Fetch from network and cache
          return fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                // Cache the image for future use
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              // If network fails, return a placeholder or cached version
              return cache.match('/offline').catch(() => {
                return new Response('Image unavailable offline', {
                  status: 503,
                  headers: { 'Content-Type': 'text/plain' },
                });
              });
            });
        });
      })
    );
    return;
  }

  // Strategy 2: Network-First with Cache Fallback for API routes
  if (isAPIRequest(url) && isCacheableAPI(url)) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response && response.status === 200) {
              // Cache with TTL (expire after 5 minutes)
              const responseToCache = response.clone();
              cache.put(request, responseToCache);
              
              // Set expiration
              setTimeout(() => {
                cache.delete(request);
              }, 5 * 60 * 1000); // 5 minutes
            }
            return response;
          })
          .catch(() => {
            // Network failed, try cache
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // No cache available, return error
              return new Response(JSON.stringify({ error: 'Offline' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              });
            });
          });
      })
    );
    return;
  }

  // Strategy 3: Network-First for static pages (always try network first)
  if (url.origin === self.location.origin && !isAPIRequest(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Network failed, try cache
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Network failed and no cache, return offline page for navigation
              if (request.mode === 'navigate') {
                return cache.match(OFFLINE_PAGE).then((offlinePage) => {
                  return offlinePage || new Response('Offline', {
                    status: 503,
                    headers: { 'Content-Type': 'text/html' },
                  });
                });
              }
              return new Response('Offline', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' },
              });
            });
          });
      })
    );
    return;
  }
});

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      })
    );
  }
});

// Background sync for offline actions (if needed in future)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      Promise.resolve()
    );
  }
});
