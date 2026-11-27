/* ============================================================
   A REAÇÃO DA VÍTIMA (25/11/2026, depois da etapa 9 da planta
   mente/plano-identidade-e-posse.md)

   A decisão da pessoa, 25/11: «Sobre a vítima, acho que pode ser aleatório
   ou com base na personalidade e ficha da vítima: se for uma pessoa
   honesta, ela denuncia; se for uma pessoa desonesta, ela cobra pra ficar
   calada, etc.» — e, no mesmo dia, sem fiado e sem consequência de prazo
   vencido (nada disso nasce aqui).

   O registro de posse (quem-tem-o-que.js) já guarda o FATO do que se tomou
   (`tomadas`: quem perdeu, quem tomou, o quê, o dia, o lugar, se a vítima
   viu) e a restituição devida. Faltava a vítima FAZER alguma coisa com isso.

   ---------------- QUANDO ELA REAGE ----------------
     · viu (a tomada diz `viu`): reage quando está em cena com o herói, e
       sabe QUEM foi.
     · não viu: dá pela falta quando volta a estar em cena com o herói
       depois de `falta.dias` dias. Sabe que foi furtada, NÃO sabe quem:
       não acusa ninguém; só o fato «deu pela falta» chega ao Narrador.
     · só reage o que ainda está com o herói (a restituição aberta): o que
       já foi devolvido não tem do que reagir.
   Cada tomada reage UMA vez (a chave é o id da tomada); o estado da reação
   mora no próprio registro de posse (`posses.reacoes`, campo novo e
   aditivo, que a versão antiga ignora).

   ---------------- QUE REAÇÃO ----------------
   Sai da TABELA de reações. O peso de cada linha começa no `peso` dela e
   é mexido pela FICHA da vítima — a índole que o mundo já lhe dá
   (indole.js: os traços e o medo, derivados da semente e do nome) —, pela
   afeição que ela tem pelo herói (a `relacao` e o `laco` do registro de
   NPCs, npcs.js) e pelo valor do que foi tomado. Um sorteio pela semente
   (a do mundo + o id da vítima + a chave da tomada) escolhe entre os pesos:
   a mesma semente dá a mesma reação em qualquer máquina.

   ---------------- O EFEITO ----------------
   Nenhum sistema novo: cada linha diz em que mecanismo que JÁ existe o
   efeito pousa — a lei da cidade (crime.js: `registrarCrime`, gravidade
   «roubar»: procurado, recompensa, preço mais alto, a guarda que vem), a
   afeição (o laço afrouxa, a relação desce um degrau) e o registro de
   dívida (o preço do silêncio é uma dívida aberta com ela, que se paga
   pela porta única como qualquer outra: «pago … à Fulana» é `devido`).
   Quem decide é este módulo; quem aplica é o App; o Narrador só narra.

   Nenhuma regra por nome, palavra ou frase: tudo sai da forma da tomada,
   da ficha e da tabela. PURO E DETERMINÍSTICO; nada que entra é mutado;
   `null` e lixo dão o vazio.
   ============================================================ */
import { QUEM_TEM_O_QUE, garantirPosses, tomadasDe } from "./quem-tem-o-que.js";
import { indoleDe } from "./indole.js";
import { garantirLaco, afrouxarLaco } from "./npcs.js";
import { hashSemente } from "./semente.js";

/* ---------------- A TABELA ----------------
   `reacoes`: as linhas. `peso`: o peso de partida. `afeicaoCai`: a reação
   custa afeição. `prazo`: em turnos, o tempo que a vítima espera (a
   cobrança, a exigência); `seNao`: a linha que vem quando o prazo passa
   sem resposta ou o herói recusa. `crime`: a gravidade de crime.js que a
   denúncia registra.
   `modificadores`: o que a ficha faz aos pesos — `soma` antes, `vezes`
   depois; cada um vale quando a sua condição casa (um traço da índole, o
   medo, a afeição, o valor).
   `afeicao`: o que é afeição alta e baixa, e o degrau que a relação desce.
   `valor`: o que vale o que se tomou (a moeda pelo número; a coisa pela
   tabela), e o que é muito e pouco. `silencio`: o preço de ficar calada.
   `falta`: em quantos dias a vítima que não viu dá pela falta.
   `recusa`: a frase negada dirigida a ela (pelo nome) recusa; sem nome, só
   no turno logo depois da cobrança. `teto`: o tamanho do estado.
   `pauta`: o que o Narrador lê (primeira pessoa, na voz do herói); `tela`:
   o que o jogador lê. */
export const A_REACAO_DA_VITIMA = Object.freeze({
  v: 1,
  secao: "acabou",
  semente: "reacao",
  reacoes: Object.freeze({
    denunciar: Object.freeze({ peso: 2, afeicaoCai: true, prazo: 0, seNao: "", crime: "roubar" }),
    cobrar: Object.freeze({ peso: 1, afeicaoCai: true, prazo: 3, seNao: "denunciar", crime: "" }),
    confrontar: Object.freeze({ peso: 3, afeicaoCai: true, prazo: 6, seNao: "denunciar", crime: "" }),
    calar: Object.freeze({ peso: 2, afeicaoCai: true, prazo: 0, seNao: "", crime: "" }),
  }),
  modificadores: Object.freeze([
    /* a pessoa honesta denuncia, e não vende o silêncio */
    Object.freeze({ traco: Object.freeze(["fiel", "compassivo", "generoso", "humilde", "pratico"]), soma: Object.freeze({ denunciar: 6 }), vezes: Object.freeze({ cobrar: 0 }) }),
    /* a desonesta cobra para ficar calada */
    Object.freeze({ traco: Object.freeze(["ganancioso", "traidor", "invejoso", "cruel"]), soma: Object.freeze({ cobrar: 7 }), vezes: Object.freeze({ denunciar: 0.3 }) }),
    /* quem não recua vai tirar satisfação */
    Object.freeze({ traco: Object.freeze(["corajoso", "orgulhoso", "teimoso", "medonho"]), soma: Object.freeze({ confrontar: 4 }) }),
    /* quem guarda o que lhe fizeram leva à lei */
    Object.freeze({ traco: Object.freeze(["rancoroso", "desconfiado"]), soma: Object.freeze({ denunciar: 3 }) }),
    /* o medroso e o calado engolem */
    Object.freeze({ traco: Object.freeze(["medroso", "calado", "frio"]), soma: Object.freeze({ calar: 4 }), vezes: Object.freeze({ confrontar: 0.5 }) }),
    /* quem tem medo de farda ou de posto não vai à guarda */
    Object.freeze({ medo: Object.freeze(["autoridade", "armados"]), vezes: Object.freeze({ denunciar: 0 }), soma: Object.freeze({ calar: 2 }) }),
    /* quem gosta do herói cala (e a afeição cai) */
    Object.freeze({ afeicao: "alta", soma: Object.freeze({ calar: 5 }), vezes: Object.freeze({ denunciar: 0.25 }) }),
    Object.freeze({ afeicao: "baixa", soma: Object.freeze({ denunciar: 2 }), vezes: Object.freeze({ calar: 0.5 }) }),
    /* o muito leva à lei; o pouco se engole */
    Object.freeze({ valor: "alto", soma: Object.freeze({ denunciar: 2 }), vezes: Object.freeze({ calar: 0.5 }) }),
    Object.freeze({ valor: "baixo", soma: Object.freeze({ calar: 2 }), vezes: Object.freeze({ denunciar: 0.5 }) }),
  ]),
  afeicao: Object.freeze({
    relacoesAltas: Object.freeze(["amigo", "aliado", "romance", "conjuge", "familia", "companheiro"]),
    relacoesBaixas: Object.freeze(["rival", "inimigo"]),
    lacosAltos: Object.freeze(["amizade", "amor", "familia", "aprendizado"]),
    /* o degrau que a relação desce quando não há laço que afrouxe. Só quem gostava desce: o neutro e o
       desconhecido NÃO viram «rival» (rival é «medimo-nos», não «não gosto de você»), e a bancada mostrou
       que a relação mexida muda como a pessoa julga o pedido seguinte (P11: o pedido a quem não tem a
       coisa virava um dado de persuasão) — o roubo de um estranho pesa pela lei e pela dívida, não pela relação */
    desce: Object.freeze({ romance: "amigo", amigo: "neutro", aliado: "neutro" }),
  }),
  valor: Object.freeze({ item: 12, alto: 50, baixo: 5 }),
  silencio: Object.freeze({ fracao: 0.5, min: 2, max: 300, porTraco: Object.freeze({ ganancioso: 1.5 }) }),
  falta: Object.freeze({ dias: 1 }),
  divida: Object.freeze({ prefixo: "div|sil|", origem: "o preço do silêncio" }),
  teto: Object.freeze({ reacoes: 40, nome: 40, eventos: 3 }),
  moeda: "◉ {N}",
  pauta: Object.freeze({
    denunciar: "{Nome} viu que lhe tomei {Coisa} e foi contar {Quem}.",
    denunciarComLei: " Sou procurado em {Cidade}: há {Recompensa} moedas pela minha cabeça por {Dias} dias.",
    cobrar: "{Nome} viu que lhe tomei {Coisa} e quer {Preco} para guardar segredo. Se eu pagar a {Nome}, o segredo fica guardado; se eu recusar, a boca se abre.",
    confrontar: "{Nome} viu que lhe tomei {Coisa} e me cobra de volta, cara a cara: quer {Coisa} na mão.",
    calar: "{Nome} viu que lhe tomei {Coisa} e não disse nada; mas já não me olha do mesmo jeito.",
    falta: "{Nome} deu pela falta de {Coisa}, e não sabe quem foi.",
    paga: "{Nome} recebeu o preço do silêncio: o que viu fica guardado.",
    devolvida: "{Nome} tem {Coisa} de volta, e o assunto morre aí.",
    recusou: "{Nome} não recebeu o que pediu.",
  }),
  tela: Object.freeze({
    denunciar: "{Nome} foi contar {Quem} o que você lhe tomou.",
    denunciarComLei: " Você é procurado em {Cidade} (◉ {Recompensa} pela sua cabeça, por {Dias} dias).",
    cobrar: "{Nome} viu você tomar {Coisa}. {Nome} quer {Preco} para guardar segredo: pague, ou recuse.",
    confrontar: "{Nome} viu você tomar {Coisa} e quer de volta.",
    paga: "{Nome} guarda o segredo.",
  }),
  quemSemLei: "a quem quisesse ouvir",
  contracao: Object.freeze({ a: "à", o: "ao", as: "às", os: "aos" }),
});

const R = A_REACAO_DA_VITIMA;
const Q = QUEM_TEM_O_QUE;
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const obj = (x) => (x != null && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const inteiro = (x) => { const n = Math.floor(Number(x)); return Number.isFinite(n) ? n : 0; };
const tpl = (s, m) => str(s).replace(/\{(\w+)\}/g, (_, k) => str(m[k]));
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const semAposto = (n) => str(n).split(",")[0].trim().slice(0, R.teto.nome);
const nomeDoId = (id) => str(id).split("|").pop().split("~")[0];
const aCoisa = (o) => { const x = obj(o) || {}; return x.tipo === "moedas" ? tpl(R.moeda, { N: inteiro(x.quantos) }) : inteiro(x.quantos) > 1 ? `${inteiro(x.quantos)} ${str(x.nome)}` : str(x.nome); };
const ESTADOS = Object.freeze(["pendente", "feita", "paga", "devolvida", "recusada", "seguiu"]);
const TIPOS = Object.freeze([...Object.keys(R.reacoes), "falta"]);

/* ============================================================
   garantirReacoes(x) → { v, porChave: { [idDaTomada]: reacao } } | null
   reacao: { tipo, id, nome, dia, turno, estado, preco, ate, divida }
   ============================================================ */
export function garantirReacoes(x) {
  const o = obj(x);
  if (!o) return null;
  const porChave = {};
  for (const k of Object.keys(obj(o.porChave) || {})) {
    if (Object.keys(porChave).length >= R.teto.reacoes) break;
    const r = obj(o.porChave[k]);
    if (!r || !str(k).trim() || !TIPOS.includes(r.tipo) || ["__proto__", "constructor", "prototype"].includes(k)) continue;
    porChave[k] = {
      tipo: r.tipo, id: str(r.id).slice(0, 160), nome: semAposto(r.nome), dia: inteiro(r.dia), turno: inteiro(r.turno),
      estado: ESTADOS.includes(r.estado) ? r.estado : "feita", preco: Math.max(0, inteiro(r.preco)), ate: inteiro(r.ate), divida: str(r.divida).slice(0, 200),
    };
  }
  if (!Object.keys(porChave).length) return null;
  return { v: R.v, porChave };
}

/* aMaoFoiVista(desfecho) → a mão leve que passou POR POUCO — de cima ou de baixo da dificuldade (MM5,
   desafios.js: o sim pago, cujo preço no furto é «vem tilintando — e o tilintar tem ouvidos») — foi vista
   pela vítima. O sucesso limpo, não. */
export function aMaoFoiVista(desfecho) {
  const d = obj(desfecho) || {};
  return !!d.porPouco;
}

/* o que vale o que se tomou */
export function oValorDoTomado(oQue) {
  const o = obj(oQue) || {};
  const n = Math.max(1, inteiro(o.quantos) || 1);
  return o.tipo === "moedas" ? n : n * R.valor.item;
}

/* a afeição da vítima pelo herói, pelo que o registro de NPCs já tem: "alta" | "baixa" | "" */
export function aAfeicaoDe(ficha) {
  const f = obj(ficha) || {};
  const l = garantirLaco(f.laco);
  const rel = sem(f.relacao);
  if (rel && R.afeicao.relacoesBaixas.includes(rel)) return "baixa";
  if (l && l.rompido) return "baixa";
  if ((l && R.afeicao.lacosAltos.includes(l.tipo)) || (rel && R.afeicao.relacoesAltas.includes(rel))) return "alta";
  return "";
}

/* ============================================================
   osPesosDaReacao(ficha, indole, oQue) → { denunciar, cobrar, confrontar, calar }
   ============================================================ */
export function osPesosDaReacao(ficha, indole, oQue) {
  const ind = obj(indole) || {};
  const tracos = arr(ind.tracos);
  const afe = aAfeicaoDe(ficha);
  const v = oValorDoTomado(oQue);
  const nivel = v >= R.valor.alto ? "alto" : v <= R.valor.baixo ? "baixo" : "";
  const casa = (m) => (m.traco ? m.traco.some((t) => tracos.includes(t)) : m.medo ? m.medo.includes(ind.medo) : m.afeicao ? m.afeicao === afe : m.valor ? m.valor === nivel : false);
  const p = {};
  for (const k of Object.keys(R.reacoes)) p[k] = R.reacoes[k].peso;
  const valem = R.modificadores.filter(casa);
  for (const m of valem) for (const k of Object.keys(obj(m.soma) || {})) if (k in p) p[k] += m.soma[k];
  for (const m of valem) for (const k of Object.keys(obj(m.vezes) || {})) if (k in p) p[k] *= m.vezes[k];
  for (const k of Object.keys(p)) p[k] = Math.max(0, Math.round(p[k] * 100) / 100);
  return p;
}

/* o sorteio pela semente: a mesma (semente, vítima, chave) dá a mesma linha */
export function sortearAReacao(pesos, semente, id, chave) {
  const ks = Object.keys(obj(pesos) || {}).filter((k) => Number(pesos[k]) > 0);
  if (!ks.length) return "calar";
  const total = ks.reduce((s, k) => s + Number(pesos[k]), 0);
  const u = (hashSemente(`${str(semente)}|${R.semente}|${str(id)}|${str(chave)}`) % 100000) / 100000;
  let acc = 0;
  for (const k of ks) { acc += Number(pesos[k]) / total; if (u < acc) return k; }
  return ks[ks.length - 1];
}

/* o preço do silêncio: uma fração do valor, entre o mínimo e o teto (o traço guloso pede mais) */
export function oPrecoDoSilencio(oQue, indole) {
  const tracos = arr(obj(indole) && indole.tracos);
  let f = R.silencio.fracao;
  for (const t of tracos) if (R.silencio.porTraco[t]) f *= R.silencio.porTraco[t];
  return Math.min(R.silencio.max, Math.max(R.silencio.min, Math.round(oValorDoTomado(oQue) * f)));
}

const idDaDividaDoSilencio = (tomadaId) => R.divida.prefixo + str(tomadaId).slice(Q.tomada.prefixo.length);
const estadoDaDivida = (P, id) => { const d = P ? P.dividas.find((x) => x.id === id) : null; return d ? d.estado : ""; };

/* ============================================================
   asReacoesDoTurno(ctx) → { reacoes, posses, eventos }
   O estado da reação vem de `posses.reacoes` e volta nas posses devolvidas.
   ctx: { posses, pessoas: [{ id, nome, relacao, laco, indole? }] (quem está EM
   CENA, pelo id da presença, com o que o registro de NPCs diz dela),
   semente, dia, turno, recusa: { negada, quem } (a leitura da frase do turno) }.
   eventos: [{ tipo, chave, id, nome, coisa, preco, crime, afeicao }] — o que o App
   aplica (crime, afeição) e diz (asLinhasDaReacao). Nada a fazer: as mesmas
   `posses` que entraram, e eventos vazios.
   ============================================================ */
export function asReacoesDoTurno(ctx) {
  const c = obj(ctx) || {};
  const nada = { reacoes: garantirReacoes(obj(c.posses) && c.posses.reacoes), posses: c.posses || null, eventos: [] };
  try {
    const P = garantirPosses(c.posses);
    const T = tomadasDe(c.posses, Q.lados.heroi).tomou;
    const R0 = garantirReacoes(P && P.reacoes) || { v: R.v, porChave: {} };
    if (!T.length && !Object.keys(R0.porChave).length) return nada;
    const dia = inteiro(c.dia), turno = inteiro(c.turno);
    const porChave = { ...R0.porChave };
    let dividas = P ? P.dividas : [];
    let mexeuPosses = false, mexeu = false;
    const eventos = [];
    const cena = new Map();
    for (const p of arr(c.pessoas)) { const id = str(obj(p) && p.id).trim(); if (id && !cena.has(id)) cena.set(id, p); }
    const ev = (tipo, chave, r, extra) => eventos.push(Object.freeze({ tipo, chave, id: r.id, nome: r.nome, coisa: str(extra && extra.coisa), preco: inteiro(extra && extra.preco), crime: R.reacoes[tipo] ? R.reacoes[tipo].crime : "", afeicao: !!(R.reacoes[tipo] && R.reacoes[tipo].afeicaoCai) }));
    const tomadaDe = (k) => T.find((t) => t.id === k) || null;

    /* 1. a reação que espera: paga, devolvida, recusada ou vencida */
    const rec = obj(c.recusa) || {};
    for (const k of Object.keys(porChave)) {
      const r = porChave[k];
      if (r.estado !== "pendente") continue;
      const t = tomadaDe(k);
      const coisa = t ? aCoisa({ ...t.oQue, quantos: t.resta || t.oQue.quantos }) : "";
      if (r.tipo === "cobrar") {
        const est = estadoDaDivida({ dividas }, r.divida);
        if (est !== Q.estados.aberta) { porChave[k] = { ...r, estado: "paga" }; mexeu = true; ev("paga", k, r, { coisa }); continue; }
        const quem = sem(rec.quem);
        const ehEla = quem && (sem(r.nome).startsWith(quem) || quem.startsWith(sem(r.nome).split(" ")[0]));
        const recusou = !!rec.negada && (ehEla || (!quem && turno === r.turno + 1));
        if (recusou || turno > r.ate) {
          dividas = dividas.filter((d) => d.id !== r.divida); mexeuPosses = true;
          ev("recusou", k, r, { coisa });
          porChave[k] = { ...r, estado: "seguiu" }; mexeu = true;
          const prox = R.reacoes.cobrar.seNao;
          if (prox) ev(prox, k, r, { coisa });
        }
        continue;
      }
      if (r.tipo === "confrontar") {
        if (!t || !t.aberta) { porChave[k] = { ...r, estado: "devolvida" }; mexeu = true; ev("devolvida", k, r, { coisa: t ? aCoisa(t.oQue) : "" }); continue; }
        if (turno > r.ate) {
          porChave[k] = { ...r, estado: "seguiu" }; mexeu = true;
          const prox = R.reacoes.confrontar.seNao;
          if (prox) ev(prox, k, r, { coisa });
        }
      }
    }

    /* 2. a tomada que ainda não teve reação, com a vítima em cena */
    for (const t of T) {
      if (porChave[t.id] || !t.aberta) continue;
      const p = cena.get(t.de);
      if (!p) continue;
      const nome = semAposto(p.nome) || nomeDoId(t.de);
      const coisa = aCoisa({ ...t.oQue, quantos: t.resta || t.oQue.quantos });
      const base = { id: t.de, nome, dia, turno };
      if (!t.viu) {
        if (dia - inteiro(t.dia) < R.falta.dias) continue;
        porChave[t.id] = { ...base, tipo: "falta", estado: "feita", preco: 0, ate: 0, divida: "" }; mexeu = true;
        ev("falta", t.id, base, { coisa });
        continue;
      }
      /* a ficha que já traz a índole manda; senão, a que o mundo deriva da semente e do nome (indole.js) */
      const indole = obj(p.indole) && Array.isArray(p.indole.tracos) ? p.indole : indoleDe(c.semente, { nome: str(p.nome) || nome });
      const tipo = sortearAReacao(osPesosDaReacao(p, indole, t.oQue), c.semente, t.de, t.id);
      const L = R.reacoes[tipo];
      let preco = 0, divida = "";
      if (tipo === "cobrar") {
        preco = oPrecoDoSilencio(t.oQue, indole);
        divida = idDaDividaDoSilencio(t.id);
        if (!dividas.some((d) => d.id === divida)) {
          dividas = [{ id: divida, de: Q.lados.heroi, para: t.de, oQue: { tipo: "moedas", nome: "moedas", quantos: preco }, quanto: preco, dia, prazo: 0, estado: Q.estados.aberta, origem: R.divida.origem }, ...dividas];
          mexeuPosses = true;
        }
      }
      porChave[t.id] = { ...base, tipo, estado: L.prazo ? "pendente" : "feita", preco, ate: L.prazo ? turno + L.prazo : 0, divida }; mexeu = true;
      ev(tipo, t.id, base, { coisa, preco });
    }

    if (!mexeu && !mexeuPosses) return nada;
    let chaves = Object.keys(porChave);
    while (chaves.length > R.teto.reacoes) { const k = chaves.find((x) => porChave[x].estado !== "pendente") || chaves[0]; delete porChave[k]; chaves = Object.keys(porChave); }
    const reacoes = mexeu ? garantirReacoes({ v: R.v, porChave }) : garantirReacoes(R0);
    const posses = P ? garantirPosses({ ...P, dividas, ...(reacoes ? { reacoes } : {}) }) || c.posses : c.posses || null;
    return { reacoes, posses, eventos };
  } catch { return nada; }
}

/* «contar a guarda da cidade» → «contar à guarda da cidade» (o artigo contrai com a preposição) */
const aQuem = (q) => {
  const s = str(q).trim();
  if (!s) return R.quemSemLei;
  const mm = s.match(/^(a|o|as|os)\s+(.+)$/i);
  return mm ? `${R.contracao[mm[1].toLowerCase()]} ${mm[2]}` : `a ${s}`;
};

/* ============================================================
   asLinhasDaReacao(evento, extra) → { fato, tela }
   extra.lei: o que crime.js disse da denúncia (consequenciaDoCrime(...).cidade:
   { nome, quem, recompensa, dias }) — sem ela (fora de cidade, sem lei), a
   denúncia é dita «a quem quisesse ouvir», sem procurado.
   ============================================================ */
export function asLinhasDaReacao(evento, extra) {
  const nada = { fato: "", tela: "" };
  try {
    const e = obj(evento);
    if (!e || !R.pauta[e.tipo]) return nada;
    const lei = obj(obj(extra) && extra.lei);
    const m = { Nome: semAposto(e.nome) || nomeDoId(e.id), Coisa: str(e.coisa), Preco: tpl(R.moeda, { N: inteiro(e.preco) }), Quem: aQuem(lei && lei.quem) };
    let fato = tpl(R.pauta[e.tipo], m);
    let tela = R.tela[e.tipo] ? tpl(R.tela[e.tipo], m) : "";
    if (e.tipo === "denunciar" && lei && str(lei.nome)) {
      const L = { Cidade: str(lei.nome), Recompensa: inteiro(lei.recompensa), Dias: inteiro(lei.dias) };
      fato += tpl(R.pauta.denunciarComLei, L);
      tela += tpl(R.tela.denunciarComLei, L);
    }
    return { fato, tela };
  } catch { return nada; }
}

/* ============================================================
   comAAfeicaoCaida(npc) → o npc com a afeição um passo abaixo: o laço que
   existe afrouxa (npcs.js); sem laço que afrouxe, a relação desce um degrau
   da tabela. Nada a descer: o MESMO objeto.
   ============================================================ */
export function comAAfeicaoCaida(npc) {
  try {
    const n = obj(npc);
    if (!n) return npc;
    const afrouxado = afrouxarLaco(n);
    if (afrouxado !== n) return afrouxado;
    const rel = sem(n.relacao) || "desconhecido";
    const desce = R.afeicao.desce[rel];
    return desce ? { ...n, relacao: desce } : n;
  } catch { return npc; }
}

/* asLinhasDoTurno(eventos, leis) → { [secao]: [fato] } | null — os fatos da pauta de um turno, com teto */
export function asLinhasDoTurno(eventos, leis) {
  try {
    const ls = [];
    arr(eventos).forEach((e, i) => { const l = asLinhasDaReacao(e, { lei: obj(leis) ? leis[i] : null }); if (l.fato) ls.push(l.fato); });
    if (!ls.length) return null;
    return Object.freeze({ [R.secao]: Object.freeze(ls.slice(0, R.teto.eventos)) });
  } catch { return null; }
}
