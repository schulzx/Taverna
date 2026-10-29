/* ============================================================
   OS ENVELOPES DO TURNO, NO MOTOR (Fase T2, trilha A, 28/10/2026) — src/motor/envelopes-do-turno.js

   O plano mediu que 37% da voz do Mestre morava no App: os textos que o
   App embrulha à volta da frase do jogador antes de a mandar ao Narrador.
   Texto de regra é tabela (a primeira lei da casa), e uma voz espalhada
   por 27 mil linhas de tela não se lê, não se mede e não se joga em Node.
   Saem para cá um grupo de cada vez, cada um provado byte a byte contra o
   App de antes sobre os 275 casos da casa.

   1.º GRUPO — O RODAPÉ DO SISTEMA (v7.0.2 em diante): o lembrete curto
   colado SÓ na mensagem atual (não fica no histórico), com o relógio, o
   lugar, as seis regras invioláveis e o estado vivo do turno, nesta
   ordem. O App continua a calcular cada peça (lê os refs e os órgãos
   dele); o que vem para cá é o texto fixo, a ordem das peças e a regra de
   que peça vazia não ocupa linha.

   Provado em `teste-motor-envelopes-do-turno.mjs` contra o App de antes
   (`envelopes-dourado.json`).
   ============================================================ */
import { dataTxt, horaTxt, ehNoite, estacaoDe } from "../calendario.js";
import { formaDaCidade } from "../geografia.js";
import { MARCA_DO_RODAPE } from "../prompt.js";
import { comDe } from "../lugar.js";
/* o céu do mundo em uso: o despertar divino diz os estágios dele (28/10, trilha B) */
import { cenarioAtivo } from "../cenario.js";

/* A CHAVE É DA TABELA (28/10/2026): toda escolha por chave neste módulo passa
   por aqui. `tabela[chave]` sozinho lê o protótipo — "constructor" devolvia a
   função Object, e o texto dela ia ao Narrador. Só conta a chave própria. */
const daTabela = (tabela, chave) => (Object.hasOwn(tabela, chave) ? tabela[chave] : undefined);
function aFormaDe(tabela, qual, oQue) {
  const f = daTabela(tabela, qual);
  if (typeof f !== "function") throw new Error("envelope " + oQue + " sem forma: " + qual);
  return f;
}

/* o texto fixo do rodapé, à letra do App de antes. A marca é a de
   prompt.js: é por ela que o pedido na ordem do cache acha onde o rodapé
   abre (sem ela o corte cai no fallback calado) */
export const RODAPE_DO_SISTEMA = {
  abre: MARCA_DO_RODAPE + " Agora: ",
  noite: " (noite)",
  inviolavel: "Inviolável: (1) o tempo SÓ muda por envelope do sistema — nunca narre amanhecer, anoitecer ou horas passando por conta própria; (2) NUNCA invente memórias nem passado compartilhado que não esteja no cânone/registro de pessoas; (3) siga o cânone e o registro à risca; (4) o campo \"narrativa\" vem SEMPRE preenchido; (5) descanso/sono acontecem ONDE EU ESTOU — jamais me teleporte para aposentos ou cidade sem viagem narrada; (6) ONDE EU ESTOU é o que este rodapé diz, e só muda quando EU escrevo que me movo — esperar, vigiar e deixar horas passarem acontece no lugar em que eu já estava.",
};

/* A ORDEM DAS PEÇAS. É a ordem em que o Narrador as lê, e cada posição tem
   um porquê escrito no App, ao lado de quem calcula a peça: o "aqui" antes
   de tudo (o lugar, v9.39/v9.40), o chão logo a seguir (v9.41), as
   condições e a nêmesis depois do corpo (v9.0), o tabuleiro só na luta
   (v9.20). Uma peça vazia não ocupa linha. */
export const ORDEM_DO_RODAPE = [
  "aqui", "chao", "chefes", "cena", "proficiencia", "pericias", "heroismo", "descanso",
  "relogios", "magias", "sintonia", "legado", "missoes", "dadivas", "tracos", "invocacoes",
  "deslocamento", "condicoes", "nemesis", "mercado", "grupo", "reacoes", "tabuleiro", "combos", "rito",
];

/* a cabeça: o relógio, a estação, o lugar e o inviolável. `ascensao` é
   `false` para quem não despertou; para quem despertou é o resumo, e entra
   com um espaço à frente mesmo quando vem vazio — como no App. */
export function aCabecaDoRodape({ dia, minuto, local, ascensao }) {
  const R = RODAPE_DO_SISTEMA;
  return `${R.abre}${dataTxt(dia)} (dia ${dia}), ${horaTxt(minuto)}${ehNoite(minuto) ? R.noite : ""}, ${estacaoDe(dia).nome.toLowerCase()}. Local: ${local}. ${R.inviolavel}${ascensao !== false ? " " + ascensao : ""}`;
}

/* o rodapé inteiro: a cabeça e as peças, na ordem, cada uma na sua linha */
export function oRodapeDoTurno(cabeca, pecas) {
  const P = pecas || {};
  return aCabecaDoRodape(cabeca) + ORDEM_DO_RODAPE.map((k) => (P[k] ? `\n${P[k]}` : "")).join("");
}

/* A FORMA DAQUI (v9.54): a planta já sabia que uma aldeia de 190 almas não
   tem muralha; o Mestre não sabia, e narrava portão, guarda e muro numa
   aldeia que não tem nenhum dos três. Uma linha curta porque é um fato
   curto. */
export const A_FORMA_DAQUI = {
  abre: "A FORMA DAQUI (do sistema — obedeça): ",
  semMuro: "NÃO há muralha, portão nem guarda de portão — quem chega, entra.",
  agua: " Um lado é água, com cais.",
  aperto: " O assentamento está espremido entre paredes de pedra.",
};
export function aFormaDaqui(cidade) {
  const F = A_FORMA_DAQUI;
  const f = formaDaCidade(cidade);
  return `${F.abre}${cidade.nome} é ${f.nota}. ${f.muro.id === "nenhum" ? F.semMuro : `A defesa é ${f.muro.rotulo}: ${f.muro.nota}.`}${f.agua ? F.agua : ""}${f.aperto < 1 ? F.aperto : ""}`;
}

/* ============================================================
   2.º GRUPO — A MASMORRA: o que o sistema já resolveu numa sala (a
   armadilha que disparou, a contornada, a vista e ainda armada; o tesouro;
   o santuário; a busca ativa) e a fuga que o jogador escolheu. Cada
   envelope diz ao Narrador o que JÁ foi aplicado, para ele não o aplicar
   de novo, e o que ainda é escolha do jogador.

   E o ESCOPO DESTE TURNO (`SO_ISSO`, que estava no topo do App): a linha
   que fecha os envelopes que respondem a um gesto da tela, para "ponho
   Fulano no grupo" não virar uma viagem inteira.
   ============================================================ */
export const SO_ISSO = ` ESCOPO DESTE TURNO (obrigatório): responda SOMENTE ao que este envelope pede, na cena e no lugar onde já estou. NÃO inicie viagem, combate, missão ou cena nova; NÃO mude de local; NÃO faça o tempo passar; NÃO invente personagem, item ou recompensa. Termine devolvendo a palavra para mim.`;

/* os envelopes da sala, pelo que aconteceu; cada um recebe só o que lê */
export const ENVELOPES_DA_MASMORRA = {
  armadilhaResolvida: ({ pos, nomeArmadilha, salva, alvo, sofrido, depois }) =>
    `[MASMORRA — ${pos} · ARMADILHA RESOLVIDA PELO SISTEMA] A sala tinha uma armadilha (${nomeArmadilha}). ${salva ? `${alvo} fez a salvaguarda (${salva.passou ? "passou" : "falhou"}). ` : ""}${alvo} já sofreu ${sofrido} de dano (aplicado pelo app — NÃO envie vida). Narre o susto e como o grupo reage.${depois}`,
  armadilhaContornada: ({ pos, nomeArmadilha, minutos, tempo }) =>
    "[MASMORRA — " + pos + " · ARMADILHA CONTORNADA PELO SISTEMA] A armadilha (" + (nomeArmadilha || "uma armadilha") + ") continua armada: o herói achou o caminho rente a ela sem a tocar, e isso custou " + minutos + " min e uma tocha (já descontados pelo app). Nada disparou e ninguém se feriu. Narre a passagem lenta." + tempo,
  armadilhaAVista: ({ pos, nomeArmadilha, aviso, tempo }) =>
    "[MASMORRA — " + pos + " · ARMADILHA À VISTA, AINDA ARMADA] O herói notou a armadilha (" + (nomeArmadilha || "uma armadilha") + ") ANTES de pisar nela: ela NÃO disparou e ninguém se feriu. Narre o que ele vê — o gatilho, o fio, a placa — e pare aí: desarmar, contornar ou passar assim mesmo é escolha dele, e o sistema resolve." + aviso + tempo,
  tesouro: ({ pos, moedas, item, aviso, tempo }) =>
    `[MASMORRA — ${pos} · TESOURO RESOLVIDO PELO SISTEMA] A sala guardava um tesouro: ◉ ${moedas}${item ? ` e o item "${item.nome}" (${item.raridade}${item.poder ? `, ${item.poder}` : ""})` : ""} — JÁ na minha posse (NÃO envie moedas nem "adicionar_equipamento"). Descreva o achado com emoção.${aviso}${tempo}`,
  santuario: ({ pos, cena, aviso, tempo }) =>
    `[MASMORRA — ${pos} · SANTUÁRIO RESOLVIDO PELO SISTEMA] A sala é um refúgio: ${cena}. O grupo inteiro já recuperou parte de PV e PM (aplicado pelo app — NÃO envie cura). Narre o respiro — é um bom momento para uma conversa curta do grupo.${aviso}${tempo}`,
  buscaAtiva: ({ masmorra, total, segredo, achou, achado }) =>
    `[MASMORRA — BUSCA ATIVA · ${masmorra}] Vasculho a sala por dez minutos (Percepção ${total}${segredo ? ` vs ${segredo.cd}` : ""}). ${achou ? `ENCONTREI: ${achado.txt} (${achado.tipo.replace("_", " ")}). Narre a descoberta e o que ela abre.` : "Nada encontrado — narre a busca frustrada em 1-2 frases, sem inventar achados."} NÃO revele o que não foi achado.${SO_ISSO}`,
  fuga: ({ masmorra }) =>
    `[MASMORRA — FUGA] Eu ESCOLHI fugir de ${masmorra} antes do fim — abandono conscientemente as salas e tesouros que ainda restavam (o que já conquistei, carrego comigo). Narre a retirada apressada em 2-3 frases e retome a cena do mundo lá fora.`,
  /* 17.º grupo (29/10): a entrada (com o veredito da dificuldade e o */
  /* vestido à frente, já ditos pelo App) e a armadilha que se sofreu (a */
  /* salvaguarda já dita por cima) — da masmorra, logo desta tabela. */
  entrada: ({ vestido, dificuldade, masmorra, camaras, niveis, tochas, perto, extraTempo }) => `${vestido ? vestido + " " : ""}${dificuldade ? dificuldade + " " : ""}[MASMORRA — ENTRADA · ${masmorra}] Descobri a entrada de "${masmorra}". O SISTEMA gerou a planta: ${camaras} câmaras em ${niveis} níveis de profundidade, com passagens que se ramificam, um portão lacrado no fundo e a chave escondida com um guardião. Levo ${tochas} tochas — cada passagem consome uma. Descreva a fachada e a atmosfera do primeiro salão em 2-4 frases, costurando com a cena atual${perto ? ` (perto de ${perto})` : ""}. Mencione que há mais de um caminho adiante. NÃO invente o que há nas salas — o sistema revela cada uma quando eu escolher a passagem.${extraTempo}`,
  armadilhaSofrida: ({ salvaguarda, pos, depois }) => `${salvaguarda}
[MASMORRA — ${pos}] Narre o susto e o estado em que fico.${depois}`,
};
export function oEnvelopeDaMasmorra(qual, dados) {
  return aFormaDe(ENVELOPES_DA_MASMORRA, qual, "da masmorra")(dados || {});
}

/* ============================================================
   3.º GRUPO — O CORREIO E O DOMÍNIO: o que o jogador fez pela mesa do
   senhor de terras — o decreto pregado (a recompensa já retida), a carta
   enviada (a resposta é do sistema, dias depois) e a petição respondida
   (a consequência já aplicada). Os três fecham com o SO_ISSO: o gesto é da
   tela, e o Narrador responde só a ele.
   ============================================================ */
export const ENVELOPES_DO_CORREIO = {
  decreto: ({ rotulo, descricao, recompensa }) =>
    `[DECRETO PREGADO — ${rotulo.toUpperCase()}] Pus cartazes pela região: "${descricao}" Recompensa de ◉ ${recompensa} JÁ RETIDA pelo sistema (não envie moedas). Reaja na ficção: tavernas comentando, interessados medindo o cartaz, o alvo talvez ficando sabendo… QUEM aceita e o RESULTADO quem decide é o sistema — NÃO invente aventureiros cumprindo isso por conta própria; narre apenas a repercussão.${SO_ISSO}`,
  carta: ({ para, icone, nome, oferta, mensagem }) =>
    `[CORREIO — CARTA ENVIADA] Enviei a ${para}: ${icone} ${nome}${oferta ? ` com oferta de ◉ ${oferta}` : ""}${mensagem ? `. Diz a carta: "${mensagem}"` : ""}. Narre a partida do mensageiro e a expectativa — a RESPOSTA virá pelo sistema em 1–3 dias; NÃO antecipe nem decida a reação de ${para} agora.${SO_ISSO}`,
  peticao: ({ aceite, texto, de, nota, moedas }) =>
    `[CORREIO — PETIÇÃO ${aceite ? "ACEITA" : "RECUSADA"}] ${texto} → EU DECIDI: ${aceite ? "ACEITEI" : "RECUSEI"}.${nota ? ` Consequência (já aplicada pelo sistema): ${nota}.` : ""}${moedas ? ` Moedas: ${moedas > 0 ? "+" : ""}${moedas} (já aplicado).` : ""} Narre a reação de ${de} e as ondas que isso faz no mundo.${SO_ISSO}`,
};
export function oEnvelopeDoCorreio(qual, dados) {
  return aFormaDe(ENVELOPES_DO_CORREIO, qual, "do correio")(dados || {});
}

/* ============================================================
   4.º GRUPO — O ACAMPAMENTO E A FOGUEIRA: o fim do acampamento (com e sem
   descanso: o recibo do que de facto aconteceu é do app, e o tempo que
   passou também), a noite à volta do fogo (sentar ao lado de alguém,
   decidir o que essa pessoa pede, ficar mais um pouco) e as duas portas do
   coração fora da fogueira (a resposta ao pedido, a decisão do dilema).
   Em todos, o gesto é do jogador e já está feito: o Narrador conta a
   reação, aqui mesmo, e não decide nada por ele.
   ============================================================ */
const RESPOSTA_AO_CORACAO = {
  aceitou: (nome) => "Eu aceito o que " + nome + " me pede.",
  recusou: (nome) => "Eu recuso o que " + nome + " me pede.",
  porque: (nome) => "Pergunto a " + nome + " porquê.",
};
export const ENVELOPES_DO_ACAMPAMENTO = {
  levantarSemDescanso: ({ minutos, recibo, reino }) =>
    `[FIM DO ACAMPAMENTO — SEM DESCANSO] Levantei acampamento SEM dormir e SEM descansar: parei só o tempo de arrumar as coisas (${minutos} minutos). NÃO houve sono nem noite. ${recibo} Não me pergunte como foi a noite, porque não houve noite. Passaram-se MINUTOS: nada de amanhecer, nada de eventos grandes, nada de tempo correndo. O mundo volta a andar de onde parou; retome a cena AQUI MESMO, no mesmo lugar, e me convide a agir.${reino}`,
  /* `antes` é a frase da manhã que a fogueira põe à frente; `cauda` são as
     notas do app que fecham o turno (onde acordo, o clima, o reino, a
     guarda, o sonho, os eventos), na ordem em que chegam */
  levantarDescansado: ({ antes, tipo, dur, recibo, cauda }) =>
    (antes ? antes + "\n" : "") + `[FIM DO ACAMPAMENTO — DESCANSO ${tipo.toUpperCase()}] Levantamos acampamento após ${dur} de descanso. ${recibo} Agora o mundo VOLTA a correr: narre de forma PROPORCIONAL o que se passou nesse tempo curto — pequenas mudanças plausíveis (o clima, um ruído ao longe, um viajante que passou, o avanço natural de algo já em curso). NUNCA exagere o tempo: foi só ${dur}, então nada de meses, quedas de impérios ou grandes saltos. Retome a cena e me convide a agir.${(cauda || []).map((x) => `${x}`).join("")}`,
  sentarAoFogo: ({ nome }) =>
    "[À FOGUEIRA — SENTO-ME AO LADO DE " + nome + "] É noite no acampamento e escolhi sentar-me junto de " + nome + ". Narre só o que " + nome + " diz e faz à volta do fogo, em fala direta (—), aqui mesmo; a noite ainda não acabou: nada de sono, nada de manhã." + SO_ISSO,
  decisaoAoFogo: ({ quem, verbo, preco }) =>
    "[À FOGUEIRA — A DECISÃO SOBRE " + quem + ", TOMADA POR MIM] " + verbo + " — " + preco + ". Narre primeiro a reação de " + quem + ", ainda à volta do fogo; só depois a noite passa.",
  ficarAoFogo: ({ quem }) =>
    "[À FOGUEIRA — FICO MAIS UM POUCO COM " + quem + ", SÓ NÓS DOIS] Os outros já dormem. Narre primeiro esse momento breve, os dois junto às brasas, sem decidir nada por mim; só depois a noite passa.",
  /* a resposta que o jogador deu ao pedido do coração; a que não está na
     tabela vai sem frase, como no App — e a herdada também (no App ia o
     texto do protótipo: conserto declarado, ver a suíte, secção 8) */
  respostaAoCoracao: ({ nome, resposta }) =>
    "[RESPOSTA A " + nome + " — DADA POR MIM] " + (daTabela(RESPOSTA_AO_CORACAO, resposta) ? RESPOSTA_AO_CORACAO[resposta](nome) : "") + " Narre só a reação de " + nome + ", em fala direta (—), aqui mesmo." + SO_ISSO,
  decisaoDoCoracao: ({ nome, verbo, preco }) =>
    "[A DECISÃO SOBRE " + nome + " — TOMADA POR MIM] " + verbo + " — " + preco + ". Narre a reação de " + nome + " e o que isto custa, aqui mesmo.",
};
export function oEnvelopeDoAcampamento(qual, dados) {
  return aFormaDe(ENVELOPES_DO_ACAMPAMENTO, qual, "do acampamento")(dados || {});
}

/* ============================================================
   5.º GRUPO — A ABERTURA: o primeiro turno da campanha pelo caminho antigo
   (quando não há pista de abertura; o de hoje é `pedidoDaAbertura`, de
   abertura.js — longo de propósito e cobrado uma vez só na campanha
   inteira: é o turno que decide se o jogador entende onde está), a
   abertura do capítulo novo (o envelope dele já foi na nota, este só manda
   abrir) e a retomada de um save quando o recap não vale.
   ============================================================ */
export const ENVELOPES_DA_ABERTURA = {
  /* `habs`: as habilidades iniciais, já em texto ("nenhuma" quando não há) */
  campanha: ({ habs }) => `[ABERTURA DA CAMPANHA] Este é o primeiro turno. Narre a abertura em QUATRO partes, nesta ordem e sem títulos — tudo em prosa corrida, na 2ª pessoa: o herói é "você" ("você chegou", nunca "cheguei"):

1) O MUNDO. Que lugar é este, dito por dentro: o que o move, quem manda, do que se vive, e a LEI dele — a coisa que aqui é verdade e não seria em outro lugar. Concreto: um cheiro, um som, um preço, uma regra que todo mundo obedece sem discutir.
2) ONDE O HERÓI ESTÁ. A cidade e o ponto exato dentro dela, com o que se vê e se ouve dali. O sistema já decidiu o lugar — use o que está no envelope, não invente outro.
3) QUEM ELE É AQUI. Não repita a ficha dele: mostre o que o conceito e o passado dele significam NESTE mundo — como as pessoas daqui olham para alguém assim, o que isso lhe abre e o que lhe fecha. E por que ele está neste ponto agora, fazendo o que está fazendo. O jogador precisa terminar a leitura sabendo o que veio fazer aqui.
4) O PRIMEIRO FIO. Ponha em cena a coisa que o sistema já mandou por envelope de missão e deixe-a puxar: alguém que fala com ele, um sinal, um pedido, um problema que o alcança. Não anuncie que é uma missão, não liste etapas e não peça a resposta dele — só faça o mundo vir até ele, de um jeito em que ficar parado seja a escolha mais difícil.

Termine com a cena aberta e o próximo passo à vista, sem perguntar "o que você faz?".
(As habilidades iniciais dele já foram concedidas pelo SISTEMA: ${habs} — NÃO envie "adicionar_habilidades".)`,
  capitulo: () => "[ABERTURA DE CAPÍTULO] Abra o capítulo conforme o envelope acima.",
  retomada: ({ campanha }) => `[RETOMADA] Voltei a "${campanha}". Reabra a cena onde eu parei em duas ou três frases e devolva a palavra para mim. Não recapitule, não faça o tempo passar e não inicie cena nova.`,
};
export function oEnvelopeDaAbertura(qual, dados) {
  return aFormaDe(ENVELOPES_DA_ABERTURA, qual, "da abertura")(dados || {});
}

/* ============================================================
   6.º GRUPO — A VIAGEM: a partida pelo mapa e pela escolha entre as opções
   do sistema, o trecho da estrada (o clima, o encontro e o ritmo de marcha,
   tudo rolado pelas tabelas do app; o Narrador só narra, e a chegada é do
   sistema quando há destino), o tempo que o jogador deixa passar (ONDE ele
   está — v9.39: sem o lugar, "reapresente a cena atual" teletransportava
   para a cidade quem esperava de tocaia), o forrageamento nos ermos (o que
   se colheu já está na bolsa) e a emboscada no lugar de onde se fugiu.
   ============================================================ */
export const ENVELOPES_DA_VIAGEM = {
  partidaMapa: ({ destino }) => `[PARTIDA — REGISTRADA PELO SISTEMA] Escolhi ${destino} no mapa e ponho o pé na estrada agora. Narre a saída — o portão, quem fica, o primeiro trecho — e me passe a vez.`,
  partidaEscolha: ({ destino }) => `[PARTIDA — REGISTRADA PELO SISTEMA] Escolhi ${destino} entre as opções que o sistema me deu, e ponho o pé na estrada agora. Narre a saída — o portão, quem fica, o primeiro trecho — e me passe a vez.`,
  /* `alvo`: o nome da boca da masmorra (só quando `paraBoca`); `paraCidade`: a
     cidade da jornada, ou vazio; as notas do fim chegam já em texto, na ordem */
  trecho: ({ local, clima, encontro, meio, paraBoca, ultimoTrecho, alvo, paraCidade, ultimoTrechoCidade, destino, ritmo, notaMarcha, notaErmos, notaAmbulante, extraTempo }) => `[VIAGEM — tudo rolado pelas tabelas do app; você só NARRA, não invente outro resultado]
LOCAL ATUAL: ${local}.
CLIMA AGORA: ${clima.rotulo} — ${clima.nota}.
ENCONTRO DO TRECHO (${encontro.tipo}): ${encontro.detalhe}
Descreva o trecho sob esse clima e desenvolva o encontro acima, costurando com a cena atual. Lembre-se: estou EM VIAGEM — a cena acontece no caminho${meio ? ` (seguimos de ${meio})` : ""}, não em cidade. ${paraBoca ? (ultimoTrecho ? `Este trecho termina diante da entrada ${comDe(alvo)}, fora de qualquer cidade: narre-o até ela ficar à vista, sem me pôr lá dentro — a chegada à boca é do sistema.` : `Estou a caminho da entrada ${comDe(alvo)}, fora de qualquer cidade — aproxime-me dela, mas NÃO me faça chegar nem entrar: a chegada à boca é do sistema, e ele avisa quando for.`) : paraCidade ? (ultimoTrechoCidade ? `Este trecho termina em ${paraCidade}: a chegada vem no envelope do sistema, e é como ele diz que se narra.` : `Estou a caminho de ${paraCidade} — aproxime-me desse destino, sem me pôr lá dentro: a chegada é do sistema, e ele avisa quando for.`) : `Se o meio de viagem mudar, registre "jornada_meio". Se chegarmos de fato a um destino, registre "cidade_atual". ${destino ? `Estou a caminho de ${destino} — aproxime-me desse destino e, se chegarmos, registre "cidade_atual".` : "Se eu estiver a caminho de algum destino, aproxime-me dele."}`} Termine me convidando a agir. RITMO DE MARCHA: ${ritmo.nome.toLowerCase()} — ${ritmo.desc}${notaMarcha}${notaErmos}${notaAmbulante}${extraTempo}`,
  /* `lugar`: o lugar fora da cidade onde se espera (o do ref), ou nada */
  passarOTempo: ({ horas, escala, lugar, clima, reino }) => {
    const ondeEspero = lugar
      ? ` EU CONTINUO EM ${lugar.nome.toUpperCase()}, fora da cidade: as ${horas} horas passam AQUI e a cena é reaberta AQUI. NÃO me leve de volta à cidade, não narre estrada nenhuma, não me faça chegar a lugar algum — se eu estava de tocaia, continuo de tocaia. Traga o mundo até mim: o que se ouve, o que se aproxima, o que muda no escuro.`
      : "";
    return `[PASSAR O TEMPO — ${horas} horas] Simule a passagem de ${horas} horas: ${escala}. Faça o mundo VIVER esse intervalo proporcionalmente — o que os NPCs e facções fizeram, o que avançou, o que mudou no ambiente e nas suas missões, notícias que chegaram. Quanto mais horas, mais coisas acontecem (mas sempre plausível, nunca absurdo tipo impérios caindo em 1 dia).${ondeEspero} Ao final, reapresente a cena atual e me convide a agir.${clima}${reino}`;
  },
  forrageamento: ({ achou, racoes, agua, colhidos, extra }) => `[ERMOS — FORRAGEAMENTO] Passo metade do dia caçando e colhendo. ${achou ? `Consegui ${racoes} rações e ${agua} de água (o sistema já somou).` : "Não encontrei nada aproveitável de comida."} O sistema também colheu matéria-prima e JÁ pôs na minha bolsa: ${colhidos.map((c) => `${c.nome} (${c.desc})`).join("; ")} — NÃO envie itens por isso. Narre a busca em 2-3 frases, com o cheiro e o cansaço do trabalho, mencionando de passagem onde estava o que colhi.${extra}${SO_ISSO}`,
  emboscadaDaFuga: ({ bando, nota }) => `[FUGA — TERRITÓRIO DO SISTEMA] A luta ACONTECE agora: ${bando.toLowerCase()}, porque o herói voltou ao lugar de onde fugiu. Narre a emboscada.${nota ? `\n${nota}` : ""}`,
};
export function oEnvelopeDaViagem(qual, dados) {
  return aFormaDe(ENVELOPES_DA_VIAGEM, qual, "da viagem")(dados || {});
}

/* ============================================================
   7.º GRUPO — O FIO DA HISTÓRIA: as notas com que o diretor de histórias
   empurra a cena (o marco cujo orçamento acabou, o encalhe que o mundo vem
   buscar, a virada eleita — a nota do turno é por onde o Narrador descobre
   a verdade, no mesmo instante que o jogador; o motivo da arbitragem nunca
   sai do bastidor) e as três do torneio de Uma Noite (os rumores da chave,
   o teto do interlúdio, a luta que o sistema já abriu). Sem acentos onde o
   App não os tinha: o texto vai à letra.
   ============================================================ */
export const ENVELOPES_DO_FIO = {
  marcoEmpurra: () => "[O MARCO EMPURRA] O orcamento desta parte acabou: RESOLVA a pendencia em uma frase e ENTRE no proximo marco agora, na mesma resposta.",
  rumoresDaChave: ({ rumores }) => "[RUMORES DA CHAVE — chegam como conversa de acampamento] " + rumores.join("; ") + ".",
  oMundoVaiBuscar: ({ degrau, diz }) => "[O MUNDO VAI BUSCAR — encalhe, degrau " + degrau + "] " + diz + ".",
  /* `revelacao`: o nome da forma da virada (revelacaoDe, no App); `passos`: o dia seguinte */
  virada: ({ revelacao, passos }) => "[A VIRADA — " + revelacao + "] Encene como consequencia do que ja foi semeado: " + passos.join("; ") + ".",
  interludioDoTorneio: () => "[INTERLUDIO DE ACAMPAMENTO — curto: em ate DUAS cenas o sino da proxima chave toca. Nao invente lutas: a luta acontece quando o jogador entrar nela.]",
  lutaDaChave: ({ quem }) => `[A LUTA DA CHAVE COMECA] ${quem} entra na arena contra o heroi. Narre a abertura da luta — o publico, o terreno, o primeiro olhar. O SISTEMA ja abriu o combate.`,
};
export function oEnvelopeDoFio(qual, dados) {
  return aFormaDe(ENVELOPES_DO_FIO, qual, "do fio")(dados || {});
}

/* ============================================================
   8.º GRUPO — A FICHA (A FORMAÇÃO): as notas do turno que dizem ao Narrador
   o que o jogador mudou na própria ficha — o nível que subiu, as perícias
   ajustadas, o atributo fortalecido, a habilidade aprendida (e o caminho de
   outra classe que ela abre), a especialização de subclasse e a de obsessão,
   o caminho refeito. É anotação, não cena: o efeito mecânico já está aplicado
   e o Narrador não abre treino, mestre nem viagem por causa disso.
   O 9.º grupo junta-lhe o que o sistema resolveu e o Narrador só conta.
   O 10.º, as notas [INFO] do inventário, do grupo e do save.
   Na habilidade, `eraNova` diz se ela abriu o caminho de outra classe
   (`classeNome`); `classe`, a de antes, só se lê quando abriu.
   ============================================================ */
export const ENVELOPES_DA_FICHA = {
  subiDeNivel: ({ nivel }) => `[FICHA — REGISTRO DO SISTEMA] Subi para o nível ${nivel}. É anotação de ficha: mencione o crescimento de passagem se couber, sem abrir cena de treinamento e sem descrever poderes novos — o que eu de fato aprendi só existe depois que eu gastar os pontos.`,
  pericias: () => `[FICHA — REGISTRO DO SISTEMA] Ajustei meus treinos de perícia. É anotação de ficha: não abra cena, não invente mestre nem treinamento por causa disso.`,
  atributo: ({ atributo, valor }) => `[FICHA — REGISTRO DO SISTEMA] Fortaleci ${atributo} (agora +${valor}). É anotação de ficha: não abra cena, não invente treinamento nem mestre por causa disso.`,
  habilidade: ({ nome, custo, descricao, eraNova, classeNome, classe }) => `[FICHA — REGISTRO DO SISTEMA] Aprendi a habilidade "${nome}" (${custo} PM: ${descricao})${eraNova ? `, abrindo TAMBÉM o caminho de ${classeNome} — sou ${classe} e ${classeNome} agora` : ""}. Isso é só uma anotação de ficha: NÃO abra cena, não invente treinamento, mestre nem viagem por causa disso. Se couber naturalmente numa cena futura, deixe transparecer.`,
  subclasse: ({ sub, classeNome }) => `[MARCO DE CAMINHO — REGISTRO DO SISTEMA] Escolhi a especialização "${sub}" dentro de ${classeNome}. Isso é um marco da minha formação: mencione de passagem, quando couber, que meu jeito de lutar/agir mudou nessa direção. NÃO abra cena nova por causa disso nem invente mestres, rituais ou viagens — foi uma escolha minha de ficha.`,
  especializacao: ({ esp, classeNome }) => `[MARCO DE CAMINHO — REGISTRO DO SISTEMA] Escolhi a especialização "${esp}" dentro de ${classeNome}: é a obsessão em que me tornei referência. Mencione de passagem, quando couber, que meu jeito de agir se estreitou nessa direção. NÃO abra cena, não invente mestre, ritual nem viagem — foi uma escolha minha de ficha.`,
  refazerCaminho: () => `[INFO] Passei por um treinamento longo e REFIZ meu caminho: desaprendi o que sabia de classe e vou reaprender diferente. Narre isso como semanas de treino/estudo ou um ritual, se couber na cena — mas o efeito mecânico já está aplicado.`,
  /* o que o sistema já resolveu (9.º grupo): o combate, o teste que o patamar
     decide sozinho, a volta dos mortos e o companheiro que entra no grupo. Os
     três primeiros vão por enviar() e anunciam turno resolvido — o
     check-guardado conta o combate e a volta pela tabela; o recrutamento é
     a nota que notaDoRecrutamento devolve. */
  combateResolvido: ({ desfecho, resumoInimigos, acao }) => `[COMBATE — RESOLVIDO PELO SISTEMA] Minha sequência de ${desfecho}. O dano já foi aplicado.${resumoInimigos} NÃO recalcule nem mude números — NARRE de forma vívida (2-4 frases) a sequência dos meus golpes e as decisões e reações dos inimigos: quem recuou, quem avançou, quem mudou de alvo. Ação declarada: ${acao}`,
  sucessoAutomatico: ({ motivo, dificuldade }) => `[TESTE — SUCESSO AUTOMÁTICO] "${motivo || "ação"}": trivial para meu patamar (dificuldade ${dificuldade} vs minha competência). Narre o êxito com naturalidade, sem drama de dado.${SO_ISSO}`,
  voltaDosMortos: ({ via, voltas, cicatriz, descricao }) => `[VOLTA DOS MORTOS — RESOLVIDA PELO SISTEMA] Eu morri e voltei${via === "fe" ? " pela minha própria fé — meus fiéis rezaram e desta vez alguém escutou" : " pagando o preço em ouro"}. Foi a ${voltas}ª vez. O que ficou em mim: ${cicatriz} — ${descricao}. Narre a volta como ela é: nem milagre alegre, nem horror gratuito. Alguém que voltou do outro lado volta diferente, e o corpo demora a acreditar. Não invente outro custo além deste, e não desfaça a cicatriz.`,
  recrutamento: ({ nome, nivel, vidaMax }) => `[RECRUTAMENTO — REGISTRO DO SISTEMA] ${nome} agora FAZ PARTE do grupo do herói (nível ${nivel}, ${vidaMax} PV — ficha criada pelo sistema, você não precisa mandar "grupo_adicionar"). Trate-o como companheiro presente nas cenas: opina, ajuda em combate, viaja junto.`,
  /* o inventário, o grupo e o save (10.º grupo): o que o jogador fez pela tela
     — descartar, equipar um companheiro, forjar, abandonar um contrato, retirar
     um decreto, mudar de raça ou classe, tirar alguém do grupo, transferir —,
     a guilda que cresceu e as duas recalibrações do save. `partes`: a raça, a
     classe e a subclasse, na ordem; a vazia não entra. */
  descarteItem: ({ nome }) => `[INFO] Descartei o item: ${nome}.`,
  descarteEquipamento: ({ nome }) => `[INFO] Descartei o equipamento: ${nome}.`,
  equipouCompanheiro: ({ quem, item }) => `[INFO] ${quem} agora usa ${item} (equipado pelo jogador). Reflita isso na ficção.`,
  forjou: ({ nome, raridade, poder }) => `[INFO] Forjei um item na forja: ${nome} (${raridade}${poder ? `, ${poder}` : ""}).`,
  abandonouContrato: ({ titulo }) => `[INFO] Abandonei o contrato "${titulo}" — ele não existe mais para mim.`,
  retirouDecreto: ({ alvo }) => `[INFO] Retirei o decreto sobre "${alvo}" (ninguém havia aceitado). A recompensa foi devolvida.`,
  agoraE: ({ quem, partes, profissao }) => `[INFO] ${quem} agora é ${partes.filter(Boolean).join(", ")}${profissao ? `, profissão ${profissao}` : ""}. Reflita isso na narrativa daqui em diante.`,
  saiuDoGrupo: ({ nome }) => `[INFO] ${nome} saiu do meu grupo (removido pelo jogador). Reflita isso na narrativa: ${nome} não viaja mais comigo.`,
  guildaCresceu: ({ guilda, nivel }) => `[INFO] Minha guilda (${guilda}) melhorou para o nível ${nivel} — maior, mais rica e mais respeitada. Reflita esse crescimento na ficção.`,
  recalibrouAFicha: ({ nivel, vidaMax, manaMax, prof, dadivas }) => `[INFO] Recalibração de save: meus números oficiais agora são nível ${nivel}, PV ${vidaMax}, PM ${manaMax}, proficiência +${prof}${dadivas ? `, ${dadivas} dádivas épicas` : ""} — coerentes com tudo que já vivi. Trate-os como verdade daqui em diante.`,
  recalibrouOMundo: () => `[INFO] Recalibração de save: o estado do mundo (guilda, domínios, potências, pessoas, companheiros) foi atualizado para refletir tudo que já aconteceu. Trate os registros atuais como verdade.`,
  transferiu: ({ nome, de, para }) => `[INFO] Transferi "${nome}" de ${de} para ${para}.`,
};
export function oEnvelopeDaFicha(qual, dados) {
  return aFormaDe(ENVELOPES_DA_FICHA, qual, "da ficha")(dados || {});
}

/* ============================================================
   11.º GRUPO — O MUNDO QUE ANDA: o que o sistema sorteou e aplicou fora da
   cena e o Narrador só traz para a ficção — o festival do dia, os dois
   boatos (o do dia e o do elenco que agiu longe), os eventos de reino (os
   efeitos já aplicados, sem número na ficção), e o que o descanso longo
   acorda: o arco global novo e a etapa que escalou, o fio local novo e o
   que expirou sem o herói, a quest gerada, a divindade que se revela e o
   evento divino. Os FATOS são fixos; o Narrador escolhe só a voz.
   No reino o App passa `texto` já dito pela cidade (o `txt` do evento) e
   os três deltas; o zero não ocupa lugar na lista dos efeitos. Na
   divindade, `titulo` é o do grau (`tituloDe`, de divindades.js).
   ============================================================ */
export const ENVELOPES_DO_MUNDO = {
  festival: ({ nome, descricao, data }) => `[FESTIVAL — ${nome.toUpperCase()}] Hoje (${data}) é ${nome}: ${descricao}. Nos meus domínios o povo celebra (a felicidade já subiu por código). Traga a festa para a ficção se couber na cena.`,
  rumor: ({ boato }) => `[RUMOR] Um boato chegou aos meus ouvidos: "${boato}". Se couber, deixe-o circular na ficção (taverna, estrada, mercado) — e decida se ele é só fumaça ou o rastro de algo real.`,
  rumorDeLonge: ({ boato }) => `[RUMOR] Um boato chegou aos meus ouvidos: "${boato}". Se couber, deixe-o circular na ficção (taverna, estrada, mercado).`,
  eventoDeReino: ({ titulo, cidade, texto, felDelta, popDelta, cofreDelta, soSeInfeliz }) => `[EVENTO DE REINO — ${titulo.toUpperCase()} em ${cidade}] ${texto} Os efeitos JÁ foram aplicados pelo sistema (${[felDelta ? `felicidade ${felDelta > 0 ? "+" : ""}${felDelta}` : "", popDelta ? `população ${popDelta > 0 ? "+" : ""}${popDelta}` : "", cofreDelta ? `cofre ${cofreDelta > 0 ? "+" : ""}${cofreDelta}` : ""].filter(Boolean).join(", ")}) — NÃO os repita como números na ficção; narre como vida do reino${soSeInfeliz ? ". ATENÇÃO: o povo está à beira da revolta — isso é um problema REAL que exige resposta minha ou consequências" : ""}.`,
  globalNovo: ({ nome, semente, etapas }) => `[EVENTO GLOBAL — NOVO ARCO MAIOR: ${nome.toUpperCase()}] O SISTEMA sorteou um acontecimento que abalará a região: ${semente} ETAPA 1/${etapas.length} agora: ${etapas[0]} Teça isso na ficção aos poucos — é um arco longo de fundo, coerente com o arco atual, NÃO uma quest para resolver hoje.`,
  globalAvancou: ({ nome, etapa, etapas }) => `[EVENTO GLOBAL — ${nome.toUpperCase()} · ETAPA ${etapa + 1}/${etapas.length}] A situação regional ESCALOU: ${etapas[etapa]} Mostre a escalada na ficção (notícias, medo, preços, movimentação de facções) sem resolvê-la ainda.`,
  localNovo: ({ icone, texto, gancho, expiraEm }) => `[EVENTO LOCAL — FIO DO MUNDO] ${icone} ${texto} Gancho: ${gancho} Apresente naturalmente (um grito, um boato, algo à vista). O jogador pode ignorar — se ignorar até o dia ${expiraEm}, o fio se resolve sem ele.`,
  localExpirado: ({ texto }) => `[EVENTO LOCAL — EXPIRADO] O fio "${texto}" se resolveu SEM a minha intervenção (o mundo seguiu sem mim). Mencione o desfecho como notícia de passagem, se couber.`,
  questGerada: ({ fase, titulo, descricao, objetivo }) => `[QUEST GERADA PELO SISTEMA — fase "${fase}" do arco] Nova missão secundária JÁ REGISTRADA no diário (NÃO envie "quest_nova" duplicando-a): "${titulo}" — ${descricao} Objetivo: ${objetivo}. Apresente-a na ficção com liberdade total de execução (quem procura, como, com que voz); os FATOS acima são fixos.`,
  divindadeSeRevela: ({ icone, nome, dominio, gd, titulo, temperamento, culto, lugar }) => `[DIVINDADE SE REVELA — FATOS FIXOS DO SISTEMA] Uma entidade antes imperceptível agora se mostra ao herói desperto: ${icone} ${nome} ${dominio} — GD ${gd} (${titulo}), ${temperamento}, culto: ${culto}${lugar ? `, forte em ${lugar}` : ""}. Ela SEMPRE existiu — só agora ele a percebe. Introduza-a na ficção com sutileza (um símbolo num templo, uma prece ouvida, um sinal). NÃO mude os fatos acima.`,
  eventoDivino: ({ icone, texto, gancho }) => `[EVENTO DIVINO — FATOS FIXOS DO SISTEMA] ${icone} ${texto} Gancho: ${gancho}. Apresente naturalmente; o jogador pode ignorar. NÃO force resolução hoje.`,
};
export function oEnvelopeDoMundo(qual, dados) {
  return aFormaDe(ENVELOPES_DO_MUNDO, qual, "do mundo")(dados || {});
}

/* ============================================================
   12.º GRUPO — OS PODERES: o que o sistema já fez com uma habilidade, uma
   magia ou um milagre, e o Narrador só põe em cena — a invocação posta em
   campo, o sacrifício arcano, a metamagia armada, o efeito aplicado, o
   milagre (a forma que o jogador lhe deu e o efeito já cobrado), o
   despertar divino, as magias de função (identificar e localizar: a nota
   com os números e o pedido com a frase do jogador), as habilidades do
   turno (resolvidas pelo sistema, ou declaradas quando não há rolagem) e as
   invocações que se desfazem (com o fim da luta e com o prazo).
   `depois`: o que fecharMeuTurno deixou para o fim do envelope (o texto dos
   inimigos que agem); `extraTempo`: a cauda de tempo do turno, já pronta.
   `um`: se a invocação trouxe uma criatura só. `pan`: o panteão já dito.
   ============================================================ */
export const ENVELOPES_DOS_PODERES = {
  invocacaoEmCampo: ({ habilidade, nomes, conceito, um }) => `[INVOCAÇÃO — POSTA EM CAMPO PELO SISTEMA] "${habilidade}" trouxe ${nomes.join(", ")}: ${conceito}. ${um ? "É uma criatura" : "Elas são criaturas"} de verdade, com PV e lugar no terreno, e o sistema resolve o turno ${um ? "dela" : "delas"}. Narre a chegada e como os inimigos reagem — não decida o que ${um ? "ela faz" : "elas fazem"}, não ${um ? "a" : "as"} fira e não ${um ? "a" : "as"} desfaça: o prazo é do sistema.`,
  sacrificioArcano: ({ nome, pm }) => `[SACRIFÍCIO ARCANO — RESOLVIDO PELO SISTEMA] Desfiz ${nome} e recuperei ${pm} PM. Narre a criatura se desmanchando no gesto de quem a chamou. Os números já foram aplicados.`,
  metamagiaArmada: ({ rotulo, diz }) => `[METAMAGIA ARMADA PELO SISTEMA] Preparei ${rotulo}: ${diz}. Ela se gasta sozinha na próxima magia que eu lançar — não a aplique você, não escolha por mim qual magia recebe e não a use duas vezes.`,
  efeitoAplicado: ({ habilidade, alvo, condicao, efeito, extraEscopo, somaNoGolpe }) => `[EFEITO APLICADO PELO SISTEMA] "${habilidade}" deixou ${alvo === "aliados" ? "eu e meu grupo" : "eu"} ${condicao.toLowerCase()} (${efeito})${extraEscopo && somaNoGolpe ? `, e o bônus de dano vale só para o que é ${extraEscopo.includes("físico") ? "físico" : "mágico"}` : ""}. Já está na ficha — narre a manifestação e não envie condição nenhuma por isso.`,
  milagreComoSeManifesta: ({ nome, comoUso }) => `[COMO O MILAGRE SE MANIFESTA — DECISÃO MINHA, NÃO SUA] Eu invoquei "${nome}" ASSIM: ${comoUso}. Essa é a forma do milagre e ela é canônica: use o gesto, o alvo e o veículo que EU descrevi. Não troque por outra imagem, não mude quem foi tocado e não acrescente uma manifestação diferente por cima da minha.`,
  milagre: ({ nome, pf, desc, comoUso }) => `[MILAGRE — EFEITO JÁ APLICADO PELO SISTEMA] Invoco ${nome} (${pf} PF, já cobrados). ${desc} COMO eu o uso: ${comoUso}. Narre essa manifestação exata à altura do meu domínio — visceral, pública, inesquecível — sem recalcular nada e sem inventar um efeito além do que o sistema aplicou.${SO_ISSO}`,
  /* 28/10 (Fase T, trilha B) · OS ESTÁGIOS SÃO DO CÉU DO MUNDO. A frase foi
     movida à letra do App e ainda dizia a trilha da Taverna escrita à mão,
     depois de e036f1f ter posto os estágios no cenário. Agora lê de lá, e
     cada palavra sai do MESMO sítio de onde divindades.js monta a linha da
     ascensão: o primeiro e o último estágio (`panteao.estagios`), e no meio
     o título do GD 2 (`panteao.titulos[2]`) — o meio desta frase sempre foi
     o título ("Semideus"), não o estágio ("Receptáculo"), e continua a ser,
     para o mundo padrão sair ao byte. Lido na hora da chamada, não no
     import: o cenário troca depois de o módulo carregar. */
  despertarDivino: ({ nivel, fieis, pan }) => { const ceu = cenarioAtivo().panteao; return `[DESPERTAR DIVINO — MARCO REGISTRADO PELO SISTEMA] Ao alcançar o nível ${nivel}, o nome do herói começou a ser sussurrado em orações: a ASCENSÃO começou. FATOS FIXOS sorteados pelo sistema: o jogador tem ${fieis} fiéis iniciais (gente que já reza baixinho o nome dele) e GD 0→trilha aberta; o PANTEÃO local que ele agora consegue PERCEBER: ${pan}. Narre o despertar como um marco íntimo e arrepiado (um sinal, um olhar que se demora, uma prece espontânea de um estranho) — NÃO um show de poder: ele ainda é mortal (GD 0), mas o caminho dos três estágios (${ceu.estagios[0]} → ${ceu.titulos[2].titulo} → ${ceu.estagios[2]}) está aberto. As divindades acima já existiam — só agora ele as sente. Apresente UMA delas de leve neste turno.`; },
  identificarResolvido: ({ alvo, ficha }) => `[IDENTIFICAR — RESOLVIDO PELO SISTEMA] A magia me revelou a ficha exata de "${alvo}": ${ficha}. Esses números são fato e já estão na minha tela — NÃO os repita como se fossem descoberta sua, não invente poder nenhum além destes. Narre só a cena de leitura: o que a magia mostra, que sensação dá, o que o objeto conta de onde veio.`,
  identificar: ({ magia, alvo, acao }) => `[IDENTIFICAR] Usei "${magia}" sobre ${alvo}. ${acao}`,
  localizarSemResposta: ({ magia, motivo }) => `[LOCALIZAR — SEM RESPOSTA] Usei "${magia}" e a agulha não apontou para lugar nenhum: ${motivo}. Narre o silêncio da magia em uma frase, sem inventar uma pista de consolação.`,
  localizarResolvido: ({ dentro, alvo, direcao, km, alcance }) => `[LOCALIZAR — RESOLVIDO PELO SISTEMA] ${dentro ? `A magia apontou: ${alvo}, a ${direcao}, a cerca de ${km} km.` : `${alvo} está a ~${km} km — ALÉM do alcance da magia, que é de ${alcance} m. A agulha girou sem se fixar.`} Não mude a direção nem a distância, e não entregue de graça o que fica fora do alcance.`,
  localizar: ({ magia, acao }) => `[LOCALIZAR] Usei "${magia}". ${acao}`,
  habilidadesResolvidas: ({ lista, desfechos, depois, acao }) => `[HABILIDADES — RESOLVIDAS PELO SISTEMA] No MESMO turno usei ${lista}. O SISTEMA já rolou o acerto, calculou e APLICOU tudo: ${desfechos.join(" · ")}.${depois} Narre a sequência inteira como UM só turno meu — não recalcule, não mude quem acertou, NÃO declare a morte de quem ainda tem PV. Minha intenção: ${acao}`,
  habilidadesDeclaradas: ({ lista, mana, acao, depois, extraTempo }) => `[HABILIDADES] No MESMO turno uso ${lista} (PM já descontados; tenho ${mana}). COMO eu as uso: ${acao}.${depois} Narre a sequência conforme minha intenção. Se ficar incerto sobre o efeito, narre até onde a certeza vai e devolva a vez — você NÃO pede rolagem, e o que faltar o sistema resolve no meu próximo lance. LEMBRETE DE COESÃO: minhas palavras são empolgação, não resultado — só o SISTEMA decide dano e morte.${extraTempo}`,
  habilidadeResolvida: ({ nome, custo, desfecho, depois, acao }) => `[HABILIDADE — RESOLVIDA PELO SISTEMA] Usei "${nome}" (custo ${custo} PM, já descontado). O SISTEMA já rolou o acerto, calculou e APLICOU o resultado: ${desfecho}.${depois} Sua função é APENAS narrar esse resultado exato — não recalcule, NÃO declare a morte de quem ainda tem PV. Minha intenção: ${acao}`,
  habilidadeDeclarada: ({ nome, custo, mana, descricao, acao, depois, extraTempo }) => `[HABILIDADE] Uso "${nome}" (custo ${custo} PM, já descontado; tenho ${mana} PM). ${descricao || ""} Ação: ${acao}.${depois} LEMBRETE DE COESÃO: minhas palavras são empolgação, não resultado — só o SISTEMA decide dano e morte; se o inimigo ainda tiver PV, ele segue de pé.${extraTempo}`,
  invocacoesEncerradas: ({ sumiram }) => `[INVOCAÇÕES ENCERRADAS PELO SISTEMA] Com o fim da luta, ${sumiram.join(", ")} ${sumiram.length > 1 ? "se desfizeram" : "se desfez"}. Não ${sumiram.length > 1 ? "as mencione" : "a mencione"} como se ainda estivesse aqui.`,
  invocacaoEncerrada: ({ sumiram }) => `[INVOCAÇÃO ENCERRADA PELO SISTEMA] ${sumiram.join(", ")} ${sumiram.length > 1 ? "se desfizeram" : "se desfez"}: o prazo venceu. Narre o desmanche em uma frase e siga — ${sumiram.length > 1 ? "elas não estão mais" : "ela não está mais"} no campo, e não ${sumiram.length > 1 ? "voltam" : "volta"}.`,
};
export function oEnvelopeDosPoderes(qual, dados) {
  return aFormaDe(ENVELOPES_DOS_PODERES, qual, "dos poderes")(dados || {});
}

/* ============================================================
   13.º GRUPO — O MERCADO E A BOLSA: o que o sistema já trocou, cobrou ou
   aplicou num balcão ou na bolsa, e o Narrador só põe em cena — a compra, o
   mapa comprado, a pechincha, a venda, o consumível usado e a peça equipada
   sem treino. São notas do turno (o App junta-as abaixo da que já havia).
   `vendedor`: quem está ao balcão. `desfecho`: a frase da pechincha, já
   dita pelo sistema. `novas`: os lugares que o mapa acabou de abrir. `comb`:
   se o consumível foi usado no meio de uma luta (abrir a bolsa não gasta o
   turno). `penalidades`: as da ficha do equipamento, cada uma com o `texto`.
   ============================================================ */
export const ENVELOPES_DO_MERCADO = {
  equipouSemTreino: ({ item, rotulo, penalidades }) => `[EQUIPAMENTO — REGISTRO DO SISTEMA] Equipei ${item} (${rotulo}) sem ter treino: ${penalidades.map((p) => p.texto).join("; ")}. É fato mecânico e já está aplicado — narre o desconforto quando couber e NUNCA finja que está tudo bem.`,
  consumivel: ({ nome, texto, comb }) => `[CONSUMÍVEL — JÁ APLICADO PELO SISTEMA] Usei ${nome}. ${texto.replace(/^[^ ]+ /, "")}. O número já foi rolado e aplicado: narre o gesto e o efeito em UMA frase, junto do resto do turno, sem recalcular e sem me devolver PV/PM. ${comb ? "Abrir a bolsa NÃO gastou meu turno — a ação que vem a seguir é que é o meu turno; narre as duas coisas como uma sequência só." : ""}`,
  mapaComprado: ({ regiao, vendedor, preco, novas }) => `[MAPA COMPRADO — JÁ APLICADO PELO SISTEMA] Comprei o mapa de ${regiao} de ${vendedor} por ◉ ${preco}.${novas.length ? ` Agora conheço ${novas.join(", ")} — pode falar desses lugares a partir de agora, e eles estão no envelope de geografia.` : ""} Não envie item nem moeda. Narre o cartógrafo desenrolando o pergaminho e o que ele conta sobre a região.`,
  compra: ({ item, vendedor, preco }) => `[COMPRA — JÁ REGISTRADA PELO SISTEMA] Comprei "${item}" de ${vendedor} por ◉ ${preco}. O item já está comigo e as moedas já saíram — não envie item nem moeda. Narre a troca e o vendedor, se a cena estiver acontecendo agora.`,
  pechincha: ({ vendedor, desfecho }) => `[PECHINCHA — JÁ RESOLVIDA PELO SISTEMA] Regateei com ${vendedor} e ${desfecho}. Narre a troca de olhares e a frase dele; não invente outro resultado nem outro número.`,
  venda: ({ item, valor }) => `[VENDA — JÁ REGISTRADA PELO SISTEMA] Vendi "${item}" por ◉ ${valor}. O item saiu da minha bolsa e as moedas entraram — não repita os números.`,
};
export function oEnvelopeDoMercado(qual, dados) {
  return aFormaDe(ENVELOPES_DO_MERCADO, qual, "do mercado")(dados || {});
}

/* ============================================================
   14.º GRUPO — O DOMÍNIO: o que o sistema já decidiu sobre o que o herói
   governa, e o Narrador só põe em cena — o decreto que um bando aceitou e os
   três desfechos com que ele volta (dizimado, fracasso, cumprido com e sem
   baixas), o imposto, a obra iniciada e a pronta, o governador, a revolta
   que tomou a cidade, a reivindicação da casa e o tratado firmado. São notas
   do turno (o App junta-as abaixo da que já havia).
   `bando`, `membros` (cada um com o `nome`) e `forca`: o grupo que aceitou.
   `baixas`: se o feito custou gente; `mortos`: os nomes de quem não voltou.
   `tipo`: o do decreto ("cabeca" é mandar matar alguém).
   ============================================================ */
export const ENVELOPES_DO_DOMINIO = {
  decretoAceito: ({ alvo, bando, membros, forca, descricao, recompensa }) => `[DECRETO ACEITO — ${alvo}] A ${bando} (${membros.map((m) => m.nome).join(", ")}, força ${forca}) aceitou meu decreto: "${descricao}" Recompensa de ◉ ${recompensa} já está retida pelo sistema. Eles partiram; o resultado chegará pelo sistema em alguns dias — até lá, eles estão FORA DE CENA, em missão.`,
  decretoDizimado: ({ bando, alvo }) => `[DECRETO — DESFECHO: DIZIMADO] A ${bando} inteira morreu tentando cumprir meu decreto sobre "${alvo}" (o alvo continua como estava — isso é CANON). A recompensa voltou ao meu bolso. Narre a notícia chegando e o peso disso; o alvo pode ter ficado MAIS forte ou alerta.`,
  decretoFracasso: ({ bando, alvo }) => `[DECRETO — DESFECHO: FRACASSO] A ${bando} não conseguiu cumprir meu decreto sobre "${alvo}" e voltou viva, envergonhada (o alvo continua como estava — isso é CANON). A recompensa voltou ao meu bolso. Narre o retorno deles; o alvo provavelmente sabe que foi visado.`,
  decretoCumprido: ({ baixas, alvo, bando, mortos, descricao, recompensa, tipo }) => `[DECRETO — DESFECHO: CUMPRIDO${baixas ? " COM BAIXAS" : ""}] É CANON: meu decreto sobre "${alvo}" foi CUMPRIDO pela ${bando}${mortos.length ? ` (${mortos.join(", ")} morreram no serviço)` : ""}. "${descricao}" — feito. O sistema JÁ PAGOU ◉ ${recompensa} a eles (não envie moedas). Narre o retorno${mortos.length ? " ensanguentado" : " triunfal"} deles e as consequências reais do feito no mundo${tipo === "cabeca" ? " — mandei matar alguém: se o alvo era ligado a alguma facção, a relação despenca e pode haver represálias" : ""}.`,
  obraConcluida: ({ cidade, obra }) => `[OBRA CONCLUÍDA — JÁ APLICADA PELO SISTEMA] Em ${cidade} ficou pronta: ${obra}. Narre o que muda na cidade; não invente outra obra nem desfaça esta.`,
  revolta: ({ cidade, dias }) => `[REVOLTA — JÁ RESOLVIDA PELO SISTEMA] ${cidade} deixou de ser um domínio seu: o povo tomou a cidade depois de ${dias} dias de fúria. Narre a queda — quem abriu o portão, o que ficou para trás. Não a devolva e não invente um cerco que a retome.`,
  imposto: ({ imposto, cidade }) => `[IMPOSTO — JÁ APLICADO PELO SISTEMA] Mandei cobrar imposto ${imposto} em ${cidade}. Narre como a ordem chega à praça; não invente o número nem o efeito.`,
  obraIniciada: ({ obra, cidade, efeito, dias }) => `[OBRA INICIADA — JÁ PAGA PELO SISTEMA] Mandei erguer ${obra} em ${cidade}: ${efeito}. Leva ${dias} dias. Narre os pedreiros chegando; não a termine antes do tempo.`,
  governador: ({ quem, cidade }) => `[GOVERNADOR — JÁ NOMEADO PELO SISTEMA] Pus ${quem} para governar ${cidade}. Narre a nomeação e o que a cidade acha; não invente o que essa pessoa é.`,
  reivindicacao: ({ casa, cidade, dias }) => `[REIVINDICAÇÃO — JÁ PAGA PELO SISTEMA] A ${casa} reivindicou ${cidade}; leva ${dias} dias e ainda NÃO está feito. Narre o anúncio e quem se opõe — não conclua a posse e não a desfaça.`,
  tratado: ({ potencia, pacto }) => `[TRATADO — JÁ FIRMADO PELO SISTEMA] ${potencia} firmou ${pacto} comigo depois que cumpri a condição. Narre o selo, não reabra a decisão.`,
};
export function oEnvelopeDoDominio(qual, dados) {
  return aFormaDe(ENVELOPES_DO_DOMINIO, qual, "do domínio")(dados || {});
}

/* ============================================================
   15.º GRUPO — O TEMPO E A NOITE: as linhas que o sistema junta ao envelope
   de passar o tempo e ao do fim do descanso — o clima que virou (ao passar
   as horas e durante a noite), o sonho da noite longa (com a condição que
   deixou, ou nenhuma) e o onde acordo quando a jornada segue. Cada uma abre
   com a quebra de linha: é cauda de outro envelope, e o App passa-a pronta
   (`clima` de passarOTempo, a `cauda` de levantarDescansado). As chances de
   o clima virar e de haver sonho são números: moram em
   src/motor/tempo-do-turno.js (CHANCE_DO_CLIMA, CHANCES_DA_NOITE).
   ============================================================ */
export const ENVELOPES_DO_TEMPO = {
  climaAoPassar: ({ rotulo, nota }) => `\n[CLIMA] O tempo virou: agora está ${rotulo} — ${nota}. Use isso na cena.`,
  climaDaNoite: ({ rotulo, nota }) => `\n[CLIMA] O tempo virou durante a noite: agora está ${rotulo} — ${nota}.`,
  sonho: ({ texto, efeito }) => `\n[SONHO] O sonho desta noite: "${texto}"${efeito ? ` (acordei ${efeito === "inspirado" ? "INSPIRADO" : "PERTURBADO"} — condição já aplicada pelo sistema)` : ""}. Teça o sonho na ficção se quiser — presságio, memória ou puro delírio, você decide o quanto ele significa.`,
  ondeAcordo: ({ local }) => `\n[ONDE ACORDO] Eu ainda estou EM VIAGEM (${local}) — acordo no mesmo lugar em que dormi (acampamento na estrada, cabine do navio, etc.). A viagem CONTINUA de onde parou: proibido me colocar em cidade/aposentos; o destino ainda está adiante.`,
};
export function oEnvelopeDoTempo(qual, dados) {
  return aFormaDe(ENVELOPES_DO_TEMPO, qual, "do tempo")(dados || {});
}

/* ============================================================
   16.º GRUPO — A FÉ E AS CASAS: o que o sistema já decidiu sobre as casas a
   que o herói pertence e sobre o nome dele nas cidades, e o Narrador só põe
   em cena — o ingresso numa guilda (com o posto de entrada e o mestre que o
   recebe) e a casa que ele próprio fundou, a cidade cuja fé virou, o templo
   erguido do cofre e o estado divino alinhado com a história já jogada. São
   notas do turno (o App junta-as abaixo da que já havia).
   `posto`, `oficio`, `titulo`: o App passa-os já ditos (postoDaCasa,
   oficioDaCasa, tituloDe). `de`/`para`: os degraus da fé (o `rotulo`, e do
   novo a `recepcao`); `subiu`: se a devoção subiu ou recuou.
   ============================================================ */
export const ENVELOPES_DA_FE = {
  guilda: ({ nome, posto, mestre }) => `[GUILDA — RESOLVIDO PELO SISTEMA] Fui aceito n${nome.startsWith("A ") ? "" : "a "}${nome} como ${posto}. ${mestre} me recebeu. Narre o momento do ingresso em 2-3 frases — o lugar, quem estava lá, o que se exige de um recem-chegado. Nao invente posto, lei nem promessa da casa: isso e do sistema.`,
  guildaFundada: ({ nome, oficio, sede }) => `[GUILDA FUNDADA — RESOLVIDO PELO SISTEMA] Abri a minha propria casa: ${nome}, de ${oficio}, com sede em ${sede}. Narre a abertura das portas em 2-3 frases.`,
  feNaGeografia: ({ cidade, de, para, fe, subiu }) => `[FÉ NA GEOGRAFIA — REGISTRO DO SISTEMA] ${cidade} passou de "${de.rotulo}" para "${para.rotulo}" (${fe}% de devoção ao herói). Isso é fato: ${subiu ? `daqui em diante o povo de ${cidade} ${para.recepcao} — mostre isso na primeira cena que se passar lá` : `a devoção recuou em ${cidade} — sacerdotes rivais ganharam espaço e o povo esfriou`}.`,
  templo: ({ templo, cidade, custo, fe }) => `[TEMPLO ERGUIDO — REGISTRO DO SISTEMA] Um ${templo.toLowerCase()} em nome do herói foi construído em ${cidade}, pago do cofre (◉ ${custo}). A devoção da cidade subiu para ${fe}%. Narre a obra e o que ela cria: sacerdócio próprio, ofícios diários, gente que passa a rezar o nome dele — e a reação do culto que já estava ali, que não vai gostar. Os números já foram aplicados; não os recalcule.`,
  ascensao: ({ depois, titulo, fieis, pf, dominio, patrono }) => `[ASCENSÃO — RECALIBRAÇÃO DO SISTEMA] O estado divino do herói foi alinhado com a história já jogada: GD ${depois} (${titulo}), ${fieis} fiéis, ${pf} PF${dominio ? `, domínio ${dominio}` : ""}${patrono ? `, patrono ${patrono}` : ""}. Trate como verdade estabelecida — a história já o reconhecia assim.`,
};
export function oEnvelopeDaFe(qual, dados) {
  return aFormaDe(ENVELOPES_DA_FE, qual, "da fé e das casas")(dados || {});
}

/* ============================================================
   17.º GRUPO — O CAMINHO: o que o sistema já decidiu sobre onde o herói
   está, e o Narrador só põe em cena — o regresso às ruas da cidade, o
   deslocamento no tabuleiro (com quem tentou acertá-lo na saída), a chegada
   ao fim da estrada e o destino que o mapa não tem (o sistema NÃO o moveu).
   São notas do turno (o App junta-as abaixo da que já havia).
   `de`: o lugar de onde saiu, já com a preposição (comDe); `colados`: os
   que estavam ao lado na saída (cada um com o `nome`).
   ============================================================ */
export const ENVELOPES_DO_CAMINHO = {
  movimentoRegistrado: ({ de, cidade }) => `[MOVIMENTO — REGISTRADO PELO SISTEMA] Eu saí ${de} e AGORA estou de volta às ruas de ${cidade}. O sistema já registrou. Narre a cena AQUI.`,
  movimentoResolvido: ({ nomeDe, nomePara, colados }) => `[MOVIMENTO — RESOLVIDO PELO SISTEMA] Eu me desloquei ${nomeDe === nomePara ? `dentro de ${nomePara}` : `de ${nomeDe} para ${nomePara}`}${colados.length ? `, e ${colados.map((c) => c.nome).join(", ")} tentou me acertar na saída` : ""}. Narre o deslocamento usando os nomes dos lugares e nada mais: não cite metros nem quadrados, não mova ninguém junto comigo, não faça inimigo nenhum me alcançar de outro lugar.`,
  chegada: ({ dias, destino }) => `[CHEGADA — REGISTRADA PELO SISTEMA] A estrada acabou: ${dias} dias de marcha cobriram o trecho e eu ESTOU em ${destino}, dentro dela. Narre a chegada — o que se vê do portão, o que muda no ar, quem repara em mim — e trate este lugar como o meu lugar a partir de agora. Não me ponha de volta na estrada.`,
  destinoNaoReconhecido: () => `[DESTINO NÃO RECONHECIDO — AVISO DO SISTEMA] Eu falei em ir a algum lugar e o sistema não reconheceu, no mapa que conhecemos, nenhuma cidade com esse nome. Ele NÃO me moveu, e continuo exatamente onde estava.
REGRA DESTE ENVELOPE (obrigatória): trate o resto da minha frase normalmente — provavelmente ela não era sobre viajar. NÃO me ponha na estrada, NÃO invente uma cidade para o nome que eu disse e NÃO me faça chegar a lugar nenhum. Se de fato havia um destino ali e ele não existe no mundo, diga isso pela ficção, em uma frase, e siga.`,
};
export function oEnvelopeDoCaminho(qual, dados) {
  return aFormaDe(ENVELOPES_DO_CAMINHO, qual, "do caminho")(dados || {});
}

/* ============================================================
   18.º GRUPO — A GENTE E A HISTÓRIA: o que o sistema já decidiu sobre as
   pessoas e o rumo da campanha, e o Narrador só põe em cena — o companheiro
   que saiu do grupo, a missão que fracassou, a relação que eu declarei e a
   que o meu jeito mudou, e o arco novo que eu escolhi.
   Quatro são notas do turno (o App junta-as abaixo da que já havia); a
   relação mudada é a cauda do envelope da perícia (o App junta-a ao env).
   `rotulo`: o rótulo da relação como a tabela de npcs o diz (a forma o
   põe em maiúscula); `instrucao`: a direção da 1.ª etapa do arco.
   ============================================================ */
export const ENVELOPES_DA_GENTE = {
  companheiroFoiEmbora: ({ quem }) => `[O COMPANHEIRO FOI EMBORA — CANON] ${quem} saiu do grupo, por decisão dele. Narre a saída na cena, sem discussão longa e sem chance de convencê-lo hoje. Ele não morreu: continua no mundo, e lembra por que saiu.`,
  missaoPerdida: ({ titulo, motivo }) => `[MISSAO PERDIDA — RESOLVIDO PELO SISTEMA] "${titulo}" fracassou: ${motivo}. Isto e fato consumado e nao se desfaz. Deixe o peso disso aparecer na cena em uma ou duas frases — nao ofereca uma segunda chance, nao sugira que houve engano, e nao reabra o assunto nos proximos turnos.`,
  relacaoFormal: ({ nome, rotulo, relacao }) => `[RELAÇÃO FORMAL — CANON ABSOLUTO] Eu declarei formalmente: minha relação com ${nome} é ${rotulo.toUpperCase()}${relacao === "conjuge" ? " — CÔNJUGE: somos casados, isso é fato consumado e permanente (trate como parte do nosso presente, sem inventar um passado longo que não esteja registrado)" : ""}. Registre no cânone e trate como verdade absoluta daqui em diante.`,
  relacaoMudada: ({ pessoa, rotulo }) => `[RELAÇÃO — MUDADA PELO SISTEMA] O jeito que eu usei cobrou seu preço: ${pessoa} agora me vê como ${rotulo.toUpperCase()}. Isto é fato, e vale daqui em diante — trate essa pessoa assim na próxima vez que ela aparecer, sem que eu precise lembrar.`,
  novoArco: ({ arco, instrucao }) => `[NOVO ARCO ESCOLHIDO PELO JOGADOR: ${arco}] NÃO reinicie o mundo: tudo que foi vivido permanece canônico. Costure a transição a partir da situação ATUAL — a campanha apenas muda de perspectiva dramática. Direção do momento em que ele recomeça: ${instrucao} Trabalhe com as missões, ameaças e relógios que JÁ existem, adaptando o que não fizer mais sentido; e não me diga em que momento do arco eu estou.`,
};
export function oEnvelopeDaGente(qual, dados) {
  return aFormaDe(ENVELOPES_DA_GENTE, qual, "da gente")(dados || {});
}
