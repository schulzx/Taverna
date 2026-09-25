/* teste-v3-glifos.mjs (V3, 24/09) — os ícones desenhados

   O que esta suíte prende, e porquê cada coisa:
   1. A TABELA (`glifos.js`) é geometria legível: um `d` por glifo, que
      começa num `M` absoluto e não tem `m` relativo no meio. Foi o defeito
      que apareceu ao construí-la — juntar vários `<path>` do Lucide num só
      `d` torna RELATIVO o `m` que abria cada um, e o desenho sai torto sem
      nenhum erro. A suíte não deixa voltar.
   2. O TRAÇO é medido em píxeis de tela e engrossa, relativo ao desenho,
      quando o glifo encolhe (o tamanho óptico do Material Symbols).
   3. O DADO É UM D20: a projecção de um icosaedro pelo eixo de uma face.
      Não se prova que "parece" um d20 — prova-se a geometria: silhueta
      hexagonal regular, a face da frente equilátera e concêntrica, a razão
      entre as duas = 1/φ (a do sólido verdadeiro), e cada uma das 12
      arestas desenhadas é uma das 18 verdadeiras.
   4. O `Glifo` (`ui.jsx`) cumpre as três leis: cor por omissão
      `currentColor`, `aria-hidden` sem rótulo e `role="img"` com rótulo,
      traço pela tabela; e os quatro da cinta (R13) são pedidos, não
      redesenhados.
   5. Os treze arquivos que V3a limpou continuam limpos — o dente de
      `check-formas` (D5h) guarda o resto da casa; este guarda o nome de
      cada um, para quem ler a falha saber que a regressão é de V3a. */
import { readFileSync } from "node:fs";
import { GLIFOS, TRACO_DO_GLIFO, tracoDoGlifo, tracoNaGrelha } from "../src/glifos.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const perto = (a, b, eps = 0.03) => Math.abs(a - b) <= eps;

/* ============================================================ */
sec("1. a tabela");
const nomes = Object.keys(GLIFOS);
t("GLIFOS tem entradas (a tabela não desapareceu)", nomes.length >= 16, `tem ${nomes.length}`);
for (const n of nomes) {
  const g = GLIFOS[n];
  const ok = g && typeof g.d === "string" && /^M/.test(g.d) && !/m/.test(g.d) && /^(casa|lucide:[a-z0-9-]+)$/.test(g.de);
  if (!ok) t(`${n}: d começa em M, sem m relativo, e diz a origem`, false, JSON.stringify(g).slice(0, 120));
}
t("todas as entradas começam num M absoluto, sem m relativo, e dizem de onde vieram", nomes.every((n) => /^M/.test(GLIFOS[n].d) && !/m/.test(GLIFOS[n].d)));
/* os números absolutos de cada `d` cabem na grelha 24 com a margem do
   traço: nenhum abaixo de 0 nem acima de 24 (os relativos são deslocamentos
   e não contam; é uma rede grossa, mas apanha uma coordenada de outra grelha
   colada por engano — a de 20 ou de 14 dos glifos antigos) */
const absolutos = (d) => {
  const out = []; const RX = /([MLHVCSQTAZ])([^MLHVCSQTAZmlhvcsqtaz]*)/g; let m;
  while ((m = RX.exec(d)) !== null) {
    const nums = (m[2].match(/-?(?:\d*\.\d+|\d+)/g) || []).map(Number);
    if (m[1] === "A") { for (let i = 0; i + 6 < nums.length + 1; i += 7) out.push(nums[i + 5], nums[i + 6]); }
    else out.push(...nums);
  }
  return out.filter((x) => Number.isFinite(x));
};
const fora = nomes.filter((n) => absolutos(GLIFOS[n].d).some((x) => x < 0 || x > 24));
t("toda coordenada absoluta mora dentro da grelha 24", fora.length === 0, `fora: ${fora.join(", ")}`);

/* ============================================================ */
sec("2. o traço, em píxeis de tela");
t("2 px a 24 — o traço do Lucide, que é o da v3", TRACO_DO_GLIFO[24] === 2 && tracoDoGlifo(24) === 2);
t("1,25 px a 12 — o piso: abaixo disto o anti-alias apaga o fio", tracoDoGlifo(12) === 1.25 && tracoDoGlifo(8) === 1.25);
t("cresce com o tamanho, e nunca passa de 2 px", [12, 14, 16, 18, 20, 22, 24, 32, 48].every((x, i, a) => i === 0 || tracoDoGlifo(x) >= tracoDoGlifo(a[i - 1])) && tracoDoGlifo(64) === 2);
t("em unidades da grelha, o glifo pequeno tem traço MAIS GROSSO (tamanho óptico)", tracoNaGrelha(12) > tracoNaGrelha(16) && tracoNaGrelha(16) > tracoNaGrelha(24));
t("um tamanho inválido não parte a conta", Number.isFinite(tracoNaGrelha(undefined)) && Number.isFinite(tracoDoGlifo("x")));

/* ============================================================ */
sec("3. o dado é um d20");
{
  const d = GLIFOS.dado.d;
  /* segmentos: percorre M/L/l/v/z e junta cada par de pontos */
  const segs = []; let cur = null, ini = null;
  const RX = /([MLlVvHhZz])\s*([^MLlVvHhZz]*)/g; let m;
  while ((m = RX.exec(d)) !== null) {
    const c = m[1]; const nums = (m[2].match(/-?(?:\d*\.\d+|\d+)/g) || []).map(Number);
    if (c === "M") { cur = [nums[0], nums[1]]; ini = cur; for (let i = 2; i + 1 < nums.length; i += 2) { const p = [nums[i], nums[i + 1]]; segs.push([cur, p]); cur = p; } }
    else if (c === "L") for (let i = 0; i + 1 < nums.length; i += 2) { const p = [nums[i], nums[i + 1]]; segs.push([cur, p]); cur = p; }
    else if (c === "l") for (let i = 0; i + 1 < nums.length; i += 2) { const p = [cur[0] + nums[i], cur[1] + nums[i + 1]]; segs.push([cur, p]); cur = p; }
    else if (c === "v") for (const n of nums) { const p = [cur[0], cur[1] + n]; segs.push([cur, p]); cur = p; }
    else if (c === "V") for (const n of nums) { const p = [cur[0], n]; segs.push([cur, p]); cur = p; }
    else if (c === "h") for (const n of nums) { const p = [cur[0] + n, cur[1]]; segs.push([cur, p]); cur = p; }
    else if (c === "H") for (const n of nums) { const p = [n, cur[1]]; segs.push([cur, p]); cur = p; }
    else if (c === "Z" || c === "z") { segs.push([cur, ini]); cur = ini; }
  }
  const chave = (p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
  const vertices = new Set(segs.flatMap(([a, b]) => [chave(a), chave(b)]));
  const arestas = new Set(segs.map(([a, b]) => [chave(a), chave(b)].sort().join("|")));
  t("9 vértices à vista", vertices.size === 9, `tem ${vertices.size}`);
  /* A projecção inteira tem 18 arestas; desenhadas todas, o glifo mede 74 %
     de tinta a 16 px (a família anda nos 40–50 %) e vira mancha — medido em
     V3, `v3-desenho.md` §3. O glifo desenha 12, e as 12 são arestas
     VERDADEIRAS: esta lista é a projecção calculada (scratch `d20.mjs`),
     e nenhuma aresta desenhada pode estar fora dela. */
  const VERDADEIRAS = new Set([
    ["6.65,15.09", "17.35,15.09"], ["17.35,15.09", "12.00,5.82"], ["6.65,15.09", "12.00,5.82"], ["17.35,15.09", "12.00,22.00"],
    ["6.65,15.09", "12.00,22.00"], ["12.00,5.82", "3.34,7.00"], ["6.65,15.09", "3.34,7.00"], ["6.65,15.09", "3.34,17.00"],
    ["3.34,17.00", "3.34,7.00"], ["3.34,17.00", "12.00,22.00"], ["12.00,5.82", "20.66,7.00"], ["17.35,15.09", "20.66,7.00"],
    ["17.35,15.09", "20.66,17.00"], ["20.66,17.00", "12.00,22.00"], ["20.66,17.00", "20.66,7.00"], ["12.00,5.82", "12.00,2.00"],
    ["12.00,2.00", "3.34,7.00"], ["12.00,2.00", "20.66,7.00"],
  ].map((par) => par.sort().join("|")));
  t("a projecção de referência tem as 18 arestas de um icosaedro visto pela face", VERDADEIRAS.size === 18);
  t("12 arestas desenhadas — a silhueta, a face da frente e as três que as prendem", arestas.size === 12, `tem ${arestas.size}`);
  const inventadas = [...arestas].filter((a) => !VERDADEIRAS.has(a));
  t("toda aresta desenhada é uma aresta verdadeira do sólido (nenhuma inventada)", inventadas.length === 0, inventadas.join(" · "));
  const pts = [...vertices].map((k) => k.split(",").map(Number));
  const dist = (p) => Math.hypot(p[0] - 12, p[1] - 12);
  const fora = pts.filter((p) => perto(dist(p), 10, 0.06));
  const dentro = pts.filter((p) => !perto(dist(p), 10, 0.06));
  t("a silhueta é um hexágono regular de raio 10 à volta do centro", fora.length === 6);
  t("a face da frente é um triângulo com os três vértices à mesma distância do centro", dentro.length === 3 && dentro.every((p) => perto(dist(p), dist(dentro[0]), 0.03)));
  const phi = (1 + Math.sqrt(5)) / 2;
  t("face ÷ silhueta = 1/φ — é a projecção do sólido verdadeiro, não um hexágono enfeitado", dentro.length === 3 && perto(dist(dentro[0]) / 10, 1 / phi, 0.003),
    dentro.length ? `mede ${(dist(dentro[0]) / 10).toFixed(4)} contra ${(1 / phi).toFixed(4)}` : "");
  t("a face da frente aponta para cima (o vértice de cima está no eixo)", dentro.some((p) => perto(p[0], 12) && p[1] < 12));
}

/* ============================================================ */
sec("4. o Glifo de ui.jsx");
/* o fim de linha normaliza-se: na árvore do Windows o git entrega CRLF, e o
   corte do corpo de cada função procura "\n}\n" */
const UI = readFileSync("../src/ui.jsx", "utf8").replace(/\r\n/g, "\n");
const corpo = (nome) => { const i = UI.indexOf(`export function ${nome}(`); return i < 0 ? "" : UI.slice(i, UI.indexOf("\n}\n", i)); };
const G = corpo("Glifo");
t("Glifo existe e lê a tabela", /export function Glifo\(\{ nome, tamanho = 16, cor = "currentColor", rotulo, fracao \}\)/.test(UI) && /GLIFOS\[nome\]/.test(G));
t("sem rótulo é aria-hidden; com rótulo é role=img e diz o rótulo", /rotulo \? \{ role: "img", "aria-label": rotulo \} : \{ "aria-hidden": "true" \}/.test(G));
t("o traço sai de tracoNaGrelha, e a junta e a ponta são redondas", /strokeWidth=\{tracoNaGrelha\(tamanho\)\}/.test(G) && /strokeLinecap="round"/.test(G) && /strokeLinejoin="round"/.test(G));
t("sem enchimento: a única cor é a do traço", /fill="none"/.test(G));
t("os quatro da cinta (R13) são pedidos pelo nome, não redesenhados",
  /const DO_QUADRO_12 = \{ moeda: IconeBolsa, mana: IconeMana, vida: IconeVida, ampulheta: IconeAmpulheta \}/.test(UI));
/* uma ação, uma forma: os `Icone*` de mesma ação já não desenham — pedem */
const DELEGAM = { IconeD20: "dado", IconeDado: "dado", IconeLivro: "diario", IconeMochila: "bolsa", IconeMapa: "mapa", IconeBussola: "mapa", IconeLosango: "ascensao", IconeAviso: "aviso", IconeAlfinete: "alfinete", IconeDois: "grupo", IconeEspada: "espada", IconeFaiscas: "faisca" };
const naoDelegam = Object.entries(DELEGAM).filter(([ic, g]) => { const c = corpo(ic); return !c.includes(`<Glifo nome="${g}"`) || /<path/.test(c); });
t(`os ${Object.keys(DELEGAM).length} Icone* de mesma ação pedem a forma ao Glifo e não têm path próprio`, naoDelegam.length === 0, naoDelegam.map(([a]) => a).join(", "));
t("o d6 morreu: IconeDado desenha o d20", corpo("IconeDado").includes('<Glifo nome="dado"'));
t("a Ascensão deixou o losango do PM", corpo("IconeLosango").includes('<Glifo nome="ascensao"') && !/<path/.test(corpo("IconeLosango")));

/* ============================================================ */
sec("5. os treze arquivos de V3a continuam sem emoji do sistema");
const RX_EMOJI = /(?![©®™])\p{Extended_Pictographic}/u;
const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
for (const a of ["painel-codex", "painel-habilidades", "painel-mapa", "painel-ascensao", "painel-ficha", "painel-guilda", "painel-batalha", "painel-diario", "painel-diplomacia", "painel-talentos", "painel-heroismo", "planta-cidade", "grade-de-batalha"]) {
  const txt = semComentarios(readFileSync(`../src/${a}.jsx`, "utf8"));
  const m = txt.match(RX_EMOJI);
  t(`${a}.jsx: zero emoji do sistema`, !m, m ? `achou ${m[0]}` : "");
}
const CODEX = readFileSync("../src/painel-codex.jsx", "utf8");
t("o Bestiário diz a ameaça em degraus 1–5, por tabela", /const DEGRAU_DA_AMEACA = \{ fraco: 1, comum: 2, competente: 3, elite: 4, lendario: 5 \}/.test(CODEX) && /<DegrausDaAmeaca nivel=\{DEGRAU_DA_AMEACA\[c\.ameaca\]\}/.test(CODEX));
const BAT = readFileSync("../src/painel-batalha.jsx", "utf8");
t("as duas gavetas da luta têm nome e 48 px de largura mínima", /aria-label="Habilidades"/.test(BAT) && (BAT.match(/minWidth: ALVOS\.piso/g) || []).length >= 2);
t("a bolsa da luta deixou o ◆ (que é o PM)", !/>◆\{nBolsa/.test(BAT) && /<Glifo nome="bolsa"/.test(BAT));

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
