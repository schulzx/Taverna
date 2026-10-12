/* ============================================================
   A COBRANÇA (v9.70) — o que a narração prometeu, o sistema entrega

   "Se a IA disse 'você acha 100 moedas e uma poção de vida', então o
   mestre credita ao player 100 moedas e uma poção de vida."

   O problema é antigo e silencioso. O Mestre de IA tem um canal para
   declarar o que mudou — `mudancas`, com `moedas` e `adicionar_itens` —
   e o sistema o aplica direitinho. Mas ele é um narrador: às vezes
   escreve a cena inteira, com o brilho das moedas na palma da mão, e
   esquece de preencher o campo. Aí o jogador LÊ que ganhou cem moedas,
   olha a bolsa e continua com as mesmas de antes.

   Não é um bug de código: é a distância entre a ficção e a ficha, e ela
   sempre aparece do lado que ninguém confere. O jogador não sabe se
   deve confiar no texto ou no número, e essa dúvida come o jogo por
   dentro — a partir dela, todo prêmio precisa ser verificado à mão.

   ESTE ARQUIVO LÊ A NARRATIVA e devolve o que ela AFIRMA que o herói
   ganhou. Quem compara com o que o Mestre declarou, e credita a
   diferença, é o App.

   ------------------------------------------------------------
   AS TRÊS TRAVAS, e elas importam mais que a detecção:

   1. SÓ O QUE ACONTECEU COM O HERÓI. "no bolso dele havia cem moedas"
      não é ganho: é descrição. Precisa de verbo de aquisição com o
      herói como sujeito — acha, pega, embolsa, recolhe, ganha, recebe.

   2. NEGAÇÃO MATA A FRASE. "você não encontra nada de valor" tem
      "encontra" e um número pode estar por perto. Uma negação em
      qualquer ponto da frase descarta a frase inteira: o lado seguro de
      errar aqui é não creditar.

   3. TETO POR TURNO. Uma narração que promete dez mil moedas ou é
      delírio ou é um tesouro que deveria ter vindo por `mudancas`, com
      o Mestre sabendo o que fazia. O sistema credita até o teto e
      registra que aparou — creditar o absurdo em silêncio seria trocar
      um buraco por outro maior.
   ============================================================ */

import { CONSUMIVEIS } from "./pocoes.js";
import { moedasDoAchadoNoEnvelope } from "./encontros.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* O herói ganhou alguma coisa NESTA frase? O sujeito tem de ser ele. */
const RX_GANHO = /\b(voc[eê]|eu)\s+(\w+\s+){0,3}(acha|achou|encontra|encontrou|pega|pegou|embolsa|embolsou|recolhe|recolheu|guarda|guardou|leva|levou|ganha|ganhou|recebe|recebeu|surrupia|surrupiou|arranca|arrancou|toma|tomou|fica com|saca do bolso)\b|\b(acha|encontra|pega|embolsa|recolhe|leva|ganha|recebe)\s+(voc[eê])\b/;

/* Qualquer negação na frase e ela inteira é descartada. */
const RX_NEGA = /\b(n[aã]o|nada|nenhum|nenhuma|vazio|vazia|sem nada|nem uma|nem um|deixa|deixou|larga|largou|devolve|devolveu|recusa|recusou|perde|perdeu)\b/;

/* Moedas: o número vem antes da palavra, como se escreve em português. */
const RX_MOEDAS = /(\d{1,5})\s*(?:pe[cç]as?\s+de\s+)?(moedas?|pratas?|ouros?|de\s+ouro|de\s+prata)\b/g;

/* Teto por turno. Acima disto o sistema apara e diz que aparou. */
export const TETO_DE_MOEDAS = 2000;

/* Frases, e não o texto inteiro: a trava da negação só vale se o escopo
   dela for pequeno. Num texto inteiro, um "não" em qualquer canto
   apagaria um achado legítimo três parágrafos adiante. */
export function frasesDe(texto) {
  return String(texto || "")
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((f) => f.trim())
    .filter((f) => f.length > 3);
}

/* Os consumíveis que a frase nomeia, pelo nome do catálogo. Só o
   catálogo: um "anel élfico" inventado pela narração não vira item,
   porque o sistema não sabe o que ele faz e um item sem regra na bolsa
   é uma promessa que ninguém vai cumprir. */
const familiaDe = (c) => norm(c.nome).replace(/ (pequena|media|grande)$/, "");

export function consumiveisNaFrase(frase) {
  const f = norm(frase);
  /* DUAS PASSADAS, e a ordem importa. Numa passada só, "Poção de Cura
     Média" creditava DUAS poções: a Média pelo nome cheio e a Pequena
     pelo palpite, porque a Pequena vem antes no catálogo e naquele
     momento nenhum nome cheio tinha casado ainda. O jogador ganhava um
     item a mais por escrever o nome certo. */
  const exatos = CONSUMIVEIS.filter((c) => f.includes(norm(c.nome)));
  const jaTem = new Set(exatos.map(familiaDe));
  const vagos = [];
  for (const c of CONSUMIVEIS) {
    const fam = familiaDe(c);
    if (fam === norm(c.nome)) continue;                 // este não tem tamanho no nome
    if (jaTem.has(fam) || !f.includes(fam)) continue;    // já entrou, ou nem foi citado
    /* "poção de cura" sem o tamanho: entra a MENOR, que é o palpite
       conservador — creditar a Grande por uma frase vaga seria o sistema
       sendo generoso com o que não sabe. */
    if (!/pequena$/.test(norm(c.nome))) continue;
    jaTem.add(fam);
    vagos.push(c);
  }
  return [...exatos, ...vagos];
}

/* ============================================================
   O QUE O HERÓI PAGOU (30/09, da prova jogada de MM13)

   A outra metade, que faltava desde a v9.70. O pão, a pedra de amolar
   e o quarto foram narrados como pagos — "você deixa três moedas no
   balcão" — e a bolsa ficou nas 183: o Narrador não declarou o gasto em
   `mudancas.moedas`, e o sistema, que lia a narração atrás do que o
   herói GANHOU, nunca a leu atrás do que ele DEU. A ficha só obedecia à
   ficção num sentido, e o sentido era o que enche a bolsa.

   Pior: a frase do gasto podia virar ganho. "Você recebe o pão e paga
   3 moedas" tinha verbo de aquisição com o herói de sujeito e um
   número de moedas — e a cobrança creditava as três. Agora o trecho do
   pagamento sai da frase antes de se contarem os ganhos.

   As travas são as do ganho, espelhadas: o herói é quem paga (sujeito
   antes do verbo, ou o verbo na primeira pessoa); o verbo é de dar
   dinheiro e está PERTO da quantia; negação, hipótese e troco matam a
   frase — o lado seguro aqui é não debitar.
   ============================================================ */

/* A quantia por extenso: o Narrador escreve "três moedas" tanto quanto
   "3 moedas", e preço de pão escreve-se quase sempre por extenso. */
export const NUMERO_POR_EXTENSO = {
  um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9,
  dez: 10, onze: 11, doze: 12, treze: 13, quatorze: 14, catorze: 14, quinze: 15, dezesseis: 16,
  dezessete: 17, dezoito: 18, dezenove: 19, vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50,
  sessenta: 60, setenta: 70, oitenta: 80, noventa: 90, cem: 100, cento: 100,
};
const EXTENSO = Object.keys(NUMERO_POR_EXTENSO).sort((a, b) => b.length - a.length).join("|");
/* "◉ 6" já diz a moeda; "6" e "seis" precisam dela escrita a seguir */
const quantiaEMoeda = (doMundo) => `(?:◉\\s*(\\d{1,5})|(\\d{1,5}|(?:${EXTENSO})(?:\\s+e\\s+(?:${EXTENSO}))?)(?:\\s+(?:pe[cç]as?|moedas?)\\s+de)?\\s*(?:moedas?|pratas?|ouros?|de\\s+ouro|de\\s+prata|cobres?|de\\s+cobre${doMundo ? "|" + doMundo : ""})\\b)`;
const QUANTIA_E_MOEDA = quantiaEMoeda("");
/* até três palavras entre o verbo e a quantia, e nenhuma delas abre outra
   oração: "joga os dados e ganha 5 moedas" não é pagar cinco */
const ENTRE = "(?:(?!(?:e|mas|ou|ganha|ganhou|recebe|recebeu|acha|achou|pega|pegou|embolsa|embolsou)\\s)[a-z]+\\s+)";

/* Os verbos de dar dinheiro, nas formas em que o HERÓI é quem dá. Fora de
   propósito: "conta" (contar as moedas do morto não é pagar), "separa",
   o infinitivo ("você vê o mercador pagar") e o subjuntivo ("se você
   pagar") — a trava da hipótese é a própria forma do verbo. */
export const VERBOS_DE_PAGAR = [
  "paga", "pagou", "pagas", "pago", "paguei", "desembolsa", "desembolsou", "desembolso", "desembolsei",
  "gasta", "gastou", "gastei", "entrega", "entregou", "entrego", "entreguei", "deixa", "deixou", "deixo", "deixei",
  "larga", "largou", "atira", "atirou", "joga", "jogou", "poe", "pos", "pus",
];
const PAGAR = VERBOS_DE_PAGAR.join("|");
const PRIMEIRA_PESSOA = /^(pago|paguei|desembolso|desembolsei|gastei|entrego|entreguei|deixo|deixei|pus)$/;

/* A MOEDA DO MUNDO (12/10, MM11 · 8.ª sessão). O léxico renomeia a moeda
   por mundo ("moedas = Escamas"), e o Narrador obedece: "apanha as quatro
   escamas". O jogador também: "Pago as dez escamas", "Pago as oito
   escamas" — 18 das 27 moedas que a 8.ª não debitou estavam nesta palavra,
   que nenhuma régua daqui conhecia. Quem chama passa a palavra do léxico
   (`comoChamam(lex, "moeda")`); aqui ela vira a raiz com o plural opcional
   ("escama" e "escamas"). A primeira palavra só ("Coroas de Cobre" →
   "coroas"), letras só, e três ou mais — uma palavra curta demais casaria
   com qualquer coisa. Sem palavra, ou com a de sempre, a régua é a antiga. */
const MOEDAS_DE_SEMPRE = /^(moedas?|pratas?|ouros?|cobres?)$/;
export function raizDaMoeda(chamado) {
  const w = norm(chamado).trim().split(/\s+/)[0] || "";
  if (!/^[a-z]{3,24}$/.test(w) || MOEDAS_DE_SEMPRE.test(w)) return "";
  const raiz = w.endsWith("s") ? w.slice(0, -1) : w;
  return raiz.length >= 3 ? `${raiz}s?` : "";
}

/* O NOME DA MOEDA NA LINHA DO PREÇO (12/10, MM11 · 9.ª sessão, M42–M43).
   A pauta dava o preço só com o "◉", e o Mestre pôs-lhe a unidade que quis:
   "Vinte e cinco marcos o elixir", "Cem marcos" — num mundo de moedas. A
   linha que leva um preço leva também a palavra do mundo, no número certo
   ("1 moeda", "29 moedas", "3 escamas"). Sem palavra, nada: a linha fica
   como era. */
export function nomeDaMoeda(n, chamado) {
  const w = String(chamado == null ? "" : chamado).trim().toLowerCase().split(/\s+/)[0] || "";
  if (!/^[a-zà-ú]{3,24}$/.test(w)) return "";
  return Number(n) === 1 && w.endsWith("s") ? w.slice(0, -1) : w;
}

/* o verbo, até três palavras, a quantia e a moeda — "paga as 3 moedas",
   "deixa ◉ 6 no balcão" não (a moeda tem de vir), "entrega duas moedas de
   cobre" sim */
const RX_TRECHO_DE_PAGAR = new RegExp(`\\b(${PAGAR})\\s+${ENTRE}{0,3}?${QUANTIA_E_MOEDA}`, "g");
/* e o "custou-te", em que o herói paga sem ser sujeito */
const RX_TE_CUSTOU = new RegExp(`(?:\\b(?:te|lhe)\\s+cust(?:a|ou)|\\bcust(?:a|ou)-(?:te|lhe))\\s+${ENTRE}{0,2}?${QUANTIA_E_MOEDA}`, "g");

/* "CONTO N … E PAGO" (12/10, MM11 · 9.ª sessão, M17). "Conto sessenta
   moedas na mão de Brina e pago." — a quantia está com o verbo de CONTAR, e
   o "pago" vem sozinho no fim: a régua do trecho (o verbo de pagar com a
   quantia logo a seguir) não via nada, e sessenta moedas narradas não
   saíram. O gesto é um só: preparar o dinheiro (contar, separar, tirar,
   pôr na mão) e, na mesma frase, ligado por "e", dá-lo. Contar sozinho
   continua a não pagar ("conta as moedas do morto"): sem o "e pago" depois,
   nada sai. Na terceira pessoa vale com o herói de sujeito ("você conta
   sessenta moedas, uma a uma, e as deixa na palma dela"). */
export const PREPARAR_E_PAGAR = {
  preparar: ["conto", "contei", "separo", "separei", "tiro", "tirei", "junto", "juntei", "ponho", "coloco", "coloquei", "estendo", "estendi",
    "conta", "contou", "separa", "separou", "tira", "tirou", "junta", "juntou", "coloca", "colocou", "estende", "estendeu"],
  primeiraPessoa: ["conto", "contei", "separo", "separei", "tiro", "tirei", "junto", "juntei", "ponho", "coloco", "coloquei", "estendo", "estendi"],
  pagar: ["pago", "paguei", "entrego", "entreguei", "deixo", "deixei", "dou", "passo", "paga", "pagou", "entrega", "entregou", "deixa", "deixou", "da", "passa"],
  /* o que pode ficar entre a quantia e o "e pago": a mão, o balcão, "uma a uma" */
  entreMax: 80,
};
const preparoEPago = (q) => new RegExp(`\\b(${PREPARAR_E_PAGAR.preparar.join("|")})\\s+${ENTRE}{0,3}?${q}[^.!?]{0,${PREPARAR_E_PAGAR.entreMax}}?\\be\\s+(?:(?:as|os|a|o|lhe|lhes)\\s+)?(?:${PREPARAR_E_PAGAR.pagar.join("|")})\\b`, "g");
const RX_PREPARO_E_PAGO = preparoEPago(QUANTIA_E_MOEDA);
const PREPARO_NA_PRIMEIRA = new Set(PREPARAR_E_PAGAR.primeiraPessoa);

/* "AS CINCO MOEDAS QUE ELE PEDIU" (12/10, MM11 · 9.ª sessão, M44). A
   oração relativa que diz DE ONDE veio o número não é um pedido nem uma
   hipótese: "pago as cinco moedas que ele pediu" paga cinco. Mas o "pediu"
   dela caía na trava do pedido (a oferta ainda não é pagamento) e matava a
   frase inteira. A relativa sai antes das travas — e só ela: com "não",
   "nunca" ou "nem" lá dentro, fica, e a trava faz o que sempre fez. */
export const RELATIVA_DO_PRECO = {
  verbos: ["pediu", "pede", "pedia", "pedira", "cobrou", "cobra", "cobrava", "quer", "queria", "disse", "dissera", "combinou", "combinamos", "combinei", "devo", "devia", "custa", "custava"],
  palavrasAntes: 3,
};
const RX_RELATIVA_DO_PRECO = new RegExp(`\\bque\\s+(?:(?!(?:nao|nunca|nem)\\b)[a-z]+\\s+){0,${RELATIVA_DO_PRECO.palavrasAntes}}?(?:${RELATIVA_DO_PRECO.verbos.join("|")})\\b`, "g");
const semARelativa = (f) => String(f || "").replace(RX_RELATIVA_DO_PRECO, (s) => " ".repeat(s.length));

/* as mesmas três, com a moeda do mundo — fabricadas uma vez por palavra */
const REGRAS_POR_MOEDA = new Map();
function regrasDoGasto(moeda) {
  const raiz = raizDaMoeda(moeda);
  if (!raiz) return { trecho: RX_TRECHO_DE_PAGAR, custou: RX_TE_CUSTOU, preparo: RX_PREPARO_E_PAGO };
  if (!REGRAS_POR_MOEDA.has(raiz)) {
    const q = quantiaEMoeda(raiz);
    REGRAS_POR_MOEDA.set(raiz, {
      trecho: new RegExp(`\\b(${PAGAR})\\s+${ENTRE}{0,3}?${q}`, "g"),
      custou: new RegExp(`(?:\\b(?:te|lhe)\\s+cust(?:a|ou)|\\bcust(?:a|ou)-(?:te|lhe))\\s+${ENTRE}{0,2}?${q}`, "g"),
      preparo: preparoEPago(q),
    });
  }
  return REGRAS_POR_MOEDA.get(raiz);
}

/* Negação, hipótese e troco: a frase inteira sai. O troco sai porque
   "paga dez e recebe quatro de volta" é uma conta que o leitor de prosa
   erraria para um lado ou para o outro, e o lado seguro é não mexer. A
   oferta e o pedido ainda não são pagamento; a moeda ao ar não sai da mão. */
const RX_NAO_PAGOU = /\b(nao|nunca|nem|nada|nenhum|nenhuma|recusa|recusou|devolve|devolveu|troco|de volta|se\s+(voce|eu)|caso|quando\s+(voce|eu)|oferece|ofereceu|propoe|pede|pediu|cara ou coroa|para o alto)\b/;

const valorDe = (txt) => {
  const s = String(txt || "").trim();
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  return s.split(/\s+e\s+/).reduce((acc, w) => acc + (NUMERO_POR_EXTENSO[w] || 0), 0);
};

/* Quem paga é o herói? O sujeito antes do verbo, a três palavras no
   máximo, ou o verbo já na primeira pessoa. "O mercador paga você" e
   "você vê o homem que paga" ficam de fora. */
function heroiPaga(f, idx, verbo) {
  if (PRIMEIRA_PESSOA.test(verbo)) return true;
  const antes = f.slice(0, idx).trim().split(/\s+/).slice(-5).map((w) => w.replace(/[^a-z]/g, ""));
  return antes.some((w) => w === "voce" || w === "eu");
}

export function lerGastos(narrativa, opcoes = {}) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const { trecho, custou, preparo } = regrasDoGasto(o.moeda);
  const out = { moedas: 0, frases: [] };
  for (const frase of frasesDe(narrativa)) {
    /* 9.ª sessão: a relativa que diz de onde veio o número sai antes das travas */
    const f = semARelativa(norm(frase));
    if (RX_NAO_PAGOU.test(f)) continue;
    let contou = false;
    trecho.lastIndex = 0;
    let m;
    while ((m = trecho.exec(f))) {
      if (!heroiPaga(f, m.index, m[1])) continue;
      const n = valorDe(m[2] || m[3]);
      if (n > 0) { out.moedas += n; contou = true; }
    }
    /* 9.ª sessão: "conto N … e pago" — só quando o verbo de pagar não
       trouxe quantia própria (senão o mesmo dinheiro contaria duas vezes) */
    if (!contou) {
      preparo.lastIndex = 0;
      while ((m = preparo.exec(f))) {
        if (!PREPARO_NA_PRIMEIRA.has(m[1]) && !heroiPaga(f, m.index, m[1])) continue;
        const n = valorDe(m[2] || m[3]);
        if (n > 0) { out.moedas += n; contou = true; }
      }
    }
    custou.lastIndex = 0;
    while ((m = custou.exec(f))) {
      const n = valorDe(m[1] || m[2]);
      if (n > 0) { out.moedas += n; contou = true; }
    }
    if (contou) out.frases.push(frase.slice(0, 120));
  }
  return out;
}

/* O trecho do pagamento, apagado — para a frase do gasto não ser lida
   como ganho. Troca por espaços do mesmo tamanho e nada mais. Com a moeda
   do mundo, as réguas do gasto são as dela: "você recebe o pão e paga dez
   escamas" não credita dez. */
const semOsPagamentos = (f, moeda) => {
  const { trecho, custou, preparo } = regrasDoGasto(moeda);
  return f.replace(trecho, (s) => " ".repeat(s.length)).replace(custou, (s) => " ".repeat(s.length)).replace(preparo, (s) => " ".repeat(s.length));
};

/* A COMPRA NÃO É ACHADO (12/10, MM11 · 9.ª sessão, M44). "Você pega as
   ataduras de linho e entrega as cinco moedas." — o verbo de aquisição com
   o herói de sujeito e um item do catálogo: a cobrança creditou as Ataduras
   de graça ("+ Ataduras de Linho", bolsa 93 → 93), e o débito, que não via
   o herói nesse "entrega", não tirou nada. Uma frase em que o herói PAGA ou
   COMPRA é uma compra, e compra é da banca, pelo preço do estoque (a compra
   da frase, bolsa-da-frase.js#compraNaBanca) — nunca da narração. O item
   dessa frase não entra por aqui; as moedas que ela ACHA, sim, como antes. */
export const COMPRA_NAO_E_ACHADO = /\b(compra|comprou|compro|comprei|comprado|comprada|paga|pagou|pago|paguei|pagando|em troca de)\b/;

/* O GANHO COM A MOEDA DO MUNDO (12/10, MM11 · 8.ª sessão). A v9.427 deu a
   palavra do léxico ao lado de pagar; o de ganhar ficou surdo a ela: "você
   acha 10 escamas" não entrava na bolsa. A régua do ganho com a moeda do
   mundo aceita o número e o extenso ("dez escamas") — o Narrador escreve a
   quantia como no preço —, mas SÓ com a palavra do mundo: a régua antiga
   das moedas de sempre fica como estava (algarismo), para nenhum ganho que
   hoje não credita passar a creditar por este conserto. */
const REGRA_DO_GANHO_POR_MOEDA = new Map();
function regraDoGanho(moeda) {
  const raiz = raizDaMoeda(moeda);
  if (!raiz) return null;
  if (!REGRA_DO_GANHO_POR_MOEDA.has(raiz)) {
    REGRA_DO_GANHO_POR_MOEDA.set(raiz, new RegExp(`\\b(\\d{1,5}|(?:${EXTENSO})(?:\\s+e\\s+(?:${EXTENSO}))?)\\s+(?:${raiz})\\b`, "g"));
  }
  return REGRA_DO_GANHO_POR_MOEDA.get(raiz);
}

/* ============================================================
   O QUE A NARRAÇÃO PROMETEU
   ============================================================ */
export function lerGanhos(narrativa, opcoes = {}) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const moeda = typeof o.moeda === "string" ? o.moeda : "";
  const doMundo = regraDoGanho(moeda);
  const out = { moedas: 0, consumiveis: [], frases: [], aparado: false };
  for (const frase of frasesDe(narrativa)) {
    if (!RX_GANHO.test(norm(frase))) continue;
    if (RX_NEGA.test(norm(frase))) continue;
    let contou = false;
    /* 30/09: sem o trecho em que o herói paga — ver `lerGastos` */
    const f = semOsPagamentos(norm(frase), moeda);
    /* 9.ª sessão: a frase em que o herói paga ou compra não dá item de graça */
    const compra = f !== norm(frase) || COMPRA_NAO_E_ACHADO.test(norm(frase));
    RX_MOEDAS.lastIndex = 0;
    let m;
    while ((m = RX_MOEDAS.exec(f))) {
      const n = parseInt(m[1], 10);
      if (Number.isFinite(n) && n > 0) { out.moedas += n; contou = true; }
    }
    if (doMundo) {
      doMundo.lastIndex = 0;
      while ((m = doMundo.exec(f))) {
        const n = valorDe(m[1]);
        if (n > 0) { out.moedas += n; contou = true; }
      }
    }
    const cons = compra ? [] : consumiveisNaFrase(frase);
    for (const c of cons) { out.consumiveis.push(c); contou = true; }
    if (contou) out.frases.push(frase.slice(0, 120));
  }
  if (out.moedas > TETO_DE_MOEDAS) { out.moedas = TETO_DE_MOEDAS; out.aparado = true; }
  return out;
}

/* ============================================================
   A DIFERENÇA

   O que a narração prometeu MENOS o que o Mestre declarou. É esta
   subtração que impede o crédito dobrado: quando ele preenche o campo
   direito — que é o caso comum — não sobra nada para cobrar, e o
   arquivo inteiro não faz nada, que é o comportamento certo.
   ============================================================ */
/* `opcoes.moeda`: a palavra do léxico (`comoChamam(lex, "moeda")`), como no
   débito. `opcoes.envelopes`: o que foi ao Narrador neste turno — o achado
   da estrada que o sorteio já creditou vem lá com a marca de encontros.js,
   e conta como declarado, para a narração dele não o pagar outra vez. */
export function oQueFaltaCreditar(narrativa, mudancas, opcoes = {}) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const prometido = lerGanhos(narrativa, { moeda: typeof o.moeda === "string" ? o.moeda : "" });
  const m = mudancas && typeof mudancas === "object" ? mudancas : {};
  const jaDoAchado = moedasDoAchadoNoEnvelope(typeof o.envelopes === "string" ? o.envelopes : "");
  const declaradas = Math.max(0, Number(m.moedas) || 0) + jaDoAchado;
  /* 9.ª sessão: o que a compra da frase já pôs na mochila (o envelope
     "[COMPRA — JÁ REGISTRADA PELO SISTEMA]" diz o nome) conta como declarado:
     a narração do vendedor a entregá-lo não o dá outra vez */
  const comprado = String(o.envelopes || "").split("\n").filter((l) => JA_PAGO_PELO_SISTEMA[0].test(l)).map(norm).join(" ");
  const itensDeclarados = (Array.isArray(m.adicionar_itens) ? m.adicionar_itens : []).map((x) => norm(typeof x === "string" ? x : (x && x.nome) || "")).filter(Boolean);
  const jaComprado = (c) => !!comprado && comprado.includes(norm(c.nome));

  const moedas = Math.max(0, prometido.moedas - declaradas);
  const consumiveis = prometido.consumiveis.filter((c) => !jaComprado(c) && !itensDeclarados.some((n) => n.includes(norm(c.nome)) || norm(c.nome).includes(n)));

  return {
    moedas, consumiveis,
    aparado: prometido.aparado,
    frases: prometido.frases,
    temAlgo: moedas > 0 || consumiveis.length > 0,
  };
}

/* ============================================================
   O QUE FALTA DEBITAR (30/09)

   O espelho de `oQueFaltaCreditar`: o que a narração diz que o herói
   pagou MENOS o que o Mestre declarou como gasto (`moedas` negativo).
   Declarou certo, sobra zero, e nada acontece.

   DUAS PORTAS FECHADAS antes de ler:
     · o que o SISTEMA já cobrou neste turno — a compra no painel, o
       mapa, a venda — chega ao Narrador num envelope que diz "as moedas
       já saíram", e ele narra a troca: "você paga 12 moedas ao
       armeiro". Debitar essa frase seria cobrar duas vezes. Os
       envelopes que querem dizer isto estão na tabela abaixo, e quem
       chama passa o texto que foi ao Narrador;
     · o herói sem dinheiro. Narrar que ele pagou 20 com 6 na bolsa não
       é uma compra — é o Narrador a esquecer a bolsa. Nada é debitado,
       e o bilhete diz porquê: a compra não aconteceu.
   ============================================================ */
export const JA_PAGO_PELO_SISTEMA = [
  /\[COMPRA — JÁ REGISTRADA PELO SISTEMA\]/,
  /\[MAPA COMPRADO — JÁ APLICADO PELO SISTEMA\]/,
  /\[VENDA — JÁ REGISTRADA PELO SISTEMA\]/,
];
/* E A COMPRA QUE O SISTEMA RECUSOU (12/10, MM11 · 9.ª sessão). Quando a
   compra da frase não fecha — o preço da banca ou do balcão é outro, ou a
   bolsa não chega —, o veto do turno diz "a compra não fechou" (bolsa-da-
   frase.js#vetoDaCompra). O "pago as cinco moedas" da mesma frase não é
   então pagamento nenhum: debitá-lo cobraria por uma coisa que não veio. */
export const COMPRA_RECUSADA_PELO_SISTEMA = [/a compra não fechou/];

/* ============================================================
   A FRASE DO JOGADOR TAMBÉM PAGA (12/10, "o Narrador só narra", E3)

   Até à E3 o Narrador tinha o canal `moedas`: 3 usos em 137 turnos da
   6.ª e da 7.ª sessões, 2 nocivos, e 1 certo que nenhuma régua daqui
   apanhava — "Pago os dois cobres." (7.ª, M9), narrado como "Você tira
   dois cobres do bolso e os põe no balcão". "Tira" não é verbo de pagar,
   e sem o canal a caneca saía de graça. Com o canal fora do prompt, a
   frase do JOGADOR é lida também: ela vai ao Narrador logo depois da
   etiqueta do pedido (escuta.js, ETIQUETA_DO_PEDIDO), e por isso está nos
   envelopes que o App já passa a esta função.

   As travas: só a primeira pessoa com a quantia ("pago os dois cobres",
   a régua de `lerGastos`); a condição, a pergunta e a oferta não pagam
   ("se ele aceitar, pago dois", "pago dois?", "ofereço dois"); e a cena
   que recusa o dinheiro ganha ("empurra as moedas de volta", "é por
   conta da casa"). O mesmo pagamento dito pelos dois lados conta uma vez:
   o maior dos dois.

   A FRASE CHEGA PELO NOME (12/10, MM11 · 8.ª sessão). O parágrafo acima
   dizia que a frase "está nos envelopes que o App já passa" — e não
   estava: o App passa `conteudo + nota`, e a etiqueta só entra no pedido
   que vai ao Narrador (`pedidoFinal`). A suíte da E3 montou o envelope
   COM a etiqueta e passou; o jogo, sem ela, debitou 0 de 6 pagamentos
   (27 moedas). Uma porta que depende de uma etiqueta que outro módulo
   escreve noutro sítio é uma porta que se fecha calada no dia em que esse
   texto muda. Então a frase vem POR NOME, em `opcoes.pedido` — o texto
   que a escuta já leu como do jogador (`lerOPedido(...).texto`). A
   etiqueta nos envelopes fica só como recurso de quem não passa o nome.
   ============================================================ */
const RX_O_PEDIDO = /\[O QUE EU FAÇO AGORA[^\]\n]*\]\s*\n([\s\S]*?)(?=\n\[|$)/;
const RX_PEDIDO_NAO_PAGA = /\?|\b(se|caso|quanto|ofereco|proponho|posso|quero|queria|talvez)\b/;
const RX_CENA_RECUSA = /\b(recusa|recusou|devolve|devolveu|de volta|nao aceita|nao quer|por conta da casa|fica por conta|sem cobrar|de graca)\b/;

function gastoDoPedido(envelopes, narrativa, pedido, moeda) {
  const dito = typeof pedido === "string" ? pedido.trim() : "";
  const m = dito ? null : String(envelopes || "").match(RX_O_PEDIDO);
  const texto = dito || (m ? m[1] : "");
  if (!texto || RX_CENA_RECUSA.test(norm(narrativa))) return { moedas: 0, frases: [] };
  const out = { moedas: 0, frases: [] };
  for (const frase of frasesDe(texto)) {
    /* 9.ª sessão: "que ele pediu"/"que ele queria" não é o jogador a pedir */
    if (RX_PEDIDO_NAO_PAGA.test(semARelativa(norm(frase)))) continue;
    const g = lerGastos(frase, { moeda });
    if (g.moedas > 0) { out.moedas += g.moedas; out.frases.push(...g.frases); }
  }
  return out;
}

export function oQueFaltaDebitar(narrativa, mudancas, opcoes = {}) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const vazio = { moedas: 0, frases: [], temAlgo: false, semFundos: false, narrado: 0 };
  const envelopes = String(o.envelopes || "");
  if (JA_PAGO_PELO_SISTEMA.some((rx) => rx.test(envelopes))) return vazio;
  if (COMPRA_RECUSADA_PELO_SISTEMA.some((rx) => rx.test(envelopes))) return vazio;
  const moeda = typeof o.moeda === "string" ? o.moeda : "";
  const daCena = lerGastos(narrativa, { moeda });
  const doPedido = gastoDoPedido(envelopes, narrativa, o.pedido, moeda);
  const narrado = doPedido.moedas > daCena.moedas ? doPedido : daCena;
  const m = mudancas && typeof mudancas === "object" ? mudancas : {};
  const declarado = Math.max(0, -(Number(m.moedas) || 0));
  const moedas = Math.max(0, narrado.moedas - declarado);
  if (!moedas) return { ...vazio, narrado: narrado.moedas };
  const bolsa = Number.isFinite(Number(o.bolsa)) && o.bolsa !== null ? Math.max(0, Number(o.bolsa)) : null;
  if (bolsa != null && moedas > bolsa) {
    return { moedas: 0, frases: narrado.frases, temAlgo: true, semFundos: true, narrado: narrado.moedas, faltou: moedas, bolsa };
  }
  return { moedas, frases: narrado.frases, temAlgo: true, semFundos: false, narrado: narrado.moedas };
}

/* A linha do jogador: o que saiu da bolsa, na mesma forma do débito
   declarado (`regras-jogo.js`). De onde veio a conta não é assunto dele. */
export function falaDoDebito(d) {
  if (!d || !d.temAlgo || d.semFundos || !(d.moedas > 0)) return "";
  return `◉ −${d.moedas} moedas`;
}

export function envelopeDoDebito(d) {
  if (!d || !d.temAlgo) return "";
  if (d.semFundos) {
    return `[COMPRA SEM FUNDOS — DECISÃO DO SISTEMA] O pagamento de ${d.faltou} moedas não cabe na minha bolsa: eu só tenho ${d.bolsa}. Esse pagamento NÃO aconteceu, e o que ele comprava não é meu.
REGRA DESTE ENVELOPE (obrigatória): na próxima fala, não finja que eu paguei nem que tenho o que ele comprava; siga daqui — quem vendia espera o dinheiro, ou regateia, ou recusa. O que está na minha bolsa é o que eu posso gastar.`;
  }
  return `[DÉBITO — APLICADO PELO SISTEMA] Eu paguei ${d.moedas} moedas, e o sistema JÁ TIROU da minha bolsa, para que o texto e a bolsa não se contradigam.
REGRA DESTE ENVELOPE (obrigatória): não cobre de novo e não repita o pagamento na próxima cena. A bolsa é do sistema: ele lê o que eu digo que pago e o que a cena conta.`;
}

/* ============================================================
   O DADO MANDA MAIS QUE A NARRAÇÃO (v9.70)

   Achado na própria prova desta versão, e é grave: o teste de
   furtividade FALHOU, o Mestre narrou o roubo dando certo assim mesmo,
   e o sistema creditou as cem moedas. A cobrança, criada para fazer a
   ficha obedecer à ficção, tinha acabado de fazer a ficção passar por
   cima do dado.

   É a inversão exata do projeto. O envelope do teste já proíbe o Mestre
   de entregar qualquer coisa na falha — "NÃO revela nada, NÃO entrega
   meia-informação, NÃO oferece pista de consolo" —, mas uma regra que
   depende de o outro lado obedecer não é uma regra, é um pedido.

   Então a cobrança pergunta antes de creditar: o último dado deste
   turno passou? Se falhou, nada entra na bolsa por narração — e o
   Mestre é lembrado, porque o erro dele não pode ficar barato.
   ============================================================ */
export function envelopeDaCobrancaNegada(d) {
  if (!d || !d.temAlgo) return "";
  const lista = [d.moedas > 0 ? `${d.moedas} moedas` : "", ...d.consumiveis.map((c) => c.nome)].filter(Boolean).join(" e ");
  return `[COBRANÇA RECUSADA — DECISÃO DO SISTEMA] Você narrou que eu ganhei ${lista}, mas o teste deste turno FALHOU. Nada disso entrou na minha ficha e nada disso aconteceu.
REGRA DESTE ENVELOPE (obrigatória): na próxima fala, NÃO corrija a cena com um desmentido nem finja que eu já tinha o item — apenas siga daqui, e daqui em diante o que estava em jogo continua fora do meu alcance. O dado decide o desfecho; a narração mostra COMO ele foi. Quando eu falho, o prêmio não existe em versão nenhuma da cena.`;
}

/* A linha do jogador. Ela é gameplay — o que entrou na bolsa é o
   resultado do turno dele — e por isso aparece; o fato de ter vindo da
   narração em vez do campo não é assunto dele. */
export function falaDaCobranca(d) {
  if (!d || !d.temAlgo) return "";
  const partes = [];
  if (d.moedas > 0) partes.push(`◉ ${d.moedas} moedas`);
  for (const c of d.consumiveis) partes.push(`${c.icone} ${c.nome}`);
  return `⚡ ${partes.join(" · ")} ${partes.length > 1 ? "foram" : "foi"} para a bolsa.`;
}

/* E o bilhete ao Mestre. Não é bronca: é o combinado sendo lembrado, e
   ele precisa saber que já está feito para não entregar de novo. */
export function envelopeDaCobranca(d) {
  if (!d || !d.temAlgo) return "";
  const lista = [d.moedas > 0 ? `${d.moedas} moedas` : "", ...d.consumiveis.map((c) => c.nome)].filter(Boolean).join(" e ");
  return `[COBRANÇA — APLICADA PELO SISTEMA] Você narrou que eu ganhei ${lista}. O sistema leu a sua cena e JÁ CREDITOU na minha ficha, para que o texto e a bolsa não se contradigam.
REGRA DESTE ENVELOPE (obrigatória): não entregue de novo, não repita o achado na próxima cena e não invente que houve engano. O que o herói ganha vem do sistema: narre um ganho quando um envelope o entregar, com o número dele.${d.aparado ? " E cuidado com a quantia: o valor narrado passava do teto de um turno e foi aparado." : ""}`;
}
