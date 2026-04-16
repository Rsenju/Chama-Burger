/**
 * GA4 / Meta Pixel / GTM condicionados ao consentimento LGPD (flags em localStorage).
 * Cookies de remarketing: definidos apenas se Marketing = true (max-age 90 dias).
 */
(function (global) {
  "use strict";

  var FLAGS_KEY = "chama_lgpd_flags_v1";
  var REMARKETING_COOKIE = "chama_fb_remarketing";
  var NINETY_DAYS = 90 * 24 * 60 * 60;

  function loadFlags() {
    try {
      var raw = localStorage.getItem(FLAGS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setRemarketingCookie() {
    try {
      document.cookie =
        REMARKETING_COOKIE +
        "=1;path=/;max-age=" +
        NINETY_DAYS +
        ";SameSite=Lax" +
        (location.protocol === "https:" ? ";Secure" : "");
    } catch (e) {}
  }

  function injectScript(src, async, onload) {
    var s = document.createElement("script");
    s.src = src;
    if (async) s.async = true;
    if (onload) s.onload = onload;
    document.head.appendChild(s);
  }

  function initGA4(measurementId) {
    if (!measurementId || global.__ga4Loaded) return;
    global.__ga4Loaded = true;
    global.dataLayer = global.dataLayer || [];
    global.gtag = function () {
      global.dataLayer.push(arguments);
    };
    injectScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId), true, function () {
      global.gtag("js", new Date());
      global.gtag("config", measurementId, { anonymize_ip: true });
    });
  }

  function initMetaPixel(pixelId) {
    if (!pixelId || global.__fbqLoaded) return;
    global.__fbqLoaded = true;
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    global.fbq("init", pixelId);
    global.fbq("track", "PageView");
    setRemarketingCookie();
  }

  function initGTM(gtmId) {
    if (!gtmId || global.__gtmLoaded) return;
    global.__gtmLoaded = true;
    global.dataLayer = global.dataLayer || [];
    global.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    injectScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(gtmId), true);
  }

  /**
   * Aplica tags conforme flags salvas e CONFIG.
   */
  function initFromStorage() {
    var flags = loadFlags();
    if (!flags || !flags.necessary) return;
    var C = typeof CONFIG !== "undefined" ? CONFIG : {};

    if (C.gtmId) {
      initGTM(C.gtmId);
      return;
    }
    if (flags.analytics && C.ga4MeasurementId) {
      initGA4(C.ga4MeasurementId);
    }
    if (flags.marketing && C.metaPixelId) {
      initMetaPixel(C.metaPixelId);
    }
  }

  global.CHAMATracking = {
    initFromStorage: initFromStorage,
  };
})(typeof window !== "undefined" ? window : this);
