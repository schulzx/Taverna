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

   As secções até aqui (as outras chegam nas seguintes — nomes, deuses,
   bestiário —, e o validador recusa hoje o campo que o motor ainda
   não lê, para ninguém escrever um mundo que não acontece):
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
     generos.marcasProprias  as marcas, na descrição, de um mundo que não é a
                        fantasia clássica (a obra citada, o tempo moderno ou
                        futuro): texto de regex, comparado SEM acento e sem
                        caixa — escreva-as assim
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
  },
};
