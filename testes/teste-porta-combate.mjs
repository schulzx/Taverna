/* A PORTA DO COMBATE E O CANAL DE ROLAGEM MORTO (v9.145)

   Duas coisas que estavam erradas ao mesmo tempo e pelo mesmo motivo: a
   v9.68 fechou o canal em que a IA pedia dado, e ninguém foi atrás do que
   sobrou quando ele fechou.

   Sobrou máquina: quarenta linhas no App penduradas num `if` que nunca
   abria, e dois exports vivos em bestiario.js servindo só a elas.

   Sobrou ensino: a TABELA_TESTES subia no prompt de TODO turno ensinando
   o Narrador a escolher o perfil de um teste — cento e cinquenta linhas
   depois de o mesmo prompt dizer "NÃO EXISTE campo para pedir teste".

   E, de carona, nove linhas que só descrevem envelopes de luta subiam em
   toda cena de taverna.

   O QUE ESTA SUÍTE PROTEGE DE VERDADE não é a economia — é a fronteira.
   O turno mais perigoso do jogo é aquele em que a luta ABRE, porque nele
   ainda não existe envelope nenhum e é quando o Narrador mais inventa
   dano. As regras que governam esse instante têm de estar em TODA cena,
   e não atrás da porta. Se alguém um dia empurrar a COESÃO DE RESULTADO
   para dentro da porta para ganhar mais mil caracteres, é aqui que isso
   trava. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const { montarSystemPrompt } = await import(S + "prompt.js");

const APP = readFileSync("../src/App.jsx", "utf8");
const BEST = readFileSync("../src/bestiario.js", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const pers = { nome: "Brann", conceito: "druida", nivel: 8, raca: "Humano", classe: "Druida", atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 }, vidaMax: 61, manaMax: 48 };
const monta = (cena) => montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", cena);

const TAVERNA = monta({ emCidade: true });
const LUTA = monta({ emCombate: true, emCidade: true });

sec("1. O CANAL MORTO SUMIU DE VEZ");
{
  t("o App não declara mais `rolagemFinal`", !/let rolagemFinal/.test(APP));
  t("e nada mais o menciona como valor", !/rolagemFinal\./.test(APP));
  /* o gesto verdadeiro fica: chegou resposta, a rolagem antiga sai da tela */
  t("mas a tela ainda é limpa a cada resposta", /setRolagem\(null\);/.test(APP));
  t("bestiario.js não exporta mais TABELA_TESTES", !/export const TABELA_TESTES/.test(BEST));
  t("nem avaliarTeste", !/export function avaliarTeste/.test(BEST));
  /* o que SOBREVIVE do módulo: quem pede o perfil hoje é o próprio
     sistema, no canal do Cronista — e esse continua de pé */
  t("dificuldadePorPerfil continua viva", /export function dificuldadePorPerfil/.test(BEST));
  /* 28/10 (T1-A, 9.ª fatia), MUDADA E O MOTIVO: o teste que a concessão grande exige saiu do
     cronistaDoTurno do App para src/motor/cronista-do-turno.js
     (oAceitoDoCronista), e o motor não se lê pelo texto (a catraca de
     teste-assercoes-de-texto): a mesma intenção prova-se jogando a peça
     (jogarOAceito, cronista-bloco.mjs). */
  const { jogarOAceito } = await import("./cronista-bloco.mjs");
  const { dificuldadePorPerfil } = await import("../src/bestiario.js");
  const rolou = (jogarOAceito({ teste_sugerido: { atributo: "Presença", perfil: "formidavel", motivo: "o rei cede" } }, { pers: { nome: "Vera", nivel: 1, classe: "guerreiro", atributos: { presenca: 2 }, grupo: [] } }).efeitos.find((e) => e.tipo === "rolagem") || {}).rolagem || {};
  t("e o App ainda a usa", rolou.atributo === "Presença" && rolou.dificuldade === dificuldadePorPerfil(2, "formidavel") && rolou.origem === "cronista");
}

sec("2. O PROMPT NÃO ENSINA MAIS O QUE ELE PROÍBE");
{
  t("a tabela de perfis saiu do prompt", !/COMO MEDIR UM TESTE/.test(TAVERNA));
  t("e da cena de luta também", !/COMO MEDIR UM TESTE/.test(LUTA));
  /* a proibição continua, e agora sozinha */
  t("a proibição continua de pé", /NÃO EXISTE campo para pedir teste/.test(TAVERNA));
  t("em toda cena", /NÃO EXISTE campo para pedir teste/.test(LUTA));
}

sec("3. O QUE SÓ EXISTE DENTRO DA LUTA FICA DENTRO DA LUTA");
const SO_NA_LUTA = [
  ["ATAQUES MÚLTIPLOS DO HERÓI", /ATAQUES MÚLTIPLOS DO HERÓI/],
  ["COMBATE RESOLVIDO PELO SISTEMA", /- COMBATE RESOLVIDO PELO SISTEMA/],
  ["INTENSIDADE FIEL", /INTENSIDADE FIEL/],
  ["AÇÃO DE TURNO DO HERÓI", /AÇÃO DE TURNO DO HERÓI/],
  ["narrativa curta em combate", /mantenha a narrativa CURTA/],
  ["competência implícita do inimigo", /competência implícita/],
  /* E4 (12/10), MOVIDAS: "DANO DE GOLPE NÃO PASSA POR VOCÊ" e o "Use
     combate_atualizar" eram licenças de canal (o dano "que nenhum ataque
     causou", a ameaça e o encerrar pelo Narrador) — 0 usos em 209 respostas
     das sessões 6–8. Saíram da luta e de toda cena; a prova de que saíram,
     e de quem decide agora, está em teste-narrador-so-narra-e4. */
  ["ECONOMIA DE TURNO DO JOGADOR", /ECONOMIA DE TURNO DO JOGADOR/],
];
for (const [nome, rx] of SO_NA_LUTA) {
  t(`"${nome}" fora da taverna`, !rx.test(TAVERNA));
  t(`"${nome}" dentro da luta`, rx.test(LUTA));
}
for (const [nome, rx] of [["DANO DE GOLPE NÃO PASSA POR VOCÊ", /DANO DE GOLPE NÃO PASSA POR VOCÊ/], ["combate_atualizar", /combate_atualizar/]]) {
  t(`"${nome}" saiu de toda cena (E4)`, !rx.test(TAVERNA) && !rx.test(LUTA));
}

sec("4. A FRONTEIRA — o que governa o INSTANTE em que a luta abre");
{
  /* Estas não podem entrar na porta NUNCA. No turno em que a luta abre, o
     Narrador ainda não recebeu envelope de combate nenhum: se as regras
     que impedem o dano inventado estiverem atrás da porta, elas chegam um
     turno tarde demais — no único turno em que fazem falta. */
  /* E4 (12/10), MOVIDAS: a ABERTURA NO MESMO TURNO, o "como abrir o
     combate" (combate_iniciar), o dano anterior à abertura e o BESTIÁRIO
     ensinavam o Narrador a abrir a luta. Desde a E4 quem a abre é o sistema
     (o golpe do jogador, a sala, a estrada, a lei) e a guarda
     agressao.js#podarONarrador tira da resposta o que lá venha. O que esta
     secção protegia — nenhuma regra do instante da abertura atrás da porta —
     continua: as que ficam estão sempre, e as que saíram não estão em lado
     nenhum (nem a meio: atrás da porta seria o pior). */
  const SEMPRE = [
    ["COESÃO DE RESULTADO", /COESÃO DE RESULTADO/],
    ["o patamar de combate", /PATAMAR DE COMBATE DO HERÓI/],
  ];
  for (const [nome, rx] of SEMPRE) {
    t(`"${nome}" na taverna`, rx.test(TAVERNA));
    t(`"${nome}" na luta`, rx.test(LUTA));
  }
  const SAIRAM = [
    ["ABERTURA NO MESMO TURNO", /ABERTURA NO MESMO TURNO/],
    ["como abrir o combate", /combate_iniciar/],
    ["o dano anterior à abertura", /dano legítimo ocorreu antes da abertura/],
    ["o bestiário sugerido", /BESTIÁRIO \(prefira estas criaturas/],
  ];
  for (const [nome, rx] of SAIRAM) t(`"${nome}" saiu da taverna e da luta (E4)`, !rx.test(TAVERNA) && !rx.test(LUTA));
}

sec("5. E O CORTE FOI PARA ALGUM LUGAR");
{
  /* ESTA LINHA MUDOU NA v9.153, e o motivo vale mais do que o número.
     Ela dizia "abaixo de 55k" e passou a falhar quando a reordenação
     acrescentou 846 caracteres — o cabeçalho da seção ESTADO DESTE TURNO
     e as frases que apontam para ela.

     O prompt cresceu e ficou OITO VEZES mais barato, porque o que se
     paga não é o tamanho: é a parte que muda. Com o estado no fim, 98%
     do texto vira prefixo relido, e prefixo relido custa um décimo.

     Então o teto continua, para o texto não engordar sem ninguém ver —
     mas quem mede o que importa agora é `teste-reordem.mjs`, e é lá que
     um retrocesso de verdade aparece. */
  t("a cena comum segue abaixo de 57k", TAVERNA.length < 57000);
  t("e a luta continua maior que ela", LUTA.length > TAVERNA.length);
  /* a diferença entre as duas é exatamente o que a porta segura */
  t("a porta do combate vale mais de 3k", LUTA.length - TAVERNA.length > 3000);
}

console.log(`\nporta do combate v9.145: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
