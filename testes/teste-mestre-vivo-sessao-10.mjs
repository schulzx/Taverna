/* teste-mestre-vivo-sessao-10.mjs (22/11/2026) — a décima sessão do Mestre vivo,
   turno a turno (mente/lancamento/mestre-vivo-sessao-10.md, sobre 8584457).

   A lei do pacote (a pessoa, 21/11): «Tudo pelo sistema, o narrador apenas
   recebe fatos e narra, nada entra por ele.» A sessão mediu 30 de 41 turnos de
   troca com linha, ficha e prosa de acordo, e o lado do SISTEMA ainda errava:
   o «já tentou aqui» aplicava o ganho sem dado, a compra lia mais do que a
   frase, dois itens com a mesma palavra somavam, o escudo do equipamento não
   trocava de mão, o suborno a quem não está passava, e o alvo do furto trocava.
   Cada secção reproduz o turno com a cena da sessão: Ingrid Punho-de-Pedra
   (Arco Curto e Couro Batido vestidos, ◉ 30) com Isolde o Andarilho (Espada
   Curta), na praça de Ponte Brumoso (a banca de ervas do elfo, A Vela
   Silenciosa), na Feira Gorda (Rhogar, Inga) e na Guarnição Perdida (Merek
   Rompe-Escudos). Kael (quem perdeu o rebanho) é conhecido do sistema e está
   noutro lugar.

   Cada caso é a frase da sessão contra a porta que a decide (o módulo puro) e,
   onde a fiação é a causa, contra o App.jsx (a leitura por texto que as suítes
   do veredito da troca já usam). */
import fs from "node:fs";
import path from "node:path";
import {
  O_VEREDITO_DA_TROCA, oVereditoDaTroca, aIntencaoDaTroca, oSubornoDaFrase, oItemDaFrase, oFatoDaTroca, oDadoDaTrocaSemRolar, oCompradorDaFrase,
} from "../src/o-veredito-da-troca.js";
import { compraNaFrase, compraNaBanca, compraSemQuemVenda, dadivaNaFrase, falaDaCompra, vetoDaCompra, FALA_DA_COMPRA_AMBIGUA, LUGAR_DO_MANTIMENTO } from "../src/bolsa-da-frase.js";
import { aMaoDaFrase } from "../src/motor/a-mao-da-frase.js";
import { lerAcao } from "../src/desafios.js";
import { oPagamentoDaFrase } from "../src/motor/o-pagamento-da-frase.js";
import { conferirAProsa } from "../src/motor/o-conferente-da-prosa.js";
import { quemNaoEstaNaCena, pautaDeQuemNaoEsta, QUEM_NAO_ESTA } from "../src/a-ficha-da-cena.js";
import { oMomentoSemOAusente, oQueOMomentoFaz, pautaDoMomento, falaDoCustoNaMesa, falaDosBlefesNaMesa, O_PRECO_NA_CENA, QUEM_NAO_ESTA_NO_MOMENTO, BLEFE_QUE_O_SUBORNO_PAGA, DA_VOZ_DO_HEROI_PARA_VOCE } from "../src/o-mestre-vivo-no-jogo.js";
import { BIBLIOTECA_DE_QUESTS, questPorId } from "../src/biblioteca-de-quests.js";
import { pedidoDaAbertura } from "../src/abertura.js";

let falhas = 0;
const t = (nome, cond, extra) => { if (cond) console.log("  ok:", nome); else { falhas++; console.log("  FALHA:", nome, extra != null ? `→ ${extra}` : ""); } };
const sec = (s) => console.log(`\n[${s}]`);
const J = JSON.stringify;
const app = fs.readFileSync(path.join("..", "src", "App.jsx"), "utf8");

const BALCAO = Object.freeze([{ id: "racoes", nome: "Rações de viagem", preco: 7 }, { id: "agua", nome: "Odres de água", preco: 3 }, { id: "tochas", nome: "Tochas", preco: 1 }]);
const VELA = Object.freeze({ id: "vela", nome: "A Vela Silenciosa", estoque: Object.freeze([{ nome: "Dente", preco: 61 }, { nome: "Clava de Ossos", preco: 88 }, { nome: "Antiga Rapieira", preco: 22 }, { nome: "Diário", preco: 66 }]) });
const BIGORNA = Object.freeze({ id: "bigorna", nome: "A Bigorna do Vigia", estoque: Object.freeze([{ nome: "Rapieira", preco: 88 }, { nome: "Cimitarra", preco: 22 }]) });
const ISOLDE = Object.freeze({ nome: "Isolde o Andarilho", inventario: Object.freeze([]), equipados: Object.freeze({ arma: Object.freeze({ nome: "Espada Curta" }) }) });
const INGRID = Object.freeze({
  nome: "Ingrid Punho-de-Pedra", moedas: 30, inventario: Object.freeze([]), equipamento: Object.freeze([]),
  equipados: Object.freeze({ arma: Object.freeze({ nome: "Arco Curto" }), armadura: Object.freeze({ nome: "Couro Batido" }) }),
  suprimentos: Object.freeze({ racoes: 10, agua: 10, tochas: 5, kit: true }),
  grupo: Object.freeze([ISOLDE]),
});
const FEIRA = ["Rhogar", "Inga", "Isolde o Andarilho"];
const GUARNICAO = ["Merek Rompe-Escudos", "Isolde o Andarilho"];
const KAEL = Object.freeze({ nome: "Kael", onde: "a praça de Ponte Brumoso", morto: false });
const ctx = (extra) => ({ ficha: INGRID, presentes: FEIRA, chao: [], semente: "ponte-brumoso-s10", lugar: "A Feira Gorda", dia: 1, bancas: [VELA, BIGORNA], ...extra });

/* ============================================================ */
sec("1. T29 e T44: o «↺ já tentou aqui» não aplica o ganho; e a primeira tentativa rola");
{
  const f29 = "peço de graça a Rhogar uma amostra das ervas da banca";
  const f44 = "tomo a faca da mão da mulher de avental de farinha e guardo no cinto";
  const jaTentou = { tipo: "jaTentou", chave: "feira|persuasao|rhogar|favor", vezes: 1 };
  /* a régua disse «acontece» (jaTestado) por cima do jaTentou do catálogo: era o sim que aplicava a Maçã seca e a Faca */
  t("o livro manda antes da porta: «jaTentou» com a régua dizendo «acontece» é jaTentou (era «acontece» → aplicada)", oDadoDaTrocaSemRolar("deGraca", "acontece", jaTentou) === "jaTentou" && oDadoDaTrocaSemRolar("tomar", "acontece", { ...jaTentou, chave: "feira|peso" }) === "jaTentou");
  const v29 = oVereditoDaTroca(f29, ctx({ dado: { passou: false, repetida: "jaTentou" } }));
  t("T29: negada, nada entra na mochila (era «🎁 Rhogar lhe dá: Maçã seca»)", v29 && v29.estado === "negada" && v29.motivo === "repetida" && v29.ficha === null && v29.mudou.length === 0, J(v29));
  t("  e sem linha própria: a «↺» que já está na tela basta (nenhuma linha positiva ao lado dela)", v29 && v29.linha === "" && /não deu/.test(v29.fato));
  const v44 = oVereditoDaTroca(f44, ctx({ dado: { passou: false, repetida: "jaTentou" } }));
  t("T44: negada, a Faca não entra (era «✋ Você arranca faca da mão da mulher» + a Faca na mochila)", v44 && v44.estado === "negada" && v44.ficha === null && v44.linha === "", J(v44));
  const feito = oDadoDaTrocaSemRolar("deGraca", "acontece", { tipo: "livre", chave: "x", porque: "Isso você já conseguiu aqui" });
  const vFeito = oVereditoDaTroca("peço de graça a Kael um punhado das ervas dele, para provar", ctx({ presentes: ["Kael", ...FEIRA], dado: { passou: false, repetida: feito } }));
  t("o que já se conseguiu aqui não vem de novo («Isso já lhe deram aqui»)", feito === "jaFeito" && vFeito && vFeito.estado === "negada" && vFeito.linha === O_VEREDITO_DA_TROCA.tela.repetidaFeita.deGraca, J(vFeito && vFeito.linha));
  t("o teste de verdade continua a esperar o dado; sem dado e sem acontecer, o furto e o tomar não houve",
    oDadoDaTrocaSemRolar("furto", "rola", { tipo: "teste" }) === "espera" && oDadoDaTrocaSemRolar("tomar", "hoje", { tipo: "teste" }) === "espera" && oDadoDaTrocaSemRolar("furto", "hoje", null) === "fora" && oDadoDaTrocaSemRolar("deGraca", "hoje", null) === "nao" && oDadoDaTrocaSemRolar("dar", "acontece", null) === "");
  /* por que não rolaram na primeira vez: a chave do livro */
  const k28 = (lerAcao("peço emprestado a Rhogar um odre de água, devolvo amanhã", { personagem: INGRID, chaveFina: true, lugar: "feira" }) || {}).chave;
  const k29 = (lerAcao(f29, { personagem: INGRID, chaveFina: true, lugar: "feira" }) || {}).chave;
  t("T28 → T29: pedir o odre e pedir a amostra são dois pedidos — a coisa vai na chave (era a mesma chave: «pessoa|tamanho»)", k28 && k29 && k28 !== k29 && /odre/.test(k28) && /amostra/.test(k29), `${k28} | ${k29}`);
  const k34 = (lerAcao("tomo o odre vazio da mão de Rhogar e guardo na mochila", { personagem: INGRID, lugar: "feira" }) || {}).chave;
  const k44 = (lerAcao(f44, { personagem: INGRID, lugar: "feira" }) || {}).chave;
  t("T34 → T44: tomar o odre de Rhogar e tomar a faca da mulher são duas tentativas (era «feira|peso», a feira inteira)", k34 && k44 && k34 !== k44 && /faca/.test(k44) && /odre/.test(k34), `${k34} | ${k44}`);
  t("  e as duas rolam (o catálogo ouve Persuasão e Atletismo)", (lerAcao(f29, { personagem: INGRID }) || {}).id === "convencer" && (lerAcao(f44, { personagem: INGRID }) || {}).id === "forcar");
  const corpoV = app.slice(app.indexOf("const vereditoDaTrocaAntes = (acao, m, porta) => {"), app.indexOf("const resolverATrocaDoDado = "));
  t("a fiação: o veredito antes do dado pergunta a oDadoDaTrocaSemRolar com o veredito que a régua julgou (m.veredito)",
    /const qd = oDadoDaTrocaSemRolar\(it\.tipo, porta, vCat\);/.test(corpoV) && /let vCat = \(m && m\.veredito\) \|\| null;/.test(corpoV) && /repetida: qd/.test(corpoV));
}

sec("2. T4: «compro duas tochas do balcão de mantimentos» cobra só as duas tochas");
{
  const c = compraNaFrase("compro duas tochas do balcão de mantimentos", { balcao: BALCAO, bolsa: 23, temKit: true, bancas: [VELA, BIGORNA] });
  t("2 tochas, ◉ 2 (era «2 × Tochas, 3 × Rações de viagem ◉ 23», a bolsa inteira)", c && c.fecha && c.itens.length === 1 && c.itens[0].id === "tochas" && c.itens[0].quantos === 2 && c.total === 2, J(c && c.itens));
  t("a régua do lugar: «do balcão de» antes de «mantimentos» diz onde, não o quê", LUGAR_DO_MANTIMENTO.test("compro duas tochas do balcao de ") && !LUGAR_DO_MANTIMENTO.test("compro duas "));
  t("o recibo diz só o que a frase pediu", /2× Tochas — ◉ 2 \(restam ◉ 21\)/.test(falaDaCompra(c)), falaDaCompra(c));
  t("e comprar mantimentos continua a comprar rações", (compraNaFrase("compro mantimentos para três dias", { balcao: BALCAO, bolsa: 30, temKit: true }) || { itens: [] }).itens.some((x) => x.id === "racoes"));
  t("a vendedora de água não vende água por estar no nome dela: «compro uma tocha da vendedora de água» é uma tocha", (() => { const x = compraNaFrase("compro uma tocha da vendedora de água", { balcao: BALCAO, bolsa: 30, temKit: true }); return x && x.itens.length === 1 && x.itens[0].id === "tochas"; })());
}

sec("3. T5 e T49: duas coisas com a mesma palavra — a do nome inteiro, ou a pergunta");
{
  const c49 = compraNaBanca("compro a rapieira", { bancas: [VELA, BIGORNA], bolsa: 19 });
  t("T49: «a rapieira» pergunta qual, com o preço de cada uma (era «Antiga Rapieira, Rapieira custa ◉ 110»)", c49 && c49.porque === "qual" && c49.itens.length === 0 && c49.total === 0 && c49.ambiguos.length === 2, J(c49));
  const l49 = falaDaCompra(c49);
  t("  a linha: «✋ Qual delas: Antiga Rapieira (◉ 22) ou Rapieira (◉ 88)?»", l49.includes("Antiga Rapieira (◉ 22)") && l49.includes("Rapieira (◉ 88)") && !/110/.test(l49) && l49.startsWith("✋"), l49);
  t("  e o veto: nada se entrega até dizer qual", vetoDaCompra(c49).length === 1 && /ainda não disse qual/.test(vetoDaCompra(c49)[0]));
  const c5 = compraNaBanca("dou 20 moedas ao elfo pela Antiga Rapieira", { bancas: [VELA, BIGORNA], bolsa: 0 });
  t("T5: «pela Antiga Rapieira» é a de ◉ 22 (o nome inteiro ganha da Rapieira que é pedaço dele)", c5 && c5.itens.length === 1 && c5.itens[0].nome === "Antiga Rapieira" && c5.total === 22, J(c5 && c5.itens));
  t("  e a bolsa vazia diz os números certos", /Antiga Rapieira custa ◉ 22, e a bolsa tem ◉ 0/.test(falaDaCompra(c5)), falaDaCompra(c5));
  t("duas coisas de palavras diferentes continuam a ser compradas juntas", (compraNaBanca("compro a clava de ossos e a cimitarra", { bancas: [VELA, BIGORNA], bolsa: 200 }) || { itens: [] }).itens.length === 2);
  t("a pergunta é tabela", FALA_DA_COMPRA_AMBIGUA.tela.includes("{lista}") && !/\{/.test(l49));
  t("a proposta não abre cartão para a pergunta (só a compra que fecha vira cartão)", /c\.fecha && arr\(c\.itens\)\.length/.test(fs.readFileSync(path.join("..", "src", "motor", "a-proposta-da-frase.js"), "utf8")));
}

sec("4. T55 e T15: a troca sem veredito");
{
  const comEscudo = { ...INGRID, moedas: 5, equipamento: [{ nome: "Escudo de Placas", tipo: "escudo" }] };
  const v55 = oVereditoDaTroca("dou o escudo à Isolde", ctx({ ficha: comEscudo, presentes: GUARNICAO }));
  t("T55: o escudo do equipamento sai e entra na bolsa da Isolde (era sem linha, sem ficha, e a prosa entregava)", v55 && v55.estado === "aplicada" && v55.ficha.equipamento.length === 0 && v55.ficha.grupo[0].inventario.some((x) => x.nome === "Escudo de Placas") && /Escudo de Placas agora é de Isolde/.test(v55.linha), J(v55 && v55.linha));
  const vV = oVereditoDaTroca("dou o arco à Isolde", ctx({ ficha: comEscudo, presentes: GUARNICAO }));
  t("o que está vestido não se dá numa frase: «Você usa Arco Curto: tire antes de dar»", vV && vV.estado === "negada" && vV.motivo === "emUso" && vV.ficha === null && /Arco Curto/.test(vV.linha), J(vV && vV.linha));
  const f15 = "ofereço 5 moedas a Kael para ele esquecer que me viu perto da bolsa";
  const cena = { pessoas: [{ nome: "Rhogar", papel: "mercador" }, { nome: "Isolde o Andarilho", papel: "monge", estados: ["do_grupo"] }] };
  const qn = quemNaoEstaNaCena(f15, cena, { ausentes: [KAEL], conhecidos: ["Kael"] });
  t("T15: «ofereço 5 moedas a Kael» — o sistema sabe que Kael não está (o recorte da fala não lia «ofereço … a»)", qn && qn.nome === "Kael", J(qn));
  t("  e o nome que ninguém registrou continua a não ser afirmado ausente", quemNaoEstaNaCena("ofereço 5 moedas a Bertrand para ele esquecer", cena, { ausentes: [KAEL], conhecidos: ["Kael"] }) === null);
  t("  nem quem está em cena", quemNaoEstaNaCena("ofereço 5 moedas a Rhogar para ele esquecer", cena, { ausentes: [KAEL], conhecidos: ["Kael", "Rhogar"] }) === null);
  t("a intenção é suborno", (aIntencaoDaTroca(f15, { grupo: INGRID.grupo }) || {}).tipo === "suborno");
  const v15 = oVereditoDaTroca(f15, ctx({ ausente: qn }));
  t("o veredito: negada, «Kael não está aqui», nenhuma moeda sai (era sem dado, sem linha, e a prosa aceitava)", v15 && v15.estado === "negada" && v15.motivo === "ausente" && v15.ficha === null && /Kael não está aqui/.test(v15.fato), J(v15));
  t("com a pessoa presente o suborno é do dado (o veredito não decide)", oVereditoDaTroca("ofereço 5 moedas a Merek para ele esquecer que me viu perto da bolsa dele", ctx({ presentes: GUARNICAO })) === null && (lerAcao("ofereço 5 moedas a Merek para ele esquecer que me viu perto da bolsa dele", { personagem: INGRID }) || {}).id === "convencer");
  const v41 = oVereditoDaTroca("peço de graça a Kael um punhado das ervas dele, para provar", ctx({ ausente: qn, dado: { acontece: true } }));
  t("T41: o de graça a quem não está também não acontece", v41 && v41.motivo === "ausente" && v41.ficha === null);
}

sec("5. T60: «furto a bolsa de moedas do mercador da Guarnição» é do mercador, não do guarda");
{
  const f = "furto a bolsa de moedas do mercador da Guarnição";
  const merek = { nome: "Merek Rompe-Escudos", papel: "guarda" };
  const nao = oVereditoDaTroca(f, ctx({ presentes: GUARNICAO, alvo: merek, dado: { passou: false } }));
  t("a falha diz a bolsa do mercador (era a de Merek)", nao && /do mercador/.test(nao.fato) && !/Merek/.test(nao.fato), J(nao && nao.fato));
  let sim = null;
  for (let i = 0; i < 40 && !sim; i++) { const v = oVereditoDaTroca(f, ctx({ presentes: GUARNICAO, alvo: merek, semente: `g-${i}`, dado: { passou: true } })); if (v && v.estado === "aplicada") sim = v; }
  t("o sucesso diz «Da bolsa do mercador»", sim && sim.linha.startsWith("🤲 Da bolsa do mercador"), sim && sim.linha);
  const fM = oVereditoDaTroca("furto a bolsa de moedas de Merek enquanto ele olha para o pátio", ctx({ presentes: GUARNICAO, alvo: merek, dado: { passou: false } }));
  t("PAR: «de Merek» continua a ser Merek (o alvo que veio é dito na frase)", fM && /de Merek Rompe-Escudos/.test(fM.fato), fM && fM.fato);
  const fP = oVereditoDaTroca("furto a bolsa do guarda", ctx({ presentes: GUARNICAO, alvo: merek, dado: { passou: false } }));
  t("PAR: «do guarda», com o guarda em cena, é ele (o papel dito casa com o alvo)", fP && /Merek/.test(fP.fato), fP && fP.fato);
}

sec("6. as linhas malformadas");
{
  const v42 = oVereditoDaTroca("peço a Rhogar uma das cordas da banca, de graça", ctx({ dado: { passou: true } }));
  t("T42: «Rhogar não tem cordas para dar» (era «das cordas»)", v42 && v42.linha === "🎁 Rhogar não tem cordas para dar.", v42 && v42.linha);
  const v29 = aIntencaoDaTroca("peço de graça a Rhogar uma amostra das ervas da banca", { grupo: INGRID.grupo });
  t("T29: a coisa pedida é «amostra das ervas» (era «amostra das»)", v29 && v29.coisa === "amostra das ervas", J(v29));
  const v44 = oVereditoDaTroca("tomo a faca da mão da mulher de avental de farinha e guardo no cinto", ctx({ dado: { passou: true } }));
  t("T44 (quando passa): «Você arranca a faca da mão da mulher» (era «arranca faca»)", v44 && v44.linha === "✋ Você arranca a faca da mão da mulher.", v44 && v44.linha);
  const seca = O_PRECO_NA_CENA.furtar.replace("{quem}", "alguém na rua");
  const l20 = falaDoCustoNaMesa({ diz: seca });
  t("T20, T22, T60: «Alguém na rua vê a sua mão» (era «a minha mão», a voz do herói na tela)", l20 === "↯ Alguém na rua vê a sua mão onde ela não devia estar.", l20);
  t("  e o esgueirar: «vê você onde você não devia estar»", falaDoCustoNaMesa({ diz: O_PRECO_NA_CENA.esgueirar.replace("{quem}", "Merek") }) === "↯ Merek vê você onde você não devia estar, e não tira mais os olhos de você.");
  t("  o envelope continua na voz do herói (a tabela não mudou)", /a minha mão/.test(O_PRECO_NA_CENA.furtar) && DA_VOZ_DO_HEROI_PARA_VOCE.length > 0);
  const conta = { blefes: [{ id: BLEFE_QUE_O_SUBORNO_PAGA, porque: "o que você pôs na mesa não paga o que está pedindo" }] };
  t("T16: o suborno com quantia não ouve «o que você pôs na mesa não paga» (a moeda é cobrada no sim)", falaDosBlefesNaMesa(conta, { subornoComQuantia: true }) === null && /não paga/.test(falaDosBlefesNaMesa(conta)));
  t("  a fiação passa a leitura do suborno com quantia", /falaDosBlefesNaMesa\(v\.social, \{ subornoComQuantia: subornoPago \}\)/.test(app));
  t("T10, T32: «vendo a maçã a Rhogar» — quem compra é Rhogar (era «à Vela Silenciosa»)", oCompradorDaFrase("vendo a maçã a Rhogar", [{ nome: "Rhogar", papel: "mercador" }, { nome: "Inga", papel: "feirante" }]) === "Rhogar");
  t("  «vendo duas rações ao elfo», com o elfo em cena pelo papel: «o elfo»", oCompradorDaFrase("vendo duas rações ao elfo", [{ nome: "o elfo", papel: "elfo herbalista" }]) === "o elfo");
  t("  quem não está não compra (fica a banca)", oCompradorDaFrase("vendo a maçã a Kael", [{ nome: "Rhogar", papel: "mercador" }]) === "" && oCompradorDaFrase("vendo a maçã", [{ nome: "Rhogar" }]) === "");
  t("  a fiação: a proposta guarda o comprador, e a venda o usa no nome (o preço e o registro continuam os da banca)",
    /compradorV = oCompradorDaFrase\(acao, pessoasDaCena\(\) \|\| \[\]\)/.test(app) && /quem: compradorV \|\| of\.quem\.nome/.test(app) && /cv\.item === nomeItem && cv\.rotulo \? \{ \.\.\.of, quem: \{ \.\.\.of\.quem, nome: cv\.rotulo \} \}/.test(app) && /cv\.item === id && cv\.rotulo \? \{ \.\.\.of\.quem, nome: cv\.rotulo \}/.test(app));
}

sec("7. T13, T28, T38: quem não está não ouve, não chega e não fala");
{
  const cena = { pessoas: [{ nome: "Rhogar", papel: "mercador" }, { nome: "Isolde o Andarilho", papel: "monge", estados: ["do_grupo"] }] };
  const f38 = "chamo Kael, o vendedor de ervas da praça: venha cá!";
  const qn = quemNaoEstaNaCena(f38, cena, { ausentes: [KAEL], conhecidos: ["Kael"] });
  t("T38: Kael é sabido noutro lugar", qn && qn.nome === "Kael", J(qn));
  const m = Object.freeze({ cena, rola: true, porque: "chama", alvo: "Kael", veredito: { tipo: "teste", id: "convencer" }, chamado: { dc: 14 } });
  const m2 = oMomentoSemOAusente(m, qn);
  t("o momento: não rola, não chama, e não diz «falei com Kael» (era a conversa julgada como se ele ouvisse)", m2.rola === false && m2.chamado === null && !("alvo" in m2) && m2.porque === QUEM_NAO_ESTA_NO_MOMENTO.porque && m2.ausente === qn, J(m2));
  t("  o veredito vira o livre sem chave (o livro de tentativas não ganha uma tentativa que não houve)", m2.veredito.tipo === "livre" && !m2.veredito.chave && oQueOMomentoFaz(m2) === "acontece");
  const pm = pautaDoMomento(m2);
  t("  a pauta do momento não manda a reação para a boca de Kael", pm && !pm.acabou.some((l) => /Kael/.test(l)) && !pm.naoPode.some((l) => /Kael/.test(l)));
  t("  sem ausente, o momento é o mesmo objeto", oMomentoSemOAusente(m, null) === m);
  const pa = pautaDeQuemNaoEsta(qn);
  t("a pauta: ACABOU DE diz que ele não está, e NÃO PODE veta pô-lo em cena (era só a linha de ACABOU DE)", pa && /não está aqui/.test(pa.acabou[0]) && pa.naoPode.length === 1 && pa.naoPode[0] === QUEM_NAO_ESTA.naoPode.replace("{nome}", "Kael"), J(pa));
  t("a fiação: o momento passa por oMomentoSemOAusente com a mesma conta da ficha da cena (quemNaoEstaDaFrase), e a troca leva o ausente",
    /m = oMomentoSemOAusente\(m, quemNaoEstaDaFrase\(acao, m\.cena\)\)/.test(app) && /let qn = m\.ausente \|\| null;/.test(app) && /ausente: \(m && m\.ausente\) \|\| null/.test(app));
}

sec("8. T10: a venda que o cartão fez não é cortada, e nada diz «Nada muda de mão»");
{
  const cena = { pessoas: [{ nome: "Isolde o Andarilho", papel: "monge", estados: ["do_grupo"] }, { nome: "o elfo", papel: "herbalista" }] };
  const prosa = "O elfo pesa as duas trouxas na mão e acena. Estende-lhe um punhado de coroas sem as contar em voz alta. Isolde observa a rua.";
  const base = { frase: "vendo duas rações ao elfo", cena, heroi: "Ingrid", posses: [], pagou: false, entrou: { sabe: true, ganhou: 0, entrou: [] }, turno: 10 };
  const r = conferirAProsa(prosa, { ...base, doSistema: ["🛒 Vendido: 2 rações ao elfo por ◉ 7 (bolsa: ◉ 12)."] });
  t("com a linha da venda no turno: a frase das coroas fica, e nenhuma reposição (era o corte e «Nada muda de mão»)", r.podadas.length === 0 && r.narrativa.includes("punhado de coroas") && !/Nada muda de mão|não chega à sua mão/.test(r.narrativa), J(r.podadas));
  const sem = conferirAProsa(prosa, base);
  t("PAR: sem troca nenhuma no turno, a mesma frase continua a sair (a rede de antes)", sem.podadas.some((p) => p.motivo === "objeto"));
}

sec("9. a prosa contra o fato aplicado: o fato chega, e a rede corta a recusa do companheiro");
{
  const comMaca = { ...INGRID, inventario: [], grupo: [{ ...ISOLDE, inventario: ["Maçã seca"] }] };
  const v31 = oVereditoDaTroca("Isolde, me devolve a maçã", ctx({ ficha: comMaca }));
  t("T31: aplicada pelo sistema antes do Narrador", v31 && v31.estado === "aplicada" && v31.ficha.inventario.includes("Maçã seca"));
  const fp = oFatoDaTroca(v31);
  t("  e o fato vai à pauta, fechado por «nada mais muda de mão»", fp && /Maçã seca/.test(fp.fato[0]) && fp.fato[0].endsWith(O_VEREDITO_DA_TROCA.fatoFecho));
  const cena = { pessoas: [{ nome: "Isolde o Andarilho", papel: "monge", estados: ["do_grupo"] }, { nome: "Rhogar", papel: "mercador" }] };
  const prosa = "Isolde cruza os braços.\n— Agora não. Pediste para guardar. Guardei.\nRhogar ri baixo, contando nozes.";
  const r = conferirAProsa(prosa, { frase: "Isolde, me devolve a maçã", cena, heroi: "Ingrid", posses: ["Maçã seca"], troca: v31, turno: 31 });
  t("a recusa da Isolde sai (era a prosa recusando o «me devolve» que a linha aplicou)", !/Agora não/.test(r.narrativa) && /Rhogar ri baixo/.test(r.narrativa) && r.podadas.some((p) => p.motivo === "recusa"), r.narrativa);
  const ok = conferirAProsa("Isolde tira a maçã da algibeira.\n— Toma. Guarda bem.", { frase: "Isolde, me devolve a maçã", cena, heroi: "Ingrid", posses: ["Maçã seca"], troca: v31, turno: 46 });
  t("PAR: a entrega de acordo fica inteira", ok.podadas.length === 0);
  const v18 = oVereditoDaTroca("Isolde, me entrega o seu escudo de ferro", ctx());
  t("T18: negada (não tem), e o fato também vai à pauta", v18 && v18.estado === "negada" && oFatoDaTroca(v18) && /não me passou nada/.test(oFatoDaTroca(v18).fato[0]));
}

sec("10. o PT-PT: o gancho da quest entra na abertura, e era a segunda pessoa do singular");
{
  const DOIS = /(?<![\p{L}])(?:tu|teu|teus|tua|tuas|ti|contigo|vejas|sabes|vais|vás|queres|tinhas|achavas|quiseres|julgavas|ouviste|fizeste|estiveste|deixaste|roubaste|pediste|vens|gritaste|\p{L}+aste|\p{L}+iste)(?![\p{L}])|\p{L}-te(?![\p{L}])|\p{L}-to(?![\p{L}])|\p{L}-vos(?![\p{L}])/iu;
  const comTu = BIBLIOTECA_DE_QUESTS.filter((q) => q && typeof q.gancho === "string" && DOIS.test(q.gancho)).map((q) => q.id);
  t(`nenhum gancho da biblioteca fala com «tu» (eram 24) — ${BIBLIOTECA_DE_QUESTS.length} quests`, comTu.length === 0, J(comTu));
  const q = questPorId("o_que_desce_ao_anoitecer");
  const textos = JSON.stringify(q);
  t("a quest da sessão («O Que Desce ao Anoitecer») inteira sem a segunda pessoa do singular", q && !DOIS.test(textos), (textos.match(DOIS) || [])[0]);
  const pedido = pedidoDaAbertura({ pista: { nome: "Kael", local: "a praça" }, razao: "r", sabe: "s", chegada: "à praça", historia: "h" }, { quest: { gancho: q.gancho, passo: "Ver o que ficou na praça" } });
  t("o pedido da abertura com o gancho dela pede a 2ª pessoa «você» e não carrega «vejas com os teus olhos»", /"você"/.test(pedido) && !/vejas|teus olhos/.test(pedido) && /você veja com os próprios olhos/.test(pedido), pedido.slice(0, 200));
}

sec("11. a varredura: toda frase de troca da sessão 10 sai com veredito do sistema");
{
  const ISOLDE10 = { ...ISOLDE, inventario: ["Maçã seca", "Faca"] };
  const FICHA10 = { ...INGRID, moedas: 19, inventario: ["Maçã seca", "Faca"], equipamento: [{ nome: "Escudo de Placas", tipo: "escudo" }], grupo: [ISOLDE10] };
  const CENA10 = { ficha: FICHA10, presentes: ["Rhogar", "Inga", "Merek Rompe-Escudos", "Isolde o Andarilho"], bancas: [VELA, BIGORNA], chao: [{ id: "e", nome: "Escudo de Placas" }], ausente: KAEL };
  /* a mesma régua da suíte da sessão 9 (a porta que decide a frase, na ordem do turno), com quem o sistema sabe noutro lugar */
  const aPorta = (frase, cena) => {
    const f0 = cena.ficha;
    const bolsa = [...(f0.inventario || []), ...(f0.equipamento || []), ...Object.values(f0.equipados || {})].map((x) => (typeof x === "string" ? x : x.nome));
    const mao = aMaoDaFrase(frase, { chao: cena.chao || [], bolsa });
    if (mao.recusa) return "mão: recusa";
    if (mao.pegar.length) return "mão: apanha";
    if (compraNaFrase(frase, { balcao: BALCAO, bolsa: f0.moedas, temKit: true, bancas: cena.bancas })) return "compra";
    if (compraNaBanca(frase, { bancas: cena.bancas, bolsa: f0.moedas })) return "banca";
    if (compraSemQuemVenda(frase, { bancas: cena.bancas, balcao: BALCAO, comuns: [] })) return "ninguém vende";
    if (oPagamentoDaFrase(frase, { fator: 1, pouso: null, moeda: "moedas" })) return "pagar";
    if (dadivaNaFrase(frase, { pessoas: cena.presentes.map((n) => ({ nome: n, companheiro: (f0.grupo || []).some((g) => g.nome === n) })), suprimentos: f0.suprimentos })) return "dádiva";
    const it = aIntencaoDaTroca(frase, { grupo: f0.grupo });
    if (it && it.tipo === "vendaDeUso") return "vender (uso)";
    const lido = lerAcao(frase, { personagem: f0 });
    const ausente = new RegExp(`\\b${cena.ausente.nome}\\b`).test(frase) ? cena.ausente : null;
    const v = oVereditoDaTroca(frase, { ficha: f0, presentes: cena.presentes, chao: (cena.chao || []).map((x) => x.nome), bancas: cena.bancas, semente: "varredura", lugar: "aqui", dia: 1, ausente });
    if (v && (v.estado !== "pendente" || (lido && lido.tipo === "teste"))) return `troca: ${v.tipo}`;
    if (oSubornoDaFrase(frase) && lido && lido.tipo === "teste") return "suborno: dado";
    if (/\bvend/.test(frase.toLowerCase()) && oItemDaFrase(frase, bolsa)) return "vender (bolsa)";
    return "";
  };
  const S10 = [
    "dou 7 moedas ao elfo da banca por uma ração de viagem", "compro duas tochas do balcão de mantimentos", "dou 20 moedas ao elfo pela Antiga Rapieira",
    "furto a bolsa de moedas do elfo da banca sem que ele perceba", "levo um odre de água do balcão e pago amanhã, fiado", "Isolde, paga uma caneca de hidromel para mim na estalagem",
    "vendo o couro ao elfo da banca", "vendo duas rações ao elfo", "vendo a minha espada longa ao elfo", "vendo duas tochas ao elfo",
    "ofereço 3 moedas ao elfo para ele ficar calado sobre a bolsa", "ofereço 5 moedas a Kael para ele esquecer que me viu perto da bolsa", "ofereço 4 moedas ao vendedor para ele não gritar ladrão",
    "Isolde, me entrega a sua espada curta", "Isolde, me entrega o seu escudo de ferro", "furto a bolsa de moedas da velha das lentilhas",
    "furto a bolsa de moedas do homem de capa da mesa dos fundos", "furto a bolsa de moedas de uma das carroceiras", "dou 14 moedas a Rhogar por duas rações de viagem",
    "furto a bolsa de moedas de Rhogar enquanto ele olha para a porta", "peço emprestado a Rhogar um odre de água, devolvo amanhã", "peço de graça a Rhogar uma amostra das ervas da banca",
    "dou a maçã à Isolde", "Isolde, me devolve a maçã", "vendo a maçã a Rhogar", "Isolde, me dá cinco moedas da sua bolsa", "tomo o odre vazio da mão de Rhogar e guardo na mochila",
    "peço de graça a Kael um punhado das ervas dele, para provar", "peço a Rhogar uma das cordas da banca, de graça", "peço emprestado a Kael o cavalo branco dele",
    "tomo a faca da mão da mulher de avental de farinha e guardo no cinto", "dou a faca à Isolde", "Isolde, me devolve a faca, por favor", "vendo o arco a Rhogar", "vendo a faca a Rhogar",
    "compro a rapieira", "pego o escudo de placas do chão e guardo na mochila", "furto a bolsa de moedas de Merek enquanto ele olha para o pátio", "dou 14 moedas ao mercador por duas rações de viagem",
    "dou o escudo à Isolde", "Isolde, me devolve o escudo", "vendo o escudo a Merek", "ofereço 5 moedas a Merek para ele esquecer que me viu perto da bolsa dele", "furto a bolsa de moedas do mercador da Guarnição",
  ];
  const portas = S10.map((f) => [f, aPorta(f, CENA10)]);
  const sem = portas.filter(([, p]) => !p).map(([f]) => f);
  t(`sessão 10: ${S10.length - sem.length} de ${S10.length} frases de troca com veredito`, sem.length === 0, J(sem));
  const porFrase = Object.fromEntries(portas);
  t("T55 sai pelo veredito da troca (era nenhuma porta)", porFrase["dou o escudo à Isolde"] === "troca: dar", porFrase["dou o escudo à Isolde"]);
  t("T15 sai pelo veredito da troca, com quem não está (era o dado do catálogo, ou nada)", porFrase["ofereço 5 moedas a Kael para ele esquecer que me viu perto da bolsa"] === "troca: suborno");
  t("T49 sai pela banca (a pergunta)", porFrase["compro a rapieira"] === "banca");
}

sec("12. a carta da quest que nunca abriu: a memória do quadro só guarda a carta virada pelo dado");
{
  const qq = fs.readFileSync(path.join("..", "src", "quadro-da-quest.js"), "utf8");
  /* não é defeito: `quadro.cartas` no save é a memória (o que virou limpa ou com preço, por um dado contra o juiz da carta); a carta
     que vira pela verdade do livro («esteve», «conversou») não grava memória, e a sessão nunca rolou contra a pessoa da carta (Kael, ausente) */
  t("a carta essencial vira pela verdade do livro sem passar pela memória (est = virada por `verdade`)", /const est = m && m\.como === "preco" \? "preco" : \(m && m\.como === "limpa"\) \|\| verdade \? "virada" : "costas";/.test(qq));
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
