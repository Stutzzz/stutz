/**
 * FORMULÁRIO DO PROJETO → PLANILHA DO GOOGLE (Stutz Web)
 *
 * Recebe o formulário de /formulario/ e:
 *   1. grava as respostas numa linha da aba "Briefings";
 *   2. salva logo, fotos e arquivos numa pasta do Google Drive, uma por cliente;
 *   3. manda um e-mail de aviso com tudo organizado.
 *
 * Como instalar (uma vez só):
 *   1. Abra a planilha > Extensões > Apps Script.
 *   2. Apague o que estiver lá, cole este arquivo inteiro e salve (ícone de disquete).
 *   3. No menu de funções lá em cima, escolha "autorizar" e clique em Executar.
 *      O Google vai pedir permissão: Revisar permissões > sua conta > Avançado >
 *      Acessar (não seguro) > Permitir. Isso aparece porque o script é seu e não
 *      passou pela revisão do Google; é normal.
 *   4. Implantar > Nova implantação > engrenagem > App da Web.
 *      Executar como: Eu. Quem pode acessar: Qualquer pessoa. Implantar.
 *   5. Copie o "URL do app da Web" e cole em URL_PLANILHA, no arquivo formulario.js do site.
 *
 * Se mudar este código depois: Implantar > Gerenciar implantações > lápis >
 * Versão: Nova versão > Implantar. O endereço continua o mesmo.
 */

// Nome da aba onde as respostas ficam (é criada sozinha se não existir)
const NOME_DA_ABA = "Briefings";

// Pasta do Google Drive onde ficam as pastas dos clientes (é criada sozinha)
const NOME_DA_PASTA = "Stutz Web - Briefings";

// E-mail que recebe o aviso. Vazio = o e-mail da conta dona da planilha.
const EMAIL_DE_AVISO = "";

// Recebe o formulário
function doPost(e) {
  const trava = LockService.getScriptLock();
  try {
    const dados = JSON.parse(e.postData.contents);

    // Campo isca preenchido = robô. Responde "ok" e não grava nada.
    if (dados.site_url_hp) return responder({ ok: true });
    if (!Array.isArray(dados.respostas) || !dados.respostas.length) {
      return responder({ ok: false, erro: "Formulário vazio." });
    }

    trava.waitLock(30000); // um envio por vez, para as linhas não se misturarem

    const planilha = SpreadsheetApp.getActiveSpreadsheet();
    const aba = planilha.getSheetByName(NOME_DA_ABA) || planilha.insertSheet(NOME_DA_ABA);

    // Pasta do cliente: "2026-11-13 14h05 - Nome da empresa"
    const agora = new Date();
    const carimbo = Utilities.formatDate(agora, "America/Sao_Paulo", "yyyy-MM-dd HH'h'mm");
    const cliente = limparNome(dados.empresa || dados.nome || "Sem nome");
    const pasta = pastaPrincipal().createFolder(carimbo + " - " + cliente);

    // Salva os arquivos e guarda o link de cada um no campo de onde veio
    const links = {};
    (dados.arquivos || []).forEach(function (a) {
      const bytes = Utilities.base64Decode(a.dados || "");
      const blob = Utilities.newBlob(bytes, a.tipo || "application/octet-stream", limparNome(a.nome || "arquivo"));
      const arquivo = pasta.createFile(blob);
      if (!links[a.chave]) links[a.chave] = [];
      links[a.chave].push(arquivo.getUrl());
    });

    // Monta a linha: cada pergunta vira uma coluna (colunas novas são criadas sozinhas)
    const linha = {
      "Recebido em": agora,
      "Pasta dos arquivos": pasta.getUrl(),
    };
    dados.respostas.forEach(function (r) {
      const valor = links[r.chave] ? links[r.chave].join("\n") : r.valor;
      linha[String(r.rotulo)] = valor === undefined || valor === null ? "" : valor;
    });
    gravarLinha(aba, linha);

    try {
      avisarPorEmail(dados, linha, pasta, planilha);
    } catch (erroEmail) {
      // Se o e-mail falhar, a resposta já está salva na planilha; segue normalmente
      console.error("E-mail de aviso não enviado: " + erroEmail);
    }

    return responder({ ok: true });
  } catch (erro) {
    console.error(erro);
    return responder({ ok: false, erro: String(erro) });
  } finally {
    try { trava.releaseLock(); } catch (e2) {}
  }
}

// Abrir o endereço do script no navegador mostra se está funcionando
function doGet() {
  return responder({ ok: true, mensagem: "Formulário da Stutz Web funcionando." });
}

// Rode uma vez pelo editor para o Google pedir as permissões (planilha, Drive e e-mail)
function autorizar() {
  SpreadsheetApp.getActiveSpreadsheet().getName();
  DriveApp.getRootFolder().getName();
  MailApp.getRemainingDailyQuota();
  Logger.log("Permissões concedidas. Agora é só implantar como App da Web.");
}

// ---------- Ajudantes ----------

function gravarLinha(aba, linha) {
  const ultimaColuna = aba.getLastColumn();
  const cabecalho = ultimaColuna ? aba.getRange(1, 1, 1, ultimaColuna).getValues()[0] : [];
  let mudou = !ultimaColuna;
  Object.keys(linha).forEach(function (rotulo) {
    if (cabecalho.indexOf(rotulo) === -1) {
      cabecalho.push(rotulo);
      mudou = true;
    }
  });
  if (mudou) {
    aba.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho]).setFontWeight("bold");
    aba.setFrozenRows(1);
  }
  const valores = cabecalho.map(function (rotulo) {
    return protegerCelula(linha[rotulo] === undefined ? "" : linha[rotulo]);
  });
  aba.appendRow(valores);
}

// Texto que começa com = + - @ viraria fórmula na planilha; um apóstrofo na frente evita isso
function protegerCelula(valor) {
  if (typeof valor !== "string") return valor;
  return /^[=+\-@]/.test(valor) ? "'" + valor : valor;
}

function pastaPrincipal() {
  const pastas = DriveApp.getFoldersByName(NOME_DA_PASTA);
  return pastas.hasNext() ? pastas.next() : DriveApp.createFolder(NOME_DA_PASTA);
}

function limparNome(texto) {
  return String(texto).replace(/[\\/:*?"<>|#]/g, "-").replace(/\s+/g, " ").trim().slice(0, 80) || "Sem nome";
}

function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function avisarPorEmail(dados, linha, pasta, planilha) {
  const para = EMAIL_DE_AVISO || Session.getEffectiveUser().getEmail();
  if (!para) return;

  const cliente = dados.empresa || dados.nome || "sem nome";
  const assunto = "Novo formulário: " + cliente + (dados.plano ? " (" + dados.plano + ")" : "");

  let corpo = "<h2 style='font-family:Arial,sans-serif'>Novo formulário do site</h2>";
  corpo += "<p style='font-family:Arial,sans-serif'><a href='" + pasta.getUrl() + "'>Abrir a pasta com os arquivos</a> · ";
  corpo += "<a href='" + planilha.getUrl() + "'>Abrir a planilha</a></p>";
  corpo += "<table cellpadding='8' style='border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px'>";
  dados.respostas.forEach(function (r) {
    const valor = linha[String(r.rotulo)];
    if (valor === "" || valor === undefined) return;
    corpo += "<tr style='border-bottom:1px solid #ddd'><td style='vertical-align:top;color:#555;width:200px'><b>" +
      escaparHtml(r.rotulo) + "</b></td><td>" + escaparHtml(valor).replace(/\n/g, "<br>") + "</td></tr>";
  });
  corpo += "</table>";

  MailApp.sendEmail({ to: para, subject: assunto, htmlBody: corpo, name: "Site Stutz Web" });
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}
