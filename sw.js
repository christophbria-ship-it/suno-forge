const CACHE_NAME = "forge-v3-5-20260727a";
const APP_SHELL = [
  "/",
  "/index.html",
  "/style.css",
  "/style-v32.css",
  "/style-v33.css",
  "/style-v34.css",
  "/style-v35.css",
  "/data.js",
  "/data-v32.js",
  "/data-v33.js",
  "/data-v34.js",
  "/data-v35.js",
  "/app-core.js",
  "/app-editor.js",
  "/app-actions.js",
  "/app-storage.js",
  "/app-v32.js",
  "/app-v33.js",
  "/app-v34.js",
  "/app-v35.js",
  "/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/index.html")))
  );
});
