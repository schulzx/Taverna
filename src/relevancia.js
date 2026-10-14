/* ============================================================
   A RELEVÂNCIA DO TURNO (onda 3 do custo do turno, 14/10/2026)

   A onda 2 fechou portas inteiras (o mercado, o governo, os chefes) com a
   pergunta "a coisa está em jogo neste turno?". Esta onda faz a mesma
   pergunta DENTRO das listas que entram sempre — a gente, o cânone, as
   masmorras — e manda o que a cena usa, não o que o mundo tem.

   Medido nos 201 pedidos reais das 8.ª a 10.ª sessões (mente/custo-do-turno.md
   e o bloco de 14/10 do diário):
     · a GENTE DA CIDADE ia inteira — 15 pessoas, ~1,8 mil caracteres por
       turno, com o mesmo quem-é-quem que as PESSOAS CONHECIDAS já diziam
       para quem o herói conhece (o ✓). Das 264 vezes que uma delas saiu na
       narração, 242 já estavam citadas no turno pelo nome;
     · o CÂNONE ia inteiro (~570), e das 41 citações dele nas narrações,
       39 eram do lugar, de quem está em cena ou de um nome dito no turno;
     · as MASMORRAS da região, quando a porta abre, iam todas (~1 mil).

   A régua de tudo aqui é UMA: o que está EM JOGO entra inteiro. Em jogo é
     · o que o turno cita pelo nome — a frase do jogador, a pauta e os
       envelopes, a lista das missões, as duas últimas narrações, o arco e o
       fio da espinha (`textoDoTurno`);
     · quem a cena tem — o grupo, quem está aqui, quem a missão pede, o
       núcleo da campanha (`emJogo`);
     · o lugar onde o herói está (`lugares`).
   O resto não some do mundo: fica curto (a gente da cidade com nome, povo,
   ofício e traço), fica com o nome noutro bloco (o LONGE, a lista das
   cidades), ou sai até a cena o pôr em jogo — e no turno seguinte, citado
   na narração, volta inteiro.

   NUNCA SAEM por aqui: vetos, desfechos, PERGUNTOU, a batida, a frase do
   jogador (são da pauta, e esta peça nem as vê). Sem `relevancia` (null,
   prompt montado fora de um turno, ou o órgão estourou), toda função desta
   casa devolve o comportamento de antes, letra por letra.

   Determinista: o mesmo texto e a mesma cena decidem sempre o mesmo.
   ============================================================ */

/* ---------------- A TABELA ---------------- */
export const RELEVANCIA = {
  /* PESSOAS CONHECIDAS fora do jogo: o punhado que o herói conhece e pode
     citar sem ninguém perguntar (pela ordem da importância do registo).
     Nas 8.ª–10.ª, com 4 e 700, nenhuma pessoa citada numa narração perdeu
     a sua linha; com 0, perdiam-se duas (Helga, s10 50 e 53). */
  citaveis: { pessoas: 4, chars: 700 },
  /* masmorras da região quando a porta delas abre: as citadas, mais estas
     mais perto da base (pelas horas da ficha). Com 3, uma narração em 8
     citou uma que ficou de fora (s8 71, cor de estrada: escolheria outra
     da lista) */
  masmorrasPerto: 3,
  /* a gente da cidade fora do jogo leva só isto — quem é à vista. O modo e
     o que quer chegam no turno em que a cena a puser em jogo */
  camposDaGenteCurta: ["raca", "papel", "traco"],
  /* palavras que abrem um nome sem o distinguir: "Sargenta Barbaforte" não
     se cita por "sargenta" */
  titulos: ["sargento", "sargenta", "capitao", "capita", "mestre", "mestra", "irmao", "irma", "velho", "velha", "dona", "dom", "senhor", "senhora", "frei", "madre", "padre", "taverneiro", "taverneira", "lorde", "lady", "sir", "rei", "rainha", "o", "a", "os", "as"],
  /* o ofício dito na frase ("falo com o taverneiro") conta pela raiz — a
     palavra sem a vogal do gênero ("taverneir" acha o taverneiro e a
     taverneira, e NÃO a "taverna"). Na prova viva a raiz de seis letras
     ("tavern") abria a taverneira toda vez que a pauta dizia "taverna".
     Este é o tamanho mínimo da raiz. */
  raizDoOficio: 5,
};

/* ---------------- O TEXTO DO TURNO ---------------- */
const sem = (x) => String(x == null ? "" : x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const palavras = (x) => sem(x).replace(/[^a-z0-9]+/g, " ").trim();

/* As partes viram " palavra palavra " — sem acento, sem pontuação, com um
   espaço nas pontas, para a procura ser por palavra inteira. */
export function textoDoTurno(...partes) {
  return ` ${partes.flat().map(palavras).filter(Boolean).join(" ")} `;
}

/* O nome está no texto? Pelo nome inteiro (o que vem antes da vírgula, e o
   epíteto depois dela), ou pelo primeiro nome — que é como a narração
   chama as pessoas ("Nyla" é "Nyla Punho-de-Pedra"). Um primeiro nome que
   é título não conta. `{ primeiro: false }` só aceita o nome inteiro (as
   masmorras: "Fenda" não é a "Fenda de Raízes"). Errar para mais é barato
   (a linha entra); para menos é o que esta casa não aceita. */
export function citaNome(texto, nome, opcoes = null) {
  const t = typeof texto === "string" ? texto : "";
  const n = String(nome == null ? "" : nome).trim();
  if (!t.trim() || !n) return false;
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const partes = n.split(/,\s*/).map(palavras).filter(Boolean);
  const chaves = new Set();
  for (const p of partes) {
    chaves.add(p);
    const semArtigo = p.replace(/^(o|a|os|as) /, "");
    if (semArtigo.length >= 4) chaves.add(semArtigo);
  }
  if (o.primeiro !== false && partes[0]) {
    const prim = partes[0].split(" ")[0];
    if (prim.length >= 3 && !RELEVANCIA.titulos.includes(prim)) chaves.add(prim);
  }
  return [...chaves].some((k) => k.length >= 3 && t.includes(` ${k} `));
}

/* O retrato do turno, montado uma vez e lido por todos. `emJogo` são nomes
   (ou fichas com `nome`); `lugares`, a cidade, o prédio e aquilo de que ele
   faz parte; `carrega`, o que o herói leva consigo (o cânone de um artefato
   que está na mochila nunca sai). */
export function relevanciaDoTurno(entrada) {
  /* `= {}` não cobre null: a entrada nula é tratada à mão */
  const e = entrada && typeof entrada === "object" ? entrada : {};
  const nomes = (l) => (Array.isArray(l) ? l : []).map((x) => (x && typeof x === "object" ? x.nome : x)).filter((x) => typeof x === "string" && x.trim());
  return Object.freeze({
    texto: textoDoTurno(e.frase, e.nota, e.missoes, e.recentes, e.arco, nomes(e.fio)),
    frase: textoDoTurno(e.frase, e.nota),
    emJogo: Object.freeze(nomes(e.emJogo).map(palavras)),
    lugares: Object.freeze(nomes(e.lugares).map(palavras).map((l) => l.replace(/^(o|a|os|as) /, "")).filter((l) => l.length >= 3)),
    carrega: Object.freeze(nomes(e.carrega)),
  });
}

const ehRelevancia = (r) => !!(r && typeof r === "object" && typeof r.texto === "string");

/* ---------------- AS PESSOAS ---------------- */
/* Está em jogo: é do grupo, está aqui, a missão a pede, é do núcleo ou do
   fio (`emJogo`, pelo nome inteiro), ou o turno a cita. Sem relevância, toda
   a gente está — o comportamento de antes. */
export function pessoaEmJogo(nome, relevancia) {
  if (!ehRelevancia(relevancia)) return true;
  const n = palavras(nome);
  if (!n) return false;
  return relevancia.emJogo.includes(n) || citaNome(relevancia.texto, nome);
}

/* Das que NÃO estão em jogo, as que cabem no punhado dos citáveis, pela
   ordem em que vêm (a da importância). `linha(x)` é o texto que cada uma
   custaria. Devolve o Set das escolhidas. */
export function citaveis(lista, linha, teto = RELEVANCIA.citaveis) {
  const out = new Set();
  const t = teto && typeof teto === "object" ? teto : RELEVANCIA.citaveis;
  let gasto = 0;
  for (const x of Array.isArray(lista) ? lista : []) {
    if (out.size >= t.pessoas) break;
    const c = String(typeof linha === "function" ? linha(x) : "").length + 1;
    if (gasto + c > t.chars) continue;
    out.add(x);
    gasto += c;
  }
  return out;
}

/* ---------------- O CÂNONE ---------------- */
/* Uma verdade imutável fica quando o Narrador pode precisar dela neste
   turno, por uma de quatro portas — e qualquer uma basta:
     1. o turno a cita pelo nome (a frase, a pauta, as missões, as duas
        últimas narrações, o arco e o fio — o antagonista nunca sai);
     2. é do LUGAR: o local dela é a cidade ou o prédio onde o herói está,
        ou ela é o próprio lugar;
     3. é uma PESSOA em jogo (o grupo, quem está aqui, a missão, o núcleo);
     4. é o que o herói CARREGA.
   O resto do cânone continua no registo, intacto, e volta no turno em que
   uma destas portas abrir. Nas 8.ª–10.ª: das 41 citações do cânone nas
   narrações, as 2 que ficariam sem a entrada tinham o nome noutro bloco do
   mesmo pedido (a masmorra da região; o antagonista nos chefes), e as duas
   entram agora pelo fio. */
export function canoneEmJogo(nome, ficha, relevancia) {
  if (!ehRelevancia(relevancia)) return true;
  const f = ficha && typeof ficha === "object" ? ficha : {};
  if (citaNome(relevancia.texto, nome, { primeiro: false })) return true;
  const local = ` ${palavras(f.local)} `;
  const proprio = palavras(nome).replace(/^(o|a|os|as) /, "");
  if (relevancia.lugares.some((l) => local.includes(` ${l} `) || proprio === l)) return true;
  if (/pessoa/i.test(String(f.tipo || "")) && pessoaEmJogo(nome, relevancia)) return true;
  const carrega = textoDoTurno(relevancia.carrega);
  if (relevancia.carrega.length && citaNome(carrega, nome, { primeiro: false })) return true;
  return false;
}

/* ---------------- AS MASMORRAS DA REGIÃO ---------------- */
/* Quando a porta delas abre (a onda 2 decide se abre): as que o turno cita
   pelo nome, e as `RELEVANCIA.masmorrasPerto` mais perto pelas horas da
   ficha (`horas(m)`; sem ficha, na ordem do mundo). `fora` é quantas
   ficaram — o bloco diz "+N", senão o Narrador leria "são todas". */
export function masmorrasEmJogo(lista, relevancia, horas = null) {
  const todas = (Array.isArray(lista) ? lista : []).filter((m) => m && m.nome);
  if (!ehRelevancia(relevancia)) return { ficam: todas, fora: 0 };
  const h = (m) => { const v = typeof horas === "function" ? Number(horas(m)) : NaN; return Number.isFinite(v) ? v : Infinity; };
  const citadas = new Set(todas.filter((m) => citaNome(relevancia.texto, m.nome, { primeiro: false })));
  const perto = new Set(todas.filter((m) => !citadas.has(m)).map((m, i) => ({ m, i })).sort((a, b) => h(a.m) - h(b.m) || a.i - b.i).slice(0, RELEVANCIA.masmorrasPerto).map((x) => x.m));
  const ficam = todas.filter((m) => citadas.has(m) || perto.has(m));
  return { ficam, fora: todas.length - ficam.length };
}

/* ---------------- A GENTE DA CIDADE ---------------- */
/* Como dizer uma pessoa da base da cidade neste turno:
     · "inteira" — está em jogo: o turno a cita pelo nome, ela é do prédio
       onde o herói está (`lugares`), a frase ou a pauta dizem o ofício dela
       ("falo com o taverneiro") ou o nome do prédio dela;
     · "curta" — está pela cidade: nome, povo, ofício e traço
       (`RELEVANCIA.camposDaGenteCurta`). É gente que existe e que o
       Narrador pode chamar à cena — a lista continua a ser "são estas as
       pessoas da cidade" —, e no turno seguinte, citada, vem inteira.
   Quem as PESSOAS CONHECIDAS já dizem não passa por aqui: vai só com o que
   a linha do registo ainda não diz (`partesNaoDitas`). */
export function comoDizerAGente(p, relevancia) {
  if (!ehRelevancia(relevancia)) return "inteira";
  const x = p && typeof p === "object" ? p : {};
  if (citaNome(relevancia.texto, x.nome)) return "inteira";
  const local = palavras(x.local).replace(/^(o|a|os|as) /, "");
  if (local && relevancia.lugares.includes(local)) return "inteira";
  if (local && citaNome(relevancia.frase, x.local, { primeiro: false })) return "inteira";
  const raiz = palavras(String(x.papel || "").replace(/\(.*?\)/g, "")).split(" ")[0].replace(/(os|as|o|a)$/, "");
  if (raiz.length >= RELEVANCIA.raizDoOficio && relevancia.frase.includes(` ${raiz}`)) return "inteira";
  return "curta";
}

/* As partes de uma pessoa que a linha dela no registo ainda não diz, na
   ordem em que vieram — cada fato vai uma vez só no pedido. Sem linha,
   todas. */
export function partesNaoDitas(partes, linhaDoRegisto) {
  const l = palavras(linhaDoRegisto);
  const lista = (Array.isArray(partes) ? partes : []).filter((x) => typeof x === "string" && x.trim());
  if (!l) return lista;
  return lista.filter((x) => { const p = palavras(x); return !p || !` ${l} `.includes(` ${p} `); });
}

/* ---------------- A GENTE POR CONHECER ---------------- */
/* O elenco que o herói ainda não conheceu entra quando é DAQUI (a cidade
   dele é a do herói) ou quando o turno o cita — gente de outra cidade na
   lista do "por perto" era convite a trazê-la à cena sem viagem. E quem a
   GENTE DA CIDADE já diz (`jaNaCidade`, nomes) não se repete. */
export function genteParaPovoarAqui(lista, relevancia, cidade = "", jaNaCidade = []) {
  const todos = (Array.isArray(lista) ? lista : []).filter((p) => p && p.nome);
  const ja = new Set((Array.isArray(jaNaCidade) ? jaNaCidade : []).map(palavras));
  const fora = (p) => ja.has(palavras(p.nome));
  if (!ehRelevancia(relevancia)) return todos.filter((p) => !fora(p));
  const aqui = palavras(cidade);
  return todos.filter((p) => !fora(p) && ((aqui && palavras(p.cidade) === aqui) || citaNome(relevancia.texto, p.nome)));
}
