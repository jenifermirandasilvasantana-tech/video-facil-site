// Contagem de visitas e cliques: os números continuam aparecendo no painel do administrador.
(function () {
  var TRACK_URL = "https://video-facil.floot.app/_api/analytics/track";

  function visitorId() {
    var key = "video_facil_visitor_id";
    try {
      var id = localStorage.getItem(key);
      if (!id) {
        id = window.crypto && crypto.randomUUID
          ? crypto.randomUUID()
          : "vf-" + Date.now() + "-" + Math.random().toString(36).slice(2);
        localStorage.setItem(key, id);
      }
      return id;
    } catch (e) {
      return "vf-sem-armazenamento";
    }
  }

  function track(eventName) {
    try {
      if (window.clarity) window.clarity("event", eventName);
      var body = JSON.stringify({
        eventName: eventName,
        visitorId: visitorId(),
        source: "site-proprio",
        paymentMethod: null
      });
      var blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
      if (!(navigator.sendBeacon && navigator.sendBeacon(TRACK_URL, blob))) {
        fetch(TRACK_URL, { method: "POST", mode: "no-cors", keepalive: true, body: blob });
      }
    } catch (e) { /* a contagem nunca pode atrapalhar o site */ }
  }

  // Uma visita por pessoa (igual ao site antigo).
  try {
    var visitKey = "video_facil_site_visit_recorded";
    if (!localStorage.getItem(visitKey)) {
      localStorage.setItem(visitKey, "1");
      track("site_visit");
    }
  } catch (e) {
    track("site_visit");
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("[data-track]");
    if (link) track(link.getAttribute("data-track"));
  });

  // Microsoft Clarity (mesmo projeto do site antigo).
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", "ytsyr86t5e");
})();
