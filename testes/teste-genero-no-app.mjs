/* O GÊNERO DO MUNDO NO APP (Fase T, trilha A, 29/10/2026)

   A T4-B levou os recuos "Fantasia medieval" de src/*.js para o gênero
   padrão do mundo em uso (`cenarioAtivo().generos.padrao`), e mediu 15 no
   App — que é da trilha A. Um mundo escrito por outra mão (a Estação Órbita
   Sete da suíte do cenário) diz o seu gênero padrão; o App, quando o save
   ou o mundo não dizia o gênero, caía na Fantasia medieval mesmo assim: o
   bestiário do encontro, a masmorra, o banco de nomes, o pedido ao Narrador
   de um save antigo — tudo de fantasia num mundo de estação.

   O que esta suíte guarda:
   1. os 13 recuos do App são o gênero padrão do mundo em uso, sítio a
      sítio (a âncora de cada um), e o literal só sobrevive onde é CHAVE de
      uma tabela da tela (o fundo do ModalCena) — nunca como recuo;
   2. no mundo padrão o recuo é o mesmo texto de antes, ao char (o mundo
      padrão não muda), e noutro mundo é o padrão dele. */
import { readFileSync } from "node:fs";
const CN = await import("../src/cenario.js");
const { DADOS_DO_CENARIO_PADRAO } = await import("../src/cenario-padrao.js");
const APP = readFileSync("../src/App.jsx", "utf8").replace(/\r\n/g, "\n");

let ok = 0, falhas = 0;
const sec = (s) => console.log("\n" + s);
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { falhas++; console.log("  FALHA  " + nome + (extra ? " · " + extra : "")); } };
const conta = (txt, x) => txt.split(x).length - 1;

const P = "cenarioAtivo().generos.padrao";
sec("1 · os recuos do App são o gênero padrão do mundo em uso");
{
  /* cada recuo pela sua âncora, com quantas vezes ela aparece (as linhas
     andam; a âncora não) */
  const SITIOS = [
    ["o mundo que não veio, no PainelLateral e no painel do herói", "mundo = mundo || { genero: " + P + " };", 2],
    ["o gênero do mundo, parâmetro do PainelLateral", "generoMundo = " + P + ", lexicoMundo", 1],
    ["o banco de nomes", "const g = (mundo && mundo.genero) || mundo || " + P + ";", 1],
    ["o gênero do mundo, no turno", "const generoMundo = () => (mundoAtual() && mundoAtual().genero) || " + P + ";", 1],
    ["o mundo da partida rápida", "const m = { genero: " + P + ", molde: MOLDE_PADRAO,", 1],
    ["o save sem mundo, na tela", "setMundo(sv.mundo || { genero: " + P + " });", 1],
    ["as tarefas antigas migradas", "genero: mw.genero || " + P + ",", 1],
    ["o save sem mundo, no pedido ao Narrador", "montarSystemPrompt(nomeDaCampanha(sv), sv.mundo || { genero: " + P + " }, pers,", 1],
    ["a masmorra", "gerarMasmorra((mundo && mundo.genero) || " + P + ",", 1],
    ["o aceite da missão", "tentarAceite(d, { genero: (mundo && mundo.genero) || " + P + ",", 1],
    ["as missões", "genero: (mundo && mundo.genero) || " + P + ", lexico:", 1],
    ["o encontro na estrada", "rolarEncontro((mundo && mundo.genero) || " + P + ",", 1],
  ];
  for (const [nome, ancora, n] of SITIOS) t(nome + " (" + n + ")", conta(APP, ancora) === n, "achei " + conta(APP, ancora));
  const total = SITIOS.reduce((a, s) => a + s[2], 0);
  t("são " + total + " recuos, e nenhum outro sítio lê o padrão por fora da conta", total === 13 && conta(APP, P) === total, "no App: " + conta(APP, P));
  t("o App importa o mundo em uso", /import \{ cenarioAtivo \} from "\.\/cenario\.js";/.test(APP));
  /* o literal que fica: chave de tabela da tela, não recuo. O fundo do
     ModalCena (um gradiente por gênero) é cor, logo tabela do desenho; o
     glifo do cartão de gênero é o terceiro item desta leva. */
  const LITERAL_NO_APP = 2;
  t("o literal \"Fantasia medieval\" só fica como chave (" + LITERAL_NO_APP + ")", conta(APP, "\"Fantasia medieval\"") === LITERAL_NO_APP, "achei " + conta(APP, "\"Fantasia medieval\""));
  t("e nenhum recuo literal sobrou (|| \"Fantasia medieval\" e { genero: \"Fantasia medieval\" })", !/\|\|\s*"Fantasia medieval"|genero:\s*"Fantasia medieval"|=\s*"Fantasia medieval"/.test(APP));
}

sec("2 · o mundo padrão não muda, e outro mundo diz o seu");
{
  t("no mundo padrão, o recuo é o texto de antes, ao char", CN.cenarioAtivo().generos.padrao === "Fantasia medieval");
  const d = structuredClone(DADOS_DO_CENARIO_PADRAO);
  d.generos.padrao = "Ficção científica";
  const outro = CN.usarCenario(d);
  t("noutro mundo, o recuo é o padrão dele", CN.cenarioAtivo() === outro && CN.cenarioAtivo().generos.padrao === "Ficção científica");
  CN.usarCenario(DADOS_DO_CENARIO_PADRAO);
  t("e o mundo padrão volta", CN.cenarioAtivo().generos.padrao === "Fantasia medieval");
}

console.log("\n" + ok + " ok, " + falhas + " falhas");
process.exit(falhas ? 1 : 0);
