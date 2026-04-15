/**
 * Registro do Service Worker e prompt de instalação (adiado).
 */
(function () {
  "use strict";

  var deferredPrompt = null;

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    var btn = document.getElementById("btn-install-pwa");
    if (btn) {
      btn.hidden = false;
      btn.addEventListener("click", function () {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.finally(function () {
          deferredPrompt = null;
          btn.hidden = true;
        });
      });
    }
  });
})();
