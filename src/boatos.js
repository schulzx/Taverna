/* ============================================================
   O BOATO QUE SE CONFIRMA PELO DESENHO (Fase 4, trilha B · 29/10/2026) — src/boatos.js

   O Matt pergunta à mesa «quem vos contou isso?» porque sabe que o que se
   ouve numa taverna não é o que se encontra na estrada. O jogo já ouvia:
   desde 28/10 o Cronista marca `dito` no cânone e na gente que só existem
   na fala de alguém (motor/cronista.js#julgarCanone e #julgarGente; a marca
   é npcs.js#MARCA_DO_DITO), e cada masmorra do mundo nasce com o seu rumor
   (mundo-base.js#RUMORES, que o system já manda o povo comentar). Faltava o
   outro lado: o dia em que o herói CHEGA ao sítio de que se falava e o
   mundo lhe responde se era verdade. Sem isto, o boato ficava boato para
   sempre — ou, pior, o Narrador confirmava-o por cortesia, e o «dito» não
   pesava nada.

   ---------------- A REGRA ----------------

   · AS FONTES: a pessoa do registo com `dito` (o seu `local`), a entrada do
     cânone com `dito` (o seu `local`, ou o próprio nome quando o nome é o
     sítio — «Cerco de Pedra Rasa»), e o rumor da masmorra do mundo em que o
     herói entra.
   · A CHEGADA: o boato cujo sítio é o lugar, a masmorra ou a cidade em que
     o herói está AGORA (o nome inteiro, sem o artigo, ou sem a cabeça
     genérica — a tabela de cabeças é a da mesa do buraco, uma tabela só).
     Na estrada e na luta não se revela nada; numa masmorra, só o que é
     dela. O que se disse HOJE da cidade em que se está não conta como
     chegada à cidade (foi dito aqui; o sítio dentro dela ainda conta).
   · O VEREDITO, por semente: `rngDe(semente|boato|fonte|nome)` contra
     CHANCES_DO_BOATO da fonte, com a confiança de quem contou
     (CONFIANCA_DE_QUEM_CONTOU: o amigo mente menos, o rival mais). A mesma
     semente dá o mesmo veredito em qualquer máquina e em qualquer ordem de
     chegada — o veredito é um facto do mundo, não do turno.
   · A FORMA de cada veredito numa tabela (FORMAS_DO_BOATO): a meia-verdade
     da pessoa (partiu para outra cidade — um rasto a seguir —, ou não é
     quem diziam), a da coisa (arruinada, de outro dono), a do rumor (o
     perigo é real, mas outro); a mentira é isca (alguém quis o herói aqui),
     confusão (falavam de outro sítio) ou medo (ninguém viu).
   · A SURPRESA TEM DE SER JUSTA. O sítio em que o herói está a pisar não
     pode «nunca ter existido»: o cânone cujo nome é o próprio lugar e que
     nada mais afirma é verdade por força. A meia-verdade «partiu» só existe
     quando há outra cidade no mapa para onde ir.

   ---------------- A MENTIRA DEIXA RASTO ----------------

   Quem contou sai da própria marca («dito por Brom, não fato») ou, quando a
   marca não o diz (o Cronista escreve «alguém em cena»), das narrações
   guardadas: a última fala do Mestre em que o nome do boato está dentro de
   aspas ou de travessão, e a pessoa do registo nomeada mais perto dela, no
   mesmo parágrafo (QUEM_CONTOU). Na mentira, as `notas` dela ganham o que
   fez («mentiu sobre Clarissa: era isca»), e a linha da pauta di-lo ao
   Narrador — é o que deixa o herói ir cobrá-la. A confusão e o medo também
   ficam nas notas, com a culpa que têm (enganou-se; repetiu um medo).

   ---------------- O QUE MUDA NO ESTADO (sem campo novo no save) ----------------

     verdade → a ficha perde o `dito` e vira facto;
     meia    → perde o `dito`, as `notas` ganham a forma (e, se partiu, o
               `local` é a cidade para onde foi);
     mentira → a pessoa do registo fica `status: "nunca existiu"` (o elenco
               só põe em cena quem existe: cena.js#FORA_DE_CENA); a entrada
               do cânone sai, e entra «Boato de <nome>» (o boato vira facto:
               alguém o espalhou);
     rumor   → entra «Rumor de <masmorra>» no cânone, com o veredito.

   O cânone, o registo, as `notas`, o `local` e o `status` já são do save, e
   nenhum muda de forma. É a entrada «Boato de…»/«Rumor de…» (e a marca nas
   notas da verdade e da meia) que impede a SEGUNDA revelação.

   ---------------- O NARRADOR NÃO VÊ ANTES ----------------

   O veredito só nasce no turno em que bate: antes da chegada, nem a pauta
   nem o pedido o têm (a suíte prova-o). E o estado só muda se a linha
   chegou ao texto que foi ao Narrador (`oBoatoQueChegou`): se o teto da
   pauta a cortou, o boato fica como estava e volta no turno seguinte.

   ---------------- O QUE SAI ----------------

     CHANCES_DO_BOATO, CONFIANCA_DE_QUEM_CONTOU, FORMAS_DO_BOATO,
     QUEM_CONTOU, BOATO                      → as tabelas
     oBoatoDaChegada(estado, chegada, sorte) → { estado, linhaDaPauta, nota }
     oBoatoQueChegou(revelado, texto)        → { canone, npcs } | null

   `estado`: { canone, npcs, cidadeAtual, lugar, masmorra, mapa, combate,
   jornada, dia, mensagens, heroi }. `chegada`: { cidade, lugar, masmorra }
   (os nomes onde o herói está; sem ela, os do estado). `sorte`: a semente
   do mundo (texto) ou um gerador `() => [0,1)`. Puro: nunca muta o
   recebido; lixo (`null`, `{}`, listas tortas) dá o vazio, nunca lança.
   ============================================================ */

import { rngDe } from "./geografia.js";
import { masmorrasDoMundo } from "./mundo-base.js";
import { MESA_DO_BURACO } from "./mesa-do-buraco.js";
import { FORA_DE_CENA } from "./cena.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const arr = (x) => (Array.isArray(x) ? x : []);
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/\s+/g, " ").trim();
const semArtigo = (s) => String(s).replace(/^(o|a|os|as)\s+/, "").trim();

/* ---------------- AS TABELAS ----------------
   CHANCES_DO_BOATO: a fatia de cada veredito por fonte (somam 1; a ordem
   é a do sorteio). A pessoa e a coisa ouvidas numa fala são meio a meio
   verdade; o rumor da masmorra, que corre há anos de boca em boca, um
   pouco menos. */
export const CHANCES_DO_BOATO = Object.freeze({
  pessoa: Object.freeze({ verdade: 0.5, meia: 0.3, mentira: 0.2 }),
  coisa: Object.freeze({ verdade: 0.5, meia: 0.3, mentira: 0.2 }),
  masmorra: Object.freeze({ verdade: 0.45, meia: 0.35, mentira: 0.2 }),
});

/* A confiança de quem contou: a fatia da mentira multiplicada pela relação
   que o herói tem com quem a contou; o que ela perde (ou ganha) sai da
   verdade. O amigo engana-se menos; o rival e o inimigo mentem mais. Quem
   não está aqui (ou ninguém sabe quem foi) conta como 1. */
export const CONFIANCA_DE_QUEM_CONTOU = Object.freeze({
  amigo: 0.5, aliado: 0.5, familia: 0.5, romance: 0.5,
  rival: 1.75, inimigo: 1.75,
});

/* As formas. `texto` é o que a pauta diz; `nota` o que fica nas notas da
   ficha; `deQuem` o que fica nas notas de quem contou (só na mentira).
   `{nome}`, `{onde}` e `{para}` enchem-se. */
export const FORMAS_DO_BOATO = Object.freeze({
  verdade: Object.freeze({
    pessoa: Object.freeze([Object.freeze({ id: "aqui", texto: "existe e está aqui, como diziam", nota: "visto pelo herói: era verdade" })]),
    coisa: Object.freeze([Object.freeze({ id: "aqui", texto: "existe e é como diziam", nota: "visto pelo herói: era verdade" })]),
    masmorra: Object.freeze([Object.freeze({ id: "real", texto: "é verdade, e o lugar mostra-o", nota: "era verdade" })]),
  }),
  meia: Object.freeze({
    pessoa: Object.freeze([
      Object.freeze({ id: "partiu", texto: "existe, mas já não está aqui: partiu para {para}", nota: "partiu de {onde} para {para} antes de o herói chegar", precisa: "outraCidade" }),
      Object.freeze({ id: "outra", texto: "existe e está aqui, mas não é quem diziam", nota: "meia-verdade: não é quem diziam" }),
    ]),
    coisa: Object.freeze([
      Object.freeze({ id: "arruinado", texto: "existe, mas arruinado", nota: "meia-verdade: existe, mas arruinado" }),
      Object.freeze({ id: "outroDono", texto: "existe, mas é de outro dono", nota: "meia-verdade: existe, mas é de outro dono" }),
    ]),
    masmorra: Object.freeze([Object.freeze({ id: "outroPerigo", texto: "o perigo é real, mas é outro", nota: "meia-verdade: o perigo é real, mas outro" })]),
  }),
  mentira: Object.freeze([
    Object.freeze({ id: "isca", texto: "era isca: alguém quis o herói aqui", nota: "era isca: alguém quis o herói aqui", deQuem: "mentiu sobre {nome}: era isca" }),
    Object.freeze({ id: "confusao", texto: "era confusão: falavam de outro sítio", nota: "era confusão: falavam de outro sítio", deQuem: "enganou-se sobre {nome}: falava de outro sítio" }),
    Object.freeze({ id: "medo", texto: "era medo: ninguém viu", nota: "era medo: ninguém viu", deQuem: "repetiu um medo sobre {nome}: ninguém viu" }),
  ]),
});

/* Como se acha quem contou, quando a marca não o diz: as últimas
   `mensagens` falas do Mestre, e a pessoa do registo nomeada a menos de
   `letras` letras da menção, no mesmo parágrafo. `semQuem` é o que o
   Cronista escreve quando não sabe (motor/cronista.js, `fatos.semQuem`). */
export const QUEM_CONTOU = Object.freeze({ mensagens: 60, letras: 240, minimo: 3, semQuem: "alguém em cena" });

/* O resto da regra: os rótulos das entradas do cânone, o status da pessoa
   que nunca existiu, o veredito por extenso, quantos boatos por turno, e
   os vizinhos para onde a pessoa que partiu pode ter ido. */
export const BOATO = Object.freeze({
  boatoDe: "Boato de ",
  rumorDe: "Rumor de ",
  tipo: "boato",
  nuncaExistiu: "nunca existiu",
  vereditos: Object.freeze({ verdade: "VERDADE", meia: "MEIA-VERDADE", mentira: "MENTIRA" }),
  porTurno: 1,
  vizinhos: 3,
  /* a marca da verdade e da meia nas notas (o que impede a 2.ª revelação
     quando o Cronista voltar a marcar `dito` no mesmo nome) */
  marcas: Object.freeze(["visto pelo herói", "meia-verdade", "partiu de "]),
  /* O FECHO MOSTRA (a 13.ª, T19). «Mostre, não anuncie.» chegou e a prosa
     anunciou («o boato do pastor foi só corda para puxar você»): a ordem
     dizia o que não fazer e não o que fazer. Agora diz onde o veredito mora —
     no que o herói vê e acha — e quem não o diz. O fim da frase («ninguém o
     anuncia») é também a marca que a deixa ficar numa pergunta
     (pauta.js#FICA_NA_PERGUNTA). */
  fecho: "Mostre-o no que o herói vê e acha: ninguém o anuncia.",
  /* A CHEGADA À BOCA (a 13.ª, T14–T16). O rumor da masmorra só se abria lá
     dentro: a heroína acampou três turnos à boca da Fenda, e nada. Chegar ao
     sítio é chegar à boca — o rumor abre-se no lugar com o nome dela, e o
     primeiro turno calmo ali é o dele (na luta cede: SECOES_QUE_CEDEM.luta). */
  naBoca: true,
  /* O VETO ANTES DA REVELAÇÃO (a 13.ª, T18: «Luz nenhuma… conversa mole de
     pastor», a verdade do boato decidida pela prosa nove turnos antes de o
     sistema a dar). Do momento em que o herói sabe do boato até à revelação,
     quando a frase o nomeia ou a cena está no sítio dele, a pauta veta
     decidi-lo (NÃO PODE, uma linha, só nesses turnos). O herói sabe do rumor
     da masmorra quando o nome dela já foi dito por alguém (as últimas
     QUEM_CONTOU.mensagens falas do Mestre) ou por ele. */
  veto: "decidir se é verdade o que se diz de {nome}: quem fala conta o que ouviu, e a resposta é do lugar, que ainda não a deu",
  /* o que a mentira nega, por fonte, antes da forma */
  negaA: Object.freeze({ pessoa: "ninguém com esse nome existe", coisa: "não está aqui, nem nunca esteve", masmorra: "" }),
});

/* ---------------- o sítio ---------------- */
function pedacos(nome) {
  const n = semArtigo(norm(nome));
  if (!n) return [];
  const out = [n];
  const m = n.match(/^(\S+)\s+d[oae]s?\s+(.+)$/);
  if (m && MESA_DO_BURACO.cabecas.includes(m[1]) && m[2].length >= MESA_DO_BURACO.minimo) out.push(semArtigo(m[2]));
  return out;
}
const mesmoSitio = (a, b) => {
  const pa = pedacos(a), pb = pedacos(b);
  return pa.length > 0 && pb.length > 0 && pa.some((x) => pb.includes(x));
};

/* onde o herói está: os nomes, do mais fino ao mais largo */
function ondeEsta(e, chegada) {
  const c = obj(chegada);
  const lugar = typeof c.lugar === "string" ? c.lugar : (obj(e.lugar).nome || "");
  const mm0 = c.masmorra !== undefined ? c.masmorra : e.masmorra;
  const masmorra = typeof mm0 === "string" ? mm0 : (mm0 && typeof mm0 === "object" && !mm0.encerrada ? String(mm0.nome || "") : "");
  const cidade = typeof c.cidade === "string" ? c.cidade : (typeof e.cidadeAtual === "string" ? e.cidadeAtual : "");
  return { lugar: lugar.trim(), masmorra: masmorra.trim(), cidade: cidade.trim() };
}

/* ---------------- quem contou ---------------- */
const marcaDe = (dito) => {
  const m = String(dito || "").match(/^dito por (.+?), não fato$/);
  return m && norm(m[1]) !== norm(QUEM_CONTOU.semQuem) ? m[1].trim() : "";
};
/* os trechos de fala de um parágrafo: entre aspas, e a linha de travessão
   até ao travessão que a fecha ("— Vive no Posto — diz Brom": a fala é a
   primeira parte; a atribuição fica fora) */
function falasDe(p) {
  const out = [];
  for (const rx of [/"[^"\n]*"/g, /“[^”]*”/g, /«[^»]*»/g]) for (const m of p.matchAll(rx)) out.push([m.index, m.index + m[0].length]);
  const t = p.match(/^[ \t]*[—–]/);
  if (t) {
    const fim = p.indexOf(" — ", t[0].length);
    out.push([0, fim > 0 ? fim : p.length]);
  }
  return out;
}
const posicoes = (t, alvo) => {
  const out = [];
  if (alvo.length < QUEM_CONTOU.minimo) return out;
  let i = t.indexOf(alvo);
  while (i >= 0) {
    const antes = i > 0 ? t[i - 1] : " ", depois = t[i + alvo.length] || " ";
    if (!/[a-z0-9]/.test(antes) && !/[a-z0-9]/.test(depois)) out.push(i);
    i = t.indexOf(alvo, i + 1);
  }
  return out;
};
function quemContou(nome, dito, e, heroi) {
  const daMarca = marcaDe(dito);
  if (daMarca) return daMarca;
  const n = norm(nome);
  const gente = Object.values(obj(e.npcs)).filter((p) => p && typeof p.nome === "string" && !p.dito && norm(p.nome) !== n && norm(p.nome) !== heroi
    && !FORA_DE_CENA.some((s) => norm(p.status).includes(s)));
  if (!gente.length || !n) return "";
  const msgs = arr(e.mensagens).filter((m) => m && m.autor === "mestre" && typeof m.texto === "string").slice(-QUEM_CONTOU.mensagens).reverse();
  for (const m of msgs) {
    for (const par0 of m.texto.split(/\n+/)) {
      const par = norm(par0);
      const falas = falasDe(par);
      const dentro = posicoes(par, n).filter((i) => falas.some(([a, b]) => i >= a && i < b));
      if (!dentro.length) continue;
      let melhor = null;
      for (const g of gente) {
        const primeiro = norm(g.nome).split(" ")[0];
        for (const i of posicoes(par, primeiro)) {
          if (falas.some(([a, b]) => i >= a && i < b)) continue;
          const d = Math.min(...dentro.map((j) => Math.abs(j - i)));
          if (d <= QUEM_CONTOU.letras && (!melhor || d < melhor.d)) melhor = { d, nome: g.nome };
        }
      }
      if (melhor) return melhor.nome;
    }
  }
  return "";
}

/* ---------------- os boatos abertos ---------------- */
const jaRevelado = (f) => BOATO.marcas.some((x) => norm(f && f.notas).includes(norm(x)));
function abertos(e, onde, semente) {
  const out = [];
  const canone = obj(e.canone);
  const chaves = new Set(Object.keys(canone).map(norm));
  const dia = Number(e.dia);
  const hoje = (d) => Number.isFinite(dia) && Number(d) === dia;
  /* o nível em que o sítio bate; a cidade não conta para o que se disse
     hoje (foi dito aqui) nem dentro da masmorra (o herói está lá em baixo) */
  const nivel = (sitios, registado) => {
    if (onde.lugar && sitios.some((s) => mesmoSitio(s, onde.lugar))) return 0;
    if (onde.masmorra) return sitios.some((s) => mesmoSitio(s, onde.masmorra)) ? 1 : -1;
    if (onde.cidade && sitios.some((s) => mesmoSitio(s, onde.cidade)) && !hoje(registado)) return 2;
    return -1;
  };
  for (const [nome, p] of Object.entries(obj(e.npcs))) {
    if (!p || typeof p !== "object" || typeof p.dito !== "string" || !p.dito.trim() || jaRevelado(p)) continue;
    if (FORA_DE_CENA.some((s) => norm(p.status).includes(s))) continue;
    const nv = nivel([p.local].filter(Boolean), p.conhecidoEm);
    if (nv >= 0) out.push({ fonte: "pessoa", onde: "npcs", nome: p.nome || nome, chave: nome, ficha: p, nivel: nv });
  }
  for (const [nome, f] of Object.entries(canone)) {
    if (!f || typeof f !== "object" || typeof f.dito !== "string" || !f.dito.trim() || jaRevelado(f)) continue;
    if (chaves.has(norm(BOATO.boatoDe + nome))) continue;
    const nv = nivel([f.local, nome].filter(Boolean), f.registradoDia);
    if (nv >= 0) out.push({ fonte: norm(f.tipo) === "pessoa" ? "pessoa" : "coisa", onde: "canone", nome, chave: nome, ficha: f, nivel: nv,
      /* o nome é o próprio sítio, e nada mais se afirma: não pode ter mentido */
      soOSitio: !String(f.descricao || "").replace(/[—–\s.-]/g, "") && [onde.lugar, onde.masmorra, onde.cidade].some((s) => s && mesmoSitio(nome, s)) });
  }
  /* o rumor da masmorra: dentro dela, ou à boca (o lugar com o nome dela, BOATO.naBoca) */
  const boca = !onde.masmorra && BOATO.naBoca ? onde.lugar : "";
  if (onde.masmorra || boca) {
    let mms = [];
    try { mms = masmorrasDoMundo(semente, e.mapa); } catch { mms = []; }
    const mm = arr(mms).find((m) => m && m.nome && mesmoSitio(m.nome, onde.masmorra || boca));
    if (mm && mm.rumor && !chaves.has(norm(BOATO.rumorDe + mm.nome))) out.push({ fonte: "masmorra", onde: "rumor", nome: mm.nome, chave: mm.nome, ficha: mm, nivel: onde.masmorra ? 1 : 0 });
  }
  /* do mais fino ao mais largo; no empate, a pessoa antes da coisa, e o nome */
  const ordem = { pessoa: 0, coisa: 1, masmorra: 2 };
  return out.sort((a, b) => a.nivel - b.nivel || ordem[a.fonte] - ordem[b.fonte] || (norm(a.nome) < norm(b.nome) ? -1 : norm(a.nome) > norm(b.nome) ? 1 : 0));
}

/* ---------------- o veredito ---------------- */
function oVeredito(b, rnd, relacao) {
  if (b.soOSitio) return "verdade";
  const c = CHANCES_DO_BOATO[b.fonte];
  const fator = Number(CONFIANCA_DE_QUEM_CONTOU[norm(relacao)]) || 1;
  const mentira = Math.max(0, Math.min(c.mentira * fator, c.verdade + c.mentira));
  const verdade = c.verdade + c.mentira - mentira;
  const r = rnd();
  return r < verdade ? "verdade" : r < verdade + c.meia ? "meia" : "mentira";
}
const encher = (t, v) => String(t || "").replace(/\{(\w+)\}/g, (_, k) => (v[k] != null ? String(v[k]) : ""));
const comNota = (notas, nota) => [String(notas || "").trim(), nota].filter(Boolean).join("; ");
function outraCidade(e, onde, rnd) {
  const cs = arr(obj(e.mapa).cidades).filter((c) => c && typeof c.nome === "string" && c.nome && !mesmoSitio(c.nome, onde));
  const aqui = arr(obj(e.mapa).cidades).find((c) => c && mesmoSitio(c.nome, onde));
  const dist = (c) => (aqui && Number.isFinite(c.x) && Number.isFinite(aqui.x) ? Math.hypot(c.x - aqui.x, (c.y || 0) - (aqui.y || 0)) : 0);
  const perto = cs.map((c) => ({ c, d: dist(c) })).sort((a, b) => a.d - b.d || (a.c.nome < b.c.nome ? -1 : 1)).slice(0, BOATO.vizinhos);
  return perto.length ? perto[Math.floor(rnd() * perto.length)].c.nome : "";
}

export function oBoatoDaChegada(estado, chegada, sorte) {
  const e = obj(estado);
  const vazio = { estado: e, linhaDaPauta: "", nota: null };
  try {
    if (e.combate || e.jornada) return vazio;
    const onde = ondeEsta(e, chegada);
    if (!onde.lugar && !onde.masmorra && !onde.cidade) return vazio;
    const semente = typeof sorte === "string" ? sorte : "";
    const heroi = norm(e.heroi);
    const lista = abertos(e, onde, semente).slice(0, BOATO.porTurno);
    if (!lista.length) return vazio;
    const b = lista[0];
    const rnd = typeof sorte === "function" ? sorte : rngDe(`${semente}|boato|${b.fonte}|${norm(b.nome)}`);
    const contou = b.fonte === "masmorra" ? "" : quemContou(b.nome, b.ficha.dito, e, heroi);
    const quem = contou ? Object.values(obj(e.npcs)).find((p) => p && norm(p.nome) === norm(contou)) : null;
    const veredito = oVeredito(b, rnd, quem ? quem.relacao : "");
    const sitio = b.nivel === 0 ? onde.lugar : b.nivel === 1 ? onde.masmorra : onde.cidade;
    const formas0 = veredito === "mentira" ? FORMAS_DO_BOATO.mentira : FORMAS_DO_BOATO[veredito][b.fonte];
    /* a pessoa só «partiu» se há para onde: a cidade vizinha sai do mapa */
    const vizinha = formas0.some((f) => f.precisa === "outraCidade") ? outraCidade(e, onde.cidade || sitio, rnd) : "";
    const formas = formas0.filter((f) => f.precisa !== "outraCidade" || vizinha);
    const forma = formas[Math.floor(rnd() * formas.length)];
    const para = forma.precisa === "outraCidade" ? vizinha : "";
    const v = { nome: b.nome, onde: sitio, para };
    /* o estado novo */
    let canone = obj(e.canone), npcs = obj(e.npcs);
    const semDito = (f) => { const { dito, ...resto } = f; return resto; };
    if (b.onde === "rumor") {
      canone = { ...canone, [BOATO.rumorDe + b.nome]: { tipo: BOATO.tipo, descricao: String(b.ficha.rumor), local: b.nome, notas: `${BOATO.vereditos[veredito].toLowerCase()}: ${encher(forma.nota, v)}`, registradoDia: Number.isFinite(Number(e.dia)) ? Number(e.dia) : 0 } };
    } else if (veredito === "mentira") {
      if (b.onde === "npcs") npcs = { ...npcs, [b.chave]: { ...semDito(b.ficha), status: BOATO.nuncaExistiu, notas: comNota(b.ficha.notas, encher(forma.nota, v)) } };
      else {
        const { [b.chave]: _fora, ...resto } = canone;
        canone = { ...resto, [BOATO.boatoDe + b.nome]: { tipo: BOATO.tipo, descricao: `o que se dizia de ${b.nome} ${encher(forma.nota, v)}`, local: sitio, ...(contou ? { notas: `contou-o ${contou}` } : {}), registradoDia: Number.isFinite(Number(e.dia)) ? Number(e.dia) : 0 } };
      }
      if (quem) {
        const k = Object.keys(npcs).find((x) => npcs[x] && norm(npcs[x].nome) === norm(quem.nome));
        if (k) npcs = { ...npcs, [k]: { ...npcs[k], notas: comNota(npcs[k].notas, encher(forma.deQuem, v)) } };
      }
    } else {
      const nova = { ...semDito(b.ficha), notas: comNota(b.ficha.notas, encher(forma.nota, v)), ...(para ? { local: para } : {}) };
      if (b.onde === "npcs") npcs = { ...npcs, [b.chave]: nova };
      else canone = { ...canone, [b.chave]: nova };
    }
    /* a linha da pauta: o veredito, a forma, quem contou, e como mostrar */
    /* curta de propósito: o rótulo (O BOATO) já diz que é o que se dizia, e
       cada letra disputa o teto (a medida em pauta.js, na secção) */
    const doQue = b.fonte === "masmorra" ? `${b.nome}, «${b.ficha.rumor}»` : `${b.nome}${contou ? ` (contou-o ${contou})` : ""}`;
    const nega = veredito === "mentira" && BOATO.negaA[b.fonte] ? `${BOATO.negaA[b.fonte]}; ` : "";
    const cobrar = veredito === "mentira" && contou ? ` ${contou} terá de responder por isso.` : "";
    const linhaDaPauta = `${doQue} — ${BOATO.vereditos[veredito]}: ${nega}${encher(forma.texto, v)}.${cobrar} ${BOATO.fecho}`;
    return {
      estado: { ...e, canone, npcs },
      linhaDaPauta,
      nota: { fonte: b.fonte, nome: b.nome, onde: sitio, veredito, forma: forma.id, contou, ...(para ? { para } : {}) },
    };
  } catch {
    return vazio;
  }
}

/* ---------------- o veto antes da revelação (a 13.ª, 29/10) ----------------
   oVetoDoBoato(estado, frase, sorte) → a linha do NÃO PODE, ou "". Só para
   quem chama quando a revelação NÃO vai neste turno (a linha do boato e o
   veto não andam juntos: um diz a verdade, o outro proíbe-a). Os boatos
   abertos são os de sempre (o `dito` sem revelação, o rumor sem «Rumor de»);
   toca-os a frase que nomeia o sítio ou o nome, ou a cena no sítio (o lugar
   ou a masmorra onde se está — a cidade inteira não: seria um veto em todo
   turno de cidade). Do rumor da masmorra o herói só sabe depois de o nome
   ter sido dito. E só se veta o que o sistema pode revelar: o boato com
   sítio (`local`) — a resposta «é do lugar», e o que se disse sem dizer
   onde nunca chega a lugar nenhum (medido nos 287 pedidos do dourado: o
   Tomas «dito por alguém em cena», sem sítio, levaria o veto a 12 turnos
   em que o herói só lhe dizia o nome, e para sempre). Lixo dá "". */
const contem = (texto, nome) => pedacos(nome).some((p) => p.length >= MESA_DO_BURACO.minimo && posicoes(texto, p).length > 0);
export function oVetoDoBoato(estado, frase, sorte) {
  try {
    const e = obj(estado);
    const f = norm(frase);
    const onde = ondeEsta(e, null);
    const canone = obj(e.canone);
    const chaves = new Set(Object.keys(canone).map(norm));
    const noSitio = (s) => !!s && [onde.lugar, onde.masmorra].some((x) => x && mesmoSitio(s, x));
    const toca = (sitios) => sitios.some((s) => s && (noSitio(s) || contem(f, s)));
    const cands = [];
    for (const [nome, p] of Object.entries(obj(e.npcs))) {
      if (!p || typeof p !== "object" || typeof p.dito !== "string" || !p.dito.trim() || jaRevelado(p)) continue;
      if (FORA_DE_CENA.some((s) => norm(p.status).includes(s))) continue;
      if (typeof p.local === "string" && p.local.trim() && toca([p.local, p.nome || nome])) cands.push(p.nome || nome);
    }
    for (const [nome, x] of Object.entries(canone)) {
      if (!x || typeof x !== "object" || typeof x.dito !== "string" || !x.dito.trim() || jaRevelado(x)) continue;
      if (chaves.has(norm(BOATO.boatoDe + nome))) continue;
      if (typeof x.local === "string" && x.local.trim() && toca([x.local, nome])) cands.push(nome);
    }
    let mms = [];
    try { mms = masmorrasDoMundo(typeof sorte === "string" ? sorte : "", e.mapa); } catch { mms = []; }
    const ditas = norm(arr(e.mensagens).filter((m) => m && m.autor === "mestre" && typeof m.texto === "string").slice(-QUEM_CONTOU.mensagens).map((m) => m.texto).join("\n"));
    for (const mm of arr(mms)) {
      if (!mm || !mm.nome || !mm.rumor || chaves.has(norm(BOATO.rumorDe + mm.nome))) continue;
      if (!contem(ditas, mm.nome) && !contem(f, mm.nome)) continue;
      if (toca([mm.nome])) cands.push(mm.nome);
    }
    return cands.length ? encher(BOATO.veto, { nome: cands[0] }) : "";
  } catch {
    return "";
  }
}

/* O estado só muda se a linha chegou ao texto que foi ao Narrador: o teto
   da pauta pode tê-la cortado, e aí o boato fica como estava e volta no
   turno seguinte. Devolve o que escrever ({ canone, npcs }) ou null. */
export function oBoatoQueChegou(revelado, texto) {
  const r = obj(revelado);
  if (!r.linhaDaPauta || typeof texto !== "string" || !texto.includes(r.linhaDaPauta)) return null;
  const e = obj(r.estado);
  return { canone: obj(e.canone), npcs: obj(e.npcs) };
}
