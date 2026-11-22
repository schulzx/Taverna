/* ============================================================
   A VENDA DA BOLSA (21/11/2026) — src/a-venda-da-bolsa.js

   A sétima sessão do Mestre vivo (mente/lancamento/mestre-vivo-sessao-7.md,
   T56–T58): «vendo uma Erva Amarga a Sable» mostrou «🛒 Vendido: … (bolsa:
   ◉ 80)», a prosa contou as moedas na mão, e a ficha ficou com ◉ 76 e as duas
   ervas na mochila. Três vezes, com dois itens.

   A causa estava no App, não na conta: a venda da frase corre DENTRO do turno
   (agirInterno), e `venderNoMercado` lia a ficha do estado do React e gravava
   só por `setPersonagem` — sem tocar no espelho (`personagemRef`). O resto do
   turno, que lê `fichaViva()`, mandava ao Narrador a ficha de antes da venda,
   e `aplicarResposta` gravava-a por cima: a linha existiu, a venda não. O
   pagamento da frase (`pagarDaProposta`) grava nos dois lugares, e por isso
   cobrava.

   A regra daqui: a linha «Vendido» só nasce junto da ficha que a venda
   produziu — uma fonte só. Se a venda não pode acontecer, a linha diz por quê,
   e a ficha não muda. O App grava a ficha devolvida por `mudarFicha` (o espelho
   e o estado de uma vez).

     aVendaDaBolsa(ficha, { item, origem, oferta }) →
       { ok: true,  ficha, valor, quem, linha }   a venda feita: a ficha nova
       { ok: false, ficha, linha }                 a mesma ficha, e o porquê
     `oferta`: { valor, quem: { nome }, motivo } — a de `ofertaPor` no App.

   Puro, sem React. Provado em `testes/teste-a-venda-da-bolsa.mjs`.
   ============================================================ */

export const O_TEXTO_DA_VENDA = Object.freeze({
  /* 21/11 (a nona sessão, T8 e T9): «Vendido: 2 rações a O Sino Amargo» — a quem, com a contração da tabela («ao Sino Amargo») */
  vendido: "🛒 Vendido: {I} {Q} por ◉ {V} (bolsa: ◉ {B}).",
  contracaoA: Object.freeze({ o: "ao", a: "à", os: "aos", as: "às" }),
  semItem: "⛔ {I}: não está na sua mochila.",
  equipado: "⛔ {I} está equipado — desequipe antes de vender.",
  semComprador: "⛔ {I}: {M}.",
  motivoPadrao: "ninguém aqui compra isso",
  semFicha: "⛔ Não há o que vender agora.",
});

const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);
const nomeDe = (raw) => (typeof raw === "string" ? raw : (raw && raw.nome) || "");
/* «O Sino Amargo» → «ao Sino Amargo»; «Fenna» → «a Fenna» */
export function aQuem(nome) {
  const n = str(nome).trim();
  const m = n.match(/^(O|A|Os|As)\s+(.+)$/);
  return m ? O_TEXTO_DA_VENDA.contracaoA[m[1].toLowerCase()] + " " + m[2] : "a " + n;
}
const tpl = (s, m) => str(s).replace(/\{(\w)\}/g, (_, k) => str(m[k]));

export function aVendaDaBolsa(ficha, pedido) {
  const T = O_TEXTO_DA_VENDA;
  if (!ehObj(ficha)) return { ok: false, ficha, linha: T.semFicha };
  const p = ehObj(pedido) ? pedido : {};
  const item = str(p.item).trim();
  const origem = p.origem === "equipamento" ? "equipamento" : "inventario";
  const lista = Array.isArray(ficha[origem]) ? ficha[origem] : [];
  const idx = item ? lista.findIndex((raw) => nomeDe(raw) === item) : -1;
  if (idx < 0) return { ok: false, ficha, linha: tpl(T.semItem, { I: item || "isso" }) };
  /* o que está VESTIDO não vai para a banca por engano */
  if (origem === "equipamento" && Object.values(ehObj(ficha.equipados) ? ficha.equipados : {}).some((e) => e && e.nome === item)) {
    return { ok: false, ficha, linha: tpl(T.equipado, { I: item }) };
  }
  const of = ehObj(p.oferta) ? p.oferta : {};
  const valor = Math.max(0, Math.floor(Number(of.valor) || 0));
  const quem = ehObj(of.quem) ? str(of.quem.nome) : "";
  if (!quem) return { ok: false, ficha, linha: tpl(T.semComprador, { I: item, M: str(of.motivo).trim() || T.motivoPadrao }) };
  const nova = { ...ficha, moedas: (Number(ficha.moedas) || 0) + valor, [origem]: lista.filter((_, i) => i !== idx) };
  return { ok: true, ficha: nova, valor, quem, linha: tpl(T.vendido, { I: item, Q: aQuem(quem), V: valor, B: nova.moedas }) };
}
