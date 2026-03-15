/**
 * Sleep Cycle Calculator - Service Worker
 * Version: 1.0.0
 * Provides offline support and faster loading
 */

const CACHE_NAME = 'sleep-calc-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/themes.css',
  '/css/components.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/calculator.js',
  '/js/theme.js',
  '/js/ui.js',
  '/js/utils.js',
  '/articles/sleep-science.md',
  '/assets/images/icon-72x72.png',
  '/assets/images/icon-96x96.png',
  '/assets/images/icon-128x128.png',
  '/assets/images/icon-192x192.png',
  '/assets/images/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests like analytics
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('cdnjs.cloudflare.com') &&
      !event.request.url.includes('cdn.jsdelivr.net')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache the fetched resource
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Fallback for offline
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background sync for offline calculations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-calculations') {
    event.waitUntil(syncCalculations());
  }
});

async function syncCalculations() {
  try {
    const cache = await caches.open('calculations');
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/save-calculation')) {
        const response = await cache.match(request);
        const data = await response.json();
        
        // Attempt to send to server
        await fetch('/api/save-calculation', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' }
        });
        
        // Remove from cache after successful sync
        await cache.delete(request);
      }
    }
  } catch (error) {
    console.log('Sync failed:', error);
  }
});