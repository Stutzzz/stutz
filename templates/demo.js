// ==========================================
// DEMONSTRAÇÃO DOS TEMPLATES (Stutz Web)
// ==========================================
// Vai no fim do <body> de cada template, depois dos scripts do próprio template:
//   <script src="/templates/demo.js" data-elevar=".cta-bar" defer></script>
//
// - Barra no canto de baixo: Voltar (para os planos), Ver no celular / Ver no computador e Quero este template.
// - No computador, "Ver no celular" abre o site dentro de um celular, na própria tela.
// - No celular, "Ver no computador" abre o site numa tela de computador, encolhida para caber.
// - Os botões de contato do template (WhatsApp, telefone, links externos) não saem da página:
//   a marca é fictícia, então aparece um aviso de que é uma demonstração.
// - data-elevar (opcional): elementos fixos no pé da tela do template, como uma barra de CTA.
//   No celular eles sobem para ficar acima da barra; no computador, a barra é que sobe se os dois se cruzarem.

(function () {
  "use strict";

  const script = document.currentScript;
  const naPrevia = window.self !== window.top; // aberto dentro do celular ou do computador da própria demonstração
  const id = (location.pathname.match(/\/templates\/([^/]+)/) || [])[1] || "";
  const nome = /^template-\d+$/.test(id) ? id.replace("template-", "Template ") : "Template";
  const seletorElevar = (script && script.dataset.elevar) || "";
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Tamanho real das telas simuladas
  const CELULAR = { largura: 390, altura: 844, borda: 12 };
  const COMPUTADOR = { largura: 1440, alturaMin: 650, alturaMax: 900 };

  // Celular: tela estreita, ou tela de toque deitada (celular na horizontal)
  const midiaCelular = window.matchMedia("(max-width: 767px), (pointer: coarse) and (max-height: 500px)");
  const midiaFaixa = window.matchMedia("(max-width: 767px)"); // a barra ocupa a largura toda
  const ehCelular = () => midiaCelular.matches;

  const icone = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
  const ICONE = {
    voltar: icone('<path d="M19 12H5m6-6-6 6 6 6"/>'),
    seguir: icone('<path d="M5 12h14m-6-6 6 6-6 6"/>'),
    celular: icone('<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>'),
    computador: icone('<rect x="2.5" y="4" width="19" height="12.5" rx="2"/><path d="M8 20.5h8M12 16.5v4"/>'),
    fechar: icone('<path d="M6 6l12 12M18 6 6 18"/>'),
  };

  // Barra de status do celular (hora, sinal, wi-fi e bateria)
  const STATUS = `
    <span>9:41</span>
    <span class="ilha"></span>
    <span class="icones">
      <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M1.5 4.3a9.4 9.4 0 0 1 13 0"/><path d="M4.2 7.2a5.6 5.6 0 0 1 7.6 0"/><circle cx="8" cy="10.2" r="1.3" fill="currentColor" stroke="none"/></svg>
      <svg width="27" height="12" viewBox="0 0 27 12" aria-hidden="true"><rect x=".5" y=".5" width="23" height="11" rx="3.2" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="20" height="8" rx="1.9" fill="currentColor"/><path d="M25 4.2v3.6c.9-.3 1.5-1 1.5-1.8S25.9 4.5 25 4.2Z" fill="currentColor" opacity=".45"/></svg>
    </span>`;

  const CSS = `
:host { all: initial; }
*, *::before, *::after { box-sizing: border-box; }
.barra, .aviso, .camada {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.2; -webkit-font-smoothing: antialiased;
}
svg { display: block; flex: none; width: 18px; height: 18px; }

/* ---------- Barra ---------- */
.barra {
  position: fixed; z-index: 2147483001; left: 20px; bottom: 20px;
  display: flex; align-items: center; gap: 4px; padding: 6px;
  border: 1px solid rgba(255, 255, 255, .12); border-radius: 999px;
  background: rgba(12, 16, 24, .88); color: #eef2f8;
  box-shadow: 0 22px 44px -18px rgba(0, 0, 0, .6), 0 2px 8px rgba(0, 0, 0, .2);
  -webkit-backdrop-filter: blur(14px) saturate(1.4); backdrop-filter: blur(14px) saturate(1.4);
  translate: 0 calc(-1 * var(--subir, 0px)); /* sobe enquanto a barra de CTA do template está na tela */
  transition: transform .6s cubic-bezier(.2, .8, .2, 1), opacity .6s, translate .45s cubic-bezier(.2, .8, .2, 1);
}
.barra.entrando { opacity: 0; transform: translateY(24px); }
.bt {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  height: 44px; margin: 0; padding: 0 16px;
  border: 0; border-radius: 999px; background: transparent; color: inherit;
  font: inherit; font-size: 14px; font-weight: 600;
  text-decoration: none; white-space: nowrap; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color .2s;
}
.bt:hover { background: rgba(255, 255, 255, .1); }
.bt:focus-visible, .fechar:focus-visible { outline: 2px solid #4d9bff; outline-offset: 2px; }
.icone { display: inline-flex; }
.bt--quero { padding: 0 18px; background: #0a74e6; color: #fff; }
.bt--quero:hover { background: #0862c7; }
.bt--quero svg { transition: transform .2s; }
.bt--quero:hover svg { transform: translateX(3px); }

/* ---------- Aviso de demonstração ---------- */
.aviso {
  position: fixed; z-index: 2147483002; left: 20px; bottom: var(--acima, 20px);
  max-width: min(380px, calc(100vw - 40px)); margin: 0; padding: 13px 16px;
  border: 1px solid rgba(255, 255, 255, .1); border-radius: 14px;
  background: #111722; color: #eef2f8; font-size: 14px; line-height: 1.45;
  box-shadow: 0 16px 36px -14px rgba(0, 0, 0, .6);
  opacity: 0; transform: translateY(8px); pointer-events: none;
  transition: opacity .25s, transform .25s;
}
.aviso.visivel { opacity: 1; transform: none; }

/* ---------- Celular e computador abertos por cima do site ---------- */
.camada {
  position: fixed; inset: 0; z-index: 2147483000;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
  padding: 16px 16px var(--acima, 92px);
  background: rgba(6, 9, 14, .78);
  -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  opacity: 0; visibility: hidden;
  transition: opacity .3s, visibility 0s linear .3s;
}
.camada.aberta { opacity: 1; visibility: visible; transition: opacity .3s; }
.titulo { flex: none; margin: 0; color: #eef2f8; font-size: 14px; font-weight: 600; text-align: center; }
.titulo small { display: block; margin-top: 5px; color: rgba(238, 242, 248, .62); font-size: 12.5px; font-weight: 500; }
.fechar {
  position: absolute; top: 14px; right: 14px; display: grid; place-items: center;
  width: 44px; height: 44px; margin: 0; padding: 0;
  border: 1px solid rgba(255, 255, 255, .16); border-radius: 50%;
  background: rgba(255, 255, 255, .08); color: #fff; cursor: pointer;
  transition: background-color .2s;
}
.fechar:hover { background: rgba(255, 255, 255, .16); }

/* A tela simulada tem o tamanho real (--w x --h) e é encolhida (--s) para caber */
.encaixe { position: relative; flex: none; width: calc(var(--w) * var(--s) * 1px); height: calc(var(--h) * var(--s) * 1px); }
.aparelho { position: absolute; left: 0; top: 0; width: calc(var(--w) * 1px); height: calc(var(--h) * 1px); transform: scale(var(--s)); transform-origin: 0 0; }
iframe { display: block; width: 100%; height: 100%; border: 0; background: #fff; }

/* Celular */
.celular .aparelho {
  padding: 12px; border-radius: 58px; background: #07090d;
  box-shadow: 0 0 0 1.5px #2b303b, inset 0 0 0 1.5px rgba(255, 255, 255, .07), 0 50px 100px -40px rgba(0, 0, 0, .9);
}
.celular .aparelho::before, .celular .aparelho::after { content: ""; position: absolute; width: 4px; border-radius: 2px; background: #2b303b; }
.celular .aparelho::before { left: -5px; top: 170px; height: 60px; box-shadow: 0 80px 0 #2b303b; }
.celular .aparelho::after { right: -5px; top: 230px; height: 96px; }
.tela { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; border-radius: 46px; background: #fff; }
.status {
  position: relative; flex: none; display: flex; align-items: center; justify-content: space-between;
  height: 44px; padding: 2px 26px 0 34px;
  background: var(--fundo, #fff); color: var(--cor, #0b0f16); font-size: 15px; font-weight: 600;
}
.status .ilha { position: absolute; left: 50%; top: 10px; width: 112px; height: 30px; margin-left: -56px; border-radius: 16px; background: #07090d; }
.status .icones { display: flex; align-items: center; gap: 5px; }
.status svg { width: auto; height: 12px; }
.tela iframe { flex: 1; height: auto; }

/* Computador */
.janela { flex: none; overflow: hidden; border-radius: 10px; background: #1a1f29; box-shadow: 0 0 0 1.5px #2b303b, 0 40px 80px -30px rgba(0, 0, 0, .9); }
.janela-barra { display: flex; align-items: center; gap: 5px; height: 22px; padding: 0 9px; }
.janela-barra i { width: 7px; height: 7px; border-radius: 50%; background: #ff6b5e; }
.janela-barra i:nth-child(2) { background: #ffcf4c; }
.janela-barra i:nth-child(3) { background: #5ecb7a; }
.computador .encaixe { overflow: hidden; }
@media (orientation: landscape) { .girar { display: none !important; } }

/* ---------- Celular: a barra vira uma faixa no pé da tela ---------- */
@media (max-width: 767px) {
  .barra {
    left: 0; right: 0; bottom: 0; justify-content: space-between; gap: 6px;
    padding: 8px 10px calc(8px + env(safe-area-inset-bottom, 0px));
    border-width: 1px 0 0; border-radius: 18px 18px 0 0;
    background: #0c1018; box-shadow: 0 -10px 30px -12px rgba(0, 0, 0, .45);
  }
  .barra.entrando { opacity: 1; transform: translateY(100%); }
  .bt { padding: 0 13px; font-size: 13.5px; }
  .bt--voltar { width: 44px; padding: 0; }
  .bt--voltar .rotulo, .bt--quero .extra { display: none; }
  .aviso { left: 10px; right: 10px; max-width: none; }
  .camada { padding: 70px 10px var(--acima, 80px); }
}
@media (max-width: 379px) {
  .bt--tela .pre { display: none; }
  .bt--tela .dispositivo { text-transform: capitalize; }
}
@media (max-height: 500px) {
  .camada { padding-top: 10px; }
  .titulo { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .barra, .bt, .bt svg, .aviso, .camada { transition: none !important; }
}
@media print { .barra, .aviso, .camada { display: none !important; } }
`;

  // ---------- Base: um elemento com Shadow DOM, para o CSS do template não mexer na barra (e vice-versa) ----------
  let raiz = null;
  let aviso = null;
  let tempoAviso = 0;

  function criarRaiz() {
    if (raiz) return raiz;
    const host = document.createElement("div");
    host.id = "stutz-demo";
    host.style.cssText = "all: initial;";
    raiz = host.attachShadow({ mode: "open" });
    raiz.innerHTML = `<style>${CSS}</style><p class="aviso" role="status" aria-live="polite"></p>`;
    aviso = raiz.querySelector(".aviso");
    document.body.appendChild(host);
    return raiz;
  }

  // ---------- Aviso de demonstração ----------
  function avisar(texto) {
    if (naPrevia) {
      try {
        if (window.parent.StutzDemo) return window.parent.StutzDemo.avisar(texto);
      } catch (e) { /* mostra aqui mesmo */ }
    }
    criarRaiz();
    aviso.textContent = texto;
    aviso.classList.add("visivel");
    clearTimeout(tempoAviso);
    tempoAviso = setTimeout(() => aviso.classList.remove("visivel"), 4200);
  }

  function mensagemDoLink(url) {
    if (/(^|\.)(wa\.me|whatsapp\.com)$/i.test(url.hostname)) return "Isto é uma demonstração. No seu site, este botão abre a conversa no seu WhatsApp.";
    if (url.protocol === "tel:") return "Isto é uma demonstração. No seu site, este botão liga para a sua empresa.";
    if (url.protocol === "mailto:") return "Isto é uma demonstração. No seu site, este botão abre um e-mail para a sua empresa.";
    return "Isto é uma demonstração. No seu site, este link abre normalmente.";
  }

  // Links que sairiam da página (WhatsApp, telefone, e-mail, outros sites) só mostram o aviso
  document.addEventListener("click", (evento) => {
    const link = evento.target instanceof Element ? evento.target.closest("a[href]") : null;
    if (!link) return;
    let url;
    try { url = new URL(link.getAttribute("href"), location.href); } catch (e) { return; }
    if (url.origin === location.origin && /^https?:$/.test(url.protocol)) return;
    evento.preventDefault();
    avisar(mensagemDoLink(url));
  }, true);

  document.addEventListener("submit", (evento) => {
    evento.preventDefault();
    avisar("Isto é uma demonstração. No seu site, este formulário envia de verdade.");
  }, true);

  // Dentro do celular ou do computador simulados: sem barra, e o Esc fecha a simulação
  if (naPrevia) {
    document.documentElement.style.overscrollBehavior = "contain";
    document.addEventListener("keydown", (evento) => {
      if (evento.key !== "Escape") return;
      try { if (window.parent.StutzDemo) window.parent.StutzDemo.fechar(); } catch (e) { /* nada */ }
    });
    return;
  }

  // ---------- Barra e telas simuladas ----------
  criarRaiz();
  const formulario = "/formulario/?plano=express" + (id ? "&amp;template=" + encodeURIComponent(id) : "");
  const molde = document.createElement("template");
  molde.innerHTML = `
    <nav class="barra entrando" aria-label="Demonstração do ${nome}">
      <a class="bt bt--voltar" href="/planos/#templates" aria-label="Voltar para os planos">${ICONE.voltar}<span class="rotulo">Voltar</span></a>
      <button class="bt bt--tela" type="button" aria-expanded="false"><span class="icone"></span><span><span class="pre">Ver no </span><span class="dispositivo"></span></span></button>
      <a class="bt bt--quero" href="${formulario}"><span>Quero este<span class="extra"> template</span></span>${ICONE.seguir}</a>
    </nav>
    <div class="camada celular" role="dialog" aria-label="${nome} na versão para celular" data-lenis-prevent>
      <button class="fechar" type="button" aria-label="Fechar a versão para celular">${ICONE.fechar}</button>
      <p class="titulo">Versão para celular<small>Role dentro do celular para ver o site</small></p>
      <div class="encaixe"><div class="aparelho"><div class="tela"><div class="status">${STATUS}</div></div></div></div>
    </div>
    <div class="camada computador" role="dialog" aria-label="${nome} na versão para computador" data-lenis-prevent>
      <button class="fechar" type="button" aria-label="Fechar a versão para computador">${ICONE.fechar}</button>
      <p class="titulo">Versão para computador<small class="girar">Gire o celular para ver maior</small></p>
      <div class="janela"><div class="janela-barra"><i></i><i></i><i></i></div><div class="encaixe"><div class="aparelho"></div></div></div>
    </div>`;
  raiz.appendChild(molde.content);

  const barra = raiz.querySelector(".barra");
  const btnTela = raiz.querySelector(".bt--tela");
  const camadas = { celular: raiz.querySelector(".camada.celular"), computador: raiz.querySelector(".camada.computador") };
  const alvos = seletorElevar ? [...document.querySelectorAll(seletorElevar)] : [];
  let aberta = null; // "celular", "computador" ou null
  let tempoFechar = 0;
  let quadroPendente = 0;

  // A barra de status do celular usa a cor do tema do template
  const corTema = (document.querySelector('meta[name="theme-color"]') || {}).content || "#ffffff";
  const status = raiz.querySelector(".status");
  status.style.setProperty("--fundo", corTema);
  status.style.setProperty("--cor", corClara(corTema) ? "#0b0f16" : "#ffffff");

  function corClara(cor) {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(cor).trim());
    if (!m) return true;
    const hex = m[1].length === 3 ? m[1].replace(/./g, "$&$&") : m[1];
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return 0.299 * r + 0.587 * g + 0.114 * b > 150;
  }

  // No computador o botão oferece o celular; no celular, oferece o computador. Com a simulação aberta, oferece voltar.
  function atualizarBotao() {
    const oferece = aberta ? (aberta === "celular" ? "computador" : "celular") : ehCelular() ? "computador" : "celular";
    btnTela.querySelector(".icone").innerHTML = ICONE[oferece];
    btnTela.querySelector(".dispositivo").textContent = oferece;
    btnTela.setAttribute("aria-expanded", aberta ? "true" : "false");
  }

  // Afasta a barra dos elementos fixos do template que ficam no pé da tela (data-elevar).
  // No celular, eles sobem e ficam acima da faixa. No computador, a barra sobe só enquanto eles aparecem na tela.
  const visiveis = new Set();
  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => (e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target)));
      posicionar();
    });
    alvos.forEach((el) => observador.observe(el));
  }

  function posicionar() {
    const faixa = midiaFaixa.matches;
    const r = barra.getBoundingClientRect();
    const baseBarra = parseFloat(getComputedStyle(barra).bottom) || 0;
    let subir = 0;
    alvos.forEach((el) => {
      el.style.removeProperty("bottom");
      const cs = getComputedStyle(el);
      if (cs.position !== "fixed" || cs.display === "none") return;
      const e = el.getBoundingClientRect();
      if (!(e.width > 0 && e.left < r.right + 12 && e.right > r.left - 12)) return;
      if (faixa) el.style.bottom = baseBarra + barra.offsetHeight + 10 + "px";
      else if (!aberta && visiveis.has(el)) subir = Math.max(subir, (parseFloat(cs.bottom) || 0) + el.offsetHeight + 12 - baseBarra);
    });
    barra.style.setProperty("--subir", subir + "px");
    raiz.host.style.setProperty("--acima", baseBarra + subir + barra.offsetHeight + 10 + "px");
  }

  // Encolhe o celular ou o computador para caber na tela
  function medir() {
    if (!aberta) return;
    const camada = camadas[aberta];
    const cs = getComputedStyle(camada);
    const titulo = camada.querySelector(".titulo");
    const alturaTitulo = getComputedStyle(titulo).display === "none" ? 0 : titulo.offsetHeight + (parseFloat(cs.rowGap) || 0);
    const livreL = camada.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    let livreA = camada.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - alturaTitulo;
    let w;
    let h;
    let s;
    if (aberta === "celular") {
      w = CELULAR.largura + CELULAR.borda * 2;
      h = CELULAR.altura + CELULAR.borda * 2;
      s = Math.min(1, livreL / w, livreA / h);
    } else {
      livreA -= camada.querySelector(".janela-barra").offsetHeight;
      w = COMPUTADOR.largura;
      h = Math.round(Math.min(COMPUTADOR.alturaMax, Math.max(COMPUTADOR.alturaMin, (w * livreA) / livreL)));
      s = Math.min(livreL / w, livreA / h);
    }
    const encaixe = camada.querySelector(".encaixe");
    encaixe.style.setProperty("--w", w);
    encaixe.style.setProperty("--h", h);
    encaixe.style.setProperty("--s", Math.max(0.1, s).toFixed(4));
  }

  function abrir() {
    const modo = ehCelular() ? "computador" : "celular";
    const camada = camadas[modo];
    clearTimeout(tempoFechar);
    aberta = modo;
    const destino = camada.querySelector(modo === "celular" ? ".tela" : ".aparelho");
    destino.querySelectorAll("iframe").forEach((f) => f.remove());
    const quadro = document.createElement("iframe");
    quadro.src = location.pathname + "?previa=" + modo;
    quadro.title = nome + " na versão para " + modo;
    destino.appendChild(quadro);
    posicionar();
    medir();
    camada.classList.add("aberta");
    barra.setAttribute("data-lenis-prevent", "");
    if (ehCelular()) document.documentElement.style.overflow = "hidden";
    camada.querySelector(".fechar").focus({ preventScroll: true });
    atualizarBotao();
  }

  function fechar() {
    if (!aberta) return;
    const camada = camadas[aberta];
    aberta = null;
    posicionar();
    camada.classList.remove("aberta");
    barra.removeAttribute("data-lenis-prevent");
    document.documentElement.style.removeProperty("overflow");
    tempoFechar = setTimeout(() => camada.querySelectorAll("iframe").forEach((f) => f.remove()), 320);
    btnTela.focus({ preventScroll: true });
    atualizarBotao();
  }

  btnTela.addEventListener("click", () => (aberta ? fechar() : abrir()));
  Object.values(camadas).forEach((camada) => {
    camada.querySelector(".fechar").addEventListener("click", fechar);
    camada.addEventListener("click", (evento) => { if (evento.target === camada) fechar(); });
    // O fundo escuro não rola o site que está atrás
    camada.addEventListener("wheel", (evento) => evento.preventDefault(), { passive: false });
    camada.addEventListener("touchmove", (evento) => evento.preventDefault(), { passive: false });
  });
  barra.addEventListener("wheel", (evento) => { if (aberta) evento.preventDefault(); }, { passive: false });
  document.addEventListener("keydown", (evento) => { if (evento.key === "Escape" && aberta) fechar(); });

  function aoRedimensionar() {
    cancelAnimationFrame(quadroPendente);
    quadroPendente = requestAnimationFrame(() => {
      // Virou de computador para celular (ou o contrário): a simulação aberta deixa de fazer sentido
      if (aberta && aberta !== (ehCelular() ? "computador" : "celular")) fechar();
      atualizarBotao();
      posicionar();
      medir();
    });
  }
  window.addEventListener("resize", aoRedimensionar);
  window.addEventListener("load", aoRedimensionar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(aoRedimensionar);

  window.StutzDemo = { avisar, fechar };

  atualizarBotao();
  posicionar();
  setTimeout(() => barra.classList.remove("entrando"), reduzir ? 0 : 900);
})();
