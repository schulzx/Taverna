/* gerar-fim-dourado.mjs (Fase T1-A, 4.ª fatia, 28/10/2026) — o fim do turno de ANTES

   Não é suíte (o `npm test` não o corre): é a ferramenta que fez o
   `fim-dourado.json`. Lê o `aplicarResposta` do App de ANTES da mudança —
   `git show 702cedf:src/App.jsx`, o último commit em que o códex, a chegada
   e o portão moravam no componente —, recorta os três blocos (e o
   `registrarRevelacao` que o códex chama), e corre-os em Node com os refs
   trocados por objetos simples e as funções dos módulos de verdade.
   Fotografa o estado depois de cada bloco (`codex`, `chegada`, `portao`).

   O que é do App e não é regra vira um dublê declarado:
   - `sementeMundo`/`generoMundo`/`moldeMundo`/`mundoAtual` — o mundo do caso;
   - `avancarMinutos` — o relógio do mundo é um órgão do App (os dias do
     reino, os festivais, a invocação que expira): o dublê guarda quanto lhe
     pediram e devolve uma linha só quando a travessia passa de dez horas;
   - os `setX` de tela não fazem nada (os refs são a verdade).

   E nenhuma troca: é o código de lá à letra.

   uso: node testes/gerar-fim-dourado.mjs [commit]  */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { casosDoFim, retratoDoFim, digital } from "./aplicar-casos.mjs";
import { semearACasa } from "../src/semente.js";
import { mencionadosNaCena, idDoLocal, idDaGente, revelar as revelarNaBase } from "../src/mundo-base.js";
import { aindaSoUmNome } from "../src/abertura.js";
import { criarNPC } from "../src/npcs.js";
import { nomesAMaoNaProsa } from "../src/nomes.js";
import { grauDe } from "../src/divindades.js";
import { presencaDoHeroi } from "../src/presenca-divina.js";
import { detectarChegada, descobrirCidade, notaDaChegada } from "../src/geografia.js";
import { violacoesDoTurno } from "../src/portao.js";
import { elencoDaCena } from "../src/cena.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv[2] || "702cedf";
const app = execSync(`git show ${COMMIT}:src/App.jsx`, { cwd: path.join(AQUI, ".."), maxBuffer: 1 << 28 }).toString().replace(/\r\n/g, "\n");
const corte = (de, ate) => {
  const i0 = app.indexOf(de);
  const i1 = app.indexOf(ate, i0 + de.length);
  if (i0 < 0 || i1 < 0) throw new Error("não está onde estava: " + de.slice(0, 60));
  if (app.indexOf(de, i0 + 1) >= 0) throw new Error("ambíguo: " + de.slice(0, 60));
  return app.slice(i0, i1);
};
const seg = {
  codex: corte("    /* ---- DA BASE PARA O CÂNONE (v9.14) ----", "    /* ---- CHEGUEI E NINGUÉM ANOTOU (v9.43) ----"),
  chegada: corte("    /* ---- CHEGUEI E NINGUÉM ANOTOU (v9.43) ----", "    /* ---- O PORTÃO (v9.12) ----"),
  portao: corte("    /* ---- O PORTÃO (v9.12) ----", "    /* detector de repetição"),
};
const fechos = corte("  const registrarRevelacao = (ids) => {", "  const [devocao, setDevocao]");

const velho = new Function("S", "SNAP", `with (S) {
${fechos}
SNAP("antes");
${seg.codex}
SNAP("codex");
${seg.chegada}
SNAP("chegada");
${seg.portao}
SNAP("portao");
}`);

const MODULOS = { mencionadosNaCena, idDoLocal, idDaGente, revelarNaBase, aindaSoUmNome, criarNPC, nomesAMaoNaProsa, grauDe, presencaDoHeroi, detectarChegada, descobrirCidade, notaDaChegada, violacoesDoTurno, elencoDaCena };

const fora = [];
const dourado = casosDoFim().map((c) => {
  const k = JSON.parse(JSON.stringify(c));
  const e = k.estado;
  const ref = (v) => ({ current: v });
  const calou = [];
  const S = {
    ...MODULOS,
    resp: k.resp, pers: e.personagem, msgs: [],
    personagemRef: ref(e.fichaDoRef), mapaRef: ref(e.mapa), cidadeAtualRef: ref(e.cidadeAtual), baseMundoRef: ref(e.base), aberturaMundoRef: ref(e.abertura),
    lugarRef: ref(e.lugar), missoesRef: ref(e.missoes), npcsRef: ref(e.npcs), npcTurnoRef: ref(e.npcTurno), diaRef: ref(e.dia), nomesOferecidosRef: ref(e.oferecidos),
    divindadeRef: ref(e.divindade), combateRef: ref(e.combate), jornadaRef: ref(e.jornada), notaRef: ref(k.notaAntes), portaoCtxRef: ref(null), portaoRef: ref(null),
    confidenciasRef: ref(e.confidencias), nemesisRef: ref(e.nemesis), ultimoPedidoRef: ref(e.ultimoPedido),
    sementeMundo: () => k.ctx.mundo.semente, generoMundo: () => k.ctx.mundo.genero, moldeMundo: () => k.ctx.mundo.molde, mundoAtual: () => ({ lexico: k.ctx.mundo.lex }),
    minutos: [],
    avancarMinutos: (n) => { S.minutos.push(n); return n >= 600 ? `⏳ a travessia levou ${n} minutos` : ""; },
    setBaseMundo: () => {}, setNpcs: () => {}, setLugar: () => {}, setMapa: () => {},
    calou: (onde) => { calou.push(onde); fora.push(onde); },
  };
  const fotos = {};
  const SNAP = (nome) => {
    const r = {
      base: S.baseMundoRef.current, npcs: S.npcsRef.current, cidadeAtual: S.cidadeAtualRef.current, lugar: S.lugarRef.current, mapa: S.mapaRef.current,
      minutos: [...S.minutos], portaoCtx: S.portaoCtxRef.current, portao: S.portaoRef.current,
    };
    fotos[nome] = { digital: digital(retratoDoFim(r)), msgs: [...S.msgs], nota: S.notaRef.current, calou: [...calou], violacoes: (S.portaoRef.current || []).length };
  };
  semearACasa(c.semente);
  velho(S, SNAP);
  return { id: c.id, fotos };
});
const saida = { origem: `o aplicarResposta de ${COMMIT} (o códex, a chegada e o portão, com o registrarRevelacao), sobre aplicar-casos.mjs#casosDoFim`, calou: fora.length, ondeCalou: [...new Set(fora)], casos: dourado };
fs.writeFileSync(path.join(AQUI, "fim-dourado.json"), JSON.stringify(saida));
const D = dourado.map((x) => x.fotos.portao);
const conta = (rx) => D.filter((x) => rx.test(x.msgs.join("\n") + "\n" + x.nota)).length;
const mudou = (de, para) => dourado.filter((x) => x.fotos[de].digital !== x.fotos[para].digital).length;
console.log(`dourado do fim: ${dourado.length} casos, ${fora.length} calou (${[...new Set(fora)].join(", ")})`);
console.log(`  percorre: presença ${conta(/PRESENÇA/)}, chegada ${conta(/🧭 Você está em/)}, o portão que acha ${D.filter((x) => x.violacoes > 0).length}`);
console.log(`  as fotos que mudam: o códex mexe em ${mudou("antes", "codex")}, a chegada em ${mudou("codex", "chegada")}, o portão em ${mudou("chegada", "portao")}`);
