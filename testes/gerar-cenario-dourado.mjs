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

/* OS CONSERTOS DECLARADOS — a mesma troca no código de antes (o molde de
   gerar-pauta-dourado.mjs): uma regra que mudou DEPOIS do commit fotografado,
   aplicada à letra na pasta tirada, para o dourado ser o código de antes COM
   ela e a prova continuar a medir só o que a fatia moveu. Cada troca tem de
   bater uma vez só.
   1. CB13 (10/11/2026): o piso de PV do comum nos níveis 1 e 2 do herói
      (PV_NO_COMECO, combate.js) — muda o completarInimigo dos casos do
      bestiário (Bandido, Esqueleto, Zumbi, Lobo Atroz, Cultista…). */
/* 2. NE5 (13/11/2026, «o pedido não pede»): o DIVINDADE_PROMPT já não pede ao
      Narrador os sinais «fe:» e «milagre:» — a fé conta-se pelo que o herói faz
      (divindades.js#FE_PELO_SISTEMA) e o milagre sai pelo gesto do jogador.
      Muda só o caso `divindades.prompt`; as duas linhas trocam à letra. */
const CONSERTOS_DECLARADOS = [
  ["src/divindades.js", "- GANHO DE FÉ (por SINAL, nunca por número): quando o herói fizer algo que mereça fé, mande em \"sinais\" a magnitude — \"fe:sussurro\" (gesto notado por poucos), \"fe:feito\" (a cidade comenta), \"fe:proeza\" (a região conta), \"fe:marco\" (muda a história do mundo). O SISTEMA converte em fiéis levando a fama dele em conta. NÃO envie quantidade de fiéis nem de PF.", "- GANHO DE FÉ: o SISTEMA conta a fé pelo que o herói faz (o feito cumprido, o gesto devoto, o milagre), levando a fama dele em conta, e avisa; você narra quem passa a crer. Você nunca dá fiéis nem PF."],
  ["src/divindades.js", "- PF (Pontos de Fé) é o combustível de milagres e REGENERA SOZINHO por dia, proporcional aos fiéis — você nunca concede PF. Para gastar, mande \"milagre:<id>\" (bencao, cura, presagio, juramento, furia, refugio, ressurgir, decreto, avatar): o sistema cobra o custo, aplica o efeito e te avisa; você só narra a manifestação. Se o jogador pedir um milagre que ele ainda não pode pagar ou cujo grau não alcançou, o sistema recusa e você narra o silêncio do domínio.", "- PF (Pontos de Fé) é o combustível de milagres e REGENERA SOZINHO por dia, proporcional aos fiéis. O milagre sai pelo gesto do jogador: o sistema cobra o custo, aplica o efeito e te avisa; você só narra a manifestação. Se ele não pode pagar ou o grau não alcança, o sistema recusa e você narra o silêncio do domínio."],
  ["src/combate.js", "  const pv = Math.max(4, Math.round(base * mult));", "  const pv = Math.max(4, Number(nivelJogador) <= 2 && ameaca === \"comum\" ? 12 : 0, Math.round(base * mult));"],
];
for (const [arq, a, b] of CONSERTOS_DECLARADOS) {
  const f = path.join(tmp, arq);
  const txt = fs.readFileSync(f, "utf8");
  if (txt.split(a).length !== 2) throw new Error("o conserto declarado não bate uma vez: " + a);
  fs.writeFileSync(f, txt.replace(a, b));
}

const casos = await fotografarOsCatalogos(path.join(tmp, "src"));
const saida = { commit: COMMIT, gerado: "gerar-cenario-dourado.mjs", casos };
fs.writeFileSync(path.join(AQUI, "cenario-dourado.json"), JSON.stringify(saida) + "\n");
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`cenario-dourado.json: ${casos.length} casos, do commit ${COMMIT}`);
