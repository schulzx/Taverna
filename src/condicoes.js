/* ============================================================
   CONDIÇÕES (v9.0) — o vocabulário único de estados — Taverna

   O problema que este módulo resolve: o Mestre narrava "você está
   envenenado" e o sistema não sabia de nada; o sistema aplicava
   "Atordoado" e o Mestre narrava o herói agindo normalmente. Duas
   verdades sobre o mesmo corpo.

   Agora existe UM catálogo. Toda condição — venha do Mestre, do
   combate, de um milagre ou da própria narração — é NORMALIZADA
   para um id daqui, e é daqui que saem os efeitos mecânicos. O
   Mestre não decide mais o que uma condição faz: ele descreve o
   que o sistema já aplicou.
   ============================================================ */

/* A ROLAGEM NÃO MORA AQUI, E É DE PROPÓSITO (T3). Quem rola salvaguarda
   nesta casa é `salvaguardas.js` — o d20, a vantagem, o crítico, o
   desastre e a proficiência de classe estão lá, num lugar só. Escrever um
   d20 novo aqui seria a mesma regra em duas cabeças, e esta casa já pagou
   por isso (foi o que `rolarAflicao` era antes da v9.60: uma salvaguarda
   sem saber que era, com nível/4 no lugar da proficiência).

   Sem ciclo: `salvaguardas.js` importa `constantes.js` e `regras.js`, e
   nenhum dos dois conhece este arquivo. */
import { rolarSalvaguarda, linhaDaSalvaguarda } from "./salvaguardas.js";

/* ---------------- OS CANAIS DE SAÍDA (v9.239 — T2) ----------------
   A LEI, tirada de D&D 5e: CURA NORMAL SÓ DEVOLVE PV. A poção, o dado
   de vida, a Palavra Curativa, o Segundo Fôlego, o santuário da
   masmorra — todos somam no PV e NENHUM escreve em `condicoes`. Quem
   tira uma condição é o RELÓGIO (`tickCondicoes`), o DESCANSO
   (`limparPorDescanso`) ou uma porta DECLARADA.

   O QUE ESTA TABELA CONSERTA. Até a v9.238 quatro condições diziam
   `saiCom: ["cura"]` — envenenado, sangrando, cego e enfeitiçado — e
   NINGUÉM lia esse canal: `limparPorDescanso` é o único leitor de
   `saiCom` e só recebe "curto" e "longo". Era promessa morta na tabela;
   pior, era promessa que CONTRADIZIA a lei, porque anunciava a quem
   lesse o catálogo que beber uma poção corta o veneno.

   O canal não foi apagado — foi RENOMEADO para o que sempre quis dizer.
   "Restauração" é a PORTA DECLARADA: a magia que se declara como tal
   (Restauração Menor e Maior, `funcao: "curar_condicao"` no grimório), o
   antídoto (`tipo: "limpa"`, com o `remove` escrito), a relíquia (com o
   `limpa` escrito). Nunca a cura que fecha ferida.

   Apagar o canal teria mudado o jogo em silêncio: `enfeiticado` só
   declarava "cura", e `saiCom` VAZIO cai na regra implícita de que o
   descanso longo limpa toda condição ruim — a noite passaria a quebrar
   encantamento, que hoje ela não quebra. Renomear guarda o
   comportamento exatamente onde está.

   `porDescanso` é o que separa os dois mundos, e é lido de verdade:
   `limparPorDescanso` RECUSA qualquer canal que não seja de descanso,
   para que uma cura futura não entre por essa porta.

   v9.241 (T4) · O CANAL GANHOU LEITOR. Ele nasceu sem um de propósito, e
   quem o lê agora é `PORTAS_DE_SAIDA`, mais abaixo: o canal é a AUTORIDADE
   DA MAGIA — diz o que uma magia de restauração pode alcançar, e nada
   mais. Não é autoridade do item: a lista `remove` da poção e a `limpa` da
   relíquia continuam sendo a palavra final delas, porque filtrá-las por
   este canal apagaria seis remoções vivas (medido em `PORTAS_DE_SAIDA`). */
export const CANAIS_DE_SAIDA = [
  { id: "curto", porDescanso: true, diz: "uma hora de parada" },
  { id: "longo", porDescanso: true, diz: "a noite inteira" },
  {
    id: "restauracao", porDescanso: false,
    diz: "a porta declarada — magia de restauração, habilidade ou antídoto; NUNCA cura normal",
  },
];

/* ---------------- O CATÁLOGO ----------------
   Campos mecânicos (o que o CÓDIGO faz com a condição):
     vantagem/desvantagem → nas rolagens de quem a carrega
     perdeAcao            → não age no turno (o combate já respeita)
     danoTurno            → dano por turno enquanto durar
       (O ESPELHO DA CURA NÃO MORA AQUI, e a v9.275/H3 mediu antes de
        escolher: ele é `curaTurno`, no EFEITO — a régua em
        `REGENERACAO_DO_BUFF` (efeitos.js), cobrada por `tickEfeitos` e
        pousada em PV por `pousarCura` (regras-jogo.js). O motivo é de
        fiação, não de gosto: os três chamadores vivos de `tickCondicoes`
        moram TODOS no App.jsx, e um campo de cura nesta tabela nasceria
        inerte até alguém lá o ligar; `tickEfeitos` já tinha um chamador
        fora do App — a arena —, e por ele a cura pousa em PV de verdade.
        O dia em que o App pagar `curaTurno` do lado da condição também, é
        este ponteiro que evita a régua nascer duas vezes.)
     danoExtra/danoReduzido → no dano causado
     defesa               → soma na CA
     turnos               → duração padrão (null = até algo tirá-la)
     saiCom               → um ou mais ids de CANAIS_DE_SAIDA
     resistir             → teste que o SISTEMA rola quando ELE aplica
     aliases              → como a ficção costuma chamar isso
*/
export const CONDICOES = {
  /* ---- ruins ---- */
  envenenado: {
    id: "envenenado", rotulo: "Envenenado", icone: "🧪", tipo: "ruim",
    turnos: 4, desvantagem: true, danoTurno: 2, saiCom: ["longo", "restauracao"],
    resistir: { attr: "vigor", dif: 12 }, subst: "veneno|peçonha",
    desc: "Desvantagem nas rolagens e 2 de dano por turno.",
    aliases: [/envenenad/, /intoxicad/, /veneno (corre|se espalha|toma|sobe|queima)/, /peçonha/],
  },
  sangrando: {
    id: "sangrando", rotulo: "Sangrando", icone: "🩸", tipo: "ruim",
    turnos: 3, danoTurno: 3, saiCom: ["curto", "longo", "restauracao"], subst: "sangramento|hemorragia|sangria",
    desc: "3 de dano por turno até estancar.",
    aliases: [/sangrand/, /sangra (muito|sem parar|de|pelo|pela)/, /hemorragia/, /sangue (jorra|escorre|não para|encharca)/, /ferida aberta/],
  },
  queimando: {
    id: "queimando", rotulo: "Queimando", icone: "🔥", tipo: "ruim",
    turnos: 2, danoTurno: 4, saiCom: ["curto", "longo"], subst: "fogo|chamas|queimadura",
    resistir: { attr: "agilidade", dif: 12 },
    desc: "4 de dano por turno enquanto o fogo pega.",
    aliases: [/em chamas/, /queimand/, /pegando fogo/, /fogo (lambe|consome|se alastra)/],
  },
  atordoado: {
    id: "atordoado", rotulo: "Atordoado", icone: "💫", tipo: "ruim",
    turnos: 1, perdeAcao: true, subst: "atordoamento|tontura",
    resistir: { attr: "vigor", dif: 13 },
    desc: "Perde a ação: não ataca nem age neste turno.",
    aliases: [/atordoad/, /zonz/, /sem conseguir reagir/, /a cabeça (gira|roda)/, /desnortead/],
  },
  paralisado: {
    id: "paralisado", rotulo: "Paralisado", icone: "🥶", tipo: "ruim",
    turnos: 2, perdeAcao: true, subst: "paralisia", saiCom: ["longo", "restauracao"],
    resistir: { attr: "vigor", dif: 14 },
    desc: "Corpo travado: perde a ação enquanto durar.",
    aliases: [/paralisad/, /imobilizad/, /congelad/, /petrificad/, /não consegue (se mover|mexer)/],
  },
  caido: {
    id: "caido", rotulo: "Caído", icone: "🤕", tipo: "ruim",
    turnos: 1, desvantagem: true,
    desc: "No chão: desvantagem até levantar.",
    aliases: [/derrubad/, /cai de costas/, /vai ao chão/, /caíd[oa] no chão/],
  },
  agarrado: {
    id: "agarrado", rotulo: "Agarrado", icone: "🕸", tipo: "ruim",
    turnos: 2, desvantagem: true,
    resistir: { attr: "forca", dif: 12 },
    desc: "Preso: desvantagem e sem sair do lugar.",
    aliases: [/agarrad/, /enredad/, /preso (pel|n[ao])/, /imprensad/, /teia/],
  },
  cego: {
    id: "cego", rotulo: "Cego", icone: "🌑", tipo: "ruim",
    turnos: 2, desvantagem: true, saiCom: ["curto", "longo", "restauracao"],
    desc: "Sem enxergar: desvantagem, e quem te ataca tem vantagem.",
    aliases: [/cegad/, /sem enxergar/, /vista (some|apaga|turva)/, /escuridão total/],
  },
  amedrontado: {
    id: "amedrontado", rotulo: "Amedrontado", icone: "😨", tipo: "ruim",
    turnos: 3, desvantagem: true, subst: "medo|pavor|terror",
    resistir: { attr: "vontade", dif: 12 },
    desc: "Medo dominante: desvantagem em tudo.",
    aliases: [/amedrontad/, /apavorad/, /aterrorizad/, /pavor (toma|domina)/, /gelad[oa] de medo/],
  },
  enfeiticado: {
    id: "enfeiticado", rotulo: "Enfeitiçado", icone: "💜", tipo: "ruim",
    turnos: 3, desvantagem: true, saiCom: ["restauracao"],
    resistir: { attr: "vontade", dif: 13 },
    desc: "Vontade capturada: desvantagem e obediência ao encantador.",
    aliases: [/enfeitiçad/, /encantad[oa] pel/, /hipnotizad/, /dominad[oa] pel/],
  },
  enfraquecido: {
    id: "enfraquecido", rotulo: "Enfraquecido", icone: "💧", tipo: "ruim",
    turnos: 3, desvantagem: true, danoReduzido: 2, saiCom: ["longo", "restauracao"],
    desc: "Desvantagem e −2 no dano causado.",
    aliases: [/enfraquecid/, /sem forças/, /força (drenada|sugada)/, /debilitad/],
  },
  lento: {
    id: "lento", rotulo: "Lento", icone: "🐌", tipo: "ruim",
    turnos: 3, desvantagem: true,
    desc: "Movimentos pesados: desvantagem enquanto durar.",
    aliases: [/lentidão/, /movimentos (pesados|arrastad)/, /o tempo (arrasta|pesa)/],
  },
  exausto: {
    id: "exausto", rotulo: "Exausto", icone: "😵", tipo: "ruim",
    turnos: null, desvantagem: true, saiCom: ["longo", "restauracao"],
    desc: "Desvantagem até um descanso longo.",
    aliases: [/exaust/, /esgotad/, /não aguenta mais de cansaço/],
  },

  /* ---- boas ---- */
  abencoado: {
    id: "abencoado", rotulo: "Abençoado", icone: "✨", tipo: "bom",
    turnos: 5, vantagem: true,
    desc: "Vantagem nas rolagens.",
    aliases: [/abençoad/, /bênção (desce|toca|cobre)/, /graça divina/],
  },
  inspirado: {
    id: "inspirado", rotulo: "Inspirado", icone: "🎵", tipo: "bom",
    turnos: 3, vantagem: true,
    desc: "Vantagem nas rolagens.",
    aliases: [/inspirad/, /coragem renovada/],
  },
  fortalecido: {
    id: "fortalecido", rotulo: "Fortalecido", icone: "💪", tipo: "bom",
    turnos: 4, danoExtra: 2,
    desc: "+2 no dano causado.",
    aliases: [/fortalecid/, /força sobre-?humana/, /músculos (ardem|incham) de poder/],
  },
  enfurecido: {
    id: "enfurecido", rotulo: "Enfurecido", icone: "😤", tipo: "bom",
    turnos: 3, vantagem: true, danoExtra: 2,
    desc: "Vantagem e +2 no dano — mas é fúria, não estratégia.",
    aliases: [/enfurecid/, /fúria (toma|domina|explode)/, /sangue ferve/],
  },
  apressado: {
    id: "apressado", rotulo: "Apressado", icone: "💨", tipo: "bom",
    turnos: 3, vantagem: true,
    desc: "Velocidade sobrenatural: vantagem nas rolagens.",
    aliases: [/apressad/, /acelerad/, /rápido como/],
  },
  furtivo: {
    id: "furtivo", rotulo: "Furtivo", icone: "👤", tipo: "bom",
    turnos: 3, vantagem: true,
    desc: "Escondido: vantagem enquanto não for notado.",
    aliases: [/furtiv/, /nas sombras, sem ser vist/, /escondid[oa] de todos/],
  },
  protegido: {
    id: "protegido", rotulo: "Protegido", icone: "🛡", tipo: "bom",
    turnos: 4, defesa: 2,
    desc: "+2 de defesa.",
    aliases: [/protegid[oa] por/, /escudo (mágico|arcano|divino)/, /barreira (envolve|cobre)/],
  },
  /* v9.241 (T4) · A ÚNICA QUE NÃO TINHA SAÍDA NENHUMA, e agora tem.
     Ela não vence no relógio (`turnos: null`), não ganha salvaguarda (é
     `tipo: "bom"`, e ninguém rola para se livrar da própria bênção — teste 3
     do critério de T3) e não cai na regra implícita do descanso longo, que só
     vale para as RUINS. Era armadilha latente: no dia em que alguma porta a
     aplicasse, ela seria permanente em quem a recebesse.

     O conserto é o canal de descanso, e é o mais barato que existe: no 5e a
     concentração não sobrevive a um descanso — quem para para respirar larga
     o que estava segurando. Os DOIS canais, e não só o longo, porque uma hora
     de parada já é mais que o teto de uma concentração inteira.

     O EFEITO EM MESA É ZERO, MEDIDO: nada no `src/` nem no `App.jsx` aplica
     esta condição (a maquinaria de concentração vive em `efeitos.js`, sobre
     `pers.efeitos`, e nunca passou por aqui). `limparPorDescanso` antes
     devolvia a lista inteira para ela nos dois canais, e continua devolvendo
     para quem não a carrega — que é todo mundo. */
  concentrado: {
    id: "concentrado", rotulo: "Concentrado", icone: "🎯", tipo: "bom",
    turnos: null, concentracao: true, saiCom: ["curto", "longo"],
    desc: "Mantendo um efeito: levar dano pode quebrar.",
    aliases: [/concentrad[oa] (em|no|na)/],
  },
};

export const listaCondicoes = () => Object.values(CONDICOES);
export const condicaoPorId = (id) => CONDICOES[String(id || "").toLowerCase()] || null;

/* ---------------- NORMALIZAÇÃO ----------------
   "Envenenado gravemente", "envenenamento", "POISONED", "atordoada"…
   tudo vira o mesmo id. Sem isso, cada sinônimo do Mestre criava uma
   condição nova e sem efeito mecânico nenhum. */
const semAcento = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function normalizarCondicao(nome) {
  const n = semAcento(nome).trim();
  if (!n) return null;
  /* 1) id exato */
  for (const c of listaCondicoes()) if (semAcento(c.id) === n || semAcento(c.rotulo) === n) return c;
  /* 2) raiz da palavra (envenenad-o/-a/-amente, atordoad-o/-a…) */
  for (const c of listaCondicoes()) {
    const raiz = semAcento(c.rotulo).replace(/[oa]$/, "");
    if (raiz.length >= 4 && n.includes(raiz)) return c;
  }
  /* 3) apelidos da ficção */
  for (const c of listaCondicoes()) {
    for (const re of c.aliases || []) {
      const reSemAcento = new RegExp(semAcento(re.source), "i");
      if (reSemAcento.test(n)) return c;
    }
  }
  return null;
}

/* Cria a instância que vai para a ficha: mecânica do catálogo + contexto. */
export function criarCondicao(idOuNome, { turnos, origem } = {}) {
  const c = condicaoPorId(idOuNome) || normalizarCondicao(idOuNome);
  if (!c) return null;
  return {
    id: c.id,
    nome: c.rotulo,
    icone: c.icone,
    tipo: c.tipo,
    turnos: turnos != null ? Math.max(1, Math.min(20, Math.round(turnos))) : c.turnos,
    efeito: c.desc,
    origem: origem || "",
  };
}

/* ---------------- A MECÂNICA (fonte única) ----------------
   Combate, rolagens e HUD leem daqui — ninguém mais adivinha por
   substring o que "Congelado" faz. */
export function mecanicaDe(condicoes = []) {
  const m = { vantagem: false, desvantagem: false, perdeAcao: false, danoTurno: 0, danoExtra: 0, danoReduzido: 0, defesa: 0, motivos: [] };
  for (const inst of condicoes || []) {
    const c = condicaoPorId(inst.id) || normalizarCondicao(inst.nome || inst.id || "");
    if (!c) continue;
    if (c.vantagem) { m.vantagem = true; m.motivos.push(`${c.rotulo}: vantagem`); }
    if (c.desvantagem) { m.desvantagem = true; m.motivos.push(`${c.rotulo}: desvantagem`); }
    if (c.perdeAcao) { m.perdeAcao = true; m.motivos.push(`${c.rotulo}: perde a ação`); }
    if (c.danoTurno) { m.danoTurno += c.danoTurno; }
    if (c.danoExtra) { m.danoExtra += c.danoExtra; }
    if (c.danoReduzido) { m.danoReduzido += c.danoReduzido; }
    if (c.defesa) { m.defesa += c.defesa; }
  }
  return m;
}

/* Vantagem e desvantagem juntas se cancelam (5e) — o HUD mostra o líquido. */
export function estadoDeRolagem(condicoes = []) {
  const m = mecanicaDe(condicoes);
  if (m.vantagem && m.desvantagem) return { rotulo: "neutro", vantagem: false, desvantagem: false };
  if (m.vantagem) return { rotulo: "vantagem", vantagem: true, desvantagem: false };
  if (m.desvantagem) return { rotulo: "desvantagem", vantagem: false, desvantagem: true };
  return { rotulo: "neutro", vantagem: false, desvantagem: false };
}

/* ---------------- PASSAGEM DE TURNO ----------------
   Decrementa, cobra o dano-por-turno e devolve o que expirou. */
export function tickCondicoes(condicoes = []) {
  const vivas = [], expiradas = [];
  let dano = 0;
  const fontes = [];
  for (const inst of condicoes || []) {
    const c = condicaoPorId(inst.id) || normalizarCondicao(inst.nome || "");
    if (c && c.danoTurno) { dano += c.danoTurno; fontes.push(c.rotulo); }
    if (inst.turnos == null || isNaN(Number(inst.turnos))) { vivas.push({ ...inst, turnos: null }); continue; }
    const t = Number(inst.turnos) - 1;
    if (t <= 0) expiradas.push(inst);
    else vivas.push({ ...inst, turnos: t });
  }
  return { condicoes: vivas, expiradas, dano, fontes };
}

/* ============================================================
   A SEGUNDA CHANCE, NO FIM DO TURNO (v9.240 — T3)

   A lei é da pessoa, palavra dela: *"os testes de resistência para alguns
   venenos — tipo, teste de salvaguarda de Constituição exigido pelo veneno
   no final do turno."* É o 5e literal, e a palavra que carrega a fase é
   **ALGUNS**: lá a segunda chance é EXCEÇÃO DECLARADA por efeito, nunca
   cortesia geral. Uma condição que não a declara dura o prazo inteiro.

   ---- DUAS PERGUNTAS DIFERENTES, E ESTA TABELA É A SEGUNDA ----
   O catálogo já tem um campo `resistir`, e ele NÃO é isto. `resistir` é o
   teste de ENTRADA: rolado por `aflicoes.js` no instante em que o sistema
   tenta APLICAR a condição — "o veneno pega?". Esta tabela é o teste de
   SAÍDA: rolado no fim de cada turno de quem JÁ a carrega — "o corpo
   expulsa?". São duas perguntas, em dois momentos, e podem ter respostas
   opostas na mesma condição: `enfeiticado` tem entrada (dif 13) e NÃO tem
   saída; `cego` não tem entrada e TEM saída.

   E os dois campos nem falam a mesma língua. `resistir` usa `"agilidade"` e
   `"vontade"`, que não existem em `ATRIBUTOS` nem em `SALVAGUARDAS` — lá são
   `destreza` e `presenca` (há nota sobre isso em `consequencias.js:67`).
   Esta tabela usa os ids de `SALVAGUARDAS`, que é quem vai rolar. Herdar o
   nome do vizinho teria trazido o bug junto.

   ---- O CRITÉRIO (três testes, nesta ordem) ----
   Ele está em `criterio`, legível pela suíte, para a posição de uma condição
   nova ser DEDUZIDA e não escolhida por gosto:

   1. TEM PRAZO PARA ENCURTAR? `turnos >= 2`. Com `turnos: 1` a segunda
      chance chegaria no mesmo instante em que o relógio já vence a condição:
      rolar ali é teatro, nunca muda nada. (Corta `atordoado` e `caido` — e o
      5e concorda nos dois: Golpe Atordoante dura "até o fim do seu próximo
      turno" sem repetição, e levantar-se é MOVIMENTO, não salvaguarda.)
   2. É A CONDIÇÃO OU É O FERIMENTO? A salvaguarda expulsa algo que CONTINUA
      agindo sobre o corpo ou a vontade — veneno no sangue, teia que aperta,
      medo que domina. Ferida aberta e fogo pegado não são efeito sustentado:
      são estrago em curso, e a saída deles é ação, cura ou porta declarada.
      (Corta `sangrando` e `queimando`.)
   3. É RUIM? Ninguém resiste à própria bênção. No 5e isso é literal — quem
      quer pode falhar de propósito numa salvaguarda, e efeito benéfico não
      manda ninguém rolar. (Corta as oito boas, `concentrado` incluído.)

   ---- O QUE ISTO NÃO FAZ, E QUEM FEZ DEPOIS ----
   `concentrado` não ganha saída aqui: é `tipo: "bom"`, cai no teste 3, e
   ninguém rola para se livrar da própria bênção. Esta tabela nunca fingiu
   consertá-lo — quem o fez foi T4, e pela porta certa (o canal de descanso,
   no catálogo, com o efeito em mesa medido em zero). O canal `restauracao`
   também não é lido daqui: ele é a autoridade da MAGIA, e mora em
   `PORTAS_DE_SAIDA`. As duas metades continuam separadas de propósito — a
   salvaguarda é o corpo se livrando sozinho, a porta é alguém abrindo.
   ============================================================ */
export const SALVAGUARDA_DO_FIM_DO_TURNO = {
  regra: "o prazo é a saída; a segunda chance no fim do turno é exceção declarada",
  criterio: [
    "turnos >= 2 — com prazo de um turno não há o que encurtar",
    "efeito sustentado sobre corpo ou vontade, não ferimento nem fogo em curso",
    "só condição ruim — ninguém resiste à própria bênção",
  ],
  /* O motivo que cobre as OITO boas de uma vez, para não haver oito linhas
     dizendo a mesma frase — e para uma condição boa nova amanhã já nascer
     com a posição declarada sem ninguém precisar escrever nada. */
  porqueBoaNaoRola:
    "condição boa: ninguém rola para se livrar da própria bênção. No 5e a criatura pode falhar de propósito numa salvaguarda justamente porque efeito benéfico nunca a obriga a rolar.",

  /* ---- O MODIFICADOR DE QUEM NÃO TEM FICHA DE ATRIBUTO ----
     Medido: `bestiario.js` e `companheiros.js` não trazem `atributos` —
     inimigo e companheiro não têm `vigor` nenhum para somar. O valor aqui é
     ZERO, e é ESCOLHA DECLARADA, não acidente:

     (a) inventar um modificador a partir de `nivel` ou de `ameaca` seria um
         segundo sistema de atributos, invisível, que ninguém consegue
         conferir contra uma ficha — exatamente o tipo de número que a
         lei-mãe desta casa proíbe;
     (b) quem sabe somar atributo + equipamento + efeito é `atributoEfetivo`
         (`regras-jogo.js`), e `regras-jogo.js` IMPORTA este arquivo: chamá-lo
         daqui fecharia um ciclo. Por isso `modDe` entra por argumento — quem
         tem ficha passa a função, quem não tem fica no piso;
     (c) o piso é honesto: a criatura rola o dado cru contra a CD, e o dia em
         que o bestiário ganhar atributos o número aparece sem esta tabela
         mudar uma linha.

     A METADE DA PROFICIÊNCIA CONTINUA VALENDO, e a diferença é de fato, não
     de desenho: o companheiro DECLARA `classe` (`companheiros.js` a infere e
     a grava na ficha), então `bonusDeSalvaguarda` acha a proficiência dele e
     soma — um companheiro Guerreiro aguenta veneno melhor que um Mago, que é
     o que a classe dele promete. O inimigo não declara classe nenhuma e fica
     em zero puro. */
  modSemFicha: 0,
  porqueModSemFicha:
    "inimigo e companheiro não têm `atributos` na ficha; derivar um modificador de nível ou ameaça seria regra nova e invisível. Zero é o piso declarado — quem tem ficha passa `modDe`. A proficiência de classe segue valendo para quem declara classe.",

  /* ---- AS QUE PERMITEM ----
     Sete, e cada uma passou pelos três testes do critério. O atributo sai de
     `SALVAGUARDAS` (é quem rola). A CD repete a `resistir.dif` da própria
     condição quando ela tem uma — o mesmo veneno não pode ter duas forças,
     uma para pegar e outra para sair — e, onde não há entrada declarada, é
     12, o piso da faixa 12–14 que o catálogo inteiro já usa.

     `sai` é a voz de MUNDO, e nasce aqui, não na tela: é a irmã da linha de
     `testeConcentracao` (combate.js) e da de `absorverDano` (efeitos.js).
     Nomeia o que o jogador vê acontecer no corpo, nunca o mecanismo. */
  permitem: [
    {
      id: "envenenado", salva: "vigor", cd: 12,
      sai: "o veneno afrouxa e sai do sangue",
      porque: "é o exemplo que a pessoa deu, e é o 5e ao pé da letra: veneno de criatura repete a salvaguarda de Constituição no fim de cada turno do alvo. CD 12 = a `resistir.dif` de entrada: um veneno tem uma força só.",
    },
    {
      id: "paralisado", salva: "vigor", cd: 14,
      sai: "os músculos voltam a obedecer",
      porque: "Imobilizar Pessoa/Monstro é a repetição clássica do 5e — o alvo rola de novo ao fim de cada turno dele. Aqui a salvaguarda é de VIGOR e não mental, porque neste catálogo `paralisado` é corpo travado (congelado, petrificado, imobilizado) e a entrada já é `vigor`. CD 14 = a dif de entrada, a mais dura das sete: é a que rouba a ação.",
    },
    {
      id: "agarrado", salva: "forca", cd: 12,
      sai: "o corpo se arranca do que o prendia",
      porque: "Golpe Enredante e Tentáculos Negros dão teste de Força ao fim de cada turno de quem está preso — é a repetição mais literal do 5e depois do veneno. Força, e não Destreza, porque a teia se arrebenta, não se contorna. CD 12 = a dif de entrada.",
    },
    {
      id: "amedrontado", salva: "presenca", cd: 12,
      sai: "o medo solta a garganta",
      porque: "Medo e toda Presença Aterradora do 5e repetem a salvaguarda ao fim de cada turno; é a condição que mais explicitamente se sacode sozinha. `presenca` é a salvaguarda desta casa contra o que dobra a vontade — o `resistir` diz `vontade`, que não existe em `SALVAGUARDAS`, e é por isso que esta tabela não herda aquele nome. CD 12 = a dif de entrada.",
    },
    {
      id: "cego", salva: "vigor", cd: 12,
      sai: "a vista volta, embaçada primeiro",
      porque: "Cegueira/Surdez repete salvaguarda de Constituição ao fim de cada turno — literal. E é a prova de que entrada e saída são perguntas diferentes: a porta que CEGA nesta casa é `sentidos` (salvaguarda de Percepção — não se deixar enganar), e a que DESCEGA é o olho se recuperando, que é corpo. Sem `resistir` declarado, CD 12.",
    },
    {
      id: "enfraquecido", salva: "vigor", cd: 12,
      sai: "a força volta aos braços",
      porque: "Raio do Enfraquecimento repete salvaguarda de Constituição ao fim de cada turno do alvo, e é a mesma coisa que esta condição descreve: a força drenada voltando. Sem `resistir` declarado, CD 12.",
    },
    {
      id: "lento", salva: "vigor", cd: 12,
      sai: "o peso sai dos movimentos",
      porque: "Lentidão repete a salvaguarda ao fim de cada turno — mas lá ela é de Sabedoria, e aqui é de VIGOR, e a divergência fica escrita em vez de escondida: neste catálogo `lento` vem por duas portas e a majoritária é o FRIO (`CONDICAO_DA_FONTE.frio` e o portador `gelo` de aflicoes.js), que é hipotermia, não tempo mental. Sair do torpor é o corpo reagindo nas duas leituras. Sem `resistir` declarado, CD 12.",
    },
  ],

  /* ---- AS QUE NÃO PERMITEM, COM O MOTIVO ----
     Só as RUINS precisam de linha: as boas já estão cobertas por
     `porqueBoaNaoRola` acima. Seis, e nenhuma por gosto. */
  naoPermitem: [
    {
      id: "sangrando",
      porque: "teste 2 do critério: é ferimento, não efeito sustentado. Não se expulsa uma artéria aberta com força de vontade — estanca-se com ação, cura ou porta declarada (T4). O 5e nem tem sangramento como condição; o análogo é dano contínuo que se para com Medicina ou magia.",
    },
    {
      id: "queimando",
      porque: "teste 2: o fogo é EXTERNO e continua queimando esteja o corpo forte ou não. No 5e apaga-se gastando uma AÇÃO (rolar no chão, água) — Fogo Alquímico diz isso com todas as letras —, nunca com salvaguarda.",
    },
    {
      id: "atordoado",
      porque: "teste 1: `turnos: 1`. A segunda chance chegaria no mesmo fim de turno em que o relógio já a vence — rolar ali nunca mudaria um único turno de duração. O 5e concorda: Golpe Atordoante dura até o fim do próximo turno, sem repetição.",
    },
    {
      id: "caido",
      porque: "teste 1: `turnos: 1`. E no 5e levantar-se é MOVIMENTO (metade do deslocamento), decisão de quem caiu — transformá-lo em salvaguarda trocaria uma escolha do turno por um dado.",
    },
    {
      id: "enfeiticado",
      porque: "o encanto não se sacode sozinho no 5e: Enfeitiçar Pessoa não repete nada, e Dominar só dá nova chance quando o alvo LEVA DANO — que é gatilho, não fim de turno. E é a única condição do catálogo cuja única saída é `restauracao` (T2 mediu e decidiu isso de propósito): dar-lhe salvaguarda aqui apagaria aquela decisão em silêncio.",
    },
    {
      id: "exausto",
      porque: "no 5e a exaustão é a condição que EXPLICITAMENTE não sai com salvaguarda — só descanso longo ou Restauração Maior, que é exatamente o que ela já declara (`turnos: null`, `saiCom: [\"longo\"]`). Dar-lhe segunda chance seria contradizer o único ponto em que o 5e é categórico.",
    },
  ],
};

/* A porta única para "esta condição dá segunda chance?". Aceita o id, o
   rótulo, o nome da ficção ou a INSTÂNCIA que está na ficha — porque a
   pergunta chega dos quatro jeitos nesta casa.

   SEMPRE devolve objeto para condição conhecida, nunca `null` para dizer
   "não permite": `null` é só "não é condição nenhuma". Quem permite e quem
   não permite se leem do mesmo jeito, e `declarada` diz se a posição está
   ESCRITA na tabela ou se caiu na regra geral — é o sinal que a catraca de
   T3 lê para acender quando uma condição ruim nova nascer sem se declarar. */
export function salvaguardaDeSaida(idOuInstancia) {
  const bruto = idOuInstancia && typeof idOuInstancia === "object"
    ? (idOuInstancia.id || idOuInstancia.nome || "")
    : idOuInstancia;
  const c = condicaoPorId(bruto) || normalizarCondicao(bruto);
  if (!c) return null;
  const T = SALVAGUARDA_DO_FIM_DO_TURNO;
  const sim = T.permitem.find((x) => x.id === c.id);
  if (sim) return { id: c.id, permite: true, salva: sim.salva, cd: sim.cd, sai: sim.sai, porque: sim.porque, declarada: true };
  const nao = T.naoPermitem.find((x) => x.id === c.id);
  if (nao) return { id: c.id, permite: false, salva: "", cd: 0, sai: "", porque: nao.porque, declarada: true };
  if (c.tipo === "bom") return { id: c.id, permite: false, salva: "", cd: 0, sai: "", porque: T.porqueBoaNaoRola, declarada: true };
  return { id: c.id, permite: false, salva: "", cd: 0, sai: "", porque: "", declarada: false };
}

/* A frase que o jogador lê, e ela NASCE AQUI — não na tela. É a irmã da
   linha de `testeConcentracao` e da de `absorverDano`: voz de mundo, sem o
   nome do mecanismo, e com os DOIS números, porque uma condição que sai
   antes do prazo é a coisa que mais muda o turno dele e ler só "passou"
   seria esconder metade do que aconteceu.

   NASCE SÓ NO SUCESSO, e é a mesma medida que C2 tomou pelo motivo inverso:
   lá a linha só vem na QUEDA porque uma a cada golpe aguentado seria ruído;
   aqui o evento é a saída, e uma linha a cada falha — sete condições vezes
   todo turno de todo mundo — seria o mesmo ruído multiplicado. Quem quiser
   ver a falha tem a linha 🎲 de `linhaDaSalvaguarda`, que é voz de depuração
   e está atrás de `mostrarRolagens`; esta não depende dela. */
export function linhaDaSaidaDeCondicao(porta, r, quem = "") {
  if (!porta || !porta.permite || !r || !r.passou) return "";
  const cat = condicaoPorId(porta.id);
  const icone = (cat && cat.icone) || "✓";
  const nome = String(quem || "").trim();
  const frase = nome ? porta.sai : porta.sai.charAt(0).toUpperCase() + porta.sai.slice(1);
  return `${icone} ${nome ? `${nome}: ` : ""}${frase} — deu ${r.total}, e bastavam ${r.dc}.`;
}

/* O FIM DO TURNO DE QUEM CARREGA CONDIÇÃO.
   Serve os três portadores sem saber qual é: herói, companheiro e inimigo
   guardam condição do mesmo jeito (`portador.condicoes`), e a diferença
   entre eles entra por `modDe` — quem tem ficha de atributo passa a função,
   quem não tem fica no piso declarado da tabela.

   DEPOIS DO RELÓGIO, NUNCA ANTES. `tickCondicoes` cobra o dano do turno e
   vence o prazo; só então vem a segunda chance. Invertido, passar na
   salvaguarda apagaria retroativamente o dano de um turno em que a vítima
   ESTEVE envenenada — e o 5e é explícito: o veneno cobra no turno, a chance
   vem no fim dele. Como o relógio já removeu o que venceu, nada aqui rola
   para uma condição que ia sair de qualquer jeito.

   `d20` aceita número (todas com o mesmo dado) ou função `(inst, i)` — é o
   que dá determinismo por semente à suíte sem `Math.random` cravado.

   Estado NOVO, sempre: a lista devolvida é outra, e o portador recebido não
   é tocado. `null` e `{}` devolvem o vazio sem estourar. */
export function tentarSaidaNoFimDoTurno(portador, { modDe, d20 = null, quem = "" } = {}) {
  const lista = (portador && portador.condicoes) || [];
  const ficam = [], saidas = [], linhas = [], linhasTecnicas = [], rolagens = [];
  let i = 0;
  for (const inst of lista) {
    const porta = salvaguardaDeSaida(inst);
    if (!porta || !porta.permite) { ficam.push(inst); continue; }
    const dado = typeof d20 === "function" ? d20(inst, i) : d20;
    i++;
    const r = rolarSalvaguarda({
      pers: portador, salva: porta.salva, dc: porta.cd, modDe,
      d20: Number.isFinite(dado) ? dado : null,
    });
    rolagens.push({ id: porta.id, ...r });
    linhasTecnicas.push(linhaDaSalvaguarda(r, quem || "Você"));
    if (!r.passou) { ficam.push(inst); continue; }
    saidas.push(inst);
    linhas.push(linhaDaSaidaDeCondicao(porta, r, quem));
  }
  return { condicoes: ficam, saidas, linhas, linhasTecnicas, rolagens, mudou: saidas.length > 0 };
}

/* ============================================================
   AS PORTAS DE SAÍDA DECLARADAS (v9.241 — T4)

   A lei é da pessoa, palavra dela: *"cura normal apenas recupera PV mas não
   remove a condição; daí vêm magias, habilidades de classe, itens e os testes
   de resistência."* T2 provou a primeira metade — 45 portas de cura varridas,
   nenhuma escreve em `condicoes`. T3 deu a segunda chance a sete condições.
   Esta tabela é o resto da frase: SE A CURA NÃO LIMPA, A LIMPEZA TEM DE
   EXISTIR DE VERDADE, por porta declarada, e nenhuma condição pode ficar sem
   saída nenhuma.

   ---- TRÊS FAMÍLIAS, TRÊS AUTORIDADES DIFERENTES ----
   A tentação era uma autoridade só — "o canal `restauracao` manda em tudo" —
   e ela estava MEDIDA como errada antes de ser escrita. Poção e relíquia
   removem hoje SEIS ids que o canal não declara (`atordoado`, `amedrontado`,
   `queimando`, `agarrado`, `lento`, `caido`); filtrar as portas existentes
   pelo canal apagaria as seis em silêncio, que é exatamente o tipo de
   regressão que esta casa não aceita de carona. Então:

     MAGIA      → o canal `restauracao` é a autoridade. A magia alcança o que
                  o catálogo declara alcançável por porta, e nada além.
     HABILIDADE → a promessa escrita na própria habilidade, recortada pelo
                  mesmo canal. Hoje NÃO RESOLVE (ver `aguarda`, abaixo).
     ITEM       → a lista `remove` do consumível e a `limpa` da relíquia. Elas
                  já existem, já dizem por escrito o que tiram e já funcionam
                  (`pocoes.js`, `relicas.js`). T4 não toca numa vírgula delas:
                  regressão zero é a lei, e o item é dono do que promete.

   Por isso as linhas de ITEM não aparecem em `portas`: duplicá-las aqui seria
   ter duas verdades sobre o mesmo frasco, e a segunda envelheceria primeiro.

   ---- O CRITÉRIO DA MAGIA (três testes, nesta ordem) ----
   Ele está em `criterio`, legível pela suíte, para a posição de uma condição
   nova ser DEDUZIDA e não escolhida por gosto:

   1. DECLARA O CANAL? `saiCom` inclui `restauracao`. É a metade mecânica, e a
      única que a suíte confere sozinha. Sete condições o declaram.
   2. É AFLIÇÃO OU É FERIMENTO? É o teste 2 de T3, e vale aqui pelo mesmo
      motivo: restauração desfaz o que foi POSTO num corpo, não fecha o que
      foi ABERTO nele. Ferida e fogo pegado se resolvem com ação, com cura ou
      com o item que estanca e apaga — Ataduras e A Pele do Mundo, que já
      existem. (Corta `sangrando`.)
   3. O DEGRAU: a MENOR tira o que foi posto em você; a MAIOR tira também o que
      foi TIRADO de você. Veneno, escuridão e trava são coisa posta e saem no
      2º círculo; vontade, fôlego e força são coisa arrancada, e devolver é 5º.
      É o 5e ao pé da letra nas duas listas, e é a única linha que precisa ser
      lida em vez de deduzida — por isso cada porta traz o `porque`.

   ---- O QUE MUDOU NO CATÁLOGO, E POR QUE NÃO É REGRESSÃO ----
   Três condições passaram a declarar o canal para que as duas Restaurações
   cumpram o que a própria descrição delas promete, e a medição está feita:

     `paralisado`  não tinha `saiCom` NENHUM → `["longo", "restauracao"]`. Sem
        canal, ele caía na regra implícita de que o descanso longo limpa toda
        condição ruim; declarar `"longo"` JUNTO é obrigatório, porque `saiCom`
        não-vazio desliga a regra implícita — foi essa a armadilha que T2
        mediu em `enfeiticado`. Com as duas palavras, a noite continua
        exatamente como estava.
     `enfraquecido` e `exausto`  já diziam `["longo"]` → ganharam a segunda
        palavra e o `"longo"` ficou onde estava.

   Conferido nos dois canais de descanso, condição por condição: a lista do
   que o curto limpa e a do que o longo limpa são IDÊNTICAS às de antes. E é
   garantido por estrutura, não por sorte — `limparPorDescanso` é o ÚNICO
   leitor de `saiCom` no projeto inteiro, e ele recusa qualquer canal que não
   seja de descanso. O que acrescentar `"restauracao"` faz hoje é exatamente
   nada; quem passa a ler a palavra é esta tabela, e só ela.

   ---- QUANTAS DE UMA VEZ, E POR QUE TODAS ----
   O 5e manda escolher UMA condição por conjuração. Aqui a porta tira TODAS as
   que alcança, e a divergência fica escrita em vez de escondida: lá há um
   jogador para escolher e uma mesa para esperar a escolha; aqui seria um
   diálogo a mais no meio do turno para um caso raro (é preciso carregar duas
   condições alcançáveis ao mesmo tempo). E é o que o acervo JÁ pratica — os
   Sais Aromáticos tiram `atordoado` E `amedrontado` num gole, e a relíquia
   limpa a lista inteira dela. Uma regra a menos, e a mesma em todo o jogo.
   ============================================================ */
export const PORTAS_DE_SAIDA = {
  regra: "se a cura não limpa, a limpeza vem por porta declarada — magia, habilidade de classe ou item",
  canal: "restauracao",
  criterio: [
    "a condição declara o canal `restauracao` em `saiCom` — o canal é a autoridade da MAGIA",
    "é aflição posta no corpo ou na vontade, não ferimento aberto nem fogo em curso",
    "o degrau: a Menor tira o que foi posto em você; a Maior tira também o que foi tirado de você",
  ],
  /* `quantasPorVez: null` = todas as que a porta alcança. Mora aqui, e não
     dentro do laço que remove, pela lei-mãe: quem um dia quiser o "escolha
     uma" do 5e mexe nesta linha e a suíte lê a mudança de volta. */
  quantasPorVez: null,
  porqueTodas:
    "o 5e faz escolher uma porque lá há um jogador para escolher e uma mesa para esperar. Aqui seria um diálogo a mais no meio do turno, para o caso raro de duas alcançáveis ao mesmo tempo — e o acervo já limpa lista inteira (Sais Aromáticos, e toda relíquia com `limpa`).",

  familias: [
    {
      id: "magia", autoridade: "o canal `restauracao` do catálogo de condições",
      porque: "a magia não tem lista própria: ela lê o que o catálogo declara alcançável por porta. Assim uma condição nova que queira ser alcançada por Restauração se declara numa linha só, e nenhuma magia precisa ser editada.",
    },
    {
      id: "habilidade", autoridade: "a promessa escrita na própria habilidade, recortada pelo mesmo canal",
      porque: "a habilidade de classe diz em português o que tira, e o canal impede que 'remove condições ruins' vire 'remove tudo'. Desde a v9.265 (H1) ela RESOLVE: quem a executa é `aplicarPoder` (poder-de-classe.js), motor `porta`, o segundo chamador que `removerPelaPorta` esperava desde que nasceu com um só.",
    },
    {
      id: "item", autoridade: "a lista `remove` do consumível e a `limpa` da relíquia",
      porque: "elas já existem, já funcionam e já dizem por escrito o que tiram. Passar a filtrá-las por este canal apagaria seis remoções vivas — `atordoado`, `amedrontado`, `queimando`, `agarrado`, `lento` e `caido` — em silêncio. O item é dono do que promete; T4 não toca nele.",
    },
  ],

  /* AS PORTAS, POR NOME. O nome é o laço com o acervo, como em
     `CONCENTRACAO_DA_MAGIA.excecoes`: a suíte confere que cada um destes
     existe mesmo no grimório ou em `classes.js`, e um nome que morrer lá
     acende aqui. `herdaDe` é a regra "a Maior alcança tudo que a Menor
     alcança" escrita como regra, e não copiada como lista. */
  portas: [
    {
      familia: "magia", nome: "Restauração Menor", fonte: "grimorio.js · 2º círculo · funcao curar_condicao",
      remove: ["envenenado", "cego", "paralisado"], resolve: true,
      porque: "é a lista do 5e ao pé da letra — Restauração Menor encerra cegueira, surdez, paralisia, veneno ou uma doença. As três que este catálogo tem são coisa POSTA no corpo: o veneno que corre, a escuridão que cai sobre o olho, a trava que prende o músculo. A descrição da magia já prometia veneno e cegueira; agora ela cumpre.",
    },
    {
      familia: "magia", nome: "Restauração Maior", fonte: "grimorio.js · 5º círculo · funcao curar_condicao",
      herdaDe: "Restauração Menor",
      remove: ["enfeiticado", "exausto", "enfraquecido"], resolve: true,
      porque: "as três do 5º círculo são o que foi TIRADO de alguém: a vontade capturada (encanto), o fôlego (um nível de exaustão) e a força drenada (o efeito que reduz atributo). No 5e as duas listas são disjuntas; aqui a Maior é SUPERCONJUNTO de propósito, porque um 5º círculo que não faz o que o 2º faz seria armadilha de ficha — a disjunção lá existe por economia de lista, não por lei de mundo.",
    },
    {
      familia: "habilidade", nome: "Purificar", fonte: "classes.js · Clérigo nv3",
      herdaDe: "Restauração Menor", remove: [], resolve: true,
      /* v9.265 (H1): O RESOLVEDOR NASCEU, e o `aguarda` desta linha o nomeava
         palavra por palavra — "um resolvedor de habilidade de classe — ele NÃO
         existe". Ele existe: `aplicarPoder` (poder-de-classe.js), motor
         `porta`, que lê ESTA linha e chama `removerPelaPorta`. O alcance não
         mudou um item: continua sendo o da Restauração Menor por `herdaDe`.
         O campo `aguarda` sai porque dívida paga não fica pendurada. */
      porque: "a descrição diz 'remove condições ruins de um aliado', e sem recorte isso seria a Maior de graça num nível 3. O alcance dela é o da Menor: a mão do clérigo fazendo por disciplina o que o 2º círculo faz por magia.",
    },
    {
      familia: "habilidade", nome: "Palavra de Coragem", fonte: "classes.js · Clérigo nv4",
      remove: ["amedrontado"], resolve: true,
      /* v9.265 (H1): o resolvedor chegou (ver Purificar, acima) e "remove
         medo" passa a valer de verdade. A OUTRA METADE CONTINUA DEVENDO —
         "concede PV temporário" não tem mecânica nenhuma nesta casa —, e por
         isso a habilidade continua declarada em `AGUARDAM` (poder-de-classe.js)
         com esse motivo escrito. Meia promessa cumprida é meia dívida, não
         dívida quitada. */
      porque: "'remove medo' é uma condição só, e ela tem nome no catálogo. `amedrontado` não declara o canal `restauracao` e não precisa: o canal é a autoridade da MAGIA, e esta é a palavra de quem está do lado, não um círculo conjurado.",
    },
  ],

  /* A FRASE, E ELA NÃO SE REPETE. Quatro das seis condições que a magia
     alcança já têm a sua em `SALVAGUARDA_DO_FIM_DO_TURNO.permitem[].sai`, e é
     a MESMA coisa que o jogador vê acontecer: o corpo largando o que o
     prendia. Que tenha largado por um dado ou por uma mão aberta sobre ele
     não muda o que se vê. Aqui só moram as que faltavam — e a suíte pode
     exigir que nenhuma condição tenha duas frases. */
  alivio: {
    enfeiticado: "a vontade volta a ser sua, e o que você fez ainda está lá",
    exausto: "o corpo lembra o que é ter fôlego",
  },
};

/* A frase de mundo, por condição, de onde quer que ela more. Privada de
   propósito: quem precisa dela é a linha, e a linha é a porta única. */
function fraseDoAlivio(id) {
  const t = SALVAGUARDA_DO_FIM_DO_TURNO.permitem.find((x) => x.id === id);
  return (t && t.sai) || PORTAS_DE_SAIDA.alivio[id] || "";
}

/* A porta única para "este nome é uma porta de saída, e o que ela tira?".
   Aceita o nome cru, a magia do grimório ou a habilidade da ficha — porque a
   pergunta chega dos três jeitos. Devolve `remove` JÁ RESOLVIDO (com o
   `herdaDe` somado) e SEMPRE achatado, para nenhum chamador ter de saber que
   a herança existe. `null` é "não é porta nenhuma". */
export function portaDeSaida(nomeOuObjeto) {
  const bruto = nomeOuObjeto && typeof nomeOuObjeto === "object"
    ? (nomeOuObjeto.nome || nomeOuObjeto.id || "")
    : nomeOuObjeto;
  const n = semAcento(bruto).trim();
  if (!n) return null;
  const achar = (alvo) => PORTAS_DE_SAIDA.portas.find((p) => semAcento(p.nome) === semAcento(alvo));
  const p = achar(n);
  if (!p) return null;
  /* a profundidade é teto de segurança, não regra: uma herança circular
     escrita por engano pararia aqui em vez de estourar a pilha */
  const somar = (linha, profundidade) => {
    if (!linha || profundidade > 4) return [];
    const herdado = linha.herdaDe ? somar(achar(linha.herdaDe), profundidade + 1) : [];
    return [...herdado, ...(linha.remove || [])];
  };
  const remove = [...new Set(somar(p, 0))].filter((id) => !!condicaoPorId(id));
  return {
    familia: p.familia, nome: p.nome, fonte: p.fonte || "",
    remove, resolve: !!p.resolve, aguarda: p.aguarda || "", porque: p.porque,
  };
}

/* A frase que o jogador lê quando uma porta se abre, e ela NASCE AQUI — não
   na tela. É a irmã de `linhaDaSaidaDeCondicao`: voz de mundo, sem o nome do
   mecanismo, e sem depender de `mostrarRolagens`, porque aqui não se rola
   nada — a porta declarada não pede dado a ninguém.

   O ícone é o da PRIMEIRA condição que saiu, não o da porta: o jogador está
   vendo o corpo mudar, e é o corpo que tem ícone na tela dele. */
export function linhaDaPortaDeSaida(porta, removidas, quem = "") {
  const cats = (removidas || [])
    .map((i) => condicaoPorId(i && i.id) || normalizarCondicao((i && (i.nome || i.id)) || ""))
    .filter(Boolean);
  if (!porta || !cats.length) return "";
  const frases = cats.map((c) => fraseDoAlivio(c.id)).filter(Boolean);
  if (!frases.length) return "";
  const nome = String(quem || "").trim();
  const junta = frases.join("; ");
  const frase = nome ? junta : junta.charAt(0).toUpperCase() + junta.slice(1);
  return `${cats[0].icone || "✓"} ${nome ? `${nome}: ` : ""}${frase}.`;
}

/* A REMOÇÃO POR PORTA DECLARADA, e ela é NOVA E PRÓPRIA — não reaproveita
   `limparPorDescanso`. T2 trancou aquela porta de propósito: ela RECUSA canal
   que não seja de descanso, justamente para que uma cura futura não entrasse
   por ali fingindo ser tempo. Fazer a magia passar por lá seria arrombar a
   fechadura que a etapa anterior pôs.

   Serve os três portadores sem saber qual é — herói, companheiro e inimigo
   guardam condição do mesmo jeito. Estado NOVO, sempre: a lista devolvida é
   outra e o portador recebido não é tocado. `null` e `{}` devolvem o vazio
   sem estourar. Uma porta que ainda não resolve (`resolve: false`) não tira
   nada: declarada não é ligada, e esta função não finge que é. */
export function removerPelaPorta(portador, porta, opcoes) {
  /* `= {}` no destructuring NÃO cobre `null` explícito — lei da casa */
  const { quem = "" } = opcoes || {};
  const p = porta && typeof porta === "object" && Array.isArray(porta.remove) ? porta : portaDeSaida(porta);
  const lista = (portador && portador.condicoes) || [];
  const vazio = { condicoes: [...lista], removidas: [], linha: "", mudou: false, porta: p };
  if (!p || !p.resolve || !p.remove.length) return vazio;
  const alcancadas = lista.filter((inst) => {
    const c = condicaoPorId(inst && inst.id) || normalizarCondicao((inst && inst.nome) || "");
    return !!c && p.remove.includes(c.id);
  });
  /* O TETO É LIDO DA TABELA, não cravado aqui: `null` é "todas as que
     alcança", e um número seria o "escolha uma por conjuração" do 5e, no dia
     em que a casa mudar de ideia. Sem esta linha, `quantasPorVez` seria
     declaração morta — a lei que T4 existe para cumprir. */
  const teto = PORTAS_DE_SAIDA.quantasPorVez;
  const saidas = Number.isFinite(teto) && teto > 0 ? alcancadas.slice(0, teto) : alcancadas;
  if (!saidas.length) return vazio;
  /* a ordem da ficha é preservada: quem fica, fica onde estava */
  const ficam = lista.filter((inst) => !saidas.includes(inst));
  return { condicoes: ficam, removidas: saidas, linha: linhaDaPortaDeSaida(p, saidas, quem), mudou: true, porta: p };
}

/* ---------------- A CONTA DA COBERTURA ----------------
   A catraca que fecha a fase T: TODA CONDIÇÃO TEM AO MENOS UMA SAÍDA. Uma
   condição nova amanhã sem saída nenhuma faz `semSaida` deixar de ser vazio, e
   a suíte acende no dia em que ela nascer — que é o que `concentrado` esperou
   trinta versões para alguém notar.

   `porItem` ENTRA POR ARGUMENTO, e é a mesma razão declarada de `modDe` em
   T3: `pocoes.js` IMPORTA este arquivo, então importá-lo de volta fecharia um
   ciclo. Quem tem a lista passa a lista; quem não passa recebe a conta sem a
   família do item — e o `semSaida` continua correto mesmo assim, porque
   nenhuma condição depende SÓ do item para ter saída (medido: as que o item
   alcança têm todas prazo, salvaguarda ou descanso por baixo).

   A HABILIDADE NÃO CONTA COMO SAÍDA, e é o ponto honesto desta conta: ela
   está DECLARADA e não RESOLVE. Sai em `aguardando`, nunca em `porta` — senão
   a cobertura passaria verde contando uma promessa. */
export function coberturaDasCondicoes(opcoes) {
  const { porItem = [] } = opcoes || {};
  const todas = listaCondicoes();
  const doItem = new Set((porItem || []).filter((id) => condicaoPorId(id)));
  const daMagia = new Set();
  const daHabilidade = new Set();
  /* `abrem` é o que de fato SE ABRE hoje: as famílias acima são informação, e
     uma porta declarada que ainda não resolve não entra aqui — por família
     nenhuma, nem no dia em que a magia tiver uma esperando. */
  const abrem = new Set(doItem);
  for (const linha of PORTAS_DE_SAIDA.portas) {
    const p = portaDeSaida(linha.nome);
    if (!p) continue;
    const saco = p.familia === "magia" ? daMagia : p.familia === "habilidade" ? daHabilidade : null;
    for (const id of p.remove) { if (saco) saco.add(id); if (p.resolve) abrem.add(id); }
  }
  const conta = { prazo: 0, descanso: 0, salvaguarda: 0, porta: 0, comMaisDeUma: 0 };
  const semSaida = [];
  for (const c of todas) {
    const prazo = Number(c.turnos) > 0;
    const descanso = limparPorDescanso([criarCondicao(c.id)], "curto").removidas.length > 0
      || limparPorDescanso([criarCondicao(c.id)], "longo").removidas.length > 0;
    const salva = salvaguardaDeSaida(c.id).permite === true;
    /* só porta que RESOLVE conta como saída — a habilidade está declarada e
       ainda não abre; contá-la seria a cobertura passando verde na promessa */
    const porta = abrem.has(c.id);
    if (prazo) conta.prazo++;
    if (descanso) conta.descanso++;
    if (salva) conta.salvaguarda++;
    if (porta) conta.porta++;
    const quantas = [prazo, descanso, salva, porta].filter(Boolean).length;
    if (quantas > 1) conta.comMaisDeUma++;
    if (quantas === 0) semSaida.push(c.id);
  }
  return {
    total: todas.length,
    ruins: todas.filter((c) => c.tipo === "ruim").length,
    boas: todas.filter((c) => c.tipo === "bom").length,
    ...conta,
    porMagia: [...daMagia],
    porItem: [...doItem],
    porHabilidade: [...daHabilidade],
    aguardando: PORTAS_DE_SAIDA.portas.filter((p) => !p.resolve).map((p) => p.nome),
    semSaida,
  };
}

/* O que um descanso limpa (o catálogo manda, não a ficção).

   v9.239 (T2) · A PORTA SÓ ABRE PARA CANAL DE DESCANSO. Antes, esta
   função aceitava QUALQUER string: `limparPorDescanso(c, "cura")` limpava
   as quatro condições que declaravam aquele canal, e teria sido a
   maneira mais fácil de uma cura futura apagar condição sem parecer que
   apagava — o nome da função diria "descanso" e o argumento diria outra
   coisa. Canal desconhecido, ou canal que existe mas não é de descanso,
   devolve a lista INTEIRA: nada some por engano.

   O descanso é o único que continua limpando porque ele não é cura — é
   PASSAGEM DE TEMPO. Ele faz duas coisas ao mesmo tempo (devolve PV e
   gasta horas); a metade de PV obedece à lei (está em `descanso.js`, e
   lá não há uma linha que toque em `condicoes`), e a limpeza é a metade
   do tempo cobrando o prazo. É também a única saída que `exausto` tem
   (`turnos: null`, `saiCom: ["longo"]`): sem ela, a exaustão seria
   perpétua. */
export function limparPorDescanso(condicoes = [], tipo = "curto") {
  const canal = CANAIS_DE_SAIDA.find((c) => c.id === tipo);
  if (!canal || !canal.porDescanso) return { condicoes: [...(condicoes || [])], removidas: [] };
  const ficam = [], saem = [];
  for (const inst of condicoes || []) {
    const c = condicaoPorId(inst.id) || normalizarCondicao(inst.nome || "");
    const sai = c ? (c.saiCom || []).includes(tipo) || (tipo === "longo" && c.tipo === "ruim" && (c.saiCom || []).length === 0) : tipo === "longo";
    (sai ? saem : ficam).push(inst);
  }
  return { condicoes: ficam, removidas: saem };
}

/* ---------------- ONDE MORAVA O CÃO DE GUARDA (v9.49) ----------------
   Aqui viviam `detectarCondicoesNarradas` e `detectarAliviosNarrados`: o
   sistema lia a narração do Mestre atrás de condições que ele tivesse
   descrito e esquecido de registrar, e aplicava sozinho.

   A ideia era boa — a ficção virando mecânica em vez de enfeite — e a
   prática entregou isto: "sente o ar quente ainda PRESO NA garganta"
   virou Agarrado, dois turnos de desvantagem por uma metáfora. Não era
   o regex: prosa não é ficha. O mesmo verbo que prende o herói numa
   teia prende o ar na garganta dele.

   As condições agora vêm de três lugares, todos do código: o combate
   (`aflicoes.js`), o tempo (`tickCondicoes` e `limparPorDescanso`, logo
   acima) e a falha crítica num teste (`consequencias.js`).

   Os `aliases` do catálogo continuam servindo: `normalizarCondicao` os usa
   para casar o nome que o combate produz com o id certo. */

/* ---------------- O QUE O MESTRE LÊ ----------------
   Vai no rodapé de TODO turno: enquanto houver condição ativa, ele não
   tem como narrar o herói inteiro por engano. */
export function resumoCondicoesPrompt(pers, grupo = []) {
  const minhas = (pers && pers.condicoes) || [];
  const linhas = [];
  if (minhas.length) {
    const est = estadoDeRolagem(minhas);
    const m = mecanicaDe(minhas);
    linhas.push(`MINHAS CONDIÇÕES AGORA (fato do sistema — narre-as, nunca as ignore nem invente outras): ${minhas.map((c) => `${c.icone || ""} ${c.nome}${c.turnos ? ` (${c.turnos}t)` : ""} — ${c.efeito || ""}`).join("; ")}.${est.rotulo !== "neutro" ? ` Rolagens com ${est.rotulo.toUpperCase()}.` : ""}${m.perdeAcao ? " ATENÇÃO: estou IMPOSSIBILITADO DE AGIR neste turno — não me faça atacar, correr nem conversar como se nada houvesse." : ""}${m.danoTurno ? ` Perco ${m.danoTurno} PV por turno enquanto isso durar (o sistema cobra).` : ""}`);
  }
  const comCond = (grupo || []).filter((c) => c && (c.condicoes || []).length);
  if (comCond.length) {
    linhas.push(`CONDIÇÕES DO GRUPO: ${comCond.map((c) => `${c.nome}: ${(c.condicoes || []).map((x) => x.nome).join(", ")}`).join(" · ")}.`);
  }
  return linhas.join("\n");
}

export const CONDICOES_PROMPT = `CONDIÇÕES E EFEITOS (v9.49 — o sistema aplica, você narra):
- Existe um catálogo fechado de condições: ${listaCondicoes().map((c) => c.rotulo).join(", ")}. Elas são MECÂNICA, com duração e efeito numérico, e são do SISTEMA.
- VOCÊ NÃO APLICA NEM REMOVE CONDIÇÃO — não existe campo para isso e não existe frase que faça isso. Só três coisas põem uma condição em alguém: o combate (o sistema rola a aflição da arma, da magia ou do bicho), o tempo (o turno que vence, o descanso que limpa) e a FALHA CRÍTICA num teste. Nenhuma delas passa por você.
- Quando a cena pedir uma consequência mecânica — a teia que prende, o veneno da taça, o degrau que cede —, NARRE o perigo acontecendo e repita-o em UMA frase no campo "perigo". Você não pede rolagem nenhuma: o sistema lê a frase, escolhe a salvaguarda, rola, cobra e aplica. Descrever a teia caindo é seu; dizer que ela prendeu, não.
- Também não descreva alguém "envenenado", "atordoado", "sangrando", "cego" ou "paralisado" como estado de ficha se o envelope não disser que ele está: isso é afirmar mecânica que não existe. Descreva a cena, não o estado.
- O caminho inverso vale igual: as condições ATIVAS chegam a você no rodapé de cada turno, e são fato. Enquanto o herói estiver ATORDOADO ou PARALISADO ele NÃO age — narre o corpo que não obedece, jamais uma ação normal. Enquanto estiver ENVENENADO ou SANGRANDO, mostre o preço disso na cena. E nunca anuncie que uma condição passou: quem a tira é o sistema, nunca você.`;
