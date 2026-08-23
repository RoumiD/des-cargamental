const CACHE_NAME = 'carga-mental-v1';
const ASSETS = ['./', './index.html', './style.css', './app.js', './manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // network-first para no servir versiones viejas de la app; fallback a caché si no hay red
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// NOTA: este service worker permite que la app funcione offline e
// instalable, pero NO puede recibir notificaciones push si la app
// está completamente cerrada. Eso requiere Firebase Cloud Messaging
// + una función programada (Cloud Functions, plan Blaze). Ver README.
