/* gerar-envelopes-dourado.mjs (Fase T2, trilha A, 28/10/2026) — os envelopes do turno no App de ANTES

   Não é suíte (o `npm test` não o corre): é a ferramenta que faz o
   `envelopes-dourado.json`. Lê o App de ANTES de cada grupo de envelopes
   sair para src/motor/envelopes-do-turno.js — `git show <commit>:src/App.jsx`
   —, recorta o sítio à letra e corre-o em Node sobre os casos de
   `envelopes-bloco.mjs`, com os refs trocados por objetos simples.

   Cada grupo tem o seu commit de antes (`ANTES`): o dourado de um grupo que
   já saiu não muda quando o seguinte sai.

   uso: node testes/gerar-envelopes-dourado.mjs  */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { N_CASOS } from "./combate-casos.mjs";
import { recorteDosEnvelopes, blocoComoFuncao, correrOBloco, fotoDoEnvelope, casosDosEnvelopes, BLOCOS } from "./envelopes-bloco.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const ANTES = { rodape: "2137ae7", masmorraArmadilha: "d3d6f60", masmorraContornada: "d3d6f60", masmorraAVista: "d3d6f60", masmorraTesouro: "d3d6f60", masmorraSantuario: "d3d6f60", masmorraBusca: "d3d6f60", masmorraFuga: "d3d6f60" };
const apps = {};
const appDe = (c) => (apps[c] ||= execSync(`git show ${c}:src/App.jsx`, { cwd: path.join(AQUI, ".."), maxBuffer: 1 << 28 }).toString().replace(/\r\n/g, "\n"));
const casos = casosDosEnvelopes(N_CASOS);
const saida = { antes: ANTES, casos: N_CASOS, blocos: {} };
for (const bloco of BLOCOS) {
  const fn = blocoComoFuncao(recorteDosEnvelopes(appDe(ANTES[bloco]), { novo: false })[bloco]);
  saida.blocos[bloco] = casos.map((k) => fotoDoEnvelope(correrOBloco(fn, k, { novo: false, bloco })));
  const erros = saida.blocos[bloco].filter((f) => f.erro).length;
  const faltas = [...new Set(saida.blocos[bloco].flatMap((f) => f.faltas))];
  const maior = Math.max(...saida.blocos[bloco].map((f) => JSON.stringify(f.texto || "").length));
  console.log(`${bloco} (de ${ANTES[bloco]}): ${N_CASOS} fotos, ${erros} estouram, o maior ${maior} chars, faltas: ${faltas.join(", ") || "nenhuma"}`);
}
fs.writeFileSync(path.join(AQUI, "envelopes-dourado.json"), JSON.stringify(saida));
console.log("envelopes-dourado.json:", fs.statSync(path.join(AQUI, "envelopes-dourado.json")).size, "bytes");
