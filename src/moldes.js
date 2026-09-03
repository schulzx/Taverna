/* ============================================================
   MOLDES DE UNIVERSO (v9.40) — a FORMA do mundo, separada do sabor

   O gerador já era determinístico e sob demanda desde a v9.8: uma
   semente, uma chave, e o conteúdo nasce igual para sempre sem nunca
   ser guardado. É o coração do que o Minecraft faz. O que faltava não
   era o motor — era o motor saber gerar outra coisa além de um
   continente medieval.

   Porque `geografia.js` tinha as Terras do Corvo cravadas no osso:
   oito biomas de superfície, km por dia de marcha, cidades espalhadas
   numa coroa. Uma torre de cem andares, um arquipélago pirata ou um
   punhado de sistemas estelares não cabiam em lugar nenhum.

   MOLDE NÃO É GÊNERO, e essa distinção é o que faz isto valer a pena:

   - GÊNERO é o SABOR: nomes, raças, ofícios, criaturas. Já existe em
     `nomes.js` (seis bancos) e `bestiario.js`.
   - MOLDE é a FORMA: que eixos existem, o que é um assentamento, como
     se viaja, o que escala o perigo.

   São ortogonais de propósito. Uma torre medieval e uma torre
   cyberpunk usam o mesmo molde com bancos de nomes diferentes; um
   sobremundo de ficção científica é um planeta. Amarrar os dois
   obrigaria a duplicar seis bancos de nomes por forma de mundo.

   A REGRA QUE MANTÉM O CUSTO BAIXO: o molde muda o SIGNIFICADO dos
   dados, não o FORMATO. Um andar da torre é um registro de "cidade"
   com z em vez de x,y; as rotas ligam o andar 14 ao 15. Assim missões
   (`ir_a`), viagem, ofertas, mapa e diário continuam funcionando sem
   saber que o mundo virou uma torre — e o molde só empresta o
   vocabulário para a tela e para o Mestre dizerem "andar", não
   "cidade".

   E NÃO EXISTE GRID 3D UNIVERSAL. Uma torre é 1D: z é tudo, x e y são
   enfeite. Um arquipélago é 2D com profundidade rasa. O espaço é 3D e
   vazio. Uma matriz única para os três faria cada um pior — então
   cada molde DECLARA os eixos que usa, e quem não usa não paga.
   ============================================================ */

/* ---------------- OS BIOMAS ----------------
   Cada bioma carrega o que os sistemas de ermo precisam: quanto se
   anda por dia, quão fácil é se perder e quanto a terra dá de comer.
   Antes isso morava em três tabelas separadas (TERRENO_VIAGEM,
   CD_NAVEGACAO, ABUNDANCIA), sempre indexadas pelo mesmo id — juntar
   é o que permite um molde novo trazer biomas que ninguém previu. */
const B = (id, rotulo, kmDia, cd, abundancia) => ({ id, rotulo, kmDia, cd, abundancia });

const BIOMAS_SUPERFICIE = [
  B("planicie", "planície", 30, 10, 12),
  B("floresta", "floresta", 20, 15, 10),
  B("colina", "colinas", 25, 12, 12),
  B("montanha", "montanhas", 12, 15, 15),
  B("deserto", "deserto", 15, 15, 20),
  B("pantano", "pântano", 12, 15, 15),
  B("costa", "costa", 30, 10, 10),
  B("gelo", "gelo", 12, 17, 20),
];

const BIOMAS_TORRE = [
  B("salao", "salões de pedra", 0, 8, 18),
  B("jardim", "jardim suspenso", 0, 10, 10),
  B("oficina", "oficinas mortas", 0, 12, 16),
  B("biblioteca", "andar dos arquivos", 0, 10, 20),
  B("masmorra", "andar carcerário", 0, 14, 20),
  B("santuario", "santuário rachado", 0, 12, 18),
  B("vazio", "andar vazado", 0, 17, 22),
  B("forno", "andar-forno", 0, 16, 22),
];

const BIOMAS_MAR = [
  B("mar_aberto", "mar aberto", 90, 12, 14),
  B("recife", "recifes", 60, 15, 8),
  B("ilha_selva", "ilha de selva", 20, 15, 8),
  B("ilha_seca", "ilha seca", 25, 13, 18),
  B("enseada", "enseada abrigada", 70, 10, 10),
  B("bruma", "bancos de bruma", 45, 18, 16),
  B("abissal", "águas fundas", 80, 16, 20),
];

const BIOMAS_ESTELAR = [
  B("orbital", "órbita alta", 0, 10, 16),
  B("rochoso", "mundo rochoso", 0, 13, 18),
  B("gasoso", "gigante gasosa", 0, 16, 22),
  B("cinturao", "cinturão de asteroides", 0, 17, 14),
  B("estacao", "estação de passagem", 0, 8, 10),
  B("nebulosa", "nebulosa", 0, 18, 22),
  B("morto", "sistema morto", 0, 14, 24),
];

/* ---------------- OS LOCAIS ----------------
   O que existe DENTRO de um assentamento. Cada um traz os papéis de
   quem trabalha ali, porque é dessa lista que a base do mundo tira a
   gente que povoa o lugar. */
const LOCAIS_SUPERFICIE = [
  { tipo: "taverna", icone: "🍺", sempre: true, papeis: ["taverneiro(a)", "serviçal", "músico de canto", "bêbado veterano"] },
  { tipo: "mercado", icone: "⚖", sempre: true, papeis: ["mercador(a)", "vendedor de ervas", "batedor de carteiras", "caravaneiro"] },
  { tipo: "templo", icone: "🕯", porteMin: 2, papeis: ["sacerdote(isa)", "acólito", "peregrino", "guardião da relíquia"] },
  { tipo: "forja", icone: "🔨", porteMin: 2, papeis: ["ferreiro(a)", "aprendiz", "encomendante impaciente"] },
  { tipo: "quartel", icone: "🛡", porteMin: 3, papeis: ["capitão(ã) da guarda", "recruta", "sargento cansado"] },
  { tipo: "cadeia", icone: "⛓", porteMin: 3, papeis: ["carcereiro(a)", "prisioneiro que fala demais", "escrivão"] },
  { tipo: "biblioteca", icone: "📖", porteMin: 4, papeis: ["arquivista", "estudante", "tradutor de línguas mortas"] },
  { tipo: "docas", icone: "⚓", bioma: ["costa"], papeis: ["mestre do porto", "marinheiro", "contrabandista"] },
  { tipo: "arena", icone: "⚔", porteMin: 5, papeis: ["empresário da arena", "campeão local", "apostador"] },
  { tipo: "cemitério", icone: "🪦", porteMin: 2, papeis: ["coveiro(a)", "carpideira", "visitante silencioso"] },
  { tipo: "guilda", icone: "🏛", porteMin: 4, papeis: ["mestre de guilda", "recrutador", "veterano aposentado"] },
  { tipo: "casa de banhos", icone: "💧", porteMin: 4, papeis: ["dono(a) da casa", "atendente", "cliente indiscreto"] },
];

const LOCAIS_TORRE = [
  { tipo: "descanso", icone: "🔥", sempre: true, papeis: ["guardião da fogueira", "escalador ferido", "vigia insone"] },
  { tipo: "feira do andar", icone: "⚖", sempre: true, papeis: ["trocador", "catador de espólios", "vendedor de água"] },
  { tipo: "portal", icone: "🌀", sempre: true, papeis: ["cobrador do portal", "acólito do degrau", "quem voltou de cima"] },
  { tipo: "oficina", icone: "🔨", porteMin: 2, papeis: ["remendador de armas", "aprendiz manco", "alquimista de sobras"] },
  { tipo: "capela do degrau", icone: "🕯", porteMin: 2, papeis: ["pregador do alto", "penitente", "guarda-relíquia"] },
  { tipo: "arquivo", icone: "📖", porteMin: 3, papeis: ["copista", "cartógrafo de andares", "louco erudito"] },
  { tipo: "cela", icone: "⛓", porteMin: 3, papeis: ["carcereiro sem ordens", "prisioneiro antigo", "quem se entregou"] },
  { tipo: "arena do andar", icone: "⚔", porteMin: 4, papeis: ["mestre de duelos", "campeão do degrau", "apostador"] },
];

const LOCAIS_MAR = [
  { tipo: "taverna do porto", icone: "🍺", sempre: true, papeis: ["taverneiro(a)", "marujo de licença", "cantadeira", "náufrago"] },
  { tipo: "cais", icone: "⚓", sempre: true, papeis: ["mestre do porto", "estivador", "contrabandista", "prático de barra"] },
  /* até o menor fundeadouro tem quem compre o que você tirou de um casco */
  { tipo: "mercado de espólios", icone: "⚖", sempre: true, papeis: ["receptador", "vendedor de mapas", "cambista"] },
  { tipo: "estaleiro", icone: "🔨", porteMin: 2, papeis: ["carpinteiro naval", "veleiro", "calafate"] },
  { tipo: "capela do mar", icone: "🕯", porteMin: 2, papeis: ["sacerdote das marés", "viúva de pescador", "profeta da tempestade"] },
  { tipo: "forte", icone: "🛡", porteMin: 3, papeis: ["governador", "artilheiro", "soldado subornável"] },
  { tipo: "casa de cartas", icone: "📖", porteMin: 3, papeis: ["cartógrafo", "navegante aposentado", "colecionador de rotas"] },
  { tipo: "poço das brigas", icone: "⚔", porteMin: 4, papeis: ["dono da roda", "brigão invicto", "apostador"] },
];

const LOCAIS_ESTELAR = [
  { tipo: "doca de atracação", icone: "⚓", sempre: true, papeis: ["controlador de tráfego", "estivador de carga", "piloto de traslado"] },
  { tipo: "concourse", icone: "⚖", sempre: true, papeis: ["comerciante de peças", "despachante", "batedor de manifestos"] },
  { tipo: "oficina de casco", icone: "🔨", porteMin: 2, papeis: ["mecânico de casco", "soldador", "cliente atrasado"] },
  { tipo: "enfermaria", icone: "💧", porteMin: 2, papeis: ["médico de bordo", "auxiliar", "paciente que não fala"] },
  { tipo: "capela do vácuo", icone: "🕯", porteMin: 2, papeis: ["capelão", "peregrino do silêncio", "guardião das cinzas"] },
  { tipo: "núcleo de dados", icone: "📖", porteMin: 3, papeis: ["arquivista", "decifrador", "IA de manutenção"] },
  { tipo: "posto de segurança", icone: "🛡", porteMin: 3, papeis: ["chefe de segurança", "recruta", "agente corporativo"] },
  { tipo: "poço de gravidade", icone: "⚔", porteMin: 4, papeis: ["promotor de lutas", "campeão em baixa gravidade", "apostador"] },
];

/* ---------------- AS VONTADES ----------------
   O que move a gente do lugar. É daqui que `ofertas.js` tira as
   missões: uma vontade transformada em etapa verificável. Cada molde
   precisa das suas — "espera um navio que talvez não venha" não faz
   sentido no andar 40 de uma torre. */
const VONTADES_SUPERFICIE = [
  "quer sair desta cidade antes do inverno", "deve dinheiro a gente perigosa",
  "procura um irmão que sumiu", "esconde de onde veio", "quer vingança e não tem coragem",
  "guarda uma carta que nunca entregou", "sonha em ser lembrado por algo",
  "protege alguém que não merece", "sabe de um crime e cala", "está apaixonado sem retorno",
  "quer comprar a liberdade de alguém", "acredita numa profecia que ninguém leva a sério",
  "trai o patrão em pequenas coisas", "tem medo de dormir", "juntou dinheiro para uma viagem impossível",
  "cuida de um filho que não é dele", "espera um navio que talvez não venha",
];

const VONTADES_TORRE = [
  "quer descer e não consegue mais", "perdeu alguém num andar acima",
  "cobra uma dívida de quem já subiu", "guarda a chave de um portal que não abre",
  "jura ter visto o topo", "sobe atrás de alguém que não quer ser achado",
  "esconde de que andar veio", "acredita que a Torre escolhe quem sobe",
  "trocou o próprio nome por uma passagem", "protege um andar que já está perdido",
  "junta espólios para pagar o pedágio", "tem medo do que ouve pelo vão",
  "quer morrer mais alto do que nasceu", "decora o mapa de andares que ninguém confirmou",
];

const VONTADES_MAR = [
  "espera um navio que talvez não venha", "deve a um capitão que não perdoa",
  "procura uma ilha que só ela viu", "esconde de que tripulação desertou",
  "guarda metade de um mapa", "quer comprar a própria carta de alforria",
  "jura que o mar levou alguém por engano", "vende rotas que não navegou",
  "sonha em ter um casco só seu", "protege um motim que ainda não aconteceu",
  "sabe onde o governador guarda o ouro e cala", "tem medo de água parada",
  "quer voltar para um porto que já não existe", "carrega uma bandeira que não pode mostrar",
];

const VONTADES_ESTELAR = [
  "quer pagar a passagem para fora do sistema", "deve a uma corporação que não esquece",
  "procura uma nave que sumiu do registro", "esconde de que colônia veio",
  "guarda coordenadas que ninguém deveria ter", "quer comprar o contrato de alguém",
  "jura ter ouvido algo na nebulosa", "vende manifestos falsos",
  "sonha em ver um céu com nuvens", "protege uma IA que deveria ter sido apagada",
  "sabe por que a estação foi evacuada e cala", "tem medo de dormir em criogenia",
  "quer levar as cinzas de alguém para casa", "espera uma resposta que leva anos-luz",
];

/* ---------------- OS NOMES DOS LOCAIS ----------------
   Sem isto o local se chamava pelo próprio tipo — "descanso", "portal" —,
   e um andar da Torre soava como uma planta baixa em vez de um lugar. */
const NOMES_LOCAL_TORRE = {
  descanso: ["A Última Brasa", "Fogo do Patamar", "Roda dos Insones", "Vigília Baixa"],
  "feira do andar": ["Troca Torta", "Balcão do Degrau", "Pátio dos Restos", "Mercado de Cordas"],
  portal: ["A Boca", "Arco Pálido", "Limiar de Ferro", "Passagem do Sino"],
  oficina: ["Bigorna Suspensa", "Casa dos Remendos", "Fole Alto"],
  "capela do degrau": ["Capela Rachada", "Altar do Alto", "Nicho dos Penitentes"],
  arquivo: ["Sala das Cópias", "Mapa dos Andares", "Casa dos Papéis Altos"],
  cela: ["Cela Muda", "Poço dos Esquecidos", "Corredor Trancado"],
  "arena do andar": ["Roda de Areia", "Fosso do Degrau", "Círculo Alto"],
};
const NOMES_LOCAL_MAR = {
  "taverna do porto": ["A Âncora Torta", "O Barril Furado", "Sereia Rouca", "Casa do Vento Sul"],
  cais: ["Cais Podre", "Molhe Velho", "Píer das Gaivotas", "Trapiche do Sal"],
  "mercado de espólios": ["Feira do Saque", "Balcão do Receptador", "Pátio das Trocas"],
  estaleiro: ["Carreira Velha", "Casa do Calafate", "Doca Seca"],
  "capela do mar": ["Capela das Marés", "Altar Afogado", "Ermida do Farol"],
  forte: ["Forte Sal", "Bateria Alta", "Muralha do Governador"],
  "casa de cartas": ["Sala das Cartas", "Casa do Rumo", "Gabinete do Prático"],
  "poço das brigas": ["Roda dos Punhos", "Poço do Convés", "Areia Vermelha"],
};
const NOMES_LOCAL_ESTELAR = {
  "doca de atracação": ["Doca 7", "Braço de Atracação C", "Berço Longo", "Anel de Carga"],
  concourse: ["Galeria Central", "Corredor Comercial", "Praça Pressurizada"],
  "oficina de casco": ["Baía de Reparo", "Oficina Fria", "Casa do Soldador"],
  enfermaria: ["Enfermaria Baixa", "Ala Estéril", "Posto Médico 2"],
  "capela do vácuo": ["Capela do Silêncio", "Nicho das Cinzas", "Sala de Vigília"],
  "núcleo de dados": ["Núcleo Frio", "Arquivo Profundo", "Sala dos Espelhos"],
  "posto de segurança": ["Posto Central", "Bloco de Detenção", "Sala de Triagem"],
  "poço de gravidade": ["Poço Zero", "Roda de Baixa Gravidade", "Arena Suspensa"],
};

/* ---------------- OS MOLDES ---------------- */
/* ---------------- OS NOMES DO LUGAR ----------------
   O banco de nomes de `geografia.js` era medieval no osso, e um sistema
   estelar chamado "Baixo Brumoso" denuncia isso na primeira tela. Cada
   molde traz o seu; o gerador combina A + B como sempre fez. */
const NOMES_SUPERFICIE = {
  a: ["Pedra", "Vila", "Porto", "Forte", "Monte", "Rio", "Ponte", "Torre", "Alto", "Baixo", "Nova", "Velha", "Casa", "Ponto"],
  b: ["valente", "do Sul", "do Norte", "clara", "escura", "do Rei", "das Águias", "Profundo", "da Fonte", "do Vigia", "Serena", "Rasa", "do Martelo", "das Velas", "Seco", "Brumoso"],
};
const NOMES_MAR = {
  a: ["Ilha", "Cabo", "Baía", "Enseada", "Ponta", "Ilhéu", "Recife", "Porto", "Angra", "Barra"],
  b: ["do Enforcado", "das Gaivotas", "Quebrada", "do Sal", "Perdida", "do Cão", "das Velas Negras", "Funda", "do Naufrágio", "Vermelha", "das Ossadas", "do Vento Sul", "Grande", "do Contrabando"],
};
const NOMES_ESTELAR = {
  a: ["Kepler", "Vega", "Órion", "Cygnus", "Tau", "Rígel", "Hélio", "Ares", "Ceres", "Íris", "Nix", "Éter"],
  b: ["Prime", "II", "IX", "Menor", "Profundo", "Terminal", "Estação", "Fronteira", "Oculto", "Zênite", "Nadir", "Extremo"],
};

/* As regiões precisavam do mesmo tratamento: "Margens da Serpente" como
   setor estelar denunciava o gerador tanto quanto "Baixo Brumoso". */
const REGIOES_SUPERFICIE = {
  a: ["Terras", "Vales", "Campos", "Margens", "Colinas", "Chãs", "Fronteiras", "Planaltos"],
  b: ["do Corvo", "de Ferro", "das Brumas", "do Sal", "Verdes", "Altos", "Quebradas", "da Serpente", "do Vento", "Escarlates", "da Lua Baixa", "do Estio"],
};
const REGIOES_TORRE = {
  a: ["Base", "Sopé", "Meio", "Alto", "Coroa", "Vão", "Espinha", "Cúpula"],
  b: ["dos Mudos", "de Ferro", "das Cinzas", "do Sino", "Rachada", "dos Penitentes", "sem Nome", "do Fio"],
};
const REGIOES_MAR = {
  a: ["Mar", "Mares", "Águas", "Estreito", "Golfo", "Canal", "Bancos"],
  b: ["do Enforcado", "de Sangue", "das Brumas", "Quebrados", "do Sul Fundo", "dos Ossos", "Sem Vento", "da Serpente"],
};
const REGIOES_ESTELAR = {
  a: ["Setor", "Braço", "Aglomerado", "Faixa", "Corredor", "Berçário", "Vazio"],
  b: ["de Órion", "Exterior", "das Brumas", "Proibido", "de Kepler", "Sem Rota", "Profundo", "da Fronteira"],
};

export const MOLDES = [
  {
    id: "sobremundo",
    nome: "Terras abertas",
    desc: "Continentes, estradas e cidades espalhadas. O mundo clássico de aventura.",
    icone: "🗺",
    topologia: "continental",
    eixos: ["x", "y"],
    rotuloEixo: { x: "leste-oeste", y: "norte-sul" },
    assentamento: { singular: "cidade", plural: "cidades", artigo: "a", chegar: "chegar a", ir: "viajar até" },
    regiao: { singular: "região", plural: "regiões" },
    portes: ["aldeia", "vila", "cidade", "fortaleza", "capital"],
    unidade: { km: 25, rotulo: "km" },
    /* quantos lugares o mundo tem, e quantos locais cada porte abriga (do
       menor porte ao maior). `null` em `tamanho` deixa o gerador continental
       sortear como sempre fez. */
    tamanho: null,
    locaisPorPorte: [2, 3, 5, 4, 7],
    viagem: { verbo: "viajar", tempo: "dias de marcha", meio: "a pé", rotuloRota: "estrada" },
    biomas: BIOMAS_SUPERFICIE,
    locais: LOCAIS_SUPERFICIE,
    vontades: VONTADES_SUPERFICIE,
    /* perigo plano: quem decide a ameaça é o nível do herói e a região */
    progressao: null,
    gatilho: null,
    /* v9.165: a lei das Terras Abertas é NÃO TER TRAVA. A estrada franca é a
       identidade do molde — declarada aqui de propósito, para que "aberto"
       seja uma escolha lida pelo porteiro, e não um campo esquecido. */
    lei: null,
    nomes: NOMES_SUPERFICIE,
    nomesRegiao: REGIOES_SUPERFICIE,
    generoPadrao: "Fantasia medieval",
  },
  {
    id: "torre",
    nome: "A Torre",
    desc: "Cem andares, um portal em cada um, e o que espera acima é sempre pior.",
    icone: "🗼",
    topologia: "pilha",
    eixos: ["z"],
    rotuloEixo: { z: "andar" },
    assentamento: { singular: "andar", plural: "andares", artigo: "o", chegar: "alcançar o", ir: "subir ao" },
    regiao: { singular: "seção", plural: "seções" },
    portes: ["patamar", "andar", "andar", "andar-mestre", "átrio"],
    unidade: { km: 0, rotulo: "andares" },
    /* cem andares é a promessa do molde, e o gerador precisava cumpri-la:
       herdando as faixas do continental, a Torre nascia com 18 a 40 */
    tamanho: [72, 100],
    locaisPorPorte: [2, 3, 5, 4, 8],
    viagem: { verbo: "subir", tempo: "horas de escalada", meio: "a pé", rotuloRota: "portal" },
    biomas: BIOMAS_TORRE,
    locais: LOCAIS_TORRE,
    vontades: VONTADES_TORRE,
    /* o degrau é a régua: cada andar acima pesa mais que o anterior */
    progressao: { por: "z", perigoPorPasso: 0.12, rotulo: "cada andar acima é 12% mais perigoso" },
    gatilho: { nome: "o portal do andar", verbo: "atravessar", regra: "só se sobe pelo portal ao andar seguinte, e o portal só abre quando o guardião do andar cai" },
    /* v9.165: a promessa do gatilho vira código — quem executa é
       lei-da-forma.js: trava a subida, gera o guardião, abre a passagem */
    lei: { id: "guardiao" },
    nomes: NOMES_SUPERFICIE,
    nomesRegiao: REGIOES_TORRE,
    nomesLocal: NOMES_LOCAL_TORRE,
    generoPadrao: "Fantasia medieval",
  },
  {
    id: "arquipelago",
    nome: "O Arquipélago",
    desc: "Ilhas espalhadas, mar aberto entre elas e um casco por baixo dos pés.",
    icone: "🏴‍☠️",
    topologia: "ilhas",
    eixos: ["x", "y"],
    rotuloEixo: { x: "longitude", y: "latitude", z: "profundidade" },
    assentamento: { singular: "ilha", plural: "ilhas", artigo: "a", chegar: "aportar em", ir: "singrar até" },
    regiao: { singular: "mar", plural: "mares" },
    portes: ["fundeadouro", "vila de pesca", "porto", "forte", "porto franco"],
    unidade: { km: 40, rotulo: "milhas" },
    tamanho: null,
    /* uma ilha vive do porto: mesmo o menor fundeadouro tem taverna, cais e
       mais alguma coisa. Com a régua do continente, ilha pequena nascia com
       dois locais e a cena não tinha para onde ir. */
    locaisPorPorte: [3, 4, 6, 5, 8],
    viagem: { verbo: "navegar", tempo: "dias de singradura", meio: "de navio", rotuloRota: "rota marítima" },
    biomas: BIOMAS_MAR,
    locais: LOCAIS_MAR,
    vontades: VONTADES_MAR,
    progressao: null,
    gatilho: { nome: "a maré", verbo: "esperar", regra: "certas rotas só abrem na maré ou com vento a favor" },
    /* v9.165: a maré é função do dia — cerca de um terço das rotas fecha e
       abre num ciclo de seis dias, com três de janela. Esperar um a três
       dias se resolve dormindo, e dormir num porto é cena, não castigo. */
    lei: { id: "mare", periodo: 6, janela: 3 },
    nomes: NOMES_MAR,
    nomesRegiao: REGIOES_MAR,
    nomesLocal: NOMES_LOCAL_MAR,
    generoPadrao: "Fantasia medieval",
  },
  {
    id: "estelar",
    nome: "O Braço Estelar",
    desc: "Sistemas distantes ligados por saltos, e vácuo em todo o resto.",
    icone: "🛰",
    topologia: "grafo",
    eixos: ["x", "y", "z"],
    rotuloEixo: { x: "setor", y: "braço", z: "plano orbital" },
    assentamento: { singular: "sistema", plural: "sistemas", artigo: "o", chegar: "chegar ao", ir: "saltar para" },
    regiao: { singular: "setor", plural: "setores" },
    portes: ["posto avançado", "colônia", "sistema", "base", "capital orbital"],
    unidade: { km: 1, rotulo: "anos-luz" },
    tamanho: null,
    locaisPorPorte: [3, 4, 6, 5, 8],
    viagem: { verbo: "saltar", tempo: "dias de trânsito", meio: "de nave", rotuloRota: "rota de salto" },
    biomas: BIOMAS_ESTELAR,
    locais: LOCAIS_ESTELAR,
    vontades: VONTADES_ESTELAR,
    progressao: null,
    gatilho: { nome: "o motor de salto", verbo: "acionar", regra: "só se viaja entre sistemas ligados por rota de salto conhecida" },
    /* v9.165: e a regra tem dentes — sem rota registrada no grafo, o motor
       não salta; atravessa-se o Braço sistema a sistema, que é a lei */
    lei: { id: "rota" },
    nomes: NOMES_ESTELAR,
    nomesRegiao: REGIOES_ESTELAR,
    nomesLocal: NOMES_LOCAL_ESTELAR,
    generoPadrao: "Ficção científica",
  },
];

export const MOLDE_PADRAO = "sobremundo";
export function moldePorId(id) { return MOLDES.find((m) => m.id === id) || MOLDES[0]; }
export function moldesDisponiveis() { return MOLDES.map((m) => ({ id: m.id, nome: m.nome, desc: m.desc, icone: m.icone })); }

/* ---------------- CONSULTAS ----------------
   Os sistemas de ermo perguntam pelo bioma e recebem o que precisam,
   com um fallback razoável: um bioma que o molde não conhece não pode
   derrubar a viagem. */
export function biomasDe(molde) { return moldePorId(molde && molde.id ? molde.id : molde).biomas; }
export function biomaDe(molde, id) {
  const bs = biomasDe(molde);
  return bs.find((b) => b.id === id) || bs[0];
}
export function rotuloDoBioma(molde, id) { return biomaDe(molde, id).rotulo; }
export function idsDeBioma(molde) { return biomasDe(molde).map((b) => b.id); }

export function temEixo(molde, eixo) { return moldePorId(molde && molde.id ? molde.id : molde).eixos.includes(eixo); }

/* Quanto o perigo cresce ao avançar no eixo do molde. Sem progressão
   declarada, devolve 1 — o mundo é plano e quem calibra é o nível. */
export function fatorDePerigo(molde, valorDoEixo) {
  const m = moldePorId(molde && molde.id ? molde.id : molde);
  if (!m.progressao) return 1;
  const passos = Math.max(0, (Number(valorDoEixo) || 0) - 1);
  return 1 + passos * m.progressao.perigoPorPasso;
}

/* Como o lugar se chama nesta campanha: é o que a tela e o Mestre
   usam para nunca dizer "cidade" numa torre. */
export function comoSeChama(molde, quantos = 1) {
  const a = moldePorId(molde && molde.id ? molde.id : molde).assentamento;
  return quantos === 1 ? a.singular : a.plural;
}

export function resumoMoldePrompt(molde) {
  const m = moldePorId(molde && molde.id ? molde.id : molde);
  const eixos = m.eixos.map((e) => `${e.toUpperCase()} (${m.rotuloEixo[e] || e})`).join(", ");
  return `FORMA DESTE MUNDO — ${m.nome.toUpperCase()}: ${m.desc}
- O mundo se organiza em ${eixos}. Um lugar habitado se chama ${m.assentamento.singular.toUpperCase()} (plural: ${m.assentamento.plural}) — use essa palavra, nunca "cidade" por hábito.
- Deslocar-se é ${m.viagem.verbo.toUpperCase()}, ${m.viagem.meio}, e o custo se mede em ${m.viagem.tempo}. As ligações entre lugares são ${m.viagem.rotuloRota}s.
- Terrenos possíveis: ${m.biomas.map((b) => b.rotulo).join(", ")}. Não invente ecossistema fora desta lista.${m.gatilho ? `\n- ${m.gatilho.nome.toUpperCase()}: ${m.gatilho.regra}.` : ""}${m.progressao ? `\n- PROGRESSÃO: ${m.progressao.rotulo} — trate os lugares mais altos como mais mortais, sempre.` : ""}`;
}

export const MOLDES_PROMPT = `A FORMA DO MUNDO (v9.40):
- Cada campanha nasce sob um MOLDE que define o que existe: os eixos, o nome do que é um lugar habitado, como se viaja e que terrenos podem aparecer. O molde desta campanha vem descrito acima.
- Use o VOCABULÁRIO do molde. Numa Torre não há cidades, há andares; num Arquipélago não se viaja, se singra; no Braço Estelar não se caminha entre sistemas, se salta.
- Não invente forma nova: se o molde não tem um eixo, esse eixo não existe. Numa Torre não há norte nem sul — há acima e abaixo.`;
