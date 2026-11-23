// Página de assinatura: cria o pagamento no servidor de licenças e confirma a liberação.
(function () {
  var local = location.hostname === "127.0.0.1";
  var API = local ? "http://127.0.0.1:8942" : "https://video-facil-api-z32n.onrender.com";
  var query = new URLSearchParams(location.search);
  var KEY = "video_facil_installation_id";

  function $(id) { return document.getElementById(id); }
  function show(name) {
    ["pay", "noapp", "wait", "done"].forEach(function (n) { $("p-" + n).hidden = n !== name; });
  }
  function message(text) { $("p-msg").textContent = text; $("p-msg").hidden = !text; }

  var id = query.get("installation_id") || "";
  try {
    if (id) sessionStorage.setItem(KEY, id);
    else id = sessionStorage.getItem(KEY) || "";
  } catch (e) { /* sem armazenamento, segue com o que veio no endereço */ }

  var pedido = query.get("pedido");
  if (pedido) {
    show("wait");
    var tries = 0;
    (function check() {
      fetch(API + "/api/pay/status/" + encodeURIComponent(pedido))
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.paid) show("done"); else again(); })
        .catch(again);
      function again() {
        tries += 1;
        if (tries === 24) $("p-slow").hidden = false;
        setTimeout(check, tries < 24 ? 5000 : 20000);
      }
    })();
    return;
  }

  if (!id) { show("noapp"); return; }
  show("pay");
  if (query.get("cancelado")) message("Pagamento cancelado. Nada foi cobrado.");
  if (query.get("expirado")) message("O tempo para pagar acabou. Clique para gerar um novo pagamento.");

  // O servidor gratuito dorme: já vai acordando enquanto a pessoa lê.
  fetch(API + "/api/pay/status/acordar").catch(function () {});

  var button = $("p-button"), label = button.textContent;
  button.addEventListener("click", function () {
    button.disabled = true;
    button.textContent = "Abrindo o pagamento…";
    message("");
    var slow = setTimeout(function () { message("Só mais um instante, pode levar até 1 minuto."); }, 6000);
    var abort = new AbortController();
    var limit = setTimeout(function () { abort.abort(); }, 90000);
    fetch(API + "/api/pay/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ installation_id: id }),
      signal: abort.signal
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.ok) { location.href = d.url; return; }
        throw new Error(d.error);
      })
      .catch(function (e) {
        message({
          bloqueada: "Esta licença está bloqueada. Fale com o suporte.",
          instalacao_nao_encontrada: "Não achamos este computador. Abra o Vídeo Fácil com internet e clique em Ativar assinatura de novo.",
          instalacao_invalida: "Abra o Vídeo Fácil e clique em Ativar assinatura de novo."
        }[e.message] || "Não deu para abrir o pagamento agora. Nada foi cobrado. Tente de novo em instantes.");
      })
      .then(function () {
        clearTimeout(slow); clearTimeout(limit);
        button.disabled = false;
        button.textContent = label;
      });
  });
})();
