/* teste-o-que-a-mescla-guarda.mjs (trilha B · 29/10/2026) — a marca de origem que uma mais pobre apagava

   O mesmo defeito em três sítios, achado pela mão de ebe77a5 (o «dito por
   Brom» que a mescla perdia): uma marca que o sistema escreveu é apagada
   por outra, mais pobre, que chega depois.

   §1  as `notas` (npcs.js#mesclarNPC): a nota nova do Cronista substituía
       inteira a velha, e com ela a culpa que o boato deixou em quem o
       contou («mentiu sobre Clarissa: era isca»), a forma que deixou em
       quem se procurou (BOATO.marcas, o que impede a 2.ª revelação) e o
       dia da morte. A régua mora em NOTAS_DO_SISTEMA.

   Falha antes: no código de ebe77a5, a mescla deixa só a nota nova. */
import { criarNPC, mesclarNPC, NOTAS_DO_SISTEMA, ESTADO_SEM_VOLTA, estadoSemVolta } from "../src/npcs.js";
import { aplicarORegisto } from "../src/motor/aplicar.js";
import { oBoatoDaChegada, FORMAS_DO_BOATO, BOATO } from "../src/boatos.js";
import { O_QUE_O_CRONISTA_PODE } from "../src/motor/cronista.js";
import { oAceitoDoCronista } from "../src/motor/cronista-do-turno.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  const v = typeof cond === "function" ? (() => { try { return !!cond(); } catch { return false; } })() : !!cond;
  if (v) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const Js = JSON.stringify;
const copia = (x) => JSON.parse(Js(x));
const encher = (s, v) => String(s).replace(/\{(\w+)\}/g, (_, k) => v[k]);

/* o mundo do boato, o mesmo de teste-boatos */
const DITO = O_QUE_O_CRONISTA_PODE.fatos.marca("");
const MAPA = { regioes: [{ nome: "Vale", bioma: "floresta", cx: 30, cy: 30 }], cidades: [
  { nome: "Vau Seco", x: 30, y: 30, regiao: "Vale" }, { nome: "Pedra Rasa", x: 40, y: 30, regiao: "Vale" }, { nome: "Monte Alto", x: 70, y: 70, regiao: "Vale" }] };
const BROM = criarNPC("Brom", { papel: "taberneiro", local: "Pedra Rasa", relacao: "neutro", notas: "serve cerveja aguada", conhecidoEm: 1 });
const CLARISSA = criarNPC("Clarissa", { papel: "curandeira", local: "Vau Seco", dito: DITO, conhecidoEm: 2 });
const FALA = [{ autor: "mestre", texto: "Brom limpa o copo devagar.\n— A Clarissa? Vive em Vau Seco, cura febres — diz Brom, sem levantar os olhos." }];
const base = () => ({ npcs: { Brom: copia(BROM), Clarissa: copia(CLARISSA) }, canone: {}, cidadeAtual: "Vau Seco", lugar: null, masmorra: null, mapa: copia(MAPA), dia: 5, mensagens: copia(FALA), heroi: "Aela" });
const sementeQue = (estado, quer) => {
  for (let i = 0; i < 400; i++) { const r = oBoatoDaChegada(estado, null, "s" + i); if (r.nota && quer(r.nota)) return "s" + i; }
  return null;
};

sec("1. as notas: o que o sistema escreveu nelas sobrevive à nota nova");
{
  /* a tabela bate com o que se escreve — sem import entre os dois módulos */
  const V = { nome: "Clarissa", onde: "Vau Seco", para: "Pedra Rasa" };
  const escritas = [];
  for (const porFonte of Object.values(FORMAS_DO_BOATO)) {
    for (const lista of Array.isArray(porFonte) ? [porFonte] : Object.values(porFonte)) {
      for (const f of lista) { escritas.push(encher(f.nota, V)); if (f.deQuem) escritas.push(encher(f.deQuem, V)); }
    }
  }
  /* FALHA NO HEAD DE ANTES: a nota nova substituía tudo */
  const falta = escritas.filter((m) => !mesclarNPC(criarNPC("X", { notas: `prosa velha; ${m}` }), { notas: "prosa nova" }).notas.includes(m));
  t(`cada forma do boato (${escritas.length}, nota e culpa) sobrevive à nota nova`, escritas.length >= 10 && !falta.length, Js(falta));
  t("cada marca de BOATO.marcas também", BOATO.marcas.every((m) => {
    const nota = escritas.find((e) => e.toLowerCase().includes(m.trim().toLowerCase()));
    return nota && mesclarNPC(criarNPC("X", { notas: nota }), { notas: "outra coisa" }).notas.includes(nota);
  }));
  /* a forma da morte é a de motor/combate-do-turno.js e do prelúdio («notas Morreu no dia N — causa.»,
     colada com um espaço); não se lê o texto do motor (teste-assercoes-de-texto §2) */
  const morto = mesclarNPC(criarNPC("Ulf", { status: "morto", notas: "ferreiro teimoso Morreu no dia 7 — golpe de machado." }), { notas: "o corpo foi levado ao templo" });
  t("o dia e a causa da morte ficam, colados à nota nova", morto.notas === "o corpo foi levado ao templo; Morreu no dia 7 — golpe de machado.", morto.notas);

  /* a prosa continua a ser trocada */
  t("a prosa velha sai, como sempre (a nota nova é a descrição de agora)", mesclarNPC(criarNPC("X", { notas: "prosa velha; mentiu sobre Clarissa: era isca" }), { notas: "prosa nova" }).notas === "prosa nova; mentiu sobre Clarissa: era isca");
  const semMarca = mesclarNPC(criarNPC("X", { notas: "prosa velha; e mais prosa" }), { notas: "prosa nova" });
  t("a ficha sem marca sai byte a byte como saía", semMarca.notas === "prosa nova", semMarca.notas);
  t("a nota nova que já diz a marca não a repete", mesclarNPC(criarNPC("X", { notas: "mentiu sobre Clarissa: era isca" }), { notas: "Mentiu sobre Clarissa: era isca, e foge do herói" }).notas === "Mentiu sobre Clarissa: era isca, e foge do herói");
  t("a mesma marca duas vezes fica uma", mesclarNPC(criarNPC("X", { notas: "era medo: ninguém viu; era medo: ninguém viu" }), { notas: "n" }).notas === "n; era medo: ninguém viu");
  t("nota vazia não apaga nada (como antes)", mesclarNPC(criarNPC("X", { notas: "a; visto pelo herói: era verdade" }), { notas: "  " }).notas === "a; visto pelo herói: era verdade");

  /* o teto: das marcas, nunca da nota */
  const muitas = ["Ana", "Bia", "Caio", "Duda", "Edu", "Fia"].map((n) => `mentiu sobre ${n}: era isca`);
  const tetada = mesclarNPC(criarNPC("X", { notas: muitas.join("; ") }), { notas: "nova" }).notas.split(NOTAS_DO_SISTEMA.junta);
  t(`o teto das marcas: ${NOTAS_DO_SISTEMA.teto.marcas}, as mais recentes (o boato junta no fim)`,
    tetada.length === NOTAS_DO_SISTEMA.teto.marcas + 1 && tetada[0] === "nova" && Js(tetada.slice(1)) === Js(muitas.slice(-NOTAS_DO_SISTEMA.teto.marcas)), Js(tetada));
  const longa = "x".repeat(NOTAS_DO_SISTEMA.teto.letras);
  const comLonga = mesclarNPC(criarNPC("X", { notas: `era isca: ${longa}; mentiu sobre Ana: era isca` }), { notas: "nova" }).notas;
  t(`o teto das letras (${NOTAS_DO_SISTEMA.teto.letras}): a marca que não cabe sai, a recente fica`, comLonga === "nova; mentiu sobre Ana: era isca", comLonga);
  const notaLonga = "y".repeat(900);
  t("a nota nova nunca se corta", mesclarNPC(criarNPC("X", { notas: "era medo: ninguém viu" }), { notas: notaLonga }).notas === `${notaLonga}; era medo: ninguém viu`);

  /* lixo e imutabilidade */
  t("notas velhas que não são texto: fica a nova", mesclarNPC({ ...criarNPC("X"), notas: { a: 1 } }, { notas: "nova" }).notas === "nova");
  t("mescla sobre null não quebra", mesclarNPC(null, { notas: "nova" }).notas === "nova");
  const velho = criarNPC("X", { notas: "a; era isca: alguém quis o herói aqui" });
  const congelado = Js(velho);
  mesclarNPC(velho, { notas: "b" });
  t("não muta o recebido", Js(velho) === congelado);

  /* ponta a ponta: o boato revela-se, e o Cronista escreve no turno seguinte */
  const E0 = base();
  const m = oBoatoDaChegada(E0, null, sementeQue(E0, (n) => n.forma === "isca"));
  t("(o boato deixou a culpa no Brom)", m.estado.npcs.Brom.notas === "serve cerveja aguada; mentiu sobre Clarissa: era isca", m.estado.npcs.Brom.notas);
  let E = { ...m.estado, personagem: { nome: "Aela" }, npcTurno: 6 };
  const aplicar = (efs) => { for (const ef of efs) if (ef.tipo === "npcs") E = { ...E, npcs: ef.npcs }; };
  const PES = [{ nome: "Brom", notas: "evita o olhar do herói" }];
  oAceitoDoCronista({ pessoas: PES }, [], { pessoas: PES }, {
    ler: () => E, aplicar, pers: E.personagem, narrativa: "Brom evita o olhar.",
    mundoDaBase: () => null, registrarLugar: () => null, contextoDoNome: () => ({}),
  });
  /* FALHA NO HEAD DE ANTES: «evita o olhar do herói», e o Brom deixava de ter mentido */
  t("a nota curta do Cronista não apaga que o Brom mentiu", E.npcs.Brom.notas === "evita o olhar do herói; mentiu sobre Clarissa: era isca", E.npcs.Brom.notas);
  const v = oBoatoDaChegada(E0, null, sementeQue(E0, (n) => n.veredito === "verdade"));
  const depois = mesclarNPC(v.estado.npcs.Clarissa, { notas: "mãos firmes, olhar cansado" });
  /* FALHA NO HEAD DE ANTES: sem a marca nas notas, o `dito` reposto revelava-a outra vez */
  const outraVez = { ...v.estado, npcs: { ...v.estado.npcs, Clarissa: { ...depois, dito: DITO } } };
  t("e a verdade revelada não se revela outra vez depois da nota nova (a marca de BOATO.marcas ficou)",
    depois.notas.includes("visto pelo herói") && oBoatoDaChegada(outraVez, null, "x").linhaDaPauta === "", depois.notas);
}

sec("2. o estado: a porta do cânone não ressuscita ninguém");
{
  const estadoCanone = (canone, npcs) => ({ personagem: { nome: "Ana" }, canone, mapa: { cidades: [], faccoes: [] }, npcs: npcs || {}, npcTurno: 0, espinha: null, abertura: null, lugar: null, missoes: [], dia: 5 });
  /* o homónimo: «Clarissa do Posto Velho» do cânone é a «Clarissa» do registo (id.chave) */
  const CTX = { mundo: null, baseDoNome: { importantes: [{ nome: "Clarissa", onde: "Posto Velho" }], conhecidos: [], recentes: [], grupo: [], aqui: [], heroi: "Ana" } };
  const OUTRA = { narrativa: "x", mudancas: { canone: { Forja: { tipo: "lugar", descricao: "a forja velha" } } } };
  const pela = (status, canone, resp = OUTRA) => {
    const reg = { Clarissa: criarNPC("Clarissa", { papel: "curandeira", status, ultimaVez: 1, conhecidoEm: 2 }) };
    const r = aplicarORegisto(estadoCanone({ ...canone, ...(resp.mudancas.canone || {}) }, reg), resp, CTX);
    return Object.values(r.estado.npcs).find((n) => /^Clarissa/.test(n.nome)) || {};
  };
  const SEM = { "Clarissa do Posto Velho": { tipo: "pessoa", papel: "curandeira" } };
  t("a tabela diz «nunca existiu» como o boato o escreve", ESTADO_SEM_VOLTA.finais.includes(BOATO.nuncaExistiu) && ESTADO_SEM_VOLTA.finais.includes("morto"));
  t("(a porta acha-a pelo homónimo e mescla, não cria outra)", (() => { const r = aplicarORegisto(estadoCanone(SEM, { Clarissa: criarNPC("Clarissa", { papel: "curandeira" }) }), OUTRA, CTX); return Object.keys(r.estado.npcs).length === 1 && !!r.estado.npcs.Clarissa; })());
  /* FALHA NO HEAD DE ANTES: o cânone sem estado mandava «vivo» */
  t("quem o boato revelou como «nunca existiu» não volta a «vivo» pelo cânone que não diz estado", pela(BOATO.nuncaExistiu, SEM).status === BOATO.nuncaExistiu, pela(BOATO.nuncaExistiu, SEM).status);
  t("nem o morto", pela("morto", SEM).status === "morto");
  t("nem a desaparecida (o cânone que cala não diz «vivo»)", pela("desaparecida", SEM).status === "desaparecida");
  const VELHO_VIVO = { "Clarissa do Posto Velho": { tipo: "pessoa", papel: "curandeira", status: "vivo" } };
  /* FALHA NO HEAD DE ANTES: o «vivo» relido de há muitos turnos escrevia-se por cima */
  t("o «vivo» de um cânone antigo, relido, não ressuscita o morto", pela("morto", VELHO_VIVO).status === "morto");
  t("nem o que nunca existiu", pela(BOATO.nuncaExistiu, VELHO_VIVO).status === BOATO.nuncaExistiu);
  const DISSE = { narrativa: "x", mudancas: { canone: { "Clarissa do Posto Velho": { tipo: "pessoa", papel: "curandeira", status: "vivo" } } } };
  t("mas o Narrador que o diz NESTE turno, no cânone que mandou, é ouvido", pela("morto", {}, DISSE).status === "vivo", pela("morto", {}, DISSE).status);
  t("o estado que não é final troca-se pelo que o cânone diz, como antes", pela("desaparecida", { "Clarissa do Posto Velho": { tipo: "pessoa", status: "exilada" } }).status === "exilada");
  t("e caminhar para o final também (o cânone que diz «morto»)", pela("vivo", { "Clarissa do Posto Velho": { tipo: "pessoa", status: "morto" } }).status === "morto");
  const nova = aplicarORegisto(estadoCanone({ Zeferino: { tipo: "pessoa", papel: "moleiro" } }), OUTRA, CTX).estado.npcs.Zeferino;
  t("quem não tem ficha nasce «vivo», como sempre", nova && nova.status === "vivo", Js(nova));
  t("a tabela lê sem acento e sem caixa; lixo não é final", estadoSemVolta("Nunca Existiu") && estadoSemVolta("MORTA") && ![null, 3, {}, "", "vivo"].some((x) => estadoSemVolta(x)));
}

console.log(`\n${ok} ok, ${mal} mal`);
if (mal) process.exit(1);
