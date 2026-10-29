/* teste-motor-estado-do-pedido.mjs (trilha A, 29/10/2026) — o estado que o App dá ao pedido, e a praça do instante do turno

   O App passou a chamar `oPedidoDoTurno` em `enviar` no lugar do trecho que
   ia da pauta ao system. A peça do pedido entrega o estado à da pauta, logo
   o App dá-lhe os refs das DUAS tabelas (REFS_DA_PAUTA e REFS_DO_PEDIDO) e
   o render — e o render NÃO leva a banca da praça (`cidadeMercado`,
   `mercadoAqui`), pelo mesmo achado da pauta (2d95d33): a do render é a do
   último desenho da tela, e um turno que muda de cidade antes do pedido
   vendia a praça de antes, agora também no MERCADO do rodapé, que o trecho
   do App lia direto do render. O conserto é `oEstadoDoPedido(refs,
   render)`, que só deixa passar do render os seis do React
   (RENDER_DO_PEDIDO); a peça refaz a banca do estado do instante.

   A prova é jogada, não lida: os 275 casos de pedido-bloco.mjs correm pela
   peça com o estado montado como o App o monta — refs { current } pelo nome
   do ref, e o render com a banca velha junto, que não deve passar —, contra
   o dourado (pedido-dourado.json, o recorte do App que sempre refez a banca
   do estado). E cada caso corre também como o App de antes (o render, com a
   banca velha, direto à peça): os que mudam são os que o defeito vendia
   errado. E o que a peça escreve tem ref no App: o aplicar do App só sabe
   escrever o que as duas tabelas nomeiam (o system incluído). */
import { lerODourado, correrOsCasos, casosDoPedido, fotoGuardada, mesmaFoto } from "./pedido-bloco.mjs";
import { N_DA_PAUTA as N_CASOS } from "./pauta-bloco.mjs";
import { oPedidoDoTurno, oEstadoDoPedido, REFS_DO_PEDIDO, RENDER_DO_PEDIDO } from "../src/motor/pedido-do-turno.js";
import { REFS_DA_PAUTA, RENDER_DA_PAUTA } from "../src/motor/pauta-do-turno.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const D = lerODourado();
const CASOS = casosDoPedido();
/* o campo de cada ref, das duas tabelas (o App escreve por esta união) */
const TABELA = { ...REFS_DA_PAUTA, ...REFS_DO_PEDIDO };
/* os refs como o App os tem: um { current } por ref, com o valor do campo */
const refsDe = (estado) => {
  const r = {};
  for (const [c, info] of Object.entries(TABELA)) r[info.ref] = { current: estado && estado[c] };
  return r;
};
/* a tela ainda na estrada: o render velho que o App de antes passaria */
const RENDER_VELHO = { cidadeMercado: null, mercadoAqui: [] };
const comoOAppDeAgora = (estado, entrada, portas) => oPedidoDoTurno(oEstadoDoPedido(refsDe(estado), { ...estado.render, ...RENDER_VELHO }), entrada, portas);
const comoOAppDeAntes = (estado, entrada, portas) => oPedidoDoTurno({ ...estado, render: { ...estado.render, ...RENDER_VELHO } }, entrada, portas);

sec("1 · o estado que o App monta");
{
  const refs = { npcsRef: { current: { a: 1 } }, cidadeAtualRef: { current: "Vau" }, systemRef: { current: "S" }, canoneRef: { current: { x: 2 } } };
  const e = oEstadoDoPedido(refs, { personagem: { nome: "Ana" }, mundo: {}, mercado: {}, governos: {}, nomeCampanha: "c", historico: [{ role: "user" }], cidadeMercado: { nome: "Outra" }, mercadoAqui: [{ id: "m" }], qualquer: 1 });
  t("os campos da pauta lêem o ref do nome deles", e.npcs.a === 1 && e.cidadeAtual === "Vau");
  t("e os do pedido também (o system, o cânone)", e.system === "S" && e.canone.x === 2);
  t("todo campo das duas tabelas está lá; o que o App não deu vale indefinido", Object.keys(TABELA).every((c) => c in e) && e.mapa === undefined && e.tomando === undefined);
  t("do render passam só os seis do React (os cinco da pauta e o histórico)", JSON.stringify(Object.keys(e.render).sort()) === JSON.stringify([...RENDER_DO_PEDIDO].sort()) && RENDER_DA_PAUTA.every((n) => RENDER_DO_PEDIDO.includes(n)));
  t("e a banca do último render fica de fora", !("cidadeMercado" in e.render) && !("mercadoAqui" in e.render) && !("qualquer" in e.render));
  t("sem refs nem render, um estado vazio e não um estouro", (() => { const v = oEstadoDoPedido(null, null); return Object.keys(v.render).length === 0 && v.system === undefined && v.dia === undefined; })());
  t("o estado é novo: os refs não mudam", refs.npcsRef.current.a === 1 && Object.keys(refs).length === 4);
  const tortos = Object.keys(REFS_DO_PEDIDO).filter((c) => REFS_DA_PAUTA[c] && REFS_DA_PAUTA[c].ref !== REFS_DO_PEDIDO[c].ref);
  t("um campo que as duas tabelas têm é o mesmo ref nas duas (a união não tem ambiguidade)", tortos.length === 0, tortos.join());
}

sec(`2 · os ${N_CASOS} casos, com o estado montado como o App o monta, contra o dourado`);
const agora = await correrOsCasos(D, { lado: "peca", peca: comoOAppDeAgora, casos: CASOS });
const batem = agora.filter((f, i) => mesmaFoto(fotoGuardada(f, i), D.fotos[i])).length;
const primeira = agora.findIndex((f, i) => !mesmaFoto(fotoGuardada(f, i), D.fotos[i]));
/* MOVIDA (29/10, trilha B): a prova passa a correr também os 12 casos de
   cobertura da pauta (pauta-bloco.mjs, COBERTURA: ENTRETANTO e O QUE VOLTA),
   depois dos 275 — o dourado foi regenerado contra o mesmo commit e as 275
   fotos antigas ficaram iguais; só entraram casos — aqui `N_CASOS` é o número de casos do pedido, os 275 e os de cobertura */
t(`${batem}/${N_CASOS} iguais ao dourado, com a banca velha no render (o App de agora)`, batem === N_CASOS, primeira >= 0 ? "o caso " + primeira + " diverge" : "");
const semRef = [...new Set(agora.flatMap((f) => f.aplicados))].filter((c) => !TABELA[c]);
t("tudo o que a peça escreve tem ref numa das duas tabelas (o aplicar do App não perde nada)", semRef.length === 0, semRef.join());
t("e o system é uma das escritas (o systemRef do App chega pelo aplicar)", agora.some((f) => f.aplicados.includes("system")));

sec("3 · o defeito: com a banca do último render, a praça é a de antes");
const antes = await correrOsCasos(D, { lado: "peca", peca: comoOAppDeAntes, casos: CASOS });
const mudam = antes.map((f, i) => (mesmaFoto(fotoGuardada(f, i), fotoGuardada(agora[i], i)) ? -1 : i)).filter((i) => i >= 0);
t(`o render velho muda o pedido em ${mudam.length} dos ${N_CASOS} casos`, mudam.length > 0);
/* o que muda é a praça: as BANCAS ABERTAS AQUI do rodapé (a da tela na estrada é vazia) ou a pauta */
const ultima = (f) => { const m = (f.redeInteira || [])[1] || []; return String((m[m.length - 1] || {}).content || ""); };
const DA_PRACA = /mercado|banca|balc[aã]o|à venda|perguntou/i;
const pelaPraca = mudam.filter((i) => {
  const a = ultima(antes[i]).split("\n"), b = ultima(agora[i]).split("\n");
  return b.some((l) => !a.includes(l) && DA_PRACA.test(l)) || a.some((l) => !b.includes(l) && DA_PRACA.test(l));
});
/* os outros: o pedido à rede é o mesmo (ou o caso estoura igual, no lixo), e
   só muda o ref da lista EM CENA, que a pauta escreve e que leva as bancas
   da cena (`bancas` no contexto do EM CENA) — a praça outra vez, guardada */
const soOEmCena = mudam.filter((i) => !pelaPraca.includes(i)).filter((i) => {
  const fa = fotoGuardada(agora[i], i), fb = fotoGuardada(antes[i], i);
  const difs = Object.keys(fa).filter((k) => JSON.stringify(fa[k]) !== JSON.stringify(fb[k]));
  const refs = Object.keys({ ...agora[i].refs, ...antes[i].refs }).filter((k) => agora[i].refs[k] !== antes[i].refs[k]);
  return difs.length === 1 && difs[0] === "refs" && refs.length === 1 && refs[0] === "emCena";
});
t(`a diferença é a praça: em ${pelaPraca.length} o pedido do instante diz da banca o que o velho não diz, e em ${soOEmCena.length} muda só a lista EM CENA guardada`, pelaPraca.length + soOEmCena.length === mudam.length && pelaPraca.length > 0, mudam.filter((i) => !pelaPraca.includes(i) && !soOEmCena.includes(i)).slice(0, 5).join(","));
t("e nenhum dos que mudam é igual ao dourado", mudam.every((i) => !mesmaFoto(fotoGuardada(antes[i], i), D.fotos[i])));

console.log(`\n${ok} ok, ${mal} falhas`);
if (mal) process.exit(1);
