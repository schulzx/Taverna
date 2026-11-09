/* ============================================================
   OS ESPÓLIOS DA QUEST — o que se acha no caminho e o que se leva no fim
   (09/11/2026, Fase TE · TE6)

   A pessoa, 09/11: *«os espólios, tanto possíveis achados no caminho quanto
   recompensas, itens que façam valer a pena a busca… além da ótima história
   ele precisa da recompensa e da sensação de ficar mais forte».* E a planta
   (mente/plano-temperatura-e-espolios.md, §2.2) mediu o buraco: as 52 fichas
   da biblioteca pagavam POR CÓDIGO zero XP e zero itens — três ganhos de
   moedas em 52 —, e o XP de uma quest só chegava se o Narrador mandasse
   `feito: marco` no fecho. Era a imaginação a pagar, que é o contrário desta
   casa. Um contrato de mural pagava mais do que a quest que é o coração do
   jogo.

   Este módulo é a conta, e só a conta. Lê a ficha, o registo e (quando há) a
   ficha do herói, e devolve o que se ganha — nunca aplica: a fiação (TE9)
   aplica pelas portas que já existem (o chão de `chao.js`, `aplicarNivel`, a
   bolsa), e guarda a chave da paga em `aplicadas` para nunca pagar duas
   vezes. TODA A SORTE sai de `dadoDo(semente, "espolio", quest, …)`: a mesma
   campanha dá os mesmos achados em qualquer máquina, jogue-se em 20 turnos
   ou em 40.

   AS CINCO PEÇAS, e a tabela de cada uma (se é número, é tabela):

     1. A CURVA (`PAGA_DA_QUEST`, `PAGA_DO_CORACAO`, `BASE_DAS_MOEDAS`). O XP
        é uma FRAÇÃO DO VÃO do nível — a régua do Juiz (`vaoDoNivel ×
        fração × pressaDoNivel`, a mesma de `xpDoFeito`) —, de 1/12 na brasa a
        1/4 no incêndio. Uma campanha de cinco atos dá perto de um nível só
        pela história; as lutas dão o resto, como hoje. As moedas são um
        múltiplo da base de missão, com o `tetoDoPresente` do Juiz por teto.
     2. A FAMÍLIA DO CAMINHO (`FAMILIA_DO_RAMO`, `RECOMPENSA_DA_FAMILIA`). O
        ramo que fechou a etapa da mão diz COMO o herói resolveu, e cada modo
        paga diferente: o ferro dá a peça de combate, a palavra dá moedas e
        um favor, a sombra dá um acessório e um achado a mais, o saber dá XP
        e um consumível raro. Escolher o caminho passa a ser escolher o
        prémio — é a razão de o caminho existir.
     3. O TETO (`TETO_DE_RARIDADE_DO_NIVEL`, `ORCAMENTO_DO_ESPOLIO`). A
        raridade é limitada pelo nível, na régua do Dungeon Master's Guide
        (2014, cap. 7, «Magic Item Rarity»), e a campanha tem orçamento:
        ⌈atos/2⌉ peças raras ou melhores, dois artefactos, duas lembranças,
        uma relíquia. A régua do poder (`teste-regua-do-poder.mjs`, TE7)
        prova que o kit da história fica MAIS FORTE (+3 pontos de vitória no
        mínimo) sem QUEBRAR a luta (+12 no máximo, e nunca acima de 70%).
     4. OS ACHADOS (`ACHADO_DO_SITIO`, `SITIO_DO_PAPEL`). Por etapa, ligados
        ao tipo do sítio e à solução: a etapa que fecha por um ramo deixa um
        achado do sítio onde se passou; e cada quest esconde UM achado num
        sítio opcional, que ninguém diz que existe. Decisão da pessoa
        (09/11): o achado escondido ESPERA ATÉ A QUEST FECHAR — o herói pode
        voltar a buscá-lo enquanto ela estiver aberta; fechada, perdeu-se.
     5. AS PEÇAS COM NOME (`ARTEFACTOS_COM_NOME`, `DESPERTAR_DO_ARTEFACTO`,
        `RELIQUIA_DO_CONFRONTO`). Decisões da pessoa (09/11): dois artefactos
        do enredo e até duas lembranças dos companheiros por campanha, e as
        10 relíquias únicas como prémio RARO de um confronto final. O
        artefacto cresce de adormecido a desperto a exaltado, à maneira dos
        Vestiges of Divergence (Explorer's Guide to Wildemount, 2020, cap. 6):
        a peça é memória da campanha porque muda com ela. O catálogo é do
        acervo (TE8: src/acervo/artefactos-lote-1.js — uma peça por quest
        quente, uma lembrança por quest do coração); aqui fica a conta. Um
        dos dois artefactos fica guardado para o confronto final
        (`reservaDoConfronto`).

   O QUE A RÉGUA MUDOU NA PLANTA, em número (o cenário justo de cada classe,
   400 sementes, as peças sorteadas por semente). (1) A planta dizia que o
   artefacto com nome «pode passar o teto um degrau»: uma arma um degrau acima
   do teto põe o Guerreiro a +25,8 e o Caçador a +21,5 pontos no nível 7 —
   passa os +12 da lei do poder. O artefacto fica no degrau da quest; a força
   dele é o nome, os passivos escritos e o gesto do exaltado. (2) Do nível 11
   em diante, a peça no teto do DMG quebra a luta em todas as classes
   (+14,2 a +25,0): a quest dá um degrau abaixo (TETO_DE_RARIDADE_DO_NIVEL,
   coluna `daQuest`), e o porquê está lá. (3) TE8: desse ponto em diante o
   «mais forte» é o artefacto que desperta — acende o teto (coluna `degrau`
   de DESPERTAR_DO_ARTEFACTO) sem reforjar o aço; no 12 a arma com nome dá
   +3 a +7 nas classes do aço, onde a peça genérica dava −0,3 a +1,0.

   O QUE O NARRADOR RECEBE: só pela pauta dinâmica, só no turno em que
   acontece — `espolioNaPauta` devolve uma linha («O QUE O HERÓI LEVA: …»,
   teto 140) e o veto para `naoPode`. Nunca bloco estático.

   O SAVE: só campo novo e aditivo — no item, `deQuest` e `artefacto`; no
   registo da quest, `espolio: { achados, pago }` (que `garantirRegisto`
   preserva). A chave da paga é `paga.chave`, para `aplicadas`.
   ============================================================ */

import { dadoDo } from "./semente.js";
import { vaoDoNivel, pressaDoNivel, tetoDoPresente } from "./juiz.js";
import { gerarLoot, RARIDADES } from "./loot.js";
import { TIER, PODERES, EFEITOS_DE_ATRIBUTO } from "./afixos.js";
import { itemConsumivel } from "./pocoes.js";
import { RELIQUIAS, itemDaReliquia } from "./relicas.js";
import { KIT_INICIAL } from "./kit-inicial.js";
import { avaliarCondicao } from "./condicoes-da-quest.js";
import { contrair } from "./lugar.js";
import { compararItem, rotuloDoEquipar, encaixeDoItem, fraseDaTroca } from "./comparar-item.js";
import { ARTEFACTOS_LOTE_1 } from "./acervo/artefactos-lote-1.js";

/* ============================================================
   1. AS TABELAS
   ============================================================ */

/* A CURVA DO TIPO 1. `xp`: fração do vão do nível (a régua do Juiz);
   `moedas`: múltiplo da base de missão; `item`: o degrau da peça que a
   quest dá, antes do teto do nível (null: a brasa paga só em achados).
   1/12 + 1/8 + 1/6 + 1/6 + 1/4 ≈ 0,79 de um nível numa campanha de cinco
   atos, mais o coração — perto de um nível pela história, como a planta
   pediu. A FALHA e o ABANDONO pagam o XP da `falha` (o de brasa) e mais
   nada: tentou-se, aprendeu-se, não se levou. */
export const PAGA_DA_QUEST = Object.freeze({
  brasa: Object.freeze({ xp: 1 / 12, moedas: 1, item: null }),
  chama: Object.freeze({ xp: 1 / 8, moedas: 1.5, item: "incomum" }),
  fogueira: Object.freeze({ xp: 1 / 6, moedas: 2, item: "raro" }),
  incendio: Object.freeze({ xp: 1 / 4, moedas: 2.5, item: "epico" }),
  falha: "brasa",
});

/* A CURVA DO TIPO 2 — o coração não paga em moeda: paga em XP pelo grau do
   desfecho, e a metade boa deixa uma lembrança (se a ficha a tiver). O grau
   sai da ESTRUTURA do desfecho, nunca do texto (`grauDoDesfecho`): o que
   passa um marco é o melhor; o que mata alguém do grupo ou acaba cedo é o
   pior; o padrão (o que acontece quando o herói não decide) é o meio; o
   resto — decidiu, e custou — é bom. */
export const PAGA_DO_CORACAO = Object.freeze({
  melhor: Object.freeze({ xp: 1 / 8, lembranca: true }),
  bom: Object.freeze({ xp: 1 / 10, lembranca: true }),
  meio: Object.freeze({ xp: 1 / 12, lembranca: false }),
  pior: Object.freeze({ xp: 1 / 20, lembranca: false }),
});

/* A BASE DAS MOEDAS: a de `recompensaDe` (missoes.js), `25 + 12·nível`. Mora
   aqui com nome porque nenhum módulo a exporta; a suíte prova que três
   vezes ela é o `tetoDoPresente` do Juiz em todo nível, e assim as duas não
   podem divergir sem o vermelho dizer. */
export const BASE_DAS_MOEDAS = Object.freeze({ fixo: 25, porNivel: 12 });

/* AS QUATRO FAMÍLIAS DO CAMINHO. Os ramos das 52 fichas são mais de cem; as
   três primeiras famílias listam os seus, e o que não está em nenhuma é do
   `saber` (descobrir, ler, curar, esperar, contar). A família que conta é a
   do ramo que fechou a ETAPA DA MÃO (a do tenente, do rosto, do confronto)
   — ou, se a ficha não diz, a última etapa que fechou por um ramo. */
export const FAMILIA_DO_RAMO = Object.freeze({
  ferro: Object.freeze(["violenta", "lamina", "luta", "forca", "bateu", "armar", "desafiar", "acabar", "romper", "quebrar", "cortar", "expulsar", "jogar"]),
  palavra: Object.freeze(["social", "palavra", "portagem", "acordo", "pagar", "comprar", "compra", "trocar", "cumprir", "honrar", "jurar", "perdoar", "aceitar", "ceder", "paz", "dividir", "vender", "honra", "lei", "amnistia", "justica"]),
  sombra: Object.freeze(["furtiva", "desvio", "roubo", "roubar", "furto", "fuga", "poterna", "mentir", "calar", "seguir", "vigiar", "isca", "capa", "noite", "rasto", "esconder", "sair", "porta"]),
  saber: "o resto",
});

/* O QUE CADA FAMÍLIA PAGA, por cima da curva. `slots`: onde cai a peça do
   degrau da temperatura (null: esta família não leva peça); `moedas` e `xp`:
   multiplicadores; `favor`: um lugar da quest fica a dever ao herói (o
   efeito `favor` que a biblioteca e o livro de factos já leem);
   `achadoExtra`: um achado a mais do sítio da etapa da mão; `consumivel`:
   o consumível raro do saber, pela temperatura (não há pergaminho no
   catálogo — há o frasco, que tem leitor em `usarConsumivel`). */
export const RECOMPENSA_DA_FAMILIA = Object.freeze({
  ferro: Object.freeze({ slots: Object.freeze(["arma", "armadura", "escudo"]), moedas: 1, xp: 1, favor: false, achadoExtra: 0, consumivel: null }),
  palavra: Object.freeze({ slots: null, moedas: 1.5, xp: 1, favor: true, achadoExtra: 0, consumivel: null }),
  sombra: Object.freeze({ slots: Object.freeze(["anel", "amuleto", "botas"]), moedas: 1, xp: 1, favor: false, achadoExtra: 1, consumivel: null }),
  saber: Object.freeze({ slots: null, moedas: 1, xp: 1.25, favor: false, achadoExtra: 0,
    consumivel: Object.freeze({ brasa: "sais", chama: "elixir_intelecto", fogueira: "mana_m", incendio: "cura_g" }) }),
});

/* O TETO DO NÍVEL — três colunas, e cada uma tem o seu juiz.
   `teto`: a régua do DMG de 2014 (cap. 7, «Magic Item Rarity»: incomum do 1,
   raro do 5, muito raro do 11, lendário do 17), na escada da casa — o que a
   planta pediu, e o que nada vindo de quest passa.
   `tipico`: o degrau abaixo — o que o mercado vende na faixa média
   (`raridadeDaBanca`: 60% comum, 32% incomum, 8% raro) e o loot dá; é o KIT
   TÍPICO contra o qual a régua do poder mede o kit da história.
   `daQuest`: o que a peça de uma quest (e o artefacto) chega de facto a
   ser — e é a RÉGUA DO PODER que o diz, não o DMG. Até ao nível 10 é o teto.
   Do 11 em diante, a régua mediu a peça no teto do DMG (arma e armadura,
   400 sementes por classe, o cenário justo de cada uma): +25,0 pontos no
   Guerreiro, +21,5 no Caçador, +15,2 no Ladino, +15,7 na Clériga e +14,2 no
   Mago no nível 12 (épico contra raro), e +15,8 no Guerreiro no 17
   (lendário contra épico) — todas acima dos +12 que a lei do poder deixa.
   O salto é do motor de loot (o épico compra o segundo poder forte, e o
   Ataque Extra mora lá), não da quest; a quest fica um degrau abaixo do
   teto, e o «mais forte» desses níveis passa a ser do artefacto com nome
   (TE8), que se escreve à mão e se mede. */
export const TETO_DE_RARIDADE_DO_NIVEL = Object.freeze([
  Object.freeze({ ate: 4, teto: "incomum", tipico: "comum", daQuest: "incomum" }),
  Object.freeze({ ate: 10, teto: "raro", tipico: "incomum", daQuest: "raro" }),
  Object.freeze({ ate: 16, teto: "epico", tipico: "raro", daQuest: "raro" }),
  Object.freeze({ ate: 20, teto: "lendario", tipico: "epico", daQuest: "epico" }),
]);

/* O ORÇAMENTO DE UMA CAMPANHA (o Loot 2.0 do Diablo III, fev. 2014: menos
   peças, cada uma melhor). `rarosPorAto`: ⌈atos × isto⌉ peças raras ou
   melhores vindas de quests — a que passar desce a incomum; `atosPadrao`:
   quando a campanha não diz quantos atos tem; o resto, as decisões da
   pessoa. A sintonia (três) continua a ser o teto do que age ao mesmo
   tempo.
   `reservaDoConfronto` (TE8): dos dois artefactos, um fica guardado para o
   confronto final enquanto ele não pagou — a planta pedia «um na faixa da
   pista ou do rosto, um no confronto» (§2.3), e com uma peça escrita para
   cada quest quente as duas primeiras fogueiras levavam o orçamento todo e o
   cimo da escada não dava nada: o prémio do fim ia para o meio. */
export const ORCAMENTO_DO_ESPOLIO = Object.freeze({
  rarosPorAto: 0.5,
  atosPadrao: 5,
  artefactos: 2,
  reservaDoConfronto: 1,
  lembrancas: 2,
  reliquias: 1,
  achadosPorEtapa: 1,
});

/* O SÍTIO DE UM PAPEL, quando o mundo não o diz: o nome do papel na ficha
   para o tipo de sítio (os de `mundo-base.js`: locais e masmorras). O que
   não está aqui nem tem `tipos` na ficha é `ermo`. */
export const SITIO_DO_PAPEL = Object.freeze({
  templo: "templo", capela: "templo", cemiterio: "cemiterio", cadafalso: "cadeia", cela: "cadeia", cadeia: "cadeia", tribunal: "cadeia",
  cais: "docas", margem: "docas", barca: "docas", taberna: "taverna", estalagem: "taverna", salao: "taverna",
  quartel: "quartel", posto: "quartel", arsenal: "forte", muralha: "forte", torre: "torre", arquivo: "biblioteca",
  ruina: "ruina", toca: "caverna", covil: "caverna", abrigo: "caverna", pedreira: "mina", sala: "arena", arena: "arena",
  casa: "casa", herdade: "casa", asilo: "casa", hospicio: "casa", moinho: "casa", celeiro: "casa", horto: "casa",
  mercado: "mercado", forja: "forja", guilda: "guilda",
});

/* OS ACHADOS DE CADA SÍTIO. `caminho`: o que a etapa que fecha por um ramo
   deixa (moedas, em múltiplo da base, ou um consumível do catálogo); o
   `escondido`: o que a quest guarda num sítio opcional — e é o ÚNICO achado
   que pode ser peça (`equipamento`: o encaixe; o degrau é o da temperatura
   menos um, no teto do nível). Ninguém diz que o escondido existe. */
export const ACHADO_DO_SITIO = Object.freeze({
  templo: { caminho: [{ id: "oferendas", diz: "as moedas que os fiéis deixaram e ninguém veio buscar", moedas: 0.5 }, { id: "agua_do_poco", diz: "um frasco de água do poço sagrado, ainda frio", consumivel: "cura_m" }],
    escondido: { id: "relicario", diz: "um relicário de prata atrás da pedra solta do altar, com um dente lá dentro", equipamento: "amuleto" } },
  cemiterio: { caminho: [{ id: "obolo", diz: "as moedas sobre os olhos de um morto sem nome", moedas: 0.4 }, { id: "ataduras_de_mortalha", diz: "linho de mortalha, limpo, que alguém dobrou com cuidado", consumivel: "ataduras" }],
    escondido: { id: "lamina_enterrada", diz: "uma lâmina enterrada com o dono, que já não precisa dela", equipamento: "arma" } },
  docas: { caminho: [{ id: "anzol_de_prata", diz: "um anzol de prata preso a um cabo podre, que alguém pagou caro", moedas: 0.6 }, { id: "contrabando", diz: "uma caixa que caiu do barco errado", consumivel: "elixir_destreza" }],
    escondido: { id: "bussola_afogada", diz: "uma bússola de latão no fundo da água rasa, a apontar para onde não há norte", equipamento: "anel" } },
  taverna: { caminho: [{ id: "divida_escrita", diz: "uma dívida escrita, assinada por quem ainda está vivo", moedas: 0.8 }, { id: "garrafa_da_casa", diz: "a garrafa que o dono guarda para os dias maus", consumivel: "revigorante" }],
    escondido: { id: "aposta_esquecida", diz: "a bolsa de uma aposta que ninguém voltou para cobrar, cosida por baixo de um banco", moedas: 1.2 } },
  mercado: { caminho: [{ id: "troco", diz: "o troco que caiu entre as tábuas de uma banca", moedas: 0.5 }, { id: "frasco_sem_rotulo", diz: "um frasco sem rótulo que o vendedor jurou ser bom", consumivel: "cura_p" }],
    escondido: { id: "fundo_falso", diz: "o fundo falso de uma arca de especiarias, e o que alguém lá guardava", equipamento: "anel" } },
  forja: { caminho: [{ id: "limalha_de_prata", diz: "limalha de prata varrida para um canto, ainda boa para vender", moedas: 0.6 }, { id: "oleo_de_tempera", diz: "um frasco do óleo de têmpera, que também fecha uma ferida", consumivel: "ataduras" }],
    escondido: { id: "encomenda_por_levantar", diz: "uma encomenda por levantar, embrulhada em couro — o cliente nunca voltou", equipamento: "arma" } },
  quartel: { caminho: [{ id: "soldo", diz: "o soldo de um mês, esquecido numa gaveta de beliche", moedas: 0.7 }, { id: "racao_de_campanha", diz: "a ração de campanha de quem já não marcha", consumivel: "revigorante" }],
    escondido: { id: "escudo_do_desertor", diz: "o escudo de um desertor, escondido debaixo da palha do estábulo", equipamento: "escudo" } },
  cadeia: { caminho: [{ id: "fianca", diz: "uma fiança que nunca chegou ao juiz", moedas: 0.6 }, { id: "sais_do_carcereiro", diz: "os sais que o carcereiro usa nos que desmaiam", consumivel: "sais" }],
    escondido: { id: "chave_de_osso", diz: "uma chave talhada em osso, escondida numa racha da parede por quem saiu antes", equipamento: "amuleto" } },
  biblioteca: { caminho: [{ id: "marcador_de_ouro", diz: "um marcador de folha de ouro, num livro que ninguém lê", moedas: 0.5 }, { id: "tinta_que_clareia", diz: "um frasco de tinta que clareia a cabeça a quem a cheira", consumivel: "elixir_intelecto" }],
    escondido: { id: "anel_do_copista", diz: "o anel de um copista, cosido na lombada de um livro proibido", equipamento: "anel" } },
  arena: { caminho: [{ id: "aposta_ganha", diz: "uma aposta ganha que ninguém reclamou", moedas: 0.7 }, { id: "frasco_do_campeao", diz: "o frasco que o campeão bebe antes de entrar", consumivel: "frasco_furia" }],
    escondido: { id: "grevas_do_campeao", diz: "as grevas de um campeão que morreu invicto, pregadas debaixo da bancada", equipamento: "botas" } },
  guilda: { caminho: [{ id: "quota_atrasada", diz: "a quota atrasada de um sócio que morreu a dever", moedas: 0.8 }, { id: "tonico_da_casa", diz: "o tónico que a guilda dá a quem trabalha de noite", consumivel: "revigorante" }],
    escondido: { id: "sinete_da_guilda", diz: "um sinete antigo da guilda, que ainda abre portas que a guilda esqueceu", equipamento: "anel" } },
  casa: { caminho: [{ id: "pecas_no_colchao", diz: "as moedas cosidas no colchão por quem não confiava em bancos", moedas: 0.6 }, { id: "remedio_da_avo", diz: "o remédio da avó, num frasco de barro com cera", consumivel: "cura_p" }],
    escondido: { id: "medalhao_de_familia", diz: "um medalhão de família debaixo de uma tábua do soalho, com o retrato raspado", equipamento: "amuleto" } },
  cripta: { caminho: [{ id: "moedas_do_barqueiro", diz: "as moedas do barqueiro, verdes de tanto esperar", moedas: 0.7 }, { id: "unguento", diz: "o unguento com que embalsamavam os nobres", consumivel: "antidoto" }],
    escondido: { id: "lamina_do_jazigo", diz: "a lâmina de um jazigo, posta ao lado do dono para a viagem", equipamento: "arma" } },
  ruina: { caminho: [{ id: "mosaico", diz: "três tesselas de ouro arrancadas a um mosaico partido", moedas: 0.6 }, { id: "tochas_secas", diz: "um feixe de tochas secas, deixado por quem veio antes", consumivel: "tochas" }],
    escondido: { id: "amuleto_da_ruina", diz: "um amuleto no meio do entulho, limpo como se alguém o tivesse acabado de pousar", equipamento: "amuleto" } },
  caverna: { caminho: [{ id: "veio_de_prata", diz: "um veio de prata à flor da rocha, que sai à lâmina", moedas: 0.6 }, { id: "musgo_que_cura", diz: "musgo que fecha cortes, raspado da parede húmida", consumivel: "cura_p" }],
    escondido: { id: "botas_do_ossuario", diz: "um par de botas num monte de ossos — o dono foi comido, as botas não", equipamento: "botas" } },
  torre: { caminho: [{ id: "lentes", diz: "duas lentes de cristal de um instrumento partido", moedas: 0.7 }, { id: "frasco_azul", diz: "um frasco azul na bancada de um alquimista que fugiu a meio", consumivel: "mana_m" }],
    escondido: { id: "anel_do_astronomo", diz: "o anel de um astrónomo, esquecido no parapeito ao lado do telescópio", equipamento: "anel" } },
  mina: { caminho: [{ id: "pepita", diz: "uma pepita que um mineiro escondeu e não voltou para buscar", moedas: 0.8 }, { id: "candeia", diz: "uma candeia cheia de óleo e um feixe de pavios", consumivel: "tochas" }],
    escondido: { id: "picareta_de_aco", diz: "uma picareta de aço negro que corta pedra como quem corta pão", equipamento: "arma" } },
  forte: { caminho: [{ id: "cofre_da_companhia", diz: "o cofre da companhia, arrombado e não vazio", moedas: 0.8 }, { id: "frasco_de_pedra", diz: "um frasco de pedra que os sitiados bebiam antes do assalto", consumivel: "frasco_pedra" }],
    escondido: { id: "armadura_do_capitao", diz: "a armadura do capitão, emparedada com ele no último dia do cerco", equipamento: "armadura" } },
  ermo: { caminho: [{ id: "bolsa_perdida", diz: "a bolsa perdida de um viajante, meio enterrada na berma", moedas: 0.5 }, { id: "ervas_da_berma", diz: "ervas que fecham feridas, colhidas à beira do caminho", consumivel: "cura_p" }],
    escondido: { id: "fardo_do_correio", diz: "o fardo de um correio que não chegou, preso nas raízes de uma árvore caída", equipamento: "botas" } },
});

/* O CRESCIMENTO DO ARTEFACTO (Vestiges of Divergence). `passivos`: quantos
   dos passivos escritos agem; `gesto`: se o gesto (uma vez por dia, a forma
   do `ativo` das relíquias, lida por `usarAtivo`) está aberto; `quando`: o
   que acorda o estado — uma quest de fogueira ou incêndio concluída DEPOIS
   de o ganhar, ou níveis subidos; o confronto concluído também exalta.
   `degrausAcimaDoTeto`: 0 em todos — a régua mediu o degrau a mais e ele
   quebra a luta (cabeçalho).
   `degrau` (TE8, 09/11): a coluna de TETO_DE_RARIDADE_DO_NIVEL em que a
   peça está nesse estado, lida no nível em que FOI GANHA (`artefacto.nivel`)
   — nunca no de agora: um artefacto do nível 8 continua a ser memória do
   nível 8, e a promessa (promessaDoArtefacto) diz a verdade sem adivinhar
   níveis. Até ao 10 as duas colunas são a mesma (o teto É o degrau da
   quest), e nada muda. Do 11 em diante a quest dá um degrau abaixo do teto
   e a peça genérica já não sobe o herói; o artefacto que DESPERTA sobe ao
   teto — é ele, e só ele, o «mais forte» desses níveis (a régua do poder
   mede-o, secção 5). Nunca acima do teto: `degrausAcimaDoTeto` fica 0. */
export const DESPERTAR_DO_ARTEFACTO = Object.freeze({
  ordem: Object.freeze(["adormecido", "desperto", "exaltado"]),
  adormecido: Object.freeze({ passivos: 1, gesto: false, degrausAcimaDoTeto: 0, degrau: "daQuest", quando: null }),
  desperto: Object.freeze({ passivos: 2, gesto: false, degrausAcimaDoTeto: 0, degrau: "teto", quando: Object.freeze({ quests: 1, temperaturas: Object.freeze(["fogueira", "incendio"]), niveis: 3 }) }),
  exaltado: Object.freeze({ passivos: 2, gesto: true, degrausAcimaDoTeto: 0, degrau: "teto", quando: Object.freeze({ confronto: true, niveis: 6 }) }),
});

/* AS PEÇAS COM NOME — o catálogo vive no acervo (TE8: o lote 1 em
   src/acervo/artefactos-lote-1.js, o mesmo espírito dos lotes de quests: um
   ficheiro por lote, que não importa nada). Chave: o id da quest — cada
   quest quente do enredo tem O SEU artefacto, e cada quest do coração a sua
   lembrança; é a coisa DAQUELE vilão, DAQUELE companheiro, e não «um
   artefacto» tirado de um saco. `genero`: `artefacto` (do enredo, tipo 1 de
   fogueira ou incêndio) ou `lembranca` (do coração, tipo 2, metade boa do
   desfecho). `nome` e `historia` são modelos com os papéis da ficha
   (`{vilao}`, e o género de gente em `{quem:dele|dela}`); `base`: a base de
   BASES[tipo], ou null para usar a do herói nesse encaixe; `passivos`: ids
   de PODERES (afixos.js), pela ordem em que acordam — só o vocabulário que
   já tem leitor, e só acendem os que o degrau da peça deixa (a régua de
   comOsPassivos); `gesto`: a forma do `ativo` de relicas.js. A forma de
   cada um e as catracas estão no cabeçalho do lote e em teste-espolios. */
export const ARTEFACTOS_COM_NOME = Object.freeze({ ...ARTEFACTOS_LOTE_1 });

/* A RELÍQUIA DO CONFRONTO — decisão da pessoa (09/11): as 10 relíquias de
   relicas.js entram como prémio RARO de um confronto final. `chance`: uma
   em cinco, rolada pela semente; `mao`: o tipo de mão da quest que conta
   como confronto final (o Cimo da Escada e as suas); `porCampanha`: uma. */
export const RELIQUIA_DO_CONFRONTO = Object.freeze({ chance: 0.2, mao: "confronto", porCampanha: 1 });

/* A LINHA DA PAUTA — a secção `momento`, só no turno em que acontece. */
export const LINHA_DO_ESPOLIO = Object.freeze({
  teto: 140,
  abre: "O QUE O HERÓI LEVA: ",
  achou: "O QUE O HERÓI ACHOU: ",
  naoPode: "dar ao herói outro item ou moedas além dos que o sistema já lhe deu neste turno",
});

/* ============================================================
   2. AS PEÇAS PEQUENAS
   ============================================================ */

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const nivelDe = (n) => Math.max(1, Math.min(20, Math.floor(Number(n) || 1)));
const semAcento = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim().replace(/\s+/g, "_");
const fichaValida = (f) => (obj(f) && typeof f.id === "string" && Array.isArray(f.etapas) ? f : null);
const ehRaridade = (r) => RARIDADES.includes(r);
const baseDasMoedas = (nivel) => BASE_DAS_MOEDAS.fixo + BASE_DAS_MOEDAS.porNivel * nivelDe(nivel);
const xpDaFracao = (fracao, nivel) => Math.max(1, Math.round(vaoDoNivel(nivelDe(nivel)) * fracao * pressaDoNivel(nivelDe(nivel))));
const dado = (semente, ...partes) => dadoDo(semente == null ? "" : String(semente), "espolio", ...partes);

/* A família de um ramo: a primeira que o lista, ou `saber`. */
export function familiaDoRamo(ramo) {
  if (typeof ramo !== "string" || !ramo) return null;
  for (const f of ["ferro", "palavra", "sombra"]) if (FAMILIA_DO_RAMO[f].includes(ramo)) return f;
  return "saber";
}

/* O teto e o típico de um nível: { teto, tipico }. Lixo é o nível 1. */
export function tetoDeRaridade(nivel) {
  const n = nivelDe(nivel);
  const faixa = TETO_DE_RARIDADE_DO_NIVEL.find((f) => n <= f.ate) || TETO_DE_RARIDADE_DO_NIVEL[TETO_DE_RARIDADE_DO_NIVEL.length - 1];
  return { teto: faixa.teto, tipico: faixa.tipico, daQuest: faixa.daQuest };
}
const tierDe = (r) => (Object.prototype.hasOwnProperty.call(TIER, r) ? TIER[r] : 0);
const raridadeDoTier = (t) => RARIDADES[Math.max(0, Math.min(4, t))];
/* o degrau pedido, sem passar o que a régua deixa a quest dar neste nível */
const noTeto = (raridade, nivel) => raridadeDoTier(Math.min(tierDe(raridade), tierDe(tetoDeRaridade(nivel).daQuest)));

/* O grau de um desfecho do tipo 2, pela estrutura (PAGA_DO_CORACAO). */
export function grauDoDesfecho(ficha, desfecho) {
  const F = fichaValida(ficha);
  if (!F || typeof desfecho !== "string") return null;
  const d = arr(F.desfechos).find((x) => obj(x) && x.id === desfecho);
  if (!d) return null;
  const efs = arr(d.efeitos).map((e) => obj(e) && e.tipo);
  if (d.cedo || efs.includes("morte")) return "pior";
  if (efs.includes("marco")) return "melhor";
  const abandono = obj(F.abandono) && F.abandono.desfecho;
  if (d.padrao || d.id === abandono) return "meio";
  return "bom";
}

/* a etapa da mão: a que fechou por um ramo e cujo `conclui` toca o papel da
   mão; senão a última que fechou por um ramo */
function etapaDaMao(F, R) {
  const feitas = obj(R.feitas) || {};
  const comRamo = arr(F.etapas).filter((e) => obj(feitas[e.id]) && typeof feitas[e.id].ramo === "string");
  const extra = Object.keys(feitas).filter((k) => obj(feitas[k]) && typeof feitas[k].ramo === "string" && !comRamo.some((e) => e.id === k)).map((k) => ({ id: k }));
  const todas = [...comRamo, ...extra];
  if (!todas.length) return null;
  const papel = obj(F.mao) && F.mao.papel;
  const daMao = papel ? comRamo.find((e) => JSON.stringify(e.conclui || []).includes(`papel:${papel}`)) : null;
  const e = daMao || todas[todas.length - 1];
  return { id: e.id, ramo: feitas[e.id].ramo, etapa: arr(F.etapas).find((x) => x.id === e.id) || null };
}

/* os papéis de lugar de uma ficha, sem os da fraqueza (o sítio da fraqueza
   é do vilão, não um esconderijo de achados) */
const lugaresDe = (F) => Object.entries(obj(F.papeis) || {}).filter(([n, p]) => obj(p) && p.de === "lugar" && !n.startsWith("fraqueza")).map(([n, p]) => ({ nome: n, decl: p }));

/* o papel de lugar de uma etapa: o que o texto dela nomeia («Passar
   {passo}»), senão o primeiro «lugar:X» do `conclui` (que pode ser o do
   caminho alternativo — por isso vem depois) */
function lugarDaEtapa(F, etapa) {
  const lugares = lugaresDe(F);
  if (etapa) {
    for (const m of String(etapa.texto || "").matchAll(/{([a-z0-9_]+)}/g)) { const l = lugares.find((x) => x.nome === m[1]); if (l) return l; }
    const m = JSON.stringify(etapa.conclui || []).match(/lugar:([a-z0-9_]+)/);
    if (m) { const l = lugares.find((x) => x.nome === m[1]); if (l) return l; }
  }
  return lugares[0] || null;
}

/* o tipo do sítio de um papel: o que o contexto diz (função ou mapa), o
   primeiro `tipos` da ficha, o nome do papel (SITIO_DO_PAPEL), ou `ermo` */
function sitioDe(F, R, lugar, tipoDoLugar) {
  if (!lugar) return "ermo";
  const p = obj(obj(R.papeis) && R.papeis[lugar.nome]) || {};
  let dito = null;
  try {
    dito = typeof tipoDoLugar === "function" ? tipoDoLugar(lugar.nome, p) : obj(tipoDoLugar) ? tipoDoLugar[lugar.nome] : null;
  } catch { dito = null; }
  for (const c of [dito, p.sitio, arr(lugar.decl.tipos)[0], SITIO_DO_PAPEL[lugar.nome]]) {
    const k = semAcento(c);
    if (k && ACHADO_DO_SITIO[k]) return k;
    if (k && SITIO_DO_PAPEL[k] && ACHADO_DO_SITIO[SITIO_DO_PAPEL[k]]) return SITIO_DO_PAPEL[k];
  }
  return "ermo";
}

/* o que um achado de caminho dá: moedas (múltiplo da base) ou um consumível */
function darAchado(a, nivel) {
  if (Number.isFinite(a.moedas)) return { moedas: Math.max(1, Math.round(baseDasMoedas(nivel) * a.moedas)) };
  const it = a.consumivel ? itemConsumivel(a.consumivel) : null;
  return it ? { item: it } : { moedas: Math.max(1, Math.round(baseDasMoedas(nivel) * 0.5)) };
}

/* os passivos escritos que agem num estado, sem passar o degrau da peça;
   e o item reescrito com eles — os atributos que vinham dos poderes do
   sorteio saem, e entram os destes (a mesma dobra de loot.js) */
function comOsPassivos(item, ids, quantos) {
  const tier = tierDe(item.raridade);
  const escolhidos = arr(ids).map((id) => PODERES.find((p) => p.id === id)).filter((p) => p && p.tier <= tier && p.slots.includes(item.tipo)).slice(0, quantos);
  const atributos = { ...(item.atributos || {}) };
  for (const p of arr(item.poderes)) {
    for (const [k, v] of Object.entries(p.efeito || {})) if (EFEITOS_DE_ATRIBUTO.includes(k)) atributos[k] = (atributos[k] || 0) - Number(v || 0);
  }
  /* o elemento e a resistência só saem se vieram de um poder que sai — o
     elemento que o sorteio deu à lâmina (35% do raro) é da peça, e fica */
  for (const p of arr(item.poderes)) {
    const e = p.efeito || {};
    if (e.elemento && atributos.elemento === e.elemento) delete atributos.elemento;
    if (e.resist && Array.isArray(atributos.resist)) {
      const fora = Array.isArray(e.resist) ? e.resist : [e.resist];
      atributos.resist = atributos.resist.filter((r) => !fora.includes(r));
      if (!atributos.resist.length) delete atributos.resist;
    }
  }
  for (const p of escolhidos) {
    for (const [k, v] of Object.entries(p.efeito || {})) {
      if (EFEITOS_DE_ATRIBUTO.includes(k)) atributos[k] = (atributos[k] || 0) + Number(v || 0);
      else if (k === "resist") atributos.resist = [...new Set([...(atributos.resist || []), ...(Array.isArray(v) ? v : [v])])];
      else if (k === "elemento") atributos.elemento = v;
    }
  }
  for (const k of Object.keys(atributos)) if (atributos[k] === 0) delete atributos[k];
  const poderes = escolhidos.map((p) => ({ id: p.id, nome: p.nome, efeito: p.efeito, diz: p.diz }));
  return { ...item, atributos, poderes, poder: poderes.map((p) => `✦ ${p.nome} — ${p.diz}`).join(" · ") };
}

/* o nome e a história com os papéis da campanha (o nome que o registo tem;
   sem nome, «alguém» / «um lugar»). O género (TE8): «{quem:dele|dela}» é a
   forma de quem ocupa o papel — a segunda quando é mulher, a primeira quando
   é homem ou não se sabe, a mesma regra de biblioteca-de-quests.js#encher.
   O género vem do papel no registo (`genero`) ou do mapa `generos` que a
   fiação pode passar; sem nenhum, a primeira forma. */
const ehMulher = (g) => /^(f|mulher|femin|ela)/.test(semAcento(g));
function encherComPapeis(modelo, R, generos) {
  const papeis = obj(R.papeis) || {};
  const gs = obj(generos) || {};
  return contrair(String(modelo || "")
    .replace(/\{([a-z0-9_]+):([^|{}]*)\|([^{}]*)\}/g, (m, k, ele, ela) => (ehMulher(gs[k] || (obj(papeis[k]) && papeis[k].genero)) ? ela : ele))
    .replace(/\{([a-z0-9_]+)\}/g, (m, k) => {
      const p = obj(papeis[k]);
      if (p && typeof p.nome === "string" && p.nome) return p.nome;
      return p && p.tipo === "lugar" ? "um lugar" : "alguém";
    })).replace(/(^|[.!?…]\s+)(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase());
}

/* o degrau de um estado, lido no nível em que a peça foi ganha (a coluna
   `degrau` de DESPERTAR_DO_ARTEFACTO); a lembrança é sempre incomum */
const RARIDADE_DA_LEMBRANCA = "incomum";
const degrauDoEstado = (genero, estado, nivelGanho) => (genero === "lembranca" ? RARIDADE_DA_LEMBRANCA
  : tetoDeRaridade(nivelGanho)[(DESPERTAR_DO_ARTEFACTO[estado] || DESPERTAR_DO_ARTEFACTO.adormecido).degrau] || tetoDeRaridade(nivelGanho).daQuest);

/* A peça com nome, no estado que se pede, no degrau desse estado. */
function pecaComNome(F, R, def, { nivel, semente, heroi, estado = "adormecido", generos }) {
  const tipo = def.tipo;
  const daMao = obj(obj(heroi) && heroi.equipados) && obj(heroi.equipados[tipo]) ? heroi.equipados[tipo].base : null;
  const base = def.base || daMao || (tipo === "arma" ? (KIT_INICIAL[obj(heroi) && heroi.classe] || {}).arma : null) || null;
  const raridade = degrauDoEstado(def.genero, estado, nivel);
  const cru = gerarLoot(raridade, { tipo, nivel: nivelDe(nivel), base, rnd: dado(semente, F.id, "artefacto") });
  const st = DESPERTAR_DO_ARTEFACTO[estado] || DESPERTAR_DO_ARTEFACTO.adormecido;
  const comPoder = comOsPassivos(cru, def.passivos, st.passivos);
  const historia = encherComPapeis(def.historia, R, generos);
  return {
    ...comPoder,
    nome: encherComPapeis(def.nome, R, generos),
    descricao: historia,
    sintoniza: true,
    deQuest: F.id,
    artefacto: {
      id: F.id, genero: def.genero, estado, nivel: nivelDe(nivel),
      passivos: [...arr(def.passivos)],
      ...(def.gesto ? { gesto: { nome: def.gesto.nome, diz: def.gesto.diz, efeito: JSON.parse(JSON.stringify(def.gesto.efeito)) } } : {}),
    },
    ...(st.gesto && def.gesto ? { ativo: { id: F.id, nome: def.gesto.nome, diz: def.gesto.diz } } : {}),
  };
}

/* O que a campanha já levou, contado das pagas anteriores. */
function contar(campanha) {
  const c = obj(campanha) || {};
  const pagas = arr(c.pagas).filter(obj);
  const itens = pagas.flatMap((p) => arr(p.itens).filter(obj));
  const doHeroi = Object.values(obj(obj(c.heroi) && c.heroi.equipados) || {}).filter(obj);
  return {
    raros: itens.filter((i) => tierDe(i.raridade) >= TIER.raro && i.raridade !== "unico" && !(obj(i.artefacto))).length,
    artefactos: itens.filter((i) => obj(i.artefacto) && i.artefacto.genero === "artefacto").length,
    lembrancas: itens.filter((i) => obj(i.artefacto) && i.artefacto.genero === "lembranca").length,
    reliquias: [...itens, ...doHeroi].filter((i) => i.raridade === "unico").map((i) => i.nome),
    nomeados: new Set(itens.filter((i) => obj(i.artefacto) && typeof i.artefacto.id === "string").map((i) => i.artefacto.id)),
    /* o confronto já pagou (a paga guardada leva `confronto`): a reserva cai */
    confrontoPago: pagas.some((p) => p.confronto === true),
  };
}

/* ============================================================
   3. A PAGA DA QUEST — pagaDaQuest(ficha, registo, opcoes)
   `opcoes`: { semente, nivel, heroi, campanha: { atos, pagas }, tipoDoLugar,
   generos } — `generos` (TE8): { papel: "f"|"m" }, o género de quem ocupa
   um papel, para a concordância da peça com nome (o registo também o diz).
   → null enquanto a quest está aberta (ou lixo); senão a paga:
     { chave, quest, tipo, estado, temperatura, familia, grau,
       xp, moedas, itens: [item], efeitos: [{ tipo: "favor", papel }],
       achados: [achado] }
   Cada item leva `deQuest`. A chave vai para `aplicadas`: a mesma quest
   nunca paga duas vezes. Não muta nada do que recebe.
   ============================================================ */
export function pagaDaQuest(ficha, registo, opcoes) {
  const F = fichaValida(ficha);
  const R = obj(registo);
  if (!F || !R || R.id !== F.id) return null;
  if (!["concluida", "falhada", "terminada"].includes(R.estado)) return null;
  const op = obj(opcoes) || {};
  const nivel = nivelDe(op.nivel);
  const semente = op.semente == null ? "" : String(op.semente);
  const heroi = obj(op.heroi);
  const campanha = obj(op.campanha) || {};
  const ja = contar({ ...campanha, heroi });
  const paga = { chave: `espolio:${F.id}`, quest: F.id, tipo: F.tipo, estado: R.estado, temperatura: F.temperatura || "brasa",
    familia: null, grau: null, xp: 0, moedas: 0, itens: [], efeitos: [], achados: [] };

  /* o coração: XP pelo grau, e a lembrança na metade boa */
  if (F.tipo === 2) {
    const grau = grauDoDesfecho(F, R.desfecho) || "pior";
    const P = PAGA_DO_CORACAO[grau];
    paga.grau = grau;
    paga.xp = xpDaFracao(P.xp, nivel);
    const def = ARTEFACTOS_COM_NOME[F.id];
    if (P.lembranca && def && def.genero === "lembranca" && ja.lembrancas < ORCAMENTO_DO_ESPOLIO.lembrancas && !ja.nomeados.has(F.id)) {
      paga.itens.push(pecaComNome(F, R, def, { nivel, semente, heroi, generos: op.generos }));
    }
    return paga;
  }

  /* o enredo que falhou: o XP da falha e mais nada */
  if (R.estado !== "concluida") {
    paga.xp = xpDaFracao(PAGA_DA_QUEST[PAGA_DA_QUEST.falha].xp, nivel);
    return paga;
  }

  const P = PAGA_DA_QUEST[paga.temperatura] || PAGA_DA_QUEST.brasa;
  const mao = etapaDaMao(F, R);
  const familia = mao ? familiaDoRamo(mao.ramo) : "saber";
  const Rf = RECOMPENSA_DA_FAMILIA[familia];
  paga.familia = familia;
  paga.xp = xpDaFracao(P.xp * Rf.xp, nivel);
  paga.moedas = Math.min(tetoDoPresente(nivel), Math.round(baseDasMoedas(nivel) * P.moedas * Rf.moedas));

  /* a peça: o artefacto com nome, se a ficha o tem e o orçamento deixa; senão
     a peça da família, no degrau da temperatura, no teto do nível e do
     orçamento de raras */
  const def = ARTEFACTOS_COM_NOME[F.id];
  const ehConfronto = !!(obj(F.mao) && F.mao.tipo === RELIQUIA_DO_CONFRONTO.mao);
  const reserva = ehConfronto || ja.confrontoPago ? 0 : ORCAMENTO_DO_ESPOLIO.reservaDoConfronto;
  if (def && def.genero === "artefacto" && ja.artefactos < ORCAMENTO_DO_ESPOLIO.artefactos - reserva && !ja.nomeados.has(F.id)) {
    paga.itens.push(pecaComNome(F, R, def, { nivel, semente, heroi, generos: op.generos }));
  } else if (P.item && Rf.slots) {
    const atos = Math.max(1, Math.floor(Number(campanha.atos) || ORCAMENTO_DO_ESPOLIO.atosPadrao));
    const tetoDeRaras = Math.ceil(atos * ORCAMENTO_DO_ESPOLIO.rarosPorAto);
    let raridade = noTeto(P.item, nivel);
    if (tierDe(raridade) >= TIER.raro && ja.raros >= tetoDeRaras) raridade = "incomum";
    const eq = obj(heroi && heroi.equipados) || {};
    const kit = KIT_INICIAL[heroi && heroi.classe] || {};
    const slots = Rf.slots.filter((s) => s === "arma" || (s === "armadura" && (eq.armadura || kit.armadura || !heroi)) || (s === "escudo" && eq.escudo) || !["arma", "armadura", "escudo"].includes(s));
    const r = dado(semente, F.id, "item");
    const slot = slots[Math.floor(r() * slots.length)] || Rf.slots[0];
    const base = obj(eq[slot]) && eq[slot].base ? eq[slot].base : slot === "arma" ? kit.arma || null : slot === "armadura" ? kit.armadura || null : null;
    paga.itens.push({ ...gerarLoot(raridade, { tipo: slot, nivel, base, rnd: r }), deQuest: F.id });
  }
  if (Rf.consumivel) {
    const it = itemConsumivel(Rf.consumivel[paga.temperatura]);
    if (it) paga.itens.push({ ...it, deQuest: F.id });
  }
  if (Rf.favor) {
    const l = lugarDaEtapa(F, mao && mao.etapa);
    if (l) paga.efeitos.push({ tipo: "favor", papel: l.nome });
  }
  if (Rf.achadoExtra > 0 && mao) {
    paga.achados.push(...achadosDaEtapa(F, R, mao.id, { ...op, extra: true }).slice(0, Rf.achadoExtra));
  }

  /* a relíquia: só no confronto final concluído, uma em cinco, uma por campanha */
  if (obj(F.mao) && F.mao.tipo === RELIQUIA_DO_CONFRONTO.mao && ja.reliquias.length < RELIQUIA_DO_CONFRONTO.porCampanha) {
    const r = dado(semente, F.id, "reliquia");
    if (r() < RELIQUIA_DO_CONFRONTO.chance) {
      const livres = RELIQUIAS.filter((x) => !ja.reliquias.includes(x.nome));
      const rel = livres.length ? livres[Math.floor(r() * livres.length)] : null;
      if (rel) paga.itens.push({ ...itemDaReliquia(rel, { nivel }), deQuest: F.id });
    }
  }
  return paga;
}

/* ============================================================
   4. OS ACHADOS
   ============================================================ */

/* achadosDaEtapa(ficha, registo, etapaId, { semente, nivel, tipoDoLugar })
   → [] | [achado] — o achado da etapa que FECHOU por um ramo (escolher
   bem), do sítio onde ela se passou. No máximo ORCAMENTO.achadosPorEtapa.
   `achado`: { id, quest, etapa, sitio, diz, moedas? , item? }. */
export function achadosDaEtapa(ficha, registo, etapaId, opcoes) {
  const F = fichaValida(ficha);
  const R = obj(registo);
  if (!F || !R || R.id !== F.id || typeof etapaId !== "string") return [];
  const feita = obj(obj(R.feitas) && R.feitas[etapaId]);
  if (!feita || typeof feita.ramo !== "string") return [];
  const op = obj(opcoes) || {};
  const etapa = arr(F.etapas).find((e) => e.id === etapaId) || null;
  const sitio = sitioDe(F, R, lugarDaEtapa(F, etapa), op.tipoDoLugar);
  const lista = ACHADO_DO_SITIO[sitio].caminho;
  const qual = op.extra === true ? "extra" : "caminho";
  const r = dado(op.semente, F.id, etapaId, qual);
  const a = lista[Math.floor(r() * lista.length)];
  return [{ id: `${F.id}:${etapaId}:${a.id}${qual === "extra" ? ":extra" : ""}`, quest: F.id, etapa: etapaId, sitio, diz: a.diz, ...darAchado(a, op.nivel) }].slice(0, ORCAMENTO_DO_ESPOLIO.achadosPorEtapa);
}

/* achadoEscondido(ficha, registo, { semente, nivel, estado, mundo, tipoDoLugar })
   → null (a ficha não tem sítio onde esconder, ou lixo) | {
       achado: { id, quest, sitio, diz, item? | moedas? },
       onde: o papel do sítio, como: "esteve" | "descobriu",
       aberto: a quest ainda está aberta (decisão da pessoa: espera até fechar),
       achou: o herói esteve (ou descobriu) lá — pelo livro de factos —,
       levado: já está em `registo.espolio.achados` }
   O sítio: o primeiro lugar opcional da ficha (o que tem `vizinho`: o desvio,
   a toca, o registo das pegadas), e então basta lá estar; sem opcional, o
   primeiro lugar da ficha, e aí é preciso DESCOBRIR o que ele esconde. */
export function achadoEscondido(ficha, registo, opcoes) {
  const F = fichaValida(ficha);
  const R = obj(registo);
  if (!F || !R || R.id !== F.id) return null;
  const lugares = lugaresDe(F);
  const opcional = lugares.find((l) => l.decl.vizinho);
  const lugar = opcional || lugares[0];
  if (!lugar) return null;
  const op = obj(opcoes) || {};
  const nivel = nivelDe(op.nivel);
  const sitio = sitioDe(F, R, lugar, op.tipoDoLugar);
  const e = ACHADO_DO_SITIO[sitio].escondido;
  const id = `${F.id}:escondido:${e.id}`;
  let dar;
  if (e.equipamento) {
    const P = PAGA_DA_QUEST[F.temperatura] || PAGA_DA_QUEST.brasa;
    const raridade = noTeto(raridadeDoTier(Math.max(0, tierDe(P.item || "comum") - 1)), nivel);
    dar = { item: { ...gerarLoot(raridade, { tipo: e.equipamento, nivel, rnd: dado(op.semente, F.id, "escondido") }), deQuest: F.id } };
  } else dar = darAchado(e, nivel);
  const como = opcional ? "esteve" : "descobriu";
  const aberto = R.estado === "aberta";
  const p = obj(obj(R.papeis) && R.papeis[lugar.nome]) || {};
  const achou = aberto && avaliarCondicao([como, `lugar:${lugar.nome}`], { estado: obj(op.estado) || {}, papeis: { [lugar.nome]: { ...p, tipo: "lugar" } }, mundo: obj(op.mundo) });
  const levado = arr(obj(R.espolio) && R.espolio.achados).includes(id);
  return { achado: { id, quest: F.id, sitio, diz: e.diz, ...dar }, onde: lugar.nome, como, aberto, achou: !!achou, levado };
}

/* ============================================================
   5. O ARTEFACTO QUE CRESCE — despertarArtefacto(item, contexto)
   `contexto`: { nivel, quests: [{ temperatura, estado, depois }], confronto }
   — `quests`: as quests concluídas DEPOIS de o artefacto ser ganho (a
   fiação conta-as pelo dia); `confronto`: o confronto final concluído.
   → o item no estado novo (passivos e gesto refeitos), o MESMO item quando
   nada muda, ou null quando não é artefacto. Nunca desce de estado.
   ============================================================ */
export function despertarArtefacto(item, contexto) {
  const it = obj(item);
  const a = it && obj(it.artefacto);
  if (!a || typeof a.id !== "string") return null;
  const k = obj(contexto) || {};
  const ordem = DESPERTAR_DO_ARTEFACTO.ordem;
  const subiu = nivelDe(k.nivel) - nivelDe(a.nivel);
  const D = DESPERTAR_DO_ARTEFACTO.desperto.quando;
  const X = DESPERTAR_DO_ARTEFACTO.exaltado.quando;
  const quentes = arr(k.quests).filter((q) => obj(q) && q.estado === "concluida" && D.temperaturas.includes(q.temperatura)).length;
  let alvo = "adormecido";
  if (quentes >= D.quests || subiu >= D.niveis) alvo = "desperto";
  if ((X.confronto && k.confronto === true) || subiu >= X.niveis) alvo = "exaltado";
  const atual = ordem.includes(a.estado) ? a.estado : "adormecido";
  if (ordem.indexOf(alvo) <= ordem.indexOf(atual)) return item;
  const st = DESPERTAR_DO_ARTEFACTO[alvo];
  /* o degrau do estado novo (TE8): a peça ACENDE o degrau desse estado —
     os poderes que ele compra (DEGRAUS, afixos.js: o épico «faz duas, e uma
     delas pesa») —, e o aço fica o do dia em que foi ganha. Não se reforja:
     a régua mediu as duas maneiras no nível 12 (o Guerreiro, 300 mesas), e a
     peça refeita no épico punha a Aurora a +15 pontos (71%) e a Clériga a
     +19, acima da lei; acesa, +7 e +10. Até ao 10 o degrau é o mesmo e só
     acendem os passivos. */
  const genero = a.genero === "lembranca" ? "lembranca" : "artefacto";
  const novoDegrau = degrauDoEstado(genero, alvo, a.nivel);
  const refeita = tierDe(novoDegrau) > tierDe(it.raridade) ? { ...it, raridade: novoDegrau } : it;
  const novo = comOsPassivos(refeita, a.passivos, st.passivos);
  return {
    ...novo,
    artefacto: { ...a, estado: alvo },
    ...(st.gesto && a.gesto ? { ativo: { id: a.id, nome: a.gesto.nome, diz: a.gesto.diz } } : {}),
  };
}

/* ============================================================
   5b. O QUE O ARTEFACTO AINDA PROMETE — promessaDoArtefacto(item, nivel)
   (TE10-1, 09/11, pedido do `desenho`: o veredito e a cerimónia do
   despertar mostram quando a peça acorda e o que acorda nela, e a tela não
   soma níveis nem lê PODERES à mão — regra na tela é número fora de tabela.)
   `nivel`: o do herói agora (para `faltamNiveis`).
   → null para o que não é artefacto (ou lixo); senão {
       genero, estado,
       proximo: "desperto" | "exaltado" | null   (a lembrança e o exaltado: null),
       nivelQueAcorda: o nível em que o próximo estado chega sozinho (o da
         peça ganha + DESPERTAR_DO_ARTEFACTO[proximo].quando.niveis), ou null
         (sem próximo, ou para lá do nível 20),
       faltamNiveis: quanto falta até lá (0: acorda no fim deste turno), ou null,
       porProva: { quests, temperaturas } — a quest à altura concluída que
         também o acorda —, ou null,
       porConfronto: o confronto final concluído também o acorda,
       poderes: [{ id, nome, diz, aceso, acordaEm }] — só os passivos que esta
         peça pode de facto acender (o degrau e o encaixe, a régua de
         comOsPassivos), pela ordem em que acordam,
       gesto: { nome, diz, aceso, acordaEm } | null }
   Tudo de DESPERTAR_DO_ARTEFACTO, PODERES e `item.artefacto`. Nada no save.
   ============================================================ */
export function promessaDoArtefacto(item, nivel) {
  const it = obj(item);
  const a = it && obj(it.artefacto);
  if (!a || typeof a.id !== "string") return null;
  const D = DESPERTAR_DO_ARTEFACTO;
  const ordem = D.ordem;
  const estado = ordem.includes(a.estado) ? a.estado : ordem[0];
  const genero = a.genero === "lembranca" ? "lembranca" : "artefacto";
  const i = ordem.indexOf(estado);
  const proximo = genero === "lembranca" || i >= ordem.length - 1 ? null : ordem[i + 1];
  const q = proximo ? obj(D[proximo].quando) || {} : {};
  const alvo = Number.isFinite(q.niveis) ? nivelDe(a.nivel) + q.niveis : null;
  /* para lá da escala de níveis (a de nivelDe) não acorda por nível */
  const nivelQueAcorda = alvo != null && nivelDe(alvo) === alvo ? alvo : null;
  const acordaEm = (cond) => (genero === "lembranca" ? (cond(D[ordem[0]]) ? ordem[0] : null) : ordem.find((e) => cond(D[e])) || null);
  /* TE8: o que acende em cada estado é o que o DEGRAU desse estado deixa (a
     peça que desperta para o teto pode acender um passivo que a adormecida
     não podia). O degrau de um estado que já passou é o da peça; o de um
     que vem é o maior entre o da peça e o do estado (degrauDoEstado) — a
     mesma conta de despertarArtefacto, e por isso a promessa é a verdade. */
  const tierDe2 = (e) => (ordem.indexOf(e) <= i ? tierDe(it.raridade) : Math.max(tierDe(it.raridade), tierDe(degrauDoEstado(genero, e, a.nivel))));
  const estadosDaPeca = genero === "lembranca" ? [ordem[0]] : ordem;
  const acesosEm = (e) => arr(a.passivos).map((id) => PODERES.find((p) => p.id === id))
    .filter((p) => p && p.tier <= tierDe2(e) && arr(p.slots).includes(it.tipo)).slice(0, D[e].passivos).map((p) => p.id);
  const porEstado = Object.fromEntries(estadosDaPeca.map((e) => [e, acesosEm(e)]));
  const algumaVez = arr(a.passivos).filter((id, k, l) => l.indexOf(id) === k && estadosDaPeca.some((e) => porEstado[e].includes(id)));
  const acesosAgora = genero === "lembranca" ? porEstado[ordem[0]] : porEstado[estado];
  const g = obj(a.gesto);
  return {
    genero, estado, proximo, nivelQueAcorda,
    faltamNiveis: nivelQueAcorda != null ? Math.max(0, nivelQueAcorda - nivelDe(nivel)) : null,
    porProva: proximo && Number.isFinite(q.quests) && q.quests > 0 ? { quests: q.quests, temperaturas: [...arr(q.temperaturas)] } : null,
    porConfronto: !!(proximo && q.confronto),
    poderes: algumaVez.map((id) => PODERES.find((p) => p.id === id)).map((p) => ({ id: p.id, nome: p.nome, diz: p.diz, aceso: acesosAgora.includes(p.id), acordaEm: estadosDaPeca.find((e) => porEstado[e].includes(p.id)) || null })),
    gesto: g && typeof g.nome === "string" ? { nome: g.nome, diz: typeof g.diz === "string" ? g.diz : "", aceso: !!D[estado].gesto, acordaEm: acordaEm((st) => !!st.gesto) } : null,
  };
}

/* ============================================================
   6. O MOMENTO — revelacaoDoEspolio(paga, heroi, { emCombate })
   O que é do SISTEMA no fecho (a carta que vira é da tela, TE10): a ORDEM —
   as moedas, o XP, os itens por raridade crescente, a peça com nome por
   último —, e por cada peça a comparação com o que está no encaixe
   (`compararItem`), se pode equipar já e o rótulo do botão
   («Equipar · CA 15→16», `rotuloDoEquipar`), e o outro lado (TE10-2):
   `sai` (o que sai do encaixe, ou null) e `troca` (fraseDaTroca).
   → [] para lixo; senão [{ tipo: "moedas"|"xp"|"favor"|"achado"|"item", … }].
   ============================================================ */
export function revelacaoDoEspolio(paga, heroi, opcoes) {
  const p = obj(paga);
  if (!p) return [];
  const emCombate = !!(obj(opcoes) && opcoes.emCombate);
  const h = obj(heroi) || {};
  const out = [];
  if (p.moedas > 0) out.push({ tipo: "moedas", n: p.moedas });
  if (p.xp > 0) out.push({ tipo: "xp", n: p.xp });
  for (const e of arr(p.efeitos)) if (obj(e) && e.tipo === "favor") out.push({ tipo: "favor", papel: e.papel });
  for (const a of arr(p.achados)) if (obj(a)) out.push({ tipo: "achado", achado: a });
  const peso = (i) => (obj(i.artefacto) || i.raridade === "unico" ? 99 : tierDe(i.raridade));
  const itens = arr(p.itens).filter(obj).map((item, i) => ({ item, i })).sort((a, b) => peso(a.item) - peso(b.item) || a.i - b.i);
  for (const { item } of itens) {
    const slot = encaixeDoItem(item);
    if (!slot) { out.push({ tipo: "item", item, slot: null, linhas: [], podeEquipar: false, rotulo: "", sai: null, troca: "" }); continue; }
    const c = compararItem(h, item, slot, { emCombate });
    /* TE10-2 (09/11, pedido do `desenho`): o outro lado da troca — o que sai
       do corpo ao equipar já (o nome do que está no encaixe, ou null) e o
       tempo da troca em palavras. O veredito antes do clique mostra os dois
       lados; compararItem já os sabia, e a revelação deitava-os fora. */
    out.push({ tipo: "item", item, slot, linhas: c.linhas, dorme: c.dorme, podeEquipar: !!(c.troca && c.troca.ok), motivo: c.troca && !c.troca.ok ? c.troca.motivo : "", rotulo: rotuloDoEquipar(c.linhas),
      sai: obj(c.atual) && typeof c.atual.nome === "string" && c.atual.nome ? c.atual.nome : null, troca: fraseDaTroca(slot) });
  }
  return out;
}

/* ============================================================
   7. A PAUTA — espolioNaPauta(paga | [achado])
   → null quando não há nada; senão { linha, naoPode }: a linha da secção
   `momento` (teto LINHA_DO_ESPOLIO.teto), só no turno em que acontece, e o
   veto que vai para `naoPode`. Peça com nome leva meia linha da história.
   ============================================================ */
export function espolioNaPauta(coisa) {
  const corta = (s) => (s.length <= LINHA_DO_ESPOLIO.teto ? s : s.slice(0, LINHA_DO_ESPOLIO.teto - 1).trimEnd() + "…");
  if (Array.isArray(coisa)) {
    const partes = coisa.filter(obj).map((a) => (obj(a.item) ? `${a.item.nome} (${a.diz})` : Number.isFinite(a.moedas) ? `${a.moedas} moedas (${a.diz})` : "")).filter(Boolean);
    return partes.length ? { linha: corta(LINHA_DO_ESPOLIO.achou + partes.join("; ")), naoPode: LINHA_DO_ESPOLIO.naoPode } : null;
  }
  const p = obj(coisa);
  if (!p) return null;
  const partes = [];
  const nomeado = arr(p.itens).find((i) => obj(i) && (obj(i.artefacto) || i.raridade === "unico"));
  if (nomeado) {
    const meia = String(nomeado.descricao || "").split(/(?<=[.!?…])\s/)[0].replace(/[.!?…]+$/, "");
    partes.push(meia ? `${nomeado.nome} — ${meia}` : nomeado.nome);
  }
  for (const i of arr(p.itens)) if (obj(i) && i !== nomeado && i.nome) partes.push(i.nome);
  if (p.moedas > 0) partes.push(`${p.moedas} moedas`);
  for (const a of arr(p.achados)) if (obj(a)) partes.push(obj(a.item) ? a.item.nome : `${a.moedas} moedas`);
  if (!partes.length) return null;
  return { linha: corta(LINHA_DO_ESPOLIO.abre + partes.join(", ")), naoPode: LINHA_DO_ESPOLIO.naoPode };
}
