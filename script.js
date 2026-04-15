/**
 * Chama Burger — script principal
 * Configuração central: altere apenas WHATSAPP_NUMBER para o número real (DDI + DDD + número, só dígitos).
 */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "5571995855142"; // Ex.: Brasil 55 + DDD 11 + 999999999
  var COUNTDOWN_MINUTES = 47;

  /**
   * Monta texto da mensagem para o WhatsApp a partir dos dados do formulário.
   * @param {{ nome: string, telefone: string, mensagem: string }} dados
   * @returns {string}
   */
  function montarMensagemWhatsApp(dados) {
    var linhas = [
      "🔥 *Pedido — Chama Burger*",
      "",
      "*Nome:* " + dados.nome,
      "*WhatsApp:* " + dados.telefone,
      "",
      "*Pedido / mensagem:*",
      dados.mensagem,
      "",
      "_Enviado pelo site._",
    ];
    return linhas.join("\n");
  }

  /**
   * Abre conversa no WhatsApp com mensagem pré-preenchida.
   * @param {string} texto
   */
  function abrirWhatsApp(texto) {
    var base = "https://wa.me/" + WHATSAPP_NUMBER;
    var url = base + "?text=" + encodeURIComponent(texto);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function apenasDigitos(str) {
    return String(str).replace(/\D/g, "");
  }

  /**
   * Valida telefone brasileiro simples: 10 ou 11 dígitos (com DDD).
   * @param {string} tel
   * @returns {boolean}
   */
  function telefoneValido(tel) {
    var d = apenasDigitos(tel);
    return d.length === 10 || d.length === 11;
  }

  function limparErros() {
    ["nome", "telefone", "mensagem"].forEach(function (id) {
      var el = document.getElementById(id);
      var err = document.getElementById("err-" + id);
      if (el) el.classList.remove("is-invalid");
      if (err) err.textContent = "";
    });
  }

  function mostrarErro(campoId, mensagem) {
    var el = document.getElementById(campoId);
    var err = document.getElementById("err-" + campoId);
    if (el) el.classList.add("is-invalid");
    if (err) err.textContent = mensagem;
  }

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var mobile = document.getElementById("nav-mobile");
    if (!toggle || !mobile) return;

    toggle.addEventListener("click", function () {
      var aberto = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", !aberto);
      if (aberto) {
        mobile.setAttribute("hidden", "");
      } else {
        mobile.removeAttribute("hidden");
      }
    });

    mobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        mobile.setAttribute("hidden", "");
      });
    });
  }

  function initScrollReveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll("[data-animate]").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var els = document.querySelectorAll("[data-animate]");
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -40px 0px", threshold: 0.08 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  function initCountdown() {
    var end = Date.now() + COUNTDOWN_MINUTES * 60 * 1000 + Math.floor(Math.random() * 45000);
    var hEl = document.getElementById("cd-h");
    var mEl = document.getElementById("cd-m");
    var sEl = document.getElementById("cd-s");
    if (!hEl || !mEl || !sEl) return;

    function tick() {
      var now = Date.now();
      var left = Math.max(0, end - now);
      var s = Math.floor(left / 1000);
      var h = Math.floor(s / 3600);
      var m = Math.floor((s % 3600) / 60);
      var sec = s % 60;
      hEl.textContent = String(h).padStart(2, "0");
      mEl.textContent = String(m).padStart(2, "0");
      sEl.textContent = String(sec).padStart(2, "0");
      if (left <= 0) {
        end = Date.now() + COUNTDOWN_MINUTES * 60 * 1000;
      }
    }
    tick();
    setInterval(tick, 1000);
  }

  function mensagemPedidoRapido(nomeProduto, preco) {
    return (
      "Olá! Quero pedir pelo site:\n\n" +
      "*Item:* " +
      nomeProduto +
      "\n" +
      "*Preço:* " +
      preco +
      "\n\n" +
      "Meu nome e endereço seguem no próximo recado se precisar."
    );
  }

  function initMenuWhatsApp() {
    document.querySelectorAll(".menu-wa").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var product = btn.getAttribute("data-product") || "Item";
        var price = btn.getAttribute("data-price") || "";
        abrirWhatsApp(mensagemPedidoRapido(product, price));
      });
    });
  }

  function initForm() {
    var form = document.getElementById("form-pedido");
    if (!form) return;

    var successEl = document.getElementById("form-success");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      limparErros();
      if (successEl) {
        successEl.hidden = true;
      }

      var nome = document.getElementById("nome");
      var tel = document.getElementById("telefone");
      var msg = document.getElementById("mensagem");
      var ok = true;

      var nomeVal = nome ? nome.value.trim() : "";
      var telVal = tel ? tel.value.trim() : "";
      var msgVal = msg ? msg.value.trim() : "";

      if (!nomeVal) {
        mostrarErro("nome", "Informe seu nome.");
        ok = false;
      }
      if (!telVal) {
        mostrarErro("telefone", "Informe seu WhatsApp.");
        ok = false;
      } else if (!telefoneValido(telVal)) {
        mostrarErro("telefone", "Telefone inválido. Use DDD + número (10 ou 11 dígitos).");
        ok = false;
      }
      if (!msgVal) {
        mostrarErro("mensagem", "Descreva seu pedido ou mensagem.");
        ok = false;
      }

      if (!ok) return;

      var texto = montarMensagemWhatsApp({
        nome: nomeVal,
        telefone: telVal,
        mensagem: msgVal,
      });

      if (successEl) {
        successEl.hidden = false;
      }

      abrirWhatsApp(texto);
    });
  }

  function initFloatWhatsApp() {
    var floatBtn = document.getElementById("whatsapp-float");
    if (!floatBtn) return;
    floatBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var texto =
        "Olá! Vim pelo site da *Chama Burger* e quero fazer um pedido. Pode me atender?";
      abrirWhatsApp(texto);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initScrollReveal();
    initCountdown();
    initMenuWhatsApp();
    initForm();
    initFloatWhatsApp();
  });
})();
