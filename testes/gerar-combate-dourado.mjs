/* gerar-combate-dourado.mjs (Fase T1-A, 5.ª fatia, 28/10/2026) — os órgãos do combate de ANTES

   Não é suíte (o `npm test` não o corre): é a ferramenta que faz o
   `combate-dourado.json`. Lê o App de ANTES de os órgãos do combate se
   tornarem puros — `git show 7338870:src/App.jsx`, o último commit em que
   todos moravam inteiros no componente —, recorta cada órgão à letra e
   corre-o em Node sobre os casos de `combate-casos.mjs`, com os refs
   trocados por objetos simples e as funções dos módulos de verdade.
   Fotografa o que o órgão devolveu e o que escreveu (a ficha, as linhas,
   a nota).

   O que é do App e não é regra vira um dublê declarado, órgão a órgão,
   na tabela ORGAOS abaixo. Nenhuma troca no texto: é o código de lá.

   uso: node testes/gerar-combate-dourado.mjs [commit]  */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { casosDoCombate, sorteDoCaso, mundoDaLei } from "./combate-casos.mjs";
import { agravarParaMorte } from "../src/crime.js";
import { gerarHabilidadeUnica, chanceUnica } from "../src/unicas.js";
import { patamarFama } from "../src/fama.js";
import { recompensaChefe } from "../src/masmorras.js";
import { essenciaDoChefe, RARIDADE_ROTULO } from "../src/loot.js";
import { garantirSuprimentos } from "../src/ermos.js";
import { concluirLugar } from "../src/mundo-base.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv[2] || "7338870";
const app = execSync(`git show ${COMMIT}:src/App.jsx`, { cwd: path.join(AQUI, ".."), maxBuffer: 1 << 28 }).toString().replace(/\r\n/g, "\n");
const corte = (de, ate) => {
  const i0 = app.indexOf(de);
  const i1 = app.indexOf(ate, i0 + de.length);
  if (i0 < 0 || i1 < 0) throw new Error("não está onde estava: " + de.slice(0, 60));
  if (app.indexOf(de, i0 + 1) >= 0) throw new Error("ambíguo: " + de.slice(0, 60));
  return app.slice(i0, i1);
};
const ref = (v) => ({ current: v });
const copia = (x) => JSON.parse(JSON.stringify(x));

/* cada órgão: o recorte, os dublês e a foto */
const ORGAOS = {
  /* talvezDespertarUnica: lê a sorte do turno e escreve na nota e nas linhas */
  talvezDespertarUnica: {
    texto: () => corte("  const talvezDespertarUnica = (p2, inimigosFinais, msgs) => {", "  /* REDE DE SEGURANÇA (v9.5.1)"),
    correr: (fn, k) => {
      const S = { chanceUnica, gerarHabilidadeUnica, sorteDoTurno: sorteDoCaso(k), notaRef: ref(k.notaAntes) };
      const f = fn(S);
      const msgs = [];
      const pers = f(copia(k.pers), copia(k.inimigosFinais), msgs);
      return { pers, msgs, nota: S.notaRef.current };
    },
    nome: "talvezDespertarUnica",
  },
  /* checarFama: lê famaAtual() e a última checagem; escreve na tela (pushMsgs), na nota e no ref */
  checarFama: {
    texto: () => corte("  const checarFama = () => {", "  /* NÊMESIS (v6.8)"),
    correr: (fn, k) => {
      const tela = [];
      const S = { patamarFama, famaAtual: () => k.fama, famaPatamarRef: ref(k.famaAntes), pushMsgs: (xs) => tela.push(...xs), notaRef: ref(k.notaAntes) };
      const ret = fn(S)();
      return { ret, tela, nota: S.notaRef.current, ultima: S.famaPatamarRef.current };
    },
    nome: "checarFama",
  },
  /* concluirMasmorraDoChefe: lê a masmorra, o mapa, a base e a sorte; escreve
     nos refs (a masmorra, a base, a sala em curso), num contador e na sessão */
  concluirMasmorraDoChefe: {
    texto: () => corte("  const concluirMasmorraDoChefe = (p2, msgs) => {", "  /* ---------------- O CUSTO DE QUEM SAI"),
    correr: (fn, k) => {
      const contadores = [], sessao = [], calados = [];
      const S = {
        recompensaChefe, essenciaDoChefe, RARIDADE_ROTULO, garantirSuprimentos, concluirLugar,
        masmorraRef: ref(copia(k.masmorra)), mapaRef: ref(copia(k.mapa)), baseMundoRef: ref(copia(k.base)), salaEmCursoRef: ref("sala em curso"),
        setMasmorra: () => {}, setBaseMundo: () => {}, mundoAtual: () => ({ lexico: k.lexico }), sorteDoTurno: sorteDoCaso(k),
        bumpCont: (...a) => contadores.push(a), talvezFecharSessao: (x) => sessao.push(x), calou: (onde) => calados.push(onde),
      };
      const msgs = [];
      const ret = fn(S)(copia({ ...k.pers, equipamento: k.equipamento, suprimentos: k.suprimentos, essencia: k.essencia }), msgs);
      return { ret, msgs, masmorra: S.masmorraRef.current, base: S.baseMundoRef.current, salaEmCurso: S.salaEmCursoRef.current, contadores, sessao, calados };
    },
    nome: "concluirMasmorraDoChefe",
  },
  /* registrarMorteDeAlvo: lê a lei, o registo, a nêmesis e o mundo; escreve
     na lei, no registo, e encerra a nêmesis pelo órgão dela (o dublê conta) */
  registrarMorteDeAlvo: {
    texto: () => corte("  const registrarMorteDeAlvo = (nome, causa, { aproximado = false } = {}) => {", "  /* ---------------- A MORTE DA NÊMESIS TEM UMA PORTA SÓ"),
    correr: (fn, k) => {
      const encerradas = [], calados = [];
      const w = mundoDaLei(k);
      const S = {
        agravarParaMorte, leiRef: ref(copia(k.leiM)), npcsRef: ref(copia(k.npcsM)), nemesisRef: ref(copia(k.nemesisM)), diaRef: ref(w.dia),
        mapaRef: ref(copia(k.mapaM)), cidadeAtualRef: ref(k.cidadeM), sementeMundo: () => w.semente, mundoAtual: () => ({ lexico: null }),
        generoMundo: () => w.genero, moldeMundo: () => w.molde, cidadeDoMapa: (nome) => (k.mapaM.cidades || []).find((c) => c.nome === nome) || null,
        setNpcs: () => {}, encerrarNemesis: (c) => encerradas.push(c), calou: (onde) => calados.push(onde),
      };
      const ret = fn(S)(k.alvoM, k.causaM, { aproximado: k.aproximadoM });
      return { ret, lei: S.leiRef.current, npcs: S.npcsRef.current, encerradas, calados };
    },
    nome: "registrarMorteDeAlvo",
  },
};

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const casos = casosDoCombate();
  const out = { commit: COMMIT, casos: casos.length, orgaos: {} };
  for (const [nome, o] of Object.entries(ORGAOS)) {
    const fonte = o.texto();
    const fn = (S) => new Function("S", `with (S) {\n${fonte}\nreturn ${o.nome};\n}`)(S);
    out.orgaos[nome] = casos.map((k) => o.correr(fn, k));
  }
  fs.writeFileSync(path.join(AQUI, "combate-dourado.json"), JSON.stringify(out));
  for (const [nome, fotos] of Object.entries(out.orgaos)) console.log(`${nome}: ${fotos.length} fotos`);
}
