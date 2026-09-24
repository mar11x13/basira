/* ============================================================================
   BASIRA service worker — offline shell + content caching.

   Strategy (honest offline behavior — never serve stale data as "live"):
   - App shell + icons + manifest: cache-first (static, versioned by filename).
   - Navigations ("/"): network-first, fall back to cached shell when offline.
   - Static build assets (_next/static, fonts, CDN images): stale-while-
     revalidate, tolerant of dev-server churn.
   - GET /api/* reads: network-first with cache fallback, and responses are
     served with a header marker so the app can tell cached from live.
   - POST/PUT/DELETE and everything else: network only, never cached.
   ============================================================================ */

const VERSION = 'basira-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const DATA_CACHE = `${VERSION}-data`;

const SHELL_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  );
}

function isApiRead(url) {
  return url.pathname.startsWith('/api/');
}

async function networkFirstNavigation(event) {
  try {
    const fresh = await fetch(event.request);
    return fresh;
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    const cached = (await cache.match('/')) || (await caches.match(event.request));
    return (
      cached ||
      new Response('<h1>BASIRA is offline</h1><p>Reconnect to continue reading.</p>', {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      })
    );
  }
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(event.request);
  const refresh = fetch(event.request)
    .then((res) => {
      if (res.ok) cache.put(event.request, res.clone());
      return res;
    })
    .catch(() => undefined);
  return cached || (await refresh) || Response.error();
}

async function networkFirstApi(event) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const fresh = await fetch(event.request);
    if (fresh.ok) cache.put(event.request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(event.request);
    if (cached) {
      // Mark the response so the UI can honestly say "offline · cached copy".
      const body = await cached.clone().text();
      return new Response(body, {
        status: 200,
        headers: { ...cached.headers, 'X-BASIRA-Cached': '1' },
      });
    }
    return new Response(JSON.stringify({ error: 'offline', cached: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // never intercept mutations

  const url = new URL(request.url);
  if (url.origin !== self.location.origin && !isStaticAsset(url)) return; // let cross-origin (audio CDN etc.) pass through

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(event));
    return;
  }
  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(event));
    return;
  }
  if (isApiRead(url)) {
    event.respondWith(networkFirstApi(event));
    return;
  }
  // Everything else: default browser behavior (no interception).
});
