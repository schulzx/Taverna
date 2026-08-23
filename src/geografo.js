/* ============================================================
   O GEÓGRAFO (v9.104) — o conselheiro do espaço

   Treze módulos desta casa sabem de espaço: `mapa`, `geografia`,
   `arredores`, `lugar`, `celulas`, `viagem`, `comodos`, `toponimia`,
   `cena`, `grid`, `movimento`, `masmorras`, `acampamento`. Todos
   funcionam. Nenhum RESPONDE — não havia superfície de consulta, do
   mesmo jeito que não havia antes do Bibliotecário existir.

   O Geógrafo não guarda dado novo. Ele junta o que já existe e responde
   três perguntas, das quais DUAS ninguém fazia:

   1) ONDE SE ESTÁ — já existia espalhado (`ondeEstou`, `linhaDeLugar`,
      `elencoDaCena`), e aqui vira uma linha só.

   2) O QUE O LUGAR PERMITE — nova. Um corredor não comporta oito
      inimigos flanqueando. Um pântano não comporta uma carga a cavalo.
      Uma taverna cheia não comporta um duelo sem plateia. Hoje quem
      arbitra isso é a IA, e ela arbitra sempre a favor da cena que já
      tem na cabeça — que é a cena grande.

   3) O DESLOCAMENTO IMPOSSÍVEL — nova. "Ele acabou de chegar de Monte
      do Vigia": são dois dias de estrada, e passaram-se três horas.

   ---------------- POR QUE AFORDÂNCIA E NÃO PROIBIÇÃO ----------------

   O acervo diz o que o lugar PERMITE junto com o que ele IMPEDE, e a
   ordem não é decorativa. Uma lista só de proibições ensina o Narrador a
   escrever menos; uma lista que abre portas junto com as que fecha
   ensina onde gastar a ousadia. É a mesma razão pela qual o
   Bibliotecário manda uma FORMA e não uma lista de erros.

   ---------------- O QUE ELE NÃO FAZ ----------------

   Ele não descreve. Não diz o cheiro, não diz a luz, não escolhe
   adjetivo. "Aperta o espaço" é dele; "o corredor cheira a mofo" é do
   Narrador, e continuará sendo.
   ============================================================ */

import { ondeEstou, pontoDoHeroi } from "./rastro.js";
import { linhaDeLugar, pontoDoLugar } from "./lugar.js";
import { comoChamam } from "./lexico.js";
import { garantirCoord, coordDe, kmEntre, rumoEntre, enderecoDe, maisPertoDe, linhaDePonto, formatarDistancia } from "./coordenadas.js";
import { arredoresDaCidade } from "./arredores.js";

/* ---------------- A SITUAÇÃO DO ESPAÇO ----------------
   Trinta campos que os `quando` do acervo sabem ler. Vale aqui a
   catraca de sempre: todo campo que uma afordância lê é normalizado
   AQUI e entregue por quem chama. Campo que nenhuma afordância lê não
   entra — e campo que uma afordância lê e ninguém entrega é o bug que a
   catraca existe para impedir. */
export function garantirEspaco(e) {
  const o = e && typeof e === "object" ? e : {};
  const b = (v) => !!v;
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  return {
    /* onde */
    tipo: String(o.tipo || "nenhum"),          // cidade · estrada · masmorra · lugar · nenhum
    rotulo: String(o.rotulo || ""),
    tipoDoLocal: String(o.tipoDoLocal || ""),  // taverna, forja… quando se está dentro de um
    bioma: String(o.bioma || ""),
    porte: String(o.porte || ""),
    /* a forma do espaço */
    dentro: b(o.dentro),
    aberto: b(o.aberto),
    apertado: b(o.apertado),
    fundo: b(o.fundo),            // sem saída fácil: cripta, poço, sala do chefe
    alto: b(o.alto),              // há desnível de que se cai
    agua: b(o.agua),
    saidas: num(o.saidas, 2),
    luz: String(o.luz || "clara"), // clara · penumbra · escuro
    /* quem e o quê */
    publico: b(o.publico),        // há gente estranha vendo
    gentePorPerto: num(o.gentePorPerto),
    cabem: num(o.cabem, 8),       // quantos corpos cabem sem se atropelar
    /* o momento */
    emCombate: b(o.emCombate),
    emMasmorra: b(o.emMasmorra),
    emViagem: b(o.emViagem),
    acampado: b(o.acampado),
    noite: b(o.noite),
    clima: String(o.clima || ""),
    montado: b(o.montado),
  };
}

/* ---------------- O ACERVO ----------------
   Cada entrada é UMA afirmação sobre o espaço. `permite` abre; `impede`
   fecha. As duas juntas na mesma entrada quando são a mesma verdade
   vista dos dois lados. */
export const AFORDANCIAS = [
  /* ---- o espaço apertado ---- */
  {
    id: "apertado", quando: (e) => e.apertado,
    permite: "brigar de perto, um de cada vez, e usar o próprio corpo como porta",
    impede: "cercar por vários lados, correr, recuar sem virar as costas",
  },
  {
    id: "apertado_area", quando: (e) => e.apertado && e.emCombate,
    impede: "qualquer coisa em área que não pegue quem está do meu lado",
  },
  {
    id: "poucos_cabem", quando: (e) => e.cabem <= 4 && e.emCombate,
    impede: "mais gente entrar na briga do que cabe de pé no lugar — o resto espera atrás",
  },
  /* ---- o espaço aberto ---- */
  {
    id: "aberto", quando: (e) => e.aberto && !e.dentro,
    permite: "correr, cercar, atirar de longe, ver quem se aproxima",
    impede: "esconder-se sem alguma coisa entre você e o olho do outro",
  },
  {
    id: "cavalgar", quando: (e) => e.aberto && !e.dentro && !["pantano", "montanha", "floresta", "gelo"].includes(e.bioma),
    permite: "montar, carregar em linha reta, fugir depressa",
  },
  {
    id: "sem_cavalo", quando: (e) => ["pantano", "montanha", "floresta"].includes(e.bioma) && !e.dentro,
    impede: "cavalgar a galope, carga em linha reta, carroça saindo da trilha",
  },
  /* ---- o que se vê ---- */
  {
    id: "escuro", quando: (e) => e.luz === "escuro",
    permite: "sumir sem se esforçar, passar por quem está a dois passos",
    impede: "mirar de longe, reconhecer um rosto, ler",
  },
  {
    id: "penumbra", quando: (e) => e.luz === "penumbra",
    permite: "esconder o que se faz com as mãos",
    impede: "ter certeza de quem é quem do outro lado do lugar",
  },
  {
    id: "neblina", quando: (e) => /nebl|bruma|tempestade/i.test(e.clima) && !e.dentro,
    impede: "ver adiante, gritar e ser entendido, seguir um rastro fresco",
  },
  /* ---- plateia ---- */
  {
    id: "publico", quando: (e) => e.publico && e.gentePorPerto >= 3,
    permite: "usar a plateia — envergonhar, apelar, chamar testemunha",
    impede: "fazer qualquer coisa em segredo, ameaçar sem que corra",
  },
  {
    id: "a_sos", quando: (e) => !e.publico && e.gentePorPerto <= 1,
    permite: "dizer o que não se diz na frente dos outros, e fazer o que ninguém vai contar",
    impede: "contar com socorro, e depois provar o que aconteceu",
  },
  /* ---- as saídas ---- */
  {
    id: "sem_saida", quando: (e) => e.saidas <= 1 || e.fundo,
    impede: "fugir sem passar por quem está no caminho",
    permite: "segurar a passagem sozinho, e obrigar a conversa a acabar aqui",
  },
  {
    id: "muitas_saidas", quando: (e) => e.saidas >= 3,
    permite: "sumir no meio da confusão, e cercar por onde ninguém olhou",
    impede: "ter certeza de que alguém continua aqui dentro",
  },
  /* ---- o desnível e a água ---- */
  {
    id: "alto", quando: (e) => e.alto,
    permite: "empurrar, derrubar, atirar de cima, ganhar alcance",
    impede: "recuar sem olhar onde se pisa",
  },
  {
    id: "agua", quando: (e) => e.agua,
    permite: "apagar fogo, esconder o que afunda, atravessar onde ninguém segue",
    impede: "correr, ouvir passos, manter pólvora e papel secos",
  },
  /* ---- os tipos de lugar da cidade ---- */
  {
    id: "taverna", quando: (e) => e.tipoDoLocal === "taverna",
    permite: "encostar em qualquer um, ouvir o que não é para você, pagar por informação",
    impede: "sacar aço sem que a casa inteira se meta",
  },
  {
    id: "mercado", quando: (e) => e.tipoDoLocal === "mercado",
    permite: "sumir na multidão, comprar depressa, ver de longe quem te segue",
    impede: "conversa longa sem ser interrompido",
  },
  {
    id: "templo", quando: (e) => e.tipoDoLocal === "templo",
    permite: "pedir asilo, falar baixo e ser levado a sério",
    impede: "sangue, e barulho de qualquer natureza",
  },
  {
    id: "quartel", quando: (e) => e.tipoDoLocal === "quartel" || e.tipoDoLocal === "cadeia",
    permite: "invocar autoridade, exigir registro, pedir uma escolta",
    impede: "estar armado sem explicação, e mentir na frente de quem confere",
  },
  {
    id: "biblioteca", quando: (e) => e.tipoDoLocal === "biblioteca",
    permite: "procurar o que está escrito, e cruzar duas versões da mesma história",
    impede: "pressa, e qualquer coisa que faça barulho",
  },
  {
    id: "docas", quando: (e) => e.tipoDoLocal === "docas",
    permite: "embarcar, sumir por água, achar quem não quer ser achado",
    impede: "que um segredo fique num lugar só — as docas conversam com todo porto",
  },
  {
    id: "cemiterio", quando: (e) => e.tipoDoLocal === "cemitério",
    permite: "estar sozinho sem que isso pareça estranho, e cavar",
    impede: "explicar depois o que você foi fazer ali",
  },
  {
    id: "arena", quando: (e) => e.tipoDoLocal === "arena",
    permite: "resolver na força com regras e plateia, e ganhar nome numa tarde",
    impede: "sair sem que o resultado corra a cidade",
  },
  /* ---- masmorra ---- */
  {
    id: "masmorra", quando: (e) => e.emMasmorra,
    permite: "fechar uma porta atrás de si, e ouvir o que vem antes de ver",
    impede: "pedir ajuda, comprar coisa, e ir embora depressa",
  },
  /* ---- estrada e ermo ---- */
  {
    id: "estrada", quando: (e) => e.emViagem,
    permite: "encontrar quem também está indo, e parar onde quiser",
    impede: "voltar a um lugar sem gastar o mesmo caminho de novo",
  },
  {
    id: "ermo", quando: (e) => e.tipo === "nenhum" && !e.dentro,
    impede: "achar quem cure, quem venda e quem escute — não há ninguém",
  },
  /* ---- o tempo e o corpo ---- */
  {
    id: "noite", quando: (e) => e.noite && !e.dentro,
    permite: "chegar perto sem ser visto",
    impede: "contar com gente acordada, e com porta aberta",
  },
  {
    /* A PARTIDA PEGOU: acampado DENTRO de uma estalagem recebia "não
       comporta um balcão". Acampar numa cidade é alugar um quarto, e o
       balcão está a dez passos — a afordância foi escrita para o ermo e
       precisa dizer que é do ermo. */
    id: "acampado", quando: (e) => e.acampado && !e.dentro && e.tipo !== "cidade",
    permite: "conversar sem pressa, e arrumar o que se leva",
    impede: "qualquer coisa que dependa de uma porta, de um balcão ou de um estranho",
  },
  {
    id: "acampado_com_teto", quando: (e) => e.acampado && (e.dentro || e.tipo === "cidade"),
    permite: "conversar sem pressa, arrumar o que se leva, e mandar buscar o que falta",
  },
  {
    id: "montado", quando: (e) => e.montado && e.dentro,
    impede: "continuar montado — não se entra a cavalo",
  },
  /* ---- porte da cidade ---- */
  {
    id: "aldeia", quando: (e) => e.porte === "aldeia" || e.porte === "vila",
    permite: "falar com quem manda no mesmo dia, e ser reconhecido na segunda vez",
    impede: "passar despercebido, e achar coisa rara",
  },
  {
    id: "capital", quando: (e) => e.porte === "capital" || e.porte === "metropole",
    permite: "achar qualquer ofício, sumir sem esforço, comprar o que não se acha",
    impede: "chegar a quem manda sem intermediário",
  },
];

export function afordanciaPorId(id) { return AFORDANCIAS.find((a) => a.id === id) || null; }

/* ---------------- A CONSULTA ----------------
   Uma afordância quebrada NÃO passa. É a mesma decisão que o
   Bibliotecário tomou na v9.85: uma lacuna nunca vira permissão. */
export const TETO_PERMITE = 3;
export const TETO_IMPEDE = 3;

export function consultarGeografo(espaco) {
  const e = garantirEspaco(espaco);
  const permite = [], impede = [];
  for (const a of AFORDANCIAS) {
    let vale = false;
    try { vale = !!a.quando(e); } catch { vale = false; }
    if (!vale) continue;
    if (a.permite) permite.push(a.permite);
    if (a.impede) impede.push(a.impede);
  }
  return {
    permite: permite.filter((x, i, s) => s.indexOf(x) === i).slice(0, TETO_PERMITE),
    impede: impede.filter((x, i, s) => s.indexOf(x) === i).slice(0, TETO_IMPEDE),
    quantas: permite.length + impede.length,
  };
}

/* ---------------- ONDE SE ESTÁ, EM UMA LINHA ----------------
   Junta o que `ondeEstou` e `linhaDeLugar` já sabiam, e traduz para a
   palavra deste mundo quando há léxico. */
export function linhaDoLugar(ctx = {}) {
  const { cidadeAtual = "", jornada = null, masmorra = null, mapa = null, lugar = null, lex = null, sitio = null, clima = "" } = ctx;
  const onde = ondeEstou({ cidadeAtual, jornada, masmorra, mapa });
  const partes = [];
  if (sitio && sitio.texto) partes.push(sitio.texto);
  else if (lugar && lugar.nome) partes.push(linhaDeLugar(lugar).split(" — ")[0].replace(/^FORA DA CIDADE, /, ""));
  else if (onde.tipo === "masmorra") partes.push(`dentro ${/^[ao]s? /i.test(onde.rotulo) ? "d" + onde.rotulo : "de " + onde.rotulo}, ${onde.detalhe}`);
  else if (onde.tipo === "estrada") partes.push(onde.rotulo);
  else if (onde.tipo === "cidade") partes.push(`em ${onde.rotulo}${onde.detalhe ? ` (${onde.detalhe})` : ""}`);
  else partes.push("fora de qualquer lugar registrado");
  if (clima) partes.push(clima);
  /* a palavra do mundo, quando ela existe */
  if (lex && onde.tipo === "masmorra") {
    const p = comoChamam(lex, "masmorra");
    if (p && p !== "masmorra") partes.push(`(aqui isto é um ${p})`);
  }
  return partes.join(" · ");
}

/* ============================================================
   O RASTREIO (v9.118) — o Geógrafo assume as coordenadas

   Até aqui este arquivo respondia ONDE SE ESTÁ com um NOME: "em Baixo do
   Eco", "a caminho de Rio do Sul", "dentro da Cripta, câmara 3". É a
   resposta certa para uma pessoa e a resposta errada para um sistema,
   porque nome não se subtrai. Com nome não dá para perguntar quanto
   falta, para que lado fica, o que está mais perto, se alguém teve tempo
   de chegar — e essas quatro perguntas são exatamente as que o mundo
   errava quando errava lugar.

   Agora o Geógrafo é o dono da POSIÇÃO: a do herói e a de quem faz parte
   da história. Ele não guarda coordenada nenhuma — quem guarda são o
   mapa, o lugar e a jornada, cada um do seu jeito e desde sempre. Ele
   junta os três num ponto só, e é esse ponto que a tela desenha e que o
   Mestre recebe em TODO turno.

   POR QUE UM PONTO E NÃO UMA LISTA DE NOMES: porque um ponto responde
   sozinho as perguntas que ninguém tinha como fazer. O moinho fica a
   dois quilômetros e meio a nordeste. A cidade vizinha fica a cento e
   quarenta e oito a leste, e portanto ninguém veio de lá esta manhã. O
   herói andou sessenta e dois dos cento e oitenta quilômetros da
   estrada, e por isso ainda não se avistam os telhados.
   ============================================================ */

const semAc = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* Quantos pontos vizinhos entram na linha. Três: o suficiente para o
   Mestre saber para onde se pode ir daqui, e pouco o bastante para a
   linha caber num orçamento de prompt que já está no talo. */
export const VIZINHOS_NA_LINHA = 3;

/* Abaixo disto não se "vai" a lugar nenhum: é a mesma praça, o mesmo
   quarteirão, o mesmo prédio. Um vizinho a duzentos metros do herói que
   está dentro da cidade é a própria cidade, e a linha ONDE já a nomeou. */
export const PASSO_QUE_NAO_CONTA = 0.4;   // km

/* Onde o herói está, como coordenada. `null` quando o mundo ainda não
   tem mapa — e `null` é a resposta honesta, não o centro do pergaminho. */
export function posicaoDoHeroi(ctx = {}) {
  const eu = pontoDoHeroi({
    cidadeAtual: ctx.cidadeAtual, jornada: ctx.jornada, mapa: ctx.mapa,
    lugar: ctx.lugar, masmorra: ctx.masmorra,
  });
  if (!eu) return null;
  return { coord: garantirCoord(eu.coord || eu), naEstrada: !!eu.naEstrada, de: eu.de || null, para: eu.para || null, fracao: Number(eu.fracao) || 0 };
}

/* ---------------- ONDE ESTÁ CADA UM DA HISTÓRIA (v9.119) ----------------
   A posição de uma pessoa é DERIVADA, nunca guardada, e a escolha é a
   mesma que os arredores ensinaram na v9.118: o `local` dela é a verdade
   ("atrás do balcão do Quintal", "na forja", "em Rio do Sul") e a
   coordenada é a leitura desse texto. Guardar um `coord` na ficha criaria
   um segundo fato sobre a mesma pessoa, e ele ficaria velho no instante
   em que o Mestre escrevesse um `local` novo — que é exatamente como o
   mapa passou a discordar do texto sobre o cinturão das cidades.

   A ordem de leitura é a de quem sabe mais:

   1) QUEM ANDA COMIGO ESTÁ ONDE EU ESTOU. Não há texto que ganhe disso.
   2) O `local` nomeia um arredor daquela cidade — o moinho, a capela —,
      e o ponto é o dele, que o sistema já gerou.
   3) O `local` ou a `cidade` nomeiam um assentamento do mapa: o ponto é
      o dele, com um deslocamento em METROS tirado do nome da pessoa, para
      que o ferreiro não fique no mesmo tijolo que o taverneiro — e fique
      sempre no mesmo tijolo.
   4) O texto não nomeia lugar nenhum ("atrás do balcão"): a pessoa está
      onde o herói está. É a MESMA suposição que `elencoDaCena` faz desde
      a v9.99 para não mandar para longe quem está sentado à mesa — e ela
      vai marcada como `suposto`, porque um palpite desenhado como fato é
      pior do que nenhum desenho.
   5) Sem nada disso, `null`. Paradeiro não registrado é uma resposta. */
export function posicaoDePessoa(npc, ctx = {}) {
  if (!npc || !npc.nome) return null;
  if (String(npc.status || "").toLowerCase().includes("morto")) return null;
  const nome = semAc(npc.nome);
  if ((ctx.grupo || []).some((g) => g && semAc(g.nome) === nome)) {
    const eu = posicaoDoHeroi(ctx);
    return eu && eu.coord ? { coord: eu.coord, onde: "anda comigo", comigo: true, suposto: false } : null;
  }
  const cidades = ((ctx.mapa && ctx.mapa.cidades) || []).filter((c) => c && c.nome && c.x != null);
  const texto = semAc(`${npc.cidade || ""} ${npc.local || ""}`);
  const daqui = cidades.find((c) => semAc(c.nome) === semAc(ctx.cidadeAtual)) || null;
  const cidade = cidades.find((c) => texto.includes(semAc(c.nome))) || null;
  const dona = cidade || daqui;
  if (!dona) return null;
  if (npc.local) {
    const arr = arredoresDaCidade(ctx.semente || "", dona)
      .find((a) => texto.includes(semAc(a.nome).replace(/^(a|o|as|os)\s+/, "")) || texto.includes(semAc(a.tipo)));
    if (arr) return { coord: coordDe(arr), onde: arr.nome, comigo: false, suposto: false };
  }
  const ponto = pontoDoLugar(npc.local || npc.nome, dona, "dentro") || coordDe(dona);
  if (!ponto) return null;
  return { coord: ponto, onde: npc.local || dona.nome, comigo: false, suposto: !cidade };
}

/* O elenco inteiro com posição, do mais perto para o mais longe. É o que
   a tela desenha; o prompt continua recebendo QUEM ESTÁ PRESENTE pelo
   elenco da cena e QUEM NÃO CHEGA pelo veto — nenhum dos dois precisa da
   coordenada para dizer o que diz, e o prompt não tem folga para ela. */
export function ondeEstaOElenco(npcs, ctx = {}) {
  const eu = posicaoDoHeroi(ctx);
  /* O HERÓI NÃO É UM DELES, e às vezes está na lista: o Mestre registra o
     personagem do jogador no elenco de vez em quando, e o registro aceita.
     Sem esta linha a tela mostrava "Íris Vantel · a 110 m" logo abaixo do
     ⌖ que diz onde Íris está — a mesma pessoa em dois lugares, e o jogador
     lendo os dois. */
  const heroi = semAc(ctx.heroi || "");
  const out = [];
  for (const n of Object.values(npcs || {})) {
    if (heroi && n && semAc(n.nome) === heroi) continue;
    const p = posicaoDePessoa(n, ctx);
    if (!p || !p.coord) continue;
    out.push({
      nome: n.nome, papel: n.papel || "", relacao: n.relacao || "desconhecido",
      onde: p.onde, coord: p.coord, comigo: p.comigo, suposto: p.suposto,
      km: eu && eu.coord ? kmEntre(eu.coord, p.coord) : null,
      rumo: eu && eu.coord ? rumoEntre(eu.coord, p.coord) : null,
    });
  }
  return out.sort((a, b) => (a.km == null ? Infinity : a.km) - (b.km == null ? Infinity : b.km));
}

/* Tudo que tem posição e nome perto do herói: os arredores da cidade em
   que ele está e os assentamentos que ele conhece. Nada é inventado aqui
   — são os mesmos pontos que o pergaminho desenha. */
export function pontosDoMundo(ctx = {}) {
  const cidades = ((ctx.mapa && ctx.mapa.cidades) || []).filter((c) => c && c.nome && c.descoberta !== false && c.x != null);
  /* O CINTURÃO É DE QUEM ESTÁ NA CIDADE. Durante a viagem `cidadeAtual`
     continua sendo a de ONDE SE SAIU — é a convenção da jornada desde a
     v9.29 —, e a primeira tela na estrada trouxe "o poço fundo (a
     nordeste, 671 km)" na lista do que está por perto. Um moinho a
     seiscentos quilômetros não é vizinho de ninguém: é o cinturão de uma
     cidade que ficou três dias para trás. Na estrada, só assentamentos. */
  const aqui = ctx.jornada ? null : (cidades.find((c) => semAc(c.nome) === semAc(ctx.cidadeAtual)) || null);
  const fora = aqui ? arredoresDaCidade(ctx.semente || "", aqui) : [];
  return [
    ...fora.map((a) => ({ nome: a.nome, tipo: "arredor", coord: coordDe(a) })),
    ...cidades.map((c) => ({ nome: c.nome, tipo: "assentamento", coord: coordDe(c) })),
  ];
}

/* O pacote do turno. Uma chamada, e dela saem a linha do Mestre e o que
   a tela desenha — porque duas contas da mesma posição é como nasce o
   marcador que discorda do texto. */
export function rastrearOTurno(ctx = {}) {
  const eu = posicaoDoHeroi(ctx);
  if (!eu || !eu.coord) return null;
  /* Nem o chão que se pisa nem o lugar em que se está entram na lista do
     que está PERTO: dizer "você está a zero metros de você" gasta prompt
     para não informar nada, e foi o que apareceu na primeira tela — "Baixo
     do Eco (0 m, 1 min a pé)" logo abaixo de "você está em Baixo do Eco".

     Quem peneira é a DISTÂNCIA, e não o nome. A primeira versão tirava a
     cidade atual pelo nome, e isso apagava a informação mais útil que o
     herói fora dos muros pode receber: a que lado e a que distância fica a
     cidade a que ele vai voltar. Pela distância, o mesmo filtro acerta os
     dois casos — dentro dos muros ela está a zero e sai; da fazenda ela
     está a dois quilômetros e meio e fica.

     O nome só peneira o LUGAR em que se está, porque ele costuma ser um
     dos pontos da lista (a fazenda é um arredor) e por um fio de
     arredondamento poderia escapar da peneira de distância.

     Na ESTRADA nem uma peneira nem outra tiram a origem: ela é um vizinho
     de verdade, com um lado e uma distância que crescem a cada avanço. */
  const daqui = eu.naEstrada ? new Set() : new Set([semAc((ctx.lugar && ctx.lugar.nome) || "")].filter(Boolean));
  const perto = maisPertoDe(eu.coord, pontosDoMundo(ctx), { quantos: VIZINHOS_NA_LINHA + 3 })
    .filter((p) => !daqui.has(semAc(p.nome)) && p.km > PASSO_QUE_NAO_CONTA)
    .slice(0, VIZINHOS_NA_LINHA);
  const marcha = eu.naEstrada && eu.de && eu.para ? {
    rumo: rumoEntre(coordDe(eu.de), coordDe(eu.para)),
    feitos: kmEntre(coordDe(eu.de), eu.coord),
    faltam: kmEntre(eu.coord, coordDe(eu.para)),
    de: eu.de.nome, para: eu.para.nome,
  } : null;
  return { coord: eu.coord, endereco: enderecoDe(eu.coord, { z: true }), naEstrada: eu.naEstrada, marcha, perto };
}

/* ---------------- AS DUAS LINHAS, E POR QUE SÃO DUAS ----------------
   O ENDEREÇO custa vinte caracteres e responde "onde estou": vai no ONDE,
   junto do nome do lugar, e nunca é cortado.

   Na estrada ele leva o RUMO junto, e só o rumo: quanto já se andou e
   quanto falta já está no envelope da viagem, em horas e em avanços — e
   dizer a mesma coisa em quilômetros seria a terceira versão do mesmo
   número. O lado para onde se marcha é a única coisa que faltava lá. */
export function linhaDoRastreio(r) {
  if (!r || !r.coord) return "";
  const rumo = r.marcha && r.marcha.rumo ? ` · marcha ${r.marcha.rumo.rotulo}` : "";
  return `⌖ ${r.endereco}${rumo}`;
}

/* A VIZINHANÇA custa quase dez vezes mais, e vale menos numa conversa de
   taverna do que a segunda pessoa presente. Sai numa seção própria, de
   prioridade baixa, e é o orçamento da Pauta que decide se ela cabe. */
export function linhaDosVizinhos(r) {
  if (!r || !r.perto || !r.perto.length) return "";
  return r.perto.map(linhaDePonto).join(" · ");
}

/* ---------------- O DESLOCAMENTO IMPOSSÍVEL ----------------
   A pergunta que ninguém fazia: cabe, no tempo que passou, o que a
   narração acabou de afirmar?

   A primeira versão exportou um `podeTerChegado(de, para, minutos, mapa)`
   genérico, e ele nasceu sem leitor — quem sabe os dois nomes de cidade e
   os minutos é o elenco da cena, e ele já calcula os dias. Regra exportada
   sem quem a leia é o que a catraca desta casa existe para impedir, e ela
   pegou na primeira passada.

   Ficou só o julgamento que é de fato novo: traduzir dias em HORAS e dizer
   que elas não passaram. E ele entra na Pauta ANTES, não depois — prevenir
   custa uma linha; corrigir custa uma chamada, uma cena e a confiança do
   jogador na narração, que foi o que o portão ensinou. */
/* v9.118: e com QUANTO. Os dias já estavam certos; o que faltava era o
   lado e a distância — os dois fatos que transformam "está longe" em
   uma posição que o Narrador pode usar sem inventar nada por cima. */
export function quemNaoChega(longe = [], { quantos = 2, mapa = null, coord = null } = {}) {
  const cidades = (mapa && mapa.cidades) || [];
  const aqui = garantirCoord(coord);
  return (longe || [])
    .filter((f) => f && f.nome && Number(f.dias) > 0)
    .sort((a, b) => a.dias - b.dias)
    .slice(0, quantos)
    .map((f) => {
      const h = Math.round(Number(f.dias) * 24);
      const c = cidades.find((x) => x && semAc(x.nome) === semAc(f.onde));
      const p = aqui && c ? coordDe(c) : null;
      const r = p ? rumoEntre(aqui, p) : null;
      const quanto = p ? ` (${r ? `${r.rotulo}, ` : ""}${formatarDistancia(kmEntre(aqui, p))})` : "";
      return `${f.nome} está em ${f.onde}${quanto}, a ${f.dias} ${f.dias === 1 ? "dia" : "dias"} daqui — não entra nesta cena sem ${h}h de estrada narradas`;
    });
}

/* ---------------- A LINHA DA PAUTA ----------------
   Uma linha para o lugar e uma para o que ele permite. O que ele IMPEDE
   não sai daqui: vai para a seção NÃO PODE, que é onde moram os vetos e
   é a que nunca é cortada. */
export function paraPauta(ctx = {}) {
  const esp = garantirEspaco(ctx.espaco);
  const r = consultarGeografo(esp);
  const onde = [linhaDoLugar(ctx)];
  /* v9.118: o ENDEREÇO entra aqui, junto do nome do lugar. É a mesma
     frase — onde estou — dita com a precisão que faltava; separá-las
     convidaria as duas a discordar. A vizinhança sai por outra porta. */
  const rast = rastrearOTurno(ctx);
  if (rast) onde.push(linhaDoRastreio(rast));
  if (r.permite.length) onde.push(`comporta: ${r.permite.join("; ")}`);
  const naoPode = [];
  if (r.impede.length) naoPode.push(`o lugar não comporta: ${r.impede.join("; ")}`);
  naoPode.push(...quemNaoChega(ctx.longe || [], { mapa: ctx.mapa, coord: rast && rast.coord }));
  return { onde, naoPode, daqui: rast ? [linhaDosVizinhos(rast)].filter(Boolean) : [] };
}

export const GEOGRAFO_PROMPT = `O ESPAÇO (v9.104 — o sistema mede, você narra):
· A linha ONDE da Pauta é o lugar, e ela é fato: a cena acontece ali, e não num lugar parecido que caiba melhor no que você quer contar.
· "comporta" e "não comporta" são o que o ESPAÇO permite, não o que a trama permite. Se o lugar não comporta cercar por vários lados, a luta acontece de outro jeito — e é isso que faz cada lugar parecer diferente dos outros.
· DISTÂNCIA É TEMPO. Ninguém aparece vindo de outra cidade sem que os dias tenham passado. Se alguém precisa chegar, a chegada é uma cena que custa a estrada.
· A linha ⌖ é a posição EXATA e o que há em volta, com rumo e distância. É por ela que se decide o que se alcança daqui e para que lado fica cada coisa.`;
