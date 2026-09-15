/**
 * ClaimVault Service Worker
 * Self-unregistering pass-through worker that prevents any localhost or HMR interference.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
      .catch(() => {})
  );
});

// Do not intercept or cache any fetch requests
self.addEventListener('fetch', () => {
  return;
});
