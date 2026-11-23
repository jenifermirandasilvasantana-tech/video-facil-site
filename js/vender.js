// Barra fixa de chamada e ajuda para quem abre o site pelo celular.
(function () {
  var bar = document.getElementById("sticky"), hero = document.getElementById("inicio"), price = document.getElementById("preco");
  if (bar && "IntersectionObserver" in window) {
    var seen = { hero: true, price: false };
    new IntersectionObserver(function (list) {
      list.forEach(function (e) { seen[e.target === hero ? "hero" : "price"] = e.isIntersecting; });
      bar.hidden = seen.hero || seen.price;
    }, { threshold: 0.05 }).observe(hero);
    new IntersectionObserver(function (list) {
      seen.price = list[0].isIntersecting;
      bar.hidden = seen.hero || seen.price;
    }, { threshold: 0.3 }).observe(price);
  }

  // No celular o instalador não abre: troca por "enviar o link para o computador".
  var phone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!phone) return;
  document.documentElement.classList.add("is-phone");
  var link = "https://videofacilapp.com.br/";
  document.querySelectorAll('a[data-track="download_click"]').forEach(function (a) {
    a.removeAttribute("data-track");
    a.textContent = a.closest(".nav, .sticky-cta") ? "Enviar ao PC" : "Enviar o link para o meu computador";
    a.href = "https://wa.me/?text=" + encodeURIComponent("Vídeo Fácil: abra este link no computador para testar 30 dias grátis: " + link);
    a.addEventListener("click", function (e) {
      if (!navigator.share) return;
      e.preventDefault();
      navigator.share({ title: "Vídeo Fácil", text: "Abra no computador para testar 30 dias grátis:", url: link }).catch(function () {});
    });
  });
  var risk = document.querySelector(".risk");
  if (risk) risk.textContent = "O Vídeo Fácil é um programa para computador. Envie o link para você mesmo e abra no PC.";
})();
