/* ============================================================
   A SECUNDÁRIA PLANEADA (Fase SQ · SQ3, 05/11/2026) — src/secundaria-planeada.js

   A pessoa, a 05/11: "as quests secundárias também devem ser planejadas
   assim como uma quest de história, claro que com sua devida proporção,
   então teremos menos quests secundárias mas bem elaboradas, e isso vai
   resolver o problema de toda hora aparecer alguém oferecendo trabalho".

   Até aqui a noite sorteava um gancho solto (`gerarQuestDeArco`,
   geradores.js): uma pessoa inventada na hora, um "boato de taverna", e
   uma etapa — encontrá-la. Era "alguém oferece um trabalho", e o censo de
   SQ1 contou 1,65 por cada três dias só vindos da noite.

   A SECUNDÁRIA PLANEADA é a espinha em ponto pequeno, e é feita só do que
   a casa já tem (o desenho está em `mente/sq3-secundaria.md`):
     · O FIO — de onde nasce, e é sempre do mundo: um laço entre duas
       pessoas do ELENCO (elenco.js), uma casa notável, o segredo de um
       sítio (mundo-base.js), uma cidade onde mora gente do elenco, uma
       facção do mapa, o arco regional que já corre. Sem fio, não nasce:
       nada sai da imaginação.
     · O GANCHO — quem pede (uma pessoa do elenco, no sítio dela), porquê
       agora, o que o herói ganha em ver. É a `descricao`.
     · DOIS OU TRÊS ATOS — cada um uma etapa que o conferente de
       missoes.js já segue: `falar_com` (a pessoa no sítio onde trabalha),
       `revelar` (o sítio, com a chave da base), `ir_a` (a cidade).
     · A REVIRAVOLTA — a `virada` da missão (tramas.js): emboscada,
       encontro ou revelação, executada pelo CÓDIGO depois de um ato.
     · O CUSTO DE FALHAR — o prazo em noites (`PRAZOS`), e a frase do que
       se perde, no fim do gancho.
     · O FECHO QUE MUDA O MUNDO — um laço (`firmarLaco`), um lugar
       (`revelar` na base) ou uma porta (a vizinhança do destino abre-se
       no mapa, `descobrirVizinhanca`). Deriva-se do molde e das etapas.

   NENHUM CAMPO NOVO NO SAVE. É uma missão como as outras (`criarMissao`),
   com `veiculo` próprio e o molde no `id` (`sq_<molde>_<marca>`): o resto
   lê-se de volta com `lerSecundaria`. Uma versão antiga vê um favor.

   MENOS E MELHORES (`TETO_DAS_SECUNDARIAS`): duas vivas, três dias entre o
   nascimento de uma e o da seguinte, e por cima de tudo o portão de SQ2.

     planearSecundaria(mundo, estado, semente) → missão | null
       mundo:  a forma de `mundoDasTarefas()` (App) — { semente, mapa,
               cidadeAtual, genero, molde, lex, nivel, dia }
       estado: { missoes, eventos, espinha, base, npcs, guildas, elenco,
               dia, nivel } — tudo opcional; `elenco` (o campo do save)
               também se aceita como `estado`, a forma de `contextoDoElenco()`
     podeNascerSecundaria(estado) → { pode, porque }
     lerSecundaria(missao) → { molde, gancho, atos, reviravolta, custo, fecho } | null

   Determinística pela semente; nunca estoura (lixo e `null` dão `null`).
   ============================================================ */
import { criarMissao, textoDaEtapa } from "./missoes.js";
import { elencoDoMundo } from "./elenco.js";
import { locaisDaCidade, genteDoLocal, idDoLocal, segredosDaCidade } from "./mundo-base.js";
import { rngDe } from "./geografia.js";
import { VEICULO_DA_TAREFA_ANTIGA } from "./tarefas-antigas.js";
import { secundariasAbertas } from "./portao-das-secundarias.js";

/* ---------------- AS TABELAS ---------------- */

/* Menos e melhores. `vivas`: quantas ao mesmo tempo (o mesmo teto que a
   noite já tinha, `secundariasMax`). `intervalo`: dias entre o nascimento
   de uma e o da seguinte — o tempo de jogar uma de dois ou três atos, e
   menos que o prazo mais curto (4 noites), para nunca empilhar. */
export const TETO_DAS_SECUNDARIAS = Object.freeze({
  vivas: 2,
  intervalo: 3,
  /* quem pede não é da principal: a gente da espinha e os chefes ficam
     para a história, o mestre de guilda para a casa dele */
  fontesDeFora: Object.freeze(["espinha", "chefe", "mestre"]),
  /* o veículo que marca a missão (o campo `veiculo`, que já existe) */
  veiculo: "secundaria_planeada",
  /* o comprimento que o diário aceita (garantirMissoes) */
  onde: 60, descricao: 240,
});

/* Os moldes: a pequena história, com os atos e a reviravolta.
   `fio`: de onde nasce — "laco" (com `laco`, o tipo do elenco), "casa",
     "segredo", "estrada", "faccao", "arco".
   `atos`: os papéis do fio, pela ordem — "falar:A" (encontrar A no sítio
     dele), "revelar:B" (o sítio onde B trabalha), "revelar:sitio" (o sítio
     que o fio aponta), "ir:B" (a cidade de B; com "?", só quando B não
     mora na cidade de A).
   `reviravolta`: a virada (tramas.js), `apos` o ato de índice N (0 é
     depois do primeiro); `papel` é quem aparece, no encontro.
   `prazo`: as noites do custo (PRAZOS de missoes.js: 4, 6 ou 8).
   `fecho`: o que muda no mundo — "laco" (com quem pede), "lugar" (o
     sítio revelado), "porta" (a cidade aonde se foi).
   O texto é de mundo e curto: nunca nomeia o mecanismo. */
export const MOLDES_DA_SECUNDARIA = Object.freeze([
  {
    id: "a_divida", fio: "laco", laco: "divida",
    atos: ["falar:A", "falar:B"],
    reviravolta: { tipo: "revelacao", apos: 0 },
    prazo: 6, fecho: { tipo: "laco", laco: "divida" },
    titulo: (f) => `A dívida de ${f.B.curto}`,
    gancho: (f) => `${f.A.nome} quer que alguém de fora fale com ${f.B.nome} antes que o que um deve ao outro acabe em sangue. Quem resolver fica com um favor de ${f.A.curto}.`,
    custo: (f) => `Se as noites passarem, ${f.B.curto} some de ${f.B.cidade}.`,
  },
  {
    id: "a_rivalidade", fio: "laco", laco: "rivalidade",
    atos: ["falar:A", "revelar:B", "falar:B"],
    reviravolta: { tipo: "encontro", apos: 1, papel: (f) => `gente de ${f.B.curto}, que viu alguém rondar o sítio` },
    prazo: 6, fecho: { tipo: "laco", laco: "amizade" },
    titulo: (f) => `O ofício de ${f.A.curto}`,
    gancho: (f) => `${f.A.nome} jura que ${f.B.nome} lhe estraga o ofício às escondidas, e paga a quem trouxer a verdade de ${f.B.local}.`,
    custo: (f) => `Se tardar, a rixa entre os dois sai à rua.`,
  },
  {
    id: "o_aprendiz", fio: "laco", laco: "aprendizado",
    atos: ["falar:A", "falar:B"],
    reviravolta: { tipo: "encontro", apos: 0, papel: (f) => `quem anda a encher os ouvidos de ${f.B.curto}` },
    prazo: 8, fecho: { tipo: "laco", laco: "aprendizado" },
    titulo: (f) => `O que ${f.A.curto} ensinou`,
    gancho: (f) => `${f.A.nome} ensinou tudo o que sabe a ${f.B.nome}, e agora ${f.B.curto} não lhe responde. ${f.A.curto} ensina ao herói o que nunca ensinou a ninguém, se o trouxer à razão.`,
    custo: (f) => `Se as noites passarem, ${f.B.curto} escolhe outro mestre.`,
  },
  {
    id: "o_recado", fio: "laco", laco: "amor",
    atos: ["falar:A", "ir:B?", "falar:B"],
    reviravolta: { tipo: "encontro", apos: 0, papel: (f) => `alguém próximo de ${f.A.curto} que não quer o recado entregue` },
    prazo: 6, fecho: { tipo: "laco", laco: "amizade" },
    titulo: (f) => `Uma palavra para ${f.B.curto}`,
    gancho: (f) => `${f.A.nome} tem uma palavra para ${f.B.nome} que não pode passar por mais ninguém. Quem a levar ganha a confiança de ${f.A.curto}.`,
    custo: (f) => `Se tardar, a palavra chega tarde demais.`,
  },
  {
    id: "o_que_a_casa_cala", fio: "casa",
    atos: ["falar:A", "revelar:B", "falar:B"],
    reviravolta: { tipo: "revelacao", apos: 1 },
    prazo: 8, fecho: { tipo: "laco", laco: "amizade" },
    titulo: (f) => `O que a ${f.casa} cala`,
    gancho: (f) => `${f.A.nome}, da ${f.casa}, desconfia do que ${f.B.nome} esconde em ${f.B.local}, e não pode perguntar sem partir a família. A casa não esquece quem a poupa.`,
    custo: (f) => `Se as noites passarem, o segredo sai sozinho, e pior.`,
  },
  {
    id: "o_sitio_que_esconde", fio: "segredo",
    atos: ["falar:A", "revelar:sitio"],
    reviravolta: { tipo: "emboscada", apos: 0, quantos: 2 },
    prazo: 4, fecho: { tipo: "lugar" },
    titulo: (f) => `O que ${f.sitio.nome} esconde`,
    gancho: (f) => `${f.A.nome} sabe que em ${f.sitio.nome} há ${f.sitio.o}, e não tem coragem de ir lá. Conta a quem for o que mais sabe.`,
    custo: (f) => `Se tardar, alguém chega primeiro.`,
  },
  {
    id: "a_estrada_para", fio: "estrada",
    atos: ["falar:A", "ir:B", "falar:B"],
    reviravolta: { tipo: "emboscada", apos: 1, quantos: 2 },
    prazo: 8, fecho: { tipo: "porta" },
    titulo: (f) => `A estrada para ${f.B.cidade}`,
    gancho: (f) => `${f.A.nome} precisa de notícias de ${f.B.nome}, em ${f.B.cidade}, e ninguém daqui faz a estrada. Quem a fizer fica a conhecer o que há para lá dela.`,
    custo: (f) => `Se as noites passarem, as notícias já não servem.`,
  },
  {
    id: "o_recado_da_faccao", fio: "faccao",
    atos: ["falar:A", "revelar:sitio"],
    reviravolta: { tipo: "revelacao", apos: 0 },
    prazo: 6, fecho: { tipo: "laco", laco: "divida" },
    titulo: (f) => `O recado de ${f.faccao}`,
    gancho: (f) => `${f.A.nome} fala por ${f.faccao} e quer saber, sem que se saiba, o que se passa em ${f.sitio.nome}. Quem servir com discrição fica com ${f.A.curto} a dever-lhe.`,
    custo: (f) => `Se tardar, ${f.faccao} manda outro, e lembra-se.`,
  },
  {
    id: "o_eco_do_arco", fio: "arco",
    atos: ["falar:A", "revelar:sitio"],
    reviravolta: { tipo: "encontro", apos: 0, papel: (f) => `alguém que já escolheu lado em ${f.arco}` },
    prazo: 6, fecho: { tipo: "lugar" },
    titulo: (f) => `${f.arco} em ${f.A.cidade}`,
    gancho: (f) => `${f.arco} chegou a ${f.A.cidade}: ${f.A.nome} viu o que se guarda em ${f.sitio.nome} e não sabe a quem contar. Quem souber primeiro sabe para onde vai a região.`,
    custo: (f) => `Se as noites passarem, já não há nada para ver.`,
  },
]);

/* ---------------- AS AJUDAS ---------------- */
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const lista = (x) => (Array.isArray(x) ? x : []);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const T = TETO_DAS_SECUNDARIAS;
const corta = (s, n) => (String(s).length <= n ? String(s) : `${String(s).slice(0, n - 1).trimEnd()}…`);

function marca(s) {
  let h = 5381;
  for (const ch of String(s)) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0;
  return h.toString(36);
}
const moldeDoId = (id) => MOLDES_DA_SECUNDARIA.find((m) => String(id || "").startsWith(`sq_${m.id}_`)) || null;
const ehPlaneada = (m) => !!(m && m.veiculo === T.veiculo && moldeDoId(m.id));
const curto = (nome) => (String(nome).length <= 18 ? String(nome) : String(nome).split(/\s+/)[0]);

/* ---------------- O PORTÃO, O TETO E O INTERVALO ----------------
   `estado`: { abertura, espinha, nivel } para o portão de SQ2 — ou
   `portaoAberto` (booleano), quando quem chama já o tem (a noite recebe-o
   do App); `missoes` e `dia` para o teto e o intervalo — ou `vivas`,
   quando quem chama só tem a conta. Conta-se como viva toda secundária
   em curso: a planeada e o fio antigo que ainda ande no diário. */
const vivaSecundaria = (m) => !!(m && m.status === "ativa" && m.intencao !== "principal"
  && (m.veiculo === T.veiculo || m.veiculo === VEICULO_DA_TAREFA_ANTIGA));

export function podeNascerSecundaria(estado) {
  const e = obj(estado);
  let aberto;
  if (typeof e.portaoAberto === "boolean") aberto = e.portaoAberto;
  else { try { aberto = secundariasAbertas(e).abertas; } catch { aberto = false; } }
  if (!aberto) return { pode: false, porque: "portao" };
  const ms = lista(e.missoes);
  const contadas = ms.filter(vivaSecundaria).length;
  const vivas = Math.max(contadas, Math.max(0, Math.floor(Number(e.vivas) || 0)));
  if (vivas >= T.vivas) return { pode: false, porque: "teto" };
  const dia = Number(e.dia);
  const nascidas = ms.filter(ehPlaneada).map((m) => Number(m.criadaEm)).filter(Number.isFinite);
  if (nascidas.length && Number.isFinite(dia) && dia - Math.max(...nascidas) < T.intervalo) return { pode: false, porque: "intervalo" };
  return { pode: true, porque: "pode" };
}

/* ---------------- O FIO ----------------
   Tudo o que se escolhe sai daqui: o elenco do mundo, os sítios e os
   segredos da base, as cidades do mapa, o arco que já corre. */
function oMundo(mundo, estado) {
  const m = obj(mundo), e = obj(estado);
  const semente = String(m.semente == null ? "" : m.semente);
  const mapa = obj(m.mapa);
  const cidades = lista(mapa.cidades).filter((c) => c && c.nome);
  if (!cidades.length) return null;
  const dia = Number.isFinite(Number(e.dia)) ? Number(e.dia) : Number(m.dia) || 0;
  let elenco = { pessoas: [], lacos: [], casas: [] };
  try {
    elenco = elencoDoMundo(semente, mapa, { genero: m.genero, molde: m.molde, lex: m.lex, espinha: e.espinha, guildas: e.guildas, base: e.base, estado: e.elenco || e.estado, npcs: e.npcs });
  } catch { /* sem elenco, sem fio de gente */ }
  const locais = new Map();
  const locaisDe = (nome) => {
    if (!locais.has(nome)) {
      const c = cidades.find((x) => x.nome === nome);
      let ls = [];
      try { ls = c ? locaisDaCidade(semente, c, m.genero, m.molde, m.lex) || [] : []; } catch { ls = []; }
      locais.set(nome, ls);
    }
    return locais.get(nome);
  };
  /* a gente de uma cidade, pela base (os membros de uma casa vivem aqui:
     o elenco guarda-lhes só o nome) */
  const gente = new Map();
  const genteDe = (nome) => {
    if (!gente.has(nome)) {
      let ps = [];
      try { ps = locaisDe(nome).flatMap((l) => genteDoLocal(semente, l, m.genero, m.molde, m.lex).map((p) => ({ nome: p.nome, cidade: nome, casaDeTrabalho: l.nome }))); } catch { ps = []; }
      gente.set(nome, ps);
    }
    return gente.get(nome);
  };
  /* quem já está numa secundária viva não pede outra; e o molde vivo não se repete */
  const vivas = lista(e.missoes).filter((x) => ehPlaneada(x) && x.status === "ativa");
  const ocupados = new Set(vivas.flatMap((x) => [x.dador, ...lista(x.etapas).map((s) => s && s.alvo)]).map(norm).filter(Boolean));
  const moldesVivos = new Set(vivas.map((x) => moldeDoId(x.id).id));
  const pessoas = lista(elenco.pessoas).filter((p) => p && p.nome && p.cidade && p.casaDeTrabalho && !p.morto
    && cidades.some((c) => c.nome === p.cidade));
  const pessoa = (p) => ({ nome: p.nome, curto: curto(p.nome), cidade: p.cidade, local: p.casaDeTrabalho, fonte: p.fonte, estreia: p.estreia });
  const podePedir = (p) => !T.fontesDeFora.includes(p.fonte) && !ocupados.has(norm(p.nome))
    && !(Number.isFinite(Number(p.estreia)) && Number(p.estreia) > dia);
  const aqui = cidades.find((c) => norm(c.nome) === norm(m.cidadeAtual)) || null;
  return {
    semente, mapa, cidades, dia, elenco, aqui, moldesVivos, locaisDe, ocupados,
    /* da história principal: não pede nem é procurado numa secundária */
    daHistoria: new Set(lista(elenco.pessoas).filter((p) => p && T.fontesDeFora.slice(0, 2).includes(p.fonte)).map((p) => norm(p.nome))),
    daCasa: (k) => {
      const ps = genteDe(String(obj(k).cidade || ""));
      return lista(obj(k).membros).map((n) => ps.find((p) => norm(p.nome) === norm(n))).filter((p) => p && !p.morto).map(pessoa);
    },
    nivel: Math.max(1, Math.round(Number(e.nivel) || Number(m.nivel) || 1)),
    pedintes: pessoas.filter(podePedir).map(pessoa),
    todos: pessoas.filter((p) => !ocupados.has(norm(p.nome)) && !T.fontesDeFora.slice(0, 2).includes(p.fonte)).map(pessoa),
    faccoes: lista(mapa.faccoes).filter((f) => f && f.nome && !f.doJogador).map((f) => String(f.nome)),
    arco: obj(obj(e.eventos).global).nome ? String(e.eventos.global.nome) : "",
    segredos: (nome) => {
      const c = cidades.find((x) => x.nome === nome);
      try { return c ? segredosDaCidade(semente, c, m.genero, m.molde, m.lex) || [] : []; } catch { return []; }
    },
    genero: m.genero,
  };
}

/* um sítio de uma cidade, pelo nome, com a chave que a base grava */
function sitioDe(W, cidade, nome) {
  const l = W.locaisDe(cidade).find((x) => x && norm(x.nome) === norm(nome));
  return l ? { nome: l.nome, cidade, chave: idDoLocal(cidade, l) } : null;
}

/* Os fios possíveis de um molde neste mundo. Cada um é { A, B?, sitio?,
   casa?, faccao?, arco? }, e A é sempre quem pede. */
function fiosDo(molde, W, rnd) {
  const porNome = new Map(W.todos.map((p) => [norm(p.nome), p]));
  const pedinte = new Map(W.pedintes.map((p) => [norm(p.nome), p]));
  const out = [];
  if (molde.fio === "laco") {
    for (const l of lista(W.elenco.lacos)) {
      if (!l || l.tipo !== molde.laco) continue;
      const pares = l.simetrico ? [[l.a, l.b], [l.b, l.a]] : [[l.a, l.b]];
      for (const [a, b] of pares) {
        const A = pedinte.get(norm(a)), B = porNome.get(norm(b));
        if (A && B && norm(A.nome) !== norm(B.nome) && sitioDe(W, B.cidade, B.local)) out.push({ A, B });
      }
    }
  } else if (molde.fio === "casa") {
    const livre = (p) => !W.ocupados.has(norm(p.nome)) && !W.daHistoria.has(norm(p.nome));
    for (const k of lista(W.elenco.casas)) {
      const membros = W.daCasa(k);
      const B = membros[0];
      if (!B || norm(B.nome) !== norm(lista(k.membros)[0]) || !livre(B) || !sitioDe(W, B.cidade, B.local)) continue;
      for (const A of membros.slice(1)) if (livre(A)) out.push({ A, B, casa: String(k.nome) });
    }
  } else if (molde.fio === "segredo") {
    for (const A of W.pedintes) {
      for (const s of W.segredos(A.cidade)) {
        const sitio = s && norm(s.local) !== norm(A.local) ? sitioDe(W, A.cidade, s.local) : null;
        if (sitio) out.push({ A, sitio: { ...sitio, o: s.o } });
      }
    }
  } else if (molde.fio === "estrada") {
    for (const A of W.pedintes) {
      for (const B of W.todos) if (B.cidade !== A.cidade) out.push({ A, B });
    }
  } else if (molde.fio === "faccao" || molde.fio === "arco") {
    const nomes = molde.fio === "faccao" ? W.faccoes : W.arco ? [W.arco] : [];
    for (const nome of nomes) {
      for (const A of W.pedintes) {
        const outros = W.locaisDe(A.cidade).filter((l) => l && norm(l.nome) !== norm(A.local));
        if (!outros.length) continue;
        const l = outros[Math.floor(rnd() * outros.length)];
        out.push({ A, sitio: { nome: l.nome, cidade: A.cidade, chave: idDoLocal(A.cidade, l) }, [molde.fio]: nome });
      }
    }
  }
  return out;
}

/* ---------------- OS ATOS ---------------- */
const ondeDe = (p) => { const s = `${p.local}, em ${p.cidade}`; return s.length <= T.onde ? s : corta(p.local, T.onde); };
function etapasDo(molde, f, W) {
  const out = [];
  for (const ato of molde.atos) {
    const [verbo, papel0] = ato.split(":");
    const opcional = papel0.endsWith("?");
    const papel = papel0.replace("?", "");
    if (verbo === "falar") out.push({ tipo: "falar_com", alvo: f[papel].nome, onde: ondeDe(f[papel]) });
    else if (verbo === "ir") {
      if (opcional && f[papel].cidade === f.A.cidade) continue;
      out.push({ tipo: "ir_a", alvo: f[papel].cidade });
    } else if (verbo === "revelar") {
      const s = papel === "sitio" ? f.sitio : sitioDe(W, f[papel].cidade, f[papel].local);
      out.push({ tipo: "revelar", alvo: s.nome, onde: s.nome, chave: s.chave });
    }
  }
  return out;
}

/* ---------------- PLANEAR ---------------- */
export function planearSecundaria(mundo, estado, semente) {
  let W = null;
  try { W = oMundo(mundo, estado); } catch { W = null; }
  if (!W) return null;
  const rnd = rngDe(`${W.semente}|secundaria|${String(semente == null ? "" : semente)}`);
  /* a ordem dos moldes é da semente; o molde que já corre fica de fora */
  const moldes = MOLDES_DA_SECUNDARIA.filter((m) => !W.moldesVivos.has(m.id));
  for (let i = moldes.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [moldes[i], moldes[j]] = [moldes[j], moldes[i]]; }
  for (const molde of moldes) {
    let fios = [];
    try { fios = fiosDo(molde, W, rnd); } catch { fios = []; }
    if (!fios.length) continue;
    /* porquê agora: quem pede está na cidade do herói, quando há quem */
    const daqui = W.aqui ? fios.filter((f) => f.A.cidade === W.aqui.nome) : [];
    const pool = daqui.length ? daqui : fios;
    const f = pool[Math.floor(rnd() * pool.length)];
    let etapas;
    try { etapas = etapasDo(molde, f, W); } catch { continue; }
    if (etapas.length < 2) continue;
    const r = molde.reviravolta;
    const apos = Math.min(r.apos, etapas.length - 2);
    const virada = {
      tipo: r.tipo, apos, onde: etapas[apos].onde || etapas[apos].alvo,
      papel: typeof r.papel === "function" ? corta(r.papel(f), 60) : "",
      quantos: r.quantos || 1, ameaca: "comum",
    };
    const id = `sq_${molde.id}_${marca(`${W.semente}|${f.A.nome}|${etapas.map((e) => e.alvo).join("|")}|${W.dia}`)}`;
    const descricao = corta(`${molde.gancho(f)} ${molde.custo(f)}`, T.descricao);
    try {
      const m = criarMissao({
        id, titulo: corta(molde.titulo(f), 70), tipo: "favor", status: "ativa",
        descricao, dador: corta(f.A.nome, 40), etapas, nivel: W.nivel, dia: W.dia,
        prazo: molde.prazo, intencao: "secundaria", veiculo: T.veiculo, virada,
      });
      if (m) return m;
    } catch { /* um molde torto não derruba a noite: tenta-se o seguinte */ }
  }
  return null;
}

/* ---------------- LER DE VOLTA ----------------
   A missão gravada diz tudo o que foi planeado, sem campo novo: o molde
   pelo id, o gancho pela descrição, os atos pelas etapas, a reviravolta
   pela virada, o custo pelo prazo — e o fecho, que o App aplica quando
   ela fecha (mente/sq3-fiacao.md). `null` para o que não é planeado. */
export function lerSecundaria(missao) {
  const m = obj(missao);
  if (!ehPlaneada(m)) return null;
  const molde = moldeDoId(m.id);
  const etapas = lista(m.etapas);
  let fecho = null;
  if (molde.fecho.tipo === "laco") fecho = m.dador ? { tipo: "laco", laco: molde.fecho.laco, quem: m.dador } : null;
  else if (molde.fecho.tipo === "lugar") {
    const e = etapas.find((x) => x && x.tipo === "revelar");
    fecho = e ? { tipo: "lugar", nome: e.alvo, chave: e.chave || "" } : null;
  } else if (molde.fecho.tipo === "porta") {
    const e = etapas.find((x) => x && x.tipo === "ir_a");
    fecho = e ? { tipo: "porta", cidade: e.alvo } : null;
  }
  const v = obj(m.virada);
  return {
    molde: molde.id,
    gancho: String(m.descricao || ""),
    atos: etapas.map((e) => { let texto = ""; try { texto = textoDaEtapa(e); } catch { texto = ""; } return { texto, feito: !!(e && e.feito) }; }),
    reviravolta: v.tipo ? { tipo: v.tipo, apos: Number(v.apos) || 0, feita: !!v.feita } : null,
    custo: { noites: Math.max(0, Number(m.prazo) || 0) },
    fecho,
  };
}
