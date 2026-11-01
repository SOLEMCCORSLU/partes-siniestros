/* Permite instalar el formulario como aplicación y abrirlo sin cobertura.
   Siempre intenta primero la red (así se recibe la última versión publicada);
   sin conexión usa la última copia guardada. La página guardada va cifrada con la clave. */
const CACHE = "parte-siniestros-v1";
const BASICOS = ["./", "./manifest.webmanifest", "./icono-192.png", "./icono-512.png", "./icono-maskable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); } return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./")))
  );
});
