/* ============================================================
   A ESPERA DA FRASE (04/11/2026, a 2.ª leva da proposta) — src/motor/a-espera-da-frase.js

   «Espero pela Inez até ela chegar» (14.ª, 8h → 8h) e «fico à espera dele
   até às onze» (17.ª T10, 9h40 → 9h50) não passavam o tempo: esperar não
   tinha porta, e o único caminho era o botão do relógio, escondido. A frase
   de esperar passa a ser lida aqui, e o App propõe-a (a-proposta-da-frase.js):
   «Esperar até as onze · 1 h 20» → o botão → o mesmo `passarTempo` do relógio.

     aEsperaDaFrase(frase, { minuto }) → null | { minutos, ate? } | { opcoes: [min…] }
       minuto: o minuto do dia agora (0–1439)
       ate:    o minuto do dia do fim, quando a frase diz uma hora
       opcoes: a frase espera sem dizer quanto («até ele chegar») — o
               jogador escolhe; quanto alguém demora não se sabe esperando

   Puro, sem React. Provado em `testes/teste-a-espera-da-frase.mjs`.
   ============================================================ */
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export const A_ESPERA_DA_FRASE = Object.freeze({
  /* o verbo de esperar, na primeira pessoa (o «ele espera» da prosa não é meu) */
  verbo: /\b(espero|esperamos|aguardo|aguardamos|fico (a |à |a )?esper(a|ar|ando)|ficamos (a )?esper(a|ar|ando)|fico de tocaia|deixo (o tempo )?passar|deixamos (o tempo )?passar|faco hora|mato (o )?tempo)\b/,
  /* o que não é esperar: a negação, e o «espero que» do desejo */
  naoE: /\b(nao (espero|aguardo|fico)|espero que|esperamos que|espero bem|sem esperar)\b/,
  /* as horas ditas por extenso */
  horas: Object.freeze({ uma: 1, duas: 2, "tres": 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12 }),
  /* os minutos por extenso, para as durações */
  numeros: Object.freeze({ um: 1, uma: 1, dois: 2, duas: 2, "tres": 3, quatro: 4, cinco: 5, seis: 6, dez: 10, quinze: 15, vinte: 20, trinta: 30, quarenta: 40 }),
  /* os marcos do dia, em minutos */
  marcos: Object.freeze([
    { rx: /\b(o )?(amanhecer|nascer do sol|raiar do dia|de manha cedo|de manha|a manha)\b/, min: 360 },
    { rx: /\b(o )?meio[- ]dia\b/, min: 720 },
    { rx: /\b(o )?(entardecer|fim da tarde|por do sol|anoitecer|cair da noite)\b/, min: 1080 },
    { rx: /\ba meia[- ]noite\b|\bmeia[- ]noite\b/, min: 0 },
    { rx: /\b(a )?noite\b/, min: 1200 },
  ]),
  /* a parte do dia que desambigua «as sete» */
  tarde: /\b(da tarde|da noite|de noite|a noite)\b/,
  manha: /\b(da manha|de manha|da madrugada)\b/,
  /* quando a frase não diz quanto: as escolhas, em minutos */
  opcoes: Object.freeze([60, 120, 240]),
  /* nunca mais de um dia por frase */
  teto: 1440,
});

const numero = (w) => { const n = Number(w); if (Number.isFinite(n)) return n; return A_ESPERA_DA_FRASE.numeros[w] ?? A_ESPERA_DA_FRASE.horas[w] ?? null; };

/* a hora do «até às onze», no minuto do dia, ou null */
function aHoraDoAte(t) {
  const E = A_ESPERA_DA_FRASE;
  const m = t.match(/\bate (as |a |o )?(\d{1,2})(?:[:h](\d{2})|h| horas?)?\b/) || t.match(/\bate (as |a )?(uma|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)( horas?)?\b/);
  if (m) {
    let h = numero(m[2]);
    if (h == null || h > 23) return null;
    const mm = Number(m[3]) || 0;
    if (h < 12 && E.tarde.test(t)) h += 12;
    return { h, mm, ambigua: h <= 12 && !E.tarde.test(t) && !E.manha.test(t) && !/\d{1,2}[:h]/.test(m[0]) };
  }
  for (const k of E.marcos) if (/\bate\b/.test(t) && k.rx.test(t.slice(t.indexOf("ate")))) return { h: Math.floor(k.min / 60), mm: k.min % 60, ambigua: false };
  return null;
}

export function aEsperaDaFrase(frase, ctx) {
  const t = sem(frase).replace(/[«»"“”]/g, " ");
  const E = A_ESPERA_DA_FRASE;
  if (!t.trim() || t.trimStart().startsWith("[") || !E.verbo.test(t) || E.naoE.test(t)) return null;
  const agora = ((Math.floor(Number(ctx && ctx.minuto) || 0) % 1440) + 1440) % 1440;
  /* a duração dita: «uma hora», «duas horas», «meia hora», «30 minutos» */
  const dh = t.match(/\b(\d+|uma|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze) horas?\b/);
  const dm = t.match(/\b(\d+|dez|quinze|vinte|trinta|quarenta) minutos?\b/);
  const meia = /\bmeia hora\b/.test(t);
  const ate = aHoraDoAte(t);
  if (ate) {
    const vem = (a) => { const f = a - agora; return f <= 0 ? f + 1440 : f; };
    let alvo = ate.h * 60 + ate.mm;
    /* «as sete» sem manhã nem tarde: a primeira das duas que ainda vem */
    if (ate.ambigua && ate.h < 12 && vem(alvo + 720) < vem(alvo)) alvo += 720;
    const falta = vem(alvo);
    if (falta > E.teto) return null;
    return { minutos: falta, ate: alvo % 1440 };
  }
  if (meia) return { minutos: 30 };
  if (dh && !/\bate\b/.test(t.slice(0, dh.index))) { const n = numero(dh[1]); if (n && n * 60 <= E.teto) return { minutos: n * 60 }; }
  if (dm) { const n = numero(dm[1]); if (n) return { minutos: Math.min(E.teto, n) }; }
  return { opcoes: [...E.opcoes] };
}
