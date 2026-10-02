const CACHE_NAME = 'urugwiro-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/urugwiro_logo_fav.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

function shouldBypass(request) {
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return true;
  }

  // Cache API only supports http/https — bypass everything else (chrome-extension:, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return true;
  }

  if (request.method !== 'GET') {
    return true;
  }

  // Let the browser handle API, auth, and HMR without SW involvement.
  if (url.pathname.startsWith('/api/')) return true;
  if (url.pathname.startsWith('/@vite') || url.pathname.startsWith('/@fs') || url.pathname.startsWith('/@id')) {
    return true;
  }
  if (url.pathname.includes('vite') && url.searchParams.has('token')) {
    return true;
  }

  // Cross-origin (Django on :8000, CDNs, etc.) must not be intercepted.
  if (url.origin !== self.location.origin) {
    return true;
  }

  return false;
}

function canCache(request, response) {
  if (!response || !response.ok || request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  if (url.origin !== self.location.origin) return false;
  const control = response.headers.get('Cache-Control') || '';
  if (control.includes('no-store') || control.includes('no-cache')) return false;
  return true;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (shouldBypass(request)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (canCache(request, response)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (canCache(request, response)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone).catch(() => {
                // Ignore Cache API rejections (unsupported schemes, quota, etc.)
              });
            });
          }
          return response;
        })
        .catch(() => Response.error());
    })
  );
});
