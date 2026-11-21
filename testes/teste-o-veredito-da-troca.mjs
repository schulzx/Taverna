/* teste-o-veredito-da-troca.mjs (21/11/2026) — a troca sai decidida antes do
   Narrador (mente/lancamento/mestre-vivo-sessao-8.md; a ordem da pessoa:
   «Tudo pelo sistema, o narrador apenas recebe fatos e narra»).

   A cena da sessão: Quilla (gnoma ladina, Espada Curta e Gibão de Couro
   vestidos, ◉ 15, 10 rações, 10 odres, 5 tochas) com Helga (a irmã, do grupo),
   no largo do Andar 1 das Cinzas e no Pátio dos Restos (Freya, Fenna, Lucan).

   Três metades:
     1. as leituras e o veredito (src/o-veredito-da-troca.js) e as portas que as
        usam (bolsa-da-frase, a mão da frase, o pagamento, o catálogo);
     2. o conferente contra o veredito (o-conferente-da-prosa.js);
     3. a fiação (App.jsx): o veredito aplica pela porta da ficha viva, antes do
        Narrador, e chega à pauta do turno. */
import fs from "node:fs";
import path from "node:path";
import {
  O_VEREDITO_DA_TROCA, aCompraPorMoeda, oSubornoDaFrase, oFiadoDaFrase, aIntencaoDaTroca, oVereditoDaTroca,
  oButimDoFurto, aVendaDoUso, nomeiaOItem, O_TEXTO_DA_VENDA_DE_USO, aBuscaSemAchado,
} from "../src/o-veredito-da-troca.js";
import { compraNaBanca, compraNaFrase, dadivaNaFrase } from "../src/bolsa-da-frase.js";
import { aMaoDaFrase } from "../src/motor/a-mao-da-frase.js";
import { oPagamentoDaFrase } from "../src/motor/o-pagamento-da-frase.js";
import { lerAcao } from "../src/desafios.js";
import { conferirAProsa, aBolsaAgora, oQueEntrou } from "../src/motor/o-conferente-da-prosa.js";
import { PERGUNTA_DO_CAMINHO } from "../src/motor/preludio-do-turno.js";
import { alavancasNaMesa } from "../src/social.js";

let falhas = 0;
const t = (nome, cond, extra) => { if (cond) console.log("  ok:", nome); else { falhas++; console.log("  FALHA:", nome, extra != null ? `→ ${extra}` : ""); } };
const sec = (s) => console.log(`\n[${s}]`);
const J = JSON.stringify;
const app = fs.readFileSync(path.join("..", "src", "App.jsx"), "utf8");

const QUILLA = Object.freeze({
  nome: "Quilla", moedas: 15, inventario: Object.freeze([]), equipamento: Object.freeze([]),
  equipados: Object.freeze({ arma: Object.freeze({ nome: "Espada Curta" }), armadura: Object.freeze({ nome: "Gibão de Couro" }) }),
  suprimentos: Object.freeze({ racoes: 10, agua: 10, tochas: 5, kit: true }),
  grupo: Object.freeze([Object.freeze({ nome: "Helga", inventario: Object.freeze([]) })]),
});
const PRESENTES = ["Freya Punho-de-Pedra", "Fenna Olho-de-Corvo", "Lucan", "Helga"];
const CALICE = { id: "m1", nome: "O Cálice Silencioso", estoque: [
  { nome: "Antídoto", preco: 17, tipo: "consumivel" }, { nome: "Ataduras de Linho", preco: 3, tipo: "consumivel" },
  { nome: "Sais Aromáticos", preco: 19, tipo: "consumivel" },
] };
const BALCAO = [{ id: "racoes", nome: "Rações de viagem", preco: 5 }, { id: "agua", nome: "Odres de água", preco: 1 }, { id: "tochas", nome: "Tochas", preco: 1 }];
const ctxBase = (extra) => ({ ficha: QUILLA, presentes: PRESENTES, chao: [], semente: "torre-s8", lugar: "Pátio dos Restos", dia: 2, ...extra });

sec("1. «dou N moedas ao vendedor por X» é compra (as quatro frases que não viraram turno, e o T6)");
{
  const QUATRO = [
    ["dou duas moedas ao vendedor pelos sais aromáticos", 2, "Sais Aromáticos", "sem_fundos"],
    ["dou quatro moedas ao vendedor por um antídoto", 4, "Antídoto", "sem_fundos"],
    ["dou três moedas à mulher do Cálice pelas ataduras de linho", 3, "Ataduras de Linho", ""],
    ["dou três moedas ao vendedor pelas ataduras de linho", 3, "Ataduras de Linho", ""],
  ];
  for (const [f, q, item, porque] of QUATRO) {
    const cp = aCompraPorMoeda(f);
    t(`«${f}»: lida como compra, quantia ${q}`, cp && cp.quantia === q, J(cp));
    const mao = aMaoDaFrase(f, { chao: [], bolsa: ["Espada Curta", "Gibão de Couro"] });
    t(`  a mão da frase não recusa «não há o que entregar» (era a linha crua da sessão)`, mao.recusa === null, mao.recusa && mao.recusa.linha);
    t(`  o cartão «Pagar» não abre (cobrava sem dar a coisa, T6)`, oPagamentoDaFrase(f, { fator: 1, pouso: null, moeda: "moedas" }) === null);
    const c = compraNaBanca(f, { bancas: [CALICE], bolsa: 15 });
    t(`  a banca vende ${item} pelo preço dela${porque ? `, e diz que não chega (${porque})` : ", e fecha"}`, c && c.itens.length === 1 && c.itens[0].nome === item && (porque ? c.porque === porque && !c.fecha : c.fecha === true && c.total === 3), J(c && { itens: c.itens.map((x) => x.nome), porque: c.porque, fecha: c.fecha }));
  }
  const pouco = compraNaBanca("dou duas moedas ao vendedor pelas ataduras de linho", { bancas: [CALICE], bolsa: 15 });
  t("a quantia dita é teto: ◉ 2 não paga ataduras de ◉ 3 (o vendedor diz o preço)", pouco && !pouco.fecha && pouco.porque === "pouco" && pouco.declarado === 2, J(pouco && pouco.porque));
  t("«por favor» não é compra", aCompraPorMoeda("dou duas moedas ao guarda, por favor") === null);
  t("«dou dois passos pela rua» não é compra", aCompraPorMoeda("dou dois passos pela rua") === null);
  t("«ponho duas moedas no balcão pela caneca» continua a ser o pagamento de taverna", aCompraPorMoeda("Ponho duas moedas no balcão pela caneca") !== null);
}

sec("2. T61: «dou uma moeda a Lucan por um odre de água» — o odre vem, não vai");
{
  const f = "dou uma moeda a Lucan por um odre de água";
  const d = dadivaNaFrase(f, { pessoas: [{ nome: "Lucan", companheiro: false }], suprimentos: { racoes: 10, agua: 10, tochas: 5 } });
  t("não é dádiva (a linha «1 odre de água para Lucan» tirava o odre do herói)", d === null, J(d));
  const c = compraNaFrase(f, { balcao: BALCAO, bolsa: 20, temKit: true });
  t("é compra de 1 odre ao preço do balcão, e fecha", c && c.fecha && c.itens.length === 1 && c.itens[0].id === "agua" && c.itens[0].quantos === 1 && c.total === 1, J(c));
  t("o cartão «Pagar» não cobra por fora", oPagamentoDaFrase(f, { fator: 1, pouso: null, moeda: "moedas" }) === null);
}

sec("3. T48: o suborno com quantia dita é conversa com dado, não cartão");
{
  const f = "ofereço duas moedas a Freya para ela fingir que não me viu passar pelo portal fechado";
  t("lido como suborno", oSubornoDaFrase(f) === true);
  t("e não como compra do «portal fechado»", aCompraPorMoeda(f) === null);
  t("o cartão «Pagar» não abre antes do dado", oPagamentoDaFrase(f, { fator: 1, pouso: null, moeda: "moedas" }) === null);
  const v = lerAcao(f, {});
  t("o catálogo ouve Persuasão (convencer)", v && v.tipo === "teste" && v.id === "convencer", J(v && v.id));
  t("a frase sem turno, «cinco moedas a Fenna para fechar os olhos», também", oSubornoDaFrase("ofereço cinco moedas a Fenna para ela fechar os olhos e me deixar passar pelo portal"));
  t("pagar a sopa não é suborno", !oSubornoDaFrase("pago duas moedas pela sopa"));
}

sec("4. o fiado não se paga hoje, e não se fia");
{
  const f = "quero um pão fiado, pago amanhã";
  t("lido como fiado", oFiadoDaFrase(f));
  t("o cartão «Pagar ◉ 1» não abre (a sessão 7 e a 8 o abriram)", oPagamentoDaFrase(f, { fator: 1, pouso: null, moeda: "moedas" }) === null);
  const v = oVereditoDaTroca(f, ctxBase());
  t("negado, com a fala da mesa, e o fato na pauta", v && v.estado === "negada" && v.linha === O_VEREDITO_DA_TROCA.tela.fiado && /fiado/.test(v.fato) && v.veto.length === 1, J(v));
}

sec("5. T15: pedir de graça a um figurante pede dado, e o dado decide");
{
  const f = "peço ao tiefling do portal uma amostra do que ele tem, de graça";
  const lida = lerAcao(f, {});
  t("o catálogo ouve Persuasão (era sem dado, e a prosa entregava sal e um dente)", lida && lida.tipo === "teste" && lida.id === "convencer", J(lida && lida.id));
  const it = aIntencaoDaTroca(f, { grupo: QUILLA.grupo });
  t("a intenção é «de graça»", it && it.tipo === "deGraca", J(it));
  const pend = oVereditoDaTroca(f, ctxBase({ alvo: { nome: "o tiefling" } }));
  t("sem o dado, o veredito espera", pend && pend.estado === "pendente");
  const sim = oVereditoDaTroca(f, ctxBase({ alvo: { nome: "o tiefling" }, dado: { passou: true } }));
  t("passou: uma coisa pequena da tabela entra na mochila, com o nome dela na linha e no fato", sim && sim.estado === "aplicada" && sim.ficha.inventario.length === 1 && O_VEREDITO_DA_TROCA.amostras.includes(sim.ficha.inventario[0]) && sim.linha.includes(sim.ficha.inventario[0]) && sim.fato.includes(sim.ficha.inventario[0]), J(sim && sim.linha));
  const sim2 = oVereditoDaTroca(f, ctxBase({ alvo: { nome: "o tiefling" }, dado: { passou: true } }));
  t("a mesma semente dá a mesma coisa", sim2 && sim2.ficha.inventario[0] === sim.ficha.inventario[0]);
  t("a ficha de antes não foi mexida", QUILLA.inventario.length === 0);
  const nao = oVereditoDaTroca(f, ctxBase({ alvo: { nome: "o tiefling" }, dado: { passou: false } }));
  t("falhou: nada entra, e o fato diz que nada mudou de mão", nao && nao.estado === "negada" && nao.ficha === null && /nada/.test(nao.fato));
  const copo = oVereditoDaTroca("regateio com a vendedora de água: um copo de graça, para provar", ctxBase({ alvo: { nome: "Lucan" }, dado: { passou: true } }));
  t("T16: o copo para provar bebe-se ali — nada vai para a mochila", copo && copo.estado === "negada" && copo.motivo === "ali", J(copo && copo.motivo));
  const caro = oVereditoDaTroca("peço à mulher do Cálice um antídoto de graça", ctxBase({ alvo: { nome: "a mulher do Cálice" }, bancas: [CALICE], dado: { passou: true } }));
  t("o estoque caro não se dá de graça (◉ 17)", caro && caro.estado === "negada" && caro.motivo === "caro" && caro.linha.includes("17"), J(caro && caro.linha));
}

sec("6. T33: o furto que passou rende o que o sistema diz — e só isso");
{
  const f = "furto a bolsa de moedas de Freya sem que ela perceba";
  const it = aIntencaoDaTroca(f, { grupo: QUILLA.grupo });
  t("a intenção é furto", it && it.tipo === "furto", J(it));
  t("«me esgueiro furtivamente» não é furto", aIntencaoDaTroca("me esgueiro furtivamente até a porta", {}) === null);
  const ctx = ctxBase({ alvo: { nome: "Freya Punho-de-Pedra", papel: "carpinteira" } });
  t("sem o dado, espera", oVereditoDaTroca(f, ctx).estado === "pendente");
  /* procura uma semente que renda e uma que venha vazia: a tabela tem os dois */
  let rende = null, vazia = null;
  for (let i = 0; i < 40 && (!rende || !vazia); i++) {
    const v = oVereditoDaTroca(f, { ...ctx, semente: `torre-${i}`, dado: { passou: true } });
    if (v.estado === "aplicada" && !rende) rende = v;
    if (v.estado === "negada" && v.motivo === "vazia" && !vazia) vazia = v;
  }
  t("passou e rendeu: as moedas entram na bolsa, e a linha diz a bolsa nova", rende && rende.ficha.moedas > 15 && rende.linha.includes(`◉ ${rende.ficha.moedas}`) && rende.mudou.some((x) => x.coisa === "moedas"), J(rende && rende.linha));
  t("o fato diz o ganho exato («use exatamente isto»)", rende && /exatamente/.test(rende.fato));
  t("passou e veio vazia: «a bolsa estava quase vazia», e nada entra", vazia && vazia.ficha === null && /quase vazia/.test(vazia.linha), J(vazia && vazia.linha));
  const a = oButimDoFurto({ semente: "x", alvo: { nome: "Freya", papel: "carpinteira" }, lugar: "Pátio", dia: 3 });
  const b = oButimDoFurto({ semente: "x", alvo: { nome: "Freya", papel: "carpinteira" }, lugar: "Pátio", dia: 3 });
  t("a mesma semente dá o mesmo butim", J(a) === J(b));
  const T = O_VEREDITO_DA_TROCA.butim;
  let ok = true;
  for (let i = 0; i < 200; i++) { const x = oButimDoFurto({ semente: `s${i}`, alvo: { nome: "Bram", papel: "mercador" } }); if (!x.nada && (x.moedas < T.abastado.min || x.moedas > T.abastado.max)) ok = false; }
  t("o butim do mercador fica dentro da faixa da tabela", ok);
  const falhou = oVereditoDaTroca(f, { ...ctx, dado: { passou: false } });
  t("falhou: nada sai do bolso dela, e o fato o diz", falhou.estado === "negada" && falhou.motivo === "falhou" && /falhou/.test(falhou.fato));
  const anel = oVereditoDaTroca("furto o anel dela", { ...ctx, intencao: { tipo: "furto", coisa: "anel" }, dado: { passou: true } });
  t("a coisa dita entra com o nome da tabela, ou não estava lá", anel && (anel.estado === "aplicada" ? anel.ficha.inventario.includes("Anel de latão") : anel.motivo === "semACoisa"), J(anel && anel.linha));
}

sec("7. T19, T57, T58: guardar o que só a prosa pôs na cena não entra; o que é de alguém é furto");
{
  for (const [n, f] of [[19, "pego a lâmina de podão do barril e guardo na mochila"], [57, "pego a corda curta do caixote e guardo na mochila"], [58, "guardo o pedaço de espelho lascado no bolso"]]) {
    const v = oVereditoDaTroca(f, ctxBase());
    t(`T${n}: negado, a linha da mesa e o fato com a coisa`, v && v.estado === "negada" && v.motivo === "inventado" && O_VEREDITO_DA_TROCA.tela.pegarInventado.includes(v.linha) && v.fato.includes("não guardei"), J(v && v.fato));
  }
  const tabua = oVereditoDaTroca("pego uma das tábuas de Freya e guardo na mochila", ctxBase());
  t("T29: as tábuas de Freya são dela — levar sem pedir é furto", tabua && tabua.motivo === "dono" && tabua.linha.includes("Freya") && tabua.fato.includes("«tábuas»"), J(tabua && tabua.linha));
  t("o que está no chão é da mão da frase (o veredito não se mete)", oVereditoDaTroca("pego o martelo de batalha do chão e guardo na mochila", ctxBase({ chao: ["Rústico Martelo de Batalha"] })) === null);
  t("o que já está na bolsa não é troca", oVereditoDaTroca("guardo a espada curta na bainha e na mochila", ctxBase()) === null);
  t("«pego a caneca e bebo» não é guardar", aIntencaoDaTroca("pego a caneca e bebo", {}) === null);
}

sec("8. T30: vender o que é de uso");
{
  const it = aIntencaoDaTroca("vendo duas rações à vendedora de água", { grupo: [] });
  t("lida: 2 rações", it && it.tipo === "vendaDeUso" && it.id === "racoes" && it.quantos === 2, J(it));
  const r = aVendaDoUso(QUILLA, { id: "racoes", quantos: 2, preco: 5, quem: { nome: "O Cálice Silencioso" } });
  t("vende: −2 rações, +◉ 5 (metade do balcão), a linha na forma da venda", r.ok && r.ficha.suprimentos.racoes === 8 && r.ficha.moedas === 20 && r.linha.startsWith("🛒 Vendido: 2 rações"), J(r.linha));
  t("a ficha de antes não foi mexida", QUILLA.suprimentos.racoes === 10 && QUILLA.moedas === 15);
  const sem = aVendaDoUso(QUILLA, { id: "racoes", quantos: 2, preco: 5, quem: null, motivo: "ninguém aqui lida com isso" });
  t("sem comprador, a linha diz por quê", !sem.ok && sem.ficha === QUILLA && sem.linha.includes("ninguém aqui lida com isso"), sem.linha);
  const falta = aVendaDoUso(QUILLA, { id: "tochas", quantos: 9, preco: 1, quem: { nome: "x" } });
  t("mais do que tem: diz quanto tem", !falta.ok && falta.linha.includes("5"), falta.linha);
  t("T46: o que está vestido diz por que não vai à banca", /desequipe/.test(O_TEXTO_DA_VENDA_DE_USO.emUso));
  t("o martelo encurtado é o «Rústico Martelo de Batalha»", nomeiaOItem("vendo o martelo de batalha ao Eamon", "Rústico Martelo de Batalha"));
  t("«curta» sozinha não é a Espada Curta", !nomeiaOItem("pego a corda curta", "Espada Curta"));
  const mao = aMaoDaFrase("vendo o martelo de batalha ao Eamon", { chao: [], bolsa: ["Rústico Martelo de Batalha"] });
  t("a mão da frase não diz «Isso não está na sua bolsa» (o «o» era lido como pronome)", mao.recusa === null, mao.recusa && mao.recusa.linha);
}

sec("9. T9, T10, T12, T13: o companheiro dá o que tem — moeda à parte ele não tem");
{
  for (const [n, f, motivo] of [
    [9, "peço a Helga que pague uma caneca de hidromel para mim", "semMoeda"],
    [10, "peço a Helga que me dê uma das tochas dela", "uso"],
    [12, "Helga, me empresta cinco moedas da sua bolsa", "semMoeda"],
    [13, "peço a Helga que compre um pedaço de pão da banca com o dinheiro dela", "semMoeda"],
  ]) {
    const v = oVereditoDaTroca(f, ctxBase());
    t(`T${n}: negado (${motivo}), com a fala da mesa e «nada mudou de mão» na pauta`, v && v.tipo === "companheiro" && v.estado === "negada" && v.motivo === motivo && /Nada mudou de mão/.test(v.fato), J(v && v.linha));
  }
  t("T11: a opinião não é troca", aIntencaoDaTroca("pergunto a Helga o que ela acha da Freya", { grupo: QUILLA.grupo }) === null);
  t("«me ajude a dar um jeito» não é troca", aIntencaoDaTroca("peço a Helga que me ajude a dar um jeito", { grupo: QUILLA.grupo }) === null);
  const comPocao = { ...QUILLA, grupo: [{ nome: "Helga", inventario: [{ nome: "Poção de Cura" }] }] };
  const v = oVereditoDaTroca("peço a Helga que me dê a poção de cura", { ...ctxBase(), ficha: comPocao });
  t("o que ela tem passa de verdade: sai da bolsa dela, entra na sua", v && v.estado === "aplicada" && v.ficha.grupo[0].inventario.length === 0 && v.ficha.inventario.some((x) => x.nome === "Poção de Cura"), J(v && v.mudou));
  t("e a ficha de antes fica", comPocao.grupo[0].inventario.length === 1);
}

sec("10. a busca que não achou diz ao Narrador que ali não há o que se leve (T18)");
{
  const b = aBuscaSemAchado({ id: "buscar" }, { achou: false });
  t("o fato e o veto, para a pauta do turno", b && b.acabou.length === 1 && b.naoPode.length === 1 && /nada que se leve/.test(b.acabou[0]));
  t("a busca que achou não leva veto", aBuscaSemAchado({ id: "buscar" }, { achou: true }) === null);
  t("outro desafio, nada", aBuscaSemAchado({ id: "escalar" }, {}) === null);
}

sec("11. o conferente confere contra o veredito");
{
  const cena = { pessoas: [{ nome: "Helga", papel: "irmã", estados: ["do_grupo"] }, { nome: "Freya Punho-de-Pedra", papel: "carpinteira" }, { nome: "Lucan", papel: "vendedora de água" }, { nome: "Fenna Olho-de-Corvo", papel: "trocadora" }] };
  const b0 = aBolsaAgora(QUILLA);
  const conf = (frase, prosa, extra = {}) => conferirAProsa(prosa, { frase, cena, heroi: "Quilla", turno: 20, falas: {}, entrou: oQueEntrou(b0, aBolsaAgora(extra.depois || QUILLA)), posses: [], ...extra });
  const f19 = "pego a lâmina de podão do barril e guardo na mochila";
  const r19 = conf(f19, "Você pega a lâmina de podão do fundo do barril. A seiva seca gruda nos dedos. A lâmina cabe na mochila, torta e úmida. Lucan não olha.", { troca: oVereditoDaTroca(f19, ctxBase()) });
  t("T19: o resíduo «A lâmina cabe na mochila» sai (ficava ao lado de «Nada muda de mão»)", !/cabe na mochila/.test(r19.narrativa) && !/Nada muda de m/.test(r19.narrativa), r19.narrativa);
  t("T19: o gesto que não guarda fica", /seiva seca/.test(r19.narrativa));
  const f57 = "pego a corda curta do caixote e guardo na mochila";
  const r57 = conf(f57, "Você puxa a corda do caixote. A corda curta some no fundo da mochila. Freya ergue o queixo.", { troca: oVereditoDaTroca(f57, ctxBase()) });
  t("T57: «some no fundo da mochila» sai", !/fundo da mochila/.test(r57.narrativa), r57.narrativa);
  const f33 = "furto a bolsa de moedas de Freya sem que ela perceba";
  let vazia = null;
  for (let i = 0; i < 40 && !vazia; i++) { const v = oVereditoDaTroca(f33, ctxBase({ semente: `torre-${i}`, alvo: { nome: "Freya Punho-de-Pedra", papel: "carpinteira" }, dado: { passou: true } })); if (v.motivo === "vazia") vazia = v; }
  const r33 = conf(f33, "A mão sai da bolsa de Freya com duas moedas, leves. Você as guarda na palma e segue.", { troca: vazia, teste: { sucesso: true, desafio: "bater_carteira" } });
  t("T33: o furto que veio vazio não deixa a prosa guardar duas moedas", !/duas moedas/.test(r33.narrativa) && !/guarda na palma/.test(r33.narrativa), r33.narrativa);
  const f9 = "peço a Helga que pague uma caneca de hidromel para mim";
  const r9 = conf(f9, "Helga não discute. Leva a mão à bolsa e põe a moeda no balcão. 'Uma caneca de hidromel', diz. Helga traz até você e a deixa perto da sua mão.", { troca: oVereditoDaTroca(f9, ctxBase()) });
  t("T9: a moeda no balcão e a caneca trazida saem (o resíduo da sessão)", !/moeda no balc/.test(r9.narrativa) && !/traz até você/.test(r9.narrativa), r9.narrativa);
  t("T9: a reposição não põe o sistema a falar («a decisão é sua»): a linha já está na tela", !/decisão é sua|nada passa|Nada muda/.test(r9.narrativa), r9.narrativa);
  const comPocao = { ...QUILLA, grupo: [{ nome: "Helga", inventario: [{ nome: "Poção de Cura" }] }] };
  const vP = oVereditoDaTroca("peço a Helga que me dê a poção de cura", { ...ctxBase(), ficha: comPocao });
  const rP = conf("peço a Helga que me dê a poção de cura", "Helga tira a poção de cura da bolsa e estende a você.", { troca: vP, depois: vP.ficha });
  t("aplicada: nada daquela troca é cortado", rP.podadas.length === 0 && /poção de cura/.test(rP.narrativa), J(rP.podadas));
  const r37 = conf("arrombo com o ombro a porta arranhada da casa mais próxima", "A porta cede ao seu esforço. Fenna estende a você um alfinete de prata e um pedaço de corda queimada.", { teste: { sucesso: true, desafio: "arrombar" } });
  t("T37: sem troca nenhuma, «Fenna estende a você um alfinete de prata» sai", !/alfinete/.test(r37.narrativa), r37.narrativa);
  const r28 = conf("olho dentro do buraco aberto no chão e procuro algo no fundo", "No buraco, o fundo já revirado: terra solta, um osso lascado. Freya deixa cair a tábua e espera.", { falas: { freya: { turno: 19, fala: "Me ajuda aqui com isso" } } });
  t("T28: o gesto de quem está e falou há pouco fica (era cortado com motivo «fala»)", /Freya deixa cair a tábua/.test(r28.narrativa) && !r28.podadas.some((p) => p.motivo === "fala"), J(r28.podadas));
  const r28b = conf("olho dentro do buraco aberto no chão", "No buraco, terra solta. Freya resmunga: — De novo esse buraco.", { falas: { freya: { turno: 19, fala: "Me ajuda aqui com isso" } } });
  t("e a FALA dela fora da vez continua a sair", !/De novo esse buraco/.test(r28b.narrativa), r28b.narrativa);
}

sec("12. a fiação: o veredito aplica antes do Narrador, pela porta da ficha viva");
{
  const corpo = (ini, fim = "\n  };\n") => { const i = app.indexOf(ini); return i >= 0 ? app.slice(i, app.indexOf(fim, i)) : ""; };
  const ap = corpo("const aplicarOVereditoDaTroca = (v) => {");
  t("a aplicação grava por mudarFicha (o espelho e o estado de uma vez), nunca só por setPersonagem", /mudarFicha\(v\.ficha\)/.test(ap) && !/setPersonagem\(/.test(ap));
  t("o fato e o veto vão à pauta de um turno (porNaPautaDoTurno), não a um bloco fixo", /porNaPautaDoTurno\(\{ acabou: v\.fato \? \[v\.fato\] : \[\], naoPode: v\.veto \|\| \[\] \}\)/.test(ap));
  t("a linha vai à tela pela forma de sempre (a linha do sistema)", /pushMsgs\(\[\{ autor: "sistema", texto: v\.linha \}\]\)/.test(ap));
  const iMV = app.indexOf("if (mestreVivoLigado()) {\n      try {\n        momentoDoTurnoRef.current = null;");
  const iFC = app.indexOf("fichaDaCenaNoTurno(acao, momentoDoTurnoRef.current)", iMV);
  const iVT = app.indexOf("vereditoDaTrocaAntes(acao, momentoDoTurnoRef.current)", iMV);
  const iDesp = app.indexOf("const cascata = cascataDoTurno(sinais);", iMV);
  t("no turno: com o Mestre vivo, depois da ficha da cena e antes do despachante (logo antes do Narrador)", iMV > 0 && iFC > iMV && iVT > iFC && iDesp > iVT);
  t("protegido por calou (nunca custa o turno)", /try \{ vereditoDaTrocaAntes\(acao, momentoDoTurnoRef\.current\); \} catch \(e\) \{ calou\("Mestre vivo · o veredito da troca", e\);/.test(app));
  const iDado = app.indexOf("const vT = resolverATrocaDoDado(r.frase || \"\", passou, des, persT);");
  const iEnv = app.indexOf("enviar(preRefazer + env, persT);", iDado);
  t("o dado pousou: o furto e o de graça decidem pelo resultado, ANTES do envio ao Narrador, e a ficha nova vai no envio", iDado > 0 && iEnv > iDado && /persT = vT\.ficha; personagemRef\.current = persT; setPersonagem\(persT\);/.test(app.slice(iDado, iEnv)));
  t("o bilhete da troca nasce limpo a cada frase", /conferenteDoTurnoRef\.current = null;\n    trocaDoTurnoRef\.current = null;/.test(app));
  t("o conferente recebe o veredito do turno", /troca: \(\(\) => \{ try \{ const tr = trocaDoTurnoRef\.current;/.test(app));
  t("a venda do que é de uso vai pela mesma porta da venda", /if \(origem === "suprimentos"\) return venderOUso\(nomeItem, quantos\);/.test(app) && /const r = aVendaDoUso\(base,/.test(app) && /const p = mudarFicha\(r\.ficha\);/.test(corpo("const venderOUso = (id, quantos) => {")));
  t("a proposta da venda lê o que está vestido (o kit inicial mora só em «equipados»)", /const vestidos = Object\.values\(p0\.equipados \|\| \{\}\)/.test(app) && /motivo: O_TEXTO_DA_VENDA_DE_USO\.emUso/.test(app));
  t("o suborno cobra o dito no sim (e não antes do dado)", /oSubornoDaFrase\(fraseS, moedaDoMundo\(\)\) \? aQuantiaDita\(fraseS, moedaDoMundo\(\)\) : 0/.test(app));
  t("a busca sem achado chega à pauta (sem dado, e com o dado que não achou)", (app.match(/aBuscaSemAchado\(/g) || []).length >= 2);
}

sec("13. as sobras de leitura da sessão: T21 (a pergunta do caminho) e T49 (a linha da quantia)");
{
  const nrm = (x) => x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  t("T21: «qual é o caminho até o Pátio dos Restos» não é ida (o passo do envio movia a heroína)", PERGUNTA_DO_CAMINHO.test(nrm("pergunto à vendedora de água qual é o caminho até o Pátio dos Restos")));
  t("T60: «como se chega ao Limiar de Ferro» também não", PERGUNTA_DO_CAMINHO.test(nrm("pergunto a Freya como se chega ao Limiar de Ferro daqui")));
  t("«vou até o mercado e pergunto pelo ferreiro» continua a andar", !PERGUNTA_DO_CAMINHO.test(nrm("vou até o mercado e pergunto pelo ferreiro")));
  t("«vou até o Pátio dos Restos» continua a andar", !PERGUNTA_DO_CAMINHO.test(nrm("vou até o Pátio dos Restos")));
  const pre = fs.readFileSync(path.join("..", "src", "motor", "preludio-do-turno.js"), "utf8");
  t("o passo do envio (prelúdio) lê a pergunta antes de andar", /if \(PERGUNTA_DO_CAMINHO\.test\(nP\)\) return null;[\s\S]{0,200}return lugarPedido\(cru, lugaresDaqui\(\)\);/.test(pre));
  const { valem, vazias } = alavancasNaMesa("tento subornar Freya com algum dinheiro para ela me deixar passar pelo portal", { pers: { moedas: 20 }, pericia: "persuasao" });
  const ouro = vazias.find((a) => a.id === "moeda");
  t("T49: o ouro que não chega diz o número dos dois lados (era «você não tem essa quantia» com ◉ 20)", !valem.some((a) => a.id === "moeda") && ouro && /◉ \d+/.test(ouro.semIsso) && ouro.semIsso.includes("◉ 20"), ouro && ouro.semIsso);
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
