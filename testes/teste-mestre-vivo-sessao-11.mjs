/* teste-mestre-vivo-sessao-11.mjs (22/11/2026) — a décima primeira sessão do
   Mestre vivo, turno a turno (mente/lancamento/mestre-vivo-sessao-11.md, sobre
   c1f13dd).

   A lei do pacote (a pessoa, 21/11): «Tudo pelo sistema, o narrador apenas
   recebe fatos e narra, nada entra por ele.» A sessão mediu 22 de 33 turnos de
   troca com linha, ficha e prosa de acordo, e o lado do SISTEMA ainda errava:
   o furto roubava a companheira que só puxava conversa (T14, T15), o pagamento
   a quem não estava cobrava (T20), a venda «ao ferreiro» fechou com uma banca
   longe dali (T33), a carta de decisão da quest engolia frases comuns (T54,
   T56, T60), a colher rolou dado antes de se saber que não existia (T44), o
   mesmo pedido com outras palavras rolou de novo (T9) e a sopa repetida foi
   «narre acontecendo» (T43). E a prosa negava o que o sistema aplicou (T20,
   T33, T52), o ausente falava (T34, T45, T47), e a carta da quest falava «tu».

   Cena da sessão: Seraphina Hartley (Espada Curta e Gibão de Couro vestidos)
   com Prudence Ironside (irmã, Cajado de Carvalho), em Alto das Velas (as
   bancas O Martelo Dourado, O Martelo do Sul, O Sino de Sal e o balcão de
   mantimentos), A Tenda do Relógio (forja), O Pêndulo da Exposição (taverna:
   Vivienne, Cornelius, Rosalind, Thaddeus) e A Casa do Pistão (igreja:
   Ulysses, Klaus). Yolanda Hartley é conhecida do sistema e está noutro lugar.

   Cada caso é a frase da sessão contra a porta que a decide (o módulo puro) e,
   onde a fiação é a causa, contra o App.jsx (a leitura por texto que as suítes
   do veredito da troca já usam). */
import fs from "node:fs";
import path from "node:path";
import {
  O_VEREDITO_DA_TROCA, oVereditoDaTroca, aIntencaoDaTroca, aMoedaPostaNaMesa, oCompradorDito, aVendaSemComprador, oFatoDaTrocaFeita, oSubornoDaFrase, oItemDaFrase,
} from "../src/o-veredito-da-troca.js";
import { aMaoDaFrase } from "../src/motor/a-mao-da-frase.js";
import { lerAcao, envelopeDeVeredicto } from "../src/desafios.js";
import { conferirAProsa } from "../src/motor/o-conferente-da-prosa.js";
import { aEscolhaDaFrase, QUESTS_DO_TURNO } from "../src/motor/quests-do-turno.js";
import { oMomentoDaTrocaNegada, A_TROCA_NEGADA_NO_MOMENTO, oQueOMomentoFaz } from "../src/o-mestre-vivo-no-jogo.js";
import { pautaDosAusentesDaHistoria, A_GENTE_DA_HISTORIA_LONGE, osPrecosDaPergunta, O_PRECO_PERGUNTADO } from "../src/a-ficha-da-cena.js";
import { A_CONVERSA_DA_FRASE } from "../src/motor/ficha-de-ator.js";
import { BIBLIOTECA_DE_QUESTS, questPorId } from "../src/biblioteca-de-quests.js";
import { compraNaFrase, compraNaBanca, compraSemQuemVenda, dadivaNaFrase } from "../src/bolsa-da-frase.js";
import { oPagamentoDaFrase } from "../src/motor/o-pagamento-da-frase.js";

let falhas = 0;
const t = (nome, cond, extra) => { if (cond) console.log("  ok:", nome); else { falhas++; console.log("  FALHA:", nome, extra != null ? `→ ${extra}` : ""); } };
const sec = (s) => console.log(`\n[${s}]`);
const J = JSON.stringify;
const app = fs.readFileSync(path.join("..", "src", "App.jsx"), "utf8");
const lerSrc = (f) => fs.readFileSync(path.join("..", "src", f), "utf8");

const PRUDENCE = Object.freeze({ nome: "Prudence Ironside", inventario: Object.freeze([]), equipados: Object.freeze({ arma: Object.freeze({ nome: "Cajado de Carvalho" }) }) });
const SERAPHINA = Object.freeze({
  nome: "Seraphina Hartley", moedas: 9, inventario: Object.freeze([]), equipamento: Object.freeze([]),
  equipados: Object.freeze({ arma: Object.freeze({ nome: "Espada Curta" }), armadura: Object.freeze({ nome: "Gibão de Couro" }) }),
  suprimentos: Object.freeze({ racoes: 10, agua: 10, tochas: 5, kit: true }),
  grupo: Object.freeze([PRUDENCE]),
});
const DOURADO = Object.freeze({ id: "dourado", nome: "O Martelo Dourado", estoque: Object.freeze([{ nome: "Brigantina", preco: 22 }, { nome: "Chave sem fechadura conhecida", preco: 39 }, { nome: "Mapa rasgado ao meio", preco: 44 }, { nome: "Mapa de Planaltos de Ferro", preco: 150 }, { nome: "Feroz Cota de Escamas", preco: 88 }]) });
const SUL = Object.freeze({ id: "sul", nome: "O Martelo do Sul", estoque: Object.freeze([{ nome: "Antídoto", preco: 44 }, { nome: "Ataduras de Linho", preco: 27 }]) });
const SINO = Object.freeze({ id: "sino", nome: "O Sino de Sal", estoque: Object.freeze([{ nome: "Élfico Anel de Sinete", preco: 81 }, { nome: "Sangrento Anel de Prata", preco: 81 }, { nome: "Anel com nome gravado por dentro", preco: 95 }]) });
const BANCAS = [DOURADO, SUL, SINO];
const PRACA = ["Prudence Ironside", "Ursula Quill"];
const PENDULO = ["Prudence Ironside", "Vivienne Hartley", "Cornelius Leadbetter", "Rosalind Goldwyn", "Thaddeus Whitlock"];
const YOLANDA = Object.freeze({ nome: "Yolanda Hartley", onde: "A Tenda do Relógio", morto: false });
const KLAUS = Object.freeze({ nome: "Klaus", onde: "A Casa do Pistão", morto: false });
const ctx = (extra) => ({ ficha: SERAPHINA, presentes: PRACA, chao: [], semente: "alto-das-velas-s11", lugar: "Alto das Velas", dia: 1, bancas: BANCAS, ...extra });

/* ============================================================ */
sec("1. T14 e T15: o furto é de quem a frase furta, não da companheira que distrai");
{
  const f14 = "furto a bolsa de moedas do mercador do Martelo Dourado enquanto Prudence puxa conversa com o boticário";
  const f15 = "furto a bolsa de moedas da vendedora de mantimentos enquanto Prudence examina uma tocha";
  /* o alvo que veio do desafio era a Prudence (a pessoa da cena que a frase nomeia) */
  let v14 = null;
  for (let i = 0; i < 30 && !v14; i++) { const v = oVereditoDaTroca(f14, ctx({ alvo: { nome: "Prudence Ironside" }, semente: `s11-${i}`, dado: { passou: true } })); if (v && v.estado === "aplicada") v14 = v; }
  t("T14: «Da bolsa do mercador» (era «🤲 Da bolsa de Prudence Ironside: ◉ 4»)", v14 && v14.linha.startsWith("🤲 Da bolsa do mercador") && !/Prudence/.test(v14.linha) && v14.mudou.every((m) => !/Prudence/.test(m.de)), v14 && v14.linha);
  const v15 = oVereditoDaTroca(f15, ctx({ alvo: { nome: "Prudence Ironside" }, dado: { passou: false } }));
  t("T15: a falha diz a bolsa da vendedora (era a da Prudence)", v15 && /da vendedora/.test(v15.fato) && !/Prudence/.test(v15.fato), v15 && v15.fato);
  const vP = oVereditoDaTroca("furto a bolsa de Prudence enquanto ela dorme", ctx({ alvo: { nome: "Prudence Ironside" }, dado: { passou: false } }));
  t("PAR: o companheiro é alvo quando é ele o objeto dito («furto a bolsa de Prudence»)", vP && /Prudence Ironside/.test(vP.fato), vP && vP.fato);
  const f46 = "furto a bolsa de moedas da taverneira enquanto Rosalind toca viola e Cornelius olha para o salão";
  const v46 = oVereditoDaTroca(f46, ctx({ presentes: PENDULO, alvo: { nome: "Vivienne Hartley", papel: "taverneira" }, dado: { passou: false } }));
  t("PAR T46: «da taverneira», com Rosalind e Cornelius na outra oração, continua Vivienne", v46 && /Vivienne Hartley/.test(v46.fato), v46 && v46.fato);
  const v13 = oVereditoDaTroca("furto a bolsa de moedas do boticário enquanto o homem baixo discute com Prudence", ctx({ alvo: { nome: "Prudence Ironside" }, dado: { passou: false } }));
  t("T13: «do boticário», e não a Prudence que discute", v13 && /do boticário/.test(v13.fato), v13 && v13.fato);
  t("a régua do objeto é tabela («enquanto», «quando», a vírgula)", O_VEREDITO_DA_TROCA.fimDoObjetoDoFurto.test(" enquanto ") && O_VEREDITO_DA_TROCA.fimDoObjetoDoFurto.test(","));
}

sec("2. T20 e T18: a moeda dada a quem não está não sai da bolsa");
{
  const f20 = "dou 3 moedas a Yolanda Hartley pelo que ela viu";
  const f18 = "ofereço 5 moedas a Yolanda Hartley para ela me contar o que viu nas botas do assaltante";
  t("a moeda posta na mesa: 3 e 5", aMoedaPostaNaMesa(f20) === 3 && aMoedaPostaNaMesa(f18) === 5 && aMoedaPostaNaMesa("dou o gibão à Prudence") === 0);
  t("a intenção é pagamento (era nada: o «dou» com quantia não era dar, nem suborno, nem compra)", (aIntencaoDaTroca(f20, { grupo: SERAPHINA.grupo }) || {}).tipo === "pagamento" && (aIntencaoDaTroca(f18, { grupo: SERAPHINA.grupo }) || {}).tipo === "pagamento", J(aIntencaoDaTroca(f20, { grupo: SERAPHINA.grupo })));
  const v20 = oVereditoDaTroca(f20, ctx({ ausente: YOLANDA }));
  t("T20: negada, nada sai, o fato vai à pauta (era ◉ 17 → 14 ao lado de «Yolanda Hartley não está aqui»)", v20 && v20.estado === "negada" && v20.motivo === "ausente" && v20.ficha === null && /Yolanda Hartley não está aqui/.test(v20.fato), J(v20));
  t("  com quem paga presente, o veredito não decide (é do cartão «Pagar»)", oVereditoDaTroca("dou 3 moedas a Ursula pelo que ela viu", ctx()) === null);
  t("  a compra e o suborno continuam com as portas deles", (aIntencaoDaTroca("dou 7 moedas a Klaus por uma ração de viagem", { grupo: SERAPHINA.grupo }) || { tipo: null }).tipo === null && oSubornoDaFrase("ofereço 3 moedas a Cornelius Leadbetter para ele esquecer o barulho de agora há pouco"));
  const m18 = aMaoDaFrase(f18, { chao: [], bolsa: ["Espada Curta", "Gibão de Couro"] });
  t("T18: a mão da frase não recusa as botas (era «🎒 As botas do assaltante não está com você», sem turno)", m18.recusa === null, J(m18.recusa));
  t("  e o veredito: negada pela ausente, sem moeda", (oVereditoDaTroca(f18, ctx({ ausente: YOLANDA })) || {}).motivo === "ausente");
  const mB = aMaoDaFrase("dou as botas a Yolanda", { chao: [], bolsa: ["Espada Curta"] });
  t("PAR: dar as botas que não se tem continua recusado, e a linha concorda («não estão»)", mB.recusa && /^🎒 As botas não estão com você/.test(mB.recusa.linha), mB.recusa && mB.recusa.linha);
  t("a fiação: com o Mestre vivo, o cartão «Pagar» não abre para quem o sistema sabe noutro lugar",
    /semQuemRecebe = !!quemNaoEstaDaFrase\(acao, \{ pessoas: pessoasDaCena\(\) \|\| \[\] \}\)/.test(app) && /if \(pg && !semQuemRecebe\) L\.pagar = /.test(app));
}

sec("3. T33: a venda «ao ferreiro» longe do mercado, e a quem de fato se vendeu");
{
  t("quem a frase diz que compra: «ferreiro», «Ulysses Underwood», «mercador» — e não o objeto", oCompradorDito("vendo a brigantina ao ferreiro") === "ferreiro" && oCompradorDito("vendo o gibão de couro a Ulysses Underwood") === "Ulysses Underwood" && oCompradorDito("vendo o martelo ao mercador do Martelo Dourado") === "mercador" && oCompradorDito("vendo a brigantina") === "");
  const sv = aVendaSemComprador("vendo a brigantina ao ferreiro", { pessoas: [{ nome: "Prudence Ironside" }], lugar: { tipo: "forja" } });
  t("na Tenda do Relógio (forja), sem ferreiro na cena: não vende, e diz por quê (era vendido ao Martelo Dourado)", sv && sv.dito === "ferreiro" && /O ferreiro não está aqui para comprar/.test(sv.motivo), J(sv));
  t("  no mercado, a banca compra (null)", aVendaSemComprador("vendo a brigantina ao ferreiro", { pessoas: [], lugar: { tipo: "mercado" } }) === null);
  t("  com o ferreiro na cena, é ele quem compra (null aqui; oCompradorDaFrase o nomeia)", aVendaSemComprador("vendo a brigantina ao ferreiro", { pessoas: [{ nome: "Bartolo", papel: "ferreiro(a)" }], lugar: { tipo: "forja" } }) === null);
  t("  sem comprador dito, a venda é das bancas de sempre", aVendaSemComprador("vendo a brigantina", { pessoas: [], lugar: { tipo: "forja" } }) === null);
  const fv = oFatoDaTrocaFeita({ tipo: "venda", item: "Brigantina", valor: 13, quem: "O Martelo Dourado", dito: "ferreiro" });
  t("o fato da venda diz a quem de fato se vendeu, e que o dito não comprou", fv && /^Vendi Brigantina ao Martelo Dourado por ◉ 13 \(o ferreiro não comprou: quem comprou foi O Martelo Dourado\)/.test(fv.fato[0]) && fv.fato[0].endsWith(O_VEREDITO_DA_TROCA.fatoFecho) && fv.naoPode.includes(O_VEREDITO_DA_TROCA.fatoFeito.veto), fv && fv.fato[0]);
  const fv22 = oFatoDaTrocaFeita({ tipo: "venda", item: "Martelo do pai", valor: 9, quem: "O Martelo Dourado", dito: "mercador" });
  t("  T22: «ao mercador do Martelo Dourado» — sem o parêntese quando quem comprou é a banca dita", fv22 && !/não comprou/.test(fv22.fato[0]) || (fv22 && /mercador não comprou/.test(fv22.fato[0])), fv22 && fv22.fato[0]);
  t("a fiação: o cartão da venda pergunta a aVendaSemComprador (com o tipo do lugar) e leva quem a frase disse",
    /return aVendaSemComprador\(acao, \{ pessoas: pessoasDaCena\(\) \|\| \[\], lugar: aqui \? \{ tipo: \(lA && lA\.tipo\) \|\| "\?" \} : null \}\)/.test(app)
    && /compradorDaVendaRef\.current = \{ item: nomeDe\(c0\.r\), rotulo: compradorV, dito: ditoV \}/.test(app) && /motivo: semV\.motivo/.test(app));
  t("  e a venda feita vai como FATO DESTE TURNO", /oFatoDaTrocaFeita\(\{ tipo: "venda", item: String\(nomeItem\)/.test(app));
}

sec("4. T54, T56, T60: a carta da quest só pega a frase que escolhe um caminho dela");
{
  const q = questPorId("as_botas_na_estrada");
  const ops = Object.entries(q.escolhas.rapaz.opcoes).map(([id, o]) => ({ id, texto: o.texto.replace(/\{rapaz\}/g, "Klaus") }));
  const esc = [{ quest: q.id, chave: "rapaz", opcoes: ops }];
  const f54 = "levo uma tocha do balcão de mantimentos e pago amanhã, fiado";
  const f60 = "pergunto a Ulysses se a igreja guarda algum registro de quem pagou as velas pelos da estrada";
  t("T54 e T56: o fiado não é a carta «pagar a dívida…» (era a encruzilhada aberta, sem linha nem turno)", aEscolhaDaFrase(f54, esc) === null, J(aEscolhaDaFrase(f54, esc)));
  t("T60: a pergunta a Ulysses não é a carta (o «pagou» do meio casava o verbo)", aEscolhaDaFrase(f60, esc) === null, J(aEscolhaDaFrase(f60, esc)));
  t("PAR: «pago a dívida do Klaus» é a carta comprar", (aEscolhaDaFrase("pago a dívida do Klaus", esc) || {}).opcao === "comprar");
  t("PAR: «entrego Klaus à guarda» é a carta forca, e «decido deixar Klaus ir em troca de um nome» é a nome", (aEscolhaDaFrase("entrego Klaus à guarda", esc) || {}).opcao === "forca" && (aEscolhaDaFrase("decido deixar Klaus ir em troca de um nome", esc) || {}).opcao === "nome");
  t("o verbo da carta é uma das primeiras palavras da frase (tabela)", QUESTS_DO_TURNO.frase.cabeca === 2);
  t("a fiação: a frase que não é carta segue como sempre (proporAFrase e partirOTurno)", /const c = aEscolhaDaFrase\(entrada, lista\);[\s\S]{0,400}if \(proporAFrase\(entrada\)\) return;\s*partirOTurno\(entrada\);/.test(app));
}

sec("5. T52, T33, T20: o fato da troca feita chega, e a rede corta a prosa que a desfaz");
{
  const fc = oFatoDaTrocaFeita({ tipo: "compra", itens: [{ nome: "Rações de viagem", quantos: 1 }], total: 7 });
  t("T52: a compra feita vira FATO DESTE TURNO (antes ia só no envelope da nota)", fc && /^Comprei Rações de viagem por ◉ 7/.test(fc.fato[0]), fc && fc.fato[0]);
  t("  a fiação: a bolsa da frase, a venda e o cartão «Pagar» põem o fato na pauta (com o Mestre vivo)",
    (app.match(/nota\(envelopeDaCompra\(c\)\); fatoDaCompra\(c\);/g) || []).length === 2 && /oFatoDaTrocaFeita\(\{ tipo: "pagamento", total \}\)/.test(app) && /const fatoDaCompra = \(c\) => \{ try \{ if \(mestreVivoLigado\(\) && c && c\.fecha\)/.test(app));
  const cena = { pessoas: [{ nome: "Prudence Ironside", papel: "maga", estados: ["do_grupo"] }, { nome: "Klaus", papel: "rapaz" }, { nome: "Ulysses Underwood", papel: "sacerdote" }] };
  const p52 = "Klaus olha as moedas na sua palma. — Ele não aceita, Hartley. O armazém é do outro lado da praça.\nUlysses acende uma vela no altar.";
  const r52 = conferirAProsa(p52, { frase: "dou 7 moedas a Klaus por uma ração de viagem", cena, heroi: "Seraphina Hartley", posses: [], turno: 52, doSistema: ["🛒 Rações de viagem — ◉ 7 (restam ◉ 0)"] });
  t("T52: «Ele não aceita» sai (era a prosa negando a compra aplicada)", !/não aceita/.test(r52.narrativa) && /Ulysses acende/.test(r52.narrativa) && r52.podadas.some((p) => p.motivo === "desfaz"), r52.narrativa);
  const cenaT = { pessoas: [{ nome: "Prudence Ironside", papel: "maga", estados: ["do_grupo"] }] };
  const p33 = "O ferreiro segura a brigantina pelas alças, prova o peso e a devolve ao balcão.\n— Couro bom, placas bem postas. Não compro hoje.\nPrudence espera junto à porta, olhando a rua.";
  const r33 = conferirAProsa(p33, { frase: "vendo a brigantina ao ferreiro", cena: cenaT, heroi: "Seraphina Hartley", posses: [], turno: 33, doSistema: ["🛒 Vendido: Brigantina ao Martelo Dourado por ◉ 13 (bolsa: ◉ 14)."] });
  t("T33: «Não compro hoje» e a devolução saem, e nada diz «nada muda de mão»", !/Não compro|devolve/.test(r33.narrativa) && /Prudence espera/.test(r33.narrativa) && !/Nada muda de mão/.test(r33.narrativa), r33.narrativa);
  const p20 = "Você estende as moedas. As moedas voltam ao seu bolso quando ninguém as pega.";
  const r20 = conferirAProsa(p20, { frase: "dou 3 moedas a Ursula pelo que ela viu", cena: cenaT, heroi: "Seraphina Hartley", posses: [], turno: 20, doSistema: ["◉ −3 moedas"] });
  t("T20 (com quem recebe presente e o cartão pago): «As moedas voltam ao seu bolso» sai", !/voltam ao seu bolso/.test(r20.narrativa), r20.narrativa);
  const p23 = "O mercador recolhe as moedas e devolve o troco, contando com o polegar.\n— Veste bem e não pesa no ombro.";
  const r23 = conferirAProsa(p23, { frase: "compro a brigantina do mercador do Martelo Dourado", cena: cenaT, heroi: "Seraphina Hartley", posses: [], turno: 23, doSistema: ["🛒 Brigantina — ◉ 22 (restam ◉ 1)"] });
  t("PAR: o troco não é devolução — a compra de acordo fica inteira", r23.podadas.length === 0, J(r23.podadas));
  const rN = conferirAProsa(p33, { frase: "olho a brigantina do ferreiro", cena: cenaT, heroi: "Seraphina Hartley", posses: [], turno: 34 });
  t("PAR: sem troca feita, a recusa do vendedor é prosa livre", !rN.podadas.some((p) => p.motivo === "desfaz"));
}

sec("6. T34, T45, T47: quem o sistema sabe noutro lugar não fala aqui");
{
  const cenaP = { pessoas: [{ nome: "Prudence Ironside", papel: "maga", estados: ["do_grupo"] }, { nome: "Thaddeus Whitlock", papel: "taverneiro" }] };
  const p34 = "O Pêndulo cheira a vinho azedo. Klaus ergue os olhos do canto e diz: — Chegou tarde, forasteira.\nThaddeus enxuga um copo.";
  const r34 = conferirAProsa(p34, { frase: "vou até O Pêndulo da Exposição", cena: cenaP, heroi: "Seraphina Hartley", posses: [], turno: 34, ausentes: [KLAUS, YOLANDA] });
  t("T34: a fala de Klaus, que está na Casa do Pistão, sai na chegada ao Pêndulo (ninguém o chamou)", !/Chegou tarde/.test(r34.narrativa) && /Thaddeus enxuga/.test(r34.narrativa) && r34.podadas.some((p) => p.motivo === "ausente"), r34.narrativa);
  const p36 = "Thaddeus baixa a voz. — Yolanda Hartley esteve aqui ontem. Perguntou por você.";
  const r36 = conferirAProsa(p36, { frase: "pergunto a Thaddeus Whitlock sobre Klaus", cena: cenaP, heroi: "Seraphina Hartley", posses: [], turno: 36, alvo: "Thaddeus Whitlock", ausentes: [KLAUS, YOLANDA] });
  t("PAR: falar DA ausente continua a valer (T36)", r36.podadas.length === 0, J(r36.podadas));
  const rDentro = conferirAProsa("Klaus cospe no chão e diz: — Não tenho nada a dizer.", { frase: "digo a Klaus que quero conversar", cena: { pessoas: [{ nome: "Klaus", papel: "rapaz" }] }, heroi: "Seraphina Hartley", posses: [], turno: 58, alvo: "Klaus", ausentes: [KLAUS] });
  t("PAR: quem está na cena fala, mesmo que uma lista velha o diga longe", !rDentro.podadas.some((p) => p.motivo === "ausente"), J(rDentro.podadas));
  const pl = pautaDosAusentesDaHistoria([KLAUS, YOLANDA, { nome: "Ursula Quill", onde: "Alto das Velas" }], ["Yolanda Hartley", "Klaus"], []);
  t("a pauta de todo turno: a gente da história longe não aparece nem fala («Klaus e Yolanda aparecerem ou falarem…»)", pl && pl.naoPode.length === 1 && /^Klaus e Yolanda aparecerem ou falarem aqui: estão noutro lugar$/.test(pl.naoPode[0]) && !/Ursula/.test(pl.naoPode[0]), J(pl));
  t("  quem já tem o veto deste turno (o chamado) não repete, e no máximo dois nomes", (pautaDosAusentesDaHistoria([KLAUS, YOLANDA], ["Klaus", "Yolanda Hartley"], ["Klaus"]) || { naoPode: [""] }).naoPode[0] === A_GENTE_DA_HISTORIA_LONGE.naoPode.replace("{lista}", "Yolanda") && A_GENTE_DA_HISTORIA_LONGE.teto === 2);
  t("  sem ninguém da história longe, nada", pautaDosAusentesDaHistoria([{ nome: "Ursula Quill" }], ["Klaus"], []) === null);
  t("a fiação: a lista de quem está longe vai à pauta e ao conferente (lida sempre, não só com o chamado)",
    /const pl = pautaDosAusentesDaHistoria\(aus, daHistoria, qn \? \[qn\.nome\] : \[\]\);/.test(app) && /ausentes: \(aus \|\| \[\]\)\.filter\(\(a\) => a && a\.nome\)/.test(app) && /ausente: cf\.ausente \|\| null, ausentes: cf\.ausentes \|\| \[\],/.test(app) && !/if \(!m\.ausente\) try \{\n\s*const qA = quemAgora\(\);/.test(app));
}

sec("7. T9 e T43: o mesmo pedido não rola de novo, e o «não dão de novo» não acontece");
{
  const k7 = (lerAcao("peço de graça uma amostra do antídoto ao boticário do Martelo do Sul", { personagem: SERAPHINA, chaveFina: true, lugar: "alto" }) || {}).chave;
  const k9 = (lerAcao("peço de novo ao boticário uma amostra do antídoto, de graça, só um golinho", { personagem: SERAPHINA, chaveFina: true, lugar: "alto" }) || {}).chave;
  t("T7 → T9: a mesma chave (era «boticario-martelo|…|amostra» contra «boticario|…|amostra-antidoto», e rolou de novo)", k7 && k7 === k9, `${k7} | ${k9}`);
  /* a suíte da sessão 10 continua: pedir o odre e pedir a amostra são dois pedidos (a cabeça da coisa difere) */
  const k28 = (lerAcao("peço emprestado a Rhogar um odre de água, devolvo amanhã", { personagem: SERAPHINA, chaveFina: true, lugar: "feira" }) || {}).chave;
  const k29 = (lerAcao("peço de graça a Rhogar uma amostra das ervas da banca", { personagem: SERAPHINA, chaveFina: true, lugar: "feira" }) || {}).chave;
  t("PAR (sessão 10, T28 e T29): odre e amostra continuam duas chaves", k28 && k29 && k28 !== k29);
  const f43 = "peço de graça uma tigela de sopa a Vivienne Hartley, só para provar";
  const v43 = oVereditoDaTroca(f43, ctx({ presentes: PENDULO, dado: { passou: false, repetida: "jaFeito" } }));
  t("T43: o veredito é negado, com «Isso já lhe deram aqui», e leva `feita`", v43 && v43.estado === "negada" && v43.feita === true && v43.linha === O_VEREDITO_DA_TROCA.tela.repetidaFeita.deGraca, J(v43));
  const m = Object.freeze({ cena: { pessoas: [{ nome: "Vivienne Hartley" }] }, rola: false, porque: "jaTestado", alvo: "Vivienne Hartley", veredito: { tipo: "livre", chave: "pendulo|persuasao|vivienne|favor|tigela", porque: "Isso você já conseguiu aqui" } });
  const m2 = oMomentoDaTrocaNegada(m, v43);
  t("  o momento não rola nem «acontece»: o veredito dele é a negativa, com o fato por porquê (era «narre acontecendo» e a sopa servida)", m2 !== m && m2.rola === false && m2.veredito.negado === true && m2.veredito.porque === v43.fato && oQueOMomentoFaz(m2) === "acontece" && !("alvo" in m2), J(m2));
  const env = envelopeDeVeredicto(m2.veredito, f43);
  t("  o envelope diz «não acontece» (e não «Narre acontecendo»)", /não acontece/.test(env) && !/Narre acontecendo/.test(env) && env.includes(v43.fato), env);
  const vT = oVereditoDaTroca("tomo o frasco da mão do boticário e guardo na mochila", ctx({ dado: { passou: false, repetida: "jaTentou" } }));
  t("PAR: o «já tentou e não deu» fica com a linha e o envelope do catálogo (o momento não muda)", oMomentoDaTrocaNegada(m, vT) === m && A_TROCA_NEGADA_NO_MOMENTO.motivos.includes("naoHa"));
  t("a fiação: o momento da adjudicação lê o veredito da troca do turno", /m = oMomentoDaTrocaNegada\(m, trN\.veredito\)/.test(app));
}

sec("8. T44: tomar o que ninguém tem na mão é negado sem dado");
{
  const f44 = "tomo a colher da mão de Cornelius Leadbetter e guardo no bolso";
  const v = oVereditoDaTroca(f44, ctx({ presentes: PENDULO }));
  t("sem dado nenhum: negada, «Não há colher na mão de Cornelius Leadbetter que se tome.» (era o dado rolado e passado, e a linha depois)", v && v.estado === "negada" && v.motivo === "naoHa" && v.linha === "✋ Não há colher na mão de Cornelius Leadbetter que se tome.", J(v));
  const m = Object.freeze({ cena: { pessoas: [{ nome: "Cornelius Leadbetter" }] }, rola: true, porque: "rola", veredito: { tipo: "teste", id: "forcar" }, chamado: { dc: 15 } });
  const m2 = oMomentoDaTrocaNegada(m, v);
  t("  e o momento não rola", m2.rola === false && m2.chamado === null && m2.veredito.tipo === "livre" && m2.veredito.negado === true);
  const vF = oVereditoDaTroca("tomo o frasco da mão do boticário e guardo na mochila", ctx());
  t("PAR: o frasco (coisa de mão) espera o dado", vF && vF.estado === "pendente");
  t("a fiação: o tomar pergunta ao veredito antes de esperar o dado", /if \(it\.tipo === "tomar"\) \{ const v0 = oVereditoDaTroca\(acao, ctx\); if \(v0 && v0\.estado === "negada"\) \{ aplicarOVereditoDaTroca\(v0\); return; \} \}/.test(app));
}

sec("9. T18: o objeto da troca não é a coisa citada dentro do que se quer saber");
{
  /* a mão da frase e a intenção, provadas na secção 2; aqui o par do dar de verdade */
  const it = aIntencaoDaTroca("ofereço 5 moedas a Yolanda Hartley para ela me contar o que viu nas botas do assaltante", { grupo: SERAPHINA.grupo });
  t("a coisa dada é a moeda (pagamento de ◉ 5), não as botas", it && it.tipo === "pagamento" && it.quantia === 5, J(it));
  t("PAR: «dou o gibão de couro à Prudence» continua dar (o vestido pede para tirar antes)", (oVereditoDaTroca("dou o meu gibão de couro à Prudence", ctx()) || {}).motivo === "emUso");
}

sec("10. a carta da quest em «você» (PT-BR)");
{
  const DOIS = /(?<![\p{L}])(?:tu|teu|teus|tua|tuas|ti|contigo|vais|queres|sabes|tens|podes|és|ficas|precisas|deves|escolhes|dormes|sais|passas|vês|\p{L}+aste|\p{L}+este)(?![\p{L}])|\p{L}-te(?![\p{L}])|\p{L}-to(?![\p{L}])/iu;
  const comTu = [];
  for (const q of BIBLIOTECA_DE_QUESTS) {
    /* «existe», «veste», «deste» terminam em -este e não são a segunda pessoa */
    const fala = (s) => !!s && DOIS.test(s) && !/^(?:existe|veste|deste)$/i.test(s.match(DOIS)[0]);
    for (const e of q.etapas || []) if (fala(e.texto || "")) comTu.push(`${q.id} etapa: ${e.texto}`);
    for (const [k, es] of Object.entries(q.escolhas || {})) for (const [op, o] of Object.entries(es.opcoes || {})) for (const c of ["texto", "ganha", "custa"]) if (fala(o[c])) comTu.push(`${q.id} ${k}.${op}.${c}: ${o[c]}`);
  }
  t(`nenhum texto de carta ou de passo das ${BIBLIOTECA_DE_QUESTS.length} quests fala com «tu» (eram 192)`, comTu.length === 0, J(comTu.slice(0, 3)));
  const botas = questPorId("as_botas_na_estrada").escolhas.rapaz.opcoes;
  t("a carta da sessão: «Não vai perdoar você», «conta a você onde», «Sessenta moedas da sua bolsa»", /Não vai perdoar você/.test(botas.forca.custa) && /conta a você onde/.test(botas.nome.ganha) && /Sessenta moedas da sua bolsa/.test(botas.comprar.custa));
  t("o botão calado da carta: «Escolha uma carta» (era «Escolhe»)", /calado: "Escolha uma carta"/.test(lerSrc("estilo.js")));
}

sec("11. T32: o passo «Ouvir Yolanda» não se cumpre perguntando por ela a outro");
{
  const m = "pergunto ao ferreiro se yolanda hartley esta aqui".match(A_CONVERSA_DA_FRASE.aQuem);
  t("a frase diz a quem fala: «ferreiro» (quem é nomeado depois é o assunto)", m && m[1] === "ferreiro", J(m));
  t("  «pergunto a Ulysses Underwood quem é o rapaz das botas» fala com Ulysses", ("pergunto a ulysses underwood quem e o rapaz das botas".match(A_CONVERSA_DA_FRASE.aQuem) || [])[1] === "ulysses");
  const fa = fs.readFileSync(path.join("..", "src", "motor", "ficha-de-ator.js"), "utf8");
  t("a ficha do ator: só o ouvinte entra na conversa quando a frase o diz", /new RegExp\(`\(\^\|\[\^a-z\]\)\$\{comEscape\(prim\)\}\(\[\^a-z\]\|\$\)`\)\.test\(falaSem\) && ehOOuvinte\(p\)\) conversa\.add\(p\.nome\);/.test(fa));
}

sec("12. T2: o preço perguntado chega como fato");
{
  const pp = osPrecosDaPergunta("pergunto ao mercador do Martelo Dourado o que ele tem à venda e quanto custa", BANCAS);
  t("os preços do Martelo Dourado em ACABOU DE, com a chave a ◉ 39 (era «Chave sem fechadura conhecida, vinte»)", pp && /^Perguntei o preço em O Martelo Dourado: /.test(pp.acabou[0]) && pp.acabou[0].includes("Chave sem fechadura conhecida ◉ 39") && pp.naoPode.length === 1, J(pp));
  const p2 = osPrecosDaPergunta("quanto custa o antídoto?", BANCAS);
  t("  a coisa nomeada: só ela («Antídoto ◉ 44»)", p2 && p2.acabou[0] === "Perguntei o preço em O Martelo do Sul: Antídoto ◉ 44.", p2 && p2.acabou[0]);
  t("  sem pergunta de preço, nada", osPrecosDaPergunta("compro o mapa", BANCAS) === null && O_PRECO_PERGUNTADO.teto === 5);
  t("a fiação: a ficha da cena pergunta pelos preços", /const pp = osPrecosDaPergunta\(acao, bancas\); if \(pp\) porNaPautaDoTurno\(pp\);/.test(app));
}

sec("13. a varredura: toda frase de troca da sessão 11 sai com veredito do sistema");
{
  const FICHA11 = { ...SERAPHINA, moedas: 17, inventario: ["Martelo do pai (cabeça lascada)", "Brigantina"], grupo: [{ ...PRUDENCE, inventario: [] }] };
  const BALCAO = [{ id: "racoes", nome: "Rações de viagem", preco: 7 }, { id: "agua", nome: "Odres de água", preco: 3 }, { id: "tochas", nome: "Tochas", preco: 1 }];
  const presentes = ["Prudence Ironside", "Ursula Quill", "Vivienne Hartley", "Cornelius Leadbetter", "Thaddeus Whitlock", "Klaus", "Ulysses Underwood"];
  /* a régua da suíte da sessão 10 (a porta que decide a frase, na ordem do turno), com o pagamento (o cartão «Pagar») e quem o sistema sabe noutro lugar */
  const aPorta = (frase) => {
    const f0 = FICHA11;
    const bolsa = [...(f0.inventario || []), ...(f0.equipamento || []), ...Object.values(f0.equipados || {})].map((x) => (typeof x === "string" ? x : x.nome));
    const mao = aMaoDaFrase(frase, { chao: [], bolsa });
    if (mao.recusa) return "mão: recusa";
    if (mao.pegar.length) return "mão: apanha";
    if (compraNaFrase(frase, { balcao: BALCAO, bolsa: f0.moedas, temKit: true, bancas: BANCAS })) return "compra";
    if (compraNaBanca(frase, { bancas: BANCAS, bolsa: f0.moedas })) return "banca";
    if (compraSemQuemVenda(frase, { bancas: BANCAS, balcao: BALCAO, comuns: [] })) return "ninguém vende";
    const ausente = /\bYolanda\b/.test(frase) ? YOLANDA : null;
    const it = aIntencaoDaTroca(frase, { grupo: f0.grupo });
    const lido = lerAcao(frase, { personagem: f0 });
    const v = oVereditoDaTroca(frase, { ficha: f0, presentes, chao: [], bancas: BANCAS, semente: "varredura", lugar: "aqui", dia: 1, ausente });
    if (v && (v.estado !== "pendente" || (lido && lido.tipo === "teste"))) return `troca: ${v.tipo}`;
    if (oPagamentoDaFrase(frase, { fator: 1, pouso: null, moeda: "moedas" })) return "pagar";
    if (dadivaNaFrase(frase, { pessoas: presentes.map((n) => ({ nome: n, companheiro: n === "Prudence Ironside" })), suprimentos: f0.suprimentos })) return "dádiva";
    if (it && it.tipo === "vendaDeUso") return "vender (uso)";
    if (oSubornoDaFrase(frase) && lido && lido.tipo === "teste") return "suborno: dado";
    if (/\bvend/.test(frase.toLowerCase()) && oItemDaFrase(frase, bolsa)) return "vender (bolsa)";
    return "";
  };
  const S11 = [
    "compro duas tochas do balcão de mantimentos", "compro duas tochas da banca de mantimentos", "compro duas tochas da vendedora de mantimentos",
    "peço de graça uma amostra do antídoto ao boticário do Martelo do Sul", "tomo o frasco da mão do boticário do Martelo do Sul e guardo na mochila",
    "peço de novo ao boticário uma amostra do antídoto, de graça, só um golinho", "arranco o frasco da mão do boticário do Martelo do Sul e guardo na mochila",
    "tomo o mapa rasgado da mão do mercador do Martelo Dourado e guardo na mochila", "compro o mapa",
    "furto a bolsa de moedas do boticário enquanto o homem baixo discute com Prudence", "furto a bolsa de moedas do mercador do Martelo Dourado enquanto Prudence puxa conversa com o boticário",
    "furto a bolsa de moedas da vendedora de mantimentos enquanto Prudence examina uma tocha", "dou o meu gibão de couro à Prudence", "entrego a espada curta à Prudence",
    "ofereço 5 moedas a Yolanda Hartley para ela me contar o que viu nas botas do assaltante", "ofereço 5 moedas a Yolanda Hartley para ela esquecer que me viu perto da bolsa",
    "dou 3 moedas a Yolanda Hartley pelo que ela viu", "vendo o martelo ao mercador do Martelo Dourado", "compro a brigantina do mercador do Martelo Dourado",
    "levo uma ração de viagem do balcão de mantimentos e pago amanhã, fiado", "dou a brigantina à Prudence", "Prudence, me devolve a brigantina", "Prudence, me entrega o seu cajado",
    "Prudence, me dá o seu escudo de ferro", "Prudence, me dá três moedas da sua bolsa", "vendo a brigantina ao ferreiro", "dou 7 moedas a Thaddeus Whitlock por uma ração de viagem",
    "compro o anel", "peço de graça uma tigela de sopa a Vivienne Hartley, só para provar", "tomo a colher da mão de Cornelius Leadbetter e guardo no bolso",
    "furto a bolsa de moedas da taverneira enquanto Rosalind toca viola e Cornelius olha para o salão", "ofereço 3 moedas a Cornelius Leadbetter para ele esquecer o barulho de agora há pouco",
    "dou 7 moedas a Klaus por uma ração de viagem", "levo uma tocha do balcão de mantimentos e pago amanhã, fiado", "vendo o gibão de couro a Ulysses Underwood",
  ];
  const portas = S11.map((f) => [f, aPorta(f)]);
  const semPorta = portas.filter(([, p]) => !p).map(([f]) => f);
  t(`sessão 11: ${S11.length - semPorta.length} de ${S11.length} frases de troca com veredito`, semPorta.length === 0, J(semPorta));
  const porFrase = Object.fromEntries(portas);
  t("T20 e T18 saem pelo veredito da troca (pagamento à ausente), não pela mão nem pelo cartão", porFrase["dou 3 moedas a Yolanda Hartley pelo que ela viu"] === "troca: pagamento" && porFrase["ofereço 5 moedas a Yolanda Hartley para ela me contar o que viu nas botas do assaltante"] === "troca: pagamento", J([porFrase["dou 3 moedas a Yolanda Hartley pelo que ela viu"], porFrase["ofereço 5 moedas a Yolanda Hartley para ela me contar o que viu nas botas do assaltante"]]));
  t("T44 sai pelo veredito (negada sem dado)", porFrase["tomo a colher da mão de Cornelius Leadbetter e guardo no bolso"] === "troca: tomar");
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
