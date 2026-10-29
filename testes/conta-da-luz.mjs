/* conta-da-luz.mjs — A CONTA DA LUZ AMBIENTE, uma só para as suítes que a medem.

   Nasceu dentro de teste-v1-folha.mjs (V1, 24/09) e mudou-se para aqui em T3 §4c
   (29/10), quando a luz deixou de ser uma: cada mundo troca a cor do meio
   (estilo.js, luzAmbiente e TOM_DA_CENA), e teste-genero-no-app.mjs tem de
   provar os sete tons com A MESMA conta que prova a de hoje — não com uma
   segunda, que um dia divergiria da primeira em silêncio. Não é suíte (não
   começa por teste-): é a régua que duas suítes partilham. */
import { T, AMBIENTE } from "../src/estilo.js";

/* WCAG 2.1 — luminância relativa sRGB e razão de contraste, a mesma
   fórmula de toda catraca de cor desta casa (`check-formas`, D1). */
export const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const L = (a) => 0.2126 * lin(a[0]) + 0.7152 * lin(a[1]) + 0.0722 * lin(a[2]);
export const razao = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

/* CIE Lab e ΔE76 — o limiar de diferença perceptível (Sharma, *Digital
   Color Imaging Handbook*), a régua que §4 usa para separar o corpo da
   mesa agora que a separação deixou de ser razão de luz. */
const lab = (a) => { const [r, g, b] = a.map(lin); const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b, Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883; const f = (q) => (q > 0.008856 ? Math.cbrt(q) : 7.787 * q + 16 / 116); return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))]; };
export const dE = (a, b) => { const x = lab(a), y = lab(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };

/* A COR DO CORPO NUM PONTO x (0..1) DA LARGURA: as paradas da luz
   compostas em sRGB PRÉ-MULTIPLICADO sobre o chão — é como o CSS
   interpola um `linear-gradient` com alfa, não uma média simples.
   Por omissão as paradas de `AMBIENTE` (a luz de hoje) sobre `T.pagina`
   (o poço da história); a luz de um mundo passa as suas, e a criação
   passa `T.bg`, o chão dela. */
export const ambEm = (x, P = AMBIENTE.paradas, chao = T.pagina) => {
  let i = 0; while (i < P.length - 2 && x > P[i + 1].em) i++;
  const a0 = P[i], a1 = P[i + 1], k = (x - a0.em) / (a1.em - a0.em);
  const pm0 = rgb(T[a0.token]).map((v) => v * a0.alfa), pm1 = rgb(T[a1.token]).map((v) => v * a1.alfa);
  const a = a0.alfa + (a1.alfa - a0.alfa) * k; const b = rgb(chao);
  return pm0.map((v, j) => v + (pm1[j] - v) * k + b[j] * (1 - a));
};
/* O PIOR PONTO do corpo para uma cor de letra `fg` — varrido de 0 a
   100% em passos de 1%, porque a luz ambiente não é uniforme e o piso
   tem de valer no ponto mais fraco, nunca na média. */
export const pior = (fg, P = AMBIENTE.paradas, chao = T.pagina) => { let m = 99; for (let i = 0; i <= 100; i++) m = Math.min(m, razao(rgb(fg), ambEm(i / 100, P, chao))); return m; };
/* O PONTO DO CORPO MAIS PERTO DA MESA (T.bg), em ΔE — varrido igual. */
export const corpoContraMesa = (P = AMBIENTE.paradas, chao = T.pagina) => { let m = 99; for (let i = 0; i <= 100; i++) m = Math.min(m, dE(ambEm(i / 100, P, chao), rgb(T.bg))); return m; };
