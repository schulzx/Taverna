/* ============================================================
   O CONFERENTE DA PROSA (o Mestre que conhece a cena, etapa 4 · 21/11/2026)
   src/motor/o-conferente-da-prosa.js — mente/lancamento/o-mestre-vivo.md §24

   A quinta sessão jogada com o Mestre vivo (mestre-vivo-sessao-5.md) viu o
   Narrador receber a ficha da cena na pauta (§22) e ignorá-la: a tela
   disse que a espada se compra nas bancas e a prosa vendeu e entregou a
   espada, com as moedas e a mochila intactas; o cordão e os botões
   «entregues» nunca entraram na bolsa; a gazua e a lâmina que a ficha nega
   foram narradas em uso; uma pessoa da cena falou em quase todo turno,
   respondeu por quem a frase chamou e repetiu a mesma fala quatro vezes; e
   três ações do jogador nem foram narradas. O veto antes da narração não
   basta: é preciso conferir a resposta DEPOIS de escrita.

   A REGRA DE MESA, do sistema e sem IA (nenhuma chamada nova — o pior caso
   continua a ser UMA chamada por turno): entre a resposta do Narrador e a
   tela, nesta ordem de preferência,
     a. PODA a frase que afirma o que o sistema não fez neste turno:
        · objeto que muda de mão para o herói e o sistema não lhe deu (a
          régua é a da memória do inventado, `oInventadoDaProsa`, com o que
          o jogador pediu ou comprou SEM folga, mais as cabeças daqui);
        · pagamento ou venda quando a bolsa não mexeu (`pagou === false`);
        · a arma ou a ferramenta que a frase diz ser do herói e a ficha
          não tem («arrombo com a minha gazua», «saco a minha espada»);
        · a fala de quem não está na lista da cena (a gente que a prosa
          inventou) e de quem está mas fala fora da vez (abaixo);
     b. quando a poda deixa a prosa vazia (ou curta demais), o sistema
        escreve no lugar a LINHA DE TROCA, por tabela — curta, em fala de
        mesa, sem nome de mecanismo;
     c. NÃO refaz a chamada: o jogo não tem orçamento de retentativa de
        conteúdo (as duas tentativas de `chamarMestre` são da ligação que
        cai), e chamada nova por turno é custo novo.

   QUEM RESPONDE. Com alvo no veredito (a quem a frase fala), a resposta é
   dele. Outra pessoa da cena que fala ou age está FORA DA VEZ quando a
   frase não a nomeia e: o alvo não aparece na prosa (ela respondeu no
   lugar); ou ela já tomou a palavra nos últimos `vez` turnos; ou repete a
   própria fala da última vez; ou fala comprido demais num turno que é de
   outro. A memória (quem falou, em que turno, o quê) é só de sessão: quem
   chama a guarda num ref e a devolve a cada turno.

   A AÇÃO NÃO SOME. Com um veredito julgado (o dado rolou), se a prosa não
   diz nem o alvo, nem a coisa da frase, nem uma palavra da família da ação
   (escalar → subir, telhado; furtar → mão, bolsa), o sistema põe à frente a
   linha do resultado, por tabela.

   21/11 (sessão 6 do Mestre vivo, mestre-vivo-sessao-6.md): dez disparos e
   nenhuma linha no lugar; a prosa ficou com «ela» sem ninguém antes. Agora:
     · CORTOU, REPÕE — a primeira cortada de cada razão (objeto, pagamento,
       meio) dá lugar a uma linha da tabela `reposicao`, pela semente do turno;
     · A ÓRFÃ SAI — a frase logo depois de uma cortada que abre referindo o
       que sumiu (`orfa`) vai junto;
     · QUEM NÃO ESTÁ NÃO FALA — `ausente` (a ficha disse que não está aqui):
       a fala e a ação com ele por sujeito saem;
     · O ÊXITO NA FALHA — o dado falhou numa travessia e a frase diz que
       você conseguiu (`exitoNaFalha`): sai, e a linha da falha entra.

   21/11 (sessão 7 do Mestre vivo, mestre-vivo-sessao-7.md): 17 turnos de
   prosa contra a ficha. Agora, só quando se SABE que nada mudou de mão (a
   bolsa antes e depois, `oQueEntrou`):
     · O COMPANHEIRO NÃO PAGA NEM ENTREGA por você (`companheiro`);
     · O FIGURANTE NÃO ENTREGA o que a frase pediu, nem por gesto nem por
       fala («— Leva.», `entregaFalada`);
     · O ACHADO FANTASMA — o que a frase manda levar perde a folga;
   e sempre: o que a linha do sistema nomeou neste turno (o relicário do
   achado) fica; o ausente que abre a frase com um verbo de chegada sai
   (`posicao`); a fala colada à frase cortada vai com ela.

   MENÇÃO NÃO É PRESENÇA (memory/portao-morde-so-o-necessario.md): falar DE
   alguém ausente pode, o ausente FALAR não; o jogador nomear uma espada não
   é a espada mudar de mão; «você não tem gazua» fica; a lança do guarda é
   do guarda. Os pares que separam os dois lados estão na suíte.

   Puro, sem React, sem relógio, sem sorte. Lixo devolve a prosa como veio
   e nunca lança. Provado em testes/teste-o-conferente-da-prosa.mjs.
   ============================================================ */
import { oInventadoDaProsa, aGenteInventadaDaProsa, MEMORIA_DO_INVENTADO } from "./memoria-do-inventado.js";
import { podarOAusente } from "./poda-do-ausente.js";
/* 21/11 (a nona sessão, T34): a moeda do suborno que não saiu da bolsa — a leitura é a do veredito da troca */
import { oSubornoDaFrase } from "../o-veredito-da-troca.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const txt = (x) => (typeof x === "string" ? x.trim() : "");
const sem = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
const palavras = (s) => sem(s).replace(/[^a-z0-9-]+/g, " ").trim().split(/\s+/).filter(Boolean);
const primeiro = (n) => palavras(String(n || "").split(",")[0])[0] || "";

/* ---------------- A TABELA ---------------- */
export const O_CONFERENTE = Object.freeze({
  porque: "a quinta sessão viu o Narrador ignorar a ficha da cena: o veto antes da narração não basta, e a resposta é conferida depois de escrita, sem chamada nova",
  /* a pessoa da cena fala, sem ser chamada, no máximo uma vez a cada `vez` turnos */
  vez: 3,
  /* a fala de quem não foi chamado, num turno que é de outro: até estas letras */
  curta: 180,
  /* a palavra que faz a fala ser do assunto da frase (a nona sessão, T46: «Recife Funda») */
  palavraDoAssunto: 5,
  /* a mesma fala de novo: a fração de palavras em comum (de quatro letras ou mais) */
  parecido: 0.5,
  minPalavrasDaFala: 4,
  /* a prosa que sobra com menos letras do que isto não se sustenta: troca
     (uma frase curta e inteira — «A praça ferve.» — ainda é cena) */
  minLetras: 12,
  /* quantas pessoas a memória de falas guarda */
  memoria: 12,
  /* o que o conferente conta como objeto que muda de mão, além da tabela da
     memória do inventado (o cordão da rede que o velho «entregou») */
  maisObjetos: Object.freeze({ cordao: "o", cordel: "o" }),
  /* o verbo de pedir ou comprar na frase: o que vem depois dele o jogador
     PEDIU, e pedir não é ter (a folga da frase não vale) */
  pede: /\b(compro|comprar|compra|adquiro|adquirir|peco|pedir|pede|quero|me da|me de|me passa|me vende|me empresta|empresta|vende|regateio|regatear|pechincho|pechinchar|barganho)\b(.*)$/,
  /* a arma ou a ferramenta que a frase diz ser do herói: depois do possessivo
     ou do «com» instrumental (nunca «armado de lança», que é de outro) */
  meuMeio: /\b(minha|meu|minhas|meus|com a|com o|com as|com os|com uma|com um)\s+(?:(?:minha|meu|minhas|meus|velha|velho|pequena|pequeno|boa|bom)\s+)?([a-z]+)/g,
  /* as famílias de arma e de ferramenta: a cabeça e os nomes da mesma coisa */
  meios: Object.freeze([
    Object.freeze(["espada", "lamina", "adaga", "punhal", "faca", "sabre", "gladio"]),
    Object.freeze(["machado", "machadinha"]),
    Object.freeze(["martelo", "marreta", "clava", "maca-de-armas"]),
    Object.freeze(["lanca", "alabarda", "pique"]),
    Object.freeze(["arco", "flecha", "flechas", "besta", "virote"]),
    Object.freeze(["gazua", "gazuas", "ferramentas", "ferramenta", "grampo", "grampos"]),
    Object.freeze(["pe-de-cabra", "alavanca"]),
  ]),
  /* o pagamento: o verbo com o herói por sujeito e a moeda perto; o comprar
     e o pagar dele; o vender ao herói */
  pagar: Object.freeze({
    verbos: Object.freeze(["paga", "pagou", "pagas", "compra", "comprou", "estende", "estendeu", "entrega", "entregou", "conta", "contou", "deixa", "deixou", "poe", "pos", "larga", "largou", "atira", "atirou", "empurra", "empurrou", "passa", "passou", "deu"]),
    soComMoeda: Object.freeze(["estende", "estendeu", "entrega", "entregou", "conta", "contou", "deixa", "deixou", "poe", "pos", "larga", "largou", "atira", "atirou", "empurra", "empurrou", "passa", "passou", "deu"]),
    /* «da» fica de fora (é também a preposição), e a bolsa (a mão passa na bolsa sem pagar) */
    moeda: Object.freeze(["moeda", "moedas", "cobre", "cobres", "prata", "pratas", "ouro", "dinheiro"]),
    vende: /\b(vende-lhe|vendeu-lhe|lhe vende|lhe vendeu|vende-te|te vende|vende a voce|vendeu a voce)\b/,
    janela: 6,
  }),
  /* O DAR AO HERÓI com a coisa ANTES do verbo («corta um pedaço de corda e
     entrega-lhe»): a régua da memória lê o objeto depois do verbo, e este
     escapava. Só morde a coisa que a frase PEDIU (ou a família dela) e que o
     herói não tem: pedir ao velho um cordão e a prosa pô-lo na mão. */
  daAoHeroi: /\b(entrega|estende|passa|poe|deixa|da|oferece|joga|atira|devolve|empresta)-(lhe|lho|lha|lhos|lhas|te|to|ta)\b|\blhe (entrega|entregou|estende|estendeu|passa|passou|poe|pos|da|deu|oferece|ofereceu|joga|atira|devolve|empresta)\b|\b(entrega|entregou|estende|estendeu|passa|passou|oferece|ofereceu|joga|atira|devolve|empresta) (a|para) voce\b|\b(na|em) sua mao\b|\bnas suas maos\b/,
  /* os nomes da mesma coisa pedida */
  doPedido: Object.freeze([
    Object.freeze(["corda", "cordao", "cordel", "fio", "barbante"]),
    Object.freeze(["moeda", "moedas", "cobre", "trocado"]),
    Object.freeze(["mapa", "carta", "bilhete"]),
    /* 21/11 (sessão 7, turnos 29 e 59): o frasco pedido que virou «um vidro», e a tocha */
    Object.freeze(["frasco", "vidro", "vidrinho", "garrafa", "ampola"]),
    Object.freeze(["tocha", "archote"]),
  ]),
  heroi: Object.freeze(["voce", "tu"]),
  posse: Object.freeze(["sua", "seu", "suas", "seus"]),
  /* o que nega a frase inteira; o «sem» só nega a coisa logo depois dele
     («sem gazua»), nunca o gesto («entrega-lho sem olhar») */
  nega: Object.freeze(["nao", "nem", "nunca", "jamais", "nenhum", "nenhuma", "falta", "faltam"]),
  /* o dono da arma, logo depois dela: «a lança do guarda», «a faca dela» */
  /* e a arma sem o herói na frase só morde no começo dela («A lâmina encosta
     no pescoço»): «o guarda ergue a espada» é a espada do guarda */
  meioNoComeco: 3,
  doOutro: /^\s*(de|do|da|dos|das|dele|dela|deles|delas)\b/,
  /* as palavras do alvo que não o identificam */
  vazias: Object.freeze(["quem", "atende", "banca", "dono", "dona", "aqui", "esta", "isso", "isto", "aquele", "aquela", "para", "pela", "pelo", "com", "sobre", "que"]),
  /* a família da ação dita na prosa: um começo de palavra basta */
  trata: Object.freeze({
    travessia: Object.freeze(["sub", "escal", "trep", "salt", "pul", "nad", "telhad", "alto", "topo", "cima", "agarr", "despenc", "cai", "queda", "equilibr"]),
    forcar: Object.freeze(["forc", "ced", "rang", "trinc", "estal", "arromb", "abr", "tranc", "cadead", "fechadur", "tamp", "ombro"]),
    furtar: Object.freeze(["mao", "dedo", "bolsa", "cinto", "furt", "surrup", "afan", "pulso"]),
    procurar: Object.freeze(["procur", "revir", "vascul", "busc", "encontr", "acha", "nada", "vazio", "fundo"]),
    esgueirar: Object.freeze(["escond", "sombra", "esgueir", "vist", "repar", "silenc", "passo"]),
    saber: Object.freeze(["lembr", "sabe", "memori", "recorda"]),
  }),
  /* A LINHA DO RESULTADO: o que aconteceu, em fala de mesa. {alvo} só nas
     linhas com nome; sem nome, a forma impessoal. Nenhuma fala de dado,
     teste, regra ou sistema. */
  resultado: Object.freeze({
    travessia: Object.freeze({ ok: "Você chega aonde queria.", falha: "Você não consegue." }),
    forcar: Object.freeze({ ok: "Cede ao seu esforço.", falha: "Não cede." }),
    furtar: Object.freeze({ ok: "Você consegue, sem que percebam.", falha: "Percebem a sua mão." }),
    procurar: Object.freeze({ ok: "Você procura com cuidado.", falha: "Você procura, e não acha nada." }),
    esgueirar: Object.freeze({ ok: "Ninguém repara em você.", falha: "Alguém repara em você." }),
    saber: Object.freeze({ ok: "Você se lembra.", falha: "Nada lhe vem à memória." }),
    convencer: Object.freeze({ ok: "{alvo} se deixa convencer.", falha: "{alvo} não se deixa convencer.", okSem: "Se deixam convencer.", falhaSem: "Não se deixam convencer." }),
    intimidar: Object.freeze({ ok: "{alvo} recua diante de você.", falha: "{alvo} não se intimida.", okSem: "Recuam diante de você.", falhaSem: "Não se intimidam." }),
    enganar: Object.freeze({ ok: "{alvo} acredita em você.", falha: "{alvo} não acredita em você.", okSem: "Acreditam em você.", falhaSem: "Não acreditam em você." }),
    ler_pessoa: Object.freeze({ ok: "Você lê o rosto de {alvo}.", falha: "{alvo} não deixa transparecer nada.", okSem: "Você lê o rosto de quem ouve.", falhaSem: "Ninguém deixa transparecer nada." }),
    atuar: Object.freeze({ ok: "Prendem os olhos em você.", falha: "Ninguém presta atenção." }),
    animal: Object.freeze({ ok: "O bicho se acalma.", falha: "O bicho não se acalma." }),
    socorrer: Object.freeze({ ok: "Você consegue cuidar disso.", falha: "Não melhora." }),
    rastrear: Object.freeze({ ok: "Você acha o rastro.", falha: "Você perde o rastro." }),
    arcano: Object.freeze({ ok: "Você entende o que vê.", falha: "Você não entende o que vê." }),
    outro: Object.freeze({ ok: "Você consegue.", falha: "Não dá certo." }),
  }),
  /* A LINHA DE TROCA: quando a poda leva a prosa inteira e não há
     resultado a dizer, o que de fato ficou, pela razão da poda */
  troca: Object.freeze({
    objeto: "Nada passa para a sua mão.",
    pagamento: "Nenhuma moeda sai da sua bolsa.",
    meio: "Você não tem isso com você.",
    fala: "Ninguém responde por enquanto.",
    inventada: "Ninguém mais está aqui.",
    ausente: "Ninguém responde ao chamado.",
    companheiro: "Ninguém paga nem entrega por você.",
    entrega: "Nada passa para a sua mão.",
    recusa: "A coisa passa para a sua mão.",
  }),
  /* 21/11 (sessão 6 do Mestre vivo): CORTOU, REPÕE. O conferente disparou dez
     vezes e só cortou: a venda, a entrega e o pagamento sumiam e nada dizia o
     que de fato valia. Agora a primeira frase cortada de cada razão dá lugar a
     uma linha destas, escolhida pela semente do turno (mesma frase, mesmo
     turno, mesma linha). Voz do Mestre, sem nome de mecanismo. */
  reposicao: Object.freeze({
    objeto: Object.freeze(["Nada muda de mão.", "A coisa não chega à sua mão.", "Por ora, nada passa para você."]),
    pagamento: Object.freeze(["As moedas seguem na sua bolsa.", "A troca não se fecha, e a sua bolsa continua como estava.", "Nenhuma moeda sai da sua bolsa."]),
    meio: Object.freeze(["Você não tem isso com você.", "Sua mão procura e não acha a ferramenta.", "Isso não está com você."]),
    /* 21/11 (sessão 7): o companheiro não paga nem entrega por você — {nome} é o primeiro nome dele */
    companheiro: Object.freeze(["{nome} leva a mão à bolsa e para; a decisão é sua.", "{nome} não mexe na bolsa.", "{nome} hesita, e a bolsa fica fechada."]),
  }),
  /* 22/11 (a décima sessão, T10): A TROCA QUE O SISTEMA FEZ PELO CARTÃO. «vendo
     duas rações ao elfo» foi vendida pelo cartão «Vender» antes de o turno
     partir — e a bolsa, lida quando a frase chegou, já tinha as moedas. O
     conferente não via troca nenhuma (`troca: false`), cortou «Estende-lhe um
     punhado de coroas…», que era a venda, e repôs «Nada muda de mão», falso. A
     linha que o sistema escreveu neste turno diz o que mudou de mão: com ela, a
     troca é aplicada, a moeda que a prosa conta é a dela, e nenhuma linha que
     negue a troca entra no lugar de uma cortada. */
  /* 22/11 (a décima primeira sessão, T20): o «◉ −3 moedas» do cartão «Pagar» também é troca feita */
  linhaDeTroca: /^(?:🛒 Vendido:|🛒 .+ — ◉ \d+ \(restam ◉|◉ \d+ moedas? mudaram de mão|◉ −\d+ moedas?$|🤲 Da bolsa|🤲 Você recolhe|🎁 .+ lhe dá:|🤝 .+ passa a você:|🤝 .+ agora é de|✋ Você arranca)/u,
  moedaDaTroca: Object.freeze(["moeda", "moedas", "coroa", "coroas", "cobre", "cobres", "prata", "pratas", "ouro", "ouros", "tostao", "tostoes", "peca", "pecas", "dinheiro"]),
  /* as razões cuja linha de reposição nega que algo mudou de mão: nunca com a troca aplicada */
  negamATroca: Object.freeze(["objeto", "pagamento", "entrega", "desfaz"]),
  /* 22/11 (a décima primeira sessão, T33 e T52): A PROSA QUE DESFAZ A TROCA FEITA.
     A compra e a venda já estavam aplicadas (a ficha mudou, a linha estava na
     tela), e a prosa escreveu «Ele não aceita… O armazém é do outro lado da
     praça», «Não compro hoje» e o ferreiro devolveu a brigantina ao balcão. Numa
     frase de comprar, vender ou pagar com a troca aplicada, a frase (ou a fala)
     que recusa, devolve ou põe as moedas de volta sai. O troco não é devolução. */
  fraseComercial: /\b(compro|compramos|comprei|vendo|vendemos|vendi|pago|pagamos|paguei|dou|damos|ofereco|oferecemos|entrego)\b/,
  desfazATroca: /\bnao\s+(?:a\s+|o\s+|as\s+|os\s+|lhe\s+|te\s+)?(?:aceita|aceito|aceitamos|aceitam|compro|compra|compramos|compram|vendo|vende|vendemos|quero\s+(?:o\s+seu|a\s+sua|seu|sua|as\s+suas|suas)\s+(?:moedas?|dinheiro)|fecho\s+negocio|faco\s+negocio)\b|\brecus\w*\s+(?:(?:a|o|as|os|suas|seu|sua)\s+)?(?:moedas?|dinheiro|oferta|venda|compra|pagamento|troca)\b|\bmoedas\s+(?:voltam|volta|ficam|continuam|seguem)\s+(?:ao|no|na|em|com)\s+(?:seu|sua|voce)\b|\b(?:a|o|as|os)\s+devolve\w*\s+(?:a|ao|para|pra|no|na|sobre)\b|\bdevolve\w*\s+(?:a|o|as|os)\s+(?!troco)[a-z]+|\bempurra\w*\s+(?:a|o|as|os)\s+[a-z]+\s+de\s+volta\b/,
  /* a recusa de quem o sistema fez entregar (a décima sessão, T31) */
  /* 22/11 (a décima segunda sessão, T51): «Tônico? Já o dei a ti, Ingrid. Não tens memória…» — a recusa por «já dei» */
  recusaDaEntrega: /\b(agora nao|ainda nao|nao (?:te |lhe |vou )?(?:dou|devolvo|entrego|passo|largo)|nao vou (?:dar|devolver|entregar)|fico com (?:ela|ele|isso|isto|a |o )|guardei|guardo eu|e minha|e meu|ja (?:(?:o|a|os|as|te|lhe|lho|lha|to|ta|voce)\s+){0,2}(?:dei|devolvi|entreguei|passei)|nao (?:tens|tem) memoria)\b/,
  /* 22/11 (a décima segunda sessão, T50): a coisa que o herói DEU ao companheiro
     não se gasta na prosa («vira de um gole») — o sistema só a passou à bolsa dele */
  consomeODado: /\b(bebe|bebeu|vira|virou|engole|engoliu|toma|tomou|come|comeu|gasta|gastou|esvazia|esvaziou|destampa|destampou)\b/,
  coisaQueSeGasta: /\b(gole|goles|trago|frasco|rolha|garrafa|odre|cantil)\b/,
  /* 22/11 (a décima segunda sessão, T33): «— O mapa é seu.» com a compra que não fechou */
  posseDada: /\b(e (?:seu|sua|teu|tua|todo seu|toda sua|de voce)|fica com voce|pode levar|leve(?:-o|-a)?|leva(?:-o|-a)?)\b/,
  /* a linha que o sistema escreveu quando a compra da frase não fechou (bolsa-da-frase.js, falaDaCompra) */
  linhaDeCompraNegada: /^(?:✋ Qual delas:|◉ Não chega:|◉ .+ custa ◉ \d+ .+ não paga|🛒 .+ não se vende neste balcão)/u,
  coisaDaCompra: /\b(?:compro|compramos|comprar|levo|quero)\s+(?:(?:o|a|os|as|um|uma|uns|umas)\s+)?([a-z]{3,})/,
  /* A FRASE ÓRFÃ: a que vem logo depois de uma cortada e abre referindo o que
     sumiu — o pronome sujeito («Ela espera a resposta»), o «isso», o «com ela
     na mão», o «os olhos dele», ou o gesto sem sujeito («Não tira os olhos de
     você»). Só a vizinha imediata, só no começo da frase: o pronome no meio de
     uma frase com antecedente próprio não é órfão. */
  orfa: Object.freeze({
    pronome: Object.freeze(["ela", "ele", "elas", "eles", "isso", "isto", "aquilo"]),
    dono: Object.freeze(["dele", "dela", "deles", "delas"]),
    antes: Object.freeze(["nao", "nem", "ainda", "ja", "so", "apenas"]),
    gesto: Object.freeze(["tira", "desvia", "espera", "aguarda", "sorri", "acena", "encara", "cruza", "suspira", "bufa", "assente", "resmunga", "embolsa", "recolhe", "guarda", "observa",
      /* 21/11 (sessão 7, turno 12: «Junta as mãos no avental e aproxima-se…» depois do corte do ausente) */
      "junta", "aproxima-se", "levanta-se", "ergue-se", "vira-se", "inclina-se", "solta", "puxa"]),
    /* 21/11 (sessão 7, turno 19: «… diz ele» sem ninguém antes): a etiqueta
       da fala com pronome por sujeito, no começo da frase */
    etiqueta: Object.freeze(["diz", "responde", "murmura", "resmunga", "completa", "sussurra", "pergunta", "acrescenta", "retruca"]),
  }),
  /* 21/11 (sessão 7, turnos 7, 29 e 59; sessão 6, «Dagny estende a moeda»):
     O COMPANHEIRO QUE PAGA OU ENTREGA POR CONTA PRÓPRIA. O sujeito é alguém
     do grupo (os nomes vêm da cena do turno, `do_grupo`) e o sistema não
     registrou troca nenhuma neste turno (moeda não saiu nem entrou, nada
     entrou na bolsa). `soPaga`: o verbo basta; os outros pedem moeda perto,
     o herói por destino, ou (os de `daCoisa`) a coisa que a frase nomeia.
     Fica: opinar, recusar, oferecer-se («posso pagar»), e a mão que só se
     estende (`mao`: «estende a mão» não é dar coisa nenhuma). */
  companheiro: Object.freeze({
    verbos: Object.freeze(["paga", "pagou", "compra", "comprou", "entrega", "entregou", "estende", "estendeu", "joga", "jogou", "poe", "pos", "deixa", "deixou",
      "larga", "largou", "atira", "atirou", "empurra", "empurrou", "passa", "passou", "enfia", "enfiou", "desliza", "deslizou", "deu",
      /* 21/11 (a oitava sessão, T9): «Helga traz até você e a deixa perto da sua mão» */
      "traz", "trouxe"]),
    soPaga: Object.freeze(["paga", "pagou", "compra", "comprou"]),
    daCoisa: Object.freeze(["entrega", "entregou", "estende", "estendeu", "passa", "passou", "desliza", "deslizou"]),
    perto: 4,
    fecha: Object.freeze(["que", "quem", "mas", "enquanto", "quando", "porque", "voce", "tu"]),
    mao: Object.freeze(["mao", "maos", "braco", "bracos", "dedo", "dedos"]),
    /* a frase anterior com ele por sujeito (o primeiro nome abre a frase) leva o sujeito à seguinte, se ela abre com verbo ou pronome */
    abreOutro: Object.freeze(["o", "a", "os", "as", "um", "uma", "voce", "tu"]),
  }),
  /* 21/11 (sessão 7, turnos 26 e 29): O FIGURANTE QUE ENTREGA o que o
     sistema não deu. O gesto de dar com a coisa que a frase pediu (ou a
     família dela), sem troca registrada; e a fala que só entrega («— Leva.»),
     inteira, numa frase que pediu ou regateou. */
  dar: /\b(entrega|entregou|estende|estendeu|desliza|deslizou|empurra|empurrou|passa|passou|atira|atirou|joga|jogou)\b/,
  entregaFalada: Object.freeze(["leva", "pode levar", "e seu", "e sua", "e todo seu", "e toda sua", "toma", "tome", "fica com ele", "fica com ela", "aqui esta"]),
  /* 21/11 (sessão 7, turno 36): O ACHADO FANTASMA. «Pego a carta e guardo na
     mochila»: o que a frase manda levar perde a folga quando nada entrou na
     bolsa — a prosa não pode pô-lo na mochila. Ver e ler no lugar continua. */
  levar: /\b(pego|apanho|guardo|levo|recolho|embolso|enfio|meto|coloco|ponho)\b(.*)$/,
  /* 21/11 (a oitava sessão): com a troca negada, a frase que põe a coisa na mochila ou no bolso
     («a lâmina cabe na mochila», «some no fundo da mochila», «desliza para o bolso») */
  vaiAMochila: /\b(mochila|bolso|bolsa|alforje|sacola|algibeira|cinto|embolsa\w*|guarda\w*)\b/,
  /* a nona sessão (T34): o outro fica com a moeda do suborno («fechou os dedos em volta das cinco moedas e as guardou») */
  ficaComAMoeda: /\b(moedas?|cobres?|pratas?|dinheiro)\b[^.!?]*\b(guard\w*|embols\w*|enfi\w*|aceit\w*)\b|\b(guard\w*|embols\w*|fech\w* os dedos|aceit\w*|recolh\w*|pega\w*)\b[^.!?]*\b(moedas?|cobres?|pratas?|dinheiro)\b/,
  /* a nona sessão (T21, T17): o gesto que fecha a troca negada — solta a vela no balcão, tira o escudo das costas, estende */
  fechaACoisa: /\b(solt(a|ou)|empurr(a|ou)|tir(a|ou)|estend(e|eu)|entreg(a|ou)|devolv(e|eu)|sac(a|ou)|ofere(ce|ceu)|pass(a|ou)) (a|o|as|os|um|uma|seu|sua)\b/,
  /* e o furto que não rendeu: a prosa que guarda ou conta moedas na mão */
  guardaMoeda: /\b(moedas?|cobres?|pratas?|dinheiro)\b[^.!?]*\b(guarda\w*|embolsa\w*|palma|bolso|mao|maos|conta\w*|leva\w*)\b|\b(guarda\w*|embolsa\w*|leva\w*|conta\w*|mao|maos|palma)\b[^.!?]*\b(moedas?|cobres?|pratas?|dinheiro)\b|\b(guarda\w*|embolsa\w*)\b[^.!?]*\b(palma|bolso|algibeira)\b/,
  /* 21/11 (sessão 7, turno 51: «Sable sobe a escada devagar…» com a linha de
     que ela não está aqui): O AUSENTE PELA POSIÇÃO. O nome dele abrindo a
     frase e, logo depois, um destes verbos — de chegada e de gesto, alguns
     ambíguos («para»), por isso só nesta posição, nunca soltos na tabela da
     poda. «Para Neirin, isso…» e «fala para Neirin» ficam. */
  posicao: Object.freeze({
    abre: Object.freeze(["e", "entao", "logo"]),
    verbos: Object.freeze(["sobe", "desce", "para", "volta", "vem", "corre", "sai", "passa", "some", "junta", "solta", "larga", "puxa", "tira", "desvia", "encosta",
      "aproxima-se", "levanta-se", "ergue-se", "vira-se", "senta-se", "inclina-se", "adianta-se", "afasta-se"]),
  }),
  /* O ÊXITO NA FALHA: o dado falhou e a prosa conta que deu certo (sessão 6,
     turno 39: a fuga falhou e o texto pôs a heroína «do outro lado, de pé»).
     Estreito de propósito: só nas famílias abaixo, só com «você» por sujeito
     até `perto` palavras antes do verbo, nunca com negação, «quase» ou um
     «mas» na frase. O verbo de êxito basta; o de chegada só com o lugar
     alcançado nas `janela` palavras seguintes. */
  exitoNaFalha: Object.freeze({
    familias: Object.freeze(["travessia"]),
    perto: 3,
    janela: 6,
    verbos: Object.freeze(["consegue", "conseguiu", "escapa", "escapou", "despista", "despistou", "alcanca", "alcancou"]),
    chegada: Object.freeze(["esta", "chega", "chegou", "pousa", "pousou", "aterrissa", "aterrissou", "passa", "passou", "atravessa", "atravessou"]),
    lugares: Object.freeze(["do outro lado", "no topo", "em cima", "no alto", "a salvo", "fora do alcance", "longe dele", "longe deles"]),
    trava: Object.freeze(["quase", "mas", "porem", "contudo", "entretanto"]),
  }),
  /* o desafio da régua → a família do resultado (o mesmo mapa da régua,
     FAMILIA_DO_DESAFIO, só para os ids que o teste do turno guarda) */
  familiaDoDesafio: Object.freeze({
    buscar: "procurar", investigar: "procurar", escutar: "procurar", desarmar: "procurar",
    furtar_se: "esgueirar", seguir_alguem: "esgueirar", mentira: "ler_pessoa",
    lembrar: "saber", fraqueza: "saber", heraldica: "saber", orientar: "saber", arcano: "arcano",
    tranca: "forcar", forcar: "forcar", arrebentar: "forcar",
    escalar: "travessia", nadar: "travessia", saltar: "travessia", equilibrio: "travessia", escapar: "travessia", cavalgar: "travessia",
    rastrear: "rastrear", estancar: "socorrer", diagnosticar: "socorrer", aguentar: "socorrer",
    bater_carteira: "furtar", convencer: "convencer", fazer_falar: "convencer", impressionar: "convencer",
    intimidar: "intimidar", mentir: "enganar", falsificar: "enganar", atuar: "atuar", acalmar_bicho: "animal",
  }),
});
const C = O_CONFERENTE;
const HEROI = new Set(C.heroi), POSSE = new Set(C.posse), NEGA = new Set(C.nega), VAZIAS = new Set(C.vazias);
const PAGAR = new Set(C.pagar.verbos), SO_MOEDA = new Set(C.pagar.soComMoeda), MOEDA = new Set(C.pagar.moeda);
const MEIO = new Map();
for (const f of C.meios) for (const p of f) MEIO.set(p, f);

/* ---------------- a prosa em pedaços ----------------
   Cada linha é dividida em frases; a linha que abre com travessão é um
   pedaço só (a fala e a etiqueta dela). `nar` é a parte narrada do pedaço
   (sem as falas): é nela que se lê o que a prosa AFIRMA. */
function pedacosDe(texto) {
  const out = [];
  String(texto).split("\n").forEach((linha, li) => {
    if (!linha.trim()) return;
    if (/^\s*[—–]/.test(linha)) {
      const nar = linha.trim().split(/[—–]/).filter((_, i) => i >= 2 && i % 2 === 0).join(" ");
      out.push({ li, texto: linha, nar: tirarAspas(nar), fala: true, linhaDeFala: true, citacao: false });
      return;
    }
    for (const m of linha.matchAll(/[^.!?…]+(?:[.!?…]+["»”']?|$)\s*/g)) {
      if (!m[0].trim()) continue;
      const antes = linha.slice(0, m.index);
      const dentro = ((antes.match(/[—–]/g) || []).length % 2) === 1;
      /* 21/11 (sessão 7, turnos 8 e 49): a fala entre aspas que a frase
         partiu em duas — o pedaço que começa dentro de aspas abertas é fala,
         não narração, e a aspa que abre sem fechar leva o resto dela */
      const emAspas = aspasAbertas(antes);
      const t0 = m[0].trim();
      const nar = dentro ? "" : semCitacao(m[0].replace(/[—–][^—–]*$/, ""), emAspas);
      out.push({ li, texto: m[0], nar, fala: dentro, emAspas, citacao: dentro || emAspas || /^[—–«“"]/.test(t0) || !/\p{L}/u.test(t0) });
    }
  });
  return out;
}
const tirarAspas = (s) => String(s).replace(/«[^»]*»/g, " ").replace(/“[^”]*”/g, " ").replace(/"[^"]*"/g, " ");
/* há aspas abertas no fim deste trecho? («, “ sem fecho, ou um número ímpar de ") */
function aspasAbertas(s) {
  const t = String(s);
  const n = (rx) => (t.match(rx) || []).length;
  return n(/«/g) > n(/»/g) || n(/“/g) > n(/”/g) || n(/"/g) % 2 === 1;
}
/* a parte narrada de um pedaço: sem a fala que vinha aberta de trás, sem as
   aspas fechadas e sem a aspa que abre e não fecha */
function semCitacao(s, emAspas) {
  let t = String(s);
  if (emAspas) { const k = t.search(/[»”"]/); t = k < 0 ? "" : t.slice(k + 1); }
  return tirarAspas(t).replace(/[«“"][^»”"]*$/, " ");
}
function remontar(texto, pedacos, fora, repoe) {
  const linhas = String(texto).split("\n");
  const porLinha = new Map();
  for (const p of pedacos) { if (!porLinha.has(p.li)) porLinha.set(p.li, []); porLinha.get(p.li).push(p); }
  const novas = [];
  const R = repoe instanceof Map ? repoe : new Map();
  linhas.forEach((linha, li) => {
    const ps = porLinha.get(li);
    if (!ps) { novas.push(linha); return; }
    /* a cortada que repõe dá lugar à linha, com o espaço que ela tinha */
    const fica = ps.map((p) => (!fora.has(p) ? p.texto : R.has(p) ? R.get(p) + ((p.texto.match(/\s+$/) || [" "])[0]) : "")).join("");
    if (fica.trim()) novas.push(fica.replace(/\s+$/, ""));
  });
  return novas.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/* ---------------- o que a frase pede, e o meio que diz ser dela ---------------- */
function pedidosDaFrase(frase) {
  const m = sem(frase).match(C.pede);
  return m ? palavras(m[2]) : [];
}
const temNaPosse = (cabeca, posses) => {
  const fam = MEIO.get(cabeca) || [cabeca];
  const ps = new Set(arr(posses).flatMap((n) => palavras(obj(n) ? n.nome : n)));
  return fam.some((c) => ps.has(c) || ps.has(c + "s"));
};
/* a palavra é uma coisa que se pega? (a tabela da memória, as cabeças daqui, as famílias do pedido) */
const ehCoisa = (x) => [x, x.replace(/s$/, ""), x.replace(/oes$/, "ao")].some((y) =>
  Object.prototype.hasOwnProperty.call(MEMORIA_DO_INVENTADO.objetos, y) || Object.prototype.hasOwnProperty.call(C.maisObjetos, y) || C.doPedido.some((f) => f.includes(y)));
/* a arma ou ferramenta que a frase diz ser do herói e ele não tem */
export function osMeiosNegados(frase, posses) {
  const t = sem(frase);
  const out = [];
  for (const m of t.matchAll(C.meuMeio)) {
    const c = m[2];
    if (MEIO.has(c) && !temNaPosse(c, posses) && !out.includes(c)) out.push(c);
  }
  return out;
}

/* ---------------- as leituras de um pedaço ---------------- */
const ws = (s) => [...sem(s).matchAll(/[a-z0-9]+(?:-[a-z0-9]+)*/g)].map((m) => m[0]);
const negadoNa = (w, coisas) => w.some((x, k) => NEGA.has(x) || (x === "sem" && !!coisas && [w[k + 1], w[k + 2]].some((y) => y && coisas.has(y))));
/* o herói é o sujeito do verbo em i: o pronome até quatro palavras antes, ou
   a mão dele («sua mão»); ou o verbo abre a frase e a anterior era dele */
function heroiFaz(w, i, heroiAntes) {
  for (let k = i - 1; k >= Math.max(0, i - 4); k--) {
    if (HEROI.has(w[k]) && !(k > 0 && ["a", "de", "para", "com", "por", "em"].includes(w[k - 1]))) return true;
    if (k > 0 && POSSE.has(w[k - 1]) && ["mao", "maos", "dedos", "dedo"].includes(w[k])) return true;
  }
  return heroiAntes && i <= 1;
}
function pagaNoPedaco(nar, heroiAntes) {
  const w = ws(nar);
  if (!w.length || negadoNa(w)) return false;
  if (C.pagar.vende.test(sem(nar))) return true;
  for (let i = 0; i < w.length; i++) {
    const base = w[i].split("-")[0];
    if (!PAGAR.has(base) || !heroiFaz(w, i, heroiAntes)) continue;
    if (!SO_MOEDA.has(base)) return true;
    if (w.slice(i + 1, i + 1 + C.pagar.janela).some((x) => MOEDA.has(x))) return true;
  }
  return false;
}
function meioNoPedaco(nar, negados) {
  if (!negados.length) return false;
  const w = ws(nar);
  const fams = new Set(negados.flatMap((c) => MEIO.get(c) || [c]));
  if (!w.length || negadoNa(w, fams)) return false;
  for (let k = 0; k < w.length; k++) {
    if (!fams.has(w[k])) continue;
    /* do herói: o pronome antes da palavra, ou «sua lâmina» */
    const doHeroi = w.slice(0, k).some((x) => HEROI.has(x)) || (k > 0 && POSSE.has(w[k - 1]));
    if (!doHeroi && k >= C.meioNoComeco) continue;
    /* o dono logo depois da palavra («a lança do guarda», «a faca dela») */
    if (!C.doOutro.test(w.slice(k + 1, k + 2).join(" "))) return true;
  }
  return false;
}

/* ---------------- quem é quem ---------------- */
function aPessoa(p) {
  const o = obj(p);
  if (!o) return null;
  const nome = txt(o.nome), papel = txt(o.papel);
  if (!nome && !papel) return null;
  return { nome, papel, doGrupo: arr(o.estados).includes("do_grupo") };
}
const ehOAlvo = (p, alvo) => {
  const a = sem(alvo).trim();
  if (!a) return false;
  if (p.nome && primeiro(p.nome) === primeiro(alvo)) return true;
  const pp = sem(p.papel).trim();
  return !!pp && (pp.includes(a) || a.includes(pp));
};
const chavesDoAlvo = (alvo, pessoas) => {
  const p = pessoas.find((x) => x.nome && ehOAlvo(x, alvo));
  const k = palavras(alvo).filter((x) => x.length >= 4 && !VAZIAS.has(x));
  return [...new Set([...(p ? [primeiro(p.nome)] : []), ...k])];
};
const temAlguma = (texto, chaves) => {
  const w = new Set(ws(texto));
  return chaves.some((k) => w.has(k));
};
const comecaCom = (texto, raizes) => ws(texto).some((x) => raizes.some((r) => x.startsWith(r)));
function parecida(a, b) {
  const A = new Set(ws(a).filter((x) => x.length >= 4)), B = new Set(ws(b).filter((x) => x.length >= 4));
  if (A.size < C.minPalavrasDaFala || B.size < C.minPalavrasDaFala) return false;
  let n = 0;
  for (const x of A) if (B.has(x)) n++;
  return n / Math.min(A.size, B.size) >= C.parecido;
}
/* quem fala ou age na prosa, e o quê: a régua da poda do ausente (sujeito de
   verbo de ação ou de fala, a etiqueta da fala, a fala colada), sem podar */
function quemTomaAPalavra(texto, pessoas, heroi) {
  const nomeados = pessoas.filter((p) => p.nome).map((p) => ({ nome: p.nome, onde: "", morto: false }));
  if (!nomeados.length) return new Map();
  const r = podarOAusente(texto, nomeados, { frase: "", outros: [heroi].filter(Boolean), limiar: 1, semTravaDaFala: true });
  const out = new Map();
  for (const p of r.podadas) out.set(p.nome, [...(out.get(p.nome) || []), p.frase]);
  return out;
}

/* ---------------- a semente, a órfã e o êxito na falha (21/11, sessão 6) ---------------- */
/* FNV-1a de 32 bits: a mesma frase no mesmo turno escolhe a mesma linha em qualquer máquina */
function semente(s) {
  let h = 0x811c9dc5;
  for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
export function linhaDeReposicao(motivo, chave) {
  const L = C.reposicao[motivo];
  if (!L || !L.length) return "";
  return L[semente(`${chave}|${motivo}`) % L.length];
}
const PRONOME_ORFAO = new Set(C.orfa.pronome), DONO_ORFAO = new Set(C.orfa.dono), ANTES_ORFAO = new Set(C.orfa.antes), GESTO_ORFAO = new Set(C.orfa.gesto);
/* a frase abre referindo o que a cortada levou? (só o começo dela) */
export function ehOrfa(frase) {
  const w = ws(frase);
  if (!w.length) return false;
  if (PRONOME_ORFAO.has(w[0])) return true;
  if (w[0] === "com" && PRONOME_ORFAO.has(w[1])) return true;
  if (["o", "a", "os", "as"].includes(w[0]) && DONO_ORFAO.has(w[2])) return true;
  /* «… diz ele.»: a etiqueta com pronome, que só tinha dono na frase que saiu */
  if (ETIQUETA_ORFA.has(w[0]) && ["ele", "ela", "eles", "elas"].includes(w[1])) return true;
  const k = ANTES_ORFAO.has(w[0]) ? 1 : 0;
  return GESTO_ORFAO.has(w[k]);
}
const ETIQUETA_ORFA = new Set(C.orfa.etiqueta);
/* as frases do texto ORIGINAL que a prosa de agora ainda tem, na ordem; a que
   ficou logo depois de uma que saiu e abre órfã sai também (e a seguinte, se
   for órfã da órfã). Devolve a prosa sem elas e as frases tiradas. */
function cortarOrfas(original, atual) {
  const ps = pedacosDe(original);
  let cursor = 0, saiu = false;
  const tirar = [];
  for (const p of ps) {
    const k = p.texto.trim();
    const i = k ? atual.indexOf(k, cursor) : -1;
    if (i < 0) { saiu = true; continue; }
    cursor = i + k.length;
    /* 21/11 (sessão 7): a fala colada à frase que saiu (o travessão na mesma
       linha, a aspa que ela abriu) é de quem saiu, e vai junto; a órfã logo
       depois dela também (o «Ela solta o pergaminho» do turno 49) */
    if (saiu && (p.citacao || (!p.fala && ehOrfa(p.texto)))) { tirar.push({ i, k }); continue; }
    saiu = false;
  }
  if (!tirar.length) return { texto: atual, orfas: [] };
  let s = atual;
  /* a marca \u0001 diz «aqui havia texto»: a linha que fica só com ela sai inteira */
  for (const { i, k } of [...tirar].reverse()) s = s.slice(0, i) + "\u0001" + s.slice(i + k.length);
  s = s.split("\n").filter((l) => !/^[\s\u0001]+$/.test(l) || !l.includes("\u0001"))
    .map((l) => l.replace(/\u0001/g, "").replace(/[ \t]{2,}/g, " ").trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { texto: s, orfas: tirar.map((x) => x.k) };
}
const VERBO_EXITO = new Set(C.exitoNaFalha.verbos), CHEGADA = new Set(C.exitoNaFalha.chegada), TRAVA_EXITO = new Set(C.exitoNaFalha.trava);
/* a frase narra que o herói conseguiu? (para o veredito de falha) */
export function contaOExito(nar) {
  const w = ws(nar);
  if (!w.length || negadoNa(w) || w.some((x) => TRAVA_EXITO.has(x))) return false;
  const E = C.exitoNaFalha;
  for (let i = 0; i < w.length; i++) {
    const doHeroi = w.slice(Math.max(0, i - E.perto), i).some((x) => HEROI.has(x));
    if (!doHeroi) continue;
    if (VERBO_EXITO.has(w[i])) return true;
    if (CHEGADA.has(w[i])) {
      const depois = " " + w.slice(i + 1, i + 1 + E.janela).join(" ") + " ";
      if (E.lugares.some((l) => depois.includes(" " + l + " "))) return true;
    }
  }
  return false;
}

/* ---------------- a bolsa antes e depois (21/11, sessão 7) ----------------
   O conferente só diz «o sistema não deu» quando SABE: o retrato da bolsa
   quando a frase chegou e o de agora. aBolsaAgora(personagem) → { moedas,
   itens: [nome], usos: { racoes, agua, tochas } }; oQueEntrou(antes, agora)
   → { sabe, ganhou, entrou: [nome] } — `entrou` é a diferença com repetição
   (a segunda Erva Amarga conta), e o uso que subiu entra com o nome dele. */
const USOS = Object.freeze(["racoes", "agua", "tochas"]);
export function aBolsaAgora(personagem) {
  const p = obj(personagem);
  if (!p) return null;
  const nomeDe = (x) => txt(obj(x) ? x.nome : x);
  const sup = obj(p.suprimentos) || {};
  const usos = {};
  for (const u of USOS) if (Number.isFinite(Number(sup[u]))) usos[u] = Number(sup[u]);
  return Object.freeze({
    moedas: Number.isFinite(Number(p.moedas)) ? Number(p.moedas) : null,
    itens: Object.freeze([...arr(p.inventario), ...Object.values(obj(p.equipado) || {})].map(nomeDe).filter(Boolean)),
    usos: Object.freeze(usos),
  });
}
export function oQueEntrou(antes, agora) {
  const a = obj(antes), d = obj(agora);
  if (!a || !d) return Object.freeze({ sabe: false, ganhou: false, entrou: Object.freeze([]) });
  const resta = [...arr(a.itens)];
  const entrou = [];
  for (const n of arr(d.itens)) { const k = resta.indexOf(n); if (k >= 0) resta.splice(k, 1); else entrou.push(n); }
  const ua = obj(a.usos) || {}, ud = obj(d.usos) || {};
  for (const u of USOS) if (Number.isFinite(ua[u]) && Number.isFinite(ud[u]) && ud[u] > ua[u]) entrou.push(u);
  const ganhou = Number.isFinite(a.moedas) && Number.isFinite(d.moedas) && d.moedas > a.moedas;
  return Object.freeze({ sabe: true, ganhou, entrou: Object.freeze(entrou) });
}

/* ---------------- o companheiro que paga ou entrega (21/11, sessão 7) ----------------
   → o nome dele (o de `comps`) quando a frase o põe a pagar ou a entregar,
   ou "". `comps`: [{ nome, p }] (p = o primeiro nome sem acento); `antes`:
   o companheiro que abriu a frase anterior (o sujeito que segue); `coisas`:
   as palavras da frase do jogador (a coisa pedida). */
const COMP = C.companheiro;
const COMP_VERBO = new Set(COMP.verbos), COMP_SO_PAGA = new Set(COMP.soPaga), COMP_DA_COISA = new Set(COMP.daCoisa), COMP_FECHA = new Set(COMP.fecha), COMP_MAO = new Set(COMP.mao), COMP_ABRE_OUTRO = new Set(COMP.abreOutro);
const raiz = (x) => x.replace(/s$/, "");
function companheiroQueDa(nar, comps, antes, coisas, outros) {
  const w = ws(nar);
  if (!w.length || !comps.length || negadoNa(w)) return "";
  const destino = C.daAoHeroi.test(sem(nar)) || /\b(a|para|ate) voce\b/.test(sem(nar));
  const temMoeda = w.some((x) => MOEDA.has(x));
  const temCoisa = w.some((x) => x.length >= 4 && coisas.has(raiz(x)) && ehCoisa(x));
  for (let i = 0; i < w.length; i++) {
    const base = w[i].split("-")[0];
    if (!COMP_VERBO.has(base)) continue;
    /* «estende a mão» não dá nada */
    if (COMP_MAO.has(w[i + 1]) || (["a", "o", "as", "os"].includes(w[i + 1]) && COMP_MAO.has(w[i + 2]))) continue;
    let quem = "";
    for (let k = i - 1; k >= Math.max(0, i - 1 - COMP.perto); k--) {
      if (COMP_FECHA.has(w[k]) || outros.has(w[k])) break;
      const c = comps.find((x) => x.p === w[k]);
      if (c) { quem = c.nome; break; }
    }
    if (!quem && antes && !COMP_ABRE_OUTRO.has(w[0]) && !outros.has(w[0]) && !w.slice(0, i).some((x) => HEROI.has(x))) quem = antes;
    if (!quem) continue;
    if (COMP_SO_PAGA.has(base) || temMoeda || destino || (COMP_DA_COISA.has(base) && temCoisa)) return quem;
  }
  return "";
}

/* o gesto de dar (`dar`) com uma coisa por objeto — «estende a mão» não é dar */
function daACoisa(nar) {
  const w = ws(nar);
  return w.some((x, i) => C.dar.test(x) && !COMP_MAO.has(w[i + 1]) && !(["a", "o", "as", "os"].includes(w[i + 1]) && COMP_MAO.has(w[i + 2])));
}

/* a fala de um pedaço (o que está entre o travessão ou as aspas), ou "" */
function falaDoPedaco(p) {
  const t = String(p.texto).trim();
  if (p.linhaDeFala) return t.split(/[—–]/)[1] || "";
  if (/^[—–]/.test(t)) return t.slice(1).split(/[—–]/)[0];
  if (p.fala) return t.split(/[—–]/)[0];
  if (p.emAspas) return t.split(/[»”"]/)[0];
  const m = t.match(/^[«“"]([^»”"]*)/);
  return m ? m[1] : "";
}
const ENTREGA_FALADA = new Set(C.entregaFalada);
/* a fala que só entrega: inteira (`tudo`), ou — na linha que é só de fala —
   a primeira frase dela, e o resto da linha fica (`resto`). null sem. */
function entregaNaFala(p) {
  const f = falaDoPedaco(p);
  if (ENTREGA_FALADA.has(palavras(f).join(" "))) return { tudo: true, resto: "" };
  if (p.linhaDeFala) {
    const m = f.match(/^\s*([^.!?…]+)[.!?…]+\s*\S/);
    if (m && ENTREGA_FALADA.has(palavras(m[1]).join(" "))) return { tudo: false, resto: String(p.texto).replace(/^(\s*[—–]\s*)[^.!?…]+[.!?…]+\s*/, "$1") };
  }
  return null;
}

/* ---------------- o ausente pela posição (21/11, sessão 7, turno 51) ----------------
   O nome do ausente abrindo a frase, com um verbo da tabela logo depois: a
   frase sai, e a fala colada a ela (o travessão na mesma linha; a linha de
   fala seguinte, se a frase fechava a linha) vai junto. → { texto, frases } */
const POS_VERBO = new Set(C.posicao.verbos), POS_ABRE = new Set(C.posicao.abre);
function oAusentePelaPosicao(texto, nome) {
  const todo = palavras(String(nome || "").split(",")[0]);
  if (!todo.length) return { texto, frases: [] };
  const formas = [todo];
  if (todo.length > 1 && todo[0].length >= 4) formas.push([todo[0]]);
  const ps = pedacosDe(texto);
  const fora = new Set();
  let arrasta = false, ultimaLi = -1;
  for (let j = 0; j < ps.length; j++) {
    const p = ps[j];
    if (p.li !== ultimaLi && p.linhaDeFala && arrasta) { fora.add(p); continue; }
    if (p.li !== ultimaLi) arrasta = false;
    ultimaLi = p.li;
    if (p.linhaDeFala || p.citacao) continue;
    const t = String(p.texto).trim();
    const w = ws(t);
    let k = POS_ABRE.has(w[0]) ? 1 : 0;
    const f = formas.find((fm) => fm.every((x, n) => w[k + n] === x));
    if (!f) continue;
    /* o nome escreve-se com maiúscula, e nada entre ele e o verbo (nem vírgula, nem «?») */
    const cru = t.split(/\s+/);
    if (!/^\p{Lu}/u.test(cru[k] || "")) continue;
    const depoisDoNome = cru.slice(k, k + f.length).join(" ");
    if (/[,;:?!.…]$/.test(depoisDoNome)) continue;
    if (!POS_VERBO.has(w[k + f.length])) continue;
    fora.add(p);
    /* a fala colada, na mesma linha */
    let n = j + 1;
    while (n < ps.length && ps[n].li === p.li && ps[n].citacao) { fora.add(ps[n]); n++; }
    arrasta = n >= ps.length || ps[n].li !== p.li;
    j = n - 1;
  }
  if (!fora.size) return { texto, frases: [] };
  return { texto: remontar(texto, ps, fora, null), frases: ps.filter((p) => fora.has(p)).map((p) => p.texto.trim()) };
}

/* a família do resultado: a do desafio que rolou, senão a do veredito */
export function linhaDoResultado(familia, sucesso, alvo) {
  const L = C.resultado[familia] || C.resultado.outro;
  const a = txt(alvo);
  const comNome = a && /^\p{Lu}/u.test(a);
  if (L.okSem && !comNome) return sucesso ? L.okSem : L.falhaSem;
  return (sucesso ? L.ok : L.falha).replace("{alvo}", a);
}

/* ============================================================
   quemFicaCalado(falas, turno, { frase, alvo, pessoas }) → [nome]
   Quem tomou a palavra nos últimos `vez` turnos e a quem a frase não se
   dirige (nem é o alvo): vai ao veto da ficha da cena ANTES da narração
   (fichaDaCenaNaPauta, `calados`). A mesma régua da poda, um passo antes.
   ============================================================ */
export function quemFicaCalado(falas, turno, ctx) {
  try {
    const f = obj(falas) || {};
    const c = obj(ctx) || {};
    const n = Number(turno);
    if (!Number.isFinite(n)) return [];
    const naFrase = new Set(palavras(c.frase));
    const nomes = arr(c.pessoas).map(aPessoa).filter((p) => p && p.nome).map((p) => p.nome);
    return nomes.filter((nome) => {
      const m = obj(f[primeiro(nome)]);
      if (!m || !Number.isFinite(m.turno) || n - m.turno >= C.vez) return false;
      if (naFrase.has(primeiro(nome))) return false;
      return !(txt(c.alvo) && primeiro(c.alvo) === primeiro(nome));
    });
  } catch {
    return [];
  }
}

/* ============================================================
   conferirAProsa(narrativa, ctx) →
     { narrativa, podadas: [{ motivo, frase }], troca, frente, falas, repostas }
   ctx: {
     frase      — a do jogador, neste turno;
     cena       — a cena do momento ({ pessoas: [{ nome, papel, estados }] });
     alvo       — a quem a frase fala (momento.alvo), ou "";
     aoGrupo    — a frase fala ao grupo (momento.aoGrupo);
     familia    — a família da ação julgada (familiaDaAcao), ou "";
     teste      — o teste do turno ({ sucesso, desafio }) ou null (sem dado);
     coisa      — a coisa em que a frase mexe (aCoisaDaFrase), ou "";
     negados    — o que o sistema negou neste turno (semFolga);
     posses     — o que é do herói (inventário e equipado);
     estado     — o da memória do inventado (o cânone);
     lugarDoTurno, mundo — idem;
     pagou      — a bolsa mexeu neste turno: true | false | null (não se sabe);
     heroi      — o nome do herói;
     turno      — o da pauta;
     falas      — a memória de quem falou ({ [primeiro nome]: { turno, fala } });
     ausente    — quem a frase chamou e a ficha diz que não está aqui
                  (quemNaoEstaNaCena: { nome, onde, morto }), ou null;
     entrou     — (21/11, sessão 7) oQueEntrou(antes, agora): a bolsa quando
                  a frase chegou e a de agora ({ sabe, ganhou, entrou }), ou null;
     doSistema  — (21/11) as linhas que o sistema escreveu neste turno ([texto])
   }
   `troca`: a linha que o sistema pôs no lugar da prosa (""), `frente`: a
   do resultado posta à frente (""). `falas`: a memória nova (objeto novo).
   `repostas`: as linhas que entraram no lugar de uma cortada (21/11).
   ============================================================ */
export function conferirAProsa(narrativa, ctx) {
  const texto = typeof narrativa === "string" ? narrativa : "";
  const c = obj(ctx) || {};
  const falas0 = obj(c.falas) || {};
  const nada = { narrativa: texto, podadas: [], troca: "", frente: "", falas: falas0, repostas: [] };
  if (!texto.trim()) return nada;
  try {
    const frase = txt(c.frase);
    const naFrase = new Set(palavras(frase));
    const turno = Number.isFinite(Number(c.turno)) ? Number(c.turno) : null;
    const pessoas = arr(obj(c.cena) ? c.cena.pessoas : null).map(aPessoa).filter(Boolean);
    const alvo = txt(c.alvo);
    const heroi = txt(c.heroi);
    const podadas = [];

    /* 21/11 (sessão 7): o que o sistema de fato fez neste turno. `semTroca`
       só quando se SABE (a bolsa mexeu ou não; o retrato antes e depois) e
       nada mudou de mão; `doSistema` são as palavras das linhas que o
       sistema escreveu neste turno (o achado, a venda): o que elas nomeiam
       o sistema deu, e a prosa que o conta fica. */
    const bolsa = obj(c.entrou);
    /* 21/11 (a oitava sessão): O VEREDITO DA TROCA é o fato único do turno.
       Aplicada: o que ela passou de mão fica na prosa (nada dela se corta).
       Negada: sabe-se que nada mudou de mão por ela, e o fecho inventado sai. */
    /* 22/11 (a décima segunda sessão, T33): a compra da frase que não fechou
       («✋ Qual delas…») é troca negada, com a coisa que a frase quis comprar */
    const linhaCN = !obj(c.troca) ? arr(c.doSistema).map(txt).find((l) => C.linhaDeCompraNegada.test(l)) : "";
    const coisaCN = linhaCN ? ((sem(txt(c.frase)).match(C.coisaDaCompra) || [])[1] || "") : "";
    const tv = obj(c.troca) || (linhaCN && coisaCN ? { tipo: "compra", estado: "negada", coisa: coisaCN, linha: linhaCN } : null);
    /* 22/11 (a décima sessão, T10): a linha de troca que o sistema escreveu neste turno (o cartão da venda) */
    const linhasDeTroca = arr(c.doSistema).map(txt).filter((l) => C.linhaDeTroca.test(l));
    const trocaAplicada = !!(tv && tv.estado === "aplicada") || linhasDeTroca.length > 0;
    const trocaNegada = !!(tv && tv.estado === "negada") && !linhasDeTroca.length;
    const transferiu = trocaAplicada || c.pagou === true || !!(bolsa && (bolsa.ganhou || arr(bolsa.entrou).length));
    const sabeBolsa = trocaNegada || trocaAplicada || c.pagou === true || c.pagou === false || !!(bolsa && bolsa.sabe);
    const semTroca = sabeBolsa && !transferiu;
    const daTroca = tv && tv.estado === "aplicada" ? arr(tv.mudou).map((x) => txt(obj(x) ? x.coisa : x)) : [];
    /* a moeda da troca aplicada é a que a prosa conta («um punhado de coroas»): o sistema a deu */
    const moedaDaTroca = trocaAplicada && (linhasDeTroca.some((l) => /◉/.test(l)) || daTroca.includes("moedas")) ? C.moedaDaTroca : [];
    const doSistema = new Set([...ws(arr(c.doSistema).join(" ")), ...ws(arr(bolsa && bolsa.entrou).join(" ")), ...ws(daTroca.join(" ")), ...moedaDaTroca].filter((x) => x.length >= 4).map(raiz));
    /* a coisa que a troca negada quis guardar, e o furto que não rendeu: a frase que a põe na mochila ou no bolso */
    /* 21/11 (a nona sessão, T21 a vela, T17 o escudo): toda negada que tem coisa (o de graça, o companheiro, o tomar), não só o pegar */
    const coisaNegada = trocaNegada && txt(tv.coisa) ? palavras(txt(tv.coisa)).filter((x) => x.length >= 4 && !VAZIAS.has(x)).map(raiz) : [];
    const furtoNegado = trocaNegada && tv.tipo === "furto";
    const subornoDaFrase = (() => { try { return oSubornoDaFrase(frase); } catch { return false; } })();
    /* a. as afirmações: o objeto, o pagamento, o meio */
    const meiosNegados = [...new Set([...osMeiosNegados(frase, c.posses), ...arr(c.negados).flatMap(palavras).filter((x) => MEIO.has(x) && !temNaPosse(x, c.posses))])];
    const pedidos = pedidosDaFrase(frase).filter((x) => !temNaPosse(x, c.posses));
    /* o que a frase manda levar, sem nada ter entrado: sem folga (o achado fantasma) */
    const levados = semTroca ? (() => { const m = sem(frase).match(C.levar); return m ? palavras(m[2]).filter((x) => ehCoisa(x) && !temNaPosse(x, c.posses)) : []; })() : [];
    const semFolga = [...new Set([...arr(c.negados).map(txt).filter(Boolean), ...pedidos, ...meiosNegados, ...levados])];
    /* o grupo, a coisa pedida e quem mais está na cena (para o sujeito do companheiro) */
    /* só numa frase de troca (pagar, dar, pedir, comprar) ou que fala com ele: o
       companheiro que paga a própria bebida numa frase de olhar em volta fica */
    const fraseDeTroca = C.pede.test(sem(frase)) || /\b(pago|pagar|dou|dar|ofereco|oferecer|entrego|entregar)\b/.test(sem(frase));
    const comps = pessoas.filter((p) => p.doGrupo && p.nome && !(heroi && primeiro(p.nome) === primeiro(heroi)))
      .map((p) => ({ nome: p.nome, p: primeiro(p.nome) })).filter((k) => fraseDeTroca || naFrase.has(k.p));
    const coisasDaFrase = new Set(palavras(frase).filter((x) => x.length >= 4 && !VAZIAS.has(x) && !comps.some((k) => k.p === x)).flatMap((x) => [raiz(x), ...(C.doPedido.find((f) => f.includes(x) || f.includes(raiz(x))) || []).map(raiz)]));
    const outrosNomes = new Set(pessoas.filter((p) => p.nome && !p.doGrupo).map((p) => primeiro(p.nome)));
    const pediu = C.pede.test(sem(frase)) || C.levar.test(sem(frase));
    const quemPagou = new Map(), restoDaFala = new Map();
    const opc = { frase, lugarDoTurno: txt(c.lugarDoTurno), maisObjetos: C.maisObjetos, ...(semFolga.length ? { semFolga } : {}) };
    const E = obj(c.estado) || {};
    const pedacos = pedacosDe(texto);
    const fora = new Set();
    /* 21/11: a razão de cada cortada, para a linha que repõe */
    const razao = new Map();
    const familia = (c.teste && C.familiaDoDesafio[txt(c.teste.desafio)]) || txt(c.familia);
    const julgou = !!(c.teste && typeof c.teste.sucesso === "boolean");
    const linhaRes = julgou ? linhaDoResultado(familia, c.teste.sucesso, alvo) : "";
    const exitoNaFalha = julgou && c.teste.sucesso === false && C.exitoNaFalha.familias.includes(familia);
    let anterior = "", compAntes = "", cortouACoisa = false;
    /* 22/11 (a décima sessão, T31): «Isolde, me devolve a maçã» — o sistema
       passou a maçã («🤝 Isolde passa a você: Maçã seca»), e a prosa a fez
       recusar («Agora não… Pediste para guardar. Guardei»). O companheiro que o
       sistema fez entregar não recusa na prosa: a fala ou a frase que recusa sai. */
    const entregouOComp = !!(tv && tv.estado === "aplicada" && tv.tipo === "companheiro");
    /* 22/11 (a décima primeira sessão, T33, T52): a troca aplicada numa frase de comprar, vender ou pagar não se desfaz na prosa */
    const naoDesfaz = trocaAplicada && !entregouOComp && C.fraseComercial.test(sem(frase));
    /* 22/11 (a décima segunda sessão, T50): o herói deu uma coisa a quem anda com ele */
    const deuAoComp = !!(tv && tv.estado === "aplicada" && tv.tipo === "dar" && pessoas.some((p) => p.doGrupo && arr(tv.mudou).some((x) => obj(x) && primeiro(txt(x.para)) === primeiro(p.nome))));
    const coisaDada = deuAoComp ? arr(tv.mudou).flatMap((x) => palavras(txt(obj(x) ? x.coisa : ""))).filter((x) => x.length >= 4 && !VAZIAS.has(x)).map(raiz) : [];
    for (const p of pedacos) {
      if (entregouOComp && C.recusaDaEntrega.test(sem(p.texto)) && !C.daAoHeroi.test(sem(p.nar))) {
        fora.add(p); razao.set(p, "recusa"); podadas.push({ motivo: "recusa", frase: p.texto.trim() });
        continue;
      }
      /* 22/11 (a décima segunda sessão, T50): o que o herói deu ao companheiro não se gasta na prosa */
      if (deuAoComp && C.consomeODado.test(sem(p.texto)) && (C.coisaQueSeGasta.test(sem(p.texto)) || ws(p.texto).map(raiz).some((w) => coisaDada.includes(w)))) {
        fora.add(p); razao.set(p, "consome"); podadas.push({ motivo: "consome", frase: p.texto.trim() });
        continue;
      }
      /* 22/11 (a décima segunda sessão, T33): a compra que não fechou não passa a coisa por «é seu» */
      if (trocaNegada && coisaNegada.length && C.posseDada.test(sem(p.texto)) && ws(p.texto).map(raiz).some((w) => coisaNegada.includes(w))) {
        fora.add(p); razao.set(p, "objeto"); podadas.push({ motivo: "objeto", frase: p.texto.trim() });
        continue;
      }
      if (naoDesfaz && C.desfazATroca.test(sem(p.texto))) {
        fora.add(p); razao.set(p, "desfaz"); podadas.push({ motivo: "desfaz", frase: p.texto.trim() });
        continue;
      }
      /* 21/11 (sessão 7, turnos 26 e 29): a fala que só entrega («— Leva.»)
         sem troca nenhuma, numa frase que pediu ou regateou */
      if (semTroca && pediu && (p.fala || p.citacao || p.linhaDeFala)) {
        const e = entregaNaFala(p);
        if (e) {
          fora.add(p); razao.set(p, "entrega");
          if (!e.tudo) restoDaFala.set(p, e.resto);
          podadas.push({ motivo: "entrega", frase: e.tudo ? p.texto.trim() : String(falaDoPedaco(p)).trim() });
          continue;
        }
      }
      if (!p.nar.trim()) continue;
      const heroiAntes = /\b(voce|tu)\b/.test(sem(anterior));
      /* o dado falhou e a frase conta que deu certo: sai, e o resultado entra no lugar */
      if (exitoNaFalha && contaOExito(p.nar)) { fora.add(p); razao.set(p, "exito"); podadas.push({ motivo: "exito", frase: p.texto.trim() }); anterior = p.nar; compAntes = ""; continue; }
      /* o meio negado primeiro: a gazua «enfiada» é também objeto, e a razão é o meio */
      let motivo = meioNoPedaco(p.nar, meiosNegados) ? "meio" : "";
      /* 21/11 (sessão 7): o companheiro que paga ou entrega por você, sem troca */
      if (!motivo && semTroca && comps.length) {
        const q = companheiroQueDa(p.nar, comps, compAntes, coisasDaFrase, outrosNomes);
        if (q) { motivo = "companheiro"; quemPagou.set(p, q); }
      }
      if (!motivo) try {
        const antes = anterior ? oInventadoDaProsa(anterior, E, opc).map((o) => o.nome) : [];
        const agora = oInventadoDaProsa(`${anterior ? anterior.replace(/[.!?…\s]*$/, ". ") : ""}${p.nar}`, E, opc)
          .filter((o) => ["pega", "recebe", "guarda"].includes(o.como) && !antes.includes(o.nome))
          /* 21/11 (sessão 7): o que a linha do sistema nomeou neste turno (o relicário do achado) foi dado — fica */
          .filter((o) => !ws(o.nome).some((x) => x.length >= 4 && doSistema.has(raiz(x))));
        if (agora.length) motivo = "objeto";
      } catch { /* a régua do objeto não abre: segue sem ela */ }
      if (!motivo && pedidos.length && !(sabeBolsa && transferiu) && !negadoNa(ws(p.nar))
        && (C.daAoHeroi.test(sem(p.nar)) || (semTroca && daACoisa(p.nar) && !ws(p.nar).slice(0, 4).some((x) => HEROI.has(x))))) {
        const coisas = pedidos.filter(ehCoisa);
        const fam = new Set(coisas.flatMap((x) => [x, ...(C.doPedido.find((f) => f.includes(x) || f.includes(x.replace(/s$/, ""))) || [])]));
        if (ws(p.nar).some((x) => fam.has(x) && !temNaPosse(x, c.posses) && x.length >= 3)) motivo = "objeto";
      }
      if (!motivo && c.pagou === false && pagaNoPedaco(p.nar, heroiAntes)) motivo = "pagamento";
      /* 21/11 (a oitava sessão, T19, T57, T58): «A lâmina cabe na mochila», «a corda curta some no fundo da mochila», «o espelho desliza para o bolso» */
      if (!motivo && coisaNegada.length && C.vaiAMochila.test(sem(p.nar)) && ws(p.nar).some((x) => coisaNegada.includes(raiz(x)))) motivo = "objeto";
      /* a nona sessão (T21: «soltou a vela sobre o balcão… Torvald guardou-a na trouxa»; T17: «tirou o escudo das costas»): com a troca negada, a frase que estende, solta, entrega ou guarda a coisa negada sai */
      if (!motivo && coisaNegada.length && !negadoNa(ws(p.nar)) && (C.daAoHeroi.test(sem(p.nar)) || C.vaiAMochila.test(sem(p.nar)) || C.fechaACoisa.test(sem(p.nar))) && ws(p.nar).some((x) => coisaNegada.includes(raiz(x)))) motivo = "objeto";
      /* a nona sessão (T34): o suborno que não saiu da bolsa e a prosa em que o outro guarda as moedas */
      if (!motivo && c.pagou === false && subornoDaFrase && C.ficaComAMoeda.test(sem(p.nar)) && !negadoNa(ws(p.nar))) motivo = "pagamento";
      /* a coisa negada que a frase seguinte guarda pelo pronome («Torvald guarda-a na trouxa») */
      if (!motivo && coisaNegada.length && cortouACoisa && /\b\w+-(a|o|as|os)\b|\b(a|o) (guard\w*|pe\w*|recolh\w*|enfi\w*)\b/.test(sem(p.nar)) && C.vaiAMochila.test(sem(p.nar).replace(/-(a|o|as|os)\b/g, " ")) && !negadoNa(ws(p.nar))) motivo = "objeto";
      /* 21/11 (a oitava sessão, T37): sem troca nenhuma, alguém estende ao herói uma coisa («Fenna estende a você um alfinete de prata») */
      if (!motivo && semTroca && !trocaAplicada && C.daAoHeroi.test(sem(p.nar)) && daACoisa(p.nar) && !negadoNa(ws(p.nar)) && ws(p.nar).some((x) => x.length >= 4 && ehCoisa(x) && !temNaPosse(x, c.posses))) motivo = "objeto";
      /* 21/11 (a oitava sessão, T33): o furto que não rendeu e a prosa que guarda moedas */
      if (!motivo && furtoNegado && C.guardaMoeda.test(sem(p.nar)) && !negadoNa(ws(p.nar))) motivo = "objeto";
      if (motivo) { fora.add(p); razao.set(p, motivo); podadas.push({ motivo, frase: p.texto.trim() }); }
      cortouACoisa = motivo === "objeto" && coisaNegada.length > 0;
      anterior = p.nar;
      /* o companheiro que abre esta frase segue sujeito da próxima */
      const w0 = ws(p.nar)[0] || "";
      compAntes = (comps.find((k) => k.p === w0) || {}).nome || (["ela", "ele"].includes(w0) ? compAntes : "");
    }
    /* CORTOU, REPÕE: a primeira cortada de cada razão dá lugar à linha dela */
    const repoe = new Map();
    const repostas = [];
    const chave = `${frase}|${turno == null ? "" : turno}`;
    for (const p of pedacos) {
      const m = razao.get(p);
      if (!m) continue;
      /* a linha de fala que só abria com a entrega: fica o resto dela */
      if (restoDaFala.has(p)) { repoe.set(p, restoDaFala.get(p).replace(/\s+$/, "")); continue; }
      /* com a troca negada, a linha dela já está na tela: a prosa não repete o sistema */
      if (trocaNegada && txt(tv.linha) && m !== "exito") continue;
      /* a décima sessão (T10): com a troca aplicada, nenhuma linha diz que nada mudou de mão */
      if (trocaAplicada && C.negamATroca.includes(m)) continue;
      const linha = m === "exito" ? linhaRes
        /* a fala que entrega só repõe quando nada mais repôs (o gesto ao lado já disse) */
        : m === "entrega" ? (repostas.length ? "" : linhaDeReposicao("objeto", chave))
        : m === "companheiro" ? linhaDeReposicao(m, chave).replace("{nome}", String(quemPagou.get(p) || "").split(/\s+/)[0])
        : linhaDeReposicao(m, chave);
      if (!linha || repostas.includes(linha)) continue;
      repoe.set(p, linha);
      repostas.push(linha);
    }
    let prosa = fora.size ? remontar(texto, pedacos, fora, repoe) : texto;

    /* 21/11: QUEM NÃO ESTÁ NÃO FALA. A ficha disse que a pessoa chamada não
       está aqui (quemNaoEstaNaCena); a fala e a ação que a prosa lhe dá saem.
       Só com ela por sujeito ou na etiqueta da fala — a régua da poda do
       ausente; falar DELA continua a valer. Antes da gente inventada: quem a
       ficha conhece e diz ausente não é inventado. A frase não protege o
       nome aqui (foi ele quem o chamou, e é por isso que a prosa o trouxe). */
    const aus = obj(c.ausente) && txt(c.ausente.nome) ? [{ nome: txt(c.ausente.nome), onde: txt(c.ausente.onde), morto: !!c.ausente.morto }] : [];
    if (aus.length && prosa.trim()) {
      const pa = primeiro(aus[0].nome);
      const outros = pessoas.map((p) => p.nome).filter((n) => n && primeiro(n) !== pa);
      const r = podarOAusente(prosa, aus, { frase: "", outros: [...outros, heroi].filter(Boolean), limiar: 1, semTravaDaFala: true });
      for (const p of r.podadas) podadas.push({ motivo: "ausente", frase: p.frase });
      if (r.podadas.length) prosa = r.narrativa;
      /* 21/11 (sessão 7, turno 51): o verbo que a poda não conhece
         («Sable sobe a escada»), pela posição — o nome abrindo a frase */
      if (prosa.trim()) {
        const pp = oAusentePelaPosicao(prosa, aus[0].nome);
        for (const f of pp.frases) podadas.push({ motivo: "ausente", frase: f });
        if (pp.frases.length) prosa = pp.texto;
      }
    }
    /* 22/11 (a décima primeira sessão, T34, T45, T47): QUEM O SISTEMA SABE NOUTRO
       LUGAR NÃO FALA AQUI — nem chamado. Klaus, que a ficha punha na Casa do
       Pistão, falou no Pêndulo; Yolanda, ausente, «não se deixa convencer».
       `ausentes`: quem o sistema conhece e sabe fora desta cena (osAusentes); a
       fala dele sai (falar DELE continua a valer). Quem está na cena não entra. */
    const jaAus = aus.length ? primeiro(aus[0].nome) : "";
    const ausentesOutros = arr(c.ausentes).map((a) => (obj(a) ? { nome: txt(a.nome), onde: txt(a.onde), morto: !!a.morto } : { nome: txt(a), onde: "", morto: false }))
      .filter((a) => a.nome && primeiro(a.nome).length >= 3 && primeiro(a.nome) !== jaAus && !pessoas.some((p) => primeiro(p.nome) === primeiro(a.nome)) && !(heroi && primeiro(heroi) === primeiro(a.nome)));
    if (ausentesOutros.length && prosa.trim()) {
      const r = podarOAusente(prosa, ausentesOutros, { frase: "", outros: [...pessoas.map((p) => p.nome).filter(Boolean), heroi].filter(Boolean), limiar: 1, semTravaDaFala: true, soFala: true });
      for (const p of r.podadas) podadas.push({ motivo: "ausente", frase: p.frase });
      if (r.podadas.length) prosa = r.narrativa;
    }
    /* b. quem fala: a gente inventada, e quem está fora da vez */
    const inventados = (() => {
      try { return aGenteInventadaDaProsa(prosa, E, { lugarDoTurno: txt(c.lugarDoTurno), mundo: c.mundo, conhecidos: pessoas.map((p) => p.nome).filter(Boolean) }).map((g) => g.nome); } catch { return []; }
    })();
    const tomam = quemTomaAPalavra(prosa, pessoas, heroi);
    /* o assunto é o NOME que a frase diz (o lugar, a pessoa, a coisa com nome: «Recife Funda») — falar
       do buraco que o herói revira não é assunto, é comentário (a oitava sessão, T28, continua a sair) */
    const assuntoDaFrase = new Set(txt(frase).split(/\s+/).slice(1).filter((w) => /^\p{Lu}/u.test(w)).flatMap(palavras).filter((x) => x.length >= C.palavraDoAssunto && !VAZIAS.has(x)).map(raiz));
    const naFraseAnterior = new Set(palavras(txt(c.fraseAnterior)));
    const foraDaVez = [];
    for (const p of pessoas) {
      if (!p.nome || (heroi && primeiro(p.nome) === primeiro(heroi))) continue;
      const diz = tomam.get(p.nome);
      if (!diz || !diz.length) continue;
      if (naFrase.has(primeiro(p.nome))) continue;
      if (c.aoGrupo && p.doGrupo) continue;
      if (alvo && ehOAlvo(p, alvo)) continue;
      const fala = diz.join(" ");
      const m = obj(falas0[primeiro(p.nome)]);
      const semEla = diz.reduce((s, f) => s.split(f).join(" "), prosa);
      const repete = !!m && txt(m.fala) && parecida(fala, m.fala);
      const noLugar = !!alvo && !temAlguma(semEla, chavesDoAlvo(alvo, pessoas));
      /* 21/11 (a nona sessão, T46 e T47; a oitava, T14): a fala de quem está em
         cena foi cortada como «fora da vez» quando era a resposta certa — Torvald
         sobre Recife Funda (a frase perguntava por Recife Funda) e Kael, com quem
         o herói falava no turno anterior. Quem fala DO ASSUNTO da frase, ou é o
         interlocutor da frase anterior, não está fora da vez: só a cópia de si
         mesmo e o tomar o lugar do alvo cortam. */
      const doAssunto = palavras(fala).some((x) => x.length >= C.palavraDoAssunto && !VAZIAS.has(x) && assuntoDaFrase.has(raiz(x)));
      const interlocutor = naFraseAnterior.has(primeiro(p.nome));
      const cedo = !doAssunto && !interlocutor && !!m && turno != null && Number.isFinite(m.turno) && turno - m.turno < C.vez && turno !== m.turno;
      const comprida = !doAssunto && !interlocutor && fala.length > C.curta && (!!alvo || !!c.teste);
      if ((repete && !interlocutor) || noLugar || cedo || comprida) foraDaVez.push(p.nome);
    }
    /* 21/11 (a oitava sessão, T28): a gente inventada sai inteira; quem está e
       fala fora da vez perde só a FALA — o gesto dela fica («Freya deixa cair a
       tábua e espera» foi cortado com motivo «fala») */
    const candidatos = [...inventados, ...foraDaVez].map((nome) => ({ nome, onde: "", morto: false }));
    for (const [lista, soFala] of [[inventados, false], [foraDaVez.filter((n) => !inventados.includes(n)), true]]) {
      if (!lista.length || !prosa.trim()) continue;
      const cand = lista.map((nome) => ({ nome, onde: "", morto: false }));
      const outros = pessoas.map((p) => p.nome).filter((n) => n && !candidatos.some((x) => x.nome === n));
      const r = podarOAusente(prosa, cand, { frase, outros: [...outros, heroi].filter(Boolean), limiar: 1, semTravaDaFala: true, soFala });
      for (const p of r.podadas) podadas.push({ motivo: soFala ? "fala" : "inventada", frase: p.frase });
      if (r.podadas.length) prosa = r.narrativa;
    }
    /* 21/11: a frase que ficou órfã do que saiu sai também */
    if (podadas.length && prosa.trim()) {
      const o = cortarOrfas(texto, prosa);
      for (const f of o.orfas) podadas.push({ motivo: "orfa", frase: f });
      prosa = o.texto;
    }

    /* c. a troca e a frente */
    let troca = "", frente = "";
    if (podadas.length && prosa.replace(/\s+/g, " ").trim().length < C.minLetras) {
      prosa = "";
      /* com a troca aplicada, a linha que nega a troca não entra (a décima sessão, T10) */
      if (!linhaRes) troca = trocaAplicada && C.negamATroca.includes(podadas[0].motivo) ? "" : C.troca[podadas[0].motivo] || C.troca.fala;
    }
    if (julgou) {
      const chaves = [...(alvo ? chavesDoAlvo(alvo, pessoas) : []), ...palavras(c.coisa).filter((x) => x.length >= 4 && !VAZIAS.has(x))];
      const raizes = C.trata[familia] || [];
      const trata = !!prosa && (prosa.includes(linhaRes) || temAlguma(prosa, chaves) || (raizes.length > 0 && comecaCom(prosa, raizes)));
      if (!trata) frente = linhaRes;
    }
    const final = [frente, troca, prosa].filter((x) => x && x.trim()).join("\n\n");

    /* a memória: quem tomou a palavra na prosa que vai à tela */
    const falas = { ...falas0 };
    if (turno != null) {
      for (const [nome, diz] of quemTomaAPalavra(final, pessoas, heroi)) {
        if (heroi && primeiro(nome) === primeiro(heroi)) continue;
        falas[primeiro(nome)] = Object.freeze({ turno, fala: diz.join(" ").slice(0, 400) });
      }
      const chaves = Object.keys(falas).sort((a, b) => (falas[b].turno || 0) - (falas[a].turno || 0));
      for (const k of chaves.slice(C.memoria)) delete falas[k];
    }
    if (!podadas.length && !frente) return { ...nada, falas };
    return { narrativa: final || texto, podadas, troca, frente, falas, repostas: repostas.filter((l) => final.includes(l)) };
  } catch {
    return nada;
  }
}

/* a memória do inventado e a do conferente falam do mesmo objeto: a suíte lê
   que as cabeças daqui não colidem com as dela */
export const CABECAS_DO_CONFERENTE = Object.freeze(Object.keys(C.maisObjetos).filter((k) => !Object.prototype.hasOwnProperty.call(MEMORIA_DO_INVENTADO.objetos, k)));
