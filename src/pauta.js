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
  { id: "onde", rotulo: "ONDE", prio: 1, ferro: 1, o: "o lugar, e o que ele permite" },
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
     não está em SECOES_QUE_CEDEM — é a verdade do sítio. */
  { id: "masmorra", rotulo: "MASMORRA", prio: 2.45, o: "a planta à volta da sala: a camada, o que nela resta, as passagens e o fundo" },
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
  { id: "momento", rotulo: "MOMENTO", prio: 3, o: "a batida da história" },
  { id: "forma", rotulo: "FORMA", prio: 5, o: "o formato desta cena" },
  { id: "gente", rotulo: "A GENTE", prio: 6, o: "o que cada um faz" },
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
  { id: "naoPode", rotulo: "NÃO PODE", prio: 2, o: "os vetos desta cena" },
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
  luta: ["economia", "cidade", "daqui", "mundo"],
  masmorra: ["economia", "cidade"],
  arredores: ["economia", "cidade"],
};

/* A porta: devolve uma pauta NOVA sem as seções que cedem na cena dada.
   `cena` é `{ luta, masmorra, arredores }` (verdadeiros soltos); lixo ou
   `null` não tira nada. Nunca muta a recebida. */
export function cederNaCena(pauta, cena) {
  const p = garantirPauta(pauta);
  const c = cena && typeof cena === "object" ? cena : {};
  const saem = new Set();
  for (const [chave, ids] of Object.entries(SECOES_QUE_CEDEM)) if (c[chave]) ids.forEach((id) => saem.add(id));
  if (!saem.size) return p;
  const out = {};
  for (const [id, linhas] of Object.entries(p)) if (!saem.has(id)) out[id] = linhas;
  return out;
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
     de seção a menos vale menos que uma fala inteira que não existe. */
  const cabeca = `[PAUTA DO TURNO${turno ? ` ${turno}` : ""} — decidido pelo SISTEMA. Ligue os pontos e conte COMO aconteceu; o que está aqui é o QUE e o COM QUEM, e não se discute. Estas palavras são ETIQUETA DE SISTEMA: nenhuma delas entra na narrativa, e nenhuma entra na boca de um personagem — ninguém neste mundo fala em rótulo.]`;
  const pe = "";
  /* candidatas: uma entrada por LINHA, para o corte ser fino */
  const cand = [];
  for (const s of SECOES) {
    const linhas = pauta[s.id] || [];
    /* MM16: as primeiras `ferro` linhas cortam como PRIO_DE_FERRO */
    linhas.forEach((t, i) => cand.push({ secao: s.id, ordem: SECOES.indexOf(s), i, prio: (i < (s.ferro || 0) ? PRIO_DE_FERRO : s.prio) + i * 0.1, texto: t }));
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
