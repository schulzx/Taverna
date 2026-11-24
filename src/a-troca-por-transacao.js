/* ============================================================
   A TROCA POR TRANSAÇÃO (23/11/2026, etapa 6 da planta
   mente/plano-identidade-e-posse.md)

   A ordem da pessoa, 23/11: «se a troca não está funcionando, vou criar um
   sistema que identifica e realiza trocas». A etapa 5 fez o mecanismo
   (quem-tem-o-que.js: a posse de todo mundo, a dívida, `aplicarTransacao`);
   esta é a ponte entre ele e a frase. A porta única (motor/uma-porta-so.js)
   continua a decidir o que a frase é — o subtipo ainda vem do ouvido (a
   etapa 8 o troca pela forma da transação) —, e o que ela decidiu deixa de
   ser «a ficha nova inteira» para ser uma lista de transações:

     { de, para, oQue, contra, consentimento, prazo?, origem, chave }

   com ids (`heroi`, o `quemId` do ouvido, `npc|…`, `banca|…`, `mundo`,
   `nada`). Quem aplica é `aplicarTransacao`, uma vez, e é ela quem diz se a
   troca se sustenta: quem entrega tem a coisa? há dívida naquela direção?
   o dado passou? a chave já foi aplicada? Recusa, e nada muda.

   ---------------- DE ONDE SAI CADA PEÇA ----------------
     · o lado do herói sai do veredito que a porta já calculou (`mudou`,
       e a ficha de antes e a de depois para o nome exato, o objeto que
       entra, o destino — mochila ou corpo — e o que é de uso);
     · o outro lado sai do nome que o veredito diz, resolvido para id pela
       ordem: o herói, o companheiro (o id do grupo), a banca que vendeu ou
       comprou (o id dela), a banca que tem a coisa no estoque (sem id é
       `mundo`, o balcão e a casa), o `quemId` do ouvido, a gente da cena
       por id, e por fim `npc|Nome`;
     · o consentimento sai do que a porta decidiu (A_TROCA_POR_TRANSACAO.
       consentimento): o que o herói oferece é `dado`; o que ele pede é
       `pedido` (e quem vende aceita pelo preço: ctx.aceito); tomar é
       `tomado` (o dado); devolver e cobrar são `devido`. Duas leituras do
       registro afinam isso, e nenhuma é palavra: pagar a quem se deve é
       `devido` (fecha a dívida); devolver sem dívida, à banca de onde a
       coisa saiu (`mercado.comprados`), é entrega de volta (`dado`);
     · emprestar leva `prazo` (a tabela); a chave é estável por turno, por
       ação e por posição — o clique do cartão aplica a mesma transação.

   PURO E DETERMINÍSTICO. Nenhum relógio, nenhuma sorte; o que entra nunca
   é mutado; `null` e lixo dão lista vazia ou recusa, nunca exceção.
   ============================================================ */
import { QUEM_TEM_O_QUE, aplicarTransacao, dividasDe, posseDe } from "./quem-tem-o-que.js";
import { idDe } from "./quem-e-quem.js";
import { hashSemente } from "./semente.js";

/* ---------------- A TABELA ----------------
   `prazoDoEmprestimo`: os dias de um empréstimo sem prazo dito (a frase de
   hoje não diz prazo; a etapa 9 lê o dito). `consentimento`: o subtipo que
   a porta decidiu → o consentimento da transação principal. `deUso`: o nome
   na linha → o id em `suprimentos`. `dadoComTransacao`: as intenções do
   caminho do dado cuja coisa sai de alguém da cena (o furto é da etapa 7).
   `tela`/`fato`: o que o jogador lê e o que vai à pauta de um turno. */
export const A_TROCA_POR_TRANSACAO = Object.freeze({
  v: 1,
  prazoDoEmprestimo: 7,
  consentimento: Object.freeze({
    dar: "dado", emprestar: "dado", vender: "dado", escambo: "dado", subornar: "dado", pagar: "dado",
    comprar: "pedido", pedir: "pedido",
    pegar: "tomado", furtar: "tomado", tomar: "tomado",
    devolver: "devido", cobrar: "devido",
  }),
  /* quem empresta: a coisa vai agora e volta depois */
  comPrazo: Object.freeze(["emprestar"]),
  /* quem paga ou devolve a quem se deve: a dívida decide */
  pagaDivida: Object.freeze(["pagar", "devolver"]),
  /* o que se cobra ou se pede de volta: a coisa vem de quem deve */
  cobra: Object.freeze(["cobrar", "pedir"]),
  dadoComTransacao: Object.freeze(["deGraca", "tomar"]),
  deUso: Object.freeze({ "ração": "racoes", "racao": "racoes", "água": "agua", "agua": "agua", "tocha": "tochas", "flecha": "flechas" }),
  origem: "a troca da frase",
  chave: "troca",
  voce: Object.freeze({ sujeito: "Você", objeto: "você" }),
  moeda: "◉ {N}",
  tela: Object.freeze({
    naoTem: "🤝 {De} não tem {Coisa}: nada muda de mão.",
    emUso: "🤝 {De} está usando {Coisa}: nada muda de mão.",
    semDivida: "🤝 {De} não deve {Coisa} a {Para}: nada muda de mão.",
    maisQueDevido: "🤝 {De} deve a {Para} menos do que {Coisa}: nada muda de mão.",
    morto: "🤝 {Para} está morto: nada muda de mão.",
    outro: "🤝 Nada muda de mão: {texto}.",
    passou: "🤲 {De} lhe passa {Coisa}.{Divida}",
    pagou: " A dívida está paga.",
    resta: " Ainda falta {Resto}.",
  }),
  fato: Object.freeze({
    recusa: "{Linha} Nada mudou de mão.",
    passou: "{De} me passou {Coisa}.{Divida}",
    pagou: " A dívida está paga.",
    resta: " Ainda falta {Resto}.",
  }),
});

const A = A_TROCA_POR_TRANSACAO;
const Q = QUEM_TEM_O_QUE;
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const obj = (x) => (x != null && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const nomeDe = (r) => (typeof r === "string" ? r : (obj(r) && str(r.nome)) || "");
const curto = (r) => nomeDe(r).replace(/\s*\(.*\)\s*$/, "").trim();
const semAposto = (n) => str(n).split(",")[0].trim();
const tpl = (s, m) => str(s).replace(/\{(\w+)\}/g, (_, k) => str(m[k]));
const inteiro = (x) => { const n = Math.floor(Number(x)); return Number.isFinite(n) ? n : 0; };
const maiuscula = (s) => { const t = str(s).trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; };
/* a mesma régua da ponte do ouvido: igual, ou igual sem o plural */
const mesmaCoisa = (a, b) => { const x = sem(a), y = sem(b); return !!x && !!y && (x === y || x.replace(/s$/, "") === y.replace(/s$/, "")); };
/* a coisa dita casa com a coisa que alguém tem: igual, ou uma começa pela outra («corda» → «Corda que sempre volta») */
const casaODito = (dito, nome) => { const x = sem(dito), y = sem(nome); return !!x && !!y && (mesmaCoisa(x, y) || y.startsWith(x + " ") || y.startsWith(x.replace(/s$/, "") + " ")); };

/* ---------------- O LADO ----------------
   oLadoDaTroca(nome, ctx, coisa) → id
   ctx: { l (a leitura), grupo, bancas, pessoas (a cena, com ids), v (o
   veredito: comprado, comprados, vendido) }. `coisa`: o nome da coisa que
   esse lado entrega ou recebe (a banca que a tem no estoque é o lado). */
export function oLadoDaTroca(nome, ctx, coisa, sentido) {
  const c = obj(ctx) || {};
  const n = semAposto(str(nome).trim());
  if (n === "heroi") return "heroi";
  if (!n) return "nada";
  const l = obj(c.l) || {};
  const v = obj(c.v) || {};
  const g = arr(c.grupo).find((x) => obj(x) && !x.invocada && (sem(nomeDe(x)) === sem(n) || sem(nomeDe(x)).split(" ")[0] === sem(n).split(" ")[0]));
  if (g) return idDe(g, "grupo") || "nada";
  const bancas = arr(c.bancas).filter(obj);
  /* a banca que vendeu (a baixa no estoque) ou que compra (a oferta do mercado) */
  const comprados = [...(obj(v.comprado) ? [v.comprado] : []), ...arr(v.comprados).filter(obj)];
  if (sentido === "deles" && coisa) {
    const cp = comprados.find((x) => x.banca && mesmaCoisa(curto(x.nome), coisa));
    if (cp) return Q.lados.banca + cp.banca;
  }
  const quemDito = semAposto(str(l.quem).trim());
  /* quem paga a venda é quem fez a oferta (ofertaDe: a banca do mercado), seja quem for o nomeado que atende */
  if (sentido === "paraEles" && obj(v.vendido) && str(v.vendido.banca)) return Q.lados.banca + v.vendido.banca;
  /* a banca que tem a coisa no estoque: a de nome igual primeiro; a casa e o balcão (sem id) são o mundo */
  if (sentido === "deles" && coisa) {
    const temNoEstoque = (b) => arr(b.estoque).some((e) => mesmaCoisa(curto(e), coisa) || casaODito(coisa, curto(e)));
    const b = bancas.find((x) => sem(semAposto(nomeDe(x))) === sem(n) && temNoEstoque(x))
      || (!bancas.some((x) => sem(semAposto(nomeDe(x))) === sem(n)) ? bancas.find(temNoEstoque) : null);
    if (b) return b.id != null && str(b.id) ? Q.lados.banca + str(b.id) : Q.lados.mundo;
  }
  if (quemDito && sem(quemDito) === sem(n) && str(l.quemId)) return str(l.quemId);
  const b2 = bancas.find((x) => sem(semAposto(nomeDe(x))) === sem(n));
  if (b2) return b2.id != null && str(b2.id) ? Q.lados.banca + str(b2.id) : Q.lados.mundo;
  const p = arr(c.pessoas).find((x) => obj(x) && str(x.id) && sem(semAposto(x.nome)) === sem(n));
  if (p) return str(p.id);
  const p1 = arr(c.pessoas).filter((x) => obj(x) && str(x.id) && sem(semAposto(x.nome)).split(" ")[0] === sem(n).split(" ")[0]);
  if (p1.length === 1) return str(p1[0].id);
  return idDe({ nome: n }, "registo") || "nada";
}

/* ---------------- O LADO DO HERÓI: a ficha de antes e a de depois ----------------
   o que saiu (o nome exato e de onde) e o que entrou (o objeto, o destino) */
function oQueMudouNaFicha(antes, depois) {
  const a = obj(antes) || {}, d = obj(depois) || {};
  const tirou = (x, y) => { const resto = [...arr(y)]; const fora = []; for (const it of arr(x)) { const k = resto.findIndex((r) => nomeDe(r) === nomeDe(it)); if (k >= 0) resto.splice(k, 1); else fora.push(it); } return fora; };
  const sup = (f) => obj(f.suprimentos) || {};
  const usos = {};
  for (const k of new Set([...Object.keys(sup(a)), ...Object.keys(sup(d))])) { const n = inteiro(sup(d)[k]) - inteiro(sup(a)[k]); if (n && Q.usos.includes(k)) usos[k] = n; }
  return {
    saiu: [...tirou(a.inventario, d.inventario), ...tirou(a.equipamento, d.equipamento)],
    entrou: [...tirou(d.inventario, a.inventario).map((x) => ({ x, destino: "inventario" })), ...tirou(d.equipamento, a.equipamento).map((x) => ({ x, destino: "equipamento" }))],
    usos,
    usoBooleano: Object.keys(sup(d)).some((k) => !Q.usos.includes(k) && sup(d)[k] !== sup(a)[k]),
  };
}
const usoDoNome = (nome) => { const n = sem(nome); if (Q.usos.includes(n)) return n; const k = Object.keys(A.deUso).find((x) => n === sem(x) || n.replace(/s$/, "") === sem(x)); return k ? A.deUso[k] : ""; };

/* ---------------- A CHAVE ----------------
   estável por turno, por ação (a frase e a profundidade) e por posição */
export function aChaveDaTroca(base, i) {
  const b = obj(base) || {};
  const h = hashSemente(`${inteiro(b.turno)}|${sem(b.frase)}|${inteiro(b.profundidade)}`).toString(36);
  return `${A.chave}|${inteiro(b.turno)}|${h}|${inteiro(i)}`;
}

/* ============================================================
   asTransacoesDoVeredito(v, ctx) → [transação] (vazia: não se traduz)
   v: o veredito aplicado da porta (o de aTrocaDoOuvido: tipo, ficha,
   mudou, comprado, comprados, vendido). ctx: { l (a leitura), ficha (a de
   antes), grupo, bancas, pessoas, posses, mercado, base: { turno, frase,
   profundidade } }. A lista vem na ordem em que se aplica.
   ============================================================ */
export function asTransacoesDoVeredito(v, ctx) {
  try {
    const V0 = obj(v), c = obj(ctx) || {};
    if (!V0 || V0.estado !== "aplicada" || !obj(V0.ficha)) return [];
    const l = obj(c.l) || {};
    const s = str(l.subtipo);
    const fichaAntes = obj(c.ficha) || {};
    const dif = oQueMudouNaFicha(fichaAntes, V0.ficha);
    /* um uso que não é contável (o kit) não cabe numa transação: fica de fora, e quem chama sabe */
    if (dif.usoBooleano) return [];
    const ctxL = { ...c, v: V0 };
    const linhas = arr(V0.mudou).filter(obj).map((m) => ({ ...m, quantos: Math.max(1, inteiro(m.quantos) || 1) }));
    if (!linhas.length) return [];
    let saiu = [...dif.saiu], entrou = [...dif.entrou];
    const usos = { ...dif.usos };
    /* cada linha do veredito vira uma ponta: { lado, oQue, sentido } */
    const pontas = [];
    for (const m of linhas) {
      const moeda = str(m.coisa) === "moedas";
      if (m.de === "heroi") {
        let oQue = null;
        if (moeda) oQue = { tipo: "moedas", nome: "moedas", quantos: m.quantos };
        else {
          const k = saiu.findIndex((x) => mesmaCoisa(curto(x), m.coisa) || mesmaCoisa(nomeDe(x), m.coisa));
          if (k >= 0) { oQue = { tipo: "item", nome: nomeDe(saiu[k]), quantos: 1 }; const n = m.quantos; saiu = saiu.filter((_, j) => j !== k); if (n > 1) { const mais = saiu.filter((x) => mesmaCoisa(curto(x), m.coisa)).slice(0, n - 1); oQue.quantos = 1 + mais.length; saiu = saiu.filter((x) => !mais.includes(x)); } }
          else { const u = Q.usos.includes(m.coisa) ? m.coisa : usoDoNome(m.coisa); if (u && inteiro(usos[u]) < 0) { oQue = { tipo: "uso", nome: u, quantos: Math.min(m.quantos, -inteiro(usos[u])) }; usos[u] += oQue.quantos; } }
        }
        if (!oQue) return [];
        pontas.push({ sai: true, outro: oLadoDaTroca(m.para, ctxL, m.coisa, "paraEles"), nomeOutro: semAposto(m.para), oQue });
      } else if (m.para === "heroi") {
        let oQue = null;
        if (moeda) oQue = { tipo: "moedas", nome: "moedas", quantos: m.quantos };
        else {
          const u = Q.usos.includes(m.coisa) ? m.coisa : usoDoNome(m.coisa);
          const k = entrou.findIndex((e) => mesmaCoisa(curto(e.x), m.coisa) || mesmaCoisa(nomeDe(e.x), m.coisa) || casaODito(m.coisa, nomeDe(e.x)));
          if (k >= 0) {
            const e = entrou[k];
            const iguais = entrou.filter((y) => nomeDe(y.x) === nomeDe(e.x)).slice(0, m.quantos);
            entrou = entrou.filter((y) => !iguais.includes(y));
            oQue = { tipo: "item", nome: nomeDe(e.x), quantos: iguais.length, item: e.x, destino: e.destino };
          } else {
            /* o uso pela linha do veredito, ou o que entrou nos suprimentos (o balcão diz o uso pelo id) */
            const uu = (u && inteiro(usos[u]) > 0) ? u : Object.keys(usos).find((x) => inteiro(usos[x]) > 0) || "";
            if (uu) { oQue = { tipo: "uso", nome: uu, quantos: Math.min(m.quantos, inteiro(usos[uu])) }; usos[uu] -= oQue.quantos; }
          }
        }
        /* o que entrou e não ficou (o prato da casa, consumido à mesa): só a moeda conta */
        pontas.push({ sai: false, outro: oLadoDaTroca(m.de, ctxL, m.coisa, "deles"), nomeOutro: semAposto(m.de), oQue, consumido: !oQue });
      } else return [];
    }
    /* o que saiu da ficha e o veredito não pôs em linha (ao companheiro, pelo grupo): não se traduz */
    if (saiu.length) return [];
    /* a moeda acompanha a coisa: quem vende ou compra a coisa (a banca, o balcão) é quem recebe ou paga a moeda */
    for (const p of pontas) {
      if (!p.oQue || p.oQue.tipo !== "moedas") continue;
      const par = pontas.find((x) => x !== p && x.sai !== p.sai && (!x.oQue || x.oQue.tipo !== "moedas") && sem(x.nomeOutro) === sem(p.nomeOutro));
      if (par) p.outro = par.outro;
    }

    const cons0 = A.consentimento[s] || Q.consentimentoPadrao;
    const transacoes = [];
    const comPrazo = A.comPrazo.includes(s);
    /* agrupa por quem está do outro lado: a coisa principal leva a contrapartida */
    const porOutro = new Map();
    for (const p of pontas) { if (!porOutro.has(p.outro)) porOutro.set(p.outro, []); porOutro.get(p.outro).push(p); }
    for (const [outro, ps] of porOutro) {
      const vai = ps.filter((p) => p.sai), vem = ps.filter((p) => !p.sai && p.oQue);
      const moedaVai = vai.filter((p) => p.oQue.tipo === "moedas"), coisaVai = vai.filter((p) => p.oQue.tipo !== "moedas");
      const moedaVem = vem.filter((p) => p.oQue.tipo === "moedas"), coisaVem = vem.filter((p) => p.oQue.tipo !== "moedas");
      const soma = (lista) => lista.reduce((n, p) => n + p.oQue.quantos, 0);
      const moedas = (n) => ({ tipo: "moedas", nome: "moedas", quantos: n });
      if (coisaVem.length && (moedaVai.length || coisaVai.length) && !coisaVai.length) {
        /* comprar: a coisa vem, a moeda vai — cada coisa pelo preço dela no estoque, o resto na primeira */
        const total = soma(moedaVai);
        const precos = coisaVem.map((p) => { const b = arr(c.bancas).find((x) => obj(x) && (Q.lados.banca + str(x.id)) === outro); const e = b && arr(b.estoque).find((y) => nomeDe(y) === p.oQue.nome || mesmaCoisa(curto(y), p.oQue.nome)); return e ? inteiro(e.preco) * p.oQue.quantos : 0; });
        const outrasSoma = precos.slice(1).reduce((n, x) => n + x, 0);
        coisaVem.forEach((p, i) => {
          const q = i === 0 ? total - (outrasSoma <= total ? outrasSoma : 0) : (outrasSoma <= total ? precos[i] : 0);
          transacoes.push({ de: outro, para: "heroi", oQue: p.oQue, contra: q > 0 ? moedas(q) : null, consentimento: "pedido" });
        });
      } else if (coisaVem.length && coisaVai.length) {
        /* escambo: a coisa do herói vai, a do outro vem */
        transacoes.push({ de: "heroi", para: outro, oQue: coisaVai[0].oQue, contra: coisaVem[0].oQue, consentimento: cons0 === "pedido" ? "dado" : cons0 });
        for (const p of coisaVai.slice(1)) transacoes.push({ de: "heroi", para: outro, oQue: p.oQue, contra: null, consentimento: "dado" });
        for (const p of coisaVem.slice(1)) transacoes.push({ de: outro, para: "heroi", oQue: p.oQue, contra: null, consentimento: "pedido" });
        if (moedaVai.length) transacoes.push({ de: "heroi", para: outro, oQue: moedas(soma(moedaVai)), contra: null, consentimento: "dado" });
      } else if (coisaVai.length && moedaVem.length) {
        /* vender: a coisa vai, a moeda vem — a moeda inteira na primeira */
        coisaVai.forEach((p, i) => transacoes.push({ de: "heroi", para: outro, oQue: p.oQue, contra: i === 0 ? moedas(soma(moedaVem)) : null, consentimento: "dado" }));
      } else if (vai.length && !vem.length) {
        /* dar, emprestar, devolver, pagar: só vai */
        for (const p of vai) transacoes.push({ de: "heroi", para: outro, oQue: p.oQue, contra: null, consentimento: cons0 === "pedido" || cons0 === "tomado" ? "dado" : cons0, ...(comPrazo ? { prazo: A.prazoDoEmprestimo } : {}) });
      } else if (vem.length && !vai.length) {
        /* pedir ao companheiro, receber: só vem */
        for (const p of vem) transacoes.push({ de: outro, para: "heroi", oQue: p.oQue, contra: null, consentimento: cons0 === "dado" ? "pedido" : cons0 });
      } else if (!vem.length && vai.length) {
        for (const p of vai) transacoes.push({ de: "heroi", para: outro, oQue: p.oQue, contra: null, consentimento: "dado" });
      } else return [];
    }
    /* a dívida decide quem paga e quem devolve */
    const finais = [];
    for (const t of transacoes) finais.push(...comADivida(t, s, c));
    const base = obj(c.base) || {};
    return finais.map((t, i) => Object.freeze({ ...t, origem: A.origem, chave: aChaveDaTroca(base, i) }));
  } catch { return []; }
}

/* pagar ou devolver a quem se deve é `devido` (até o devido; o que passa vai como dado); devolver sem
   dívida, à banca de onde a coisa saiu, é entrega de volta; sem nenhuma das duas, fica `devido` e a
   estrutura recusa */
function comADivida(t, s, c) {
  /* o que vem ao herói de quem o deve (o companheiro devolvendo o emprestado) paga a dívida */
  if (t.para === "heroi" && !t.contra) {
    const deve = dividasDe(c.posses, "heroi").aReceber.filter((d) => d.de === t.de && d.oQue.tipo === t.oQue.tipo && (t.oQue.tipo === "moedas" || mesmaCoisa(d.oQue.nome, t.oQue.nome))).reduce((n, d) => n + d.quanto, 0);
    if (deve >= t.oQue.quantos) return [{ ...t, consentimento: "devido" }];
  }
  if (!A.pagaDivida.includes(s) || t.de !== "heroi") return [t];
  const abertas = dividasDe(c.posses, "heroi").deve.filter((d) => d.para === t.para && d.oQue.tipo === t.oQue.tipo && (t.oQue.tipo === "moedas" || mesmaCoisa(d.oQue.nome, t.oQue.nome)));
  const devido = abertas.reduce((n, d) => n + d.quanto, 0);
  if (devido > 0) {
    if (t.oQue.quantos <= devido) return [{ ...t, consentimento: "devido" }];
    return [{ ...t, oQue: { ...t.oQue, quantos: devido }, consentimento: "devido" }, { ...t, oQue: { ...t.oQue, quantos: t.oQue.quantos - devido }, consentimento: "dado" }];
  }
  if (s === "pagar") return [{ ...t, consentimento: "dado" }];
  /* devolver: a coisa que saiu de uma banca (comprados) volta para ela */
  const comprados = obj(obj(c.mercado) && c.mercado.comprados) || {};
  if (t.oQue.tipo === "item") {
    const daBanca = arr(c.bancas).filter((b) => obj(b) && str(b.id)).find((b) => arr(comprados[b.id]).some((n) => mesmaCoisa(n, t.oQue.nome)));
    const outroEhBanca = str(t.para).startsWith(Q.lados.banca);
    if (daBanca && (!outroEhBanca || t.para === Q.lados.banca + daBanca.id)) return [{ ...t, para: Q.lados.banca + daBanca.id, consentimento: "dado" }];
  }
  return [{ ...t, consentimento: "devido" }];
}

/* ============================================================
   aCobrancaDaLeitura(l, ctx) → null | { transacoes, devido }
   O outro → o herói, quando a coisa é devida: «cobro as cinco moedas da
   Prudence», «Bram, me devolve a corda». Com dívida aberta daquela pessoa
   com o herói, daquela coisa: a transação `devido` (a quantia dita, ou a
   dívida inteira). Sem dívida: o subtipo que só existe pela dívida (cobrar)
   vai assim mesmo, e a estrutura recusa; o pedido segue o caminho de hoje
   (null). ctx: { posses, grupo, bancas, pessoas, base }.
   ============================================================ */
export function aCobrancaDaLeitura(l0, ctx) {
  try {
    const l = obj(l0), c = obj(ctx) || {};
    if (!l || !A.cobra.includes(str(l.subtipo)) || l.companheiro) return null;
    const quem = semAposto(str(l.quem).trim());
    if (!quem) return null;
    const de = oLadoDaTroca(quem, { ...c, l }, null, "pessoa");
    if (!de || de === "nada" || de === "heroi") return null;
    const moeda = l.coisaTipo === "moeda" || (!str(l.coisa) && Number(l.quantia) > 0) || sem(l.coisa) === "moeda" || sem(l.coisa) === "moedas";
    const abertas = dividasDe(c.posses, "heroi").aReceber.filter((d) => d.de === de && (moeda ? d.oQue.tipo === "moedas" : d.oQue.tipo !== "moedas" && casaODito(l.coisa, d.oQue.nome)));
    const devido = abertas.reduce((n, d) => n + d.quanto, 0);
    if (!devido && str(l.subtipo) !== "cobrar") return null;
    if (!moeda && !str(l.coisa) && !devido) return { transacoes: [], devido: 0, semCoisa: true };
    const quantos = moeda ? (Number(l.quantia) > 0 && l.quantiaDe !== "coisa" ? inteiro(l.quantia) : devido || 1) : Math.max(1, l.quantiaDe === "coisa" ? inteiro(l.quantia) || 1 : devido || 1);
    const nome = moeda ? "moedas" : (abertas[0] ? abertas[0].oQue.nome : maiuscula(str(l.coisa)));
    const oQue = moeda ? { tipo: "moedas", nome, quantos } : { tipo: abertas[0] ? abertas[0].oQue.tipo : "item", nome, quantos };
    const base = obj(c.base) || {};
    return { transacoes: [Object.freeze({ de, para: "heroi", oQue, contra: null, consentimento: "devido", origem: A.origem, chave: aChaveDaTroca(base, 0) })], devido, nome: quem };
  } catch { return null; }
}

/* ============================================================
   aTransacaoDoPedido(l, ctx) → [transação] (o caminho do dado: o pedido e o
   tomar de alguém da cena, com a coisa que essa pessoa TEM — pela posse, e
   não por lista). ctx: o de aCobrancaDaLeitura, mais { ficha, posse (o ctx
   de aplicarTransacao) }. Sem quem, sem coisa, ou a pessoa sem a coisa: a
   lista vazia (o caminho de hoje segue).
   ============================================================ */
export function aTransacaoDoPedido(l0, intencao, ctx) {
  try {
    const l = obj(l0), it = obj(intencao), c = obj(ctx) || {};
    if (!l || !it || !A.dadoComTransacao.includes(str(it.tipo)) || l.companheiro) return [];
    const quem = semAposto(str(l.quem).trim());
    if (!quem) return [];
    const de = oLadoDaTroca(quem, { ...c, l }, null, "pessoa");
    if (!de || ["nada", "heroi", "mundo"].includes(de)) return [];
    const cons = str(it.tipo) === "tomar" ? "tomado" : "pedido";
    const moeda = l.coisaTipo === "moeda";
    let oQue = null;
    if (moeda) { if (!(Number(l.quantia) > 0)) return []; oQue = { tipo: "moedas", nome: "moedas", quantos: inteiro(l.quantia) }; }
    else {
      const coisa = str(l.coisa || it.coisa);
      if (!coisa) return [];
      const p = posseDe(de, c.posses, c.ficha, c.posse);
      const achada = arr(p.itens).find((x) => casaODito(coisa, nomeDe(x)));
      oQue = achada ? { tipo: "item", nome: nomeDe(achada), quantos: 1 } : { tipo: "item", nome: maiuscula(coisa), quantos: 1 };
    }
    return [Object.freeze({ de, para: "heroi", oQue, contra: null, consentimento: cons, origem: A.origem, chave: aChaveDaTroca(obj(c.base) || {}, 0) })];
  } catch { return []; }
}

/* ============================================================
   aplicarAsTransacoes(posses, ficha, transacoes, ctx) →
     { ok, motivo, texto, falhou, ficha, posses, chao, mercado, mudou, fatos }
   Uma depois da outra, cada uma com o estado que a anterior deixou; se uma
   recusa, NENHUMA vale (tudo volta como veio). A chave já aplicada recusa
   com `jaAplicada`: quem chama não aplica de novo.
   ============================================================ */
export function aplicarAsTransacoes(posses, ficha, transacoes, ctx) {
  const c = obj(ctx) || {};
  const lista = arr(transacoes).filter(obj);
  const volta = (r, t) => ({ ok: false, motivo: r.motivo, texto: r.texto || Q.motivos[r.motivo] || "", falhou: t || null, ficha, posses, chao: c.chao === undefined ? null : c.chao, mercado: c.mercado === undefined ? null : c.mercado, mudou: [], fatos: [] });
  if (!lista.length) return volta({ motivo: "invalida" }, null);
  let P = posses, F = ficha, chao = c.chao, mercado = c.mercado;
  const mudou = [], fatos = [];
  for (const t of lista) {
    let r;
    try { r = aplicarTransacao(P, F, t, { ...c, chao, mercado }); } catch { r = { ok: false, motivo: "invalida" }; }
    if (!r || !r.ok) {
      /* quem falhou: se sem a contrapartida a coisa passaria, foi o outro lado que não tinha com que pagar */
      let quem = t;
      if (r && t.contra && ["naoTem", "emUso"].includes(r.motivo)) {
        let r2 = null;
        try { r2 = aplicarTransacao(P, F, { ...t, contra: null, chave: "" }, { ...c, chao, mercado, aceito: true, dado: { passou: true } }); } catch { r2 = null; }
        if (r2 && r2.ok) quem = { ...t, de: t.para, para: t.de, oQue: t.contra, contra: null };
      }
      return volta(r || { motivo: "invalida" }, quem);
    }
    P = r.posses; F = r.ficha; chao = r.chao; mercado = r.mercado;
    mudou.push(...arr(r.mudou)); if (r.fato) fatos.push(r.fato);
  }
  return { ok: true, motivo: "", texto: "", falhou: null, ficha: F, posses: P, chao: chao === undefined ? null : chao, mercado: mercado === undefined ? null : mercado, mudou, fatos };
}

/* ---------------- O QUE O JOGADOR LÊ ---------------- */
const aCoisa = (o) => { const x = obj(o) || {}; return x.tipo === "moedas" ? tpl(A.moeda, { N: inteiro(x.quantos) }) : inteiro(x.quantos) > 1 ? `${inteiro(x.quantos)} ${str(x.nome)}` : str(x.nome); };
function oNome(id, nomes, papel) {
  if (id === "heroi") return papel === "sujeito" ? A.voce.sujeito : A.voce.objeto;
  const n = obj(nomes) && str(nomes[id]);
  if (n) return n;
  return str(id).split("|").pop().split("~")[0] || "alguém";
}
/* nomesDasTransacoes(v, ctx) → { id: nome } — o nome que o veredito disse para cada lado */
export function nomesDasTransacoes(v, transacoes, l) {
  const nomes = {};
  const V0 = obj(v) || {};
  for (const m of arr(V0.mudou).filter(obj)) for (const k of ["de", "para"]) { const n = semAposto(m[k]); if (n && n !== "heroi") { for (const t of arr(transacoes)) { const id = k === "de" ? t.de : t.para; if (id !== "heroi" && !nomes[id]) nomes[id] = n; } } }
  const L = obj(l) || {};
  if (L.quemId && L.quem) nomes[L.quemId] = semAposto(L.quem);
  return nomes;
}

/* oVereditoDaRecusa(res, nomes, veto) → o veredito negado, na forma de oVereditoDaTroca */
export function oVereditoDaRecusa(res, nomes, veto) {
  const r = obj(res) || {};
  const t = obj(r.falhou) || {};
  const de = oNome(t.de, nomes, "sujeito"), para = oNome(t.para, nomes, "objeto");
  const Coisa = aCoisa(t.oQue);
  const tela = A.tela[r.motivo] || A.tela.outro;
  const linha = maiuscula(tpl(tela, { De: maiuscula(de), Para: t.para === "heroi" ? A.voce.objeto : para, Coisa, texto: str(r.texto) || Q.motivos.invalida }));
  const semEmoji = linha.replace(/^\S+\s+/, "");
  return Object.freeze({ tipo: "transacao", estado: "negada", ficha: null, mudou: Object.freeze([]), motivo: str(r.motivo), linha, fato: tpl(A.fato.recusa, { Linha: semEmoji.replace(/: nada muda de mão\.$/, ".") }), veto: Object.freeze(veto ? [veto] : []) });
}

/* oVereditoDoQueVeio(res, t, nomes, veto, posses) → o veredito de quem passou a coisa ao herói
   (a cobrança e o pedido pelo dado): a linha de sempre da mão que entrega, e a dívida que fechou */
export function oVereditoDoQueVeio(res, nomes, veto, devida) {
  const r = obj(res) || {};
  if (!r.ok) return null;
  const linhas = arr(r.mudou).filter((m) => m.para === "heroi");
  const quem = linhas[0] ? linhas[0].de : "";
  const Coisa = linhas.map((m) => (m.coisa === "moedas" ? tpl(A.moeda, { N: m.quantos }) : m.coisa)).join(" e ");
  const restoDe = (P) => dividasDe(P, "heroi").aReceber.filter((d) => d.de === quem).reduce((n, d) => n + d.quanto, 0);
  const deviaAntes = devida === true;
  const resto = restoDe(r.posses);
  const Divida = !deviaAntes ? "" : resto ? tpl(A.tela.resta, { Resto: tpl(A.moeda, { N: resto }) }) : A.tela.pagou;
  const De = maiuscula(oNome(quem, nomes, "sujeito"));
  return Object.freeze({ tipo: "transacao", estado: "aplicada", ficha: r.ficha, mudou: Object.freeze(linhas), linha: tpl(A.tela.passou, { De, Coisa, Divida }), fato: tpl(A.fato.passou, { De, Coisa, Divida: !deviaAntes ? "" : resto ? tpl(A.fato.resta, { Resto: tpl(A.moeda, { N: resto }) }) : A.fato.pagou }), veto: Object.freeze(veto ? [veto] : []) });
}
