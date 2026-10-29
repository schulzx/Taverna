/* gerar-golpe-dourado.mjs (Fase T, trilha B, 28/10/2026) — o recorte à letra das regras do golpe

   Lê o App de um commit (pelo git, sem tocar na árvore) e recorta, por
   âncora que tem de bater UMA vez só, as cinco regras puras que ganharam
   peça no motor:

     carimbo      — a linha do carimbo `naLuta` em `pushMsgs`
     abrigo       — `passarPeloAbrigo` inteira
     concentracao — `segurarOuPerder` inteira
     quebra       — o bloco da quebra na mesa do herói (o try/calou inteiro)
     fila         — amortecer → repartir → abrigo, na rodada do herói

   Grava-as em `golpe-dourado.json` com o commit. As suítes
   (`teste-motor-carimbo-da-luta`, `teste-motor-golpe-no-corpo`) compilam o
   recorte com as dependências reais e o correm, lado a lado com a peça,
   sobre os casos de `golpe-casos.mjs` — e mordem-no para provar que a
   comparação vê a diferença. O recorte é dado congelado: quando a trilha A
   trocar a chamada no App, o texto de lá some, e a prova fica.

   Uso: node gerar-golpe-dourado.mjs [commit]   (de dentro de testes/) */
import { execSync } from "node:child_process";
import fs from "node:fs";

const commit = process.argv[2] || "c494a04";
const APP = execSync(`git show ${commit}:src/App.jsx`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).split(String.fromCharCode(13)).join("");

const umaVez = (de) => {
  const n = APP.split(de).length - 1;
  if (n !== 1) throw new Error(`a âncora bate ${n} vezes: ${de.slice(0, 70)}`);
  return APP.indexOf(de);
};
/* do começo da âncora até ao fim do fecho (inclusive), o fecho procurado depois dela */
const recorte = (de, ate) => {
  const i = umaVez(de);
  const j = APP.indexOf(ate, i + de.length);
  if (j < 0) throw new Error("o fecho não bate: " + ate.slice(0, 70));
  return APP.slice(i, j + ate.length);
};

const recortes = {
  carimbo: recorte("if ((combateRef.current || fechoDaLutaRef.current) && Array.isArray(novas)) novas = ", ";\n").replace(/\n$/, ""),
  abrigo: recorte(`const passarPeloAbrigo = (quem, dano, nome = "") => {`, "\n  };"),
  concentracao: recorte(`const segurarOuPerder = (quem, dano, nome = "") => {`, "\n  };"),
  quebra: recorte("try {\n        const concentrando = efeitoEmConcentracao(persBase);", `} catch (e) { calou("quebraDaConcentracao", e); }`),
  fila: recorte(`const amort = amortecerDano(persTracos, a.r.dano, a.r.tipoDano || "fisico");`, `linhasSis.push({ autor: "sistema", texto: abrH.linha });\n          }`),
};

const sha = execSync(`git rev-parse --short ${commit}`, { encoding: "utf8" }).trim();
fs.writeFileSync(new URL("./golpe-dourado.json", import.meta.url), JSON.stringify({ commit: sha, recortes }, null, 1) + "\n");
console.log(`golpe-dourado.json: ${Object.keys(recortes).length} recortes de ${sha} — ` + Object.entries(recortes).map(([k, v]) => `${k} ${v.length}`).join(", "));
