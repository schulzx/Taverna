/* ============================================================
   O LÉXICO DO MUNDO (v9.101) — o sétimo gênero

   O relato: "se eu criar um mundo sobre Solo Leveling e colocar sobre
   os caçadores, quase não vão falar sobre isso; o nosso mundo gerado é
   genérico".

   É verdade, e a causa não é a IA desobedecer — é o SISTEMA. Todo
   gerador desta casa já é parametrizado por gênero e resolve num banco:

     const ocupacoes = OCUPACOES[g] || OCUPACOES["Fantasia medieval"];

   `locaisDaCidade`, `genteDoLocal`, `criaturasDaRegiao`, `nomeCidade`,
   `nomeDeLocal`, `pessoaDiversa` — todos fazem isso. A costura existe.
   O que não existe é uma sétima entrada: a lista de bancos tem seis e
   está fechada em `constantes.js`. A descrição que o jogador escreveu é
   o ÚNICO lugar do sistema que sabe de caçadores, e ela chega ao prompt
   como uma linha solta enquanto o sistema despeja ferreiro, taverneiro e
   capela por cima. A IA obedece o sistema acima da descrição, porque foi
   exatamente isso que a gente treinou ela a fazer.

   ---------------- AS DUAS METADES ----------------

   O léxico tem duas metades, e a segunda é a que importa mais.

   A primeira é o VOCABULÁRIO: como as coisas se chamam. Masmorra é
   portal, criatura é besta, taverna é sede da guilda. Barato e visível.

   A segunda é COMO AS COISAS FUNCIONAM AQUI, e ela é a diferença entre
   trocar uma palavra e adaptar um sistema. O exemplo que a trouxe:

     "uma dungeon seria um portal, e em Solo Leveling existem portais
      que levam a mundos e dungeons que só acabam quando se vence o
      boss — o mestre criaria as dungeons em forma de portais".

   Isso não é uma mecânica nova. As salas, o chefe no fundo, a chave no
   miolo, as tochas: tudo continua sendo `masmorras.js`, com os mesmos
   números. O que muda é COMO AQUILO SE APRESENTA — o portal que se abre
   sozinho num lugar público, que não fecha enquanto o chefe respira,
   que engole quem entra despreparado. O sistema é o esqueleto; o léxico
   é a carne. E o Mestre precisa das duas para não narrar um calabouço
   de pedra num mundo que não tem nenhum.

   ---------------- QUATRO REGRAS ----------------

   1) PALAVRAS, NUNCA NÚMEROS. O léxico renomeia, repovoa e reveste. Ele
      não cria habilidade, não cria magia, não mexe em custo, dano,
      dificuldade nem raridade — essas continuam saindo do catálogo, que
      é onde o equilíbrio mora. Um léxico que pudesse escrever "caçador
      rank S ganha +5" seria um jailbreak em cima do jogo inteiro.

   2) CAMPO A CAMPO, E VAZIO É "USE O SEU". A validação não aceita nem
      recusa o léxico inteiro: cada campo passa sozinho. O que não veio,
      ou veio errado, fica VAZIO — e vazio quer dizer, para todo leitor,
      "não tenho, use o banco genérico". Um mundo com metade do léxico é
      melhor que um mundo sem nenhum, e muito melhor que um que não abre.

   3) O MUNDO QUE A OBRA EVOCA, NÃO A OBRA. Se a descrição citar uma
      história que existe, o que se gera são as REGRAS e os PAPÉIS que
      ela evoca, com nomes próprios novos. Não é só a coisa certa a
      fazer: é o mundo ficar do jogador, e não uma cópia de segunda mão.

   4) CADA ADAPTAÇÃO CHEGA NA CENA QUE A USA. As quinze adaptações não
      cabem todas no prompt de toda cena — seriam mil e quinhentos
      caracteres por turno para dizer, na taverna, como funciona uma
      masmorra. Elas viajam pelas PORTAS DA CENA que já existem: a do
      portal entra quando se está num, a da luta quando há luta. Só
      quatro ficam sempre ligadas, porque são o mundo e não a cena.
   ============================================================ */

/* Os tetos existem por causa do orçamento do prompt, que está apertado.
   Cada um foi escolhido pelo que a seção correspondente já gastava. */
const TETOS = {
  povos: 8, oficios: 16, lugares: 10, criaturas: 10, faccoes: 4, naoExiste: 6,
  cidades: 8, tavernas: 4, nome: 24, parte: 16, terra: 40,
  texto: 170, curto: 40, medio: 70, adaptacao: 170,
  /* v9.111: o nome de EQUIPAMENTO tem teto próprio. O de 24 era o de
     nome de pessoa, e o item mais longo do catálogo da casa ("Armadura
     de Couro de Dragão") tem 27 — o teto estava calibrado para outra
     coisa e cortava peça legítima no meio. */
  equipamento: 34,
};

/* ---------------- O ORÇAMENTO ----------------
   O bloco inteiro do léxico nunca passa disto, e o número não é um
   palpite: o prompt de uma cena comum estava em 58,9 mil caracteres com
   o gatilho em 59 mil, e o de "todas as portas abertas" em 81,9 mil com
   o teto em 82 mil. Um bloco sem limite os estourava nos dois lados —
   o pior caso somava 5,6 mil caracteres.

   Um teto por campo não resolveria: quinze adaptações de 170 já dão
   2.550. O que resolve é um teto no TOTAL, preenchido por prioridade —
   e a prioridade é a que o Mestre precisaria se só pudesse ler uma
   linha: primeiro como as coisas se chamam, depois a lei, depois a
   adaptação da cena que está aberta AGORA, e por último o resto.

   O que não couber é cortado em silêncio. Não há aviso porque não há o
   que avisar: o léxico é rico de propósito, e o prompt leva dele o que
   cabe na cena de hoje — uma cena de masmorra leva a masmorra, e a de
   amanhã leva a de amanhã. */
export const TETO_DO_BLOCO = 1700;
/* o bloco da cena (v9.162) tem orçamento separado e menor: ver lexicoDaCena */
export const TETO_DA_CENA = 700;

const limpar = (s, max) => String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, max);
/* Corta no fim de uma PALAVRA. Onde o texto é frase, cortar no
   caractere é aceitável; onde ele é nome próprio, não é: "Aldric Vent"
   ainda é um nome, "Vestes de Duelo Reforçad" é lixo na tela. */
const aparar = (txt, tam) => {
  const x = String(txt || "").trim();
  if (x.length <= tam) return x;
  const corte = x.slice(0, tam);
  const espaco = corte.lastIndexOf(" ");
  return (espaco > tam * 0.5 ? corte.slice(0, espaco) : corte).trim();
};

const lista = (v, max, tam) => (Array.isArray(v) ? v : [])
  .map((x) => limpar(x, tam))
  .filter(Boolean)
  .filter((x, i, a) => a.indexOf(x) === i)
  .slice(0, max);

/* ---------------- COMO AS COISAS SE CHAMAM ----------------
   O campo mais barato de todos: onze palavras que mudam a cor de todo o
   resto. O sistema continua chamando de masmorra por dentro, porque por
   dentro é masmorra mesmo. O apelido é a boca, não a mecânica. */
export const COISAS = [
  { id: "heroi", padrao: "aventureiro", o: "o que o herói é neste mundo" },
  { id: "grupo", padrao: "grupo", o: "quem anda com ele" },
  { id: "taverna", padrao: "taverna", o: "onde se encontra gente e trabalho" },
  { id: "masmorra", padrao: "masmorra", o: "o lugar perigoso em que se entra para sair com alguma coisa" },
  { id: "monstro", padrao: "criatura", o: "o que ameaça as pessoas" },
  { id: "faccao", padrao: "facção", o: "os grupos que disputam poder" },
  { id: "cidade", padrao: "cidade", o: "os assentamentos" },
  { id: "moeda", padrao: "moedas", o: "com que se paga" },
  { id: "magia", padrao: "magia", o: "o poder que foge do comum" },
  { id: "relicario", padrao: "relíquia", o: "o objeto raro que muda uma vida" },
  { id: "autoridade", padrao: "a guarda", o: "quem manda e cobra ordem" },
];
export function coisaPorId(id) { return COISAS.find((c) => c.id === id) || null; }

/* ---------------- OS LUGARES, PELO TIPO (v9.103) ----------------
   Aqui vale a mesma regra escrita para o equipamento, e que vale para o
   léxico inteiro: O NOME VEM DA FORMA, NUNCA DA COISA.

   O `tipo` de um local é MECÂNICO — o mercado é procurado por "mercado",
   `comodos.js` desenha por tipo, o porte decide quantos e quais existem.
   Ele não muda nunca. O que muda é como aquele tipo SE CHAMA neste mundo
   e que nomes próprios ele recebe.

   Num mundo de caçadores a "taverna" continua sendo `taverna` para o
   código — e "sede da guilda" para os olhos, com nomes como "Guilda
   Aurora". A forja continua forja, e é a "loja de equipamento".

   E o mapeamento é POR TIPO CONHECIDO: um tipo que o léxico invente não
   entra, porque não haveria nada mecânico para ele ser. */
export const TIPOS_DE_LUGAR = [
  "taverna", "mercado", "templo", "forja", "quartel", "cadeia",
  "biblioteca", "docas", "arena", "cemitério", "guilda", "casa de banhos",
];

/* ---------------- AS CRIATURAS, PELA AMEAÇA ----------------
   Mesma régua, e aqui ela é vital: a ameaça decide PV, defesa, dano e
   quanto a criatura pesa no orçamento do encontro. Um nome guardado no
   balde errado promete um bicho e entrega outro — e o jogador que lê
   "rastejante de fenda" e encontra o PV de um dragão não foi enganado
   pela ficção, foi enganado pelo sistema. */
export const AMEACAS = ["fraco", "comum", "competente", "elite", "lendario"];

/* v9.113: A MENTE DA CRIATURA, e ela é lista fechada como a ameaça.

   `adversario.js` decide a primeira coisa de toda luta por aqui: quem
   PENSA negocia e foge, quem é BESTA não faz refém, quem é MORTO não
   teme morrer. Ele classificava por NOME, com uma lista de palavras de
   fantasia — e num mundo criado pelo léxico o bestiário é "larva de
   fenda", "farrapo de névoa", "triturador de asfalto". Nenhum casava, e
   uma larva acabava fazendo refém.

   Quem sabe é quem inventou o bicho. Custa um campo aqui e nada no
   prompt de turno. */
export const MENTES = ["besta", "morto", "pensa"];

/* ---------------- AS RAÇAS, PELAS DUAS COLUNAS (v9.109) ----------------
   Aqui a regra muda de forma, e é a que o desenho do equipamento previu.
   Um tipo de lugar podia ser renomeado inteiro porque o `tipo` mecânico
   fica ao lado do nome. Uma RAÇA não: o nome DELA é o identificador —
   `racaPorNome` procura por ele, a ficha guarda por ele, o bônus de
   atributo sai dele.

   Então são duas colunas: o `nome` canônico, que o código usa e que
   nunca muda, e o `chamado`, que só a tela e a narração veem. O bônus
   continua exatamente o mesmo — um "caçador desperto" que é Humano por
   dentro ganha +1 em tudo, e o card continua mostrando isso.

   É por isso que esta etapa é barata e a das habilidades não é: uma raça
   é consultada por nome em três lugares; uma habilidade, em quinze. */

/* ---------------- O EQUIPAMENTO, PELA FORMA (v9.111) ----------------
   Aqui a regra muda outra vez, e é a mais delicada das três.

   Um TIPO DE LUGAR podia ser renomeado inteiro porque o tipo mecânico
   viaja ao lado. Uma RAÇA precisou de duas colunas porque o nome dela é
   identificador. Um ITEM precisa de mais que isso: renomear um machado
   para "varinha" não quebraria só a busca — quebraria a AFORDÂNCIA. O
   jogador leria "varinha", esperaria uma coisa leve que qualquer
   conjurador segura, e receberia uma arma marcial de duas mãos que pede
   Força e treino.

   Então o léxico NÃO NOMEIA ITENS. Ele nomeia FORMAS, e o código sorteia
   do balde que corresponde ao que a peça realmente é. Um machado nunca
   vira varinha porque "varinha" mora no balde das armas leves de uma
   mão. E a promessa deixa de ser falsa.

   A lista espelha `FORMAS` em itens.js. Ela é literal em vez de
   importada de propósito — o léxico não deve depender do catálogo de
   equipamento para carregar —, e um teste confere que as duas batem. */
import { FORMAS as FORMAS_MECANICAS } from "./itens.js";

export const FORMAS_DO_EQUIPAMENTO = [
  "arma_leve_uma", "arma_simples_uma", "arma_simples_dist",
  "arma_marcial_uma", "arma_marcial_duas", "arma_marcial_dist",
  "foco_uma", "foco_duas", "escudo",
  "armadura_panos", "armadura_leve", "armadura_media", "armadura_pesada",
  "elmo", "botas", "anel", "amuleto",
];

/* v9.114: e os OFÍCIOS JOGÁVEIS. `oficios` (acima) é o que os NPCs
   fazem da vida e não tem mecânica atrás; isto aqui são as doze
   profissões da FICHA, cada uma com um efeito no código. Duas listas
   parecidas com destinos diferentes, e a diferença é a mecânica. */
/* ---------------- OS AFIXOS, POR DEGRAU (v9.114) ----------------
   O prefixo de um item carrega um DEGRAU, e é ele que decide em que
   raridade a palavra pode aparecer: "Rústico" no 0, "Lendário" no 4.
   A v9.80 pôs essa régua de pé depois de um item comum sair "Lendário"
   e todo nome bonito do jogo perder o crédito.

   Por isso o mundo não renomeia prefixo por prefixo: ele preenche os
   CINCO DEGRAUS, e a posição na lista é que decide a raridade. É a
   mesma forma das criaturas por ameaça, e pelo mesmo motivo — o degrau
   é mecânica e não muda; a palavra é do mundo.

   `o` é o que o degrau significa, e vai ao Mestre junto do pedido: sem
   isso ele não tem como saber que a palavra do degrau 4 precisa soar
   como a coisa mais rara que este mundo produz. */
export const DEGRAUS_DE_AFIXO = [
  { n: 0, o: "comum e sem graça — descreve o estado da peça, não promete nada" },
  { n: 1, o: "um pouco melhor que o normal: bem-feita, bem cuidada, de boa procedência" },
  { n: 2, o: "tem alguma coisa dentro: trabalho especial, material raro, um efeito" },
  { n: 3, o: "peça de mestre, das que se contam histórias" },
  { n: 4, o: "a coisa mais rara que este mundo produz — uma por geração" },
];

export const PROFISSOES_DO_SISTEMA = [
  "Ferreiro", "Alquimista", "Herborista", "Cartógrafo", "Escriba", "Cozinheiro",
  "Joalheiro", "Curtidor", "Minerador", "Caçador de Recompensas", "Mercador", "Médico de Campo",
];

export const RACAS_DO_SISTEMA = [
  "Humano", "Elfo", "Anão", "Halfling", "Meio-orc", "Draconato", "Tiefling", "Gnomo", "Meio-elfo", "Goliath",
  "Terrano", "Colono Orbital", "Sintético", "Mutante", "Cromado", "Vagante",
];

/* ---------------- COMO AS COISAS FUNCIONAM ----------------
   Cada entrada aponta para um SISTEMA que já existe no código e diz
   como ele se apresenta neste mundo. `porta` é a porta da cena que a
   carrega — `null` quer dizer sempre ligada, e as quatro que são `null`
   são as que descrevem o MUNDO, não a cena.

   `pergunta` é o que se pede ao Léxico na criação, e ela é escrita para
   puxar o MECANISMO, não o adjetivo: "como se entra, como se sai, o que
   acontece com quem não vence" rende portal-que-não-fecha; "descreva as
   masmorras deste mundo" rende masmorra com outro nome. */
export const SISTEMAS = [
  { id: "heroi", porta: null, rotulo: "O QUE É UM AVENTUREIRO AQUI",
    pergunta: "quem são as pessoas como o herói neste mundo: como alguém vira uma delas, quem as reconhece, e por que a gente comum não faz o que elas fazem" },
  { id: "poder", porta: null, rotulo: "DE ONDE VEM O PODER",
    pergunta: "como se explica, na ficção deste mundo, alguém fazer o que os outros não fazem — e como se fica mais forte (o sistema já tem níveis e habilidades: diga como isso APARECE aqui, sem inventar mecânica)" },
  { id: "fama", porta: null, rotulo: "COMO A REPUTAÇÃO ANDA",
    pergunta: "como a reputação de alguém se mede e circula neste mundo: quem registra, quem espalha, o que muda quando ela sobe" },
  { id: "ameaca", porta: null, rotulo: "QUE FORMA TEM UMA AMEAÇA GRANDE",
    pergunta: "que forma toma um antagonista de verdade neste mundo, e por que ninguém o parou ainda" },
  { id: "masmorra", porta: "masmorra", rotulo: "O LUGAR PERIGOSO",
    pergunta: "o lugar perigoso em que se entra para sair com alguma coisa: como ele aparece, como se entra, o que há no fundo, como se sai, e o que acontece com quem entra e não vence" },
  { id: "combate", porta: "combate", rotulo: "COMO SE BRIGA",
    pergunta: "como é uma briga aqui: com o quê se luta, quem costuma lutar junto, o que é golpe baixo e o que é honra" },
  { id: "morte", porta: "combate", rotulo: "O QUE ACONTECE COM QUEM CAI",
    pergunta: "o que acontece com quem cai em combate neste mundo: quem recolhe, o que se faz com o corpo, o que se diz" },
  { id: "tesouro", porta: "combate", rotulo: "COMO SE ACHA COISA BOA",
    pergunta: "de onde sai o equipamento raro aqui, quem o avalia e quem o compra" },
  { id: "viagem", porta: "viagem", rotulo: "COMO SE VAI DE UM LUGAR A OUTRO",
    pergunta: "como se atravessa distância neste mundo, quem viaja e quem não pode, e o que dá errado no caminho" },
  { id: "cidade", porta: "cidade", rotulo: "COMO É UM ASSENTAMENTO",
    pergunta: "como é uma cidade daqui por dentro: o que se vê na rua, quem manda, do que as pessoas têm medo" },
  { id: "mercado", porta: "mercado", rotulo: "COMO SE COMPRA E SE VENDE",
    pergunta: "como se compra e se vende neste mundo: onde, com quê, e o que não se vende em público" },
  { id: "missao", porta: "missao", rotulo: "DE ONDE VEM TRABALHO",
    pergunta: "de onde vem trabalho para gente como o herói: quem contrata, como o pedido chega, e como se combina o pagamento" },
  { id: "acampamento", porta: "acampamento", rotulo: "COMO SE DESCANSA",
    pergunta: "como e onde gente como o herói descansa neste mundo, e o que se faz nessas horas paradas" },
  { id: "grupo", porta: "grupo", rotulo: "COMO SE ANDA ACOMPANHADO",
    pergunta: "como se forma um grupo aqui: quem se junta a quem, o que se combina antes, e como se divide o que se ganha" },
  { id: "ermo", porta: "ermo", rotulo: "O QUE HÁ ENTRE OS LUGARES",
    pergunta: "o que existe no espaço entre os assentamentos deste mundo, e por que as pessoas evitam ou atravessam" },
];
export function sistemaPorId(id) { return SISTEMAS.find((s) => s.id === id) || null; }
/* As que valem em toda cena, porque falam do mundo e não do momento. */
export const SEMPRE = SISTEMAS.filter((s) => !s.porta).map((s) => s.id);

/* ---------------- A GARANTIA ----------------
   Recebe qualquer coisa e devolve um léxico. Campo inválido vira vazio,
   e vazio é a palavra combinada para "use o banco genérico". */
export function garantirLexico(l) {
  const o = l && typeof l === "object" ? l : {};
  const cham = {};
  for (const c of COISAS) {
    const v = limpar(o.chamado && o.chamado[c.id], TETOS.curto);
    /* o apelido igual ao padrão não é apelido: guardá-lo só gastaria
       prompt para dizer que nada mudou */
    if (v && v.toLowerCase() !== c.padrao.toLowerCase()) cham[c.id] = v;
  }
  const funciona = {};
  for (const s of SISTEMAS) {
    const v = limpar(o.funciona && o.funciona[s.id], TETOS.adaptacao);
    if (v) funciona[s.id] = v;
  }
  return {
    v: 1,
    gerado: !!o.gerado,
    chamado: cham,
    funciona,
    povos: lista(o.povos, TETOS.povos, TETOS.curto),
    oficios: lista(o.oficios, TETOS.oficios, TETOS.curto),
    /* v9.103: as criaturas passam a vir POR AMEAÇA. Uma lista solta de
       nomes não pode nomear bicho nenhum — ela não sabe qual deles é o
       fraco. O que vier sem ameaça é descartado como qualquer campo
       inválido: vazio quer dizer "use o seu". */
    criaturas: (Array.isArray(o.criaturas) ? o.criaturas : [])
      .map((x) => ({
        ameaca: AMEACAS.includes(String((x && x.ameaca) || "").toLowerCase().trim()) ? String(x.ameaca).toLowerCase().trim() : "",
        /* v9.113: e a MENTE. Vazio é legítimo — aí o Adversário volta a
           classificar pelo nome, que é o certo para mundo sem léxico. */
        mente: MENTES.includes(String((x && x.mente) || "").toLowerCase().trim()) ? String(x.mente).toLowerCase().trim() : "",
        nomes: lista(x && x.nomes, 6, TETOS.curto),
      }))
      .filter((x) => x.ameaca && x.nomes.length)
      .filter((x, i, a) => a.findIndex((y) => y.ameaca === x.ameaca) === i),
    naoExiste: lista(o.naoExiste, TETOS.naoExiste, TETOS.curto),
    cidades: lista(o.cidades, TETOS.cidades, TETOS.curto),
    tavernas: lista(o.tavernas, TETOS.tavernas, TETOS.medio),
    /* v9.103: os lugares passam a ser POR TIPO MECÂNICO. `tipo` tem de
       ser um dos que o código conhece; `chamado` é como ele se chama
       aqui; `nomes` são os nomes próprios. Tipo inventado não entra. */
    lugares: (Array.isArray(o.lugares) ? o.lugares : [])
      .map((x) => ({
        tipo: TIPOS_DE_LUGAR.includes(String((x && x.tipo) || "").toLowerCase().trim()) ? String(x.tipo).toLowerCase().trim() : "",
        chamado: limpar(x && x.chamado, TETOS.curto),
        nomes: lista(x && x.nomes, 6, TETOS.medio),
      }))
      .filter((x) => x.tipo && (x.chamado || x.nomes.length))
      .filter((x, i, a) => a.findIndex((y) => y.tipo === x.tipo) === i)
      .slice(0, TIPOS_DE_LUGAR.length),
    faccoes: (Array.isArray(o.faccoes) ? o.faccoes : [])
      .map((x) => ({ nome: limpar(x && x.nome, TETOS.curto), quer: limpar(x && x.quer, TETOS.medio) }))
      .filter((x) => x.nome)
      .slice(0, TETOS.faccoes),
    /* ---------------- OS NOMES PRÓPRIOS (v9.102) ----------------
       O buraco mais visível da v9.101: o mundo de caçadores gerou
       "Alaric Punho-de-Pedra, vendedor de equipamento". Os ofícios e os
       povos já vinham do léxico; os NOMES continuavam saindo do banco do
       gênero, e um nome de fantasia num mundo moderno desmente tudo o que
       a linha ao lado acabou de afirmar.

       Nome próprio é o campo mais seguro do léxico inteiro: não há
       mecânica atrás de um nome. Nada consulta "Aldric" para decidir
       coisa nenhuma — o registro de gente é por chave, e a chave é o
       nome que estiver lá. */
    nomes: {
      masc: lista(o.nomes && o.nomes.masc, 24, TETOS.nome),
      fem: lista(o.nomes && o.nomes.fem, 24, TETOS.nome),
      sobrenome: lista(o.nomes && o.nomes.sobrenome, 24, TETOS.nome),
      /* as cidades do MAPA nascem da combinação de duas partes, e não da
         lista de oito nomes prontos: um continente tem catorze a vinte
         assentamentos, e oito nomes prontos repetiriam na terceira
         região. As partes dão centenas. */
      cidadeA: lista(o.nomes && o.nomes.cidadeA, 16, TETOS.parte),
      cidadeB: lista(o.nomes && o.nomes.cidadeB, 16, TETOS.parte),
      continente: limpar(o.nomes && o.nomes.continente, TETOS.terra),
    },
    /* v9.109: e como cada raça do sistema se chama aqui. A lista é
       fechada: um nome que o código não conhece não entra, porque não
       haveria bônus atrás dele. */
    racas: (Array.isArray(o.racas) ? o.racas : [])
      .map((x) => ({
        raca: RACAS_DO_SISTEMA.find((r) => r.toLowerCase() === String((x && x.raca) || "").toLowerCase().trim()) || "",
        chamado: limpar(x && x.chamado, TETOS.curto),
      }))
      .filter((x) => x.raca && x.chamado)
      .filter((x, i, a) => a.findIndex((y) => y.raca === x.raca) === i)
      .slice(0, RACAS_DO_SISTEMA.length)
      /* v9.113: TUDO OU NADA, como o equipamento. Numa partida de teste
         saiu "normal · Elfo · Anão · fendido · Draconato · tocado" na
         mesma lista: metade renomeada lê como mundo quebrado, e é a
         metade que sobrou que denuncia a outra. Nenhuma renomeada lê
         como genérico, que ao menos é coerente consigo. */
      .reduce((acc, _, __, todas) => (todas.length === RACAS_DO_SISTEMA.length ? todas : []), []),
    /* v9.111: o banco de nomes POR FORMA, e ele é TUDO OU NADA.

       Todo o resto do léxico degrada em pedaços: metade dos ofícios é
       melhor que nenhum. O equipamento não, e o motivo é mecânico — a
       defesa do herói é uma escada de armaduras, e um mundo sem o degrau
       pesado tira CA do jogo inteiro. Meio catálogo renomeado também lê
       como mundo quebrado: uma cota de malha ao lado de um manto de
       auror. Nenhum renomeado lê como mundo genérico, que é honesto.

       Cada forma precisa de pelo menos TRÊS nomes: com um só, todo
       machado do mundo se chamaria a mesma coisa. */
    equipamento: (() => {
      const bruto = (o && o.equipamento && typeof o.equipamento === "object") ? o.equipamento : {};
      const out = {};
      for (const id of FORMAS_DO_EQUIPAMENTO) {
        const nomes = lista(bruto[id], 8, TETOS.equipamento).map((x) => aparar(x, TETOS.equipamento)).filter(Boolean);
        if (nomes.length < 3) return {};      /* falta uma: cai o banco inteiro */
        out[id] = nomes;
      }
      return out;
    })(),
    /* v9.114: os ofícios da FICHA, pelas mesmas duas colunas das raças e
       com o mesmo tudo-ou-nada. O nome é identificador — `profissaoDe`
       casa por ele e o efeito sai dali —, o chamado é só tela. */
    profissoes: (() => {
      const bruto = (Array.isArray(o.profissoes) ? o.profissoes : [])
        .map((x) => ({
          profissao: PROFISSOES_DO_SISTEMA.find((r) => r.toLowerCase() === String((x && x.profissao) || "").toLowerCase().trim()) || "",
          chamado: limpar(x && x.chamado, TETOS.curto),
        }))
        .filter((x) => x.profissao && x.chamado)
        .filter((x, i, a) => a.findIndex((y) => y.profissao === x.profissao) === i);
      return bruto.length === PROFISSOES_DO_SISTEMA.length ? bruto : [];
    })(),
    /* v9.114: os afixos do mundo, por degrau. Tudo-ou-nada: um degrau
       vazio faria os itens daquela raridade voltarem ao banco medieval
       enquanto os vizinhos falam a língua do mundo. */
    afixos: (() => {
      const bruto = (o && o.afixos && typeof o.afixos === "object") ? o.afixos : {};
      /* v9.114: A GARANTIA TEM DE SER IDEMPOTENTE. Este é o único campo
         que entra numa forma ({grau0..}) e sai noutra ({prefixos:{0..}}),
         e `garantirLexico` roda muitas vezes sobre o mesmo léxico — uma
         em `lerLexico` e outra em cada leitor. Sem esta linha, a segunda
         passada não achava `grau0`, nenhum degrau tinha três nomes e o
         banco do mundo era zerado logo depois de ser aceito. */
      if (bruto.prefixos && typeof bruto.prefixos === "object") {
        const p2 = {};
        for (const d of DEGRAUS_DE_AFIXO) {
          const lst = lista(bruto.prefixos[d.n], 6, TETOS.curto);
          if (lst.length < 3) return { prefixos: {}, sufixos: [] };
          p2[d.n] = lst;
        }
        const sf = lista(bruto.sufixos, 12, TETOS.curto);
        return sf.length >= 6 ? { prefixos: p2, sufixos: sf } : { prefixos: {}, sufixos: [] };
      }
      const out = { prefixos: {}, sufixos: [] };
      for (const d of DEGRAUS_DE_AFIXO) {
        const lst = lista(bruto[`grau${d.n}`], 6, TETOS.curto);
        if (lst.length < 3) return { prefixos: {}, sufixos: [] };
        out.prefixos[d.n] = lst;
      }
      out.sufixos = lista(bruto.sufixos, 12, TETOS.curto);
      if (out.sufixos.length < 6) return { prefixos: {}, sufixos: [] };
      return out;
    })(),
    aLei: limpar(o.aLei, TETOS.texto),
    comoSeFala: limpar(o.comoSeFala, TETOS.texto),
  };
}

/* Um léxico existe de verdade quando tem com que trabalhar. Abaixo disso
   ele é ruído: melhor o genérico, que ao menos é coerente consigo. */
export function lexicoVale(l) {
  const x = garantirLexico(l);
  const peso = Object.keys(x.chamado).length + Object.keys(x.funciona).length * 2
    + x.povos.length + x.oficios.length + x.lugares.length + x.criaturas.length
    + (x.aLei ? 2 : 0) + (nomesDo(x) ? 4 : 0) + (partesDeCidade(x) ? 2 : 0);
  return peso >= 12;
}

/* ---------------- OS LEITORES ----------------
   Cada um responde "o léxico tem isto?" e, se não tiver, devolve null
   para que o banco genérico responda. É a mesma forma do
   `OCUPACOES[g] || OCUPACOES[padrão]` que já existia — só que agora o
   primeiro termo pode vir do mundo. */
export function oficiosDo(l) { const x = garantirLexico(l); return x.oficios.length >= 4 ? x.oficios : null; }
export function povosDo(l) { const x = garantirLexico(l); return x.povos.length >= 2 ? x.povos : null; }
/* A lista chapada, para o prompt dizer o que ameaça as pessoas aqui. */
export function criaturasDo(l) {
  const todas = garantirLexico(l).criaturas.flatMap((c) => c.nomes);
  return todas.length >= 3 ? todas : null;
}
/* E o banco de UM degrau, para nomear um bicho sem mentir sobre o que ele
   é. Devolve null com menos de dois nomes: um nome só faria a região
   inteira ter a mesma besta. */
export function criaturasDaAmeaca(l, ameaca) {
  const c = garantirLexico(l).criaturas.find((x) => x.ameaca === ameaca);
  return c && c.nomes.length >= 2 ? c.nomes : null;
}
/* Como um tipo de lugar se chama aqui, e que nomes próprios ele recebe. */
export function chamadoDoLugar(l, tipo) {
  const x = garantirLexico(l).lugares.find((p) => p.tipo === tipo);
  return (x && x.chamado) || "";
}
/* Os nomes de uma forma. Vazio quando o mundo não trouxe banco — e aí
   quem chama usa o catálogo de sempre, que é o comportamento honesto. */
/* A mente que o mundo declarou para um bicho, pelo NOME dele. Vazio
   quando o mundo não disse — e aí quem chama classifica como sempre. */
export function menteDoBicho(l, nome) {
  const alvo = String(nome || "").toLowerCase().trim();
  if (!alvo) return "";
  for (const c of garantirLexico(l).criaturas) {
    if (!c.mente) continue;
    if (c.nomes.some((x) => alvo.includes(String(x).toLowerCase()))) return c.mente;
  }
  return "";
}

export function nomesDaForma(l, forma) {
  const e = garantirLexico(l).equipamento;
  return (e && e[forma]) || [];
}
export function temEquipamentoProprio(l) {
  return Object.keys(garantirLexico(l).equipamento).length === FORMAS_DO_EQUIPAMENTO.length;
}

/* ---------------- O FEMININO POR REGRA ----------------
   Pedir [masculino, feminino] dobraria o campo num JSON que já estoura
   o teto. Em português o adjetivo terminado em -o faz -a, o terminado
   em -ão faz -ã, e o resto é invariável ("Militar", "Industrial",
   "Cinza", "Feroz"). Cobre quase tudo; o que não cobre sai invariável,
   que é o erro pequeno — "a Blindada" errado é pior que "a Militar"
   certo, e o segundo é o que acontece por padrão. */
export function feminizar(palavra) {
  const p = String(palavra || "").trim();
  if (!p) return p;
  /* LOCUÇÃO NÃO FLEXIONA. "de patrulha", "com núcleo", "do Primeiro
     Portão" qualificam sem concordar — e a regra ão→ã, que é de
     adjetivo, transformava "do Primeiro Portão" em "do Primeiro Portã".
     Uma palavra flexiona; duas ou mais, não. */
  if (/\s/.test(p)) return p;
  if (/ão$/.test(p)) return p.slice(0, -2) + "ã";
  if (/o$/.test(p)) return p.slice(0, -1) + "a";
  return p;
}

/* Os prefixos de um degrau, no par [masculino, feminino] que o loot
   espera. Vazio quando o mundo não trouxe banco. */
export function afixosDoGrau(l, grau) {
  const a = garantirLexico(l).afixos;
  const lst = (a && a.prefixos && a.prefixos[grau]) || [];
  return lst.map((x) => [x, feminizar(x)]);
}
export function sufixosDo(l) { const a = garantirLexico(l).afixos; return (a && a.sufixos) || []; }
export function temAfixosProprios(l) {
  const a = garantirLexico(l).afixos;
  return !!a && Object.keys(a.prefixos || {}).length === DEGRAUS_DE_AFIXO.length && (a.sufixos || []).length >= 6;
}

/* Como um ofício da ficha se chama neste mundo. Devolve o nome do
   catálogo quando o mundo não o renomeou. */
export function chamadoDaProfissao(l, nome) {
  const x = garantirLexico(l).profissoes.find((r) => r.profissao === nome);
  return (x && x.chamado) || String(nome || "");
}
export function profissoesRenomeadas(l) { return garantirLexico(l).profissoes; }

/* Como uma raça se chama neste mundo. Devolve o nome canônico quando o
   léxico não a renomeou — nunca vazio, porque quem chama está desenhando
   uma tela e uma tela não pode ficar sem rótulo. */
export function chamadoDaRaca(l, nome) {
  const x = garantirLexico(l).racas.find((r) => r.raca === nome);
  return (x && x.chamado) || String(nome || "");
}
export function racasRenomeadas(l) { return garantirLexico(l).racas; }

export function nomesDeLugar(l, tipo) {
  const x = garantirLexico(l).lugares.find((p) => p.tipo === tipo);
  return x && x.nomes.length >= 2 ? x.nomes : null;
}
export function cidadesDo(l) { const x = garantirLexico(l); return x.cidades.length >= 3 ? x.cidades : null; }
export function tavernasDo(l) { const x = garantirLexico(l); return x.tavernas.length >= 2 ? x.tavernas : null; }
/* Os nomes de gente só valem em BLOCO: metade do banco deste mundo com
   metade do banco medieval produziria "Aldric" ao lado de "Min-ji" na
   mesma taverna, que é pior do que os dois bancos puros. Ou os três
   campos vieram, ou nenhum vale. */
export function nomesDo(l) {
  const x = garantirLexico(l).nomes;
  if (x.masc.length >= 6 && x.fem.length >= 6 && x.sobrenome.length >= 4) return x;
  return null;
}
/* As partes de nome de cidade, pela mesma razão e com o mesmo tudo-ou-nada. */
export function partesDeCidade(l) {
  const x = garantirLexico(l).nomes;
  return (x.cidadeA.length >= 6 && x.cidadeB.length >= 6) ? { a: x.cidadeA, b: x.cidadeB } : null;
}
export function continenteDo(l) { return garantirLexico(l).nomes.continente || ""; }
export function comoChamam(l, id) {
  const x = garantirLexico(l);
  const c = coisaPorId(id);
  return (c && x.chamado[id]) || (c && c.padrao) || "";
}
/* A adaptação de UM sistema, para quem vai abrir esse sistema agora. É
   por aqui que o envelope da masmorra passa a dizer "e aqui masmorra é
   isto" no instante em que a masmorra abre. */
export function comoFunciona(l, id) { return garantirLexico(l).funciona[id] || ""; }

/* ---------------- O PEDIDO ----------------
   O prompt que gera o léxico. Roda UMA vez, na criação, com o modelo
   forte: é frio, ninguém está esperando um turno, e o que sair daqui vai
   governar a campanha inteira. Vale o gasto. */
export function pedidoDoLexico(mundo) {
  const m = mundo || {};
  const genero = limpar(m.genero, 60) || "Fantasia medieval";
  const desc = limpar(m.descricao, 1200);
  return `Você é o Léxico: quem decide como um mundo de RPG se chama e como ele funciona, antes de a primeira cena existir.

O jogador criou este mundo:
· Gênero: ${genero}
· Descrição dele, palavra por palavra: "${desc || "(não escreveu nada — trabalhe só com o gênero)"}"

O sistema deste jogo já tem TODAS as mecânicas prontas e elas NÃO mudam: níveis, habilidades de catálogo, combate por rodadas, masmorras com salas e um chefe no fundo, viagem por dias de estrada, mercado, missões, descanso, fama. Sua tarefa NÃO é criar mecânica nenhuma — é dizer como cada uma dessas coisas APARECE neste mundo, para que o Mestre pare de narrar um calabouço de pedra num mundo que não tem nenhum.

Exemplo do que se espera, para ficar claro: num mundo de caçadores modernos, a masmorra do sistema continua tendo salas, chefe e chave — mas ela SE APRESENTA como um portal que se abre sozinho num lugar público, que não fecha enquanto o chefe lá dentro respirar, e que engole quem entra despreparado. Mesmas regras, outra carne.

REGRAS INEGOCIÁVEIS:
1. PALAVRAS, NUNCA NÚMEROS. Não invente habilidade, magia, poder, rank com bônus, dano, dificuldade nem preço. Nada de mecânica nova, nenhum número. Você nomeia, povoa e reveste; quem equilibra é o código.
2. SE A DESCRIÇÃO CITAR UMA HISTÓRIA QUE EXISTE, entregue o MUNDO QUE ELA EVOCA — as regras, os papéis, o tom, a estrutura social —, com NOMES PRÓPRIOS NOVOS, inventados por você. Nunca use nomes de personagens, lugares ou organizações da obra citada, nem frases dela. O mundo tem de ser do jogador, não uma cópia.
3. FIDELIDADE ACIMA DE CRIATIVIDADE. Se ele escreveu "caçadores", tudo é de caçadores — não caçadores com um reino medieval em volta.
4. MECANISMO, NÃO ADJETIVO. Em cada resposta de "funciona", diga COMO a coisa acontece (quem, onde, o que trava, o que dá errado), não que ela é sombria ou perigosa.
5. DOIS CAMPOS TÊM LISTA FECHADA, e ela não é sugestão. Em "lugares", o "tipo" tem de ser EXATAMENTE uma das palavras listadas: são engrenagens do jogo e não mudam — o que você escolhe é como cada uma SE CHAMA aqui. Em "criaturas", a "ameaca" idem: ela decide a força do bicho, e um nome guardado no degrau errado promete uma coisa e entrega outra.
6. AS RAÇAS TAMBÉM TÊM LISTA FECHADA, e o que você escolhe é só o NOME. Cada uma carrega um bônus de atributo que NÃO muda: você está dando a elas a palavra deste mundo, não inventando povos. RENOMEIE TODAS, sem exceção: uma ficha com metade dos nomes deste mundo e metade com os de sempre lê pior que uma ficha inteira genérica, porque a metade que sobrou denuncia a outra. Se um tipo de gente parecer não existir aqui, dê a ele o nome do que MAIS SE APROXIMA neste mundo — a mecânica dele continua no jogo de qualquer forma, e sem nome daqui ela aparece com o nome de outro lugar. Use a mesma cultura de "povos": "povos" é quem habita o mundo, "racas" é o que o jogador pode SER.
7. O EQUIPAMENTO É TUDO OU NADA, e o que você nomeia é a FORMA, nunca o item. Cada forma vem com o que ela É por baixo — pesada, de duas mãos, pede treino, trava magia. O nome que você der NÃO PODE CONTRADIZER ISSO: se a forma diz "arma de guerra pesada de duas mãos", um nome como "varinha" mente para o jogador, que vai escolhê-la achando que é leve. Preencha TODAS as dezessete, com 3 a 6 nomes cada. Se o mundo parecer não ter armadura pesada, invente o EQUIVALENTE dele — o sistema calcula a defesa numa escada e tirar um degrau tira proteção do jogo inteiro. Se você deixar UMA forma de fora, o banco inteiro é descartado.
8. AS DOZE PROFISSÕES DA FICHA são as mesmas doze, sempre, e cada uma carrega um efeito no código que NÃO muda — quem cura mais no descanso continua curando mais, chame-se ele curandeiro ou enfermeiro de contenção. Dê a TODAS o ofício deste mundo que mais se aproxima do que a palavra descreve, e não invente ofício que o sistema não tem. Se faltar uma, o banco inteiro é descartado. Não confunda com "oficios", que é do que a gente comum vive: estes doze são o que o JOGADOR pode ser.
9. OS AFIXOS TÊM DEGRAU, e o degrau é mecânica. Em "afixos", cada grau diz o quanto a palavra PROMETE: a do grau 0 sai num item vagabundo, a do grau 4 só na coisa mais rara que existe. Uma palavra grandiosa no grau 0 faz todo nome bonito do jogo perder o crédito. Cada afixo é UMA PALAVRA SÓ no MASCULINO SINGULAR — o sistema faz o feminino e o plural sozinho, e uma locução como "de contenção" fica torta na frente do nome — e preencha os cinco graus e os sufixos, ou o banco inteiro é descartado.
10. PREENCHA TODOS OS DEGRAUS DE AMEAÇA e o máximo de tipos de lugar que fizerem sentido. Se um tipo parecer não existir neste mundo, invente o EQUIVALENTE dele em vez de pular — pular tira a coisa do jogo, e o jogo conta com ela.
11. Português do Brasil. Cada campo de "funciona" no máximo duas frases.

Responda SÓ com este JSON, sem comentários e sem texto fora dele:

{
  "chamado": {
${COISAS.map((c) => `    "${c.id}": "como se chama ${c.o} (genérico: \\"${c.padrao}\\")"`).join(",\n")}
  },
  "funciona": {
${SISTEMAS.map((s) => `    "${s.id}": "${s.pergunta}"`).join(",\n")}
  },
  "povos": ["os povos/tipos de gente deste mundo, 3 a 8 — substituem 'elfo, anão, halfling'"],
  "oficios": ["do que as pessoas vivem aqui, 8 a 16 — substituem 'ferreiro, taverneiro, escriba'"],
  "lugares": [
    { "tipo": "<UM de: ${TIPOS_DE_LUGAR.join(", ")}>", "chamado": "como esse tipo de lugar se chama NESTE mundo", "nomes": ["3 a 6 nomes próprios de lugares assim"] }
  ],
  "criaturas": [
    { "ameaca": "<UM de: ${AMEACAS.join(", ")}>", "mente": "<UM de: ${MENTES.join(", ")} — besta é bicho que não faz plano, morto é o que não teme morrer nem negocia, pensa é gente ou coisa com vontade>", "nomes": ["3 a 6 nomes de coisas dessa força que ameaçam as pessoas aqui"] }
  ],
  "faccoes": [{ "nome": "nome próprio de uma potência daqui", "quer": "o que ela quer, em meia linha" }],
  "cidades": ["8 nomes próprios de cidade no estilo deste mundo"],
  "tavernas": ["4 nomes próprios para o lugar onde se encontra gente e trabalho"],
  "nomes": {
    "masc": ["12 a 20 primeiros nomes masculinos como se dão NESTE mundo — a cultura, a língua e a época dele, não os do gênero"],
    "fem": ["12 a 20 primeiros nomes femininos, idem"],
    "sobrenome": ["12 a 20 sobrenomes, alcunhas ou o que faça as vezes de sobrenome aqui"],
    "cidadeA": ["10 a 16 PRIMEIRAS partes de nome de cidade daqui (ex.: 'Porto', 'Alto', 'Setor')"],
    "cidadeB": ["10 a 16 SEGUNDAS partes, que se combinam com as de cima (ex.: 'do Norte', 'Baixo', '-9')"],
    "continente": "o nome da terra maior onde tudo isto acontece"
  },
  "equipamento": {
${FORMAS_MECANICAS.map((f) => `    "${f.id}": ["3 a 6 nomes para: ${f.o}"]`).join(",\n")}
  },
  "afixos": {
${DEGRAUS_DE_AFIXO.map((d) => `    "grau${d.n}": ["3 a 6 adjetivos de UMA PALAVRA SÓ, no masculino singular, que qualificam uma peça de equipamento neste mundo (nada de \"de algo\" nem \"com algo\": eles vão ANTES do nome e uma locução ali fica torta) — ${d.o}"]`).join(",\n")}
    , "sufixos": ["6 a 12 complementos no formato \"do/da X\" para o nome de um item lendário deste mundo (ex.: \"do Vazio\", \"da Última Guerra\") — nomes de coisas, lugares e gente QUE EXISTAM AQUI"]
  },
  "profissoes": [
    { "profissao": "<UM de: ${PROFISSOES_DO_SISTEMA.join(", ")}>", "chamado": "o ofício deste mundo que MAIS SE APROXIMA do que essa palavra descreve" }
  ],
  "racas": [
    { "raca": "<UM de: ${RACAS_DO_SISTEMA.join(", ")}>", "chamado": "como esse tipo de gente se chama NESTE mundo" }
  ],
  "naoExiste": ["3 a 6 coisas que o gênero faria esperar e que NESTE mundo não existem"],
  "aLei": "a UMA regra que rege este mundo e não regeria outro — no máximo duas frases",
  "comoSeFala": "como as pessoas falam aqui: registro, gírias próprias, o que é tabu dizer — no máximo duas frases"
}`;
}

/* ---------------- O LEITOR DO TEXTO ----------------
   O léxico tem CONTRATO PRÓPRIO e por isso precisa do próprio leitor.

   A primeira versão passava a resposta pelo `extrairJSON` do jogo, que
   parecia o caminho óbvio — é o leitor de JSON da casa. Só que ele
   termina em `sanearResposta`, que devolve exatamente
   {narrativa, perigo, rolagem, mudancas, sugestoes} e descarta o resto.
   O léxico chegava inteiro do modelo e era jogado fora em silêncio: a
   criação não quebrava, não avisava nada, e o mundo saía genérico como
   antes. Levou uma partida de teste para aparecer.

   Reusar um leitor feito para outro contrato é o mesmo erro que esta
   casa já catalogou do lado das regras — a diferença é que aqui ele não
   deixa rastro nenhum, porque o caminho de falha do léxico é justamente
   "fica genérico". */
/* ---------------- O RESGATE DO JSON CORTADO (v9.113) ----------------
   Fecha o que ficou aberto e joga fora só o último item, o incompleto.

   Isto não é remendo de conveniência: é a diferença entre perder um
   campo e perder o mundo. Antes, um corte de token descartava o léxico
   inteiro e a campanha nascia medieval sem ninguém saber por quê — foi
   exatamente o que aconteceu numa partida de teste, com o Mestre tendo
   respondido certo.

   Percorre caractere a caractere porque precisa saber quando está
   DENTRO de uma string: uma chave dentro de aspas não abre nada, e
   contar sem olhar isso fecharia no lugar errado. */
function fecharJSON(cru) {
  const pilha = [];
  let dentroDeAspas = false, escapado = false, ultimoSeguro = -1;
  for (let i = 0; i < cru.length; i++) {
    const c = cru[i];
    if (escapado) { escapado = false; continue; }
    if (c === "\\") { escapado = true; continue; }
    if (c === '"') { dentroDeAspas = !dentroDeAspas; continue; }
    if (dentroDeAspas) continue;
    if (c === "{" || c === "[") pilha.push(c);
    else if (c === "}" || c === "]") pilha.pop();
    /* uma vírgula no nível 1 fecha um campo inteiro do léxico: é o
       último ponto em que dá para cortar sem levar meio campo junto */
    else if (c === "," && pilha.length === 1) ultimoSeguro = i;
  }
  if (!pilha.length) return null;
  if (ultimoSeguro < 0) return null;
  /* corta no último campo completo e fecha o que a pilha diz que abriu */
  const corte = cru.slice(0, ultimoSeguro);
  const p2 = [];
  let asp = false, esc = false;
  for (let i = 0; i < corte.length; i++) {
    const c = corte[i];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (c === '"') { asp = !asp; continue; }
    if (asp) continue;
    if (c === "{" || c === "[") p2.push(c);
    else if (c === "}" || c === "]") p2.pop();
  }
  return corte + p2.reverse().map((c) => (c === "{" ? "}" : "]")).join("");
}

export function lexicoDoTexto(texto) {
  try {
    const limpo = String(texto || "").replace(/```json/gi, "").replace(/```/g, "").trim();
    const i = limpo.indexOf("{");
    if (i < 0) return null;
    const f = limpo.lastIndexOf("}");
    const cru = f > i ? limpo.slice(i, f + 1) : limpo.slice(i);
    try { return JSON.parse(cru); } catch { /* segue */ }
    /* a vírgula sobrando é o erro de JSON mais comum de modelo, e é o
       único que vale a pena tentar consertar: o resto é adivinhação */
    try { return JSON.parse(cru.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]")); } catch { /* segue */ }
    /* v9.113: e a resposta CORTADA no meio, que era o caso que custava
       o mundo inteiro. Tenta a partir do texto sem aparar pelo último
       "}" — num JSON truncado esse "}" é de um objeto interno e leva
       junto todo o resto que veio bom. */
    for (const tentativa of [limpo.slice(i), cru]) {
      const fechado = fecharJSON(tentativa);
      if (!fechado) continue;
      try {
        const o = JSON.parse(fechado);
        try { if (import.meta.env && import.meta.env.DEV) console.warn("[lexico] resposta cortada; resgatados", Object.keys(o).length, "campos"); } catch { /* fora do Vite */ }
        return o;
      } catch { /* segue */ }
    }
    return null;
  } catch { return null; }
}

/* Lê a resposta. Nunca lança: um léxico que quebra a criação é pior que
   um mundo genérico, e a criação é o único momento do jogo em que o
   jogador ainda não tem nada para perder — nem para salvar. */
export function lerLexico(obj) {
  try {
    const l = garantirLexico(obj);
    if (!lexicoVale(l)) return garantirLexico(null);
    return { ...l, gerado: true };
  } catch {
    return garantirLexico(null);
  }
}

/* ---------------- O QUE SOBE AO PROMPT ----------------
   Só o que NADA MAIS diz. Os nomes de cidade, as tavernas e o elenco já
   têm seção própria e passam a ser preenchidos pelo léxico — mudam de
   conteúdo sem mudar de custo. O que sobra de novo é o vocabulário, a
   lei, as ausências e as adaptações da cena que está aberta.

   `portas` é o mapa {id: boolean} que `prompt.js` já monta. Sem ele,
   entram só as quatro de sempre — que é o comportamento certo para quem
   chamar sem saber da cena. */
export function lexicoPrompt(l) {
  const x = garantirLexico(l);
  if (!x.gerado) return "";
  /* A FILA DE PRIORIDADE. Quem está no topo entra sempre; quem está no
     fim entra se sobrar. A adaptação da cena ABERTA vem antes das de
     sempre de propósito: se o herói está dentro de um portal agora, como
     o portal funciona vale mais que como a reputação circula. */
  const fila = [];
  const ap = Object.entries(x.chamado).map(([k, v]) => {
    const c = coisaPorId(k);
    return c ? `${c.padrao} = ${v}` : "";
  }).filter(Boolean);
  if (ap.length) fila.push(`COMO AS COISAS SE CHAMAM AQUI (use SEMPRE a palavra da direita; a da esquerda é a etiqueta interna do sistema): ${ap.join(" · ")}.`);
  if (x.aLei) fila.push(`A LEI DESTE MUNDO: ${x.aLei}`);
  /* v9.113: O VETO SOBE, e antes dos parágrafos. Ele vinha no fim da fila
     e numa cena com portas abertas nunca cabia: numa partida de teste, num
     mundo cujo léxico diz "não há cavalos como meio de transporte", o
     Narrador pôs uma carroça na rua no segundo dia.

     É a regra que a Pauta já enuncia: um veto cortado é exatamente como a
     incoerência entra, e ele não avisa que foi cortado. Cento e cinquenta
     caracteres de proibição direta valem mais que um parágrafo sobre como
     a reputação circula — aquilo o Mestre infere, isto ele não tem como. */
  if (x.naoExiste.length) fila.push(`NÃO EXISTE NESTE MUNDO (nunca ponha em cena): ${x.naoExiste.join(", ")}.`);
  /* e os nomes dos LUGARES, pelo mesmo motivo: são curtos, são a palavra
     que o Narrador vai escrever, e ficavam abaixo do corte junto com o
     veto — foi assim que "taverna" continuou aparecendo num mundo que
     chama aquilo de cantina. */
  const chamados = x.lugares.filter((p) => p.chamado).map((p) => `${p.tipo} = ${p.chamado}`);
  if (chamados.length) fila.push(`E OS LUGARES SE CHAMAM: ${chamados.join(" · ")}.`);
  /* v9.162: a adaptação DA CENA saiu daqui — mora em lexicoDaCena e desce
     para o fim do prompt. Este bloco ficou o mesmo para a campanha
     inteira, e é essa mesmice que o torna cacheável: só entra aqui o que
     não depende de onde o herói está. */
  const deSempre = [];
  for (const s of SISTEMAS) {
    const t = x.funciona[s.id];
    if (!t || s.porta !== null) continue;
    deSempre.push(`${s.rotulo}: ${t}`);
  }
  fila.push(...deSempre);
  const bichos = criaturasDo(x);
  if (bichos) fila.push(`O QUE AMEAÇA AS PESSOAS: ${bichos.slice(0, 8).join(", ")}.`);
  if (x.comoSeFala) fila.push(`COMO SE FALA: ${x.comoSeFala}`);
  /* e o corte, em silêncio: o que não cabe hoje cabe na cena de amanhã.

     A MOLDURA CONTA. O orçamento é do BLOCO, não da lista dentro dele —
     o cabeçalho, o rodapé e as quebras de linha sobem no prompt como
     qualquer outro caractere, e um teto que ignorasse a própria moldura
     estouraria por trezentos e cinquenta toda vez. */
  const cabeca = "═══ O MUNDO É ESTE (léxico da criação — CÂNONE, acima de qualquer hábito de gênero) ═══\n";
  const pe = "\nAs mecânicas do sistema NÃO mudam por causa disto: o que muda é a carne. Quando um envelope usar a etiqueta genérica (\"masmorra\", \"taverna\", \"criatura\", \"moedas\"), narre com a palavra e a forma DESTE mundo — a etiqueta é do código, a cena é da ficção.\n═══════════════════════════════════════";
  const disponivel = TETO_DO_BLOCO - cabeca.length - pe.length;
  const partes = [];
  let gasto = 0;
  for (const t of fila) {
    if (gasto + t.length + 1 > disponivel) continue;
    partes.push(t); gasto += t.length + 1;
  }
  if (!partes.length) return "";
  return `${cabeca}${partes.join("\n")}${pe}`;
}

/* ---------------- A ADAPTAÇÃO DA CENA, SEPARADA (v9.162) ----------------
   O lexicoPrompt de cima é o MESMO para a campanha inteira: chamado sem
   portas, ele entrega só o que não depende de onde o herói está. O que
   depende — como é um assentamento aqui, como é uma masmorra aqui — sai
   por esta função e desce para a zona de regras da cena, no fim do
   prompt.

   O motivo é dinheiro: o cache de prefixo morre no primeiro byte que
   muda, e a adaptação da cena morava a 5% do texto — cruzar um portão de
   cidade reescrevia o topo do prompt e cobrava os 95% restantes cheios.
   A mesma frase, dita no fim, custa um décimo. */
export function lexicoDaCena(l, portas) {
  const x = garantirLexico(l);
  if (!x.gerado || !portas) return "";
  const daCena = [];
  for (const s of SISTEMAS) {
    const t = x.funciona[s.id];
    if (!t || s.porta === null) continue;
    if (portas[s.porta]) daCena.push(`${s.rotulo}: ${t}`);
  }
  if (!daCena.length) return "";
  /* o mesmo corte silencioso do bloco fixo: o que não cabe hoje cabe na
     cena de amanhã — e a moldura conta no orçamento, como sempre.

     O teto daqui é PRÓPRIO e menor: dar ao bloco da cena os mesmos 1700
     do bloco fixo dobraria o pior caso do léxico no prompt — e a suíte
     do orçamento mordeu exatamente isso na primeira rodada. Adaptação de
     cena é frase, não parágrafo: 700 dá para três delas. */
  const cabeca = "═══ COMO ISTO FUNCIONA NESTE MUNDO (adaptação do léxico à cena aberta) ═══\n";
  const pe = "\n═══════════════════════════════════════";
  const disponivel = TETO_DA_CENA - cabeca.length - pe.length;
  const partes = [];
  let gasto = 0;
  for (const t of daCena) {
    if (gasto + t.length + 1 > disponivel) continue;
    partes.push(t); gasto += t.length + 1;
  }
  if (!partes.length) return "";
  return `${cabeca}${partes.join("\n")}${pe}`;
}

/* O envelope de uma adaptação, para quando o SISTEMA abre aquele sistema
   e quer que a IA veja a forma dele no instante em que ele acontece. */
export function envelopeDaAdaptacao(l, id) {
  const t = comoFunciona(l, id);
  const s = sistemaPorId(id);
  if (!t || !s) return "";
  return `[NESTE MUNDO — ${s.rotulo}] ${t} As regras e os números do sistema continuam valendo exatamente como vieram; o que muda é como isto se parece e como as pessoas falam disso.`;
}

/* ---------------- A LINHA DA MESA ----------------
   A primeira versão desta função dizia "19 coisas próprias deste lugar e
   15 sistemas adaptados entraram no jogo", e o teste a derrubou por uma
   razão que vale mais que a linha: O SISTEMA NÃO FALA DE SI MESMO. O
   jogador não adaptou quinze sistemas — ele criou um mundo, e o que
   aparece na tela tem de ser o mundo.

   Então a mesa recebe a coisa mais característica que o léxico produziu:
   a lei deste lugar, se houver uma, ou as palavras que ele passou a usar.
   Nenhum número, nenhuma contagem, nenhuma menção ao que fez isso. */
export function falaDoLexico(l) {
  const x = garantirLexico(l);
  if (!x.gerado) return "";
  if (x.aLei) return `📖 A lei deste mundo: ${x.aLei}`;
  const ap = Object.entries(x.chamado).slice(0, 3).map(([k, v]) => {
    const c = coisaPorId(k);
    return c ? `${c.padrao} é ${v}` : "";
  }).filter(Boolean);
  if (ap.length) return `📖 Neste mundo, ${ap.join(", ")}.`;
  if (x.criaturas.length) return `📖 O que ameaça as pessoas aqui: ${x.criaturas.slice(0, 3).join(", ")}.`;
  return "";
}
