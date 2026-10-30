/* corpus-do-juiz.mjs (28/10/2026) — o corpus rotulado do Juiz, montado uma vez

   O que o sistema sabia em cada turno das sessões 8 a 10, do disco, e os
   excertos da 6.ª, 7.ª e 11.ª: os casos de testes/juiz-rotulado.json com o
   estado de cada um. Morava dentro de teste-juiz-de-fidelidade.mjs; saiu
   para cá quando a suíte da correção (teste-correcao-do-juiz.mjs) passou a
   medir sobre os MESMOS casos — duas cópias da montagem dariam duas réguas,
   e a meta do Juiz (≥ 90% apanhados, ≤ 5% de falsos) é desta. Um caminho só.

   Não é suíte (não tem «teste-» no nome): o rodar-tudo não o corre sozinho. */
import fs from "node:fs";
import { oQueAPautaSabe } from "../src/juiz-de-fidelidade.js";
import { oQueExisteAqui, masmorrasDoMundo } from "../src/mundo-base.js";

const ler = (f) => JSON.parse(fs.readFileSync(new URL("./" + f, import.meta.url), "utf8"));
export const sem = (s) => String(s == null ? "" : s).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export const J = ler("juiz-rotulado.json");
export const RC = ler("registo-s8-s10-cronista.json");
const R10 = ler("registo-s10-cena.json");
export const H9 = ler("registo-s9-historia.json");
const P8 = ler("registo-s8-pauta.json");

/* ---------------- o que o sistema sabia, do disco ---------------- */

/* a 9.ª: o mundo refeito pela semente do save (as cidades, os locais e a
   gente de cada um, as masmorras, as guildas, as regiões) */
const MUNDO9 = (() => {
  const s = H9.espinha.semente, gen = H9.campanha.genero, mol = H9.campanha.molde, lex = H9.campanha.lexico;
  const gente = [], lugares = [], papeis = [];
  for (const c of H9.mapa.cidades) {
    lugares.push(c.nome, c.regiao, c.continente);
    const o = oQueExisteAqui(s, H9.mapa, c.nome, H9.baseMundo, gen, mol, lex);
    for (const l of o.locais) lugares.push({ nome: l.nome, tipo: l.tipo }, l.chamado);
    for (const g of o.gente) { gente.push(g.nome); papeis.push(g.papel); }
  }
  for (const m of masmorrasDoMundo(s, H9.mapa)) lugares.push(m.nome);
  for (const g of H9.guildas) { lugares.push(g.nome); gente.push(g.mestre, ...(g.membros || []).map((x) => x.nome)); }
  for (const r of H9.mapa.regioes || []) lugares.push(r.nome);
  gente.push(...Object.keys(H9.npcs), ...(H9.personagem.grupo || []).map((x) => x.nome), H9.espinha.fio.antagonista);
  return { gente: gente.filter(Boolean), lugares: lugares.filter(Boolean), papeis };
})();

/* a 10.ª: o núcleo, o registo de gente e, turno a turno, o EM CENA da pauta gravada */
const nomesDoEmCena = (s) => String(s || "").replace(/a quem não tem nome:/, "·").split(/[·;]/).map((x) => x.replace(/\((?:ele|ela)\)/g, "").trim()).filter(Boolean);
const PAUTA10 = (k) => {
  const out = { gente: [], lugares: [] };
  for (let i = 0; i <= k && i < R10.pautas.length; i++) {
    const pa = R10.pautas[i];
    out.gente.push(...nomesDoEmCena(pa.emCena), ...(pa.presentes || []).map((x) => x.nome), ...(pa.longe || []));
    out.lugares.push(pa.cidade, ...(String(pa.onde || "").match(/\(([^)]+)\)/) || []).slice(1));
  }
  return out;
};
/* as 16 pautas inteiras do fim da 10.ª: a frase do jogador é a última linha */
const HIST10 = new Map();
for (const h of RC.historico) {
  const frase = h.trim().split("\n").pop().trim();
  const turno = RC.turnos.find((x) => x.ses === "s10" && x.frase && x.frase.trim() === frase && !HIST10.has(x.k));
  if (turno) HIST10.set(turno.k, h);
}
/* a 8.ª: as pautas dos confrontos e a revelação */
const PAUTA8 = new Map(P8.confrontos.map((c) => [c.m - 1, c.pauta.texto]));
const GENTE8 = [P8.revelacao, ...P8.confrontos.map((c) => c.pauta.texto)].flatMap((x) => oQueAPautaSabe(x).gente);

const doRegisto = (ses) => RC.turnos.filter((x) => x.ses === ses);

export function estadoDoTurno(ses, k) {
  const S = J.sessoes[ses], M = S.mundo, turnos = doRegisto(ses), tt = turnos[k];
  const extra = J.turnos[`${ses}#${k}`] || {};
  /* as narrações de antes, todas: o que uma já disse não é invenção nova
     (conta-se a primeira vez, como as sessões contavam) */
  const antes = turnos.slice(0, k).map((x) => x.narrativa);
  /* o nome que o Mestre inventou só é do sistema DEPOIS de dito: o
     `conhecidos` do registo é o do Cronista a ler aquela narração, e às
     vezes já traz o nome que ela mesma inventou (Varek, M64) */
  const fora = new Set((S.inventados || []).map(sem));
  const jaDito = (n) => antes.some((a) => sem(a).includes(n));
  const tira = (xs) => xs.filter((x) => { const n = sem(typeof x === "string" ? x : x && x.nome); return !fora.has(n) || jaDito(n); });
  let gente = [...M.gente, ...(tt.conhecidos || [])], lugares = [...M.lugares], papeis = [], emCena = [];
  if (ses === "s9") { gente.push(...MUNDO9.gente); lugares.push(...MUNDO9.lugares); papeis = MUNDO9.papeis; }
  if (ses === "s10") {
    const pa = PAUTA10(k), aqui = R10.pautas[k] || {};
    gente.push(...R10.nucleo.pessoas.map((x) => x.nome), ...Object.keys(R10.npcs), ...pa.gente);
    lugares.push(...pa.lugares);
    emCena = [...nomesDoEmCena(aqui.emCena), ...(aqui.presentes || []).map((x) => x.nome)];
  }
  if (ses === "s8") gente.push(...GENTE8);
  return {
    frase: tt.frase || "", antes,
    moeda: S.moeda, heroi: S.heroi, grupo: S.grupo,
    gente: tira(gente), emCena: tira(emCena), lugares: tira(lugares), papeis,
    mercado: [...M.mercado, ...(extra.mercado || [])], valores: [...(M.valores || []), ...(extra.valores || [])],
    distancias: [...M.distancias, ...(extra.distancias || [])], tempos: [...(M.tempos || []), ...(extra.tempos || [])],
    fatos: extra.fatos || [],
    pauta: (ses === "s10" && HIST10.get(k)) || (ses === "s8" && PAUTA8.get(k)) || undefined,
  };
}

/* ---------------- os casos ---------------- */

export const chave = (ses, k) => `${ses}#${k}`;
const deFora = new Set([...J.marginais, ...J.contestados, ...J.foraDoAlcance].filter((x) => x.classe !== "armado" && x.classe !== "horaDoDia" && x.classe !== "consequencia").map((x) => chave(x.ses, x.k)));
const comRotulo = new Set(J.rotulos.map((r) => chave(r.ses, r.k)));
export const casos = [];
for (const ses of ["s8", "s9", "s10"]) {
  doRegisto(ses).forEach((tt, k) => {
    const c = chave(ses, k);
    casos.push({ id: c, prosa: tt.narrativa, estado: estadoDoTurno(ses, k), rotulos: J.rotulos.filter((r) => chave(r.ses, r.k) === c), limpo: !comRotulo.has(c) && !deFora.has(c) });
  });
}
for (const e of J.excertos) casos.push({ id: e.id, prosa: e.prosa, estado: { ...e.estado, frase: e.frase || "" }, rotulos: e.rotulos, limpo: !e.rotulos.length });

export const CLASSES = ["precosInventados", "distanciasFora", "pessoasNovas", "nomesNovos", "lugaresNovos"];
export const apanhou = (v, r) => {
  if (r.classe === "pautaCumprida") return !!(v.pautaCumprida && v.pautaCumprida.faltaram.length);
  const alvo = sem(r.trecho);
  return (r.aceita || [r.classe]).some((cl) => (v[cl] || []).some((a) => sem(a.trecho).includes(alvo) || alvo.includes(sem(a.nome || "")) && a.nome));
};

/* ---------------- a 13.ª, fora do corpus (29/10/2026) ----------------
   A primeira sessão julgada pelo Juiz DEPOIS de ele existir: 23 respostas,
   18 achados no jogo, 2 verdadeiros (mente/sessao-13.md §2). Fica à parte
   dos `casos` de propósito — a régua de lá (≥ 90% apanhados, ≤ 5% de
   falsos) é a das sessões 6–11, e esta mede outra coisa: a PRECISÃO num
   corpus que o Juiz nunca viu (≥ 80% dos achados verdadeiros, os 2
   apanhados). O estado de cada turno é o de J.s13 (o `origem` diz de onde
   vem cada campo); `semMapa` tira as distâncias do mapa, que a entrada do
   jogo ainda não levava — é assim que se refaz o que o jogo acusou. */
export function estadoDe13(v, { semMapa = false } = {}) {
  const S = J.s13, tt = S.turnos[v];
  return {
    frase: tt.frase || "",
    antes: S.turnos.slice(Math.max(0, v - 6), v).map((x) => x.prosa),
    moeda: S.moeda, heroi: S.heroi, grupo: S.grupo,
    gente: S.gente, outros: S.outros, lugares: S.lugares, papeis: S.papeis, inventario: S.inventario, nomesAMao: S.nomesAMao,
    mercado: [], valores: [], bolsa: tt.bolsa,
    ...(semMapa ? {} : { distancias: (S.mapa[tt.de] || []).map((d) => ({ ...d, doMapa: true })) }),
    pauta: tt.pauta || "",
  };
}
export const casos13 = J.s13.turnos.map((tt) => ({ id: `s13#${tt.v}`, prosa: tt.prosa, estado: estadoDe13(tt.v), rotulos: tt.rotulos, falsos: tt.falsosDoJogo || [], artefactos: J.s13.artefactos.filter((a) => a.v === tt.v) }));
