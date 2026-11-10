// ==========================================
// COOKIES (LGPD) + MÉTRICAS
// ==========================================
// Clarity (mapa de calor), Google Analytics e Google Tag Manager só carregam depois que o visitante aceita.
// A escolha fica salva no navegador (localStorage, chave "stutz-cookies").
(function () {
  const CLARITY_ID = "zb7bjn5t6k";
  const GTM_ID = "GTM-5KJF8LLJ";
  const GA_ID = "G-QTNZB9PTV2";
  const CHAVE = "stutz-cookies";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  let carregado = false;
  function carregarMetricas() {
    if (carregado) return;
    carregado = true;

    // Microsoft Clarity
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_ID);

    // Google Tag Manager (o Google Analytics é ligado dentro dele)
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    const gtm = document.createElement("script");
    gtm.async = true;
    gtm.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
    document.head.appendChild(gtm);

    // Google Analytics 4 (visitas, origem, tempo na página)
    const ga = document.createElement("script");
    ga.async = true;
    ga.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(ga);
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
  }

  function lerEscolha() {
    try { return localStorage.getItem(CHAVE); } catch (e) { return null; }
  }
  function salvarEscolha(valor) {
    try { localStorage.setItem(CHAVE, valor); } catch (e) {}
  }

  const escolha = lerEscolha();
  if (escolha === "aceito") carregarMetricas();

  document.addEventListener("DOMContentLoaded", function () {
    const aviso = document.getElementById("aviso-cookies");
    if (!aviso) return;

    const mostrar = () => aviso.classList.add("visivel");
    const esconder = () => aviso.classList.remove("visivel");

    if (!escolha) setTimeout(mostrar, 1200);

    aviso.querySelector("[data-cookies-aceitar]").addEventListener("click", function () {
      salvarEscolha("aceito");
      carregarMetricas();
      esconder();
    });
    aviso.querySelector("[data-cookies-recusar]").addEventListener("click", function () {
      salvarEscolha("recusado");
      esconder();
    });

    // Link "Cookies" no rodapé reabre o aviso para mudar a escolha
    document.querySelectorAll("[data-cookies-abrir]").forEach(function (link) {
      link.addEventListener("click", function (e) { e.preventDefault(); mostrar(); });
    });

    // Cada clique no WhatsApp vira um evento "clique_whatsapp" no Analytics e no Tag Manager,
    // com o lugar do botão (topo, flutuante, rodapé...) em "local_botao"
    document.querySelectorAll("[data-whats]").forEach(function (link) {
      link.addEventListener("click", function () {
        const local = link.dataset.local || link.className || "link";
        window.dataLayer.push({ event: "clique_whatsapp", local_botao: local });
        if (carregado) window.gtag("event", "clique_whatsapp", { local_botao: local });
      });
    });
  });
})();
