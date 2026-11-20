// Service worker for the browser front end: the page, the engine and the icons are cached, so the page
// works offline once loaded. Bump VERSION when any of the files change.
const CACHE_PREFIX = "cranked-pwa-";
const VERSION = CACHE_PREFIX + "4";
const FILES = ["./", "index.html", "engine.js", "worker.js", "audio-worklet.js", "zip.js", "cranked.js", "cranked.wasm", "manifest.webmanifest", "icon-192.png", "icon-512.png", "site.json", "games.json"];
self.addEventListener("install", e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(keys =>
  Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const request = e.request;
  if (request.method !== "GET" || !request.url.startsWith(self.registration.scope)) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    if (request.mode === "navigate") {
      try {
        const response = await fetch(request);
        if (response.ok) return response;
      } catch (error) {
        // The cached page is also the offline entry point for the home screen app.
      }
      return await cache.match(request, { ignoreSearch: true }) || await cache.match("./") || Response.error();
    }
    return await cache.match(request) || fetch(request);
  }));
});
