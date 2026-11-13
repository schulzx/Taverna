/* ============================================================
   TE9 · OS ESPÓLIOS A ACONTECER, NO MOTOR (09/11/2026) — testes/teste-te9-motor.mjs

   A TE6 deu a conta (src/espolios.js) e não aplicava nada; a TE9 aplica-a
   turno a turno em motor/quests-do-turno.js, para o replay pagar o mesmo
   que o jogo pagou. Esta suíte joga uma campanha sintética de ponta a ponta
   e prova, por esta ordem:

     §1 as tabelas e as portas — a chave da paga é a de espolios.js, cada
        efeito novo tem órgão, o trinco do feito não morde o mundo antigo;
     §2 a campanha: o escondido achado e levado (e não duas vezes), o achado
        da etapa no chão, a quest que fecha e paga uma vez, o anúncio de um
        turno, a pauta do turno seguinte e o veto;
     §3 NUNCA DUAS VEZES — o replay igual ao turno, a mesma campanha duas
        vezes, um load a meio, a versão antiga que deita fora a chave, e a
        quest que fechou antes da TE9 (não paga para trás);
     §4 a paga substitui o feito — o feito deste turno desconta-se, o do
        turno seguinte não entra (o aplicar), e o replay passa-o;
     §5 o artefacto que acorda — pelos níveis, pela quest quente, pelo
        confronto; e a porta do gesto (relicas.js) abre no exaltado;
     §6 o teto da pauta: ≤ 1400 com o anúncio cheio, e o prompt fixo intacto;
     §7 o lixo e a imutabilidade.
   ============================================================ */
/* NE7 (13/11): o padrão do Narrador virou o «boca» (portas fechadas). Esta suíte mede o que as portas ABERTAS fazem — o comportamento de antes —, e por isso joga as peças no «mestre», a reserva da tabela: NM.<peça> (no-mestre.mjs) é a peça com o modo dito. O padrão novo prova-se em teste-nada-entra-pelo-ator §10 e §11. */
import { M as NM } from "./no-mestre.mjs";
import fs from "node:fs";
import { ESPOLIO_NO_TURNO, QUESTS_DO_TURNO, garantirQuestsDaEspinha, oTurnoDasQuests, aMesaDasQuests, oFeitoJaPago } from "../src/motor/quests-do-turno.js";
import { EFEITOS_NA_TELA, oQueOEfeitoPede } from "../src/motor/efeitos-da-quest.js";
import { aplicarOTurno } from "../src/motor/aplicar.js";
import { pagaDaQuest, achadoEscondido, promessaDoArtefacto, revelacaoDoEspolio, despertarArtefacto, LINHA_DO_ESPOLIO, DESPERTAR_DO_ARTEFACTO, ARTEFACTOS_COM_NOME } from "../src/espolios.js";
import { esqueletoDaCampanha, comOEsqueleto } from "../src/esqueleto.js";
import { BIBLIOTECA_DE_QUESTS, questPorId } from "../src/biblioteca-de-quests.js";
import { garantirHistoria, ESTRUTURAS } from "../src/historia.js";
import { gerarGeografia, rngDe } from "../src/geografia.js";
import { estenderEspinha, garantirEspinha } from "../src/saga.js";
import { nucleoDaCampanha } from "../src/nucleo.js";
import { chefesDoMundo } from "../src/mundo-base.js";
import { garantirFactos } from "../src/livro-de-factos.js";
import { caidosParaOLivro } from "../src/motor/luta-do-turno.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";
import { PASSOS_DO_REPLAY } from "../src/sessao.js";
import { aPautaDoTurno } from "../src/motor/pauta-do-turno.js";
import { textoDaPauta, TETO_DA_PAUTA } from "../src/pauta.js";
import { xpDoFeito } from "../src/juiz.js";
import { reliquiasEquipadas, podeUsarAtivo, usarAtivo, ativoDeclarado, itemDaReliquia, reliquiaPorId, danoDaReliquia } from "../src/relicas.js";
import { fraseDaTroca } from "../src/comparar-item.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const arr = (x) => (Array.isArray(x) ? x : []);
/* o mesmo objeto, com as chaves por ordem (a catraca da espinha reordena-as) */
const canon = (x) => JSON.stringify(x, (k, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((c) => [c, v[c]])) : v));
const congelar = (x) => { if (x && typeof x === "object" && !Object.isFrozen(x)) { Object.freeze(x); Object.values(x).forEach(congelar); } return x; };

/* ---------------- o mundo: o de teste-bq7-motor, com as três quests da planta ---------------- */
const DA_PLANTA = BIBLIOTECA_DE_QUESTS.filter((q) => ["o_salvo_conduto", "as_cinzas_de_ontem", "a_carta_que_nao_se_abre"].includes(q.id));
const HEROI = { nome: "Vera", classe: "Guerreiro", nivel: 3, xp: 0, nivelPendentes: 0, vidaMax: 30, vida: 30, manaMax: 10, mana: 10, moedas: 100, grupo: [], inventario: [], equipamento: [], equipados: {}, efeitos: [], condicoes: [] };
function mundoNovo(semente, estrutura = "jornada", antecedente = "soldado", catalogo = DA_PLANTA) {
  const mapa = gerarGeografia(semente, null, null);
  const espinha0 = estenderEspinha({ semente, mapa, estrutura, cidadeInicial: mapa.cidades[0].nome, antecedente, dia: 1 });
  const nucleo = nucleoDaCampanha(semente, mapa, { espinha: espinha0, antecedente, grupo: [] });
  const esq = esqueletoDaCampanha({ semente, mapa, espinha: espinha0, antecedente, nucleo, chefes: chefesDoMundo(semente, mapa), ...(catalogo ? { catalogo } : {}) });
  const espinha = comOEsqueleto(espinha0, esq);
  return {
    semente, esq, espinha0, mundo: { semente },
    estado: {
      espinha, historia: garantirHistoria({ estrutura, etapa: 0 }), mapa,
      cidadeAtual: mapa.cidades[0].nome, lugar: null, jornada: null,
      personagem: HEROI, npcs: {}, canone: {}, factos: garantirFactos(null), saber: [], dia: 1, npcTurno: 0,
      chao: { cena: "", itens: [] },
    },
  };
}
let nT = 1;
const N = (nome, local) => ({ nome, conhecidoEm: 1, local, relacao: "neutro", status: "vivo", consultas: 0 });
const registar = (E, ...ps) => ({ ...E, npcs: { ...E.npcs, ...Object.fromEntries(ps.map((p) => [p.nome, N(p.nome, p.cidade || E.cidadeAtual)])) } });
const falar = (E, ...nomes) => ({ ...E, factos: anotarOLivro(E, { tipo: "factos", dia: E.dia, turno: (nT += 10), falouCom: nomes }).factos });
const lutar = (E, ...caidos) => ({ ...E, factos: anotarOLivro(E, { tipo: "factos", dia: E.dia, turno: (nT += 10), derrotados: caidosParaOLivro(caidos) }).factos });
const ir = (E, cidade, lugar) => { const E2 = { ...E, cidadeAtual: cidade, jornada: null, lugar: lugar || null }; return { ...E2, factos: anotarOLivro(E2, { lugar: lugar || null, dia: E2.dia, turno: (nT += 10) }).factos }; };
const Q = (E) => garantirQuestsDaEspinha(E.espinha.quests);
const registoDe = (E, id) => Q(E).registos.find((r) => r.id === id) || null;
const turno = (W, E, f, op = {}) => { const E1 = f ? f(E) : E; const r = oTurnoDasQuests(E1, { mundo: W.mundo, ...op }); return { E: r ? { ...E1, ...r.estado } : E1, r, antes: E1 }; };

/* A CAMPANHA, passo a passo — devolve cada estado, para as secções seguintes */
function jogar(W, { feitoNoFecho = null } = {}) {
  nT = 1;
  const passos = {};
  let { E, r } = turno(W, W.estado);
  passos.abre = { E, r };
  const P = registoDe(E, "o_salvo_conduto").papeis;
  /* T1: ouvir quem pede */
  ({ E, r } = turno(W, E, (e) => falar(registar(e, { nome: P.protegido.nome, cidade: P.origem.cidade }, { nome: P.guarda.nome, cidade: P.origem.cidade }), P.protegido.nome, P.guarda.nome)));
  passos.ouvir = { E, r };
  /* T2: o desvio — o sítio opcional; o escondido está lá e ninguém o disse */
  const desvio = { nome: P.desvio.nome, chave: P.desvio.chave, cidade: P.desvio.cidade };
  ({ E, r } = turno(W, E, (e) => ir(e, P.desvio.cidade, desvio)));
  passos.desvio = { E, r };
  /* T3: voltar ao desvio outra vez — o escondido já foi levado */
  ({ E, r } = turno(W, E, (e) => ir(e, P.desvio.cidade, desvio)));
  passos.voltar = { E, r };
  /* T4: à estrada com quem se protege */
  ({ E, r } = turno(W, E, (e) => ({ ...e, jornada: { para: P.destino.cidade }, lugar: null, personagem: { ...e.personagem, grupo: [{ nome: P.protegido.nome, vinculo: 30 }] } })));
  passos.estrada = { E, r };
  /* T5: o servo cai e é poupado — a etapa do passo fecha pelo ramo violento */
  ({ E, r } = turno(W, E, (e) => lutar(registar(e, { nome: P.tenente.nome }), { nome: P.tenente.nome, rendido: true })));
  passos.passo = { E, r };
  /* T6: em destino — concluída, e paga */
  const r6 = turno(W, E, (e) => ({ ...ir(e, P.destino.cidade, null), dia: e.dia + 2 }), feitoNoFecho ? { feitoDoTurno: feitoNoFecho } : {});
  ({ E, r } = r6);
  passos.fecho = { E, r, antes: r6.antes };
  /* T7: o turno seguinte (o Narrador narra o fecho) — e o fim dele */
  ({ E, r } = turno(W, E));
  passos.depois = { E, r };
  return { P, passos, fim: E };
}

const W = mundoNovo("BQ7|0");
const C = jogar(W);
const { P, passos } = C;

sec("§1 as tabelas e as portas");
{
  const S = ESPOLIO_NO_TURNO;
  const F = questPorId("o_salvo_conduto");
  const R = registoDe(passos.fecho.E, "o_salvo_conduto");
  const pg = pagaDaQuest(F, R, { semente: "x", nivel: 3 });
  t("a chave da paga de espolios.js começa pelo prefixo que `aplicadas` aceita", pg && pg.chave === S.chave + F.id, pg && pg.chave);
  t("o histórico das pagas tem teto, e o anúncio leva no máximo duas linhas", Number.isInteger(S.pagas) && S.pagas > 0 && S.anuncio.linhas >= 1 && S.anuncio.linhas <= 2);
  t("as linhas do relato são todas da tabela, com os buracos que a peça enche", ["paga", "xp", "moedas", "naMochila", "noChao", "achado", "ganhoMoedas", "ganhoItem", "nivel", "desperto", "exaltado"].every((k) => typeof S.linhas[k] === "string" && S.linhas[k].length > 0));
  t("cada estado do artefacto que acorda tem a sua linha", DESPERTAR_DO_ARTEFACTO.ordem.slice(1).every((k) => S.linhas[k]));
  t("o efeito «espolio» tem órgão na tela (a revelação), e só esse sítio", !!EFEITOS_NA_TELA.orgao.espolio && !EFEITOS_NA_TELA.calado.espolio && !EFEITOS_NA_TELA.soNarrador.includes("espolio"));
  t("o trinco do feito não morde o mundo antigo nem o lixo", oFeitoJaPago(W.espinha0) === false && oFeitoJaPago(null) === false && oFeitoJaPago({}) === false && oFeitoJaPago({ esqueleto: {}, quests: "lixo" }) === false);
  t("garantirQuestsDaEspinha aceita a chave da paga, e recusa a torta", J(garantirQuestsDaEspinha({ aplicadas: { "espolio:o_salvo_conduto": 1, "espolio:": 1, "outra:o_salvo_conduto": 1, o_salvo_conduto: 2 } }).aplicadas) === J({ "espolio:o_salvo_conduto": 1, o_salvo_conduto: 2 }));
  const g0 = garantirQuestsDaEspinha({});
  t("e sem espólio nenhum a forma é a de antes (nem `pagas` nem `anuncio`)", !("pagas" in g0) && !("anuncio" in g0));
}

sec("§2 a campanha de ponta a ponta");
{
  const { desvio, voltar, passo, fecho, depois, ouvir } = passos;
  /* o escondido */
  const R2 = registoDe(desvio.E, "o_salvo_conduto");
  const esc = achadoEscondido(questPorId("o_salvo_conduto"), registoDe(ouvir.E, "o_salvo_conduto"), { semente: W.semente, nivel: 3, estado: desvio.E, mundo: W.mundo, tipoDoLugar: () => "taverna" });
  t("o escondido do desvio é o da taverna (o fim da chave do sítio: «Cidade|taverna»)", esc && esc.achado.sitio === "taverna" && esc.onde === "desvio", J(esc && esc.achado));
  t("estar no desvio acha-o: o id entra em espolio.achados, e ninguém o anunciou antes", R2.espolio && R2.espolio.achados.includes(esc.achado.id) && R2.espolio.pago === false && !registoDe(ouvir.E, "o_salvo_conduto").espolio);
  t("as moedas dele entram na bolsa (moeda não vai ao chão)", desvio.E.personagem.moedas === ouvir.E.personagem.moedas + esc.achado.moedas && desvio.E.chao.itens.length === 0, `${ouvir.E.personagem.moedas} → ${desvio.E.personagem.moedas}`);
  t("e o relato diz o achado, com o que deu", desvio.r.linhas.some((l) => l.startsWith("✧") && l.includes(`+${esc.achado.moedas} moedas`)), J(desvio.r.linhas));
  t("voltar ao desvio não o dá outra vez", voltar.E.personagem.moedas === desvio.E.personagem.moedas && !voltar.r.linhas.some((l) => l.startsWith("✧")) && J(registoDe(voltar.E, "o_salvo_conduto").espolio) === J(R2.espolio));
  t("o achado anuncia-se ao Narrador no turno seguinte («O QUE O HERÓI ACHOU»)", Q(desvio.E).anuncio && Q(desvio.E).anuncio.linhas[0].startsWith(LINHA_DO_ESPOLIO.achou) && Q(desvio.E).anuncio.feito === false);
  t("e o anúncio vive um turno: no fim do seguinte já não está", !Q(voltar.E).anuncio);

  /* o achado da etapa */
  const R5 = registoDe(passo.E, "o_salvo_conduto");
  const noChao = passo.E.chao.itens.filter((i) => i.pronto && i.pronto.consumivel);
  t("a etapa que fecha por um ramo deixa o achado do sítio dela — no chão, à espera de quem se baixe", R5.feitas.passo.ramo === "violenta" && noChao.length === 1 && R5.espolio.achados.some((id) => id.startsWith("o_salvo_conduto:passo:")), J(passo.E.chao.itens.map((i) => i.nome)));
  t("o achado do chão leva o objeto pronto (o que entra na ficha ao apanhar), e a cena de agora", noChao[0].destino === "inventario" && noChao[0].pronto.nome === noChao[0].nome && passo.E.chao.cena.length > 0);
  t("as etapas que não fecham por ramo não dão achado", !R5.espolio.achados.some((id) => /:(aceitar|estrada):/.test(id)));

  /* a paga */
  const R6 = registoDe(fecho.E, "o_salvo_conduto");
  const ef = fecho.r.efeitos.find((x) => x.tipo === "espolio");
  const paga = ef && ef.paga;
  const p0 = fecho.antes.personagem, p1 = fecho.E.personagem;
  t("a quest concluída paga: um efeito «espolio» com a paga aplicada", R6.estado === "concluida" && !!paga && paga.quest === "o_salvo_conduto" && paga.temperatura === "chama", J(paga).slice(0, 300));
  t("o XP e as moedas entram na ficha, pela conta da paga", p1.xp === p0.xp + paga.xp && p1.moedas === p0.moedas + paga.moedas && paga.xp > 0 && paga.moedas > 0, `${p0.xp}→${p1.xp} · ${p0.moedas}→${p1.moedas}`);
  /* 09/11 (a asserção mudou de sítio, e o porquê): a TE9 punha a peça da
     paga no CHÃO e a cerimónia dizia «já está na mochila» — se a cena mudasse
     antes de a fechar, o chão varria-se e a paga ia com ele. Decisão do
     coordenador: a paga vai direta à mochila (ESPOLIO_NO_TURNO.mochila), e só
     o excedente cai. A intenção que fica: a peça chega ao herói com
     `deQuest`; o sítio passou do chão à mochila (teste-te11-motor prova o
     excedente e a mudança de cena). */
  const daQuest = arr(fecho.E.personagem.equipamento).filter((i) => i && i.deQuest === "o_salvo_conduto");
  t("a peça entra na mochila, com `deQuest` (o campo novo do item), e não fica no chão", daQuest.length === paga.itens.filter((i) => i.tipo !== "consumivel").length && daQuest.length >= 1 && !fecho.E.chao.itens.some((i) => i.pronto && i.pronto.deQuest === "o_salvo_conduto"), J(fecho.E.chao.itens.map((i) => i.nome)));
  t("a chave da paga mora em `aplicadas`, o registo diz `pago`, o histórico guarda-a", Q(fecho.E).aplicadas["espolio:o_salvo_conduto"] === 1 && R6.espolio.pago === true && Q(fecho.E).pagas.length === 1 && Q(fecho.E).pagas[0].quest === "o_salvo_conduto");
  t("o relato diz o que a quest deixa, depois do «cumprida»", fecho.r.linhas.findIndex((l) => l.startsWith("✦ O que")) > fecho.r.linhas.findIndex((l) => l.startsWith("★")), J(fecho.r.linhas));
  const an = Q(fecho.E).anuncio;
  t("o anúncio do turno seguinte: «O QUE O HERÓI LEVA», e o trinco do feito", an && an.linhas[0].startsWith(LINHA_DO_ESPOLIO.abre) && an.linhas[0].length <= LINHA_DO_ESPOLIO.teto && an.feito === true, J(an));
  const ord = oQueOEfeitoPede(ef, { personagem: p1 });
  t("à tela, a revelação (revelacaoDoEspolio): as moedas, o XP, e a peça comparada com o que veste", ord.length === 1 && ord[0].ordem === "revelacao" && ord[0].revelacao.some((x) => x.tipo === "item" && x.slot) && ord[0].revelacao[0].tipo === "moedas", J(ord).slice(0, 300));

  /* a pauta do turno seguinte */
  const mesa = aMesaDasQuests(fecho.E, { mundo: W.mundo, cena: { presentes: [] } });
  t("a mesa do turno seguinte leva a linha do espólio e o veto dela", J(mesa.espolio) === J(an.linhas) && mesa.naoPode.includes(LINHA_DO_ESPOLIO.naoPode));
  const pt = textoDaPauta(aPautaDoTurno({ ...fecho.E, render: { personagem: fecho.E.personagem } }, { frase: "olho à minha volta", sorte: rngDe("te9") }, {}).pauta);
  t("e a pauta dá-a ao Narrador, no MOMENTO, com o veto em NÃO PODE, dentro do teto", pt.includes(an.linhas[0]) && pt.includes(LINHA_DO_ESPOLIO.naoPode) && pt.length <= TETO_DA_PAUTA, `${pt.length}`);
  const pt2 = textoDaPauta(aPautaDoTurno({ ...depois.E, render: { personagem: depois.E.personagem } }, { frase: "olho à minha volta", sorte: rngDe("te9") }, {}).pauta);
  t("no turno a seguir a esse, a linha já não chega (vive um turno)", !pt2.includes(LINHA_DO_ESPOLIO.abre) && !pt2.includes(LINHA_DO_ESPOLIO.naoPode) && !Q(depois.E).anuncio);
  t("a quest fechada não volta a pagar no turno seguinte", depois.E.personagem.xp === p1.xp && depois.E.personagem.moedas === p1.moedas && !depois.r.efeitos.some((x) => x.tipo === "espolio"));
  const escF = achadoEscondido(questPorId("o_salvo_conduto"), registoDe(depois.E, "o_salvo_conduto"), { semente: W.semente, nivel: 3, estado: depois.E, mundo: W.mundo });
  t("e, fechada, o escondido já não espera (decisão da pessoa: até a quest fechar)", escF && escF.aberto === false && escF.achou === false);
}

sec("§3 nunca duas vezes");
{
  const { fecho, depois } = passos;
  /* o replay */
  const passoQ = PASSOS_DO_REPLAY.find((p) => p.passo === "as quests");
  const nota = { tela: { linhas: [] } };
  const pelo = passoQ.faz(fecho.antes, {}, { mundo: W.mundo }, nota);
  t("o replay (o passo «as quests») escreve o mesmo estado que o turno, com a paga", J(pelo) === J(fecho.E));
  t("e leva o efeito da paga à nota, como os outros", Array.isArray(nota.efeitosDasQuests) && nota.efeitosDasQuests.some((x) => x.tipo === "espolio"));
  /* a mesma campanha duas vezes */
  const C2 = jogar(mundoNovo("BQ7|0"));
  t("a mesma campanha jogada outra vez dá o mesmo fim, byte a byte (a sorte é a semente)", J(C2.fim) === J(C.fim));
  /* um load a meio: o save vai e volta pelo JSON e pela catraca da espinha */
  const salvo = JSON.parse(JSON.stringify(fecho.E));
  const lido = { ...salvo, espinha: garantirEspinha(salvo.espinha) };
  t("o load preserva a chave da paga, o histórico e o anúncio", Q(lido).aplicadas["espolio:o_salvo_conduto"] === 1 && Q(lido).pagas.length === 1 && !!Q(lido).anuncio);
  const r1 = oTurnoDasQuests(lido, { mundo: W.mundo });
  const E1 = { ...lido, ...r1.estado };
  t("e o turno depois do load não paga outra vez", E1.personagem.xp === fecho.E.personagem.xp && E1.personagem.moedas === fecho.E.personagem.moedas && !r1.efeitos.some((x) => x.tipo === "espolio") && J(E1.chao) === J(fecho.E.chao));
  t("o load a meio dá o mesmo que o turno sem load (as chaves podem vir noutra ordem)", canon(E1) === canon(depois.E));
  /* a versão antiga (v9.630) deita fora de `aplicadas` a chave com dois pontos, e não conhece `pagas` nem `anuncio` */
  const velha = (E, semPago) => {
    const q = { ...E.espinha.quests };
    q.aplicadas = Object.fromEntries(Object.entries(q.aplicadas).filter(([k]) => /^[a-z0-9_]{1,40}$/.test(k)));
    delete q.pagas; delete q.anuncio;
    if (semPago) q.registos = q.registos.map((r) => { const x = { ...r }; delete x.espolio; return x; });
    return { ...E, espinha: { ...E.espinha, quests: q } };
  };
  const Ev = velha(fecho.E, false);
  const rv = oTurnoDasQuests(Ev, { mundo: W.mundo });
  t("a versão antiga perdeu a chave: o `pago` do registo segura a paga", !rv.efeitos.some((x) => x.tipo === "espolio") && ({ ...Ev, ...rv.estado }).personagem.xp === fecho.E.personagem.xp);
  const Ev2 = velha(fecho.E, true);
  const rv2 = oTurnoDasQuests(Ev2, { mundo: W.mundo });
  t("e sem chave nem `pago`: a quest já estava fechada antes do turno, e não paga para trás", !rv2.efeitos.some((x) => x.tipo === "espolio") && ({ ...Ev2, ...rv2.estado }).personagem.moedas === fecho.E.personagem.moedas);
  /* a migração: uma campanha em curso cuja quest fechou antes da TE9 */
  const semTE9 = velha(depois.E, true);
  const rm = oTurnoDasQuests(semTE9, { mundo: W.mundo });
  t("a quest que fechou antes da TE9 não paga (§3 da planta), e a campanha segue sem diferença", !rm.efeitos.some((x) => x.tipo === "espolio") && !("personagem" in rm.estado) && !("chao" in rm.estado));
  /* o mundo antigo, byte a byte */
  const ANTIGA = { ...W.estado, espinha: W.espinha0 };
  t("o mundo antigo (sem esqueleto) não vê nada disto", oTurnoDasQuests(ANTIGA, { mundo: W.mundo }) === null && aMesaDasQuests(ANTIGA, { mundo: W.mundo }) === null);
}

sec("§4 a paga substitui o feito do Narrador");
{
  const { fecho } = passos;
  const pagaCheia = fecho.r.efeitos.find((x) => x.tipo === "espolio").paga.xp;
  /* no turno do fecho: o feito que o aplicar já pagou desconta-se */
  const pequeno = { grau: "pequeno", nivel: 3 };
  const rp = oTurnoDasQuests(fecho.antes, { mundo: W.mundo, feitoDoTurno: pequeno });
  const pp = rp.efeitos.find((x) => x.tipo === "espolio").paga;
  t("o feito pequeno do turno do fecho desconta-se da paga (o turno vale a paga, não a soma)", pp.xp === pagaCheia - xpDoFeito("pequeno", 3) && pp.xpDoFeito === xpDoFeito("pequeno", 3), `${pagaCheia} − ${xpDoFeito("pequeno", 3)} = ${pp.xp}`);
  const marco = { grau: "marco", nivel: 3 };
  const rm = oTurnoDasQuests(fecho.antes, { mundo: W.mundo, feitoDoTurno: marco });
  const pm = rm.efeitos.find((x) => x.tipo === "espolio").paga;
  t("e um marco maior do que a paga deixa-a sem XP — o turno vale o maior dos dois", pm.xp === Math.max(0, pagaCheia - xpDoFeito("marco", 3)) && ({ ...fecho.antes, ...rm.estado }).personagem.xp === fecho.antes.personagem.xp + pm.xp, `${pagaCheia} vs ${xpDoFeito("marco", 3)}`);
  t("as moedas e as peças não se descontam (o feito é só XP)", pm.moedas === fecho.r.efeitos.find((x) => x.tipo === "espolio").paga.moedas && pm.itens.length >= 1);
  const lixo = oTurnoDasQuests(fecho.antes, { mundo: W.mundo, feitoDoTurno: { grau: "lenda" } });
  t("um grau que o Juiz não conhece não desconta nada", lixo.efeitos.find((x) => x.tipo === "espolio").paga.xp === pagaCheia);
  /* o replay passa-o: o passo do Mestre guarda o feito da resposta podada, o das quests desconta-o */
  const passoQ = PASSOS_DO_REPLAY.find((p) => p.passo === "as quests");
  const pelo = passoQ.faz(fecho.antes, {}, { mundo: W.mundo }, { tela: { linhas: [] }, feitoDoTurno: pequeno });
  t("o replay desconta o mesmo feito que o jogo", J(pelo) === J({ ...fecho.antes, ...rp.estado }));
  const passoM = PASSOS_DO_REPLAY.find((p) => p.passo === "o turno do Mestre");
  const notaM = {};
  try { passoM.faz({ ...fecho.antes, espinha: passos.passo.E.espinha }, {}, { resposta: { narrativa: "x", mudancas: { feito: "pequeno" } }, doMestre: { modoDoNarrador: "mestre" }, modoDoNarrador: "mestre" /* NE7: o feito é porta, aberta no «mestre» */ }, notaM); } catch { /* o passo não estoura */ }
  t("o passo do Mestre no replay guarda o feito pago e o nível de antes dele", J(notaM.feitoDoTurno) === J({ grau: "pequeno", nivel: 3 }), J(notaM.feitoDoTurno));
  /* no turno seguinte: o aplicar tira o feito (o Narrador narra o fecho) */
  const base = { canone: {}, npcs: {}, npcTurno: 0, mapa: { cidades: [], faccoes: [], rotas: [] }, historia: {}, contadores: {}, dia: 3 };
  const ctx = { baseDoNome: { importantes: [], conhecidos: [], recentes: [], grupo: [], aqui: [], heroi: "Vera" } };
  const comPaga = NM.aplicarOTurno({ ...base, personagem: fecho.E.personagem, espinha: fecho.E.espinha }, { narrativa: "x", mudancas: { feito: "marco" } }, ctx);
  const semPaga = NM.aplicarOTurno({ ...base, personagem: fecho.E.personagem, espinha: passos.depois.E.espinha }, { narrativa: "x", mudancas: { feito: "marco" } }, ctx);
  t("no turno a seguir à paga, o feito do Narrador não entra (calado)", comPaga.estado.personagem.xp === fecho.E.personagem.xp && !("feito" in (comPaga.podado.mudancas || {})) && !comPaga.efeitos.some((e) => e.tipo === "calou"), J(comPaga.podado.mudancas));
  t("e no turno a seguir a esse volta a entrar", semPaga.estado.personagem.xp > fecho.E.personagem.xp);
  t("o aplicar de um mundo antigo não muda (nem lê a peça das quests)", NM.aplicarOTurno({ ...base, personagem: fecho.E.personagem, espinha: W.espinha0 }, { narrativa: "x", mudancas: { feito: "marco" } }, ctx).estado.personagem.xp > fecho.E.personagem.xp);
}

sec("§5 o artefacto que acorda");
{
  /* a peça com nome do Cimo da Escada, ganha no nível 3, no corpo do herói */
  const F = questPorId("o_cimo_da_escada");
  const feitas = Object.fromEntries(F.etapas.map((e) => [e.id, { dia: 1, ramo: Array.isArray(e.ramos) ? e.ramos[0] : null, variante: null }]));
  const R = { id: F.id, tipo: F.tipo, inicio: 0, ultimoAvanco: 1, papeis: {}, feitas, escolhas: {}, acesas: {}, reviravoltas: [], consequencias: [], estado: "concluida", motivo: "etapas", desfecho: null, fecho: null, fechouEm: 1 };
  const paga = pagaDaQuest(F, R, { semente: W.semente, nivel: 3, heroi: HEROI });
  const art = paga && paga.itens.find((i) => i.artefacto);
  t("a peça com nome nasce adormecida, com `artefacto` (o campo novo do item)", !!art && art.artefacto.estado === "adormecido" && !art.ativo && !!ARTEFACTOS_COM_NOME[F.id], J(art && art.artefacto));
  const comArt = (E, nivel, pagas) => ({ ...E, personagem: { ...E.personagem, nivel, equipados: { arma: art } }, espinha: { ...E.espinha, quests: { ...E.espinha.quests, pagas } } });
  const hist = [{ quest: F.id, estado: "concluida", temperatura: F.temperatura, confronto: true, itens: [{ raridade: art.raridade, nome: art.nome, artefacto: { id: F.id, genero: "artefacto" } }] }];
  const E0 = passos.depois.E;
  const r0 = oTurnoDasQuests(comArt(E0, 4, hist), { mundo: W.mundo });
  t("sem nada que o acorde, fica como está (nem o confronto de onde veio conta)", !r0.estado.personagem && !r0.linhas.some((l) => l.includes(art.nome)));
  const r1 = oTurnoDasQuests(comArt(E0, 3 + DESPERTAR_DO_ARTEFACTO.desperto.quando.niveis, hist), { mundo: W.mundo });
  const a1 = r1.estado.personagem && r1.estado.personagem.equipados.arma;
  t("três níveis depois, desperta: o segundo poder, e a linha no relato", a1 && a1.artefacto.estado === "desperto" && a1.poderes.length === promessaDoArtefacto(a1, 6).poderes.filter((p) => p.aceso).length && a1.poderes.length >= art.poderes.length && r1.linhas.some((l) => l.includes(art.nome)), J(r1.linhas));
  const quente = [...hist, { quest: "x_quente", estado: "concluida", temperatura: "fogueira", itens: [] }];
  const r2 = oTurnoDasQuests(comArt(E0, 3, quente), { mundo: W.mundo });
  t("uma quest de fogueira concluída DEPOIS dele também o desperta", r2.estado.personagem && r2.estado.personagem.equipados.arma.artefacto.estado === "desperto");
  const conf = [...hist, { quest: "x_conf", estado: "concluida", temperatura: "incendio", confronto: true, itens: [] }];
  const r3 = oTurnoDasQuests(comArt(E0, 3, conf), { mundo: W.mundo });
  const a3 = r3.estado.personagem && r3.estado.personagem.equipados.arma;
  t("o confronto concluído depois dele exalta-o: o gesto abre-se (`ativo`)", a3 && a3.artefacto.estado === "exaltado" && a3.ativo && a3.ativo.id === F.id, J(a3 && a3.artefacto));
  /* a porta do gesto (relicas.js) */
  const heroi = { ...HEROI, equipados: { arma: a3 }, sintonizados: [a3.nome] };
  const rel = reliquiasEquipadas(heroi);
  t("a porta do gesto abre para o artefacto exaltado (reliquiasEquipadas)", rel.length === 1 && rel[0].rel.id === F.id && rel[0].rel.ativo.nome === ARTEFACTOS_COM_NOME[F.id].gesto.nome);
  t("e fecha para o adormecido (sem `ativo`)", reliquiasEquipadas({ ...HEROI, equipados: { arma: art } }).length === 0);
  const decl = ativoDeclarado(`invoco ${ARTEFACTOS_COM_NOME[F.id].gesto.nome}`, heroi);
  t("o herói diz o nome do gesto, e a frase acha-o", decl && decl.rel.id === F.id);
  const u = usarAtivo(heroi, rel[0].rel, { dia: 5 });
  t("o gesto faz o que está escrito (o buff, na pilha de sempre) e marca o dia", u && u.pers.efeitos.some((e) => e.nome === ARTEFACTOS_COM_NOME[F.id].gesto.efeito.buff.nome) && u.pers.relicaGastos[F.id] === 5);
  t("uma vez por dia", podeUsarAtivo(u.pers, rel[0].rel, { dia: 5 }).pode === false && podeUsarAtivo(u.pers, rel[0].rel, { dia: 6 }).pode === true);
  /* no chão também */
  const Echao = { ...comArt(E0, 3, conf), personagem: { ...E0.personagem, nivel: 3 }, chao: { cena: "x", itens: [{ id: "ch1", especie: "equipamento", nome: art.nome, destino: "equipamento", pronto: art }] } };
  const r4 = oTurnoDasQuests(Echao, { mundo: W.mundo });
  t("a peça ainda no chão acorda também (o objeto pronto), e não muda de crachá", r4.estado.chao && r4.estado.chao.itens[0].id === "ch1" && r4.estado.chao.itens[0].pronto.artefacto.estado === "exaltado");
  /* TE8: a relíquia arma acompanha o nível de quem a traz — o mesmo laço do
     artefacto que acorda (7d) chama reliquiaNoNivel, calado */
  const relV = itemDaReliquia(reliquiaPorId("comedora"));
  const rR = oTurnoDasQuests({ ...E0, personagem: { ...E0.personagem, nivel: 17, equipados: { arma: relV } } }, { mundo: W.mundo });
  const aR = rR && rR.estado.personagem && rR.estado.personagem.equipados.arma;
  t("a relíquia arma feita no nível 1 ganha no turno o aço do nível 17, sem linha no relato", aR && aR.atributos.dano === danoDaReliquia(reliquiaPorId("comedora"), 17) && aR.atributos.dano > (relV.atributos.dano || 0) && !rR.linhas.some((l) => l.includes(relV.nome)), J(aR && aR.atributos));
  const rR2 = oTurnoDasQuests({ ...E0, personagem: { ...E0.personagem, nivel: 17, equipados: { arma: aR } } }, { mundo: W.mundo });
  t("e no turno seguinte, no mesmo nível, já não mexe na ficha", rR2 && !rR2.estado.personagem);
}

sec("§6 o teto: a pauta com o anúncio cheio, e o prompt fixo");
{
  const ESP = ESTRUTURAS.filter((e) => e.espinha).map((e) => e.id);
  const cheia = "x".repeat(LINHA_DO_ESPOLIO.teto);
  let pautas = 0, chegou = 0, maxPauta = 0, vetoChegou = 0;
  for (let i = 0; i < 40; i++) {
    const w = mundoNovo(`TE9|teto|${i}`, ESP[i % ESP.length], ["", "soldado", "orfao", "erudito"][i % 4], null);
    if (!w.esq) continue;
    const r = oTurnoDasQuests(w.estado, { mundo: w.mundo });
    const E = r ? { ...w.estado, ...r.estado } : w.estado;
    const anuncio = { linhas: [LINHA_DO_ESPOLIO.abre + cheia.slice(LINHA_DO_ESPOLIO.abre.length), LINHA_DO_ESPOLIO.achou + cheia.slice(LINHA_DO_ESPOLIO.achou.length)], feito: true };
    const Ea = { ...E, espinha: { ...E.espinha, quests: { ...garantirQuestsDaEspinha(E.espinha.quests), anuncio } } };
    const pt = textoDaPauta(aPautaDoTurno({ ...Ea, render: { personagem: Ea.personagem } }, { frase: "pergunto pelo caminho", sorte: rngDe(`te9p${i}`) }, {}).pauta);
    pautas++;
    maxPauta = Math.max(maxPauta, pt.length);
    if (pt.includes(anuncio.linhas[0])) chegou++;
    if (pt.includes(LINHA_DO_ESPOLIO.naoPode)) vetoChegou++;
  }
  console.log(`      ${pautas} pautas com o anúncio no pior caso (duas linhas de ${LINHA_DO_ESPOLIO.teto}): a 1.ª chega em ${chegou}, o veto em ${vetoChegou}; pauta máx. ${maxPauta}`);
  t("o pior caso da pauta, com o anúncio cheio, cabe no teto de sempre (1400)", pautas > 0 && maxPauta <= TETO_DA_PAUTA && TETO_DA_PAUTA === 1400, String(maxPauta));
  t("e a linha «O QUE O HERÓI LEVA» chega ao texto em toda pauta (a frente do MOMENTO)", chegou === pautas, `${chegou}/${pautas}`);
  t("e o veto também", vetoChegou === pautas, `${vetoChegou}/${pautas}`);
  const prompt = fs.readFileSync("../src/prompt.js", "utf8");
  t("o prompt fixo (prompt.js) não importa os espólios nem as quests: o teto de ~82k não se mexe", !/espolios|quests-do-turno|biblioteca-de-quests/.test(prompt));
  t("a linha só existe pela pauta dinâmica: o anúncio guarda o texto do turno, nunca um bloco", ESPOLIO_NO_TURNO.anuncio.linhas * LINHA_DO_ESPOLIO.teto <= 2 * 140);
}

sec("§7 o lixo e a imutabilidade");
{
  const antes = congelar(JSON.parse(JSON.stringify(passos.passo.E)));
  const foto = J(antes);
  let ok = true;
  try { oTurnoDasQuests(antes, { mundo: W.mundo }); aMesaDasQuests(antes, { mundo: W.mundo }); } catch (e) { ok = false; console.log(e); }
  t("sobre o estado congelado do turno da paga, nada estoura e nada se muta", ok && J(antes) === foto);
  const semFicha = { ...passos.passo.E, personagem: null, chao: undefined };
  const rs = oTurnoDasQuests({ ...semFicha, ...{} }, { mundo: W.mundo });
  t("sem ficha nem chão, o turno não cai (paga o que pode, a ficha fica de fora)", rs && !rs.estado.personagem);
  const semNivel = { ...passos.passo.E, personagem: { nome: "Vera", moedas: 10, grupo: passos.passo.E.personagem.grupo } };
  const rn = oTurnoDasQuests({ ...ir(semNivel, P.destino.cidade, null), dia: semNivel.dia + 2 }, { mundo: W.mundo });
  t("uma ficha sem nível leva o XP e não entra no laço do nível (nunca NaN)", rn && rn.estado.personagem && Number.isFinite(rn.estado.personagem.xp) && rn.estado.personagem.nivel === undefined);
  const g = garantirQuestsDaEspinha({ pagas: [null, 3, { quest: "Lixo!" }, { quest: "ok_quest", itens: [null, { raridade: 7, artefacto: { id: 3 } }] }], anuncio: { linhas: [3, "", "a".repeat(999)], feito: "sim" } });
  t("o histórico e o anúncio tortos passam pela catraca", g.pagas.length === 1 && g.pagas[0].itens.length === 1 && g.pagas[0].itens[0].raridade === "comum" && !g.pagas[0].itens[0].artefacto && g.anuncio.linhas.length === 1 && g.anuncio.linhas[0].length === LINHA_DO_ESPOLIO.teto && g.anuncio.feito === false);
  t("o efeito «espolio» sem paga não pede nada à tela", oQueOEfeitoPede({ tipo: "espolio" }, {}).length === 0 && oQueOEfeitoPede({ tipo: "espolio", paga: null }, null).length === 0);
  t("a forma do save das quests continua a da v1", Q(passos.fecho.E).v === QUESTS_DO_TURNO.v);
}

/* ============================================================
   §8 OS DOIS PEDIDOS DA TE10 (o `desenho`, mente/pedidos-ao-sistema.md):
   TE10-1, o que o artefacto ainda promete (a tela não soma níveis nem lê
   PODERES à mão); TE10-2, o outro lado da troca no veredito do espólio.
   ============================================================ */
sec("§8 os pedidos da TE10: a promessa do artefacto e o outro lado da troca");
{
  const F = questPorId("o_cimo_da_escada");
  const feitas = Object.fromEntries(F.etapas.map((e) => [e.id, { dia: 1, ramo: Array.isArray(e.ramos) ? e.ramos[0] : null, variante: null }]));
  const R = { id: F.id, tipo: F.tipo, inicio: 0, ultimoAvanco: 1, papeis: {}, feitas, escolhas: {}, acesas: {}, reviravoltas: [], consequencias: [], estado: "concluida", motivo: "etapas", desfecho: null, fecho: null, fechouEm: 1 };
  const D = DESPERTAR_DO_ARTEFACTO;
  /* TE10-1 */
  for (const nivel of [3, 7]) {
    const art = pagaDaQuest(F, R, { semente: W.semente, nivel, heroi: HEROI }).itens.find((i) => i.artefacto);
    congelar(art);
    const pr = promessaDoArtefacto(art, nivel + 1);
    const def = ARTEFACTOS_COM_NOME[F.id];
    t(`(nível ${nivel}) a adormecida promete o desperto: no nível da peça + ${D.desperto.quando.niveis}, ou pela quest à altura`, pr && pr.genero === "artefacto" && pr.estado === "adormecido" && pr.proximo === "desperto" && pr.nivelQueAcorda === nivel + D.desperto.quando.niveis && pr.faltamNiveis === D.desperto.quando.niveis - 1 && J(pr.porProva) === J({ quests: D.desperto.quando.quests, temperaturas: D.desperto.quando.temperaturas }) && pr.porConfronto === false, J(pr));
    t(`(nível ${nivel}) os poderes são os escritos que esta peça pode acender, um aceso, pela ordem`, pr.poderes.length >= 1 && pr.poderes.every((p, k) => p.id === def.passivos.filter((id) => pr.poderes.some((x) => x.id === id))[k]) && pr.poderes.filter((p) => p.aceso).length === D.adormecido.passivos && pr.poderes[0].acordaEm === "adormecido", J(pr.poderes));
    t(`(nível ${nivel}) o gesto escrito, apagado, que acorda no exaltado`, pr.gesto && pr.gesto.nome === def.gesto.nome && pr.gesto.aceso === false && pr.gesto.acordaEm === "exaltado");
    /* a promessa é a verdade do motor: no nível prometido, despertarArtefacto acorda-a; um antes, não */
    const antes = despertarArtefacto(art, { nivel: pr.nivelQueAcorda - 1 });
    const no = despertarArtefacto(art, { nivel: pr.nivelQueAcorda });
    t(`(nível ${nivel}) no nível prometido o motor acorda-a, e um antes não`, antes === art && no.artefacto.estado === pr.proximo && no.poderes.length === pr.poderes.filter((p) => p.acordaEm === "adormecido" || p.acordaEm === "desperto").length);
    const pd = promessaDoArtefacto(no, pr.nivelQueAcorda);
    t(`(nível ${nivel}) a desperta promete o exaltado: + ${D.exaltado.quando.niveis} níveis, ou o confronto (a quest já não)`, pd.estado === "desperto" && pd.proximo === "exaltado" && pd.nivelQueAcorda === nivel + D.exaltado.quando.niveis && pd.porProva === null && pd.porConfronto === true && pd.faltamNiveis === D.exaltado.quando.niveis - D.desperto.quando.niveis);
    const ex = despertarArtefacto(no, { nivel: pd.nivelQueAcorda });
    const pe = promessaDoArtefacto(ex, 20);
    t(`(nível ${nivel}) a exaltada já não promete nada, e o gesto está aceso`, pe.estado === "exaltado" && pe.proximo === null && pe.nivelQueAcorda === null && pe.faltamNiveis === null && pe.porProva === null && pe.porConfronto === false && pe.gesto.aceso === true);
  }
  const art = pagaDaQuest(F, R, { semente: W.semente, nivel: 3, heroi: HEROI }).itens.find((i) => i.artefacto);
  const tarde = { ...art, artefacto: { ...art.artefacto, nivel: 18, estado: "desperto" } };
  t("ganha tarde demais para acordar por nível: nivelQueAcorda null, e o confronto ainda serve", promessaDoArtefacto(tarde, 18).nivelQueAcorda === null && promessaDoArtefacto(tarde, 18).porConfronto === true);
  t("no nível já alcançado faltam zero (acorda no fim do turno)", promessaDoArtefacto(art, 15).faltamNiveis === 0);
  const lembranca = { nome: "A Faixa", tipo: "amuleto", raridade: "incomum", poderes: [], artefacto: { id: "a_ultima_licao", genero: "lembranca", estado: "adormecido", nivel: 3, passivos: ["porte"] } };
  const pl = promessaDoArtefacto(lembranca, 5);
  t("a lembrança não promete crescer (proximo null), e o poder dela está aceso", pl && pl.genero === "lembranca" && pl.proximo === null && pl.nivelQueAcorda === null && pl.porProva === null && pl.porConfronto === false && pl.gesto === null && pl.poderes.every((p) => p.aceso || p.acordaEm === null), J(pl));
  t("o que não é artefacto, e o lixo, dão null", promessaDoArtefacto({ nome: "Espada", tipo: "arma" }, 3) === null && promessaDoArtefacto(null) === null && promessaDoArtefacto("x", 3) === null && promessaDoArtefacto({ artefacto: { id: 3 } }) === null);
  /* TE10-2 */
  const heroi = { ...HEROI, equipados: { arma: { nome: "Espada Longa", base: "Espada Longa", tipo: "arma", raridade: "comum", atributos: { dano: 1 } } } };
  const paga = { moedas: 10, xp: 5, itens: [art, { nome: "Anel Simples", tipo: "anel", raridade: "comum", atributos: {} }, { nome: "Frasco", tipo: "consumivel", consumivel: "cura_p", raridade: "comum" }] };
  const rev = revelacaoDoEspolio(paga, heroi);
  const daArma = rev.find((x) => x.tipo === "item" && x.slot === "arma");
  const doAnel = rev.find((x) => x.tipo === "item" && x.item.nome === "Anel Simples");
  const doFrasco = rev.find((x) => x.tipo === "item" && x.item.nome === "Frasco");
  t("TE10-2: a peça que vai para um encaixe ocupado diz o que sai dele, e quanto leva a troca", daArma && daArma.sai === "Espada Longa" && daArma.troca === fraseDaTroca("arma") && daArma.troca.length > 0, J(daArma && { sai: daArma.sai, troca: daArma.troca }));
  t("TE10-2: o encaixe vazio não tira nada (sai null), e a troca diz o tempo na mesma", doAnel && (doAnel.slot ? doAnel.sai === null && doAnel.troca === fraseDaTroca(doAnel.slot) : doAnel.sai === null && doAnel.troca === ""));
  t("TE10-2: o que não tem encaixe leva os dois campos vazios (a forma é uma só)", doFrasco && doFrasco.slot === null && doFrasco.sai === null && doFrasco.troca === "");
}

console.log(`\nTE9 · os espólios no motor: ${bons} passaram, ${maus} falharam`);
if (maus) process.exit(1);
