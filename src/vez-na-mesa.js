/* ============================================================
   A VEZ NA MESA (CB9, CB10, CB11 — Fase CB, lote 2, 10/11/2026)

   A planta (mente/plano-combate-e-viagem.md §3.4, §3.5, §3.2) pôs três
   perguntas que o jogador faz a um tabuleiro e que a tela não sabia
   responder sozinha: DE QUEM É A VEZ, E QUEM VEM A SEGUIR? · QUE AINDA POSSO
   FAZER, E QUANTO CUSTA CADA COISA? · SE EU ANDAR ATÉ ALI, O QUE ME CUSTA?
   As peças `FilaDaVez`, `Economia` e a linha do caminho já existem na tela;
   faltava-lhes a forma estável, numa conta só, provada em Node.

   ---------------- A FILA DIZ A ORDEM EM QUE O MOTOR JOGA ----------------
   `combate.ordem` é a iniciativa rolada na abertura, e o motor NÃO a segue
   dentro da rodada (está escrito em tela-de-batalha.js#faixaDaVez): agir
   encerra o turno do herói; depois agem os inimigos, pela ordem da lista da
   luta (`turnoDosInimigos` corre `inimigos` por ordem), e só então o grupo
   (`turnoDosCompanheiros`, pela ordem do grupo); a rodada vira. Uma fila
   desenhada pela iniciativa mostraria uma ordem que a mesa não cumpre — o
   Bandido 3 «a seguir» e o Bandido 1 a golpear. Por isso `filaDaRodada`
   devolve a ordem EM QUE O MOTOR JOGA (é a mesma de `passosDoTurno`,
   turno-contado.js, e a tela não tem duas verdades), e leva a iniciativa
   de cada um como número, para quem a quiser ler.

   ---------------- O CUSTO DE CADA VERBO É REGRA ----------------
   `CUSTO_DOS_VERBOS`: o recurso que cada verbo da barra gasta, nos nomes dos
   pips (`pipsDaEconomia`, batalha-na-tela.js: «acao», «bonus», «reacao») e
   «movimento» para o passo. É a tabela que o painel espera em
   `recursosDosVerbos` (painel-batalha.jsx: «que recurso cada verbo gasta é
   regra, e chega por `recurso`»). A habilidade gasta a ação e, sem ela, a
   ação bónus (App, `usarHabilidade`: `if (acao > 0) acao -= 1; else extra
   -= 1`); esconder-se é bónus para quem a classe o dá (`custoDeEsconder`).
   A bolsa não gasta nada (a gaveta di-lo: «não gasta o turno»).

   ---------------- O CAMINHO E O GOLPE LIVRE ----------------
   `caminhoComProvocacoes` é `caminhar` (grid.js, a mesma busca e o mesmo
   custo) com o que a linha do caminho precisa casa a casa: o custo
   acumulado, o terreno difícil, quem alcança aquela casa — e os golpes
   livres PELA REGRA QUE O APP APLICA (`moverPara`): só quem está colado à
   casa de ONDE se sai golpeia, uma vez, ao sair. As casas do meio em que se
   passa ao alcance de alguém NÃO provocam no motor de hoje; vão marcadas
   (`alcancadoPor`) para a tela as poder tingir sem prometer um golpe que o
   motor não dá.

   Puro, sem sorte, sem tocar no que recebe; lixo dá null ou o vazio.
   ============================================================ */
import { caminhar, adjacentes, terrenoDificil, ocupacaoDe, passoQueResta, podeDarUmPasso, PASSO_NA_RODADA, DESLOCAMENTO_PADRAO } from "./grid.js";
import { acoesPorRodada } from "./habilidades.js";
import { temAcaoBonus } from "./motor/combate-do-turno.js";
import { custoDeEsconder } from "./escondido.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const lista = (x) => (Array.isArray(x) ? x : []);
const fin = (x) => x !== null && x !== "" && typeof x !== "boolean" && Number.isFinite(Number(x));
const caido = (e) => !!(e && (e.derrotado || e.fugiu || Number(e.vida || 0) <= 0));

/* ---------------- AS TABELAS ---------------- */
/* o recurso de cada verbo: null não gasta; "acaoOuBonus" é a habilidade
   (a ação, e sem ela a bónus); "esconder" pergunta a `custoDeEsconder` */
export const CUSTO_DOS_VERBOS = Object.freeze({
  atacar: "acao", mover: "movimento", esquivar: "acao", empurrar: "acao", derrubar: "acao", saltar: "acao",
  esperar: "acao", fugir: "acao", palavra: "acao",
  habilidade: "acaoOuBonus", esconder: "esconder",
  acaoBonus: "bonus", reagir: "reacao",
  bolsa: null,
});
/* as palavras do porquê de um verbo não poder: a tela escreve-as na linha do
   veredito (o sistema fala de jogo, nunca do mecanismo) */
export const RECUSA_DO_VERBO = Object.freeze({
  acao: "já agiste nesta rodada",
  bonus: "já usaste a ação bónus nesta rodada",
  semBonus: "não tens ação bónus",
  reacao: "a reação já foi gasta nesta rodada",
  movimento: "já não tens passo nesta rodada",
});

/* ============================================================
   CB9 · A FILA DA RODADA
   `combate`: { inimigos, ordem, rodada, aliados }; `pers`: o herói (o nome
   e o grupo, para a ordem dos companheiros); `o`: { vez (o nome de quem age
   agora; omisso, o herói), agiram (os nomes que já agiram nesta rodada —
   durante o turno contado, os `quem` dos passos já mostrados) }.
   Devolve { rodada, rostos: [{ nome, lado ("heroi"|"inimigo"|"aliado"),
   heroi, iniciativa, estado ("vez"|"agiu"|"espera"|"caido") }],
   seguinte: { rodada, abre } } — os caídos no fim, a 30 % na tela.
   ============================================================ */
export function filaDaRodada(combate, pers, o) {
  const cb = obj(combate);
  const p = obj(pers);
  if (!cb || !p || !p.nome) return null;
  const c = obj(o) || {};
  const ini = new Map(lista(cb.ordem).filter((x) => obj(x) && x.nome).map((x) => [String(x.nome), fin(x.iniciativa) ? Number(x.iniciativa) : null]));
  const agiram = new Set(lista(c.agiram).map(String));
  const vez = typeof c.vez === "string" && c.vez ? c.vez : p.nome;
  const grupoVivo = new Map(lista(p.grupo).filter(obj).map((g) => [g.nome, g]));
  const ordem = [
    { nome: p.nome, lado: "heroi", ent: p },
    ...lista(cb.inimigos).filter((e) => obj(e) && e.nome).map((e) => ({ nome: e.nome, lado: "inimigo", ent: e })),
    ...lista(p.grupo).filter((g) => obj(g) && g.nome).map((g) => ({ nome: g.nome, lado: "aliado", ent: grupoVivo.get(g.nome) })),
  ];
  const rosto = (x) => ({
    nome: String(x.nome), lado: x.lado, heroi: x.lado === "heroi",
    iniciativa: ini.has(String(x.nome)) ? ini.get(String(x.nome)) : null,
    estado: caido(x.ent) && x.lado !== "heroi" ? "caido" : x.nome === vez ? "vez" : agiram.has(String(x.nome)) ? "agiu" : "espera",
  });
  const rostos = ordem.map(rosto);
  return {
    rodada: Number(cb.rodada) || 1,
    rostos: [...rostos.filter((r) => r.estado !== "caido"), ...rostos.filter((r) => r.estado === "caido")],
    seguinte: { rodada: (Number(cb.rodada) || 1) + 1, abre: p.nome },
  };
}

/* ============================================================
   CB10 · A ECONOMIA DA VEZ
   `combate`: { economia: { acao, extra, movM }, recursos: { reacao } };
   `pers`: o herói; `o`: { passoTotalM (o passo inteiro da rodada, o que o
   App calcula em `passoComSelecao`; omisso, DESLOCAMENTO_PADRAO),
   verbos (os ids a avaliar; omisso, os da tabela) }.
   Devolve { acao: { resta, total }, bonus: { tem, resta, total },
   reacao: { resta }, movimento: { restaM, totalM, podeAndar },
   recursosDosVerbos: { id: recurso }, verbos: { id: { gasta, pode,
   porqueNao } } }. O recurso de `recursosDosVerbos` é o pip que o verbo
   põe «em jogo» (a habilidade sem ação mostra a bónus).
   ============================================================ */
export function economiaDaVez(combate, pers, o) {
  const cb = obj(combate);
  const p = obj(pers);
  if (!cb || !p) return null;
  const c = obj(o) || {};
  const eco = obj(cb.economia) || {};
  const rec = obj(cb.recursos) || {};
  const totalAcao = acoesPorRodada(p);
  const temBonus = temAcaoBonus(p);
  const acao = Math.max(0, fin(eco.acao) ? Number(eco.acao) : totalAcao);
  const bonus = temBonus ? Math.max(0, fin(eco.extra) ? Number(eco.extra) : 1) : 0;
  const reacao = rec.reacao !== false;
  const totalM = fin(c.passoTotalM) ? Math.max(0, Number(c.passoTotalM)) : DESLOCAMENTO_PADRAO;
  const restaM = passoQueResta(eco[PASSO_NA_RODADA.campo], totalM);
  const podeAndar = podeDarUmPasso(eco[PASSO_NA_RODADA.campo], totalM);
  const ids = Array.isArray(c.verbos) && c.verbos.length ? c.verbos.map(String) : Object.keys(CUSTO_DOS_VERBOS);
  const verbos = {}, recursosDosVerbos = {};
  for (const id of ids) {
    if (!Object.prototype.hasOwnProperty.call(CUSTO_DOS_VERBOS, id)) continue;
    let gasta = CUSTO_DOS_VERBOS[id];
    if (gasta === "acaoOuBonus") gasta = acao > 0 || !temBonus ? "acao" : "bonus";
    if (gasta === "esconder") gasta = custoDeEsconder(p) === "bonus" && temBonus ? "bonus" : "acao";
    let pode = true, porqueNao = null;
    if (gasta === "acao" && acao <= 0) { pode = false; porqueNao = RECUSA_DO_VERBO.acao; }
    else if (gasta === "bonus" && !temBonus) { pode = false; porqueNao = RECUSA_DO_VERBO.semBonus; }
    else if (gasta === "bonus" && bonus <= 0) { pode = false; porqueNao = RECUSA_DO_VERBO.bonus; }
    else if (gasta === "reacao" && !reacao) { pode = false; porqueNao = RECUSA_DO_VERBO.reacao; }
    else if (gasta === "movimento" && !podeAndar) { pode = false; porqueNao = RECUSA_DO_VERBO.movimento; }
    verbos[id] = { gasta, pode, porqueNao };
    if (gasta) recursosDosVerbos[id] = gasta;
  }
  return {
    acao: { resta: acao, total: totalAcao },
    bonus: { tem: temBonus, resta: bonus, total: temBonus ? 1 : 0 },
    reacao: { resta: reacao },
    movimento: { restaM, totalM, podeAndar },
    recursosDosVerbos, verbos,
  };
}

/* ============================================================
   CB11 · O CAMINHO COM O CUSTO E OS GOLPES LIVRES
   `grade`, `de` (o herói na mesa: { nome, x, y, tamanho }), `destino`
   ({ x, y }), `inimigos` (os da luta, com casa), `o`: { aliados (com casa,
   para a ocupação), deslocamentoM (o que RESTA andar nesta rodada; omisso,
   o passo padrão), ignoraDificil }.
   Devolve { ok, motivo?, casas: [{ x, y, custoM (acumulado), dificil,
   alcancadoPor: [nomes] }], custoM, sobraM, golpesLivres: [nomes],
   provoca } — `casas` sem a de partida, a última é o destino. A ocupação é
   a do App (inimigos e aliados de pé, sem o próprio herói).
   ============================================================ */
export function caminhoComProvocacoes(grade, de, destino, inimigos, o) {
  const h = obj(de), d = obj(destino);
  if (!grade || !h || !fin(h.x) || !fin(h.y) || !d || !fin(d.x) || !fin(d.y)) return null;
  const c = obj(o) || {};
  const ins = lista(inimigos).filter(obj);
  const desloc = fin(c.deslocamentoM) ? Number(c.deslocamentoM) : DESLOCAMENTO_PADRAO;
  const ocupados = ocupacaoDe([...ins, ...lista(c.aliados).filter(obj)], h);
  const chk = caminhar(grade, h, d, { ocupados, deslocamentoM: desloc, ignoraDificil: c.ignoraDificil === true });
  if (!chk.ok) return { ok: false, motivo: chk.motivo, casas: [], custoM: 0, sobraM: desloc, golpesLivres: [], provoca: false };
  let acc = 0;
  const casas = chk.caminho.map((q) => {
    const dificil = c.ignoraDificil !== true && !!terrenoDificil(grade, q.x, q.y);
    acc += dificil ? 2 * PASSO_NA_RODADA.minimo : PASSO_NA_RODADA.minimo;
    return { x: q.x, y: q.y, custoM: Math.round(acc * 10) / 10, dificil, alcancadoPor: adjacentes({ ...h, x: q.x, y: q.y }, ins).map((e) => e.nome) };
  });
  const golpesLivres = adjacentes(h, ins).map((e) => e.nome);
  return { ok: true, casas, custoM: chk.custoM, sobraM: Math.max(0, Math.round((desloc - chk.custoM) * 10) / 10), golpesLivres, provoca: golpesLivres.length > 0 };
}
