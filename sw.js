const CACHE_NAME = "simplist-v23-20260828-1990s-sounds";

const APP_SHELL = [
  "/",
  "/index.html",
  "/prompt-style.css?v=10.0.0",
  "/layout-v5.css?v=4.2.1",
  "/structure-page.css?v=5.0.0",
  "/structure-mobile.css?v=5.1.1",
  "/instrument-saver.css?v=5.2.0",
  "/forest-theme.css?v=10.0.0",
  "/v10-features.css?v=10.0.0",
  "/v11-layout.css?v=11.4.0",
  "/mobile-v12.css?v=12.2.0",
  "/sound-blender.css?v=1.1.0",
  "/tag-descriptions.js?v=11.2.0",
  "/prompt-app.js?v=11.6.0",
  "/v10-features.js?v=11.5.0",
  "/data.js?v=4.1.0",
  "/data-additions.js?v=4.3.0",
  "/structure-data.js?v=5.0.0",
  "/data-global.js?v=5.2.0",
  "/sound-profiles.js?v=1.0.0",
  "/sound-profiles-1990s.js?v=1.0.0",
  "/structure-app.js?v=5.3.0",
  "/sound-blender.js?v=1.1.0",
  "/manifest.webmanifest",
  "/icon.svg?v=12.0.0",
  "/simplist-logo-approved-reference.jpg?v=12.0.0"
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
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
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
          if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put("/index.html", response.clone()));
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
          if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
