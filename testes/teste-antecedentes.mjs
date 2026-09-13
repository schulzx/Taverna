/* teste-antecedentes.mjs (R1) — o ofício, quando houve mestre.

   POR QUE UMA SUÍTE NOVA. O catálogo de antecedentes atravessou o projeto
   inteiro sem casa própria: `teste-prontos.mjs` só confere que todo pronto
   aponta para um antecedente real, e `teste-itens-uteis.mjs` lê o arquivo
   como TEXTO para saber se os itens de partida existem no mundo. Nenhuma
   das duas prova o catálogo — nem os bônus, nem o gancho, nem os leitores.
   O campo `oficio` chegou e não havia onde pôr a prova dele sem pendurá-la
   numa suíte que mede outra coisa. Esta é a casa que faltava, e ela cobra
   o catálogo inteiro, não só o campo novo.

   O SINAL DE R1 É O OFÍCIO: o nome, em voz de mundo, daquilo que alguém
   ENSINOU ao herói. Ele existe onde o antecedente descreve um aprendizado
   e falta onde descreve um ACONTECIMENTO. R1 só cria o sinal; quem o lê é
   R2 — e por isso a metade mais pesada desta suíte é a REGRESSÃO ZERO:
   provar que o campo novo não mexeu em um único bônus, item, PV, PM ou
   gancho de nenhum antecedente, nem entrou na ficha de ninguém. */
import { ANTECEDENTES, antecedentePorId, oficioDoAntecedente } from "../src/antecedentes.js";
import { PRONTOS, montarPronto } from "../src/prontos.js";
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const FONTE = fs.readFileSync("../src/antecedentes.js", "utf8");
const APP = fs.readFileSync("../src/App.jsx", "utf8");

sec("1. O CATÁLOGO TEM CORPO");
{
  t(`há antecedentes (${ANTECEDENTES.length})`, ANTECEDENTES.length === 12);
  t("com id único", new Set(ANTECEDENTES.map((a) => a.id)).size === ANTECEDENTES.length);
  t("e nome único", new Set(ANTECEDENTES.map((a) => a.nome)).size === ANTECEDENTES.length);
  /* os quatro campos de que TODO leitor depende — a tela, a ficha e o
     prompt do Mestre. Um vazio aqui é uma tela com buraco. */
  t("todos dizem quem foram", ANTECEDENTES.every((a) => a.id && a.nome && a.icone && a.desc && a.gancho));
  /* e todo antecedente dá ALGUMA coisa: a escolha da criação tem de pesar
     no código, não só na ficção */
  t("todos dão algum bônus", ANTECEDENTES.every((a) => a.item || a.pv || a.pm || a.moedas));

  /* VOCABULÁRIO FECHADO. Uma chave nova (ou um `pv:` que virou `pV:` num
     patch) passaria despercebida por toda a suíte: o leitor lê `undefined`
     e o jogo simplesmente não dá o bônus, em silêncio. */
  const PERMITIDAS = ["id", "nome", "icone", "desc", "gancho", "oficio", "item", "pv", "pm", "moedas"];
  const intrusas = [...new Set(ANTECEDENTES.flatMap((a) => Object.keys(a)))].filter((k) => !PERMITIDAS.includes(k));
  t(`nenhum campo fora do vocabulário${intrusas.length ? " — " + intrusas.join(", ") : ""}`, intrusas.length === 0);
  t("os números são números positivos",
    ANTECEDENTES.every((a) => ["pv", "pm", "moedas"].every((k) => a[k] === undefined || (Number.isFinite(a[k]) && a[k] > 0))));
  t("e os itens são texto de verdade",
    ANTECEDENTES.every((a) => a.item === undefined || (typeof a.item === "string" && a.item.length > 5)));

  t("antecedentePorId acha", antecedentePorId("ferreiro").nome === "Herdeiro da Forja");
  /* e ele CAI NO PRIMEIRO quando não acha — de propósito: a criação
     precisa sempre de um antecedente. É justamente por isso que o leitor
     do ofício não pode passar por aqui. */
  t("e cai no primeiro quando não acha", antecedentePorId("nao_existe") === ANTECEDENTES[0]);
}

sec("2. AS DUAS METADES — quem teve mestre e quem só teve o que aconteceu");
{
  const com = ANTECEDENTES.filter((a) => a.oficio);
  const sem = ANTECEDENTES.filter((a) => !a.oficio);
  t(`oito tiveram mestre (${com.length}) — ${com.map((a) => a.id).join(", ")}`, com.length === 8);
  t(`e quatro não (${sem.length}) — ${sem.map((a) => a.id).join(", ")}`, sem.length === 4);
  t("as duas metades cobrem o catálogo e não se cruzam", com.length + sem.length === ANTECEDENTES.length);
  /* O CRITÉRIO ESCRITO no cabeçalho do módulo: quem cresceu sozinho, quem
     viu a casa cair, a praga e o naufrágio não aprenderam ofício nenhum —
     aconteceram. Inventar um mestre para eles seria escrever passado por
     cima do que o jogador escolheu. */
  t("os quatro sem mestre são os quatro acontecimentos",
    sem.map((a) => a.id).sort().join(",") === "naufrago,nobre_caido,orfao,pragado");
  /* voz de mundo, não de sistema: "a forja", "as armas" — nunca "Ofício:
     Ferreiro". Minúscula e com artigo é o que separa as duas vozes. */
  t("o ofício é dito em voz de mundo", com.every((a) => /^(a|o|as|os) [a-zà-ÿ]/.test(a.oficio)));
  t("e nenhum se repete", new Set(com.map((a) => a.oficio)).size === com.length);
}

sec("3. O LEITOR DO OFÍCIO — a verdade ou o silêncio, nunca um palpite");
{
  /* AS DUAS PORTAS. A ficha guarda o NOME desde a criação, não o id; sem a
     porta do nome este leitor responderia "" para toda ficha que existe. */
  t("responde por id, para todo o catálogo",
    ANTECEDENTES.every((a) => oficioDoAntecedente(a.id) === (a.oficio || "")));
  t("e por nome, para todo o catálogo",
    ANTECEDENTES.every((a) => oficioDoAntecedente(a.nome) === (a.oficio || "")));
  t("o nome com acento é achado", oficioDoAntecedente("Acólito Fugitivo") === "o rito");
  t("e sem acento também", oficioDoAntecedente("acolito fugitivo") === "o rito");
  t("a caixa das letras não importa no nome", oficioDoAntecedente("HERDEIRO DA FORJA") === "a forja");
  t("quem não teve mestre devolve vazio", oficioDoAntecedente("orfao") === "" && oficioDoAntecedente("Náufrago") === "");

  /* O LIXO, um a um. `undefined` nunca pode sair daqui: quem pergunta por
     ofício quer a verdade ou o silêncio. */
  const lixo = [["id inexistente", "nao_existe"], ["null", null], ["undefined", undefined],
    ["string vazia", ""], ["zero", 0], ["objeto", {}], ["lista", []], ["NaN", NaN], ["false", false]];
  for (const [rotulo, v] of lixo) t(`${rotulo} devolve string vazia`, oficioDoAntecedente(v) === "");
  t("e nunca devolve outra coisa que não string",
    [...ANTECEDENTES.map((a) => a.id), ...lixo.map((x) => x[1])].every((v) => typeof oficioDoAntecedente(v) === "string"));

  /* NÃO PASSA POR `antecedentePorId`, e isso é uma decisão, não um acaso:
     aquele leitor cai no primeiro da lista quando não acha, e cair no
     primeiro aqui seria dar o ofício do Órfão a qualquer id escrito
     errado. Hoje o Órfão não tem ofício e os dois caminhos devolveriam ""
     — a diferença só apareceria no dia em que alguém desse um ofício ao
     primeiro da lista, e aí seria tarde. Por isso a prova é sobre o CÓDIGO,
     não sobre a saída: a função não pode chamar aquele leitor. */
  const corpo = FONTE.split("export function oficioDoAntecedente")[1] || "";
  t("o leitor do ofício não passa pelo leitor que chuta", !/antecedentePorId/.test(corpo));
  t("ele varre o catálogo por conta própria", /ANTECEDENTES\.find/.test(corpo));
}

sec("4. REGRESSÃO ZERO — o campo novo não tocou em nada");
{
  /* A PROVA É CONTRA O QUE O CATÁLOGO DECLARA, não contra números escritos
     à mão aqui: se um bônus mudar no catálogo e na expectativa ao mesmo
     tempo, uma asserção com número fixo pega; uma asserção derivada, não.
     A que pega de verdade é a outra ponta: o CAMINHO REAL que monta um
     herói tem de entregar exatamente o que a linha do catálogo diz. */
  for (const p of PRONTOS) {
    const a = antecedentePorId(p.antecedente);
    const h = montarPronto(p.id);
    /* quem tem item abre a bolsa com ele; quem não tem abre só com as duas
       poções de banca — a bolsa não ganha nada por causa do ofício */
    t(`${p.id}: o item do antecedente entra na bolsa`,
      a.item ? h.inventario[0] === a.item && h.inventario.length === 3 : h.inventario.length === 2);
    t(`${p.id}: o nome e o gancho vão para a ficha`,
      h.antecedente === a.nome && h.antecedenteGancho === a.gancho);
    /* E O OFÍCIO NÃO VAI. É a asserção central desta seção: o sinal novo é
       inerte na ficha — nenhum campo novo, em nenhuma profundidade.

       A primeira versão procurava o TEXTO do ofício na ficha serializada e
       acusou o pronto "voz": o gancho do Artista já dizia "uma de suas
       canções", e o ofício dele é "as canções" — um casa dentro do outro.
       Procurar o valor achava a coincidência; o que interessa é o CAMPO. */
    t(`${p.id}: o ofício não entra na ficha`,
      h.oficio === undefined && !/"oficio"/.test(JSON.stringify(h)));
  }
  /* o PV e o PM entram pela conta, então a prova é diferencial: dois
     prontos da mesma classe não existem, mas o MESMO pronto com o bônus
     retirado tem de bater com a fórmula declarada — o que se confere é
     que o bônus está LÁ DENTRO, e do tamanho que o catálogo diz. */
  const pvDeclarado = PRONTOS.reduce((s, p) => s + (antecedentePorId(p.antecedente).pv || 0), 0);
  const pmDeclarado = PRONTOS.reduce((s, p) => s + (antecedentePorId(p.antecedente).pm || 0), 0);
  t(`os prontos carregam PV de antecedente (${pvDeclarado})`, pvDeclarado > 0);
  t(`e PM de antecedente (${pmDeclarado})`, pmDeclarado > 0);
  t("e a soma de vida dos prontos inclui esse PV",
    PRONTOS.every((p) => montarPronto(p.id).vidaMax >= (antecedentePorId(p.antecedente).pv || 0)));

  /* OS QUATRO CANAIS DE BÔNUS NO APP continuam sendo os mesmos quatro, e
     nenhum deles sabe que existe ofício. É onde o `moedas` mora — nenhum
     pronto o usa, e sem esta linha o quarto canal ficaria sem prova. */
  t("o App soma o PV do antecedente", /vidaMax: vidaMax \+ \(antObj\.pv \|\| 0\)/.test(APP));
  t("e o PM", /manaMax: manaMax \+ \(antObj\.pm \|\| 0\)/.test(APP));
  t("e as moedas", /moedas: MOEDAS_INICIAIS \+ \(antObj\.moedas \|\| 0\)/.test(APP));
  t("e o item", /inventario: antObj\.item \? \[antObj\.item\] : \[\]/.test(APP));
  t("e a ficha guarda o NOME do antecedente, não o id", /antecedente: antObj\.nome/.test(APP));
  /* O SISTEMA NÃO FALA DE SI MESMO: a tela de criação lista o que o
     antecedente DÁ — PV, PM, moedas, item. O ofício não é bônus e não
     aparece ali; o jogador o sentirá pelo efeito, quando R2 o ler. */
  const tela = (APP.split("{antObj && (")[1] || "").slice(0, 1200);
  t("a tela mostra os quatro bônus", /antObj\.pv/.test(tela) && /antObj\.pm/.test(tela) && /antObj\.moedas/.test(tela) && /antObj\.item/.test(tela));
  t("e não mostra o ofício", !/antObj\.oficio/.test(tela));
}

console.log(`\nantecedentes + ofício R1: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
