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
   oportunidade, que rolam como todo ataque do combate já rola, e quem os
   rola é o App, com `oportunidadesContraOJogador` sobre a lista que sai
   daqui.

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
   de movimento.js), rolar o golpe (é de combate.js), nem mexer no estado.
   Os inimigos entram e saem intactos; o que volta é estrutura nova.
   ============================================================ */

import { distanciaM, alcanceNatural } from "./grid.js";
import { deslocamentoDeCriatura, deslocamentoDe } from "./movimento.js";
import { condicaoPorId, normalizarCondicao, mecanicaDe } from "./condicoes.js";
import { estaVirado } from "./controle.js";
import { pedeDesengajar } from "./combate.js";
import { TETO_DA_LINHA } from "./golpe.js";

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
function medirModo({ heroi, inimigos, passoH, modo, rodada }) {
  const correndo = modo === "correndo";
  const corridaHeroi = redondo(passoH * (correndo ? FUGA.corrida : FUGA.desengajado));
  const golpes = correndo ? quemGolpeiaAoSair(heroi, inimigos, { rodada }).map((e) => e.nome) : [];
  const perseguidores = lista(inimigos)
    .filter((e) => dePe(e) && !doOutroLado(e, rodada))
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
   ============================================================ */
export function vereditoDaFuga(args) {
  const a = args && typeof args === "object" ? args : {};
  const heroi = a.heroi && typeof a.heroi === "object" ? a.heroi : null;
  const inimigos = lista(a.inimigos);
  const rodada = a.rodada != null ? a.rodada : 1;
  const bruto = Number(a.passoHeroiM);
  const passoH = Number.isFinite(bruto) ? Math.max(0, bruto) : deslocamentoDe(heroi).andar;
  const base = { heroi, inimigos, passoH, rodada };
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
   ============================================================ */
export const LINHAS_DA_FUGA = {
  parado:     () => "Você não consegue sair do lugar.",
  limpa:      () => "Você escapa — ninguém te alcança.",
  umGolpe:    (n) => `Você escapa, levando o golpe de ${n}.`,
  variosGolpes: (k) => `Você escapa, levando ${k} golpes ao sair.`,
  umAlcanca:  (n) => `${n} te alcança — não dá para fugir.`,
  variosAlcancam: (k) => `${k} inimigos te alcançam — não dá para fugir.`,
};

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
  const g = Array.isArray(v.golpes) ? v.golpes : [];
  if (!g.length) return L.limpa();
  return g.length > 1 ? L.variosGolpes(g.length) : comNome(L.umGolpe, g[0]);
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
  const golpes = Array.isArray(v.golpes) && v.golpes.length ? `, levando o golpe de ${v.golpes.join(", ")} ao dar as costas` : "";
  const deixados = Array.isArray(v.deixados) ? v.deixados : [];
  const atras = deixados.length
    ? ` Ficaram para trás, VIVOS e ainda no mundo: ${deixados.join(", ")}. Não os mate nem os faça alcançá-lo nesta cena.`
    : "";
  return `[FUGA — RESOLVIDA PELO SISTEMA] ${quem} saiu da luta ${como}${golpes}; a luta ACABOU.${atras} Narre a fuga e o fôlego depois dela.`;
}
