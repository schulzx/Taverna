/* ============================================================
   A GRAVURA DA CENA — a CONTA da xilogravura (R13, etapa B)

   "Conta se prova, tela se olha." Este arquivo é a metade que se prova
   em Node: que gramática de silhueta cada bioma fala, que hachura o chão
   leva, que luz a hora acende, e — o que importa mais — QUAIS SÃO OS
   PONTOS, tirados da semente. O `rosto-da-cena.jsx` só pinta o que sai
   daqui.

   A LEI QUE MANDA AQUI É A PRIMEIRA DA CASA: determinismo por semente.
   Mesma semente, mesma cripta, em qualquer máquina. É por isso que NÃO
   nasce um segundo motor: `hashSemente` + `rng` + `escolher` vêm de
   `semente.js`, as mesmas três funções puras que o `rosto.jsx` usa desde
   a v9.126 e que já se provam em Node.

   A DÍVIDA QUE ESTA ETAPA PAGA, e estava declarada em `formas.md`:
   *a hachura do protótipo é regular, e um buril não é.* O espaçamento e
   o ângulo de CADA linha saem do mesmo `rng` — uma gravura com hachura
   métrica lê-se como PADRÃO, não como TALHO. Nenhuma linha deste arquivo
   usa passo constante.

   POR QUE COMPOSTA E NÃO UMA BIBLIOTECA DE DESENHOS: são 30 biomas
   (`moldes.js`, quatro moldes × 7–8). Trinta gravuras não são honestas
   num ciclo; sete gramáticas de silhueta e cinco hachuras cobrem os 30,
   e a semente decide a variação dentro de cada uma.

   NENHUMA COR MORA AQUI, de propósito: a luz é `LUZ_DA_CENA`, em
   `estilo.js`, ao lado de `MATERIAIS`. Este arquivo devolve geometria.
   ============================================================ */
import { hashSemente, rng, escolher } from "./semente.js";

/* ------------------------------------------------------------
   A AMPULHETA — a areia é uma função, não um desenho.

   `formas.md` (R13, os quatro glifos): a areia desenha a fracção que
   FALTA, e é o canal PRIMÁRIO do selo de prazo — geometria pura,
   sobrevive aos três daltonismos, ao cinzento e ao tamanho.

   O PISO DE 0,08 NÃO É ARREDONDAMENTO: existe para que "esta noite"
   ainda TENHA areia. Um triângulo de altura zero lê-se como um erro de
   desenho, não como urgência.
   ------------------------------------------------------------ */
export const AMPULHETA = {
  alturaMax: 5,     /* a altura da areia com o prazo cheio, no quadro 12×12 */
  piso: 0.08,       /* a fracção mínima — ver acima */
  meiaBase: 0.68,   /* a meia-base do triângulo, em múltiplos da altura */
  base: 11,         /* o y do fundo do bulbo */
  eixo: 6,          /* o x do eixo do glifo */
};

/* Devolve o `d` do triângulo de areia para uma fracção 0..1.
   `h = 5 × max(0,08, min(1, fracao))`, meia-base `0,68 × h`, e o
   triângulo é `M 6 11 L (6−meia) 11 L 6 (11−h) L (6+meia) 11 Z`. */
export function areiaDaAmpulheta(fracao) {
  const f = Math.max(AMPULHETA.piso, Math.min(1, Number.isFinite(fracao) ? fracao : 1));
  const h = AMPULHETA.alturaMax * f;
  const meia = AMPULHETA.meiaBase * h;
  const x = AMPULHETA.eixo, y = AMPULHETA.base;
  return `M ${x} ${y} L ${r2(x - meia)} ${y} L ${x} ${r2(y - h)} L ${r2(x + meia)} ${y} Z`;
}

/* ------------------------------------------------------------
   O SELO DE PRAZO — a forma que cada aperto toma.

   Tabela e não `if` pela mesma razão do `selo-de-estado.js`: os quatro
   canais (areia · palavra · forma · cor) têm de andar JUNTOS, e três
   ramos de código divergem no primeiro ajuste. A cor sai por NOME de
   token, nunca por valor — quem pinta é a tela.
   ------------------------------------------------------------ */
export const APERTOS = [
  { id: "folgado",   minimo: 3, areia: 0.85, cheio: false, token: "mundo"    },
  { id: "apertar",   minimo: 1, areia: 0.33, cheio: false, token: "amber"    },
  { id: "estaNoite", minimo: 0, areia: 0.08, cheio: true,  token: "onAccent" },
];

/* Quantas noites faltam → o aperto. `urgente` força a última noite: é a
   porta para quando o motor sabe que o prazo cai agora e a contagem de
   calendário ainda não o diz (ver `mente/pedidos-ao-sistema.md`). */
export function apertoDoPrazo(noites, urgente = false) {
  const n = Number.isFinite(noites) ? Math.max(0, Math.floor(noites)) : 0;
  if (urgente) return APERTOS[2];
  return APERTOS.find((a) => n >= a.minimo) || APERTOS[2];
}

/* A palavra e o número. `esta noite` na última — NUNCA `1/4`: o nome do
   contrato e a fracção eram o que ocupava a linha na fita antiga, e são
   a parte que o jogador já sabe. */
export function palavraDoPrazo(noites, urgente = false) {
  const n = Number.isFinite(noites) ? Math.max(0, Math.floor(noites)) : 0;
  if (urgente || n === 0) return "esta noite";
  return n === 1 ? "1 noite" : `${n} noites`;
}

/* ------------------------------------------------------------
   AS SETE GRAMÁTICAS E AS CINCO HACHURAS

   `formas.md` nomeia os exemplares de cada gramática; a tabela abaixo
   fecha os 30 biomas de `moldes.js`, porque um bioma sem linha cai no
   `liso` e o `liso` é a DEGRADAÇÃO, não a regra. As sete atribuições que
   `formas.md` não nomeia levam a marca ⌁ na própria linha — são desta
   mão, e estão escritas para poderem ser recusadas numa linha.
   ------------------------------------------------------------ */
export const GRAMATICAS = ["duna", "copa", "crista", "coluna", "vaga", "veu", "arco", "liso"];
export const HACHURAS = ["seca", "molhada", "pedra", "lajeado", "nenhuma"];

export const BIOMAS_DA_GRAVURA = {
  /* superfície */
  planicie:   { silhueta: "duna",   hachura: "seca" },
  floresta:   { silhueta: "copa",   hachura: "seca" },
  colina:     { silhueta: "crista", hachura: "seca" },
  montanha:   { silhueta: "crista", hachura: "pedra" },
  deserto:    { silhueta: "duna",   hachura: "seca" },
  pantano:    { silhueta: "veu",    hachura: "molhada" },
  costa:      { silhueta: "duna",   hachura: "molhada" },
  gelo:       { silhueta: "duna",   hachura: "pedra" },
  /* torre */
  salao:      { silhueta: "coluna", hachura: "lajeado" },
  jardim:     { silhueta: "copa",   hachura: "lajeado" },
  oficina:    { silhueta: "coluna", hachura: "lajeado" },
  biblioteca: { silhueta: "coluna", hachura: "lajeado" },
  masmorra:   { silhueta: "coluna", hachura: "pedra" },   /* ⌁ não nomeado em formas.md */
  santuario:  { silhueta: "coluna", hachura: "lajeado" },
  vazio:      { silhueta: "liso",   hachura: "nenhuma" }, /* ⌁ o "nenhuma (o vazio)" das cinco hachuras */
  forno:      { silhueta: "coluna", hachura: "pedra" },   /* ⌁ não nomeado em formas.md */
  /* mar */
  mar_aberto: { silhueta: "vaga",   hachura: "molhada" },
  recife:     { silhueta: "crista", hachura: "molhada" },
  ilha_selva: { silhueta: "copa",   hachura: "seca" },
  ilha_seca:  { silhueta: "duna",   hachura: "seca" },    /* ⌁ não nomeado em formas.md */
  enseada:    { silhueta: "vaga",   hachura: "molhada" },
  bruma:      { silhueta: "veu",    hachura: "molhada" },
  abissal:    { silhueta: "vaga",   hachura: "molhada" },
  /* estelar */
  orbital:    { silhueta: "arco",   hachura: "pedra" },
  rochoso:    { silhueta: "crista", hachura: "pedra" },   /* ⌁ não nomeado em formas.md */
  gasoso:     { silhueta: "veu",    hachura: "nenhuma" }, /* ⌁ não nomeado em formas.md */
  cinturao:   { silhueta: "arco",   hachura: "seca" },
  estacao:    { silhueta: "arco",   hachura: "lajeado" },
  nebulosa:   { silhueta: "veu",    hachura: "nenhuma" },
  morto:      { silhueta: "arco",   hachura: "seca" },    /* ⌁ não nomeado em formas.md */
};

/* O BIOMA DESCONHECIDO NÃO DÁ BURACO: dá horizonte liso com hachura, que
   é uma gravura legítima e não um erro. `formas.md`, a degradação. */
export const GRAMATICA_LISA = { silhueta: "liso", hachura: "seca" };
export function gramaticaDo(bioma) {
  const k = typeof bioma === "string" ? bioma : (bioma && bioma.id) || "";
  return BIOMAS_DA_GRAVURA[k] || GRAMATICA_LISA;
}

/* ------------------------------------------------------------
   AS TRÊS BANDAS, em px do alto da faixa de 96.
   A gramática é curta de propósito (`formas.md`).
   ------------------------------------------------------------ */
export const BANDAS = {
  altura: 96,
  ceu: [0, 62],       /* gradiente da luz + o astro + hachura que adensa */
  horizonte: 62,      /* a linha onde a silhueta pousa */
  chao: [62, 96],     /* a cor da luz + hachura diagonal + a linha do chão */
  legenda: 76,        /* o y da linha de base da legenda, na banda do chão */
};

/* ------------------------------------------------------------
   A HORA NÃO MUDA O DESENHO: MUDA A LUZ.

   As quatro receitas são de cor e moram em `LUZ_DA_CENA` (`estilo.js`).
   Aqui fica só QUAL delas a hora acende — e as fronteiras são tabela
   pela mesma razão de sempre: uma hora que caísse em dois `if` teria
   duas luzes conforme a ordem dos ramos.

   ⌁ AS FRONTEIRAS SÃO DESTA MÃO: `formas.md` nomeia as quatro luzes e
   dá a receita de cada uma, mas não diz onde uma acaba e a outra começa.
   Estão escritas aqui para poderem ser recusadas numa linha. */
export const LUZES = ["madrugada", "dia", "entardecer", "noite"];
export const HORARIO_DA_LUZ = [
  { luz: "madrugada",  de: 4,  ate: 8  },
  { luz: "dia",        de: 8,  ate: 18 },
  { luz: "entardecer", de: 18, ate: 21 },
  { luz: "noite",      de: 21, ate: 4  },  /* atravessa a meia-noite */
];

/* Aceita número (0–23), "HH:MM", ou o próprio nome da luz — a cinta tem
   a hora como texto e o motor tem-na como número, e uma peça que só
   soubesse um dos dois obrigaria quem a chama a converter. */
export function luzDaHora(hora) {
  if (typeof hora === "string") {
    const nome = hora.trim().toLowerCase();
    if (LUZES.includes(nome)) return nome;
    const m = nome.match(/(\d{1,2})\s*[:h]/);
    if (m) return luzDaHora(Number(m[1]));
    const n = Number(nome);
    if (Number.isFinite(n)) return luzDaHora(n);
    return "dia";
  }
  if (!Number.isFinite(hora)) return "dia";
  const h = ((Math.floor(hora) % 24) + 24) % 24;
  for (const f of HORARIO_DA_LUZ) {
    if (f.de < f.ate ? h >= f.de && h < f.ate : h >= f.de || h < f.ate) return f.luz;
  }
  return "dia";
}

/* ------------------------------------------------------------
   O BURIL — a hachura irregular, que é a dívida que esta etapa paga.

   Cada linha tira o SEU passo e o SEU ângulo do mesmo `rng`. Um buril
   não anda de compasso: se o passo fosse constante, a mancha lia-se como
   trama de máquina.
   ------------------------------------------------------------ */
const r2 = (n) => Math.round(n * 100) / 100;

/* A LARGURA DE REFERENCIA e o telefone de 375 px em que o orcamento de
   R13 foi medido (`mente/r13-mesa.md`, TELEFONE 375x812). Nao e um teto:
   e o valor que a faixa desenha quando ninguem lhe diz a largura. */
export const LARGURA_DE_REFERENCIA = 375;

/* `de`/`ate` em x, `passo` médio, `solta` a folga do passo, `y` a linha
   de base, `comprimento` o talho, `inclinacao` em unidades de y por x. */
function talhos(rand, { de, ate, passo, solta, y, comprimento, inclinacao, tremor }) {
  const linhas = [];
  let x = de + rand() * passo;
  let guarda = 0;
  while (x < ate && guarda++ < 2000) {
    const inc = inclinacao + (rand() - 0.5) * tremor;
    const comp = comprimento * (0.6 + rand() * 0.8);
    const yy = y + (rand() - 0.5) * (tremor * 6);
    linhas.push(`M ${r2(x)} ${r2(yy)} l ${r2(comp)} ${r2(comp * inc)}`);
    x += passo * (1 - solta + rand() * solta * 2);
  }
  return linhas;
}

/* A HACHURA DO CÉU adensa para o horizonte: o passo entre as fiadas
   encolhe conforme se aproxima de `BANDAS.horizonte`. É o que dá
   profundidade a uma gravura sem um único meio-tom. */
export function hachuraDoCeu(rand, largura = LARGURA_DE_REFERENCIA) {
  const linhas = [];
  let y = 8;
  let guarda = 0;
  while (y < BANDAS.horizonte - 2 && guarda++ < 60) {
    const prox = (y - 8) / (BANDAS.horizonte - 10);          /* 0 no alto, 1 no horizonte */
    const passo = 11 - prox * 8;                             /* 11 px em cima, 3 px em baixo */
    linhas.push(...talhos(rand, {
      de: -4, ate: largura + 4, passo: 16 - prox * 8, solta: 0.55,
      y, comprimento: 7 + prox * 6, inclinacao: -0.05, tremor: 0.12,
    }));
    y += passo * (0.75 + rand() * 0.5);
  }
  return linhas;
}

/* AS CINCO HACHURAS DE CHÃO. Cada uma é um talho diferente, não uma
   densidade diferente — é assim que se distinguem em cinzento. */
export function hachuraDoChao(rand, tipo, largura = LARGURA_DE_REFERENCIA) {
  const [topo, fundo] = BANDAS.chao;
  if (tipo === "nenhuma") return [];
  const linhas = [];
  if (tipo === "lajeado") {
    /* a grelha: fiadas horizontais e juntas verticais desencontradas */
    let y = topo + 5;
    let guarda = 0;
    while (y < fundo - 2 && guarda++ < 40) {
      linhas.push(`M -4 ${r2(y)} L ${largura + 4} ${r2(y + (rand() - 0.5) * 0.8)}`);
      let x = -4 + rand() * 14;
      while (x < largura + 4) {
        linhas.push(`M ${r2(x)} ${r2(y)} l ${r2((rand() - 0.5) * 0.6)} ${r2(7 * (0.6 + rand() * 0.5))}`);
        x += 12 + rand() * 12;
      }
      y += 8 + rand() * 3;
    }
    return linhas;
  }
  if (tipo === "molhada") {
    /* a ondulação: talhos longos, quase deitados, em fiadas soltas */
    let y = topo + 4;
    let guarda = 0;
    while (y < fundo - 1 && guarda++ < 40) {
      let x = -6 + rand() * 10;
      while (x < largura + 4) {
        const c = 9 + rand() * 12;
        linhas.push(`M ${r2(x)} ${r2(y)} q ${r2(c / 2)} ${r2(-1.2 - rand())} ${r2(c)} 0`);
        x += c + 3 + rand() * 7;
      }
      y += 4 + rand() * 3.5;
    }
    return linhas;
  }
  if (tipo === "pedra") {
    /* o talho curto e duro, cruzado a dois ângulos */
    for (const inc of [0.9, -0.9]) {
      let y = topo + 3;
      let guarda = 0;
      while (y < fundo && guarda++ < 40) {
        linhas.push(...talhos(rand, {
          de: -6, ate: largura + 6, passo: 9, solta: 0.6,
          y, comprimento: 3.5, inclinacao: inc, tremor: 0.3,
        }));
        y += 5 + rand() * 4;
      }
    }
    return linhas;
  }
  /* `seca`: a diagonal do buril, o talho longo da terra rachada */
  let y = topo + 2;
  let guarda = 0;
  while (y < fundo + 10 && guarda++ < 40) {
    linhas.push(...talhos(rand, {
      de: -12, ate: largura + 8, passo: 13, solta: 0.5,
      y, comprimento: 10, inclinacao: 0.55, tremor: 0.22,
    }));
    y += 4.5 + rand() * 3.5;
  }
  return linhas;
}

/* ------------------------------------------------------------
   A SILHUETA — uma massa de tinta, sem meio-tom.

   Todas devolvem um `d` fechado sobre a linha do horizonte, em
   coordenadas de 0 a 100 no x (a faixa escala-as para a largura real) e
   em px no y (a altura da faixa é fixa em 96, e as bandas com ela).
   ------------------------------------------------------------ */
const CHAO = BANDAS.horizonte;

function silhuetaDuna(rand) {
  const quantas = 3 + Math.floor(rand() * 2);
  let d = `M -6 ${CHAO}`;
  let x = -6;
  for (let i = 0; i < quantas; i++) {
    const larg = (112 / quantas) * (0.7 + rand() * 0.6);
    const alto = CHAO - (8 + rand() * 10);
    const crista = x + larg * (0.35 + rand() * 0.3);
    d += ` C ${r2(x + larg * 0.2)} ${r2(alto + 3)} ${r2(crista - larg * 0.1)} ${r2(alto)} ${r2(crista)} ${r2(alto)}`;
    d += ` C ${r2(crista + larg * 0.25)} ${r2(alto + 1)} ${r2(x + larg * 0.85)} ${r2(CHAO - 2)} ${r2(x + larg)} ${CHAO}`;
    x += larg;
  }
  return d + ` L 106 ${CHAO} Z`;
}

function silhuetaCopa(rand) {
  let d = `M -6 ${CHAO}`;
  let x = -6;
  let guarda = 0;
  while (x < 106 && guarda++ < 30) {
    const larg = 9 + rand() * 13;
    const alto = CHAO - (12 + rand() * 12);
    const tronco = 2 + rand() * 2;
    d += ` L ${r2(x + larg * 0.5 - tronco / 2)} ${r2(CHAO - 4 - rand() * 3)}`;
    d += ` C ${r2(x)} ${r2(alto + 6)} ${r2(x + larg * 0.1)} ${r2(alto)} ${r2(x + larg * 0.5)} ${r2(alto)}`;
    d += ` C ${r2(x + larg * 0.9)} ${r2(alto)} ${r2(x + larg)} ${r2(alto + 6)} ${r2(x + larg * 0.5 + tronco / 2)} ${r2(CHAO - 4 - rand() * 3)}`;
    d += ` L ${r2(x + larg)} ${CHAO}`;
    x += larg * (0.8 + rand() * 0.3);
  }
  return d + ` L 106 ${CHAO} Z`;
}

function silhuetaCrista(rand) {
  let d = `M -6 ${CHAO}`;
  let x = -6;
  let guarda = 0;
  while (x < 106 && guarda++ < 24) {
    const larg = 12 + rand() * 20;
    const alto = CHAO - (14 + rand() * 18);
    const pico = x + larg * (0.3 + rand() * 0.4);
    d += ` L ${r2(pico)} ${r2(alto)}`;
    /* o ressalto: um pico de gravura não desce num traço só */
    d += ` L ${r2(pico + larg * 0.18)} ${r2(alto + 4 + rand() * 4)}`;
    d += ` L ${r2(x + larg)} ${r2(CHAO - rand() * 3)}`;
    x += larg * (0.7 + rand() * 0.4);
  }
  return d + ` L 106 ${CHAO} Z`;
}

function silhuetaColuna(rand) {
  let d = `M -6 ${CHAO} L -6 ${r2(CHAO - 6 - rand() * 4)} L 106 ${r2(CHAO - 6 - rand() * 4)} L 106 ${CHAO} Z`;
  let x = -2;
  let guarda = 0;
  while (x < 104 && guarda++ < 16) {
    const larg = 5 + rand() * 5;
    const alto = CHAO - (14 + rand() * 14);
    const capitel = 1.6 + rand();
    d += ` M ${r2(x)} ${CHAO} L ${r2(x)} ${r2(alto + 3)}`;
    d += ` L ${r2(x - capitel)} ${r2(alto + 3)} L ${r2(x - capitel)} ${r2(alto)}`;
    d += ` L ${r2(x + larg + capitel)} ${r2(alto)} L ${r2(x + larg + capitel)} ${r2(alto + 3)}`;
    d += ` L ${r2(x + larg)} ${r2(alto + 3)} L ${r2(x + larg)} ${CHAO} Z`;
    x += larg + 6 + rand() * 10;
  }
  return d;
}

/* A VAGA — e ela foi REFEITA depois de se ver desenhada. A primeira
   versão empilhava cristas de 3 px e fechava cada uma até à linha do
   horizonte: no ecrã dava uma lasca de tinta de cinco pixéis, e o mar
   aberto era a única das sete gramáticas que não se via. Uma silhueta
   que não se lê não é uma silhueta discreta — é uma que não existe.

   O que se lê como mar numa gravura não é UMA massa: são FIADAS de
   crista, cada uma uma faixa fina e ondulada, com o papel a respirar
   entre elas. É por isso que esta é a única das sete que devolve várias
   faixas em vez de um perfil. */
function silhuetaVaga(rand) {
  const fiadas = 3 + Math.floor(rand() * 2);
  let d = "";
  let base = CHAO - 1;
  for (let i = 0; i < fiadas; i++) {
    const esp = 1.8 + rand() * 1.6;          /* a espessura da fiada */
    const cava = -2.5 - rand() * 3.5;        /* quanto a crista sobe */
    let x = -6;
    let guarda = 0;
    let ida = ` M -6 ${r2(base)}`;
    while (x < 106 && guarda++ < 20) {
      const c = 11 + rand() * 13;
      ida += ` q ${r2(c / 2)} ${r2(cava)} ${r2(c)} 0`;
      x += c;
    }
    d += ida + ` L ${r2(x)} ${r2(base + esp)} L -6 ${r2(base + esp)} Z`;
    base -= esp + 3.5 + rand() * 3;          /* o papel entre as fiadas */
  }
  return d;
}

function silhuetaVeu(rand) {
  /* uma massa larga e baixa, de topo esfarrapado: bruma, pântano, nébula */
  let d = `M -6 ${CHAO} L -6 ${r2(CHAO - 6 - rand() * 4)}`;
  let x = -6;
  let guarda = 0;
  while (x < 106 && guarda++ < 30) {
    const c = 8 + rand() * 12;
    const alto = CHAO - (5 + rand() * 12);
    d += ` C ${r2(x + c * 0.3)} ${r2(alto)} ${r2(x + c * 0.7)} ${r2(alto)} ${r2(x + c)} ${r2(CHAO - 4 - rand() * 7)}`;
    x += c;
  }
  return d + ` L 106 ${CHAO} Z`;
}

function silhuetaArco(rand) {
  /* o arco do orbital: um segmento de anel que atravessa a banda */
  const raio = 46 + rand() * 26;
  const cx = 20 + rand() * 60;
  const cy = CHAO + raio * (0.45 + rand() * 0.25);
  const esp = 3 + rand() * 3;
  const d1 = `M ${r2(cx - raio)} ${r2(cy)} A ${r2(raio)} ${r2(raio)} 0 0 1 ${r2(cx + raio)} ${r2(cy)}`;
  const d2 = `L ${r2(cx + raio - esp)} ${r2(cy)} A ${r2(raio - esp)} ${r2(raio - esp)} 0 0 0 ${r2(cx - raio + esp)} ${r2(cy)} Z`;
  /* mais o chão sólido, senão o arco flutua sobre nada */
  const chao = ` M -6 ${CHAO} L -6 ${r2(CHAO - 3 - rand() * 3)} L 106 ${r2(CHAO - 3 - rand() * 3)} L 106 ${CHAO} Z`;
  return d1 + " " + d2 + chao;
}

function silhuetaLisa(rand) {
  const y = r2(CHAO - 2 - rand() * 3);
  return `M -6 ${CHAO} L -6 ${y} L 106 ${r2(y + (rand() - 0.5) * 2)} L 106 ${CHAO} Z`;
}

const DESENHO_DA_SILHUETA = {
  duna: silhuetaDuna, copa: silhuetaCopa, crista: silhuetaCrista, coluna: silhuetaColuna,
  vaga: silhuetaVaga, veu: silhuetaVeu, arco: silhuetaArco, liso: silhuetaLisa,
};

/* ------------------------------------------------------------
   A CENA INTEIRA, numa chamada só.

   `hashSemente(semente_do_mundo + "|" + bioma + "|" + lugar)` — a
   semente de `formas.md`, byte a byte. Devolve GEOMETRIA: quem pinta é a
   tela, e é por isso que isto se prova em Node.
   ------------------------------------------------------------ */
export function gravuraDaCena({ semente = "", bioma = "", lugar = "", hora = 12, largura = LARGURA_DE_REFERENCIA } = {}) {
  const w = Math.max(80, Math.min(2000, Number.isFinite(largura) ? Math.round(largura) : LARGURA_DE_REFERENCIA));
  const g = gramaticaDo(bioma);
  const rand = rng(hashSemente(String(semente) + "|" + String(bioma) + "|" + String(lugar)));
  /* A ORDEM DOS SORTEIOS É PARTE DA SEMENTE: trocar duas linhas aqui
     muda TODAS as cripta deste jogo. Quem mexer, mexe de propósito. */
  const silhueta = (DESENHO_DA_SILHUETA[g.silhueta] || silhuetaLisa)(rand);
  const ceu = hachuraDoCeu(rand, w);
  const chao = hachuraDoChao(rand, g.hachura, w);
  const luz = luzDaHora(hora);
  /* o astro: `escolher` põe o mesmo sorteio da casa a decidir de que
     lado do céu ele nasce — e `alto`/`baixo` vem da receita da luz. */
  const lado = escolher(rand, [0.18, 0.3, 0.7, 0.82]);
  return {
    luz,
    silhueta: g.silhueta,
    hachura: g.hachura,
    d: { silhueta, ceu, chao },
    largura: w,
    /* A SILHUETA vive em 0..100 e a faixa escala-a; a HACHURA vive em px
       e nao se escala. E o que um prelo faz: a chapa aumenta, o buril
       nao. Escalar a hachura com a largura deitaria os talhos e a
       xilogravura lia-se esborratada num ecra largo. */
    escala: r2(w / 100),
    astro: { x: r2(lado * w), raio: r2(4.5 + rand() * 2.5) },
    /* a linha do chão: o fio que separa a banda do horizonte da do chão */
    linhaDoChao: `M -6 ${CHAO} L ${w + 6} ${r2(CHAO + (rand() - 0.5) * 0.6)}`,
  };
}
