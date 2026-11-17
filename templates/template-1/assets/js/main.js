/* =========================================================================
   Helena Ribas Arquitetura — animações
   GSAP 3 + ScrollTrigger + Lenis (smooth scroll)
   ========================================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const pad = (n) => String(n).padStart(2, '0');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DESKTOP = '(min-width: 861px)';

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });

  /* ---------------------------------------------------------------------
     Dados dinâmicos (ano, "Aberto agora")
     --------------------------------------------------------------------- */
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

  (function openBadge() {
    const badge = $('[data-open-badge]');
    if (!badge) return;
    let sp;
    try {
      sp = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    } catch (e) {
      sp = new Date();
    }
    const d = sp.getDay();
    const h = sp.getHours() + sp.getMinutes() / 60;
    const open = d >= 1 && d <= 5 && h >= 9 && h < 18;
    badge.classList.toggle('is-closed', !open);
    $('span', badge).textContent = open ? 'Aberto agora' : 'Fechado agora';
  })();

  /* ---------------------------------------------------------------------
     Lenis — rolagem suave sincronizada com o ScrollTrigger
     --------------------------------------------------------------------- */
  let lenis = null;
  if (!REDUCE && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const scrollToTarget = (target) => {
    if (lenis) {
      lenis.scrollTo(target, { offset: target === 0 ? 0 : -16, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    } else if (target === 0) {
      window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' });
    } else {
      target.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
    }
  };

  $$('[data-scroll]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return;
      const target = id === '#topo' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      scrollToTarget(target);
    });
  });

  /* ---------------------------------------------------------------------
     Utilitários de animação
     --------------------------------------------------------------------- */
  const countUp = (el, opts = {}) => {
    const end = parseFloat(el.dataset.count);
    if (REDUCE) { el.textContent = end; return; }
    const o = { v: 0 };
    gsap.to(o, {
      v: end,
      duration: opts.duration || 1.8,
      delay: opts.delay || 0,
      ease: 'power2.out',
      onUpdate: () => (el.textContent = Math.round(o.v)),
    });
  };

  const onEnter = (trigger, fn, start = 'top 82%') =>
    ScrollTrigger.create({ trigger, start, once: true, onEnter: fn });

  /* ---------------------------------------------------------------------
     1. HERO — intro
     --------------------------------------------------------------------- */
  function heroIntro() {
    document.body.classList.remove('is-loading');
    if (REDUCE) {
      $$('.hero__stats [data-count]').forEach((el) => countUp(el));
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.hero', { opacity: 0, scale: 0.975, duration: 1.3, ease: 'power3.out' }, 0)
      .from('[data-hero-media] img', { scale: 1.14, duration: 2.2 }, 0)
      .from('[data-hero-nav] > *', { y: -18, opacity: 0, duration: 1.1, stagger: 0.08 }, 0.25)
      .from('[data-hero-tag]', { y: 18, opacity: 0, duration: 1 }, 0.35)
      .from('.hero__title .line__in', { yPercent: 118, duration: 1.4, stagger: 0.13 }, 0.4)
      .from('[data-hero-fade]', { y: 26, opacity: 0, duration: 1.2, stagger: 0.1 }, 0.75)
      .add(() => $$('.hero__stats [data-count]').forEach((el, i) => countUp(el, { delay: i * 0.12, duration: 2 })), 0.95)
      .from('.float-badge', { y: 26, scale: 0.88, opacity: 0, duration: 1.2, stagger: 0.22, ease: 'back.out(1.7)' }, 1.15);

    // flutuação contínua dos selos
    $$('[data-float]').forEach((el, i) => {
      gsap.to(el, { yPercent: i ? 14 : -14, duration: 2.8 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });

    // parallax ao rolar
    const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('[data-hero-media] img', { yPercent: 9, ease: 'none', scrollTrigger: st });
    gsap.to('.hero__content', { y: () => -6 * remPx(), opacity: 0.25, ease: 'none', scrollTrigger: { ...st, invalidateOnRefresh: true } });
  }

  /* ---------------------------------------------------------------------
     2. Reveals genéricos (títulos em máscara + fade-up)
     --------------------------------------------------------------------- */
  function reveals() {
    if (REDUCE) return;

    $$('[data-lines]').forEach((h) => {
      const lines = $$('.line__in', h);
      gsap.set(lines, { yPercent: 118 });
      onEnter(h, () => gsap.to(lines, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.11 }), 'top 86%');
    });

    const items = $$('[data-reveal]');
    gsap.set(items, { y: 34, opacity: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 1.15, ease: 'expo.out', stagger: 0.09, overwrite: true }),
    });
  }

  /* ---------------------------------------------------------------------
     3. CASOS — leque de cards 3D
     --------------------------------------------------------------------- */
  function fanCarousel() {
    const fan = $('[data-fan]');
    if (!fan) return;
    const cards = $$('[data-fan-card]', fan);
    const n = cards.length;
    const counter = $('[data-fan-current]');
    const state = { active: 0, spread: REDUCE ? 1 : 0.1 };
    const parts = cards.map((c) => ({
      label: $('.fan-card__label', c),
      go: $('.fan-card__go', c),
      haze: $('.fan-card__haze', c),
    }));

    const offset = (i, a) => {
      let d = (((i - a) % n) + n) % n;
      if (d > n / 2) d -= n;
      return d;
    };

    function render() {
      const w = cards[0].offsetWidth;
      const s = state.spread;
      cards.forEach((card, i) => {
        const d = offset(i, state.active);
        const ad = Math.abs(d);
        const x = d * w * 0.9 * s;
        const y = Math.pow(ad, 1.55) * w * 0.07 * s + (1 - s) * w * 0.32 + (1 - s) * ad * w * 0.02;
        const rot = d * 8.8 * s + d * 3 * (1 - s);
        const scale = 1 - Math.min(ad, 2.5) * 0.035 - (1 - s) * ad * 0.03;
        const alpha = ad > 2 ? clamp(1 - (ad - 2) * 2, 0, 1) : 1;
        gsap.set(card, {
          x, y,
          rotation: rot,
          rotationY: -d * 7 * s,
          scale,
          opacity: alpha,
          zIndex: 100 - Math.round(ad * 10),
          transformOrigin: '50% 110%',
        });
        const labelA = clamp(1.6 - ad, 0, 1);
        gsap.set([parts[i].label, parts[i].go], { opacity: labelA });
        gsap.set(parts[i].haze, { opacity: clamp((ad - 0.8) * 0.55, 0, 0.6) });
      });
      const idx = ((Math.round(state.active) % n) + n) % n;
      if (counter) counter.textContent = pad(idx + 1);
    }

    function goTo(target) {
      gsap.to(state, {
        active: target,
        duration: REDUCE ? 0 : 1,
        ease: 'power3.inOut',
        overwrite: true,
        onUpdate: render,
      });
    }
    const step = (dir) => goTo(Math.round(state.active) + dir);

    $('[data-fan-prev]').addEventListener('click', () => step(-1));
    $('[data-fan-next]').addEventListener('click', () => step(1));
    let swiped = false;
    cards.forEach((card, i) => {
      card.addEventListener('click', (e) => {
        if (swiped) { e.preventDefault(); return; }
        const d = offset(i, Math.round(state.active));
        if (d === 0) return; // card central: deixa o link funcionar
        e.preventDefault();
        goTo(Math.round(state.active) + d);
      });
    });

    // swipe / arraste
    let sx = null;
    fan.addEventListener('pointerdown', (e) => (sx = e.clientX));
    window.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 40) {
        swiped = true;
        setTimeout(() => (swiped = false), 60);
        step(dx < 0 ? 1 : -1);
      }
    });

    render();
    window.addEventListener('resize', render);

    if (!REDUCE) {
      // os cards "abrem" em leque conforme a seção entra na tela
      gsap.to(state, {
        spread: 1,
        ease: 'power2.out',
        onUpdate: render,
        scrollTrigger: { trigger: fan, start: 'top 92%', end: 'top 38%', scrub: 1 },
      });
      gsap.from(fan, { y: () => 8 * remPx(), ease: 'none', scrollTrigger: { trigger: fan, start: 'top bottom', end: 'top 40%', scrub: 1, invalidateOnRefresh: true } });
    }
  }

  /* ---------------------------------------------------------------------
     4. SERVIÇOS — a seção é um quarto: a luminária desce, acende e a luz
        passa de card em card (seção fixada)
     --------------------------------------------------------------------- */
  function servicesScene() {
    const sec = $('[data-services]');
    if (!sec) return;
    const roomBox = $('[data-room-box]');
    const lamp = $('[data-lamp]');
    const lampOn = $$('.lamp-on', lamp); // cone de luz + cúpula acesa
    const warm = $('[data-warm]');
    const dim = $('[data-dim]');
    const flash = $('[data-flash]');
    const props = $$('[data-prop]', roomBox);
    const techs = $$('[data-tech]');
    const leftCards = techs.filter((t) => t.dataset.wall === 'left');
    const rightCards = techs.filter((t) => t.dataset.wall === 'right');
    // ordem da luz: Projeto completo → Projeto 3D → Marcenaria → Obra (índices no HTML)
    const order = [1, 0, 2, 3];
    const ALL = 4;

    let current = null;
    // sobe a luminária até a cúpula ficar toda acima do topo da seção
    const lampLift = () => -(parseFloat(getComputedStyle(lamp).top) + lamp.getBoundingClientRect().height * 0.5 + 2 * remPx());
    let desktop3d = false; // cards em 3D só no desktop
    // k = -1: nenhum card; 0..3: um card em destaque; ALL: todos ativos
    function setActive(k) {
      if (k === current) return;
      current = k;
      techs.forEach((t, i) => {
        const focus = i === k;
        t.classList.toggle('is-active', k === ALL || focus);
        t.classList.toggle('is-focus', focus);
        if (!desktop3d) return;
        const dir = t.dataset.wall === 'left' ? 1 : -1; // esquerda vai para a direita e vice-versa
        if (focus) {
          // sai da parede: cresce, anda um pouco para o centro e ganha profundidade (z)
          gsap.to(t, {
            x: () => dir * 7 * remPx(), z: 160, rotationY: -5 * dir, rotationX: 3, scale: 1.08,
            duration: 1.1, ease: 'power3.out', overwrite: 'auto',
          });
        } else {
          // volta para a parede
          gsap.to(t, { x: 0, z: 0, rotationY: 14 * dir, rotationX: 0, scale: 1, duration: 0.9, ease: 'power3.inOut', overwrite: 'auto' });
        }
      });
    }

    const mm = gsap.matchMedia();

    mm.add(DESKTOP, () => {
      // cards "presos" nas paredes laterais
      gsap.set(leftCards, { rotationY: 14, transformPerspective: 1600, transformOrigin: '0% 50%' });
      gsap.set(rightCards, { rotationY: -14, transformPerspective: 1600, transformOrigin: '100% 50%' });
      desktop3d = true;
      const cleanup = () => {
        desktop3d = false;
        gsap.killTweensOf(techs);
        gsap.set(techs, { clearProps: 'transform' });
        techs.forEach((t) => t.classList.remove('is-focus'));
        techs.forEach((t) => t.classList.remove('is-active'));
        current = null;
      };
      if (REDUCE) {
        gsap.set([...lampOn, warm], { opacity: 1 });
        gsap.set(dim, { opacity: 0 });
        setActive(ALL);
        return cleanup;
      }
      setActive(-1);

      // entrada (antes de fixar): móveis e cards aparecem
      const enter = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top 10%', scrub: 1 } });
      enter.from(props, { y: () => 4 * remPx(), opacity: 0, stagger: 0.06, ease: 'power2.out' }, 0)
        .from(techs, { opacity: 0, y: () => 3 * remPx(), stagger: 0.08, ease: 'power2.out' }, 0.2);

      // cena fixada: luminária desce do teto e acende; depois a luz passa pelos cards
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sec,
          start: 'top top',
          end: '+=220%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate() {
          const p = this.progress();
          setActive(p < 0.4 ? -1 : p < 0.52 ? order[0] : p < 0.64 ? order[1] : p < 0.76 ? order[2] : p < 0.88 ? order[3] : ALL);
        },
      });
      tl.fromTo(lamp, { y: lampLift, rotation: -8 }, { y: 0, rotation: 0, duration: 4, ease: 'power2.inOut' }, 0)
        .to(lamp, { rotation: 2, duration: 0.7, ease: 'sine.inOut' }, 4) // balança um pouco ao parar
        .to(lamp, { rotation: 0, duration: 0.9, ease: 'sine.inOut' }, 4.7)
        .to(lampOn, { opacity: 1, duration: 0.8 }, 3.6)
        .fromTo(flash, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.3, duration: 0.6, ease: 'power2.out' }, 3.7)
        .to(flash, { opacity: 0.6, scale: 1.1, duration: 1 }, 4.3)
        .to(warm, { opacity: 1, duration: 1.2 }, 3.7)
        .to(dim, { opacity: 0, duration: 1.2 }, 3.7)
        .fromTo(lamp, { filter: 'drop-shadow(0rem 2rem 2.4rem rgba(120,82,50,0.3))' }, { filter: 'drop-shadow(0rem 0rem 4.4rem rgba(255,206,130,0.85))', duration: 1 }, 3.8)
        .to({}, { duration: 6 }); // segura a cena enquanto a luz passa pelos cards

      return cleanup;
    });

    mm.add('(max-width: 860px)', () => {
      techs.forEach((t) => t.classList.add('is-active'));
      const cleanup = () => techs.forEach((t) => t.classList.remove('is-active'));
      if (REDUCE) {
        gsap.set([...lampOn, warm], { opacity: 1 });
        gsap.set(dim, { opacity: 0 });
        return cleanup;
      }
      const tl = gsap.timeline({ scrollTrigger: { trigger: roomBox, start: 'top 80%', end: 'center 45%', scrub: 1, invalidateOnRefresh: true } });
      tl.fromTo(lamp, { y: lampLift, rotation: -8 }, { y: 0, rotation: 0, ease: 'power2.inOut', duration: 1 })
        .to(lampOn, { opacity: 1, duration: 0.3 }, 0.8)
        .to(warm, { opacity: 1, duration: 0.35 }, 0.82)
        .to(dim, { opacity: 0, duration: 0.35 }, 0.82)
        .fromTo(flash, { opacity: 0 }, { opacity: 0.7, duration: 0.3 }, 0.85);
      return cleanup;
    });
  }

  /* ---------------------------------------------------------------------
     5. PROJETO COMPLETO — visual, KPIs, slider de indicações, texto gigante
     --------------------------------------------------------------------- */
  function completeProject() {
    const visual = $('[data-complete-visual]');
    if (visual && !REDUCE) {
      gsap.from($('img', visual), {
        y: () => 7 * remPx(), scale: 0.9, opacity: 0, ease: 'power2.out',
        scrollTrigger: { trigger: visual, start: 'top 92%', end: 'top 40%', scrub: 1, invalidateOnRefresh: true },
      });
      gsap.fromTo($('.complete__glow', visual), { opacity: 0.55 }, { opacity: 1, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }

    const kpis = $$('[data-kpi]');
    if (kpis.length) {
      onEnter(kpis[0], () => {
        kpis.forEach((k, i) => {
          countUp($('[data-count]', k), { duration: 1.4, delay: i * 0.15 });
          if (!REDUCE) gsap.fromTo($('.kpi__bar', k), { '--p': 0 }, { '--p': 1, duration: 1.6, delay: 0.2 + i * 0.15, ease: 'expo.out' });
          else $('.kpi__bar', k).style.setProperty('--p', 1);
        });
      });
    }

    indications();

    $$('[data-giant]').forEach((el) => {
      if (REDUCE) return;
      gsap.fromTo(el, { yPercent: 45, opacity: 0.4 }, {
        yPercent: 0, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom bottom', scrub: 1 },
      });
    });
  }

  function indications() {
    const vp = $('[data-ind-viewport]');
    const track = $('[data-ind-track]');
    if (!vp || !track) return;
    const cards = $$('[data-ind-card]', track);
    const prev = $('[data-ind-prev]');
    const next = $('[data-ind-next]');
    const bars = $$('[data-ind-bars] i');
    const range = $('[data-ind-range]');
    const n = cards.length;
    let index = 0;
    let x = 0;

    const metrics = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      const stepW = cards[0].offsetWidth + gap;
      const container = $('.complete .container');
      const contW = container ? container.offsetWidth : vp.clientWidth;
      const maxShift = Math.max(0, track.scrollWidth - contW);
      const visible = clamp(Math.ceil(contW / stepW), 1, n);
      const maxIndex = maxShift > 0 ? Math.max(1, n - visible) : 0;
      return { stepW, maxShift, visible, maxIndex };
    };

    const shiftFor = (i, m) => (i >= m.maxIndex ? m.maxShift : Math.min(i * m.stepW, m.maxShift));

    function update(animate = true) {
      const m = metrics();
      index = clamp(index, 0, m.maxIndex);
      x = -shiftFor(index, m);
      gsap.to(track, { x, duration: animate && !REDUCE ? 1 : 0, ease: 'expo.out', overwrite: true });
      prev.disabled = index === 0;
      next.disabled = index >= m.maxIndex;
      const first = index === m.maxIndex && m.maxIndex > 0 ? n - m.visible : index;
      bars.forEach((b, i) => b.classList.toggle('is-on', i >= first && i < first + m.visible));
      range.textContent = `${pad(first + 1)}-${pad(Math.min(first + m.visible, n))} / ${pad(n)}`;
    }

    prev.addEventListener('click', () => { index -= 1; update(); });
    next.addEventListener('click', () => { index += 1; update(); });

    // arrastar
    let startX = 0, baseX = 0, dragging = false, moved = 0;
    vp.addEventListener('pointerdown', (e) => {
      dragging = true; moved = 0; startX = e.clientX; baseX = x;
      gsap.killTweensOf(track);
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const m = metrics();
      moved = e.clientX - startX;
      let nx = baseX + moved;
      if (nx > 0) nx *= 0.35;
      if (nx < -m.maxShift) nx = -m.maxShift + (nx + m.maxShift) * 0.35;
      gsap.set(track, { x: nx });
    });
    window.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(moved) > 50) index += moved < 0 ? 1 : -1;
      update();
    });
    window.addEventListener('resize', () => update(false));
    update(false);

    // linhas dos números dos cards
    const lines = cards.map((c) => $('.ind-card__num i', c));
    if (REDUCE) { lines.forEach((l) => l.style.setProperty('--p', 0.6)); return; }
    gsap.set(cards, { y: () => 4 * remPx(), opacity: 0 });
    onEnter(vp, () => {
      gsap.to(cards, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: 'expo.out' });
      gsap.fromTo(lines, { '--p': 0 }, { '--p': 0.65, duration: 1.6, stagger: 0.1, delay: 0.3, ease: 'expo.out' });
    }, 'top 92%');
  }

  /* ---------------------------------------------------------------------
     6. COMO FUNCIONA — imagem fixa + etapas
     --------------------------------------------------------------------- */
  function processSteps() {
    const grid = $('[data-process]');
    if (!grid) return;
    const steps = $$('[data-step]', grid);
    const imgs = $$('[data-step-img]', grid);
    const num = $('[data-step-num]', grid);
    const name = $('[data-step-name]', grid);
    const dashes = $$('[data-step-dashes] i', grid);
    const fill = $('[data-rail-fill]', grid);
    const dot = $('[data-rail-dot]', grid);
    let current = -1;

    const dotY = (i) => {
      const n = $('.step__num', steps[i]);
      return n.offsetTop + n.offsetHeight / 2;
    };

    function setStep(i, instant = false) {
      if (i === current) return;
      const prev = current;
      current = i;
      const dur = instant || REDUCE ? 0 : 1;
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      imgs.forEach((img, k) => {
        if (k === 0) return;
        const show = k <= i;
        gsap.to(img, { clipPath: show ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)', duration: dur * 1.15, ease: 'expo.inOut', overwrite: 'auto' });
      });
      if (!instant && !REDUCE && i > prev && i > 0) {
        gsap.fromTo(imgs[i], { scale: 1.18 }, { scale: 1, duration: 1.6, ease: 'expo.out' });
      }
      num.textContent = pad(i + 1);
      name.textContent = steps[i].dataset.name;
      if (!instant && !REDUCE) gsap.fromTo([num, name], { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'expo.out' });
      dashes.forEach((d, k) => d.classList.toggle('is-on', k === i));
      gsap.to(dot, { y: dotY(i), duration: dur * 0.9, ease: 'expo.out' });
    }

    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      current = -1;
      setStep(0, true);
      steps.forEach((s, i) => {
        ScrollTrigger.create({
          trigger: s,
          start: 'top 58%',
          end: 'bottom 58%',
          onToggle: (self) => self.isActive && setStep(i),
        });
      });
      ScrollTrigger.addEventListener('refresh', () => gsap.set(dot, { y: dotY(Math.max(current, 0)) }));
      if (!REDUCE) {
        gsap.fromTo(fill, { scaleY: 0 }, {
          scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: '.process__steps', start: 'top 58%', end: 'bottom 70%', scrub: true },
        });
        gsap.fromTo('.process__frame', { clipPath: 'inset(12% 10% 12% 10% round 2.4rem)', scale: 0.96 }, {
          clipPath: 'inset(0% 0% 0% 0% round 2.4rem)', scale: 1, ease: 'power2.out',
          scrollTrigger: { trigger: grid, start: 'top 92%', end: 'top 35%', scrub: 1 },
        });
      } else {
        gsap.set(fill, { scaleY: 1 });
      }
    });

    mm.add('(max-width: 860px)', () => {
      steps.forEach((s) => s.classList.add('is-active'));
      if (REDUCE) return;
      steps.forEach((s) => {
        gsap.from(s.children, { y: 30, opacity: 0, duration: 1, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 85%', once: true } });
      });
    });
  }

  /* ---------------------------------------------------------------------
     7. SOBRE
     --------------------------------------------------------------------- */
  function about() {
    const media = $('[data-about-media]');
    if (!media) return;
    const imgWrap = $('.about__img', media);
    const img = $('img', media);

    if (!REDUCE) {
      gsap.fromTo(imgWrap, { clipPath: 'inset(0% 0% 100% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut',
        scrollTrigger: { trigger: media, start: 'top 82%', once: true },
      });
      gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: media, start: 'top 82%', once: true } });
      gsap.fromTo(img, { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from('[data-cred]', { y: 30, scale: 0.85, opacity: 0, duration: 1.1, ease: 'back.out(1.7)', delay: 0.8, scrollTrigger: { trigger: media, start: 'top 82%', once: true } });

      const lis = $$('[data-formation] li');
      gsap.set(lis, { x: -16, opacity: 0 });
      onEnter('[data-formation]', () => {
        gsap.to(lis, { x: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'expo.out' });
      }, 'top 88%');
    }

    onEnter('.about__stats', () => $$('.about__stats [data-count]').forEach((el, i) => countUp(el, { delay: 0.2 + i * 0.12 })), 'top 90%');
  }

  /* ---------------------------------------------------------------------
     8. FAQ — acordeão
     --------------------------------------------------------------------- */
  function accordion() {
    const items = $$('[data-acc]');
    let refreshTimer = null;
    const refreshLater = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 750);
    };

    const open = (item) => {
      const body = $('.acc__body', item);
      item.classList.add('is-open');
      $('.acc__head', item).setAttribute('aria-expanded', 'true');
      gsap.fromTo(body, { height: body.offsetHeight }, { height: 'auto', duration: REDUCE ? 0 : 0.75, ease: 'expo.out', overwrite: true });
      if (!REDUCE) gsap.fromTo($('p', body), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.08, ease: 'expo.out' });
    };
    const close = (item) => {
      const body = $('.acc__body', item);
      item.classList.remove('is-open');
      $('.acc__head', item).setAttribute('aria-expanded', 'false');
      gsap.fromTo(body, { height: body.offsetHeight }, { height: 0, duration: REDUCE ? 0 : 0.6, ease: 'expo.out', overwrite: true });
    };

    items.forEach((item) => {
      $('.acc__head', item).addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        items.forEach((o) => o !== item && o.classList.contains('is-open') && close(o));
        isOpen ? close(item) : open(item);
        refreshLater();
      });
    });

    if (!REDUCE) {
      gsap.set(items, { y: 24, opacity: 0 });
      onEnter('[data-accordion]', () => gsap.to(items, { y: 0, opacity: 1, duration: 1, stagger: 0.07, ease: 'expo.out' }), 'top 85%');
    }
  }

  /* ---------------------------------------------------------------------
     9. CONTATO
     --------------------------------------------------------------------- */
  function contact() {
    const sec = $('[data-contact]');
    if (!sec || REDUCE) return;
    gsap.from(sec, {
      scale: 0.95, transformOrigin: '50% 0%', ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 35%', scrub: 1 },
    });
    const media = $('[data-contact-media]');
    gsap.fromTo(media, { clipPath: 'inset(0% 100% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut',
      scrollTrigger: { trigger: media, start: 'top 85%', once: true },
    });
    gsap.fromTo($('img', media), { scale: 1.25 }, { scale: 1, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: media, start: 'top 85%', once: true } });
    const infos = $$('[data-info]');
    gsap.set(infos, { x: () => 5 * remPx(), opacity: 0 });
    onEnter(media, () => gsap.to(infos, { x: 0, opacity: 1, duration: 1.2, stagger: 0.12, delay: 0.3, ease: 'expo.out' }), 'top 85%');
    gsap.from('.footer > *', { y: 24, opacity: 0, duration: 1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 95%', once: true } });
  }

  /* ---------------------------------------------------------------------
     10. Header flutuante + barra de CTA
     --------------------------------------------------------------------- */
  function chrome() {
    const pill = $('[data-nav-pill]');
    const bar = $('[data-cta-bar]');
    const hero = $('[data-hero]');
    let pillOn = false;
    let barOn = false;

    gsap.set(pill, { y: 0, yPercent: -160 });
    gsap.set(bar, { y: 0, yPercent: 160 });

    const showPill = (v) => {
      if (v === pillOn) return;
      pillOn = v;
      gsap.to(pill, { yPercent: v ? 0 : -160, duration: v ? 0.9 : 0.6, ease: v ? 'expo.out' : 'power3.in', overwrite: true });
    };
    const showBar = (v) => {
      if (v === barOn) return;
      barOn = v;
      gsap.to(bar, { yPercent: v ? 0 : 160, duration: v ? 1 : 0.6, ease: v ? 'expo.out' : 'power3.in', overwrite: true });
    };

    // header aparece ao rolar para cima (depois do hero)
    ScrollTrigger.create({
      start: () => hero.offsetHeight * 0.75,
      end: 'max',
      onUpdate: (self) => showPill(self.direction === -1),
      onLeaveBack: () => showPill(false),
    });

    // barra de CTA: entre o fim do hero e o contato
    ScrollTrigger.create({
      trigger: hero,
      start: 'bottom 65%',
      endTrigger: '#contato',
      end: 'top 80%',
      onToggle: (self) => showBar(self.isActive),
    });
  }

  /* ---------------------------------------------------------------------
     Inicialização
     --------------------------------------------------------------------- */
  function init() {
    heroIntro();
    reveals();
    fanCarousel();
    servicesScene();
    completeProject();
    processSteps();
    about();
    accordion();
    contact();
    chrome();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
