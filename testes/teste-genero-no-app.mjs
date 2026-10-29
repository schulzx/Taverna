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
    /* MOVIDA (29/10, trilha A, a ligação do load): o `continuar` abre os dez campos que refaz por `const ab = abrirOSave(sv)`, e a regra mora agora em src/abrir-o-save.js — este recuo foi com a migração das tarefas antigas para a peça do load (a 1.ª secção conta-o lá). Os do App passam de 13 a 12. */
    ["as tarefas antigas migradas (agora na peça do load)", "genero: mw.genero || " + P + ",", 0],
    ["o save sem mundo, no pedido ao Narrador", "montarSystemPrompt(nomeDaCampanha(sv), sv.mundo || { genero: " + P + " }, pers,", 1],
    ["a masmorra", "gerarMasmorra((mundo && mundo.genero) || " + P + ",", 1],
    ["o aceite da missão", "tentarAceite(d, { genero: (mundo && mundo.genero) || " + P + ",", 1],
    ["as missões", "genero: (mundo && mundo.genero) || " + P + ", lexico:", 1],
    ["o encontro na estrada", "rolarEncontro((mundo && mundo.genero) || " + P + ",", 1],
  ];
  for (const [nome, ancora, n] of SITIOS) t(nome + " (" + n + ")", conta(APP, ancora) === n, "achei " + conta(APP, ancora));
  const total = SITIOS.reduce((a, s) => a + s[2], 0);
  t("são " + total + " recuos, e nenhum outro sítio lê o padrão por fora da conta", total === 12 && conta(APP, P) === total, "no App: " + conta(APP, P));
  /* e o que saiu do App está na peça do load: o recuo das tarefas antigas e o das casas (que no App era o generoMundo()) */
  const PECA_DO_LOAD = readFileSync(new URL("../src/abrir-o-save.js", import.meta.url), "utf8");
  t("os recuos do load estão na peça dele (as tarefas antigas e as casas)", conta(PECA_DO_LOAD, "genero: mw.genero || " + P + ",") === 1 && conta(PECA_DO_LOAD, "mundo.genero || " + P + ", mundo.lexico") === 1);
  t("o App importa o mundo em uso", /import \{ cenarioAtivo \} from "\.\/cenario\.js";/.test(APP));
  /* o literal que fica: chave de tabela da tela, não recuo. O fundo do
     ModalCena (um gradiente por gênero) é cor, logo tabela do desenho; o
     glifo do cartão de gênero é o terceiro item desta leva. */
  /* 2 → 1 no item seguinte da mesma leva: o GLIFO_DO_GENERO deixou de ser chaveado pelo
     nome do gênero (secção 3), e só o fundo do ModalCena segue como chave */
  const LITERAL_NO_APP = 1;
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

sec("3 · o glifo do cartão de gênero é dado do mundo, e a tela desenha o vocabulário");
{
  const EQ = CN.ESQUEMA_DO_CENARIO;
  /* o vocabulário é exatamente o que a tabela da tela desenha, nem mais nem menos */
  const tab = /\nconst GLIFO_DO_GENERO = \{([\s\S]*?)\n\};/.exec(APP);
  const desenha = tab ? [...tab[1].matchAll(/^\s+(\w+): Icone\w+,$/gm)].map((m) => m[1]) : [];
  t("a tela desenha cada nome do vocabulário, e só eles (" + desenha.length + ")", desenha.length > 0 && [...desenha].sort().join() === [...EQ.glifos].sort().join(), desenha.join());
  t("o cartão pede o glifo pelo nome que o mundo deu, nos dois sítios", conta(APP, "<LinhaDoCartao Glifo={g.glifo ? GLIFO_DO_GENERO[g.glifo] : null}") === 2 && !APP.includes("GLIFO_DO_GENERO[g.label]"));
  /* o mundo padrão sai igual: o ícone de cada cartão é o que a chave pelo nome dava antes */
  const ANTES = { "Fantasia medieval": "IconeCastelo", "Ficção científica": "IconeFoguete", Cyberpunk: "IconeTerminal", "Horror cósmico": "IconeOlho", "Pós-apocalíptico": "IconeCaveira", Steampunk: "IconeBussola", "Universo próprio": "IconeFaiscas" };
  const icone = (nome) => { const m = new RegExp("^\\s+" + nome + ": (Icone\\w+),$", "m").exec(tab ? tab[1] : ""); return m ? m[1] : null; };
  const cartoes = CN.CENARIO_PADRAO.generos.criacao;
  t("no mundo padrão, cada cartão tem o ícone de antes (" + cartoes.length + ")", cartoes.length === 7 && cartoes.every((g) => icone(g.glifo) === ANTES[g.label]), cartoes.map((g) => g.label + "=" + g.glifo).join());
  /* o validador */
  const com = (f) => { const d = structuredClone(DADOS_DO_CENARIO_PADRAO); f(d); return CN.validarCenario(d); };
  const fora = com((d) => { d.generos.criacao[1].glifo = "dragao"; });
  t("um glifo fora do vocabulário é recusado, com o caminho", !fora.ok && fora.erros.some((e) => e.startsWith("generos.criacao[1].glifo: devia ser um glifo da tela")), fora.erros.join(" | "));
  const torto = com((d) => { d.generos.criacao[0].glifo = 3; });
  t("um glifo que não é texto também", !torto.ok && torto.erros.some((e) => e.startsWith("generos.criacao[0].glifo:")));
  const sem = com((d) => { for (const g of d.generos.criacao) delete g.glifo; });
  t("um mundo sem glifo nenhum segue válido (o cartão vai sem ícone)", sem.ok, sem.erros.join(" | "));
  t("um campo que ninguém lê segue recusado", !com((d) => { d.generos.criacao[0].icone = "castelo"; }).ok);
  /* um mundo de estação: o cartão dele diz o seu glifo, e a tela o desenha */
  const d = structuredClone(DADOS_DO_CENARIO_PADRAO);
  d.generos.criacao.unshift({ id: "opera", label: "Ópera de estação", glifo: "foguete", dica: "Docas, turnos longos e o vácuo do lado de fora" });
  const v = CN.validarCenario(d);
  t("um gênero novo nasce com o glifo que o mundo lhe deu", v.ok && icone(CN.carregarCenario(d).generos.criacao[0].glifo) === "IconeFoguete", v.erros.join(" | "));
}

console.log("\n" + ok + " ok, " + falhas + " falhas");
process.exit(falhas ? 1 : 0);
