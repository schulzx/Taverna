/* ============================================================
   A PAUTA DO TURNO (v9.104) — o Mestre passa os pontos

   "O mestre será tão completo e instruído que poderia até tocar a
   história sozinho, e o narrador virá com toda sua criatividade apenas
   ligando os pontos que o mestre passou e dizendo como aconteceu."

   Até aqui o Mestre falava em ENVELOPES SOLTOS, empilhados em `notaRef`
   na ordem em que cada sistema resolvia acordar. Funciona, está testado,
   e tem dois defeitos que só aparecem quando se olha de longe:

   1) NÃO ESCALA. Cada conselheiro novo empilha mais um envelope, e o
      turno vai ficando mais longo sem que ninguém decida que ele ficou.
      Não existe teto para o que o Mestre diz por turno — nunca existiu.

   2) NÃO TEM ORDEM. O Narrador recebe a forma da cena antes de saber
      onde ela acontece, e o veto depois de já ter lido a instrução que
      o veto contradiz. Ordem importa para quem lê.

   A Pauta é a mesma informação em uma peça só, ordenada, com orçamento
   e corte por prioridade — como o léxico já faz com o próprio bloco.

   ---------------- O QUE ELA NÃO É ----------------

   Ela NÃO é um lugar novo para o Mestre inventar coisas. Toda seção é
   preenchida por um sistema que já decidiu — a Pauta não decide nada.
   E ela não substitui os envelopes de uma vez: nasce com o Geógrafo
   dentro e cada sistema se muda para cá quando chegar a vez dele.
   Trocar dez envelopes de casa num dia só seria refazer o trabalho de
   dez sistemas ao mesmo tempo, sem nenhum deles provado no lugar novo.

   ---------------- A REGRA QUE PROTEGE O NARRADOR ----------------

   A Pauta diz O QUE e COM QUEM. Nunca o COMO. Nenhuma seção descreve
   cheiro, escolhe adjetivo ou escreve fala — se uma linha da Pauta pode
   ser copiada para a narração como está, ela está errada.
   ============================================================ */

/* ---------------- O FERRO (MM16 nº 5, 05/10) ----------------

   A PRIORIDADE ABAIXO DE TODAS. O que corta aqui só cede depois de tudo o
   resto ter cedido — e por isso só pode morar aqui o que é do turno, curto
   e insubstituível:

   · o DESFECHO (o fato de quem caiu e o COMO que o jogador escreveu) e o
     veto de quem caiu (`vetoDoDesfecho`) — é o que o jogador acabou de
     dizer, e a narração deste turno abre por ele;
   · a PRIMEIRA linha do ONDE (`ferro: 1`) — a cena sem lugar é a cena que
     o Narrador vai inventar noutro lugar. Ela entra antes do desfecho no
     empate (a ordem de SECOES decide), e por isso nenhum desfecho, por
     maior que seja, tira o lugar da pauta.

   A CAUSA, MEDIDA NO REGISTO DA 3.ª SESSÃO (mente/mm11-sessao-3.md, defeito
   5): a frase do jogador não chegou em 0 de 2 golpes finais, e a pauta
   enviada reconstrói-se byte a byte com estas funções. No M30 (a Iracema,
   escrita ao teclado, 129/240) a cabeça (293) + o ONDE inteiro (4 linhas,
   prio 1,0..1,3: 80+31+213+278) + o fato (89) davam 1164; a linha da cena
   (273+14) levava a 1451 > 1400 — e o corte guloso, que andava por prio,
   pulou-a e meteu A GENTE (prio 6, 69) no lugar. No M21 (o herói): 1149 +
   310 = 1459. Nos dois, o que pesou foi a 4.ª linha do ONDE: 264 caracteres
   da economia de Vau Fincado ("cheira a cera, tinta e perfume caro") dentro
   de uma masmorra, a meio de uma luta, com prio 1,3 — à frente do DESFECHO
   (prio 2). A MM14 tinha provado a cena com um ONDE só do Geógrafo, sem a
   economia: o turno de prova não era o turno jogado.

   0,5 e não 0: `prio` é lido como verdadeiro pela suíte do Geógrafo, e o
   meio-ponto deixa cinco linhas de ferro (0,5..0,9) antes de qualquer linha
   de prio 1. */
export const PRIO_DE_FERRO = 0.5;

/* `prio` é a ordem do CORTE, não a da leitura: quanto menor, mais tarde
   se corta. A ordem em que o Narrador lê é a ordem desta lista.

   As duas primeiras nunca caem, e por motivos diferentes. ONDE, porque
   uma cena sem lugar é uma cena que o Narrador vai inventar em outro
   lugar. NÃO PODE, porque cortar um veto é exatamente como a
   incoerência entra — e um veto cortado não avisa que foi cortado. */
export const SECOES = [
  /* MM19 (a 5.ª sessão de prova): A CAUDA DO ONDE. A 1.ª linha (o lugar) é
     de ferro e a 2.ª (o endereço ⌖, ~30 caracteres) continua a prio 1,1. Da
     3.ª em diante é O LUGAR REPETIDO — o "comporta: correr, cercar, atirar
     de longe…" do Geógrafo (~190), o domínio, a guilda —, a mesma frase em
     todo turno passado no mesmo sítio, e cortava com prio 1,2..1,3: à
     frente de todo veto, do rumo, do fecho e da batida. Na 5.ª sessão o
     ONDE gastou em média 322 dos 1400 fora da luta, e a batida da espinha
     não coube em nenhum dos 66 pedidos. Agora a cauda corta com 2,49 (mais
     0,1 por linha): depois do que volta (2,47), da batida e do momento
     (2,475, 2,48); à frente da economia da praça (2,5), que é a outra
     metade da decoração. O que o lugar IMPEDE não muda: é veto, e mora no NÃO PODE. */
  { id: "onde", rotulo: "ONDE", prio: 1, ferro: 1, cauda: { desde: 2, prio: 2.49 }, o: "o lugar, e o que ele permite" },
  /* MM16 nº 4: A SALA ONDE ESTOU, dentro de uma masmorra (`masmorraParaPauta`,
     masmorras.js) — o tipo, o que nela resta, quem lá está, as passagens e a
     quantas passagens fica o portão do fundo. Na sessão de prova (M13) nada
     disto chegava, e quatro perguntas à soleira perderam-se. Só existe lá
     dentro: fora da masmorra a função devolve nada e a seção não aparece.

     QUE SALA é não mora aqui: vai na 1.ª linha do ONDE, de FERRO
     ("dentro da Nave de Ferro, na sala do guardião da chave" — `linhaDoLugar`,
     geografo.js), porque a sala onde se está é o lugar, e o lugar nunca
     cai. Aqui fica o resto da planta, e corta com prio 2,45: DEPOIS de todo
     veto (o NÃO PODE é 2, e cada linha a mais soma 0,1 — cinco linhas de
     veto vão até 2,4; um veto cortado não avisa, e é assim que a
     incoerência entra), da fala e do peso; e à frente de tudo o resto — o
     momento, o que acabou, quem está, a forma, a gente. Medido em
     teste-masmorra-na-pauta (500 cenas por lado): com 2,05 a linha da
     planta passava à frente do 2.º e 3.º vetos e tirava-os em 84 lutas e
     24 cenas fora dela; com 0,95, numa pauta cheia, tirava até o 1.º. Com
     2,45 não tira veto nenhum, e fora da luta a planta chega em 493/500.
     Na leitura vem logo depois do ONDE (primeiro o lugar, depois a planta).
     Fora da masmorra a função devolve nada e a seção não aparece; dentro,
     não está em SECOES_QUE_CEDEM — é a verdade do sítio.
     MM19: e a planta corta INTEIRA antes da batida da história: as linhas
     dela sobem um milésimo cada (`passo`), não 0,1 — com 0,1 a 2.ª e a 3.ª
     (quem está, o que resta, as passagens: 2,55 e 2,65) caíam atrás da
     batida (2,475) e do momento, e o Narrador da 5.ª sessão disse "dois
     caminhos" numa sala com três. */
  { id: "masmorra", rotulo: "MASMORRA", prio: 2.45, passo: 0.001, o: "a planta à volta da sala: a camada, o que nela resta, as passagens e o fundo" },
  /* 06/10 (a luz e a sombra): a luz da luta — o escuro, a minha tocha (acesa
     ou baixada), quem do outro lado enxerga no escuro, e se eu enxergo
     (`luzParaPauta`, luz.js). Só existe numa luta onde a luz muda a decisão
     (masmorra, caverna, noite): com tudo claro a função devolve nada e a
     seção nem é candidata. É a resposta a "o lobo me vê?" e não um veto —
     quem decide se me escondi é o sistema, e isso chega pelo envelope do
     teste. Por isso corta BARATO: prio 5.5, depois de todo veto, do
     desfecho, da planta, de quem está e do contra; à frente só da gente, do
     vilão, do aliado e do que fica longe. Medido em teste-luz-e-sombra: nas
     500 lutas semeadas de estresse não tira desfecho, veto, frase nem planta
     em nenhuma (500/500) e chega em 181 (a 4,5 chegaria em 229, tirando o
     contra; a 2,5, em 314, tirando quem está); na pauta da chamada 68 da
     sessão 3 (M30) chega inteira, com a frase do golpe. A linha é curta
     (~90 caracteres) para caber na sobra. */
  { id: "luz", rotulo: "A LUZ", prio: 5.5, o: "a luz da luta: o escuro, a minha tocha, quem enxerga no escuro" },
  /* MM16 nº 5: O QUE O LUGAR PRODUZ E O QUE LHE FALTA (`envelopeDoComercio`,
     comercio.js) morava como mais uma linha do ONDE, de prio 1 — e ia em
     TODO turno, também dentro de uma masmorra e a meio de uma luta, onde
     não há praça. Seção própria para poder CEDER por tabela
     (`SECOES_QUE_CEDEM`, abaixo). O rótulo é o do ONDE de propósito: na
     cidade o Narrador lê o mesmo bloco que lia, e `textoDaPauta` junta
     seções vizinhas de rótulo igual. Prio 2,5: DEPOIS dos vetos, de A
     FALA e do PESO (2), antes do MOMENTO (3). Como linha do ONDE ela tinha
     prio 1,3 e passava à frente de todo veto — por acidente de morada, não
     por decisão: a cor da praça não vale mais que o "não pode" da cena (é
     assim que a incoerência entra, diz o cabeçalho). Na cidade cheia ela
     cede antes de um veto; numa luta nem chega a ser candidata. */
  { id: "economia", rotulo: "ONDE", prio: 2.5, o: "o que o lugar produz e o que lhe falta" },
  /* v9.118: O QUE SE ALCANÇA DAQUI, e por que é uma seção e não mais uma
     linha do ONDE. A lista de vizinhos com rumo e distância custa cerca de
     170 caracteres, e a sonda mostrou o preço exato de pendurá-la no ONDE
     (prioridade 1): numa cena cheia ela empurrava para fora a segunda
     pessoa presente, a FORMA da cena, a linha do Intérprete e a do Vilão.
     Quatro coisas que fazem a cena, trocadas por três moinhos aonde
     ninguém ia.

     Numa seção própria, de prioridade baixa, quem decide é o orçamento, e
     ele decide certo: em cena vazia a lista entra, em cena cheia a gente
     ganha dela. O endereço exato continua no ONDE, porque custa vinte
     caracteres e é a resposta à pergunta "onde estou". */
  { id: "daqui", rotulo: "DAQUI", prio: 7, o: "o que se alcança daqui, com rumo e distância" },
  { id: "quem", rotulo: "QUEM", prio: 4, o: "quem está presente" },
  /* MM-C (C1, o núcleo): QUEM É — a ficha de uma pessoa do núcleo que está
     em cena (o que quer, como fala, o que traz, o que teme — nunca o que
     esconde), uma por turno no máximo e a mesma pessoa só de seis em seis
     turnos (`nucleo.js#quemEParaPauta`, ≤ 130 caracteres). Na luta cede.
     C2 (11/10), MOVIDA de 4,5 para 2,485, com o motivo: a prova viva da C1
     (frontend, v9.410) mediu um turno comum de cidade com a pauta já em
     ~1323 de 1400, e a linha QUEM É era a PRIMEIRA a cair — só entrava na
     cena de pergunta, onde a economia cede. Com 4,5 ela perdia para a
     economia da praça (2,5) e para a cauda do ONDE (2,49), que são a
     decoração; o §3.2 reserva-lhe, com a linha QUEM CARREGA, até 350
     caracteres, e diz que o que cede é a economia, a cidade, o daqui. Agora
     corta depois dos vetos, do coração (2,46), do que volta (2,47) e da
     batida da espinha (2,475, 2,48), e à frente da cauda do ONDE e da
     economia. Numa pergunta CEDE (`SECOES_QUE_CEDEM.pergunta`): a lei da
     escuta — a resposta passa à frente da cor. Provado em
     teste-subtramas (a cidade cheia de ~1323: a linha entra, nenhum veto
     nem desfecho sai). */
  { id: "quemE", rotulo: "QUEM É", prio: 2.485, o: "quem é, por dentro, a pessoa que importa e está em cena: o que quer, como fala, o que traz" },
  /* MM-C (C2, as subtramas): QUEM CARREGA — a batida de uma pessoa do
     núcleo que está em cena: o que ela pede, o que lhe chega, as duas
     saídas que o herói tem de decidir, a pista do elo, a revelação
     (`subtramas.js#avancarCoracao`, ≤ 220 caracteres, uma por turno no
     máximo). Prio 2,46: depois de todo veto (2..2,4) e da planta da
     masmorra (2,45); à frente do que volta (2,47) e da batida da espinha
     (2,475) — quando uma pessoa do núcleo está a pedir, a decidir ou a ser
     revelada, é ela o coração da cena (`mente/coracao-c1-c2.md` §3.2). NÃO
     entra em SECOES_QUE_CEDEM: na luta é o motor que só a deixa passar
     quando o tom da batida é batalha (o irmão do outro lado está NA luta).
     O teto não subiu; o que cede é o de prio mais baixa. */
  { id: "coracao", rotulo: "QUEM CARREGA", prio: 2.46, o: "o que uma pessoa que importa pede, carrega ou tem de ver decidido, nesta cena" },
  /* MM19: A FRENTE DO MOMENTO. A 1.ª linha é a BATIDA da espinha em curso
     (a cena, o que está em jogo, a pergunta — `envelopeDaEspinha`) e a 2.ª
     o que o fio mudou no mundo (a marca do antagonista, ou o JÁ SE SABE —
     `momentoDoFio`, que o App põe logo a seguir). Com prio 3 elas vinham
     DEPOIS da economia da praça (2,5) e da cauda do ONDE, e na 5.ª sessão a
     batida chegou em 0 de 66 pedidos e o momento do vilão em 24 de 46
     fora da luta — os 22 que faltaram, todos cortados pelo teto. A régua: o
     que move a história ganha do que a decora. Cortam com 2,475 e 2,48
     (`frente`, uma prio por linha): depois dos vetos (2,0..2,4), do rumo
     (2,42), do fecho (2,43), da planta da masmorra (2,45) e do que volta
     (2,47, a promessa que amadureceu, que é uma por turno e curta) — a
     escuta e o veto não cedem a ninguém —, e à frente da cauda do ONDE
     (2,49) e da economia (2,5). O resto do momento (o fio desta peça, o
     episódio) corta como sempre, 3 mais 0,1 por linha. Na luta o momento
     cede inteiro, e numa pergunta que uma ficha respondeu também
     (`SECOES_QUE_CEDEM`). */
  { id: "momento", rotulo: "MOMENTO", prio: 3, frente: [2.475, 2.48], o: "a batida da história" },
  { id: "forma", rotulo: "FORMA", prio: 5, o: "o formato desta cena" },
  { id: "gente", rotulo: "A GENTE", prio: 6, o: "o que cada um faz" },
  /* O Narrador só narra · E1 (12/10): NOMES À MÃO — dois nomes livres da
     cultura do lugar (`nomesAMao`, nomes.js), para o figurante que a cena
     precisar de nomear. Na 7.ª sessão três dos figurantes mais vivos
     (Ambrósio, Pregado, Dário) foram nomeados pelo Narrador sem o sistema
     saber, e o Dário ficou registado vivo depois de morto. A linha custa
     ~80 com a etiqueta e corta com 2,488: DEPOIS de todo veto, do coração,
     do que volta, da batida e da ficha (2,485) — e À FRENTE da decoração (a
     cauda do ONDE, 2,49, e a economia da praça, 2,5). Numa pergunta CEDE
     quando o sistema tem a resposta (PERGUNTOU com linha); fica quando não
     a tem — foram três perguntas assim ("quem era o velho?", "o nome
     dele?", "quem era o homem?") que pediram nome. Na luta cede (ninguém se
     apresenta a meio de um golpe).
     E2 (12/10), MOVIDA de 2,488 para 2,477, com o motivo: a prova viva da
     E1 (frontend, v9.421) viu os turnos 2–6 de uma campanha nova, com a
     batida 1 da espinha (~330 caracteres) e a pauta a 1311–1360, sem a
     linha nunca caber — e o Narrador inventou Jaina, Dren e Jorik
     exatamente nesses turnos. Com 2,488 ela cortava depois da batida
     (2,475), da marca do fio (a 2.ª linha do momento, 2,48) e da ficha
     (2,485). A batida move a história e fica à frente; a marca do fio e a
     ficha são cor de quem já tem nome, e passam a ceder aos nomes. Nas 138
     pautas reais da 6.ª e da 7.ª (registo-s6-s7-pauta.json) a linha entra
     em 47 dos 65 turnos de batida (eram 25), e nenhum veto, desfecho,
     resposta, rumo, fecho, coração, o que volta, planta ou batida que
     chegava deixa de chegar. A linha também encurtou (nomes.js). */
  { id: "nomes", rotulo: "NOMES À MÃO", prio: 2.477, o: "nomes prontos da cultura do lugar, para quem ainda não tem nome" },
  /* v9.135: e o que cada um DISSE, palavra por palavra. Prioridade 2 porque
     e o conteudo da cena: cortar a fala de alguem que ja falou seria pior do
     que cortar o lugar onde ele falou. */
  { id: "fala", rotulo: "A FALA", prio: 2, o: "o que cada um disse, palavra por palavra" },
  { id: "contra", rotulo: "CONTRA", prio: 5, o: "o que a oposição quer, e em quem bate" },
  { id: "aliado", rotulo: "O ALIADO", prio: 7, o: "quem anda comigo" },
  { id: "vilao", rotulo: "O VILÃO", prio: 6, o: "o que a ameaça fez" },
  /* MM8f: o que alguém do mundo fez enquanto o herói não olhava, e que
     toca esta cena. Prioridade 6, a da gente e do vilão, e DEPOIS deles na
     lista: no empate, o que acontece à frente do herói entra primeiro. */
  { id: "foraDeCena", rotulo: "ENTRETANTO", prio: 6, o: "o que alguém fez longe dos olhos do herói, e toca esta cena" },
  { id: "mundo", rotulo: "O MUNDO", prio: 7, o: "o que o mundo cobra ou paga por um ato antigo" },
  /* MM12: A CIDADE POR DENTRO — o dia de hoje e a língua da rua, que a
     cena mostra sem ninguém perguntar. Prioridade baixa e DEPOIS do vilão,
     do aliado e do mundo na lista: no empate de prioridade, a ordem da
     lista decide, e numa cena cheia a gente ganha do sino. É o precedente
     do DAQUI (v9.118), medido de novo em teste-mm12-cidade. */
  { id: "cidade", rotulo: "A CIDADE", prio: 7, o: "o dia de hoje e a língua da rua" },
  /* O Narrador só narra · E1 (12/10): O PREÇO DA RUA — a caneca, a refeição
     e a comida de rua ao preço daqui (`precosDaRua`, mercado.js), para o
     preço que a cena diz sem ninguém perguntar ("tem peixe seco na tenda
     por três cobre", 7.ª, M43). É decoração com número: corta com 6,5, à
     frente só do DAQUI, do MUNDO, da CIDADE e do ANTES — entra quando há
     folga, e numa cena cheia a gente ganha dela. O preço PERGUNTADO não mora
     aqui: vai em PERGUNTOU (`precoComumParaPauta`, prio 4), e numa pergunta
     esta cede. Na luta, na masmorra e fora dos muros não há rua. */
  { id: "preco", rotulo: "O PREÇO", prio: 6.5, o: "o que se bebe e come na rua, ao preço daqui" },
  { id: "antes", rotulo: "ANTES", prio: 8, o: "o que já aconteceu aqui" },
  { id: "acabou", rotulo: "ACABOU DE", prio: 3, o: "o que o sistema resolveu agora" },
  /* MM14: O DESFECHO — quem saiu da luta neste turno, e COMO o jogador
     escreveu que saiu. Morava em ACABOU (prio 3), com a cena do jogador na
     segunda linha (3,1), e a sessão de prova (MM11) mostrou o preço: 3 em 3
     golpes finais sem a frase escrita chegar ao Narrador, e no terceiro nem
     o fato. A linha da cena tinha até ~470 caracteres (hoje ~425) e o
     corte é guloso — quando ela não cabia, o CONTRA (prio 5) e o DAQUI (7)
     entravam no lugar dela, e o Mestre narrava outra morte. Prioridade 2 pela razão de A FALA:
     é o que alguém escreveu palavra por palavra, e a única vez em que o
     jogador DIRIGE a cena. Vem logo depois de ACABOU na leitura.
     MM16 nº 5: e prio 2 ainda não bastou — o ONDE (prio 1) tinha quatro
     linhas e a economia da cidade passava à frente. Agora é de FERRO (o
     cabeçalho de PRIO_DE_FERRO tem os números da sessão). */
  { id: "desfecho", rotulo: "DESFECHO", prio: PRIO_DE_FERRO, o: "quem saiu da luta agora, e como o jogador escreveu que foi" },
  /* MM12: e o que o jogador PERGUNTOU. Uma pergunta direta é o centro do
     turno — "quanto custa a diária?" cortada pelo teto seria o Narrador a
     inventar exatamente o que se quis saber. Prioridade 4, a de QUEM, e
     DEPOIS dela na lista: no empate, quem está presente entra primeiro.
     Com 3 a medição (teste-mm12-cidade, a taverna cheia) mostrou a resposta
     do preço a empurrar para fora o taverneiro a quem se perguntou — e
     responder sem quem responde não é resposta. Só se enche quando a frase
     pergunta; a cidade é a primeira a usá-la, e o elenco (MM8) a segunda. */
  { id: "pergunta", rotulo: "PERGUNTOU", prio: 4, o: "o fato do mundo que responde ao que o jogador perguntou agora" },
  /* v9.201: as duas versoes da cena, antes do dado. So entra quando a acao
     casa com uma situacao conhecida da Mesa Posta — advisoria, e por isso
     de prioridade media: importa, mas cede a fala e ao veto se faltar teto.
     MM5: ganha a terceira versao, o raspao ("passa por um fio"), sempre
     como a ULTIMA linha da secao -- a primeira a cair quando falta teto. */
  { id: "mesa", rotulo: "A APOSTA", prio: 4, o: "as versoes da cena (o sim, o raspao e o nao), antes do dado" },
  /* v9.204: a gravidade da cena. Prioridade 2 porque e conteudo — cortar o
     peso de um velorio seria pior do que cortar o lugar onde ele acontece. */
  { id: "peso", rotulo: "O PESO", prio: 2, o: "a gravidade desta cena, e o que o mundo cala" },
  /* MM16 nº 5: o veto de quem acabou de cair ("Grok morrer nesta cena: está
     desacordado e vivo"), e os do MM9 (o rendido, o preso). Morava na frente
     do NÃO PODE (2,0) e, com o DESFECHO de ferro, seria o único pedaço do
     golpe final que ainda cedia. Seção própria, de ferro, com o rótulo do
     NÃO PODE e logo antes dele: o Narrador lê um bloco de vetos só, com o
     do turno na primeira linha — como lia. */
  { id: "vetoDoDesfecho", rotulo: "NÃO PODE", prio: PRIO_DE_FERRO, o: "o veto de quem acabou de cair" },
  /* E2 (12/10), o passo dos vetos: 0,05 por linha (era 0,1). Com 0,1 o 6.º
     veto cortava com 2,5 — atrás da ficha, dos nomes, da cauda do ONDE e ao
     lado da economia — e na 6.ª sessão "Tamsin está em Serra do Bode… não
     entra nesta cena sem 4h de estrada" caía assim que NOMES À MÃO entrava
     (4 pautas reais, registo-s6-s7-pauta.json). O veto não cede à cor: com
     0,05 os nove primeiros cortam até 2,4, à frente do rumo e da planta. */
  { id: "naoPode", rotulo: "NÃO PODE", prio: 2, passo: 0.05, o: "os vetos desta cena" },
  /* A campanha que prende (item 1): O QUE VOLTA — a promessa que o próprio
     Narrador plantou e que o sistema traz de volta agora
     (`prometido.js#cobrarNoTurno`), uma por turno no máximo e nunca numa
     pergunta. Na leitura vem antes do RUMO (a ordem do turno fica a última
     linha). Corta com prio 2,47: depois dos vetos, do rumo e da planta da
     masmorra (2,45), e à frente da economia da praça (2,5) — na 4.ª sessão
     a cor da praça chegava em todo turno de cidade e o couro de Norberto
     não chegou em nenhum. */
  { id: "volta", rotulo: "O QUE VOLTA", prio: 2.47, o: "a promessa plantada antes que volta agora" },
  /* MM18 (o Mestre que escuta): O RUMO — a ordem do turno, dita uma vez:
     primeiro reage ao que eu fiz ou responde ao que perguntei; depois, e por
     dentro da resposta, UMA coisa só aponta para o próximo passo da
     história (a ponte); e, quando empaco, o mundo dá um sinal, vem
     buscar-me ou cobra (`escuta.js#linhaDoRumo`). É a ÚLTIMA na leitura —
     a linha da pauta mais perto da minha frase. Corta com prio 2,42: depois
     dos cinco primeiros vetos (2,0..2,4) e antes da planta (2,45), da
     economia da praça (2,5), do momento (3), da gente (6). Na 4.ª sessão o
     que chegava em cada turno era o contrário: até três linhas de agenda de
     gente e um envelope a plantar outra história, e nenhuma a dizer qual
     era o destino. */
  { id: "rumo", rotulo: "O RUMO", prio: 2.42, o: "a ordem do turno: reagir e responder primeiro, depois uma ponte para o próximo passo" },
  /* A campanha que prende (item 2): O FECHO — como acaba a resposta deste
     turno (`fecho.js#escolherFecho`): uma pergunta de alguém em cena, uma
     escolha posta, um corte seco, uma consequência, ou o silêncio que
     espera; nunca o mesmo dois turnos seguidos, e nunca o ambiente a
     pressagiar (27 das 42 respostas da 4.ª sessão fechavam assim). Vem
     DEPOIS do RUMO na leitura, que deixa de ser a última linha: a ordem
     do turno diz o que fazer, o fecho diz onde parar — e é a última coisa
     que se lê antes de escrever a última frase. Linha curta (~130); corta
     com prio 2,43, logo depois do rumo e antes da planta (2,45). */
  { id: "fecho", rotulo: "O FECHO", prio: 2.43, o: "como acaba a resposta deste turno" },
];

export function secaoPorId(id) { return SECOES.find((s) => s.id === id) || null; }

/* ---------------- O ORÇAMENTO ----------------
   O número vem do mesmo lugar que o do léxico: a cena comum está em
   59.744 caracteres com o teto declarado em 62 mil, e o que o Mestre diz
   por turno tem de caber na folga sem competir com as regras.

   Mil e quatrocentos é o que dez seções bem escritas ocupam. O que não
   couber é cortado pela prioridade, e o corte é silencioso de propósito:
   avisar o Narrador de que alguma coisa foi cortada gastaria o espaço
   que faltou. */
export const TETO_DA_PAUTA = 1400;

export function garantirPauta(p) {
  const o = p && typeof p === "object" ? p : {};
  const out = {};
  for (const s of SECOES) {
    const v = o[s.id];
    const linhas = (Array.isArray(v) ? v : v ? [v] : [])
      .map((x) => String(x == null ? "" : x).replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .filter((x, i, a) => a.indexOf(x) === i);
    if (linhas.length) out[s.id] = linhas;
  }
  return out;
}

export function porNaPauta(pauta, id, ...linhas) {
  if (!secaoPorId(id)) return garantirPauta(pauta);
  const p = garantirPauta(pauta);
  const novas = linhas.flat().filter(Boolean);
  if (!novas.length) return p;
  return garantirPauta({ ...p, [id]: [...(p[id] || []), ...novas] });
}

export function pautaVazia(p) { return Object.keys(garantirPauta(p)).length === 0; }

/* ---------------- O QUE CEDE ONDE (MM16 nº 5) ----------------

   Cada chave é uma condição da cena; a lista é das seções que, nela, não
   dizem nada de verdade e só gastam o teto. Não é corte por falta de
   espaço (isso é `textoDaPauta`): é a seção que nem chega a ser
   candidata, porque o lugar onde a cena está não a tem.

   · LUTA — a economia da praça, a vida da rua, a vizinhança com rumo e
     distância e a diplomacia das potências. Ninguém sai a meio de uma
     luta para o moinho de outra vila, e nenhuma potência muda o golpe que
     vem a seguir.
   · MASMORRA — a economia e a rua: lá dentro não há praça. A vizinhança
     fica (a saída da masmorra é a pergunta de quem foge).
   · ARREDORES — o herói está fora dos muros (o posto, a capela, as
     salinas): a economia da cidade não é a do lugar, e a rua não está lá.

   Quem diz a condição é o App (`combate`, `masmorra`, `lugar`); a
   regra mora aqui. */
export const SECOES_QUE_CEDEM = {
  /* MM19: e o MOMENTO. Na 5.ª sessão a obra do antagonista ("em Casa da
     Fonte um carroceiro sem rosto recruta…", 223 caracteres) ia em 20 de 20
     turnos da luta com o Dragão, e a luta tinha a prosa a contradizer o
     dado por falta de estado. A batida da história não muda o golpe que
     vem a seguir; com a frente nova (2,475) ela passaria à frente do
     CONTRA e da luz. Na luta, cede. */
  /* MM-C (C1): e o QUEM É — a ficha é cor, e a luta não para para ela. */
  /* E1 (12/10): e o PREÇO da rua e os NOMES À MÃO — na luta ninguém compra
     nem se apresenta; na masmorra e fora dos muros não há rua (os nomes
     ficam: a prisioneira da cripta também precisa de um). */
  luta: ["economia", "cidade", "daqui", "mundo", "momento", "quemE", "preco", "nomes"],
  masmorra: ["economia", "cidade", "preco"],
  arredores: ["economia", "cidade", "preco"],
  /* MM18: e a cena em que EU PERGUNTEI. Quem diz a condição não é o App:
     é a própria pauta — há linha em PERGUNTOU quando uma ficha respondeu à
     minha pergunta. No J6 da 4.ª sessão ("quanto tempo até à Muralha? onde
     dormir, a quanto o quarto?") a resposta do pouso foi cortada pelo teto
     e a economia da praça (274 caracteres, "Cheira a cera, tinta e perfume
     caro") ficou — a cor da praça a ganhar à resposta. E a mesma linha, em
     todo turno de cidade, é a fonte do "cheiro de cera" que abre 7 das 26
     narrações fora da luta. Numa pergunta, a resposta passa à frente.
     MM19: e o MOMENTO também. A resposta (PERGUNTOU) corta com 4, e a
     batida da frente (2,475) tirava-a — no M35 da 5.ª sessão ("Tu és o
     Edric", e a ficha dele à vista) a batida ganhava à resposta. É a lei da
     escuta: numa pergunta, responde-se, e o único empurrão é a ponte do
     RUMO. */
  /* MM-C (C2): e o QUEM É, que passou a cortar à frente da decoração
     (2,485) — numa pergunta, a resposta não perde para a ficha. E o QUEM
     CARREGA (2,46): medido em teste-subtramas, na cidade cheia a batida de
     220 tirava a resposta (PERGUNTOU, 4) e deixava a cauda do ONDE. Ceder
     aqui não perde a batida: o App só a dá por cumprida quando a linha
     entrou na pauta, e ela volta no turno seguinte. */
  /* E1: e o PREÇO da rua — o perguntado já vai em PERGUNTOU — e os NOMES À
     MÃO: quando há linha em PERGUNTOU, o sistema sabia a resposta, e ela
     passa à frente dos nomes (com 2,488 eles tiravam-na). Quando a pergunta
     é a que o sistema não sabe responder ("quem era o velho?", o nome do
     barqueiro, a 7.ª M7/M12/M24), PERGUNTOU está vazia e os nomes ficam —
     é aí que fazem falta. */
  pergunta: ["economia", "cidade", "daqui", "momento", "quemE", "coracao", "preco", "nomes"],
};

/* A porta: devolve uma pauta NOVA sem as seções que cedem na cena dada.
   `cena` é `{ luta, masmorra, arredores }` (verdadeiros soltos); lixo ou
   `null` não tira nada. Nunca muta a recebida. */
export function cederNaCena(pauta, cena) {
  const p = garantirPauta(pauta);
  const c = { ...(cena && typeof cena === "object" ? cena : {}), pergunta: !!(p.pergunta && p.pergunta.length) };
  const saem = new Set();
  for (const [chave, ids] of Object.entries(SECOES_QUE_CEDEM)) if (c[chave]) ids.forEach((id) => saem.add(id));
  if (!saem.size) return p;
  const out = {};
  for (const [id, linhas] of Object.entries(p)) if (!saem.has(id)) out[id] = linhas;
  return out;
}

/* ---------------- A PRIORIDADE DE UMA LINHA ----------------
   A i-ésima linha da secção `s` corta com: PRIO_DE_FERRO nas primeiras
   `ferro` (MM16); a da FRENTE, uma por linha, nas primeiras (MM19, o
   momento); a prio da CAUDA da linha `cauda.desde` em diante (MM19, o
   lugar repetido), 0,1 a mais por linha; e no resto a da secção, mais
   `passo` (0,1 se a secção não diz outro) por linha — a primeira linha
   de uma secção costuma ser a que a resume. Exportada para a suíte ler a
   régua de volta. */
export function prioDaLinha(s, i) {
  const sec = s && typeof s === "object" ? s : {};
  const n = Number.isFinite(Number(i)) ? Math.max(0, Math.floor(Number(i))) : 0;
  const base = Number.isFinite(Number(sec.prio)) ? Number(sec.prio) : 9;
  if (n < (sec.ferro || 0)) return PRIO_DE_FERRO + n * 0.1;
  if (Array.isArray(sec.frente) && n < sec.frente.length) return sec.frente[n];
  if (sec.cauda && n >= sec.cauda.desde) return sec.cauda.prio + (n - sec.cauda.desde) * 0.1;
  return base + n * (Number.isFinite(sec.passo) ? sec.passo : 0.1);
}

/* ---------------- O TEXTO ----------------
   Monta na ordem de LEITURA e corta na ordem de PRIORIDADE. Uma seção
   com mais de uma linha perde as últimas antes de perder a primeira: a
   primeira linha de uma seção costuma ser a que a resume. */
export function textoDaPauta(p, { teto = TETO_DA_PAUTA, turno = 0 } = {}) {
  const pauta = garantirPauta(p);
  if (pautaVazia(pauta)) return "";
  /* v9.115: A REGRA SAI DO COMENTÁRIO E VAI PARA O PROMPT.

     Está escrito no cabeçalho deste arquivo desde a v9.104 — "se uma linha
     da Pauta pode ser copiada para a narração como está, ela está errada" —
     e nunca foi dito a quem narra. Regra escrita sem código atrás, que é o
     defeito que esta casa mais repete.

     Duas capturas da partida do jogador, em turnos seguidos: o envelope
     trazia o rótulo de teste "causar boa impressão" e o mercador disse
     "— Você quer causar boa impressão"; o envelope dizia "a data chega" e
     ele disse "— A data chegou". Rótulo de painel na boca de gente. E é
     assim que sai uma fala que não é de ninguém.

     Custa cerca de cem caracteres do orçamento da Pauta, e paga: uma linha
     de seção a menos vale menos que uma fala inteira que não existe.
     MM18: "Ligue os pontos e conte COMO aconteceu" virou "Abra pelo que eu
     fiz ou perguntei e conte COMO" — o mesmo tamanho (95), e a primeira
     ordem do turno passa a ser a do Matt: reagir antes de empurrar.
     MM19: a mesma regra em menos palavras (293 → 228 caracteres). A
     cabeça é o maior custo fixo da pauta, pago em TODO turno; na 5.ª
     sessão, com a batida da espinha a caber, a obra do antagonista ficava
     de fora em 35 de 46 turnos por falta de ~70 caracteres. Medido na
     reconstrução do registo (teste-batida-na-cena): com a cabeça de antes,
     batida 39 e obra 11 de 46; com esta, 41 e 29 (eram 0 e 24). Sai só a
     repetição ("Estas palavras… nenhuma delas… e nenhuma… — ninguém neste
     mundo fala em rótulo"); fica tudo o que manda: abrir pelo que eu fiz,
     o QUE e o COM QUEM não se discutem, e nada daqui entra na narrativa
     nem na boca de alguém. */
  const cabeca = `[PAUTA DO TURNO${turno ? ` ${turno}` : ""} — decidido pelo SISTEMA. Abra pelo que eu fiz ou perguntei e conte COMO; daqui vem o QUE e o COM QUEM, e não se discute. É ETIQUETA DE SISTEMA: nenhuma palavra daqui entra na narrativa nem na boca de ninguém.]`;
  const pe = "";
  /* candidatas: uma entrada por LINHA, para o corte ser fino */
  const cand = [];
  for (const s of SECOES) {
    const linhas = pauta[s.id] || [];
    linhas.forEach((t, i) => cand.push({ secao: s.id, ordem: SECOES.indexOf(s), i, prio: prioDaLinha(s, i), texto: t }));
  }
  cand.sort((a, b) => a.prio - b.prio);
  let gasto = cabeca.length + pe.length;
  const dentro = new Set();
  for (const c of cand) {
    const custo = c.texto.length + 14;
    if (gasto + custo > teto) continue;
    dentro.add(c);
    gasto += custo;
  }
  /* MM16: seções VIZINHAS de rótulo igual (ONDE + economia; o veto do
     desfecho + NÃO PODE) saem num bloco só — o Narrador lê o que lia. */
  const blocos = [];
  for (const s of SECOES) {
    const linhas = cand.filter((c) => c.secao === s.id && dentro.has(c)).sort((a, b) => a.i - b.i).map((c) => c.texto);
    if (!linhas.length) continue;
    const ultimo = blocos[blocos.length - 1];
    if (ultimo && ultimo.rotulo === s.rotulo) ultimo.linhas.push(...linhas);
    else blocos.push({ rotulo: s.rotulo, linhas });
  }
  const partes = blocos.map((b) => `${b.rotulo.padEnd(9)} ${b.linhas.join("\n" + " ".repeat(10))}`);
  if (!partes.length) return "";
  return `${cabeca}\n${partes.join("\n")}`;
}

/* Quanto a Pauta ocuparia inteira, sem corte. Existe para a sonda poder
   AFIRMAR que o orçamento morde em vez de eu acreditar que morde. */
export function tamanhoCruDaPauta(p) {
  const pauta = garantirPauta(p);
  return Object.values(pauta).flat().reduce((a, t) => a + t.length + 14, 0);
}

export const PAUTA_PROMPT = `A PAUTA DO TURNO (v9.105):
· Quando chegar um bloco [PAUTA DO TURNO], ele é o resumo do que o SISTEMA já decidiu para esta cena — lugar, gente, batida da história, forma, vetos. Cumpra tudo, na ordem que fizer sentido narrativamente.
· A Pauta diz O QUE acontece e COM QUEM. O COMO é seu, inteiro: a fala, o gesto, o cheiro, o ritmo, o que cada um esconde. Nenhuma linha dela deve aparecer copiada na narração.
· A linha NÃO PODE é veto: o que está ali não acontece nesta cena, por mais que a cena peça.`;
