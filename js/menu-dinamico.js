/**
 * Status aberto/fechado e badges de indisponibilidade (estoque simulado).
 */
(function () {
  "use strict";

  var SCHEDULE = [
    { open: "12:00", close: "22:00" },
    { open: "11:00", close: "23:00" },
    { open: "11:00", close: "23:00" },
    { open: "11:00", close: "23:00" },
    { open: "11:00", close: "23:00" },
    { open: "11:00", close: "00:00" },
    { open: "11:00", close: "00:00" },
  ];

  var OUT_OF_STOCK_IDS = ["menu-chama-triplo"];

  function parseTime(str) {
    var p = str.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function nowMinutes() {
    var d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  function isOpenNow() {
    var d = new Date();
    var day = d.getDay();
    var slot = SCHEDULE[day];
    if (!slot) return false;
    var open = parseTime(slot.open);
    var close = parseTime(slot.close);
    var n = nowMinutes();
    /* Meia-noite: close=00:00 → parseTime=0, logo close < open → lógica de virada de dia */
    if (close < open) {
      return n >= open || n < close;
    }
    return n >= open && n < close;
  }

  function nextOpenLabel() {
    var d = new Date();
    var day = d.getDay();
    var slot = SCHEDULE[day];
    if (slot && !isOpenNow()) {
      return slot.open.replace(":", "h");
    }
    return "11h";
  }

  function renderStatus() {
    var el = document.getElementById("status-restaurante");
    if (!el) return;
    var open = isOpenNow();
    el.classList.toggle("status-badge--open", open);
    el.classList.toggle("status-badge--closed", !open);
    if (open) {
      el.innerHTML = '<span class="status-dot" aria-hidden="true"></span> Aberto agora — pedidos pelo site e WhatsApp';
    } else {
      el.innerHTML = '<span class="status-dot" aria-hidden="true"></span> Fechado no momento — abre às <strong>' + nextOpenLabel() + "</strong>";
    }
  }

  function applyStock() {
    OUT_OF_STOCK_IDS.forEach(function (id) {
      var card = document.getElementById(id);
      if (card) {
        card.classList.add("menu-card--out-of-stock");
        var btn = card.querySelector(".menu-wa");
        if (btn) {
          btn.setAttribute("aria-disabled", "true");
          btn.classList.add("btn--disabled");
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderStatus();
    applyStock();
    setInterval(renderStatus, 60000);
  });
})();
