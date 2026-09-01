/* OS DEFEITOS QUE SÓ A PARTIDA MOSTROU (v9.113).

   Cinco bugs achados jogando o jogo real, com a IA narrando. Nenhum
   deles teria falhado um teste unitário das dez etapas — todos passavam
   verdes enquanto o jogo fazia a coisa errada na tela.

   O que eles têm em comum vale mais que a lista: os cinco são casos em
   que uma peça funciona sozinha e falha LIGADA — o pedido cresceu e
   estourou o teto, o léxico não chegou num consumidor, a regex mordeu
   uma palavra maior, o nome veio em caixa baixa, o classificador não
   conhecia o vocabulário do mundo. */
import { lexicoDoTexto, lerLexico, garantirLexico, menteDoBicho, MENTES, pedidoDoLexico, nomesDaForma } from "../src/lexico.js";
import { menteDaCriatura, intencaoDaVez } from "../src/adversario.js";
import { DESAFIOS } from "../src/desafios.js";
import { gerarLoot } from "../src/loot.js";
import { ofertasDaqui } from "../src/ofertas.js";
import fs from "node:fs";

let ok = 0, bad = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; } else { bad++; console.log("  FALHOU: " + nome + (extra ? " — " + extra : "")); } };

console.log("== 1. O JSON CORTADO NÃO CUSTA MAIS O MUNDO ==");
/* O pedido cresceu com `equipamento` (17 formas) e `racas` (16) e passou
   a 15.371 caracteres; o teto continuou em 3.000. O modelo era cortado no
   meio de `nomes`, o JSON não fechava, e a campanha nascia genérica sem
   ninguém saber por quê. */
{
  const inteiro = {
    chamado: { masmorra: "fenda", taverna: "cantina" },
    funciona: { masmorra: "abre sozinha e não fecha", combate: "faca e cano" },
    povos: ["caçadores", "avaliadores"], oficios: ["guia de travessia", "lacrador"],
    lugares: [{ tipo: "taverna", chamado: "cantina", nomes: ["O Estouro", "A Rede", "Ponto Cego"] }],
    criaturas: [{ ameaca: "fraco", mente: "besta", nomes: ["larva de fenda", "ratero", "cão de piche"] }],
    faccoes: [{ nome: "Associação", quer: "controlar quem entra" }],
    cidades: ["Portão 9", "Setor Vermelho"], tavernas: ["O Estouro"],
    nomes: { masc: ["Rael", "Dario"], fem: ["Vera", "Íris"], sobrenome: ["do Vale", "da Serpente"], cidadeA: ["Setor"], cidadeB: ["Nove"], continente: "a Faixa" },
    aLei: "toda fenda vaza até o núcleo cair",
  };
  const texto = JSON.stringify(inteiro, null, 2);
  t("um JSON inteiro continua sendo lido", !!lexicoDoTexto(texto));

  /* e agora o corte: no meio do campo raiz `nomes`, que foi exatamente
     onde a resposta real caiu. `lastIndexOf` porque há um `nomes` dentro
     de `lugares` e de `criaturas` — o raiz é o último. */
  const corte = texto.slice(0, texto.lastIndexOf('"nomes"') + 60);
  const resgatado = lexicoDoTexto(corte);
  t("um JSON cortado é RESGATADO em vez de descartado", !!resgatado,
    "antes valia zero, e a campanha nascia medieval");
  if (resgatado) {
    t("e traz os campos que vieram completos", Object.keys(resgatado).length >= 7, Object.keys(resgatado).join(","));
    const l = lerLexico(resgatado);
    t("e o léxico resgatado VALE", l.gerado);
    t("com o vocabulário dentro", l.chamado.masmorra === "fenda");
    t("e as criaturas dentro", l.criaturas.length === 1);
  }
  /* o campo cortado pela metade não entra pela metade */
  const meio = texto.slice(0, texto.indexOf('"cidades"') + 30);
  const r2 = lexicoDoTexto(meio);
  t("o campo incompleto é descartado inteiro, nunca pela metade",
    !r2 || !("cidades" in r2) || Array.isArray(r2.cidades));
  t("lixo continua sendo lixo", lexicoDoTexto("nada disso é json") === null);
  t("vazio não quebra", lexicoDoTexto("") === null && lexicoDoTexto(null) === null);
}

console.log("\n== 2. O LÉXICO CHEGA ATÉ AS OFERTAS ==");
/* Na primeira cena da partida, num mundo de caçadores modernos, o
   sistema anunciou "Jarl Mata-Lobos tem um trabalho: Tirar Falk de lá —
   primeiro passo: Chegar a Pedra da Serpente". `ofertasDaqui` chamava
   `oQueExisteAqui` com cinco argumentos de sete: `molde` e `lex` ficavam
   de fora. */
{
  const fonte = String(fs.readFileSync("../src/ofertas.js", "utf8"));
  t("ofertasDaqui recebe molde e lex", /ofertasDaqui\(\{[^)]*molde = null, lex = null/.test(fonte));
  t("e os passa a oQueExisteAqui", /oQueExisteAqui\(semente, mapa, cidade, base, genero, molde, lex\)/.test(fonte));
  t("e adiante, a ofertaDePessoa", /ofertaDePessoa\(\{ semente, pessoa: p, aqui, mapa, genero, nivel, molde, lex \}\)/.test(fonte));
  t("quem SUMIU também nasce com nome daqui", /sumido: nomePessoa\(genero, undefined, rnd, lex\)/.test(fonte),
    "era `nomePessoa(genero, undefined, rnd)` e saía \"Tirar Falk de lá\"");
  const app = String(fs.readFileSync("../src/App.jsx", "utf8"));
  t("o trabalho da cena passa o léxico", (app.match(/molde: moldeMundo\(\), lex: \(mundoAtual\(\) \|\| \{\}\)\.lexico,/g) || []).length >= 2,
    "a cena e o mural, os dois");
}

console.log("\n== 3. O PORTÃO NÃO MORDE PALAVRA MAIOR ==");
/* "Subo até a Associação e mostro o crachá" pediu um teste de ESCALADA
   dificuldade 15. `subo (o|a|pel)` casava o "a" de "até". */
{
  const acha = (txt) => DESAFIOS.filter((d) => d.rx && d.rx.test(txt.toLowerCase())).map((d) => d.id);
  const naoPode = [
    ["subo até a Associação e mostro o crachá", "o que abriu esta caçada"],
    ["salto até a porta", ""], ["pulo até o outro lado da rua", ""],
    ["movo até o balcão", ""], ["marcho até o posto", ""], ["escuto até o fim", ""],
    ["empurro onde ela apontou", ""], ["arrasto onde der", ""], ["levanto onde estava sentada", ""],
    ["aguento onde estou", ""], ["suporto onde me puseram", ""], ["furto onde ninguém vê", ""],
  ];
  for (const [frase, nota] of naoPode) t(`não morde: "${frase}"`, acha(frase).length === 0, (acha(frase).join(",") || "") + (nota ? " · " + nota : ""));

  const temQue = [
    ["escalo o muro pelo lado da hera", "escalar"], ["subo a parede usando as frestas", "escalar"],
    ["subo pela corda", "escalar"], ["salto o fosso", "saltar"], ["pulo para o outro lado", "saltar"],
    ["empurro a porta com o ombro", "forcar"], ["arrasto o caixote", "forcar"], ["levanto a viga", "forcar"],
    ["movo a pedra", "forcar"], ["aguento a dor", "aguentar"], ["suporto o peso", "aguentar"],
    ["marcho a noite toda", "aguentar"], ["escuto a conversa do outro lado", "escutar"], ["furto a bolsa dele", "bater_carteira"],
  ];
  for (const [frase, id] of temQue) t(`continua mordendo: "${frase}"`, acha(frase).includes(id), acha(frase).join(",") || "(nenhum)");
}

console.log("\n== 4. O NOME DO ITEM COMEÇA COM MAIÚSCULA ==");
/* A bolsa mostrava "adaga de membrana" ao lado de "Antigo anel de pixel":
   o catálogo da casa é capitalizado, o banco do mundo vem em minúscula. */
{
  const lex = garantirLexico({
    equipamento: Object.fromEntries(["arma_leve_uma", "arma_simples_uma", "arma_simples_dist", "arma_marcial_uma",
      "arma_marcial_duas", "arma_marcial_dist", "foco_uma", "foco_duas", "escudo", "armadura_panos",
      "armadura_leve", "armadura_media", "armadura_pesada", "elmo", "botas", "anel", "amuleto"]
      .map((f) => [f, ["adaga de membrana", "tampa de bueiro", "capacete de riot"]])),
  });
  let baixa = 0, gerados = 0;
  for (let i = 0; i < 300; i++) {
    const it = gerarLoot(["comum", "incomum", "raro"][i % 3], { nivel: 3, lex });
    gerados++;
    if (it.nome && it.nome[0] === it.nome[0].toLowerCase() && it.nome[0] !== it.nome[0].toUpperCase()) baixa++;
  }
  t("nenhum item nasce em caixa baixa", baixa === 0, `${baixa} de ${gerados}`);
  t("e o resto do nome não é mexido", gerarLoot("comum", { tipo: "escudo", lex }).nome.includes("de "),
    "\"tampa de bueiro\" não pode virar \"Tampa De Bueiro\"");
  t("sem léxico, o catálogo continua igual", /^[A-ZÁÉÍÓÚÂÊÔÃÕ]/.test(gerarLoot("comum", { tipo: "arma" }).nome));
}

console.log("\n== 5. A MENTE DA CRIATURA VEM DO MUNDO ==");
/* O bestiário desta campanha era "larva de fenda", "farrapo de névoa",
   "eco de fendido". Nenhum casava com as listas de fantasia, tudo caía
   em "pensa", e uma larva acabava fazendo refém. */
{
  const lex = garantirLexico({
    criaturas: [
      { ameaca: "fraco", mente: "besta", nomes: ["larva de fenda", "ratero faminto", "enxame de brasas"] },
      { ameaca: "competente", mente: "morto", nomes: ["eco de fendido", "sentinela de fenda"] },
      { ameaca: "elite", mente: "pensa", nomes: ["devota de fenda", "manda-chuva de fenda"] },
    ],
  });
  t("a lista de mentes é fechada", MENTES.join(",") === "besta,morto,pensa");
  t("mente inventada não entra", !garantirLexico({ criaturas: [{ ameaca: "fraco", mente: "sonhadora", nomes: ["x", "y", "z"] }] }).criaturas[0].mente);
  t("a larva é bicho", menteDaCriatura("larva de fenda", "", lex) === "besta");
  t("o eco é morto", menteDaCriatura("eco de fendido", "", lex) === "morto");
  t("a devota pensa", menteDaCriatura("devota de fenda", "", lex) === "pensa");
  t("o que o mundo não declarou cai no classificador", menteDaCriatura("triturador de asfalto", "", lex) === "pensa");
  t("sem léxico, o classificador de sempre vale", menteDaCriatura("Lobo Cinzento") === "besta"
    && menteDaCriatura("Esqueleto Guardião") === "morto" && menteDaCriatura("Salteador") === "pensa");
  t("léxico torto não quebra", ["besta", "morto", "pensa"].includes(menteDaCriatura("x", "", { criaturas: "nada" })));

  /* e a mente muda a intenção, que é o motivo de tudo isto */
  const base = { quantos: 3, quantosDoOutroLado: 2, rodada: 2, minhaVida: 0.2, saidas: 2, temRefem: true };
  const daMente = (nome) => {
    const m = menteDaCriatura(nome, "", lex);
    return intencaoDaVez({ ...base, nome, ehBicho: m === "besta", ehMorto: m === "morto", pensa: m === "pensa" }).intencao.id;
  };
  t("o bicho ferido foge", daMente("larva de fenda") === "fugir_ferido");
  t("o morto não para", daMente("eco de fendido") === "nao_para");
  t("quem pensa tenta sair vivo", daMente("devota de fenda") === "sair_vivo");
  t("e as três são diferentes", new Set(["larva de fenda", "eco de fendido", "devota de fenda"].map(daMente)).size === 3,
    "com tudo caindo em \"pensa\", as três davam a mesma coisa");

  t("o pedido ao Mestre traz a mente", /"mente": "<UM de: besta, morto, pensa/.test(pedidoDoLexico({ genero: "Fantasia medieval", descricao: "x" })));
}

console.log(`\n${ok} passaram · ${bad} falharam`);
process.exit(bad ? 1 : 0);
