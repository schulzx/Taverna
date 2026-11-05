/* AAA · 05/11/2026 — a geometria das molduras vivas, das gemas, do selo,
   dos discos, dos ícones de item e da vela. Puro: só devolve strings SVG.
   É a MESMA fonte que montou os componentes no Figma (página «AAA · 05/11»)
   e que escreveu as tabelas em mente/formas.md §«AAA». Quem porta para
   src/ (ui.jsx + estilo.js) copia as tabelas e as funções; não redesenha.
   Unidade: o aro mede 80 unidades de diâmetro (centro 50,50); `tamanho` é o
   diâmetro do aro em px. Os ornamentos transbordam o aro (veja VB). */

const MOLDURA_POR_DEGRAU = {
  ferro:  { de: 1,  ate: 4,  claro: "#A7ADB2", meio: "#6E747A", escuro: "#34383C", brilho: "#D9DEE2", camadas: ["aro", "rebites"] },
  bronze: { de: 5,  ate: 9,  claro: "#E7AE6F", meio: "#A9672F", escuro: "#55300F", brilho: "#FFD9A8", camadas: ["aro", "folhas"] },
  prata:  { de: 10, ate: 14, claro: "#EEF1F4", meio: "#B4BCC4", escuro: "#5E6871", brilho: "#FFFFFF", camadas: ["aro", "folhas", "chamas"] },
  ouro:   { de: 15, ate: 99, claro: "#FFE39A", meio: "#E0A93A", escuro: "#7A5410", brilho: "#FFF6D6", camadas: ["aura", "asas", "aro", "folhas", "chamas"] },
};
const MOLDURA_DO_INIMIGO = {
  metal: { claro: "#B3A39C", meio: "#7A6A64", escuro: "#2E2524", brilho: "#D6C6BF" },
  comum: ["aro", "rebites"],
  elite: ["aro", "espinhos"],
  chefe: ["aura", "chifres", "aro", "espinhos"],
};
/* o fio de dentro diz de que lado está: cor E forma (WCAG 1.4.1) */
const LADO_DA_MOLDURA = {
  heroi:       { fio: "#F0A23B", duplo: true },   /* = T.amber */
  companheiro: { fio: "#7DB9DC", duplo: false },  /* = T.mundo */
  inimigo:     { fio: "#E86A4F", duplo: false },  /* = T.danger */
};
const DISCO_DE_NIVEL = {
  heroi:   { corpo: "#15475A", luz: "#2C7D96", sombra: "#0A2530", numero: "#F2E7D2" },
  inimigo: { corpo: "#6A1E14", luz: "#A8382A", sombra: "#2E0B07", numero: "#F2E7D2" },
};
const ENGASTE_VAZIO = "#120C08";
const RETRATO_FUNDO = "#2A1E15";

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

const defs = (m) =>
  `<defs><linearGradient id="m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${m.claro}"/><stop offset=".45" stop-color="${m.meio}"/><stop offset="1" stop-color="${m.escuro}"/></linearGradient>` +
  `<radialGradient id="au"><stop offset="0" stop-color="${m.brilho}" stop-opacity=".55"/><stop offset="1" stop-color="${m.brilho}" stop-opacity="0"/></radialGradient></defs>`;

const usa = (d, x, y, rot, fill, extra = "") =>
  `<path d="${d}" transform="translate(${x} ${y}) rotate(${q(rot)})${extra}" fill="${fill}"/>`;

/* a gema: engaste de metal, o furo, e a pedra com luz, sombra e brilho */
function gema(cx, cy, r, g, m) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${q(r + 2.4)}" fill="url(#m)" stroke="${m.escuro}" stroke-width=".8"/><circle cx="${cx}" cy="${cy}" r="${q(r + 0.6)}" fill="${ENGASTE_VAZIO}"/>`;
  if (!g) return s + `<circle cx="${cx}" cy="${cy}" r="${q(r - 1)}" fill="none" stroke="#3A2A1C" stroke-width=".8"/>`;
  const k = (a, b) => `${q(cx + r * a)} ${q(cy + r * b)}`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${g.corpo}"/>`;
  s += `<path d="M${k(-0.78, -0.15)}A${q(r * 0.82)} ${q(r * 0.82)} 0 0 1 ${k(0.15, -0.78)}Q${k(-0.25, -0.45)} ${k(-0.78, -0.15)}Z" fill="${g.luz}"/>`;
  s += `<path d="M${k(0.9, 0.2)}A${q(r * 0.92)} ${q(r * 0.92)} 0 0 1 ${k(-0.2, 0.9)}Q${k(0.45, 0.5)} ${k(0.9, 0.2)}Z" fill="${g.sombra}"/>`;
  return s + `<circle cx="${q(cx - r * 0.38)}" cy="${q(cy - r * 0.42)}" r="${q(r * 0.2)}" fill="#FFFFFF" fill-opacity=".9"/>`;
}
/* o selo da especialização: losango de metal, miolo na cor da gema */
function selo(cx, cy, w, m, g) {
  const h = w * 0.6;
  const p = (a) => `M${cx} ${q(cy - w * a)}L${q(cx + h * a)} ${cy}L${cx} ${q(cy + w * a)}L${q(cx - h * a)} ${cy}Z`;
  return `<path d="${p(1)}" fill="url(#m)" stroke="${m.escuro}" stroke-width=".8"/><path d="${p(0.55)}" fill="${g ? g.corpo : "#F0A23B"}" stroke="${m.escuro}" stroke-width=".5"/><path d="${p(0.2)}" fill="#FFFFFF" fill-opacity=".8"/>`;
}
function disco(cx, cy, r, d, m) {
  return `<circle cx="${cx}" cy="${cy}" r="${q(r + 1.6)}" fill="url(#m)" stroke="${m.escuro}" stroke-width=".8"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${d.corpo}"/><path d="M${q(cx - r * 0.8)} ${q(cy - r * 0.3)}A${r} ${r} 0 0 1 ${q(cx + r * 0.6)} ${q(cy - r * 0.75)}" fill="none" stroke="${d.luz}" stroke-width="${q(r * 0.18)}" stroke-linecap="round"/>`;
}

/* ---------- o medalhão (cartão 64) e o anel da cinta (36–44) ---------- */
const VB = { anel: [-6, -8, 112, 112], medalhao: [-18, -20, 136, 136] };
function medalhao({ degrau = "ferro", lado = "heroi", tier = null, forma = "medalhao", tamanho = 64, g = null, especialista = false, comDisco = true }) {
  const inim = lado === "inimigo";
  const m = inim ? MOLDURA_DO_INIMIGO.metal : MOLDURA_POR_DEGRAU[degrau];
  const camadas = inim ? MOLDURA_DO_INIMIGO[tier || "comum"] : m.camadas;
  const tem = (c) => camadas.includes(c);
  const an = forma === "anel";
  const vb = VB[an ? "anel" : "medalhao"];
  const px = q((tamanho * vb[2]) / 80);
  const L = LADO_DA_MOLDURA[lado];
  const s = [defs(inim && tier === "chefe" ? { ...m, brilho: "#E86A4F" } : m)];
  if (tem("aura")) s.push(`<circle cx="50" cy="50" r="${an ? 54 : 66}" fill="url(#au)"/>`);
  if (tem("asas")) {
    const fe = an ? [[30, 18]] : [[30, 26], [55, 22], [80, 17]];
    for (const sg of [1, -1]) {
      const [x, y] = pol(sg * 48, 38);
      fe.forEach(([rot, comp]) => s.push(usa(PENA(comp), x, y, sg * rot, "url(#m)", sg < 0 ? " scale(-1 1)" : "")));
    }
  }
  if (tem("chifres")) for (const sg of [1, -1]) { const [x, y] = pol(sg * 28, 39); s.push(usa(CHIFRE, x, y, sg * 8, "url(#m)", sg < 0 ? " scale(-1 1)" : "")); }
  if (tem("espinhos")) for (const a of [30, 60, 90, 120, 240, 270, 300, 330]) {
    const [b1x, b1y] = pol(a - 4, 39.5), [b2x, b2y] = pol(a + 4, 39.5), [tx, ty] = pol(a, an ? 45 : 48);
    s.push(`<path d="M${b1x} ${b1y}L${tx} ${ty}L${b2x} ${b2y}Z" fill="url(#m)" stroke="${m.escuro}" stroke-width=".6"/>`);
  }
  if (tem("chamas")) {
    const ch = an ? [[0, 0, 1]] : [[0, 0, 1.15], [-7, 2, 0.8], [7, 2, 0.8]];
    ch.forEach(([dx, dy, k], i) => s.push(`<path d="${CHAMA}" transform="translate(${50 + dx} ${8 + dy}) rotate(${dx * 3}) scale(${i === 2 ? -k : k} ${k})" fill="url(#m)" stroke="${m.escuro}" stroke-width=".5"/>`));
  }
  s.push(`<path d="${anelD(50, 50, 40)}${anelD(50, 50, 34)}" fill="url(#m)" fill-rule="evenodd" stroke="${m.escuro}" stroke-width=".9"/>`);
  s.push(`<circle cx="50" cy="50" r="38.9" fill="none" stroke="${m.brilho}" stroke-width=".6" stroke-opacity=".7"/>`);
  s.push(`<circle cx="50" cy="50" r="33.9" fill="${RETRATO_FUNDO}"/>`);
  s.push(`<circle cx="50" cy="50" r="32.6" fill="none" stroke="${L.fio}" stroke-width="1.4"/>`);
  if (L.duplo) s.push(`<circle cx="50" cy="50" r="30.9" fill="none" stroke="${L.fio}" stroke-width=".7" stroke-opacity=".8"/>`);
  if (tem("folhas")) {
    const ang = an ? [150, 120] : [160, 145, 130, 115, 100, 85];
    for (const sg of [1, -1]) {
      if (!an) { const [ax, ay] = pol(sg * 165, 43.5), [bx, by] = pol(sg * 80, 43.5); s.push(`<path d="M${ax} ${ay}A43.5 43.5 0 0 ${sg > 0 ? 0 : 1} ${bx} ${by}" fill="none" stroke="url(#m)" stroke-width="1.2"/>`); }
      ang.forEach((a, i) => {
        const [x, y] = pol(sg * a, i % 2 ? 42.5 : 44.5);
        s.push(usa(FOLHA, x, y, sg * (a - 90 + (i % 2 ? -15 : 40)), "url(#m)", ` scale(${an ? 1.1 : 1.25})`));
      });
    }
  }
  if (tem("rebites")) for (const a of [45, 135, 225, 315]) {
    if (a === 135 && comDisco) continue;
    const [x, y] = pol(a, 37);
    s.push(`<circle cx="${x}" cy="${y}" r="1.7" fill="${m.claro}" stroke="${m.escuro}" stroke-width=".6"/>`);
  }
  s.push(inim ? olho(50, 10, an ? 5.4 : 4.6, m) : gema(50, 10, an ? 5.4 : 5.6, g, m));
  if (especialista && !inim) s.push(selo(50, 92, an ? 8 : 10, m, g));
  if (comDisco) { const [x, y] = pol(135, 40); s.push(disco(x, y, an ? 12 : 10, DISCO_DE_NIVEL[inim ? "inimigo" : "heroi"], m)); }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="${vb.join(" ")}">${s.join("")}</svg>`;
}
function olho(cx, cy, r, m) {
  return `<circle cx="${cx}" cy="${cy}" r="${q(r + 2.4)}" fill="url(#m)" stroke="${m.escuro}" stroke-width=".8"/><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${q(r * 0.8)}" fill="#E86A4F"/><path d="M${cx} ${q(cy - r * 0.75)}C${q(cx + r * 0.3)} ${q(cy - r * 0.3)} ${q(cx + r * 0.3)} ${q(cy + r * 0.3)} ${cx} ${q(cy + r * 0.75)}C${q(cx - r * 0.3)} ${q(cy + r * 0.3)} ${q(cx - r * 0.3)} ${q(cy - r * 0.3)} ${cx} ${q(cy - r * 0.75)}Z" fill="${ENGASTE_VAZIO}"/>`;
}

/* ---------- a carta (a ficha, 160 de largura) ---------- */
const VB_CARTA = [-26, -30, 212, 276];
function carta({ degrau = "ferro", lado = "heroi", largura = 160, g = null, especialista = false }) {
  const m = MOLDURA_POR_DEGRAU[degrau], tem = (c) => m.camadas.includes(c), L = LADO_DA_MOLDURA[lado];
  const s = [defs(m)];
  const px = q((largura * VB_CARTA[2]) / 160), py = q((largura * VB_CARTA[3]) / 160);
  if (tem("aura")) s.push(`<ellipse cx="80" cy="100" rx="118" ry="140" fill="url(#au)"/>`);
  if (tem("asas")) for (const sg of [1, -1]) [[50, 44], [72, 38], [94, 30]].forEach(([rot, comp]) => s.push(usa(PENA(comp), 80 + sg * 22, 6, sg * rot, "url(#m)", sg < 0 ? " scale(-1 1)" : "")));
  if (tem("chamas")) [[0, 0, 1.9], [-11, 3, 1.3], [11, 3, 1.3]].forEach(([dx, dy, k], i) => s.push(`<path d="${CHAMA}" transform="translate(${80 + dx} ${2 + dy}) rotate(${dx * 2.5}) scale(${i === 2 ? -k : k} ${k})" fill="url(#m)" stroke="${m.escuro}" stroke-width=".6"/>`));
  s.push(`<rect x="0" y="0" width="160" height="224" rx="12" fill="url(#m)" stroke="${m.escuro}" stroke-width="1"/>`);
  s.push(`<rect x="4" y="4" width="152" height="216" rx="9" fill="none" stroke="${m.brilho}" stroke-width=".8" stroke-opacity=".6"/>`);
  s.push(`<rect x="6.5" y="6.5" width="147" height="211" rx="7.5" fill="none" stroke="${m.escuro}" stroke-width=".6" stroke-opacity=".7"/>`);
  s.push(`<path d="M10 60A70 52 0 0 1 150 60V150H10Z" fill="${RETRATO_FUNDO}" stroke="${m.escuro}" stroke-width="1"/>`);
  s.push(`<path d="M13 61A67 49 0 0 1 147 61V147H13Z" fill="none" stroke="${L.fio}" stroke-width="1.4"/>`);
  if (L.duplo) s.push(`<path d="M16 62A64 46 0 0 1 144 62V144H16Z" fill="none" stroke="${L.fio}" stroke-width=".7" stroke-opacity=".8"/>`);
  s.push(`<rect x="10" y="156" width="140" height="56" rx="4" fill="#251A12" stroke="${m.escuro}" stroke-width="1"/>`);
  if (tem("folhas")) for (const [cx, cy, base] of [[10, 10, 135], [150, 10, 225], [10, 214, 45], [150, 214, 315]]) [-40, -20, 0, 20, 40].forEach((d) => s.push(usa(FOLHA, cx, cy, base + d + 180, "url(#m)", " scale(1.9)")));
  if (tem("rebites")) for (const [x, y] of [[9, 9], [151, 9], [9, 112], [151, 112], [9, 152], [151, 152]]) s.push(`<circle cx="${x}" cy="${y}" r="2.6" fill="${m.claro}" stroke="${m.escuro}" stroke-width=".7"/>`);
  s.push(`<path d="M68 9H92L87 18H73Z" fill="url(#m)" stroke="${m.escuro}" stroke-width=".7"/>`);
  s.push(gema(80, 4, 9, g, m));
  if (especialista) s.push(selo(80, 226, 11, m, g));
  s.push(disco(10, 214, 14, DISCO_DE_NIVEL.heroi, m));
  s.push(`<path d="M136 200H164V212C164 222 157 229 150 232C143 229 136 222 136 212Z" fill="url(#m)" stroke="${m.escuro}" stroke-width=".9"/><path d="M139 203H161V212C161 220 156 225 150 228C144 225 139 220 139 212Z" fill="#33251A"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${py}" viewBox="${VB_CARTA.join(" ")}">${s.join("")}</svg>`;
}

/* ---------- os ícones de item: quadro 24, traço 1,5, como os de ui.jsx ---------- */
const ICONES_DE_ITEM = {
  espada: ["M20 4h-3.6L7.2 13.2l3.6 3.6L20 7.6z", "M5.2 11.6l7.2 7.2", "M7.6 16.4L4 20"],
  machado: ["M5 20L15 7.5", "M12.6 5.4c2.2-2.2 6.4-2.4 8 .4-1.3 2.5-1 5 .6 7.2-2.8 1-6 .1-7.6-2.1z"],
  arco: ["M7 3.5c7 3 7 14 0 17", "M7 3.5v17", "M4 12h15", "M16.5 9.5L19 12l-2.5 2.5"],
  cajado: ["M7 21l8-13", "M18.6 6.4a2.6 2.6 0 1 1-5.2 0a2.6 2.6 0 1 1 5.2 0", "M20.5 1.8v2.4M19.3 3h2.4"],
  adaga: ["M17 4l3 3-7.5 7.5-3-3z", "M8 10.5l5.5 5.5", "M10 14l-5 5"],
  maca: ["M5 19l7.5-7.5", "M19 8.5a3.5 3.5 0 1 1-7 0a3.5 3.5 0 1 1 7 0", "M15.5 3v1.5M21 8.5h-1.5M19.4 4.6l-1 1M11.6 4.6l1 1M19.4 12.4l-1-1"],
  escudo: ["M12 3l7 2.5V11c0 4.8-3 8-7 10-4-2-7-5.2-7-10V5.5z", "M12 7v10M8.5 11h7"],
  elmo: ["M5 14a7 7 0 0 1 14 0v4.5h-4.5V15h-5v3.5H5z", "M12 7V3.5", "M8 14h8"],
  armaduraLeve: ["M8 4l4 2 4-2 3 3-2 3v10H7V10L5 7z", "M11 9.5h2M11 12.5h2M11 15.5h2"],
  armaduraPesada: ["M6 5h3l3 2 3-2h3l1.2 5-2.2 1v9H7v-9l-2.2-1z", "M7 14h10M7 17h10", "M12 7v13"],
  botas: ["M7.5 3.5H13v9c3 .4 6 1.6 6 4.5v2.5H6.5V14z", "M6.5 17h12.5"],
  anel: ["M17.5 15a5.5 5.5 0 1 1-11 0a5.5 5.5 0 1 1 11 0", "M9.5 8.5L12 5l2.5 3.5L12 10z"],
  amuleto: ["M6 3c0 5 2.5 8 6 9 3.5-1 6-4 6-9", "M12 12l3 4-3 4.5-3-4.5z"],
  pocao: ["M9.5 3h5", "M10.5 3v5L6.5 15a4.5 4.5 0 0 0 4 6.5h3a4.5 4.5 0 0 0 4-6.5L13.5 8V3", "M7.6 14.5h8.8"],
  pergaminho: ["M8 4.5h10.5v13a2.5 2.5 0 0 1-2.5 2.5H5.5", "M8 4.5a2 2 0 1 0-2 2h2V18", "M5.5 20a2 2 0 0 1 0-4H8", "M10.5 9h5M10.5 12h5"],
  chave: ["M10 12a3.5 3.5 0 1 1-7 0a3.5 3.5 0 1 1 7 0", "M10 12h11", "M18 12v3M15 12v2.5"],
  aljava: ["M8 9l2 12h4l2-12z", "M10 9V3M12 9V2.5M14 9V3", "M9 4.5l1-1.5 1 1.5M13 4.5l1-1.5 1 1.5"],
  tomo: ["M5 4.5h11a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2z", "M5 18a2 2 0 0 1 2-2h11", "M10.5 8.5h4"],
};
/* o encaixe vazio mostra o glifo do que lá vai, a 35% */
const GLIFO_DO_ENCAIXE = { elmo: "elmo", amuleto: "amuleto", armadura: "armaduraPesada", arma: "espada", escudo: "escudo", anel: "anel", botas: "botas" };
function icone(nome, cor = "#F2E7D2", tam = 24) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="${cor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONES_DE_ITEM[nome].map((d) => `<path d="${d}"/>`).join("")}</svg>`;
}

/* ---------- os ícones de atributo (o mesmo traço) ---------- */
const ICONES_DE_ATRIBUTO = {
  forca: ["M7 11V7.5a1.5 1.5 0 0 1 3 0V10", "M10 9.5V6.5a1.5 1.5 0 0 1 3 0V10", "M13 9.5V7a1.5 1.5 0 0 1 3 0v3.5", "M16 10a1.5 1.5 0 0 1 3 0v3c0 4-2.5 7-6.5 7S6 17.5 6 14.5V12c0-1 .8-1.6 1.8-1.4L11 11.5"],
  destreza: ["M19 4C11 4 6 9.5 5.5 19", "M19 4c-.5 6-4.5 10-10.5 11", "M13 7.5l-3 .5M15.5 10l-4 .8"],
  vigor: ["M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z", "M6.5 12.5h3l1.5-2.5 2 4 1.5-1.5h3"],
  intelecto: ["M12 6.5C9.8 5 6.8 4.6 4 5.2v13c2.8-.6 5.8-.2 8 1.3 2.2-1.5 5.2-1.9 8-1.3v-13c-2.8-.6-5.8-.2-8 1.3z", "M12 6.5v13"],
  presenca: ["M4 17h16", "M4.5 17L3.5 8l4.5 3.5L12 5l4 6.5L20.5 8l-1 9", "M5 20h14"],
  percepcao: ["M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z", "M15 12a3 3 0 1 1-6 0a3 3 0 1 1 6 0"],
};
function iconeAtr(nome, cor, tam = 24) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="${cor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONES_DE_ATRIBUTO[nome].map((d) => `<path d="${d}"/>`).join("")}</svg>`;
}

/* ---------- a vela (castiçal 40×64) ---------- */
const VELA = {
  cor: { chama: "#FFB347", nucleo: "#FFF1C4", halo: "#FFC877", cera: "#EFE3C8", ceraSombra: "#C9B48E", pavio: "#2A1C11", fumo: "#B9AE9C" },
  /* a vela queima ao longo da noite: a altura é o relógio */
  porFase: {
    manha:      { estado: "apagada", altura: 1,    luz: 0 },
    tarde:      { estado: "apagada", altura: 1,    luz: 0 },
    entardecer: { estado: "acesa",   altura: 1,    luz: 0.12 },
    noite:      { estado: "acesa",   altura: 0.7,  luz: 0.2 },
    madrugada:  { estado: "acesa",   altura: 0.42, luz: 0.24 },
    amanhecer:  { estado: "fumo",    altura: 0.2,  luz: 0 },
  },
  tempos: { tremor: 1800, respiroDaLuz: 2300, acender: 700, fumo: 2600, reduzido: 200 },
  luzNoPapel: { raioDaFolha: 0.9, vinhetaDaMesa: 0.32 },
};
function vela({ fase = "noite", tam = 40 }) {
  const f = VELA.porFase[fase], c = VELA.cor, m = MOLDURA_POR_DEGRAU.bronze;
  const hMax = 30, h = q(hMax * f.altura), topo = 50 - h;
  const s = [defs(m), `<radialGradient id="hl"><stop offset="0" stop-color="${c.halo}" stop-opacity=".7"/><stop offset="1" stop-color="${c.halo}" stop-opacity="0"/></radialGradient>`];
  if (f.estado === "acesa") s.push(`<circle cx="20" cy="${q(topo - 7)}" r="15" fill="url(#hl)"/>`);
  s.push(`<path d="M31 50.5c4.5 0 6.5 2.2 6.5 4.2s-2 3.8-6.5 3.8" fill="none" stroke="url(#m)" stroke-width="2.2"/>`);
  s.push(`<ellipse cx="20" cy="54" rx="15" ry="5" fill="url(#m)" stroke="${m.escuro}" stroke-width=".8"/><ellipse cx="20" cy="52.5" rx="9" ry="2.6" fill="${m.escuro}"/>`);
  s.push(`<rect x="15" y="${topo}" width="10" height="${h}" rx="1.5" fill="${c.cera}"/><rect x="21.5" y="${topo}" width="3.5" height="${h}" rx="1.2" fill="${c.ceraSombra}"/>`);
  s.push(`<path d="M15 ${q(topo + 1.5)}c1.2 0 1.4 3 2.4 3s.8-3 2.6-3" fill="none" stroke="${c.ceraSombra}" stroke-width=".8"/>`);
  s.push(`<path d="M20 ${topo}v-3" stroke="${c.pavio}" stroke-width="1" stroke-linecap="round"/>`);
  if (f.estado === "acesa") {
    s.push(`<path d="M20 ${q(topo - 2)}c-3.4-1.6-3.6-6.4 0-12.5c3.6 6.1 3.4 10.9 0 12.5z" fill="${c.chama}"/>`);
    s.push(`<path d="M20 ${q(topo - 2.6)}c-1.6-.8-1.8-3.6 0-6.8c1.8 3.2 1.6 6 0 6.8z" fill="${c.nucleo}"/>`);
  }
  if (f.estado === "fumo") s.push(`<path d="M20 ${q(topo - 3)}c-3-3 3-5 0-8s3-5 0-9" fill="none" stroke="${c.fumo}" stroke-width="1.2" stroke-linecap="round" stroke-opacity=".7"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tam}" height="${q(tam * 1.6)}" viewBox="0 0 40 64">${s.join("")}</svg>`;
}

export { MOLDURA_POR_DEGRAU, MOLDURA_DO_INIMIGO, LADO_DA_MOLDURA, DISCO_DE_NIVEL, ENGASTE_VAZIO, VB, VB_CARTA, FOLHA, CHAMA, PENA, CHIFRE, ICONES_DE_ITEM, ICONES_DE_ATRIBUTO, GLIFO_DO_ENCAIXE, VELA, medalhao, carta, gema, selo, disco, icone, iconeAtr, vela };
