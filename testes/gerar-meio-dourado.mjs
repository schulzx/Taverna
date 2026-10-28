/* gerar-meio-dourado.mjs (Fase T1-A, 3.ª fatia, 28/10/2026) — a fotografia de ANTES

   Não é suíte (o `npm test` não o corre): é a ferramenta que fez o
   `meio-dourado.json`, e fica para quem quiser refazer a prova. Lê o
   `aplicarResposta` do App de ANTES da mudança — `git show d776408:src/App.jsx`,
   o último commit em que o meio do turno morava inteiro no App —, recorta
   os quatro blocos que correm entre o `aplicar` e o registo (a dádiva
   pendente, o mapa, as missões, os sinais) e as closures que eles chamam
   (o lugar dito, a névoa, a devoção, a fama, a fé, o milagre, as dádivas, o
   marco no arco), e corre tudo em Node com os refs trocados por objetos
   simples e as funções dos módulos de verdade. Fotografa o estado depois de
   cada bloco (`dadivas`, `mapa`, `missoes`, `sinais`).

   O que é do App e não é regra vira um dublê declarado:
   - `sementeMundo`/`generoMundo`/`moldeMundo`/`mundoAtual` — o mundo do caso;
   - `sorteDoTurno` — um fio por evento, contado (`sorteDoCaso`);
   - `motorDoArco` — o do caso, lendo o evento global de AGORA;
   - `montarSystemPrompt` — guarda o que o prompt LEU no instante em que foi
     remontado (`retratoDoPrompt`), não o texto: o texto é de `prompt.js`;
   - os `setX` de tela guardam o que receberam; `salvar` guarda a ficha.

   E UMA troca no código de antes, declarada e contada: dentro de
   `ganharFe`, `personagem` (o do render) passa a ser a ficha do turno
   (`__fichaDoTurno()`). No App, o `aplicarResposta` é um `useCallback` com
   `[pushMsgs]` e nasce no primeiro render, quando `personagem` é `null` —
   e o `ganharFe` que ele fecha lia `personagem.nivel`: todo sinal "fe:" com
   o deus desperto derrubava o turno inteiro (TypeError). O motor lê a ficha
   do turno (o defeito está no diário de 28/10); fora disto, é o código de lá
   à letra. O `famaAtual` fica como era (o seu `personagem && …` cai no 1).

   Na 4.ª fatia (28/10), os defeitos que a 3.ª achou e reproduziu de
   propósito foram consertados no motor, cada um num commit; cada conserto
   entra aqui como uma troca declarada (`consertar`), com o porquê, e o
   commit diz quantos dos 275 casos mudaram com ela.

   uso: node testes/gerar-meio-dourado.mjs [commit]  */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { casosDoMeio, motorDoArcoDoCaso, sorteDoCaso, retratoDoPrompt, retratoDoMapa, retratoDoMeio, digital } from "./aplicar-casos.mjs";
import { semearACasa } from "../src/semente.js";
import { lerLugarDito, distanciaNaCidade, definirLugar, ehOMesmoLugar, textoDoLugar, comEm, ehAPropriaCidade } from "../src/lugar.js";
import { locaisDaCidade, masmorrasDoMundo } from "../src/mundo-base.js";
import { comodosDoLocal } from "../src/comodos.js";
import { arredoresDaCidade, arredorPorTexto } from "../src/arredores.js";
import { criarCidade, criarFaccao } from "../src/mapa.js";
import { garantirGeografia, descobrirCidade, pisarNaCidade, descobrirVizinhanca } from "../src/geografia.js";
import { garantirDevocao, fieisTotais, espalharFieis, depositarFieis, perderFieis } from "../src/devocao.js";
import { portaDaMasmorra } from "../src/rastro.js";
import { registrarMarco, virarEtapa, envelopeDeVirada } from "../src/historia.js";
import { sortearDadiva } from "../src/regras.js";
import { gerarDadivaUnica, envelopeDaUnica } from "../src/dadivas.js";
import { MAGNITUDE_FE, fieisPorFeito, caminhoPorId, grauDe, gdMaximoPorNivel, GRAUS, tituloDe, milagrePorId } from "../src/divindades.js";
import { podeAbrirRaid } from "../src/raids.js";
import { gerarLoot, RARIDADE_ROTULO } from "../src/loot.js";
import { empilhar, efeitoDeMilagre } from "../src/efeitos.js";
import { calcularFama } from "../src/fama.js";
import { dominiosDe } from "../src/gestao.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv[2] || "d776408";
const app = execSync(`git show ${COMMIT}:src/App.jsx`, { cwd: path.join(AQUI, ".."), maxBuffer: 1 << 28 }).toString().replace(/\r\n/g, "\n");
const corte = (de, ate) => {
  const i0 = app.indexOf(de);
  const i1 = app.indexOf(ate, i0 + de.length);
  if (i0 < 0 || i1 < 0) throw new Error("não está onde estava: " + de.slice(0, 60));
  if (app.indexOf(de, i0 + 1) >= 0) throw new Error("ambíguo: " + de.slice(0, 60));
  return app.slice(i0, i1);
};
const seg = {
  dadivas: corte("    if ((pers.dadivasPendentes || 0) > 0) pers = concederDadivas(pers, msgs);", "    /* MAPA E FACÇÕES: registra cidades"),
  mapa: corte("    /* MAPA E FACÇÕES: registra cidades", "    /* MISSÕES E ARCO: registra quests"),
  missoes: corte("    /* MISSÕES E ARCO: registra quests", "    /* SINAIS (v7.6)"),
  sinais: corte("    /* SINAIS (v7.6)", "    /* v9.152: aqui morava a compatibilidade"),
};
let ganharFe = corte("  const ganharFe = (fieis, pf, motivo, local) => {", "  /* MILAGRE (v7.6)");
const troca = (de, para) => {
  if (ganharFe.split(de).length !== 2) throw new Error("a troca declarada não bate uma vez: " + de);
  ganharFe = ganharFe.replace(de, para);
};
troca("gdMaximoPorNivel(personagem.nivel || 1)", "gdMaximoPorNivel(__fichaDoTurno().nivel || 1)");
troca("montarSystemPrompt(nomeCampanha, mundo, personagem,", "montarSystemPrompt(nomeCampanha, mundo, __fichaDoTurno(),");

/* OS CONSERTOS DA 4.ª FATIA (28/10), declarados um a um: cada um é o
   defeito que a fila de antes tinha, consertado no motor; o dourado faz a
   mesma troca no código de lá, e só ela — o resto é à letra. */
const consertar = (bloco, de, para) => {
  if (seg[bloco].split(de).length !== 2) throw new Error(`o conserto declarado não bate uma vez em ${bloco}: ` + de.slice(0, 60));
  seg[bloco] = seg[bloco].replace(de, para);
};
/* 1. o milagre e o achado do sinal caem na ficha do TURNO (`pers`), a que o
   App grava no fim — e não na do ref (o milagre) nem numa função
   atualizadora que o `setPersonagem(pers)` apagava (o achado) */
consertar("sinais", "invocarMilagre(arg.toLowerCase(), \"mestre\").forEach((m2) => msgs.push(m2.texto));",
  "{ const __ref = personagemRef.current; const __base = pers || __ref; personagemRef.current = __base; invocarMilagre(arg.toLowerCase(), \"mestre\").forEach((m2) => msgs.push(m2.texto)); if (personagemRef.current !== __base) { if (pers) pers = personagemRef.current; } else personagemRef.current = __ref; }");
consertar("sinais", "setPersonagem((p) => ({ ...p, equipamento: [...(p.equipamento || []), it] }));",
  "if (pers) pers = { ...pers, equipamento: [...(pers.equipamento || []), it] }; else if (personagemRef.current) { const __n = { ...personagemRef.current, equipamento: [...(personagemRef.current.equipamento || []), it] }; personagemRef.current = __n; setPersonagem(__n); salvar({ personagem: __n }); }");
/* 2. as cidades do Mestre entram no mapa ANTES do pé (logo antes de
   `cidade_atual`): a cópia do começo já não vira o mapa no fim, por cima da
   descoberta, da pisada e da névoa da cidade onde se chega; a devoção fica
   no fim, como estava */
consertar("mapa", "      if (md.cidade_atual) {", "      if (mudouMapa) { mp = garantirGeografia(mp, pers && pers.nome ? `taverna|${pers.nome}` : \"taverna\"); mapaRef.current = mp; setMapa(mp); }\n      if (md.cidade_atual) {");
consertar("mapa", "      if (mudouMapa) { mp = garantirGeografia(mp, pers && pers.nome ? `taverna|${pers.nome}` : \"taverna\"); mapaRef.current = mp; setMapa(mp); casarDevocaoComMapa(); }", "      if (mudouMapa) { casarDevocaoComMapa(); }");
const fechos = [
  corte("  const cidadeDoMapa = (nome) =>", "\n\n"),
  corte("  const cidadeSobOsPes = () => {", "  /* Todo lugar a que se pode ir daqui a pé"),
  corte("  const registrarLugar = (nome, fonte = \"mestre\") => {", "  /* ---------------- A NÉVOA AO REDOR (v9.51)"),
  corte("  const abrirNevoaDaVizinhanca = (nomeCidade, msgs) => {", "  /* ---------------- A VIAGEM TERMINA SOZINHA"),
  corte("  const casarDevocaoComMapa = () => {", "  /* CLIMA: rolado por tabela"),
  corte("  const famaAtual = () =>", "\n"),
  ganharFe,
  corte("  const invocarMilagre = (id, origem = \"jogador\") => {", "  /* DÁDIVA ÉPICA (v8.1)"),
  corte("  const concederDadivas = (pers, msgs) => {", "  /* Botão de milagre (v9.28)"),
  corte("  const marcarNoArco = (tipo, rotulo) => {", "  /* ---------------- MISSÕES (v9.27)"),
].join("\n");

/* `with`: o código de lá fala de `pers`, `msgs`, `resp` e dos refs como
   nomes soltos; aqui eles moram num objeto (o `S`), e `pers = …` grava nele */
const velho = new Function("S", "SNAP", `with (S) {
${fechos}
${seg.dadivas}
SNAP("dadivas");
${seg.mapa}
SNAP("mapa");
${seg.missoes}
SNAP("missoes");
${seg.sinais}
SNAP("sinais");
}`);

const MODULOS = {
  lerLugarDito, distanciaNaCidade, definirLugar, ehOMesmoLugar, textoDoLugar, comEm, ehAPropriaCidade, locaisDaCidade, masmorrasDoMundo,
  comodosDoLocal, arredoresDaCidade, arredorPorTexto, criarCidade, criarFaccao, garantirGeografia, descobrirCidade, pisarNaCidade,
  descobrirVizinhanca, garantirDevocao, fieisTotais, espalharFieis, depositarFieis, perderFieis, portaDaMasmorra, registrarMarco,
  virarEtapa, envelopeDeVirada, sortearDadiva, gerarDadivaUnica, envelopeDaUnica, MAGNITUDE_FE, fieisPorFeito, caminhoPorId, grauDe,
  gdMaximoPorNivel, GRAUS, tituloDe, milagrePorId, podeAbrirRaid, gerarLoot, RARIDADE_ROTULO, empilhar, efeitoDeMilagre, calcularFama, dominiosDe,
};

const fora = [];
const dourado = casosDoMeio().map((c) => {
  const k = JSON.parse(JSON.stringify(c));
  const e = k.estado;
  const ref = (v) => ({ current: v });
  const calou = [];
  const S = {
    ...MODULOS,
    resp: k.resp, pers: e.personagem, msgs: [],
    personagem: null, nomeCampanha: "c", mundo: null,
    personagemRef: ref(e.fichaDoRef), mapaRef: ref(e.mapa), cidadeAtualRef: ref(e.cidadeAtual), lugarRef: ref(e.lugar), jornadaRef: ref(e.jornada),
    faccaoJogadorRef: ref(e.faccaoJogador), devocaoRef: ref(e.devocao), divindadeRef: ref(e.divindade), combateRef: ref(e.combate),
    acampadoRef: ref(e.acampado), masmorraRef: ref(e.masmorra), raidRef: ref(e.raid), espinhaRef: ref(e.espinha), ultimoPedidoRef: ref(e.ultimoPedido),
    diaRef: ref(e.dia), eventosRef: ref(e.eventos), historiaRef: ref(e.historia), contRef: ref(e.contadores), questsRef: ref(e.quests),
    canoneRef: ref(e.canone), npcsRef: ref(e.npcs), bancoNomesRef: ref(null), nomeCampanhaRef: ref("c"), systemRef: ref(""), notaRef: ref(k.notaAntes),
    sinalViagemRef: ref(null), sinalMasmorraRef: ref(null), sinalRaidRef: ref(null),
    sementeMundo: () => k.ctx.mundo.semente, generoMundo: () => k.ctx.mundo.genero, moldeMundo: () => k.ctx.mundo.molde, mundoAtual: () => ({ lexico: k.ctx.mundo.lex }),
    sorteDoTurno: sorteDoCaso(k.semente),
    motorDoArco: () => motorDoArcoDoCaso(k.ctx.arco, S.eventosRef.current),
    __fichaDoTurno: () => S.pers,
    resumoMapaParaPrompt: () => "", resumoDiplomacia: () => "", resumoDoArco: () => "", resumoQuests: () => "", resumoNPCsParaPrompt: () => "",
    tempoInfoPrompt: () => "", infoDivindade: () => "", infoTitulo: () => "", cenaDoPrompt: () => null,
    remontagens: [],
    montarSystemPrompt: (nome, mundo, personagem) => {
      S.remontagens.push(retratoDoPrompt({ personagem, canone: S.canoneRef.current, mapa: S.mapaRef.current, faccao: S.faccaoJogadorRef.current, historia: S.historiaRef.current, eventos: S.eventosRef.current, quests: S.questsRef.current, npcs: S.npcsRef.current, divindade: S.divindadeRef.current, lugar: S.lugarRef.current, cidade: S.cidadeAtualRef.current, jornada: S.jornadaRef.current }));
      return "PROMPT";
    },
    fichaDoReact: e.fichaDoReact, espolio: null, lugarNovo: null, chegada: null, salvos: [], questsVistas: 0,
    setMapa: () => {}, setLugar: () => {}, setJornada: () => {}, setDevocao: () => {}, setDivindade: () => {}, setEventos: () => {}, setCombate: () => {},
    setQuests: () => { S.questsVistas++; },
    setPersonagem: (x) => { S.fichaDoReact = typeof x === "function" ? x(S.fichaDoReact) : x; },
    setEspolioRevelado: (x) => { S.espolio = x; },
    setLugarNovo: (x) => { S.lugarNovo = x; },
    /* a chave da faixa é `Date.now()`: o instante não é estado do jogo */
    setChegada: (x) => { const { chave, ...resto } = x || {}; S.chegada = resto; },
    salvar: (o) => { S.salvos.push(digital(JSON.stringify(o))); },
    calou: (onde) => { calou.push(onde); fora.push(onde); },
  };
  const fotos = {};
  const SNAP = (nome) => {
    const r = {
      pers: S.pers, fichaDoRef: S.personagemRef.current, fichaDoReact: S.fichaDoReact, mapa: S.mapaRef.current, cidadeAtual: S.cidadeAtualRef.current,
      lugar: S.lugarRef.current, jornada: S.jornadaRef.current, faccaoJogador: S.faccaoJogadorRef.current, devocao: S.devocaoRef.current,
      divindade: S.divindadeRef.current, eventos: S.eventosRef.current, historia: S.historiaRef.current, combate: S.combateRef.current,
      sinalViagem: S.sinalViagemRef.current, sinalMasmorra: S.sinalMasmorraRef.current, sinalRaid: S.sinalRaidRef.current, espolio: S.espolio,
      lugarNovo: S.lugarNovo, chegada: S.chegada, salvos: S.salvos, remontagens: S.remontagens, questsVistas: S.questsVistas,
    };
    fotos[nome] = { digital: digital(retratoDoMeio(r)), mapa: digital(retratoDoMapa(r)), msgs: [...S.msgs], nota: S.notaRef.current, calou: [...calou] };
  };
  semearACasa(c.semente);
  velho(S, SNAP);
  return { id: c.id, fotos };
});
const saida = { origem: `o aplicarResposta de ${COMMIT} (a dádiva, o mapa, as missões e os sinais, com as closures que chamam), sobre aplicar-casos.mjs#casosDoMeio`, calou: fora.length, ondeCalou: [...new Set(fora)], casos: dourado };
fs.writeFileSync(path.join(AQUI, "meio-dourado.json"), JSON.stringify(saida));
const D = dourado.map((x) => x.fotos.sinais);
console.log(`dourado do meio: ${dourado.length} casos, ${fora.length} calou (${[...new Set(fora)].join(", ")})`);
const conta = (rx) => D.filter((x) => rx.test(x.msgs.join("\n") + "\n" + x.nota)).length;
console.log(`  percorre: lugar ${conta(/📍/)}, mapa ${conta(/🗺/)}, chegada ${conta(/Chegada/)}, global ${conta(/🌍/)}, fé ${conta(/fiéis/)}, milagre ${conta(/MILAGRE/)}, ⛔ ${conta(/⛔/)}, viagem ${conta(/A caminho|Pé na estrada/)}, masmorra recusada ${conta(/MASMORRA — RECUSADA/)}, raid ${conta(/⚑/)}, ascensão ${conta(/ASCENSÃO/)}, achado ${conta(/Achado/)}, domínio ${conta(/Domínio revelado/)}, patrono ${conta(/Patrono/)}, dádiva ${conta(/DÁDIVA/)}, lugar recusado ${conta(/LUGAR — RECUSADO/)}, virada ${D.filter((x) => x.nota.split("\n").length > 0 && /\[/.test(x.nota)).length}`);
console.log(`  remontagens: ${dourado.filter((x) => x.fotos.sinais && x.fotos.sinais.digital).length} casos; cerimónias: ${dourado.length}`);
