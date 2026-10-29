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
      sítio (a âncora de cada um), e o literal não sobrevive nem como recuo
      nem como chave (desde T3, 29/10, o fundo do ModalCena sai do tom do
      cartão, e a última chave pelo nome morreu);
   2. no mundo padrão o recuo é o mesmo texto de antes, ao char (o mundo
      padrão não muda), e noutro mundo é o padrão dele;
   3. o glifo do cartão é dado do mundo, e a tela desenha o vocabulário;
   4. o tom da cena (T3, 29/10) é dado do mundo pelo mesmo molde: o cartão diz
      o NOME de um tom de um vocabulário fechado, e tomDoGenero o devolve pelo
      rótulo do gênero — sem estourar com o que não veio;
   5. as duas tabelas da tela (T3, 29/10): o fundo da cena (estilo.js,
      TOM_DA_CENA e fundoDaCena) igual ao byte ao de antes, o globo de ui.jsx
      quando o glifo falta, e a porta do contraste de cada tom. */
import { readFileSync } from "node:fs";
const CN = await import("../src/cenario.js");
const { DADOS_DO_CENARIO_PADRAO } = await import("../src/cenario-padrao.js");
const APP = readFileSync("../src/App.jsx", "utf8").replace(/\r\n/g, "\n");
const UI = readFileSync("../src/ui.jsx", "utf8").replace(/\r\n/g, "\n");
const E = await import("../src/estilo.js");

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
  /* MOVIDA (29/10, T3): o App importa também tomDoGenero do mesmo módulo, na mesma linha —
     o fundo do ModalCena pede o tom do gênero ao mundo em uso */
  t("o App importa o mundo em uso", /import \{ cenarioAtivo, tomDoGenero \} from "\.\/cenario\.js";/.test(APP));
  /* o literal que fica: chave de tabela da tela, não recuo. O fundo do
     ModalCena (um gradiente por gênero) é cor, logo tabela do desenho; o
     glifo do cartão de gênero é o terceiro item desta leva. */
  /* 2 → 1 no item seguinte da mesma leva: o GLIFO_DO_GENERO deixou de ser chaveado pelo
     nome do gênero (secção 3), e só o fundo do ModalCena segue como chave */
  /* 1 → 0 em T3 (29/10): o fundo do ModalCena deixou de ser um objeto chaveado pelo rótulo
     do gênero — sai de fundoDaCena(tomDoGenero(...)), e a cor mora em estilo.js. A última
     chave pelo nome morreu; o literal não tem mais onde ficar no App. */
  const LITERAL_NO_APP = 0;
  t("o literal \"Fantasia medieval\" saiu do App (" + LITERAL_NO_APP + ")", conta(APP, "\"Fantasia medieval\"") === LITERAL_NO_APP, "achei " + conta(APP, "\"Fantasia medieval\""));
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
  /* MOVIDA (29/10, T3): a tabela saiu do App.jsx para ui.jsx, ao lado dos ícones que
     desenha, e ganhou o globo (a oitava entrada, e o oitavo nome do vocabulário). A
     asserção é a mesma — os dois sentidos — lida na casa nova. */
  const tab = /\nconst GLIFO_DO_GENERO = \{([\s\S]*?)\n\};/.exec(UI);
  const desenha = tab ? [...tab[1].matchAll(/^\s+(\w+): Icone\w+,$/gm)].map((m) => m[1]) : [];
  t("a tela desenha cada nome do vocabulário, e só eles (" + desenha.length + ")", desenha.length > 0 && [...desenha].sort().join() === [...EQ.glifos].sort().join(), desenha.join());
  /* MOVIDA (29/10, T3): a tabela saiu do App para ui.jsx, e o cartão pede o componente a
     glifoDoGenero — que dá o globo quando o glifo falta, em vez do cartão mudo de antes.
     A intenção é a mesma: o glifo pelo nome que o mundo deu, nos dois sítios, nunca pelo rótulo. */
  t("o cartão pede o glifo pelo nome que o mundo deu, nos dois sítios", conta(APP, "<LinhaDoCartao Glifo={glifoDoGenero(g.glifo)}") === 2 && !APP.includes("GLIFO_DO_GENERO[") && !/\nconst GLIFO_DO_GENERO\b/.test(APP) && !APP.includes("glifoDoGenero(g.label)"));
  t("e o App importa glifoDoGenero de ui.jsx", /LinhaDoCartao, glifoDoGenero, duasColunas,[^\n]*\} from "\.\/ui\.jsx";/.test(APP));
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

sec("5 · as tabelas da tela: o tom da cena ao byte, o globo de recuo, a porta do contraste (T3, 29/10)");
{
  const EQ = CN.ESQUEMA_DO_CENARIO;
  /* 1. os dois vocabulários batem com as duas tabelas, nos dois sentidos */
  const tons = Object.keys(E.TOM_DA_CENA);
  const semCor = EQ.tons.filter((n) => !tons.includes(n)), semNome = tons.filter((n) => !EQ.tons.includes(n));
  t("cada tom do vocabulário tem cor, e cada cor tem nome (" + tons.length + ")", tons.length === 7 && semCor.length === 0 && semNome.length === 0, "sem cor: " + semCor.join() + " · sem nome: " + semNome.join());
  t("cada tom tem as duas paradas, em hex de seis dígitos", tons.every((n) => /^#[0-9a-fA-F]{6}$/.test(E.TOM_DA_CENA[n].topo) && /^#[0-9a-fA-F]{6}$/.test(E.TOM_DA_CENA[n].pe) && Object.keys(E.TOM_DA_CENA[n]).join() === "topo,pe"));
  /* 2. ao byte: o fundo de cada um dos sete é a string de antes (escrita à mão aqui, tirada de
     git show 44a5f39:src/App.jsx, o ModalCena), e um gênero que não é cartão cai no recuo de antes */
  const ANTES = {
    "Fantasia medieval": "linear-gradient(160deg,#2A2036,#1a1420)",
    "Ficção científica": "linear-gradient(160deg,#16232e,#0e1620)",
    "Cyberpunk": "linear-gradient(160deg,#2a1030,#10121e)",
    "Horror cósmico": "linear-gradient(160deg,#1a1420,#0a0a10)",
    "Pós-apocalíptico": "linear-gradient(160deg,#2b2418,#161208)",
    "Steampunk": "linear-gradient(160deg,#2a2018,#15100a)",
  };
  const RECUO = "linear-gradient(160deg,#241C33,#12101a)";
  const difere = Object.entries(ANTES).filter(([rot, fundo]) => E.fundoDaCena(CN.tomDoGenero(rot)) !== fundo);
  t("os seis gêneros de antes têm o fundo de antes, ao byte", difere.length === 0, difere.map(([r]) => r + "=" + E.fundoDaCena(CN.tomDoGenero(r))).join(" · "));
  /* o Universo próprio não tinha linha no objeto de antes: caía no recuo — e o tom dele é a noite */
  t("o Universo próprio, que caía no recuo, continua no recuo ao byte", E.fundoDaCena(CN.tomDoGenero("Universo próprio")) === RECUO);
  t("um gênero que não é cartão (Ópera espacial) é o recuo de antes, ao byte", E.fundoDaCena(CN.tomDoGenero("Ópera espacial")) === RECUO);
  /* o ModalCena chama a conta com (mundo || {}).genero: null, undefined e {} não estouram e dão o recuo */
  let estourou = null;
  const r = [null, undefined, {}].map((mundo) => { try { return E.fundoDaCena(CN.tomDoGenero((mundo || {}).genero)); } catch (e) { estourou = e; return "ESTOUROU"; } });
  t("o mundo null, undefined ou {} dá o recuo, sem estourar (por isso a fiação dispensa o calou)", !estourou && r.every((x) => x === RECUO), estourou ? String(estourou) : r.join(" | "));
  t("um tom fora da tabela, ou um nome de Object, é o recuo", ["roxo", "", "constructor", "toString", 3].every((x) => E.fundoDaCena(x) === RECUO));
  /* 3. o globo: glifoDoGenero, executado a partir do texto de ui.jsx (o .jsx não abre em Node),
     com cada Icone* trocado pelo seu nome */
  const fonteTab = /\nconst GLIFO_DO_GENERO = (\{[\s\S]*?\n\});/.exec(UI);
  const fonteFn = /\nexport function glifoDoGenero\(nome\) \{([\s\S]*?)\n\}/.exec(UI);
  let glifoDoGenero = null;
  if (fonteTab && fonteFn) {
    const icones = [...new Set([...fonteTab[1].matchAll(/\b(Icone\w+)\b/g)].map((m) => m[1]))];
    glifoDoGenero = new Function(...icones, "const GLIFO_DO_GENERO = " + fonteTab[1] + ";\nreturn function (nome) {" + fonteFn[1] + "\n};")(...icones);
  }
  t("ui.jsx exporta glifoDoGenero, e ela lê a tabela", !!glifoDoGenero);
  if (glifoDoGenero) {
    t("sem glifo, ou com um nome de fora, o cartão leva o globo", [undefined, null, "", "nao-existe", "nuvem", "constructor", 7].every((x) => glifoDoGenero(x) === "IconeGlobo"));
    t("com um nome do vocabulário, o ícone dele", glifoDoGenero("castelo") === "IconeCastelo" && glifoDoGenero("faiscas") === "IconeFaiscas" && glifoDoGenero("globo") === "IconeGlobo");
  }
  t("o IconeGlobo pede a forma ao Glifo, com as tintas dos irmãos", /export function IconeGlobo\(\{ tamanho = 20, cor = T\.amberSoft \}\) \{\n  return <Glifo nome="globo" tamanho=\{tamanho\} cor=\{cor\} \/>;\n\}/.test(UI));
  t("o mundo padrão continua com glifo explícito nos sete (o globo não aparece nele)", CN.CENARIO_PADRAO.generos.criacao.every((g) => g.glifo && g.glifo !== "globo"));
  /* 4. o validador recusa o glifo de fora com o caminho (o tom de fora está na secção 4) */
  const d = structuredClone(DADOS_DO_CENARIO_PADRAO);
  d.generos.criacao[3].glifo = "nuvem";
  const v = CN.validarCenario(d);
  t("glifo: \"nuvem\" é recusado, com o caminho e a lista (que já traz o globo)", !v.ok && v.erros.some((e) => e.startsWith("generos.criacao[3].glifo: devia ser um glifo da tela (") && e.includes("globo")), v.erros.join(" | "));
  const d2 = structuredClone(DADOS_DO_CENARIO_PADRAO);
  d2.generos.criacao.push({ id: "opera", label: "Ópera espacial", glifo: "globo", dica: "Um autor que escolhe o globo de propósito" });
  t("e um autor pode escolher o globo de propósito", CN.validarCenario(d2).ok);
  /* 5. a porta do contraste — WCAG 2.2, 1.4.3: as três tintas de texto do modal contra as duas
     paradas de cada tom, ≥ 4,5:1. A fórmula é a de toda catraca de cor da casa (teste-v1-folha,
     check-formas D1): luminância relativa sRGB. */
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const L = (h) => { const a = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); return 0.2126 * lin(a[0]) + 0.7152 * lin(a[1]) + 0.0722 * lin(a[2]); };
  const razao = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const PORTA = 4.5;
  const abaixo = [];
  let pior = { r: Infinity };
  for (const n of tons) for (const parada of ["topo", "pe"]) for (const tinta of ["ink", "amberSoft", "danger"]) {
    const rr = razao(E.T[tinta], E.TOM_DA_CENA[n][parada]);
    if (rr < pior.r) pior = { r: rr, onde: tinta + " sobre " + n + "." + parada };
    if (rr < PORTA) abaixo.push(tinta + " sobre " + n + "." + parada + " = " + rr.toFixed(2));
  }
  t("nenhum tom com texto abaixo de 4,5:1 (o pior: " + pior.onde + ", " + pior.r.toFixed(2) + ":1)", abaixo.length === 0, abaixo.join(" · "));
  /* 6. o App: o literal saiu de verdade, e o fundo é a conta */
  const HEX = tons.flatMap((n) => [E.TOM_DA_CENA[n].topo, E.TOM_DA_CENA[n].pe]);
  const ficaram = [...new Set(HEX)].filter((h) => APP.toLowerCase().includes(h.toLowerCase()));
  t("o App não tem mais nenhum hex dos tons (" + new Set(HEX).size + " distintos; #2A2036 e #241C33 entre eles)", ficaram.length === 0 && !APP.includes("#2A2036") && !APP.includes("#241C33"), ficaram.join(" "));
  t("o ModalCena pinta o fundo pela conta, e o App importa fundoDaCena de estilo.js",
    conta(APP, "const climaFundo = fundoDaCena(tomDoGenero((mundo || {}).genero));") === 1 && /, fundoDaCena \} from "\.\/estilo\.js";/.test(APP) && !/linear-gradient\(160deg/.test(APP));
}

console.log("\n" + ok + " ok, " + falhas + " falhas");
process.exit(falhas ? 1 : 0);
