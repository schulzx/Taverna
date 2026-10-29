/* teste-motor-estado-da-pauta.mjs (trilha A, 29/10/2026) — o estado que o App dá à pauta, e a praça do instante do turno

   O ACHADO (trilha B, bb7ab7a): o App passava à pauta a banca da praça do
   ÚLTIMO RENDER (`cidadeMercado`, `mercadoAqui`), não a do instante do
   turno. Um turno que muda de cidade antes da pauta — a chegada sozinha, a
   caminhada — vendia a praça de antes, ou nenhuma, se a tela ainda estava
   na estrada. O conserto: o App monta o estado por `oEstadoDaPauta(refs,
   render)`, que só deixa passar do render os cinco do React
   (RENDER_DA_PAUTA), e a peça refaz a banca do estado.

   A prova é jogada, não lida: os 275 casos de pauta-bloco.mjs (194 turnos
   gravados das sessões 8 a 10, e 81 da prova) correm pela peça com o estado
   montado como o App o monta — refs { current } pelo nome do ref —, contra o
   dourado (pauta-dourado.json, o recorte do App que sempre refez a banca do
   estado). E cada caso corre também com o render velho (a tela na estrada:
   sem cidade, banca vazia), o do App de antes do conserto: os casos onde a
   praça muda são os que o defeito vendia errado. */
import { lerODourado, correrAPeca, fotoDaPauta, casosDaPauta, fotoGuardada, mesmaFoto, osModulos, osPadroes, N_CASOS, N_DA_PAUTA } from "./pauta-bloco.mjs";
import { aPautaDoTurno, oEstadoDaPauta, REFS_DA_PAUTA, RENDER_DA_PAUTA } from "../src/motor/pauta-do-turno.js";
import { textoDaPauta } from "../src/pauta.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const D = lerODourado();
const mods = await osModulos(D.imports);
const padroes = osPadroes(D, mods);
const CASOS = casosDaPauta();
/* os refs como o App os tem: um { current } por ref, com o valor do campo */
const refsDe = (estado) => {
  const r = {};
  for (const [c, info] of Object.entries(REFS_DA_PAUTA)) r[info.ref] = { current: estado && estado[c] };
  return r;
};
/* a tela ainda na estrada: o render velho que o App de antes passava */
const RENDER_VELHO = { cidadeMercado: null, mercadoAqui: [] };
/* o App de agora: o estado sai de oEstadoDaPauta, com o render que o App tem (e a banca velha junto, que não deve passar) */
const comoOAppDeAgora = (estado, entrada, portas) => aPautaDoTurno(oEstadoDaPauta(refsDe(estado), { ...estado.render, ...RENDER_VELHO }), entrada, portas);
/* o App de antes do conserto: o render, com a banca velha, ia direto à peça */
const comoOAppDeAntes = (estado, entrada, portas) => aPautaDoTurno({ ...estado, render: { ...estado.render, ...RENDER_VELHO } }, entrada, portas);
const foto = (r, k) => fotoGuardada(fotoDaPauta(r), k.i);

sec("1 · o estado que o App monta");
{
  const refs = { npcsRef: { current: { a: 1 } }, cidadeAtualRef: { current: "Vau" }, diaRef: { current: 7 } };
  const e = oEstadoDaPauta(refs, { personagem: { nome: "Ana" }, mundo: { genero: "x" }, mercado: {}, governos: {}, nomeCampanha: "c", cidadeMercado: { nome: "Outra" }, mercadoAqui: [{ id: "m" }], qualquer: 1 });
  t("cada campo da tabela lê o ref do nome dele", e.npcs.a === 1 && e.cidadeAtual === "Vau" && e.dia === 7);
  t("ref que o App não deu vale indefinido (a peça põe o de partida)", Object.keys(REFS_DA_PAUTA).every((c) => c in e) && e.mapa === undefined && e.personagem === undefined);
  t("do render passam só os cinco do React", JSON.stringify(Object.keys(e.render).sort()) === JSON.stringify([...RENDER_DA_PAUTA].sort()));
  t("e a banca do último render fica de fora", !("cidadeMercado" in e.render) && !("mercadoAqui" in e.render));
  t("sem refs nem render, um estado vazio e não um estouro", (() => { const v = oEstadoDaPauta(null, null); return Object.keys(v.render).length === 0 && v.dia === undefined; })());
  t("o estado é novo: os refs não mudam", refs.npcsRef.current.a === 1 && Object.keys(refs).length === 3);
}

sec("2 · os 275 casos, com o estado montado como o App o monta, contra o dourado");
const agora = CASOS.map((k) => correrAPeca(comoOAppDeAgora, k, D, padroes));
const antes = CASOS.map((k) => correrAPeca(comoOAppDeAntes, k, D, padroes));
const batem = agora.filter((r, j) => mesmaFoto(foto(r, CASOS[j]), D.fotos[j])).length;
const primeira = agora.findIndex((r, j) => !mesmaFoto(foto(r, CASOS[j]), D.fotos[j]));
/* MOVIDA (29/10, trilha B): a prova passa a correr também os 12 casos de
   cobertura da pauta (pauta-bloco.mjs, COBERTURA: ENTRETANTO e O QUE VOLTA),
   depois dos 275 — o dourado foi regenerado contra o mesmo commit e as 275
   fotos antigas ficaram iguais; só entraram casos */
t(`${batem}/${N_DA_PAUTA} iguais ao dourado, com a banca velha no render (o App de agora)`, batem === N_DA_PAUTA, primeira >= 0 ? "o caso " + primeira + " diverge" : "");

sec("3 · o defeito: com a banca do último render, a praça é a de antes");
/* o que vai ao Narrador é o texto da pauta (com teto): é ele que se compara */
const linhas = (r) => (r.p ? textoDaPauta(r.p, { turno: 1 }).split("\n") : []);
const mudouOObjeto = antes.map((r, j) => (JSON.stringify(r.p) !== JSON.stringify(agora[j].p) ? j : -1)).filter((j) => j >= 0);
const mudam = mudouOObjeto.filter((j) => linhas(antes[j]).join("\n") !== linhas(agora[j]).join("\n"));
t(`o render velho muda a pauta em ${mudouOObjeto.length} dos ${N_DA_PAUTA} casos, e o texto ao Narrador em ${mudam.length}`, mudam.length > 0 && mudam.length <= mudouOObjeto.length);
t("e nenhum dos que mudam é igual ao dourado", mudouOObjeto.every((j) => !mesmaFoto(foto(antes[j], CASOS[j]), D.fotos[j])));
/* a linha da praça (o que se perguntou ao balcão, o preço, a banca que não vende) que só a pauta do instante tem */
const DA_PRACA = /^PERGUNTOU|banca|balc[aã]o|à venda|◉/;
const comPraca = mudam.filter((j) => { const v = linhas(antes[j]); return linhas(agora[j]).some((l) => !v.includes(l) && DA_PRACA.test(l)); });
t(`a diferença é a praça: nos ${comPraca.length} a pauta do instante diz da banca o que a velha não diz`, comPraca.length > 0 && comPraca.length === mudam.length, mudam.filter((j) => !comPraca.includes(j)).slice(0, 5).join(","));
/* o caso 182 («Entro em Nova clara com Saoirse e procuro a ferraria. Quero comprar uma espada longa de aço»): com a banca velha a pauta calava a praça, e o Narrador ficava livre para inventar o ferreiro */
t("o da ferraria: a pauta do instante diz que nenhuma banca daqui vende armas, e a velha não diz nada", linhas(agora[182]).some((l) => /^PERGUNTOU .*nenhuma banca daqui vende armas/.test(l)) && !linhas(antes[182]).some((l) => /^PERGUNTOU/.test(l)));

console.log(`\n${ok} ok, ${mal} falhas`);
if (mal) process.exit(1);
