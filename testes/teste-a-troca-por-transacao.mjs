/* ============================================================
   A TROCA POR TRANSAÇÃO (23/11, etapa 6 da planta mente/plano-identidade-e-posse.md)
   A frase de troca decidida pela porta única vira transações com ids, e quem
   as aplica é aplicarTransacao, uma vez. Aqui:
     §1 a porta devolve transações para os doze tipos (ou diz por que não);
     §2 a estrutura recusa o que não se sustenta (devolver sem dívida, cobrar
        sem dívida, quem não tem não dá) e fecha o que se sustenta;
     §3 a chave não aplica duas vezes; a lista é tudo ou nada;
     §4 o save sem `posses` funciona; a ficha do herói é a mesma do veredito;
     §5 a fiação lê (o App, o estado e o replay).
   Só funções puras importadas; o texto lido é o do App, do estado e da sessão.
   ============================================================ */
import { readFileSync } from "node:fs";
import { aPortaUnica } from "../src/motor/uma-porta-so.js";
import { osPratosDaCasa } from "../src/motor/a-cena-do-ouvido.js";
import { A_TROCA_POR_TRANSACAO, asTransacoesDoVeredito, aCobrancaDaLeitura, aTransacaoDoPedido, aplicarAsTransacoes, aChaveDaTroca, oLadoDaTroca, nomesDasTransacoes, oVereditoDaRecusa, oVereditoDoQueVeio } from "../src/a-troca-por-transacao.js";
import { aplicarTransacao, dividasDe, posseDe, garantirPosses } from "../src/quem-tem-o-que.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;
const ler = (rel) => readFileSync(new URL(rel, import.meta.url), "utf8");

/* ---------------- a cena ---------------- */
const BANCAS = [
  { id: "geral|sino", nome: "O Sino Rachado", tipo: "geral", estoque: [{ nome: "Corda de cânhamo", preco: 2, tipo: "util" }, { nome: "Espada curta", preco: 9, tipo: "arma" }] },
  { nome: "Balcão de mantimentos", estoque: [{ nome: "Ração", preco: 7, uso: "racoes" }, { nome: "Tochas", preco: 1, uso: "tochas" }] },
];
const CASA = osPratosDaCasa([{ rx: "\\b(sopas?|caldos?|ensopados?)\\b", preco: 3 }]);
const LAVINIA = () => ({ nome: "Lavinia Sallow", inventario: [{ nome: "Faca de caça" }] });
const SIMBOLO = { nome: "Símbolo sagrado riscado", tipo: "amuleto" };
const ficha = (moedas = 40, inv = [SIMBOLO]) => ({ moedas, inventario: inv, equipamento: [], equipados: {}, suprimentos: { racoes: 2, agua: 1, tochas: 5, kit: false }, grupo: [LAVINIA()] });
const PESSOAS = [{ id: "Rio|gente|Prudence", nome: "Prudence", papel: "lavadeira" }, { id: "npc|Charity Mordaunt", nome: "Charity Mordaunt", papel: "taverneira" }];
const ret = (f, extra = {}) => ({ lugar: { nome: "A Lâmpada", tipo: "taverna" }, pessoas: PESSOAS, grupo: f.grupo, bancas: BANCAS, ausentes: [], conhecidos: [], chao: [], ficha: f, casa: CASA, anteriores: {}, ...extra });
const OFERTA = () => ({ valor: 7, quem: { id: "geral|sino", nome: "O Sino Rachado" } });
const OFERTA_DO_USO = (id, q) => ({ valor: Math.max(1, Math.floor(q / 2)), quem: { id: "geral|sino", nome: "O Sino Rachado" } });
const POSSE = (posses = null, extra = {}) => ({ posses, semente: "s1", dia: 3, cidade: { nome: "Rio", porte: "cidade" }, mercado: { comprados: {}, gastos: {} }, chao: null, nucleo: [], mortos: [], pessoas: { "Rio|gente|Prudence": { nome: "Prudence", papel: "lavadeira" } }, ...extra });
const CTX = (posses, extra) => ({ ofertaDe: OFERTA, ofertaDoUso: OFERTA_DO_USO, vaiAoCorpo: ["arma", "escudo"], aPosse: POSSE(posses), turno: 7, ...(extra || {}) });
const porta = (frase, f = ficha(), posses = null, extra) => aPortaUnica(frase, ret(f), CTX(posses, extra));
/* aplica como o App: aplicarAsTransacoes com a posse de agora, aceito (a porta já decidiu) */
const aplicar = (r, f, posses = null, extra = {}) => aplicarAsTransacoes(posses, f, r.transacoes, { ...POSSE(posses), bancas: BANCAS, aceito: true, ...extra });

sec("§1 a porta devolve transações (os doze tipos)");
{
  const f = ficha();
  const dar = porta("dou cinco moedas à Prudence", f);
  t("dar moedas: heroi → o id da Prudence, ◉ 5, dado", dar.caminho === "aplicado" && dar.transacoes && dar.transacoes.length === 1 && dar.transacoes[0].de === "heroi" && dar.transacoes[0].para === "Rio|gente|Prudence" && dar.transacoes[0].oQue.tipo === "moedas" && dar.transacoes[0].oQue.quantos === 5 && dar.transacoes[0].consentimento === "dado", J(dar.transacoes));
  const ap = aplicar(dar, f);
  t("…aplicada, a ficha é a do veredito (◉ 35) e a Prudence tem as cinco a mais", ap.ok && ap.ficha.moedas === dar.veredito.ficha.moedas && ap.ficha.moedas === 35 && posseDe("Rio|gente|Prudence", ap.posses, ap.ficha, POSSE(ap.posses)).moedas === posseDe("Rio|gente|Prudence", null, f, POSSE()).moedas + 5);

  const emp = porta("empresto cinco moedas à Prudence", f);
  t("emprestar: dado com prazo (a tabela)", emp.transacoes && emp.transacoes[0].prazo === A_TROCA_POR_TRANSACAO.prazoDoEmprestimo && emp.transacoes[0].consentimento === "dado", J(emp.transacoes));
  const apE = aplicar(emp, f);
  t("…abre a dívida da Prudence com o herói, de ◉ 5", apE.ok && dividasDe(apE.posses, "heroi").aReceber.some((d) => d.de === "Rio|gente|Prudence" && d.quanto === 5));

  const dev = porta("devolvo o símbolo sagrado riscado à Prudence", f);
  t("devolver sem dívida: a estrutura recusa antes da ficha (T14)", dev.caminho === "nao" && dev.veredito && dev.veredito.motivo === "semDivida" && /não deve/.test(dev.veredito.linha), dev.veredito && dev.veredito.linha);

  const pag = porta("pago duas moedas à Prudence", f);
  t("pagar a quem não se deve: dado", pag.transacoes && pag.transacoes[0].consentimento === "dado" && pag.transacoes[0].oQue.quantos === 2, J(pag.transacoes));

  const comp = porta("compro a corda de cânhamo", f);
  t("comprar da banca: o cartão (o preço é do sistema) já com a transação: a banca → herói, contra ◉ 2, pedido", comp.caminho === "cartao" && comp.transacoes && comp.transacoes[0].de === "banca|geral|sino" && comp.transacoes[0].para === "heroi" && comp.transacoes[0].contra && comp.transacoes[0].contra.quantos === 2 && comp.transacoes[0].consentimento === "pedido", J(comp.transacoes));
  const comp2 = porta("compro a corda de cânhamo", f, null, { confirmado: comp.cartao });
  t("…o clique aplica a MESMA transação, com a mesma chave", comp2.caminho === "aplicado" && J(comp2.transacoes) === J(comp.transacoes));
  const apC = aplicar(comp2, f);
  t("…a corda entra na mochila, a moeda sai, e a baixa vai a mercado.comprados (o adaptador)", apC.ok && apC.ficha.moedas === 38 && apC.ficha.inventario.some((x) => x.nome === "Corda de cânhamo") && J(apC.mercado.comprados["geral|sino"]) === J(["Corda de cânhamo"]));
  t("…e a ficha é a mesma que o veredito de hoje calculava", J(apC.ficha) === J(comp2.veredito.ficha), J(apC.ficha) + " vs " + J(comp2.veredito.ficha));

  const esp = porta("compro a espada curta", f, null);
  const esp2 = porta("compro a espada curta", f, null, { confirmado: esp.cartao });
  const apS = esp2.transacoes ? aplicar(esp2, f) : { ok: false };
  t("comprar arma: vai ao corpo (o destino viaja na transação)", apS.ok && apS.ficha.equipamento.some((x) => x.nome === "Espada curta") && J(apS.ficha) === J(esp2.veredito.ficha), J(esp2.transacoes));

  const rac = porta("compro uma ração", f);
  const rac2 = porta("compro uma ração", f, null, { confirmado: rac.cartao });
  const apR = rac2.transacoes ? aplicar(rac2, f) : { ok: false };
  t("comprar do balcão: o uso entra nos suprimentos (o mundo é o balcão, sem id)", apR.ok && apR.ficha.suprimentos.racoes === 3 && J(apR.ficha) === J(rac2.veredito.ficha), J(rac2.transacoes));

  const ven = porta("vendo o símbolo sagrado riscado", f);
  const ven2 = porta("vendo o símbolo sagrado riscado", f, null, { confirmado: ven.cartao });
  t("vender: herói → a banca que compra, contra ◉ 7, dado", ven2.transacoes && ven2.transacoes[0].para === "banca|geral|sino" && ven2.transacoes[0].contra.quantos === 7, J(ven2.transacoes));
  const apV = ven2.transacoes ? aplicar(ven2, f) : { ok: false };
  t("…a moeda sai da gaveta da banca (mercado.gastos), e a ficha é a do veredito", apV.ok && apV.mercado.gastos["geral|sino"].moedas === 7 && J(apV.ficha) === J(ven2.veredito.ficha));

  const darC = porta("dou o símbolo sagrado riscado a Lavinia", f);
  t("dar ao companheiro: o id do grupo, e a coisa vai ao inventário dele", darC.transacoes && darC.transacoes[0].para === "npc|Lavinia Sallow" && aplicar(darC, f).ficha.grupo[0].inventario.some((x) => x.nome === "Símbolo sagrado riscado"), J(darC.transacoes));
  const ped = porta("Lavinia, me passa a faca de caça", f);
  t("pedir ao companheiro: pedido, com o aceite que a regra de hoje dá", ped.caminho !== "aplicado" || (ped.transacoes && ped.transacoes[0].de === "npc|Lavinia Sallow" && ped.transacoes[0].consentimento === "pedido" && aplicar(ped, f).ok), J(ped.transacoes) + " " + ped.caminho);

  const cob = porta("Prudence, você me deve cinco moedas. Estou cobrando.", f);
  t("cobrar sem dívida: a estrutura recusa (T46: nunca vira pagamento ao contrário)", cob.caminho === "nao" && cob.veredito && cob.veredito.motivo === "semDivida" && (!cob.veredito.ficha), cob.caminho + " " + (cob.veredito && cob.veredito.linha));

  /* os tipos que vão ao dado: o pedido de graça e o tomar levam a transação que o dado decide */
  const furto = porta("furto a bolsa da Prudence", f);
  t("furtar vai ao dado (a etapa 7 leva o furto), sem transação aplicada", furto.caminho === "dado" || furto.caminho === "nao" || furto.caminho === "pergunta", furto.caminho);
  const sub = porta("ofereço três moedas à Prudence para ela esquecer", f);
  t("subornar: uma resposta só (o dado ou o veredito), nunca a ficha escrita sem transação", ["dado", "nao", "aplicado", "pergunta"].includes(sub.caminho) && (sub.caminho !== "aplicado" || (sub.transacoes && sub.transacoes.length)), sub.caminho);
  const peg = porta("pego a corda de cânhamo", f);
  t("pegar da banca não leva sem pagar (nenhuma transação aplicada)", peg.caminho !== "aplicado", peg.caminho);
  const esc = porta("troco o símbolo sagrado riscado pela corda de cânhamo do Sino Rachado", f);
  t("escambo: quando aplica, herói → banca com a coisa do outro como contrapartida", esc.caminho !== "aplicado" || (esc.transacoes && esc.transacoes[0].contra && esc.transacoes[0].contra.tipo === "item"), esc.caminho + " " + J(esc.transacoes));
}

sec("§2 o outro lado existe: a estrutura recusa e fecha");
{
  const f = ficha();
  /* emprestar e cobrar de volta */
  const emp = porta("empresto cinco moedas à Prudence", f);
  const apE = aplicar(emp, f);
  const f2 = apE.ficha, P2 = apE.posses;
  const cob = porta("Prudence, me devolve as cinco moedas que te emprestei", f2, P2, { turno: 8 });
  const cob2 = cob.caminho === "aplicado" ? cob : porta("cobro as cinco moedas da Prudence", f2, P2, { turno: 8 });
  t("com a dívida aberta, cobrar aplica sem dado: Prudence → herói, devido", cob2.caminho === "aplicado" && cob2.transacoes[0].consentimento === "devido" && cob2.transacoes[0].de === "Rio|gente|Prudence", cob2.caminho + " " + J(cob2.transacoes) + " " + (cob2.veredito && cob2.veredito.linha));
  const apC = cob2.transacoes ? aplicar(cob2, f2, P2) : { ok: false };
  t("…a moeda volta, e a dívida fecha", apC.ok && apC.ficha.moedas === 40 && !dividasDe(apC.posses, "heroi").aReceber.length);
  t("…a linha diz quem passou e que a dívida está paga", cob2.veredito && /^🤲 Prudence lhe passa ◉ 5\. A dívida está paga\./.test(cob2.veredito.linha), cob2.veredito && cob2.veredito.linha);

  /* o herói deve, e paga */
  const Pdeve = garantirPosses({ dividas: [{ id: "d1", de: "heroi", para: "Rio|gente|Prudence", oQue: { tipo: "moedas", nome: "moedas", quantos: 3 }, quanto: 3, dia: 1, prazo: 8 }] });
  const pag = porta("pago três moedas à Prudence", f, Pdeve);
  t("pagar a quem se deve: devido (fecha a dívida)", pag.transacoes && pag.transacoes[0].consentimento === "devido" && aplicar(pag, f, Pdeve).ok && !dividasDe(aplicar(pag, f, Pdeve).posses, "heroi").deve.length, J(pag.transacoes));
  const pag5 = porta("pago cinco moedas à Prudence", f, Pdeve);
  t("pagar mais do que se deve: o devido fecha, o resto vai como dado", pag5.transacoes && pag5.transacoes.length === 2 && pag5.transacoes[0].consentimento === "devido" && pag5.transacoes[0].oQue.quantos === 3 && pag5.transacoes[1].oQue.quantos === 2, J(pag5.transacoes));

  /* dar e pedir parte de volta: sem dívida, é pedido, e o dado decide — ela TEM as moedas */
  const dar = porta("dou quinze moedas à Prudence", f);
  const apD = aplicar(dar, f);
  const ts = aTransacaoDoPedido({ subtipo: "pedir", quem: "Prudence", quemId: "Rio|gente|Prudence", coisaTipo: "moeda", quantia: 5 }, { tipo: "deGraca" }, { pessoas: PESSOAS, base: { turno: 9, frase: "x" } });
  t("o pedido de volta vira transação pedida (Prudence → herói)", ts.length === 1 && ts[0].consentimento === "pedido" && ts[0].de === "Rio|gente|Prudence", J(ts));
  const semDado = aplicarAsTransacoes(apD.posses, apD.ficha, ts, POSSE(apD.posses));
  const comDado = aplicarAsTransacoes(apD.posses, apD.ficha, ts, { ...POSSE(apD.posses), dado: { passou: true } });
  t("…sem resposta, não; com o dado passado, ela tem as quinze e dá cinco", !semDado.ok && semDado.motivo === "semResposta" && comDado.ok && comDado.ficha.moedas === apD.ficha.moedas + 5);
  const muito = aTransacaoDoPedido({ subtipo: "pedir", quem: "Prudence", quemId: "Rio|gente|Prudence", coisaTipo: "moeda", quantia: 500 }, { tipo: "deGraca" }, { base: { turno: 9 } });
  t("…e o que ela não tem, ela não dá (naoTem), nem com o dado", aplicarAsTransacoes(apD.posses, apD.ficha, muito, { ...POSSE(apD.posses), dado: { passou: true } }).motivo === "naoTem");
  const vd = oVereditoDoQueVeio(comDado, { "Rio|gente|Prudence": "Prudence" }, "v", false);
  t("…a linha do que veio é de mesa", vd && vd.linha === "🤲 Prudence lhe passa ◉ 5." && vd.estado === "aplicada", vd && vd.linha);

  /* devolver à banca de onde a coisa saiu: o registro diz a origem */
  const CORDA = { nome: "Corda de cânhamo", tipo: "util" };
  const fC = ficha(13, [SIMBOLO, CORDA]);
  const t0 = asTransacoesDoVeredito({ estado: "aplicada", ficha: { ...fC, inventario: [SIMBOLO] }, mudou: [{ coisa: "Corda de cânhamo", quantos: 1, de: "heroi", para: "Cornelius" }] }, { l: { subtipo: "devolver", quem: "Cornelius" }, ficha: fC, bancas: BANCAS, mercado: { comprados: { "geral|sino": ["Corda de cânhamo"] } }, base: { turno: 1 } });
  t("devolver o que saiu de uma banca: volta para ela (dado), e sai de comprados", t0.length === 1 && t0[0].para === "banca|geral|sino" && t0[0].consentimento === "dado" && J(aplicarAsTransacoes(null, fC, t0, { ...POSSE(), mercado: { comprados: { "geral|sino": ["Corda de cânhamo"] }, gastos: {} }, bancas: BANCAS }).mercado.comprados["geral|sino"]) === "[]", J(t0));
  const t1 = asTransacoesDoVeredito({ estado: "aplicada", ficha: { ...fC, inventario: [CORDA] }, mudou: [{ coisa: "Símbolo sagrado riscado", quantos: 1, de: "heroi", para: "Prudence" }] }, { l: { subtipo: "devolver", quem: "Prudence", quemId: "Rio|gente|Prudence" }, ficha: fC, bancas: BANCAS, mercado: { comprados: { "geral|sino": ["Corda de cânhamo"] } }, base: { turno: 1 } });
  t("…e o que não saiu dali nem é devido fica devido, e a estrutura recusa", t1.length === 1 && t1[0].consentimento === "devido" && aplicarAsTransacoes(null, fC, t1, POSSE()).motivo === "semDivida");

  /* o morto: a posse dele é a de quando vivia, e se pega sem dado */
  const morto = aplicarTransacao(null, f, { de: "Rio|gente|Prudence", para: "heroi", oQue: { tipo: "moedas", nome: "moedas", quantos: 1 }, consentimento: "tomado", chave: "m1" }, { ...POSSE(), mortos: ["Rio|gente|Prudence"] });
  const viva = posseDe("Rio|gente|Prudence", null, f, POSSE()).moedas;
  t("pegar do morto: sem dado, pelo que ele levava (ou a recusa por não levar)", viva > 0 ? morto.ok : morto.motivo === "naoTem", J({ viva, motivo: morto.motivo }));
}

sec("§3 a chave e o tudo-ou-nada");
{
  const f = ficha();
  const dar = porta("dou cinco moedas à Prudence", f);
  const de2 = porta("dou cinco moedas à Prudence", f);
  t("a chave é estável por turno e por ação (ler duas vezes dá a mesma)", J(dar.transacoes) === J(de2.transacoes));
  t("…e muda de um turno para o outro", porta("dou cinco moedas à Prudence", f, null, { turno: 8 }).transacoes[0].chave !== dar.transacoes[0].chave);
  t("a chave tem a forma da tabela e cabe no teto", /^troca\|7\|[0-9a-z]+\|0$/.test(dar.transacoes[0].chave) && aChaveDaTroca({ turno: 7, frase: "dou cinco moedas à prudence" }, 0) !== "");
  const ap1 = aplicar(dar, f);
  const ap2 = aplicarAsTransacoes(ap1.posses, ap1.ficha, dar.transacoes, { ...POSSE(ap1.posses), bancas: BANCAS, aceito: true });
  t("a mesma chave duas vezes: a segunda recusa com jaAplicada, e nada muda", ap1.ok && !ap2.ok && ap2.motivo === "jaAplicada" && ap2.ficha === ap1.ficha);
  const ruim = [{ de: "heroi", para: "Rio|gente|Prudence", oQue: { tipo: "moedas", nome: "moedas", quantos: 5 }, consentimento: "dado", chave: "a" }, { de: "heroi", para: "Rio|gente|Prudence", oQue: { tipo: "moedas", nome: "moedas", quantos: 500 }, consentimento: "dado", chave: "b" }];
  const tudo = aplicarAsTransacoes(null, f, ruim, POSSE());
  t("uma recusa na lista: nenhuma vale (a ficha e o registro voltam como vieram)", !tudo.ok && tudo.motivo === "naoTem" && tudo.ficha === f && tudo.posses === null && tudo.falhou && tudo.falhou.chave === "b");
  const rec = oVereditoDaRecusa(tudo, { "Rio|gente|Prudence": "Prudence" }, "v");
  t("…e o jogador lê o motivo da tabela, na voz da mesa", rec.estado === "negada" && rec.linha === "🤝 Você não tem ◉ 500: nada muda de mão." && !rec.ficha, rec.linha);
  t("lista vazia, lixo e null: recusa, nunca exceção", aplicarAsTransacoes(null, f, null, null).ok === false && asTransacoesDoVeredito(null, null).length === 0 && aCobrancaDaLeitura(null, null) === null && aTransacaoDoPedido(null, null, null).length === 0);
}

sec("§4 o save sem posses, e o lado");
{
  const f = ficha();
  const dar = porta("dou cinco moedas à Prudence", f, undefined, { aPosse: undefined });
  t("sem aPosse nenhum (o save antigo, sem o campo): a porta traduz e aplica do mesmo jeito", dar.caminho === "aplicado" && dar.transacoes.length === 1 && aplicarAsTransacoes(undefined, f, dar.transacoes, {}).ok);
  t("garantirPosses(undefined) é null (o campo novo nasce null)", garantirPosses(undefined) === null);
  t("o lado: herói, ninguém, o companheiro, a banca pelo nome, o id do ouvido, npc| por fim",
    oLadoDaTroca("heroi", {}) === "heroi" && oLadoDaTroca("", {}) === "nada" && oLadoDaTroca("Lavinia", { grupo: [LAVINIA()] }) === "npc|Lavinia Sallow"
    && oLadoDaTroca("O Sino Rachado", { bancas: BANCAS }) === "banca|geral|sino" && oLadoDaTroca("Prudence", { l: { quem: "Prudence", quemId: "X|gente|Prudence" } }) === "X|gente|Prudence"
    && oLadoDaTroca("Hilda", {}) === "npc|Hilda");
  t("os nomes das pontas saem do veredito", nomesDasTransacoes({ mudou: [{ de: "heroi", para: "Prudence" }] }, [{ de: "heroi", para: "Rio|gente|Prudence" }], null)["Rio|gente|Prudence"] === "Prudence");
  t("o kit (uso que não se conta) não cabe numa transação: lista vazia, e o App segue o caminho de hoje", asTransacoesDoVeredito({ estado: "aplicada", ficha: { ...f, suprimentos: { ...f.suprimentos, kit: true }, moedas: 30 }, mudou: [{ coisa: "kit", quantos: 1, de: "Balcão", para: "heroi" }, { coisa: "moedas", quantos: 10, de: "heroi", para: "Balcão" }] }, { l: { subtipo: "comprar" }, ficha: f }).length === 0);
}

sec("§5 a fiação");
{
  const APP = ler("../src/App.jsx");
  const corpo = (nome) => { const i = APP.indexOf(`const ${nome} = (`); return i < 0 ? "" : APP.slice(i, APP.indexOf("\n  };\n", i) + 5); };
  /* 24/11 (etapa 7): o import ganhou posseDe (o furto lê a posse da vítima); a régua aceita outros nomes depois de garantirPosses */
  t("o App importa a ponte e o registro", /import \{ garantirPosses(?:, [^}]*)? \} from "\.\/quem-tem-o-que\.js";/.test(APP) && /from "\.\/a-troca-por-transacao\.js";/.test(APP));
  t("o campo posses: ref, save, reset da campanha e load em try/calou", /const possesRef = useRef\(null\);/.test(APP) && /pessoas: pessoasRef\.current, posses: possesRef\.current,/.test(APP) && /if \(!cap\) possesRef\.current = null;/.test(APP) && /try \{ possesRef\.current = garantirPosses\(sv\.posses\); \} catch \(e\) \{ calou\("as posses do save", e\);/.test(APP));
  const at = corpo("aTrocaPorTransacao");
  t("o executor aplica por aplicarAsTransacoes (aplicarTransacao, uma vez), e a ficha vai pela porta de hoje", /aplicarAsTransacoes\(pos\.posses, fichaViva\(\) \|\| personagem, ts,/.test(at) /* 24/11 (etapa 7): o registro vem de aPosseAgora (pos.posses), que traz a dívida derivada da coisa da quest; sem o Mestre vivo é o mesmo possesRef.current */ && /aplicarOVereditoDaTroca\(\{ \.\.\.r\.veredito, ficha: res\.ficha \}\)/.test(at) && /calou\("a troca por transação"/.test(at));
  t("…a recusa mostra o motivo e não escreve; a chave já aplicada não repete", /res\.motivo !== "jaAplicada"/.test(at) && /oVereditoDaRecusa\(res,/.test(at));
  t("o turno e a segunda ação passam pelo executor (e os caminhos de escrita antigos só sem transação)", /if \(!\(r\.caminho === "aplicado" && aTrocaPorTransacao\(r\)\)\) \{ aplicarOVereditoDaTroca\(r\.veredito\); darABaixaNaBanca\(r\.veredito\); \}/.test(corpo("ouvirAFrase")) && /aTrocaPorTransacao\(r2\)/.test(corpo("executarASeguinte")));
  t("a porta lê a posse e o turno nos dois lugares em que é chamada", (APP.match(/aPosse: aPosseAgora\(\), turno: turnoDeRegistroRef\.current \+ 1/g) || []).length === 2);
  t("o dado do pedido e do tomar sai da posse, em try/calou", /calou\("o dado da troca · por transação"/.test(APP) && /tipo === "deGraca" \|\| tipo === "tomar"/.test(APP));
  const EST = ler("../src/estado.js"), SES = ler("../src/sessao.js");
  t("estado.js declara posses depois de pessoas, e o replay não o inventa", /C\("pessoas", "memoria", "qualquer"\),[^\n]*\n\s*C\("posses", "memoria", "qualquer"\)/.test(EST) && /\n\s*posses: "/.test(SES));
  t("a ligação: quem-tem-o-que.js saiu da lista de espera", !/"quem-tem-o-que\.js":/.test(ler("./teste-ligacao.mjs")));
}

console.log(`\n${bons} ok, ${maus} falharam`);
process.exit(maus ? 1 : 0);
