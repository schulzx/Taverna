/* ============================================================
   AS PERGUNTAS AO MESTRE (Fase MM, etapa MM14) — perguntar é de graça

   A sessão de prova (MM11, `mente/mm11-sessao.md`) fez treze perguntas
   ao Mestre, das que o Matt ouve cento e cinquenta vezes numa noite. Só
   cinco saíram do sistema. O fato certo existia quase sempre; o que
   falhava era O CAMINHO até ele:

     · a palavra "sino" do nome da taverna (o Sino Calado) sequestrou a
       resposta SEIS vezes — quem perguntava pela dona, pelo músico ou
       pela idade da casa recebia o sino das horas;
     · uma pergunta de balcão ("quanto custa um quarto?") virou teste de
       Persuasão, e a frase nunca chegou ao Narrador;
     · a resposta era UMA por turno, às vezes de outra cidade;
     · e perguntar numa luta gastava a vez.

   Este módulo é a parte do caminho que é de todos: saber o que numa frase
   é PERGUNTA e o que é AÇÃO, tirar os nomes próprios da frase antes de a
   ler à procura do assunto, e juntar as respostas das várias fichas (a
   cidade, a gente, o mercado) pela ORDEM em que a frase as pede.

   ---------------- PERGUNTAR É DE GRAÇA ----------------

   Numa mesa do Matt, "ele está a ver-me?" nunca custa a vez. Uma frase
   que SÓ pergunta — mais os gestos de quem pergunta: virar-se para
   alguém, baixar a voz, apontar para a parede das facas — não gasta
   tempo do mundo nem a ação na luta. Uma frase que pergunta E age gasta
   pela parte que age, e a pergunta é respondida na mesma. Não há botão
   novo: a peneira (`peneira.js`) já sabe o que é pergunta; aqui só se
   decide o que SOBRA dela.

   ---------------- UMA PALAVRA DE UM NOME NÃO É UM ASSUNTO ----------------

   "Há quanto tempo tocas aqui no Sino?" não pergunta pelo sino. Antes
   de procurar o assunto, a frase perde os nomes próprios: os que o mundo
   conhece (os lugares e a gente, que quem chama passa) e toda palavra com
   maiúscula no meio de uma oração, que é como o jogador escreve um nome
   que o sistema ainda não sabe. Quem procura A PESSOA continua a ler a
   frase inteira — é pelo nome que se acha alguém.
   ============================================================ */

import { soODeclarado } from "./peneira.js";

/* a mesma régua da casa: minúsculas, sem acento, do MESMO tamanho da frase
   (as posições continuam a bater com o texto do jogador) */
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const mascarar = (m) => m.replace(/[^\n]/g, " ");
const semArtigo = (s) => String(s || "").replace(/^(o|a|os|as)\s+/i, "").trim();

/* ---------------- O GESTO DE QUEM PERGUNTA ----------------
   Um pedaço de frase que só diz A QUEM se pergunta, ou COMO: virar-se,
   chamar, baixar a voz, apontar, sentar-se ao lado, agradecer. Nada disto
   move o mundo, e por isso nada disto gasta a vez. Lido no começo de cada
   pedaço (as vírgulas, os pontos e o "e" partem a frase). As interjeições
   de mesa ("Espera.", "Mestre,") entram aqui pelo mesmo motivo.
   O que NÃO é gesto: pagar, beber, guardar, ir, sacar — isso age. */
export const GESTOS_DE_PERGUNTAR = /^(?:(?:e|eu|entao|depois|mas|ai|la|so)\s+)*(?:pergunt\w*|indag\w*|question\w*|quero saber|queria saber|chamo|viro-me|volto-me|me viro|me volto|olho|fito|aponto|baixo a voz|sussurr\w*|cochich\w*|murmur\w*|digo|falo|respondo|agradec\w*|cumpriment\w*|aceno|sorrio|cruzo os bracos|sento-me|me sento|encosto-me|me encosto|inclino-me|me inclino|continuo|insisto|repito|dirijo-me|me dirijo|espera|calma|hu+m+|hm+|ok|certo|bem|mestre|narrador|antes de \w+|enquanto \w+)\b/;

/* o que marca que há pergunta: o ponto de interrogação, ou o verbo */
export const MARCAS_DE_PERGUNTA = /\?|\b(pergunt\w*|quero saber|queria saber|indago)\b/;

/* Um envelope do sistema ("[SOCIAL — RESOLVIDO …] Eu disse: "…"") não é a
   frase do jogador: o que o jogador disse é o que vem entre as aspas do
   "Eu disse". Sem isto, as palavras da REGRA DO ENVELOPE eram lidas como
   se fossem a pergunta.
   MM14 (o resto do nº 6): e o "Eu perguntei" do envelope do oráculo. Quando
   o d100 decide o que ninguém decidiu ("o guarda aceita suborno?"), o que a
   ficha JÁ sabe (quem guarda a lei aqui) continua a ir ao Narrador — sem
   isto, o turno do oráculo chegava sem ficha nenhuma, e o "não" podia ser
   narrado contra o mundo. Só com os dois-pontos colados: "Eu perguntei ao
   cadáver de X:" (grimório) não é a frase do jogador sobre a cidade. */
export function fraseDoJogador(texto) {
  const t = String(texto == null ? "" : texto);
  if (!t.trimStart().startsWith("[")) return t;
  const m = t.match(/Eu (?:disse|perguntei): "([^"]*)"/);
  return m ? m[1] : "";
}

/* Os pedaços de uma frase (vírgula, ponto, dois-pontos, "e", "então"),
   com as posições. */
function pedacos(s) {
  const out = [];
  const rx = /[^,.;:!?\n—]+/g;
  let m;
  while ((m = rx.exec(s))) {
    /* o "e" e o "então" partem o pedaço: "pago a lâmina e pergunto" são dois */
    const parte = m[0];
    const sub = /\s(e|entao|depois)\s/g;
    let ini = 0, k;
    while ((k = sub.exec(parte))) {
      out.push({ ini: m.index + ini, txt: parte.slice(ini, k.index) });
      ini = k.index + 1;
    }
    out.push({ ini: m.index + ini, txt: parte.slice(ini) });
  }
  return out.filter((p) => p.txt.trim());
}

/* ---------------- SÓ PERGUNTA? ----------------
   `{ pergunta, soPergunta, acao }`: `pergunta` diz se a frase pergunta
   alguma coisa; `soPergunta`, se não faz mais nada além disso (e aí o
   turno não gasta tempo nem a vez); `acao` é a parte que age, com as
   palavras e os acentos do jogador ("" quando só pergunta). Lixo devolve
   tudo falso e ação vazia — nunca erro. */
/* os pedaços que AGEM de uma frase que pergunta (posições da frase) */
function pedacosQueAgem(t) {
  let declarado = "";
  try { declarado = soODeclarado(t); } catch { declarado = norm(t); }
  /* soODeclarado devolve o texto do MESMO tamanho, sem a fala, sem as
     perguntas, sem as hipóteses e sem as negações: o que sobra, pedaço a
     pedaço, ou é gesto de quem pergunta ou é ação */
  return pedacos(declarado).filter((p) => !GESTOS_DE_PERGUNTAR.test(p.txt.trim()));
}

export function soPergunta(frase) {
  const t = String(frase == null ? "" : frase);
  const vazio = { pergunta: false, soPergunta: false, acao: t.trim() };
  if (!t.trim()) return { ...vazio, acao: "" };
  const n = norm(t);
  const pergunta = MARCAS_DE_PERGUNTA.test(n);
  if (!pergunta) return vazio;
  const age = pedacosQueAgem(t);
  if (!age.length) return { pergunta: true, soPergunta: true, acao: "" };
  /* a ação com as palavras do jogador: do primeiro ao último pedaço que age */
  const ini = age[0].ini, fim = age[age.length - 1].ini + age[age.length - 1].txt.length;
  const acao = t.slice(ini, fim).replace(/^[\s,.;:—-]+|[\s,;:—-]+$/g, "").trim();
  return { pergunta: true, soPergunta: !acao, acao };
}

/* ---------------- A FALA QUE SÓ PERGUNTA ----------------
   A fala dirigida a alguém (entre aspas, ou depois de "digo:") que é só
   pergunta de quem quer saber — "Quanto custa um quarto?", "Onde fica o
   templo?" — não é performance diante de um estranho: é balcão. O teste
   de causar boa impressão (desafios.js, `impressionar`) lê isto antes de
   pedir dado. Uma fala com uma frase que não pergunta ("você caiu do céu?
   porque você é um anjo") continua a ser a cantada que é. */
export const INTERROGATIVAS = /^(e |mas |entao )?(que|o que|quem|quanto|quanta|quantos|quantas|qual|quais|onde|aonde|como|quando|por que|porque|pra que|para que|ha|tem|existe|existem|sabe|sabes|conhece|conheces|pode|podes|voces tem|a que|a quantos|de onde)\b/;

export function falaSoPergunta(texto) {
  const t = norm(texto);
  const aspas = [...t.matchAll(/["“”«»]([^"“”«»]*)["“”«»]/g)].map((m) => m[1]);
  const depois = t.match(/\b(digo|falo|pergunto|respondo)\s*:\s*([^"“”«»]+)$/);
  const fala = [...aspas, ...(depois ? [depois[2]] : [])].join(" ").trim();
  if (!fala) return false;
  const frases = fala.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
  return frases.length > 0 && frases.every((x) => /\?$/.test(x) && INTERROGATIVAS.test(x));
}

/* ---------------- A FRASE SEM OS NOMES PRÓPRIOS ----------------
   Devolve a frase normalizada (do mesmo tamanho) com os nomes próprios
   apagados: os `nomes` que o mundo conhece (com e sem artigo) e as
   palavras com maiúscula que não abrem uma oração. As partículas entre
   dois pedaços de nome ("Foz DO Meio") vão junto. É esta a frase que se
   lê à procura do ASSUNTO; a pessoa procura-se na frase inteira. */
export function semNomesProprios(frase, nomes = []) {
  const t = String(frase == null ? "" : frase);
  let s = norm(t);
  if (!s.trim()) return s;
  const apagar = (ini, fim) => { s = s.slice(0, ini) + mascarar(s.slice(ini, fim)) + s.slice(fim); };
  /* 1. os nomes que o mundo conhece, inteiros, como palavra */
  const lista = (Array.isArray(nomes) ? nomes : [])
    .flatMap((x) => [x, semArtigo(x)])
    .map((x) => norm(x).trim())
    .filter((x, i, a) => x.length >= 3 && a.indexOf(x) === i)
    .sort((a, b) => b.length - a.length);
  for (const alvo of lista) {
    let i = s.indexOf(alvo);
    while (i >= 0) {
      const a = i > 0 ? s[i - 1] : " ", d = s[i + alvo.length] || " ";
      if (!/[a-z0-9]/.test(a) && !/[a-z0-9]/.test(d)) apagar(i, i + alvo.length);
      i = s.indexOf(alvo, i + 1);
    }
  }
  /* 2. a maiúscula no meio da oração */
  const palavras = [];
  const rx = /[\p{L}][\p{L}\-']*/gu;
  let m;
  while ((m = rx.exec(t))) palavras.push({ ini: m.index, fim: m.index + m[0].length, txt: m[0] });
  const abreOracao = (i) => {
    const antes = t.slice(0, i).replace(/[\s"“”«»'(\-—]+$/u, "");
    return !antes || /[.!?:;\n]$/.test(antes);
  };
  const maiuscula = palavras.map((p) => /^\p{Lu}/u.test(p.txt) && !abreOracao(p.ini) && p.txt.length > 1);
  palavras.forEach((p, i) => {
    const particula = /^(do|da|de|dos|das|d')$/i.test(p.txt) && maiuscula[i - 1] && maiuscula[i + 1];
    if (maiuscula[i] || particula) apagar(p.ini, p.fim);
  });
  return s;
}

/* ---------------- O ASSUNTO DA FRASE ----------------
   A frase que se lê à procura do que foi PERGUNTADO: sem os nomes
   próprios e, quando a frase pergunta, sem a parte que AGE. "Pago a
   lâmina da feira, prendo-a à cintura e pergunto: «a quantos passos fica
   o Poço?»" (T15) pergunta pela distância — a feira de onde veio a lâmina
   é a ação, e levava o sino das horas e a feira da semana para a
   resposta. Sem pergunta nenhuma, a frase inteira é o assunto: "pago a
   diária" pede o preço tanto quanto "quanto é a diária?" (MM12). */
export function assuntoDaFrase(frase, nomes = [], { nomesProprios = true } = {}) {
  const t = String(frase == null ? "" : frase);
  /* o mercado lê COM os nomes: "a Lâmina de Névoa" é a mercadoria */
  let s = nomesProprios ? semNomesProprios(t, nomes) : norm(t);
  if (!s.trim() || !MARCAS_DE_PERGUNTA.test(norm(t))) return s;
  for (const p of pedacosQueAgem(t)) s = s.slice(0, p.ini) + mascarar(s.slice(p.ini, p.ini + p.txt.length)) + s.slice(p.ini + p.txt.length);
  return s;
}

/* ---------------- AS RESPOSTAS DA MESA ----------------
   Cada ficha (a cidade, a gente, o mercado) devolve as suas linhas com a
   POSIÇÃO do assunto na frase (`em`). Aqui juntam-se pela ordem em que a
   frase as pede — quem pergunta o preço e depois a guarda quer o preço
   primeiro —, sem repetir, até RESPOSTAS_DA_MESA. Três cabem numa taverna
   cheia dentro do teto da pauta (medido em teste-mm14-perguntas); a
   quarta pergunta de uma frase fica para o turno seguinte. */
export const RESPOSTAS_DA_MESA = 3;

export function juntarRespostas(fontes, { maximo = RESPOSTAS_DA_MESA } = {}) {
  const todas = [];
  (Array.isArray(fontes) ? fontes : []).forEach((f, k) => {
    const o = f && typeof f === "object" ? f : {};
    const linhas = Array.isArray(o.pergunta) ? o.pergunta : [];
    const em = Array.isArray(o.em) ? o.em : [];
    linhas.forEach((l, i) => {
      const txt = String(l == null ? "" : l).trim();
      if (txt) todas.push({ txt, pos: Number.isFinite(em[i]) ? em[i] : Infinity, k, i });
    });
  });
  todas.sort((a, b) => a.pos - b.pos || a.k - b.k || a.i - b.i);
  const out = [];
  for (const x of todas) if (!out.includes(x.txt) && out.length < Math.max(0, Number(maximo) || 0)) out.push(x.txt);
  return out;
}
