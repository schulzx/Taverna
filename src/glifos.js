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
};
