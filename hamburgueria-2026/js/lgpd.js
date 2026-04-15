/**
 * Banner de cookies, preferências e armazenamento criptografado (AES-GCM) do registro de consentimento.
 */
(function (global) {
  "use strict";

  var STORAGE_ENC = "chama_lgpd_consent_enc_v1";
  var STORAGE_FLAGS = "chama_lgpd_flags_v1";
  var PBKDF2_SALT_STATIC = "chama-burger-lgpd-salt-v1";
  var PBKDF2_ITERS = 120000;

  function getEl(id) {
    return document.getElementById(id);
  }

  function bufferToBase64(buf) {
    var bytes = new Uint8Array(buf);
    var binary = "";
    for (var i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return global.btoa(binary);
  }

  /**
   * Deriva chave AES-256 a partir de material fixo local (em produção, use backend/HSM).
   */
  function deriveKey() {
    var enc = new TextEncoder();
    return crypto.subtle
      .importKey(
        "raw",
        enc.encode(PBKDF2_SALT_STATIC),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
      )
      .then(function (keyMaterial) {
        var salt = enc.encode(PBKDF2_SALT_STATIC + "-salt");
        return crypto.subtle.deriveKey(
          {
            name: "PBKDF2",
            salt: salt,
            iterations: PBKDF2_ITERS,
            hash: "SHA-256",
          },
          keyMaterial,
          { name: "AES-GCM", length: 256 },
          false,
          ["encrypt", "decrypt"]
        );
      });
  }

  /**
   * Criptografa objeto de consentimento (timestamp, IP, categorias).
   */
  function encryptConsentPayload(obj) {
    var enc = new TextEncoder();
    var json = JSON.stringify(obj);
    if (!global.crypto || !global.crypto.subtle) {
      return Promise.resolve({
        iv: "",
        data: global.btoa(
          encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, function (_, p1) {
            return String.fromCharCode(parseInt(p1, 16));
          })
        ),
        algo: "FALLBACK_BASE64",
      });
    }
    var plain = enc.encode(json);
    var iv = crypto.getRandomValues(new Uint8Array(12));
    return deriveKey().then(function (key) {
      return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, plain).then(function (cipherBuf) {
        return {
          iv: bufferToBase64(iv.buffer),
          data: bufferToBase64(cipherBuf),
          algo: "AES-GCM",
        };
      });
    });
  }

  function saveFlags(flags) {
    try {
      localStorage.setItem(STORAGE_FLAGS, JSON.stringify(flags));
    } catch (e) {}
  }

  function loadFlags() {
    try {
      var raw = localStorage.getItem(STORAGE_FLAGS);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function hideBanner() {
    var b = getEl("lgpd-banner");
    if (b) {
      b.hidden = true;
      b.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("lgpd-banner-open");
  }

  function showBanner() {
    var b = getEl("lgpd-banner");
    if (b) {
      b.hidden = false;
      b.setAttribute("aria-hidden", "false");
    }
    document.body.classList.add("lgpd-banner-open");
  }

  function gatherConsentCategories(necessary, analytics, marketing) {
    return {
      necessary: !!necessary,
      analytics: !!analytics,
      marketing: !!marketing,
    };
  }

  function policyVersion() {
    return (typeof CONFIG !== "undefined" && CONFIG.policyVersion) || "1";
  }

  function persistConsent(categories, ip) {
    var payload = {
      ts: new Date().toISOString(),
      ip: ip || "indisponível",
      categories: categories,
      userAgent: navigator.userAgent || "",
      policyVersion: policyVersion(),
    };
    return encryptConsentPayload(payload)
      .then(function (packed) {
        try {
          localStorage.setItem(STORAGE_ENC, JSON.stringify(packed));
        } catch (e) {}
        saveFlags({
          necessary: true,
          analytics: categories.analytics,
          marketing: categories.marketing,
          savedAt: payload.ts,
        });
        if (global.CHAMATracking && CHAMATracking.initFromStorage) {
          CHAMATracking.initFromStorage();
        }
      })
      .catch(function () {
        saveFlags({
          necessary: true,
          analytics: categories.analytics,
          marketing: categories.marketing,
          savedAt: payload.ts,
        });
        if (global.CHAMATracking && CHAMATracking.initFromStorage) {
          CHAMATracking.initFromStorage();
        }
      });
  }

  function openModal() {
    var m = getEl("lgpd-modal");
    if (!m) return;
    m.hidden = false;
    m.setAttribute("aria-modal", "true");
    var f = getEl("lgpd-cat-analytics");
    var g = getEl("lgpd-cat-marketing");
    var flags = loadFlags();
    if (f) f.checked = !!(flags && flags.analytics);
    if (g) g.checked = !!(flags && flags.marketing);
  }

  function closeModal() {
    var m = getEl("lgpd-modal");
    if (!m) return;
    m.hidden = true;
    m.setAttribute("aria-modal", "false");
  }

  function initBanner() {
    var flags = loadFlags();
    var enc = null;
    try {
      enc = localStorage.getItem(STORAGE_ENC);
    } catch (e) {
      enc = null;
    }
    if (flags && flags.necessary && enc) {
      hideBanner();
      return;
    }
    if (flags && flags.necessary && !enc) {
      try {
        localStorage.removeItem(STORAGE_FLAGS);
      } catch (e2) {}
    }
    showBanner();

    var btnAccept = getEl("lgpd-accept-all");
    var btnReject = getEl("lgpd-reject");
    var btnCustom = getEl("lgpd-customize");
    var btnSave = getEl("lgpd-save-prefs");
    var btnClose = getEl("lgpd-modal-close");

    function getIpThen(cb) {
      if (global.CHAMASecurity && CHAMASecurity.fetchClientIp) {
        CHAMASecurity.fetchClientIp().then(cb);
      } else {
        cb("");
      }
    }

    if (btnAccept) {
      btnAccept.addEventListener("click", function () {
        getIpThen(function (ip) {
          persistConsent(gatherConsentCategories(true, true, true), ip).then(function () {
            hideBanner();
            closeModal();
          });
        });
      });
    }

    if (btnReject) {
      btnReject.addEventListener("click", function () {
        getIpThen(function (ip) {
          persistConsent(gatherConsentCategories(true, false, false), ip).then(function () {
            hideBanner();
            closeModal();
          });
        });
      });
    }

    if (btnCustom) {
      btnCustom.addEventListener("click", function () {
        openModal();
      });
    }

    if (btnSave) {
      btnSave.addEventListener("click", function () {
        var a = getEl("lgpd-cat-analytics");
        var mkt = getEl("lgpd-cat-marketing");
        getIpThen(function (ip) {
          persistConsent(
            gatherConsentCategories(true, a && a.checked, mkt && mkt.checked),
            ip
          ).then(function () {
            hideBanner();
            closeModal();
          });
        });
      });
    }

    if (btnClose) {
      btnClose.addEventListener("click", closeModal);
    }
  }

  global.CHAMALgpd = {
    init: initBanner,
  };
})(typeof window !== "undefined" ? window : this);
