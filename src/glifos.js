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
