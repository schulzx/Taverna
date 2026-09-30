/* ============================================================
   A PALAVRA DADA (Fase MM, MM14 · 30/09) — o que a heroína prometeu

   "[O PASSADO VOLTA] alguém vem cobrar o que você disse que faria" chegou
   duas vezes na sessão de prova (MM11, T11 e T15), e a jogadora escreveu
   no J16: "Eu não prometi nada a ninguém, Teodoro." Tinha razão. O fio
   da memória (`mestria.js`, FIOS_DA_MEMORIA "promessa") recebia como
   "promessa aberta" o TÍTULO DA PRIMEIRA MISSÃO ATIVA — e as missões
   ativas daquela sessão eram a principal e as tramas que o sistema forçou
   ("O lance em O Sino Calado"). O Teodoro cobrou, no M15, um lance que a
   heroína nunca aceitou: "Você não esqueceu o que disse que faria."

   A mesma leitura alimentava a intenção "cobrar o que prometi" das
   tramas (`temPromessaAberta`): uma missão forçada chamava outra "nascida
   de uma coisa que o herói prometeu".

   ---------------- O QUE É UMA PROMESSA ----------------

   Uma frase DA HEROÍNA (o que a jogadora escreveu — nunca o que o
   Narrador narra), DIRIGIDA A ALGUÉM, COM COMPROMISSO:
     · o compromisso é o verbo no presente, na primeira pessoa: "prometo",
       "juro", "dou-te a minha palavra", "tens a minha palavra", "palavra
       de honra". Não qualquer futuro: "vou à torre" é um plano;
     · dirigida: dita em voz alta (entre aspas, ou depois de "digo:"), ou
       com o destinatário na frase ("prometo-te", "juro à Rosalina");
     · a peneira da declaração (`peneira.js`) apaga o que não é
       declaração — a pergunta ("prometes?"), a negação ("não prometo
       nada", "eu não prometi nada a ninguém"), a hipótese ("talvez
       prometa"), o passado ("prometi-lhe, ontem"). É a mesma peneira que
       decide se um "ataco" é um ataque;
     · jurar que uma coisa É verdade ("juro que não fui eu") não é
       prometer, e prometer a si mesma não tem quem venha cobrar.

   A régua é a do portão (o portão morde só o necessário): uma promessa
   que escapa custa um fio que não se puxa; uma promessa inventada custa
   uma cena — e foi essa que a sessão viu.

   ---------------- SEM CAMPO NOVO NO SAVE ----------------

   A memória é o que a heroína já disse: as mensagens da jogadora, que o
   save guarda desde sempre. `promessaEmAberto` olha as últimas
   `PALAVRA_DADA.janela` e devolve a mais recente. Não se sabe se foi
   cumprida — por isso a janela, e o fio da memória já não repete o mesmo
   fio dentro dos três últimos.
   ============================================================ */

import { soODeclarado } from "./peneira.js";

const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* As regras, em texto sem acentos e em minúsculas (a forma da peneira). */
export const PALAVRA_DADA = {
  /* o compromisso: primeira pessoa, presente */
  compromisso: [
    /\b(prometo|juro)\b/,
    /\b(dou|empenho)(-(te|lhe|lhes|vos))? (a )?(minha )?palavra\b/,
    /\b(tens|tem|tendes|teras|tera) (a )?(minha )?palavra\b/,
    /\bpalavra de honra\b/,
  ],
  /* a quem, quando não é dito em voz alta: o pronome colado ou antes do
     verbo, "tens a minha palavra", ou "a/ao/para Fulano" logo depois */
  destinatario: [
    /\b(prometo|juro|dou|empenho)-(te|lhe|lhes|vos)\b/,
    /\b(te|lhe|lhes|vos) (prometo|juro|dou|empenho)\b/,
    /\b(tens|tem|tendes|teras|tera) (a )?(minha )?palavra\b/,
    /\b(prometo|juro|palavra) (a|ao|aos|as|para) (?!mim\b|si\b|mim mesm|ninguem\b)\p{L}{2,}/u,
  ],
  /* jurar que é verdade não é prometer */
  juraDeVerdade: /\b(prometo|juro)\b[^.!?;]{0,40}?\bque (eu )?(nao )?(fui|foi|era|estava|estive|sabia|sei|vi|fiz|disse|menti|conheco|conhecia|tive|roubei|matei)\b/,
  /* a si mesma: ninguém vem cobrar */
  aSiMesma: /\b(a mim mesm[oa]|para mim mesm[oa]|comigo mesm[oa]|penso|pensei|em pensamento|para os meus botoes)\b/,
  /* os verbos que põem a fala na boca sem aspas ("digo: prometo") */
  verbosDeFala: ["digo", "falo", "grito", "respondo", "sussurro", "murmuro", "declaro", "aviso", "juro"],
  /* quantas mensagens da heroína se olham para trás */
  janela: 40,
  /* o tamanho da frase que vai ao fio */
  teto: 140,
};

const casa = (lista, s) => lista.some((rx) => { try { return rx.test(s); } catch { return false; } });

/* As falas em voz alta: o que está entre aspas, e o que vem depois de
   "digo:" sem aspas. { ini, txt } sobre o texto normalizado. */
function falas(t) {
  const out = [];
  const rx = /["“«]([^"“”«»]*)["”»]/g;
  let m;
  while ((m = rx.exec(t))) out.push({ ini: m.index + 1, txt: m[1] });
  const rxDiz = new RegExp(`\\b(${PALAVRA_DADA.verbosDeFala.join("|")})\\s*(:|—)\\s*(?!["“«])`, "g");
  while ((m = rxDiz.exec(t))) {
    const ini = m.index + m[0].length;
    const fim = t.slice(ini).search(/["“«]/);
    out.push({ ini, txt: fim < 0 ? t.slice(ini) : t.slice(ini, ini + fim) });
  }
  return out;
}

/* A oração que contém a posição `i` do texto `s`. */
function oracaoEm(s, i) {
  let a = i, b = i;
  while (a > 0 && !/[.!?;\n]/.test(s[a - 1])) a--;
  while (b < s.length && !/[.!?;\n]/.test(s[b])) b++;
  return { a, b };
}

function primeiroCompromisso(d) {
  let melhor = -1;
  for (const rx of PALAVRA_DADA.compromisso) {
    const m = new RegExp(rx.source, rx.flags.replace("g", "")).exec(d);
    if (m && (melhor < 0 || m.index < melhor)) melhor = m.index;
  }
  return melhor;
}

/* A promessa de UMA frase da heroína, ou null. Devolve { frase, falada }
   — `frase` é a oração da promessa, com os acentos da jogadora. */
export function promessaDaFrase(texto) {
  const orig = String(texto == null ? "" : texto);
  if (!orig.trim()) return null;
  const t = norm(orig);
  if (PALAVRA_DADA.aSiMesma.test(t)) return null;
  const mesmoTamanho = t.length === orig.length;
  const devolve = (ini, a, b, falada) => {
    const frase = (mesmoTamanho ? orig : t).slice(ini + a, ini + b).trim().replace(/^[\s"“”«»:—-]+|[\s"“”«»]+$/g, "");
    return frase ? { frase: frase.slice(0, PALAVRA_DADA.teto), falada } : null;
  };
  /* 1) em voz alta: a fala já é dirigida a quem a ouve */
  for (const f of falas(t)) {
    let d = "";
    try { d = soODeclarado(f.txt); } catch { d = ""; }
    const i = primeiroCompromisso(d);
    if (i < 0) continue;
    const { a, b } = oracaoEm(d, i);
    if (PALAVRA_DADA.juraDeVerdade.test(d.slice(a, b))) continue;
    const r = devolve(f.ini, a, b, true);
    if (r) return r;
  }
  /* 2) declarada, fora da fala: precisa de destinatário */
  let d = "";
  try { d = soODeclarado(orig); } catch { d = ""; }
  const i = primeiroCompromisso(d);
  if (i < 0) return null;
  const { a, b } = oracaoEm(d, i);
  const oracao = d.slice(a, b);
  if (PALAVRA_DADA.juraDeVerdade.test(oracao)) return null;
  if (!casa(PALAVRA_DADA.destinatario, oracao)) return null;
  return devolve(0, a, b, false);
}

/* A promessa mais recente da heroína nas mensagens da mesa, ou "". Só as
   da jogadora contam (`autor: "jogador"`); as do Mestre e do sistema,
   nunca. `mensagens`: a lista do save, na ordem em que aconteceram. */
export function promessaEmAberto(mensagens, { janela = PALAVRA_DADA.janela } = {}) {
  const ms = Array.isArray(mensagens) ? mensagens : [];
  let vistas = 0;
  for (let k = ms.length - 1; k >= 0 && vistas < janela; k--) {
    const m = ms[k];
    if (!m || m.autor !== "jogador" || typeof m.texto !== "string") continue;
    vistas++;
    const p = promessaDaFrase(m.texto);
    if (p) return p.frase;
  }
  return "";
}
