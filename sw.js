/**
 * Service Worker — cache de assets estáticos com fallback offline.
 * FIX [Médio PWA]: adicionado offline.html e estratégia de fallback de rede.
 */
var CACHE_NAME = "chama-burger-v2026-1";
var ASSETS = [
  "./",
  "./index.html",
  "./offline.html",
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
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).catch(function () {
        /* FIX: fallback para offline.html em navegações de página */
        if (e.request.mode === "navigate") {
          return caches.match("./offline.html");
        }
      });
    })
  );
});
