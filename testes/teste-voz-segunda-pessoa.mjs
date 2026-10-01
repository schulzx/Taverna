/* teste-voz-segunda-pessoa.mjs — a narração fala com quem joga, por "você"

   A pessoa, a 30/09 (mente/respondidas.md): "Vamos passar a voz do mestre
   pra segunda pessoa, assim como o Matt." Na prova jogada (MM11, M1) a
   narração saía na primeira pessoa da heroína — "aponta para minha
   trouxa" — e nada no prompt a pedia: ensinava-a a CONVENÇÃO da casa. Todo
   envelope fala como o jogador ao Mestre ("Eu perguntei", "Procurei e
   ACHEI", "ONDE EU ESTOU"), e nada dizia ao Narrador que aquele "eu" é o
   herói e que, na boca dele, vira "você". A abertura pedia a memória "como
   memória minha", e o exemplo da voz Febril dizia "o meu braço".

   A REGRA DOS ENVELOPES, que esta suíte guarda para os que vierem:
     no envelope, "eu" é o jogador falando ao Mestre e "você" é o Narrador
     — por isso ele pode contar na primeira pessoa o que o jogador fez,
     pediu, tem, sabe ou sofreu; mas todo texto que a narração possa copiar
     tal qual (exemplo, frase-modelo, sonho, achado, o pedido da abertura)
     vai na segunda pessoa, porque a narração devolve sempre o "eu" do
     jogador como "você".

   O que se tranca:
     1. o prompt montado — em toda cena, toda voz, e com a mesa de dois —
        diz a pessoa e a ponte, e não pede a primeira a ninguém senão aos
        NPCs; toda citação em primeira pessoa que ele carrega é conhecida
        e tem dono (a lista abaixo é a catraca: uma nova obriga a dizer de
        quem é);
     2. os modos não têm prompt próprio: historia, rapida e duelo leem o
        mesmo, e a sala soma-lhe uma linha — o nome antes do "você";
     3. as vozes: exemplos e instruções sem primeira pessoa fora das falas;
     4. a abertura: o pedido e as tabelas de onde ele sai, em todos os
        mundos, sem primeira pessoa fora das aspas;
     5. os sonhos e o achado vazio: texto que sobe tal qual;
     6. a regra dos envelopes, dos dois lados: os que ficam na primeira
        são falas do jogador, marcadas pelo colchete; e nenhum texto do
        projeto dá ao Narrador uma frase-modelo na primeira pessoa;
     7. o teto: a frase nova pagou-se a si mesma.                          */
import fs from "node:fs";
import { montarSystemPrompt, PORTAS_DA_CENA } from "../src/prompt.js";
import { VOZES, VOZ_PADRAO, vozPrompt } from "../src/vozes.js";
import { SALA_PROMPT } from "../src/sala.js";
import { MODOS } from "../src/modos.js";
import {
  RAZOES_DA_ESTRUTURA, LACOS_DO_ANTECEDENTE, O_QUE_SE_SABE, CHEGADAS, HISTORIA_DO_LUGAR,
  abrirAbertura, pedidoDaAbertura,
} from "../src/abertura.js";
import { SONHOS } from "../src/calendario.js";
import { envelopeSemOportunidade } from "../src/desafios.js";
import { envelopeDoOraculo } from "../src/oraculo.js";
import { notaDaChegada } from "../src/geografia.js";
import { envelopeDoAchado } from "../src/mundo-base.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { ESTRUTURAS } from "../src/historia.js";
import { ANTECEDENTES } from "../src/antecedentes.js";
import { MOLDES } from "../src/moldes.js";
import { generosDisponiveis } from "../src/nomes.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

/* A primeira pessoa, como palavra. "me" e "sei" entram porque são o que a
   narração na primeira produz ("me olha", "não sei"); "nós" e "nosso"
   porque o narrador que se põe na cena com o herói também é primeira. */
/* o \b do JavaScript não conhece letra acentuada ("nós" e "você"
   escapariam dele), por isso a fronteira é escrita à mão, com as classes
   de letra e número do Unicode */
const palavra = (alts) => new RegExp(`(?<![\\p{L}\\p{N}])(${alts})(?![\\p{L}\\p{N}])`, "iu");
const PRIMEIRA = palavra("eu|meu|minha|meus|minhas|mim|comigo|me|estou|sou|sei|cheguei|nós|nosso|nossa|nossos|nossas|conosco");
const SEGUNDA = palavra("você|seu|sua|seus|suas|lhe");
/* o que vai entre aspas é FALA (de NPC, do jogador, ou o anti-exemplo):
   não é a voz da narração, e sai antes de procurar a primeira pessoa */
const semFalas = (s) => String(s || "").replace(/["“«][^"”»]*["”»]/g, " ");
const temPrimeira = (s) => PRIMEIRA.test(semFalas(s));

const pers = {
  nome: "Brann", conceito: "druida", historia: "", nivel: 20, raca: "Humano", classe: "Druida",
  atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 },
  vidaMax: 200, manaMax: 120,
};
const montar = (mundo, cena = null) => montarSystemPrompt("C", { genero: "Fantasia medieval", ...mundo }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", cena);

/* as cenas que se medem: todas as portas (o teto), a comum, a pior real
   e a mesa de dois — cada uma é um prompt que de facto sai */
const CENAS = {
  "todas as portas": null,
  "cena comum": { emCidade: true, temMercado: true },
  "pior cena real": { emCombate: true, emMasmorra: true, temChao: true, temGente: true, conjura: true, temGrupo: true, aflicao: true, temMissao: true, despertou: true },
  "mesa de dois": { emCidade: true, emSala: true },
};

/* A PONTE — a frase que diz a pessoa. Lida por regex e não por igualdade,
   para que a prosa possa ser polida sem que a suíte vire espelho. */
const PONTE = /fala com quem joga na 2ª pessoa: o herói é "você"/;
const VOLTA = /o "eu" do jogador e dos envelopes volta como "você"/;

/* ============================================================ */
sec("1. o prompt diz a pessoa, em toda cena e toda voz");
{
  const falhas = [];
  for (const [nomeCena, cena] of Object.entries(CENAS)) {
    for (const v of VOZES) {
      const P = montar({ voz: v.id }, cena);
      const onde = `${nomeCena}/${v.id}`;
      if (!PONTE.test(P)) falhas.push(`${onde}: sem a ponte`);
      if (!VOLTA.test(P)) falhas.push(`${onde}: sem a volta do "eu"`);
      /* a única primeira pessoa que o prompt pede é a dos NPCs */
      for (const m of P.matchAll(/(1ª|primeira) pessoa/gi)) {
        const antes = P.slice(Math.max(0, m.index - 40), m.index);
        if (!/NPCs? falam? em $/.test(antes)) falhas.push(`${onde}: "${antes}${m[0]}"`);
      }
      if (/narr\w*[^.\n]{0,40}\b(1ª|primeira) pessoa/i.test(P)) falhas.push(`${onde}: manda narrar na primeira`);
    }
  }
  t(`${Object.keys(CENAS).length} cenas × ${VOZES.length} vozes: a ponte está, e a primeira pessoa só é pedida aos NPCs`, falhas.length === 0, falhas.slice(0, 4).join(" | "));

  /* a ponte vem no parágrafo do ofício, antes de qualquer regra: é a
     identidade do Narrador, não uma nota de estilo perdida a meio */
  const P = montar({});
  const iPonte = P.search(PONTE), iEstado = P.indexOf("=== COMO ESTE MUNDO FUNCIONA");
  t("a ponte está no parágrafo do ofício, antes das regras", iPonte > 0 && iEstado > 0 && iPonte < iEstado);
  t("com o exemplo do erro que a prova jogada viu", /"a guarda aponta para a sua trouxa", nunca "minha"/.test(P));

  /* A CATRACA DAS CITAÇÕES: toda citação do prompt com primeira pessoa é
     conhecida e tem dono. Uma nova não falha por existir — falha por não
     ter sido classificada: quem a escreveu diz aqui de quem é a boca. */
  const DONOS = {
    "minha": "o anti-exemplo da própria ponte",
    "eu": "a própria ponte (o \"eu\" do jogador)",
    "lembra-se de quando nós…": "fala de NPC: a memória comum que se proíbe inventar",
    "moro comigo!": "palavras do JOGADOR, que o prompt manda ler como figura",
    "tem um serviço meu pregado lá": "fala de NPC: o morador que menciona o mural",
    "[TURNO AINDA MEU]": "etiqueta do sistema: a vez do jogador",
  };
  const citas = new Set();
  for (const [, cena] of Object.entries(CENAS)) for (const v of VOZES) {
    const Pv = montar({ voz: v.id }, cena);
    for (const m of Pv.matchAll(/["“]([^"”\n]{1,160})["”]/g)) if (PRIMEIRA.test(m[1])) citas.add(m[1]);
  }
  const semDono = [...citas].filter((c) => !DONOS[c]);
  t(`toda citação em primeira pessoa tem dono (${citas.size} no prompt)`, semDono.length === 0, semDono.join(" | "));
  /* o dono não pode ser a narração: nenhuma das conhecidas é frase-modelo */
  t("e nenhum dono é a narração", Object.values(DONOS).every((d) => !/narra(ção|dor)/i.test(d)));

  /* as regras que já existiam e falam pelo jogador ficaram: são ele a
     falar ao Mestre ("o que eu sinto"), e a ponte é que as traduz */
  t("o \"NÃO NARRE O QUE EU SINTO\" ficou — é o jogador a falar", /NÃO NARRE O QUE EU SINTO NEM O QUE EU DECIDO/.test(P));
  t("e os colchetes continuam meta", /COLCHETES SÃO META/.test(P));
}

/* ============================================================ */
sec("2. os modos não têm prompt próprio; a sala soma uma linha");
{
  t("os três modos existem", ["historia", "rapida", "duelo"].every((id) => MODOS.some((m) => m.id === id)));
  /* modo é lente sobre o mesmo motor (CLAUDE.md): nenhum carrega texto
     para o Narrador, e por isso o prompt de um é o prompt dos três */
  const textoDeModo = MODOS.flatMap((m) => Object.values(m.botoes || {}).filter((x) => typeof x === "string" && x.length > 30));
  t("nenhum modo carrega texto para o Narrador", textoDeModo.length === 0, textoDeModo.join(" | "));
  const fontes = fs.readdirSync("../src").filter((f) => /\.(js|jsx)$/.test(f));
  const quemAbre = fontes.filter((f) => /Você é o NARRADOR/.test(fs.readFileSync("../src/" + f, "utf8")));
  t("um só prompt de Narrador no projeto (prompt.js)", quemAbre.length === 1 && quemAbre[0] === "prompt.js", quemAbre.join(", "));

  t("a porta da sala existe", PORTAS_DA_CENA.some((p) => p.id === "sala"));
  t("com dois heróis, o nome antes do \"você\"", /nome antes do "você": "Lia, você vê…"/i.test(SALA_PROMPT));
  const comSala = montar({}, CENAS["mesa de dois"]), semSala = montar({}, CENAS["cena comum"]);
  t("e a linha sobe só com a mesa de dois", comSala.includes("nome antes do") && !semSala.includes("nome antes do"));
}

/* ============================================================ */
sec("3. as vozes");
{
  const falhas = [];
  for (const v of VOZES) {
    for (const [campo, txt] of [["exemplo", v.exemplo], ["resumo", v.resumo], ["frase", v.frase], ["naoFaz", v.naoFaz], ["graca", v.graca], ...v.faz.map((x, i) => [`faz${i + 1}`, x])]) {
      if (temPrimeira(txt)) falhas.push(`${v.id}.${campo}`);
    }
    const bloco = vozPrompt(v.id);
    if (/(1ª|primeira) pessoa/i.test(bloco)) falhas.push(`${v.id}: o bloco fala de primeira pessoa`);
  }
  t(`as ${VOZES.length} vozes: nenhuma primeira pessoa fora das falas`, falhas.length === 0, falhas.join(", "));
  /* o exemplo é a metade da voz que o modelo copia: o Febril mostrava a
     dor no "meu braço", e passou a mostrá-la no do jogador */
  const febril = VOZES.find((v) => v.id === "febril");
  t("o Febril dói no braço de quem joga", !!febril && /\bo seu braço que dói\b/.test(febril.exemplo));
  t("o Épico mede o lugar contra quem chega, não contra \"nós\"", /antes de você"?$/.test(VOZES.find((v) => v.id === "epico").faz[0]));
  t("a voz padrão continua a existir", VOZES.some((v) => v.id === VOZ_PADRAO));
}

/* ============================================================ */
sec("4. a abertura, em todos os mundos");
{
  /* as tabelas de onde o pedido sai: texto que vai tal qual */
  const tabelas = [
    ...Object.values(RAZOES_DA_ESTRUTURA).flat(),
    ...Object.values(LACOS_DO_ANTECEDENTE).map((l) => l.o),
    ...Object.values(O_QUE_SE_SABE), ...Object.values(CHEGADAS), ...Object.values(HISTORIA_DO_LUGAR),
  ];
  const nasTabelas = tabelas.filter(temPrimeira);
  t(`as ${tabelas.length} linhas das tabelas da abertura falam do herói, nunca por ele`, nasTabelas.length === 0, nasTabelas.join(" | "));

  const falhas = [];
  let n = 0;
  const ests = Object.keys(ESTRUTURAS);
  for (const g of generosDisponiveis()) for (const M of MOLDES) {
    const semente = `Sonda voz|${g}|${M.id}`;
    const mapa = gerarGeografia(semente, M);
    const cidade = mapa.cidades[0].nome;
    ests.forEach((estrutura, i) => {
      const antecedente = ANTECEDENTES[(i + n) % ANTECEDENTES.length].nome;
      const espinha = estenderEspinha({ semente, mapa, genero: g, molde: M, estrutura, cidadeInicial: cidade });
      const r = abrirAbertura({ semente, mapa, cidade, espinha, estrutura, antecedente, genero: g, molde: M, nivel: 1, dia: 1 });
      if (!r) return;
      n++;
      const p = pedidoDaAbertura(r.abertura, { habilidades: ["Golpe"] });
      const onde = `${g}/${M.id}/${estrutura}`;
      if (!/na 2ª pessoa — o herói é "você"/.test(p)) falhas.push(`${onde}: sem a pessoa`);
      if (temPrimeira(p)) falhas.push(`${onde}: primeira pessoa fora das aspas — ${(semFalas(p).match(PRIMEIRA) || [])[0]}`);
    });
  }
  t(`${n} aberturas: o pedido diz a segunda pessoa, e não fala por \"eu\"`, n > 0 && falhas.length === 0, falhas.slice(0, 4).join(" | "));
}

/* ============================================================ */
sec("5. o que sobe tal qual: os sonhos e o achado vazio");
{
  /* o sonho aparece na tela ("💭 …") e vai entre aspas ao Narrador */
  const naPrimeira = SONHOS.filter((s) => PRIMEIRA.test(s.texto));
  t(`os ${SONHOS.length} sonhos sem primeira pessoa`, naPrimeira.length === 0, naPrimeira.map((s) => s.texto).join(" | "));
  t("e todos na segunda", SONHOS.every((s) => SEGUNDA.test(s.texto)));

  const vazio = envelopeSemOportunidade({ rotulo: "procurar" }, "procuro uma passagem");
  const nada = vazio.match(/a resposta foi NÃO\. ([^\n]*?) Não houve rolagem/);
  t("o achado vazio padrão é impessoal", !!nada && !PRIMEIRA.test(nada[1]), nada ? nada[1] : vazio.slice(0, 120));
  const fonte = fs.readFileSync("../src/desafios.js", "utf8");
  const nadas = [...fonte.matchAll(/nada: "([^"]*)"/g)].map((m) => m[1]);
  t(`e os ${nadas.length} vazios do catálogo também`, nadas.length > 0 && nadas.every((x) => !PRIMEIRA.test(x)));
}

/* ============================================================ */
sec("6. a regra dos envelopes, dos dois lados");
{
  /* O LADO QUE FICA: o jogador a falar ao Mestre. Estes três são os da
     ordem de 30/09 e ficam na primeira — o colchete os marca como fala do
     jogador, e a ponte (secção 1) diz ao Narrador que esse "eu" volta como
     "você". */
  const marca = /^\[[A-ZÁÉÍÓÚÂÊÔÃÕÇ ,—-]+\]/;
  const oraculo = envelopeDoOraculo({ pergunta: "a ponte aguenta?", chance: 50, faixa: { rotulo: "meio a meio" }, rolo: 30, sim: true, grau: { rotulo: "sim" }, reusado: false });
  const chegada = notaDaChegada({ nome: "Foz do Meio" }, "Vau");
  const achado = envelopeDoAchado({ o: "um anel de osso", onde: "sob a laje", especie: "coisa" }, {});
  for (const [nome, env] of [["o oráculo (\"Eu perguntei\")", oraculo], ["a chegada (\"AGORA ESTOU\")", chegada], ["o achado (\"Procurei e ACHEI\")", achado]]) {
    t(`${nome}: fica na primeira, marcado pelo colchete`, marca.test(env) && PRIMEIRA.test(env), env.slice(0, 90));
  }

  /* O LADO QUE NUNCA: frase-modelo na primeira pessoa. Varre o texto de
     todo o projeto (sem comentários): uma deixa de modelo — "exemplo:",
     "algo como", "diga", "escreva", "narre" — seguida de uma citação na
     primeira pessoa é uma frase que a narração copiaria. A chave `frase`
     dos catálogos de ação NÃO é deixa: é o que o JOGADOR escreve quando
     toca o botão ("vasculho o lugar"), e o jogador fala por "eu". */
  const DEIXA = /(como|ex\.?|exemplo|algo como|diga|escreva|narre)[: —(]{0,4}["“«]([^"”»$`\n]{0,160})["”»]/gi;
  /* a mesma catraca da secção 1: a citação com deixa e primeira pessoa
     que é FALA DE NPC fica, mas com dono escrito aqui */
  const DONOS_NO_CODIGO = {
    "grimorio.js|não sei": "fala do morto interrogado (Falar com os Mortos): NPC",
  };
  const achados = [];
  for (const f of fs.readdirSync("../src").filter((x) => /\.(js|jsx)$/.test(x))) {
    const s = fs.readFileSync("../src/" + f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    for (const m of s.matchAll(DEIXA)) if (PRIMEIRA.test(m[2]) && !DONOS_NO_CODIGO[`${f}|${m[2]}`]) achados.push(`${f}: ${m[0].slice(0, 80)}`);
    /* e nenhum texto pede a narração na primeira pessoa: quem fala em
       primeira pessoa num envelope é NPC, e diz-se "fala direta (—)".
       Só o uso gramatical conta ("em/na/de primeira pessoa"): "a primeira
       pessoa que o mundo registra" (abas.js) é outra coisa. */
    for (const m of s.matchAll(/(?<=\b(em|na|de) )(1ª|primeira) pessoa/gi)) {
      const antes = s.slice(Math.max(0, m.index - 40), m.index);
      if (!/NPCs? falam? em $/.test(antes)) achados.push(`${f}: "…${antes.slice(-30)}${m[0]}"`);
    }
  }
  t("nenhum texto do projeto dá ao Narrador uma frase na primeira pessoa", achados.length === 0, achados.slice(0, 4).join(" | "));
}

/* ============================================================ */
sec("7. o teto");
{
  /* Medido a 30/09, antes desta etapa, com teste-prompt.mjs e um herói de
     nível 20: TODAS AS PORTAS 85.329 (soma sintética com léxico cheio
     87.935), PIOR CENA REAL 74.709, e por voz, todas as portas: épico
     85.077, taverneiro 85.290, contemplativo 85.013, sombrio 84.965,
     picaresco 84.917, cronista 84.935, febril 84.870, fábula 84.988.
     A frase nova não podia somar: os números ficam aqui e a suíte cobra
     que cada voz, no pior caso dela, não passe do que custava. */
  const ANTES = { epico: 85077, taverneiro: 85290, quieto: 85013, sombrio: 84965, picaresco: 84917, cronista: 84935, febril: 84870, fabula: 84988 };
  const subiu = VOZES.filter((v) => montar({ voz: v.id }).length > ANTES[v.id]).map((v) => `${v.id} ${montar({ voz: v.id }).length}`);
  t("nenhuma voz ficou mais cara no pior caso", Object.keys(ANTES).length === VOZES.length && subiu.length === 0, subiu.join(", "));
  t("e a sala continua curta", SALA_PROMPT.length < 320, String(SALA_PROMPT.length));
}

/* ============================================================ */
sec("8. a fiação — App.jsx (a abertura antiga e o sonho)");
{
  /* O caminho antigo da abertura (sem pista) e o envelope do sonho vivem no
     App. Eram os dois sítios do App que davam ao Narrador uma frase-modelo
     na primeira pessoa do herói ("ONDE EU ESTOU", "Esta noite eu sonhei"). */
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const i = app.indexOf("const abrirACampanha = (pers) => {");
  const corpo = i >= 0 ? app.slice(i, app.indexOf("\n  };", i)) : "";
  t("a abertura antiga pede a 2ª pessoa", corpo.includes("na 2ª pessoa: o herói é \"você\""));
  t("a abertura antiga já não diz ONDE EU ESTOU nem QUEM EU SOU", !!corpo && !corpo.includes("ONDE EU ESTOU") && !corpo.includes("QUEM EU SOU"));
  t("a abertura antiga já não fala do herói por 'me', 'mim', 'comigo', 'minha(s)'", !!corpo && !/(^|[^\p{L}])(me|mim|comigo|minhas?|meu|meus)(?![\p{L}])/u.test(corpo.replace(/\$\{[^}]*\}/g, "")));
  t("as âncoras que teste-sala exige ficam", corpo.includes("1) O MUNDO") && corpo.includes("4) O PRIMEIRO FIO") && corpo.includes("ABERTURA DA CAMPANHA"));
  t("o sonho já não diz 'eu sonhei'", app.includes("[SONHO] O sonho desta noite:") && !app.includes("Esta noite eu sonhei"));
}

console.log(`\nvoz-segunda-pessoa: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
