/* teste-prompt.mjs (v9.50) — o prompt nao pode pedir o que ninguem le,
   nem oferecer o que ele mesmo proibe, nem ensinar numero que o codigo calcula.

   Nasceu da faxina: 25 mil tokens saiam em todo turno, e la dentro havia
   duas tabelas de preco diferentes, tres reguas de dificuldade e um paragrafo
   inteiro ensinando o Mestre a rolar o d20 dos inimigos — trabalho que o
   sistema faz sozinho desde que o combate virou codigo.                     */
import fs from "node:fs";
import { montarSystemPrompt } from "../src/prompt.js";
import { TETO_DO_BLOCO, lerLexico, COISAS, SISTEMAS } from "../src/lexico.js";

/* um léxico no TETO de todos os campos: é o pior caso, e o pior caso é o
   que se projeta */
const LEX_CHEIO = lerLexico({
  chamado: Object.fromEntries(COISAS.map((c) => [c.id, "x".repeat(40)])),
  funciona: Object.fromEntries(SISTEMAS.map((x) => [x.id, "y".repeat(200)])),
  povos: Array.from({ length: 8 }, (_, i) => `p${i}` + "p".repeat(38)),
  oficios: Array.from({ length: 16 }, (_, i) => `o${i}` + "o".repeat(38)),
  criaturas: Array.from({ length: 10 }, (_, i) => `c${i}` + "c".repeat(38)),
  naoExiste: Array.from({ length: 6 }, (_, i) => `n${i}` + "n".repeat(38)),
  cidades: Array.from({ length: 8 }, (_, i) => `Cidade${i}`),
  tavernas: Array.from({ length: 4 }, (_, i) => `Sede ${i}`),
  lugares: Array.from({ length: 10 }, (_, i) => ({ tipo: `l${i}` + "l".repeat(30), exemplo: "N" })),
  faccoes: Array.from({ length: 4 }, (_, i) => ({ nome: `F${i}`, quer: "z".repeat(70) })),
  aLei: "L".repeat(200), comoSeFala: "F".repeat(200),
});

const SRC = "../src/";
const fontes = fs.readdirSync(SRC).filter((f) => /\.(js|jsx)$/.test(f));
const codigo = fontes.map((f) => fs.readFileSync(SRC + f, "utf8")).join("\n");

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const pers = {
  nome: "Brann", conceito: "druida", historia: "", nivel: 8, raca: "Humano", classe: "Druida",
  atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 },
  vidaMax: 61, manaMax: 48,
};
const P = montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal");

sec("1. o tamanho — a razao da faxina");
{
  /* v9.56: este numero passou a medir o TETO — o prompt com todas as portas
     da cena abertas, que so acontece quando tudo esta acontecendo de uma vez.
     O que de fato sobe por turno e a linha de baixo, e e ela que importa. */
  /* v9.101: `temMercado` entrou porque a cena comum DE VERDADE o tem — no
     app ele é `!!cidadeAtual`, e a economia mudou de lado nesta versão.
     Medir a cena comum sem ele passaria a medir uma cena que não existe. */
  const cena = montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", { emCidade: true, temMercado: true });
  console.log(`      teto ${P.length} caracteres · cena comum ${cena.length} (~${Math.round(cena.length / 3.6)} tokens)`);
  /* O TETO É O CASO DE TODAS AS PORTAS ABERTAS, e ele subiu na v9.60 porque
     dois sistemas passaram a ocupar o lugar de um: TESTES_PROMPT (1.660)
     virou DESAFIOS_PROMPT + SALVAGUARDAS_PROMPT. Antes disso a margem era de
     catorze caracteres — um teto com catorze de folga não é guarda, é
     tripwire, e qualquer regra nova o derrubaria. Recalibrado para 82 mil,
     que é onde ele volta a significar "alguma coisa cresceu demais".

     O número que de fato custa dinheiro e atenção é o de baixo: o que sobe
     numa cena comum, e ESSE caiu (60.131 → 58.456), porque o bloco das
     salvaguardas só sobe em luta e em masmorra. */
  /* v9.101: O TETO SOBE DE 82 PARA 85 MIL, e é uma decisão, não um
     descuido. O léxico do mundo passou a viajar no prompt: mil e setecentos
     caracteres que dizem que aqui masmorra é um portal, que não existem
     reis, e que o poder se chama outra coisa. Nenhum outro bloco deste
     tamanho muda tanto por caractere — e o "teto" é a soma sintética de
     TODAS as portas abertas ao mesmo tempo, que nenhuma cena real produz
     (não se está em combate, em viagem e acampado no mesmo instante). */
  /* v9.110: ESTE GUARDA SAIU, e não por ter estourado. Ele media a mesma
     coisa que o de 88 mil lá embaixo — a soma sintética de todas as
     portas —, calibrado num dia diferente, e dois guardas sobre o mesmo
     número só garantem que o mais velho quebre primeiro sem que nada
     tenha piorado.

     Além disso a soma virou impossível de propósito: a porta do descanso
     é `!emCombate` e a do combate é `emCombate`. Nenhuma cena abre as
     duas, então o número deixou de descrever qualquer cena.

     O que guarda de verdade é a PIOR CENA REAL, mais abaixo, e ela não
     subiu de teto nesta etapa. */
  {
    const emLuta = montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", { emCombate: true });
    const fora = montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", { emCidade: true });
    t("o ADVERSÁRIO sobe na luta", emLuta.includes("A OPOSIÇÃO TEM VONTADE"));
    t("e não sobe fora dela", !fora.includes("A OPOSIÇÃO TEM VONTADE"));
    t("o DESCANSO sobe fora da luta", fora.includes("DESCANSO (v9.17"));
    t("e não sobe dentro dela", !emLuta.includes("DESCANSO (v9.17"),
      "o código já recusa descansar em combate; a regra tem de morar nos dois lados");
    t("as duas portas se excluem de fato",
      emLuta.includes("A OPOSIÇÃO TEM VONTADE") !== emLuta.includes("DESCANSO (v9.17"));
  }
  t("e a cena comum abaixo de 62 mil — o que de fato sobe por turno", cena.length < 62000);
  /* A MÉTRICA QUE SUBSTITUI "continua encolhendo". Aquela linha media uma
     tendência, e a tendência era boa enquanto o que entrava valia menos que
     o que já estava. Deixou de servir no dia em que entrou algo que vale
     mais. O que precisa de guarda daqui para a frente não é o tamanho do
     prompt: é o CUSTO DESTE RECURSO, que tem orçamento próprio e não pode
     crescer sozinho por mais que o mundo seja rico. */
  {
    const cenaC = { emCidade: true, temMercado: true };
    const semLex = montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", cenaC);
    const comLex = montarSystemPrompt("C", { genero: "Fantasia medieval", lexico: LEX_CHEIO }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", cenaC);
    const custo = comLex.length - semLex.length;
    console.log(`      léxico no pior caso custa ${custo} caracteres (orçamento ${TETO_DO_BLOCO})`);
    t("o léxico nunca custa mais que o orçamento dele, por mais rico que o mundo seja", custo <= TETO_DO_BLOCO);
    /* ---------------- A MÉTRICA QUE IMPORTA (v9.106) ----------------
       O "teto" sempre foi o prompt com TODAS as portas abertas — e esse
       número soma estados que se excluem: não se está em combate E em
       viagem E acampado no mesmo instante. Enquanto o conselho era
       pequeno a soma servia de canária; com dez sistemas ela cresce por
       construção, e responder a cada crescimento movendo o guarda é
       como um guarda deixa de guardar.

       A PIOR CENA REAL é um herói de nível 20 já desperto, com grupo,
       conjurando, numa luta dentro de uma masmorra, com coisa no chão,
       gente em cena, missão aberta e aflição correndo. Ela acontece, e é
       ela que custa dinheiro e atenção. */
    const pers20 = { ...pers, nivel: 20, vidaMax: 200, manaMax: 120 };
    const piorReal = {
      emCombate: true, emMasmorra: true, temChao: true, temGente: true, conjura: true,
      temGrupo: true, aflicao: true, temSintonia: true, temRegraPropria: true, temMissao: true,
      temGatilho: true, temDadiva: true, temEspecializacao: true, despertou: true, invoca: true, temLegado: true,
    };
    const pior = montarSystemPrompt("C", { genero: "Fantasia medieval", lexico: LEX_CHEIO }, pers20, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", piorReal);
    const tetoComLex = montarSystemPrompt("C", { genero: "Fantasia medieval", lexico: LEX_CHEIO }, pers20, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal");
    console.log(`      PIOR CENA REAL: ${pior.length} · soma sintética de todas as portas: ${tetoComLex.length}`);
    t("a PIOR CENA REAL cabe abaixo de 80 mil caracteres", pior.length < 80000);
    /* a soma sintética continua sendo olhada, com folga declarada para os
       quatro sistemas que ainda faltam do conselho (Vilão, Aliado,
       Adversário, Cobrador — uns quinhentos caracteres cada) */
    /* v9.115: DE 88 PARA 90 MIL, e com a razão escrita porque mover um
       guarda em silêncio é pior do que não ter guarda.

       O que entrou foi a porta da RAID — umas setecentas letras que só
       existem enquanto há um chamado em curso. E ela agrava o defeito que
       o comentário de cima já descrevia: esta soma abre TODAS as portas ao
       mesmo tempo, e uma raid não acontece dentro de uma masmorra, nem
       acampado, nem em viagem. A cena que este número descreve era
       impossível antes e ficou mais impossível agora.

       Os dois guardas que medem cena de verdade não se moveram e estão
       verdes: a cena comum em 61.332 (o que de fato custa por turno, e
       subiu 181 letras — a linha do sinal) e a PIOR CENA REAL em 79.609,
       abaixo do teto de 80 mil. Este aqui continua só como tripwire de
       crescimento total. */
    t("e a soma de todas as portas fica abaixo de 90 mil, com folga para o resto do conselho", tetoComLex.length < 90000);
  }

  /* ---------------- O OFÍCIO DA CENA (v9.77) ----------------
     "O narrador ficou muito contido, e fica sempre repetindo coisas."

     A temperatura e a penalidade de frequência atacaram o mecanismo; isto
     ataca o OFÍCIO. E entrou PAGO: as duas contradições que ele custou
     estavam no prompt havia versões, e as duas eram sobre a mesma coisa —
     o prompt mandando a IA fazer o que o sistema já faz, ou o contrário
     do que ele mesmo manda três linhas abaixo. */
  t("o bloco do ofício está no prompt", /O OFÍCIO DA CENA/.test(P));
  t("manda abrir diferente a cada vez", /ABRA DIFERENTE A CADA VEZ/.test(P));
  t("e proíbe reabrir o lugar com a mesma frase", /nem reabra um lugar com a frase de ambiente de antes/.test(P));
  t("troca adjetivo por nome de coisa", /UM DETALHE CONCRETO VALE TRÊS ADJETIVOS/.test(P));
  t("toda pessoa em cena quer alguma coisa", /QUER ALGUMA COISA/.test(P));
  /* o erro de mestre-de-IA mais comum, e o que mais faz a prosa soar
     contida: narrar por dentro do jogador */
  t("proíbe narrar o que o jogador sente ou decide", /NÃO NARRE O QUE EU SINTO NEM O QUE EU DECIDO/.test(P));
  t("e manda cortar antes de explicar", /CORTE ANTES DE EXPLICAR/.test(P));

  /* AS DUAS CONTRADIÇÕES QUE SAÍRAM, e elas são o motivo de o bloco ter
     cabido no orçamento sem crescer nada. */
  t("o prompt não manda mais narrar a viagem inteira", !/NUNCA resolva grandes deslocamentos num pulo/.test(P));
  t("porque a viagem é do sistema desde a v9.56", /viagem:<destino>/.test(P) && /NÃO narre a viagem inteira/.test(P));
  t("e não manda mais oferecer alternativas prontas", !/apresente ganchos concretos/.test(P));
  t("logo acima de proibir exatamente isso", /NUNCA ofereça opções/.test(P));
}

sec("2. todo campo pedido tem quem o leia");
{
  const pedidos = new Set();
  for (const m of P.matchAll(/"([a-z][a-z0-9]*(?:_[a-z0-9]+)+)"/g)) pedidos.add(m[1]);
  const ehLido = (c) => new RegExp(
    `[A-Za-z_$][\\w$]{0,14}\\s*\\.\\s*${c}\\b|\\[\\s*["']${c}["']\\s*\\]|hasOwnProperty\\.call\\([^,]+,\\s*["']${c}["']\\)`
  ).test(codigo);
  const orfaos = [...pedidos].filter((c) => !ehLido(c));
  t(`nenhum campo orfao (achou: ${orfaos.join(", ") || "nenhum"})`, orfaos.length === 0);
  t("e ha campos de verdade sendo checados", pedidos.size >= 10);
}

sec("3. o que o codigo tirou do Mestre nao pode voltar pelo prompt");
{
  /* cada um destes saiu por uma decisao registrada; o prompt nao pode
     reoferece-los sem que alguem lembre por que eles sairam */
  const proibidos = [
    ["condicoes_adicionar", "condicao e do sistema (v9.49)"],
    ["condicoes_remover", "condicao e do sistema (v9.49)"],
    ["rolagens_combate", "o sistema rola o combate (v9.50)"],
    ["grupo_xp", "companheiro ganha XP por codigo"],
    ["efeitos_adicionar", "o buff sai do catalogo da habilidade"],
    ["quest_nova", "missao e do sistema (v9.27)"],
    ["quest_atualizar", "missao e do sistema (v9.27)"],
  ];
  for (const [campo, porque] of proibidos) {
    t(`"${campo}" nao e oferecido — ${porque}`, !P.includes(`"${campo}":`));
  }
}

sec("4. nenhuma regua de numero que o sistema ja calcula");
{
  /* dificuldade: existia uma lista no prompt base, outra na TABELA_TESTES e
     ainda a instrucao de mandar "perfil". So a ultima sobreviveu. */
  t("nao ha tabela de dificuldade em numeros", !/trivial 5, f[áa]cil 10/.test(P));
  t("nao ha dificuldade-base por acao", !/escalar muro liso 12/.test(P));
  /* v9.68: o PERFIL morreu junto com o canal. A IA não escolhe dificuldade
     porque não pede teste nenhum — não há régua nenhuma do lado dela. */
  t("nao ha perfil de dificuldade para a IA escolher", !/"facil"\|"digno"\|"dificil"\|"formidavel"/.test(P));
  t("e o contrato nao tem mais campo de rolagem", !/"rolagem":/.test(P));
  t("tem o campo perigo no lugar", /"perigo": null/.test(P));
  t("e diz que ela NUNCA pede rolagem", /voc[eê] N[AÃ]O pede nenhuma, nunca/i.test(P));

  /* preco: havia DUAS tabelas com numeros diferentes para a mesma coisa */
  t("so uma tabela de precos (a de economia.js)", (P.match(/PRE[ÇC]OS/g) || []).length <= 1);
  t("a tabela velha de raridade sumiu", !/item comum 10-25 moedas/.test(P));

  /* PV de inimigo */
  t("nao ha tabela de PV por ameaca", !/35% do meu PV/.test(P));
  t("mas a ameaca continua sendo pedida", /fraco, comum, competente, elite, lendario/.test(P));

  /* buff */
  t("nao ha teto de bonus ensinado ao Mestre", !/soma \+2 \(N[ÃA]O \+4/.test(P));
}

sec("5. o que o codigo passou a fazer e ele precisa saber");
{
  t("recusa do sistema encerra o assunto", /RECUSADO PELO SISTEMA/.test(P));
  t("lugar nao muda dentro de combate", /DENTRO DE UM COMBATE o lugar não muda/.test(P));
  t("sair de um lugar depende do jogador", /SAIR DE UM LUGAR É UM MOVIMENTO/.test(P));
  t("condicao vem de tres fontes, nenhuma dele", /VOCÊ NÃO APLICA NEM REMOVE CONDIÇÃO/.test(P));
  t("falha critica cobra o corpo pelo sistema", /O PREÇO DE FALHAR/.test(P));
  t("limiar de PV existe e e do sistema", /LIMIAR/.test(P));
  t("equipamento vem do sinal loot", /loot:comum\|incomum\|raro\|epico\|lendario/.test(P));
}

sec("6. o que NAO pode ter sido perdido na faxina");
{
  const essenciais = [
    ["cânone", /CÂNONE/],
    ["tempo é do sistema", /TEMPO É DO SISTEMA/],
    ["coesão de resultado", /COESÃO DE RESULTADO/],
    ["escopo do envelope", /ESCOPO DO ENVELOPE/],
    ["liberdade criativa", /LIBERDADE CRIATIVA/],
    ["personagens sem amarras", /PERSONAGENS SEM AMARRAS/],
    ["diversidade viva", /DIVERSIDADE VIVA/],
    ["blindagem de memória", /BLINDAGEM DE MEMÓRIA/],
    ["intensidade fiel", /INTENSIDADE FIEL/],
    ["abertura no mesmo turno", /ABERTURA NO MESMO TURNO/],
    ["formato JSON", /UM ÚNICO objeto JSON/],
    ["sinais", /SINAIS \(canal barato/],
  ];
  for (const [nome, rx] of essenciais) t(`"${nome}" continua lá`, rx.test(P));
}

console.log(`\nprompt v9.50: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
