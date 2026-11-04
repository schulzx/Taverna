/* ============================================================
   A COMPRESSÃO DAS PÁGINAS VELHAS (03/11/2026, a 14.ª sessão) — Taverna

   A sessão gravada (sessao-guardada.js) vira a página quando passa do
   teto, e até aqui só guardava UMA página de antes: na segunda virada, a
   primeira deitava-se fora (contada em `cortou`, mas fora). Medido na
   14.ª, a cabeça pesa 84 mil caracteres e o turno 14 a 20 mil (média 17
   mil): a página leva ~18 turnos, e a partir do turno ~37 a sessão
   começava a perder o princípio de si mesma.

   As páginas velhas não se leem a cada turno — só o replay as lê, depois.
   Logo podem ir APERTADAS: este módulo é um LZW sem perdas, puro, que
   escreve num texto que o localStorage e o JSON guardam sem escapar nada.
   Na página de antes da 14.ª (399.655 caracteres, 22 turnos) sai em 18%.

   O TEXTO COMPRIMIDO: cada caractere leva `bits` bits (15), somados à
   `base` (0x100) — fica entre U+0100 e U+80FF: acima dos caracteres de
   controlo, das aspas e da barra (que o JSON escaparia) e abaixo dos
   substitutos (U+D800…, que um JSON escaparia e um armazém pode estragar).
   Dentro, por ordem: o comprimento do original, o alfabeto (os caracteres
   que ele usa, pela ordem em que aparecem) e os códigos do LZW, cada um
   com a largura que o descompressor também sabe calcular (a do código
   mais alto que pode vir naquele ponto). Nada é aproximado: o que sai de
   `descomprimir(comprimir(x))` é `x`, byte a byte — o que o replay pede.

     comprimir(texto)   → o texto apertado, ou null (não é texto, ou grande
                          demais para o cabeçalho)
     descomprimir(z)    → o original, ou null (lixo, truncado, ou de outro
                          formato). Os dois são puros e nunca lançam.
   ============================================================ */

export const COMPRESSAO = Object.freeze({
  /* o nome do formato, escrito ao lado de cada página apertada */
  como: "lzw15",
  /* bits por caractere do texto comprimido, e o primeiro caractere usado */
  bits: 15,
  base: 0x100,
  /* as larguras do cabeçalho: o comprimento do original (até 2^30), o
     tamanho do alfabeto (até 65536) e cada caractere dele (UTF-16) */
  bitsDoComprimento: 30,
  bitsDoAlfabeto: 17,
  bitsDoCaractere: 16,
});

/* quantos bits são precisos para escrever x (x ≥ 1) */
const largura = (x) => 32 - Math.clz32(x);
/* a chave de um par (código, caractere) no dicionário do compressor */
const PAR = 65536;

export function comprimir(texto, cfg = COMPRESSAO) {
  try {
    if (typeof texto !== "string") return null;
    const C = cfg && typeof cfg === "object" ? { ...COMPRESSAO, ...cfg } : COMPRESSAO;
    const L = texto.length;
    if (L >= 2 ** C.bitsDoComprimento) return null;
    const saida = [];
    let acc = 0, nb = 0;
    const por = (v, w) => {
      for (let i = w - 1; i >= 0; i--) {
        acc = (acc << 1) | (Math.floor(v / 2 ** i) & 1);
        if (++nb === C.bits) { saida.push(String.fromCharCode(C.base + acc)); acc = 0; nb = 0; }
      }
    };
    const alfa = new Map();
    for (let i = 0; i < L; i++) { const c = texto.charCodeAt(i); if (!alfa.has(c)) alfa.set(c, alfa.size); }
    por(L, C.bitsDoComprimento);
    por(alfa.size, C.bitsDoAlfabeto);
    for (const c of alfa.keys()) por(c, C.bitsDoCaractere);
    if (L) {
      const A = alfa.size, dic = new Map();
      let w = alfa.get(texto.charCodeAt(0)), prox = A, j = 0;
      for (let i = 1; i < L; i++) {
        const c = texto.charCodeAt(i);
        const e = dic.get(w * PAR + c);
        if (e !== undefined) { w = e; continue; }
        por(w, largura(A + j)); j++;
        dic.set(w * PAR + c, prox++);
        w = alfa.get(c);
      }
      por(w, largura(A + j));
    }
    if (nb) por(0, C.bits - nb);
    return saida.join("");
  } catch { return null; }
}

export function descomprimir(z, cfg = COMPRESSAO) {
  try {
    if (typeof z !== "string") return null;
    const C = cfg && typeof cfg === "object" ? { ...COMPRESSAO, ...cfg } : COMPRESSAO;
    const teto = 2 ** C.bits;
    let pos = 0, acc = 0, nb = 0, falhou = false;
    const tira = (w) => {
      let v = 0;
      for (let i = 0; i < w; i++) {
        if (nb === 0) {
          const c = pos < z.length ? z.charCodeAt(pos++) - C.base : -1;
          if (c < 0 || c >= teto) { falhou = true; return 0; }
          acc = c; nb = C.bits;
        }
        nb--;
        v = v * 2 + ((acc >>> nb) & 1);
      }
      return v;
    };
    const L = tira(C.bitsDoComprimento), A = tira(C.bitsDoAlfabeto);
    if (falhou) return null;
    const dic = [];
    for (let i = 0; i < A; i++) dic.push(String.fromCharCode(tira(C.bitsDoCaractere)));
    if (falhou) return null;
    if (!L) return A === 0 ? "" : null;
    if (!A) return null;
    const partes = [];
    let tam = 0, ant = null, j = 0;
    while (tam < L) {
      const codigo = tira(largura(A + j)); j++;
      if (falhou) return null;
      let e;
      if (codigo < dic.length) e = dic[codigo];
      else if (codigo === dic.length && ant !== null) e = ant + ant[0];
      else return null;
      partes.push(e); tam += e.length;
      if (ant !== null) dic.push(ant + e[0]);
      ant = e;
    }
    const s = partes.join("");
    return s.length === L ? s : null;
  } catch { return null; }
}
