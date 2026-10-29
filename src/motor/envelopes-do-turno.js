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
};
export function oEnvelopeDaFicha(qual, dados) {
  return aFormaDe(ENVELOPES_DA_FICHA, qual, "da ficha")(dados || {});
}
