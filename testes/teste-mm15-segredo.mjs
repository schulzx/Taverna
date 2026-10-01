/* ============================================================
   MM15 (4) — O SEGREDO GUARDADO: a persuasão sem dado e o cânone

   A segunda sessão de prova (`mente/mm11-sessao-2.md`, T10, a pergunta 12
   e o defeito 3): a jogadora, ao balcão, argumentou com a Lina para saber
   "o que se passa no Fundo do Poço". Não houve teste; o Mestre revelou
   "a água lá embaixo não reflete rosto … ninguém entra", e o Cronista
   gravou-o no cânone. O Fundo do Poço é a casa de banhos da base, e o
   marco 2 da espinha ("O que O Fundo do Poço esconde").

   O que esta suíte prova (o módulo é `src/segredo-guardado.js`, e as
   duas costuras são `desafios.js` — o desafio `fazer_falar` e o degrau do
   segredo na conta social — e `social.js` — o `pedido` de contexto):

     1. o T10 reconstruído: a frase, a pauta sem teste, a entrada do
        Cronista — antes (sem espinha no contexto: o comportamento de
        HEAD) e depois;
     2. o que tem de continuar: a pergunta de balcão de graça, a revelação
        no turno que o sistema escolheu, o cânone comum, o lixo;
     3. num mundo de verdade: o que a pista diz é a base, e a base não se
        reescreve;
     4. a medida em 24 mundos × 6 estruturas.

   Tudo por semente: nenhum `Math.random` decide uma asserção.
   ============================================================ */
import fs from "node:fs";
import * as G from "../src/segredo-guardado.js";
import { lerAcao, DIFICULDADES } from "../src/desafios.js";
import { envelopeSocial, tamanhoPorId, dificuldadeSocial } from "../src/social.js";
import { garantirPauta, porNaPauta, textoDaPauta, TETO_DA_PAUTA } from "../src/pauta.js";
import { estenderEspinha } from "../src/saga.js";
import { gerarGeografia } from "../src/geografia.js";
import { ESTRUTURAS } from "../src/historia.js";
import { MOLDES } from "../src/moldes.js";
import { generosDisponiveis } from "../src/nomes.js";
import { locaisDaCidade, genteDoLocal } from "../src/mundo-base.js";
import { comEm } from "../src/lugar.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ============================================================
   O T10, como a sessão o viu
   ============================================================ */
const J10 = 'Pego na chave mas não saio do balcão. "Lina, ouve. Sou soldada, sei calar o que ouço — e se essa caravana não chegar, vais querer alguém de escudo à porta. Diz-me o que se passa no Fundo do Poço. Toda a gente baixa os olhos quando o nome sai."';
const M10 = '"O Fundo do Poço — repete, baixo, como quem prova o nome. — Ninguém fala daquilo, soldada. Quem fala, some." … "Dizem que a água lá embaixo não reflete rosto. Que devolve outro." … "Vão querer é alguém que entre lá. E ninguém entra."';
/* a entrada que o Cronista gravou (a descrição é a da transcrição; o
   tipo e o local são os que o molde do Cronista pede) */
const CRONISTA_T10 = { "Fundo do Poço": { tipo: "lugar", descricao: "Poço temido sob Runa do Poço cuja água não reflete o próprio rosto", detalhes: "ninguém entra; quem fala, some", local: "Runa do Poço" } };
const MARCO_1 = { id: "espinha|0|0", feitio: "procurar", titulo: "Encontrar Otávio do Sal", quem: "Otávio do Sal", onde: "O Tesouro sem Fio", feito: true };
const MARCO_2 = { id: "espinha|0|1", feitio: "descobrir", titulo: "O que O Fundo do Poço esconde", onde: "O Fundo do Poço", ehLugar: true, condicao: { tipo: "revelar", alvo: "O Fundo do Poço", chave: "Runa do Poço|casa de banhos" }, feito: false };
const ESPINHA_T10 = { estrutura: "jornada", semente: "Prova da Mesa II", atos: [{ ato: 0, marcos: [MARCO_1, MARCO_2] }] };
const ESPINHA_REVELADA = { ...ESPINHA_T10, atos: [{ ato: 0, marcos: [MARCO_1, { ...MARCO_2, feito: true }] }] };
const LINA = { nome: "Lina do Sal", papel: "taverneira", relacao: "desconhecido", local: "O Último Gomo" };
const BRITES = { nome: "Brites Ferrolho", moedas: 62, atributos: { presenca: 2 } };
const ctxAntes = { personagem: BRITES, semente: "Prova da Mesa II", lugar: "O Último Gomo", tentativas: {}, dia: 1, pessoaDe: () => LINA };
const segT10 = tenta(() => G.segredosGuardados(ESPINHA_T10), []);
const ctxDepois = { ...ctxAntes, segredos: () => segT10 };

sec("0. as tabelas");
{
  t("só o marco de DESCOBRIR guarda segredo", JSON.stringify(Object.keys(G.SEGREDOS_DA_ESPINHA || {})) === '["descobrir"]');
  t("e o que ele guarda está no `onde` do marco", (G.SEGREDOS_DA_ESPINHA || {}).descobrir && G.SEGREDOS_DA_ESPINHA.descobrir.campo === "onde");
  const favor = tamanhoPorId("favor"), risco = tamanhoPorId("risco");
  const P = G.PEDIDO_DO_SEGREDO || {};
  console.log(`      degrau do segredo: ${P.dc} (favor ${favor.dc}, quebrar uma regra ${risco.dc})`);
  t("o degrau do segredo fica entre o favor e quebrar uma regra", P.dc > favor.dc && P.dc < risco.dc);
  t("e o ouro na mesa custa entre os dois", P.moedas > 30 && P.moedas < 120);
  t("a pista nomeia no máximo duas pessoas da casa", G.GENTE_DA_PISTA === 2);
  t("cada espécie de lugar é uma linha com rx e as espécies da base que descreve",
    Array.isArray(G.ESPECIES_DE_LUGAR) && G.ESPECIES_DE_LUGAR.every((e) => e.rx instanceof RegExp && Array.isArray(e.de)));
  t("e a última linha não descreve espécie nenhuma da base (poço, cripta, caverna…)",
    G.ESPECIES_DE_LUGAR[G.ESPECIES_DE_LUGAR.length - 1].de.length === 0 && G.ESPECIES_DE_LUGAR[G.ESPECIES_DE_LUGAR.length - 1].rx.test("poco"));
  t("as três perguntas de arrancar existem (PEDE, OCULTO, ESFORCO)", ["PEDE", "OCULTO", "ESFORCO"].every((k) => G.ARRANCAR && G.ARRANCAR[k] instanceof RegExp));
}

sec("1. o T10 reconstruído — antes");
{
  /* ANTES = sem espinha no contexto, que é exatamente o que o App manda
     hoje (`ctxDesafio` não leva segredo nenhum): o código novo fica inerte,
     e o resultado é o de HEAD. */
  const v = lerAcao(J10, ctxAntes);
  console.log(`      lerAcao(J10) sem espinha: ${v ? v.tipo : "null"}${v && v.porque ? ` — "${v.porque}"` : ""}`);
  t("ANTES: a frase de J10 não pedia teste (o defeito, reproduzido)", !v || v.tipo !== "teste");
  t("ANTES: a entrada do Cronista entrava inteira (as portas do App gravam tudo o que chega)", Object.keys(CRONISTA_T10).length === 1);
}

sec("1. o T10 reconstruído — depois");
{
  t("a espinha do T10 guarda um segredo: O Fundo do Poço", segT10.length === 1 && segT10[0].nome === "O Fundo do Poço");
  t("o marco 1 (Encontrar Otávio, feito) não guarda nada", !segT10.some((s) => /Otávio/.test(s.nome)));

  const v = lerAcao(J10, ctxDepois);
  console.log(`      lerAcao(J10) com espinha: ${v ? `${v.tipo} ${v.id} ${v.pericia} CD ${v.dc} (${v.deOnde})` : "null"}`);
  t("DEPOIS: J10 pede teste", !!v && v.tipo === "teste");
  t("é o desafio de fazer falar, de Persuasão", v && v.id === "fazer_falar" && v.pericia === "persuasao");
  t("e é social: quem está na frente é a Lina", v && v.social && v.quem === "Lina do Sal");
  t("a CD sai da tabela: o segredo (16), estranha (+2), quem vive de negociar (−1) = 17",
    v && v.dc === G.PEDIDO_DO_SEGREDO.dc + 2 - 1 && v.dc === 17);
  t("o pedido que se lê é o que a cidade cala", v && v.social && v.social.tamanho === "segredo");

  /* o envelope que o Narrador recebe, nos dois lados */
  const passou = v ? envelopeSocial(v.social, { passou: true, quem: v.quem, oQueEuDisse: J10, rotulo: v.rotulo }) : "";
  const falhou = v ? envelopeSocial(v.social, { passou: false, quem: v.quem, oQueEuDisse: J10, rotulo: v.rotulo }) : "";
  t("no sucesso, o que se compra é o que a pessoa SABE, e o que não se compra é o que o lugar esconde",
    /sabe DE VERDADE sobre O Fundo do Poço/.test(passou) && /O QUE ELE NÃO COMPROU: o que O Fundo do Poço esconde/.test(passou));
  t("e o sucesso diz que o lugar só se descobre lá dentro", /só se descobre lá dentro/.test(passou));
  t("na falha, a recusa é firme (o envelope de sempre)", /NÃO consegui/.test(falhou));

  /* a pauta: o veto vai na secção naoPode, pela mesma frase */
  const veto = G.vetoDoSegredo(J10, segT10);
  t("o veto existe para J10", Array.isArray(veto) && veto.length === 1);
  t("e diz o que não pode: revelar o que O Fundo do Poço esconde", veto[0] && /^revelar o que O Fundo do Poço esconde/.test(veto[0]));
  const p = porNaPauta(garantirPauta(null), "naoPode", veto);
  const txt = textoDaPauta(p);
  console.log(`      veto: ${veto[0] ? veto[0].length : 0} caracteres (teto da pauta ${TETO_DA_PAUTA})`);
  t("o veto chega ao texto da pauta", txt.includes("O Fundo do Poço esconde"));
  t("e é curto: menos de 1/6 do teto da pauta", veto[0] && veto[0].length < TETO_DA_PAUTA / 6);
  /* a envoltura do teste: o App manda ao Narrador o envelope social com o
     "Eu disse" — o veto lê a frase de dentro dele */
  t("o veto também lê a frase de dentro do envelope do teste", G.vetoDoSegredo(falhou, segT10).length === 1);

  /* a entrada do Cronista */
  const r = G.peneirarCanone(CRONISTA_T10, { espinha: ESPINHA_T10 });
  t("DEPOIS: a entrada do Cronista sobre o Fundo do Poço NÃO entra no cânone", !("Fundo do Poço" in r.canone));
  t("e é recusada por ser o segredo de um marco de pé", r.recusadas.length === 1 && r.recusadas[0].porque === "segredo" && r.recusadas[0].de === "O Fundo do Poço");
  /* o que o Mestre disse (M10) também não volta como cânone por outra porta:
     um segredo que fale do lugar, ou uma coisa que diga estar lá */
  const r2 = G.peneirarCanone({
    "A água que devolve outro rosto": { tipo: "segredo", descricao: "a água do Fundo do Poço não reflete o próprio rosto" },
    "Rosto da água": { tipo: "fenômeno", descricao: "a água devolve outro rosto", local: "Fundo do Poço" },
  }, { espinha: ESPINHA_T10 });
  t("nem um segredo que fale do lugar, nem uma coisa que diga estar lá", Object.keys(r2.canone).length === 0 && r2.recusadas.length === 2);
  t("(o M10 da sessão é a fala a que isto responde)", M10.includes("ninguém entra"));
}

sec("2. o que tem de continuar");
{
  /* a pergunta de balcão: de graça, como em v9.336 */
  const balcao = [
    "Lina, quanto custa um quarto?",
    "Pergunto à Lina: onde fica o Fundo do Poço?",
    "Lina, o que se passa no Fundo do Poço?",
    "Quem é aquele que passou agora com o balde?",
  ];
  for (const f of balcao) {
    const v = lerAcao(f, ctxDepois);
    t(`de graça: "${f}" não pede teste`, !v || v.tipo !== "teste", v ? `${v.tipo} ${v.id || ""}` : "");
  }
  t("a pergunta que nomeia o segredo leva o veto", G.vetoDoSegredo("Lina, o que se passa no Fundo do Poço?", segT10).length === 1);
  t("a que pergunta onde fica também (o lugar continua a ser o que a base diz)", G.vetoDoSegredo("Onde fica o Fundo do Poço?", segT10).length === 1);
  t("a que não o nomeia não leva veto nenhum", G.vetoDoSegredo("Lina, quanto custa um quarto?", segT10).length === 0);
  t("pedir onde fica, mesmo no imperativo, é balcão", !G.pressionaSegredo("Diz-me onde fica o Fundo do Poço.", segT10));
  /* a peneira: o que não foi declarado não pede nada; a pergunta é de graça */
  const peneira = [
    ["a negação", "Não lhe peço que me diga o que se passa no Fundo do Poço."],
    ["a hipótese", "Talvez lhe peça que me diga o que se passa no Fundo do Poço."],
    ["a negação dentro da fala", '"Lina, não me digas o que se passa no Fundo do Poço. Não quero saber."'],
    ["o imperativo em pergunta", "Diz-me: o que se passa no Fundo do Poço?"],
  ];
  for (const [o, f] of peneira) {
    const v = lerAcao(f, ctxDepois);
    t(`${o} não pede teste ("${f}")`, !v || v.tipo !== "teste", v ? `${v.tipo} ${v.id || ""}` : "");
  }
  t("e o imperativo em pergunta leva o veto", G.vetoDoSegredo("Diz-me: o que se passa no Fundo do Poço?", segT10).length === 1);
  /* "Insisto: o que se passa…?" a peneira lê inteira como pergunta (é uma
     oração só, com "?"), e é de graça; o esforço tem de ser declarado */
  const insisto = lerAcao('Insisto com a Lina, sem tirar os olhos dela. "O que se passa no Fundo do Poço?"', ctxDepois);
  t("mas com esforço declarado, a pergunta vira pressão, ao preço do segredo", insisto && insisto.tipo === "teste" && insisto.social && insisto.social.tamanho === "segredo");
  const fala = lerAcao('"Lina, desembucha o que se passa no Fundo do Poço."', ctxDepois);
  t("e o pedido só dentro da fala, sem nada fora dela, conta (a fala é dita)", fala && fala.tipo === "teste" && fala.id === "fazer_falar");
  t("e o pedido sobre outro lugar não é o segredo", !G.pressionaSegredo("Diz-me o que se passa no Último Gomo.", segT10));

  /* os verbos que já existiam ficam com os seus donos, e levam o preço do segredo */
  const ameaca = lerAcao("Ameaço a Lina: diz-me o que se passa no Fundo do Poço!", ctxDepois);
  t("ameaçar para saber é Intimidação, ao preço do segredo",
    ameaca && ameaca.tipo === "teste" && ameaca.id === "intimidar" && ameaca.social && ameaca.social.tamanho === "segredo");
  const conv = lerAcao("Tento convencer a Lina a contar-me o que se passa no Fundo do Poço.", ctxDepois);
  t("convencer para saber é Persuasão, ao preço do segredo", conv && conv.tipo === "teste" && conv.social && conv.social.tamanho === "segredo");
  const convComum = lerAcao("Tento convencer a Lina a me dar um desconto no quarto.", ctxDepois);
  t("e convencer para outra coisa continua com o degrau da frase", convComum && convComum.social && convComum.social.tamanho === "favor");

  /* o turno da revelação: o marco caiu — o sistema escolheu o momento */
  const segRev = G.segredosGuardados(ESPINHA_REVELADA);
  t("com o marco feito, não há segredo guardado", segRev.length === 0);
  const rRev = G.peneirarCanone(CRONISTA_T10, { espinha: ESPINHA_REVELADA });
  t("e a entrada do Fundo do Poço passa (é a revelação que o sistema decidiu)", "Fundo do Poço" in rRev.canone && rRev.recusadas.length === 0);
  t("o veto cala-se", G.vetoDoSegredo(J10, segRev).length === 0);
  const vRev = lerAcao(J10, { ...ctxAntes, segredos: segRev });
  t("e J10 volta a ser conversa (o segredo já não está guardado)", !vRev || vRev.id !== "fazer_falar");

  /* estar LÁ é onde o marco cai: o veto não pode contradizer a revelação */
  t("com a heroína no Fundo do Poço, não há veto", G.vetoDoSegredo("Olho em volta: o que se passa no Fundo do Poço?", segT10, { lugar: "O Fundo do Poço" }).length === 0);
  t("e no Último Gomo, há", G.vetoDoSegredo("O que se passa no Fundo do Poço?", segT10, { lugar: "O Último Gomo" }).length === 1);

  /* o cânone comum */
  const comum = {
    "Lina do Sal": { tipo: "pessoa", descricao: "taverneira do Último Gomo, mede as palavras" },
    "Máximo": { tipo: "pessoa", descricao: "serviçal da casa de banhos", local: "O Fundo do Poço" },
    "Chave do quarto comum": { tipo: "artefato", descricao: "chave de ferro, primeira porta à esquerda" },
    "A caravana": { tipo: "promessa", descricao: "a caravana de grão que não chega" },
  };
  const rc = G.peneirarCanone(comum, { espinha: ESPINHA_T10 });
  t("o cânone comum entra inteiro (gente, objeto, promessa)", Object.keys(rc.canone).length === 4 && rc.recusadas.length === 0);
  t("inclusive a pessoa que trabalha no lugar do segredo (menção não é segredo)", "Máximo" in rc.canone);

  /* imutabilidade e determinismo */
  const antes = JSON.stringify(CRONISTA_T10);
  const a1 = JSON.stringify(G.peneirarCanone(CRONISTA_T10, { espinha: ESPINHA_T10 }));
  const a2 = JSON.stringify(G.peneirarCanone(CRONISTA_T10, { espinha: ESPINHA_T10 }));
  t("a peneira não toca o cânone que recebe", JSON.stringify(CRONISTA_T10) === antes);
  t("e devolve um objeto novo", G.peneirarCanone(comum, { espinha: ESPINHA_T10 }).canone !== comum);
  t("a mesma entrada dá sempre a mesma resposta", a1 === a2);
  t("a espinha não é tocada", JSON.stringify(ESPINHA_T10.atos[0].marcos[1]) === JSON.stringify(MARCO_2) && MARCO_2.feito === false);

  /* o lixo: `= {}` não cobre null */
  t("segredosGuardados(null) e ({}) dão []", tenta(() => G.segredosGuardados(null).length === 0 && G.segredosGuardados({}).length === 0 && G.segredosGuardados({ atos: [null, { marcos: [null, 3, {}] }] }).length === 0, false));
  t("peneirarCanone(null) dá cânone vazio", tenta(() => { const r = G.peneirarCanone(null, null); return Object.keys(r.canone).length === 0 && r.recusadas.length === 0; }, false));
  t("peneirarCanone sem contexto deixa passar (nada guardado, base desconhecida)", tenta(() => "Fundo do Poço" in G.peneirarCanone(CRONISTA_T10).canone, false));
  t("pressionaSegredo com lixo dá null", tenta(() => G.pressionaSegredo(null, null) === null && G.pressionaSegredo(J10, null) === null && G.pressionaSegredo(J10, [null, {}]) === null && G.pressionaSegredo(undefined, segT10) === null, false));
  t("pressionaSegredo aceita a lista ou uma função que a dê", G.pressionaSegredo(J10, segT10) && G.pressionaSegredo(J10, () => segT10) && G.pressionaSegredo(J10, () => { throw new Error("x"); }) === null);
  t("vetoDoSegredo com lixo dá []", tenta(() => G.vetoDoSegredo(undefined, undefined).length === 0 && G.vetoDoSegredo(J10, null).length === 0 && G.vetoDoSegredo(J10, segT10, null).length === 1, false));
  t("pedidoDoSegredo(null) tem degrau e texto", tenta(() => { const p = G.pedidoDoSegredo(null); return p.dc === G.PEDIDO_DO_SEGREDO.dc && p.cede.length > 25 && p.nunca.length > 20; }, false));
  t("lerAcao com segredos lixo não quebra", tenta(() => { lerAcao(J10, { ...ctxAntes, segredos: null }); lerAcao(J10, { ...ctxAntes, segredos: () => { throw new Error("x"); } }); return true; }, false));
  t("dificuldadeSocial com pedido lixo cai no degrau da frase", dificuldadeSocial({ texto: "me dá um desconto", pedido: { id: "x" } }).tamanho === "favor" && dificuldadeSocial({ texto: "me dá um desconto", pedido: null }).tamanho === "favor");
}

/* ============================================================
   OS MUNDOS DE VERDADE
   ============================================================ */
const GENEROS = generosDisponiveis();
const MUNDOS = [];
for (const g of GENEROS) for (const Mo of MOLDES) {
  const semente = `Sonda MM15|${g}|${Mo.id}`;
  const mapa = gerarGeografia(semente, Mo);
  MUNDOS.push({ semente, genero: g, molde: Mo, mapa, cidade: mapa.cidades[0].nome });
}
const mundoDe = (w) => ({ semente: w.semente, mapa: w.mapa, genero: w.genero, molde: w.molde, lex: null, base: null });
const espinhaDe = (w, est) => estenderEspinha({ semente: w.semente, mapa: w.mapa, genero: w.genero, molde: w.molde, estrutura: est, cidadeInicial: w.cidade });

sec("3. num mundo de verdade: a pista é a base, e a base não se reescreve");
{
  /* o primeiro marco de descobrir que cai numa casa de banhos — o caso do T10 */
  let achado = null;
  for (const w of MUNDOS) {
    for (const est of ESTRUTURAS) {
      const e = espinhaDe(w, est.id);
      const s = G.segredosGuardados(e, mundoDe(w)).find((x) => x.tipo === "casa de banhos");
      if (s) { achado = { w, e, s }; break; }
    }
    if (achado) break;
  }
  t("há um mundo cuja espinha guarda o segredo de uma casa de banhos", !!achado);
  if (achado) {
    const { w, e, s } = achado;
    console.log(`      ${w.semente}: "${s.titulo}" — ${s.nome} (${s.tipo}, em ${s.cidade}); gente: ${s.gente.map((p) => p.nome).join(", ")}`);
    const cid = w.mapa.cidades.find((c) => c.nome === s.cidade);
    const l = locaisDaCidade(w.semente, cid, w.genero, w.molde).find((x) => x.nome === s.nome);
    const gente = genteDoLocal(w.semente, l, w.genero, w.molde);
    t("o segredo sabe o que o lugar é na base", s.tipo === l.tipo && s.cidade === l.cidade);
    t("e quem lá trabalha é a gente da base, no máximo duas", s.gente.length === Math.min(G.GENTE_DA_PISTA, gente.length) && s.gente.every((p, i) => p.nome === gente[i].nome));
    const ped = G.pedidoDoSegredo(s);
    t("o sucesso compra o que a base diz: a espécie, a cidade e os nomes", ped.cede.includes(s.chamado) && ped.cede.includes(s.cidade) && s.gente.every((p) => ped.cede.includes(p.nome)));
    const veto = G.vetoDoSegredo(`Diz-me o que se passa ${comEm(s.nome)}.`, [s]);
    t("o veto diz o que o lugar é, para não virar outra coisa", veto.length === 1 && veto[0].includes(s.chamado) && veto[0].includes(s.cidade));
    console.log(`      veto: ${veto[0]} (${veto[0].length} c.)`);

    /* a regra 2, isolada: com o marco JÁ FEITO, o segredo não morde —
       quem morde é a base */
    const feita = { ...e, atos: e.atos.map((a) => ({ ...a, marcos: a.marcos.map((m) => ({ ...m, feito: true })) })) };
    const poco = { [s.nome]: { tipo: "lugar", descricao: `Poço temido sob ${s.cidade} cuja água não reflete o próprio rosto` } };
    const rb = G.peneirarCanone(poco, { espinha: feita, mundo: mundoDe(w) });
    t("depois da revelação, a casa de banhos ainda não vira poço (a base não se reescreve)", !(s.nome in rb.canone) && rb.recusadas[0] && rb.recusadas[0].porque === "base");
    const banhos = { [s.nome]: { tipo: "lugar", descricao: `a casa de banhos de ${s.cidade}, onde a água da fonte velha devolve outro rosto` } };
    t("e a revelação dita sobre a casa de banhos entra", s.nome in G.peneirarCanone(banhos, { espinha: feita, mundo: mundoDe(w) }).canone);
    const semEspecie = { [s.nome]: { tipo: "lugar", descricao: "lugar de vapor e conversa baixa, onde a cidade vai à noite" } };
    t("uma descrição sem espécie nenhuma não contradiz nada", s.nome in G.peneirarCanone(semEspecie, { espinha: feita, mundo: mundoDe(w) }).canone);
  }

  /* o falso positivo da regra 2, medido: todo local da base, descrito
     pela própria espécie, tem de passar */
  let locais = 0, mordidos = 0;
  const ex = [];
  for (const w of MUNDOS) {
    for (const c of w.mapa.cidades.slice(0, 4)) {
      for (const l of locaisDaCidade(w.semente, c, w.genero, w.molde)) {
        locais++;
        const r = G.peneirarCanone({ [l.nome]: { tipo: "lugar", descricao: `${l.chamado || l.tipo} de ${c.nome}, onde o povo se junta`, local: c.nome } }, { mundo: mundoDe(w) });
        if (!(l.nome in r.canone)) { mordidos++; if (ex.length < 3) ex.push(`${l.nome} (${l.tipo})`); }
      }
    }
  }
  console.log(`      ${locais} locais da base descritos pela própria espécie · ${mordidos} recusados`);
  t(`nenhum local descrito pelo que é foi recusado (${mordidos}/${locais})`, mordidos === 0, ex.join(" | "));
}

sec("4. a medida — os mundos × as estruturas, antes e depois");
{
  const PRESSAO = [
    (n) => `"Lina, ouve. Sou soldada, sei calar o que ouço. Diz-me o que se passa ${comEm(n)}."`,
    (n) => `Conta-me o que ${n} esconde, e não me venhas com histórias.`,
    (n) => `Insisto com ela: quero saber o que há ${comEm(n)}.`,
    (n) => `Desembucha de uma vez o que se passa ${comEm(n)}.`,
    (n) => `Me diga a verdade sobre ${n}, eu preciso saber.`,
  ];
  const BALCAO = [
    (n) => `Onde fica ${n}?`,
    (n) => `O que se passa ${comEm(n)}?`,
    (n) => `Quanto custa entrar ${comEm(n)}?`,
  ];
  const CANONE = [
    (n) => ({ [n.replace(/^(O|A|Os|As) /, "")]: { tipo: "lugar", descricao: "lugar temido, onde ninguém entra e quem fala some" } }),
    (n) => ({ "A água que devolve outro rosto": { tipo: "segredo", descricao: `o que se esconde ${comEm(n)}` } }),
    (n) => ({ "Chave de osso": { tipo: "artefato", descricao: "uma chave antiga que ninguém reclama", local: n } }),
  ];
  let segredos = 0;
  const m = { pressao: 0, antesTeste: 0, antesVeto: 0, depoisTeste: 0, depoisVeto: 0, balcao: 0, balcaoTeste: 0, balcaoVeto: 0, canone: 0, entravam: 0, entram: 0, controle: 0, controleMordido: 0 };
  const exP = [], exB = [], exC = [];
  for (const w of MUNDOS) {
    for (const est of ESTRUTURAS) {
      const e = espinhaDe(w, est.id);
      const ss = G.segredosGuardados(e, mundoDe(w));
      segredos += ss.length;
      for (const s of ss) {
        const pessoa = { nome: (s.gente[0] && s.gente[0].nome) || "Lina do Sal", papel: "taverneira", relacao: "neutro" };
        const ctx0 = { personagem: BRITES, semente: w.semente, lugar: "a taverna", tentativas: {}, dia: 1, pessoaDe: () => pessoa };
        const ctx1 = { ...ctx0, segredos: () => ss };
        for (const f of PRESSAO) {
          const frase = f(s.nome);
          m.pressao++;
          const a = tenta(() => lerAcao(frase, ctx0));
          const d = tenta(() => lerAcao(frase, ctx1));
          if (a && a.tipo === "teste") m.antesTeste++;
          if (d && d.tipo === "teste" && d.social && d.social.tamanho === "segredo") m.depoisTeste++;
          else if (exP.length < 3) exP.push(`${frase} → ${d ? `${d.tipo} ${d.id || ""}` : "null"}`);
          if (G.vetoDoSegredo(frase, ss).length) m.depoisVeto++;
        }
        for (const f of BALCAO) {
          const frase = f(s.nome);
          m.balcao++;
          const d = tenta(() => lerAcao(frase, ctx1));
          if (d && d.tipo === "teste" && d.social && d.social.tamanho === "segredo") { m.balcaoTeste++; if (exB.length < 3) exB.push(frase); }
          if (G.vetoDoSegredo(frase, ss).length) m.balcaoVeto++;
        }
        for (const f of CANONE) {
          const c = f(s.nome);
          m.canone++;
          m.entravam++;  /* as portas do App gravam tudo o que chega */
          const r = G.peneirarCanone(c, { espinha: e, mundo: mundoDe(w) });
          if (Object.keys(r.canone).length) { m.entram++; if (exC.length < 3) exC.push(Object.keys(c)[0]); }
        }
        /* o controle: gente da casa e uma promessa comum passam */
        const ctrl = { [pessoa.nome]: { tipo: "pessoa", descricao: "trabalha ali", local: s.nome }, "A dívida da irmã": { tipo: "promessa", descricao: "a dívida que a heroína paga" } };
        m.controle += 2;
        m.controleMordido += 2 - Object.keys(G.peneirarCanone(ctrl, { espinha: e, mundo: mundoDe(w) }).canone).length;
      }
    }
  }
  console.log(`      ${MUNDOS.length} mundos × ${ESTRUTURAS.length} estruturas: ${segredos} segredos guardados (marcos de descobrir de pé)`);
  console.log(`      pressão sobre o segredo: ${m.pressao} frases · com teste ANTES ${m.antesTeste}, com veto ANTES 0 · com teste DEPOIS ${m.depoisTeste}, com veto DEPOIS ${m.depoisVeto}`);
  console.log(`      perguntas de balcão sobre o lugar: ${m.balcao} · com teste DEPOIS ${m.balcaoTeste} · com veto DEPOIS ${m.balcaoVeto}`);
  console.log(`      entradas de cânone sobre o segredo: ${m.canone} · entravam ANTES ${m.entravam} · entram DEPOIS ${m.entram}`);
  console.log(`      controle (gente da casa, promessa): ${m.controle} · recusados ${m.controleMordido}`);
  t("a varredura achou segredos guardados", segredos > 50);
  t(`ANTES, quase nenhuma pressão sobre o segredo pedia teste (${m.antesTeste}/${m.pressao})`, m.antesTeste < m.pressao / 4);
  t(`DEPOIS, toda pressão sobre o segredo pede teste ao preço do segredo (${m.depoisTeste}/${m.pressao})`, m.depoisTeste === m.pressao, exP.join(" | "));
  t(`e toda leva o veto (${m.depoisVeto}/${m.pressao})`, m.depoisVeto === m.pressao);
  t(`nenhuma pergunta de balcão virou teste (${m.balcaoTeste}/${m.balcao})`, m.balcaoTeste === 0, exB.join(" | "));
  t(`e toda leva o veto (${m.balcaoVeto}/${m.balcao})`, m.balcaoVeto === m.balcao);
  t(`nenhuma entrada de cânone sobre um segredo de pé entra (${m.entram}/${m.canone}; antes ${m.entravam})`, m.entram === 0, exC.join(" | "));
  t(`e o controle passa inteiro (${m.controle - m.controleMordido}/${m.controle})`, m.controleMordido === 0);
}

sec("5. a régua da dificuldade vem da casa");
{
  /* o degrau do segredo é um número da tabela de dificuldades da casa? Não
     precisa ser um degrau de lá — mas tem de cair entre dois deles, e o
     nome que o jogador lê sai de lá */
  const dcs = DIFICULDADES.map((d) => d.dc);
  t("o 16 cai entre dois degraus da régua (incomum 15, difícil 18)", dcs.some((d) => d < G.PEDIDO_DO_SEGREDO.dc) && dcs.some((d) => d > G.PEDIDO_DO_SEGREDO.dc));
}

/* ============================================================
   6. A FIAÇÃO — App.jsx (fiação por texto, fim de linha normalizado)
   ============================================================ */
sec("6. a fiação — App.jsx");
{
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

  /* extrai o corpo de uma função a partir de uma âncora que TERMINA na
     chave que abre o corpo (ver teste-mm13-abertura.mjs, seção 11) */
  const corpoApos = (fonte, ancora) => {
    const ini = fonte.indexOf(ancora);
    if (ini < 0) return "";
    const abre = ini + ancora.length - 1;
    let prof = 0;
    for (let i = abre; i < fonte.length; i++) {
      if (fonte[i] === "{") prof++;
      else if (fonte[i] === "}") { prof--; if (prof === 0) return fonte.slice(abre, i + 1); }
    }
    return "";
  };

  /* ---- 1. o import, junto do de saga.js ---- */
  t("App.jsx importa segredosGuardados, vetoDoSegredo e peneirarCanone",
    app.includes('import { segredosGuardados, vetoDoSegredo, peneirarCanone } from "./segredo-guardado.js";'));

  /* ---- 2. o mundo da base, perto de mundoDasMissoes/mundoDasTarefas ---- */
  t("mundoDaBase existe e leva semente, mapa, genero, molde, lex e base",
    app.includes("const mundoDaBase = () => ({ semente: sementeMundo(), mapa: mapaRef.current, genero: generoMundo(), molde: moldeMundo(), lex: (mundoAtual() || {}).lexico, base: baseMundoRef.current });"));

  /* ---- 3. ctxDesafio: segredos ---- */
  const ctxDesafio = corpoApos(app, "const ctxDesafio = () => ({");
  t("a âncora de ctxDesafio existe, e o corpo não está vazio", ctxDesafio.length > 300);
  t("ctxDesafio leva segredos(), guardado por calou",
    ctxDesafio.includes("segredos: () => { try { return segredosGuardados(espinhaRef.current, mundoDaBase()); } catch (e) { calou(\"segredosGuardados\", e); return []; } },"));

  /* ---- 4. pautaDoTurno: o veto do segredo, DEPOIS dos dois naoPode da
     abertura (teste-mm13-abertura.mjs exige essa ordem) ---- */
  const pauta = corpoApos(app, 'const pautaDoTurno = (acaoDoTurno = "") => {');
  t("o corpo de pautaDoTurno não está vazio", pauta.length > 3000);
  t("o veto do segredo entra em try/calou, chamando vetoDoSegredo com a espinha, a base e o lugar",
    pauta.includes('p = porNaPauta(p, "naoPode", vetoDoSegredo(acaoDoTurno, segredosGuardados(espinhaRef.current, mundoDaBase()), { lugar: (lugarRef.current && lugarRef.current.nome) || "" }));')
    && pauta.includes('calou("vetoDoSegredo", e);'));
  t("e vem DEPOIS de vetosDaAbertura (as duas linhas da abertura continuam na frente)",
    pauta.indexOf("vetosDaAbertura(") < pauta.indexOf("vetoDoSegredo("));

  /* ---- 5. as duas portas do cânone, peneiradas, com fallback seguro ---- */
  t("a porta do Narrador peneira resp.mudancas.canone antes do for, com fallback para a lista original se a peneira estourar",
    app.includes('let canoneDoNarrador = resp.mudancas.canone;')
    && app.includes('try { canoneDoNarrador = peneirarCanone(resp.mudancas.canone, { espinha: espinhaRef.current, mundo: mundoDaBase() }).canone; } catch (e) { calou("peneirarCanone (Narrador)", e); }')
    && app.includes('for (const [nome, ficha] of Object.entries(canoneDoNarrador)) {'));
  t("a porta do Cronista peneira r.canone antes do for, com o mesmo fallback",
    app.includes('let canoneDoCronista = r.canone;')
    && app.includes('try { canoneDoCronista = peneirarCanone(r.canone, { espinha: espinhaRef.current, mundo: mundoDaBase() }).canone; } catch (e) { calou("peneirarCanone (Cronista)", e); }')
    && app.includes('for (const [nome, ficha] of Object.entries(canoneDoCronista)) {'));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
