/* gerar-fecho-dourado.mjs (Fase T1-A, 7.ª fatia, 28/10/2026) — o perigo e a quase-morte de ANTES

   Não é suíte (o `npm test` não o corre): é a ferramenta que faz o
   `fecho-dourado.json`. Lê o App de ANTES de os dois blocos saírem do
   `aplicarResposta` — `git show 3ec3364:src/App.jsx` —, recorta-os à letra
   (com os dois invólucros que eles chamam, `bumpCont` e `aplicarVinculo`) e
   corre-os em Node sobre os casos de `fecho-bloco.mjs`, com os refs
   trocados por objetos simples e os módulos de verdade.

   uso: node testes/gerar-fecho-dourado.mjs [commit]  */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { N_CASOS } from "./combate-casos.mjs";
import { recorteDeAntes, blocoComoFuncao, correrOBloco, fotoDoFecho, casosDoFecho } from "./fecho-bloco.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv[2] || "3ec3364";
const app = execSync(`git show ${COMMIT}:src/App.jsx`, { cwd: path.join(AQUI, ".."), maxBuffer: 1 << 28 }).toString().replace(/\r\n/g, "\n");
const r = recorteDeAntes(app);
const casos = casosDoFecho(N_CASOS);
const saida = { commit: COMMIT, casos: N_CASOS, blocos: {} };
for (const bloco of ["perigo", "quaseMorte"]) {
  const fn = blocoComoFuncao(r.orgaos, r[bloco]);
  saida.blocos[bloco] = casos.map((k) => fotoDoFecho(correrOBloco(fn, k, { novo: false })));
  const erros = saida.blocos[bloco].filter((f) => f.erro).length;
  console.log(`${bloco}: ${N_CASOS} fotos, ${erros} estouram`);
}
fs.writeFileSync(path.join(AQUI, "fecho-dourado.json"), JSON.stringify(saida));
console.log("fecho-dourado.json:", fs.statSync(path.join(AQUI, "fecho-dourado.json")).size, "bytes");
