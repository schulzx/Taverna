/* ============================================================
   MISSÕES (v9.27) — a quest deixa de ser um bilhete no diário

   O que existia: o Mestre escrevia um título, o sistema guardava a
   string, e pronto. Sem etapas, sem verificação, sem recompensa e
   sem consequência. O jogador não sabia o que fazer; o Mestre
   esquecia de encerrar; missões resolvidas ficavam abertas no
   diário para sempre. Era a mesma doença dos eventos e da nêmesis
   antes dos relógios: adjetivo em vez de mecânica.

   A cura é a mesma, e por isso este arquivo nasce colado em
   relogios.js: uma missão é uma sequência de ETAPAS que o SISTEMA
   sabe verificar sozinho, mais um relógio quando há pressa.

   TRÊS REGRAS QUE DECIDEM TUDO:

   1) SÓ EXISTE ETAPA QUE O CÓDIGO CONSEGUE CONFERIR. Nada de "ganhe
      a confiança do barão" — isso é adjetivo, e adjetivo devolve o
      poder de decidir para a IA. As etapas se apoiam no que o
      sistema já rastreia: onde o herói está, quem ele derrotou, o
      que tem na bolsa, quem está no registro, que dia é, que
      relógio encheu. Se não dá para conferir, não é etapa.

   2) O MESTRE OFERECE, O JOGADOR ACEITA, O SISTEMA MONTA. Ele
      conhece a ficção — deixe que ele traga o nobre desesperado à
      taverna. Mas o que vira missão, com quantas etapas e por qual
      recompensa, é o código que decide. E o jogador escolhe: uma
      oferta recusada é uma oferta, não uma missão.

   3) NEM TUDO SE RECUSA. A nêmesis que te caça, o evento global que
      engole a região, o abalo divino que sacode os seus fiéis — não
      têm botão de "não, obrigado". Essas nascem ativas, e é a
      diferença entre o que você escolhe fazer e o que o mundo
      escolheu fazer com você.

   E O SPOILER. A missão mostra a etapa ATUAL por inteiro, as
   passadas riscadas, e as futuras como pontos fechados. O jogador
   sabe o que fazer agora e quanto falta — nunca o que vem. Uma
   lista inteira aberta transformaria a aventura num checklist.
   ============================================================ */

import { criarRelogio } from "./relogios.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ---------------- OS TIPOS DE ETAPA ----------------
   Cada um sabe se olhar no espelho do estado do jogo. `ver` recebe o
   mundo inteiro e devolve true quando a etapa está cumprida. */
export const ETAPAS = {
  ir_a: {
    id: "ir_a", icone: "🧭",
    texto: (e) => `Chegar a ${e.alvo}`,
    ver: (e, m) => norm(m.cidadeAtual) === norm(e.alvo),
  },
  derrotar: {
    id: "derrotar", icone: "⚔",
    texto: (e) => `Derrotar ${e.alvo}${e.quantos > 1 ? ` (${e.quantos})` : ""}`,
    ver: (e, m) => (m.derrotados || []).filter((n) => norm(n).includes(norm(e.alvo))).length >= (e.quantos || 1),
  },
  achar: {
    id: "achar", icone: "🔎",
    texto: (e) => `Encontrar ${e.alvo}`,
    ver: (e, m) => [...(m.inventario || []), ...(m.equipamento || [])]
      .some((i) => norm(typeof i === "string" ? i : i && i.nome).includes(norm(e.alvo))),
  },
  falar_com: {
    id: "falar_com", icone: "💬",
    texto: (e) => `Encontrar ${e.alvo}`,
    ver: (e, m) => Object.values(m.npcs || {}).some((n) => n && norm(n.nome) === norm(e.alvo) && n.conhecidoEm != null),
  },
  levar_a: {
    id: "levar_a", icone: "📦",
    texto: (e) => `Levar ${e.item} até ${e.alvo}`,
    ver: (e, m) => norm(m.cidadeAtual) === norm(e.alvo)
      && [...(m.inventario || []), ...(m.equipamento || [])].some((i) => norm(typeof i === "string" ? i : i && i.nome).includes(norm(e.item))),
  },
  aguentar: {
    id: "aguentar", icone: "⏳",
    texto: (e) => `Sobreviver até o dia ${e.dia}`,
    ver: (e, m) => (m.dia || 0) >= e.dia,
  },
  vencer_relogio: {
    id: "vencer_relogio", icone: "⏱",
    texto: (e) => e.rotulo || "Impedir o que se aproxima",
    ver: (e, m) => !(m.relogios || []).some((r) => r.id === e.relogioId),
  },
};
export function etapaDef(t) { return ETAPAS[t] || ETAPAS.ir_a; }
export function textoDaEtapa(e) { return etapaDef(e.tipo).texto(e); }

/* ---------------- OS TIPOS DE MISSÃO ---------------- */
export const TIPOS = {
  principal: { id: "principal", icone: "★", rotulo: "Principal", forcada: true },
  contrato: { id: "contrato", icone: "📋", rotulo: "Contrato", forcada: false },
  favor: { id: "favor", icone: "🤝", rotulo: "Favor", forcada: false },
  cacada: { id: "cacada", icone: "🐺", rotulo: "Caçada", forcada: true },
  global: { id: "global", icone: "🌍", rotulo: "O mundo", forcada: true },
  divina: { id: "divina", icone: "🌟", rotulo: "Divina", forcada: true },
};
export function tipoDef(t) { return TIPOS[t] || TIPOS.favor; }
export function ehForcada(t) { return tipoDef(t).forcada; }

export const MAX_ATIVAS = 8;

/* ---------------- A RECOMPENSA ----------------
   Paga por código, sempre. Antes só o contrato tinha recompensa — as
   missões da história não davam nada, e terminar uma era exatamente
   igual a abandoná-la.

   v9.36: mas quem PROMETE é a ficção. O mural dizia "paga-se 15 moedas"
   e o sistema anunciava 43 na mesma tela: duas verdades sobre o mesmo
   trabalho, e o jogador no meio decidindo em qual acreditar. Agora, se
   a cena disse um preço, o preço da cena é o preço — o sistema calcula
   só o que ninguém combinou. E `moedasPrometidas: 0` é um combinado
   legítimo: favor por informação não paga em moeda, paga em favor. */
export function recompensaDe({ tipo = "favor", nivel = 1, etapas = 3, moedasPrometidas = null }) {
  const base = { contrato: 1, favor: 1.2, cacada: 1.6, principal: 2.2, global: 2.5, divina: 2.5 }[tipo] || 1;
  const peso = base * (0.7 + etapas * 0.15);
  const combinada = Number.isFinite(moedasPrometidas) && moedasPrometidas >= 0;
  return {
    moedas: combinada ? Math.round(moedasPrometidas) : Math.round((25 + nivel * 12) * peso),
    xp: Math.round((40 + nivel * 18) * peso),
    /* item só nas grandes: se toda missão desse item, item deixaria de
       significar alguma coisa */
    item: peso >= 2 ? (nivel >= 12 ? "epico" : nivel >= 6 ? "raro" : "incomum") : null,
    fama: Math.round(peso * 3),
    /* o que a cena prometeu, para a tela e o envelope falarem a mesma língua */
    combinada,
  };
}

/* O preço que a cena disse. Só aceita quando a frase é sobre pagamento —
   "15 moedas" vale, "15 cabeças de gado" não. */
const RX_PAGAMENTO = /(\d{1,6})\s*(?:moedas?|peças? de ouro|po\b|pratas?)/gi;
export function precoNoTexto(txt) {
  const s = String(txt || "");
  if (!s) return null;
  const achados = [...s.matchAll(RX_PAGAMENTO)].map((m) => Number(m[1])).filter((n) => Number.isFinite(n));
  /* dois preços diferentes na mesma cena não são um combinado, são ruído */
  if (achados.length !== 1) return null;
  return achados[0];
}

/* ---------------- CRIAR ---------------- */
export function garantirMissoes(lista) {
  if (!Array.isArray(lista)) return [];
  return lista.filter((q) => q && q.titulo).map((q) => ({
    id: q.id || `m_${Math.random().toString(36).slice(2, 8)}`,
    titulo: String(q.titulo).slice(0, 70),
    tipo: TIPOS[q.tipo] ? q.tipo : "favor",
    descricao: String(q.descricao || "").slice(0, 240),
    dador: String(q.dador || "").slice(0, 40),
    /* "oferecida" espera o jogador; "ativa" está em curso; depois, fim */
    status: ["oferecida", "ativa", "concluida", "falhada", "recusada"].includes(q.status) ? q.status : "ativa",
    etapas: (Array.isArray(q.etapas) ? q.etapas : []).map((e) => ({
      tipo: ETAPAS[e.tipo] ? e.tipo : "ir_a",
      alvo: String(e.alvo || ""), item: String(e.item || ""),
      quantos: Math.max(1, Number(e.quantos) || 1),
      dia: Number(e.dia) || 0, relogioId: String(e.relogioId || ""), rotulo: String(e.rotulo || ""),
      feito: !!e.feito,
    })).slice(0, 5),
    /* v9.38: em NOITES, não em dias — o relógio de prazo tem gatilho "noite",
       e medir em dias faria a barra andar num ritmo diferente do número que
       o jogador leu no cartaz. 0 é o normal: a maioria das missões espera. */
    prazo: Math.max(0, Math.floor(Number(q.prazo) || 0)),
    recompensa: q.recompensa || null,
    /* v9.27: veio da era em que quest era um título sem etapa. Não dá para
       conferir, então só o jogador pode encerrá-la. */
    legado: !!q.legado,
    relogioId: q.relogioId || null,
    criadaEm: Number.isFinite(q.criadaEm) ? q.criadaEm : 0,
  }));
}

export function criarMissao({ titulo, tipo = "favor", descricao = "", dador = "", etapas = [], nivel = 1, dia = 0, id, status, moedasPrometidas = null, prazo = 0 }) {
  const m = garantirMissoes([{
    id, titulo, tipo, descricao, dador, etapas, criadaEm: dia, prazo: noitesDePrazo(prazo),
    status: status || (ehForcada(tipo) ? "ativa" : "oferecida"),
  }])[0];
  if (!m || !m.etapas.length) return null;
  m.recompensa = recompensaDe({ tipo, nivel, etapas: m.etapas.length, moedasPrometidas });
  return m;
}

export const ativas = (l) => garantirMissoes(l).filter((q) => q.status === "ativa");
export const ofertas = (l) => garantirMissoes(l).filter((q) => q.status === "oferecida");

export function etapaAtual(m) {
  if (!m || !m.etapas) return null;
  return m.etapas.find((e) => !e.feito) || null;
}
export function progresso(m) {
  const t = (m && m.etapas || []).length || 1;
  const f = (m && m.etapas || []).filter((e) => e.feito).length;
  return { feitas: f, total: t, pct: Math.round((f / t) * 100) };
}

/* ---------------- O CONFERENTE ----------------
   Roda a cada turno, de graça: é comparação com o estado que já está
   na mão. Só avança a etapa ATUAL — missão é sequência, não lista de
   compras, e deixar a etapa 3 fechar antes da 1 quebraria a história
   que a sequência conta. */
export function conferir(lista, mundo = {}) {
  const ms = garantirMissoes(lista);
  const avancos = [], concluidas = [];
  const out = ms.map((m) => {
    if (m.status !== "ativa") return m;
    const i = m.etapas.findIndex((e) => !e.feito);
    if (i < 0) return m;
    const e = m.etapas[i];
    if (!etapaDef(e.tipo).ver(e, mundo)) return m;
    const etapas = m.etapas.map((x, k) => (k === i ? { ...x, feito: true } : x));
    const fim = etapas.every((x) => x.feito);
    const novo = { ...m, etapas, status: fim ? "concluida" : "ativa" };
    avancos.push({ missao: novo, etapa: e, indice: i, total: etapas.length });
    if (fim) concluidas.push(novo);
    return novo;
  });
  return { missoes: out, avancos, concluidas };
}

/* ---------------- DUAS MISSÕES SÃO A MESMA MISSÃO? ----------------
   v9.36. O jogador leu um contrato no mural sobre o gado de Jessa e o
   taverneiro veio falar do mesmo gado — o sistema ofereceu as duas, com
   títulos diferentes, etapas diferentes e preços diferentes. Comparar
   títulos exatos nunca ia pegar isso: "O gado de Jessa" e "O gado
   desaparecido de Jessa" são strings distintas e o mesmo trabalho.

   Então compara-se ASSUNTO, não nome: as palavras com peso do título,
   da descrição e dos alvos. Se quem oferece é a mesma pessoa, a barra
   desce — o taverneiro não tem dois problemas com o mesmo gado. */
const VAZIAS = new Set("de da do das dos e ou o a os as um uma uns umas em no na nos nas para por com que ao aos se sua seu suas seus meu minha ate the of".split(" "));
const soLetras = (s) => norm(s).replace(/[^a-z0-9 ]+/g, " ");
export function assuntoDe(m) {
  const txt = `${m && m.titulo || ""} ${m && m.descricao || ""} ${((m && m.etapas) || []).map((e) => `${e.alvo || ""} ${e.item || ""}`).join(" ")}`;
  return new Set(soLetras(txt).split(/\s+/).filter((w) => w.length > 2 && !VAZIAS.has(w)));
}
/* "Braam (n'A Cabra Dançante)" e "Braam, o taverneiro" são o mesmo Braam */
const primeiroNome = (s) => (soLetras(s).trim().split(/\s+/)[0] || "");
export function mesmaPessoa(a, b) {
  const x = primeiroNome(a), y = primeiroNome(b);
  return !!x && x.length > 2 && x === y;
}
/* Para onde a missão APONTA: o que as etapas mandam achar, derrotar, levar
   ou visitar. É o único pedaço de uma missão que não depende de estilo — a
   prosa muda de um contador para outro, o alvo não. */
export function alvosDe(m) {
  const s = new Set();
  for (const e of (m && m.etapas) || []) {
    for (const w of soLetras(`${(e && e.alvo) || ""} ${(e && e.item) || ""}`).split(/\s+/)) {
      if (w.length >= 4 && !VAZIAS.has(w)) s.add(w);
    }
  }
  return s;
}
export function mesmoAlvo(a, b) {
  const A = alvosDe(a), B = alvosDe(b);
  if (!A.size || !B.size) return false;
  for (const w of A) if (B.has(w)) return true;
  return false;
}

export function pareceMesmaMissao(a, b) {
  if (!a || !b) return false;
  if (norm(a.titulo) === norm(b.titulo)) return true;
  const A = assuntoDe(a), B = assuntoDe(b);
  if (!A.size || !B.size) return false;
  let juntas = 0;
  A.forEach((w) => { if (B.has(w)) juntas++; });
  /* cobertura da MENOR: uma proposta curta que cabe inteira dentro de uma
     missão que já existe é a mesma missão contada com menos palavras */
  const cobertura = juntas / Math.min(A.size, B.size);
  return cobertura >= (mesmaPessoa(a.dador, b.dador) ? 0.4 : 0.62);
}

/* ---------------- O QUE O MESTRE PODE OFERECER ----------------
   Ele traz o nobre desesperado à taverna; o sistema decide o que
   aquilo vira. Propostas sem etapa verificável são recusadas — é a
   trava que impede "ganhe a confiança do barão" de virar missão. */
export function aceitarProposta(lista, prop, { nivel = 1, dia = 0, mundo = null, moedasNaCena = null, dadorPresente = true } = {}) {
  const atual = garantirMissoes(lista);
  if (!prop || !String(prop.titulo || "").trim()) return { ok: false, motivo: "sem título" };
  if (atual.filter((q) => q.status === "ativa" || q.status === "oferecida").length >= MAX_ATIVAS) {
    return { ok: false, motivo: "já há missões demais em jogo" };
  }
  const titulo = String(prop.titulo).trim();
  const proposta = { titulo, descricao: prop.descricao || "", dador: prop.dador || "", etapas: Array.isArray(prop.etapas) ? prop.etapas : [] };
  /* duplicata olha também para o que já foi feito: reoferecer um trabalho
     concluído é a mesma confusão, com o agravante de já ter sido pago */
  if (atual.some((q) => ["ativa", "oferecida", "concluida"].includes(q.status) && pareceMesmaMissao(q, proposta))) {
    return { ok: false, motivo: "esse mesmo trabalho já está no diário" };
  }
  /* ---------------- MESMA PESSOA, MESMO ALVO (v9.43) ----------------
     Osric ofereceu a mesma caçada duas vezes: uma pelo gerador estrutural
     ("A caçada de Osric Ventoforte") e outra pela proposta do Mestre
     ("Caçar o atirador do Mercado da Aurora"). São o mesmo serviço contado
     com outras palavras, e a semelhança de VOCABULÁRIO ficou em 0,33 contra
     um limiar de 0,4 — perto, e perto não serve.

     A régua que separa os dois casos não está nas palavras da prosa: está no
     ALVO. Dois trabalhos do mesmo dador que apontam para a mesma coisa são
     um trabalho só, por mais diferente que a descrição seja. Já o taverneiro
     que quer o gado achado E os ratos da dispensa mortos tem, de fato, dois
     problemas — e alvos diferentes provam isso sem depender de estilo.

     Concluídas não entram na conta: um velho conhecido pode voltar com
     serviço novo sobre o mesmo assunto, e isso é história, não duplicata. */
  if (proposta.dador && atual.some((q) => ["ativa", "oferecida"].includes(q.status)
    && mesmaPessoa(q.dador, proposta.dador) && mesmoAlvo(q, proposta))) {
    return { ok: false, motivo: "essa pessoa já lhe deu esse mesmo trabalho" };
  }

  let etapas = (Array.isArray(prop.etapas) ? prop.etapas : []).filter((e) => e && ETAPAS[e.tipo] && (e.alvo || e.dia || e.relogioId));
  /* QUEM ESTÁ NA SUA FRENTE NÃO SE PROCURA. Ubba propôs um favor em troca de
     informação e a primeira etapa virou "Encontrar Ubba" — o jogador estava
     falando com ele naquele instante. A etapa nasceu cumprida e mentindo.

     Mas um CARTAZ é o contrário: quem assinou não está ali, e "falar com
     Braam n'A Cabra Dançante" é o primeiro passo de verdade. Por isso a
     regra não é sobre quem oferece — é sobre quem está presente. */
  if (proposta.dador && dadorPresente) {
    etapas = etapas.filter((e) => !(e.tipo === "falar_com" && mesmaPessoa(e.alvo, proposta.dador)));
  }
  /* e nenhuma etapa nasce cumprida: se o mundo já satisfaz a condição, ela
     não é um passo, é uma linha morta no diário */
  if (mundo) etapas = etapas.filter((e) => { try { return !etapaDef(e.tipo).ver(e, mundo); } catch { return true; } });
  if (!etapas.length) return { ok: false, motivo: "nenhuma etapa que o sistema saiba conferir" };

  const prometido = Number.isFinite(Number(prop.paga)) && Number(prop.paga) >= 0 ? Number(prop.paga)
    : precoNoTexto(`${titulo} ${proposta.descricao}`);
  const m = criarMissao({
    titulo, tipo: TIPOS[prop.tipo] ? prop.tipo : "favor",
    descricao: proposta.descricao, dador: proposta.dador,
    etapas, nivel, dia, prazo: prop.prazo,
    moedasPrometidas: prometido != null ? prometido : moedasNaCena,
  });
  if (!m) return { ok: false, motivo: "proposta malformada" };
  return { ok: true, missoes: [...atual, m], missao: m };
}

/* O jogador encerra à mão o que o sistema não tem como conferir — só as de
   legado. Nas outras, quem marca é o código, e abrir essa porta seria desfazer
   a regra inteira. */
export function encerrarLegado(lista, id, comoFoi = "concluida") {
  const ms = garantirMissoes(lista);
  const m = ms.find((q) => q.id === id && q.legado && q.status === "ativa");
  if (!m) return { ok: false, motivo: "essa missão não é de legado, ou já foi encerrada" };
  return { ok: true, missoes: ms.map((q) => (q.id === id ? { ...q, status: comoFoi === "falhada" ? "falhada" : "concluida", etapas: q.etapas.map((e) => ({ ...e, feito: true })) } : q)), missao: m };
}

export function responderOferta(lista, id, aceita) {
  const ms = garantirMissoes(lista);
  const m = ms.find((q) => q.id === id && q.status === "oferecida");
  if (!m) return { ok: false, motivo: "essa oferta não está mais na mesa" };
  return { ok: true, missoes: ms.map((q) => (q.id === id ? { ...q, status: aceita ? "ativa" : "recusada" } : q)), missao: m, aceita };
}

/* ---------------- AS QUE O MUNDO IMPÕE ----------------
   Nêmesis e evento global viram missão sozinhos, sem passar pela
   oferta: não existe botão de "não, obrigado" para quem já está te
   caçando. É aqui que a distinção entre o que você escolhe fazer e
   o que o mundo escolheu fazer com você vira mecânica visível.

   Idempotente pela FONTE (o id), como o semeador de relógios: rodar
   a cada turno não duplica nada. */
export function semearMissoes(lista, ctx = {}) {
  const atual = garantirMissoes(lista);
  const tem = (id) => atual.some((m) => m.id === id && ["ativa", "concluida"].includes(m.status));
  const novas = [];
  const cabe = () => atual.filter((m) => m.status === "ativa").length + novas.length < MAX_ATIVAS;

  const nem = ctx.nemesis;
  if (cabe() && nem && nem.nome && nem.status !== "derrotada" && (Number(nem.odio) || 0) >= 50 && !tem("mis_nemesis")) {
    const m = criarMissao({
      id: "mis_nemesis", titulo: `Acertar contas com ${nem.nome}`, tipo: "cacada", status: "ativa",
      descricao: nem.motivo ? `${nem.motivo}. Isso não vai se resolver sozinho.` : "Isso não vai se resolver sozinho.",
      etapas: [{ tipo: "derrotar", alvo: nem.nome, quantos: 1 }],
      nivel: ctx.nivel || 1, dia: ctx.dia || 0,
    });
    if (m) novas.push(m);
  }

  const g = ctx.global;
  if (cabe() && g && g.nome && !tem("mis_global")) {
    const m = criarMissao({
      id: "mis_global", titulo: g.nome, tipo: "global", status: "ativa",
      descricao: g.semente || g.descricao || "A região inteira sente isto.",
      /* a etapa é vencer o relógio do evento: enquanto ele existir, a coisa
         está em curso; quando o sistema o remove, acabou de um jeito ou de
         outro — e é o relógio que já contava essa história */
      etapas: [{ tipo: "vencer_relogio", relogioId: ctx.relogioGlobalId || "", rotulo: `Impedir que ${g.nome} chegue ao fim` }],
      nivel: ctx.nivel || 1, dia: ctx.dia || 0,
    });
    if (m && ctx.relogioGlobalId) novas.push(m);
  }

  return { missoes: [...atual, ...novas], novas };
}

/* ---------------- O PRAZO (v9.38) ----------------
   Escrito e testado na v9.27, ligado só agora: `relogioDaMissao` e
   `falharPorRelogio` existiam, passavam nos testes e não eram chamadas de
   lugar nenhum. Missão com prazo nunca falhou por tempo uma única vez.

   O relógio só aceita 4, 6 ou 8 pedaços (TAMANHOS, em relogios.js), e o
   gatilho é "noite" — um pedaço por noite dormida. Então prazo se mede em
   NOITES e só existe nessas três durações: qualquer outro número viraria 6
   sem avisar, e o cartaz prometeria um prazo que o relógio não cumpre. */
export const PRAZOS = [4, 6, 8];
export function noitesDePrazo(n) {
  const v = Math.floor(Number(n) || 0);
  if (v <= 0) return 0;
  /* encosta na duração possível mais próxima, para baixo em caso de empate:
     prometer menos tempo e dar mais é melhor que o contrário */
  return PRAZOS.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), PRAZOS[0]);
}
export function temPrazo(m) { return !!(m && m.prazo > 0); }
export function textoDoPrazo(m) {
  return temPrazo(m) ? `${m.prazo} noites` : "";
}

/* Missão com pressa ganha relógio. O relógio não é enfeite: quando ele
   enche, a missão FALHA — é o que dá peso ao prazo. */
export function relogioDaMissao(m, dia = 0) {
  const noites = noitesDePrazo(m && m.prazo);
  if (!noites) return null;
  return criarRelogio({
    nome: `Prazo: ${m.titulo}`, tipo: "ameaca", segmentos: noites, gatilho: "noite",
    fonte: `missao:${m.id}`, dia,
    consequencia: `O tempo de "${m.titulo}" se esgota — a missão falha.`,
  });
}

/* O que o Mestre recebe quando o tempo acaba. Não é o envelope genérico do
   relógio cheio: aquele anuncia um acontecimento, e este anuncia uma PERDA
   — algo que o herói tinha nas mãos e deixou escapar por demora. */
export function envelopeDeFalhaPorTempo(m) {
  return `[MISSÃO FALHADA POR TEMPO — DECIDIDO PELO SISTEMA] O prazo de "${m.titulo}"${m.dador ? `, de ${m.dador}` : ""} acabou: as ${m.prazo} noites passaram e o serviço não foi cumprido. A missão está ENCERRADA como fracasso — não pague nada por ela, não a ofereça de novo e não deixe o herói "ainda dar tempo".

Narre a consequência em 2 ou 3 frases, e que ela DOA sem ser catástrofe: o que aconteceu com quem esperava, o que se perdeu, como a notícia chega. ${m.dador ? `${m.dador} tem todo o direito de estar magoado, frio ou seco — mas o mundo não vira as costas ao herói por isso.` : ""} Depois siga a cena.`;
}

export function falharPorRelogio(lista, relogioFonte) {
  const ms = garantirMissoes(lista);
  const id = String(relogioFonte || "").replace(/^missao:/, "");
  const m = ms.find((q) => q.id === id && q.status === "ativa");
  if (!m) return { missoes: ms, falhada: null };
  return { missoes: ms.map((q) => (q.id === id ? { ...q, status: "falhada" } : q)), falhada: m };
}

/* ---------------- OS TEXTOS ---------------- */
export function linhaDoAvanco(a) {
  return `${etapaDef(a.etapa.tipo).icone} ${a.missao.titulo}: ${textoDaEtapa(a.etapa)} ✓ (${a.indice + 1}/${a.total})`;
}

export function envelopeDeAvanco(a) {
  const prox = etapaAtual(a.missao);
  return `[MISSÃO — ETAPA CUMPRIDA, RECONHECIDA PELO SISTEMA] "${a.missao.titulo}": eu cumpri "${textoDaEtapa(a.etapa)}" (${a.indice + 1} de ${a.total}). ${prox ? `A próxima etapa é: ${textoDaEtapa(prox)}.` : "Era a última."} Reconheça isso na ficção — uma frase de fechamento, uma reação de quem está por perto — e ${prox ? "deixe claro, sem dizer como fazer, que ainda falta o próximo passo" : "prepare o desfecho"}. Não conclua a missão por conta própria e não invente etapa nova: quem marca é o sistema.`;
}

export function envelopeDeConclusao(m, rec) {
  return `[MISSÃO CONCLUÍDA — RECONHECIDA E PAGA PELO SISTEMA] "${m.titulo}" acabou: todas as ${m.etapas.length} etapas foram cumpridas. O sistema já ${rec.moedas ? `pagou ◉ ${rec.moedas} e ` : "creditou "}${rec.xp} XP${rec.item ? ` e entregou um item ${rec.item}` : ""} — NÃO envie moedas, XP nem itens por isto, seria dobrado.

Narre o fechamento em 3 ou 4 frases: ${rec.moedas ? "quem paga, o que diz" : "como o combinado se cumpre — a informação dita, a porta aberta, o favor devolvido — sem moeda nenhuma trocando de mão"}, o que muda no lugar por causa disso. ${m.dador ? `Quem encomendou foi ${m.dador} — feche com ${m.dador}, não com um estranho.` : ""} Esta missão está ENCERRADA: não a mencione como pendente nunca mais.`;
}

/* O que a missão paga, em uma linha — a mesma frase na tela, no diário e
   no envelope. Duas verdades sobre o mesmo trabalho foi o bug. */
export function textoDaPaga(m) {
  const r = (m && m.recompensa) || null;
  if (!r) return "";
  if (!r.moedas) return `sem moedas — o pagamento é outro · ${r.xp} XP`;
  return `◉ ${r.moedas}${r.combinada ? " (o combinado)" : ""} · ${r.xp} XP${r.item ? ` · item ${r.item}` : ""}`;
}

export function envelopeDeOferta(m) {
  const r = m.recompensa || {};
  const preco = r.moedas
    ? `O pagamento combinado é ${r.moedas} moedas — se voltar a falar de preço, é ESSE número, nenhum outro.`
    : `Este trabalho NÃO se paga em moedas: o combinado é outro (um favor, uma informação, uma porta que se abre). Não prometa dinheiro por ele.`;
  return `[MISSÃO OFERECIDA — REGISTRADA PELO SISTEMA] ${m.dador ? `${m.dador} ofereceu` : "Ofereceram"} um trabalho: "${m.titulo}". ${preco}${temPrazo(m) ? ` Há PRAZO: ${m.prazo} noites, e o sistema conta as noites sozinho — se esgotar, a missão falha. Deixe a pressa clara na fala de quem oferece.` : ""} O sistema registrou a proposta e as etapas; eu ainda NÃO aceitei. Narre a oferta sendo feita — a pessoa, o tom, a urgência — e depois PARE e espere minha resposta. Não presuma que eu aceitei, não comece a missão, não me empurre para ela e não ofereça de novo o mesmo serviço com outro nome.`;
}

/* v9.36: aceitar não é falar. O botão registra; a fala é minha, e vem no
   turno seguinte — "aceito com prazer" e "o que você pede sorrindo eu faço
   chorando" pedem narrações opostas, e quem escolhe entre elas é o jogador.
   Por isso este envelope não pede narração nenhuma: ele espera. */
export function envelopeDeAceite(m) {
  return `[MISSÃO ACEITA — REGISTRADA PELO SISTEMA] Eu aceitei "${m.titulo}"${m.dador ? ` de ${m.dador}` : ""}. O sistema já registrou as etapas e cuidará de marcá-las${m.recompensa && m.recompensa.moedas ? ` e de pagar as ${m.recompensa.moedas} moedas no fim` : ""} — não pague, não avance e não conclua nada.${temPrazo(m) ? ` O prazo é de ${m.prazo} noites e já está correndo no relógio do sistema: você pode lembrar da pressa na ficção, mas NÃO conte as noites nem declare o prazo vencido — quem faz isso é o código.` : ""} NÃO narre o acordo por conta própria: eu ainda vou DIZER como aceito, e a cena continua a partir das minhas palavras. Se a próxima coisa que eu escrever for minha resposta a ${m.dador || "quem ofereceu"}, é a ela que você reage.`;
}

export function envelopeDeRecusa(m) {
  return `[MISSÃO RECUSADA — REGISTRADA PELO SISTEMA] Eu recusei "${m.titulo}". NÃO narre a recusa sozinho: eu ainda vou dizer com que palavras recuso, e é a elas que você reage. Quando eu falar, responda com a reação de quem ofereceu em uma ou duas frases — decepção, raiva fria, um dar de ombros — e siga a cena. Não insista, não reofereça e não faça o mundo me punir por ter dito não.`;
}

export function resumoMissoesPrompt(lista) {
  const at = ativas(lista), of = ofertas(lista);
  if (!at.length && !of.length) return "";
  const linha = (m) => {
    const e = etapaAtual(m);
    const p = progresso(m);
    return `- ${tipoDef(m.tipo).icone} "${m.titulo}" (${p.feitas}/${p.total})${e ? ` — agora: ${textoDaEtapa(e)}` : ""}${m.dador ? ` · de ${m.dador}` : ""}${temPrazo(m) ? ` · com prazo (${m.prazo} noites — o relógio é do sistema)` : ""}`;
  };
  return `MISSÕES (do sistema — quem abre, avança e encerra é o código, NUNCA você):
${at.map(linha).join("\n") || "- (nenhuma ativa)"}${of.length ? `\nOFERECIDAS, à espera da minha resposta: ${of.map((m) => `"${m.titulo}"`).join(", ")}` : ""}
Trate as etapas como o que elas são: o que EU preciso fazer. Você pode encenar o caminho, mas não marca etapa, não conclui missão e não paga recompensa. E nunca liste as etapas futuras para mim — deixe a próxima aparecer quando chegar a vez dela.`;
}

export const MISSOES_PROMPT = `MISSÕES (v9.27):
- Missão é uma sequência de ETAPAS que o SISTEMA confere sozinho. Você não abre, não avança, não encerra e não paga — tudo isso chega por envelope.
- Você PODE oferecer trabalho quando a ficção pedir, pelo campo "missao_oferecida": um nobre desesperado na taverna, um capitão precisando de escolta. Proponha só o que se traduz em etapas concretas (chegar a um lugar, derrotar alguém, encontrar um objeto, entregar algo, encontrar uma pessoa). "Ganhar a confiança de alguém" não é etapa — é cena, e cena você já sabe fazer.
- Oferta é oferta: depois de narrá-la, PARE e espere a resposta do jogador. Não presuma aceite, não comece a missão, não empurre.
- DIGA O PREÇO NA CENA e mande o mesmo número no campo "paga": o cartaz que promete 15 moedas e o diário que anuncia 43 são duas verdades sobre o mesmo trabalho. Se o combinado não é dinheiro — um favor, uma informação, uma dívida —, "paga": 0, e não invente moedas depois.
- UM TRABALHO, UMA MISSÃO. O contrato no mural e a pessoa que vem falar dele são a MESMA missão: não ofereça de novo com outro título. E nunca peça ao jogador que "encontre" quem está falando com ele agora.
- Missões que o mundo impõe (nêmesis, evento global, abalo divino) não são oferecidas — elas chegam ativas, e o jogador não pode recusá-las.
- PRAZO é do sistema. Algumas missões correm contra o tempo, e isso vira um relógio que anda uma casa por NOITE dormida. Você pode encenar a pressa — a viúva que olha a porta, o mercador que fala em "antes da lua cheia" —, mas NUNCA conte as noites, nunca diga que o prazo venceu e nunca dê tempo extra: quando esgota, o sistema avisa por envelope.
- Aceitar e recusar são BOTÕES do jogador, e a fala vem depois: quando o envelope disser que aceitei ou recusei, NÃO narre o acordo — espere as minhas palavras e reaja a elas.
- NUNCA diga ao jogador quais são as etapas seguintes de uma missão. Ele sabe o que fazer agora; o resto é história por acontecer.`;
