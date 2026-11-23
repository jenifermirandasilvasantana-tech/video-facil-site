// Página de assinatura: Pix na própria página, cartão na tela do Asaas.
(function () {
  var local = location.hostname === "127.0.0.1";
  var API = local ? "http://127.0.0.1:8942" : "https://video-facil-api-z32n.onrender.com";
  var query = new URLSearchParams(location.search);
  var KEY = "video_facil_installation_id";

  function $(id) { return document.getElementById(id); }
  function show(name) {
    ["pay", "qr", "noapp", "wait", "done"].forEach(function (n) { $("p-" + n).hidden = n !== name; });
  }
  function message(text) { $("p-msg").textContent = text; $("p-msg").hidden = !text; }

  // Pergunta de tempos em tempos se o pagamento entrou.
  function watch(pedido, slowId) {
    var tries = 0;
    (function check() {
      fetch(API + "/api/pay/status/" + encodeURIComponent(pedido))
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.paid) show("done"); else again(); })
        .catch(again);
      function again() {
        tries += 1;
        if (tries === 36) $(slowId).hidden = false;
        setTimeout(check, tries < 60 ? 5000 : 20000);
      }
    })();
  }

  var id = query.get("installation_id") || "";
  try {
    if (id) sessionStorage.setItem(KEY, id);
    else id = sessionStorage.getItem(KEY) || "";
  } catch (e) { /* sem armazenamento, segue com o que veio no endereço */ }

  if (query.get("pedido")) { show("wait"); watch(query.get("pedido"), "p-slow"); return; }
  if (!id) { show("noapp"); return; }
  show("pay");
  if (query.get("cancelado")) message("Pagamento cancelado. Nada foi cobrado.");
  if (query.get("expirado")) message("O tempo para pagar acabou. Gere um novo pagamento.");

  // O servidor gratuito dorme: já vai acordando enquanto a pessoa preenche.
  fetch(API + "/api/pay/status/acordar").catch(function () {});

  var ERRORS = {
    nome_invalido: "Digite o seu nome completo.",
    email_invalido: "Esse e-mail não parece certo. Verifique.",
    cpf_invalido: "Esse CPF não confere. Verifique os números.",
    muitas_tentativas: "Muitas tentativas seguidas. Aguarde um pouco e tente de novo.",
    bloqueada: "Esta licença está bloqueada. Fale com o suporte.",
    instalacao_nao_encontrada: "Não achamos este computador. Abra o Vídeo Fácil com internet e clique em Ativar assinatura de novo.",
    instalacao_invalida: "Abra o Vídeo Fácil e clique em Ativar assinatura de novo."
  };
  var buttons = [$("p-pix"), $("p-card")];

  function send(button, path, data, done) {
    var label = button.textContent;
    buttons.forEach(function (b) { b.disabled = true; });
    button.textContent = "Um instante…";
    message("");
    var slow = setTimeout(function () { message("Só mais um instante, pode levar até 1 minuto."); }, 6000);
    var abort = new AbortController();
    var limit = setTimeout(function () { abort.abort(); }, 90000);
    data.installation_id = id;
    fetch(API + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: abort.signal
    })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (!d.ok) throw new Error(d.error); message(""); done(d); })
      .catch(function (e) {
        message(ERRORS[e.message] || "Não deu para abrir o pagamento agora. Nada foi cobrado. Tente de novo em instantes.");
      })
      .then(function () {
        clearTimeout(slow); clearTimeout(limit);
        buttons.forEach(function (b) { b.disabled = false; });
        button.textContent = label;
      });
  }

  $("p-cpf").addEventListener("input", function () {
    var d = this.value.replace(/\D/g, "").slice(0, 11);
    this.value = d.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2");
  });

  // Nome e e-mail servem para o suporte encontrar o cliente; valem para Pix e cartão.
  function customer() {
    var name = $("p-name").value.trim(), email = $("p-email").value.trim();
    if (name.length < 3) { message(ERRORS.nome_invalido); $("p-name").focus(); return null; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { message(ERRORS.email_invalido); $("p-email").focus(); return null; }
    return { name: name, email: email };
  }

  $("p-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var data = customer();
    if (!data) return;
    data.cpf = $("p-cpf").value;
    send($("p-pix"), "/api/pay/pix", data, function (d) {
      $("p-img").src = "data:image/png;base64," + d.image;
      $("p-code").value = d.code;
      $("p-name").value = ""; $("p-email").value = ""; $("p-cpf").value = "";
      show("qr");
      watch(d.pedido, "p-qrslow");
    });
  });

  $("p-card").addEventListener("click", function () {
    var data = customer();
    if (!data) return;
    send($("p-card"), "/api/pay/checkout", data, function (d) { location.href = d.url; });
  });

  $("p-copy").addEventListener("click", function () {
    var button = this, code = $("p-code");
    function ok() {
      button.textContent = "Copiado! ✓";
      setTimeout(function () { button.textContent = "Copiar código Pix"; }, 2500);
    }
    function old() { code.select(); if (document.execCommand("copy")) ok(); }
    if (navigator.clipboard) navigator.clipboard.writeText(code.value).then(ok, old); else old();
  });
})();
