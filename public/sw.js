const CACHE_NAME = 'linguist-app-v2';

self.addEventListener('install', (event) => {
  const scope = self.registration.scope;
  const assetsToCache = [
    scope,
    scope + 'index.html',
    scope + 'manifest.json',
    scope + 'icon.svg',
    scope + 'icon-maskable.svg'
  ];

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache).catch((err) => {
        console.warn('Failed to pre-cache some assets during install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

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
    }).then(() => self.clients.claim())
  );
});

// Stale-while-revalidate or Network-first strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin or chrome-extension requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle SPA routing - always network-first for HTML to avoid stale shell
  if (event.request.mode === 'navigate') {
    const scope = self.registration.scope;
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(scope + 'index.html').then((cachedResponse) => {
          return cachedResponse || caches.match(scope);
        });
      })
    );
    return;
  }

  // Skip POST or external api requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache (stale-while-revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => { /* Ignore background update errors */ });
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Simple fallback
        return new Response('Offline content', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
