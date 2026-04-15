/**
 * Navegação, countdown, cardápio/WhatsApp, formulário, delivery, toast e máscara de telefone.
 */
(function () {
  "use strict";

  function waNumber() {
    return (typeof CONFIG !== "undefined" && CONFIG.whatsappNumber) || "5511999999999";
  }

  function countdownMinutes() {
    return (typeof CONFIG !== "undefined" && CONFIG.countdownMinutes) || 47;
  }

  function montarMensagemWhatsApp(dados) {
    var linhas = [
      "🔥 *Pedido — Chama Burger*",
      "",
      "*Nome:* " + dados.nome,
      "*WhatsApp:* " + dados.telefone,
      "*Endereço:* " + dados.endereco,
      "",
      "*Pedido / mensagem:*",
      dados.mensagem,
      "",
      "_Enviado pelo site._",
    ];
    return linhas.join("\n");
  }

  /**
   * Valida número wa.me (apenas dígitos, tamanho razoável).
   */
  function whatsappNumeroSeguro(num) {
    var d = String(num || "").replace(/\D/g, "");
    return d.length >= 10 && d.length <= 15;
  }

  function abrirWhatsApp(texto) {
    var num = waNumber().replace(/\D/g, "");
    if (!whatsappNumeroSeguro(num)) {
      showToast("Configuração de WhatsApp inválida.", true);
      return;
    }
    var base = "https://wa.me/" + num;
    var url = base + "?text=" + encodeURIComponent(texto);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function showToast(msg, isError) {
    var el = document.getElementById("toast-site");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    el.classList.toggle("toast-site--error", !!isError);
    el.classList.add("toast-site--visible");
    clearTimeout(el._toastT);
    el._toastT = setTimeout(function () {
      el.classList.remove("toast-site--visible");
      el.hidden = true;
    }, 3200);
  }

  function limparErros() {
    ["nome", "telefone", "endereco", "mensagem", "lgpd", "dados"].forEach(function (id) {
      var el = document.getElementById(id);
      var err = document.getElementById("err-" + id);
      if (el) el.classList.remove("is-invalid");
      if (err) err.textContent = "";
    });
    var g = document.getElementById("err-geral");
    if (g) {
      g.textContent = "";
      g.hidden = true;
    }
  }

  function mostrarErro(campoId, mensagem) {
    var el = document.getElementById(campoId);
    var err = document.getElementById("err-" + campoId);
    if (el) el.classList.add("is-invalid");
    if (err) err.textContent = mensagem;
  }

  function formatPhoneInput(el) {
    if (!el) return;
    var d = el.value.replace(/\D/g, "").slice(0, 11);
    var out = "";
    if (d.length === 0) {
      out = "";
    } else if (d.length <= 2) {
      out = "(" + d;
    } else if (d.length <= 6) {
      out = "(" + d.slice(0, 2) + ") " + d.slice(2);
    } else if (d.length <= 10) {
      out = "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    } else {
      out = "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
    }
    el.value = out;
  }

  function initPhoneMask() {
    var tel = document.getElementById("telefone");
    if (!tel) return;
    tel.addEventListener("input", function () {
      formatPhoneInput(tel);
    });
    tel.addEventListener("blur", function () {
      formatPhoneInput(tel);
    });
  }

  function initNav() {
    document.querySelectorAll(".nav-toggle").forEach(function (toggle) {
      var targetId = toggle.getAttribute("aria-controls");
      var mobile = targetId ? document.getElementById(targetId) : null;
      if (!mobile) return;

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
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
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
    var mins = countdownMinutes();
    var end = Date.now() + mins * 60 * 1000 + Math.floor(Math.random() * 45000);
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
        end = Date.now() + mins * 60 * 1000;
      }
    }
    tick();
    setInterval(tick, 1000);
  }

  function mensagemPedidoRapido(nomeProduto, preco) {
    var p = window.CHAMASecurity ? CHAMASecurity.sanitizeInput(nomeProduto) : String(nomeProduto || "Item");
    var pr = window.CHAMASecurity ? CHAMASecurity.sanitizeInput(preco) : String(preco || "");
    return (
      "Olá! Quero pedir pelo site:\n\n" +
      "*Item:* " +
      p +
      "\n" +
      "*Preço:* " +
      pr +
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
        showToast("Abrindo WhatsApp com o item selecionado.");
      });
    });
  }

  function initDelivery() {
    if (typeof CONFIG === "undefined") return;
    var ifood = document.getElementById("delivery-ifood");
    var f99 = document.getElementById("delivery-99");
    var qrI = document.getElementById("qr-ifood");
    var qr9 = document.getElementById("qr-99");
    if (ifood) ifood.href = CONFIG.ifoodLink;
    if (f99) f99.href = CONFIG.food99Link;
    var qrBase = "https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=";
    if (qrI) {
      qrI.loading = "lazy";
      qrI.decoding = "async";
      qrI.src = qrBase + encodeURIComponent(CONFIG.ifoodLink);
    }
    if (qr9) {
      qr9.loading = "lazy";
      qr9.decoding = "async";
      qr9.src = qrBase + encodeURIComponent(CONFIG.food99Link);
    }
  }

  function initForm() {
    var form = document.getElementById("form-pedido");
    if (!form || !window.CHAMASecurity) return;

    var successEl = document.getElementById("form-success");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      limparErros();
      if (successEl) successEl.hidden = true;

      function getEl(id) {
        return document.getElementById(id);
      }

      var result = CHAMASecurity.validatePedidoForm(getEl);
      Object.keys(result.errors).forEach(function (key) {
        mostrarErro(key, result.errors[key]);
      });
      if (!result.ok) return;

      CHAMASecurity.fetchClientIp()
        .then(function (ip) {
          if (!CHAMASecurity.canSubmit(ip)) {
            var g = document.getElementById("err-geral");
            var sec = CHAMASecurity.cooldownRemainingSec(ip);
            var msg =
              sec > 0
                ? "Limite de envios atingido. Aguarde " + sec + " segundos e tente novamente."
                : "Muitos envios em pouco tempo. Aguarde até 1 minuto e tente novamente.";
            if (g) {
              g.textContent = msg;
              g.hidden = false;
            }
            return;
          }

          var nome = CHAMASecurity.sanitizeInput(result.values.nome);
          var tel = CHAMASecurity.sanitizeInput(result.values.telefone);
          var end = CHAMASecurity.sanitizeInput(result.values.endereco);
          var msg = CHAMASecurity.sanitizeInput(result.values.mensagem);

          var texto = montarMensagemWhatsApp({
            nome: nome,
            telefone: tel,
            endereco: end,
            mensagem: msg,
          });

          CHAMASecurity.registerSubmit(ip);
          if (successEl) successEl.hidden = false;
          abrirWhatsApp(texto);
        })
        .catch(function () {
          var g = document.getElementById("err-geral");
          if (g) {
            g.textContent = "Não foi possível validar o envio. Verifique sua conexão e tente novamente.";
            g.hidden = false;
          }
        });
    });
  }

  function initFloatWhatsApp() {
    var floatBtn = document.getElementById("whatsapp-float");
    if (!floatBtn) return;
    floatBtn.addEventListener("click", function (e) {
      e.preventDefault();
      abrirWhatsApp(
        "Olá! Vim pelo site da *Chama Burger* e quero fazer um pedido. Pode me atender?"
      );
    });
  }

  /** Scripts opcionais de métricas só após consentimento analítico (extensível). */
  function initDeferredTracking() {
    try {
      var raw = localStorage.getItem("chama_lgpd_flags_v1");
      var flags = raw ? JSON.parse(raw) : null;
      if (flags && flags.analytics && typeof CONFIG !== "undefined" && CONFIG.loadAnalytics === true) {
        /* Ex.: carregar pixel aqui — desativado por padrão */
      }
    } catch (e) {}
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (window.CHAMALgpd && CHAMALgpd.init) CHAMALgpd.init();
    initNav();
    initScrollReveal();
    initCountdown();
    initMenuWhatsApp();
    initDelivery();
    initPhoneMask();
    initForm();
    initFloatWhatsApp();
    initDeferredTracking();
  });
})();
