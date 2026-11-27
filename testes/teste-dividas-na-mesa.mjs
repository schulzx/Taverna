/* DÍVIDAS NA MESA (25/11/2026, identidade e posse · etapa 9) — src/dividas-na-mesa.js,
   e o que a etapa acrescentou a src/quem-tem-o-que.js e src/a-troca-por-transacao.js

   O registro de posse já sabia quem deve a quem; faltava o ciclo inteiro e
   a dívida aparecer para quem joga e para o Narrador. Esta suíte prova o
   MECANISMO, pela forma da transação (de, para, a coisa, o prazo, o
   consentimento), nunca por palavra ou nome — os nomes daqui são de prova:
   §1  os cinco gestos sobre o registro: emprestar, fiado, cobrar,
       devolver, pagar (a quitação parcial e o resto que continua devido);
   §2  a cobrança: quem tem paga e quita; quem tem menos paga o que tem;
       quem não tem nada não paga, e o veredito diz que a dívida continua;
   §3  o prazo: a dívida vencida diz que venceu (e só ela);
   §4  o que se toma deixa o fato (quem, de quem, o quê, viu ou não) e a
       restituição; devolver fecha; do chão e do morto não há rastro;
   §5  a linha da pauta: só com a pessoa EM CENA (pelo id), curta, com teto;
   §6  a quitação dita na tela e no fato (pagar parte, pagar o resto);
   §7  a ficha: as linhas do que se deve;
   §8  o save: o campo novo é aditivo, e o save antigo continua igual;
   §9  determinismo: a mesma chave não aplica duas vezes, e a mesma entrada
       dá a mesma saída;
   §10 a fiação no App (o texto do App, nunca o de src/motor/). */
import { readFileSync } from "node:fs";
import {
  DIVIDAS_NA_MESA, asLinhasDasDividas, quemEstaNaMesa, aQuitacaoDoTurno, comAQuitacao, asDividasDaFicha,
} from "../src/dividas-na-mesa.js";
import { QUEM_TEM_O_QUE, aplicarTransacao, posseDe, posseInicial, garantirPosses, dividasDe, tomadasDe, aDividaVenceu } from "../src/quem-tem-o-que.js";
import { A_TROCA_POR_TRANSACAO, aCobrancaDaLeitura, aplicarAsTransacoes, asTransacoesDoVeredito, oVereditoDaRecusa, oVereditoDoQueVeio, asDividasDaCena } from "../src/a-troca-por-transacao.js";
import { PAUTA_DE_UM_TURNO } from "../src/motor/pauta-do-turno.js";
import { TETO_DA_PAUTA } from "../src/pauta.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (o) => { if (o && typeof o === "object") { Object.freeze(o); for (const v of Object.values(o)) congelar(v); } return o; };

const fichaHeroi = (extra = {}) => ({
  nome: "Aurelia Vane", classe: "Clérigo", moedas: 40, inventario: ["Lampião de latão", "Símbolo sagrado riscado"],
  equipamento: [], equipados: {}, suprimentos: { racoes: 5 },
  grupo: [{ nome: "Lavinia Sallow", classe: "Mago", inventario: ["Corda de cânhamo"], equipamento: [], equipados: {} }],
  ...extra,
});
const SEMENTE = "A prova das dívidas|Fantasia";
const PESSOAS = { "npc|Bento": { nome: "Bento", papel: "pescador" }, "npc|Ione": { nome: "Ione", papel: "lavradora" } };
const ctxBase = (extra = {}) => ({ semente: SEMENTE, dia: 4, pessoas: PESSOAS, ...extra });
const tr = (de, para, oQue, extra = {}) => ({ de, para, oQue, contra: null, consentimento: "dado", origem: "prova", ...extra });
const moedas = (n) => ({ tipo: "moedas", nome: "moedas", quantos: n });
const item = (nome, quantos = 1) => ({ tipo: "item", nome, quantos });
/* o delta que deixa a pessoa com exatamente N moedas (a posse inicial é derivada da semente) */
const comMoedas = (posses, id, n, c) => {
  const P = garantirPosses(posses) || { v: 1, delta: {}, dividas: [], aplicadas: [] };
  const ini = posseInicial(id, c).moedas;
  return garantirPosses({ ...P, delta: { ...P.delta, [id]: { ...(P.delta[id] || {}), moedas: n - ini, entrou: (P.delta[id] || {}).entrou || [], saiu: (P.delta[id] || {}).saiu || [] } } });
};

sec("1. OS CINCO GESTOS SOBRE O REGISTRO");
const c = ctxBase();
{
  /* emprestar: o herói empresta → o outro deve */
  const e = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", moedas(10), { prazo: A_TROCA_POR_TRANSACAO.prazoDoEmprestimo, chave: "g1" }), c);
  t("emprestar: a moeda vai, e quem recebeu fica devendo ao herói", e.ok && e.ficha.moedas === 30 && dividasDe(e.posses, "heroi").aReceber[0].de === "npc|Bento" && dividasDe(e.posses, "heroi").aReceber[0].quanto === 10, J(e.posses && e.posses.dividas));
  t("o prazo do empréstimo sai da tabela (dia + prazoDoEmprestimo)", dividasDe(e.posses, "heroi").aReceber[0].prazo === c.dia + A_TROCA_POR_TRANSACAO.prazoDoEmprestimo);
  /* fiado: a coisa vem, a moeda fica devida (a contrapartida adiada) */
  const banca = { id: "m1", nome: "Banca do porto", tipo: "geral", estoque: [{ nome: "Rede nova", preco: 6 }] };
  const cf = { ...c, bancas: [banca], cidade: { nome: "Vau", porte: "vila" }, mercado: { comprados: {}, gastos: {} } };
  const f = aplicarTransacao(null, fichaHeroi(), tr("banca|m1", "heroi", item("Rede nova"), { contra: moedas(6), consentimento: "pedido", prazo: 3, chave: "g2" }), { ...cf, aceito: true });
  t("fiado: a coisa vem, a moeda não sai, e o herói fica devendo o preço", f.ok && f.ficha.moedas === 40 && f.ficha.inventario.some((x) => (x && x.nome) === "Rede nova") && dividasDe(f.posses, "heroi").deve[0].oQue.tipo === "moedas" && dividasDe(f.posses, "heroi").deve[0].quanto === 6, J(f.motivo));
  /* pagar parte do fiado, depois o resto */
  const p1 = aplicarTransacao(f.posses, f.ficha, tr("heroi", "banca|m1", moedas(2), { consentimento: "devido", chave: "g3" }), cf);
  t("pagar parte: abate, e o resto continua devido", p1.ok && p1.ficha.moedas === 38 && dividasDe(p1.posses, "heroi").deve[0].quanto === 4, J(p1.motivo));
  const p2 = aplicarTransacao(p1.posses, p1.ficha, tr("heroi", "banca|m1", moedas(4), { consentimento: "devido", chave: "g4" }), cf);
  t("pagar o resto: a dívida fecha", p2.ok && dividasDe(p2.posses, "heroi").deve.length === 0 && p2.posses.dividas.every((d) => d.estado === "fechada"));
  t("pagar mais do que se deve pela entrega devida é recusado", aplicarTransacao(p1.posses, p1.ficha, tr("heroi", "banca|m1", moedas(9), { consentimento: "devido" }), cf).motivo === "maisQueDevido");
  /* emprestar uma coisa e devolver */
  const l1 = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Ione", item("Lampião de latão"), { prazo: 2, chave: "g5" }), c);
  t("emprestar uma coisa: ela vai, e volta a ser devida", l1.ok && !l1.ficha.inventario.includes("Lampião de latão") && dividasDe(l1.posses, "npc|Ione").deve[0].oQue.nome === "Lampião de latão");
  const l2 = aplicarTransacao(l1.posses, l1.ficha, tr("npc|Ione", "heroi", item("Lampião de latão"), { consentimento: "devido", chave: "g6" }), c);
  t("devolver: a coisa volta e a dívida fecha", l2.ok && l2.ficha.inventario.includes("Lampião de latão") && dividasDe(l2.posses, "heroi").aReceber.length === 0);
  /* pedir emprestado pela frase: o que vem com prazo abre a dívida do herói (a forma, e não a palavra) */
  const antes = fichaHeroi();
  const depois = { ...antes, inventario: [...antes.inventario, "Rede de pesca"] };
  const v = { estado: "aplicada", ficha: depois, mudou: [{ coisa: "Rede de pesca", quantos: 1, de: "Bento", para: "heroi" }] };
  const ts = asTransacoesDoVeredito(v, { l: { subtipo: "emprestar" }, ficha: antes, pessoas: [{ id: "npc|Bento", nome: "Bento" }], base: { turno: 3, frase: "x" } });
  t("o que vem com prazo leva o prazo da tabela (pedir emprestado)", ts.length === 1 && ts[0].de === "npc|Bento" && ts[0].prazo === A_TROCA_POR_TRANSACAO.prazoDoEmprestimo, J(ts));
  const vd = { estado: "aplicada", ficha: depois, mudou: v.mudou };
  const tsD = asTransacoesDoVeredito(vd, { l: { subtipo: "pedir" }, ficha: antes, pessoas: [{ id: "npc|Bento", nome: "Bento" }], base: { turno: 3, frase: "x" } });
  t("e o pedido sem prazo não abre dívida (só a forma com prazo abre)", tsD.length === 1 && tsD[0].prazo === undefined, J(tsD));
}

sec("2. A COBRANÇA");
{
  const deve5 = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", moedas(5), { prazo: 7, chave: "c1" }), c);
  const leitura = { subtipo: "cobrar", quem: "Bento", quemId: "npc|Bento", coisaTipo: "moeda" };
  const ctxCob = (posses) => ({ posses, ficha: deve5.ficha, pessoas: [{ id: "npc|Bento", nome: "Bento" }], posse: c, base: { turno: 5, frase: "cobro" } });
  /* quem tem, paga e quita */
  const rico = comMoedas(deve5.posses, "npc|Bento", 20, c);
  const cobR = aCobrancaDaLeitura(leitura, ctxCob(rico));
  const resR = aplicarAsTransacoes(rico, deve5.ficha, cobR.transacoes, c);
  t("cobrar de quem tem: paga o devido e quita", resR.ok && resR.ficha.moedas === 40 && dividasDe(resR.posses, "heroi").aReceber.length === 0, J(cobR));
  t("e o veredito diz que a dívida está paga", /paga/.test(oVereditoDoQueVeio(resR, { "npc|Bento": "Bento" }, "v", true).linha));
  /* quem tem menos, paga o que tem; o resto continua */
  const pouco = comMoedas(deve5.posses, "npc|Bento", 3, c);
  const cobP = aCobrancaDaLeitura(leitura, ctxCob(pouco));
  t("cobrar de quem tem menos: a cobrança é do que ele tem", cobP.transacoes[0].oQue.quantos === 3 && cobP.devido === 5, J(cobP));
  const resP = aplicarAsTransacoes(pouco, deve5.ficha, cobP.transacoes, c);
  const vP = oVereditoDoQueVeio(resP, { "npc|Bento": "Bento" }, "v", true);
  t("paga o que tem, e o resto continua devido", resP.ok && resP.ficha.moedas === 38 && dividasDe(resP.posses, "heroi").aReceber[0].quanto === 2, J(resP.motivo));
  t("e o veredito diz o que falta, na coisa certa", /Ainda falta ◉ 2/.test(vP.linha) && /Ainda falta ◉ 2/.test(vP.fato), vP.linha);
  /* quem não tem nada: nada muda, e a dívida continua */
  const nada = comMoedas(deve5.posses, "npc|Bento", 0, c);
  const cobN = aCobrancaDaLeitura(leitura, ctxCob(nada));
  const resN = aplicarAsTransacoes(nada, deve5.ficha, cobN.transacoes, c);
  const vN = oVereditoDaRecusa(resN, { "npc|Bento": "Bento" }, "v");
  t("cobrar de quem não tem nada: recusa, e nada muda de mão", !resN.ok && resN.motivo === "naoTem" && resN.posses === nada);
  t("o veredito diz que a dívida continua (tela e fato)", /Bento ainda lhe deve ◉ 5/.test(vN.linha) && /Bento ainda me deve ◉ 5/.test(vN.fato), vN.linha + " | " + vN.fato);
  /* a coisa emprestada que quem deve já não tem */
  const lamp = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Ione", item("Lampião de latão"), { prazo: 2, chave: "c2" }), c);
  const semLamp = garantirPosses({ ...lamp.posses, delta: { ...lamp.posses.delta, "npc|Ione": { moedas: 0, entrou: [], saiu: [] } } });
  const resL = aplicarAsTransacoes(semLamp, lamp.ficha, [tr("npc|Ione", "heroi", item("Lampião de latão"), { consentimento: "devido", chave: "c3" })], c);
  const vL = oVereditoDaRecusa(resL, { "npc|Ione": "Ione" }, "v");
  t("cobrar a coisa de quem já não a tem: a dívida continua, e o veredito diz", !resL.ok && /Ione ainda lhe deve Lampião de latão/.test(vL.linha), vL.linha);
  /* a recusa que não é de fundos não ganha frase de dívida */
  const vSem = oVereditoDaRecusa({ ok: false, motivo: "semDivida", posses: null, falhou: tr("npc|Bento", "heroi", moedas(3), { consentimento: "devido" }) }, {}, "v");
  t("sem dívida, a recusa não inventa dívida", !/ainda/.test(vSem.linha));
}

sec("3. O PRAZO");
{
  const e = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", moedas(5), { prazo: 3, chave: "z1" }), c);
  const d = dividasDe(e.posses, "heroi").aReceber[0];
  t("a dívida guarda o dia em que vence", d.prazo === c.dia + 3);
  t("no dia do prazo ainda não venceu; no seguinte, venceu", !aDividaVenceu(d, d.prazo) && aDividaVenceu(d, d.prazo + 1));
  t("sem prazo, nunca vence; fechada, nunca vence", !aDividaVenceu({ ...d, prazo: 0 }, 9999) && !aDividaVenceu({ ...d, estado: "fechada" }, 9999) && !aDividaVenceu(null, 3));
  const cena = [{ id: "npc|Bento", nome: "Bento" }];
  const noPrazo = asLinhasDasDividas(cena, { posses: e.posses, dia: d.prazo });
  const vencida = asLinhasDasDividas(cena, { posses: e.posses, dia: d.prazo + 2 });
  t("a linha da dívida no prazo não fala de prazo", noPrazo && !/venceu/.test(noPrazo.acabou[0]), J(noPrazo));
  t("a vencida diz que venceu, e em que dia", vencida && new RegExp("venceu no dia " + d.prazo).test(vencida.acabou[0]), J(vencida));
  const fichaV = asDividasDaFicha(e.posses, { dia: d.prazo + 2, nomes: { "npc|Bento": "Bento" } });
  t("na ficha, a vencida vem marcada", fichaV.length === 1 && fichaV[0].vencida && /venceu/.test(fichaV[0].texto), J(fichaV));
}

sec("4. O QUE SE TOMA DEIXA RASTRO");
{
  const vivo = comMoedas(null, "npc|Bento", 12, c);
  /* às escondidas (a mão que passou sem ser vista) */
  const s = aplicarTransacao(vivo, fichaHeroi(), tr("npc|Bento", "heroi", moedas(12), { consentimento: "tomado", chave: "t1" }), { ...c, dado: { passou: true, escondido: true }, onde: "o cais" });
  const T = tomadasDe(s.posses, "heroi");
  t("tomar às escondidas: a moeda vem, e o fato fica (quem, o quê, onde, não viu)", s.ok && s.ficha.moedas === 52 && T.tomou.length === 1 && T.tomou[0].de === "npc|Bento" && T.tomou[0].onde === "o cais" && T.tomou[0].viu === false && T.tomou[0].oQue.quantos === 12, J(s.posses && s.posses.tomadas));
  t("do lado da vítima, o mesmo fato", tomadasDe(s.posses, "npc|Bento").perdeu.length === 1);
  t("e a restituição fica devida, pela mesma forma de dívida", dividasDe(s.posses, "heroi").deve.some((d) => d.para === "npc|Bento" && d.quanto === 12 && d.id.startsWith(QUEM_TEM_O_QUE.tomada.divida)));
  t("o fato da transação diz que a vítima não viu", /não viu/.test(s.fato), s.fato);
  /* à força (sem a marca): quem perde vê */
  const f = aplicarTransacao(vivo, fichaHeroi(), tr("npc|Bento", "heroi", moedas(4), { consentimento: "tomado", chave: "t2" }), { ...c, dado: { passou: true } });
  t("tomar sem a marca de escondido: a vítima viu", f.ok && tomadasDe(f.posses, "heroi").tomou[0].viu === true && /viu\./.test(f.fato));
  /* devolver o que se tomou fecha a restituição */
  const dv = aplicarTransacao(s.posses, s.ficha, tr("heroi", "npc|Bento", moedas(12), { consentimento: "devido", chave: "t3" }), c);
  t("devolver o que se tomou: a restituição fecha, e o fato fica (fechado)", dv.ok && dividasDe(dv.posses, "heroi").deve.length === 0 && tomadasDe(dv.posses, "heroi").tomou[0].aberta === false);
  /* do chão e do morto, ninguém perde: sem rastro */
  const morto = aplicarTransacao(vivo, fichaHeroi(), tr("npc|Bento", "heroi", moedas(2), { consentimento: "tomado", chave: "t4" }), { ...c, mortos: ["npc|Bento"] });
  t("do morto: a coisa vem, sem fato e sem restituição", morto.ok && !(morto.posses.tomadas || []).length && dividasDe(morto.posses, "heroi").deve.length === 0);
  const chao = aplicarTransacao(null, fichaHeroi(), tr("chao|x", "heroi", item("Faca"), { consentimento: "tomado", chave: "t5" }), { ...c, chao: { cena: "x", itens: [{ id: "a1", nome: "Faca", especie: "largado" }] } });
  t("do chão: sem fato", chao.ok && !(chao.posses && chao.posses.tomadas || []).length);
  /* o que se dá não deixa rastro de tomada */
  const dado = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", moedas(1), { chave: "t6" }), c);
  t("dar não deixa fato de tomada", dado.ok && !(dado.posses.tomadas || []).length);
  /* a restituição entra na cena da forma da troca: dar à vítima é devolver o que se deve */
  const ds = asDividasDaCena([{ nome: "Bento", id: "npc|Bento" }], { posses: s.posses });
  t("a restituição é traço da cena (heroiDeve), como toda dívida", ds.length === 1 && ds[0].heroiDeve[0].quanto === 12);
}

sec("5. A LINHA DA PAUTA — só com a pessoa em cena");
{
  const e = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", moedas(5), { prazo: 7, chave: "p1" }), c);
  const l = aplicarTransacao(e.posses, e.ficha, tr("npc|Ione", "heroi", item("Rede de pesca"), { prazo: 7, consentimento: "pedido", chave: "p2" }), { ...c, aceito: true, pessoas: { ...PESSOAS, "npc|Ione": { nome: "Ione", papel: "pescadora" } } });
  const P = l.posses;
  t("ninguém em cena: nada entra", asLinhasDasDividas([], { posses: P, dia: 4 }) === null && asLinhasDasDividas(null, { posses: P }) === null);
  t("quem está em cena sem dívida: nada entra", asLinhasDasDividas([{ id: "npc|Outro", nome: "Outro" }], { posses: P, dia: 4 }) === null);
  const soBento = asLinhasDasDividas([{ id: "npc|Bento", nome: "Bento, o pescador" }], { posses: P, dia: 4 });
  t("o devedor em cena: a linha diz que ele me deve (e só ele)", soBento && soBento.acabou.length === 1 && soBento.acabou[0] === "Bento me deve ◉ 5.", J(soBento));
  const soIone = asLinhasDasDividas([{ id: "npc|Ione", nome: "Ione" }], { posses: P, dia: 4 });
  t("o credor em cena: a linha diz que eu devo", soIone && soIone.acabou[0] === "Devo Rede de pesca a Ione.", J(soIone));
  t("a presença é pelo id: o mesmo nome com outro id não leva a linha", asLinhasDasDividas([{ id: "npc|Bento~2", nome: "Bento" }], { posses: P, dia: 4 }) === null);
  t("sem registro, nada (e lixo não derruba)", asLinhasDasDividas([{ id: "npc|Bento" }], { posses: null }) === null && asLinhasDasDividas("x", "y") === null);
  t("a secção é do canal de um turno (nenhum bloco estático)", PAUTA_DE_UM_TURNO.secoes.includes(DIVIDAS_NA_MESA.secao));
  /* o teto: muitas dívidas com muita gente em cena não passam do teto de linhas, e cada linha é curta */
  let muitas = null;
  for (let i = 0; i < 8; i++) muitas = aplicarTransacao(muitas, fichaHeroi({ moedas: 100 }), tr("heroi", `npc|P${i}`, moedas(1), { prazo: 2, chave: "m" + i }), c).posses;
  const cheia = asLinhasDasDividas(Array.from({ length: 8 }, (_, i) => ({ id: `npc|P${i}`, nome: `P${i}` })), { posses: muitas, dia: 4 });
  t("o teto de linhas por turno vale", cheia && cheia.acabou.length === DIVIDAS_NA_MESA.teto.linhas);
  t("e o pior caso cabe folgado no teto da pauta (um décimo dele)", cheia.acabou.join("\n").length < TETO_DA_PAUTA / 10, String(cheia.acabou.join("\n").length));
  /* o que se tomou, com a vítima em cena */
  const vivo = comMoedas(null, "npc|Bento", 6, c);
  const s = aplicarTransacao(vivo, fichaHeroi(), tr("npc|Bento", "heroi", moedas(6), { consentimento: "tomado", chave: "p3" }), { ...c, dado: { passou: true, escondido: true } });
  const lt = asLinhasDasDividas([{ id: "npc|Bento", nome: "Bento" }], { posses: s.posses, dia: 4 });
  t("a vítima em cena: o fato diz que ela não sabe (e não vira «devo»)", lt && lt.acabou.length === 1 && /não sabe que fui eu/.test(lt.acabou[0]) && !/^Devo/.test(lt.acabou[0]), J(lt));
  const f = aplicarTransacao(vivo, fichaHeroi(), tr("npc|Bento", "heroi", moedas(6), { consentimento: "tomado", chave: "p4" }), { ...c, dado: { passou: true } });
  t("a vítima que viu: o fato diz que viu", /viu\.$/.test(asLinhasDasDividas([{ id: "npc|Bento", nome: "Bento" }], { posses: f.posses, dia: 4 }).acabou[0]));
  /* o grupo está sempre à mesa */
  const naMesa = quemEstaNaMesa([{ id: "npc|Bento", nome: "Bento" }, { nome: "sem id" }], fichaHeroi().grupo);
  t("quem está à mesa: a presença com id e o grupo pelo id do grupo", naMesa.length === 2 && naMesa[0].id === "npc|Bento" && naMesa[1].nome === "Lavinia Sallow" && naMesa[1].id.length > 0, J(naMesa));
  t("quem está à mesa: lixo dá vazio", quemEstaNaMesa(null, null).length === 0);
}

sec("6. A QUITAÇÃO DITA");
{
  const banca = { id: "m1", nome: "Banca do porto", tipo: "geral", estoque: [{ nome: "Rede nova", preco: 6 }] };
  const cf = { ...c, bancas: [banca], cidade: { nome: "Vau", porte: "vila" }, mercado: { comprados: {}, gastos: {} } };
  const f = aplicarTransacao(null, fichaHeroi(), tr("banca|m1", "heroi", item("Rede nova"), { contra: moedas(6), consentimento: "pedido", prazo: 3, chave: "q1" }), { ...cf, aceito: true });
  const ts1 = [tr("heroi", "banca|m1", moedas(2), { consentimento: "devido", chave: "q2" })];
  const r1 = aplicarAsTransacoes(f.posses, f.ficha, ts1, cf);
  const q1 = aQuitacaoDoTurno(ts1, f.posses, r1.posses, { "banca|m1": "Cornelius" });
  t("pagar parte: a tela e o fato dizem o que ainda falta", /Ainda falta ◉ 4 para Cornelius/.test(q1.linha) && /Ainda devo ◉ 4 a Cornelius/.test(q1.fato), J(q1));
  const ts2 = [tr("heroi", "banca|m1", moedas(4), { consentimento: "devido", chave: "q3" })];
  const r2 = aplicarAsTransacoes(r1.posses, r1.ficha, ts2, cf);
  const v2 = comAQuitacao({ linha: "💰 Você paga ◉ 4.", fato: "Paguei ◉ 4." }, ts2, r1.posses, r2.posses, { "banca|m1": "Cornelius" });
  t("pagar o resto: o veredito diz que está paga", /está paga/.test(v2.linha) && /está paga/.test(v2.fato), J(v2));
  const dar = [tr("heroi", "npc|Bento", moedas(1), { chave: "q4" })];
  const vd = { linha: "x", fato: "y" };
  t("a entrega que não é devida não ganha quitação (o mesmo veredito)", comAQuitacao(vd, dar, null, null, {}) === vd && aQuitacaoDoTurno(null, null, null, null).linha === "");
}

sec("7. A FICHA");
{
  const e = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", moedas(5), { prazo: 7, chave: "h1" }), c);
  const l = aplicarTransacao(e.posses, e.ficha, tr("npc|Ione", "heroi", item("Rede de pesca"), { prazo: 7, consentimento: "pedido", chave: "h2" }), { ...c, aceito: true, pessoas: { ...PESSOAS, "npc|Ione": { nome: "Ione", papel: "pescadora" } } });
  const linhas = asDividasDaFicha(l.posses, { dia: 4, nomes: { "npc|Bento": "Bento", "npc|Ione": "Ione" } });
  t("o que o herói deve e o que lhe devem, com o prazo", linhas.length === 2 && linhas[0].texto === "Você deve Rede de pesca a Ione (até o dia 11)" && linhas[1].texto === "Bento lhe deve ◉ 5 (até o dia 11)", J(linhas));
  t("sem registro, nenhuma linha", asDividasDaFicha(null, {}).length === 0 && asDividasDaFicha("x", null).length === 0);
  const vivo = comMoedas(null, "npc|Bento", 6, c);
  const s = aplicarTransacao(vivo, fichaHeroi(), tr("npc|Bento", "heroi", moedas(6), { consentimento: "tomado", chave: "h3" }), { ...c, dado: { passou: true, escondido: true } });
  t("a restituição do que se tomou não aparece na ficha", asDividasDaFicha(s.posses, { dia: 4 }).length === 0);
}

sec("8. O SAVE");
{
  const vivo = comMoedas(null, "npc|Bento", 6, c);
  const s = aplicarTransacao(vivo, fichaHeroi(), tr("npc|Bento", "heroi", moedas(6), { consentimento: "tomado", chave: "s1" }), { ...c, dado: { passou: true, escondido: true } });
  const ida = garantirPosses(JSON.parse(J(s.posses)));
  t("o fato do que se tomou sobrevive a gravar e carregar", ida.tomadas && ida.tomadas.length === 1 && ida.tomadas[0].viu === false);
  const antigo = { v: 1, delta: { "npc|Bento": { moedas: 3, entrou: [], saiu: [] } }, dividas: [], aplicadas: ["k"] };
  t("o save sem o campo novo continua com a forma de sempre (sem `tomadas`)", !("tomadas" in garantirPosses(antigo)) && J(Object.keys(garantirPosses(antigo))) === J(["v", "delta", "dividas", "aplicadas"]));
  t("o campo novo com lixo é descartado, nunca exceção", garantirPosses({ tomadas: [null, 1, "x", { id: "a" }, { id: "b", de: "npc|X", por: "heroi", oQue: { tipo: "ouro" } }] }) === null);
  let muitas = garantirPosses({ tomadas: Array.from({ length: QUEM_TEM_O_QUE.teto.tomadas + 9 }, (_, i) => ({ id: "tom|" + i, de: "npc|X", por: "heroi", oQue: moedas(1) })) });
  t("o campo novo tem teto (ficam as últimas)", muitas.tomadas.length === QUEM_TEM_O_QUE.teto.tomadas && muitas.tomadas[muitas.tomadas.length - 1].id === "tom|" + (QUEM_TEM_O_QUE.teto.tomadas + 8));
  t("a dívida de sempre não ganhou campo novo (a forma dela não muda)", J(Object.keys(s.posses.dividas[0]).sort()) === J(["de", "dia", "estado", "id", "oQue", "origem", "para", "prazo", "quanto"]));
}

sec("9. DETERMINISMO");
{
  const vivo = congelar(comMoedas(null, "npc|Bento", 8, c));
  const ficha = congelar(fichaHeroi());
  const t1 = tr("npc|Bento", "heroi", moedas(8), { consentimento: "tomado", chave: "d1" });
  const a = aplicarTransacao(vivo, ficha, t1, { ...c, dado: { passou: true, escondido: true } });
  const b = aplicarTransacao(vivo, ficha, t1, { ...c, dado: { passou: true, escondido: true } });
  t("a mesma entrada dá a mesma saída (byte a byte), sem mutar nada", J(a) === J(b));
  const de2 = aplicarTransacao(a.posses, a.ficha, t1, { ...c, dado: { passou: true, escondido: true } });
  t("a mesma chave duas vezes não aplica duas vezes (nem o fato, nem a restituição)", !de2.ok && de2.motivo === "jaAplicada" && de2.posses === a.posses && a.posses.tomadas.length === 1 && dividasDe(a.posses, "heroi").deve.length === 1);
  const e = aplicarTransacao(null, ficha, tr("heroi", "npc|Bento", moedas(5), { prazo: 7, chave: "d2" }), c);
  const tsP = [tr("npc|Bento", "heroi", moedas(2), { consentimento: "devido", chave: "d3" })];
  const p1 = aplicarAsTransacoes(comMoedas(e.posses, "npc|Bento", 10, c), e.ficha, tsP, c);
  const p2 = aplicarAsTransacoes(p1.posses, p1.ficha, tsP, c);
  t("a mesma cobrança duas vezes abate uma vez só", p1.ok && !p2.ok && p2.motivo === "jaAplicada" && dividasDe(p1.posses, "heroi").aReceber[0].quanto === 3);
  t("a linha da pauta é a mesma para a mesma entrada", J(asLinhasDasDividas([{ id: "npc|Bento", nome: "Bento" }], { posses: p1.posses, dia: 4 })) === J(asLinhasDasDividas([{ id: "npc|Bento", nome: "Bento" }], { posses: p1.posses, dia: 4 })));
  const src = readFileSync(new URL("../src/dividas-na-mesa.js", import.meta.url), "utf8");
  t("o módulo não lê relógio nem sorte", !/Date\.now|new Date|Math\.random/.test(src));
}

sec("10. A FIAÇÃO NO APP");
{
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  t("a linha das dívidas entra na pauta de um turno, atrás da chave do Mestre vivo", /mestreVivoLigado\(\)\) \{ try \{ const posM = aPosseAgora\(\) \|\| \{\}; const dvM = asLinhasDasDividas\(/.test(app) && /if \(dvM\) porNaPautaDoTurno\(dvM\)/.test(app));
  t("quem está à mesa sai da presença por id e do grupo", /quemEstaNaMesa\(/.test(app));
  /* 25/11 (a reação da vítima): a marca deixou de ser sempre `true` — a mão leve que passou por pouco
     (o preço do furto: «o tilintar tem ouvidos») é vista; o sucesso limpo continua às escondidas. A
     intenção da asserção (o furto passa a marca ao dado) fica, agora pela régua aMaoFoiVista. */
  t("o furto às escondidas passa a marca ao dado", /dado: \{ passou: true, escondido: !aMaoFoiVista\(/.test(app));
  t("a troca da frase diz a quitação", /comAQuitacao\(/.test(app));
  t("a ficha lê as linhas da dívida (atrás da chave)", /asDividasDaFicha\(/.test(app));
}

console.log(`\n${bons} ok, ${maus} falharam`);
if (maus) process.exit(1);
