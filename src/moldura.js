/* ============================================================
   A MOLDURA VIVA (AAA · 05/11/2026) — o nível vê-se à volta do rosto

   A porta, para código, de mente/figma/aaa-geometria.mjs: a mesma fonte
   que montou os componentes no Figma (página 250:2) e que escreveu as
   tabelas de formas.md §AAA §7. Lá devolvia strings SVG; aqui devolve
   PEÇAS — [tag, atributos, filhos] — que src/painel-moldura.jsx pinta com
   React. Puro: nenhum React, provável em Node (teste-molduras-vivas.mjs).

   AS DUAS CONTAS QUE DECIDEM A CARA:
   · degrauDaMoldura(nivel): ferro 1–4, bronze 5–9, prata 10–14, ouro 15+
     (o primeiro degrau cujo `ate` >= nível, MOLDURA_POR_DEGRAU). Cada
     degrau SOMA camadas — o degrau novo é uma forma nova (WCAG 1.4.1).
   · gemaDe(pers): a pedra da subclasse (GEMA_DA_SUBCLASSE), pela
     subclasseDoHeroi de marca-da-subclasse.js — a da árvore, ou a da
     criação na classe de origem. Sem subclasse, o engaste fica vazio.

   A GEOMETRIA é a de formas.md §AAA §8, número a número: o aro mede 80 u
   (centro 50,50), e a caixa de cada forma (VB_DA_MOLDURA) soma o
   transbordo. As peças saem em DUAS camadas, para o Anel da cinta poder
   meter o arco de vida (que é jogo) entre elas: `abaixo` (aura, asas,
   chifres, espinhos, chamas, o aro de metal) e `acima` (o fio do lado, as
   folhas, os rebites, a gema, o selo, o disco).
   ============================================================ */
import {
  MOLDURA_POR_DEGRAU, MOLDURA_DO_INIMIGO, LADO_DA_MOLDURA, DISCO_DE_NIVEL,
  PECAS_DA_MOLDURA, VB_DA_MOLDURA, GEMA_DA_SUBCLASSE, ESTADOS_DA_MOLDURA,
} from "./estilo.js";
import { subclasseDoHeroi } from "./marca-da-subclasse.js";

/* ---------------- as duas contas ---------------- */

export function degrauDaMoldura(nivel) {
  const n = Math.max(1, Math.floor(Number(nivel) || 1));
  for (const [nome, d] of Object.entries(MOLDURA_POR_DEGRAU)) if (n <= d.ate) return nome;
  return "ouro";
}

export function gemaDe(pers) {
  try {
    const sub = subclasseDoHeroi(pers);
    return (sub && GEMA_DA_SUBCLASSE[sub]) || null;
  } catch (e) { return null; }
}

/* Tudo o que a moldura de uma pessoa precisa saber dela, de uma vez: o
   degrau, a gema e o selo (a especialização da classe de origem). Nunca
   lança — uma ficha torta dá a moldura de ferro vazia, não uma cena caída. */
export function molduraDe(ente, lado = "heroi") {
  const p = ente && typeof ente === "object" ? ente : {};
  const nivel = Math.max(1, Math.floor(Number(p.nivel) || 1));
  let selo = false;
  try { selo = !!(p.especializacoes && p.classe && p.especializacoes[p.classe]); } catch (e) { selo = false; }
  return { degrau: degrauDaMoldura(nivel), lado: LADO_DA_MOLDURA[lado] ? lado : "heroi", gema: gemaDe(p), selo, nivel };
}

/* ---------------- a geometria (formas.md §AAA §8) ---------------- */

const R = Math.PI / 180;
const q = (n) => Math.round(n * 100) / 100;
/* ângulo em graus, horário a partir do topo */
const pol = (a, r, cx = 50, cy = 50) => [q(cx + r * Math.sin(a * R)), q(cy - r * Math.cos(a * R))];
const anelD = (cx, cy, r) => `M${q(cx - r)} ${cy}a${r} ${r} 0 1 0 ${q(2 * r)} 0a${r} ${r} 0 1 0 ${q(-2 * r)} 0Z`;

/* as formas locais (apontam para cima, base na origem) */
const FOLHA = "M0 0Q3.2-4.6 0-10Q-3.2-4.6 0 0Z";
const CHAMA = "M0 0C-4.6-2-4.8-8.5 0-16C.6-11 4.6-9.4 3.6-4.2C3.1-1.6 1.6 0 0 0Z";
const PENA = (L) => `M0 0C2.8-3.2 3.6-${q(L * 0.55)} 0-${L}C-1.8-${q(L * 0.6)}-1.8-3 0 0Z`;
const CHIFRE = "M0 0C6-6 9-14 6-24C4-15 0-9-5-4Z";

const defs = (m, id) => ["defs", {}, [
  ["linearGradient", { id: id + "-m", x1: 0, y1: 0, x2: 1, y2: 1 }, [
    ["stop", { offset: 0, stopColor: m.claro }],
    ["stop", { offset: 0.45, stopColor: m.meio }],
    ["stop", { offset: 1, stopColor: m.escuro }],
  ]],
  ["radialGradient", { id: id + "-au" }, [
    ["stop", { offset: 0, stopColor: m.brilho, stopOpacity: 0.55 }],
    ["stop", { offset: 1, stopColor: m.brilho, stopOpacity: 0 }],
  ]],
]];

const usa = (d, x, y, rot, fill, extra = "") => ["path", { d, transform: `translate(${x} ${y}) rotate(${q(rot)})${extra}`, fill }];

/* a gema: engaste de metal, o furo, e a pedra com luz, sombra e brilho */
function gema(cx, cy, r, g, m, M, acende = false) {
  const s = [
    ["circle", { cx, cy, r: q(r + 2.4), fill: M, stroke: m.escuro, strokeWidth: 0.8 }],
    ["circle", { cx, cy, r: q(r + 0.6), fill: PECAS_DA_MOLDURA.engaste }],
  ];
  if (!g) return [...s, ["circle", { cx, cy, r: q(r - 1), fill: "none", stroke: PECAS_DA_MOLDURA.furo, strokeWidth: 0.8 }]];
  const k = (a, b) => `${q(cx + r * a)} ${q(cy + r * b)}`;
  return [...s, ["g", { className: acende ? "tv-moldura-gema" : undefined, "data-gema": g.pedra }, [
    ["circle", { cx, cy, r, fill: g.corpo }],
    ["path", { d: `M${k(-0.78, -0.15)}A${q(r * 0.82)} ${q(r * 0.82)} 0 0 1 ${k(0.15, -0.78)}Q${k(-0.25, -0.45)} ${k(-0.78, -0.15)}Z`, fill: g.luz }],
    ["path", { d: `M${k(0.9, 0.2)}A${q(r * 0.92)} ${q(r * 0.92)} 0 0 1 ${k(-0.2, 0.9)}Q${k(0.45, 0.5)} ${k(0.9, 0.2)}Z`, fill: g.sombra }],
    ["circle", { cx: q(cx - r * 0.38), cy: q(cy - r * 0.42), r: q(r * 0.2), fill: PECAS_DA_MOLDURA.reflexo, fillOpacity: 0.9 }],
  ]]];
}
/* o selo da especialização: losango de metal, miolo na cor da gema */
function selo(cx, cy, w, m, g, M) {
  const h = w * 0.6;
  const p = (a) => `M${cx} ${q(cy - w * a)}L${q(cx + h * a)} ${cy}L${cx} ${q(cy + w * a)}L${q(cx - h * a)} ${cy}Z`;
  return [
    ["path", { d: p(1), fill: M, stroke: m.escuro, strokeWidth: 0.8 }],
    ["path", { d: p(0.55), fill: g ? g.corpo : LADO_DA_MOLDURA.heroi.fio, stroke: m.escuro, strokeWidth: 0.5 }],
    ["path", { d: p(0.2), fill: PECAS_DA_MOLDURA.reflexo, fillOpacity: 0.8 }],
  ];
}
function disco(cx, cy, r, d, m, M) {
  return [
    ["circle", { cx, cy, r: q(r + 1.6), fill: M, stroke: m.escuro, strokeWidth: 0.8 }],
    ["circle", { cx, cy, r, fill: d.corpo }],
    ["path", { d: `M${q(cx - r * 0.8)} ${q(cy - r * 0.3)}A${r} ${r} 0 0 1 ${q(cx + r * 0.6)} ${q(cy - r * 0.75)}`, fill: "none", stroke: d.luz, strokeWidth: q(r * 0.18), strokeLinecap: "round" }],
  ];
}
function olho(cx, cy, r, m, M) {
  return [
    ["circle", { cx, cy, r: q(r + 2.4), fill: M, stroke: m.escuro, strokeWidth: 0.8 }],
    ["ellipse", { cx, cy, rx: r, ry: q(r * 0.8), fill: LADO_DA_MOLDURA.inimigo.fio }],
    ["path", { d: `M${cx} ${q(cy - r * 0.75)}C${q(cx + r * 0.3)} ${q(cy - r * 0.3)} ${q(cx + r * 0.3)} ${q(cy + r * 0.3)} ${cx} ${q(cy + r * 0.75)}C${q(cx - r * 0.3)} ${q(cy + r * 0.3)} ${q(cx - r * 0.3)} ${q(cy - r * 0.3)} ${cx} ${q(cy - r * 0.75)}Z`, fill: PECAS_DA_MOLDURA.engaste }],
  ];
}

/* O lume do ouro (§9): um arco claro, a 0,35, que corre o meio do aro. A
   classe roda-o à volta de (50, 50); com reduce fica parado onde está. */
function lume(m) {
  const r = 37, C = 2 * Math.PI * r;
  return ["circle", { className: "tv-moldura-lume", cx: 50, cy: 50, r, fill: "none", stroke: m.brilho, strokeOpacity: ESTADOS_DA_MOLDURA.alfaDoLume, strokeWidth: 4, strokeLinecap: "round", strokeDasharray: `${q(C * ESTADOS_DA_MOLDURA.arcoDoLume)} ${q(C)}` }];
}

/* ---------- o medalhão (cartão 64) e o anel da cinta (36–44) ----------
   `forma`: "anel" ou "medalhao". `tier` só vale para o inimigo. `id` é o
   prefixo dos gradientes (dois SVG na mesma página não podem partilhar
   «m»). `retrato`: pinta o fundo do retrato (o Anel não o pinta — o rosto
   dele já tem fundo). */
export function partesDaMoldura({ degrau = "ferro", lado = "heroi", tier = null, forma = "medalhao", gema: g = null, selo: especialista = false, comDisco = true, retrato = true, acende = false, id = "mv" } = {}) {
  const inim = lado === "inimigo";
  const m = inim ? MOLDURA_DO_INIMIGO.metal : (MOLDURA_POR_DEGRAU[degrau] || MOLDURA_POR_DEGRAU.ferro);
  const camadas = inim ? (MOLDURA_DO_INIMIGO[tier] || MOLDURA_DO_INIMIGO.comum) : m.camadas;
  const tem = (c) => camadas.includes(c);
  const an = forma === "anel";
  const L = LADO_DA_MOLDURA[lado] || LADO_DA_MOLDURA.heroi;
  const M = `url(#${id}-m)`, AU = `url(#${id}-au)`;
  const abaixo = [], acima = [];

  if (tem("aura")) abaixo.push(["circle", { cx: 50, cy: 50, r: an ? 54 : 66, fill: AU }]);
  if (tem("asas")) {
    const fe = an ? [[30, 18]] : [[30, 26], [55, 22], [80, 17]];
    for (const sg of [1, -1]) {
      const [x, y] = pol(sg * 48, 38);
      fe.forEach(([rot, comp]) => abaixo.push(usa(PENA(comp), x, y, sg * rot, M, sg < 0 ? " scale(-1 1)" : "")));
    }
  }
  if (tem("chifres")) for (const sg of [1, -1]) { const [x, y] = pol(sg * 28, 39); abaixo.push(usa(CHIFRE, x, y, sg * 8, M, sg < 0 ? " scale(-1 1)" : "")); }
  if (tem("espinhos")) for (const a of [30, 60, 90, 120, 240, 270, 300, 330]) {
    const [b1x, b1y] = pol(a - 4, 39.5), [b2x, b2y] = pol(a + 4, 39.5), [tx, ty] = pol(a, an ? 45 : 48);
    abaixo.push(["path", { d: `M${b1x} ${b1y}L${tx} ${ty}L${b2x} ${b2y}Z`, fill: M, stroke: m.escuro, strokeWidth: 0.6 }]);
  }
  if (tem("chamas")) {
    const ch = an ? [[0, 0, 1]] : [[0, 0, 1.15], [-7, 2, 0.8], [7, 2, 0.8]];
    ch.forEach(([dx, dy, k], i) => abaixo.push(["path", { d: CHAMA, transform: `translate(${50 + dx} ${8 + dy}) rotate(${dx * 3}) scale(${i === 2 ? -k : k} ${k})`, fill: M, stroke: m.escuro, strokeWidth: 0.5 }]));
  }
  abaixo.push(["path", { d: anelD(50, 50, 40) + anelD(50, 50, 34), fill: M, fillRule: "evenodd", stroke: m.escuro, strokeWidth: 0.9 }]);
  abaixo.push(["circle", { cx: 50, cy: 50, r: 38.9, fill: "none", stroke: m.brilho, strokeWidth: 0.6, strokeOpacity: 0.7 }]);
  if (retrato) abaixo.push(["circle", { cx: 50, cy: 50, r: 33.9, fill: PECAS_DA_MOLDURA.retrato }]);

  acima.push(["circle", { cx: 50, cy: 50, r: 32.6, fill: "none", stroke: L.fio, strokeWidth: 1.4 }]);
  if (L.duplo) acima.push(["circle", { cx: 50, cy: 50, r: 30.9, fill: "none", stroke: L.fio, strokeWidth: 0.7, strokeOpacity: 0.8 }]);
  if (!inim && degrau === "ouro") acima.push(lume(m));
  if (tem("folhas")) {
    const ang = an ? [150, 120] : [160, 145, 130, 115, 100, 85];
    for (const sg of [1, -1]) {
      if (!an) { const [ax, ay] = pol(sg * 165, 43.5), [bx, by] = pol(sg * 80, 43.5); acima.push(["path", { d: `M${ax} ${ay}A43.5 43.5 0 0 ${sg > 0 ? 0 : 1} ${bx} ${by}`, fill: "none", stroke: M, strokeWidth: 1.2 }]); }
      ang.forEach((a, i) => {
        const [x, y] = pol(sg * a, i % 2 ? 42.5 : 44.5);
        acima.push(usa(FOLHA, x, y, sg * (a - 90 + (i % 2 ? -15 : 40)), M, ` scale(${an ? 1.1 : 1.25})`));
      });
    }
  }
  if (tem("rebites")) for (const a of [45, 135, 225, 315]) {
    if (a === 135 && comDisco) continue;
    const [x, y] = pol(a, 37);
    acima.push(["circle", { cx: x, cy: y, r: 1.7, fill: m.claro, stroke: m.escuro, strokeWidth: 0.6 }]);
  }
  acima.push(...(inim ? olho(50, 10, an ? 5.4 : 4.6, m, M) : gema(50, 10, an ? 5.4 : 5.6, g, m, M, acende)));
  if (especialista && !inim) acima.push(...selo(50, 92, an ? 8 : 10, m, g, M));
  let numero = null;
  if (comDisco) {
    const [x, y] = pol(135, 40), r = an ? 12 : 10, d = DISCO_DE_NIVEL[inim ? "inimigo" : "heroi"];
    acima.push(...disco(x, y, r, d, m, M));
    numero = { x, y, r, cor: d.numero };
  }
  /* o chefe brilha vermelho: a aura dele é a do inimigo, não a do metal */
  const luzDaAura = inim && tier === "chefe" ? { ...m, brilho: PECAS_DA_MOLDURA.auraDoChefe } : m;
  return { vb: VB_DA_MOLDURA[an ? "anel" : "medalhao"], defs: defs(luzDaAura, id), abaixo, acima, numero, janela: { cx: 50, cy: 50, r: 33.9 } };
}

/* ---------- a carta (a ficha, 160 de largura) ----------
   O mesmo contrato: `abaixo` vai por baixo do retrato, `acima` por cima. A
   janela é o recorte do retrato (o arco de cima e o retângulo). */
export function partesDaCarta({ degrau = "ferro", lado = "heroi", gema: g = null, selo: especialista = false, acende = false, id = "mc" } = {}) {
  const m = MOLDURA_POR_DEGRAU[degrau] || MOLDURA_POR_DEGRAU.ferro, tem = (c) => m.camadas.includes(c);
  const L = LADO_DA_MOLDURA[lado] || LADO_DA_MOLDURA.heroi;
  const M = `url(#${id}-m)`, AU = `url(#${id}-au)`;
  const abaixo = [], acima = [];
  if (tem("aura")) abaixo.push(["ellipse", { cx: 80, cy: 100, rx: 118, ry: 140, fill: AU }]);
  if (tem("asas")) for (const sg of [1, -1]) [[50, 44], [72, 38], [94, 30]].forEach(([rot, comp]) => abaixo.push(usa(PENA(comp), 80 + sg * 22, 6, sg * rot, M, sg < 0 ? " scale(-1 1)" : "")));
  if (tem("chamas")) [[0, 0, 1.9], [-11, 3, 1.3], [11, 3, 1.3]].forEach(([dx, dy, k], i) => abaixo.push(["path", { d: CHAMA, transform: `translate(${80 + dx} ${2 + dy}) rotate(${dx * 2.5}) scale(${i === 2 ? -k : k} ${k})`, fill: M, stroke: m.escuro, strokeWidth: 0.6 }]));
  abaixo.push(["rect", { x: 0, y: 0, width: 160, height: 224, rx: 12, fill: M, stroke: m.escuro, strokeWidth: 1 }]);
  abaixo.push(["rect", { x: 4, y: 4, width: 152, height: 216, rx: 9, fill: "none", stroke: m.brilho, strokeWidth: 0.8, strokeOpacity: 0.6 }]);
  abaixo.push(["rect", { x: 6.5, y: 6.5, width: 147, height: 211, rx: 7.5, fill: "none", stroke: m.escuro, strokeWidth: 0.6, strokeOpacity: 0.7 }]);
  abaixo.push(["path", { d: "M10 60A70 52 0 0 1 150 60V150H10Z", fill: PECAS_DA_MOLDURA.retrato, stroke: m.escuro, strokeWidth: 1 }]);
  acima.push(["path", { d: "M13 61A67 49 0 0 1 147 61V147H13Z", fill: "none", stroke: L.fio, strokeWidth: 1.4 }]);
  if (L.duplo) acima.push(["path", { d: "M16 62A64 46 0 0 1 144 62V144H16Z", fill: "none", stroke: L.fio, strokeWidth: 0.7, strokeOpacity: 0.8 }]);
  acima.push(["rect", { x: 10, y: 156, width: 140, height: 56, rx: 4, fill: PECAS_DA_MOLDURA.caixa, stroke: m.escuro, strokeWidth: 1 }]);
  if (tem("folhas")) for (const [cx, cy, base] of [[10, 10, 135], [150, 10, 225], [10, 214, 45], [150, 214, 315]]) [-40, -20, 0, 20, 40].forEach((d) => acima.push(usa(FOLHA, cx, cy, base + d + 180, M, " scale(1.9)")));
  if (tem("rebites")) for (const [x, y] of [[9, 9], [151, 9], [9, 112], [151, 112], [9, 152], [151, 152]]) acima.push(["circle", { cx: x, cy: y, r: 2.6, fill: m.claro, stroke: m.escuro, strokeWidth: 0.7 }]);
  acima.push(["path", { d: "M68 9H92L87 18H73Z", fill: M, stroke: m.escuro, strokeWidth: 0.7 }]);
  acima.push(...gema(80, 4, 9, g, m, M, acende));
  if (especialista) acima.push(...selo(80, 226, 11, m, g, M));
  acima.push(...disco(10, 214, 14, DISCO_DE_NIVEL.heroi, m, M));
  acima.push(["path", { d: "M136 200H164V212C164 222 157 229 150 232C143 229 136 222 136 212Z", fill: M, stroke: m.escuro, strokeWidth: 0.9 }]);
  acima.push(["path", { d: "M139 203H161V212C161 220 156 225 150 228C144 225 139 220 139 212Z", fill: PECAS_DA_MOLDURA.escudo }]);
  return {
    vb: VB_DA_MOLDURA.carta, defs: defs(m, id), abaixo, acima,
    numero: { x: 10, y: 214, r: 14, cor: DISCO_DE_NIVEL.heroi.numero },
    ca: { x: 150, y: 214, cor: DISCO_DE_NIVEL.heroi.numero },
    janela: { x: 10, y: 8, largura: 140, altura: 142 },
  };
}
