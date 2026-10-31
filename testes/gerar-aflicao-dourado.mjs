/* gerar-aflicao-dourado.mjs (31/10/2026, a 13.ª sessão) — o recorte à letra da aflição dos golpes

   Lê o App de um commit (pelo git, sem tocar na árvore) e recorta, por
   âncora que tem de bater UMA vez só, `aplicarCondicoesDosGolpes` inteira —
   a aflição que os golpes do inimigo deixam no herói, como era antes de
   ganhar peça em src/motor/golpe-no-corpo.js#aAflicaoDosGolpes.

   Grava-a em `aflicao-dourado.json` com o commit. A suíte
   (`teste-motor-aflicao-dos-golpes`) compila o recorte com as dependências
   reais e o corre lado a lado com a peça, sobre casos por semente, e
   morde-o para provar que a comparação vê a diferença. O recorte é dado
   congelado: o texto de lá já saiu do App, e a prova fica.

   Uso: node gerar-aflicao-dourado.mjs [commit]   (de dentro de testes/) */
import { execSync } from "node:child_process";
import fs from "node:fs";

const commit = process.argv[2] || "de9540f";
const APP = execSync(`git show ${commit}:src/App.jsx`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).split(String.fromCharCode(13)).join("");

const de = "const aplicarCondicoesDosGolpes = (acoes, persBase) => {";
const n = APP.split(de).length - 1;
if (n !== 1) throw new Error(`a âncora bate ${n} vezes: ${de}`);
const i = APP.indexOf(de);
const ate = "\n  };";
const j = APP.indexOf(ate, i + de.length);
if (j < 0) throw new Error("o fecho não bate");
const recorte = APP.slice(i, j + ate.length);

const sha = execSync(`git rev-parse --short ${commit}`, { encoding: "utf8" }).trim();
fs.writeFileSync(new URL("./aflicao-dourado.json", import.meta.url), JSON.stringify({ commit: sha, recorte }, null, 1) + "\n");
console.log(`aflicao-dourado.json: o recorte de ${sha}, ${recorte.length} caracteres`);
