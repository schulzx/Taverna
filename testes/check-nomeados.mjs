/* check-nomeados.mjs (v9.104) — o import que existe e o export que não.

   O BUG QUE TROUXE ISTO: apaguei `longeDemais` e `envelopeDoDeslocamento`
   de `geografo.js` e esqueci de tirá-los do import do App. O
   `npx vite build` PASSOU — o Rollup descarta import não usado sem
   reclamar — e o `check-imports` também, porque ele procura nome USADO
   sem definição, e estes não eram usados.

   Quem reclamou foi o servidor de desenvolvimento, que faz ESM de
   verdade: o módulo inteiro parou de carregar e a tela ficou em branco.
   Ou seja: o build verde não é prova de que o grafo de módulos está são.

   Esta sonda confere o contrário do que a outra confere — todo nome
   IMPORTADO de um arquivo local existe como export naquele arquivo. */
import fs from "node:fs";
const SRC = "../src/";
const arquivos = fs.readdirSync(SRC).filter((f) => /\.(js|jsx)$/.test(f));

const exportsDe = (txt) => {
  const s = new Set();
  for (const m of txt.matchAll(/^export\s+(?:async\s+)?(?:function|class)\s+([A-Za-z_$][\w$]*)/gm)) s.add(m[1]);
  /* `export const A = 1, B = 2, C = 3` declara TRÊS numa linha só, e a
     primeira versão desta sonda via um. Quatro falsos positivos de saída —
     e sonda que grita sem motivo não é lida na segunda vez. */
  for (const m of txt.matchAll(/^export\s+(?:const|let|var)\s+([\s\S]*?);?$/gm)) {
    let dentro = 0;
    let atual = "";
    const trechos = [];
    for (const ch of m[1]) {
      if ("([{".includes(ch)) dentro++;
      if (")]}".includes(ch)) dentro--;
      if (ch === "," && dentro === 0) { trechos.push(atual); atual = ""; continue; }
      atual += ch;
    }
    trechos.push(atual);
    for (const t of trechos) {
      const nome = (t.trim().match(/^([A-Za-z_$][\w$]*)/) || [])[1];
      if (nome) s.add(nome);
    }
  }
  for (const m of txt.matchAll(/^export\s*\{([^}]*)\}/gm)) {
    for (const p of m[1].split(",")) {
      const t = p.trim().split(/\s+as\s+/);
      const nome = (t[1] || t[0] || "").trim();
      if (nome) s.add(nome);
    }
  }
  return s;
};

const cache = {};
const doArquivo = (nome) => {
  if (!cache[nome]) {
    try { cache[nome] = exportsDe(fs.readFileSync(SRC + nome, "utf8")); }
    catch { cache[nome] = null; }
  }
  return cache[nome];
};

let quebrados = 0, conferidos = 0;
for (const arq of arquivos) {
  const txt = fs.readFileSync(SRC + arq, "utf8");
  for (const m of txt.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']\.\/([^"']+)["']/g)) {
    const alvo = m[2];
    const exps = doArquivo(alvo);
    if (!exps) { console.log(`  ?? ${arq} importa de ${alvo}, que não existe`); quebrados++; continue; }
    for (const p of m[1].split(",")) {
      const nome = p.trim().split(/\s+as\s+/)[0].trim();
      if (!nome) continue;
      conferidos++;
      if (!exps.has(nome)) { console.log(`  XX ${arq}: importa "${nome}" de ${alvo}, que não exporta isso`); quebrados++; }
    }
  }
}
console.log(`\n${conferidos} nomes importados conferidos · ${quebrados} quebrados`);
console.log(quebrados ? "IMPORT QUEBRADO — o build passa e o dev server não carrega" : "todo import nomeado tem export do outro lado");
process.exit(quebrados ? 1 : 0);
