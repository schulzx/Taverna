/* ============================================================
   O BATISMO (S7b, 17/11/2026) — src/motor/o-batismo.js

   A prova jogada de 16/11 (IA real): fora da cidade o Narrador pôs na
   estrada «um vulto baixo» e, quando o jogador perguntou o nome, batizou-o
   — «Me chamo Fendrel» —, e o vulto agiu em dois turnos sem o sistema
   saber quem era. A memória do inventado (memoria-do-inventado.js) só veta
   no turno SEGUINTE, e só nome com epíteto; o batismo já tinha acontecido.

   A REGRA DE MESA: o nome é do sistema, e chega ANTES do Narrador. Quando a
   frase do jogador pergunta o nome de alguém («Como você se chama?», «Qual
   o seu nome?», «Quem é você?») e não há ninguém com nome em cena para
   responder, o sistema escala um figurante por semente — nome, ofício e
   género, como o elenco do lugar (elenco-do-lugar.js) faz —, põe-no no
   registo, no sítio onde o herói está (logo em cena, pela conta única de
   quem-esta-aqui.js), e a pauta diz ao Narrador quem ele é pelo canal dos
   vetos (`naoPode`): o Narrador não batiza.

   Puro, sem React, sem Math.random (a sorte é rngDe). Provado em
   testes/teste-poda-do-ausente.mjs (secção do batismo).
   ============================================================ */
import { rngDe } from "../geografia.js";
import { nomePessoa } from "../nomes.js";
import { quemAgeAqui } from "../quem-esta-aqui.js";

const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const sem = (x) => str(x).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const nomeDe = (x) => str(ehObj(x) ? x.nome : x).trim();

/* ---------------- A TABELA ----------------
   `perguntas`: a frase (sem acento, minúscula) que pede o nome a quem está
   à frente — nunca o nome de uma coisa («qual o nome desta taverna?») nem
   de um terceiro («quem é aquele homem?»: menção não é presença).
   `oficios`: o figurante por onde o herói está, [homem, mulher]. `linha`:
   o que vai ao `naoPode` da pauta. */
export const O_BATISMO = Object.freeze({
  perguntas: Object.freeze([
    /\bcomo (?:e que )?(?:voce|vc|tu|o senhor|a senhora|vos) (?:se chama|te chamas|chamas|se chamam)\b/,
    /\bcomo te chamas\b/,
    /\bcomo (?:e que )?se chama\s*\?/,
    /\bqual (?:e )?(?:o )?(?:seu|teu|vosso) nome\b/,
    /\b(?:diga|diz|diga-me|diz-me|me diga|me diz|fala|me fala)(?: (?:me|-me))? (?:o )?(?:seu|teu) nome\b/,
    /\bquem (?:e|es|sao) (?:voce|vc|tu|voces|vos)\b/,
    /\b(?:seu|teu) nome\s*\?/,
  ]),
  oficios: Object.freeze({
    fora: Object.freeze(["andarilho", "andarilha"]),
    masmorra: Object.freeze(["prisioneiro", "prisioneira"]),
    cidade: Object.freeze(["morador", "moradora"]),
  }),
  tentativas: 24,
  deOnde: "batismo",
  relacao: "desconhecido",
  linha: (nome, rotulo) => `dar outro nome a quem o herói perguntou: ele se chama ${nome}${rotulo ? `, ${rotulo}` : ""}; diga este nome`,
  porque: "o nome de quem o herói conhece é do sistema: o Narrador não batiza",
});

/* a frase pergunta o nome de quem está à frente? */
export function perguntaONome(frase) {
  const f = sem(frase);
  if (!f) return false;
  return O_BATISMO.perguntas.some((rx) => rx.test(f));
}

/* ============================================================
   oBatismo(frase, ctx) → null | { nome, rotulo, genero, local, linha, ficha }
   ctx: { quem (quemEstaAqui), semente, cidade, lugar (o nome do sítio),
   dia, genero (o do mundo, para os nomes), lex, usados: [nome], aVista:
   [nome] (quem a tela já mostra com nome), generoDaProsa ("homem"|"mulher":
   o vulto que a prosa apresentou), turno }.
   Só batiza com a pergunta e sem ninguém com nome para responder: o grupo
   não conta (ele já tem nome), o posto, o passo e quem está à vista contam.
   ============================================================ */
export function oBatismo(frase, ctx) {
  if (!perguntaONome(frase)) return null;
  const c = ehObj(ctx) ? ctx : {};
  const q = ehObj(c.quem) ? c.quem : {};
  const grupo = new Set(arr(q.grupo).map(sem));
  let aqui = [];
  try { aqui = quemAgeAqui(q).map(nomeDe); } catch { aqui = []; }
  /* na rua da cidade, o registo inteiro é «plausível» (quemAgeAqui): só conta
     quem o posto, o passo ou a tela põem à frente */
  const responde = (q.noSitio || q.fora || !str(c.cidade)) ? aqui : [...arr(q.doSitio), ...arr(q.doPasso)].map(nomeDe);
  const comNome = [...responde, ...arr(c.aVista).map(nomeDe)].filter((n) => n && !grupo.has(sem(n)) && sem(n) !== sem(nomeDe(c.heroi)));
  if (comNome.length) return null;
  const onde = q.fora ? "fora" : (ehObj(c.masmorra) || c.masmorra === true) ? "masmorra" : "cidade";
  const oficio = O_BATISMO.oficios[onde];
  const rnd = rngDe(`${str(c.semente)}|batismo|${sem(c.cidade)}|${sem(c.lugar)}|${str(c.dia)}`);
  const mulher = c.generoDaProsa === "mulher" ? true : c.generoDaProsa === "homem" ? false : rnd() < 0.5;
  const ja = new Set(arr(c.usados).map((u) => sem(nomeDe(u)).split(" ")[0]).filter(Boolean));
  for (let i = 0; i < O_BATISMO.tentativas; i++) {
    let nome = "";
    try { nome = nomePessoa(str(c.genero) || undefined, mulher ? "fem" : "masc", rnd, c.lex || null); } catch { nome = ""; }
    const p = sem(nome).split(" ")[0];
    if (!p || ja.has(p)) continue;
    const rotulo = oficio[mulher ? 1 : 0];
    const genero = mulher ? "mulher" : "homem";
    const local = str(c.lugar).trim() || str(c.cidade).trim();
    return {
      nome, rotulo, genero, local, deOnde: O_BATISMO.deOnde,
      linha: O_BATISMO.linha(nome, rotulo),
      ficha: { nome, papel: rotulo, genero, local, relacao: O_BATISMO.relacao, status: "vivo", ...(Number.isFinite(Number(c.dia)) ? { conhecidoEm: Number(c.dia) } : {}) },
    };
  }
  return null;
}
