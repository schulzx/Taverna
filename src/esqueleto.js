/* ============================================================
   O ESQUELETO — o vilão primeiro, e as quests que o plano dele pede
   (08/11/2026, Fase BQ · BQ6)

   A pessoa, 08/11: a espinha dos mundos novos deixa de sortear marcos
   soltos («Encontrar X», «O que Y esconde», «Acabar com Z») e passa a
   ESCOLHER E LIGAR QUESTS JÁ DESENHADAS (mente/plano-biblioteca-de-quests.md,
   §5 e §11). E: *«uma campanha que não tem vilão só parece várias histórias
   misturadas»*. Por isso a ordem deste módulo é a da planta, e não outra:

     0. PRIMEIRO O VILÃO E O PLANO DELE (`nascerOVilao`, plano-do-vilao.js,
        BQ5) — os seis passos que ele vai dar se ninguém o parar;
     1. depois, PARA CADA ATO, a quest do tipo 1 cuja mão contesta o passo
        daquele ato (`mao.contra`), pela mão que a composição pede
        (COMPOSICAO_DA_MAO) e, se nenhuma serve, pela mão seguinte que o
        próprio passo aceita (`contra` do passo) — respeitando o `quando`
        (QUANDO_DO_ATO) e pesando o `afim` (a espinha do menu, que fica como
        tom). Uma delas — a da mão `pista` — ENTREGA A FRAQUEZA (§11.3);
     2. depois as do TIPO 2 (ESQUELETO.coracao: duas), cada uma ao longo de
        dois ou três atos (JANELAS_DO_CORACAO), que tocam o vilão pela PONTE
        (a pessoa delas mora na cidade do ato onde um passo dele cai, ou a
        ferida dele tem teia ao companheiro) sem serem sobre ele, e sem
        trancar nada do tipo 1;
     3. e os PAPÉIS de cada quest com o mundo que JÁ EXISTE: as cidades do
        mapa, a gente e os sítios da base (mundo-base.js), os tenentes do
        vilão (`de: "fio"`), o núcleo (`de: "grupo"`). Cada papel é
        preenchido UMA vez; o mesmo tenente pode atravessar duas quests — é o
        fio. Papel que não se preenche troca a quest: NUNCA NASCE UMA QUEST
        COM PAPEL VAZIO (a lei de saga.js: a espinha só aponta para o que
        existe).
        A ÚNICA EXCEÇÃO, e é declarada na própria ficha: o papel com a pista
        `fraqueza: "pessoa" | "coisa" | "verdade"` só existe se for da família
        da fraqueza DESTE vilão. O confronto (o Cimo da Escada) traz as três,
        e o esqueleto liga só a dele; as outras duas ficam vazias de
        propósito — listadas em `vazios` — e as condições sobre elas avaliam a
        falso sem estourar (condicoes-da-quest.js). A fraqueza é um fio: a
        quest que a ENTREGA (o papel da família certa numa quest antes do
        confronto, como o arquivo da Mão Que Mudou de Lado) e o confronto
        apontam para a MESMA pessoa, o mesmo sítio, a mesma coisa — a que fica
        no registo do vilão (`papeis.fraqueza`).

   A DEGRADAÇÃO É DESENHADA, NÃO ACIDENTAL. O catálogo nasce com três
   quests e cresce por lotes (BQ8). Um ato para o qual a biblioteca ainda
   não tem quest fica com `quest: null` — e CAI NO MARCO ANTIGO: os marcos
   que `estenderEspinha` já pôs naquele ato continuam a ser a história dele.
   O confronto, enquanto não houver quest de mão `confronto`, é o marco de
   sempre (o principal, no fim). A fraqueza, sem quest de mão `pista`, cai
   no ato da pista da composição: a pessoa, o sítio ou a coisa ficam postos
   na cidade desse ato, à espera de quem os ache. E o tipo 2 que não tiver
   par fica um só. Nada parte; só fica menos tecido.

   O SAVE: um campo NOVO, `espinha.esqueleto` (a escolha, os papéis, a
   ordem), mais o registo do vilão em `espinha.fio.vilao` (o da BQ5),
   agora com os papéis que o esqueleto ancorou: a fraqueza e os lugares
   dos passos (`passo_N`), e cada tenente a servir o passo da quest onde
   aparece. Os dois são aditivos e a versão antiga ignora-os; as campanhas
   em curso NÃO ganham esqueleto — só os mundos novos (§8, §11.8).
   `comOEsqueleto` junta-os à espinha; `garantirEsqueleto` é a catraca.

   PURO E DETERMINÍSTICO. A sorte sai da semente (`dadoDo`); o mundo
   entra por argumento e nunca é mutado; o `null` e o lixo dão `null`.
   ============================================================ */
import { dadoDo } from "./semente.js";
import { BIBLIOTECA_DE_QUESTS, validarQuest, PAPEIS_DA_QUEST, QUANDO_DA_QUEST, MAOS_DO_VILAO, LIMITES_DA_QUEST } from "./biblioteca-de-quests.js";
import { nascerOVilao, garantirRegistroDoVilao, PLANOS_DO_ARQUETIPO, PLANO_DE_RECUO, FRAQUEZAS } from "./plano-do-vilao.js";
import { chefesDoMundo, locaisDaCidade, genteDoLocal, idDoLocal } from "./mundo-base.js";
import { kmEntre } from "./coordenadas.js";

/* ---------------- A FORMA, POR NÚMERO DE ATOS ----------------
   As quatro espinhas do menu têm 4, 5 e 6 atos (arquipélago e reinado 4,
   mistério 5, jornada 6). Tudo o que segue é tabela por esse número.

   COMPOSICAO_DA_MAO (§11.3): que mão o esqueleto pede em cada ato, por
   ordem de preferência. Para 5 atos é a da planta, palavra por palavra:
   um tenente, um recurso ou consequência, a pista (que dá a fraqueza), o
   rosto no penúltimo, o confronto no fim. Se nenhuma quest serve com
   estas, tenta-se a lista `contra` do próprio passo (o plano diz quem o
   pode contestar), e só depois o ato cai no marco antigo. */
export const COMPOSICAO_DA_MAO = Object.freeze({
  4: Object.freeze([
    Object.freeze(["tenente", "recurso", "consequencia"]),
    Object.freeze(["pista", "consequencia"]),
    Object.freeze(["rosto"]),
    Object.freeze(["confronto"]),
  ]),
  5: Object.freeze([
    Object.freeze(["tenente"]),
    Object.freeze(["recurso", "consequencia"]),
    Object.freeze(["pista"]),
    Object.freeze(["rosto"]),
    Object.freeze(["confronto"]),
  ]),
  6: Object.freeze([
    Object.freeze(["tenente"]),
    Object.freeze(["recurso", "consequencia"]),
    Object.freeze(["consequencia", "tenente"]),
    Object.freeze(["pista"]),
    Object.freeze(["rosto"]),
    Object.freeze(["confronto"]),
  ]),
});

/* O passo do plano (1 a 6) que cada ato contesta. Sobe sempre: as quests
   físicas desenham juntas o plano dele, pela ordem do relógio, e cada uma
   contesta um passo DIFERENTE. Com 5 atos é o exemplo da Ilídia (§11.9):
   o Salvo-Conduto no 1, as Cinzas no 3, a pista no 4, o rosto no 5, o
   confronto no 6. Os passos que não são de ato nenhum (o 2 com 5 atos)
   só se contestam por uma quest cujo `contra` os abranja. */
export const PASSO_DO_ATO = Object.freeze({
  4: Object.freeze([1, 3, 5, 6]),
  5: Object.freeze([1, 3, 4, 5, 6]),
  6: Object.freeze([1, 2, 3, 4, 5, 6]),
});

/* Em que posição da campanha cada ato está, para o `quando` da ficha
   (QUANDO_DA_QUEST: cedo, meio, fim). */
export const QUANDO_DO_ATO = Object.freeze({
  4: Object.freeze(["cedo", "meio", "fim", "fim"]),
  5: Object.freeze(["cedo", "meio", "meio", "fim", "fim"]),
  6: Object.freeze(["cedo", "cedo", "meio", "meio", "fim", "fim"]),
});

/* As janelas do tipo 2: os atos ao longo dos quais cada uma corre (dois
   ou três, §5), sem se sobreporem — só uma do tipo 2 tem a batida acesa
   de cada vez. A primeira janela é da primeira quest do coração. */
export const JANELAS_DO_CORACAO = Object.freeze({
  4: Object.freeze([Object.freeze([0, 1]), Object.freeze([2, 3])]),
  5: Object.freeze([Object.freeze([0, 1, 2]), Object.freeze([3, 4])]),
  6: Object.freeze([Object.freeze([0, 1, 2]), Object.freeze([3, 4, 5])]),
});

/* ---------------- OS NÚMEROS DO ESQUELETO ----------------
   `v`: a forma de `espinha.esqueleto` no save. `coracao`: quantas do tipo
   2 a planta pede por campanha. `afim`/`base`: o peso de uma quest cuja
   espinha afim é a do menu, contra uma que não é — a afinidade PESA, não
   tranca (§5.4: «só desempata»; trancar faria todas as campanhas da mesma
   espinha abrirem com a mesma quest). `vizinhas`: quantas cidades, das mais
   perto, se procuram quando a do ato não tem gente livre para um papel.
   `grupo`: a ordem em que o núcleo ocupa um papel `de: "grupo"` — o que
   PAPEIS_DA_QUEST diz dele: o companheiro, ou o elo. A porta (o romance
   possível) só entra quando a ponte do vilão é a ferida com teia a ela
   (`w_filha`): aí ela passa à frente de todos. `querido`: quem do núcleo
   ocupa um papel que `exige` «querido_do_heroi» (o refém do confronto),
   por esta ordem. `nome`/`texto`: o que se guarda. */
export const ESQUELETO = Object.freeze({
  v: 1,
  coracao: 2,
  afim: 2,
  base: 1,
  vizinhas: 3,
  grupo: Object.freeze(["companheiro", "elo"]),
  querido: Object.freeze(["porta", "voz", "elo"]),
  nome: 60,
  texto: 120,
});

/* ---------------- utilidades ---------------- */
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const inteiro = (v) => (typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : null);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const texto = (s, n) => (typeof s === "string" ? s.trim().slice(0, n) : "");
const RX_ID = /^[a-z0-9_]{1,40}$/;
const PASSOS = LIMITES_DA_QUEST.passosDoPlano;

/* a forma para n atos: a tabela, ou — fora do menu — a de 6 esticada */
function formaPara(n) {
  if (COMPOSICAO_DA_MAO[n]) return { comp: COMPOSICAO_DA_MAO[n], passo: PASSO_DO_ATO[n], quando: QUANDO_DO_ATO[n], janelas: JANELAS_DO_CORACAO[n] };
  const idx = (i) => (n <= 1 ? 5 : Math.round((i * 5) / (n - 1)));
  const vistos = new Set();
  const passo = [], comp = [], quando = [];
  for (let i = 0; i < n; i++) {
    const k = idx(i);
    const p = PASSO_DO_ATO[6][k];
    passo.push(vistos.has(p) ? null : p); vistos.add(p);
    comp.push(COMPOSICAO_DA_MAO[6][k]);
    quando.push(QUANDO_DO_ATO[6][k]);
  }
  const meio = Math.ceil(n / 2);
  const janelas = [Array.from({ length: meio }, (_, i) => i), Array.from({ length: n - meio }, (_, i) => meio + i)].filter((j) => j.length);
  return { comp, passo, quando, janelas };
}

/* os passos do plano de um arquétipo (o próprio, ou o recuo da BQ5) — só
   o `contra` de cada um interessa aqui */
function contraDosPassos(arquetipo) {
  const proprio = PLANOS_DO_ARQUETIPO[arquetipo];
  if (proprio) return proprio.map((p) => arr(p.contra));
  return PLANO_DE_RECUO.contra.map((c) => arr(c));
}

/* as mãos de uma quest: a dela e o `tambem` */
const maosDe = (q) => {
  const m = obj(q && q.mao);
  return m && MAOS_DO_VILAO[m.tipo] ? [m.tipo, ...arr(m.tambem).filter((t) => MAOS_DO_VILAO[t])] : [];
};

/* a sorte ponderada sem repetição (Efraimidis–Spirakis): a mesma semente
   ordena a mesma lista da mesma maneira */
function ordenarPorPeso(rnd, lista, peso) {
  return lista.map((x) => ({ x, k: Math.pow(rnd() || 1e-9, 1 / Math.max(1e-9, peso(x))) }))
    .sort((a, b) => b.k - a.k).map((e) => e.x);
}

/* os nomes que nunca ocupam um papel de gente: o vilão (inteiro e curto) */
function nomesDoVilao(fio) {
  const a = texto(fio && fio.antagonista, ESQUELETO.nome);
  return a ? [a, a.split(",")[0].trim()].filter(Boolean) : [];
}

/* ============================================================
   O MUNDO — o que a criação já tem, lido uma vez
   ============================================================ */
function mundoDe(o, espinha, mapa) {
  const semente = o.semente == null ? "" : String(o.semente);
  const cidades = arr(mapa.cidades).filter((c) => obj(c) && texto(c.nome, 80));
  const porNome = new Map(cidades.map((c) => [norm(c.nome), c]));
  const locais = new Map();
  const gente = new Map();
  const locaisDe = (c) => {
    const k = norm(c.nome);
    if (!locais.has(k)) {
      let l = [];
      try { l = arr(locaisDaCidade(semente, c, o.genero || undefined, o.molde || null, o.lex || null)).filter((x) => obj(x) && texto(x.nome, 80)); } catch { l = []; }
      locais.set(k, l);
    }
    return locais.get(k);
  };
  const genteDoSitio = (l) => {
    try { return arr(genteDoLocal(semente, l, o.genero || undefined, o.molde || null, o.lex || null)).filter((p) => obj(p) && texto(p.nome, 80)); } catch { return []; }
  };
  const genteDe = (c) => {
    const k = norm(c.nome);
    if (!gente.has(k)) gente.set(k, locaisDe(c).flatMap((l) => genteDoSitio(l).map((p) => ({ nome: p.nome, cidade: c.nome, local: l.nome }))));
    return gente.get(k);
  };
  /* a cidade de cada ato: a mais repetida nos marcos dele (o perto → longe
     de `estenderEspinha` e de `espinhaNaRegiao` fica como estava); o ato
     sem cidade herda a do anterior */
  const atos = arr(espinha.atos);
  const cidadeDoAto = [];
  atos.forEach((a, i) => {
    const conta = new Map();
    for (const m of arr(obj(a) && a.marcos)) {
      for (const nome of [m && m.cidade, m && m.onde]) {
        const c = porNome.get(norm(nome));
        if (c) { conta.set(c.nome, (conta.get(c.nome) || 0) + 1); break; }
      }
    }
    let melhor = null, n = 0;
    for (const [nome, k] of conta) if (k > n) { melhor = nome; n = k; }
    cidadeDoAto.push(porNome.get(norm(melhor)) || cidadeDoAto[i - 1] || cidades[0] || null);
  });
  const km = (a, b) => { const d = kmEntre(a, b); return Number.isFinite(d) ? d : Infinity; };
  const perto = (c) => cidades.filter((x) => x !== c).sort((a, b) => km(c, a) - km(c, b) || norm(a.nome).localeCompare(norm(b.nome)));
  return { semente, cidades, porNome, locaisDe, genteDoSitio, genteDe, cidadeDoAto, km, perto };
}

/* ============================================================
   OS PAPÉIS — cada um com o que existe, uma vez
   preencher(q, ato, S) → { papeis, pessoas, lugares, tenentes, vazios,
     entrega } | null — `vazios`: os papéis de fraqueza de outra família;
   `entrega`: o papel que passa a ser a fraqueza do vilão, se esta quest a
   entrega.
   `S`: o estado do esqueleto em construção (quem já tem papel, o que as
   quests anteriores deixaram, os tenentes já postos). Só lê; quem regista
   o que ficou é quem aceita a quest.
   ============================================================ */
function refsDe(p) {
  return [p.vizinho, p.do, p.proximo, p.nasce, ...arr(p.entre)].filter((r) => typeof r === "string");
}

function preencher(q, ato, S, extra) {
  const W = S.W;
  const decl = obj(q.papeis) || {};
  const nomes = Object.keys(decl);
  const out = {};
  const cidadeDe = {};                 // papel → objeto da cidade onde ficou
  const localDe = {};                  // papel lugar → nome do sítio
  const pessoasAqui = new Set();
  const lugaresAqui = new Set();
  const cidadesAqui = new Set();
  const tenentesAqui = [];
  const vazios = [];
  let entrega = null;
  const cAto = W.cidadeDoAto[ato] || W.cidades[0];
  const tipo2 = q.tipo === 2;
  const ex = obj(extra) || {};
  const ocupada = (nome) => {
    const k = norm(nome);
    return !k || pessoasAqui.has(k) || S.pessoas.has(k) || S.proibidos.has(k) || (!tipo2 && S.nucleo.has(k));
  };

  /* o que a quest pede de uma anterior (`pede`: «tipo:papel») */
  for (const p of arr(q.pede)) {
    const [tipo, papel] = String(p).split(":");
    const dada = S.deixado.find((d) => d.tipo === tipo && !pessoasAqui.has(norm(d.nome)));
    if (!dada || !decl[papel]) return null;
    out[papel] = { nome: dada.nome, ...(dada.cidade ? { cidade: dada.cidade } : {}) };
    cidadeDe[papel] = W.porNome.get(norm(dada.cidade)) || cAto;
    pessoasAqui.add(norm(dada.nome));
  }

  const pickDe = (lista) => (lista.length ? lista[Math.floor(S.rnd() * lista.length)] : null);

  const umaCidade = (nome, p) => {
    if (Array.isArray(p.distancia) && p.distancia.length === 2) {
      const [a, b] = p.distancia.map((x) => Math.max(1, inteiro(x) || 1));
      const faixa = W.perto(cAto).slice(a - 1, b).filter((c) => !cidadesAqui.has(norm(c.nome)));
      const adiante = faixa.filter((c) => W.cidadeDoAto.slice(ato + 1).includes(c));
      return pickDe(adiante.length ? adiante : faixa) || W.perto(cAto).find((c) => !cidadesAqui.has(norm(c.nome))) || null;
    }
    if (!cidadesAqui.has(norm(cAto.nome))) return cAto;
    return W.perto(cAto).find((c) => !cidadesAqui.has(norm(c.nome))) || null;
  };

  const umLugar = (nome, p) => {
    let c = cAto;
    let evitar = null;
    /* o covil dele: um sítio da cidade do covil que a criação lhe deu */
    const covil = /covil/.test(String(p.e || "")) && S.vilao.papeis.covil ? W.porNome.get(norm(S.vilao.papeis.covil.cidade)) : null;
    if (covil) c = covil;
    else if (typeof p.vizinho === "string" && cidadeDe[p.vizinho]) { c = cidadeDe[p.vizinho]; evitar = localDe[p.vizinho] || null; }
    else if (Array.isArray(p.entre) && p.entre.length === 2 && cidadeDe[p.entre[0]] && cidadeDe[p.entre[1]]) {
      const [a, b] = [cidadeDe[p.entre[0]], cidadeDe[p.entre[1]]];
      const meio = W.cidades.filter((x) => x !== a && x !== b)
        .map((x) => ({ x, d: W.km(a, x) + W.km(x, b) - W.km(a, b) }))
        .filter((e) => Number.isFinite(e.d))
        .sort((u, v) => u.d - v.d || norm(u.x.nome).localeCompare(norm(v.x.nome)))[0];
      c = meio ? meio.x : a;
    }
    const todos = W.locaisDe(c).filter((l) => !lugaresAqui.has(norm(`${c.nome}|${l.nome}`)) && l.nome !== evitar);
    const livres = todos.filter((l) => !S.lugares.has(norm(`${c.nome}|${l.nome}`)));
    const l = pickDe(livres.length ? livres : todos);
    return l ? { c, l } : null;
  };

  /* a gente de uma cidade (e, se faltar, das vizinhas mais perto) */
  const alguem = (cidades, sitio) => {
    if (sitio) {
      const daqui = W.genteDoSitio(sitio.l).map((g) => ({ nome: g.nome, cidade: sitio.c.nome })).filter((g) => !ocupada(g.nome));
      if (daqui.length) return pickDe(daqui);
    }
    for (const c of cidades) {
      const g = W.genteDe(c).filter((x) => !ocupada(x.nome));
      if (g.length) return pickDe(g);
    }
    return null;
  };

  const umTenente = () => {
    const ts = S.vilao.tenentes.filter((t) => !tenentesAqui.includes(t.papel));
    if (!ts.length) return null;
    const passo = S.forma.passo[ato];
    const serve = ts.filter((t) => t.passo === passo && !S.tenenteDoPasso.has(t.papel));
    if (serve.length) return pickDe(serve);
    const fio = ts.filter((t) => S.tenentesUsados.has(t.papel));
    if (fio.length) return pickDe(fio);
    return pickDe(ts);
  };

  /* os papéis por passes: quem depende de outro espera por ele */
  const falta = nomes.filter((n) => !out[n]);
  let andou = true;
  while (falta.length && andou) {
    andou = false;
    for (let i = 0; i < falta.length; i++) {
      const nome = falta[i];
      const p = obj(decl[nome]) || {};
      if (refsDe(p).some((r) => decl[r] && !out[r] && r !== nome)) continue;
      let r = null;
      /* A FRAQUEZA (a exceção do cabeçalho): de outra família, fica vazio
         e declarado; já posta por uma quest anterior, é ela — o mesmo id;
         por pôr, esta quest entrega-a (o confronto nunca: o esqueleto põe-na
         antes de chegar a ele) */
      const deFraqueza = typeof p.fraqueza === "string";
      if (deFraqueza && p.fraqueza !== S.familia) {
        vazios.push(nome);
        falta.splice(i, 1); i--; andou = true;
        continue;
      }
      if (deFraqueza && S.fraquezaPosta) {
        const v = S.fraquezaPosta.papel;
        r = { nome: v.nome, ...(v.cidade ? { cidade: v.cidade } : {}), ...(v.chave ? { chave: v.chave } : {}) };
        cidadeDe[nome] = W.porNome.get(norm(v.cidade)) || cAto;
        if (v.tipo === "pessoa") pessoasAqui.add(norm(v.nome));
      } else if (deFraqueza && p.de === "item" && S.nomeDaCoisa) {
        r = { nome: S.nomeDaCoisa, cidade: cAto.nome };
        cidadeDe[nome] = cAto;
      } else if (p.de === "cidade") {
        const c = umaCidade(nome, p);
        if (c) { r = { cidade: c.nome }; cidadeDe[nome] = c; cidadesAqui.add(norm(c.nome)); }
      } else if (p.de === "lugar") {
        const s = umLugar(nome, p);
        if (s) {
          r = { nome: s.l.nome, cidade: s.c.nome, chave: idDoLocal(s.c.nome, s.l) };
          cidadeDe[nome] = s.c; localDe[nome] = s.l.nome; lugaresAqui.add(norm(`${s.c.nome}|${s.l.nome}`));
        }
      } else if (p.de === "elenco") {
        let pessoa = null;
        if (tipo2) {
          /* a ponte: primeiro alguém que já carrega uma quest do tipo 1 no
             ato da ponte (a forma mais forte, §5), depois a gente da cidade
             desse ato, e só então as outras cidades da janela */
          const partilha = arr(ex.partilhaveis)
            .filter((g) => !pessoasAqui.has(norm(g.nome)) && !S.proibidos.has(norm(g.nome)) && !S.coracaoUsado.has(norm(g.nome)));
          pessoa = pickDe(partilha);
          if (!pessoa) {
            const cs = [ex.cidadePonte, ...arr(ex.cidadesJanela)].filter(Boolean);
            pessoa = alguem([...new Set(cs)], null);
          }
        } else if (arr(p.exige).includes("querido_do_heroi")) {
          /* «querido do herói»: alguém do núcleo que ele conhece por dentro —
             a porta, a voz, o elo (o companheiro anda com ele, não é refém) —
             e só sem nenhum, a gente da cidade */
          const doNucleo = ESQUELETO.querido.map((pp) => S.nucleoPessoas.find((g) => g.papel === pp && !pessoasAqui.has(norm(g.nome)) && !S.proibidos.has(norm(g.nome)))).filter(Boolean);
          pessoa = doNucleo[0] ? { nome: doNucleo[0].nome, cidade: doNucleo[0].cidade || cAto.nome } : alguem([cAto, ...W.perto(cAto).slice(0, ESQUELETO.vizinhas)], null);
        } else {
          const sitio = typeof p.do === "string" && localDe[p.do] ? { c: cidadeDe[p.do], l: W.locaisDe(cidadeDe[p.do]).find((l) => l.nome === localDe[p.do]) } : null;
          const base = typeof p.proximo === "string" && cidadeDe[p.proximo] ? cidadeDe[p.proximo] : (sitio ? sitio.c : cAto);
          pessoa = alguem([base, ...W.perto(base).slice(0, ESQUELETO.vizinhas)], sitio && sitio.l ? sitio : null);
        }
        if (pessoa) { r = { nome: pessoa.nome, cidade: pessoa.cidade }; cidadeDe[nome] = W.porNome.get(norm(pessoa.cidade)) || cAto; pessoasAqui.add(norm(pessoa.nome)); }
      } else if (p.de === "fio") {
        if (p.papel === "vilao") {
          if (S.nomeDoVilao) r = { nome: S.nomeDoVilao };
        } else {
          const t = umTenente();
          if (t) { r = { nome: t.nome }; tenentesAqui.push(t.papel); }
        }
        if (r) cidadeDe[nome] = cAto;
      } else if (p.de === "grupo") {
        const ordem = [...new Set([ex.pontePor, "companheiro", ...arr(typeof p.ou === "string" ? [p.ou] : p.ou), ...ESQUELETO.grupo].filter(Boolean))];
        let quem = null;
        for (const papel of ordem) {
          quem = S.nucleoPessoas.find((g) => g.papel === papel && !S.coracaoUsado.has(norm(g.nome)) && !pessoasAqui.has(norm(g.nome)));
          if (quem) break;
        }
        if (quem) { r = { nome: quem.nome, ...(quem.cidade ? { cidade: quem.cidade } : {}) }; cidadeDe[nome] = W.porNome.get(norm(quem.cidade)) || cAto; pessoasAqui.add(norm(quem.nome)); }
      } else if (p.de === "item") {
        const nomeDoItem = texto(p.nome, ESQUELETO.nome) || texto(pickDe(arr(p.nomes).filter((x) => typeof x === "string")), ESQUELETO.nome) || nome.replace(/_/g, " ");
        const c = (typeof p.nasce === "string" && cidadeDe[p.nasce]) || cAto;
        r = { nome: nomeDoItem, ...(c ? { cidade: c.nome } : {}) };
        cidadeDe[nome] = c;
      }
      if (!r) return null;           // papel vazio: esta quest não nasce aqui
      if (deFraqueza && !S.fraquezaPosta) entrega = nome;
      out[nome] = r;
      falta.splice(i, 1); i--; andou = true;
    }
  }
  if (falta.length) return null;     // dependência que nunca se resolve
  return {
    papeis: out,
    pessoas: [...pessoasAqui],
    lugares: [...lugaresAqui],
    tenentes: tenentesAqui,
    vazios,
    entrega,
    cidadeDe,
  };
}

/* ============================================================
   O ESQUELETO
   esqueletoDaCampanha({ semente, mapa, espinha, genero, molde, lex,
     antecedente, cidadeInicial, chefes, nucleo, ferida, catalogo })
     → { v, estrutura, semente, atos, coracao, fraqueza, ordem, semQuest,
         semContestacao, vilao } | null
   `espinha`: a de `estenderEspinha` (e de `espinhaNaRegiao`, se houver) —
   dá os atos, a cidade de cada um e o fio. `chefes`: os de `chefesDoMundo`
   (calculam-se aqui se não vierem). `nucleo`: o de `nucleoDaCampanha`
   ({ pessoas: [{ nome, papel, cidade }] }) — é dele que sai quem ocupa um
   papel `de: "grupo"`. `catalogo`: as fichas (por omissão, a biblioteca
   inteira; só as que `validarQuest` aceita entram).
   ============================================================ */
export function esqueletoDaCampanha(entrada) {
  const o = obj(entrada);
  if (!o) return null;
  const espinha = obj(o.espinha);
  const mapa = obj(o.mapa);
  if (!espinha || !mapa || !arr(espinha.atos).length || !arr(mapa.cidades).length) return null;
  const fio = obj(espinha.fio) || {};
  if (!texto(fio.antagonista, ESQUELETO.nome)) return null;   // sem vilão não há fio
  const n = espinha.atos.length;
  const forma = formaPara(n);
  const W = mundoDe(o, espinha, mapa);
  if (!W.cidadeDoAto.length || !W.cidadeDoAto[0]) return null;

  /* 0. O VILÃO, primeiro */
  let chefes = arr(o.chefes);
  if (!chefes.length) {
    try { chefes = arr(chefesDoMundo(W.semente, mapa, o.genero || undefined, o.lex || null)); } catch { chefes = []; }
  }
  const reg0 = nascerOVilao({
    semente: W.semente,
    antecedente: o.antecedente != null && o.antecedente !== "" ? o.antecedente : fio.antecedente,
    fio, chefes, ferida: o.ferida,
    cidadeInicial: texto(o.cidadeInicial, ESQUELETO.nome) || W.cidadeDoAto[0].nome,
  });
  if (!reg0) return null;
  const vilao = { ...reg0, tenentes: reg0.tenentes.map((t) => ({ ...t })), papeis: { ...reg0.papeis } };
  const contraDoPasso = contraDosPassos(vilao.arquetipo);

  const catalogo = arr(o.catalogo === undefined ? BIBLIOTECA_DE_QUESTS : o.catalogo)
    .filter((q) => obj(q) && validarQuest(q).ok);
  const nucleoPessoas = arr(obj(o.nucleo) && o.nucleo.pessoas)
    .filter((p) => obj(p) && texto(p.nome, ESQUELETO.nome) && typeof p.papel === "string")
    .map((p) => ({ nome: texto(p.nome, ESQUELETO.nome), papel: p.papel, cidade: texto(p.cidade, ESQUELETO.nome) }));
  const rnd = dadoDo(W.semente, "esqueleto", espinha.estrutura || "", vilao.arquetipo);
  const fr = vilao.fraqueza ? FRAQUEZAS[vilao.fraqueza.familia].find((e) => e.id === vilao.fraqueza.id) || null : null;

  const S = {
    W, rnd, forma, vilao,
    /* o nome próprio, antes da vírgula — a régua de `nomeDoFio` (BQ5), para
       que o papel `vilao` de uma quest e o da ficha dele deem o mesmo id */
    nomeDoVilao: nomesDoVilao(fio).pop() || "",
    pessoas: new Set(),                       // quem já tem papel (elenco)
    lugares: new Set(),
    proibidos: new Set([...nomesDoVilao(fio), ...vilao.tenentes.map((t) => t.nome)].map(norm)),
    nucleo: new Set(nucleoPessoas.map((p) => norm(p.nome))),
    nucleoPessoas,
    coracaoUsado: new Set(),
    deixado: [],
    tenentesUsados: new Set(),
    tenenteDoPasso: new Map(),
    /* a fraqueza: a família (que papel de fraqueza se liga), o nome da coisa
       (quando é uma coisa, é por ele que `tem` a acha na bolsa) e, quando já
       posta, { papel, ato, quest } — o mesmo papel em todas as quests */
    familia: fr ? vilao.fraqueza.familia : null,
    nomeDaCoisa: fr && vilao.fraqueza.familia === "coisa" ? texto(fr.nome, ESQUELETO.nome) : "",
    fraquezaPosta: null,
  };
  const peso = (q) => (arr(q.afim).includes(espinha.estrutura) ? ESQUELETO.afim : ESQUELETO.base);
  const aceitar = (q, f, ato) => {
    if (f.entrega && !S.fraquezaPosta) {
      const r = f.papeis[f.entrega];
      const tipo = PAPEIS_DA_QUEST[q.papeis[f.entrega].de].tipo;
      S.fraquezaPosta = { papel: { tipo, nome: r.nome, ...(r.cidade ? { cidade: r.cidade } : {}), ...(r.chave ? { chave: r.chave } : {}) }, ato, quest: q.id };
    }
    for (const k of f.pessoas) S.pessoas.add(k);
    for (const k of f.lugares) S.lugares.add(k);
    for (const t of f.tenentes) S.tenentesUsados.add(t);
    for (const d of arr(q.deixa)) {
      const [tipo, papel] = String(d).split(":");
      const p = f.papeis[papel];
      if (p && p.nome && PAPEIS_DA_QUEST[(q.papeis[papel] || {}).de] && PAPEIS_DA_QUEST[q.papeis[papel].de].tipo === "pessoa") S.deixado.push({ tipo, nome: p.nome, cidade: p.cidade || "", de: q.id });
    }
  };

  /* A FRAQUEZA, quando nenhuma quest a entregou pelo papel: a quest da
     pista (§11.3; a consequência que é também pista conta) põe-na na cidade
     dela; sem nenhuma, fica no ato da pista da composição, à espera de quem
     a ache (o marco antigo). Corre antes do confronto — o confronto lê a
     fraqueza, nunca a põe — e, se ainda faltar, no fim. */
  const atos = [];
  const porAFraqueza = () => {
    if (S.fraquezaPosta || !fr) return;
    const comPista = atos.filter((a) => a.quest && maosDe(catalogo.find((q) => q.id === a.quest)).includes("pista") && arr(forma.comp[a.ato]).join() !== "confronto");
    const daPista = comPista.find((a) => arr(forma.comp[a.ato]).includes("pista")) || comPista[0] || null;
    const atoDaPista = daPista ? daPista.ato : Math.max(0, forma.comp.findIndex((c) => arr(c).includes("pista")));
    const c = W.cidadeDoAto[atoDaPista] || W.cidadeDoAto[0];
    let papel = null;
    if (S.familia === "pessoa") {
      for (const cc of [c, ...W.perto(c).slice(0, ESQUELETO.vizinhas)]) {
        const g = W.genteDe(cc).filter((x) => { const k = norm(x.nome); return !S.pessoas.has(k) && !S.proibidos.has(k) && !S.nucleo.has(k); });
        if (g.length) { const p = g[Math.floor(rnd() * g.length)]; papel = { tipo: "pessoa", nome: p.nome, cidade: p.cidade }; S.pessoas.add(norm(p.nome)); break; }
      }
    } else if (S.familia === "verdade") {
      const ls = W.locaisDe(c);
      const livres = ls.filter((l) => !S.lugares.has(norm(`${c.nome}|${l.nome}`)));
      const l = (livres.length ? livres : ls)[Math.floor(rnd() * (livres.length || ls.length))];
      if (l) { papel = { tipo: "lugar", nome: l.nome, cidade: c.nome, chave: idDoLocal(c.nome, l) }; S.lugares.add(norm(`${c.nome}|${l.nome}`)); }
    } else if (S.nomeDaCoisa) {
      papel = { tipo: "item", nome: S.nomeDaCoisa, cidade: c.nome };
    }
    if (papel) S.fraquezaPosta = { papel, ato: atoDaPista, quest: daPista ? daPista.quest : null };
  };

  /* 1. UM ATO, UMA QUEST DO TIPO 1 — pela mão que contesta o passo dele */
  const usadas = new Set();
  const tipo1 = catalogo.filter((q) => q.tipo === 1);
  for (let i = 0; i < n; i++) {
    const passo = forma.passo[i];
    const posicao = forma.quando[i];
    const maos = [...new Set([...arr(forma.comp[i]), ...arr(passo ? contraDoPasso[passo - 1] : [])])];
    const anterior = atos.length ? atos[atos.length - 1] : null;
    const familiaAnterior = anterior && anterior.quest ? (catalogo.find((q) => q.id === anterior.quest) || {}).enredo : undefined;
    let escolhida = null;
    if (arr(forma.comp[i]).includes("confronto")) porAFraqueza();
    if (passo) {
      for (const mao of maos) {
        const cand = tipo1.filter((q) => !usadas.has(q.id) && maosDe(q).includes(mao)
          && arr(q.mao.contra).includes(passo) && arr(q.quando).includes(posicao)
          && (q.enredo === undefined || q.enredo !== familiaAnterior));
        for (const q of ordenarPorPeso(rnd, cand, peso)) {
          const f = preencher(q, i, S);
          if (f) { escolhida = { q, f, mao }; break; }
        }
        if (escolhida) break;
      }
    }
    const cidade = W.cidadeDoAto[i] ? W.cidadeDoAto[i].nome : "";
    if (escolhida) {
      const { q, f, mao } = escolhida;
      usadas.add(q.id);
      aceitar(q, f, i);
      /* o tenente que é a mão desta quest passa a servir o passo dela: vencê-lo
         faz recuar ESTE passo (o relógio da BQ5 lê `tenente.passo`) */
      const papelDaMao = q.mao.papel;
      if (papelDaMao && f.papeis[papelDaMao]) {
        const t = vilao.tenentes.find((x) => norm(x.nome) === norm(f.papeis[papelDaMao].nome));
        if (t && !S.tenenteDoPasso.has(t.papel)) { t.passo = passo; S.tenenteDoPasso.set(t.papel, passo); }
      }
      atos.push({ ato: i, passo, posicao, maos, cidade, quest: q.id, mao, contra: [...q.mao.contra], papeis: f.papeis, ...(f.vazios.length ? { vazios: [...f.vazios] } : {}), fraqueza: false, _f: f });
    } else {
      atos.push({ ato: i, passo: passo || null, posicao, maos, cidade, quest: null, mao: null, contra: [], papeis: null, fraqueza: false });
    }
  }

  /* 2. A FRAQUEZA no registo: a que uma quest entregou, ou a posta */
  porAFraqueza();
  let fraqueza = null;
  if (S.fraquezaPosta) {
    vilao.papeis.fraqueza = { ...S.fraquezaPosta.papel };
    fraqueza = { familia: S.familia, id: fr.id, ato: S.fraquezaPosta.ato, quest: S.fraquezaPosta.quest };
    if (atos[S.fraquezaPosta.ato]) atos[S.fraquezaPosta.ato].fraqueza = true;
  }

  /* 3. O CORAÇÃO — as do tipo 2, cada uma na sua janela, pela ponte */
  const coracao = [];
  const tipo2 = catalogo.filter((q) => q.tipo === 2);
  const ponte = vilao.ponte || null;
  for (const janela of forma.janelas.slice(0, ESQUELETO.coracao)) {
    if (!janela.length) continue;
    const posicao = forma.quando[janela[0]];
    /* o ato da ponte: na janela, o do passo mais perto do passo da ponte;
       ponte de ferida, o último da janela (a cidade por onde o tipo 1 vai
       passar quando a história do coração aperta) */
    const atoPonte = ponte && ponte.de === "passo"
      ? [...janela].sort((a, b) => Math.abs((forma.passo[a] || 0) - ponte.passo) - Math.abs((forma.passo[b] || 0) - ponte.passo) || b - a)[0]
      : janela[janela.length - 1];
    const pa = atos[atoPonte];
    const partilhaveis = pa && pa.quest && pa._f
      ? Object.entries(pa.papeis).filter(([k]) => {
        const q = catalogo.find((x) => x.id === pa.quest);
        return q && q.papeis[k] && q.papeis[k].de === "elenco" && k !== q.mao.papel;
      }).map(([, p]) => ({ nome: p.nome, cidade: p.cidade }))
      : [];
    const extra = {
      pontePor: ponte && ponte.de === "ferida" ? ponte.com : null,
      cidadePonte: W.cidadeDoAto[atoPonte] || null,
      cidadesJanela: janela.map((k) => W.cidadeDoAto[k]).filter(Boolean),
      partilhaveis,
    };
    const cand = tipo2.filter((q) => !usadas.has(q.id) && arr(q.quando).includes(posicao));
    let feita = null;
    for (const q of ordenarPorPeso(rnd, cand, peso)) {
      const f = preencher(q, janela[0], S, extra);
      if (f) { feita = { q, f }; break; }
    }
    if (!feita) continue;
    const { q, f } = feita;
    usadas.add(q.id);
    aceitar(q, f, janela[0]);
    for (const k of f.pessoas) S.coracaoUsado.add(k);
    coracao.push({
      quest: q.id, atos: [...janela], papeis: f.papeis,
      ponte: ponte && ponte.de === "ferida"
        ? { de: "ferida", com: ponte.com, ato: atoPonte }
        : { de: "passo", passo: ponte ? ponte.passo : forma.passo[atoPonte] || null, ato: atoPonte },
    });
  }

  /* 4. OS LUGARES DOS PASSOS (passo_N): o sítio da quest que o contesta, ou
     um da cidade do ato onde ele cai; o último é o covil, se houver */
  for (let k = 1; k <= PASSOS; k++) {
    const a = atos.find((x) => x.quest && x.contra.includes(k));
    let p = null;
    if (a) {
      const q = catalogo.find((x) => x.id === a.quest);
      const nomeL = Object.keys(q.papeis).find((nm) => q.papeis[nm].de === "lugar") || Object.keys(q.papeis).find((nm) => q.papeis[nm].de === "cidade");
      const r = nomeL ? a.papeis[nomeL] : null;
      if (r) p = r.nome ? { tipo: "lugar", nome: r.nome, cidade: r.cidade, ...(r.chave ? { chave: r.chave } : {}) } : { tipo: "lugar", nome: r.cidade, cidade: r.cidade };
    }
    if (!p && k === PASSOS && vilao.papeis.covil) p = { ...vilao.papeis.covil };
    if (!p) {
      const i = Math.max(0, forma.passo.reduce((m, ps, idx) => (ps && ps <= k ? idx : m), 0));
      const c = W.cidadeDoAto[i] || W.cidadeDoAto[0];
      const ls = W.locaisDe(c);
      const l = ls.length ? ls[Math.floor(rnd() * ls.length)] : null;
      p = l ? { tipo: "lugar", nome: l.nome, cidade: c.nome, chave: idDoLocal(c.nome, l) } : { tipo: "lugar", nome: c.nome, cidade: c.nome };
    }
    vilao.papeis[`passo_${k}`] = p;
  }

  /* 5. A ORDEM, e o que fica por contar */
  const ordem = [];
  for (const a of atos) {
    if (a.quest) ordem.push({ id: a.quest, tipo: 1, ato: a.ato });
    for (const c of coracao) if (c.atos[0] === a.ato) ordem.push({ id: c.quest, tipo: 2, ato: a.ato });
  }
  const contestados = new Set(atos.flatMap((a) => a.contra));
  const registo = garantirRegistroDoVilao(vilao);
  if (!registo) return null;
  return {
    v: ESQUELETO.v,
    estrutura: String(espinha.estrutura || ""),
    semente: W.semente.slice(0, ESQUELETO.texto),
    atos: atos.map(({ _f, ...a }) => a),
    coracao,
    fraqueza,
    ordem,
    semQuest: atos.filter((a) => !a.quest).map((a) => a.ato),
    semContestacao: Array.from({ length: PASSOS }, (_, i) => i + 1).filter((k) => !contestados.has(k)),
    vilao: registo,
  };
}

/* ============================================================
   O SAVE — garantirEsqueleto(x) → esqueleto | null
   A catraca de `espinha.esqueleto`. Campo NOVO e aditivo: a versão antiga
   ignora-o. O vilão não mora aqui (mora em `espinha.fio.vilao`, com a
   catraca dele): uma verdade só, num sítio só. Lixo: null.
   ============================================================ */
const papeisGuardados = (x) => {
  const o = obj(x);
  if (!o) return null;
  const out = {};
  for (const [k, p] of Object.entries(o)) {
    const q = obj(p);
    if (!RX_ID.test(k) || !q) continue;
    const r = {};
    for (const c of ["nome", "cidade", "chave"]) { const v = texto(q[c], ESQUELETO.texto); if (v) r[c] = v; }
    if (Object.keys(r).length) out[k] = r;
  }
  return out;
};
const passoOk = (v) => { const n = inteiro(v); return n >= 1 && n <= PASSOS ? n : null; };
export function garantirEsqueleto(x) {
  const o = obj(x);
  if (!o || !Array.isArray(o.atos) || !o.atos.length) return null;
  const atos = o.atos.map((a, i) => {
    const b = obj(a) || {};
    const quest = typeof b.quest === "string" && RX_ID.test(b.quest) ? b.quest : null;
    return {
      ato: Number.isInteger(b.ato) && b.ato >= 0 ? b.ato : i,
      passo: passoOk(b.passo),
      posicao: QUANDO_DA_QUEST.includes(b.posicao) ? b.posicao : "meio",
      maos: arr(b.maos).filter((m) => MAOS_DO_VILAO[m]),
      cidade: texto(b.cidade, ESQUELETO.nome),
      quest,
      mao: quest && MAOS_DO_VILAO[b.mao] ? b.mao : null,
      contra: quest ? [...new Set(arr(b.contra).map(passoOk).filter(Boolean))] : [],
      papeis: quest ? papeisGuardados(b.papeis) || {} : null,
      ...(quest && arr(b.vazios).some((v) => typeof v === "string" && RX_ID.test(v)) ? { vazios: [...new Set(arr(b.vazios).filter((v) => typeof v === "string" && RX_ID.test(v)))] } : {}),
      fraqueza: !!b.fraqueza,
    };
  });
  const coracao = arr(o.coracao).map((c) => obj(c)).filter((c) => c && typeof c.quest === "string" && RX_ID.test(c.quest)).map((c) => {
    const p = obj(c.ponte) || {};
    return {
      quest: c.quest,
      atos: [...new Set(arr(c.atos).filter((k) => Number.isInteger(k) && k >= 0))],
      papeis: papeisGuardados(c.papeis) || {},
      ponte: p.de === "ferida" && typeof p.com === "string"
        ? { de: "ferida", com: texto(p.com, 20), ato: Number.isInteger(p.ato) ? p.ato : null }
        : { de: "passo", passo: passoOk(p.passo), ato: Number.isInteger(p.ato) ? p.ato : null },
    };
  }).slice(0, ESQUELETO.coracao);
  const f = obj(o.fraqueza);
  const fraqueza = f && FRAQUEZAS[f.familia] && FRAQUEZAS[f.familia].some((e) => e.id === f.id)
    ? { familia: f.familia, id: f.id, ato: Number.isInteger(f.ato) ? f.ato : 0, quest: typeof f.quest === "string" && RX_ID.test(f.quest) ? f.quest : null }
    : null;
  const ids = new Set([...atos.map((a) => a.quest), ...coracao.map((c) => c.quest)].filter(Boolean));
  return {
    v: ESQUELETO.v,
    estrutura: texto(o.estrutura, 20),
    semente: texto(o.semente, ESQUELETO.texto),
    atos,
    coracao,
    fraqueza,
    ordem: arr(o.ordem).map((e) => obj(e)).filter((e) => e && ids.has(e.id) && (e.tipo === 1 || e.tipo === 2))
      .map((e) => ({ id: e.id, tipo: e.tipo, ato: Number.isInteger(e.ato) ? e.ato : 0 })),
    semQuest: atos.filter((a) => !a.quest).map((a) => a.ato),
    semContestacao: [...new Set(arr(o.semContestacao).map(passoOk).filter(Boolean))],
  };
}

/* ============================================================
   A ESPINHA COM O ESQUELETO
   comOEsqueleto(espinha, esqueleto) → espinha nova | a mesma
   Põe `esqueleto` (sem o vilão) e `fio.vilao` (o registo, com a fraqueza e
   os lugares dos passos) numa espinha NOVA — a recebida não é tocada. Sem
   fio, sem esqueleto ou com lixo, devolve a espinha como veio: o mundo
   fica com a espinha antiga, e nada parte.
   ============================================================ */
export function comOEsqueleto(espinha, esqueleto) {
  const e = obj(espinha);
  const s = obj(esqueleto);
  if (!e || !s || !obj(e.fio)) return espinha;
  const guardado = garantirEsqueleto(s);
  const vilao = garantirRegistroDoVilao(s.vilao);
  if (!guardado || !vilao) return espinha;
  return { ...e, esqueleto: guardado, fio: { ...e.fio, vilao } };
}

/* ============================================================
   O QUE ABRE EM CADA ATO
   questsDoAto(esqueleto, ato) → [{ id, tipo, papeis }]
   O que a fiação (BQ7) passa a `abrirQuest` quando o herói entra no ato:
   a do tipo 1 do ato, e a do tipo 2 cuja janela começa nele. `papeis` é a
   forma que `abrirQuest` lê ({ nome, cidade, chave }); o id de cada um
   resolve-se lá, uma vez. Ato sem quest: lista vazia — e o ato vive dos
   marcos antigos.
   ============================================================ */
export function questsDoAto(esqueleto, ato) {
  const s = garantirEsqueleto(esqueleto);
  if (!s || !Number.isInteger(ato)) return [];
  const out = [];
  const a = s.atos.find((x) => x.ato === ato);
  if (a && a.quest) out.push({ id: a.quest, tipo: 1, papeis: { ...a.papeis } });
  for (const c of s.coracao) if (c.atos[0] === ato) out.push({ id: c.quest, tipo: 2, papeis: { ...c.papeis } });
  return out;
}
