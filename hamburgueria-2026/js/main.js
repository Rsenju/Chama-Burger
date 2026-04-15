/**
 * UI principal: navegação, CTAs, formulário, checkout, cozinha, sticky CTA, carrossel, WhatsApp.
 */
(function () {
  "use strict";

  var WA_MSG_DEFAULT =
    "Olá! Vi no site e quero fazer um pedido.";

  function waNumber() {
    return (typeof CONFIG !== "undefined" && CONFIG.whatsappNumber) || "5511999999999";
  }

  function countdownMinutes() {
    return (typeof CONFIG !== "undefined" && CONFIG.countdownMinutes) || 47;
  }

  function montarMensagemWhatsApp(dados) {
    return [
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
    ].join("\n");
  }

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
    window.open(
      "https://wa.me/" + num + "?text=" + encodeURIComponent(texto),
      "_blank",
      "noopener,noreferrer"
    );
  }

  function showToast(msg, isError) {
    var el = document.getElementById("toast-site");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    el.classList.toggle("toast-site--error", !!isError);
    el.classList.add("toast-site--visible");
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.classList.remove("toast-site--visible");
      el.hidden = true;
    }, 3000);
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

  function setBtnLoading(btn, loading) {
    if (!btn) return;
    btn.classList.toggle("is-loading", loading);
    btn.disabled = loading;
  }

  function formatPhoneInput(el) {
    if (!el) return;
    var d = el.value.replace(/\D/g, "").slice(0, 11);
    var out = "";
    if (d.length === 0) out = "";
    else if (d.length <= 2) out = "(" + d;
    else if (d.length <= 6) out = "(" + d.slice(0, 2) + ") " + d.slice(2);
    else if (d.length <= 10) out = "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    else out = "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
    el.value = out;
  }

  function initPhoneMask() {
    var tel = document.getElementById("telefone");
    if (!tel) return;
    tel.addEventListener("input", function () {
      formatPhoneInput(tel);
    });
  }

  function initNav() {
    document.querySelectorAll(".nav-toggle").forEach(function (toggle) {
      var tid = toggle.getAttribute("aria-controls");
      var mobile = tid ? document.getElementById(tid) : null;
      if (!mobile) return;
      toggle.addEventListener("click", function () {
        var aberto = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", !aberto);
        if (aberto) mobile.setAttribute("hidden", "");
        else mobile.removeAttribute("hidden");
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
      { rootMargin: "0px 0px -40px 0px", threshold: 0.08 }
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
      if (left <= 0) end = Date.now() + mins * 60 * 1000;
    }
    tick();
    setInterval(tick, 1000);
  }

  function initMenuWhatsApp() {
    document.querySelectorAll(".menu-wa").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (btn.classList.contains("btn--disabled")) return;
        var product = btn.getAttribute("data-product") || "Item";
        var price = btn.getAttribute("data-price") || "";
        var p = CHAMASecurity ? CHAMASecurity.sanitizeInput(product) : product;
        var pr = CHAMASecurity ? CHAMASecurity.sanitizeInput(price) : price;
        abrirWhatsApp(
          "Olá! Quero pedir pelo site:\n\n*Item:* " +
            p +
            "\n*Preço:* " +
            pr +
            "\n\nMeu nome e endereço seguem no próximo recado."
        );
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
      qrI.src = qrBase + encodeURIComponent(CONFIG.ifoodLink);
    }
    if (qr9) {
      qr9.loading = "lazy";
      qr9.src = qrBase + encodeURIComponent(CONFIG.food99Link);
    }
  }

  function showKitchenProgress() {
    var panel = document.getElementById("kitchen-panel");
    var fill = document.getElementById("kitchen-bar-fill");
    if (!panel || !fill) return;
    panel.hidden = false;
    fill.style.width = "0%";
    requestAnimationFrame(function () {
      fill.style.width = "100%";
    });
    var steps = ["Pedido recebido", "Em preparo", "Saiu para entrega", "Entregue"];
    var i = 0;
    var elSteps = document.getElementById("kitchen-steps-text");
    if (elSteps) elSteps.textContent = steps[0];
    var t = setInterval(function () {
      i++;
      if (i < steps.length && elSteps) elSteps.textContent = steps[i];
      if (i >= steps.length) clearInterval(t);
    }, 2500);
  }

  function initForm() {
    var form = document.getElementById("form-pedido");
    if (!form || !window.CHAMASecurity) return;
    var successEl = document.getElementById("form-success");
    var btn = document.getElementById("btn-enviar");

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

      setBtnLoading(btn, true);
      CHAMASecurity.fetchClientIp()
        .then(function (ip) {
          if (!CHAMASecurity.canSubmit(ip)) {
            var g = document.getElementById("err-geral");
            var sec = CHAMASecurity.cooldownRemainingSec(ip);
            var msg =
              sec > 0
                ? "Limite de envios. Aguarde " + sec + " segundos."
                : "Muitos envios. Aguarde 1 minuto.";
            if (g) {
              g.textContent = msg;
              g.hidden = false;
            }
            setBtnLoading(btn, false);
            return;
          }

          var nome = CHAMASecurity.sanitizeInput(result.values.nome);
          var tel = CHAMASecurity.sanitizeInput(result.values.telefone);
          var end = CHAMASecurity.sanitizeInput(result.values.endereco);
          var msg = CHAMASecurity.sanitizeInput(result.values.mensagem);

          CHAMASecurity.registerSubmit(ip);
          showKitchenProgress();
          setTimeout(function () {
            abrirWhatsApp(
              montarMensagemWhatsApp({
                nome: nome,
                telefone: tel,
                endereco: end,
                mensagem: msg,
              })
            );
            if (successEl) successEl.hidden = false;
            setBtnLoading(btn, false);
          }, 800);
        })
        .catch(function () {
          var g = document.getElementById("err-geral");
          if (g) {
            g.textContent = "Verifique sua conexão e tente novamente.";
            g.hidden = false;
          }
          setBtnLoading(btn, false);
        });
    });
  }

  function initFloatWhatsApp() {
    var floatBtn = document.getElementById("whatsapp-float");
    if (!floatBtn) return;
    floatBtn.addEventListener("click", function (e) {
      e.preventDefault();
      abrirWhatsApp(WA_MSG_DEFAULT);
    });
  }

  function initStickyCta() {
    var bar = document.getElementById("sticky-cta-bar");
    if (!bar) return;
    function onScroll() {
      var show = window.scrollY > 300 && window.innerWidth <= 768;
      bar.classList.toggle("is-visible", show);
      bar.setAttribute("aria-hidden", show ? "false" : "true");
      document.body.classList.toggle("has-sticky-cta", show);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  function initCheckoutDemo() {
    var card = document.getElementById("checkout-card-num");
    if (card) {
      card.addEventListener("input", function () {
        var v = card.value.replace(/\D/g, "").slice(0, 16);
        var parts = v.match(/.{1,4}/g) || [];
        card.value = parts.join(" ");
      });
    }
    var cpf = document.getElementById("checkout-boleto-cpf");
    if (cpf) {
      cpf.addEventListener("input", function () {
        var v = cpf.value.replace(/\D/g, "").slice(0, 11);
        if (v.length <= 11) {
          cpf.value = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        }
      });
    }
  }

  function bindCtaPedirAgora() {
    document.querySelectorAll('a[href="#pedido"].cta-pedir-agora').forEach(function (a) {
      a.addEventListener("click", function () {
        showToast("Preencha seu pedido abaixo.");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (window.CHAMALgpd && CHAMALgpd.init) CHAMALgpd.init();
    if (window.CHAMATracking && CHAMATracking.initFromStorage) CHAMATracking.initFromStorage();
    initNav();
    initScrollReveal();
    initCountdown();
    initMenuWhatsApp();
    initDelivery();
    initPhoneMask();
    initForm();
    initFloatWhatsApp();
    initStickyCta();
    initCheckoutDemo();
    bindCtaPedirAgora();
  });
})();
