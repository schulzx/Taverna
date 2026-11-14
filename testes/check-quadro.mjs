/* check-quadro.mjs (QQ · Q4, 14/11/2026) — o varredor da peça do quadro da
   quest (formas.md §QQ 9, 1.5). O que se varre:

   1. os pares de contraste de §QQ 5, pela conta da luz (testes/conta-da-luz.mjs),
      com as transparências compostas sobre o chão onde pousam;
   2. nenhuma cor literal na peça nem na conta dela (src/painel-quadro.jsx,
      src/quadro-na-tela.js): toda a cor sai de T e das tabelas;
   3. as chaves de CARIMBO_DO_PRECO iguais às de PRECO_DA_FALHA, nos dois sentidos;
   4. nenhum nome de mecanismo no texto visível — as tabelas de palavras e o
      texto escrito no JSX (§QQ 1.7);
   5. o `juiz` das cartas (bastidor, Q2) nunca lido pela tela;
   6. os keyframes de §QQ 7, cada um com a saída no prefers-reduced-motion e a
      duração lida da tabela;
   7. as medidas de §QQ 2, 3 e 4 (a carta, os três no telefone, os alvos, o
      teto do momento abaixo dos 5 s da WCAG 2.2.2);
   8. nenhum componente definido dentro de outro (o foco do campo). */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { T, ALVOS, TIPOS, MOVIMENTO_CSS, MOVIMENTO_DO_DADO, MOLDURA_POR_DEGRAU, QUADRO_DA_TELA, CARIMBO_DO_PRECO, PALAVRAS_DO_QUADRO } from "../src/estilo.js";
import { PRECO_DA_FALHA } from "../src/quadro-da-quest.js";
import { rgb, razao } from "./conta-da-luz.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ler = (f) => readFileSync(join(RAIZ, f), "utf8");
const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
const PAINEL = semComentarios(ler("src/painel-quadro.jsx"));
const PURO = semComentarios(ler("src/quadro-na-tela.js"));
const Q = QUADRO_DA_TELA, C = Q.carta, M = Q.momento;
const OURO = MOLDURA_POR_DEGRAU.ouro, FERRO = MOLDURA_POR_DEGRAU.ferro;

/* ============================================================ */
sec("1. o contraste de §QQ 5 (WCAG 2.2)");
{
  const sobre = (fg, a, chao) => { const f = rgb(fg), c = rgb(chao); return f.map((v, i) => Math.round(v * a + c[i] * (1 - a))); };
  const r = (a, b) => razao(Array.isArray(a) ? a : rgb(a), Array.isArray(b) ? b : rgb(b));
  const pares = [
    ["a forma nas costas: inkMeio / couro", r(T.inkMeio, T.couro), 4.5],
    ["sobra e perdida: inkDim / couro", r(T.inkDim, T.couro), 4.5],
    ["o glifo no disco: inkMeio / pagina", r(T.inkMeio, T.pagina), 3],
    ["o glifo da que se vira: amberSoft / pagina", r(T.amberSoft, T.pagina), 3],
    ["o contorno do ouro / couro (1.4.11)", r(OURO.meio, T.couro), 3],
    ["o contorno do ferro / couro (1.4.11)", r(FERRO.meio, T.couro), 3],
    ["o aro da que se vira (amber 0,55 sobre o couro) / o feltro", r(sobre(C.aro.cor, C.aro.alfa, T.couro), T.bg), 3],
    ["o pavio aceso / couro", r(C.pavio.aceso, T.couro), 3],
    ["o pavio apagado / couro", r(C.pavio.apagado, T.couro), 3],
    ["o risco / couro", r(C.risco.cor, T.couro), 3],
    ["a silhueta: lineStrong / pagina 0,35 sobre o couro", r(T.lineStrong, sobre(T.pagina, C.silhueta.chao, T.couro)), 3],
    ["a face / pergaminho", r(T.tintaDoPergaminho, T.pergaminho), 4.5],
    ["o de / pergaminho", r(T.tintaDoPergaminhoDim, T.pergaminho), 4.5],
    ["o carimbo leve / pergaminho", r(Q.carimbo.cor.leve, T.pergaminho), 4.5],
    ["o carimbo pesado / pergaminho", r(Q.carimbo.cor.pesado, T.pergaminho), 4.5],
    ["a carta virada contra a gaveta: pergaminho / couro", r(T.pergaminho, T.couro), 3],
    ["o lacre / pergaminho", r(T.lacreNoPergaminho, T.pergaminho), 3],
    ["o sinal «2 de 4»: inkMeio / couro", r(T.inkMeio, T.couro), 4.5],
    ["o sinal «2/4»: ink / couro", r(T.ink, T.couro), 4.5],
    ["o sinal aceso: amberSoft / couro", r(T.amberSoft, T.couro), 4.5],
    ["o sinal completo: ok / couro", r(T.ok, T.couro), 4.5],
    ["a gota: amber / couro", r(T.amber, T.couro), 3],
    ["a pergunta: ink / couro", r(T.ink, T.couro), 4.5],
    ["a quest: amberSoft / couro", r(T.amberSoft, T.couro), 4.5],
    ["a etapa: inkDim / couro", r(T.inkDim, T.couro), 4.5],
    ["o fio de lacre (rosa 0,85) / couro", r(sobre(Q.misterio.fio.cor, Q.misterio.fio.alfa, T.couro), T.couro), 3],
    ["o caminho: verbo ink / panel", r(T.ink, T.panel), 4.5],
    ["o caminho: perícias inkMeio / panel", r(T.inkMeio, T.panel), 4.5],
    ["o caminho: custa amberSoft / panel", r(T.amberSoft, T.panel), 4.5],
    ["o aro do caminho: lineStrong / panel", r(T.lineStrong, T.panel), 3],
    ["o aro do caminho: lineStrong / couro", r(T.lineStrong, T.couro), 3],
    ["«se falhar»: danger / perigoFundo", r(T.danger, T.perigoFundo), 4.5],
    ["«se falhar»: ink / perigoFundo", r(T.ink, T.perigoFundo), 4.5],
    /* os do papel pregado (o mistério): a mesma tinta da folha */
    ["o papel: a quest brasaNoPergaminho / pergaminho", r(T.brasaNoPergaminho, T.pergaminho), 4.5],
    ["o papel: a pergunta tintaDoPergaminho / pergaminho", r(T.tintaDoPergaminho, T.pergaminho), 4.5],
  ];
  for (const [nome, v, piso] of pares) t(`${nome}: ${v.toFixed(2)} ≥ ${piso}`, v >= piso);
  t("o ferro escuro NÃO serve de contorno de fora (é só o filete de dentro): < 3 contra o couro", r(FERRO.escuro, T.couro) < 3);
}

/* ============================================================ */
sec("2. nenhuma cor literal na peça nem na conta dela");
{
  const RX = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g;
  const achados = [...(PAINEL.match(RX) || []).map((x) => `painel-quadro.jsx: ${x}`), ...(PURO.match(RX) || []).map((x) => `quadro-na-tela.js: ${x}`)];
  t("zero literais de cor (toda cor sai de T, de MOLDURA_POR_DEGRAU e de QUADRO_DA_TELA)", achados.length === 0, achados.join(" · "));
  t("a peça lê a tabela da tela e a de palavras", /QUADRO_DA_TELA/.test(PAINEL) && /PALAVRAS_DO_QUADRO/.test(PAINEL) && /QUADRO_DA_TELA/.test(PURO));
  const RX_FONTE = /fontSize:\s*(\d+)/g;
  const literais = [...PAINEL.matchAll(RX_FONTE)].map((m) => Number(m[1]));
  t("nenhuma letra abaixo do piso (TIPOS.piso)", literais.every((n) => n >= TIPOS.piso), literais.join(","));
}

/* ============================================================ */
sec("3. o carimbo e o preço têm as mesmas chaves");
{
  const a = Object.keys(CARIMBO_DO_PRECO).sort(), b = Object.keys(PRECO_DA_FALHA).sort();
  t("CARIMBO_DO_PRECO → PRECO_DA_FALHA", a.every((k) => b.includes(k)), a.filter((k) => !b.includes(k)).join(", "));
  t("PRECO_DA_FALHA → CARIMBO_DO_PRECO", b.every((k) => a.includes(k)), b.filter((k) => !a.includes(k)).join(", "));
  t("cada carimbo tem palavra, glifo e a frase de «se falhar»", Object.values(CARIMBO_DO_PRECO).every((k) => k.palavra && k.glifo && k.seFalhar));
  t("a palavra cabe na carta (§QQ 2: «A METADE» e «PARTIDO», não «PELA METADE» nem «DANIFICADO»)", Object.values(CARIMBO_DO_PRECO).every((k) => k.palavra.length <= 8));
}

/* ============================================================ */
sec("4. nenhum nome de mecanismo no texto visível (§QQ 1.7)");
{
  const PROIBIDAS = /essencia|\bextra\b|queimad|\bcaminho|\bcarta\b|\bquadro\b|pre[cç]o|\betapa/i;
  /* a exceção escrita: as duas frases que a §QQ 3 e 4 decidiram com
     «caminho» em mundo (o que se fecha). A contradição com a §QQ 1.7 está
     dita ao desenho; até ele decidir, valem estas duas e nenhuma outra. */
  const DECIDIDAS = new Set([PALAVRAS_DO_QUADRO.fecha, PALAVRAS_DO_QUADRO.leitor.fechou]);
  const escritos = [];
  const juntar = (o) => { for (const v of Object.values(o)) typeof v === "string" ? escritos.push(v) : v && typeof v === "object" ? juntar(v) : null; };
  juntar(PALAVRAS_DO_QUADRO);
  for (const k of Object.values(CARIMBO_DO_PRECO)) escritos.push(k.palavra, k.seFalhar);
  const maus = escritos.filter((s) => !DECIDIDAS.has(s) && PROIBIDAS.test(s));
  t(`as ${escritos.length} palavras das tabelas`, maus.length === 0, maus.join(" | "));
  /* o texto escrito à mão no JSX: os filhos de texto entre tags, e os rótulos literais */
  /* texto de filho: sem sinais de código (= ; ( ) ? : & |), que entre um «>» de
     comparação e um «<» de tag apanhariam código */
  const doJsx = [...PAINEL.matchAll(/>([^<>{}=;()?:&|]*[A-Za-zÀ-ú✕][^<>{}=;()?:&|]*)</g)].map((m) => m[1].trim()).filter(Boolean);
  const rotulos = [...PAINEL.matchAll(/aria-label="([^"]+)"/g)].map((m) => m[1]);
  const mausJsx = [...doJsx, ...rotulos].filter((s) => PROIBIDAS.test(s));
  t(`o texto escrito no JSX (${doJsx.length + rotulos.length} pedaços)`, mausJsx.length === 0, mausJsx.join(" | "));
  t("e o JSX não escreve texto de mundo à mão (sai das tabelas ou do motor)", doJsx.every((s) => /^[✕\s]*$/.test(s)), doJsx.join(" | "));
}

/* ============================================================ */
sec("5. o juiz é bastidor");
{
  t("a peça nunca lê `juiz`", !/\bjuiz\b/.test(PAINEL));
  t("a conta da tela nunca lê `juiz`", !/\bjuiz\b/.test(PURO));
  t("nem `escreve` (o átomo do livro, com o nome de verdade)", !/\.escreve\b/.test(PAINEL) && !/\.escreve\b/.test(PURO));
}

/* ============================================================ */
sec("6. os keyframes de §QQ 7");
{
  const CLASSES = ["tv-pista-sobe", "tv-pista-treme", "tv-pista-carimbo", "tv-pista-carimbo-pesado", "tv-pista-voa", "tv-pavio-apaga", "tv-pista-risca", "tv-sinal-acende"];
  const KF = ["tvPistaSobe", "tvPistaTreme", "tvPistaCarimbo", "tvPistaVoa", "tvPavioApaga", "tvPistaRisca", "tvSinalAcende"];
  t("os sete keyframes existem", KF.every((k) => MOVIMENTO_CSS.includes(`@keyframes ${k} `)), KF.filter((k) => !MOVIMENTO_CSS.includes(`@keyframes ${k} `)).join(", "));
  const iMedia = MOVIMENTO_CSS.indexOf("@media (prefers-reduced-motion");
  const antes = MOVIMENTO_CSS.slice(0, iMedia), dentro = MOVIMENTO_CSS.slice(iMedia);
  const RX = (c) => new RegExp(`\\.${c}\\s*\\{[^}]*animation:`);
  t("as oito classes animam ANTES do primeiro @media (onde o check-formas as mede)", CLASSES.every((c) => RX(c).test(antes)), CLASSES.filter((c) => !RX(c).test(antes)).join(", "));
  const saida = (c) => new RegExp(`\\.${c}\\b[^{]*\\{[^}]*animation:\\s*none`).test(dentro);
  t("e cada uma tem a saída no prefers-reduced-motion", CLASSES.every(saida), CLASSES.filter((c) => !saida(c)).join(", "));
  t("as durações saem da tabela", antes.includes(`tvPistaSobe ${M.sobe.dura}ms`) && antes.includes(`tvPistaTreme ${M.treme.dura}ms`) && antes.includes(`tvPistaVoa ${M.voa.dura}ms`)
    && antes.includes(`tvPavioApaga ${M.pavio.apaga}ms`) && antes.includes(`tvPistaRisca ${M.pavio.risca}ms`) && antes.includes(`tvSinalAcende ${Q.sinal.acende}ms`)
    && antes.includes(`tvPistaCarimbo ${M.carimbo.dura}ms`) && antes.includes(`tvPistaCarimbo ${M.carimbo.misterio.dura}ms`));
  t("a viragem reutiliza a do espólio (tv-carta-vira-a / -b)", /tv-carta-vira-a/.test(PAINEL) && /tv-carta-vira-b/.test(PAINEL) && !/tvPistaVira/.test(MOVIMENTO_CSS));
  t("com reduce, a carta entra e sai em 120 de opacidade (só dentro do @media)", /\.tv-pista-aparece\s*\{[^}]*tvCerimoniaEsvai 120ms/.test(dentro) && !/\.tv-pista-aparece/.test(antes));
}

/* ============================================================ */
sec("7. as medidas");
{
  t("a carta: 108 × 148, raio 8", C.lado === 108 && C.alto === 148 && C.raio === 8);
  t("três cartas cabem na linha do telefone (343)", 3 * C.lado + 2 * Q.gaveta.grade.telefone <= 343);
  t("a face leva 88 px de letra", C.lado - 2 * C.enchimento === 88);
  t("o caminho e o sinal têm o alvo da casa (≥ 48)", Q.caminho.alto >= ALVOS.piso && Q.sinal.alvo >= ALVOS.piso && ALVOS.piso >= 48);
  t("o sinal tem 82 × 48 na mesa e 60 × 48 no telefone", /sinal:\s*\{\s*mesa:\s*82,\s*telefone:\s*60\s*\}/.test(PAINEL));
  t("a letra da face e do de no piso ou acima", C.face.tamanho >= TIPOS.piso && C.de.tamanho >= TIPOS.piso && Q.carimbo.letra >= TIPOS.piso);
  t("o momento acaba antes dos 5 s da WCAG 2.2.2 (teto 4,5 s)", M.teto <= 4500 && M.teto < 5000);
  t("o tempo de ler: 250 por palavra, piso 1 200, teto 3 000", M.leitura.porPalavra === 250 && M.leitura.piso === 1200 && M.leitura.teto === 3000);
  t("o reduce é o semMovimento do dado (uma régua)", M.reduzido === MOVIMENTO_DO_DADO.semMovimento);
  t("a gaveta dura o mesmo que a do horizonte", typeof Q.gaveta.dura === "number" && Q.gaveta.dura > 0);
}

/* ============================================================ */
sec("8. nenhum componente nasce dentro de outro");
{
  const dentro = PAINEL.split("\n").filter((l) => /^\s+(function\s+[A-Z]|const\s+[A-Z][A-Za-z]+\s*=\s*\(\s*\{)/.test(l));
  t("todo componente é definido no topo do módulo", dentro.length === 0, dentro.join(" | "));
  const exportadas = [...PAINEL.matchAll(/^export function ([A-Z]\w+)/gm)].map((m) => m[1]);
  t("as peças de §QQ 9 existem", ["CartaDePista", "CarimboDoPreco", "SinalDoQuadro", "CaminhosDaCarta", "GavetaDoQuadro", "PistaQueVira"].every((n) => exportadas.includes(n)), exportadas.join(", "));
}

console.log(`\n${ok} ok · ${mal} falhas`);
if (mal) process.exit(1);
