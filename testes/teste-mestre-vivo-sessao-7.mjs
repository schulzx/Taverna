/* teste-mestre-vivo-sessao-7.mjs (21/11/2026) — as sobras do juiz na sétima
   sessão jogada do Mestre vivo (mente/lancamento/mestre-vivo-sessao-7.md).

   Reproduzidas em Node com a composição do jogo (lerAcao com o contexto do
   desafio → a cena do retrato → a régua → o chamado), e consertadas na regra:
     1. o suborno ao sargento (T38, T39): pedido com oposição, com dado, e a
        quantia dita vai pelo pagamento da frase — e não é o passo até à sala;
     2. a pergunta do caminho a um destino distante (T40) não é a ida;
     3. a pergunta que cita a companheira não faz dela o alvo do regateio que
        vem depois do «?» (T29);
     4. a mentira ao guarda manco tem o guarda por alvo (T46: quem respondeu
        foi o sargento — isso é prosa, e o juiz está certo).
   As frases são da sessão (nossas, do testador do projeto). */
import { lerAcao } from "../src/desafios.js";
import { chamadoDoMomento } from "../src/a-cena-do-jogo.js";
import { oPagamentoDaFrase, aQuantiaDita } from "../src/motor/o-pagamento-da-frase.js";
import { idaAMasmorra, detectarPartida } from "../src/rastro.js";

let falhas = 0;
const t = (nome, cond, extra) => { if (cond) console.log("  ok:", nome); else { falhas++; console.log("  FALHA:", nome, extra != null ? `→ ${extra}` : ""); } };
const sec = (s) => console.log(`\n[${s}]`);

/* Ponto Valente: a companheira (Brigid) é a única do registro; o sargento e
   o guarda manco são gente da cena do Baluarte */
const VIVOS = [{ nome: "Brigid Cinza-Antiga", relacao: "companheiro", papel: "guerreira" }];
const pessoaDe = (txt) => { const n = String(txt || "").toLowerCase(); return VIVOS.find((v) => n.includes("brigid")) || (VIVOS.length === 1 ? VIVOS[0] : null); };
const BALUARTE = { nome: "O Baluarte Tortuoso", tipoDoLocal: "fortaleza" };
const ROSSIO = { nome: "O Rossio dos Andarilhos", tipoDoLocal: "mercado" };
const retrato = (lugar, pessoas = []) => ({ lugar, cidade: "Ponto Valente", minuto: 700, pessoas, grupo: [{ nome: "Brigid Cinza-Antiga" }],
  heroi: { condicoes: [], inventario: ["Bússola empenada"] }, semente: "sessao-7", dia: 2, saqueados: [] });
const leitura = (lugar) => ({ personagem: { nivel: 1, inventario: ["Bússola empenada"], habilidades: [], equipado: {}, moedas: 11, grupo: [{ nome: "Brigid Cinza-Antiga" }] },
  semente: "sessao-7", lugar: lugar.nome, tentativas: {}, dia: 2, chaveFina: true,
  ehPessoaConhecida: (x) => /brigid/i.test(x), pessoaDe, achadoDe: () => null, objetoEmCena: () => false });
const momento = (f, lugar, pessoas) => chamadoDoMomento(f, leitura(lugar), retrato(lugar, pessoas), {});

const T38 = "dou duas moedas ao sargento para ele me deixar entrar na sala do capitão";
const T39 = "ofereço duas moedas ao sargento para fechar os olhos e me deixar passar";
const T40 = "pergunto ao sargento qual é o caminho até a Cripta dos Mil Bocas";
const T29 = "o que Brigid acha da mulher de lenço? e regateio com o freguês dela: um frasco de graça";
const T46 = "minto ao guarda manco: sou a nova recruta mandada pelo capitão";

sec("1. o suborno ao sargento rola, e a quantia dita vai pelo pagamento (T38, T39)");
{
  for (const [n, f] of [[38, T38], [39, T39]]) {
    const v = lerAcao(f, leitura(BALUARTE));
    t(`T${n}: o catálogo ouve um teste de Persuasão (o passo até à sala cede a todo teste)`, v && v.tipo === "teste" && v.pericia === "persuasao", v && v.tipo);
    const m = momento(f, BALUARTE);
    t(`T${n}: rola, contra o sargento`, m.rola === true && /sargento/.test(String(m.alvo)), `${m.porque} · ${m.alvo}`);
    const pg = oPagamentoDaFrase(f, { fator: 1, pouso: null, moeda: "moedas" });
    t(`T${n}: o cartão do pagamento cobra as duas moedas ditas`, pg && pg.total === 2 && pg.dito === true && aQuantiaDita(f, "moedas") === 2, JSON.stringify(pg));
  }
  /* o que não é suborno continua de fora */
  for (const f of ["deito para fechar os olhos um pouco", "vou à praça para fechar os olhos um pouco", "espero a multidão me deixar passar"]) {
    const v = lerAcao(f, leitura(BALUARTE));
    t(`«${f}»: não é teste de conversa`, !v || v.tipo !== "teste", v && v.tipo);
  }
  t("«ofereço ajuda ao sargento» não cobra nada (oferta sem quantia nem preço)", oPagamentoDaFrase("ofereço ajuda ao sargento", { fator: 1, moeda: "moedas" }) === null);
}

sec("2. perguntar o caminho a um destino distante não é partir (T40)");
{
  const mapa = { cidades: [{ nome: "Ponto Valente", x: 50, y: 50, bioma: "planicie" }], rotas: [],
    regiao: { versao: 2, base: { nome: "Ponto Valente" }, lugares: [{ id: "l1", nome: "Cripta dos Mil Bocas", x: 50, y: 48.8, bioma: "montanha" }] } };
  const ctx = { cidadeAtual: "Ponto Valente", cidades: ["Ponto Valente"], mapa, masmorras: [{ ...mapa.regiao.lugares[0], nivel: 3, salas: 6 }], lugar: null, jornada: null };
  t("«pergunto ao sargento qual é o caminho até a Cripta…»: nada parte (o «é» sem acento partia a oração, e «o caminho» virava verbo)",
    !idaAMasmorra(T40, ctx) && !detectarPartida(T40, ctx));
  t("«vou à Cripta dos Mil Bocas» continua a ser a ida", !!idaAMasmorra("Vou à Cripta dos Mil Bocas.", ctx));
  t("«caminho até a Cripta» (o verbo, sem artigo) continua a ser a ida", !!idaAMasmorra("caminho até a Cripta dos Mil Bocas", ctx));
  t("e não há teste na pergunta: o Narrador responde", (() => { const m = momento(T40, BALUARTE); return m.rola === false; })());
}

sec("3. a pergunta que cita a companheira não é o alvo do regateio (T29)");
{
  const m = momento(T29, ROSSIO);
  t("o regateio com o freguês rola (quem vende tem motivo para negar)", m.rola === true, `${m.porque} · ${m.alvo}`);
  t("…e o alvo não é a Brigid", !/brigid/i.test(String(m.alvo)), m.alvo);
  t("a chave do livro leva o freguês", /\|fregues\|/.test(String((m.veredito || {}).chave)), (m.veredito || {}).chave);
  const comEla = momento("Brigid, o que acha? e regateio com ela o preço", ROSSIO);
  t("quando o ato depois do «?» é com ela, continua a ser com ela (sem dado: está do meu lado)", comEla.rola === false && /brigid/i.test(String(comEla.alvo)), `${comEla.porque} · ${comEla.alvo}`);
}

sec("4. a mentira ao guarda manco é com o guarda (T46)");
{
  const m = momento(T46, BALUARTE, [{ nome: "Sargento", papel: "sargento" }, { nome: "Guarda manco", papel: "guarda manco" }]);
  t("rola, e o alvo é o guarda (o sargento que respondeu na sessão foi a prosa)", m.rola === true && /guarda/.test(String(m.alvo)), `${m.porque} · ${m.alvo}`);
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
