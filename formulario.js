// ==========================================
// FORMULÁRIO DO PROJETO (briefing em etapas)
// ==========================================
// As respostas vão para a planilha do Google pelo script em ferramentas/planilha-briefing.gs.
// Depois de publicar o script como "App da Web", cole o endereço dele aqui:
const URL_PLANILHA = "https://script.google.com/macros/s/AKfycbymodFBmNUxfnBein93IGqtnV5VgKGRC4qpq3h7BmPrF06LU9me1ESOO5AxzWRtc-Y2HQ/exec";

const LIMITE_ARQUIVO = 10 * 1024 * 1024; // 10 MB por arquivo
const LIMITE_TOTAL = 20 * 1024 * 1024; // 20 MB somando todos os arquivos
const CHAVE_RASCUNHO = "stutz-briefing"; // respostas guardadas no navegador até o envio

(function () {
  const form = document.getElementById("briefing");
  if (!form) return;

  const caixa = document.getElementById("briefing-caixa");
  const progresso = caixa.querySelector(".briefing-progresso");
  const todasEtapas = [...form.querySelectorAll(".etapa")];
  const marcadores = [...caixa.querySelectorAll("[data-etapa-marcador]")];
  const btnVoltar = form.querySelector("[data-voltar]");
  const btnAvancar = form.querySelector("[data-avancar]");
  const btnEnviar = form.querySelector("[data-enviar]");
  const avisoErro = form.querySelector(".briefing-erro");
  const sucesso = document.getElementById("briefing-sucesso");
  let atual = 0;

  const MENSAGENS = {
    vazio: "Preencha este campo.",
    escolha: "Escolha uma opção.",
    email: "Digite um e-mail válido, como nome@empresa.com.br.",
    telefone: "Digite o WhatsApp com DDD.",
    url: "Digite um endereço válido, como suaempresa.com.br.",
    documento: "Digite um CNPJ (14 números) ou CPF (11 números).",
    aceite: "Para enviar, marque a autorização.",
  };

  // ---------- Ler e preencher campos ----------
  const listaDe = (nome) => {
    const campos = form.elements[nome];
    if (!campos) return [];
    return campos instanceof RadioNodeList ? [...campos] : [campos];
  };

  const valorDe = (nome) => {
    const lista = listaDe(nome);
    if (!lista.length) return "";
    if (lista[0].type === "checkbox") return lista.filter((c) => c.checked).map((c) => c.value);
    if (lista[0].type === "radio") return (lista.find((c) => c.checked) || {}).value || "";
    return lista[0].value;
  };

  const preencher = (nome, valor) => {
    listaDe(nome).forEach((c) => {
      if (c.type === "radio") c.checked = c.value === valor;
      else if (c.type === "checkbox") c.checked = Array.isArray(valor) ? valor.includes(c.value) : c.value === valor;
      else if (c.type !== "file") c.value = valor;
    });
  };

  const tamanho = (bytes) =>
    bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

  // ---------- Campos que só aparecem com certas respostas (data-se="campo:valor") ----------
  const condicaoAtende = (expressao) => {
    const [nome, esperado] = expressao.split(":");
    const valor = valorDe(nome);
    const aceitos = esperado.split("|");
    return Array.isArray(valor) ? valor.some((v) => aceitos.includes(v)) : aceitos.includes(valor);
  };

  const atualizarCondicionais = () => {
    form.querySelectorAll("[data-se]").forEach((el) => {
      const mostrar = condicaoAtende(el.dataset.se);
      el.hidden = !mostrar;
      el.querySelectorAll("input, textarea").forEach((c) => { c.disabled = !mostrar; });
    });
  };

  // ---------- Etapas ----------
  const plano = () => valorDe("plano");
  const etapasVisiveis = () => todasEtapas.filter((e) => !e.dataset.soPlano || e.dataset.soPlano === plano());

  // Com a rolagem suave, a página precisa recalcular a altura quando o formulário muda de tamanho
  let esperaAltura;
  const atualizarAlturaDaPagina = () => {
    if (!window.ScrollTrigger) return;
    clearTimeout(esperaAltura);
    esperaAltura = setTimeout(() => window.ScrollTrigger.refresh(), 80);
  };
  if ("ResizeObserver" in window) new ResizeObserver(atualizarAlturaDaPagina).observe(caixa);

  // Rola até um elemento deixando uma folga para o menu fixo do topo
  const rolarPara = (elemento, folga) => {
    const suave = window.ScrollSmoother && window.ScrollSmoother.get();
    if (suave) suave.scrollTo(elemento, true, `top ${folga}px`);
    else window.scrollTo({ top: elemento.getBoundingClientRect().top + window.scrollY - folga, behavior: "smooth" });
  };
  const rolarParaCaixa = () => rolarPara(caixa, 110);

  const nomeDaEtapa = (chave) => {
    const m = marcadores.find((mk) => mk.dataset.etapaMarcador === chave);
    return m ? m.querySelector(".marcador-nome").textContent : chave;
  };

  const mostrarEtapa = (indice, rolar = true) => {
    const visiveis = etapasVisiveis();
    atual = Math.max(0, Math.min(indice, visiveis.length - 1));
    todasEtapas.forEach((e) => { e.hidden = e !== visiveis[atual]; });

    const chaves = visiveis.map((e) => e.dataset.etapa);
    let numero = 0;
    marcadores.forEach((m) => {
      const pos = chaves.indexOf(m.dataset.etapaMarcador);
      m.hidden = pos === -1;
      if (pos === -1) return;
      numero += 1;
      m.querySelector(".marcador-num").textContent = numero;
      m.classList.toggle("ativa", pos === atual);
      m.classList.toggle("feita", pos < atual);
      if (pos === atual) m.setAttribute("aria-current", "step");
      else m.removeAttribute("aria-current");
    });

    const ultima = atual === visiveis.length - 1;
    btnVoltar.hidden = atual === 0;
    btnAvancar.hidden = ultima;
    btnEnviar.hidden = !ultima;
    avisoErro.hidden = true;
    if (ultima) montarRevisao();

    if (rolar) {
      rolarParaCaixa();
      visiveis[atual].querySelector(".etapa-titulo").focus({ preventScroll: true });
    }
    atualizarAlturaDaPagina();
  };

  // ---------- Validação ----------
  const limparErro = (wrapper) => {
    if (!wrapper) return;
    wrapper.classList.remove("tem-erro");
    wrapper.querySelectorAll(".campo-erro").forEach((e) => e.remove());
    wrapper.querySelectorAll("[aria-invalid]").forEach((c) => c.removeAttribute("aria-invalid"));
  };

  const marcarErro = (wrapper, texto) => {
    wrapper.classList.add("tem-erro");
    const aviso = document.createElement("p");
    aviso.className = "campo-erro";
    aviso.textContent = texto;
    wrapper.appendChild(aviso);
    wrapper.querySelectorAll("input, textarea").forEach((c) => c.setAttribute("aria-invalid", "true"));
  };

  const totalDeArquivos = () =>
    [...form.querySelectorAll('input[type="file"]')]
      .filter((c) => !c.disabled)
      .reduce((soma, c) => soma + [...c.files].reduce((s, f) => s + f.size, 0), 0);

  const erroDoCampo = (w) => {
    if (w.matches(".campo-grupo")) {
      const obrigatorio = w.querySelector("input[required]");
      const valor = valorDe(w.dataset.grupo);
      return obrigatorio && (Array.isArray(valor) ? !valor.length : !valor) ? MENSAGENS.escolha : "";
    }
    if (w.matches(".aceite")) return w.querySelector("input").checked ? "" : MENSAGENS.aceite;
    if (w.matches(".campo-arquivo")) {
      const grande = [...w.querySelector("input").files].find((f) => f.size > LIMITE_ARQUIVO);
      if (grande) return `O arquivo "${grande.name}" passa de 10 MB. Mande esse pelo WhatsApp.`;
      if (totalDeArquivos() > LIMITE_TOTAL) return "Os arquivos somam mais de 20 MB. Envie os principais aqui e o restante pelo WhatsApp.";
      return "";
    }
    const c = w.querySelector("input, textarea");
    if (!c || c.disabled) return "";
    const v = c.value.trim();
    if (c.required && !v) return MENSAGENS.vazio;
    if (!v) return "";
    if (c.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return MENSAGENS.email;
    if (c.type === "tel" && v.replace(/\D/g, "").length < 10) return MENSAGENS.telefone;
    if (c.type === "url" && !/^(https?:\/\/)?[^\s.]+\.\S+$/i.test(v)) return MENSAGENS.url;
    if (c.name === "documento" && ![11, 14].includes(v.replace(/\D/g, "").length)) return MENSAGENS.documento;
    return "";
  };

  const validarEtapa = (etapa) => {
    let primeiro = null;
    etapa.querySelectorAll(".campo, .aceite").forEach((w) => {
      limparErro(w);
      if (w.hidden) return;
      const erro = erroDoCampo(w);
      if (erro) {
        marcarErro(w, erro);
        if (!primeiro) primeiro = w;
      }
    });
    if (primeiro) {
      const alvo = primeiro.querySelector("input:not(:disabled), textarea:not(:disabled)");
      if (alvo) alvo.focus({ preventScroll: true });
      rolarPara(primeiro, 140);
    }
    return !primeiro;
  };

  // ---------- Juntar as respostas ----------
  const lerCampo = (w) => {
    const rotulo = w.dataset.rotulo;
    if (w.matches(".campo-grupo")) {
      const marcados = [...w.querySelectorAll("input:checked")].map((c) => c.closest(".opcao").querySelector("strong").textContent.trim());
      return { chave: w.dataset.grupo, rotulo, valor: marcados.join(", ") };
    }
    const c = w.querySelector("input, textarea");
    if (c.type === "file") {
      const arquivos = [...c.files];
      return { chave: c.name, rotulo, valor: arquivos.map((f) => f.name).join("\n"), arquivos };
    }
    let valor = c.value.trim();
    if (c.type === "url" && valor && !/^https?:\/\//i.test(valor)) valor = `https://${valor}`;
    return { chave: c.name, rotulo, valor };
  };

  const coletar = () =>
    etapasVisiveis()
      .filter((etapa) => etapa.dataset.etapa !== "revisao")
      .map((etapa) => ({
        titulo: nomeDaEtapa(etapa.dataset.etapa),
        itens: [...etapa.querySelectorAll(".campo")].filter((w) => !w.hidden).map(lerCampo),
      }));

  function montarRevisao() {
    const alvo = document.getElementById("revisao-lista");
    alvo.innerHTML = "";
    coletar().forEach(({ titulo, itens }) => {
      const preenchidos = itens.filter((i) => i.valor);
      if (!preenchidos.length) return;
      const h = document.createElement("h3");
      h.className = "revisao-etapa";
      h.textContent = titulo;
      const dl = document.createElement("dl");
      preenchidos.forEach((i) => {
        const linha = document.createElement("div");
        linha.className = "revisao-item";
        const dt = document.createElement("dt");
        dt.textContent = i.rotulo;
        const dd = document.createElement("dd");
        dd.textContent = i.valor;
        linha.append(dt, dd);
        dl.appendChild(linha);
      });
      alvo.append(h, dl);
    });
  }

  // Texto para mandar pelo WhatsApp se o envio automático não funcionar
  const resumoEmTexto = (blocos) => {
    let texto = "Olá! Seguem as respostas do formulário do meu site:\n";
    blocos.forEach(({ titulo, itens }) => {
      const preenchidos = itens.filter((i) => i.valor);
      if (!preenchidos.length) return;
      texto += `\n*${titulo}*\n`;
      preenchidos.forEach((i) => { texto += `${i.rotulo}: ${i.arquivos ? `${i.arquivos.length} arquivo(s), mando aqui na conversa` : i.valor}\n`; });
    });
    return texto.length > 1800 ? `${texto.slice(0, 1800)}…\n(continua)` : texto;
  };

  const linkZap = (mensagem) =>
    typeof linkWhatsApp === "function" ? linkWhatsApp(mensagem) : `https://wa.me/5511927485272?text=${encodeURIComponent(mensagem)}`;

  const mostrarErroEnvio = (texto, resumo) => {
    avisoErro.textContent = `${texto} `;
    const link = document.createElement("a");
    link.href = linkZap(resumo);
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Mandar as respostas pelo WhatsApp";
    avisoErro.appendChild(link);
    avisoErro.hidden = false;
    atualizarAlturaDaPagina();
  };

  const lerBase64 = (arquivo) =>
    new Promise((resolver, rejeitar) => {
      const leitor = new FileReader();
      leitor.onload = () => resolver(String(leitor.result).split(",")[1] || "");
      leitor.onerror = () => rejeitar(leitor.error);
      leitor.readAsDataURL(arquivo);
    });

  const travar = (sim) => {
    btnEnviar.disabled = sim;
    btnVoltar.disabled = sim;
    btnEnviar.querySelector("span").textContent = sim ? "Enviando…" : "Enviar formulário";
  };

  const mostrarSucesso = (empresa) => {
    form.hidden = true;
    progresso.hidden = true;
    sucesso.hidden = false;
    document.getElementById("briefing-sucesso-whats").href = linkZap(
      `Olá! Acabei de enviar o formulário do site${empresa ? ` da ${empresa}` : ""}. Como faço o pagamento da entrada?`
    );
    rolarParaCaixa();
    sucesso.focus({ preventScroll: true });
    atualizarAlturaDaPagina();
  };

  const registrarEnvio = (nomePlano) => {
    let aceitou = false;
    try { aceitou = localStorage.getItem("stutz-cookies") === "aceito"; } catch (e) {}
    if (!aceitou) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "briefing_enviado", plano: nomePlano });
    if (typeof window.gtag === "function") window.gtag("event", "briefing_enviado", { plano: nomePlano });
  };

  // ---------- Rascunho no navegador (sem os arquivos) ----------
  let esperaRascunho;
  let enviado = false; // depois do envio, o rascunho não é mais gravado
  const salvarRascunho = () => {
    clearTimeout(esperaRascunho);
    if (enviado) return;
    esperaRascunho = setTimeout(() => {
      const dados = {};
      [...form.elements].forEach((c) => {
        if (!c.name || c.type === "file" || c.name === "site_url_hp" || c.name === "aceite") return;
        if (c.type === "radio") { if (c.checked) dados[c.name] = c.value; }
        else if (c.type === "checkbox") { if (c.checked) (dados[c.name] = dados[c.name] || []).push(c.value); }
        else if (c.value) dados[c.name] = c.value;
      });
      try { localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(dados)); } catch (e) {}
    }, 300);
  };

  const restaurarRascunho = () => {
    let dados = null;
    try { dados = JSON.parse(localStorage.getItem(CHAVE_RASCUNHO) || "null"); } catch (e) {}
    if (dados && typeof dados === "object") Object.entries(dados).forEach(([nome, valor]) => preencher(nome, valor));
  };

  // ---------- Eventos ----------
  form.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener("change", () => {
      const lista = input.closest(".campo").querySelector(".arquivos-lista");
      lista.innerHTML = "";
      [...input.files].forEach((f) => {
        const li = document.createElement("li");
        li.textContent = `${f.name} (${tamanho(f.size)})`;
        if (f.size > LIMITE_ARQUIVO) li.className = "arquivo-grande";
        lista.appendChild(li);
      });
    });
  });

  form.addEventListener("change", (e) => {
    limparErro(e.target.closest(".campo, .aceite"));
    atualizarCondicionais();
    if (e.target.name === "plano") mostrarEtapa(atual, false);
    salvarRascunho();
  });

  form.addEventListener("input", (e) => {
    limparErro(e.target.closest(".campo"));
    salvarRascunho();
  });

  // Enter num campo de uma linha avança de etapa (em vez de enviar o formulário)
  form.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.target.tagName === "TEXTAREA" || e.target.type === "submit") return;
    e.preventDefault();
    if (!btnAvancar.hidden) btnAvancar.click();
  });

  btnAvancar.addEventListener("click", () => {
    if (validarEtapa(etapasVisiveis()[atual])) mostrarEtapa(atual + 1);
  });

  btnVoltar.addEventListener("click", () => mostrarEtapa(atual - 1));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validarEtapa(etapasVisiveis()[atual])) return;

    const blocos = coletar();
    const respostas = blocos.flatMap((b) => b.itens.map(({ chave, rotulo, valor }) => ({ chave, rotulo, valor })));
    const empresa = valorDe("empresa").trim();
    const nomePlano = (respostas.find((r) => r.chave === "plano") || {}).valor || "";
    const resumo = resumoEmTexto(blocos);

    // Robôs costumam preencher o campo isca: finge que deu certo e não envia nada
    if (form.elements.site_url_hp.value) { mostrarSucesso(empresa); return; }

    if (!URL_PLANILHA) {
      mostrarErroEnvio("O envio automático ainda não está ligado.", resumo);
      return;
    }
    if (totalDeArquivos() > LIMITE_TOTAL) {
      mostrarErroEnvio("Os arquivos somam mais de 20 MB. Volte, deixe só os principais e mande o resto pelo WhatsApp.", resumo);
      return;
    }

    travar(true);
    avisoErro.hidden = true;
    try {
      const arquivos = [];
      for (const bloco of blocos) {
        for (const item of bloco.itens) {
          for (const arquivo of item.arquivos || []) {
            arquivos.push({
              chave: item.chave,
              rotulo: item.rotulo,
              nome: arquivo.name,
              tipo: arquivo.type || "application/octet-stream",
              dados: await lerBase64(arquivo),
            });
          }
        }
      }

      const resposta = await fetch(URL_PLANILHA, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // evita a checagem extra (CORS) que o Google não responde
        body: JSON.stringify({
          enviado_em: new Date().toISOString(),
          plano: nomePlano,
          empresa,
          nome: valorDe("nome").trim(),
          respostas,
          arquivos,
          site_url_hp: "",
        }),
      });
      const retorno = await resposta.json();
      if (!retorno.ok) throw new Error(retorno.erro || "Falha no envio");

      enviado = true;
      clearTimeout(esperaRascunho);
      try { localStorage.removeItem(CHAVE_RASCUNHO); } catch (err) {}
      registrarEnvio(nomePlano);
      mostrarSucesso(empresa);
    } catch (erro) {
      mostrarErroEnvio("Não conseguimos enviar agora. Tente de novo em instantes.", resumo);
    } finally {
      travar(false);
    }
  });

  // ---------- Começo ----------
  restaurarRascunho();
  const parametros = new URLSearchParams(window.location.search);
  if (parametros.get("plano")) preencher("plano", parametros.get("plano"));
  if (parametros.get("template")) preencher("template", parametros.get("template"));
  atualizarCondicionais();
  mostrarEtapa(0, false);
})();
