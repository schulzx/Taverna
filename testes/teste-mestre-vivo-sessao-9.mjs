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
  O_VEREDITO_DA_TROCA, aPortaDaMoeda, quemDaFrase, deQuem, oVereditoDaTroca, aIntencaoDaTroca,
} from "../src/o-veredito-da-troca.js";
import { compraNaFrase, compraNaBanca, compraSemQuemVenda } from "../src/bolsa-da-frase.js";
import { aCartaDoGesto } from "../src/quadro-da-quest.js";
import { FAIXAS_DA_MARGEM } from "../src/desafios.js";

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

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
