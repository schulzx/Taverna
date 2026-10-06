/* teste-mm15-lugar.mjs (Fase MM · MM15, o defeito nº 1) — o lugar pelo Cronista

   A segunda sessão de prova (MM11 (2), `mente/mm11-sessao-2.md`, defeito 2)
   viu o lugar da heroína separar-se outra vez, agora por uma porta que a
   v9.335 não fechou:

     T5, T6, T9, T10  dentro de um prédio (O Tesouro sem Fio, O Último Gomo),
          o Cronista devolve "lugar": "cidade" — é o que as instruções dele
          mandam dizer com a heroína dentro da cidade —, e o App lia-o como o
          Narrador a tirá-la de lá: quatro "[LUGAR — RECUSADO] Você me tirou
          de onde eu estava…" falsos em dez respostas.
     T10  "Pego na chave mas não saio do balcão" contou como pedir para sair
          (a negação no meio da oração não era negação), e o quinto "cidade"
          passou: "De volta a Runa do Poço — O Último Gomo fica para trás".
     T11  "saio do Último Gomo e vou direita ao Fundo do Poço" registou
          "AGORA estou no Último Gomo": os dois nomes inteiros empatavam, e
          ganhava o primeiro da lista da cidade — a origem.

   A regra nova vive em `lugar.js`: `lerLugarDito` (o que fazer com o lugar
   que o Cronista ou o Mestre dizem), `QUEM_DIZ_O_LUGAR` (a tabela por quem
   diz), `ORIGEM_DO_PASSO` (de onde se sai não é para onde se vai) e a trava
   `negaSaida` em `NAO_E_IDA`.

   Medido com o `lugar.js` e o `registrarLugar` de HEAD (v9.340, `865c9ff`)
   contra este, na varredura da secção 3 (24 mundos): o "cidade" (ou o nome
   da cidade) do Cronista num prédio ou cômodo, sem pedido de sair — recusas
   falsas 3720/4092 e saídas falsas 372/4092 (a frase do T10), ou seja
   todas erradas → 0 e 0; fora dos muros a recusa fica (144/144 → 144/144);
   "saio de X e vou a Y" e irmãs que não levavam a Y 1440/2304 → 0.
   As secções: 1. as tabelas · 2. os casos da sessão ·
   3. a varredura · 4. o que continua a mover · 5. lixo, null e a
   imutabilidade. Tudo por semente. Os imports são por espaço de nomes: em
   HEAD os nomes novos não existem, e a suíte tem de falhar asserção a
   asserção, não num import. */
import * as L from "../src/lugar.js";
import { gerarGeografia } from "../src/geografia.js";
import { MOLDES } from "../src/moldes.js";
import { generosDisponiveis } from "../src/nomes.js";
import { locaisDaCidade } from "../src/mundo-base.js";
import { arredoresDaCidade } from "../src/arredores.js";
import { comodosDoLocal } from "../src/comodos.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
const ler = (dito, ctx) => tenta(() => L.lerLugarDito(dito, ctx), { acao: "(sem lerLugarDito)" }) || { acao: "(nada)" };
const acao = (dito, ctx) => ler(dito, ctx).acao;
const nomeDe = (r) => (r && r.nome) || "nada";

/* ============================================================
   Os dados da sessão (a transcrição, com o "…" dela)
   ============================================================ */
const RUNA = "Runa do Poço";
const TESOURO = { nome: "O Tesouro sem Fio", tipo: "forja", onde: "dentro" };
const TENDAL = { nome: "O Tendal de Couro", tipo: "mercado", onde: "dentro" };
const GOMO = { nome: "O Último Gomo", tipo: "taverna", onde: "dentro" };
const FUNDO = { nome: "O Fundo do Poço", tipo: "casa de banhos", onde: "dentro" };
const MINA = { nome: "a boca da mina", tipo: "mina", onde: "arredores", minutos: 40 };
/* a ordem da lista é a do App (os locais da cidade, depois o cinturão): o
   Último Gomo vem antes do Fundo do Poço, e era por isso que ganhava */
const NA_CIDADE = [TESOURO, TENDAL, GOMO, FUNDO, MINA];
const J3 = "Agradeço com a cabeça e subo a ladeira pela rua da forja até ao Tesouro sem Fio. Entro … e procuro um aprendiz chamado Otávio.";
const J4 = "Tiro o capuz e sento-me num caixote, sem pressa. \"Por ti. Um velho companheiro de armas mandou-me atrás de ti antes de morrer, e eu devia-lhe a vida.\" … \"Há quanto tempo trabalhas aqui, Otávio? E de onde vens?\"";
const J5 = "\"Um sargento da fronteira. Só me deu o teu nome e pediu que te encontrasse.\" … \"E quem mais trabalha nesta forja, além de ti? O mestre ferreiro não está?\"";
const J6 = "\"Vou pensar no teu cartaz.\" Aponto com o queixo para o que está pendurado na parede. \"Quanto custa um escudo aqui, se tiverem algum à venda?\"";
const J7 = "Despeço-me do Otávio com um aceno e desço ao Tendal de Couro. Na primeira banca pergunto: \"Que armas se vendem por aqui, e a quanto?\"";
const J8 = "Pendo o montante às costas e atravesso a praça até à taverna, O Último Gomo. Encosto-me ao balcão e pergunto a quem serve: \"Quanto é um quarto para esta noite?\"";
const J9 = "Pouso seis moedas no balcão pelo quarto comum e baixo a voz: \"Quem é aquele que passou agora com o balde? E essas reservas — de que é que a cidade está a ficar sem?\"";
const J10 = "Pego na chave mas não saio do balcão. \"Lina, ouve. Sou soldada, sei calar o que ouço — e se essa caravana não chegar, vais querer alguém de escudo à porta. Diz-me o que se passa no Fundo do Poço. Toda a gente baixa os olhos quando o nome sai.\"";
const J11 = "Deixo a chave no bolso, saio do Último Gomo e vou direita ao Fundo do Poço, a casa de banhos. À porta, antes de entrar, paro e olho: quem está de guarda, quantas saídas há, e se alguém me segue desde a taverna.";
/* como o App regista um passo dentro dos muros (`moverParaLocal`) */
const la = (l) => L.definirLugar(l.nome, { cidade: RUNA, distancia: l.onde === "arredores" ? "arredores" : "dentro" });

/* ============================================================ */
sec("1. as tabelas");
{
  const q = L.QUEM_DIZ_O_LUGAR || {};
  t("a palavra combinada \"cidade\" está na tabela", q.voltou instanceof RegExp && q.voltou.test("cidade") && q.voltou.test("dentro da cidade") && !q.voltou.test("a cidadela"));
  t("o Cronista, dentro dos muros, não move nem acusa", (q.cronista || {}).dentroDosMuros === "ignora");
  t("o Cronista, fora dos muros, continua a ser recusado sem pedido (v9.39)", (q.cronista || {}).foraDosMuros === "recusa");
  t("o Mestre continua recusado sem pedido, dentro e fora (v9.48)", (q.mestre || {}).dentroDosMuros === "recusa" && (q.mestre || {}).foraDosMuros === "recusa");
  const o = L.ORIGEM_DO_PASSO || {};
  t("a origem tem marcas, onde acabar e um teto de palavras", Array.isArray(o.marcas) && o.marcas.length >= 3 && o.marcas.every((m) => m instanceof RegExp) && o.fim instanceof Set && o.fim.has("e") && o.palavras >= 3 && o.palavras <= 8);
  t("e o rumo sabe onde está o \"para\" (o que vem depois decide-se na frase, secção 4)", o.rumo instanceof RegExp && new RegExp(o.rumo.source).test("saio do quarto para o salao") && !new RegExp(o.rumo.source).test("saio do quarto e desco"));
  const n = (L.NAO_E_IDA || []).find((x) => x.id === "negaSaida");
  t("\"não saio\" é uma trava da ida", !!n && n.rx.test("pego na chave mas nao saio do balcao") && !n.rx.test("saio do balcao"));
}

/* ============================================================ */
sec("2. os casos da sessão");
{
  /* os passos que a sessão deu, e que continuam a dar-se */
  t("T3 · subir até ao Tesouro sem Fio leva ao Tesouro sem Fio", nomeDe(L.lugarPedido(J3, NA_CIDADE)) === TESOURO.nome);
  t("T7 · despedir-se do Otávio e descer ao Tendal leva ao Tendal", nomeDe(L.lugarPedido(J7, NA_CIDADE)) === TENDAL.nome);
  t("T8 · atravessar a praça até ao Último Gomo leva ao Último Gomo", nomeDe(L.lugarPedido(J8, NA_CIDADE)) === GOMO.nome);

  /* os cinco "cidade" do Cronista (#10, #13, #25, #29, #33) */
  const casos = [["T5", la(TESOURO), J4], ["T6", la(TESOURO), J5], ["T9", la(GOMO), J8], ["T10", la(GOMO), J9], ["T10→11", la(GOMO), J10]];
  for (const [turno, lugar, pedido] of casos) {
    const r = ler("cidade", { lugar, cidade: RUNA, pedido, fonte: "cronista" });
    t(`${turno} · o "cidade" do Cronista ${L.comEm(lugar.nome)} não recusa nem tira de lá`, r.acao === "ignora", JSON.stringify(r));
  }
  t("T10 · \"não saio do balcão\" não é pedir para sair", L.pediuParaVoltar(J10, RUNA) === false);
  t("T10 · e o Fundo do Poço, dito numa pergunta entre aspas, não é ida", L.lugarPedido(J10, NA_CIDADE) === null);

  /* o T11 */
  const r11 = L.lugarPedido(J11, NA_CIDADE);
  t("T11 · \"saio do Último Gomo e vou ao Fundo do Poço\" vai ao Fundo do Poço", nomeDe(r11) === FUNDO.nome, JSON.stringify(r11));
  t("T11 · em qualquer ordem da lista", nomeDe(L.lugarPedido(J11, [...NA_CIDADE].reverse())) === FUNDO.nome);
  const noFundo = la(FUNDO);
  t("T11 · e o \"cidade\" do Cronista, já no Fundo do Poço, não a devolve às ruas", acao("cidade", { lugar: noFundo, cidade: RUNA, pedido: J11, fonte: "cronista" }) === "ignora");
  t("T11 · nem o Mestre com `lugar_atual: null` a tira do sítio a que ela acabou de ir (é recusado)", acao(null, { lugar: noFundo, cidade: RUNA, pedido: J11, fonte: "mestre" }) === "recusa");
  t("T11 · e o nome do Último Gomo, dito por quem ficou para trás, não a leva de volta", acao("O Último Gomo", { lugar: noFundo, cidade: RUNA, pedido: J11, fonte: "cronista" }) === "ignora");

  /* a sessão inteira, como o App a corria: o passo pela frase no começo do
     turno, o lugar do Cronista no fim */
  let lugar = null, recusas = 0, saidasFalsas = 0;
  const cronista = [null, null, "O Tesouro sem Fio", "cidade", "cidade", null, "O Tendal de Couro", "cidade", "cidade", "cidade", "cidade"];
  const pedidos = [null, "Cumprimento a guarda.", J3, J4, J5, J6, J7, J8, J9, J10, J11];
  for (let i = 1; i < pedidos.length; i++) {
    const p = L.lugarPedido(pedidos[i], NA_CIDADE);
    if (p && !(lugar && L.ehOMesmoLugar(lugar, { nome: p.nome }))) lugar = la(p);
    const dito = cronista[i];
    if (dito == null) continue;
    const r = ler(dito, { lugar, cidade: RUNA, pedido: pedidos[i], fonte: "cronista" });
    if (r.acao === "recusa") recusas++;
    if (r.acao === "volta") { saidasFalsas++; lugar = null; }
    if (r.acao === "novo") { const n = L.definirLugar(dito, { cidade: RUNA, distancia: "dentro" }); if (!L.ehOMesmoLugar(n, lugar)) lugar = n; }
  }
  console.log(`       a sessão (J2–J11): recusas ${recusas} · saídas falsas ${saidasFalsas} · onde acaba: ${lugar ? lugar.nome : "nas ruas"}`);
  t("a sessão inteira: 0 recusas falsas (eram 4)", recusas === 0);
  t("a sessão inteira: 0 saídas falsas (era 1, no T10)", saidasFalsas === 0);
  t("e a heroína acaba onde foi: no Fundo do Poço", !!lugar && lugar.nome === FUNDO.nome, lugar ? lugar.nome : "nas ruas");
}

/* ============================================================
   3. A VARREDURA — 24 mundos (6 géneros × 4 moldes), a primeira cidade
   ============================================================ */
sec("3. a varredura: o \"cidade\" do Cronista e a origem do passo");
const GENEROS = generosDisponiveis();
const MUNDOS = [];
for (const g of GENEROS) for (const Mo of MOLDES) {
  const semente = `Sonda MM13|${g}|${Mo.id}`;
  const mapa = gerarGeografia(semente, Mo);
  MUNDOS.push({ semente, genero: g, molde: Mo, mapa, cidade: mapa.cidades[0] });
}
/* o que se diz dentro de um prédio sem pedir para sair — da sessão e de mesa */
const FICAR = [J4, J5, J6, J9, J10,
  "Peço um caldo e fico a ver quem entra.", "Sento-me ao balcão e escuto.", "Pergunto quanto custa um quarto.",
  "Não saio daqui até ela voltar.", "Pago a bebida e espero.", "Olho à volta: quem está armado?"];
{
  const c = { ficar: 0, recusas: 0, saidas: 0, pares: 0, paresPerdidos: 0, voltaDoDestino: 0, voltaDaOrigem: 0 };
  const ex = {};
  const nota = (k, s) => { (ex[k] = ex[k] || []).length < 3 && ex[k].push(s); };
  MUNDOS.forEach((w) => {
    const cid = w.cidade;
    const locais = locaisDaCidade(w.semente, cid, w.genero, w.molde);
    const dentro = locais.map((l) => ({ ...l, onde: "dentro" }));
    const fora = arredoresDaCidade(w.semente, cid).map((a) => ({ ...a, onde: "arredores" }));
    const lugares = [...dentro, ...fora];
    const predios = dentro.slice(0, 4);
    const comodos = predios.flatMap((l) => (tenta(() => comodosDoLocal(w.semente, l, w.genero, w.molde), []) || []).map((q) => ({ ...q, dentroDe: l.nome })));
    const aqui = [...predios.map((l) => L.definirLugar(l.nome, { cidade: cid.nome, distancia: "dentro" })),
      ...comodos.map((q) => L.definirLugar(q.nome, { cidade: cid.nome, distancia: "dentro", dentroDe: q.dentroDe }))];
    /* o "cidade" do Cronista num prédio ou cômodo, sem pedido de sair */
    for (const lugar of aqui) for (const pedido of FICAR) for (const dito of ["cidade", cid.nome]) {
      c.ficar++;
      const a = acao(dito, { lugar, cidade: cid.nome, pedido, fonte: "cronista" });
      if (a === "recusa") { c.recusas++; nota("recusa", `${lugar.nome} › ${pedido.slice(0, 40)}`); }
      if (a === "volta") { c.saidas++; nota("saida", `${lugar.nome} › ${pedido.slice(0, 40)}`); }
    }
    /* "saio de X e vou a Y" e irmãs, entre os prédios da cidade */
    const seis = dentro.slice(0, 6);
    for (const x of seis) for (const y of seis) {
      if (x === y) continue;
      for (const f of [`Saio ${L.comDe(x.nome)} e vou até ${y.nome}.`, `Deixo ${x.nome} e vou até ${y.nome}.`,
        `Saio ${L.comDe(x.nome)} para ${y.nome}.`, `${L.comDe(x.nome).replace(/^./, (m) => m.toUpperCase())}, sigo até ${y.nome}.`]) {
        c.pares++;
        const r = L.lugarPedido(f, lugares);
        if (!r || r.nome !== y.nome) { c.paresPerdidos++; nota("par", `${f} → ${nomeDe(r)}`); continue; }
        const noY = L.definirLugar(y.nome, { cidade: cid.nome, distancia: "dentro" });
        if (acao("cidade", { lugar: noY, cidade: cid.nome, pedido: f, fonte: "cronista" }) !== "ignora") { c.voltaDoDestino++; nota("destino", f); }
        if (acao(x.nome, { lugar: noY, cidade: cid.nome, pedido: f, fonte: "cronista" }) !== "ignora") { c.voltaDaOrigem++; nota("origem", f); }
      }
    }
  });
  console.log(`       "cidade" do Cronista num prédio/cômodo, sem pedido: ${c.ficar} · recusas ${c.recusas} · saídas ${c.saidas}`);
  console.log(`       "saio de X e vou a Y": ${c.pares} · que não levam a Y ${c.paresPerdidos} · devolvidas às ruas ${c.voltaDoDestino} · levadas de volta a X ${c.voltaDaOrigem}`);
  const x = (k) => (ex[k] || []).join(" | ");
  t(`0 recusas falsas pelo "cidade" do Cronista (${c.recusas}/${c.ficar})`, c.ficar > 0 && c.recusas === 0, x("recusa"));
  t(`0 saídas falsas pelo "cidade" do Cronista (${c.saidas}/${c.ficar})`, c.saidas === 0, x("saida"));
  t(`todo "saio de X e vou a Y" leva a Y (${c.pares - c.paresPerdidos}/${c.pares})`, c.pares > 0 && c.paresPerdidos === 0, x("par"));
  t(`e, lá chegada, o "cidade" não a devolve às ruas (${c.voltaDoDestino})`, c.voltaDoDestino === 0, x("destino"));
  t(`nem o nome de X a leva de volta (${c.voltaDaOrigem})`, c.voltaDaOrigem === 0, x("origem"));
}

/* ============================================================ */
sec("4. o que continua a mover (e a recusar)");
{
  const noGomo = la(GOMO);
  const saidas = ["Pago e saio do Último Gomo.", "Saio da taverna e volto para a rua.", "Deixo o Último Gomo e volto à praça.", "Vou embora daqui.", "Volto para a rua."];
  for (const p of saidas) t(`sair de verdade sai: "${p}"`, acao("cidade", { lugar: noGomo, cidade: RUNA, pedido: p, fonte: "cronista" }) === "volta");
  t("e o Mestre, com pedido, também a devolve às ruas", acao(null, { lugar: noGomo, cidade: RUNA, pedido: "Saio do Último Gomo.", fonte: "mestre" }) === "volta");
  t("o Mestre que a tira do prédio sem pedido continua recusado (v9.48)", acao(null, { lugar: noGomo, cidade: RUNA, pedido: J9, fonte: "mestre" }) === "recusa");
  t("e o \"cidade\" do Mestre também", acao("cidade", { lugar: noGomo, cidade: RUNA, pedido: J9, fonte: "mestre" }) === "recusa");
  t("quem não diz a fonte é tratado como o Mestre (a régua mais dura)", acao("cidade", { lugar: noGomo, cidade: RUNA, pedido: J9 }) === "recusa");

  const naFazenda = L.definirLugar("a fazenda de Jessa", { cidade: RUNA, distancia: "arredores" });
  t("fora dos muros, o \"cidade\" do Cronista sem pedido continua recusado (v9.39)", acao("cidade", { lugar: naFazenda, cidade: RUNA, pedido: "Espero de tocaia atrás do celeiro.", fonte: "cronista" }) === "recusa");
  t("e com pedido volta", acao("cidade", { lugar: naFazenda, cidade: RUNA, pedido: "Volto para a cidade antes que anoiteça.", fonte: "cronista" }) === "volta");
  t("\"saio da fazenda e vou ao moinho\": já no moinho, o \"cidade\" não a devolve (é recusado, como fora dos muros)", acao("cidade", { lugar: L.definirLugar("o moinho", { cidade: RUNA, distancia: "arredores" }), cidade: RUNA, pedido: "Saio da fazenda e vou ao moinho.", fonte: "cronista" }) === "recusa");

  t("sem lugar registado, \"cidade\" é nada (já está onde é dito)", acao("cidade", { lugar: null, cidade: RUNA, pedido: J9, fonte: "cronista" }) === "nada");
  t("o nome da própria cidade é \"cidade\"", acao(RUNA, { lugar: noGomo, cidade: RUNA, pedido: J9, fonte: "cronista" }) === "ignora");
  t("um nome novo segue a régua de sempre (o Cronista viu-a chegar)", acao("O Tendal de Couro", { lugar: noGomo, cidade: RUNA, pedido: "Desço ao Tendal de Couro.", fonte: "cronista" }) === "novo");
  t("e o nome do sítio onde ela já está também (quem chama vê que é o mesmo)", acao("O Último Gomo", { lugar: noGomo, cidade: RUNA, pedido: J9, fonte: "cronista" }) === "novo");

  /* a origem não come o passo de sempre */
  t("\"Vou ao Último Gomo\" continua a ir ao Último Gomo", nomeDe(L.lugarPedido("Vou ao Último Gomo.", NA_CIDADE)) === GOMO.nome);
  t("\"De volta ao Último Gomo\" é ida, não origem", nomeDe(L.lugarPedido("Volto para o Último Gomo, de volta ao balcão.", NA_CIDADE)) === GOMO.nome);
  t("\"vindo da taverna, entro no Tendal\" vai ao Tendal", nomeDe(L.lugarPedido("Vindo da taverna, entro no Tendal de Couro.", NA_CIDADE)) === TENDAL.nome);
  t("\"saio da taverna e vou à forja\" vai à forja (o tipo também perde a origem)", nomeDe(L.lugarPedido("Saio da taverna e vou à forja.", NA_CIDADE)) === TESOURO.nome);
  t("\"saio do quarto para falar com o ferreiro\" não é ida a lado nenhum", L.lugarPedido("Saio do quarto para falar com o ferreiro.", NA_CIDADE) === null);
  t("\"saio do Último Gomo\" sozinho não é ida (é volta, e isso é de pediuParaVoltar)", L.lugarPedido("Saio do Último Gomo.", NA_CIDADE) === null && L.pediuParaVoltar("Saio do Último Gomo.", RUNA) === true);
  t("\"Saio pelo portão e vou até a boca da mina\" continua a sair para lá (MM14)", nomeDe(L.lugarPedido("Saio pelo portão e vou até a boca da mina.", NA_CIDADE)) === MINA.nome);
}

/* ============================================================ */
sec("5. lixo, null e a imutabilidade");
{
  t("lerLugarDito com lixo é nada", tenta(() => L.lerLugarDito(null, null).acao === "nada" && L.lerLugarDito(undefined, undefined).acao === "nada", false));
  t("um lugar sem nome é lugar nenhum", tenta(() => L.lerLugarDito("cidade", { lugar: {}, cidade: RUNA, fonte: "cronista" }).acao === "nada", false));
  t("o que não é texto não é lugar (ignora)", tenta(() => L.lerLugarDito({ nome: "x" }, { lugar: la(GOMO) }).acao === "ignora" && L.lerLugarDito(42, null).acao === "ignora", false));
  t("pedido nulo não é pedido", acao("cidade", { lugar: la(GOMO), cidade: RUNA, pedido: null, fonte: "cronista" }) === "ignora" && acao(null, { lugar: la(GOMO), cidade: RUNA, pedido: null, fonte: "mestre" }) === "recusa");
  t("o envelope do sistema não é pedido (a volta dentro dele não conta)", acao("cidade", { lugar: la(GOMO), cidade: RUNA, pedido: "[PASSAR O TEMPO] Volto para a rua.", fonte: "cronista" }) === "ignora");
  t("fonte desconhecida é o Mestre", acao("cidade", { lugar: la(GOMO), cidade: RUNA, pedido: J9, fonte: "??" }) === "recusa");
  const lugar = la(GOMO); const antes = JSON.stringify(lugar);
  const ctx = { lugar, cidade: RUNA, pedido: J11, fonte: "cronista" }; const antesCtx = JSON.stringify(ctx);
  L.lerLugarDito("cidade", ctx); L.lerLugarDito("O Último Gomo", ctx);
  t("lerLugarDito não muta o lugar nem o contexto", JSON.stringify(lugar) === antes && JSON.stringify(ctx) === antesCtx);
  const lista = [...NA_CIDADE]; const antesL = JSON.stringify(lista);
  L.lugarPedido(J11, lista);
  t("lugarPedido não muta a lista que recebe", JSON.stringify(lista) === antesL);
  const a = L.lugarPedido(J11, NA_CIDADE), b = L.lugarPedido(J11, NA_CIDADE);
  t("a mesma frase dá sempre o mesmo lugar", JSON.stringify(a) === JSON.stringify(b));
}

/* ============================================================
   6. A FIAÇÃO NO App.jsx — por texto (fim de linha normalizado)

   O motor está provado acima; falta provar que o App de fato o CHAMA como
   as seções 1–5 supõem. Sem isto a suíte podia ficar verde com o App
   ainda a decidir sozinho — que era exatamente o bug desta fase.
   ============================================================ */
sec("6. a fiação no App.jsx");
{
  const { readFileSync } = await import("node:fs");
  const APP = tenta(() => readFileSync("../src/App.jsx", "utf8").replace(/\r\n/g, "\n"), "");
  t("o App importa lerLugarDito de lugar.js", /\blerLugarDito\b/.test(APP) && /from "\.\/lugar\.js"/.test(APP.slice(APP.indexOf("lerLugarDito") - 400, APP.indexOf("lerLugarDito") + 400)));
  t("o Cronista chama registrarLugar com a fonte \"cronista\"", /registrarLugar\(r\.lugar, "cronista"\)/.test(APP));
  /* MOVIDA NA MM16 nº 4 (05/10), com o motivo: a chamada ganha `luta` e
     `masmorra` no fim (a cena do sistema não move nem acusa —
     `LUGAR_NA_CENA_DO_SISTEMA`, provado em teste-masmorra-na-pauta). A
     intenção desta asserção não muda — o App decide o lugar pelo motor, com
     o lugar, a cidade, o pedido e a fonte —, e por isso o que vier depois
     de `fonte` é aceite aqui e exigido lá. */
  t("registrarLugar chama lerLugarDito com lugar, cidade, pedido e fonte", /lerLugarDito\(nome, \{ lugar: lugarRef\.current, cidade, pedido: ultimoPedidoRef\.current, fonte(, [^}]*)? \}\)/.test(APP));
  t("a regex antiga (\"const voltou = /^(cidade|\") já não está no App — a régua mudou-se para QUEM_DIZ_O_LUGAR", !/const voltou = \/\^\(cidade\|/.test(APP));
}

/* ============================================================ */
console.log(`\nmm15-lugar: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
