/* o-que-ha-nas-coisas.js (o Mestre que conhece a cena, etapa 3 · 21/11/2026)
   — «o que há nas coisas comuns», e «o que aguenta o peso».

   O desenho é mente/lancamento/o-mestre-vivo.md §20.4, §22.3 e §23. A quarta
   sessão jogada viu três buscas passarem sem dado («sob as telhas», «atrás
   dos caixotes», «nos cestos») e uma escalada da calha sem veredito: a régua
   do mestre real só rola a busca onde HÁ o que achar, e a escalada onde o
   corpo arrisca — e o sistema não sabia nem uma coisa nem outra. O achado só
   existia por lugar do mapa (achavelAqui, mundo-base.js), por sala de
   masmorra e por passo de quest (achadoDoPasso); cestos, caixotes, telhas e
   barracas não tinham nada, e a firmeza do que se escala não tinha fonte.

   Este módulo é a fonte das duas coisas, e só delas:
     - AS_COISAS_AO_TOQUE: as coisas comuns de cada tipo de lugar (os tipos de
       elenco-do-lugar.js, mais «rua», «interior» e «ermo»), nomeáveis pela
       frase. Entram na cena do jogo como coisas AO TOQUE: a régua só lê as
       marcas delas quando a frase as nomeia (cena-do-momento.js:
       aCenaQueAFraseToca) — a calha frágil da rua não faz rolar toda
       escalada, e o cesto com moedas não faz rolar toda busca.
     - O_ESCONDIDO_NAS_COISAS: se há algo escondido numa coisa e o quê, POR
       SEMENTE (o mundo + o lugar + o dia + a coisa): a mesma semente dá o
       mesmo achado em qualquer máquina. O que se acha sai das tabelas de item
       que já existem (moedas e os consumíveis comuns de pocoes.js).
     - A_FIRMEZA_DO_QUE_SE_ESCALA: o que é frágil (a calha, a treliça, a corda
       velha, o galho, o telhado de palha, o toldo), por palavra e por tipo de
       lugar; e o que é firme (o degrau, a escada, o muro baixo), que nunca é.

   A regra do mestre real, que a régua já tem e que aqui ganha a fonte:
   procurar onde há algo pede dado; procurar onde não há nada não pede, e
   devolve o vazio sem dado; o jogador não distingue os dois antes de
   procurar (nada disto vai à tela: a coisa e o estado são bastidor); revistar
   o que é de alguém com o dono olhando pede dado pelo risco, haja ou não
   algo (a mão leve da régua, A_BUSCA_SOB_OLHOS — não é daqui).

   PURO: sem React, sem relógio, sem Math.random. Lixo devolve lista vazia ou
   null, nunca lança. */
import { tipoDoSitio } from "./elenco-do-lugar.js";
import { consumivelPorId } from "./pocoes.js";

const obj = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const txt = (x) => (typeof x === "string" ? x.trim() : "");
const sem = (x) => txt(x).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const semArtigo = (x) => sem(x).replace(/^(o|a|os|as)\s+/, "").trim();
const num = (x) => (typeof x === "number" && Number.isFinite(x) ? x : null);

/* FNV-1a de 32 bits → [0, 1): o mesmo número para a mesma semente, em
   qualquer máquina (a régua do destino usa o mesmo hash) */
const fnv = (s) => { let h = 0x811c9dc5; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h; };
const sorteDe = (s) => fnv(s) / 0x100000000;

/* ---------------- O TIPO DO LUGAR, PARA AS COISAS ----------------
   Os tipos de elenco-do-lugar.js (ELENCO_DO_LUGAR.tipos), e três a mais que
   só as coisas precisam: `rua` (dentro dos muros, sem lugar ou num lugar sem
   tipo e sem prédio — o largo, a praça), `interior` (o
   cômodo de um prédio que o sistema não sabe de que tipo é — o quarto de
   cima, a sala dos fundos) e `ermo` (fora dos muros: a estrada, os arredores).
   Na masmorra, nenhum: a sala tem os seus segredos (masmorras.js). */
export const TIPOS_SEM_SITIO = Object.freeze({ rua: "rua", interior: "interior", ermo: "ermo" });
/* 21/11 (a quinta sessão jogada, o-mestre-vivo.md §25): O TIPO QUE O MUNDO
   DEU AO LOCAL. O lugar de agora (lugar.js: garantirLugar) guarda só o nome;
   o tipo morava no local da base (mundo-base.js: { nome, tipo }) e não
   chegava aqui. Pelo nome, «Molhe Velho», «Pátio das Trocas» e «A Âncora
   Torta» não dizem tipo nenhum, e a sessão inteira (um mundo do mar) caiu em
   «rua»: os cestos, os sacos, a carroça, os barris e as mesas não existiam
   para a frase, e só os caixotes eram julgados. O App passa agora o tipo do
   local da base em `lugar.tipoDoLocal` (derivado, nunca guardado).
   `O_TIPO_DO_LOCAL`: os tipos de local dos moldes (moldes.js: LOCAIS_MAR,
   LOCAIS_TORRE, LOCAIS_ESTELAR) no tipo de lugar das coisas que lhes faz as
   vezes — o cais é as docas, a taverna do porto é a taverna. O tipo que já é
   um tipo das coisas vale por si; o que não tem par (o portal) fica pelo
   nome, como antes. */
export const O_TIPO_DO_LOCAL = Object.freeze({
  "taverna do porto": "taverna", cais: "docas", "mercado de espólios": "mercado", estaleiro: "docas",
  "capela do mar": "templo", forte: "quartel", "casa de cartas": "biblioteca", "poço das brigas": "arena",
  descanso: "taverna", "feira do andar": "mercado", oficina: "forja", "capela do degrau": "templo",
  arquivo: "biblioteca", cela: "cadeia", "arena do andar": "arena",
  "doca de atracação": "docas", concourse: "mercado", "oficina de casco": "forja", enfermaria: "interior",
  "capela do vácuo": "templo", "núcleo de dados": "biblioteca", "posto de segurança": "quartel", "poço de gravidade": "arena",
});
function tipoDoLocalDaBase(lugar) {
  const t = obj(lugar) ? txt(lugar.tipoDoLocal) : "";
  if (!t) return "";
  if (Object.prototype.hasOwnProperty.call(AS_COISAS_AO_TOQUE, t)) return t;
  return Object.prototype.hasOwnProperty.call(O_TIPO_DO_LOCAL, t) ? O_TIPO_DO_LOCAL[t] : "";
}
export function tipoParaAsCoisas(o) {
  try {
    const x = obj(o) ? o : {};
    if (obj(x.masmorra) && !x.masmorra.encerrada && Array.isArray(x.masmorra.salas)) return "";
    const lugar = obj(x.lugar) && txt(x.lugar.nome) ? x.lugar : null;
    if (x.jornada === true || !txt(x.cidade) || (lugar && lugar.distancia === "arredores")) return TIPOS_SEM_SITIO.ermo;
    if (!lugar) return TIPOS_SEM_SITIO.rua;
    let t = tipoDoLocalDaBase(lugar);
    if (!t) { try { t = tipoDoSitio(lugar); } catch { t = ""; } }
    /* sem tipo: o cômodo de um prédio (dentroDe) é interior; o resto (o largo,
       a praça, o depósito que o mundo não sabe de quem é) é rua, como na cena
       do jogo, que o lê ao ar livre */
    return t || (txt(lugar.dentroDe) ? TIPOS_SEM_SITIO.interior : TIPOS_SEM_SITIO.rua);
  } catch { return ""; }
}

/* ---------------- AS COISAS AO TOQUE ----------------
   Por tipo de lugar, as coisas comuns que a frase pode nomear e que podem
   guardar algo. O nome vai com o artigo; a régua casa a frase pelo núcleo
   (a primeira palavra de conteúdo, no singular ou no plural:
   coisasQueAFraseNomeia). Nenhum nome repete o núcleo de uma coisa que a
   cena já escreve por outra fonte (a porta, o lugar, o chão, a sala, o
   rastro, o portão). Pouco por lugar, de propósito: são as coisas que um
   jogador revira numa cena dessas, e não um inventário do cenário.
   21/11 (§25): a quinta sessão jogada nomeou, em oito buscas, coisas que a
   tabela não tinha (as mesas e os bancos da taverna, os barris do mercado, as
   tábuas e os cestos de peixe do cais) — e coisa que a frase nomeia e o lugar
   não tem nunca guarda nada nem rola. O acervo cresce no mesmo formato, até
   seis por lugar; a proporção por coisa não muda. */
export const AS_COISAS_AO_TOQUE = Object.freeze({
  mercado: Object.freeze(["os cestos", "os caixotes", "os sacos", "a carroça", "os barris"]),
  docas: Object.freeze(["os caixotes", "os barris", "as redes", "os fardos", "as tábuas", "os cestos"]),
  taverna: Object.freeze(["os barris", "o balcão", "a lareira", "as telhas", "as mesas", "os bancos"]),
  templo: Object.freeze(["os bancos", "o altar", "os nichos"]),
  forja: Object.freeze(["o carvão", "a bancada", "os baldes"]),
  quartel: Object.freeze(["os catres", "os fardos"]),
  cadeia: Object.freeze(["a palha", "os catres"]),
  biblioteca: Object.freeze(["as estantes", "os livros"]),
  arena: Object.freeze(["as arquibancadas", "os fardos"]),
  "cemitério": Object.freeze(["as lápides", "os túmulos"]),
  guilda: Object.freeze(["as prateleiras", "os arquivos"]),
  "casa de banhos": Object.freeze(["os cestos", "as toalhas"]),
  portao: Object.freeze(["os caixotes", "a guarita"]),
  rua: Object.freeze(["os caixotes", "os telhados", "as telhas", "o poço", "os cestos", "a carroça"]),
  interior: Object.freeze(["os caixotes", "as prateleiras", "os sacos", "a cama"]),
  ermo: Object.freeze(["as pedras", "o tronco oco", "os arbustos"]),
});

/* ---------------- O QUE HÁ ESCONDIDO ----------------
   `proporcao`: a chance de UMA coisa guardar algo, por tipo de lugar, num
   dia. O motivo do número (a pessoa pediu sobriedade: a cidade não é um
   baú): um lugar tem três ou quatro coisas ao toque; com 1 em 4 nos lugares
   onde a coisa passa de mão em mão o dia inteiro (o mercado, as docas), o
   herói que revira coisa a coisa acha em média uma coisa pequena por lugar
   e por dia — e a coisa revirada não paga duas vezes. Na taverna e na casa,
   1 em 5; na rua e no ermo, onde pouco se larga, 1 em 7 (~0,15); nos
   lugares guardados, de culto ou de ofício, 1 em 10 (`padrao`). O valor do
   achado é pequeno (o `acervo`): duas a oito moedas, ou um consumível comum
   — abaixo do baú do ermo (achavelAqui), que paga dezenas.
   `acervo`: o que se acha, por tipo (sem linha, `padrao`), com o peso. Cada
   entrada tira o achado de uma tabela de item que já existe: `moedas`
   [min, max] (a bolsa), ou `consumivel` (o id em CONSUMIVEIS, pocoes.js —
   a suíte confere que existe e é comum). `diz`: o que é, para o Narrador
   descrever (nunca vai à tela como regra). */
const M = (diz, min, max, peso) => Object.freeze({ diz, moedas: Object.freeze([min, max]), peso });
const K = (diz, consumivel, peso) => Object.freeze({ diz, consumivel, peso });
export const O_ESCONDIDO_NAS_COISAS = Object.freeze({
  proporcao: Object.freeze({ mercado: 0.25, docas: 0.25, taverna: 0.2, interior: 0.2, rua: 0.15, ermo: 0.15 }),
  padrao: 0.1,
  acervo: Object.freeze({
    padrao: Object.freeze([
      M("umas moedas que alguém deixou cair e não voltou para buscar", 2, 6, 5),
      K("um rolo de ataduras de linho, ainda limpo", "ataduras", 2),
      K("um feixe de tochas enrolado num pano", "tochas", 2),
    ]),
    mercado: Object.freeze([
      M("moedas que rolaram de alguma bolsa e ficaram presas no fundo", 2, 8, 6),
      K("um rolo de ataduras esquecido por um vendedor", "ataduras", 2),
      K("um feixe de tochas que caiu de alguma carga", "tochas", 2),
      K("um frasco de antídoto embrulhado em palha", "antidoto", 1),
    ]),
    docas: Object.freeze([
      M("umas moedas escondidas por algum estivador", 2, 8, 5),
      K("um feixe de tochas de breu, de alguma carga", "tochas", 3),
      K("um rolo de ataduras, ainda limpo", "ataduras", 2),
    ]),
    taverna: Object.freeze([
      M("umas moedas que algum freguês escondeu e esqueceu", 3, 8, 6),
      K("um frasco de sais aromáticos", "sais", 2),
      K("um frasco de antídoto", "antidoto", 1),
    ]),
    interior: Object.freeze([
      M("umas moedas guardadas às escondidas", 2, 8, 5),
      K("um rolo de ataduras guardado para um dia ruim", "ataduras", 2),
      K("um frasco de sais aromáticos", "sais", 1),
    ]),
    ermo: Object.freeze([
      M("um embrulho com umas moedas, escondido por algum viajante", 1, 5, 3),
      K("um rolo de ataduras de algum viajante", "ataduras", 2),
      K("um feixe de tochas que alguém deixou para a volta", "tochas", 2),
      K("um frasco de antídoto num embrulho de couro", "antidoto", 2),
    ]),
  }),
  /* o id do achado: a base do mundo guarda os saqueados por id
     (mundo-base.js: saquear) — a coisa revirada não paga duas vezes */
  prefixo: "coisa",
  icone: "🧺",
});

/* ---------------- A FIRMEZA DO QUE SE ESCALA ----------------
   `frageis`: o que range e cede sob o peso, por palavra, e onde existe (os
   tipos de lugar acima). Uma coisa frágil entra na cena com o estado
   `fragil` (marca `pune`: falhar machuca), e a régua faz rolar a escalada
   que a nomeia — sem altura dita, é o veredito de um mestre real («a calha
   é velha, rola Atletismo»). `firmes`: o que um mestre não faz rolar sem
   perigo nem pressa (o degrau, a escada, o muro baixo): nunca são frágeis,
   em lugar nenhum — a suíte o confere. A altura dita na frase continua a
   ser perigo por si (PERIGO_DECLARADO, motor/a-regua-do-momento.js). */
export const A_FIRMEZA_DO_QUE_SE_ESCALA = Object.freeze({
  frageis: Object.freeze([
    Object.freeze({ nome: "a calha", onde: Object.freeze(["rua", "interior", "taverna", "mercado", "templo", "guilda", "biblioteca", "casa de banhos"]) }),
    Object.freeze({ nome: "a treliça", onde: Object.freeze(["templo", "interior", "taverna", "casa de banhos"]) }),
    Object.freeze({ nome: "a corda velha", onde: Object.freeze(["docas"]) }),
    Object.freeze({ nome: "o galho", onde: Object.freeze(["ermo", "cemitério"]) }),
    Object.freeze({ nome: "o telhado de palha", onde: Object.freeze(["ermo"]) }),
    Object.freeze({ nome: "o toldo", onde: Object.freeze(["mercado"]) }),
  ]),
  firmes: Object.freeze(["o degrau", "a escada", "o muro baixo", "a parede de pedra"]),
});

/* a firmeza de UMA coisa num tipo de lugar: "fragil", "firme" ou "" (o
   sistema não sabe — e então a coisa não é frágil) */
export function firmezaDe(nome, tipo) {
  const n = semArtigo(nome);
  if (!n) return "";
  if (A_FIRMEZA_DO_QUE_SE_ESCALA.firmes.some((f) => semArtigo(f) === n)) return "firme";
  const f = A_FIRMEZA_DO_QUE_SE_ESCALA.frageis.find((x) => semArtigo(x.nome) === n);
  return f && f.onde.includes(txt(tipo)) ? "fragil" : "";
}

/* ---------------- O QUE HÁ NUMA COISA ----------------
   oQueHaNaCoisa({ semente, lugar, tipo, dia, coisa, saqueados }) → null |
     { id, especie: "coisa", coisa, o, onde, moedas?, consumivel?, icone }
   `lugar`: o nome do lugar (ou a cidade, ou «ermo» — a mesma régua da chave
   do livro de tentativas); `saqueados`: a lista da base do mundo (o que já
   se achou não volta). A forma é a de um achado (achavelAqui): o desafio de
   busca o leva no veredito, e o facto do sucesso o diz. Sem semente, null:
   sem árbitro, não há achado. */
export function oQueHaNaCoisa(o) {
  try {
    const x = obj(o) ? o : {};
    const semente = txt(String(x.semente == null ? "" : x.semente));
    const coisa = txt(x.coisa), tipo = txt(x.tipo);
    const lugar = sem(x.lugar) || "ermo";
    const dia = num(x.dia) == null ? 0 : x.dia;
    if (!semente || !coisa || !tipo) return null;
    const E = O_ESCONDIDO_NAS_COISAS;
    const base = `${semente}|escondido|${lugar}|${dia}|${semArtigo(coisa)}`;
    const p = num(E.proporcao[tipo]) == null ? E.padrao : E.proporcao[tipo];
    if (sorteDe(base) >= p) return null;
    const id = `${E.prefixo}|${lugar}|${dia}|${semArtigo(coisa)}`;
    if (arr(x.saqueados).includes(id)) return null;
    const lista = arr(E.acervo[tipo]).length ? E.acervo[tipo] : E.acervo.padrao;
    const total = lista.reduce((s, a) => s + a.peso, 0);
    let r = sorteDe(base + "|o-que") * total;
    let a = lista[lista.length - 1];
    for (const e of lista) { if (r < e.peso) { a = e; break; } r -= e.peso; }
    const ganho = a.consumivel ? { consumivel: a.consumivel }
      : { moedas: a.moedas[0] + Math.floor(sorteDe(base + "|quanto") * (a.moedas[1] - a.moedas[0] + 1)) };
    return Object.freeze({ id, especie: "coisa", coisa, o: a.diz, onde: noNome(coisa), ...ganho, icone: E.icone });
  } catch { return null; }
}

/* «nos cestos», «na calha»: a preposição em com o artigo do nome */
const CONTRACAO_DO_EM = Object.freeze({ o: "no", a: "na", os: "nos", as: "nas" });
function noNome(nome) {
  const n = txt(nome);
  const m = n.match(/^(o|a|os|as)\s+(.+)$/i);
  return m ? `${CONTRACAO_DO_EM[m[1].toLowerCase()]} ${m[2]}` : `em ${n}`;
}

/* ---------------- AS COISAS DA CENA ----------------
   asCoisasAoToque({ semente, lugar, cidade, jornada, masmorra, dia,
   saqueados }) → [{ nome, estados, toque: true }] — as coisas comuns do tipo
   do lugar (com `ha_algo_escondido` quando a semente diz que há) e as
   frágeis que existem nesse tipo (com `fragil`). A cena do jogo as põe por
   último; a régua só as lê quando a frase as nomeia. */
export function asCoisasAoToque(o) {
  try {
    const x = obj(o) ? o : {};
    const tipo = tipoParaAsCoisas(x);
    if (!tipo) return [];
    const lugar = (obj(x.lugar) && txt(x.lugar.nome)) || txt(x.cidade) || "ermo";
    const out = [];
    const por = (nome, estado) => {
      const c = out.find((y) => semArtigo(y.nome) === semArtigo(nome));
      if (c) { if (estado && !c.estados.includes(estado)) c.estados.push(estado); return; }
      out.push({ nome, estados: estado ? [estado] : [], toque: true });
    };
    for (const nome of arr(AS_COISAS_AO_TOQUE[tipo])) {
      const a = oQueHaNaCoisa({ semente: x.semente, lugar, tipo, dia: x.dia, coisa: nome, saqueados: x.saqueados });
      por(nome, a ? "ha_algo_escondido" : "");
    }
    for (const f of A_FIRMEZA_DO_QUE_SE_ESCALA.frageis) if (firmezaDe(f.nome, tipo) === "fragil") por(f.nome, "fragil");
    return out;
  } catch { return []; }
}

/* ---------------- O ACHADO NA COISA QUE A FRASE NOMEIA ----------------
   aCoisaAoToqueDaFrase(frase, o, nomeia) → null | { nome, achado | null }
   `nomeia(frase, coisas)`: quem casa a frase com as coisas (o App passa
   coisasQueAFraseNomeia de cena-do-momento.js — a MESMA régua da cena, para
   que o achado e o veredito nunca discordem de que coisa se fala). A
   primeira coisa ao toque nomeada; o achado dela, se houver. */
export function aCoisaAoToqueDaFrase(frase, o, nomeia) {
  try {
    if (typeof frase !== "string" || !frase.trim() || typeof nomeia !== "function") return null;
    const x = obj(o) ? o : {};
    const coisas = asCoisasAoToque(x);
    if (!coisas.length) return null;
    const ditas = arr(nomeia(frase, { pessoas: [], criaturas: [], coisas, cena: { estados: [] } }));
    const c = coisas.find((y) => ditas.includes(y.nome));
    if (!c) return null;
    const tipo = tipoParaAsCoisas(x);
    const lugar = (obj(x.lugar) && txt(x.lugar.nome)) || txt(x.cidade) || "ermo";
    const achado = c.estados.includes("ha_algo_escondido")
      ? oQueHaNaCoisa({ semente: x.semente, lugar, tipo, dia: x.dia, coisa: c.nome, saqueados: x.saqueados }) : null;
    return Object.freeze({ nome: c.nome, achado });
  } catch { return null; }
}

/* ---------------- O QUE O ACHADO PÕE NA BOLSA ----------------
   O sistema entrega, nunca a narração: `moedas` (o número já sorteado pela
   semente) ou o consumível (o item da tabela, pronto para a bolsa). E o
   envelope de um turno, fato fixo para o Narrador descrever sem inventar. */
export function oQueOAchadoDa(achado) {
  const a = obj(achado) ? achado : null;
  if (!a || a.especie !== O_ESCONDIDO_NAS_COISAS.prefixo) return null;
  const c = a.consumivel ? consumivelPorId(a.consumivel) : null;
  if (a.consumivel && !c) return null;
  return Object.freeze({ moedas: num(a.moedas) || 0, consumivel: c ? c.id : "", nome: c ? c.nome : "", icone: c ? c.icone : "◉" });
}
export const O_ACHADO_NA_TELA = Object.freeze({
  moedas: "{icone} {o} — ◉ {moedas} moedas na sua bolsa.",
  item: "{icone} {o} — {nome} na sua bolsa.",
  envelope: "[ACHADO — RESOLVIDO PELO SISTEMA] Procurei {onde} e achei: {o}. O sistema já pôs na minha bolsa {ganho} — NÃO envie itens nem moedas, e não transforme isto em outra coisa. Descreva o achado em uma ou duas frases. {Onde} agora não guarda mais nada.",
});
export function telaDoAchadoNaCoisa(achado, ganho) {
  const a = obj(achado) ? achado : null, g = obj(ganho) ? ganho : null;
  if (!a || !g) return "";
  const T = O_ACHADO_NA_TELA;
  const o = txt(a.o).replace(/^./, (ch) => ch.toUpperCase());
  return (g.consumivel ? T.item.replace("{nome}", g.nome) : T.moedas.replace("{moedas}", String(g.moedas)))
    .replace("{icone}", txt(a.icone) || O_ESCONDIDO_NAS_COISAS.icone).replace("{o}", o);
}
export function envelopeDoAchadoNaCoisa(achado, ganho) {
  const a = obj(achado) ? achado : null, g = obj(ganho) ? ganho : null;
  if (!a || !g) return "";
  const onde = txt(a.onde);
  return O_ACHADO_NA_TELA.envelope.replace("{onde}", onde).replace("{o}", txt(a.o))
    .replace("{ganho}", g.consumivel ? g.nome : `◉ ${g.moedas} moedas`)
    .replace("{Onde}", onde.replace(/^./, (ch) => ch.toUpperCase()));
}
