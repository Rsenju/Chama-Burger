/**
 * Programa de fidelidade: selos locais (placeholder funcional).
 */
(function () {
  "use strict";

  var KEY = "chama_fidelidade_selos_v1";
  var MAX = 5;

  function getCount() {
    try {
      var n = parseInt(localStorage.getItem(KEY), 10);
      return isNaN(n) ? 0 : Math.min(Math.max(n, 0), MAX);
    } catch (e) {
      return 0;
    }
  }

  function setCount(n) {
    try {
      localStorage.setItem(KEY, String(n));
    } catch (e) {}
  }

  function render() {
    var wrap = document.getElementById("fidelidade-selos");
    if (!wrap) return;
    var c = getCount();
    wrap.innerHTML = "";
    for (var i = 0; i < MAX; i++) {
      var s = document.createElement("span");
      s.className = "fidelidade-selo" + (i < c ? " fidelidade-selo--filled" : "");
      s.setAttribute("role", "img");
      s.setAttribute("aria-label", i < c ? "Selo " + (i + 1) + " conquistado" : "Selo " + (i + 1) + " vazio");
      wrap.appendChild(s);
    }
    var msg = document.getElementById("fidelidade-msg");
    if (msg) {
      if (c >= MAX) {
        msg.textContent = "Parabéns! Você completou 5 pedidos — resgate seu benefício no balcão ou pelo WhatsApp.";
      } else {
        msg.textContent = "Você tem " + c + " de " + MAX + " selos. Falta(m) " + (MAX - c) + " pedido(s) para o benefício.";
      }
    }
  }

  /** Simula +1 selo ao clicar (demo) — remover em produção ou ligar ao backend */
  document.addEventListener("DOMContentLoaded", function () {
    render();
    var btn = document.getElementById("fidelidade-demo-add");
    if (btn) {
      btn.addEventListener("click", function () {
        var c = getCount();
        if (c < MAX) setCount(c + 1);
        render();
      });
    }
  });
})();
