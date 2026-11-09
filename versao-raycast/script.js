// Menu do celular
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav-toggle');

toggle.addEventListener('click', () => {
  const aberto = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', aberto);
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

// Revelar elementos ao rolar
const revelar = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revelar.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 60}ms`;
    io.observe(el);
  });
} else {
  revelar.forEach((el) => el.classList.add('in'));
}

// Command bar: percorre os itens e "digita" a busca
const itens = document.querySelectorAll('#cmd-list li');
const typed = document.getElementById('typed');
const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let atual = 0;

function digitar(texto) {
  if (reduzido) { typed.textContent = texto; return; }
  let i = 0;
  typed.textContent = '';
  const t = setInterval(() => {
    typed.textContent = texto.slice(0, ++i);
    if (i >= texto.length) clearInterval(t);
  }, 28);
}

function ativar(i) {
  itens.forEach((li) => li.classList.remove('is-active'));
  itens[i].classList.add('is-active');
  digitar(itens[i].querySelector('.label').textContent);
}

itens.forEach((li, i) => {
  li.addEventListener('mouseenter', () => { atual = i; ativar(i); });
});

if (!reduzido) {
  setInterval(() => {
    atual = (atual + 1) % itens.length;
    ativar(atual);
  }, 3200);
}

// Faixa de canais: duplica para rolagem contínua
const marquee = document.getElementById('marquee');
if (marquee) marquee.innerHTML += marquee.innerHTML;

// FAQ: mantém só um aberto
const faqs = document.querySelectorAll('.faq-item');
faqs.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open) faqs.forEach((o) => { if (o !== item) o.open = false; });
  });
});

// Formulário: abre o e-mail com a mensagem pronta
const form = document.getElementById('form-contato');
const nota = document.getElementById('form-note');
const EMAIL = 'contato@stutz.com.br';

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = form.nome.value.trim();
  const campo = form.nome.closest('.field');

  if (!nome) {
    campo.classList.add('invalid');
    nota.textContent = 'Preencha o seu nome para continuar.';
    form.nome.focus();
    return;
  }
  campo.classList.remove('invalid');

  const assunto = `Novo contato pelo site — ${form.servico.value}`;
  const corpo = [
    `Nome: ${nome}`,
    `Empresa: ${form.empresa.value.trim() || '-'}`,
    `Interesse: ${form.servico.value}`,
    '',
    form.mensagem.value.trim(),
  ].join('\n');

  window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  nota.textContent = 'Abrindo o seu e-mail com a mensagem pronta…';
});

// Ano no rodapé
document.getElementById('ano').textContent = new Date().getFullYear();
