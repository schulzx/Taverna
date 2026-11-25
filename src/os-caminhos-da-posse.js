/* ============================================================
   OS CAMINHOS DA POSSE (24/11/2026, etapa 7 da planta
   mente/plano-identidade-e-posse.md)

   A ordem da pessoa, 23/11: «construir o sistema que resolve a classe
   inteira, não a regra do caso». A etapa 6 pôs a troca DIGITADA a passar
   por aplicarTransacao (quem-tem-o-que.js); fora dela, cada caminho que
   muda posse escrevia a ficha do seu jeito, e o registro de posse não
   ficava sabendo: a moeda que a banca recebe por botão não entrava no
   caixa dela, a coisa que a quest pôs na mão do herói não tinha dono (e
   devolvê-la a quem a guardava era recusado: «não há dívida disso»), e o
   butim do furto saía de um sorteio à parte, e não da posse da vítima.

   Este módulo é UM PRODUTOR DE TRANSAÇÃO POR CAMINHO. Nenhum deles
   aplica nada: devolvem transações

     { de, para, oQue, contra, consentimento, prazo?, origem, chave }

   que quem chama aplica pela porta única (aplicarAsTransacoes, a mesma
   função e o mesmo ctx da etapa 6). `mundo` é a fonte do que o sistema dá
   (a paga da quest, o espólio, o achado — decisão 3 da planta: recompensa
   e loot não saem da bolsa de ninguém); `nada` é o destino do que se
   consome. A `chave` é a identidade da transação: a mesma chave não aplica
   duas vezes (é o que mata a paga e o débito em dobro pela estrutura).

   ---------------- A COISA DA QUEST TEM DONO ----------------
   Uma quest põe no mundo uma coisa (o papel `de: "item"`). De quem ela é
   sai do que a quest já diz, sem campo novo e sem nome:
     1. o papel de gente onde a coisa NASCE (`nasce: "<papel>"`);
     2. senão, o papel de gente que a escolha que tira a coisa da bolsa
        (`sai_da_bolsa`) deixa grato — afeição ou vínculo que sobem,
        aliado, laço (a tabela `agradece`). Um só: dois são dúvida, e a
        dúvida não vira dono.
   Enquanto a coisa está com o herói, ele a deve ao dono: a dívida é
   DERIVADA a cada leitura (comAsDividasDaQuest), e por isso vale igual num
   save antigo, em que a coisa já está na ficha e o registro nunca soube
   dela. Ela não se grava aberta (semAsDividasDerivadas tira as abertas
   antes de gravar); grava-se só a quitação — a devolução que a fechou —,
   e a dívida quitada não volta a nascer.

   PURO E DETERMINÍSTICO. Nenhum relógio, nenhuma sorte; o que entra nunca
   é mutado; o `null` e o lixo dão a lista vazia, nunca uma exceção.
   ============================================================ */
import { questPorId } from "./biblioteca-de-quests.js";
import { O_VEREDITO_DA_TROCA } from "./o-veredito-da-troca.js";
import { QUEM_TEM_O_QUE, garantirPosses } from "./quem-tem-o-que.js";
import { idDe } from "./quem-e-quem.js";
import { hashSemente } from "./semente.js";

/* ---------------- A TABELA ----------------
   `gente`: os `de` de papel que são pessoa (PAPEIS_DA_QUEST). `agradece`:
   o efeito de uma escolha que diz que o papel recebe a coisa de bom grado
   → o menor `n` que conta (0: o efeito sem número). `divida`: o prefixo do
   id da dívida derivada e a origem dela. `chave`: o começo da chave de
   cada caminho. `origem`: o que vai no campo `origem` da transação (lê-se
   no log e no fato). `artigos`: o que se tira do começo do nome da coisa
   da quest («o livro dos nomes» é o «Livro dos nomes» da ficha). */
export const OS_CAMINHOS_DA_POSSE = Object.freeze({
  v: 1,
  gente: Object.freeze(["elenco", "fio", "grupo"]),
  agradece: Object.freeze({ afeicao: 1, vinculo: 1, aliado: 0, laco: 0 }),
  divida: Object.freeze({ prefixo: "div|quest|", origem: "a coisa da quest" }),
  artigos: Object.freeze(["o", "a", "os", "as", "um", "uma"]),
  chave: Object.freeze({ furto: "furto", banca: "banca", balcao: "balcao", venda: "venda", paga: "paga", espolio: "espolio", achado: "achado", tarefa: "tarefa", mundo: "mundo", consumo: "consumo" }),
  origem: Object.freeze({
    furto: "o furto", banca: "a compra na banca", balcao: "a compra no balcão", venda: "a venda por botão",
    paga: "a paga da quest", espolio: "o espólio da luta", achado: "o achado", tarefa: "a paga da tarefa", mundo: "o que o sistema dá", consumo: "o que se gasta",
  }),
});

const C = OS_CAMINHOS_DA_POSSE;
const Q = QUEM_TEM_O_QUE;
const V = O_VEREDITO_DA_TROCA;
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const obj = (x) => (x != null && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const nomeDe = (r) => (typeof r === "string" ? r : (obj(r) && str(r.nome)) || "");
const inteiro = (x) => { const n = Math.floor(Number(x)); return Number.isFinite(n) ? n : 0; };
const tpl = (s, m) => str(s).replace(/\{(\w+)\}/g, (_, k) => str(m[k]));
const maiuscula = (s) => { const t = str(s).trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; };
const semArtigo = (n) => { const ps = sem(n).split(" "); if (ps.length > 1 && C.artigos.includes(ps[0])) ps.shift(); return ps.join(" "); };
/* a coisa dita casa com a coisa que alguém tem: igual sem artigo, ou uma começa pela outra */
const casaACoisa = (a, b) => { const x = semArtigo(a), y = semArtigo(b); return !!x && !!y && (x === y || y.startsWith(x + " ") || x.startsWith(y + " ") || x.replace(/s$/, "") === y.replace(/s$/, "")); };
const h36 = (s) => hashSemente(str(s)).toString(36);

/* a chave de um caminho: o caminho, o turno e a identidade do que muda */
export function aChaveDoCaminho(caminho, turno, ...partes) {
  const base = C.chave[caminho] || C.chave.mundo;
  return `${base}|${inteiro(turno)}|${h36(partes.map((p) => sem(typeof p === "string" ? p : JSON.stringify(p == null ? "" : p))).join("|"))}`.slice(0, Q.teto.chave);
}

/* ============================================================
   A COISA DA QUEST
   oDonoDaCoisa(quest, papel) → "" | o nome do papel de gente que a possui
   ============================================================ */
export function oDonoDaCoisa(quest, papel) {
  try {
    const q = obj(quest);
    const ps = obj(q && q.papeis);
    const p = obj(ps && ps[papel]);
    if (!p || p.de !== "item") return "";
    const ehGente = (k) => !!obj(ps[k]) && C.gente.includes(ps[k].de);
    if (typeof p.nasce === "string" && ehGente(p.nasce)) return p.nasce;
    const gratos = new Set();
    for (const e of Object.values(obj(q.escolhas) || {})) {
      for (const o of Object.values(obj(obj(e) && e.opcoes) || {})) {
        const efs = arr(obj(o) && o.efeitos).filter(obj);
        if (!efs.some((f) => f.tipo === "sai_da_bolsa" && f.papel === papel)) continue;
        for (const f of efs) {
          if (!Object.prototype.hasOwnProperty.call(C.agradece, f.tipo) || typeof f.papel !== "string" || !ehGente(f.papel)) continue;
          const min = C.agradece[f.tipo];
          if (min > 0 && !(inteiro(f.n) >= min)) continue;
          gratos.add(f.papel);
        }
      }
    }
    return gratos.size === 1 ? [...gratos][0] : "";
  } catch { return ""; }
}

/* o id de quem ocupa o papel: o que a quest guardou; a pessoa da cena com esse id, ou a única da cena
   com o nome dele (o id que a troca vai usar); senão o do registo */
function oIdDoPapel(p, ctx) {
  const id = str(p.id).trim();
  const cena = obj(ctx.pessoas) || {};
  if (id && Object.prototype.hasOwnProperty.call(cena, id)) return id;
  const iguais = Object.keys(cena).filter((k) => obj(cena[k]) && sem(cena[k].nome) && sem(cena[k].nome).split(",")[0].trim() === sem(p.nome));
  if (iguais.length === 1) return iguais[0];
  if (id && id.includes("|")) return id;
  return str(p.nome).trim() ? idDe({ nome: str(p.nome).trim() }, "registo") || "" : "";
}

/* ============================================================
   asCoisasDaQuest(registos, ctx) → [{ quest, papel, coisa, dono, donoPapel, nomeDoDono }]
   registos: os da espinha (garantirQuestsDaEspinha(...).registos — { id,
   papeis: { papel: { nome, id? } } }). ctx: { pessoas: { id: { nome } },
   questPorId? }. Só a coisa que tem dono pela régua de oDonoDaCoisa.
   ============================================================ */
export function asCoisasDaQuest(registos, ctx) {
  try {
    const c = obj(ctx) || {};
    const porId = typeof c.questPorId === "function" ? c.questPorId : questPorId;
    const out = [];
    for (const R of arr(registos).filter(obj)) {
      const q = porId(str(R.id));
      if (!obj(q)) continue;
      const papeis = obj(R.papeis) || {};
      for (const papel of Object.keys(obj(q.papeis) || {})) {
        const donoPapel = oDonoDaCoisa(q, papel);
        if (!donoPapel) continue;
        const coisa = obj(papeis[papel]) ? str(papeis[papel].nome).trim() : str((q.papeis[papel] || {}).nome).trim();
        const pd = obj(papeis[donoPapel]);
        if (!coisa || !pd || !str(pd.nome).trim()) continue;
        const dono = oIdDoPapel(pd, c);
        if (!dono || dono === Q.lados.heroi) continue;
        out.push(Object.freeze({ quest: str(R.id), papel, coisa, dono, donoPapel, nomeDoDono: str(pd.nome).trim() }));
      }
    }
    return out;
  } catch { return []; }
}

/* o id da dívida derivada (estável: a quest e o papel) */
export const oIdDaDividaDaQuest = (quest, papel) => `${C.divida.prefixo}${str(quest)}|${str(papel)}`;

/* ============================================================
   comAsDividasDaQuest(posses, registos, ficha, ctx) → posses
   A dívida do herói com o dono de cada coisa da quest que está na mão dele
   (inventário ou equipamento; o que veste também é dele para devolver). A
   dívida que já existe (aberta, ou quitada por uma devolução) não nasce de
   novo. Nada a acrescentar: devolve o mesmo `posses` que entrou.
   ============================================================ */
export function comAsDividasDaQuest(posses, registos, ficha, ctx) {
  try {
    const F = obj(ficha);
    if (!F) return posses;
    const naMao = [...arr(F.inventario), ...arr(F.equipamento), ...Object.values(obj(F.equipados) || {})].map(nomeDe).filter(Boolean);
    if (!naMao.length) return posses;
    const P = garantirPosses(posses) || { v: Q.v, delta: {}, dividas: [], aplicadas: [] };
    const novas = [];
    for (const k of asCoisasDaQuest(registos, ctx)) {
      const id = oIdDaDividaDaQuest(k.quest, k.papel);
      if (P.dividas.some((d) => d.id === id) || novas.some((d) => d.id === id)) continue;
      const tem = naMao.filter((n) => casaACoisa(k.coisa, n));
      if (!tem.length) continue;
      novas.push({ id, de: Q.lados.heroi, para: k.dono, oQue: { tipo: "item", nome: tem[0], quantos: tem.length }, quanto: tem.length, dia: inteiro(obj(ctx) && ctx.dia), prazo: 0, estado: Q.estados.aberta, origem: C.divida.origem });
    }
    if (!novas.length) return posses;
    return garantirPosses({ ...P, dividas: [...novas, ...P.dividas] }) || posses;
  } catch { return posses; }
}

/* semAsDividasDerivadas(posses) → posses sem as dívidas da quest ainda abertas (a quitada fica) */
export function semAsDividasDerivadas(posses) {
  try {
    const P = garantirPosses(posses);
    if (!P) return posses;
    const fica = P.dividas.filter((d) => !(d.id.startsWith(C.divida.prefixo) && d.estado === Q.estados.aberta));
    if (fica.length === P.dividas.length) return posses;
    return garantirPosses({ ...P, dividas: fica });
  } catch { return posses; }
}

/* ============================================================
   O FURTO
   oFurtoPorTransacao({ vitima, coisa, posse, turno, frase }) →
     { transacoes, vazia, semACoisa }
   vitima: o id; posse: posseDe(vitima) (a posse de agora); coisa: o que a
   frase disse que se furta («a bolsa», «o anel», ""). O butim é o que a
   vítima TEM: a coisa nomeada, se ela a tem; a bolsa (ou nada dito), a
   moeda que ela carrega. Sem isso, a mão volta vazia — e nada se inventa.
   ============================================================ */
export function oFurtoPorTransacao(o) {
  const vazio = { transacoes: [], vazia: true, semACoisa: false };
  try {
    const c = obj(o) || {};
    const vitima = str(c.vitima).trim();
    if (!vitima || [Q.lados.heroi, Q.lados.mundo, Q.lados.nada].includes(vitima)) return vazio;
    const p = obj(c.posse) || {};
    const coisa = sem(c.coisa);
    const chave = aChaveDoCaminho("furto", c.turno, c.frase, vitima);
    const t = (oQue) => ({ transacoes: [Object.freeze({ de: vitima, para: Q.lados.heroi, oQue, contra: null, consentimento: "tomado", origem: C.origem.furto, chave })], vazia: false, semACoisa: false });
    if (coisa && !V.dinheiroDoBolso.test(coisa)) {
      const achada = arr(p.itens).find((x) => casaACoisa(coisa, nomeDe(x)));
      return achada ? t({ tipo: "item", nome: nomeDe(achada), quantos: 1 }) : { transacoes: [], vazia: false, semACoisa: true };
    }
    const moedas = inteiro(p.moedas);
    return moedas > 0 ? t({ tipo: "moedas", nome: "moedas", quantos: Math.min(moedas, Q.teto.quantos) }) : vazio;
  } catch { return vazio; }
}

/* oVereditoDoFurto(res, { alvo, coisa, vazia, semACoisa }) → o veredito, na forma de oVereditoDaTroca
   (a linha e o fato das tabelas de O_VEREDITO_DA_TROCA: a voz é a mesma de sempre) */
const nomeDoAlvo = (a) => maiuscula(str(a).split(",")[0]) || maiuscula(V.alvoSemNome);
const doAlvoDe = (a) => { const n = str(a).split(",")[0].trim() || V.alvoSemNome; const m = n.match(/^(o|a|os|as)\s+(.+)$/i); return m ? `${V.contracao[m[1].toLowerCase()]} ${m[2]}` : `de ${n}`; };
export function oVereditoDoFurto(res, o) {
  try {
    const c = obj(o) || {};
    const Alvo = nomeDoAlvo(c.alvo), doAlvo = doAlvoDe(c.alvo);
    const veto = [V.veto.furto];
    const negada = (motivo, linha, fato) => Object.freeze({ tipo: "furto", estado: "negada", ficha: null, mudou: Object.freeze([]), motivo, linha, fato, veto });
    if (c.semACoisa) return negada("semACoisa", tpl(V.tela.furtoSemACoisa, { Alvo, Coisa: str(c.coisa) }), tpl(V.fato.furtoSemACoisa, { Alvo, Coisa: str(c.coisa) }));
    const r = obj(res);
    if (c.vazia || !r || !r.ok) return negada("vazia", tpl(V.tela.furtoVazio, { Alvo, doAlvo }), tpl(V.fato.furtoVazio, { Alvo, doAlvo }));
    const linhas = arr(r.mudou).filter((m) => obj(m) && m.para === Q.lados.heroi);
    const moedas = linhas.filter((m) => m.coisa === "moedas").reduce((n, m) => n + inteiro(m.quantos), 0);
    const itens = linhas.filter((m) => m.coisa !== "moedas").map((m) => m.coisa);
    const ganho = [moedas ? `◉ ${moedas}` : "", ...itens].filter(Boolean).join(" e ");
    const mudou = [...(moedas ? [{ coisa: "moedas", quantos: moedas, de: Alvo, para: "heroi" }] : []), ...itens.map((x) => ({ coisa: x, quantos: 1, de: Alvo, para: "heroi" }))];
    const B = inteiro(obj(r.ficha) && r.ficha.moedas);
    return Object.freeze({ tipo: "furto", estado: "aplicada", ficha: r.ficha, mudou: Object.freeze(mudou), linha: tpl(V.tela.furto, { Alvo, doAlvo, Ganho: ganho, B }), fato: tpl(V.fato.furto, { Alvo, doAlvo, Ganho: ganho }), veto });
  } catch { return null; }
}

/* ============================================================
   A BANCA E O BALCÃO POR BOTÃO
   aCompraNaBanca({ banca, item, preco, destino, turno, n }) → [t]
     a coisa do estoque vem da banca ao herói, a moeda vai do herói à banca
     (o caixa dela cresce: `mercado.gastos` do dia desce). O que a banca
     vendeu sai do estoque por `mercado.comprados`, como sempre.
   oPagamentoABanca({ banca, preco, turno, oQue }) → [t] — o que se paga e
     não vai à bolsa (o mapa: o que se compra é o conhecimento).
   aCompraNoBalcao({ uso, quantos, custo, turno, n }) → [t] — o balcão da
     casa não tem caixa no registro (é o `mundo`, como na etapa 6); o uso
     contável vem dele, a moeda vai para ele. O que não é uso contável (o
     kit) é só a moeda: a coisa fica com quem chama.
   aVendaNaBanca({ banca, nome, uso, quantos, valor, turno, n }) → [t]
     a coisa (ou o uso) vai do herói à banca, a moeda vem do caixa dela.
   ============================================================ */
const moedasDe = (n) => ({ tipo: "moedas", nome: "moedas", quantos: inteiro(n) });
const ladoDaBanca = (b) => (str(b).trim() ? Q.lados.banca + str(b).trim() : "");
export function aCompraNaBanca(o) {
  try {
    const c = obj(o) || {};
    const banca = ladoDaBanca(c.banca);
    const it = obj(c.item) || (typeof c.item === "string" ? { nome: c.item } : null);
    const nome = nomeDe(it);
    if (!banca || !nome) return [];
    const preco = inteiro(c.preco);
    const destino = Q.destinos.includes(c.destino) ? c.destino : "inventario";
    return [Object.freeze({ de: banca, para: Q.lados.heroi, oQue: { tipo: "item", nome, quantos: 1, item: it, destino }, contra: preco > 0 ? moedasDe(preco) : null, consentimento: "pedido", origem: C.origem.banca, chave: aChaveDoCaminho("banca", c.turno, banca, nome, c.n) })];
  } catch { return []; }
}
export function oPagamentoABanca(o) {
  try {
    const c = obj(o) || {};
    const banca = ladoDaBanca(c.banca);
    const preco = inteiro(c.preco);
    if (!banca || preco < 1) return [];
    return [Object.freeze({ de: Q.lados.heroi, para: banca, oQue: moedasDe(preco), contra: null, consentimento: "dado", origem: C.origem.banca, chave: aChaveDoCaminho("banca", c.turno, banca, "moedas", c.oQue, c.n) })];
  } catch { return []; }
}
export function aCompraNoBalcao(o) {
  try {
    const c = obj(o) || {};
    const custo = inteiro(c.custo);
    const uso = str(c.uso);
    const quantos = Math.max(1, inteiro(c.quantos) || 1);
    const chave = aChaveDoCaminho("balcao", c.turno, uso, quantos, c.n);
    if (Q.usos.includes(uso)) return [Object.freeze({ de: Q.lados.mundo, para: Q.lados.heroi, oQue: { tipo: "uso", nome: uso, quantos }, contra: custo > 0 ? moedasDe(custo) : null, consentimento: "pedido", origem: C.origem.balcao, chave })];
    if (custo < 1) return [];
    return [Object.freeze({ de: Q.lados.heroi, para: Q.lados.mundo, oQue: moedasDe(custo), contra: null, consentimento: "dado", origem: C.origem.balcao, chave })];
  } catch { return []; }
}
export function aVendaNaBanca(o) {
  try {
    const c = obj(o) || {};
    const banca = ladoDaBanca(c.banca);
    const valor = inteiro(c.valor);
    if (!banca || valor < 1) return [];
    const uso = str(c.uso);
    const oQue = uso ? (Q.usos.includes(uso) ? { tipo: "uso", nome: uso, quantos: Math.max(1, inteiro(c.quantos) || 1) } : null) : (str(c.nome).trim() ? { tipo: "item", nome: str(c.nome).trim(), quantos: 1 } : null);
    if (!oQue) return [];
    return [Object.freeze({ de: Q.lados.heroi, para: banca, oQue, contra: moedasDe(valor), consentimento: "dado", origem: C.origem.venda, chave: aChaveDoCaminho("venda", c.turno, banca, oQue.nome, oQue.quantos, c.n) })];
  } catch { return []; }
}

/* ============================================================
   O QUE O SISTEMA DÁ E O QUE SE GASTA
   oQueOMundoDa({ caminho, moedas, itens: [item], identidade, turno }) → [t]
     a paga da quest, o espólio da luta, o achado: saem de `mundo`. A chave
     é a IDENTIDADE do que se paga (a quest e o desfecho; a luta; o achado),
     e não o turno, quando ela existe: pagar de novo a mesma coisa é
     recusado (jaAplicada) em qualquer turno.
   oQueSeGasta({ moedas, identidade, turno }) → [t] — a moeda que some (o
     dízimo, a taxa): do herói para `nada`.
   ============================================================ */
export function oQueOMundoDa(o) {
  try {
    const c = obj(o) || {};
    const caminho = C.chave[c.caminho] ? c.caminho : "mundo";
    const id = str(c.identidade).trim();
    const turno = id ? 0 : c.turno;
    const out = [];
    const n = inteiro(c.moedas);
    if (n > 0) out.push({ oQue: moedasDe(n), k: "moedas" });
    arr(c.itens).forEach((it, i) => { const nome = nomeDe(it); if (nome) out.push({ oQue: { tipo: "item", nome, quantos: 1, item: it, ...(Q.destinos.includes(obj(it) && it.destino) ? { destino: it.destino } : {}) }, k: `item|${i}|${nome}` }); });
    return out.map((x) => Object.freeze({ de: Q.lados.mundo, para: Q.lados.heroi, oQue: x.oQue, contra: null, consentimento: "dado", origem: C.origem[caminho], chave: aChaveDoCaminho(caminho, turno, id || c.frase || "", x.k) }));
  } catch { return []; }
}
export function oQueSeGasta(o) {
  try {
    const c = obj(o) || {};
    const n = inteiro(c.moedas);
    if (n < 1) return [];
    const id = str(c.identidade).trim();
    return [Object.freeze({ de: Q.lados.heroi, para: Q.lados.nada, oQue: moedasDe(n), contra: null, consentimento: "dado", origem: C.origem.consumo, chave: aChaveDoCaminho("consumo", id ? 0 : c.turno, id || "", n) })];
  } catch { return []; }
}

/* ============================================================
   AS CHAVES QUE PAGARAM
   asChavesQuePagaram(transacoes, res) → [chave] — as transações que a
   porta aplicou e em que a moeda do herói mudou (saiu ou entrou). É o que
   a cobrança da prosa consulta (cobranca.js, `jaAplicadas`): o que tem
   chave já passou pela porta, e cobrá-lo de novo seria o débito em dobro.
   ============================================================ */
export function asChavesQuePagaram(transacoes, res) {
  try {
    if (!obj(res) || !res.ok) return [];
    const toca = (t) => [t.oQue, t.contra].some((x) => obj(x) && x.tipo === "moedas") && (t.de === Q.lados.heroi || t.para === Q.lados.heroi);
    return arr(transacoes).filter((t) => obj(t) && str(t.chave) && toca(t)).map((t) => t.chave);
  } catch { return []; }
}
