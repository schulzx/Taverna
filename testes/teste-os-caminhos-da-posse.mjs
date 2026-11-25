/* OS CAMINHOS DA POSSE (24/11/2026, identidade e posse · etapa 7) — src/os-caminhos-da-posse.js

   A ordem da pessoa, 23/11: «construir o sistema que resolve a classe
   inteira, não a regra do caso». Fora da frase digitada, cada caminho que
   muda posse escrevia a ficha do seu jeito. Esta suíte prova o MECANISMO:
   um produtor de transação por caminho, e uma porta só de aplicação
   (aplicarAsTransacoes → aplicarTransacao). Os nomes daqui são de prova, e
   as quests são de prova (o mecanismo lê a forma da quest, nunca o nome):
   §1  a coisa da quest tem dono (oDonoDaCoisa): onde nasce, ou a quem a
       escolha que a tira da bolsa agradece; dúvida não vira dono;
   §2  devolver a coisa da quest a quem a possui — save novo e save antigo
       (a coisa já na ficha, o registro sem saber dela); sem a dívida
       derivada, a mesma devolução é recusada (o defeito de antes);
   §3  o furto tira da posse da vítima: o butim é o que ela tem, e depois ela
       não tem mais (pedir a ela o que foi furtado é recusado);
   §4  a banca por botão: vender enche a mão e esvazia o caixa; comprar
       esvazia a mão e enche o caixa; `mercado.gastos` e `comprados` com a
       forma de sempre;
   §5  a mesma paga aplicada duas vezes não paga em dobro;
   §6  a cobrança da prosa não cobra o que a porta já aplicou (porChave);
   §7  a catraca: as escritas diretas de `moedas:` e `inventario:` no App só
       podem descer;
   §8  a fiação no App (o texto do App, nunca o de src/motor/). */
import { readFileSync } from "node:fs";
import {
  OS_CAMINHOS_DA_POSSE, oDonoDaCoisa, asCoisasDaQuest, comAsDividasDaQuest, semAsDividasDerivadas, oIdDaDividaDaQuest,
  oFurtoPorTransacao, oVereditoDoFurto, aCompraNaBanca, oPagamentoABanca, aCompraNoBalcao, aVendaNaBanca,
  oQueOMundoDa, oQueSeGasta, asChavesQuePagaram, aChaveDoCaminho,
} from "../src/os-caminhos-da-posse.js";
import { aplicarTransacao, posseDe, dividasDe } from "../src/quem-tem-o-que.js";
import { aplicarAsTransacoes } from "../src/a-troca-por-transacao.js";
import { BIBLIOTECA_DE_QUESTS } from "../src/biblioteca-de-quests.js";
import { oQueFaltaDebitar } from "../src/cobranca.js";
import { podePagar } from "../src/comercio.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (o) => { if (o && typeof o === "object") { Object.freeze(o); for (const v of Object.values(o)) congelar(v); } return o; };
const fichaHeroi = (extra = {}) => ({ nome: "Aria", nivel: 2, moedas: 20, inventario: ["Corda"], equipamento: [], equipados: {}, suprimentos: { racoes: 2, agua: 1, tochas: 0, kit: false }, grupo: [], ...extra });

/* ---------------- §1 ---------------- */
sec("§1 a coisa da quest tem dono");
const questNasce = congelar({ id: "prova_nasce", papeis: { guardia: { de: "elenco" }, ladrao: { de: "fio" }, coisa: { de: "item", nome: "o selo de cera", nasce: "guardia" } }, escolhas: {} });
const questGrata = congelar({ id: "prova_grata", papeis: { dona: { de: "elenco" }, casa: { de: "lugar" }, outro: { de: "elenco" }, coisa: { de: "item", nome: "o caderno azul", nasce: "casa" } },
  escolhas: { destino: { opcoes: {
    queimar: { efeitos: [{ tipo: "afeicao", papel: "dona", n: -1 }, { tipo: "sai_da_bolsa", papel: "coisa" }] },
    devolver: { efeitos: [{ tipo: "afeicao", papel: "dona", n: 1 }, { tipo: "aliado", papel: "dona" }, { tipo: "sai_da_bolsa", papel: "coisa" }] },
    guardar: { efeitos: [{ tipo: "afeicao", papel: "outro", n: -1 }] },
  } } } });
const questDuvida = congelar({ id: "prova_duvida", papeis: { a: { de: "elenco" }, b: { de: "elenco" }, coisa: { de: "item", nome: "a prova" } },
  escolhas: { x: { opcoes: { um: { efeitos: [{ tipo: "aliado", papel: "a" }, { tipo: "sai_da_bolsa", papel: "coisa" }] }, dois: { efeitos: [{ tipo: "aliado", papel: "b" }, { tipo: "sai_da_bolsa", papel: "coisa" }] } } } } });
const questSemDono = congelar({ id: "prova_sem", papeis: { a: { de: "elenco" }, lugar: { de: "lugar" }, coisa: { de: "item", nome: "a pista", nasce: "lugar" } }, escolhas: {} });
t("onde a coisa nasce, se é gente, é a dona", oDonoDaCoisa(questNasce, "coisa") === "guardia");
t("senão, quem a escolha que a tira da bolsa deixa grato", oDonoDaCoisa(questGrata, "coisa") === "dona");
t("a afeição que desce não conta (queimar não dá dono)", oDonoDaCoisa({ ...questGrata, escolhas: { d: { opcoes: { q: questGrata.escolhas.destino.opcoes.queimar } } } }, "coisa") === "");
t("dois gratos são dúvida, e a dúvida não vira dono", oDonoDaCoisa(questDuvida, "coisa") === "");
t("nascer num lugar não dá dono", oDonoDaCoisa(questSemDono, "coisa") === "");
t("papel que não é coisa, ou lixo: vazio", oDonoDaCoisa(questNasce, "guardia") === "" && oDonoDaCoisa(null, "x") === "" && oDonoDaCoisa(questNasce, "nada") === "");
/* o acervo real: a régua acha dono em algumas coisas e deixa sem dono as provas (que não são de ninguém) */
let comDono = 0, coisas = 0;
for (const q of BIBLIOTECA_DE_QUESTS) for (const [k, p] of Object.entries(q.papeis || {})) if (p && p.de === "item") { coisas++; if (oDonoDaCoisa(q, k)) comDono++; }
t("no acervo, a régua dá dono a algumas coisas e não a todas (" + comDono + " de " + coisas + ")", comDono >= 1 && comDono < coisas);
const porId = (id) => ({ prova_nasce: questNasce, prova_grata: questGrata, prova_duvida: questDuvida, prova_sem: questSemDono }[id] || null);
const registos = congelar([
  { id: "prova_grata", estado: "aberta", papeis: { dona: { tipo: "pessoa", nome: "Odila Brand", id: "Vau|gente|Odila Brand" }, casa: { tipo: "lugar", nome: "a casa" }, outro: { tipo: "pessoa", nome: "Taro" }, coisa: { tipo: "item", nome: "o caderno azul" } } },
  { id: "prova_sem", estado: "aberta", papeis: { a: { nome: "Lia" }, lugar: { nome: "o poço" }, coisa: { nome: "a pista" } } },
]);
const ks = asCoisasDaQuest(registos, { questPorId: porId });
t("asCoisasDaQuest: uma coisa com dono, com o id que a quest guardou", ks.length === 1 && ks[0].dono === "Vau|gente|Odila Brand" && ks[0].coisa === "o caderno azul" && ks[0].donoPapel === "dona", J(ks));
const ksCena = asCoisasDaQuest(registos, { questPorId: porId, pessoas: { "npc|Odila Brand": { nome: "Odila Brand" } } });
t("a pessoa da cena com o nome do papel dá o id que a troca vai usar", ksCena[0] && ksCena[0].dono === "npc|Odila Brand", J(ksCena));

/* ---------------- §2 ---------------- */
sec("§2 devolver a coisa da quest a quem a possui");
const ctxQ = { questPorId: porId, dia: 4 };
const dona = "Vau|gente|Odila Brand";
const devolver = { de: "heroi", para: dona, oQue: { tipo: "item", nome: "Caderno azul", quantos: 1 }, contra: null, consentimento: "devido", origem: "a troca da frase", chave: "troca|9|x|0" };
/* save novo: o mundo põe a coisa na mão do herói (pela porta) */
const r0 = aplicarAsTransacoes(null, fichaHeroi(), oQueOMundoDa({ caminho: "achado", itens: ["Caderno azul"], identidade: "achado|caderno" }), {});
t("o achado põe a coisa da quest na mão do herói, pela porta", r0.ok && r0.ficha.inventario.includes("Caderno azul"));
const semDerivar = aplicarTransacao(r0.posses, r0.ficha, devolver, {});
t("sem a dívida derivada, devolver é recusado (o defeito de antes)", !semDerivar.ok && semDerivar.motivo === "semDivida");
const P1 = comAsDividasDaQuest(r0.posses, registos, r0.ficha, ctxQ);
const d1 = dividasDe(P1, "heroi").deve;
t("a coisa na mão do herói vira dívida dele com a dona", d1.length === 1 && d1[0].para === dona && d1[0].oQue.nome === "Caderno azul" && d1[0].id === oIdDaDividaDaQuest("prova_grata", "coisa"), J(d1));
const rDev = aplicarTransacao(P1, r0.ficha, devolver, {});
t("devolver à dona é aceito pela estrutura (save novo)", rDev.ok && !rDev.ficha.inventario.includes("Caderno azul"), rDev.motivo);
t("a coisa passa a ser da dona", rDev.ok && posseDe(dona, rDev.posses, rDev.ficha, {}).itens.some((x) => x === "Caderno azul"));
const gravado = semAsDividasDerivadas(rDev.posses);
t("a quitação fica gravada (a dívida fechada)", gravado && gravado.dividas.some((d) => d.id === d1[0].id && d.estado === "fechada"));
const deNovo = comAsDividasDaQuest(gravado, registos, { ...rDev.ficha, inventario: [...rDev.ficha.inventario, "Caderno azul"] }, ctxQ);
t("a dívida quitada não volta a nascer", dividasDe(deNovo, "heroi").deve.length === 0);
/* save antigo: a coisa já está na ficha, e o registro nunca soube dela */
const fichaAntiga = congelar(fichaHeroi({ inventario: ["Corda", "Caderno azul"] }));
const PA = comAsDividasDaQuest(null, registos, fichaAntiga, ctxQ);
const rA = aplicarTransacao(PA, fichaAntiga, devolver, {});
t("save antigo: devolver à dona é aceito, derivado do que a quest sabe", rA.ok && rA.ficha.inventario.join() === "Corda", rA.motivo);
t("save antigo: sem a coisa na mão, nenhuma dívida nasce", comAsDividasDaQuest(null, registos, fichaHeroi(), ctxQ) === null);
const aberta = comAsDividasDaQuest(null, registos, fichaAntiga, ctxQ);
t("a dívida derivada aberta não se grava (semAsDividasDerivadas)", semAsDividasDerivadas(aberta) === null || dividasDe(semAsDividasDerivadas(aberta), "heroi").deve.length === 0);
t("a quest sem dono para a coisa não abre dívida", !dividasDe(PA, "heroi").deve.some((d) => /pista/i.test(d.oQue.nome)));

/* ---------------- §3 ---------------- */
sec("§3 o furto tira da posse da vítima");
let semente = "", vitima = "npc|Bertrand Coyle";
const ctxV = (s) => ({ semente: s, pessoas: { [vitima]: { nome: "Bertrand Coyle", papel: "ferreiro" } } });
for (let i = 0; i < 50 && !semente; i++) if (posseDe(vitima, null, null, ctxV("s" + i)).moedas > 0) semente = "s" + i;
const cV = ctxV(semente);
const antesV = posseDe(vitima, null, null, cV);
t("a vítima tem moeda pela posse derivada (semente " + semente + ")", antesV.moedas > 0 && antesV.itens.includes("Martelo de forja"), J(antesV));
const fF = oFurtoPorTransacao({ vitima, coisa: "bolsa", posse: antesV, turno: 7, frase: "furto a bolsa do ferreiro" });
t("o butim da bolsa é a moeda que ela tem", fF.transacoes.length === 1 && fF.transacoes[0].oQue.quantos === antesV.moedas && fF.transacoes[0].consentimento === "tomado" && fF.transacoes[0].de === vitima);
const semDado = aplicarAsTransacoes(null, fichaHeroi(), fF.transacoes, cV);
t("tomar sem o dado passado é recusado", !semDado.ok && semDado.motivo === "semDado");
const rF = aplicarAsTransacoes(null, fichaHeroi(), fF.transacoes, { ...cV, dado: { passou: true } });
t("com o dado passado, a moeda passa à mão do herói", rF.ok && rF.ficha.moedas === 20 + antesV.moedas);
t("e deixa de estar com a vítima", posseDe(vitima, rF.posses, rF.ficha, cV).moedas === 0);
const vF = oVereditoDoFurto(rF, { alvo: "Bertrand Coyle" });
t("o veredito do furto diz o que veio, na voz de sempre", vF && vF.estado === "aplicada" && vF.ficha === rF.ficha && /Bertrand/.test(vF.linha) && new RegExp("◉ " + antesV.moedas).test(vF.linha), vF && vF.linha);
const fF2 = oFurtoPorTransacao({ vitima, coisa: "bolsa", posse: posseDe(vitima, rF.posses, rF.ficha, cV), turno: 8, frase: "furto a bolsa do ferreiro de novo" });
t("furtar de novo a bolsa vazia: a mão volta vazia", fF2.vazia && !fF2.transacoes.length && oVereditoDoFurto(null, { alvo: "Bertrand Coyle", vazia: true }).estado === "negada");
const pedir = { de: vitima, para: "heroi", oQue: { tipo: "moedas", nome: "moedas", quantos: 1 }, contra: null, consentimento: "pedido", chave: "troca|9|y|0" };
const rPed = aplicarTransacao(rF.posses, rF.ficha, pedir, { ...cV, aceito: true });
t("pedir a ela a moeda que foi furtada: ela não tem mais", !rPed.ok && rPed.motivo === "naoTem");
const fI = oFurtoPorTransacao({ vitima, coisa: "martelo", posse: antesV, turno: 9, frase: "furto o martelo" });
const rI = aplicarAsTransacoes(null, fichaHeroi(), fI.transacoes, { ...cV, dado: { passou: true } });
t("a coisa nomeada que ela tem passa, e sai da posse dela", rI.ok && rI.ficha.inventario.includes("Martelo de forja") && !posseDe(vitima, rI.posses, rI.ficha, cV).itens.includes("Martelo de forja"));
const fAnel = oFurtoPorTransacao({ vitima, coisa: "anel", posse: antesV, turno: 9, frase: "furto o anel" });
t("a coisa nomeada que ela não tem: nada vem, e nada se inventa", fAnel.semACoisa && !fAnel.transacoes.length && oVereditoDoFurto(null, { alvo: "Bertrand Coyle", coisa: "anel", semACoisa: true }).motivo === "semACoisa");
t("a mesma entrada dá a mesma chave (determinismo)", J(oFurtoPorTransacao({ vitima, coisa: "bolsa", posse: antesV, turno: 7, frase: "furto a bolsa do ferreiro" })) === J(fF));
t("sem vítima, ou o herói como vítima: nada", oFurtoPorTransacao({ vitima: "heroi", posse: antesV }).transacoes.length === 0 && oFurtoPorTransacao(null).transacoes.length === 0);

/* ---------------- §4 ---------------- */
sec("§4 a banca e o balcão por botão");
const banca = congelar({ id: "m1", nome: "Ferraria do Vau", tipo: "ferreiro", estoque: [{ nome: "Adaga", preco: 6, tipo: "arma" }, { nome: "Escudo", preco: 12, tipo: "armadura" }] });
const cidade = congelar({ nome: "Vau", porte: "vila" });
const ctxB = { bancas: [banca], cidade, dia: 3, mercado: { comprados: {}, gastos: {} } };
const caixa0 = podePagar(banca, cidade, 3, 0);
const tsV = aVendaNaBanca({ banca: "m1", nome: "Corda", valor: 4, turno: 2, n: 20 });
const rV = aplicarAsTransacoes(null, fichaHeroi(), tsV, ctxB);
t("vender por botão: a moeda vem e a coisa vai", rV.ok && rV.ficha.moedas === 24 && !rV.ficha.inventario.includes("Corda"));
t("o caixa da banca esvazia (mercado.gastos do dia, a forma de sempre)", rV.ok && J(rV.mercado.gastos.m1) === J({ dia: 3, moedas: 4 }) && posseDe("banca|m1", rV.posses, rV.ficha, { ...ctxB, mercado: rV.mercado }).moedas === caixa0 - 4);
t("a coisa vendida passa a ser da banca", rV.ok && posseDe("banca|m1", rV.posses, rV.ficha, { ...ctxB, mercado: rV.mercado }).itens.some((x) => x === "Corda"));
const tsC = aCompraNaBanca({ banca: "m1", item: { nome: "Adaga", tipo: "arma" }, preco: 6, destino: "equipamento", turno: 2, n: 24 });
const rC = aplicarAsTransacoes(rV.posses, rV.ficha, tsC, { ...ctxB, mercado: rV.mercado, aceito: true });
t("comprar por botão: a coisa vem ao corpo, a moeda vai", rC.ok && rC.ficha.moedas === 18 && rC.ficha.equipamento.some((x) => x && x.nome === "Adaga"));
t("o estoque baixa por comprados, e o caixa enche", rC.ok && J(rC.mercado.comprados.m1) === J(["Adaga"]) && rC.mercado.gastos.m1.moedas === 4 - 6 && posseDe("banca|m1", rC.posses, rC.ficha, { ...ctxB, mercado: rC.mercado }).moedas === caixa0 + 2);
const rCaro = aplicarAsTransacoes(null, fichaHeroi({ moedas: 3 }), aCompraNaBanca({ banca: "m1", item: { nome: "Escudo" }, preco: 12, turno: 2 }), { ...ctxB, aceito: true });
t("sem moeda para pagar, nada muda de mão", !rCaro.ok && rCaro.motivo === "naoTem" && rCaro.mercado === ctxB.mercado);
const rMapa = aplicarAsTransacoes(null, fichaHeroi(), oPagamentoABanca({ banca: "m1", preco: 5, turno: 2, oQue: "mapa" }), ctxB);
t("o que se compra e não vai à bolsa (o mapa): só a moeda passa, e o caixa enche", rMapa.ok && rMapa.ficha.moedas === 15 && rMapa.ficha.inventario.length === 1 && rMapa.mercado.gastos.m1.moedas === -5);
const rBal = aplicarAsTransacoes(null, fichaHeroi(), aCompraNoBalcao({ uso: "racoes", quantos: 3, custo: 6, turno: 2 }), { aceito: true });
t("o balcão: o uso vem do mundo, a moeda vai", rBal.ok && rBal.ficha.suprimentos.racoes === 5 && rBal.ficha.moedas === 14);
const rKit = aplicarAsTransacoes(null, fichaHeroi(), aCompraNoBalcao({ uso: "kit", custo: 10, turno: 2 }), {});
t("o que não é uso contável (o kit): só a moeda passa", rKit.ok && rKit.ficha.moedas === 10 && J(rKit.ficha.suprimentos) === J(fichaHeroi().suprimentos));
const rVu = aplicarAsTransacoes(null, fichaHeroi(), aVendaNaBanca({ banca: "m1", uso: "racoes", quantos: 2, valor: 2, turno: 2 }), ctxB);
t("vender o que é de uso: sai dos suprimentos, a moeda vem do caixa", rVu.ok && rVu.ficha.suprimentos.racoes === 0 && rVu.ficha.moedas === 22 && rVu.mercado.gastos.m1.moedas === 2);

/* ---------------- §5 ---------------- */
sec("§5 a mesma paga duas vezes não paga em dobro");
const paga = oQueOMundoDa({ caminho: "paga", moedas: 30, itens: [{ nome: "Anel de prata", tipo: "anel" }], identidade: "paga|prova_grata|devolver" });
t("a paga sai do mundo, moeda e coisa", paga.length === 2 && paga.every((x) => x.de === "mundo" && x.para === "heroi"));
const p1 = aplicarAsTransacoes(null, fichaHeroi(), paga, {});
const p2 = aplicarAsTransacoes(p1.posses, p1.ficha, paga, {});
t("a primeira paga entra", p1.ok && p1.ficha.moedas === 50 && p1.ficha.inventario.some((x) => x && x.nome === "Anel de prata"));
t("a segunda, com a mesma chave, é recusada e nada muda", !p2.ok && p2.motivo === "jaAplicada" && p2.ficha === p1.ficha);
const pagaOutroTurno = oQueOMundoDa({ caminho: "paga", moedas: 30, identidade: "paga|prova_grata|devolver", turno: 99 });
t("com identidade, o turno não muda a chave (outra rodada não paga de novo)", pagaOutroTurno[0].chave === paga[0].chave);
const g1 = aplicarAsTransacoes(null, fichaHeroi(), oQueSeGasta({ moedas: 5, identidade: "dizimo|3" }), {});
t("o que se gasta vai para o nada", g1.ok && g1.ficha.moedas === 15);
t("moeda zero ou lixo: nenhuma transação", oQueOMundoDa({ moedas: 0 }).length === 0 && oQueSeGasta({ moedas: -2 }).length === 0 && oQueOMundoDa(null).length === 0);
/* sem a chave do Mestre vivo, o App aplica a MESMA transação só à ficha: o resultado tem de ser o de sempre */
const base = congelar(fichaHeroi());
const soFicha = aplicarAsTransacoes(null, base, oQueOMundoDa({ caminho: "espolio", moedas: 7, identidade: "x" }), {});
t("só à ficha, a moeda do mundo dá a conta de sempre", soFicha.ok && J(soFicha.ficha) === J({ ...base, moedas: base.moedas + 7 }));
const soFichaItem = aplicarAsTransacoes(null, base, oQueOMundoDa({ caminho: "achado", itens: [{ nome: "Erva", tipo: "componente" }], identidade: "y" }), {});
t("só à ficha, a coisa do mundo entra no fim da mochila, como sempre", soFichaItem.ok && J(soFichaItem.ficha) === J({ ...base, inventario: [...base.inventario, { nome: "Erva", tipo: "componente" }] }));

/* ---------------- §6 ---------------- */
sec("§6 a cobrança da prosa não cobra o que a porta já aplicou");
const pedido = "pago duas moedas ao guarda";
const op = { bolsa: 20, pedido, soOPedido: true, envelopes: "" };
const semNada = oQueFaltaDebitar("", {}, op);
t("a frase que paga, sem nada aplicado, debita (o caminho de sempre)", semNada.moedas === 2, J(semNada));
const chaves = asChavesQuePagaram(tsC, rC);
t("asChavesQuePagaram: a compra em que a moeda do herói mudou deixa a chave", chaves.length === 1 && chaves[0] === tsC[0].chave);
t("o que não moveu moeda do herói não deixa chave", asChavesQuePagaram(oQueOMundoDa({ caminho: "achado", itens: ["Erva"], identidade: "z" }), { ok: true }).length === 0 && asChavesQuePagaram(tsC, { ok: false }).length === 0);
t("com a chave: o que a porta aplicou neste turno não se cobra de novo", oQueFaltaDebitar("", {}, { ...op, porChave: true, jaAplicadas: chaves }).moedas === 0);
t("com a chave e nada aplicado: a frase debita", oQueFaltaDebitar("", {}, { ...op, porChave: true, jaAplicadas: [] }).moedas === 2);
const env = "[COMPRA — JÁ REGISTRADA PELO SISTEMA] Comprei \"Adaga\" por ◉ 6.";
t("com a chave, a lista de frases dos envelopes deixa de ser consultada", oQueFaltaDebitar("", {}, { ...op, envelopes: env, porChave: true, jaAplicadas: [] }).moedas === 2);
t("sem a chave, a lista de sempre (o jogo de hoje)", oQueFaltaDebitar("", {}, { ...op, envelopes: env }).moedas === 0);

/* ---------------- §7 ---------------- */
sec("§7 a catraca das escritas diretas no App");
/* O TETO, e ele só desce. Uma escrita direta é a linha do App que soma ou subtrai na própria moeda
   (`moedas: (x.moedas || 0) ± n`, com ou sem Math.max) ou que monta a mochila a partir dela mesma
   (`inventario: [...x.inventario, …]`, `x.inventario.filter(…)`). Em 24/11, antes da etapa 7: 37 de
   moeda e 15 de mochila; depois dela, 31 e 11. Caminho que passar a aplicar pela porta
   (os-caminhos-da-posse.js → aplicarAsTransacoes) baixa o número; baixe o teto junto (folga zero). */
const TETO = { moedas: 31, inventario: 11 };
const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const RX = {
  moedas: /\bmoedas:\s*(?:Math\.max\(\s*0\s*,\s*)?\(?\s*[\w.]+\.moedas\b(?:\s*\|\|\s*0)?\s*\)?\s*[-+]/,
  inventario: /\binventario:[^,;]*?(?:\[\s*\.\.\.\s*\(?\s*[\w.]+\.inventario\b|[\w.]+\.inventario\s*\.\s*(?:filter|map|slice|concat)\b|\(\s*[\w.]+\.inventario\s*\|\|\s*\[\]\s*\)\s*\.\s*(?:filter|map|slice|concat)\b)/,
};
for (const k of Object.keys(TETO)) {
  const linhas = app.split("\n").map((l, i) => [i + 1, l]).filter(([, l]) => RX[k].test(l));
  const n = linhas.length;
  t("escritas diretas de «" + k + ":» no App: " + n + " (teto " + TETO[k] + ", só desce)", n <= TETO[k], "SUBIU — aplique pela porta (aplicarAsTransacoes); linhas: " + linhas.filter(([i]) => i).slice(-5).map(([i]) => i).join(", "));
  t("o teto de «" + k + ":» está justo (desceu? baixe o teto para " + n + ")", n >= TETO[k]);
}
t("a régua da catraca pega as formas que conta", RX.moedas.test("const p = { ...p, moedas: (p.moedas || 0) + n };") && RX.moedas.test("moedas: Math.max(0, (pers.moedas || 0) - custo)") && RX.inventario.test("{ ...p, inventario: [...(p.inventario || []), item] }") && !RX.moedas.test("moedas: esp.moedas, xp: 1") && !RX.moedas.test("gastos[x] = { dia, moedas: gastoHojeDe(id) + valor }"));

/* ---------------- §8 ---------------- */
sec("§8 a fiação no App");
t("o App importa os produtores", /from "\.\/os-caminhos-da-posse\.js"/.test(app));
t("a posse de agora deriva a dívida da coisa da quest (só com o Mestre vivo)", /comAsDividasDaQuest\(possesRef\.current/.test(app) && /!mestreVivoLigado\(\) \? possesRef\.current/.test(app));
t("o registro gravado não leva a dívida derivada aberta", /possesRef\.current = semAsDividasDerivadas\(res\.posses\)/.test(app));
t("o furto aplica pela porta, da posse da vítima", /oFurtoPorTransacao\(\{ vitima/.test(app) && /aplicarNaPosse\("o furto"/.test(app));
t("a banca, o balcão e as vendas por botão aplicam pela porta", ["a compra na banca", "a compra no balcão", "a venda do que é de uso", "a venda da bolsa"].every((r) => app.includes('aplicarNaPosse("' + r + '"')));
t("a cobrança recebe as chaves do turno (porChave) e as zera depois", /porChave: true, jaAplicadas: \[\.\.\.\(pagasDoTurnoRef\.current/.test(app) && /pagasDoTurnoRef\.current = \[\];/.test(app));
t("sem o Mestre vivo, o que o sistema dá vai só à ficha (o registro não muda)", /aplicarAsTransacoes\(null, ficha, ts, \{\}\)/.test(app));
t("aChaveDoCaminho: estável e com o caminho na frente", aChaveDoCaminho("furto", 3, "a") === aChaveDoCaminho("furto", 3, "a") && aChaveDoCaminho("furto", 3, "a").startsWith("furto|3|") && aChaveDoCaminho("x", 1).startsWith(OS_CAMINHOS_DA_POSSE.chave.mundo + "|"));

console.log("\n" + bons + " ok, " + maus + " falha(s)");
process.exit(maus ? 1 : 0);
