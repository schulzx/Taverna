/* gerar-tempo-dourado.mjs (Fase T, trilha A, 28/10/2026) — o tempo do turno no App de ANTES

   Não é suíte (o `npm test` não o corre): é a ferramenta que faz o
   `tempo-dourado.json`. Lê o App de ANTES de o relógio e o passo na cidade
   saírem para src/motor/tempo-do-turno.js — `git show 7a0d8b2:src/App.jsx`
   —, recorta-os à letra e corre-os em Node sobre os casos de
   `tempo-bloco.mjs`, com os refs trocados por objetos simples e os módulos
   de verdade.

   uso: node testes/gerar-tempo-dourado.mjs [commit]  */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { N_CASOS } from "./combate-casos.mjs";
import { recorteDoTempo, blocoComoFuncao, correrOBloco, fotoDoTempo, casosDoTempo, BLOCOS } from "./tempo-bloco.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv[2] || "7a0d8b2";
const app = execSync(`git show ${COMMIT}:src/App.jsx`, { cwd: path.join(AQUI, ".."), maxBuffer: 1 << 28 }).toString().replace(/\r\n/g, "\n");
const r = recorteDoTempo(app);
const casos = casosDoTempo(N_CASOS);
const saida = { commit: COMMIT, casos: N_CASOS, blocos: {} };
for (const bloco of BLOCOS) {
  const fn = blocoComoFuncao(r[bloco]);
  saida.blocos[bloco] = casos.map((k) => fotoDoTempo(correrOBloco(fn, k, { novo: false, bloco })));
  const erros = saida.blocos[bloco].filter((f) => f.erro).length;
  const faltas = [...new Set(saida.blocos[bloco].flatMap((f) => f.faltas))];
  console.log(`${bloco}: ${N_CASOS} fotos, ${erros} estouram, faltas: ${faltas.join(", ") || "nenhuma"}`);
}
fs.writeFileSync(path.join(AQUI, "tempo-dourado.json"), JSON.stringify(saida));
console.log("tempo-dourado.json:", fs.statSync(path.join(AQUI, "tempo-dourado.json")).size, "bytes");
