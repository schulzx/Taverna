/* ETAPA 10 — o COBRADOR, a memória do mundo.

   "O herói fez X há três dias. O que o mundo faz sobre isso AGORA?"

   O que este teste precisa provar, e por esta ordem: que a cobrança é
   RASTREÁVEL até o ato, que o mundo também PAGA, que a dívida MATURA, e
   que ela é cobrada UMA vez só. As quatro são o desenho inteiro; se
   qualquer uma falhar, o que sobra é evento aleatório com cara de
   castigo. */
import {
  COBRANCAS, MATURACAO, DIAS_ENTRE_COBRANCAS, DIAS_ATE_PRESCREVER,
  cobrancaPorId, garantirDivida, chaveDaDivida, dividasAbertas,
  consultarCobrador, linhaDoMundo, envelopeDoMundo, COBRADOR_PROMPT,
} from "../src/cobrador.js";
import { garantirLinha, anotar } from "../src/registro.js";
import { ATOS } from "../src/interprete.js";
import { SECOES, secaoPorId, porNaPauta, textoDaPauta } from "../src/pauta.js";

let ok = 0, bad = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; } else { bad++; console.log("  FALHOU: " + nome + (extra ? " — " + extra : "")); } };

const linha = (x) => garantirLinha({ t: 1, dia: 1, onde: "no Escudo das Velas", quem: ["Marta"], viu: ["Marta"], oQue: "matei o cobrador na porta", peso: 2, ato: "feri", ...x });

console.log("== A CATRACA ==");
const campos = Object.keys(garantirDivida(null));
const lidos = new Set();
for (const c of COBRANCAS) for (const m of String(c.quando).matchAll(/\bd\.([a-zA-Z]+)/g)) lidos.add(m[1]);
for (const fn of [linhaDoMundo, consultarCobrador, dividasAbertas]) for (const m of String(fn).matchAll(/\bd\.([a-zA-Z]+)/g)) lidos.add(m[1]);
const orfaos = [...lidos].filter((c) => !campos.includes(c));
t("nenhuma cobrança lê campo que a garantia não entrega", orfaos.length === 0, orfaos.join(", "));

console.log("\n== E O REGISTRO ENTREGA O QUE A DÍVIDA PRECISA ==");
/* a dívida nasce de uma linha do registro. Um campo que a dívida lê e o
   registro não guarda ficaria `undefined` para sempre, a condição viraria
   falsa e a cobrança calaria em silêncio — o bug da etapa 6. */
const daLinha = Object.keys(garantirLinha(null));
const precisa = ["ato", "peso", "viu", "quem", "onde", "oQue", "dia", "t", "suborno", "fugi", "poupei", "alguemPrecisava", "emCombate", "publico"];
const faltando = precisa.filter((c) => !daLinha.includes(c));
t("o registro guarda tudo o que a dívida lê", faltando.length === 0, faltando.join(", "));
t("e o ato guardado é da lista fechada do Intérprete",
  ATOS.some((a) => a.id === garantirLinha({ ato: "feri" }).ato));

console.log("\n== O ACERVO SE FECHA ==");
t("nenhum id repetido", new Set(COBRANCAS.map((c) => c.id)).size === COBRANCAS.length);
t("toda cobrança tem as quatro coisas",
  COBRANCAS.every((c) => c.id && c.o && typeof c.quando === "function" && [1, 0, -1].includes(c.sinal)));
t("nenhuma escreve fala", COBRANCAS.every((c) => !/["""]/.test(c.o)));
t("nenhuma escolhe adjetivo pelo Narrador", COBRANCAS.every((c) => !/sombri|terrível|assustador|belo|horrend/i.test(c.o)));
t("o acervo tem tamanho", COBRANCAS.length >= 28, String(COBRANCAS.length));
const aFavor = COBRANCAS.filter((c) => c.sinal > 0).length;
const contra = COBRANCAS.filter((c) => c.sinal < 0).length;
console.log(`      ${COBRANCAS.length} formas · ${aFavor} a favor · ${contra} contra · ${COBRANCAS.length - aFavor - contra} neutras`);
t("o mundo também PAGA, e não só cobra", aFavor >= 7,
  "um mundo que só cobra é um mundo que pune, e ninguém quer jogar nele");
t("a busca por id acha e não inventa", cobrancaPorId(COBRANCAS[0].id) === COBRANCAS[0] && cobrancaPorId("xx") === null);

console.log("\n== A DÍVIDA MATURA ==");
/* cobrar no turno seguinte é reação, não memória */
const reg = [linha({ dia: 10, peso: 2 })];
t("no dia seguinte, nada", consultarCobrador(reg, { dia: 11, temGente: true }) === null);
t("dois dias depois, ainda nada", consultarCobrador(reg, { dia: 12, temGente: true }) === null);
t("passada a maturação, o mundo cobra", !!consultarCobrador(reg, { dia: 13, temGente: true }));
t("a virada matura em 3 dias", MATURACAO[2] === 3);
t("a marca matura mais rápido — corre o mundo antes", MATURACAO[3] < MATURACAO[1]);
t("peso 0 nunca vira dívida", dividasAbertas([linha({ dia: 1, peso: 0 })], { dia: 40 }).length === 0,
  "o tecido do dia não deixa conta");
t("e a dívida velha demais prescreve",
  dividasAbertas([linha({ dia: 1, peso: 3 })], { dia: 1 + DIAS_ATE_PRESCREVER + 1 }).length === 0);
t("mas até lá ela continua aberta",
  dividasAbertas([linha({ dia: 1, peso: 3 })], { dia: 1 + DIAS_ATE_PRESCREVER - 1 }).length === 1);

console.log("\n== A CADÊNCIA: O MUNDO NÃO VIRA PERSEGUIÇÃO ==");
const muitas = Array.from({ length: 30 }, (_, i) => linha({ t: i + 1, dia: 1 + i, peso: 2, oQue: "ato " + i }));
t("logo depois de cobrar, não cobra de novo",
  consultarCobrador(muitas, { dia: 40, temGente: true, ultimaCobranca: 38 }) === null);
t("passados os dias da cadência, cobra",
  !!consultarCobrador(muitas, { dia: 40, temGente: true, ultimaCobranca: 40 - DIAS_ENTRE_COBRANCAS }));
/* e a simulação: uma campanha de 120 dias com um ato pesado por dia */
{
  let ultima = -99; const feitas = []; let quantas = 0;
  for (let dia = 1; dia <= 120; dia++) {
    const r = consultarCobrador(muitas, { dia, cobradas: feitas, ultimaCobranca: ultima, temGente: true });
    if (r) { quantas++; feitas.push(r.chave); ultima = dia; }
  }
  console.log(`      120 dias, 30 atos pesados: ${quantas} cobranças`);
  t("o mundo cobra pouco", quantas <= 120 / DIAS_ENTRE_COBRANCAS + 1, String(quantas));
  t("mas cobra", quantas >= 5);
  t("e nunca cobra o mesmo ato duas vezes", new Set(feitas).size === feitas.length);
}

console.log("\n== A MESMA CONTA NUNCA CHEGA DUAS VEZES ==");
const r1 = consultarCobrador(reg, { dia: 20, temGente: true });
t("a primeira vez cobra", !!r1);
t("com a chave guardada, não cobra de novo",
  consultarCobrador(reg, { dia: 40, cobradas: [r1.chave], temGente: true }) === null);
t("a chave é do turno e do dia, não do texto",
  chaveDaDivida({ t: 5, dia: 9 }) === chaveDaDivida({ t: 5, dia: 9, oQue: "outra coisa" }));
t("dois atos iguais em dias diferentes são duas dívidas",
  chaveDaDivida({ t: 5, dia: 9 }) !== chaveDaDivida({ t: 6, dia: 10 }));

console.log("\n== A COBRANÇA É RASTREÁVEL ==");
/* a regra que separa consequência de evento aleatório */
const l1 = linhaDoMundo(r1);
console.log("      " + l1);
t("a linha diz o que o mundo faz", l1.length > 20);
t("e diz por causa do quê", /por "/.test(l1), "sem isto o jogador leva um castigo sem saber de onde veio");
t("e diz quando foi", /ontem|há d+ dias|há uma semana|há umas d+ semanas|há mais de um mês/.test(l1));
t("e onde foi", /Escudo das Velas/.test(l1));
t("a linha é curta", l1.length <= 220, String(l1.length));
t("sem cobrança, sem linha", linhaDoMundo(null) === "");

console.log("\n== TODA COBRANÇA PRODUZ LINHA RASTREÁVEL ==");
let semRastro = 0;
for (const c of COBRANCAS) {
  const falsa = { divida: garantirDivida(linha({ diasDesde: 9 })), cobranca: c, chave: "1|1" };
  const ln = linhaDoMundo(falsa);
  if (!ln.includes(c.o) || !/por "/.test(ln)) { semRastro++; console.log("      sem rastro: " + c.id); }
  if (ln.length > 240) { bad++; console.log("      longa demais: " + c.id + " (" + ln.length + ")"); }
}
t("todas as formas produzem linha com rastro", semRastro === 0);

console.log("\n== O ENVELOPE PROTEGE O QUE O MUNDO PAGA ==");
/* transformar em ameaça uma coisa que o mundo está pagando de volta
   seria pior do que não pagar */
const boa = COBRANCAS.find((c) => c.sinal > 0);
const ruim = COBRANCAS.find((c) => c.sinal < 0);
const envBoa = envelopeDoMundo({ divida: garantirDivida(linha({ diasDesde: 6 })), cobranca: boa });
const envRuim = envelopeDoMundo({ divida: garantirDivida(linha({ diasDesde: 6 })), cobranca: ruim });
t("o envelope da boa manda não virar ameaça", /não transforme em ameaça/.test(envBoa));
t("o da ruim diz que não é castigo do destino", /não é ataque nem castigo/.test(envRuim));
t("os dois dizem de que ato veio", /por "/.test(envBoa) && /por "/.test(envRuim));
t("nenhum escreve a cena", !/cheiro|sussurr|sombra dan/.test(envBoa + envRuim));
t("sem cobrança, sem envelope", envelopeDoMundo(null) === "");
console.log("      " + envBoa.slice(0, 190));

console.log("\n== CADA ATO ENCONTRA A SUA COBRANÇA ==");
/* e a REDE: nenhum ato pode ficar sem forma nenhuma, senão o Cobrador
   cala na cena mais comum e a mudez não avisa */
let mudos = 0, amostras = 0;
const vf = [true, false];
for (const ato of ATOS.map((a) => a.id)) for (const peso of [1, 2, 3])
  for (const publico of vf) for (const viu of [[], ["A"], ["A", "B"]])
    for (const temGente of vf) for (const fama of [0, 50, 75]) {
      amostras++;
      const r = consultarCobrador([linha({ dia: 1, peso, ato, viu, quem: viu })],
        { dia: 30, publico, fama, temGente });
      if (!r) { mudos++; if (mudos <= 3) console.log(`      mudo: ${ato} peso${peso} publico=${publico} viu=${viu.length} gente=${temGente}`); }
    }
t("nenhuma combinação deixa o Cobrador mudo", mudos === 0, `${mudos} de ${amostras}`);
console.log(`      ${amostras} combinações varridas · ${mudos} sem cobrança`);

console.log("\n== O CONTEXTO DO ATO CHEGA E É LIDO ==");
/* metade das formas depende dele; se ele não chegar, elas calam em
   silêncio — que foi o bug da etapa 6 */
const comCtx = (ctx) => consultarCobrador([linha({ dia: 1, peso: 2, ato: "ignorei", ...ctx })], { dia: 30, temGente: true });
t("suborno muda a cobrança",
  comCtx({ ato: "paguei", suborno: true }).cobranca.id === "o_subornado_quer_mais");
t("e sem suborno, é outra", comCtx({ ato: "paguei", suborno: false }).cobranca.id !== "o_subornado_quer_mais");
t("poupar produz cobrança a favor", comCtx({ poupei: true }).cobranca.sinal > 0);
t("ter virado as costas produz cobrança contra", comCtx({ alguemPrecisava: true }).cobranca.sinal < 0);
t("fugir é lembrado", comCtx({ fugi: true, viu: ["A"] }).cobranca.id === "a_fuga_correu");

console.log("\n== A SEÇÃO DA PAUTA ==");
t("a seção existe", !!secaoPorId("mundo"));
t("ela vem depois do vilão", SECOES.findIndex((s) => s.id === "mundo") > SECOES.findIndex((s) => s.id === "vilao"));
t("e antes do que já aconteceu", SECOES.findIndex((s) => s.id === "mundo") < SECOES.findIndex((s) => s.id === "antes"));
t("ela perde para os vetos", secaoPorId("mundo").prio > secaoPorId("naoPode").prio);
t("e para o lugar", secaoPorId("mundo").prio > secaoPorId("onde").prio);
const txt = textoDaPauta(porNaPauta(porNaPauta(null, "onde", "numa praça"), "mundo", l1), { turno: 40 });
t("a seção sai com rótulo", /O MUNDO/.test(txt));
t("e com a linha dentro", txt.includes(l1));

console.log("\n== O PROMPT ==");
t("o prompt existe", COBRADOR_PROMPT.length > 100);
t("manda encenar, não decidir", /encene, não decida/.test(COBRADOR_PROMPT));
t("manda deixar o ato legível", /de que ato veio|Deixe isso legível/.test(COBRADOR_PROMPT));
t("protege o que o mundo paga", /não a transforme em ameaça/.test(COBRADOR_PROMPT));
t("e proíbe inventar cobrança", /Não invente cobranças/.test(COBRADOR_PROMPT));
t("o prompt cabe", COBRADOR_PROMPT.length <= 900, String(COBRADOR_PROMPT.length));
console.log(`      prompt: ${COBRADOR_PROMPT.length} caracteres`);

console.log("\n== NADA QUEBRA COM LIXO ==");
for (const lixo of [undefined, null, 0, "", [], "texto", [null], [{ peso: "x" }], [{ t: NaN, dia: NaN }]]) {
  try { dividasAbertas(lixo, { dia: 10 }); consultarCobrador(lixo, { dia: 10 }); ok++; }
  catch (e) { bad++; console.log("  FALHOU: quebrou com " + JSON.stringify(lixo) + " — " + e.message); }
}
t("registro vazio não cobra nada", consultarCobrador([], { dia: 50 }) === null);
t("campanha recém-começada não cobra", consultarCobrador([linha({ dia: 1 })], { dia: 1 }) === null);

console.log("\n== LIGADO NO TURNO ==");
const fs = await import("node:fs");
const app = fs.readFileSync("../src/App.jsx", "utf8");
t("o App consulta o Cobrador", /consultarCobrador\(registroRef\.current/.test(app));
t("o livro-razão vive num ref", /cobradasRef = useRef/.test(app));
t("e a cadência também", /ultimaCobrancaRef = useRef/.test(app));
t("a dívida só é marcada DEPOIS de a linha entrar na Pauta",
  app.indexOf('porNaPauta(p, "mundo"') < app.indexOf("cobradasRef.current = [...cobradasRef.current"),
  "marcar antes perderia a conta para sempre se ela não coubesse");
t("o registro guarda o contexto DESTE ato", /\.\.\.contextoDesteAto\(\),/.test(app),
  "o contexto da campanha é o que o Aliado lê; numa linha do livro-razão ele mente");
t("e o do Aliado continua sendo o acumulado", /\.\.\.ctxAto,/.test(app),
  "o Aliado pergunta quem você é; o Cobrador, o que você fez naquele dia");
t("a memória curta das formas existe", /formasCobradasRef = useRef/.test(app));
t("e entra no save", /formasCobradas: formasCobradasRef\.current/.test(app));
t("o envelope vai ao canon, não à Pauta", /envelopeDoMundo\(r\)/.test(app) && /notaRef\.current = /.test(app));

/* o pior modo de falhar possível para um sistema cuja promessa é
   LEMBRAR: recarregar e cobrar de novo tudo o que já cobrou */
t("o livro-razão entra no save", /cobradas: cobradasRef\.current/.test(app));
t("e volta ao carregar", /cobradasRef\.current = Array\.isArray\(sv\.cobradas\)/.test(app));
t("a cadência também sobrevive", /ultimaCobranca: ultimaCobrancaRef\.current/.test(app)
  && /ultimaCobrancaRef\.current = Number\.isFinite\(sv\.ultimaCobranca\)/.test(app));
t("e campanha nova começa com o livro limpo", /registroRef\.current = \[\]; cobradasRef\.current = \[\]/.test(app));

console.log("\n== A PORTA ==");
{
  const { montarSystemPrompt, portasAbertas } = await import("../src/prompt.js");
  const pers = { nome: "V", nivel: 5, atributos: {}, vidaMax: 40, manaMax: 20 };
  const monta = (cena) => montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, {}, "", "", "", "", "", "", "", cena);
  t("com cobrança na Pauta, o bloco sobe", monta({ temCobranca: true }).includes("O MUNDO LEMBRA"));
  t("e sem ela, não sobe", !monta({ emCidade: true }).includes("O MUNDO LEMBRA"),
    "o mundo cobra uma vez a cada cinco dias: em quatro turnos de cada cinco o bloco seria regra sobre nada");
  t("a porta existe por nome", portasAbertas({ temCobranca: true }).cobranca === true);
  t("e fecha sem a linha", portasAbertas({ emCidade: true }).cobranca === false);
  t("o App marca o ref quando a linha entra", /cobrouAgoraRef\.current = true/.test(app));
  t("e zera a cada pauta", /cobrouAgoraRef\.current = false/.test(app));
  t("e a cena do prompt lê o ref", /temCobranca: !!cobrouAgoraRef\.current/.test(app));
}

console.log(`\n${ok} passaram · ${bad} falharam`);
process.exit(bad ? 1 : 0);
