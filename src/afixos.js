/* ============================================================
   O QUE A RARIDADE COMPRA (v9.80) — item lendário tem de ser lendário

   Dois relatos, e eles são o mesmo defeito visto de dois lados:

     "Apareceu no mercado uma bota lendária de asas, e a raridade dela
     era comum."

     "Os itens não têm efeitos, apenas atributos. Um item lendário não é
     lendário se o atributo é o mesmo de um item comum. Se um item dá
     apenas atributo, não faz diferença qual item eu uso."

   ------------------------------------------------------------
   1. O NOME MENTIA PORQUE HAVIA DUAS FONTES SOLTAS

   O nome de um item se montava de três pedaços — prefixo, base, sufixo
   — e NENHUM dos três olhava a raridade a não ser pela contagem. A
   lista de prefixos tinha "Lendário" ao lado de "Rústico", sorteados
   com o mesmo peso; e a lista de bases tinha "Botas Aladas" ao lado de
   "Botas de Couro", também com o mesmo peso. Um item comum podia sair
   "Botas Aladas Lendárias" — com defesa 1 e nada mais.

   O jogador não tem como saber que o nome é decorativo. Ele lê "alada"
   e "lendária" e espera asas e lenda; recebe um pedaço de couro. E o
   pior: depois disso, todo nome bonito do jogo perde o crédito.

   Aqui o nome PROMETE o que o item cumpre. Prefixo tem peso, base tem
   degrau mínimo, e nenhum dos dois aparece abaixo do seu.

   ------------------------------------------------------------
   2. E A RARIDADE NÃO COMPRAVA NADA ALÉM DE NÚMERO

   O item tinha um campo `poder`, e ele era TEXTO. "Brilha quando
   perigo se aproxima", "Nunca perde o fio" — frases bonitas, lidas por
   ninguém: nenhuma linha de código consultava aquele campo. O que
   valia mecanicamente era só `atributos`, e atributo é a mesma coisa em
   qualquer raridade, só que maior.

   O resultado é exatamente o que o relato diz: escolher item vira
   escolher número, e escolher número não é escolher.

   Agora cada degrau COMPRA alguma coisa, e o que ele compra é lido pelo
   jogo:

     comum     — o número, e só. É o aço honesto, e ele tem de existir:
                 sem um piso sem graça, não há degrau nenhum acima.
     incomum   — um traço menor, situacional (resistência, passo
                 silencioso, um ponto numa perícia).
     raro      — um PODER de verdade, dos que mudam uma rolagem.
     épico     — dois poderes, e um deles pesado.
     lendário  — dois poderes E UMA CONCESSÃO: o item põe uma habilidade
                 na sua mão e ela não custa PM. É a bota alada que dá
                 Voo — o exemplo do próprio relato.

   ------------------------------------------------------------
   O TRUQUE QUE FAZ ISSO CABER: os efeitos falam a MESMA LÍNGUA das
   dádivas (`danoExtra`, `ataqueExtra`, `descontoPM`, `criticoEm`,
   `movimento`, `rerroll`, `defesa`, `bonusSocial`…). Não é economia de
   digitação: é que os leitores dessas dádivas já existem e já são
   chamados de dentro do combate, do movimento e das rolagens. Inventar
   um vocabulário próprio para item significaria escrever um segundo
   conjunto de leitores — e esta casa já sabe o que acontece quando a
   mesma pergunta tem duas réguas.
   ============================================================ */

export const TIER = { comum: 0, incomum: 1, raro: 2, epico: 3, lendario: 4, unico: 5 };

/* ---------------- O QUE CADA DEGRAU COMPRA ---------------- */
export const DEGRAUS = [
  { id: "comum", tier: 0, quantos: 0, forte: false, diz: "aço honesto — o número é tudo o que ele tem" },
  { id: "incomum", tier: 1, quantos: 1, forte: false, diz: "tem um jeito próprio de servir" },
  { id: "raro", tier: 2, quantos: 1, forte: true, diz: "faz uma coisa que muda a conta" },
  { id: "epico", tier: 3, quantos: 2, forte: true, diz: "faz duas, e uma delas pesa" },
  { id: "lendario", tier: 4, quantos: 2, forte: true, concede: true, diz: "faz duas, e ainda põe um poder na sua mão" },
  /* v9.82: o ÚNICO não é sorteado — é escrito. Ele não passa por
     `gerarLoot`: vem de `relicas.js`, com nome próprio, história própria,
     passivos próprios que não existem em item nenhum, e um GESTO — uma vez
     por dia, o portador faz alguma coisa com ele. É a diferença entre
     carregar poder e usar poder. */
  { id: "unico", tier: 5, quantos: 0, forte: true, concede: true, escrito: true, diz: "tem nome, história e um gesto que só ela faz" },
];

export function degrauDe(raridade) {
  return DEGRAUS.find((d) => d.id === raridade) || DEGRAUS[0];
}

/* ============================================================
   O PESO DE CADA PREFIXO

   "Rústico" e "Lendário" não podem ser sorteados com o mesmo peso. O
   número é o degrau MÍNIMO em que a palavra pode aparecer, e a régua é
   simples: quanto mais a palavra promete, mais alto ela mora.
   ============================================================ */
export const PESO_DO_PREFIXO = {
  "Rústico": 0, "Pesado": 0, "Leve": 0, "Antigo": 0, "Elegante": 0, "Silencioso": 0,
  "Afiadíssimo": 1, "Feroz": 1, "Sombrio": 1, "Dourado": 1, "Prateado": 1, "Sangrento": 1,
  "Élfico": 1, "Anão": 1, "Orc": 1, "Perdido": 1,
  "Gélido": 2, "Flamejante": 2, "Tempestuoso": 2, "Rúnico": 2, "Abençoado": 2, "Amaldiçoado": 2,
  "Radiante": 3, "Real": 3, "Dracônico": 3, "Sagrado": 3, "Profano": 3,
  "Celestial": 4, "Abissal": 4, "Lendário": 4,
};

export function pesoDoPrefixo(par) {
  const m = Array.isArray(par) ? par[0] : par;
  return PESO_DO_PREFIXO[m] ?? 1;
}

/* ============================================================
   O DEGRAU MÍNIMO DE UMA BASE

   Nem todo nome de base é neutro. "Botas de Couro" não promete nada;
   "Botas Aladas" promete asas. O que o nome da BASE promete tem de ser
   pago pela raridade, ou o item nasce mentindo antes de qualquer
   prefixo entrar.
   ============================================================ */
export const TIER_DA_BASE = {
  /* prometem magia ou linhagem */
  "Botas Aladas": 3,
  "Armadura de Couro de Dragão": 3,
  "Aegis de Bronze": 3,
  "Coroa de Guerra": 3,
  "Manto Encantado": 2,
  "Hábito Rúnico": 2,
  "Varinha Rúnica": 2,
  "Tiara Arcana": 2,
  "Escudo Estrelado": 2,
  "Orbe de Batalha": 2,
  "Máscara Ritual": 2,
  "Escudo Cerimonial": 1,
  "Botas Silenciosas": 1,
  "Carapaça de Quitina": 1,
  "Couraça Antiga": 1,
  "Anel de Rubi": 1, "Anel de Safira": 1, "Anel de Jade": 1, "Anel Gêmeo": 1,
  "Anel de Obsidiana": 2, "Anel Serpente": 1,
  "Pérola Negra": 2, "Estrela de Prata": 2, "Medalhão Antigo": 1, "Relicário Pequeno": 1,
  "Olho de Vidro": 1, "Dente de Serpente": 1,
};

export function tierDaBase(nome) { return TIER_DA_BASE[nome] ?? 0; }

/* ============================================================
   OS PODERES DE VERDADE

   `efeito` fala a língua das dádivas de propósito — os leitores dela
   (`danoExtraDeDadiva`, `ataquesExtras`, `descontoDePM`, `criticoMinimo`,
   `dobraMovimento`, `refazeresDeDadiva`…) já são chamados de dentro do
   combate e das rolagens. Um vocabulário próprio para item obrigaria a
   escrever um segundo conjunto de leitores, e esta casa já sabe onde
   isso termina.

   `forte` marca o que só pode aparecer em raro para cima: é o que
   separa "um jeito próprio de servir" de "muda a conta".
   ============================================================ */
export const PODERES = [
  /* ================= ARMA — o gume ================= */
  { id: "gume_eterno", nome: "Gume Eterno", slots: ["arma"], tier: 1, efeito: { danoExtra: 1 }, diz: "Nunca perde o fio, nem depois de osso." },
  { id: "peso_certo", nome: "Peso Certo", slots: ["arma", "escudo"], tier: 1, efeito: { defesa: 1 }, diz: "Equilibrada a ponto de defender enquanto ataca." },
  { id: "empunhadura", nome: "Empunhadura Justa", slots: ["arma"], tier: 1, efeito: { forca: 1 }, diz: "O cabo assenta na mão como se tivesse sido moldado nela." },
  { id: "mao_leve", nome: "Mão Leve", slots: ["arma"], tier: 1, efeito: { destreza: 1 }, diz: "Pesa menos do que o tamanho promete." },
  { id: "sede", nome: "Sede", slots: ["arma"], tier: 2, forte: true, efeito: { danoExtra: 2 }, diz: "A lâmina bebe: cada golpe abre mais do que deveria." },
  { id: "veia", nome: "Caça-Veias", slots: ["arma"], tier: 2, forte: true, efeito: { criticoEm: 19 }, diz: "Ela encontra a fresta sozinha — crítico já no 19." },
  { id: "canaliza", nome: "Canal Arcano", slots: ["arma"], tier: 2, forte: true, efeito: { descontoPM: 1 }, diz: "A magia passa por ela e sai mais barata." },
  { id: "bote", nome: "Bote", slots: ["arma"], tier: 2, forte: true, efeito: { iniciativa: 3 }, diz: "Ela decide antes de você — a mão já está em movimento." },
  { id: "presteza", nome: "Presteza", slots: ["arma"], tier: 3, forte: true, efeito: { ataqueExtra: 1 }, diz: "A arma puxa a mão de volta antes que o braço decida." },
  { id: "carniceira", nome: "Carniceira", slots: ["arma"], tier: 3, forte: true, efeito: { danoExtra: 4 }, diz: "O que ela abre não fecha sozinho." },
  { id: "ceifa", nome: "Ceifa", slots: ["arma"], tier: 4, forte: true, efeito: { criticoEm: 18, danoExtra: 2 }, diz: "Duas em cada dez vezes, o golpe encontra exatamente onde doer mais." },
  /* elementos — dobram em `atributos.elemento`, que o cálculo de dano lê */
  { id: "brasa", nome: "Brasa", slots: ["arma"], tier: 2, forte: true, efeito: { elemento: "fogo", danoExtra: 1 }, diz: "O aço fica quente quando sai da bainha." },
  { id: "geada", nome: "Geada", slots: ["arma"], tier: 2, forte: true, efeito: { elemento: "gelo", danoExtra: 1 }, diz: "O ar em volta do gume estala de frio." },
  { id: "faisca", nome: "Faísca", slots: ["arma"], tier: 2, forte: true, efeito: { elemento: "raio", danoExtra: 1 }, diz: "Um estalo azul percorre o metal a cada golpe." },
  { id: "peconha", nome: "Peçonha", slots: ["arma"], tier: 2, forte: true, efeito: { elemento: "veneno", danoExtra: 1 }, diz: "O fio sua uma seiva escura que não seca." },
  { id: "aurora", nome: "Aurora", slots: ["arma"], tier: 3, forte: true, efeito: { elemento: "sagrado", danoExtra: 2 }, diz: "A luz que ela solta dói em quem não deveria estar de pé." },
  { id: "umbra", nome: "Umbra", slots: ["arma"], tier: 3, forte: true, efeito: { elemento: "sombrio", danoExtra: 2 }, diz: "A lâmina come a luz em vez de refleti-la." },

  /* ================= ESCUDO E ARMADURA — o couro ================= */
  { id: "fivelas", nome: "Fivelas Fiéis", slots: ["armadura"], tier: 1, efeito: { defesa: 1 }, diz: "As fivelas se fecham sozinhas, e no lugar certo." },
  { id: "forro", nome: "Forro Quente", slots: ["armadura"], tier: 1, efeito: { vigor: 1 }, diz: "Aquece o corpo no frio que mata." },
  { id: "talabarte", nome: "Talabarte Firme", slots: ["escudo"], tier: 1, efeito: { forca: 1 }, diz: "O braço cansa muito depois do que deveria." },
  { id: "couraca", nome: "Couraça", slots: ["armadura", "escudo"], tier: 2, forte: true, efeito: { defesa: 2 }, diz: "O golpe chega e não encontra onde entrar." },
  { id: "folego", nome: "Fôlego de Sobra", slots: ["armadura", "elmo"], tier: 2, forte: true, efeito: { vigor: 2 }, diz: "Quem a veste aguenta um golpe a mais do que deveria." },
  { id: "espinhos", nome: "Espinhos", slots: ["escudo", "armadura"], tier: 2, forte: true, efeito: { danoExtra: 1, defesa: 1 }, diz: "Quem bate nela se machuca um pouco também." },
  { id: "muralha_viva", nome: "Muralha Viva", slots: ["armadura"], tier: 3, forte: true, efeito: { defesa: 3 }, diz: "Não é vestida: é habitada." },
  { id: "reergue", nome: "Segundo Fôlego", slots: ["armadura", "amuleto"], tier: 3, forte: true, efeito: { segundoFolego: 1 }, diz: "Uma vez por descanso, ela te põe de pé quando o corpo já tinha desistido." },
  { id: "inquebravel", nome: "Inquebrável", slots: ["armadura", "escudo"], tier: 4, forte: true, efeito: { defesa: 3, vigor: 2 }, diz: "Sobreviveu a todos os donos anteriores, e vai sobreviver a você." },
  /* resistências — dobram em `atributos.resist`, que `danos.js` já lê */
  { id: "escamas_igneas", nome: "Escamas Ígneas", slots: ["armadura", "escudo"], tier: 2, forte: true, efeito: { resist: "fogo" }, diz: "O fogo lambe e desiste." },
  { id: "casco_gelido", nome: "Casco Gélido", slots: ["armadura", "escudo"], tier: 2, forte: true, efeito: { resist: "gelo" }, diz: "A geada não passa do couro." },
  { id: "aterrado", nome: "Aterrado", slots: ["armadura", "botas"], tier: 2, forte: true, efeito: { resist: "raio" }, diz: "O raio corre por fora e vai para o chão." },
  { id: "filtro", nome: "Filtro", slots: ["elmo", "amuleto"], tier: 2, forte: true, efeito: { resist: "veneno" }, diz: "O ar chega limpo, venha de onde vier." },
  { id: "consagrado", nome: "Consagrado", slots: ["armadura", "amuleto"], tier: 3, forte: true, efeito: { resist: "sombrio" }, diz: "O que vem das trevas encontra uma parede antes da pele." },
  { id: "profanado", nome: "Profanado", slots: ["armadura", "amuleto"], tier: 3, forte: true, efeito: { resist: "sagrado" }, diz: "A luz que julga passa ao largo de quem o veste." },
  { id: "contra_magia", nome: "Contra-Magia", slots: ["armadura", "elmo"], tier: 3, forte: true, efeito: { resist: "arcano" }, diz: "Feitiço bate nela e se desmancha na metade." },

  /* ================= ELMO — a cabeça ================= */
  { id: "vista_clara", nome: "Vista Clara", slots: ["elmo"], tier: 1, efeito: { percepcao: 1 }, diz: "Chuva, fumaça e escuro param de atrapalhar." },
  { id: "viseira", nome: "Viseira Fiel", slots: ["elmo"], tier: 1, efeito: { defesa: 1 }, diz: "Nunca embaça, nunca desce na hora errada." },
  { id: "vontade", nome: "Vontade de Ferro", slots: ["elmo", "amuleto"], tier: 2, forte: true, efeito: { vantagemMental: true }, diz: "Medo e encantamento batem no aço e voltam." },
  { id: "olho_atento", nome: "Olho Atento", slots: ["elmo"], tier: 2, forte: true, efeito: { vantagem: ["percepcao"] }, diz: "Você vê o que estava lá o tempo todo." },
  { id: "sem_medo", nome: "Sem Medo", slots: ["elmo", "amuleto"], tier: 3, forte: true, efeito: { imunidades: ["amedrontado"] }, diz: "O que assusta os outros chega em você como informação." },
  { id: "cabeca_fria", nome: "Cabeça Fria", slots: ["elmo"], tier: 3, forte: true, efeito: { imunidades: ["atordoado"] }, diz: "A pancada ecoa no metal, não no crânio." },
  { id: "coroa_lucida", nome: "Coroa Lúcida", slots: ["elmo"], tier: 4, forte: true, efeito: { imunidades: ["enfeiticado", "amedrontado"], intelecto: 2 }, diz: "Nenhuma vontade que não seja a sua encontra porta aberta." },

  /* ================= BOTAS — o chão ================= */
  { id: "passo_leve", nome: "Passo Leve", slots: ["botas"], tier: 1, efeito: { destreza: 1 }, diz: "Passos que não acordam nem o sono mais leve." },
  { id: "pe_firme", nome: "Pé Firme", slots: ["botas"], tier: 1, efeito: { vigor: 1 }, diz: "Não escorregam em gelo nem em lama." },
  { id: "passo_largo", nome: "Passo Largo", slots: ["botas"], tier: 2, forte: true, efeito: { movimento: 2 }, diz: "O chão difícil deixa de existir, e a distância encolhe." },
  { id: "pisada_muda", nome: "Pisada Muda", slots: ["botas"], tier: 2, forte: true, efeito: { vantagem: ["destreza"] }, diz: "O assoalho velho para de ranger sob você." },
  { id: "sempre_de_pe", nome: "Sempre de Pé", slots: ["botas"], tier: 3, forte: true, efeito: { imunidades: ["caido"] }, diz: "Você pode cair; elas não deixam você ficar no chão." },
  { id: "vento_calcanhares", nome: "Vento nos Calcanhares", slots: ["botas"], tier: 3, forte: true, efeito: { movimento: 2, iniciativa: 2 }, diz: "Você chega onde decidiu antes de terem visto você sair." },

  /* ================= ANEL E AMULETO — o que não se vê ================= */
  { id: "sorte_do_ladrao", nome: "Sorte do Ladrão", slots: ["anel"], tier: 1, efeito: { destreza: 1 }, diz: "Os dedos acham a fechadura antes do olho." },
  { id: "lingua_de_prata", nome: "Língua de Prata", slots: ["anel", "amuleto"], tier: 1, efeito: { bonusSocial: 2 }, diz: "As palavras saem no tom que a outra pessoa queria ouvir." },
  { id: "memoria", nome: "Memória Emprestada", slots: ["anel", "amuleto"], tier: 1, efeito: { intelecto: 1 }, diz: "Você lembra de coisas que jurava não ter aprendido." },
  { id: "porte", nome: "Porte", slots: ["amuleto"], tier: 1, efeito: { presenca: 1 }, diz: "As pessoas param de falar quando você entra." },
  { id: "economia", nome: "Economia", slots: ["anel"], tier: 2, forte: true, efeito: { descontoPM: 1 }, diz: "Toda conjuração sai um ponto mais barata." },
  { id: "fonte", nome: "Fonte", slots: ["anel", "amuleto"], tier: 2, forte: true, efeito: { intelecto: 2 }, diz: "O poder passa por quem o usa com menos esforço." },
  { id: "dedos_finos", nome: "Dedos Finos", slots: ["anel"], tier: 2, forte: true, efeito: { vantagem: ["destreza"], destreza: 1 }, diz: "Nó, laço e tranca são todos a mesma coisa para eles." },
  { id: "voz_que_manda", nome: "Voz que Manda", slots: ["amuleto"], tier: 2, forte: true, efeito: { vantagem: ["presenca"], bonusSocial: 2 }, diz: "Quem ouve leva um instante para lembrar que pode dizer não." },
  { id: "sangue_limpo", nome: "Sangue Limpo", slots: ["anel", "amuleto"], tier: 2, forte: true, efeito: { imunidades: ["envenenado"] }, diz: "O que entra pelo sangue não encontra onde se agarrar." },
  { id: "estanca", nome: "Estanca", slots: ["anel", "amuleto"], tier: 2, forte: true, efeito: { imunidades: ["sangrando"] }, diz: "O corte fecha antes de o chão saber que houve corte." },
  { id: "segunda_chance", nome: "Segunda Chance", slots: ["anel", "amuleto"], tier: 3, forte: true, efeito: { rerroll: 1 }, diz: "Uma vez por descanso, o destino aceita rever o que tinha decidido." },
  { id: "olho_do_saber", nome: "Olho do Saber", slots: ["anel", "amuleto"], tier: 3, forte: true, efeito: { vantagem: ["intelecto"], intelecto: 1 }, diz: "O que está escrito se explica sozinho." },
  { id: "coracao_de_boi", nome: "Coração de Boi", slots: ["amuleto"], tier: 3, forte: true, efeito: { vantagem: ["vigor"], vigor: 2 }, diz: "O cansaço chega, olha para você e vai embora." },
  { id: "mao_do_gigante", nome: "Mão do Gigante", slots: ["anel"], tier: 3, forte: true, efeito: { vantagem: ["forca"], forca: 2 }, diz: "O que não cedia passa a ceder." },
  { id: "duas_vidas", nome: "Duas Vidas", slots: ["amuleto"], tier: 4, forte: true, efeito: { segundoFolego: 1, rerroll: 1 }, diz: "Duas vezes por descanso o mundo aceita voltar atrás — uma no dado, outra no corpo." },
  { id: "coroa_do_verbo", nome: "Coroa do Verbo", slots: ["amuleto"], tier: 4, forte: true, efeito: { bonusSocial: 4, vantagem: ["presenca"], presenca: 2 }, diz: "Ninguém consegue lembrar depois por que concordou." },
];


/* ---------------- QUEM LÊ CADA EFEITO ----------------
   Existe para uma asserção, e é a mais importante desta peça: **todo
   campo de efeito tem de ter um leitor.** O defeito que este arquivo
   veio consertar era exatamente um campo sem leitor — o `poder` de
   texto, bonito e inerte. Um efeito novo escrito aqui sem passar por
   esta tabela nasceria com o mesmo problema, e ninguém notaria: o item
   simplesmente não faria nada.

   Os de ATRIBUTO são dobrados para dentro de `atributos` no gerador,
   onde `bonusEquip` já os soma há versões. Os outros falam a língua
   das dádivas e são lidos pelos leitores delas. */
export const LEITOR_DO_EFEITO = {
  danoExtra: "danoExtraDeDadiva", ataqueExtra: "ataquesExtras", descontoPM: "descontoDePM",
  bonusSocial: "bonusSocialDeDadiva", vantagemMental: "temVantagemMental",
  movimento: "dobraMovimento", rerroll: "refazeresDeDadiva", segundoFolego: "temSegundoFolego",
  criticoEm: "criticoMinimo",
  /* v9.81: os cinco que abriram o arsenal. Com nove campos, dois épicos do
     mesmo slot saíam iguais — e "item lendário tem de ser lendário" não se
     sustenta se todos os lendários forem o mesmo item com outro nome. */
  imunidades: "imuneA", vantagem: "vantagemDeItem", iniciativa: "iniciativaDeItem",
  /* estes dois viram `atributos` do item, e o cálculo de dano já os lê de
     lá desde sempre — `resistenciasEquipadas` e o tipo de dano da arma */
  resist: "atributos.resist", elemento: "atributos.elemento",
  /* dobrados em `atributos` pelo gerador */
  forca: "bonusEquip", destreza: "bonusEquip", vigor: "bonusEquip",
  intelecto: "bonusEquip", presenca: "bonusEquip", percepcao: "bonusEquip", defesa: "bonusEquip",
};

/* Os campos que viram `atributos` do item em vez de efeito de dádiva. */
export const EFEITOS_DE_ATRIBUTO = ["forca", "destreza", "vigor", "intelecto", "presenca", "percepcao", "defesa"];

/* Estes dois não são atributo, mas moram no mesmo lugar: `danos.js` lê
   `atributos.resist` e o tipo elemental direto do item equipado. */
export const EFEITOS_NO_ITEM = ["resist", "elemento"];

export function poderPorId(id) { return PODERES.find((p) => p.id === id) || null; }

/* Os poderes que um item deste slot e deste degrau pode ter. */
export function poderesPossiveis(slot, tier) {
  return PODERES.filter((p) => p.slots.includes(slot) && p.tier <= tier);
}

/* ============================================================
   A CONCESSÃO — o que faz o lendário ser lendário

   "Uma bota lendária de asas que dá a habilidade Voo, e o player pode
   usá-la sem gastar PM."

   É isso, literalmente. O item põe uma habilidade do CATÁLOGO na mão do
   herói, e ela sai de graça. Do catálogo, e não inventada: quem executa
   é o mesmo caminho que executa qualquer habilidade da ficha, com
   alcance, alvo e efeito já escritos. Um poder inventado aqui seria uma
   promessa que nenhum código cumpre — que é exatamente o defeito que
   este arquivo veio consertar.
   ============================================================ */
export const CONCESSOES = {
  botas: ["Voo", "Passo Nebuloso", "Salto Longo"],
  arma: ["Corrente de Relâmpagos", "Nuvem de Adagas", "Escudo Arcano"],
  armadura: ["Escudo Arcano", "Pele de Pedra"],
  escudo: ["Escudo Arcano"],
  elmo: ["Detectar Magia", "Ver o Invisível"],
  anel: ["Invisibilidade", "Passo Nebuloso"],
  amuleto: ["Palavra Curativa", "Escudo Arcano"],
};

/* O nome da base sugere a concessão quando o nome já a promete — "Botas
   Aladas" tem de dar Voo, e não Salto Longo. É a mesma coerência do
   nome, agora do lado do efeito. */
export const CONCESSAO_DA_BASE = {
  "Botas Aladas": "Voo",
  "Botas Silenciosas": "Passo Nebuloso",
  "Manto Encantado": "Escudo Arcano",
  "Tiara Arcana": "Detectar Magia",
  "Varinha Rúnica": "Nuvem de Adagas",
  "Orbe de Batalha": "Escudo Arcano",
  "Anel Serpente": "Invisibilidade",
};

export function concessaoPara(slot, baseNome, escolher) {
  const daBase = CONCESSAO_DA_BASE[baseNome];
  if (daBase) return daBase;
  const lista = CONCESSOES[slot] || [];
  if (!lista.length) return "";
  return escolher ? escolher(lista) : lista[0];
}

/* ---------------- O QUE O JOGADOR LÊ ----------------
   Uma linha por poder, e a concessão em destaque: é ela que muda o que
   o herói PODE FAZER, e não só o quanto ele soma. */
export function linhasDoItem(item) {
  const out = [];
  for (const p of (item && item.poderes) || []) {
    const d = poderPorId(p.id ? p.id : p);
    if (d) out.push(`✦ ${d.nome} — ${d.diz}`);
  }
  if (item && item.concede) out.push(`★ ${item.concede} — enquanto estiver equipado e sintonizado, você usa sem gastar PM.`);
  return out;
}

export function resumoDoItem(item) {
  const l = linhasDoItem(item);
  return l.length ? l.join(" · ") : "";
}
