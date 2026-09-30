/* ============================================================
   A CIDADE POR DENTRO (Fase MM, etapa MM12) — a ficha que ninguém tinha

   A sonda da mesa (MM1) pôs o jogador a perguntar ao Mestre o que se
   pergunta ao Matt ao chegar a uma cidade — "aqui todos falam a minha
   língua?", "quanto custa a diária?", "há quem estude magia?", "chamam
   esse povo de cabeças-de-vento?", "ela me dá isso de graça?", "usamos
   um distintivo para sermos reconhecidos?", "para que serve o sino que
   está a tocar?", "a rua é vigiada?" — e em todas a resposta era a
   mesma: NINGUÉM DECIDE. O Narrador inventava, e cada vez inventava
   outra coisa: a diária custava três moedas na terça e doze na quarta,
   e o sino tocava por um motivo diferente a cada pergunta.

   A cidade já tinha porte, região, bioma, locais, vocação (o comércio,
   v9.138) e o seu mercado. Faltava o que se vê de DENTRO: a fala da
   rua, o preço de uma cama, quem guarda a lei, as palavras de lá, o
   costume, o dia de hoje.

   ---------------- O QUE ESTE MÓDULO SABE ----------------

   A FICHA de uma cidade, derivada da SEMENTE DO MUNDO e da própria
   cidade — nada vai para o save. É a mesma régua do `mundo-base`: o
   mundo não é armazenado, é RECALCULADO. Quem volta a uma cidade acha a
   mesma língua, o mesmo preço e o mesmo apelido, em qualquer máquina.

     · a LÍNGUA — a comum, e a própria da região quando a região tem
       uma; a fronteira entende a do vizinho;
     · o POUSO — o preço de uma noite (quarto comum, quarto bom,
       estábulo) e da semana. As faixas SÃO as do `ECONOMIA_PROMPT` —
       o Narrador as lê desde a v7.1 e a ficha não abre uma segunda
       economia: ela escolhe, DENTRO delas, o número desta cidade;
     · as INSTITUIÇÕES — quem estuda magia, quem cura, quem guarda a
       lei — pelo PORTE, na mesma escala de peso que decide que locais
       uma cidade tem (`mundo-base`: a biblioteca pede peso 4, o
       quartel 3). Se a cidade tem a biblioteca, a ficha a nomeia;
     · a GÍRIA — o apelido que se dá aos de fora, a um ofício, e uma
       expressão, com o que QUER DIZER (a pergunta seguinte do jogador
       é sempre "no sentido de quê?");
     · o COSTUME — como se reconhece quem é bem-vindo (senha,
       salvo-conduto, marca, nada) e o que vale uma coisa dada;
     · a VIGILÂNCIA — quem vigia, de dia e de noite, e onde fica a
       brecha. O MM6 ("quem me vê") lê este campo fora da luta;
     · o HOJE — a festa do calendário, o luto, o dia de feira e o sino
       que está a tocar AGORA, pelo relógio do mundo.

   ---------------- O QUE VAI À PAUTA ----------------

   Pouco, e só o que a cena precisa. O HOJE e a LÍNGUA vão sempre (são
   o que a cena mostra), numa secção de prioridade baixa: numa pauta
   cheia, a gente presente ganha deles — o precedente é o DAQUI da
   v9.118. O RESTO só vai quando a frase do jogador PERGUNTA por ele, e
   aí vai numa secção de prioridade alta: a pergunta direta é o centro
   do turno, e uma resposta cortada pelo teto seria o Narrador a
   inventar exatamente o que o jogador quis saber.

   Nenhuma linha descreve: a pauta diz O QUE, o COMO é do Narrador.
   ============================================================ */

import { rngDe } from "./geografia.js";
import { vocacaoDe } from "./comercio.js";
import { festivalDe, ehNoite } from "./calendario.js";
import { locaisDaCidade, masmorrasDoMundo } from "./mundo-base.js";
import { comoChamam, chamadoDaRaca, GENEROS_FUTURISTAS } from "./lexico.js";
import { comEm } from "./lugar.js";
/* MM14: a frase do jogador sem os nomes próprios (o "Sino" do Sino Calado
   sequestrou seis respostas), e a posição de cada assunto na frase para a
   mesa juntar as respostas pela ordem em que foram pedidas */
import { fraseDoJogador, assuntoDaFrase } from "./perguntas.js";
/* MM14: a distância até um lugar nomeado — a mesma conta e a mesma escrita
   do Geógrafo e dos arredores, nunca uma segunda */
import { arredoresDaCidade, ondeFicaOArredor } from "./arredores.js";
import { coordDe, kmEntre, rumoEntre, linhaDePonto } from "./coordenadas.js";

const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const semA = (s) => norm(s).trim();

/* ---------------- A ESCALA ----------------
   O PESO do porte — a mesma régua de `mundo-base` (aldeia 1, vila 2,
   fortaleza 3, cidade 4, capital 5), estendida aos portes dos outros
   moldes pela posição que cada um ocupa na lista do seu molde. É por
   ela que tudo abaixo escolhe: o preço, quem estuda magia, quem vigia.
   `militar` é o porte de guarnição, que tem lei de quartel e não de
   rua. Uma suíte confere que todo porte de `PORTES` está aqui — um
   porte novo sem escala cairia no padrão calado. */
export const ESCALA_DO_PORTE = {
  ruina: 0,
  aldeia: 1, vila: 2, fortaleza: 3, cidade: 4, capital: 5, metropole: 5,
  patamar: 1, andar: 2, "andar-mestre": 4, "átrio": 5,
  fundeadouro: 1, "vila de pesca": 2, forte: 3, porto: 4, "porto franco": 5,
  "posto avançado": 1, "colônia": 2, base: 3, sistema: 4, "capital orbital": 5,
};
export const PORTES_MILITARES = ["fortaleza", "forte", "base"];
/* o porte que ninguém declarou é tratado como vila: nem aldeia sem sino,
   nem capital com academia — o meio honesto */
const ESCALA_PADRAO = 2;

function escalaDe(cidade) {
  const porte = String((cidade && (cidade.porte || cidade.tipo)) || "");
  const e = ESCALA_DO_PORTE[porte];
  return Number.isFinite(e) ? e : ESCALA_PADRAO;
}

/* ---------------- A LÍNGUA ----------------
   Cada REGIÃO decide, pela semente, se tem fala própria. A maioria não
   tem: a comum corre o mundo, e a fala própria é a exceção que faz uma
   região ser outra terra. Num mundo de fantasia, metade das falas
   próprias é a de um povo (a tabela abaixo dá o nome da língua); a
   outra metade é o falar da própria região. Mundo futurista não tem
   língua de raça: tem o dialeto do setor. */
export const LINGUA_DA_REGIAO = {
  comum: "a comum",
  chancePropria: 0.4,
  chanceDePovo: 0.5,
  /* abaixo desta distância no mapa (a unidade do pergaminho), a cidade
     mais próxima de OUTRA região faz desta uma cidade de fronteira */
  fronteira: 14,
};
export const LINGUAS_DOS_POVOS = [
  { raca: "Anão", lingua: "o anão" },
  { raca: "Elfo", lingua: "o élfico" },
  { raca: "Halfling", lingua: "o halfling" },
  { raca: "Draconato", lingua: "o dracônico" },
  { raca: "Gnomo", lingua: "o gnômico" },
  { raca: "Goliath", lingua: "o gigante" },
  { raca: "Tiefling", lingua: "o infernal" },
];
/* Quem fala o quê, pelo tamanho do lugar. Quanto menor, menos a comum
   chega à rua: a aldeia fala a sua, e a comum é de quem negocia fora.
   `semPropria` vale quando a região só tem a comum. {p} é a fala própria. */
export const ALCANCE_DA_COMUM = {
  1: { rua: "{p} na rua", naoFala: "quase ninguém fala a comum — só o taverneiro e quem negocia fora", semPropria: "a comum, com o sotaque carregado da terra" },
  2: { rua: "as duas, {p} e a comum", naoFala: "os velhos e as crianças só falam {p}", semPropria: "a comum, com sotaque da terra" },
  3: { rua: "a comum, que é a língua das ordens", naoFala: "{p} só entre a tropa da terra", semPropria: "a comum, que é a língua das ordens" },
  4: { rua: "a comum", naoFala: "{p} no mercado baixo e dentro de casa", semPropria: "a comum; todos a falam" },
  5: { rua: "a comum, e ouve-se de tudo", naoFala: "{p} nos bairros de quem veio da terra", semPropria: "a comum, e ouve-se de tudo — é a língua de quem vem de longe" },
};

function linguaDaRegiao(semente, regiao, genero, lex) {
  if (!regiao) return null;
  const rnd = rngDe(`${semente}|lingua|${regiao}`);
  if (rnd() >= LINGUA_DA_REGIAO.chancePropria) return null;
  const futuro = GENEROS_FUTURISTAS.includes(String(genero || ""));
  if (!futuro && rnd() < LINGUA_DA_REGIAO.chanceDePovo) {
    const p = pick(rnd, LINGUAS_DOS_POVOS);
    /* o povo renomeado pelo léxico continua a ter a mesma língua, mas a
       gente diz o nome DELE — "o anão, a fala dos filhos-da-rocha" */
    const chamado = chamadoDaRaca(lex, p.raca);
    return { lingua: p.lingua, povo: chamado !== p.raca ? chamado : "" };
  }
  return { lingua: futuro ? `o dialeto de ${regiao}` : `o falar de ${regiao}`, povo: "" };
}

/* a cidade mais perto que é de OUTRA região — a vizinha. Sem coordenada,
   não há vizinha: a ficha não inventa geografia que o mapa não tem. */
function vizinhaDeFora(cidade, mapa) {
  const cs = ((mapa && mapa.cidades) || []).filter((c) => c && c.regiao && c.regiao !== cidade.regiao
    && Number.isFinite(Number(c.x)) && Number.isFinite(Number(c.y)));
  if (!cs.length || !Number.isFinite(Number(cidade.x)) || !Number.isFinite(Number(cidade.y))) return null;
  let melhor = null, dMin = Infinity;
  for (const c of cs) {
    const d = Math.hypot(Number(c.x) - Number(cidade.x), Number(c.y) - Number(cidade.y));
    if (d < dMin) { dMin = d; melhor = c; }
  }
  return melhor ? { cidade: melhor, distancia: dMin } : null;
}

/* ---------------- O POUSO ----------------
   As faixas são as que o Narrador lê desde a v7.1 no `ECONOMIA_PROMPT`
   ("noite em estalagem simples ◉ 3–6, quarto bom ◉ 8–15") — a base fica
   no MEIO de cada uma, e a suíte lê o texto de lá para provar que não
   saiu dele. O porte move o número dentro da regra de cidades que o
   mesmo texto já dá: vila mais barata, capital e porto rico mais caros,
   nunca além de metade ou do dobro. */
export const PRECOS_DO_POUSO = {
  comum: 4,
  bom: 10,
  estabulo: 1,
  /* a semana paga seis noites e dorme sete: é o desconto de quem fica */
  semana: { noites: 7, pagas: 6 },
  camasPorQuarto: 2,
  fatorPorEscala: { 1: 0.6, 2: 0.75, 3: 1, 4: 1, 5: 1.5 },
  /* o porto é rico e cobra; a vocação sai do `comercio.js`, que já a tem */
  fatorPorVocacao: { portuaria: 1.25 },
  piso: 0.5, teto: 2,
  /* a aldeia não tem quarto bom: tem o de cima, e mais nada */
  semQuartoBom: [1],
};

function pousoDe(cidade, escala) {
  const P = PRECOS_DO_POUSO;
  const voc = vocacaoDe(cidade);
  const f0 = (P.fatorPorEscala[escala] || 1) * ((voc && P.fatorPorVocacao[voc.id]) || 1);
  const f = Math.max(P.piso, Math.min(P.teto, f0));
  const preco = (base) => Math.max(1, Math.round(base * f));
  const comum = preco(P.comum);
  return {
    comum,
    bom: P.semQuartoBom.includes(escala) ? null : preco(P.bom),
    estabulo: preco(P.estabulo),
    semana: comum * P.semana.pagas,
    camas: P.camasPorQuarto,
    fator: f,
  };
}

/* ---------------- AS INSTITUIÇÕES ----------------
   Quem estuda magia, quem cura, quem guarda a lei — por escala, e a
   semente escolhe entre as opções da mesma escala para duas vilas não
   serem gêmeas. {magia} e {guarda} são as palavras do léxico ("magia",
   "a guarda" num mundo comum; "o despertar", "a Associação" num mundo
   de caçadores). */
export const INSTITUICOES = {
  magia: {
    1: ["ninguém — o mais perto é a benzedeira, e o dela é erva e reza", "ninguém; um andarilho que sabe {magia} passa por aqui na primavera"],
    2: ["um velho que estudou {magia} fora e dá lições a quem paga", "ninguém de ofício; o boticário tem dois livros de {magia} e muita opinião"],
    3: ["só o conjurador da guarnição, e ele serve à guarnição"],
    4: ["um círculo de estudiosos de {magia}, pequeno e desconfiado", "uma escola de {magia} de três mestres e vinte alunos"],
    5: ["uma academia de {magia} com torre própria — entra quem paga ou quem é chamado", "duas academias de {magia}, rivais, e o conselho finge não ver"],
  },
  cura: {
    1: ["a benzedeira, com ervas", "a parteira, que também costura feridas"],
    2: ["um curandeiro de ofício", "a capela, com um acólito que sabe ervas"],
    3: ["o cirurgião da guarnição"],
    4: ["o templo, que cura por esmola", "dois curandeiros de guilda, e o templo para quem não paga"],
    5: ["o templo maior e as casas de cura — de graça só para os fiéis", "as casas de cura da guilda, caras, e o templo, cheio"],
  },
  lei: {
    1: ["ninguém de ofício: o ancião e os vizinhos", "três lavradores com lanças, quando é preciso"],
    2: ["uma milícia de voluntários, com um capitão pago", "o xerife e dois ajudantes"],
    3: ["a guarnição — a lei é a palavra do comandante"],
    4: ["{guarda} da cidade, com quartel próprio"],
    5: ["{guarda} da coroa, e as patrulhas de cada bairro"],
  },
};

/* ---------------- A VIGILÂNCIA ----------------
   Quem vê a rua, de dia e de noite, e onde fica a brecha. É o campo
   que o MM6 ("quem me vê") lê fora da luta, onde não há grade. */
export const VIGILANCIA = {
  1: { dia: "ninguém vigia, mas todos se conhecem: o estranho é notado na hora", noite: "ninguém; só os cães", brecha: "de noite a rua é de quem estiver acordado" },
  2: { dia: "o capitão da milícia na praça", noite: "um vigia na entrada principal até a meia-noite", brecha: "depois da meia-noite não há ninguém" },
  3: { dia: "sentinelas no muro e na porta", noite: "sentinelas na porta e ronda de hora em hora", brecha: "quase nenhuma: dentro dos muros tudo é visto" },
  4: { dia: "{guarda} nas portas e no mercado", noite: "{guarda} nas portas e ronda de dois nas ruas principais, de hora em hora", brecha: "os becos e o bairro baixo ficam sem ronda" },
  5: { dia: "{guarda} nas portas, no mercado e nas pontes", noite: "portas fechadas, rondas de quatro e archotes nas esquinas", brecha: "os telhados e o cais" },
};

/* ---------------- O RECONHECIMENTO ----------------
   Como a cidade sabe quem é bem-vindo. A aldeia conhece de cara; a
   fortaleza pede a senha; a cidade grande dá papel e cobra nas pontes. */
export const RECONHECIMENTO = {
  1: ["nenhum: aqui todos se conhecem de cara, e o forasteiro é o forasteiro"],
  2: ["nenhum de papel: quem é bem-vindo ganha uma fita no pulso na primeira noite", "nenhum; quem responde por você é quem o hospeda"],
  3: ["a senha do dia, trocada ao pôr do sol — sem ela não se passa a porta à noite"],
  4: ["um salvo-conduto selado na porta, que vale sete dias", "uma marca de giz no manto, dada pela guarda na entrada, que vale até a lua virar"],
  5: ["um salvo-conduto com selo e nome, pedido na porta e cobrado nas pontes", "uma medalha de cobre de visitante, devolvida na saída"],
};

/* ---------------- A DÁDIVA ----------------
   O que vale uma coisa dada. É costume da cidade, não preço de item:
   decide se "ela me dá isto de graça?" é gentileza, dívida ou armadilha. */
export const DADIVAS = [
  { id: "hospitaleira", escalas: [1, 2], o: "o primeiro copo e o pão do forasteiro são de graça, e recusar ofende" },
  { id: "favor", escalas: [1, 2, 3, 4], o: "nada se dá: o que vem de graça se paga depois com um favor, e cobram" },
  { id: "honra", escalas: [2, 3, 4, 5], o: "presente se aceita e se retribui antes de partir; sair sem retribuir é afronta" },
  { id: "mercante", escalas: [4, 5], o: "tudo tem preço, até a água do poço — \"de graça\" aqui é isca de mercador" },
];

/* ---------------- A GÍRIA ----------------
   Três palavras de lá, cada uma com o que QUER DIZER: o apelido que se
   dá aos de fora (a região vizinha, pelo mapa), o de um ofício, e uma
   expressão. `futuro: false` fica fora dos mundos futuristas. */
export const APELIDOS_DE_FORA = [
  { a: "cabeças-de-vento", quer: "gente leviana, que fala antes de pensar" },
  { a: "pés-de-lama", quer: "caipiras lentos, que chegam tarde a tudo" },
  { a: "mãos-de-sal", quer: "sovinas, que não largam uma moeda" },
  { a: "narizes-de-cera", quer: "orgulhosos, que se acham melhores" },
  { a: "bocas-de-sino", quer: "linguarudos, que espalham tudo o que ouvem" },
  { a: "olhos-de-peixe", quer: "desconfiados, que nunca olham de frente" },
  { a: "comedores-de-nabo", quer: "pobres e teimosos", futuro: false },
];
export const APELIDOS_DE_OFICIO = [
  { alvo: "autoridade", a: "os cinzentos", quer: "pela cor da capa, e pela pouca graça" },
  { alvo: "autoridade", a: "os de lata", quer: "muito metal e pouca coragem" },
  { alvo: "magia", a: "queima-velas", quer: "quem passa a noite em livros e não serve para nada de dia" },
  { alvo: "heroi", a: "pés-de-estrada", quer: "quem vive da encrenca alheia e nunca fica" },
  { alvo: "heroi", a: "caça-sarna", quer: "quem vai atrás de problema por dinheiro" },
];
export const EXPRESSOES = [
  { e: "sal na língua", quer: "mentira" },
  { e: "que o fogo te ache", quer: "boa sorte, dita a quem parte" },
  { e: "pagar em nabo", quer: "prometer e não cumprir", futuro: false },
  { e: "virar a caneca", quer: "desistir" },
  { e: "falar para o poço", quer: "falar sem ninguém ouvir" },
];

/* ---------------- O HOJE ----------------
   O calendário já tem as festas; a ficha acrescenta o que é da cidade:
   o dia de feira (um dia fixo da semana de sete, pela semente), o luto
   (raro, pelo dia) e o sino das horas. A aldeia não tem sino; a
   guarnição tem corneta; o mundo futurista, sirene. */
export const O_HOJE = {
  semana: 7,
  /* uma cidade em cada quarenta dias está de luto */
  chanceDeLuto: 1 / 40,
  quemSeEnterra: ["um velho mestre de ofício", "o sineiro", "uma criança levada pela febre", "a dona da estalagem mais antiga", "um pescador que o rio devolveu"],
  feiraDesdeEscala: 2,
  sinoDesdeEscala: 2,
  sinal: { comum: "o sino", militar: "a corneta", futuro: "a sirene" },
};
export const SINOS = [
  { de: 6 * 60, ate: 6 * 60 + 30, hora: "6h", nome: "da alva", o: "abrem-se as portas e começa o trabalho" },
  { de: 12 * 60, ate: 12 * 60 + 30, hora: "12h", nome: "do meio-dia", o: "pausa para comer; o mercado baixa as bancas" },
  { de: 18 * 60, ate: 18 * 60 + 30, hora: "18h", nome: "das vésperas", o: "fecham-se as oficinas; hora da reza" },
  { de: 21 * 60, ate: 21 * 60 + 30, hora: "21h", nome: "do recolher", o: "fecham-se as portas; na rua depois disto, só com motivo" },
];

const trocar = (txt, lex) => String(txt || "")
  .replace(/\{magia\}/g, comoChamam(lex, "magia") || "magia")
  .replace(/\{guarda\}/g, comoChamam(lex, "autoridade") || "a guarda");

/* ---------------- A FICHA ----------------
   Pura e total: `null`, cidade sem nome ou sem porte — nunca erro, e
   sempre todos os campos. A cidade sem dados recebe a ficha da vila. */
export function fichaDaCidade(cidade, ctx = {}) {
  const o = ctx && typeof ctx === "object" ? ctx : {};
  const c = cidade && typeof cidade === "object" ? cidade : {};
  const semente = String(o.semente || "");
  const lex = o.lex || null;
  const genero = String(o.genero || "");
  const nome = String(c.nome || "");
  const porte = String(c.porte || c.tipo || "");
  const escalaBruta = escalaDe(c);
  /* a ruína não tem gente: a ficha dela é a da aldeia, e ninguém mora */
  const escala = Math.max(1, Math.min(5, escalaBruta));
  const militar = PORTES_MILITARES.includes(porte);
  const palavras = { magia: comoChamam(lex, "magia") || "magia", guarda: comoChamam(lex, "autoridade") || "a guarda" };
  const futuro = GENEROS_FUTURISTAS.includes(genero);
  const rnd = rngDe(`${semente}|ficha|${nome}`);

  /* a língua */
  const propria = linguaDaRegiao(semente, c.regiao, genero, lex);
  const al = ALCANCE_DA_COMUM[escala];
  const pl = propria ? propria.lingua : "";
  const viz = vizinhaDeFora(c, o.mapa);
  const daVizinha = viz && viz.distancia <= LINGUA_DA_REGIAO.fronteira
    ? linguaDaRegiao(semente, viz.cidade.regiao, genero, lex) : null;
  const lingua = {
    comum: LINGUA_DA_REGIAO.comum,
    propria: pl,
    povo: propria ? propria.povo : "",
    rua: propria ? al.rua.replace(/\{p\}/g, pl) : al.semPropria,
    naoFala: propria ? al.naoFala.replace(/\{p\}/g, pl) : "",
    fronteira: daVizinha && daVizinha.lingua !== pl ? { regiao: viz.cidade.regiao, lingua: daVizinha.lingua } : null,
  };

  /* as instituições — a biblioteca, o templo e o quartel que a cidade TEM
     são os que o Narrador já conhece pelo resumo do lugar; a ficha os
     nomeia em vez de inventar um segundo prédio para a mesma coisa */
  const locais = nome ? locaisDaCidade(semente, c, genero || "Fantasia medieval", o.molde || null, lex) : [];
  const localDo = (tipo) => (locais.find((l) => l.tipo === tipo) || {}).nome || "";
  const esc = (tab) => trocar(pick(rnd, tab[militar ? 3 : escala] || tab[escala]), lex);
  const magia = esc(INSTITUICOES.magia);
  const cura = esc(INSTITUICOES.cura);
  const lei = esc(INSTITUICOES.lei);
  const instituicoes = {
    magia: localDo("biblioteca") && escala >= 4 ? `${magia} — os livros ficam ${comEm(localDo("biblioteca"))}` : magia,
    cura: localDo("templo") && escala >= 4 ? `${cura} (${localDo("templo")})` : cura,
    lei: localDo("quartel") && escala >= 3 ? `${lei} (${localDo("quartel")})` : lei,
  };

  const vg = VIGILANCIA[militar ? 3 : escala];
  const vigilancia = { dia: trocar(vg.dia, lex), noite: trocar(vg.noite, lex), brecha: trocar(vg.brecha, lex) };

  const reconhecimento = pick(rnd, RECONHECIMENTO[militar ? 3 : escala]);
  const dadivas = DADIVAS.filter((d) => d.escalas.includes(militar ? 3 : escala));
  const dadiva = pick(rnd, dadivas.length ? dadivas : DADIVAS);

  /* a gíria: os de fora são os da região vizinha quando o mapa a dá */
  const cabe = (x) => !(futuro && x.futuro === false);
  const deFora = pick(rnd, APELIDOS_DE_FORA.filter(cabe));
  const deOficio = pick(rnd, APELIDOS_DE_OFICIO);
  const expr = pick(rnd, EXPRESSOES.filter(cabe));
  const quemDeFora = viz ? `os de ${viz.cidade.regiao}` : "os forasteiros";
  const giria = [
    { alvo: quemDeFora, palavra: deFora.a, quer: deFora.quer },
    { alvo: deOficio.alvo === "autoridade" ? palavras.guarda
      : deOficio.alvo === "magia" ? `quem estuda ${palavras.magia}`
        : `quem é ${comoChamam(lex, "heroi") || "aventureiro"}`, palavra: deOficio.a, quer: deOficio.quer },
    { alvo: "", palavra: expr.e, quer: expr.quer },
  ];

  const hoje = {
    diaDaFeira: escala >= O_HOJE.feiraDesdeEscala ? Math.floor(rngDe(`${semente}|feira|${nome}`)() * O_HOJE.semana) : null,
    sinal: escala >= O_HOJE.sinoDesdeEscala ? (futuro ? O_HOJE.sinal.futuro : militar ? O_HOJE.sinal.militar : O_HOJE.sinal.comum) : "",
  };

  return {
    nome, porte, escala, militar, palavras,
    /* MM14: os nomes das casas desta cidade — quem lê a frase do jogador
       apaga-os antes de procurar o assunto ("o Sino Calado" não é o sino) */
    lugares: locais.map((l) => l.nome).filter(Boolean),
    lingua,
    pouso: pousoDe(c, escala),
    instituicoes,
    vigilancia,
    reconhecimento,
    dadiva: { id: dadiva.id, o: dadiva.o },
    giria,
    hoje,
  };
}

/* O dia de hoje nesta cidade: a festa do calendário, o luto, a feira, o
   sino que toca agora. Determinístico pelo dia e pelo minuto. */
/* `foraDeHora`: os sinos que tocaram fora de hora HOJE nesta cidade — quem
   os sabe é a abertura (`sinosForaDeHora`, abertura.js), e o App passa-os;
   aqui só se filtram os que servem: com hora e com o que foi. */
const foraDeHoraValidos = (lista) => (Array.isArray(lista) ? lista : [])
  .filter((x) => x && typeof x === "object" && typeof x.hora === "string" && x.hora && typeof x.o === "string" && x.o)
  .slice(0, 2)
  .map((x) => ({ hora: x.hora.slice(0, 5), o: x.o.slice(0, 200), curto: typeof x.curto === "string" ? x.curto.slice(0, 90) : "" }));

function hojeDe(ficha, { semente = "", dia = 1, minuto = null, foraDeHora = null } = {}) {
  const d = Math.max(1, Math.floor(Number(dia) || 1));
  const festa = festivalDe(d);
  const rl = rngDe(`${semente}|luto|${ficha.nome}|${d}`);
  const luto = ficha.nome && rl() < O_HOJE.chanceDeLuto ? pick(rl, O_HOJE.quemSeEnterra) : "";
  const feira = ficha.hoje.diaDaFeira != null && d % O_HOJE.semana === ficha.hoje.diaDaFeira;
  const m = Number.isFinite(Number(minuto)) && minuto !== null ? Number(minuto) : null;
  let sino = null;
  if (ficha.hoje.sinal && m != null) {
    if (luto) sino = { nome: `${ficha.hoje.sinal} a finados`, o: `dobra pelo enterro de ${luto}` };
    else {
      const s = SINOS.find((x) => m >= x.de && m < x.ate);
      if (s) sino = { nome: `${ficha.hoje.sinal} ${s.nome}`, o: s.o };
    }
  }
  return { festa, luto, feira, sino, noite: m != null ? ehNoite(m) : false, foraDeHora: foraDeHoraValidos(foraDeHora) };
}

/* ---------------- AS PERGUNTAS ----------------
   As palavras que dizem que o jogador perguntou por um pedaço da ficha.
   Sem a peneira da declaração, de propósito: aqui a PERGUNTA é o que se
   quer, e "pago a diária" pede o preço tanto quanto "quanto é a diária?".
   Grosseiro de propósito: um falso positivo custa uma linha verdadeira
   sobre a cidade; um falso negativo devolve a pergunta à invenção. */
export const PERGUNTAS_DA_CIDADE = [
  { id: "pouso", rx: /\b(diaria|pernoite|quartos?|hospedage|estalage|pousada|estabul|dormir aqui)/ },
  { id: "lingua", rx: /\b(lingua|idioma|dialeto|sotaque|traduz|mesma fala|falam (a|o|minha))/ },
  { id: "magia", rx: /\b(magia|arcan|mago|maga|feiti|academia|conjur)/ },
  { id: "cura", rx: /\b(curandeir|quem cura|curar|medico|templo|sacerdot)/ },
  { id: "lei", rx: /\b(guarda|milicia|xerife|autoridade|lei\b|prender|preso)/ },
  { id: "vigia", rx: /\b(vigi|ronda|patrulh|sentinela|sem ser vist|despercebid|recolher)/ },
  { id: "giria", rx: /\b(chamam|apelid|giria|xinga|no sentido|quer dizer|significa)/ },
  { id: "reconhecer", rx: /\b(distintivo|salvo-conduto|salvo conduto|senha|insignia|reconhec|credencial|passe\b)/ },
  { id: "hoje", rx: /\b(sino|badal|corneta|sirene|festa|festival|feira|luto|enterro)/ },
  { id: "dadiva", rx: /\b(de graca|gratis|presente|sem cobrar|nao cobra|de oferta)/ },
  /* MM14: "a que distância fica o Poço de Sal?" — a sessão de prova levou o
     rumo e nunca a distância (T15). O LUGAR sai da frase inteira; aqui só
     se reconhece que se pergunta pela distância. */
  { id: "distancia", rx: /\b(a que distancia|que distancia|distancia (ate|de|daqui)|a quantos (passos|metros|km|quilometros|dias|horas|minutos|leguas)|quanto tempo (ate|leva|demora|se leva|de caminhada)|quanto falta|quao longe|(e|fica|esta) (longe|perto)|longe daqui|perto daqui|quantos dias (ate|de))/ },
];
/* no máximo duas respostas por turno: quem pergunta três coisas de uma
   vez recebe as duas primeiras, e a terceira no turno seguinte */
export const RESPOSTAS_POR_TURNO = 2;

/* AS LINHAS NÃO DIZEM O NOME DA CIDADE: o ONDE já o disse, e repeti-lo
   em cada linha custava quinze caracteres de uma pauta que, numa taverna
   cheia, não tem quinze para dar (medido em teste-mm12-cidade). */
const linhaDaLingua = (f) => {
  const l = f.lingua;
  const povo = l.povo ? ` (a fala dos ${l.povo})` : "";
  return `língua: ${l.rua}${povo}${l.naoFala ? `; ${l.naoFala}` : ""}`
    + `${l.fronteira ? `; é fronteira — entende-se ${l.fronteira.lingua}, de ${l.fronteira.regiao}` : ""}`;
};

/* `inteira`: a festa com o que ela é. No ambiente vai só o nome — a
   descrição custa cem caracteres por turno para dizer o que o Narrador
   só precisa quando alguém pergunta. */
function linhaDoHoje(f, h, { inteira = false } = {}) {
  const partes = [];
  /* MM14: o sino que tocou FORA de hora hoje (o prenúncio e o rebate da
     MM13) é o fato mais alto do dia — foi ele que a taverneira negou no
     T43 ("não toca fora de hora há anos"), porque a pauta só levava o sino
     das horas. No ambiente vai a forma curta; perguntado, a inteira. */
  for (const x of h.foraDeHora || []) partes.push(`às ${x.hora}, ${inteira || !x.curto ? x.o : x.curto}`);
  if (h.festa) partes.push(inteira ? `dia de ${h.festa.nome} (${h.festa.descricao})` : `dia de ${h.festa.nome}`);
  if (h.luto) partes.push(`luto: enterram ${h.luto}`);
  if (h.feira && !h.festa) partes.push("dia de feira, a praça cheia");
  if (h.sino) partes.push(`toca agora ${h.sino.nome} (${h.sino.o})`);
  return partes.length ? `hoje: ${partes.join("; ")}` : "";
}

/* todo apelido e expressão das tabelas — para reconhecer, na frase do
   jogador, a palavra de gíria que ele trouxe, seja daqui ou não */
const TODAS_AS_GIRIAS = [...APELIDOS_DE_FORA.map((x) => x.a), ...APELIDOS_DE_OFICIO.map((x) => x.a), ...EXPRESSOES.map((x) => x.e)];

function resposta(id, f, h, frase = "") {
  if (id === "pouso") {
    const p = f.pouso;
    /* MM14: mais curta (−40), os mesmos números. Na taverna cheia a segunda
       resposta de uma frase que pergunta duas coisas não cabia atrás desta
       (teste-mm14-perguntas §5) */
    return `pouso: quarto comum ◉ ${p.comum} a noite (◉ ${p.semana} a semana)`
      + (p.bom != null ? `, bom ◉ ${p.bom}` : ", não há quarto bom")
      + `, estábulo ◉ ${p.estabulo} por animal; ${p.camas} camas por quarto`;
  }
  if (id === "lingua") return linhaDaLingua(f);
  if (id === "magia") return `quem estuda ${f.palavras.magia}: ${f.instituicoes.magia}`;
  if (id === "cura") return `quem cura: ${f.instituicoes.cura}`;
  if (id === "lei") return `quem guarda a lei: ${f.instituicoes.lei}`;
  if (id === "vigia") {
    const v = f.vigilancia;
    return `quem vigia a rua ${h.noite ? "de noite (agora)" : "de dia (agora)"}: ${h.noite ? v.noite : v.dia}; ${h.noite ? "de dia" : "de noite"}: ${h.noite ? v.dia : v.noite}; a brecha: ${v.brecha}`;
  }
  if (id === "giria") {
    const linha = "gíria: " + f.giria.map((g) => (g.alvo
      ? `chamam ${g.alvo} de "${g.palavra}" (${g.quer})`
      : `"${g.palavra}" quer dizer ${g.quer}`)).join("; ");
    /* o apelido que o jogador trouxe e que NÃO é daqui: a resposta
       honesta é "aqui não se diz isso" — senão o Narrador o adota */
    const alheio = TODAS_AS_GIRIAS.find((a) => frase && frase.includes(norm(a)) && !f.giria.some((g) => g.palavra === a));
    return alheio ? `${linha}; "${alheio}" não se diz aqui` : linha;
  }
  if (id === "reconhecer") return `como se reconhece quem é bem-vindo: ${f.reconhecimento}`;
  if (id === "dadiva") return `o costume com o que se dá: ${f.dadiva.o}`;
  if (id === "hoje") {
    const hj = linhaDoHoje(f, h, { inteira: true });
    const sinos = f.hoje.sinal
      ? `${f.hoje.sinal} das horas: ${SINOS.map((x) => `${x.hora} ${x.nome.replace(/^d[aeo]s? /, "")}`).join(", ")}`
      : "não há sino";
    const feira = f.hoje.diaDaFeira != null && !h.feira ? "; feira uma vez por semana" : "";
    /* perguntado o sino fora da hora dele, a resposta honesta é que
       nenhum sino DA CIDADE toca agora — o que o jogador ouve, se ouve,
       é outra coisa, e é da cena */
    const agora = f.hoje.sinal && !h.sino ? `; agora não toca ${f.hoje.sinal} da cidade` : "";
    return `${hj ? hj + "; " : ""}${sinos}${feira}${agora}`;
  }
  return "";
}

/* ---------------- A DISTÂNCIA (MM14) ----------------
   Até um lugar NOMEADO na frase: um arredor (a caminhada que o sistema lhe
   deu), uma masmorra do mundo (com o que se sabe dela de fora: o tipo, o
   perigo, as salas), outra cidade (com os dias de estrada, se há rota) ou
   uma casa daqui (dentro dos muros). A conta e a escrita são as do
   Geógrafo (`linhaDePonto`): rumo, distância e, até onde se vai a pé, o
   tempo de pé. Nomeado primeiro na frase ganha; nenhum nomeado, nenhuma
   linha — a distância de um lugar que o sistema não conhece é da cena. */
function citaLugar(frase, nome) {
  let melhor = -1;
  for (const alvo of [norm(nome).trim(), norm(String(nome || "").replace(/^(o|a|os|as)\s+/i, "")).trim()]) {
    if (alvo.length < 3) continue;
    let i = frase.indexOf(alvo);
    while (i >= 0) {
      const a = i > 0 ? frase[i - 1] : " ", d = frase[i + alvo.length] || " ";
      if (!/[a-z0-9]/.test(a) && !/[a-z0-9]/.test(d)) { if (melhor < 0 || i < melhor) melhor = i; break; }
      i = frase.indexOf(alvo, i + 1);
    }
  }
  return melhor;
}

function linhaDaDistancia(cidade, f, o, frase) {
  const semente = String(o.semente == null ? "" : o.semente);
  const mapa = o.mapa && typeof o.mapa === "object" ? o.mapa : {};
  const c0 = coordDe(cidade);
  const pontos = [];
  for (const nome of f.lugares || []) pontos.push({ nome, dentro: true });
  if (c0) {
    try {
      for (const a of arredoresDaCidade(semente, cidade)) {
        const w = ondeFicaOArredor(cidade, a);
        if (w) pontos.push({ nome: a.nome, coord: w.coord, km: w.km, rumo: w.rumo });
      }
    } catch { /* sem arredores, sem linha deles */ }
    try {
      for (const m of masmorrasDoMundo(semente, mapa)) {
        const q = coordDe(m);
        if (q) pontos.push({ nome: m.nome, coord: q, km: kmEntre(c0, q), rumo: rumoEntre(c0, q), mais: `${m.tipo}, perigo de nível ${m.nivel}, ${m.salas} salas` });
      }
    } catch { /* sem masmorras, sem linha delas */ }
    const rotas = Array.isArray(mapa.rotas) ? mapa.rotas : [];
    for (const c of (Array.isArray(mapa.cidades) ? mapa.cidades : [])) {
      if (!c || !c.nome || semA(c.nome) === semA(cidade.nome)) continue;
      const q = coordDe(c);
      if (!q) continue;
      const r = rotas.find((x) => x && ((semA(x.de) === semA(cidade.nome) && semA(x.para) === semA(c.nome)) || (semA(x.para) === semA(cidade.nome) && semA(x.de) === semA(c.nome))));
      const dias = r && Number(r.dias) > 0 ? Number(r.dias) : 0;
      pontos.push({ nome: c.nome, coord: q, km: kmEntre(c0, q), rumo: rumoEntre(c0, q), mais: dias ? `${dias} dia${dias > 1 ? "s" : ""} de estrada` : "" });
    }
  }
  let alvo = null, onde = -1;
  for (const p of pontos) {
    const i = citaLugar(frase, p.nome);
    if (i < 0) continue;
    if (!alvo || i < onde || (i === onde && String(p.nome).length > String(alvo.nome).length)) { alvo = p; onde = i; }
  }
  if (!alvo) return "";
  if (alvo.dentro) return `distância: ${alvo.nome} fica dentro dos muros — minutos a pé`;
  if (!Number.isFinite(alvo.km)) return "";
  return `distância: ${linhaDePonto(alvo)}${alvo.mais ? ` — ${alvo.mais}` : ""}`;
}

/* ---------------- O QUE SOBE À PAUTA ----------------
   `cidade`: o hoje e a língua, sempre que se está numa cidade — as duas
   coisas que a cena mostra sem ninguém perguntar. `pergunta`: a linha
   do que a frase do jogador pediu, e só isso. Quando a pergunta é pela
   língua, a língua sobe para a resposta e sai do ambiente — a mesma
   verdade não entra duas vezes no mesmo turno.

   MM14: `em` diz, para cada linha de `pergunta`, onde o assunto dela está
   na frase — é por aí que a mesa junta as respostas das várias fichas
   (`juntarRespostas`, perguntas.js). O ASSUNTO procura-se na frase SEM os
   nomes próprios: os lugares desta cidade, as outras cidades, os `nomes`
   que o App conhece (a gente, o lugar onde se está) e toda palavra com
   maiúscula no meio da oração. A frase que chega pode ser um envelope do
   sistema: vale o que está no "Eu disse". */
export function fichaParaPauta(cidade, ctx = {}) {
  const o = ctx && typeof ctx === "object" ? ctx : {};
  const out = { cidade: [], pergunta: [], em: [] };
  if (!cidade || typeof cidade !== "object" || !cidade.nome) return out;
  /* a ruína não tem rua, nem língua, nem sino */
  if (escalaDe(cidade) < 1) return out;
  const f = fichaDaCidade(cidade, o);
  const h = hojeDe(f, { semente: o.semente, dia: o.dia, minuto: o.minuto, foraDeHora: o.foraDeHora });
  const dita = fraseDoJogador(o.frase);
  const frase = norm(dita);
  const cidades = (o.mapa && Array.isArray(o.mapa.cidades) ? o.mapa.cidades : []).map((c) => c && c.nome).filter(Boolean);
  const nomes = [cidade.nome, ...cidades, ...(f.lugares || []), ...(Array.isArray(o.nomes) ? o.nomes : [])].filter((x) => typeof x === "string");
  const assunto = assuntoDaFrase(dita, nomes);
  const pedidos = [];
  if (frase.trim()) {
    /* pela ORDEM em que aparecem na frase: quem pergunta o preço e depois
       a guarda quer o preço primeiro */
    const achados = PERGUNTAS_DA_CIDADE
      .map((p) => { const m = assunto.match(p.rx); return m ? { id: p.id, pos: m.index } : null; })
      .filter(Boolean);
    /* a palavra de gíria dita pelo jogador — daqui ou de fora — também é
       pergunta pela gíria (na frase inteira: "Cabeças-de-vento" com
       maiúscula continua a ser a palavra de que se pergunta) */
    if (!achados.some((a) => a.id === "giria")) {
      const i = TODAS_AS_GIRIAS.map((g) => frase.indexOf(norm(g))).filter((x) => x >= 0);
      if (i.length) achados.push({ id: "giria", pos: Math.min(...i) });
    }
    achados.sort((a, b) => a.pos - b.pos);
    for (const a of achados) if (!pedidos.some((x) => x.id === a.id) && pedidos.length < RESPOSTAS_POR_TURNO) pedidos.push(a);
  }
  for (const a of pedidos) {
    const l = a.id === "distancia" ? linhaDaDistancia(cidade, f, o, frase) : resposta(a.id, f, h, frase);
    if (l) { out.pergunta.push(l); out.em.push(a.pos); }
  }
  const hj = linhaDoHoje(f, h);
  if (hj && !pedidos.some((x) => x.id === "hoje")) out.cidade.push(hj);
  if (!pedidos.some((x) => x.id === "lingua")) out.cidade.push(linhaDaLingua(f));
  return out;
}
