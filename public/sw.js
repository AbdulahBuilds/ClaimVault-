/**
 * ClaimVault Service Worker
 * Handles Device Push Notifications, OS notifications, notification clicks, and pass-through network requests.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Device Notification Click Handler: Focus or open window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there is already a window/tab open with ClaimVault
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Push notification event handler for server-sent Web Push
self.addEventListener('push', (event) => {
  let data = {
    title: 'ClaimVault Alert',
    body: 'You have a new warranty or return notification.',
    icon: '/claimvault-logo.png',
    badge: '/claimvault-logo.png',
  };

  if (event.data) {
    try {
      data = Object.assign(data, event.data.json());
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'ClaimVault Alert', {
      body: data.body,
      icon: data.icon || '/claimvault-logo.png',
      badge: data.badge || '/claimvault-logo.png',
      vibrate: [200, 100, 200],
      tag: data.tag || `cv-${Date.now()}`,
      renotify: true,
      data: {
        url: data.url || '/',
      },
      actions: [
        {
          action: 'open',
          title: 'Open ClaimVault',
        },
      ],
    })
  );
});

// Non-blocking pass-through fetch handler
self.addEventListener('fetch', () => {
  return;
});
