/* A MASMORRA SEM A CIDADE (MM17, etapa C2) — a prova

   A pessoa, a 06/10: a região delimitada resolve "o prompt da masmorra que
   traz os locais da cidade". Com o herói numa câmara, o turno ainda levava
   ao Narrador a cidade de onde ele saiu — os locais, a gente, os segredos e
   os rumores (`resumoDaqui`), os arredores, o ermo, as saídas, a forma do
   mundo, a gente por conhecer e as regras do mercado e da economia. A
   medida (`medir-regiao.mjs`, secção h) diz quanto: mediana ~9.400 car. por
   turno lá dentro numa campanha de região, ~7.500 no continente.

   O que esta suíte guarda:
     1. as tabelas (`DENTRO_DA_MASMORRA`, `PORTAS_NA_MASMORRA`,
        `HORIZONTE_NA_PERGUNTA`, `FICHA_NA_MASMORRA`) e o porquê de cada
        bloco;
     2. lá dentro (sala e luta, 200 mundos de região + 60 continentais):
        "da cidade" no turno vai a 0 — e era > 0 antes (a mesma função com
        `depois: false` é o App de HEAD v9.357: FALHA ANTES, PASSA DEPOIS);
     3. fora da masmorra, NADA muda: o "aqui", a cena do system, as portas
        (todas as combinações) e o system inteiro, em N mundos × cenas. A
        prova contra a árvore de HEAD (git archive) está em `medir-regiao`
        (h, fora): é medida, não catraca, porque o system muda por outras
        mãos todas as semanas e um hash de HEAD gravado aqui apodreceria.
        Aqui prova-se o mesmo de forma que dura: o código novo, chamado
        fora da masmorra, é a identidade;
     4. a ficha do lugar: só em região, só fora da luta, sem facto novo;
     5. o horizonte: 0 bytes a quem não pergunta, nunca na masmorra nem na
        luta, e quando perguntado o oráculo não o desmente;
     6. o teto: 500 cenas com a ficha — a sala, o 1.º veto, o desfecho e o
        "como" não caem, e a ficha não tira veto nenhum;
     7. a fiação no App, por texto.

   Determinismo: toda sorte é semeada (`rng(hashSemente(...))`); a planta
   corre com `Math.random` trocado por um gerador semeado e restaurado. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import * as S from "../src/masmorra-sem-cidade.js";
import { PORTAS_DA_CENA, portasAbertas, montarSystemPrompt } from "../src/prompt.js";
import { porNaPauta, textoDaPauta, cederNaCena, TETO_DA_PAUTA } from "../src/pauta.js";
import { juntarRespostas } from "../src/perguntas.js";
import { ehPerguntaAoMundo, A_FICHA_DECIDE } from "../src/oraculo.js";
import { gerarMasmorra, masmorraParaPauta } from "../src/masmorras.js";
import { linhaDoLugar } from "../src/geografo.js";
import { masmorrasDoMundo, resumoDaqui } from "../src/mundo-base.js";
import { gerarGeografia } from "../src/geografia.js";
import { moldePorId } from "../src/moldes.js";
import { ESTRUTURAS } from "../src/historia.js";
import { mapaDaCriacao, mapaDaCampanhaNova } from "../src/regiao.js";
import { hashSemente, rng } from "../src/semente.js";
import { aplicarEscolha, envelopeDoGolpeFinal, golpeFinalNaPauta } from "../src/golpe-final.js";
import { resumoMapaParaPrompt, resumoDiplomacia } from "../src/mapa.js";
import { sementeDe, generoDe, turnoNaMasmorra, medirMasmorraSemCidade, HEROI_DA_MEDIDA, CENAS_FORA, FRASES_SEM_HORIZONTE, FRASES_DO_HORIZONTE, horizonteCusta } from "./medir-regiao.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
const congelar = (o) => { if (o && typeof o === "object") { Object.freeze(o); for (const v of Object.values(o)) congelar(v); } return o; };
const hash = (x) => createHash("sha256").update(typeof x === "string" ? x : JSON.stringify(x)).digest("hex").slice(0, 16);

/* os mundos: a região de uma campanha nova de Uma Vida (o que o App chama)
   e o continente de sempre, sobre as mesmas sementes */
const SOBRE = moldePorId("sobremundo");
const mapaRegiao = (i) => mapaDaCampanhaNova(mapaDaCriacao({ semente: sementeDe(i), molde: SOBRE, genero: generoDe(i), estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id, modo: "historia" }));
const mapaContinente = (i) => mapaDaCampanhaNova(gerarGeografia(sementeDe(i), SOBRE));
const NR = 200, NC = 60;
const REG = Array.from({ length: NR }, (_, i) => ({ i, semente: sementeDe(i), genero: generoDe(i), mapa: mapaRegiao(i) }));
const CON = Array.from({ length: NC }, (_, i) => ({ i, semente: sementeDe(i), genero: generoDe(i), mapa: mapaContinente(i) }));
const ACASO = Math.random;
const semeado = (s, f) => { Math.random = rng(hashSemente(s)); try { return f(); } finally { Math.random = ACASO; } };
/* a masmorra que o App abriria num lugar: a planta do tamanho anunciado,
   com o nome do mapa */
const abrir = (w, m) => ({ ...semeado(`sem-cidade|${w.semente}|${m.nome}`, () => gerarMasmorra(w.genero, m.nivel, m.nome, { salas: m.salas })), nome: m.nome });

/* ============================================================ */
sec("1. as tabelas");
{
  const D = S.DENTRO_DA_MASMORRA;
  const ids = Object.keys(D);
  t("DENTRO_DA_MASMORRA: todo bloco diz se cala (booleano) e por quê (frase)", ids.length >= 12 && ids.every((k) => typeof D[k].cala === "boolean" && typeof D[k].porque === "string" && D[k].porque.length > 20));
  t("o \"aqui\" do rodapé são nove blocos, na ordem em que o App os lia", ids.slice(0, 9).join(",") === "forma,ondeEstou,comodos,daqui,formaDaCidade,viagem,ermo,arredores,saidas");
  t("lá dentro calam a cidade, a estrada e o mundo (o \"aqui\", o mercado, a gente por conhecer, o [ONDE ACORDO])",
    ["forma", "ondeEstou", "comodos", "daqui", "formaDaCidade", "viagem", "ermo", "arredores", "saidas", "mercado", "povoar", "acordo"].every((k) => D[k] && D[k].cala === true));
  t("e os chefes ficam: a história pode pô-los no fundo, e sem a lista o Narrador inventaria outro", D.chefes && D.chefes.cala === false);
  const P = S.PORTAS_NA_MASMORRA;
  t("PORTAS_NA_MASMORRA: o mercado, a cidade, a estrada e o prédio fecham (todas false)", JSON.stringify(Object.keys(P).sort()) === JSON.stringify(["dentroDeUmLocal", "emCidade", "emViagem", "temMercado"]) && Object.values(P).every((v) => v === false));
  /* cada chave é uma bandeira que alguma porta do system lê de verdade: a
     porta abre com ela verdadeira e fecha com ela falsa */
  const lida = (k) => PORTAS_DA_CENA.some((p) => tenta(() => p.quando({ [k]: true }) !== p.quando({ [k]: false }), false));
  t("e cada uma é bandeira que uma porta do system lê (não é campo morto)", Object.keys(P).every(lida));
  const H = S.HORIZONTE_NA_PERGUNTA;
  t("HORIZONTE_NA_PERGUNTA: duas regex, o nome mínimo, o máximo de terras e os rótulos", H.pede instanceof RegExp && H.alem instanceof RegExp && H.nomeMinimo >= 3 && H.maximo >= 1 && H.maximo <= 4 && H.rotulos.regiao && H.rotulos.cidade && H.rotulos.terra);
  t("FICHA_NA_MASMORRA: as horas no passo de meia hora", S.FICHA_NA_MASMORRA.passoDasHoras === 0.5);
}

/* ============================================================ */
sec("2. o que cala, e o lixo");
{
  const mm = { nome: "A Nave de Ferro", salas: [], encerrada: false };
  t("aberta: o resumoDaqui cala", S.calaNaMasmorra("daqui", mm) === true);
  t("aberta: os chefes não calam", S.calaNaMasmorra("chefes", mm) === false);
  t("encerrada, nula, sem nome ou lixo: nada cala",
    [{ ...mm, encerrada: true }, null, undefined, {}, { nome: "" }, "Nave", 7, []].every((x) => S.calaNaMasmorra("daqui", x) === false));
  t("id que a tabela não conhece (nem os do protótipo) nunca cala",
    ["toString", "__proto__", "constructor", "hasOwnProperty", "", null, undefined, 3].every((id) => S.calaNaMasmorra(id, mm) === false));
  t("aquiDoTurno com blocos lixo: texto vazio, sem estourar", [null, undefined, 3, "x", []].every((b) => S.aquiDoTurno(b, mm) === "" && S.aquiDoTurno(b, null) === ""));
  t("aquiDoTurno ignora bloco que não é texto", S.aquiDoTurno({ forma: 3, daqui: { a: 1 }, saidas: "s" }, null) === "s");
  t("cenaNaMasmorra(null/lixo) devolve o que recebeu", S.cenaNaMasmorra(null) === null && S.cenaNaMasmorra(undefined) === undefined && S.cenaNaMasmorra("x") === "x");
  const fora = congelar({ emCidade: true, temMercado: true, emMasmorra: false });
  t("fora da masmorra, a cena é O MESMO objeto (nada se copia, nada muda)", S.cenaNaMasmorra(fora) === fora);
  t("emMasmorra que não é true (\"sim\", 1) não fecha nada", S.cenaNaMasmorra({ emMasmorra: "sim", emCidade: true }).emCidade === true && S.cenaNaMasmorra({ emMasmorra: 1, temMercado: true }).temMercado === true);
  const dentro = congelar({ emMasmorra: true, emCidade: true, temMercado: true, emViagem: true, dentroDeUmLocal: true, conjura: true });
  const c2 = tenta(() => S.cenaNaMasmorra(dentro), null);
  t("lá dentro, uma cena NOVA com as portas fechadas — a recebida (congelada) intacta",
    !!c2 && c2 !== dentro && c2.temMercado === false && c2.emCidade === false && c2.emViagem === false && c2.dentroDeUmLocal === false && c2.conjura === true && c2.emMasmorra === true && dentro.temMercado === true);
  const blocos = congelar({ forma: "F", daqui: "D", arredores: "A", saidas: "S", chefes: "C" });
  t("aquiDoTurno não muta os blocos (congelados) e fala só o que fica", tenta(() => S.aquiDoTurno(blocos, mm), "x") === "" && tenta(() => S.aquiDoTurno(blocos, null), "") === "F\n\nD\n\nA\n\nS");
}

/* ============================================================ */
sec("3. lá dentro: \"da cidade\" vai a 0 (falha antes, passa depois)");
{
  const reg = await medirMasmorraSemCidade((i) => ({ ...REG[i], cidade: () => REG[i].mapa.cidades[0].nome }), NR);
  const con = await medirMasmorraSemCidade((i) => ({ ...CON[i], cidade: (m) => m.cidadeProxima }), NC);
  for (const [rot, { M, mundos }] of [["região", reg], ["continente", con]]) {
    const n = mundos;
    for (const cena of ["sala", "luta"]) {
      const antes = M[`${cena}.antes.cidade`], depois = M[`${cena}.depois.cidade`];
      t(`${rot}, na ${cena} (${n} mundos): ANTES a cidade ia junto em todos (o defeito que a etapa conserta)`, n >= (rot === "região" ? 190 : 55) && antes.length === n && antes.every((x) => x > 2000), `mín ${Math.min(...antes)}`);
      t(`${rot}, na ${cena}: DEPOIS, 0 caracteres da cidade em ${depois.filter((x) => x === 0).length}/${n}`, depois.length === n && depois.every((x) => x === 0));
      const tA = M[`${cena}.antes.total`], tD = M[`${cena}.depois.total`];
      t(`${rot}, na ${cena}: o turno inteiro encolhe em todos os mundos (e nunca cresce)`, tA.every((x, k) => tD[k] < x), `mediana ${tA.sort((a, b) => a - b)[n >> 1]} → ${tD.sort((a, b) => a - b)[n >> 1]}`);
      t(`${rot}, na ${cena}: o ONDE não muda (a sala é de ferro e é a mesma)`, M[`${cena}.antes.onde`].every((x, k) => M[`${cena}.depois.onde`][k] === x));
    }
    /* a seção MASMORRA cresce só pela linha da ficha, e só fora da luta */
    t(`${rot}: na luta a seção MASMORRA é a de antes (uma linha, a do tabuleiro)`, M["luta.antes.secao"].every((x, k) => M["luta.depois.secao"][k] === x) && M["luta.depois.ficha"].every((x) => x === 0));
  }
  t("região, na sala: a linha da ficha vai junto em todos os mundos", reg.M["sala.depois.ficha"].every((x) => x > 40));
  t("continente: nenhuma linha de ficha (não há ficha para dizer)", con.M["sala.depois.ficha"].every((x) => x === 0));
  /* determinismo: o mesmo mundo dá o mesmo turno, byte a byte */
  const w = REG[7], m = masmorrasDoMundo(w.semente, w.mapa)[0];
  const a = await turnoNaMasmorra({ ...w, m, cidade: w.mapa.cidades[0].nome });
  const b = await turnoNaMasmorra({ ...w, m, cidade: w.mapa.cidades[0].nome });
  t("determinismo: o mesmo mundo, o mesmo turno lá dentro", hash(a.textos) === hash(b.textos));
  /* e o que sobra no rodapé não tem a cidade: nenhum local da base */
  const daqui = resumoDaqui(w.semente, w.mapa, w.mapa.cidades[0].nome, null, w.genero, "sobremundo");
  const locais = ((daqui.match(/Locais: (.*)\./) || [])[1] || "").split(" · ").map((x) => x.replace(/^\S+\s/, "").replace(/ \(.*$/, "")).filter(Boolean);
  t(`o rodapé lá dentro não nomeia nenhum dos ${locais.length} locais da base`, locais.length >= 3 && locais.every((l) => !a.textos.rodape.includes(l) && !a.textos.pauta.includes(l)));
}

/* ============================================================ */
sec("4. fora da masmorra, nada muda");
{
  /* as portas: TODAS as combinações das bandeiras que a etapa toca, com
     emMasmorra falso — as portas abertas são as de antes. A regra de antes
     do ermo, escrita aqui como era em HEAD v9.357. */
  const ERMO_DE_ANTES = (c) => !c.emCidade || !!c.emViagem;
  const BAND = ["emCidade", "emViagem", "emCombate", "temMercado", "dentroDeUmLocal", "temChao"];
  let combos = 0, iguais = 0, ermoIgual = 0;
  for (let k = 0; k < 1 << BAND.length; k++) {
    const cena = Object.fromEntries(BAND.map((b, j) => [b, !!(k & (1 << j))]));
    for (const emM of [false, undefined]) {
      const c = emM === undefined ? cena : { ...cena, emMasmorra: emM };
      combos++;
      if (JSON.stringify(portasAbertas(S.cenaNaMasmorra(c))) === JSON.stringify(portasAbertas(c))) iguais++;
      if (portasAbertas(c).ermo === ERMO_DE_ANTES(c)) ermoIgual++;
    }
  }
  t(`as portas, ${combos} combinações fora da masmorra: as mesmas com e sem a etapa`, iguais === combos);
  t(`e a porta do ermo abre como em HEAD em ${ermoIgual}/${combos}`, ermoIgual === combos);
  t("lá dentro o ermo não abre (\"não há cidade\" não é \"estou entre os assentamentos\")", portasAbertas(S.cenaNaMasmorra({ emMasmorra: true, emCidade: true })).ermo === false && portasAbertas(S.cenaNaMasmorra({ emMasmorra: true })).ermo === false);
  t("lá dentro ficam a masmorra e a aflição; saem o mercado, a cidade, a estrada e o prédio", (() => {
    const p = portasAbertas(S.cenaNaMasmorra({ emMasmorra: true, emCidade: true, temMercado: true, emViagem: true, dentroDeUmLocal: true }));
    return p.masmorra && p.aflicao && !p.mercado && !p.cidade && !p.viagem && !p.comodos;
  })());
  /* o system e o "aqui", em N mundos × as cenas de fora (a cidade, o
     prédio, a estrada, o ermo, a luta na cidade e no ermo, a masmorra
     encerrada): o código novo, chamado fora, é a identidade */
  let turnos = 0, sysIgual = 0, aquiIgual = 0, pautaZero = 0;
  for (const w of [...REG.slice(0, 60), ...CON.slice(0, 30)]) {
    const mapaInfo = (resumoMapaParaPrompt(w.mapa, "") + "\n" + resumoDiplomacia(w.mapa, "")).trim();
    const cid = w.mapa.cidades[0];
    const blocos = { forma: "FORMA", ondeEstou: "", comodos: "", daqui: resumoDaqui(w.semente, w.mapa, cid.nome, null, w.genero, "sobremundo"), formaDaCidade: "", viagem: "", ermo: "ERMO", arredores: "ARREDORES", saidas: "" };
    const aquiDeAntes = [blocos.forma, blocos.ondeEstou, blocos.comodos, blocos.daqui, blocos.formaDaCidade, blocos.viagem, blocos.ermo, blocos.arredores, blocos.saidas].filter(Boolean).join("\n\n");
    for (const [id, cena] of Object.entries(CENAS_FORA)) {
      const mm = id === "encerrada" ? { nome: "Cripta", encerrada: true, salas: [] } : null;
      turnos++;
      const sys = (c) => montarSystemPrompt("C", { genero: w.genero }, HEROI_DA_MEDIDA, {}, { elenco: [], cidades: [], tavernas: [] }, mapaInfo, "", "", "", "", "", "Mortal", c);
      if (sys(cena) === sys(S.cenaNaMasmorra(cena))) sysIgual++;
      if (S.aquiDoTurno(blocos, mm) === aquiDeAntes) aquiIgual++;
      const luta = !!cena.emCombate;
      if (S.linhaDaFicha(w.mapa, mm, { luta }) === "" && FRASES_SEM_HORIZONTE.every((f) => S.horizonteDaPergunta(f, w.mapa, { masmorra: mm, luta }) === null)) pautaZero++;
    }
  }
  t(`o system, ${turnos} turnos fora (90 mundos × ${Object.keys(CENAS_FORA).length} cenas): idêntico em ${sysIgual}/${turnos}`, sysIgual === turnos);
  t(`o "aqui" do rodapé fora: o join de sempre em ${aquiIgual}/${turnos}`, aquiIgual === turnos);
  t(`a pauta fora: a etapa põe 0 bytes (sem ficha, sem horizonte não pedido) em ${pautaZero}/${turnos}`, pautaZero === turnos);
}

/* ============================================================ */
sec("5. a ficha do lugar: só em região, fora da luta, sem facto novo");
{
  let lugares = 0, comLinha = 0, semFactoNovo = 0, horasNoPasso = 0, naLuta = 0, encerrada = 0;
  for (const w of REG) {
    for (const m of masmorrasDoMundo(w.semente, w.mapa)) {
      const l = (w.mapa.regiao.lugares || []).find((x) => x.nome === m.nome);
      if (!l || !l.ficha) continue;
      lugares++;
      const mm = abrir(w, m);
      const linha = S.linhaDaFicha(w.mapa, mm);
      if (linha.startsWith(`a ficha do lugar: ${l.nome}`)) comLinha++;
      /* nada que a ficha não tenha: cada bicho dito está em ficha.quem, a
         base é a da região, o perigo é o da ficha */
      const ditos = ((linha.match(/andam (.*?)(;|$)/) || [])[1] || "").split(", ").map((x) => x.replace(/ \(nv \d+\)$/, "")).filter(Boolean);
      if (ditos.every((d) => l.ficha.quem.some((q) => q.nome === d)) && ditos.length === l.ficha.quem.length && linha.includes(w.mapa.regiao.base.nome) && linha.includes(l.ficha.perigoRotulo)) semFactoNovo++;
      const h = Number(((linha.match(/fica a ([\d,]+) h/) || [])[1] || "x").replace(",", "."));
      if (Number.isFinite(h) && (h * 2) % 1 === 0 && Math.abs(h - l.ficha.horas) <= 0.25 + 1e-9) horasNoPasso++;
      if (S.linhaDaFicha(w.mapa, mm, { luta: true }) === "") naLuta++;
      if (S.linhaDaFicha(w.mapa, { ...mm, encerrada: true }) === "") encerrada++;
    }
  }
  t(`${lugares} lugares de região com ficha (200 mundos): a linha nasce em todos`, lugares > 1000 && comLinha === lugares, `${comLinha}`);
  t(`sem facto novo: os bichos, a base e o perigo saem da ficha em ${semFactoNovo}/${lugares}`, semFactoNovo === lugares);
  t(`as horas no passo de meia hora, a menos de um quarto da ficha, em ${horasNoPasso}/${lugares}`, horasNoPasso === lugares);
  t(`na luta, nada (${naLuta}/${lugares}); com a masmorra encerrada, nada (${encerrada}/${lugares})`, naLuta === lugares && encerrada === lugares);
  const w = REG[0], m = masmorrasDoMundo(w.semente, w.mapa)[0];
  const mm = abrir(w, m);
  t("o nome casa sem artigo nem caixa nem acento (a régua do App ao entrar)", S.linhaDaFicha(w.mapa, { ...mm, nome: m.nome.toUpperCase() }) === S.linhaDaFicha(w.mapa, mm));
  t("uma masmorra que a IA batizou (fora da região): nada", S.linhaDaFicha(w.mapa, { ...mm, nome: "O Poço que Ninguém Mapeou" }) === "");
  t("continente (sem `mapa.regiao`): nada, em todas as masmorras", CON.every((c) => masmorrasDoMundo(c.semente, c.mapa).every((x) => S.linhaDaFicha(c.mapa, { nome: x.nome, salas: [] }) === "")));
  t("lixo (mapa nulo, regiao sem lugares, lugar sem ficha, opções lixo): nada, sem estourar",
    [null, {}, { regiao: null }, { regiao: { lugares: "x" } }, { regiao: { lugares: [null, { nome: m.nome }] } }].every((mp) => tenta(() => S.linhaDaFicha(mp, mm), "x") === "")
    && tenta(() => S.linhaDaFicha(w.mapa, mm, null), "") === S.linhaDaFicha(w.mapa, mm) && tenta(() => S.linhaDaFicha(w.mapa, mm, "luta"), "") === S.linhaDaFicha(w.mapa, mm));
  const fria = congelar(structuredClone(w.mapa));
  t("não muta o mapa (congelado) e é determinística", tenta(() => S.linhaDaFicha(fria, mm), "x") === S.linhaDaFicha(w.mapa, mm) && JSON.stringify(fria) === JSON.stringify(w.mapa));
}

/* ============================================================ */
sec("6. o horizonte: 0 bytes a quem não pergunta, nunca lá dentro");
{
  const hz = await horizonteCusta((i) => REG[i], NR);
  t(`frases que não perguntam por terras de além (${FRASES_SEM_HORIZONTE.length} × 4 cenas × ${hz.mundos} mundos): 0 bytes em ${hz.mudos}/${hz.perguntas}`, hz.mudos === hz.perguntas);
  t(`perguntado na masmorra ou na luta: cala sempre (${hz.laDentro} falas)`, hz.laDentro === 0);
  t(`perguntado cá fora (cidade, estrada): fala em ${hz.falou}/${hz.mundos * 2 * FRASES_DO_HORIZONTE.length}`, hz.falou === hz.mundos * 2 * FRASES_DO_HORIZONTE.length);
  t(`e é UMA linha curta (mediana ${hz.linhas.sort((a, b) => a - b)[hz.linhas.length >> 1]}, máx ${Math.max(...hz.linhas)} car.)`, Math.max(...hz.linhas) <= 400);
  /* "além do guarda" é "também": o falso positivo calaria o oráculo */
  const w = REG[3];
  for (const f of ["Além do guarda, há mais alguém aqui?", "Além disso, há quartos livres?", "Há outras cidades na região?", "O que há além da porta?"]) {
    t(`"${f}" não chama o horizonte (e o oráculo segue como antes)`, S.horizonteDaPergunta(f, w.mapa, {}) === null);
  }
  const h = S.horizonteDaPergunta("Há reinos além das montanhas?", w.mapa, {});
  t("\"Há reinos além das montanhas?\" — uma linha, na forma das fichas da mesa", !!h && h.pergunta.length === 1 && h.em.length === 1 && h.pergunta[0].startsWith("além da região"));
  t(`no máximo ${S.HORIZONTE_NA_PERGUNTA.maximo} terras, todas do horizonte do mapa`, !!h && h.pergunta[0].split(" · ").length <= S.HORIZONTE_NA_PERGUNTA.maximo && w.mapa.regiao.horizonte.slice(0, 3).every((x) => h.pergunta[0].includes(x.nome)));
  const nome = w.mapa.regiao.horizonte[w.mapa.regiao.horizonte.length - 1].nome;
  const hn = S.horizonteDaPergunta(`Já ouviu falar de ${nome}?`, w.mapa, {});
  t(`a terra perguntada pelo nome vem primeiro ("${nome}")`, !!hn && hn.pergunta[0].split(": ")[1].startsWith(nome));
  t("o nome só casa como palavra inteira", S.horizonteDaPergunta(`Sabe se ${nome.toLowerCase().replace(/\s/g, "")}xyz abre?`, w.mapa, {}) === null);
  t("sem região, sem horizonte (o continente cala)", CON.every((c) => S.horizonteDaPergunta("Há reinos além das montanhas?", c.mapa, {}) === null));
  t("lixo (frase nula, número, mapa nulo, ctx lixo): null, sem estourar",
    [null, 3, "", {}].every((f) => tenta(() => S.horizonteDaPergunta(f, w.mapa, {}), "x") === null)
    && [null, {}, { regiao: { horizonte: "x" } }, { regiao: { horizonte: [null, {}] } }].every((mp) => tenta(() => S.horizonteDaPergunta("Há reinos além das montanhas?", mp, {}), "x") === null)
    && tenta(() => S.horizonteDaPergunta("Há reinos além das montanhas?", w.mapa, null), null) !== null);
  const fria = congelar(structuredClone(w.mapa));
  t("não muta o mapa (congelado) e é determinístico", JSON.stringify(tenta(() => S.horizonteDaPergunta("Há reinos além das montanhas?", fria, {}), "x")) === JSON.stringify(h));
  /* a mesa: o horizonte que cala não muda nada; o que fala entra por
     ordem da frase, como as outras fichas */
  const fc = { pergunta: ["a cidade: x"], em: [5] };
  t("juntarRespostas com o horizonte calado é a mesa de antes", JSON.stringify(juntarRespostas([fc, null, null, null])) === JSON.stringify(juntarRespostas([fc, null, null])));
  t("e com ele a falar, a linha vai à mesa", juntarRespostas([null, null, null, h]).includes(h.pergunta[0]));
  /* o oráculo: o d100 não desmente o mapa */
  t("o oráculo: \"horizonte\" é ficha que decide a pergunta do mundo", A_FICHA_DECIDE.mundo.includes("horizonte"));
  const q = "Há reinos além das montanhas?";
  t("sem a ficha, a pergunta rola; com o horizonte a responder, não rola", ehPerguntaAoMundo(q) === true && ehPerguntaAoMundo(q, { fichas: { horizonte: h } }) === false && ehPerguntaAoMundo(q, { fichas: () => ({ horizonte: h }) }) === false);
  t("e com o horizonte calado (masmorra, luta, continente), rola como antes", ehPerguntaAoMundo(q, { fichas: { horizonte: null } }) === true);
}

/* ============================================================ */
sec("7. o teto — 500 cenas com a ficha: a sala, os vetos, o desfecho e o \"como\"");
{
  const PAL = "agarro o lobo pelo cachaço rolo com ele no chão aperto a garganta com antebraço até pata quebrada parar de arranhar pedra giro por baixo da mordida quebro pescoço calcanhar estalo seco câmara inteira ouve desço lâmina pela nuca seguro antes de bater".split(" ");
  const texto = (r, min, max) => { const alvo = min + Math.floor(r() * (max - min + 1)); let s = ""; while (s.length < alvo) s += (s ? " " : "") + PAL[Math.floor(r() * PAL.length)]; return s.slice(0, alvo).trim(); };
  const um = (r, a) => a[Math.floor(r() * a.length)];
  const LUGARES = REG.flatMap((w) => masmorrasDoMundo(w.semente, w.mapa).slice(0, 3).map((m) => ({ w, m })));
  /* a pauta lá dentro como o App a monta (pautaDoTurno): o ONDE, a planta,
     a FICHA (o que esta etapa acrescenta), a economia (que cede), os
     vetos, a companheira, o resto ao acaso e, na luta, o golpe final */
  function cena(i, { luta, comFicha }) {
    const r = rng(hashSemente(`sem-cidade|teto|${luta ? "luta" : "sala"}|${i}`));
    const { w, m } = LUGARES[Math.floor(r() * LUGARES.length)];
    const mm = abrir(w, m);
    const onde0 = linhaDoLugar({ masmorra: mm, lugar: null, clima: "calor opressivo", mapa: w.mapa });
    let p = porNaPauta({}, "onde", onde0, texto(r, 15, 25), "comporta: " + texto(r, 110, 210));
    p = porNaPauta(p, "masmorra", masmorraParaPauta(mm, { luta }));
    if (comFicha) p = porNaPauta(p, "masmorra", S.linhaDaFicha(w.mapa, mm, { luta }));
    p = porNaPauta(p, "economia", texto(r, 200, 300));
    p = porNaPauta(p, "naoPode", ...Array.from({ length: 1 + Math.floor(r() * 3) }, () => texto(r, 80, 200)));
    p = porNaPauta(p, "gente", `Iracema Sousa ${texto(r, 30, 90)}`);
    if (r() < 0.5) p = porNaPauta(p, "aliado", `Iracema Sousa ${texto(r, 40, 110)}`);
    if (r() < 0.35) p = porNaPauta(p, "fala", texto(r, 60, 200));
    for (const [id, pr, min, max] of [["contra", luta ? 0.7 : 0, 50, 130], ["momento", 0.4, 60, 160], ["antes", 0.7, 100, 180], ["quem", 0.3, 30, 90], ["daqui", 0.3, 100, 180], ["mundo", 0.3, 100, 200], ["cidade", 0.3, 80, 150]]) if (r() < pr) p = porNaPauta(p, id, texto(r, min, max));
    let env = null;
    if (luta) {
      const escolha = r() < 0.4 ? "nao_letal" : "letal";
      const alvo = aplicarEscolha({ nome: um(r, ["Lobo", "Goblin", "Esqueleto", "Vorgath, o Carrasco das Sete Colinas"]), vida: 2 }, escolha, { semente: `sem-cidade|${i}` });
      env = envelopeDoGolpeFinal({ alvo, escolha, heroi: um(r, ["Tobias Varzim", "Iracema Sousa"]), comoFez: texto(r, 1, 300) });
      p = golpeFinalNaPauta(p, env);
    }
    p = cederNaCena(p, { luta, masmorra: true });
    return { p, env, onde0, ficha: S.linhaDaFicha(w.mapa, mm, { luta }), sec0: masmorraParaPauta(mm, { luta })[0] };
  }
  const N = 500;
  for (const luta of [false, true]) {
    const c = { lugar: 0, veto: 0, tirou: 0, teto: 0, como: 0, fato: 0, vetoDesfecho: 0, ficha: 0, sec0: 0, sec0Sem: 0, sec0Tirada: 0, igual: 0 };
    for (let i = 0; i < N; i++) {
      const com = cena(i, { luta, comFicha: true }), sem = cena(i, { luta, comFicha: false });
      const txt = textoDaPauta(com.p, { turno: i + 1 }), txtSem = textoDaPauta(sem.p, { turno: i + 1 });
      if (txt === txtSem) c.igual++;
      if (txt.includes(com.onde0)) c.lugar++;
      if (txt.includes(com.p.naoPode[0])) c.veto++;
      if (!(sem.p.naoPode || []).filter((v) => txtSem.includes(v)).every((v) => txt.includes(v))) c.tirou++;
      if (txt.length <= TETO_DA_PAUTA) c.teto++;
      if (com.ficha && txt.includes(com.ficha)) c.ficha++;
      if (com.sec0 && txt.includes(com.sec0)) c.sec0++;
      if (sem.sec0 && txtSem.includes(sem.sec0)) { c.sec0Sem++; if (!txt.includes(sem.sec0)) c.sec0Tirada++; }
      if (luta) {
        if (com.env.acabou[1] && txt.includes(com.env.acabou[1])) c.como++;
        if (com.env.acabou.filter((l) => !/nas palavras do jogador/.test(l)).every((l) => txt.includes(l))) c.fato++;
        if (com.env.naoPode.every((l) => txt.includes(l))) c.vetoDesfecho++;
      }
    }
    if (luta) {
      t(`na luta: a ficha não entra, e a pauta é a de antes byte a byte (${c.igual}/${N})`, c.igual === N);
      t(`na luta: o "como" do golpe final chega (${c.como}/${N}), todo fato (${c.fato}/${N}) e todo veto de quem caiu (${c.vetoDesfecho}/${N})`, c.como === N && c.fato === N && c.vetoDesfecho === N);
      t(`na luta: a 1.ª linha do ONDE (${c.lugar}/${N}) e o teto (${c.teto}/${N})`, c.lugar === N && c.teto === N);
    } else {
      t(`na sala: a 1.ª linha do ONDE nunca cai (${c.lugar}/${N})`, c.lugar === N);
      t(`na sala: o primeiro veto nunca cai (${c.veto}/${N})`, c.veto === N);
      t(`na sala: a ficha não tira veto nenhum — todo veto que chega sem ela chega com ela (${N - c.tirou}/${N})`, c.tirou === 0);
      /* não se pede 500/500 à 1.ª linha da planta: numa cena com três vetos
         longos, a fala e o que o espaço comporta, ela cede ao teto mesmo sem
         a ficha (teste-masmorra-na-pauta, secção 5, diz o mesmo). O que se
         pede é que a FICHA nunca seja a razão: chega com ela sempre que
         chegava sem ela. */
      t(`na sala: a ficha nunca tira a 1.ª linha da planta — chega com ela em ${c.sec0}/${N}, sem ela em ${c.sec0Sem}/${N}, tirada pela ficha ${c.sec0Tirada}`, c.sec0Tirada === 0 && c.sec0 === c.sec0Sem);
      t(`na sala: o teto nunca passa (${c.teto}/${N})`, c.teto === N);
      /* a ficha é a última linha da seção: é a primeira a ceder quando o
         teto aperta, e ninguém mais cede por ela */
      console.log(`      (a linha da ficha chega em ${c.ficha}/${N}; numa cena apertada é a primeira linha da seção a ceder)`);
    }
  }
}

/* ============================================================ */
sec("8. a fiação no App e no system (por texto)");
{
  const app = readFileSync(join(AQUI, "..", "src", "App.jsx"), "utf8");
  const pr = readFileSync(join(AQUI, "..", "src", "prompt.js"), "utf8");
  t("o App importa o módulo", /import \{[^}]*calaNaMasmorra[^}]*aquiDoTurno[^}]*cenaNaMasmorra[^}]*linhaDaFicha[^}]*horizonteDaPergunta[^}]*\} from "\.\/masmorra-sem-cidade\.js"/.test(app));
  t("o \"aqui\" do rodapé sai de aquiDoTurno, com a masmorra do ref, num try", /try \{\s*aqui = aquiDoTurno\(\{ forma, ondeEstou, comodos: comodosAqui, daqui: daquiTxt, formaDaCidade: shape, viagem: viag, ermo: ermoAqui, arredores: fora, saidas \}, masmorraRef\.current\);/.test(app));
  t("o resumoDaqui nem se calcula lá dentro", /calaNaMasmorra\("daqui", masmorraRef\.current\) \? "" : resumoDaqui\(/.test(app));
  t("a gente por conhecer cala lá dentro", /calaNaMasmorra\("povoar", masmorraRef\.current\)\) return \[\];/.test(app));
  t("o [ONDE ACORDO] da estrada cala lá dentro", /calaNaMasmorra\("acordo", masmorraRef\.current\)/.test(app) && /\(jornadaRef\.current && !acordoCala\)/.test(app));
  t("a cena do system passa por cenaNaMasmorra (num try que devolve a cena crua)", /try \{ return cenaNaMasmorra\(cena\); \} catch \(e\) \{ calou\("cenaNaMasmorra", e\); return cena; \}/.test(app));
  t("a ficha entra na seção MASMORRA da pauta, num try", /p = porNaPauta\(p, "masmorra", linhaDaFicha\(mapaRef\.current, masmorraRef\.current, \{ luta: !!combateRef\.current \}\)\);/.test(app));
  t("o horizonte é a quarta ficha da mesa (e o sinal do oráculo a lê)", /hz = horizonteDaPergunta\(frase, mapaRef\.current, \{ masmorra: masmorraRef\.current, luta: !!combateRef\.current \}\);/.test(app) && app.includes("return { cidade: fc, gente: gp, mercado: mc, horizonte: hz };") && app.includes("juntarRespostas([fc, gp, mc, hz])"));
  t("a porta do ermo, no system, não abre lá dentro", /\{ id: "ermo", quando: \(c\) => !c\.emMasmorra && \(!c\.emCidade \|\| !!c\.emViagem\)/.test(pr));
}

console.log(`\nmasmorra sem a cidade (MM17 C2): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
