/* O MOTOR DE GUILDAS (v9.133) — fase 4 do plano

   A guilda era `{ nivel, cofre }` dentro do App: um cofre e um botão de
   melhorar. Não existia arquivo, não existiam casas no mundo, não existia
   entrar, não existia posto. O jogador não geria nada — depositava.

   Duas regras decidem o desenho inteiro, e esta suíte existe para elas:

   1) LEI QUE O SISTEMA NÃO SABE CONFERIR É ADJETIVO. "Seja leal" não vale
      nada: não há como saber se foi quebrada, então quem julga vira o
      Narrador — e é disso que esta casa passou meses saindo. Toda lei daqui
      tem `ve()` lendo o estado do jogo, ou é cobrança automática.

   2) SÓ SE PERTENCE A UMA. Sem isso não há escolha: o jogador entraria em
      todas e a rivalidade viraria decoração. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const APP = readFileSync("../src/App.jsx", "utf8").replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const G = await import(S + "guildas.js");
const { gerarGeografia } = await import(S + "geografia.js");

let bons = 0, maus = 0;
const t = (nome, cond) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const SEM = "O Decimo Portao";
const mapa = gerarGeografia(SEM, null, null);
const casas = G.guildasDoMundo(SEM, mapa, "Fantasia medieval", null);
/* v9.134: entrar poe EM PROVA. Quem quer testar o que vem depois do
   ingresso passa por aqui — e a trava em si tem secao propria. */
const MUNDINHO = { cidades: mapa.cidades.slice(0, 5), gente: [{ nome: "Vantel" }, { nome: "Ione" }], criaturas: [{ nome: "Lobo" }], lugares: [{ nome: "A Capela" }] };
const aceito = (g, dia = 1) => ({ ...G.entrarNaCasa(g, { dia }), emProva: false });

sec("1. AS CASAS NASCEM COM O MUNDO");
{
  t("o mundo tem casas", casas.length >= 3);
  const b = G.guildasDoMundo(SEM, mapa, "Fantasia medieval", null);
  t("a mesma semente dá as mesmas casas", JSON.stringify(b) === JSON.stringify(casas));
  const outro = G.guildasDoMundo("outro", gerarGeografia("outro", null, null), "Fantasia medieval", null);
  t("sementes diferentes dão casas diferentes", JSON.stringify(outro) !== JSON.stringify(casas));
  t("nenhum ofício se repete", new Set(casas.map((g) => g.oficio)).size === casas.length);
  t("toda casa tem sede numa cidade do mapa", casas.every((g) => mapa.cidades.some((c) => c.nome === g.sede)));
  t("toda casa tem mestre, lema e membros", casas.every((g) => g.mestre && g.lema && g.membros.length >= 4));
  /* o nome tem de combinar com o ofício: a sonda gerou "A Mesa da Moeda"
     para escribas e "A Confraria Velha" para mercenários */
  t("o nome carrega a cabeça do ofício", casas.every((g) => g.nome.includes(G.oficioPorId(g.oficio).cabeca)));
  t("nenhuma nasce em guerra", casas.every((g) => !g.guerraCom));
}

sec("2. TODA LEI TEM LEITOR NO CÓDIGO");
{
  const leis = Object.values(G.LEIS);
  t("cinco leis", leis.length === 5);
  t("cada uma se descreve", leis.every((l) => typeof l.texto === "function" && l.texto({ dizimo: 10, presencaDias: 20, mensalidade: 5 }).length > 10));
  /* a regra desta versão: ou ela CONFERE, ou ela COBRA. Nenhuma é adjetivo. */
  t("ou confere, ou cobra — nenhuma é adjetivo", leis.every((l) => typeof l.ve === "function" || l.cobra === true));
  const g = aceito({ ...casas[0], leis: ["presenca", "exclusividade", "sangue"], presencaDias: 20, membros: [{ nome: "Torvald", posto: 1 }] });
  t("presença: sumir é falta", !!G.conferirLeisDaCasa(g, { dia: 40 }));
  t("presença: quem aparece não tem falta", !G.conferirLeisDaCasa({ ...g, vistoEm: 38 }, { dia: 40 }));
  t("exclusividade: contrato de fora é falta", !!G.conferirLeisDaCasa({ ...g, vistoEm: 40 }, { dia: 40, contratosDeFora: 1 }));
  t("sangue: matar irmão de casa é falta", !!G.conferirLeisDaCasa({ ...g, vistoEm: 40 }, { dia: 40, mortos: ["Torvald"] }));
  t("e a falta pesa mais que as outras", G.conferirLeisDaCasa({ ...g, vistoEm: 40 }, { dia: 40, mortos: ["Torvald"] }).peso >= 5);
  t("quem não é membro não responde a lei nenhuma", G.conferirLeisDaCasa(casas[0], { dia: 999 }) === null);
  /* na casa do jogador ele não se pune sozinho */
  t("o dono da casa não é punido por ela", G.conferirLeisDaCasa({ ...g, doJogador: true }, { dia: 999 }) === null);
}

sec("3. ENTRAR É UM ATO, E PODE SER RECUSADO");
{
  const casa = casas.find((g) => G.oficioPorId(g.oficio).entrada.taxa > 0) || casas[0];
  const of = G.oficioPorId(casa.oficio);
  t("sem a taxa, a porta não abre", G.podeEntrarNaCasa(casa, { nivel: 9, moedas: 0 }).ok === false);
  t("com a taxa, abre", G.podeEntrarNaCasa(casa, { nivel: 9, moedas: 9999 }).ok === true);
  /* SÓ SE PERTENCE A UMA */
  t("quem já tem casa não entra noutra", G.podeEntrarNaCasa(casa, { nivel: 9, moedas: 9999 }, { jaEDeOutra: "A Casa Franca" }).ok === false);
  t("casa em guerra não aceita de fora", G.podeEntrarNaCasa({ ...casa, guerraCom: "x" }, { nivel: 9, moedas: 9999 }).ok === false);
  t("e o nível de entrada é respeitado", G.podeEntrarNaCasa({ ...casa, oficio: "arcana" }, { nivel: 1, moedas: 9999 }).ok === false);
  const r = G.podeEntrarNaCasa(casa, { nivel: 9, moedas: 9999 });
  /* a prova nao sai daqui: montar uma precisa do mundo, e `podeEntrar` so
     responde se a porta abre. Ela tem secao propria logo abaixo. */
  t("a resposta diz a taxa, e nao promete o que nao monta", r.taxa >= 0 && r.prova === undefined);
  const dentro = G.entrarNaCasa(casa, { dia: 5 });
  t("entrou no degrau de baixo", dentro.membro && dentro.posto === 0);
  t("e o relógio da presença começa agora", dentro.vistoEm === 5);
}

sec("3b. EM PROVA: NA CASA SEM SER DA CASA");
{
  const dentro = G.entrarNaCasa(casas[0], { dia: 5 });
  t("entrar poe em prova", dentro.emProva === true);
  /* era um titulo e uma frase, e o jogador entrava assim mesmo */
  const pv = G.provaDeIngresso(dentro, MUNDINHO);
  t("a prova e um trabalho com etapa que o motor confere", !!pv && pv.etapas.length === 1 && !!pv.etapas[0].tipo);
  t("e e de recruta, nao de capitao", pv.nivel === 1);
  t("nao paga em moeda — paga em ser aceito", pv.paga === 0 && pv.contribui > 0);
  t("vem marcada como prova", pv.prova === true);
  /* e a trava */
  t("em prova nao ha trabalho da casa", G.trabalhosDaCasa(dentro, { semente: SEM, dia: 9, nivel: 5, ...MUNDINHO }).length === 0);
  t("em prova nao se manda em ninguem", G.podeDelegar(dentro) === 0 && !G.podeMandar(dentro));
  t("passada a prova, a casa abre", G.trabalhosDaCasa({ ...dentro, emProva: false }, { semente: SEM, dia: 9, nivel: 5, ...MUNDINHO }).length > 0);
  t("sair limpa a prova junto", G.sairDaCasa(dentro).emProva === false);
  /* sem mundo para apontar, nao ha prova — e melhor nenhuma do que uma
     prova que manda a lugar nenhum */
  t("sem alvo no mundo, a prova nao nasce", G.provaDeIngresso(dentro, {}) === null);
}

sec("4. SUBIR CUSTA CONTRIBUIÇÃO, E O POSTO DESTRAVA COISA");
{
  let g = aceito(casas[0]);
  t("no degrau zero não se manda em ninguém", G.podeDelegar(g) === 0);
  t("nem se toca no cofre", G.degrauDaCasa(g.posto).saque === 0);
  const r1 = G.contribuirNaCasa(g, 70); g = r1.guilda;
  t("70 sobe um degrau", r1.subiu && g.posto === 1);
  const r2 = G.contribuirNaCasa(g, 130); g = r2.guilda;
  t("e a partir do terceiro se manda em alguém", g.posto === 2 && G.podeDelegar(g) === 1);
  g = G.contribuirNaCasa(g, 900).guilda;
  t("o topo é o topo", g.posto === G.DEGRAUS.length - 1);
  t("e não passa disso", G.contribuirNaCasa(g, 9999).subiu === null);
  t("quem não é membro não contribui", G.contribuirNaCasa(casas[1], 500).guilda.contribuicao === 0);
  t("cada degrau tem nome do ofício", G.nomeDoPosto(g, 4) === G.oficioPorId(g.oficio).postos[4]);
}

sec("5. QUEBRAR A LEI DERRUBA, E DERRUBA ATÉ A RUA");
{
  let g = G.contribuirNaCasa(aceito(casas[0]), 500).guilda;
  const posto0 = g.posto;
  let expulso = false, caiu = 0;
  for (let i = 0; i < 10 && !expulso; i++) {
    const r = G.punirNaCasa(g, { falta: "sumiu", peso: 1 });
    g = r.guilda; if (r.caiu) caiu += 1; expulso = r.expulso;
  }
  t("faltas derrubam o posto", caiu > 0);
  t("e a porta da rua existe", expulso === true);
  t("quem foi expulso não é mais membro", g.membro === false);
  t("faltar sem ser membro não faz nada", G.punirNaCasa(casas[0], { falta: "x", peso: 9 }).guilda.faltas === 0);
}

sec("6. O DÍZIMO É COBRANÇA, NÃO INFRAÇÃO");
{
  const g = aceito({ ...casas[0], leis: ["dizimo"], dizimo: 15 });
  t("cobra o que a casa manda", G.dizimoDe(g, 200) === 30);
  t("quem não é membro não paga", G.dizimoDe({ ...g, membro: false }, 200) === 0);
  t("casa sem a lei não cobra", G.dizimoDe({ ...g, leis: ["presenca"] }, 200) === 0);
}

sec("7. O TRABALHO DA CASA TEM A CARA DO OFÍCIO");
{
  const g = G.contribuirNaCasa(aceito(casas[0]), 500).guilda;
  const ts = G.trabalhosDaCasa(g, {
    semente: SEM, dia: 9, nivel: 6,
    cidades: mapa.cidades.slice(0, 5), gente: [{ nome: "Vantel" }, { nome: "Ione" }],
    criaturas: [{ nome: "Lobo" }], lugares: [{ nome: "A Capela" }],
  });
  t("a casa oferece trabalho", ts.length >= 2);
  t("toda etapa é do vocabulário que o motor confere", ts.every((x) => x.etapas.every((e) => ["ir_a", "derrotar", "falar_com", "revelar", "achar", "levar_a"].includes(e.tipo))));
  t("todo trabalho rende contribuição", ts.every((x) => x.contribui > 0));
  t("e paga", ts.every((x) => x.paga > 0));
  /* a sonda devolveu dois "peregrino" no mesmo lote */
  t("nada de dois do mesmo molde no mesmo lote", new Set(ts.map((x) => x.icone)).size === ts.length);
  t("o posto limita o nível do trabalho", ts.every((x) => x.nivel <= G.degrauDaCasa(g.posto).nivelMax));
  const recruta = aceito(casas[0]);
  const tr = G.trabalhosDaCasa(recruta, { semente: SEM, dia: 9, nivel: 12, cidades: mapa.cidades.slice(0, 5), gente: [{ nome: "V" }], criaturas: [{ nome: "L" }], lugares: [{ nome: "C" }] });
  t("e um recruta não recebe o contrato que mata o capitão", tr.every((x) => x.nivel <= 2));
  t("sem casa, não há trabalho da casa", G.trabalhosDaCasa(casas[1], { semente: SEM, cidades: mapa.cidades }).length === 0);
  /* EM GUERRA a casa só quer uma coisa */
  const guerra = G.trabalhosDaCasa({ ...g, guerraCom: "x" }, { semente: SEM, dia: 9, nivel: 6, cidades: mapa.cidades.slice(0, 5), gente: [{ nome: "V" }], criaturas: [{ nome: "L" }], lugares: [{ nome: "C" }] });
  t("em guerra, o primeiro trabalho é a guerra", guerra[0] && guerra[0].guerra === true && guerra[0].paga > 0);
}

sec("8. DELEGAR CUSTA GENTE, TEMPO E RISCO");
{
  let g = G.contribuirNaCasa(aceito(casas[0]), 500).guilda;
  const trabalho = { titulo: "A caçada", paga: 100, contribui: 40, nivel: 5 };
  const r = G.delegarNaCasa(g, trabalho, g.membros[0].nome, { dia: 10 });
  t("dá para mandar alguém", r.ok === true);
  t("quem foi sai da casa enquanto isso", r.guilda.membros[0].fora === true);
  t("a tarefa leva dias", r.tarefa.dias >= 2);
  t("e tem chance de dar errado", r.tarefa.chance < 100 && r.tarefa.chance > 0);
  t("não dá para mandar quem já saiu", G.delegarNaCasa(r.guilda, trabalho, g.membros[0].nome, { dia: 10 }).ok === false);
  /* no degrau de baixo ninguém obedece */
  t("recruta não manda em ninguém", G.delegarNaCasa(aceito(casas[0]), trabalho, casas[0].membros[0].nome, {}).ok === false);
  const feito = G.resolverTarefaDaCasa(r.tarefa, () => 0.01);
  const perdido = G.resolverTarefaDaCasa(r.tarefa, () => 0.99);
  t("o dado decide o desfecho", feito.desfecho === "feito" && perdido.desfecho === "perdido");
  t("todo desfecho sabe se dizer", Object.values(G.DESFECHO_TAREFA).every((d) => d.diz({ quem: "X", titulo: "Y" }).length > 8));
}

sec("9. A GUERRA VEM DE FATO, E AS PAZES CUSTAM");
{
  let g = aceito(casas[0]);
  const outra = { ...casas[1], membros: [{ nome: "Bruna" }, { nome: "Caio" }] };
  const s1 = G.sangueEntreCasas(g, [outra], []);
  t("sem mortos, sem atrito", s1.viradas.length === 0);
  const s2 = G.sangueEntreCasas(g, [outra], ["Bruna"]);
  t("um morto sobe o atrito", (s2.guilda.atrito[outra.id] || 0) >= G.ATRITO_POR_MORTE);
  /* o mesmo defunto não pode subir o atrito todo dia */
  const s3 = G.sangueEntreCasas(s2.guilda, [outra], ["Bruna"]);
  t("o mesmo morto não conta duas vezes", (s3.guilda.atrito[outra.id] || 0) === (s2.guilda.atrito[outra.id] || 0));
  t("mas um morto novo conta", (G.sangueEntreCasas(s3.guilda, [outra], ["Bruna", "Caio"]).guilda.atrito[outra.id] || 0) > (s2.guilda.atrito[outra.id] || 0));
  /* a escada do atrito */
  t("a faixa tem quatro degraus", ["paz", "arranhão", "rivalidade", "guerra"].every((f) => [0, 30, 60, 90].some((n) => G.faixaDeAtrito(n) === f)));
  const gu = G.atritar(g, "x", 95, "teste");
  t("o teto do atrito é guerra", gu.guilda.guerraCom === "x");
  t("e as pazes desfazem", G.fazerAsPazes(gu.guilda, "x").guerraCom === "");
  t("mas o atrito não zera de graça", (G.fazerAsPazes(gu.guilda, "x").atrito.x || 0) > 0);
}

sec("10. FUNDAR É A FORMATURA");
{
  t("cedo demais não funda", G.podeFundarCasa({ nivel: G.NIVEL_PARA_FUNDAR - 1, moedas: 99999 }, { cidade: "X" }).ok === false);
  t("sem ouro não funda", G.podeFundarCasa({ nivel: 20, moedas: 0 }, { cidade: "X" }).ok === false);
  t("servindo em outra não funda", G.podeFundarCasa({ nivel: 20, moedas: 99999 }, { cidade: "X", jaEDeOutra: "A Casa" }).ok === false);
  t("sem cidade não funda", G.podeFundarCasa({ nivel: 20, moedas: 99999 }, {}).ok === false);
  t("com tudo, funda", G.podeFundarCasa({ nivel: 20, moedas: 99999 }, { cidade: "Prata Velha" }).ok === true);
  const minha = G.fundarCasa({ nome: "A Mesa Quebrada", oficio: "laminas", cidade: "Prata Velha", mestre: "Íris", dia: 40, grupo: [{ nome: "Kael" }] });
  t("nasce no topo da própria casa", minha.posto === 4 && minha.doJogador);
  t("e o grupo entra com ela", minha.membros.some((m) => m.nome === "Kael"));
  t("quem funda manda", G.podeMandar(minha));
  t("admitir funciona", G.admitirNaCasa(minha, { nome: "Zulmira" }).ok === true);
  t("expulsar também", G.expulsarDaCasa(G.admitirNaCasa(minha, { nome: "Zulmira" }).guilda, "Zulmira").ok === true);
  t("não se admite duas vezes", G.admitirNaCasa(G.admitirNaCasa(minha, { nome: "Z" }).guilda, { nome: "Z" }).ok === false);
  t("nem se expulsa quem não é da casa", G.expulsarDaCasa(minha, "Ninguém").ok === false);
  /* mandar exige posto: um recruta não promove ninguém */
  t("recruta não manda", !G.podeMandar(aceito(casas[0])));
}

sec("11. LIGADA AO JOGO");
{
  t("as casas nascem com o mundo", /guildasRef\.current = guildasDoMundo\(sementeMundo\(\)/.test(APP));
  t("e viajam no save", /guildas: guildasRef\.current/.test(APP));
  t("save antigo reestende as casas da semente", /Array\.isArray\(sv\.guildas\) && sv\.guildas\.length/.test(APP));
  t("a minha casa é a que tem `membro`", /\(guildasRef\.current \|\| \[\]\)\.find\(\(g\) => g\.membro\)/.test(APP));
  t("o dízimo é cobrado quando a missão da casa fecha", /const d = dizimoDe\(casa, rec\.moedas\)/.test(APP));
  t("e o serviço feito rende posto", /contribuirNaCasa\(\{ \.\.\.casa, cofre: casa\.cofre \+ d \}, m\.contribui/.test(APP));
  t("a lei corre por dia", /conferirLeisDaCasa\(casaAgora, \{ dia: diaRef\.current/.test(APP));
  t("as tarefas voltam por dia", /resolverTarefaDaCasa\(t\)/.test(APP));
  t("o sangue entre casas também", /sangueEntreCasas\(c3, guildasRef\.current/.test(APP));
  t("e pertencer a uma casa chega à Pauta", /porNaPauta\(p, "onde", envelopeDaGuilda\(casa\)\)/.test(APP));
  t("o painel existe", /<PainelGuilda/.test(APP));
}


sec("O VEREDITO ANTES DO CLIQUE (v9.188)");
{
  /* Ao redesenhar `painel-guilda-v2` a partir do que o painel faz, apareceu
     o buraco: prazo e chance eram calculados DENTRO de `delegarNaCasa`, e
     por isso só existiam depois de a pessoa já ter saído porta afora. O
     jogador escolhia o trabalho sem saber se perdia alguém por um dia ou
     por quatro, e escolhia o membro sem saber a chance dele. As duas contas
     saem de dados que a tela já tem — o nível do trabalho e o posto do
     membro. Esconder era escolha, não limite. */
  const { readFileSync } = await import("node:fs");
  const semComentarios = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const PAINEL = semComentarios(readFileSync("../src/painel-guilda.jsx", "utf8"));

  t("o prazo tem nome próprio", typeof G.diasDoTrabalho === "function");
  t("e a chance também", typeof G.chanceDoMembro === "function");
  /* o prazo depende só do trabalho: 1 + teto(nível / 3) */
  t("o mínimo são dois dias — ninguém volta no mesmo dia", G.diasDoTrabalho({ nivel: 1 }) === 2);
  t("um de nível 3 leva 2", G.diasDoTrabalho({ nivel: 3 }) === 2);
  t("um de nível 9 leva 4", G.diasDoTrabalho({ nivel: 9 }) === 4);
  t("e lixo cai no mínimo em vez de quebrar", G.diasDoTrabalho(null) === 2 && G.diasDoTrabalho({}) === 2);
  /* a chance sobe com o posto e desce com a dificuldade */
  t("posto melhor, chance melhor", G.chanceDoMembro({ posto: 3 }, { nivel: 2 }) > G.chanceDoMembro({ posto: 1 }, { nivel: 2 }));
  t("trabalho mais duro, chance pior", G.chanceDoMembro({ posto: 2 }, { nivel: 9 }) < G.chanceDoMembro({ posto: 2 }, { nivel: 1 }));
  t("nunca passa de 90", G.chanceDoMembro({ posto: 20 }, { nivel: 1 }) === 90);
  t("nem cai abaixo de 15", G.chanceDoMembro({ posto: 0 }, { nivel: 40 }) === 15);

  /* UMA RÉGUA SÓ: delegar tem de dar exatamente o número que a tela mostrou */
  const casa = G.garantirGuilda({
    id: "c1", nome: "A Corda", oficio: "laminas", membro: true, posto: 3, sede: "Vila",
    membros: [{ nome: "Doran", posto: 2, papel: "veterano", fora: false }],
  });
  const trabalho = { id: "t1", titulo: "Escoltar", nivel: 6, paga: 100, contribui: 8 };
  const d = G.delegarNaCasa(casa, trabalho, "Doran", { dia: 4 });
  t("delegar funciona", d.ok === true);
  t("e o prazo da tarefa é o mesmo que a tela mostrou", d.tarefa.dias === G.diasDoTrabalho(trabalho));
  t("e a chance também", d.tarefa.chance === G.chanceDoMembro({ posto: 2 }, trabalho));

  /* E A TELA MOSTRA OS DOIS ANTES DO CLIQUE */
  t("o cartão do trabalho diz o prazo", /\{diasDoTrabalho\(t\)\} dia\{diasDoTrabalho\(t\) > 1 \? "s" : ""\}/.test(PAINEL));
  t("cada membro da lista diz a chance dele", /const ch = chanceDoMembro\(m, t\);/.test(PAINEL) && /\{ch\}%/.test(PAINEL));
  t("e a chance vem colorida pela faixa", /ch >= 65 \? T\.ok : ch >= 40 \? T\.amberSoft : T\.danger/.test(PAINEL));
  /* e o painel não recalcula nada por conta própria */
  t("o painel não tem régua própria", !/45 \+ .*12 - .*3/.test(PAINEL) && !/1 \+ Math\.ceil/.test(PAINEL));
}
console.log(`\nguildas v9.133: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
