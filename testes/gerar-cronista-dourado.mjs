/* gerar-cronista-dourado.mjs (Fase T1-A, 9.ª fatia, 28/10/2026) — o Cronista do turno no App de ANTES

   Não é suíte (o `npm test` não o corre): é a ferramenta que faz o
   `cronista-dourado.json`. Lê o App de ANTES de o gatilho, o pedido e o
   aceito aplicado saírem para src/motor/cronista-do-turno.js —
   `git show 760fe1b:src/App.jsx` —, recorta o `cronistaDoTurno` inteiro à
   letra e corre-o em Node sobre os casos de `cronista-bloco.mjs`, com os
   refs trocados por objetos simples e os módulos de verdade.

   uso: node testes/gerar-cronista-dourado.mjs [commit]  */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { N_CASOS } from "./combate-casos.mjs";
import { recorteDeAntes, blocoComoFuncao, correrOBloco, fotoDoCronista, casosDoCronista } from "./cronista-bloco.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv[2] || "760fe1b";
const app = execSync(`git show ${COMMIT}:src/App.jsx`, { cwd: path.join(AQUI, ".."), maxBuffer: 1 << 28 }).toString().replace(/\r\n/g, "\n");
const fn = blocoComoFuncao(recorteDeAntes(app));
const casos = casosDoCronista(N_CASOS);
const fotos = [];
for (const k of casos) fotos.push(fotoDoCronista(await correrOBloco(fn, k, { novo: false })));
const faltas = [...new Set(fotos.flatMap((f) => f.faltas))];
console.log(`${N_CASOS} fotos, ${fotos.filter((f) => f.erro).length} estouram, faltas: ${faltas.join(", ") || "nenhuma"}`);
fs.writeFileSync(path.join(AQUI, "cronista-dourado.json"), JSON.stringify({ commit: COMMIT, casos: N_CASOS, fotos }));
console.log("cronista-dourado.json:", fs.statSync(path.join(AQUI, "cronista-dourado.json")).size, "bytes");
