/* A FOGUEIRA (F1, Fase MM-C · C6) — a tabela e o painel que a desenha

   Esta suíte não monta React: `painel-fogueira.jsx` é tela, e tela se
   olha (`CLAUDE.md`). O que se prova aqui é o que a tela LÊ — a tabela
   `FOGUEIRA` (`estilo.js`), a folha que a anima, e o texto do painel nos
   pontos onde um descuido mentiria calado: uma cor nova solta, um nome de
   mecanismo na tela, uma animação sem saída, um componente nascido dentro
   do render. A forma está em `mente/formas.md` § Fogueira.
*/
import { readFileSync } from "node:fs";

const RAIZ = "../src/";
const { T, ALVOS, FOGUEIRA, VERBO_COM_PRECO, MOVIMENTO_CSS } = await import(RAIZ + "estilo.js");
const PAINEL = readFileSync(new URL(RAIZ + "painel-fogueira.jsx", import.meta.url), "utf8");
const UI = readFileSync(new URL(RAIZ + "ui.jsx", import.meta.url), "utf8");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* o contraste da norma (WCAG 2.1, 1.4.3 e 1.4.11) */
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

/* o texto sem comentários — o contrato no topo do painel cita, de propósito,
   as palavras que a tela nunca diz */
const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const CODIGO = semComentarios(PAINEL);

sec("1. A tabela: o que é igual a T é T, e uma cor nova só");
{
  t("chama = T.amber", FOGUEIRA.chama === T.amber);
  t("cerne = T.amberSoft", FOGUEIRA.cerne === T.amberSoft);
  t("clarão = T.amber", FOGUEIRA.clarao === T.amber);
  t("lenha = T.panelSoft", FOGUEIRA.lenha === T.panelSoft);
  t("fio da lenha = T.lineStrong", FOGUEIRA.lenhaFio === T.lineStrong);
  t("escolhido = T.rosa (a tua mão)", FOGUEIRA.escolhido === T.rosa);
  /* a receita do desenho (panel + 10 % de âmbar) feita conta: se o âmbar ou
     o panel mudarem, ESTA linha é a que avisa que o nó do Figma ficou para trás */
  t("lugarAceso = #31252D (panel + 10 % de âmbar, a cor do nó)", FOGUEIRA.lugarAceso === "#31252D", FOGUEIRA.lugarAceso);
  t("claraoCentro = 0,2 (o código guarda 0,2; a variável do Figma guarda 20)", FOGUEIRA.claraoCentro === 0.2);
  t("§3: lugar 176 / 56, brasa 20, fogo 132 / 48, raio 12, até 5",
    FOGUEIRA.lugar.mesa === 176 && FOGUEIRA.lugar.baixa === 56 && FOGUEIRA.brasa === 20
    && FOGUEIRA.fogo.mesa === 132 && FOGUEIRA.fogo.baixa === 48 && FOGUEIRA.raio === 12 && FOGUEIRA.lugaresMax === 5);
  t("o lugar da Baixa é alvo (≥ ALVOS.piso)", FOGUEIRA.lugar.baixa >= ALVOS.piso);
}

sec("2. A roda: as posições por contagem, na ordem dos papéis");
{
  const ns = Object.keys(FOGUEIRA.lugares).map(Number).sort((a, b) => a - b);
  t("há posições de 1 até lugaresMax, nem mais nem menos", ns.join(",") === Array.from({ length: FOGUEIRA.lugaresMax }, (_, i) => i + 1).join(","));
  for (const n of ns) {
    const pos = FOGUEIRA.lugares[n];
    t(`${n} lugar(es): ${n} posições`, pos.length === n);
    t(`${n}: as frações crescem da esquerda para a direita (a ordem não troca de dono)`, pos.every(([fx], i) => i === 0 || fx > pos[i - 1][0]));
    t(`${n}: a roda é simétrica (o espelho de cada lugar existe)`, pos.every(([fx, y], i) => {
      const [gx, gy] = pos[n - 1 - i]; return Math.abs(fx + gx - 1) < 1e-9 && y === gy;
    }));
    t(`${n}: todo lugar cabe na altura da roda`, pos.every(([, y]) => y >= 0 && y + FOGUEIRA.lugarMesa.altura <= FOGUEIRA.roda.altura));
  }
  t("o fogo cabe na roda", FOGUEIRA.roda.fogoY + FOGUEIRA.fogo.mesa <= FOGUEIRA.roda.altura);
}

sec("3. O contraste que o desenho mediu (§4)");
{
  const casos = [
    ["ink / lugarAceso", T.ink, FOGUEIRA.lugarAceso, 4.5],
    ["inkMeio / lugarAceso (o gesto de quem tem o que dizer)", T.inkMeio, FOGUEIRA.lugarAceso, 4.5],
    ["inkDim / lugarAceso (o atalho)", T.inkDim, FOGUEIRA.lugarAceso, 4.5],
    ["inkDim / panel (o gesto de quem está calado)", T.inkDim, T.panel, 4.5],
    ["amberSoft / pagina (a etiqueta da voz)", T.amberSoft, T.pagina, 4.5],
    ["onAccent / amber (o Dormir armado)", T.onAccent, T.amber, 4.5],
    ["lineStrong / lugarAceso (o fio do lugar — gráfico)", T.lineStrong, FOGUEIRA.lugarAceso, 3],
    ["lineStrong / panel (o fio do lugar calado — gráfico)", T.lineStrong, T.panel, 3],
    ["rosa / lugarAceso (o escolhido — gráfico)", FOGUEIRA.escolhido, FOGUEIRA.lugarAceso, 3],
  ];
  for (const [nome, a, b, piso] of casos) {
    const c = contraste(a, b);
    t(`${nome}: ${c.toFixed(2)} ≥ ${piso}`, c >= piso);
  }
}

sec("4. O sistema não fala de si (§6) e a cor não nasce solta");
{
  const PROIBIDAS = ["batida", "ficha", "núcleo", "nucleo", "papel", "subtrama", "romance", "afinidade", "pedido"];
  /* só os literais de string do código — o que pode chegar à tela */
  const literais = [...CODIGO.matchAll(/"([^"\n]*)"/g)].map((m) => m[1]);
  const achadas = literais.filter((l) => PROIBIDAS.some((p) => new RegExp("\\b" + p + "\\b", "i").test(l)));
  t("nenhuma palavra de mecanismo num literal do painel", achadas.length === 0, achadas.join(" | "));
  t("nenhuma cor literal no painel (tudo de T ou FOGUEIRA)", !/#[0-9a-fA-F]{3,8}\b/.test(CODIGO), (CODIGO.match(/#[0-9a-fA-F]{3,8}\b/g) || []).join(", "));
  t("o painel lê FOGUEIRA de estilo.js", /import \{[^}]*\bFOGUEIRA\b[^}]*\} from "\.\/estilo\.js"/.test(PAINEL));
}

sec("5. Componentes fora do render (o foco) e o contrato no topo");
{
  /* todo componente (nome com maiúscula) nasce na coluna 0 — um `function X`
     indentado é um componente dentro de outro, e mata o foco */
  /* (um componente tem nome de Maiúscula seguida de minúscula: `LM`, `D`, `G`
     são as tabelas locais de medida, não componentes) */
  const dentro = [...CODIGO.matchAll(/^[ \t]+(?:function ([A-Z][a-z]\w*)|const ([A-Z][a-z]\w*) = (?:\(|React\.|function))/gm)].map((m) => m[1] || m[2]);
  t("nenhum componente declarado dentro de outro", dentro.length === 0, dentro.join(", "));
  t("PainelFogueira é exportado", /^export function PainelFogueira\(/m.test(PAINEL));
  for (const prop of ["roda", "abertura", "fala", "escolha", "aguentaNoite", "portaAberta", "manha", "escolhido", "formato", "aoSentar", "aoEscolher", "aoDormir", "aoFicar"]) {
    t(`o contrato no topo diz \`${prop}\`, e o painel recebe-o`, PAINEL.slice(0, PAINEL.indexOf("import React")).includes(prop) && new RegExp("\\b" + prop + "\\b").test(CODIGO));
  }
}

sec("6. O alvo, o foco e o que é decorativo");
{
  t("o lugar é <button> com o anel da casa", /<button ref=\{ref\}[\s\S]{0,400}tv-anel-foco/.test(CODIGO));
  t("o lugar diz o nome e o gesto no aria-label", /aria-label=\{rotulo\}/.test(CODIGO) && /PALAVRAS\.sentar/.test(CODIGO));
  t("a altura mínima sai de ALVOS.piso, nunca de soma de enchimento", /minHeight: mesa \? LM\.altura : ALVOS\.piso/.test(CODIGO));
  t("o fogo é aria-hidden e não segura clique", /function OFogo[\s\S]{0,900}aria-hidden="true"[\s\S]{0,200}pointerEvents: "none"/.test(CODIGO));
  t("a brasa é aria-hidden (é forma, a palavra está no nome acessível)", /function Brasa[\s\S]{0,400}aria-hidden="true"/.test(CODIGO));
  t("os atalhos nunca roubam a tecla de um campo de escrever", /deEscrever\(e\.target\)/.test(CODIGO));
  t("o handler das teclas não pode custar o turno (try/catch)", /const aoTeclar = \(e\) => \{\s*try \{/.test(CODIGO));
}

sec("7. O movimento (§5): tudo da tabela, e tudo com saída");
{
  const M = FOGUEIRA.movimento;
  t("a entrada é 240, o passo 60, o teto 300", M.entra === 240 && M.passo === 60 && M.tetoDoPasso === 300);
  t("a chama respira 2,4 s entre 0,96 e 1,04", M.respira === 2400 && M.respiraMin === 0.96 && M.respiraMax === 1.04);
  t("o escolhido vira o retrato grande em 200", M.vira === 200);
  const iMedia = MOVIMENTO_CSS.lastIndexOf("@media (prefers-reduced-motion");
  const antes = MOVIMENTO_CSS.slice(0, iMedia), depois = MOVIMENTO_CSS.slice(iMedia);
  for (const c of ["tv-fogueira-entra", "tv-fogueira-lugar", "tv-fogueira-chama", "tv-fogueira-faisca", "tv-fogueira-vira"]) {
    t(`.${c} anima, e tem saída no reduced-motion`, antes.includes("." + c + " {") && depois.includes("." + c));
    t(`o painel usa .${c}`, CODIGO.includes(c));
  }
  t("as durações na folha são as da tabela", antes.includes(`tvFogueiraRespira ${M.respira}ms`) && antes.includes(`tvFogueiraEntra ${M.entra}ms`) && antes.includes(`tvFogueiraVira ${M.vira}ms`));
}

sec("8. O verbo com preço: a peça sobe a ui.jsx, com a sua tabela");
{
  t("VerboComPreco mora em ui.jsx e é exportado", /^export function VerboComPreco\(/m.test(UI));
  t("o painel usa o VerboComPreco de ui.jsx (uma ação, uma forma)", /import \{[^}]*\bVerboComPreco\b[^}]*\} from "\.\/ui\.jsx"/.test(PAINEL));
  t("a altura do verbo é ALVOS.piso", /function VerboComPreco[\s\S]{0,900}minHeight: ALVOS\.piso/.test(UI));
  t("as medidas do nó 64:2446: 14 · 6 · 10 · 1 · raio 8",
    VERBO_COM_PRECO.lado === 14 && VERBO_COM_PRECO.cima === 6 && VERBO_COM_PRECO.entre === 10 && VERBO_COM_PRECO.palavras === 1 && VERBO_COM_PRECO.raio === 8);
  t("o armado veste onAccent sobre o âmbar", /function VerboComPreco[\s\S]{0,700}armado \? T\.onAccent : T\.inkDim/.test(UI));
}

console.log(`\n${bons} ok, ${maus} falha(s)`);
if (maus) process.exit(1);
