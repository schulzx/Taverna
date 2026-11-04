/* OS SÍTIOS COMO CARTÕES (04/11, a 17.ª sessão, a proposta do `jogo`) — src/motor/os-sitios-como-cartoes.js

   Na 17.ª (mente/sessao-17.md) o IR por frase falhou 3 de 10 vezes, e quem
   jogava não podia saber, antes de ir, que o Godfrey estava de folga, nem
   que a folga era na Catedral da Cinza. A pessoa aprovou em 04/11 («Pode
   fazer os sítios como cartões») o cartão «Ir até X», com quem lá está.

   O que esta suíte prova, no mundo da 17.ª montado com as peças que o
   produzem (o léxico, a abertura, a principal, a rotina do Godfrey pela
   semente):
   §1 as tabelas: cada frase passa no verificador da ficha;
   §2 o lixo não estoura, a entrada não muda, a mesma entrada dá o mesmo
      (e a resposta guardada não se deixa mudar);
   §3 dia 1, 9h20, na rua de Torre Alto: o cartão da Catedral da Cinza diz
      que o Godfrey está lá de folga, e vem antes do Descanso — que não tem
      cartão seu, porque a mesma pessoa só tem um;
   §4 dia 1, de noite, ele em casa: o cartão é o do Descanso, com o porquê
      (onde anda); num dia de trabalho antes da hora, com a hora a que volta;
   §5 a verdade do cartão é a da chegada: o toque dá o mesmo passo
      (oPassoNaCidade), e lá chegado aPessoaDoPasso diz o mesmo;
   §6 o herói já no sítio não tem cartão para lá, e quem está com ele não
      tem cartão nenhum;
   §7 dado o primeiro passo, o Theron é de Vale Verde: em Torre Alto não há
      cartão para a catedral homónima; em Vale Verde, sem ninguém do passo
      à vista, não se inventa; e quem deu o passo só conta enquanto a pista
      está por perguntar;
   §8 o `revelar` desta cidade tem o seu cartão;
   §9 na estrada, na masmorra e na luta, nenhum; o teto corta. */
import { osSitiosComoCartoes, OS_SITIOS_COMO_CARTOES } from "../src/motor/os-sitios-como-cartoes.js";
import { aPessoaDoPasso } from "../src/motor/a-pessoa-do-passo.js";
import { oPassoNaCidade } from "../src/motor/tempo-do-turno.js";
import { verificarAFicha } from "../src/motor/ficha-de-ator.js";
import { garantirAbertura } from "../src/abertura.js";
import { criarMissao } from "../src/missoes.js";
import { oQueExisteAqui } from "../src/mundo-base.js";
import { moldePorId } from "../src/moldes.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const tpl = (x, v) => String(x).replace(/\{([A-Z])\}/g, (_, k) => (v[k] != null ? v[k] : ""));

/* ---------------- o mundo da 17.ª (o de testes/teste-sessao-17.mjs) ---------------- */
const SEMENTE = "O Sino de Cinza|Fantasia medieval";
const LEX = { tavernas: ["A Caneca Torta", "O Descanso do Carroceiro"], lugares: [
  { tipo: "taverna", chamado: "Estalagem", nomes: ["A Caneca Torta", "O Descanso do Carroceiro"] },
  { tipo: "templo", chamado: "Catedral", nomes: ["Ermida do Sino", "Catedral da Cinza"] },
  { tipo: "mercado", chamado: "Bazar", nomes: ["Feira do Sal", "Bazar das Especiarias"] },
] };
const TA = { nome: "Torre Alto", tipo: "capital", porte: "capital", populacao: 60000, regiao: "Planalto" };
const VV = { nome: "Vale Verde", tipo: "capital", porte: "capital", populacao: 9000, regiao: "Planalto" };
const MAPA = { cidades: [TA, VV] };
const MUNDO = { genero: "Fantasia medieval", molde: "sobremundo", lexico: LEX };
const ab = garantirAbertura({ principalId: "mis_principal", cidade: "Torre Alto", chegada: "à porta de Torre Alto", razao: "uma carta sem assinatura chamou-a a Torre Alto", sabe: "Godfrey Pescador, estalajadeiro, sabe", titulo: "O Sino de Cinza",
  pista: { nome: "Godfrey Pescador", papel: "estalajadeiro", local: "O Descanso do Carroceiro" }, alvo: { feitio: "encontrar", quem: "Theron do Brejo", onde: "Catedral da Cinza, em Vale Verde", objeto: "Theron do Brejo" } });
const PR = criarMissao({ id: "mis_principal", titulo: "O Sino de Cinza", tipo: "principal", status: "ativa", descricao: "uma carta", etapas: [
  { tipo: "falar_com", alvo: "Godfrey Pescador", onde: "O Descanso do Carroceiro" },
  { tipo: "falar_com", alvo: "Theron do Brejo", onde: "Catedral da Cinza, em Vale Verde" }] });
const DADO = [{ ...PR, etapas: [{ ...PR.etapas[0], feito: true }, PR.etapas[1]] }];
const INES = { nome: "Inês", genero: "mulher", nivel: 1, grupo: [{ nome: "Gareth", vinculo: 20, classe: "Caçador", raca: "Humano" }] };
const BASE = { personagem: INES, nomeCampanha: "O Sino de Cinza", mundo: MUNDO, abertura: ab, mapa: MAPA, cidadeAtual: "Torre Alto", dia: 1, minuto: 560, npcs: {}, missoes: [PR], lugar: null };
/* a lista do App: os sítios de dentro dos muros, como lugaresDaqui() os dá */
const sitiosDe = (c) => oQueExisteAqui(SEMENTE, MAPA, c, null, "Fantasia medieval", moldePorId("sobremundo"), LEX).locais.map((l) => ({ ...l, onde: "dentro" }));
const STA = sitiosDe("Torre Alto"), SVV = sitiosDe("Vale Verde");
const CATEDRAL = { nome: "Catedral da Cinza", cidade: "Torre Alto", distancia: "dentro" };
const DESCANSO = { nome: "O Descanso do Carroceiro", cidade: "Torre Alto", distancia: "dentro" };
const de = (cs, nome) => cs.find((c) => c.nome === nome);

sec("§1 as tabelas");
const P = OS_SITIOS_COMO_CARTOES;
const amostra = [P.oferta, P.esta, ...Object.values(P.fora), P.guarda, P.naoEsta, P.deFolga, P.chega, P.semGente]
  .map((x) => tpl(x, { L: "o Descanso do Carroceiro", N: "Godfrey Pescador", I: "às onze da manhã", T: "O Sino de Cinza" }));
t("cada frase da tabela passa no verificador da ficha", verificarAFicha(amostra.join("\n")).length === 0, J(verificarAFicha(amostra.join("\n"))));
t("os cômodos não têm cartão (são do prédio); o teto é um número da tabela", !P.de.includes("comodo") && Number.isInteger(P.teto) && P.teto > 0);
/* o retorno divide a linha com o verbo e o preço (Oferta, ui.jsx): a 1.ª
   versão tinha 95 caracteres e cortou-se no navegador; o teto é da tabela */
const longo = amostra.slice(1).filter((x) => x.length > P.tetoDoRetorno);
t(`cada retorno cabe em ${P.tetoDoRetorno} caracteres com um nome de dois termos`, longo.length === 0, J(longo));

sec("§2 o lixo e a mesma entrada");
let estourou = false;
try { for (const x of [null, undefined, 0, "x", [], {}, { cidadeAtual: "Torre Alto" }, { ...BASE, missoes: null }]) for (const s of [null, undefined, "x", [null, 3, {}]]) osSitiosComoCartoes(x, s); } catch (e) { estourou = e; }
t("o lixo não estoura e dá lista vazia", !estourou && osSitiosComoCartoes(null, null).length === 0 && osSitiosComoCartoes({ ...BASE, missoes: [] }, STA).length === 0, String(estourou));
const antes = J(BASE) + J(STA);
const c3 = osSitiosComoCartoes(BASE, STA);
t("a entrada não muda", J(BASE) + J(STA) === antes);
t("a mesma entrada dá o mesmo — também com cópias novas (a chave é o conteúdo)", J(osSitiosComoCartoes(JSON.parse(J(BASE)), JSON.parse(J(STA)))) === J(c3));
let mudou = false;
try { c3[0].diz = "mentira"; } catch { mudou = false; }
try { c3.push({}); } catch { /* congelada */ }
t("a resposta guardada não se deixa mudar", osSitiosComoCartoes(BASE, STA)[0].diz !== "mentira" && osSitiosComoCartoes(BASE, STA).length === c3.length && !mudou);

sec("§3 dia 1, 9h20, na rua de Torre Alto: o Godfrey de folga na catedral");
const cat = de(c3, "Catedral da Cinza");
t("há cartão da Catedral da Cinza: «Ir até Catedral da Cinza», «Godfrey Pescador está lá, de folga»", !!cat && cat.oferta === "Ir até Catedral da Cinza" && cat.diz === tpl(P.fora.folga, { N: "Godfrey Pescador" }), J(c3));
t("…é o primeiro, e a mesma pessoa não tem segundo cartão (o Descanso fica sem)", c3[0] === cat && !de(c3, "O Descanso do Carroceiro"), J(c3.map((c) => c.nome)));
t("…o toque leva o sítio tal como veio da lista, e os minutos são os do passo", cat.alvo.nome === "Catedral da Cinza" && cat.alvo.onde === "dentro" && cat.minutos === oPassoNaCidade(BASE, cat.alvo).minutos);
t("…e o id é o do sítio", cat.id === "sitio|Catedral da Cinza");

sec("§4 o porquê, quando não está");
const noite = osSitiosComoCartoes({ ...BASE, minuto: 1380 }, STA);
const dN = de(noite, "O Descanso do Carroceiro");
t("dia 1, 23h: nenhum cartão diz que está na catedral", !noite.some((c) => c.nome === "Catedral da Cinza"), J(noite));
t("…o do Descanso diz «Ir até o Descanso do Carroceiro» e «Godfrey Pescador está de folga hoje» (sem hora: hoje não vem)", !!dN && dN.oferta === "Ir até o Descanso do Carroceiro" && dN.diz === "Godfrey Pescador está de folga hoje", dN && dN.diz);
const cedo = osSitiosComoCartoes({ ...BASE, dia: 2, minuto: 300 }, STA);
const dC = de(cedo, "O Descanso do Carroceiro");
t("dia 2, 5h (dia de trabalho, antes da hora): «Godfrey Pescador só chega às onze da manhã»", !!dC && dC.diz === "Godfrey Pescador só chega às onze da manhã", J(cedo));
const hora = osSitiosComoCartoes({ ...BASE, dia: 2, minuto: 740 }, STA);
t("dia 2, 12h20, à hora dele: «Godfrey Pescador está lá»", (de(hora, "O Descanso do Carroceiro") || {}).diz === "Godfrey Pescador está lá", J(hora));

sec("§5 a verdade do cartão é a da chegada");
for (const [n, E] of [["9h20 do dia 1", BASE], ["23h do dia 1", { ...BASE, minuto: 1380 }], ["12h20 do dia 2", { ...BASE, dia: 2, minuto: 740 }]]) {
  for (const c of osSitiosComoCartoes(E, STA)) {
    const passo = oPassoNaCidade(E, c.alvo);
    const la = aPessoaDoPasso({ ...E, lugar: passo.lugar, minuto: E.minuto + passo.minutos }).find((p) => p.nome === c.quem);
    t(`${n}: «${c.oferta}» — chegado lá, ${c.quem} ${la && la.aqui ? "está" : "não está"}, como o cartão disse`, !!la && la.aqui === /está lá(,|$)/.test(c.diz));
  }
}

sec("§6 aqui não se vai");
const naCat = osSitiosComoCartoes({ ...BASE, lugar: CATEDRAL }, STA);
t("na catedral, com o Godfrey ao lado: nenhum cartão (nem para lá, nem para o Descanso dele)", naCat.length === 0, J(naCat));
const noDesc = osSitiosComoCartoes({ ...BASE, lugar: DESCANSO }, STA);
t("no Descanso, ele de folga: o cartão é o da catedral, e nenhum para o Descanso", !de(noDesc, "O Descanso do Carroceiro") && (de(noDesc, "Catedral da Cinza") || {}).diz === tpl(P.fora.folga, { N: "Godfrey Pescador" }), J(noDesc));
const noComodo = osSitiosComoCartoes({ ...BASE, dia: 2, minuto: 740, lugar: { nome: "O quarto de cima", cidade: "Torre Alto", dentroDe: "O Descanso do Carroceiro" } }, STA);
t("num cômodo do Descanso, o prédio também é «aqui»", !de(noComodo, "O Descanso do Carroceiro"), J(noComodo));

sec("§7 o segundo passo é de Vale Verde");
const ta2 = osSitiosComoCartoes({ ...BASE, missoes: DADO }, STA);
t("dado o primeiro, em Torre Alto, nenhum cartão manda à catedral homónima por causa do Theron", !ta2.some((c) => c.quem === "Theron do Brejo"), J(ta2));
const ta2p = osSitiosComoCartoes({ ...BASE, missoes: [{ ...DADO[0], etapas: [DADO[0].etapas[0], { ...DADO[0].etapas[1], perguntada: true }] }] }, STA);
t("quem deu o passo conta enquanto a pista está por perguntar; perguntada, deixa de ter cartão", ta2.some((c) => c.quem === "Godfrey Pescador") && !ta2p.some((c) => c.quem === "Godfrey Pescador"), J([ta2, ta2p]));
const vv = osSitiosComoCartoes({ ...BASE, missoes: DADO, cidadeAtual: "Vale Verde", dia: 2, minuto: 1220 }, SVV);
/* a suíte encontrou-o (04/11): o posto da pista vinha sem cidade, e o
   Descanso de Vale Verde punha-o atrás do balcão — no cartão e na ficha */
t("em Vale Verde, o Godfrey não está atrás do balcão do Descanso de lá (o posto dele é em Torre Alto)", !vv.some((c) => c.quem === "Godfrey Pescador") && !aPessoaDoPasso({ ...BASE, missoes: DADO, cidadeAtual: "Vale Verde", dia: 2, minuto: 740, lugar: { nome: "O Descanso do Carroceiro", cidade: "Vale Verde", distancia: "dentro" } }).some((p) => p.nome === "Godfrey Pescador"), J(vv));
/* neste léxico Vale Verde não tem catedral (é o Descanso, o Bazar, a forja…):
   o passo do Theron vai para um sítio que a cidade tem */
const NA_GUILDA = [{ ...DADO[0], etapas: [DADO[0].etapas[0], { ...DADO[0].etapas[1], onde: "A Ordem Bêbada, em Vale Verde" }] }];
const vvG = osSitiosComoCartoes({ ...BASE, missoes: NA_GUILDA, cidadeAtual: "Vale Verde", dia: 2, minuto: 600 }, SVV);
t("em Vale Verde, à hora dele, o sítio do Theron tem o cartão: «Ir até a Ordem Bêbada», «Theron do Brejo está lá»", (de(vvG, "A Ordem Bêbada") || {}).diz === "Theron do Brejo está lá" && de(vvG, "A Ordem Bêbada").oferta === "Ir até a Ordem Bêbada", J(vvG));
t("…e um passo para um sítio que a cidade não tem não inventa cartão", !vv.some((c) => c.quem === "Theron do Brejo"), J(vv));

sec("§8 o revelar desta cidade");
const REV = criarMissao({ id: "mis_rev", titulo: "O que a forja guarda", tipo: "secundaria", status: "ativa", descricao: "x", etapas: [{ tipo: "revelar", alvo: "A Têmpera da Aurora", onde: "A Têmpera da Aurora, em Torre Alto" }] });
const rv = osSitiosComoCartoes({ ...BASE, missoes: [REV] }, STA);
const forja = de(rv, "A Têmpera da Aurora");
t("o sítio do revelar tem cartão, e o que diz é a missão (ninguém do passo à vista)", !!forja && (forja.quem || forja.diz === tpl(P.semGente, { T: "O que a forja guarda" })) && forja.oferta === "Ir até a Têmpera da Aurora", J(rv));
const rvOutra = osSitiosComoCartoes({ ...BASE, missoes: [{ ...REV, etapas: [{ ...REV.etapas[0], onde: "A Têmpera da Aurora, em Vale Verde" }] }] }, STA);
t("…o de outra cidade não", !de(rvOutra, "A Têmpera da Aurora"), J(rvOutra));

sec("§9 onde não há cartão, e o teto");
for (const [n, x] of [["na estrada", { jornada: { de: "Torre Alto", para: "Vale Verde" } }], ["na masmorra", { masmorra: { id: "m" } }], ["na luta", { combate: true }], ["fora de cidade", { cidadeAtual: "" }]]) t(`${n}: nenhum`, osSitiosComoCartoes({ ...BASE, ...x }, STA).length === 0);
const muitas = [PR, ...["Ermida", "Forja", "Feira", "Cela"].map((n, i) => criarMissao({ id: "m" + i, titulo: n, tipo: "secundaria", status: "ativa", descricao: "x", etapas: [{ tipo: "revelar", alvo: STA[i + 1].nome, onde: STA[i + 1].nome }] }))];
const cheio = osSitiosComoCartoes({ ...BASE, missoes: muitas }, STA);
t(`com mais sítios que o teto, ficam ${P.teto}, e o primeiro continua a ser onde está a pessoa`, cheio.length === P.teto && cheio[0].quem === "Godfrey Pescador", J(cheio.map((c) => c.nome)));

console.log(`\nos sítios como cartões: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
