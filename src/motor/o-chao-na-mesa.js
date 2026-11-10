/* ============================================================
   O CHÃO NA MESA — a costura entre o motor do lote 3 e a luta do App
   (Fase CB, lote 3, fiação: CB14 a altura, CB15 o chão que reage, CB16 o
   cenário que se usa e o empurrão — 10/11/2026)

   O motor decide tudo (grid.js, superficies.js, disputa.js) e a peça
   desenha tudo (grade-de-batalha.jsx, painel-batalha.jsx). Entre os dois
   há uma camada que nem é regra nem é tela: ler o chão de uma luta que
   nasceu antes dele, montar a lista dos corpos que o chão pode ferir,
   aplicar as feridas na ficha e no combate sem mutar nada, e passar as
   formas do motor para as formas que a peça lê. Ela morava, por hábito,
   espalhada no App.jsx; aqui fica num sítio só, provável em Node
   (testes/teste-cb-lote3-app.mjs), e o App só a chama.

   NADA AQUI DECIDE REGRA. Os números são do motor; esta camada só os
   carrega de um lado para o outro. E não toca no que recebe.
   ============================================================ */
import { garantirGrade, OBJETOS_DO_CENARIO } from "../grid.js";
import { superficiesDaPlanta, previsaoDoObjeto, efeitoDaCasa, SUPERFICIES, SUPERFICIE_DO_ELEMENTO } from "../superficies.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const lista = (x) => (Array.isArray(x) ? x : []);
const fin = (x) => x !== null && x !== "" && typeof x !== "boolean" && Number.isFinite(Number(x));
const temPos = (e) => !!(obj(e) && fin(e.x) && fin(e.y));
const dePe = (e) => !!(e && !e.derrotado && !e.fugiu && (Number(e.vida) || 0) > 0);

/* ============================================================
   O CHÃO DE UMA LUTA. `combate.superficies` é campo novo e aditivo: a luta
   aberta antes dele (e a de um save de antes) não o tem, e então o chão é
   o que a planta traz de nascença — a mesma `superficiesDaPlanta` que a
   abertura usaria. Lido assim, preguiçoso, a abertura do combate não
   precisa de ser tocada e o save antigo a meio de uma luta ganha o charco
   da caverna sem migração nenhuma. Depois do primeiro chão que muda, o
   campo escreve-se e passa a mandar.
   ============================================================ */
export function chaoDaLuta(combate) {
  const c = obj(combate);
  if (!c) return [];
  if (Array.isArray(c.superficies)) return c.superficies;
  try { return superficiesDaPlanta(c.grade == null ? null : c.grade); } catch { return []; }
}
/* os tipos de reação já vistos nesta luta (o `primeira` do evento) */
export function vistasDaLuta(combate) {
  const c = obj(combate);
  return c ? lista(c.reacoesVistas).filter((x) => typeof x === "string") : [];
}
/* O COMBATE QUE VEM DO SAVE: os dois campos novos, lidos com desconfiança.
   Lixo (null, objeto, número) vale «ausente» — e ausente é a planta. */
export function combateDoSave(combate) {
  const c = obj(combate);
  if (!c) return combate == null ? null : combate;
  const out = { ...c };
  if (!Array.isArray(out.superficies)) delete out.superficies;
  else out.superficies = out.superficies.filter((s) => obj(s) && fin(s.x) && fin(s.y) && Object.hasOwn(SUPERFICIES, s.tipo));
  if (!Array.isArray(out.reacoesVistas)) delete out.reacoesVistas;
  else out.reacoesVistas = out.reacoesVistas.filter((x) => typeof x === "string");
  return out;
}

/* ============================================================
   OS CORPOS NA MESA — os de pé com casa, dos dois lados, na forma que o
   motor do chão lê: o herói com a vida, as condições e os atributos da
   ficha (o teste de Destreza lê-os); os aliados com a vida e as condições
   de `pers.grupo` pelo mesmo índice (o molde de sempre do App). `o.heroiEm`
   põe o herói noutra casa (o empurrão depois de andar).
   ============================================================ */
export function entidadesDaLuta(combate, pers, o) {
  const c = obj(combate) || {};
  const p = obj(pers) || {};
  const op = obj(o) || {};
  const out = [];
  const h = obj(c.heroi);
  if (h && fin(h.x) && fin(h.y) && (Number(p.vida) || 0) > 0) {
    const em = temPos(op.heroiEm) ? { x: Number(op.heroiEm.x), y: Number(op.heroiEm.y) } : {};
    out.push({ ...p, ...h, ...em, nome: p.nome || h.nome || "", vida: p.vida, condicoes: lista(p.condicoes), tamanho: h.tamanho || p.tamanho });
  }
  for (const e of lista(c.inimigos)) if (dePe(e) && temPos(e)) out.push(e);
  lista(c.aliados).forEach((a, i) => {
    const g = obj(lista(p.grupo)[i]) || {};
    if (temPos(a) && (Number(g.vida) || 0) > 0) out.push({ ...g, ...a, vida: g.vida, condicoes: lista(g.condicoes) });
  });
  return out;
}

/* ============================================================
   AS FERIDAS DO CHÃO — aplicadas sem mutar, a quem for de quem for

   `feridos`: [{ nome, dano, condicao?, condicoes? }] (a forma de
   `feridosDoEvento`, de `empurraoNoCenario.feridos` e de `feridasDoTurno`).
   Devolve { combate, pers, caidos } — o combate com os inimigos novos, a
   ficha com a vida e as condições do herói e do grupo. A condição que o
   corpo já tem não entra duas vezes (o `caido` de cima de outro `caido`
   seriam dois turnos por uma queda). O dano é o que o motor já deu, com a
   resistência dentro; aqui só se tira à vida.
   ============================================================ */
const juntarCondicoes = (tem, novas) => {
  const atuais = lista(tem);
  const out = [...atuais];
  for (const c of novas) if (obj(c) && c.id && !out.some((x) => x && x.id === c.id)) out.push(c);
  return out.length === atuais.length ? atuais : out;
};
const condicoesDe = (f) => [...lista(f.condicoes), f.condicao].filter((c) => obj(c) && c.id);
export function feridasNaLuta(combate, pers, feridos) {
  let c = obj(combate) ? combate : null;
  let p = obj(pers) ? pers : null;
  const caidos = [];
  for (const f of lista(feridos)) {
    if (!obj(f) || !f.nome) continue;
    const dano = fin(f.dano) ? Math.max(0, Math.round(Number(f.dano))) : 0;
    const conds = condicoesDe(f);
    if (!dano && !conds.length) continue;
    if (p && f.nome === p.nome) {
      const vida = Math.max(0, (Number(p.vida) || 0) - dano);
      p = { ...p, vida, condicoes: juntarCondicoes(p.condicoes, conds) };
      if (vida <= 0 && dano) caidos.push(f.nome);
      continue;
    }
    const inim = c ? lista(c.inimigos).find((e) => e && e.nome === f.nome && !e.derrotado) : null;
    if (inim) {
      c = { ...c, inimigos: c.inimigos.map((e) => {
        if (e !== inim) return e;
        const vida = Math.max(0, (Number(e.vida) || 0) - dano);
        if (vida <= 0 && dano) caidos.push(f.nome);
        return { ...e, vida, derrotado: vida <= 0, ...(dano ? { ultimoDano: dano } : {}), condicoes: juntarCondicoes(e.condicoes, conds) };
      }) };
      continue;
    }
    if (p && lista(p.grupo).some((g) => g && g.nome === f.nome)) {
      p = { ...p, grupo: p.grupo.map((g) => {
        if (!g || g.nome !== f.nome) return g;
        const vida = Math.max(0, (Number(g.vida) || 0) - dano);
        if (vida <= 0 && dano) caidos.push(f.nome);
        return { ...g, vida, condicoes: juntarCondicoes(g.condicoes, conds) };
      }) };
    }
  }
  return { combate: c, pers: p, caidos };
}

/* ============================================================
   O CHÃO DE QUEM COMEÇA O TURNO OU ENTRA NUMA CASA — `efeitoDaCasa` de
   cada corpo, na forma de `feridos` (com os tipos, para a linha). Quem não
   apanha nada não aparece.
   ============================================================ */
export function feridasDoChao(superficies, entidades, momento, sorte) {
  const out = [];
  if (!lista(superficies).length) return out;
  for (const e of lista(entidades)) {
    if (!temPos(e) || !e.nome) continue;
    const ef = efeitoDaCasa(superficies, e, { momento: momento === "turno" ? "turno" : "entrar", sorte });
    if (!ef || (!ef.dano && !ef.condicoes.length)) continue;
    out.push({ nome: e.nome, dano: ef.dano, condicoes: ef.condicoes, tipos: ef.tipos });
  }
  return out;
}
/* A linha do chão no registo: o mundo, nunca o mecanismo — «Goblin, no
   fogo: 3 de dano», «Mira, no gelo: fica caída». O nome do chão é o do
   motor (`SUPERFICIES[tipo].nome`). */
export function linhaDoChao(ferido) {
  const f = obj(ferido);
  if (!f || !f.nome) return "";
  const onde = lista(f.tipos).map((t) => (SUPERFICIES[t] ? SUPERFICIES[t].nome : "")).filter(Boolean).join(" e ");
  const partes = [];
  if (fin(f.dano) && Number(f.dano) > 0) partes.push(`${Number(f.dano)} de dano`);
  for (const c of condicoesDe(f)) if (c.nome) partes.push(`fica ${String(c.nome).toLowerCase()}`);
  if (!partes.length) return "";
  return `${f.nome}${onde ? `, ${onde.startsWith("água") ? "na" : "no"} ${onde}` : ""}: ${partes.join(", ")}`;
}

/* ============================================================
   O QUE A PEÇA LÊ
   ============================================================ */
/* o degrau de cada casa, `{ "x,y": 1|2 }` — da planta, por `garantirGrade`
   (a grade do save não o escreve); null sem degrau nenhum */
export function alturasNaMesa(grade) {
  const g = garantirGrade(grade == null ? null : grade);
  if (!g || !g.alturas || !g.alturas.size) return null;
  return Object.fromEntries(g.alturas);
}
/* OS OBJETOS: o que cada um é (as etiquetas e o nome da tabela do motor)
   e o que faria se o elemento lhe chegasse. O elemento é o do golpe do
   herói quando o objeto reage a ele; senão, o primeiro a que reage — a
   peça diz «barril de óleo · explode: −6 em 9 casas» antes de alguém o
   descobrir à força. A previsão é a forma da peça: { casas, dano, deixa
   (o chão que fica), verbo (a reação) }. */
export function objetosNaMesa(combate, o) {
  const c = obj(combate) || {};
  const op = obj(o) || {};
  const g = garantirGrade(c.grade == null ? null : c.grade);
  if (!g || !g.objetos || !g.objetos.size) return null;
  const superficies = chaoDaLuta(c), vistas = vistasDaLuta(c), entidades = lista(op.entidades);
  const out = [];
  for (const ob of g.objetos.values()) {
    const def = OBJETOS_DO_CENARIO[ob.tipo];
    if (!def) continue;
    const reage = obj(def.aoElemento) || {};
    const elemento = op.elemento && reage[op.elemento] ? op.elemento : Object.keys(reage)[0] || null;
    let previsao = null;
    if (elemento) {
      try {
        const p = previsaoDoObjeto({ grade: c.grade, superficies, vistas, entidades }, { x: ob.x, y: ob.y, elemento });
        const r = reage[elemento];
        if (p && p.reacao) previsao = { casas: p.casas, dano: p.dano, deixa: r && r.agente ? SUPERFICIE_DO_ELEMENTO[r.agente] || null : null, verbo: p.reacao, alvos: p.alvos };
      } catch { previsao = null; }
    }
    out.push({ x: ob.x, y: ob.y, tipo: ob.tipo, etiquetas: [...def.etiquetas], nome: def.nome, previsao });
  }
  return out.length ? out : null;
}
/* OS EVENTOS DE REAÇÃO, na forma da peça: `origem` passa a ser a casa de
   onde a onda parte (a do meio das casas apanhadas — o barril é o centro
   da explosão dele) e o «objeto ou chão» do motor fica em `de`; cada um
   leva uma `chave` própria, para a mesa nunca tocar duas vezes o mesmo. */
export function reacoesNaMesa(eventos, prefixo) {
  const out = [];
  lista(eventos).forEach((ev, i) => {
    if (!obj(ev) || !ev.tipo) return;
    const casas = lista(ev.casas).filter(temPos);
    let origem = null;
    if (casas.length) {
      const mx = casas.reduce((s, q) => s + Number(q.x), 0) / casas.length;
      const my = casas.reduce((s, q) => s + Number(q.y), 0) / casas.length;
      origem = casas.reduce((m, q) => (Math.hypot(q.x - mx, q.y - my) < Math.hypot(m.x - mx, m.y - my) ? q : m), casas[0]);
      origem = { x: origem.x, y: origem.y };
    }
    out.push({ ...ev, casas, origem, de: ev.origem || null, alvos: lista(ev.alvos), chave: `${prefixo || "r"}:${i}` });
  });
  return out;
}
/* O EMPURRÃO NA FORMA DA PEÇA (`rotulosDoEmpurrao`, batalha-na-tela.js):
   as parcelas do motor (`danos`: colisão, queda, reação, superfície) viram
   `dano: { queda, colisao, superficie, total }` — a reação do objeto onde
   ele cai soma ao chão, que é onde a peça a escreve —; o teste do chão vira
   `efeito: { tipo, teste }` com a palavra da peça pela condição de quem
   falha; a colisão contra um corpo leva o nome dele. A altura NÃO entra:
   a disputa não a soma, e a pílula não diz o que o dado não cobra. */
const EFEITO_DA_FALHA = { caido: "escorrega", atordoado: "atordoa" };
const maiuscula = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : "");
export function previsaoDoEmpurraoNaMesa(previsao) {
  const p = obj(previsao);
  if (!p) return null;
  const d = obj(p.danos) || {};
  const n = (v) => (fin(v) ? Number(v) : 0);
  const t = obj(p.teste);
  return {
    ...p,
    dano: { queda: n(d.queda), colisao: n(d.colisao), superficie: n(d.superficie) + n(d.reacao), total: n(p.dano) },
    efeito: t ? { tipo: EFEITO_DA_FALHA[t.falha] || p.efeito || "", teste: { atributo: maiuscula(t.atributo), cd: t.cd } } : null,
    colideCom: p.colideCom === "corpo" ? { nome: p.colide || "" } : p.colideCom || null,
  };
}
