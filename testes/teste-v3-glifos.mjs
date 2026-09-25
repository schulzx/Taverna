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

/* ============================================================
   6. V3b · o assunto da linha — o motor escreve, o ecrã traduz
   ============================================================ */
sec("6. V3b · o assunto da linha");
{
  const { ASSUNTO_DO_EMOJI, assuntoDaLinha } = await import("../src/glifos.js");
  const QUADRO_12 = ["moeda", "mana", "vida", "ampulheta"];
  const nomeDe = (a) => (typeof a === "string" ? a : a && a.glifo);
  const orfaos = Object.entries(ASSUNTO_DO_EMOJI).map(([k, a]) => [k, nomeDe(a)]).filter(([, g]) => g && !GLIFOS[g] && !QUADRO_12.includes(g));
  t("todo assunto da tabela é um glifo que existe (GLIFOS ou os quatro da cinta)", orfaos.length === 0, orfaos.map(([k, g]) => `${k}→${g}`).join(" "));
  /* A CATRACA DO PREFIXO: todo emoji que abre uma frase escrita em `src/`
     tem entrada — glifo, `IMPEDIDO` ou `null`. Um prefixo novo sem decisão
     sai na mesma (a linha nunca mostra o emoji), mas não entra calado. */
  const { readdirSync } = await import("node:fs");
  const RX_ABRE = /["`]((?:\p{Extended_Pictographic})️?)(?=[  ])/gu;
  const semDecisao = new Set();
  for (const f of readdirSync("../src").filter((n) => /\.(js|jsx)$/.test(n) && n !== "glifos.js")) {
    const txt = semComentarios(readFileSync(`../src/${f}`, "utf8"));
    for (const m of txt.matchAll(RX_ABRE)) { const k = m[1].replace(/️/g, ""); if (!(k in ASSUNTO_DO_EMOJI)) semDecisao.add(`${k} (${f})`); }
  }
  t("todo emoji que abre uma frase em src/ tem uma decisão na tabela", semDecisao.size === 0, [...semDecisao].join(" · "));
  const c = (txt) => JSON.stringify(assuntoDaLinha(txt));
  t("⛔ vira o tom Impedido, sem glifo, e sai da frase", c("⛔ Bola de Fogo custa 3 PM — você tem 1.") === JSON.stringify({ glifo: null, tom: "impedido", resto: "Bola de Fogo custa 3 PM — você tem 1." }));
  t("🧭 vira o mapa, tom Neutro", c("🧭 Chegada: agora você está em Pedravale.") === JSON.stringify({ glifo: "mapa", tom: "neutro", resto: "Chegada: agora você está em Pedravale." }));
  t("o seletor de variação (⚠️) não muda o assunto", assuntoDaLinha("⚠️ cuidado").glifo === "aviso" && assuntoDaLinha("⚠️ cuidado").resto === "cuidado");
  t("📕 é uma recusa COM assunto: a magia, no tom Impedido", c("📕 x") === JSON.stringify({ glifo: "faisca", tom: "impedido", resto: "x" }));
  t("um prefixo que a tabela manda sair some, e a palavra fica", c("⚖ Lenda recalibrada") === JSON.stringify({ glifo: null, tom: "neutro", resto: "Lenda recalibrada" }));
  t("um prefixo desconhecido também sai (a linha nunca mostra emoji do sistema)", assuntoDaLinha("🦄 x").resto === "x" && assuntoDaLinha("🦄 x").glifo === null);
  t("uma linha sem emoji fica como está", c("Nada a declarar") === JSON.stringify({ glifo: null, tom: "neutro", resto: "Nada a declarar" }));
  t("o ✦ de fonte também é prefixo (é a magia)", assuntoDaLinha("✦ Bênção 3t").glifo === "faisca");
  t("null e undefined não partem a conta", assuntoDaLinha(null).resto === "" && assuntoDaLinha(undefined).tom === "neutro");
  t("o emoji a meio da frase NÃO é prefixo e não se toca", assuntoDaLinha("Paga ⚗ 3").resto === "Paga ⚗ 3");
}

/* ============================================================
   7. V3b · a tela principal: as falas, a voz, os chips, o teste, a gaveta
   ============================================================ */
sec("7. V3b · a tela principal");
{
  const APP = readFileSync("../src/App.jsx", "utf8").replace(/\r\n/g, "\n");
  const UI2 = readFileSync("../src/ui.jsx", "utf8").replace(/\r\n/g, "\n");
  const { LADRILHO } = await import("../src/estilo.js");
  t("o ladrilho mede o que a v3 desenhou: 36, glifo 16, raio 12, 12 até à frase", LADRILHO.lado === 36 && LADRILHO.glifo === 16 && LADRILHO.raio === 12 && LADRILHO.espaco === 12);
  const LAD = corpo("LadrilhoDoAssunto");
  t("LadrilhoDoAssunto: Neutro cheio com fio line e glifo âmbar; Impedido oco com fio lineStrong e glifo inkDim",
    /background: impedido \? "transparent" : T\.panelSoft/.test(LAD) && /impedido \? T\.lineStrong : T\.line/.test(LAD) && /cor=\{impedido \? T\.inkDim : T\.amber\}/.test(LAD) && /aria-hidden="true"/.test(LAD));
  t("o BlocoSistema traduz cada fala por assuntoDaLinha e desenha o ladrilho", /const \{ glifo, tom, resto \} = assuntoDaLinha\(semSetaQueMente\(bruto\)\);/.test(APP) && /<LadrilhoDoAssunto glifo=\{glifo\} tom=\{tom\} \/>/.test(APP));
  /* A asserção mudou depois da prova jogada (v3-jogo.md §9.2-1): a seta saiu do fim da
     linha e foi para o ladrilho (tom "porta"). O que ela guarda fica: alvo a ALVOS.piso,
     e a seta desenhada, não o carácter do motor. */
  t("a porta continua um botão a ALVOS.piso, e a seta é desenhada", /minHeight: ALVOS\.piso, gap: LADRILHO\.espaco, cursor: "pointer"/.test(APP) && /\{porta \? <LadrilhoDoAssunto tom="porta" \/>/.test(APP) && /tom === "porta" \? <IconeSeta /.test(LAD));
  { const i = APP.indexOf("function BlocoSistema"); const BLOCO = APP.slice(i, APP.indexOf("\n}\n", i));
    t("a pílula centrada morreu: nenhum rounded-full no BlocoSistema", i > 0 && !/rounded-full/.test(BLOCO)); }
  t("a voz desenha ouvir e pausa — o 🔊 e o ⏸ saíram do glifoDeOuvir", /<Glifo nome="pausa" tamanho=\{14\} \/>/.test(APP) && /<Glifo nome="ouvir" tamanho=\{14\} \/>/.test(APP) && !/"⏸"\) : "🔊"/.test(APP));
  t("os chips do estado deixaram o emoji de condicoes.js: a favor / contra pela forma", /glifo: c\.tipo === "bom" \? "favor" : "contra", texto: c\.nome/.test(APP) && !/c\.icone \|\| \(c\.tipo === "bom"/.test(APP) && /glifo: "faisca", texto: e\.nome/.test(APP));
  t("o teste pendente mostra o d20 da casa, nas duas telas", (APP.match(/<Glifo nome="dado" tamanho=\{16\} \/> Teste de \{rolagem\.rotulo/g) || []).length === 2 && !/🎲 Teste de/.test(APP));
  t("a gaveta da mesa é o glifo da magia, com o número de armadas no nome", /\}\}><Glifo nome="faisca" tamanho=\{20\} \/>\{habsSel\.length > 0/.test(APP) && /aria-label=\{habsSel\.length > 0 \? `Habilidades, \$\{habsSel\.length\} armada/.test(APP));
  t("o \"não guardou\" leva o aviso desenhado", /<Glifo nome="aviso" tamanho=\{12\} \/> não guardou/.test(APP));
  t("LadrilhoDoAssunto mora em ui.jsx, não no App (a peça é do desenho)", /export function LadrilhoDoAssunto\(/.test(UI2) && !/function LadrilhoDoAssunto\(/.test(APP));
}

sec("8. V3c · o trilho não mente");
{ const APP = readFileSync("../src/App.jsx", "utf8");
  t("a aba Gestão é o herói e a aba Códex é a ânfora (a espada e a caveira saíram do trilho)",
    /gestao: \(p\) => <Glifo nome="heroi"/.test(APP) && /codex: \(p\) => <Glifo nome="codice"/.test(APP) && !/gestao: IconeEspada/.test(APP) && !/codex: IconeCaveira/.test(APP)); }

/* ============================================================
   9. V3b · os consertos da prova jogada (v3-jogo.md §9.4)
   ============================================================ */
sec("9. V3b · os consertos da prova jogada");
{
  const APP = readFileSync("../src/App.jsx", "utf8").replace(/\r\n/g, "\n");
  const UI3 = readFileSync("../src/ui.jsx", "utf8").replace(/\r\n/g, "\n");
  const { ASSUNTO_DO_EMOJI, assuntoDaLinha } = await import("../src/glifos.js");
  /* 1 — uma notícia, uma cara: era 🆘/🏹/📋 conforme o molde, e 🏹 lia-se dano */
  t("a notícia do mural leva sempre o pergaminho, nunca o ícone do molde",
    /\[`📋 \$\{of\.dador\} tem um trabalho no mural\.`\]/.test(APP) && !/of\.icone \|\| "📋"/.test(APP));
  /* 2 — o 📖 é o grimório; as duas falas de 📖 que não eram magia mudaram de prefixo */
  t("📖 é magia (faísca), não lupa", ASSUNTO_DO_EMOJI["📖"] === "faisca" && assuntoDaLinha("📖 Você ainda não sabe essa magia de cor").glifo === "faisca");
  t("a ficha da base do mundo e o arco novo já não abrem com 📖", !/`📖 \$\{e\.nome\} está na base do mundo/.test(APP) && !/`📖 Novo arco iniciado/.test(APP));
  /* 3 — o 🕯 dizia três coisas; fica só a tocha */
  t("trazer de volta é vida (🩹) e a fé é ascensão (🌟), na tabela", ASSUNTO_DO_EMOJI["🩹"] === "vida" && ASSUNTO_DO_EMOJI["🌟"] === "ascensao" && ASSUNTO_DO_EMOJI["🕯"] === "tocha");
  { const semTocha = APP.split("\n").filter((l) => /🕯/.test(l) && !/toch/i.test(l));
    t("todo 🕯 que resta no App.jsx é das tochas", semTocha.length === 0, semTocha.map((l) => l.trim().slice(0, 60)).join(" · ")); }
  /* 4 — os selos da mecânica passam pela tabela: sai o último emoji da mesa (🎲 vantagem) */
  { const i = APP.indexOf("function chipsDoEstado("); const CHIPS = APP.slice(i, APP.indexOf("\n}\n", i));
    t("chipsDoEstado traduz os selos por assuntoDaLinha e não escreve emoji", i > 0 && /assuntoDaLinha\(x\.texto\)/.test(CHIPS) && !/\p{Extended_Pictographic}/u.test(CHIPS));
    t("o selo 🎲 vantagem vira o dado e a palavra", JSON.stringify(assuntoDaLinha("🎲 vantagem")) === JSON.stringify({ glifo: "dado", tom: "neutro", resto: "vantagem" })); }
  /* 5 — a porta: a seta no ladrilho, o fio de controlo, a largura do texto */
  t("a porta leva fio lineStrong, raio do ladrilho e a largura do texto",
    /className="tv-fade tv-anel-foco tv-mono w-fit max-w-full text-left flex items-center"/.test(APP) && /border: "1px solid " \+ T\.lineStrong, borderRadius: LADRILHO\.raio/.test(APP));
  /* 6 — o Impedido ganha marca: o ladrilho oco sem assunto desenha o círculo cortado */
  { const i = UI3.indexOf("export function LadrilhoDoAssunto("); const LAD2 = UI3.slice(i, UI3.indexOf("\n}\n", i));
    t("o Impedido sem assunto desenha ban, em inkDim", !!GLIFOS.ban && /<Glifo nome=\{glifo \|\| "ban"\}/.test(LAD2) && /cor=\{impedido \? T\.inkDim : T\.amber\}/.test(LAD2)); }
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
