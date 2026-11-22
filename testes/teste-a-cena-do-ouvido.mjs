/* A CENA DO OUVIDO (22/11/2026) — src/motor/a-cena-do-ouvido.js e a fiação no App.jsx

   A dona do jogo quer um Mestre que «reconheça o que acontece». O ouvido
   (o-ouvido.js) reconhece 95% das trocas do exame selado; esta suíte prova
   que ele está LIGADO: toda frase de troca sai do sistema com uma resposta
   antes de o Narrador ser chamado — aplicada, negada com motivo, levada ao
   dado ou devolvida ao jogador como pergunta. Nunca silêncio.

   §1 o adaptador: do retrato do estado real (formato do save) para a cena;
   §2 as frases da sessão 14 e 15, do começo ao fim, sem silêncio;
   §3 a pergunta: as opções fechadas reenviam a frase inteira, e a resposta
      pelo número ou pelo nome;
   §4 o que o ouvido aplica por si (aTrocaDoOuvido): o herói só recebe o que
      a pessoa vende ou o que um comprador paga; sem fonte, não;
   §5 a bolsa que já mexeu, o registro do console e a defesa;
   §6 a régua que decidiu a rede (o composto × o ouvido sozinho);
   §7 a fiação, lida no App.jsx. */
import { readFileSync } from "node:fs";
import { aCenaDoOuvido, oOuvidoNaTroca, aTrocaDoOuvido, aFichaMudou, aRespostaDaPergunta, oRegistroDoOuvido, A_CENA_DO_OUVIDO } from "../src/motor/a-cena-do-ouvido.js";
import { oOuvido } from "../src/o-ouvido.js";
import { aRespostaDoMestre, A_REGRA_DO_IMPROVISO } from "../src/a-regra-do-improviso.js";
import { aIntencaoDaTroca, oVereditoDaTroca, aPortaFinalDaTroca } from "../src/o-veredito-da-troca.js";
import { compraNaFrase, dadivaNaFrase } from "../src/bolsa-da-frase.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;
const ler = (rel) => readFileSync(new URL(rel, import.meta.url), "utf8");

/* o retrato no formato do save: a ficha com objetos, o vestido em `equipados`, os usos, o grupo */
const RETRATO = Object.freeze({
  lugar: { nome: "Taverna do Javali", tipo: "taverna" },
  pessoas: [{ nome: "Tobias Arn", papel: "mendigo" }, { nome: "Marta Vell", papel: "estalajadeira" }, { nome: "Rhogar", papel: "guerreiro", ehCompanheiro: true }],
  grupo: [{ nome: "Rhogar", inventario: [{ nome: "Machado" }] }],
  bancas: [
    { id: "b1", nome: "Armazém do Porto", tipo: "geral", estoque: [{ nome: "Corda de cânhamo", preco: 2, tipo: "util" }, { nome: "Pão", preco: 1, tipo: "comida" }, { nome: "Escudo redondo", preco: 6, tipo: "escudo", detalhe: "madeira" }] },
    { nome: "o balcão", estoque: [{ nome: "Ração", preco: 1, uso: "racoes" }, { nome: "Tocha", preco: 1, uso: "tochas" }] },
  ],
  ausentes: [{ nome: "Kael Durn", onde: "o porto", morto: false }, { nome: "Edrik Sorn", morto: true }, { nome: "Marta Vell", morto: false }],
  chao: [{ id: "c1", nome: "caneca" }, "banquinho"],
  ficha: {
    moedas: 9, inventario: [{ nome: "Gazua" }, { nome: "Lembrança da mãe (um medalhão)" }], equipamento: [{ nome: "Faca" }],
    equipados: { arma: { nome: "Espada curta" } }, suprimentos: { racoes: 2, agua: 1, tochas: 0, kit: false },
  },
});
const FICHA = Object.freeze({ ...RETRATO.ficha, grupo: RETRATO.grupo });
const CENA = aCenaDoOuvido(RETRATO);
const OFERTA = (item) => ({ valor: 3, quem: { id: "b1", nome: "Armazém do Porto" }, item });
const ctx = (extra) => ({ ficha: FICHA, bancas: RETRATO.bancas, porta: "", vaiAoCorpo: ["arma", "escudo"], ofertaDe: OFERTA, ...(extra || {}) });
const ouve = (f, c = CENA) => oOuvidoNaTroca(f, c);
const aplica = (f, extra, c = CENA) => aTrocaDoOuvido(ouve(f, c), ctx(extra));
/* «sem silêncio»: o ouvido negou, perguntou, ou a troca tem caminho (a porta de hoje ou o ouvido) com fato */
const naoCala = (f, c = CENA) => {
  const o = ouve(f, c);
  if (o.caminho === "nao") return !!(o.negada && o.negada.fato);
  if (o.caminho === "pergunta") return !!(o.pergunta && o.pergunta.linha && o.pergunta.opcoes.length);
  if (o.caminho === "aplicar") { const v = aTrocaDoOuvido(o, ctx()); return !!o.intencao || !!(v && v.fato); }
  return false;
};

sec("§1 o adaptador — do retrato do estado real para a cena do ouvido");
{
  t("o lugar e o tipo", CENA.lugar === "Taverna do Javali" && CENA.tipo === "taverna");
  t("o companheiro sai das pessoas e vai para o herói", !CENA.pessoas.some((p) => p.nome === "Rhogar") && CENA.heroi.companheiro === "Rhogar");
  t("quem está tem o ofício do papel", CENA.pessoas.some((p) => p.nome === "Tobias Arn" && p.oficio === "mendigo"));
  t("a banca vira quem vende, com o item e o preço", J(CENA.pessoas.find((p) => p.nome === "Armazém do Porto").vende.slice(0, 2)) === J([{ item: "Corda de cânhamo", preco: 2 }, { item: "Pão", preco: 1 }]));
  t("o balcão também vende (a ração, a tocha)", CENA.pessoas.some((p) => p.nome === "o balcão" && p.vende.length === 2));
  t("o ausente vivo é ausente, o morto é morto", J(CENA.ausentes) === J(["Kael Durn"]) && J(CENA.mortos) === J(["Edrik Sorn"]));
  t("quem está aqui não é ausente, mesmo na lista de longe", !CENA.ausentes.includes("Marta Vell"));
  t("as coisas soltas vêm do chão (objeto ou nome)", J(CENA.coisas) === J(["caneca", "banquinho"]));
  t("o herói carrega a mochila, o equipamento, o que veste e os usos que tem", J(CENA.heroi.carrega) === J(["Gazua", "Lembrança da mãe", "Faca", "Espada curta", "ração", "água"]), J(CENA.heroi.carrega));
  t("o uso que acabou não é coisa da ficha (tochas 0)", !CENA.heroi.carrega.includes("tocha"));
  t("a moeda é a da ficha", CENA.heroi.moeda === 9);
  let ok = true;
  try {
    const c0 = aCenaDoOuvido(null), c1 = aCenaDoOuvido({ ficha: null, pessoas: null, bancas: [null, { nome: "" }], ausentes: [null], chao: null, grupo: null });
    ok = Array.isArray(c0.pessoas) && c0.heroi.moeda === 0 && c0.heroi.companheiro === null && Array.isArray(c1.heroi.carrega);
  } catch { ok = false; }
  t("null no retrato e nos campos não derruba (o `= {}` não cobre null)", ok);
}

sec("§2 as frases da sessão 14 e 15 terminam em resposta, nunca em silêncio");
{
  const S = ["empresto minha gazua a Rhogar", "jogo uma moeda ao mendigo", "coloco duas moedas na mão dele", "aceito o pão e a água que ela oferece", "ofereço uma lembrança em troca dela"];
  for (const f of S) t("«" + f + "» tem resposta", naoCala(f), oRegistroDoOuvido(f, ouve(f)));
  {
    const v = aplica("empresto minha gazua a Rhogar");
    t("emprestar ao companheiro: a gazua sai da mochila e entra na bolsa dele", v && v.estado === "aplicada" && !v.ficha.inventario.some((x) => x.nome === "Gazua") && v.ficha.grupo[0].inventario.some((x) => x.nome === "Gazua"), J(v && v.linha));
    t("…a linha e o fato dizem o empréstimo", /emprestado com Rhogar/.test(v.linha) && /Emprestei Gazua a Rhogar/.test(v.fato));
  }
  {
    const v = aplica("jogo uma moeda ao mendigo");
    t("a moeda ao mendigo (pelo ofício): sai ◉ 1 da bolsa", v && v.estado === "aplicada" && v.ficha.moedas === 8 && /Tobias Arn/.test(v.fato), J(v && v.linha));
  }
  {
    const v = aplica("coloco duas moedas na mão dele");
    t("«na mão dele» retoma o único homem em cena: saem ◉ 2", v && v.ficha && v.ficha.moedas === 7 && /Tobias Arn/.test(v.linha), J(v && v.linha));
  }
  {
    const o = ouve("aceito o pão e a água que ela oferece");
    t("o gesto sem verbo conhecido com a coisa de alguém vira pergunta do Mestre", o.caminho === "pergunta" && /O que você faz com o Pão\?/.test(o.pergunta.texto), J(o.pergunta));
    const pedir = o.pergunta.opcoes.find((x) => x.rotulo === "Pedir");
    t("…e a escolha «Pedir» reenvia uma frase que o ouvido lê como pedido", !!pedir && oOuvido(pedir.frase, CENA).subtipo === "pedir", pedir && pedir.frase);
  }
  {
    const o = ouve("ofereço uma lembrança em troca dela");
    t("oferecer a lembrança: entra pela porta de hoje (dar) e, se ela não fechar, o ouvido aplica", o.caminho === "aplicar" && o.intencao && o.intencao.tipo === "dar" && aTrocaDoOuvido(o, ctx()).estado === "aplicada");
  }
  /* nunca o silêncio, em toda frase de troca do treino aberto, com a cena do exame */
  const treino = JSON.parse(ler("./treino-das-intencoes.json")).itens;
  const calados = treino.filter((it) => { const o = ouve(it.frase, it.cena); return ["trocar", "usar"].includes(o.leitura && o.leitura.familia) && !o.caminho && o.leitura.familia === "trocar"; });
  t("toda troca lida no treino tem caminho (nao, pergunta ou aplicar)", calados.length === 0, calados.map((x) => x.frase).join(" | "));
}

sec("§3 a pergunta — opções fechadas, e a escolha reenvia a frase inteira");
{
  const o = ouve("dou a gazua");
  t("falta a quem: a pergunta lista quem está e o companheiro", o.caminho === "pergunta" && o.pergunta.opcoes.some((x) => x.rotulo === "Rhogar") && o.pergunta.opcoes.some((x) => x.rotulo === "Tobias Arn"), J(o.pergunta));
  t("a linha é a da mesa, numerada", /^🤝 A quem você entrega a gazua\? 1\. /i.test(o.pergunta.linha), o.pergunta.linha);
  t("toda opção reenvia uma frase que já não pergunta a quem", o.pergunta.opcoes.every((x) => aRespostaDoMestre(oOuvido(x.frase, CENA), CENA).motivo !== "falta_quem"), J(o.pergunta.opcoes.map((x) => x.frase)));
  t("a resposta pelo número", aRespostaDaPergunta(o.pergunta, "2") === o.pergunta.opcoes[1].frase);
  t("a resposta pelo nome inteiro e pelo primeiro nome", aRespostaDaPergunta(o.pergunta, "Rhogar") === o.pergunta.opcoes.find((x) => x.rotulo === "Rhogar").frase && aRespostaDaPergunta(o.pergunta, "tobias") === o.pergunta.opcoes.find((x) => x.rotulo === "Tobias Arn").frase);
  t("a frase nova não é resposta: segue como turno", aRespostaDaPergunta(o.pergunta, "olho em volta") === null && aRespostaDaPergunta(o.pergunta, "9") === null && aRespostaDaPergunta(null, "1") === null);
  /* dois com o nome: a opção põe o nome inteiro no lugar */
  const DUAS = aCenaDoOuvido({ ...RETRATO, pessoas: [{ nome: "Ana Lis", papel: "bardo" }, { nome: "Ana Cruz", papel: "ferreira" }] });
  const d = ouve("dou a faca pra Ana", DUAS);
  t("dois com o nome: as duas nas opções", d.caminho === "pergunta" && J(d.pergunta.opcoes.map((x) => x.rotulo)) === J(["Ana Lis", "Ana Cruz"]), J(d.pergunta));
  t("…e a escolha troca o nome curto pelo inteiro", d.pergunta.opcoes[1].frase === "dou a faca pra Ana Cruz" && oOuvido(d.pergunta.opcoes[1].frase, DUAS).quem === "Ana Cruz");
  t("a pergunta não fala do mecanismo", !/ouvido|veredito|subtipo|motivo|leitura/i.test(o.pergunta.linha + d.pergunta.linha));
}

sec("§4 o que o ouvido aplica por si — o herói só recebe do que o sistema sabe");
{
  const n = ouve("dou 3 moedas ao Kael");
  t("ao ausente: não, e o fato diz que nada mudou de mão", n.caminho === "nao" && n.negada.estado === "negada" && /Kael Durn não está aqui/.test(n.negada.fato) && n.negada.linha === "", J(n.negada));
  const sm = ouve("compro o escudo do Armazém por 20 moedas");
  t("sem moeda: não, com a bolsa na linha", sm.caminho === "nao" && /Não chega: você tem ◉ 9/.test(sm.negada.linha), J(sm.negada || sm.resposta));
  const nt = ouve("uso a tocha");
  t("o uso que acabou: não tem", nt.caminho === "nao" && /^🎒 Você não tem tocha\.$/i.test(nt.negada.linha), J(nt.negada));
  {
    const v = aplica("compro o escudo do Armazém");
    t("comprar da banca: o item inteiro do estoque, sem preço, vai ao corpo (escudo)", v && v.estado === "aplicada" && v.ficha.moedas === 3 && v.ficha.equipamento.some((x) => x.nome === "Escudo redondo" && x.preco === undefined && x.detalhe === undefined), J(v && v.ficha && v.ficha.equipamento));
    t("…e diz de onde dar a baixa", v.comprado && v.comprado.banca === "b1" && v.comprado.nome === "Escudo redondo");
  }
  {
    const v = aplica("compro duas rações do balcão");
    t("comprar no balcão: a ração entra nos suprimentos, não na mochila", v && v.ficha && v.ficha.suprimentos.racoes === 4 && v.ficha.moedas === 7 && v.ficha.inventario.length === 2, J(v && v.linha));
  }
  {
    const v = aplica("vendo a gazua ao Armazém");
    t("vender: quem compra paga a oferta do mercado, a coisa sai", v && v.estado === "aplicada" && v.ficha.moedas === 12 && !v.ficha.inventario.some((x) => x.nome === "Gazua"), J(v && v.linha));
    const s = aTrocaDoOuvido(ouve("vendo a gazua ao Armazém"), ctx({ ofertaDe: () => ({ valor: 3, quem: null }) }));
    t("…sem comprador: não, e nada muda", s && s.estado === "negada" && s.ficha === null && /Ninguém aqui compra/.test(s.linha), J(s));
  }
  {
    const v = aplica("vendo a espada curta ao Armazém");
    t("o que se veste não se vende nem se dá numa frase", v && v.estado === "negada" && /tire antes de dar/.test(v.linha), J(v));
  }
  {
    const v = aplica("troco a faca pelo pão do Armazém");
    t("escambo: a faca sai, o pão do estoque entra", v && v.estado === "aplicada" && !v.ficha.equipamento.some((x) => x.nome === "Faca") && v.ficha.inventario.some((x) => x.nome === "Pão"), J(v && v.linha));
  }
  {
    const v = aplica("pago 4 moedas ao Tobias");
    t("pagar a quantia dita: sai da bolsa", v && v.estado === "aplicada" && v.ficha.moedas === 5, J(v && v.linha));
  }
  {
    const o = ouve("devolvo duas moedas ao Tobias");
    const v = aTrocaDoOuvido(o, ctx());
    t("a moeda devolvida sai da bolsa como a dada (nunca silêncio depois do sim)", o.caminho !== "aplicar" || (v && v.estado === "aplicada" && v.ficha.moedas === 7), J([o.caminho, o.resposta, v && v.linha]));
  }
  {
    const v = aplica("dou duas moedas ao Rhogar");
    t("moeda ao companheiro: o dinheiro do grupo fica na bolsa do herói", v && v.estado === "negada" && /bolsa/.test(v.linha), J(v));
  }
  {
    const o = ouve("furto a corda do Armazém");
    t("o furto com dado à espera segue pela porta de hoje (nada aqui)", aTrocaDoOuvido(o, ctx({ porta: "rola" })) === null && o.intencao && o.intencao.tipo === "furto");
    const c = ouve("cobro o Tobias");
    const vc = aTrocaDoOuvido(c, ctx({ porta: "rola" }));
    t("o dado sem caminho de hoje (cobrar): o fato diz que nada muda de mão nesta resposta", c.caminho === "aplicar" && vc && vc.estado === "negada" && /depende do teste/.test(vc.fato) && vc.linha === "", J(vc || c.resposta));
    const vs = aTrocaDoOuvido(c, ctx({ porta: "" }));
    t("…e sem dado nenhum: não cede", vs && /não cede/.test(vs.linha));
  }
  {
    const v = aplica("pego o anel do Edrik");
    t("do morto o sistema não sabe o que havia: nada entra, nunca item inventado", v && v.estado === "negada" && /Não há anel com/.test(v.linha), J(v));
  }
  t("a ficha de entrada nunca muda (imutável)", FICHA.moedas === 9 && FICHA.inventario.length === 2 && FICHA.grupo[0].inventario.length === 1);
  t("o veredito vem na forma do de hoje (tipo, estado, ficha, mudou, linha, fato, veto)", (() => { const v = aplica("jogo uma moeda ao mendigo"); return ["tipo", "estado", "ficha", "mudou", "linha", "fato", "veto"].every((k) => k in v) && Object.isFrozen(v); })());
  t("os textos de tela são PT-BR e de jogo («você», nunca «tu»)", !/\btu\b|\bteu\b|\btua\b/i.test(J(A_CENA_DO_OUVIDO.tela)));
}

sec("§5 a bolsa que já mexeu, o registro do console, a defesa");
{
  t("a bolsa igual não mudou", aFichaMudou(FICHA, { ...FICHA }) === false);
  t("a moeda, a mochila, os usos e o grupo mudados contam", aFichaMudou(FICHA, { ...FICHA, moedas: 8 }) && aFichaMudou(FICHA, { ...FICHA, inventario: [] }) && aFichaMudou(FICHA, { ...FICHA, suprimentos: { racoes: 1 } }) && aFichaMudou(FICHA, { ...FICHA, grupo: [{ nome: "Rhogar", inventario: [] }] }));
  const r = oRegistroDoOuvido("jogo uma moeda ao mendigo", ouve("jogo uma moeda ao mendigo"));
  t("o registro é uma linha, com a leitura e a resposta", /^\[o ouvido\] \{/.test(r) && (() => { const x = JSON.parse(r.slice(11)); return x.familia === "trocar" && x.subtipo === "dar" && x.veredito === "sim_com_preco" && x.caminho === "aplicar"; })(), r);
  let ok = true;
  try {
    ok = oOuvidoNaTroca(null, null).lido === false && aTrocaDoOuvido(null, null) === null && aTrocaDoOuvido(ouve("jogo uma moeda ao mendigo"), { ficha: null }) === null
      && aFichaMudou(null, FICHA) === false && typeof oRegistroDoOuvido(null, null) === "string";
  } catch { ok = false; }
  t("null em tudo não derruba", ok);
  t("a mesma frase na mesma cena dá a mesma resposta (determinístico)", J(ouve("dou a gazua")) === J(ouve("dou a gazua")));
  t("o que não é troca não tem caminho (as portas de troca não abrem)", ouve("olho em volta").caminho === null && ouve("olho em volta").lido === true);
}

sec("§6 a régua que decidiu a rede — o composto × o ouvido sozinho");
{
  /* o leitor de hoje (as listas), na forma em que teste-o-ouvido.mjs o mede */
  const MAPA = { pegar: "pegar", furto: "furtar", tomar: "furtar", suborno: "subornar", deGraca: "pedir", dar: "dar", pagamento: "pagar", vendaDeUso: "vender", fiado: "comprar", troca: "escambo", compra: "comprar", dadiva: "dar", companheiro: "pedir" };
  const hoje = (frase, cena) => {
    const c = cena || {}, h = c.heroi || {};
    const grupo = h.companheiro ? [{ nome: h.companheiro }] : [];
    const ficha = { moedas: h.moeda || 0, inventario: (h.carrega || []).map((n) => ({ nome: n })), equipamento: [], equipados: {}, suprimentos: {}, grupo };
    const presentes = (c.pessoas || []).map((p) => p.nome);
    const bancas = (c.pessoas || []).filter((p) => p.vende && p.vende.length).map((p) => ({ nome: p.nome, estoque: p.vende.map((v) => ({ nome: v.item, preco: v.preco })) }));
    const tenta = (f) => { try { return f(); } catch { return null; } };
    const it = tenta(() => aIntencaoDaTroca(frase, { grupo }));
    const ver = tenta(() => oVereditoDaTroca(frase, { ficha, presentes, chao: c.coisas || [], bancas, semente: "regua", lugar: c.lugar, dia: 1 }));
    const porta = tenta(() => aPortaFinalDaTroca(frase, { ficha, presentes }));
    const compra = tenta(() => compraNaFrase(frase, { balcao: [], bolsa: h.moeda || 0, bancas }));
    const dad = tenta(() => dadivaNaFrase(frase, { pessoas: [...presentes.map((x) => ({ nome: x })), ...grupo.map((g) => ({ ...g, companheiro: true }))], suprimentos: {} }));
    const ehTroca = !!(it || ver || porta || compra || dad);
    const tipo = (it && it.tipo) || (porta && ((porta.intencao && porta.intencao.tipo) || porta.tipo)) || (compra ? "compra" : null) || (dad ? "dadiva" : null) || (ver && ver.tipo) || null;
    return { ehTroca, subtipo: ehTroca ? MAPA[tipo] || null : null };
  };
  const treino = JSON.parse(ler("./treino-das-intencoes.json")).itens;
  const cenaDe = Object.fromEntries(treino.map((i) => [i.id, i.cena]));
  const corpus = JSON.parse(ler("./corpus-do-ouvido.json")).itens.map((i) => ({ ...i, cena: i.cena || cenaDe[i.cena_de] }));
  const medir = (itens, composto) => {
    let tp = 0, fp = 0, fn = 0;
    for (const it of itens) {
      const o = ouve(it.frase, it.cena);
      let troca = !!o.leitura && o.leitura.familia === "trocar";
      if (composto && !troca && hoje(it.frase, it.cena).ehTroca) troca = true;
      const g = it.resposta.familia === "trocar";
      tp += g && troca; fp += !g && troca; fn += g && !troca;
    }
    return { prec: (100 * tp) / Math.max(1, tp + fp), rev: (100 * tp) / Math.max(1, tp + fn) };
  };
  for (const [nome, itens] of [["treino", treino], ["corpus", corpus]]) {
    const so = medir(itens, false), co = medir(itens, true);
    console.log(`    ${nome}: ouvido sozinho ${so.prec.toFixed(1)} / ${so.rev.toFixed(1)} · composto ${co.prec.toFixed(1)} / ${co.rev.toFixed(1)} (precisão / revocação de «é troca»)`);
    t(nome + ": as listas como rede não somam nenhuma troca ao ouvido", co.rev <= so.rev + 1e-9);
    t(nome + ": e o ouvido sozinho é ao menos tão preciso (fica o ouvido sozinho)", so.prec >= co.prec);
  }
}

sec("§7 a fiação, lida no App.jsx");
{
  const APP = ler("../src/App.jsx");
  const corpo = (nome) => { const i = APP.indexOf(`  const ${nome} = `); if (i < 0) return ""; const j = APP.indexOf("\n  };\n", i); return APP.slice(i, j + 5); };
  t("o App importa a ponte do ouvido", /import \{ aCenaDoOuvido, oOuvidoNaTroca, aTrocaDoOuvido, aFichaMudou, aRespostaDaPergunta, oRegistroDoOuvido \} from "\.\/motor\/a-cena-do-ouvido\.js";/.test(APP));
  const ag = corpo("agirInterno");
  const iO = ag.indexOf("ouvido = ouvirAFrase(acao)"), iB = ag.indexOf("registarABolsaDaFrase(acao)");
  t("no turno, o ouvido lê antes da bolsa da frase", iO > 0 && iB > iO);
  t("…só com a chave do Mestre vivo, em try e calou", /if \(mestreVivoLigado\(\)\) \{\n\s*try \{ ouvido = ouvirAFrase\(acao\); \} catch \(e\) \{ calou\("Mestre vivo · o ouvido", e\);/.test(ag));
  t("a pergunta para o turno antes do Narrador", /if \(ouvido && ouvido\.parou\) return;/.test(ag));
  t("sem o ouvido (chave desligada ou estouro), a bolsa da frase abre como hoje", /const portasDeTroca = !ouvido \|\| /.test(ag) && /if \(portasDeTroca\) \{ try \{ registarABolsaDaFrase\(acao\); \}/.test(ag));
  t("depois das portas de hoje, o ouvido fecha a troca, em calou", /vereditoDaTrocaAntes\(acao, [^\n]*\n\s*\/\*[^\n]*\*\/\n\s*try \{ oOuvidoFechaATroca\(acao, oQueOMomentoFaz\(momentoDoTurnoRef\.current\)\); \} catch \(e\) \{ calou\("Mestre vivo · o ouvido fecha a troca", e\); \}/.test(ag));
  t("o momento não rola a troca que o ouvido já negou", /&& !ouvidoFechou\) momentoDoTurnoRef\.current = momentoDaAdjudicacao\(acao\);/.test(ag));
  const vt = corpo("vereditoDaTrocaAntes");
  t("a porta do veredito lê a intenção do ouvido; as listas só sem ele", /let it = ov \? ov\.intencao : aIntencaoDaTroca\(acao/.test(vt) && /if \(ov && \(ov\.fechou \|\| ov\.caminho !== "aplicar" \|\| !ov\.intencao\)\) return;/.test(vt));
  t("com o ouvido, a porta final não fala por cima dele", /it\.tipo === "dar" && !ov\)/.test(vt));
  const oa = corpo("ouvirAFrase");
  t("a leitura vai ao console, e só ao console", /console\.info\(oRegistroDoOuvido\(acao, o\)\)/.test(oa) && !/pushMsgs\([^\n]*oRegistroDoOuvido/.test(APP));
  t("a negativa vai pela porta da troca negada de hoje (aplicarOVereditoDaTroca)", /aplicarOVereditoDaTroca\(o\.negada\)/.test(oa));
  t("a pergunta mostra a linha com as opções e guarda a espera", /perguntaDoOuvidoRef\.current = o\.pergunta;/.test(oa) && /texto: o\.pergunta\.linha/.test(oa));
  const fe = corpo("oOuvidoFechaATroca");
  t("o ouvido só aplica o que nenhuma porta aplicou (fato, bolsa, dado à espera)", /um\.fato\.length\) return;/.test(fe) && /aFichaMudou\(ov\.antes, agora\)\) return;/.test(fe) && /tr\.intencao && !tr\.veredito\) return;/.test(fe));
  t("o que ele aplica vira fato do turno e linha pela porta de hoje", /aplicarOVereditoDaTroca\(v\);/.test(fe));
  t("a resposta à pergunta (o número ou o nome) reenvia a frase inteira, pela proposta da frase", /const r = pend \? aRespostaDaPergunta\(pend, texto\) : null;\n\s*if \(r\) \{ if \(!proporAFrase\(r\)\) partirOTurno\(r\); return true; \}/.test(corpo("proporAFrase")));
  t("nenhum bloco estático novo no prompt: o ouvido fala só pela pauta de um turno", !/SECOES|TETO_DA_PAUTA/.test(oa + fe + corpo("retratoDoOuvido")));
  t("o retrato lê cada fonte no seu calou", (corpo("retratoDoOuvido").match(/calou\("o ouvido · /g) || []).length >= 5);
  t("a regra do improviso é lida pela ponte (o módulo deixou a lista de espera)", aRespostaDoMestre(oOuvido("dou a gazua", CENA), CENA).veredito === ouve("dou a gazua").resposta.veredito &&!/"a-regra-do-improviso\.js":/.test(ler("./teste-ligacao.mjs")));
}

console.log("\n" + bons + " ok, " + maus + " XX");
process.exit(maus ? 1 : 0);
