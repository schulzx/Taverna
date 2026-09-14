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
   para que uma cura futura não entre por essa porta. O canal
   "restauracao" nasce sem leitor de propósito — quem o liga é T4. */
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
    turnos: 2, perdeAcao: true, subst: "paralisia",
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
    turnos: 3, desvantagem: true, danoReduzido: 2, saiCom: ["longo"],
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
    turnos: null, desvantagem: true, saiCom: ["longo"],
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
  concentrado: {
    id: "concentrado", rotulo: "Concentrado", icone: "🎯", tipo: "bom",
    turnos: null, concentracao: true,
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

   ---- O QUE ISTO NÃO FAZ ----
   `concentrado` não ganha saída aqui, e ele é o caso que T4 tem de resolver:
   é `tipo: "bom"`, cai no teste 3, e continua com `turnos: null`, `saiCom: []`
   e nada que o aplique. Esta tabela não o conserta e não finge que o
   conserta. O canal `restauracao` também não é lido daqui — ele é T4.
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
- O caminho inverso vale igual: as condições ATIVAS chegam a você no rodapé de cada turno, e são fato. Enquanto o herói estiver ATORDOADO ou PARALISADO ele NÃO age — narre o corpo que não obedece, jamais uma ação normal. Enquanto estiver ENVENENADO ou SANGRANDO, mostre o preço disso na cena. E nunca anuncie que uma condição passou: quem a tira é o relógio ou o descanso.`;
