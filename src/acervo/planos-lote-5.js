/* ============================================================
   OS PLANOS, LOTE 5 — o Espelho, o Penitente, o Fomentador e a Viúva
   do Trono (09/11/2026, Fase BQ · BQ8)

   A pessoa, 09/11: «termine o acervo» — vinte arquétipos com plano. Este
   lote leva-os de 16 a 20: os quatro que ainda andavam pelo PLANO_DE_RECUO
   (os seis passos genéricos de vilao.js, com a voz de ninguém). Com ele, a
   porta do recuo fica sem ninguém a passar por ela — e continua aberta,
   para o arquétipo que um dia nascer sem plano.

   Os quatro, e porque cada um é o jogador com um passo a mais (a regra 5):
     · o ESPELHO faz o que o herói faz, um passo além — os passos são os
       combates dele repetidos até ao fim, a arma dele copiada em ferro
       pior, e uma escola onde se ensina o golpe dele a quem não pergunta
       porquê;
     · o PENITENTE colige os erros do herói com data e testemunha — os
       passos juntam quem o viu falhar, escrevem o livro, e levam-no a
       quem ele salvou; o fim é uma votação, e não uma batalha;
     · o FOMENTADOR arma os dois lados — por dentro da região, e não contra
       outra (isso é o General Sem Guerra): duas casas com uma conta antiga,
       a mesma forja para as duas, o primeiro sangue sem cara, e as terras
       do meio compradas a quem foge;
     · a VIÚVA DO TRONO governa por procuração — luto pelo morto certo,
       viúvas casadas com quem lhe obedece, o herdeiro envenenado à mesa,
       e o conselho a jurar um papel que ninguém leu até ao fim.

   UM LOTE NÃO IMPORTA NADA (a forma está no cabeçalho do lote 4): o
   vocabulário é de `plano-do-vilao.js` e de `biblioteca-de-quests.js`, que
   importam o lote e o provam. O `contra` segue o molde dos lotes 2 a 4 (o
   1 e o 2 pelo tenente e pelo recurso, o 3 pela consequência, a pista e o
   tenente, o 4 pela pista e pelo recurso, o 5 pelo rosto, o 6 só pelo
   confronto), para que toda quest do catálogo caiba no passo que contesta.

   A VOZ (a régua da suíte): nenhuma linha de presságio, obra ou desvio tem
   dono, diz «vilão», «inimigo», «plano» ou «sistema», ou põe o nome do
   herói na boca dele. E nenhuma lhe dá género: a Viúva pode ter cara de
   bicho, se o mundo lha der, e o que se sente antes de se ver é o luto,
   não quem o veste.
   ============================================================ */
const passo = (diz, presagio, obra, seTravado, contra, muda, custa, prazo) =>
  ({ diz, presagio, obra, seTravado, contra, muda, custa, prazo });

export const PLANOS_LOTE_5 = {
  planos: {
    espelho: [
      passo("acabar cada combate que eu deixei a meio",
        "nos sítios onde lutei aparecem, dias depois, outros caídos, todos do mesmo lado",
        "onde deixei alguém ferido e vivo, voltaram de noite e acabaram o que eu tinha deixado a meio",
        "quem eu deixei vivo esconde-se a tempo, e quem vinha acabar o serviço corta só o ar",
        ["tenente", "recurso"], ["relacao", "relogio"], "gente", 1),
      passo("forjar a minha arma em ferro pior, e vendê-la nas feiras",
        "os ferreiros da região recebem encomendas da mesma lâmina, com o mesmo defeito no mesmo sítio",
        "há cópias da minha arma à venda em todas as feiras, e quem as compra quer ser como eu",
        "a forja das cópias fecha, e as que já se venderam enferrujam na mão de quem as comprou",
        ["tenente", "recurso"], ["estrada", "relacao"], "lugar", 1),
      passo("fazer de quem eu poupei um exemplo",
        "alguém que eu deixei viver anda a ser seguido de cidade em cidade, e não sabe por quem",
        "quem eu tinha poupado apareceu à porta da cidade, de pé e sem a mão da espada, com a minha marca ao peito",
        "quem eu poupei muda de nome a tempo, e a marca fica gravada numa porta vazia",
        ["consequencia", "pista", "tenente"], ["base", "cativeiro"], "gente", 1.2),
      passo("abrir uma escola onde se ensina o meu golpe",
        "os rapazes da região treinam nos largos um golpe que eu reconheço, e erram-no do mesmo lado",
        "há uma escola de lâminas na região onde se aprende primeiro a cair como eu caio, e depois a não cair",
        "a escola perde metade dos alunos numa noite, e os que ficam treinam com mais raiva",
        ["pista", "recurso"], ["postura", "porta"], "voz", 1),
      passo("desafiar-me numa praça cheia, com a minha arma na mão",
        "deixam-me à porta, embrulhada em pano, uma lâmina igual à minha, com o fio virado para dentro",
        "estive diante de quem luta como eu, numa praça cheia, e só um dos dois sabia o golpe que vinha a seguir",
        "o desafio fica por responder, e a praça conta que fui eu que não apareci",
        ["rosto", "tenente"], ["postura"], "esperanca", 1.3),
      passo("pôr a região inteira a medir-se pela lâmina",
        "não há rapaz na região que não traga ao cinto uma cópia da minha arma, nem rixa que acabe em palavras",
        "a região passou a resolver tudo à lâmina, e o primeiro corte de cada rixa é sempre o meu",
        "a região pousa as lâminas copiadas, e em dois invernos já ninguém se lembra de quem as ensinou",
        ["confronto"], ["postura", "relacao", "relogio"], "tudo", 1.5),
    ],
    penitente: [
      passo("juntar as testemunhas dos meus piores dias",
        "alguém pergunta nas tabernas por quem me viu falhar, e paga o copo a quem se lembra",
        "três pessoas que me viram no pior dia da minha vida mudaram-se para a mesma cidade, e alguém lhes paga a renda",
        "uma testemunha recusa-se a falar, e as outras passam a lembrar-se com mais pormenor",
        ["tenente", "recurso"], ["relacao", "relogio"], "gente", 1),
      passo("passar a limpo o livro dos meus erros, com data e lugar",
        "um copista anda a passar a limpo histórias que eu reconheço, e só erra nos nomes dos mortos",
        "corre de mão em mão um caderno com cada coisa que fiz mal desde que cheguei, numa letra muito bonita",
        "o caderno arde numa estalagem, e começa-se outro, com uma página a mais",
        ["tenente", "recurso"], ["relacao", "porta"], "voz", 1),
      passo("mostrar a quem eu salvei quanto custou a salvação",
        "aparecem flores frescas no sítio exato onde eu quase morri, e ninguém as viu pôr",
        "uma aldeia que eu salvei fechou-me a porta, depois de lhe mostrarem quem pagou por ela noutra aldeia",
        "a aldeia ouve tudo até ao fim, e abre-me a porta na mesma, mais devagar",
        ["consequencia", "pista", "tenente"], ["porta", "base"], "gente", 1.2),
      passo("pôr quem perdeu alguém por minha causa a falar em praça",
        "há gente de luto a ensaiar em voz baixa o que vai dizer, e alguém lhe corrige as palavras",
        "numa praça cheia, cada um que perdeu alguém por um erro meu disse em voz alta quem perdeu, um a um",
        "metade não aparece, e a praça fica a ouvir o silêncio de quem faltou",
        ["pista", "recurso"], ["postura", "porta"], "voz", 1),
      passo("pregar a lista à porta onde eu durmo, e esperar sentado ao lado",
        "acordo com um prego novo na porta do quarto, à altura dos olhos, sem nada pendurado",
        "estive diante da lista inteira pregada à minha porta, e de quem a escreveu, sentado ao lado dela, à espera",
        "a lista é arrancada antes de eu chegar, e à porta fica só o prego",
        ["rosto", "tenente"], ["postura"], "esperanca", 1.3),
      passo("pôr a região a votar se eu fico",
        "em cada praça da região há uma urna nova, e ninguém diz para que serve",
        "a região votou a minha partida, e as portas fecharam-se uma a uma, com a lista pregada por fora",
        "a votação empata, e a urna fica a apodrecer à chuva no meio da praça",
        ["confronto"], ["porta", "postura"], "tudo", 1.5),
    ],
    fomentador: [
      passo("achar duas casas com uma conta por acertar",
        "velhas questões de marcos e de águas voltam às bocas, contadas por quem não é de lá",
        "duas famílias da região que não se falavam há vinte anos voltaram a cuspir no chão quando se cruzam",
        "as duas famílias casam um filho com uma filha, e procura-se outra rixa noutro vale",
        ["tenente", "recurso"], ["relacao", "relogio"], "gente", 1),
      passo("vender as primeiras armas às duas, ao mesmo preço",
        "carroças tapadas entram nas duas aldeias na mesma noite, conduzidas pelo mesmo cocheiro",
        "as duas casas armaram-se no mesmo mês, e as lâminas de uma e de outra saíram da mesma forja",
        "uma das casas manda a carroça para trás, e a outra recebe o dobro",
        ["tenente", "recurso"], ["estrada", "base"], "lugar", 1),
      passo("fazer correr o primeiro sangue de noite, sem cara",
        "acha-se um cão de guarda degolado à porta de uma das casas, com a cabeça virada para a outra",
        "um filho de uma das casas apareceu morto no caminho da outra, e as duas já juraram vingança no mesmo dia",
        "o morto é reconhecido como alguém de fora, e as duas casas ficam a olhar uma para a outra sem saber",
        ["consequencia", "pista", "tenente"], ["perigo", "base"], "gente", 1.2),
      passo("comprar as terras de quem fugir da briga",
        "um homem bem-educado oferece bom preço pelas quintas do meio, entre as duas casas, e paga adiantado",
        "as quintas do meio mudaram todas de dono numa só estação, e o dono novo não mora lá",
        "um lavrador recusa vender, e na semana seguinte vê-se a quinta dele arder das duas janelas",
        ["pista", "recurso"], ["base", "estrada"], "lugar", 1),
      passo("pôr-me as duas bandeiras à frente, para eu escolher uma",
        "acordo com duas espadas cruzadas à porta, cada uma com a fita de uma das casas",
        "estive diante de quem arma as duas casas, e ofereceu-me o comando da que eu escolhesse, com o mesmo sorriso",
        "a oferta fica no ar, e as duas casas ficam a saber que fui procurado",
        ["rosto", "tenente"], ["postura"], "esperanca", 1.3),
      passo("meter a região inteira dentro da briga",
        "não há aldeia que não tenha escolhido uma cor, nem mesa onde se coma sem lado",
        "a briga das duas casas engoliu a região, e já ninguém sabe dizer por que marco começou",
        "as duas casas cansam-se no mesmo inverno, e enterram os mortos no mesmo chão",
        ["confronto"], ["postura", "relogio", "estrada"], "tudo", 1.5),
    ],
    viuva_do_trono: [
      passo("vestir luto pelo morto certo",
        "alguém de preto aparece em todos os enterros da região, mesmo nos de quem nunca conheceu",
        "o velho senhor da região morreu de uma febre curta, e à cabeceira só estava alguém de luto",
        "o velho sara da febre, e muda de cozinheira no mesmo dia",
        ["tenente", "recurso"], ["relacao", "relogio"], "gente", 1),
      passo("casar as viúvas da corte com quem obedece",
        "as viúvas da região recebem pretendentes que não pediram, todos com o mesmo anel",
        "três viúvas da corte casaram no mesmo mês, e os três maridos trazem ao dedo o anel de um morto",
        "uma viúva recusa o anel, e é ela quem passa a ser vigiada",
        ["tenente", "recurso"], ["relacao", "porta"], "voz", 1),
      passo("envenenar o herdeiro que estava à frente na linha",
        "um rapaz de boa casa anda pálido há uma lua, e o médico dele é novo",
        "o herdeiro da frente morreu à mesa, e no velório houve quem sorrisse de lábios fechados",
        "o herdeiro vomita a tempo, e a cozinha inteira da casa é trocada numa noite",
        ["consequencia", "pista", "tenente"], ["base", "cativeiro"], "gente", 1.2),
      passo("pôr o conselho a jurar pela procuração",
        "os conselheiros assinam papéis numa casa de luto, a horas em que ninguém assina nada",
        "o conselho jurou obedecer a quem governa em nome do trono vazio, e ninguém leu o papel até ao fim",
        "um conselheiro lê o papel até ao fim, em voz alta, e recusa-se a jurar",
        ["pista", "recurso"], ["porta", "postura"], "voz", 1),
      passo("receber-me de luto num velório, com uma cadeira à direita",
        "chega-me um convite de luto para o velório de alguém que eu sei que ainda está vivo",
        "estive diante de alguém de luto num velório que pagou, e ofereceu-me a cadeira à sua direita",
        "o velório acaba antes de eu chegar, e fica uma cadeira vazia à direita do caixão",
        ["rosto", "tenente"], ["postura"], "esperanca", 1.3),
      passo("ocupar o trono vazio de crepe negro",
        "o trono da região está coberto de crepe negro, e ninguém sabe quem mandou cobri-lo",
        "alguém de luto sentou-se no trono vazio, e a corte curvou-se inteira sem ninguém dizer a palavra",
        "a corte fica de pé, e o trono fica vazio mais um inverno, coberto de crepe",
        ["confronto"], ["base", "postura"], "tudo", 1.5),
    ],
  },
  fraquezas: {
    pessoa: [
      { id: "p_primeiro_mestre", o: "o primeiro mestre de armas dele, que o expulsou da escola por gostar demais de ganhar, e que ainda lhe corrige a guarda com um olhar", arquetipo: "espelho" },
      { id: "p_salvo_por_erro", o: "a única pessoa que ele salvou por engano, e que lhe perdoou um dia sem que ele pedisse", arquetipo: "penitente" },
      { id: "p_irmao_maneta", o: "o irmão que ele armou contra o pai, e que voltou da briga sem uma mão e sem rancor nenhum", arquetipo: "fomentador" },
      { id: "p_ama_do_filho", o: "a ama que lhe criou o filho morto, e que viu de que mão veio o caldo dessa noite", arquetipo: "viuva_do_trono" },
    ],
    coisa: [
      { id: "c_lamina_rachada", o: "a primeira arma que ele copiou, rachada no sítio onde a original nunca rachou", arquetipo: "espelho", nome: "lâmina rachada" },
      { id: "c_diario_dos_erros", o: "o diário dos erros dele próprio, que nunca mostrou a ninguém, com a primeira página arrancada", arquetipo: "penitente", nome: "diário dos erros" },
      { id: "c_livro_de_encomendas", o: "o livro de encomendas da forja, com as duas casas na mesma página e a mesma letra", arquetipo: "fomentador", nome: "livro de encomendas" },
      { id: "c_frasco_azul", o: "o frasco de cristal azul que nunca sai da manga, e que cheira a amêndoa", arquetipo: "viuva_do_trono", nome: "frasco azul" },
    ],
    verdade: [
      { id: "v_vitorias_compradas", o: "ele nunca ganhou um combate limpo: os adversários dele bebiam antes, de um vinho que ele pagava", arquetipo: "espelho" },
      { id: "v_o_erro_dele", o: "o erro maior da lista não é do herói: é dele, e foi ele quem o pôs no nome de outro", arquetipo: "penitente" },
      { id: "v_a_primeira_briga", o: "a primeira briga que ele armou foi entre os próprios pais, e o pai morreu nela", arquetipo: "fomentador" },
      { id: "v_o_primeiro_luto", o: "o morto que ela chora há vinte anos foi o primeiro que envenenou", arquetipo: "viuva_do_trono" },
    ],
  },
  afinidade: {
    soldado: { espelho: 1, fomentador: 1 },
    cacador: { espelho: 1 },
    ferreiro: { espelho: 1, fomentador: 2 },
    ladrao: { fomentador: 1 },
    pragado: { penitente: 2 },
    naufrago: { penitente: 1 },
    orfao: { penitente: 1 },
    nobre_caido: { viuva_do_trono: 1 },
    artista: { viuva_do_trono: 2 },
  },
};
