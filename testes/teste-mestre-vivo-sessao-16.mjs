/* A DÉCIMA SEXTA SESSÃO DO MESTRE VIVO (23/11/2026) — uma porta só.
   mente/lancamento/mestre-vivo-sessao-16.md, §3 a §6: das 40 frases de troca,
   12 terminaram com linha, ficha e prosa de acordo (30%). O ouvido lia bem as
   fáceis; o que o derrubava era a ligação — duas portas respondendo (a antiga
   antes dele, às vezes sozinha), a cena errada (lojas como gente, «Mercy» longe
   com Mercy aqui, «Sais Aromáticos» do verbo «sai»), as leituras que o exame não
   cobriu (o pedido dirigido, o escambo, o pronome, tomar, guardar, o fiado, o
   troco, o preço), a pergunta que voltava igual, e o que se decidia e não ia à
   ficha.

   §1 as 40 frases, cada uma com a cena reconstruída do relatório (quem estava,
      o que o herói levava), pela função pura motor/uma-porta-so.js#aPortaUnica,
      contra a resposta de um mestre real — e EXATAMENTE uma resposta por frase;
   §2 a pergunta: a resposta completa a leitura, a mesma pergunta não volta,
      só candidatos válidos, um candidato não pergunta, o nomeado de fora nega;
   §3 a dupla resposta: com a chave, a frase de troca não abre porta antiga;
   §4 a fiação, lida no App.jsx;
   §5 a defesa (null, determinismo, imutabilidade, a voz da tela);
   §6 o veredito antes do clique: a quantia dita aplica direto, o preço do
      sistema vira o cartão de sempre, e nunca os dois.
   As cenas são reconstruídas do relatório: onde ele não diz (o ofício, o
   estoque exato das bancas, a fala do Mestre), a escolha está escrita ao lado. */
import { readFileSync } from "node:fs";
import { aPortaUnica, oFocoDaConversa, UMA_PORTA_SO } from "../src/motor/uma-porta-so.js";
import { aCenaDoOuvido, osPratosDaCasa, oVereditoDoOuvido } from "../src/motor/a-cena-do-ouvido.js";
import { oOuvido, asAcoesDaFrase } from "../src/o-ouvido.js";
import { aPropostaDaFrase } from "../src/motor/a-proposta-da-frase.js";
import { oSubornoDaFrase } from "../src/o-veredito-da-troca.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;
const ler = (rel) => readFileSync(new URL(rel, import.meta.url), "utf8");

/* ---------------- as peças das cenas ---------------- */
const LAVINIA = (inv = []) => ({ nome: "Lavinia Sallow", inventario: inv.map((nome) => ({ nome })) });
const SIMBOLO = { nome: "Símbolo sagrado riscado", tipo: "amuleto" };
const LIVRO = { nome: "O Livro dos Nomes", tipo: "missao" };
const POCAO = { nome: "Poção de Cura Média", tipo: "consumivel" };
/* as bancas da cidade (o relatório nomeia três lojas e o balcão; o estoque é o que a sessão mostrou:
   a tocha a ◉ 1 e a ração a ◉ 7 no balcão, os sais n'O Cálice do Vigia) */
const BANCAS = [
  { id: "geral|sino", nome: "O Sino Rachado", tipo: "geral", estoque: [{ nome: "Corda de cânhamo", preco: 2, tipo: "util" }] },
  { id: "rel|ancora", nome: "A Âncora do Sul", tipo: "relicario", estoque: [{ nome: "Amuleto de osso", preco: 9, tipo: "amuleto" }] },
  { id: "alq|calice", nome: "O Cálice do Vigia", tipo: "alquimia", estoque: [{ nome: "Sais Aromáticos", preco: 4, tipo: "consumivel" }] },
  { nome: "Balcão de mantimentos", estoque: [{ nome: "Ração", preco: 7, uso: "racoes" }, { nome: "Tochas", preco: 1, uso: "tochas" }] },
];
/* o que a casa serve (a tabela de preços comuns do cenário: o prato quente ◉ 3 que o cartão cobrou, a caneca ◉ 1) */
const CASA = osPratosDaCasa([{ rx: "\\b(sopas?|caldos?|ensopados?)\\b", preco: 3 }, { rx: "\\b(canecas?|cervejas?)\\b", preco: 1 }]);
const ficha = (moedas, inventario, extra = {}) => ({ moedas, inventario, equipamento: [], equipados: {}, suprimentos: { racoes: 2, agua: 1, tochas: 5, kit: false, ...(extra.suprimentos || {}) }, grupo: extra.grupo || [LAVINIA()] });
/* o mercado: o armazém compra o símbolo por ◉ 7 (a venda da frase 31), e a tocha revende-se a ◉ 1 o par (a da frase 51) */
const OFERTA = () => ({ valor: 7, quem: { id: "geral|sino", nome: "O Sino Rachado" } });
const OFERTA_DO_USO = (id, quantos) => ({ valor: Math.max(1, Math.floor(quantos / 2)), quem: { id: "geral|sino", nome: "O Sino Rachado" } });
const CTX = { ofertaDe: OFERTA, ofertaDoUso: OFERTA_DO_USO, vaiAoCorpo: ["arma", "escudo"] };

const cena = (o) => ({ lugar: o.lugar, pessoas: o.pessoas, grupo: (o.ficha.grupo || []), bancas: BANCAS, ausentes: o.ausentes || [], conhecidos: o.conhecidos || [], chao: o.chao || [], ficha: o.ficha, casa: o.casa || [], anteriores: o.anteriores || {} });
/* A Lâmpada dos Sonhos, no começo (frases 4–7): Mercy Quintus em cena, Mercy Ottoline longe (o registo a conhece) */
const LAMPADA_1 = (f, ant) => cena({ lugar: { nome: "A Lâmpada dos Sonhos", tipo: "taverna" }, pessoas: [{ nome: "Mercy Quintus", papel: "bardo" }, { nome: "Thomasine Nightingale", papel: "viajante" }], ausentes: [{ nome: "Mercy Ottoline", onde: "a casa dela" }], ficha: f, casa: CASA, anteriores: ant });
/* a praça, com Eudora (a chave no pescoço dela é coisa da cena — «Chave sem fechadura conhecida» aparecia em «Em cena») */
const PRACA = (f, ant) => cena({ lugar: { nome: "Praça de Armas do Afogado", tipo: "praca" }, pessoas: [{ nome: "Eudora Ottoline", papel: "" }, { nome: "Mordecai", papel: "sacristão" }, { nome: "Thaddeus Crane, a Coisa no Poço", papel: "" }], chao: [{ id: "k1", nome: "Chave sem fechadura conhecida" }], ficha: f, anteriores: ant });
/* o poço velho: Thaddeus e Mordecai (a frase 19 retomou «ele» como Mordecai) */
const POCO = (f, ant) => cena({ lugar: { nome: "o poço velho", tipo: "sitio" }, pessoas: [{ nome: "Thaddeus Crane, a Coisa no Poço", papel: "" }, { nome: "Mordecai", papel: "sacristão" }], ficha: f, anteriores: ant });
/* o balcão de mantimentos: a mulher atrás dele não tem nome no sistema */
const BALCAO = (f, ant) => cena({ lugar: { nome: "Balcão de mantimentos", tipo: "mercado" }, pessoas: [], ficha: f, anteriores: ant });
/* a capela, depois da quest: Mercy Quintus longe, Tabitha na capela, a poção no chão */
const CAPELA = (f, ant, chao) => cena({ lugar: { nome: "A Capela do Afogado", tipo: "templo" }, pessoas: [{ nome: "Tabitha", papel: "copista" }], ausentes: [{ nome: "Mercy Quintus", onde: "A Lâmpada dos Sonhos" }], chao: chao || [], ficha: f, anteriores: ant });
/* a torre do sino: ninguém (Constance só existe no passo da quest, que o sistema conhece pelo nome) */
const TORRE = (f, ant, conhecidos) => cena({ lugar: { nome: "a nave", tipo: "templo" }, pessoas: [], conhecidos: conhecidos === undefined ? ["Constance Mordaunt"] : conhecidos, ficha: f, anteriores: ant });
/* A Lâmpada dos Sonhos, no fim (frases 43–59): Charity serve a casa */
const LAMPADA_2 = (f, ant) => cena({ lugar: { nome: "A Lâmpada dos Sonhos", tipo: "taverna" }, pessoas: [{ nome: "Charity Mordaunt", papel: "taverneira" }, { nome: "Thomasine Nightingale", papel: "viajante" }, { nome: "Tabitha", papel: "copista" }, { nome: "Mercy Quintus", papel: "bardo" }], ficha: f, casa: CASA, anteriores: ant });

/* exatamente uma resposta: o veredito, a pergunta, o dado, o recolher ou o cartão — nunca dois, e nenhum quando não é troca */
const respostas = (r) => [!!r.veredito, !!r.pergunta, r.caminho === "dado", r.caminho === "recolher", !!r.cartao].filter(Boolean).length;
/* o cartão com o preço do sistema (e sem veredito junto); `de novo` relê a frase com o clique (ctx.confirmado) */
const cartao = (r, tipo, total) => r.caminho === "cartao" && !r.veredito && r.cartao && r.cartao.tipo === tipo && r.cartao.total === total;
const noClique = (r, deNovo) => deNovo({ confirmado: r.cartao });
const ok1 = (r) => (r.troca ? respostas(r) === 1 : respostas(r) === 0);
const linhaOuFato = (r) => (r.veredito ? `${r.veredito.linha} | ${r.veredito.fato}` : r.pergunta ? r.pergunta.linha : r.fato || "");

/* ---------------- §1 as 40 frases ---------------- */
/* cada caso: [n, frase, retrato, o que um mestre real responde (predicado), a nota] */
const F1 = ficha(15, [SIMBOLO]);
const F13 = ficha(13, [SIMBOLO]);
const CASOS = [
  [4, "Mercy, se eu pagar uma caneca pra você, você me conta quem lê o livro à noite?", LAMPADA_1(F1, { jogador: "Mercy, me chamo Barnabas. Foi você que guardou o Livro dos Nomes?" }),
    (r) => r.caminho === null && !r.troca && r.leitura.quem === "Mercy Quintus", "a conversa com a Mercy que ESTÁ (não a Ottoline, longe): nenhuma troca"],
  [5, "Eu fico com o troco da caneca", LAMPADA_1(F1),
    (r) => r.caminho === "nao" && /Não há troco/.test(r.veredito.linha), "sem pagamento que deixe troco, não há troco (a prosa não dá moeda)"],
  [7, "deixo duas moedas na mesa pra Mercy pelo trabalho e saio pra capela", LAMPADA_1(F1),
    (r) => r.caminho === "aplicado" && r.veredito.ficha.moedas === 13 && /Mercy Quintus/.test(r.veredito.linha), "as duas moedas vão à Mercy que está, e saem da bolsa"],
  [8, "Eudora, quanto você quer pela chave?", PRACA(F13),
    (r) => !r.troca && r.caminho === null, "a pergunta de preço é conversa (a chave não está à venda: nenhum preço a dizer)"],
  [9, "troco o meu símbolo sagrado riscado pela chave, Eudora", PRACA(F13),
    (r) => r.caminho === "nao" && /Eudora Ottoline não troca Chave/.test(r.veredito.linha) && !/vende Símbolo/.test(r.veredito.linha), "a recusa diz o que ELA não troca, nunca «não vende Símbolo»"],
  [12, "tento passar a mão na chave da Eudora sem ela perceber", PRACA(F13),
    (r) => r.caminho === "dado" && r.intencao && r.intencao.tipo === "furto", "furtar a chave: o dado (nunca «não há o que entregar»)"],
  [14, "empresta a vassoura um minuto, Mordecai? Eu devolvo já", PRACA(F13),
    (r) => r.caminho === "dado" && r.leitura.subtipo === "emprestar" && r.leitura.direcao === "recebe" && r.leitura.quem === "Mordecai", "pedir emprestado ao Mordecai: o dado, sem perguntar a quem"],
  [15, "Mordecai", PRACA(F13, { jogador: "empresta a vassoura um minuto, Mordecai? Eu devolvo já" }),
    (r) => !r.troca && r.caminho === null, "sem pergunta pendente, o nome sozinho é chamar alguém (nenhuma pergunta repetida)"],
  [16, "2", PRACA(F13),
    (r) => !r.troca && r.caminho === null, "sem pergunta pendente, «2» não reabre nada"],
  [18, "Thaddeus Crane, me devolve o Livro dos Nomes. Pago o que você pedir.", POCO(F13),
    (r) => r.caminho === "dado" && r.leitura.subtipo === "pedir" && /Thaddeus/.test(r.leitura.quem), "pedir de volta ao Thaddeus: o dado (nunca «você não tem livro»)"],
  [19, "entrego o meu símbolo sagrado a ele, em troca do livro", POCO(F13, { jogador: "Thaddeus Crane, me devolve o Livro dos Nomes. Pago o que você pedir." }),
    (r) => r.caminho === "aplicado" && /Thaddeus Crane/.test(r.veredito.linha) && !r.veredito.ficha.inventario.some((x) => x.nome === SIMBOLO.nome), "«ele» é o Thaddeus da frase anterior, e o símbolo sai da bolsa"],
  [20, "passo dez moedas por baixo do manto pra Thaddeus, só pra ele me soltar o livro", POCO(F13),
    (r) => r.caminho === "aplicado" && r.veredito.ficha.moedas === 3 && /Thaddeus Crane/.test(r.veredito.linha), "as dez moedas vão ao Thaddeus e saem da bolsa (nunca «aqui ninguém vende baixo»)"],
  [21, "pego o livro da mesa e guardo na bolsa", POCO(ficha(3, [])),
    (r) => r.caminho === "nao" && /Não há livro/.test(r.veredito.linha), "o livro que só a prosa pôs na mesa não está no sistema: não há o que pegar"],
  [22, "arranco o livro da mão dele", POCO(ficha(3, []), { jogador: "pego o livro da mesa e guardo na bolsa", mestre: "Thaddeus Crane aperta o livro contra o peito." }),
    (r) => r.caminho === "dado" && r.intencao && r.intencao.tipo === "tomar", "tomar da mão do Thaddeus: o dado (a fala do Mestre é reconstruída)"],
  [23, "guardo o Livro dos Nomes dentro da bolsa", POCO(ficha(3, [])),
    (r) => r.caminho === "nao" && /Não há livro/i.test(r.veredito.linha), "guardar o que não está nem solto nem comigo: não há"],
  [24, "Thaddeus, ouça: esse livro não é seu. Entregue ele a mim por bem, e ninguém aqui sai ferido.", POCO(ficha(3, [])),
    (r) => r.caminho === "dado" && r.leitura.subtipo === "pedir" && /Thaddeus/.test(r.leitura.quem) && !/Sais/.test(String(r.leitura.coisa)), "a ameaça que pede: o dado, sem «Sais Aromáticos» (o «sai» é verbo)"],
  [25, "2", POCO(ficha(3, [])),
    (r) => !r.troca && r.caminho === null, "sem pergunta pendente, «2» não troca nada"],
  [26, "furto a chave que a Eudora prendeu no pescoço", PRACA(ficha(3, [])),
    (r) => r.caminho === "dado" && r.intencao && r.intencao.tipo === "furto", "o furto: o dado (concordava, e continua)"],
  [28, "compro duas tochas da mulher do balcão", BALCAO(F13),
    /* 23/11 (o veredito antes do clique): era «aplicado» direto; o preço é do balcão, e o jogador não o disse — vira o cartão, e o clique aplica o mesmo */
    (r, deNovo) => cartao(r, "compra", 2) && (() => { const c = noClique(r, deNovo); return c.caminho === "aplicado" && c.veredito.ficha.moedas === 11 && c.veredito.ficha.suprimentos.tochas === 7; })(), "duas tochas a ◉ 1: o cartão diz ◉ 2, e no clique ◉ 13 → 11, tochas 5 → 7"],
  [29, "vendo o símbolo sagrado riscado pra ela", BALCAO(ficha(11, [SIMBOLO], { suprimentos: { tochas: 7 } }), { jogador: "compro duas tochas da mulher do balcão" }),
    /* 23/11 (o veredito antes do clique): era «aplicado» direto; quem põe o preço da venda é o mercado — o cartão primeiro */
    (r, deNovo) => cartao(r, "venda", 7) && (() => { const c = noClique(r, deNovo); return c.caminho === "aplicado" && c.veredito.ficha.moedas === 18 && !c.veredito.ficha.inventario.length; })(), "«ela» é a do balcão: o cartão de venda (◉ +7), e no clique ◉ 11 → 18, nunca «O ela não está aqui»"],
  [30, "vendo o símbolo sagrado riscado pra mulher do balcão", BALCAO(ficha(11, [SIMBOLO], { suprimentos: { tochas: 7 } })),
    /* 23/11 (o veredito antes do clique): era «aplicado» direto; o preço da venda é do mercado — o cartão primeiro */
    (r, deNovo) => cartao(r, "venda", 7) && noClique(r, deNovo).veredito.ficha.moedas === 18, "a mulher do balcão compra pelo mercado: o cartão (◉ +7), e no clique ◉ 11 → 18"],
  [31, "vendo o símbolo sagrado riscado", BALCAO(ficha(11, [SIMBOLO], { suprimentos: { tochas: 7 } })),
    /* 23/11 (o veredito antes do clique): era «aplicado» direto; a venda vira o cartão com o comprador, e o clique dá uma linha só */
    (r, deNovo) => cartao(r, "venda", 7) && r.cartao.leitura.venda.quem === "O Sino Rachado" && (() => { const c = noClique(r, deNovo); return c.caminho === "aplicado" && c.veredito.ficha.moedas === 18 && /Sino Rachado/.test(c.veredito.linha); })(), "uma venda, um cartão (◉ +7 ao Sino Rachado), e no clique uma linha só"],
  [32, "cobro de Thaddeus as dez moedas que já passei pra ele", POCO(ficha(19, [])),
    /* MOVIDA em 23/11 (identidade e posse, etapa 6), e o motivo: as dez moedas foram DADAS («já passei pra ele»), não
       emprestadas — não há dívida de Thaddeus com o herói, e cobrar o que não é devido é recusado pela estrutura (o
       registro de dívidas), com o motivo e sem dado. Antes, o dado decidia uma cobrança que não existia. */
    (r) => r.caminho === "nao" && r.veredito && r.veredito.motivo === "semDivida" && !r.veredito.ficha, "cobrar sem dívida: a estrutura recusa (concordava)"],
  [34, "devolvo o livro a Mercy Quintus, inteiro como estava", CAPELA(ficha(75, [LIVRO])),
    (r) => r.caminho === "nao" && r.veredito.motivo === "ausente" && /Mercy Quintus não está aqui/.test(r.veredito.fato), "a Mercy está na Lâmpada: não há a quem devolver, e o livro fica"],
  [35, "pego a poção de cura que ficou no chão", CAPELA(ficha(75, [LIVRO]), {}, [{ id: "p1", nome: POCAO.nome }]),
    (r) => r.caminho === "recolher" && J(r.recolher) === J(["p1"]), "a poção do chão: um recolher, uma linha (nunca «não há poção aqui» junto)"],
  [36, "dou a poção de cura pra Lavinia, de presente", CAPELA(ficha(75, [LIVRO, POCAO])),
    (r) => r.caminho === "aplicado" && r.veredito.ficha.grupo[0].inventario.some((x) => x.nome === POCAO.nome), "a poção passa à bolsa da Lavinia (concordava)"],
  [37, "pago cinco moedas de doação pro altar da capela", CAPELA(ficha(75, [LIVRO])),
    (r) => r.caminho === "aplicado" && r.veredito.ficha.moedas === 70, "a doação: ◉ 75 → 70 (concordava)"],
  [40, "dou duas moedas pra Constance Mordaunt", TORRE(ficha(70, [])),
    (r) => r.caminho === "nao" && r.veredito.motivo === "ausente" && /Constance Mordaunt não está aqui/.test(r.veredito.fato), "Constance não está: a negativa com o motivo, nunca «a quem?» com lojas"],
  [41, "Lavinia Sallow", TORRE(ficha(70, [])),
    (r) => !r.troca && r.caminho === null, "sem pergunta pendente (a 40 já não pergunta), o nome não paga ninguém"],
  [43, "quanto custa uma ração? Não vou pagar mais que três moedas por ela", LAMPADA_2(ficha(68, [LIVRO], { suprimentos: { tochas: 7 } })),
    (r) => r.caminho === "falar" && /◉ 7/.test(r.fato), "o preço é do sistema (◉ 7), e vai ao Narrador como fato"],
  [44, "compro uma ração dela, como combinado", LAMPADA_2(ficha(68, [LIVRO], { suprimentos: { tochas: 7 } }), { jogador: "quanto custa uma ração? Não vou pagar mais que três moedas por ela" }),
    /* 23/11 (o veredito antes do clique): era «aplicado» direto — «compro uma ração» debitava ◉ 7 sem o jogador ver o 7; agora o 7 aparece no cartão */
    (r, deNovo) => cartao(r, "compra", 7) && (() => { const c = noClique(r, deNovo); return c.caminho === "aplicado" && c.veredito.ficha.moedas === 61 && c.veredito.ficha.suprimentos.racoes === 3; })(), "a ração do balcão pelo preço do sistema: o cartão diz ◉ 7, nunca «A Âncora do Sul não vende ração»"],
  [48, "Charity, me serve uma sopa. Fico devendo até amanhã", LAMPADA_2(ficha(68, [LIVRO], { suprimentos: { tochas: 7 } })),
    (r) => r.caminho === "dado" && r.leitura.fiado === true, "o fiado: a Charity decide pelo dado"],
  [50, "Mercy, me empresta o alaúde só um instante?", LAMPADA_2(ficha(66, [LIVRO], { suprimentos: { tochas: 7 } })),
    (r) => r.caminho === "dado" && r.leitura.quem === "Mercy Quintus", "pedir o alaúde emprestado: o dado (concordava)"],
  [51, "vendo duas tochas pra Charity", LAMPADA_2(ficha(66, [LIVRO], { suprimentos: { tochas: 7 } })),
    /* 23/11 (o veredito antes do clique): era «aplicado» direto; a revenda é da tabela, não do jogador — o cartão primeiro */
    (r, deNovo) => cartao(r, "venda", 1) && (() => { const c = noClique(r, deNovo); return c.veredito.ficha.suprimentos.tochas === 5 && c.veredito.ficha.moedas === 67; })(), "duas tochas: o cartão (◉ +1), e no clique 7 → 5, ◉ 66 → 67 (concordava)"],
  [54, "devolvo o Livro dos Nomes a Mercy, já que ele ainda está comigo", LAMPADA_2(ficha(67, [LIVRO], { suprimentos: { tochas: 5 } })),
    /* MOVIDA em 23/11 (identidade e posse, etapa 6), e o motivo: devolver é a entrega que paga uma dívida, e o registro
       não tem empréstimo do livro (o empréstimo não existia antes desta etapa). Sem dívida, a estrutura recusa e o livro
       fica — a mesma classe de T14, que entregava o que nunca foi emprestado. Custo conhecido: o item que a quest pôs na
       mão do herói não é dívida no registro; lê-lo do livro de factos (recebeu) é da etapa 9. */
    (r) => r.caminho === "nao" && r.veredito && r.veredito.motivo === "semDivida" && !r.veredito.ficha, "devolver sem empréstimo: a estrutura recusa (concordava)"],
  [55, "dou três poções de mana pra Charity", LAMPADA_2(ficha(67, [], { suprimentos: { tochas: 5 } })),
    (r) => r.caminho === "nao" && r.veredito.motivo === "nao_tem", "não tenho poção de mana: não (concordava)"],
  [56, "digo a Thomasine: \"pago o dobro, se você me contar o que sabe da torre\"", LAMPADA_2(ficha(67, [], { suprimentos: { tochas: 5 } })),
    (r) => !r.troca && r.caminho === null, "a fala com condição não é troca (concordava)"],
  [57, "pago a sopa da Charity e deixo uma gorjeta pra Thomasine", LAMPADA_2(ficha(67, [], { suprimentos: { tochas: 5 } })),
    /* 23/11 (o veredito antes do clique): era «aplicado» direto; «pago a sopa» não diz quanto — o ◉ 3 é da casa, e vai ao cartão */
    (r, deNovo) => cartao(r, "pagar", 3) && (() => { const c = noClique(r, deNovo); return c.caminho === "aplicado" && c.veredito.ficha.moedas === 64 && /Charity Mordaunt/.test(c.veredito.linha); })(), "a sopa a ◉ 3: o cartão de pagar, e no clique à Charity (a gorjeta sem quantia não move moeda)"],
  [58, "peço a poção de volta pra ela, se ainda não usou", LAMPADA_2(ficha(64, [], { suprimentos: { tochas: 5 }, grupo: [LAVINIA([POCAO.nome])] }), { jogador: "pago a sopa da Charity e deixo uma gorjeta pra Thomasine" }),
    (r) => r.caminho === "aplicado" && r.veredito.ficha.inventario.some((x) => x.nome === POCAO.nome) && !r.veredito.ficha.grupo[0].inventario.length, "«ela» é quem tem a poção (a Lavinia): ela a devolve — nunca a Tabitha ao acaso"],
  [59, "troco uma tocha por uma caneca de cerveja, Charity", LAMPADA_2(ficha(64, [], { suprimentos: { tochas: 5 } })),
    /* 23/11 (o veredito antes do clique): era «aplicado» direto; a casa é que diz que a tocha vale a caneca — o cartão primeiro */
    (r, deNovo) => cartao(r, "escambo", 0) && (() => { const c = noClique(r, deNovo); return c.caminho === "aplicado" && c.veredito.ficha.suprimentos.tochas === 4 && /tocha/i.test(c.veredito.linha) && !/não vende tocha/.test(c.veredito.linha); })(), "a tocha é minha e a caneca é da casa: o cartão da troca, e no clique ela acontece (nunca «Charity não vende tocha»)"],
];
/* as 12 que concordavam na sessão (o relatório, §3) */
const CONCORDAVAM = [8, 26, 28, 31, 32, 36, 37, 50, 51, 54, 55, 56];

sec("§1 as 40 frases da sessão 16 — a resposta de um mestre real, e uma só");
{
  t("são as 40 frases da tabela", CASOS.length === 40, String(CASOS.length));
  let certas = 0, uma = 0;
  const erradas = [];
  for (const [n, frase, retrato, espera, nota] of CASOS) {
    const r = aPortaUnica(frase, retrato, CTX);
    const certo = (() => { try { return !!espera(r, (extra) => aPortaUnica(frase, retrato, { ...CTX, ...extra })); } catch { return false; } })();
    const unica = ok1(r);
    certas += certo && unica; uma += unica;
    if (!(certo && unica)) erradas.push(n);
    t(`${n}. «${frase}» — ${nota}`, certo && unica, `${r.caminho} · ${linhaOuFato(r)} · ${respostas(r)} resposta(s)`);
  }
  console.log(`    a resposta de um mestre real: ${certas} de 40 (a sessão jogada: 12 de 40); uma resposta só: ${uma} de 40`);
  t("as 12 que já concordavam continuam a concordar", CONCORDAVAM.every((n) => !erradas.includes(n)), erradas.filter((n) => CONCORDAVAM.includes(n)).join(", "));
  t("ao menos 36 das 40 terminam na resposta de um mestre real", certas >= 36, String(certas));
  t("toda frase tem exatamente uma resposta (nenhuma troca com duas, nenhuma conversa com uma)", uma === 40, String(uma));
}

sec("§2 a pergunta — a resposta completa a leitura; a mesma pergunta nunca volta");
{
  const F = ficha(20, [SIMBOLO]);
  const R0 = LAMPADA_2(F);
  const p = aPortaUnica("dou duas moedas", R0, CTX);
  t("falta a quem: a pergunta lista só a gente que está", p.caminho === "pergunta" && J(p.pergunta.opcoes.map((x) => x.valor)) === J(["Charity Mordaunt", "Thomasine Nightingale", "Tabitha", "Mercy Quintus"]), J(p.pergunta && p.pergunta.opcoes));
  t("…sem lojas, sem balcão, e sem o companheiro para moeda (o dinheiro do grupo é um só)", !/Sino|Âncora|Cálice|Balcão|Lavinia/.test(p.pergunta.linha), p.pergunta.linha);
  t("…a linha é a da mesa, numerada", /^🤝 A quem você entrega as moedas\? 1\. Charity Mordaunt · 2\. Thomasine Nightingale/.test(p.pergunta.linha), p.pergunta.linha);
  const r2 = aPortaUnica("2", R0, { ...CTX, pendente: p.pergunta });
  t("a resposta pelo número completa a leitura (quem = a 2.ª) e aplica: ◉ 20 → 18", r2.caminho === "aplicado" && r2.veredito.ficha.moedas === 18 && /Thomasine Nightingale/.test(r2.veredito.linha), J([r2.caminho, linhaOuFato(r2)]));
  t("…e a frase que parte é a da leitura completa, não a frase antiga com o «2» colado", r2.frase === "dou 2 moedas a Thomasine Nightingale", r2.frase);
  const r3 = aPortaUnica("Tabitha", R0, { ...CTX, pendente: p.pergunta });
  t("a resposta pelo nome também", r3.caminho === "aplicado" && /Tabitha/.test(r3.veredito.linha), linhaOuFato(r3));
  const r4 = aPortaUnica("dou duas moedas", R0, { ...CTX, pendente: p.pergunta });
  t("a mesma pergunta duas vezes seguidas: o Mestre desiste com uma linha, e o turno segue", r4.caminho === "desiste" && r4.veredito && r4.veredito.estado === "negada" && /nada muda de mão/.test(r4.veredito.linha) && r4.veredito.ficha === null, J([r4.caminho, linhaOuFato(r4)]));
  const r5 = aPortaUnica("olho em volta", R0, { ...CTX, pendente: p.pergunta });
  t("a frase nova não é resposta: segue como turno, e a pergunta não acumula", r5.caminho === null && r5.frase === "olho em volta");
  const um = aPortaUnica("dou duas moedas", cena({ lugar: { nome: "a ponte", tipo: "rua" }, pessoas: [{ nome: "Mordecai", papel: "sacristão" }], ficha: F }), CTX);
  t("com um candidato só não há pergunta: a moeda vai a ele", um.caminho === "aplicado" && /Mordecai/.test(um.veredito.linha) && um.veredito.ficha.moedas === 18, J([um.caminho, linhaOuFato(um)]));
  const fora = aPortaUnica("dou duas moedas pra Zipporah", TORRE(ficha(10, []), {}, []), CTX);
  t("o nomeado que o sistema não tem em cena (nem conhece): a negativa, não a pergunta", fora.caminho === "nao" && /Zipporah não está aqui/.test(fora.veredito.linha) && fora.veredito.ficha === null, J([fora.caminho, linhaOuFato(fora)]));
  const morto = aPortaUnica("dou duas moedas pro Edrik", cena({ lugar: { nome: "a cripta", tipo: "sitio" }, pessoas: [{ nome: "Tabitha" }, { nome: "Mordecai" }], ausentes: [{ nome: "Edrik Sorn", morto: true }], ficha: F }), CTX);
  t("o nomeado morto: a negativa com o motivo", morto.caminho === "nao" && morto.veredito.motivo === "morto", J([morto.caminho, linhaOuFato(morto)]));
  const verbo = aPortaUnica("Thaddeus, ouça: o livro dele não é seu", POCO(F), CTX);
  t("o gesto sem troca não pergunta nada", verbo.caminho === null);
  /* a pergunta das ações (o verbo que ninguém previu): a escolha completa o subtipo */
  const acao = aPortaUnica("aceito o pão e a água que ela oferece", cena({ lugar: { nome: "a feira", tipo: "mercado" }, pessoas: [{ nome: "Dorva", papel: "padeira" }], bancas: [], ficha: F, anteriores: {} }), CTX);
  if (acao.caminho === "pergunta") {
    const ac2 = aPortaUnica("Comprar", cena({ lugar: { nome: "a feira", tipo: "mercado" }, pessoas: [{ nome: "Dorva", papel: "padeira" }], ficha: F }), { ...CTX, pendente: acao.pergunta });
    t("a pergunta do que se faz: a escolha completa o subtipo (estrutura, não texto)", ac2.leitura && ac2.leitura.subtipo === "comprar", J(ac2.leitura && ac2.leitura.subtipo));
  } else t("a pergunta do que se faz: a escolha completa o subtipo (estrutura, não texto)", true);
}

sec("§3 a dupla resposta — a frase de troca não abre porta antiga");
{
  /* o caso próprio da dupla resposta: as frases 31, 35 e 40 tinham duas respostas. Aqui a porta
     única devolve uma, e a fiação (§4) prova que, com a chave, nenhuma porta antiga fala junto */
  for (const n of [31, 35, 40]) {
    const [, frase, retrato] = CASOS.find((c) => c[0] === n);
    const r = aPortaUnica(frase, retrato, CTX);
    t(`frase ${n}: uma resposta, e a troca fecha as portas antigas`, respostas(r) === 1 && r.troca === true, `${respostas(r)} · ${r.caminho}`);
  }
}

sec("§4 a fiação, lida no App.jsx");
{
  const APP = ler("../src/App.jsx");
  const corpo = (nome) => { const i = APP.indexOf(`  const ${nome} = `); if (i < 0) return ""; const j = APP.indexOf("\n  };\n", i); return APP.slice(i, j + 5); };
  t("o App importa a porta única", /import \{ aPortaUnica, UMA_PORTA_SO \} from "\.\/motor\/uma-porta-so\.js";/.test(APP));
  const pp = corpo("proporAFrase");
  const iU = pp.indexOf("aPortaDaFrase(acao0)"), iM = pp.indexOf("aMaoDaFrase(acao"), iP = pp.indexOf("aPropostaDaFrase(");
  t("com a chave, a porta única lê a frase antes da mão da frase e da proposta", iU > 0 && iM > iU && iP > iU);
  t("…e a frase de troca parte sem abrir a mão da frase nem o cartão", /if \(rU && rU\.troca\) \{/.test(pp));
  t("…a mão da frase só sem a chave (a régua: as listas não somam troca ao ouvido)", /if \(!mestreVivoLigado\(\)\) \{\n\s*try \{\n\s*const nomeDe = /.test(pp));
  t("…o cartão das listas não cobra nem vende com a chave (só o da porta única)", /mestreVivoLigado\(\) \? \{ \.\.\.lf, pagar: null, venda: null, compras: null \} : lf/.test(pp));
  /* 23/11 (o veredito antes do clique): o preço do sistema vira o cartão de sempre, e o clique relê com a chave */
  t("…o preço do sistema vira o cartão antes de a frase partir", /if \(rU && rU\.caminho === "cartao" && rU\.cartao\) return mostrarOCartaoDaPorta\(rU\);/.test(pp) && pp.indexOf("rU.caminho === \"cartao\"") < pp.indexOf("if (rU && rU.troca)"));
  t("…o cartão é o da proposta da frase (nenhum cartão novo), com a marca da porta", /aPropostaDaFrase\(\{ frase: r\.frase, \.\.\.r\.cartao\.leitura \}/.test(corpo("mostrarOCartaoDaPorta")) && /porta: r\.cartao/.test(corpo("mostrarOCartaoDaPorta")));
  t("…o clique relê a frase com a chave confirmada, e o turno aplica o resultado", /confirmado: p\.porta/.test(corpo("confirmarOCartaoDaPorta")) && /portaUnicaRef\.current = r \? \{ entrada: p\.frase/.test(corpo("confirmarOCartaoDaPorta")) && /if \(p\.porta\) \{ confirmarOCartaoDaPorta\(p\); return; \}/.test(corpo("confirmarAProposta")));
  const oa = corpo("ouvirAFrase");
  t("…no turno, o cartão que escapou à proposta para o turno (nunca aplica sem clique)", /r\.caminho === "cartao" && r\.cartao/.test(oa) && /mostrarOCartaoDaPorta\(r\)/.test(oa));
  t("no turno, o resultado é o da porta única (o guardado da proposta, ou lido agora)", /aPortaDaFrase\(acao\)/.test(oa));
  t("a pergunta guarda a leitura pendente e para o turno", /perguntaDoOuvidoRef\.current = r\.pergunta;/.test(oa) && /parou: true/.test(oa));
  t("o veredito vai pela porta da troca de hoje (a ficha, a linha, o fato)", /aplicarOVereditoDaTroca\(r\.veredito\)/.test(oa));
  t("o recolher vai pelo caminho do botão", /recolherDoChao\(r\.recolher\)/.test(oa));
  t("o preço que o sistema sabe vai como fato do turno", /porNaPautaDoTurno\(\{ fato: \[r\.fato\] \}\)/.test(oa));
  const ag = corpo("agirInterno");
  t("com a leitura do ouvido, a bolsa da frase não abre (uma resposta só)", /const portasDeTroca = !ouvido;/.test(ag));
  const fe = corpo("oOuvidoFechaATroca");
  t("o ouvido fecha só o dado adiado, com a porta do momento", /!ov\.adiado\) return;/.test(fe) && /aTrocaDoOuvido\(\{ caminho: "aplicar", leitura: ov\.leitura, resposta: ov\.resposta \}, \{ ficha: agora, bancas: \[\], porta: porta \|\| ""/.test(fe));
  t("o retrato traz quem a tela põe em cena, quem o sistema conhece, a conversa e a casa", /presentesDaTela\(\)/.test(corpo("retratoDoOuvido")) && /ausentesAgora\(\)\.conhecidos/.test(corpo("retratoDoOuvido")) && /anteriores = \{ jogador: /.test(corpo("retratoDoOuvido")) && /osPratosDaCasa\(/.test(corpo("retratoDoOuvido")));
  t("o retrato lê cada fonte no seu calou", (corpo("retratoDoOuvido").match(/calou\("o ouvido · /g) || []).length >= 10);
  /* 23/11: a asserção ganhou o «cartao» — o cartão com o preço também vence a encruzilhada (um cartão só por frase) */
  t("a encruzilhada não abre para a troca que a porta única nega, pergunta ou põe no cartão (frase 34)", /rBQ && rBQ\.troca && \(rBQ\.caminho === "nao" \|\| rBQ\.caminho === "pergunta" \|\| rBQ\.caminho === "cartao"\)/.test(APP));
  t("nenhum bloco estático novo no prompt", !/SECOES|TETO_DA_PAUTA/.test(oa + fe + corpo("aPortaDaFrase")));
}

sec("§5 a defesa");
{
  let ok = true;
  try { ok = aPortaUnica(null, null, null).lido === false && aPortaUnica("dou a faca", null, null).caminho !== undefined && oFocoDaConversa(null, null) === null && J(osPratosDaCasa(null)) === "[]"; } catch { ok = false; }
  t("null em tudo não derruba (o `= {}` não cobre null)", ok);
  const R0 = LAMPADA_2(ficha(20, [SIMBOLO]));
  t("a mesma frase na mesma cena dá o mesmo resultado (determinístico)", J(aPortaUnica("vendo duas tochas pra Charity", R0, CTX)) === J(aPortaUnica("vendo duas tochas pra Charity", R0, CTX)));
  const F = ficha(20, [SIMBOLO]);
  aPortaUnica("dou o símbolo sagrado riscado pra Charity", LAMPADA_2(F), CTX);
  t("a ficha de entrada nunca muda (imutável)", F.moedas === 20 && F.inventario.length === 1);
  t("a tela fala de jogo («você», nunca «tu»; nunca o nome do mecanismo)", !/\btu\b|\bteu\b|\btua\b|ouvido|veredito|leitura|subtipo/i.test(J(UMA_PORTA_SO.tela)));
  t("a cena do jogo: a banca não é gente, a casa é de quem serve", (() => { const c = aCenaDoOuvido(R0); return !c.pessoas.some((p) => /Sino|Balcão/.test(p.nome)) && c.bancas.some((b) => b.nome === "O Sino Rachado") && c.pessoas.find((p) => p.nome === "Charity Mordaunt").vende.some((v) => v.item === "sopa"); })());
  t("os pratos da casa saem da tabela (a palavra simples da regex, com o preço da linha)", J(CASA.map((x) => x.nome)) === J(["sopa", "caldo", "ensopado", "caneca", "cerveja"]) && CASA[0].preco === 3);
  t("o foco: a gente da frase anterior; sem ela, quem a fala do Mestre pôs por último", oFocoDaConversa({ jogador: "Mordecai, quem é ele?" }, aCenaDoOuvido(POCO(F))) === "Mordecai" && oFocoDaConversa({ jogador: "olho o poço", mestre: "Mordecai recua. Thaddeus Crane sorri." }, aCenaDoOuvido(POCO(F))) === "Thaddeus Crane, a Coisa no Poço");
  t("a leitura completa pede o veredito pela ponte (oVereditoDoOuvido)", oVereditoDoOuvido(oOuvido("dou a faca", aCenaDoOuvido(R0)), aCenaDoOuvido(R0)).lido === true);
}

sec("§6 o veredito antes do clique — a quantia dita aplica; o preço do sistema é o cartão; nunca os dois");
{
  const F = ficha(20, [SIMBOLO]);
  const R0 = LAMPADA_2(F);
  const C = (frase, extra) => aPortaUnica(frase, R0, { ...CTX, ...(extra || {}) });
  /* a quantia dita: o jogador já viu o que sai da mão */
  const ditas = [["pago cinco moedas a Charity", 15], ["dou duas moedas a Mercy", 18], ["passo dez moedas pra Thomasine", 10]];
  for (const [frase, fica] of ditas) {
    const r = C(frase);
    t(`quantia dita aplica direto: «${frase}» (◉ 20 → ${fica})`, r.caminho === "aplicado" && !r.cartao && r.veredito.ficha.moedas === fica, J([r.caminho, linhaOuFato(r)]));
  }
  const coisa = C("dou o símbolo sagrado riscado pra Charity");
  t("a coisa nomeada a quem está aplica direto (não há preço escondido)", coisa.caminho === "aplicado" && !coisa.cartao, coisa.caminho);
  const empresta = C("empresto o símbolo sagrado riscado a Tabitha");
  t("emprestar a coisa nomeada também", empresta.caminho === "aplicado" && !empresta.cartao, J([empresta.caminho, linhaOuFato(empresta)]));
  const oferta = C("compro uma ração por sete moedas");
  t("a compra com a quantia dita aplica direto (o preço é o do jogador)", oferta.caminho === "aplicado" && !oferta.cartao && oferta.veredito.ficha.moedas === 13, J([oferta.caminho, linhaOuFato(oferta)]));
  /* o preço do sistema: o cartão de sempre, com o preço e a bolsa */
  const sopa = C("compro uma sopa da Charity");
  t("comprar da casa sem dizer quanto: o cartão (◉ 3), e a ficha não muda", cartao(sopa, "compra", 3) && sopa.veredito === null && F.moedas === 20, J([sopa.caminho, sopa.cartao]));
  const p = aPropostaDaFrase({ frase: sopa.frase, ...sopa.cartao.leitura }, {});
  t("…é o cartão da proposta da frase: «Comprar Sopa», ◉ 3, e a bolsa fica com ◉ 17", p && p.tipo === "compra" && p.verbo === "Comprar Sopa" && /^◉\s3$/.test(p.preco) && /◉\s17/.test(p.linhas.join(" ")), J(p));
  const venda = C("vendo o símbolo sagrado riscado");
  const pv = aPropostaDaFrase({ frase: venda.frase, ...venda.cartao.leitura }, {});
  t("vender: o cartão de Vender com o comprador e a bolsa depois", pv && pv.tipo === "venda" && /^◉\s\+7$/.test(pv.preco) && /ao Sino Rachado: a bolsa fica com ◉\s27/.test(pv.linhas.join(" ")), J(pv));
  const servico = C("pago a sopa da Charity");
  const pp = aPropostaDaFrase({ frase: servico.frase, ...servico.cartao.leitura }, {});
  t("pagar sem dizer quanto: o cartão de Pagar («Pagar Sopa», ◉ 3)", pp && pp.tipo === "pagar" && pp.verbo === "Pagar Sopa" && /^◉\s3$/.test(pp.preco) && /◉\s17/.test(pp.linhas.join(" ")), J(pp));
  const esc = C("troco uma tocha por uma caneca de cerveja, Charity");
  const pe = aPropostaDaFrase({ frase: esc.frase, ...esc.cartao.leitura }, {});
  t("o escambo com a casa: o cartão diz os dois lados", pe && pe.tipo === "escambo" && /Tocha/i.test(pe.verbo) && /Caneca|Cerveja/i.test(pe.verbo) && /Charity/.test(pe.linhas.join(" ")), J(pe));
  /* nunca os dois: o cartão não traz veredito, e o clique não traz cartão */
  const todos = [sopa, venda, servico, esc];
  t("nunca cartão e aplicação juntos (o cartão sem veredito)", todos.every((r) => r.cartao && !r.veredito && respostas(r) === 1));
  const cliques = todos.map((r, i) => C([sopa, venda, servico, esc][i].frase, { confirmado: r.cartao }));
  t("…e o clique aplica sem cartão (um resultado só)", cliques.every((r) => r.caminho === "aplicado" && r.veredito && !r.cartao && respostas(r) === 1), J(cliques.map((r) => r.caminho)));
  t("…com a bolsa que o cartão mostrou (a sopa: ◉ 20 → 17)", cliques[0].veredito.ficha.moedas === 17);
  const outra = C("compro uma sopa da Charity", { confirmado: { chave: "compra|99|sopa|1" } });
  t("a chave de outro preço não aplica: volta o cartão com o preço de agora", cartao(outra, "compra", 3), J([outra.caminho, outra.cartao]));
  const vazio = aPortaUnica(null, null, null);
  t("o vazio traz o campo do cartão (null)", vazio.cartao === null);
}

/* §7 A BANCADA DA TROCA (testes/bancada-da-troca): a régua do meio digita cada frase no jogo de
   verdade, e o que ela achou e se consertou fica provado aqui, sem navegador. */
sec("§7 a bancada da troca — o que o jogo jogado mostrou");
{
  const APP = ler("../src/App.jsx");
  /* B30 B31 B49 L02: a quantia dita saía duas vezes — a porta única aplicava, e a cobrança da frase pagava de novo depois da prosa */
  t("a frase que a porta única leu como troca não paga de novo pela cobrança do pedido",
    /* 25/11 (a IA leitora): a condição ganhou «|| ovC.pelaLeitora === "nao"» — a frase que o ouvido lia como troca
       e a leitora desfez continua fora da cobrança do pedido, como era antes dela; a intenção (a troca não paga duas
       vezes) é a mesma, e a asserção aceita a forma nova */
    /if \(mestreVivoLigado\(\) && ovC && ovC\.lido && \(ovC\.troca \|\| ovC\.pelaLeitora === "nao"\)\) pedidoDaCobranca = "";/.test(APP) && /aplicarResposta\(resp, persAtual, \{ envelopes: [^}]*pedido: pedidoDaCobranca,/.test(APP));
  /* X01: fora dos muros (lugar com distância que não é «dentro») as bancas, o balcão e a casa ficam na cidade */
  const rt = (() => { const i = APP.indexOf("  const retratoDoOuvido = "); return APP.slice(i, APP.indexOf("\n  };\n", i)); })();
  t("fora dos muros, o retrato não traz bancas, balcão nem casa", /foraDosMuros = !jornadaRef\.current && !!\(lgM && lgM\.distancia && lgM\.distancia !== "dentro"\)/.test(rt) && /bancas = foraDosMuros \? \[\] :/.test(rt) && (rt.match(/!foraDosMuros/g) || []).length >= 2);

  /* a praça da bancada: o mercador Cornelius ao lado d'O Sino Rachado, Prudence, e as duas Mercy longe */
  const PRACA_B = (f, ant) => cena({ lugar: { nome: "A Balança dos Que Voltaram", tipo: "" }, pessoas: [{ nome: "Cornelius", papel: "mercador(a)" }, { nome: "Prudence", papel: "batedor de carteiras" }], ausentes: [{ nome: "Mercy Quintus" }, { nome: "Mercy Ottoline" }], ficha: f, anteriores: ant });
  const FB = ficha(30, [SIMBOLO]);
  const P = (frase, ant, f) => aPortaUnica(frase, PRACA_B(f || FB, ant), CTX);
  const casos = [
    ["Cornelius, me vende a corda", (r) => cartao(r, "compra", 2), "o mercador atende a praça: a corda do armazém, pelo cartão (B03)"],
    ["Cornelius, me vende uma dessas cordas? Dou duas moedas.", (r) => r.caminho === "aplicado" && r.veredito.ficha.moedas === 28 && /Corda/.test(r.leitura.coisa), "«dessas» não é coisa: a corda, com a quantia dita (B11)"],
    ["Peço desculpas à Prudence", (r) => !r.troca && !r.veredito, "pedir desculpas é falar (B121)"],
    ["Deixa pra lá a corda. Lavinia, deixa que eu carrego a mochila.", (r) => !r.troca && !r.veredito && !r.cartao, "«deixa pra lá» desiste: nenhum cartão (B122)"],
    ["Cornelius, me dá um pedaço dessa corda", (r) => r.leitura.subtipo === "pedir" && /Corda/.test(r.leitura.coisa) && r.caminho === "dado", "«um pedaço dessa corda» se pede: a coisa é a corda, e o dado (B50)"],
    ["peço à Prudence o nome do homem de manto cinza", (r) => !r.troca && !r.veredito, "pedir um nome é conversa, nunca um item inventado (L07)"],
    ["dou duas moedas à Mercy Quintus", (r) => r.caminho === "nao" && /Mercy Quintus não está aqui/.test(r.veredito.linha), "quem está longe: a linha diz que não está (B45)"],
    ["devolvo o símbolo sagrado riscado à Mercy", (r) => r.caminho === "nao" && /Mercy não está aqui/.test(r.veredito.linha), "«à Mercy» (com crase) também é o nome de fora (B80)"],
    ["pego a corda da banca e saio andando", (r) => r.caminho === "nao" && /só sai da banca pago/.test(r.veredito.linha), "o que está à venda não se leva da banca (B64)"],
    ["dou três flechas à Lavinia", (r) => r.caminho === "nao" && /não tem flecha/.test(r.veredito.linha), "o número antes do nome: «flechas» é coisa, e você não tem (B44)"],
    ["Lavinia, fica com o símbolo, de presente", (r) => r.caminho === "aplicado" && r.leitura.subtipo === "dar", "«de presente» é dar (B41)"],
    /* MOVIDA em 23/11 (etapa 6), e o motivo: a leitura continua cobrar; sem dívida de Cornelius no registro, a resposta
       deixa de ser o dado e passa a ser a recusa da estrutura (a bancada aceita dado ou nega em B110) */
    ["Cornelius, você me deve cinco moedas. Estou cobrando.", (r) => r.leitura.subtipo === "cobrar" && (r.caminho === "dado" || (r.caminho === "nao" && r.veredito.motivo === "semDivida")), "«me deve… estou cobrando» é cobrar: o dado, ou a recusa sem dívida (B110)"],
    ["ofereço vinte moedas à Prudence para ela me deixar passar", (r) => r.caminho === "dado" && r.intencao && r.intencao.tipo === "suborno", "o propósito com dois pronomes é suborno: o dado, e a moeda não sai antes (B91)"],
    ["compro a corda e duas tochas", (r) => r.caminho === "cartao" && r.cartao.leitura.compras[0].itens[0].quantos === 1 && /Corda/.test(r.cartao.leitura.compras[0].itens[0].nome), "o «duas» é das tochas: a corda vai uma (B13)"],
  ];
  for (const [frase, ok, nota] of casos) { const r = P(frase); t(`${nota}: «${frase}»`, ok(r) && ok1(r), J([r.caminho, r.leitura && r.leitura.subtipo, r.leitura && r.leitura.coisa, linhaOuFato(r)])); }
  /* Q10: o «ela» não entrega à loja de quem se comprou antes (a banca só é o «ela» de quem negocia com ela) */
  const q10 = P("dou a ela a corda", { jogador: "compro a corda do Sino Rachado" }, ficha(30, [{ nome: "Corda de cânhamo" }]));
  t("«dou a ela a corda»: a loja não recebe presente (Q10)", q10.leitura.quem !== "O Sino Rachado" && !(q10.veredito && /Sino Rachado/.test(q10.veredito.linha)), J([q10.caminho, q10.leitura.quem]));
  /* L01: a casa é de todos os que servem — a serviçal também */
  const lamp = cena({ lugar: { nome: "A Lâmpada dos Sonhos", tipo: "taverna" }, pessoas: [{ nome: "Tabitha", papel: "taverneiro(a)" }, { nome: "Charity Mordaunt", papel: "serviçal" }], ficha: ficha(20, [SIMBOLO]), casa: CASA });
  const sopa = aPortaUnica("Charity, me serve uma sopa", lamp, CTX);
  t("a serviçal serve a casa: «Charity, me serve uma sopa» é o cartão de ◉ 3 (L01)", cartao(sopa, "compra", 3), J([sopa.caminho, linhaOuFato(sopa)]));
  t("…e o clique aplica (a casa é banca de quem serve)", aPortaUnica("Charity, me serve uma sopa", lamp, { ...CTX, confirmado: sopa.cartao }).veredito.ficha.moedas === 17);
  /* L10: o verbo «suborno» é suborno, qualquer que seja o favor (o catálogo pede o dado por ele) */
  /* L03: «na minha conta» é fiado — o dado decide, e o cartão não cobra */
  const fiado = aPortaUnica("Charity, me serve uma caneca de cerveja, na minha conta", lamp, CTX);
  t("«…na minha conta» é o fiado: o dado, nunca o cartão (L03)", fiado.caminho === "dado" && !fiado.cartao, J([fiado.caminho]));
  /* Q07: sem o mercador nomeado, a coisa é da banca que a vende (o escambo com a banca é o cartão) */
  const q07 = P("troco a corda pelo amuleto de osso", null, ficha(13, [{ nome: "Corda de cânhamo" }]));
  t("o escambo sem ninguém nomeado é com a banca, não com o mercador que atende (Q07)", q07.caminho === "cartao" && q07.cartao.tipo === "escambo" && /Âncora/.test(q07.cartao.leitura.escambo.quem), J([q07.caminho, q07.cartao && q07.cartao.leitura]));
  /* B08: a compra condicionada ao preço perguntado é a pergunta do preço */
  const b08 = P("quanto custa uma corda? Se for menos de três, eu compro");
  t("«quanto custa…? Se for menos de três, eu compro» é a pergunta do preço (B08)", !b08.troca && b08.caminho === "falar" && /◉ 2/.test(b08.fato), J([b08.caminho, b08.fato]));
  /* B92, Q09, L10: a fiação do dado — a troca negada não rola; a que vai ao dado não vira procura de gente */
  const adj = (() => { const i = APP.indexOf("  const adjudicarAcao = "); return APP.slice(i, i + 6000); })();
  t("a troca que a porta única negou não rola dado no catálogo (B92, Q09)", /ovD\.fechou && ovD\.veredito && ovD\.veredito\.estado === "negada"\) return false;/.test(adj) && adj.indexOf("ovD.fechou") < adj.indexOf("alvoLocalPedido(acao)"));
  t("a troca que a porta única mandou ao dado não abre a procura de gente (L10)", /if \(!trocaAoDado && procurarAlguem\(acao\)\) return true;/.test(adj));
  t("«suborno a Charity com vinte moedas pra ela me contar…» é suborno (L10)", oSubornoDaFrase("suborno a Charity com vinte moedas pra ela me contar quem esteve aqui") === true && oSubornoDaFrase("pago duas moedas à Charity") === false);

  /* AS 50 FRASES NOVAS (23/11): a bancada mediu 39 de 50 em frases que ninguém tinha visto — o conserto anterior
     ficou em parte moldado às frases dele. Aqui cada CAUSA é provada com frases nossas, diferentes das da bancada,
     para a regra não depender de uma frase só. */
  const ok1b = (r) => ok1(r) || !!r.seguinte;
  const regras = [
    /* 1. a coisa minha a alguém «por» moeda ou «uns trocados» é venda (o cartão com o preço), nunca presente */
    ["entrego o símbolo sagrado riscado à Prudence por umas moedas", (r) => cartao(r, "venda", 7) && r.leitura.subtipo === "vender", "venda «por umas moedas»: o cartão, e o símbolo não sai antes"],
    ["deixo o símbolo com o Cornelius por cinco pratas", (r) => r.leitura.subtipo === "vender" && r.leitura.quantia === 5 && !r.veredito, "venda com o preço dito: vender, e nada sai sem resposta"],
    /* MOVIDA em 23/11 (identidade e posse, etapa 8: a forma da troca), e o motivo: «ela me paga» é a outra oração em
       que o OUTRO entrega ao herói com gesto de pagar — a contrapartida da coisa —, e a forma diz venda; o menu «Dar /
       Emprestar / Vender» saiu do ouvido (só a forma ambígua de verdade pergunta). A intenção fica: o item não sai sem o
       jogador ver o preço — é o cartão da venda, e nada muda antes do clique (o prazo do pagamento é da etapa 9). */
    ["dou o símbolo sagrado riscado à Prudence, ela me paga amanhã", (r) => r.caminho === "cartao" && r.leitura.subtipo === "vender" && !r.veredito, "dar ou vender? a outra oração diz a contrapartida: o cartão da venda, e o item não sai antes do clique"],
    /* 2. a oferta no imperativo, a quem está, com a quantia dita: dar, sem menu */
    ["Prudence, pega três moedas pela ajuda", (r) => r.caminho === "aplicado" && r.veredito.ficha.moedas === 27, "«pega três moedas» é dar (◉ 30 → 27)"],
    ["Cornelius, segura cinco moedas", (r) => r.caminho === "aplicado" && r.veredito.ficha.moedas === 25, "«segura cinco moedas» é dar (◉ 30 → 25)"],
    ["Cornelius, pega a corda pra mim", (r) => r.leitura.subtipo !== "dar" && !(r.veredito && r.veredito.estado === "aplicada"), "«pega … pra mim» não é oferta: nada sai da bolsa"],
    /* 3. a moeda por um favor condicionado é suborno (o dado), não menu */
    ["Prudence, dez moedas se você esquecer o meu rosto", (r) => r.leitura.subtipo === "subornar" && r.caminho === "dado" && r.intencao && r.intencao.tipo === "suborno", "«dez moedas se você esquecer…» é suborno"],
    ["se você não contar a ninguém, Cornelius, te pago quinze moedas", (r) => r.leitura.subtipo === "subornar" && r.caminho === "dado", "a condicional na frente também é suborno"],
    ["se eu pagar cinco moedas, levo a corda", (r) => r.leitura.subtipo !== "subornar", "o «se» de quem paga não é favor de ninguém"],
    /* 4. o verbo de estado sobre a coisa, sem gesto: conversa, nenhuma resposta de troca */
    ["essa corda vale cada moeda", (r) => !r.troca && !r.veredito && !r.pergunta && !r.cartao, "«essa corda vale cada moeda» é conversa"],
    ["o amuleto de osso parece caro demais", (r) => !r.troca && !r.veredito && !r.pergunta && !r.cartao, "«o amuleto parece caro» é conversa"],
    /* 5. a quantia sem número: a bolsa calcula «todo», «metade»; «uns trocados» pergunta quanto (nunca 1 calado) */
    ["entrego todo o dinheiro que tenho ao Cornelius", (r) => r.caminho === "aplicado" && r.veredito.ficha.moedas === 0, "«todo o dinheiro que tenho» é a bolsa inteira (◉ 30)"],
    ["dou metade das moedas à Prudence", (r) => r.caminho === "aplicado" && r.veredito.ficha.moedas === 15, "«metade» é metade da bolsa (◉ 15)"],
    ["dou uns trocados pra Prudence", (r) => r.caminho === "nao" && /Quanto você dá/.test(r.veredito.linha) && r.veredito.ficha === null, "«uns trocados» sem número: o Mestre pergunta quanto, e nada sai"],
    /* 6. o pedido com a marca de que não se paga é pedir (o dado), não o cartão de compra */
    ["Cornelius, me passa uma corda, estou sem dinheiro", (r) => r.leitura.subtipo === "pedir" && r.caminho === "dado" && !r.cartao, "«me passa… estou sem dinheiro» é pedir"],
    ["Cornelius, me dá um amuleto de osso de graça", (r) => r.leitura.subtipo === "pedir" && !r.cartao, "«me dá… de graça» é pedir"],
    ["compro uma corda, estou sem grana", (r) => r.leitura.subtipo === "comprar", "quem diz «compro» está comprando, com ou sem grana (o selado o mediu)"],
    /* 8. as coisas do mesmo verbo vão juntas: o cartão com todas, ou a soma que não chega */
    ["levo o amuleto de osso e a corda", (r) => cartao(r, "compra", 11) && r.cartao.leitura.compras[0].itens.length === 2, "«levo o amuleto e a corda»: um cartão, as duas coisas, ◉ 11"],
  ];
  for (const [frase, ok, nota] of regras) { const r = P(frase); t(`${nota}: «${frase}»`, ok(r) && ok1b(r), J([r.caminho, r.leitura && r.leitura.subtipo, r.leitura && r.leitura.coisa, r.leitura && r.leitura.quantia, linhaOuFato(r)])); }
  const naoChega = P("levo o amuleto de osso e a corda", null, ficha(10, [SIMBOLO]));
  t("as duas coisas que juntas não chegam: «Não chega para tudo», com a soma, e nada sai", naoChega.caminho === "nao" && /Não chega para tudo: ◉ 11/.test(naoChega.veredito.linha) && naoChega.veredito.ficha === null, J([naoChega.caminho, linhaOuFato(naoChega)]));
  const venda2 = P("vendo a corda e o símbolo sagrado ao Cornelius", null, ficha(13, [SIMBOLO, { nome: "Corda de cânhamo" }]));
  t("vender duas coisas: um cartão com as duas no rótulo e a soma das ofertas", cartao(venda2, "venda", 14) && /Corda/.test(venda2.cartao.leitura.venda.rotulo) && /Símbolo/.test(venda2.cartao.leitura.venda.rotulo), J([venda2.caminho, venda2.cartao]));
  t("…e o clique tira as duas da bolsa", (() => { const c2 = aPortaUnica("vendo a corda e o símbolo sagrado ao Cornelius", PRACA_B(ficha(13, [SIMBOLO, { nome: "Corda de cânhamo" }])), { ...CTX, confirmado: venda2.cartao }); return c2.caminho === "aplicado" && c2.veredito.ficha.inventario.length === 0 && c2.veredito.ficha.moedas === 27; })());
  /* 7. o pronome que retoma a coisa da frase anterior */
  const ret1 = P("compro ele", { jogador: "Cornelius, quanto custa esse amuleto de osso?" });
  t("«compro ele» depois de «quanto custa esse amuleto?»: o cartão do amuleto", cartao(ret1, "compra", 9) && /Amuleto/.test(ret1.cartao.leitura.compras[0].itens[0].nome), J([ret1.caminho, ret1.leitura && ret1.leitura.coisa]));
  const ret2 = P("levo essa", { jogador: "que corda é aquela no armazém?" });
  t("«levo essa» depois de «que corda é aquela?»: o cartão da corda", cartao(ret2, "compra", 2), J([ret2.caminho, ret2.leitura && ret2.leitura.coisa]));
  /* 8. duas ações na frase: a primeira e a segunda, em ordem, cada uma com a sua resposta; a que não segue é dita */
  t("o corte das ações: o «e» seguido de verbo corta; o «e» entre coisas não", J(asAcoesDaFrase("pago duas moedas à Prudence e compro uma corda")) === J(["pago duas moedas à Prudence", "compro uma corda"]) && asAcoesDaFrase("compro a corda e duas tochas").length === 1);
  const duas = P("pago duas moedas à Prudence e compro uma corda");
  t("«pago… e compro…»: a primeira aplica (◉ 28), e a segunda é o cartão com a bolsa que a primeira deixou", duas.caminho === "aplicado" && duas.veredito.ficha.moedas === 28 && duas.seguinte && duas.seguinte.agora && cartao(duas.seguinte.r, "compra", 2) && duas.seguinte.r.cartao.leitura.compras[0].bolsa === 28, J([duas.caminho, duas.seguinte && duas.seguinte.r.caminho]));
  const depois = P("compro uma corda e dou o símbolo sagrado riscado ao Cornelius");
  t("a primeira é um cartão: a segunda não some — é dita numa linha («uma coisa de cada vez»)", cartao(depois, "compra", 2) && depois.seguinte && !depois.seguinte.agora && /Uma coisa de cada vez/.test(depois.seguinte.linha) && depois.frase === "compro uma corda", J([depois.caminho, depois.seguinte && depois.seguinte.linha]));
  const mesma = P("compro uma corda e pago duas moedas");
  t("«compro… e pago…» é a mesma ação (o pagamento da primeira): uma resposta só", !mesma.seguinte && mesma.caminho === "aplicado" && mesma.veredito.ficha.moedas === 28, J([mesma.caminho, linhaOuFato(mesma)]));
  /* 9. o suborno à companheira vai à regra do grupo; o que vai ao dado rola no App (o «acontece» não o paga de graça) */
  const grupo = P("Lavinia, cinco moedas se você guardar segredo");
  t("a moeda oferecida à companheira: a bolsa do grupo é uma só (nada muda de mão)", grupo.caminho === "nao" && /é do seu grupo/.test(grupo.veredito.linha) && grupo.veredito.ficha === null, J([grupo.caminho, linhaOuFato(grupo)]));
  t("o suborno que a porta mandou ao dado não cai no «acontece» do momento (L10)", /if \(m && !m\.rola && v\.tipo === "teste" && !subornoAoDado\)/.test(adj) && /subornoAoDado = !!\(trocaAoDado && ovS && ovS\.intencao && ovS\.intencao\.tipo === "suborno"\)/.test(adj));
  t("a fiação executa a segunda ação, ou diz a linha do depois", /const executarASeguinte = \(r\) =>/.test(APP) && (APP.match(/executarASeguinte\(r\);/g) || []).length >= 4 && /if \(r\.seguinte && r\.seguinte\.linha\) pushMsgs/.test(APP));
}

console.log("\n" + bons + " ok, " + maus + " XX");
if (maus) process.exitCode = 1;
