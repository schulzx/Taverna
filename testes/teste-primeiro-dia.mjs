/* teste-primeiro-dia.mjs (30/09, da prova jogada de MM13) — o que o jogador
   vê no primeiro dia

   O `jogo` jogou a abertura de MM13 e, de passagem, viu três defeitos que
   qualquer jogador vê antes do fim da primeira noite — e um deles fura a
   economia:

   1. "PROCURO UMA TAVERNA" deu um teste de Percepção e um baú de 168
      moedas. Procurar um sítio para ir não é revirar o sítio onde se está.
   2. O PÃO, A PEDRA E O QUARTO foram narrados como pagos e a bolsa não
      desceu. A cobrança lia a narração atrás do que o herói ganhava e
      nunca atrás do que ele dava — e ainda creditava a frase da compra.
   3. O DESCANSO LONGO punha na conversa "Fio local: d20 = 16 vs 10 →
      acontece". O dado do Mestre a decidir se o mundo mexe é bastidor.

   Cada secção prova um, com o corpus onde a frase importa. */
import fs from "node:fs";
import { lerAcao, ehProcuraDeIr, PROCURAR_PARA_IR, DESAFIOS } from "../src/desafios.js";
import {
  lerGastos, lerGanhos, oQueFaltaDebitar, oQueFaltaCreditar, falaDoDebito, envelopeDoDebito,
  NUMERO_POR_EXTENSO, VERBOS_DE_PAGAR, JA_PAGO_PELO_SISTEMA,
} from "../src/cobranca.js";
import { processarDescansoLongoEventos, ALVOS_DO_DESCANSO, rolarGatilho, ctxMundo } from "../src/geradores.js";
import { rngDe, gerarGeografia } from "../src/geografia.js";
import { achavelAqui, oQueExisteAqui, garantirBase, recompensaDoAchado } from "../src/mundo-base.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
/* CRLF: o so-o-meu.sh tira a árvore por `git archive`, e com autocrlf o
   App chega em CRLF — as âncoras daqui são de uma linha, mas normaliza-se
   na mesma, pelo precedente de MM6 */
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

/* ============================================================
   1. PROCURAR PARA IR NÃO É VASCULHAR
   ============================================================ */
sec("1. procurar um sítio, alguém ou um serviço não rola Percepção");
{
  /* o baú que a base do mundo tem por perto: se `buscar` pegar a frase, o
     veredito vem com ele — é o que pagou as 168 moedas */
  const BAU = { especie: "tesouro", o: "moedas antigas de um reino que não existe mais", dc: 14, acha: "percepcao" };
  const ctx = {
    personagem: { nivel: 1 }, semente: "primeiro-dia", lugar: "a Taça Negra", tentativas: {}, dia: 1,
    pessoaDe: () => null, ehPessoaConhecida: (x) => /\b(orin|petra|ione)\b/i.test(x), achadoDe: () => BAU,
  };
  const CORPUS = [
    /* --- ir ou perguntar ao mundo: não é busca --- */
    ["Procuro uma taverna", "ir"],
    ["procuro uma taverna para passar a noite", "ir"],
    ["Procuro uma estalagem barata", "ir"],
    ["procuro uma boa estalagem", "ir"],
    ["procuro o mercado", "ir"],
    ["procuro a praça central", "ir"],
    ["procuro o templo", "ir"],
    ["busco uma ferraria", "ir"],
    ["procuro a casa de banhos", "ir"],
    ["procuro a taverna mais próxima", "ir"],
    ["procuro por uma taverna", "ir"],
    ["procuro pela taverna do Corvo", "ir"],
    ["Saio à procura de uma estalagem", "ir"],
    ["Ando pela cidade procurando uma pousada", "ir"],
    ["procuro um navio que vá para o sul", "ir"],
    ["procuro a saída da cidade", "ir"],
    ["procuro um lugar para dormir", "ir"],
    ["procuro onde dormir", "ir"],
    ["busco um quarto para a noite", "ir"],
    ["procuro trabalho", "ir"],
    ["procuro emprego na cidade", "ir"],
    ["procuro informações sobre o culto", "ir"],
    ["busco notícias da guerra", "ir"],
    ["procuro um jeito de sair da cidade", "ir"],
    ["procuro comprar pão", "ir"],
    ["procuro saber o que houve", "ir"],
    ["procuro um guia para atravessar as montanhas", "ir"],
    ["Vou em busca de um curandeiro", "ir"],
    ["procuro alguém que venda cavalos", "ir"],
    ["procuro quem compre peles", "ir"],
    ["procuro o prefeito", "ir"],
    ["procuro o mestre da guilda", "ir"],
    /* --- pessoa que o jogo conhece: é a procura de v9.130, nunca o baú --- */
    ["procuro Orin", "pessoa"],
    ["procuro a casa de Orin", "pessoa"],
    ["procuro por sinais de Ione", "pessoa"],
    ["Busco Petra na Corda Velha", "pessoa"],
    /* --- busca num sítio: rola, como sempre rolou --- */
    ["procuro pistas", "busca"],
    ["vasculho o quarto", "busca"],
    ["procuro armadilhas no corredor", "busca"],
    ["procuro na taverna algo escondido", "busca"],
    ["procuro pelo quarto um fundo falso", "busca"],
    ["procuro pelo quarto", "busca"],
    ["procuro pela sala", "busca"],
    ["reviro a estalagem", "busca"],
    ["Revisto a taverna de cima a baixo", "busca"],
    ["procuro uma saída secreta", "busca"],
    ["procuro uma passagem escondida", "busca"],
    ["procuro a chave que caiu", "busca"],
    ["busco no baú um compartimento", "busca"],
    ["procuro rastros na lama", "busca"],
    ["procuro pegadas perto do portão", "busca"],
    ["procuro algo de valor na mesa", "busca"],
    ["procuro debaixo da cama", "busca"],
    ["busco o anel entre os destroços", "busca"],
    ["vasculho a taverna à procura de uma pista", "busca"],
    ["procuro uma taverna e depois vasculho o quarto", "busca"],
  ];
  const erros = [];
  const classe = (v) => (v && v.tipo === "teste" && v.id === "buscar" ? "busca" : "nao");
  for (const [frase, esperado] of CORPUS) {
    const v = lerAcao(frase, ctx);
    const got = classe(v);
    const quer = esperado === "busca" ? "busca" : "nao";
    if (got !== quer) erros.push(`"${frase}" deu ${got}, esperado ${esperado}`);
    /* e nenhuma frase que não é busca sai com o baú na mão */
    if (esperado !== "busca" && v && v.achado) erros.push(`"${frase}" levou um achado`);
  }
  const n = CORPUS.length;
  const conta = (e) => CORPUS.filter(([, x]) => x === e).length;
  const taxa = Math.round(((n - erros.length) / n) * 1000) / 10;
  console.log(`      corpus do primeiro dia: ${n - erros.length}/${n} (${taxa}%) · ${conta("ir")} ir · ${conta("pessoa")} pessoa · ${conta("busca")} busca`);
  t(`o corpus tem ao menos 40 frases com procurar/buscar/vasculhar/revistar (${n})`, n >= 40);
  t("e mistura os três lados", conta("ir") >= 15 && conta("pessoa") >= 3 && conta("busca") >= 15);
  t("toda frase do corpus sai com o veredito esperado (piso 100%)", erros.length === 0, erros.join(" | "));

  /* a frase exata da prova jogada, com o baú de 168 à espera */
  const v = lerAcao("Procuro uma taverna", ctx);
  t('"Procuro uma taverna" não é teste de Percepção', !v || v.tipo !== "teste");
  t("e não sai com o baú", !(v && v.achado));
  t("mas vasculhar a taverna continua a achar o que houver", (lerAcao("vasculho a taverna", ctx) || {}).achado === BAU);

  /* a tabela é lida de volta: é ela a regra */
  t("a tabela dos destinos existe, e tem os sítios da prova", ["taverna", "estalage", "mercado"].every((d) => PROCURAR_PARA_IR.destinos.includes(d)));
  t("o verbo de revirar veta o destino", PROCURAR_PARA_IR.revirar.test("vasculho a taverna") && !ehProcuraDeIr("vasculho a taverna"));
  t("o sinal de coisa escondida também", PROCURAR_PARA_IR.escondido.test("a saida secreta") && !ehProcuraDeIr("procuro a saída secreta"));
  t("só é ir quando TODA procura da frase é ir", !ehProcuraDeIr("procuro uma taverna e procuro armadilhas"));
  t("`buscar` é quem consulta a tabela", DESAFIOS[0].id === "buscar" && DESAFIOS[0].naoSeCom("procuro uma taverna", {}) === true);
  t("lixo não quebra", ehProcuraDeIr(null) === false && ehProcuraDeIr("") === false && ehProcuraDeIr(42) === false);
  t("o mesmo texto dá sempre o mesmo veredito", JSON.stringify(lerAcao("procuro o mercado", ctx)) === JSON.stringify(lerAcao("procuro o mercado", ctx)));
}

/* ============================================================
   2. O QUE O HERÓI PAGA SAI DA BOLSA
   ============================================================ */
sec("2. a narração do pagamento desce as moedas");
{
  const CORPUS = [
    ["Você deixa três moedas no balcão e sai com o pão quente.", 3],
    ["Você paga 6 moedas ao taverneiro, que lhe estende a chave do quarto.", 6],
    ["Você entrega duas moedas de cobre ao padeiro.", 2],
    ["Pago 3 moedas pela pedra de amolar.", 3],
    ["O quarto te custou 6 moedas.", 6],
    ["Você paga ◉ 6 e sobe as escadas.", 6],
    ["Você desembolsa vinte e cinco moedas pela poção.", 25],
    ["Você atira uma moeda ao mendigo.", 1],
    /* o que NÃO é pagar */
    ["O mercador paga você com 20 moedas.", 0],
    ["Você não paga as 3 moedas que ele pede.", 0],
    ["Se você pagar 5 moedas, ele deixa passar.", 0],
    ["Você paga 10 moedas e recebe 4 de troco.", 0],
    ["O quarto custa 6 moedas por noite.", 0],
    ["Você conta 30 moedas na bolsa do morto.", 0],
    ["Você joga os dados e ganha 5 moedas.", 0],
    ["Você joga uma moeda para o alto.", 0],
    ["Você vê o mercador pagar 12 moedas ao guarda.", 0],
    ["Você oferece 4 moedas pelo pão.", 0],
  ];
  const erros = CORPUS.filter(([f, e]) => lerGastos(f).moedas !== e).map(([f, e]) => `"${f}" deu ${lerGastos(f).moedas}, esperado ${e}`);
  console.log(`      corpus do pagamento: ${CORPUS.length - erros.length}/${CORPUS.length}`);
  t("toda frase de pagamento sai com a quantia certa, e as outras com zero", erros.length === 0, erros.join(" | "));

  /* a prova jogada: pão, pedra e quarto numa noite — nove moedas */
  const noite = "Você paga 3 moedas pelo pão. Na banca do amolador, você deixa três moedas pela pedra. O taverneiro recebe as suas 6 moedas e você sobe ao quarto.";
  /* "o taverneiro recebe as suas 6 moedas" não tem o herói de sujeito: é a
     frase que o leitor deixa passar, de propósito — o lado seguro é não
     debitar. O que se prova é que os dois pagamentos ditos pelo herói descem. */
  t("a noite da prova desce o que o herói pagou", lerGastos(noite).moedas === 6);

  t("a frase da compra deixa de ser crédito (antes: +3)", lerGanhos("Você recebe o pão e paga 3 moedas.").moedas === 0);
  t("o achado legítimo continua a creditar", lerGanhos("Você encontra 30 moedas no baú.").moedas === 30);
  t("e o crédito da compra também some da cobrança", oQueFaltaCreditar("Você recebe o pão e paga 3 moedas.", null).temAlgo === false);

  const d1 = oQueFaltaDebitar("Você paga 6 moedas ao taverneiro.", null);
  t("sem o campo, falta debitar as 6", d1.temAlgo && d1.moedas === 6);
  t("com o campo certo, não falta nada (nada é cobrado duas vezes)", oQueFaltaDebitar("Você paga 6 moedas ao taverneiro.", { moedas: -6 }).temAlgo === false);
  t("com o campo a menos, falta a diferença", oQueFaltaDebitar("Você paga 6 moedas ao taverneiro.", { moedas: -2 }).moedas === 4);
  t("um ganho declarado não desconta o gasto narrado", oQueFaltaDebitar("Você paga 6 moedas ao taverneiro.", { moedas: 10 }).moedas === 6);

  /* o que o sistema já cobrou: cada envelope da tabela existe mesmo no App */
  for (const rx of JA_PAGO_PELO_SISTEMA) t(`o envelope ${rx.source.slice(2, 30)}… existe no App`, rx.test(APP));
  const env = "[COMPRA — JÁ REGISTRADA PELO SISTEMA] Comprei \"Espada\" de Bram por ◉ 12.";
  t("depois de uma compra do painel, a narração dela não debita outra vez", oQueFaltaDebitar("Você paga 12 moedas ao armeiro.", {}, { envelopes: env }).temAlgo === false);

  const sf = oQueFaltaDebitar("Você paga 20 moedas pela espada.", null, { bolsa: 6 });
  t("sem fundos, nada é debitado", sf.semFundos === true && sf.moedas === 0);
  t("e o bilhete diz que a compra não aconteceu", /NÃO aconteceu/.test(envelopeDoDebito(sf)) && falaDoDebito(sf) === "");
  t("com fundos, debita", oQueFaltaDebitar("Você paga 6 moedas.", null, { bolsa: 6 }).moedas === 6);

  t("a linha do jogador é a do débito declarado", falaDoDebito(d1) === "◉ −6 moedas");
  t("o bilhete ao Narrador pede o campo da próxima vez", /"moedas" negativo/.test(envelopeDoDebito(d1)));
  t("nada a debitar, nada a dizer", falaDoDebito(oQueFaltaDebitar("", null)) === "" && envelopeDoDebito(null) === "");

  t("lixo não quebra", oQueFaltaDebitar(null, null, null).temAlgo === false && lerGastos(undefined).moedas === 0);
  const congelado = Object.freeze({ moedas: -1 });
  let estourou = false;
  try { oQueFaltaDebitar("Você paga 6 moedas.", congelado, Object.freeze({ bolsa: 10 })); } catch { estourou = true; }
  t("não muta o que recebe", !estourou && congelado.moedas === -1);

  t("a tabela por extenso diz o que diz", NUMERO_POR_EXTENSO.tres === 3 && NUMERO_POR_EXTENSO.duas === 2 && NUMERO_POR_EXTENSO.vinte === 20);
  t("contar as moedas não é verbo de pagar", !VERBOS_DE_PAGAR.includes("conta") && VERBOS_DE_PAGAR.includes("paga"));
}

/* ============================================================
   3. O DADO DO MESTRE FICA ATRÁS DO ECRÃ
   ============================================================ */
sec("3. o descanso longo não fala de si");
{
  const ctx = ctxMundo({ mundo: { genero: "Fantasia medieval" }, mapa: { cidades: [{ nome: "Monte do Norte" }] }, dia: 3 });
  const r = processarDescansoLongoEventos(null, ctx, { dia: 3, secundariasAtivas: 0, sorte: rngDe("descanso|3") });
  t("o registro do dado existe, com o nome do que é", Array.isArray(r.bastidor) && r.bastidor.length === 3);
  t("e não se chama mais `rolagens` — o App mostrava esse campo ao jogador", !("rolagens" in r));
  t("o App não põe o bastidor na conversa", !/\.bastidor\b/.test(APP));

  const a = processarDescansoLongoEventos(null, ctx, { dia: 3, secundariasAtivas: 0, sorte: rngDe("descanso|7") });
  const b = processarDescansoLongoEventos(null, ctx, { dia: 3, secundariasAtivas: 0, sorte: rngDe("descanso|7") });
  t("mesma semente, os mesmos dados", JSON.stringify(a.bastidor.map((x) => x.d)) === JSON.stringify(b.bastidor.map((x) => x.d)));

  /* a tabela manda: um dado que cai exatamente no alvo passa, um abaixo não */
  const cai = (n) => () => (n - 1) / 20;
  t("o alvo do fio local é o da tabela", rolarGatilho("x", ALVOS_DO_DESCANSO.fioLocal, { sorte: cai(ALVOS_DO_DESCANSO.fioLocal) }).passou
    && !rolarGatilho("x", ALVOS_DO_DESCANSO.fioLocal, { sorte: cai(ALVOS_DO_DESCANSO.fioLocal - 1) }).passou);
  const baixo = processarDescansoLongoEventos(null, ctx, { dia: 3, secundariasAtivas: 0, sorte: cai(ALVOS_DO_DESCANSO.fioLocal) });
  t("o descanso lê a tabela: no alvo do fio, o fio nasce", !!baixo.localNovo && baixo.bastidor[0].alvo === ALVOS_DO_DESCANSO.fioLocal);
  const cheio = { locais: [1, 2, 3].map((i) => ({ id: i, expiraEm: 99 })), global: null, semGlobalDesde: 3, seq: 1 };
  t("com os fios no teto, o fio não rola", !processarDescansoLongoEventos(cheio, ctx, { dia: 3, sorte: cai(20) }).bastidor.some((x) => x.rotulo === "Fio local"));
  const garantido = processarDescansoLongoEventos({ locais: [], global: null, semGlobalDesde: 1, seq: 1 }, ctx, { dia: 1 + ALVOS_DO_DESCANSO.diasAteGarantia, sorte: cai(1) });
  t("dias sem arco regional o garantem, pela tabela", !!garantido.globalNovo);
  t("com duas secundárias, não rola missão", !processarDescansoLongoEventos(null, ctx, { dia: 3, secundariasAtivas: ALVOS_DO_DESCANSO.secundariasMax, sorte: cai(20) }).bastidor.some((x) => x.rotulo === "Nova missão"));
  t("sem sorte passada, continua a rolar (o App de hoje)", Array.isArray(processarDescansoLongoEventos(null, ctx, { dia: 3 }).bastidor));
}

/* ============================================================
   4. O QUE SE ACHA É O QUE ESTÁ ALI
   ============================================================ */
sec("4. procurar acha o que há no lugar onde o herói está");
{
  /* 168 = 14 × 12: só os baús do ermo têm conteúdo de moeda, e é a conta
     de `recompensaDoAchado` para um deles de dificuldade 14 */
  t("168 moedas é um baú do ermo de dificuldade 14", recompensaDoAchado({ o: "moedas antigas de um reino que não existe mais", dc: 14 }).moedas === 168);

  const SEM = "taverna|primeiro-dia";
  const G = "Fantasia medieval";
  const mapa = gerarGeografia(SEM, G);
  const base = garantirBase(null);
  /* a primeira cidade deste mundo com dois segredos de vista em prédios
     diferentes e um baú do ermo por perto — o caso que prova as três
     coisas de uma vez. A varredura é determinística: o mundo é a semente. */
  const escolha = mapa.cidades.map((c) => ({ c, q: oQueExisteAqui(SEM, mapa, c.nome, base, G) })).find(({ q }) => {
    const sp = q.segredos.filter((s) => s.acha === "percepcao");
    return sp.length >= 2 && new Set(sp.map((s) => s.local)).size >= 2 && (q.tesouros || []).some((x) => x.acha === "percepcao");
  });
  t("o mundo de prova tem a cidade que o caso pede", !!escolha);
  if (escolha) {
    const { c, q } = escolha;
    const [s1, s2] = q.segredos.filter((s) => s.acha === "percepcao");
    const achar = (onde) => achavelAqui(SEM, mapa, c.nome, base, G, "percepcao", null, null, onde);
    const semSegredo = q.locais.find((l) => !q.segredos.some((s) => s.local === l.nome));

    /* a regressão: sem dizer onde, a resposta de sempre — e ela É o defeito
       (o baú do ermo ganha por ser o mais fácil); fica provado para a
       fiação saber o que está a trocar */
    const velho = achavelAqui(SEM, mapa, c.nome, base, G, "percepcao");
    t("sem `onde`, a resposta é a de antes, byte a byte",
      JSON.stringify(velho) === JSON.stringify(achavelAqui(SEM, mapa, c.nome, base, G, "percepcao", null, null, null)));

    const naTaverna = achar({ lugar: semSegredo ? semSegredo.nome : "a taverna", foraDosMuros: false });
    t("na taverna sem segredo, não se acha o baú do ermo", naTaverna === null);
    t("na rua, sem lugar, também não", achar({ lugar: "", foraDosMuros: false }) === null);

    const noErmo = achar({ lugar: "a estrada do norte", foraDosMuros: true });
    t("fora dos muros, acha-se o baú do ermo", !!noErmo && noErmo.especie === "tesouro");
    t("e nenhum segredo de prédio", !!noErmo && noErmo.especie !== "segredo");

    const em1 = achar({ lugar: s1.local, foraDosMuros: false });
    const em2 = achar({ lugar: s2.local, foraDosMuros: false });
    t("no prédio do segredo, acha-se o segredo dele", !!em1 && em1.id === s1.id);
    t("e no outro prédio, o do outro — nunca o vizinho", !!em2 && em2.id === s2.id && em1.id !== em2.id);
    t("o artigo e a caixa não separam o mesmo prédio", (achar({ lugar: s1.local.replace(/^(O|A)\s+/, "").toUpperCase(), foraDosMuros: false }) || {}).id === s1.id);
    t("o cômodo acha o segredo do prédio de que faz parte", (achar({ lugar: "o quarto de cima", dentroDe: s1.local, foraDosMuros: false }) || {}).id === s1.id);
    t("`onde` lixo é o mesmo que não dizer", JSON.stringify(achavelAqui(SEM, mapa, c.nome, base, G, "percepcao", null, null, "x")) === JSON.stringify(velho));
  }
}

console.log(`\nprimeiro dia: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
