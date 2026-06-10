(function () {
  "use strict";

  var GA4_MEASUREMENT_ID = "G-6N053DRXP2"; // GA4 Measurement ID for the HStars marketing site

  var idLooksReal = /^G-[A-Z0-9]{6,}$/.test(GA4_MEASUREMENT_ID) && GA4_MEASUREMENT_ID.indexOf("XXXX") === -1;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  if (idLooksReal) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_MEASUREMENT_ID);
    document.head.appendChild(s);

    gtag("js", new Date());
    gtag("config", GA4_MEASUREMENT_ID);
  }

  function track(eventName, params) {
    try {
      window.gtag("event", eventName, params || {});
    } catch (e) {
      /* analytics must never break the page */
    }
  }

  // Read the utm_content value from a CTA link so we know which button converted.
  function utmContentFromHref(href) {
    if (!href) return undefined;
    var match = href.match(/[?&]utm_content=([^&#]*)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  }

  document.addEventListener("click", function (event) {
    var el = event.target.closest("[data-track]");
    if (!el) return;

    var type = el.getAttribute("data-track");
    if (type === "cta") {
      track("cta_get_started", { utm_content: utmContentFromHref(el.getAttribute("href")) });
    } else if (type === "whatsapp_click") {
      track("whatsapp_click", {});
    } else if (type === "language_switch") {
      track("language_switch", { destination: el.getAttribute("hreflang") || undefined });
    }
  });

  // Fire contact_form_submit when the success message becomes visible.
  function watchContactForm() {
    var messages = document.querySelectorAll(".php-email-form .sent-message");
    messages.forEach(function (node) {
      var observer = new MutationObserver(function () {
        if (node.classList.contains("d-block")) {
          track("contact_form_submit", {});
          observer.disconnect();
        }
      });
      observer.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchContactForm);
  } else {
    watchContactForm();
  }
})();
