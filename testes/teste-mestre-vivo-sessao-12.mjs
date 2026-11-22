/* teste-mestre-vivo-sessao-12.mjs (22/11/2026) — a décima segunda sessão do
   Mestre vivo, turno a turno (mente/lancamento/mestre-vivo-sessao-12.md, sobre
   64181e7).

   A lei do pacote (a pessoa, 21/11): «Tudo pelo sistema, o narrador apenas
   recebe fatos e narra, nada entra por ele.» Três sessões seguidas a
   concordância das trocas ficou em 22 de 33, e a causa desta vez foi uma
   família só: o sistema errava QUEM ESTÁ EM CENA. «Ulric Coração-de-Ferro», em
   cena, foi lido como o Ulric Olho-de-Corvo ausente (T3, T4, T9); um «Quorin»
   de primeiro nome só, do registo, ia atrás do herói por todos os sítios (T20,
   T25, T26, T29–T32, T34); a linha 🔎 dizia «está aqui» de quem morava noutro
   sítio (T18, T59); o Joric, receptador do Pátio, aparecia na furna porque o
   passo «consultou» o punha lá (T25, T26).

   A fonte única de presença é quemEstaAqui (quem-esta-aqui.js) — e agora o
   nome dito numa frase também se decide numa função só (quemONomeDiz): a
   ficha da cena, o veredito da troca e a procura leem dela.

   Cena da sessão: Ingrid (Bardo) com Hilda (Bruxo, companheira), em Ponta
   Quebrada (cais e praça), Gabinete do Prático (Quorin Barba-Ruiva, Falk da
   Foz), Pátio das Trocas (Joric, Merek o Exilado), Casa do Calafate (Morgane
   Barba-Ruiva, Ulric Olho-de-Corvo), Molhe Velho (a furna) e a estrada. */
import fs from "node:fs";
import path from "node:path";
import { quemEstaAqui, contextoDeQuemEsta, oNomeDito, quemONomeDiz, linhaDeQual, aCasaNaBase, QUEM_O_NOME_DIZ } from "../src/quem-esta-aqui.js";
import { osAusentes } from "../src/motor/poda-do-ausente.js";
import { montarEmCena } from "../src/em-cena.js";
import { quemNaoEstaNaCena, falaDeQuemNaoEsta, osPrecosDaPergunta, oBalcaoComoBanca, O_BALCAO_COMO_BANCA } from "../src/a-ficha-da-cena.js";
import { oVereditoDaTroca, aIntencaoDaTroca, aVendaSemComprador, oItemDaFrase, oSubornoDaFrase, O_VEREDITO_DA_TROCA } from "../src/o-veredito-da-troca.js";
import { procurarPessoa, linhaDaProcura, ehProcura, PROCURA_NAO_E_AMEACA } from "../src/procura.js";
import { lerAcao } from "../src/desafios.js";
import { lerAgressao, falaDoCompanheiro, A_RECUSA_DO_COMPANHEIRO } from "../src/agressao.js";
import { conferirAProsa } from "../src/motor/o-conferente-da-prosa.js";
import { oMomentoDaTrocaNegada, falaDosBlefesNaMesa, BLEFE_QUE_O_SUBORNO_PAGA } from "../src/o-mestre-vivo-no-jogo.js";
import { cenarioDe, PLANTA_DO_LUGAR } from "../src/grid.js";
import { questPorId, morreuNaLuta, osMortosDaLuta } from "../src/biblioteca-de-quests.js";
import { garantirAbertura, aAberturaDaQuest, A_ABERTURA_DA_QUEST, O_QUE_SE_SABE, CHEGADAS, HISTORIA_DO_LUGAR, TITULO_DO_FEITIO } from "../src/abertura.js";
import { A_PESSOA_DO_PASSO } from "../src/motor/a-pessoa-do-passo.js";
import { aMaoDaFrase } from "../src/motor/a-mao-da-frase.js";
import { compraNaFrase, compraNaBanca, compraSemQuemVenda, dadivaNaFrase } from "../src/bolsa-da-frase.js";
import { oPagamentoDaFrase } from "../src/motor/o-pagamento-da-frase.js";

let falhas = 0;
const t = (nome, cond, extra) => { if (cond) console.log("  ok:", nome); else { falhas++; console.log("  FALHA:", nome, extra != null ? `→ ${extra}` : ""); } };
const sec = (s) => console.log(`\n[${s}]`);
const J = JSON.stringify;
const lerSrc = (f) => fs.readFileSync(path.join("..", "src", f), "utf8");
const app = lerSrc("App.jsx");

const HILDA = Object.freeze({ nome: "Hilda", inventario: Object.freeze([]), equipados: Object.freeze({ arma: Object.freeze({ nome: "Adaga" }), armadura: Object.freeze({ nome: "Gibão de Couro" }) }) });
const INGRID = Object.freeze({
  nome: "Ingrid", moedas: 84, inventario: Object.freeze(["Bússola empenada (ainda aponta para algo)"]), equipamento: Object.freeze([]),
  equipados: Object.freeze({ arma: Object.freeze({ nome: "Rapieira" }), armadura: Object.freeze({ nome: "Gibão de Couro" }) }),
  suprimentos: Object.freeze({ racoes: 10, agua: 10, tochas: 5, kit: true }), grupo: Object.freeze([HILDA]),
});
const GENTE = Object.freeze([
  { nome: "Quorin Barba-Ruiva", local: "Gabinete do Prático", papel: "estivadora" },
  { nome: "Falk da Foz", local: "Gabinete do Prático", papel: "prático" },
  { nome: "Joric", local: "Pátio das Trocas", papel: "receptador" },
  { nome: "Merek o Exilado", local: "Pátio das Trocas", papel: "vendedor de mapas" },
  { nome: "Morgane Barba-Ruiva", local: "Casa do Calafate", papel: "carpinteira" },
  { nome: "Ulric Olho-de-Corvo", local: "Casa do Calafate", papel: "calafate" },
]);
const LUGARES = Object.freeze(["Gabinete do Prático", "Pátio das Trocas", "Casa do Calafate", "Molhe Velho"].map((nome) => ({ nome, onde: "dentro" })));
const ULRIC_LONGE = Object.freeze({ nome: "Ulric Olho-de-Corvo", onde: "Casa do Calafate", morto: false });
const ctxT = (extra) => ({ ficha: INGRID, presentes: ["Hilda", "Ulric Coração-de-Ferro"], chao: [], semente: "ponta-s12", lugar: "Ponta Quebrada", dia: 1, bancas: [], ...extra });

/* ============================================================ */
sec("1. T3, T4, T9: o homônimo — o nome dito inteiro decide, e o presente ganha");
{
  t("o nome dito: «Ulric Coração-de-Ferro», «Merek o Exilado», «Falk da Foz» (a partícula só com o nome maiúsculo depois)",
    oNomeDito("pergunto a Ulric Coração-de-Ferro o que desce ao anoitecer", "Ulric") === "Ulric Coração-de-Ferro"
    && oNomeDito("vendo a bússola a Merek o Exilado", "Merek") === "Merek o Exilado"
    && oNomeDito("digo a Falk da Foz que sim", "Falk") === "Falk da Foz"
    && oNomeDito("furto a bolsa de Ulric enquanto Hilda puxa conversa", "Ulric") === "Ulric");
  const cenaSem = { pessoas: [{ nome: "Hilda", estados: ["do_grupo"] }] };
  const q3 = quemNaoEstaNaCena("pergunto a Ulric Coração-de-Ferro o que desce ao anoitecer e quem perdeu o rebanho", cenaSem, { ausentes: [ULRIC_LONGE], conhecidos: ["Ulric Olho-de-Corvo"] });
  t("T3: «Ulric Coração-de-Ferro» não é o Ulric Olho-de-Corvo ausente (era «🧭 Ulric Olho-de-Corvo não está aqui»)", q3 === null, J(q3));
  const q3b = quemNaoEstaNaCena("pergunto a Ulric o que desce ao anoitecer", cenaSem, { ausentes: [ULRIC_LONGE], conhecidos: [], presentes: ["Ulric Coração-de-Ferro"] });
  t("  o primeiro nome que casa com quem está (a tela: `presentes`) e com quem não está é de quem está", q3b === null, J(q3b));
  const q3c = quemNaoEstaNaCena("pergunto a Ulric Olho-de-Corvo onde mora", cenaSem, { ausentes: [ULRIC_LONGE], conhecidos: [] });
  t("PAR: o ausente dito pelo nome inteiro continua «não está aqui — está em Casa do Calafate»", q3c && q3c.nome === "Ulric Olho-de-Corvo" && falaDeQuemNaoEsta(q3c) === "🧭 Ulric Olho-de-Corvo não está aqui — está em Casa do Calafate.", J(q3c));
  const q3d = quemNaoEstaNaCena("pergunto a Ulric onde mora", cenaSem, { ausentes: [ULRIC_LONGE], conhecidos: [] });
  t("PAR: o primeiro nome sozinho, sem ninguém aqui com ele, é o ausente", q3d && q3d.nome === "Ulric Olho-de-Corvo", J(q3d));
  const v4 = oVereditoDaTroca("furto a bolsa de Ulric Coração-de-Ferro enquanto Hilda puxa conversa com ele", ctxT({ ausente: ULRIC_LONGE }));
  t("T4: o furto ao Ulric que está não é negado como ausente — espera o dado (era sem dado, «🧭 Ulric Olho-de-Corvo não está aqui»)", v4 && v4.estado === "pendente", J(v4));
  const v4d = oVereditoDaTroca("furto a bolsa de Ulric Coração-de-Ferro enquanto Hilda puxa conversa com ele", ctxT({ presentes: ["Hilda", "Ulric Olho-de-Corvo", "Ulric Coração-de-Ferro"], dado: { passou: false } }));
  t("  com os dois Ulric aqui e o nome inteiro dito, o alvo é o Coração-de-Ferro", v4d && /Ulric Coração-de-Ferro/.test(v4d.fato) && !/Olho-de-Corvo/.test(v4d.fato), J(v4d));
  const v4q = oVereditoDaTroca("furto a bolsa de Ulric enquanto Hilda puxa conversa com ele", ctxT({ presentes: ["Hilda", "Ulric Olho-de-Corvo", "Ulric Coração-de-Ferro"], dado: { passou: true } }));
  t("  com os dois aqui e só «Ulric»: a linha pergunta qual, e nada acontece", v4q && v4q.estado === "negada" && v4q.motivo === "qual" && v4q.linha === "✋ Qual deles: Ulric Olho-de-Corvo ou Ulric Coração-de-Ferro? Diga o nome inteiro." && v4q.ficha === null, J(v4q));
  const v9 = oVereditoDaTroca("dou 3 moedas a Ulric Coração-de-Ferro pelo que ele viu do rebanho", ctxT({ ausente: ULRIC_LONGE }));
  t("T9: o pagamento ao Ulric que está é do cartão «Pagar» (era negado com o nome do homônimo)", v9 === null, J(v9));
  const v9b = oVereditoDaTroca("dou 3 moedas a Ulric Olho-de-Corvo pelo que ele viu", ctxT({ ausente: ULRIC_LONGE }));
  t("PAR: ao Olho-de-Corvo, ausente, continua negado e nada sai", v9b && v9b.estado === "negada" && v9b.motivo === "ausente" && v9b.ficha === null);
  const r = quemONomeDiz("Ulric", { aqui: ["Ulric Coração-de-Ferro"], longe: [ULRIC_LONGE] });
  t("quemONomeDiz: o presente ganha do ausente; dois presentes, «qual»; ninguém conhecido, nada", r.estado === "aqui" && r.nome === "Ulric Coração-de-Ferro"
    && quemONomeDiz("Ulric", { aqui: ["Ulric Coração-de-Ferro", "Ulric Olho-de-Corvo"] }).estado === "qual" && quemONomeDiz("Ivo", { aqui: ["Hilda"] }).estado === "ninguem");
  t("  a linha do «qual» é tabela", linhaDeQual(["Ulric A", "Ulric B"]) === QUEM_O_NOME_DIZ.qual.replace("{deles}", "deles").replace("{Lista}", "Ulric A ou Ulric B"));
  t("a fiação: a ficha da cena e o momento passam quem a tela põe em cena", (app.match(/presentes: presentesDaTela\(\) \}\)/g) || []).length === 2);
}

sec("2. T20, T25, T26, T29–T32, T34: o «Quorin» de primeiro nome não vai atrás do herói");
{
  const npcs = { Quorin: { nome: "Quorin", local: "Ponta Quebrada", relacao: "neutro", status: "vivo" } };
  const est = { npcs, cidadeAtual: "Ponta Quebrada", grupo: [HILDA], lugar: { nome: "Casa do Calafate" }, lugares: LUGARES, gente: GENTE };
  const q = quemEstaAqui(est);
  t("na Casa do Calafate, o «Quorin» do registo é o Quorin Barba-Ruiva da base: está no Gabinete (era «Em cena: Quorin»)", !q.aqui.some((x) => x.nome === "Quorin") && q.longe.some((x) => x.nome === "Quorin" && x.laFora === "Gabinete do Prático"), J({ aqui: q.aqui.map((x) => x.nome), longe: q.longe }));
  t("  e quem o posto põe ali está (Morgane, Ulric Olho-de-Corvo)", q.doSitio.map((x) => x.nome).join() === "Morgane Barba-Ruiva,Ulric Olho-de-Corvo", J(q.doSitio));
  const qG = quemEstaAqui({ ...est, lugar: { nome: "Gabinete do Prático" } });
  t("no Gabinete, uma pessoa só (era «Quorin Barba-Ruiva, Quorin e Falk da Foz»)", qG.doSitio.filter((x) => /^Quorin/.test(x.nome)).length === 1, J(qG.doSitio));
  t("aCasaNaBase: pelo nome inteiro, ou pelo primeiro nome que só um da base tem", aCasaNaBase("Quorin", GENTE).local === "Gabinete do Prático" && aCasaNaBase("Joric", GENTE).local === "Pátio das Trocas" && aCasaNaBase("Barba-Ruiva", GENTE) === null);
  const aus = osAusentes(q, { gente: GENTE, npcs, heroi: INGRID, lugar: est.lugar });
  const q20 = quemNaoEstaNaCena("digo a Quorin Barba-Ruiva que já falei com a carpinteira e que ela sabe mais do que ele pensa", { pessoas: [{ nome: "Hilda" }, ...q.doSitio.map((x) => ({ nome: x.nome }))] }, { ausentes: aus, conhecidos: Object.keys(npcs) });
  t("T20: falar com o Quorin na Casa do Calafate tem veredito: «não está aqui — está no Gabinete do Prático» (era nenhuma linha, e ele respondeu)", q20 && /^Quorin/.test(q20.nome) && q20.onde === "Gabinete do Prático", J(q20));
  const emC = montarEmCena({ semente: "s", cidade: "Ponta Quebrada", grupo: [HILDA], mostrado: ["Quorin cruza os braços junto à porta."], ...contextoDeQuemEsta(q), presentes: [npcs.Quorin] });
  t("a tela e a pauta (EM CENA): a gente da base com posto noutro sítio não fica à vista pela prosa", !emC.some((x) => x.tipo === "pessoa" && /^Quorin/.test(x.nome)), J(emC.map((x) => x.nome)));
  t("T25, T26: consultar é ir ter com a pessoa — só o «conheceu» acontece no lugar do passo (o Joric não vai à furna)", A_PESSOA_DO_PASSO.noLugarDoPasso.length === 1 && A_PESSOA_DO_PASSO.noLugarDoPasso[0] === "conheceu"
    && /const noLugar = A_PESSOA_DO_PASSO\.noLugarDoPasso\.includes\(c\.predicado\) \|\| !limpo\(c\.onde\);/.test(fs.readFileSync(path.join("..", "src", "motor", "a-pessoa-do-passo.js"), "utf8")));
}

sec("3. T18, T59: a linha 🔎 diz onde a pessoa está, pela mesma conta de presença");
{
  const r18 = procurarPessoa("Morgane Barba-Ruiva", { genteDaqui: GENTE, cidadeAtual: "Ponta Quebrada", lugarAtual: "Pátio das Trocas", longe: [{ nome: "Morgane Barba-Ruiva", onde: "Casa do Calafate" }] });
  t("T18: «Morgane Barba-Ruiva está em Casa do Calafate» (era «🔎 … está aqui — Casa do Calafate», no Pátio)", r18.desfecho === "noutro_lugar" && /^🧭 Morgane Barba-Ruiva está em Casa do Calafate/.test(linhaDaProcura(r18)), linhaDaProcura(r18));
  const r59 = procurarPessoa("Joric", { npcs: { Joric: { nome: "Joric", local: "Ponta Quebrada" } }, cidadeAtual: "Ponta Quebrada", jornada: { de: "Ponta Quebrada", para: "Angra das Gaivotas" }, longe: [{ nome: "Joric", onde: "Ponta Quebrada" }] });
  t("T59: na estrada, o Joric está em Ponta Quebrada (era «🔎 Joric está aqui — Ponta Quebrada»)", r59.desfecho === "noutro_lugar" && !/está aqui/.test(linhaDaProcura(r59)), linhaDaProcura(r59));
  const rP = procurarPessoa("Morgane Barba-Ruiva", { genteDaqui: GENTE, cidadeAtual: "Ponta Quebrada", lugarAtual: "Casa do Calafate", longe: [] });
  t("PAR: na casa dela, está aqui", rP.desfecho === "aqui");
  t("a fiação: a procura recebe `longe` da mesma lista dos ausentes", /longe: ausentesAgora\(\)\.aus,/.test(app));
  const pt = lerSrc(path.join("motor", "pauta-do-turno.js"));
  t("as narrações por clique («Seguir», a chegada) levam o veto de quem não está: a pauta de TODO turno o põe (linhaDeQuemNaoEsta)", /p = porNaPauta\(p, "naoPode", linhaDeQuemNaoEsta\(quem,/.test(pt));
}

sec("4. a furna e a estrada: a luta abre no chão onde se pisa");
{
  t("na furna (o covil do confronto), caverna (era o salão de uma taverna)", cenarioDe({ lugar: { nome: "Molhe Velho", distancia: "dentro" }, cidade: "Ponta Quebrada", covil: true }) === PLANTA_DO_LUGAR.covil && PLANTA_DO_LUGAR.covil === "caverna");
  t("  PAR: o mesmo sítio sem confronto continua o de sempre", cenarioDe({ lugar: { nome: "Molhe Velho", distancia: "dentro" }, cidade: "Ponta Quebrada" }) === "taverna");
  t("  «furna», «covil», «lapa» no nome do sítio já são caverna", cenarioDe({ lugar: { nome: "A Furna do Poço" }, cidade: "x" }) === "caverna");
  t("na estrada por terra numa costa de enseada, estrada (era o convés)", cenarioDe({ emViagem: true, bioma: "enseada", chao: "estrada" }) === "estrada");
  t("  PAR: a rota marítima é convés; sem o chão dito, o bioma de sempre", cenarioDe({ emViagem: true, bioma: "planicie", chao: "maritima" }) === "navio" && cenarioDe({ emViagem: true, bioma: "enseada" }) === "navio");
  t("a fiação: a planta recebe o chão da rota e o covil", /chao: \(jornadaRef\.current && jornadaRef\.current\.terreno\) \|\| "", covil: typeof confrontoEmLutaRef !== "undefined"/.test(app));
}

sec("5. T44: a venda ao mercado do Pátio das Trocas");
{
  const f44 = "vendo a bússola empenada ao mercador do Martelo de Ferro";
  t("sítio que o sistema não acha na planta («?»): não nega a venda (era «O mercador não está aqui para comprar»)", aVendaSemComprador(f44, { pessoas: [], lugar: { tipo: "?" } }) === null && O_VEREDITO_DA_TROCA.tipoDesconhecido.includes("?"));
  t("  PAR: na forja, «ao ferreiro» que não está continua negado (a sessão 11, T33)", !!aVendaSemComprador("vendo a brigantina ao ferreiro", { pessoas: [], lugar: { tipo: "forja" } }));
}

sec("6. T37: tomar o que não se segura é negado antes do dado");
{
  const f37 = "tomo a coragem de Joric e guardo no bolso";
  const it = aIntencaoDaTroca(f37, { grupo: INGRID.grupo });
  t("a intenção é tomar (era nenhuma: só o «da mão» era lido)", it && it.tipo === "tomar" && it.abstrato === true, J(it));
  const v = oVereditoDaTroca(f37, ctxT({ presentes: ["Hilda", "Joric", "Merek o Exilado"] }));
  t("negada, sem dado: «A coragem de Joric não é coisa que se pegue com a mão.» (era Prestidigitação, falhou, «Joric vê a sua mão»)", v && v.estado === "negada" && v.motivo === "naoHa" && v.linha === "✋ A coragem de Joric não é coisa que se pegue com a mão.", J(v));
  const m = Object.freeze({ cena: { pessoas: [{ nome: "Joric" }] }, rola: true, porque: "comoSempre", veredito: { tipo: "teste", id: "bater_carteira" }, chamado: { dc: 15 } });
  const m2 = oMomentoDaTrocaNegada(m, v);
  t("  e o momento não rola", m2.rola === false && m2.chamado === null);
  t("PAR: a adaga da mão de Joric espera o dado", (oVereditoDaTroca("tomo a adaga da mão de Joric e guardo na mochila", ctxT({ presentes: ["Hilda", "Joric"] })) || {}).estado === "pendente");
  t("a tabela do que não se segura", O_VEREDITO_DA_TROCA.naoSeSegura.includes("coragem") && !O_VEREDITO_DA_TROCA.naoSeSegura.includes("adaga"));
}

sec("7. T38: «pego a bolsa… às escondidas» é furto, com dado");
{
  const f38 = "pego a bolsa de moedas de Merek o Exilado às escondidas, enquanto Hilda o distrai com perguntas sobre um mapa";
  const l = lerAcao(f38, { personagem: INGRID });
  t("o catálogo lê a mão leve: Prestidigitação (era turno livre, e a prosa furtou)", l && l.tipo === "teste" && l.id === "bater_carteira" && l.pericia === "prestidigitacao", J(l && { tipo: l.tipo, id: l.id }));
  const it = aIntencaoDaTroca(f38, { grupo: INGRID.grupo });
  t("a intenção é furto, da bolsa", it && it.tipo === "furto" && it.coisa === "bolsa", J(it));
  let v = null;
  for (let i = 0; i < 30 && !v; i++) { const x = oVereditoDaTroca(f38, ctxT({ presentes: ["Hilda", "Joric", "Merek o Exilado"], semente: `s12-${i}`, dado: { passou: true } })); if (x && x.estado === "aplicada") v = x; }
  t("passou: da bolsa de Merek, não da companheira que distrai", v && /de Merek o Exilado/.test(v.linha) && !/Hilda/.test(v.linha), v && v.linha);
  t("PAR: «pego a caneca e bebo» não é furto", (aIntencaoDaTroca("pego a caneca e bebo", { grupo: INGRID.grupo }) || { tipo: null }).tipo !== "furto");
}

sec("8. T54: a ameaça é intimidação, com dado");
{
  const f54 = "ameaço Merek o Exilado: conta quem anda atrás de mim ou eu rasgo todos os seus mapas";
  t("não é procura de pessoa (era «🔎 Merek o Exilado está aqui»)", ehProcura(f54) === false && PROCURA_NAO_E_AMEACA.abre.test("ameaco merek"));
  const l = lerAcao(f54, { personagem: INGRID });
  t("o catálogo: Intimidação", l && l.tipo === "teste" && l.pericia === "intimidacao", J(l && { tipo: l.tipo, pericia: l.pericia }));
  t("PAR: «procuro Merek» continua procura", ehProcura("procuro Merek o Exilado") === true);
}

sec("9. T27, T28: pedir à companheira não é romper com ela");
{
  const f27 = "ataco o que desce ao anoitecer com a rapieira, e peço que Hilda lance um feitiço nele";
  const a = lerAgressao(f27, { presentes: [{ nome: "Hilda" }], grupo: [{ nome: "Hilda" }], conhecidas: [{ nome: "Elemental Menor", ameaca: "comum" }] });
  t("o golpe é na fera, e a Hilda do pedido não é o alvo (era «Hilda viaja com você… romper», sem turno)", a && a.tipo === "agressao" && a.nome === "Elemental Menor", J(a));
  const c = lerAgressao("ataco Hilda com a rapieira", { presentes: [{ nome: "Hilda" }], grupo: [{ nome: "Hilda" }] });
  t("PAR: atacar a Hilda pelo nome continua recusado", c && c.tipo === "companheiro");
  t("  e a recusa não fala do sistema", !/sistema/.test(falaDoCompanheiro(c)) && /todas as letras/.test(falaDoCompanheiro(c)) && A_RECUSA_DO_COMPANHEIRO.linha.includes("{nome}"));
}

sec("10. T51, T50, T33, T53, T6: a prosa contra o fato");
{
  const cena = { pessoas: [{ nome: "Hilda", papel: "bruxa", estados: ["do_grupo"] }, { nome: "Merek o Exilado", papel: "vendedor de mapas" }] };
  /* T51: o fato chegou (aplicarOVereditoDaTroca põe oFatoDaTroca na pauta) — a rede não lia a recusa por «já dei» */
  const r51 = conferirAProsa("Hilda ergue o frasco.\n— Tônico? Já o dei a ti, Ingrid. Não tens memória ou estás a testar a minha?", { frase: "Hilda, me devolve o tônico revigorante", cena, heroi: "Ingrid", posses: [], turno: 51, doSistema: ["🤝 Hilda passa a você: Tônico Revigorante."], troca: { tipo: "companheiro", estado: "aplicada", mudou: [{ coisa: "Tônico Revigorante", de: "Hilda", para: "heroi" }] } });
  t("T51: «Já o dei a ti… Não tens memória» sai (a terceira sessão com a recusa da devolução)", !/Já o dei/.test(r51.narrativa) && r51.podadas.some((p) => p.motivo === "recusa"), r51.narrativa);
  t("  e o fato chega ao Narrador por esta via (o veredito aplicado vai à pauta)", /\{ const fp = oFatoDaTroca\(v\); if \(fp\) porNaPautaDoTurno\(fp\); \}/.test(app));
  const r50 = conferirAProsa("Hilda pega o frasco, tira a rolha e o vira de um gole.\n— Se fui envenenada, morro agradecida.", { frase: "dou o tônico revigorante à Hilda", cena, heroi: "Ingrid", posses: [], turno: 50, doSistema: ["🤝 Tônico Revigorante agora é de Hilda."], troca: { tipo: "dar", estado: "aplicada", mudou: [{ coisa: "Tônico Revigorante", de: "heroi", para: "Hilda" }] } });
  t("T50: a Hilda não bebe o tônico que o sistema só passou à bolsa dela", !/vira de um gole/.test(r50.narrativa) && r50.podadas.some((p) => p.motivo === "consome"), r50.narrativa);
  const r50p = conferirAProsa("Hilda guarda o frasco na bolsa e agradece com um aceno.", { frase: "dou o tônico revigorante à Hilda", cena, heroi: "Ingrid", posses: [], turno: 50, troca: { tipo: "dar", estado: "aplicada", mudou: [{ coisa: "Tônico Revigorante", de: "heroi", para: "Hilda" }] } });
  t("  PAR: guardar o que recebeu fica", r50p.podadas.length === 0, J(r50p.podadas));
  const r33 = conferirAProsa("Merek desenrola o mapa sobre a banca e o empurra na sua direção.\n— O mapa é seu.\nHilda olha por cima do ombro.", { frase: "compro o mapa", cena, heroi: "Ingrid", posses: [], turno: 33, doSistema: ["✋ Qual delas: Mapa de Canal de Sangue (◉ 240) ou Mapa de Mares Quebrados (◉ 195)? Diga o nome inteiro."] });
  t("T33: com a compra que não fechou («Qual delas»), «O mapa é seu» sai (o fato era só veto em NÃO PODE)", !/O mapa é seu/.test(r33.narrativa) && /Hilda olha/.test(r33.narrativa), r33.narrativa);
  const conta = { blefes: [{ id: BLEFE_QUE_O_SUBORNO_PAGA, porque: "o que você pôs na mesa não paga o que está pedindo" }] };
  t("T53: a mesa cala o blefe do suborno pago no sim — e o calado não cai mais na linha de antes («Não contou» antes do sucesso)",
    falaDosBlefesNaMesa(conta, { subornoComQuantia: true }) === null && /falaDosBlefesNaMesa\(v\.social, \{ subornoComQuantia: subornoPago \}\) \|\| "", \(\) => falaDosBlefes\(v\.social\)/.test(app));
  t("  e a frase do T53 é suborno com quantia", !!oSubornoDaFrase("ofereço 10 moedas a Joric para ele esquecer o que viu a minha mão fazer"));
}

sec("11. a fera morta: a carta não oferece levá-la viva, e a pauta o diz");
{
  const q = questPorId("o_que_desce_ao_anoitecer");
  const ops = q.escolhas.destino.opcoes;
  t("«viva, de coleira» e «soltar a besta» precisam da fera viva; «entregar à aldeia» não", ops.coleira.precisaVivo === "fera" && ops.monte.precisaVivo === "fera" && !ops.aldeia.precisaVivo);
  const ctx = { estado: { factos: { pessoas: { "npc|Carrasco": { derrotado: { dia: 1, como: "morto" } } } } }, papeis: { fera: { tipo: "pessoa", id: "npc|Carrasco", nome: "Carrasco Manso" } } };
  t("morreuNaLuta: derrotou e não poupou", morreuNaLuta("fera", ctx) === true);
  const ctxP = { ...ctx, estado: { factos: { pessoas: { "npc|Carrasco": { derrotado: { dia: 1, como: "rendido" } } } } } };
  t("  PAR: a fera rendida (poupada) segue viva — a carta a oferece", morreuNaLuta("fera", ctxP) === false);
  t("a carta filtra pela morte (vereditoDaEscolha) e a pauta de todo turno leva o morto da quest aberta (aMesaDasQuests)",
    /filter\(\(\[, o\]\) => !\(o\.precisaVivo && morreuNaLuta\(o\.precisaVivo, ctx\)\)\)/.test(lerSrc("biblioteca-de-quests.js"))
    && /osMortosDaLuta\(R\.id, R, ctx\)/.test(lerSrc(path.join("motor", "quests-do-turno.js"))) && typeof osMortosDaLuta === "function" && osMortosDaLuta(null, null).length === 0);
}

sec("12. a abertura: a pessoa e o título vêm da quest, em PT-BR");
{
  const a0 = garantirAbertura({ principalId: "mis_principal", cidade: "Ponta Quebrada", chegada: "x", razao: "r", sabe: "Ivarr Barba-Ruiva, taverneiro, é quem…", historia: "h", titulo: "O rasto de Joric",
    pista: { nome: "Ivarr Barba-Ruiva", papel: "taverneiro", local: "Sereia Rouca" }, alvo: { feitio: "procurar", quem: "Joric" } });
  const a1 = aAberturaDaQuest(a0, { titulo: "O Que Desce ao Anoitecer", pessoa: { nome: "Quorin Barba-Ruiva", papel: "estivadora", local: "Gabinete do Prático" } });
  t("o título e a pessoa são os da quest (era «O rasto de Joric» e Ivarr, em Sereia Rouca)", a1.titulo === "O Que Desce ao Anoitecer" && a1.pista.nome === "Quorin Barba-Ruiva" && /^Quorin Barba-Ruiva, estivadora, é quem mais sabe/.test(a1.sabe), J(a1));
  t("  sem quest, a abertura fica como estava", aAberturaDaQuest(a0, null).titulo === "O rasto de Joric" && A_ABERTURA_DA_QUEST.sabe.includes("{nome}"));
  t("as tabelas da abertura em PT-BR («está», «recém-desembarcado», «todo mundo», «rastro»)",
    !/encontra-se/.test(O_QUE_SE_SABE.informante) && !/acabad[oa] de/.test(Object.values(CHEGADAS).join(" ")) && !/toda a gente/.test(HISTORIA_DO_LUGAR.soVocacao) && TITULO_DO_FEITIO.procurar === "O rastro de {quem}");
  t("a fiação: só na criação, com a quest do ato 0", /aberturaMundoRef\.current = aAberturaDaQuest\(ab\.abertura, \{ titulo:/.test(app));
}

sec("13. as sobras: a carta, o balcão");
{
  const est = lerSrc("estilo.js");
  t("o rodapé da carta: «Ou escreva» e «aqui embaixo» (era «Ou escreve», «aqui em baixo»)", /Ou escreva o que você faz — o campo continua aberto/.test(est) && !/Ou escreve o que/.test(est) && /aqui embaixo/.test(est));
  t("a carta da quest: «até a praça» (era «até à»)", /até a praça/.test(questPorId("o_que_desce_ao_anoitecer").escolhas.destino.opcoes.coleira.texto));
  const bb = oBalcaoComoBanca([{ id: "racoes", nome: "Rações de viagem", preco: 5 }, { id: "agua", nome: "Odres de água", preco: 2 }, { id: "tochas", nome: "Tochas", preco: 1 }]);
  const p34 = osPrecosDaPergunta("pergunto à vendedora do balcão de mantimentos quanto custa a ração de viagem e o odre de água", [bb]);
  t("T34: o preço do balcão vai como fato (era «a ração sai pelo justo», sem número)", p34 && p34.acabou[0] === `Perguntei o preço em ${O_BALCAO_COMO_BANCA.nome}: Rações de viagem ◉ 5, Odres de água ◉ 2.`, J(p34));
  t("  a fiação: o balcão entra quando nenhuma banca respondeu", /oBalcaoComoBanca\(balcaoAqui\(cidB\)\)/.test(app));
}

sec("14. a varredura: toda frase de troca da sessão 12 sai com veredito do sistema");
{
  const FICHA12 = { ...INGRID, inventario: ["Bússola empenada (ainda aponta para algo)", "Pente de chifre", "Adaga", "Vela de sebo", "Tônico Revigorante"] };
  const BALCAO = [{ id: "racoes", nome: "Rações de viagem", preco: 5 }, { id: "agua", nome: "Odres de água", preco: 2 }, { id: "tochas", nome: "Tochas", preco: 1 }];
  const BANCAS = [{ id: "martelo", nome: "O Martelo de Ferro", estoque: [{ nome: "Antigo Arco Curto", preco: 30 }, { nome: "Poção de Mana Pequena", preco: 31 }, { nome: "Mapa de Canal de Sangue", preco: 240 }, { nome: "Mapa de Mares Quebrados", preco: 195 }] }];
  const presentes = ["Hilda", "Ulric Coração-de-Ferro", "Quorin Barba-Ruiva", "Joric", "Merek o Exilado"];
  const LONGE = [ULRIC_LONGE, { nome: "Morgane Barba-Ruiva", onde: "Casa do Calafate", morto: false }];
  const aPorta = (frase) => {
    const f0 = FICHA12;
    const bolsa = [...(f0.inventario || []), ...(f0.equipamento || []), ...Object.values(f0.equipados || {})].map((x) => (typeof x === "string" ? x : x.nome));
    const mao = aMaoDaFrase(frase, { chao: [], bolsa });
    if (mao.recusa) return "mão: recusa";
    if (mao.pegar.length) return "mão: apanha";
    if (compraNaFrase(frase, { balcao: BALCAO, bolsa: f0.moedas, temKit: true, bancas: BANCAS })) return "compra";
    if (compraNaBanca(frase, { bancas: BANCAS, bolsa: f0.moedas })) return "banca";
    if (compraSemQuemVenda(frase, { bancas: BANCAS, balcao: BALCAO, comuns: [] })) return "ninguém vende";
    /* quem o sistema sabe noutro lugar — pela mesma decisão do nome dito (quemONomeDiz) */
    const p0 = (frase.match(/\b(Ulric|Morgane)\b/) || [])[1] || "";
    const r = p0 ? quemONomeDiz(oNomeDito(frase, p0) || p0, { aqui: presentes, longe: LONGE }) : null;
    const ausente = r && r.estado === "longe" ? { nome: r.nome, onde: r.onde, morto: false } : null;
    const it = aIntencaoDaTroca(frase, { grupo: f0.grupo });
    const lido = lerAcao(frase, { personagem: f0 });
    const v = oVereditoDaTroca(frase, { ficha: f0, presentes, chao: [], bancas: BANCAS, semente: "varredura", lugar: "aqui", dia: 1, ausente });
    if (v && (v.estado !== "pendente" || (lido && lido.tipo === "teste"))) return `troca: ${v.tipo}`;
    /* o pendente sem teste é decidido sem dado (vereditoDaTrocaAntes: oDadoDaTrocaSemRolar → semDado) */
    if (v && v.estado === "pendente") { const v2 = oVereditoDaTroca(frase, { ficha: f0, presentes, chao: [], bancas: BANCAS, semente: "varredura", lugar: "aqui", dia: 1, ausente, dado: { passou: false, semDado: true } }); if (v2 && v2.estado !== "pendente") return `troca: ${v2.tipo} (sem dado)`; }
    if (oPagamentoDaFrase(frase, { fator: 1, pouso: null, moeda: "moedas" })) return "pagar";
    if (dadivaNaFrase(frase, { pessoas: presentes.map((n) => ({ nome: n, companheiro: n === "Hilda" })), suprimentos: f0.suprimentos })) return "dádiva";
    if (it && it.tipo === "vendaDeUso") return "vender (uso)";
    if (oSubornoDaFrase(frase) && lido && lido.tipo === "teste") return "suborno: dado";
    if (/\bvend/.test(frase.toLowerCase()) && oItemDaFrase(frase, bolsa)) return "vender (bolsa)";
    return "";
  };
  const S12 = [
    "furto a bolsa de Ulric Coração-de-Ferro enquanto Hilda puxa conversa com ele",
    "furto a bolsa de moedas do mercador do Martelo de Ferro enquanto Hilda puxa conversa com ele",
    "furto a bolsa de Hilda quando ela se distrai com o guincho",
    "dou 3 moedas a Quorin Barba-Ruiva pelo que ele viu nas traseiras do gabinete",
    "dou 3 moedas a Ulric Coração-de-Ferro pelo que ele viu do rebanho",
    "vendo o pente de chifre ao mercador do Martelo de Ferro",
    "vendo o pente de chifre a Quorin Barba-Ruiva",
    "vendo a bússola empenada ao ferreiro",
    "dou 5 moedas a Quorin Barba-Ruiva por uma ração de viagem",
    "pago 10 moedas a Morgane Barba-Ruiva para ela me contar tudo o que sabe do poço",
    "levo uma tocha do balcão de mantimentos e pago amanhã, fiado",
    "compro o mapa",
    "tomo a adaga da mão de Joric e guardo na mochila",
    "tomo o escudo de ferro da mão de Merek o Exilado e guardo na mochila",
    "tomo a coragem de Joric e guardo no bolso",
    "pego a bolsa de moedas de Merek o Exilado às escondidas, enquanto Hilda o distrai com perguntas sobre um mapa",
    "furto a bolsa de Merek o Exilado enquanto Hilda o distrai com perguntas sobre um mapa",
    "furto uma moeda da bolsa de Hilda sem que ela perceba",
    "dou 3 moedas a Merek o Exilado pelo que ele ouviu falar de Angra das Gaivotas",
    "dou 3 moedas a Morgane Barba-Ruiva pelo que ela viu no poço",
    "vendo a adaga a Joric",
    "vendo a bússola empenada ao mercador do Martelo de Ferro",
    "vendo a bússola empenada a Merek o Exilado",
    "dou 5 moedas a Joric por uma ração de viagem",
    "peço de graça uma amostra de mapa a Merek o Exilado",
    "Merek, me dá de presente um pedacinho de mapa só para eu olhar",
    "peço de novo a Merek, sem pagar nada, uma amostra de mapa",
    "dou o tônico revigorante à Hilda",
    "Hilda, me devolve o tônico revigorante",
    "Hilda, me dá o gibão de couro que você veste",
    "ofereço 10 moedas a Joric para ele esquecer o que viu a minha mão fazer",
    "vendo a vela de sebo ao mercador da carroça",
  ];
  const portas = S12.map((f) => [f, aPorta(f)]);
  const semPorta = portas.filter(([, p]) => !p).map(([f]) => f);
  t(`sessão 12: ${S12.length - semPorta.length} de ${S12.length} frases de troca com veredito`, semPorta.length === 0, J(semPorta));
  const por = Object.fromEntries(portas);
  t("T38 e T37 saem pelo veredito da troca (furto com dado; tomar negado)", por[S12[15]] === "troca: furto" && por[S12[14]] === "troca: tomar", J([por[S12[15]], por[S12[14]]]));
  t("T42 (Morgane, longe) sai negado pelo veredito; T9 (o Ulric que está) vai ao cartão «Pagar»", por["dou 3 moedas a Morgane Barba-Ruiva pelo que ela viu no poço"] === "troca: pagamento" && por["dou 3 moedas a Ulric Coração-de-Ferro pelo que ele viu do rebanho"] === "pagar", J([por["dou 3 moedas a Morgane Barba-Ruiva pelo que ela viu no poço"], por["dou 3 moedas a Ulric Coração-de-Ferro pelo que ele viu do rebanho"]]));
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
