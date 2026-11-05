/* ============================================================
   AS MARCAS DA MOLDURA (05/11/2026) — a moldura vira a memória da campanha

   A proposta do `desenho` (formas.md §AAA §12), aprovada pela pessoa:
   «Gostei da proposta, aprovada». Cada feito verdadeiro grava uma marca no
   aro do retrato: um ENTALHE por chefe derrotado, uma RUNA por promessa
   cumprida, uma CICATRIZ de ouro por cada vez que o herói voltou do chão.
   Até doze, à volta do aro como as horas de um relógio; tocar numa diz a
   linha («o Rei-Lobo, dia 14»). Ao fim de uma campanha, duas molduras de
   ouro nunca são iguais.

   TUDO O QUE A MARCA DIZ SAI DO SISTEMA. Este módulo não decide que houve um
   feito: recebe-o de quem o resolveu (a luta, o Livro de Promessas, a queda)
   e grava-o. O que a marca não sabe, não diz.

   GRAVADO NÃO SE APAGA. As doze posições são das doze primeiras marcas da
   campanha: o que foi entalhado fica, como num aro de verdade. O registo
   guarda mais (até `teto`), para a crónica e para a ficha que os conta.

   O SAVE: `pers.feitos`, campo NOVO e aditivo, que a versão antiga ignora.
   ============================================================ */

export const MARCAS_DA_MOLDURA = Object.freeze({
  tipos: Object.freeze({
    chefe: Object.freeze({ forma: "entalhe", diz: "{nome}, dia {dia}" }),
    promessa: Object.freeze({ forma: "runa", diz: "{nome} — cumprida, dia {dia}" }),
    levantou: Object.freeze({ forma: "cicatriz", diz: "voltou do chão, dia {dia}" }),
  }),
  noAro: 12,        /* as horas do relógio */
  teto: 60,         /* o registo guarda até aqui; acima disso, o save não cresce */
  horaDaPrimeira: 0, /* a primeira marca fica às 12 h, e as outras seguem no sentido do relógio */
});

const txt = (x, max = 60) => (typeof x === "string" ? x.trim().slice(0, max) : "");
const inteiro = (x) => { const n = Number(x); return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0; };

/* O registo de feitos, sempre uma lista limpa (o save velho não o tem). */
export function garantirFeitos(lista) {
  if (!Array.isArray(lista)) return [];
  return lista
    .filter((f) => f && typeof f === "object" && MARCAS_DA_MOLDURA.tipos[f.tipo])
    .map((f) => ({ tipo: f.tipo, nome: txt(f.nome), dia: inteiro(f.dia), chave: txt(f.chave, 120) || `${f.tipo}|${txt(f.nome)}|${inteiro(f.dia)}` }))
    .slice(0, MARCAS_DA_MOLDURA.teto);
}

/* Grava um feito. Devolve a lista nova (imutável) e se gravou. Um feito com
   a mesma chave não grava duas vezes (o mesmo chefe, a mesma promessa). */
export function gravarFeito(lista, feito) {
  const atual = garantirFeitos(lista);
  if (!feito || !MARCAS_DA_MOLDURA.tipos[feito.tipo]) return { feitos: atual, gravou: false };
  const novo = garantirFeitos([feito])[0];
  if (!novo || atual.some((f) => f.chave === novo.chave)) return { feitos: atual, gravou: false };
  if (atual.length >= MARCAS_DA_MOLDURA.teto) return { feitos: atual, gravou: false };
  return { feitos: [...atual, novo], gravou: true };
}

/* A linha da marca, na voz do jogo. */
export function linhaDaMarca(feito) {
  const t = feito && MARCAS_DA_MOLDURA.tipos[feito.tipo];
  if (!t) return "";
  return t.diz.replace("{nome}", txt(feito.nome) || "sem nome").replace("{dia}", String(inteiro(feito.dia)));
}

/* As marcas no aro: as doze primeiras, cada uma com a sua hora (0–11) e o
   ângulo em graus (0 = topo, sentido do relógio). */
export function marcasNoAro(lista) {
  return garantirFeitos(lista).slice(0, MARCAS_DA_MOLDURA.noAro).map((f, i) => {
    const hora = (MARCAS_DA_MOLDURA.horaDaPrimeira + i) % MARCAS_DA_MOLDURA.noAro;
    return Object.freeze({ ...f, forma: MARCAS_DA_MOLDURA.tipos[f.tipo].forma, hora, angulo: hora * (360 / MARCAS_DA_MOLDURA.noAro), linha: linhaDaMarca(f) });
  });
}
