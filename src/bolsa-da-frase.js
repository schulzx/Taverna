/* ============================================================
   A BOLSA DA FRASE (11/10, MM11 · 5.ª sessão, M10 e M35)

   "O jogo regista o que o jogador fez." Duas vezes na quinta sessão de
   prova o jogador mexeu na mochila com uma frase e a mochila não soube:

   · M10 — "Pago as onze cunhas pela corda boa, as tochas e as rações."
     A frase acabava numa pergunta ao anão, o oráculo ganhou o turno, e
     ninguém fechou a compra: o Mestre (que no turno anterior INVENTOU o
     preço, "dez cunhas, mais uma pela corda boa") pôs o embrulho nas mãos
     do herói, e as onze cunhas nunca saíram da bolsa. O balcão de
     mantimentos (`balcaoDeMantimentos`, mercado.js) existia, com preço,
     e só abria pelo painel.
   · M35 — "Tiro da bolsa duas rações e o odre de água e entrego a Edric
     sem exigir nada." Edric comeu e bebeu na prosa; `suprimentos` ficou
     10 → 10, e o gesto não deixou marca nenhuma em quem o recebeu.

   Este arquivo LÊ a frase do jogador (só ela, nunca a narração) e devolve
   o que ela troca: a COMPRA no balcão de mantimentos, e a DÁDIVA de
   mantimento a alguém presente. Quem aplica é o App, antes do turno ir ao
   Narrador — o Narrador recebe o fato pronto ("as moedas já saíram"), ou o
   veto ("a compra não fechou: ninguém entrega o embrulho").

   A RÉGUA DO PORTÃO vale aqui (ver `portao-morde-so-o-necessario`):
   morder a bolsa por engano custa moedas de verdade, e o falso negativo
   é só o comportamento de antes. Por isso:
     · só a frase que DECLARA ("compro", "pago", "entrego a Edric") — a
       que pergunta ("quanto custa?", "se eu comprar…") nunca compra;
     · só mantimento do balcão (rações, água, tochas, o kit). A mercadoria
       das bancas fica no painel: o que a frase nomeia de lá NÃO fecha, e
       o veto diz ao Narrador que ninguém a entrega;
     · a quantia que o jogador disse é um teto: pagar onze pelo que custa
       dezasseis não fecha nada — o vendedor diz o preço e espera.
   ============================================================ */
import { NUMERO_POR_EXTENSO } from "./cobranca.js";
import { MERCADORIAS } from "./mercado.js";
/* E1 (12/10): o acento que separa mora em economia.js (o círculo com mercado.js) */
import { semConfusao } from "./economia.js";

const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ---------------- O MANTIMENTO NA FRASE ----------------
   As palavras de cada prateleira do balcão (`ORDEM_DO_BALCAO`). "Comida"
   e "pão" ficam de fora de propósito: na taverna são uma refeição, não a
   ração seca de estrada, e comprar uma por engano seria cobrar a outra.
   O kit é a corda (a sessão disse "a corda boa"): é o único sítio do
   balcão onde há corda, e quem já o carrega já a tem. */
export const MANTIMENTO_NA_FRASE = [
  { id: "racoes", rx: /\b(racao|racoes|mantimentos?|viveres|provisoes|carne[- ]seca)\b/g, porDia: true },
  { id: "agua", rx: /\b(agua|odres?|cantis|cantil)\b/g, porDia: true },
  { id: "tochas", rx: /\b(tochas?|archotes?)\b/g, porDia: false },
  { id: "kit", rx: /\b(kit|kits|cordas?|saco de dormir|pederneira)\b/g, porDia: false, unico: true },
];

/* QUANTAS, quando a frase não diz um número. "As rações" pede mais de
   uma, e três é o "uns dias" de quem compra para a estrada; o teto
   impede que um "vinte mil rações" esvazie a bolsa por um erro de dedo. */
export const QUANTIDADE_DA_FRASE = { singular: 1, pluralSemNumero: 3, teto: 20, palavrasAntes: 2 };

/* ---------------- OS VERBOS ----------------
   DECLARAR compra (primeira pessoa, presente ou passado imediato). "Levo"
   e "fico com" ficam de fora: "levo a tocha acesa" é carregar, não pagar.
   A HIPÓTESE e a PERGUNTA matam a oração: "quanto custa", "se eu
   comprar", "talvez leve" — é o balcão a responder, e não a vender. */
const RX_COMPRA = /\b(compro|comprei|comprarei|vou comprar|quero comprar|pago|paguei|adquiro|arremato)\b/;
const RX_HIPOTESE = /\b(se|caso|talvez|quanto|quantos|quantas|preco|precos|custa|custam|nao)\b/;
/* e a frase que PERGUNTA O PREÇO em qualquer oração não compra em
   nenhuma: "quero comprar tochas e rações. Quanto custa tudo?" (o J9 da
   sessão) pede o número antes de pagar — é o balcão a responder */
const RX_PERGUNTA_DE_PRECO = /\b(quanto (custa|custam|e|sao|sai|saem|fica|ficam|vale|valem|cobra|cobram|pede|pedem|quer|querem)|qual (e )?o preco|que preco|a quanto)\b/;
/* a dádiva: o gesto de dar, na primeira pessoa. "Passo" só com o "a/para"
   de quem recebe, que a frase tem de nomear de qualquer modo. */
const RX_DAR = /\b(dou|entrego|ofereco|estendo|divido|reparto|partilho|passo|deixo)\b/;
const RX_PRONOME = /(\blhe\b|-lhe\b|\b(a|para|pra) (ele|ela)\b)/;

const NUM = Object.keys(NUMERO_POR_EXTENSO).sort((a, b) => b.length - a.length).join("|");
const valor = (tok) => {
  const s = String(tok || "");
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  return NUMERO_POR_EXTENSO[s] || 0;
};
const oracoes = (frase) => {
  const t = norm(frase);
  const out = [];
  const rx = /[^.!?;\n]+[.!?;]?/g;
  let m;
  while ((m = rx.exec(t))) {
    const o = m[0].trim();
    if (o) out.push({ texto: o, pergunta: o.endsWith("?") });
  }
  return out;
};

/* quantas de um mantimento a oração pede, a partir da palavra achada;
   `dito` diz se a frase deu o número (ou os dias) — e não o plural */
function quantasDe(oracao, idx, palavra, porDia) {
  const q = QUANTIDADE_DA_FRASE;
  const antes = oracao.slice(0, idx).trim().split(/\s+/).slice(-q.palavrasAntes);
  for (let i = antes.length - 1; i >= 0; i--) {
    const n = valor(antes[i]);
    if (n > 0) return { n: Math.min(q.teto, n), dito: true };
  }
  if (porDia) {
    const depois = oracao.slice(idx + palavra.length);
    const d = depois.match(new RegExp(`^[^.!?;]{0,30}?\\b(?:para|pra|por)\\s+(?:uns\\s+|umas\\s+|os\\s+|as\\s+)?(\\d+|${NUM})\\s+dias?\\b`));
    if (d && valor(d[1]) > 0) return { n: Math.min(q.teto, valor(d[1])), dito: true };
  }
  return { n: /s$/.test(palavra) ? q.pluralSemNumero : q.singular, dito: false };
}

/* os mantimentos de uma oração, cada id uma vez. Quando a mesma coisa é
   dita duas vezes, vale a menção com número: na prova viva, "fico só com
   as tochas: compro duas tochas" comprou TRÊS — valia o primeiro "as
   tochas", plural sem número. Sem número em nenhuma, vale a primeira. */
function mantimentosDa(oracao) {
  const out = [];
  for (const m of MANTIMENTO_NA_FRASE) {
    const rx = new RegExp(m.rx.source, "g");
    let x, primeira = null, comNumero = null;
    while ((x = rx.exec(oracao))) {
      const q = m.unico ? { n: 1, dito: false } : quantasDe(oracao, x.index, x[0], m.porDia);
      const achada = { id: m.id, palavra: x[0], idx: x.index, quantos: q.n, unico: !!m.unico };
      if (!primeira) primeira = achada;
      if (q.dito && !comNumero) comNumero = achada;
    }
    const v = comNumero || primeira;
    if (v) out.push({ ...v, idx: primeira.idx });
  }
  return out.sort((a, b) => a.idx - b.idx);
}

/* ============================================================
   A COMPRA
   `balcao`: a prateleira de hoje (`balcaoDeMantimentos` — {id, nome,
   icone, preco}); `bolsa`: as moedas do herói; `temKit`: já carrega o
   kit. Devolve null quando a frase não declara compra de mantimento nem
   de mercadoria; senão:
     { itens: [{id, nome, icone, quantos, preco, custo}], total,
       declarado, jaTem: [nomes], daBanca: [palavras], fecha, porque }
   `porque` (quando não fecha): "sem_fundos" | "pouco" | "so_banca" | "ja_tem".
   ============================================================ */
/* O ACENTO QUE SEPARA (MM-C · C0) mudou-se para economia.js na E1 (12/10):
   `semConfusao` vem de lá, e o `mercadoParaPauta` lê a mesma tabela. */

/* ---------------- A CONTA EM DOIS PASSOS (MM-C · C0, 11/10) ----------------
   J7: "compro duas tochas e uma corda… Quanto é?" — o balcão respondeu
   (◉ 37). J8: "Sim, amarre as tochas. Pago as sete fichas." — o "pago" não
   repetia o item, e a frase não era lida como compra: nem recibo, nem
   veto, e a prosa entregou tudo por sete. O pagamento SEM ITEM herda os
   mantimentos da frase anterior (`anterior`), quando ela perguntou o preço
   ou declarou a compra — e a conta é a do balcão, como sempre: sete não
   paga trinta e sete. */
const RX_PAGO_SO = /\b(pago|paguei|fechado|fecho negocio)\b/;
function herdaDe(anterior) {
  const t = norm(semConfusao(anterior));
  if (!t.trim() || !(RX_PERGUNTA_DE_PRECO.test(t) || RX_COMPRA.test(t))) return [];
  return mantimentosDa(t);
}

export function compraNaFrase(frase, { balcao = [], bolsa = 0, temKit = false, anterior = "" } = {}) {
  const prateleira = Array.isArray(balcao) ? balcao.filter((b) => b && b.id) : [];
  const itens = [], jaTem = [], daBanca = [];
  let declarado = null, viu = false, pagouSemItem = false;
  frase = semConfusao(frase);
  if (RX_PERGUNTA_DE_PRECO.test(norm(frase))) return null;
  for (const o of oracoes(frase)) {
    if (o.pergunta || !(RX_COMPRA.test(o.texto) || RX_PAGO_SO.test(o.texto)) || RX_HIPOTESE.test(o.texto)) continue;
    viu = true;
    /* a quantia dita: "pago as onze cunhas", "pago 11 moedas", "pago ◉ 11" */
    const d = o.texto.match(new RegExp(`\\b(?:pago|paguei)\\s+(?:as\\s+|os\\s+|so\\s+|apenas\\s+|◉\\s*)?(\\d+|${NUM})\\b(?!\\s+(?:racao|racoes|tochas?|odres?|kits?|cordas?|archotes?))`));
    if (d && declarado == null) declarado = valor(d[1]) || null;
    const daqui = mantimentosDa(o.texto);
    if (!daqui.length && RX_PAGO_SO.test(o.texto)) pagouSemItem = true;
    for (const m of daqui) {
      if (itens.some((x) => x.id === m.id)) continue;
      const p = prateleira.find((b) => b.id === m.id);
      if (m.id === "kit" && (temKit || !p)) { if (temKit) jaTem.push("kit"); continue; }
      if (!p) continue;
      const preco = Math.max(0, Number(p.preco) || 0);
      itens.push({ id: m.id, nome: p.nome, icone: p.icone || "", quantos: m.quantos, preco, custo: preco * m.quantos });
    }
    for (const mc of MERCADORIAS) {
      const x = o.texto.match(mc.rx);
      if (x) daBanca.push(x[0]);
    }
  }
  /* a conta em dois passos: pagou sem dizer o quê, e nada foi dito agora */
  if (pagouSemItem && !itens.length && !jaTem.length && !daBanca.length) {
    for (const m of herdaDe(anterior)) {
      const p = prateleira.find((b) => b.id === m.id);
      if (m.id === "kit" && (temKit || !p)) { if (temKit) jaTem.push("kit"); continue; }
      if (!p) continue;
      const preco = Math.max(0, Number(p.preco) || 0);
      itens.push({ id: m.id, nome: p.nome, icone: p.icone || "", quantos: m.quantos, preco, custo: preco * m.quantos });
    }
  }
  if (!viu || (!itens.length && !jaTem.length && !daBanca.length)) return null;
  const total = itens.reduce((s, x) => s + x.custo, 0);
  const moedas = Math.max(0, Number(bolsa) || 0);
  let porque = "";
  if (!itens.length) porque = daBanca.length ? "so_banca" : "ja_tem";
  else if (total > moedas) porque = "sem_fundos";
  else if (declarado != null && declarado < total) porque = "pouco";
  return { itens, total, declarado, jaTem, daBanca, fecha: !porque, porque, bolsa: moedas };
}

/* ---------------- O PREÇO DO BALCÃO, PERGUNTADO (o J9) ----------------
   "Quero comprar tochas, uma corda e rações para uns três dias. Quanto
   custa tudo?" — `mercadoParaPauta` só conhecia a mercadoria das bancas,
   a pauta não levou número nenhum, e o Mestre inventou "dez cunhas, mais
   uma pela corda boa". A resposta mora no balcão de hoje: o preço de cada
   coisa e a conta do que a frase pediu. Mesmo molde de `mercadoParaPauta`
   ({ pergunta: [linha], em: [pos] }), para entrar em `juntarRespostas`. */
export function balcaoParaPauta(frase, { balcao = [], temKit = false } = {}) {
  const out = { pergunta: [], em: [] };
  const t = norm(frase);
  const q = t.search(RX_PERGUNTA_DE_PRECO);
  if (q < 0) return out;
  const prateleira = Array.isArray(balcao) ? balcao.filter((b) => b && b.id) : [];
  const pedidos = mantimentosDa(t).map((m) => ({ ...m, p: prateleira.find((b) => b.id === m.id) }));
  if (!pedidos.length) return out;
  const partes = [], conta = [];
  let total = 0;
  for (const m of pedidos) {
    if (m.id === "kit" && temKit) { partes.push("a corda: já a carrego no kit"); continue; }
    if (!m.p) continue;
    /* o kit diz o que traz: quem pediu "uma corda" tem de ouvir que ela só
       se vende com o saco, a pederneira e a panela */
    const doKit = m.id === "kit" && m.p.desc ? ` (${String(m.p.desc).replace(/\.$/, "").toLowerCase()})` : "";
    partes.push(`${m.p.nome}${doKit} ◉ ${m.p.preco}${m.id === "kit" ? "" : " cada"}`);
    conta.push(`${m.quantos > 1 ? `${m.quantos}× ` : ""}${m.p.nome}`);
    total += m.p.preco * m.quantos;
  }
  if (!partes.length) return out;
  out.pergunta.push(`no balcão de mantimentos: ${partes.join(", ")}${conta.length ? ` — ${conta.join(", ")} dá ◉ ${total}` : ""}`);
  out.em.push(q);
  return out;
}

const listaDe = (itens) => itens.map((x) => `${x.quantos > 1 ? `${x.quantos}× ` : ""}${x.nome}`).join(", ");

/* a linha do jogador: o recibo, ou o porquê de não ter fechado */
export function falaDaCompra(c) {
  if (!c) return "";
  if (c.fecha) return `🛒 ${listaDe(c.itens)} — ◉ ${c.total} (restam ◉ ${c.bolsa - c.total}).`;
  if (c.porque === "sem_fundos") return `◉ Não chega: ${listaDe(c.itens)} custa ◉ ${c.total}, e a bolsa tem ◉ ${c.bolsa}.`;
  if (c.porque === "pouco") return `◉ ${listaDe(c.itens)} custa ◉ ${c.total} no balcão — ◉ ${c.declarado} não paga.`;
  if (c.porque === "ja_tem") return "🎒 A corda já vem no kit que você carrega.";
  return `🛒 ${c.daBanca.join(", ")} compra-se nas bancas, com o preço de cada uma.`;
}

/* o envelope do turno: o fato pronto (fechou) — com a etiqueta que a
   cobrança (`JA_PAGO_PELO_SISTEMA`) reconhece para não cobrar duas vezes */
export function envelopeDaCompra(c) {
  if (!c || !c.fecha) return "";
  return `[COMPRA — JÁ REGISTRADA PELO SISTEMA] Comprei ${listaDe(c.itens)} por ◉ ${c.total}, ao preço do balcão. Os mantimentos já estão na minha mochila e as moedas já saíram — não envie item nem moeda, e não diga outro preço. Narre a troca e quem vende, se a cena estiver acontecendo agora.`;
}

/* o veto (secção `naoPode` da pauta), quando NÃO fechou */
export function vetoDaCompra(c) {
  if (!c || c.fecha) return [];
  const o = c.itens.length ? listaDe(c.itens) : c.daBanca.length ? c.daBanca.join(", ") : "a corda";
  const pq = c.porque === "sem_fundos" ? `custa ◉ ${c.total} e eu tenho ◉ ${c.bolsa}`
    : c.porque === "pouco" ? `o preço é ◉ ${c.total}, e eu disse ◉ ${c.declarado}`
    : c.porque === "ja_tem" ? "já a carrego no kit"
    : "isso vende-se nas bancas, a preço de banca, e eu não fechei";
  return [`entregar-me ${o} ou receber moedas por isso: a compra não fechou (${pq}) — quem vende diz o preço certo e espera`];
}

/* ============================================================
   A DÁDIVA
   `pessoas`: quem está na cena ({ nome, companheiro }); `suprimentos`:
   a mochila (`garantirSuprimentos`). Só rações, água e tochas — o kit não
   se reparte. Devolve null sem gesto de dar, sem mantimento ou sem quem
   receba; senão { quem, companheiro, itens: [{id, quantos}],
   falta: [{id, quer, tem}], da }.
   ============================================================ */
export const O_QUE_SE_DA = {
  racoes: { nome: "ração", nomes: "rações", faz: "come", cede: "a fome" },
  agua: { nome: "odre de água", nomes: "odres de água", faz: "bebe", cede: "a sede" },
  tochas: { nome: "tocha", nomes: "tochas", faz: "acende", cede: "o escuro" },
};
/* o que o gesto deixa em quem recebe: no companheiro, pontos de vínculo
   (`ganharVinculo`); em quem não é do grupo, a marca de que me deve —
   `meDeve`, o sinal que o Intérprete e a índole já liam e ninguém dava */
export const MARCA_DA_DADIVA = { vinculoDoCompanheiro: 3 };

const primeiro = (nome) => norm(nome).split(/\s+/).filter((w) => !/^(o|a|os|as|de|do|da|dos|das)$/.test(w))[0] || "";

export function dadivaNaFrase(frase, { pessoas = [], suprimentos = null } = {}) {
  const gente = (Array.isArray(pessoas) ? pessoas : []).filter((p) => p && p.nome && primeiro(p.nome).length >= 3);
  if (!gente.length) return null;
  const sup = suprimentos && typeof suprimentos === "object" ? suprimentos : {};
  for (const o of oracoes(frase)) {
    if (o.pergunta || !RX_DAR.test(o.texto) || /\b(se|caso|talvez|nao)\b/.test(o.texto)) continue;
    const itens = mantimentosDa(o.texto).filter((m) => O_QUE_SE_DA[m.id]).map((m) => ({ id: m.id, quantos: m.quantos }));
    if (!itens.length) continue;
    /* quem recebe: o nome dito (o mais perto depois do verbo), ou o
       pronome quando só há uma pessoa de fora do grupo na cena */
    const iVerbo = o.texto.search(RX_DAR);
    const ditos = gente.map((p) => {
      const rx = new RegExp(`\\b${primeiro(p.nome)}\\b`);
      const x = rx.exec(o.texto);
      return x ? { p, d: x.index >= iVerbo ? x.index - iVerbo : 1000 + (iVerbo - x.index) } : null;
    }).filter(Boolean).sort((a, b) => a.d - b.d);
    let quem = ditos.length ? ditos[0].p : null;
    if (!quem && RX_PRONOME.test(o.texto)) {
      const fora = gente.filter((p) => !p.companheiro);
      if (fora.length === 1) quem = fora[0];
    }
    if (!quem) continue;
    const falta = itens.filter((x) => (Number(sup[x.id]) || 0) < x.quantos).map((x) => ({ id: x.id, quer: x.quantos, tem: Number(sup[x.id]) || 0 }));
    return { quem: quem.nome, companheiro: !!quem.companheiro, itens, falta, da: !falta.length };
  }
  return null;
}

const contaDe = (x) => { const o = O_QUE_SE_DA[x.id]; return `${x.quantos} ${x.quantos > 1 ? o.nomes : o.nome}`; };
const juntar = (xs) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}`);

/* a mochila depois do gesto; a de antes, intacta (imutável) */
export function mochilaDepoisDaDadiva(suprimentos, d) {
  const s = { ...(suprimentos && typeof suprimentos === "object" ? suprimentos : {}) };
  if (!d || !d.da) return s;
  for (const x of d.itens) s[x.id] = Math.max(0, (Number(s[x.id]) || 0) - x.quantos);
  return s;
}

export function falaDaDadiva(d, depois = null) {
  if (!d) return "";
  if (!d.da) return `🎒 Não há na mochila: ${juntar(d.falta.map((f) => `${contaDe({ id: f.id, quantos: f.quer })} (há ${f.tem})`))}.`;
  const resto = depois ? ` (restam ${juntar(d.itens.map((x) => `${Number(depois[x.id]) || 0} ${O_QUE_SE_DA[x.id].nomes}`))})` : "";
  return `🤝 ${juntar(d.itens.map(contaDe))} para ${d.quem}${resto}.`;
}

export function envelopeDaDadiva(d) {
  if (!d || !d.da) return "";
  const faz = juntar(d.itens.map((x) => O_QUE_SE_DA[x.id].faz));
  const cede = d.itens.map((x) => O_QUE_SE_DA[x.id].cede);
  const efeitos = `${faz}: ${juntar(cede)} ${cede.length > 1 ? "cedem" : "cede"} por hoje`;
  const marca = d.companheiro ? "o laço entre nós aperta um pouco — é dos meus, e viu o gesto" : "e fica a dever-me isto, e sabe-o";
  return `[DÁDIVA — REGISTRADA PELO SISTEMA] Dei a ${d.quem} ${juntar(d.itens.map(contaDe))}; saíram da minha mochila. ${d.quem} ${efeitos}; ${marca}. Narre o gesto e o efeito no corpo de quem recebe — não devolva nada à mochila e não transforme o dado em pagamento.`;
}

export function vetoDaDadiva(d) {
  if (!d || d.da) return [];
  return [`pôr nas mãos de ${d.quem} o que eu não tenho: ${juntar(d.falta.map((f) => `${contaDe({ id: f.id, quantos: f.quer })} (tenho ${f.tem})`))} — a mão vai à mochila e volta com menos`];
}
