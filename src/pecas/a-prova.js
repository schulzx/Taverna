/* ============================================================
   AS PEÇAS · A PROVA EM NODE (17/11/2026, Fase A) — src/pecas/a-prova.js

   A máquina da prova, sem IA e sem tela: o mundo da quest de abertura, os
   três jogadores-roteiro que a jogam turno a turno, e as medidas que a
   pessoa pediu (o encaixe no corpus, a cobertura dos moldes). Lida pelas
   suítes testes/teste-pecas-*.mjs; a fase B não a liga ao jogo — é a
   régua com que a fase B se compara.

   O DADO É DA SEMENTE: d20DaSemente é um hash (FNV-1a) da semente e do
   número da rolagem — a mesma prova dá o mesmo resultado em qualquer
   máquina. Nenhum Math.random.
   ============================================================ */
import { BIBLIOTECA_DE_QUESTS, questPorId, avancarQuest, oClimaxDaQuest } from "../biblioteca-de-quests.js";
import { garantirHistoria } from "../historia.js";
import { garantirFactos } from "../livro-de-factos.js";
import { garantirQuestsDaEspinha, oTurnoDasQuests } from "../motor/quests-do-turno.js";
import { esqueletoDaCampanha, comOEsqueleto } from "../esqueleto.js";
import { gerarGeografia } from "../geografia.js";
import { estenderEspinha } from "../saga.js";
import { nucleoDaCampanha } from "../nucleo.js";
import { chefesDoMundo } from "../mundo-base.js";
import { aplicarPrecoDoQuadro } from "../quadro-da-quest.js";
import { aPecaDaEtapa, fechaComMoldes } from "./peca.js";
import { encaixar } from "./encaixe.js";
import { memoriaDe, comMemoria, aquecer, bonusDoCalor, relogioCheio, oMundoCobra } from "./calor.js";
import { resolver } from "./andar.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const sem = (x) => String(x == null ? "" : x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export const A_PROVA = Object.freeze({
  quest: "o_que_desce_ao_anoitecer",
  semente: "QQ1|0",
  /* teto de turnos de uma partida: muito acima do que qualquer roteiro
     precisa — passar dele é estar preso, e a suíte diz-o */
  tetoDeTurnos: 400,
  /* a luta parelha: o herói de nível 1 contra o tenente vence com 11+ no
     d20 da prova (metade). A luta real é do tabuleiro; aqui só se precisa
     de um desfecho com as duas faces */
  lutaVenceCom: 11,
});

/* ---------------- O DADO DA SEMENTE ---------------- */
export function d20DaSemente(semente, n) {
  let h = 2166136261;
  const s = `${semente}#${n}`;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return (h % 20) + 1;
}

/* ---------------- O MUNDO DA PROVA ----------------
   O mundo de mistério do teste do quadro (§7), com a quest de abertura e
   as pessoas dela no registo (sem isso não têm id, e o livro não as
   escreve). → { E, R, F, mundo } */
export function mundoDaProva(semente) {
  const s = semente || A_PROVA.semente;
  const mundo = { semente: s };
  const cat = BIBLIOTECA_DE_QUESTS.filter((q) => q.id === A_PROVA.quest);
  const mapa = gerarGeografia(s, null, null);
  const espinha0 = estenderEspinha({ semente: s, mapa, estrutura: "misterio", cidadeInicial: mapa.cidades[0].nome, antecedente: "soldado", dia: 1 });
  const nucleo = nucleoDaCampanha(s, mapa, { espinha: espinha0, antecedente: "soldado", grupo: [] });
  const esq = esqueletoDaCampanha({ semente: s, mapa, espinha: espinha0, antecedente: "soldado", nucleo, chefes: chefesDoMundo(s, mapa), catalogo: cat });
  let E = { espinha: comOEsqueleto(espinha0, esq), historia: garantirHistoria({ estrutura: "misterio", etapa: 0 }), mapa, cidadeAtual: mapa.cidades[0].nome, lugar: null, jornada: null, personagem: { nome: "Vera", grupo: [], inventario: [], moedas: 100 }, npcs: {}, canone: {}, factos: garantirFactos(null), saber: [], dia: 1, npcTurno: 0 };
  const r = oTurnoDasQuests(E, { mundo });
  if (r) E = { ...E, ...r.estado };
  const R0 = garantirQuestsDaEspinha(E.espinha.quests).registos.find((x) => x.id === A_PROVA.quest);
  if (!R0) return null;
  const F = questPorId(A_PROVA.quest);
  const npcs = {};
  for (const [k, d] of Object.entries(F.papeis)) {
    const p = R0.papeis[k];
    if (p && p.nome && (d.de === "elenco" || d.de === "fio")) npcs[p.nome] = { nome: p.nome, ...(p.local ? { local: p.local } : {}), ...(p.cidade ? { cidade: p.cidade } : {}) };
  }
  E = { ...E, npcs };
  const R = avancarQuest(F, R0, { estado: E, mundo });
  const curral = R.papeis.curral;
  E = { ...E, cidadeAtual: curral.cidade, lugar: { nome: curral.nome, cidade: curral.cidade } };
  return { E, R, F, mundo };
}

/* onde se acha o alvo de uma solução: o lugar dela, o sítio da pessoa, ou o covil */
export function ondeFica(s, F, R, etapa) {
  const papeis = obj(R && R.papeis) || {};
  const cidadeDe = (nome) => (Object.values(papeis).find((p) => obj(p) && p.nome === nome && p.cidade) || {}).cidade || "";
  if (s.alvo.tipo === "lugar") return { nome: s.alvo.nome, cidade: (papeis[s.alvo.papel] || {}).cidade || "" };
  if (s.alvo.tipo === "pessoa") {
    const p = papeis[s.alvo.papel] || {};
    if (p.local) return { nome: p.local, cidade: p.cidade || cidadeDe(p.local) };
    const c = obj(oClimaxDaQuest(F)[etapa]);
    const covil = c && c.covil ? papeis[c.covil] : null;
    if (covil) return { nome: covil.nome, cidade: covil.cidade || "" };
  }
  return null;
}

/* ---------------- AS FRASES DOS ROTEIROS ----------------
   O jogador direto diz a ação pela frase que o catálogo lê; o conversador
   só conversa e olha. São frases de jogador, em PT-BR. */
export const FRASE_DO_DIRETO = Object.freeze({
  investigar: "Examino com cuidado {nome}, à procura de vestígios.",
  buscar: "Vasculho {nome} de cima a baixo.",
  rastrear: "Sigo as pegadas na lama até {nome}.",
  orientar: "Procuro o caminho mais curto até {nome}.",
  escutar: "Encosto o ouvido à parede de {nome} e escuto.",
  fazer_falar: "Insisto com {quem} até me dizer o que sabe de {nome}.",
  convencer: "Tento convencer {nome} a me contar o que sabe.",
  impressionar: "Chego junto de {nome} e puxo conversa.",
  intimidar: "Ameaço {nome} para que fale.",
  mentir: "Minto a {nome} dizendo que venho da guarda.",
  mentira: "Tento saber se {nome} está mentindo.",
  pagar: "Pago a {nome} umas moedas para me contar tudo.",
  lutar: "Ataco {nome} com a espada.",
  furtar_se: "Me esgueiro pela sombra até {nome}.",
  capturar: "Atiro o laço ao pescoço de {nome}.",
  acalmar_bicho: "Acalmo {nome} com a voz baixa e a mão aberta.",
  seguir_alguem: "Sigo {nome} de longe, sem ser notado.",
  lembrar: "O que eu sei sobre {nome}?",
  escalar: "Escalo o muro de {nome}.",
  tranca: "Forço a fechadura de {nome} com a gazua.",
  fugir: "Fujo dali a correr.",
});
export const FRASES_DO_CONVERSADOR = Object.freeze([
  "Cumprimento {quem} e pergunto como vai o inverno.",
  "Digo a {quem} que não tenho pressa nenhuma.",
  "Comento com {quem} que a noite promete ser fria.",
  "Pergunto a {quem} se ouviu o sino ontem à noite.",
  "Fico calada um tempo, a ouvir o vento.",
  "Pergunto a {quem} há quanto tempo vive aqui.",
  "Pergunto a {quem} se a família está bem.",
  "Conto a {quem} de onde venho e o que me trouxe.",
]);
const encher = (modelo, s, cena) => modelo.replace("{nome}", s ? s.alvo.nome : "isto").replace("{quem}", (cena.quem[0] && cena.quem[0].nome) || "alguém");

/* os três roteiros */
export const ROTEIROS = Object.freeze({
  direto: Object.freeze({ id: "direto", aceitaOferta: true, sempreFalha: false }),
  conversador: Object.freeze({ id: "conversador", aceitaOferta: false, sempreFalha: false }),
  azarado: Object.freeze({ id: "azarado", aceitaOferta: true, sempreFalha: true }),
});

/* ---------------- JOGAR A PROVA ----------------
   jogarAProva(roteiro) → o relatório:
   { roteiro, turnos, concluida, presa, porEtapa: { id: { turnos, dados,
     comPreco, precos, cobrou, impostos, fechouCom, carta } }, precos,
     cobrancas, frases: { solucao, aquecimento, livre }, log } */
export function jogarAProva(roteiroId, opcoes) {
  const o = obj(opcoes) || {};
  const rot = ROTEIROS[roteiroId];
  const W = mundoDaProva(o.semente);
  if (!rot || !W) return null;
  const { F, mundo } = W;
  let { E, R } = W;
  let nRolagem = 0;
  const rel = { roteiro: rot.id, turnos: 0, concluida: false, presa: false, porEtapa: {}, precos: [], cobrancas: 0, frases: { solucao: 0, cena: 0, aquecimento: 0, livre: 0 }, log: [] };
  const daEtapa = (id) => rel.porEtapa[id] || (rel.porEtapa[id] = { turnos: 0, dados: 0, comPreco: 0, precos: 0, cobrou: 0, impostos: 0, fechouCom: null, carta: false });
  const rolar = (peca, s, extra) => {
    nRolagem++;
    const mem = memoriaDe(E, peca);
    const d20 = rot.sempreFalha ? 1 : d20DaSemente(`${A_PROVA.semente}|${rot.id}`, nRolagem);
    const bonus = s.semDado ? 0 : bonusDoCalor(mem, s.id) + (mem.abertas[s.id] || 0) + ((extra && extra.bonus) || 0);
    const dado = s.semDado ? null : s.luta ? { venceu: !rot.sempreFalha && d20 + bonus >= A_PROVA.lutaVenceCom } : { total: d20, bonus, dc: s.dc + mem.pior };
    const antes = R;
    const r = resolver(peca, s.id, dado, E, { registo: R, mundo, dia: E.dia, turno: rel.turnos });
    if (!r) return null;
    E = r.estado;
    R = r.registo || antes;
    const et = daEtapa(peca.etapa);
    if (!s.semDado) { et.dados++; if (s.falha) et.comPreco++; }
    if (r.resultado.preco) { et.precos++; rel.precos.push(r.resultado.preco.id); }
    rel.log.push(`${peca.etapa} · ${s.id} · ${s.semDado ? "carta" : r.resultado.passou ? "passou" : "falhou"} · ${r.resultado.tipo}${r.resultado.preco ? " · " + r.resultado.preco.id : ""}`);
    if (!s.semDado) R = avancarQuest(F, R, { estado: E, mundo });
    return r;
  };
  while (R && R.estado === "aberta" && rel.turnos < A_PROVA.tetoDeTurnos) {
    rel.turnos++;
    const peca = aPecaDaEtapa(R, null, E, { mundo });
    if (!peca) break;
    const et = daEtapa(peca.etapa);
    et.turnos++;
    const feitasAntes = Object.keys(R.feitas || {}).length;
    let como = null;
    /* 1. a carta de escolha: o jogador escolhe (a primeira da ficha) */
    if (peca.carta) { et.carta = true; rolar(peca, peca.solucoes[0]); como = "carta"; }
    else {
      const mem = memoriaDe(E, peca);
      /* 2. o relógio cheio: o mundo cobra */
      if (relogioCheio(mem, peca)) {
        const c = oMundoCobra(peca, E);
        const pago = aplicarPrecoDoQuadro(E, c.preco, {});
        E = comMemoria({ ...E, ...(pago ? pago.estado : {}) }, peca, c.memoria);
        rel.cobrancas++; et.cobrou++; et.precos++; rel.precos.push(c.preco.id);
        rel.log.push(`${peca.etapa} · o mundo cobra · ${c.preco.id} · forçada ${c.forcada}${c.impoe ? " (imposta)" : ""}`);
        if (c.impoe && c.forcada) { et.impostos++; rolar(c.peca, c.peca.solucoes.find((x) => x.id === c.forcada)); como = "imposta"; }
        else como = "cobranca";
      } else {
        /* 3. a oferta: o que o calor abriu, ou a seta da falha, à vista */
        const oferta = peca.solucoes.find((s) => mem.abertas[s.id] != null && s.aVista && !mem.queimadas.includes(s.id));
        if (oferta && rot.aceitaOferta) { rolar(peca, oferta); como = "oferta"; }
        else {
          /* 4. a frase */
          let frase;
          let destino = null;
          if (rot.id === "conversador") frase = encher(FRASES_DO_CONVERSADOR[(rel.turnos - 1) % FRASES_DO_CONVERSADOR.length], null, peca.cena);
          else {
            const vivas = peca.solucoes.filter((s) => s.fecha && !s.semDado && s.aVista && !mem.queimadas.includes(s.id) && FRASE_DO_DIRETO[s.acao]);
            const alvo = vivas[0];
            if (alvo) frase = encher(FRASE_DO_DIRETO[alvo.acao], alvo, peca.cena);
            else {
              const longe = peca.solucoes.find((s) => s.fecha && !s.semDado && ondeFica(s, F, R, peca.etapa));
              destino = longe ? ondeFica(longe, F, R, peca.etapa) : null;
              frase = `Vou até ${destino ? destino.nome : "a praça"}.`;
            }
          }
          const r = encaixar(frase, peca, E);
          rel.frases[r ? r.tipo : "aquecimento"]++;
          if (r && r.tipo === "solucao") { rolar(peca, peca.solucoes.find((s) => s.id === r.solucao)); como = "solucao"; }
          else if (r && r.tipo === "livre") {
            if (destino) E = { ...E, lugar: { nome: destino.nome, cidade: destino.cidade || E.cidadeAtual }, cidadeAtual: destino.cidade || E.cidadeAtual };
            rel.log.push(`${peca.etapa} · livre · ${frase}`);
            como = "livre";
          } else if (r && r.tipo === "cena") {
            /* o teste de cena rola como hoje: não gasta o relógio da etapa
               nem aquece nada (A2, ajuste 1) */
            rel.log.push(`${peca.etapa} · cena · ${r.acao}`);
            como = "cena";
          } else {
            const a = aquecer(memoriaDe(E, peca), peca, r || {});
            E = comMemoria(E, peca, a.memoria);
            rel.log.push(`${peca.etapa} · aquecimento · ${(r && r.esquenta.join(",")) || "—"}${a.abriu.length ? " · abriu " + a.abriu.join(",") : ""}`);
            como = "aquecimento";
          }
        }
      }
    }
    E = { ...E, dia: E.dia };
    const fechou = Object.keys(R.feitas || {}).length > feitasAntes;
    if (fechou) et.fechouCom = como;
  }
  rel.concluida = !!R && R.estado === "concluida";
  rel.presa = !!R && R.estado === "aberta";
  rel.estado = R ? R.estado : null;
  rel.feitas = R ? Object.keys(R.feitas || {}) : [];
  rel.fechoDe = R && R.fecho ? R.fecho.de || null : null;
  return rel;
}

/* ---------------- A MEDIDA DO ENCAIXE ----------------
   medirOEncaixe(frases, pecas, { estado, conhecidos }) → por peça e no
   total: { n, solucao, aquecimento, esquenta, frio, livre, exemplos:
   { solucao, aquecimento, livre, frio } } — `frio`: o aquecimento que não
   aponta para nada (o furo a relatar). */
export function medirOEncaixe(frases, pecas, opcoes) {
  const o = obj(opcoes) || {};
  const total = { n: 0, solucao: 0, cena: 0, aquecimento: 0, esquenta: 0, frio: 0, livre: 0, nulo: 0 };
  const porPeca = {};
  const exemplos = { solucao: [], cena: [], aquecimento: [], livre: [], frio: [] };
  for (const { nome, peca, estado } of arr(pecas)) {
    const c = { n: 0, solucao: 0, cena: 0, aquecimento: 0, esquenta: 0, frio: 0, livre: 0, nulo: 0 };
    arr(frases).forEach((f, i) => {
      const r = encaixar(f, peca, estado || o.estado || {}, { conhecidos: o.conhecidos });
      c.n++;
      if (!r) { c.nulo++; return; }
      c[r.tipo]++;
      if (r.tipo === "aquecimento") { if (r.esquenta.length) c.esquenta++; else c.frio++; }
      const tipo = r.tipo === "aquecimento" && !r.esquenta.length ? "frio" : r.tipo;
      exemplos[tipo === "frio" ? "aquecimento" : tipo].push({ i, peca: nome, frase: f, r });
      if (tipo === "frio") exemplos.frio.push({ i, peca: nome, frase: f, r });
    });
    porPeca[nome] = c;
    for (const k of Object.keys(total)) total[k] += c[k];
  }
  return { total, porPeca, exemplos };
}

/* ---------------- A COBERTURA DOS MOLDES ----------------
   aCoberturaDosMoldes() → { etapas, validas, poucas, naoFecham: [{ quest,
   etapa, semMolde }], cartas } — cada etapa das quests da biblioteca, com
   a peça feita SÓ dos moldes (sem exceção escrita), sobre um estado vazio
   (todos os factos por fazer). `poucas`: menos de 3 soluções que fecham,
   fora das cartas de escolha. */
export const MINIMO_DE_SOLUCOES = 3;
export function aCoberturaDosMoldes() {
  const out = { etapas: 0, validas: 0, poucas: [], naoFecham: [], cartas: 0, porPredicado: {} };
  for (const F of BIBLIOTECA_DE_QUESTS) {
    const climax = oClimaxDaQuest(F);
    for (const e of F.etapas) {
      out.etapas++;
      const semMolde = [];
      const conds = [e.conclui, ...arr(climax[e.id] && climax[e.id].exige)];
      const fecha = conds.every((c) => fechaComMoldes(c, semMolde));
      const R = { id: F.id, papeis: {}, feitas: {}, escolhas: {} };
      const peca = aPecaDaEtapa(R, e.id, {}, { semExcecoes: true });
      for (const a of arr(peca && peca.faltam)) out.porPredicado[a[0]] = (out.porPredicado[a[0]] || 0) + 1;
      if (!fecha) { out.naoFecham.push({ quest: F.id, etapa: e.id, semMolde }); continue; }
      if (!peca || !peca.solucoes.length) { out.naoFecham.push({ quest: F.id, etapa: e.id, semMolde: ["sem peça"] }); continue; }
      out.validas++;
      if (peca.carta) { out.cartas++; continue; }
      const fecham = peca.solucoes.filter((s) => s.fecha && !s.semDado);
      if (fecham.length < MINIMO_DE_SOLUCOES) out.poucas.push({ quest: F.id, etapa: e.id, n: fecham.length });
    }
  }
  return out;
}

/* as três peças da prova com dado, cada uma com o herói no sítio dela —
   o estado em que a frase do corpus chega */
export function asPecasDaProva(semente) {
  const W = mundoDaProva(semente);
  if (!W) return [];
  const { F, R, mundo } = W;
  const naToca = { ...W.E, lugar: { nome: R.papeis.toca.nome, cidade: R.papeis.toca.cidade } };
  return [
    { nome: "ver", estado: W.E, peca: aPecaDaEtapa(R, "ver", W.E, { mundo }) },
    { nome: "rasto", estado: W.E, peca: aPecaDaEtapa(R, "rasto", W.E, { mundo }) },
    { nome: "fera", estado: naToca, peca: aPecaDaEtapa(R, "fera", naToca, { mundo }) },
  ].map((x) => ({ ...x, quest: F.id }));
}

/* nomes que existem e não estão em cena, para o corpus (sem eles, «falo
   com o Teodoro» aqueceria quem está aqui) */
export const conhecidosDoCorpus = (corpus) => arr(obj(corpus) && corpus.conhecidos).filter((n) => typeof n === "string");
