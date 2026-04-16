/**
 * Cardápio dinâmico — lê data/cardapio.json e renderiza os cards.
 * Mudança 4: JSON externo para o cliente editar sem tocar no HTML.
 * Mudança 1: imagens locais com fallback SVG se não carregar.
 */
(function () {
  "use strict";

  var IMG_BASE = "assets/images/cardapio/";
  var IMG_EXT_ORDER = [".jpg", ".png", ".webp", ".svg"]; // tentativa em ordem

  /** Ícone de hambúrguer usado no fallback inline */
  var FALLBACK_SVG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 60'%3E" +
    "%3Crect width='80' height='60' fill='%231c1c1c'/%3E" +
    "%3Crect x='16' y='18' width='48' height='7' rx='3.5' fill='%23f5c518' opacity='.5'/%3E" +
    "%3Crect x='16' y='27' width='48' height='7' rx='3.5' fill='%23f5c518' opacity='.7'/%3E" +
    "%3Crect x='16' y='36' width='48' height='7' rx='3.5' fill='%23f5c518' opacity='.5'/%3E" +
    "%3C/svg%3E";

  function formatPreco(preco) {
    var n = parseFloat(preco);
    return "R$ " + n.toFixed(2).replace(".", ",");
  }

  function sanitize(str) {
    if (window.CHAMASecurity) return CHAMASecurity.escapeHtml(str);
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Tenta carregar extensões em sequência; fallback para SVG inline se todas falharem */
  function resolveImgSrc(foto) {
    var base = foto.replace(/\.[^.]+$/, ""); // remove extensão existente
    // Usa a foto como fornecida (pode ser .jpg, .png…); fallback via onerror em cadeia
    return IMG_BASE + foto;
  }

  function buildCardHTML(item) {
    var tagBadge = "";
    if (item.tags && item.tags.indexOf("mais-vendido") !== -1) {
      tagBadge = '<span class="menu-badge" aria-label="Mais vendido">Mais vendido</span>';
    }

    var outOfStock = !item.disponivel;
    var cardClass = "menu-card" +
      (item.tags && item.tags.indexOf("mais-vendido") !== -1 ? " menu-card--hit" : "") +
      (outOfStock ? " menu-card--out-of-stock" : "");

    var idAttr = item.id ? ' id="menu-' + sanitize(item.id) + '"' : "";

    var btnAttr = outOfStock
      ? ' aria-disabled="true" class="btn btn-whatsapp menu-wa btn--disabled"'
      : ' class="btn btn-whatsapp menu-wa"';

    var imgSrc = resolveImgSrc(item.foto);
    var imgAlt = sanitize(item.nome) + " — " + sanitize(item.descricao);

    return (
      '<article class="' + cardClass + '"' + idAttr + ' data-animate>' +
        tagBadge +
        '<figure class="menu-card__media">' +
          '<img' +
          ' src="' + imgSrc + '"' +
          ' alt="' + imgAlt + '"' +
          ' loading="lazy"' +
          ' decoding="async"' +
          ' onerror="window.__cardapioImgFallback(this)"' +
          '>' +
        '</figure>' +
        '<h3 class="h3">' + sanitize(item.nome) + '</h3>' +
        '<p>' + sanitize(item.descricao) + '</p>' +
        '<p class="menu-price">' + formatPreco(item.preco) + '</p>' +
        '<a href="#"' + btnAttr +
          ' role="button"' +
          ' data-product="' + sanitize(item.nome) + '"' +
          ' data-price="' + sanitize(formatPreco(item.preco)) + '">' +
          'Pedir via WhatsApp' +
        '</a>' +
      '</article>'
    );
  }

  /**
   * Fallback em cadeia: tenta extensões alternativas antes de usar o SVG inline.
   * Exposto em window para uso no atributo onerror inline.
   */
  var _triedExts = {};
  window.__cardapioImgFallback = function (img) {
    var src = img.getAttribute("data-original-src") || img.src;
    var base = src.replace(/\.[^.?]+(\?.*)?$/, "");
    var key = base;

    if (!_triedExts[key]) _triedExts[key] = [];
    var tried = _triedExts[key];

    var remaining = IMG_EXT_ORDER.filter(function (e) {
      return tried.indexOf(e) === -1;
    });

    // Marca a src atual como tentada
    var current = src.replace(/^.*(\.[^.?]+)(\?.*)?$/, "$1");
    if (current && tried.indexOf(current) === -1) tried.push(current);

    if (remaining.length > 0) {
      var next = remaining[0];
      tried.push(next);
      img.setAttribute("data-original-src", src);
      img.src = base + next;
    } else {
      // Todas as extensões falharam — aplica placeholder inline
      img.src = FALLBACK_SVG;
      img.parentElement && img.parentElement.classList.add("menu-card__media--fallback");
      img.onerror = null; // evita loop
    }
  };

  function renderCategoria(categoria, container) {
    container.innerHTML = "";
    (categoria.itens || []).forEach(function (item) {
      var tmp = document.createElement("div");
      tmp.innerHTML = buildCardHTML(item);
      var card = tmp.firstChild;
      container.appendChild(card);
    });
  }

  function initCardapio() {
    var grid = document.getElementById("menu-grid-dinamico");
    if (!grid) return; // grid não existe, cardápio estático permanece

    fetch("data/cardapio.json")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        var cats = data.categorias || [];
        if (!cats.length) return;
        // Renderiza apenas a primeira categoria (hambúrgueres)
        renderCategoria(cats[0], grid);
        // Re-inicializa listeners do WhatsApp e scroll reveal após renderização
        if (window.CHAMACardapioReady) CHAMACardapioReady();
      })
      .catch(function (err) {
        // Falha silenciosa — cardápio estático do HTML já está visível
        console.warn("[Chama] cardapio.json não carregou:", err.message);
      });
  }

  document.addEventListener("DOMContentLoaded", initCardapio);
})();
