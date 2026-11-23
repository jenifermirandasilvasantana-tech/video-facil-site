// Carrossel do topo: passa sozinho, com setas, bolinhas e o dedo no celular.
(function () {
  var box = document.getElementById("carrossel");
  if (!box) return;
  var track = box.querySelector(".c-track"), slides = [].slice.call(box.querySelectorAll(".slide"));
  var dots = [].slice.call(box.querySelectorAll(".c-dots button"));
  var now = 0, timer = null, visible = true, hold = false;
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function go(n) {
    now = (n + slides.length) % slides.length;
    track.style.transform = "translateX(-" + now * 100 + "%)";
    slides.forEach(function (s, i) { s.classList.toggle("on", i === now); s.setAttribute("aria-hidden", i !== now); });
    dots.forEach(function (d, i) { d.setAttribute("aria-current", i === now); });
  }
  function play() {
    clearInterval(timer);
    timer = setInterval(function () { if (visible && !hold && !document.hidden) go(now + 1); }, 5000);
  }
  function move(n) { go(n); play(); }

  box.querySelector(".c-prev").addEventListener("click", function () { move(now - 1); });
  box.querySelector(".c-next").addEventListener("click", function () { move(now + 1); });
  dots.forEach(function (d, i) { d.addEventListener("click", function () { move(i); }); });
  box.addEventListener("mouseenter", function () { hold = true; });
  box.addEventListener("mouseleave", function () { hold = false; });
  box.addEventListener("focusin", function () { hold = true; });
  box.addEventListener("focusout", function () { hold = false; });
  box.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") move(now - 1);
    if (e.key === "ArrowRight") move(now + 1);
  });
  var x = null;
  box.addEventListener("touchstart", function (e) { x = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (x === null) return;
    var d = e.changedTouches[0].clientX - x; x = null;
    if (Math.abs(d) > 45) move(now + (d < 0 ? 1 : -1));
  }, { passive: true });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (l) { visible = l[0].isIntersecting; }, { threshold: 0.3 }).observe(box);
  }
  if (calm) track.style.transition = "none";
  go(0); play();
})();
