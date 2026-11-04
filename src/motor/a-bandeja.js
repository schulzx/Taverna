/* ============================================================
   A BANDEJA — todo dado lançado pousa à vista (04/11/2026)

   A ordem da pessoa: «um rpg precisa de constantes rolagens pra ter o
   sentimento que você está jogando e arriscando algo, além de que são
   diferentes dados jogados». E: «tem que ser um jogo, se parecer com um
   jogo e agir como um jogo».

   O jogo já rolava mais dados do que mostrava. O d20 do teste tinha o Véu;
   o d100 do oráculo, o dado de vida do descanso curto, o d20 da busca e os
   da marcha forçada só apareciam como uma linha de texto «🎲 …» no
   registo, e o jogador não via dado nenhum. A bandeja é a faixa da mesa
   onde eles pousam, cada um com a sua forma.

   ESTE MÓDULO NÃO ROLA NADA. Recebe o que o sistema já rolou (o mesmo
   número, da mesma semente) e devolve o lançamento que a tela mostra. Um
   dado que a tela rolasse por conta própria seria um dado a mentir sobre
   o resultado — e a semente é o único árbitro que esta casa tem.
   ============================================================ */

export const A_BANDEJA = Object.freeze({
  /* as faces que a mesa conhece; o d100 desenha-se como dois d10 */
  faces: Object.freeze([4, 6, 8, 10, 12, 20, 100]),
  /* o papel do dado diz a cor dele na mesa */
  papeis: Object.freeze(["teste", "dano", "cura", "sorte", "uso"]),
  /* quantos lançamentos ficam à vista: o último em grande, os outros dois
     encostados — mais do que isto é registo, e o registo já existe */
  ficam: 3,
  /* quantos dados cabem num lançamento só (a marcha de oito horas não
     enche a mesa de oito dados: o resto é «+N») */
  tetoDeDados: 6,
  /* o tempo do lançamento, em ms — o dado rola, pousa, e o número fica */
  rolarMs: 700,
  pousoMs: 220,
});

const FACES = new Set(A_BANDEJA.faces);
const PAPEIS = new Set(A_BANDEJA.papeis);

const inteiro = (v, padrao = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : padrao;
};

/* Um dado só vai à mesa se for um dado de verdade: face conhecida e valor
   dentro dela. Um valor fora (0, NaN, 21 num d20) é o sintoma de um erro
   a montante, e mostrá-lo seria pôr esse erro na mão do jogador. */
function umDado(d, papelDoLancamento) {
  if (!d || typeof d !== "object") return null;
  const faces = inteiro(d.faces);
  const valor = inteiro(d.valor);
  if (!FACES.has(faces) || valor < 1 || valor > faces) return null;
  const papel = PAPEIS.has(d.papel) ? d.papel : papelDoLancamento;
  return Object.freeze({ faces, valor, papel, posto: !!d.posto });
}

/* O desfecho que a mesa mostra. Só o d20 do teste conhece crítico e
   desastre (20 e 1 naturais); os outros dados não têm pontas. */
function desfechoDe({ alvo, total, natural, faces, menorGanha }) {
  if (faces === 20 && natural === 20) return "critico";
  if (faces === 20 && natural === 1) return "desastre";
  if (alvo == null) return "livre";
  return (menorGanha ? total <= alvo : total >= alvo) ? "sucesso" : "falha";
}

/* ---------------- O LANÇAMENTO ----------------
   `rotulo`: o que se tentou, na voz do jogo («Saltar o muro»).
   `dados`: [{ faces, valor, papel?, posto? }] — `posto` é o dado que a
   vantagem ou o Destino puseram de lado (fica à vista, apagado).
   `mod`: o bónus que se soma aos dados contados.
   `alvo`: o número a bater (CD), ou a chance do oráculo.
   `menorGanha`: o d100 do oráculo ganha por baixo («sim» se ≤ chance). */
export function lancamento({ rotulo = "", dados = [], mod = 0, alvo = null, papel = "teste", menorGanha = false } = {}) {
  const p = PAPEIS.has(papel) ? papel : "teste";
  const todos = (Array.isArray(dados) ? dados : []).map((d) => umDado(d, p)).filter(Boolean);
  if (!todos.length) return null;
  const contados = todos.filter((d) => !d.posto);
  if (!contados.length) return null;
  const m = inteiro(mod);
  const soma = contados.reduce((s, d) => s + d.valor, 0);
  const total = soma + m;
  const a = alvo == null || alvo === "" ? null : inteiro(alvo, null);
  const primeiro = contados[0];
  const desfecho = desfechoDe({
    alvo: a, total, natural: contados.length === 1 ? primeiro.valor : 0,
    faces: contados.length === 1 ? primeiro.faces : 0, menorGanha: !!menorGanha,
  });
  const visiveis = todos.slice(0, A_BANDEJA.tetoDeDados);
  return Object.freeze({
    rotulo: String(rotulo || "").trim(),
    papel: p,
    dados: Object.freeze(visiveis),
    alem: todos.length - visiveis.length,
    mod: m, total, alvo: a, menorGanha: !!menorGanha, desfecho,
  });
}

/* ---------------- OS LANÇAMENTOS QUE O JOGO JÁ FAZ ---------------- */

/* O d20 do teste (o Véu). `anterior` é o dado que o Destino mandou refazer:
   fica na mesa, posto de lado, para o jogador ver o que trocou. */
export function lancamentoDoTeste({ valor, mod = 0, dc = null, rotulo = "", anterior = null } = {}) {
  const dados = [];
  if (anterior != null) dados.push({ faces: 20, valor: anterior, posto: true });
  dados.push({ faces: 20, valor });
  const l = lancamento({ rotulo: rotulo || "Teste", dados, mod, alvo: dc, papel: "teste" });
  /* o Véu já rolou este dado na tela, com a cerimónia dele: na bandeja ele
     pousa sem rolar outra vez, ou o jogador veria o mesmo dado cair duas */
  return l && Object.freeze({ ...l, jaRolou: true });
}

/* O d100 do oráculo: ganha por baixo, contra a chance. Uma resposta que o
   mundo já tinha dado não rola de novo, e por isso não vai à mesa. */
export function lancamentoDoOraculo(r, rotulo = "") {
  if (!r || r.reusado) return null;
  return lancamento({ rotulo: rotulo || "O mundo responde", dados: [{ faces: 100, valor: r.rolo }], alvo: r.chance, papel: "sorte", menorGanha: true });
}

/* O dado de vida do descanso curto: a cura é o dado mais o Vigor. */
export function lancamentoDoDadoDeVida(r, modVigor = 0) {
  if (!r || !r.ok) return null;
  return lancamento({ rotulo: "Dado de vida", dados: [{ faces: r.lados, valor: r.rolado }], mod: modVigor, papel: "cura" });
}

/* Os d20 de uma série (a marcha forçada, hora a hora): cada um contra a
   sua CD. A mesa mostra os dados e o pior desfecho manda na cor. */
export function lancamentoDaSerie(rotulo, testes = []) {
  const lista = (Array.isArray(testes) ? testes : []).filter((t) => t && inteiro(t.rolo) >= 1);
  if (!lista.length) return null;
  const ultimo = lista[lista.length - 1];
  const l = lancamento({ rotulo, dados: lista.map((t) => ({ faces: 20, valor: t.rolo })), papel: "teste" });
  if (!l) return null;
  const cedeu = lista.some((t) => t.passou === false);
  /* numa série a soma não diz nada: o que conta é se alguma hora cedeu */
  return Object.freeze({ ...l, total: inteiro(ultimo.rolo), alvo: inteiro(ultimo.cd, null), desfecho: cedeu ? "falha" : "sucesso", serie: true });
}

/* ---------------- A MESA ----------------
   A bandeja é uma lista curta e imutável: o lançamento novo entra à
   frente e o mais velho cai. O número de ordem (`n`) é a identidade do
   lançamento na tela — é por ele que a peça sabe que tem de rolar de novo
   quando dois testes seguidos dão o mesmo resultado. */
export function naBandeja(bandeja, l) {
  const atual = Array.isArray(bandeja) ? bandeja : [];
  if (!l || !Array.isArray(l.dados) || !l.dados.length) return atual;
  const n = (atual.length ? inteiro(atual[0].n) : 0) + 1;
  return Object.freeze([Object.freeze({ ...l, n }), ...atual].slice(0, A_BANDEJA.ficam));
}

/* A linha que acompanha o dado: o que se tentou, a conta e o que saiu.
   «Saltar o muro · 14 + 2 = 16 · precisa de 13»; o d100 diz a chance. */
export function aLinhaDoLancamento(l) {
  if (!l) return "";
  const contados = l.dados.filter((d) => !d.posto);
  const soma = contados.map((d) => d.valor).join(" + ");
  const comMod = l.mod ? `${soma} ${l.mod > 0 ? "+" : "−"} ${Math.abs(l.mod)} = ${l.total}` : (contados.length > 1 && !l.serie ? `${soma} = ${l.total}` : `${l.total}`);
  const conta = l.serie ? contados.map((d) => d.valor).join(" · ") : comMod;
  const alvo = l.alvo == null ? "" : l.menorGanha ? ` · chance ${l.alvo}%` : ` · precisa de ${l.alvo}`;
  const alem = l.alem > 0 ? ` (+${l.alem})` : "";
  return `${l.rotulo ? l.rotulo + " · " : ""}${conta}${alem}${alvo}`;
}

/* O nome do desfecho, como a mesa o diz. */
export const NOME_DO_DESFECHO = Object.freeze({
  critico: "crítico", desastre: "desastre", sucesso: "passou", falha: "falhou", livre: "",
});
