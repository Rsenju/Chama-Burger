/**
 * Service Worker — cache de assets estáticos (versão do cache).
 */
var CACHE_NAME = "chama-burger-v2026-1";
var ASSETS = [
  "./",
  "./index.html",
  "./css/tokens.css",
  "./css/main.css",
  "./css/components.css",
  "./css/responsive.css",
  "./css/lgpd.css",
  "./manifest.json",
  "./politica-privacidade.html",
  "./termos-de-uso.html",
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS).catch(function () {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (r) {
      return r || fetch(e.request);
    })
  );
});
