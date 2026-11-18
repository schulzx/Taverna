/* teste-a-regua-do-momento.mjs (M3 · 18/11/2026) — «a régua do momento».

   O desenho é mente/lancamento/o-mestre-vivo.md §3; as regras, de
   mente/lancamento/estudo-das-mesas.md §6. O módulo é
   src/motor/a-regua-do-momento.js: `valeRolagem(veredito, cena, ctx)` e o
   dado espontâneo `oQueACenaChama(cenaAntes, cenaDepois)`.

   Três provas:
   1. a tabela é o que diz ser (cobre o catálogo inteiro);
   2. REGRESSÃO ZERO: sem cena, a régua devolve exatamente o que o Mestre de
      hoje devolve, frase a frase, sobre os dois corpus que afinaram o
      catálogo — é o que deixa a régua entrar no jogo atrás de uma chave;
   3. cada regra do estudo, com uma frase e duas cenas (a que rola e a que
      não rola). As frases são de prova, nossas, e nenhuma é do exame. */
import fs from "node:fs";
import { lerAcao, DESAFIOS, FAMILIAS_DO_IMPROVISO } from "../src/desafios.js";
import { TAMANHOS_DO_PEDIDO } from "../src/social.js";
import { porQueNaoChama } from "../src/motor/o-mestre-chama.js";
import {
  FAMILIA_DO_DESAFIO, FAMILIA_DO_IMPROVISO, familiaDaAcao, PERGUNTA_DA_ESCADA, CEDE_COM_MEDO, REGUA_DO_MOMENTO,
  valeRolagem, PORQUE_DO_ESPONTANEO, oQueACenaChama, FAMILIAS_DA_CONVERSA, FAMILIAS_DO_SABER,
} from "../src/motor/a-regua-do-momento.js";
import { ESTADOS_DA_CENA, LUGARES_DA_CENA, estadoPorId, RESPOSTAS_DA_PERGUNTA } from "../src/cena-do-momento.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const HEROI = { nivel: 1, inventario: ["Gazua"], habilidades: [], equipado: { arma: "Espada curta" }, moedas: 50 };
const CTX = { personagem: HEROI, semente: "teste-a-regua", lugar: "Largo do Cereal", tentativas: {}, dia: 1 };
const ler = (frase) => lerAcao(frase, CTX);
const P = (papel, ...estados) => ({ nome: "", papel, estados });
const cenaDe = (o) => ({ pessoas: [], criaturas: [], coisas: [], cena: { estados: [] }, ...o });
const vale = (frase, cena, ctx) => valeRolagem(ler(frase), cena, ctx || {});

sec("1. a tabela");
{
  const ids = REGUA_DO_MOMENTO.map((r) => r.id);
  t(`${ids.length} linhas, ids únicos, todas com rola, diz e quando`, new Set(ids).size === ids.length
    && REGUA_DO_MOMENTO.every((r) => typeof r.rola === "boolean" && typeof r.diz === "string" && r.diz.length > 8 && typeof r.quando === "function"));
  t("a última linha pega tudo (nenhum veredito fica sem resposta)", REGUA_DO_MOMENTO[REGUA_DO_MOMENTO.length - 1].quando({}) === true);
  t("todo desafio do catálogo tem família", DESAFIOS.every((d) => d.id === "improviso" || FAMILIA_DO_DESAFIO[d.id]), DESAFIOS.filter((d) => d.id !== "improviso" && !FAMILIA_DO_DESAFIO[d.id]).map((d) => d.id).join(","));
  t("toda família do improviso tem família na régua", FAMILIAS_DO_IMPROVISO.every((f) => FAMILIA_DO_IMPROVISO[f.id]));
  t("o improviso diz a família pela chave", familiaDaAcao({ tipo: "teste", id: "improviso", chave: "aqui|improviso|forca|a mesa" }) === "forcar");
  t("o que não é teste não tem família", ["", null, undefined, { tipo: "livre" }].every((v) => familiaDaAcao(v) === ""));
  const tamanhos = new Set(TAMANHOS_DO_PEDIDO.map((x) => x.id));
  t("a pergunta da escada são degraus que existem (cortesia, conversa)", PERGUNTA_DA_ESCADA.every((id) => tamanhos.has(id)));
  t("quem cede com medo são famílias da régua", CEDE_COM_MEDO.every((f) => Object.values(FAMILIA_DO_DESAFIO).includes(f)));
  t("o porquê do espontâneo cobre toda perícia que um estado chama",
    ESTADOS_DA_CENA.filter((e) => e.chama).every((e) => typeof PORQUE_DO_ESPONTANEO[e.chama] === "string" && PORQUE_DO_ESPONTANEO[e.chama].length > 8));
  t("a tabela é congelada", Object.isFrozen(REGUA_DO_MOMENTO) && REGUA_DO_MOMENTO.every(Object.isFrozen) && Object.isFrozen(FAMILIA_DO_DESAFIO));
}

sec("2. regressão zero: sem cena, a régua é o Mestre de hoje");
{
  const MESA = JSON.parse(fs.readFileSync(new URL("./corpus-da-mesa.json", import.meta.url), "utf8"));
  const SIT = JSON.parse(fs.readFileSync(new URL("./corpus-das-situacoes.json", import.meta.url), "utf8"));
  const CONTEXTOS = [{}, { emCombate: true }, { bonus: 30 }, { mundoDisseNao: true }];
  for (const [nome, frases] of [["corpus-da-mesa", MESA.frases], ["corpus-das-situacoes", SIT.frases]]) {
    let n = 0, dif = [];
    for (const f of frases) {
      let v = null;
      try { v = ler(f.frase); } catch { v = null; }
      for (const cx of CONTEXTOS) {
        n++;
        const hoje = porQueNaoChama(v, cx);
        for (const semCena of [null, undefined, 42, "cena"]) {
          const r = valeRolagem(v, semCena, cx);
          if (r.rola !== (hoje === null || hoje === "conversa") || r.porque !== (hoje || "chama") || r.pesos !== null) dif.push(f.frase);
        }
      }
    }
    t(`${nome}: ${frases.length} frases × ${CONTEXTOS.length} contextos — o mesmo veredito e o mesmo porquê (${dif.length} diferenças)`, n > 0 && dif.length === 0, dif.slice(0, 3).join(" | "));
  }
}

sec("3. as regras do estudo, uma a uma (§6)");
{
  const nada = cenaDe({});
  /* a busca */
  t("busca com algo escondido rola", vale("vasculho o baú", cenaDe({ coisas: [{ nome: "baú", estados: ["ha_algo_escondido"] }] })).rola);
  t("busca com perigo rola", vale("vasculho o baú", cenaDe({ cena: { estados: ["perigo_fisico"] } })).rola);
  const bv = vale("vasculho o baú", nada);
  t("busca sem nada nem perigo não rola: o Mestre descreve", !bv.rola && bv.porque === "buscaVazia", bv.porque);
  /* escutar */
  t("escutar com gente do outro lado rola", vale("encosto o ouvido na porta", cenaDe({ pessoas: [P("contrabandistas")] })).rola);
  t("escutar com o som claro não rola", vale("encosto o ouvido na porta", cenaDe({ pessoas: [P("contrabandistas")], cena: { estados: ["som_claro"] } })).porque === "somClaro");
  t("escutar o nada não rola", vale("encosto o ouvido na porta", nada).porque === "silencio");
  /* esgueirar */
  t("esgueirar com vigia rola", vale("me esgueiro até a porta", cenaDe({ coisas: [{ nome: "corredor", estados: ["vigiado"] }] })).rola);
  t("esgueirar com um estranho presente rola", vale("me esgueiro até a porta", cenaDe({ pessoas: [P("anfitrião")] })).rola);
  t("esgueirar sem ninguém (ou só com os seus) não rola", vale("me esgueiro até a porta", nada).porque === "ninguemVe"
    && !vale("me esgueiro até a porta", cenaDe({ pessoas: [P("Tobias", "do_grupo")] })).rola);
  /* a conversa, dentro da régua */
  const conv = "tento convencer o guarda a me deixar passar";
  t("conversa com quem tem motivo para negar rola", vale(conv, cenaDe({ pessoas: [P("guarda", "motivo_para_negar")] })).porque === "motivoParaNegar");
  t("conversa com quem está disposto não rola", vale(conv, cenaDe({ pessoas: [P("guarda", "disposta")] })).porque === "dispostoCede");
  t("conversa com quem deve um favor não rola", !vale(conv, cenaDe({ pessoas: [P("guarda", "deve_favor")] })).rola);
  t("quem já está com medo cede sem dado", vale(conv, cenaDe({ pessoas: [P("guarda", "com_medo")] })).porque === "medoCede"
    && vale("intimido o ladrão", cenaDe({ pessoas: [P("ladrão", "com_medo")] })).porque === "medoCede");
  t("intimidar quem é hostil rola", vale("intimido o ladrão", cenaDe({ pessoas: [P("ladrão", "hostil")] })).rola);
  t("conversa com um estranho sem estado rola (a escada do pedido dá o número)", vale(conv, cenaDe({ pessoas: [P("guarda")] })).porque === "conversaComEstranho");
  const pg = vale("tento convencer o taverneiro a me dizer onde fica a ferraria", cenaDe({ pessoas: [P("taverneiro", "esconde_algo")] }));
  t("pedir uma cortesia é pergunta: não rola, e quem esconde responde evasivo", !pg.rola && pg.porque === "pergunta" && pg.resposta === "evasiva", JSON.stringify(pg));
  /* a pergunta que nem é teste */
  const q = valeRolagem(ler("onde fica a ferraria?"), cenaDe({ pessoas: [P("taverneiro", "esconde_algo")] }), {});
  t("pergunta não rola; com segredo, a resposta sai evasiva (sinal, não dado)", !q.rola && q.porque === "naoETeste" && q.resposta === "evasiva");
  t("a pergunta a quem é hostil volta como recusa", valeRolagem(null, cenaDe({ pessoas: [P("contrabandista", "hostil")] }), {}).resposta === "recusa");
  t("as respostas são as da tabela", RESPOSTAS_DA_PERGUNTA.some((r) => r.id === q.resposta));
  /* ler a pessoa */
  t("ler a pessoa rola quando o jogador pede", vale("ele está mentindo?", cenaDe({ pessoas: [P("nobre", "disposta")] })).porque === "lerPessoa");
  /* travessia */
  t("travessia com perigo rola", vale("escalo o muro", cenaDe({ cena: { estados: ["perigo_fisico"] } })).rola);
  t("travessia com pressa rola", vale("escalo o muro", cenaDe({ cena: { estados: ["com_pressa"] } })).rola);
  t("travessia sem perigo nem pressa não rola", vale("escalo o muro", nada).porque === "travessiaCalma");
  /* a tranca */
  t("a porta trancada rola; a que não está, abre", vale("arrombo a porta", cenaDe({ coisas: [{ nome: "porta", estados: ["trancado"] }] })).porque === "trancado"
    && vale("arrombo a porta", nada).porque === "semTranca");
  /* socorrer */
  t("o curativo de quem morre rola; o do corte à toa, não", vale("faço um curativo nele", cenaDe({ cena: { estados: ["perigo_fisico", "com_pressa"] } })).rola
    && vale("faço um curativo nele", nada).porque === "socorroCalmo");
  /* encenação */
  t("cantar para a taverna cheia rola; para os seus, não", vale("canto para a taverna", cenaDe({ cena: { estados: ["com_testemunhas"] } })).porque === "plateia"
    && vale("canto para a taverna", cenaDe({ pessoas: [P("Tobias", "do_grupo")] })).porque === "entreOsSeus");
  /* o bicho */
  t("o cavalo assustado rola; o manso, não", vale("acalmo o cavalo", cenaDe({ criaturas: [{ nome: "cavalo", estados: ["assustada"] }] })).porque === "bichoResiste"
    && vale("acalmo o cavalo", cenaDe({ criaturas: [{ nome: "cavalo", estados: ["mansa"] }] })).porque === "bichoManso");
  /* o resto rola como sempre */
  t("o saber sem saber comum rola como sempre", vale("o que sei sobre esse brasão?", nada).porque === "comoSempre");
  /* as linhas de sempre continuam valendo com cena */
  const tranc = cenaDe({ coisas: [{ nome: "porta", estados: ["trancado"] }] });
  t("com cena, a luta continua com o dado dela", vale("arrombo a porta", tranc, { emCombate: true }).porque === "luta");
  t("com cena, o que o mundo disse que não existe continua sem dado", vale("arrombo a porta", tranc, { mundoDisseNao: true }).porque === "mundoDisseNao");
  t("com cena, o bônus que torna o resultado certo continua sem dado", vale("arrombo a porta", tranc, { bonus: 40 }).porque === "automatico");
}

sec("4. os pesos (o número e o preço, nunca a decisão)");
{
  const c = cenaDe({ pessoas: [P("viúva", "esconde_algo")], cena: { estados: ["com_pressa", "com_testemunhas", "perigo_fisico"] } });
  const r = vale("escalo o muro", c, { vantagem: true });
  t("segredo, pressa, testemunha, perigo e vantagem", r.pesos.segredo && r.pesos.pressa && r.pesos.testemunha && r.pesos.perigo && r.pesos.vantagem);
  const z = vale("escalo o muro", cenaDe({}), {});
  t("a cena vazia não pesa nada", Object.values(z.pesos).every((x) => x === false));
  t("o veredito é congelado", Object.isFrozen(r) && Object.isFrozen(r.pesos));
}

sec("5. o dado espontâneo");
{
  const vazia = cenaDe({});
  const ap = oQueACenaChama(vazia, cenaDe({ cena: { estados: ["algo_se_aproxima"] } }));
  t("algo se aproxima: Percepção", ap && ap.pericia === "percepcao" && ap.estado === "algo_se_aproxima" && ap.porque === PORQUE_DO_ESPONTANEO.percepcao);
  t("entrar no lugar vigiado: Furtividade", oQueACenaChama(vazia, cenaDe({ coisas: [{ nome: "casarão", estados: ["vigiado"] }] })).pericia === "furtividade");
  t("o assunto raro aparece: Saberes", oQueACenaChama(null, cenaDe({ cena: { estados: ["assunto_raro"] } })).pericia === "saberes");
  t("o que já estava na cena não chama de novo", oQueACenaChama(cenaDe({ coisas: [{ estados: ["vigiado"] }] }), cenaDe({ coisas: [{ estados: ["vigiado"] }] })) === null);
  t("a cena que não muda nada, ou que some, não chama", oQueACenaChama(vazia, vazia) === null && oQueACenaChama(vazia, null) === null);
  t("todo estado que chama tem dono na tabela da cena", ESTADOS_DA_CENA.filter((e) => e.chama).every((e) => estadoPorId(e.id) === e && (e.de === "cena" || LUGARES_DA_CENA[e.de])));
}

sec("6. o módulo é puro, e não estoura com lixo");
{
  const src = fs.readFileSync(new URL("../src/motor/a-regua-do-momento.js", import.meta.url), "utf8");
  t("sem sorteio, sem relógio, sem React", !/Math\.random|Date\.now|new Date|from "react"/.test(src));
  let estourou = false;
  try {
    for (const v of [undefined, null, 42, "x", {}, { tipo: "teste" }, { tipo: "teste", id: "buscar", dc: 13 }])
      for (const c of [undefined, null, {}, { pessoas: "x" }, cenaDe({ pessoas: [null] })])
        for (const cx of [undefined, null, 7, {}]) valeRolagem(v, c, cx);
    oQueACenaChama(undefined, undefined); oQueACenaChama(42, "x");
  } catch { estourou = true; }
  t("veredito, cena e contexto de lixo não estouram", !estourou);
  const c = cenaDe({ pessoas: [P("guarda", "desconfiada")] });
  const antes = JSON.stringify(c);
  const a = vale("tento convencer o guarda a me deixar passar", c), b = vale("tento convencer o guarda a me deixar passar", c);
  t("mesma frase e mesma cena, mesmo veredito; a cena não é mutada", JSON.stringify(a) === JSON.stringify(b) && JSON.stringify(c) === antes);
}

sec("M5. o treino: as linhas novas e a escuta da cena (18/11/2026)");
{
  const ouve = (frase, cena, ctx) => valeRolagem(ler(frase), cena, { ...(ctx || {}), frase, leitura: CTX });
  t("as famílias da conversa e do saber são famílias da régua", [...FAMILIAS_DA_CONVERSA, ...FAMILIAS_DO_SABER].every((f) => Object.values(FAMILIA_DO_DESAFIO).includes(f)));
  /* a escuta só existe com cena: sem cena, a frase é ignorada e o Mestre é o de hoje */
  const semCena = valeRolagem(ler("dá pra eu trepar na árvore?"), null, { frase: "dá pra eu trepar na árvore?", leitura: CTX });
  t("sem cena, a frase não muda nada (a escuta não corre)", semCena.porque === (porQueNaoChama(ler("dá pra eu trepar na árvore?"), {}) || "chama") && !("ouviu" in semCena));
  /* a moldura */
  const mold = ouve("será que consigo escalar a torre?", cenaDe({ cena: { estados: ["perigo_fisico"] } }));
  t("a moldura sai e o ato de dentro é lido: com perigo, rola", mold.rola && mold.ouviu && mold.ouviu.id === "escalar" && mold.ouviu.porta === "moldura", JSON.stringify(mold.ouviu));
  t("a mesma moldura num chão calmo não rola", ouve("será que consigo escalar a torre?", cenaDe({})).porque === "travessiaCalma");
  /* a fala que pede */
  const pedido = "eu te pago o dobro se você abrir o portão";
  t("o pedido sem verbo de conversa, a quem tem motivo para negar, rola", ouve(pedido, cenaDe({ pessoas: [P("porteiro", "motivo_para_negar")] })).porque === "motivoParaNegar");
  t("o mesmo pedido a um estranho sem motivo não rola (a fala ouvida pela escuta é a leitura mais fraca)", ouve(pedido, cenaDe({ pessoas: [P("porteiro")] })).porque === "falaSemOposicao");
  t("o mesmo pedido sem ninguém em cena não é ouvido", ouve(pedido, cenaDe({})).porque === "naoETeste");
  /* o morto */
  t("quem ouviria não pode responder: sem dado", ouve(pedido, cenaDe({ pessoas: [P("porteiro", "motivo_para_negar", "morta")] })).rola === false);
  const fur = "surrupio a bolsa do cinto dele";
  t("a mão leve com alguém que pode notar rola", vale(fur, cenaDe({ pessoas: [P("mercador")] })).rola);
  t("a mão leve no morto não rola: ninguém nota", vale(fur, cenaDe({ pessoas: [P("mercador", "morta")] })).porque === "maoLeveSemOlhos");
  /* o céu */
  const ceu = "leio o céu para achar o rumo";
  t("orientar-se com o céu encoberto rola", vale(ceu, cenaDe({ cena: { estados: ["ceu_encoberto"] } })).porque === "ceuEncoberto");
  t("orientar-se com o céu à vista, sem perigo nem pressa, não rola", vale(ceu, cenaDe({})).porque === "ceuAVista");
  t("com pressa, orientar-se rola mesmo com o céu à vista", vale(ceu, cenaDe({ cena: { estados: ["com_pressa"] } })).rola);
  /* a coisa do herói, a de toda feira, a rara */
  t("examinar a magia da coisa do próprio herói não rola", vale("examino o selo para reconhecer a magia", cenaDe({ coisas: [{ nome: "selo", estados: ["do_heroi"] }] })).porque === "doProprioHeroi");
  t("lembrar o que é coisa de toda feira não rola", vale("o que eu sei sobre a ponte velha?", cenaDe({ coisas: [{ nome: "ponte", estados: ["coisa_comum"] }] })).porque === "coisaComum");
  t("procurar a coisa rara de achar rola; a comum, sem nada escondido, não", vale("vasculho o mercado", cenaDe({ coisas: [{ nome: "mercado", estados: ["raro_de_achar"] }] })).rola
    && !vale("vasculho o mercado", cenaDe({})).rola);
  /* o que a ficha já sabe, em qualquer desafio de saber */
  const sab = "tento lembrar se troll tem medo de fogo";
  const vSab = ler(sab);
  t("o saber que a ficha já tem cala também a fraqueza (não só o lembrar)", vSab && vSab.id === "fraqueza"
    && valeRolagem(vSab, cenaDe({}), { frase: sab, saber: { factos: ["troll"] } }).porque === "jaSabeOAssunto"
    && valeRolagem(vSab, cenaDe({}), { frase: sab }).rola, vSab && vSab.id);
  /* o discurso lido pelo improviso é conversa: quem já quer, cede */
  const disc = "faço um discurso inflamado para a vila";
  const vDisc = ler(disc);
  t("o discurso que o catálogo leu pela Presença passa pela conversa: com quem está disposto, não rola", vDisc && vDisc.tipo === "teste"
    && valeRolagem(vDisc, cenaDe({ pessoas: [P("aldeões", "disposta")] }), {}).porque === "dispostoCede", vDisc && vDisc.id);
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
