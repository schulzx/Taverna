/* ============================================================
   O REGISTRO DA SESSÃO — o que aconteceu desde que a mesa abriu (V10, 16/11)

   A tecnologia de divulgação do lançamento (T2): ao levantar da mesa o
   jogo compõe o cartão da sessão (cartao-da-sessao.js), e ao voltar mostra
   «Da última vez…». Os dois leem daqui, e daqui só sai o que o ESTADO viu:
   o dado que a bandeja pousou, a frase que o jogador escreveu, a luta que
   fechou, a busca que o registo deu por fechada. Nada vem de um resumo de
   IA — a frase do cartão é a do próprio jogador, tal como ele a escreveu.

   Campo de save NOVO e aditivo: `registroDaSessao` = { v, atual, ultima }.
   A versão antiga ignora-o; um save sem ele abre a sessão 1.

   Uma «sessão» é uma visita: começa quando a campanha abre (nova ou
   continuada) e fecha quando a campanha volta a abrir. `abrirSessao` faz a
   virada: a atual, se teve jogo, passa a `ultima`, e nasce a seguinte. A
   base (`base`) é a fotografia do que importa no instante da abertura — as
   moedas, o XP, o nível, as buscas já fechadas —, e o que a sessão ganhou
   sai da diferença, nunca de um contador que alguém tenha de lembrar.

   Módulo puro: o relógio entra por argumento (`agora`), nunca Date.now().
   ============================================================ */

import { questPorId } from "./biblioteca-de-quests.js";

export const REGISTRO_DA_SESSAO = Object.freeze({
  v: 1,
  /* a frase do jogador guardada com o dado (o cartão corta em duas linhas) */
  tetoDaFrase: 240,
  /* os lugares pisados que ficam (o resto é registo, e o registo já existe) */
  tetoDeLugares: 12,
  /* os tipos de inimigo caído que se contam */
  tetoDeTipos: 16,
  /* as buscas fechadas que se nomeiam */
  tetoDeBuscas: 8,
  /* os estados do registo da quest (ESTADOS_DA_QUEST) e da missão que contam como «fechada» */
  fechadas: Object.freeze({ espinha: Object.freeze(["concluida", "terminada"]), missao: Object.freeze(["concluida"]) }),
});

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const inteiro = (v, p = 0) => { const n = Number(v); return Number.isFinite(n) ? Math.round(n) : p; };
const texto = (x, teto = 200) => (typeof x === "string" ? x.replace(/\s+/g, " ").trim().slice(0, teto) : "");
const nomeDe = (x) => (typeof x === "string" ? x : obj(x) && typeof x.nome === "string" ? x.nome : "");

/* ---------------- a sessão vazia ---------------- */
function sessaoVazia(n, base) {
  return {
    n: Math.max(1, inteiro(n, 1)),
    inicio: 0, fim: 0, turnos: 0,
    dados: { rolados: 0, vintes: 0, uns: 0, vinteQuePassou: 0 },
    maior: null,
    caidos: {}, lutasVencidas: 0,
    lugares: [], cena: "", lugar: "",
    ultimaFrase: "",
    fio: null,
    base: base || null,
  };
}

function garantirSessao(s) {
  const o = obj(s);
  if (!o) return null;
  const R = REGISTRO_DA_SESSAO;
  const d = obj(o.dados) || {};
  const m = obj(o.maior);
  const caidos = {};
  for (const [k, n] of Object.entries(obj(o.caidos) || {}).slice(0, R.tetoDeTipos)) if (texto(k, 60) && inteiro(n) > 0) caidos[texto(k, 60)] = inteiro(n);
  const b = obj(o.base);
  return {
    n: Math.max(1, inteiro(o.n, 1)),
    inicio: Math.max(0, inteiro(o.inicio)), fim: Math.max(0, inteiro(o.fim)), turnos: Math.max(0, inteiro(o.turnos)),
    dados: { rolados: Math.max(0, inteiro(d.rolados)), vintes: Math.max(0, inteiro(d.vintes)), uns: Math.max(0, inteiro(d.uns)), vinteQuePassou: Math.max(0, inteiro(d.vinteQuePassou)) },
    maior: m && inteiro(m.natural) >= 1 && inteiro(m.natural) <= 20 ? {
      natural: inteiro(m.natural), total: inteiro(m.total), alvo: m.alvo == null ? null : inteiro(m.alvo),
      pericia: texto(m.pericia, 60), desfecho: texto(m.desfecho, 20), frase: texto(m.frase, R.tetoDaFrase), ordem: Math.max(0, inteiro(m.ordem)),
    } : null,
    caidos, lutasVencidas: Math.max(0, inteiro(o.lutasVencidas)),
    lugares: arr(o.lugares).map((l) => texto(l, 80)).filter(Boolean).slice(-R.tetoDeLugares),
    cena: texto(o.cena, 40), lugar: texto(o.lugar, 80),
    ultimaFrase: texto(o.ultimaFrase, R.tetoDaFrase),
    fio: obj(o.fio) && texto(o.fio.pergunta, 70) ? { tipo: texto(o.fio.tipo, 12), pergunta: texto(o.fio.pergunta, 70), passo: texto(o.fio.passo, 160) } : null,
    base: b ? {
      moedas: inteiro(b.moedas), xp: inteiro(b.xp), nivel: Math.max(1, inteiro(b.nivel, 1)),
      fechadas: arr(b.fechadas).filter((x) => typeof x === "string").slice(0, 200),
    } : null,
  };
}

/* O campo do save, lido de qualquer coisa. Nunca lança. */
export function garantirRegistroDaSessao(x) {
  const o = obj(x) || {};
  return { v: REGISTRO_DA_SESSAO.v, atual: garantirSessao(o.atual), ultima: garantirSessao(o.ultima) };
}

/* ---------------- o que o estado diz agora ----------------
   `estado`: a forma do save (personagem, missoes, espinha, cativeiro…). */
function fechadasDe(estado) {
  const E = obj(estado) || {};
  const F = REGISTRO_DA_SESSAO.fechadas;
  const ids = [];
  const esp = obj(E.espinha);
  const regs = esp && obj(esp.quests) ? arr(esp.quests.registos) : [];
  for (const r of regs) if (obj(r) && typeof r.id === "string" && F.espinha.includes(r.estado)) ids.push("q:" + r.id);
  for (const m of arr(E.missoes)) if (obj(m) && m.id != null && F.missao.includes(m.status)) ids.push("m:" + String(m.id));
  return ids;
}
function tituloDaFechada(id, estado) {
  if (id.startsWith("q:")) { const q = questPorId(id.slice(2)); return q ? texto(q.titulo, 70) : ""; }
  const m = arr((obj(estado) || {}).missoes).find((x) => obj(x) && "m:" + String(x.id) === id);
  return m ? texto(m.titulo, 70) : "";
}
function baseDe(estado) {
  const p = obj((obj(estado) || {}).personagem) || {};
  return { moedas: inteiro(p.moedas), xp: inteiro(p.xp), nivel: Math.max(1, inteiro(p.nivel, 1)), fechadas: fechadasDe(estado) };
}
const teveJogo = (s) => !!s && (s.turnos > 0 || s.dados.rolados > 0);

/* ---------------- abrir ----------------
   A virada da visita: a atual com jogo vira a última; nasce a seguinte com
   a fotografia de agora. A atual sem jogo (abriu e saiu) não conta como
   sessão: é refeita no mesmo número. */
export function abrirSessao(registro, estado) {
  const r = garantirRegistroDaSessao(registro);
  const base = baseDe(estado);
  if (!r.atual) return { ...r, atual: sessaoVazia(1, base) };
  if (teveJogo(r.atual)) return { ...r, ultima: r.atual, atual: sessaoVazia(r.atual.n + 1, base) };
  return { ...r, atual: sessaoVazia(r.atual.n, base) };
}

function comAtual(registro, f) {
  const r = garantirRegistroDaSessao(registro);
  const a = r.atual || sessaoVazia(1, null);
  return { ...r, atual: f(a) };
}
const marcaTempo = (a, agora) => {
  const t = Math.max(0, inteiro(agora));
  if (!t) return a;
  return { ...a, inicio: a.inicio || t, fim: Math.max(a.fim, t) };
};

/* ---------------- anotar ----------------
   O turno: a frase do jogador e onde a cena estava. */
export function anotarTurno(registro, { frase = "", agora = 0, lugar = "", cena = "" } = {}) {
  return comAtual(registro, (a0) => {
    const a = marcaTempo(a0, agora);
    const l = texto(lugar, 80);
    const lugares = l && a.lugares[a.lugares.length - 1] !== l ? [...a.lugares.filter((x) => x !== l), l].slice(-REGISTRO_DA_SESSAO.tetoDeLugares) : a.lugares;
    return { ...a, turnos: a.turnos + 1, ultimaFrase: texto(frase, REGISTRO_DA_SESSAO.tetoDaFrase) || a.ultimaFrase, lugares, lugar: l || a.lugar, cena: texto(cena, 40) || a.cena };
  });
}

/* O lance (a forma de a-bandeja.js): todo dado que a mesa pousou. Só o d20
   conhece os naturais; o «maior dado» é o maior d20 natural (desempate: o
   mais recente), com a perícia, o número a bater e a frase que o pediu. */
export function anotarLance(registro, lance, { frase = "", agora = 0 } = {}) {
  const l = obj(lance);
  if (!l || !Array.isArray(l.dados) || !l.dados.length) return garantirRegistroDaSessao(registro);
  return comAtual(registro, (a0) => {
    const a = marcaTempo(a0, agora);
    const contados = l.dados.filter((d) => d && !d.posto);
    const d20 = contados.length === 1 && inteiro(contados[0].faces) === 20 ? inteiro(contados[0].valor) : 0;
    const ordem = a.dados.rolados + 1;
    const dados = {
      rolados: ordem,
      vintes: a.dados.vintes + (d20 === 20 ? 1 : 0),
      uns: a.dados.uns + (d20 === 1 ? 1 : 0),
      vinteQuePassou: a.dados.vinteQuePassou + (d20 === 20 && l.desfecho !== "falha" ? 1 : 0),
    };
    let maior = a.maior;
    if (d20 >= 1 && (!maior || d20 >= maior.natural)) {
      maior = { natural: d20, total: inteiro(l.total, d20), alvo: l.alvo == null ? null : inteiro(l.alvo), pericia: texto(l.rotulo, 60), desfecho: texto(l.desfecho, 20), frase: texto(frase, REGISTRO_DA_SESSAO.tetoDaFrase), ordem };
    }
    return { ...a, dados, maior };
  });
}

/* O fio mais quente do instante (oFioMaisQuente), guardado com a sessão:
   é o que a chegada mostra na volta, sem refazer a régua da quest a partir
   do save cru. null apaga (não há fio: nada se inventa no lugar). */
export function anotarFio(registro, fio) {
  return comAtual(registro, (a) => {
    const f = obj(fio);
    return { ...a, fio: f && texto(f.pergunta, 70) ? { tipo: texto(f.tipo, 12), pergunta: texto(f.pergunta, 70), passo: texto(f.passo, 160) } : null };
  });
}

/* O fecho da luta: quem caiu (os nomes do combate: «Rato gigante 2» conta
   como «Rato gigante») e se foi vencida. */
const tipoDoCaido = (nome) => texto(String(nome || "").replace(/\s*(#\s*)?\d+$/, ""), 60);
export function anotarLuta(registro, { caidos = [], desfecho = "" } = {}) {
  return comAtual(registro, (a) => {
    const c = { ...a.caidos };
    for (const n of arr(caidos)) {
      const t = tipoDoCaido(n);
      if (!t) continue;
      if (!(t in c) && Object.keys(c).length >= REGISTRO_DA_SESSAO.tetoDeTipos) continue;
      c[t] = (c[t] || 0) + 1;
    }
    return { ...a, caidos: c, lutasVencidas: a.lutasVencidas + (desfecho === "vitoria" ? 1 : 0) };
  });
}

/* ---------------- o resumo ----------------
   oResumoDaSessao(sessao, estado) → o que a sessão foi, em fatos do estado.
   `estado` é o do FIM da sessão: o de agora para a que está em curso, o
   gravado para a que se lembra (aSessaoParaLembrar). Sem estado, os ganhos
   ficam a zero — nunca inventados. */
export function oResumoDaSessao(sessao, estado) {
  const s = garantirSessao(sessao);
  if (!s) return null;
  const E = obj(estado);
  const agora = E ? baseDe(E) : null;
  const b = s.base;
  const novas = agora && b ? agora.fechadas.filter((id) => !b.fechadas.includes(id)) : [];
  const p = E ? obj(E.personagem) || {} : {};
  const caidos = Object.entries(s.caidos).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).map(([tipo, n]) => ({ tipo, n }));
  const cat = E ? obj(E.cativeiro) : null;
  const queda = cat ? "levada" : E && E.fimSemSaida ? "caiu" : "";
  return {
    n: s.n,
    turnos: s.turnos,
    minutos: s.inicio && s.fim > s.inicio ? Math.round((s.fim - s.inicio) / 60000) : 0,
    fim: s.fim,
    dados: s.dados,
    maior: s.maior,
    caidos,
    caidosTotal: caidos.reduce((t, c) => t + c.n, 0),
    lutasVencidas: s.lutasVencidas,
    buscas: novas.map((id) => tituloDaFechada(id, E)).filter(Boolean).slice(0, REGISTRO_DA_SESSAO.tetoDeBuscas),
    buscasFechadas: novas.length,
    moedas: agora && b ? agora.moedas - b.moedas : 0,
    xp: agora && b ? Math.max(0, agora.xp - b.xp) : 0,
    nivel: agora && b && agora.nivel > b.nivel ? { de: b.nivel, para: agora.nivel } : null,
    lugares: s.lugares,
    lugar: s.lugar || nomeDe(E && E.lugar),
    cena: s.cena,
    queda,
    diasEmFerros: cat ? Math.max(0, inteiro(cat.dias, 0)) : 0,
    ultimaFrase: s.ultimaFrase,
    fio: s.fio,
    heroi: E ? { nome: texto(p.nome, 60), raca: nomeDe(p.raca), classe: nomeDe(p.classe), sexo: p.genero === "mulher" ? "mulher" : "homem", semente: p.semente || p.nome || "", nivel: Math.max(1, inteiro(p.nivel, 1)) } : null,
  };
}

/* A sessão a lembrar: a atual, se teve jogo (o save ainda não virou — é o
   que a chegada lê), senão a última (abriu e saiu sem jogar). Nos dois casos
   o estado gravado é o do fim dela, e o resumo pode ler a diferença. */
export function aSessaoParaLembrar(registro) {
  const r = garantirRegistroDaSessao(registro);
  return teveJogo(r.atual) ? r.atual : teveJogo(r.ultima) ? r.ultima : null;
}

/* ---------------- O FIO MAIS QUENTE ----------------
   Uma linha VERDADEIRA do estado, a que puxa o jogador de volta. A ordem é
   a tabela: o passo da busca da espinha (o que a pauta já manda), a missão
   ativa, e o vilão (só a alcunha, se o nome não caiu). A promessa aberta
   NÃO entra: as do Livro guardam um segredo (`pagaComo`) e as do Prometido
   foram escritas pelo Cronista — uma IA —, e nada que a IA escreveu sai no
   cartão nem no gancho.
   `passos`: os de osPassosDasQuests (a-quest-manda.js), que o App calcula
   — este módulo não refaz a régua da quest. */
export const PRIORIDADE_DO_FIO = Object.freeze([
  Object.freeze({ id: "passo", o: "o passo da busca da espinha que está acesa" }),
  Object.freeze({ id: "missao", o: "a missão ativa (a mais antiga)" }),
  Object.freeze({ id: "vilao", o: "quem trabalha contra o herói, pelo que o herói sabe dele" }),
]);
export function oFioMaisQuente(estado, opcoes) {
  const E = obj(estado) || {};
  const o = obj(opcoes) || {};
  const candidatos = {
    passo: () => {
      const p = arr(o.passos).find((x) => obj(x) && texto(x.texto));
      if (!p) return null;
      const q = questPorId(p.quest);
      return { pergunta: texto(q && q.titulo, 70) || "A busca", passo: texto(p.texto, 160) };
    },
    missao: () => {
      const m = arr(E.missoes).find((x) => obj(x) && x.status === "ativa" && texto(x.titulo));
      return m ? { pergunta: texto(m.titulo, 70), passo: texto(m.objetivo || m.descricao, 160) } : null;
    },
    vilao: () => {
      const v = obj(o.vilao);
      if (!v) return null;
      const quem = texto(v.nome, 60) || texto(v.alcunha, 60);
      return quem ? { pergunta: `O que quer ${quem}?`, passo: texto(v.passo, 160) } : null;
    },
  };
  for (const { id } of PRIORIDADE_DO_FIO) {
    let r = null;
    try { r = candidatos[id](); } catch { r = null; }
    if (r && r.pergunta) return Object.freeze({ tipo: id, ...r });
  }
  return null;
}

/* ---------------- os fatos de «Da última vez…» ----------------
   Até três frases, todas de fato do resumo, na ordem do peso: o que fechou,
   o maior dado, quem caiu, o nível, onde parou. */
export const FATOS_DA_ULTIMA_VEZ = Object.freeze({ teto: 3 });
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
export function osFatosDaUltimaVez(resumo) {
  const r = obj(resumo);
  if (!r) return [];
  const f = [];
  if (r.queda === "levada") f.push("Você foi levado vivo, e acordou em ferros.");
  else if (r.queda === "caiu") f.push("Você caiu, e a história parou ali.");
  if (r.buscas && r.buscas.length) f.push(`Você fechou «${r.buscas[0]}»${r.buscas.length > 1 ? ` e mais ${plural(r.buscas.length - 1, "busca", "buscas")}` : ""}.`);
  if (r.maior && r.maior.natural) f.push(`O maior dado da noite: ${r.maior.natural}${r.maior.pericia ? ` em ${r.maior.pericia}` : ""}${r.maior.natural === 20 ? " — um vinte natural" : ""}.`);
  if (r.caidosTotal) f.push(`${plural(r.caidosTotal, "inimigo caiu", "inimigos caíram")} pela sua mão.`);
  if (r.nivel) f.push(`Você chegou ao nível ${r.nivel.para}.`);
  if (r.lugar) f.push(`Você parou em ${r.lugar}.`);
  return f.slice(0, FATOS_DA_ULTIMA_VEZ.teto);
}

/* A linha que vai ao Narrador no primeiro turno da volta (a pauta dinâmica,
   dentro do teto). Curta: os fatos e o fio, nada que ele tenha de inventar. */
export const LINHA_DA_ULTIMA_VEZ = Object.freeze({ teto: 320 });
export function linhaDaUltimaVez(resumo, fio) {
  const fatos = osFatosDaUltimaVez(resumo);
  const f = obj(fio);
  const partes = [];
  if (fatos.length) partes.push(`O jogador volta à mesa. Da última vez: ${fatos.join(" ")}`);
  if (f && f.pergunta) partes.push(`Fica por dizer: ${f.pergunta}${f.passo ? ` — ${f.passo}` : ""}`);
  return partes.join(" ").slice(0, LINHA_DA_ULTIMA_VEZ.teto);
}

/* ---------------- há quanto tempo ----------------
   O rótulo de «Da última vez…» («HÁ DOIS DIAS · SESSÃO 4»): a distância
   entre a última jogada e agora, por tabela. Os dois instantes entram de
   fora (o módulo não lê o relógio). Sem instante, "". */
export const QUANDO_DA_VOLTA = Object.freeze([
  Object.freeze({ ate: 60 * 60000, diz: () => "HÁ POUCO" }),
  Object.freeze({ ate: 20 * 3600000, diz: (ms) => { const h = Math.max(1, Math.round(ms / 3600000)); return h === 1 ? "HÁ UMA HORA" : `HÁ ${h} HORAS`; } }),
  Object.freeze({ ate: 44 * 3600000, diz: () => "ONTEM" }),
  Object.freeze({ ate: 14 * 86400000, diz: (ms) => { const d = Math.max(2, Math.round(ms / 86400000)); return d === 2 ? "HÁ DOIS DIAS" : `HÁ ${d} DIAS`; } }),
  Object.freeze({ ate: Infinity, diz: (ms) => { const sem = Math.round(ms / (7 * 86400000)); return sem < 8 ? `HÁ ${sem} SEMANAS` : "HÁ MUITO TEMPO"; } }),
]);
export function haQuantoTempo(entao, agora) {
  const a = Number(entao), b = Number(agora);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) return "";
  const ms = Math.max(0, b - a);
  return QUANDO_DA_VOLTA.find((q) => ms < q.ate).diz(ms);
}
