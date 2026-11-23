// Abas "Por dentro do programa": só mudam quando a pessoa clica.
(function () {
  var tabs = [].slice.call(document.querySelectorAll(".tour-abas [role=tab]"));
  function show(t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute("aria-selected", on);
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { show(t); });
    t.addEventListener("keydown", function (e) {
      var d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      var n = tabs[(i + d + tabs.length) % tabs.length];
      show(n); n.focus();
    });
  });
})();
