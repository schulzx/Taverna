/* ============================================================
   AS TAREFAS ANTIGAS (30/09, MM14 · os canais) — a lista que só
   fechava pelo título vira missões que se conferem

   Até aqui viviam DUAS listas de trabalho no save. As missões (`missoes`,
   missoes.js) têm etapas que o sistema confere — estar lá, estar com a
   pessoa, a coisa acontecer. A lista antiga (`quests`) é de antes disso:
   um título, uma descrição, um objetivo em prosa, e nada que se possa
   conferir. Quem a fechava eram dois canais que só leem o TÍTULO — o
   Narrador (`quest_atualizar`) e o Cronista (`missoes.concluidas`) —, e o
   próprio resumo que o Narrador recebe dizia "só o jogador as encerra".
   Era a última porta por onde a IA fechava trabalho por conta própria.

   Nessa lista viviam dois tipos de coisa, e ambos passam por aqui:
     · os FIOS DE HISTÓRIA que o descanso longo sorteia (`geradores.js`,
       `gerarQuestDeArco`) — o único que ainda nasce hoje;
     · os CONTRATOS do mural de antes da v9.27 (`{ contrato: { moedas, xp }
       }`), que só existem em saves antigos, e que pagavam por código ao
       fechar.

   AS TRÊS REGRAS:
     1) toda tarefa vira uma missão com etapas que o sistema confere, pela
        régua de sempre: estar no lugar, estar com a pessoa (`estaCom`);
        sem alvo concreto, ganha um alvo do mundo — um lugar desta cidade,
        um ermo dos arredores —, POR SEMENTE;
     2) o contrato paga no fecho EXATAMENTE o que pagava: as mesmas moedas,
        o mesmo XP, a mesma fé, o mesmo ponto de heroísmo, a mesma conta
        de `contratosConcluidos` (`pagaDoFecho` contra `pagaDaTarefaAntiga`);
     3) a migração ao carregar é determinística e idempotente, e não muda
        o formato de campo nenhum: a missão entra em `missoes` no formato
        que ele já tem, e a tarefa antiga fica com `status: "migrada"` — a
        mesma string de sempre, um valor que nenhuma tela nem canal lê como
        ativo. A concluída e a falhada ficam como estão.
   ============================================================ */
import { criarMissao, garantirMissoes, recompensaDe } from "./missoes.js";
import { locaisDaCidade, idDoLocal } from "./mundo-base.js";
import { arredoresDaCidade } from "./arredores.js";
import { rngDe } from "./geografia.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const obj = (x) => (x && typeof x === "object" ? x : {});

/* ---------------- AS TABELAS ---------------- */

/* A marca da tarefa que já passou para `missoes`. É um valor de `status`,
   o campo que a tarefa já tem: todo leitor da lista antiga procura
   "ativa", e nenhum a vê. */
export const MARCA_DA_MIGRACAO = "migrada";

/* De onde a missão veio — viaja em `veiculo`, que as missões já têm. É por
   ele que o fecho sabe pagar a fé e o heroísmo da lista antiga. */
export const VEICULO_DA_TAREFA_ANTIGA = "tarefa_antiga";

/* O QUE A LISTA ANTIGA PAGAVA AO FECHAR — lido de App.jsx (v9.336):
   · a fé, nos dois canais: `ganharFe(principal ? 150 : 40, 2, …)`, só
     depois do despertar;
   · o heroísmo, no Cronista: `ganharHeroismo(p, "missao")`, um ponto;
   · o contrato: `+contrato.moedas`, `+contrato.xp` e
     `bumpCont("contratosConcluidos")`. */
export const PAGA_DA_LISTA_ANTIGA = {
  feDaPrincipal: 150,
  feDasOutras: 40,
  pfDaFe: 2,
  heroismo: "missao",
};

/* Como a tarefa vira missão: que tipo, e o que o fio paga. O contrato paga
   o que dizia (regra 2); o fio da lista antiga não pagava moeda nem XP, e
   como missão paga o que um favor do seu tamanho paga — é trabalho feito,
   e o diário mostra a paga de toda missão. */
export const CONVERSAO = {
  tipoDaPrincipal: "trama",
  tipoDoContrato: "contrato",
  tipoDoFio: "favor",
  fioPagaComo: "nada", /* decisão do orquestrador (30/09): o fio paga o que pagava na lista antiga — só a fé e o heroísmo; mudar a economia não é desta etapa */
};

/* Os contratos do mural antigo (contratos.js, até à v9.36), pelo título que
   o gerador escrevia. Cada um diz a etapa que o faz fechar. */
export const CONTRATOS_ANTIGOS = [
  { id: "caca", rx: /^ca[cç]a:\s*(.+)$/i, etapa: "derrotar", quantos: 1 },
  { id: "limpeza", rx: /^limpeza\b/i, doTexto: /bando de\s+(.+?)\s+infestou/i, etapa: "derrotar", quantos: 3 },
  { id: "escolta", rx: /^escolta de\s+(.+)$/i, doTexto: /chegar a salvo a\s+(.+?)\./i, etapa: "ir_a" },
  { id: "entrega", rx: /^entrega para\s+(.+)$/i, etapa: "ir_a" },
  { id: "resgate", rx: /^resgate de\s+(.+)$/i, etapa: "resgatar" },
  { id: "coleta", rx: /^coleta\b/i, etapa: "revelar" },
];

/* ---------------- A IDENTIDADE ----------------
   O id da missão sai do título: a mesma tarefa dá sempre a mesma missão,
   e carregar duas vezes não a duplica. */
function hash(s) {
  let h = 5381;
  for (const ch of String(s)) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0;
  return h.toString(36);
}
export function idDaTarefa(q) {
  const t = obj(q);
  return `qa_${t.tipo === "principal" ? "p" : "s"}_${hash(norm(t.titulo))}`.slice(0, 40);
}

/* ---------------- O MUNDO ----------------
   `mundo`: { semente, mapa, cidadeAtual, genero, molde, lex, nivel, dia } */
const cidadeDoMapa = (mundo, nome) => ((obj(obj(mundo).mapa).cidades) || []).find((c) => c && norm(c.nome) === norm(nome)) || null;

/* As cidades conhecidas que o texto nomeia, pela ordem em que aparecem. */
function cidadesNoTexto(texto, mundo) {
  const t = norm(texto);
  return ((obj(obj(mundo).mapa).cidades) || [])
    .filter((c) => c && c.nome && norm(c.nome).length > 2 && t.includes(norm(c.nome)))
    .sort((a, b) => t.indexOf(norm(a.nome)) - t.indexOf(norm(b.nome)))
    .map((c) => c.nome);
}

/* A pessoa que o fio antigo nomeia — sem `quem` gravado, lê-se nas formas
   que os ganchos escreviam. Nome de cidade não é pessoa. */
const RX_PESSOA = [
  /^Encontrar\s+(.+?)\s+em\s/,
  /^Descobrir o que\s+(.+?)\s+realmente/,
  /cobran[cç]a de\s+(.+?)\s+[—-]/,
  /pedido de\s+(.+?)(?:\s+antes\b|$)/,
];
function pessoaNoTexto(q, mundo) {
  const t = obj(q);
  const cidades = new Set(((obj(obj(mundo).mapa).cidades) || []).map((c) => norm(c && c.nome)));
  for (const fonte of [t.objetivo, t.titulo]) {
    for (const rx of RX_PESSOA) {
      const m = String(fonte || "").match(rx);
      const n = m && m[1].trim();
      if (n && /^[A-ZÀ-Ý]/.test(n) && !cidades.has(norm(n)) && n.length <= 40) return n;
    }
  }
  return "";
}

/* Um lugar desta cidade, por semente: o alvo do fio que não tem alvo. */
function lugarDaCidade(mundo, cidade, chave) {
  const m = obj(mundo);
  const c = cidadeDoMapa(m, cidade);
  if (!c) return null;
  let locais = [];
  try { locais = locaisDaCidade(String(m.semente || ""), c, m.genero || "Fantasia medieval", m.molde || null, m.lex || null) || []; } catch { locais = []; }
  if (!locais.length) return null;
  const l = locais[Math.floor(rngDe(`${m.semente || ""}|tarefa|${chave}`)() * locais.length)];
  return { nome: l.nome, chave: idDoLocal(c.nome, l) };
}

/* Um ermo dos arredores, por semente: onde a presa do contrato aparece
   (a etapa `derrotar` com `onde` é a que o App faz acontecer). */
function ermoDaCidade(mundo, cidade, chave) {
  const m = obj(mundo);
  const c = cidadeDoMapa(m, cidade);
  if (!c) return "";
  let fora = [];
  try { fora = arredoresDaCidade(String(m.semente || ""), c) || []; } catch { fora = []; }
  if (!fora.length) return "";
  return fora[Math.floor(rngDe(`${m.semente || ""}|ermo|${chave}`)() * fora.length)].nome;
}

/* ---------------- AS ETAPAS ---------------- */

/* A última rede: uma missão que não achou alvo nenhum no mundo ainda tem de
   poder fechar. Chegar à cidade de onde veio; sem cidade, um dia de espera. */
function etapaDeRede(cidade) {
  return cidade ? [{ tipo: "ir_a", alvo: cidade }] : [{ tipo: "aguentar", dias: 1 }];
}

function etapasDoContrato(q, mundo, id) {
  const t = obj(q);
  const titulo = String(t.titulo || "").trim();
  const texto = `${titulo} ${t.descricao || ""}`;
  const cidades = cidadesNoTexto(texto, mundo);
  const aqui = obj(mundo).cidadeAtual || "";
  const base = cidades[cidades.length - 1] || aqui;
  const forma = CONTRATOS_ANTIGOS.find((f) => f.rx.test(titulo));
  if (forma) {
    const doTitulo = (titulo.match(forma.rx) || [])[1] || "";
    const doTexto = forma.doTexto ? ((String(t.descricao || "").match(forma.doTexto) || [])[1] || "") : "";
    if (forma.etapa === "derrotar") {
      const alvo = (doTexto || doTitulo).trim();
      if (alvo) return [{ tipo: "derrotar", alvo, quantos: forma.quantos, onde: ermoDaCidade(mundo, base, id) }];
    }
    if (forma.etapa === "ir_a") {
      const destino = [doTexto, doTitulo].map((x) => x.trim()).find((x) => x && cidadeDoMapa(mundo, x)) || cidades[cidades.length - 1] || "";
      if (destino) return [{ tipo: "ir_a", alvo: cidadeDoMapa(mundo, destino).nome }];
    }
    if (forma.etapa === "resgatar" && doTitulo.trim()) {
      return [{ tipo: "resgatar", alvo: doTitulo.trim(), onde: ermoDaCidade(mundo, base, id) }];
    }
  }
  const l = lugarDaCidade(mundo, base, id);
  if (l) return [{ tipo: "revelar", alvo: l.nome, onde: l.nome, chave: l.chave }];
  return etapaDeRede(base);
}

function etapasDoFio(q, mundo, id) {
  const t = obj(q);
  const texto = `${t.titulo || ""} ${t.objetivo || ""} ${t.descricao || ""}`;
  const gravadas = (Array.isArray(t.ondes) ? t.ondes : []).map((n) => cidadeDoMapa(mundo, n)).filter(Boolean).map((c) => c.nome);
  const cidades = gravadas.length ? gravadas : cidadesNoTexto(texto, mundo);
  const aqui = obj(mundo).cidadeAtual || "";
  const alvo = cidades[cidades.length - 1] || aqui;
  const via = cidades.length > 1 ? [{ tipo: "ir_a", alvo: cidades[0] }] : [];
  const quem = String(t.quem || "").trim() || pessoaNoTexto(t, mundo);
  const l = lugarDaCidade(mundo, alvo, id);
  /* A PESSOA TEM MORADA. Os ganchos sorteiam gente que não está na base, e
     "encontrá-la na cidade" fechava no primeiro turno em que o Narrador a
     nomeasse, com o herói em qualquer beco. Ela passa a estar num lugar
     desta cidade, por semente — como a pista da abertura (MM13) —, e
     encontrá-la é lá estar com ela. */
  if (quem && l) {
    const onde = `${l.nome}, em ${alvo}`;
    return [...via, { tipo: "falar_com", alvo: quem, onde: onde.length <= 60 ? onde : l.nome }];
  }
  if (quem && alvo) return [...via, { tipo: "falar_com", alvo: quem, onde: alvo }];
  if (l) return [...via, { tipo: "revelar", alvo: l.nome, onde: l.nome, chave: l.chave }];
  return [...via, ...etapaDeRede(alvo)];
}

/* ---------------- A CONVERSÃO ---------------- */

/* Uma tarefa da lista antiga (ou o fio que o descanso acabou de sortear)
   vira uma missão do sistema. `null` só para lixo sem título. */
export function tarefaParaMissao(q, mundo = {}) {
  const t = obj(q);
  const titulo = String(t.titulo || "").trim();
  if (!titulo) return null;
  const m = obj(mundo);
  const id = idDaTarefa(t);
  const contrato = t.contrato && typeof t.contrato === "object" ? t.contrato : null;
  const etapas = contrato ? etapasDoContrato(t, m, id) : etapasDoFio(t, m, id);
  const tipo = t.tipo === "principal" ? CONVERSAO.tipoDaPrincipal : contrato ? CONVERSAO.tipoDoContrato : CONVERSAO.tipoDoFio;
  const descricao = [t.descricao, t.objetivo].map((x) => String(x || "").trim()).filter(Boolean).join(" ");
  const missao = criarMissao({
    id, titulo, tipo, status: "ativa", descricao, dador: "", etapas,
    nivel: Math.max(1, Math.round(Number(m.nivel) || 1)), dia: Math.max(0, Math.round(Number(m.dia) || 0)),
    veiculo: VEICULO_DA_TAREFA_ANTIGA, intencao: t.tipo === "principal" ? "principal" : "secundaria",
  });
  if (!missao) return null;
  if (contrato) {
    /* REGRA 2: o preço é o do papel, e nada além dele — sem item, sem fama */
    missao.recompensa = { moedas: Math.max(0, Math.round(Number(contrato.moedas) || 0)), xp: Math.max(0, Math.round(Number(contrato.xp) || 0)), item: null, fama: 0, combinada: true };
  } else if (CONVERSAO.fioPagaComo === "nada") {
    /* a outra leitura possível da regra: o fio paga o que pagava — só a fé
       e o heroísmo, que `pagaDoFecho` já dá */
    missao.recompensa = { moedas: 0, xp: 0, item: null, fama: 0, combinada: true };
  } else if (CONVERSAO.fioPagaComo !== tipo) {
    missao.recompensa = recompensaDe({ tipo: CONVERSAO.fioPagaComo, nivel: missao.nivel || 1, etapas: missao.etapas.length });
  }
  return missao;
}

/* ---------------- A MIGRAÇÃO ---------------- */

/* Ao carregar: toda tarefa ATIVA da lista antiga vira missão; a tarefa
   fica marcada; nenhuma missão se duplica (o id sai do título). Devolve
   listas novas — nunca muta o que recebeu. */
/* O GÉMEO DA v9.27. O save de antes da v9.27 não tinha `missoes`, e o load
   dele (App.jsx) copiou cada tarefa ativa para uma missão de LEGADO com uma
   etapa que nunca se cumpre ("aguentar até ao dia 999999") — só o botão do
   diário a fechava — e deixou a tarefa ativa na lista antiga também. Esse
   gémeo é substituído pela missão convertida, com o mesmo id e o mesmo dia
   de nascença: o trabalho passa a fechar pelas etapas, e não se duplica. */
const ehGemeoDeLegado = (m) => !!(m && m.legado && m.status === "ativa" && (m.etapas || []).length
  && m.etapas.every((e) => e.tipo === "aguentar" && Number(e.dia) >= 999999));

export function migrarTarefasAntigas(quests, missoes, mundo = {}) {
  const lista = Array.isArray(quests) ? quests : [];
  let atuais = garantirMissoes(missoes);
  const jaHa = new Set(atuais.map((m) => m.id));
  const novas = [], migradas = [];
  const out = lista.map((q) => {
    if (!q || typeof q !== "object" || q.status !== "ativa" || !String(q.titulo || "").trim()) return q;
    const id = idDaTarefa(q);
    if (!jaHa.has(id)) {
      const m = tarefaParaMissao(q, mundo);
      if (!m) return q;
      const gemeo = atuais.find((x) => norm(x.titulo) === norm(q.titulo));
      if (gemeo && ehGemeoDeLegado(gemeo)) {
        atuais = atuais.map((x) => (x === gemeo ? { ...m, id: gemeo.id, criadaEm: gemeo.criadaEm } : x));
        jaHa.add(gemeo.id);
      } else if (!gemeo) {
        novas.push(m);
      }
      /* com um gémeo que já é missão de verdade, a tarefa só se marca: o
         trabalho já vive em `missoes` */
      jaHa.add(id);
    }
    migradas.push(id);
    return { ...q, status: MARCA_DA_MIGRACAO };
  });
  if (!migradas.length) return { quests: lista, missoes: garantirMissoes(missoes), migradas, novas };
  return { quests: out, missoes: [...atuais, ...novas], migradas, novas };
}

/* ---------------- O QUE O FECHO PAGA ---------------- */

/* O que a lista antiga pagava quando um canal fechava a tarefa (o Cronista,
   que é o que corria todo turno). `despertar`: a divindade do herói já
   despertou (é quando a fé conta). */
export function pagaDaTarefaAntiga(q, { despertar = false } = {}) {
  const t = obj(q);
  const c = t.contrato && typeof t.contrato === "object" ? t.contrato : null;
  const P = PAGA_DA_LISTA_ANTIGA;
  return {
    moedas: c ? Math.max(0, Math.round(Number(c.moedas) || 0)) : 0,
    xp: c ? Math.max(0, Math.round(Number(c.xp) || 0)) : 0,
    item: null,
    contratosConcluidos: c ? 1 : 0,
    fe: despertar ? { fieis: t.tipo === "principal" ? P.feDaPrincipal : P.feDasOutras, pf: P.pfDaFe } : null,
    heroismo: P.heroismo,
  };
}

/* O que a missão paga quando o sistema a fecha (`conferirAsMissoes`, no
   App): a recompensa da missão e a conta de `contratosConcluidos`, que ele
   soma para toda missão — e, para a que veio da lista antiga, a fé e o
   heroísmo que ela sempre pagou. É esta função que o App lê no fecho. */
export function pagaDoFecho(missao, { despertar = false } = {}) {
  const m = obj(missao);
  const r = m.recompensa && typeof m.recompensa === "object" ? m.recompensa : null;
  const antiga = m.veiculo === VEICULO_DA_TAREFA_ANTIGA;
  const P = PAGA_DA_LISTA_ANTIGA;
  return {
    moedas: r ? Math.max(0, Math.round(Number(r.moedas) || 0)) : 0,
    xp: r ? Math.max(0, Math.round(Number(r.xp) || 0)) : 0,
    item: r && r.item ? r.item : null,
    contratosConcluidos: 1,
    fe: antiga && despertar ? { fieis: m.intencao === "principal" ? P.feDaPrincipal : P.feDasOutras, pf: P.pfDaFe } : null,
    heroismo: antiga ? P.heroismo : null,
  };
}
