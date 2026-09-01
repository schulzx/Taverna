/* A MAÇANETA (v9.140)

   O jogador abriu a aba de Domínios e não viu nada — e a causa não era um
   bug meu na v9.139: era que TODO aquele sistema estava atrás de uma porta
   que só o modo criativo abria. `relacao: "jogador"` era escrito num único
   lugar do código inteiro, e esse lugar era o comando `/dominar`. O painel
   dizia "conquiste ou funde cidades na história" e não havia conquista
   nenhuma atrás da frase.

   Provei a v9.139 injetando cidades à mão no save: cômodo mobiliado, porta
   sem maçaneta. Esta suíte defende a maçaneta — e as outras duas portas sem
   maçaneta que apareceram junto com ela. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const semCom = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semCom(readFileSync("../src/App.jsx", "utf8"));
const PAINEL = semCom(readFileSync("../src/painel-guilda.jsx", "utf8"));
const D = await import(S + "dominios.js");
const G = await import(S + "guildas.js");
const { PORTES } = await import(S + "geografia.js");
const GE = await import(S + "gestao.js");
const MC = await import(S + "mercado.js");
const CO = await import(S + "comercio.js");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const VILA = { nome: "Pedra Torta", porte: "vila", bioma: "montanha" };
const CAPITAL = { nome: "Alcáçova", porte: "capital", bioma: "planicie" };
/* v9.140: a casa da prova nasce do que a VILA exige, e não de um número
   que eu escolhi a olho. Quando a escala mudou — de tabela por nome para
   curva sobre a população — os números cravados aqui quebraram e o módulo
   estava certo. Prova que crava constante mede a minha memória, não o
   sistema. */
const PODER_VILA = D.poderExigido(VILA);
const CUSTO_VILA = D.custoDeTomar(VILA);
const casa = (over) => ({ id: "g1", nome: "Casa do Corvo", poder: PODER_VILA + 5, cofre: CUSTO_VILA + 100, ...over });
const tenta = (over) => D.podeTomarCidade({ guilda: casa(), mandaNaCasa: true, cidade: VILA, aqui: true, fama: 999, ...over });

sec("1. A PORTA EXISTE, E NÃO É O MODO CRIATIVO");
{
  /* a cicatriz: `relacao: "jogador"` era escrito num lugar só, e esse lugar
     era um comando de teste que começa com barra */
  const escritas = (APP.match(/relacao: "jogador"/g) || []).length;
  t("agora há mais de um caminho para a posse", escritas >= 2);
  t("e um deles é a tomada pela casa", /tomadaPronta\(tomandoRef\.current, alvo, diaRef\.current\)/.test(APP));
  t("o comando de teste continua existindo", /case "dominar"/.test(APP));
}

sec("2. A CASA COBRA QUATRO COISAS QUE O SISTEMA CONFERE");
{
  t("sem casa, não se toma nada", tenta({ guilda: null }).pode === false);
  t("e o motivo diz por quê", /cidade se toma com gente/.test(tenta({ guilda: null }).motivo));
  /* quem serve não entrega cidades */
  t("quem só serve na casa não toma", tenta({ mandaNaCasa: false }).pode === false);
  t("e o motivo é claro", /serve nesta casa, não manda/.test(tenta({ mandaNaCasa: false }).motivo));
  /* de longe é planilha */
  t("de longe não se toma", tenta({ aqui: false }).pode === false);
  t("poder pequeno não alcança", D.podeTomarCidade({ guilda: casa({ poder: 8 }), mandaNaCasa: true, cidade: VILA, aqui: true, fama: 999 }).pode === false);
  t("e o motivo traz os dois números", new RegExp(`poder 8 e Pedra Torta exige ${PODER_VILA}`).test(D.podeTomarCidade({ guilda: casa({ poder: 8 }), mandaNaCasa: true, cidade: VILA, aqui: true }).motivo));
  t("cofre vazio não paga", D.podeTomarCidade({ guilda: casa({ cofre: 0 }), mandaNaCasa: true, cidade: VILA, aqui: true }).pode === false);
  t("e diz quanto falta", new RegExp(`faltam ◉ ${CUSTO_VILA}`).test(D.podeTomarCidade({ guilda: casa({ cofre: 0 }), mandaNaCasa: true, cidade: VILA, aqui: true }).motivo));
  t("com tudo em ordem, pode", tenta().pode === true);
  t("ruína não se governa", tenta({ cidade: { nome: "R", porte: "ruina" } }).pode === false);
  t("o que já é seu não se toma de novo", tenta({ cidade: { ...VILA, relacao: "jogador" } }).pode === false);
  /* o motivo NUNCA é vazio quando não dá: botão apagado sem explicação é
     indistinguível de recurso que não existe — foi assim que a v9.139
     inteira passou despercebida */
  const casos = [{ guilda: null }, { mandaNaCasa: false }, { aqui: false }, { guilda: casa({ poder: 1 }) }, { guilda: casa({ cofre: 0 }) }, { cidade: null }];
  const mudos = casos.filter((caso) => {
    const r = D.podeTomarCidade({ guilda: casa(), mandaNaCasa: true, cidade: VILA, aqui: true, ...caso });
    return !r.pode && (!r.motivo || r.motivo.length < 10);
  });
  t("o não sempre explica, em todos os casos", mudos.length === 0);
}

sec("3. A CIDADE GRANDE É OBRA DE CAMPANHA");
{
  /* A PRIMEIRA VERSÃO DISTO ERA UMA TABELA POR NOME: aldeia, vila, cidade,
     capital, metrópole, fortaleza. Abri uma campanha na Torre e a sede da
     primeira guilda era "Andar 2 — do Poço" — nenhum daqueles nomes. O jogo
     tem QUATRO formas de mundo e VINTE portes, e uma tabela que enumera
     esquece a próxima, em silêncio: cai no padrão e cobra por um patamar de
     vinte almas o mesmo que por uma cidade. */
  const TODOS = Object.keys(PORTES).filter((p) => p !== "ruina");
  t("há mais de quinze portes no jogo", TODOS.length > 15);
  t("todos têm poder exigido", TODOS.every((p) => D.poderExigido({ porte: p }) > 0));
  t("todos têm custo", TODOS.every((p) => D.custoDeTomar({ porte: p }) > 0));
  t("todos levam dias", TODOS.every((p) => D.diasDeTomar({ porte: p }) >= 3));
  /* e a escala é ORDENADA pela população, não pelo nome: um patamar de
     vinte almas custa menos que um átrio de doze mil */
  const ordenados = [...TODOS].sort((a, b) => D.pesoDoPorte({ porte: a }) - D.pesoDoPorte({ porte: b }));
  t("quem é menor exige menos", ordenados.every((p, i) => i === 0 || D.poderExigido({ porte: p }) >= D.poderExigido({ porte: ordenados[i - 1] })));
  t("e custa menos", ordenados.every((p, i) => i === 0 || D.custoDeTomar({ porte: p }) >= D.custoDeTomar({ porte: ordenados[i - 1] })));
  t("o patamar da Torre é pequeno mesmo", D.poderExigido({ porte: "patamar" }) < D.poderExigido({ porte: "cidade" }));
  t("e o átrio é grande", D.poderExigido({ porte: "atrio" }) || D.poderExigido({ porte: "átrio" }) > D.poderExigido({ porte: "andar" }));
  t("o arquipélago também está coberto", D.custoDeTomar({ porte: "fundeadouro" }) < D.custoDeTomar({ porte: "porto" }));
  t("a metrópole exige mais que a aldeia", D.poderExigido({ porte: "metropole" }) > D.poderExigido({ porte: "aldeia" }));
  t("e custa mais", D.custoDeTomar({ porte: "metropole" }) > D.custoDeTomar({ porte: "aldeia" }));
  t("e demora mais", D.diasDeTomar({ porte: "metropole" }) > D.diasDeTomar({ porte: "aldeia" }));
  t("nenhum porte se toma no mesmo dia", ["aldeia", "vila", "cidade", "capital", "metropole", "fortaleza"].every((p) => D.diasDeTomar({ porte: p }) >= 3));
  /* o teto do poder alcança tudo, ou haveria porte inalcançável para sempre */
  t("com a casa no topo, tudo é alcançável", ["aldeia", "vila", "cidade", "capital", "metropole", "fortaleza"].every((p) => D.poderExigido({ porte: p }) <= G.PODER_MAX));
}

sec("3B. DERIVAR NÃO PODE DESCALIBRAR O QUE JÁ ESTAVA CERTO");
{
  /* Três tabelas por nome viraram curvas nesta versão: o que uma cidade
     rende, quanto a gaveta do mercador tem, e quanto o porte mexe no preço.
     O risco de trocar tabela por curva é apagar de lambuja a calibragem que
     estava lá — e foi o que a primeira reta fez: mandou a vila de 5 para 12
     e a aldeia, no preço, de 0,70 para 1,01. As âncoras ficam medidas. */
  t("vila rende 5, como sempre rendeu", GE.rendaDeCidade({ porte: "vila" }) === 5);
  t("cidade rende 12", GE.rendaDeCidade({ porte: "cidade" }) === 12);
  t("capital rende ~25", Math.abs(GE.rendaDeCidade({ porte: "capital" }) - 25) <= 2);
  t("ruína rende 2", GE.rendaDeCidade({ porte: "ruina" }) === 2);
  t("e a sede continua rendendo o dobro", GE.rendaDeCidade({ porte: "vila", sede: true }) === 10);
  /* a única exceção à população, e ela se explica: pedágio não depende de
     quantos moram ali */
  t("a fortaleza rende além da sua gente", GE.rendaDeCidade({ porte: "fortaleza" }) > GE.rendaDeCidade({ porte: "vila" }) * 2);
  t("e continua nos 15 da tabela antiga", GE.rendaDeCidade({ porte: "fortaleza" }) === 15);
  /* e a Torre, que não existia em tabela nenhuma, entrou ordenada */
  t("o patamar rende menos que o átrio", GE.rendaDeCidade({ porte: "patamar" }) < GE.rendaDeCidade({ porte: "átrio" }));
  t("e menos que uma cidade — antes rendia igual", GE.rendaDeCidade({ porte: "patamar" }) < GE.rendaDeCidade({ porte: "cidade" }));
  /* o preço por porte, ancorado nos mesmos dois pontos de sempre */
  t("a aldeia continua barata", MC.fatorPorte({ porte: "aldeia" }) === 0.7);
  t("e a metrópole, cara", MC.fatorPorte({ porte: "metropole" }) === 1.5);
  t("e a Torre entrou entre as duas", MC.fatorPorte({ porte: "andar" }) > 0.7 && MC.fatorPorte({ porte: "andar" }) < 1.5);
  /* nenhuma das três curvas devolve lixo para um porte desconhecido */
  t("porte desconhecido não quebra a renda", GE.rendaDeCidade({ porte: "coisa-nova" }) > 0);
  t("nem o preço", MC.fatorPorte({ porte: "coisa-nova" }) === 1);
  t("nem a gaveta", CO.caixaDe({ id: "x", tipo: "geral" }, { porte: "coisa-nova" }, 1) > 0);
}

sec("4. A FAMA NÃO IMPEDE — COBRA");
{
  const conhecido = D.podeTomarCidade({ guilda: casa({ poder: 80, cofre: 9999 }), mandaNaCasa: true, cidade: CAPITAL, aqui: true, fama: 200 });
  const ninguem = D.podeTomarCidade({ guilda: casa({ poder: 80, cofre: 9999 }), mandaNaCasa: true, cidade: CAPITAL, aqui: true, fama: 0 });
  t("desconhecido ainda pode tomar", ninguem.pode === true);
  t("mas toma à revelia", ninguem.aRevelia === true);
  t("e quem é conhecido, não", conhecido.aRevelia === false);
  /* e a diferença aparece no humor com que a cidade nasce */
  t("à revelia a cidade nasce furiosa", D.humorAoTomar(true) < D.FURIA_ABAIXO_DE);
  t("e de outro modo, nasce tolerando", D.humorAoTomar(false) > D.FURIA_ABAIXO_DE);
  /* nascer furiosa significa que a revolta da v9.139 já começa a contar */
  t("nascer furiosa já arma a revolta", !!D.pulsoDaFuria(D.garantirGoverno(null), D.humorAoTomar(true), 1).furiaDesde);
  t("o envelope não amansa o povo", /não amanse/.test(D.envelopeDaTomada(CAPITAL, { aRevelia: true })));
  t("e o outro caso não vira festa", /sem festa e sem tragédia/.test(D.envelopeDaTomada(CAPITAL, { aRevelia: false })));
}

sec("5. NÃO ACONTECE NO CLIQUE");
{
  const tom = D.comecarATomar(VILA, 10, false);
  t("guarda a cidade e o dia", tom.cidade === "Pedra Torta" && tom.desde === 10);
  t("no mesmo dia, não está pronta", D.tomadaPronta(tom, VILA, 10) === false);
  t("nem no dia seguinte", D.tomadaPronta(tom, VILA, 11) === false);
  t("nem na véspera", D.tomadaPronta(tom, VILA, 9 + D.diasDeTomar(VILA)) === false);
  t("no prazo, está", D.tomadaPronta(tom, VILA, 10 + D.diasDeTomar(VILA)) === true);
  t("sem tomada, nada está pronto", D.tomadaPronta(null, VILA, 999) === false);
  /* e o App faz uma de cada vez */
  t("uma reivindicação por vez", /if \(tomandoRef\.current\) \{ pushMsgs/.test(APP));
  t("o cofre da casa paga", /cofre: Math\.max\(0, casa\.cofre - chk\.custo\)/.test(APP));
  t("e a cidade nasce no humor que a fama comprou", /felicidade: humorAoTomar\(aRevelia\)/.test(APP));
  t("e é salvo", /salvar\(\{ tomando: tomandoRef\.current \}\)/.test(APP));
}

sec("6. A CASA CRESCE — O NÚMERO PARADO");
{
  /* `poder` existia desde a v9.133 e NUNCA se mexia: nascia no mundo, nascia
     em 8 na casa fundada, e nada no jogo inteiro escrevia nele. Passou
     despercebido porque nada dependia dele. Agora depende. */
  t("crescer é uma operação que existe", typeof G.crescerACasa === "function");
  const g0 = G.garantirGuilda({ poder: 8, membro: true });
  t("cresce", G.crescerACasa(g0, 5).guilda.poder === 13);
  t("nunca passa do teto", G.crescerACasa(g0, 9999).guilda.poder === G.PODER_MAX);
  t("crescer zero não mexe", G.crescerACasa(g0, 0).guilda.poder === 8);
  /* a contribuição do membro engorda a casa: o mesmo ato dos dois lados */
  const depois = G.contribuirNaCasa(G.garantirGuilda({ poder: 8, membro: true, contribuicao: 0 }), 500).guilda;
  t("contribuir engorda a casa", depois.poder > 8);
  t("e ainda sobe o posto de quem contribuiu", depois.posto > 0);
  /* tomar uma cidade engrossa a casa, e o App faz isso */
  t("tomar uma cidade engorda a casa", G.CRESCE.dominio > 0 && /crescerACasa\(casa, CRESCE\.dominio/.test(APP));
  /* e uma casa fundada do zero chega lá: senão fundar seria um beco */
  let g = G.garantirGuilda({ poder: 8, membro: true, contribuicao: 0 });
  for (let i = 0; i < 40; i++) g = G.contribuirNaCasa(g, 500).guilda;
  t("uma casa fundada alcança uma vila", g.poder >= D.poderExigido({ porte: "vila" }));
}

sec("7. O CONVITE DEIXOU DE SER INVISÍVEL");
{
  /* o jogador procurou onde chamar alguém para a guilda e concluiu que não
     havia lugar nenhum: havia — escondido atrás do posto, sem uma linha
     dizendo isso. Recurso que some sem explicar é igual a recurso que não
     existe. */
  t("o bloco não depende mais do posto para aparecer", !/\{mandar && \(\s*<div className="pt-1">/.test(PAINEL));
  t("e sem posto, o painel diz o que falta", /Quem admite nesta casa é do terceiro degrau/.test(PAINEL));
  t("dizendo qual é o seu posto", /nomeDoPosto\(minha, minha\.posto\)/.test(PAINEL));
  t("o botão de admitir continua lá para quem manda", /onClick=\{\(\) => aoAdmitir\(p\)\}/.test(PAINEL));
  t("e o elenco vazio também se explica", /o elenco enche conforme você conhece gente/.test(PAINEL));
  /* e a regra de quem pode admitir não mudou: mandar continua sendo posto 3 */
  t("mandar continua sendo do terceiro degrau", G.podeMandar(G.garantirGuilda({ membro: true, posto: 2 })) === false);
  t("ou dono da casa", G.podeMandar(G.garantirGuilda({ membro: true, posto: 0, doJogador: true })) === true);
  t("quem está em prova não manda", G.podeMandar(G.garantirGuilda({ membro: true, posto: 4, emProva: true })) === false);
}

sec("8. O BOTÃO DE TOMAR APARECE, E EXPLICA");
{
  t("o painel recebe o veredito", /podeTomar = null/.test(PAINEL));
  t("mostra o custo e o prazo", /reivindicar \{podeTomar\.cidade\.nome\}/.test(PAINEL));
  t("mostra a reivindicação em curso", /podeTomar\.emCurso/.test(PAINEL));
  t("avisa quando ninguém sabe quem você é", /aceitaria a bandeira e não o dono/.test(PAINEL));
  /* e quando não dá, mostra o motivo em vez de sumir */
  t("e quando não dá, mostra o motivo", /\{podeTomar\.motivo\}/.test(PAINEL));
  t("o App entrega o veredito ao painel", /podeTomarAqui=\{minhaCasa\(\) \?/.test(APP));
}

console.log(`\ntomada v9.140: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
