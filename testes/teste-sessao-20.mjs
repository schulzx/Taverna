/* teste-sessao-20.mjs (13/11/2026) — a 20.ª sessão de prova: o dado que deixou de nascer da frase, e a escuta que trocava a pergunta

   O relatório é mente/sessao-20.md (§2, §4.6 e os graves da §5). A 19.ª
   rolou um d20 a cada 2,0 turnos fora da luta, 41% nascidos da frase; a
   20.ª, um a cada 5,8, e só 6% da frase. As frases que pediam dado e não o
   tiveram estão lá, ditas como o jogador as escreveu, e são elas que esta
   suíte joga — pelo caminho de sempre (lerAcao, lugarPedido, fichaParaPauta),
   sem ler uma linha do código.

   O que cada secção prova, e o que estava errado:
   1. o catálogo ouve as formas que faltavam — «o que é que eu sei de…»
      (T38, Saberes), «Conheço este selo?» (T9, heráldica), «tateio … em
      volta» (T3, a busca às cegas);
   2. «nesta sala» é o sítio onde o herói já está, e não um destino (T13):
      o cartão «Ir até a sala de leitura» tomava o lugar do dado;
   3. a negação colada ao gesto não chama dado («Não, não arrombo…», «digo
      à Fenna: não arrombo…»), e o gesto afirmado continua a rolar;
   4. a escuta da cidade lê a palavra no papel que ela tem: «o templo» dito
      não é pedir cura, e «o Arquivo guarda» é o verbo, não a milícia.
   E a medida: a amostra das frases da sessão, antes e depois. */
import { lerAcao, NEGACAO_DO_GESTO } from "../src/desafios.js";
import { lugarPedido, SITIO_DE_AGORA } from "../src/lugar.js";
import { fichaParaPauta, PERGUNTAS_DA_CIDADE } from "../src/cidade-por-dentro.js";
import { mapaDaCriacao, mapaDaCampanhaNova } from "../src/regiao.js";
import { moldePorId } from "../src/moldes.js";
import { locaisDaCidade } from "../src/mundo-base.js";
import { comodosDoLocal } from "../src/comodos.js";
import { arredoresDaCidade } from "../src/arredores.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

/* o contexto do catálogo como o App o monta, sem nada a pesar: ninguém
   conhecido na frase, nada achado, nada tentado */
const CTX = {
  personagem: { nome: "Bromar", nivel: 1 }, semente: "Prova da Mesa XX|Fantasia medieval",
  lugar: "O Arquivo Dourado", tentativas: {}, dia: 1,
  achadoDe: () => null, ehPessoaConhecida: () => false, segredos: () => [],
  objetoEmCena: () => false, pessoaDe: () => null,
};
const ler = (f, ctx = {}) => lerAcao(f, { ...CTX, ...ctx });
const resumo = (v) => (v ? `${v.tipo} ${v.id || ""} ${v.pericia || ""}`.trim() : "null");

/* o mundo da sessão, refeito pela semente: Monte do Martelo, o Arquivo
   Dourado e os cômodos dele */
const GEN = "Fantasia medieval", SEM = `Prova da Mesa XX|${GEN}`, MOLDE = moldePorId("sobremundo");
const MAPA = mapaDaCampanhaNova(mapaDaCriacao({ semente: SEM, molde: MOLDE, genero: GEN, modo: "historia" }));
const CIDADE = MAPA.cidades[0];
const DENTRO = locaisDaCidade(SEM, CIDADE, GEN, MOLDE).map((l) => ({ ...l, onde: "dentro" }));
const ARQUIVO = DENTRO.find((l) => /Arquivo/.test(l.nome));
const COMODOS = ARQUIVO ? comodosDoLocal(SEM, ARQUIVO, GEN, MOLDE).map((q) => ({ ...q, onde: "comodo", dentroDe: ARQUIVO.nome })) : [];
const FORA = arredoresDaCidade(SEM, CIDADE).map((a) => ({ ...a, onde: "arredores" }));
const NO_ARQUIVO = [...COMODOS, ...DENTRO, ...FORA];

/* ============================================================ */
sec("0. o mundo refeito é o da sessão");
t("a cidade é Monte do Martelo, e tem o Arquivo Dourado com cômodos", CIDADE.nome === "Monte do Martelo" && !!ARQUIVO && COMODOS.length > 0, `${CIDADE.nome} · ${(ARQUIVO || {}).nome} · ${COMODOS.map((c) => c.nome).join(", ")}`);
t("…e um dos cômodos é uma sala (é por ela que o «nesta sala» se perdia)", COMODOS.some((c) => /\bsala\b/.test(c.nome)));

/* ============================================================ */
sec("1. o catálogo ouve as formas que faltavam");
{
  const t38 = ler("O que é que eu sei desta Muralha Quebrada de Prata Podre?");
  t("T38 «O que é que eu sei desta…?» é Saberes (lembrar)", t38 && t38.tipo === "teste" && t38.id === "lembrar" && t38.pericia === "saberes", resumo(t38));
  t("…e o assunto viaja para o facto do sucesso", t38 && /muralha quebrada de prata podre/.test(t38.sobre), t38 && t38.sobre);
  const semEQue = ler("O que eu sei desta Muralha Quebrada de Prata Podre?");
  t("…a forma sem o «é que» continua igual (a mesma chave)", semEQue && t38 && semEQue.chave === t38.chave);
  const t9 = ler("Examino o sinete contra a luz. Conheço este selo?");
  t("T9 «Conheço este selo?» é reconhecer de onde vem (heráldica, Saberes)", t9 && t9.tipo === "teste" && t9.id === "heraldica" && t9.pericia === "saberes", resumo(t9));
  t("…e «conheço a cidade» não é heráldica (só o sinal, o selo, o brasão)", resumo(ler("Conheço esta cidade.")).indexOf("heraldica") < 0);
  const t3 = ler("tateio o cascalho e a lama em volta. Pego o que achar");
  t("T3 «tateio o cascalho e a lama em volta» é vasculhar (Percepção)", t3 && t3.tipo === "teste" && t3.id === "buscar" && t3.pericia === "percepcao", resumo(t3));
  t("…e revistar o corpo continua a ser espólio, sem dado (a trava de sempre)", resumo(ler("Tateio os bolsos do corpo em volta.")).indexOf("buscar") < 0);
}

/* ============================================================ */
sec("2. o sítio de agora não é destino (T13)");
{
  const t13 = "procuro com cuidado, laje por laje e prateleira por prateleira, qualquer papel ou objeto escondido nesta sala";
  t("T13 dentro do Arquivo não pede passo nenhum (antes: «Ir até a sala de leitura»)", lugarPedido(t13, NO_ARQUIVO) === null, JSON.stringify(lugarPedido(t13, NO_ARQUIVO)));
  t("…e a frase continua a ser a busca do catálogo (o dado nasce dela)", resumo(ler(t13)) === "teste buscar percepcao", resumo(ler(t13)));
  const sala = COMODOS.find((c) => /\bsala\b/.test(c.nome));
  t("ir à sala, dito com o nome, continua a ir", !!sala && (lugarPedido(`Vou até ${sala.nome}.`, NO_ARQUIVO) || {}).nome === sala.nome, sala && sala.nome);
  const forja = lugarPedido("Vou até a forja desta cidade.", [...DENTRO, ...FORA]);
  t("«a forja desta cidade» vai à forja: sai só o «desta cidade»", !!forja && forja.onde === "dentro", JSON.stringify(forja && forja.nome));
  t("o demonstrativo é tabela (SITIO_DE_AGORA), e lê «nesta sala de leitura» inteiro", SITIO_DE_AGORA.rx instanceof RegExp && ("procuro nesta sala de leitura".match(new RegExp(SITIO_DE_AGORA.rx.source, "g")) || [""])[0].trim() === "nesta sala de leitura");
  t("lixo não estoura", lugarPedido(null, NO_ARQUIVO) === null && lugarPedido("procuro nesta sala", null) === null);
}

/* ============================================================ */
sec("3. a negação colada ao gesto não chama dado (defeito B)");
{
  const negadas = [
    "Não arrombo porta de viúva.",
    "Não, não arrombo porta de viúva.",
    "— Não arrombo porta de viúva — digo à Fenna.",
    "Digo à Fenna: não arrombo porta de viúva.",
    "Não vou arrombar a porta de uma viúva.",
  ];
  for (const f of negadas) {
    const v = ler(f);
    t(`«${f}» não é teste`, !v || v.tipo !== "teste", resumo(v));
  }
  const afirmadas = ["Arrombo a porta com o ombro.", "Não hesito: arrombo a porta.", "Encosto o ombro e arrombo a porta."];
  for (const f of afirmadas) {
    const v = ler(f);
    t(`«${f}» continua a ser Arrombamento`, v && v.tipo === "teste" && v.pericia === "arrombamento", resumo(v));
  }
  t("a negação é tabela (NEGACAO_DO_GESTO), e só morde o que vem colado", NEGACAO_DO_GESTO.antes.test("digo a fenna: nao ") && NEGACAO_DO_GESTO.antes.test("nao o ") && !NEGACAO_DO_GESTO.antes.test("nao tenho a chave, entao "));
  t("os gestos da sessão que eram afirmados continuam a rolar (T2, T24, T30)",
    resumo(ler("Passo rente ao Wystan e tento aliviar a bolsa dele.")) === "teste bater_carteira prestidigitacao"
    && resumo(ler("Encosto a ponta da lança no peito do capanga caído e ameaço: fala, ou não te levantas mais.")) === "teste intimidar intimidacao"
    && resumo(ler("Apalpo a fechadura da porta atrás de alguma armadilha, agulha ou arame, e desarmo o que achar.")) === "teste buscar percepcao");
}

/* ============================================================ */
sec("4. a escuta da cidade lê a palavra no papel que ela tem (defeito B)");
{
  const pergunta = (frase) => fichaParaPauta(CIDADE, { semente: SEM, mapa: MAPA, genero: GEN, molde: MOLDE, dia: 1, minuto: 600, frase }).pergunta;
  const cura = (l) => l.some((x) => /^quem cura/.test(x));
  const lei = (l) => l.some((x) => /^quem guarda a lei/.test(x));
  t("T11 «Quem do templo esteve neste arquivo?» não é pedir cura", !cura(pergunta("Quem do templo esteve neste arquivo?")));
  t("T26 «Procuro o templo desta aldeia» não é pedir cura", !cura(pergunta("Procuro o templo desta aldeia")));
  t("T18 «O que é que o Arquivo Dourado guarda?» não é a lei (é o verbo)", !lei(pergunta("O que é que o Arquivo Dourado guarda?")));
  t("…nem «O que a Fenna guarda na bolsa?» (o nome que sai em branco não cola o artigo ao verbo)", !lei(pergunta("O que a Fenna guarda na bolsa?")));
  t("«Tem curandeiro nesta cidade?» continua a ser quem cura", cura(pergunta("Tem curandeiro nesta cidade?")));
  t("«Preciso de tratar esta ferida» é quem cura", cura(pergunta("Preciso de tratar esta ferida.")));
  t("«o guarda aceita suborno?» e «Há guardas na porta?» continuam a ser a lei", lei(pergunta("o guarda aceita suborno?")) && lei(pergunta("Há guardas na porta do arquivo?")));
  t("a tabela continua uma tabela (id e regex em todas)", PERGUNTAS_DA_CIDADE.every((p) => p.id && p.rx instanceof RegExp));
}

/* ============================================================ */
sec("5. a medida: as frases da sessão que pediam dado");
{
  /* as frases da §2 do relatório e as do furto e da armadilha, que já
     rolavam. «Teste» conta quando o catálogo dá um teste E nenhum passo
     lhe toma o lugar (lugarPedido, no Arquivo). Persuadir Brigid (T5, T6)
     e rezar (T14) ficam de fora: não são do catálogo, e ninguém os pôs lá. */
  const AMOSTRA = [
    "tateio o cascalho e a lama em volta. Pego o que achar",
    "Examino o sinete contra a luz. Conheço este selo?",
    "procuro com cuidado, laje por laje e prateleira por prateleira, qualquer papel ou objeto escondido nesta sala",
    "Encosto a ponta da lança no peito do capanga caído e ameaço: fala, ou não te levantas mais.",
    "O que é que eu sei desta Muralha Quebrada de Prata Podre?",
    "Passo rente ao Wystan e tento aliviar a bolsa dele.",
    "Apalpo a fechadura da porta atrás de alguma armadilha, agulha ou arame, e desarmo o que achar.",
  ];
  const rola = (f) => { const v = ler(f); return !!(v && v.tipo === "teste") && lugarPedido(f, NO_ARQUIVO) === null; };
  const n = AMOSTRA.filter(rola).length;
  console.log(`      a amostra: ${n} de ${AMOSTRA.length} frases dão dado`);
  t("todas as frases da amostra dão dado", n === AMOSTRA.length, AMOSTRA.filter((f) => !rola(f)).join(" | "));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
