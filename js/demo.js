// Demonstração animada do Vídeo Fácil no topo do site:
// colar o link -> aparece a miniatura -> barra vai até 100% -> vídeo entra no histórico.
(function () {
  var demo = document.getElementById("demo");
  if (!demo) return;

  function el(name) { return demo.querySelector('[data-demo="' + name + '"]'); }
  var input = el("input"), paste = el("paste"), prev = el("prev"), ring = el("ring");
  var title = el("title"), meta = el("meta"), bar = el("bar"), pct = el("pct");
  var status = el("status"), novo = el("new");

  var LINK = "https://www.youtube.com/watch?v=cultodomingo";
  var TITULO = "Culto de Domingo — Louvor e Palavra (completo)";
  var DETALHES = "⏱ 1:42:08  •  Canal da Igreja";
  var timers = [], frame = null, running = false;

  function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function setProgress(p) {
    bar.style.width = (p * 100).toFixed(1) + "%";
    ring.style.setProperty("--p", (p * 100).toFixed(1) + "%");
    pct.textContent = p > 0 ? Math.floor(p * 100) + "%" : "";
  }

  function reset() {
    demo.classList.remove("is-hover", "is-press", "is-done");
    prev.classList.remove("is-shown");
    novo.classList.remove("is-shown");
    input.textContent = "Cole aqui o link do YouTube";
    input.classList.remove("has-text");
    title.textContent = "O nome e a imagem do vídeo aparecerão aqui.";
    meta.textContent = "";
    status.textContent = "Pronto para começar";
    status.classList.remove("ok");
    setProgress(0);
  }

  function baixar() {
    var inicio = performance.now(), duracao = 4600;
    function passo(agora) {
      var t = Math.min((agora - inicio) / duracao, 1);
      var p = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // começa e termina suave
      setProgress(p);
      var faltam = Math.max(Math.ceil((1 - p) * 95), 1);
      status.textContent = "Baixando • 9,2 MB/s • faltam " + faltam + " s";
      if (t < 1) { frame = requestAnimationFrame(passo); return; }
      demo.classList.add("is-done");
      status.textContent = "Download concluído com sucesso!";
      status.classList.add("ok");
      novo.classList.add("is-shown");
    }
    frame = requestAnimationFrame(passo);
  }

  function ciclo() {
    reset();
    later(600, function () { demo.classList.add("is-hover"); });
    later(1300, function () {
      demo.classList.add("is-press");
      input.textContent = LINK;
      input.classList.add("has-text");
      status.textContent = "Buscando nome e miniatura...";
    });
    later(1550, function () { demo.classList.remove("is-press", "is-hover"); });
    later(2200, function () {
      prev.classList.add("is-shown");
      title.textContent = TITULO;
      meta.textContent = DETALHES;
    });
    later(2500, baixar);
    later(10500, ciclo);
  }

  function start() {
    if (running) return;
    running = true;
    ciclo();
  }
  function stop() {
    running = false;
    timers.forEach(clearTimeout); timers = [];
    if (frame) cancelAnimationFrame(frame);
  }

  // Quem pediu ao Windows menos animação vê a demonstração sem deslizes (as trocas são instantâneas).
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) {
    demo.classList.add("calmo");
  }

  // Só anima quando a demonstração está na tela (economiza bateria).
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.2 }).observe(demo);
  } else {
    start();
  }
})();
