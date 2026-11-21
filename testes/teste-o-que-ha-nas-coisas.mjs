/* teste-o-que-ha-nas-coisas.mjs (o Mestre que conhece a cena, etapa 3 · 21/11/2026)

   A suíte de src/o-que-ha-nas-coisas.js e da fiação dele: o que há escondido
   nas coisas comuns de cada lugar (por semente: o mundo, o lugar, o dia e a
   coisa), a firmeza do que se escala, as coisas ao toque na cena do jogo
   (que a régua só lê pela frase que as nomeia), a quest que só escreve
   estado (Q1), e a prova de que, com a chave do Mestre vivo desligada, nada
   disto corre. O desenho é mente/lancamento/o-mestre-vivo.md §23. */
import fs from "node:fs";
import path from "node:path";
import {
  AS_COISAS_AO_TOQUE, O_ESCONDIDO_NAS_COISAS, A_FIRMEZA_DO_QUE_SE_ESCALA, TIPOS_SEM_SITIO,
  tipoParaAsCoisas, firmezaDe, oQueHaNaCoisa, asCoisasAoToque, aCoisaAoToqueDaFrase,
  oQueOAchadoDa, telaDoAchadoNaCoisa, envelopeDoAchadoNaCoisa, O_ACHADO_NA_TELA,
} from "../src/o-que-ha-nas-coisas.js";
import { ELENCO_DO_LUGAR } from "../src/elenco-do-lugar.js";
import { consumivelPorId } from "../src/pocoes.js";
import { coisasQueAFraseNomeia, aCenaQueAFraseToca, lerCena, estadoPorId } from "../src/cena-do-momento.js";
import { cenaDoJogo, chamadoDoMomento, DERIVACAO_DA_CENA, ESTADOS_SEM_FONTE, FORMA_DO_RETRATO, oQueAQuestDeclara, O_QUE_A_QUEST_DECLARA } from "../src/a-cena-do-jogo.js";
import { retratoDosRefs } from "../src/o-mestre-vivo-no-jogo.js";
import { lerAcao } from "../src/desafios.js";
import { valeRolagem } from "../src/motor/a-regua-do-momento.js";

let falhas = 0;
const t = (nome, cond, extra) => { if (cond) console.log("  ok:", nome); else { falhas++; console.log("  FALHA:", nome, extra != null ? `→ ${extra}` : ""); } };
const sec = (s) => console.log(`\n[${s}]`);
const sem = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const nucleo = (n) => sem(n).replace(/^(o|a|os|as)\s+/, "").split(/\s+/)[0].replace(/s$/, "");
const app = fs.readFileSync(path.join("..", "src", "App.jsx"), "utf8");
const TIPOS = [...Object.keys(ELENCO_DO_LUGAR.tipos), ...Object.values(TIPOS_SEM_SITIO)];
const PROIBIDAS = /\b(dado|dados|rolagem|rolar|teste|testes|sucesso|regra|sistema|mestre|b[oô]nus|per[ií]cia|tu|teu|tua|contigo)\b/i;

sec("1. as tabelas");
{
  t("todo tipo de lugar (os do elenco, mais rua, interior e ermo) tem coisas ao toque, e nenhuma tabela tem tipo que não existe",
    TIPOS.every((k) => Array.isArray(AS_COISAS_AO_TOQUE[k]) && AS_COISAS_AO_TOQUE[k].length >= 2) && Object.keys(AS_COISAS_AO_TOQUE).every((k) => TIPOS.includes(k)));
  t("toda coisa ao toque tem artigo, e no máximo quatro por lugar (o que se revira, não o inventário)",
    Object.values(AS_COISAS_AO_TOQUE).every((l) => l.length <= 4 && l.every((n) => /^(o|a|os|as) \S/.test(n))));
  const RESERVADOS = ["porta", "lugar", "chao", "sala", "rastro", "portao"];
  t("nenhum núcleo de coisa ao toque é o de uma coisa que a cena escreve por outra fonte",
    [...Object.values(AS_COISAS_AO_TOQUE).flat(), ...A_FIRMEZA_DO_QUE_SE_ESCALA.frageis.map((f) => f.nome)].every((n) => !RESERVADOS.includes(nucleo(n))));
  const P = O_ESCONDIDO_NAS_COISAS.proporcao;
  t("a proporção é sóbria: nenhuma acima de 1 em 4, o padrão 1 em 10, e só tipos que existem",
    Object.entries(P).every(([k, v]) => TIPOS.includes(k) && v > 0 && v <= 0.25) && O_ESCONDIDO_NAS_COISAS.padrao === 0.1);
  t("o mercado e as docas (a coisa passa de mão em mão) guardam mais que a rua e o ermo; os lugares guardados ficam no padrão",
    P.mercado > P.rua && P.docas > P.ermo && P.taverna >= P.rua && !("templo" in P) && !("quartel" in P));
  const ACERVO = O_ESCONDIDO_NAS_COISAS.acervo;
  t("o acervo tem o padrão, e todo tipo dele existe", Array.isArray(ACERVO.padrao) && Object.keys(ACERVO).every((k) => k === "padrao" || TIPOS.includes(k)));
  const entradas = Object.values(ACERVO).flat();
  t("todo achado sai de uma tabela que já existe: moedas, ou um consumível comum de pocoes.js",
    entradas.every((a) => (Array.isArray(a.moedas) ? !a.consumivel : !!a.consumivel) && a.peso > 0 && typeof a.diz === "string" && a.diz.length > 8
      && (!a.consumivel || (consumivelPorId(a.consumivel) && consumivelPorId(a.consumivel).raridade === "comum"))));
  t("as moedas são poucas (nunca mais que 8: abaixo do baú do ermo)", entradas.filter((a) => a.moedas).every((a) => a.moedas[0] >= 1 && a.moedas[1] <= 8 && a.moedas[0] <= a.moedas[1]));
  t("o que o achado diz não fala do mecanismo", entradas.every((a) => !PROIBIDAS.test(a.diz)) && !PROIBIDAS.test(O_ACHADO_NA_TELA.moedas) && !PROIBIDAS.test(O_ACHADO_NA_TELA.item));
  const F = A_FIRMEZA_DO_QUE_SE_ESCALA;
  t("o frágil existe em tipos de lugar de verdade", F.frageis.every((f) => f.onde.length > 0 && f.onde.every((k) => TIPOS.includes(k))));
  t("as palavras do pedido estão lá: calha, treliça, corda velha, galho, telhado de palha",
    ["a calha", "a treliça", "a corda velha", "o galho", "o telhado de palha"].every((n) => F.frageis.some((f) => f.nome === n)));
  t("o firme nunca é frágil, em lugar nenhum (o degrau, a escada, o muro baixo)",
    ["o degrau", "a escada", "o muro baixo"].every((n) => F.firmes.includes(n)) && F.firmes.every((n) => TIPOS.every((k) => firmezaDe(n, k) === "firme")));
  t("firmezaDe: a calha é frágil na rua e não no ermo; o galho no ermo e não no mercado; o desconhecido é «»",
    firmezaDe("a calha", "rua") === "fragil" && firmezaDe("a calha", "ermo") === "" && firmezaDe("o galho", "ermo") === "fragil"
    && firmezaDe("o galho", "mercado") === "" && firmezaDe("a pedra lisa", "rua") === "" && firmezaDe("", "rua") === "");
  t("o estado frágil é da tabela fechada da cena, e pune", !!estadoPorId("fragil") && estadoPorId("fragil").pune === true);
}

sec("2. o tipo do lugar, para as coisas");
{
  t("o mercado pelo nome; a taverna pela palavra", tipoParaAsCoisas({ lugar: { nome: "Mercado de Cordas" }, cidade: "Vau" }) === "mercado"
    && tipoParaAsCoisas({ lugar: { nome: "Estalagem do Sino" }, cidade: "Vau" }) === "taverna");
  t("na cidade sem lugar, a rua; o largo sem tipo, a rua; o cômodo sem tipo, o interior",
    tipoParaAsCoisas({ cidade: "Vau" }) === "rua" && tipoParaAsCoisas({ lugar: { nome: "Largo do Cereal" }, cidade: "Vau" }) === "rua"
    && tipoParaAsCoisas({ lugar: { nome: "Quarto de cima", dentroDe: "Casa do Ferreiro" }, cidade: "Vau" }) === "interior");
  t("na estrada, nos arredores e sem cidade, o ermo", tipoParaAsCoisas({ jornada: true, cidade: "Vau" }) === "ermo"
    && tipoParaAsCoisas({ lugar: { nome: "Moinho", distancia: "arredores" }, cidade: "Vau" }) === "ermo" && tipoParaAsCoisas({}) === "ermo");
  t("na masmorra, nenhum (a sala tem os seus segredos); lixo não lança", tipoParaAsCoisas({ cidade: "Vau", masmorra: { salas: [], atual: 1 } }) === ""
    && tipoParaAsCoisas(null) === "ermo" && tipoParaAsCoisas("x") === "ermo");
}

sec("3. o que há numa coisa: a semente decide, e decide sempre igual");
{
  const base = { semente: "prova-3", lugar: "Mercado de Cordas", tipo: "mercado", coisa: "os cestos" };
  let primeiroCom = null, primeiroSem = null;
  for (let d = 0; d < 60 && (primeiroCom == null || primeiroSem == null); d++) {
    const a = oQueHaNaCoisa({ ...base, dia: d });
    if (a && primeiroCom == null) primeiroCom = d;
    if (!a && primeiroSem == null) primeiroSem = d;
  }
  t("há dias com algo nos cestos e dias sem", primeiroCom != null && primeiroSem != null, `${primeiroCom}/${primeiroSem}`);
  const a = oQueHaNaCoisa({ ...base, dia: primeiroCom });
  t("mesma semente, mesmo achado (dez vezes)", Array.from({ length: 10 }, () => JSON.stringify(oQueHaNaCoisa({ ...base, dia: primeiroCom }))).every((x) => x === JSON.stringify(a)));
  t("o achado tem a forma de um achado: id da coisa, espécie, o que é, onde (com a contração)", !!a && a.especie === "coisa"
    && a.id === `coisa|mercado de cordas|${primeiroCom}|cestos` && a.onde === "nos cestos" && a.coisa === "os cestos" && typeof a.o === "string"
    && (typeof a.moedas === "number" || typeof a.consumivel === "string"));
  t("o que já se achou não volta (os saqueados da base)", oQueHaNaCoisa({ ...base, dia: primeiroCom, saqueados: [a.id] }) === null);
  t("outra semente, outro mundo: a resposta muda em algum dia", Array.from({ length: 40 }, (_, d) => !!oQueHaNaCoisa({ ...base, dia: d }) !== !!oQueHaNaCoisa({ ...base, semente: "outra", dia: d })).some(Boolean));
  t("sem semente, sem coisa ou sem tipo: nada (sem árbitro não há achado); lixo não lança",
    oQueHaNaCoisa({ ...base, semente: "" }) === null && oQueHaNaCoisa({ ...base, coisa: "" }) === null && oQueHaNaCoisa({ ...base, tipo: "" }) === null
    && oQueHaNaCoisa(null) === null && oQueHaNaCoisa(42) === null);
  /* a proporção, lida de volta da tabela: 4000 sorteios por tipo */
  const medir = (tipo) => { let n = 0; const N = 4000; for (let i = 0; i < N; i++) if (oQueHaNaCoisa({ semente: "medida", lugar: "L" + (i % 40), tipo, dia: Math.floor(i / 40), coisa: "os caixotes" })) n++; return n / N; };
  const P = O_ESCONDIDO_NAS_COISAS.proporcao;
  const mm = medir("mercado"), mr = medir("rua"), mt = medir("templo");
  console.log(`  (medido: mercado ${mm.toFixed(3)} · rua ${mr.toFixed(3)} · templo ${mt.toFixed(3)})`);
  t("a proporção medida bate com a tabela (±0,03): mercado, rua e o padrão",
    Math.abs(mm - P.mercado) <= 0.03 && Math.abs(mr - P.rua) <= 0.03 && Math.abs(mt - O_ESCONDIDO_NAS_COISAS.padrao) <= 0.03);
  /* o acervo: só o que a tabela do tipo tem */
  const ids = new Set();
  for (let d = 0; d < 400; d++) { const x = oQueHaNaCoisa({ semente: "acervo", lugar: "Docas Velhas", tipo: "docas", dia: d, coisa: "os barris" }); if (x) ids.add(x.consumivel || "moedas"); }
  t("o que se acha nas docas é do acervo das docas", [...ids].every((k) => O_ESCONDIDO_NAS_COISAS.acervo.docas.some((e) => (e.consumivel || "moedas") === k)) && ids.size >= 2, [...ids].join(","));
}

sec("4. o achado na bolsa, pelo sistema");
{
  const moedas = { id: "coisa|x|1|cestos", especie: "coisa", coisa: "os cestos", o: "umas moedas", onde: "nos cestos", moedas: 5, icone: "🧺" };
  const item = { id: "coisa|x|2|barris", especie: "coisa", coisa: "os barris", o: "um rolo de ataduras", onde: "nos barris", consumivel: "ataduras", icone: "🧺" };
  const gm = oQueOAchadoDa(moedas), gi = oQueOAchadoDa(item);
  t("as moedas: o número da semente; o item: o consumível da tabela", gm.moedas === 5 && gm.consumivel === "" && gi.consumivel === "ataduras" && gi.nome === consumivelPorId("ataduras").nome);
  t("outro achado (o baú, o passo) não é daqui; o consumível que não existe não paga", oQueOAchadoDa({ especie: "tesouro", o: "x" }) === null
    && oQueOAchadoDa({ especie: "passo" }) === null && oQueOAchadoDa({ ...item, consumivel: "nao_existe" }) === null && oQueOAchadoDa(null) === null);
  t("a tela diz o que entrou na bolsa", telaDoAchadoNaCoisa(moedas, gm) === "🧺 Umas moedas — ◉ 5 moedas na sua bolsa."
    && telaDoAchadoNaCoisa(item, gi) === `🧺 Um rolo de ataduras — ${consumivelPorId("ataduras").nome} na sua bolsa.`);
  const env = envelopeDoAchadoNaCoisa(item, gi);
  t("o envelope é fato fixo: onde, o quê, o que já está na bolsa, e que a coisa ficou vazia", env.includes("Procurei nos barris") && env.includes(consumivelPorId("ataduras").nome)
    && env.includes("NÃO envie itens nem moedas") && env.includes("Nos barris agora não guarda mais nada"));
  t("sem achado ou sem ganho, nada", telaDoAchadoNaCoisa(null, gm) === "" && envelopeDoAchadoNaCoisa(moedas, null) === "");
}

sec("5. as coisas ao toque na cena do jogo, e a régua que só as lê pela frase");
{
  const R = { lugar: { nome: "Mercado de Cordas" }, cidade: "Vau", minuto: 10 * 60, clima: "ensolarado", semente: "prova-5", saqueados: [] };
  const cestosNoDia = (temAlgo) => { for (let d = 0; d < 80; d++) { const c = asCoisasAoToque({ ...R, dia: d }).find((x) => x.nome === "os cestos"); if (c.estados.includes("ha_algo_escondido") === temAlgo) return d; } return null; };
  const dCom = cestosNoDia(true), dSem = cestosNoDia(false);
  const cena = cenaDoJogo({ ...R, dia: dCom });
  const cestos = cena.coisas.find((x) => x.nome === "os cestos"), calha = cena.coisas.find((x) => x.nome === "a calha");
  t("a cena do mercado tem as coisas dele, marcadas ao toque, depois da porta e do lugar", !!cestos && cestos.toque === true && cestos.estados.includes("ha_algo_escondido")
    && cena.coisas[0].nome === "porta" && cena.coisas[1].nome === "o lugar" && !cena.coisas[0].toque && !cena.coisas[1].toque);
  t("a calha e o toldo do mercado são frágeis", !!calha && calha.estados.includes("fragil") && calha.toque === true && cena.coisas.some((x) => x.nome === "o toldo" && x.estados.includes("fragil")));
  t("a coisa vazia também está em cena (nomeável), sem estado", cena.coisas.some((x) => x.nome === "a carroça" && x.toque && x.estados.length === 0)
    || cena.coisas.filter((x) => x.toque && x.estados.length === 0).length > 0);
  t("na masmorra, nenhuma coisa ao toque", !cenaDoJogo({ ...R, dia: dCom, masmorra: { salas: [{ id: 1, tipo: "combate", saidas: [] }], atual: 1 } }).coisas.some((x) => x.toque));
  t("a cena sem coisa ao toque passa por aCenaQueAFraseToca como veio (a mesma referência)", (() => { const c = lerCena({ coisas: [{ nome: "o lugar", estados: [] }] }); return aCenaQueAFraseToca(c, "procuro") === c; })());
  t("a cena vista pela frase só guarda as coisas ao toque nomeadas", (() => {
    const v = aCenaQueAFraseToca(cena, "reviro os cestos");
    return v.coisas.some((x) => x.nome === "os cestos") && !v.coisas.some((x) => x.nome === "a calha") && v.coisas.some((x) => x.nome === "porta");
  })());
  const leitura = { semente: "prova-5", lugar: "Mercado de Cordas", personagem: { nivel: 1, inventario: [] }, tentativas: {} };
  const m = (f, d) => chamadoDoMomento(f, { ...leitura, dia: d }, { ...R, dia: d }, {});
  t("procurar onde há algo pede dado", m("reviro os cestos procurando alguma coisa", dCom).rola === true);
  t("procurar onde não há nada não pede (o vazio, sem dado)", (() => { const x = m("reviro os cestos procurando alguma coisa", dSem); return x.rola === false && x.porque === "buscaVazia"; })());
  t("a busca geral não lê o que está nos cestos (a coisa ao toque é só da frase que a nomeia)", m("procuro pistas pelo mercado", dCom).rola === false);
  t("escalar a calha frágil pede dado, sem altura dita", (() => { const x = m("escalo a calha até o telhado", dSem); return x.rola === true && x.porque === "travessiaArriscada"; })());
  t("o muro baixo e a escada não pedem", m("escalo o muro baixo até o telhado", dSem).rola === false && m("subo pela escada até o sótão", dSem).rola === false);
  t("a calha frágil da cena não faz rolar a escalada de outra coisa", m("escalo o muro do quintal", dSem).rola === false);
  t("a altura dita continua a ser perigo, frágil ou não", m("escalo o muro, uns seis metros, até o telhado", dSem).rola === true);
  /* a dona olhando: a régua de §19 (A_BUSCA_SOB_OLHOS), com a coisa ao toque vazia */
  const comDona = { ...R, dia: dSem, pessoas: [{ nome: "Isolde", papel: "vendedora de cordas" }] };
  t("revistar o que é de alguém com o dono olhando pede dado, haja ou não algo", chamadoDoMomento("reviro os cestos da banca de Isolde", { ...leitura, dia: dSem }, comDona, {}).rola === true);
  t("o mesmo, com a dona longe e nada nos cestos: sem dado", chamadoDoMomento("reviro os cestos da banca de Isolde", { ...leitura, dia: dSem }, { ...R, dia: dSem }, {}).rola === false);
}

sec("6. a coisa ao toque da frase, e a chave do livro");
{
  const R = { semente: "prova-6", lugar: { nome: "Docas Velhas" }, cidade: "Vau", dia: 0, saqueados: [] };
  let dia = 0; for (; dia < 80; dia++) if (asCoisasAoToque({ ...R, dia }).find((x) => x.nome === "os barris").estados.includes("ha_algo_escondido")) break;
  const ct = aCoisaAoToqueDaFrase("vasculho os barris do canto", { ...R, dia }, coisasQueAFraseNomeia);
  t("a frase que nomeia os barris: a coisa e o achado dela", !!ct && ct.nome === "os barris" && !!ct.achado && ct.achado.coisa === "os barris");
  t("o achado é o mesmo que oQueHaNaCoisa dá (uma régua só)", JSON.stringify(ct.achado) === JSON.stringify(oQueHaNaCoisa({ semente: "prova-6", lugar: "Docas Velhas", tipo: "docas", dia, coisa: "os barris" })));
  t("sem coisa nomeada, nada; sem quem nomeie, nada; lixo não lança", aCoisaAoToqueDaFrase("procuro por aqui", { ...R, dia }, coisasQueAFraseNomeia) === null
    && aCoisaAoToqueDaFrase("vasculho os barris", { ...R, dia }, null) === null && aCoisaAoToqueDaFrase(null, R, coisasQueAFraseNomeia) === null);
  const ctx = { personagem: { nivel: 1, inventario: [] }, semente: "s", lugar: "Docas Velhas", tentativas: {}, dia: 1, ehPessoaConhecida: () => false };
  const v0 = lerAcao("vasculho os barris do canto", ctx);
  const v1 = lerAcao("vasculho os barris do canto", { ...ctx, chaveFina: true, coisaDaBusca: () => "os barris" });
  const v2 = lerAcao("vasculho os barris do canto", { ...ctx, coisaDaBusca: () => "os barris" });
  t("com a chave fina e a coisa ao toque, a busca chaveia pela coisa (fica revirada sozinha)", v1 && v1.chave === "docas velhas|busca|barris", v1 && v1.chave);
  t("sem a chave fina, a chave de sempre (do lugar), mesmo com a função", v0 && v2 && v0.chave === v2.chave && v0.chave === "docas velhas|busca", v0 && v0.chave);
  let recebeu = null;
  lerAcao("vasculho os barris do canto", { ...ctx, achadoDe: (attr, frase) => { recebeu = frase; return null; } });
  t("o achado da busca recebe a frase (o segundo argumento, que quem não o lê ignora)", recebeu === "vasculho os barris do canto");
}

sec("7. a fonte de cada estado (o frágil saiu dos sem fonte)");
{
  t("frágil tem linha na derivação, com a fonte escrita, e não está mais entre os sem fonte",
    DERIVACAO_DA_CENA.some((l) => l.estado === "fragil" && /A_FIRMEZA_DO_QUE_SE_ESCALA/.test(l.fonte)) && !ESTADOS_SEM_FONTE.some((s) => s.estado === "fragil"));
  t("o achado da coisa ao toque está na fonte de «há algo escondido»", DERIVACAO_DA_CENA.some((l) => l.estado === "ha_algo_escondido" && /O_ESCONDIDO_NAS_COISAS/.test(l.fonte)));
  t("o retrato diz de onde vêm a semente, o dia e os saqueados", ["semente", "dia", "saqueados"].every((k) => typeof FORMA_DO_RETRATO[k] === "string"));
  const r = retratoDosRefs({ lugar: { nome: "Mercado" }, cidade: "Vau", semente: "abc", dia: 4, saqueados: ["coisa|x", 7] });
  t("retratoDosRefs passa os três (os saqueados só como texto)", r.semente === "abc" && r.dia === 4 && r.saqueados.length === 1 && r.saqueados[0] === "coisa|x");
}

sec("8. Q1 — a quest só escreve estado");
{
  const passo = { quest: "q", etapa: "e", especie: "segredo",
    candidatos: { pessoa: [{ tipo: "pessoa", nome: "Edda", predicado: "consultou" }, { tipo: "pessoa", nome: "Oto", predicado: "conversou", rotulo: "quem esconde Lia" }, { tipo: "pessoa", nome: "Bea", predicado: "conversou", rotulo: "quem viu o fogo" }], lugar: [], item: [] },
    lugares: [{ id: "l1", nome: "Ruína do Moinho", cidade: "Vau", guarda: "a página arrancada" }], descobrir: [] };
  const aqui = { lugar: "Ruína do Moinho", dentroDe: "", cidade: "Vau", foraDosMuros: false };
  const d = oQueAQuestDeclara([passo], aqui);
  t("quem a etapa manda «arrancar o que sabe» esconde; quem a quest descreve como quem esconde, também; os outros não",
    d.esconde.includes("Edda") && d.esconde.includes("Oto") && !d.esconde.includes("Bea"));
  t("o que a quest faz nascer no lugar onde o herói está fica escondido ali; noutro lugar, não",
    d.escondido.includes("a página arrancada") && oQueAQuestDeclara([passo], { ...aqui, lugar: "Praça" }).escondido.length === 0);
  t("a tabela da declaração diz o predicado e o rótulo", O_QUE_A_QUEST_DECLARA.esconde.predicados.includes("consultou") && O_QUE_A_QUEST_DECLARA.esconde.rotulo.test("quem esconde x"));
  t("lixo não lança", oQueAQuestDeclara(null, null).esconde.length === 0 && oQueAQuestDeclara([null, 3], "x").escondido.length === 0);
  const c = cenaDoJogo({ lugar: { nome: "Ruína do Moinho" }, cidade: "Vau", pessoas: [{ nome: "Edda" }, { nome: "Bea" }], passos: [passo], onde: aqui });
  t("na cena: Edda esconde algo, Bea não; a página é coisa nomeável com algo escondido",
    c.pessoas.find((p) => p.nome === "Edda").estados.includes("esconde_algo") && !c.pessoas.find((p) => p.nome === "Bea").estados.includes("esconde_algo")
    && c.coisas.some((x) => x.nome === "a página arrancada" && x.estados.includes("ha_algo_escondido")));
  /* a trava de §5: a quest não toca no dado — sem os campos da quest, a mesma cena dá o mesmo chamado */
  const leitura = { semente: "q1", lugar: "Ruína do Moinho", personagem: { nivel: 1, inventario: [] }, tentativas: {} };
  const comQ = chamadoDoMomento("escalo o muro baixo", leitura, { lugar: { nome: "Ruína do Moinho" }, cidade: "Vau", passos: [passo], onde: aqui }, {});
  const semQ = chamadoDoMomento("escalo o muro baixo", leitura, { lugar: { nome: "Ruína do Moinho" }, cidade: "Vau" }, {});
  t("a quest não pede dado: o chamado de uma ação que nada tem a ver com ela sai igual", comQ.rola === semQ.rola && comQ.porque === semQ.porque);
}

sec("9. a fiação no App, atrás da chave");
{
  const corpo = (nome) => { const i = app.indexOf(`const ${nome} = `); return i < 0 ? "" : app.slice(i, i + 1800); };
  t("a coisa ao toque da frase só existe com o Mestre vivo (desligado, null)", /const aCoisaAoToqueAgora = \(frase\) => \{\s*try \{\s*if \(!mestreVivoLigado\(\)\) return null;/.test(app));
  t("o achado da busca passa pela coisa ao toque (que é null sem a chave) e depois pelo de sempre",
    /achadoDe: \(attr, frase\) =>/.test(app) && /const ct = aCoisaAoToqueAgora\(frase\);\s*if \(ct && ct\.achado\) return ct\.achado;\s*\}\s*return achavelAqui\(/.test(app));
  t("a chave do livro pela coisa: a função vai no contexto, e o livro só a lê com a chave fina", /coisaDaBusca: \(frase\) => \{ const ct = aCoisaAoToqueAgora\(frase\); return ct \? ct\.nome : ""; \}/.test(app));
  t("o retrato leva a semente, o dia e os saqueados", /semente: vale\("a semente", \(\) => sementeMundo\(\), ""\)/.test(app) && /saqueados: vale\("os saqueados"/.test(app));
  t("o achado da coisa paga pela tabela (não pela conta do baú) e saqueia a base", /r\.achado\.especie === "coisa"\) \{[\s\S]{0,400}pagarOAchadoDaCoisa\(r\.achado, persT\)/.test(app)
    && /registrarSaque\(achado\.id\)/.test(corpo("pagarOAchadoDaCoisa")) && /calou\("Mestre vivo · o achado da coisa"/.test(corpo("pagarOAchadoDaCoisa")));
  t("a mão leve que passou sobre uma coisa com algo: só com a chave, e em calou", /des\.id === "bater_carteira" && !r\.achado && mestreVivoLigado\(\)/.test(app) && /calou\("Mestre vivo · o achado da mão leve"/.test(app));
  t("o regateio sem dado: no que acontece sem dado (só o Mestre vivo chega lá), em calou", /aplicarORegateio\(\{ frase: acao \}, null, 0, null, true\); \} catch \(e\) \{ calou\("Mestre vivo · o regateio sem dado"/.test(app)
    && /semDado: semDado === true/.test(app));
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
