/* A LISTA DAS PINTURAS — de onde a ferramenta de corte sabe o que cortar

   Lê o manifesto escrito em `mente/formas.md` (§ Retratos 11, a tabela das
   feras; § Retratos 13, a lista dos heróis) e escreve `lista.json` ao lado:
   uma linha por pintura, `{ tipo, arquivo, cx, olhos, fonte }`.

   `fonte` é o PNG 1024 da matriz no disco. As matrizes moram no Figma
   (`ffWFqD7TueSb88Mkeg9bhW`, página 08, grelhas `189:413` e `228:725`), e a
   cópia de 1024 de cada uma mora em `mente/figma/matrizes/<arquivo>.png`
   (182 arquivos, ~243 MB, FORA do repositório pelo `.gitignore`: até 12/10
   viviam no scratchpad de uma sessão, e um corte novo dependia de ela não
   ter sido limpa). Sem argumento, procura-se lá; para outras pastas,
   `node lista.mjs <pasta> [<pasta> ...]`.
   A matriz acha-se pelo nome — o arquivo final (`lobo.png`,
   `humano-m-mago-1.png`), o nome da amostra (`f1-lobo.png`, `h2-elfo-mago.png`)
   ou o da F1 (`f09-slime.png`). Pintura do manifesto sem matriz no disco é
   dita no fim, e não entra na lista.

   Fora de `src/`: nada disto vai ao jogo. */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const FORMAS = readFileSync(join(AQUI, "..", "..", "formas.md"), "utf8");
const num = (s) => Number(String(s).replace(",", "."));

/* a secção entre dois cabeçalhos — ler por âncora, também aqui */
const secao = (de, ate) => {
  const i = FORMAS.indexOf(de);
  if (i < 0) throw new Error("secção não achada: " + de);
  const j = FORMAS.indexOf(ate, i + de.length);
  return FORMAS.slice(i, j < 0 ? undefined : j);
};

const linhas = [];
/* §11 — a tabela de duas colunas de feras: | espécie | `arquivo` | cx | olhos | | ... */
for (const l of secao("### 11 · A F1 feita", "### 12 ·").split("\n")) {
  for (const m of l.matchAll(/`([a-z0-9-]+)`\s*\|\s*([\d,]+)\s*\|\s*\**([\d,]+)\**/g)) {
    linhas.push({ tipo: "especie", arquivo: m[1], cx: num(m[2]), olhos: num(m[3]) });
  }
}
/* §13 — `humano-m-guerreiro` 0,47·0,39 */
for (const m of secao("### 13 · A F2", "\n---").matchAll(/`([a-z-]+-[mf]-[a-z]+)`\s+([\d,]+)·([\d,]+)/g)) {
  linhas.push({ tipo: "gente", arquivo: m[1] + "-1", cx: num(m[2]), olhos: num(m[3]) });
}

/* os nomes das matrizes da amostra de 11/10 (§4 e §13) */
const AMOSTRA = {
  "f1-lobo": "lobo", "f2-goblin": "goblin", "f3-esqueleto": "esqueleto", "f4-troll": "troll",
  "f5-quimera": "quimera", "f6-dragao": "dragao-jovem", "f7-bandido": "bandido", "f8-zumbi": "zumbi",
  "h1-humana-guerreira": "humano-f-guerreiro-1", "h2-elfo-mago": "elfo-m-mago-1",
  "h3-ana-cleriga": "anao-f-clerigo-1", "h4-meioorc-ladino": "meio-orc-m-ladino-1",
  "h5-tiefling-bruxa": "tiefling-f-bruxo-1", "h6-draconato-cacador": "draconato-m-cacador-1",
};
const MATRIZES = join(AQUI, "..", "matrizes");
const pastas = process.argv.length > 2 ? process.argv.slice(2) : [MATRIZES];
const achado = new Map();
for (const p of pastas) {
  if (!existsSync(p)) continue;
  for (const f of readdirSync(p)) {
    if (!f.endsWith(".png")) continue;
    const base = f.slice(0, -4);
    const nome = AMOSTRA[base] || base.replace(/^f\d\d-/, "");
    if (!achado.has(nome)) achado.set(nome, join(p, f));
  }
}

const lista = [], faltam = [];
for (const l of linhas) {
  const fonte = achado.get(l.arquivo);
  if (fonte) lista.push({ ...l, fonte }); else faltam.push(l.arquivo);
}
writeFileSync(join(AQUI, "lista.json"), JSON.stringify(lista, null, 1));
console.log(`manifesto: ${linhas.length} (${linhas.filter((l) => l.tipo === "especie").length} feras, ${linhas.filter((l) => l.tipo === "gente").length} heróis)`);
console.log(`com matriz no disco: ${lista.length}`);
if (faltam.length) console.log("sem matriz: " + faltam.join(", "));
