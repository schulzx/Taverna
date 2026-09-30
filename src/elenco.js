/* ============================================================
   O ELENCO (Fase MM, etapa MM8b) — as 24 pessoas que importam

   O mundo nasce com mais de cem pessoas por semente — duas ou três por
   casa de cada cidade (`mundo-base`), os chefes, os mestres de guilda, a
   gente que a espinha da história escolheu —, e a `indoleDe` já dizia
   quem delas é figurante (seis em cada dez), quem volta e quem tem parte
   no que vai acontecer. Faltava a escolha: DESTAS, quais são o elenco da
   campanha. É o que o Matt tem e o nosso Mestre não tinha — vinte e
   poucas pessoas que ele conhece por dentro, com o que querem, com quem
   se dão mal, de que família são e o que a cidade diz delas.

   O ELENCO NÃO É GENTE NOVA. Nasce do que já existe, por esta ordem, e
   a ordem é uma tabela (`FONTES_DO_ELENCO`):

     1. quem a ESPINHA escolheu (os marcos com gente: "encontrar Fulano",
        e o chefe que é alvo de um marco) — a história já depende deles;
     2. os CHEFES com cara de gente — o antagonista também é elenco;
     3. os MESTRES DE GUILDA — quem mexe os pauzinhos de uma cidade;
     4. da base, quem é "do arco" pela índole, e depois quem "volta".

   E completa-se com os LAÇOS entre eles (amizade, amor, rivalidade,
   dívida, aprendizado — `TIPOS_DE_LACO`, o mesmo catálogo do registo) e
   com as CASAS: em cada cidade grande o bastante, uma família notável, de
   duas a quatro pessoas da cidade, com o que a cidade diz dela e de cada
   um. É isso que responde "o que dizem por aí da gente desta casa?".

   ---------------- O QUE ESTE MÓDULO NÃO FAZ ----------------

   · Não escreve no REGISTO. O elenco é derivado, como a base: ninguém
     entra no Códex por nascer no elenco, e o registo continua a receber
     gente pelas mesmas portas de antes (a cena cita, o Narrador anota).
   · Não tem campo de save. Derivar exige três coisas estáveis: a semente,
     o mapa (só as primeiras `CIDADES_DO_ELENCO` cidades, que são as que a
     geografia gerou — o Narrador acrescenta cidades no FIM da lista) e o
     que o save já guarda da criação (a espinha e as guildas, que o App
     passa). Sem espinha ou sem guildas, essas fontes simplesmente não
     entram: nada é inventado para as substituir.
   · Não dá `conhecidoEm` a ninguém. O dia do encontro é do encontro,
     nunca do nascimento — senão o convívio do convite inchava (o defeito
     da v9.315 ao contrário).
   ============================================================ */

import { rngDe } from "./geografia.js";
import { locaisDaCidade, genteDoLocal, chefesDoMundo, estaMorto } from "./mundo-base.js";
import { indoleDe, tracoPorId } from "./indole.js";
import { nomePessoa } from "./nomes.js";
import { TIPOS_DE_LACO } from "./npcs.js";

const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});

/* ---------------- AS TABELAS ---------------- */
export const TAMANHO_DO_ELENCO = 24;
/* só as primeiras cidades da lista entram: são as da geografia gerada, e
   uma cidade que o Narrador acrescente depois não troca o elenco */
export const CIDADES_DO_ELENCO = 12;

/* a ordem é a da lista; `teto` é quanto cada fonte pode ocupar */
export const FONTES_DO_ELENCO = [
  { id: "espinha", teto: 8, porque: "a história já depende deles: um marco pede para os encontrar ou derrotar" },
  { id: "chefe", teto: 3, porque: "o antagonista com cara de gente também é elenco" },
  { id: "mestre", teto: 4, porque: "quem mexe os pauzinhos de uma cidade" },
  { id: "doArco", teto: 24, porque: "a índole já dizia que têm parte no que vai acontecer" },
  { id: "recorrente", teto: 24, porque: "a índole já dizia que voltam, e que o jogador os lembra" },
];

/* A ESTREIA: nem todos existem para a cena no primeiro dia. Por fonte, a
   faixa de dias em que cada um pode aparecer pela primeira vez. */
export const ESTREIA_POR_FONTE = {
  espinha: { de: 1, ate: 30 },
  chefe: { de: 15, ate: 90 },
  /* o mestre de guilda já está na sede no primeiro dia: a casa dele existe */
  mestre: { de: 1, ate: 1 },
  doArco: { de: 1, ate: 45 },
  /* quem volta já está na rua no primeiro dia: é a cara da cidade */
  recorrente: { de: 1, ate: 1 },
};

/* OS LAÇOS entre gente do elenco (a família nasce das casas, à parte).
   `simetrico`: a amizade é dos dois; a dívida é de um PARA o outro. */
export const LACOS_DO_ELENCO = [
  { tipo: "amizade", simetrico: true, peso: 30 },
  { tipo: "rivalidade", simetrico: true, peso: 25 },
  { tipo: "divida", simetrico: false, peso: 20 },
  { tipo: "aprendizado", simetrico: false, peso: 15 },
  { tipo: "amor", simetrico: true, peso: 10 },
];
/* quantos laços cada pessoa do elenco ganha, e a chance de o outro ser
   da mesma cidade (é na mesma rua que as rixas e as dívidas nascem) */
export const LACOS_POR_PESSOA = { de: 1, ate: 2, mesmaCidade: 0.7 };

/* AS CASAS NOTÁVEIS: quantas por cidade, pelo PORTE (a mesma escala de
   `mundo-base`), e de quantas pessoas */
export const CASAS_POR_PORTE = { aldeia: 0, vila: 1, fortaleza: 1, cidade: 1, capital: 2 };
export const MEMBROS_DA_CASA = { de: 2, ate: 4 };

/* O QUE A CIDADE DIZ DE UMA CASA — e se ela é popular fora da própria rua */
export const REPUTACAO_DA_CASA = [
  { id: "amada", o: "a cidade gosta dela: é a porta a que se bate quando falta pão", popular: "muito, na cidade toda" },
  { id: "respeitada", o: "respeitada e um pouco temida: ninguém lhe deve duas vezes", popular: "sim, com reservas" },
  { id: "decadente", o: "já foi grande; hoje vive do nome e das dívidas", popular: "já foi; hoje só entre os velhos" },
  { id: "suspeita", o: "dizem baixinho que o dinheiro dela vem de onde não devia", popular: "não: cumprimentam e depois cospem" },
  { id: "nova", o: "subiu depressa, e a cidade velha não lhe perdoa", popular: "entre os novos sim, entre os velhos não" },
];

/* O QUE A CIDADE DIZ DE CADA UM: pela índole, que é quem a pessoa é. O
   primeiro traço que casa decide; sem traço que pese, passa despercebido. */
export const REPUTACAO_POR_TRACO = {
  bem: ["generoso", "compassivo", "fiel", "humilde", "corajoso", "brincalhao"],
  mal: ["cruel", "ganancioso", "traidor", "invejoso", "rancoroso", "medonho", "orgulhoso", "desconfiado"],
};
export const REPUTACOES = {
  bem: "bem-visto(a)",
  mal: "mal-visto(a)",
  nada: "passa despercebido(a)",
};

/* ---------------- A REPUTAÇÃO DE UMA PESSOA ----------------
   Derivável de qualquer pessoa, como a índole: a mesma chave (o nome). */
export function reputacaoDe(semente, pessoa) {
  const p = obj(pessoa);
  const i = indoleDe(String(semente == null ? "" : semente), { nome: p.nome || "" });
  for (const t of i.tracos) {
    if (REPUTACAO_POR_TRACO.bem.includes(t)) return { id: "bem", o: REPUTACOES.bem, porque: (tracoPorId(t) || {}).o || "" };
    if (REPUTACAO_POR_TRACO.mal.includes(t)) return { id: "mal", o: REPUTACOES.mal, porque: (tracoPorId(t) || {}).o || "" };
  }
  return { id: "nada", o: REPUTACOES.nada, porque: "" };
}

/* ---------------- O ELENCO ---------------- */

/* a gente da base de uma cidade, SEM filtrar os mortos: quem morreu
   continua a ser do elenco (e da família), só que morto */
function genteDaCidade(semente, cidade, genero, molde, lex) {
  const out = [];
  for (const l of locaisDaCidade(semente, cidade, genero, molde, lex)) {
    for (const p of genteDoLocal(semente, l, genero, molde, lex)) out.push({ ...p, cidade: cidade.nome, casaDeTrabalho: l.nome });
  }
  return out;
}

function estreiaDe(semente, nome, fonte) {
  const f = ESTREIA_POR_FONTE[fonte] || ESTREIA_POR_FONTE.recorrente;
  const r = rngDe(`${semente}|estreia|${nome}`);
  return f.de + Math.floor(r() * (f.ate - f.de + 1));
}

/* O NOME DA CASA é o sobrenome de quem a encabeça, quando ele tem um —
   "Dagon Punho-de-Pedra" faz a "Casa Punho-de-Pedra", e o jogador que
   ouve os dois nomes entende que são a mesma gente. Sem sobrenome, sai do
   banco de nomes do mundo (ou do léxico), sem repetir nenhuma casa já
   dada. O epíteto com artigo vira genitivo: "o Manco" → "Casa do Manco". */
function sobrenomeDe(nome) {
  const partes = String(nome || "").trim().split(/\s+/);
  return partes.length >= 2 ? partes.slice(1).join(" ") : "";
}
const comoCasa = (sob) => `Casa ${String(sob).replace(/^o\s+/i, "do ").replace(/^a\s+/i, "da ")}`;
function nomeDaCasa(cabeca, r, usadas, genero, lex) {
  const proprio = sobrenomeDe(cabeca);
  if (proprio && !usadas.has(comoCasa(proprio))) return comoCasa(proprio);
  for (let tent = 0; tent < 40; tent++) {
    const sob = sobrenomeDe(nomePessoa(genero, undefined, r, lex));
    if (sob && !usadas.has(comoCasa(sob))) return comoCasa(sob);
  }
  return `Casa ${usadas.size + 1}`;
}

/* `ctx`: { genero, molde, lex, espinha, guildas, base }.
   Devolve { pessoas: [24], lacos: [...], casas: [...] } — ou vazio, se
   não houver mundo. */
export function elencoDoMundo(semente, mapa, ctx) {
  const o = obj(ctx);
  const s = String(semente == null ? "" : semente);
  const genero = typeof o.genero === "string" && o.genero ? o.genero : "Fantasia medieval";
  const vazio = { pessoas: [], lacos: [], casas: [] };
  const todas = Array.isArray(obj(mapa).cidades) ? mapa.cidades.filter((c) => c && typeof c === "object" && c.nome) : [];
  const cidades = todas.slice(0, CIDADES_DO_ELENCO);
  if (!cidades.length) return vazio;

  let base = [];
  try { base = cidades.flatMap((c) => genteDaCidade(s, c, genero, o.molde, o.lex)); } catch { base = []; }
  const daBase = new Map(base.map((p) => [norm(p.nome), p]));
  let chefes = [];
  try { chefes = chefesDoMundo(s, mapa, genero, o.lex); } catch { chefes = []; }
  const humanoides = chefes.filter((c) => String(c.nome).includes(","));
  const chefePorNome = (n) => humanoides.find((c) => norm(c.nomeCurto) === norm(n) || norm(c.nome) === norm(n)) || null;

  const pessoas = [];
  const vistos = new Set();
  const conta = {};
  const por = (fonte, p) => {
    const teto = (FONTES_DO_ELENCO.find((f) => f.id === fonte) || {}).teto || 0;
    if (!p || !p.nome || vistos.has(norm(p.nome)) || pessoas.length >= TAMANHO_DO_ELENCO || (conta[fonte] || 0) >= teto) return;
    vistos.add(norm(p.nome));
    conta[fonte] = (conta[fonte] || 0) + 1;
    pessoas.push({ ...p, fonte, estreia: estreiaDe(s, p.nome, fonte) });
  };
  const daChefe = (c) => ({ nome: c.nome, papel: `${c.linha === "principal" ? "a ameaça maior" : "ameaça"} — ${c.personalidade}`, quer: c.motivo, cidade: "", regiao: c.regiao || "", casaDeTrabalho: "", genero_pessoa: "" });

  /* 1. a espinha: a gente dos marcos, e o chefe que é alvo de um */
  const marcos = (Array.isArray(obj(o.espinha).atos) ? o.espinha.atos : []).flatMap((a) => (Array.isArray(a && a.marcos) ? a.marcos : []));
  for (const m of marcos) {
    if (!m) continue;
    if (m.quem) { const b = daBase.get(norm(m.quem)); if (b) por("espinha", b); }
    if (m.alvo) { const c = chefePorNome(m.alvo); if (c) por("espinha", daChefe(c)); }
  }
  /* 2. os chefes com cara de gente, o principal primeiro */
  for (const c of [...humanoides].sort((a, b) => (a.linha === "principal" ? -1 : 0) - (b.linha === "principal" ? -1 : 0))) por("chefe", daChefe(c));
  /* 3. os mestres de guilda que o save guarda */
  for (const g of (Array.isArray(o.guildas) ? o.guildas : [])) {
    if (g && g.mestre) por("mestre", { nome: g.mestre, papel: `mestre de ${g.nome || "guilda"}`, cidade: g.sede || "", casaDeTrabalho: g.nome || "", genero_pessoa: "" });
  }
  /* 4. a base, cidade a cidade em rodízio — o elenco espalha-se pelo mundo */
  for (const rel of ["doArco", "recorrente"]) {
    const porCidade = cidades.map((c) => base.filter((p) => p.cidade === c.nome && p.indole && p.indole.relevancia === rel));
    for (let volta = 0; pessoas.length < TAMANHO_DO_ELENCO && porCidade.some((l) => l.length > volta); volta++) {
      for (const l of porCidade) if (l[volta]) por(rel, l[volta]);
    }
  }

  /* quem morreu continua do elenco, marcado — a família e os laços não se desfazem */
  for (const p of pessoas) p.morto = estaMorto(o.base, p.nome) || (p.nomeCurto ? estaMorto(o.base, p.nomeCurto) : false);

  /* ---- AS CASAS ---- */
  const casas = [];
  const usadas = new Set();
  const rNomes = rngDe(`${s}|casas-nomes`);
  for (const c of cidades) {
    const quantas = CASAS_POR_PORTE[c.porte || c.tipo] ?? 1;
    const daqui = base.filter((p) => p.cidade === c.nome);
    for (let i = 0; i < quantas; i++) {
      const r = rngDe(`${s}|casas|${c.nome}|${i}`);
      const n = MEMBROS_DA_CASA.de + Math.floor(r() * (MEMBROS_DA_CASA.ate - MEMBROS_DA_CASA.de + 1));
      const livre = (p) => !casas.some((k) => k.membros.includes(p.nome));
      /* A CASA GIRA EM VOLTA DE QUEM VOLTA — pela índole, não pela lista do
         elenco: assim as casas não dependem da espinha nem das guildas que o
         App passa, e são as mesmas em qualquer chamada. Quase sempre essa
         pessoa É do elenco (os "do arco" e os recorrentes entram nele). */
      const quemVolta = daqui.filter((p) => livre(p) && p.indole && p.indole.relevancia !== "figurante");
      const outros = daqui.filter((p) => livre(p) && !quemVolta.includes(p));
      const membros = quemVolta.length ? [quemVolta[Math.floor(r() * quemVolta.length)]] : [];
      while (membros.length < n && outros.length) membros.push(outros.splice(Math.floor(r() * outros.length), 1)[0]);
      if (membros.length < MEMBROS_DA_CASA.de) break;
      const cabeca = membros[0];
      const nome = nomeDaCasa(cabeca.nome, rNomes, usadas, genero, o.lex);
      usadas.add(nome);
      casas.push({
        nome,
        cidade: c.nome,
        sede: cabeca.casaDeTrabalho || "",
        membros: membros.map((p) => p.nome),
        reputacao: pick(r, REPUTACAO_DA_CASA).id,
      });
    }
  }
  /* pela CIDADE e pelo nome: o mundo tem duas Sable, e a de Baixo do Sul
     não é da família da de Torre Rasa */
  const casaDe = new Map();
  for (const k of casas) for (const m of k.membros) casaDe.set(`${norm(k.cidade)}|${norm(m)}`, k.nome);
  for (const p of pessoas) { const k = casaDe.get(`${norm(p.cidade)}|${norm(p.nome)}`); if (k) p.casa = k; }

  /* ---- OS LAÇOS ---- */
  const lacos = [];
  /* a família: todos da mesma casa são do mesmo sangue, dos dois lados */
  for (const k of casas) {
    const ms = pessoas.filter((p) => p.casa === k.nome).map((p) => p.nome);
    for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) lacos.push({ a: ms[i], b: ms[j], tipo: "familia", simetrico: true });
  }
  const temLaco = (a, b) => lacos.some((l) => (l.a === a && l.b === b) || (l.a === b && l.b === a));
  /* só os tipos que o registo conhece: um laço que o catálogo não tem não
     tem como ser lido por ninguém depois */
  const validos = LACOS_DO_ELENCO.filter((l) => TIPOS_DE_LACO.some((x) => x.id === l.tipo));
  const pesoTotal = validos.reduce((x, l) => x + l.peso, 0);
  for (const p of pessoas) {
    const r = rngDe(`${s}|lacos|${p.nome}`);
    const quantos = LACOS_POR_PESSOA.de + Math.floor(r() * (LACOS_POR_PESSOA.ate - LACOS_POR_PESSOA.de + 1));
    for (let k = 0; k < quantos; k++) {
      const mesma = pessoas.filter((q) => q !== p && q.cidade && q.cidade === p.cidade && !temLaco(p.nome, q.nome));
      const qualquer = pessoas.filter((q) => q !== p && !temLaco(p.nome, q.nome));
      const lista = mesma.length && r() < LACOS_POR_PESSOA.mesmaCidade ? mesma : qualquer;
      if (!lista.length) break;
      const outro = pick(r, lista);
      let d = r() * pesoTotal, tipo = validos[0];
      for (const l of validos) { if (d < l.peso) { tipo = l; break; } d -= l.peso; }
      if (!tipo) break;
      lacos.push({ a: p.nome, b: outro.nome, tipo: tipo.tipo, simetrico: tipo.simetrico });
    }
  }

  /* nada do que sai daqui carrega a data do encontro nem a marca do registo */
  for (const p of pessoas) { delete p.conhecidoEm; delete p.ultimaVez; }
  return { pessoas, lacos, casas };
}

/* Os laços de UMA pessoa, lidos dos dois lados quando o laço é dos dois:
   a amizade de A com B também é de B com A; a dívida de A para B não. */
export function lacosDe(elenco, nome) {
  const out = [];
  for (const l of (obj(elenco).lacos || [])) {
    if (norm(l.a) === norm(nome)) out.push({ com: l.b, tipo: l.tipo, sentido: l.simetrico ? "dos dois" : "meu" });
    else if (norm(l.b) === norm(nome)) out.push({ com: l.a, tipo: l.tipo, sentido: l.simetrico ? "dos dois" : "dele" });
  }
  return out;
}

