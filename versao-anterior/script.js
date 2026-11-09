window.addEventListener("load", () => {
  // Carregamento dinâmico de vídeos em background
  const video = document.createElement("video");
  const midiaBackground = document.querySelector(".hero .imgBackground");

  const menuBtn = document.querySelector('.menu-btn');
  const popup = document.querySelector('.menu-popup');

  menuBtn.addEventListener('click', () => {
    // Alterna a classe 'ativo' no botão (faz o X)
    menuBtn.classList.toggle('ativo');

    // Alterna a classe 'ativo' no popup (mostra/esconde o menu)
    popup.classList.toggle('ativo');
  });

  // Animação GSAP Hover nos Links do Menu
  const menuLinks = document.querySelectorAll('.menu-nav a:not(.botao-menu-mobile)');

  menuLinks.forEach((link) => {
    const text = link.textContent;
    link.innerHTML = '';

    // Criar as duas camadas
    const layer1 = document.createElement('div');
    layer1.classList.add('layer-1');
    layer1.textContent = text;

    const layer2 = document.createElement('div');
    layer2.classList.add('layer-2');
    layer2.textContent = text;

    link.appendChild(layer1);
    link.appendChild(layer2);

    // Usar SplitText para separar os caracteres
    const split1 = new SplitText(layer1, { type: 'chars' });
    const split2 = new SplitText(layer2, { type: 'chars' });

    // Estado inicial da camada 2 (começa embaixo)
    gsap.set(split2.chars, { y: '100%' });

    // Timeline de animação
    const tl = gsap.timeline({ paused: true });

    tl.to(split1.chars, {
      y: '-100%',
      duration: 0.35,
      stagger: 0.03,
      ease: 'power3.inOut'
    }, 0);

    tl.to(split2.chars, {
      y: '0%',
      duration: 0.35,
      stagger: 0.03,
      ease: 'power3.inOut'
    }, 0);

    link.addEventListener('mouseenter', () => tl.play());
    link.addEventListener('mouseleave', () => tl.reverse());
  });


  if (midiaBackground) {
    video.src = "./assets/img/video-hero.mp4";
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.style.opacity = 0;

    video.addEventListener("canplaythrough", () => {
      video.style.opacity = 1;
    });
    midiaBackground.appendChild(video);
  }

  const midiaBackgroundFooter = document.querySelector("footer .imgBackground");
  if (midiaBackgroundFooter) {
    const videoFooter = document.createElement("video");
    videoFooter.src = "./assets/img/video-footer.mp4";
    videoFooter.autoplay = true;
    videoFooter.muted = true;
    videoFooter.playsInline = true;
    videoFooter.loop = true;
    videoFooter.style.opacity = 0;

    videoFooter.addEventListener("canplaythrough", () => {
      videoFooter.style.opacity = 1;
    });
    midiaBackgroundFooter.appendChild(videoFooter);
  }

  // Atualizar posições do ScrollTrigger após carregamento de todas as mídias
  ScrollTrigger.refresh();
});

// Registrar os Plugins GSAP
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

const smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 1.5,
  effects: true,
});

// ==========================================
// RESPONSIVIDADE COM GSAP MATCHMEDIA
// ==========================================
const mm = gsap.matchMedia();

// DESKTOP (Largura > 768px)
mm.add("(min-width: 769px)", () => {
  // Timeline Hero + Transição
  const tlTransitionHero = gsap.timeline({
    scrollTrigger: {
      trigger: "main",
      scrub: 1,
      pin: true,
      start: "100% 100%",
      end: "+=2000",
      refreshPriority: 1,
    },
  });

  tlTransitionHero.from(".transition div", {
    height: "0%",
    duration: 1,
    stagger: 0.08,
  });

  const split2 = new SplitText(".textoAnimado2", {
    types: "lines, words, chars",
    mask: "lines",
  });

  tlTransitionHero.from(
    split2.chars,
    {
      y: "100%",
      opacity: 0,
      duration: 0.3,
      stagger: 0.03,
    },
    "-=.5",
  );

  // Sessão 2: Cards Explodindo (Valores Desktop Originais)
  const leftXValues = [-850, -950, -450];
  const rightXValues = [850, 950, 450];
  const leftRotationValues = [-30, -20, -35];
  const rightRotationValues = [30, 20, 35];
  const yValues = [120, -180, -420];

  gsap.utils.toArray(".linha-cards").forEach((row, index) => {
    const cardLeft = row.querySelector(".card-left");
    const cardRight = row.querySelector(".card-right");

    if (cardLeft) {
      gsap.fromTo(
        cardLeft,
        { x: 0, y: 0, rotation: 0 },
        {
          scrollTrigger: {
            trigger: ".sessao-cards",
            start: "top 65%",
            end: "bottom top",
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress;
              gsap.set(cardLeft, {
                x: progress * leftXValues[index],
                y: progress * yValues[index],
                rotation: progress * leftRotationValues[index],
              });
            },
          },
        },
      );
    }

    if (cardRight) {
      gsap.fromTo(
        cardRight,
        { x: 0, y: 0, rotation: 0 },
        {
          scrollTrigger: {
            trigger: ".sessao-cards",
            start: "top 65%",
            end: "bottom top",
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress;
              gsap.set(cardRight, {
                x: progress * rightXValues[index],
                y: progress * yValues[index],
                rotation: progress * rightRotationValues[index],
              });
            },
          },
        },
      );
    }
  });
});

// MOBILE E TABLET (Largura <= 768px)
mm.add("(max-width: 768px)", () => {
  // Timeline Hero + Transição adaptada para touch scroll
  const tlTransitionHero = gsap.timeline({
    scrollTrigger: {
      trigger: "main",
      scrub: 1,
      pin: true,
      start: "100% 100%",
      end: "+=1200",
      refreshPriority: 1,
    },
  });

  tlTransitionHero.from(".transition div", {
    height: "0%",
    duration: 1,
    stagger: 0.06,
  });

  const split2 = new SplitText(".textoAnimado2", {
    types: "lines, words, chars",
    mask: "lines",
  });

  tlTransitionHero.from(
    split2.chars,
    {
      y: "100%",
      opacity: 0,
      duration: 0.3,
      stagger: 0.02,
    },
    "-=.5",
  );

  // Sessão 2: Cards Explodindo (Valores Mobile Proporcionais e Fluidos)
  const leftXValues = [-260, -290, -180];
  const rightXValues = [260, 290, 180];
  const leftRotationValues = [-25, -20, -30];
  const rightRotationValues = [25, 20, 30];
  const yValues = [140, -100, -250];

  gsap.utils.toArray(".linha-cards").forEach((row, index) => {
    const cardLeft = row.querySelector(".card-left");
    const cardRight = row.querySelector(".card-right");

    if (cardLeft) {
      gsap.fromTo(
        cardLeft,
        { x: 0, y: 0, rotation: 0 },
        {
          scrollTrigger: {
            trigger: ".sessao-cards",
            start: "top 70%",
            end: "bottom top",
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress;
              gsap.set(cardLeft, {
                x: progress * leftXValues[index],
                y: progress * yValues[index],
                rotation: progress * leftRotationValues[index],
              });
            },
          },
        },
      );
    }

    if (cardRight) {
      gsap.fromTo(
        cardRight,
        { x: 0, y: 0, rotation: 0 },
        {
          scrollTrigger: {
            trigger: ".sessao-cards",
            start: "top 70%",
            end: "bottom top",
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress;
              gsap.set(cardRight, {
                x: progress * rightXValues[index],
                y: progress * yValues[index],
                rotation: progress * rightRotationValues[index],
              });
            },
          },
        },
      );
    }
  });
});

// ==========================================
// TÍTULOS ANIMADOS (EFEITO BLUR)
// ==========================================
const textos = document.querySelectorAll(".textoAnimado");
textos.forEach((texto) => {
  const split = new SplitText(texto, { types: "lines, words, chars" });

  gsap.from(split.chars, {
    filter: "blur(20px)",
    opacity: 0,
    duration: 0.3,
    stagger: {
      each: 0.02,
      from: "random",
    },
    scrollTrigger: {
      trigger: texto,
      start: "top 85%",
      toggleActions: "play none none reverse",
    },
  });
});

// ==========================================
// ANIMAÇÃO DOS PROJETOS RECENTES
// ==========================================
const projetos = document.querySelectorAll(".projeto");
projetos.forEach((projeto) => {
  const imgProjeto = projeto.querySelector("img");

  if (projeto) {
    gsap.to(projeto, {
      width: "100%",
      borderRadius: 0,
      scrollTrigger: {
        trigger: projeto,
        end: "50% 50%",
        scrub: 1,
      },
    });
  }

  if (imgProjeto) {
    gsap.to(imgProjeto, {
      filter: "saturate(100%)",
      scrollTrigger: {
        trigger: projeto,
        start: "0% 70%",
        end: "50% 50%",
        scrub: 1,
      },
    });
  }
});

// ==========================================
// ANIMAÇÃO EM LOOP DOS ÍCONES DE TECNOLOGIA
// ==========================================
const cardsTecnologia = document.querySelectorAll(".cardicone3");

if (cardsTecnologia.length > 0) {
  const estados = [
    [4, 8, 9],
    [1, 5, 9],
    [2, 6, 10],
    [5, 6, 7],
  ];

  let estadoAtual = 0;

  function atualizarCards() {
    // Remove todos
    cardsTecnologia.forEach((card) => card.classList.remove("ativo"));

    // Ativa apenas os da rodada atual
    estados[estadoAtual].forEach((index) => {
      if (cardsTecnologia[index]) {
        cardsTecnologia[index].classList.add("ativo");
      }
    });

    // Próxima rodada
    estadoAtual = (estadoAtual + 1) % estados.length;
  }

  // Primeira execução e inicialização única de loop
  atualizarCards();
  setInterval(atualizarCards, 2000);
}

// ==========================================
// ÍCONES COM GSAP NA SEÇÃO 3
// ==========================================
const iconesSec3 = document.querySelectorAll(".card3 .icone img");

iconesSec3.forEach((icone) => {
  gsap.to(icone, {
    rotation: 180,
    ease: "none",
    scrollTrigger: {
      trigger: ".sec3",
      start: "top 80%",
      end: "bottom 20%",
      scrub: 1,
    },
  });




});

// ==========================================
// ANIMAÇÃO STACKED CARDS (COMO FUNCIONA)
// ==========================================
const cardsProcesso = gsap.utils.toArray('.passo-card');

// Posiciona todos no mesmo lugar (0%), mas os de trás ficam levemente deslocados e rotacionados (leque)
gsap.set(cardsProcesso, {
  y: (i) => i * 20, // Deslocamento Y para mostrar a pontinha do de baixo
  rotation: (i) => i * 4, // Efeito de leque
  transformOrigin: "bottom center"
});

const tlProcesso = gsap.timeline({
  scrollTrigger: {
    trigger: ".processo",
    start: "top 5%",
    end: "+=2000", // Distância longa de scroll
    scrub: 1,
    pin: true,
    refreshPriority: 1,
  }
});

// Anima a saída de cada card revelando o próximo
cardsProcesso.forEach((card, i) => {
  if (i < cardsProcesso.length - 1) {
    // Card atual (do topo) desliza para cima e some
    tlProcesso.to(card, {
      y: -800,
      opacity: 0,
      rotation: -10,
      duration: 1,
      ease: "power2.in"
    }, i);

    // O próximo card (que estava rotacionado por baixo) endireita e vai para y=0
    const nextCard = cardsProcesso[i + 1];
    tlProcesso.to(nextCard, {
      rotation: 0,
      y: 0,
      duration: 1,
      ease: "power2.out"
    }, i);
  }
});

// ==========================================
// FAQ ACORDEÃO VERTICAL (PILL)
// ==========================================
const faqRows = document.querySelectorAll('.faq-row');

faqRows.forEach(row => {
  row.addEventListener('click', () => {
    // Se clicar no mesmo que já está aberto, ele fecha (toggle)
    if (row.classList.contains('ativo')) {
      row.classList.remove('ativo');
      return;
    }

    // Remove a classe ativo de todos os itens (para fechar os outros)
    faqRows.forEach(r => r.classList.remove('ativo'));

    // Adiciona a classe ativo apenas no clicado
    row.classList.add('ativo');
  });
});
// ==========================================
// MARQUEE DO E-MAIL (FOOTER)
// ==========================================
const EMAIL_CONTATO = "contato@stutz.com.br";
const marquee = document.getElementById("marquee");
if (marquee) {
  const estrela = '<svg class="footer-star" viewBox="0 0 24 24"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" /></svg>';
  marquee.innerHTML = Array(8).fill(`<span>${EMAIL_CONTATO}</span>${estrela}`).join("");
}

// ==========================================
// NAVEGAÇÃO POR ÂNCORAS (COM SCROLLSMOOTHER)
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    if (id.length < 2) { e.preventDefault(); return; }
    const alvo = document.querySelector(id);
    if (!alvo) return;
    e.preventDefault();

    const btn = document.querySelector(".menu-btn");
    const pop = document.querySelector(".menu-popup");
    if (pop && pop.classList.contains("ativo")) {
      btn.classList.remove("ativo");
      pop.classList.remove("ativo");
    }
    smoother.scrollTo(alvo, true, "top top");
  });
});
