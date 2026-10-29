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
      nem como chave (desde T3, 29/10, a cor do mundo sai do tom do cartão,
      e a última chave pelo nome morreu);
   2. no mundo padrão o recuo é o mesmo texto de antes, ao char (o mundo
      padrão não muda), e noutro mundo é o padrão dele;
   3. o glifo do cartão é dado do mundo, e a tela desenha o vocabulário;
   4. o tom da cena (T3, 29/10) é dado do mundo pelo mesmo molde: o cartão diz
      o NOME de um tom de um vocabulário fechado, e tomDoGenero o devolve pelo
      rótulo do gênero — sem estourar com o que não veio;
   5. as duas tabelas da tela (T3, 29/10): a luz do mundo (estilo.js,
      TOM_DA_CENA e luzAmbiente — T3 §4b/§4c, desde que a janela da cena se
      aposentou em §5b) igual ao byte à de antes no mundo padrão e no recuo, a
      porta do contraste de cada tom pela conta de teste-v1-folha, e o globo de
      ui.jsx quando o glifo falta. */
import { readFileSync } from "node:fs";
const CN = await import("../src/cenario.js");
const { DADOS_DO_CENARIO_PADRAO } = await import("../src/cenario-padrao.js");
const APP = readFileSync("../src/App.jsx", "utf8").replace(/\r\n/g, "\n");
const UI = readFileSync("../src/ui.jsx", "utf8").replace(/\r\n/g, "\n");
const E = await import("../src/estilo.js");
const LUZ = await import("./conta-da-luz.mjs");

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
     a luz do mundo pede o tom do gênero ao mundo em uso (era o fundo do ModalCena, que se
     aposentou em T3 §5b; a asserção é a mesma) */
  t("o App importa o mundo em uso", /import \{ cenarioAtivo, tomDoGenero \} from "\.\/cenario\.js";/.test(APP));
  /* o literal que fica: chave de tabela da tela, não recuo. O fundo do
     ModalCena (um gradiente por gênero) é cor, logo tabela do desenho; o
     glifo do cartão de gênero é o terceiro item desta leva. */
  /* 2 → 1 no item seguinte da mesma leva: o GLIFO_DO_GENERO deixou de ser chaveado pelo
     nome do gênero (secção 3), e só o fundo do ModalCena segue como chave */
  /* 1 → 0 em T3 (29/10): o fundo do ModalCena deixou de ser um objeto chaveado pelo rótulo
     do gênero — saía de fundoDaCena(tomDoGenero(...)), e a cor foi morar em estilo.js. A
     última chave pelo nome morreu; o literal não tem mais onde ficar no App. (Desde §5b a
     janela saiu, e a cor do mundo é a luz: luzAmbiente(tomDoGenero(...)).) */
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

sec("5 · as tabelas da tela: a luz do mundo ao byte, a porta do contraste, o globo de recuo (T3, 29/10)");
{
  const EQ = CN.ESQUEMA_DO_CENARIO;
  /* 1. os dois vocabulários batem com as duas tabelas, nos dois sentidos */
  const tons = Object.keys(E.TOM_DA_CENA);
  const semCor = EQ.tons.filter((n) => !tons.includes(n)), semNome = tons.filter((n) => !EQ.tons.includes(n));
  t("cada tom do vocabulário tem cor, e cada cor tem nome (" + tons.length + ")", tons.length === 7 && semCor.length === 0 && semNome.length === 0, "sem cor: " + semCor.join() + " · sem nome: " + semNome.join());
  /* MOVIDA (29/10, T3 §4c): «cada tom tem as duas paradas, em hex de seis dígitos» — a janela
     aposentou-se em T3 §5b e o tom serve a luz. Os catorze hex saíram; cada tom guarda só o NOME
     de uma cor de T (a luz do meio), e um nome que não exista em T pintaria «undefined» no
     gradiente. A intenção é a mesma: a forma da tabela, conferida campo a campo. */
  const semToken = tons.filter((n) => !(Object.keys(E.TOM_DA_CENA[n]).join() === "luz" && typeof E.T[E.TOM_DA_CENA[n].luz] === "string" && /^#[0-9a-fA-F]{6}$/.test(E.T[E.TOM_DA_CENA[n].luz])));
  t("cada tom tem só a luz, e a luz é um token que existe em T", semToken.length === 0, semToken.join());

  /* 2. AO BYTE — MOVIDA (29/10, T3 §4c): era o «ao byte» de fundoDaCena dos sete gêneros (os
     gradientes 160deg do ModalCena). A janela aposentou-se em T3 §5b; o tom serve a luz, e o que
     não pode mudar agora é a luz de quem não escolheu outro mundo. A string é a LUZ_AMBIENTE de
     6d84aa7 (git show 6d84aa7:src/estilo.js, montada), escrita à mão aqui. */
  const LUZ_DE_ANTES = "linear-gradient(to right, rgba(255,176,58,0.063) 0%, rgba(0,187,249,0.09) 55%, rgba(241,91,181,0.072) 100%)";
  t("sem tom, a luz é a de antes, ao byte", E.luzAmbiente() === LUZ_DE_ANTES, E.luzAmbiente());
  t("a Fantasia medieval (crepusculo) tem a luz de antes, ao byte", E.luzAmbiente("crepusculo") === LUZ_DE_ANTES && E.luzAmbiente(CN.tomDoGenero("Fantasia medieval")) === LUZ_DE_ANTES);
  t("o Universo próprio (noite, o recuo) tem a luz de antes, ao byte", E.luzAmbiente("noite") === LUZ_DE_ANTES && E.luzAmbiente(CN.tomDoGenero("Universo próprio")) === LUZ_DE_ANTES);
  t("um tom fora da tabela (roxo), ou um gênero que não é cartão (Ópera espacial), é o recuo, ao byte", E.luzAmbiente("roxo") === LUZ_DE_ANTES && E.luzAmbiente(CN.tomDoGenero("Ópera espacial")) === LUZ_DE_ANTES);
  t("e a folha pinta a luz de antes no .tv-esbate-topo (o menu, um save sem gênero)", E.FOLHA.replace(/\r\n/g, "\n").includes(".tv-esbate-topo {\n  background-image: " + LUZ_DE_ANTES + ";"));
  /* o mundo muda só a cor do MEIO: as pontas (o herói, a mão do jogador), os alfas e as
     posições são os de AMBIENTE em todos os tons — e a string que a tela pinta é a que a
     catraca de baixo mede (as mesmas paradas, montadas) */
  const paradasDe = (tom) => E.AMBIENTE.paradas.map((p) => (p.em > 0 && p.em < 1 ? { ...p, token: E.TOM_DA_CENA[tom].luz } : p));
  const montar = (P) => "linear-gradient(" + E.AMBIENTE.direcao + ", " + P.map((p) => E.alfa(E.T[p.token], p.alfa) + " " + Math.round(p.em * 100) + "%").join(", ") + ")";
  const desvia = tons.filter((n) => E.luzAmbiente(n) !== montar(paradasDe(n)));
  t("cada tom pinta as paradas de AMBIENTE com o meio trocado, e só ele (" + tons.length + ")", desvia.length === 0, desvia.join());
  const distintas = new Set(tons.map((n) => E.luzAmbiente(n)));
  t("e os mundos que não são o padrão têm luz própria (6 luzes para 7 tons: crepusculo e noite partilham a de antes)", distintas.size === 6, String(distintas.size));

  /* 3. MOVIDA (29/10, T3 §4c): era «o mundo null, undefined ou {} dá o recuo» e «um nome de
     Object é o recuo», sobre fundoDaCena. A janela aposentou-se em §5b; o tom serve a luz, e a
     fiação da luz também dispensa o calou porque nada disto estoura. */
  let estourou = null;
  const r = [null, undefined, {}].map((mundo) => { try { return E.luzAmbiente(CN.tomDoGenero((mundo || {}).genero)); } catch (e) { estourou = e; return "ESTOUROU"; } });
  t("o mundo null, undefined ou {} dá a luz de antes, sem estourar (por isso a fiação dispensa o calou)", !estourou && r.every((x) => x === LUZ_DE_ANTES), estourou ? String(estourou) : r.join(" | "));
  let estourou2 = null;
  const r2 = [null, undefined, {}, [], "", "constructor", "toString", "__proto__", 3].map((x) => { try { return E.luzAmbiente(x); } catch (e) { estourou2 = e; return "ESTOUROU"; } });
  t("null, undefined, {}, um nome de Object ou um número: a luz de antes, sem estourar", !estourou2 && r2.every((x) => x === LUZ_DE_ANTES), estourou2 ? String(estourou2) : r2.join(" | "));
  /* a criação chama-a com (genero && genero.tom): sem cartão escolhido é null */
  t("a criação sem cartão escolhido (genero null) tem a luz de antes", E.luzAmbiente(null && null.tom) === LUZ_DE_ANTES);

  /* 4. A PORTA DO CONTRASTE — MOVIDA (29/10, T3 §4c): era ink/amberSoft/danger ≥ 4,5:1 contra o
     topo e o pé de cada tom (o fundo do ModalCena). A janela aposentou-se em §5b; o tom serve a
     luz, e a porta passa a ser a da luz: a conta de teste-v1-folha (conta-da-luz.mjs, a MESMA
     função, sRGB pré-multiplicado varrido de 0 a 100 %, o pior ponto), com as paradas do tom.
     Na página (T.pagina): a prosa ink ≥ AMBIENTE.pisos.prosa, inkMeio e inkDim ≥ 4,5 (AA), e o
     corpo a ΔE ≥ AMBIENTE.pisos.corpoContraMesa da mesa. Na criação (T.bg): o texto solto que
     ela tem — inkDim, violetSoft, amberSoft, ink — ≥ 4,5. */
  const AA = 4.5;
  const falhou = [];
  let piorProsa = { r: Infinity }, piorDim = { r: Infinity }, piorMesa = { r: Infinity }, piorCriacao = { r: Infinity };
  for (const n of tons) {
    const P = paradasDe(n);
    const prosa = LUZ.pior(E.T.ink, P);
    const meio = LUZ.pior(E.T.inkMeio, P), dim = LUZ.pior(E.T.inkDim, P);
    const mesa = LUZ.corpoContraMesa(P);
    if (prosa < piorProsa.r) piorProsa = { r: prosa, n };
    if (Math.min(meio, dim) < piorDim.r) piorDim = { r: Math.min(meio, dim), n };
    if (mesa < piorMesa.r) piorMesa = { r: mesa, n };
    if (prosa < E.AMBIENTE.pisos.prosa) falhou.push(n + ": prosa " + prosa.toFixed(2));
    if (meio < AA) falhou.push(n + ": inkMeio " + meio.toFixed(2));
    if (dim < AA) falhou.push(n + ": inkDim " + dim.toFixed(2));
    if (mesa < E.AMBIENTE.pisos.corpoContraMesa) falhou.push(n + ": ΔE corpo × mesa " + mesa.toFixed(2));
    for (const tinta of ["inkDim", "violetSoft", "amberSoft", "ink"]) {
      const c = LUZ.pior(E.T[tinta], P, E.T.bg);
      if (c < piorCriacao.r) piorCriacao = { r: c, n: n + "/" + tinta };
      if (c < AA) falhou.push(n + ": " + tinta + " na criação " + c.toFixed(2));
    }
  }
  t("a prosa no pior ponto de cada luz ≥ " + E.AMBIENTE.pisos.prosa + " (a pior: " + piorProsa.n + ", " + piorProsa.r.toFixed(2) + ")", !falhou.some((f) => f.includes(": prosa ")), falhou.join(" · "));
  t("inkMeio e inkDim no pior ponto de cada luz ≥ 4,5 (o pior: " + piorDim.n + ", " + piorDim.r.toFixed(2) + ")", !falhou.some((f) => / ink(Meio|Dim) \d/.test(f)), falhou.join(" · "));
  t("o corpo distingue-se da mesa em cada luz (ΔE mín.: " + piorMesa.n + ", " + piorMesa.r.toFixed(2) + " ≥ " + E.AMBIENTE.pisos.corpoContraMesa + ")", !falhou.some((f) => f.includes("ΔE")), falhou.join(" · "));
  t("na criação, sobre T.bg, o texto solto ≥ 4,5 em cada luz (o pior: " + piorCriacao.n + ", " + piorCriacao.r.toFixed(2) + ")", !falhou.some((f) => f.includes("na criação")), falhou.join(" · "));
  /* e a régua é a de hoje: sem paradas nem chão, a conta dá os números que teste-v1-folha prova */
  t("a conta partilhada, chamada sem paradas, mede a luz de antes (a do crepusculo)", LUZ.pior(E.T.ink) === LUZ.pior(E.T.ink, paradasDe("crepusculo")) && LUZ.corpoContraMesa() === LUZ.corpoContraMesa(paradasDe("noite")));

  /* 5. o globo: glifoDoGenero, executado a partir do texto de ui.jsx (o .jsx não abre em Node),
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
  /* 6. o validador recusa o glifo de fora com o caminho (o tom de fora está na secção 4) */
  const d = structuredClone(DADOS_DO_CENARIO_PADRAO);
  d.generos.criacao[3].glifo = "nuvem";
  const v = CN.validarCenario(d);
  t("glifo: \"nuvem\" é recusado, com o caminho e a lista (que já traz o globo)", !v.ok && v.erros.some((e) => e.startsWith("generos.criacao[3].glifo: devia ser um glifo da tela (") && e.includes("globo")), v.erros.join(" | "));
  const d2 = structuredClone(DADOS_DO_CENARIO_PADRAO);
  d2.generos.criacao.push({ id: "opera", label: "Ópera espacial", glifo: "globo", dica: "Um autor que escolhe o globo de propósito" });
  t("e um autor pode escolher o globo de propósito", CN.validarCenario(d2).ok);

  /* 7. o App. O hex dos tons continua fora dele (as treze cores distintas de 6d84aa7, escritas à
     mão: o objeto que as tinha saiu da tabela, e o App não pode tê-las de volta). */
  const HEX_DE_ANTES = ["#2A2036", "#1a1420", "#16232e", "#0e1620", "#2a1030", "#10121e", "#0a0a10", "#2b2418", "#161208", "#2a2018", "#15100a", "#241C33", "#12101a"];
  const ficaram = HEX_DE_ANTES.filter((h) => APP.toLowerCase().includes(h.toLowerCase()));
  t("o App não tem nenhum hex dos tons de antes (" + HEX_DE_ANTES.length + " distintos)", ficaram.length === 0, ficaram.join(" "));
  /* MOVIDA (29/10, T3 §4c): era «o ModalCena pinta o fundo pela conta (const climaFundo =
     fundoDaCena(...)), e o App importa fundoDaCena». A janela aposentou-se em §5b; o tom serve a
     luz. O que se guarda agora: a janela não volta escondida (nem a função, nem o estado que a
     abria, nem a conta do fundo dela), e a luz do mundo chega aos dois sítios que §4c pediu. */
  t("a janela saiu: o App não tem ModalCena, nem verCena, nem fundoDaCena (nem o gradiente 160deg)",
    !APP.includes("ModalCena") && !APP.includes("verCena") && !APP.includes("fundoDaCena") && !APP.includes("climaFundo") && !/linear-gradient\(160deg/.test(APP));
  t("e estilo.js já não exporta fundoDaCena (nem guarda o ângulo dela)", E.fundoDaCena === undefined && !readFileSync("../src/estilo.js", "utf8").includes("ANGULO_DA_CENA"));
  t("o App importa luzAmbiente de estilo.js", /, alfa, luzAmbiente \} from "\.\/estilo\.js";/.test(APP));
  t("a página da história pinta a luz do mundo do gênero da campanha, uma vez por mundo",
    conta(APP, "const luzDoMundo = useMemo(() => luzAmbiente(tomDoGenero((mundo || {}).genero)), [mundo]);") === 1 &&
    /className="tv-scroll tv-esbate-topo [^"]*" style=\{\{ backgroundImage: luzDoMundo \}\}>/.test(APP) && conta(APP, "luzDoMundo") === 2);
  t("a criação do mundo troca a luz no clique do cartão (sem cartão: o recuo)",
    conta(APP, "<div className=\"tv-fade w-full overflow-y-auto tv-scroll\" style={{ backgroundImage: luzAmbiente(genero && genero.tom) }}>") === 1);
}

console.log("\n" + ok + " ok, " + falhas + " falhas");
process.exit(falhas ? 1 : 0);
