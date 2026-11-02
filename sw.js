/* Service worker — Mis notas 5050
   Estrategia red-primero: siempre intenta bajar la versión nueva y,
   si no hay conexión, cae en la copia guardada. Así los cambios se ven
   apenas se publican, sin quedar una versión vieja pegada. */
var CACHE = 'notas5050-v3';
var SHELL = [
  'index.html',
  'manifest.webmanifest',
  'assets/escudo-app.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/apple-touch-icon.png',
  'assets/favicon.png',
  'assets/musica.mp3'
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
  /* red primero, cache como respaldo sin conexión */
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () {
      return caches.match(e.request);
    })
  );
});
