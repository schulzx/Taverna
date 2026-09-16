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
  metrosTxt,
  METROS_POR_QUADRADO,
  TAMANHOS,
} from "./grid.js";
import { podeDisputar, destinoDoEmpurrao } from "./disputa.js";

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
   O VEREDITO DO EMPURRÃO (Fase Y · Y1) — ver a parede antes de gastar

   A LEI É A MESMA QUE ABRE ESTE ARQUIVO: o veredito antes do clique.
   Empurrar é a única ação de combate cujo resultado pode ser anulado
   pelo CHÃO — ganhar a disputa e não ter para onde mandar o corpo é o
   caso normal num corredor de masmorra, e descobrir isso depois de
   gastar a ação seria punir o jogador por não conhecer a planta.

   E É SÓ DELEGAÇÃO, como tudo neste arquivo. O portão de tamanho é
   `podeDisputar` e a geometria é `destinoDoEmpurrao`, os dois de
   `disputa.js` — e é a MESMA função que `empurrar` chama por dentro, e
   tem de ser: se o veredito compusesse a conta por conta própria, o
   preço mostrado deixaria de ser o preço cobrado no dia em que uma das
   duas mudasse. Aqui não se rola dado, não se decide regra e não se
   reimplementa nada.

   `porque` é texto de veredito, em voz de mundo: o jogador ouve que as
   costas do inimigo batem na parede, nunca o nome do mecanismo.
   ============================================================ */
export function vereditoDoEmpurrao(args) {
  const a = args == null ? {} : args;
  const quem = a.quem == null ? null : a.quem;
  const alvo = a.alvo == null ? null : a.alvo;

  const portao = podeDisputar(quem, alvo);
  if (!portao.ok) return { pode: false, para: null, metros: 0, bloqueio: null, porque: portao.motivo };

  const d = destinoDoEmpurrao({ grade: a.grade, quem, alvo, entidades: a.entidades });
  /* pode tentar e o chão não deixa: a disputa ainda vale a pena rolar
     (derrubar usa a mesma), mas o jogador vê que ninguém vai andar */
  if (!d.ok) return { pode: true, para: null, metros: 0, bloqueio: d.bloqueio, porque: d.motivo };

  return { pode: true, para: d.para, metros: d.metros, bloqueio: null, porque: "" };
}

/* ============================================================
   OS SEIS VERBOS DA TELA DE BATALHA

   Esta tabela DECLARA A VERDADE MEDIDA em X1, e não inventa mecânica
   para quem não tem. Quando ela nasceu, TRÊS dos seis botões não
   chegavam a motor nenhum: a frase que eles escrevem na caixa não casa o
   detector de ataque do App, não casa `ehDeclaracaoDeAtaque`
   (agressao.js) e não casa desafio nenhum do catálogo. Ia para a IA como
   ficção pura, e o que acontecia dependia do humor da cena.

   Escrever isso aqui, em vez de "consertar" na surdina, foi de propósito,
   e a razão continua a valer: dar mecânica a um verbo de combate é
   decisão PESADA — muda o que o jogador vive — e é da pessoa, não de
   quem passa por aqui. O que a tabela faz é impedir que a próxima pessoa
   descubra o buraco jogando.

   HOJE FALTA UM SÓ. A pessoa aprovou (15/09) dar mecânica a Empurrar e
   Derrubar primeiro, e por um motivo concreto: têm alvo, distância e
   resultado óbvios, e o tabuleiro já modela posição, tamanho e terreno.
   Y1 escreveu o motor — `disputa.js`, um teste oposto com dois desfechos
   —, e as duas linhas abaixo deixaram de mentir. ESQUIVAR continua sem
   motor, com o motivo dele intacto: a condição `protegido` existe e nada
   a concede a partir de uma declaração do jogador, e resolver isso é
   outra decisão, noutra etapa.

   A MEMÓRIA DE POR QUE A FASE EXISTIU FICA: o buraco era de três, foi
   medido, foi escrito, e só depois foi tapado — nesta ordem, que é a
   única que impede um conserto de virar mecânica inventada.

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
    motor: "disputa.js empurrar — teste oposto de Força/Atletismo; o corpo anda uma casa por grid.js deslocarForcado. O veredito antes do clique é golpe.js vereditoDoEmpurrao",
    porqueSemMotor: "",
  },
  {
    id: "derrubar", rotulo: "Derrubar", frase: "Tento derrubar no chão",
    motor: "disputa.js derrubar — a mesma disputa de empurrar, com o outro desfecho: aplica o `caido` de condicoes.js, agora por declaração do jogador e não só pela aflição de uma arma",
    porqueSemMotor: "",
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

/* ============================================================
   AS QUATRO FRASES DO VEREDITO (W2 §3) — e por que elas mudaram de casa

   `maisPertoAoAlcance`, `recusaDoGolpe` e `linhaDoGolpe` viviam no
   `App.jsx` (:1111-1143). Vieram inteiras, e o argumento a favor da
   mudança estava escrito no próprio App, ao lado delas:

     "`golpe.js` mede e devolve números; estas três funções os VESTEM, e é
      a única coisa que fazem."

   A razão escrita para elas viverem lá era SÓ *"moram fora do corpo que
   renderiza"* — não *"vestir não pertence ao módulo"*. Vestir pertence:
   este arquivo é puro, roda em Node, já tem suíte, e já é o dono do `vd`
   que as três leem. **E UM VARREDOR NÃO CONSEGUE LER JSX; CONSEGUE LER
   ISTO** — foi por isso que a linha que mais aparece no combate mediu 64 a
   86 caracteres contra um teto de 54 durante um ciclo inteiro sem ninguém
   a apanhar.

   `maisPertoAoAlcance` veio junto por necessidade, não por arrumação: é
   lida por `linhaDoGolpe` aqui dentro e por duas fiações do App. Deixá-la
   para trás partiria a função em dois arquivos.

   E O QUE MUDOU NÃO FOI O APARO: FOI A REDACÇÃO. A pior das frases de
   ontem media 62 caracteres com o nome VAZIO — aparar o nome nunca a
   salvaria, porque ela estourava antes de o nome existir. Aparar é cortar
   um facto que a frase já decidiu dizer; redigir é a frase decidir dizer
   menos factos. Três das quatro passaram a partilhar uma gramática só —
   `{nome} a {distância} m — {veredito}.` — e o jogador aprende a forma uma
   vez e passa a ler só a cauda.
   ============================================================ */

/* O TETO É DE E2 e o que o acompanha não é decoração: a suíte precisa de
   saber com que nome e com que número medir o pior caso, ou mede o caso
   bonito. `numeroMaisLargo` é o que `metrosTxt` (grid.js:50) escreve na
   pior hipótese; `nomeMaisLongoDasTabelas` saiu de varrer o bestiário. */
export const TETO_DA_LINHA = {
  chars: 54,
  numeroMaisLargo: "10,5",          /* 4 caracteres */
  nomeMaisLongoDasTabelas: 18,      /* "Sentinela Blindada" */
};

/* O `fixo` é o custo da frase com o nome VAZIO. Ele está escrito à mão e a
   suíte reconfere-o contra a própria frase — um número que mente sobre a
   linha que está ao lado dele é pior do que número nenhum. */
export const LINHAS_DO_GOLPE = {
  semAlvo:   { fixo: 29, monta: ()        => `Ninguém de pé ao seu alcance.` },
  distancia: { fixo: 26, monta: (n, d, f) => `${n} a ${d} m — faltam ${f} m.` },
  parede:    { fixo: 29, monta: (n, d)    => `${n} a ${d} m — parede, contorne.` },
  aoAlcance: { fixo: 23, monta: (n, d)    => `${n} a ${d} m — ao alcance.` },
};

/* O APARO MORA AQUI, NUNCA NA TELA (lei de W1 §3.2 e de E2): uma frase já
   aparada é uma frase; uma frase aparada por CSS é uma frase partida.
   E ele é cinto contra o inesperado, não comportamento normal — a entrada
   mais apertada só morde acima de 25 caracteres, e o nome mais longo das
   tabelas tem 18. Quem o faz morder é um nome que o Narrador inventou. */
const aparado = (nome, sobra) => {
  const s = String(nome || "");
  return s.length <= sobra ? s : s.slice(0, Math.max(1, sobra - 1)).trimEnd() + "…";
};

/* a sobra que cada frase deixa para o nome: o teto menos o custo fixo dela.
   Sai da tabela, e é por isso que mudar uma frase não obriga a mexer aqui. */
const sobraDe = (linha) => TETO_DA_LINHA.chars - linha.fixo;

/* Quem, dos que estão ao alcance, está mais perto. É o alvo que o golpe
   acerta por omissão — e o App mostra o nome dele, para o jogador nunca
   descobrir tarde demais quem o sistema escolheu por ele. */
export const maisPertoAoAlcance = (vd) => {
  const lista = (vd && vd.aoAlcance) || [];
  let perto = null;
  for (const a of lista) if (!perto || a.distanciaM < perto.distanciaM) perto = a;
  return perto;
};

/* A razão da RECUSA, e ela separa as duas — porque andar resolve uma e não
   resolve a outra. Quem está longe demais ouve quantos metros faltam; quem
   está atrás de parede ouve que precisa contornar, e nenhum passo à frente
   vai adiantar. Dizer só "não dá" seria mandar o jogador adivinhar qual das
   duas o mordeu.

   `contorne` é a única ORDEM que sobreviveu à redacção, e a razão é a que
   já estava escrita no App: andar resolve a distância e não resolve a
   parede. Sem ela, o reflexo de quem lê um número em metros é andar a
   direito — contra a pedra. Custa 10 caracteres e a frase ainda sobra 7. */
export const recusaDoGolpe = (vd) => {
  const perto = vd && vd.maisProximo;
  if (!vd || vd.semLuta || !perto) return LINHAS_DO_GOLPE.semAlvo.monta();
  if (perto.razao === "parede") {
    const L = LINHAS_DO_GOLPE.parede;
    return L.monta(aparado(perto.nome, sobraDe(L)), metrosTxt(perto.distanciaM));
  }
  const L = LINHAS_DO_GOLPE.distancia;
  return L.monta(aparado(perto.nome, sobraDe(L)), metrosTxt(perto.distanciaM), metrosTxt(vd.faltaM));
};

/* E quando o golpe SAI, a mesma linha diz onde ele vai cair. O "dentro dos
   seus {a} m de alcance" caiu na redacção: o alcance do herói já está na
   tira acima ("seu alcance 9 m"), e repeti-lo custava 18 caracteres para
   dizer duas vezes o mesmo número. */
export const linhaDoGolpe = (vd) => {
  const perto = maisPertoAoAlcance(vd);
  if (!perto) return "";
  const L = LINHAS_DO_GOLPE.aoAlcance;
  return L.monta(aparado(perto.nome, sobraDe(L)), metrosTxt(perto.distanciaM));
};
