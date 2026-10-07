/* ============================================================
   A MASMORRA SEM A CIDADE (MM17, etapa C2) — lá dentro a cena é a sala

   A pessoa, a 06/10, sobre a região delimitada: ela resolve "o prompt da
   masmorra que traz os locais da cidade". A medida (`medir-regiao.mjs`,
   secção h) diz quanto: com o herói numa câmara da Nave de Ferro, cada
   turno ainda levava ao Narrador a CIDADE de onde ele saiu —

     · o `resumoDaqui` (os locais, a gente, os segredos e os rumores da
       base: mediana 4.340 car. na região, 2.531 no continente);
     · os arredores (os sítios fora dos muros, ~790), o ermo da cidade
       (~580), a forma do mundo (507, como se viaja e como se chama um
       povoado) e a gente por conhecer da cidade (~390, no system);
     · e, no system, as REGRAS do mercado e da economia (2.768 car.),
       porque `temMercado` era "há cidade" e a cidade não sai do registo
       quando se desce uma escada.

   Nada disso é a sala, e quase tudo convida o Narrador a trazer a praça
   para dentro da cripta (o ferreiro que aparece no corredor, o preço do
   pão no meio de uma luta). A v9.352 (MM16 nº 4) já calara o lugar de
   antes da porta, a estrada e as bancas; esta etapa cala o resto, POR
   TABELA, e só lá dentro: fora da masmorra o turno sai byte a byte o de
   antes (a suíte prova com hashes em N mundos).

   O que ENTRA no lugar, e só numa campanha com região (`mapa.regiao`):
     · uma linha da FICHA do lugar onde o herói está — o tipo, o perigo,
       quem anda por lá e a quantas horas fica da base —, na secção
       MASMORRA da pauta, fora da luta (na luta a secção é uma linha só, a
       do tabuleiro). Nada de novo: tudo se lê de `mapa.regiao.lugares`.
     · o HORIZONTE (os reinos e cidades de além, só nome e boato) como UMA
       linha, e só no turno em que o jogador PERGUNTA por terras fora da
       região — nunca por turno, nunca na masmorra, nunca na luta. Vai pela
       porta das perguntas que a casa já usa (as fichas da mesa e o
       oráculo: `A_FICHA_DECIDE`), para o d100 não rolar o que o mapa sabe.

   O QUE ESTE MÓDULO NÃO FAZ: não monta o prompt (isso é do App e de
   `prompt.js`) nem decide se se está numa masmorra — quem diz é a
   masmorra aberta que o App passa. Ele diz o que cala lá dentro, e por quê.
   ============================================================ */

import { masmorraAberta } from "./cena.js";

const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const semArtigo = (s) => norm(s).replace(/^(o|a|os|as)\s+/, "");
const decimal = (n) => String(n).replace(".", ",");
const obj = (o) => (o && typeof o === "object" ? o : {});

/* ---------------- O QUE CALA LÁ DENTRO ----------------
   Cada bloco por turno que o App monta e que é da cidade, da estrada ou do
   mundo — não da sala. `cala: true` = mudo com a masmorra aberta; `false`
   = fica, e o porquê diz por que fica. A ORDEM das chaves do "aqui" é a
   ordem em que o rodapé as lê (`aquiDoTurno`). */
export const DENTRO_DA_MASMORRA = {
  /* o "aqui" do rodapé, na ordem de leitura */
  forma: { cala: true, porque: "a forma do mundo diz como se viaja e como se chama um povoado; lá dentro não se viaja nem há povoado, e o vocabulário do mundo já vai no léxico do system" },
  ondeEstou: { cala: true, porque: "(v9.352) o lugar de antes da porta — o posto, a fogueira — não é onde a cena está" },
  comodos: { cala: true, porque: "os cômodos são de um prédio da cidade; a planta da masmorra vai na secção MASMORRA" },
  daqui: { cala: true, porque: "os locais, a gente, os segredos e os rumores da cidade (o resumoDaqui) — nenhum deles está na sala" },
  formaDaCidade: { cala: true, porque: "muralha, portão e cais são da cidade" },
  viagem: { cala: true, porque: "(v9.352) a estrada espera à porta" },
  ermo: { cala: true, porque: "o trecho de ermo é o lado de fora; lá dentro o chão é o da planta" },
  arredores: { cala: true, porque: "os sítios fora dos muros da cidade — a meia hora dela, não desta câmara" },
  saidas: { cala: true, porque: "os povoados a uma travessia são saídas da cidade; da masmorra só se sai pela boca" },
  /* fora do "aqui" */
  mercado: { cala: true, porque: "(v9.352) na masmorra não há banca aberta" },
  povoar: { cala: true, porque: "a gente por conhecer é a da cidade, e lá dentro ninguém dela aparece" },
  acordo: { cala: true, porque: "o [ONDE ACORDO] da jornada mandava acordar na estrada; quem dorme na masmorra acorda nela" },
  chefes: { cala: false, porque: "os chefes do mundo podem estar no fundo — é a história que os põe lá, e sem a lista o Narrador inventaria outro" },
};

/* As chaves do "aqui" (as nove primeiras da tabela), na ordem de leitura. */
const DO_AQUI = ["forma", "ondeEstou", "comodos", "daqui", "formaDaCidade", "viagem", "ermo", "arredores", "saidas"];

/* As portas do system que lá dentro fecham (`portasAbertas`, prompt.js):
   o mercado e a economia (2.768 car. de regras de compra e venda sem
   ninguém a vender), o assentamento, a estrada e o prédio. O ermo fecha
   pela própria porta (`emMasmorra`), senão "não há cidade" o abriria. */
export const PORTAS_NA_MASMORRA = { temMercado: false, emCidade: false, emViagem: false, dentroDeUmLocal: false };

/* `id` cala com esta masmorra aberta? Lixo (id que a tabela não conhece,
   masmorra nula ou encerrada) nunca cala. */
export function calaNaMasmorra(id, masmorra) {
  if (!masmorraAberta(masmorra)) return false;
  const e = Object.prototype.hasOwnProperty.call(DENTRO_DA_MASMORRA, id) ? DENTRO_DA_MASMORRA[id] : null;
  return !!(e && e.cala === true);
}

/* O "aqui" do rodapé: os blocos na ordem de leitura, sem os que calam lá
   dentro, separados por linha em branco. Fora da masmorra é exatamente o
   `[forma, ondeEstou, …, saidas].filter(Boolean).join("\n\n")` de antes. */
export function aquiDoTurno(blocos, masmorra) {
  const b = obj(blocos);
  return DO_AQUI
    .filter((id) => !calaNaMasmorra(id, masmorra))
    .map((id) => (typeof b[id] === "string" ? b[id] : ""))
    .filter(Boolean)
    .join("\n\n");
}

/* A cena do system com as portas da masmorra: com `emMasmorra`, as de
   `PORTAS_NA_MASMORRA` fecham; sem ela, devolve A MESMA cena (o mesmo
   objeto — é assim que se prova que fora nada muda). Nunca muta. */
export function cenaNaMasmorra(cena) {
  if (!cena || typeof cena !== "object" || cena.emMasmorra !== true) return cena;
  return { ...cena, ...PORTAS_NA_MASMORRA };
}

/* ---------------- A FICHA DO LUGAR ----------------
   O lugar da região cujo nome é o da masmorra aberta (a mesma régua do
   App ao entrar: o nome, sem caixa nem acento nem artigo). Sem região,
   sem ficha, ou com uma masmorra que a IA batizou, nada. */
function lugarDaRegiao(mapa, masmorra) {
  const nome = masmorraAberta(masmorra);
  const lugares = obj(obj(mapa).regiao).lugares;
  if (!nome || !Array.isArray(lugares)) return null;
  const alvo = semArtigo(nome);
  return lugares.find((l) => l && l.ficha && typeof l.ficha === "object" && semArtigo(l.nome) === alvo) || null;
}

/* Como a linha da ficha diz as horas: no passo de meia hora ("a 4 h", "a
   1,5 h"). A ficha guarda duas casas ("3,97") porque é dela que a viagem
   cobra; ao Narrador basta o que um guia diria, e centésimos de hora na
   boca de quem conhece o caminho são falsa precisão. */
export const FICHA_NA_MASMORRA = { passoDasHoras: 0.5 };

/* A linha da secção MASMORRA: o que se sabe DE FORA do lugar onde o herói
   está. Na luta não entra (a secção é uma linha só, a do tabuleiro). */
export function linhaDaFicha(mapa, masmorra, opcoes) {
  if (opcoes && typeof opcoes === "object" && opcoes.luta === true) return "";
  const l = lugarDaRegiao(mapa, masmorra);
  if (!l) return "";
  const f = l.ficha;
  const quem = (Array.isArray(f.quem) ? f.quem : []).filter((q) => q && q.nome)
    .map((q) => (Number.isFinite(Number(q.nivel)) ? `${q.nome} (nv ${q.nivel})` : String(q.nome))).join(", ");
  const base = String(obj(obj(obj(mapa).regiao).base).nome || "").trim();
  const perigo = f.perigoRotulo || (f.perigo ? `perigo ${f.perigo}` : "");
  const passo = FICHA_NA_MASMORRA.passoDasHoras;
  const horas = Number.isFinite(f.horas) ? Math.max(passo, Math.round(f.horas / passo) * passo) : NaN;
  const ida = Number.isFinite(horas) && base ? `; fica a ${decimal(horas)} h de marcha${f.rumo ? ` ${f.rumo}` : ""} de ${base}` : "";
  return `a ficha do lugar: ${l.nome}${l.tipo || perigo ? ` (${[l.tipo, perigo].filter(Boolean).join(", ")})` : ""}${quem ? ` — de fora, sabe-se que por lá andam ${quem}` : ""}${ida}`;
}

/* ---------------- O HORIZONTE, SÓ QUANDO PERGUNTADO ----------------
   `pede`: a frase é pergunta (o "?" ou um verbo de perguntar).
   `alem`: a frase pergunta por terras fora da região (sem acento, em
     minúsculas). "Além de" é quase sempre "também" ("além do guarda, quem
     mais está aqui?"), e aqui um falso positivo custa caro: põe na mesa
     uma linha que ninguém pediu E cala o oráculo (`A_FICHA_DECIDE`). Por
     isso "além d…", "para lá d…" e "do outro lado d…" só contam diante de
     um nome de CHÃO OU DE FRONTEIRA — "além das montanhas", "do outro lado
     do rio", "para lá da fronteira". E "outras cidades" não conta: numa
     região de três povoados, é pergunta pelos de dentro.
   `nomeMinimo`: um nome do horizonte mais curto que isto casaria com
     pedaço de qualquer palavra (e o nome só casa como palavra inteira).
   `maximo`: quantas terras a linha diz (as nomeadas primeiro) — três com
     o boato é uma linha de ~290 car. (máx 336 em 200 mundos); seis
     seriam um parágrafo.
   `rotulos`: o tipo de cada entrada, como a linha o diz. */
export const HORIZONTE_NA_PERGUNTA = {
  pede: /\?|\b(pergunto|quero saber|sabe(s|m)? (se|de|onde|algo)|conhece(s|m)?|ja ouviu|ouviste|o que se diz)\b/,
  alem: /\b(alem|para la|do outro lado) d(o|a|os|as|esta|este|estas|estes|essa|esse|essas|esses) (montanhas?|serras?|montes?|morros?|colinas?|cordilheiras?|picos?|rios?|mar|mares|oceano|fronteiras?|horizonte|desertos?|pantanos?|florestas?|matas?|bosques?|vales?|planicies?|estepes?|regiao|terras?|reinos?|limites?)\b|\bfora d(a|esta|essa) (regiao|terra|comarca)\b|\boutr(o|a)s? (reinos?|terras?|regioes?|paises?|povos?)\b|\bresto do (mundo|continente|reino)\b|\bmundo la fora\b|\bterras? distantes?\b|\bde onde vem (o|a|os|as) (caravanas?|mercadores?|sal|soldados?|cobradores?)\b/,
  nomeMinimo: 4,
  maximo: 3,
  rotulos: { terra: "terra", regiao: "região", cidade: "cidade" },
};

/* Onde o nome aparece na frase como palavra inteira ("casa rasa" não casa
   dentro de "casarasante"), ou -1. Os dois já vêm sem acento nem caixa. */
function emPalavra(t, nome, minimo) {
  if (!nome || nome.length < minimo) return -1;
  for (let i = t.indexOf(nome); i >= 0; i = t.indexOf(nome, i + 1)) {
    const antes = i === 0 ? "" : t[i - 1];
    const depois = t[i + nome.length] || "";
    if (!/[a-z0-9]/.test(antes) && !/[a-z0-9]/.test(depois)) return i;
  }
  return -1;
}

/* A resposta do horizonte para ESTA frase, na forma das fichas da mesa
   (`{ pergunta: [linha], em: [posição] }`, a que `juntarRespostas` e o
   oráculo leem), ou `null`. `ctx`: `{ masmorra, luta }` — lá dentro e na
   luta, nada. Sem região, nada. */
export function horizonteDaPergunta(frase, mapa, ctx) {
  const c = obj(ctx);
  if (masmorraAberta(c.masmorra) || c.luta === true) return null;
  const hz = obj(obj(mapa).regiao).horizonte;
  if (!Array.isArray(hz) || !hz.length || typeof frase !== "string") return null;
  const t = norm(frase);
  const H = HORIZONTE_NA_PERGUNTA;
  if (!t || !H.pede.test(t)) return null;
  const validos = hz.filter((h) => h && typeof h.nome === "string" && h.nome.trim());
  if (!validos.length) return null;
  const nomeados = validos
    .map((h) => ({ h, em: emPalavra(t, semArtigo(h.nome), H.nomeMinimo) }))
    .filter((x) => x.em >= 0)
    .sort((a, b) => a.em - b.em);
  const m = H.alem.exec(t);
  if (!nomeados.length && !m) return null;
  const ordem = [...nomeados.map((x) => x.h), ...(m ? validos.filter((h) => !nomeados.some((x) => x.h === h)) : [])].slice(0, H.maximo);
  const item = (h) => `${h.nome} (${H.rotulos[h.tipo] || "terra"})${h.boato ? ` — ${h.boato}` : ""}`;
  const linha = `além da região (só nome e boato; o mapa não tem estrada daqui para lá): ${ordem.map(item).join(" · ")}`;
  return { pergunta: [linha], em: [nomeados.length ? nomeados[0].em : m.index] };
}
