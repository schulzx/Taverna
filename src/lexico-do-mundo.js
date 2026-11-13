/* ============================================================
   O LÉXICO DO MUNDO POR TABELA (NE6, 13/11/2026) — src/lexico-do-mundo.js

   A Fase NE (mente/plano-nada-entra.md): «nenhuma IA escreve estado de
   jogo». O Léxico (lexico.js#pedidoDoLexico) era uma IA que, uma vez por
   campanha, na criação, escrevia `mundo.lexico` — como as coisas se
   chamam, como os sistemas se apresentam, a regra do mundo, o passado, os
   títulos — e esse texto ia ao save e ao prompt de toda cena. A pessoa
   aprovou trocá-lo por tabelas nossas (13/11): *«aprovo as duas sugestões,
   pode começar»*.

   Esta peça produz O MESMO FORMATO (o de `garantirLexico`, lexico.js) a
   partir de duas coisas que o mundo já tem — o GÊNERO (os seis cartões da
   criação, mais o «Universo próprio») e o MOLDE (terras abertas, a torre, o
   arquipélago, as estrelas) — e da SEMENTE da campanha. Mesma semente,
   mesmo léxico, em qualquer máquina; sementes diferentes, mundos
   diferentes dentro do mesmo gênero (as variantes de cada campo e os
   recortes do passado, dos títulos, das potências).

   O QUE ELA ESCREVE, E O QUE DEIXA VAZIO. Vazio, no léxico, é a palavra
   combinada para «use o banco do gênero» (lexico.js, regra 2). Os bancos
   por gênero já existem e são tabelas (cenario-padrao.js: a gente, os
   nomes, as cidades, os povos, os ofícios, o bestiário, as raças, o
   equipamento) — repeti-los aqui seria dizer duas vezes a mesma coisa, e a
   segunda envelhece. Então esta peça escreve só o que nenhum banco tinha:
     · `chamado`  — como as coisas se chamam (a moeda, a guarda, a masmorra);
     · `funciona` — como os sistemas se apresentam (o mecanismo, não o adjetivo);
     · `lugares`  — como cada tipo de lugar se chama (só o nome do tipo);
     · `faccoes`, `passado`, `titulos`, `naoExiste`, `aLei`, `comoSeFala` e
       o nome do continente.
   E deixa vazios os nomes próprios, as cidades, os povos, os ofícios, as
   criaturas, o equipamento, as profissões e os afixos (as RAÇAS, que o
   léxico antigo rebatizava e nenhum banco nomeia, têm tabela — abaixo): o mundo
   nasce com os bancos de sempre, byte a byte os de uma campanha cujo
   Léxico falhava — que é o mundo que a casa já sabe gerar e provar.

   O «UNIVERSO PRÓPRIO» é o único cartão cuja descrição dizia tudo, e a
   IA era quem a lia. Sem IA, ele usa a tabela do gênero padrão do
   cenário (`generos.padrao`, cenario-padrao.js), que é também o banco que
   todos os outros geradores usam para ele. As tabelas vão pelo `id` do
   cartão da criação (`generos.criacao`), e o rótulo que o save guarda
   passa a id pelo cenário ativo — o nome do gênero não se repete aqui. A descrição do jogador continua a ir ao
   Narrador, palavra por palavra: é a voz de quem joga, não da IA.

   Puro, sem React, determinístico. Provado em testes/teste-lexico-do-mundo.mjs.
   ============================================================ */
import { garantirLexico } from "./lexico.js";
import { hashSemente, rng } from "./semente.js";
import { cenarioAtivo } from "./cenario.js";

/* quantos de cada recorte a semente tira (o resto fica para outra campanha) */
export const QUANTOS_NO_LEXICO = Object.freeze({ passado: 3, titulos: 8, naoExiste: 4, faccoes: 3 });


/* ---------------- OS GÊNEROS ----------------
   Pelo `id` do cartão da criação (cenario-padrao.js, `generos.criacao`).
   Cada campo com LISTA DE VARIANTES é sorteado pela semente (uma); os
   recortes (`passado`, `titulos`, `naoExiste`, `faccoes`) tiram
   QUANTOS_NO_LEXICO. Um `chamado` igual à palavra genérica é descartado
   pelo próprio `garantirLexico` — e é por isso que a fantasia quase não
   renomeia nada: é o mundo que as palavras genéricas já descrevem. */
export const LEXICO_DOS_GENEROS = Object.freeze({
  fantasia: {
    /* NE6+ (13/11): como cada raça do catálogo se chama neste gênero — três
       variantes por raça, uma pela semente (RACAS_DO_LEXICO) */
    racas: {
      Humano: ["Gente da Lavoura","Varonês","Filho do Vale"],
      Elfo: ["Povo da Copa","Lumério","Filho do Orvalho"],
      "Anão": ["Povo da Bigorna","Karrúnio","Filho da Pedra"],
      Halfling: ["Pé-de-Trevo","Sebeiro","Gente Miúda"],
      "Meio-orc": ["Sangue-Cinza","Filho da Fronteira","Brunhado"],
      Draconato: ["Escamado","Sangue-de-Brasa","Herdeiro da Asa"],
      Tiefling: ["Marcado","Filho do Pacto","Chifre-Negro"],
      Gnomo: ["Gente do Alambique","Quilhano","Filho da Toupeira"],
      "Meio-elfo": ["Filho de Duas Margens","Entremeio","Meio-Orvalho"],
      Goliath: ["Gente do Cume","Talhado","Filho da Neve Alta"],
    },
    chamado: {
      heroi: ["aventureiro", "espada de aluguel", "errante"],
      taverna: ["taverna", "estalagem"],
      masmorra: ["masmorra", "cripta", "ruína"],
      moeda: ["moedas", "coroas", "peças de prata"],
      autoridade: ["a guarda", "a milícia do senhor"],
      relicario: ["relíquia", "relíquia antiga"],
    },
    funciona: {
      heroi: [
        "Quem empunha armas por paga e corre estradas sem senhor é aventureiro: o povo o contrata quando a milícia não basta, e desconfia dele quando ela basta.",
        "Errantes são os sem-terra que vivem do perigo dos outros; ganham nome resolvendo o que o senhor local não resolve, e perdem-no no primeiro roubo.",
      ],
      poder: ["A força vem do treino, da fé ou de um dom de sangue; os que sobem de nível dizem que sobreviveram ao que matou os outros, e ninguém pergunta como."],
      fama: ["A fama anda de taverna em taverna na boca de bardos e carroceiros; chega antes do herói às cidades vizinhas e cresce a cada caneca."],
      ameaca: [
        "Uma ameaça de verdade é um senhor da guerra com castelo, ou algo antigo que acordou sob uma colina; ninguém a parou porque os reis estão ocupados um com o outro.",
        "O perigo grande tem nome e covil: um dragão, um necromante, um barão sem lei; os reinos pagam tributo em vez de pagar exército.",
      ],
      masmorra: [
        "Masmorras são fortalezas e templos caídos, com salas lacradas e um senhor no fundo; entra-se pela porta que restou e sai-se com o que se carrega.",
        "Criptas e ruínas guardam o que os antigos enterraram; quem desce leva tochas, porque lá embaixo nada acende sozinho, e quem cai lá fica.",
      ],
      viagem: ["Viaja-se a pé, a cavalo ou de carroça pelas estradas reais; entre as aldeias há bandidos, pedágios de senhores e o que vem da floresta à noite."],
      cidade: ["A cidade cresce dentro de muralhas: o mercado na praça, o templo no alto, a guarda no portão, e o medo do fogo, da peste e do cerco."],
      justica: ["Quem rouba vai ao tronco, quem mata vai à forca; o juiz é o senhor ou o seu magistrado, e o que paga bem costuma ser inocente."],
      fe: ["O povo reza aos deuses do panteão em capelas de pedra; os sacerdotes curam, casam e cobram, e a heresia ainda se queima em praça."],
      mercado: ["Compra-se em bancas de feira e em lojas de ofício, a dinheiro ou a troca; venenos e relíquias roubadas só nos fundos, com quem se conhece."],
    },
    lugares: [
      { tipo: "taverna", chamado: ["taverna", "estalagem"] },
      { tipo: "templo", chamado: ["capela", "templo"] },
      { tipo: "quartel", chamado: ["guarnição", "quartel da milícia"] },
      { tipo: "guilda", chamado: ["casa da guilda", "salão da guilda"] },
    ],
    faccoes: [
      { nome: "a Coroa", quer: "impostos em dia e nenhum barão forte demais" },
      { nome: "a Ordem do Escudo", quer: "uma cruzada que lhe dê terras" },
      { nome: "a Guilda dos Mercadores", quer: "estradas seguras e portagens baixas" },
      { nome: "o Culto da Lua Velha", quer: "o retorno de um deus esquecido" },
    ],
    passado: [
      "A Guerra dos Dois Reis, há trinta anos, deixou viúvas em toda aldeia e um trono que ainda se disputa.",
      "A Peste Cinzenta esvaziou metade das cidades há duas gerações; os cemitérios ainda transbordam.",
      "Há um século o último dragão caiu nas montanhas, e os seus ossos ainda se vendem como relíquia.",
      "A Muralha do Norte foi erguida contra algo que ninguém viu desde então, e a guarnição continua lá.",
      "O Grande Incêndio da capital, há vinte invernos, nunca teve culpado — mas todos têm um suspeito.",
    ],
    titulos: ["o Rei Sem Coroa", "a Mão Fria", "o Lobo do Vau", "a Viúva de Ferro", "o Último Paladino", "o Barão Rubro", "a Bruxa do Pântano", "o Carrasco Manso", "o Segundo Sol", "a Senhora das Cinzas"],
    naoExiste: ["pólvora", "imprensa", "relógios de bolso", "estradas calçadas fora da capital", "magia vendida em loja", "bancos"],
    aLei: [
      "Todo juramento feito diante de testemunhas obriga quem o fez, e quebrá-lo apaga o nome do quebrador em toda corte.",
      "Terra é poder: quem não tem senhor não tem lei, e quem não tem lei pode ser tomado por qualquer um.",
      "O sangue nobre manda e o dinheiro compra: um plebeu rico vale mais que um cavaleiro pobre, mas nunca diante do rei.",
    ],
    comoSeFala: [
      "Fala-se com vós aos de cima e tu aos iguais; xingar um deus em voz alta ainda é chamar desgraça para a casa.",
      "O povo fala por provérbios e juramentos; nome de morto recente não se diz em voz alta à mesa.",
    ],
    continente: ["Valdória", "as Terras de Aldmar", "Ermagard", "o Reino Partido"],
  },

  scifi: {
    /* NE6+ (13/11): como cada raça do catálogo se chama neste gênero — três
       variantes por raça, uma pela semente (RACAS_DO_LEXICO) */
    racas: {
      Terrano: ["Nascido-em-Solo","Berçário","Filho da Terra Velha"],
      "Colono Orbital": ["Anelar","Filho do Anel","Gente da Órbita"],
      "Sintético": ["Tecido","Consciente de Série","Filho do Molde"],
      Mutante: ["Reescrito","Filho da Radiação","Variante"],
      Cromado: ["Ampliado","Filho do Implante","Liga-Viva"],
      Vagante: ["Sem-Porto","Filho do Vácuo","Andarilho Estelar"],
    },
    chamado: {
      heroi: ["operador independente", "contratado", "agente livre"],
      grupo: ["tripulação", "equipe"],
      taverna: ["cantina", "bar da estação"],
      masmorra: ["casco abandonado", "estação morta", "complexo selado"],
      monstro: ["xenoforma", "organismo hostil"],
      faccao: ["corporação", "bloco"],
      cidade: ["estação", "colônia"],
      moeda: ["créditos"],
      magia: ["psiônica", "tecnologia anômala"],
      relicario: ["artefato alienígena", "tecnologia precursora"],
      autoridade: ["a segurança da estação", "a polícia orbital"],
    },
    funciona: {
      heroi: [
        "Operadores independentes são contratados para o que as corporações não querem assinar: resgates, escoltas, buscas em cascos mortos; o contrato registra tudo.",
        "Agentes livres vivem de licença: sem ela não atracam, com ela respondem a quem pagou; reputação é o histórico de contratos cumpridos.",
      ],
      poder: ["O poder vem de implantes, treino de combate e, raramente, de psiônica; subir de nível é ter sobrevivido e aprendido a usar melhor o equipamento."],
      fama: ["A reputação é um registro na rede: contratos, avaliações, ocorrências policiais; todo atracadouro lê seu histórico antes de liberar a doca."],
      ameaca: [
        "A ameaça grande é uma corporação com frota própria, ou algo vindo de fora do mapa conhecido; ninguém a parou porque cada governo espera que o outro pague.",
        "O perigo de verdade é um sinal que não devia existir, uma colônia que parou de responder, uma IA que ninguém desligou a tempo.",
      ],
      masmorra: [
        "Cascos abandonados e estações mortas: compartimentos selados, energia que falha, algo no núcleo; entra-se pela câmara de descompressão, sai-se com o que coube no traje.",
        "Complexos selados guardam o que um laboratório quis esconder; o ar acaba antes da coragem, e quem não volta vira sinal de socorro.",
      ],
      viagem: ["Viaja-se em naves de carga e linhas regulares entre estações; os saltos custam combustível, e entre as rotas há piratas, alfândegas e silêncio."],
      cidade: ["A estação tem anéis: as docas embaixo, o comércio no meio, os escritórios em cima; o medo é a falha de suporte de vida e a quarentena."],
      justica: ["A segurança da estação prende e a corporação dona julga; quem deve à empresa trabalha a dívida, e o que se faz fora do registro não aconteceu."],
      fe: ["Uns rezam à Terra perdida, outros a profetas de colônia; a fé aparece em capelas de anel e em amuletos de piloto antes do salto."],
      mercado: ["Compra-se em lojas licenciadas e em mercados de doca; armas pesadas e tecnologia precursora só em leilão fechado ou em carga sem manifesto."],
    },
    lugares: [
      { tipo: "taverna", chamado: ["cantina", "bar da doca"] },
      { tipo: "mercado", chamado: ["mercado da doca", "galeria comercial"] },
      { tipo: "forja", chamado: ["oficina de reparos", "estaleiro"] },
      { tipo: "quartel", chamado: ["posto de segurança"] },
      { tipo: "docas", chamado: ["hangar", "atracadouro"] },
      { tipo: "biblioteca", chamado: ["arquivo de dados"] },
    ],
    faccoes: [
      { nome: "o Consórcio Meridiano", quer: "monopólio das rotas de salto" },
      { nome: "a Liga das Colônias Livres", quer: "independência sem pagar a dívida" },
      { nome: "a Frota de Defesa", quer: "orçamento e um inimigo que o justifique" },
      { nome: "os Herdeiros do Sinal", quer: "abrir o que os precursores fecharam" },
    ],
    passado: [
      "A Queda da Terra, há dois séculos, espalhou a humanidade em colônias que ainda não se entendem.",
      "A Guerra das Rotas, há quarenta anos, terminou com um tratado que ninguém cumpre por inteiro.",
      "Há trinta anos a colônia Kepler parou de responder; a nave enviada também.",
      "O Primeiro Contato foi um casco precursor achado vazio; o que havia dentro é segredo corporativo.",
      "A Grande Falha desligou as IAs de uma estação inteira por um dia, e mil pessoas não acordaram.",
    ],
    titulos: ["o Almirante Sem Frota", "a Voz do Vácuo", "o Contador", "a Dama do Salto", "o Último Piloto", "o Herdeiro do Sinal", "a Mão da Diretoria", "o Fantasma de Kepler", "o Terceiro Sol", "a Engenheira Cega"],
    naoExiste: ["magia", "castelos", "cavalos", "espadas como arma comum", "reis", "deuses que respondem"],
    aLei: [
      "Quem controla o ar controla tudo: suporte de vida é dívida, e dívida é a lei mais antiga das estações.",
      "Todo contrato é registrado e público; quebrar um apaga você das docas de toda a rota.",
      "A distância é a lei: o que acontece entre dois saltos ninguém julga, e ninguém socorre.",
    ],
    comoSeFala: [
      "Fala-se o jargão das docas, curto e técnico; desejar boa viagem antes de um salto dá azar.",
      "Tratamento por função e sobrenome; perguntar a dívida de alguém é ofensa que se resolve fora da estação.",
    ],
    continente: ["o Braço de Órion", "a Fronteira Exterior", "o Setor Meridiano", "as Rotas Frias"],
  },

  cyberpunk: {
    /* NE6+ (13/11): como cada raça do catálogo se chama neste gênero — três
       variantes por raça, uma pela semente (RACAS_DO_LEXICO) */
    racas: {
      Terrano: ["Carne-Pura","Gente do Térreo","Orgânico"],
      "Colono Orbital": ["Gente da Plataforma","Alto-Nascido","Filho da Estação"],
      "Sintético": ["Casca","Filho do Código","Réplica"],
      Mutante: ["Gente do Esgoto","Torto-de-Fábrica","Filho da Névoa Ácida"],
      Cromado: ["Cromo","Filho do Bisturi","Metade-Metal"],
      Vagante: ["Gente da Margem","Sem-Registo","Filho do Viaduto"],
    },
    chamado: {
      heroi: ["mercenário de rua", "freelancer", "runner"],
      grupo: ["equipe", "crew"],
      taverna: ["bar", "clube"],
      masmorra: ["arcologia", "subnível", "torre corporativa"],
      monstro: ["ciberpsicótico", "drone de segurança"],
      faccao: ["corporação", "gangue"],
      cidade: ["distrito", "zona"],
      moeda: ["eurodólares", "créditos"],
      magia: ["netrunning", "tecnologia de ponta"],
      relicario: ["protótipo", "chip proibido"],
      autoridade: ["a polícia corporativa", "a segurança privada"],
    },
    funciona: {
      heroi: [
        "Mercenários de rua são contratados por fixers para o trabalho sujo das corporações; ninguém assina nada, e quem fala demais some.",
        "Runners vivem de serviço: invasão, extração, entrega; a reputação é o que os fixers dizem de você no bar certo.",
      ],
      poder: ["O poder é cromo: implantes, softwares de combate, reflexos comprados; subir de nível é ter dinheiro e nervo para mais uma cirurgia."],
      fama: ["A reputação corre na rede e nos bares: um serviço limpo vira oferta melhor, um serviço sujo vira recompensa pela sua cabeça."],
      ameaca: [
        "A ameaça grande é uma corporação que é dona da polícia e do prefeito; ninguém a para porque todo mundo deve algo a ela.",
        "O perigo de verdade é uma IA solta na rede, ou um executivo com exército privado e nada a perder.",
      ],
      masmorra: [
        "Arcologias e torres corporativas são andares de segurança, câmeras e torretas, com o servidor no topo; entra-se com credencial roubada, sai-se com os dados.",
        "Subníveis abandonados sob a cidade guardam laboratórios ilegais e gangues; a rede não chega lá, e quem fica lá não é procurado.",
      ],
      viagem: ["Anda-se de metrô, moto ou carro autônomo; cada distrito tem dono, e cruzar zona errada à noite custa pedágio ou sangue."],
      cidade: ["A cidade é vertical: as torres em cima, o neon no meio, os becos embaixo; o medo é a dívida médica e o apagão."],
      justica: ["A polícia é contratada e prende quem não pagou o plano; quem tem advogado corporativo não é julgado, e o resto é resolvido na rua."],
      fe: ["Uns rezam a santos de neon, outros a gurus de rede; a fé aparece em altares de beco e em seitas que prometem upload da alma."],
      mercado: ["Compra-se em lojas licenciadas e com ripperdocs de beco; cromo militar e software ilegal só com fixer, pagamento adiantado."],
    },
    lugares: [
      { tipo: "taverna", chamado: ["bar", "clube"] },
      { tipo: "mercado", chamado: ["mercado de rua", "camelódromo"] },
      { tipo: "templo", chamado: ["altar de beco", "igreja de neon"] },
      { tipo: "forja", chamado: ["clínica de ripperdoc", "oficina de cromo"] },
      { tipo: "quartel", chamado: ["delegacia corporativa"] },
      { tipo: "arena", chamado: ["ringue clandestino"] },
    ],
    faccoes: [
      { nome: "a Kiroshi-Vale", quer: "o contrato da cidade inteira" },
      { nome: "os Lâminas de Vidro", quer: "o controle do distrito baixo" },
      { nome: "o Coletivo Ruído", quer: "derrubar a rede corporativa" },
      { nome: "a Prefeitura", quer: "eleição comprada e ruas quietas" },
    ],
    passado: [
      "O Grande Apagão, há quinze anos, derrubou a rede por uma semana e fez a fortuna de três corporações.",
      "A Guerra das Corporações, há trinta anos, terminou com a cidade dividida em zonas de contrato.",
      "A Lei da Privatização vendeu a polícia, os hospitais e a água; ninguém lembra de quem votou.",
      "Há dez anos uma IA tomou uma torre inteira por três horas; oficialmente, foi um incêndio.",
      "O Massacre do Mercado, há vinte anos, ainda é o motivo de as gangues odiarem a polícia.",
    ],
    titulos: ["o Executivo", "a Rainha do Beco", "o Fantasma da Rede", "o Açougueiro de Cromo", "a Voz Sem Rosto", "o Dono da Zona", "a Santa de Neon", "o Contador de Corpos", "o Último Sindicalista", "a Mão da Diretoria"],
    naoExiste: ["magia", "monarquia", "privacidade", "polícia pública", "dinheiro em espécie confiável", "céu limpo"],
    aLei: [
      "Tudo tem dono, até o ar dos andares de cima; quem não paga o plano não existe para o sistema.",
      "Informação é a única moeda que não desvaloriza: quem sabe, manda; quem é sabido, morre.",
      "Contrato verbal no bar vale mais que papel: quebrar a palavra com um fixer fecha todas as portas da rua.",
    ],
    comoSeFala: [
      "Fala-se gíria de rua misturada com jargão de rede; chamar alguém pelo nome verdadeiro em público é ameaça.",
      "Tudo é negócio e eufemismo: ninguém mata, «resolve»; ninguém rouba, «extrai».",
    ],
    continente: ["a Megalópole", "a Costa Sprawl", "o Corredor Norte", "a Zona Livre"],
  },

  horror: {
    /* NE6+ (13/11): como cada raça do catálogo se chama neste gênero — três
       variantes por raça, uma pela semente (RACAS_DO_LEXICO) */
    racas: {
      Humano: ["Gente da Lamparina","Desperto","Filho da Vela"],
      Elfo: ["Pálido","Povo do Luar Velho","Esquecido"],
      "Anão": ["Gente do Poço","Escavador","Filho do Veio Negro"],
      Halfling: ["Gente da Soleira","Pé-Calado","Miúdo"],
      "Meio-orc": ["Sangue-Turvo","Enjeitado","Filho do Pântano"],
      Draconato: ["Escama-Fria","Sangue-Antigo","Filho da Cinza"],
      Tiefling: ["Assinado","Filho do Sussurro","Tocado-do-Fundo"],
      Gnomo: ["Gente do Relicário","Contador de Estrelas","Insone"],
      "Meio-elfo": ["Filho do Limiar","Crepuscular","Meia-Sombra"],
      Goliath: ["Gente do Monólito","Pétreo","Filho do Eco"],
    },
    chamado: {
      heroi: ["investigador", "curioso", "estudioso do oculto"],
      grupo: ["círculo", "companhia"],
      taverna: ["taverna", "hospedaria"],
      masmorra: ["cripta", "porão", "lugar proibido"],
      monstro: ["coisa", "abominação"],
      faccao: ["sociedade", "seita"],
      magia: ["o oculto", "ritual"],
      relicario: ["tomo proibido", "artefato profano"],
      autoridade: ["o xerife", "a polícia do condado"],
    },
    funciona: {
      heroi: [
        "Investigadores são os que não conseguiram parar de perguntar: professores, detetives, órfãos de algo que viram; a cidade os tolera até perguntarem demais.",
        "Estudiosos do oculto vivem entre livros e boatos; ninguém os contrata, mas todos os procuram quando algo some no nevoeiro.",
      ],
      poder: ["O poder é conhecimento que cobra: cada ritual aprendido rói um pouco da mente; ficar mais forte é saber mais, e saber mais é perigoso."],
      fama: ["A reputação é boato de vizinho: o forasteiro que mexe no que não devia é conhecido em toda rua, e as portas se fecham antes de ele bater."],
      ameaca: [
        "A ameaça grande não tem rosto: um culto antigo, uma família que não envelhece, algo que dorme sob o mar; ninguém a parou porque ninguém acredita.",
        "O perigo de verdade é o que os livros chamam por nomes impronunciáveis, e os que o servem são vizinhos gentis.",
      ],
      masmorra: [
        "Criptas e porões descem mais fundo do que a casa deveria permitir; as salas mudam de lugar, e no fundo há o que chama.",
        "Lugares proibidos são igrejas fechadas e minas inundadas; entra-se com lanterna e fé, e quem sai não conta tudo.",
      ],
      viagem: ["Viaja-se de trem, carro velho ou barco costeiro; entre as cidades há estradas de neblina, vilas que não constam no mapa e noites longas demais."],
      cidade: ["A cidade é velha e úmida: a igreja, o porto, a casa grande no morro; o medo é o nevoeiro e as famílias antigas."],
      justica: ["O xerife prende o forasteiro antes do morador; quem some não é procurado, e quem pergunta pelo desaparecido vira suspeito."],
      fe: ["O povo frequenta a igreja aos domingos e evita certas datas; há quem reze a outra coisa, de joelhos, na praia, quando a maré baixa."],
      mercado: ["Compra-se no armazém e na farmácia; livros raros e objetos de escavação só em antiquários que fazem perguntas antes de vender."],
    },
    lugares: [
      { tipo: "taverna", chamado: ["hospedaria", "bar do porto"] },
      { tipo: "templo", chamado: ["igreja velha", "capela"] },
      { tipo: "biblioteca", chamado: ["biblioteca da universidade", "arquivo municipal"] },
      { tipo: "cemitério", chamado: ["cemitério da colina"] },
      { tipo: "docas", chamado: ["cais de pesca"] },
    ],
    faccoes: [
      { nome: "a Ordem do Farol", quer: "abrir a porta sob as águas" },
      { nome: "a Universidade", quer: "o tomo antes de qualquer outro" },
      { nome: "as Famílias Antigas", quer: "que nada mude, nunca" },
      { nome: "a Irmandade da Maré", quer: "convertidos antes da próxima lua" },
    ],
    passado: [
      "O Naufrágio de 1890 trouxe ao porto mais corpos do que havia passageiros a bordo.",
      "Há quarenta anos uma vila inteira sumiu numa noite; o trem ainda para na estação vazia.",
      "A Expedição Halloway voltou das montanhas com um homem só, e ele não fala desde então.",
      "O Grande Incêndio da igreja velha, há sessenta anos, revelou túneis que a prefeitura mandou fechar.",
      "Os pescadores lembram do ano em que o mar ficou parado por sete dias.",
    ],
    titulos: ["o Homem Pálido", "a Senhora do Farol", "o Professor", "a Coisa no Poço", "o Pastor da Maré", "a Que Sussurra", "o Velho Halloway", "o Sem-Rosto", "a Noiva do Mar", "o Guardião do Livro"],
    naoExiste: ["heróis lendários", "magia segura", "monstros que se matam com espada", "ajuda do governo", "explicações fáceis", "finais felizes garantidos"],
    aLei: [
      "Saber custa: cada verdade sobre o que há além do véu é paga com um pedaço da mente de quem a aprende.",
      "O que é esquecido não pode entrar; por isso as famílias antigas guardam tão bem o que juraram esquecer.",
      "As coisas antigas não odeiam ninguém: elas simplesmente não notam, e é isso que mata.",
    ],
    comoSeFala: [
      "Fala-se baixo e com rodeios; certos nomes não se dizem, e quem os diz é olhado como quem chamou chuva.",
      "O povo da costa responde a pergunta com outra pergunta, e nunca diz a um forasteiro onde mora.",
    ],
    continente: ["a Nova Inglaterra Esquecida", "a Costa das Brumas", "o Condado de Arkmoor", "as Terras do Norte Úmido"],
  },

  posapoc: {
    /* NE6+ (13/11): como cada raça do catálogo se chama neste gênero — três
       variantes por raça, uma pela semente (RACAS_DO_LEXICO) */
    racas: {
      Terrano: ["Sobrevivente","Gente do Abrigo","Filho de Antes"],
      "Colono Orbital": ["Caído-do-Céu","Gente da Cápsula","Filho da Estrela Cadente"],
      "Sintético": ["Ferrugento","Filho da Sucata","Máquina-Viva"],
      Mutante: ["Gente da Cinza","Marcado-do-Ermo","Filho da Chuva Amarga"],
      Cromado: ["Remendado","Filho da Oficina","Pele-de-Lata"],
      Vagante: ["Gente da Estrada","Errante do Pó","Filho do Vento Seco"],
    },
    chamado: {
      heroi: ["andarilho", "saqueador", "sobrevivente"],
      grupo: ["bando", "comboio"],
      taverna: ["boteco", "posto de troca"],
      masmorra: ["ruína", "bunker", "zona morta"],
      monstro: ["mutante", "fera da zona"],
      faccao: ["bando", "assentamento"],
      cidade: ["assentamento", "povoado"],
      moeda: ["tampinhas", "munição", "fichas de troca"],
      magia: ["radiação", "tecnologia do antes"],
      relicario: ["relíquia do antes", "peça do mundo velho"],
      autoridade: ["a milícia", "os guardas do muro"],
    },
    funciona: {
      heroi: [
        "Andarilhos cruzam a terra morta entre assentamentos, trocando serviço por água e munição; os muros os deixam entrar só de dia.",
        "Saqueadores vivem do que o mundo velho deixou: entram nas ruínas que os outros evitam e voltam com o que se troca.",
      ],
      poder: ["O poder é sobreviver: cicatrizes, mutações que não mataram, armas consertadas; subir de nível é ainda estar de pé quando os outros não estão."],
      fama: ["A reputação viaja com os comboios: um andarilho que cumpre a palavra ganha portão aberto, um que trai ganha bala na estrada."],
      ameaca: [
        "A ameaça grande é um senhor da guerra com motores e combustível, ou uma zona que cresce a cada ano; ninguém o parou porque ninguém tem munição para isso.",
        "O perigo de verdade é o que nasceu da radiação e aprendeu a caçar em bando.",
      ],
      masmorra: [
        "Ruínas e bunkers do mundo velho: andares desabados, portas blindadas, algo vivo no fundo; entra-se com máscara e sai-se com o que se carrega.",
        "Zonas mortas guardam o melhor saque e o pior ar; quem fica tempo demais volta doente ou não volta.",
      ],
      viagem: ["Viaja-se a pé, de moto ou em comboio armado pelas estradas rachadas; entre os assentamentos há bandos, tempestades de poeira e água envenenada."],
      cidade: ["O assentamento é um muro de sucata em volta de um poço: o mercado de troca, a oficina, a torre de vigia; o medo é a seca e o ataque."],
      justica: ["A milícia prende e o conselho do muro julga; quem rouba água é expulso para a terra morta, que é o mesmo que a forca."],
      fe: ["Uns rezam aos que vieram antes, outros a profetas da bomba; a fé aparece em altares de sucata e em seitas que esperam o fim do fim."],
      mercado: ["Troca-se no posto: água, munição, remédio, peças; armas pesadas e combustível só com os bandos, e o preço inclui um favor."],
    },
    lugares: [
      { tipo: "taverna", chamado: ["boteco", "posto de troca"] },
      { tipo: "mercado", chamado: ["feira de troca", "mercado de sucata"] },
      { tipo: "forja", chamado: ["oficina de sucata", "ferro-velho"] },
      { tipo: "quartel", chamado: ["torre de vigia"] },
      { tipo: "arena", chamado: ["fosso de luta"] },
      { tipo: "templo", chamado: ["altar de sucata"] },
    ],
    faccoes: [
      { nome: "os Motores do Rei Pó", quer: "todo combustível do vale" },
      { nome: "o Conselho do Poço", quer: "muros mais altos e menos bocas" },
      { nome: "os Filhos da Bomba", quer: "terminar o que o fim começou" },
      { nome: "a Caravana Livre", quer: "estradas abertas e trocas justas" },
    ],
    passado: [
      "O Fim, há setenta anos, levou as cidades numa noite de luz; ninguém vivo lembra do céu azul.",
      "A Grande Seca, há vinte anos, fez os assentamentos se matarem pelos poços.",
      "Há trinta anos o bunker da serra se abriu, e os que saíram de lá ainda governam o vale.",
      "A Guerra dos Motores, há dez anos, deixou a estrada principal cheia de carcaças.",
      "O Inverno Cinza durou três anos depois do Fim, e é por isso que ninguém planta trigo.",
    ],
    titulos: ["o Rei Pó", "a Mãe do Poço", "o Profeta da Bomba", "o Último Mecânico", "a Viúva da Estrada", "o Comedor de Ferro", "o Homem do Bunker", "a Rainha da Sucata", "o Sem-Pele", "o Guardião do Muro"],
    naoExiste: ["governo", "eletricidade estável", "água limpa à vontade", "magia", "moeda de papel", "estradas seguras"],
    aLei: [
      "Água é vida e é lei: quem controla o poço manda, e quem desperdiça uma gota responde com sangue.",
      "Ninguém sobrevive sozinho: o andarilho sem bando é presa, e o bando sem palavra é caçado por todos.",
      "O mundo velho é tesouro e veneno: tudo o que vem de antes vale muito, e quase tudo cobra caro.",
    ],
    comoSeFala: [
      "Fala-se pouco e direto; pedir água a quem não é do seu bando é ofensa, e oferecê-la é aliança.",
      "As palavras do mundo velho viraram gíria torta; dizer o nome de um morto recente atrai má sorte.",
    ],
    continente: ["a Terra Morta", "o Vale Rachado", "as Planícies de Cinza", "o Ermo Grande"],
  },

  steampunk: {
    /* NE6+ (13/11): como cada raça do catálogo se chama neste gênero — três
       variantes por raça, uma pela semente (RACAS_DO_LEXICO) */
    racas: {
      Humano: ["Gente do Apito","Operário","Filho do Vapor"],
      Elfo: ["Povo da Estufa","Alto-Jardineiro","Filho da Seiva"],
      "Anão": ["Gente da Fornalha","Caldeireiro","Filho do Carvão"],
      Halfling: ["Gente do Bolso","Miudeiro","Pé-Ligeiro"],
      "Meio-orc": ["Estivador","Sangue-de-Ferro","Filho do Cais"],
      Draconato: ["Escama-de-Cobre","Sangue-de-Caldeira","Filho do Fole"],
      Tiefling: ["Filho do Contrato","Selado","Chifre-de-Latão"],
      Gnomo: ["Relojoeiro","Gente da Mola","Filho da Patente"],
      "Meio-elfo": ["Mestiço-de-Estufa","Entre-Jardins","Filho de Duas Torres"],
      Goliath: ["Gente do Guindaste","Colosso","Filho da Bigorna Grande"],
    },
    chamado: {
      heroi: ["aventureiro", "agente contratado", "inventor errante"],
      grupo: ["companhia", "tripulação"],
      taverna: ["taberna", "clube de cavalheiros"],
      masmorra: ["fábrica abandonada", "túneis de vapor", "laboratório lacrado"],
      monstro: ["autômato desgovernado", "fera de laboratório"],
      faccao: ["companhia", "sociedade"],
      moeda: ["libras", "xelins"],
      magia: ["eterismo", "ciência proibida"],
      relicario: ["invento perdido", "engenho raro"],
      autoridade: ["a polícia metropolitana", "os inspetores da Coroa"],
    },
    funciona: {
      heroi: [
        "Aventureiros são contratados por companhias e cavalheiros para o que a polícia não resolve; o contrato tem selo, e o selo tem dono.",
        "Inventores errantes vendem engenho e coragem; ganham patrocínio com um feito público e o perdem com um escândalo.",
      ],
      poder: ["O poder vem do treino, dos inventos e das próteses a vapor; subir de nível é ter melhores engenhos e mais cicatrizes."],
      fama: ["A reputação sai nos jornais: um feito vira manchete, um fracasso vira charge; os clubes leem tudo antes de abrir a porta."],
      ameaca: [
        "A ameaça grande é uma companhia com exército de autômatos, ou um cientista que quer reescrever o mundo; ninguém o parou porque ele financia o Parlamento.",
        "O perigo de verdade é uma máquina que não devia ter sido ligada, e a Coroa que finge não saber.",
      ],
      masmorra: [
        "Fábricas abandonadas e túneis de vapor: caldeiras que ainda respiram, engrenagens que esmagam, um engenho no fundo; entra-se pela grade e sai-se com o invento.",
        "Laboratórios lacrados guardam experiências que deram errado; o vapor esconde o caminho, e o que mora lá não tem medo de fogo.",
      ],
      viagem: ["Viaja-se de trem a vapor, dirigível ou barco de rodas; entre as cidades há salteadores, alfândegas e céu de fuligem."],
      cidade: ["A cidade é fumaça e ferro: as fábricas no rio, os palácios na colina, o mercado entre os dois; o medo é a explosão e a greve."],
      justica: ["A polícia prende o operário antes do lorde; tribunais de peruca julgam, e quem tem advogado de clube sai pela porta dos fundos."],
      fe: ["O povo vai à igreja oficial e desconfia das seitas de engrenagem; há quem reze à Máquina, e há quem queime fábricas em nome de Deus."],
      mercado: ["Compra-se em lojas de departamento e em oficinas de rua; inventos patenteados só com licença, e os ilegais no mercado das docas."],
    },
    lugares: [
      { tipo: "taverna", chamado: ["taberna", "pub"] },
      { tipo: "mercado", chamado: ["galeria coberta", "mercado de ferro"] },
      { tipo: "forja", chamado: ["oficina de engrenagens", "fundição"] },
      { tipo: "biblioteca", chamado: ["sociedade científica", "gabinete de patentes"] },
      { tipo: "docas", chamado: ["porto de dirigíveis", "cais do rio"] },
      { tipo: "guilda", chamado: ["clube de cavalheiros"] },
    ],
    faccoes: [
      { nome: "a Companhia das Índias de Ferro", quer: "o monopólio do carvão etéreo" },
      { nome: "a Sociedade Real de Ciências", quer: "a patente que muda o século" },
      { nome: "o Sindicato das Caldeiras", quer: "jornada de dez horas e armas" },
      { nome: "os Luditas da Névoa", quer: "ver todas as fábricas paradas" },
    ],
    passado: [
      "A Revolução do Vapor, há cinquenta anos, encheu as cidades de fábricas e os rios de fuligem.",
      "A Grande Explosão de Ferrovale, há vinte anos, matou mil operários e nenhum diretor.",
      "Há trinta anos o primeiro dirigível cruzou o oceano, e com ele a guerra ganhou céu.",
      "A Greve Negra, há dez anos, parou a capital por um mês e terminou com tiros na ponte.",
      "O desaparecimento do Professor Ashcombe e do seu engenho ainda rende manchetes.",
    ],
    titulos: ["o Barão do Carvão", "a Dama de Latão", "o Relojoeiro", "o Homem de Vapor", "a Viúva das Caldeiras", "o Almirante dos Céus", "o Professor Desaparecido", "a Rainha da Fuligem", "o Coração de Engrenagem", "o Inspetor Cinza"],
    naoExiste: ["eletricidade comum", "computadores", "magia antiga", "voo a jato", "medicina moderna", "céu limpo nas cidades"],
    aLei: [
      "O vapor move tudo e tudo tem dono: a patente vale mais que a vida de quem opera a máquina.",
      "Reputação é capital: um cavalheiro desmoralizado em jornal perde crédito, sócio e clube no mesmo dia.",
      "Todo invento tem preço: cada engenho novo exige um sacrifício que o inventor não anuncia.",
    ],
    comoSeFala: [
      "Fala-se com formalidade entre classes e gíria de fábrica entre iguais; falar de dinheiro à mesa é vulgar.",
      "Os operários falam por códigos de apito; um cavalheiro que sabe os códigos é olhado com desconfiança.",
    ],
    continente: ["o Império de Albion", "as Terras do Vapor", "a Commonwealth de Ferro", "o Continente Fuliginoso"],
  },
});

/* ---------------- O MOLDE ----------------
   Como se vai de um lugar a outro e o que abre uma passagem fechada
   dependem da FORMA do mundo (moldes.js), não só do gênero: na torre
   sobe-se, no arquipélago navega-se, nas estrelas salta-se. O molde que
   não está aqui (as terras abertas) fica com o texto do gênero. */
export const LEXICO_DO_MOLDE = Object.freeze({
  torre: {
    viagem: "Viaja-se subindo: cada andar é um mundo com dono, e as escadas entre eles são guardadas, cobradas ou esquecidas.",
    passagem: "O andar de cima não se abre sozinho: quem guarda a escada pede prova, preço ou chave, e a passagem cede quando o guardião cai ou consente.",
  },
  arquipelago: {
    viagem: "Viaja-se por mar entre as ilhas: a maré decide quando se parte, e entre os portos há piratas, recifes e calmarias.",
    passagem: "Certas rotas só se abrem com a maré certa; o canal que estava seco ontem é passagem hoje, e quem perde a janela espera.",
  },
  estelar: {
    viagem: "Viaja-se de um mundo a outro por rotas conhecidas; cada salto custa, e fora das rotas não há socorro.",
    passagem: "Uma rota fechada abre com permissão, coordenada ou chave de acesso; sem ela o portal fica cego e a nave volta.",
  },
});

const ehObj = (x) => x && typeof x === "object" && !Array.isArray(x);

/* o id do gênero: o rótulo (o que o mundo guarda) passa a id pelo cartão da
   criação do cenário ativo; sem tabela (o «Universo próprio», um rótulo que a
   criação não tem), o id do gênero padrão do cenário */
export function idDoGeneroDoLexico(genero) {
  const g = cenarioAtivo().generos;
  const cartoes = Array.isArray(g.criacao) ? g.criacao : [];
  const rot = typeof genero === "string" ? genero.trim() : "";
  const deste = cartoes.find((c) => c && c.label === rot);
  if (deste && LEXICO_DOS_GENEROS[deste.id]) return deste.id;
  const padrao = cartoes.find((c) => c && c.label === g.padrao);
  return padrao && LEXICO_DOS_GENEROS[padrao.id] ? padrao.id : Object.keys(LEXICO_DOS_GENEROS)[0];
}
const tabelaDe = (genero) => LEXICO_DOS_GENEROS[idDoGeneroDoLexico(genero)];
/* um de uma lista, pela corrente */
const um = (r, xs) => (Array.isArray(xs) && xs.length ? xs[Math.floor(r() * xs.length)] : undefined);
/* `n` de uma lista, sem repetir, pela corrente (embaralha uma cópia) */
function alguns(r, xs, n) {
  const c = Array.isArray(xs) ? [...xs] : [];
  for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
  return c.slice(0, Math.max(0, n));
}

/* AS RAÇAS (NE6+, 13/11): o Léxico antigo rebatizava as raças do catálogo
   («Humano» → «Forjado»), e a NE6 deixou a lista vazia — um mundo novo
   mostrava «Humano, Elfo, Anão…» na boca da rua. Cada gênero tem agora, na
   sua tabela, três nomes nossos por raça, e a semente escolhe um. Corrente
   própria (`|racas`): o resto do léxico de uma semente fica byte a byte o
   de antes. A forma é a do léxico antigo — `{ raca, chamado }`, a raça pelo
   nome do catálogo —, e a garantia (garantirLexico) aceita o grupo inteiro
   ou nada: a tabela de cada gênero cobre o grupo dele (a fantasia, o horror
   e o steampunk as dez de fantasia; a ficção, o cyberpunk e o ermo as seis
   do futuro), e a suíte confere. A tela continua a dizer o nome do
   catálogo (lexico.js, 20/10): o nome daqui é a cor que a prosa usa. */
/* `repete`: quantas raças de um mesmo mundo podem abrir o nome pela mesma
   palavra («Filho do Vapor», «Filho do Fole», «Filho da Patente»…): a
   semente sorteia a ordem das variantes, e a primeira que não passa do teto
   ganha — dez «Filho de» numa ficha leem como uma lista, não como um mundo. */
export const RACAS_DO_LEXICO = Object.freeze({ variantes: 3, corrente: "racas", repete: 2 });
function racasDoLexico(T, sem) {
  const r = rng(hashSemente(`${sem}|lexico-do-mundo|${RACAS_DO_LEXICO.corrente}`));
  const abre = {};
  const out = [];
  for (const [raca, xs] of Object.entries(T.racas || {})) {
    const ordem = alguns(r, xs, Array.isArray(xs) ? xs.length : 0);
    const primeira = (x) => x.split(/[\s-]/)[0];
    const chamado = ordem.find((x) => (abre[primeira(x)] || 0) < RACAS_DO_LEXICO.repete) || ordem[0];
    if (!chamado) continue;
    const p = primeira(chamado);
    abre[p] = (abre[p] || 0) + 1;
    out.push({ raca, chamado });
  }
  return out;
}

/* ============================================================
   O LÉXICO DO MUNDO

     lexicoDoMundo(mundo, { semente }) → o léxico (a forma de garantirLexico)

   `mundo`: { genero, molde } (o da criação; o resto não é lido — a
   descrição do jogador vai ao Narrador por outro caminho). `semente`: a
   da campanha (o App usa `${nomeCampanha}|${genero}`, a de sementeMundo).
   A ordem dos sorteios é fixa (a ordem das chaves das tabelas), e a
   corrente é só desta peça: o léxico não gasta a sorte da casa.
   Lixo (`null`, `{}`, um gênero que não existe) dá o léxico do gênero
   padrão, nunca estoura. Sempre `gerado: true`: a tabela não falha.
   ============================================================ */
export function lexicoDoMundo(mundo, opcoes) {
  const m = ehObj(mundo) ? mundo : {};
  const o = ehObj(opcoes) ? opcoes : {};
  const sem = typeof o.semente === "string" || typeof o.semente === "number" ? String(o.semente) : "";
  const r = rng(hashSemente(`${sem}|lexico-do-mundo`));
  const T = tabelaDe(m.genero);
  const chamado = {};
  for (const [id, xs] of Object.entries(T.chamado || {})) { const v = um(r, xs); if (v) chamado[id] = v; }
  const funciona = {};
  for (const [id, xs] of Object.entries(T.funciona || {})) { const v = um(r, xs); if (v) funciona[id] = v; }
  const doMolde = LEXICO_DO_MOLDE[typeof m.molde === "string" ? m.molde : ""];
  if (doMolde) for (const [id, v] of Object.entries(doMolde)) funciona[id] = v;
  /* o tipo chamado pelo próprio nome não é apelido: não gasta prompt */
  const lugares = (T.lugares || []).map((l) => ({ tipo: l.tipo, chamado: um(r, l.chamado) || "", nomes: [] })).filter((l) => l.chamado && l.chamado.toLowerCase() !== l.tipo);
  return garantirLexico({
    gerado: true,
    chamado,
    funciona,
    lugares,
    faccoes: alguns(r, T.faccoes, QUANTOS_NO_LEXICO.faccoes),
    passado: alguns(r, T.passado, QUANTOS_NO_LEXICO.passado),
    titulos: alguns(r, T.titulos, QUANTOS_NO_LEXICO.titulos),
    naoExiste: alguns(r, T.naoExiste, QUANTOS_NO_LEXICO.naoExiste),
    aLei: um(r, T.aLei) || "",
    comoSeFala: um(r, T.comoSeFala) || "",
    nomes: { continente: um(r, T.continente) || "" },
    racas: racasDoLexico(T, sem),
  });
}
