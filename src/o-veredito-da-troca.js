/* ============================================================
   O VEREDITO DA TROCA (21/11/2026) — src/o-veredito-da-troca.js

   A ordem da pessoa, 21/11: «Tudo pelo sistema, o narrador apenas recebe
   fatos e narra, nada entra por ele.»

   A oitava sessão do Mestre vivo (mente/lancamento/mestre-vivo-sessao-8.md)
   contou dez trocas que a prosa fechou sozinha: a companheira «paga a
   caneca» (T9), o figurante «põe um saquinho na sua mão» (T15), o furto que
   passou no dado «rende duas moedas» (T33), «a corda curta some no fundo da
   mochila» (T57) — e a ficha não mudou. Três rodadas podando a prosa depois
   de escrita não zeraram isso (19 → 17 → 16 turnos por sessão). O conserto é
   anterior: a frase que pede uma troca sai daqui com o veredito JÁ DECIDIDO —
   `aplicada` (o que mudou de mão, nomes e quantidades exatos, de quem para
   quem, e a ficha nova) ou `negada` (o motivo, de tabela) — antes de o
   Narrador ser chamado, e ele o recebe como fato na pauta do turno.

   O QUE DECIDE AQUI (o resto já tinha porta, e a auditoria está no
   mente/lancamento/o-mestre-vivo.md):
     · pegar e guardar o que a frase diz («pego a lâmina… e guardo na
       mochila»): o que está no chão é da mão da frase (a-mao-da-frase.js);
       o que é de alguém, levar sem pedir é furto; o que só a prosa pôs na
       cena não entra;
     · pedir ao companheiro que pague, compre, empreste ou entregue: ele dá
       o que TEM (a bolsa dele é `inventario`, campo que já existe); moeda à
       parte ele não tem — a bolsa do grupo é a do herói;
     · pedir fiado: não se fia (fala de mesa);
     · o furto que passou no dado: o butim é daqui, por semente e pela
       vítima, e pode ser nada («a bolsa estava quase vazia»);
     · pedir de graça a um figurante (amostra, presente, emprestado): é
       conversa com dado; passou, ele dá uma coisa pequena e real; falhou,
       nada;
     · vender o que é de uso (rações, água, tochas, flechas): pelo preço do
       balcão, com fator de revenda.
   E três leituras que as portas de hoje usam, para não se enganarem:
     · `aCompraPorMoeda` — «dou duas moedas ao vendedor pelos sais» é COMPRA
       dos sais (era lida como entregar os sais, e quatro frases da sessão
       nem viraram turno; em T61 a água do herói foi para a vendedora);
     · `oSubornoDaFrase` — moeda oferecida para alguém fingir, deixar passar
       ou fechar os olhos é conversa com dado, não cartão de pagar (T48);
     · `oFiadoDaFrase` — «pago amanhã» não é pagar hoje.

   Puro, determinístico (a mesma semente dá o mesmo butim em qualquer
   máquina), imutável (a ficha de antes nunca é mexida; `null` tratado).
   Provado em testes/teste-o-veredito-da-troca.mjs.
   ============================================================ */
import { NUMERO_POR_EXTENSO } from "./cobranca.js";
import { aQuem } from "./a-venda-da-bolsa.js";

const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const obj = (x) => (x != null && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const nomeDe = (raw) => (typeof raw === "string" ? raw : (raw && raw.nome) || "");
const primeiro = (nome) => sem(nome).split(/[\s,]+/).filter((w) => !/^(o|a|os|as|de|do|da|dos|das)$/.test(w))[0] || "";
const tpl = (s, m) => str(s).replace(/\{(\w+)\}/g, (_, k) => str(m[k]));
const maiuscula = (s) => { const t = str(s).trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; };

/* FNV-1a de 32 bits → [0, 1): o hash das outras sortes por semente da casa */
const fnv = (s) => { let h = 0x811c9dc5; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h; };
const sorteDe = (s) => fnv(s) / 0x100000000;

const EXT = Object.keys(NUMERO_POR_EXTENSO).sort((a, b) => b.length - a.length).join("|");

/* ============================================================
   AS TABELAS
   ============================================================ */
export const O_VEREDITO_DA_TROCA = Object.freeze({
  /* as palavras da moeda que a frase diz depois do número (a do mundo entra pelo `moeda`) */
  moedas: Object.freeze(["moedas?", "cobres?", "pratas?", "ouros?", "pecas?", "cunhas?", "escamas?", "fichas?", "tostoes?", "dobroes?", "coroas?"]),
  /* COMPRAR COM A MÃO QUE PAGA: o verbo que põe a moeda na mesa, a quantia, e o «por» da coisa */
  daMoeda: Object.freeze(["dou", "damos", "ofereco", "oferecemos", "entrego", "entregamos", "ponho", "pomos", "deixo", "deixamos", "pago", "pagamos", "paguei", "passo", "estendo"]),
  /* onde a coisa comprada acaba: antes destas palavras */
  fimDaCoisa: Object.freeze(["ao", "aos", "a", "as", "para", "pra", "e", "que", "com", "se", "porque", "enquanto", "mas"]),
  palavrasDaCoisa: 4,
  /* CASAR O NOME (oItemDaFrase): a ligação, o adjetivo que abre o nome, e o que fecha a coisa dita */
  ligaDoNome: Object.freeze(["o", "a", "os", "as", "de", "do", "da", "dos", "das", "e", "meu", "minha", "seu", "sua", "um", "uma"]),
  abreONome: Object.freeze(["rustico", "rustica", "velho", "velha", "pequeno", "pequena", "grande", "simples", "fino", "fina", "bom", "boa", "antigo", "antiga", "novo", "nova", "gasto", "gasta", "surrado", "surrada"]),
  fimDoNome: Object.freeze(["a", "ao", "aos", "as", "para", "pra", "pro", "e", "que", "com", "por", "pelo", "pela", "no", "na", "em", "sem", "se", "mas", "enquanto", "dele", "dela", "ali", "aqui", "agora", "de", "do", "da"]),
  /* O FATO NA PAUTA (a nona sessão, T21, T34, T55): a primeira linha que o
     Narrador lê, de ferro, e o veto que fecha a porta barata */
  fatoFecho: "Narre só isto; nada mais muda de mão.",
  /* na ficha do ator (o Narrador ator, ficha-de-ator.js) não há ordem nem rótulo: o fecho é fato */
  fatoFechoDoAtor: "Nada mais muda de mão.",
  vetoDoFato: "pôr, tirar ou trocar de mão qualquer coisa ou moeda além do FATO DESTE TURNO — nem a prosa dá o que o sistema negou, nem tira o que ele deu",
  /* «compro duas rações e pago dez moedas»: a moeda é da compra */
  compraDeclarada: /\b(compro|compramos|comprei)\b/,
  /* o que se paga e não se leva na mão: saber (o gesto da carta) */
  naoEMercadoria: Object.freeze(["informacao", "informacoes", "noticia", "noticias", "segredo", "resposta", "nome", "caminho", "conversa", "dica", "pista", "pistas", "verdade", "paradeiro"]),
  /* O SUBORNO: moeda oferecida para que alguém faça vista grossa — é conversa
     com dado (desafios.js, «convencer»), e a quantia sai só se ele aceitar */
  /* 21/11 (a nona sessão, T35): «ofereço 4 moedas à vendedora para ela não
     gritar ladrão» abria o cartão «Pagar» — o silêncio comprado tem mais
     formas do que «ficar calado»: não gritar, não contar, não chamar a guarda,
     guardar segredo, ficar quieto. Esta é a ÚNICA lista do suborno: o catálogo
     (desafios.js, lerAcao) pergunta a oSubornoDaFrase em vez de ter a sua. */
  suborno: /\b(?:para|pra)\s+(?:(?:ele|ela|eles|elas|o guarda|a guarda)\s+)?(?:me\s+|nos\s+)?(?:fingir|fechar os olhos|fazer vista grossa|olhar (?:para|pro) (?:o )?outro lado|esquecer|nao (?:me |nos )?ver|nao (?:me |nos )?ter visto|deixar (?:eu |a gente )?(?:passar|entrar|subir|sair)|(?:me|nos) deixar (?:passar|entrar|subir|sair)|ficar calad[oa]|ficar quiet[oa]|calar|guardar (?:o |esse |este )?segredo|manter a boca fechada|nao (?:me |nos )?(?:gritar|contar|dizer|falar|chamar|denunciar|entregar|dedurar|acusar|delatar))\b/,
  quantiaVaga: /\b(algum dinheiro|umas moedas|umas pratas|alguma moeda|algumas moedas|uns cobres)\b/,
  /* O FIADO: o que se leva hoje e se paga depois */
  fiado: /\b(fiado|fiada|pendur[ao]|na conta|a credito|pago (?:amanha|depois|mais tarde|na volta|outro dia|quando (?:voltar|puder))|pagar (?:amanha|depois|mais tarde))\b/,
  /* PEGAR E GUARDAR: só a frase que diz guardar (o portão morde só o
     necessário — «pego a caneca e bebo» não é levar nada) */
  guardar: /\b(guardo|guardamos|embolso|embolsamos|levo comigo|levamos conosco)\b|\b(?:pego|pegamos|apanho|apanhamos|levo|tiro|recolho|cato|tomo|enfio|meto|ponho|coloco|jogo)\b[^.!?;]{0,70}\b(?:na|no|para a|para o|pra|dentro da|dentro do) (?:minha |meu )?(?:mochila|bolso|bolsa|alforje|sacola|cinto|algibeira)\b/,
  verboDePegar: /\b(?:pego|pegamos|apanho|apanhamos|guardo|guardamos|embolso|embolsamos|levo|tiro|recolho|cato|tomo|enfio|meto|ponho|coloco|jogo)\s+(?:(?:uma das|um dos|umas das|uns dos|o|a|os|as|um|uma|uns|umas|aquele|aquela|esse|essa|este|esta)\s+)?([a-z][a-z-]*(?:\s+[a-z][a-z-]*){0,5})/,
  fimDoQuePega: Object.freeze(["do", "dos", "das", "no", "na", "nos", "nas", "e", "para", "pra", "com", "que", "dentro", "atras", "debaixo", "sob", "sobre", "ao", "em", "num", "numa"]),
  naoECoisa: Object.freeze(["moeda", "moedas", "isso", "isto", "aquilo", "tudo", "nada", "caminho", "folego", "coragem", "distancia", "rumo", "ar"]),
  /* DAR UMA COISA DA BOLSA a quem está (a moeda é do pagamento; o mantimento, da dádiva) */
  dar: /\b(dou|damos|entrego|entregamos|ofereco|oferecemos|presenteio|passo|deixo com)\s+(?!um passo|uma olhada|uma volta)/,
  /* O COMPANHEIRO: o pedido que o põe a pagar, comprar, emprestar ou entregar */
  pedeAoCompanheiro: /\b(?:peco|pedimos|pergunto se|digo)\b|^\s*[a-z]+\s*,|\b(?:me empresta|me da|me de|me passa|me passe|me entrega|me entregue|me arruma|me devolve|me devolva)\b/,
  companheiroPaga: /\b(pague|pagar|paga|compre|comprar|compra|empreste|emprestar|empresta|bancar|banque)\b/,
  companheiroDa: /\b(?:me\s+(?:de|da|dar|passe|passa|passar|entregue|entrega|entregar|empreste|empresta|emprestar|arrume|arruma|devolve|devolva|devolver)|(?:dar|passar|entregar|emprestar|arrumar)-me|empreste|empresta|emprestar)\s+(?:(?:uma das|um dos|umas das|uns dos|o|a|os|as|um|uma|uns|umas|seu|sua|seus|suas)\s+)?([a-z][a-z-]*(?:\s+(?:de\s+)?[a-z][a-z-]*){0,3})/,
  /* o que não é coisa que se passe de mão («me dê uma mão», «me dê um minuto») */
  naoECoisaDoCompanheiro: Object.freeze(["mao", "maos", "jeito", "passo", "olhada", "forca", "ideia", "conselho", "opiniao", "cobertura", "volta", "sinal", "ouvido", "atencao", "licenca", "tempo", "chance", "minuto", "segundo", "momento", "cutucao", "razao", "noticia", "resposta", "palavra", "apoio", "ajuda", "carona"]),
  moedaDoCompanheiro: /\b(moedas?|dinheiro|prata|ouro|cobres?|conta|caneca|bebida|hidromel|cerveja|vinho|pao|comida|refeicao|quarto)\b/,
  /* o que é de uso não mora na bolsa do companheiro: é o alforje do grupo, na mochila do herói */
  usos: Object.freeze({ tocha: "tochas", tochas: "tochas", racao: "racoes", racoes: "racoes", agua: "agua", odre: "agua", odres: "agua", flecha: "flechas", flechas: "flechas", virote: "flechas", virotes: "flechas" }),
  /* O FURTO: quem é a vítima pesa a bolsa (pelo papel ou pelo nome) */
  vitima: Object.freeze({
    pobre: Object.freeze(["mendig", "varred", "estivad", "pescad", "campones", "lavrad", "bebad", "crianc", "catador", "aprendiz", "moco", "moca", "pastor", "lenhad", "carregad", "escrav", "orfa", "orfao", "naufrag"]),
    abastado: Object.freeze(["mercad", "nobre", "senhor", "dama", "sacerd", "mago", "cambist", "trocador", "joalh", "capit", "prefeit", "banqueir", "conde", "baron", "duque", "cobrador", "coletor", "agiota", "comerciant", "lojist"]),
  }),
  butim: Object.freeze({
    pobre: Object.freeze({ nada: 0.45, min: 1, max: 3, item: 0.05 }),
    comum: Object.freeze({ nada: 0.25, min: 1, max: 6, item: 0.10 }),
    abastado: Object.freeze({ nada: 0.10, min: 3, max: 15, item: 0.20 }),
  }),
  /* a coisa que a frase diz furtar, e o nome que ela ganha na mochila; `tem`: a chance de ela estar lá */
  doBolso: Object.freeze({
    anel: "Anel de latão", colar: "Colar de contas", cantil: "Cantil de couro", lenco: "Lenço bordado",
    faca: "Faca pequena", pente: "Pente de chifre", dado: "Dado de osso", amuleto: "Amuleto de osso",
  }),
  temNoBolso: 0.6,
  /* o furto (a leitura; quem decide se houve dado é o desafio «bater_carteira») — «furtivo» e «furtividade» não são furto */
  furto: /\b(furto|furtar|furtei|furtamos|roubo|roubar|roubei|afano|afanar|surrupio|surrupiar|bato a carteira|bater a carteira|corto a bolsa|empalmo|punguei|alivio (?:a|o) (?:bolsa|carteira|algibeira))\b/,
  coisaDoFurto: /\b(?:furto|furtar|roubo|roubar|afano|afanar|surrupio|surrupiar|alivio|empalmo)\s+(?:(?:a|o|as|os|um|uma)\s+)?([a-z]+)/,
  dinheiroDoBolso: /\b(bolsa|bolsinha|carteira|algibeira|moedas?|dinheiro|bolso|cinto)\b/,
  bugigangas: Object.freeze(["Dado de osso", "Anel de latão", "Lenço bordado", "Pente de chifre", "Botão de osso"]),
  /* O DE GRAÇA: o pedido sem moeda a quem não é do grupo */
  deGraca: /\b(de graca|gratis|gratuit\w*|amostra|de presente|me presenteia|emprestad[oa]s?|me empresta\w*|me (?:da|de) (?:um|uma) [a-z]+ (?:so )?pra (?:provar|experimentar))\b/,
  pedeAlgo: /\b(peco|pedimos|pergunto se|regateio|regatear|quero|me da|me de|me empresta|me empreste|me arruma)\b/,
  /* o que se bebe ou prova ali mesmo não vai para a mochila */
  consumidoAli: /\b(copo|caneca|gole|trago|golada|dose|provar|prova|experimentar|beber|bocado|lasca)\b/,
  /* a coisa pequena que um figurante dá de graça, quando a frase não acha uma no estoque dele */
  amostras: Object.freeze(["Punhado de sal", "Pedaço de pão", "Fita de couro", "Vela de sebo", "Maçã seca", "Saquinho de ervas"]),
  /* acima disto, o estoque não se dá de graça */
  tetoDaAmostra: 3,
  /* REVENDA DO QUE É DE USO: o balcão paga esta fração do preço dele */
  revenda: 0.5,
  usoDaVenda: Object.freeze([
    Object.freeze({ id: "racoes", rx: /\b(racao|racoes|mantimentos?|viveres|provisoes)\b/, um: "ração", varios: "rações" }),
    Object.freeze({ id: "agua", rx: /\b(agua|odres?|cantis|cantil)\b/, um: "odre de água", varios: "odres de água" }),
    Object.freeze({ id: "tochas", rx: /\b(tochas?|archotes?)\b/, um: "tocha", varios: "tochas" }),
    Object.freeze({ id: "flechas", rx: /\b(flechas?|setas?|virotes?)\b/, um: "flecha", varios: "flechas" }),
  ]),
  vender: /\b(vendo|vendemos|vender|vendi)\b/,
  /* O QUE A TELA DIZ (a voz da mesa: «você», nunca o nome do mecanismo) */
  tela: Object.freeze({
    pegarDono: "✋ Isso é {doDono}: levar sem pedir é furto.",
    /* a nona sessão (T25, T26, T28, T58): a mesma frase para um mapa molhado, um remo e um frasco «soava a erro» — a negativa diz a coisa */
    pegarInventado: Object.freeze(["✋ Não há {coisa} aqui que se leve: fica onde está.", "✋ {Coisa} fica onde está: não é coisa de se levar."]),
    companheiroDa: "🤝 {Nome} passa a você: {Coisa}.",
    /* a nona sessão (T14, T15, T18): «não guarda moeda à parte» era regra de sistema na boca da mesa */
    companheiroSemMoeda: "🤝 {Nome} abre as mãos vazias: o dinheiro do grupo está na sua bolsa.",
    companheiroUso: "🤝 As {coisa} do grupo estão na sua mochila: {Nome} não carrega outras.",
    companheiroNaoTem: "🤝 {Nome} não tem isso consigo.",
    companheiroEmUso: "🤝 {Nome} usa {Coisa} e não a tira de si para dar.",
    qual: "❓ Qual deles: {Lista}? Diga o nome inteiro.",
    tomar: "✊ Você arranca {Coisa} da mão {doAlvo}.",
    tomarFalhou: "✊ {Alvo} segura firme: a mão volta vazia.",
    tomarNaoHa: "✊ Não há {coisa} na mão {doAlvo} que se tome.",
    deGracaNaoTem: "🎁 {Alvo} não tem {coisa} para dar.",
    dar: "🤝 {Coisa} agora é de {Quem}.",
    fiado: "⛔ Fiado não: aqui se paga na hora.",
    furto: "🤲 Da bolsa {doAlvo}: {Ganho} (bolsa: ◉ {B}).",
    furtoVazio: "🤲 A bolsa {doAlvo} estava quase vazia: nada que valha levar.",
    furtoSemACoisa: "🤲 {Alvo} não tinha {Coisa} com ele: a mão volta vazia.",
    deGraca: "🎁 {Alvo} lhe dá: {Coisa}.",
    deGracaAli: "🎁 {Alvo} deixa você provar ali mesmo.",
    deGracaNao: "🎁 {Alvo} não dá nada de graça.",
    deGracaCaro: "🎁 {Coisa} não se dá de graça: custa ◉ {P}.",
  }),
  /* O QUE O NARRADOR RECEBE (bastidor, na pauta do turno: o fato e o veto) */
  fato: Object.freeze({
    pegarDono: "Eu quis guardar «{coisa}», mas é {doDono}: não guardei, e nada entrou na minha mochila.",
    pegarInventado: "Eu quis guardar «{coisa}», e não guardei: não há aqui tal coisa que se leve. Nada entrou na minha mochila.",
    companheiroDa: "{Nome} me passou {Coisa}; já está na minha mochila, e saiu da bolsa de {Nome}.",
    companheiroNega: "{Nome} não me passou nada: {motivo}. Nada mudou de mão.",
    dar: "Dei {Coisa} a {Quem}; saiu da minha bolsa e está com {Quem}.",
    fiado: "Pedi fiado e não me deram: quem vende quer a moeda agora. Nada mudou de mão.",
    furto: "O furto deu certo: tirei {doAlvo} {Ganho}; já está comigo. Use exatamente isto.",
    furtoVazio: "O furto passou sem ser notado, mas a bolsa {doAlvo} estava quase vazia: nada entrou na minha bolsa.",
    furtoSemACoisa: "O furto passou sem ser notado, mas {Alvo} não tinha {Coisa}: nada entrou na minha bolsa.",
    furtoFalhou: "O furto falhou: nada saiu da bolsa {doAlvo}, nada entrou na minha bolsa.",
    deGraca: "{Alvo} me deu {Coisa}, de graça; já está na minha mochila.",
    deGracaAli: "{Alvo} me deixou provar ali mesmo; nada foi para a minha mochila.",
    deGracaNao: "{Alvo} não me deu nada de graça: nada mudou de mão.",
    deGracaCaro: "Pedi {Coisa} de graça, e não me deram: custa ◉ {P}, e continua na banca. Nada mudou de mão.",
    qual: "Eu disse uma coisa que pode ser mais de uma ({Lista}); nada mudou de mão até eu dizer qual.",
    tomar: "Arranquei {Coisa} da mão {doAlvo}; já está comigo. Use exatamente isto.",
    tomarFalhou: "Tentei tomar «{coisa}» da mão {doAlvo} e não consegui: {Alvo} segurou firme. Nada mudou de mão.",
    tomarNaoHa: "Quis tomar «{coisa}» da mão {doAlvo}, mas não há tal coisa ali: nada mudou de mão.",
    deGracaNaoTem: "Pedi {coisa} de graça, e {Alvo} não tem isso para me dar: nada mudou de mão.",
  }),
  veto: Object.freeze({
    pegar: "pôr «{coisa}» na minha mochila, no meu bolso ou na minha mão",
    companheiro: "fazer {Nome} pagar, comprar, emprestar ou entregar outra coisa a mim nesta resposta",
    dar: "devolver-me {Coisa} ou pagar-me por isso nesta resposta",
    fiado: "entregar-me algo fiado, a crédito ou para pagar depois",
    furto: "dar-me do furto outra coisa ou outra quantia além do que está dito",
    deGraca: "pôr nas minhas mãos outra coisa dada de graça além do que está dito",
    qual: "entregar, vender ou tirar da bolsa {Lista} nesta resposta",
    tomar: "pôr nas minhas mãos outra coisa tomada além do que está dito",
  }),
  /* A BUSCA QUE NÃO ACHOU (a oitava sessão, T18): «olho dentro dos barris» sem
     dado, e a prosa pôs «uma lâmina de podão encostada na borda» — que o
     jogador tentou levar no turno seguinte. A busca sem achado diz ao Narrador,
     pela pauta do turno, que ali não há o que se leve. */
  buscaVazia: Object.freeze({
    desafios: Object.freeze(["buscar", "investigar"]),
    fato: "Procurei e não achei nada que se leve: só o que já é do lugar, preso, quebrado ou sem valor.",
    veto: "descrever objeto solto, inteiro e de valor que se possa pegar e levar daqui — a busca não achou nada",
  }),
  /* QUEM É O ALVO (a nona sessão, T22, T29–T32, T56): «Da bolsa de a vítima» —
     a frase dizia «da vendedora», «da Gwynn», «de um dos estivadores», e o
     sistema não lia. O nome vem de quem está (presentes), ou do papel dito na
     frase, com o artigo dela; a contração sai daqui («de» + «o» = «do»). */
  contracao: Object.freeze({ o: "do", a: "da", os: "dos", as: "das" }),
  alvoSemNome: "quem estava ao seu lado",
  papelNaFrase: /\b(?:(do|da|dos|das|ao|aos|a|as)\s+)(?:(?:um|uma) (?:dos|das) |(?:o |a )?(?:outr[oa]s?) )?([a-z]{4,})\b/g,
  naoEAlvo: Object.freeze(["bolsa", "bolsinha", "bolso", "bolsos", "moeda", "moedas", "mao", "maos", "banca", "bancas", "cinto", "carteira", "algibeira", "graca", "amostra", "provar", "vela", "racao", "racoes", "agua", "odre", "tocha", "tochas", "sais", "frasco", "faca", "porta", "rua", "praca", "doca", "fonte", "taberna", "mochila", "conta", "credito", "vista", "volta", "frente", "ponto", "beira", "sombra", "noite", "manha", "tarde", "hora", "viagem", "rota", "trave", "quilha", "mesa", "balcao", "pressa", "toa", "quem", "alguem", "ninguem", "todos", "todas", "gente"]),
  motivoCompanheiro: Object.freeze({
    semMoeda: "não guarda moeda à parte; a bolsa do grupo é a minha",
    uso: "o que o grupo leva de {Coisa} está na minha mochila",
    naoTem: "não tem isso consigo",
    emUso: "usa {Coisa} e não a tira de si para dar",
  }),
  /* TOMAR DA MÃO DE ALGUÉM (a nona sessão, T28): é força contra quem segura —
     o dado é do catálogo («vencer o peso», desafios.js#forcar); passou, a coisa
     dita vem, se for coisa que cabe numa mão (a tabela); falhou, nada */
  tomar: /\b(?:tomo|arranco|arrebato|puxo|tiro|agarro)\s+(?:(?:o|a|os|as|um|uma)\s+)?([a-z][a-z-]*(?:\s+(?:de\s+)?[a-z][a-z-]*){0,3}?)\s+d[aeo]s?\s+maos?\s+d[aeo]s?\s+/,
  tomaveis: Object.freeze(["faca", "punhal", "adaga", "faquinha", "chave", "chaves", "carta", "bilhete", "papel", "mapa", "bolsa", "bolsinha", "anel", "colar", "amuleto", "moeda", "cajado", "bastao", "porrete", "pedra", "frasco", "garrafa", "caneca", "copo", "livro", "pergaminho", "lenco", "corda", "tocha", "vela", "lanterna", "cachimbo", "dado", "dados", "pena", "espeto", "anzol", "remo", "martelo", "machadinha"]),
  /* O DE GRAÇA QUE NOMEIA A COISA (a nona sessão, T22: pediu um odre, entrou uma
     Maçã seca da tabela): a coisa dita é a que vem, ou não vem — a amostra da
     tabela é só para o pedido vago («uma amostra do que ele tem») */
  usoDeGraca: Object.freeze(["agua", "tochas"]),
  aceitar: /\b(?:aceito|recebo|pego|apanho)\s+(?:(?:o|a|os|as|um|uma)\s+)?([a-z][a-z-]*(?:\s+(?:de\s+)?[a-z][a-z-]*){0,3}?)\s+que\s+[a-z-]+\s+me\s+(?:estendeu|deu|ofereceu|passou|entregou|estende|da|oferece|passa|entrega)\b/,
  pedidoVago: /\b(amostra|algo|alguma coisa|qualquer coisa|o que (?:ele|ela) (?:tem|tiver)|um pouco)\b/,
});
const V = O_VEREDITO_DA_TROCA;

/* ---------------- a quantia dita, e a palavra da moeda ---------------- */
const rxMoeda = (moeda) => {
  const w = sem(moeda).replace(/[^a-z]/g, "");
  return [...V.moedas, ...(w.length >= 3 ? [`${w.replace(/s$/, "")}s?`] : [])].join("|");
};
const valorDe = (tok) => (/^\d+$/.test(tok) ? Number(tok) : NUMERO_POR_EXTENSO[tok] || 0);
function quantiaNa(t, moeda) {
  const m = t.match(new RegExp(`(?:◉\\s*(\\d{1,4})|\\b(\\d{1,4}|${EXT})\\s+(?:${rxMoeda(moeda)})\\b)`));
  if (!m) return 0;
  return m[1] ? Number(m[1]) : valorDe(m[2]);
}

/* ============================================================
   nomeiaOItem(frase, nome) → a frase nomeia esta coisa da bolsa?
   O nome inteiro, ou o fim dele com corpo: «Rústico Martelo de Batalha» é o
   «martelo de batalha» que o jogador escreve (a frase sem turno da sessão 8,
   «vendo o martelo de batalha ao Eamon», caía em «não há o que vender»).
   ============================================================ */
export function nomeiaOItem(frase, nome) {
  const f = ` ${sem(frase).replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ")} `;
  const n = sem(str(nome).replace(/\s*\(.*\)\s*$/, "").replace(/\s*\+\d+\s*$/, "")).replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
  if (!n) return false;
  const ws = n.split(" ");
  for (let i = 0; i < ws.length; i++) {
    const cauda = ws.slice(i);
    if (cauda[0] && /^(de|do|da|dos|das|e)$/.test(cauda[0])) continue;
    /* o fim de uma palavra só não basta («curta» não é a «Espada Curta», «batalha» não é o martelo) */
    if (i > 0 && cauda.length < 2) break;
    if (!cauda.some((w) => w.length >= 4)) break;
    if (f.includes(` ${cauda.join(" ")} `)) return true;
  }
  return false;
}

/* ============================================================
   oItemDaFrase(frase, nomes) → null | { nome, i } | { ambiguos: [nomes] }
   CASAR O QUE O JOGADOR DISSE COM O QUE ELE TEM (a nona sessão, T10–T13):
   «vendo o couro» não achava o «Couro Batido»; «dou o distintivo do
   regimento» não achava o «Distintivo do antigo regimento», e a prosa
   decidia sozinha. Uma função só, para vender, dar, entregar e pedir ao
   companheiro: o nome inteiro (ou a cauda dele, nomeiaOItem) ganha; senão a
   palavra principal do nome (a primeira com corpo, pulando o adjetivo que
   abre «Rústico Martelo»), sem artigo e sem acento — e nunca contra uma
   palavra que a desdiz («a espada longa» não é a «Espada Curta»). Dois
   candidatos que casam igual: `ambiguos`, e quem chama nomeia os dois.
   ============================================================ */
const palavrasDoNome = (nome) => sem(str(nome).replace(/\s*\(.*\)\s*$/, "").replace(/\s*\+\d+\s*$/, "")).replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((w) => w && !V.ligaDoNome.includes(w));
export function oItemDaFrase(frase, nomes) {
  try {
    const ws = ` ${sem(frase).replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ")} `.split(" ").filter(Boolean);
    const lista = arr(nomes).map(nomeDe);
    const pontos = lista.map((n, i) => {
      if (!n) return { n, i, p: 0 };
      if (nomeiaOItem(frase, n)) return { n, i, p: 100 + n.length };
      const pal = palavrasDoNome(n);
      const corpo = pal.filter((w) => w.length >= 3);
      const cabeca = corpo.find((w) => !V.abreONome.includes(w));
      if (!cabeca) return { n, i, p: 0 };
      const k = ws.indexOf(cabeca);
      if (k < 0) return { n, i, p: 0 };
      /* a palavra que vem logo depois, pulando a ligação: se não é do nome e não abre outra coisa (a quem, e…), desdiz */
      const n1 = ws[k + 1] || "";
      if (n1 && !(V.fimDoNome.includes(n1) && !/^d[eoa]s?$/.test(n1))) {
        let j = k + 1;
        while (j < ws.length && /^(d[eoa]s?|o|a|os|as)$/.test(ws[j])) j++;
        const dep = ws[j] || "";
        if (dep && !pal.includes(dep) && !V.fimDoNome.includes(dep) && !/^\d+$/.test(dep)) return { n, i, p: 0 };
      }
      return { n, i, p: 50 + corpo.filter((w) => ws.includes(w)).length };
    }).filter((x) => x.p > 0).sort((a, b) => b.p - a.p);
    if (!pontos.length) return null;
    const [a, b] = pontos;
    if (b && b.p === a.p && sem(b.n) !== sem(a.n)) return Object.freeze({ ambiguos: Object.freeze([...new Set(pontos.filter((x) => x.p === a.p).map((x) => x.n))]) });
    return Object.freeze({ nome: a.n, i: a.i });
  } catch { return null; }
}

/* ============================================================
   aCompraPorMoeda(frase, moeda?) → null | { quantia, coisa }
   «dou duas moedas ao vendedor pelos sais aromáticos», «ponho ◉ 3 no balcão
   pelas ataduras», «dou uma moeda a Lucan por um odre de água». A moeda vai
   na mão, a coisa vem: é compra. `coisa` é o que vem depois do «por»
   (sem acento), até quem recebe ou a oração seguinte.
   ============================================================ */
export function aCompraPorMoeda(frase, moeda) {
  try {
    const t = sem(frase);
    if (!t || t.startsWith("[")) return null;
    /* «ofereço duas moedas… para ela fingir que não me viu passar pelo portal»: o «pelo» é do caminho, e a moeda é suborno */
    if (oSubornoDaFrase(frase, moeda)) return null;
    const verbos = V.daMoeda.join("|");
    const q = `(?:as\\s+|os\\s+|so\\s+|apenas\\s+)?(?:◉\\s*\\d{1,4}|(?:\\d{1,4}|${EXT})\\s+(?:${rxMoeda(moeda)}))`;
    const m = t.match(new RegExp(`\\b(?:${verbos})\\s+${q}\\b[^.!?;]{0,50}?\\b(?:por|pel[oa]s?)\\s+(?:(?:um|uma|uns|umas|o|a|os|as|meu|minha|\\d+|${EXT})\\s+)?([a-z][a-z-]*(?:\\s+[a-z][a-z-]*){0,6})`));
    if (!m) return null;
    const ws = m[1].split(" ");
    const out = [];
    for (const w of ws) { if (V.fimDaCoisa.includes(w) || out.length >= V.palavrasDaCoisa) break; out.push(w); }
    while (out.length && /^(de|do|da|dos|das)$/.test(out[out.length - 1])) out.pop();
    const coisa = out.join(" ");
    /* «por favor», «por pena», «por aqui»: não é coisa que se compre */
    if (!coisa || /^(favor|pena|gentileza|aqui|ali|isso|isto|tudo|nada|ele|ela|mim|voce|hoje|agora)$/.test(coisa)) return null;
    /* «pago cinco moedas pela informação», «pelo nome dele»: o que se paga é
       saber, e saber é do gesto da carta (pagar a quem sabe), não da banca */
    if (V.naoEMercadoria.includes(coisa.split(" ")[0])) return null;
    return { quantia: quantiaNa(t, moeda), coisa };
  } catch { return null; }
}

/* oSubornoDaFrase(frase) → true quando a moeda vai para alguém fingir,
   deixar passar ou fechar os olhos (é conversa com dado, não pagar) */
export function oSubornoDaFrase(frase, moeda) {
  try {
    const t = sem(frase);
    if (!t || !V.suborno.test(t)) return false;
    return quantiaNa(t, moeda) > 0 || V.quantiaVaga.test(t) || /\b(dinheiro|moedas?|suborno|subornar)\b/.test(t);
  } catch { return false; }
}

/* oFiadoDaFrase(frase) → true quando a frase pede para levar agora e pagar depois */
export function oFiadoDaFrase(frase) {
  try { return V.fiado.test(sem(frase)); } catch { return false; }
}

/* ============================================================
   aPortaDaMoeda(frase, moeda?) → "fiado" | "suborno" | "compra" | ""
   UMA PORTA COBRA (a nona sessão, T57). «dou 10 moedas à vendedora por duas
   rações de viagem» cobrou ◉ 20: a bolsa da frase cobrou as rações (◉ 10) e
   o gesto da carta da quest («pagar a quem sabe», quadro-da-quest.js) leu
   «dou 10 moedas» como pagamento ao Kael, que estava em cena, e cobrou o
   preço do caminho por cima. A moeda que a frase põe na mesa tem um dono só:
   o fiado não se paga, o suborno é da conversa com dado, a compra é da
   bolsa da frase — e o que sobra ("") é que pode ser o pagar da carta ou da
   taverna.
   ============================================================ */
export function aPortaDaMoeda(frase, moeda) {
  try {
    if (oFiadoDaFrase(frase)) return "fiado";
    if (oSubornoDaFrase(frase, moeda)) return "suborno";
    if (aCompraPorMoeda(frase, moeda) || V.compraDeclarada.test(sem(frase))) return "compra";
    return "";
  } catch { return ""; }
}

/* a coisa como o jogador a escreveu (com acento), a partir da forma sem acento */
function doOriginal(frase, semAcento) {
  const f = str(frase).normalize("NFC").replace(/\s+/g, " ");
  let base = "";
  const mapa = [];
  for (let i = 0; i < f.length; i++) {
    const b = f[i].normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    for (const ch of b) { base += ch; mapa.push(i); }
  }
  const k = semAcento ? base.indexOf(semAcento) : -1;
  if (k < 0) return semAcento;
  const ini = mapa[k], fim = mapa[k + semAcento.length - 1];
  return f.slice(ini, fim + 1).toLowerCase();
}

/* ---------------- as leituras do pedido ---------------- */
function oQueSePega(t) {
  if (!V.guardar.test(t)) return "";
  const m = t.match(V.verboDePegar);
  if (!m) return "";
  const out = [];
  for (const w of m[1].split(" ")) { if (V.fimDoQuePega.includes(w)) break; out.push(w); }
  while (out.length && /^(de|e)$/.test(out[out.length - 1])) out.pop();
  const coisa = out.join(" ");
  if (!coisa || V.naoECoisa.includes(coisa.split(" ")[0])) return "";
  return coisa;
}

/* a coisa que se pede de graça: sem o «de graça», sem quem recebe o pedido,
   sem o «devolvo amanhã» — o que fica depois do artigo («um odre de água») */
function coisaDoPedido(frase, presentes) {
  let t = sem(frase).replace(/,?\s*\b(?:devolvo|devolverei|pago|que eu|e eu|prometo)\b.*$/, "");
  const q = quemDaFrase(frase, presentes);
  if (q) {
    const w = primeiro(q.nome);
    if (w) t = t.replace(new RegExp(`\\b(?:a|ao|as|aos|da|do|de)?\\s*(?:o |a )?${w}\\b`), " ");
  }
  t = t.replace(/\b(?:de graca|gratis|gratuitamente|emprestad[oa]s?|de presente|para provar|pra provar|para experimentar|por favor)\b/g, " ").replace(/\s+/g, " ");
  const m = t.match(/\b(?:peco|pedimos|quero|me da|me de|me empresta|me empreste|me arruma)\b[^.!?;]*?\b(?:um|uma|uns|umas|o|a|os|as)\s+([a-z]+(?:\s+(?:de|que)\s+[a-z]+)?(?:\s+[a-z]+)?)/);
  if (!m) return "";
  const out = [];
  for (const w of m[1].split(" ")) { if (/^(a|ao|as|aos|para|pra|e|com|se|mas)$/.test(w)) break; out.push(w); }
  while (out.length && /^(de|que)$/.test(out[out.length - 1])) out.pop();
  const coisa = out.join(" ");
  return /^(do|da|de|que|isso|algo|nada|um|uma)$/.test(coisa.split(" ")[0] || "") ? "" : coisa;
}

function oCompanheiroDaFrase(t, grupo) {
  const gs = arr(grupo).map(obj).filter((g) => g && primeiro(g.nome).length >= 3);
  for (const g of gs) {
    const p = primeiro(g.nome);
    if (new RegExp(`\\b${p}\\b`).test(t)) return g;
  }
  return null;
}

function classeDaVitima(alvo) {
  const a = obj(alvo) || { nome: str(alvo) };
  const k = sem(`${str(a.papel)} ${str(a.nome)} ${str(a.oficio)}`);
  if (V.vitima.abastado.some((x) => k.includes(x))) return "abastado";
  if (V.vitima.pobre.some((x) => k.includes(x))) return "pobre";
  return "comum";
}

/* ============================================================
   aIntencaoDaTroca(frase, ctx) → null | { tipo, ... }
   ctx: { grupo, moeda }. Só lê; não decide. Os tipos:
     pegar        { coisa, dono }
     companheiro  { quem, oQue: "moeda"|"coisa", coisa }
     fiado        {}
     furto        { coisa }      (o veredito espera o dado)
     deGraca      { coisa }      (o veredito espera o dado)
     vendaDeUso   { id, quantos, nome }
   ============================================================ */
export function aIntencaoDaTroca(frase, ctx) {
  try {
    const c = obj(ctx) || {};
    const t = sem(frase);
    if (!t || t.startsWith("[") || t.startsWith("/")) return null;
    if (/\?\s*$/.test(t) && !/\b(peco|me empresta|me da|me de)\b/.test(t)) return null;
    /* o companheiro primeiro: o pedido é a ele, e a coisa é dele */
    const comp = oCompanheiroDaFrase(t, c.grupo);
    if (comp && V.pedeAoCompanheiro.test(t)) {
      const d = t.match(V.companheiroDa);
      const coisa0 = d ? d[1].replace(/\s+(?:da|do|de|que|para|pra|com|e|dela|dele)(?:\s.*)?$/, "").trim() : "";
      const coisa = coisa0 && !V.naoECoisaDoCompanheiro.includes(coisa0.split(" ")[0]) ? coisa0 : "";
      const ehMoeda = V.companheiroPaga.test(t) && (!coisa || V.moedaDoCompanheiro.test(t) || !/\b(empreste|empresta|emprestar)\b/.test(t))
        ? true : !!(coisa && V.moedaDoCompanheiro.test(coisa));
      if (ehMoeda || coisa) return { tipo: "companheiro", quem: nomeDe(comp), oQue: ehMoeda ? "moeda" : "coisa", coisa: ehMoeda ? "" : coisa };
    }
    if (oFiadoDaFrase(t)) return { tipo: "fiado" };
    /* vender o que é de uso */
    if (V.vender.test(t)) {
      /* só o que se vende, não a quem: «vendo a bússola à vendedora de água» não
         vende água (a sessão 8, T2, com a leitura de antes) — o objeto é o que
         vem depois do verbo, até o «a/ao/para» de quem compra */
      const mObj = t.match(/\b(?:vendo|vendemos|vender|vendi)\s+(?:(?:o|a|os|as|um|uma|meu|minha|meus|minhas)\s+)?(.*)$/);
      const objV = mObj ? mObj[1].split(/\s(?:ao|aos|a|as|para|pra|pro)\s/)[0] : t;
      for (const u of V.usoDaVenda) {
        const m = objV.match(u.rx) ? t.match(u.rx) : null;
        if (!m) continue;
        const antes = t.slice(0, m.index).trim().split(/\s+/).slice(-2);
        let q = 0;
        for (let i = antes.length - 1; i >= 0 && !q; i--) q = valorDe(antes[i]);
        const quantos = q > 0 ? q : (/s$/.test(m[0]) ? 2 : 1);
        return { tipo: "vendaDeUso", id: u.id, quantos, nome: quantos > 1 ? u.varios : u.um };
      }
    }
    /* dar uma coisa da bolsa: o veredito confere se ela está lá, e a quem vai */
    if (V.dar.test(t) && !aCompraPorMoeda(frase, c.moeda) && !oSubornoDaFrase(frase, c.moeda) && quantiaNa(t, c.moeda) === 0 && !Object.keys(V.usos).some((u) => new RegExp(`\\b${u}\\b`).test(t))) {
      return { tipo: "dar" };
    }
    if (V.furto.test(t)) {
      const m = t.match(V.coisaDoFurto);
      return { tipo: "furto", coisa: m ? m[1] : "" };
    }
    /* a nona sessão, T28: «tomo a faca de peixe da mão do estivador» — força
       contra quem segura, com dado (antes caía em «pegar» e era negado sem dado) */
    const mT = t.match(V.tomar);
    if (mT && mT[1] && !V.naoECoisa.includes(mT[1].split(" ")[0])) return { tipo: "tomar", coisa: mT[1].trim() };
    if (V.deGraca.test(t) && V.pedeAlgo.test(t) && !comp) {
      return { tipo: "deGraca", coisa: coisaDoPedido(frase, c.presentes) };
    }
    /* a nona sessão, T38: «aceito o rosário de marfim que Torvald me estendeu e
       guardo» — o que o companheiro dá sai da bolsa dele, se estiver lá */
    const mA = t.match(V.aceitar);
    if (mA && comp) {
      const coisaA = mA[1].replace(/\s+(?:que|de|do|da)$/, "").trim();
      if (coisaA) return { tipo: "companheiro", quem: nomeDe(comp), oQue: "coisa", coisa: coisaA };
    }
    const coisa = oQueSePega(t);
    if (coisa) {
      const dono = (() => { const m = coisa.match(/\b(?:de|da|do)\s+([a-z]{3,})$/); return m ? m[1] : /\b(dela|dele)\b/.test(t) ? "?" : ""; })();
      return { tipo: "pegar", coisa, dono };
    }
    return null;
  } catch { return null; }
}

/* ---------------- o veredito, a forma ---------------- */
const aplicada = (tipo, ficha, mudou, linha, fato, veto) => Object.freeze({ tipo, estado: "aplicada", ficha, mudou: Object.freeze(mudou), linha, fato, veto: veto ? [veto] : [] });
const negada = (tipo, motivo, linha, fato, veto) => Object.freeze({ tipo, estado: "negada", ficha: null, mudou: Object.freeze([]), motivo, linha, fato, veto: veto ? [veto] : [] });

/* ============================================================
   oFatoDaTroca(veredito) → null | { fato: [linha], naoPode: [vetos] }
   O que vai à pauta do turno: o fato na secção FATO DESTE TURNO (a primeira,
   de ferro: pauta.js), fechado por «Narre só isto; nada mais muda de mão.», e
   em NÃO PODE o veto do veredito mais o que fecha a porta barata. Só para
   `aplicada` e `negada` (o pendente espera o dado).
   ============================================================ */
export function oFatoDaTroca(v) {
  const o = obj(v);
  if (!o || (o.estado !== "aplicada" && o.estado !== "negada") || !str(o.fato).trim()) return null;
  return Object.freeze({
    fato: Object.freeze([`${str(o.fato).trim()} ${V.fatoFecho}`]),
    naoPode: Object.freeze([...arr(o.veto).filter((x) => str(x).trim()), V.vetoDoFato]),
  });
}

/* ============================================================
   oButimDoFurto({ semente, alvo, lugar, dia, coisa }) →
     { moedas, item, nada, semACoisa }
   Por semente: o mesmo furto (mundo, vítima, lugar, dia) dá o mesmo butim.
   ============================================================ */
export function oButimDoFurto(o) {
  const c = obj(o) || {};
  const a = obj(c.alvo) || { nome: str(c.alvo) };
  const chave = `${str(c.semente)}|furto|${sem(a.nome)}|${sem(c.lugar)}|${Number(c.dia) || 0}`;
  const coisa = sem(c.coisa);
  const doBolso = coisa && !V.dinheiroDoBolso.test(coisa) ? Object.keys(V.doBolso).find((k) => coisa.startsWith(k)) : "";
  if (coisa && !V.dinheiroDoBolso.test(coisa)) {
    if (doBolso && sorteDe(`${chave}|tem`) < V.temNoBolso) return { moedas: 0, item: V.doBolso[doBolso], nada: false, semACoisa: false };
    return { moedas: 0, item: "", nada: true, semACoisa: true };
  }
  const B = V.butim[classeDaVitima(a)];
  if (sorteDe(`${chave}|nada`) < B.nada) return { moedas: 0, item: "", nada: true, semACoisa: false };
  const moedas = B.min + Math.floor(sorteDe(`${chave}|quanto`) * (B.max - B.min + 1));
  const item = sorteDe(`${chave}|item`) < B.item ? V.bugigangas[Math.floor(sorteDe(`${chave}|qual`) * V.bugigangas.length)] : "";
  return { moedas, item, nada: false, semACoisa: false };
}

const nomeDoAlvo = (alvo) => maiuscula(str(obj(alvo) ? alvo.nome : alvo).split(",")[0]) || maiuscula(V.alvoSemNome);
/* «o estivador» → «do estivador»; «Gwynn» → «de Gwynn»; sem nome, «de quem estava ao seu lado» */
export function deQuem(nome) {
  const n = str(nome).split(",")[0].trim() || V.alvoSemNome;
  const m = n.match(/^(o|a|os|as)\s+(.+)$/i);
  return m ? `${V.contracao[m[1].toLowerCase()]} ${m[2]}` : `de ${n}`;
}
/* o singular de «estivadores», «vendedoras» */
const singular = (w) => (/ores$/.test(w) ? w.slice(0, -2) : /(r|z)es$/.test(w) ? w.slice(0, -2) : /s$/.test(w) ? w.slice(0, -1) : w);
/* ============================================================
   quemDaFrase(frase, presentes) → null | { nome }
   Quem a frase aponta: primeiro quem está (pelo primeiro nome), depois o
   papel dito com o artigo dele («da vendedora» → «a vendedora», «de um dos
   estivadores» → «o estivador»). O que é lugar ou coisa não é gente.
   ============================================================ */
export function quemDaFrase(frase, presentes) {
  try {
    const t = sem(frase);
    if (!t) return null;
    for (const p of arr(presentes).map(nomeDe).filter(Boolean)) {
      const w = primeiro(p);
      if (w.length >= 3 && new RegExp(`\\b${w}\\b`).test(t)) return { nome: p };
    }
    const orig = str(frase).normalize("NFC");
    for (const m of t.matchAll(V.papelNaFrase)) {
      const w = m[2];
      if (V.naoEAlvo.includes(w) || V.naoEAlvo.includes(singular(w))) continue;
      const art = /^(da|das|a|as)$/.test(m[1]) ? "a" : "o";
      const s1 = singular(w);
      return { nome: `${art} ${doOriginal(orig, s1) || s1}` };
    }
    return null;
  } catch { return null; }
}

/* ============================================================
   oVereditoDaTroca(frase, ctx) → null | veredito
   ctx: {
     ficha     — a do herói (moedas, inventario, equipamento, equipados, suprimentos, grupo);
     chao      — os nomes do que está no chão ali perto (a mão da frase os apanha);
     presentes — os nomes de quem está na cena (o dono da coisa);
     semente, lugar, dia — a semente do butim e da amostra;
     alvo      — { nome, papel } a quem a frase se dirige (o furto, o de graça);
     dado      — undefined (ainda não rolou) | { passou: bool } | { acontece: true } (sem risco);
     bancas    — [{ nome, estoque: [{ nome, preco }] }] as de quem está (o de graça);
     moeda     — a palavra da moeda do mundo;
     intencao  — a leitura já feita (senão lê-se aqui)
   }
   veredito: { tipo, estado: "aplicada"|"negada"|"pendente", ficha, mudou: [{ coisa, quantos, de, para }],
               motivo, linha (tela), fato (pauta, «acabou»), veto: [naoPode] }
   `pendente`: a intenção espera o dado (furto, de graça) — chame de novo com `dado`.
   ============================================================ */
export function oVereditoDaTroca(frase, ctx) {
  try {
    const c = obj(ctx) || {};
    const ficha = obj(c.ficha);
    if (!ficha) return null;
    const it = obj(c.intencao) || aIntencaoDaTroca(frase, { grupo: ficha.grupo, moeda: c.moeda });
    if (!it) return null;
    const T = V.tela, F = V.fato, X = V.veto;
    const chave = `${str(c.semente)}|${sem(frase)}|${Number(c.dia) || 0}`;
    const naBolsa = [...arr(ficha.inventario), ...arr(ficha.equipamento), ...Object.values(obj(ficha.equipados) || {})].map(nomeDe).filter(Boolean);

    if (it.tipo === "pegar") {
      const coisa = it.coisa;
      if (arr(c.chao).some((n) => nomeiaOItem(coisa, n) || nomeiaOItem(frase, n))) return null;
      if (naBolsa.some((n) => nomeiaOItem(frase, n))) return null;
      const pres = arr(c.presentes).map(str).filter(Boolean);
      /* a nona sessão, T27: o frasco de sais da banca é da banca (era «não é coisa que valha levar», dito de um frasco de ◉ 40) */
      const daBanca = arr(c.bancas).map(obj).find((b) => b && arr(b.estoque).some((x) => obj(x) && x.nome && (nomeiaOItem(coisa, x.nome) || nomeiaOItem(frase, x.nome))));
      const quemBanca = daBanca ? (() => { const q = quemDaFrase(frase, pres); return q ? maiuscula(q.nome) : str(daBanca.nome); })() : "";
      const dono = quemBanca || (it.dono && it.dono !== "?" ? pres.find((p) => primeiro(p) === it.dono) : "");
      const semDono = doOriginal(frase, dono ? coisa.replace(/\s+(?:de|da|do)\s+[a-z]{3,}$/, "") : coisa);
      /* \`coisa\`: o conferente corta a prosa que a põe na mochila */
      if (dono) {
        return Object.freeze({ ...negada("pegar", "dono", tpl(T.pegarDono, { Coisa: maiuscula(semDono), Dono: dono, doDono: deQuem(dono.charAt(0).toLowerCase() === dono.charAt(0) ? dono : (/^(O|A|Os|As) /.test(dono) ? dono.charAt(0).toLowerCase() + dono.slice(1) : dono)) }), tpl(F.pegarDono, { coisa: semDono, Dono: dono, doDono: deQuem(/^(O|A|Os|As) /.test(dono) ? dono.charAt(0).toLowerCase() + dono.slice(1) : dono) }), tpl(X.pegar, { coisa: semDono })), coisa: semDono });
      }
      const L = tpl(T.pegarInventado[Math.floor(sorteDe(`${chave}|pegar`) * T.pegarInventado.length)], { coisa: semDono, Coisa: maiuscula(semDono) });
      return Object.freeze({ ...negada("pegar", "inventado", L, tpl(F.pegarInventado, { coisa: semDono }), tpl(X.pegar, { coisa: semDono })), coisa: semDono });
    }

    if (it.tipo === "companheiro") {
      const g = arr(ficha.grupo).find((x) => obj(x) && nomeDe(x) === it.quem);
      const Nome = str(it.quem).split(/[\s,]+/)[0];
      if (!g) return null;
      if (it.oQue === "moeda") {
        const motivo = V.motivoCompanheiro.semMoeda;
        return negada("companheiro", "semMoeda", tpl(T.companheiroSemMoeda, { Nome }), tpl(F.companheiroNega, { Nome, motivo }), tpl(X.companheiro, { Nome }));
      }
      const coisa = it.coisa;
      const uso = V.usos[coisa.split(" ").map((w) => w.replace(/s$/, "")).find((w) => V.usos[w]) || coisa.split(" ").find((w) => V.usos[w]) || ""];
      const inv = arr(g.inventario);
      /* a nona sessão, T16: a Espada Longa estava nos «equipados» dele, e a linha
         dizia «não tem isso consigo». O que ele tem: a bolsa e o que veste —
         casado pela mesma função de quem dá e de quem vende (oItemDaFrase) */
      const vestidosG = Object.values(obj(g.equipados) || {}).map(nomeDe).filter(Boolean);
      const qual = uso ? null : oItemDaFrase(coisa, [...inv.map(nomeDe), ...vestidosG]) || oItemDaFrase(frase, [...inv.map(nomeDe), ...vestidosG]);
      if (qual && qual.ambiguos) {
        const Lista = qual.ambiguos.join(" ou ");
        return negada("companheiro", "qual", tpl(T.qual, { Lista }), tpl(F.qual, { Lista }), tpl(X.qual, { Lista }));
      }
      const k = qual && qual.i < inv.length ? qual.i : -1;
      if (qual && qual.i >= inv.length) {
        const Coisa = qual.nome;
        return Object.freeze({ ...negada("companheiro", "emUso", tpl(T.companheiroEmUso, { Nome, Coisa }), tpl(F.companheiroNega, { Nome, motivo: tpl(V.motivoCompanheiro.emUso, { Coisa }) }), tpl(X.companheiro, { Nome })), coisa: Coisa });
      }
      if (k >= 0 && !uso) {
        const nomeItem = nomeDe(inv[k]);
        const grupo = arr(ficha.grupo).map((x) => (x === g ? { ...g, inventario: inv.filter((_, i) => i !== k) } : x));
        const nova = { ...ficha, grupo, inventario: [...arr(ficha.inventario), inv[k]] };
        return aplicada("companheiro", nova, [{ coisa: nomeItem, quantos: 1, de: it.quem, para: "heroi" }],
          tpl(T.companheiroDa, { Nome, Coisa: nomeItem }), tpl(F.companheiroDa, { Nome, Coisa: nomeItem }), tpl(X.companheiro, { Nome }));
      }
      if (uso) {
        const nomeUso = (V.usoDaVenda.find((u) => u.id === uso) || {}).varios || coisa;
        return negada("companheiro", "uso", tpl(T.companheiroUso, { Nome, coisa: nomeUso }), tpl(F.companheiroNega, { Nome, motivo: tpl(V.motivoCompanheiro.uso, { Coisa: nomeUso }) }), tpl(X.companheiro, { Nome }));
      }
      return Object.freeze({ ...negada("companheiro", "naoTem", tpl(T.companheiroNaoTem, { Nome }), tpl(F.companheiroNega, { Nome, motivo: V.motivoCompanheiro.naoTem }), tpl(X.companheiro, { Nome })), coisa: doOriginal(frase, coisa) });
    }

    if (it.tipo === "fiado") return negada("fiado", "fiado", T.fiado, F.fiado, X.fiado);

    if (it.tipo === "dar") {
      /* a coisa: só da mochila (o que está vestido não se dá numa frase), e a quem: alguém da cena ou do grupo */
      const inv = arr(ficha.inventario);
      /* a nona sessão, T12 e T13: «dou o distintivo ao Torvald» — o nome encurtado casa pela palavra principal */
      const qualD = oItemDaFrase(frase, inv);
      if (qualD && qualD.ambiguos) {
        const Lista = qualD.ambiguos.join(" ou ");
        return negada("dar", "qual", tpl(T.qual, { Lista }), tpl(F.qual, { Lista }), tpl(X.qual, { Lista }));
      }
      const k = qualD ? { raw: inv[qualD.i], i: qualD.i, n: nomeDe(inv[qualD.i]) } : null;
      if (!k) return null;
      const t0 = sem(frase);
      const grupo = arr(ficha.grupo).filter((g) => obj(g) && nomeDe(g));
      const g = grupo.find((x) => primeiro(nomeDe(x)) && new RegExp(`\\b${primeiro(nomeDe(x))}\\b`).test(t0));
      const quem = g ? nomeDe(g) : arr(c.presentes).map(str).find((p) => primeiro(p).length >= 3 && new RegExp(`\\b${primeiro(p)}\\b`).test(t0)) || "";
      if (!quem) return null;
      const Quem = quem.split(",")[0];
      const nova = { ...ficha, inventario: inv.filter((_, i) => i !== k.i), ...(g ? { grupo: arr(ficha.grupo).map((x) => (x === g ? { ...g, inventario: [...arr(g.inventario), k.raw] } : x)) } : {}) };
      return aplicada("dar", nova, [{ coisa: k.n, quantos: 1, de: "heroi", para: Quem }], tpl(T.dar, { Coisa: maiuscula(k.n), Quem }), tpl(F.dar, { Coisa: k.n, Quem }), tpl(X.dar, { Coisa: k.n }));
    }

    /* o alvo: o que veio (a régua, o desafio), ou quem a frase aponta */
    const alvoC = obj(c.alvo) && str(c.alvo.nome).trim() ? c.alvo : str(c.alvo).trim() ? { nome: str(c.alvo) } : quemDaFrase(frase, c.presentes);
    if (it.tipo === "furto") {
      const Alvo = nomeDoAlvo(alvoC);
      const doAlvo = deQuem(str(alvoC && alvoC.nome));
      const d = obj(c.dado);
      if (!d) return Object.freeze({ tipo: "furto", estado: "pendente", ficha: null, mudou: Object.freeze([]), linha: "", fato: "", veto: [] });
      const passou = d.passou === true || d.acontece === true;
      if (!passou) return negada("furto", "falhou", "", tpl(F.furtoFalhou, { Alvo, doAlvo }), X.furto);
      const b = oButimDoFurto({ semente: c.semente, alvo: alvoC, lugar: c.lugar, dia: c.dia, coisa: it.coisa });
      if (b.nada) {
        const Coisa = it.coisa;
        return b.semACoisa
          ? negada("furto", "semACoisa", tpl(T.furtoSemACoisa, { Alvo, Coisa }), tpl(F.furtoSemACoisa, { Alvo, Coisa }), X.furto)
          : negada("furto", "vazia", tpl(T.furtoVazio, { Alvo, doAlvo }), tpl(F.furtoVazio, { Alvo, doAlvo }), X.furto);
      }
      const moedas = (Number(ficha.moedas) || 0) + b.moedas;
      const nova = { ...ficha, moedas, ...(b.item ? { inventario: [...arr(ficha.inventario), b.item] } : {}) };
      const ganho = [b.moedas ? `◉ ${b.moedas}` : "", b.item].filter(Boolean).join(" e ");
      const mudou = [...(b.moedas ? [{ coisa: "moedas", quantos: b.moedas, de: Alvo, para: "heroi" }] : []), ...(b.item ? [{ coisa: b.item, quantos: 1, de: Alvo, para: "heroi" }] : [])];
      return aplicada("furto", nova, mudou, tpl(T.furto, { Alvo, doAlvo, Ganho: ganho, B: moedas }), tpl(F.furto, { Alvo, doAlvo, Ganho: ganho }), X.furto);
    }

    if (it.tipo === "tomar") {
      const Alvo = nomeDoAlvo(alvoC);
      const doAlvo = deQuem(str(alvoC && alvoC.nome));
      const coisaT = doOriginal(frase, it.coisa);
      const d = obj(c.dado);
      if (!d) return Object.freeze({ tipo: "tomar", estado: "pendente", ficha: null, mudou: Object.freeze([]), linha: "", fato: "", veto: [] });
      const passou = d.passou === true || d.acontece === true;
      if (!passou) return Object.freeze({ ...negada("tomar", "falhou", tpl(T.tomarFalhou, { Alvo }), tpl(F.tomarFalhou, { Alvo, doAlvo, coisa: coisaT }), X.tomar), coisa: coisaT });
      if (!V.tomaveis.includes(sem(it.coisa).split(" ")[0])) return Object.freeze({ ...negada("tomar", "naoHa", tpl(T.tomarNaoHa, { coisa: coisaT, doAlvo }), tpl(F.tomarNaoHa, { coisa: coisaT, doAlvo }), X.tomar), coisa: coisaT });
      const Coisa = maiuscula(coisaT);
      const nova = { ...ficha, inventario: [...arr(ficha.inventario), Coisa] };
      return aplicada("tomar", nova, [{ coisa: Coisa, quantos: 1, de: Alvo, para: "heroi" }], tpl(T.tomar, { Coisa: coisaT, doAlvo }), tpl(F.tomar, { Coisa, doAlvo }), X.tomar);
    }

    if (it.tipo === "deGraca") {
      const Alvo = nomeDoAlvo(alvoC);
      const d = obj(c.dado);
      if (!d) return Object.freeze({ tipo: "deGraca", estado: "pendente", ficha: null, mudou: Object.freeze([]), linha: "", fato: "", veto: [] });
      const passou = d.passou === true || d.acontece === true;
      if (!passou) return negada("deGraca", "recusou", d.semDado ? tpl(T.deGracaNao, { Alvo }) : "", tpl(F.deGracaNao, { Alvo }), X.deGraca);
      if (V.consumidoAli.test(sem(frase))) return negada("deGraca", "ali", tpl(T.deGracaAli, { Alvo }), tpl(F.deGracaAli, { Alvo }), X.deGraca);
      /* a coisa que a frase pede, se a banca dele a tem e é pequena */
      const doEstoque = arr(c.bancas).flatMap((b) => arr(obj(b) ? b.estoque : null)).map(obj).filter((x) => x && x.nome)
        .filter((x) => nomeiaOItem(frase, x.nome)).sort((a, b) => (Number(a.preco) || 0) - (Number(b.preco) || 0))[0];
      if (doEstoque && (Number(doEstoque.preco) || 0) > V.tetoDaAmostra) {
        return Object.freeze({ ...negada("deGraca", "caro", tpl(T.deGracaCaro, { Coisa: doEstoque.nome, P: Number(doEstoque.preco) || 0 }), tpl(F.deGracaCaro, { Coisa: doEstoque.nome, P: Number(doEstoque.preco) || 0 }), X.deGraca), coisa: doEstoque.nome });
      }
      /* a nona sessão, T22: pediu um odre, entrou uma «Maçã seca» da tabela. A
         coisa dita é a que vem (o que é de uso barato: uma unidade), ou não vem;
         a amostra da tabela é só para o pedido vago */
      const coisaG = str(it.coisa);
      if (!doEstoque && coisaG && !V.pedidoVago.test(coisaG)) {
        const usoG = V.usoDaVenda.find((u) => u.rx.test(coisaG));
        if (usoG && V.usoDeGraca.includes(usoG.id)) {
          const sup = obj(ficha.suprimentos) || {};
          const nova = { ...ficha, suprimentos: { ...sup, [usoG.id]: (Number(sup[usoG.id]) || 0) + 1 } };
          const Coisa = `1 ${usoG.um}`;
          return aplicada("deGraca", nova, [{ coisa: usoG.id, quantos: 1, de: Alvo, para: "heroi" }], tpl(T.deGraca, { Alvo, Coisa }), tpl(F.deGraca, { Alvo, Coisa }), X.deGraca);
        }
        const coisaO = doOriginal(frase, coisaG);
        return Object.freeze({ ...negada("deGraca", "naoTem", tpl(T.deGracaNaoTem, { Alvo, coisa: coisaO }), tpl(F.deGracaNaoTem, { coisa: coisaO, Alvo }), X.deGraca), coisa: coisaO });
      }
      const item = doEstoque ? (() => { const { preco, detalhe, ...limpo } = doEstoque; return limpo; })() : V.amostras[Math.floor(sorteDe(`${chave}|amostra|${sem(Alvo)}`) * V.amostras.length)];
      const nomeItem = nomeDe(item);
      const nova = { ...ficha, inventario: [...arr(ficha.inventario), item] };
      return aplicada("deGraca", nova, [{ coisa: nomeItem, quantos: 1, de: Alvo, para: "heroi" }], tpl(T.deGraca, { Alvo, Coisa: nomeItem }), tpl(F.deGraca, { Alvo, Coisa: nomeItem }), X.deGraca);
    }
    return null;
  } catch { return null; }
}

/* aBuscaSemAchado(desafio, { passou, achou }) → null | { acabou, naoPode }
   A busca (o desafio dela) que não achou — sem dado, ou com o dado falhado, ou
   passou sem nada escondido — devolve o fato e o veto da pauta do turno. */
export function aBuscaSemAchado(desafio, r) {
  const id = str(obj(desafio) ? desafio.id : desafio);
  const o = obj(r) || {};
  if (!V.buscaVazia.desafios.includes(id) || o.achou === true) return null;
  return Object.freeze({ acabou: Object.freeze([V.buscaVazia.fato]), naoPode: Object.freeze([V.buscaVazia.veto]) });
}

/* ============================================================
   aVendaDoUso(ficha, { id, quantos, preco, quem }) →
     { ok, ficha, valor, linha }
   O que é de uso vende-se ao balcão pela fração de revenda do preço dele
   (`preco`: o do balcão de hoje, por unidade). `quem`: quem compra aqui
   ({ nome }), ou null com `motivo`. A linha tem a forma da venda da bolsa.
   ============================================================ */
export const O_TEXTO_DA_VENDA_DE_USO = Object.freeze({
  vendido: "🛒 Vendido: {I} {Q} por ◉ {V} (bolsa: ◉ {B}).",
  falta: "⛔ Você só tem {N} {I}.",
  semComprador: "⛔ {I}: {M}.",
  motivoPadrao: "ninguém aqui compra isso",
  /* o que está vestido: um mestre real diria «tire primeiro» (a venda da bolsa diz o mesmo, a-venda-da-bolsa.js) */
  emUso: "está em uso: desequipe antes de vender",
});
export function aVendaDoUso(ficha, pedido) {
  const T = O_TEXTO_DA_VENDA_DE_USO;
  const f = obj(ficha);
  const p = obj(pedido) || {};
  const u = V.usoDaVenda.find((x) => x.id === p.id);
  if (!f || !u) return { ok: false, ficha, valor: 0, linha: tpl(T.semComprador, { I: "Isso", M: T.motivoPadrao }) };
  const quantos = Math.max(1, Math.floor(Number(p.quantos) || 1));
  const nome = quantos > 1 ? `${quantos} ${u.varios}` : `1 ${u.um}`;
  const sup = obj(f.suprimentos) || {};
  const tem = Math.max(0, Number(sup[u.id]) || 0);
  if (tem < quantos) return { ok: false, ficha, valor: 0, linha: tpl(T.falta, { N: tem, I: tem === 1 ? u.um : u.varios }) };
  const quem = obj(p.quem) ? str(p.quem.nome) : "";
  if (!quem) return { ok: false, ficha, valor: 0, linha: tpl(T.semComprador, { I: maiuscula(nome), M: str(p.motivo).trim() || T.motivoPadrao }) };
  const valor = Math.max(1, Math.floor((Number(p.preco) || 0) * quantos * V.revenda));
  const nova = { ...f, moedas: (Number(f.moedas) || 0) + valor, suprimentos: { ...sup, [u.id]: tem - quantos } };
  return { ok: true, ficha: nova, valor, linha: tpl(T.vendido, { I: nome, Q: aQuem(quem), V: valor, B: nova.moedas }) };
}
