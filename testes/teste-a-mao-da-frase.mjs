/* teste-a-mao-da-frase.mjs (15/11/2026, S2 — prosa = bolsa)

   A catraca da mão: o corpus de frases de pegar, vender e dar — com acento e
   sem, PT-BR e PT-PT — e cada uma tem de sair RESOLVIDA PELO SISTEMA (o
   recolhimento certo, a recusa certa, ou a passagem certa quando a coisa
   está na bolsa). 100 %, não «quase». Depois: o veto do NÃO PODE e a fiação
   (o App recolhe pelo caminho do botão e recusa antes do Narrador; o pedido
   do turno põe o veto). */
import fs from "node:fs";
import { aMaoDaFrase, oVetoDaMao, A_MAO_DA_FRASE } from "../src/motor/a-mao-da-frase.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

/* a mesa da sessão de 15/11: o anel na tábua, e mais duas coisas caídas */
const CHAO = [
  { id: "c1", nome: "Anel de Ouro" },
  { id: "c2", nome: "Poção de Cura" },
  { id: "c3", nome: "Espada Curta +1" },
];
const BOLSA = ["Gazua", "Sais de cheiro", "Faca herdada (única lembrança da mãe)"];
const so = (nome) => [CHAO.find((x) => x.nome === nome)];

/* [frase, contexto, esperado] — esperado: { pegar: [ids] } | { recusa: verbo } | { nada: true } */
const CORPUS = [
  /* PEGAR — o mesmo recolhimento do botão */
  ["Apanho o Anel de Ouro da tábua e guardo-o.", { chao: CHAO }, { pegar: ["c1"] }],
  ["apanho o anel de ouro da tabua e guardo-o", { chao: CHAO }, { pegar: ["c1"] }],
  ["Pego o anel.", { chao: CHAO }, { pegar: ["c1"] }],
  ["pego o anel", { chao: CHAO }, { pegar: ["c1"] }],
  ["Guardo a poção de cura na bolsa.", { chao: CHAO }, { pegar: ["c2"] }],
  ["guardo a pocao de cura na bolsa", { chao: CHAO }, { pegar: ["c2"] }],
  ["Recolho a espada curta.", { chao: CHAO }, { pegar: ["c3"] }],
  ["Cato a poção do chão.", { chao: CHAO }, { pegar: ["c2"] }],
  ["Levo a espada e o anel.", { chao: CHAO }, { pegar: ["c1", "c3"] }],
  ["Apanho tudo o que está no chão.", { chao: CHAO }, { pegar: ["c1", "c2", "c3"] }],
  ["Pego tudo.", { chao: CHAO }, { pegar: ["c1", "c2", "c3"] }],
  ["Agarro o anel antes que alguém o veja.", { chao: CHAO }, { pegar: ["c1"] }],
  ["Embolso o Anel de Ouro.", { chao: CHAO }, { pegar: ["c1"] }],
  ["Quero pegar a poção.", { chao: CHAO }, { pegar: ["c2"] }],
  ["Vou apanhar a espada curta +1.", { chao: CHAO }, { pegar: ["c3"] }],
  ["Pego-o.", { chao: so("Anel de Ouro") }, { pegar: ["c1"] }],
  ["Apanho-a e sigo.", { chao: so("Poção de Cura") }, { pegar: ["c2"] }],
  ["Pegamos o anel e saímos.", { chao: CHAO }, { pegar: ["c1"] }],
  ["Recupero a minha espada curta.", { chao: CHAO }, { pegar: ["c3"] }],
  /* pegar o que não está no chão: nada a recolher (e nada inventado) */
  ["Pego o machado.", { chao: CHAO }, { nada: true }],
  ["Pego a estrada para norte.", { chao: CHAO }, { nada: true }],
  /* VENDER — o que não se tem é recusado; o que se tem passa */
  ["Levo o Anel de Ouro ao Martelo Torto e vendo-o.", { chao: [], bolsa: BOLSA }, { recusa: "vender" }],
  ["levo o anel de ouro ao martelo torto e vendo-o", { chao: [], bolsa: BOLSA }, { recusa: "vender" }],
  ["Vendo o anel ao ferreiro.", { chao: CHAO, bolsa: BOLSA }, { recusa: "vender", noChao: true }],
  ["Vendo-lhe a espada.", { chao: [], bolsa: BOLSA }, { recusa: "vender" }],
  ["Quero vender o colar.", { chao: [], bolsa: BOLSA }, { recusa: "vender" }],
  ["Vendo-o.", { chao: [], bolsa: BOLSA }, { recusa: "vender" }],
  ["Vendo a gazua ao receptador.", { chao: [], bolsa: BOLSA }, { nada: true }],
  ["vendo a faca herdada", { chao: [], bolsa: BOLSA }, { nada: true }],
  ["Vendemos as rações que sobram.", { chao: [], bolsa: BOLSA }, { nada: true }],
  ["Estou vendo um homem na esquina.", { chao: [], bolsa: BOLSA }, { nada: true }],
  ["Vendo que ninguém olha, pego o anel.", { chao: CHAO, bolsa: BOLSA }, { pegar: ["c1"] }],
  ["Apanho o anel e vendo-o ao mercador.", { chao: CHAO, bolsa: BOLSA }, { pegar: ["c1"] }],
  /* DAR — idem */
  ["Dou o anel ao Nolan.", { chao: [], bolsa: BOLSA }, { recusa: "dar" }],
  ["Entrego a poção à curandeira.", { chao: [], bolsa: BOLSA }, { recusa: "dar" }],
  ["Ofereço-lhe o amuleto.", { chao: [], bolsa: BOLSA }, { recusa: "dar" }],
  ["ofereco-lhe o amuleto", { chao: [], bolsa: BOLSA }, { recusa: "dar" }],
  ["Dou a espada curta ao Cedric.", { chao: CHAO, bolsa: BOLSA }, { recusa: "dar", noChao: true }],
  ["Entrego a gazua ao Nolan.", { chao: [], bolsa: BOLSA }, { nada: true }],
  ["Dou um passo atrás.", { chao: [], bolsa: BOLSA }, { nada: true }],
  ["Dou uma olhada na sala.", { chao: [], bolsa: BOLSA }, { nada: true }],
  ["Dou 5 moedas ao mendigo.", { chao: [], bolsa: BOLSA }, { nada: true }],
  ["Ofereço ajuda ao velho.", { chao: [], bolsa: BOLSA }, { nada: true }],
];

sec("§1 o corpus: cada frase resolvida pelo sistema");
{
  let certas = 0;
  const erradas = [];
  for (const [frase, ctx, esp] of CORPUS) {
    const r = aMaoDaFrase(frase, ctx);
    let ok;
    if (esp.pegar) ok = J([...r.pegar].sort()) === J([...esp.pegar].sort()) && !r.recusa;
    else if (esp.recusa) ok = !!r.recusa && r.recusa.verbo === esp.recusa && (!esp.noChao || /no chão/.test(r.recusa.linha));
    else ok = !r.pegar.length && !r.recusa;
    if (ok) certas++; else erradas.push(`«${frase}» → ${J(r)}`);
  }
  t(`o corpus tem ≥ 30 frases de pegar, vender e dar (${CORPUS.length})`, CORPUS.length >= 30);
  t(`100 % resolvidas pelo sistema (${certas} de ${CORPUS.length})`, certas === CORPUS.length, erradas.join("\n      "));
}

sec("§2 a linha da recusa é de mundo, em PT-BR");
{
  const r = aMaoDaFrase("Levo o Anel de Ouro ao Martelo Torto e vendo-o.", { chao: [], bolsa: BOLSA });
  t("a recusa diz a coisa pelo nome", r.recusa && /Anel de Ouro/i.test(r.recusa.linha), r.recusa && r.recusa.linha);
  const p = aMaoDaFrase("Dou a poção à curandeira.", { chao: [], bolsa: [] });
  t("o artigo e o acento da coisa", p.recusa && p.recusa.linha.startsWith("🎒 A poção"), p.recusa && p.recusa.linha);
  const c = aMaoDaFrase("Vendo o anel.", { chao: CHAO, bolsa: [] });
  t("com a coisa no chão, a recusa diz onde está", c.recusa && /no chão/.test(c.recusa.linha));
  const PT_PT = /\b(ficas|tens|estás|apanhá-l|connosco|ecrã)\b/;
  const todas = CORPUS.map(([f, ctx]) => aMaoDaFrase(f, ctx)).filter((x) => x.recusa).map((x) => x.recusa.linha);
  t("nenhuma linha de recusa em PT-PT", todas.every((l) => !PT_PT.test(l)), todas.find((l) => PT_PT.test(l)));
  t("o sistema não fala de si na recusa", todas.every((l) => !/\b(sistema|invent[aá]rio|recusad|porta)\b/i.test(l)));
}

sec("§3 o veto do NÃO PODE");
{
  const v = oVetoDaMao(CHAO);
  t("com coisa no chão, o veto diz que nada passa à mão", /nada passa à mão do herói nesta resposta/.test(v) && /Anel de Ouro/.test(v), v);
  t("sem nada no chão, nenhum veto", oVetoDaMao([]) === "" && oVetoDaMao(null) === "");
  t("o veto tem teto de nomes", oVetoDaMao([...CHAO, { id: "c4", nome: "Elmo" }]).includes("…"));
  t("o «+1» e o aposto não vão ao veto", !/\+1/.test(v));
}

sec("§4 lixo não estoura");
{
  t("frase vazia, contexto lixo", J(aMaoDaFrase("", null)) === J({ pegar: [], recusa: null }) && J(aMaoDaFrase(null, 7)) === J({ pegar: [], recusa: null }));
  t("chão com lixo", Array.isArray(aMaoDaFrase("pego tudo", { chao: [null, 3, { nome: "" }, { id: "x", nome: "Anel" }] }).pegar));
  t("a tabela tem os verbos das duas variantes", ["pego", "apanho", "guardo", "recolho", "cato", "levo"].every((v) => A_MAO_DA_FRASE.pegar.includes(v)));
}

sec("§5 a fiação");
{
  t("o App importa a mão da frase", /import \{ aMaoDaFrase \} from "\.\/motor\/a-mao-da-frase\.js"/.test(APP));
  t("o pegar da frase recolhe pelo caminho do botão (recolherDoChao)", /const mao = aMaoDaFrase\([\s\S]{0,400}recolherDoChao\(mao\.pegar\)/.test(APP));
  t("a recusa vai à tela e o turno não parte", /if \(mao\.recusa\) \{[\s\S]{0,200}pushMsgs\(\[\{ autor: "sistema", texto: mao\.recusa\.linha \}\]\)[\s\S]{0,120}return true;/.test(APP));
  t("a mão entra dentro de calou", /calou\("S2 · a mão da frase"/.test(APP));
  /* o veto no pedido do turno (motor/pedido-do-turno.js, comAMao) não se
     prova aqui por texto: a casa proíbe asserção sobre o texto de src/motor/
     (teste-assercoes-de-texto). Prova-se pela chamada (§3) e pelo leitor
     que a catraca de teste-ligacao conta. */
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
