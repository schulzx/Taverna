/* ============================================================
   O TORNEIO (v9.216) — a chave de oito

   O prato de competição da Noite, e a leitura honesta do battle royale
   que o jogador pediu: o campo encolhe até sobrar um. Oito lutadores —
   o pronto do jogador e os outros sete pilotados pela casa —, chave
   sorteada pela semente e VISÍVEL (chave de torneio é para se ver: o
   veredito antes do clique), três fases: quartas, semifinal, final.

   ---------------- AS CHAVES QUE CORREM SOZINHAS ----------------

   As lutas do jogador acontecem na mesa de verdade (o combate normal do
   jogo, com o rival projetado — isso é fiação do App, no M6). As lutas
   rival×rival deste módulo correm por SIMULAÇÃO na arena (arena.js), e
   chegam ao acampamento como notícia: "O Punho quebrou A Flecha em duas
   quedas". O campo encolhe de verdade, e ninguém digitou nada.

   ---------------- ELIMINADO ≠ ABANDONADO ----------------

   Se o jogador cai, a chave não morre com ele: `epilogar` simula o resto
   e conta quem levantou o cinto — o veredito da eliminação tem epílogo,
   e o recomeço é um clique (fiação do App).

   Conta se prova: a chave inteira roda em Node sem jogador nenhum
   (simularTorneioInteiro), sempre termina, sempre com um campeão, sempre
   o MESMO campeão para a mesma semente.
   ============================================================ */

import { PRONTOS, prontoPorId } from "./prontos.js";
import { duelarProntos } from "./arena.js";

/* ---------------- O SORTEIO DA CHAVE ----------------
   Embaralhamento determinístico dos oito pela semente. */
function sorteDa(semente) {
  let h = 2166136261;
  const s = String(semente || "torneio");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  let k = h >>> 0;
  return () => { k = (Math.imul(k, 1103515245) + 12345) >>> 0; return (k >>> 8) / 16777216; };
}

export const FASES = ["quartas", "semifinal", "final"];

export function criarTorneio({ semente = "torneio", meuPronto = "muralha" } = {}) {
  const meu = prontoPorId(meuPronto) ? meuPronto : PRONTOS[0].id;
  const ids = PRONTOS.map((p) => p.id);
  const sorte = sorteDa(semente);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(sorte() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const lutas = [];
  for (let i = 0; i < 8; i += 2) lutas.push({ a: ids[i], b: ids[i + 1], vencedor: null });
  return { semente, meu, fase: 0, lutas, historico: [], campeao: null, eliminadoEm: null };
}

export function garantirTorneio(t) {
  if (!t || typeof t !== "object" || !Array.isArray(t.lutas)) return null;
  const ok = t.lutas.every((l) => prontoPorId(l.a) && prontoPorId(l.b));
  if (!ok) return null;
  return {
    semente: String(t.semente || "torneio"), meu: prontoPorId(t.meu) ? t.meu : PRONTOS[0].id,
    fase: Math.max(0, Math.min(FASES.length - 1, Number(t.fase) || 0)),
    lutas: t.lutas.map((l) => ({ a: l.a, b: l.b, vencedor: l.vencedor || null })),
    historico: Array.isArray(t.historico) ? t.historico : [],
    campeao: t.campeao || null, eliminadoEm: t.eliminadoEm || null,
  };
}

/* ---------------- LER A CHAVE ---------------- */
export function minhaLuta(t) {
  if (!t || t.campeao || t.eliminadoEm) return null;
  return t.lutas.find((l) => !l.vencedor && (l.a === t.meu || l.b === t.meu)) || null;
}
export function meuRival(t) {
  const l = minhaLuta(t);
  if (!l) return null;
  return prontoPorId(l.a === t.meu ? l.b : l.a);
}

/* ---------------- AS CHAVES QUE CORREM SOZINHAS ----------------
   Resolve por simulação toda luta pendente da fase que NÃO é do
   jogador. Devolve o torneio novo e os rumores — notícia de acampamento,
   citando os nomes de guerra. */
export function correrForaDeTela(t) {
  const T = garantirTorneio(t);
  if (!T) return { torneio: t, rumores: [] };
  const rumores = [];
  const lutas = T.lutas.map((l, i) => {
    if (l.vencedor || l.a === T.meu || l.b === T.meu) return l;
    const r = duelarProntos(l.a, l.b, { semente: `${T.semente}|f${T.fase}|l${i}` });
    const quem = r.vencedor === "A" ? l.a : l.b;
    const perdeu = r.vencedor === "A" ? l.b : l.a;
    /* o placar do rumor fala pela boca de quem venceu: 2×0, nunca 0×2 */
    const placar = r.vencedor === "A" ? r.placar : r.placar.split("×").reverse().join("×");
    rumores.push(`${prontoPorId(quem).nome} derrubou ${prontoPorId(perdeu).nome} (${placar}) — dizem que foi ${placar === "2×0" ? "rápido demais" : "briga de verdade"}`);
    return { ...l, vencedor: quem };
  });
  return { torneio: { ...T, lutas }, rumores };
}

/* ---------------- A LUTA DO JOGADOR ----------------
   A luta REAL acontece na mesa (o App projeta o rival no combate normal);
   aqui só se registra o resultado — vitória segue na chave, derrota
   marca a eliminação e a fase em que caiu. */
export function registrarMinhaLuta(t, venci) {
  const T = garantirTorneio(t);
  const l = minhaLuta(T);
  if (!l) return T;
  const lutas = T.lutas.map((x) => (x === l ? { ...x, vencedor: venci ? T.meu : (x.a === T.meu ? x.b : x.a) } : x));
  return { ...T, lutas, eliminadoEm: venci ? null : FASES[T.fase] };
}

/* ---------------- O CAMPO ENCOLHE ----------------
   Com a fase inteira resolvida, os vencedores formam a próxima; a final
   resolvida corona o campeão. */
export function faseCompleta(t) { return garantirTorneio(t).lutas.every((l) => l.vencedor); }
export function avancarFase(t) {
  const T = garantirTorneio(t);
  if (!faseCompleta(T)) return T;
  const vencedores = T.lutas.map((l) => l.vencedor);
  const historico = [...T.historico, { fase: FASES[T.fase], lutas: T.lutas }];
  if (vencedores.length === 1) return { ...T, historico, campeao: vencedores[0] };
  const lutas = [];
  for (let i = 0; i < vencedores.length; i += 2) lutas.push({ a: vencedores[i], b: vencedores[i + 1], vencedor: null });
  return { ...T, fase: T.fase + 1, lutas, historico };
}

/* ---------------- O EPÍLOGO ----------------
   O jogador caiu (ou quer só assistir): a chave corre até o fim, todas
   as lutas por simulação — inclusive as que seriam dele, agora
   pilotadas pela casa. Sempre termina, sempre com campeão. */
export function epilogar(t) {
  let T = garantirTorneio(t);
  let guarda = 0;
  const rumores = [];
  while (!T.campeao && guarda < 10) {
    const lutas = T.lutas.map((l, i) => {
      if (l.vencedor) return l;
      const r = duelarProntos(l.a, l.b, { semente: `${T.semente}|f${T.fase}|l${i}|ep` });
      return { ...l, vencedor: r.vencedor === "A" ? l.a : l.b };
    });
    for (const l of lutas) if (!T.lutas.find((x) => x.a === l.a && x.b === l.b && x.vencedor)) rumores.push(`${prontoPorId(l.vencedor).nome} passou por ${prontoPorId(l.vencedor === l.a ? l.b : l.a).nome}`);
    T = avancarFase({ ...T, lutas });
    guarda++;
  }
  return { torneio: T, rumores };
}

/* a chave inteira sem jogador nenhum — a prova de que sempre termina */
export function simularTorneioInteiro(semente) {
  const t = criarTorneio({ semente, meuPronto: PRONTOS[0].id });
  /* sem jogador: até a luta "dele" corre pela casa */
  return epilogar({ ...t, meu: "__ninguem__" }).torneio;
}

/* ---------------- PARA A TELA E PARA O NARRADOR ---------------- */
export function envelopeDaChave(t) {
  const T = garantirTorneio(t);
  if (!T) return "";
  const linhas = T.lutas.map((l) => {
    const A = prontoPorId(l.a), B = prontoPorId(l.b);
    return `${A.nome} × ${B.nome}${l.vencedor ? ` → ${prontoPorId(l.vencedor).nome}` : ""}`;
  });
  return `[O TORNEIO — ${FASES[T.fase]}] ${linhas.join(" · ")}`;
}
/* a provocação do rival da vez: a índole dele fala (traços reais) */
export function provocacaoDoRival(t) {
  const r = meuRival(t);
  if (!r) return "";
  return `${r.nome} (${r.papel}) te espera: "${r.linha}" — índole ${r.indole.tracos.join(" e ")}.`;
}
export function resumoDoTorneio(t) {
  const T = garantirTorneio(t);
  if (!T) return { fase: null, vivo: false };
  return { fase: FASES[T.fase], vivo: !T.eliminadoEm && !T.campeao, campeao: T.campeao, eliminadoEm: T.eliminadoEm };
}
