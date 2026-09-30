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
import { indoleDe, tracoPorId, garantirConvivio } from "./indole.js";
import { nomePessoa } from "./nomes.js";
import { TIPOS_DE_LACO, garantirLaco, importanciaDe, FIGURANTE } from "./npcs.js";

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

  /* ---- MM8e: O QUE A CAMPANHA MUDOU (o campo `elenco` do save) ----
     Aplicado DEPOIS dos laços e das casas, de propósito: uma promoção não
     pode baralhar os laços de quem não tem nada com ela. Quem saiu sai
     (dos laços também); quem subiu entra no fim, sem laço sorteado — o
     laço dele é o que o jogo lhe der a partir de agora. */
  const est = garantirElencoDoSave(o.estado);
  const saiu = new Set(Object.keys(est.saidos).map(norm));
  let final = pessoas.filter((p) => !saiu.has(norm(p.nome)));
  const registo = obj(o.npcs);
  const subiram = Object.entries(est.promovidos)
    .filter(([n]) => !saiu.has(norm(n)) && !final.some((p) => norm(p.nome) === norm(n)))
    .sort((a, b) => a[1] - b[1] || (norm(a[0]) < norm(b[0]) ? -1 : 1));
  for (const [nome, dia] of subiram) {
    const b = daBase.get(norm(nome));
    const f = registo[Object.keys(registo).find((k) => norm(k) === norm(nome))] || {};
    const cidade = b ? b.cidade : (todas.find((c) => norm(c.nome) === norm(f.local)) || {}).nome || "";
    const k = casas.find((x) => norm(x.cidade) === norm(cidade) && x.membros.some((m) => norm(m) === norm(nome)));
    final.push({ ...(b || {}), nome, papel: String(f.papel || (b && b.papel) || ""), cidade, fonte: "promovido", estreia: dia, morto: estaMorto(o.base, nome), ...(k ? { casa: k.nome } : {}) });
  }
  final = final.slice(0, TAMANHO_DO_ELENCO);
  const ficou = new Set(final.map((p) => norm(p.nome)));
  const lacosFinais = lacos.filter((l) => ficou.has(norm(l.a)) && ficou.has(norm(l.b)));

  /* nada do que sai daqui carrega a data do encontro nem a marca do registo */
  for (const p of final) { delete p.conhecidoEm; delete p.ultimaVez; }
  return { pessoas: final, lacos: lacosFinais, casas };
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

/* ============================================================
   A GENTE PARA POVOAR (Fase MM, MM8c-2) — o fim do "ELENCO DIVERSO"

   O prompt dava ao Narrador seis nomes para povoar o mundo, e eles saíam
   de `Math.random` a cada load: a mesma campanha, recarregada, oferecia
   seis estranhos novos, e o Narrador punha em cena gente que o mundo não
   tinha. Agora a lista é o ELENCO que o herói ainda não conheceu, que já
   estreou (`estreia` ≤ hoje) e que está por perto — da cidade onde ele
   está primeiro, da região depois, do resto do mundo por fim. Os chefes
   ficam de fora: têm lista própria (`resumoChefesPrompt`) e aparecem
   quando a história pede, não para povoar uma taverna. Mortos, também.

   Devolve a mesma forma que o banco antigo ({ nome, genero_pessoa, raca,
   ocupacao, traco }), para o prompt a ler sem saber de onde veio.
   ============================================================ */
export const PARA_POVOAR = 6;

export function elencoParaPovoar(semente, mapa, contexto, quantos = PARA_POVOAR) {
  const o = obj(contexto);
  let el;
  try { el = elencoDoMundo(semente, mapa, o); } catch { return []; }
  const conhecidos = new Set(Object.keys(obj(o.npcs)).map(norm));
  const dia = Number.isFinite(Number(o.dia)) ? Number(o.dia) : 1;
  const cidades = Array.isArray(obj(mapa).cidades) ? mapa.cidades.filter((c) => c && c.nome) : [];
  const regiaoDe = (nome) => ((cidades.find((c) => norm(c.nome) === norm(nome)) || {}).regiao || "");
  const aqui = norm(o.cidade), regiaoAqui = norm(regiaoDe(o.cidade));
  const perto = (p) => (aqui && norm(p.cidade) === aqui ? 0 : regiaoAqui && norm(regiaoDe(p.cidade)) === regiaoAqui ? 1 : 2);
  const n = Math.max(0, Math.floor(Number(quantos) || 0));
  return el.pessoas
    .filter((p) => p.fonte !== "chefe" && !p.morto && p.estreia <= dia && !conhecidos.has(norm(p.nome)))
    .map((p, i) => ({ p, i, d: perto(p) }))
    .sort((a, b) => a.d - b.d || a.i - b.i)
    .slice(0, n)
    .map(({ p }) => ({ nome: p.nome, genero_pessoa: p.genero_pessoa || "", raca: p.raca || "", ocupacao: p.papel || "", traco: p.traco || "" }));
}

/* ============================================================
   A PROMOÇÃO (Fase MM, MM8e) — o figurante em quem se investe sobe

   É a única subetapa da MM8 com campo de save, e ele é NOVO, no topo, e
   ignorado pela versão antiga: `elenco` = { versao, promovidos, saidos,
   vistos }. O load antigo lê o save chave a chave (`sv.npcs`, `sv.mapa`…)
   e nunca olha para esta; o `salvar` antigo monta o objeto de novo a
   partir dos refs, e por isso, se alguém voltar a uma versão antiga, a
   chave some no primeiro autosave — perde-se a promoção, e o elenco volta
   a ser o derivado. O jogo continua inteiro: é o que um revert pode
   desfazer.

   (O nome da função é `garantirElencoDoSave`, e não `garantirElenco`: esse
   já existe em `interprete.js` — a memória do Intérprete — e o App importa
   os dois.)

   · VISTOS: os dias em que o herói viu cada pessoa — quando a narração a
     cita. Com teto por pessoa (os dias mais recentes) e por total (quem
     foi visto por último). Fecha o "visto em 2 dias ou mais" da MM8d.
   · A PROMOÇÃO, ao virar o dia: quem está no registo, fora do elenco,
     vivo, e em quem o jogador INVESTIU — voltou a ele (dias vistos), tem
     laço, anda no grupo — sobe, desde que o CONVÍVIO do convite o permita
     (o mesmo `garantirConvivio`, com o mesmo `conhecidoEm`, lidos e nunca
     escritos). Um por dia.
   · A SAÍDA: o elenco tem tamanho fixo, e quem sobe empurra quem pesa
     menos. Nunca sai quem a espinha pede, nenhum chefe, ninguém com laço
     comigo, ninguém do grupo. A saída é dita em voz de mundo ("Fulano
     deixou a cidade"), na pauta, quando a cena é a cidade dele.
   ============================================================ */
export const ELENCO_DO_SAVE_VERSAO = 1;
export const VISTOS = { porPessoa: 10, pessoas: 150 };
export const PROMOCAO = {
  /* o mesmo piso de dias que a índole pede antes de qualquer propósito
     acontecer (`DIAS_ATE_QUALQUER_PLANO`, indole.js): ninguém vira gente
     da história no dia em que o herói o conheceu */
  convivioMinimo: 3,
  porDia: 1,
  peso: { grupo: 100, laco: 60, porDiaVisto: 10 },
  /* o que pesa para SAIR, além da importância do registo */
  pesoDeFicar: { mestre: 5, doArco: 3, recorrente: 0, promovido: 4 },
  /* quantos dias a saída ainda se diz na cena, e quantas por turno */
  saidaNaPauta: 3,
  saidasPorTurno: 1,
};
export const FONTES_QUE_NUNCA_SAEM = ["espinha", "chefe"];

const PROIBIDAS = new Set(["__proto__", "constructor", "prototype"]);
const diaValido = (v) => { const n = Math.floor(Number(v)); return Number.isFinite(n) && n >= 0 ? n : null; };
const nomeValido = (k) => { const n = String(k == null ? "" : k).trim().slice(0, 60); return n && !PROIBIDAS.has(n) ? n : ""; };

export function garantirElencoDoSave(x) {
  const o = obj(x);
  const mapaDeDias = (m) => {
    const out = {};
    for (const [k, v] of Object.entries(obj(m))) { const nome = nomeValido(k), d = diaValido(v); if (nome && d != null) out[nome] = d; }
    return out;
  };
  const vistos = {};
  for (const [k, v] of Object.entries(obj(o.vistos))) {
    const nome = nomeValido(k);
    if (!nome || !Array.isArray(v)) continue;
    const dias = [...new Set(v.map(diaValido).filter((d) => d != null))].sort((a, b) => a - b).slice(-VISTOS.porPessoa);
    if (dias.length) vistos[nome] = dias;
  }
  const nomes = Object.keys(vistos);
  if (nomes.length > VISTOS.pessoas) {
    nomes.sort((a, b) => vistos[b][vistos[b].length - 1] - vistos[a][vistos[a].length - 1] || (a < b ? -1 : 1));
    for (const n of nomes.slice(VISTOS.pessoas)) delete vistos[n];
  }
  return { versao: ELENCO_DO_SAVE_VERSAO, promovidos: mapaDeDias(o.promovidos), saidos: mapaDeDias(o.saidos), vistos };
}

const chaveDe = (m, nome) => Object.keys(m).find((k) => norm(k) === norm(nome));

export function diasVistosDe(estado, nome) {
  const e = garantirElencoDoSave(estado);
  const k = chaveDe(e.vistos, nome);
  return k ? e.vistos[k].length : 0;
}

/* o herói viu esta pessoa neste dia — estado novo, o recebido intacto */
export function registrarVisto(estado, nome, dia) {
  const e = garantirElencoDoSave(estado);
  const n = nomeValido(nome), d = diaValido(dia);
  if (!n || d == null) return e;
  const k = chaveDe(e.vistos, n) || n;
  return garantirElencoDoSave({ ...e, vistos: { ...e.vistos, [k]: [...(e.vistos[k] || []), d] } });
}

/* quem do registo a narração cita pelo nome inteiro, como palavra */
export function vistosDaNarrativa(estado, npcs, narrativa, dia) {
  const texto = ` ${norm(narrativa).replace(/[^a-z0-9]+/g, " ")} `;
  let e = garantirElencoDoSave(estado);
  if (!texto.trim()) return e;
  for (const nome of Object.keys(obj(npcs))) {
    const alvo = norm(nome).replace(/[^a-z0-9]+/g, " ").trim();
    if (alvo.length >= 3 && texto.includes(` ${alvo} `)) e = registrarVisto(e, nome, dia);
  }
  return e;
}

/* AO VIRAR O DIA. `contexto` é o de `elencoDoMundo` (sem o estado, que
   vai à parte); `mundo`: { npcs, grupo, dia }. Devolve o estado novo, quem
   subiu e quem saiu (com a cidade dele) — ou tudo vazio. */
export function promoverNoDia(semente, mapa, contexto, estado, mundo) {
  const w = obj(mundo);
  let e = garantirElencoDoSave(estado);
  const vazio = { estado: e, promovidos: [], saidos: [] };
  const npcs = obj(w.npcs);
  const hoje = diaValido(w.dia);
  if (hoje == null) return vazio;
  const grupo = (Array.isArray(w.grupo) ? w.grupo : []).map((g) => norm(g && typeof g === "object" ? g.nome : g));
  const noGrupo = (n) => grupo.includes(norm(n));
  const out = { promovidos: [], saidos: [] };
  for (let vez = 0; vez < PROMOCAO.porDia; vez++) {
    let el;
    try { el = elencoDoMundo(semente, mapa, { ...obj(contexto), estado: e, npcs }); } catch { break; }
    if (!el.pessoas.length) break;
    const noElenco = new Set(el.pessoas.map((p) => norm(p.nome)));
    const candidatos = Object.entries(npcs)
      .filter(([k, n]) => n && typeof n === "object" && nomeValido(k) && !noElenco.has(norm(k)))
      .filter(([k, n]) => !/mort/.test(norm(n.status)) && !estaMorto(obj(contexto).base, k))
      .map(([k, n]) => {
        /* O CONVÍVIO DO CONVITE, lido e nunca escrito: os dias desde o encontro */
        const conhecido = diaValido(n.conhecidoEm);
        const convivio = garantirConvivio({ dias: conhecido == null ? 0 : hoje - conhecido });
        const dias = diasVistosDe(e, k);
        const laco = !!garantirLaco(n.laco);
        const investiu = noGrupo(k) || laco || dias >= FIGURANTE.diasVistos;
        const peso = (noGrupo(k) ? PROMOCAO.peso.grupo : 0) + (laco ? PROMOCAO.peso.laco : 0) + dias * PROMOCAO.peso.porDiaVisto;
        return { nome: k, ficha: n, conhecido, convivio, investiu, peso };
      })
      .filter((c) => c.investiu && c.conhecido != null && c.convivio.dias >= PROMOCAO.convivioMinimo)
      .sort((a, b) => b.peso - a.peso || a.conhecido - b.conhecido || (norm(a.nome) < norm(b.nome) ? -1 : 1));
    if (!candidatos.length) break;
    /* quem sai: o que pesa menos entre os que PODEM sair */
    const podemSair = el.pessoas.filter((p) => {
      if (FONTES_QUE_NUNCA_SAEM.includes(p.fonte) || noGrupo(p.nome)) return false;
      const f = npcs[chaveDe(npcs, p.nome) || ""];
      return !(f && garantirLaco(f.laco));
    }).map((p, i) => {
      const f = npcs[chaveDe(npcs, p.nome) || ""];
      const peso = importanciaDe(f || { nome: p.nome, status: p.morto ? "morto" : "" }, { grupo: w.grupo }) + diasVistosDe(e, p.nome) * PROMOCAO.peso.porDiaVisto + (PROMOCAO.pesoDeFicar[p.fonte] || 0) + (p.morto ? -40 : 0);
      return { p, i, peso };
    }).sort((a, b) => a.peso - b.peso || b.p.estreia - a.p.estreia || b.i - a.i);
    if (!podemSair.length) break;
    const sobe = candidatos[0], sai = podemSair[0].p;
    const saidos = { ...e.saidos, [sai.nome]: hoje };
    const k = chaveDe(saidos, sobe.nome);
    if (k) delete saidos[k];
    e = garantirElencoDoSave({ ...e, promovidos: { ...e.promovidos, [sobe.nome]: hoje }, saidos });
    out.promovidos.push(sobe.nome);
    out.saidos.push({ nome: sai.nome, cidade: sai.cidade || "" });
  }
  return { estado: e, ...out };
}

/* A SAÍDA EM VOZ DE MUNDO: na cidade de quem saiu, nos dias logo a seguir.
   A cidade é a da derivação (sem o estado): é onde a pessoa vivia. */
export function saidaParaPauta(semente, mapa, contexto, estado, cena) {
  const c = obj(cena);
  const e = garantirElencoDoSave(estado);
  const hoje = diaValido(c.dia);
  const out = { antes: [] };
  if (hoje == null || !c.cidade || !Object.keys(e.saidos).length) return out;
  let el;
  try { el = elencoDoMundo(semente, mapa, { ...obj(contexto), estado: null }); } catch { return out; }
  const recentes = Object.entries(e.saidos)
    .filter(([, d]) => hoje - d >= 0 && hoje - d <= PROMOCAO.saidaNaPauta)
    .sort((a, b) => b[1] - a[1] || (norm(a[0]) < norm(b[0]) ? -1 : 1));
  for (const [nome, d] of recentes) {
    const p = el.pessoas.find((x) => norm(x.nome) === norm(nome));
    if (!p || norm(p.cidade) !== norm(c.cidade)) continue;
    const ha = hoje - d;
    out.antes.push(`${nome} deixou ${p.cidade} ${ha === 0 ? "hoje" : ha === 1 ? "ontem" : `há ${ha} dias`}`);
    if (out.antes.length >= PROMOCAO.saidasPorTurno) break;
  }
  return out;
}

