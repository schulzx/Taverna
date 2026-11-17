/* ============================================================
   AS PEÇAS · A PEÇA DE UMA ETAPA (17/11/2026, Fase A da prova) — src/pecas/peca.js

   aPecaDaEtapa(registo, etapa, estado, opcoes) → a peça:
     { quest, etapa, faltam, cena: { quem, oQue, onde }, solucoes, relogio,
       pistas, carta }

   1. Os factos que faltam: o `conclui` da etapa, mais o que o clímax lhe
      exige (O_CLIMAX_DA_QUEST), lidos com a mesma `avaliarCondicao` que a
      quest usa — só os átomos ainda falsos, nos ramos ainda por cumprir
      (o `nenhum` é veto, não caminho: não entra).
   2. O molde de cada facto (moldes.js), com o alvo posto; a mesma solução
      para o mesmo alvo vinda de dois factos (esteve + esta_em; derrotou +
      encontrou) é UMA, e escreve os dois.
   3. As exceções da etapa: o campo opcional `pecas` da etapa, ou a tabela
      da prova (excecoes-da-prova.js), por id de quest/etapa.
   4. A cena fechada: quem o sistema põe aqui (quemEstaAqui/quemAgeAqui),
      mais as pessoas da quest cujo sítio é este (o `local` do papel), mais
      quem é do vilão quando o herói está no covil do clímax.
   5. As pistas: uma por solução — o caminho do quadro (CAMINHOS_DA_CARTA)
      que usa esta ação, ou a frase da tabela PISTA_DA_ACAO.

   PURO E DETERMINÍSTICO: nenhuma sorte; o mesmo estado dá a mesma peça.
   O `null` e o lixo dão null — nunca lançam.
   ============================================================ */
import { questPorId, oClimaxDaQuest } from "../biblioteca-de-quests.js";
import { avaliarCondicao } from "../condicoes-da-quest.js";
import { quemEstaAqui, quemAgeAqui } from "../quem-esta-aqui.js";
import { CAMINHOS_DA_CARTA } from "../quadro-da-quest.js";
import { moldeDe, numeroDaSolucao, FAMILIA_DA_ACAO, ACOES_SEM_CATALOGO, VANTAGEM_DA_SETA } from "./moldes.js";
import { EXCECOES_DA_PROVA } from "./excecoes-da-prova.js";
import { relogioDaPeca, memoriaDe } from "./calor.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const sem = (x) => String(x == null ? "" : x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const semArtigo = (x) => sem(x).replace(/^(o|a|os|as)\s+/, "");
const RX_PAPEL = /^(papel|lugar|item):([a-z0-9_]+)$/;
const TIPO_DO_PREFIXO = Object.freeze({ papel: "pessoa", lugar: "lugar", item: "objeto" });

/* A pista das ações que o quadro não tem caminho para dizer. Frase de
   mundo, curta, com o nome do alvo — é a TABELA que o aquecimento planta;
   nunca prosa sorteada. */
export const PISTA_DA_ACAO = Object.freeze({
  lutar: "{nome} não vai sair dali sem luta",
  fugir: "há por onde recuar, se for preciso",
  capturar: "uma corda e mãos firmes podiam prender {nome} vivo",
  furtar_se: "chegar a {nome} sem ser visto daria a vantagem",
  intimidar: "{nome} tem medo de alguma coisa — e pode ter de você",
  mentir: "{nome} acredita no que quer ouvir",
  atuar: "{nome} gosta de quem sabe contar uma história",
  seguir_alguem: "seguir {nome} sem ser notado diria muito",
  rastrear: "há marcas no chão que levam a {nome}",
  orientar: "o caminho para {nome} se conhece pelas ruas de trás",
  escalar: "por cima se chega a {nome} sem passar pela porta",
  tranca: "a entrada de {nome} cede a quem a forçar",
  escutar: "em {nome} se ouve o que ninguém conta",
  investigar: "em {nome} os vestígios contam o que aconteceu",
  bater_carteira: "{nome} anda à cinta de quem não repara",
  acalmar_bicho: "{nome} se acalma com quem conhece os modos dele",
  escolher: "a escolha é sua, e custa dos dois lados",
});

/* ---------------- OS FACTOS QUE FALTAM ---------------- */
function contextoDaQuest(R, E, mundo) {
  const feitas = {}, escolhas = {};
  for (const k of Object.keys(obj(R.feitas) || {})) if (R.feitas[k]) feitas[k] = true;
  for (const [k, v] of Object.entries(obj(R.escolhas) || {})) if (obj(v) && typeof v.opcao === "string") escolhas[k] = v.opcao;
  return { estado: E, papeis: obj(R.papeis) || {}, mundo, quest: { feitas, escolhas } };
}
function faltasDe(cond, ctx, out) {
  if (!Array.isArray(cond) || typeof cond[0] !== "string") return;
  if (avaliarCondicao(cond, ctx)) return;
  const h = cond[0];
  if (h === "nenhum") return;
  if (h === "todos" || h === "algum") { for (const c of cond.slice(1)) faltasDe(c, ctx, out); return; }
  if (h === "pelo_menos") { for (const c of cond.slice(2)) faltasDe(c, ctx, out); return; }
  if (!out.some((x) => JSON.stringify(x) === JSON.stringify(cond))) out.push(cond);
}
/* faltamNaEtapa(registo, etapa, estado, mundo) → [átomo] */
export function faltamNaEtapa(R, etapa, E, mundo) {
  const F = questPorId(R && R.id);
  if (!F || !obj(etapa)) return [];
  const ctx = contextoDaQuest(R, E, mundo);
  const out = [];
  const climax = obj(oClimaxDaQuest(F)[etapa.id]);
  for (const c of arr(climax && climax.exige)) faltasDe(c, ctx, out);
  faltasDe(etapa.conclui, ctx, out);
  return out;
}

/* o alvo de um átomo: o papel e quem o ocupa, com o nome que o herói pode
   dizer (a alcunha de quem é do vilão antes de o ver — a regra da
   vistaDosPapeis da biblioteca) */
function alvoDo(atomo, F, R, ctx) {
  if (atomo[0] === "escolheu") return { tipo: "escolha", papel: atomo[1], opcao: atomo[2], nome: atomo[2], id: `${atomo[1]}:${atomo[2]}` };
  const m = typeof atomo[1] === "string" ? atomo[1].match(RX_PAPEL) : null;
  if (!m) return null;
  const p = obj((obj(R.papeis) || {})[m[2]]) || {};
  const decl = obj((obj(F.papeis) || {})[m[2]]) || {};
  let nome = typeof p.nome === "string" && p.nome ? p.nome : "";
  if (typeof decl.alcunha === "string" && !(p.id && avaliarCondicao(["conheceu", `papel:${m[2]}`], ctx))) nome = decl.alcunha;
  return { tipo: TIPO_DO_PREFIXO[m[1]], papel: m[2], nome, id: typeof p.id === "string" ? p.id : "", local: typeof p.local === "string" ? p.local : "" };
}

/* ---------------- A CENA FECHADA ---------------- */
const nomeiaSitio = (local, sitio) => { const s = semArtigo(sitio); return s.length >= 4 && sem(local).includes(s); };
export function aCenaDaPeca(F, R, etapa, E) {
  const L = obj(E.lugar) || (typeof E.lugar === "string" ? { nome: E.lugar } : null);
  const ondeNome = L && typeof L.nome === "string" ? L.nome : "";
  let presentes = [];
  /* A2: o ofício (o `rotulo` do sítio) e o género viajam com a pessoa — é
     por eles que «o tratador», «a taverneira», «ela» acham alguém da cena */
  try { presentes = quemAgeAqui(quemEstaAqui(E)).map((n) => ({ nome: String(n.nome), papel: String(n.papel || ""), deOnde: n.deOnde || "elenco", oficio: String(n.rotulo || n.oficio || ""), genero: String(n.genero || "") })); } catch { presentes = []; }
  const quem = [...presentes];
  const climax = obj(oClimaxDaQuest(F)[etapa.id]) || null;
  const covil = climax && climax.covil ? obj(R.papeis[climax.covil]) : null;
  const noCovil = !!covil && !!ondeNome && semArtigo(covil.nome) === semArtigo(ondeNome);
  for (const [k, d] of Object.entries(obj(F.papeis) || {})) {
    const p = obj(R.papeis[k]) || {};
    if (!p.nome || (d.de !== "elenco" && d.de !== "fio")) continue;
    const aqui = d.de === "fio" ? noCovil && climax && climax.hostil === k : !!ondeNome && nomeiaSitio(p.local || "", ondeNome);
    if (!aqui) continue;
    /* quem já está pelo sítio e É o papel da quest leva o papel consigo
       (A2: sem isto «o tratador» não achava Corwin, que entrou pelo sítio) */
    const ja = quem.findIndex((x) => sem(x.nome) === sem(p.nome));
    if (ja >= 0) { if (!quem[ja].papel) quem[ja] = { ...quem[ja], papel: k }; continue; }
    quem.push({ nome: p.nome, papel: k, deOnde: d.de === "fio" ? "covil" : "papel", oficio: "", genero: "" });
  }
  const oQue = [];
  if (ondeNome) oQue.push({ tipo: "lugar", nome: ondeNome });
  return { quem, oQue, onde: { nome: ondeNome, cidade: (L && L.cidade) || E.cidadeAtual || "" } };
}

/* a solução já pode acionar-se com a cena de agora? */
function estaAVista(s, cena) {
  if (s.pede === "presente") return cena.quem.some((q) => sem(q.nome) === sem(s.alvo.nome) || (s.alvo.papel && q.papel === s.alvo.papel));
  if (s.pede === "noLugar") return !!cena.onde.nome && (semArtigo(cena.onde.nome) === semArtigo(s.alvo.lugarNome || s.alvo.nome));
  if (s.pede === "alguem") return cena.quem.length > 0;
  return true;
}

/* a pista de uma solução */
function pistaDe(s) {
  const forma = s.alvo.tipo === "lugar" ? "lugar" : s.alvo.tipo === "objeto" ? "objeto" : "pessoa";
  const acaoDoQuadro = s.acao === "pagar" ? null : s.acao;
  const cam = arr(CAMINHOS_DA_CARTA[forma]).find((c) => (s.acao === "pagar" ? c.id === "pagar" || c.id === "negociar" : c.desafios.includes(acaoDoQuadro)));
  const modelo = cam ? cam.diz : PISTA_DA_ACAO[s.acao] || "";
  return { solucao: s.id, diz: modelo.replace("{nome}", s.alvo.nome || "isto"), de: cam ? `quadro:${forma}:${cam.id}` : modelo ? `tabela:${s.acao}` : "" };
}

/* as exceções da etapa: o campo opcional `pecas`, senão a tabela da prova */
export function excecoesDaEtapa(questId, etapa) {
  const daEtapa = obj(etapa && etapa.pecas);
  if (daEtapa) return daEtapa;
  return obj((obj(EXCECOES_DA_PROVA[questId]) || {})[etapa && etapa.id]) || null;
}

/* ---------------- MONTAR ----------------
   A peça a partir dos átomos com alvo, das exceções e da cena. É a mesma
   conta para a etapa de uma quest e para a peça-molde de um facto só. */
function montarAPeca(m0) {
  const { quest, etapa, texto, alvos, exc, cena, forcada, relogio, ameaca } = m0;
  const porChave = new Map();
  for (const { atomo, alvo } of alvos) {
    const m = moldeDe(atomo[0]);
    if (!m || !alvo) continue;
    const ex = obj(obj(exc.solucoes) && exc.solucoes[atomo[0]]) || {};
    const tira = new Set(arr(ex.tira));
    const base = [...m.solucoes.filter((s) => !tira.has(s.id)), ...arr(ex.poe)];
    const chaveDoAlvo = alvo.tipo === "escolha" ? alvo.id : alvo.papel;
    for (const s of base) {
      const id = `${s.id}@${chaveDoAlvo}`;
      const ja = porChave.get(id);
      const seta = (lado) => (!lado ? null : { ...lado, ...(lado.para ? { para: `${lado.para}@${chaveDoAlvo}` } : {}), ...(lado.vantagem ? { bonus: VANTAGEM_DA_SETA[lado.vantagem] } : {}) });
      /* a mesma solução vinda de dois factos: o sucesso escreve os dois;
         a falha que escreve (com preço) ganha à que só aponta ou só cobra
         — perder a luta contra a besta é tê-la encontrado (encontrou), e
         não a ter derrotado */
      if (ja) {
        if (s.sucesso && s.sucesso.fato) ja.fatos.push(atomo);
        if (s.falha && s.falha.escreve) { ja.fatosNaFalha.push(atomo); if (!(ja.falha && ja.falha.escreve)) ja.falha = seta(s.falha); }
        continue;
      }
      const num = s.semDado ? null : numeroDaSolucao(s, { ameaca });
      porChave.set(id, {
        id, base: s.id, acao: s.acao, familia: FAMILIA_DA_ACAO[s.acao] || "", pede: s.pede,
        alvo: { ...alvo, ...(atomo[0] === "esteve" || atomo[0] === "esta_em" || atomo[0] === "descobriu" ? { lugarNome: alvo.nome } : {}) },
        fatos: s.sucesso && s.sucesso.fato ? [atomo] : [],
        fatosNaFalha: s.falha && s.falha.escreve ? [atomo] : [],
        como: s.sucesso && s.sucesso.como ? s.sucesso.como : null,
        sucesso: seta(s.sucesso), falha: seta(s.falha),
        fecha: s.fecha !== false, semDado: !!s.semDado,
        dc: num ? num.dc : null, pericia: num ? num.pericia : "", luta: !!(num && num.luta), numeroDe: num ? num.de : null,
        custa: (ACOES_SEM_CATALOGO[s.acao] && ACOES_SEM_CATALOGO[s.acao].custa) || null,
      });
    }
  }
  /* a seta que aponta para uma solução que a exceção tirou cai no preço
     de continuar — nunca num buraco */
  const solucoes0 = [...porChave.values()].map((s) => {
    const conserta = (lado) => (lado && lado.para && !porChave.has(lado.para) ? { preco: "tempo", continua: true, tirada: lado.para } : lado);
    return { ...s, sucesso: s.sucesso && s.sucesso.para && !porChave.has(s.sucesso.para) ? { recua: true } : s.sucesso, falha: conserta(s.falha) };
  });
  const oQue = [...cena.oQue];
  for (const s of solucoes0) if (s.alvo.tipo === "lugar" && !oQue.some((x) => sem(x.nome) === sem(s.alvo.nome))) oQue.push({ tipo: "lugar", nome: s.alvo.nome, sabido: true });
  for (const s of solucoes0) if (s.alvo.tipo === "objeto" && s.alvo.nome && !oQue.some((x) => sem(x.nome) === sem(s.alvo.nome))) oQue.push({ tipo: "objeto", nome: s.alvo.nome, sabido: true });
  const cenaFinal = { ...cena, oQue };
  /* a forçada pelo relógio (calor.js, oMundoCobra) fica à vista: o mundo
     trouxe-a */
  const solucoes = solucoes0.map((s) => Object.freeze({ ...s, aVista: s.id === forcada || estaAVista(s, cenaFinal), ...(s.id === forcada ? { forcada: true } : {}) }));
  const pistas = solucoes.map((s) => {
    const doExc = obj(exc.pistas) && typeof exc.pistas[s.base] === "string" ? { solucao: s.id, diz: exc.pistas[s.base].replace("{nome}", s.alvo.nome), de: "excecao" } : null;
    return doExc || pistaDe(s);
  });
  return Object.freeze({
    quest, etapa, texto,
    faltam: Object.freeze(alvos.map((x) => x.atomo)),
    cena: Object.freeze(cenaFinal),
    solucoes: Object.freeze(solucoes),
    relogio: Object.freeze(relogio),
    pistas: Object.freeze(pistas),
    carta: solucoes.length > 0 && solucoes.every((s) => s.semDado),
    evento: exc.evento || null,
  });
}

/* ---------------- A PEÇA ---------------- */
export function aPecaDaEtapa(registo, etapa, estado, opcoes) {
  try {
    const R = obj(registo);
    const F = R && questPorId(R.id);
    if (!F) return null;
    const E = obj(estado) || {};
    const o = obj(opcoes) || {};
    const mundo = obj(o.mundo) || obj(E.mundo) || null;
    const ctx = contextoDaQuest(R, E, mundo);
    const feitas = obj(R.feitas) || {};
    const e = typeof etapa === "string" ? F.etapas.find((x) => x.id === etapa)
      : obj(etapa) ? etapa : F.etapas.find((x) => !feitas[x.id]);
    if (!e) return null;
    /* `semExcecoes`: a peça só dos moldes (a medida da cobertura) */
    const exc = o.semExcecoes ? {} : excecoesDaEtapa(F.id, e) || {};
    const alvos = faltamNaEtapa(R, e, E, mundo).map((atomo) => ({ atomo, alvo: alvoDo(atomo, F, R, ctx) })).filter((x) => x.alvo);
    return montarAPeca({
      quest: F.id, etapa: e.id, texto: e.texto, alvos, exc,
      cena: aCenaDaPeca(F, R, e, E),
      forcada: memoriaDe(E, { quest: F.id, etapa: e.id }).forcada,
      relogio: relogioDaPeca(F, e, exc), ameaca: o.ameaca,
    });
  } catch {
    return null;
  }
}

/* ---------------- A PEÇA-MOLDE ----------------
   aPecaDoMolde(predicado, alvo, cena) → a peça de um facto só, sem quest:
   o controlo da medida (a mesma frase contra o molde nu) e a prova de que
   o molde fecha sozinho. `alvo`: { tipo, papel, nome }; `cena`: { quem,
   oQue, onde }. */
export function aPecaDoMolde(predicado, alvo, cena, opcoes) {
  try {
    const a = obj(alvo);
    if (!moldeDe(predicado) || !a) return null;
    const o = obj(opcoes) || {};
    const prefixo = a.tipo === "lugar" ? "lugar" : a.tipo === "objeto" ? "item" : "papel";
    const atomo = predicado === "escolheu" ? ["escolheu", a.papel || "escolha", a.opcao || "sim"] : [predicado, `${prefixo}:${a.papel || "alvo"}`];
    const c = obj(cena) || {};
    return montarAPeca({
      quest: "molde", etapa: predicado, texto: predicado,
      alvos: [{ atomo, alvo: predicado === "escolheu" ? { tipo: "escolha", papel: atomo[1], opcao: atomo[2], nome: atomo[2], id: `${atomo[1]}:${atomo[2]}` } : { ...a, papel: a.papel || "alvo" } }],
      exc: {}, cena: { quem: arr(c.quem), oQue: arr(c.oQue), onde: obj(c.onde) || { nome: "", cidade: "" } },
      forcada: null, relogio: relogioDaPeca({ temperatura: o.temperatura || "brasa" }, null, null), ameaca: o.ameaca,
    });
  } catch {
    return null;
  }
}

/* ---------------- A ETAPA FECHA SÓ COM OS MOLDES? ----------------
   fechaComMoldes(condicao) → true quando a condição pode ficar verdade
   só pelos factos que algum molde escreve: o átomo com molde; o «todos»
   com todos; o «algum» com um; o «pelo menos N» com N; o «nenhum» é veto
   e não pede nada. `semMolde` junta os predicados que faltam. */
/* os predicados que o próprio sistema torna verdade, sem ação do herói:
   a outra etapa da quest que fecha, e o dia que passa */
export const DO_PROPRIO_SISTEMA = Object.freeze(["etapa", "dia"]);
export function fechaComMoldes(cond, semMolde) {
  const falta = Array.isArray(semMolde) ? semMolde : [];
  if (!Array.isArray(cond) || typeof cond[0] !== "string") return false;
  const h = cond[0];
  if (h === "nenhum") return true;
  if (h === "todos") return cond.slice(1).map((c) => fechaComMoldes(c, falta)).every(Boolean);
  if (h === "algum") return cond.slice(1).map((c) => fechaComMoldes(c, falta)).some(Boolean);
  if (h === "pelo_menos") return cond.slice(2).map((c) => fechaComMoldes(c, falta)).filter(Boolean).length >= (Number.isInteger(cond[1]) ? cond[1] : Infinity);
  if (moldeDe(h) || DO_PROPRIO_SISTEMA.includes(h)) return true;
  if (!falta.includes(h)) falta.push(h);
  return false;
}
