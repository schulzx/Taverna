/* A REORDENAÇÃO NÃO PODE TER PERDIDO NADA.

   Mover texto é a classe de mudança em que o dano é silencioso: o prompt
   continua enorme, o build passa, e um dado que sumiu só aparece quando
   o Narrador esquece o nome de alguém três sessões depois.

   Então: cada pedaço volátil tem de estar no prompt, com o valor certo,
   e cada regra que falava dele tem de continuar lá. */

const S = "../src/";
const { montarSystemPrompt } = await import(S + "prompt.js");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };

const pers = {
  nome: "Brann", conceito: "druida", nivel: 8, raca: "Humano", classe: "Druida",
  subclasse: "Círculo da Lua", profissao: "Herborista",
  atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 },
  vidaMax: 61, manaMax: 48, vida: 44, mana: 20, moedas: 212,
};
const P = montarSystemPrompt(
  "A Maré de Ferro", { genero: "Fantasia medieval", descricao: "Ferro e névoa." }, pers,
  { ume: { tipo: "pessoa", papel: "malteira do porto", local: "Forte Rasa" } },
  { elenco: [], cidades: [], tavernas: [] },
  "MAPA: Forte Rasa (capital), Ponte das Velas",
  "ARCO: a corda se aperta",
  "MISSÃO: achar o irmão de Ume",
  "NPCS: Nicolau, capitão",
  "TEMPO: dia 12, 09:00",
  "DIVINDADE: GD 1, 400 fiéis",
  "o Marcado",
  { emCidade: true }
);

console.log("prompt:", P.length, "caracteres\n");
console.log("1. TODO DADO VOLÁTIL CHEGOU");
t("o tempo", /dia 12, 09:00/.test(P));
t("a ficha (nome)", /Nome: Brann/.test(P));
/* A FICHA NUNCA CARREGOU VIDA ATUAL NEM MOEDAS, e isso é desenho, não
   esquecimento: PV e bolsa de agora vivem no HUD e nos envelopes, e o
   prompt diz explicitamente que valores de gestão são do código. A
   primeira versão desta suíte afirmou o contrário e "passou" por acaso,
   casando o 44 com outro número qualquer do texto. */
t("os máximos, que é o que ela carrega", /PV máx 61/.test(P) && /PM máx 48/.test(P));
t("e nunca a bolsa", !/212/.test(P));
t("a raça e a classe", /Humano/.test(P) && /Druida/.test(P));
t("a subclasse", /Círculo da Lua/.test(P));
t("a profissão", /Herborista/.test(P));
t("o título", /o Marcado/.test(P));
t("o patamar", /PATAMAR DE COMBATE:/.test(P));
t("a divindade", /400 fiéis/.test(P));
t("o arco", /a corda se aperta/.test(P));
t("a missão", /achar o irmão de Ume/.test(P));
t("o mapa", /Ponte das Velas/.test(P));
t("as pessoas", /Nicolau, capitão/.test(P));
t("o cânone", /malteira do porto/.test(P));

console.log("\n2. TODA REGRA QUE FALAVA DELES CONTINUOU");
t("a regra do mapa", /MAPA E FACÇÕES \(mundo persistente/.test(P));
t("a das pessoas", /PESSOAS CONHECIDAS \(registro persistente/.test(P));
t("a do arco", /ESTRUTURA DA HISTÓRIA \(o norte dramático/.test(P));
t("a do patamar", /PATAMAR DE COMBATE DO HERÓI \(a régua/.test(P));
t("a do título", /Use ESSE nome, e nenhum outro/.test(P));
t("a do cânone", /VERDADES IMUTÁVEIS/.test(P));
t("e a ficha de caminho", /FICHA DE CAMINHO/.test(P));

console.log("\n3. O ESTADO ESTÁ NO FIM, E SÓ LÁ");
const i = P.indexOf("ESTADO DESTE TURNO ═");
t("a seção existe", i > 0);
t("e está no último quinto do texto", i > P.length * 0.8);
/* a promessa que o topo faz tem de ser verdade */
t("o topo avisa onde ela está", /está na seção ESTADO DESTE TURNO, no FIM deste texto/.test(P));
t("e diz que o resto é permanente", /Tudo daqui até lá é permanente/.test(P));
/* NENHUM DADO VOLÁTIL PODE TER FICADO PARA TRÁS: um só já corta o
   prefixo, e o ganho inteiro vai junto */
const antes = P.slice(0, i);
t("o tempo não ficou em cima", !/dia 12, 09:00/.test(antes));
t("nem a ficha", !/Brann/.test(antes));
t("nem o mapa", !/Ponte das Velas/.test(antes));
t("nem as pessoas", !/Nicolau, capitão/.test(antes));
/* "ferreira" colide com um EXEMPLO de JSON dentro do próprio prompt: um
   valor de teste que também existe no texto fixo não mede nada. */
t("nem o cânone", !/malteira do porto/.test(antes));
t("nem o título", !/o Marcado/.test(antes));
t("nem a missão", !/achar o irmão de Ume/.test(antes));
t("nem o arco", !/a corda se aperta/.test(antes));

console.log("\n4. O PREFIXO SOBREVIVE ÀS MUDANÇAS DE UM TURNO");
const outro = montarSystemPrompt(
  "A Maré de Ferro", { genero: "Fantasia medieval", descricao: "Ferro e névoa." }, { ...pers, vida: 30, moedas: 100 },
  { ume: { tipo: "pessoa", papel: "malteira do porto", local: "Forte Rasa" }, nova: { tipo: "coisa" } },
  { elenco: [], cidades: [], tavernas: [] },
  "MAPA: Forte Rasa (capital), Ponte das Velas, Monte clara",
  "ARCO: o nó se fecha", "MISSÃO: outra", "NPCS: Nicolau, capitão; Ume",
  "TEMPO: dia 13, 14:00", "DIVINDADE: GD 2, 900 fiéis", "o Marcado", { emCidade: true }
);
let k = 0; while (k < P.length && k < outro.length && P[k] === outro[k]) k++;
const pct = Math.round((k / P.length) * 100);
console.log(`  prefixo comum: ${k} de ${P.length} (${pct}%)`);
/* mudou o dia, a vida, a bolsa, o cânone, o mapa, o arco, a missão, as
   pessoas e a divindade — tudo de uma vez — e o prefixo tem de aguentar */
t("com TUDO mudando, o prefixo passa de 90%", pct >= 90);
t("e o que muda cabe em dois mil caracteres", P.length - k < 2000);

console.log(`\nreordem v9.153: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
