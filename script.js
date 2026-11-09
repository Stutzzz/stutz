// ==========================================
// CONFIGURAÇÃO
// ==========================================
// Coloque o número com DDI e DDD, só números (ex: "5511999999999").
// Enquanto estiver vazio, os botões "Agendar conversa" levam para o contato no rodapé.
const WHATSAPP = "";
const MENSAGEM_WHATS = "Olá! Vim pelo site da STUTZ e quero um orçamento de site.";
const EMAIL_CONTATO = "contato@stutz.com.br";

const temGsap = !!(window.gsap && window.ScrollTrigger && window.ScrollSmoother && window.SplitText);
const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const animar = temGsap && !reduzido;

if (!animar) document.documentElement.classList.add("sem-animacao");

// ==========================================
// CONTEÚDO DINÂMICO (antes das animações)
// ==========================================
if (WHATSAPP) {
  const link = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAGEM_WHATS)}`;
  document.querySelectorAll("[data-whats]").forEach((a) => {
    a.href = link;
    a.target = "_blank";
    a.rel = "noopener";
  });
}

// Carrossel de cases: duplica os itens para a rolagem infinita
const casesTrack = document.getElementById("cases-track");
if (casesTrack) {
  const copia = casesTrack.innerHTML;
  casesTrack.insertAdjacentHTML("beforeend", copia);
  [...casesTrack.children].slice(casesTrack.children.length / 2).forEach((el) => el.setAttribute("aria-hidden", "true"));
}

// Carrossel de cases: anda sozinho, mas aceita arrastar com o dedo ou o mouse
const casesMarquee = document.querySelector(".cases-marquee");
if (casesMarquee && casesTrack) {
  const VELOCIDADE = 0.5;     // pixels por quadro
  const ESPERA_RETOMAR = 2000; // ms depois de soltar

  let posicao = 1;
  let pausado = false;
  let tempoRetomar;

  const metade = () => casesTrack.scrollWidth / 2;

  // Mantém a posição dentro da primeira cópia, para o loop nunca acabar
  const normalizar = () => {
    const m = metade();
    if (casesMarquee.scrollLeft >= m) casesMarquee.scrollLeft -= m;
    else if (casesMarquee.scrollLeft < 1) casesMarquee.scrollLeft += m;
  };

  const pausar = () => {
    pausado = true;
    clearTimeout(tempoRetomar);
  };

  const retomarDepois = () => {
    clearTimeout(tempoRetomar);
    tempoRetomar = setTimeout(() => {
      posicao = casesMarquee.scrollLeft;
      pausado = false;
    }, ESPERA_RETOMAR);
  };

  // Toque no celular
  casesMarquee.addEventListener("touchstart", pausar, { passive: true });
  casesMarquee.addEventListener("touchend", retomarDepois, { passive: true });
  casesMarquee.addEventListener("touchcancel", retomarDepois, { passive: true });

  // Mouse: para em cima e permite arrastar
  let arrastando = false;
  let inicioX = 0;
  let inicioScroll = 0;
  casesMarquee.addEventListener("mouseenter", pausar);
  casesMarquee.addEventListener("mouseleave", () => { arrastando = false; casesMarquee.classList.remove("arrastando"); retomarDepois(); });
  casesMarquee.addEventListener("mousedown", (e) => {
    arrastando = true;
    inicioX = e.clientX;
    inicioScroll = casesMarquee.scrollLeft;
    casesMarquee.classList.add("arrastando");
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!arrastando) return;
    casesMarquee.scrollLeft = inicioScroll - (e.clientX - inicioX);
  });
  window.addEventListener("mouseup", () => {
    arrastando = false;
    casesMarquee.classList.remove("arrastando");
  });

  // Trackpad / roda do mouse na horizontal
  casesMarquee.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { pausar(); retomarDepois(); }
  }, { passive: true });

  casesMarquee.addEventListener("scroll", () => { if (pausado) normalizar(); }, { passive: true });

  const andar = () => {
    if (!pausado && !reduzido) {
      posicao += VELOCIDADE;
      const m = metade();
      if (posicao >= m) posicao -= m;
      casesMarquee.scrollLeft = posicao;
    }
    requestAnimationFrame(andar);
  };

  casesMarquee.scrollLeft = posicao;
  requestAnimationFrame(andar);
}

// Faixa do e-mail no rodapé
const marquee = document.getElementById("marquee");
if (marquee) {
  const estrela = '<svg class="footer-star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" /></svg>';
  marquee.innerHTML = Array(8).fill(`<span>${EMAIL_CONTATO}</span>${estrela}`).join("");
}

// Celular: duas faixas de janelas rodando na seção de chamada (cópias das janelas que explodem)
const containerCards = document.querySelector(".sessao-cards .cards-container");
if (containerCards) {
  const janelas = [...containerCards.querySelectorAll(".xcard .mac")];
  const criarFaixa = (lista, classe) => {
    const faixa = document.createElement("div");
    faixa.className = `x-faixa ${classe}`;
    faixa.setAttribute("aria-hidden", "true");
    const trilho = document.createElement("div");
    trilho.className = "x-trilho";
    [...lista, ...lista].forEach((mac) => trilho.appendChild(mac.cloneNode(true)));
    faixa.appendChild(trilho);
    return faixa;
  };
  containerCards.prepend(criarFaixa(janelas.slice(0, 3), "x-faixa--1"));
  containerCards.append(criarFaixa(janelas.slice(3), "x-faixa--2"));
}

// Carrossel do "Como funciona" no celular: bolinhas acompanham o card visível
const trilhoPassos = document.querySelector(".processo-right");
const bolinhas = document.querySelectorAll(".processo-dots button");
if (trilhoPassos && bolinhas.length) {
  const cardsPasso = [...trilhoPassos.querySelectorAll(".passo-card")];
  const marcar = () => {
    const centro = trilhoPassos.scrollLeft + trilhoPassos.clientWidth / 2;
    let atual = 0;
    cardsPasso.forEach((c, i) => {
      if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - centro) < Math.abs(cardsPasso[atual].offsetLeft + cardsPasso[atual].offsetWidth / 2 - centro)) atual = i;
    });
    bolinhas.forEach((b, i) => b.classList.toggle("ativo", i === atual));
  };
  trilhoPassos.addEventListener("scroll", marcar, { passive: true });
  bolinhas.forEach((b, i) => b.addEventListener("click", () => {
    trilhoPassos.scrollTo({ left: cardsPasso[i].offsetLeft - (trilhoPassos.clientWidth - cardsPasso[i].offsetWidth) / 2, behavior: "smooth" });
  }));
}

document.getElementById("ano").textContent = new Date().getFullYear();

// ==========================================
// MODO ESCURO / CLARO
// ==========================================
const botaoTema = document.querySelector(".theme-toggle");
const metaTema = document.querySelector('meta[name="theme-color"]');

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  botaoTema.setAttribute("aria-label", tema === "dark" ? "Mudar para o modo claro" : "Mudar para o modo escuro");
  if (metaTema) metaTema.setAttribute("content", tema === "dark" ? "#0b0f16" : "#e3e9f0");
}

aplicarTema(document.documentElement.getAttribute("data-theme") || "dark");

botaoTema.addEventListener("click", () => {
  const novo = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.classList.add("trocando-tema");
  aplicarTema(novo);
  try { localStorage.setItem("stutz-tema", novo); } catch (e) {}
  setTimeout(() => document.documentElement.classList.remove("trocando-tema"), 450);
});

// ==========================================
// MENU DO CELULAR
// ==========================================
const menuBtn = document.querySelector(".menu-btn");
const popup = document.querySelector(".menu-popup");

function fecharMenu() {
  menuBtn.classList.remove("ativo");
  popup.classList.remove("ativo");
  menuBtn.setAttribute("aria-expanded", "false");
  popup.setAttribute("aria-hidden", "true");
}

menuBtn.addEventListener("click", () => {
  const aberto = popup.classList.toggle("ativo");
  menuBtn.classList.toggle("ativo", aberto);
  menuBtn.setAttribute("aria-expanded", aberto);
  popup.setAttribute("aria-hidden", !aberto);
});

// ==========================================
// FAQ
// ==========================================
const faqRows = document.querySelectorAll(".faq-row");
faqRows.forEach((row) => {
  row.addEventListener("click", () => {
    const estavaAberto = row.classList.contains("ativo");
    faqRows.forEach((r) => r.classList.remove("ativo"));
    if (!estavaAberto) row.classList.add("ativo");
    if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 520);
  });
});

// ==========================================
// CANAIS ACENDENDO EM LOOP
// ==========================================
const cardsCanais = document.querySelectorAll(".cardicone3");
if (cardsCanais.length) {
  const estados = [
    [4, 8, 9],
    [1, 5, 9],
    [2, 6, 10],
    [5, 6, 7],
  ];
  let estadoAtual = 0;

  const atualizarCanais = () => {
    cardsCanais.forEach((card) => card.classList.remove("ativo"));
    estados[estadoAtual].forEach((i) => cardsCanais[i] && cardsCanais[i].classList.add("ativo"));
    estadoAtual = (estadoAtual + 1) % estados.length;
  };

  atualizarCanais();
  if (!reduzido) setInterval(atualizarCanais, 2000);
}

// ==========================================
// VÍDEOS DE FUNDO (carregam depois da página)
// ==========================================
function videoDeFundo(container, src) {
  if (!container || reduzido) return;
  const video = document.createElement("video");
  video.src = src;
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.style.opacity = 0;
  video.addEventListener("canplaythrough", () => { video.style.opacity = 1; });
  container.appendChild(video);
}

window.addEventListener("load", () => {
  videoDeFundo(document.querySelector(".hero .imgBackground"), "./assets/img/video-hero.mp4");
  videoDeFundo(document.querySelector("footer .imgBackground"), "./assets/img/video-footer.mp4");
  if (animar) ScrollTrigger.refresh();
});

// ==========================================
// ANIMAÇÕES GSAP
// ==========================================
let smoother = null;

function iniciarAnimacoes() {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

  smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.5,
    effects: true,
  });

  const mm = gsap.matchMedia();

  const DESKTOP = "(min-width: 769px)";
  const CELULAR = "(max-width: 768px)";

  // ---------- 1a. Computador: hero fixado + 11 colunas + texto letra a letra ----------
  mm.add(DESKTOP, () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "main",
        start: "100% 100%",
        end: "+=2000",
        scrub: 1,
        pin: true,
        refreshPriority: 1,
      },
    });

    tl.to(".hero .transition div", { height: "100%", duration: 1, stagger: 0.08 });

    const split = new SplitText(".textoAnimado2", { type: "lines, words, chars", mask: "lines" });
    gsap.set(".textoAnimado2", { opacity: 1 });
    tl.from(split.chars, { y: "100%", opacity: 0, duration: 0.3, stagger: 0.03 }, "-=.5");
  });

  // ---------- 1b. Celular: frase em bloco próprio, palavras acendendo ao rolar ----------
  mm.add(CELULAR, () => {
    const split = new SplitText(".textoAnimado2", { type: "words" });
    gsap.set(".textoAnimado2", { opacity: 1 });
    gsap.fromTo(split.words, { opacity: 0.15 }, {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
      scrollTrigger: { trigger: ".textoTransicao", start: "top 75%", end: "bottom 55%", scrub: 1 },
    });
  });

  // ---------- 2. Projetos ganham cor (e crescem no computador) ----------
  gsap.utils.toArray(".projeto").forEach((projeto) => {
    gsap.to(projeto.querySelector("img"), {
      filter: "saturate(100%)",
      scrollTrigger: { trigger: projeto, start: "0% 70%", end: "50% 50%", scrub: 1 },
    });
  });

  mm.add(DESKTOP, () => {
    gsap.utils.toArray(".projeto").forEach((projeto) => {
      gsap.to(projeto, {
        width: "100%",
        borderRadius: 0,
        scrollTrigger: { trigger: projeto, end: "50% 50%", scrub: 1 },
      });
    });
  });

  // ---------- 3. Como funciona: cards empilhados (no celular vira carrossel, sem GSAP) ----------
  mm.add(DESKTOP, () => {
    const cardsProcesso = gsap.utils.toArray(".passo-card");
    gsap.set(cardsProcesso, {
      y: (i) => i * 20,
      rotation: (i) => i * 4,
      transformOrigin: "bottom center",
    });

    const tlProcesso = gsap.timeline({
      scrollTrigger: {
        trigger: ".processo",
        start: "top 5%",
        end: "+=2000",
        scrub: 1,
        pin: true,
        refreshPriority: 1,
      },
    });

    cardsProcesso.forEach((card, i) => {
      if (i === cardsProcesso.length - 1) return;
      tlProcesso.to(card, { y: -800, opacity: 0, rotation: -10, duration: 1, ease: "power2.in" }, i);
      tlProcesso.to(cardsProcesso[i + 1], { y: 0, rotation: 0, duration: 1, ease: "power2.out" }, i);
    });
  });

  // ---------- 4. Cards explodindo (só no computador; no celular são faixas rodando em CSS) ----------
  mm.add(DESKTOP, () => {
    const valores = {
      leftX: [-850, -950, -450],
      rightX: [850, 950, 450],
      leftR: [-30, -20, -35],
      rightR: [30, 20, 35],
      y: [120, -180, -420],
    };
    gsap.utils.toArray(".linha-cards").forEach((linha, i) => {
      const gatilho = () => ({ trigger: ".sessao-cards", start: "top 65%", end: "bottom top", scrub: 1 });
      gsap.to(linha.querySelector(".card-left"), { x: valores.leftX[i], y: valores.y[i], rotation: valores.leftR[i], ease: "none", scrollTrigger: gatilho() });
      gsap.to(linha.querySelector(".card-right"), { x: valores.rightX[i], y: valores.y[i], rotation: valores.rightR[i], ease: "none", scrollTrigger: gatilho() });
    });
  });

  // ---------- 5. Seta girando nos cards de suporte ----------
  gsap.to(".card3 .seta", {
    rotation: 180,
    ease: "none",
    scrollTrigger: { trigger: ".sec3", start: "top 80%", end: "bottom 20%", scrub: 1 },
  });

  // ---------- 6. Títulos surgindo do desfoque ----------
  document.querySelectorAll(".textoAnimado").forEach((texto) => {
    const split = new SplitText(texto, { type: "words, chars" });
    gsap.from(split.chars, {
      filter: "blur(20px)",
      opacity: 0,
      duration: 0.3,
      stagger: { each: 0.02, from: "random" },
      scrollTrigger: {
        trigger: texto,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  });

  // ---------- 7. Letras rolando no menu e na nav ----------
  document.querySelectorAll(".menu-nav a:not(.menu-cta), .nav-links a").forEach((link) => {
    const texto = link.textContent.trim();
    link.innerHTML = "";

    const camada1 = document.createElement("span");
    camada1.className = "layer-1";
    camada1.textContent = texto;

    const camada2 = document.createElement("span");
    camada2.className = "layer-2";
    camada2.textContent = texto;
    camada2.setAttribute("aria-hidden", "true");

    link.append(camada1, camada2);

    const s1 = new SplitText(camada1, { type: "chars" });
    const s2 = new SplitText(camada2, { type: "chars" });
    gsap.set(s2.chars, { y: "100%" });

    const tl = gsap.timeline({ paused: true })
      .to(s1.chars, { y: "-100%", duration: 0.35, stagger: 0.03, ease: "power3.inOut" }, 0)
      .to(s2.chars, { y: "0%", duration: 0.35, stagger: 0.03, ease: "power3.inOut" }, 0);

    link.addEventListener("mouseenter", () => tl.play());
    link.addEventListener("mouseleave", () => tl.reverse());
  });

  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  // Imagens que carregam depois mudam a altura da página: recalcula as posições
  let espera;
  const recalcular = () => {
    clearTimeout(espera);
    espera = setTimeout(() => ScrollTrigger.refresh(), 200);
  };
  document.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", recalcular, { once: true });
  });
}

if (animar) {
  // Espera as fontes para o SplitText quebrar as linhas no lugar certo
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(iniciarAnimacoes);
}

// ==========================================
// NAVEGAÇÃO POR ÂNCORAS
// ==========================================
document.addEventListener("click", (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const id = link.getAttribute("href");
  if (id.length < 2) { e.preventDefault(); return; }

  const alvo = document.querySelector(id);
  if (!alvo) return;

  e.preventDefault();
  fecharMenu();

  if (smoother) smoother.scrollTo(alvo, true, "top top");
  else alvo.scrollIntoView({ behavior: reduzido ? "auto" : "smooth" });
});
