/* ============================================================
   O CAMINHO ALCANÇÁVEL (23/11/2026) — src/o-caminho-alcancavel.js

   A décima sétima sessão do Mestre vivo (mente/lancamento/mestre-vivo-
   sessao-17.md, §1 e ponto 2): o passo 3 de «As Chaves da Guarda» pedia
   `derrotou(servo)` OU `consultou(capitao)` + `descobriu(quartel)`. O servo
   é do vilão (papel `de: "fio"`), e o herói não o tinha visto: o texto do
   passo só dizia a alcunha («Tirar quem paga a guarda por baixo da mesa»),
   e nem a tela nem o Narrador diziam o outro caminho — perguntar ao capitão
   e revirar o quartel. 14 frases perdido.

   A REGRA: quando o alvo direto do passo está escondido (quem o herói ainda
   não viu), o passo aponta o caminho que a PRÓPRIA condição oferece e que o
   herói pode seguir: quem consultar, onde vasculhar. O escondido continua
   sem nome — o caminho é feito só dos ramos que não passam por ele. Vale
   para todo passo com alternativa (`algum`, `pelo_menos`), não só para esta
   quest, e com o Mestre vivo ligado ou não (é o que a tela já mostra).

     oCaminhoAlcancavel(falta, { escondido, papeis }) → null | {
       passos: [{ predicado, tipo, nome, papel, id, onde?, cidade? }],
       texto  — «perguntar a Brannoc e vasculhar Balcão do Degrau»
     }
     `falta`: a de julgarEtapa / estadoDaQuest; `escondido(atomo)` → true
     quando o átomo aponta quem o herói ainda não pode procurar; `papeis`:
     os do registo da quest (a casa e a cidade de cada pessoa).
     Sem escondido, ou sem ramo alcançável: null (o passo é o de sempre).

   Puro, sem React, sem sorte. Provado em testes/teste-a-historia-depois-da-17.mjs.
   ============================================================ */

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const txt = (x) => (typeof x === "string" ? x.replace(/\s+/g, " ").trim() : "");

/* ---------------- A TABELA ----------------
   `verbos`: a frase de cada predicado do caminho ({nome} o alvo); o
   predicado que não está aqui não entra no caminho (não é coisa que se
   possa fazer de propósito). `junta`: entre os passos. `teto`: o tamanho
   máximo do texto (vai à linha «O PASSO» da pauta e à ponte). */
export const O_CAMINHO_ALCANCAVEL = Object.freeze({
  verbos: Object.freeze({
    consultou: "perguntar a {nome}",
    conversou: "falar com {nome}",
    conheceu: "conhecer {nome}",
    acompanha: "levar {nome} junto",
    descobriu: "vasculhar {nome}",
    esteve: "ir até {nome}",
    esta_em: "estar em {nome}",
    tem: "conseguir {nome}",
  }),
  junta: " e ",
  teto: 140,
});

/* os átomos de uma falta, pelos combinadores adentro (o veto fica de fora) */
function atomos(falta, out = []) {
  for (const f of arr(falta)) {
    const x = obj(f);
    if (!x) continue;
    if (x.predicado === "algum" || x.predicado === "pelo_menos") { for (const o of arr(x.opcoes)) atomos(o, out); continue; }
    if (x.predicado === "nenhum" || !x.predicado || x.invalida || x.reservado || x.desconhecido) continue;
    out.push(x);
  }
  return out;
}

const alvo = (at) => obj(arr(obj(at) && at.args)[0]);
const seguivel = (at) => !!(O_CAMINHO_ALCANCAVEL.verbos[at.predicado] && alvo(at) && txt(alvo(at).nome));

export function oCaminhoAlcancavel(falta, opcoes) {
  try {
    const o = obj(opcoes) || {};
    const esc = typeof o.escondido === "function" ? o.escondido : () => false;
    const oculto = (at) => { try { return !!esc(at); } catch { return false; } };
    const todos = atomos(falta);
    if (!todos.some(oculto)) return null;
    const escolhidos = [];
    let desviou = false;
    for (const f of arr(falta)) {
      const x = obj(f);
      if (!x) continue;
      if (x.predicado === "algum" || x.predicado === "pelo_menos") {
        const ops = arr(x.opcoes).map((op) => atomos(op));
        if (!ops.some((as) => as.some(oculto))) continue;
        /* os ramos que não passam pelo escondido, e que se podem fazer */
        const boas = ops.filter((as) => as.length && !as.some(oculto) && as.every(seguivel));
        const quantos = x.predicado === "pelo_menos" ? Math.max(1, (Number(x.precisa) || 1) - (Number(x.tem) || 0)) : 1;
        if (boas.length < quantos) continue;
        for (const as of boas.slice(0, quantos)) escolhidos.push(...as);
        desviou = true;
        continue;
      }
      /* o átomo solto é obrigatório: entra se se pode seguir e não é o escondido */
      if (x.predicado && !oculto(x) && seguivel(x)) escolhidos.push(x);
    }
    if (!desviou || !escolhidos.length) return null;
    const papeis = obj(o.papeis) || {};
    const vistos = new Set();
    const passos = [];
    for (const at of escolhidos) {
      const a = alvo(at);
      const k = `${at.predicado}|${txt(a.nome).toLowerCase()}`;
      if (vistos.has(k)) continue;
      vistos.add(k);
      const pp = obj(papeis[a.papel]) || {};
      passos.push(Object.freeze({
        predicado: at.predicado, tipo: String(a.tipo || ""), nome: txt(a.nome), papel: String(a.papel || ""), id: String(a.id || ""),
        ...(txt(pp.local) ? { onde: txt(pp.local) } : {}),
        ...(txt(pp.cidade) ? { cidade: txt(pp.cidade) } : {}),
      }));
    }
    const T = O_CAMINHO_ALCANCAVEL;
    let texto = passos.map((p) => T.verbos[p.predicado].replace(/\{nome\}/g, p.nome)).join(T.junta);
    if (texto.length > T.teto) texto = `${texto.slice(0, T.teto - 1).trimEnd()}…`;
    return Object.freeze({ passos: Object.freeze(passos), texto });
  } catch { return null; }
}
