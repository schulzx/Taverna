/* ============================================================
   GEOGRAFIA (v7.5) — Taverna
   Parâmetros de cidades, regiões e continentes + GERADOR por
   código. O mundo nasce com nomes, populações, biomas e ROTAS
   com dias de viagem — o Mestre não inventa mais o caminho na
   hora (uma hora mar, outra deserto): a geografia é fato fixo,
   sorteada pelo sistema e servida pronta para a narração.
   ============================================================ */

import { moldePorId } from "./moldes.js";
/* v9.102: o LEXICO nomeia as cidades do mapa quando o mundo tem um.
   Devolve null sem lexico, e ai o molde e o banco generico respondem. */
import { partesDeCidade, continenteDo } from "./lexico.js";

/* ---------------- PARÂMETROS DE PORTE ----------------
   Faixas de população por tipo de assentamento — âncora para o
   Mestre e para o cálculo de fé por acontecimento.

   v9.40: os portes dos moldes novos entram aqui pelo mesmo motivo que os
   antigos — é desta tabela que saem a população, o rótulo da tela e o
   peso da fé. Um andar da Torre tem gente morando nele; uma estação
   orbital também. */
export const PORTES = {
  ruina:     { rotulo: "ruína",      min: 0,     max: 0,     servicos: "nenhum — só ecos e perigo" },
  aldeia:    { rotulo: "aldeia",     min: 50,    max: 300,   servicos: "ferreiro simples, taverna comum" },
  vila:      { rotulo: "vila",       min: 300,   max: 1500,  servicos: "mercado semanal, estalagem, curandeiro" },
  cidade:    { rotulo: "cidade",     min: 1500,  max: 15000, servicos: "guildas, templos, mercado permanente" },
  capital:   { rotulo: "capital",    min: 15000, max: 80000, servicos: "corte, catedral, universidade, porto grande" },
  metropole: { rotulo: "metrópole",  min: 80000, max: 300000, servicos: "tudo que o mundo oferece — e tudo que ele esconde" },
  fortaleza: { rotulo: "fortaleza",  min: 200,   max: 2000,  servicos: "guarnição, armeiro, poucas comodidades" },
  /* Torre */
  patamar:        { rotulo: "patamar",        min: 20,   max: 150,   servicos: "uma fogueira e quem a guarda" },
  andar:          { rotulo: "andar",          min: 60,   max: 900,   servicos: "trocas, remendos e o portal" },
  "andar-mestre": { rotulo: "andar-mestre",   min: 400,  max: 4000,  servicos: "feira do degrau, oficina, capela" },
  "átrio":        { rotulo: "átrio",          min: 1000, max: 12000, servicos: "tudo o que sobreviveu à subida" },
  /* Arquipélago */
  fundeadouro:     { rotulo: "fundeadouro",    min: 20,    max: 200,   servicos: "água doce e um cais podre" },
  "vila de pesca": { rotulo: "vila de pesca",  min: 200,   max: 1200,  servicos: "peixe, conserto de rede, taverna" },
  porto:           { rotulo: "porto",          min: 1200,  max: 12000, servicos: "estaleiro, receptador, cartas náuticas" },
  forte:           { rotulo: "forte",          min: 150,   max: 1800,  servicos: "guarnição, canhões, poucas perguntas" },
  "porto franco":  { rotulo: "porto franco",   min: 12000, max: 60000, servicos: "tudo se compra, inclusive silêncio" },
  /* Braço estelar */
  "posto avançado":  { rotulo: "posto avançado",  min: 20,    max: 300,    servicos: "doca única, oxigênio racionado" },
  "colônia":         { rotulo: "colônia",         min: 300,   max: 9000,   servicos: "oficina, enfermaria, mercado de peças" },
  sistema:           { rotulo: "sistema",         min: 9000,  max: 90000,  servicos: "várias docas, rotas registradas" },
  base:              { rotulo: "base",            min: 200,   max: 3000,   servicos: "segurança pesada, trânsito controlado" },
  "capital orbital": { rotulo: "capital orbital", min: 90000, max: 400000, servicos: "o braço inteiro passa por aqui" },
};
export function populacaoDe(porte, rnd = Math.random) {
  const p = PORTES[porte] || PORTES.cidade;
  if (!p.max) return 0;
  return Math.round((p.min + rnd() * (p.max - p.min)) / 10) * 10;
}

/* ============================================================
   A FORMA DO ASSENTAMENTO (v9.54)

   A planta da v9.51 desenhava a MESMA muralha, as mesmas duas ruas e a
   mesma praça numa aldeia de 190 almas e numa capital de 54 mil. A
   segunda escala do mapa existia, mas dizia sempre a mesma coisa — e
   uma planta que não distingue uma coisa da outra é decoração.

   A forma sai de dois fatos que TODA cidade deste jogo tem, em todos os
   moldes: quanta gente mora nela e em que chão ela está. Não sai do
   `porte`, e isso é deliberado: são vinte e três portes espalhados por
   cinco moldes ("fundeadouro", "andar-mestre", "posto avançado"), e uma
   tabela por nome seria uma lista para esquecer de atualizar. População
   é um número, e número compara sozinho.

   AS REGRAS SÃO AS DA HISTÓRIA, não as do desenho:

   - Muralha custa caro. Aldeia não tem — tem o casario e o mato. Vila
     levanta paliçada. Só de mil e tantas almas para cima alguém paga
     pedra, e capital paga pedra grossa.
   - Cruzamento de ruas é coisa de lugar grande. Povoado tem UMA rua, que
     é a estrada passando no meio; a segunda rua nasce quando há gente
     bastante para haver dois destinos.
   - Praça é onde o mercado cabe. Sem mercado permanente, é um largo.
   - E o chão manda: cidade de costa tem um lado que é água e não tem
     muro nenhum ali; cidade de montanha nasce espremida entre paredes.
   ============================================================ */

const MUROS = {
  nenhum:  { id: "nenhum",  rotulo: "sem muro",         espessura: 0,   nota: "casas e cercas — quem quiser entrar, entra" },
  palicada:{ id: "palicada",rotulo: "paliçada",         espessura: 0.7, nota: "estacas de madeira e um portão que range" },
  muralha: { id: "muralha", rotulo: "muralha",          espessura: 1.4, nota: "pedra de verdade, com guarda em cima" },
  grossa:  { id: "grossa",  rotulo: "muralha grossa",   espessura: 2.6, nota: "feita para aguentar cerco, não para enfeitar" },
};

/* Assentamento militar: pouca gente e muito muro. Aqui o porte importa,
   porque é a única coisa que distingue um forte de uma vila do mesmo
   tamanho — e são poucos nomes, todos com a mesma ideia. */
const RX_MILITAR = /(fortaleza|forte|base|guarni|posto avan|quartel)/i;

export function formaDaCidade(cidade) {
  const c = cidade || {};
  const pop = Math.max(0, Number(c.populacao) || 0);
  const bioma = String(c.bioma || "").toLowerCase();
  const militar = RX_MILITAR.test(String(c.porte || c.tipo || ""));

  let muro = MUROS.nenhum;
  if (militar) muro = pop >= 1200 ? MUROS.grossa : MUROS.muralha;
  else if (pop >= 20000) muro = MUROS.grossa;
  else if (pop >= 1500) muro = MUROS.muralha;
  else if (pop >= 400) muro = MUROS.palicada;

  /* O TAMANHO NA TELA É UMA ESCADA, não uma fórmula. A primeira versão desta
     função usava logaritmo da população, e o resultado foi uma aldeia de raio
     27 ao lado de uma capital de 37 — matematicamente correto e visualmente
     inútil, porque a diferença que o jogador precisa VER é "isto é um
     povoado" contra "isto é uma capital", e não a proporção exata. Cinco
     degraus, e cada um se distingue do vizinho de relance. */
  const raio = pop < 400 ? 15 : pop < 1500 ? 20 : pop < 15000 ? 27 : pop < 60000 ? 33 : 37;
  /* militar é compacto de propósito: muita parede em volta de pouco chão.
     O piso de 13 existe porque abaixo disso os locais de dentro deixam de
     caber — uma planta ilegível não informa nada, por mais fiel que seja. */
  const raioFinal = militar ? Math.max(13, Math.round(raio * 0.72)) : raio;

  const ruas = pop >= 1500 ? 2 : 1;
  const anelViario = pop >= 20000;
  const praca = pop >= 300;
  const pracaR = pop >= 20000 ? 11 : pop >= 1500 ? 8 : 5.5;
  /* portão só existe se houver muro; uma rua atravessa por dois */
  const portoes = muro.espessura === 0 ? 0 : ruas * 2;

  /* o porte também decide: uma "vila de pesca" é costeira mesmo que o bioma
     da região tenha vindo genérico — o nome dela é o fato */
  const costa = /costa|praia|litoral|mar|ilha|arquipel|porto/.test(bioma) || /porto|fundeadouro|cais|embarcad|pesca|enseada|doca/i.test(String(c.porte || ""));
  const montanha = /montanha|serra|pico|penhasco|alt/.test(bioma);

  return {
    muro, raio: raioFinal, ruas, anelViario, praca, pracaR, portoes,
    /* costa: um lado é água, e ali o muro simplesmente não existe */
    agua: costa ? { lado: "oeste", cais: true } : null,
    /* montanha: o assentamento é espremido num eixo, entre paredes de pedra */
    aperto: montanha ? 0.62 : 1,
    militar, pop,
    nota: [
      muro.rotulo === "sem muro" ? "sem muralha" : muro.rotulo,
      ruas === 1 ? "uma rua só" : "duas ruas que se cruzam",
      praca ? "praça no meio" : "um largo de terra batida",
      costa ? "e o mar de um lado" : montanha ? "espremida entre as pedras" : "",
    ].filter(Boolean).join(", "),
  };
}

/* ---------------- BIOMAS E VIAGEM ---------------- */
export const BIOMAS = ["planicie", "floresta", "colina", "montanha", "deserto", "pantano", "costa", "gelo"];
export const BIOMA_ROTULO = { planicie: "planície", floresta: "floresta", colina: "colinas", montanha: "montanhas", deserto: "deserto", pantano: "pântano", costa: "costa", gelo: "gelo" };

/* km por dia de viagem a pé/por montaria leve, por tipo de terreno */
export const TERRENO_VIAGEM = {
  estrada:   { kmDia: 40, rotulo: "estrada" },
  planicie:  { kmDia: 30, rotulo: "campo aberto" },
  colina:    { kmDia: 25, rotulo: "colinas" },
  floresta:  { kmDia: 20, rotulo: "trilha na mata" },
  costa:     { kmDia: 30, rotulo: "caminho litorâneo" },
  pantano:   { kmDia: 12, rotulo: "pântano traiçoeiro" },
  deserto:   { kmDia: 15, rotulo: "deserto" },
  montanha:  { kmDia: 12, rotulo: "passo de montanha" },
  gelo:      { kmDia: 12, rotulo: "gelo" },
  maritima:  { kmDia: 90, rotulo: "rota marítima" },
  /* v9.40: travessias que não se medem em quilômetros. Ficam na tabela
     porque quem lê uma rota pergunta pelo terreno dela, e um `undefined`
     aqui derrubaria o cálculo de dias no meio de uma viagem. */
  portal:    { kmDia: 0,  rotulo: "portal do andar" },
  salto:     { kmDia: 0,  rotulo: "rota de salto" },
};
/* 1 unidade do mapa (0-100) ≈ 25 km — um continente de ~2.500 km */
export const KM_POR_UNIDADE = 25;

/* ---------------- NOMES ---------------- */
const REGIAO_A = ["Terras", "Vales", "Campos", "Margens", "Colinas", "Chãs", "Fronteiras", "Planaltos"];
const REGIAO_B = ["do Corvo", "de Ferro", "das Brumas", "do Sal", "Verdes", "Altos", "Quebradas", "da Serpente", "do Vento", "Escarlates", "da Lua Baixa", "do Estio"];
const CIDADE_A = ["Pedra", "Vila", "Porto", "Forte", "Monte", "Rio", "Ponte", "Torre", "Alto", "Baixo", "Nova", "Velha", "Casa", "Ponto"];
const CIDADE_B = ["valente", "do Sul", "do Norte", "clara", "escura", "do Rei", "das Águias", "Profundo", "da Fonte", "do Vigia", "Serena", "Rasa", "do Martelo", "das Velas", "Seco", "Brumoso"];
const CONT_A = ["Aeth", "Kor", "Vald", "Oss", "Thar", "Bel", "Myr", "Dur"];
const CONT_B = ["enia", "oria", "amar", "ênia", "gard", "lon", "wic", "dor"];

/* RNG determinístico (mesma semente → mesmo mundo) */
export function rngDe(semente) {
  let h = 2166136261;
  const s = String(semente || "taverna");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
}
const pickR = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];

/* Nome de lugar único dentro do conjunto. v9.40: o banco vem do MOLDE —
   "Baixo Brumoso" denunciava o gerador na primeira tela de uma campanha
   estelar. Sem molde, o banco medieval de sempre. */
/* ---------------- O NOME NÃO PODE MENTIR SOBRE O LUGAR (v9.55) ----------------
   Os bancos de nome trazem sufixos cardeais — "do Norte", "do Sul", "do
   Vento Sul" — e o sorteio nunca olhou ONDE a cidade tinha caído. O mundo
   nascia com "Nova do Norte" no canto de baixo do pergaminho e uma "Vila do
   Sul" logo acima dela, e o jogador que abre o mapa vê a contradição antes
   de ver qualquer outra coisa.

   A régua é a do olho, não a do compasso: só recusa o nome quando ele está
   na METADE errada do mapa. Uma cidade no meio pode se chamar do Norte sem
   ofender ninguém — o que ofende é a do Norte estar ao sul da do Sul. */
/* v9.102: E O CARDEAL SOZINHO TAMBÉM. Os bancos de sempre só produzem a
   forma com preposição ("do Norte"), e por isso a régua nunca precisou
   olhar para "Norte" solto. O léxico produz: um mundo urbano nomeia
   "Setor Leste" e "Cidade Sul", e a primeira medição achou uma "Sul" no
   alto do mapa. A palavra sozinha mente igual. */
const RX_NORTE = /\bdo norte\b|\bnorte\b|\bsetentrional\b|\bboreal\b/i;
const RX_SUL = /\bdo sul\b|\bvento sul\b|\bsul\b|\bmeridional\b|\baustral\b/i;
const RX_LESTE = /\bdo leste\b|\bleste\b|\boriental\b|\bdo nascente\b/i;
const RX_OESTE = /\bdo oeste\b|\boeste\b|\bocidental\b|\bdo poente\b/i;

export function nomeMenteSobreOLugar(nome, x, y) {
  const n = String(nome || "");
  const X = Number(x), Y = Number(y);
  if (!Number.isFinite(X) || !Number.isFinite(Y)) return false;
  /* y cresce para baixo no SVG: y pequeno é norte */
  if (RX_NORTE.test(n) && Y > 55) return true;
  if (RX_SUL.test(n) && Y < 45) return true;
  if (RX_LESTE.test(n) && X < 45) return true;
  if (RX_OESTE.test(n) && X > 55) return true;
  return false;
}

/* O nome da terra maior: o do léxico quando há, o do molde quando não. */
function nomeDaTerra(lex, padrao) { return continenteDo(lex) || padrao; }

/* v9.102: o LEXICO nomeia ANTES do molde. A primeira versao pos o molde
   na frente, com um argumento que soava bem — "uma torre nomeia os
   degraus dela melhor que qualquer outro" — e ele estava errado por um
   fato: o molde PADRAO traz `NOMES_SUPERFICIE`, que e palavra por palavra
   o banco generico. Com o molde na frente o lexico nunca ganhava, e um
   mundo de cacadores nascia com "Monte do Rei" e "Nova Brumoso".

   A divisao certa e outra: o molde diz a FORMA do mundo (topologia,
   portes, biomas, regioes) e o lexico diz a IDENTIDADE dele. Identidade
   ganha de sabor padrao. E a torre, que era o exemplo, nem passa por
   aqui: os andares dela sao nomeados noutro lugar.

   `nomeMenteSobreOLugar` continua valendo por cima dos dois: um nome do
   lexico que diga "do Norte" no sul e recusado como qualquer outro. */
function nomeCidade(rnd, usados, molde, x = null, y = null, lex = null) {
  const doLex = partesDeCidade(lex);
  const A = (doLex && doLex.a) || (molde && molde.nomes && molde.nomes.a) || CIDADE_A;
  const Bn = (doLex && doLex.b) || (molde && molde.nomes && molde.nomes.b) || CIDADE_B;
  for (let t = 0; t < 12; t++) {
    const nome = `${pickR(rnd, A)} ${pickR(rnd, Bn)}`;
    if (usados.has(nome.toLowerCase())) continue;
    if (nomeMenteSobreOLugar(nome, x, y)) continue;
    usados.add(nome.toLowerCase()); return nome;
  }
  /* esgotou as tentativas: monta um nome sem sufixo cardeal em vez de
     aceitar a mentira — o número é feio, e a contradição é pior */
  const semCardeal = Bn.filter((b) => !nomeMenteSobreOLugar(`x ${b}`, x, y));
  for (let t = 0; t < 8 && semCardeal.length; t++) {
    const nome = `${pickR(rnd, A)} ${pickR(rnd, semCardeal)}`;
    if (!usados.has(nome.toLowerCase())) { usados.add(nome.toLowerCase()); return nome; }
  }
  const fallback = `${pickR(rnd, A)} ${Math.floor(rnd() * 900 + 100)}`;
  usados.add(fallback.toLowerCase());
  return fallback;
}

/* ---------------- ROTAS ----------------
   Liga cada cidade às 2 mais próximas (malha de caminhos), classifica
   o terreno pelo bioma dos dois lados e calcula a distância e os dias. */
/* v9.40: as rotas de um molde que não é continental. Uma torre só liga
   andar a andar, e um braço estelar liga o que tem rota de salto — o
   vizinho mais próximo em linha reta não significa nada nos dois casos. */
function rotasDaPilha(cs, molde) {
  const rotas = [];
  const ordenadas = [...cs].sort((a, b) => (a.z || 0) - (b.z || 0));
  for (let i = 0; i + 1 < ordenadas.length; i++) {
    rotas.push({
      de: ordenadas[i].nome, para: ordenadas[i + 1].nome,
      terreno: "portal", km: 0,
      /* subir um andar é uma travessia, não uma jornada: seis horas */
      dias: 0.25,
    });
  }
  return rotas;
}

function rotasDoGrafo(cs, molde) {
  const rotas = [];
  for (let i = 0; i < cs.length; i++) {
    const perto = cs.map((o, j) => ({ j, d: Math.hypot((cs[i].x || 0) - (o.x || 0), (cs[i].y || 0) - (o.y || 0), (cs[i].z || 0) - (o.z || 0)) }))
      .filter((o) => o.j !== i).sort((a, b) => a.d - b.d);
    for (const { j, d } of perto.slice(0, 2)) {
      const de = cs[i].nome, para = cs[j].nome;
      if (rotas.some((r) => (r.de === de && r.para === para) || (r.de === para && r.para === de))) continue;
      rotas.push({ de, para, terreno: "salto", km: Math.round(d), dias: Math.max(1, Math.round(d / 12)) });
    }
  }
  return rotas;
}

/* Entre ilhas só existe um caminho: o mar. Classificar terreno pelo bioma
   das duas pontas — como faz o sobremundo — produzia rotas de "colina"
   ligando duas ilhas, e o cálculo de dias saía de uma tabela de marcha a
   pé para uma travessia de navio. */
function rotasDoMar(cs, molde) {
  const rotas = [];
  const veloc = (id) => {
    const b = (molde.biomas || []).find((x) => x.id === id);
    return (b && b.kmDia) || 60;
  };
  for (let i = 0; i < cs.length; i++) {
    const perto = cs.map((o, j) => ({ j, d: Math.hypot((cs[i].x || 0) - (o.x || 0), (cs[i].y || 0) - (o.y || 0)) }))
      .filter((o) => o.j !== i).sort((a, b) => a.d - b.d);
    for (const { j, d } of perto.slice(0, 2)) {
      const de = cs[i].nome, para = cs[j].nome;
      if (rotas.some((r) => (r.de === de && r.para === para) || (r.de === para && r.para === de))) continue;
      /* a travessia herda o pior dos dois lados: bruma e recife atrasam */
      const kmDia = Math.min(veloc(cs[i].bioma), veloc(cs[j].bioma), 90);
      const km = Math.max(20, Math.round(d * ((molde.unidade && molde.unidade.km) || 40) / 10) * 10);
      rotas.push({ de, para, terreno: "maritima", km, dias: Math.max(0.5, Math.round((km / Math.max(10, kmDia)) * 2) / 2) });
    }
  }
  return rotas;
}

export function gerarRotas(cidades, molde) {
  const cs = cidades || [];
  const topo = molde && molde.topologia;
  if (topo === "pilha") return rotasDaPilha(cs, molde);
  if (topo === "grafo") return rotasDoGrafo(cs, molde);
  if (topo === "ilhas") return rotasDoMar(cs, molde);
  const rotas = [];
  for (let i = 0; i < cs.length; i++) {
    const dists = cs.map((o, j) => ({ j, d: Math.hypot((cs[i].x || 0) - (o.x || 0), (cs[i].y || 0) - (o.y || 0)) })).filter((o) => o.j !== i).sort((a, b) => a.d - b.d);
    for (const { j, d } of dists.slice(0, 2)) {
      const de = cs[i].nome, para = cs[j].nome;
      if (rotas.some((r) => (r.de === de && r.para === para) || (r.de === para && r.para === de))) continue;
      const b1 = cs[i].bioma || "planicie", b2 = cs[j].bioma || "planicie";
      let terreno = "estrada";
      if (b1 === "costa" && b2 === "costa" && d > 30) terreno = "maritima";
      else if (b1 === "montanha" || b2 === "montanha") terreno = "montanha";
      else if (b1 === "deserto" || b2 === "deserto") terreno = "deserto";
      else if (b1 === "pantano" || b2 === "pantano") terreno = "pantano";
      else if (b1 === "gelo" || b2 === "gelo") terreno = "gelo";
      else if (b1 === "floresta" && b2 === "floresta") terreno = "floresta";
      else if (b1 !== "planicie" || b2 !== "planicie") terreno = b1 === "costa" || b2 === "costa" ? "costa" : "colina";
      const km = Math.max(20, Math.round(d * KM_POR_UNIDADE / 10) * 10);
      const tv = TERRENO_VIAGEM[terreno];
      const dias = Math.max(0.5, Math.round((km / tv.kmDia) * 2) / 2);
      rotas.push({ de, para, terreno, km, dias });
    }
  }
  return rotas;
}

/* ---------------- GERADOR DE MUNDO ----------------
   v9.9: o TAMANHO do mundo também é sorteado. Antes todo universo tinha
   1 continente, 3-5 regiões e 8-14 cidades — a variação era só de nomes,
   e dois mundos diferentes tinham sempre o mesmo esqueleto. Agora os
   próprios números saem da semente, dentro de faixas base:

     continentes  1–3     (arquipélago de impérios ou terra única)
     regiões      2–9     por continente, proporcional ao tamanho dele
     cidades      4–24    distribuídas pelas regiões
     população    já era sorteada pelo porte

   Uma vez gerado, não muda nunca: é sempre a mesma semente. */
export const FAIXAS_MUNDO = {
  continentes: [1, 3],
  regioesPorContinente: [2, 6],
  cidadesPorRegiao: [1, 4],
  minCidades: 4,
};
const entreR = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));

/* v9.40: a topologia decide a FORMA; o resto do jogo nem fica sabendo.
   Um andar da Torre é um registro de cidade com `z` no lugar de `x,y`, e
   por isso missões, viagem, ofertas e mapa continuam funcionando sem uma
   linha de mudança — só o vocabulário na tela muda. */
export function gerarGeografia(semente, molde, lex = null) {
  const m = moldePorId(molde && molde.id ? molde.id : molde);
  if (m.topologia === "pilha") return mundoEmPilha(semente, m, lex);
  if (m.topologia === "grafo") return mundoEmGrafo(semente, m, lex);
  return mundoContinental(semente, m, lex);
}

/* A TORRE: uma coluna de andares. Não há norte nem sul — há acima e
   abaixo, e o perigo é função da altura. */
function mundoEmPilha(semente, m, lex = null) {
  const rnd = rngDe(semente);
  const usadosC = new Set();
  /* o molde promete cem andares; herdando as faixas do continental, a Torre
     nascia com 18 a 40 e a promessa virava propaganda */
  const faixa = (m.tamanho && m.tamanho.length === 2) ? m.tamanho : [18, 40];
  const quantos = entreR(rnd, faixa[0], faixa[1]);
  const secoes = [];
  const porSecao = Math.max(4, Math.round(quantos / entreR(rnd, 3, 5)));
  const cidades = [];
  for (let z = 1; z <= quantos; z++) {
    const iSec = Math.floor((z - 1) / porSecao);
    if (!secoes[iSec]) {
      secoes[iSec] = {
        nome: `${pickR(rnd, ["Base", "Meio", "Alto", "Coroa", "Fundo", "Vão"])} ${["I", "II", "III", "IV", "V", "VI"][iSec] || iSec + 1}`,
        continente: nomeDaTerra(lex, "A Torre"), bioma: pickR(rnd, m.biomas).id, cx: 50, cy: 50,
      };
    }
    const porte = z === quantos ? "átrio" : z % porSecao === 0 ? "andar-mestre" : z <= 2 ? "patamar" : "andar";
    cidades.push({
      nome: nomeDeAndar(rnd, z, usadosC),
      tipo: porte, porte,
      populacao: populacaoDe(porte, rnd),
      regiao: secoes[iSec].nome, continente: nomeDaTerra(lex, "A Torre"),
      bioma: pickR(rnd, m.biomas).id,
      faccao: null, relacao: "neutra", locais: [], sede: false, notas: "",
      /* x,y existem só porque o painel de mapa desenha num plano; quem
         manda é o z, e é ele que a progressão de perigo lê */
      x: 50, y: Math.max(4, 96 - Math.round((z / quantos) * 92)), z,
      descoberta: z <= 1,
    });
  }
  return { continente: nomeDaTerra(lex, "A Torre"), continentes: [{ nome: nomeDaTerra(lex, "A Torre"), regioes: secoes.map((s) => s.nome) }], regioes: secoes, cidades, rotas: gerarRotas(cidades, m) };
}

/* O BRAÇO ESTELAR: pontos esparsos em três eixos, ligados por saltos. */
function mundoEmGrafo(semente, molde, lex = null) {
  const m = molde;
  const rnd = rngDe(semente);
  const usadosC = new Set(), usadosR = new Set();
  const nSetores = entreR(rnd, 2, 4);
  const regioes = [];
  for (let i = 0; i < nSetores; i++) {
    let nome;
    do { nome = `${pickR(rnd, (m.nomesRegiao || {}).a || REGIAO_A)} ${pickR(rnd, (m.nomesRegiao || {}).b || REGIAO_B)}`; } while (usadosR.has(nome));
    usadosR.add(nome);
    regioes.push({ nome, continente: nomeDaTerra(lex, "O Braço"), bioma: pickR(rnd, m.biomas).id, cx: 20 + rnd() * 60, cy: 20 + rnd() * 60 });
  }
  const cidades = [];
  for (const reg of regioes) {
    const quantas = entreR(rnd, 2, 5);
    for (let i = 0; i < quantas; i++) {
      const porte = cidades.length === 0 ? "capital orbital" : pickR(rnd, m.portes);
      /* v9.55: a posição sai ANTES do nome, porque agora o nome a consulta */
      const px = Math.max(4, Math.min(96, Math.round(reg.cx + (rnd() - 0.5) * 30)));
      const py = Math.max(4, Math.min(96, Math.round(reg.cy + (rnd() - 0.5) * 30)));
      cidades.push({
        nome: nomeCidade(rnd, usadosC, molde, px, py, lex), tipo: porte, porte,
        populacao: populacaoDe(porte, rnd),
        regiao: reg.nome, continente: nomeDaTerra(lex, "O Braço"), bioma: pickR(rnd, m.biomas).id,
        faccao: null, relacao: "neutra", locais: [], sede: false, notas: "",
        x: px,
        y: py,
        z: Math.round((rnd() - 0.5) * 40),
        descoberta: cidades.length === 0,
      });
    }
  }
  return { continente: nomeDaTerra(lex, "O Braço"), continentes: [{ nome: nomeDaTerra(lex, "O Braço"), regioes: regioes.map((r) => r.nome) }], regioes, cidades, rotas: gerarRotas(cidades, m) };
}

function nomeDeAndar(rnd, z, usados) {
  const alcunhas = ["dos Ossos", "das Correntes", "do Sino", "sem Teto", "das Cinzas", "do Poço", "dos Espelhos", "da Ferrugem", "do Silêncio", "das Velas", "do Sal", "dos Nomes", "da Chuva", "do Fio", "das Máscaras"];
  for (let t = 0; t < 12; t++) {
    const nome = `Andar ${z} — ${pickR(rnd, alcunhas)}`;
    if (!usados.has(nome.toLowerCase())) { usados.add(nome.toLowerCase()); return nome; }
  }
  const f = `Andar ${z}`;
  usados.add(f.toLowerCase());
  return f;
}

function mundoContinental(semente, molde, lex = null) {
  const rnd = rngDe(semente);
  const usadosR = new Set(), usadosC = new Set(), usadosK = new Set();
  const F = FAIXAS_MUNDO;
  const BIOMAS_M = (molde && molde.biomas || []).map((b) => b.id);
  const sorteiaBioma = () => (BIOMAS_M.length ? pickR(rnd, BIOMAS_M) : pickR(rnd, BIOMAS));
  const RA = (molde && molde.nomesRegiao && molde.nomesRegiao.a) || REGIAO_A;
  const RB = (molde && molde.nomesRegiao && molde.nomesRegiao.b) || REGIAO_B;

  /* continentes: quase sempre um, às vezes dois, raramente três */
  const nCont = rnd() < 0.62 ? 1 : rnd() < 0.8 ? 2 : entreR(rnd, 2, F.continentes[1]);
  const continentes = [];
  /* v9.102: o léxico nomeia o PRIMEIRO continente, que é onde a campanha
     acontece. Os outros continuam saindo das sílabas — um mundo que só
     nomeia a terra em que se está é honesto: as outras ainda não foram
     descobertas, e um nome do léxico para cada uma seria o léxico
     inventando lugares que ele não descreveu. */
  const daTerra = continenteDo(lex);
  for (let c = 0; c < nCont; c++) {
    let nome;
    /* O SORTEIO ACONTECE DE QUALQUER JEITO, e só depois o nome é trocado.
       A primeira versão saltava o `do/while` quando o léxico tinha nome —
       e saltar o sorteio significa não consumir o gerador, o que
       desalinha TODA a geração daí para baixo: o mesmo mundo nascia com
       outro número de cidades só por ter ganhado um nome. O gerador é
       determinístico por semente, e determinismo se quebra assim. */
    do { nome = `${pickR(rnd, CONT_A)}${pickR(rnd, CONT_B)}`; } while (usadosK.has(nome));
    if (c === 0 && daTerra && !usadosK.has(daTerra)) nome = daTerra;
    usadosK.add(nome);
    continentes.push({ nome, regioes: [] });
  }

  const regioes = [];
  for (const cont of continentes) {
    const nReg = entreR(rnd, F.regioesPorContinente[0], F.regioesPorContinente[1]);
    for (let i = 0; i < nReg; i++) {
      let nome;
      do { nome = `${pickR(rnd, RA)} ${pickR(rnd, RB)}`; } while (usadosR.has(nome));
      usadosR.add(nome);
      regioes.push({ nome, continente: cont.nome, bioma: sorteiaBioma(), cx: 0, cy: 0 });
      cont.regioes.push(nome);
    }
  }
  /* posiciona as regiões em coroa: continentes ocupam fatias do mapa */
  regioes.forEach((r, i) => {
    const ang = (Math.PI * 2 * i) / regioes.length + rnd() * 0.5;
    const raio = 20 + rnd() * 14;
    r.cx = Math.max(14, Math.min(86, 50 + Math.cos(ang) * raio));
    r.cy = Math.max(14, Math.min(86, 50 + Math.sin(ang) * raio));
  });

  /* cidades: cada região recebe um punhado próprio, então o total varia
     junto com o número de regiões — mundos pequenos e mundos enormes */
  const cidades = [];
  /* v9.40: os portes vêm do MOLDE, do maior para o menor. O primeiro
     lugar do mundo é sempre o maior — a capital, o porto franco —, e os
     demais saem da faixa de baixo. Antes eram "capital, cidade, cidade"
     cravados, e um arquipélago nascia com capitais no meio do mar. */
  const P = (molde && molde.portes && molde.portes.length === 5) ? molde.portes : ["aldeia", "vila", "cidade", "fortaleza", "capital"];
  const porteInicial = [P[4], P[2], P[2]];
  const porteComum = [P[0], P[0], P[1], P[1], P[2], P[3]];
  for (const reg of regioes) {
    const quantas = entreR(rnd, F.cidadesPorRegiao[0], F.cidadesPorRegiao[1]);
    for (let i = 0; i < quantas; i++) {
      const idx = cidades.length;
      const porte = idx < porteInicial.length ? porteInicial[idx] : pickR(rnd, porteComum);
      const x = Math.max(6, Math.min(94, Math.round(reg.cx + (rnd() - 0.5) * 24)));
      const y = Math.max(6, Math.min(94, Math.round(reg.cy + (rnd() - 0.5) * 24)));
      cidades.push({
        nome: nomeCidade(rnd, usadosC, molde, x, y, lex),
        tipo: porte, porte,
        populacao: populacaoDe(porte, rnd),
        regiao: reg.nome, continente: reg.continente, bioma: reg.bioma,
        faccao: null, relacao: "neutra", locais: [], sede: false, notas: "",
        x, y, descoberta: false,
      });
    }
  }
  /* piso de segurança: um mundo com uma cidade só não dá jogo */
  while (cidades.length < F.minCidades) {
    const reg = regioes[cidades.length % regioes.length];
    cidades.push({
      nome: nomeCidade(rnd, usadosC, molde, Math.round(reg.cx), Math.round(reg.cy), lex), tipo: P[1], porte: P[1],
      populacao: populacaoDe(P[1], rnd), regiao: reg.nome, continente: reg.continente, bioma: reg.bioma,
      faccao: null, relacao: "neutra", locais: [], sede: false, notas: "",
      x: Math.round(reg.cx), y: Math.round(reg.cy), descoberta: false,
    });
  }
  /* `continente` (singular) fica para quem já lia o campo antigo */
  return { continente: continentes[0].nome, continentes, regioes, cidades, rotas: gerarRotas(cidades, molde) };
}

/* ---------------- MIGRAÇÃO DE SAVES ANTIGOS ----------------
   Cidades que já existem na ficção GANHAM porte/população/bioma
   (determinístico pelo nome — nada muda duas vezes); as rotas são
   calculadas entre o que existe. Nada é removido nem renomeado. */
export function garantirGeografia(mapa, semente) {
  const m = mapa && typeof mapa === "object" ? mapa : {};
  const cidades = (m.cidades || []).map((c) => {
    if (c.populacao != null && c.bioma) return c;
    const rnd = rngDe(`${semente}|${c.nome}`);
    const porte = c.porte || (PORTES[c.tipo] ? c.tipo : "cidade");
    return { ...c, porte, populacao: c.populacao != null ? c.populacao : populacaoDe(porte, rnd), bioma: c.bioma || pickR(rnd, BIOMAS) };
  });
  return { ...m, cidades, continente: m.continente || `${pickR(rngDe(semente), CONT_A)}${pickR(rngDe(semente + "2"), CONT_B)}`, regioes: m.regioes || [], rotas: gerarRotas(cidades) };
}

/* ---------------- RESUMO PARA O PROMPT ----------------
   O Mestre recebe a geografia como FATO: quem mora onde, quantos são,
   e quanto tempo leva cada caminho. Ele narra a viagem; não a inventa. */
/* ---------------- O QUE O JOGADOR JÁ CONHECE (v9.14) ----------------
   O campo `descoberta` existia desde sempre e ninguém consultava: o mundo
   inteiro ia no prompt e no painel desde o primeiro turno. Agora ele manda —
   e o Mestre passa a receber SÓ o que o herói conhece, mais a contagem do
   que falta, para poder falar de "cidades ao norte" sem entregar os nomes. */
export const cidadesConhecidas = (mapa) => ((mapa && mapa.cidades) || []).filter((c) => c.descoberta !== false);

export function descobrirCidade(mapa, nome) {
  const alvo = String(nome || "").trim().toLowerCase();
  if (!mapa || !alvo) return { mapa, nova: null };
  const c = (mapa.cidades || []).find((x) => (x.nome || "").toLowerCase() === alvo);
  if (!c || c.descoberta !== false) return { mapa, nova: null };
  return { mapa: { ...mapa, cidades: mapa.cidades.map((x) => (x === c ? { ...x, descoberta: true } : x)) }, nova: c.nome };
}

/* ---------------- A NÉVOA AO REDOR (v9.51) ----------------
   Quem chega numa cidade não fica sabendo só dela. Pergunta no mercado,
   olha a estrada que sai pelo portão norte e descobre que a três horas
   dali tem uma vila, e que o rio leva a um porto. Isso não é explorar —
   é conversar.

   Até aqui o mapa não fazia essa distinção: das vinte cidades do mundo,
   o herói via UMA, a que pisou, e o resto era um número no rodapé. Um
   mapa com um ponto só não é mapa, é alfinete.

   A régua é a VIZINHANÇA REAL: as cidades ligadas a esta por uma rota
   direta, com o dia de viagem que a rota já registra. Não abre o
   continente inteiro — só o que se enxerga do alto do muro. */
/* Pisar na cidade tira o "de ouvir": o herói deixa de saber que ela existe
   e passa a conhecê-la. Sem isto, a vila de que ele ouviu falar continuava
   desenhada tracejada mesmo depois de ele dormir lá — e o mapa mentia por
   um detalhe que ninguém ia procurar. */
/* v9.54: `pisada` é diferente de `descoberta`, e a diferença importa. Ouvir
   falar de uma vila revela o ponto no pergaminho; ter DORMIDO nela revela o
   que fica em volta — o moinho, a ponte, a fazenda do velho. É por isso que
   o cinturão só aparece nas cidades pisadas, e é por isso que ele PERMANECE
   depois: sair da cidade não apaga da memória o moinho que se viu. */
export function pisarNaCidade(mapa, nome) {
  const alvo = semA(nome);
  if (!mapa || !alvo) return mapa;
  const c = (mapa.cidades || []).find((x) => semA(x.nome) === alvo);
  if (!c || (c.pisada && !c.deOuvir)) return mapa;
  return { ...mapa, cidades: mapa.cidades.map((x) => { if (x !== c) return x; const n = { ...x, descoberta: true, pisada: true }; delete n.deOuvir; return n; }) };
}

export const cidadesPisadas = (mapa) => ((mapa && mapa.cidades) || []).filter((c) => c && c.pisada);

export const DIAS_DE_VIZINHANCA = 12;

export function descobrirVizinhanca(mapa, nome, teto = DIAS_DE_VIZINHANCA) {
  const aqui = semA(nome);
  if (!mapa || !aqui) return { mapa, novas: [] };
  const perto = new Set();
  for (const r of mapa.rotas || []) {
    if (!r || !(Number(r.dias) <= teto)) continue;
    if (semA(r.de) === aqui) perto.add(semA(r.para));
    else if (semA(r.para) === aqui) perto.add(semA(r.de));
  }
  if (!perto.size) return { mapa, novas: [] };
  const novas = [];
  const cidades = (mapa.cidades || []).map((c) => {
    if (c.descoberta !== false || !perto.has(semA(c.nome))) return c;
    novas.push(c.nome);
    /* `deOuvir` marca o que se conhece por conversa, não por ter ido: o
       painel desenha esses pontos mais apagados, e é honesto — o herói
       sabe que existe, não sabe como é. */
    return { ...c, descoberta: true, deOuvir: true };
  });
  if (!novas.length) return { mapa, novas: [] };
  return { mapa: { ...mapa, cidades }, novas };
}

/* ============================================================
   O CÃO DE GUARDA DA CHEGADA (v9.43)

   O jogador subiu para o Andar 2 na narração e continuou no Andar 1
   no sistema: o Mestre descreveu a travessia do portal com todas as
   letras — "o Arco Pálido despeja você no Andar 2 de joelhos" — e não
   mandou `cidade_atual`. A ficção andou; o mundo ficou.

   Este cão de guarda é do tipo que RATIFICA, como o de condições: a
   narração está CERTA, e barrá-la seria transformar acerto em erro. O
   que falta é o registro, e registro é trabalho do sistema.

   POR QUE ELE SÓ MORDE QUANDO O DESTINO ESTÁ A UM PASSO. Num
   continente, ir de uma cidade a outra leva dias e passa por uma
   jornada inteira, com estrada, encontros e tempo cobrado — ali,
   "chegar" mencionado numa frase é quase sempre plano, promessa ou
   lembrança, e mover o herói por causa disso seria pior que o bug.
   Na Torre, subir um andar é atravessar um portal: seis horas, um
   gesto, uma cena. É o caso em que a narração PODE, sozinha, ser a
   viagem inteira — e é exatamente esse o caso que o `dias <= 0,5`
   isola. A régua se ajusta sozinha ao molde do mundo: onde viajar é
   caro, o cão dorme.
   ============================================================ */
export const DIAS_DE_UM_PASSO = 0.5;

const semA = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
/* "Andar 2 — das Máscaras" é anunciado na prosa como "Andar 2": a chave
   curta é o que vem antes do travessão. */
const chaveCurta = (nome) => semA(nome).split(/\s+[—–-]\s+/)[0].trim();

export function vizinhosDeUmPasso(mapa, cidade, teto = DIAS_DE_UM_PASSO) {
  const aqui = semA(cidade);
  if (!aqui) return [];
  const out = [];
  for (const r of (mapa && mapa.rotas) || []) {
    if (!r || !(Number(r.dias) <= teto)) continue;
    if (semA(r.de) === aqui) out.push({ nome: r.para, dias: Number(r.dias) || 0, terreno: r.terreno });
    else if (semA(r.para) === aqui) out.push({ nome: r.de, dias: Number(r.dias) || 0, terreno: r.terreno });
  }
  return out;
}

/* Preposição colada no nome — "no Andar 2", "ao Átrio". Sem ela, o nome
   pode estar só sendo citado ("dizem que o Andar 2 é pior"). */
const PREPOSICAO = /\b(n[oa]s?|em|ao|aos?|à|as|para|ate|rumo a|dentro d[eoa]s?)\s+$/;
const CHEGOU = /(cheg|desemboc|despej|cospe|cuspiu|emerg|surge|surgiu|pisa|pisou|poe os pes|pos os pes|atravess|cruz|sobe|subiu|desce|desceu|entra|entrou|aport|atrac|desembarc|deposit|larg|arremess|joga voce|jogou voce|leva voce|levou voce|se ve |se viu |esta agora|agora esta)/;
const NEGADO = /\b(nao |sem |quase |antes de|ainda nao|impedid|se voce|se tivesse|talvez|promete|prometeu|planeja|pretende|pensa em|quer |dizem que|contam que|ouviu falar|um dia)\b/;

const fraseEm = (txt, pos) => {
  let ini = 0;
  for (let i = pos - 1; i >= 0; i--) if (/[.!?;:\n]/.test(txt[i])) { ini = i + 1; break; }
  let fim = txt.length;
  for (let i = pos; i < txt.length; i++) if (/[.!?;:\n]/.test(txt[i])) { fim = i; break; }
  return txt.slice(ini, fim);
};

export function detectarChegada(narrativa, { mapa, cidade, teto = DIAS_DE_UM_PASSO } = {}) {
  const txt = semA(narrativa);
  if (!txt.trim() || !cidade) return null;
  for (const v of vizinhosDeUmPasso(mapa, cidade, teto)) {
    const chaves = [...new Set([semA(v.nome), chaveCurta(v.nome)])].filter((k) => k.length >= 4);
    for (const chave of chaves) {
      let pos = txt.indexOf(chave);
      while (pos >= 0) {
        const frase = fraseEm(txt, pos);
        const antes = txt.slice(Math.max(0, pos - 14), pos);
        if (PREPOSICAO.test(antes) && CHEGOU.test(frase) && !NEGADO.test(frase)) {
          return { nome: v.nome, dias: v.dias, terreno: v.terreno, trecho: frase.trim().slice(0, 140) };
        }
        pos = txt.indexOf(chave, pos + chave.length);
      }
    }
  }
  return null;
}

/* O outro lado da mesma moeda: dizer ao Mestre PARA ONDE dá para ir num
   gesto. Sem isto ele inventa o nome do destino — e acertou por sorte,
   porque "Andar 2" é adivinhável. Só aparece quando existe saída de um
   passo, então em mundo de estrada esta linha nem é gerada. */
export function saidasDeUmPassoPrompt(mapa, cidade, teto = DIAS_DE_UM_PASSO) {
  const vs = vizinhosDeUmPasso(mapa, cidade, teto);
  if (!vs.length) return "";
  const horas = (d) => {
    const h = Math.round((Number(d) || 0) * 24);
    return h <= 1 ? "quase na hora" : `cerca de ${h} horas`;
  };
  return `SAÍDAS DAQUI (fato do sistema): de ${cidade} dá para alcançar ${vs.map((v) => `${v.nome} (${horas(v.dias)})`).join(", ")} numa travessia só — não é jornada, é uma cena. Estes nomes você PODE dizer. Se a cena me levar a uma delas, mande "cidade_atual" com o nome EXATO acima, na mesma resposta em que narrar a chegada; sem isso eu continuo aqui.`;
}

export function notaDaChegada(a, de) {
  if (!a) return "";
  return `[CHEGADA — REGISTRADA PELO SISTEMA] Você narrou que eu cheguei a ${a.nome} e não mandou "cidade_atual". O sistema me moveu: eu saí de ${de || "onde estava"} e AGORA ESTOU em ${a.nome}; o relógio andou o que a travessia custa e o lugar entrou no meu mapa. Trate isso como fato — não me devolva ao lugar anterior e não narre a travessia de novo. Da próxima vez, mande "cidade_atual" junto com a cena.`;
}

/* Um mapa comprado abre a região inteira de uma vez — é para isso que
   alguém paga por um mapa. */
export function descobrirRegiao(mapa, regiao) {
  const alvo = String(regiao || "").trim().toLowerCase();
  if (!mapa || !alvo) return { mapa, novas: [] };
  const novas = (mapa.cidades || []).filter((c) => c.descoberta === false && (c.regiao || "").toLowerCase() === alvo).map((c) => c.nome);
  if (!novas.length) return { mapa, novas: [] };
  return { mapa: { ...mapa, cidades: mapa.cidades.map((c) => (novas.includes(c.nome) ? { ...c, descoberta: true } : c)) }, novas };
}

/* Regiões que o herói já pisou, e as que ainda são boato — é o que a lista
   de mapas à venda usa para não vender o que já está no bolso. */
export function regioesDoMapa(mapa, { conhecidas = null } = {}) {
  const rs = [...new Set(((mapa && mapa.cidades) || []).map((c) => c.regiao).filter(Boolean))];
  if (conhecidas === null) return rs;
  const abertas = new Set(cidadesConhecidas(mapa).map((c) => c.regiao));
  return conhecidas ? rs.filter((r) => abertas.has(r)) : rs.filter((r) => !abertas.has(r));
}

export function resumoGeografiaPrompt(mapa, faccaoJogador) {
  if (!mapa || !(mapa.cidades || []).length) return "";
  const conhecidas = cidadesConhecidas(mapa);
  if (!conhecidas.length) return "";
  const ocultas = (mapa.cidades || []).length - conhecidas.length;
  const dominadas = conhecidas.filter((c) => c.relacao === "jogador").length;
  const cab = faccaoJogador ? `Facção do jogador: ${faccaoJogador} (domina ${dominadas} cidade(s)).` : "";
  const linhas = conhecidas.map((c) => {
    const pop = c.populacao != null ? ` · ${Number(c.populacao).toLocaleString("pt-BR")} hab.` : "";
    const bio = c.bioma ? ` · ${BIOMA_ROTULO[c.bioma] || c.bioma}` : "";
    return `• ${c.nome} (${(PORTES[c.porte || c.tipo] || {}).rotulo || c.tipo}${c.regiao ? `, ${c.regiao}` : ""}${bio}${pop}) — facção: ${c.faccao || "nenhuma"} [${c.relacao === "jogador" ? "SUA" : c.relacao || "neutra"}]${c.sede ? " [SEDE]" : ""}`;
  });
  /* rota só aparece quando as DUAS pontas já são conhecidas: um caminho para
     um lugar que o herói nunca ouviu falar entregaria o nome dele */
  const nomesOk = new Set(conhecidas.map((c) => c.nome));
  const rotas = (mapa.rotas || []).filter((r) => nomesOk.has(r.de) && nomesOk.has(r.para))
    .map((r) => `• ${r.de} ↔ ${r.para}: ${(TERRENO_VIAGEM[r.terreno] || {}).rotulo || r.terreno}, ${r.km} km, ~${String(r.dias).replace(".", ",")} dia(s)`);
  const regioesAbertas = new Set(conhecidas.map((c) => c.regiao).filter(Boolean));
  return [
    cab,
    mapa.continente ? `CONTINENTE: ${mapa.continente}${(mapa.regioes || []).length ? ` — regiões conhecidas: ${mapa.regioes.filter((r) => regioesAbertas.has(r.nome)).map((r) => `${r.nome} (${BIOMA_ROTULO[r.bioma] || r.bioma})`).join(", ") || "nenhuma ainda"}` : ""}` : "",
    "CIDADES QUE O HERÓI CONHECE (porte e população são fatos do sistema — só estas existem para ele):",
    ...linhas,
    ocultas > 0 ? `AINDA NO ESCURO: existem ${ocultas} lugar(es) neste mundo que o herói NUNCA visitou nem viu num mapa. Você pode dizer que há estrada seguindo adiante, que viajantes falam de terras a mais dias de marcha, que um mapa se compra com um cartógrafo — mas NUNCA invente o nome nem descreva uma dessas cidades. Elas se revelam viajando ou comprando o mapa da região.` : "",
    rotas.length ? "CAMINHOS (rotas fixas — use SEMPRE estes terrenos e tempos; não invente mar ou deserto onde não há):" : "",
    ...rotas,
  ].filter(Boolean).join("\n");
}
