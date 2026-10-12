/* ============================================================
   PARSING DE RESPOSTA (v8.6) — Taverna
   Decodificação, extração tolerante de JSON e saneamento do que
   o Mestre devolve. Puro: sem estado, sem React.
   Extraído do App.jsx na modularização.
   ============================================================ */

export function decodificarTexto(str) {
  if (!str) return "";
  let saida;
  try { saida = JSON.parse(`"${String(str).replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`); }
  catch {
    saida = String(str)
      .replace(/\\n/g, "\n").replace(/\\t/g, " ")
      .replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
  }
  /* LIMPEZA (v7.3.1): em temperatura alta o modelo às vezes vaza escapes
     literais no meio da prosa — "t\u200bumulto", "aumentar\," — e caracteres
     invisíveis (zero-width). Decodifica \uXXXX literais e some com o lixo
     antes do texto chegar à tela. */
  return saida
    .replace(/\\u([0-9a-fA-F]{4})/g, (m, g) => String.fromCharCode(parseInt(g, 16)))
    .replace(/​‌‍﻿/g, "")
    .replace(/\\([,.!?;:*'"’])/g, "$1");
}

/* Analisa um OBJETO JSON vindo de chamadas auxiliares (arquivista etc.).
   Tolera resposta truncada: corta no último ponto seguro e fecha as
   estruturas abertas, em vez de falhar com "Expected ']'". */
export function parseObjetoTolerante(texto) {
  const limpo = (texto || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const inicio = limpo.indexOf("{");
  if (inicio === -1) return null;
  const s = limpo.slice(inicio);
  try { return JSON.parse(s); } catch { /* segue para o resgate */ }
  for (let corte = s.length; corte > 2; corte--) {
    const ch = s[corte - 1];
    if (ch !== "}" && ch !== "]" && ch !== ",") continue;
    const cand = s.slice(0, ch === "," ? corte - 1 : corte);
    const pilha = [];
    let emStr = false, esc = false;
    for (const c of cand) {
      if (esc) { esc = false; continue; }
      if (c === "\\") { esc = true; continue; }
      if (c === '"') { emStr = !emStr; continue; }
      if (emStr) continue;
      if (c === "{" || c === "[") pilha.push(c);
      else if (c === "}" || c === "]") pilha.pop();
    }
    if (emStr) continue; // corte no meio de uma string — tenta um ponto anterior
    const fechamento = pilha.reverse().map((c) => (c === "{" ? "}" : "]")).join("");
    try { return JSON.parse(cand + fechamento); } catch { /* tenta corte anterior */ }
  }
  return null;
}

/* ---------------- A ASPA DENTRO DA PROSA (11/10, 4.ª sessão de prova, nº 3) ----------------
   O Narrador escreveu 'o apelido "Navarro" já no ar' dentro do campo
   "narrativa" sem escapar as aspas. O JSON não abria, e o resgate por campo
   pegava tudo "até à próxima aspa": o jogador leu 449 de ~1.690 caracteres,
   a frase acabou a meio, e o Revisor recebeu o toco como se fosse a cena —
   e foi pago para o "corrigir". Uma resposta em 42 (2,4%): uma por dia de
   jogo.

   A regra: uma aspa dentro de uma string só FECHA a string quando o que vem
   a seguir é estrutura de JSON — dois-pontos (fim de chave), vírgula e outra
   aspa (a próxima chave ou o próximo item), fecho de objeto ou de lista, ou
   o fim do texto. Qualquer outra aspa é da prosa, e escapa-se. Se nem assim
   abrir, o resgate leva a narrativa INTEIRA até à aspa que fecha o campo,
   e não até à primeira aspa que aparece. Nunca se perde a narração.
   'olhar' é quantos caracteres adiante se olha para decidir. */
export const ASPA_QUE_FECHA = { depois: /^\s*(?::|,\s*"|[}\]]|$)/, olhar: 40 };
const fecha = (texto, i) => ASPA_QUE_FECHA.depois.test(texto.slice(i + 1, i + 1 + ASPA_QUE_FECHA.olhar));
function repararAspasInternas(bruto) {
  let saida = "", emStr = false, esc = false;
  for (let i = 0; i < bruto.length; i++) {
    const c = bruto[i];
    if (esc) { esc = false; saida += c; continue; }
    if (c === "\\") { esc = emStr; saida += c; continue; }
    if (c !== '"') { saida += c; continue; }
    if (!emStr) { emStr = true; saida += c; continue; }
    if (fecha(bruto, i)) { emStr = false; saida += c; continue; }
    saida += '\\"';
  }
  return saida;
}
/* O campo "narrativa" inteiro, numa resposta que não abre: do começo dele
   até à aspa que é seguida de estrutura (ASPA_QUE_FECHA), ou até ao fim do
   texto quando ele veio truncado. */
function narrativaInteira(bruto) {
  const m = /"narrativa"\s*:\s*"/.exec(bruto);
  if (!m) return null;
  const resto = bruto.slice(m.index + m[0].length);
  let esc = false;
  for (let i = 0; i < resto.length; i++) {
    const c = resto[i];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (c === '"' && fecha(resto, i)) return resto.slice(0, i);
  }
  return resto.replace(/"?\s*}?\s*$/, "");
}

/* Extrai a resposta do Mestre de forma à prova de falhas.
   Nunca deixa JSON cru, aspas ou \n escapar para a tela — mesmo que
   a resposta venha truncada no meio (sem o } final). */
export function extrairJSON(texto) {
  const limpo = (texto || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const inicio = limpo.indexOf("{");
  if (inicio === -1) {
    return { narrativa: decodificarTexto(limpo) || "O Mestre hesita por um instante… (toque em Tentar de novo)", rolagem: null, mudancas: null, sugestoes: [] };
  }
  const fim = limpo.lastIndexOf("}");
  const bruto = fim > inicio ? limpo.slice(inicio, fim + 1) : limpo.slice(inicio);

  // 1) tentativa direta (JSON bem formado)
  if (fim > inicio) {
    try { return sanearResposta(JSON.parse(bruto)); } catch { /* segue */ }
    try { return sanearResposta(JSON.parse(bruto.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]"))); } catch { /* segue */ }
    /* 4.ª sessão: a aspa da prosa sem escape (ver ASPA_QUE_FECHA) */
    try { return sanearResposta(JSON.parse(repararAspasInternas(bruto))); } catch { /* segue */ }
  }

  // 2) resgate por campo — funciona mesmo com JSON truncado/torto.
  //    Pega tudo depois de "narrativa":" até a próxima chave conhecida ou o fim.
  let narrativa = "";
  /* 4.ª sessão: o campo inteiro, e não até à primeira aspa da prosa */
  const inteira = narrativaInteira(bruto);
  if (inteira) {
    narrativa = decodificarTexto(inteira);
  } else {
    // sem sequer o campo: descarta chaves/rótulos e mostra o que sobrar legível
    narrativa = decodificarTexto(
      bruto.replace(/^\s*{/, "")
           .replace(/"(narrativa|rolagem|mudancas|sugestoes)"\s*:/g, "")
           .replace(/[{}]/g, "")
           .replace(/^\s*"|"\s*$/g, "")
           .trim()
    );
  }

  let sugestoes = [];
  const mSug = bruto.match(/"sugestoes"\s*:\s*(\[[^\]]*\])/);
  if (mSug) { try { sugestoes = JSON.parse(mSug[1]); } catch { /* ignora */ } }

  /* v9.68: o resgate era do campo "rolagem", que deixou de existir — a IA
     não pede teste. Resgatar um campo morto de uma resposta quebrada seria
     ressuscitar o canal exatamente onde ninguém olharia. Agora se resgata
     "perigo", que é uma frase, não um objeto. */
  let perigo = "", mudancas = null;
  const mPer = bruto.match(/"perigo"\s*:\s*"([^"]{4,240})"/);
  if (mPer) perigo = mPer[1];

  return {
    narrativa: semJsonNaProsa(narrativa) || "O Mestre hesita…",
    perigo, rolagem: null, mudancas,
    sugestoes: Array.isArray(sugestoes) ? sugestoes : [],
  };
}

/* ---------------- O CANAL DENTRO DA FALA (12/10, a 8.ª sessão de prova, M47) ----------------
   "Duas camas, até o sol, são oito escamas {"total":8}. E água quente é
   mais duas." — o Narrador imitou o canal `mudancas` dentro da prosa, e a
   chave apareceu na boca da estalajadeira. Nenhum envelope lhe mostra um
   objeto assim (o registo não tem "total" em lado nenhum do pedido): é a
   forma da resposta a escorrer para o texto. Um objeto JSON plano — chaves
   entre aspas, valores de texto, número ou verdade — nunca é prosa: sai
   inteiro, com o espaço que o antecede. Um texto entre chavetas sem a forma
   de chave ("{o que ela disse}") fica. */
const VALOR_PLANO = '(?:"[^"{}\\n]*"|-?\\d+(?:[.,]\\d+)?|true|false|null)';
const PAR_PLANO = '"[A-Za-z_][A-Za-z0-9_]*"\\s*:\\s*' + VALOR_PLANO;
export const JSON_NA_PROSA = new RegExp("\\s*\\{\\s*" + PAR_PLANO + "(?:\\s*,\\s*" + PAR_PLANO + ")*\\s*\\}", "g");
const semJsonNaProsa = (t) => String(t || "").replace(JSON_NA_PROSA, "");

/* Garante que a narrativa é string e os campos têm o tipo certo,
   mesmo que o modelo tenha aninhado coisas onde não devia. */
export function sanearResposta(obj) {
  if (!obj || typeof obj !== "object") return { narrativa: String(obj || ""), rolagem: null, mudancas: null, sugestoes: [] };
  let narrativa = obj.narrativa;
  if (typeof narrativa !== "string") {
    /* se veio um array ou objeto, tenta extrair texto legível */
    if (Array.isArray(narrativa)) narrativa = narrativa.filter((x) => typeof x === "string").join(" ");
    else if (narrativa && typeof narrativa === "object" && typeof narrativa.texto === "string") narrativa = narrativa.texto;
    else narrativa = "";
  }
  narrativa = semJsonNaProsa(decodificarTexto(narrativa));
  /* v9.68: o campo de rolagem morreu — a IA nao pede teste. Fica `perigo`,
     que e UMA frase de ficcao: o sistema le, escolhe a salvaguarda e cobra. */
  const perigo = typeof obj.perigo === "string" ? obj.perigo.slice(0, 240) : "";
  const mudancas = obj.mudancas && typeof obj.mudancas === "object" ? obj.mudancas : null;
  const sugestoes = Array.isArray(obj.sugestoes) ? obj.sugestoes.filter((s) => typeof s === "string") : [];
  /* aviso discreto se a narrativa parece cortada (sem pontuação final) */
  const fim = narrativa.trim().slice(-1);
  if (narrativa.length > 40 && !".!?\"'»)…".includes(fim)) {
    narrativa = narrativa.trim() + " […]";
  }
  return { narrativa: narrativa || "…", perigo, rolagem: null, mudancas, sugestoes };
}



/* gerarLivro vivia aqui e foi para App.jsx (v9.7): ela chama o modelo, e este
   arquivo é o pedaço puro — parsing, sem estado e sem rede. */
