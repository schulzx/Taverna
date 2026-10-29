/* ============================================================
   O CARIMBO DA LUTA, NO MOTOR (Fase T, trilha B, 28/10/2026) — src/motor/carimbo-da-luta.js

   `naLuta` (A1 · B1, 10/10) é o campo com que a dobra "A luta" junta o que
   aconteceu na batalha sem adivinhar pelo texto: toda mensagem que entra
   com a luta aberta — ou com a luta que FECHOU neste turno e ainda corre
   (B2: o golpe final, o espólio, o "acabou") — leva a marca, inclusive o
   eco do jogador. Carimba-se na ENTRADA (`pushMsgs`), e não na hora de
   desenhar: quem relê o save depois da luta já não tem a luta para
   perguntar.

   Era a única regra pura do App que uma suíte corria por `new Function`,
   recortando a expressão do texto (`teste-a1-relato` §3). Vem para cá à
   letra; quem chama passa o que diz se há luta (`combateRef.current ||
   fechoDaLutaRef.current` no App) e fica com o `try/calou` — se o carimbo
   estourar, a mensagem entra sem ele.

   Imutável: a mensagem marcada é uma cópia; a que já tem a marca passa a
   MESMA (não se copia outra vez); o lixo passa intacto; sem luta, ou sem
   lista, devolve-se o que entrou. Provado contra o recorte à letra do App
   de c494a04 (`golpe-dourado.json`) em `teste-motor-carimbo-da-luta.mjs`.
   ============================================================ */

export function carimbarALuta(novas, luta) {
  if (!luta || !Array.isArray(novas)) return novas;
  return novas.map((m) => (m && typeof m === "object" && !m.naLuta ? { ...m, naLuta: true } : m));
}
