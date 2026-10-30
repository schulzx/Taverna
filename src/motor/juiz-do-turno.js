/* ============================================================
   O JUIZ NO TURNO (T1-A, 5.ª fatia, 28/10/2026) — src/motor/juiz-do-turno.js

   O Juiz de fidelidade (src/juiz-de-fidelidade.js, T3-B) lê a prosa do
   Narrador contra o que o sistema sabia NAQUELE turno. Ele nasceu a medir
   sobre o disco das sessões de prova; esta peça é a outra metade: monta,
   a cada turno do jogo, a entrada dele com o que o App tinha na mão — e
   guarda o veredito onde as sessões de prova o leem, ao lado do custo
   (no save, campo `fidelidade`, e na consola, ao lado da linha do custo).

   Primeiro SÓ MEDE (mente/plano-motor.md, Fase 3: "uma linha no custo").
   Não corrige, não repede, não chama IA, e na tela não aparece nada: o
   sistema não fala de si mesmo.

   ---------------- O QUE ENTRA, E DE ONDE ----------------

   O diário da T3-B escreveu o que a fiação tinha de entregar: a pauta
   enviada (o texto), a gente e os lugares de ANTES da narração (o
   registo), as bancas da cena e a bolsa, os tempos vivos e as narrações
   anteriores da sessão. "De antes" é a regra que mais pesa: o registo de
   DEPOIS já tem a gente que a narração inventou (o códex regista-a), e o
   Juiz absolvê-la-ia por ela já lá estar. Por isso o App tira a foto do
   estado ANTES de aplicar a resposta, e esta peça só a lê.

     entradaDoJuiz(foto, ctx) → o `estado` de julgarAProsa
       foto: { personagem, npcs, mapa, base, cidadeAtual, lugar,
               (personagem.inventario/equipamento/equipados/equipado,
                e os mesmos do grupo: o que o herói carrega),
               oferecidos, missoes, bancas, balcao, narracoes, elenco,
               guildas, espinha, mundo: { semente, genero, molde, lexico } }
       ctx:  { frase, pauta, moeda }

   O mundo da cidade onde se está sai da semente (`oQueExisteAqui`: os
   locais, a gente de cada um, os papéis) — é o que a T3-B fez para
   refazer a 9.ª sessão (MUNDO9, teste-juiz-de-fidelidade), e é a mesma
   régua em que a medida dela (96,4% apanhados, 1,3% de falsos) foi
   feita. As outras cidades entram pelo nome, como lugar.

   ---------------- O QUE SAI ----------------

     julgarOTurno(prosa, entrada, meta) → { veredito, resumo }
     somarAFidelidade(acc, resumo)      → o acumulado do save
     linhaDoJuiz(resumo)                → a linha da consola

   O resumo é curto de propósito: vai ao save a cada turno, e os últimos
   `JUIZ_NO_TURNO.guardados` ficam com os trechos (o resto só na conta).
   ============================================================ */

import { julgarAProsa } from "../juiz-de-fidelidade.js";
import { oQueExisteAqui, masmorrasDoMundo } from "../mundo-base.js";
import { horasEntre, origemDoHeroi } from "../marcha.js";

/* Se é número, é tabela. */
export const JUIZ_NO_TURNO = {
  guardados: 24,           // os últimos vereditos com os trechos, no save
  achadosPorTurno: 4,      // trechos guardados de um turno (a conta leva todos)
  trecho: 120,             // caracteres de cada trecho e de cada motivo
  narracoesAntes: 6,       // as respostas anteriores que o Juiz lê como eco
  itens: 60,               // os nomes do que o herói e o grupo carregam, na entrada
  distancias: 24,          // os sítios do mapa com a marcha desde onde o herói está
};

/* ---------------- O QUE O MAPA SABE (29/10, a 13.ª sessão) ----------------
   A 13.ª acusou quatro vezes «quatro horas» até à Fenda de Silêncio — e o
   mapa diz 4 h. O Juiz só lia as distâncias que a pauta DAQUELE turno
   repetia, e o mapa é verdade do sistema mesmo fora da pauta. A entrada leva
   agora a marcha (horasEntre, marcha.js: a conta da região, com o chão) de
   onde o herói está até cada povoação e cada lugar da região, marcada
   `doMapa` — o Juiz só a usa quando a prosa NOMEIA o sítio. Fora da região
   (mapa sem `regiao`), ou sem ponto de partida, nada: a chave só vai à
   entrada quando há distância. */
function distanciasDoMapa(f) {
  const mapa = obj(f.mapa);
  if (!obj(mapa.regiao) || !Object.keys(obj(mapa.regiao)).length) return [];
  const de = origemDoHeroi(mapa, { cidadeAtual: f.cidadeAtual, lugar: f.lugar, ...(f.jornada ? { jornada: f.jornada } : {}) });
  if (!de) return [];
  const daqui = semAc(typeof de === "string" ? de : nome(de));
  const nomes = [...arr(mapa.cidades).map(nome), ...arr(obj(mapa.regiao).lugares).map(nome)].filter((n) => n && semAc(n) !== daqui);
  const out = [];
  for (const n of [...new Set(nomes)]) {
    const h = horasEntre(mapa, de, n);
    if (Number.isFinite(Number(h)) && h > 0) out.push({ para: n, horas: Math.round(h * 100) / 100, doMapa: true });
  }
  return out.slice(0, JUIZ_NO_TURNO.distancias);
}

/* E O PAPEL DE QUEM O REGISTO CONHECE (29/10): «Corrado, o Organizador de
   lutas» saía como gente nova quando o EM CENA da pauta não chegava — o papel
   está no registo (`npcs[x].papel`), e é do sistema. Vai em `outros`. */
const papeisDoRegisto = (npcs) => [...new Set(Object.values(obj(npcs)).map((n) => (n && typeof n.papel === "string" ? n.papel.trim() : "")).filter(Boolean))];

/* ---------------- O QUE O HERÓI CARREGA (28/10, trilha B) ----------------
   A entrada levava a bolsa em moedas e não os itens: um item do inventário
   com nome próprio («a Lâmina do Juramento») saía como gente nova, e a
   correção do Juiz (correcao-do-juiz.js#canoneSemInvencao) tirava-o do
   cânone — o mesmo risco do Elixir da banca, consertado em c8bc5b2. Os
   itens moram em quatro sítios da ficha (o inventário em texto ou objeto,
   a mochila, o que está empunhado por encaixe — duas formas, a de hoje e
   a de antes), no herói e em cada companheiro; o parêntese do inventário
   («Faca herdada (única lembrança da família)») é descrição, não nome. A
   chave só vai à entrada quando há item: a entrada sem eles sai byte a
   byte como saía (é ela que as sessões gravadas guardam). */
const ONDE_SE_CARREGA = ["inventario", "equipamento", "equipados", "equipado"];
function oQueCarrega(p) {
  const out = [];
  const daFicha = (f) => {
    const x = obj(f);
    for (const campo of ONDE_SE_CARREGA) {
      const v = x[campo];
      for (const it of Array.isArray(v) ? v : Object.values(obj(v))) {
        const n = nome(it).replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
        if (n && !out.includes(n)) out.push(n);
      }
    }
  };
  daFicha(p);
  for (const g of arr(obj(p).grupo)) daFicha(g);
  return out.slice(0, JUIZ_NO_TURNO.itens);
}

/* as classes do veredito, na ordem em que a linha as diz */
export const CLASSES_DO_JUIZ = [
  { campo: "precosInventados", classe: "preco" },
  { campo: "distanciasFora", classe: "distancia" },
  { campo: "pessoasNovas", classe: "pessoa" },
  { campo: "nomesNovos", classe: "nome" },
  { campo: "lugaresNovos", classe: "lugar" },
];

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const arr = (x) => (Array.isArray(x) ? x : []);
const nome = (x) => (x == null ? "" : typeof x === "string" ? x : String(x.nome || ""));
const semAc = (s) => String(s == null ? "" : s).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
const corta = (s, n) => { const t = String(s == null ? "" : s).replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n - 1) + "…" : t; };

export function entradaDoJuiz(foto, ctx) {
  const f = obj(foto), c = obj(ctx), m = obj(f.mundo);
  const p = obj(f.personagem), mapa = obj(f.mapa), base = f.base || null;
  const gente = [], lugares = [], papeis = [];
  /* quem o registo conhece, o elenco do mundo, a espinha e as guildas */
  gente.push(...Object.keys(obj(f.npcs)));
  gente.push(...arr(f.elenco).map(nome));
  const fio = obj(obj(f.espinha).fio);
  if (fio.antagonista) gente.push(nome(fio.antagonista));
  for (const g of arr(f.guildas)) {
    if (!g) continue;
    lugares.push(nome(g));
    gente.push(nome(g.mestre), ...arr(g.membros).map(nome));
  }
  /* o mapa: as cidades, as regiões e os continentes, e as masmorras do mundo */
  for (const cid of arr(mapa.cidades)) {
    if (!cid) continue;
    lugares.push(nome(cid), nome(cid.regiao), nome(cid.continente));
  }
  for (const r of arr(mapa.regioes)) lugares.push(nome(r));
  try { if (m.semente) for (const mm of arr(masmorrasDoMundo(m.semente, f.mapa))) lugares.push(nome(mm)); } catch { /* sem masmorras, o mapa basta */ }
  /* a cidade onde se está, refeita pela semente: os locais, a gente e os papéis */
  try {
    if (m.semente && f.cidadeAtual) {
      /* a cidade nula de um mapa torto não pode calar a cidade inteira */
      const mapaLimpo = f.mapa && typeof f.mapa === "object" ? { ...f.mapa, cidades: arr(f.mapa.cidades).filter(Boolean) } : f.mapa;
      const o = oQueExisteAqui(m.semente, mapaLimpo, f.cidadeAtual, base, m.genero || undefined, m.molde || null, m.lexico || null);
      if (o) {
        for (const l of arr(o.locais)) { if (l) lugares.push({ nome: nome(l), tipo: l.tipo || "" }, nome(l.chamado)); }
        for (const g of arr(o.gente)) { if (g) { gente.push(nome(g)); if (g.papel) papeis.push(String(g.papel)); } }
      }
    }
  } catch { /* o mundo da cidade nunca derruba a medida: fica o resto */ }
  if (f.cidadeAtual) lugares.push(String(f.cidadeAtual));
  if (f.lugar) lugares.push(nome(f.lugar));
  /* o mercado da cena: as bancas e o balcão dos mantimentos */
  const mercado = [];
  for (const b of arr(f.bancas)) for (const it of arr(b && b.estoque)) if (it && it.nome && Number.isFinite(Number(it.preco))) mercado.push({ nome: String(it.nome), preco: Number(it.preco), ...(it.id ? { id: it.id } : {}) });
  for (const it of arr(f.balcao)) if (it && it.nome && Number.isFinite(Number(it.preco))) mercado.push({ nome: String(it.nome), preco: Number(it.preco), ...(it.id ? { id: it.id } : {}) });
  /* os outros valores em dinheiro que o sistema sabe: as recompensas das missões vivas */
  const valores = [];
  for (const q of arr(f.missoes)) {
    if (!q || (q.status && q.status !== "ativa")) continue;
    const r = obj(q.recompensa);
    if (Number.isFinite(Number(r.moedas))) valores.push(Number(r.moedas));
  }
  const limpa = (xs) => xs.filter((x) => (typeof x === "string" ? x.trim() : x && nome(x).trim()));
  const carrega = oQueCarrega(p);
  let doMapa = [];
  try { doMapa = distanciasDoMapa(f); } catch { /* o mapa torto nunca derruba a medida */ }
  const papeisR = papeisDoRegisto(f.npcs);
  return {
    frase: String(c.frase || ""),
    antes: arr(f.narracoes).map((x) => String(x == null ? "" : x)).filter((x) => x.trim()).slice(-JUIZ_NO_TURNO.narracoesAntes),
    moeda: c.moeda ? String(c.moeda) : "",
    heroi: p.nome ? [String(p.nome)] : [],
    grupo: arr(p.grupo).map(nome).filter(Boolean),
    gente: limpa(gente),
    nomesAMao: arr(f.oferecidos).map(nome).filter(Boolean),
    lugares: limpa(lugares),
    papeis,
    mercado,
    valores,
    ...(Number.isFinite(Number(p.moedas)) ? { bolsa: Number(p.moedas) } : {}),
    pauta: typeof c.pauta === "string" ? c.pauta : "",
    ...(carrega.length ? { inventario: carrega } : {}),
    ...(doMapa.length ? { distancias: doMapa } : {}),
    ...(papeisR.length ? { outros: papeisR } : {}),
  };
}

/* o veredito do turno e o resumo que vai ao save */
export function julgarOTurno(prosa, entrada, meta) {
  const v = julgarAProsa(prosa, entrada);
  const mt = obj(meta);
  const por = {};
  const trechos = [];
  for (const { campo, classe } of CLASSES_DO_JUIZ) {
    const xs = arr(v[campo]);
    por[classe] = xs.length;
    for (const a of xs) trechos.push({ classe, trecho: corta(a && a.trecho, JUIZ_NO_TURNO.trecho), motivo: corta(a && a.motivo, JUIZ_NO_TURNO.trecho) });
  }
  const pc = v.pautaCumprida;
  if (pc) for (const fl of arr(pc.faltaram)) trechos.push({ classe: "pauta", trecho: corta(fl && fl.fato, JUIZ_NO_TURNO.trecho), motivo: corta(fl && fl.motivo, JUIZ_NO_TURNO.trecho) });
  por.pauta = pc ? arr(pc.faltaram).length : 0;
  const resumo = {
    turno: Number.isFinite(Number(mt.turno)) ? Number(mt.turno) : null,
    dia: Number.isFinite(Number(mt.dia)) ? Number(mt.dia) : null,
    achados: v.achados,
    por,
    pauta: pc ? { total: pc.total, cumpridos: pc.cumpridos } : null,
    trechos: trechos.slice(0, JUIZ_NO_TURNO.achadosPorTurno),
  };
  return { veredito: v, resumo };
}

/* o acumulado da campanha: a conta inteira e os últimos vereditos com trechos */
export function somarAFidelidade(acc, resumo) {
  const a = obj(acc), r = obj(resumo);
  const porA = obj(a.por), porR = obj(r.por);
  const por = { ...porA };
  for (const k of Object.keys(porR)) por[k] = (Number(por[k]) || 0) + (Number(porR[k]) || 0);
  const pautaA = obj(a.pauta), pautaR = obj(r.pauta);
  const ultimos = [...arr(a.ultimos), r].slice(-JUIZ_NO_TURNO.guardados);
  return {
    turnos: (Number(a.turnos) || 0) + 1,
    limpos: (Number(a.limpos) || 0) + (Number(r.achados) === 0 ? 1 : 0),
    achados: (Number(a.achados) || 0) + (Number(r.achados) || 0),
    por,
    pauta: { total: (Number(pautaA.total) || 0) + (Number(pautaR.total) || 0), cumpridos: (Number(pautaA.cumpridos) || 0) + (Number(pautaR.cumpridos) || 0) },
    ultimos,
  };
}

/* a linha da consola, ao lado da do custo */
export function linhaDoJuiz(resumo) {
  const r = obj(resumo), por = obj(r.por);
  const partes = [...CLASSES_DO_JUIZ.map((x) => x.classe), "pauta"].filter((k) => Number(por[k]) > 0).map((k) => `${k} ${por[k]}`);
  const pauta = r.pauta && r.pauta.total ? ` · pauta ${r.pauta.cumpridos}/${r.pauta.total}` : "";
  return `[taverna] juiz: ${Number(r.achados) || 0} achado${Number(r.achados) === 1 ? "" : "s"}${partes.length ? ` (${partes.join(" · ")})` : ""}${pauta}`;
}
