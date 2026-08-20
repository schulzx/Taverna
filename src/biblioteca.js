/* ============================================================
   O BIBLIOTECÁRIO (v9.85) — o repertório de FORMAS

   "E se criarmos um sistema treinado em histórias? Ele seria expert em
   grandes histórias, e é uma base de consulta do mestre — quando o
   mestre estiver pensando o que pode fazer para enviar a IA narrar, ele
   pode consultar o bibliotecário."

   O QUE FALTAVA, e não era o que parecia. O mestre já escolhe bem QUAL
   fio puxar: o relógio quase cheio, a promessa aberta, o nome deixado
   para trás, o vilão que deu um passo. Essa decisão está resolvida desde
   a v9.61 e é boa.

   O que ele nunca teve é a segunda metade da decisão, que é a FORMA. Um
   relógio quase cheio pode entrar numa cena de vinte maneiras — por um
   mensageiro que traz notícia pior que o recado, por uma ausência que se
   nota, por um objeto no chão, por alguém que já está reagindo, pela
   cortesia de quem devia estar furioso. E o envelope pedia sempre a
   mesma coisa: "traga isto à cena em duas ou três frases".

   Um pedido igual todo turno recebe uma resposta igual todo turno. A
   repetição do narrador nunca foi falta de temperatura — foi falta de
   repertório do lado de cá. Subir a temperatura fez a IA variar as
   PALAVRAS; o que se repetia era a JOGADA.

   ---------------- O QUE ELE NÃO É ----------------

   Não é um gerador de trama, e a linha da casa continua exatamente onde
   estava: aqui não nasce nenhum acontecimento. Toda entrada desta
   estante descreve um MOVIMENTO — o formato de como uma coisa que já
   existe chega à mesa. O conteúdo continua vindo do jogo (do relógio, da
   promessa, do vilão) e a ficção continua sendo escrita pela IA, que é a
   única coisa que ela faz melhor que qualquer tabela.

   E não é um bloco de prompt. Este arquivo inteiro custa ZERO token por
   turno: ele só fala dentro de um envelope que já ia ser enviado, e
   engorda esse envelope em duas linhas. O orçamento da cena comum não
   sente nada.

   ---------------- DE ONDE SAI CADA JOGADA ----------------

   Do ofício documentado das mesas que já estudamos aqui e da forma que
   as grandes histórias usam — épicos de fantasia, séries longas de
   formação, campanhas gravadas, mistérios, ascensões solitárias. NÃO há
   citação nem trecho de nenhuma delas, e não poderia haver: o que é útil
   para um programa não é o texto, é a ESTRUTURA — e a estrutura é a
   única parte que serve para uma história que ainda não foi escrita.

   Cada entrada é uma forma que funciona em qualquer mundo, com qualquer
   nome, em qualquer gênero. É por isso que ela cabe aqui.
   ============================================================ */

export const ESCOLAS = [
  { id: "saga", nome: "a saga longa", da: "o épico de estrada: o mundo é grande, a viagem cobra, e a notícia chega de longe já velha" },
  { id: "formacao", nome: "a série de formação", da: "o detalhe pequeno plantado cedo que só anos depois mostra para que servia" },
  { id: "mesa", nome: "a campanha gravada", da: "o holofote que gira, o respiro entre as pancadas, e o vilão que conversa antes de lutar" },
  { id: "misterio", nome: "o mistério", da: "a informação que falta é conhecida pelo herói: ele sabe o tamanho do buraco" },
  { id: "ascensao", nome: "a ascensão solitária", da: "o poder que sobe cobra em isolamento, e cada degrau muda quem trata o herói de igual" },
  { id: "tragedia", nome: "a tragédia", da: "o antagonista tem razão em alguma coisa, e o herói paga o preço de outra pessoa" },
];
export function escolaPorId(id) { return ESCOLAS.find((e) => e.id === id) || null; }

/* ============================================================
   A SITUAÇÃO — o que o mestre leva à consulta

   Tudo já é sabido em outro lugar do jogo. Nada aqui é novo estado: é a
   mesa, o arco, o vilão e a cena reduzidos ao que uma jogada precisa
   perguntar. Normalizar num lugar só existe pela razão de sempre — um
   `quando` que lê um campo que o chamador não manda é uma regra escrita
   sem código atrás, e essa é a classe de bug que esta casa mais repete.
   ============================================================ */
export function garantirSituacao(s) {
  const o = s && typeof s === "object" ? s : {};
  const b = (k) => !!o[k];
  const n = (k, d) => (Number.isFinite(Number(o[k])) ? Number(o[k]) : d);
  const t = (k) => (typeof o[k] === "string" && o[k] ? o[k] : null);
  return {
    /* o vilão: -1 quando ainda não há nenhum, e é o caso da maior parte
       das campanhas jovens */
    ordemDaFase: n("ordemDaFase", -1),
    vilaoConhecido: b("vilaoConhecido"),
    /* o arco como FRAÇÃO, nunca como nome: 0 é o começo, 1 é o último
       momento. O nome da etapa não entra neste arquivo em lugar nenhum,
       pela mesma razão que ele não entra no prompt (v9.84) */
    momento: Math.max(0, Math.min(1, n("momento", 0))),
    temperatura: t("temperatura") || "morna",
    pilarFaminto: t("pilarFaminto"),
    /* qual fio o mestre já escolheu — a forma tem de servir ao conteúdo */
    fio: t("fio") || "",
    pessoaNaCena: b("pessoaNaCena"),
    emCidade: b("emCidade"),
    emMasmorra: b("emMasmorra"),
    emCombate: b("emCombate"),
    emViagem: b("emViagem"),
    temPromessa: b("temPromessa"),
    temCicatriz: b("temCicatriz"),
    temDerrotado: b("temDerrotado"),
    temLugarAbandonado: b("temLugarAbandonado"),
    temRelogio: b("temRelogio"),
    pvBaixo: b("pvBaixo"),
    nivel: n("nivel", 1),
    fama: n("fama", 0),
  };
}

/* ============================================================
   A ESTANTE — as JOGADAS

   Cada uma tem:
     `quando`  — a condição de estado que a abre. É o que faz disto uma
                 consulta de mestre e não uma tabela de sorteio.
     `forma`   — a instrução que viaja no envelope. Curta de propósito:
                 ela diz o FORMATO, e deixa o conteúdo com a IA.
     `evite`   — o modo de falhar específico DESTA jogada. Toda forma tem
                 um jeito de sair errada, e é sempre o mesmo jeito.
     `serve`   — o pilar que ela alimenta, para o holofote poder pedi-la.
     `peso`    — quanto ela concorre quando várias estão abertas.

   As famílias estão na ordem em que um mestre pensa: como a coisa CHEGA,
   o que o inimigo OFERECE, o que a vitória CUSTA, o que fica PLANTADO, o
   que volta COLHIDO, onde a mesa RESPIRA, o que o jogador ESCOLHE, quem
   olha o herói NOS OLHOS, e como o perigo MOSTRA OS DENTES.
   ============================================================ */
export const JOGADAS = [
  /* ---------------- A CHEGADA: como a pressão entra ---------------- */
  {
    id: "mensageiro", escola: "saga", serve: "social", peso: 4,
    quando: (s) => s.emCidade && !s.emCombate,
    forma: "Faça isto chegar por alguém que veio até mim de propósito — e o recado que essa pessoa traz é MENOR do que a coisa que ela deixa escapar sem querer.",
    evite: "não faça o mensageiro explicar a situação inteira nem entregar um resumo do que está em jogo",
  },
  {
    id: "ausencia", escola: "misterio", serve: "exploracao", peso: 3,
    quando: (s) => !s.emCombate,
    forma: "Não faça nada chegar: faça eu NOTAR QUE FALTA. Uma coisa que devia estar aqui não está, e a cena não explica por quê.",
    evite: "não diga o que aconteceu com o que sumiu, e não faça um personagem aparecer para explicar a ausência",
  },
  {
    id: "rosto_conhecido", escola: "mesa", serve: "social", peso: 4,
    quando: (s) => s.pessoaNaCena || s.emCidade,
    forma: "Quem traz isto é alguém que eu JÁ CONHEÇO desta campanha. Comece pelo rosto, antes do assunto — eu tenho de reconhecer a pessoa antes de entender o que ela quer.",
    evite: "não invente um nome novo para isso: use gente que já apareceu, e se não houver ninguém, escolha outra forma",
  },
  {
    id: "ja_reagindo", escola: "saga", serve: "exploracao", peso: 3,
    quando: (s) => s.emCidade && !s.emMasmorra,
    forma: "Eu chego DEPOIS: quando entro na cena, outras pessoas já estão reagindo a isto. Mostre a reação delas primeiro, e o fato só pelo que a reação revela.",
    evite: "não deixe ninguém me narrar o acontecido em bloco; eu monto sozinho pelo que vejo",
  },
  {
    id: "objeto", escola: "formacao", serve: "exploracao", peso: 3,
    quando: () => true,
    forma: "Isto chega como COISA, não como pessoa nem como palavra: um objeto que está onde não devia, e que fala sozinho.",
    evite: "não explique a origem do objeto e não deixe ninguém interpretá-lo para mim nesta cena",
  },
  {
    id: "no_meio_do_pequeno", escola: "mesa", serve: "social", peso: 3,
    quando: (s) => !s.emCombate && !s.emMasmorra,
    forma: "Isto interrompe uma coisa PEQUENA e comum — uma refeição, um conserto, um pagamento. Gaste a primeira frase na coisa pequena e deixe ela inacabada.",
    evite: "não anuncie a interrupção com um silêncio dramático nem com todo mundo olhando para a porta",
  },

  /* ---------------- A OFERTA: o ofício do antagonista ---------------- */
  {
    id: "cortesia", escola: "tragedia", serve: "social", peso: 5,
    quando: (s) => s.ordemDaFase >= 2,
    forma: "Quem age contra mim é EDUCADO. Sem ameaça, sem voz alta, sem discurso: a gentileza é o que assusta, porque ela mostra que a pessoa não precisa de mais nada.",
    evite: "não faça ninguém rir de canto de boca, dizer que sou interessante nem prometer que nos veremos de novo",
  },
  {
    id: "oferta_justa", escola: "tragedia", serve: "social", peso: 5,
    quando: (s) => s.ordemDaFase >= 2 && !s.emCombate,
    forma: "Me ofereça alguma coisa que eu REALMENTE QUERO, por um preço que parece razoável. A oferta tem de ser boa de verdade — se ela é obviamente ruim, não é uma oferta, é uma cena de vilão.",
    evite: "não responda por mim, não deixe a oferta com uma pegadinha visível, e não me pressione a decidir agora",
  },
  {
    id: "espelho", escola: "tragedia", serve: "social", peso: 4,
    quando: (s) => s.ordemDaFase >= 3 && s.vilaoConhecido,
    forma: "Quem está do outro lado diz uma coisa VERDADEIRA sobre mim — algo que eu fiz nesta campanha e que não me deixa bem. Uma frase só, e sem lição de moral.",
    evite: "não invente um passado meu: use algo que aconteceu de verdade no jogo, e se não houver, escolha outra forma",
  },
  {
    id: "nao_esta_errado", escola: "tragedia", serve: "social", peso: 4,
    quando: (s) => s.ordemDaFase >= 3,
    forma: "Deixe a razão do outro lado APARECER, e deixe ela ser defensável. Quem fala não está tentando me convencer — está explicando, como quem já decidiu.",
    evite: "não transforme isto em debate e não me dê a réplica pronta; a palavra volta para mim com a dúvida em pé",
  },
  {
    id: "procurador", escola: "mesa", serve: "social", peso: 4,
    quando: (s) => s.ordemDaFase >= 1 && s.ordemDaFase < 3,
    forma: "Quem faz isto trabalha PARA o outro lado e não se acha vilão: tem motivo próprio, e o motivo é comum — dívida, medo, família, emprego.",
    evite: "não deixe essa pessoa saber do plano inteiro nem falar em nome de quem manda",
  },
  {
    id: "poupar", escola: "tragedia", serve: "combate", peso: 3,
    quando: (s) => s.ordemDaFase >= 3 && (s.pvBaixo || s.emCombate),
    forma: "O outro lado PODIA me acabar aqui e não acaba. Sem explicar por quê. A cena termina com ele indo embora e comigo inteiro.",
    evite: "não faça ninguém dizer que preciso viver por algum motivo, e não prometa um próximo encontro",
  },

  /* ---------------- O PREÇO: o que a vitória custa ---------------- */
  {
    id: "custo_lateral", escola: "tragedia", serve: "exploracao", peso: 4,
    quando: (s) => s.momento >= 0.3,
    forma: "Isto cobra por um lado que não estava em jogo: não em mim, não no que eu estava protegendo — em outra coisa, que eu vou reconhecer.",
    evite: "não me culpe pelo custo e não faça ninguém apontar que a culpa é minha; mostre o estrago e cale",
  },
  {
    id: "porta_fecha", escola: "misterio", serve: "exploracao", peso: 3,
    quando: (s) => s.momento >= 0.3 && !s.emCombate,
    forma: "Uma saída que eu TINHA some agora, em silêncio: um caminho que fecha, alguém que muda de lado, uma porta que deixa de estar aberta.",
    evite: "não anuncie que perdi uma opção e não me diga o que eu deveria ter feito antes",
  },
  {
    id: "alguem_pagou", escola: "saga", serve: "social", peso: 4,
    quando: (s) => s.temPromessa || s.temLugarAbandonado || s.temDerrotado,
    forma: "A conta de uma escolha minha ANTERIOR chega agora — e quem pagou foi outra pessoa, que não escolheu nada. Mostre a pessoa, não a conta.",
    evite: "não faça essa pessoa me acusar; a cobrança é o fato existir, não o discurso sobre ele",
  },
  {
    id: "vitoria_com_data", escola: "mesa", serve: "exploracao", peso: 3,
    quando: (s) => s.temRelogio && s.momento >= 0.2,
    forma: "O que eu ganhei é real e tem PRAZO. Deixe claro que funciona, e deixe visível — sem número e sem aviso — que não vai funcionar para sempre.",
    evite: "não diga quanto tempo resta e não transforme isso em contagem regressiva narrada",
  },

  /* ---------------- O PLANTIO: o que fica armado ---------------- */
  {
    id: "detalhe_solto", escola: "formacao", serve: "exploracao", peso: 4,
    quando: (s) => s.momento < 0.6,
    forma: "Dê a UM detalhe concreto mais atenção do que ele merece agora — um objeto, um hábito, uma marca, uma palavra. Sem sublinhar, sem comentar. Só demore um segundo a mais nele.",
    evite: "não diga que é importante, não faça personagem nenhum reparar nele, e não volte a ele nesta cena",
  },
  {
    id: "nome_repetido", escola: "misterio", serve: "social", peso: 3,
    quando: (s) => s.emCidade && s.momento < 0.7,
    forma: "Faça um NOME ser dito por alguém que não tem relação com quem o disse antes. Só o nome, de passagem, sem contexto novo.",
    evite: "não explique a coincidência e não deixe ninguém perguntar quem é",
  },
  {
    id: "regra_do_lugar", escola: "saga", serve: "exploracao", peso: 3,
    quando: (s) => s.emCidade || s.emMasmorra,
    forma: "Este lugar tem uma REGRA própria, e a cena a demonstra por alguém obedecendo-a — nunca por alguém explicando-a.",
    evite: "não faça um personagem recitar o costume local para mim; eu deduzo vendo",
  },

  /* ---------------- A COLHEITA: o que volta ---------------- */
  {
    id: "retorno_torto", escola: "formacao", serve: "social", peso: 5,
    quando: (s) => (s.temCicatriz || s.temDerrotado || s.temLugarAbandonado) && s.momento >= 0.35,
    forma: "Traga de volta uma coisa desta campanha com o SENTIDO trocado: o que era ajuda virou dívida, o que era vitória virou motivo, o que era seguro deixou de ser.",
    evite: "não reescreva o que aconteceu antes; o fato é o mesmo, só o que ele significa mudou",
  },
  {
    id: "eco", escola: "formacao", serve: "social", peso: 3,
    quando: (s) => s.momento >= 0.5 && s.pessoaNaCena,
    forma: "Faça alguém repetir, sem saber, uma frase que já foi dita nesta campanha por outra pessoa e em outra situação. Sem comentar a repetição.",
    evite: "não invente a frase anterior: se não houver uma no histórico, escolha outra forma",
  },

  /* ---------------- O RESPIRO: onde a mesa descansa ---------------- */
  {
    id: "calmaria_com_dente", escola: "mesa", serve: "exploracao", peso: 4,
    quando: (s) => s.temperatura === "fria" || s.temperatura === "morna",
    forma: "Cena calma, de verdade calma — e UMA coisa fora do lugar dentro dela, que a cena não comenta.",
    evite: "não faça a coisa fora do lugar virar perigo agora; ela fica lá, e é só",
  },
  {
    id: "gente_querendo", escola: "mesa", serve: "social", peso: 4,
    quando: (s) => !s.emCombate && (s.pessoaNaCena || s.emCidade),
    forma: "Quem está nesta cena quer alguma coisa PEQUENA e própria, que não tem nada a ver comigo — e pede, ou tenta, ou atrapalha por causa disso.",
    evite: "não transforme o desejo dessa pessoa em missão nem em gancho; ela quer o que quer e pronto",
  },
  {
    id: "riso_verdadeiro", escola: "mesa", serve: "social", peso: 2,
    quando: (s) => (s.temperatura === "morna" || s.temperatura === "fria") && !s.emCombate,
    forma: "Deixe a cena ter graça — e que a graça venha de alguém sendo exatamente quem é, não de uma piada colocada por cima.",
    evite: "não quebre o tom do mundo, não faça ninguém falar como gente de hoje e não termine com uma tirada",
  },

  /* ---------------- A ESCOLHA: onde eu decido ---------------- */
  {
    id: "duas_portas", escola: "mesa", serve: "exploracao", peso: 4,
    quando: (s) => s.momento >= 0.25 && !s.emCombate,
    forma: "Termine com DUAS possibilidades abertas e concretas, e as duas custam alguma coisa. Não sugira a terceira e não indique qual é a melhor.",
    evite: "não liste as opções como menu e não pergunte o que eu escolho; mostre as duas dentro da ficção e pare",
  },
  {
    id: "relogio_na_cena", escola: "saga", serve: "combate", peso: 4,
    quando: (s) => s.temRelogio || s.temperatura === "brasa",
    forma: "Ponha um limite de TEMPO dentro da própria cena, visível e físico — algo que está acabando enquanto eu penso.",
    evite: "não diga quantos turnos tenho e não conte o tempo em voz de sistema",
  },
  {
    id: "buraco_conhecido", escola: "misterio", serve: "exploracao", peso: 3,
    quando: (s) => s.momento >= 0.3,
    forma: "Deixe claro EXATAMENTE o que eu não sei — o tamanho do buraco, não o conteúdo dele. Eu decido sabendo que decido sem essa peça.",
    evite: "não me dê a peça que falta por acidente e não faça ninguém adivinhá-la em voz alta",
  },

  /* ---------------- O HOLOFOTE: quem me olha ---------------- */
  {
    id: "olhos_nos_olhos", escola: "mesa", serve: "social", peso: 4,
    quando: (s) => s.pilarFaminto === "social" || s.pessoaNaCena,
    forma: "Alguém me trata como PESSOA e não como solução: pergunta de mim, repara em mim, ou simplesmente fica. Sem pedir nada.",
    evite: "não termine isso com um pedido de ajuda disfarçado nem com uma missão",
  },
  {
    id: "fama_chega_antes", escola: "ascensao", serve: "social", peso: 4,
    /* 10 é o degrau de "Conhecido" em fama.js — "nas tavernas da região,
       alguém já ouviu seu nome". A primeira versão desta linha pedia 3, num
       jogo cuja régua de fama vai a 100: a jogada dispararia no dia 1, e um
       desconhecido teria a própria lenda contada torta antes de ter feito
       qualquer coisa. Limiar na escala errada é regra sem código atrás. */
    quando: (s) => s.fama >= 10 || s.nivel >= 5,
    forma: "Alguém já sabe de uma coisa que eu fiz — e a versão que chegou até essa pessoa está TORTA. Ela me trata pela versão dela, não pela verdade.",
    evite: "não me deixe corrigir sem esforço e não faça a pessoa aceitar a correção na mesma fala",
  },
  {
    id: "sozinho_no_alto", escola: "ascensao", serve: "social", peso: 3,
    quando: (s) => s.nivel >= 8 && s.momento >= 0.4,
    forma: "Mostre o preço do que eu virei: alguém que antes falava comigo de igual agora não fala — por respeito, por medo, ou porque não alcança mais.",
    evite: "não faça ninguém dizer que mudei e não me dê uma cena de autocomiseração",
  },
  {
    id: "chamado_pelo_meu", escola: "mesa", serve: "combate", peso: 3,
    quando: (s) => s.pilarFaminto === "combate" || s.nivel >= 3,
    forma: "Ponha na cena um problema com o FORMATO exato de uma coisa que eu sei fazer bem, e não avise que é para mim.",
    evite: "não deixe ninguém sugerir a solução e não facilite o problema por causa disso",
  },

  /* ---------------- OS DENTES: como o perigo se mostra ---------------- */
  {
    id: "dentes_em_outro", escola: "saga", serve: "combate", peso: 5,
    quando: (s) => !s.emCombate && s.momento >= 0.2,
    forma: "Mostre este perigo funcionando em OUTRA COISA primeiro — o que ele já fez, em quem, e como ficou. Eu vejo o resultado, não o ato.",
    evite: "não me atinja nesta cena e não faça o perigo reparar em mim ainda",
  },
  {
    id: "calmo_demais", escola: "tragedia", serve: "combate", peso: 3,
    quando: (s) => s.ordemDaFase >= 2,
    forma: "O que ameaça está CALMO. Não corre, não grita, não se apressa — e é a calma que diz que ele não tem por que se apressar.",
    evite: "não descreva olhos frios nem sorrisos lentos; a calma aparece no que a coisa faz, não em adjetivo",
  },
  {
    id: "saida_visivel", escola: "mesa", serve: "combate", peso: 4,
    quando: (s) => s.emMasmorra || s.emCombate || s.pvBaixo,
    forma: "O perigo vem COM a saída à vista: mostre o risco e, na mesma cena, mostre por onde daria para não pagá-lo.",
    evite: "não feche a saída depois de mostrá-la e não a apresente como armadilha óbvia",
  },

  /* ---------------- O MUNDO GRANDE ---------------- */
  {
    id: "vida_que_continua", escola: "saga", serve: "exploracao", peso: 3,
    quando: (s) => s.emCidade || s.emViagem,
    forma: "O mundo está fazendo uma coisa que NÃO tem relação comigo, e ela continua acontecendo enquanto eu ajo. Uma frase, sem me envolver.",
    evite: "não transforme isso em gancho, não faça ninguém me olhar e não volte a mencionar",
  },
  {
    id: "duas_versoes", escola: "misterio", serve: "social", peso: 3,
    quando: (s) => s.emCidade && s.momento >= 0.2,
    forma: "Duas pessoas contam a MESMA coisa de dois jeitos incompatíveis, e nenhuma das duas está mentindo por mal.",
    evite: "não revele qual é a verdadeira e não deixe uma terceira pessoa arbitrar",
  },
  {
    id: "poder_cobra", escola: "ascensao", serve: "exploracao", peso: 3,
    quando: (s) => s.momento >= 0.3,
    forma: "Mostre alguma coisa poderosa acontecendo no mundo e mostre, na mesma cena, o que ela CUSTOU a quem a fez.",
    evite: "não explique o sistema mágico e não faça disso uma aula sobre como o poder funciona",
  },
];

export function jogadaPorId(id) { return JOGADAS.find((j) => j.id === id) || null; }

/* ============================================================
   A MEMÓRIA DA ESTANTE

   Pelo motivo de sempre nesta casa: uma forma repetida duas vezes
   seguidas vira tique, e tique é pior que a monotonia que ele veio
   curar. Doze de memória, e as seis últimas ficam de fora do sorteio.
   ============================================================ */
export const NAO_REPETIR = 6;

export function garantirEstante(e) {
  const o = e && typeof e === "object" ? e : {};
  return { usadas: (Array.isArray(o.usadas) ? o.usadas : []).slice(-12) };
}

export function marcarJogada(estante, id) {
  const e = garantirEstante(estante);
  const k = String(id || "");
  if (!k) return e;
  return { usadas: [...e.usadas, k].slice(-12) };
}

/* ============================================================
   OS VETOS — onde uma forma boa é a forma errada

   A tabela acima diz quando cada jogada CABE. Esta diz quando ela não
   cabe de jeito nenhum, e é separada de propósito: um veto vale para a
   estante inteira e escrevê-lo trinta e nove vezes seria trinta e nove
   lugares para esquecer dele.
   ============================================================ */
export const VETOS = [
  {
    id: "brasa_nao_respira",
    quando: (s) => s.temperatura === "brasa",
    corta: (j) => j.escola === "mesa" && /respiro|calma|graça/i.test(j.forma),
    porque: "no meio de uma luta ou de um perigo em curso, uma cena calma não é respiro: é o sistema atrapalhando a melhor coisa que o jogador tem na mão",
  },
  {
    id: "sem_vilao_sem_oferta",
    quando: (s) => s.ordemDaFase < 0,
    corta: (j) => /outro lado|quem age contra mim|me ofereça/i.test(j.forma),
    porque: "sem antagonista não existe outro lado, e pedir a forma do inimigo quando não há inimigo é pedir à IA que invente um — que é exatamente o que o vilão veio impedir",
  },
  {
    id: "antes_do_rosto_nao_conversa",
    quando: (s) => !s.vilaoConhecido,
    corta: (j) => j.id === "espelho" || j.id === "poupar",
    porque: "as duas exigem que eu esteja diante DELE, e antes da revelação ele não aparece — quem apareceu foi a mão dele",
  },
  {
    id: "combate_nao_planta",
    quando: (s) => s.emCombate,
    corta: (j) => j.id === "detalhe_solto" || j.id === "nome_repetido" || j.id === "vida_que_continua",
    porque: "plantar exige atenção sobrando, e no meio da luta a atenção do jogador está inteira em outro lugar; o que se planta ali não é plantio, é ruído",
  },
];

/* ============================================================
   A CONSULTA

   O mestre chega com a situação e sai com UMA forma. Não com três para
   escolher, não com uma lista: uma. O mestre é quem decide, e um mestre
   que devolve opções ao narrador devolveu junto a decisão.

   `preferir` existe para o holofote: quando um pilar está passando fome,
   a jogada que serve esse pilar entra com peso dobrado — não obrigada,
   dobrada. A diferença importa: forçar o pilar faminto todo turno faria
   o holofote girar por dever, e girar por dever aparece.
   ============================================================ */
export function consultarBiblioteca(situacao, { sorte = Math.random, estante = null, preferir = null } = {}) {
  const s = garantirSituacao(situacao);
  const e = garantirEstante(estante);
  const vetos = VETOS.filter((v) => { try { return !!v.quando(s); } catch { return false; } });

  let abertas = JOGADAS.filter((j) => {
    try { if (!j.quando(s)) return false; } catch { return false; }
    for (const v of vetos) { try { if (v.corta(j)) return false; } catch { /* veto quebrado não veta */ } }
    return true;
  });
  if (!abertas.length) return null;

  /* as recém-usadas saem — a não ser que sair deixe a estante vazia, e aí
     repetir é melhor que não ter forma nenhuma */
  const recentes = new Set(e.usadas.slice(-NAO_REPETIR));
  const frescas = abertas.filter((j) => !recentes.has(j.id));
  if (frescas.length) abertas = frescas;

  const alvo = preferir || s.pilarFaminto || null;
  const peso = (j) => Math.max(1, j.peso) * (alvo && j.serve === alvo ? 2 : 1);
  const total = abertas.reduce((n, j) => n + peso(j), 0);
  let corte = sorte() * total;
  const j = abertas.find((x) => (corte -= peso(x)) <= 0) || abertas[0];
  return { id: j.id, escola: j.escola, serve: j.serve, forma: j.forma, evite: j.evite };
}

/* ============================================================
   O QUE SOBE AO PROMPT

   Duas linhas, dentro de um envelope que já ia ser enviado. E é aqui
   que a regra da casa aparece pela última vez neste arquivo: o nome da
   jogada NÃO viaja. A IA recebe a forma, não a etiqueta — porque uma IA
   que sabe que está fazendo "o mensageiro" escreve o mensageiro genérico
   que ela já viu mil vezes, e o que a gente quer é a cena.

   É a mesma razão pela qual o nome da etapa do arco parou de subir na
   v9.84. O vazamento nunca é dizer o nome: é escrever a etiqueta em vez
   da cena.
   ============================================================ */
export function trechoDaJogada(j) {
  if (!j || !j.forma) return "";
  return `\nA FORMA (escolhida pelo sistema, obrigatória): ${j.forma}\nE nesta: ${j.evite}.`;
}

/* O jogador não vê nada. Está aqui por simetria com os outros módulos —
   e para que a próxima pessoa que procurar "onde isto aparece na tela"
   encontre a resposta escrita, em vez de concluir que faltou fazer. */
export function linhaDaJogada() { return ""; }
