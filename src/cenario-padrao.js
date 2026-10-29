/* ============================================================
   O CENÁRIO PADRÃO (Fase T, T4-B · o cenário como arquivo, 1.ª fatia, 28/10)

   O mundo de hoje — as terras da Taverna — escrito como DADO, e não como
   código. É o arquivo que um autor de cenário copia e reescreve: o motor
   não muda, muda isto. Quem o lê é `cenario.js`, que o valida e o congela;
   os catálogos (economia.js, classes.js) leem o cenário carregado, nunca
   este arquivo direto.

   A regra do formato, e é ela que faz isto ser um arquivo de autor: aqui
   dentro só há o que o JSON tem — texto, número, verdadeiro/falso, null,
   lista e objeto. Nenhuma função, nenhuma regex literal (a regex é o TEXTO
   dela, em `rx`, e o catálogo a compila), nenhuma conta. Por isso o mesmo
   conteúdo, posto num `.json`, carrega igual (`carregarCenario(JSON.parse(…))`)
   — e a suíte prova-o fazendo exatamente essa volta.

   Mora num `.js` (e não num `.json`) por uma razão só: importar `.json`
   pede `with { type: "json" }` no Node e não no Vite, e o mesmo arquivo tem
   de abrir igual nos dois.

   As secções (o validador recusa o campo que o motor não lê, para ninguém
   escrever um mundo que não acontece):
     precos.escala      as linhas da escala de riqueza que o Narrador lê
                        (o meio do ECONOMIA_PROMPT; o começo e o fim são
                        regra do motor e ficam em economia.js)
     precos.raridade    quanto vale um equipamento, pela raridade
     precos.semRaridade o equipamento sem raridade nomeada
     precos.miudeza     a miudeza de inventário (um item que é só um nome)
     precos.comuns      o que se compra na rua e na taverna: `base` é o
                        preço, `faixa` a da escala (ou null), `rx` as
                        palavras que o nomeiam (sem acento), `rua` as que a
                        cena mostra sem ninguém perguntar
     ocupacoes          os ofícios da criação: `beneficio` é a frase da tela,
                        `efeito` o que o código faz (o vocabulário está em
                        cenario.js, ESQUEMA_DO_CENARIO.efeito); os nomes
                        são também os ofícios que o léxico gerado renomeia
     generos.padrao     o gênero que o pedido do léxico assume quando o
                        mundo não diz o seu
     generos.futuristas os gêneros cuja gente é a do futuro (a criação mostra
                        as origens — Terrano, Sintético… — e não as raças de
                        fantasia; o léxico pede nome só para essas)
     generos.criacao    os gêneros que a criação oferece, um cartão cada:
                        `label` é o nome do gênero em todo o motor, `dica` a
                        linha do cartão, `id` a chave da tela ("livre" é o
                        Universo próprio, que a tela põe à parte); o padrão e
                        os do futuro têm de estar aqui. `glifo` (opcional) é o
                        nome do ícone do cartão, de ESQUEMA_DO_CENARIO.glifos
     generos.marcasProprias  as marcas, na descrição, de um mundo que não é a
                        fantasia clássica (a obra citada, o tempo moderno ou
                        futuro): texto de regex, comparado SEM acento e sem
                        caixa — escreva-as assim
     bestiario.criaturas  as criaturas do mundo: `nivelRef` é o nível de
                        referência, `des` a destreza (de 2 para cima é
                        ágil), `perfil` o elemento do ataque e o que
                        resiste/teme, `degrau` a mente declarada (sem ele,
                        herda de ameaça + tipo de mente), `importante` a
                        que cai e rola contra a morte em vez de morrer direto
     bestiario.arquetipos os genéricos, que servem a qualquer gênero
     bestiario.generosDasCriaturas  os gêneros que veem as criaturas do
                        mundo; os outros veem os arquétipos
     bestiario.emprestados  quantas do outro lado entram na lista (as
                        primeiras): o mundo de fantasia vê também os quatro
                        primeiros arquétipos, e o de outro gênero as quatro
                        primeiras criaturas
     gente.bancos       os nomes de cada gênero: as partes do nome de cidade
                        (`cidadePre` + `cidadeSuf`, e as `cidadeUnica` já
                        prontas, que saem quase metade das vezes), os primeiros
                        nomes (`masc`, `fem` — é por eles que se sabe o sexo
                        de um nome solto), os `sobrenome`s, e os `povos` e os
                        `oficios` com que o elenco nasce (o ofício no neutro,
                        "taverneiro(a)": a pessoa concorda-o com o seu gênero)
     gente.tracos       o temperamento de quem nasce do elenco
     panteao.nomes      as duas metades do nome de um deus (`inicio` + `fim`)
     panteao.dominios   o que um deus governa, o ícone dele e os temperamentos
                        que pode ter
     panteao.cultos     como se chama a gente dele ("a Ordem de …")
     panteao.titulos    o nome e a frase de cada grau da escala divina, do GD 0
                        ao GD 4 (cinco, na ordem): a escala em si — os fiéis de
                        cada grau, a Regra do Degrau — é física e fica em
                        divindades.js; o mundo dá só as palavras
     panteao.estagios   os três estágios da ascensão, na ordem (o do meio o
                        Narrador lê ao lado do título do GD 2: "Semideus/Receptáculo")
     panteao.palavrasDivinas  as palavras que só a fé dá — o Narrador nunca as
                        usa para quem o sistema não declarou divino
     panteao.dominios[].sinais  opcional: o sinal impossível que o deus daquele
                        temperamento manda (o evento divino); o temperamento sem
                        sinal manda o fenômeno que ninguém explica
     lugares.bancos     as palavras com que se nomeia um lugar, por gênero (o
                        gênero sem banco usa o de `generos.padrao`): `subst` é o
                        coração do nome de taverna ("Javali|m" — a palavra e o
                        gênero gramatical: m, f, mp, fp), `adj` o que o qualifica
                        ("Rachado|Rachada" — masculino e feminino; sem a barra não
                        flexiona), `compl` o complemento já com a preposição
     lugares.tipos      os substantivos de cada tipo de local da cidade (o
                        mercado, o templo…), no mesmo formato de `subst`: é o
                        substantivo que diz de que prédio se trata
     racas.fantasia     o que o jogador pode SER num mundo que não é do futuro:
                        `bonus` são os pontos de atributo, `traco` a frase que a
                        criação mostra e `efeito` o que o código faz com ela (o
                        vocabulário está em cenario.js, ESQUEMA_DO_CENARIO.efeitoDeRaca)
     racas.futuro       as origens dos gêneros de `generos.futuristas`
     racas.doCompanheiro  o povo de quem o companheiro sorteado pode ser, com o
                        peso de cada raça (a raça pelo nome exato)
     racas.registo      as palavras com que o registo do mundo diz uma raça
                        ("anã", "humana") → o nome dela na criação
     prontos            os oito do roster (Partida Rápida, Torneio, Duelo):
                        `linha` é a frase de venda, `indole` a persona do rival
                        quando a casa pilota (traços e propósito de indole.js),
                        `sementes` duas formas do Livro; a raça e o ofício são
                        deste mundo, o resto é vocabulário do motor
   ============================================================ */
export const DADOS_DO_CENARIO_PADRAO = {
  formato: 1,
  id: "taverna",
  nome: "As terras da Taverna",
  precos: {
    raridade: { comum: 15, incomum: 60, raro: 220, epico: 900, lendario: 3500 },
    semRaridade: 10,
    miudeza: 5,
    escala: [
      "ESCALA DE RIQUEZA: ◉ 10 sustenta um pobre por uma semana · ◉ 50 é um mês de vida simples · ◉ 200 compra equipamento de aventureiro respeitável · ◉ 1.000 é uma pequena fortuna (casa modesta, navio velho) · ◉ 10.000 é riqueza de nobre. Um camponês ganha ◉ 2–5 por dia de trabalho; um artesão, ◉ 5–10; um guarda, ◉ 8–15; um cavaleiro a serviço, ◉ 20–40.",
      "PREÇOS COMUNS: refeição simples ◉ 1–2 · refeição boa com bebida ◉ 3–5 · noite em estalagem simples ◉ 3–6 (quarto bom ◉ 8–15, luxo ◉ 25+) · caneca de cerveja ◉ 1 · garrafa de vinho bom ◉ 5–12 · ferradura/reparo simples ◉ 2–5 · poção de cura comum ◉ 25–50.",
      "EQUIPAMENTO: arma simples ◉ 10–25 · arma de qualidade ◉ 40–100 · armadura leve ◉ 15–40 · armadura pesada ◉ 60–150 · escudo ◉ 10–20 · item mágico menor ◉ 150–400 (raros e poderosos NÃO se vendem em loja comum).",
      "TRANSPORTE: cavalo de sela ◉ 75–150 · cavalo de guerra ◉ 300–600 · carroça ◉ 40–80 · passagem de navio por pessoa ◉ 5–20 por trecho (cabine boa ◉ 30–60) · fretar navio pequeno ◉ 150–400 por viagem.",
      "SERVIÇOS E PESSOAS: mercenário por dia ◉ 5–15 · guia por dia ◉ 3–8 · mensageiro ◉ 5–15 · suborno comum ◉ 10–50 · resgate de refém comum ◉ 100–500.",
      "CIDADES: em vilas tudo é mais barato (−30% a −50%); em capitais e portos ricos, mais caro (+30% a +100%). Escassez de guerra/cerco pode dobrar preços de comida.",
    ],
    comuns: [
      { id: "caneca", nome: "caneca de cerveja", curto: "caneca", base: 1, faixa: [1, 1], rua: true, rx: "\\b(canecas?|cervejas?|hidromel|aguardentes?|tragos?|copos? de (cerveja|aguardente|hidromel))\\b" },
      { id: "refeicao", nome: "refeição quente", curto: "prato quente", base: 2, faixa: [1, 2], rua: true, rx: "\\b(refeic(ao|oes)|pratos? (quente|do dia|de comida)|caldos?|sopas?|ensopados?|comida quente|jantar|almoco|ceia|algo de comer|de comer)\\b" },
      { id: "refeicaoBoa", nome: "refeição boa com bebida", base: 4, faixa: [3, 5], rx: "\\b(refeic(ao|oes) boas?|banquete|mesa farta|assados?)\\b" },
      { id: "vinho", nome: "garrafa de vinho bom", base: 8, faixa: [5, 12], rx: "\\b(garrafas? de vinho|jarras? de vinho|vinho bom|vinhos?)\\b" },
      { id: "rua", nome: "comida de rua (pão, fruta, peixe seco)", curto: "pão, fruta ou peixe seco", base: 1, faixa: null, rua: true, porPalavra: true, rx: "\\b(paes|pao|fruta|frutas|peixes? secos?|peixes?|queijos?|bolos?|espetinhos?|castanhas?|figos?|uvas?|peras?|laranjas?)\\b" },
      { id: "reparo", nome: "reparo simples", base: 3, faixa: [2, 5], rx: "\\b(conserto|consertar|reparo|reparar|remendo|remendar|ferraduras?)\\b" },
      { id: "guia", nome: "guia, por dia", base: 5, faixa: [3, 8], rx: "\\b(guias?|quem me leve|quem nos leve)\\b" },
      { id: "mensageiro", nome: "mensageiro", base: 10, faixa: [5, 15], rx: "\\b(mensageiros?|levar (uma|a|esta) (carta|mensagem|recado))\\b" },
      { id: "passagem", nome: "passagem de barco, por pessoa", base: 10, faixa: [5, 20], rx: "\\b(passage(m|ns) (de|num|no|em) (barco|navio)|barqueiros?|travessia)\\b" },
      { id: "informacao", nome: "uma informação, de quem a vende", base: 3, faixa: null, rx: "\\b(quanto (voce |tu |o senhor |a senhora )?(quer|queres|cobra|cobras|pede|pedes|leva|levas) (por|pra|para) (saber|dizer|contar|falar|mostrar|guiar|abrir a boca|isso)|(preco|quanto) (da|de uma|pela|por uma) informac(ao|oes))" },
      { id: "pedagio", nome: "pedágio da porta, por cabeça", base: 1, faixa: null, rx: "\\b(pedagios?|portagem|taxa de entrada|imposto da porta)\\b" },
    ],
  },
  ocupacoes: [
    { nome: "Ferreiro", desc: "Forja e repara armas e armaduras.", beneficio: "Trabalho de metal: a bancada de utilitários fica 3 mais fácil, e o que você vende vale +20%.", efeito: { bancada: { utilitario: 3 }, venda: 0.2 } },
    { nome: "Alquimista", desc: "Destila poções, venenos e reagentes.", beneficio: "Fervura e paciência: a bancada de alquimia fica 3 mais fácil.", efeito: { bancada: { alquimia: 3 } } },
    { nome: "Herborista", desc: "Conhece ervas, raízes e cogumelos.", beneficio: "Conhece o mato: cada forrageamento traz 2 componentes a mais.", efeito: { colher: 2 } },
    { nome: "Cartógrafo", desc: "Desenha e lê mapas de terras desconhecidas.", beneficio: "Lê a terra: +5 no teste de navegação — você quase não se perde.", efeito: { navegar: 5 } },
    { nome: "Escriba", desc: "Copia, traduz e decifra documentos antigos.", beneficio: "Lê o que ninguém lê: +2 em todo teste de Intelecto.", efeito: { teste: { intelecto: 2 } } },
    { nome: "Cozinheiro", desc: "Transforma ração em refeição de verdade.", beneficio: "Comida de verdade: cada companheiro recupera 3 PV a mais no descanso longo.", efeito: { curaGrupo: 3 } },
    { nome: "Joalheiro", desc: "Lapida gemas e engasta encantamentos.", beneficio: "Sabe o que vale: +25% em tudo que você vende.", efeito: { venda: 0.25 } },
    { nome: "Curtidor", desc: "Trabalha couro e peles de criaturas.", beneficio: "Aproveita a carcaça: cada corpo rende 1 componente a mais.", efeito: { despojos: 1 } },
    { nome: "Minerador", desc: "Sabe onde e como extrair metal e pedra.", beneficio: "Enxerga a veia na pedra: +1 componente ao forragear e +2 em testes de Percepção.", efeito: { colher: 1, teste: { percepcao: 2 } } },
    { nome: "Caçador de Recompensas", desc: "Vive de contratos e alvos marcados.", beneficio: "Cobra pelo trabalho: +30% de moedas nos espólios de combate.", efeito: { espolio: 0.3 } },
    { nome: "Mercador", desc: "Compra barato, vende caro, conhece todo mundo.", beneficio: "Conhece todo mundo: 20% de desconto na compra e +15% na venda.", efeito: { compra: 0.2, venda: 0.15 } },
    { nome: "Médico de Campo", desc: "Estanca sangue e remenda ossos sem magia.", beneficio: "Remenda sem magia: +4 PV para você em cada descanso e +2 para cada companheiro.", efeito: { curaDescanso: 4, curaGrupo: 2 } },
  ],
  bestiario: {
    generosDasCriaturas: ["Fantasia medieval"],
    emprestados: 4,
    criaturas: [
      { nome: "Slime", ameaca: "fraco", nivelRef: 1, des: -2, desc: "gosma lenta e previsível" },
      { nome: "Rato Gigante", ameaca: "fraco", nivelRef: 1, des: 3, desc: "praga de esgoto" },
      { nome: "Lobo", ameaca: "fraco", nivelRef: 1, des: 2, desc: "caça em bando" },
      { nome: "Goblin", ameaca: "fraco", nivelRef: 1, des: 2, desc: "covarde em grupo pequeno, atrevido em bando" },
      { nome: "Bandido", ameaca: "comum", nivelRef: 2, des: 1, desc: "gente desesperada com aço barato" },
      { nome: "Esqueleto", ameaca: "comum", nivelRef: 2, des: 1, desc: "osso animado sem medo" },
      { nome: "Zumbi", ameaca: "comum", nivelRef: 2, des: -2, desc: "lento, incansável" },
      { nome: "Lobo Atroz", ameaca: "comum", nivelRef: 3, des: 2, desc: "alfa de presas longas" },
      { nome: "Cultista", ameaca: "comum", nivelRef: 3, des: 0, desc: "fanático com magia menor" },
      /* O DESC DIZ E A MESA NÃO OUVE: "força bruta e pouco cérebro" nunca
         chega à luta, porque `completarInimigo` não copia o `desc`. Sem a
         declaração, o Ogro herdaria `astuto` por ser `competente`. */
      { nome: "Ogro", ameaca: "competente", nivelRef: 4, des: -1, desc: "força bruta e pouco cérebro", degrau: "bruto" },
      { nome: "Troll", ameaca: "competente", nivelRef: 5, des: 0, desc: "regenera se não queimar", perfil: { ataque: "fisico", fraqueza: ["fogo"], resist: [] } },
      /* Nenhum regex reconhece um elemental, então ele cairia no padrão
         `pensa` e herdaria `astuto`. Fúria de um elemento não faz plano. */
      { nome: "Elemental Menor", ameaca: "competente", nivelRef: 5, des: 1, desc: "fúria de um elemento", perfil: { ataque: "fogo", resist: ["fogo"], fraqueza: ["gelo"] }, degrau: "bruto" },
      { nome: "Golem de Pedra", ameaca: "elite", nivelRef: 7, des: -2, desc: "imune a medo, lento e esmagador" },
      /* "Quimera" não casa com o regex de bicho: sem declaração, três cabeças
         de animal herdariam o degrau de um oficial. */
      { nome: "Quimera", ameaca: "elite", nivelRef: 8, des: 2, desc: "três cabeças, três mortes", perfil: { ataque: "fogo", resist: ["fogo"], fraqueza: [] }, degrau: "bruto" },
      { nome: "Gigante", ameaca: "elite", nivelRef: 9, des: -1, desc: "cada golpe derruba muralhas", perfil: { ataque: "fisico", resist: ["fisico"], fraqueza: [] }, degrau: "bruto" },
      /* IMPORTANTE: um dragão nunca é um bando. Ele chega sozinho, com nome, e a
         mesa negocia com ele antes de o enfrentar — a morte dele é o fim de um
         episódio, não o fim de uma rodada. */
      { nome: "Dragão Jovem", ameaca: "lendario", nivelRef: 10, des: 2, desc: "sopro devastador, orgulho maior ainda", importante: true },
      /* O TOPO SE DECLARA. O Lich é morto-vivo e o teto do morto é `bruto` —
         seria o arquimago do jogo com a cabeça de um esqueleto de guarda. */
      /* IMPORTANTE: o filactério é uma trama inteira. Um Lich que cai a 0 PV sem
         cena leva a trama com ele — e é exatamente a criatura que tem algo a
         dizer no chão antes de acabar. */
      { nome: "Lich", ameaca: "lendario", nivelRef: 12, des: 1, desc: "arquimago morto-vivo com filactério", degrau: "brilhante", importante: true },
      /* IMPORTANTE: uma calamidade com asas é o fim da campanha ou o começo dela.
         Nada nesse tamanho pode morrer num número. */
      { nome: "Dragão Ancião", ameaca: "lendario", nivelRef: 16, des: 3, desc: "uma calamidade com asas", degrau: "brilhante", importante: true },
    ],
    arquetipos: [
      { nome: "Capanga", ameaca: "fraco", nivelRef: 1, des: 0, desc: "músculo descartável" },
      { nome: "Batedor", ameaca: "fraco", nivelRef: 2, des: 4, desc: "rápido, frágil" },
      /* "treinado e disciplinado" está escrito no desc e não chega à mesa;
         por `ameaca` ele herdaria `bruto`, o degrau do capanga. */
      { nome: "Soldado", ameaca: "comum", nivelRef: 3, des: 1, desc: "treinado e disciplinado", degrau: "astuto" },
      { nome: "Atirador", ameaca: "comum", nivelRef: 3, des: 3, desc: "perigoso à distância" },
      { nome: "Brutamontes", ameaca: "competente", nivelRef: 5, des: -1, desc: "aguenta e devolve", degrau: "bruto" },
      /* A PROVA DE QUE `ameaca` SOZINHA NÃO BASTA: Comandante ("perigoso e
         tático") e Sentinela Blindada ("muralha ambulante") são as duas
         `elite` e herdariam o MESMO degrau. A muralha declara; o oficial
         herda `treinado`, que é o que ele é. */
      { nome: "Sentinela Blindada", ameaca: "elite", nivelRef: 7, des: -2, desc: "muralha ambulante", perfil: { ataque: "fisico", resist: ["fisico"], fraqueza: ["raio"] }, degrau: "bruto" },
      /* IMPORTANTE, E É A ÚNICA QUE NÃO É `lendario` — de propósito, porque o
         critério não é perigo. O Comandante é o oficial: aparece nomeado, é com
         ele que se fala, e é ele que se pode render, prender ou interrogar. Ele é
         a criatura por quem Q4 existe; deixá-lo morrer direto seria fechar a porta
         antes de ela ser aberta. */
      { nome: "Comandante", ameaca: "elite", nivelRef: 8, des: 2, desc: "perigoso e tático", importante: true },
      /* O COLOSSO É DUAS CRIATURAS DIFERENTES, DEPENDENDO DE QUEM O LÊ — e o
         motivo da declaração é o caminho real, não o acidente de palavra.
         COM o `desc`, `RX_BICHO` casa "besta" dentro de "máquina/besta de
         cerco" e ele vira bicho: é o retrato de N1, **18 das 27 em `pensa`**.
         SEM o `desc` — que é o que a mesa vê, porque `completarInimigo` não o
         copia e `degrauDaCriatura` roda com nome + ameaça — ele cai no padrão
         `pensa`, e são **19 das 27**. O Colosso é a ÚNICA diferença entre os
         dois retratos.
         Ou seja: sem declaração ele não herdaria `animal`, herdaria
         `treinado`, por ser `lendario` e "pensar" por omissão. Uma máquina de
         cerco com o degrau de um oficial é pior que uma com o de um bicho.
         A declaração fixa o que ele é nos dois caminhos, e não mexe no regex
         (que é comportamento vivo, e conserto de outra etapa). */
      { nome: "Colosso", ameaca: "lendario", nivelRef: 11, des: -2, desc: "máquina/besta de cerco", perfil: { ataque: "fisico", resist: ["fisico", "veneno"], fraqueza: ["raio"] }, degrau: "bruto" },
      /* IMPORTANTE: "o que não deveria existir" é, por definição, um só. O
         Colosso, que é o outro `lendario` daqui, NÃO declara — uma máquina de
         cerco quebra, não morre, e não há cena a perder quando ela para. É a
         prova de que este campo não sai de `ameaca`. */
      { nome: "Horror", ameaca: "lendario", nivelRef: 13, des: 3, desc: "o que não deveria existir", perfil: { ataque: "sombrio", resist: ["sombrio", "veneno"], fraqueza: ["sagrado"] }, importante: true },
    ],
  },
  generos: {
    padrao: "Fantasia medieval",
    futuristas: ["Ficção científica", "Cyberpunk", "Pós-apocalíptico"],
    marcasProprias: [
      "\\bsolo leveling\\b", "\\banimes?\\b", "\\bmangas?\\b", "\\bmanhwas?\\b", "\\bisekai\\b",
      "\\bcyberpunk\\b", "\\bficcao cientifica\\b", "\\bsci-?fi\\b", "\\bfutur\\w*", "\\bnaves?\\b",
      "\\bespacia\\w*", "\\bgalax\\w*", "\\bplanetas?\\b", "\\bmodern[oa]s?\\b", "\\bcontemporane\\w*",
      "\\bmetro\\b", "\\barranha-ceus?\\b", "\\bcelulares?\\b", "\\binternet\\b", "\\bpos-apocal\\w*",
      "\\bzumbis?\\b", "\\binspirad[oa] em\\b", "\\bbasead[oa] em\\b", "\\buniverso de\\b", "\\bno estilo de\\b",
    ],
    /* 6.ª fatia (constantes.js GENEROS): os cartões da criação, na ordem da tela */
    criacao: [
      { id: "fantasia", label: "Fantasia medieval", glifo: "castelo", dica: "Reinos, magia antiga, criaturas lendárias" },
      { id: "scifi", label: "Ficção científica", glifo: "foguete", dica: "Naves, colônias estelares, IAs e alienígenas" },
      { id: "cyberpunk", label: "Cyberpunk", glifo: "terminal", dica: "Megacorporações, implantes, ruas de neon" },
      { id: "horror", label: "Horror cósmico", glifo: "olho", dica: "Segredos proibidos, sanidade em risco" },
      { id: "posapoc", label: "Pós-apocalíptico", glifo: "caveira", dica: "Ruínas, facções, sobrevivência" },
      { id: "steampunk", label: "Steampunk", glifo: "bussola", dica: "Vapor, engrenagens, impérios voadores" },
      { id: "livre", label: "Universo próprio", glifo: "faiscas", dica: "Você descreve tudo do zero" },
    ],
  },
  /* 4.ª fatia: a gente (nomes.js). Cada gênero tem o seu banco; o gênero que
     não tem banco usa o de `generos.padrao` (e por isso esse é obrigatório).
     `cidadeUnica` pode vir vazia: aí toda cidade é prefixo + sufixo. */
  gente: {
    tracos: ["desconfiado", "acolhedor", "ambicioso", "melancólico", "brincalhão", "severo", "curioso", "reservado", "leal", "oportunista", "orgulhoso", "gentil", "sarcástico", "corajoso", "covarde", "sábio", "ingênuo", "vingativo", "generoso", "ganancioso", "protetor", "solitário", "carismático", "rabugento", "sonhador", "pragmático"],
    bancos: {
      "Fantasia medieval": {
        cidadePre: ["Pedra", "Corvo", "Fenda", "Vale", "Alto", "Porto", "Foz", "Torre", "Ponte", "Cinza", "Ferro", "Ouro", "Espinho", "Névoa", "Lobo", "Águia", "Trovão", "Sombra", "Luz", "Sal", "Carvalho", "Salgueiro", "Junco", "Brasa", "Gelo", "Muralha", "Serra", "Rio", "Lago", "Duna", "Areia", "Bruma", "Rocha", "Cravo", "Urze", "Fonte"],
        cidadeSuf: ["vale", "monte", "forte", "burgo", "gard", "held", "mar", "fonte", "porto", "ponte", "guarda", "haven", "reduto", "campo", "ermo", "cova", "passo", "vau", "clareira", "confim", "âncora", "abismo", "cume", "portal", "faina", "recanto", "brenha", "torreão"],
        cidadeUnica: ["Valdoravem", "Silverwyn", "Grão-Corvo", "Thornhaven", "Mistral", "Ravensholm", "Aldebrand", "Fimbulvargr", "Ísgard", "Torrecinza", "Bruxelgard", "Marfilheira", "Colinégra", "Doiravém", "Frostmere", "Ashkarr", "Vindolâna", "Elderwyn", "Grimhollow", "Solmyr", "Kaervon", "Duncrag", "Wyrmpost", "Belhaven", "Thaloria", "Ysolde", "Karnak-Dûr", "Ravenmoor", "Silvergate", "Blackfen"],
        masc: ["Aldric", "Brannoc", "Cedric", "Doran", "Edric", "Fendrel", "Gareth", "Halvard", "Ivarr", "Joric", "Kael", "Loras", "Magnus", "Neirin", "Osric", "Perrin", "Quorin", "Rhogar", "Sethric", "Torvald", "Ulric", "Varek", "Wystan", "Yorick", "Alaric", "Bjorn", "Corwin", "Dagon", "Eamon", "Falk", "Godfrey", "Hakon", "Isen", "Jarl", "Kolvar", "Lucan", "Merek", "Nolan", "Orin", "Piotr"],
        fem: ["Aelith", "Bryna", "Ceridwen", "Dahlia", "Elowen", "Fenna", "Gwynn", "Hilda", "Isolde", "Jora", "Kaelith", "Lysa", "Morgane", "Nyla", "Ondine", "Petra", "Quilla", "Rowena", "Sable", "Thalia", "Ursa", "Vionna", "Wren", "Ylva", "Astrid", "Brigid", "Cora", "Dagny", "Eira", "Freya", "Greta", "Helga", "Ingrid", "Sigrun", "Runa", "Mabel", "Nesa", "Orla", "Perrine", "Saoirse"],
        sobrenome: ["Coração-de-Ferro", "Punho-de-Pedra", "Olho-de-Corvo", "Mata-Lobos", "Sombravinda", "Ventoforte", "Filho da Névoa", "da Foz", "o Manco", "Barba-Ruiva", "Lâmina-Rápida", "Pé-Leve", "Sem-Medo", "o Andarilho", "da Torre", "Rompe-Escudos", "Voz-Grave", "Mão-Torta", "o Exilado", "Cinza-Antiga", "Guarda-Portão", "Queima-Campos", "o Silencioso", "Passo-de-Gato", "da Urze"],
        povos: ["humano", "humana", "elfo", "elfa", "anão", "anã", "halfling", "meio-orc", "tiefling", "gnomo", "draconato"],
        oficios: ["ferreiro", "taverneiro(a)", "guarda", "mercador", "curandeiro(a)", "caçador", "escriba", "sacerdote", "ladrão", "nobre", "bardo", "fazendeiro(a)", "estalajadeiro", "capitão(ã)", "aprendiz de mago"],
      },
      "Ficção científica": {
        cidadePre: ["Nova", "Neo", "Porto", "Estação", "Colônia", "Setor", "Domo", "Orbital", "Cratera", "Alta", "Bio", "Cryo", "Helio", "Ferro", "Titânio", "Vega", "Sirius", "Aurora", "Ápex", "Zênite", "Núcleo", "Perímetro", "Ecos", "Vácuo", "Prisma"],
        cidadeSuf: ["-9", "Prime", "Central", "-Alfa", "-Beta", "Station", "Point", "Reach", "Spire", "Haven", "Vault", "Nexus", "Terminal", "Bastion", "Cradle", "Gate", "Rift", "Verge", "Hub", "Descent", "Ascent", "-VII", "-Zero", "Anchorage"],
        cidadeUnica: ["Aethel-9", "Cinzas de Kepler", "Novaróvia", "Terminus Prime", "Solaris Vault", "Cratera Vermelha", "Elysium-4", "Baluarte Órion", "Ízaro Station", "Perdição de Vega", "Novo Bizâncio", "Halcyon Reach", "Umbra Deep", "Cindervale Orbital", "Argos Prime", "Tycho Descent", "Meridian-0", "Vantablack", "Porto Hélio", "Cradle-VII", "Sombra de Titã", "Última Órbita", "Icarus Fell", "Zênite Pálido", "Quietus"],
        masc: ["Ky", "Zane", "Rael", "Cass", "Orin", "Dax", "Vex", "Kato", "Silas", "Jarek", "Corvin", "Nyx", "Thane", "Ezio", "Ravi", "Soren", "Kael", "Bishop", "Cyrus", "Dane", "Enzo", "Fenn", "Gideon", "Halston", "Ivo", "Joaquim", "Kir", "Lux", "Marlow", "Niko"],
        fem: ["Nyx", "Zara", "Echo", "Vesper", "Lyra", "Cira", "Juno", "Rhea", "Sol", "Ada", "Kaja", "Nova", "Ondina", "Perla", "Quíntia", "Riven", "Sable", "Tessa", "Ume", "Vala", "Wren", "Xara", "Yuki", "Zephyr", "Astra", "Briar", "Calla", "Dita", "Elara", "Freyja"],
        sobrenome: ["Vex", "Cross", "Halloway", "Okonkwo", "Petrov", "Nakamura", "Reyes", "Voss", "Kane", "Sol-9", "Ferro", "Kestrel", "Marchetti", "Osei", "Ravenna", "Sato", "Thorne", "Ustinov", "Valdez", "Wraith", "Xu", "Yamada", "Zoric", "Adeyemi", "Blackwood"],
        povos: ["humano", "humana", "sintético", "colono", "mutante", "ciborgue", "alienígena"],
        oficios: ["engenheiro(a)", "piloto", "médico(a)", "contrabandista", "cientista", "soldado", "mecânico(a)", "diplomata", "minerador(a)", "hacker"],
      },
      "Cyberpunk": {
        cidadePre: ["Neo", "Setor", "Bloco", "Zona", "Distrito", "Baixa", "Alta", "Sub", "Meta", "Ciber", "Cromo", "Neon", "Vidro", "Aço", "Ácido", "Pixel", "Data", "Fluxo", "Ruído", "Sinal"],
        cidadeSuf: ["City", "Sprawl", "-Sul", "-Norte", "Zero", "Prime", "Underground", "Heights", "Slums", "Grid", "Node", "Loop", "Wire", "Deck", "Zone", "-13", "Central", "Fringe", "Verge", "Core"],
        cidadeUnica: ["Neonhaven", "Cromo City", "Setor Cinza", "Baixa Ácida", "Distrito Vidro", "Néon-13", "Vórtex Sprawl", "Aço & Sombra", "Pixelburgo", "Data-Fim", "Ruído Central", "Meta-Sul", "Ferro Fundido", "Zona Morta", "Cabo Solto", "Circuito Aberto", "Vidro Quebrado", "Nêon Pálido", "Subúrbio Zero", "Cinza Elétrica"],
        masc: ["Rez", "Jax", "Kilo", "Neo", "Vye", "Dash", "Cipher", "Ryu", "Zeke", "Nox", "Blade", "Kane", "Wire", "Ghost", "Ivo", "Sly", "Cade", "Dex", "Enzo", "Fang", "Griff", "Haze", "Idris", "Juke", "Kaz"],
        fem: ["Rune", "Vex", "Neon", "Kira", "Zev", "Trace", "Cyra", "Nyx", "Echo", "Vina", "Glitch", "Mira", "Onyx", "Pixel", "Quim", "Raze", "Syn", "Tibi", "Umbra", "Vega", "Wisp", "Xen", "Yara", "Zola", "Ada"],
        sobrenome: ["Wire", "Cross", "Volt", "Zero", "Kade", "Nyx", "Chrome", "Steel", "Vega", "Kill", "Static", "Rook", "Sable", "Tox", "Umbra", "Vice", "Wraith", "Xero", "Yakuza", "Zane", "Byte", "Cinder", "Dusk", "Edge", "Flux"],
        povos: ["humano", "humana", "ciborgue", "androide", "modificado", "netrunner"],
        oficios: ["fixer", "netrunner", "guarda-costas", "traficante", "médico(a) de rua", "corporativo", "mercenário(a)", "informante", "técnico", "dançarino(a)"],
      },
      "Horror cósmico": {
        cidadePre: ["Vale", "Névoa", "Corvo", "Cinza", "Salgado", "Velho", "Baixo", "Fundo", "Pântano", "Bruma", "Sombra", "Silêncio", "Musgo", "Pó", "Ossos", "Sino", "Cripta", "Sal", "Maré", "Junco"],
        cidadeSuf: ["field", "moor", "wick", "hollow", "marsh", "haven", "port", "crest", "vale", "mouth", "barrow", "end", "reach", "fen", "grave", "mire", "shade", "cove", "ness", "gloom"],
        cidadeUnica: ["Innsvale", "Corvos-Fundos", "Névoa Salgada", "Baixa-do-Sino", "Pântano Cinza", "Ossário", "Marévem", "Silêncio", "Cripta-do-Sal", "Bruma Antiga", "Vale-Sussurro", "Musgo-Fundo", "Pó & Cinzas", "A Enseada", "Fim-do-Junco", "Sombravale", "Maré-Morta", "Sino Rachado", "Barrowick", "Gloomfen"],
        masc: ["Ezra", "Silas", "Josiah", "Amos", "Cornelius", "Ebenezer", "Thaddeus", "Obed", "Hiram", "Zebediah", "Barnabas", "Increase", "Elias", "Jedediah", "Nathaniel", "Ichabod", "Mordecai", "Phineas", "Reuben", "Zadok", "Caleb", "Enoch", "Gideon", "Levi", "Absalom"],
        fem: ["Prudence", "Mercy", "Abigail", "Constance", "Temperance", "Verity", "Charity", "Patience", "Hepzibah", "Keziah", "Tabitha", "Dorcas", "Lavinia", "Ophelia", "Cordelia", "Winifred", "Eudora", "Marguerite", "Selah", "Thomasine", "Bathsheba", "Damaris", "Eunice", "Jerusha", "Zipporah"],
        sobrenome: ["Marsh", "Whateley", "Gilman", "Pickman", "Corvo", "Blackwood", "Ashby", "Deverell", "Ottoline", "Sallow", "Thorne", "Vane", "Crane", "Fenwick", "Grimshaw", "Holloway", "Mordaunt", "Nightingale", "Orlok", "Peabody", "Quintus", "Ravenscroft", "Sowerby", "Trevelyan", "Usher"],
        povos: ["humano", "humana", "híbrido", "amaldiçoado", "cultista", "forasteiro"],
        oficios: ["pescador", "bibliotecário(a)", "médico", "pastor", "professor(a)", "antiquário", "coveiro", "viúvo(a)", "detetive", "taverneiro"],
      },
      "Pós-apocalíptico": {
        cidadePre: ["Posto", "Refúgio", "Ruína", "Cinza", "Ferro", "Sucata", "Poço", "Cruz", "Muro", "Cova", "Sal", "Rádio", "Pó", "Ossos", "Última", "Nova", "Baixa", "Alta", "Vale", "Cratera"],
        cidadeSuf: ["-Zero", "Alta", "Baixa", "-7", "Nova", "Velha", "do Sul", "do Norte", "Central", "Fim", "Reduto", "Abrigo", "Cova", "Passagem", "Fronteira", "Ermo", "Poço", "Muro", "Cruz", "Vau"],
        cidadeUnica: ["Refúgio-7", "Cova de Ferro", "Sucata Alta", "Cruz do Sul", "Poço Cinza", "Última Cidade", "Muro-Zero", "Ossário", "Nova Esperança", "Radioburgo", "Sal & Pó", "Baixa Enferrujada", "Cratera Verde", "Fim da Estrada", "Reduto", "Passagem Morta", "Vale Seco", "Posto Cinza", "Ferro-Velho", "A Fronteira"],
        masc: ["Ruck", "Dust", "Cole", "Hatchet", "Rem", "Boone", "Kade", "Slate", "Ash", "Diesel", "Gunnar", "Hawk", "Iron", "Jonah", "Krow", "Levi", "Mace", "Nash", "Ozzy", "Pike", "Quill", "Rook", "Stray", "Tank", "Vulture"],
        fem: ["Rust", "Sage", "Wren", "Ash", "Piper", "Rune", "Cinder", "Dove", "Ember", "Fawn", "Grit", "Hazel", "Iris", "June", "Kestrel", "Lark", "Mica", "Nova", "Onyx", "Prairie", "Quinn", "Raven", "Scout", "Thistle", "Vera"],
        sobrenome: ["Ferro", "Cinza", "do Poço", "Sucateiro", "Sem-Terra", "Rádio", "o Marcado", "Mão-Seca", "da Cratera", "Corvo", "Pé-de-Chumbo", "a Nômade", "do Muro", "Queima-Tudo", "Osso", "Ferrugem", "Sal", "o Errante", "da Cova", "Pólvora", "Vidro", "Grão", "Chuva-Ácida", "Fenda", "Últim"],
        povos: ["humano", "humana", "mutante", "sintético", "nômade", "ghoul"],
        oficios: ["sucateiro", "curandeiro(a)", "batedor", "líder de posto", "mercador(a)", "caçador", "mecânico(a)", "guarda", "fazendeiro", "contrabandista"],
      },
      "Steampunk": {
        cidadePre: ["Alto", "Ferro", "Vapor", "Cobre", "Bronze", "Engrenagem", "Fumaça", "Torre", "Ponte", "Porto", "Baixo", "Novo", "Grão", "Rio", "Fábrica", "Relógio", "Câmbio", "Mola", "Pistão", "Carvão"],
        cidadeSuf: ["burgo", "vapor", "forja", "ford", "haven", "gate", "spire", "works", "port", "cross", "field", "borough", "steam", "cog", "brass", "shire", "hollow", "reach", "end", "haven"],
        cidadeUnica: ["Cobrevale", "Altavapor", "Engrenópolis", "Ferro & Fumaça", "Torre-Relógio", "Bronzeburgo", "Câmbio Alto", "Pistão Central", "Novo Carvão", "Fábrica Velha", "Rio Fuligem", "Molafield", "Grão-Bronze", "Ponte-Vapor", "Baixa Fumaça", "Cogsworth", "Latão-Reach", "Vaporgard", "Fuligem", "Brassholt"],
        masc: ["Ambrose", "Bartholomew", "Cornelius", "Desmond", "Edmund", "Fitzgerald", "Gideon", "Horace", "Ignatius", "Jasper", "Klaus", "Leopold", "Montgomery", "Nathaniel", "Octavius", "Percival", "Quentin", "Reginald", "Sebastian", "Thaddeus", "Ulysses", "Vincent", "Wallace", "Xavier", "Zephaniah"],
        fem: ["Arabella", "Beatrix", "Cordelia", "Dorothea", "Evangeline", "Florence", "Genevieve", "Henrietta", "Isadora", "Josephine", "Katharine", "Lavinia", "Millicent", "Nadine", "Ottilie", "Prudence", "Rosalind", "Seraphina", "Theodora", "Ursula", "Vivienne", "Wilhelmina", "Xanthe", "Yolanda", "Zelda"],
        sobrenome: ["Copperwright", "Ironmonger", "Steamwell", "Brasswick", "Cogsworth", "Fairweather", "Gearhart", "Ashcombe", "Blackwood", "Cranborne", "Featherstone", "Goldwyn", "Hartley", "Ironside", "Kettering", "Leadbetter", "Merriweather", "Pennington", "Quill", "Rothschild", "Sootheby", "Thornbury", "Underwood", "Vandermere", "Whitlock"],
        povos: ["humano", "humana", "autômato", "engenhoso", "aristocrata", "aeronauta"],
        oficios: ["inventor", "aeronauta", "relojoeiro(a)", "industrial", "detetive", "aristocrata", "maquinista", "cientista", "jornalista", "capitão(ã)"],
      },
    },
  },
  panteao: {
    nomes: {
      inicio: ["Vhar", "Oss", "Mel", "Thar", "Ilu", "Kael", "Zor", "Ael", "Mor", "Sae", "Dun", "Rha", "Vel", "Nyss", "Oth", "Bren"],
      fim: ["ath", "imir", "andra", "ok", "is", "ael", "un", "eira", "oth", "yra", "ash", "iel", "om", "essa"],
    },
    dominios: [
      { dominio: "da Colheita e da Fome", icone: "🌾", temper: ["generosa", "cobradora", "silenciosa"] },
      { dominio: "das Tempestades", icone: "⛈", temper: ["colérica", "imprevisível", "orgulhosa"], sinais: { "colérica": "tempestade com relâmpagos que escrevem runas" } },
      { dominio: "dos Mortos e dos Juramentos", icone: "💀", temper: ["solene", "vingativa", "justa"] },
      { dominio: "da Forja e do Fogo", icone: "🔥", temper: ["teimosa", "honrada", "ciumenta"] },
      { dominio: "dos Mares e das Perdições", icone: "🌊", temper: ["volúvel", "ciumenta", "antiga"] },
      { dominio: "da Lua e dos Segredos", icone: "🌙", temper: ["enigmática", "gentil", "mentirosa"] },
      { dominio: "da Guerra e das Correntes", icone: "⛓", temper: ["brutal", "honrada", "faminta"] },
      { dominio: "das Bestas e das Fronteiras", icone: "🐺", temper: ["selvagem", "protetora", "desconfiada"] },
      { dominio: "do Comércio e dos Cifrões", icone: "⚖", temper: ["negociadora", "avara", "elegante"] },
      { dominio: "dos Sonhos e dos Pesadelos", icone: "🕯", temper: ["tênue", "perturbadora", "maternal"] },
      { dominio: "da Doença e da Cura", icone: "🩸", temper: ["ambígua", "fria", "compassiva"] },
      { dominio: "do Conhecimento Proibido", icone: "📖", temper: ["curiosa", "perigosa", "paciente"] },
    ],
    cultos: ["a Ordem", "o Círculo", "os Filhos", "a Seita", "os Vigias", "o Concílio", "as Mãos"],
    /* 5.ª fatia: as palavras da escala, do GD 0 ao 4 — os fiéis de cada grau
       são física (divindades.js) e não se escrevem aqui */
    titulos: [
      { titulo: "Mortal", desc: "Carne, tempo e medo — como quase todos." },
      { titulo: "Herói Lendário", desc: "O povo já reza BAIXINHO o seu nome." },
      { titulo: "Semideus", desc: "Uma centelha vive em você — sua presença pesa no ar." },
      { titulo: "Divindade Menor", desc: "Um domínio responde quando você chama." },
      { titulo: "Divindade Maior", desc: "Força cósmica — o mundo se curva." },
    ],
    /* 6.ª fatia: o que o Narrador lia escrito no código — os três estágios da
       ascensão (divindades.js) e as palavras que só a fé dá (prompt.js) */
    estagios: ["Servo Escolhido", "Receptáculo", "Nova Divindade"],
    palavrasDivinas: ["Semideus", "Divindade"],
    /* 7.ª fatia: o que um deus faz no mundo depois do despertar — os seis
       eventos que divindades.js escrevia no código (os paladinos, o
       relicário, a guerra de fé, o profeta, o silêncio, o milagre). As marcas
       entre chaves são o vocabulário do motor (cenario.js marcasDoEvento):
       {nome} {dominio} {icone} {culto} {sinal} do deus; {nome2} {icone2} do
       segundo, só no evento com `dois`; {lugar:com @|sem} a frase com e sem
       o lugar; {sorte:a|b} uma das formas, pela sorte do evento. */
    eventos: [
      { icone: "⛈", texto: "{icone} {nome} {dominio} manifesta-se: um sinal impossível ({sinal}) é visto {lugar:perto de @|na região}. O culto {culto} interpreta como {sorte:aviso|promessa}.", gancho: "investigar o sinal pode render favor — ou inimizade — da divindade" },
      { icone: "🕯", texto: "Paladinos d{culto} chegam {lugar:a @|à região} caçando um relicário roubado de {nome}. Oferecem recompensa em bênçãos (PF) a quem ajudar.", gancho: "relicário pode estar à venda no mercado negro — ou nas mãos de alguém do círculo do herói" },
      { icone: "⚡", dois: true, texto: "Guerra de fé: {nome} {icone} e {nome2} {icone2} disputam um mesmo domínio nas orações do povo. Templos rivais se provocam {lugar:em @|na região} — e cada lado busca campeões mortais.", gancho: "escolher um lado muda sua relação com os dois deuses" },
      { icone: "📿", texto: "Um profeta menor d{culto} prega que {nome} {dominio} \"escolherá um novo receptáculo entre os mortais desta geração\". Multidões se agitam; olhares começam a medir os heróis conhecidos — inclusive você.", gancho: "o culto pode vir testar (ou recrutar) o herói" },
      { icone: "🌑", texto: "As orações a {nome} ficaram sem resposta por três noites seguidas. O culto {culto} entra em pânico discreto: algo enfraquece a divindade — ou a distraiu.", gancho: "uma divindade vulnerável é oportunidade rara (e perigosa)" },
      { icone: "🩸", texto: "Um milagre brutal atribuído a {nome}: {sorte:um ímpio foi consumido por dentro pela própria sombra em praça pública|uma criança condenada acordou curada falando na língua dos deuses}. A fé da região oscila.", gancho: "testemunhas do milagre podem ter visto mais do que deviam" },
    ],
  },
  /* 5.ª fatia: os lugares (toponimia.js). Três padrões sobre bancos de algumas
     dezenas de palavras dão milhares de nomes por tipo de lugar; o tamanho
     dos bancos é o que impede a "Feira Baixa" de aparecer duas vezes no
     mesmo mundo (o cabeçalho de toponimia.js tem a conta). */
  lugares: {
    bancos: {
      "Fantasia medieval": {
        subst: ["Javali|m", "Corvo|m", "Dragão|m", "Âncora|f", "Coroa|f", "Taça|f", "Punhal|m", "Sereia|f", "Machado|m", "Lua|f", "Cavalo|m", "Rosa|f", "Grifo|m", "Bota|f", "Escudo|m", "Cabra|f", "Lobo|m", "Espada|f", "Barril|m", "Pena|f", "Ogro|m", "Chama|f", "Trovão|m", "Moeda|f", "Cálice|m", "Ferradura|f", "Foice|f", "Elmo|m", "Sino|m", "Ponte|f", "Bigorna|f", "Lança|f", "Urso|m", "Falcão|m", "Serpente|f", "Raposa|f", "Texugo|m", "Garça|f", "Touro|m", "Cervo|m", "Âmbar|m", "Carvalho|m", "Salgueiro|m", "Espinho|m", "Cardo|m", "Urze|f", "Hera|f", "Trigo|m", "Martelo|m", "Roda|f", "Vela|f", "Lanterna|f", "Candeia|f", "Fivela|f", "Corda|f", "Rede|f", "Peregrino|m", "Andarilho|m", "Viúva|f", "Rainha|f", "Bruxa|f", "Monge|m", "Arqueiro|m", "Ceifeiro|m"],
        adj: ["Cambaleante", "Rachado|Rachada", "Sonolento|Sonolenta", "Enferrujado|Enferrujada", "Torto|Torta", "Bêbado|Bêbada", "Dourado|Dourada", "Último|Última", "Manco|Manca", "Negro|Negra", "Faminto|Faminta", "Furado|Furada", "Partido|Partida", "Dançante", "Quebrado|Quebrada", "Sem Fundo", "Risonho|Risonha", "Azul", "Distante", "Vazio|Vazia", "Alegre", "Calado|Calada", "Cego|Cega", "Coxo|Coxa", "Errante", "Faiscante", "Devoto|Devota", "Gordo|Gorda", "Honesto|Honesta", "Ingrato|Ingrata", "Lento|Lenta", "Magro|Magra", "Mudo|Muda", "Pálido|Pálida", "Paciente", "Perdido|Perdida", "Rouco|Rouca", "Sábio|Sábia", "Solitário|Solitária", "Teimoso|Teimosa", "Tortuoso|Tortuosa", "Trêmulo|Trêmula", "Velho|Velha", "Vermelho|Vermelha", "Sedento|Sedenta"],
        compl: ["das Cinzas", "do Norte", "de Ferro", "de Prata", "do Rei", "da Rainha", "do Vale", "da Foz", "de Pedra", "do Sal", "das Três Luas", "do Vento", "da Névoa", "do Ocaso", "da Aurora", "do Peregrino", "do Enforcado", "da Viúva", "do Carvoeiro", "do Barqueiro", "das Estradas", "do Juramento", "da Promessa", "do Silêncio", "das Sete Portas", "do Corvo", "da Bruma", "de Prata Velha", "do Fim do Mundo", "da Última Noite", "dos Andarilhos", "dos Afogados", "dos Esquecidos", "das Moedas Falsas", "do Passo Alto", "da Colina", "do Rio Baixo", "da Muralha", "do Portão", "da Feira", "do Poço", "da Ponte Torta", "das Velas", "do Trigo"],
      },
      "Ficção científica": {
        subst: ["Reator|m", "Órbita|f", "Escotilha|f", "Estrela|f", "Módulo|m", "Antena|f", "Cápsula|f", "Satélite|m", "Sonda|f", "Hélice|f", "Doca|f", "Rota|f", "Bússola|f", "Deriva|f", "Câmara|f", "Vácuo|m", "Terminal|m", "Núcleo|m", "Prisma|m", "Espectro|m", "Pulsar|m", "Quasar|m", "Casco|m", "Turbina|f", "Válvula|f", "Bateria|f", "Chave|f", "Trilho|m", "Elevador|m", "Piloto|m", "Náufrago|m", "Colono|m", "Andarilha|f", "Sentinela|f", "Errante|m", "Carga|f", "Cinza|f", "Poeira|f", "Silêncio|m", "Sinal|m", "Eco|m", "Ruído|m", "Sombra|f", "Aurora|f"],
        adj: ["Frio|Fria", "Baixo|Baixa", "Morto|Morta", "Perdido|Perdida", "Rápido|Rápida", "Quebrado|Quebrada", "Fraco|Fraca", "Caído|Caída", "Estelar", "Último|Última", "Aberto|Aberta", "Selado|Selada", "Longo|Longa", "Distante", "Mudo|Muda", "Fantasma", "Órfão|Órfã", "Trincado|Trincada", "Denso|Densa", "Oco|Oca", "Girante", "Vazio|Vazia", "Pálido|Pálida", "Preso|Presa", "Solto|Solta", "Enferrujado|Enferrujada", "Sujo|Suja", "Novo|Nova", "Cego|Cega", "Torto|Torta"],
        compl: ["de Vega", "de Órion", "de Kepler", "do Éter", "do Vácuo", "de Titã", "da Cratera", "do Perímetro", "do Setor 9", "da Borda", "de Trânsito", "sem Retorno", "do Turno da Noite", "dos Fuzileiros", "dos Mineradores", "da Quarentena", "do Cais Longo", "do Anel", "da Última Órbita", "de Emergência", "do Cinturão", "da Estação Alta", "dos Náufragos", "do Silêncio", "de Carga", "da Escuta", "do Salto", "da Deriva", "do Zênite", "do Nadir"],
      },
      "Cyberpunk": {
        subst: ["Chip|m", "Cabo|m", "Fusível|m", "Tomada|f", "Dose|f", "Injeção|f", "Firewall|m", "Glitch|m", "Sinapse|f", "Estática|f", "Latência|f", "Agulha|f", "Máscara|f", "Lente|f", "Placa|f", "Corrente|f", "Faísca|f", "Vitrine|f", "Neon|m", "Cromo|m", "Vidro|m", "Aço|m", "Ácido|m", "Pixel|m", "Ruído|m", "Fluxo|m", "Nó|m", "Beco|m", "Grade|f", "Torre|f", "Antena|f", "Bailarina|f", "Mensageiro|m", "Fantasma|m", "Corvo|m", "Rato|m", "Gata|f", "Vigia|m"],
        adj: ["Queimado|Queimada", "Vivo|Viva", "Podre", "Sujo|Suja", "Branco|Branca", "Solto|Solta", "Perdido|Perdida", "Frito|Frita", "Curto|Curta", "Aberto|Aberta", "Falso|Falsa", "Barato|Barata", "Fatal", "Elétrico|Elétrica", "Pálido|Pálida", "Rachado|Rachada", "Sangrento|Sangrenta", "Frio|Fria", "Rápido|Rápida", "Mudo|Muda", "Cego|Cega", "Novo|Nova", "Velho|Velha", "Pirata", "Clonado|Clonada", "Alugado|Alugada", "Sem Registro", "Fora do Grid"],
        compl: ["do Bloco 7", "da Zona Morta", "do Subsolo", "da Baixa", "do Terceiro Turno", "sem Licença", "de Neon", "de Cromo", "do Fio Terra", "da Sarjeta", "dos Sem-Nome", "do Mercado Cinza", "da Torre Sul", "do Beco Longo", "das Antenas", "de Segunda Mão", "do Contrabando", "do Sinal Fraco", "da Chuva Ácida", "dos Insones", "do Fim da Linha", "do Andar 40", "da Grade", "do Firewall", "dos Cabos", "do Corte", "da Overdose", "do Silêncio"],
      },
      "Horror cósmico": {
        subst: ["Vela|f", "Peixe|m", "Âncora|f", "Sino|m", "Ceia|f", "Corvo|m", "Rede|f", "Farol|m", "Maré|f", "Ostra|f", "Sussurro|m", "Gaivota|f", "Anzol|m", "Cripta|f", "Bote|m", "Concha|f", "Doca|f", "Névoa|f", "Sal|m", "Junco|m", "Musgo|m", "Osso|m", "Pó|m", "Lâmpada|f", "Escada|f", "Porta|f", "Janela|f", "Fenda|f", "Poço|m", "Alçapão|m", "Retrato|m", "Espelho|m", "Pastor|m", "Viúva|f", "Órfã|f", "Afogado|m", "Sonâmbulo|m", "Fiel|m", "Peregrina|f"],
        adj: ["Trêmulo|Trêmula", "Cego|Cega", "Afundado|Afundada", "Rachado|Rachada", "Último|Última", "Mudo|Muda", "Vazio|Vazia", "Apagado|Apagada", "Baixo|Baixa", "Podre", "Morto|Morta", "Parado|Parada", "Salgado|Salgada", "Antigo|Antiga", "Pálido|Pálida", "Torto|Torta", "Úmido|Úmida", "Fechado|Fechada", "Aberto|Aberta", "Esquecido|Esquecida", "Sem Nome", "Que Espera", "Que Range", "Que Não Fecha", "Manso|Mansa", "Fundo|Funda", "Frio|Fria"],
        compl: ["de Sal", "da Névoa", "do Afogado", "dos Ausentes", "da Maré Morta", "do Sino Rachado", "de Baixo", "do Fundo", "sem Nome", "da Vigília", "dos Que Voltaram", "da Nona Hora", "do Pântano", "dos Ossos", "da Enseada", "do Farol", "da Casa Vazia", "dos Sonhos", "do Sussurro", "da Última Rede", "dos Peixes Cegos", "do Juramento", "da Cripta", "do Silêncio", "da Bruma", "das Águas Paradas", "do Que Dorme", "dos Sinos"],
      },
      "Pós-apocalíptico": {
        subst: ["Barril|m", "Água|f", "Posto|m", "Dose|f", "Gerador|m", "Sucata|f", "Bunker|m", "Ração|f", "Poço|m", "Pó|m", "Contador|m", "Tanque|m", "Antena|f", "Abrigo|m", "Muro|m", "Seca|f", "Lata|f", "Corda|f", "Bomba|f", "Filtro|m", "Máscara|f", "Bota|f", "Roda|f", "Cerca|f", "Cinza|f", "Ferrugem|f", "Faísca|f", "Chuva|f", "Cruz|f", "Fome|f", "Estrada|f", "Trilho|m", "Sobrevivente|m", "Nômade|m", "Carniceiro|m", "Ceifeira|f", "Vigia|m", "Corvo|m", "Rato|m"],
        adj: ["de Chumbo", "Quente", "Último|Última", "Enferrujado|Enferrujada", "Seco|Seca", "Ácido|Ácida", "Rachado|Rachada", "Vazio|Vazia", "Fundo|Funda", "Torto|Torta", "Quebrado|Quebrada", "Marcado|Marcada", "Cego|Cega", "Faminto|Faminta", "Verde", "Cinzento|Cinzenta", "Longo|Longa", "Solto|Solta", "Barato|Barata", "Roubado|Roubada", "Sem Dono", "Que Sobrou", "Novo|Nova", "Velho|Velha", "Amargo|Amarga", "Salgado|Salgada"],
        compl: ["do Poço", "da Cratera", "do Muro", "da Estrada", "do Fim", "dos Sem-Terra", "de Chumbo", "do Contador", "da Cerca Viva", "dos Últimos", "do Combustível", "da Ração", "sem Dono", "da Zona Verde", "do Filtro", "dos Nômades", "da Chuva Ácida", "do Rádio", "da Antena", "dos Que Ficaram", "do Sul Seco", "do Norte Frio", "da Ferrugem", "do Silêncio", "das Latas", "do Gerador", "da Última Água", "dos Cães", "do Passo"],
      },
      "Steampunk": {
        subst: ["Engrenagem|f", "Caldeira|f", "Válvula|f", "Manômetro|m", "Pistão|m", "Fuligem|f", "Bússola|f", "Hélice|f", "Zepelim|m", "Trilho|m", "Chaminé|f", "Corrente|f", "Roldana|f", "Bigorna|f", "Latão|m", "Cobre|m", "Vapor|m", "Carvão|m", "Óleo|m", "Fumaça|f", "Faísca|f", "Lente|f", "Relógio|m", "Pêndulo|m", "Autômato|m", "Chave|f", "Mola|f", "Âncora|f", "Sino|m", "Farol|m", "Aeronauta|m", "Maquinista|m", "Duquesa|f", "Inventor|m", "Corvo|m", "Andarilha|f"],
        adj: ["Torto|Torta", "Emperrado|Emperrada", "Dourado|Dourada", "Rangente", "Fumegante", "Rachado|Rachada", "Preciso|Precisa", "Atrasado|Atrasada", "Adiantado|Adiantada", "Enferrujado|Enferrujada", "Polido|Polida", "Silencioso|Silenciosa", "Girante", "Quebrado|Quebrada", "Último|Última", "Novo|Nova", "Velho|Velha", "Faiscante", "Barulhento|Barulhenta", "Manso|Mansa", "Solto|Solta", "Fechado|Fechada", "Sem Ponteiros"],
        compl: ["de Latão", "de Cobre", "a Vapor", "do Aeronauta", "da Companhia", "do Relojoeiro", "das Doze Horas", "do Trilho Alto", "da Chaminé Norte", "dos Maquinistas", "da Exposição", "do Zepelim", "sem Ponteiros", "do Carvoeiro", "da Ponte de Ferro", "do Clube", "dos Inventores", "da Válvula Presa", "do Meridiano", "da Estação", "do Porão", "da Fuligem", "do Terceiro Turno", "das Engrenagens", "do Vapor", "do Contrato"],
      },
    },
    tipos: {
      /* o mercado leva mais sinônimos do que os outros de propósito: TODA
         cidade tem um, e num mundo de catorze assentamentos ele é o tipo que
         mais se repete. A sonda mostrou 31 das 43 colisões concentradas aqui. */
      mercado: ["Praça|f", "Mercado|m", "Feira|f", "Pátio|m", "Largo|m", "Terreiro|m", "Alpendre|m", "Bazar|m", "Rossio|m", "Arcada|f", "Ribeira|f", "Alfândega|f", "Balança|f", "Pregão|m", "Armazém|m", "Entreposto|m"],
      templo: ["Templo|m", "Santuário|m", "Capela|f", "Altar|m", "Casa|f", "Oratório|m", "Nave|f", "Adro|m", "Ermida|f", "Basílica|f"],
      forja: ["Forja|f", "Bigorna|f", "Fole|m", "Fornalha|f", "Ferraria|f", "Casa do Martelo|f", "Tenda|f", "Oficina|f", "Malho|m", "Têmpera|f"],
      quartel: ["Quartel|m", "Guarnição|f", "Posto|m", "Torre|f", "Casa da Guarda|f", "Baluarte|m", "Bastião|m", "Vigia|f", "Praça de Armas|f", "Reduto|m"],
      cadeia: ["Cárcere|m", "Cadeia|f", "Fossa|f", "Torre|f", "Celas|fp", "Masmorra|f", "Enxovia|f", "Casa de Ferros|f", "Poço|m", "Silo|m"],
      biblioteca: ["Biblioteca|f", "Arquivo|m", "Casa dos Papéis|f", "Escritório|m", "Sala das Cópias|f", "Gabinete|m", "Cartório|m", "Livraria|f", "Estante|f", "Depósito|m"],
      docas: ["Cais|m", "Ancoradouro|m", "Docas|fp", "Píer|m", "Embarcadouro|m", "Molhe|m", "Estaleiro|m", "Trapiche|m", "Enseada|f", "Marina|f"],
      arena: ["Arena|f", "Círculo|m", "Fosso|m", "Coliseu|m", "Ringue|m", "Areia|f", "Rinha|f", "Palanque|m", "Cova|f", "Terreiro|m"],
      "cemitério": ["Campo|m", "Jazigo|m", "Colina|f", "Terra|f", "Ossário|m", "Necrópole|f", "Adro|m", "Cemitério|m", "Sepultura|f", "Vala|f"],
      guilda: ["Salão|m", "Casa|f", "Guilda|f", "Mesa|f", "Loja|f", "Sede|f", "Confraria|f", "Câmara|f", "Companhia|f", "Ordem|f"],
      "casa de banhos": ["Águas|fp", "Casa de Vapor|f", "Fonte|f", "Termas|fp", "Banho|m", "Cisterna|f", "Piscina|f", "Bica|f", "Poça|f", "Vapor|m"],
    },
  },
  /* 5.ª fatia: as raças da criação (classes.js). `traco` é a frase que o
     jogador lê; `efeito` é o que o código faz com ela — até a v9.43 só
     existia a primeira, e dez raças prometiam o que nenhum dado cumpria. As
     duas colunas nascem juntas de propósito: quem editar a frase sem editar o
     efeito volta a mentir para o jogador. Quem lê `efeito` é tracos.js. */
  racas: {
    fantasia: [
      { nome: "Humano", desc: "Versáteis e ambiciosos. Aprendem rápido e se adaptam a tudo.", bonus: { forca: 1, destreza: 1, vigor: 1, intelecto: 1, presenca: 1, percepcao: 1 }, traco: "Determinação: uma vez por descanso, refaz uma rolagem falha.", efeito: { refazer: 1 } },
      { nome: "Elfo", desc: "Longevos, graciosos, ligados à magia antiga e às florestas.", bonus: { destreza: 2, intelecto: 1, percepcao: 1 }, traco: "Sentidos élficos: vantagem em testes de Percepção, e vê no escuro a 18 m.", efeito: { vantagem: ["percepcao"], veNoEscuro: 18 } },
      { nome: "Anão", desc: "Robustos, teimosos, mestres da pedra e do metal.", bonus: { vigor: 2, forca: 1 }, traco: "Resistência anã: reduz em 1 todo dano de veneno e fogo, e vê no escuro a 18 m.", efeito: { reduzDano: { veneno: 1, fogo: 1 }, veNoEscuro: 18 } },
      { nome: "Halfling", desc: "Pequenos, sortudos, impossíveis de intimidar.", bonus: { destreza: 2, presenca: 1 }, traco: "Sorte pequena: transforma um 1 natural em 2 — uma vez por combate (ou por descanso, fora da luta).", efeito: { sorteDoUm: true } },
      { nome: "Meio-orc", desc: "Força bruta temperada por uma vontade indomável.", bonus: { forca: 2, vigor: 2 }, traco: "Fúria persistente: ao chegar a 0 PV, fica com 1 PV uma vez por descanso longo. Vê no escuro a 18 m.", efeito: { firme: true, veNoEscuro: 18 } },
      { nome: "Draconato", desc: "Herdeiros de sangue dracônico, orgulhosos e imponentes.", bonus: { forca: 2, presenca: 1 }, traco: "Sopro ancestral: baforada em linha que pega todos no caminho (3 PM).", efeito: { dom: { nome: "Sopro Ancestral", nivel: 1, custo: 3, tipo: "ataque", descricao: "Baforada de fogo em linha de 9 m: dano em área a todos no caminho." } } },
      { nome: "Tiefling", desc: "Marcados por um pacto antigo. Temidos, resilientes, astutos.", bonus: { presenca: 2, intelecto: 1 }, traco: "Herança infernal: resistência a fogo, a magia inata Chama Menor (1 PM), e vê no escuro a 18 m.", efeito: { resistencia: ["fogo"], veNoEscuro: 18, dom: { nome: "Chama Menor", nivel: 1, custo: 1, tipo: "ataque", descricao: "Uma língua de fogo salta da mão e queima um alvo à vista." } } },
      { nome: "Gnomo", desc: "Inventivos e curiosos, mentes que não param nunca.", bonus: { intelecto: 2, destreza: 1 }, traco: "Astúcia gnômica: vantagem para resistir a efeitos mentais, e vê no escuro a 18 m.", efeito: { vantagemMental: true, veNoEscuro: 18 } },
      { nome: "Meio-elfo", desc: "Entre dois mundos, encantadores e adaptáveis.", bonus: { presenca: 2, destreza: 1, percepcao: 1 }, traco: "Diplomata nato: vantagem em testes de Presença — a sala se inclina para você. Vê no escuro a 18 m.", efeito: { vantagem: ["presenca"], veNoEscuro: 18 } },
      { nome: "Goliath", desc: "Gigantes das montanhas, forjados pelo frio e pela altitude.", bonus: { forca: 3, vigor: 1 }, traco: "Pele de pedra: 1× por combate, reduz um golpe pela metade.", efeito: { pedra: true } },
    ],
    futuro: [
      { nome: "Terrano", desc: "Nascido no berço da humanidade. Adaptável e teimoso.", bonus: { forca: 1, vigor: 1, presenca: 1, intelecto: 1 }, traco: "Improviso: conserta o que não deveria ter conserto — a bancada de ofício fica 2 mais fácil.", efeito: { oficio: 2 } },
      { nome: "Colono Orbital", desc: "Criado em gravidade baixa, ágil e preciso.", bonus: { destreza: 2, intelecto: 1 }, traco: "Pé de gato: escala tão rápido quanto anda e atravessa terreno difícil sem perder passo.", efeito: { ignoraDificil: true } },
      { nome: "Sintético", desc: "Consciência artificial em corpo construído.", bonus: { intelecto: 3 }, traco: "Processamento frio: imune a medo e a encantamento; vantagem para resistir ao que é mental.", efeito: { vantagemMental: true, imune: ["amedrontado", "enfeiticado"] } },
      { nome: "Mutante", desc: "O ermo reescreveu seu corpo. Não sem preço.", bonus: { vigor: 2, forca: 1 }, traco: "Metabolismo estranho: resistência a veneno — metade do dano.", efeito: { resistencia: ["veneno"] } },
      { nome: "Cromado", desc: "Mais implante do que carne. Rápido, letal, endividado.", bonus: { destreza: 2, forca: 1 }, traco: "Reflexos de fábrica: +5 na iniciativa — você quase sempre age primeiro.", efeito: { iniciativa: 5 } },
      { nome: "Vagante", desc: "Sem mundo, sem bandeira. Só a estrada.", bonus: { percepcao: 2, destreza: 1 }, traco: "Faro de perigo: vantagem em testes de Percepção — a emboscada tem de ser muito boa.", efeito: { vantagem: ["percepcao"] } },
    ],
    /* 6.ª fatia (companheiros.js): a MESMA demografia com que o mundo povoa
       as cidades (nomes.js: humano, elfo e anão nas duas formas, os outros
       numa só) — um companheiro sorteado é tão provável de ser anão quanto o
       ferreiro da praça. O registo são as formas do povo no feminino que não
       são o nome do catálogo (o nome em si casa sem estar aqui). */
    doCompanheiro: [{ raca: "Humano", peso: 2 }, { raca: "Elfo", peso: 2 }, { raca: "Anão", peso: 2 }, { raca: "Halfling", peso: 1 }, { raca: "Meio-orc", peso: 1 }, { raca: "Tiefling", peso: 1 }, { raca: "Gnomo", peso: 1 }, { raca: "Draconato", peso: 1 }],
    registo: { humana: "Humano", elfa: "Elfo", ana: "Anão", gnoma: "Gnomo", draconata: "Draconato", "meio-elfa": "Meio-elfo" },
  },
  /* 6.ª fatia (prontos.js): o roster dos oito, um por papel — o mesmo nível,
     os mesmos pontos, o mesmo bolso; o que varia é o feitio. */
  prontos: [
    { id: "muralha", nome: "A Muralha", papel: "tanque", linha: "Fica na porta. Sempre ficou em alguma porta.", sexo: "mulher", raca: "Goliath", classe: "Guerreiro", subclasse: "Cavaleiro", profissao: "Ferreiro", antecedente: "soldado", atributos: { forca: 2, destreza: 1, vigor: 3, intelecto: 0, presenca: 0, percepcao: 0 }, arma: "Espada Longa", armadura: "Cota de Malha", escudo: "Escudo Torre", indole: { tracos: ["fiel", "teimoso"], proposito: "proteger" }, sementes: ["nome_na_lamina", "cova_sem_nome"], conceito: "a que segura a linha quando todo mundo recua" },
    { id: "sombra", nome: "A Sombra", papel: "furtivo", linha: "Você não a contratou. Ela decidiu vir.", sexo: "mulher", raca: "Elfo", classe: "Ladino", subclasse: "Assassino", profissao: "Cartógrafo", antecedente: "ladrao", atributos: { forca: 1, destreza: 2, vigor: 1, intelecto: 0, presenca: 0, percepcao: 2 }, arma: "Adaga", armadura: "Gibão de Couro", indole: { tracos: ["calado", "desconfiado"], proposito: "vender_o_que_sabe" }, sementes: ["chave_sem_porta", "janela_as_pressas"], conceito: "a que entra sem convite e sai sem despedida" },
    { id: "chama", nome: "A Chama", papel: "conjurador", linha: "Leu o livro errado até o fim.", sexo: "mulher", raca: "Tiefling", classe: "Mago", subclasse: "Elementalista", profissao: "Escriba", antecedente: "erudito", atributos: { forca: 0, destreza: 2, vigor: 2, intelecto: 2, presenca: 0, percepcao: 0 }, arma: "Cajado de Carvalho", armadura: "Manto Encantado", indole: { tracos: ["curioso", "orgulhoso"], proposito: "provar_ao_pai" }, sementes: ["margem_anotada", "duas_cronicas"], conceito: "a que faz o fogo obedecer, quase sempre" },
    { id: "remendo", nome: "O Remendo", papel: "curandeiro", linha: "Já costurou gente demais para ter medo de sangue.", sexo: "homem", raca: "Humano", classe: "Clérigo", subclasse: "Sacerdote", profissao: "Médico de Campo", antecedente: "acolito", atributos: { forca: 0, destreza: 0, vigor: 1, intelecto: 2, presenca: 1, percepcao: 2 }, arma: "Lança", armadura: "Brigantina", indole: { tracos: ["compassivo", "pratico"], proposito: "redimir" }, sementes: ["santo_sem_festa", "negacao_nao_pedida"], conceito: "o que remenda o corpo e cala o resto" },
    { id: "voz", nome: "A Voz", papel: "social", linha: "Conhece três saídas de toda conversa.", sexo: "mulher", raca: "Halfling", classe: "Bardo", subclasse: "Encantador", profissao: "Mercador", antecedente: "artista", atributos: { forca: 0, destreza: 1, vigor: 1, intelecto: 0, presenca: 3, percepcao: 1 }, arma: "Rapieira", armadura: "Gibão de Couro", indole: { tracos: ["tagarela", "vaidoso"], proposito: "nao_ser_esquecido" }, sementes: ["elogio_que_vigia", "moeda_estrangeira"], conceito: "a que ganha a plateia antes de sacar a lâmina" },
    { id: "flecha", nome: "A Flecha", papel: "distância", linha: "Conta os passos entre ela e tudo.", sexo: "mulher", raca: "Humano", classe: "Caçador", subclasse: "Arqueiro", profissao: "Caçador de Recompensas", antecedente: "cacador", atributos: { forca: 0, destreza: 2, vigor: 1, intelecto: 0, presenca: 0, percepcao: 3 }, arma: "Arco Curto", armadura: "Couro Batido", indole: { tracos: ["frio", "rancoroso"], proposito: "divida_de_sangue" }, sementes: ["mao_que_treme", "posto_sem_guarda"], conceito: "a que erra uma vez por década, e lembra de cada uma" },
    { id: "punho", nome: "O Punho", papel: "fúria", linha: "Briga desde antes de ter nome de briga.", sexo: "homem", raca: "Anão", classe: "Guerreiro", subclasse: "Gladiador", profissao: "Minerador", antecedente: "orfao", atributos: { forca: 2, destreza: 2, vigor: 2, intelecto: 0, presenca: 0, percepcao: 0 }, arma: "Machado de Guerra", armadura: "Couro Batido", escudo: "Escudo de Placas", indole: { tracos: ["corajoso", "brincalhao"], proposito: "desafiar" }, sementes: ["promessa_pequena", "sino_fora_de_hora"], conceito: "o que sorri no primeiro soco e gargalha no segundo" },
    { id: "voto", nome: "O Voto", papel: "juramento", linha: "Jurou uma coisa só. Cumpre há vinte anos.", sexo: "homem", raca: "Draconato", classe: "Clérigo", subclasse: "Paladino", profissao: "Curtidor", antecedente: "ex_cultista", atributos: { forca: 1, destreza: 0, vigor: 2, intelecto: 1, presenca: 2, percepcao: 0 }, arma: "Machadinha", armadura: "Cota de Malha", indole: { tracos: ["humilde", "supersticioso"], proposito: "morrer_com_honra" }, sementes: ["brasao_limado", "presente_cedo"], conceito: "o que carrega a culpa velha como quem carrega escudo" },
  ],
};
