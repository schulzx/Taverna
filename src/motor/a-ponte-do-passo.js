/* ============================================================
   A PONTE DO PASSO (QC1, 22/11/2026) — src/motor/a-ponte-do-passo.js

   A décima quinta sessão do Mestre vivo (mente/lancamento/mestre-vivo-
   sessao-15.md) mostrou o furo pela raiz: o sistema tinha uma quest
   desenhada («O Livro dos Nomes») e não a contou ao Narrador; o Narrador,
   sem matéria, contou outra. Em todos os 56 turnos a tela mostrou o botão
   «Ir até A Capela do Afogado» (propostas-da-abertura.js, oRumoDaBusca),
   e a pauta só dizia «O PASSO: Saber onde quem lê o livro à noite guarda
   o livro» — a ponte do RUMO veio vazia (abertura.js#proximoPasso lê as
   missões, e num mundo de quests elas não existem), e a linha «falta: ir à
   Capela» era omitida por ser um «algum». A tela sabia o destino e o
   Narrador estava proibido de dizê-lo; inventou um Corvo, uma cripta e uma
   filha flautista, e nada disso virou fato.

   A REGRA: o Narrador nunca sabe menos do que a tela mostra. A ponte é o
   destino do botão — o MESMO objeto de oRumoDaBusca, com as mesmas
   entradas que o App lhe dá —, e quem em cena pode apontar para lá. Nem
   mais: o que há lá dentro, quem guarda o quê e o desfecho continuam
   guardados (a lei «o Narrador nunca vê a verdade eleita antes do turno
   da revelação» não muda).

   Vale para todos, com o Mestre vivo ligado ou não: é só informação que a
   tela já mostra. Entra no RUMO (pauta.js, prio 2,42) como o `{passo}` da
   ponte quando o passo das missões vem vazio — nenhuma secção nova,
   nenhum bloco estático; a campanha antiga (sem esqueleto, sem passos) dá
   a ponte vazia, e a pauta é a de sempre, byte a byte.

     aPonteDoPasso({ passos, aqui, cidade, grupo, emLuta, naEstrada,
                     presentes, sabem }) → string ("" sem destino)
       passos, aqui, cidade, grupo, emLuta, naEstrada: as entradas de
                  oRumoDaBusca, como o App lhas dá (o botão);
       presentes: [nome] — quem está em cena (fora do grupo);
       sabem:     [nome] — a gente do caso que o herói já ouviu (as cartas
                  de pessoa viradas: quemSabeDoCaso).
     quemSabeDoCaso(quadros) → [nome]

   Puro, sem React, sem sorte. Provado em testes/teste-a-quest-manda-na-cena.mjs.
   ============================================================ */
import { oRumoDaBusca } from "../propostas-da-abertura.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const txt = (x) => (typeof x === "string" ? x.replace(/\s+/g, " ").trim() : "");
const chave = (s) => txt(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ---------------- A TABELA ----------------
   Uma frase por `acao` do botão (oRumoDaBusca): {nome} o destino, {cidade}
   a cidade dele. `emCidade`: a cidade, quando o sítio tem uma. `quem`: quem
   em cena pode apontar o caminho. `teto`: o tamanho máximo da ponte (o RUMO
   a embrulha em ~60 caracteres). */
export const A_PONTE_DO_PASSO = Object.freeze({
  ir: "{nome}{emCidade} — é para lá que a pista do caso leva",
  partir: "{nome} — é para lá que a pista do caso leva, pela estrada",
  levar: "{nome} ir junto — é quem o caso pede ao lado do herói",
  emCidade: ", em {cidade}",
  quem: "; {quem} sabe o caminho",
  teto: 200,
});

const encher = (molde, v) => molde.replace(/\{(\w+)\}/g, (_, k) => (v[k] == null ? "" : String(v[k])));

/* a gente do caso que o herói já ouviu: as cartas de pessoa viradas */
export function quemSabeDoCaso(quadros) {
  const out = [];
  for (const q of arr(quadros)) for (const c0 of arr(obj(q) && q.cartas)) {
    const c = obj(c0);
    if (!c || c.estado !== "virada" || c.forma !== "pessoa") continue;
    const n = txt((obj(c.juiz) && c.juiz.nome) || (obj(c.escreve) && c.escreve.nome));
    if (n && !out.some((x) => chave(x) === chave(n))) out.push(n);
  }
  return out;
}

export function aPonteDoPasso(entrada) {
  try {
    const e = obj(entrada) || {};
    const r = oRumoDaBusca({ passos: e.passos, aqui: e.aqui, cidade: e.cidade, grupo: e.grupo, emLuta: e.emLuta, naEstrada: e.naEstrada });
    if (!r || !r.acao || !txt(r.nome)) return "";
    const P = A_PONTE_DO_PASSO;
    const molde = P[r.acao];
    if (!molde) return "";
    const daqui = r.acao === "ir" && txt(r.cidade) && chave(r.cidade) !== chave(r.nome);
    let s = encher(molde, { nome: txt(r.nome), emCidade: daqui ? encher(P.emCidade, { cidade: txt(r.cidade) }) : "" });
    /* quem em cena pode apontar: primeiro quem o caso já fez falar; na
       mesma cidade, quem mais estiver aqui (o sítio é público) */
    const doGrupo = new Set(arr(e.grupo).map((g) => chave(obj(g) ? g.nome : g)).filter(Boolean));
    const aqui = arr(e.presentes).map(txt).filter((n) => n && !doGrupo.has(chave(n)) && chave(n) !== chave(r.nome));
    const sabe = arr(e.sabem).map(txt).find((n) => aqui.some((a) => chave(a) === chave(n)))
      || (r.acao === "ir" ? aqui[0] : "");
    if (sabe) s += encher(P.quem, { quem: sabe });
    return s.length > P.teto ? s.slice(0, P.teto - 1) + "…" : s;
  } catch { return ""; }
}
