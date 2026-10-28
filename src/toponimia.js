/* ============================================================
   TOPONÍMIA (v9.58) — o nome do lugar por combinação

   O relato foi este: "em três das criações tive os mesmos nomes, o
   Javali Cambaleante etc."

   Não era azar nem viés do sorteio — medi, e a distribuição era
   uniforme. Era o TAMANHO do banco. As tavernas tinham 25 nomes
   escritos à mão; o mercado, cinco; a forja, quatro; a arena, três.
   Um mundo nasce com catorze assentamentos, e todos têm mercado.

   Sortear cinco nomes para catorze lugares não é sortear: é repetir
   com uma etapa a mais. A conta do aniversário diz que a chance de
   dois mercados saírem com o mesmo nome NO MESMO MUNDO era de
   praticamente 100%, e foi por isso que a "Feira Baixa" apareceu duas
   vezes na mesma planta. Entre mundos diferentes, uma taverna em cada
   quatro criações repetia — e três criações bastaram para o jogador
   notar.

   A saída não é embaralhar melhor. É ter mais vocabulário.

   COMO FUNCIONA: nomes nascem de PARTES combinadas, não de uma lista.
   Um substantivo com gênero, um adjetivo que concorda com ele, um
   complemento já preposicionado. Três padrões sobre bancos de algumas
   dezenas de palavras dão milhares de nomes por tipo de lugar — e os
   nomes escritos à mão continuam saindo, porque as palavras deles
   estão nos bancos.

   O QUE ISTO NÃO PROMETE: unicidade. Nada aqui olha as outras cidades
   — `locaisDaCidade` é chamado uma cidade por vez, de dentro do painel
   do mapa inclusive, e uma função determinística que precisasse do
   mundo inteiro para nomear uma forja seria pior que o problema.
   O que se compra é probabilidade: de "quase certo que repete" para
   "raro o bastante para não denunciar o gerador". A sonda mede.

   T4-B (28/10, o cenário como arquivo, 5.ª fatia): as PALAVRAS moram no
   cenário (cenario-padrao.js `lugares`) — os bancos de cada gênero e os
   substantivos de cada tipo de local. A REGRA fica aqui: os três padrões e
   a sorte que escolhe entre eles, a concordância do adjetivo, o plural, o
   artigo. Um mundo novo traz as palavras dele, e os nomes saem com a mesma
   gramática. O motor chega cá por mundo-base.js e guildas.js, que chamam
   `nomeDeLocal` — uma função, que lê o banco vivo na hora.
   ============================================================ */
import { sorteDaCasa } from "./semente.js";
import { aoTrocarDeCenario } from "./cenario.js";

/* Um substantivo é "Palavra|g", em que g é m, f, mp ou fp — o p é o
   plural, e ele existe porque "A Termas do Rio Baixo" saiu da primeira
   passada. Um adjetivo é "masc|fem"; sem a barra, não flexiona
   ("Cambaleante", "Sem Fundo"). O plural do adjetivo é o do português:
   acrescenta -s, e -es depois de consoante. */
const sub = (s) => { const [n, g] = s.split("|"); const gg = g || "m"; return { n, g: gg[0] === "f" ? "f" : "m", pl: gg.length > 1 }; };
const adj = (s) => { const [m, f] = s.split("|"); return { m, f: f || m }; };
/* O plural do adjetivo. Curto porque os bancos são escolhidos para caber
   nestas quatro regras — um adjetivo em -il ("frágil" → "frágeis") pede uma
   quinta que só serviria a ele, e é mais barato não ter esse adjetivo. */
const plural = (w) => {
  if (/[aeiouãõ]$/i.test(w)) return w + "s";        // rosa → rosas, órfã → órfãs
  if (/[rz]$/i.test(w)) return w + "es";            // estelar → estelares
  if (/l$/i.test(w)) return w.slice(0, -1) + "is";  // azul → azuis, fatal → fatais
  if (/m$/i.test(w)) return w.slice(0, -1) + "ns";  // comum → comuns
  return w;                                          // -s invariável: simples, grátis
};
/* Locução não é adjetivo e não flexiona: "as águas sem fundo", não "sem
   fundos". A régua é o espaço — o que tem mais de uma palavra é frase. */
const comNumero = (forma, pl) => (pl && !/\s/.test(forma) ? plural(forma) : forma);
const art = (n) => (n.pl ? (n.g === "f" ? "As" : "Os") : n.g === "f" ? "A" : "O");
const artMin = (n) => (n.pl ? (n.g === "f" ? "as" : "os") : n.g === "f" ? "a" : "o");
const de = (n) => (n.pl ? (n.g === "f" ? "das" : "dos") : n.g === "f" ? "da" : "do");

/* Os bancos do mundo em uso: `lugares.bancos` (por gênero: `subst`, `adj`,
   `compl`, na forma acima) e `lugares.tipos` (os substantivos de cada tipo
   de local). O gênero sem banco usa o de `generos.padrao` — era o banco
   da fantasia, escrito à mão, e é o mesmo gênero; o cenário recusa o padrão sem
   banco. A ordem das listas é a de sempre, e a sorte sai igual: o dourado
   do cenário prova-o. */
let BANCO = {};
let SINONIMOS = {};
let PADRAO = "";
aoTrocarDeCenario((c) => { BANCO = c.lugares.bancos; SINONIMOS = c.lugares.tipos; PADRAO = c.generos.padrao; });
const tem = (o, k) => typeof k === "string" && Object.hasOwn(o, k);
const bancoDe = (g) => (tem(BANCO, g) ? BANCO[g] : BANCO[PADRAO]);
/* Os sinônimos de cada tipo de lugar. É o que impede "A Praça Cambaleante"
   de virar um templo: o substantivo diz de que prédio se trata, e o resto
   do nome só o qualifica. Tipo desconhecido não tem sinônimo. */
const sinonimosDe = (tipo) => (tem(SINONIMOS, tipo) ? SINONIMOS[tipo] : null);

/* Três padrões, e a escolha entre eles também é sorteada. Padrões dão
   nomes que soam feitos à mão porque é assim que nomes de taverna são
   feitos: um bicho e um defeito, dois bichos, ou um bicho e um dono. */
function porPadrao(rnd, nucleo, banco) {
  const s = sub(nucleo);
  const p = rnd();
  if (p < 0.4) {
    const a = adj(banco.adj[Math.floor(rnd() * banco.adj.length)]);
    return `${art(s)} ${s.n} ${comNumero(s.g === "f" ? a.f : a.m, s.pl)}`;
  }
  if (p < 0.75) {
    return `${art(s)} ${s.n} ${banco.compl[Math.floor(rnd() * banco.compl.length)]}`;
  }
  const o = sub(banco.subst[Math.floor(rnd() * banco.subst.length)]);
  if (o.n === s.n) {
    const a = adj(banco.adj[Math.floor(rnd() * banco.adj.length)]);
    return `${art(s)} ${s.n} ${comNumero(s.g === "f" ? a.f : a.m, s.pl)}`;
  }
  return `${art(s)} ${s.n} & ${artMin(o)} ${o.n}`;
}

/* O nome de uma taverna, estalagem, bar — o coração do banco, porque é o
   lugar em que o jogador entra primeiro e o nome que ele lê mais vezes. */
export function nomeDeTaverna(genero, rnd = sorteDaCasa) {
  const b = bancoDe(genero);
  return porPadrao(rnd, b.subst[Math.floor(rnd() * b.subst.length)], b);
}

/* O nome de qualquer outro local da cidade. O tipo escolhe o substantivo;
   os bancos do gênero fazem o resto. Tipo desconhecido devolve "" — quem
   chama decide o que fazer, e inventar aqui seria pior. */
export function nomeDeLocal(tipo, genero, rnd = sorteDaCasa) {
  if (tipo === "taverna") return nomeDeTaverna(genero, rnd);
  const sins = sinonimosDe(tipo);
  if (!sins) return "";
  const b = bancoDe(genero);
  const s = sub(sins[Math.floor(rnd() * sins.length)]);
  const p = rnd();
  if (p < 0.38) {
    const a = adj(b.adj[Math.floor(rnd() * b.adj.length)]);
    return `${art(s)} ${s.n} ${comNumero(s.g === "f" ? a.f : a.m, s.pl)}`;
  }
  if (p < 0.72) return `${art(s)} ${s.n} ${b.compl[Math.floor(rnd() * b.compl.length)]}`;
  const o = sub(b.subst[Math.floor(rnd() * b.subst.length)]);
  return `${art(s)} ${s.n} ${de(o)} ${o.n}`;
}

/* Quantos nomes distintos este banco sabe produzir para um tipo. Existe
   para a sonda poder AFIRMAR o tamanho em vez de eu acreditar nele. */
export function tamanhoDoBanco(tipo, genero) {
  const b = bancoDe(genero);
  const nucleos = tipo === "taverna" ? b.subst.length : (sinonimosDe(tipo) || []).length;
  if (!nucleos) return 0;
  return nucleos * (b.adj.length + b.compl.length + b.subst.length);
}

export function tiposComNome() { return ["taverna", ...Object.keys(SINONIMOS)]; }
export function generosDaToponimia() { return Object.keys(BANCO); }
