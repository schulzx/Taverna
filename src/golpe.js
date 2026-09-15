/* ============================================================
   O VEREDITO DO GOLPE (Fase X, etapa X2) — ver antes de gastar o turno

   POR QUE ISTO EXISTE, e por que não é um bug que se conserta mudando
   um número. O botão "Atacar" da mesa de combate não ataca: ele escreve
   "Ataco " na caixa de texto. Consertar só o botão não resolveria nada,
   e a medição de X1 diz por quê:

   `posicionar` (grid.js) abre toda luta com o herói em y = altura-1 e o
   inimigo em y = 0. Isso são 12,0 m na taverna e 25,5 m na masmorra —
   medido nas DEZ plantas, a faixa inteira é 12,0 a 25,5 m. O corpo a
   corpo alcança 1,5 m. Logo **10 de 10 plantas recusam o ataque no
   turno 1**, e a recusa é de graça (deliberado desde a v9.20: cobrar o
   turno por uma regra que o jogador não podia ver seria punir a
   curiosidade). O efeito colateral é que `resolverRevide` nunca roda e
   a rodada nunca vira: o jogador clica, lê "ninguém está ao alcance" e
   o mundo não anda.

   E "TER ALCANCE" NÃO É "PODER ACERTAR". Com arma de longe (36 m), três
   das dez plantas — taverna, caverna e navio — CONTINUAM recusando, e
   não por distância: há parede no caminho. Quem decide é `alcanca`, que
   olha a linha de visão. São duas recusas diferentes e o jogador precisa
   saber qual delas o mordeu, porque a primeira se resolve andando e a
   segunda se resolve contornando.

   ------------------------------------------------------------
   O QUE ESTE ARQUIVO FAZ: dá ao "veredito antes do clique" um lugar
   provável em Node. A conta que decide tudo isso morava solta dentro de
   `resolverAtaqueJogador`, no meio do App.jsx, com os números 36 e
   "+ um quadrado" cravados na linha — constante de regra no meio do
   código, que é exatamente o que a primeira lei desta casa proíbe.
   Aqui eles viram `ALCANCES`, uma tabela que a suíte lê de volta.

   O QUE ELE NÃO FAZ: geometria. Nada aqui reimplementa distância,
   linha de visão ou penalidade por faixa — tudo isso é `grid.js`, e
   este módulo só COMPÕE o que ele já exporta. Também não há string de
   interface, cor ou JSX: `porque` é texto de veredito (dado), e quem
   decide como mostrá-lo é a tela.

   E ele não rebalanceia nada. Os valores de `ALCANCES` são exatamente
   os de hoje; mover número para tabela SEM mudar o número é o objetivo
   desta etapa.
   ============================================================ */

import {
  alcanca,
  distanciaM,
  alcanceNatural,
  nomeDoLugar,
  METROS_POR_QUADRADO,
  TAMANHOS,
} from "./grid.js";

/* ============================================================
   A TABELA DOS ALCANCES

   Um comentário por número, dizendo de onde ele veio — senão a próxima
   pessoa a mexer aqui não tem como saber se 36 é regra ou chute.

   O QUE NÃO ENTRA NESTA TABELA: a penalidade por faixa de distância
   (`PENALIDADE_POR_FAIXA` e `METROS_POR_FAIXA`, em grid.js). Ela já é
   tabela, já é aplicada por `alcanca`, e copiá-la para cá criaria a
   mesma regra escrita em dois lugares — que é como esta base já sabe
   que nasce bug.
   ============================================================ */
export const ALCANCES = {
  /* 36 m. Estava cravado como o literal `36` dentro de
     `resolverAtaqueJogador` (App.jsx), desde a v9.34: é o teto de arma
     de longe, o que um arco alcança antes de a penalidade por faixa
     tornar o tiro ruim demais para valer a pena. São quatro faixas de
     9 m, ou seja, 8 de penalidade no limite — e é esse custo crescente,
     não uma parede invisível, que faz o atirador se mover. */
  armaDeLonge: 36,

  /* +1,5 m, um quadrado. A propriedade "alcance" do catálogo de itens
     (lança, tridente, alabarda, pique, chicote) existe desde a v9.11 e
     só passou a valer com o grid em metros, na v9.44. Estava cravado
     como `+ METROS_POR_QUADRADO` na mesma linha do 36. É o quadrado que
     separa quem espeta de quem tem de encostar. */
  bonusDaPropriedadeAlcance: METROS_POR_QUADRADO,

  /* 1,5 m. O corpo a corpo NÃO é um número desta tabela: ele sai do
     tamanho da criatura, por `alcanceNatural` (o ogro alcança 3 m e o
     goblin 1,5 m, e é isso que dá sentido a "recuar um passo"). Este
     valor é só o piso de quem não tem nome nem tamanho — a mesma linha
     `medio` de grid.js, lida de lá para não virar uma segunda verdade. */
  corpoACorpoPadrao: TAMANHOS.medio.alcance,
};

/* ============================================================
   O ALCANCE DO GOLPE

   É a linha do `alcanceArma` de App.jsx:11608-11610, palavra por
   palavra, agora provável:

     armaLonge ? 36 : alcanceNatural({nome, tamanho}) + (temAlcance ? 1,5 : 0)

   Repare que a arma de longe IGNORA o tamanho de quem atira, e é assim
   hoje: o arco do ogro e o arco do halfling alcançam os mesmos 36 m,
   porque quem alcança é a flecha.
   ============================================================ */
export function alcanceDoGolpe({ armaLonge = false, temPropAlcance = false, nome = "", tamanho = null } = {}) {
  if (armaLonge) return ALCANCES.armaDeLonge;
  const natural = alcanceNatural({ nome, tamanho }) || ALCANCES.corpoACorpoPadrao;
  return natural + (temPropAlcance ? ALCANCES.bonusDaPropriedadeAlcance : 0);
}

/* ============================================================
   O VEREDITO

   Devolve, para CADA inimigo vivo, o que o jogador precisaria saber
   antes de clicar: onde ele está, a que distância, se dá para acertar,
   quanto custa em penalidade, e — quando não dá — QUAL das duas recusas
   foi. `razao` é a chave de máquina ("longe" ou "parede"); `porque` é a
   frase que `alcanca` já escreve em voz de mundo, reaproveitada em vez
   de reescrita.

   Zero aleatoriedade: o veredito é geometria, e tem de dar o mesmo
   resultado sempre, em qualquer máquina.

   `= {}` NO DESTRUCTURING NÃO COBRE `null`, então `grade`, `meuLugar` e
   `inimigos` são tratados um a um. Sem luta, devolve um veredito
   honesto em vez de estourar — este módulo nunca pode custar o turno.

   E nada é mutado: os inimigos entram e saem intactos, e o que volta é
   estrutura nova.
   ============================================================ */

/* Vivo é o que o App já considera vivo em `resolverAtaqueJogador`:
   `!e.derrotado && e.vida > 0`. Aqui `vida` ausente conta como vivo,
   porque um alvo sem ficha de vida (um manequim de arena, um inimigo
   recém-montado) não deve sumir do veredito em silêncio. */
const estaVivo = (e) => !!e && !e.derrotado && (e.vida == null || Number(e.vida) > 0);

const umaCasa = (n) => Math.round((Number(n) || 0) * 10) / 10;

export function vereditoDoGolpe(args) {
  const a = args || {};
  const grade = a.grade == null ? null : a.grade;
  const meuLugar = a.meuLugar == null ? null : a.meuLugar;
  const lista = Array.isArray(a.inimigos) ? a.inimigos : [];
  const vivos = lista.map((e, i) => ({ e, i })).filter(({ e }) => estaVivo(e));

  /* o alcance é argumento porque quem sabe da arma é o App; sem ele,
     o veredito vale para o soco de quem está no tabuleiro */
  const alcanceM = Number(a.alcanceM);
  const teto = Number.isFinite(alcanceM)
    ? alcanceM
    : alcanceDoGolpe({ nome: (meuLugar && meuLugar.nome) || "", tamanho: meuLugar && meuLugar.tamanho });

  const vazio = {
    semLuta: true, semTerreno: !grade, alcanceM: teto,
    alvos: [], aoAlcance: [], algumAoAlcance: false, maisProximo: null, faltaM: 0,
    porque: "não há luta: ninguém de pé para atacar daqui",
  };
  if (!meuLugar || !vivos.length) return vazio;

  const alvos = vivos.map(({ e, i }) => {
    const r = alcanca(grade, meuLugar, e, { alcanceM: teto }) || {};
    /* sem grade, `alcanca` responde "alcança, sem penalidade" e nem
       chega a medir — é a REGRA DE OURO de grid.js, e o veredito a
       repete em vez de inventar uma distância que não existe */
    const d = grade ? distanciaM(meuLugar, e) : 0;
    const ok = !!r.ok;
    /* qual das duas recusas: se a distância passou do teto, é longe;
       se não passou e mesmo assim recusou, só resta a parede. Isto
       CLASSIFICA o que `alcanca` decidiu — não decide de novo. */
    const razao = ok ? null : (d > teto ? "longe" : "parede");
    return {
      indice: i,
      nome: e.nome || "",
      lugar: grade ? nomeDoLugar(grade, e.x, e.y) : "",
      distanciaM: umaCasa(d),
      /* o número que a recusa de hoje imprime na tela: metro inteiro */
      metrosRedondos: Math.round(d),
      ok,
      penalidade: Number(r.penalidade) || 0,
      razao,
      porque: ok ? "" : (r.motivo || ""),
    };
  });

  const aoAlcance = alvos.filter((x) => x.ok);
  let maisProximo = null;
  for (const x of alvos) if (!maisProximo || x.distanciaM < maisProximo.distanciaM) maisProximo = x;

  return {
    semLuta: false,
    semTerreno: !grade,
    alcanceM: teto,
    alvos,
    aoAlcance,
    algumAoAlcance: aoAlcance.length > 0,
    maisProximo,
    /* quantos metros faltam para o mais próximo — é este número que faz
       o jogador entender que ANDAR resolve. Quando a recusa é parede,
       ele é 0, e é assim que se distingue "aproxime-se" de "contorne". */
    faltaM: maisProximo ? umaCasa(Math.max(0, maisProximo.distanciaM - teto)) : 0,
    porque: "",
  };
}

/* ============================================================
   OS SEIS VERBOS DA TELA DE BATALHA

   Esta tabela DECLARA A VERDADE MEDIDA em X1, e não inventa mecânica
   para quem não tem. Três dos seis botões de hoje não chegam a motor
   nenhum: a frase que eles escrevem na caixa não casa o detector de
   ataque do App, não casa `ehDeclaracaoDeAtaque` (agressao.js) e não
   casa desafio nenhum do catálogo. Ela vai para a IA como ficção pura,
   e o que acontece depende do humor da cena.

   Escrever isso aqui, em vez de "consertar" na surdina, é de propósito:
   dar mecânica a Esquivar, Empurrar e Derrubar é decisão PESADA — muda
   o que o jogador vive — e está reservada à pessoa. O que a tabela faz
   é impedir que a próxima pessoa descubra o buraco jogando.

   `frase` é o texto que o botão de hoje injeta na caixa (App.jsx,
   ACOES_PRONTAS), aparado. `motor` é a função que resolve a ação, ou
   `null` com o motivo escrito ao lado.
   ============================================================ */
export const VERBOS_DE_COMBATE = [
  {
    id: "atacar", rotulo: "Atacar", frase: "Ataco",
    motor: "App.jsx resolverAtaqueJogador → combate.js resolverAtaque",
    porqueSemMotor: "",
  },
  {
    id: "mover", rotulo: "Mover", frase: "",
    motor: "grid.js caminhar / alcancaveisDe — pelo clique no tabuleiro, não por frase",
    porqueSemMotor: "",
  },
  {
    id: "esquivar", rotulo: "Esquivar",
    frase: "Fico em postura defensiva, esquivando e me protegendo neste turno",
    motor: null,
    porqueSemMotor: "não há ação de esquiva no motor: a frase não casa verbo de ataque nem desafio, e vira ficção. A condição `protegido` existe em condicoes.js, mas nada a concede a partir de uma declaração do jogador",
  },
  {
    id: "empurrar", rotulo: "Empurrar", frase: "Empurro com força",
    motor: null,
    porqueSemMotor: "empurrar é disputa de força, e o motor não tem disputa entre duas fichas. A regex `derrubada` de aflicoes.js lê o texto da ARMA ou da HABILIDADE, nunca a frase do jogador",
  },
  {
    id: "derrubar", rotulo: "Derrubar", frase: "Tento derrubar no chão",
    motor: null,
    porqueSemMotor: "mesma falta de empurrar: sem disputa no motor, `caido` só chega ao alvo pela aflição de uma arma ou habilidade, nunca por declaração",
  },
  {
    id: "saltar", rotulo: "Saltar", frase: "Salto sobre",
    motor: "desafios.js DESAFIOS#saltar — pelo TEXTO, via lerAcao; é o único dos três sem golpe que tem para onde ir",
    porqueSemMotor: "",
  },
];

/* ============================================================
   A FRASE CANÔNICA

   O MOLDE É O DE `fraseDaAcaoRapida` (desafios.js), e de propósito: a
   frase sai da TABELA e o jogador só completa. Lá o complemento é o
   motivo e entra depois de um travessão ("tento convencer — o guarda a
   nos deixar passar"); aqui o complemento é o OBJETO DIRETO do verbo, e
   objeto direto não leva travessão em português. "Ataco Bandido" é o
   que um jogador escreve; "Ataco — Bandido" não é frase de ninguém.

   E o teste que importa é o de lá, palavra por palavra: a frase do
   botão tem de casar o MESMO detector que a frase digitada casa hoje.
   Se não casar, o botão vira um caminho paralelo — que é exatamente o
   defeito que esta fase existe para matar.
   ============================================================ */
export function fraseDoGolpe(alvo) {
  const verbo = VERBOS_DE_COMBATE.find((v) => v.id === "atacar");
  const base = (verbo && verbo.frase) || "Ataco";
  const nome = String((alvo && (typeof alvo === "string" ? alvo : alvo.nome)) || "").trim();
  return nome ? `${base} ${nome}` : base;
}
