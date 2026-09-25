/* teste-v1-folha.mjs — V1 · a folha da v3 (24/09/2026, `desenho`/`aprendiz`)

   A catraca de R2 refeita para os valores novos de `T` e para a luz
   ambiente que a v3 põe sobre o corpo da história. A decisão e o
   porquê de cada número estão em `mente/formas.md` §V ("V1 · a folha
   da v3") e em `mente/v1-desenho.md` §7; aqui só a prova.

   Lê `T`, `AMBIENTE`, `ESBATIMENTO`, `FOLHA` de `../src/estilo.js` —
   nada de React, tudo em Node, como toda suíte desta casa. */
import { T, AMBIENTE, ESBATIMENTO, FOLHA, alfa } from "../src/estilo.js";

let ok = 0, mal = 0;
const t = (n, c, d = "") => { if (c) { ok++; console.log("  ok  " + n); } else { mal++; console.log("  XX  " + n + (d ? "\n      " + d : "")); } };

/* WCAG 2.1 — luminância relativa sRGB e razão de contraste, a mesma
   fórmula de toda catraca de cor desta casa (`check-formas`, D1). */
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const L = (a) => 0.2126 * lin(a[0]) + 0.7152 * lin(a[1]) + 0.0722 * lin(a[2]);
const razao = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

/* CIE Lab e ΔE76 — o limiar de diferença perceptível (Sharma, *Digital
   Color Imaging Handbook*), a régua que §4 usa para separar o corpo da
   mesa agora que a separação deixou de ser razão de luz. */
const lab = (a) => { const [r, g, b] = a.map(lin); const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b, Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883; const f = (q) => (q > 0.008856 ? Math.cbrt(q) : 7.787 * q + 16 / 116); return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))]; };
const dE = (a, b) => { const x = lab(a), y = lab(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };

/* A COR DO CORPO NUM PONTO x (0..1) DA LARGURA: as paradas de `AMBIENTE`
   compostas em sRGB PRÉ-MULTIPLICADO sobre `T.pagina` — é como o CSS
   interpola um `linear-gradient` com alfa, não uma média simples. */
const ambEm = (x) => {
  const P = AMBIENTE.paradas; let i = 0; while (i < P.length - 2 && x > P[i + 1].em) i++;
  const a0 = P[i], a1 = P[i + 1], k = (x - a0.em) / (a1.em - a0.em);
  const pm0 = rgb(T[a0.token]).map((v) => v * a0.alfa), pm1 = rgb(T[a1.token]).map((v) => v * a1.alfa);
  const a = a0.alfa + (a1.alfa - a0.alfa) * k; const b = rgb(T.pagina);
  return pm0.map((v, j) => v + (pm1[j] - v) * k + b[j] * (1 - a));
};
/* O PIOR PONTO do corpo para uma cor de letra `fg` — varrido de 0 a
   100% em passos de 1%, porque a luz ambiente não é uniforme e o piso
   tem de valer no ponto mais fraco, nunca na média. */
const pior = (fg) => { let m = 99; for (let i = 0; i <= 100; i++) m = Math.min(m, razao(rgb(fg), ambEm(i / 100))); return m; };

/* ============================================================
   1. OS 37 PARES — a catraca de R2 refeita com os nomes de `T` (onde
      R2 dizia `chao`/`chaoAlto`/`borda`/`bordaViva` é `panel`/
      `panelSoft`/`line`/`lineStrong`).

      MENOS "a página × a mesa ≥ 1,5": R2 separava a página da mesa por
      LUZ porque a página era a figura; na v3 o poço é mais escuro que
      a mesa e a separação vira ΔE (assert 4, abaixo) — não é mais um
      par de razão de contraste.
      MENOS o duplicado: `inkDim`×`panel` aparecia duas vezes em R2
      ("rótulo do HUD" e "placeholder"), o mesmo par com dois nomes.
      MAIS sete, os que a v3 obriga: `paginaFio`×`pagina` (o contorno
      do cartão — em V1b trocado por `lineStrong`×`pagina`, a borda do que
      se toca na página, quando `paginaFio` se aposentou), `rosa`×`bg`/`rosa`×`panelSoft` (a marca nasce nesta
      etapa), `violet`×`panelSoft` (é a razão de o violeta ter subido
      de `#9B5DE5` para `#AC79E9`), e os três chips da página —
      `danger`/`amberSoft`/`inkMeio` × `paginaAlta`.

      Pisos: 4,5 para letra (AA texto pequeno), 3 para borda/marca
      (1.4.11, não-texto).
   ============================================================ */
const PARES = [
  ["ink", "pagina", 4.5], ["ink", "paginaAlta", 4.5], ["inkMeio", "pagina", 4.5], ["amber", "pagina", 4.5],
  ["inkDim", "panel", 4.5], ["inkDim", "panelSoft", 4.5], ["inkDim", "bg", 4.5], ["ink", "panelSoft", 4.5],
  ["mundo", "panel", 4.5], ["mundo", "panelSoft", 4.5], ["onAccent", "amber", 4.5], ["onSecond", "violet", 4.5],
  ["onMundo", "mundo", 4.5], ["amberSoft", "panel", 4.5], ["violetSoft", "panel", 4.5], ["ink", "panel", 4.5],
  ["ok", "okFundo", 4.5], ["danger", "perigoFundo", 4.5], ["danger", "panel", 4.5], ["danger", "pagina", 4.5],
  ["ok", "panel", 4.5], ["mundo", "pagina", 4.5], ["lineStrong", "bg", 3], ["lineStrong", "panel", 3],
  ["lineStrong", "panelSoft", 3], ["lineStrong", "pagina", 3], ["amber", "bg", 3], ["violet", "bg", 3],
  ["mundo", "bg", 3], ["danger", "bg", 3], ["rosa", "bg", 3], ["rosa", "panelSoft", 3],
  ["violet", "panelSoft", 4.5], ["danger", "paginaAlta", 4.5], ["amberSoft", "paginaAlta", 4.5], ["inkMeio", "paginaAlta", 4.5],
];
const mal1 = PARES.filter(([a, b, p]) => !(razao(rgb(T[a]), rgb(T[b])) >= p)).map(([a, b, p]) => `${a}×${b} ${razao(rgb(T[a]), rgb(T[b])).toFixed(2)} < ${p}`);
t(`os ${PARES.length} pares da catraca passam`, mal1.length === 0, mal1.join(" | "));

/* ============================================================
   2. A PROSA no pior ponto do ambiente ≥ AMBIENTE.pisos.prosa (7, o
      piso AAA que a legenda da gravura tinha — aposentada em V5a). A prosa é a protagonista
      da tela — uma luz decorativa por cima dela não pode empurrá-la
      para perto do piso AA (4,5); ela tem de sobrar até AAA mesmo no
      ponto mais fraco do gradiente.
   ============================================================ */
t(`a prosa no pior ponto do ambiente ≥ ${AMBIENTE.pisos.prosa} (${pior(T.ink).toFixed(2)})`, pior(T.ink) >= AMBIENTE.pisos.prosa);

/* 3. inkMeio e inkDim (a segunda voz e o rótulo da máquina) no pior
      ponto do ambiente ≥ 4,5 — o piso AA comum de texto pequeno, o
      mesmo que todo o resto da paleta cumpre. */
t(`inkMeio e inkDim no pior ponto ≥ 4,5 (${pior(T.inkMeio).toFixed(2)} / ${pior(T.inkDim).toFixed(2)})`, pior(T.inkMeio) >= 4.5 && pior(T.inkDim) >= 4.5);

/* ============================================================
   4. O CORPO DISTINGUE-SE DA MESA em todo ponto — ΔE76(corpo(x), T.bg)
      ≥ AMBIENTE.pisos.corpoContraMesa.

      MOTIVO A ESCREVER, porque é uma asserção de R2 que muda de forma
      e não só de número: R2 separava a página da mesa por LUZ (1,43:1)
      porque a página era a figura. Na v3 a figura é a prosa — o poço é
      mais escuro que a mesa, e o que o separa é o matiz do ambiente e
      o contorno. O piso passa de razão de luz a diferença perceptível
      (ΔE).
   ============================================================ */
let dmin = 99; for (let i = 0; i <= 100; i++) dmin = Math.min(dmin, dE(ambEm(i / 100), rgb(T.bg)));
t(`o corpo distingue-se da mesa em todo ponto (ΔE ${dmin.toFixed(2)} ≥ ${AMBIENTE.pisos.corpoContraMesa})`, dmin >= AMBIENTE.pisos.corpoContraMesa);

/* 5. Toda parada de AMBIENTE aponta para um token que existe em T — a
      luz segue a paleta por NOME, nunca por hex solto; se um nome
      escrever errado ou uma cor sair de T, esta asserção apanha antes
      do gradiente nascer com "undefined" dentro. */
t("o ambiente só usa tokens de T", AMBIENTE.paradas.every((p) => typeof T[p.token] === "string"));

/* 6. T.paginaAlta === T.panelSoft (de propósito: a v3 tem uma escada
      só, fria, de quatro degraus — poço, mesa, cinta, erguido — e a
      página deixa de ser uma segunda família de superfície).
      A ASSERÇÃO MUDOU EM V1b (25/09), E O MOTIVO FICA: ela pedia
      `paginaFio !== line` porque o fio fazia dois trabalhos — contorno
      decorativo e borda de controlo — e não podia descer a `line` sem
      tirar os 3:1 aos chips. V1b separou-os no `App.jsx` (o cartão a
      `line`, o que se toca a `lineStrong`), e `paginaFio` aposentou-se.
      O que ela guarda agora é que ele NÃO volta: um terceiro fio seria
      outra vez uma cor com dois trabalhos. O par `lineStrong`×`pagina`
      entrou na catraca de cima no lugar dos dois de `paginaFio`. */
t("paginaAlta = panelSoft, e paginaFio aposentado (V1b)", T.paginaAlta === T.panelSoft && T.paginaFio === undefined);
/* 6b. `alfa` é pública desde V1b e é a conta que se espera: a rosa a 0,15 do
       "Continuar aventura" sai daqui, e não de um rgba() escrito à mão. */
t("alfa(T.rosa, 0.15) é a rosa a 0,15", alfa(T.rosa, 0.15) === "rgba(241,91,181,0.15)", alfa(T.rosa, 0.15));

/* ============================================================
   7. ESBATIMENTO.alfaAA É A CONTA DE HOJE (±0,01) — o alfa em que
      T.ink sobre o pior ponto do corpo cai a 4,5. Uma tabela que se
      RECALCULA não se afina à mão: foi exatamente a falta disto que
      deixou os 0,54 de R15 envelhecerem em silêncio até esta etapa —
      a paleta mudou de valores duas vezes desde então e o número
      nunca foi refeito, só copiado. Esta asserção existe para que a
      próxima paleta não repita o mesmo apodrecimento.
   ============================================================ */
let aAA = 1; for (let x = 0; x <= 1.0001; x += 0.005) { const c = ambEm(0.55).map((v, j) => rgb(T.ink)[j] * x + v * (1 - x)); if (razao(c, ambEm(0.55)) >= 4.5) { aAA = x; break; } }
t(`ESBATIMENTO.alfaAA é a conta de hoje (${aAA.toFixed(3)} ≈ ${ESBATIMENTO.alfaAA})`, Math.abs(aAA - ESBATIMENTO.alfaAA) <= 0.01);

/* 8. A folha PINTA o ambiente no corpo da história — .tv-esbate-topo
      ganha background-image antes da máscara, com a primeira parada
      (âmbar a 0,063 em 0%) exatamente como o Figma mede. Se a regra
      certa não existir, ou a ordem das propriedades mudar, o gradiente
      nunca chega à tela e as seis contas acima ficam provando um
      número que ninguém vê. */
t("a folha pinta o ambiente no corpo da história", /\.tv-esbate-topo \{\s*background-image: linear-gradient\(to right, rgba\(255,176,58,0\.063\) 0%/.test(FOLHA));

console.log(`\nv1-folha: ${ok} passaram, ${mal} falharam`); process.exit(mal ? 1 : 0);
