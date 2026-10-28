/* gerar-entrega-dourado.mjs (Fase T1-A, 8.ª fatia, 28/10/2026) — os cinco últimos pedaços do aplicarResposta de ANTES

   Não é suíte (o `npm test` não o corre): é a ferramenta que faz o
   `entrega-dourado.json`. Lê o App de ANTES de a nêmesis na narração, os
   vistos do elenco, o trabalho pendente, a queda a zero e a entrega saírem
   do `aplicarResposta` — `git show a9ef8cf:src/App.jsx` —, recorta-os à
   letra (com os dois órgãos que eles chamam, `conferirNemesisNaNarrativa` e
   `resolverQueda`) e corre-os em Node sobre os casos de `entrega-bloco.mjs`,
   com os refs trocados por objetos simples e os módulos de verdade.

   uso: node testes/gerar-entrega-dourado.mjs [commit]  */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { N_CASOS } from "./combate-casos.mjs";
import { recorteDeAntes, blocoComoFuncao, correrOBloco, fotoDaEntrega, casosDaEntrega, BLOCOS } from "./entrega-bloco.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv[2] || "a9ef8cf";
const app = execSync(`git show ${COMMIT}:src/App.jsx`, { cwd: path.join(AQUI, ".."), maxBuffer: 1 << 28 }).toString().replace(/\r\n/g, "\n");
const r = recorteDeAntes(app);
const casos = casosDaEntrega(N_CASOS);
const saida = { commit: COMMIT, casos: N_CASOS, blocos: {} };
for (const bloco of BLOCOS) {
  const fn = blocoComoFuncao(r.orgaos, r[bloco]);
  saida.blocos[bloco] = casos.map((k) => fotoDaEntrega(correrOBloco(fn, k, { novo: false })));
  const erros = saida.blocos[bloco].filter((f) => f.erro).length;
  console.log(`${bloco}: ${N_CASOS} fotos, ${erros} estouram`);
}
fs.writeFileSync(path.join(AQUI, "entrega-dourado.json"), JSON.stringify(saida));
console.log("entrega-dourado.json:", fs.statSync(path.join(AQUI, "entrega-dourado.json")).size, "bytes");
