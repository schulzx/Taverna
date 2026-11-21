/* ============================================================
   A MÃO DA FRASE (15/11/2026, S2 — prosa = bolsa)

   A sessão de 15/11 mostrou o pior defeito que um jogo de mesa pode ter: a
   narração e a bolsa a contar duas histórias.
     · T7 — «Apanho o Anel de Ouro da tábua e guardo-o.» O Narrador: «seus
       dedos fecham sobre o Anel de Ouro». O sistema não o recolheu: no pedido
       seguinte, «[NO CHÃO] … ✦ Anel de Ouro», e a bolsa igual.
     · T9 — «Levo o Anel de Ouro ao Martelo Torto e vendo-o.» O Narrador: «as
       moedas caem na sua palma». A bolsa: 25, igual. O jogador acha que
       vendeu um anel que nunca apanhou.

   O que a mão faz com as coisas é do sistema, e a frase só o diz:
     1. PEGAR — o verbo de apanhar e o nome de uma coisa que está no chão, ali
        perto, viram O MESMO recolhimento do botão «Examinar» (chao.js,
        tirarDoChao + envelopeDoRecolhimento: «JÁ APLICADO PELO SISTEMA»).
        «tudo» apanha o que há; o pronome sozinho, com uma coisa só no chão,
        apanha essa.
     2. VENDER e DAR o que não se tem — recusados ANTES do Narrador, como a
        compra sem dinheiro já é («◉ Não chega…»). A frase que vende ou dá
        uma coisa que não está na bolsa não parte: o jogador lê porquê.
     3. O VETO — com coisa no chão perto e nada recolhido, o NÃO PODE leva
        «nada passa à mão do herói nesta resposta» (oVetoDaMao), e o Narrador
        não pode pôr na mão o que ficou no chão.

   PURO E DETERMINÍSTICO, sem React. Aceita acento e sem acento, PT-BR e
   PT-PT («pego» e «apanho», «guardo-o» e «guardo ele»). `null` e lixo dão
   «nada a fazer», nunca exceção. Provado em testes/teste-a-mao-da-frase.mjs
   (o corpus de 30+ frases); ligado no App (proporAFrase) e no pedido do
   turno (o veto).
   ============================================================ */

/* 21/11 (a oitava sessão do Mestre vivo): «dou duas moedas ao vendedor
   pelos sais» é compra — a mão dá a moeda, não os sais; e o nome que o
   jogador encurta («o martelo de batalha» do «Rústico Martelo de Batalha») */
import { aCompraPorMoeda, nomeiaOItem } from "../o-veredito-da-troca.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const txt = (x) => (typeof x === "string" ? x : "");
/* sem acento, minúsculas, o hífen do clítico vira espaço («vendo-o» → «vendo o») */
const norma = (s) => txt(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const tem = (frase, termo) => !!termo && (` ${frase} `).includes(` ${termo} `);

/* ---------------- A TABELA ----------------
   `pegar`: os verbos de apanhar, já sem acento (1.ª pessoa do singular e do
   plural, o infinitivo depois de «quero/vou»). `vender`, `dar`: os de passar
   a coisa a outro. `naoEVenda`: «vendo» também é o gerúndio de «ver» — com
   estes à frente («estou vendo», «fico vendo») ou «que/se/como» atrás
   («vendo que ninguém olha»), não é venda. `objeto`: as palavras que
   abrem o complemento do verbo (artigo, possessivo, demonstrativo, o
   pronome do clítico). `tudo`: apanhar o que houver. `pronome`: a coisa sem
   nome, que só se resolve com uma coisa só no chão. `coisas`: os nomes de
   objeto que uma frase de dar pode trazer — só com um destes (ou com o nome
   de uma coisa do chão) o «dou» é de objeto, e não «dou um passo».
   `suprimentos`: o que vive no alforje e não na bolsa (rações, água,
   tochas, flechas) — a venda deles é de outra porta, e nunca se recusa aqui.
   `palavraMinima`: o pedaço de nome mais curto que identifica uma coisa. */
export const A_MAO_DA_FRASE = Object.freeze({
  pegar: Object.freeze(["pego", "pegamos", "pegar", "apanho", "apanhamos", "apanhar", "guardo", "guardamos", "guardar",
    "recolho", "recolhemos", "recolher", "cato", "catamos", "catar", "levo", "levamos", "levar", "agarro", "agarrar",
    "embolso", "embolsar", "junto", "juntar", "recupero", "recuperar", "tomo", "tomar", "arrecado", "arrecadar"]),
  vender: Object.freeze(["vendo", "vendemos", "vender", "vendi", "vendo lhe", "negocio", "negociar"]),
  dar: Object.freeze(["dou", "damos", "dar", "entrego", "entregamos", "entregar", "ofereco", "oferecemos", "oferecer",
    "presenteio", "presentear", "passo", "passar", "empresto", "emprestar", "troco", "trocar"]),
  naoEVenda: Object.freeze({
    antes: Object.freeze(["estou", "estava", "esta", "estamos", "estao", "fico", "ficamos", "ando", "continuo", "sigo", "vou", "vamos"]),
    depois: Object.freeze(["que", "se", "como", "quem", "onde", "isso", "aquilo", "tudo"]),
  }),
  objeto: Object.freeze(["o", "a", "os", "as", "um", "uma", "uns", "umas", "meu", "minha", "meus", "minhas", "este", "esta",
    "esse", "essa", "aquele", "aquela", "isto", "isso", "aquilo", "lo", "la", "los", "las", "lhe", "ele", "ela", "tudo"]),
  tudo: Object.freeze(["tudo", "todas as coisas", "o que esta no chao", "o que ha no chao", "o que caiu"]),
  pronome: Object.freeze(["o", "a", "lo", "la", "ele", "ela", "isso", "isto", "aquilo"]),
  coisas: Object.freeze(["anel", "aneis", "colar", "amuleto", "talisma", "joia", "joias", "gema", "gemas", "pedra", "espada",
    "adaga", "faca", "punhal", "machado", "maca", "lanca", "arco", "besta", "escudo", "elmo", "armadura", "cota", "botas",
    "luvas", "manto", "capa", "pocao", "pocoes", "frasco", "elixir", "chave", "livro", "mapa", "carta", "pergaminho",
    "grimorio", "cajado", "varinha", "bastao", "coroa", "calice", "relicario", "idolo", "estatueta", "pele", "peles",
    "dente", "presa", "garra", "osso", "gazua", "sais", "antidoto", "erva", "ervas", "bracelete", "pulseira", "broche"]),
  /* o artigo da coisa na linha da recusa: as femininas (o resto é «o»), e
     o plural pelo «s» final */
  femininas: Object.freeze(["joia", "joias", "gema", "gemas", "pedra", "espada", "adaga", "faca", "maca", "lanca", "besta",
    "armadura", "cota", "botas", "luvas", "capa", "pocao", "pocoes", "chave", "carta", "varinha", "coroa", "estatueta",
    "pele", "peles", "presa", "garra", "gazua", "erva", "ervas", "pulseira"]),
  /* a grafia da tela (a leitura é sem acento; a linha que o jogador lê, não) */
  comAcento: Object.freeze({ aneis: "anéis", talisma: "talismã", maca: "maça", lanca: "lança", pocao: "poção", pocoes: "poções",
    grimorio: "grimório", bastao: "bastão", calice: "cálice", relicario: "relicário", idolo: "ídolo", antidoto: "antídoto" }),
  suprimentos: Object.freeze(["racao", "racoes", "agua", "aguas", "tocha", "tochas", "flecha", "flechas", "virote", "virotes",
    "kit", "corda", "comida", "mantimentos", "suprimentos"]),
  palavraMinima: 4,
  recusa: Object.freeze({
    vender: "🎒 {item} não está na sua bolsa — não há o que vender.",
    dar: "🎒 {item} não está com você — não há o que entregar.",
    noChao: " Está no chão, ali perto: dá para apanhar primeiro.",
    semNome: "isso",
  }),
  veto: "nada passa à mão do herói nesta resposta: o que está no chão ({itens}) continua no chão até ele o apanhar, e nada novo entra na bolsa pela narração",
  tetoDoVeto: 3,
});

const M = A_MAO_DA_FRASE;
const palavrasDe = (nome) => norma(nome).split(" ").filter((w) => w.length >= M.palavraMinima);
/* o nome «curto» de uma coisa: sem o aposto entre parênteses e sem o «+1» */
const curto = (nome) => txt(nome).replace(/\s*\(.*\)\s*$/, "").replace(/\s*\+\d+\s*$/, "").trim();

const comArtigo = (w) => `${M.femininas.includes(w) ? "a" : "o"}${/s$/.test(w) && w !== "sais" ? "s" : ""} ${M.comAcento[w] || w}`;

/* a coisa como a frase a disse — «o Anel de Ouro», com a caixa e o acento
   do jogador: a cabeça e o «de X» que a segue. As palavras da frase original
   alinham com as normalizadas (a mesma partição). "" se não alinham. */
const LIGA = ["de", "do", "da", "dos", "das"];
function nomeNaFrase(frase, palavras, cabeca) {
  const orig = txt(frase).replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim().split(" ");
  if (orig.length !== palavras.length) return "";
  const i = palavras.indexOf(cabeca);
  if (i < 0) return "";
  let fim = i + 1;
  if (LIGA.includes(palavras[fim]) && palavras[fim + 1] && palavras[fim + 1].length >= M.palavraMinima - 1) fim += 2;
  const art = M.objeto.slice(0, 4).includes(palavras[i - 1]) ? orig[i - 1].toLowerCase() + " " : comArtigo(cabeca).split(" ")[0] + " ";
  return art + orig.slice(i, fim).join(" ");
}

/* onde está o verbo (o primeiro de uma lista) na frase normalizada: o índice
   da palavra, ou -1 */
function indiceDoVerbo(palavras, verbos) {
  for (let i = 0; i < palavras.length; i++) {
    for (const v of verbos) {
      const vs = v.split(" ");
      if (vs.every((w, k) => palavras[i + k] === w)) return i;
    }
  }
  return -1;
}

/* a coisa nomeada, entre uma lista de nomes: o nome inteiro primeiro; depois
   a palavra-cabeça (a primeira com corpo), se só uma coisa a tem */
function coisasNomeadas(frase, nomes) {
  const inteiras = nomes.filter((n) => { const k = norma(curto(n)); return k.length >= M.palavraMinima - 1 && tem(frase, k); });
  if (inteiras.length) return inteiras;
  /* 21/11: o fim do nome com corpo («martelo de batalha»), como o jogador o diz */
  const pelaCauda = nomes.filter((n) => nomeiaOItem(frase, n));
  if (pelaCauda.length) return pelaCauda;
  const porCabeca = nomes.filter((n) => { const c = palavrasDe(curto(n))[0]; return c && tem(frase, c); });
  return porCabeca;
}

/* ---------------- A LEITURA ----------------
   aMaoDaFrase(frase, { chao, bolsa })
     chao  — as coisas caídas ali perto: [{ id, nome }] (pertoDaqui, chao.js)
     bolsa — os nomes do que o herói tem: [nome] (inventário, equipamento,
             o que traz vestido)
   → { pegar: [id], recusa: null | { verbo, item, linha } }
   `pegar`: os ids a recolher pelo caminho do botão. `recusa`: a frase vende
   ou dá o que não tem — a linha vai à tela, e o turno não parte. */
export function aMaoDaFrase(frase, contexto) {
  const nada = { pegar: [], recusa: null };
  try {
    const f = norma(frase);
    if (!f) return nada;
    const c = obj(contexto) || {};
    const chao = arr(c.chao).map(obj).filter((x) => x && txt(x.nome) && (typeof x.id === "string" || typeof x.id === "number"));
    const bolsa = arr(c.bolsa).map((x) => (typeof x === "string" ? x : obj(x) ? txt(x.nome) : "")).filter(Boolean);
    const palavras = f.split(" ");
    const out = { pegar: [], recusa: null };

    /* 1 · PEGAR */
    const iP = indiceDoVerbo(palavras, M.pegar);
    if (iP >= 0 && chao.length) {
      const resto = palavras.slice(iP + 1).join(" ");
      const nomeadas = coisasNomeadas(resto, chao.map((x) => x.nome));
      if (M.tudo.some((t) => tem(resto, t))) out.pegar = chao.map((x) => x.id);
      else if (nomeadas.length) out.pegar = chao.filter((x) => nomeadas.includes(x.nome)).map((x) => x.id);
      else if (chao.length === 1 && M.pronome.includes(palavras[iP + 1])) out.pegar = [chao[0].id];
    }
    const pegos = new Set(chao.filter((x) => out.pegar.includes(x.id)).map((x) => x.nome));
    const naMao = [...bolsa, ...pegos];

    /* 2 · VENDER ou DAR o que não se tem */
    const recusar = (verbo, item, noChao) => ({
      verbo, item,
      linha: M.recusa[verbo].replace("{item}", item.charAt(0).toUpperCase() + item.slice(1)) + (noChao ? M.recusa.noChao : ""),
    });
    /* 21/11 (a oitava sessão): a moeda dada pela coisa é compra — não há o que recusar aqui */
    if (aCompraPorMoeda(frase)) return out;
    const iV = indiceDoVerbo(palavras, M.vender);
    const ehVenda = iV >= 0
      && !M.naoEVenda.antes.includes(palavras[iV - 1])
      && !M.naoEVenda.depois.includes(palavras[iV + 1])
      && M.objeto.includes(palavras[iV + 1]);
    const iD = ehVenda ? -1 : indiceDoVerbo(palavras, M.dar);
    const i = ehVenda ? iV : iD;
    if (i >= 0) {
      const verbo = ehVenda ? "vender" : "dar";
      const resto = palavras.slice(i + 1).join(" ");
      /* tudo o que a frase diz antes do verbo também conta («Levo o anel ao
         Martelo Torto e vendo-o»: o anel vem antes do «vendo») */
      const toda = f;
      const temNaMao = coisasNomeadas(toda, naMao).length > 0;
      const deSuprimento = M.suprimentos.some((s) => tem(toda, s));
      if (!temNaMao && !deSuprimento) {
        const doChao = coisasNomeadas(toda, chao.map((x) => x.nome)).filter((n) => !pegos.has(n));
        const cabeca = M.coisas.find((w) => tem(resto, w)) || M.coisas.find((w) => tem(toda, w));
        /* 21/11 (a oitava sessão, a frase sem turno): «vendo o martelo de batalha ao Eamon» — o «o» seguido de nome é artigo, não pronome */
        const pronomeSo = M.pronome.includes(palavras[i + 1]) && (palavras[i + 2] == null || ["a", "ao", "aos", "as", "para", "pra", "por", "e"].includes(palavras[i + 2]));
        if (doChao.length) out.recusa = recusar(verbo, curto(doChao[0]), true);
        else if (cabeca) out.recusa = recusar(verbo, nomeNaFrase(frase, palavras, cabeca) || comArtigo(cabeca), false);
        else if (ehVenda && pronomeSo) out.recusa = recusar(verbo, M.recusa.semNome, false);
      }
    }
    return out;
  } catch { return nada; }
}

/* ---------------- O VETO ----------------
   oVetoDaMao(chaoPerto) → a linha do NÃO PODE, ou "" (nada no chão perto).
   `chaoPerto`: as coisas ainda caídas ali perto DEPOIS do recolhimento do
   turno — o que ficou no chão não passou à mão. */
export function oVetoDaMao(chaoPerto) {
  try {
    const nomes = arr(chaoPerto).map(obj).filter(Boolean).map((x) => curto(x.nome)).filter(Boolean);
    if (!nomes.length) return "";
    const lista = nomes.slice(0, M.tetoDoVeto).join(", ") + (nomes.length > M.tetoDoVeto ? "…" : "");
    return M.veto.replace("{itens}", lista);
  } catch { return ""; }
}
