/* ============================================================
   OS MODOS (v9.213) — a moldura das mesas

   O documento "As Duas Mesas" abre com a lei-mãe: um modo é uma LENTE
   sobre o motor que já existe — um preset de flags que diz o que liga,
   o que desliga, o que encurta. Nenhuma regra de jogo mora aqui; aqui
   mora só o catálogo do que cada mesa é.

   ---------------- OS TRÊS MODOS ----------------

     historia   Uma Vida — o jogo de sempre. Default absoluto: um save
                sem campo `modo` é historia, e o preset historia não
                muda UM BIT do jogo atual (a suíte inteira é a prova).
     rapida     Uma Noite — 20 a 30 minutos por contrato, dois pratos
                (o Capítulo e o Torneio). Nasce nas etapas M2–M6.
     duelo      O Duelo — jogador contra jogador nos trilhos da sala.
                Nasce nas etapas D2–D4.

   ---------------- SAVE É TERRITÓRIO ----------------

   Cada modo salva no seu espaço de localStorage. Uma partida rápida
   NUNCA encosta no save da campanha; apagar uma não risca a outra. O
   espaço da historia é EXATAMENTE a chave que sempre foi — trocar o
   nome dela apagaria meses de saga de todo jogador na primeira carga.
   O mesmo vale para a chave de backup da importação, que já existia
   com nome próprio antes dos modos.

   O modo viaja no save e NÃO muda depois de criado: `modoDoSave` lê,
   saneia e devolve — nunca há um "trocar de modo" em jogo.
   ============================================================ */

export const MODO_PADRAO = "historia";

export const MODOS = [
  {
    id: "historia",
    nome: "Uma Vida",
    diz: "Uma campanha inteira: um mundo que lembra, um herói que muda com ele.",
    espaco: "taverna_save_v1",
    /* legado: o backup da importação já se chamava assim antes dos modos */
    espacoAnterior: "taverna_save_anterior",
    botoes: {
      geracao: "plena",          // o mundo nasce inteiro
      ritmoDoEpisodio: "dia",    // marcos andam por dias (DIAS_ENTRE_MARCOS)
      tetoDeCenas: 0,            // sem orçamento: a vida não tem relógio
      pratos: [],                // a campanha não se divide em pratos
      dormentes: [],             // nada dorme
      fama: "plena",
      narrador: "pleno",
      conversao: false,          // não há para onde converter: já é a vida
    },
  },
  {
    id: "rapida",
    nome: "Uma Noite",
    diz: "20 a 30 minutos: um capítulo inteiro, ou o torneio até sobrar um.",
    espaco: "taverna_rapida_v1",
    espacoAnterior: "taverna_rapida_v1_anterior",
    botoes: {
      geracao: "minima",         // 1 região, 1 cidade + 2 lugares (M5)
      ritmoDoEpisodio: "cena",   // marcos andam por cenas resolvidas (M5)
      tetoDeCenas: 3,            // na cena-limite, o marco EMPURRA (lei ix)
      pratos: ["capitulo", "torneio"],
      /* o que dorme na Noite — e o que dorme fica OCULTO (lei iv):
         botão morto mente */
      dormentes: ["dominios", "guildas", "reino", "correio", "nemesisHeranca", "devocaoProfunda", "encalhe"],
      fama: "noite",             // o nome desta noite: morre com a partida
      narrador: "pleno",
      conversao: true,           // o pronto vitorioso pode nascer numa campanha
    },
  },
  {
    id: "duelo",
    nome: "Duelo",
    diz: "Dois jogadores, uma arena, melhor de três. O prêmio é a briga.",
    espaco: "taverna_duelo_v1",
    espacoAnterior: "taverna_duelo_v1_anterior",
    botoes: {
      geracao: "nenhuma",        // o duelo não tem mundo: tem arena
      ritmoDoEpisodio: "cena",
      tetoDeCenas: 0,
      pratos: [],
      dormentes: ["dominios", "guildas", "reino", "correio", "nemesisHeranca", "devocaoProfunda", "encalhe", "mapa", "mercado", "livro"],
      fama: "nenhuma",
      narrador: "seco",          // linhas dos bancos por padrão: zero IA
      conversao: false,          // o duelo não deixa cicatriz (lei vi)
    },
  },
];

export function modoPorId(id) {
  return MODOS.find((m) => m.id === id) || MODOS[0];
}

/* saneia qualquer coisa para um id de modo válido — lixo vira historia,
   porque todo save anterior aos modos É historia */
export function garantirModo(id) {
  return MODOS.some((m) => m.id === id) ? id : MODO_PADRAO;
}

/* o modo de um save: lê o campo, saneia, devolve. Imutável por desenho —
   quem carrega um save entra no modo dele, sempre. */
export function modoDoSave(sv) {
  return garantirModo(sv && typeof sv === "object" ? sv.modo : null);
}

/* ---------------- SAVE É TERRITÓRIO ---------------- */
export function espacoDoSave(id) {
  return modoPorId(garantirModo(id)).espaco;
}
export function espacoAnterior(id) {
  return modoPorId(garantirModo(id)).espacoAnterior;
}

/* ---------------- OS BOTÕES DO PRESET ---------------- */
export function botoesDoModo(id) {
  return { ...modoPorId(garantirModo(id)).botoes };
}
/* um sistema dorme neste modo? Quem pergunta são as abas e os handlers
   dos sistemas de fôlego longo, a partir do M5. */
export function dorme(id, sistema) {
  return modoPorId(garantirModo(id)).botoes.dormentes.includes(sistema);
}
