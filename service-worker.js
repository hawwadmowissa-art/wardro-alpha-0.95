const CACHE_VERSION = 'wardro-v1';

// Core app shell — paths only (no query params); icons rarely change
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/icon-512-maskable.png'
];

// Never cache these origins/paths
function isBypassed(url) {
  return (
    url.method !== 'GET' ||
    /supabase\.co/.test(url.hostname) ||
    /googleapis\.com/.test(url.hostname) ||
    /gstatic\.com/.test(url.hostname) ||
    /jsdelivr\.net/.test(url.hostname) ||
    /fonts\./.test(url.hostname) ||
    url.pathname.startsWith('/rest/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/storage/') ||
    url.pathname.startsWith('/functions/')
  );
}

// install: pre-cache shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(SHELL))
  );
});

// activate: delete old caches, claim clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// skipWaiting on message
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// fetch strategy
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Bypass: non-GET, Supabase, external CDNs, token endpoints
  if (isBypassed({ method: req.method, hostname: url.hostname, pathname: url.pathname })) return;

  // Only handle same-origin and well-known safe origins
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin) return;

  // Navigation (HTML pages) → network-first, offline fallback to cached '/'
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match('./').then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Static assets (css, js, images, fonts loaded from same origin) → cache-first
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, clone));
        }
        return res;
      });
    })
  );
});
