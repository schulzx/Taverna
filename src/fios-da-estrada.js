/* ============================================================
   OS FIOS DA ESTRADA (Fase MM, a campanha que prende · item 3) — a
   viagem e a noite do acampamento falam da história, não de outra

   A 4.ª sessão de prova esfria a pique no M22 (mente/mm11-sessao-4.md,
   "Onde e por que a história esfria", pontos 2 e 3): três viagens e um
   acampamento, 36 horas de jogo, que não acrescentam uma frase de
   história — e trazem TRÊS fios novos que nada têm que ver com ela: a
   Câmara do Dragão a pedir auxílio pelo correio (M15), o Torneio das
   Coroas e o pedido de Ondine na manhã do acampamento (M24). O Mestre,
   obrigado a tocá-los, fez Belmira andar 20 km para dizer "o Torneio das
   Coroas mexeu com ela. E contigo?". Fios sem ligação ao herói não são
   tensão: são ruído, e dispersam a única linha que se tinha.

   E o que a estrada tirava das tabelas soltas (`encontros.js`) — "um
   marco de pedra com oferendas recentes", "o trecho passa sem
   sobressaltos" — era cenário de qualquer campanha. O Matt usa a estrada
   para a mesma coisa que usa a taverna: a história anda dentro dela.

   ---------------- O QUE ISTO FAZ ----------------

   1. O TEMA. O encontro de estrada que é cena (o sinal, o viajante, o
      trecho calmo) e a conversa da noite tiram o tema do que a história
      já tem: uma promessa aberta do Narrador (`prometido.js`), a pessoa
      ou o lugar que o fio procura (`escuta.js#fioDaHistoria`). O perigo e
      o achado ficam com a tabela — são mecânica (a criatura do bestiário,
      o espólio rolado), e amarrar um lobo a Noé seria inventar.
   2. O FIO NOVO. Na estrada e no acampamento, um envelope que abre fio
      novo (o correio, o arco maior, a missão gerada, o mural, o boato)
      só entra se se AMARRA a algo que existe: uma pessoa do fio, uma
      promessa aberta, um nome que o App diga (o antagonista). O lugar
      sozinho não amarra — Rio Cinzento é a cidade onde se dorme, não a
      história. O que não amarra fica SEGURO para o App devolver à nota
      depois da chegada, onde a escuta decide como sempre.

   ---------------- SEPARADO DA TELA ----------------

   Conta se prova. Quem rola o encontro, monta o envelope da viagem e o
   do acampamento é o App; aqui se decide o tema e o que entra.
   ============================================================ */

import { tocaOFio } from "./escuta.js";
import { garantirPrometido, TIPOS_DE_SEMENTE } from "./prometido.js";

const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const lista = (x) => (Array.isArray(x) ? x : []);

/* ---------------- DE ONDE VEM O TEMA, POR ORDEM ----------------
   · `promessa_no_fio` — a promessa aberta que toca o fio: é a que aquece
     os dois de uma vez (a carta dos antigos irmãos, a caminho de Noé);
   · `promessa` — outra promessa aberta, a mais pesada e depois a mais
     velha (a ameaça dita pesa mais do que a frase solta);
   · `pessoa_do_fio` — quem a história procura agora;
   · `lugar_do_fio` — para onde a história aponta.
   O tema da vez anterior (`ultimoTema`) cede ao seguinte da lista: duas
   estradas seguidas a falar da mesma coisa é a mesma cena. */
export const ORDEM_DO_TEMA = ["promessa_no_fio", "promessa", "pessoa_do_fio", "lugar_do_fio"];
const pesoDa = (s) => (TIPOS_DE_SEMENTE.find((x) => x.id === s.tipo) || { peso: 0 }).peso;

export function temaDaEstrada(ctx) {
  const c = obj(ctx);
  const fio = lista(c.fio).filter((f) => f && f.nome);
  const abertas = garantirPrometido(c.prometido).sementes
    .filter((s) => s.estado === "aberta")
    .sort((a, b) => (pesoDa(b) - pesoDa(a)) || (a.id - b.id));
  const cands = [];
  for (const s of abertas) if (tocaOFio(`${s.texto} ${s.quem}`, fio)) cands.push({ de: "promessa_no_fio", texto: s.texto, quem: s.quem, id: s.id });
  for (const s of abertas) if (!cands.some((x) => x.id === s.id)) cands.push({ de: "promessa", texto: s.texto, quem: s.quem, id: s.id });
  for (const f of fio) if (f.tipo === "pessoa") cands.push({ de: "pessoa_do_fio", texto: f.nome, quem: f.nome });
  for (const f of fio) if (f.tipo !== "pessoa") cands.push({ de: "lugar_do_fio", texto: f.nome, quem: "" });
  cands.sort((a, b) => ORDEM_DO_TEMA.indexOf(a.de) - ORDEM_DO_TEMA.indexOf(b.de));
  const ult = norm(c.ultimoTema);
  const t = cands.find((x) => norm(x.texto) !== ult) || null;
  if (!t) return null;
  const { id, ...tema } = t;
  return tema;
}

/* ---------------- COMO O TEMA ENTRA NO ENCONTRO ----------------
   Por tipo de encontro (`encontros.js#rolarEncontro`). Só os de CENA; o
   `perigo` e o `achado` não estão aqui e passam como vieram. `{tema}` é a
   promessa ou o nome; o texto é O QUE, o como é do Narrador. */
export const COMO_O_FIO_ENTRA = {
  viajante: "Alguém na estrada traz notícia de {tema} — ouviu, viu ou carrega alguma coisa disso, e quer algo em troca.",
  cena: "Na estrada, um sinal que toca {tema}: um rasto, um objeto, uma marca que só faz sentido a quem segue esse fio. É um gancho, não uma obrigação — descreva e deixe o jogador decidir se investiga.",
  tranquilo: "O trecho passa sem sobressaltos, e a conversa do caminho volta a {tema}: quem anda comigo tem uma lembrança, uma dúvida ou um medo sobre isso.",
};
export const NOITE_DO_ACAMPAMENTO = "A conversa da noite volta a {tema}: {quem} tem uma lembrança, uma dúvida ou um medo sobre isso, e di-lo.";

const encher = (tpl, tema) => tpl.replace("{tema}", tema.de.startsWith("promessa") ? `"${tema.texto}"${tema.quem ? ` (${tema.quem})` : ""}` : tema.texto);

/* Devolve um encontro NOVO com o detalhe tirado do fio, e `tema` (o que
   se usou, para o App guardar como `ultimoTema`); sem tema ou num tipo que
   não é de cena, devolve o encontro como veio. Nunca muta o recebido. */
export function encontroComFio(enc, ctx) {
  const e = obj(enc);
  const tpl = COMO_O_FIO_ENTRA[e.tipo];
  if (!tpl) return { ...e };
  const tema = temaDaEstrada(ctx);
  if (!tema) return { ...e };
  return { ...e, detalhe: encher(tpl, tema), tema };
}

/* A linha a juntar ao envelope do acampamento. `grupo`: nomes de quem
   anda comigo (o primeiro fala). Vazio quando não há tema — e quando não
   há grupo: sozinho não há conversa da noite, e pôr a lembrança na minha
   cabeça seria narrar o que eu sinto, que o prompt proíbe. */
export function linhaDoAcampamento(ctx) {
  const c = obj(ctx);
  const quem = lista(c.grupo).map((x) => String((x && x.nome) || x || "").trim()).filter(Boolean)[0];
  if (!quem) return "";
  const tema = temaDaEstrada(c);
  if (!tema) return "";
  return encher(NOITE_DO_ACAMPAMENTO, tema).replace("{quem}", quem);
}

/* ---------------- O FIO NOVO ----------------
   Os envelopes que abrem fio novo, pelo cabeçalho (os mesmos de
   `escuta.js#EMPURROES` que trazem história de fora: o mural, a missão
   gerada, o arco maior, o boato, a petição do correio). */
export const FIOS_NOVOS = [
  { id: "correio", rx: /^\[CORREIO — PETIÇÃO/ },
  { id: "global", rx: /^\[EVENTO GLOBAL — NOVO ARCO/ },
  { id: "trama", rx: /^\[QUEST GERADA PELO SISTEMA/ },
  { id: "mural", rx: /^\[TRABALHO PREGADO NO MURAL/ },
  { id: "rumor", rx: /^\[RUMOR\]/ },
];

/* O que amarra. A pessoa do fio e a promessa aberta (a sua pessoa, dita
   INTEIRA, ou `palavrasDaPromessa` palavras de `letras` ou mais em comum
   com ela) e os nomes que o App der amarram; o lugar sozinho não — a cidade
   onde se dorme não é a história. A pessoa da promessa casa inteira, e não
   pelo primeiro nome, porque o Cronista escreve-a muitas vezes como
   descrição: na primeira prova "a mulher de capa verde" amarrava Ondine,
   "anão mulher", pela palavra "mulher". */
export const O_QUE_AMARRA = { pessoa: true, promessa: true, nome: true, lugar: false, palavrasDaPromessa: 2, letras: 5 };

const palavras = (t) => new Set(norm(t).replace(/[^a-z0-9 ]/g, " ").split(" ").filter((w) => w.length >= O_QUE_AMARRA.letras));
const dizInteiro = (t, nome) => {
  const n = norm(nome).replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  return !!n && (" " + norm(t).replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ") + " ").includes(" " + n + " ");
};

export function amarraDoFio(texto, ctx) {
  const c = obj(ctx);
  const t = String(texto == null ? "" : texto);
  if (!norm(t)) return null;
  const fio = lista(c.fio).filter((f) => f && f.nome && (f.tipo === "pessoa" ? O_QUE_AMARRA.pessoa : O_QUE_AMARRA.lugar));
  const f = fio.find((x) => tocaOFio(t, [x]));
  if (f) return f.nome;
  if (O_QUE_AMARRA.promessa) {
    const P = palavras(t);
    for (const s of garantirPrometido(c.prometido).sementes.filter((x) => x.estado === "aberta")) {
      if (s.quem && dizInteiro(t, s.quem)) return s.texto;
      let comum = 0;
      for (const w of palavras(s.texto)) if (P.has(w)) comum++;
      if (comum >= O_QUE_AMARRA.palavrasDaPromessa) return s.texto;
    }
  }
  if (O_QUE_AMARRA.nome) {
    const n = lista(c.nomes).map((x) => String(x || "").trim()).filter(Boolean).find((x) => tocaOFio(t, [{ nome: x, tipo: "pessoa" }]));
    if (n) return n;
  }
  return null;
}

/* `envelopes`: os pedaços da nota (strings). `ctx`: { naEstrada (em
   viagem ou acampado), fio, prometido, nomes }. Fora da estrada tudo
   fica. Na estrada, o fio novo que amarra fica com a amarra dita; o que
   não amarra é seguro (o App devolve-o à nota depois da chegada). Nunca
   muta. Devolve { ficam, seguram, amarrados }. */
export function fiosNovosNaEstrada(envelopes, ctx) {
  const c = obj(ctx);
  const env = lista(envelopes).map((x) => String(x == null ? "" : x)).filter((x) => x.trim());
  if (!c.naEstrada) return { ficam: env, seguram: [], amarrados: [] };
  const ficam = [], seguram = [], amarrados = [];
  for (const e of env) {
    const novo = FIOS_NOVOS.find((f) => f.rx.test(e.trimStart()));
    if (!novo) { ficam.push(e); continue; }
    const a = amarraDoFio(e, c);
    if (!a) { seguram.push(e); continue; }
    amarrados.push({ id: novo.id, amarra: a });
    ficam.push(`${e}\nIsto amarra-se a ${a}: traga-o por aí, e não como assunto à parte.`);
  }
  return { ficam, seguram, amarrados };
}
