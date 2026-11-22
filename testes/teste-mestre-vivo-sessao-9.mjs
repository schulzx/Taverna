/* teste-mestre-vivo-sessao-9.mjs (21/11/2026) — a nona sessão do Mestre vivo,
   turno a turno (mente/lancamento/mestre-vivo-sessao-9.md, sobre 32031d6).

   A lei do pacote (a pessoa, 21/11): «Tudo pelo sistema, o narrador apenas
   recebe fatos e narra, nada entra por ele.» A sessão mediu 20 de 39 turnos de
   troca com linha, ficha e prosa de acordo; o lado do SISTEMA ainda errava.
   Cada secção reproduz o turno com a cena da sessão: Godfrey (halfling,
   caçador, Arco Curto e Couro Batido vestidos, um Distintivo do antigo
   regimento na mochila, ◉ 15) com Torvald Voz-Grave (Espada Longa e Cota de
   Malha), na praça do Ilhéu do Vento Sul (O Sino Amargo, a vendedora, Gwynn
   Mata-Lobos, dois estivadores) e na Doca Seca (Kael Mão-Torta, Kolvar, Ulric).

   Cada caso é a frase da sessão contra a porta que a decide (o módulo puro) e,
   onde a fiação é a causa, contra o App.jsx (a mesma leitura por texto que as
   suítes do veredito da troca e da venda usam). */
import fs from "node:fs";
import path from "node:path";
import {
  O_VEREDITO_DA_TROCA, aPortaDaMoeda, quemDaFrase, deQuem, oVereditoDaTroca, aIntencaoDaTroca, oSubornoDaFrase, oItemDaFrase,
} from "../src/o-veredito-da-troca.js";
import { compraNaFrase, compraNaBanca, compraSemQuemVenda } from "../src/bolsa-da-frase.js";
import { aCartaDoGesto } from "../src/quadro-da-quest.js";
import { FAIXAS_DA_MARGEM, lerAcao } from "../src/desafios.js";
import { oPagamentoDaFrase } from "../src/motor/o-pagamento-da-frase.js";

let falhas = 0;
const t = (nome, cond, extra) => { if (cond) console.log("  ok:", nome); else { falhas++; console.log("  FALHA:", nome, extra != null ? `→ ${extra}` : ""); } };
const sec = (s) => console.log(`\n[${s}]`);
const J = JSON.stringify;
const app = fs.readFileSync(path.join("..", "src", "App.jsx"), "utf8");
const corpo = (ini, fim = "\n  };\n") => { const i = app.indexOf(ini); return i >= 0 ? app.slice(i, app.indexOf(fim, i)) : ""; };

const BALCAO = Object.freeze([{ id: "racoes", nome: "Rações de viagem", preco: 5 }, { id: "agua", nome: "Odres de água", preco: 2 }, { id: "tochas", nome: "Tochas", preco: 1 }]);
const SINO = Object.freeze({ id: "m1", nome: "O Sino Amargo", estoque: Object.freeze([
  { nome: "Sais Aromáticos", preco: 40 }, { nome: "Elixir de Intelecto", preco: 106 }, { nome: "Vela que não derrete", preco: 115 }, { nome: "Pena de escrever", preco: 58 },
]) });
const TORVALD = Object.freeze({ nome: "Torvald Voz-Grave", inventario: Object.freeze([]), equipados: Object.freeze({ arma: Object.freeze({ nome: "Espada Longa" }), armadura: Object.freeze({ nome: "Cota de Malha" }) }) });
const GODFREY = Object.freeze({
  nome: "Godfrey", moedas: 30, inventario: Object.freeze(["Distintivo do antigo regimento"]), equipamento: Object.freeze([]),
  equipados: Object.freeze({ arma: Object.freeze({ nome: "Arco Curto" }), armadura: Object.freeze({ nome: "Couro Batido" }) }),
  suprimentos: Object.freeze({ racoes: 10, agua: 10, tochas: 5, kit: true }),
  grupo: Object.freeze([TORVALD]),
});
const PRACA = ["Gwynn Mata-Lobos", "Torvald Voz-Grave"];
const DOCA = ["Kael Mão-Torta", "Kolvar", "Ulric", "Torvald Voz-Grave"];
const ctx = (extra) => ({ ficha: GODFREY, presentes: PRACA, chao: [], semente: "ilheu-s9", lugar: "praça", dia: 1, bancas: [SINO], ...extra });

/* ============================================================ */
sec("1. T57: «dou 10 moedas à vendedora por duas rações» — uma porta cobra");
{
  const f = "dou 10 moedas à vendedora por duas rações de viagem";
  /* a cena: na Doca Seca, com a carta da quest do Kael (pagar a ele para falar, ◉ 10) virável e o Kael em cena */
  const Q = { quest: "q-kael", cartas: [{ id: "essencial:pessoa", tipo: "essencial", viravel: true, estado: "costas", forma: "pessoa", juiz: { nome: "Kael Mão-Torta", nomes: ["Kael Mão-Torta", "Kael"] }, caminhos: [{ id: "pagar", desafios: ["convencer"] }] }] };
  const onde = { cidade: "Ilhéu do Vento Sul", emCena: DOCA };
  t("a moeda tem dono: é da compra", aPortaDaMoeda(f) === "compra");
  t("o gesto da carta («pagar a quem sabe», ◉ 10) não cobra por cima (era a segunda cobrança da sessão)", aCartaDoGesto([Q], { frase: f, quem: "", moedas: 30 }, onde) === null);
  t("e «dou 10 moedas à vendedora», sem o «por», também não vira a carta do Kael: a moeda vai a quem a frase diz",
    aCartaDoGesto([Q], { frase: "dou 10 moedas à vendedora", quem: "", moedas: 30 }, onde) === null);
  const k = aCartaDoGesto([Q], { frase: "dou 10 moedas a Kael para ele falar", quem: "", moedas: 30 }, onde);
  t("pagar ao Kael para falar continua a virar a carta (o gesto existe)", k && k.caminho === "pagar" && k.carta === "essencial:pessoa", J(k));
  const c = compraNaFrase(f, { balcao: BALCAO, bolsa: 30, temKit: true, bancas: [SINO] });
  t("a bolsa da frase cobra uma vez: 2 rações, ◉ 10, e a linha «restam» sai da bolsa gravada (◉ 20)", c && c.fecha && c.total === 10 && c.itens[0].quantos === 2 && c.bolsa - c.total === 20, J(c));
  t("os turnos 3 e 7 (uma coisa, sem a carta em cena) já cobravam uma vez: continuam",
    compraNaFrase("dou 5 moedas à vendedora por uma ração de viagem", { balcao: BALCAO, bolsa: 15, temKit: true }).total === 5
    && compraNaFrase("dou 2 moedas à vendedora por um odre de água", { balcao: BALCAO, bolsa: 8, temKit: true }).total === 2);
  t("o suborno e o fiado também têm dono (nunca o gesto)", aPortaDaMoeda("ofereço 4 moedas à vendedora para ela não gritar ladrão") === "suborno" && aPortaDaMoeda("levo uma ração e pago amanhã, fiado") === "fiado");
  t("«pago cinco moedas pela informação» não é compra de banca: é saber (o gesto da carta)", aPortaDaMoeda("pago cinco moedas pela informação sobre Kael") === "");
  t("a fiação: o gesto corre antes da bolsa da frase e lê o quadro pela mesma porta (aCartaDoGestoAgora → aCartaDoGesto)",
    app.indexOf("aCartaDoGestoAgora(acao, pagoNaProposta)") > 0 && app.indexOf("aCartaDoGestoAgora(acao, pagoNaProposta)") < app.indexOf("try { registarABolsaDaFrase(acao); }") && /const g = aCartaDoGesto\(qs,/.test(app));
}

sec("2. T31: o furto que falhou por 1 rendeu butim — o «quase» é sim pago, e a linha do dado tem de dizê-lo");
{
  const quase = FAIXAS_DA_MARGEM.find((x) => x.id === "quase");
  t("a tabela: falhar por 1 ou 2 é passar pagando", quase && quase.passou === true && quase.de === -2 && quase.ate === -1);
  const linha = app.slice(app.indexOf("let fioDoDado = null;"), app.indexOf("/* CÓDEX: 20 natural e 1 natural contam para as conquistas */"));
  t("a linha «🎲 … · resultado» lê a mesma conta do motor (desfechoDaMargem, semFioNoMomento) e diz a voz da faixa", /desfechoDaMargem\(r\.desafio, \{ total, dc, critico, desastre, emCombate: !!combateRef\.current, comMeiaVerdade: true, semMeio: semFioNoMomento\(r\.desafio\) \}\)/.test(linha) && /vozDoFio \|\| "falha"/.test(linha), linha.slice(0, 120));
  t("a bandeja pousa o «quase» como passou", /if \(lt && fioDoDado && lt\.desfecho === "falha"\) lt = Object\.freeze\(\{ \.\.\.lt, desfecho: "sucesso" \}\);/.test(app));
  t("e o motor continua a decidir com a mesma conta (passou = bateu ou o quase)", /const passou = bateu \|\| !!\(custo && custo\.porPouco\);/.test(app));
  const f = "furto a bolsa de moedas de um dos estivadores";
  const falhou = oVereditoDaTroca(f, ctx({ dado: { passou: false } }));
  t("com o dado falhado de verdade (falha seca), nada entra", falhou && falhou.estado === "negada" && falhou.motivo === "falhou" && falhou.ficha === null);
  let rende = null;
  for (let i = 0; i < 40 && !rende; i++) { const v = oVereditoDaTroca(f, ctx({ semente: `ilheu-${i}`, dado: { passou: true } })); if (v && v.estado === "aplicada") rende = v; }
  t("T29–T32, T56: «Da bolsa do estivador» — o papel da frase, com a contração certa (era «Da bolsa de a vítima»)", rende && rende.linha.startsWith("🤲 Da bolsa do estivador:") && !/vítima/.test(rende.linha) && /do estivador/.test(rende.fato), rende && rende.linha);
  t("Gwynn, que está em cena, pelo nome", quemDaFrase("furto a bolsa de moedas da Gwynn", PRACA).nome === "Gwynn Mata-Lobos" && deQuem("Gwynn Mata-Lobos") === "de Gwynn Mata-Lobos");
  t("a vendedora e o Kael", quemDaFrase("furto a bolsa de moedas da vendedora sem que ela perceba", PRACA).nome === "a vendedora" && deQuem("a vendedora") === "da vendedora" && quemDaFrase("furto a bolsa de moedas do Kael", DOCA).nome === "Kael Mão-Torta");
  t("sem ninguém dito, a linha não inventa «a vítima»", deQuem("") === `de ${O_VEREDITO_DA_TROCA.alvoSemNome}` && !/vítima/.test(O_VEREDITO_DA_TROCA.alvoSemNome));
  t("a fiação: o dado leva quem está até o veredito", /presentes: \(tr\.ctx && tr\.ctx\.presentes\) \|\| \[\]/.test(app) && /ctx: \{ alvo, lugar: lugarT, presentes: ctx\.presentes \}/.test(app));
}

sec("3. T23: o fiado é negado antes de qualquer cartão, e nada cobra");
{
  const f = "levo uma ração de viagem da vendedora e pago amanhã, fiado";
  t("não é compra no balcão (era o cartão «Comprar ◉ 5», cobrado e entregue)", compraNaFrase(f, { balcao: BALCAO, bolsa: 12, temKit: true, bancas: [SINO] }) === null);
  t("nem na banca, nem «aqui ninguém vende»", compraNaBanca(f, { bancas: [SINO], bolsa: 12 }) === null && compraSemQuemVenda(f, { bancas: [SINO], balcao: BALCAO, comuns: [] }) === null);
  const v = oVereditoDaTroca(f, ctx());
  t("o veredito: negado, com a fala da mesa", v && v.estado === "negada" && v.linha === O_VEREDITO_DA_TROCA.tela.fiado && v.ficha === null);
  const b = corpo("const registarABolsaDaFrase = (acao) => {", "\n  };\n");
  t("a fiação: o fiado sai da bolsa da frase antes da compra; sem o Mestre vivo, a linha e o veto vêm dali", b.indexOf("if (oFiadoDaFrase(txt))") > 0 && b.indexOf("if (oFiadoDaFrase(txt))") < b.indexOf("compraNaFrase(txt,") && /if \(!mestreVivoLigado\(\)\) \{ vetar\(\[O_VEREDITO_DA_TROCA\.veto\.fiado\]\);/.test(b));
  t("a proposta lê a mesma compra (logo, nenhum cartão abre)", /const c = compraNaFrase\(txt, \{ balcao: balcaoAqui\(cid\), bolsa: p\.moedas \|\| 0/.test(app));
  t("a intenção continua a ser lida como fiado", aIntencaoDaTroca(f, { grupo: GODFREY.grupo }).tipo === "fiado");
}

sec("4. T33–T35: o suborno com quantia rola Persuasão, e a moeda sai só no sim");
{
  const TRES = [
    "ofereço 3 moedas ao estivador para ele ficar calado sobre a bolsa",
    "ofereço 5 moedas à Gwynn para ela esquecer",
    "ofereço 4 moedas à vendedora para ela não gritar ladrão",
  ];
  for (const f of TRES) {
    const v = lerAcao(f, { personagem: GODFREY });
    t(`«${f}»: lido como suborno, e o catálogo ouve Persuasão (era sem dado)`, oSubornoDaFrase(f) && v && v.tipo === "teste" && v.id === "convencer", J(v && { tipo: v.tipo, id: v.id }));
    t("  e nenhum cartão «Pagar» cobra antes do dado", oPagamentoDaFrase(f, { fator: 1, pouso: null, moeda: "moedas" }) === null);
  }
  t("a lista do suborno é uma só: o catálogo pergunta a oSubornoDaFrase", /const itT = oSubornoDaFrase\(cru\) \? \{ tipo: "suborno" \}/.test(fs.readFileSync(path.join("..", "src", "desafios.js"), "utf8")));
  t("a fiação: o sim cobra o dito (com ou sem a chave), o não deixa a moeda", /const ditoS = oSubornoDaFrase\(fraseS, moedaDoMundo\(\)\) \? aQuantiaDita\(fraseS, moedaDoMundo\(\)\) : 0;/.test(app) && /if \(passou && des\.social\.custoEmMoedas > 0\)/.test(app));
  t("pagar a caneca continua a não ser suborno", !oSubornoDaFrase("pago duas moedas pela caneca") && !oSubornoDaFrase("dou 10 moedas à vendedora por duas rações de viagem"));
}

sec("5. T10–T13: o nome encurtado casa com o item que se tem");
{
  const BOLSA = ["Distintivo do antigo regimento", "Arco Curto", "Couro Batido"];
  t("«o distintivo» é o Distintivo do antigo regimento", (oItemDaFrase("vendo o distintivo à vendedora", BOLSA) || {}).nome === "Distintivo do antigo regimento");
  t("«o distintivo do regimento» também", (oItemDaFrase("dou o distintivo do regimento à Gwynn Mata-Lobos", BOLSA) || {}).nome === "Distintivo do antigo regimento");
  t("«o couro» é o Couro Batido", (oItemDaFrase("vendo o couro à vendedora", BOLSA) || {}).nome === "Couro Batido");
  t("«a espada longa» não é a Espada Curta (a palavra que desdiz)", oItemDaFrase("dou a espada longa a Freya", ["Espada Curta"]) === null);
  t("«a corda curta» não é a Espada Curta", oItemDaFrase("pego a corda curta", ["Espada Curta"]) === null);
  t("«o distintivo de prata» não é o do regimento", oItemDaFrase("vendo o distintivo de prata", BOLSA) === null);
  const amb = oItemDaFrase("dou a espada a Freya", ["Espada Curta", "Espada Longa"]);
  t("duas espadas: ambíguo, com os dois nomes", amb && amb.ambiguos && amb.ambiguos.length === 2, J(amb));
  const vAmb = oVereditoDaTroca("dou a espada a Freya", ctx({ ficha: { ...GODFREY, inventario: ["Espada Curta", "Espada Longa"] }, presentes: ["Freya"] }));
  t("e o veredito pergunta qual (nunca a prosa decide)", vAmb && vAmb.estado === "negada" && vAmb.motivo === "qual" && vAmb.linha.includes("Espada Curta") && vAmb.linha.includes("Espada Longa"), J(vAmb && vAmb.linha));
  const v12 = oVereditoDaTroca("dou o distintivo do regimento à Gwynn Mata-Lobos", ctx());
  t("T12: sai da mochila, a linha diz de quem é agora", v12 && v12.estado === "aplicada" && v12.ficha.inventario.length === 0 && v12.linha.includes("Gwynn"), J(v12 && v12.linha));
  const v13 = oVereditoDaTroca("dou o distintivo ao Torvald", ctx());
  t("T13: entra na bolsa do Torvald", v13 && v13.estado === "aplicada" && v13.ficha.grupo[0].inventario.includes("Distintivo do antigo regimento"));
  t("a fiação: a proposta da venda casa o nome encurtado pela mesma função", /qualV = oItemDaFrase\(acao, todosV\.map\(\(x\) => nomeDe\(x\.r\)\)\)/.test(app) && /if \(qualV && !qualV\.ambiguos\) cands\.push\(todosV\[qualV\.i\]\);/.test(app));
}

sec("6. T16, T38, T55: o companheiro dá o que tem, e a linha diz a verdade");
{
  const v16 = oVereditoDaTroca("Torvald, me entrega a sua espada longa", ctx());
  t("T16: ele TEM a Espada Longa (vestida): a linha diz que a usa, não que não a tem", v16 && v16.estado === "negada" && v16.motivo === "emUso" && v16.linha.includes("Espada Longa") && !/não tem isso/.test(v16.linha), J(v16 && v16.linha));
  const v17 = oVereditoDaTroca("Torvald, me entrega o seu escudo de ferro", ctx());
  t("T17: o escudo que não existe: «não tem isso consigo»", v17 && v17.motivo === "naoTem");
  const comDist = { ...GODFREY, inventario: [], grupo: [{ ...TORVALD, inventario: ["Distintivo do antigo regimento"] }] };
  const v55 = oVereditoDaTroca("Torvald, me devolve o Distintivo do antigo regimento", ctx({ ficha: comDist }));
  t("T55: «me devolve» é pedido de troca: sai da bolsa dele e entra na mochila (era sem veredito, e a prosa devolvia)", v55 && v55.estado === "aplicada" && v55.ficha.inventario.includes("Distintivo do antigo regimento") && v55.ficha.grupo[0].inventario.length === 0, J(v55 && v55.linha));
  const v38 = oVereditoDaTroca("aceito o rosário de marfim que Torvald me estendeu e guardo", ctx());
  t("T38: o rosário que só a prosa pôs na mão do Torvald: negado, nada entra", v38 && v38.estado === "negada" && v38.tipo === "companheiro" && v38.motivo === "naoTem", J(v38));
}

sec("7. T21, T22: o de graça — a coisa dita é a que vem, com dado");
{
  const f22 = "peço emprestado à vendedora um odre de água, devolvo amanhã";
  const l22 = lerAcao(f22, { personagem: GODFREY });
  t("T22: pedir emprestado a quem não é do grupo pede Persuasão (era sem dado)", l22 && l22.tipo === "teste" && l22.id === "convencer", J(l22 && l22.id));
  const sim = oVereditoDaTroca(f22, ctx({ dado: { passou: true } }));
  t("passou: vem o odre (1 de água), não uma Maçã seca da tabela", sim && sim.estado === "aplicada" && sim.ficha.suprimentos.agua === 11 && sim.linha.includes("odre de água") && !/Maçã/.test(sim.linha) && sim.linha.startsWith("🎁 A vendedora"), J(sim && sim.linha));
  const nada = oVereditoDaTroca("peço à vendedora, de graça, uma corda de seda", ctx({ dado: { passou: true } }));
  t("a coisa nomeada que ninguém ali tem: não vem (e nada de amostra por acaso)", nada && nada.estado === "negada" && nada.motivo === "naoTem" && nada.ficha === null, J(nada && nada.linha));
  const vela = oVereditoDaTroca("peço à vendedora, de graça, a vela que não derrete", ctx({ dado: { passou: true } }));
  t("T21: a vela de ◉ 115 não se dá de graça, nem com o dado", vela && vela.motivo === "caro" && vela.linha.includes("115"));
  const vaga = oVereditoDaTroca("peço ao tiefling do portal uma amostra do que ele tem, de graça", ctx({ alvo: { nome: "o tiefling" }, dado: { passou: true } }));
  t("o pedido vago continua a receber a coisa pequena da tabela", vaga && vaga.estado === "aplicada" && O_VEREDITO_DA_TROCA.amostras.includes(vaga.ficha.inventario[vaga.ficha.inventario.length - 1]));
  t("ao companheiro, pelo nome, não é «de graça» (é a bolsa do grupo, sem dado)", (lerAcao("Torvald, me empresta cinco moedas da sua bolsa", { personagem: GODFREY }) || {}).tipo !== "teste");
}

sec("8. T28: tomar da mão de alguém pede dado");
{
  const f = "tomo a faca de peixe da mão do estivador e guardo no cinto";
  const it = aIntencaoDaTroca(f, { grupo: GODFREY.grupo });
  t("a intenção é «tomar» (era «pegar», negado sem dado: «não é coisa que se leve»)", it && it.tipo === "tomar" && it.coisa === "faca de peixe", J(it));
  const l = lerAcao(f, { personagem: GODFREY });
  t("o catálogo ouve força contra quem segura (vencer o peso, Atletismo)", l && l.tipo === "teste" && l.id === "forcar", J(l && l.id));
  t("sem o dado, espera", oVereditoDaTroca(f, ctx()).estado === "pendente");
  const sim = oVereditoDaTroca(f, ctx({ dado: { passou: true } }));
  t("passou: a faca de peixe vem, da mão do estivador", sim && sim.estado === "aplicada" && sim.ficha.inventario.includes("Faca de peixe") && sim.linha.includes("do estivador"), J(sim && sim.linha));
  const nao = oVereditoDaTroca(f, ctx({ dado: { passou: false } }));
  t("falhou: ele segura firme, nada muda de mão", nao && nao.estado === "negada" && nao.ficha === null && /segura firme/.test(nao.linha));
  t("a fiação: tomar espera o dado como o furto, e o dado que decide é o da força", /if \(it\.tipo === "furto" \|\| it\.tipo === "deGraca" \|\| it\.tipo === "tomar"\)/.test(app) && /tipo === "tomar" \? !\(des && des\.id === "forcar"\)/.test(app));
}

sec("T27: o frasco da banca é da banca (a negativa diz de quem)");
{
  const v = oVereditoDaTroca("pego o frasco de sais aromáticos da banca da vendedora e guardo na mochila", ctx());
  t("é da vendedora: levar sem pedir é furto", v && v.motivo === "dono" && v.linha === "✋ Isso é da vendedora: levar sem pedir é furto.", J(v && v.linha));
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
