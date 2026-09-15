/**
 * ClaimVault PWA Service Worker (v1.0.3)
 * High-performance offline caching with strict development isolation.
 */

const CACHE_NAME = 'claimvault-v1.0.3';
const STATIC_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/claimvault-logo.png',
  '/logo.png',
];

// Install: Cache static app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_SHELL).catch((err) => {
        console.warn('[SW] Cache shell addAll warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Immediately purge all old versions and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Strategy router
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1. Never intercept non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 2. Strict development & API bypass:
  // Never intercept localhost, Vite internal modules, HMR, or backend APIs
  if (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/api/') ||
    url.search.includes('t=') ||
    url.search.includes('import')
  ) {
    return;
  }

  // 3. HTML Navigation requests: Network-first, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  // 4. Static assets (JS, CSS, images, fonts): Cache-first with background network refresh
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch((err) => {
          // If network fetch fails, return null or let browser handle it rather than rejecting
          console.warn('[SW] Fetch failed for:', request.url, err);
          return new Response('Network error occurred', { status: 408, headers: { 'Content-Type': 'text/plain' } });
        });
    })
  );
});
