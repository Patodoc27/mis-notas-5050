/* Service worker — Mis notas 5050
   Cachea la carcasa de la app para que abra rápido y pueda instalarse.
   Las notas siempre se piden en vivo a la planilla (no se cachean). */
var CACHE = 'notas5050-v1';
var SHELL = [
  'index.html',
  'manifest.webmanifest',
  'assets/escudo-app.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/apple-touch-icon.png',
  'assets/favicon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var url = e.request.url;
  /* datos en vivo: nunca desde cache */
  if (url.indexOf('docs.google.com') >= 0 || url.indexOf('google.com') >= 0) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function (r) {
      return r || fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      });
    })
  );
});
