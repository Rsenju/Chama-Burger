/**
 * Validação, sanitização anti-XSS/SQLi, anti path traversal e rate limiting (mitigação client-side).
 */
(function (global) {
  "use strict";

  var RATE_KEY_PREFIX = "chama_rate_v2_";
  var RATE_WINDOW_MS = 60 * 1000;
  var RATE_MAX = 3;
  var RATE_COOLDOWN_MS = 30 * 1000;

  /**
   * Escapa entidades HTML (uso em saídas; preferir sempre textContent no DOM).
   * @param {string} s
   * @returns {string}
   */
  function escapeHtml(s) {
    if (s == null) return "";
    var map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(s).replace(/[&<>"']/g, function (c) {
      return map[c] || c;
    });
  }

  /**
   * Remove tags, protocolos perigosos, padrões comuns de injeção e control chars.
   * @param {string} raw
   * @returns {string}
   */
  function sanitizeInput(raw) {
    if (raw == null) return "";
    var s = String(raw);
    var i;
    for (i = 0; i < 4; i++) {
      s = s.replace(/<[^>]*>/gi, "");
    }
    s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
    s = s.replace(/javascript\s*:/gi, "");
    s = s.replace(/data\s*:/gi, "");
    s = s.replace(/vbscript\s*:/gi, "");
    s = s.replace(/\bon\w+\s*=/gi, "");
    s = s.replace(/;\s*--/g, " ");
    s = s.replace(/\/\*[\s\S]*?\*\//g, " ");
    return s.trim();
  }

  /** Alias semântico para formulários */
  function sanitizeText(raw) {
    return sanitizeInput(raw);
  }

  function apenasDigitos(str) {
    return String(str).replace(/\D/g, "");
  }

  /**
   * Hash não criptográfico para chave de rate limit (evita armazenar IP em claro no nome da chave).
   */
  function hashIdentifier(str) {
    var s = String(str || "unknown");
    var h = 5381;
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    }
    return (h >>> 0).toString(16);
  }

  function rateStorageKey(ip) {
    return RATE_KEY_PREFIX + hashIdentifier(ip);
  }

  function loadRateState(ip) {
    var key = rateStorageKey(ip);
    var raw;
    try {
      raw = localStorage.getItem(key);
    } catch (e) {
      return { timestamps: [], blockUntil: 0 };
    }
    if (!raw) return { timestamps: [], blockUntil: 0 };
    try {
      var o = JSON.parse(raw);
      if (!o || typeof o !== "object") return { timestamps: [], blockUntil: 0 };
      if (!Array.isArray(o.timestamps)) o.timestamps = [];
      o.blockUntil = Number(o.blockUntil) || 0;
      return o;
    } catch (e2) {
      return { timestamps: [], blockUntil: 0 };
    }
  }

  function saveRateState(ip, state) {
    try {
      localStorage.setItem(rateStorageKey(ip), JSON.stringify(state));
    } catch (e) {}
  }

  /**
   * Telefone BR: 10 ou 11 dígitos; celular com 9 na posição após DDD.
   */
  function telefoneValido(tel) {
    var d = apenasDigitos(tel);
    if (!/^[1-9]{2}/.test(d)) return false;
    if (d.length === 11) {
      return /^[1-9]{2}9\d{8}$/.test(d);
    }
    if (d.length === 10) {
      return /^[1-9]{2}\d{8}$/.test(d);
    }
    return false;
  }

  function nomeValido(nome) {
    var n = sanitizeInput(nome);
    if (n.replace(/\s/g, "").length < 3) return false;
    return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(n);
  }

  function enderecoSuspeito(endereco) {
    var s = String(endereco || "");
    return (
      /\.\.[\/\\]/.test(s) ||
      /%2e%2e/i.test(s) ||
      /\.\.%2f/i.test(s) ||
      /etc\/passwd/i.test(s) ||
      /%00/.test(s)
    );
  }

  function enderecoValido(endereco) {
    var e = sanitizeInput(endereco);
    if (e.length < 10 || e.length > 300) return false;
    if (enderecoSuspeito(endereco) || enderecoSuspeito(e)) return false;
    return true;
  }

  function mensagemValida(msg) {
    var m = sanitizeInput(msg);
    return m.length >= 5 && m.length <= 500;
  }

  /**
   * IP para consentimento/rate limit; falha silenciosa (rede offline etc.).
   */
  function fetchClientIp() {
    return fetch("https://api.ipify.org?format=json", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("ip_http_" + r.status);
        return r.json();
      })
      .then(function (j) {
        return j && j.ip ? String(j.ip) : "";
      })
      .catch(function () {
        return "";
      });
  }

  /**
   * Limite: no máximo RATE_MAX envios na janela; após exceder, bloqueio RATE_COOLDOWN_MS.
   */
  function canSubmit(ip) {
    var now = Date.now();
    var state = loadRateState(ip);
    if (state.blockUntil && now < state.blockUntil) {
      return false;
    }
    if (state.blockUntil && now >= state.blockUntil) {
      state.blockUntil = 0;
      state.timestamps = [];
      saveRateState(ip, state);
    }
    var list = state.timestamps.filter(function (t) {
      return now - t < RATE_WINDOW_MS;
    });
    return list.length < RATE_MAX;
  }

  function registerSubmit(ip) {
    var now = Date.now();
    var state = loadRateState(ip);
    state.timestamps = state.timestamps.filter(function (t) {
      return now - t < RATE_WINDOW_MS;
    });
    state.timestamps.push(now);
    if (state.timestamps.length >= RATE_MAX) {
      state.blockUntil = now + RATE_COOLDOWN_MS;
      state.timestamps = [];
    }
    saveRateState(ip, state);
  }

  /** Segundos restantes de bloqueio (0 se não bloqueado). */
  function cooldownRemainingSec(ip) {
    var state = loadRateState(ip);
    var now = Date.now();
    if (!state.blockUntil || now >= state.blockUntil) return 0;
    return Math.ceil((state.blockUntil - now) / 1000);
  }

  /**
   * Valida formulário de pedido + checkboxes LGPD.
   */
  function validatePedidoForm(getEl) {
    var errors = {};
    var nome = getEl("nome");
    var tel = getEl("telefone");
    var endereco = getEl("endereco");
    var msg = getEl("mensagem");
    var chkLgpd = getEl("chk-lgpd");
    var chkDados = getEl("chk-dados");

    var nomeV = sanitizeInput(nome && nome.value);
    var telRaw = tel && tel.value ? String(tel.value) : "";
    var telV = telRaw.trim();
    var endV = sanitizeInput(endereco && endereco.value);
    var msgV = sanitizeInput(msg && msg.value);

    if (!nomeValido(nome && nome.value)) {
      errors.nome =
        nomeV.replace(/\s/g, "").length < 3
          ? "Informe pelo menos 3 letras no nome."
          : "Use apenas letras, espaços, apóstrofo ou hífen no nome.";
    }
    if (!telV.replace(/\s/g, "").length) {
      errors.telefone = "Informe seu WhatsApp.";
    } else if (!telefoneValido(telV)) {
      errors.telefone = "Telefone inválido. Use DDD + número (10 ou 11 dígitos).";
    }
    if (enderecoSuspeito(endereco && endereco.value)) {
      errors.endereco = "Endereço contém sequência não permitida.";
    } else if (!enderecoValido(endereco && endereco.value)) {
      errors.endereco = "Endereço completo com 10 a 300 caracteres, sem atalhos de caminho (../).";
    }
    if (!mensagemValida(msg && msg.value)) {
      if (!msgV) errors.mensagem = "Descreva seu pedido.";
      else if (msgV.length < 5) errors.mensagem = "Pedido muito curto (mín. 5 caracteres).";
      else errors.mensagem = "Pedido muito longo (máx. 500 caracteres).";
    }
    if (!chkLgpd || !chkLgpd.checked) {
      errors.lgpd = "Você precisa aceitar a Política de Privacidade.";
    }
    if (!chkDados || !chkDados.checked) {
      errors.dados = "Autorize o uso dos dados para este pedido.";
    }

    var ok = Object.keys(errors).length === 0;
    return {
      ok: ok,
      errors: errors,
      values: {
        nome: nomeV,
        telefone: telV,
        endereco: endV,
        mensagem: msgV,
      },
    };
  }

  global.CHAMASecurity = {
    escapeHtml: escapeHtml,
    sanitizeInput: sanitizeInput,
    sanitizeText: sanitizeText,
    telefoneValido: telefoneValido,
    nomeValido: nomeValido,
    fetchClientIp: fetchClientIp,
    canSubmit: canSubmit,
    registerSubmit: registerSubmit,
    cooldownRemainingSec: cooldownRemainingSec,
    validatePedidoForm: validatePedidoForm,
  };
})(typeof window !== "undefined" ? window : this);
