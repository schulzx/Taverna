/* ============================================================
   O SÍTIO DO ACAMPAMENTO (v9.99) — quem escolhe onde se dorme

   A pergunta que trouxe este arquivo: "quem delega a localização do
   acampamento hoje? É a IA?"

   Era. `localDeDescanso` sabia responder DENTRO de uma cidade — a sede
   da guilda, a casa da facção, o refúgio aliado, a estalagem — e fora
   dos muros devolvia "acampamento em campo aberto", que não é um lugar:
   é a ausência de um. Dali para a frente quem inventava a clareira, a
   gruta ou o afloramento de rocha era o Mestre, cena a cena, sem nada
   que o obrigasse a repetir a escolha da noite anterior. O mesmo herói
   dormia três noites seguidas em três mundos diferentes, e o pior é que
   nenhuma delas estava errada — não havia nada com que estivessem em
   desacordo.

   Aqui o sítio passa a ser DO SISTEMA, como tudo o mais que é
   computável: o código já sabe o bioma da região, se o herói está em
   viagem e por que terreno, se está dentro de uma masmorra, se está num
   lugar nomeado dos arredores, que horas são e como está o tempo. Com
   isso dá para escolher onde se dorme sem perguntar a ninguém — e a IA
   recebe o sítio pronto, para fazer aquilo que ela faz melhor: narrar.

   TRÊS DECISÕES:

   1) O MAIS ESPECÍFICO GANHA. Masmorra vence lugar nomeado, que vence
      viagem, que vence cidade, que vence o campo aberto. É a ordem do
      que o jogador acabou de fazer: quem desceu uma masmorra não dorme
      "na floresta da região", dorme atrás de uma porta que ele mesmo
      fechou.

   2) O SÍTIO É ESTÁVEL ENQUANTO O LUGAR FOR O MESMO. Cada sítio carrega
      a CHAVE do contexto que o gerou. Levantar acampamento para arrumar
      as magias e montar de novo cinco minutos depois devolve o mesmo
      afloramento de rocha — porque é o mesmo afloramento de rocha. Só
      quando a chave muda (outro bioma, outra cidade, outra perna da
      estrada) é que o sorteio roda de novo.

   3) O SÍTIO NÃO É UMA REGRA, É UM FATO. Ele não dá bônus nem cobra
      penalidade — dizer isso e não fazer seria mais uma regra escrita
      sem código atrás. Ele diz ONDE, e ONDE é exatamente o que estava
      faltando.
   ============================================================ */

import { localDeDescanso } from "./mapa.js";
import { comEm, comDe } from "./lugar.js";

const pick = (sorte, arr) => arr[Math.floor(sorte() * arr.length)] || arr[0];

/* ---------------- O ABRIGO (v9.100) ----------------
   A v9.99 deixou o sítio dizer ONDE e mais nada, e anotou o porquê: um
   campo sem ninguém que o leia é mais uma regra escrita sem código atrás.
   Este é o leitor.

   O abrigo decide QUANTOS DADOS DE VIDA a noite inteira devolve. É o
   único recurso do jogo que só volta dormindo, e por isso é o único em
   que dormir mal significa alguma coisa. A régua tem o comportamento
   antigo no MEIO — metade dos dados, como sempre foi —, e os dois lados
   valem um dado para cima ou para baixo: quem chega à estalagem ganha,
   quem dorme na chuva perde, e quem dorme numa gruta continua exatamente
   onde estava antes desta versão.

   Um dado é pouco de propósito. Não é para tornar o ermo impossível — é
   para que "aguento mais meio dia de estrada e durmo com teto" volte a
   ser uma pergunta. */
export const ABRIGOS = [
  { nivel: 0, rotulo: "ao relento", nota: "sem teto: o frio, o orvalho e o barulho entram a noite inteira", dados: -1 },
  { nivel: 1, rotulo: "sob algum teto", nota: "coberto, ainda que improvisado — dá para dormir de verdade", dados: 0 },
  { nivel: 2, rotulo: "cama de verdade", nota: "paredes, porta e um colchão: o corpo relaxa como não relaxa na estrada", dados: 1 },
];
export function abrigoPorNivel(n) {
  const i = Math.max(0, Math.min(ABRIGOS.length - 1, Math.round(Number(n) || 0)));
  return ABRIGOS[i];
}
/* Sítio ausente devolve 1 — o do meio, que é o comportamento de antes.
   Um save antigo acampado não pode acordar pior por causa de um campo
   que não existia quando ele deitou. */
export function abrigoDoSitio(s) { return abrigoPorNivel(s && s.abrigo != null ? s.abrigo : 1); }

/* ---------------- O CAMPO ABERTO, POR BIOMA ----------------
   `dentro` é o detalhe concreto que a narração tem de usar: sem ele o
   Mestre recebe um substantivo e devolve a mesma fogueira genérica que
   ele já devolvia. Com ele, a cena tem uma coisa para tocar. */
export const SITIOS_DO_ERMO = {
  planicie: [
    { id: "murundu", icone: "⛺", abrigo: 0, nome: "atrás de um murundu de terra", dentro: "o único quebra-vento em léguas, e ele mal cobre um homem sentado" },
    { id: "cerca_velha", icone: "⛺", abrigo: 0, nome: "encostado numa cerca de pedra caída", dentro: "pedra empilhada por alguém, há muito tempo, para separar o que já não é de ninguém" },
    { id: "arvore_sozinha", icone: "🌳", abrigo: 1, nome: "sob a única árvore do descampado", dentro: "uma árvore que virou marco de estrada por não ter concorrência" },
    { id: "vala_seca", icone: "⛺", abrigo: 1, nome: "dentro de uma vala seca", dentro: "abaixo da linha do horizonte — de longe, ninguém vê a fogueira" },
    { id: "moita_alta", icone: "🌾", abrigo: 0, nome: "no meio do capim alto", dentro: "o capim range com o vento a noite inteira e é impossível saber se é só vento" },
  ],
  floresta: [
    { id: "clareira", icone: "🌲", abrigo: 0, nome: "numa clareira redonda", dentro: "um círculo de céu aberto no meio do fechado, com o chão limpo demais para ser acaso" },
    { id: "raizes", icone: "🌲", abrigo: 1, nome: "entre as raízes de uma árvore enorme", dentro: "raízes que fazem paredes, e um vão no meio do tamanho exato de duas pessoas" },
    { id: "tronco_caido", icone: "🪵", abrigo: 1, nome: "ao abrigo de um tronco tombado", dentro: "o tronco caiu faz anos e está oco: dá para dormir dentro dele, se a chuva apertar" },
    { id: "beira_do_riacho", icone: "💧", abrigo: 0, nome: "à margem de um riacho", dentro: "água corrente ao lado, que resolve a sede e apaga qualquer som que se aproxime" },
    { id: "carvoaria", icone: "🔥", abrigo: 1, nome: "numa carvoaria abandonada", dentro: "o chão ainda é preto e ainda é quente um palmo abaixo" },
  ],
  colina: [
    { id: "afloramento", icone: "🪨", abrigo: 1, nome: "sob um afloramento de rocha", dentro: "uma laje inclinada que serve de teto para três, e para mais ninguém" },
    { id: "encosta_ao_vento", icone: "⛰", abrigo: 1, nome: "no lado abrigado da encosta", dentro: "o vento bate do outro lado do morro e passa por cima sem tocar" },
    { id: "cume", icone: "⛰", abrigo: 0, nome: "logo abaixo do cume", dentro: "de lá se vê a estrada inteira nos dois sentidos, e a estrada inteira vê a fogueira" },
    { id: "curral_velho", icone: "⛺", abrigo: 1, nome: "dentro de um curral abandonado", dentro: "muro de pedra na altura do peito e nenhum animal há muitos anos" },
  ],
  montanha: [
    { id: "gruta_rasa", icone: "🕳", abrigo: 1, nome: "numa gruta rasa", dentro: "fundo demais para o vento, raso demais para esconder o que está lá dentro" },
    { id: "sob_a_saliencia", icone: "🪨", abrigo: 1, nome: "sob uma saliência de pedra", dentro: "pedra por cima, precipício a três passos e nenhuma lenha por perto" },
    { id: "passo_estreito", icone: "⛰", abrigo: 0, nome: "num rebaixo do passo", dentro: "o passo estreita ali e qualquer coisa que suba tem de passar pelo fogo" },
    { id: "ruina_de_pastor", icone: "🏚", abrigo: 1, nome: "numa cabana de pastor sem teto", dentro: "quatro paredes de pedra seca, sem porta e sem telhado, cheias de lã velha" },
  ],
  deserto: [
    { id: "duna_abrigo", icone: "🏜", abrigo: 0, nome: "na face abrigada de uma duna", dentro: "a areia guarda o calor do dia até a madrugada, e depois solta um frio absurdo" },
    { id: "wadi", icone: "🏜", abrigo: 0, nome: "num leito seco de rio", dentro: "pedra lisa e areia, e a certeza de que se chover em algum lugar longe a água vem por aqui" },
    { id: "oasis", icone: "🌴", abrigo: 1, nome: "à beira de um poço de estrada", dentro: "água salobra, três tamareiras e as marcas de quem parou aqui antes" },
    { id: "coluna_caida", icone: "🏛", abrigo: 0, nome: "à sombra de uma coluna caída", dentro: "pedra lavrada saindo da areia — quem a ergueu não deixou mais nada" },
  ],
  pantano: [
    { id: "ilhota", icone: "🌿", abrigo: 0, nome: "numa ilhota de terra firme", dentro: "o único chão que não afunda em cem passos, e ele tem o tamanho de um quarto" },
    { id: "palafita", icone: "🪵", abrigo: 0, nome: "num estrado de troncos sobre a água", dentro: "alguém amarrou esses troncos, e as amarras estão novas demais" },
    { id: "raiz_de_mangue", icone: "🌿", abrigo: 0, nome: "sobre raízes de mangue", dentro: "dormir a um palmo da água escura, ouvindo o que se mexe embaixo" },
    { id: "barco_encalhado", icone: "🛶", abrigo: 1, nome: "dentro de um barco encalhado", dentro: "casco virado, meio enterrado no lodo, e seco por dentro" },
  ],
  costa: [
    { id: "enseada", icone: "🌊", abrigo: 0, nome: "numa enseada de pedra", dentro: "o barulho da maré cobre a conversa, e cobre também qualquer passo na areia" },
    { id: "duna_de_praia", icone: "🏖", abrigo: 0, nome: "atrás das dunas da praia", dentro: "capim de duna, areia fria e a linha da maré alta marcada bem ali" },
    { id: "caverna_da_mare", icone: "🕳", abrigo: 1, nome: "numa gruta acima da maré alta", dentro: "seca por pouco: a marca de água escura está na altura do joelho" },
    { id: "casco", icone: "⚓", abrigo: 1, nome: "ao abrigo de um casco naufragado", dentro: "as costelas de um navio de bom tamanho, e nenhuma sepultura por perto" },
  ],
  gelo: [
    { id: "muro_de_neve", icone: "❄", abrigo: 0, nome: "atrás de um muro de neve cortada", dentro: "blocos cortados e empilhados por mãos suas, e o vento passa por cima" },
    { id: "fenda", icone: "❄", abrigo: 1, nome: "numa fenda entre lajes de gelo", dentro: "azul por dentro, sem vento, e estalando de hora em hora" },
    { id: "sob_o_pinheiro", icone: "🌲", abrigo: 1, nome: "sob um pinheiro carregado de neve", dentro: "os galhos baixos formam uma tenda e o chão embaixo está seco" },
    { id: "abrigo_de_caca", icone: "🏚", abrigo: 1, nome: "num abrigo de caçadores", dentro: "lenha empilhada por quem passou antes, pela regra de que o próximo vai precisar" },
  ],
};

/* ---------------- DENTRO DA MASMORRA ----------------
   Quem desceu não dorme na floresta lá de cima. Dorme atrás de uma
   porta que ele mesmo fechou, e isso é uma cena diferente. */
export const SITIOS_DE_MASMORRA = [
  { id: "sala_limpa", icone: "🏚", abrigo: 1, nome: "na sala que vocês acabaram de limpar", dentro: "o que sobrou da luta ainda está no chão, e ninguém teve vontade de arrastar para fora" },
  { id: "atras_da_porta", icone: "🚪", abrigo: 1, nome: "atrás de uma porta escorada", dentro: "a porta não tem tranca, então foi escorada com o que havia: pedra, um banco, o próprio peso" },
  { id: "nicho_da_escada", icone: "🕳", abrigo: 1, nome: "num nicho ao pé da escada", dentro: "de lá se ouve tudo o que desce, com muita antecedência" },
  { id: "cripta_vazia", icone: "⚰", abrigo: 1, nome: "numa cripta já saqueada", dentro: "nichos vazios nas paredes, e quem os esvaziou não foi vocês" },
  { id: "poco_seco", icone: "🕳", abrigo: 1, nome: "no fundo de um poço seco", dentro: "uma saída só, para cima, e ela funciona nos dois sentidos" },
];

/* ---------------- EM VIAGEM, POR ÁGUA OU POR TERRA ----------------
   O `meio` da jornada é texto livre do Mestre ("de navio", "na caravana
   dos Vares"). Quando ele diz que o herói vai embarcado, dormir numa
   clareira é impossível — e era exatamente o erro que a instrução antiga
   proibia com maiúsculas em vez de resolver. */
export const SITIOS_EMBARCADOS = [
  { id: "convés", icone: "⛵", abrigo: 0, nome: "no convés, enrolado numa vela velha", dentro: "o balanço, o rangido do cordame e a vigia trocando de turno em cima" },
  { id: "porao", icone: "⚓", abrigo: 1, nome: "no porão, entre a carga", dentro: "cheiro de breu e água parada, e o casco batendo do outro lado da tábua" },
  { id: "cabine", icone: "🛏", abrigo: 2, nome: "numa cabine apertada", dentro: "uma tábua presa à parede, do tamanho de um homem, e nada mais" },
];

export const SITIOS_DE_COMBOIO = [
  { id: "sob_o_carro", icone: "🛞", abrigo: 1, nome: "debaixo de uma carroça da caravana", dentro: "o eixo por cima da cabeça e as vozes dos outros viajantes em volta" },
  { id: "roda_de_fogo", icone: "🔥", abrigo: 1, nome: "no círculo de carroças", dentro: "as carroças fecham um círculo e o fogo fica no meio, com vigias de duas em duas horas" },
  { id: "beira_da_tropa", icone: "⛺", abrigo: 0, nome: "na borda do acampamento da tropa", dentro: "gente estranha dormindo perto, o que é conforto e é risco na mesma medida" },
];

export const SITIOS_DE_ESTRADA = [
  { id: "acostamento", icone: "🛣", abrigo: 0, nome: "no acostamento, longe do leito da estrada", dentro: "longe o bastante para não ser pisado, perto o bastante para ouvir quem passa de noite" },
  { id: "marco", icone: "🪧", abrigo: 0, nome: "ao pé de um marco de estrada", dentro: "uma pedra com légua e nome, e o nome já está quase apagado" },
  { id: "abrigo_de_estrada", icone: "🏚", abrigo: 1, nome: "num abrigo de estrada", dentro: "telhado, três paredes e o costume de que ninguém é dono dele por mais de uma noite" },
  { id: "ponte", icone: "🌉", abrigo: 1, nome: "debaixo de uma ponte", dentro: "seco, escondido, e é o primeiro lugar onde qualquer outro viajante também pensaria em dormir" },
];

/* ---------------- A CHAVE DO CONTEXTO ----------------
   Duas montagens com a mesma chave são o MESMO sítio. É o que faz
   levantar acampamento para arrumar as magias e montar de novo devolver
   o mesmo afloramento de rocha, em vez de teletransportar o herói para
   uma gruta que não existia cinco minutos atrás. */
export function chaveDoSitio(ctx = {}) {
  const c = ctx || {};
  /* a sala ATUAL entra na chave: acampar duas vezes na mesma sala é o mesmo
     nicho, e acampar duas salas adiante já é outro lugar */
  if (c.masmorra) return `masmorra:${c.masmorra.nome || "?"}:${c.masmorra.atual ?? 0}`;
  if (c.lugar && c.lugar.nome) return `lugar:${String(c.lugar.nome).toLowerCase()}`;
  if (c.jornada) return `viagem:${c.jornada.de || "?"}>${c.jornada.para || "?"}:${c.jornada.meio || ""}`;
  if (c.cidade) return `cidade:${String(c.cidade).toLowerCase()}`;
  return `ermo:${c.bioma || "planicie"}`;
}

const POR_AGUA = /(navio|barco|nau|galera|balsa|jangada|escuna|bote|caravela|embarca|a bordo|mar |rio abaixo|rio acima)/i;
const EM_COMBOIO = /(caravana|comboio|carroç|carroc|carruagem|tropa|mercadores|vag[ãa]o|trem)/i;

/* ---------------- A ESCOLHA ----------------
   Uma função, uma resposta, e o mais específico ganha. */
export function escolherSitio(ctx = {}, sorte = Math.random) {
  const c = ctx || {};
  const chave = chaveDoSitio(c);
  const bioma = SITIOS_DO_ERMO[c.bioma] ? c.bioma : "planicie";

  /* 1. MASMORRA — quem desceu dorme lá embaixo */
  if (c.masmorra) {
    const s = pick(sorte, SITIOS_DE_MASMORRA);
    return {
      ...s, chave, tipo: "masmorra",
      texto: `${s.nome}, dentro ${comDe(c.masmorra.nome || "a masmorra")}`,
      proibido: "Não me leve para fora da masmorra, nem para estalagem, cidade ou superfície: eu não subi. O descanso acontece aqui embaixo, com a porta fechada.",
    };
  }

  /* 2. LUGAR NOMEADO — o herói está num ponto dos arredores, e ele tem nome */
  if (c.lugar && c.lugar.nome) {
    return {
      id: "no_lugar", icone: "⛺", abrigo: 1, chave, tipo: "lugar",
      nome: `dentro ${comDe(c.lugar.nome)}`,
      dentro: "o próprio lugar serve de abrigo — use o que ele tem, não invente outro sítio",
      texto: `${comEm(c.lugar.nome)}${c.cidade ? ` (nos arredores de ${c.cidade})` : ""}`,
      proibido: `Não me leve de volta para ${c.cidade || "a cidade"} para dormir: eu estou ${comEm(c.lugar.nome)} e é aqui que se arma o acampamento.`,
    };
  }

  /* 3. EM VIAGEM — e o meio da viagem decide se há chão embaixo */
  if (c.jornada) {
    const meio = String(c.jornada.meio || "");
    if (POR_AGUA.test(meio)) {
      const s = pick(sorte, SITIOS_EMBARCADOS);
      return { ...s, chave, tipo: "embarcado", texto: `${s.nome}, a bordo (${meio.trim()})`, proibido: "Estou EMBARCADO: proibido me pôr em terra, em estalagem ou em cidade. O descanso acontece a bordo." };
    }
    if (EM_COMBOIO.test(meio)) {
      const s = pick(sorte, SITIOS_DE_COMBOIO);
      return { ...s, chave, tipo: "comboio", texto: `${s.nome} (${meio.trim()})`, proibido: "Estou VIAJANDO com gente: o descanso é no acampamento da tropa, não em estalagem nem em cidade — eu não cheguei a lugar nenhum." };
    }
    const naEstrada = sorte() < 0.5;
    const s = naEstrada ? pick(sorte, SITIOS_DE_ESTRADA) : pick(sorte, SITIOS_DO_ERMO[bioma]);
    return {
      ...s, chave, tipo: "estrada",
      texto: `${s.nome}, na estrada de ${c.jornada.de || "onde parti"} para ${c.jornada.para || "o destino"}`,
      proibido: "Estou NO MEIO DA VIAGEM: é TERMINANTEMENTE PROIBIDO me colocar em estalagem, aposentos ou cidade. Eu não cheguei a lugar nenhum ainda, e o destino continua adiante.",
    };
  }

  /* 4. CIDADE — a resposta que o sistema já sabia dar */
  if (c.cidade) {
    const l = localDeDescanso(c.mapa, c.cidade, c.faccao);
    const icone = l.tipo === "sede" ? "🏛" : l.tipo === "casa" ? "🏠" : l.tipo === "aliada" ? "🤝" : l.tipo === "hostil" ? "⚠" : l.tipo === "estalagem" ? "🛏" : "⛺";
    return {
      /* o `nome` é uma CONTINUAÇÃO de frase ("monta acampamento …"), e o
         mapa devolve um sintagma ("uma estalagem em X"): sem a contração
         saía "monta acampamento uma estalagem em Forte do Vigia".

         E um dos textos do mapa já começa com a própria palavra —
         "acampamento na região" —, que na frase vira "monta acampamento
         em acampamento na região". Aí o que se tira não é o artigo, é a
         repetição. */
      id: l.tipo, icone, chave, tipo: l.tipo, texto: l.texto,
      nome: /^acampamento\b/i.test(l.texto) ? l.texto.replace(/^acampamento\s*/i, "") || "em campo aberto" : comEm(l.texto),
      /* o esconderijo em território hostil tem teto e não tem sossego; o
         acampamento dentro dos muros é acampamento como qualquer outro */
      abrigo: l.tipo === "hostil" ? 1 : l.tipo === "acampamento" ? 0 : 2,
      dentro: l.tipo === "sede" ? "é a sua casa: a autoridade e o conforto aparecem em quem serve e em como falam com você"
        : l.tipo === "hostil" ? "território inimigo: dormir aqui é escolher entre o frio e ser visto"
          : l.tipo === "estalagem" ? "um quarto pago, com parede fina e gente do outro lado dela"
            : "",
      proibido: "",
    };
  }

  /* 5. O CAMPO ABERTO */
  const s = pick(sorte, SITIOS_DO_ERMO[bioma]);
  return { ...s, chave, tipo: "ermo", texto: `${s.nome}, em campo aberto (${bioma})`, proibido: "" };
}

/* Reaproveita o sítio anterior quando o lugar não mudou. É a diferença
   entre lembrar onde se está e sortear um mundo novo a cada clique. */
export function sitioDaVez(anterior, ctx = {}, sorte = Math.random) {
  const chave = chaveDoSitio(ctx);
  if (anterior && anterior.chave === chave) return anterior;
  return escolherSitio(ctx, sorte);
}

/* A linha que o jogador lê na mesa. */
export function falaDoSitio(sitio) {
  if (!sitio) return "⛺ Você monta acampamento.";
  const a = abrigoDoSitio(sitio);
  return `${sitio.icone || "⛺"} Você monta acampamento ${sitio.nome} — ${a.rotulo}.`;
}

/* O envelope: o sítio como FATO, não como sugestão. */
export function envelopeDoSitio(sitio) {
  if (!sitio) return "";
  const partes = [
    `[ACAMPAMENTO — O SÍTIO É DO SISTEMA] Montei acampamento ${sitio.texto}.`,
    sitio.dentro ? `O que há aqui: ${sitio.dentro}.` : "",
    `Abrigo: ${abrigoDoSitio(sitio).rotulo} — ${abrigoDoSitio(sitio).nota}. Deixe isso no corpo das pessoas: quem dorme ao relento acorda duro e de mau humor, quem dorme em cama acorda inteiro.`,
    "Este é o lugar: descreva-o e use o que ele tem. NÃO escolha outro sítio, NÃO me mude de lugar e NÃO invente um abrigo melhor que este.",
    sitio.proibido,
    "A partir de agora é uma pausa segura: NÃO faça o mundo avançar, NÃO gere eventos externos nem passagem de tempo. Conduza conversas — companheiros puxam papo, revelam histórias. Descreva brevemente o sítio e deixe aberto para conversa.",
  ];
  return partes.filter(Boolean).join(" ");
}

/* ============================================================
   O QUE SÓ SE ARRUMA NO ACAMPAMENTO (v9.99)

   O relato: "as habilidades estão sendo preparadas fora do acampamento,
   e ainda pior, no meio da batalha dá pra preparar magias."

   As duas coisas eram verdade, e a segunda é a que quebra o jogo. Se dá
   para trocar o caderno no meio da luta, PREPARAR deixa de existir: o
   jogador esquece a magia certa, abre a ficha, prepara a magia certa e
   fecha. O teto de quantas cabem na cabeça continua valendo e não
   raciona mais nada, porque o que ele racionava era a APOSTA — decidir
   de manhã sem saber o que a tarde traz.

   A v9.33 tinha um bom motivo para pôr o caderno na ficha (o jogador
   procurou lá e não achou) e concluiu que "preparar fora do descanso não
   quebra nada". Quebra: só não quebrava enquanto ninguém tentasse fazer
   isso durante uma luta.

   O painel FICA na ficha — achar onde se arruma continua valendo. O que
   muda é que fora do acampamento ele mostra, e não deixa mexer, dizendo
   por quê. E o acampamento ganhou a porta de saída sem descanso, para
   que "monte acampamento primeiro" custe um clique e não uma noite.
   ============================================================ */
export function podeArrumar({ emCombate = false, acampado = false } = {}) {
  if (emCombate) {
    return { ok: false, motivo: "no meio da luta não se arruma nada: o caderno e a sintonia se decidem antes, e é isso que faz a escolha valer" };
  }
  if (!acampado) {
    return { ok: false, motivo: "isso se arruma no acampamento — monte acampamento (⛺) e saia sem descansar, se for só para arrumar" };
  }
  return { ok: true, motivo: "" };
}

export const ACAMPAMENTO_PROMPT = `ACAMPAMENTO (v9.99 — o sítio é do sistema):
· ONDE se acampa é decisão do CÓDIGO, não sua. O envelope [ACAMPAMENTO] traz o sítio pronto: use-o como está, descreva o que ele tem e não troque por outro.
· Enquanto o acampamento está montado o tempo NÃO corre: nada de eventos, nada de horas passando, nada de mundo avançando. É espaço de conversa.
· O ABRIGO do sítio é fato do sistema e já custou (ou rendeu) fôlego: narre o corpo, nunca os números.
· Levantar acampamento SEM descanso é legítimo: o herói só arrumou as coisas e seguiu. Nesse caso não houve sono, não houve cura e passaram-se minutos, não horas.`;
