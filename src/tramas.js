/* ============================================================
   AS TRAMAS (v9.117) — a quest é o instrumento do Mestre

   "as quests serão do mestre, mural do mundo … já temos a estruturação do
   mundo e do caminho que ele vai seguir na criação, podemos fazer o mesmo
   com as quests … a quest acompanha a intenção do mestre e do mundo, não
   serão mais eventos aleatórios … por exemplo, para introduzir o vilão ele
   faz uma quest pra você escoltar alguém, daí no meio do caminho alguém
   intercepta e se apresenta, então os capangas dele te atacam."

   ---------------- O DEFEITO QUE ISTO CONSERTA ----------------

   Uma partida real, e três coisas quebradas na mesma missão:

     "matar três lobos num lugar que se chamava A Loja do Norte"
     "quando cheguei os lobos não estavam lá"
     "iam me mandando de lugar em lugar e não chegava nunca"

   As duas primeiras são erro de material — a praga nascia no LOCAL DE
   TRABALHO de quem oferecia, e o mundo não tinha sido lido. A terceira é
   estrutural, e é a mais grave que este projeto já teve: a etapa
   `derrotar` só CONFERE se você matou o bicho. Nada, em lugar nenhum do
   código, fazia o bicho aparecer.

   Quer dizer que a missão era um pedido ao Narrador — "faça surgir três
   lobos" — feito por um sistema que ao mesmo tempo o proíbe de abrir
   combate por conta própria. Ele obedeceu às duas ordens da única forma
   possível: narrou pegadas e sombras para sempre. Uma regra escrita sem
   código atrás, e desta vez o custo foi a missão inteira.

   ---------------- O QUE UMA TRAMA É ----------------

   Uma quest com INTENÇÃO e com DESFECHO EXECUTADO PELO SISTEMA.

     A INTENÇÃO   o que o Mestre quer que esta quest realize. Ela não é
                  sorteada: sai da etapa do arco, da fase do vilão e do
                  movimento da onda — os três sistemas que já sabiam para
                  onde a história ia, e que nunca tinham sido consultados
                  na hora de dar uma missão.

     O VEÍCULO    o que o jogador FAZ. Escoltar, entregar, procurar,
                  vigiar. Deliberadamente banal: o veículo não é o ponto,
                  é o transporte da intenção.

     A VIRADA     o que ACONTECE no meio do caminho, e quem a executa é o
                  CÓDIGO. Abrir o combate, pôr alguém na cena, fazer a
                  presa aparecer. Nunca um pedido ao Narrador para que ele
                  faça acontecer — foi exatamente isso que produziu as
                  pegadas eternas.

   ---------------- A DIVISÃO COM O MURAL ----------------

   O mural (ofertas.js) continua existindo e continua sorteado: são
   trabalhos do MUNDO, para XP e equipamento, e são opcionais. A trama é
   do MESTRE, e não é opcional — ela nasce ativa, porque a intenção dela
   é a história acontecendo, e uma história que se pode recusar no diário
   não é uma história, é um cardápio.

   ---------------- A REGRA QUE PROTEGE O JOGADOR ----------------

   A virada acontece; o DESFECHO dela não. O sistema põe o vilão na sua
   frente e abre a luta com os capangas — quem ganha, quem foge, o que se
   diz e o que se decide continua sendo do jogador e do Narrador. Uma
   trama que também escrevesse o fim seria um filme com um botão.
   ============================================================ */

import { FASES, faseDe } from "./vilao.js";

const limpar = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);
const inteiro = (v, d = 0) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : d);
const pick = (rnd, a) => a[Math.floor(rnd() * a.length)];

/* ---------------- A SITUAÇÃO ----------------
   A catraca de sempre: todo campo que um `quando` lê é normalizado aqui e
   entregue por quem chama. Um campo que só existe num dos dois lados é
   como esta casa produz bug há dezessete versões. */
export function garantirSituacao(s) {
  const o = s && typeof s === "object" ? s : {};
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  return {
    /* 0 a 1: onde estamos no arco */
    momento: Math.max(0, Math.min(1, num(o.momento, 0))),
    /* a fase do vilão, e a ordem dela — a ordem é o que os `quando` leem */
    faseVilao: FASES.some((f) => f.id === o.faseVilao) ? o.faseVilao : "",
    ordemDaFase: o.faseVilao ? faseDe(o.faseVilao).ordem : -1,
    temVilao: !!o.temVilao,
    vilaoConhecido: !!o.vilaoConhecido,
    /* o movimento da onda e o assunto dela */
    movimento: limpar(o.movimento, 20) || "respiro",
    assunto: limpar(o.assunto, 30),
    familia: limpar(o.familia, 20),
    /* o que o mundo tem para oferecer como material */
    temGrupo: !!o.temGrupo,
    temAliado: !!o.temAliado,
    temCidadeVizinha: !!o.temCidadeVizinha,
    temMasmorra: !!o.temMasmorra,
    temFaccao: !!o.temFaccao,
    temGenteConhecida: !!o.temGenteConhecida,
    temPromessaAberta: !!o.temPromessaAberta,
    nivel: Math.max(1, inteiro(o.nivel, 1)),
    /* o que já foi feito, para não repetir a mesma intenção duas vezes */
    intencoesFeitas: Array.isArray(o.intencoesFeitas) ? o.intencoesFeitas.map((x) => limpar(x, 30)) : [],
    tramasFeitas: Array.isArray(o.tramasFeitas) ? o.tramasFeitas.map((x) => limpar(x, 30)) : [],
  };
}

/* ---------------- AS INTENÇÕES ----------------
   O que o Mestre quer realizar, e QUANDO ele quer. Nada aqui é sorteado:
   cada `quando` lê a etapa do arco, a fase do vilão ou o movimento da
   onda — os três sistemas que já sabiam para onde a história ia.

   `uma` marca a intenção que só acontece UMA vez na campanha. Apresentar
   o rosto do vilão duas vezes não é uma repetição: é desfazer a primeira. */
export const INTENCOES = [
  {
    id: "dar_um_aliado", peso: 8, uma: false,
    quando: (s) => s.momento < 0.45 && !s.temGrupo,
    quer: "pôr na mão do herói alguém que valha a pena manter",
    aoMestre: "esta missão existe para o herói CONHECER alguém — a tarefa é o pretexto. Dê à pessoa uma vontade própria e um motivo para ficar depois que acabar",
  },
  {
    id: "abrir_o_mundo", peso: 7,
    quando: (s) => s.momento < 0.55 && s.temCidadeVizinha,
    quer: "tirar o herói de onde ele está e mostrar que o mundo é maior",
    aoMestre: "esta missão existe para o herói ver um lugar novo e uma gente com regras próprias. O que ele vai buscar importa menos que o que ele atravessa para buscar",
  },
  {
    id: "plantar_a_marca", daFase: true, peso: 10, uma: true,
    quando: (s) => s.temVilao && s.ordemDaFase <= 1,
    quer: "fazer o herói ENCONTRAR a assinatura do vilão sem saber de quem é",
    aoMestre: "no fim desta missão o herói encontra uma marca, um método ou uma frase que se repete. Ele NÃO descobre de quem é, e ninguém explica — juntar sozinho vale dez vezes mais do que ser informado",
  },
  {
    id: "mostrar_a_mao", daFase: true, peso: 12, uma: true,
    quando: (s) => s.temVilao && s.ordemDaFase === 2,
    quer: "fazer gente do vilão agir na frente do herói, sabendo quem ele é",
    aoMestre: "quem interrompe esta missão TRABALHA para o outro lado e sabe o nome do herói. Não são bandidos de estrada: têm ordem, método e pressa. O herói conhece o punho antes do rosto",
  },
  {
    id: "apresentar_o_rosto", daFase: true, peso: 14, uma: true,
    quando: (s) => s.temVilao && s.ordemDaFase === 3,
    quer: "o vilão em pessoa, e NÃO para lutar",
    aoMestre: "o vilão aparece no meio desta missão e o primeiro encontro NÃO é uma luta: é uma conversa, uma oferta ou uma demonstração. Se houver aço, é dos capangas dele, não dele. Quem luta com o vilão na estreia não tem clímax depois",
  },
  {
    id: "declarar_a_guerra", daFase: true, peso: 12, uma: true,
    quando: (s) => s.temVilao && s.ordemDaFase === 4,
    quer: "transformar a perseguição numa disputa entre dois",
    aoMestre: "esta missão termina com o plano do outro lado VISÍVEL e com o herói podendo atacá-lo. O mundo passa a escolher lado, e a escolha aparece em quem ajuda e em quem fecha a porta",
  },
  {
    id: "cobrar_o_que_prometi", peso: 9,
    quando: (s) => s.momento >= 0.3 && s.temPromessaAberta,
    quer: "fazer uma escolha antiga do herói voltar com juros",
    aoMestre: "esta missão nasce de uma coisa que o herói já fez ou prometeu. Quem cobra tem razão, e a razão dele é o que dói — não faça dele um vilão pequeno",
  },
  {
    id: "tirar_algo", peso: 11,
    quando: (s) => s.momento >= 0.5 && s.momento < 0.8,
    quer: "cobrar um preço de verdade, e não devolvê-lo",
    aoMestre: "esta missão CUSTA. Alguma coisa que o herói tinha não volta — um lugar, uma pessoa, uma porta que estava aberta. Não compense e não console: o preço é o conteúdo",
  },
  {
    id: "dar_o_degrau", peso: 10,
    quando: (s) => s.momento >= 0.65 && s.momento < 0.9,
    quer: "entregar o que vai faltar no fim, com custo",
    aoMestre: "no fim desta missão o herói sai com alguma coisa que ele vai precisar depois — um aliado, um saber, um caminho. E ela vem com um preço que já se paga aqui, à vista",
  },
  {
    id: "fechar_o_fio", peso: 10,
    quando: (s) => s.momento >= 0.85,
    quer: "amarrar uma ponta antes do desfecho",
    aoMestre: "esta missão fecha alguma coisa que ficou aberta na campanha. Não abra nada novo aqui: o que se pede é o encerramento, e ele pode doer",
  },
  /* A REDE. Sem uma intenção sempre disponível, uma campanha sem vilão e
     no meio do arco não teria nenhuma — e o Mestre voltaria a não dar
     quest nenhuma, que é o estado de antes com mais código. */
  {
    id: "apertar_o_mundo", peso: 4,
    quando: () => true,
    quer: "fazer o mundo cobrar espaço do herói",
    aoMestre: "esta missão mostra que o mundo não espera o herói: uma coisa está acontecendo e vai acontecer com ele ou sem ele. Ele decide se entra",
  },
];

/* O NOME É LONGO DE PROPÓSITO. `intencaoPorId` e `envelopeDaVirada` já
   existiam em `adversario.js` — o Adversário também tem intenções, e a
   "virada" dele é outra coisa: a mudança de plano de um bicho no meio da
   luta. Dois nomes iguais para duas coisas diferentes já custou uma
   colisão nesta casa (`linhaDaCobranca`, v9.112), e um import aliasado
   esconde o problema em vez de resolvê-lo: quem vier depois vai procurar
   pelo nome curto e achar o do outro módulo. */
export function intencaoDaTramaPorId(id) { return INTENCOES.find((i) => i.id === id) || null; }

/* ---------------- A ESCOLHA DA INTENÇÃO ----------------
   Determinística por semente, e por peso: a fase do vilão pesa mais que
   o resto porque é ela que tem hora marcada. Uma intenção `uma` já feita
   sai da urna — e se sobrar só a rede, é a rede que vale. */
export function escolherIntencao(situacao, { rnd = Math.random } = {}) {
  const s = garantirSituacao(situacao);
  const feitas = new Set(s.intencoesFeitas);
  const abertas = INTENCOES.filter((i) => {
    if (i.uma && feitas.has(i.id)) return false;
    try { return !!i.quando(s); } catch { return false; }
  });
  if (!abertas.length) return intencaoDaTramaPorId("apertar_o_mundo");
  /* as não repetidas primeiro; se todas já foram, repete a mais pesada */
  const frescas = abertas.filter((i) => !feitas.has(i.id));
  let urna = frescas.length ? frescas : abertas;
  /* ---------------- A FASE MANDA, NÃO OPINA (v9.117) ----------------
     Com peso, a intenção da fase do vilão saía em 22 sorteios de 40 — e
     "a maioria das vezes" não é o que o pedido descreve. As batidas do
     vilão têm HORA MARCADA: quando a fase pede uma, ela é a intenção, e
     o resto da urna espera a próxima trama.

     Peso continua valendo entre as OUTRAS, que de fato competem. */
  const daFase = urna.filter((i) => i.daFase);
  if (daFase.length) urna = daFase;
  const total = urna.reduce((n, i) => n + Math.max(1, i.peso), 0);
  let corte = rnd() * total;
  return urna.find((i) => (corte -= Math.max(1, i.peso)) <= 0) || urna[0];
}

/* ---------------- AS VIRADAS ----------------
   O que ACONTECE, e quem executa é o código. Este é o coração do
   conserto: uma virada nunca é um pedido ao Narrador para que ele faça
   surgir alguma coisa — é uma ordem ao App, que abre o combate, põe a
   pessoa na cena ou avança a fase do vilão.

   `tipo` é o que o App sabe executar. Um tipo novo aqui sem leitor lá é
   uma virada que não acontece — e é exatamente o defeito que este
   arquivo existe para não repetir, então o teste confere os dois lados. */
export const TIPOS_DE_VIRADA = [
  { id: "emboscada", o: "o sistema ABRE o combate, com inimigos de verdade" },
  { id: "encontro", o: "o sistema põe alguém na cena, com nome e com ordem própria" },
  /* A revelação NÃO avança a fase do vilão, e a tentação era grande. Quem
     move o vilão é `vilao.js`, num tique diário, por um plano de nove
     passos — e uma trama que também o movesse seria a segunda porta para
     a mesma regra, que é como esta casa produz bug desde sempre. O que
     ela entrega é a DESCOBERTA: o que estava por baixo da missão fica à
     vista, e a fase continua andando pelo caminho dela. */
  { id: "revelacao", o: "o sistema entrega a descoberta que estava por baixo da missão" },
  { id: "cacada", o: "o sistema faz a presa aparecer no lugar marcado e abre a luta" },
];
export function tipoDeViradaPorId(id) { return TIPOS_DE_VIRADA.find((t) => t.id === id) || null; }

/* ---------------- OS VEÍCULOS ----------------
   Deliberadamente banais. O veículo não é o ponto — é o transporte da
   intenção, e uma quest que chama atenção para o próprio formato rouba a
   cena da coisa que ela existe para fazer acontecer.

   `precisa` é a mesma trava de `ofertas.js`: sem o material, o molde não
   entra. Uma escolta sem cidade vizinha seria uma escolta para lugar
   nenhum. */
export const VEICULOS = [
  {
    id: "escolta", serve: ["apresentar_o_rosto", "mostrar_a_mao", "abrir_o_mundo", "dar_um_aliado"],
    precisa: ["cidade", "pessoa"],
    montar: ({ pessoa, cidade }) => ({
      titulo: `Levar ${pessoa.nome} até ${cidade.nome}`,
      descricao: `${pessoa.nome} precisa chegar a ${cidade.nome} e não vai sozinho. A estrada é o que é.`,
      etapas: [{ tipo: "ir_a", alvo: cidade.nome }],
    }),
    virada: { apos: 0, tipo: "emboscada", onde: "na estrada", quantos: 3, ameaca: "competente" },
  },
  {
    id: "entrega_marcada", serve: ["plantar_a_marca", "abrir_o_mundo", "cobrar_o_que_prometi"],
    precisa: ["cidade", "pessoa"],
    montar: ({ pessoa, cidade, objeto }) => ({
      titulo: `O que ${pessoa.nome} manda a ${cidade.nome}`,
      descricao: `${pessoa.nome} entrega um ${objeto} lacrado e pede que chegue a ${cidade.nome} sem ser aberto.`,
      etapas: [{ tipo: "ir_a", alvo: cidade.nome }],
    }),
    virada: { apos: 0, tipo: "encontro", onde: "no caminho", papel: "quem estava esperando" },
  },
  {
    id: "vigia", serve: ["mostrar_a_mao", "plantar_a_marca", "apertar_o_mundo"],
    precisa: ["local", "pessoa"],
    montar: ({ pessoa, local }) => ({
      titulo: `Ficar de olho em ${local.nome}`,
      descricao: `${pessoa.nome} quer saber quem entra e quem sai de ${local.nome}, e prefere não perguntar em voz alta.`,
      etapas: [{ tipo: "aguentar", dias: 1 }],
    }),
    virada: { apos: 0, tipo: "encontro", onde: "ali mesmo", papel: "quem não devia estar ali" },
  },
  {
    id: "limpar_o_ninho", serve: ["apertar_o_mundo", "abrir_o_mundo", "dar_o_degrau"],
    precisa: ["criatura", "ermo"],
    montar: ({ criatura, ermo, pessoa }) => ({
      titulo: `O ninho ${ermo.nome ? `d${ermo.nome.startsWith("a ") ? "" : "e "}${ermo.nome}` : "no ermo"}`,
      descricao: `${criatura.nome} fez ninho ${ermo.nome ? `em ${ermo.nome}` : "perto daqui"}, e ${pessoa ? pessoa.nome : "o povo daqui"} não consegue mais passar por lá.`,
      etapas: [{ tipo: "derrotar", alvo: criatura.nome, quantos: 3, onde: ermo.nome || "" }],
    }),
    /* A CAÇADA É A VIRADA. É este tipo que impede a missão dos três lobos
       de acontecer de novo: quando o herói chega ao lugar marcado, quem
       faz a presa aparecer é o sistema. */
    virada: { apos: 0, tipo: "cacada", quantos: 3, ameaca: "comum" },
  },
  {
    id: "tirar_de_la", serve: ["dar_um_aliado", "tirar_algo", "cobrar_o_que_prometi"],
    precisa: ["pessoa", "ermo"],
    montar: ({ pessoa, sumido, ermo }) => ({
      titulo: `Tirar ${sumido} de lá`,
      descricao: `${sumido} não voltou de ${ermo.nome || "perto daqui"}. ${pessoa.nome} paga para trazer de volta — vivo, se der.`,
      etapas: [{ tipo: "ir_a", alvo: ermo.nome || "", lugar: true }],
    }),
    virada: { apos: 0, tipo: "cacada", quantos: 2, ameaca: "competente" },
  },
  {
    id: "a_reuniao", serve: ["declarar_a_guerra", "apresentar_o_rosto", "fechar_o_fio"],
    precisa: ["local", "pessoa"],
    montar: ({ pessoa, local }) => ({
      titulo: `A conversa em ${local.nome}`,
      descricao: `Mandaram chamar o herói em ${local.nome}. ${pessoa.nome} diz que é melhor ir, e não diz por quê.`,
      etapas: [{ tipo: "ir_a", alvo: local.nome, lugar: true }],
    }),
    virada: { apos: 0, tipo: "encontro", onde: "lá dentro", papel: "quem mandou chamar" },
  },
  {
    id: "o_que_ficou", serve: ["tirar_algo", "fechar_o_fio", "cobrar_o_que_prometi"],
    precisa: ["local", "pessoa"],
    montar: ({ pessoa, local }) => ({
      titulo: `O que sobrou em ${local.nome}`,
      descricao: `Aconteceu alguma coisa em ${local.nome}, e ${pessoa.nome} pede que alguém vá ver antes que o resto da cidade vá.`,
      etapas: [{ tipo: "ir_a", alvo: local.nome, lugar: true }],
    }),
    virada: { apos: 0, tipo: "revelacao", onde: "no meio do que sobrou" },
  },
];

export function veiculoPorId(id) { return VEICULOS.find((v) => v.id === id) || null; }

/* ---------------- MONTAR A TRAMA ----------------
   A intenção escolhe o veículo, e não o contrário. É toda a diferença
   entre este arquivo e o mural: lá se sorteia um molde e o resultado é o
   que for; aqui se decide o que tem de acontecer e só então se procura
   como fazer acontecer. */
export function montarTrama({ situacao, material, semente = "trama", rnd = null } = {}) {
  const s = garantirSituacao(situacao);
  const r = rnd || (() => Math.random());
  const mat = material || {};
  const intencao = escolherIntencao(s, { rnd: r });
  if (!intencao) return null;

  const temMaterial = (v) => v.precisa.every((p) => (
    p === "cidade" ? !!(mat.cidade && mat.cidade.nome)
      : p === "pessoa" ? !!(mat.pessoa && mat.pessoa.nome)
        : p === "local" ? !!(mat.local && mat.local.nome)
          : p === "criatura" ? !!(mat.criatura && mat.criatura.nome)
            : p === "ermo" ? !!(mat.ermo && mat.ermo.nome)
              : false
  ));

  const servem = VEICULOS.filter((v) => v.serve.includes(intencao.id) && temMaterial(v));
  /* sem veículo para a intenção, tenta QUALQUER veículo com material: uma
     intenção sem corpo não vira missão, e ficar sem missão é o estado de
     antes. A intenção continua sendo a do Mestre — muda só o transporte. */
  const urna = servem.length ? servem : VEICULOS.filter(temMaterial);
  if (!urna.length) return null;
  const frescos = urna.filter((v) => !s.tramasFeitas.includes(v.id));
  const veiculo = pick(r, frescos.length ? frescos : urna);

  const corpo = veiculo.montar({ ...mat, sumido: mat.sumido || "quem sumiu", objeto: mat.objeto || "pacote" });
  if (!corpo || !corpo.etapas || !corpo.etapas.length) return null;

  return {
    id: `tr_${veiculo.id}_${intencao.id}`.slice(0, 40),
    veiculo: veiculo.id,
    intencao: intencao.id,
    titulo: limpar(corpo.titulo, 70),
    descricao: limpar(corpo.descricao, 240),
    dador: limpar((mat.pessoa && mat.pessoa.nome) || "", 40),
    etapas: corpo.etapas,
    nivel: s.nivel,
    /* a virada viaja JUNTO com a missão, porque é ela que faz a missão
       acontecer — guardá-la em outro lugar seria a mesma separação que
       deixou os lobos sem aparecer */
    virada: { ...veiculo.virada, feita: false },
  };
}

/* ---------------- A VIRADA ACONTECEU? ----------------
   Chamado a cada turno pelo App. Devolve a virada QUANDO ela é devida —
   e devolve uma vez só, porque `feita` viaja no save.

   A régua é a etapa: a virada é `apos: N`, e ela dispara quando a etapa N
   é cumprida. Numa escolta de uma etapa, isso é chegar. */
export function viradaDevida(missao, { etapasFeitas = 0 } = {}) {
  const v = missao && missao.virada;
  if (!v || v.feita) return null;
  if (!tipoDeViradaPorId(v.tipo)) return null;
  if (etapasFeitas <= inteiro(v.apos, 0)) return null;
  return v;
}

/* ---------------- O QUE SOBE AO NARRADOR ---------------- */
export function envelopeDaTrama(trama) {
  const i = intencaoDaTramaPorId(trama && trama.intencao);
  if (!i) return "";
  return `[MISSÃO DO SISTEMA — "${trama.titulo}"] ${trama.descricao} Esta missão JÁ ESTÁ no diário do herói e é do sistema: não a proponha de novo, não a conclua e não a resolva.
A INTENÇÃO desta missão, e ela é obrigatória: ${i.aoMestre}. Apresente o pedido na ficção — quem pede, como pede, o que não diz — e devolva a vez. O que acontece no meio do caminho chega a você por envelope quando for a hora; não antecipe.`;
}

export function envelopeDoQueVira(virada, { alvo = "", quem = "", vilao = "" } = {}) {
  const t = tipoDeViradaPorId(virada && virada.tipo);
  if (!t) return "";
  if (virada.tipo === "emboscada") {
    return `[A MISSÃO VIRA — DECIDIDO PELO SISTEMA] ${virada.onde || "No meio do caminho"}, gente armada fecha o caminho do herói, e o SISTEMA já abriu a luta com eles${vilao ? ` — eles trabalham para ${vilao} e sabem o nome do herói` : ""}. Narre a interceptação e o primeiro instante: quem são, o que dizem antes do aço. NÃO decida o desfecho e NÃO mate ninguém — o combate está aberto e é do jogador.`;
  }
  if (virada.tipo === "encontro") {
    return `[A MISSÃO VIRA — DECIDIDO PELO SISTEMA] ${virada.onde || "Aqui"}, ${quem || "alguém"} aparece — ${virada.papel || "e estava esperando"}. Encene a chegada e o que essa pessoa quer, em 1ª pessoa. Ela tem ordem própria e não veio por acaso. NÃO abra combate por conta própria e NÃO resolva nada: devolva a vez ao jogador.`;
  }
  if (virada.tipo === "revelacao") {
    return `[A MISSÃO VIRA — DECIDIDO PELO SISTEMA] ${virada.onde || "Aqui"}, o herói encontra o que estava por baixo desta missão. O sistema já registrou o que mudou; a você cabe a CENA da descoberta — o que se vê, e nada do que aquilo significa. Sem explicação e sem quem explique.`;
  }
  return `[A MISSÃO VIRA — DECIDIDO PELO SISTEMA] ${alvo ? `${alvo} está aqui` : "A presa está aqui"}, e o SISTEMA já abriu a luta. Narre o instante em que eles aparecem — de onde vêm, quantos são, o que se ouve primeiro. NÃO decida o desfecho: o combate é do jogador.`;
}

export const TRAMAS_PROMPT = `MISSÕES DO SISTEMA (v9.117 — quest é do MESTRE, mural é do MUNDO):
- As missões do diário marcadas como do sistema NÃO são sorteadas: cada uma carrega uma INTENÇÃO da história, escolhida pela etapa do arco e pela fase da ameaça. O envelope diz qual é, e ela é obrigatória.
- O QUE ACONTECE NO MEIO DELAS É DO CÓDIGO. Emboscada, encontro, a presa que aparece — tudo chega por envelope [A MISSÃO VIRA], já resolvido. Nunca faça acontecer por conta própria e nunca antecipe: uma missão de matar três bichos NÃO se resolve com pegadas e sombras, e você não precisa inventar o encontro, ele chega.
- O MURAL continua sendo o mundo: trabalhos avulsos, opcionais, por dinheiro e por equipamento. Esses o jogador aceita ou recusa. As missões do sistema já estão aceitas.`;
