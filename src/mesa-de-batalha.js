/* ============================================================
   A MESA DE BATALHA DO F4 (V6, 16/11/2026) — o encontro e a luta

   `mente/formas.md`, «## A Mesa do Mestre · F4 · o encontro e a luta».
   Três peças puras que a tela lê, provadas em Node
   (`testes/teste-mesa-de-batalha.mjs`):

   1. A FILA DO ENVIO. «Lutar» desenrola o tapete JÁ (F4 §1 nº 1) e a
      narração da entrada chega depois, na tira do Mestre. Logo, com a
      fala da entrada ainda no ar, o herói pode golpear — e o golpe tem a
      sua própria narração. Duas chamadas ao Mestre ao mesmo tempo
      pisam-se (o histórico, a foto do turno, o recibo); a fila põe a
      segunda à espera da primeira, com um teto para o dia em que a
      primeira nunca devolver.

   2. AS INTENÇÕES FUNDIDAS POR ALVO (F4 §1 nº 4, `INTENCAO`). Três ratos
      que vão morder a mesma heroína eram três pílulas empilhadas (e
      cortadas a 375 px); passam a ser uma etiqueta («3× 2–10») e uma linha
      na nota «nesta rodada, eles vão». A soma é conta do que já está na
      tela — nenhuma regra nova.

   3. O CHÃO DAS DEZ PLANTAS (`MATERIAIS_DO_CHAO`, `CHAO_DA_PLANTA`). Só o
      deserto tinha textura; os outros nove eram chão liso. Cada material
      é um ladrilho SVG de 96 × 96 (duas casas de 48), repetível, desenhado
      aqui por código a partir da tabela — nenhuma imagem nova, nenhuma IA.
      As marcas espalham-se por uma semente que é o NOME do material: o
      mesmo ladrilho em qualquer máquina, para sempre.
   ============================================================ */

import { T } from "./estilo.js";

/* ---------------- 1. A FILA DO ENVIO ---------------- */
/* `tetoDaEsperaMs`: quanto uma chamada espera pela que está no ar antes de
   seguir sozinha. A chamada do Mestre mais longa medida nas sessões fica
   abaixo de 60 s (o próprio pedido tem o seu prazo); o dobro disso é o
   teto de uma espera que já deixou de ser espera. */
export const FILA_DO_ENVIO = {
  tetoDaEsperaMs: 120000,
};

/* a promessa de esperar pela chamada no ar, nunca para lá do teto; nunca
   rejeita (quem espera não herda o erro de quem estava à frente) */
export function esperarAVez(noAr, o) {
  const teto = Math.max(0, Number((o && o.teto) != null ? o.teto : FILA_DO_ENVIO.tetoDaEsperaMs) || 0);
  if (!noAr || typeof noAr.then !== "function") return Promise.resolve("livre");
  let relogio = null;
  const prazo = new Promise((r) => { relogio = setTimeout(() => r("teto"), teto); });
  const vez = Promise.resolve(noAr).then(() => "vez", () => "vez");
  return Promise.race([vez, prazo]).then((porque) => { try { clearTimeout(relogio); } catch { /* nada */ } return porque; });
}

/* ---------------- 2. AS INTENÇÕES FUNDIDAS POR ALVO ---------------- */
/* os números por extenso da soma («se os três acertarem»); acima de dez,
   o algarismo */
export const QUANTOS_POR_EXTENSO = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"];

const fin = (n) => Number.isFinite(Number(n)) && n !== null && n !== "";
const faixa = (a, b) => (a === b ? String(a) : `${a}–${b}`);

/* o nome da espécie: «Rato Gigante 2» e «Rato Gigante B» são um Rato
   Gigante — a numeração é de quem conta, não do bicho */
export function especieDe(nome) {
  return String(nome || "").replace(/\s+(\d+|[A-Z])$/, "").trim();
}

/* `lista`: intencoesDaRodada(...).lista — [{ inimigo, vista: { tipo, alvo,
   dano: { min, max }, abate } }]. `o.cumpridos`: nomes que já agiram nesta
   rodada (a intenção deles já não está por vir).
   Devolve { porAlvo, outras }:
     porAlvo — uma entrada por alvo de golpe, na ordem em que o primeiro
               atacante dele aparece: { alvo, quantos, atacantes, especies,
               min, max, iguais, somaMin, somaMax, abate, etiqueta, quem,
               dano, linha, soma }
     outras  — as intenções que não são golpe num alvo (sopro, aproximar,
               fugir, ou golpe de alvo escondido), uma por inimigo, como
               estavam. */
export function intencoesPorAlvo(lista, o) {
  const cumpridos = new Set(((o && o.cumpridos) || []).map(String));
  const l = (Array.isArray(lista) ? lista : []).filter((i) => i && i.inimigo && i.vista && !cumpridos.has(String(i.inimigo)));
  const grupos = new Map();
  const outras = [];
  for (const i of l) {
    const v = i.vista;
    const d = v.dano && fin(v.dano.min) && fin(v.dano.max) ? { min: Number(v.dano.min), max: Number(v.dano.max) } : null;
    if (v.tipo !== "atacar" || !v.alvo || !d) { outras.push(i); continue; }
    const g = grupos.get(v.alvo) || { alvo: v.alvo, golpes: [] };
    g.golpes.push({ inimigo: String(i.inimigo), min: d.min, max: d.max, abate: fin(v.abate) ? Number(v.abate) : null });
    grupos.set(v.alvo, g);
  }
  const porAlvo = [...grupos.values()].map((g) => {
    const quantos = g.golpes.length;
    const atacantes = g.golpes.map((x) => x.inimigo);
    const especies = [...new Set(atacantes.map(especieDe))];
    const min = Math.min(...g.golpes.map((x) => x.min));
    const max = Math.max(...g.golpes.map((x) => x.max));
    const iguais = g.golpes.every((x) => x.min === g.golpes[0].min && x.max === g.golpes[0].max);
    const somaMin = g.golpes.reduce((s, x) => s + x.min, 0);
    const somaMax = g.golpes.reduce((s, x) => s + x.max, 0);
    const abates = g.golpes.map((x) => x.abate).filter((x) => x != null);
    const abate = abates.length ? Math.max(...abates) : null;
    const vezes = quantos > 1 ? `${quantos}× ` : "";
    const quem = `${vezes}${especies.length === 1 ? especies[0] : especies.join(" e ")}`;
    const dano = iguais ? `${faixa(min, max)}${quantos > 1 ? " cada" : ""}` : `de ${min} a ${max}`;
    const extenso = QUANTOS_POR_EXTENSO[quantos] || String(quantos);
    return {
      alvo: g.alvo, quantos, atacantes, especies, min, max, iguais, somaMin, somaMax, abate,
      etiqueta: `${vezes}${faixa(min, max)}`,
      quem, dano,
      linha: `${quem} · ${dano} → ${g.alvo}`,
      soma: quantos > 1 ? `se os ${extenso} acertarem, de ${somaMin} a ${somaMax}` : "",
    };
  });
  return { porAlvo, outras };
}

/* ---------------- 3. O CHÃO DAS DEZ PLANTAS ---------------- */
/* Cada material: a base e as marcas. Uma marca é { cor, forma, n, tam }:
     traco  — um sulco/veio curto, deitado (n traços, `tam` de comprimento)
     tufo   — três folhas de relva em leque
     pedra  — uma pedra redonda com borda (`borda`)
     junta  — juntas de tábua: linhas a cada `passo`, ao alto ou deitadas
     tijolo — paralelepípedos `w` × `h` em fiadas desencontradas
     onda   — uma onda curta (areia, água, neve)
     ponto  — um grão, uma flor, um prego
     faceta — um triângulo de rocha
   As cores são as do F4 (`mente/formas.md`, `MATERIAIS_DO_CHAO`): pintura,
   não interface — por isso literais de tabela, como `OBJETOS_DA_MESA`. */
export const MATERIAIS_DO_CHAO = {
  terra:    { base: "#6B5238", marcas: [{ forma: "traco", cor: "#574229", n: 9, tam: 18 }, { forma: "traco", cor: "#7B6146", n: 6, tam: 12 }, { forma: "ponto", cor: "#8C7354", n: 10, tam: 2.4 }] },
  relva:    { base: "#3E552D", marcas: [{ forma: "tufo", cor: "#62803F", n: 12, tam: 8 }, { forma: "tufo", cor: "#2A3D1E", n: 9, tam: 7 }, { forma: "ponto", cor: "#C9B56A", n: 3, tam: 1.8 }] },
  cascalho: { base: "#5C5546", marcas: [{ forma: "pedra", cor: "#77705E", borda: "#3E392F", n: 16, tam: 5 }] },
  tabuas:   { base: "#5B3E26", marcas: [{ forma: "junta", cor: T.couro, passo: 24, deitada: true }, { forma: "traco", cor: "#6E4D31", n: 10, tam: 22 }, { forma: "ponto", cor: T.couro, n: 6, tam: 1.4 }] },
  conves:   { base: "#7B6245", marcas: [{ forma: "junta", cor: "#4A3823", passo: 16, deitada: false }, { forma: "traco", cor: "#8A7052", n: 6, tam: 14, alto: true }] },
  lajes:    { base: "#4B4C4E", marcas: [{ forma: "tijolo", cor: "#2B2C2E", w: 48, h: 32 }, { forma: "faceta", cor: "#63656A", n: 6, tam: 7 }] },
  calcada:  { base: "#33302B", marcas: [{ forma: "tijolo", cor: "#5F5A52", outra: "#6E6960", w: 21, h: 13, cheio: true }] },
  rocha:    { base: "#3B3838", marcas: [{ forma: "faceta", cor: "#464242", n: 10, tam: 18 }, { forma: "traco", cor: "#232121", n: 7, tam: 16 }] },
  neve:     { base: "#B7C3C8", marcas: [{ forma: "onda", cor: "#D6E0E3", n: 8, tam: 20 }, { forma: "onda", cor: "#9BAAB1", n: 5, tam: 16 }] },
  gelo:     { base: "#86A9B6", marcas: [{ forma: "traco", cor: "#D3E5EA", n: 8, tam: 20 }, { forma: "faceta", cor: "#A9C6D0", n: 5, tam: 14 }] },
  areia:    { base: "#A98856", marcas: [{ forma: "onda", cor: "#8F7146", n: 9, tam: 22 }, { forma: "ponto", cor: "#C7A772", n: 14, tam: 1.4 }] },
  agua:     { base: "#3B606C", marcas: [{ forma: "onda", cor: "#6F98A4", n: 9, tam: 14 }, { forma: "onda", cor: "#9CC0C9", n: 4, tam: 10 }] },
  matagal:  { base: "#2C4122", marcas: [{ forma: "tufo", cor: "#3D5A2D", n: 14, tam: 11 }, { forma: "tufo", cor: "#1F3018", n: 10, tam: 9 }, { forma: "traco", cor: "#5A4A2E", n: 4, tam: 14 }] },
  entulho:  { base: "#5A5A56", marcas: [{ forma: "tijolo", cor: "#45453F", w: 32, h: 24 }, { forma: "tufo", cor: "#5E7A3E", n: 6, tam: 7 }, { forma: "pedra", cor: "#73736C", borda: "#3E3E3A", n: 7, tam: 4 }] },
};

/* o lado do ladrilho em unidades do desenho (duas casas de 48) */
export const LADO_DO_LADRILHO = 96;

/* a planta → o material de cada região, na ordem das regiões de
   `grid.js`. O deserto fica com a pintura que já tem (`TERRENO_DO_TABULEIRO`),
   e a areia é a reserva dele. */
export const CHAO_DA_PLANTA = {
  taverna:  ["tabuas", "tabuas", "lajes"],
  masmorra: ["lajes", "lajes", "rocha"],
  floresta: ["relva", "terra", "matagal"],
  estrada:  ["relva", "terra", "cascalho"],
  cidade:   ["calcada", "lajes", "terra"],
  caverna:  ["cascalho", "rocha", "rocha"],
  ruina:    ["entulho", "entulho", "cascalho"],
  navio:    ["conves", "conves", "conves"],
  gelo:     ["neve", "gelo", "neve"],
  deserto:  ["areia", "areia", "areia"],
};

/* o véu sobre o ladrilho: as peças, as etiquetas e o caminho foram
   desenhados sobre o feltro escuro, e o chão pintado não lhes pode roubar
   o contraste (o deserto usa 0,73 sobre uma fotografia; o ladrilho já
   nasce escuro e pede muito menos) */
export const VEU_DO_LADRILHO = 0.32;

/* a semente: o nome do material, sempre o mesmo desenho */
function semente(texto) {
  let h = 2166136261 >>> 0;
  const s = String(texto || "");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function sorteador(texto) {
  let a = semente(texto) || 1;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const r1 = (n) => Math.round(n * 10) / 10;

function marcasEmSvg(m, rnd) {
  const L = LADO_DO_LADRILHO;
  const out = [];
  const n = Math.max(0, Math.floor(Number(m.n) || 0));
  const tam = Number(m.tam) || 6;
  if (m.forma === "junta") {
    const passo = Math.max(4, Number(m.passo) || 24);
    for (let k = passo; k < L; k += passo) {
      out.push(m.deitada ? `<line x1="0" y1="${k}" x2="${L}" y2="${k}" stroke="${m.cor}" stroke-width="1.5"/>` : `<line x1="${k}" y1="0" x2="${k}" y2="${L}" stroke="${m.cor}" stroke-width="1.5"/>`);
    }
    out.push(m.deitada ? `<line x1="0" y1="0" x2="${L}" y2="0" stroke="${m.cor}" stroke-width="1.5"/>` : `<line x1="0" y1="0" x2="0" y2="${L}" stroke="${m.cor}" stroke-width="1.5"/>`);
    return out.join("");
  }
  if (m.forma === "tijolo") {
    const w = Number(m.w) || 24, h = Number(m.h) || 16;
    for (let fila = 0, y = 0; y < L; fila++, y += h) {
      const desvio = fila % 2 ? w / 2 : 0;
      for (let x = -desvio; x < L; x += w) {
        if (m.cheio) {
          const cor = m.outra && rnd() < 0.5 ? m.outra : m.cor;
          out.push(`<rect x="${r1(x + 1)}" y="${r1(y + 1)}" width="${r1(w - 2)}" height="${r1(h - 2)}" rx="2" fill="${cor}"/>`);
        } else {
          out.push(`<rect x="${r1(x)}" y="${r1(y)}" width="${w}" height="${h}" fill="none" stroke="${m.cor}" stroke-width="1.5"/>`);
        }
      }
    }
    return out.join("");
  }
  for (let k = 0; k < n; k++) {
    const x = r1(rnd() * L), y = r1(rnd() * L);
    if (m.forma === "traco") {
      const ang = m.alto ? 90 + (rnd() - 0.5) * 10 : (rnd() - 0.5) * 30;
      const c = Math.cos((ang * Math.PI) / 180) * tam / 2, s = Math.sin((ang * Math.PI) / 180) * tam / 2;
      out.push(`<line x1="${r1(x - c)}" y1="${r1(y - s)}" x2="${r1(x + c)}" y2="${r1(y + s)}" stroke="${m.cor}" stroke-width="1.6" stroke-linecap="round"/>`);
    } else if (m.forma === "tufo") {
      out.push(`<path d="M${x} ${y} l${r1(-tam / 3)} ${r1(-tam)} M${x} ${y} l0 ${r1(-tam * 1.1)} M${x} ${y} l${r1(tam / 3)} ${r1(-tam)}" stroke="${m.cor}" stroke-width="1.4" stroke-linecap="round" fill="none"/>`);
    } else if (m.forma === "pedra") {
      const rr = r1(tam * (0.6 + rnd() * 0.6));
      out.push(`<ellipse cx="${x}" cy="${y}" rx="${rr}" ry="${r1(rr * 0.75)}" fill="${m.cor}" stroke="${m.borda || "#000"}" stroke-width="1"/>`);
    } else if (m.forma === "onda") {
      out.push(`<path d="M${r1(x - tam / 2)} ${y} q${r1(tam / 4)} ${r1(-tam / 6)} ${r1(tam / 2)} 0 t${r1(tam / 2)} 0" stroke="${m.cor}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`);
    } else if (m.forma === "ponto") {
      out.push(`<circle cx="${x}" cy="${y}" r="${r1(tam)}" fill="${m.cor}"/>`);
    } else if (m.forma === "faceta") {
      out.push(`<path d="M${x} ${y} l${r1(tam)} ${r1(tam * 0.3)} l${r1(-tam * 0.4)} ${r1(tam * 0.8)} z" fill="${m.cor}"/>`);
    }
  }
  return out.join("");
}

/* o ladrilho de um material, em SVG (96 × 96), ou "" para um material que
   a tabela não conhece */
export function ladrilhoDoChao(material) {
  const m = MATERIAIS_DO_CHAO[material];
  if (!m) return "";
  const rnd = sorteador(material);
  const L = LADO_DO_LADRILHO;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${L}" viewBox="0 0 ${L} ${L}"><rect width="${L}" height="${L}" fill="${m.base}"/>${m.marcas.map((x) => marcasEmSvg(x, rnd)).join("")}</svg>`;
}

/* o mesmo ladrilho como endereço para `<image href>` ou `background-image` */
const ENDERECOS = new Map();
export function enderecoDoLadrilho(material) {
  if (ENDERECOS.has(material)) return ENDERECOS.get(material);
  const s = ladrilhoDoChao(material);
  /* o SVG cabe no endereço escapando só o que o endereço não aceita (o
     ladrilho é ASCII: cores, números e marcação) */
  const e = s ? `data:image/svg+xml;charset=utf-8,${s.replace(/"/g, "'").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E")}` : "";
  ENDERECOS.set(material, e);
  return e;
}

/* o material de cada região de uma planta (a lista de `grid.js`, na
   ordem); a região além da tabela repete o último; a planta que a tabela
   não conhece não tem chão pintado (null) */
export function chaoDasRegioes(cenario, nRegioes) {
  const t = CHAO_DA_PLANTA[cenario];
  if (!t || !t.length) return null;
  const n = Math.max(0, Math.floor(Number(nRegioes) || 0));
  return Array.from({ length: n }, (_, i) => t[Math.min(i, t.length - 1)]);
}

/* ---------------- 4. O CUSTO ESCRITO NA CARTA DE AÇÃO ---------------- */
/* F4 §2 `CARTA_DE_ACAO`: cada ação diz o que custa («ação», «passo · até
   9 m»). O recurso que cada verbo gasta já é regra (`economiaDaVez`,
   vez-na-mesa.js); aqui só se escreve a palavra dele. Os dois recuos não
   gastam recurso da vez — dizem o que fazem à vez. */
export const CUSTO_ESCRITO = {
  acao: "ação",
  bonus: "ação bônus",
  reacao: "reação",
  movimento: "passo",
};
export const CUSTO_DO_RECUO = {
  esperar: "passa a vez",
  fugir: "sai da luta",
};
/* `o.passoM`: os metros que ainda restam do passo (o «até 9 m») */
export function custoEscrito(id, recurso, o) {
  if (Object.prototype.hasOwnProperty.call(CUSTO_DO_RECUO, id)) return CUSTO_DO_RECUO[id];
  const base = CUSTO_ESCRITO[recurso] || "";
  if (!base) return "";
  const m = o && Number.isFinite(Number(o.passoM)) && o.passoM !== null ? Number(o.passoM) : null;
  if (recurso === "movimento" && m != null) return `${base} · até ${String(Math.round(m * 10) / 10).replace(".", ",")} m`;
  return base;
}
