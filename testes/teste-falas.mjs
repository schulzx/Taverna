/* O INTÉRPRETE GANHA BOCA (v9.135)

   O `interprete.js` decidia o que uma pessoa FAZ e parava ali — o cabeçalho
   dele dizia que a fala era do Narrador, "sempre". Esta versão move a linha,
   e move por um motivo MEDIDO contra a API real:

     campo obrigatório preenchido, chamada única (58k) ..... 1 de 6
     campo obrigatório preenchido, chamada do ator (1,7k) .. 6 de 6

   O que esta suíte defende:

   · que o ator seja SÓ uma boca — sem decidir mundo, sem mover ninguém;
   · que o veto por pessoa chegue à fala, que é o único ganho real da versão
     (o de orçamento era 4,8% e foi revertido);
   · e que falhar não custe o turno: ator mudo devolve cena, não erro. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const semCom = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semCom(readFileSync("../src/App.jsx", "utf8"));
const F = await import(S + "falas.js");
const I = await import(S + "interprete.js");
const { SECOES } = await import(S + "pauta.js");

let bons = 0, maus = 0;
const t = (nome, cond) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const FINA = { nome: "Fina Da Rede", papel: "taverneira", temperamento: "reservada, desconfiada", vontade: "que ninguém traga encrenca para dentro" };

sec("1. O DOSSIÊ É TUDO O QUE O ATOR SABE");
{
  const d = F.dossieDe(FINA, { faz: "enche o caneco de alguém", gesto: "servir", proibidos: ["entrega", "aproxima"], acao: "Quem viu Ione?", outros: ["Torvald"], lugar: "A Caneca Torta" });
  t("o dossiê nasce", !!d && d.nome === "Fina Da Rede");
  t("carrega o que ela quer", d.quer.includes("encrenca"));
  t("e o que o sistema decidiu que ela faz", d.faz.includes("caneco"));
  t("e os vetos dela", d.proibidos.includes("entrega"));
  /* o que ele NÃO sabe é o que o impede de decidir o mundo */
  t("sem nome, não há dossiê", F.dossieDe({}, {}) === null);
  const p = F.promptDoAtor(d);
  t("o veto vira português, não vocabulário interno", /não entrega o que sabe/.test(p) && !/\bentrega\b(?!\s)/.test(p.split("NUNCA FAZ")[0]));
  t("o gesto decidido entra como limite da fala", /A sua fala tem de caber nisso/.test(p));
  t("e ele é avisado de que é só a boca", /VOCÊ É SÓ A BOCA/.test(p) && /não decide o que existe no mundo/.test(p));
  t("o prompt do ator é pequeno", p.length < 1400);
  /* o número que a sonda mediu: 1,7k contra 58k */
  t("muito menor que o do Narrador", p.length < 58000 / 20);
}

sec("2. A CATRACA DA FALA");
{
  t("fala vazia não vira fala", F.garantirFala("") === "" && F.garantirFala(null) === "" && F.garantirFala("  ") === "");
  t("aspas de citação saem", F.garantirFala('"Não sei de nada."') === "Não sei de nada.");
  t("quebra de linha vira espaço", F.garantirFala("Não sei\nde nada.") === "Não sei de nada.");
  const longa = "a".repeat(500);
  t("parágrafo é cortado no teto", F.garantirFala(longa).length <= F.TETO_DA_FALA);
  t("e o corte é visível", F.garantirFala(longa).endsWith("…"));
}

sec("3. O ENVELOPE É FATO CONSUMADO");
{
  t("sem falas, sem envelope", F.envelopeDasFalas([]) === "" && F.envelopeDasFalas(null) === "");
  t("fala sem nome não entra", F.envelopeDasFalas([{ fala: "oi" }]) === "");
  const e = F.envelopeDasFalas([{ nome: "Fina", fala: "Aqui não." }, { nome: "Torvald", fala: "Eu vi." }]);
  t("as duas falas entram com as palavras exatas", e.includes('Fina disse: "Aqui não."') && e.includes('Torvald disse: "Eu vi."'));
  t("e o Narrador é proibido de reescrever", /não as reescreva/.test(e));
  t("e de dar fala a quem não falou", /não faça falar quem não está nesta lista/.test(e));
  t("duas bocas por turno, no máximo", F.MAX_BOCAS === 2);
}

sec("4. O INTÉRPRETE ENTREGA O MOVIMENTO, E OS VETOS");
{
  const r = I.paraPauta([FINA, { nome: "Torvald", papel: "carroceiro", temperamento: "falante" }], { sorte: () => 0.4 });
  t("continua devolvendo as linhas de gesto", Array.isArray(r.linhas));
  t("e agora também os movimentos", Array.isArray(r.movimentos));
  t("cada movimento traz a pessoa inteira", r.movimentos.every((m) => m.pessoa && m.nome));
  t("e os vetos daquela pessoa", r.movimentos.every((m) => Array.isArray(m.proibidos)));
  /* o veto sai do acervo que já existia desde a v9.106 */
  t("reservada não entrega e não se aproxima", I.gestosProibidos(FINA).includes("entrega"));
}

sec("5. A PAUTA TEM ONDE PÔR A FALA");
{
  const s = SECOES.find((x) => x.id === "fala");
  t("existe a seção", !!s);
  /* prioridade 2: cortar a fala de quem já falou seria pior do que cortar
     o lugar onde ele falou */
  t("e ela é quase a mais alta", s.prio <= 2);
  t("acima do que cada um FAZ", s.prio < SECOES.find((x) => x.id === "gente").prio);
}

sec("6. LIGADO AO JOGO, E SEM CUSTAR O TURNO");
{
  t("o Intérprete é lido UMA vez por turno", /interpreteRef\.current = interpreteParaPauta\(pessoasDaCena\(\)/.test(APP));
  t("e a Pauta consome o que foi lido", /const r = interpreteRef\.current \|\| interpreteParaPauta/.test(APP));
  t("as bocas são colhidas antes da Pauta", /falasDoTurnoRef\.current = await colherAsFalas\(conteudo\);[\s\S]{0,120}?textoDaPauta\(pautaDoTurno\(\)/.test(APP));
  t("e entram na seção da fala", /porNaPauta\(p, "fala", envelopeDasFalas\(falasDoTurnoRef\.current\)\)/.test(APP));
  /* em paralelo entre si: a fala de uma não depende da outra */
  t("as bocas vão em paralelo", /await Promise\.all\(escolhidos\.map\(async \(m\)/.test(APP));
  t("no modelo barato", /promptDoAtor\(d\)[\s\S]{0,90}?"leve"/.test(APP));
  t("no máximo MAX_BOCAS", /mov\.slice\(0, MAX_BOCAS\)/.test(APP));
  /* envelope do sistema não é frase do jogador: ninguém responde a ele */
  t("não fala em turno de envelope", /trimStart\(\)\.startsWith\("\["\)\) return \[\];/.test(APP));
  t("nem quando não há gente na cena", /if \(!mov\.length\) return \[\];/.test(APP));
  /* falhar não custa o turno */
  t("ator mudo devolve cena, não erro", /catch \{ return null; \}[\s\S]{0,60}?\}\)\);/.test(APP));
  t("e a colheita inteira é protegida", /const colherAsFalas = async \(conteudo\) => \{\s*try \{/.test(APP));
}

sec("7. O PROMPT DO NARRADOR NÃO PERDEU NADA");
{
  /* Eu tinha tirado quatro blocos daqui para o ator. As provas pegaram, e
     tinham razão: "personagens sem amarras" carrega um LIMITE DELIBERADO de
     conteúdo, e amansar/moralizar vale para a narração também. O ganho
     seria de 4,8% — e o argumento desta versão nunca foi orçamento. */
  const P = readFileSync("../src/prompt.js", "utf8");
  for (const bloco of ["PERSONAGENS SEM AMARRAS", "DIVERSIDADE VIVA", "REAÇÕES DE NPCs", "DATAS DE ENCONTRO"]) {
    t(`"${bloco.toLowerCase()}" continua com o Narrador`, P.includes(bloco));
  }
  t("o limite deliberado continua escrito", /sem descrição sexual gráfica detalhada/.test(P));
}

console.log(`\nfalas v9.135: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
