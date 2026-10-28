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
  const f = ENVELOPES_DA_MASMORRA[qual];
  if (!f) throw new Error("envelope da masmorra sem forma: " + qual);
  return f(dados || {});
}
