/* A MASMORRA NA PAUTA (MM16 nº 4) — a sala onde estou, e o lugar que não acusa

   O pedido da pessoa: *"A masmorra na pauta fora da luta: a sala onde estou,
   quem lá está e as distâncias. E acabam as recusas falsas de lugar dentro
   da masmorra e da luta (foram 12 em 30)."*

   A 3.ª sessão de prova (`mente/mm11-sessao-3.md`, defeito 4; o registo das
   69 chamadas, `registo-s3.jsonl`) viu duas coisas:

   1) A MASMORRA NÃO CHEGAVA À PAUTA. Fora da luta o ONDE dizia "no posto da
      estrada · (aqui isto é um forte)": `linhaDoLugar` (geografo.js) dava o
      LUGAR antes da masmorra, e o lugar vigente era a fogueira de antes da
      porta. Sem a sala (o GUARDIÃO), sem quem lá estava (um Goblin e um
      Lobo), sem passagens nem distâncias: 4 perguntas perdidas no M13, e o
      Mestre inventou salões. E o mundo anunciava "12 salas" (o prompt, l.31
      da chamada 22) para uma planta de 6 ("ENTRADA 1/6").

   2) "[LUGAR — RECUSADO PELO SISTEMA]" 12 VEZES EM 30 RESPOSTAS, nenhuma
      verdadeira. O que veio no `lugar` em cada uma, lido do registo:
        · chamada 24 (causa: a resposta da 22): o MESTRE mandou
          `lugar_atual: null` a "entro na Nave de Ferro" — a masmorra aberta,
          o lugar vigente ainda "o posto da estrada" (fora dos muros), a frase
          sem "saio": a regra do Mestre fora dos muros recusava. O Mestre
          obedeceu e voltou à fogueira.
        · chamadas 36, 38, 40, 42, 45, 52, 54, 56, 62, 65 e 68 (causa: o
          Cronista da chamada anterior): o Mestre não mandou lugar nenhum. O
          CRONISTA disse "câmara das correntes" — o MESMO lugar que já estava
          registado —, e o App recusava tudo o que chegasse com uma luta
          aberta (v9.48), antes de olhar se era o mesmo sítio.

   O CONSERTO, que esta suíte guarda:
     · `LUGAR_NA_CENA_DO_SISTEMA` + `lerLugarDito(…, { luta, masmorra })`
       (lugar.js): lá dentro o lugar dito é IGNORADO em silêncio;
     · `lugarAoEntrarNaMasmorra` (boca.js): entrar põe o lugar vigente na boca;
     · `linhaDoLugar` (geografo.js): a masmorra ganha do lugar, e a 1.ª linha
       do ONDE (de ferro) diz a sala (`salaEmPalavras`, masmorras.js);
     · `masmorraParaPauta` + a seção MASMORRA (pauta.js): a planta à volta;
     · `gerarMasmorra(…, { salas })` (masmorras.js): a planta do tamanho que o
       mundo anuncia.

   FALHA em HEAD de 05/10 (v9.351): os nomes não existem, `lerLugarDito` com
   uma luta devolve "novo"/"recusa", e o ONDE de dentro diz o posto. A secção
   9 prova a fiação no App, que é da etapa do frontend. Imports por espaço de
   nomes: em HEAD a suíte falha asserção a asserção, não num import.
   Determinística: o gerador da masmorra usa `Math.random`, e aqui ele corre
   sobre um gerador semeado (secção 4), restaurado no fim. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hashSemente, rng } from "../src/semente.js";
import * as L from "../src/lugar.js";
import * as M from "../src/masmorras.js";
import * as P from "../src/pauta.js";
import * as G from "../src/geografo.js";
import * as Bo from "../src/boca.js";
import { gerarGeografia } from "../src/geografia.js";
import { MOLDES } from "../src/moldes.js";
import { generosDisponiveis } from "../src/nomes.js";
import { masmorrasDoMundo, oQueExisteAqui } from "../src/mundo-base.js";
import { aplicarEscolha, envelopeDoGolpeFinal, golpeFinalNaPauta } from "../src/golpe-final.js";

const AQUI = dirname(fileURLToPath(import.meta.url));
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
const fn = (o, k) => (o && typeof o[k] === "function" ? o[k] : () => null);
const paraPauta = (mm, o) => tenta(() => fn(M, "masmorraParaPauta")(mm, o), null) || [];
const salaEmPalavras = (mm) => tenta(() => fn(M, "salaEmPalavras")(mm), "") || "";
const passagensAte = fn(M, "passagensAte");
const larguras = fn(M, "larguraDasCamadas");
const aoEntrar = fn(Bo, "lugarAoEntrarNaMasmorra");
const acao = (dito, ctx) => tenta(() => L.lerLugarDito(dito, ctx), {}) || {};
const { textoDaPauta, porNaPauta, garantirPauta, cederNaCena, SECOES, TETO_DA_PAUTA } = P;

/* O mundo da sessão (os nomes do registo) */
const VAU = "Vau Fincado";
const LEX = { gerado: true, chamado: { masmorra: "forte" } };
const CLIMA = "calor opressivo";
const J11 = "\"Não volto, e também não vou a São do Meio hoje.\" Viro para o poente, sigo o rasto da estrada proibida e entro na Nave de Ferro com a Iracema, de tocha erguida.";
const POSTO = L.definirLugar("o posto da estrada", { cidade: VAU, distancia: "arredores" });
const CAMARA = L.definirLugar("câmara das correntes", { cidade: VAU, distancia: "arredores" });

/* A Nave de Ferro no M13, reconstruída do save e da tela: planta de 6, a
   heroína à soleira do GUARDIÃO (2/6, "POR RESOLVER"), três tochas depois do
   passo cauteloso, um Goblin e um Lobo na sala, a chave por cair. */
const NAVE_M13 = {
  nome: "A Nave de Ferro", nivel: 6, atual: 1, tochas: 3, chave: false, ritmo: "cauteloso", saques: { moedas: 0, itens: 0 }, encerrada: false,
  salas: [
    { id: 0, tipo: "entrada", camada: 0, saidas: [1, 2], visitada: true, resolvida: true },
    { id: 1, tipo: "chave", camada: 1, saidas: [3, 4], visitada: true, resolvida: false, pista: "correntes penduradas balançam sem vento", guardaChave: true, inimigos: [{ nome: "Goblin", ameaca: "comum" }, { nome: "Lobo", ameaca: "comum" }] },
    { id: 2, tipo: "tesouro", camada: 1, saidas: [3], visitada: false, resolvida: false, pista: "um brilho fraco reflete lá no fundo" },
    { id: 3, tipo: "combate", camada: 2, saidas: [5], visitada: false, resolvida: false, pista: "cheiro de bicho e ferro velho", inimigos: [{ nome: "Lobo", ameaca: "comum" }] },
    { id: 4, tipo: "enigma", camada: 2, saidas: [5], visitada: false, resolvida: false, pista: "runas frias piscam devagar", tranca: "inscricao" },
    { id: 5, tipo: "chefe", camada: 3, saidas: [], visitada: false, resolvida: false, pista: "um portão pesado, lacrado", trancada: true, inimigos: [{ nome: "Chefe da Masmorra", ameaca: "elite" }] },
  ],
};

/* ============================================================ */
sec("1. as tabelas");
{
  const C = L.LUGAR_NA_CENA_DO_SISTEMA || {};
  t("LUGAR_NA_CENA_DO_SISTEMA: na luta e na masmorra o lugar dito é ignorado", C.luta === "ignora" && C.masmorra === "ignora" && Object.keys(C).join(",") === "luta,masmorra");
  const s = (id) => SECOES.find((x) => x.id === id);
  const iM = SECOES.indexOf(s("masmorra"));
  t("a seção MASMORRA existe, com rótulo e propósito", !!s("masmorra") && s("masmorra").rotulo === "MASMORRA" && !!s("masmorra").o);
  t("lê-se logo depois do ONDE", iM === SECOES.indexOf(s("onde")) + 1);
  /* depois de cinco linhas de veto (2,0..2,4) e antes do MOMENTO (3) */
  t("corta depois de todo veto, da fala e do peso, e antes do momento", !!s("masmorra") && s("masmorra").prio > s("naoPode").prio + 0.4 && s("masmorra").prio < s("momento").prio);
  t("não é de ferro (o ferro é o lugar, o desfecho e o veto de quem caiu)", !!s("masmorra") && !s("masmorra").ferro && s("masmorra").prio > P.PRIO_DE_FERRO);
  t("e não cede em lugar nenhum (é a verdade do sítio)", Object.values(P.SECOES_QUE_CEDEM).every((ids) => !ids.includes("masmorra")));
  const T = M.MASMORRA_NA_PAUTA || {};
  t("MASMORRA_NA_PAUTA: tetos de nomes e de passagens", T.maxNomes >= 2 && T.maxPassagens >= 3);
  const S = M.SALA_EM_PALAVRAS || {};
  t("SALA_EM_PALAVRAS cobre todo tipo de sala que o gerador faz", Object.keys(M.ROTULO_SALA).every((k) => typeof S[k] === "string" && S[k].length > 3));
  const PL = M.PLANTA_DA_MASMORRA || {};
  t("PLANTA_DA_MASMORRA: largura 3, duas camadas no mínimo, e cobre o que o mundo anuncia (5 a 12)", PL.larguraMaxima === 3 && PL.camadasMinimas === 2 && PL.salasMinimas <= 5 && PL.salasMaximas >= 12);
}

/* ============================================================ */
sec("2. os 12 recusados do registo — o que veio no lugar, e o que vale agora");
{
  /* o 1.º: a resposta da chamada 22 (o Mestre, `lugar_atual: null`) */
  const antes = acao(null, { lugar: POSTO, cidade: VAU, pedido: J11, fonte: "mestre" });
  t("a causa, reproduzida: sem dizer que a cena é da masmorra, o null do Mestre é recusa (o posto, fora dos muros)", antes.acao === "recusa" && antes.porque === "foraDosMuros");
  const agora = acao(null, { lugar: POSTO, cidade: VAU, pedido: J11, fonte: "mestre", masmorra: true });
  t("chamada 24: com a masmorra aberta, o mesmo null é ignorado em silêncio", agora.acao === "ignora" && agora.porque === "masmorra");
  /* os 11 da luta: o Cronista, "câmara das correntes", com o mesmo lugar
     registado; o pedido é o que o registo traz na chamada de narração que o
     Cronista leu (os envelopes do sistema não são pedido). */
  const DA_LUTA = [
    [36, "[INICIATIVA ROLADA PELO SISTEMA] Ordem do combate: 1º Tobias Varzim (23) · 2º Lobo (7) · 3º Iracema Sousa (5)."],
    [38, "Pergunto ao Mestre, sem me mexer: a quantos metros está o lobo, e tenho alguma coisa entre mim e ele que me sirva de cobertura?"],
    [40, "Baixo a tocha atrás das costas e escondo-me na sombra, colado à parede do fundo, sem fazer barulho."],
    [42, "Seguro a ação e observo, pronto para responder"],
    [45, "Seguro a ação e observo, pronto para responder"],
    [52, "Ataco Lobo"],
    [54, "[O MUNDO RESPONDE — PERGUNTADO PELO PRÓPRIO SISTEMA] Eu fiz barulho ao intimidar."],
    [56, "Seguro a ação e observo, pronto para responder"],
    [62, "Seguro a ação e observo, pronto para responder"],
    [65, "[SALVAGUARDA — ROLADA PELO SISTEMA] Talho profundo (Lobo) de Lobo carregava sangrando."],
    [68, "[REAÇÃO — RESOLVIDA PELO SISTEMA] Contra-ataque: aproveita a brecha e revida."],
  ];
  t("são onze, e com o primeiro fazem os doze da sessão", DA_LUTA.length === 11);
  for (const [ch, pedido] of DA_LUTA) {
    const r = acao("câmara das correntes", { lugar: CAMARA, cidade: VAU, pedido, fonte: "cronista", luta: true, masmorra: true });
    t(`chamada ${ch}: o "câmara das correntes" do Cronista, a meio da luta, é ignorado (não acusa, não move)`, r.acao === "ignora" && r.porque === "luta", JSON.stringify(r));
  }
  /* e o Mestre também, com qualquer coisa: outro sítio, a cidade, null */
  for (const [dito, fonte] of [["o salão de cima", "mestre"], [null, "mestre"], ["cidade", "cronista"], ["Vau Fincado", "mestre"], ["o posto da estrada", "cronista"]]) {
    const r = acao(dito, { lugar: CAMARA, cidade: VAU, pedido: "Ataco Lobo", fonte, luta: true, masmorra: true });
    t(`na luta, ${fonte} a dizer ${JSON.stringify(dito)}: ignorado`, r.acao === "ignora");
  }
  /* na luta FORA de uma masmorra (uma briga na cidade), também */
  const taberna = L.definirLugar("o Rabo do Diabo", { cidade: VAU, distancia: "dentro" });
  t("numa briga dentro dos muros, o lugar dito também não acusa", acao(null, { lugar: taberna, cidade: VAU, pedido: "Ataco o bandido", fonte: "mestre", luta: true }).acao === "ignora");
}

/* ============================================================ */
sec("3. a varredura semeada — dentro nunca acusa, fora nada mudou");
{
  const r = rng(hashSemente("masmorra-na-pauta|lugar"));
  const um = (a) => a[Math.floor(r() * a.length)];
  const LUGARES = [null, POSTO, CAMARA, L.definirLugar("o Rabo do Diabo", { cidade: VAU, distancia: "dentro" }), L.definirLugar("A Nave de Ferro", { cidade: VAU, distancia: "perto" }), L.definirLugar("o quarto de cima", { cidade: VAU, distancia: "dentro", dentroDe: "o Rabo do Diabo" })];
  const DITOS = [null, "", "cidade", "de volta", "Vau Fincado", "o posto da estrada", "câmara das correntes", "A Nave de Ferro", "o salão de cima", "a fazenda de Jessa", "o Rabo do Diabo", 42, { nome: "x" }];
  const PEDIDOS = [J11, "saio daqui e volto para Vau Fincado", "Ataco Lobo", "Seguro a ação e observo", "não saio do balcão", "[PASSAR O TEMPO] Volto para a rua.", "Vou ao Rabo do Diabo", "", null];
  let dentro = 0, acusou = 0, moveu = 0, fora = 0, mudou = 0, lixoMuda = 0;
  for (let i = 0; i < 2000; i++) {
    const base = { lugar: um(LUGARES), cidade: um([VAU, "", "Runa do Poço"]), pedido: um(PEDIDOS), fonte: um(["mestre", "cronista", "??"]) };
    const dito = um(DITOS);
    const luta = r() < 0.4, masmorra = r() < 0.4;
    const sem = acao(dito, { ...base });
    if (luta || masmorra) {
      dentro++;
      const a = acao(dito, { ...base, luta, masmorra });
      if (a.acao === "recusa") acusou++;
      if (a.acao === "novo" || a.acao === "volta") moveu++;
    } else {
      fora++;
      /* a cena livre: com as chaves a falso, o resultado é o de sem chaves */
      if (JSON.stringify(acao(dito, { ...base, luta: false, masmorra: false })) !== JSON.stringify(sem)) mudou++;
    }
    /* chaves de lixo (não booleanas) não fazem a cena ser do sistema */
    if (JSON.stringify(acao(dito, { ...base, luta: "sim", masmorra: 1 })) !== JSON.stringify(sem)) lixoMuda++;
  }
  t(`dentro (luta ou masmorra), ${dentro} casos: nenhuma acusação`, dentro > 500 && acusou === 0, `${acusou}`);
  t(`dentro: e ninguém é movido por um campo de texto`, moveu === 0, `${moveu}`);
  t(`fora (cena livre), ${fora} casos: a decisão é a de antes`, fora > 500 && mudou === 0, `${mudou}`);
  t("chaves de lixo (\"sim\", 1) não valem como cena do sistema", lixoMuda === 0, `${lixoMuda}`);
}

/* ============================================================
   4. a seção nas masmorras de verdade
   ============================================================ */
sec("4. a seção em masmorras geradas — sala a sala, a verdade da planta");
const ACASO = Math.random;
const semeado = (s, f) => { Math.random = rng(hashSemente(s)); try { return f(); } finally { Math.random = ACASO; } };
const MUNDOS = [];
for (const g of generosDisponiveis()) for (const Mo of MOLDES) {
  const semente = `MM16-4|${g}|${Mo.id}`;
  MUNDOS.push({ semente, genero: g, molde: Mo, mapa: gerarGeografia(semente, Mo) });
}
/* um passeio pela planta: BFS da entrada; o chefe por último (o portão);
   cada sala de luta vista de pé e depois vencida (a chave cai pelo desfecho) */
function passeio(mm0) {
  const estados = [];
  let mm = mm0;
  const vistas = new Set([0]);
  const fila = [0];
  const ordem = [];
  while (fila.length) {
    const id = fila.shift();
    const s = mm.salas.find((x) => x.id === id);
    for (const p of s.saidas || []) if (!vistas.has(p)) { vistas.add(p); fila.push(p); }
    if (id !== 0) ordem.push(id);
  }
  const chefe = mm.salas.find((s) => s.tipo === "chefe");
  const semChefe = ordem.filter((id) => id !== chefe.id);
  estados.push({ mm, luta: false });
  for (const id of [...semChefe, chefe.id]) {
    const r = M.entrarNaSala(mm, id);
    if (r.bloqueado) { estados.push({ mm, luta: false, bloqueado: id }); continue; }
    mm = r.mm;
    if (M.abreLuta(r.sala)) {
      estados.push({ mm, luta: true });
      estados.push({ mm, luta: false, dePe: true });
      mm = M.desfechoDaLuta(mm, id).mm;
    } else if (r.sala.tipo !== "enigma") mm = M.marcarResolvida(mm, id);
    else estados.push({ mm, luta: false });
    estados.push({ mm, luta: false });
  }
  return estados;
}
const MASMORRAS = [];
for (let i = 0; i < 60; i++) MASMORRAS.push({ fonte: `gerada nv ${1 + (i % 20)}`, mm: semeado(`gerada|${i}`, () => M.gerarMasmorra("Fantasia medieval", 1 + (i % 20), "")), anunciadas: null });
for (const w of MUNDOS) for (const m of masmorrasDoMundo(w.semente, w.mapa).slice(0, 2)) {
  MASMORRAS.push({ fonte: `${w.genero}/${w.molde.id}: ${m.nome}`, mm: semeado(`mundo|${w.semente}|${m.nome}`, () => M.gerarMasmorra(w.genero, m.nivel, m.nome, { salas: m.salas })), anunciadas: m.salas });
}
{
  const c = { masmorras: 0, estados: 0, planta: 0, plantaMente: 0, sala: 0, salaFalha: 0, linha0: 0, linha0Falha: 0, quem: 0, quemFalha: 0, passagens: 0, passFalha: 0, fundo: 0, fundoFalha: 0, segredo: 0, luta: 0, lutaFalha: 0, posto: 0 };
  const ex = {};
  const nota = (k, s) => { (ex[k] = ex[k] || []).length < 2 && ex[k].push(s); };
  for (const { fonte, mm: mm0, anunciadas } of MASMORRAS) {
    c.masmorras++;
    if (anunciadas != null) { c.planta++; if (mm0.salas.length !== anunciadas) { c.plantaMente++; nota("planta", `${fonte}: ${mm0.salas.length} vs ${anunciadas}`); } }
    for (const { mm, luta } of passeio(mm0)) {
      c.estados++;
      const sala = mm.salas.find((s) => s.id === mm.atual);
      const linhas = paraPauta(mm, { luta });
      const prog = M.progressoMasmorra(mm);
      const fundo = Math.max(...mm.salas.map((s) => s.camada));
      /* a sala vai na 1.ª linha do ONDE, mesmo com um lugar velho registado */
      const onde0 = tenta(() => G.linhaDoLugar({ masmorra: mm, lugar: POSTO, lex: LEX, clima: CLIMA }), "");
      c.sala++;
      const sp = M.SALA_EM_PALAVRAS ? M.SALA_EM_PALAVRAS[sala.tipo] : "?";
      if (!onde0.startsWith(`dentro ${L.comDe(mm.nome)}, ${sp} · ${CLIMA}`) || /posto/.test(onde0)) { c.salaFalha++; nota("sala", onde0); }
      if (/posto/.test(onde0)) c.posto++;
      /* linha 0: a camada, as salas vistas DA PLANTA, a luz */
      c.linha0++;
      const l0 = linhas[0] || "";
      const luzOk = M.noEscuro(mm) ? /NO ESCURO/.test(l0) : l0.includes(`${mm.tochas} ${mm.tochas === 1 ? "tocha" : "tochas"}`);
      if (!l0.includes(`camada ${sala.camada} de ${fundo}`) || !l0.includes(`${prog.visitadas} das ${mm.salas.length} salas`) || !luzOk) { c.linha0Falha++; nota("linha0", l0); }
      if (luta) { c.luta++; if (linhas.length !== 1) { c.lutaFalha++; nota("luta", linhas.join(" | ")); } continue; }
      /* linha 1: quem está, de pé ou caído */
      const nomes = [...new Set((sala.inimigos || []).map((x) => x.nome))].slice(0, M.MASMORRA_NA_PAUTA ? M.MASMORRA_NA_PAUTA.maxNomes : 4);
      if (nomes.length) {
        c.quem++;
        const l = linhas.find((x) => (sala.resolvida ? x.includes("caídos aqui:") : x.startsWith("de pé aqui:"))) || "";
        if (!nomes.every((n) => l.includes(n))) { c.quemFalha++; nota("quem", `${sala.tipo}/${sala.resolvida}: ${linhas.join(" | ")}`); }
      }
      /* as passagens: cada saída para a frente pela pista (ou o portão), e o recuo */
      c.passagens++;
      const lp = linhas.find((x) => x.startsWith("passagens:")) || "";
      const chefe = mm.salas.find((s) => s.tipo === "chefe");
      const esperadas = [...M.saidasDe(mm).map((x) => (x.id === chefe.id ? "o portão do fundo" : x.pista)), ...M.saidasDeRecuo(mm).map((x) => `de volta: ${M.ROTULO_SALA[x.tipo]}`)];
      const max = M.MASMORRA_NA_PAUTA ? M.MASMORRA_NA_PAUTA.maxPassagens : 4;
      if (!lp || !esperadas.slice(0, max).every((e) => lp.includes(e))) { c.passFalha++; nota("passagens", `${lp} — esperava ${esperadas.join(" · ")}`); }
      /* nunca o tipo de uma sala ainda por ver (o recuo é de salas vistas, e diz o tipo delas) */
      const paraAFrente = lp.split(" · ").filter((x) => !x.startsWith("de volta:")).join(" · ");
      for (const x of M.saidasDe(mm)) if (!x.visitada && x.id !== chefe.id && paraAFrente.includes(M.ROTULO_SALA[x.tipo])) { c.segredo++; nota("segredo", lp); }
      /* o fundo: a distância na planta e a chave */
      if (chefe.id !== sala.id) {
        c.fundo++;
        const lf = linhas[linhas.length - 1] || "";
        const d = passagensAte(mm, sala.id, chefe.id);
        const certo = chefe.resolvida ? /o chefe já caiu/.test(lf)
          : lf.includes(d === 1 ? "a uma passagem daqui" : `a ${d} passagens daqui`) && (mm.chave ? /a chave já caiu/.test(lf) : /a chave ainda não caiu/.test(lf));
        if (!certo || d == null) { c.fundoFalha++; nota("fundo", `${lf} (d=${d})`); }
      }
    }
  }
  console.log(`      ${c.masmorras} masmorras (${MASMORRAS.length - 60} do mundo, de ${MUNDOS.length} mundos), ${c.estados} estados`);
  t(`a planta tem as salas que o mundo anuncia (${c.planta - c.plantaMente}/${c.planta})`, c.planta > 30 && c.plantaMente === 0, JSON.stringify(ex.planta));
  t(`a 1.ª linha do ONDE diz a masmorra e a sala, nunca o posto (${c.sala - c.salaFalha}/${c.sala})`, c.salaFalha === 0, JSON.stringify(ex.sala));
  t(`a linha da planta: camada, salas vistas de quantas TEM a planta, a luz (${c.linha0 - c.linha0Falha}/${c.linha0})`, c.linha0Falha === 0, JSON.stringify(ex.linha0));
  t(`quem está na sala, de pé ou caído (${c.quem - c.quemFalha}/${c.quem})`, c.quem > 100 && c.quemFalha === 0, JSON.stringify(ex.quem));
  t(`as passagens, pela pista, e o caminho de volta (${c.passagens - c.passFalha}/${c.passagens})`, c.passFalha === 0, JSON.stringify(ex.passagens));
  t("nenhuma sala por ver é revelada pelo tipo", c.segredo === 0, JSON.stringify(ex.segredo));
  t(`o fundo: a quantas passagens fica o portão, e a chave (${c.fundo - c.fundoFalha}/${c.fundo})`, c.fundo > 100 && c.fundoFalha === 0, JSON.stringify(ex.fundo));
  t(`na luta, uma linha só — quem e a quantos metros é do tabuleiro (${c.luta - c.lutaFalha}/${c.luta})`, c.luta > 100 && c.lutaFalha === 0, JSON.stringify(ex.luta));
}
{
  /* o M13 da sessão, à soleira do guardião */
  const l = paraPauta(NAVE_M13);
  const onde0 = tenta(() => G.linhaDoLugar({ masmorra: NAVE_M13, lugar: POSTO, lex: LEX, clima: CLIMA }), "");
  console.log(`      ONDE      ${onde0}\n      MASMORRA  ${l.join("\n                ")}`);
  t("M13: o ONDE diz a Nave e a sala do guardião, não o posto", onde0 === "dentro da Nave de Ferro, na sala do guardião da chave · calor opressivo · (aqui isto é um forte)", onde0);
  t("M13: a planta é de 6, e vistas 2", (l[0] || "").includes("camada 1 de 3") && (l[0] || "").includes("2 das 6 salas"));
  t("M13: quantos e quem — o Goblin e o Lobo, de pé", l[1] === "de pé aqui: Goblin, Lobo");
  t("M13: as passagens pela pista, e a Entrada para trás", l[2] === "passagens: cheiro de bicho e ferro velho · runas frias piscam devagar · de volta: Entrada");
  t("M13: o portão a duas passagens, lacrado", l[3] === "o portão do fundo: a 2 passagens daqui, lacrado — a chave ainda não caiu");
  const tamanho = [onde0, ...l].reduce((a, x) => a + x.length + 14, 0);
  console.log(`      (o ONDE + a seção: ${tamanho} caracteres na pauta)`);
}

/* ============================================================ */
sec("5. o teto — 500 cenas: luta + masmorra + companheira + o \"como\" + a economia cheia");
const PALAVRAS = "agarro o lobo pelo cachaço rolo com ele no chão aperto a garganta com antebraço até pata quebrada parar de arranhar pedra giro por baixo da mordida quebro pescoço calcanhar estalo seco câmara inteira ouve desço lâmina pela nuca seguro antes de bater".split(" ");
const texto = (r, min, max) => {
  const alvo = min + Math.floor(r() * (max - min + 1));
  let s = "";
  while (s.length < alvo) s += (s ? " " : "") + PALAVRAS[Math.floor(r() * PALAVRAS.length)];
  return s.slice(0, alvo).trim();
};
const talvez = (r, p) => r() < p;
const ESTADOS = MASMORRAS.flatMap((x) => passeio(x.mm).map((e) => e.mm));
/* Uma pauta de masmorra como o App a monta depois desta leva: o ONDE do
   Geógrafo (a linha com a sala, o endereço, o que o espaço comporta — SEM o
   domínio, a casa e a lei do andar, que a secção 9 prova fora dela lá
   dentro), a planta, a economia (que cede), os vetos, a companheira, o
   resto ao acaso, e na luta o golpe final do turno. `comSecao: false` é a
   mesma cena sem a seção MASMORRA — o termo de comparação. */
function cena(i, { luta, comSecao = true }) {
  const r = rng(hashSemente(`masmorra-na-pauta|${luta ? "luta" : "fora"}|${i}`));
  const mm = ESTADOS[Math.floor(r() * ESTADOS.length)];
  const onde0 = G.linhaDoLugar({ masmorra: mm, lugar: POSTO, lex: LEX, clima: CLIMA });
  const onde = [onde0, texto(r, 15, 25), "comporta: " + texto(r, 110, 210)];
  let p = porNaPauta({}, "onde", ...onde);
  if (comSecao) p = porNaPauta(p, "masmorra", paraPauta(mm, { luta }));
  p = porNaPauta(p, "economia", texto(r, 200, 300));
  p = porNaPauta(p, "naoPode", ...Array.from({ length: 1 + Math.floor(r() * 3) }, () => texto(r, 80, 200)));
  /* a companheira: o que faz, o que diz, quem é */
  p = porNaPauta(p, "gente", `Iracema Sousa ${texto(r, 30, 90)}`);
  if (talvez(r, 0.5)) p = porNaPauta(p, "aliado", `Iracema Sousa ${texto(r, 40, 110)}`);
  if (talvez(r, 0.35)) p = porNaPauta(p, "fala", texto(r, 60, 200));
  for (const [id, pr, min, max] of [["contra", luta ? 0.7 : 0, 50, 130], ["momento", 0.4, 60, 160], ["antes", 0.7, 100, 180], ["quem", 0.3, 30, 90], ["daqui", 0.3, 100, 180], ["mundo", 0.3, 100, 200], ["cidade", 0.3, 80, 150]]) if (talvez(r, pr)) p = porNaPauta(p, id, texto(r, min, max));
  let env = null, junto = null;
  if (luta) {
    const escolha = talvez(r, 0.4) ? "nao_letal" : "letal";
    const alvo = aplicarEscolha({ nome: um(r, ["Lobo", "Goblin", "Esqueleto", "Vorgath, o Carrasco das Sete Colinas"]), vida: 2 }, escolha, { semente: `mm16-4|${i}` });
    env = envelopeDoGolpeFinal({ alvo, escolha, heroi: um(r, ["Tobias Varzim", "Iracema Sousa"]), comoFez: texto(r, 1, 300) });
    junto = env;
    if (talvez(r, 0.25)) {
      const e2 = envelopeDoGolpeFinal({ alvo: aplicarEscolha({ nome: "Goblin", vida: 1 }, escolha, { semente: `mm16-4b|${i}` }), escolha, heroi: "Iracema Sousa" });
      junto = { acabou: [...env.acabou, ...e2.acabou], naoPode: [...env.naoPode, ...e2.naoPode] };
    }
    p = golpeFinalNaPauta(p, junto);
  }
  p = cederNaCena(p, { luta, masmorra: true, arredores: true });
  return { p, env, junto, onde0, masmorra: paraPauta(mm, { luta }), naoPode0: (p.naoPode || [])[0] };
}
function um(r, a) { return a[Math.floor(r() * a.length)]; }
const N = 500;
const medir = ({ luta }) => {
  const c = { como: 0, fato: 0, veto: 0, lugar: 0, teto: 0, naoPode: 0, naoPodeSem: 0, vetoTirado: 0, m0: 0, mTodas: 0, m1: 0 };
  for (let i = 0; i < N; i++) {
    const { p, env, junto, onde0, masmorra, naoPode0 } = cena(i, { luta });
    const txt = textoDaPauta(p, { turno: i + 1 });
    /* a mesma cena sem a seção: o veto que lá chega tem de chegar aqui */
    const txtSem = textoDaPauta(cena(i, { luta, comSecao: false }).p, { turno: i + 1 });
    const vetosSem = (cena(i, { luta, comSecao: false }).p.naoPode || []).filter((v) => txtSem.includes(v));
    if (txtSem.includes(naoPode0)) c.naoPodeSem++;
    if (!vetosSem.every((v) => txt.includes(v))) c.vetoTirado++;
    if (luta) {
      if (env.acabou[1] && txt.includes(env.acabou[1])) c.como++;
      if (junto.acabou.filter((l) => !/nas palavras do jogador/.test(l)).every((l) => txt.includes(l))) c.fato++;
      if (junto.naoPode.every((l) => txt.includes(l))) c.veto++;
    }
    if (txt.includes(onde0)) c.lugar++;
    if (txt.length <= TETO_DA_PAUTA) c.teto++;
    if (txt.includes(naoPode0)) c.naoPode++;
    if (masmorra[0] && txt.includes(masmorra[0])) c.m0++;
    if (masmorra[1] && txt.includes(masmorra[1])) c.m1++;
    if (masmorra.every((l) => txt.includes(l))) c.mTodas++;
  }
  return c;
};
{
  const c = medir({ luta: true });
  t(`na luta: a frase do golpe final chega inteira (${c.como}/${N})`, c.como === N);
  t(`na luta: todo fato de quem caiu chega (${c.fato}/${N})`, c.fato === N);
  t(`na luta: todo veto de quem caiu chega (${c.veto}/${N})`, c.veto === N);
  t(`na luta: a 1.ª linha do ONDE — a masmorra e a sala — nunca cai (${c.lugar}/${N})`, c.lugar === N);
  t(`na luta: a seção não tira veto nenhum — todo veto que chega sem ela chega com ela (${N - c.vetoTirado}/${N})`, c.vetoTirado === 0);
  console.log(`      (o primeiro veto da cena chega em ${c.naoPode}/${N}; sem a seção, em ${c.naoPodeSem}/${N} — o que o corta é o ferro do desfecho, não a planta)`);
  t(`na luta: o teto nunca passa (${c.teto}/${N})`, c.teto === N);
  console.log(`      (na luta, a linha da planta entra em ${c.m0}/${N} — cede ao desfecho, que é de ferro)`);
}
{
  const c = medir({ luta: false });
  t(`fora da luta: a 1.ª linha do ONDE nunca cai (${c.lugar}/${N})`, c.lugar === N);
  t(`fora da luta: o primeiro veto nunca cai (${c.naoPode}/${N})`, c.naoPode === N);
  t(`fora da luta: a seção não tira veto nenhum (${N - c.vetoTirado}/${N})`, c.vetoTirado === 0);
  /* não é 100% de propósito: a planta corta depois de todo veto, e numa
     cena com três vetos longos, a fala e o que o espaço comporta, cede. O
     que não cede é a SALA — está na 1.ª linha do ONDE, de ferro (acima). */
  t(`fora da luta: a planta (camada, salas vistas, luz) chega em 98% ou mais (${c.m0}/${N})`, c.m0 >= N * 0.98);
  t(`fora da luta: quem está / o que resta chega em 95% ou mais (${c.m1}/${N})`, c.m1 >= N * 0.95);
  t(`fora da luta: o teto nunca passa (${c.teto}/${N})`, c.teto === N);
  console.log(`      (fora da luta, a seção inteira — com as passagens e o fundo — entra em ${c.mTodas}/${N})`);
}
{
  /* POR QUE NÃO 0,95 (o comentário de SECOES): com a seção à frente de tudo
     o que é de prio 2, numa pauta cheia, o primeiro veto cede. */
  const s = SECOES.find((x) => x.id === "masmorra");
  if (s) {
    const prio = s.prio;
    s.prio = 0.95;
    let perdeu = 0;
    try {
      let cheia = {};
      for (const x of SECOES) if (!["desfecho", "vetoDoDesfecho"].includes(x.id)) for (let k = 0; k < 4; k++) cheia = porNaPauta(cheia, x.id, `${x.id}-${k} ` + "z".repeat(90));
      if (!textoDaPauta(cheia).includes("naoPode-0")) perdeu++;
    } finally { s.prio = prio; }
    let cheia = {};
    for (const x of SECOES) if (!["desfecho", "vetoDoDesfecho"].includes(x.id)) for (let k = 0; k < 4; k++) cheia = porNaPauta(cheia, x.id, `${x.id}-${k} ` + "z".repeat(90));
    const tx = textoDaPauta(cheia);
    t("com prio 0,95, numa pauta cheia, o primeiro veto cairia; com a da tabela, fica", perdeu === 1 && tx.includes("naoPode-0"));
  } else t("a seção existe para medir", false);
}

/* ============================================================ */
sec("6. a verdade da planta — \"12 salas\" é a planta, e a pauta diz o número dela");
{
  /* o mundo da sessão anunciava "A Nave de Ferro (templo, nível 6, 12 salas)" */
  const nave = semeado("nave-12", () => M.gerarMasmorra("Fantasia medieval", 6, "A Nave de Ferro", { salas: 12 }));
  t("com o anúncio do mundo, a planta da Nave tem 12 salas", nave.salas.length === 12, `${nave.salas.length}`);
  t("e a pauta conta-as: \"1 das 12 salas\"", (paraPauta(nave)[0] || "").includes("1 das 12 salas"));
  const sem = semeado("nave-12", () => M.gerarMasmorra("Fantasia medieval", 6, "A Nave de Ferro"));
  t("sem o anúncio, o gerador é o de sempre (6 a 8 salas no nível 6), e a pauta diz o número DESSA planta", sem.salas.length >= 6 && sem.salas.length <= 8 && (paraPauta(sem)[0] || "").includes(`1 das ${sem.salas.length} salas`));
  /* regressão zero: sem a opção, a mesma semente dá a MESMA masmorra que o
     gerador de antes (o mesmo número de sorteios, na mesma ordem) — a opção
     `null` e `{}` também */
  const a = semeado("rz", () => M.gerarMasmorra("Fantasia medieval", 9, "X"));
  const b = semeado("rz", () => M.gerarMasmorra("Fantasia medieval", 9, "X", null));
  const c = semeado("rz", () => M.gerarMasmorra("Fantasia medieval", 9, "X", {}));
  t("sem a opção (ou com null, ou {}), a mesma semente dá a mesma masmorra", JSON.stringify(a) === JSON.stringify(b) && JSON.stringify(a) === JSON.stringify(c));
  /* toda planta com o número pedido é jogável: tudo alcançável, a chave antes do portão */
  let jogaveis = 0, total = 0;
  for (let n = 4; n <= 20; n++) for (let k = 0; k < 20; k++) {
    total++;
    const mm = semeado(`n|${n}|${k}`, () => M.gerarMasmorra("Fantasia medieval", 1 + (k % 15), "", { salas: n }));
    const chefe = mm.salas.find((s) => s.tipo === "chefe"), chave = mm.salas.find((s) => s.guardaChave);
    const todas = mm.salas.every((s) => s.id === 0 || passagensAte(mm, 0, s.id) != null);
    if (mm.salas.length === n && chefe && chefe.trancada && chave && todas && chave.camada < chefe.camada) jogaveis++;
  }
  t(`toda planta de 4 a 20 salas nasce com o número pedido, inteira e com a chave antes do portão (${jogaveis}/${total})`, jogaveis === total);
  t("larguraDasCamadas: o leque abre à porta e afunila (12 → 3,3,2,2)", JSON.stringify(larguras(12)) === "[3,3,2,2]" && JSON.stringify(larguras(5)) === "[2,1]" && JSON.stringify(larguras(6)) === "[2,2]");
  t("larguraDasCamadas: lixo é null, e o clamp segura os extremos", larguras(null) === null && larguras("x") === null && larguras(undefined) === null && JSON.stringify(larguras(1)) === "[1,1]" && larguras(99).reduce((a, x) => a + x, 2) === 20);
  /* e o prompt do mundo continua a dizer o número que o mundo tem — que é,
     agora, o da planta */
  const w = MUNDOS[0];
  const m = masmorrasDoMundo(w.semente, w.mapa)[0];
  const q = oQueExisteAqui(w.semente, w.mapa, m.cidadeProxima, null, w.genero, w.molde) || {};
  const anunciada = (q.masmorras || []).find((x) => x.nome === m.nome);
  const planta = semeado("prompt", () => M.gerarMasmorra(w.genero, m.nivel, m.nome, { salas: m.salas }));
  t(`o número do prompt ("${anunciada ? anunciada.salas : "?"} salas") é o da planta (${planta.salas.length})`, !!anunciada && anunciada.salas === planta.salas.length);
}

/* ============================================================ */
sec("7. ao entrar, o lugar vigente é a boca — e o posto não volta");
{
  const mm = { ...NAVE_M13, coord: { x: 44, y: 52 } };
  const antes = JSON.stringify(POSTO);
  const l = aoEntrar(mm, { cidade: VAU, dia: 4, lugar: POSTO });
  t("do posto, entrar põe o lugar na boca da Nave", !!l && l.nome === "A Nave de Ferro" && l.distancia === "perto" && l.cidade === VAU && l.coord && l.coord.x === 44 && l.coord.y === 52);
  t("e não muta o lugar que recebeu", JSON.stringify(POSTO) === antes);
  const naBoca = L.definirLugar("Nave de Ferro", { cidade: VAU, distancia: "perto", coord: { x: 44, y: 52 } });
  t("quem já está à boca (sem o artigo, até) fica onde está — o mesmo lugar", aoEntrar(mm, { cidade: VAU, dia: 9, lugar: naBoca }) === naBoca);
  t("lixo: sem masmorra com nome, nada a registar", aoEntrar(null, { lugar: POSTO }) === null && aoEntrar({}, null) === null && aoEntrar({ nome: "" }) === null);
  t("opções null não rebentam (o `= {}` não cobre null)", !!aoEntrar(mm, null) && aoEntrar(mm, null).nome === "A Nave de Ferro");
  /* o ONDE lá dentro e cá fora, com o lugar da boca */
  const dentro = G.linhaDoLugar({ masmorra: mm, lugar: l, lex: LEX, clima: CLIMA });
  const fora = G.linhaDoLugar({ masmorra: null, lugar: l, cidadeAtual: VAU, clima: CLIMA });
  t("lá dentro o ONDE diz a Nave e a sala", dentro.startsWith("dentro da Nave de Ferro, na sala do guardião da chave"), dentro);
  t("ao sair, o herói está diante da porta por onde saiu — não no posto", /Nave de Ferro/.test(fora) && !/posto/.test(fora), fora);
  /* e o lugar dito pela IA lá dentro já não o tira de lá */
  t("lá dentro, o null do Mestre contra o lugar da boca é ignorado", acao(null, { lugar: l, cidade: VAU, pedido: "entro na Nave de Ferro", fonte: "mestre", masmorra: true }).acao === "ignora");
  /* fora da masmorra o ONDE é o de sempre */
  t("fora da masmorra, o ONDE da estrada continua igual (o lugar ganha)", G.linhaDoLugar({ lugar: POSTO, cidadeAtual: VAU, clima: CLIMA }) === "no posto da estrada · calor opressivo");
  t("e a cidade também", G.linhaDoLugar({ cidadeAtual: VAU }).startsWith(`em ${VAU}`));
  t("fora da masmorra a seção não existe", paraPauta(null).length === 0 && paraPauta(undefined).length === 0);
}

/* ============================================================ */
sec("8. lixo, null, imutabilidade, determinismo");
{
  t("masmorraParaPauta com lixo é []", [null, undefined, 3, "x", {}, { salas: [] }, { salas: "x" }, { salas: [null], atual: 0 }].every((x) => Array.isArray(paraPauta(x)) && paraPauta(x).length === 0));
  t("opções null ou lixo: como fora da luta", JSON.stringify(paraPauta(NAVE_M13, null)) === JSON.stringify(paraPauta(NAVE_M13)) && JSON.stringify(paraPauta(NAVE_M13, { luta: "sim" })) === JSON.stringify(paraPauta(NAVE_M13)));
  const antes = JSON.stringify(NAVE_M13);
  paraPauta(NAVE_M13); paraPauta(NAVE_M13, { luta: true }); salaEmPalavras(NAVE_M13); tenta(() => passagensAte(NAVE_M13, 0, 5));
  t("não mutam a masmorra", JSON.stringify(NAVE_M13) === antes);
  t("a mesma masmorra dá sempre a mesma seção", JSON.stringify(paraPauta(NAVE_M13)) === JSON.stringify(paraPauta(JSON.parse(antes))));
  t("salaEmPalavras com lixo é \"\"", [null, {}, { salas: [] }, { salas: [{ id: 0, tipo: "inventada" }], atual: 0 }].every((x) => salaEmPalavras(x) === ""));
  t("passagensAte: a mesma sala é 0; sem caminho ou lixo, null", passagensAte(NAVE_M13, 1, 1) === 0 && passagensAte(NAVE_M13, 0, 99) === null && passagensAte(null, 0, 1) === null);
  t("passagensAte anda para os dois lados (do fundo à entrada)", passagensAte(NAVE_M13, 5, 0) === 3 && passagensAte(NAVE_M13, 0, 5) === 3);
  /* uma sala vencida, com o mesmo bicho duas vezes, e caídos que não cabem */
  const cheia = { ...NAVE_M13, salas: NAVE_M13.salas.map((s) => (s.id === 1 ? { ...s, resolvida: true, inimigos: ["Lobo", "Lobo", "Goblin", "Rato", "Morcego", "Aranha"].map((nome) => ({ nome })) } : s)), chave: true };
  const l = paraPauta(cheia);
  t("a sala vencida diz o que ficou e quem caiu, contado e com teto", l[1] === "o guardião já caiu e o que ele guardava já foi levado — caídos aqui: Lobo ×2, Goblin, Rato, Morcego e mais 1", l[1]);
  t("com a chave na mão, o portão abre", l[3] === "o portão do fundo: a 2 passagens daqui, e a chave já caiu — abre", l[3]);
  const escuro = paraPauta({ ...NAVE_M13, tochas: 0 });
  t("sem tochas, a planta diz NO ESCURO", /NO ESCURO/.test(escuro[0] || ""));
  const enig = paraPauta({ ...NAVE_M13, atual: 4, salas: NAVE_M13.salas.map((s) => (s.id === 4 ? { ...s, visitada: true } : s)) });
  t("à frente de uma tranca por abrir, a pauta di-lo (e o tipo dela)", enig[1] === "a tranca (inscrição) ainda por abrir", JSON.stringify(enig));
}

/* ============================================================
   9. A FIAÇÃO NO App (texto; corpo por âncora). É da etapa do frontend:
   até ela, esta secção falha — e é isso que diz que falta.
   ============================================================ */
sec("9. a fiação no App.jsx");
{
  const APP = tenta(() => readFileSync(join(AQUI, "..", "src", "App.jsx"), "utf8").replace(/\r\n/g, "\n"), "");
  const corpoDe = (decl, fim = "\n  };\n") => { const i = APP.indexOf(decl); return i < 0 ? "" : APP.slice(i, APP.indexOf(fim, i)); };
  const reg = corpoDe("const registrarLugar = (nome, fonte = \"mestre\") => {");
  t("registrarLugar existe", reg.length > 0);
  t("registrarLugar diz a lerLugarDito se a cena é da luta e da masmorra",
    /lerLugarDito\(nome, \{ lugar: lugarRef\.current, cidade, pedido: ultimoPedidoRef\.current, fonte, luta: !!combateRef\.current, masmorra: !!masmorraRef\.current \}\)/.test(reg));
  t("e já não acusa o Mestre por uma luta aberta (a recusa de combate saiu)", !/Você mudou o meu lugar no meio de um combate/.test(APP));
  const ent = corpoDe("const entrarMasmorra = (nomeSugerido = \"\", opcoes = null) => {");
  t("entrarMasmorra põe o lugar vigente na boca (lugarAoEntrarNaMasmorra)", /lugarAoEntrarNaMasmorra\(mm, \{/.test(ent) && /from "\.\/boca\.js"/.test(APP));
  t("entrarMasmorra gera a planta com as salas que o mundo anuncia", /gerarMasmorra\([^;]*\{ salas: doMapa \? doMapa\.salas : null \}\);/.test(ent));
  const pt = corpoDe("const pautaDoTurno = (acaoDoTurno = \"\") => {");
  t("pautaDoTurno põe a planta na seção masmorra",
    /porNaPauta\(p, "masmorra", masmorraParaPauta\(masmorraRef\.current, \{ luta: !!combateRef\.current \}\)\)/.test(pt));
  t("…em try/catch, pelo calou", /try \{\s*p = porNaPauta\(p, "masmorra", masmorraParaPauta\([^)]*\)[^)]*\);\s*\} catch \(e\) \{ calou\("masmorraParaPauta", e\); \}/.test(pt));
  /* o ONDE da cidade (o domínio, a casa, a lei do andar) não é o lugar lá
     dentro, e não pode passar à frente da planta */
  t("dentro da masmorra, o domínio não vai ao ONDE", /if \(cd && cd\.relacao === "jogador" && !masmorraRef\.current\)/.test(pt));
  t("nem a casa (guilda)", /if \(casa && !masmorraRef\.current\) p = porNaPauta\(p, "onde", envelopeDaGuilda\(casa\)\);/.test(pt));
  t("nem a lei do andar", /if \(!jornadaRef\.current && !masmorraRef\.current\) \{[^\n]*\n\s*const lf = leiParaPauta\(/.test(pt));
}

console.log(`\nmasmorra na pauta (MM16 nº 4): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
