/* gerar-turno-dourado.mjs (Fase T1-A, 3.ª fatia, 28/10/2026) — o turno de ANTES da fusão

   Não é suíte (o `npm test` não o corre): é a ferramenta que fez o
   `turno-dourado.json`. Antes da fusão (48579a9), o `aplicarResposta`
   corria as peças do motor em FILA, com os efeitos de cada uma aplicados
   nos refs antes da seguinte: o `aplicar`, a dádiva, o mapa, as missões,
   os sinais, o registo. A fusão (`aplicarOTurno`) passa o estado de peça
   em peça DENTRO do motor e aplica os efeitos uma vez só, no fim — e o
   risco dela é exatamente a cola: uma peça a ler um ref que a anterior
   ainda não escreveu. Esta fotografia é a da fila.

   Lê do git o App de 48579a9 — o trecho do `aplicarResposta` do começo até
   o `setPersonagem(pers)` antes do combate, o `aplicarOsEfeitos` e o
   `concederDadivas` — e os módulos do motor do MESMO commit (copiados para
   src/motor/ com nome de rascunho, importados e apagados), e corre tudo em
   Node com os refs trocados por objetos simples. Os dublês são os do
   `gerar-meio-dourado.mjs` (o mundo, a sorte, o motor do arco, o prompt que
   guarda o que leu), mais a base do nome e o mundo da base, que leem os
   refs de AGORA (`baseDoNomeDoCaso`).

   uso: node testes/gerar-turno-dourado.mjs [commit]  */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { casosDoTurno, motorDoArcoDoCaso, sorteDoCaso, retratoDoPrompt, retratoDoTurno, baseDoNomeDoCaso, digital } from "./aplicar-casos.mjs";
import { semearACasa } from "../src/semente.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");
const COMMIT = process.argv[2] || "48579a9";
const doGit = (f) => execSync(`git show ${COMMIT}:${f}`, { cwd: RAIZ, maxBuffer: 1 << 28 }).toString().replace(/\r\n/g, "\n");
const app = doGit("src/App.jsx");
const corte = (de, ate) => {
  const i0 = app.indexOf(de);
  const i1 = app.indexOf(ate, i0 + de.length);
  if (i0 < 0 || i1 < 0) throw new Error("não está onde estava: " + de.slice(0, 60));
  return app.slice(i0, i1);
};
const turno = corte("    const op = opts && typeof opts === \"object\" ? opts : {};", "    setPersonagem(pers);\n    /* combate: processa de forma síncrona");
const fechos = [
  corte("  const aplicarOsEfeitos = (saida) => {", "  const aplicarResposta = useCallback"),
  corte("  const concederDadivas = (pers, msgs) => {", "  /* Botão de milagre (v9.28)"),
].join("\n");

/* OS CONSERTOS DA 4.ª FATIA (28/10), declarados um a um: cada um é um
   defeito que a fila de antes tinha (achado e reproduzido de propósito na
   3.ª fatia), consertado no motor de hoje; o dourado faz a MESMA troca no
   código de lá — no App ou no motor do mesmo commit —, e só ela. O commit
   de cada um diz quantos dos 275 casos mudaram com ela. */
const texto = { App: null, aplicar: doGit("src/motor/aplicar.js"), "meio-do-turno": doGit("src/motor/meio-do-turno.js") };
let turnoTrocado = turno;
const consertar = (onde, de, para) => {
  const alvo = onde === "App" ? turnoTrocado : texto[onde];
  if (alvo.split(de).length !== 2) throw new Error(`o conserto declarado não bate uma vez em ${onde}: ` + de.slice(0, 60));
  if (onde === "App") turnoTrocado = alvo.replace(de, para); else texto[onde] = alvo.replace(de, para);
};
/* 1. o milagre e o achado do sinal caem na ficha do TURNO, a que o App
   grava no fim (`setPersonagem(pers)`), e o App lê-a de volta dos sinais */
consertar("meio-do-turno", "  const pers = e0.personagem;\n  const mapa = e0.mapa;\n  let fichaDoRef = e0.fichaDoRef, divindade", "  let pers = e0.personagem;\n  const mapa = e0.mapa;\n  let fichaDoRef = e0.fichaDoRef, divindade");
consertar("meio-do-turno", "        const r = milagreInvocado({ ...daFe(), fichaDoRef, combate, fama }, arg.toLowerCase(), \"mestre\");\n        divindade = r.divindade; devocao = r.devocao; fichaDoRef = r.ficha; combate = r.combate;",
  "        const base = pers || fichaDoRef;\n        const r = milagreInvocado({ ...daFe(), fichaDoRef: base, combate, fama }, arg.toLowerCase(), \"mestre\");\n        divindade = r.divindade; devocao = r.devocao; combate = r.combate;\n        if (r.ficha !== base) { fichaDoRef = r.ficha; if (pers) pers = r.ficha; }");
consertar("meio-do-turno", "        ef({ tipo: \"loot\", item: it });",
  "        if (pers) pers = { ...pers, equipamento: [...(pers.equipamento || []), it] };\n        else if (fichaDoRef) { fichaDoRef = { ...fichaDoRef, equipamento: [...(fichaDoRef.equipamento || []), it] }; ef({ tipo: \"ficha\", personagem: fichaDoRef }); }");
consertar("meio-do-turno", "  return { estado: { ...e0, fichaDoRef, divindade, devocao, combate }, efeitos: efeitosDoTurno, paraOCronista: notas, msgs };",
  "  return { estado: { ...e0, personagem: pers, fichaDoRef, divindade, devocao, combate }, efeitos: efeitosDoTurno, paraOCronista: notas, msgs };");
consertar("App", "      msgs.push(...dosSinais.msgs);\n      aplicarOsEfeitos(dosSinais);", "      msgs.push(...dosSinais.msgs);\n      aplicarOsEfeitos(dosSinais);\n      pers = dosSinais.estado.personagem;");

/* o motor do mesmo commit, ao lado do de hoje, com nome de rascunho */
const rascunho = {};
for (const nome of ["aplicar", "meio-do-turno"]) {
  const f = path.join(RAIZ, "src", "motor", `__dourado-${nome}.js`);
  fs.writeFileSync(f, texto[nome]);
  rascunho[nome] = f;
}
let MOTOR;
try {
  const a = await import(pathToFileURL(rascunho.aplicar).href);
  const m = await import(pathToFileURL(rascunho["meio-do-turno"]).href);
  MOTOR = { ...a, ...m };
} finally {
  for (const f of Object.values(rascunho)) fs.rmSync(f, { force: true });
}

const velho = new Function("S", "opts", `with (S) {
${fechos}
${turnoTrocado}
__fim(pers, msgs);
}`);

const fora = [];
const dourado = casosDoTurno().map((c) => {
  const k = JSON.parse(JSON.stringify(c));
  const e = k.estado;
  const ref = (v) => ({ current: v });
  const S = {
    ...MOTOR,
    resp: k.resp, persAtual: e.personagem, personagem: null, nomeCampanha: "c", mundo: null,
    personagemRef: ref(e.fichaDoRef), mapaRef: ref(e.mapa), cidadeAtualRef: ref(e.cidadeAtual), lugarRef: ref(e.lugar), jornadaRef: ref(e.jornada),
    faccaoJogadorRef: ref(e.faccaoJogador), devocaoRef: ref(e.devocao), divindadeRef: ref(e.divindade), combateRef: ref(e.combate),
    acampadoRef: ref(e.acampado), masmorraRef: ref(e.masmorra), raidRef: ref(e.raid), espinhaRef: ref(e.espinha), ultimoPedidoRef: ref(e.ultimoPedido),
    diaRef: ref(e.dia), eventosRef: ref(e.eventos), historiaRef: ref(e.historia), contRef: ref(e.contadores), questsRef: ref(e.quests),
    canoneRef: ref(e.canone), npcsRef: ref(e.npcs), npcTurnoRef: ref(e.npcTurno), aberturaMundoRef: ref(e.abertura), missoesRef: ref(e.missoes),
    danoJaAplicadoRef: ref(e.danoJaAplicado), habUsadaRef: ref(e.habUsada), ultimoDesfechoRef: ref(e.ultimoDesfecho), texturaRef: ref({}),
    bancoNomesRef: ref(null), nomeCampanhaRef: ref("c"), systemRef: ref(""), notaRef: ref(k.notaAntes),
    sinalViagemRef: ref(null), sinalMasmorraRef: ref(null), sinalRaidRef: ref(null),
    mundoAtual: () => ({ lexico: k.ctx.mundo.lex }),
    mundoDaBase: () => ({ ...k.ctx.mundo, mapa: S.mapaRef.current }),
    baseDoNome: () => baseDoNomeDoCaso({ mapa: S.mapaRef.current, cidadeAtual: S.cidadeAtualRef.current, lugar: S.lugarRef.current, ficha: S.personagemRef.current }),
    sorteDoTurno: sorteDoCaso(k.semente),
    motorDoArco: (sobre = {}) => motorDoArcoDoCaso(k.ctx.arco, "eventos" in sobre ? sobre.eventos : S.eventosRef.current),
    famaAtual: () => 0,
    resumoMapaParaPrompt: () => "", resumoDiplomacia: () => "", resumoDoArco: () => "", resumoQuests: () => "", resumoNPCsParaPrompt: () => "",
    tempoInfoPrompt: () => "", infoDivindade: () => "", infoTitulo: () => "", cenaDoPrompt: () => null,
    remontagens: [],
    montarSystemPrompt: (nome, mundo, personagem) => {
      S.remontagens.push(retratoDoPrompt({ personagem, canone: S.canoneRef.current, mapa: S.mapaRef.current, faccao: S.faccaoJogadorRef.current, historia: S.historiaRef.current, eventos: S.eventosRef.current, quests: S.questsRef.current, npcs: S.npcsRef.current, divindade: S.divindadeRef.current, lugar: S.lugarRef.current, cidade: S.cidadeAtualRef.current, jornada: S.jornadaRef.current }));
      return "PROMPT";
    },
    fichaDoReact: e.fichaDoReact, espolio: null, lugarNovo: null, chegada: null, salvos: [], questsVistas: 0,
    setMapa: () => {}, setLugar: () => {}, setJornada: () => {}, setDevocao: () => {}, setDivindade: () => {}, setEventos: () => {}, setCombate: () => {}, setNpcs: () => {},
    setQuests: () => { S.questsVistas++; },
    setPersonagem: (x) => { S.fichaDoReact = typeof x === "function" ? x(S.fichaDoReact) : x; },
    setEspolioRevelado: (x) => { S.espolio = x; },
    setLugarNovo: (x) => { S.lugarNovo = x; },
    setChegada: (x) => { const { chave, ...resto } = x || {}; S.chegada = resto; },
    salvar: (o) => { S.salvos.push(digital(JSON.stringify(o))); },
    calou: (onde) => { fora.push(onde); },
  };
  semearACasa(c.semente);
  /* o trecho termina antes do `setPersonagem(pers)`: o `pers` e as
     `msgs` dele são locais, e saem por `__fim`; sem ficha, ele volta antes */
  let fim = null;
  S.__fim = (pers, msgs) => { fim = { pers, msgs }; };
  velho(S, k.ctx);
  const r = {
    pers: fim && fim.pers, fichaDoRef: S.personagemRef.current, fichaDoReact: S.fichaDoReact, mapa: S.mapaRef.current, cidadeAtual: S.cidadeAtualRef.current,
    lugar: S.lugarRef.current, jornada: S.jornadaRef.current, faccaoJogador: S.faccaoJogadorRef.current, devocao: S.devocaoRef.current,
    divindade: S.divindadeRef.current, eventos: S.eventosRef.current, historia: S.historiaRef.current, combate: S.combateRef.current,
    sinalViagem: S.sinalViagemRef.current, sinalMasmorra: S.sinalMasmorraRef.current, sinalRaid: S.sinalRaidRef.current, espolio: S.espolio,
    lugarNovo: S.lugarNovo, chegada: S.chegada, salvos: S.salvos, remontagens: S.remontagens, questsVistas: S.questsVistas,
    canone: S.canoneRef.current, npcs: S.npcsRef.current, npcTurno: S.npcTurnoRef.current,
    danoJaAplicado: S.danoJaAplicadoRef.current, habUsada: S.habUsadaRef.current, textura: S.texturaRef.current, resp: S.resp,
  };
  return { id: c.id, digital: digital(retratoDoTurno(r)), msgs: fim ? fim.msgs : [], nota: S.notaRef.current, semFicha: !fim };
});
const saida = { origem: `o aplicarResposta de ${COMMIT}, do começo ao registo, com o motor do mesmo commit, sobre aplicar-casos.mjs#casosDoTurno`, calou: fora.length, ondeCalou: [...new Set(fora)], casos: dourado };
fs.writeFileSync(path.join(AQUI, "turno-dourado.json"), JSON.stringify(saida));
console.log(`dourado do turno: ${dourado.length} casos, ${fora.length} calou (${[...new Set(fora)].join(", ")}), remontagens em ${dourado.length} casos`);
