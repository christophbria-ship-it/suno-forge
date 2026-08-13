const CACHE_NAME = "simplist-structure-builder-v5-0-0-20260812";
const APP_SHELL = [
  "/",
  "/index.html",
  "/prompt-style.css?v=4.1.0",
  "/layout-v5.css?v=4.2.1",
  "/structure-page.css?v=5.0.0",
  "/prompt-app.js?v=4.3.0",
  "/data.js?v=4.1.0",
  "/data-additions.js?v=4.3.0",
  "/structure-data.js?v=5.0.0",
  "/structure-app.js?v=5.0.0",
  "/manifest.webmanifest",
  "/icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put("/index.html", copy));
          }
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
