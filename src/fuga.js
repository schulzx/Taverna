/* ============================================================
   A FUGA — a porta de "eu corro", e a conta que diz se ela abre

   POR QUE ISTO EXISTE. Jogado em produção no R15: emboscada na estrada,
   três javalis-de-pedra a 19,5 m, a heroína com 18 PV. A frase mais óbvia
   que um jogador escreve numa luta que não quer — "Recuo depressa pela
   estrada e fujo dos javalis" — e o jogo não fugiu. Deixou-a no sítio,
   deu-lhes a rodada, e os três acertaram: 18 → 3 PV.

   E OS TRÊS GOLPES ERAM FANTASMAS. `ehRetirada` (combate.js) reconheceu a
   frase, e o App cobrou `oportunidadesContraOJogador` com a lista INTEIRA
   de inimigos de pé, sem olhar distância. Os javalis são corpo a corpo
   (1,5 m de alcance) e andam 9 m: nenhum deles tocava a heroína, nem
   chegou a tocar na vez deles. Golpe de oportunidade é de quem está
   COLADO — quem vê você sair de longe não tem o que golpear. O conserto
   do fantasma é `quemGolpeiaAoSair`, a mesma conta que `adjacentes`
   (grid.js) já faz para o Mover.

   E O BURACO DE BAIXO: depois de cobrar, nada movia o herói nem encerrava
   a luta. Recuar custava, e não levava a lado nenhum. O espelho disto já
   existia do outro lado da mesa — `querFugir` (combate.js) deixa o
   inimigo ferido sair da luta de verdade, com `fugiu` a distinguir quem
   escapou vivo. O jogador era o único na mesa sem essa porta.

   POR QUE SEM DADO. O veredito é aritmética de distância e passo: quem
   está colado, quanto chão cada um cobre numa rodada, quem chega perto o
   bastante para bater. Nada disso depende de sorte, e por isso a resposta
   inteira pode ser mostrada ANTES do clique — "o veredito antes do
   clique" é lei desta casa, e uma fuga que rolasse um d20 escondido só
   poderia prometer "talvez". Os únicos dados são os golpes de
   oportunidade, que rolam como todo ataque do combate já rola — e, desde
   a terceira volta (abaixo), com semente, por `rolarOCustoDaFuga`.

   O MODELO, em uma frase: é uma corrida de uma rodada. O herói cobre o
   passo dele vezes `FUGA.corrida` (a Disparada do 5e) ou vezes
   `FUGA.desengajado` (a ação foi gasta em sair de guarda erguida, e por
   isso ninguém golpeia); cada inimigo de pé persegue com o passo dele
   vezes `FUGA.perseguicao`, cortado pela condição em que está. Se, no fim,
   algum deles fica ao alcance natural do herói, a fuga não abre.

   O que isto dá à mesa: colado a um bicho tão rápido quanto você, nem
   correndo — mas derrubá-lo antes (caído, persegue à metade) ou ganhar
   distância antes abre a fuga. Empurrar e Derrubar ganham razão de ser.

   O QUE ELE NÃO FAZ: geometria (é de grid.js), ler as pernas de ninguém (é
   de movimento.js), a regra do golpe (é de combate.js), nem mexer no estado.
   Os inimigos entram e saem intactos; o que volta é estrutura nova.

   ---------------- NADA SAI DE GRAÇA (a terceira volta) ----------------

   A pessoa, depois do R15 e do R21: "nada sai de graça, tudo tem
   consequência, mas lembre-se de que existem as rolagens de dado — o
   arqueiro pode errar o tiro, mas ele pode se fortalecer e ir atrás do
   personagem; a consequência pode não ser dano, pode ser outra."

   A TENSÃO, e como ela se resolve. O veredito antes do clique pede a
   resposta inteira; o dado pede que o desfecho não se saiba. As duas
   cabem porque são perguntas diferentes:
     · SE a fuga abre continua aritmética, sem dado — quem alcança,
       alcança. É isto que deixa o veredito inteiro antes do clique;
     · o que ela CUSTA é rolado, com SEMENTE (lei da casa), e antes do
       clique mostra-se a CHANCE, em voz de mundo — nunca o resultado.
       O veredito antes do clique exige saber o risco, não o desfecho.

   E TRÊS PEÇAS NOVAS:
     1. quem ataca DE LONGE não segura quem foge — cobra. Não persegue
        para fechar a fuga; dispara uma vez nas costas de quem corre,
        com desvantagem se a distância é longa;
     2. o custo rola com semente (`rolarOCustoDaFuga`): a mesma semente
        dá o mesmo golpe, em qualquer máquina;
     3. toda fuga que escapa deixa UMA consequência no mundo, que não é
        dano: voltam mais fortes, guardam o lugar, ou seguem o rasto —
        sorteada pela semente e pesada pela cabeça de quem ficou
        (`consequenciaDaFuga`). Por cima dela, sempre, a fama: o App já
        conta a fuga (`bumpCont("fugas")`), o antagonista já lê "que eu
        corro quando aperta", e o cobrador já cobra `a_fuga_correu` de
        quem viu. Nada disso é reescrito aqui.
   ============================================================ */

import { distanciaM, alcanceNatural } from "./grid.js";
import { deslocamentoDeCriatura, deslocamentoDe } from "./movimento.js";
import { condicaoPorId, normalizarCondicao, mecanicaDe } from "./condicoes.js";
import { estaVirado } from "./controle.js";
import {
  pedeDesengajar, defesaDe, ladosDoDado, bonusContraOJogador, danoDe,
  ataqueDeOportunidade, oportunidadesContraOJogador,
} from "./combate.js";
import { TETO_DA_LINHA, ALCANCES } from "./golpe.js";
import { perfilDe } from "./danos.js";
import { estaInvisivel } from "./gatilhos.js";
import { hashSemente, rng } from "./semente.js";
import { degrauDaCriatura, ordemDoDegrau, DEGRAU_DO_CHAO } from "./degraus.js";
import { criarRelogio, garantirRelogios, MAX_RELOGIOS } from "./relogios.js";

/* ============================================================
   A TABELA DA FUGA — quantos passos cada um cobre numa rodada.

   corrida: 2      a Disparada do 5e — o movimento, e a ação gasta em
                   mover outra vez. Quem corre dá as costas, e quem está
                   colado golpeia.
   desengajado: 1  o Desengajar do 5e — a ação vai em sair de guarda
                   erguida, sobra só o movimento. Ninguém golpeia, mas o
                   chão coberto é a metade.
   perseguicao: 2  o inimigo que persegue faz o mesmo que o herói que
                   corre: move e dispara. Simetria de propósito — se o
                   perseguidor corresse menos, fugir de um bicho igual a
                   você seria sempre de graça.
   ============================================================ */
export const FUGA = { corrida: 2, desengajado: 1, perseguicao: 2 };

/* ============================================================
   O QUE A CONDIÇÃO FAZ COM QUEM PERSEGUE — um fator sobre o passo dele.
   Os ids são os do catálogo (condicoes.js). Quem tem mais de uma fica
   com a PIOR (o menor fator): quem está caído e agarrado não levanta
   para correr.

   caido: 0.5       levantar custa metade do deslocamento (5e). É o que
                    faz Derrubar abrir a fuga.
   lento: 0.5       o 5e corta o deslocamento de quem está lento; e é a
                    mesma metade que `deslocamentoDe` já aplica ao herói
                    lento (movimento.js), para os dois lados da mesa
                    pagarem igual.
   agarrado: 0      preso não sai do lugar — o catálogo diz "sem sair do
                    lugar", e `deslocamentoDe` já zera o herói agarrado.
   paralisado: 0    corpo travado.
   atordoado: 0     perde a ação e o movimento com ela.
   amedrontado: 0   o 5e proíbe o amedrontado de se APROXIMAR da fonte do
                    medo por vontade própria. O motor não guarda quem é a
                    fonte; no meio de uma luta contra o herói, é ele. Meter
                    medo num bicho passa a ser uma saída.

   Fora de propósito: `cego`, `enfeiticado`, `exausto`, `enfraquecido`.
   Nenhum deles tira pernas no catálogo (todos são "desvantagem"), e uma
   perna cortada que a descrição da condição não diz seria o sistema a
   mentir sobre a própria regra.
   ============================================================ */
export const PERSEGUICAO_POR_CONDICAO = {
  caido: 0.5,
  lento: 0.5,
  agarrado: 0,
  paralisado: 0,
  atordoado: 0,
  amedrontado: 0,
};

/* ============================================================
   QUEM ATACA DE LONGE — não segura quem foge: cobra.

   HOJE NENHUM INIMIGO DO BESTIÁRIO LUTA DE LONGE. O campo `distancia`
   só nasce em invocações (invocacoes.js), e o Atirador do bestiário
   ("perigoso à distância") luta corpo a corpo. Mudar isso no combate é
   outro item; na FUGA, o nome basta para saber quem tem arco ou feitiço
   — e é aqui que ter arco muda a conta: quem foge de um arqueiro não é
   alcançado por ele, é alvejado.

   A tabela é de NOMES (o `desc` do bestiário não chega à mesa: é dívida
   conhecida de `completarInimigo`, escrita em degraus.js), e o `desc` é
   lido também, para o dia em que chegar. Duas famílias:
     arma   quem dispara coisa — arco, besta, funda, dardo.
     magia  quem conjura de longe. O Lich entra: é o conjurador por
            excelência, e fugir de um é fugir de um feitiço nas costas.
   FICOU DE FORA o Cultista: no 5e ele luta de cimitarra, e um sacerdote
   sombrio que só o nome faz conjurador entra pelo "sombrio", não pelo
   "cultista". E o Caçador: caçador de faca é tão comum quanto de arco.
   ============================================================ */
export const QUEM_ATACA_DE_LONGE = [
  { id: "arma", rx: /\b(atirador|atiradora|franco-?atirador|arqueir[oa]s?|besteir[oa]s?|fundibulari[oa]s?|lanca-?dardos)\b/ },
  { id: "magia", rx: /\b(mago|maga|feiticeir[oa]|brux[oa]|xama|conjurador|conjuradora|necromante|piromante|lich|sacerdote sombrio|sacerdotisa sombria)\b/ },
  { id: "descrito", rx: /\b(a distancia|de longe)\b/ },
];

export function atacaDeLonge(inimigo) {
  if (!inimigo || typeof inimigo !== "object") return false;
  if (inimigo.distancia) return true;
  const t = N(`${inimigo.nome || ""} ${inimigo.desc || ""}`);
  return QUEM_ATACA_DE_LONGE.some((q) => q.rx.test(t));
}

/* ============================================================
   O DISPARO NAS COSTAS — a tabela.

   alcance        o teto da arma de longe, lido de golpe.js (36 m): mais
                  longe do que isso, ninguém atira.
   longaAcimaDe   a metade do alcance (18 m). É o "curto/longo" do 5e: a
                  arma tem duas distâncias, e atirar além da curta é com
                  desvantagem. Derivado, e não escrito à mão, para que
                  mudar o alcance mude a faixa junto.

   A DISTÂNCIA que conta é a do momento da fuga, não a do fim da corrida:
   o tiro sai quando ele se vira para correr, que é quando dá as costas.
   ============================================================ */
export const DISPARO_NA_FUGA = {
  alcance: ALCANCES.armaDeLonge,
  longaAcimaDe: ALCANCES.armaDeLonge / 2,
};

/* ============================================================
   A CHANCE — exata, para o d20 que `resolverAtaque` rola.

   Face por face, com as duas regras que o motor aplica ANTES da soma: o
   1 natural erra sempre (o "desastre"), e a face do crítico (20, ou
   `criticoEm`) acerta sempre. As outras acertam se face + bônus alcançar
   a defesa. Vantagem é o melhor de dois (1 − (1 − p)²), desvantagem o pior
   (p²), e as duas juntas se cancelam, como no motor. A suíte prova isto
   face por face contra o próprio `resolverAtaque`, com a sorte semeada.
   ============================================================ */
export function chanceDeAcerto(args) {
  const a = args && typeof args === "object" ? args : {};
  const bonus = Number(a.bonus) || 0;
  const defesa = Number(a.defesa);
  if (!Number.isFinite(defesa)) return null;
  const critico = Math.max(2, Math.min(20, Number(a.criticoEm) || 20));
  let faces = 0;
  for (let f = 1; f <= 20; f++) if (f !== 1 && (f >= critico || f + bonus >= defesa)) faces++;
  const p = faces / 20;
  const vant = !!a.vantagem, desv = !!a.desvantagem;
  if (vant && !desv) return 1 - (1 - p) * (1 - p);
  if (desv && !vant) return p * p;
  return p;
}

/* ============================================================
   A VOZ DA CHANCE — o que o jogador lê, sem número e sem mecanismo.

   Faixas de cima para baixo; a primeira cujo `min` a chance alcança é a
   voz. `um` fala de UM ataque, com quem ataca como sujeito ("Atirador
   pode te acertar"); `algum` fala de VÁRIOS, e aí a chance é a de pelo
   menos um acertar — a pergunta que importa a quem vai levar três
   ataques é se sai inteiro, não a média deles.

   Sem defesa conhecida (o chamador não deu a ficha), a chance é `null` e
   a voz é a do meio de baixo, "pode": não promete nem assusta.
   ============================================================ */
export const FAIXAS_DA_CHANCE = [
  { id: "quase_certo", min: 0.75, um: "quase não erra", algum: "algum quase certamente acerta" },
  { id: "provavel", min: 0.5, um: "deve te acertar", algum: "algum deve te acertar" },
  { id: "pode", min: 0.25, um: "pode te acertar", algum: "algum pode te acertar" },
  { id: "dificil", min: 0, um: "dificilmente acerta", algum: "dificilmente algum acerta" },
];
const FAIXA_SEM_CHANCE = "pode";
const faixaDaChance = (p) => (Number.isFinite(p)
  ? FAIXAS_DA_CHANCE.find((f) => p >= f.min) || FAIXAS_DA_CHANCE[FAIXAS_DA_CHANCE.length - 1]
  : FAIXAS_DA_CHANCE.find((f) => f.id === FAIXA_SEM_CHANCE));

/* ---------------- AS PEÇAS PEQUENAS ---------------- */

const N = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const redondo = (m) => Math.round((Number(m) || 0) * 10) / 10;
const lista = (x) => (Array.isArray(x) ? x.filter((e) => e && typeof e === "object") : []);
const temPosicao = (ent) => !!ent && ent.x != null && ent.y != null;

/* De pé = ainda está na luta. `fugiu` é o campo que o App grava em quem
   saiu por `querFugir`, e quem saiu não golpeia nem persegue. */
const dePe = (e) => !e.derrotado && !e.fugiu && (Number(e.vida) || 0) > 0;

/* Quem está do lado do herói nesta rodada (a marionete de `controle.js`)
   não golpeia nem persegue: o turno dele é contra os próprios. */
const doOutroLado = (e, rodada) => estaVirado(e, rodada);

/* Colado = dentro do alcance natural do bicho, a conta de `adjacentes`.
   SEM POSIÇÃO — luta sem grade, ou entidade sem x/y — conta como colado:
   é o conservador, e é o comportamento antigo para golpes. */
function distanciaDaFuga(heroi, e) {
  if (!temPosicao(heroi) || !temPosicao(e)) return alcanceNatural(e);
  return distanciaM(e, heroi);
}

/* ============================================================
   QUEM GOLPEIA AO SAIR — o conserto do fantasma do R15.

   Os colados de pé. Fica de fora quem não pode reagir: a marionete (está
   do lado de cá) e quem perdeu a ação (`perdeAcao` do catálogo —
   atordoado, paralisado), porque o golpe de oportunidade é REAÇÃO, e no
   5e quem está incapacitado não reage.

   Devolve os PRÓPRIOS objetos de inimigo (não cópias), para o App poder
   passá-los direto a `oportunidadesContraOJogador` no lugar da lista
   inteira.
   ============================================================ */
export function quemGolpeiaAoSair(heroi, inimigos, opcoes) {
  const rodada = (opcoes && opcoes.rodada != null) ? opcoes.rodada : 1;
  return lista(inimigos).filter((e) => dePe(e) && !doOutroLado(e, rodada)
    && !mecanicaDe(e.condicoes || []).perdeAcao
    && distanciaDaFuga(heroi, e) <= alcanceNatural(e));
}

/* O fator da pior condição de quem persegue (1 = sem nenhuma). */
function fatorDePerseguicao(e) {
  let f = 1;
  for (const inst of lista(e.condicoes)) {
    const c = condicaoPorId(inst.id) || normalizarCondicao(inst.nome || inst.id || "");
    if (!c) continue;
    const v = PERSEGUICAO_POR_CONDICAO[c.id];
    if (v != null && v < f) f = v;
  }
  return f;
}

/* ============================================================
   UM MODO — a corrida inteira, para um jeito de sair.
   ============================================================ */
/* A CHANCE DE UM INIMIGO ACERTAR O HERÓI QUE SAI: a mesma porta do dado
   (`ladosDoDado`), o mesmo bônus (`bonusContraOJogador`) e a mesma
   desvantagem de quem não se vê (`estaInvisivel`) que o golpe rolado vai
   usar em `ataqueDeOportunidade` — senão a chance mostrada e o dado
   rolado seriam de duas regras. Sem defesa conhecida, `null`. Nunca
   estoura: é lida a cada tecla da frase. */
function chanceContra(e, alvo, defesa, gdJogador, desvantagemExtra) {
  if (!Number.isFinite(defesa)) return null;
  try {
    const a = alvo && typeof alvo === "object" ? alvo : {};
    const lados = ladosDoDado({
      alvo: a, desvantagem: estaInvisivel(a) || desvantagemExtra === true,
      condAtacante: e.condicoes || [], condAlvo: a.condicoes || [], tipoDano: perfilDe(e).ataque,
    });
    if (lados.impedido || lados.intocavel) return 0;
    return chanceDeAcerto({ bonus: bonusContraOJogador(e, gdJogador), defesa, vantagem: lados.vantagem, desvantagem: lados.desvantagem });
  } catch { return null; }
}

/* A chance de ALGUM dos ataques acertar: 1 − Π(1 − p). Uma chance
   desconhecida torna o todo desconhecido; nenhum ataque, zero. */
function chanceDeAlgum(chances) {
  if (chances.some((c) => !Number.isFinite(c))) return null;
  return 1 - chances.reduce((resto, c) => resto * (1 - c), 1);
}

function medirModo({ heroi, inimigos, passoH, modo, rodada, alvo = null, defesa = null, gdJogador = 0 }) {
  const correndo = modo === "correndo";
  const corridaHeroi = redondo(passoH * (correndo ? FUGA.corrida : FUGA.desengajado));
  const golpeiam = correndo ? quemGolpeiaAoSair(heroi, inimigos, { rodada }) : [];
  const golpes = golpeiam.map((e) => e.nome);
  const chancesDosGolpes = golpeiam.map((e) => ({ nome: e.nome, chance: chanceContra(e, alvo, defesa, gdJogador, false) }));
  const naLuta = lista(inimigos).filter((e) => dePe(e) && !doOutroLado(e, rodada));
  /* QUEM ATACA DE LONGE NÃO PERSEGUE PARA SEGURAR: sai da corrida, e não
     fecha a fuga. Em vez disso, dispara uma vez — se não está colado (o
     colado golpeia ao sair, como qualquer um; nunca os dois), se não
     perdeu a ação, e se o herói está ao alcance da arma. Recuando de
     guarda erguida o tiro vem do mesmo jeito: o Desengajar do 5e poupa do
     golpe de quem está perto, não da flecha de quem está longe. */
  const disparos = naLuta
    .filter((e) => atacaDeLonge(e) && !mecanicaDe(e.condicoes || []).perdeAcao)
    .map((e) => ({ e, bruta: distanciaDaFuga(heroi, e) }))
    .filter(({ e, bruta }) => bruta > alcanceNatural(e) && bruta <= DISPARO_NA_FUGA.alcance)
    .map(({ e, bruta }) => {
      const desvantagem = bruta > DISPARO_NA_FUGA.longaAcimaDe;
      return { nome: e.nome, distanciaM: redondo(bruta), desvantagem, chance: chanceContra(e, alvo, defesa, gdJogador, desvantagem) };
    });
  const perseguidores = naLuta
    .filter((e) => !atacaDeLonge(e))
    .map((e) => {
      const dist = redondo(distanciaDaFuga(heroi, e));
      const alcance = alcanceNatural(e);
      const corridaDele = redondo(deslocamentoDeCriatura(e).metros * FUGA.perseguicao * fatorDePerseguicao(e));
      const distFinal = redondo(dist + corridaHeroi - corridaDele);
      return { nome: e.nome, distanciaM: dist, alcance, corridaDele, distFinal, alcanca: distFinal <= alcance };
    });
  const quemAlcanca = perseguidores.filter((p) => p.alcanca).map((p) => p.nome);
  /* A folga é o que sobra ao perseguidor mais bem colocado; sem ninguém a
     perseguir, é infinita. Serve para desempatar dois modos que escapam. */
  const folga = perseguidores.length
    ? Math.min(...perseguidores.map((p) => redondo(p.distFinal - p.alcance)))
    : Infinity;
  const parado = passoH <= 0;
  const escapa = !parado && quemAlcanca.length === 0;
  const motivo = escapa ? ""
    : parado ? "você não consegue sair do lugar"
    : `${quemAlcanca.join(", ")} ${quemAlcanca.length > 1 ? "alcançam" : "alcança"} você`;
  return {
    escapa, modo, corridaHeroi, golpes, perseguidores, quemAlcanca, folga, parado, motivo,
    chancesDosGolpes, disparos,
    chanceDeAlgum: chanceDeAlgum([...chancesDosGolpes, ...disparos].map((c) => c.chance)),
    quem: (heroi && heroi.nome) || "",
    deixados: lista(inimigos).filter(dePe).map((e) => e.nome),
  };
}

/* ============================================================
   O VEREDITO DA FUGA

   `desengajar` true/false força o modo; `frase` (o texto do jogador)
   força o recuo de guarda erguida quando o pede; sem nenhum, escolhe-se o
   melhor: entre os que escapam, o de menos golpes; empate, o de mais
   folga; se nenhum escapa, o veredito de quem corre — o que mais perto
   chegou —, com `escapa: false`.

   `passoHeroiM` é o passo da rodada (o de `passoEfetivo`, que já zera o
   herói agarrado ou paralisado). Sem número, lê-se das pernas do próprio
   herói em `deslocamentoDe` — nunca se inventa um 9.

   A CHANCE do que a fuga custa precisa da defesa do herói, e o `heroi`
   daqui é a peça da grade (posição), não a ficha. Por isso dois campos
   opcionais: `ficha` (a do jogador — a defesa sai de `defesaDe`, e as
   condições e a invisibilidade dela entortam o dado como no golpe de
   verdade) ou `defesaHeroi` explícito, que manda sobre a ficha. Sem
   nenhum dos dois, as chances são `null` e a linha fala na voz do meio.
   `gdJogador` é o degrau divino do herói, o mesmo que o golpe rolado lê.
   ============================================================ */
function defesaDaFuga(a, ficha) {
  if (typeof a.defesaHeroi === "number" && Number.isFinite(a.defesaHeroi)) return a.defesaHeroi;
  if (!ficha) return null;
  try { const d = defesaDe(ficha); return Number.isFinite(d) ? d : null; } catch { return null; }
}

export function vereditoDaFuga(args) {
  const a = args && typeof args === "object" ? args : {};
  const heroi = a.heroi && typeof a.heroi === "object" ? a.heroi : null;
  const inimigos = lista(a.inimigos);
  const rodada = a.rodada != null ? a.rodada : 1;
  const bruto = Number(a.passoHeroiM);
  const passoH = Number.isFinite(bruto) ? Math.max(0, bruto) : deslocamentoDe(heroi).andar;
  const ficha = a.ficha && typeof a.ficha === "object" ? a.ficha : null;
  const base = {
    heroi, inimigos, passoH, rodada,
    alvo: ficha || heroi, defesa: defesaDaFuga(a, ficha), gdJogador: Number(a.gdJogador) || 0,
  };
  /* a frase do jogador pode pedir o modo ("fujo de guarda erguida"); o
     campo explícito manda sobre ela. "fujo" sozinho não pede nada — não é
     uma ordem de dar as costas, é só fugir, e aí escolhe-se o melhor. */
  const desengajar = a.desengajar === true || a.desengajar === false ? a.desengajar
    : (a.frase && pedeDesengajar(a.frase) ? true : null);
  if (desengajar === true) return medirModo({ ...base, modo: "desengajando" });
  if (desengajar === false) return medirModo({ ...base, modo: "correndo" });
  const corre = medirModo({ ...base, modo: "correndo" });
  const recua = medirModo({ ...base, modo: "desengajando" });
  const quemEscapa = [corre, recua].filter((v) => v.escapa);
  if (!quemEscapa.length) return corre;
  quemEscapa.sort((x, y) => (x.golpes.length - y.golpes.length) || (y.folga - x.folga));
  return quemEscapa[0];
}

/* ============================================================
   A FRASE QUE QUER SAIR DA LUTA

   Diferente de `ehRetirada`, que é só afastar-se: aqui a frase quer
   ACABAR a luta para quem a diz. "Recuo dois passos e observo" é
   retirada, não fuga. Por isso quem liga as duas pergunta primeiro por
   esta.

   Os vetos cortam a frase que fala de fuga sem querer fugir — "não
   fujo", "não deixo o javali fugir", "impeço a fuga dele". São estreitos
   de propósito: um veto largo ("bloque" perto de "fuj") mataria "bloqueio
   o golpe e fujo", que é a fuga mais clássica que há. E a janela deles
   para na vírgula: "se ficar feio, fujo" continua a ser fuga.

   Por que não "fugindo" solto nem "a fuga" solta: "corro atrás do javali
   que está fugindo" e "vejo a fuga dele" falam da fuga de outro.

   O MODO não mora aqui: a frase que diz "de guarda erguida" entra no
   veredito pelo campo `frase`, que pergunta a `pedeDesengajar`
   (combate.js) — a mesma lista que `ehRetirada` já usa.
   ============================================================ */
const FRASES_DE_FUGA = [
  /* sem "fuja": é a ordem dada a outro ("grita para Elma: fuja!"), quase
     nunca a do herói — e o falso positivo aqui encerra a luta dele. */
  /\bfu(jo|jamos|gir|gimos|gi)\b/,
  /\b(saio|saimos|vou|vamos) fugindo\b/,
  /\b(em|minha|nossa) fuga\b/,
  /\b(tento|tentamos|tentar|busco|buscamos) (a |uma )?fuga\b/,
  /\bbat(o|emos|er) em retirada\b/,
  /\b(dou|damos|dar) no pe\b/,
  /\b(dou|damos|dar) o fora\b/,
  /\b(caio|caimos|cair) fora\b/,
  /\b(saio|saimos|sair) correndo\b/,
  /\b(corro|corremos|correr) (para|pra) (longe|fora)\b/,
  /\b(corro|corremos|correr) dali\b/,
  /\b(escapo|escapamos|escapar) (da|do) (luta|combate|briga|batalha|emboscada|confronto)\b/,
  /\b(saio|saimos|sair) (da|do) (luta|combate|briga|batalha|confronto)\b/,
  /\b(abandono|abandonamos|abandonar) (a|o) (luta|combate|briga|batalha)\b/,
];
const VETOS_DE_FUGA = [
  /\bnao (vou |quero |posso |devo |penso em |ouso )?(fug|fuj|bat[oe] em retirada|dou no pe|saio correndo)/,
  /\bsem (fugir|recuar)\b/,
  /* a ordem dada a OUTRO: "grito para Elma fugir", "mando o garoto fugir". */
  /\b(mando|mandamos|grito|gritamos|digo|dizemos|peco|pedimos|ordeno|aviso|imploro)\b[^.;!?]{0,30}\b(fugir|fuja|fujam|fugirem)\b/,
  /\b(impe[cd]\w*|bloque\w*|cort\w*|barr\w*) (a|sua|essa|esta) (fuga|retirada|rota de fuga)\b/,
  /\b(nao deix\w*|impe[cd]\w*|antes que|caso|se)\b[^.,;!?]{0,25}\b(fuja|fujam|fugir|fugirem|fugiu|fugiram)\b/,
];

export function ehFuga(texto) {
  const t = N(texto);
  if (!t) return false;
  if (VETOS_DE_FUGA.some((rx) => rx.test(t))) return false;
  return FRASES_DE_FUGA.some((rx) => rx.test(t));
}

/* ============================================================
   A LINHA DO VEREDITO — o que o jogador lê antes de tocar.

   O teto é o da linha do golpe (golpe.js), a mesma linha e a mesma
   largura. A sobra do nome sai da própria frase montada com o nome vazio,
   e não de um número à mão — mudar a frase não obriga a mexer em nada.

   Fala do que o jogador vive: quem o alcança, quem o golpeia. Nunca do
   mecanismo — "desengajar" e "Disparada" são bastidor.

   O CUSTO FALA EM CHANCE, NÃO EM DESFECHO. A linha antiga dizia "levando
   o golpe de X", e era mentira desde o primeiro dia: o golpe sempre foi
   rolado, e podia errar. Agora diz o que se sabe antes do clique — que X
   pode, deve ou dificilmente vai acertar —, pela faixa de
   `FAIXAS_DA_CHANCE`. Golpe de perto e tiro de longe falam igual: para
   quem corre, os dois são o mesmo risco nas costas.
   ============================================================ */
export const LINHAS_DA_FUGA = {
  parado:     () => "Você não consegue sair do lugar.",
  limpa:      () => "Você escapa — ninguém te alcança.",
  umCusto:    (n, voz) => `Escapa, mas ${n} ${voz}.`,
  variosCustos: (k, voz) => `Escapa sob ${k} ataques — ${voz}.`,
  umAlcanca:  (n) => `${n} te alcança — não dá para fugir.`,
  variosAlcancam: (k) => `${k} inimigos te alcançam — não dá para fugir.`,
};

/* A LISTA COMO SE FALA: "A", "A e B", "A, B e C". A vírgula solta até o
   último nome ("Aranha, Javali, Bandido ficam") é leitura de planilha. */
const nomesDe = (x) => (Array.isArray(x) ? x.map((n) => String(n == null ? "" : n).trim()).filter(Boolean) : []);
function emLista(nomes) {
  const l = nomesDe(nomes);
  if (l.length <= 1) return l[0] || "";
  return `${l.slice(0, -1).join(", ")} e ${l[l.length - 1]}`;
}

/* O número de série que o combate põe num bando ("Aranha do Fosso 2")
   não é coisa que o herói veja, nem distingue uma criatura de outra. */
const baseDoNome = (n) => String(n).replace(/\s+\d+$/, "").trim() || String(n);

const aparado = (nome, sobra) => {
  const s = String(nome || "");
  return s.length <= sobra ? s : s.slice(0, Math.max(1, sobra - 1)).trimEnd() + "…";
};
const comNome = (monta, nome) => monta(aparado(nome, TETO_DA_LINHA.chars - monta("").length));

export function linhaDaFuga(v) {
  if (!v || typeof v !== "object") return "";
  const L = LINHAS_DA_FUGA;
  if (v.parado) return L.parado();
  if (!v.escapa) {
    const q = Array.isArray(v.quemAlcanca) ? v.quemAlcanca : [];
    return q.length > 1 ? L.variosAlcancam(q.length) : comNome(L.umAlcanca, q[0] || "Alguém");
  }
  const custos = custosDe(v);
  if (!custos.length) return L.limpa();
  if (custos.length > 1) return L.variosCustos(custos.length, faixaDaChance(v.chanceDeAlgum).algum);
  const voz = faixaDaChance(custos[0].chance).um;
  return comNome((n) => L.umCusto(n, voz), custos[0].nome);
}

/* Os ataques que a fuga custa, golpes primeiro e disparos depois — a
   ordem em que a linha os conta e em que `rolarOCustoDaFuga` os rola. Um
   veredito sem `chancesDosGolpes` (de fora, ou antigo) tem chance null. */
function custosDe(v) {
  const g = nomesDe(v.golpes);
  const cg = Array.isArray(v.chancesDosGolpes) ? v.chancesDosGolpes : [];
  const golpes = g.map((nome, i) => ({ nome, tipo: "golpe", chance: cg[i] && cg[i].nome === nome ? cg[i].chance : null }));
  const disparos = lista(v.disparos).filter((d) => d.nome != null && String(d.nome).trim())
    .map((d) => ({ nome: String(d.nome).trim(), tipo: "disparo", chance: d.chance, desvantagem: d.desvantagem === true }));
  return [...golpes, ...disparos];
}

/* ============================================================
   A NOTA AO NARRADOR — só quando a fuga ACONTECE.

   Vai na mensagem do turno, nunca em bloco estático (o teto de prompt é
   sagrado), e por isso é curta. Diz o que é fato: o herói saiu, quem ficou
   para trás, e que eles continuam VIVOS no mundo — uma fuga que o
   Narrador transforma em vitória, ou em captura, desfaz a regra. Não
   carrega metros: número de grelha na prosa é o sistema a falar de si.
   ============================================================ */
export function notaDaFuga(v) {
  if (!v || typeof v !== "object" || !v.escapa) return "";
  const quem = v.quem || "O herói";
  const como = v.modo === "desengajando" ? "recuando de guarda erguida, sem dar as costas" : "em disparada";
  /* "exposto a", e não "levando": o que acertou de fato vai na nota dos
     golpes rolados, que o App monta ao lado desta */
  const g = nomesDe(v.golpes);
  const dsp = nomesDe(lista(v.disparos).map((d) => d.nome));
  const golpes = (g.length
    ? `, exposto ${g.length > 1 ? "aos golpes" : "ao golpe"} de ${emLista(g)} ao dar as costas`
    : "")
    + (dsp.length ? `${g.length ? " e" : ","} ao ataque de longe de ${emLista(dsp)}` : "");
  const deixados = nomesDe(v.deixados);
  /* "Não os mate" errava com uma aranha só (e feminina): a frase fala de
     QUEM FICOU, que não tem número nem gênero para errar. */
  const atras = deixados.length
    ? ` Ficaram para trás, VIVOS e ainda no mundo: ${emLista(deixados)}. Nesta cena, quem ficou para trás não morre nem o alcança.`
    : "";
  return `[FUGA — RESOLVIDA PELO SISTEMA] ${quem} saiu da luta ${como}${golpes}; a luta ACABOU.${atras} Narre a fuga e o fôlego depois dela.`;
}

/* ============================================================
   A LINHA DO ESCAPE — o que o jogador lê quando a fuga ACONTECE.

   Nasceu de um erro de concordância jogado no R21: "Aranha do Fosso
   ficam para trás". Um corpo é "fica", dois ou mais é "ficam", e a lista
   fecha com "e".

   Os nomes que o combate numera ("Aranha do Fosso 1", "... 2", "... 3" —
   é assim que a caçada batiza um bando) juntam-se num só, com a
   contagem: "Aranha do Fosso ×3". Três vezes o mesmo nome numa linha é
   ruído. A concordância conta CORPOS, não nomes: "Aranha do Fosso ×3
   ficam".

   Sem ninguém deixado (todos caídos ou fora da luta), a frase não inventa
   um sujeito vazio: diz só que ninguém segue o herói.

   O emoji é de quem monta a mensagem, como em linhaDaFuga.
   ============================================================ */
export const LINHAS_DO_ESCAPE = {
  sozinho: () => "Você escapa — ninguém vem no seu encalço.",
  um:      (quem) => `Você escapa — ${quem} fica para trás.`,
  varios:  (quem) => `Você escapa — ${quem} ficam para trás.`,
};

/* O bando dito como se fala: "Aranha do Fosso ×3", "Comandante e Soldado
   ×2". É a mesma voz na linha do escape e na consequência da fuga. */
function bandoEmPalavras(nomes) {
  const contagem = new Map();
  for (const n of nomes) {
    const b = baseDoNome(n);
    contagem.set(b, (contagem.get(b) || 0) + 1);
  }
  return emLista([...contagem].map(([nome, k]) => (k > 1 ? `${nome} ×${k}` : nome)));
}

export function linhaDoEscape(v) {
  const deixados = v && typeof v === "object" ? nomesDe(v.deixados) : [];
  if (!deixados.length) return LINHAS_DO_ESCAPE.sozinho();
  const quem = bandoEmPalavras(deixados);
  return deixados.length > 1 ? LINHAS_DO_ESCAPE.varios(quem) : LINHAS_DO_ESCAPE.um(quem);
}

/* ============================================================
   O PREÇO DA FRASE — o veredito antes do clique, levado à frase escrita.

   R21 jogou: o botão Fugir mostra o preço no primeiro toque; a frase
   "recuo depressa e fujo" chegava ao mesmo desfecho às cegas. Esta é a
   conta ÚNICA que a linha do turno lê enquanto o jogador escreve, e é a
   mesma que o App faz ao enviar (fugirDaLuta): o mesmo vereditoDaFuga,
   com a mesma frase, logo o mesmo modo — "de guarda erguida" recua sem
   dar as costas; "fujo" sozinho escolhe o melhor, como o botão.

   Frase que não é fuga devolve "". Nunca estoura: é lida a cada tecla.
   ============================================================ */
export function precoDaFrase(args) {
  const a = args && typeof args === "object" ? args : {};
  if (!ehFuga(a.frase)) return "";
  return linhaDaFuga(vereditoDaFuga(a));
}

/* ============================================================
   O FÔLEGO DA FUGA — a promessa "ninguém te alcança" vale até o herói
   sair dali.

   O DEFEITO, jogado no R21: a heroína fugiu da Aranha do Fosso no Fosso
   das Aranhas, e NA MESMA RESPOSTA o jogo abriu "Encontro mortal —
   aranha do fosso, são 3. Estavam aqui." Não foi o Narrador a mentir: a
   fuga zera o combate e manda o turno, e dentro desse turno a caçada da
   missão (etapa "derrotar" com lugar) viu o herói no lugar certo e sem
   luta — e abriu outra, pior. O outro portão que abre luta a partir da
   resposta é o perigo do Narrador (a emboscada), e a prosa de uma fuga
   fala de pernas atrás de você: menção não é presença.

   A REGRA, em três tempos:
     1. na resposta da própria fuga, o sistema não abre luta nenhuma —
        nem caçada, nem virada, nem emboscada. É o fôlego;
     2. depois, enquanto o herói continua no lugar de onde fugiu, o covil
        não se reabre sozinho (a caçada fica segura) e quem ficou para trás
        não aparece à frente (a emboscada da MESMA criatura fica segura).
        Uma emboscada de outra coisa passa, e a virada também: o mundo não
        parou;
     3. saiu do lugar, o fôlego acaba e nada fica seguro — voltar ao covil
        é escolha, e a caçada volta a valer.

   O LUGAR é o mais interno onde a fuga aconteceu (o primeiro nome de
   "lugares", na ordem do ondeEstou do App: o ponto antes da cidade).
   Fugir na Praça de Escambo não protege o Mercado da mesma cidade. A
   comparação é a tolerante do mesmoLugar do App: sem acento, sem artigo
   inicial, igualdade ou um nome contendo o outro.

   NÃO É SAVE. Vive na memória da sessão: reabrir o jogo no covil devolve
   a caçada. É aceitável — a fuga salva o herói desta cena, não o covil
   para sempre —, e é por isso que isto não toca o formato do save.
   ============================================================ */

/* o normalizador de lugar e de criatura: o do mesmoLugar do App */
const NL = (x) => N(x).replace(/^(a|o|as|os)\s+/, "").trim();
const casaTolerante = (a, b) => {
  const x = NL(a), y = NL(b);
  return !!x && !!y && (x === y || x.includes(y) || y.includes(x));
};
const listaDeNomes = (x) => (Array.isArray(x) ? nomesDe(x) : nomesDe([x]));

/* a criatura da emboscada casa quem ficou para trás: o mesmo casamento
   tolerante, depois de tirar o número de série do bando */
const mesmaCriatura = (a, b) => casaTolerante(baseDoNome(a), baseDoNome(b));

export function folegoDaFuga(v, lugares) {
  if (!v || typeof v !== "object" || !v.escapa) return null;
  return { lugares: listaDeNomes(lugares), deixados: nomesDe(v.deixados), naResposta: true };
}

const aindaLa = (folego, lugares) => {
  const onde = Array.isArray(folego.lugares) ? nomesDe(folego.lugares) : [];
  if (!onde.length) return false;
  return listaDeNomes(lugares).some((l) => casaTolerante(l, onde[0]));
};

export function folegoSegura(folego, args) {
  if (!folego || typeof folego !== "object") return false;
  if (folego.naResposta === true) return true;
  const a = args && typeof args === "object" ? args : {};
  if (!aindaLa(folego, a.lugares)) return false;
  if (a.origem === "cacada") return true;
  if (a.origem === "emboscada") {
    const c = String(a.criatura == null ? "" : a.criatura).trim();
    return !!c && nomesDe(folego.deixados).some((d) => mesmaCriatura(c, d));
  }
  return false;
}

export function folegoDepoisDoTurno(folego, lugares) {
  if (!folego || typeof folego !== "object") return null;
  if (!aindaLa(folego, lugares)) return null;
  return { lugares: nomesDe(folego.lugares), deixados: nomesDe(folego.deixados), naResposta: false };
}

/* ============================================================
   O CUSTO ROLADO — com semente.

   O que a fuga custa (os golpes de quem estava colado, os disparos de
   quem ataca de longe) rola aqui, pelas MESMAS funções do combate —
   `oportunidadesContraOJogador` para o golpe, `ataqueDeOportunidade` com
   a desvantagem da distância para o disparo —, só que com a sorte vinda
   de `rng(hashSemente(...))`. A semente é composta pelo chamador (o App
   manda mundo, dia e rodada); a mesma semente dá o mesmo desfecho, em
   qualquer máquina. O sal separa esta sorte da da consequência, para que
   uma não dependa de quantos dados a outra gastou.

   `heroi` aqui é a FICHA (a que `golpesAoSair` já passa ao combate), não
   a peça da grade. Sem ficha, nada se rola. Sem semente, é o Math.random
   do combate de sempre.

   Devolve [{ nome, tipo: "golpe" | "disparo", r }], na ordem da linha:
   golpes primeiro, depois disparos. O `r` é o de `resolverAtaque`, e é o
   App que o aplica (o abrigo, o PV, a nota ao Narrador), como já faz.
   ============================================================ */
const SAL_DO_CUSTO = "fuga|custo|";
const SAL_DA_CONSEQUENCIA = "fuga|consequencia|";

/* casa cada nome do veredito com UM inimigo vivo, sem repetir o mesmo
   corpo quando o bando tem nomes iguais */
function casarPorNome(nomes, inimigos) {
  const usados = new Set();
  return nomes.map((n) => {
    const e = inimigos.find((x) => !usados.has(x) && x.nome === n && dePe(x));
    if (e) usados.add(e);
    return e || null;
  });
}

export function rolarOCustoDaFuga(v, args) {
  if (!v || typeof v !== "object" || !v.escapa) return [];
  const a = args && typeof args === "object" ? args : {};
  const heroi = a.heroi && typeof a.heroi === "object" ? a.heroi : null;
  if (!heroi) return [];
  const gd = Number(a.gdJogador) || 0;
  const rolar = a.semente == null ? undefined : rng(hashSemente(SAL_DO_CUSTO + String(a.semente)));
  const custos = custosDe(v);
  const quem = casarPorNome(custos.map((c) => c.nome), lista(a.inimigos));
  const saida = [];
  custos.forEach((c, i) => {
    const e = quem[i];
    if (!e) return;
    if (c.tipo === "golpe") {
      const op = oportunidadesContraOJogador([e], heroi, gd, { rolar })[0];
      if (op) saida.push({ nome: e.nome, tipo: "golpe", r: op.r });
      return;
    }
    const r = ataqueDeOportunidade(e, heroi, bonusContraOJogador(e, gd), danoDe(e, true, rolar), {
      ehAtacanteInimigo: true, tipoDano: perfilDe(e).ataque, desvantagem: c.desvantagem === true, rolar,
    });
    saida.push({ nome: e.nome, tipo: "disparo", r });
  });
  return saida;
}

/* ============================================================
   A CONSEQUÊNCIA QUE NÃO É DANO — "ele pode se fortalecer e ir atrás
   do personagem".

   Toda fuga que escapa deixa UMA marca no mundo, sorteada pela semente
   (logo, sabida antes do clique) e pesada pela cabeça do MAIS ESPERTO de
   quem ficou (`degrauDaCriatura`, o único sítio desta casa que computa
   um degrau). A marca é um relógio — o que o save já guarda —, com o
   bando e o lugar dentro do campo `fuga` (relogios.js).

   perseguicao  reagrupam, fortalecem-se e VÊM ATRÁS. Caçada que anda por
                noite, e quanto mais esperto o bando, mais curto o relógio:
                quem planeja não demora. Ao encher, a luta abre com o bando
                reforçado (`REFORCO_DA_PERSEGUICAO`). Bicho não tem plano
                de vingança: peso zero para animal.
   territorio   o lugar fica deles. Ameaça sem pressa: enquanto o relógio
                existe, VOLTAR lá reabre a luta com eles alertas; ao encher,
                sossegam e o relógio sai SEM luta. É a consequência do
                bicho, que defende o sítio e não persegue ninguém — e é a
                que menos cabe a quem pensa, que tem mais o que fazer.
   rasto        sabem para onde ele foi. Caçada que anda por VIAGEM, não por
                noite: ficar parado não a aproxima, andar sim. Ao encher,
                alcançam-no na estrada, como estavam.

   RECUSADAS, e por quê:
     · largar moedas ou um item na corrida — mexeria no inventário, que é
       a ficha que o save reescreve, e somaria um segundo preço material
       ao golpe que a fuga já rola. A pessoa pediu uma consequência que
       NÃO seja dano; perder ouro é dano com outro nome.
     · a fama — não é uma entrada porque é SEMPRE: o App já conta a fuga,
       o antagonista já a lê, o cobrador já a cobra. Aqui ela é só o piso,
       quando não cabe mais relógio nenhum (`MAX_RELOGIOS`).
   ============================================================ */
const plural = (pl, um, varios) => (pl ? varios : um);
export const CONSEQUENCIAS_DA_FUGA = {
  perseguicao: {
    tipo: "cacada", gatilho: "noite", aoEncher: "luta", aoVoltar: "", reforcado: true,
    pesos: { animal: 0, bruto: 2, astuto: 4, treinado: 5, brilhante: 5 },
    segmentos: { animal: 8, bruto: 8, astuto: 6, treinado: 4, brilhante: 4 },
    nome: (b, pl) => `${b} ${plural(pl, "vem", "vêm")} atrás de você`,
    consequencia: (b, pl) => `${b} ${plural(pl, "alcança", "alcançam")} você — ${plural(pl, "descansado e reforçado", "descansados e reforçados")}, e sem pressa de ir embora.`,
    linha: (b, pl) => `${b} ${plural(pl, "vai voltar, e mais forte", "vão voltar, e mais fortes")}.`,
    aviso: (pl) => plural(pl, "Vai voltar mais forte.", "Vão voltar mais fortes."),
    nota: (b, pl) => `${b} não ${plural(pl, "desiste", "desistem")}: ${plural(pl, "vai", "vão")} reagrupar e vir atrás do herói mais tarde, mais ${plural(pl, "forte", "fortes")}. Deixe sinais disso (rastros, boatos, um vulto ao longe), sem dizer quando.`,
  },
  territorio: {
    tipo: "ameaca", gatilho: "noite", aoEncher: "sossega", aoVoltar: "luta", reforcado: false,
    pesos: { animal: 5, bruto: 3, astuto: 1, treinado: 1, brilhante: 0 },
    segmentos: { animal: 4, bruto: 4, astuto: 4, treinado: 4, brilhante: 4 },
    nome: (b, pl, lugar) => `${b} ${plural(pl, "guarda", "guardam")} ${lugar || "o lugar da fuga"}`,
    consequencia: (b, pl, lugar) => `${b} ${plural(pl, "sossega", "sossegam")}: ${lugar || "o lugar"} volta a ser passagem.`,
    linha: (b, pl) => `${b} não ${plural(pl, "esquece", "esquecem")} este lugar.`,
    aviso: (pl) => plural(pl, "Não vai esquecer este lugar.", "Não vão esquecer este lugar."),
    nota: (b, pl, lugar) => `${b} ${plural(pl, "fica", "ficam")} de guarda em ${lugar || "onde a fuga aconteceu"}: voltar lá é ${plural(pl, "encontrá-lo alerta", "encontrá-los alertas")}. Longe dali, não ${plural(pl, "aparece", "aparecem")}.`,
  },
  rasto: {
    tipo: "cacada", gatilho: "viagem", aoEncher: "luta", aoVoltar: "", reforcado: false,
    pesos: { animal: 1, bruto: 1, astuto: 3, treinado: 3, brilhante: 3 },
    segmentos: { animal: 6, bruto: 6, astuto: 6, treinado: 6, brilhante: 6 },
    nome: (b, pl) => `${b} ${plural(pl, "segue", "seguem")} o seu rasto`,
    consequencia: (b, pl) => `${b} te ${plural(pl, "alcança", "alcançam")} na estrada.`,
    linha: (b, pl) => `${b} ${plural(pl, "segue", "seguem")} o seu rasto.`,
    aviso: (pl) => plural(pl, "Vai seguir o seu rasto.", "Vão seguir o seu rasto."),
    nota: (b, pl) => `${b} ${plural(pl, "sabe", "sabem")} para onde o herói foi e ${plural(pl, "vai", "vão")} segui-lo pela estrada. Deixe sinais (pegadas, alguém que perguntou por ele), sem dizer quando.`,
  },
};

/* O PISO: quando não cabe mais relógio, a fuga não fica sem marca — fica
   com a fama, que é sempre. A linha diz o que o jogador vive (contam que
   ele correu), e a nota diz ao Narrador que é só isso. */
export const FAMA_DA_FUGA = {
  linha: () => "A notícia de que você correu vai longe.",
  aviso: () => "Vão contar que você correu.",
  nota: (b) => `Quem viu conta: o herói correu${b ? ` de ${b}` : " da luta"}. Deixe isso na boca do mundo — sem vingança marcada, mas sem esquecimento.`,
};

const CABECALHO_DA_CONSEQUENCIA = "[FUGA — CONSEQUÊNCIA DO SISTEMA]";

/* ============================================================
   O REFORÇO — o bando que volta depois de se fortalecer.

   maisUmAPartirDe       de bruto para cima, trazem mais um do tipo mais
                         numeroso do bando (quem sabe contar sabe que
                         perdeu por pouco). Com um só, mais um dele.
   sobeAmeacaAPartirDe   de treinado para cima, cada um volta um degrau de
                         ameaça acima: treinaram, armaram-se.
   escada                a ordem em que a ameaça sobe. Pára em elite: o
                         lendário não sobe, e ninguém VIRA lendário por ter
                         visto o herói correr.
   A vida cheia não é número daqui: o bando volta como lista nova de
   nomes e ameaças, e quem abre a luta dá-lhe a vida inteira.
   ============================================================ */
export const REFORCO_DA_PERSEGUICAO = {
  maisUmAPartirDe: "bruto",
  sobeAmeacaAPartirDe: "treinado",
  escada: ["fraco", "comum", "competente", "elite"],
};

const AMEACA_DO_BANDO = "comum";
const slugDe = (x) => N(x).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const TETO_DA_FONTE = 40;

/* o texto da consequência cabe na mesma linha do veredito: o bando é que
   se apara, nunca o verbo */
const caber = (monta, b) => monta(aparado(b, TETO_DA_LINHA.chars - monta("").length));

export function consequenciaDaFuga(v, args) {
  if (!v || typeof v !== "object" || !v.escapa) return null;
  const a = args && typeof args === "object" ? args : {};
  const nomes = nomesDe(v.deixados);
  const ficaram = casarPorNome(nomes, lista(a.inimigos)).map((e, i) => e || { nome: nomes[i] });
  const lugar = listaDeNomes(a.lugares)[0] || "";
  const dia = Number.isFinite(Number(a.dia)) ? Number(a.dia) : 0;
  const semente = a.semente == null ? "" : String(a.semente);
  const b = bandoEmPalavras(ficaram.map((e) => e.nome));
  const pl = ficaram.length > 1;
  const F = FAMA_DA_FUGA;
  const fama = (extra) => ({
    id: "fama", relogio: null, reforca: null, linha: F.linha(), aviso: F.aviso(),
    nota: `${CABECALHO_DA_CONSEQUENCIA} ${F.nota(b)}${extra || ""}`,
  });
  if (!ficaram.length) return fama();

  /* A CABEÇA DO BANDO é a do mais esperto; empate, o primeiro */
  const degraus = ficaram.map((e) => degrauDaCriatura(e));
  const degrau = degraus.reduce((m, d) => (ordemDoDegrau(d) > ordemDoDegrau(m) ? d : m), DEGRAU_DO_CHAO);
  const lider = ficaram[degraus.indexOf(degrau)] || ficaram[0];

  /* A MESMA COISA DUAS VEZES NÃO VIRA DOIS RELÓGIOS. A fonte é o bando
     (pelo seu líder) e o lugar: fugir de novo dos mesmos, no mesmo sítio,
     é a marca que já existe — e a caçada que já corria fica mais perto. */
  const fonte = `fuga:${(slugDe(baseDoNome(lider.nome)) || "bando") + (lugar ? "@" + slugDe(lugar) : "")}`.slice(0, TETO_DA_FONTE);
  const atuais = garantirRelogios(a.relogios);
  const ja = atuais.find((r) => r.fonte === fonte);
  if (ja && ja.fuga && CONSEQUENCIAS_DA_FUGA[ja.fuga.efeito]) {
    const C = CONSEQUENCIAS_DA_FUGA[ja.fuga.efeito];
    return {
      id: ja.fuga.efeito, relogio: null, reforca: C.aoEncher === "luta" ? ja.id : null,
      linha: caber((x) => C.linha(x, pl, lugar), b), aviso: C.aviso(pl),
      nota: `${CABECALHO_DA_CONSEQUENCIA} De novo: ${C.nota(b, pl, lugar)}`,
    };
  }
  if (atuais.length >= MAX_RELOGIOS) return fama(" (O mundo já tem ameaças demais em curso: esta fica na fama.)");

  /* O SORTEIO, pela semente e pelos pesos do degrau, na ordem da tabela */
  const rand = rng(hashSemente(SAL_DA_CONSEQUENCIA + semente));
  const ids = Object.keys(CONSEQUENCIAS_DA_FUGA);
  const pesoDe = (id) => Math.max(0, Number(CONSEQUENCIAS_DA_FUGA[id].pesos[degrau]) || 0);
  const total = ids.reduce((s, id) => s + pesoDe(id), 0);
  if (total <= 0) return fama();
  let x = rand() * total;
  let efeito = ids.filter((id) => pesoDe(id) > 0).pop();
  for (const id of ids) {
    if (x < pesoDe(id)) { efeito = id; break; }
    x -= pesoDe(id);
  }
  const C = CONSEQUENCIAS_DA_FUGA[efeito];
  const bando = ficaram.map((e) => ({ nome: baseDoNome(e.nome), ameaca: String(e.ameaca || AMEACA_DO_BANDO) }));
  const relogio = criarRelogio({
    id: `rel_fuga_${hashSemente(`${fonte}|${dia}|${semente}`).toString(36)}`,
    nome: C.nome(b, pl, lugar), tipo: C.tipo, segmentos: C.segmentos[degrau], gatilho: C.gatilho,
    consequencia: C.consequencia(b, pl, lugar), fonte, dia,
    fuga: { efeito, bando, lugar, degrau },
  });
  return {
    id: efeito, relogio, reforca: null,
    linha: caber((x2) => C.linha(x2, pl, lugar), b), aviso: C.aviso(pl),
    nota: `${CABECALHO_DA_CONSEQUENCIA} ${C.nota(b, pl, lugar)}`,
  };
}

/* ============================================================
   O BANDO QUE VOLTA — pronto para abrir a luta.

   Lê o campo `fuga` do relógio: o bando como ficou, reforçado se o
   efeito é de reforço (`REFORCO_DA_PERSEGUICAO`). Serve às duas portas
   que abrem luta a partir de uma fuga: o relógio que encheu
   (`lutaAoEncher`) e a volta ao território (`relogioDoTerritorio`).
   Relógio sem o campo (um comum, ou um save antigo) devolve [].
   ============================================================ */
function subirAmeaca(ameaca) {
  const E = REFORCO_DA_PERSEGUICAO.escada;
  const i = E.indexOf(ameaca);
  return i < 0 ? ameaca : E[Math.min(E.length - 1, i + 1)];
}

function maisNumeroso(bando) {
  const conta = new Map();
  for (const x of bando) conta.set(x.nome, (conta.get(x.nome) || 0) + 1);
  let melhor = bando[0];
  for (const x of bando) if (conta.get(x.nome) > conta.get(melhor.nome)) melhor = x;
  return melhor;
}

export function bandoAoVoltar(relogio) {
  const f = relogio && typeof relogio === "object" && relogio.fuga && typeof relogio.fuga === "object" ? relogio.fuga : null;
  if (!f) return [];
  const bando = lista(f.bando)
    .filter((x) => x.nome != null && String(x.nome).trim())
    .map((x) => ({ nome: String(x.nome).trim(), ameaca: String(x.ameaca || AMEACA_DO_BANDO) }));
  if (!bando.length) return [];
  const C = CONSEQUENCIAS_DA_FUGA[f.efeito];
  if (!C || !C.reforcado) return bando;
  const R = REFORCO_DA_PERSEGUICAO;
  const ordem = ordemDoDegrau(f.degrau);
  let volta = bando;
  if (ordem >= ordemDoDegrau(R.sobeAmeacaAPartirDe)) volta = volta.map((x) => ({ ...x, ameaca: subirAmeaca(x.ameaca) }));
  if (ordem >= ordemDoDegrau(R.maisUmAPartirDe)) volta = [...volta, { ...maisNumeroso(volta) }];
  return volta;
}

/* O relógio da fuga que ENCHEU abre luta? Perseguição e rasto, sim —
   com o bando de `bandoAoVoltar`. Território não: sossega, e sai calado. */
export function lutaAoEncher(relogio) {
  const f = relogio && typeof relogio === "object" ? relogio.fuga : null;
  const C = f && typeof f === "object" ? CONSEQUENCIAS_DA_FUGA[f.efeito] : null;
  return C && C.aoEncher === "luta" ? bandoAoVoltar(relogio) : [];
}

/* A VOLTA AO TERRITÓRIO: entre os relógios, o de uma fuga cujo efeito
   reabre a luta ao voltar, e cujo lugar é um dos lugares onde o herói
   está agora (a comparação tolerante do fôlego, a do mesmoLugar do App).
   Quem chama é quem sabe que o herói CHEGOU — o fôlego da fuga já cobre
   o turno em que ele ainda não saiu de lá. */
export function relogioDoTerritorio(relogios, lugares) {
  const onde = listaDeNomes(lugares);
  if (!onde.length) return null;
  return garantirRelogios(relogios).find((r) => {
    const C = r.fuga ? CONSEQUENCIAS_DA_FUGA[r.fuga.efeito] : null;
    return !!C && C.aoVoltar === "luta" && !!r.fuga.lugar && onde.some((l) => casaTolerante(l, r.fuga.lugar));
  }) || null;
}
