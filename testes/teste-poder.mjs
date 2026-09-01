/* O PODER — o índice, e as promessas que o pedido fez em cima dele.

   O pedido tem seis afirmações verificáveis, e cada uma vira teste:
   nível 5 em torno de 400–500 · nível 20 em torno de 50 mil · mais ou
   menos que isso conforme status e itens · tudo o que fortalece tem
   número · duas peças da mesma raridade valem diferente · dá para
   escolher menos poder por uma habilidade.

   E depois o que só a varredura pega: se a escala é monótona, se alguma
   parcela domina as outras, e se algum fortalecimento do jogo ficou de
   fora da conta — que é o defeito mais silencioso possível aqui, porque
   um poder que ignora uma fonte mostra um número errado sem errar. */

const S = "../src/";
const P = await import(S + "poder.js");
const { gerarLoot } = await import(S + "loot.js");
const { PODERES } = await import(S + "afixos.js");
const { DADIVAS_EPICAS } = await import(S + "regras.js");

let ok = 0; const falhas = [];
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; return; }
  falhas.push(nome);
  console.log("  ✗ " + nome + (extra ? ` — ${extra}` : ""));
};

const SLOTS = ["arma", "armadura", "elmo", "botas", "anel", "amuleto", "escudo"];
const ABAIXO = { lendario: "epico", epico: "raro", raro: "incomum", incomum: "comum", comum: "comum" };
const raridadeDoNivel = (n) => (n < 4 ? "comum" : n < 8 ? "incomum" : n < 13 ? "raro" : n < 18 ? "epico" : "lendario");

function atributosDe(nivel) {
  const pontos = 9 + 2 * (nivel - 1);
  const chave = Math.min(Math.max(3, 3 + Math.floor(nivel / 3)), 12);
  const resto = Math.max(0, pontos - chave);
  const cada = Math.floor(resto / 5);
  return { destreza: chave, forca: cada, vigor: cada, intelecto: cada, presenca: cada, percepcao: resto - cada * 4 };
}
function ficha(nivel, { raridade = null, pelado = false, dadivas = 0, gd = 0, habs = null } = {}) {
  const eq = {};
  if (!pelado) SLOTS.forEach((s, i) => {
    const r = raridade || raridadeDoNivel(nivel);
    eq[s] = gerarLoot(raridade ? r : (i % 2 === 0 ? r : ABAIXO[r]), { tipo: s, nivel });
  });
  return {
    nome: "H", nivel, atributos: atributosDe(nivel), equipados: eq,
    habilidades: Array.from({ length: habs == null ? Math.max(0, nivel - 1) : habs }, (_, i) => ({ nome: "h" + i })),
    subclasse: nivel >= 3 ? "Batedora" : "", especializacao: nivel >= 6 ? "Caçadora" : "",
    dadivas: Array.from({ length: dadivas }, (_, i) => "d" + i), gd, grupo: [],
  };
}

/* ---------------- OS ÂNCORAS DO PEDIDO ----------------
   São a régua, e por isso são teste e não comentário: qualquer mexida
   num peso que os quebre tem de aparecer aqui, não numa partida. */
{
  const a5 = P.poderDe(ficha(5)).total;
  const a20 = P.poderDe(ficha(20)).total;
  t("um nível 5 típico fica na ordem de 400 a 500", a5 >= 350 && a5 <= 600, String(a5));
  t("um nível 20 típico fica na ordem de 50 mil", a20 >= 38000 && a20 <= 62000, String(a20));
  /* e a distância entre os dois é de CEM VEZES, que é o que faz a escala
     ser exponencial em vez de decorativa */
  t("e o 20 vale ao menos oitenta vezes o 5", a20 / a5 >= 80, `${Math.round(a20 / a5)}×`);
}

/* ---------------- 'PODENDO SER MENOS QUE ISSO OU BEM MAIS' ---------------- */
for (const n of [5, 12, 20]) {
  const pelado = P.poderDe(ficha(n, { pelado: true, habs: 0 })).total;
  const otimo = P.poderDe(ficha(n, { raridade: "lendario", dadivas: 3 })).total;
  t(`no nível ${n} o equipamento abre uma faixa de ao menos 2,5×`, otimo / pelado >= 2.5,
    `${(otimo / pelado).toFixed(1)}× (${pelado} a ${otimo})`);
  /* e não uma faixa absurda: se o corpo valesse dez vezes o nível, o
     nível deixaria de significar alguma coisa */
  t(`e no nível ${n} ela não passa de 6×`, otimo / pelado <= 6, `${(otimo / pelado).toFixed(1)}×`);
}

/* ---------------- A ESCALA É MONÓTONA ----------------
   Nada pode fazer o poder DESCER: nem subir de nível, nem equipar uma
   peça melhor, nem aprender uma habilidade. */
{
  let sobe = true, onde = "";
  for (let n = 1; n < 30; n++) {
    if (P.baseDoNivel(n + 1) <= P.baseDoNivel(n)) { sobe = false; onde = `nível ${n}`; }
  }
  t("subir de nível nunca baixa o poder", sobe, onde);
  const base = ficha(10, { pelado: true });
  let cresce = true, quebrou = "";
  let ant = P.poderDe(base).total;
  for (const r of ["comum", "incomum", "raro", "epico", "lendario"]) {
    const p = P.poderDe(ficha(10, { raridade: r })).total;
    if (p <= ant) { cresce = false; quebrou = r; }
    ant = p;
  }
  t("cada degrau de raridade vale mais que o anterior", cresce, quebrou);
}

/* ---------------- TUDO O QUE FORTALECE TEM NÚMERO ----------------
   É o coração do pedido, e o defeito que ele evita é o mais silencioso
   possível: um fortalecimento fora da conta mostra um número errado sem
   errar. Então varre-se o jogo inteiro atrás de efeito sem peso. */
{
  const semPeso = new Set();
  const conhece = (k) => k === "criticoEm" || P.PESOS[k] != null;
  for (const p of PODERES) for (const k of Object.keys((p && p.efeito) || {})) if (!conhece(k)) semPeso.add(`afixo:${k}`);
  for (const d of DADIVAS_EPICAS) for (const k of Object.keys((d && d.efeito) || {})) if (!conhece(k)) semPeso.add(`dádiva:${k}`);
  /* e o que os itens gerados de fato carregam em `atributos` */
  for (let i = 0; i < 200; i++) {
    const it = gerarLoot(["comum", "incomum", "raro", "epico", "lendario"][i % 5], { nivel: 1 + (i % 20) });
    for (const k of Object.keys(it.atributos || {})) if (!conhece(k)) semPeso.add(`item:${k}`);
  }
  t("nenhum efeito do jogo ficou sem peso no índice", semPeso.size === 0, [...semPeso].join(", "));
}

/* e a tabela não tem peso para o que não existe: peso sobrando é peso
   que ninguém mantém, e ele mente na primeira vez que alguém o lê */
{
  const usados = new Set();
  for (const p of PODERES) for (const k of Object.keys((p && p.efeito) || {})) usados.add(k);
  for (const d of DADIVAS_EPICAS) for (const k of Object.keys((d && d.efeito) || {})) usados.add(k);
  for (let i = 0; i < 200; i++) {
    const it = gerarLoot(["comum", "raro", "lendario"][i % 3], { nivel: 1 + (i % 20) });
    for (const k of Object.keys(it.atributos || {})) usados.add(k);
  }
  const sobrando = Object.keys(P.PESOS).filter((k) => !usados.has(k));
  t("e nenhum peso sobra na tabela", sobrando.length === 0, sobrando.join(", "));
}

/* ---------------- O ITEM ---------------- */
{
  for (const r of ["raro", "epico", "lendario"]) {
    const idx = Array.from({ length: 12 }, () => P.poderDoItem(gerarLoot(r, { nivel: 12 })));
    t(`duas peças ${r} valem diferente`, new Set(idx).size >= 5, `${new Set(idx).size} distintos de 12`);
  }
  /* mas a raridade continua mandando: o pior lendário vale mais que o
     melhor comum, senão a raridade deixa de querer dizer alguma coisa */
  const piorLendario = Math.min(...Array.from({ length: 20 }, () => P.poderDoItem(gerarLoot("lendario", { nivel: 12 }))));
  const melhorComum = Math.max(...Array.from({ length: 20 }, () => P.poderDoItem(gerarLoot("comum", { nivel: 12 }))));
  t("o pior lendário ainda vale mais que o melhor comum", piorLendario > melhorComum, `${piorLendario} vs ${melhorComum}`);

  /* o item vale MAIS em pontos para quem é mais forte — é o que faz
     "+240" e "+3.100" quererem dizer a mesma coisa em dois momentos */
  const it = gerarLoot("raro", { tipo: "arma", nivel: 10 });
  t("a mesma peça rende mais pontos a quem é de nível maior",
    P.pontosDoItem(it, { nivel: 20 }) > P.pontosDoItem(it, { nivel: 5 }) * 10);
  t("item nulo não explode", P.poderDoItem(null) === 0 && P.pontosDoItem(null, { nivel: 5 }) === 0);
}

/* ---------------- A ESCOLHA QUE O PEDIDO QUER ----------------
   "escolher um equipamento que tem menos poder para usar uma habilidade
   específica que aquele equipamento dá". Isso só existe se o situacional
   pesar pouco perto do numérico. */
{
  const bruta = { tipo: "arma", raridade: "raro", atributos: { dano: 6, forca: 3 }, poderes: [] };
  const util = { tipo: "arma", raridade: "raro", atributos: { dano: 2 }, poderes: [{ efeito: { imunidades: ["envenenado", "atordoado"], resist: "fogo" } }] };
  t("a peça de utilidade custa poder", P.poderDoItem(util) < P.poderDoItem(bruta),
    `${P.poderDoItem(util)} vs ${P.poderDoItem(bruta)}`);
  /* e custa POUCO o bastante para a escolha ser difícil em vez de óbvia */
  const custo = 1 - P.poderDoItem(util) / P.poderDoItem(bruta);
  t("mas custa entre 10% e 60% — a escolha é difícil, não óbvia", custo >= 0.10 && custo <= 0.60, `${Math.round(custo * 100)}%`);
  /* uma imunidade nunca pode valer mais que um ataque extra */
  t("o situacional nunca supera o numérico", P.PESOS.imunidades * 3 < P.PESOS.ataqueExtra,
    `3 imunidades = ${P.PESOS.imunidades * 3}, ataque extra = ${P.PESOS.ataqueExtra}`);
}

/* ---------------- A TROCA ---------------- */
{
  const h = ficha(12);
  const melhor = { tipo: "arma", raridade: "lendario", atributos: { dano: 9, forca: 4, destreza: 4 }, poderes: [] };
  const pior = { tipo: "arma", raridade: "comum", atributos: { dano: 1 }, poderes: [] };
  t("trocar por algo melhor dá delta positivo", P.trocaDeItem(melhor, h).delta > 0);
  t("trocar por algo pior dá delta negativo", P.trocaDeItem(pior, h).delta < 0);
  t("e a troca diz qual espaço mexe", P.trocaDeItem(melhor, h).slot === "arma");
  t("com o espaço vazio, a troca é o item inteiro",
    P.trocaDeItem(melhor, { nivel: 12, equipados: {} }).delta === P.pontosDoItem(melhor, { nivel: 12 }));
}

/* ---------------- AS PARCELAS APARECEM ----------------
   O pedido é explícito em que isso tem de ser VISÍVEL. Um total sem as
   parcelas é um número mágico. */
{
  const p = P.poderDe(ficha(15, { dadivas: 2 }));
  t("o poder vem com a conta aberta", Array.isArray(p.partes) && p.partes.length === P.PARCELAS.length);
  t("cada parcela tem rótulo em português", p.partes.every((x) => x.rotulo && !/[_A-Z]/.test(x.rotulo[0])));
  t("cada parcela traz fração e pontos", p.partes.every((x) => typeof x.fracao === "number" && typeof x.pontos === "number"));
  t("as parcelas somam o multiplicador",
    Math.abs(p.partes.reduce((s, x) => s + x.fracao, 0) + 1 - p.mult) < 0.01, `${p.mult}`);
  t("a conta em uma linha cita o nível e o total",
    P.contaDoPoder(p).includes("nível 15") && P.contaDoPoder(p).includes(P.formatarPoder(p.total)));
  /* e as seis fontes do jogo estão todas lá */
  const ids = P.PARCELAS.map((x) => x.id).join(",");
  t("as seis fontes de poder estão na lista", ids === "atributos,equipamento,dadivas,habilidades,caminho,divino", ids);
}

/* cada fonte, sozinha, tem de MOVER o número — uma parcela que não move
   é uma linha na tela que mente sobre importar */
{
  const base = ficha(12, { pelado: true, habs: 0 });
  const semCaminho = { ...base, subclasse: "", especializacao: "" };
  const p0 = P.poderDe(semCaminho).total;
  t("atributos movem", P.poderDe({ ...semCaminho, atributos: { destreza: 12, forca: 8, vigor: 8, intelecto: 3, presenca: 3, percepcao: 3 } }).total > p0);
  t("equipamento move", P.poderDe({ ...semCaminho, equipados: { arma: gerarLoot("lendario", { tipo: "arma", nivel: 12 }) } }).total > p0);
  t("dádivas movem", P.poderDe({ ...semCaminho, dadivas: ["a", "b"] }).total > p0);
  t("habilidades movem", P.poderDe({ ...semCaminho, habilidades: [{ nome: "x" }, { nome: "y" }] }).total > p0);
  t("subclasse move", P.poderDe({ ...semCaminho, subclasse: "Batedora" }).total > p0);
  t("especialização move", P.poderDe({ ...semCaminho, especializacao: "Caçadora" }).total > p0);
  t("o grau divino move MUITO", P.poderDe({ ...semCaminho, gd: 2 }).total > p0 * 2.5);
  /* e o divino rompe a escala de propósito: um deus não é um herói com
     mais equipamento, é outra categoria de coisa */
  const melhorMortal = P.poderDe(ficha(12, { raridade: "lendario", dadivas: 4 })).total;
  t("um grau 4 passa do melhor mortal do mesmo nível", P.poderDe({ ...semCaminho, gd: 4 }).total > melhorMortal,
    `${P.poderDe({ ...semCaminho, gd: 4 }).total} vs ${melhorMortal}`);
}

/* ---------------- O GRUPO ---------------- */
{
  const so = ficha(12);
  const comUm = { ...so, grupo: [ficha(12)] };
  const comQuatro = { ...so, grupo: [ficha(12), ficha(12), ficha(12), ficha(12)] };
  const comVinte = { ...so, grupo: Array.from({ length: 20 }, () => ficha(12)) };
  t("o grupo soma", P.poderDoGrupo(comUm).total > P.poderDoGrupo(so).total);
  t("quatro somam mais que um", P.poderDoGrupo(comQuatro).total > P.poderDoGrupo(comUm).total);
  /* O TETO. Quem apanha é o herói: vinte companheiros não fazem o corpo
     dele aguentar o golpe do chefe. */
  t("vinte companheiros são aparados pelo teto", P.poderDoGrupo(comVinte).aparado === true);
  t("e o teto é quatro vezes o herói",
    P.poderDoGrupo(comVinte).total <= P.poderDe(so).total * P.TETO_DO_GRUPO + 1);
  t("um companheiro sozinho NÃO é aparado", P.poderDoGrupo(comUm).aparado === false);
  /* companheiro caído não conta — é a hora em que a leitura mais importa */
  const caido = { ...so, grupo: [{ ...ficha(12), vida: 0 }] };
  t("companheiro caído não soma", P.poderDoGrupo(caido).total === P.poderDoGrupo(so).total);
}

/* ---------------- A LEITURA ---------------- */
{
  t("abaixo de dez mil sai inteiro", P.formatarPoder(4210) === "4.210", P.formatarPoder(4210));
  t("acima sai em mil", /mil/.test(P.formatarPoder(48100)), P.formatarPoder(48100));
  t("e o milhão sai em mi", /mi$/.test(P.formatarPoder(2400000)), P.formatarPoder(2400000));
}

/* ---------------- A CATRACA ---------------- */
{
  t("ficha nula não explode", P.poderDe(null).total > 0);
  t("ficha vazia dá o poder do nível 1", P.poderDe({}).total > 0);
  t("nível absurdo é aparado", P.baseDoNivel(9999) === P.baseDoNivel(60));
  t("nível zero vira um", P.baseDoNivel(0) === P.baseDoNivel(1));
  t("grupo de ficha nula não explode", P.poderDoGrupo(null).total > 0);
  t("conteúdo sem nível ainda tem poder", P.poderDoConteudo({}) > 0);
}

/* ---------------- O QUE SOBE AO NARRADOR ---------------- */
{
  t("o prompt existe", /PORTE/.test(P.PODER_PROMPT));
  t("e proíbe o número", /nunca em número/i.test(P.PODER_PROMPT));
  t("e proíbe pôr na boca de alguém", /ningu[ée]m .*cita [íi]ndice/i.test(P.PODER_PROMPT));
  t("e diz onde o porte aparece", /pessoas FAZEM/.test(P.PODER_PROMPT));
  /* CURTO, e o número é o que o orçamento do prompt permitiu: ele sobe em
     todo turno com gente na cena fora de luta. */
  t("e cabe no orçamento", P.PODER_PROMPT.length < 300, String(P.PODER_PROMPT.length));
}

console.log(`\n${ok} passaram` + (falhas.length ? ` · ${falhas.length} FALHARAM` : " · sem falhas"));
process.exit(falhas.length ? 1 : 0);
