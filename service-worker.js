const CACHE_NAME = "expense-tracker-v2";

const FILES_TO_CACHE = [
  "./",

  "./index.html",

  "./style.css",

  "./script.js",

  "./manifest.json",
];

// ============================================
// Install
// ============================================

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE);
    }),
  );

  self.skipWaiting();
});

// ============================================
// Activate
// ============================================

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );

  self.clients.claim();
});

// ============================================
// Fetch
// ============================================

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request);
    }),
  );
});
