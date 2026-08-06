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
  }

  // 2) resgate por campo — funciona mesmo com JSON truncado/torto.
  //    Pega tudo depois de "narrativa":" até a próxima chave conhecida ou o fim.
  let narrativa = "";
  const mNarr = bruto.match(/"narrativa"\s*:\s*"((?:[^"\\]|\\.)*)"?/);
  if (mNarr && mNarr[1]) {
    narrativa = decodificarTexto(mNarr[1]);
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

  // tenta recuperar rolagem/mudancas se estiverem completos no texto
  let rolagem = null, mudancas = null;
  const mRol = bruto.match(/"rolagem"\s*:\s*({[^}]*})/);
  if (mRol) { try { rolagem = JSON.parse(mRol[1]); } catch { /* ignora */ } }

  return {
    narrativa: narrativa || "O Mestre hesita…",
    rolagem, mudancas,
    sugestoes: Array.isArray(sugestoes) ? sugestoes : [],
  };
}

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
  narrativa = decodificarTexto(narrativa);
  const rolagem = obj.rolagem && typeof obj.rolagem === "object" ? obj.rolagem : null;
  const mudancas = obj.mudancas && typeof obj.mudancas === "object" ? obj.mudancas : null;
  const sugestoes = Array.isArray(obj.sugestoes) ? obj.sugestoes.filter((s) => typeof s === "string") : [];
  /* aviso discreto se a narrativa parece cortada (sem pontuação final) */
  const fim = narrativa.trim().slice(-1);
  if (narrativa.length > 40 && !".!?\"'»)…".includes(fim)) {
    narrativa = narrativa.trim() + " […]";
  }
  return { narrativa: narrativa || "…", rolagem, mudancas, sugestoes };
}



async function gerarLivro(livroAtual, narrativas) {
  const system = `Você é o arquivista de uma campanha de RPG. Atualize o LIVRO DA CAMPANHA: um registro fiel e conciso dos FATOS que o Mestre precisa lembrar para manter continuidade. Em tópicos curtos: NPCs conhecidos e a relação com o herói; promessas/dívidas/juramentos; inimigos e aliados; locais importantes; itens/segredos; pontas soltas. Máx 220 palavras. Responda SOMENTE com o texto do livro em tópicos, sem preâmbulo.`;
  const conteudo = `LIVRO ATUAL:
${livroAtual || "(vazio)"}

NOVOS ACONTECIMENTOS (mais recentes):
${narrativas.slice(-16).join("\n\n")}`;
  try {
    /* tarefa "leve": o livro é burocracia de arquivista, não narração —
       vai para o modelo barato no servidor (roteamento por tarefa) */
    const r = await chamarModelo(system, [{ role: "user", content: conteudo }], 600, "texto", "leve");
    return (r || "").trim();
  } catch {
    return livroAtual;
  }
}

/* ---------------- UI básicos ---------------- */
