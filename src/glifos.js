/* ============================================================
   OS GLIFOS DESENHADOS (V3, 24/09) — o desenho é número, logo é tabela

   A LEI QUE ISTO CUMPRE é a primeira da casa, um andar mais fundo: se a
   cor é número e por isso é tabela, o DESENHO de um ícone também é — são
   coordenadas. Um emoji do sistema não tem nenhuma das duas coisas nossas:
   medido em Windows 11 / Chromium 152, 97 dos 128 emoji distintos da
   interface saem na COR do fabricante (ignoram `T` por inteiro) e três
   deles (👣 👥 🐾) não têm UM píxel a 3:1 contra `T.panel`. A forma muda
   de Windows para Android para iOS (cada fabricante desenha o seu), e a
   cor nunca foi da casa. Aqui a forma é uma e a cor vem sempre de `T`.

   A GRAMÁTICA (`formas.md` §V3):
   · grelha 24, área viva 2–22 (a do Lucide), um `d` por glifo;
   · traço redondo (cap e junta), SEM enchimento — a cor é uma só, a do
     traço, e sai de `T` pela prop `cor` do `Glifo` (`ui.jsx`);
   · o traço é medido em PÍXEIS da tela, não em unidades da grelha:
     `TRACO_DO_GLIFO` dá 2 px a 24, 1,75 a 20, 1,5 a 16, 1,25 a 12 — o
     tamanho óptico do Material Symbols (o traço engrossa, relativo ao
     desenho, quando o ícone encolhe), para um glifo de 12 não virar um
     fio de 1 px que o anti-alias apaga;
   · os quatro da cinta (moeda ◉, mana ◆, vida, ampulheta) NÃO estão aqui:
     têm forma desde R13, em quadro 12 e com miolo cheio, e o `Glifo` pede-
     -os pelo nome a `ui.jsx`. Uma ação, uma forma — não se redesenha.

   A ORIGEM. As entradas marcadas `lucide:<nome>` são a geometria do
   Lucide 1.48.0 (https://lucide.dev), ISC License:
     Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022
     as part of Feather (MIT). All other copyright (c) for Lucide are held
     by Lucide Contributors 2022.
     Permission to use, copy, modify, and/or distribute this software for
     any purpose with or without fee is hereby granted, provided that the
     above copyright notice and this permission notice appear in all copies.
     THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL
     WARRANTIES WITH REGARD TO THIS SOFTWARE.
   Círculos e retângulos do Lucide foram escritos como `path` (a tabela
   guarda um `d` por glifo); a geometria é a mesma. As marcadas `casa`
   são desenho nosso: o d20 (um icosaedro projetado de verdade — o Lucide
   não tem), a ascensão e a masmorra.

   CADA ENTRADA TEM LEITOR NO DIA EM QUE NASCE (`check-formas`, D5h):
   glifo que só uma etapa futura vai ler nasce com ela.
   ============================================================ */

/* O traço, em píxeis de tela, por tamanho de glifo. Entre dois degraus,
   interpola; fora da tabela, fica no degrau da ponta. */
/* V4 · a régua do grave mora em `ANEL` (estilo.js), ao lado do desenho do anel;
   daqui só se lê. */
import { ANEL, CHEGADA, CINTA, RECIBO, TIPOS } from "./estilo.js";
/* A1 · o custo que surpreende e a legenda do passo leem a MESMA régua do
   tabuleiro; o relato arrumado reusa a forma de hoje da corrida (o saldo). */
import { METROS_POR_QUADRADO, metrosTxt, terrenoDificil, nomeDoLugar } from "./grid.js";
import { dividirBloco } from "./resumo.js";
/* A1 · o recibo do turno conta o XP que atravessou um nível: a curva é a
   mesma que `aplicarNivel` (regras-jogo.js) usa para descontar o vão. */
import { XP_POR_NIVEL } from "./constantes.js";

export const TRACO_DO_GLIFO = { 12: 1.25, 16: 1.5, 20: 1.75, 24: 2 };

/* Os tamanhos da família são 12 · 16 · 20 · 24 (`formas.md` §V3). O alvo
   de toque de um glifo-botão NUNCA é o glifo: é `ALVOS.piso` (48) à volta
   dele, nos dois eixos. */
export function tracoDoGlifo(tamanho) {
  const t = Number(tamanho);
  const degraus = Object.keys(TRACO_DO_GLIFO).map(Number).sort((a, b) => a - b);
  if (!Number.isFinite(t) || t <= degraus[0]) return TRACO_DO_GLIFO[degraus[0]];
  if (t >= degraus[degraus.length - 1]) return TRACO_DO_GLIFO[degraus[degraus.length - 1]];
  for (let i = 1; i < degraus.length; i++) {
    const a = degraus[i - 1], b = degraus[i];
    if (t <= b) return TRACO_DO_GLIFO[a] + ((t - a) / (b - a)) * (TRACO_DO_GLIFO[b] - TRACO_DO_GLIFO[a]);
  }
  return TRACO_DO_GLIFO[degraus[degraus.length - 1]];
}

/* O traço em UNIDADES DA GRELHA, que é o que o `strokeWidth` do SVG quer. */
export function tracoNaGrelha(tamanho) {
  const t = Math.max(1, Number(tamanho) || 24);
  return +((tracoDoGlifo(t) * 24) / t).toFixed(3);
}

export const GLIFOS = {
  /* o dado: o teste, a rolagem, o sorteio — o d20 da casa · aposenta 🎲, e o d6 de IconeDado */
  dado: { de: "casa", d: "M12 2l8.66 5v10L12 22l-8.66-5V7zM12 5.82l5.35 9.27H6.65zM12 2v3.82M3.34 17l3.31-1.91M20.66 17l-3.31-1.91" },
  /* para onde vou: a sala do Mapa, viajar, a estrada · aposenta 🧭 🗺 */
  mapa: { de: "lucide:compass", d: "M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0M16.24 7.76l-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" },
  /* a bolsa: a sala e o botão da luta · aposenta ◆ quando dizia bolsa (◆ é o PM) */
  bolsa: { de: "lucide:wallet-minimal", d: "M17 14h.01M7 7h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14" },
  /* o Diário, e o anteriormente · aposenta 📜 da aba */
  diario: { de: "lucide:book-open", d: "M12 5v16M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" },
  /* o grupo: quem anda contigo, jogar em dois · aposenta 👥 🚶 */
  grupo: { de: "lucide:users-round", d: "M18 21a8 8 0 0 0-16 0M5 8a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" },
  /* a Ascensão: a sala, o despertar, o título divino · aposenta 🌟, e o losango da aba (era o do PM) */
  ascensao: { de: "casa", d: "M6.5 4a5.5 1.5 0 1 0 11 0a5.5 1.5 0 1 0 -11 0M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M18 22v-1a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v1" },
  /* onde estou · aposenta 📍 */
  alfinete: { de: "lucide:map-pin", d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0M9 10a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" },
  /* aviso — reaja · aposenta ⚠, e o ⚔ da guerra política */
  aviso: { de: "lucide:triangle-alert", d: "M21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4M12 17h.01" },
  /* trancado até… · aposenta 🔒 */
  cadeado: { de: "lucide:lock", d: "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-7a2 2 0 0 1 2 -2zM7 11V7a5 5 0 0 1 10 0v4" },
  /* o que ainda não viste · aposenta ❔ */
  desconhecido: { de: "lucide:circle-help", d: "M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" },
  /* a magia · aposenta ✦ ✧ ✨, e o 📖 do caderno */
  faisca: { de: "lucide:sparkles", d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594zM20 2v4M22 4h-4M2 20a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" },
  /* o golpe, o dano · aposenta ⚔ ⚡ 💢 */
  espadas: { de: "lucide:swords", d: "M13 19l6-6M14.5 17.5 3.586 6.586A2 2 0 013 5.172V3h2.172a2 2 0 011.414.586L17.5 14.5M14.828 6.172l2.586-2.586A2 2 0 0118.828 3H21v2.172a2 2 0 01-.586 1.414l-2.586 2.586M16 16l4 4M19 21l2-2M5 14l4 4M5 21l-2-2M7.5 16.5 4 20" },
  /* a arma — só no menu e na criação (IconeEspada) · aposenta — */
  espada: { de: "lucide:sword", d: "M11 19l-6-6M5 21l-2-2M8 16l-4 4M9.5 17.5 20.414 6.586A2 2 0 0021 5.172V3h-2.172a2 2 0 00-1.414.586L6.5 14.5" },
  /* o movimento que resta na rodada · aposenta 👣 */
  passo: { de: "lucide:footprints", d: "M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0ZM20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0ZM16 17h4M4 13h4" },
  /* a boca de uma masmorra · aposenta 🕳 */
  masmorra: { de: "casa", d: "M4 21V11a8 8 0 0 1 16 0v10M2 21h20M7.5 21v-2.5H11V16h3.5v-2.5H17" },
  /* a hora, o tempo que passa: recarga, ritual · aposenta ⏳ quando não é prazo */
  relogio: { de: "lucide:clock", d: "M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0M12 6v6l4 2" },
  /* a defesa: proteger, o escudo, a pele que endurece · aposenta 🛡 🪨 ⛰ (V3b) */
  escudo: { de: "lucide:shield", d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" },
  /* a essência, a moeda do ofício · aposenta ⚗ ⚒ (V3b) */
  essencia: { de: "lucide:flask-round", d: "M10 2v6.292a7 7 0 1 0 4 0V2M5 15h14M8.5 2h7" },
  /* descansar, acampar, o sono · aposenta ⛺ 🌙 (V3b) */
  descanso: { de: "lucide:tent", d: "M3.5 21 14 3M20.5 21 10 3M15.5 21 12 15l-3.5 6M2 21h20" },
  /* o perigo mortal · aposenta ☠ 💀 ⚰ 🪤 🪂 (V3b) */
  perigo: { de: "lucide:skull", d: "M12.5 17l-.5-1-.5 1h1zM15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1zM14 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M8 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" },
  /* procurar, perceber, deduzir · aposenta 🔎 🔍 👁 (V3b) */
  procurar: { de: "lucide:search", d: "M21 21l-4.34-4.34M3 11a8 8 0 1 0 16 0a8 8 0 1 0 -16 0" },
  /* trabalho, contrato, decreto · aposenta 📋 📌 📜 ✅ ✖ 📣 🗡 (V3b) */
  trabalho: { de: "lucide:scroll-text", d: "M15 12h-5M15 8h-5M19 17V5a2 2 0 0 0-2-2H4M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" },
  /* as tochas, recurso contado · aposenta 🕯 (V3b) */
  tocha: { de: "lucide:flame", d: "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" },
  /* o seu herói, e o legado · aposenta ⚜ (V3b) */
  heroi: { de: "lucide:user", d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M8 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" },
  /* venceu: conquista, título · aposenta 🏆 (V3b) */
  trofeu: { de: "lucide:trophy", d: "M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3M4 22h16M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zM6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3" },
  /* V4 · a coroa: marca o SEU herói na cinta (o `crown-badge` da v3, `126:13`) */
  coroa: { de: "lucide:crown", d: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294zM5 21h14" },
  /* o que te ajuda: condição boa, vantagem, dádiva · aposenta 🌠 ⬆ 🍲, e o ✦ da condição boa (V3b) */
  favor: { de: "lucide:chevrons-up", d: "M17 11l-5-5-5 5M17 18l-5-5-5 5" },
  /* o que te pesa: condição ruim, exaustão · aposenta 🥱 😩 🌑, e o ☠ da condição ruim (V3b) */
  contra: { de: "lucide:chevrons-down", d: "M7 6l5 5 5-5M7 13l5 5 5-5" },
  /* ouvir a voz do Mestre · aposenta 🔊 (V3b) */
  ouvir: { de: "lucide:volume-2", d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298zM16 9a5 5 0 0 1 0 6M19.364 18.364a9 9 0 0 0 0-12.728" },
  /* parar a voz · aposenta ⏸ (V3b) */
  pausa: { de: "lucide:pause", d: "M15 3h3a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-16a1 1 0 0 1 1 -1zM6 3h3a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-16a1 1 0 0 1 1 -1z" },
  /* a sala do Códice · aposenta a caveira na aba (V3c) (V3b) */
  codice: { de: "lucide:amphora", d: "M10 2v5.632c0 .424-.272.795-.653.982A6 6 0 0 0 6 14c.006 4 3 7 5 8M10 5H8a2 2 0 0 0 0 4h.68M14 2v5.632c0 .424.272.795.652.982A6 6 0 0 1 18 14c0 4-3 7-5 8M14 5h2a2 2 0 0 1 0 4h-.68M18 22H6M9 2h6" },
  /* a marca da forma Impedido, NÃO um assunto: dentro do ladrilho oco, sem ela o
     quadrado vazio lia-se caixa por marcar (v3-jogo.md §9.1). Nenhuma fala a pede
     pela tabela; quem a desenha é LadrilhoDoAssunto e o selo "sem ação" da cinta. */
  /* a luz da cena: madrugada (4h–8h) · V3c: a luz do TEMPO e do cabecalho da pagina (luzDaHora) */
  madrugada: { de: "lucide:sunrise", d: "M12 2v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M8 6l4-4 4 4M16 18a4 4 0 0 0-8 0" },
  /* a luz da cena: dia (8h–18h) · V3c: a luz do TEMPO e do cabecalho da pagina (luzDaHora) */
  dia: { de: "lucide:sun", d: "M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" },
  /* a luz da cena: entardecer (18h–21h) · V3c: a luz do TEMPO e do cabecalho da pagina (luzDaHora) */
  entardecer: { de: "lucide:sunset", d: "M12 10V2M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M16 6l-4 4-4-4M16 18a4 4 0 0 0-8 0" },
  /* a luz da cena: noite (21h–4h) · V3c: a luz do TEMPO e do cabecalho da pagina (luzDaHora) */
  noite: { de: "lucide:moon", d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" },
  ban: { de: "lucide:ban", d: "M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0M4.929 4.929l14.142 14.142" },
  /* B1 · a mesa de batalha (Figma `151:1662`, 05/10) — os quatro que o quadro
     desenha e a família não tinha. Os três primeiros são o Lucide que o próprio
     quadro usa (scan, crosshair, pen-line, na grelha 18 → 24); o quarto é o ✧
     do quadro, desenhado: nenhuma família da casa tem U+2727 (D5h). */
  /* o campo de batalha: o cabeçalho da arena */
  campo: { de: "lucide:scan", d: "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" },
  /* o alvo e a distância: a linha do veredito */
  mira: { de: "lucide:crosshair", d: "M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0M22 12h-4M6 12H2M12 6V2M12 22v-4" },
  /* o `como?`: a frase que o jogador escreve */
  pena: { de: "lucide:pen-line", d: "M13 21h8M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" },
  /* a runa de quatro pontas — o ornamento dos fios da mesa */
  estrela: { de: "casa", d: "M12 3C12.5 9 15 11.5 21 12C15 12.5 12.5 15 12 21C11.5 15 9 12.5 3 12C9 11.5 11.5 9 12 3Z" },
  /* A1 · o rosto de quem não é gente (`formas.md` §A1 4, Figma `254:72`/`254:77`).
     Um SINAL e não um rosto de lobo desenhado: o retrato de gente diz QUEM; de
     um bicho o jogador só precisa de saber que tipo de coisa é — e o defeito
     (N6) era o lobo de rosto humano ler-se "bandido". Quem os escolhe é
     `ROSTO_DA_MENTE` (abaixo), e quem os desenha é o `Rosto` (rosto.jsx). */
  /* o rosto de quem é bicho (menteDaCriatura = besta) */
  fera: { de: "lucide:paw-print", d: "M9 4a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M16 8a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M18 16a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" },
  /* o rosto de quem já morreu e anda (menteDaCriatura = morto). NÃO é a caveira:
     `perigo` já é a caveira e quer dizer o perigo mortal (V3b); no retrato, o
     morto-vivo ler-se-ia "isto está morto", e há o estado tombado que diz isso */
  morto: { de: "lucide:bone", d: "M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z" },
};

/* ============================================================
   O ASSUNTO DA LINHA (V3b, 25/09) — o motor escreve, o ecrã traduz

   As falas do sistema (296 no `App.jsx`, e as dos módulos) abrem com um
   emoji: `⛔ Bola de Fogo custa 3 PM`, `🧭 Chegada: …`, `⚗ +3 de
   essência`. São ~110 prefixos diferentes, e a mesma coisa chegava a ter
   14 caras (`v3-jogo.md` §1). O motor NÃO se toca — é território do
   sistema, e a fila dele está parada. Quem traduz é esta tabela: o
   prefixo sai da frase e vira UM dos glifos da família, ou nenhum.

   AS TRÊS RESPOSTAS DA TABELA:
   · um nome de glifo  → o ladrilho do assunto, tom Neutro;
   · `IMPEDIDO` (ou `impedidoCom(glifo)`) → o tom Impedido: o ladrilho
     oco, a razão a cinza. O `⛔` NÃO VIRA GLIFO — vira a forma (`formas.md`,
     "não pode agora"): um glifo de proibido por cima da frase era o
     veredito a gritar por cima do assunto;
   · `null` → o emoji sai e a palavra fica (enfeite, ou a voz do sistema a
     falar de si mesmo).

   UM PREFIXO QUE NÃO ESTÁ AQUI SAI NA MESMA — a linha nunca mostra o emoji
   do sistema —, mas a suíte (`teste-v3-glifos` §6) varre `src/` e recusa
   prefixo novo sem entrada: glifo novo sem assunto não nasce, e assunto
   novo sem decisão também não.

   Os nomes são de `GLIFOS` ou dos quatro da cinta (`moeda`, `mana`,
   `vida`, `ampulheta`, que o `Glifo` pede a `ui.jsx`).
   ============================================================ */
const IMPEDIDO = { glifo: null, tom: "impedido" };
const impedidoCom = (glifo) => ({ glifo, tom: "impedido" });

export const ASSUNTO_DO_EMOJI = {
  /* não pode — a forma, não o glifo */
  "⛔": IMPEDIDO, "🚫": IMPEDIDO,
  /* 📕 é SÓ a recusa (a magia que não sai). Preparar e guardar falam com 📖, que é Neutro:
     guardar uma magia é escolha do jogador, não um "não pode" (V3c). */
  "📕": impedidoCom("faisca"), "🐾": impedidoCom("faisca"), "⛓": impedidoCom("cadeado"),
  /* o golpe, o dano */
  "⚔": "espadas", "⚡": "espadas", "💢": "espadas", "💥": "espadas", "🏹": "espadas", "🎯": "espadas",
  /* o movimento */
  "🏃": "passo", "👣": "passo", "📏": "passo",
  /* a defesa */
  "🛡": "escudo", "🪨": "escudo", "⛰": "escudo",
  /* o dado */
  "🎲": "dado", "🍀": "dado",
  /* a magia */
  "✨": "faisca", "🌀": "faisca", "🔮": "faisca", "🌿": "faisca", "📯": "faisca", "⏪": "faisca", "⏩": "faisca",
  "✦": "faisca", "✧": "faisca",
  /* a vida */
  "🩸": "vida", "🩶": "vida", "🩹": "vida", "⚕": "vida", "🧪": "vida", "⛲": "vida",
  /* o dinheiro e a essência */
  "💰": "moeda", "🛒": "moeda", "⚗": "essencia", "⚒": "essencia",
  /* o tempo */
  "⏳": "relogio", "🕐": "relogio",
  /* onde estou, para onde vou */
  "📍": "alfinete", "🧭": "mapa", "🗺": "mapa", "🏞": "mapa", "🐴": "mapa",
  /* descansar */
  "⛺": "descanso", "🌙": "descanso",
  /* a favor, contra */
  "🌠": "favor", "⬆": "favor", "🍲": "favor", "🥱": "contra", "😩": "contra", "🌑": "contra",
  /* o perigo mortal */
  "☠": "perigo", "💀": "perigo", "⚰": "perigo", "🪤": "perigo", "🪂": "perigo",
  /* aviso — reaja */
  "⚠": "aviso", "💾": "aviso", "🔇": "aviso", "🥖": "aviso", "💧": "aviso",
  /* trancado */
  "🔒": "cadeado",
  /* procurar, perceber */
  "🔎": "procurar", "🔍": "procurar", "👁": "procurar",
  "📖": "faisca", /* o livro das falas é o grimório: magia, não lupa (v3-jogo.md §9.1, a quarta errada) */
  /* trabalho, contrato */
  "📋": "trabalho", "🆘": "trabalho", "🧹": "trabalho", "📦": "trabalho", "💌": "trabalho", "🔦": "trabalho",
  "📌": "trabalho", "📜": "trabalho", "✅": "trabalho", "✖": "trabalho", "📣": "trabalho", "🗡": "trabalho",
  /* a masmorra */
  "🕯": "tocha", "🕳": "masmorra", "🗝": "masmorra",
  /* gente, a bolsa */
  "👥": "grupo", "🧺": "bolsa", "🤲": "bolsa", "🎒": "bolsa",
  /* a ascensão, o herói, o que se venceu */
  "🌟": "ascensao", "🌌": "ascensao", "⚱": "ascensao", "⚜": "heroi", "🏆": "trofeu",
  /* ouvir */
  "🔊": "ouvir",
  /* SAEM, e a palavra fica: enfeite, a voz do sistema a falar de si
     (`⚖` recalibrar, `⚙` o turno), a sala multijogador (`🚪`), e os
     que dizem coisas demais para um glifo só (`🔥` é fogueira e revolta) */
  "🏛": null, "🌍": null, "💪": null, "✋": null, "🎭": null, "🎏": null, "🤝": null, "✉": null,
  "🗞": null, "💭": null, "⚙": null, "🕊": null, "🚪": null, "👑": null, "🗣": null, "🌫": null,
  "🔥": null, "⚖": null, "🎁": null, "🚶": null, "🌈": null, "🏰": null, "♂": null, "♀": null,
};

/* O prefixo: um pictográfico (com a variação e as junções), ou `✦`/`✧`,
   e o espaço que o separa da frase. */
const RX_PREFIXO_DA_LINHA = /^\s*((?:\p{Extended_Pictographic}|[✦✧])️?(?:‍\p{Extended_Pictographic}️?)*)[  ]*/u;

export function assuntoDaLinha(texto) {
  const linha = String(texto == null ? "" : texto);
  const m = linha.match(RX_PREFIXO_DA_LINHA);
  if (!m) return { glifo: null, tom: "neutro", resto: linha };
  const resto = linha.slice(m[0].length);
  const a = ASSUNTO_DO_EMOJI[m[1].replace(/️/g, "")];
  if (a == null) return { glifo: null, tom: "neutro", resto };
  if (typeof a === "string") return { glifo: a, tom: "neutro", resto };
  return { glifo: a.glifo || null, tom: a.tom || "neutro", resto };
}

/* ============================================================
   A MOEDA NA FRASE (V3c, 25/09) — o ◉ de fonte vira o glifo da cinta

   O dinheiro tinha quatro caras (`v3-jogo.md` §1): o ◉ da fonte do
   sistema na soleira e no retorno, o `IconeBolsa` desenhado na cinta, o
   💰 das falas e a palavra solta. A cinta já tem a forma — aro e miolo,
   quadro 12 (R13) —, e o `Glifo` pede-a pelo nome `moeda`. O que faltava
   era quem lesse a frase que o motor escreve (`textoDaPaga`, em
   `missoes.js`, é território do sistema e a mesma frase vai ao Diário e ao
   envelope) e a devolvesse em partes: texto, moeda, texto.

   A QUANTIA É O TOKEN QUE SEGUE O ◉ (até o espaço seguinte), e anda
   colada ao glifo: `◉ 140 (o combinado)` dá a moeda `140` e o texto
   ` (o combinado)`. Um ◉ solto no fim dá uma moeda sem número — o glifo
   ainda diz dinheiro. Uma frase sem ◉ volta inteira, numa parte só.
   ============================================================ */
const RX_MOEDA_NA_FRASE = /◉[ \u00A0]?(\S*)/g;

export function partesDaMoeda(texto) {
  const s = String(texto == null ? "" : texto);
  const partes = [];
  let i = 0;
  for (const m of s.matchAll(RX_MOEDA_NA_FRASE)) {
    if (m.index > i) partes.push({ moeda: false, texto: s.slice(i, m.index) });
    partes.push({ moeda: true, texto: m[1] });
    i = m.index + m[0].length;
  }
  if (i < s.length || !partes.length) partes.push({ moeda: false, texto: s.slice(i) });
  return partes;
}

/* O RETORNO NA SOLEIRA (V3c) — o que a oferta promete, e só o que decide.
   O `jogo` contou (`v3c-jogo.md` §1): das quatro coisas escritas à direita
   de um contrato, só o dinheiro e o XP mudam de uma oferta para a outra, e
   o XP sobe no mesmo sentido do dinheiro; a fama (`round(peso × 3)`) nunca
   desempata dois contratos do mesmo tamanho. Então a soleira diz o
   dinheiro; sem dinheiro, o XP — um favor sem moedas não pode ler-se
   "não paga nada" (a lei de v9.193); e o item, quando há, sempre. XP e
   fama continuam no Mural e no Diário (`textoDaPaga`, em `missoes.js`).
   Recebe `{ moedas, xp, item }` — a forma de `recompensaDe` —, e `null`. */
export function retornoDaSoleira(paga) {
  const p = paga || {};
  const moedas = Number(p.moedas) > 0 ? Math.round(Number(p.moedas)) : 0;
  const xp = Number(p.xp) > 0 ? Math.round(Number(p.xp)) : 0;
  const item = p.item ? `item ${p.item}` : "";
  const primeiro = moedas ? `◉ ${moedas}` : xp ? `+${xp} XP` : "";
  return [primeiro, item].filter(Boolean).join(" · ");
}

/* V5a · AS ETIQUETAS DA PÁGINA — o que o cabeçalho da página diz.

   O CONTEÚDO É DO `jogo` (`mente/v5a-jogo.md`); a peça é
   `CabecalhoDaPagina` (`ui.jsx`), que só desenha. Mora aqui, e não no
   `App.jsx`, pela lei de sempre: *conta se prova, tela se olha* — e a
   regra de qual termo cede primeiro é conta.

   - À ESQUERDA, O LUGAR: `lugarDaCena()` (a masmorra, o lugar nomeado, a
     estrada ou a cidade — a ordem do `App.jsx`), com o travessão dos
     nomes de masmorra trocado pelo ponto do Figma: *Andar 1 — do
     Silêncio* passa a *Andar 1 · do Silêncio*. As maiúsculas são da peça.
   - À DIREITA, a luz e o ar, NA ORDEM EM QUE SE LÊEM, e com o lado que
     cede no telefone (`cede`):
     · à superfície, `NOITE · CHUVA` — a LUZ da hora e o CLIMA; cede o
       clima (o FIM). O clima só entra quando muda o jogo:
       `CLIMA_QUE_SE_CALA` (`ensolarado` às 22:00 era o defeito medido do
       cartão de v9.157 — o bom tempo não se anuncia);
     · na masmorra, `CAMADA 1 · 3 TOCHAS` — do maior para o menor, como um
       endereço; cede a CAMADA (o INÍCIO), porque a tocha é recurso e é ela
       que fica quando só cabe um termo. Com zero, `sem tochas`: `0 tochas`
       lê-se como contagem, `sem` lê-se como perigo. Lá em baixo não há
       luz da hora (`palco.js`: *subterrâneo não tem hora*).

   A masmorra lê-se de `cabecalhoDaCena()` (`palco.js`), que já decide
   camada e tochas: uma segunda conta aqui seria a segunda verdade. O
   `onde` dela junta os termos com ` · ` — é esse o separador que se
   parte, e `teste-v5a-cabecalho.mjs` prova-o contra o `palco.js` real.

   Nada sabido, nada mostrado: sem lugar a esquerda fica vazia; sem
   termos, a direita também. Nunca lança — `null` e lixo dão vazio. */
export const CLIMA_QUE_SE_CALA = ["ensolarado"];

export function etiquetasDaPagina(dados) {
  const d = dados && typeof dados === "object" ? dados : {};
  const lugar = String(d.lugar == null ? "" : d.lugar).replace(/\s*—\s*/g, " · ").trim();
  const cena = d.cena && typeof d.cena === "object" ? d.cena : null;
  const limpo = (lista) => lista.map((x) => String(x == null ? "" : x).trim()).filter(Boolean);
  if (cena && cena.subterraneo) {
    const partes = String(cena.onde || "").split(" · ").map((x) => x.trim()).filter(Boolean);
    const tochas = partes.find((x) => /tocha/.test(x));
    const camada = partes.find((x) => /^camada\b/.test(x));
    return { lugar, direita: limpo([camada, tochas && /^0 tochas?$/.test(tochas) ? "sem tochas" : tochas]), cede: "inicio" };
  }
  const clima = d.clima && typeof d.clima === "object" ? d.clima : null;
  const falaOClima = clima && !CLIMA_QUE_SE_CALA.includes(clima.id);
  return { lugar, direita: limpo([d.luz, falaOClima ? clima.rotulo : ""]), cede: "fim" };
}

/* ============================================================
   V4 · A CINTA COM OS ANÉIS — as contas que a peça lê (`mente/v4-jogo.md`).

   Conta se prova, tela se olha: o que decide o ESTADO de um anel, o NOME de
   cada alvo e QUEM CEDE quando a linha aperta mora aqui, em Node; a cinta
   (`App.jsx`) só mede as larguras e desenha o que isto devolve.
   ============================================================ */

/* Os três estados que se veem num anel parado (o quarto, *ferida agora*, é
   um instante, e é o próprio anel que o vê chegar). Por ordem de gravidade:
   quem manda num disco `+N` é o último desta lista que ele esconder. */
export const ESTADOS_DO_ANEL = ["calma", "grave", "tombado"];

/* `tombado` é o que a ressurreição do domínio lê (vida 0, ou morrendo);
   `grave` é a régua de `ANEL.grave` (um terço do PV). Nulo e lixo: calma. */
export function estadoDoAnel(ente) {
  const e = ente && typeof ente === "object" ? ente : {};
  const vida = Number(e.vida) || 0, max = Number(e.vidaMax) || 0;
  if (e.morrendo || (max > 0 && vida <= 0)) return "tombado";
  if (max > 0 && vida / max <= ANEL.grave) return "grave";
  return "calma";
}

/* O pior de uma lista de estados — a lei única da cinta: o `+N` herda o
   pior do que esconde (o disco do grupo e o `+N` dos prazos). */
export function piorEstado(estados) {
  let pior = 0;
  for (const s of estados || []) pior = Math.max(pior, ESTADOS_DO_ANEL.indexOf(s));
  return ESTADOS_DO_ANEL[Math.max(0, pior)];
}

/* O nome acessível de UM companheiro: o número que o telefone não escreve
   entra aqui (`Tomé · 3 de 10 PV`). Quem tombou diz-se por palavra. */
export function nomeDoCompanheiro(c) {
  const e = c && typeof c === "object" ? c : {};
  const nome = String(e.nome || "companheiro");
  if (estadoDoAnel(e) === "tombado") return nome + " caiu";
  return nome + " · " + (Number(e.vida) || 0) + " de " + (Number(e.vidaMax) || 0) + " PV";
}

/* O PV escrito debaixo do nome, na mesa (a `meta` da v3, com PV e não HP):
   `14/14 PV`; quem tombou, `caiu`. Uma função só, para o rótulo e para a
   régua que mede quanto ele ocupa não escreverem duas coisas diferentes. */
export function textoDoPV(ente) {
  const e = ente && typeof ente === "object" ? ente : {};
  if (estadoDoAnel(e) === "tombado") return "caiu";
  return (Number(e.vida) || 0) + "/" + (Number(e.vidaMax) || 0) + " PV";
}

/* O nome do CACHO (o alvo único do grupo no telefone): `O grupo`, e depois
   quem está mal, do pior para o menos mal — o mesmo padrão de `nomeDaPorta`,
   sem `aria-live` (o acontecimento já foi dito pela prosa). */
export function nomeDoCacho(grupo) {
  const g = Array.isArray(grupo) ? grupo : [];
  const caidos = g.filter((c) => estadoDoAnel(c) === "tombado").map((c) => c.nome + " caiu");
  const graves = g.filter((c) => estadoDoAnel(c) === "grave").map((c) => c.nome + " em perigo");
  const mal = [...caidos, ...graves];
  return mal.length ? "O grupo — " + mal.join(", ") : "O grupo";
}

/* Quem o toque abre na sala Grupo: o PRIMEIRO no pior estado (a ordem é a
   de entrada — posição é identidade), porque é quem o aro ou o disco
   estavam a assinalar. Sem ninguém mal, o primeiro. */
export function quemAbrir(grupo) {
  const g = Array.isArray(grupo) ? grupo.filter(Boolean) : [];
  if (!g.length) return null;
  const pior = piorEstado(g.map(estadoDoAnel));
  const c = g.find((x) => estadoDoAnel(x) === pior) || g[0];
  return c.nome || null;
}

/* QUEM CEDE QUANDO A LINHA APERTA — a ordem do `jogo` (§4), e é conta, não
   medição: a cinta mede as peças que tem (o herói, a pílula, o glifo da luz,
   os contadores, e o rótulo de cada companheiro na mesa) e isto decide.

   `m`: `{ largura, mesa, n, heroi, pilula, glifo, contadores, espaco, perto,
   anel, passo, separacao, entreAnelERotulo, rotulos: [px…] }`.
   Devolve `{ aneis, rotulos, glifo, disco }`:
   - NA MESA: primeiro cedem os RÓTULOS, do último para o primeiro; depois o
     glifo da luz; depois os anéis entram no disco `+N`, do último para o
     primeiro.
   - NO TELEFONE: primeiro o glifo; depois os anéis, até restar só o disco.
   - Nunca cedem: o herói, a pílula (a hora e o selo), os contadores. Se nem
     o disco sozinho couber, fica o disco sozinho — um perigo escondido por
     falta de espaço é o defeito que esta etapa existe para matar. */
export function repartirACinta(m) {
  const d = m && typeof m === "object" ? m : {};
  const n = Math.max(0, Math.floor(Number(d.n) || 0));
  const num = (x) => Number(x) || 0;
  const rot = Array.isArray(d.rotulos) ? d.rotulos : [];
  const fixo = num(d.heroi) + num(d.pilula) + num(d.contadores) + 2 * num(d.espaco);
  const doGrupo = (k, r) => {
    if (!n) return 0;
    const itens = k + (n - k > 0 ? 1 : 0);
    if (!d.mesa) return num(d.perto) + num(d.anel) + num(d.passo) * (itens - 1);
    let w = 0;
    for (let i = 0; i < k; i++) w += num(d.separacao) + num(d.anel) + (i < r ? num(d.entreAnelERotulo) + num(rot[i]) : 0);
    if (n - k > 0) w += num(d.separacao) + num(d.anel);
    return w;
  };
  /* `folga`: o respiro mínimo que a linha guarda (o `jogo` pede ≥ 7 a 375 —
     sem ele cabe ao pixel e lê-se colado) */
  const cabe = (k, r, g) => fixo + doGrupo(k, r) + (g ? num(d.glifo) : 0) + num(d.folga) <= num(d.largura);
  const tentativas = [];
  if (d.mesa) {
    for (let r = n; r >= 0; r--) tentativas.push([n, r, true]);
    tentativas.push([n, 0, false]);
  } else {
    tentativas.push([n, 0, true], [n, 0, false]);
  }
  for (let k = n - 1; k >= 0; k--) tentativas.push([k, 0, false]);
  for (const [k, r, g] of tentativas) if (cabe(k, r, g)) return { aneis: k, rotulos: r, glifo: g, disco: n - k };
  return { aneis: 0, rotulos: 0, glifo: false, disco: n };
}

/* V5 · O GLIFO DE CADA SALA — o painel da masmorra deixa de dizer o LUGAR (o
   cabeçalho da página já o diz, a 69 px dali, e as tochas com ele) e passa a
   dizer a SALA: `[glifo] TESOURO · POR RESOLVER` (o `jogo`, V5 §5). Os tipos
   são os de `masmorras.js` (`ROTULO_SALA`); os glifos são todos da família
   que já existe — nenhum nasce para isto. Um tipo novo sem linha cai no
   glifo da masmorra, que é uma sala legítima e não um buraco. */
export const GLIFO_DA_SALA = {
  entrada: "masmorra",
  combate: "espadas",
  armadilha: "aviso",
  tesouro: "bolsa",
  enigma: "desconhecido",
  santuario: "descanso",   /* onde se recupera o fôlego; a tocha fica para a luz */
  chave: "escudo",         /* a sala do guardião da chave (o rótulo é Guardião) */
  chefe: "coroa",
};

/* V5 · OS PARÁGRAFOS DA PROSA — a resposta do Mestre partida onde há uma linha
   em branco (uma quebra simples continua dentro do parágrafo: o Mestre às
   vezes põe falas assim). É o que deixa a página separar parágrafos a 16, como
   o nó, em vez de uma linha vazia de 27,6. Vazio e lixo: nenhum parágrafo. */
export function partesDaProsa(texto) {
  return String(texto == null ? "" : texto)
    .split(/\n[ \t]*\n+/)
    .map((p) => p.replace(/^\n+|\s+$/g, ""))
    .filter((p) => p.trim());
}

/* V5 · A PRIMEIRA FRASE — o que a abertura de cerimônia põe em letra grande.
   Acaba no primeiro `.`, `!`, `?` ou `…` seguido de espaço ou do fim (as aspas
   e parênteses que fecham vão com ela). Sem pontuação, a frase é o parágrafo
   inteiro — e a peça cai para a letra longa se passar do teto. */
export function primeiraFrase(paragrafo) {
  const s = String(paragrafo == null ? "" : paragrafo);
  const m = s.match(/^[\s\S]*?[.!?…]+["”»')\]]*(?=\s|$)/);
  if (!m) return { frase: s.trim(), resto: "" };
  return { frase: m[0].trim(), resto: s.slice(m[0].length).trim() };
}

/* ============================================================
   V5e · A RESPOSTA CHEGA PELO COMEÇO — a conta de onde a vista pousa.

   A REGRA-MÃE, numa linha (o `jogo`, `mente/v5e-jogo.md`): *quando chega a
   resposta, a vista vai para o fim — mas nunca para além do começo da
   resposta.* Uma conta só para os dois casos: a resposta que cabe fica toda
   à vista, ancorada no fim, como sempre; a que não cabe pousa pelo começo —
   a runa logo abaixo do esbatimento, e a primeira frase à vista. Até aqui a
   vista corria sempre ao fim, e no telefone o jogador lia primeiro as
   últimas doze linhas de uma resposta de 980 px.

   Estas funções só fazem contas: o `App.jsx` mede (onde está a runa, quanto
   rola a área) e chama. Não leem o DOM, não conhecem o React, e respondem
   igual em qualquer máquina. */

/* quem está no fim: a distância ao fundo ≤ um quarto da área (CHEGADA) */
export function estaNoFim(distanciaAoFim, alturaDaArea, tolerancia = CHEGADA.toleranciaDoFim) {
  const d = Number(distanciaAoFim), a = Number(alturaDaArea);
  if (!Number.isFinite(d) || !Number.isFinite(a) || a <= 0) return true;
  return d <= a * tolerancia;
}

/* o `scrollTop` onde a vista pousa: o fim, mas nunca além do começo da
   resposta (o topo da runa menos a margem do esbatimento). Lixo: null — e
   quem chama não mexe na vista. */
export function pousoDaVista({ topoDaResposta, margem = 0, alturaDoRolo, alturaDaArea } = {}) {
  const t = Number(topoDaResposta), m = Number(margem) || 0, rolo = Number(alturaDoRolo), area = Number(alturaDaArea);
  if (![t, rolo, area].every(Number.isFinite)) return null;
  const fim = Math.max(0, rolo - area);
  return Math.round(Math.max(0, Math.min(fim, t - m)));
}

/* o movimento da rolagem: seco com `prefers-reduced-motion` (a lei do
   coordenador), suave sem ele. Nunca há animação além da própria rolagem. */
export function comportamentoDaRolagem(reduzido) {
  return reduzido ? "auto" : "smooth";
}

/* ============================================================
   V6 · O DADO E O RASCUNHO — as contas do compositor.

   A LEI DE V6a (o coordenador; o `jogo`, `mente/v6-jogo.md` §A): *o que se
   escreve nunca se perde; o que espera é o envio.* O campo nunca fecha; quem
   espera é o dado. Estas funções só fazem contas — o `App.jsx` lê o estado
   do turno e chama.
   ============================================================ */

export const ESTADOS_DO_DADO = ["repouso", "pronto", "lancado", "espera", "rolar"];

/* o estado do dado, por ordem de força: o quarto de volta do envio; a espera
   (o Mestre respondendo, ou a sala à espera do outro); o teste pendente; e
   então o campo — com texto é Pronto, vazio é Repouso */
export function estadoDoDado({ texto = "", carregando = false, rolagem = false, aEsperaDoOutro = false, lancado = false } = {}) {
  if (lancado) return "lancado";
  if (carregando || aEsperaDoOutro) return "espera";
  if (rolagem) return "rolar";
  return String(texto == null ? "" : texto).trim() ? "pronto" : "repouso";
}

/* o envio espera? (o Enter e o toque não mandam nada nestes estados) */
export function envioEspera(estado) {
  return estado === "espera" || estado === "rolar" || estado === "lancado";
}

/* o nome acessível do dado, que é também o `title`: diz o que o toque faz */
export function nomeDoDado(estado, { teste = "", dificuldade = null, outro = "" } = {}) {
  if (estado === "pronto" || estado === "lancado") return "Agir";
  if (estado === "espera") return outro ? `À espera de ${outro}` : "À espera do Mestre";
  if (estado === "rolar") return ["Rolar o dado", teste, dificuldade != null ? `dificuldade ${dificuldade}` : ""].filter(Boolean).join(" — ");
  return "Escrever a jogada";
}

/* a linha do veredito do teste pendente — a que era o cartão com o botão
   `Rolar d20`: `Teste de Força · dif. 12 — motivo` */
export function linhaDoTeste(rolagem) {
  if (!rolagem || typeof rolagem !== "object") return "";
  const nome = rolagem.rotulo || rolagem.atributo || "sorte";
  const dif = rolagem.dificuldade != null ? ` · dif. ${rolagem.dificuldade}` : "";
  const motivo = rolagem.motivo ? ` — ${rolagem.motivo}` : "";
  return `Teste de ${nome}${dif}${motivo}`;
}

/* O RASCUNHO — o texto do campo, fora do save (uma chave de preferência por
   modo, como `taverna_cfg_rolagens`). Guarda-se com QUEM o escreveu (a
   campanha), e só volta à mesma: injetar ou começar outro save não o
   ressuscita noutra campanha. Vazio: nada a guardar. */
export function chaveDoRascunho(modo) {
  return "taverna_rascunho_" + (modo ? String(modo) : "historia");
}
export function rascunhoPara(texto, campanha) {
  const t = String(texto == null ? "" : texto);
  if (!t.trim()) return null;
  return JSON.stringify({ de: String(campanha || ""), texto: t });
}
export function rascunhoDe(bruto, campanha) {
  try {
    const r = JSON.parse(bruto);
    if (!r || typeof r.texto !== "string" || String(r.de) !== String(campanha || "")) return "";
    return r.texto;
  } catch { return ""; }
}

/* ============================================================
   A1 · A MORADA DA LINHA (10/10) — o relato deixa de ser um livro-caixa

   O PEDIDO: "há coisas e informações que aparecem que não são
   necessárias, isso acaba confundindo o player mais do que ajudando".
   O `jogo` jogou dez turnos e contou 50 peças além da prosa; 8 delas
   (16%) desmentiam o Mestre. O veredito, família a família, está em
   `mente/a1-jogo.md` §2.2; esta tabela é ele, escrito em código.

   AS CINCO MORADAS:
   · `cena`   — fica à vista. É o padrão de toda linha que não está aqui:
                NA DÚVIDA, A LINHA APARECE (a lei de `resumo.js`);
   · `recibo` — a linha não se desenha; o número dela aparece no recibo
                do turno (`reciboDoTurno`, abaixo), que lê a FICHA e
                nunca a frase — por isso não consegue discordar da bolsa;
   · `luta`   — vai para a dobra "A luta", fechada;
   · `cala`   — a cena ou a tela já o disse; não se desenha e fica no
                save (calar é apresentação: a memória não perde nada);
   · `dia`    — a dobra "O dia: n notícias" (#39).

   É UMA LISTA BRANCA do que sai da cena: cada linha diz a morada, o
   padrão da frase, as peças do inventário (`pecas`, os `#` de a1-jogo)
   e o PORQUÊ escrito — a mesma lei de `MARCA_ACENDE`: uma regra sem o
   porquê é como a próxima nasce torta. A primeira que casa, decide.

   A ORDEM DE QUEM MANDA (moradaDaLinha):
   1. as linhas com `padrao` — `cala` e `recibo` vencem até a luta (o que
      a tela já disse não entra na dobra; o número da luta mora no recibo
      dela), e uma linha `cena` aqui FURA a dobra (a porta, #65);
   2. a mensagem marcada `naLuta` (quem a marca é o `App.jsx`) → `luta`;
   3. a declaração por prefixo (`prefixos`) — a catraca de V3b estendida:
      todo prefixo de `ASSUNTO_DO_EMOJI` tem morada declarada, e um
      prefixo novo sem decisão quebra `teste-a1-relato`;
   4. `cena`.
   Os padrões só leem falas da mesa (`autor` ausente ou "sistema"): a
   prosa do Mestre e a fala do jogador nunca se calam por um padrão.
   ============================================================ */
export const MORADA_DA_LINHA = [
  /* ---------------- cala: a cena ou a tela já o disse ---------------- */
  { morada: "cala", pecas: [31], padrao: /^📍 /u,
    porque: "o cabeçalho da página é a morada do lugar; em 4 de 4 vezes a prosa abriu pelo lugar, e na T10 o 'De volta' desmentiu a prosa — três sinais para um fato" },
  { morada: "cala", pecas: [31, 32], padrao: /^🧭 (?:Chegada: |Você está em )/u,
    porque: "a faixa de chegada (#1) passa a ser a única voz da chegada, e o cabeçalho diz onde se está; o lugar novo no mapa já acende a marca do MAPA (`marca-da-porta.js`)" },
  { morada: "cala", pecas: [32], padrao: /^🗺 (?:.+ entrou no seu mapa\.$|De .+ você fica sabendo de )/u,
    porque: "o nome de um lugar ouvido serve a quem planeja a viagem, não ao meio da cena: vira marca no MAPA, onde se decide para onde ir" },
  { morada: "cala", pecas: [33], padrao: /^🧭 .+ · [▰▱]+ \d+%/u,
    porque: "a barra da viagem e o 'escreva que segue viagem' são instrução de interface no relato; a cinta em viagem e a soleira 'Seguir' já carregam isso" },
  { morada: "cala", pecas: [46], padrao: /^\S+\s+Encontro (?:trivial|fácil|médio|difícil|mortal) — /u,
    porque: "a mesa a contar a dificuldade é coisa que um Mestre nunca diz, e ainda chega DEPOIS da luta; corta de vez, nem a dobra a guarda" },
  { morada: "cala", pecas: [18], padrao: /^⚖ PV aferido:/u,
    porque: "é a correção feita em público; os PV de quem luta a mesa de batalha já mostra, e o envelope ao Narrador continua a ir" },
  { morada: "cala", pecas: [25], padrao: /^🎲 d20 → /u,
    porque: "o véu do dado (peça 140) acabou de mostrar o mesmo dado, com o mesmo alvo, a rolar e a parar" },
  { morada: "cala", pecas: [22], padrao: /^✧ .+ ativo \(\+\d+ em .+, \d+ turnos?\)$/u,
    porque: "o tique de todo turno: o chip da cinta (peça 138) já diz o efeito ativo; o fim dele ('se dissipou') fica, porque muda a próxima decisão" },
  { morada: "cala", pecas: [44], padrao: /^(?!.*Começou a contar).*(?:●○|○●)/u,
    porque: "o tique do relógio ('●●○○ — 4 noites') o selo da cinta (peça 136) já diz; avisa-se só quando aperta — 'Começou a contar' e o relógio cheio ficam" },
  { morada: "cala", pecas: [65], padrao: /^▸ Códex — /u,
    porque: "a aba nasce no trilho, com marca; a frase nomeava o mecanismo e, na T8, nasceu no meio do golpe" },
  { morada: "cala", pecas: [53], padrao: /^🧺 No chão: .+ toque em EXAMINAR/u,
    porque: "'toque em EXAMINAR' é manual de instruções; o chão já tem a soleira 'Examinar o chão · n coisas ao alcance', no lugar da mão" },
  { morada: "cala", pecas: [53], padrao: /^⚔ O confronto se dissolve — o painel de combate se fecha\.$/u,
    porque: "'o painel se fecha' é a interface a falar de si; a tela de batalha fechar-se já o diz" },

  /* ---------------- recibo: o número mora no recibo do turno ---------------- */
  { morada: "recibo", pecas: [12, 21], padrao: /^◉ [+−-]\d+ moedas$/u,
    porque: "o número é verdade e a linha é ruído: a cinta já muda, e o recibo (que é a bolsa) diz ◉ ±n" },
  { morada: "recibo", pecas: [13], padrao: /^Você (?:perdeu|recuperou) \d+ PV\.$/u,
    porque: "a cena diz a ferida e o anel diz o resto; o recibo diz −n PV, lido da ficha" },
  { morada: "recibo", pecas: [13], padrao: /^Você (?:gastou|recuperou) \d+ PM\.$/u,
    porque: "o mesmo que os PV: a cinta e o recibo dizem o PM" },
  { morada: "recibo", pecas: [14], padrao: /^✧ \+\d+ XP — /u,
    porque: "o XP é o laço de recompensa e fica num chip do recibo; o comentário do juiz ('um feito de verdade') é bastidor" },
  { morada: "recibo", pecas: [15], padrao: /^✦ NÍVEL \d+ ALCANÇADO!$/u,
    porque: "o `ModalNivel` (peça 141) é o momento, e o recibo tem o chip do nível; a linha era a mesma coisa duas vezes e ainda podia sumir numa dobra" },
  { morada: "recibo", pecas: [17], padrao: /^(?:Item (?:obtido|perdido): |⚔ Equipamento encontrado: )/u,
    porque: "na T4 a prosa já tinha posto o frasco na mão; na T6 a linha era uma poção fantasma — o recibo lê a bolsa e não consegue inventar item" },
  { morada: "recibo", pecas: [18], padrao: /^⚖ (?:Venda|Recompensa|Preço) aferid/u,
    porque: "o Mestre corrigido em público, e errado duas vezes no ANTES (T4, T6); o débito real vai ao recibo, e o preço certo à boca do cambista (C1)" },
  { morada: "recibo", pecas: [19], padrao: /^💥 Dano ambiental /u,
    porque: "a queda é a prosa que narra; o '(calculado ...)' é a mesa a falar de si, e o −n PV vai ao recibo" },
  { morada: "recibo", pecas: [20], padrao: /^⚡ .+ (?:foi|foram) para a bolsa\.$/u,
    porque: "é a cobrança pela narração, e a prosa acabou de dizer o mesmo; o que entrou, o recibo diz" },
  { morada: "recibo", pecas: [23], padrao: /^\p{Lu}\p{L}*(?: \+ \p{Lu}\p{L}*)*: [−-]\d+ PV \(\d+\/\d+\)$/u,
    porque: "o tique da condição no herói: o chip da condição diz a causa, e o −n PV vai ao recibo ('✓ passou' fica; o tique no inimigo diz 'em X' e não casa aqui)" },
  { morada: "recibo", pecas: [29], padrao: /^✧ \+\d+ pontos? de heroísmo /u,
    porque: "o recurso vai ao recibo; o momento ('Dádiva do Destino') fica" },
  { morada: "recibo", pecas: [30], padrao: /^◉ \d+ moedas mudaram de mão\.$/u,
    porque: "a conta do teste social vai ao recibo; a relação nova ('passa a ver você como hostil') fica, porque decide quem ajuda" },
  { morada: "recibo", pecas: [53], padrao: /^(?:◉ Espólios: |🤲 Você recolhe: )/u,
    porque: "a vitória chegava como linha mono entre outras seis; o ganho vai ao recibo da luta (e ao fim da luta, A6)" },
  { morada: "recibo", pecas: [56], padrao: /^(?:Você gastou \d+ PM|✦ .+ · gastou \d+ PM) · restam /u,
    porque: "o preço vê-se ANTES (a pílula armada #79), não depois; o gasto vai à cinta e ao recibo, e a recarga a gaveta mostra" },

  /* ---------------- dia: a dobra "O dia" ---------------- */
  { morada: "dia", pecas: [39], padrao: /^👑 .+ em .+: /u,
    porque: "o reino muda a cada dia, vários por dia um atrás do outro; o Matt abre o dia com uma frase e guarda o resto para quem perguntar" },
  { morada: "dia", pecas: [39], padrao: /^\S+\s+Hoje é .+: /u,
    porque: "a festa do dia é notícia do dia: entra na dobra, com a primeira à vista" },
  { morada: "dia", pecas: [39], padrao: /^🗞 Corre a boca miúda: /u,
    porque: "o boato do dia é notícia do dia" },
  { morada: "dia", pecas: [39], padrao: /^🏛 Suas terras e contratos renderam /u,
    porque: "a renda cai no COFRE da guilda, não na ficha do herói — o recibo (que lê a ficha) não a veria; por isso mora no dia e não no recibo" },

  /* ---------------- luta: a dobra "A luta" (pela frase, quando a mensagem não diz) ---------------- */
  { morada: "luta", pecas: [49], padrao: /^🌍 VEZ DO MUNDO/u,
    porque: "é bastidor de turno; a mesa de batalha já mostrou de quem é a vez" },
  { morada: "luta", pecas: [48, 49, 50], padrao: /^\S+\s+[^:→]+ → [^:·—]+: /u,
    porque: "o golpe 'quem → alvo: ...' já foi visto na batalha, no rastro (peça 104); na T8 o mesmo golpe saiu em duas linhas seguidas (N2)" },
  { morada: "luta", pecas: [46], padrao: /^(?:🗺 Terreno: |🎲 Iniciativa — |📏 .+ \(\d+×\d+ quadrados|⚔ .+ entra no combate!)/u,
    porque: "a abertura da luta (terreno, tamanho, iniciativa, quem entra) a mesa de batalha mostra inteira" },
  { morada: "luta", pecas: [51, 52], padrao: /^(?:⚔ REAÇÃO — |⚡ Ataque de oportunidade — |⚔ Todos os inimigos caíram|🏃 |☠ .+ — .+ de uma vez\.$)/u,
    porque: "reação, oportunidade, golpe final e fuga a batalha já disse no instante" },
  { morada: "luta", pecas: [49], padrao: /^👣 (?:Você vai |.+ (?:avança|recua) \d+ m — |[^:]+: .+ → )/u,
    porque: "o passo de quem luta é a grade a mexer-se; no relato é eco" },

  /* ---------------- cena que fura a dobra ---------------- */
  { morada: "cena", pecas: [55], padrao: /^(?:💥 Seus PV chegam a zero|☠ Teste de morte: |💀 Você tomba\.|✨ Você volta |Você estabiliza — )/u,
    porque: "a queda e a morte do herói: a vida está em jogo, e o regente decidiu que furam a dobra da luta — ficam na cena, no sítio onde aconteceram" },
  { morada: "cena", pecas: [54], padrao: /^🌟 PODER ÚNICO DESPERTOU/u,
    porque: "raro e é momento; furam a dobra da luta como a morte (decisão do regente sobre as perguntas abertas)" },
  { morada: "cena", pecas: [65], padrao: /^▸ /u,
    porque: "a porta para uma sub-aba é a única porta dela e é convite; nenhuma porta nasce dentro da dobra da luta, por isso fura-a" },

  /* ---------------- a declaração por prefixo (V3b estendida) ---------------- */
  { morada: "cena", prefixos: ["⚔", "⚡", "💢", "💥", "🏹", "🎯", "🏃", "👣", "📏", "🛡", "🪨", "⛰", "🎲", "🍀", "☠", "💀", "⚰", "🪤", "🪂"],
    porque: "o golpe, o passo, a defesa, o dado e o perigo: na luta, quem leva à dobra é a marca `naLuta` da mensagem; fora dela o mesmo prefixo é recusa, queda, dano ambiental ou o modo criativo — e o que destes sai da cena, sai pela frase, acima" },
  { morada: "cena", prefixos: ["⛔", "🚫", "📕", "🐾", "⛓", "🔒"],
    porque: "a recusa: o jogador precisa saber por que não pôde, e na hora" },
  { morada: "cena", prefixos: ["✨", "🌀", "🔮", "🌿", "📯", "⏪", "⏩", "✦", "✧", "🩸", "🩶", "🩹", "⚕", "🧪", "⛲", "🌠", "⬆", "🍲", "🥱", "😩", "🌑"],
    porque: "a magia, a vida e o que pesa ou ajuda: o que nasce ou se desfaz muda a próxima decisão; o tique e o número saem pela frase, acima (#22, #29, #56)" },
  { morada: "cena", prefixos: ["💰", "🛒", "⚗", "⚒", "🧺", "🤲", "🎒", "👥"],
    porque: "a bolsa, o ofício e o grupo: o retorno de um clique em painel (#59) é do `App.jsx` (B); o que é só conta sai pela frase, acima (#17, #53)" },
  { morada: "cena", prefixos: ["⏳", "🕐", "🧭", "🗺", "🏞", "🐴", "⛺", "🌙"],
    porque: "o tempo, a estrada e o descanso: o prazo que aperta, o passo de missão e a pausa da viagem decidem; a chegada, o mapa e a barra saem pela frase, acima (#32, #33, #44)" },
  { morada: "cena", prefixos: ["⚠", "💾", "🔇", "🥖", "💧", "🔎", "🔍", "👁", "📖"],
    porque: "o aviso e a descoberta: são a razão de olhar, e ninguém os disse antes" },
  { morada: "cena", prefixos: ["📋", "🆘", "🧹", "📦", "💌", "🔦", "📌", "📜", "✅", "✖", "📣", "🗡"],
    porque: "o trabalho: o aceite vira porta e o mural velho some no `App.jsx` (B, #41, #45); a morada deles é a cena" },
  { morada: "cena", prefixos: ["🕯", "🕳", "🗝"],
    porque: "a masmorra: o estado dela decide a próxima sala (#62)" },
  { morada: "cena", prefixos: ["🌟", "🌌", "⚱", "⚜", "🏆", "🔊"],
    porque: "a ascensão, o herói e o que se venceu: raros, e são momento (#54, #57, #66)" },
  { morada: "cena", prefixos: ["🏛", "🌍", "💪", "✋", "🎭", "🎏", "🤝", "✉", "🗞", "💭", "⚙", "🕊", "🚪", "👑", "🗣", "🌫", "🔥", "⚖", "🎁", "🚶", "🌈", "🏰", "♂", "♀"],
    porque: "os que já perdem o emoji (V3b) e ficam com a palavra: o reino, a gente, o mundo; o que destes é do dia, da luta ou da correção sai pela frase, acima (#18, #39, #49)" },
];

const MORADAS = ["cena", "recibo", "luta", "cala", "dia"];

/* Recebe a frase (string) ou a mensagem do relato (`{ autor, texto,
   naLuta }`) e devolve uma das cinco moradas. Nunca lança: `null`, lixo
   e o vazio dão `cena` — na dúvida, a linha aparece. */
export function moradaDaLinha(linha) {
  const msg = linha != null && typeof linha === "object" ? linha : null;
  const bruto = msg ? msg.texto : linha;
  const texto = String(bruto == null ? "" : bruto).replace(/️/g, "").trim();
  const daMesa = !msg || msg.autor == null || msg.autor === "sistema";
  if (daMesa) {
    for (const r of MORADA_DA_LINHA) {
      if (r.padrao && r.padrao.test(texto) && MORADAS.includes(r.morada)) return r.morada;
    }
  }
  if (msg && msg.naLuta === true) return "luta";
  if (daMesa) {
    const m = texto.match(RX_PREFIXO_DA_LINHA);
    if (m) {
      const r = MORADA_DA_LINHA.find((x) => Array.isArray(x.prefixos) && x.prefixos.includes(m[1]));
      if (r && MORADAS.includes(r.morada)) return r.morada;
    }
  }
  return "cena";
}

/* ============================================================
   A2 · O RECIBO DO TURNO — uma fila só, debaixo da prosa

   O DEFEITO QUE ISTO MATA: no ANTES, a mesma compra dava "◉ 30" na
   prosa, "◉ 20 pela tabela" na linha e "−15" na bolsa; a luta da T8
   dizia "6 sofrido" quando o herói sofreu 3 (aparou 6 → 3). As duas
   vinham da FRASE. O recibo compara duas fotos da FICHA — antes e depois
   do turno — e por isso é a bolsa: não consegue discordar dela.

   A ORDEM É FIXA E É A TABELA: ◉ · PV · PM · XP · nível · heroísmo ·
   essência · itens. O sinal de menos é U+2212 (a lei de E4 §5). Os
   itens são um multiconjunto de NOMES (`inventario` e `equipamento`; o
   mesmo nome repetido é a quantidade, como a bolsa já lê); equipar não
   mexe nesses dois arrays, por isso não vira chip.

   Campo ausente ou não-número em qualquer das duas fichas: aquele chip
   não sai (uma ficha migrada não pode render um "+ tudo"). Ficha `null`
   ou não-objeto: `[]` — a lei da casa, `= {}` não cobre `null`. Recibo
   vazio é `[]`, e o vazio não se desenha.
   ============================================================ */
const MENOS = "−";
const FINO = " ";

/* A NOTAÇÃO É A DA CINTA (`formas.md` §A1 1): o recibo é o delta do que a
   cinta mostra, então fala exactamente como ela — número primeiro e glifo
   depois (`+7 ◉`, `−4 ◆`), a palavra onde a cinta escreve palavra (`−3
   PV`), e a palavra onde a cinta não mostra nada (`+14 XP`, `+1 heroísmo`).
   O nível é um estado alcançado, sem sinal (`nível 4`). O item é o sinal,
   um espaço fino e o nome; repetido, `× 2` no fim. NENHUM GLIFO NOVO:
   inventar um glifo de XP só para o recibo seria a segunda cara de uma
   coisa que ainda não tem a primeira.

   `glifo` é o nome que o `Glifo` (ui.jsx) desenha depois do número;
   `falado` é o que o leitor de tela diz no lugar do glifo — o `Glifo
   moeda` já diz "moedas", o U+2212 lê-se "menos". */
export const RECIBO_DO_TURNO = [
  { tipo: "moedas", campo: "moedas", glifo: "moeda", falado: "moedas", forma: "numero", porque: "a bolsa; número primeiro e o glifo depois, como a cinta escreve `1.240 ◉`" },
  { tipo: "pv", campo: "vida", rotulo: "PV", forma: "numero", porque: "a ferida do turno, lida do anel e não da soma da frase (T8: 3, não 6)" },
  { tipo: "pm", campo: "mana", glifo: "mana", falado: "PM", forma: "numero", porque: "o que a magia custou; o glifo da cinta (`85 ◆`)" },
  { tipo: "xp", campo: "xp", rotulo: "XP", forma: "numero", porque: "o laço de recompensa; conta o vão de cada nível atravessado, porque `aplicarNivel` desconta-o do XP" },
  { tipo: "nivel", campo: "nivel", rotulo: "nível", forma: "marco", porque: "o nível novo, dito pelo número a que se chegou; o momento é do `ModalNivel`" },
  { tipo: "heroismo", campo: "heroismo", rotulo: "heroísmo", forma: "numero", porque: "o recurso do destino, que a linha '✧ +1 ponto de heroísmo' dizia (#29)" },
  { tipo: "essencia", campo: "essencia", rotulo: "essência", forma: "numero", porque: "a moeda do ofício" },
  { tipo: "item", campos: ["inventario", "equipamento"], forma: "item", porque: "o que entrou e saiu da bolsa, pelo nome; repetido diz × n; os ganhos antes das perdas" },
];

const ehFicha = (f) => f != null && typeof f === "object" && !Array.isArray(f);
const numeroDe = (f, campo) => (typeof f[campo] === "number" && Number.isFinite(f[campo]) ? f[campo] : null);
const limpo = (n) => Number(n.toFixed(2));
/* o número como a cinta o escreve: `1.240`, e o sinal à frente */
const comSinal = (n) => (n > 0 ? "+" : MENOS) + Math.abs(n).toLocaleString("pt-BR");

function deltaDe(regra, antes, depois) {
  const a = numeroDe(antes, regra.campo), d = numeroDe(depois, regra.campo);
  if (a == null || d == null) return null;
  let delta = d - a;
  if (regra.tipo === "xp") {
    const na = numeroDe(antes, "nivel"), nd = numeroDe(depois, "nivel");
    if (na != null && nd != null && nd > na) for (let n = na; n < nd; n++) delta += Number(XP_POR_NIVEL(n)) || 0;
  }
  return limpo(delta);
}

function nomeDoItem(x) {
  if (typeof x === "string") return x.trim();
  return x && typeof x === "object" && typeof x.nome === "string" ? x.nome.trim() : "";
}

function chipsDosItens(campos, antes, depois) {
  const ca = new Map(), cd = new Map();
  const ordemA = [], ordemD = [];
  for (const campo of campos) {
    if (!Array.isArray(antes[campo]) || !Array.isArray(depois[campo])) continue;
    for (const x of antes[campo]) { const n = nomeDoItem(x); if (!n) continue; if (!ca.has(n)) ordemA.push(n); ca.set(n, (ca.get(n) || 0) + 1); }
    for (const x of depois[campo]) { const n = nomeDoItem(x); if (!n) continue; if (!cd.has(n)) ordemD.push(n); cd.set(n, (cd.get(n) || 0) + 1); }
  }
  const chip = (nome, delta) => {
    const sinal = delta > 0 ? "+" : MENOS;
    const vezes = Math.abs(delta) > 1 ? ` × ${Math.abs(delta)}` : "";
    return { tipo: "item", delta, texto: `${sinal}${FINO}${nome}${vezes}`, nome, falado: `${delta > 0 ? "mais" : "menos"} ${nome}${vezes ? `, ${Math.abs(delta)}` : ""}` };
  };
  const ganhos = ordemD.filter((n) => (cd.get(n) || 0) > (ca.get(n) || 0)).map((n) => chip(n, cd.get(n) - (ca.get(n) || 0)));
  const perdas = ordemA.filter((n) => (ca.get(n) || 0) > (cd.get(n) || 0)).map((n) => chip(n, (cd.get(n) || 0) - ca.get(n)));
  return [...ganhos, ...perdas];
}

/* Recebe duas fichas do herói (o `personagem` antes e depois do turno) e
   devolve a fila de chips, na ordem da tabela:
     { tipo, delta, texto, falado }            — todo chip
     + { valor, glifo }                         — os que levam glifo (◉ ◆)
     + { nome }                                 — os itens
   `texto` é a frase inteira (para quem a lê como texto); `valor` + `glifo`
   é o que a tela desenha; `falado` é o nome acessível, por extenso.
   Puro: não muta nada, e a mesma entrada dá sempre a mesma fila. */
export function reciboDoTurno(antes, depois) {
  if (!ehFicha(antes) || !ehFicha(depois)) return [];
  const fila = [];
  for (const regra of RECIBO_DO_TURNO) {
    if (regra.forma === "item") { fila.push(...chipsDosItens(regra.campos, antes, depois)); continue; }
    const delta = deltaDe(regra, antes, depois);
    if (!delta) continue;
    if (regra.forma === "marco") {
      const texto = `${regra.rotulo} ${numeroDe(depois, regra.campo)}`;
      fila.push({ tipo: regra.tipo, delta, texto, falado: texto });
      continue;
    }
    const valor = comSinal(delta);
    if (regra.glifo) {
      fila.push({ tipo: regra.tipo, delta, texto: `${valor} ${regra.glifo === "moeda" ? "◉" : "◆"}`, valor, glifo: regra.glifo, falado: `${valor} ${regra.falado}` });
      continue;
    }
    fila.push({ tipo: regra.tipo, delta, texto: `${valor} ${regra.rotulo}`, falado: `${valor} ${regra.rotulo}` });
  }
  return fila;
}

/* ============================================================
   A2 · O QUE CABE NA FILA — `formas.md` §A1 1, a conta pura

   A JetBrains Mono tem avanço fixo (600/1000 em), logo a largura de um
   chip é aritmética e não medida de DOM:

     largura(chip) = caracteres × avanço  [+ entreNumeroEGlifo + glifo]
     reserva       = largura("e mais 9") + entre

   Entra o chip se `soma + entre + largura ≤ L − (ainda há chips depois ?
   reserva : 0)` e o teto não foi atingido. A ORDEM É LEI E O CORTE TAMBÉM:
   o primeiro chip que não cabe fecha a fila — nunca se salta para um menor
   depois dele, senão o recibo mostraria XP e esconderia PV. O item, e só
   ele, trunca com `…` até caber, mas nunca abaixo de `RECIBO.pisoDoNome`
   caracteres: abaixo do piso vai para o resto (*um campo trunca, ou não se
   desenha*).

   `letra` e `glifo` são o tamanho da letra e do glifo (12 e 12 no relato;
   o fim da luta desenha a mesma peça em tamanho de momento). `largura`
   ausente ou inválida = só o teto decide. Devolve `{ visiveis, resto }`:
   o que a tela desenha e o que vai para `e mais N`.
   ============================================================ */
const RESERVA_DO_RESTO = "e mais 9";
export function reciboQueCabe(chips, largura, opcoes) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const fila = Array.isArray(chips) ? chips.filter((c) => c && typeof c.texto === "string") : [];
  const telefone = !!o.telefone;
  const letra = Number(o.letra) > 0 ? Number(o.letra) : TIPOS.maquina;
  const glifo = Number(o.glifo) > 0 ? Number(o.glifo) : TIPOS.piso;
  const entre = telefone ? RECIBO.entreTelefone : RECIBO.entre;
  const teto = telefone ? RECIBO.tetoNoTelefone : RECIBO.tetoNaMesa;
  const avanco = RECIBO.avancoMono * letra;
  const L = Number.isFinite(Number(largura)) && Number(largura) > 0 ? Number(largura) : Infinity;
  const larguraDe = (c) => (c.glifo && typeof c.valor === "string"
    ? c.valor.length * avanco + CINTA.entreNumeroEGlifo + glifo
    : c.texto.length * avanco);
  const reserva = RESERVA_DO_RESTO.length * avanco + entre;
  const visiveis = [];
  let soma = 0;
  for (let i = 0; i < fila.length; i++) {
    if (visiveis.length >= teto) break;
    const c = fila[i];
    const vao = visiveis.length ? entre : 0;
    const limite = L - (i < fila.length - 1 ? reserva : 0);
    const w = larguraDe(c);
    if (soma + vao + w <= limite) { visiveis.push(c); soma += vao + w; continue; }
    if (c.tipo === "item" && typeof c.nome === "string" && c.nome) {
      const fixo = c.texto.length - c.nome.length;
      const cabe = Math.floor((limite - soma - vao) / avanco) - fixo - 1;
      if (cabe >= RECIBO.pisoDoNome && cabe < c.nome.length) {
        visiveis.push({ ...c, texto: c.texto.replace(c.nome, c.nome.slice(0, cabe).trimEnd() + "…"), truncado: true });
      }
    }
    break;
  }
  return { visiveis, resto: fila.slice(visiveis.length) };
}

/* A5 · O QUE O RECIBO MOSTROU NÃO ACENDE A MARCA (`marca-da-porta.js`). Os
   nomes dos itens GANHOS que a fila desenhou — os que ficaram no resto
   (`e mais N`) não contam como mostrados, e a marca da BOLSA acende para
   eles (`formas.md` §A1 1). Recebe os `visiveis` de `reciboQueCabe` (ou
   uma fila inteira, quando quem chama não mede). */
export function itensMostrados(visiveis) {
  const lista = Array.isArray(visiveis) ? visiveis : [];
  return lista.filter((c) => c && c.tipo === "item" && c.delta > 0 && typeof c.nome === "string" && c.nome).map((c) => c.nome);
}

/* ============================================================
   A4 · A HORA CHEIA NA CINTA (`formas.md` §A1 5)

   `8h`, sem espaço e sem zero à esquerda — a forma da norma brasileira
   para a hora do relógio (Manual de Redação da Presidência da República,
   3.ª ed., 2018). Meia-noite é `0h`. A conta lê `CINTA.passoDaHora` (60):
   floor(minuto / passo) mod 24. A luz da cinta (`luzDaHora`) já trunca a
   hora, logo a pílula e o glifo lêem a MESMA hora cheia — às 7h59 os dois
   dizem madrugada, às 8h00 viram juntos.

   Aceita o minuto (número) ou o texto que a cinta já recebe (`08:10`).
   Texto que não é hora volta como veio: nunca custa a cinta. */
const RX_HORA = /^\s*(\d{1,2})\s*[:h]\s*(\d{0,2})/;
export function horaNaCinta(minuto) {
  let m = minuto;
  if (typeof m === "string") {
    const x = m.match(RX_HORA);
    if (!x) return m;
    m = Number(x[1]) * 60 + Number(x[2] || 0);
  }
  m = Number(m);
  if (!Number.isFinite(m)) return "";
  const h = ((Math.floor(m / CINTA.passoDaHora) % 24) + 24) % 24;
  return `${h}h`;
}

/* ============================================================
   A7 · O CUSTO ONDE SURPREENDE — a emenda à lei de E4 (`formas.md` §A1 6)

   A lei de E1/E4 escrevia o custo em TODA casa alcançável. Ela existia por
   uma medida (em seis das dez plantas o olho erra o custo), e a medida
   continua certa; o que a lei cobrava a mais era o número onde o olho
   acerta. Medido: na T8 do ANTES, 0 de 80 casas surpreendiam.

   A casa surpreende quando o custo real é diferente do que o olho conta —
   a distância de Chebyshev × `METROS_POR_QUADRADO` (o 1,5 é de `grid.js`,
   nunca escrito aqui). Recebe o `Map` de `custosDe` (a MESMA busca que a
   tela usa) e a posição do herói; devolve o `Set` das chaves que levam
   número. Sob o dedo o custo escreve-se sempre — é a tela que o soma. */
export function casasQueSurpreendem(custos, heroi) {
  const out = new Set();
  if (!custos || typeof custos.forEach !== "function" || !heroi || heroi.x == null || heroi.y == null) return out;
  custos.forEach((metros, k) => {
    const [x, y] = String(k).split(",").map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const olho = Math.max(Math.abs(x - heroi.x), Math.abs(y - heroi.y)) * METROS_POR_QUADRADO;
    if (Math.abs(Number(metros) - olho) > 1e-9) out.add(k);
  });
  return out;
}

/* A LEGENDA DO PÉ MUDA DE CONTEÚDO, NÃO DE FORMA: deixa de ser a lista dos
   custos distintos (`3 · 6 · 9 — CUSTO NO TERRENO`, uma planilha ao pé de
   outra) e passa a dizer a regra e a exceção em língua de mundo —
   `1,5 m por casa`, e, só quando o conjunto aceso tem casa de terreno
   difícil, `· na encosta, 3 m` (o nome sai de `nomeDoLugar`, a língua que o
   Mestre já usa). Com `ignoraDificil`, só a regra.

   O 2 do terreno difícil é o MESMO de `custosDe` (grid.js), que o escreve
   em linha; a suíte corre `custosDe` contra uma planta e prova que os dois
   não divergiram. A região dita é a que tem mais casas difíceis acesas (no
   empate, a primeira na ordem da busca). */
const PASSOS_DO_DIFICIL = 2;
export function legendaDoPasso(custos, grade, opcoes) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const regra = `${metrosTxt(METROS_POR_QUADRADO)} m por casa`;
  if (o.ignoraDificil || !custos || typeof custos.forEach !== "function" || !grade) return regra;
  const vezes = new Map();
  custos.forEach((_, k) => {
    const [x, y] = String(k).split(",").map(Number);
    let dificil = false, nome = "";
    try { dificil = terrenoDificil(grade, x, y); nome = dificil ? nomeDoLugar(grade, x, y) : ""; } catch { dificil = false; }
    if (dificil && nome) vezes.set(nome, (vezes.get(nome) || 0) + 1);
  });
  if (!vezes.size) return regra;
  let melhor = "", n = 0;
  for (const [nome, q] of vezes) if (q > n) { melhor = nome; n = q; }
  return `${regra} · ${melhor}, ${metrosTxt(METROS_POR_QUADRADO * PASSOS_DO_DIFICIL)} m`;
}

/* ============================================================
   A8 · O ROSTO DE QUEM NÃO É GENTE (`formas.md` §A1 4)

   UMA regra para os dois leitores (o `Retrato` e a ficha do tabuleiro), e
   por isso mora no `Rosto`, que os dois já pedem:

     se o ente TEM classe            → gente (o herói e o companheiro de classe)
     senão menteDaCriatura(...):  besta → fera · morto → morto · pensa → gente

   `menteDaCriatura` (adversario.js) é a mesma conta que decide `ehBicho` /
   `ehMorto` na luta: o retrato e o comportamento não podem discordar.
   LIMITE ESCRITO: golem, autômato, constructo e estátua viva caem em
   `morto` porque a mente é a mesma (não teme, não negocia); o osso lê-se
   mal neles. Se um construto entrar em jogo, nasce `construto` — hoje
   seria glifo sem leitor. */
export const ROSTO_DA_MENTE = { besta: "fera", morto: "morto" };

export function rostoDoEnte(ente, mente) {
  const e = ente && typeof ente === "object" ? ente : null;
  if (!e || e.classe) return "gente";
  return ROSTO_DA_MENTE[mente] || "gente";
}

/* ============================================================
   A1 · A3 · O RELATO ARRUMADO — quem mora onde, numa conta só

   O `Relato` (painel-relato.jsx) desenha o que esta função devolve; a
   decisão de quem aparece, quem cala e quem vai para que dobra é TODA
   daqui, e prova-se em Node. Os itens, na ordem da página:

     { tipo: "jogador", i, m }                — a voz de quem joga
     { tipo: "mestre",  i, m }                — a prosa (NUNCA numa dobra)
     { tipo: "bloco",   inicio, visiveis, dobradas, saldo }
                                              — as linhas de cena de uma
                                                corrida (a forma de hoje,
                                                `dividirBloco`)
     { tipo: "dia",     inicio, linhas }      — a dobra "O dia" (#39)
     { tipo: "luta",    inicio, fim, linhas, fimDaLuta }
                                              — a dobra "A luta" (A3)

   `recibo` e `cala` não se desenham (ficam no save). A LUTA é uma corrida
   de mensagens marcadas `naLuta` que FECHA numa com `fimDaLuta` (o
   `App.jsx` escreve-o quando a luta acaba): dentro dela a prosa do Mestre
   fica no sítio, o que fura a dobra (a porta, a morte, o poder único)
   fica no sítio, e o resto vai para UMA dobra, que mora onde a luta
   fechou. Uma corrida `naLuta` SEM `fimDaLuta` (a luta ainda aberta, ou um
   save de antes do campo) cai na forma de hoje — a dobra do saldo.

   O ECO DO VERBO cala dentro da dobra; a frase livre do `como?` fica. Eco
   é a fala do jogador que é SÓ a frase de um verbo da fileira (a tabela
   de `golpe.js` / `tela-de-batalha.js`, que quem chama passa em
   `frasesDosVerbos`), ou ela seguida do alvo — até `PALAVRAS_DO_ALVO`
   palavras, sem pontuação. Quem escreveu mais do que isso escreveu um
   `como`, e a voz dele não se cala.
   ============================================================ */
const PALAVRAS_DO_ALVO = 3;
const RX_PONTUACAO = /[.,;:!?—–]/;

export function ehEcoDoVerbo(texto, frases) {
  const t = String(texto == null ? "" : texto).trim();
  if (!t) return false;
  for (const bruta of Array.isArray(frases) ? frases : []) {
    const f = String(bruta == null ? "" : bruta).trim();
    if (!f) continue;
    if (t === f) return true;
    if (t.startsWith(f + " ")) {
      const resto = t.slice(f.length).trim();
      if (!RX_PONTUACAO.test(resto) && resto.split(/\s+/).length <= PALAVRAS_DO_ALVO) return true;
    }
  }
  return false;
}

const ehMsg = (m) => m != null && typeof m === "object";
const textoDe = (m) => String(m.texto == null ? "" : m.texto);
const temFimDaLuta = (m) => ehMsg(m) && m.fimDaLuta != null && typeof m.fimDaLuta === "object" && !Array.isArray(m.fimDaLuta);

/* Uma corrida de linhas da mesa vira, na ordem em que aparecem, o bloco
   de cena (a forma de hoje) e a dobra do dia. */
function corridaDeLinhas(corrida, out) {
  const cena = [], dia = [];
  let diaPrimeiro = false;
  for (const { texto, morada } of corrida.linhas) {
    if (morada === "dia") { if (!cena.length && !dia.length) diaPrimeiro = true; dia.push(texto); }
    else cena.push(texto);
  }
  const bloco = cena.length ? { tipo: "bloco", inicio: corrida.inicio, ...dividirBloco(cena) } : null;
  const doDia = dia.length ? { tipo: "dia", inicio: corrida.inicio, linhas: dia } : null;
  for (const x of diaPrimeiro ? [doDia, bloco] : [bloco, doDia]) if (x) out.push(x);
}

export function arrumarORelato(mensagens, opcoes) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const frases = Array.isArray(o.frasesDosVerbos) ? o.frasesDosVerbos : [];
  const lista = Array.isArray(mensagens) ? mensagens : [];
  const out = [];

  /* 1 · as lutas que fecharam: [inicio, fim] de cada corrida naLuta que
     termina numa mensagem com `fimDaLuta` */
  const lutas = new Map();
  for (let i = 0; i < lista.length; i++) {
    if (!(ehMsg(lista[i]) && lista[i].naLuta === true)) continue;
    let j = i;
    while (j < lista.length && ehMsg(lista[j]) && lista[j].naLuta === true && !temFimDaLuta(lista[j])) j++;
    if (j < lista.length && ehMsg(lista[j]) && lista[j].naLuta === true && temFimDaLuta(lista[j])) { lutas.set(i, j); i = j; }
    else i = j - 1;
  }

  let corrida = null;
  const fechar = () => { if (corrida) { corridaDeLinhas(corrida, out); corrida = null; } };
  const linhaDaMesa = (i, texto, morada) => {
    if (!corrida) corrida = { inicio: i, linhas: [] };
    corrida.linhas.push({ texto, morada });
  };

  for (let i = 0; i < lista.length; i++) {
    const m = lista[i];
    if (!ehMsg(m)) continue;
    if (lutas.has(i)) {
      const fim = lutas.get(i);
      const linhas = [];
      for (let k = i; k <= fim; k++) {
        const x = lista[k];
        if (!ehMsg(x)) continue;
        if (x.autor === "mestre") { fechar(); out.push({ tipo: "mestre", i: k, m: x }); continue; }
        if (x.autor === "jogador") {
          if (!ehEcoDoVerbo(x.texto, frases)) linhas.push({ voz: "jogador", texto: textoDe(x) });
          continue;
        }
        const morada = moradaDaLinha(x);
        if (morada === "cala" || morada === "recibo") continue;
        if (morada === "luta") { linhas.push({ texto: textoDe(x) }); continue; }
        linhaDaMesa(k, textoDe(x), morada);
      }
      fechar();
      out.push({ tipo: "luta", inicio: i, fim, linhas, fimDaLuta: lista[fim].fimDaLuta });
      i = fim;
      continue;
    }
    if (m.autor === "sistema") {
      const morada = moradaDaLinha(m);
      if (morada === "cala" || morada === "recibo") continue;
      linhaDaMesa(i, textoDe(m), morada === "dia" ? "dia" : "cena");
      continue;
    }
    fechar();
    out.push({ tipo: m.autor === "jogador" ? "jogador" : "mestre", i, m });
  }
  fechar();
  return out;
}

/* ---------------- O CABEÇALHO DA DOBRA DA LUTA ----------------
   `A luta · {quem caiu} · {n} rodadas` (`formas.md` §A1 2). No telefone
   as rodadas saem do cabeçalho (medido: a 303 px não cabem) e vivem
   dentro, nos rótulos `rodada n`.

   QUEM CAIU diz-se com o VERBO, e de propósito: "caíram" não tem género,
   e "caídos" obrigaria a adivinhar o de cada bicho ("2 aranhas caídos").
   Um só: `lobo 1 caiu`. Vários do mesmo nome (`lobo 1`, `lobo 2`): `2
   lobos caíram` — o plural só quando o nome acaba em vogal e não em
   `ão` (o resto não se adivinha); senão, a lista: `Kolvar e lobo 1
   caíram`. Sem ninguém caído (fuga, queda), só as rodadas. */
const RX_NUMERO_DO_NOME = /\s+\d+$/;
export function quemCaiu(caidos) {
  const nomes = (Array.isArray(caidos) ? caidos : []).map((x) => String(x == null ? "" : x).trim()).filter(Boolean);
  if (!nomes.length) return "";
  if (nomes.length === 1) return `${nomes[0]} caiu`;
  const bases = nomes.map((n) => n.replace(RX_NUMERO_DO_NOME, ""));
  const base = bases[0];
  if (bases.every((b) => b === base) && /[aeiouáéíóúâêô]$/i.test(base) && !/ão$/i.test(base)) return `${nomes.length} ${base}s caíram`;
  const lista = nomes.length === 2 ? `${nomes[0]} e ${nomes[1]}` : `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
  return `${lista} caíram`;
}

export function cabecalhoDaLuta(fimDaLuta, opcoes) {
  const f = fimDaLuta && typeof fimDaLuta === "object" ? fimDaLuta : {};
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const partes = ["A luta"];
  const quem = quemCaiu(f.caidos);
  if (quem) partes.push(quem);
  const n = Number(f.rodadas);
  if (!o.telefone && Number.isFinite(n) && n > 0) partes.push(`${n} ${n === 1 ? "rodada" : "rodadas"}`);
  return partes.join(" · ");
}

/* ---------------- AS LINHAS DE DENTRO DA DOBRA ----------------
   A gramática do rastro (peça 104), para a luta ter UMA cara de log: uma
   linha por golpe — o `🎲` e o `⚔`/`🛡` do MESMO golpe (mesmo "quem →
   alvo") fundem-se numa (N2: na T8 o golpe saía duas vezes); a linha
   fundida leva o glifo do golpe e a conta do dado. O `☠` vira a palavra
   `cai`. `🌍 VEZ DO MUNDO — rodada n` vira um rótulo `rodada n`. A fala
   livre do jogador passa como está, marcada `voz: "jogador"`.
   Devolve `{ glifo, texto }` · `{ rotulo }` · `{ voz, texto }`. */
const RX_VEZ = /^🌍\s*VEZ DO MUNDO\s*—\s*rodada\s+(\d+)/u;
const RX_QUEM_ALVO = /^(.+?)\s+→\s+(.+?):\s+(.+)$/u;
const quemDoGolpe = (s) => s.replace(/\s+·\s+.+$/, "").trim();
const semCaveira = (s) => s.replace(/☠/gu, "cai").replace(/\s{2,}/g, " ").trim();

export function linhasDaLuta(linhas) {
  const lista = Array.isArray(linhas) ? linhas : [];
  const out = [];
  for (let i = 0; i < lista.length; i++) {
    const l = lista[i] || {};
    const texto = String(l.texto == null ? "" : l.texto);
    if (l.voz === "jogador") { out.push({ voz: "jogador", texto }); continue; }
    const vez = texto.replace(/️/g, "").match(RX_VEZ);
    if (vez) { out.push({ rotulo: `rodada ${vez[1]}` }); continue; }
    const a = assuntoDaLinha(texto);
    if (a.glifo === "dado") {
      const dado = a.resto.match(RX_QUEM_ALVO);
      const prox = lista[i + 1] && lista[i + 1].voz !== "jogador" ? assuntoDaLinha(String(lista[i + 1].texto || "")) : null;
      const golpe = prox ? prox.resto.match(RX_QUEM_ALVO) : null;
      if (dado && golpe && (prox.glifo === "espadas" || prox.glifo === "escudo")
        && quemDoGolpe(golpe[1]) === dado[1].trim() && golpe[2].trim() === dado[2].trim()) {
        const cai = /☠/u.test(prox.resto);
        out.push({ glifo: prox.glifo, texto: `${dado[1]} → ${dado[2]}: ${dado[3]}${cai ? " · cai" : ""}` });
        i++;
        continue;
      }
    }
    out.push({ glifo: a.glifo || null, texto: semCaveira(a.resto) });
  }
  return out;
}
