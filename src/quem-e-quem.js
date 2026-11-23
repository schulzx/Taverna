/* ============================================================
   QUEM É QUEM — o catálogo de pessoas e os ids (23/11/2026, etapa 1 da
   planta mente/plano-identidade-e-posse.md)

   A ordem da pessoa, 23/11: «se os personagens estão duplicando, em vez de
   proibir duplicidade naquele nome, vou criar um sistema de tags ou
   numeração que vai na ficha do personagem, então mesmo que tenha dois
   fulanos, o sistema vai saber qual é que está em cena.»

   Até aqui pessoa era identificada pelo nome, com cinco esquemas de id e
   nenhum dono. Este módulo é o dono. Ele não inventa forma nova: o id é o
   que o livro de fatos (livro-de-factos.js) já grava nos saves, e por isso
   todo id deste catálogo se deriva de um save antigo sem migração.

   ---------------- A FORMA DO ID (QUEM_E_QUEM.formas) ----------------
     · gente da base do mundo:  `Cidade|gente|Nome`, o de `idDaGente`
       (mundo-base.js). O HOMÔNIMO na mesma cidade — outra pessoa, mesmo
       nome — leva `~2`, `~3`…, pela ordem em que a base o gera
       (`locaisDaCidade`, depois `genteDoLocal`): a mesma semente dá os
       mesmos ids em qualquer máquina. A primeira continua sem sufixo, e
       por isso o fato já gravado com `Cidade|gente|Hilda` continua a ser
       dela.
     · registo, núcleo, grupo, cânone e batizado: `npc|<chave>` — a chave
       do registo (que já pode ser diferente do nome: `Hilda~2`, com
       `nome: "Hilda"`), ou o nome nos outros.
     · figurante: `Cidade|figurante|<tipo>`. Banca: `banca|<id>`. O herói:
       `heroi`.

   ---------------- O CATÁLOGO ----------------
   A lista única de quem existe, já com as fusões: quem está numa fonte de
   baixo e é UMA SÓ pessoa de uma fonte de cima (RESOLVER_NOME) fica como
   apelido (`alias`) do id dela — o «Marl» do registo é o «Marl de Osso»
   da base. A fusão é refeita a cada leitura, pela mesma régua; o save
   (`pessoas`, estado.js) só guarda o que não se deriva: a fusão que não
   sai da régua e a ficha do homônimo que o registo ganhou.

   ---------------- O QUE NÃO SE ESCOLHE CALADO ----------------
   `candidatos` devolve TODOS os que um nome pode ser, cada um com o seu
   estado (aqui, longe, morto) e um rótulo que os distingue. Quem decide é
   quem pergunta — o livro (que, com mais de um e nenhum na cidade, não
   escreve), e nas etapas seguintes o «qual» da tela.

   PURO E DETERMINÍSTICO. Nenhum relógio, nenhuma sorte que não seja a da
   semente do mundo; o estado recebido nunca é mutado; o `null` e o lixo
   dão o vazio, nunca uma exceção.
   ============================================================ */
import { HOMONIMO, ESTADO_SEM_VOLTA } from "./npcs.js";
import { idDaGente, locaisDaCidade, genteDoLocal } from "./mundo-base.js";
import { elencoDaCena } from "./cena.js";

/* ---------------- A TABELA ----------------
   `id`, `nome`: o tamanho do que se guarda (o livro usa os mesmos).
   `homonimo`: o que separa o nome do número do homônimo (`Hilda~2`).
   `formas`: os prefixos e as marcas de cada fonte. `alias`, `fichas`: o
   teto do campo `pessoas` no save — uma campanha de catorze sessões
   conhece pouco mais de cem pessoas (LIVRO_DE_FACTOS.pessoas é 120), e
   fusão e homônimo são a minoria delas.
   `rotulo`: a ordem do que distingue dois de mesmo primeiro nome.
   `estados`: o que `candidatos` diz de cada um. */
export const QUEM_E_QUEM = Object.freeze({
  v: 1,
  id: 120,
  nome: 40,
  homonimo: "~",
  formas: Object.freeze({ heroi: "heroi", registo: "npc|", banca: "banca|", gente: "gente", figurante: "figurante" }),
  alias: 200,
  fichas: 120,
  rotulo: Object.freeze(["oficio", "lugar", "sobrenome"]),
  estados: Object.freeze(["aqui", "longe", "morto"]),
});

/* ---------------- DO NOME AO ID: A REGRA DE DESEMPATE ----------------
   (veio de livro-de-factos.js, que a reexporta: é a régua do catálogo, e
   o livro é um dos que a leem)
   As fontes, da que manda mais à que manda menos: a gente da base do
   mundo (o id é `Cidade|gente|Nome`, o de `idDaGente`), o núcleo da
   campanha, o grupo, o registo e o cânone do Cronista (o id é `npc|Nome`).
   UMA PESSOA, UM ID: quem está numa fonte de baixo com o nome igual — ou
   com o nome mais curto, palavra a palavra («Marl» de «Marl de Osso») — a
   UMA SÓ pessoa de uma fonte de cima, e na mesma cidade quando as duas a
   dizem, é essa pessoa, e leva o id dela.

   Um nome procura-se por dois níveis, e para no primeiro que acha alguém:
     · `exato` — as palavras todas iguais, sem acento, sem artigo nem
       tratamento à frente (HOMONIMO.artigos, npcs.js: «Dona Inocência»),
       e sem o aposto («Corrado, o empresário da arena» é «Corrado»);
     · `prefixo` — um nome é o começo do outro, palavra a palavra, com o
       primeiro nome de pelo menos HOMONIMO.primeiroMinimo letras.
   NÃO HÁ o nível «só o primeiro nome»: «Nyla Pé-Leve» e «Nyla
   Punho-de-Pedra» são duas pessoas (10.ª sessão), e um fecho em falso não
   se desfaz, enquanto o que não fecha aparece no «o que falta». */
export const RESOLVER_NOME = Object.freeze({
  fontes: Object.freeze(["gente", "nucleo", "grupo", "registo", "canone"]),
  niveis: Object.freeze(["exato", "prefixo"]),
  prefixoDoRegisto: QUEM_E_QUEM.formas.registo,
  /* o que corta o aposto: a vírgula, o parêntese, o travessão */
  aposto: /[,(—–]/,
});

/* ---------------- utilidades ---------------- */
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const semAc = (s) => String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const limpo = (s, max = QUEM_E_QUEM.nome) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, max) : "");
const nomeDe = (x) => (typeof x === "string" ? x : obj(x) && typeof x.nome === "string" ? x.nome : "");
const temChave = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/* as palavras que fazem o nome: sem o aposto, sem acento, sem artigo */
export function palavrasDoNome(nome) {
  let s = String(nome == null ? "" : nome);
  const corte = s.search(RESOLVER_NOME.aposto);
  if (corte > 0) s = s.slice(0, corte);
  const ps = semAc(s).replace(/[^a-z0-9-]+/g, " ").split(/\s+/).filter((w) => w && w !== "-");
  while (ps.length > 1 && HOMONIMO.artigos.includes(ps[0])) ps.shift();
  return ps;
}
const casaExato = (a, b) => a.length > 0 && a.length === b.length && a.every((w, i) => w === b[i]);
function casaPrefixo(a, b) {
  const [curto, longo] = a.length <= b.length ? [a, b] : [b, a];
  if (!curto.length || curto[0].length < HOMONIMO.primeiroMinimo) return false;
  return curto.every((w, i) => w === longo[i]);
}
/* os níveis de RESOLVER_NOME, por nome — o livro lê-os também */
export const CASA_O_NOME = Object.freeze({ exato: casaExato, prefixo: casaPrefixo });
/* duas «ondes» são compatíveis quando uma nomeia a outra, palavra a palavra
   («nas docas de Alto do Sal» e «Alto do Sal»); sem uma delas, não se sabe */
const frase = (s) => ` ${semAc(s).replace(/[^a-z0-9]+/g, " ").trim()} `;
function mesmaTerra(a, b) {
  const x = frase(a), y = frase(b);
  if (!x.trim() || !y.trim()) return true;
  return x.includes(y) || y.includes(x);
}
/* a «onde» nomeia a cidade (o livro lê-a para a porta das etapas de antes) */
export const naCidade = (onde, cidade) => !!frase(onde).trim() && !!frase(cidade).trim() && frase(onde).includes(frase(cidade));

/* um id de pessoa já feito, como o livro o reconhece */
const RX_ID_PESSOA = /^(npc\|.+|[^|]+\|gente\|.+)$/;

/* ---------------- COMO UM ID NASCE ----------------
   idDe(registro, fonte, ctx) → id | ""
   `fonte`: heroi | gente | registo | nucleo | grupo | canone | batizado |
   figurante | banca. `ctx`: { cidade, gente } — a cidade de quem não diz a
   sua, e a lista ORDENADA da gente da base (a de `genteDaCidade`), que é o
   que dá o número ao homônimo. Sem a lista, o homônimo não se sabe, e o id
   é o do primeiro (o de sempre). */
const F = QUEM_E_QUEM.formas;
/* a identidade de uma pessoa da base dentro da lista: o id posicional que
   a base lhe dá (`Cidade|tipo|i`), senão o local e o nome */
const quemNaBase = (o, cid) => (typeof o.id === "string" && o.id && !o.id.includes(`|${F.gente}|`) ? o.id : `${cid}|${limpo(o.local, QUEM_E_QUEM.id)}|${limpo(nomeDe(o))}`);
/* os ids da lista da gente, na ordem dela: o homônimo ganha o número */
export function idsDaGente(lista, cidadePadrao) {
  const grupos = new Map();
  return arr(lista).map((g) => {
    const o = obj(g) || { nome: g };
    if (typeof o.id === "string" && o.id.includes(`|${F.gente}|`)) return o.id.length <= QUEM_E_QUEM.id ? o.id : "";
    const nome = limpo(nomeDe(o));
    const cid = limpo(o.cidade, QUEM_E_QUEM.id) || limpo(cidadePadrao, QUEM_E_QUEM.id);
    if (!cid || !nome) return "";
    const base = idDaGente(cid, { nome });
    const quem = quemNaBase(o, cid);
    const vistos = grupos.get(base) || [];
    let i = vistos.indexOf(quem);
    if (i < 0) { vistos.push(quem); i = vistos.length - 1; grupos.set(base, vistos); }
    return i === 0 ? base : `${base}${QUEM_E_QUEM.homonimo}${i + 1}`;
  });
}
export function idDe(registro, fonte, ctx) {
  const c = obj(ctx) || {};
  const r = obj(registro) || (typeof registro === "string" ? { nome: registro } : {});
  const cidade = limpo(r.cidade, QUEM_E_QUEM.id) || limpo(c.cidade, QUEM_E_QUEM.id);
  let id = "";
  if (fonte === "heroi") id = F.heroi;
  else if (fonte === "gente") {
    const lista = arr(c.gente);
    const i = lista.findIndex((g) => g === registro || (obj(g) && quemNaBase(g, limpo(g.cidade, QUEM_E_QUEM.id) || cidade) === quemNaBase(r, cidade)));
    id = i >= 0 ? idsDaGente(lista, cidade)[i] : idsDaGente([r], cidade)[0];
  } else if (fonte === "registo") {
    const chave = limpo(typeof r.chave === "string" ? r.chave : nomeDe(r));
    id = typeof r.id === "string" && r.id.startsWith(F.registo) ? r.id : chave ? F.registo + chave : "";
  } else if (["nucleo", "grupo", "canone", "batizado"].includes(fonte)) {
    const n = limpo(nomeDe(r));
    id = n ? F.registo + n : "";
  } else if (fonte === "figurante") {
    const tipo = limpo(r.tipo, QUEM_E_QUEM.id);
    id = cidade && tipo ? `${cidade}|${F.figurante}|${tipo}` : "";
  } else if (fonte === "banca") {
    const b = r.id != null ? String(r.id).trim() : "";
    id = b ? F.banca + b : "";
  }
  return id && id.length <= QUEM_E_QUEM.id ? id : "";
}

/* ---------------- O CAMPO DO SAVE ----------------
   garantirPessoas(x) → { v, alias: { id: id }, fichas: { id: { nome,
   origem, chave, cidade, local } } } | null
   Só o que não se deriva. O save sem o campo (todas as campanhas de
   antes), o vazio e o lixo dão `null` — o padrão de estado.js, e o sinal
   de que tudo se deriva. O apelido de si mesmo e o que vira laço caem. */
const ORIGENS = Object.freeze([...RESOLVER_NOME.fontes, "batizado"]);
function aliasLimpo(m) {
  const out = {};
  for (const k of Object.keys(obj(m) || {})) {
    const v = m[k];
    if (Object.keys(out).length >= QUEM_E_QUEM.alias) break;
    if (!k.trim() || k.length > QUEM_E_QUEM.id || typeof v !== "string" || !v.trim() || v.length > QUEM_E_QUEM.id || v === k) continue;
    out[k] = v;
  }
  /* o laço (A → B → A) não fica: quem o fecha cai */
  for (const k of Object.keys(out)) {
    const vistos = new Set([k]);
    let x = out[k];
    while (x && temChave(out, x)) {
      if (vistos.has(x)) { delete out[k]; break; }
      vistos.add(x);
      x = out[x];
    }
  }
  return out;
}
function fichaLimpa(f) {
  const o = obj(f);
  if (!o) return null;
  const nome = limpo(o.nome);
  if (!nome) return null;
  const out = { nome, origem: ORIGENS.includes(o.origem) ? o.origem : "registo" };
  for (const k of ["chave", "cidade", "local"]) { const v = limpo(o[k], QUEM_E_QUEM.id); if (v) out[k] = v; }
  return out;
}
export function garantirPessoas(x) {
  const o = obj(x);
  if (!o) return null;
  const alias = aliasLimpo(o.alias);
  const fichas = {};
  for (const id of Object.keys(obj(o.fichas) || {})) {
    if (Object.keys(fichas).length >= QUEM_E_QUEM.fichas) break;
    if (!id.trim() || id.length > QUEM_E_QUEM.id) continue;
    const f = fichaLimpa(o.fichas[id]);
    if (f) fichas[id] = f;
  }
  if (!Object.keys(alias).length && !Object.keys(fichas).length) return null;
  return { v: QUEM_E_QUEM.v, alias, fichas };
}

/* fundir(pessoas, idDeBaixo, idDeCima) → pessoas novas
   O de baixo passa a ser o de cima (a fusão que a régua não faz sozinha).
   O de cima é seguido até ao fim da cadeia; quem apontava para o de baixo
   passa a apontar para o fim; a fusão que fecharia um laço não acontece. */
export function fundir(pessoas, idDeBaixo, idDeCima) {
  const base = garantirPessoas(pessoas) || { v: QUEM_E_QUEM.v, alias: {}, fichas: {} };
  const baixo = typeof idDeBaixo === "string" ? idDeBaixo.trim() : "";
  let cima = typeof idDeCima === "string" ? idDeCima.trim() : "";
  if (!baixo || !cima) return garantirPessoas(base);
  const vistos = new Set();
  while (temChave(base.alias, cima) && !vistos.has(cima)) { vistos.add(cima); cima = base.alias[cima]; }
  if (cima === baixo) return garantirPessoas(base);
  const alias = {};
  for (const k of Object.keys(base.alias)) alias[k] = base.alias[k] === baixo ? cima : base.alias[k];
  alias[baixo] = cima;
  return garantirPessoas({ ...base, alias });
}

/* ---------------- O CATÁLOGO DO ELENCO ----------------
   catalogoDoElenco(ctx, pessoas) → { entradas, porId, porNome, alias,
     cidade, heroi, heroiNome }
   ctx: o elenco que o livro já recebe — { gente: [{ nome, cidade, id?,
     local?, papel? }], nucleo: [..] | { pessoas }, grupo: [nome | {
     nome }], npcs: { chave: ficha }, canone: [nome | { nome }], cidade,
     heroi }; `pessoas`: o campo do save (garantirPessoas).
   `entradas`: um por fonte, { fonte, nome, id, onde, ps, rank, para,
     cidade, local, oficio, status } — `para` é o id de quem ele é, quando
     é outro. `porId`: o dono de cada id (a primeira entrada sem `para`).
   `porNome`: o primeiro nome → os ids de quem o tem. `alias`: baixo → cima. */
export function catalogoDoElenco(ctx, pessoas) {
  const c = obj(ctx) || {};
  const cidade = limpo(c.cidade, QUEM_E_QUEM.id);
  const entradas = [];
  const por = (fonte, nome0, id, onde, extra = {}) => {
    const nome = limpo(nome0);
    const ps = palavrasDoNome(nome);
    if (!ps.length || !id || id.length > QUEM_E_QUEM.id) return;
    entradas.push({ fonte, nome, id, onde: typeof onde === "string" ? onde : "", ps, rank: RESOLVER_NOME.fontes.indexOf(fonte), para: null, ...extra });
  };
  const gente = arr(c.gente);
  const idsG = idsDaGente(gente, cidade);
  gente.forEach((g, i) => {
    const o = obj(g) || { nome: g };
    const cid = limpo(o.cidade, QUEM_E_QUEM.id) || cidade;
    por("gente", nomeDe(o), idsG[i], cid, { cidade: cid, local: limpo(o.local, QUEM_E_QUEM.id), oficio: limpo(o.papel || o.oficio, QUEM_E_QUEM.id) });
  });
  const nucleo = Array.isArray(c.nucleo) ? c.nucleo : arr(obj(c.nucleo) && c.nucleo.pessoas);
  for (const q of nucleo) {
    const onde = (obj(q) && q.cidade) || "";
    por("nucleo", nomeDe(q), idDe(q, "nucleo"), onde, { cidade: limpo(onde, QUEM_E_QUEM.id), oficio: limpo(obj(q) && (q.papel || q.oficio), QUEM_E_QUEM.id) });
  }
  for (const g of arr(c.grupo)) por("grupo", nomeDe(g), idDe(g, "grupo"), "", { noGrupo: true });
  const reg = obj(c.npcs) || {};
  for (const k of Object.keys(reg)) {
    const f = obj(reg[k]) || {};
    const chave = limpo(k);
    const onde = f.cidade || f.local || "";
    por("registo", typeof f.nome === "string" && f.nome.trim() ? f.nome : chave, chave ? idDe({ chave, id: f.id }, "registo") : "", onde,
      { chave: k, cidade: limpo(f.cidade, QUEM_E_QUEM.id), local: limpo(f.local, QUEM_E_QUEM.id), oficio: limpo(f.papel, QUEM_E_QUEM.id), status: limpo(f.status, QUEM_E_QUEM.id) });
  }
  for (const x of arr(c.canone)) {
    const onde = (obj(x) && (x.cidade || x.local)) || "";
    por("canone", nomeDe(x), idDe(x, "canone"), onde, { cidade: limpo(obj(x) && x.cidade, QUEM_E_QUEM.id), local: limpo(obj(x) && x.local, QUEM_E_QUEM.id) });
  }
  /* as fichas do save: quem a régua não refaz sozinha (o homônimo que o
     registo ganhou, por exemplo), na fonte que a ficha diz */
  const P = garantirPessoas(pessoas);
  if (P) {
    const ja = new Set(entradas.map((x) => x.id));
    for (const id of Object.keys(P.fichas)) {
      if (ja.has(id)) continue;
      const f = P.fichas[id];
      const fonte = RESOLVER_NOME.fontes.includes(f.origem) ? f.origem : "registo";
      por(fonte, f.nome, id, f.cidade || f.local || "", { chave: f.chave || "", cidade: f.cidade || "", local: f.local || "" });
    }
  }
  /* uma pessoa, um id: cada um procura-se nos de cima que já são eles mesmos */
  for (const x of entradas) {
    const cima = entradas.filter((h) => h.rank < x.rank && !h.para && h.id !== x.id && mesmaTerra(h.onde, x.onde));
    for (const nivel of RESOLVER_NOME.niveis) {
      const ids = [...new Set(cima.filter((h) => CASA_O_NOME[nivel](x.ps, h.ps)).map((h) => h.id))];
      if (ids.length === 1) { x.para = ids[0]; break; }
      if (ids.length > 1) break;
    }
  }
  /* a fusão guardada vale por cima da régua, quando o de cima existe */
  if (P) {
    const existe = new Set(entradas.filter((x) => !x.para).map((x) => x.id));
    const fim = (id) => { const vistos = new Set(); let y = id; while (temChave(P.alias, y) && !vistos.has(y)) { vistos.add(y); y = P.alias[y]; } return y; };
    for (const x of entradas) {
      if (!temChave(P.alias, x.id)) continue;
      const alvo = fim(x.id);
      if (alvo !== x.id && existe.has(alvo)) x.para = alvo;
    }
  }
  const porId = {};
  const alias = {};
  for (const x of entradas) {
    if (x.para) { if (x.para !== x.id && !temChave(alias, x.id)) alias[x.id] = x.para; continue; }
    if (!temChave(porId, x.id)) porId[x.id] = x;
  }
  /* o apelido cujo dono também apela segue até ao fim */
  for (const k of Object.keys(alias)) { const vistos = new Set([k]); let y = alias[k]; while (temChave(alias, y) && !vistos.has(y)) { vistos.add(y); y = alias[y]; } alias[k] = y; }
  const porNome = {};
  for (const id of Object.keys(porId)) { const p0 = porId[id].ps[0]; (porNome[p0] = porNome[p0] || []).push(id); }
  return { entradas, porId, porNome, alias, cidade, heroi: palavrasDoNome(c.heroi), heroiNome: limpo(nomeDe(c.heroi)) };
}

/* ---------------- A GENTE DA BASE, REFEITA PELA SEMENTE ----------------
   genteDaCidade(semente, cidade, { genero, molde, lex }) → a gente da
   cidade, na ordem da base: os locais (`locaisDaCidade`), e dentro de cada
   um a gente dele (`genteDoLocal`). É esta ordem que numera o homônimo. */
export function genteDaCidade(semente, cidade, opcoes) {
  const o = obj(opcoes) || {};
  if (typeof semente !== "string" || !semente || !obj(cidade) || !cidade.nome) return [];
  const genero = o.genero || undefined;
  const molde = o.molde || null;
  const lex = o.lex || null;
  return locaisDaCidade(semente, cidade, genero, molde, lex).flatMap((l) => genteDoLocal(semente, l, genero, molde, lex));
}

/* oCatalogo(estado, { mundo, gente, nucleo }) → o catálogo (o de
   catalogoDoElenco) com a presença dentro (`presenca`)
   `estado`: a forma do save (estado.js). `gente`: a gente da base, se quem
   chama já a tem; senão, com a semente do mundo (`mundo.semente`, ou a
   da campanha: o nome e o gênero), a da cidade onde o herói está. `nucleo`:
   o núcleo da campanha, se quem chama o tem (o estado não o leva). */
const RX_PESSOA_DO_CANONE = /pessoa/i;
function sementeDoEstado(E, m) {
  if (m && typeof m.semente === "string" && m.semente) return m.semente;
  const mundo = obj(E.mundo) || {};
  return `${(typeof E.nomeCampanha === "string" && E.nomeCampanha) || "aventura"}|${mundo.genero || ""}`;
}
export function oCatalogo(estado, opcoes) {
  const E = obj(estado) || {};
  const o = obj(opcoes) || {};
  const p = obj(E.personagem) || {};
  const cidade = typeof E.cidadeAtual === "string" ? E.cidadeAtual : "";
  let gente = Array.isArray(o.gente) ? o.gente : null;
  if (!gente) {
    const m = obj(o.mundo) || {};
    const mundo = obj(E.mundo) || {};
    const cid = arr(obj(E.mapa) && E.mapa.cidades).find((x) => obj(x) && x.nome === cidade);
    try {
      gente = cid ? genteDaCidade(sementeDoEstado(E, m), cid, { genero: m.genero || mundo.genero, molde: m.molde || mundo.molde, lex: m.lex || m.lexico || mundo.lexico }) : [];
    } catch { gente = []; }
  }
  const canone = Object.entries(obj(E.canone) || {})
    .filter(([, f]) => obj(f) && RX_PESSOA_DO_CANONE.test(String(f.tipo || "")))
    .map(([nome, f]) => ({ nome, cidade: f.cidade, local: f.local }));
  const cat = catalogoDoElenco({
    gente, nucleo: o.nucleo || [], grupo: arr(p.grupo).filter((g) => obj(g) && !g.invocada), npcs: obj(E.npcs) || {}, canone, cidade,
    heroi: typeof p.nome === "string" ? p.nome : "",
  }, E.pessoas);
  return { ...cat, presenca: presenca(E, cat) };
}

/* ---------------- A PRESENÇA ----------------
   presenca(estado, catalogo, { passo }) → { aqui, longe, grupo, doSitio,
     doPasso, mortos } — listas de ids do catálogo.
   · grupo: quem viaja com o herói (sempre aqui);
   · o registo pela régua da cena (`elencoDaCena`, cena.js) — a mesma do
     jogo: quem vive nesta cidade, ou não tem paradeiro, está aqui;
   · a gente da base, o núcleo e o cânone: aqui quando a «onde» deles
     nomeia a cidade do herói, e ele não está na estrada;
   · mortos: o estado sem volta da ficha (ESTADO_SEM_VOLTA, npcs.js) e o
     livro de fatos (caiu morto). O morto nunca está aqui;
   · doSitio: quem é do lugar onde o herói está (o `local` da ficha);
   · doPasso: os nomes ou ids que quem chama diz que o passo da quest pede. */
const fimDe = (cat, id) => { const a = obj(cat) && obj(cat.alias); return a && temChave(a, id) ? a[id] : id; };
export function presenca(estado, catalogo, opcoes) {
  const E = obj(estado) || {};
  const cat = obj(catalogo) || {};
  const porId = obj(cat.porId) || {};
  const entradas = arr(cat.entradas);
  const vazio = { aqui: [], longe: [], grupo: [], doSitio: [], doPasso: [], mortos: [] };
  if (!entradas.length) return vazio;
  const cidade = typeof E.cidadeAtual === "string" ? E.cidadeAtual : "";
  const naEstrada = !!E.jornada;
  const p = obj(E.personagem) || {};
  const grupoVivo = arr(p.grupo).filter((g) => obj(g) && g.nome && !g.invocada);
  const lugar = obj(E.lugar) ? limpo(E.lugar.nome, QUEM_E_QUEM.id) : limpo(E.lugar, QUEM_E_QUEM.id);
  const aqui = new Set(), mortos = new Set(), grupo = new Set(), doSitio = new Set();
  const factos = obj(obj(E.factos) && E.factos.pessoas) || {};
  for (const x of entradas) {
    const id = fimDe(cat, x.id);
    if (!temChave(porId, id)) continue;
    if (ESTADO_SEM_VOLTA.finais.includes(semAc(x.status))) mortos.add(id);
    const caiu = obj(obj(factos[x.id]) && factos[x.id].derrotado) || obj(obj(factos[id]) && factos[id].derrotado);
    if (caiu && caiu.como === "morto") mortos.add(id);
    if (x.fonte === "grupo") { grupo.add(id); aqui.add(id); continue; }
    if (x.fonte === "registo") {
      const npcs = obj(E.npcs) || {};
      const ficha = obj(npcs[x.chave]);
      if (ficha) {
        try {
          const cena = elencoDaCena({ [x.chave]: ficha }, cidade, E.mapa, { comGrupo: grupoVivo, masmorra: E.masmorra });
          if (arr(cena.aqui).length) aqui.add(id);
        } catch { /* a régua da cena nunca derruba o catálogo */ }
      }
    } else if (!naEstrada && naCidade(x.onde, cidade)) aqui.add(id);
    if (lugar && x.local && semAc(x.local) === semAc(lugar)) doSitio.add(id);
  }
  const doPasso = new Set();
  for (const d of arr(obj(opcoes) && opcoes.passo)) {
    const cs = candidatos(d, cat);
    if (cs.length === 1 && cs[0].id !== F.heroi) doPasso.add(cs[0].id);
  }
  for (const id of mortos) aqui.delete(id);
  const ordem = Object.keys(porId);
  const lista = (s) => ordem.filter((id) => s.has(id));
  return {
    aqui: lista(aqui),
    longe: ordem.filter((id) => !aqui.has(id) && !mortos.has(id)),
    grupo: lista(grupo),
    doSitio: lista(doSitio).filter((id) => !mortos.has(id)),
    doPasso: lista(doPasso),
    mortos: lista(mortos),
  };
}

/* ---------------- O RÓTULO ----------------
   rotuloDe(id, catalogo, cena) → texto
   O nome, e mais nada — a não ser que na `cena` (ids, ou a presença: vale
   o `aqui`) esteja outro de MESMO PRIMEIRO NOME. Aí, o que os distingue,
   pela ordem de QUEM_E_QUEM.rotulo: o ofício, o lugar, o nome inteiro.
   Nada distingue: o número do homônimo. Id fora do catálogo: "". */
export function rotuloDe(id, catalogo, cena) {
  const cat = obj(catalogo) || {};
  const porId = obj(cat.porId) || {};
  const alvo = typeof id === "string" ? fimDe(cat, id) : "";
  if (alvo === F.heroi) return cat.heroiNome || "";
  const eu = temChave(porId, alvo) ? porId[alvo] : null;
  if (!eu) return "";
  const ids = Array.isArray(cena) ? cena : arr(obj(cena) && cena.aqui);
  const outros = [...new Set(ids.filter((x) => typeof x === "string").map((x) => fimDe(cat, x)))]
    .filter((x) => x !== alvo && temChave(porId, x) && porId[x].ps[0] === eu.ps[0]).map((x) => porId[x]);
  if (!outros.length) return eu.nome;
  const DISTINGUE = {
    oficio: (p) => p.oficio || "",
    lugar: (p) => p.local || p.cidade || "",
    sobrenome: (p) => (p.ps.length > 1 ? p.nome : ""),
  };
  const DIZ = {
    oficio: (v) => `${eu.nome}, ${v}`,
    lugar: (v) => `${eu.nome}, de ${v}`,
    sobrenome: (v) => v,
  };
  for (const k of QUEM_E_QUEM.rotulo) {
    const meu = DISTINGUE[k](eu);
    if (meu && outros.every((o) => semAc(DISTINGUE[k](o)) !== semAc(meu))) return DIZ[k](meu);
  }
  const n = alvo.split(QUEM_E_QUEM.homonimo);
  return n.length > 1 ? `${eu.nome} (${n.pop()})` : eu.nome;
}

/* ---------------- OS CANDIDATOS ----------------
   candidatos(dito, catalogo, presenca) → [{ id, nome, estado, rotulo,
     porque, daCidade }]
   Todos os que o nome dito pode ser, no primeiro nível de RESOLVER_NOME
   que acha alguém — nunca um escolhido calado. `porque`: o nível (exato,
   prefixo), `id` (o dito já era um id) ou `heroi` (o nome é o do herói, e
   o herói não é gente da cena). `estado`: aqui, longe ou morto, pela
   presença (a do catálogo, se quem chama não der outra). `daCidade`: a
   «onde» dele nomeia a cidade do herói. `rotulo`: o que o distingue dos
   outros candidatos. Vazio: ninguém tem o nome.
   `opcoes.niveis` (etapa 2): os níveis a usar — os do nome dito (CASA_O_DITO)
   ou os do livro; sem eles, os do livro (RESOLVER_NOME.niveis). */
export function candidatos(dito, catalogo, presencaDada, opcoes) {
  const cat = obj(catalogo) || {};
  const porId = obj(cat.porId) || {};
  const nome = typeof dito === "string" ? dito.trim() : nomeDe(dito).trim();
  const ps = palavrasDoNome(nome);
  if (!ps.length) return [];
  if (nome.length <= QUEM_E_QUEM.id && RX_ID_PESSOA.test(nome)) {
    const id = fimDe(cat, nome);
    return [{ id: nome, nome: temChave(porId, id) ? porId[id].nome : limpo(nome.split("|").pop()), estado: null, rotulo: "", porque: "id", daCidade: false }];
  }
  const h = arr(cat.heroi);
  if (h.length && (casaExato(ps, h) || (ps.length === 1 && ps[0] === h[0]))) {
    return [{ id: F.heroi, nome: cat.heroiNome || "", estado: QUEM_E_QUEM.estados[0], rotulo: cat.heroiNome || "", porque: "heroi", daCidade: true }];
  }
  const pr = obj(presencaDada) || obj(cat.presenca);
  const aqui = new Set(arr(pr && pr.aqui)), mortos = new Set(arr(pr && pr.mortos));
  const [ESTA, LONGE, MORTO] = QUEM_E_QUEM.estados;
  const entradas = arr(cat.entradas);
  /* etapa 2: quem chama pode pedir outros níveis (os do nome DITO, CASA_O_DITO);
     sem pedir, os do livro — e o livro não muda */
  const niveis = arr(obj(opcoes) && opcoes.niveis).filter((n) => temChave(NIVEIS_DE_TODOS, n));
  for (const nivel of niveis.length ? niveis : RESOLVER_NOME.niveis) {
    const ids = [...new Set(entradas.filter((x) => NIVEIS_DE_TODOS[nivel](ps, x.ps)).map((x) => x.para || x.id))].filter((id) => temChave(porId, id));
    if (!ids.length) continue;
    return ids.map((id) => {
      const d = porId[id];
      const morto = mortos.has(id) || ESTADO_SEM_VOLTA.finais.includes(semAc(d.status));
      return {
        id, nome: d.nome,
        estado: morto ? MORTO : aqui.has(id) ? ESTA : LONGE,
        rotulo: rotuloDe(id, cat, ids),
        porque: nivel,
        /* a lista que já sabe dizê-lo (catalogoDasListas) o diz; senão, a «onde» nomeia a cidade */
        daCidade: d.daCidade === true || (!!cat.cidade && naCidade(d.onde, cat.cidade)),
      };
    });
  }
  return [];
}

/* ============================================================
   ETAPA 2 — A PRESENÇA POR ID E O NOME DITO (23/11/2026)

   Até aqui cada leitor de «quem a frase diz» tinha a sua régua por nome
   (quemONomeDiz, aCasaNaBase, mesmaPessoa, nomeProcurado, quemDaFrase), e
   dois fulanos de mesmo nome eram um só. Agora o nome dito vira CANDIDATOS
   uma vez (`candidatos`, com os níveis do nome dito), e uma régua só escolhe
   (`aReguaDoDito`). Os leitores de antes ficam com a assinatura deles e
   delegam aqui; quem já tem os ids (a presença do jogo) passa-os, e o
   homônimo deixa de se fundir no outro.

   Os níveis do nome DITO (CASA_O_DITO) não entram em RESOLVER_NOME — o livro
   continua com os dele, byte a byte:
     · `dito`: as palavras ditas (sem as partículas de QUEM_E_QUEM_DITO) estão
       todas no nome, e o primeiro nome é o mesmo — «Ulric» é Ulric
       Coração-de-Ferro, «Ulric Coração-de-Ferro» não é Ulric Olho-de-Corvo;
     · `primeiro`: o primeiro nome igual (a régua de `mesmaPessoa`).
   ============================================================ */
export const QUEM_E_QUEM_DITO = Object.freeze({
  /* as partículas que vivem dentro de um nome («Falk da Foz», «Merek o Exilado») */
  particulas: Object.freeze(["de", "do", "da", "dos", "das", "o", "a"]),
  /* o primeiro nome mais curto que isto não procura ninguém */
  primeiroMinimo: 3,
  /* os níveis que o nome dito usa, e a ordem da régua que o decide (a da planta) */
  niveis: Object.freeze(["dito"]),
  regua: Object.freeze(["inteiro", "presente", "cidade", "unico"]),
  /* o prefixo do id de quem só chega por nome numa lista (sem ficha) */
  daLista: "npc|",
});
const semParticulas = (ps) => ps.filter((w) => !QUEM_E_QUEM_DITO.particulas.includes(w));
export const CASA_O_DITO = Object.freeze({
  dito: (said, nome) => {
    const W = semParticulas(said), N = semParticulas(nome);
    return W.length > 0 && N.length > 0 && W[0] === N[0] && W[0].length >= QUEM_E_QUEM_DITO.primeiroMinimo && W.every((w) => N.includes(w));
  },
  primeiro: (said, nome) => said.length > 0 && nome.length > 0 && said[0] === nome[0] && said[0].length >= QUEM_E_QUEM_DITO.primeiroMinimo,
});
const NIVEIS_DE_TODOS = Object.freeze({ ...CASA_O_NOME, ...CASA_O_DITO });

/* o nome dito, palavra a palavra, sem partículas: é o que «inteiro» compara */
const ditas = (s) => semParticulas(palavrasDoNome(s));
const inteiroDe = (W) => (c) => { const N = ditas(c.nome); return N.length === W.length && N.every((w) => W.includes(w)); };

/* catalogoDasListas({ aqui, longe, conhecidos }) → um catálogo (a forma de
   catalogoDoElenco) feito das listas que um leitor já tem.
   Cada entrada é um nome ou { nome, id?, oficio?, onde?, morto?, daCidade?,
   local? }. QUEM TRAZ O ID É UMA PESSOA: dois «Tabitha» com dois ids são duas.
   Quem chega só pelo nome leva `npc|<as palavras do nome>` — e por isso o
   mesmo nome escrito duas vezes continua a ser um (o que as listas de antes
   já faziam). A presença vem das listas: o primeiro balde que diz o id
   manda (aqui, depois longe, depois conhecidos). */
export function catalogoDasListas(listas) {
  const L = obj(listas) || {};
  const entradas = [], porId = {}, porNome = {}, origem = {};
  const aqui = [], mortos = [], longe = [];
  const por = (x, balde) => {
    const o = obj(x) || { nome: typeof x === "string" ? x : "" };
    const nome = limpo(nomeDe(o));
    const ps = palavrasDoNome(nome);
    if (!ps.length) return;
    const id = typeof o.id === "string" && o.id.trim() ? o.id.trim().slice(0, QUEM_E_QUEM.id) : `${QUEM_E_QUEM_DITO.daLista}${ps.join(" ")}`.slice(0, QUEM_E_QUEM.id);
    if (temChave(porId, id)) return;
    const e = {
      fonte: balde, nome, id, onde: typeof o.onde === "string" ? o.onde : "", ps, rank: 0, para: null,
      oficio: limpo(o.oficio || o.papel || o.rotulo, QUEM_E_QUEM.id), local: limpo(o.local, QUEM_E_QUEM.id), cidade: "",
      status: o.morto ? ESTADO_SEM_VOLTA.finais[0] || "" : "", daCidade: !!o.daCidade,
    };
    entradas.push(e);
    porId[id] = e;
    origem[id] = balde;
    (porNome[ps[0]] = porNome[ps[0]] || []).push(id);
    if (balde === "aqui") aqui.push(id);
    else if (o.morto) mortos.push(id);
    else longe.push(id);
  };
  for (const x of arr(L.aqui)) por(x, "aqui");
  for (const x of arr(L.longe)) por(x, "longe");
  for (const x of arr(L.conhecidos)) por(x, "conhecido");
  return { entradas, porId, porNome, alias: {}, cidade: "", heroi: [], heroiNome: "", origem, presenca: { aqui, longe, grupo: [], doSitio: [], doPasso: [], mortos } };
}

/* aReguaDoDito(cands, dito) → { estado: "aqui"|"qual"|"longe"|"ninguem",
     um: candidato | null, opcoes: [candidato], morto? }
   A régua da planta (QUEM_E_QUEM_DITO.regua), sobre os candidatos de um nome:
     1. o nome INTEIRO — quando o dito vai além do primeiro nome, quem tem
        exatamente as palavras ditas ganha dos outros;
     2. quem está PRESENTE ganha de quem não está; dois presentes que o dito
        não separa (nem pelo nome inteiro) não se escolhem: «qual»;
     3. entre os de fora, quem é DA CIDADE do herói;
     4. o ÚNICO; senão, o de nome inteiro; senão, os de fora em aberto. */
export function aReguaDoDito(cands, dito) {
  const nada = { estado: "ninguem", um: null, opcoes: [] };
  let C = arr(cands).filter((c) => obj(c) && c.id);
  if (!C.length) return nada;
  const W = ditas(typeof dito === "string" ? dito : nomeDe(dito));
  const inteiro = inteiroDe(W);
  const [ESTA, , MORTO] = QUEM_E_QUEM.estados;
  if (W.length > 1) { const I = C.filter(inteiro); if (I.length) C = I; }
  const aqui = C.filter((c) => c.estado === ESTA);
  if (aqui.length === 1) return { estado: "aqui", um: aqui[0], opcoes: [] };
  if (aqui.length > 1) {
    const I = aqui.filter(inteiro);
    if (I.length === 1) return { estado: "aqui", um: I[0], opcoes: [] };
    return { estado: "qual", um: null, opcoes: aqui };
  }
  let fora = C;
  if (fora.length > 1) { const D = fora.filter((c) => c.daCidade); if (D.length) fora = D; }
  if (fora.length === 1) return { estado: "longe", um: fora[0], opcoes: [] };
  const I = fora.filter(inteiro);
  if (I.length === 1) return { estado: "longe", um: I[0], opcoes: [] };
  return { estado: "longe", um: null, opcoes: fora, morto: fora.every((c) => c.estado === MORTO) };
}

/* oNomeDitoDiz(dito, catalogo, presenca) → a régua sobre os candidatos do
   nome dito (os níveis de QUEM_E_QUEM_DITO), com `cands` junto. Quem só
   chega pelos conhecidos (catalogoDasListas) entra quando ninguém das
   listas de presença responde — a ordem de antes. */
export function oNomeDitoDiz(dito, catalogo, presencaDada) {
  const cat = obj(catalogo) || {};
  const cs = candidatos(dito, cat, presencaDada, { niveis: QUEM_E_QUEM_DITO.niveis });
  const org = obj(cat.origem) || {};
  const deLista = cs.filter((c) => org[c.id] !== "conhecido");
  return { ...aReguaDoDito(deLista.length ? deLista : cs, dito), cands: cs };
}

/* idNaPresenca(nome, catalogo, { prefere, usados }) → id | ""
   O id de quem uma lista do jogo diz pelo nome: os candidatos do livro
   (exato, depois prefixo); um só, é ele; vários (o homônimo), o primeiro de
   `prefere` (os ids presentes) que `usados` ainda não deu, depois o primeiro
   livre — dois «Tabitha» numa lista dão os dois ids, pela ordem do catálogo,
   que é a da semente. Ninguém: o id de quem só tem nome (`npc|<nome>`). */
export function idNaPresenca(nome, catalogo, opcoes) {
  const o = obj(opcoes) || {};
  const n = limpo(nomeDe(nome));
  if (!n) return "";
  const cs = candidatos(n, catalogo).filter((c) => c.porque !== "heroi");
  const usados = o.usados instanceof Set ? o.usados : new Set();
  const prefere = new Set(arr(o.prefere));
  let id = "";
  if (cs.length === 1) id = cs[0].id;
  else if (cs.length > 1) {
    const livres = cs.filter((c) => !usados.has(c.id));
    id = (livres.find((c) => prefere.has(c.id)) || livres[0] || cs[0]).id;
  } else id = idDe(n, "batizado");
  usados.add(id);
  return id;
}
