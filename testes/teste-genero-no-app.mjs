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
      padrão não muda), e noutro mundo é o padrão dele;
   3. o glifo do cartão é dado do mundo, e a tela desenha o vocabulário;
   4. o tom da cena (T3, 29/10) é dado do mundo pelo mesmo molde: o cartão diz
      o NOME de um tom de um vocabulário fechado, e tomDoGenero o devolve pelo
      rótulo do gênero — sem estourar com o que não veio. */
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

sec("4 · o tom da cena é dado do mundo, pelo molde do glifo (T3, 29/10)");
{
  const EQ = CN.ESQUEMA_DO_CENARIO;
  t("o vocabulário dos tons é fechado e tem os sete (" + EQ.tons.length + ")", Object.isFrozen(EQ.tons) && EQ.tons.join() === "crepusculo,aco,magenta,breu,poeira,cobre,noite", EQ.tons.join());
  t("o cartão da criação aceita tom, opcional", EQ.generoDaCriacao.tom === "tom?");
  /* o mundo padrão: cada cartão com o tom que o seu gradiente de antes tinha */
  const ESPERADO = { "Fantasia medieval": "crepusculo", "Ficção científica": "aco", Cyberpunk: "magenta", "Horror cósmico": "breu", "Pós-apocalíptico": "poeira", Steampunk: "cobre", "Universo próprio": "noite" };
  const cartoes = CN.CENARIO_PADRAO.generos.criacao;
  t("no mundo padrão, os sete cartões dizem o seu tom", cartoes.length === 7 && cartoes.every((g) => g.tom === ESPERADO[g.label]), cartoes.map((g) => g.label + "=" + g.tom).join());
  t("e tomDoGenero devolve-o pelo rótulo", Object.entries(ESPERADO).every(([rot, tom]) => CN.tomDoGenero(rot) === tom));
  /* o que não é cartão, ou não veio: undefined, e nada estoura (a tela escolhe o recuo) */
  const nada = [undefined, null, "", "Ópera espacial", 7, {}, []];
  let estourou = null;
  const r = nada.map((x) => { try { return CN.tomDoGenero(x); } catch (e) { estourou = e; return "ESTOUROU"; } });
  t("rótulo de fora, vazio, null, undefined, número, objeto: undefined, sem estourar", r.every((x) => x === undefined), estourou ? String(estourou) : JSON.stringify(r));
  let estourou2 = null;
  const r2 = [null, undefined, {}, { generos: null }, { generos: { criacao: null } }, { generos: { criacao: [null, { label: "Cyberpunk" }] } }].map((c) => { try { return CN.tomDoGenero("Cyberpunk", c); } catch (e) { estourou2 = e; return "ESTOUROU"; } });
  /* o recuo do parâmetro: undefined explícito é o mundo em uso (o padrão do JS), null e o resto não estouram */
  t("com um cenário torto, também não estoura", !estourou2 && r2[1] === "magenta" && [0, 2, 3, 4, 5].every((i) => r2[i] === undefined), estourou2 ? String(estourou2) : JSON.stringify(r2));
  /* o validador, no molde do glifo */
  const com = (f) => { const d = structuredClone(DADOS_DO_CENARIO_PADRAO); f(d); return CN.validarCenario(d); };
  const fora = com((d) => { d.generos.criacao[2].tom = "roxo"; });
  t("um tom fora do vocabulário é recusado, com o caminho e a lista", !fora.ok && fora.erros.some((e) => e.startsWith("generos.criacao[2].tom: devia ser um tom da cena (crepusculo, aco,")), fora.erros.join(" | "));
  const torto = com((d) => { d.generos.criacao[0].tom = 3; });
  t("um tom que não é texto também", !torto.ok && torto.erros.some((e) => e.startsWith("generos.criacao[0].tom:")));
  const sem = com((d) => { for (const g of d.generos.criacao) { delete g.tom; delete g.glifo; } });
  t("um mundo sem tom nem glifo segue válido", sem.ok, sem.erros.join(" | "));
  /* outro mundo escolhe o tom pelo nome, sem mentir sobre o gênero */
  const d = structuredClone(DADOS_DO_CENARIO_PADRAO);
  d.generos.criacao.unshift({ id: "piratas", label: "Mares de ferro", glifo: "bussola", tom: "aco", dica: "Couraçados, motins e portos sem lei" });
  CN.usarCenario(d);
  t("um gênero novo diz o seu tom, e o mundo em uso responde", CN.tomDoGenero("Mares de ferro") === "aco" && CN.tomDoGenero("Cyberpunk") === "magenta");
  CN.usarCenario(DADOS_DO_CENARIO_PADRAO);
  t("e o mundo padrão volta sem ele", CN.tomDoGenero("Mares de ferro") === undefined);
}

console.log("\n" + ok + " ok, " + falhas + " falhas");
process.exit(falhas ? 1 : 0);
