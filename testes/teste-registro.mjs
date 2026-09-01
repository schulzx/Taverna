/* teste-registro.mjs (v9.105) — a memória que não resume.
   O livro custava uma chamada de IA a cada 8 turnos e reescrevia em prosa
   o que o sistema já sabe em campo. O Registro RECUPERA em vez de
   resumir, e o custo dele no prompt é fixo para sempre. */
import fs from "node:fs";
import {
  PESOS, TETO_DE_LINHAS, QUANTAS_LINHAS, PONTOS, pesoPorNivel,
  garantirLinha, garantirRegistro, anotar, podar, pontuar,
  consultarArquivista, linhaDoArquivo, paraPauta, linhasPesadas, resumoDoRegistro, REGISTRO_PROMPT,
} from "../src/registro.js";
import { montarSystemPrompt } from "../src/prompt.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const sec = (t) => console.log(`\n[${t}]`);
const app = fs.readFileSync("../src/App.jsx", "utf8");
const prompt = fs.readFileSync("../src/prompt.js", "utf8");

sec("1) O LIVRO MORREU");
{
  ok(!/async function gerarLivro/.test(app), "a função que chamava a IA para reescrever o livro não existe mais");
  ok(!/livroRef/.test(app), "e o ref dele também não");
  ok(!/LIVRO DA CAMPANHA \(resumo/.test(prompt), "o bloco do livro saiu do prompt");
  ok(!/montarSystemPrompt\(nomeCampanha, mundo, personagem, livro,/.test(prompt), "e o parâmetro saiu da assinatura — parâmetro morto é mentira na assinatura");
  ok(/registroRef = useRef\(\[\]\)/.test(app), "o Registro tomou o lugar");
  ok(/registro: registroRef\.current/.test(app), "é salvo");
  ok(/registroRef\.current = garantirRegistro\(sv\.registro\)/.test(app), "e recarregado");
  ok(/JANELA_DE_HISTORICO = 30/.test(app), "e a janela de histórico bruto subiu de 18 para 30 com o espaço que sobrou");
}

sec("2) A LINHA E O PESO");
{
  ok(PESOS.length === 4, "quatro degraus de peso");
  ok(PESOS.every((p) => p.rotulo && p.o && p.dura != null), "cada um diz o que é e quanto dura");
  ok(PESOS[3].dura === Infinity, "a marca não se esquece");
  ok(PESOS[0].dura < PESOS[1].dura && PESOS[1].dura < PESOS[2].dura, "e quanto mais pesa, mais dura");
  ok(pesoPorNivel(99).peso === 3 && pesoPorNivel(-4).peso === 0, "peso fora da régua não estoura");

  const l = garantirLinha({ t: 23, dia: 5, onde: "no Escudo das Velas", quem: ["Marta", "Ubba", "Marta"], assunto: "divida", oQue: "menti sobre de onde vim", peso: 3, viu: ["Marta"] });
  ok(l.quem.length === 2, "nome repetido some");
  ok(l.peso === 3 && l.t === 23, "o que é número é número");
  ok(garantirLinha({ peso: 9 }).peso === 3 && garantirLinha({ peso: -2 }).peso === 0, "o peso é travado na régua");
  ok(garantirLinha(null).oQue === "" && garantirLinha("lixo").quem.length === 0, "lixo não quebra");
  ok(garantirLinha({ oQue: "z".repeat(400) }).oQue.length <= 90, "e os tetos mordem");
  ok(garantirLinha({ inventado: 1 }).inventado === undefined, "campo que o esquema não conhece não entra");
  /* registrar o nada é o que faz um registro deixar de ser legível */
  ok(anotar([], { t: 1, oQue: "" }).length === 0, "turno sem nada a dizer não vira linha");
  ok(anotar([], { t: 1, oQue: "fiz alguma coisa" }).length === 1, "e turno com alguma coisa vira");
  ok(garantirRegistro("lixo").length === 0 && garantirRegistro(null).length === 0, "registro que não é lista vira lista vazia");
}

sec("3) A PODA É POR PESO, NÃO POR IDADE");
{
  let r = [];
  r = anotar(r, { t: 1, dia: 1, oQue: "fui ao mercado", peso: 0 });
  r = anotar(r, { t: 2, dia: 1, oQue: "conversei com Marta", peso: 1, quem: ["Marta"] });
  r = anotar(r, { t: 3, dia: 1, oQue: "quitei a dívida", peso: 2, quem: ["Ubba"] });
  r = anotar(r, { t: 4, dia: 1, oQue: "matei o capitão", peso: 3, quem: ["Lucan"] });
  ok(podar(r, { dia: 2 }).length === 4, "no dia seguinte, tudo continua");
  ok(podar(r, { dia: 6 }).length === 3, "cinco dias depois, o mercado sumiu");
  ok(podar(r, { dia: 20 }).length === 2, "vinte dias, a conversa também");
  ok(podar(r, { dia: 100 }).length === 1, "cem dias, só a morte");
  ok(podar(r, { dia: 9999 })[0].oQue === "matei o capitão", "e é a morte que fica — para sempre");

  /* e o teto de linhas, para o save não estourar a cota do navegador */
  let g = [];
  for (let i = 0; i < 1200; i++) g = anotar(g, { t: i, dia: 0, oQue: "coisa " + i, peso: i % 4 });
  const p = podar(g, { dia: 0, teto: 100 });
  /* o teto morde ATE ONDE PODE: as marcas nao sao cortadas nunca, entao o
     piso do registro e o numero de marcas. Um teto que cortasse marca para
     caber seria o save mentindo sobre a promessa da tabela. */
  const marcas = g.filter((x) => x.peso === 3).length;
  ok(p.length <= Math.max(100, marcas), `o teto morde ate onde pode (${g.length} → ${p.length}, com ${marcas} marcas que nunca saem)`);
  ok(p.filter((x) => x.peso < 3).length <= 100, "e tudo o que nao e marca foi espremido ate o teto");
  ok(p.filter((x) => x.peso === 3).length === g.filter((x) => x.peso === 3).length,
    "e NENHUMA marca é cortada pelo teto — é a promessa da tabela");
  ok(p.filter((x) => x.peso === 0).length < g.filter((x) => x.peso === 0).length, "quem sai primeiro é a passagem");
}

sec("4) O ARQUIVISTA RECUPERA, NÃO RESUME");
{
  let r = [];
  r = anotar(r, { t: 5, dia: 2, onde: "Forte do Vigia", quem: ["Marta"], assunto: "divida", oQue: "menti para Marta sobre de onde vim", peso: 2 });
  r = anotar(r, { t: 9, dia: 3, onde: "a estrada", quem: ["Ubba"], oQue: "briguei na ponte", peso: 2 });
  r = anotar(r, { t: 20, dia: 8, onde: "Forte do Vigia", quem: ["Marta", "Ubba"], oQue: "Marta me viu com Ubba", peso: 1 });
  r = anotar(r, { t: 30, dia: 12, onde: "Ker", quem: ["Iris"], oQue: "comprei uma corda", peso: 0 });
  for (let i = 40; i < 90; i++) r = anotar(r, { t: i, dia: 20, onde: "Ker", oQue: "andei por aí " + i, peso: 0 });

  const cena = { onde: "Forte do Vigia", quem: ["Marta"], assunto: "divida", turnoAtual: 100, diaAtual: 30 };
  const a = consultarArquivista(r, cena);
  console.log("  " + a.map((x) => `t${x.t} ${x.oQue}`).join("\n  "));
  ok(a.length <= QUANTAS_LINHAS, `no máximo ${QUANTAS_LINHAS} linhas, por mais longa que a campanha seja`);
  ok(a.some((x) => /menti para Marta/.test(x.oQue)), "a mentira para Marta, de 95 turnos atrás, é recuperada");
  ok(!a.some((x) => /andei por aí/.test(x.oQue)), "e cinquenta turnos de nada não entram");
  ok(a.every((x, i, l) => i === 0 || x.t > l[i - 1].t), "e vêm em ordem de história, não de pontuação");

  /* A PESSOA VALE MAIS QUE O LUGAR: o jogador está olhando para o lugar
     e não lembra da pessoa */
  ok(PONTOS.pessoa > PONTOS.lugar && PONTOS.lugar > PONTOS.assunto, "a pessoa pesa mais que o lugar, e o lugar mais que o assunto");
  const comPessoa = pontuar(r[0], { quem: ["Marta"], turnoAtual: 100 });
  const semPessoa = pontuar(r[0], { quem: ["Ninguém"], turnoAtual: 100 });
  ok(comPessoa > semPessoa, "e a mesma linha pontua mais quando a pessoa está na cena");
  /* o velho de peso ganha do recente de nada */
  const velhoPesado = pontuar({ t: 1, peso: 3, oQue: "x" }, { turnoAtual: 100 });
  const novoLeve = pontuar({ t: 99, peso: 0, oQue: "y" }, { turnoAtual: 100 });
  ok(velhoPesado > novoLeve, "uma marca de cem turnos atrás vale mais que a caneca de ontem");

  /* SEM RELEVÂNCIA, ELE CALA */
  const nada = consultarArquivista(r, { onde: "lugar nenhum", quem: [], assunto: "", turnoAtual: 100 });
  ok(nada.length === 0 || nada.every((x) => x.peso >= 2), "sem nada a ver com a cena, só o que pesou muito — ou nada");
  ok(consultarArquivista([], cena).length === 0, "registro vazio devolve vazio");
  ok(consultarArquivista(null, cena).length === 0, "e registro nulo também");
  /* o turno de AGORA não é passado */
  ok(!consultarArquivista(r, { ...cena, turnoAtual: 5 }).some((x) => x.t === 5), "o turno atual não entra como memória");
}

sec("5) O CUSTO É FIXO PARA SEMPRE");
{
  /* é a promessa que separa recuperar de resumir */
  const fazer = (n) => {
    let r = [];
    for (let i = 1; i <= n; i++) r = anotar(r, { t: i, dia: Math.floor(i / 3), onde: "Vado", quem: i % 3 ? ["Marta"] : [], oQue: "aconteceu a coisa número " + i, peso: i % 4 });
    return r;
  };
  const cena = (n) => ({ onde: "Vado", quem: ["Marta"], turnoAtual: n + 1, diaAtual: Math.floor(n / 3) + 1 });
  const t30 = paraPauta(fazer(30), cena(30)).join("\n");
  const t1000 = paraPauta(fazer(1000), cena(1000)).join("\n");
  console.log(`  30 turnos → ${t30.length} chars · 1000 turnos → ${t1000.length} chars`);
  ok(t30.split("\n").length === t1000.split("\n").length, "trinta turnos e mil turnos entregam o MESMO número de linhas");
  ok(t1000.length < 400, "e o bloco continua pequeno — o custo não cresce com a campanha");
  ok(/há \d+ dias/.test(t1000), "cada linha diz há quanto tempo foi");
}

sec("6) A CAMPANHA INTEIRA, PARA A RECALIBRAGEM");
{
  let r = [];
  for (let i = 1; i <= 60; i++) r = anotar(r, { t: i, dia: i, oQue: "coisa " + i, peso: i % 4 });
  ok(linhasPesadas(r).every((x) => x.peso >= 2), "só a virada e a marca — uma recalibragem não precisa da terça-feira");
  ok(linhasPesadas(r, { quantas: 5 }).length === 5, "e o teto morde");
  const t = resumoDoRegistro(r);
  ok(/dia \d+/.test(t), "o resumo carrega o dia de cada coisa");
  ok(resumoDoRegistro([]).includes("ainda não registrou"), "e sem nada de peso, diz isso em vez de mentir");
  ok(/resumoDoRegistro\(registroRef\.current\)/.test(app), "as três recalibragens leem daqui em vez do livro");
  ok(!/LIVRO DA CAMPANHA:/.test(app), "e a palavra 'livro' saiu de todas elas");
}

sec("7) O BLOCO DO PROMPT, E A ASSINATURA NOVA");
{
  ok(/nunca as reconte/.test(REGISTRO_PROMPT), "o bloco proíbe recontar o que já aconteceu");
  ok(/São fato/.test(REGISTRO_PROMPT), "e afirma que são fato");
  ok(REGISTRO_PROMPT.length < 400, `e cabe em ${REGISTRO_PROMPT.length} caracteres`);
  /* a assinatura nova funciona de ponta a ponta */
  const pers = { nome: "V", conceito: "x", nivel: 5, atributos: { forca: 1, destreza: 1, vigor: 1, intelecto: 1, presenca: 1, percepcao: 1 }, vidaMax: 40, manaMax: 20 };
  const p = montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, { Marta: { tipo: "pessoa" } }, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", { emCidade: true });
  ok(p.length > 40000, "o prompt continua sendo montado");
  ok(/CÂNONE/.test(p), "com o cânone no lugar certo — ele não era resumo e não morreu");
  ok(/A linha ANTES traz coisas que ACONTECERAM/.test(p), "e com as regras do registro, agora dentro do bloco da Pauta");
  ok(!/LIVRO DA CAMPANHA/.test(p), "e sem uma linha sequer do livro");
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\ntudo verde");
process.exit(falhas ? 1 : 0);
