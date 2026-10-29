/* gerar-cenario-dourado.mjs (Fase T, T4-B · o cenário como arquivo, 1.ª a 6.ª fatias, 28/10/2026)
   — a fotografia de ANTES

   Não é suíte (o `npm test` não o corre): é a ferramenta que fez o
   `cenario-dourado.json`, e fica para quem quiser refazer a prova. Tira a
   pasta `src/` de um commit com `git archive` (o código de antes, sem tocar
   na árvore de ninguém), fotografa os catálogos com as perguntas de
   `cenario-casos.mjs` e grava o resultado. O commit padrão é o último em que
   os prontos, o povo do companheiro, os gêneros da criação e as palavras
   do céu ainda moravam em prontos.js, companheiros.js, constantes.js e
   divindades.js (605901b, 6.ª fatia).
   Cada fatia fotografou o commit de antes dela: os 578 casos da 1.ª saíram
   do f0a9fae, os 143 da 2.ª do 3e7493a, os 102 da 3.ª do 9068a93, os 48 da
   4.ª do 1cfc08a, os 69 da 5.ª do aea9587, os 8 da 6.ª do 605901b — e cada
   commit novo, que já lia do cenário o que a fatia anterior tirou, dá aos
   casos antigos a mesma resposta byte a byte (é a prova da fatia anterior),
   e por isso a fotografia nova os carrega sem os refazer.

   uso: node testes/gerar-cenario-dourado.mjs [commit] */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { fotografarOsCatalogos } from "./cenario-casos.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");
const COMMIT = process.argv[2] || "605901b";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cenario-dourado-"));
const tar = path.join(tmp, "src.tar");
execSync(`git archive --format=tar -o "${tar}" ${COMMIT} src`, { cwd: RAIZ });
execSync(`tar -xf "${path.basename(tar)}"`, { cwd: tmp });
fs.writeFileSync(path.join(tmp, "package.json"), JSON.stringify({ type: "module" }));

const casos = await fotografarOsCatalogos(path.join(tmp, "src"));
const saida = { commit: COMMIT, gerado: "gerar-cenario-dourado.mjs", casos };
fs.writeFileSync(path.join(AQUI, "cenario-dourado.json"), JSON.stringify(saida) + "\n");
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`cenario-dourado.json: ${casos.length} casos, do commit ${COMMIT}`);
