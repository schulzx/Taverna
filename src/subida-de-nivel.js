/* ============================================================
   A SUBIDA DE NÍVEL, EM CONTA (AAA · 05/11/2026) — formas.md §AAA §4

   A cerimónia (src/painel-subida-de-nivel.jsx) só pinta; aqui mora o que
   ela mostra e o que ela deixa escolher, provado em Node:

   · os GANHOS, com os números de sempre — PV_POR_NIVEL e PM_POR_NIVEL
     (regras-jogo.js), pontosNoNivel (classes.js), pontosAtributoNoNivel e
     tetoAtributo (atributos.js) — os mesmos que o `confirmarNivel` do App
     soma. Nada inventado: a cerimónia é o ModalNivel com cara de jogo.
   · se o DEGRAU DA MOLDURA muda neste nível (a forja; nos outros, o pulso)
     e se a SUBCLASSE abriu (a gema acende).
   · a ESCOLHA DOS PONTOS: tocar num disco põe um ponto, tocar outra vez
     desfaz (§4, quadro 5). Cada ponto é um `subirAtributo` — o custo, o
     teto e o motivo são os de atributos.js, nunca outros.
   ============================================================ */
import { PV_POR_NIVEL, PM_POR_NIVEL, bonusEquip } from "./regras-jogo.js";
import { pontosNoNivel } from "./classes.js";
import { pontosAtributoNoNivel, tetoAtributo, podeSubirAtributo, subirAtributo, pontosAtributoDisponiveis } from "./atributos.js";
import { degrauDaMoldura, molduraDe } from "./moldura.js";
import { ATRIBUTOS } from "./constantes.js";

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

/* O degrau mudou neste nível? (a camada nova forja-se: 5, 10, 15) */
export function degrauMudou(nivel) {
  const n = Math.max(1, Math.floor(num(nivel, 1)));
  return n > 1 && degrauDaMoldura(n) !== degrauDaMoldura(n - 1);
}

/* A gema que acendeu: a pedra de depois, se antes não havia (ou era
   outra). `null` quando a subclasse não abriu agora. */
export function gemaQueAcendeu(antes, depois) {
  try {
    const a = molduraDe(antes || {}).gema, d = molduraDe(depois || {}).gema;
    return d && (!a || a.pedra !== d.pedra) ? d : null;
  } catch (e) { return null; }
}

/* OS GANHOS do nível `nivel`, em linhas { id, rotulo, antes, depois } ou
   { id, rotulo, mais }. `antes`/`depois` são a ficha antes e depois da
   subida; sem `antes`, os máximos de antes são os de depois menos o degrau
   da tabela (o mesmo que `aplicarNivel` somou). */
export function ganhosDaSubida(nivel, antes, depois) {
  const n = Math.max(1, Math.floor(num(nivel, 1)));
  const d = depois || {};
  const vMax = num(d.vidaMax), mMax = num(d.manaMax);
  const vAntes = antes && antes.vidaMax != null ? num(antes.vidaMax) : vMax - PV_POR_NIVEL;
  const mAntes = antes && antes.manaMax != null ? num(antes.manaMax) : mMax - PM_POR_NIVEL;
  const linhas = [];
  if (vMax) linhas.push({ id: "pv", rotulo: "PV máx.", antes: vAntes, depois: vMax });
  if (mMax) linhas.push({ id: "pm", rotulo: "PM máx.", antes: mAntes, depois: mMax });
  const hab = pontosNoNivel(n);
  if (hab) linhas.push({ id: "habilidade", rotulo: hab > 1 ? "pontos de habilidade" : "ponto de habilidade", mais: hab });
  const atr = pontosAtributoNoNivel(n);
  if (atr) linhas.push({ id: "atributo", rotulo: atr > 1 ? "pontos de atributo" : "ponto de atributo", mais: atr });
  const teto = tetoAtributo(n), tetoAntes = tetoAtributo(n - 1);
  if (teto > tetoAntes) linhas.push({ id: "teto", rotulo: "teto dos atributos", antes: `+${tetoAntes}`, depois: `+${teto}` });
  if (antes && d.heroismo != null && antes.heroismo != null && num(d.heroismo) > num(antes.heroismo)) {
    linhas.push({ id: "heroismo", rotulo: "Heroísmo", mais: num(d.heroismo) - num(antes.heroismo) });
  }
  return linhas;
}

/* A ESCOLHA: `escolhas` é a lista dos atributos tocados, por ordem. Tocar
   num que já está escolhido desfaz; num que não está, põe um ponto se o
   atributo aceita (custo, teto e pontos de atributos.js). */
export function alternarPonto(pers, escolhas, attrId) {
  const lista = Array.isArray(escolhas) ? escolhas : [];
  if (lista.includes(attrId)) return lista.filter((x) => x !== attrId);
  const plano = planoDosPontos(pers, lista);
  return podeSubirAtributo(plano.pers, attrId).pode ? [...lista, attrId] : lista;
}

/* O PLANO: a ficha com as escolhas aplicadas, uma a uma, pelo
   `subirAtributo` de sempre; as linhas antes → depois e os pontos que
   restam. Uma escolha que já não cabe (a ficha mudou) cai calada. */
export function planoDosPontos(pers, escolhas) {
  let p = pers || {};
  const linhas = [];
  const feitas = [];
  for (const id of Array.isArray(escolhas) ? escolhas : []) {
    const antes = num((p.atributos || {})[id]);
    const r = subirAtributo(p, id);
    if (!r.ok) continue;
    p = r.pers;
    feitas.push(id);
    const a = ATRIBUTOS.find((x) => x.id === id);
    linhas.push({ id, rotulo: a ? a.nome : id, antes, depois: r.valor, custo: r.custo });
  }
  return { pers: p, linhas, feitas, restam: num(p.pontosAtr) };
}

/* O PREÇO NO PRIMÁRIO: «Confirmar · Intelecto +3 → +4». Sem escolha, o
   verbo fica sozinho (e a peça cala o botão). */
const comSinal = (n) => (n >= 0 ? "+" : "−") + Math.abs(n);
export function rotuloDoConfirmar(linhas, verbo = "Confirmar") {
  const ls = Array.isArray(linhas) ? linhas : [];
  if (!ls.length) return verbo;
  return `${verbo} · ${ls.map((l) => `${l.rotulo} ${comSinal(l.antes)} → ${comSinal(l.depois)}`).join(", ")}`;
}

/* A FICHA COMO CARTA (§2) tem os mesmos discos fora da cerimónia: a porta
   da subida para quem a adiou. */
const sinal = (n) => (n >= 0 ? "+" : "−") + Math.abs(n);
/* OS SEIS DISCOS de uma ficha, prontos a pintar: valor, estado, a linha de
   baixo (o preço do próximo ponto quando há pontos; «no teto»; ou o que o
   equipamento empresta) e se aceitam toque. Puro sobre a ficha. */
export function discosDaFicha(p) {
  const pers = p || {};
  const nivel = pers.nivel || 1;
  const teto = tetoAtributo(nivel);
  let pontos = 0;
  try { pontos = pontosAtributoDisponiveis(pers); } catch (e) { pontos = 0; }
  return ATRIBUTOS.map((a) => {
    const valor = Math.max(0, Number((pers.atributos || {})[a.id]) || 0);
    let chk = { pode: false, custo: 0 };
    try { chk = podeSubirAtributo(pers, a.id); } catch (e) { /* sem conta, o disco só mostra */ }
    let equip = 0;
    try { equip = Number(bonusEquip(pers, a.id)) || 0; } catch (e) { equip = 0; }
    const noTeto = valor >= teto;
    const linha = noTeto ? "no teto" : pontos > 0 && chk.custo ? `custa ${chk.custo}` : equip ? `${sinal(equip)} equip.` : "";
    return { id: a.id, nome: a.nome, valor, texto: sinal(valor), estado: noTeto ? "teto" : "repouso", linha, aceita: pontos > 0 && !!chk.pode };
  });
}
