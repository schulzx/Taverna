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
import { casosDoCombate, sorteDoCaso } from "./combate-casos.mjs";
import { gerarHabilidadeUnica, chanceUnica } from "../src/unicas.js";
import { patamarFama } from "../src/fama.js";

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
