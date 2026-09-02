/* O ENIGMA E A VIRADA DO CHEFE (v9.151)

   Eram os dois últimos lugares da masmorra em que a IA arbitrava.

   O ENIGMA era o pior dos dois, porque o envelope pedia TRÊS coisas que
   não são do Narrador: inventar a tranca, ouvir a resposta do jogador e
   julgar se ela servia. E o sintoma não é abstrato — um enigma julgado
   por quem quer contar uma boa cena abre quando a cena precisa que abra,
   e o jogador aprende em duas masmorras que basta escrever com
   confiança.

   O CHEFE já tinha o desgaste, que resolve o ANTES do confronto. O
   durante era um saco de pontos de vida: a mesma coisa do primeiro ao
   último golpe.

   O QUE ESTA SUÍTE PROTEGE, nos dois casos, é a mesma linha: a decisão
   tem de mudar um NÚMERO que o sistema usa. Uma virada que só muda a
   prosa é o Narrador dizendo "ele fica mais perigoso", e o jogador não
   sente nada. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const M = await import(S + "masmorras.js");
const APP = readFileSync("../src/App.jsx", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. A TRANCA DECLARA QUAL FERRAMENTA A ABRE");
{
  t("são quatro trancas", M.TRANCAS.length === 4);
  /* a pergunta deixa de ser "o jogador é esperto?" e passa a ser "o
     PERSONAGEM tem a ferramenta?", que é a pergunta que um RPG faz */
  const attrs = M.TRANCAS.map((x) => x.atributo);
  t("cada uma pede um atributo diferente", new Set(attrs).size === 4);
  t("e nenhuma pede força bruta só", !attrs.includes("forca"));
  t("toda tranca tem três pistas", M.TRANCAS.every((x) => x.dicas.length === 3));
  t("e nenhuma pista é vazia", M.TRANCAS.every((x) => x.dicas.every((d) => d && d.length > 15)));
  /* o artigo sai da tabela: "A mecanismo" foi o que a primeira versão
     escreveu, e concordância errada na única frase que o jogador sabe
     que não foi a IA que escreveu estraga mais do que parece */
  t("toda tranca traz o próprio artigo", M.TRANCAS.every((x) => !!x.artigo));
  t("o mecanismo é O", M.trancaPorId("mecanismo").artigo === "O");
  t("a inscrição é A", M.trancaPorId("inscricao").artigo === "A");
  t("id desconhecido não quebra", !!M.trancaPorId("nao-existe"));
}

sec("2. FALHAR É PROGRESSO — a regra que define o módulo");
{
  /* uma sala trancada que o jogador não consegue passar é uma campanha
     morta; um enigma que se resolve num dado só não é enigma, é uma
     fechadura */
  const dcs = [0, 1, 2, 3].map((n) => M.dificuldadeDoEnigma(16, n));
  t("a dificuldade cai a cada pista", dcs[0] > dcs[1] && dcs[1] > dcs[2]);
  t("e cai de dois em dois", dcs[0] - dcs[1] === M.ALIVIO_POR_DICA);
  /* o piso existe porque a última pista praticamente diz a resposta: dali
     em diante é formalismo, e formalismo que trava a campanha é pior do
     que não ter enigma */
  t("há um piso", M.dificuldadeDoEnigma(16, 99) === 8);
  t("e o piso não é zero", M.dificuldadeDoEnigma(5, 99) >= 8);

  let sala = { id: 3, tranca: "mecanismo", tentativasEnigma: 0 };
  const vistas = [];
  for (let i = 0; i < 3; i++) {
    const dc = M.dificuldadeDoEnigma(16, sala.tentativasEnigma);
    const r = M.tentarEnigma(sala, { total: 10, dc });
    t(`tentativa ${i + 1} falha e ensina`, !r.abriu && !!r.dica);
    vistas.push(r.dica);
    sala = { ...sala, tentativasEnigma: r.tentativa };
  }
  t("as três pistas são diferentes", new Set(vistas).size === 3);
  /* o rolo tem de FALHAR: a primeira versão desta linha passou um total
     acima do alvo, o enigma abriu, e ela mediu `semMaisDicas` num caso
     que nunca chega a procurar pista nenhuma. */
  const seca = M.tentarEnigma(sala, { total: 5, dc: 20 });
  t("depois das três, a sala não tem mais o que ensinar", !seca.abriu && seca.semMaisDicas && !seca.dica);
  /* e o mesmo rolo que falhava passa quando as pistas baixaram o alvo */
  t("o mesmo 12 que falhava acaba passando",
    !M.tentarEnigma({ tranca: "peso", tentativasEnigma: 0 }, { total: 12, dc: M.dificuldadeDoEnigma(15, 0) }).abriu
    && M.tentarEnigma({ tranca: "peso", tentativasEnigma: 2 }, { total: 12, dc: M.dificuldadeDoEnigma(15, 2) }).abriu);
}

sec("3. O ENIGMA CUSTA TEMPO, QUE AQUI EMBAIXO É TOCHA");
{
  /* examinar uma tranca custa o que examinar um quarto custa: números
     diferentes para o mesmo gesto seriam duas regras */
  t("dez minutos por tentativa", M.MINUTOS_POR_TENTATIVA === 10);
  t("e a tentativa devolve o custo", M.tentarEnigma({ tranca: "padrao" }, { total: 1, dc: 20 }).minutos === 10);
  t("o App cobra esse tempo", /avancarMinutos\(MINUTOS_POR_TENTATIVA\)/.test(APP));
  t("toda sala de enigma nasce com tranca", (() => {
    for (let i = 0; i < 60; i++) {
      const mm = M.gerarMasmorra("Fantasia medieval", 6);
      for (const s of mm.salas.filter((x) => x.tipo === "enigma")) if (!s.tranca) return false;
    }
    return true;
  })());
  t("e com o contador zerado", M.gerarMasmorra("Fantasia medieval", 6).salas.filter((s) => s.tipo === "enigma").every((s) => s.tentativasEnigma === 0));
}

sec("4. O NARRADOR NARRA, E NÃO JULGA MAIS");
{
  const e = M.trancaPorId("inscricao");
  const abriu = M.envelopeDoEnigma({ abriu: true, tentativa: 2, rotulo: e.rotulo }, e, "Cripta · camada 2");
  const nao = M.envelopeDoEnigma({ abriu: false, tentativa: 1, rotulo: e.rotulo, dica: e.dicas[0] }, e, "Cripta · camada 2");
  t("diz que o sistema resolveu", /RESOLVIDO PELO SISTEMA/.test(abriu));
  t("no sucesso, proíbe inventar outro enigma", /NÃO invente um enigma diferente/.test(abriu));
  t("e proíbe creditar a solução a mim", /NÃO explique a solução como se fosse minha ideia/.test(abriu));
  /* NO FRACASSO É QUE ESTAVA O BURACO: o envelope antigo deixava a IA
     decidir se a minha resposta servia, e ela servia sempre que a cena
     ficava melhor assim */
  t("no fracasso, proíbe abrir", /NÃO abra a passagem/.test(nao));
  t("proíbe revelar a solução", /NÃO revele a solução/.test(nao));
  t("proíbe a saída alternativa de consolo", /NÃO ofereça uma saída alternativa/.test(nao));
  t("e proíbe a resposta escapar na descrição", /NÃO deixe a resposta escapar/.test(nao));
  /* a pista entra na ficção como OBSERVAÇÃO minha, não como resposta */
  t("a pista aparece, e como observação", /mostre na ficção a coisa que eu notei/.test(nao));
  t("sem rolagem, sem envelope", M.envelopeDoEnigma(null, e) === "");
  /* a frase antiga não pode voltar */
  t("o App não pede mais o enigma à IA", !/Apresente a cena e o desafio NA FICÇÃO/.test(APP));
  t("e o enigma passa pelo canal de rolagem de sempre", /origem: "enigma"/.test(APP));
  /* A PROVA NO JOGO PEGOU AS DUAS: a tela do dado escreve "Teste de " na
     frente do rotulo, e o resultado era "Teste de O padrao" — o artigo
     serve a FALA ("O padrao cede"), que e outra frase. E o desfecho nao
     gravava: o estado em memoria ficava certo, a HUD atualizava, e uma
     recarga perdia a tentativa que custou dez minutos de tocha. */
  t("o rotulo da rolagem nao leva artigo", /rotulo: e.rotulo,/.test(APP));
  t("e o desfecho grava antes de falar com a rede",
    APP.indexOf("salvar({});", APP.indexOf("const resolverEnigma")) < APP.indexOf("enviar(envelopeDoEnigma"));
}

sec("4b. E HÁ COMO TENTAR DE NOVO — o buraco que a prova no jogo achou");
{
  /* O enigma abria a rolagem ao ENTRAR na sala, e só. Falhando, a pista
     aparecia, a dificuldade da proxima caia — e nao havia como fazer a
     proxima: o jogador teria de sair e voltar, gastando uma tocha para
     reabrir uma porta que ele nunca fechou.

     "Falhar e progresso" nao vale nada se o progresso nao tem botao. E o
     defeito e da classe mais cara: build limpo, suite verde, e a mecanica
     correta e inutil — porque nenhuma das duas redes olha para o que a
     tela OFERECE. */
  t("o botão de tentar de novo existe", APP.includes("Tentar {e.artigo.toLowerCase()} {e.rotulo} de novo"));
  t("só na sala de enigma", APP.includes('aqui.tipo !== "enigma" || aqui.resolvida) return null'));
  t("e ele diz o que já foi ganho", APP.includes("na dificuldade"));
  t("chamando o mesmo caminho da entrada", APP.includes("onClick={() => abrirEnigma(aqui)}"));
}

sec("5. A VIRADA DO CHEFE MUDA UM NÚMERO, E NÃO UM ADJETIVO");
{
  const chefe = { nome: "Colosso", ameaca: "elite", vida: 100, vidaMax: 100, defesa: 14 };
  /* a AMEAÇA é a maior das quatro porque manda em três lugares de uma
     vez: acerto, dano e quantos golpes por rodada */
  const f = M.aplicarVirada(chefe, "enfurece");
  t("enfurecer sobe a ameaça", f.chefe.ameaca === "lendario");
  t("encourar soma defesa", M.aplicarVirada(chefe, "encoura").chefe.defesa === 17);
  t("chamar traz corpo novo", M.aplicarVirada(chefe, "chama").capangas.length === 1);
  t("e o corpo novo vem marcado", M.aplicarVirada(chefe, "chama").capangas[0].chamado === true);
  const cur = M.aplicarVirada({ ...chefe, vida: 20 }, "reergue");
  t("reerguer devolve vida", cur.chefe.vida > 20);
  /* a única que pode frustrar, e por isso a única com teto */
  t("mas nunca acima da metade", M.aplicarVirada({ ...chefe, vida: 49 }, "reergue").chefe.vida <= 50);
  t("nenhuma virada mexe no vidaMax", M.VIRADAS.every((v) => M.aplicarVirada(chefe, v.id).chefe.vidaMax === 100));
  t("virada desconhecida não quebra", !!M.aplicarVirada(chefe, "nao-existe").chefe);
}

sec("6. O MESMO CHEFE VIRA SEMPRE IGUAL");
{
  /* como a índole das pessoas e a altura das paredes: sorteio a cada luta
     apagaria o saber de quem já lutou com ele, e não daria nada em troca */
  t("determinístico pelo nome", JSON.stringify(M.fasesDoChefe("Colosso")) === JSON.stringify(M.fasesDoChefe("Colosso")));
  t("e nomes diferentes viram diferente", JSON.stringify(M.fasesDoChefe("Colosso")) !== JSON.stringify(M.fasesDoChefe("Horror")));
  /* repetir "endurece" duas vezes seria a mesma luta duas vezes, e o
     segundo limiar existe para o jogador ter de mudar de plano de novo */
  const nomes = ["Colosso", "Horror", "Comandante", "Troll", "Lich", "Ogro", "Dragão Jovem", "Sentinela Blindada"];
  t("nunca repete a virada no mesmo chefe", nomes.every((n) => { const f = M.fasesDoChefe(n); return f[0].virada !== f[1].virada; }));
  t("são sempre dois limiares", nomes.every((n) => M.fasesDoChefe(n).length === 2));
  t("metade e um quarto", M.LIMIARES.join(",") === "0.5,0.25");
  /* três viradas numa luta de seis rodadas seria virar quase todo turno,
     e surpresa que acontece sempre deixa de ser surpresa */
  t("e não são três", M.LIMIARES.length === 2);
  t("as quatro viradas aparecem no mundo", new Set(nomes.flatMap((n) => M.fasesDoChefe(n).map((x) => x.virada))).size === 4);
}

sec("7. O LIMIAR SE CRUZA UMA VEZ SÓ");
{
  const chefe = { nome: "Colosso", ameaca: "elite", vida: 100, vidaMax: 100, defesa: 14 };
  t("cruzar 50% vira", !!M.viradaAoCruzar(chefe, 60, 45, []));
  t("chegar perto não vira", !M.viradaAoCruzar(chefe, 60, 55, []));
  t("e já ter virado não vira de novo", !M.viradaAoCruzar(chefe, 60, 45, [0.5]));
  /* um golpe grande pode cruzar os dois de uma vez, e aí vale o mais
     fundo: o chefe não faz duas cenas no mesmo instante */
  const dobro = M.viradaAoCruzar(chefe, 90, 20, []);
  t("golpe que cruza os dois pega o mais fundo", dobro && dobro.em === 0.25);
  t("morto não vira", !M.viradaAoCruzar(chefe, 30, 0, []));
  t("sem vidaMax não vira", !M.viradaAoCruzar({ nome: "x", vida: 5 }, 10, 5, []));
  t("lixo não derruba", M.viradaAoCruzar(null, 1, 0, null) === null);
}

sec("8. A COSTURA, NOS DOIS GOLPES");
{
  /* o risco aqui não é a duplicação — é o esquecimento: quem acrescentar
     um terceiro caminho de golpe amanhã não vai lembrar disto */
  t("a regra mora numa função só", (APP.match(/const virarChefeSePreciso = /g) || []).length === 1);
  t("e os dois comites a chamam", (APP.match(/virarChefeSePreciso\(comb\.inimigos,/g) || []).length === 2);
  t("nenhum comite de golpe ficou sem ela",
    !/inimigos: (col\.lista|locais), economia: comb\.economia/.test(APP));
  /* fases são da masmorra: uma briga de estrada não tem chefe, e virar
     ali seria o sistema inventando um confronto que ninguém montou */
  t("só vale na sala do chefe", /sala\.tipo !== "chefe"\) return depois/.test(APP));
  t("e o capanga chamado não é confundido com o chefe", /!e\.chamado && !e\.derrotado/.test(APP));
  t("o que já virou fica gravado no inimigo", /viradasFeitas: \[\.\.\.\(alvo\.viradasFeitas \|\| \[\]\), v\.em\]/.test(APP));
  /* o nome diz de quem é a virada: três módulos já tinham "virada", e a
     colisão quebrou o build na hora */
  t("o nome do chefe é explícito", /falaDaViradaDoChefe/.test(APP));
  t("e o do vilão continua sendo dele", /envelopeDaVirada\(v\.situacao/.test(APP));
}

console.log(`\nenigma e chefe v9.151: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
