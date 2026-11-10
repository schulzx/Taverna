/* ============================================================
   AS SUPERFÍCIES E O CENÁRIO QUE SE USA (CB15 · CB16 — Fase CB, lote 3,
   10/11/2026)

   A pessoa deu licença para ousar, e a mecânica que se copia é a de
   Divinity: Original Sin 2 e de Baldur's Gate 3 (a mecânica, nunca o nome,
   a arte nem o texto): o chão guarda o que lhe cai em cima, e o que lá está
   reage ao que vem a seguir. Fogo no óleo explode e arde; raio na água
   eletrifica quem está nela; gelo na água vira chão que derruba; fogo no
   gelo vira água. Um mago com fogo e um barril de óleo valem um plano — e o
   empurrão (Into the Breach) passa a valer muito mais: empurrar do alto
   fere com a queda, empurrar para o fogo aplica o fogo, e a seta mostra
   ANTES do clique a casa onde ele pára e o que lhe acontece lá.

   O QUE ESTE MÓDULO É. Puro, provável em Node, sem React. Todo número sai
   de uma tabela nomeada (`SUPERFICIES`, `REACOES_ELEMENTARES`,
   `SUPERFICIE_DO_ELEMENTO`, `MARCA_DO_ATAQUE`; a queda e os objetos moram em
   grid.js, `DANO_DA_QUEDA` e `OBJETOS_DO_CENARIO`, porque a vista e o
   empurrão são de lá). A sorte entra por argumento (`sorte`, um gerador
   semeado): a mesma semente dá o mesmo chão, em qualquer máquina. Nada é
   mutado: cada função devolve o estado novo.

   OS DOIS CAMPOS NOVOS, aditivos (a versão antiga ignora-os):
     combate.superficies  — [{ x, y, tipo, rodadas, permanente? }]: rodadas
                            null é o que a planta traz de nascença (a poça
                            da caverna), e não acaba;
     combate.reacoesVistas — os tipos de reação que já aconteceram nesta
                            luta, para o evento dizer se é a `primeira` (o
                            `jogo` pausa só a primeira explosão; a décima
                            não merece).

   O EVENTO DE REAÇÃO (o contrato com a tela):
     { tipo ("explode" | "eletrifica" | "congela" | "derrete" | "apaga" |
       "arde" | "derrama" | "tomba" | "parte"), casas: [{x,y}], dano,
       elemento, primeira, objeto (o tipo do objeto que reagiu, ou null),
       doChao (só quem pisa o chão apanha), teste ({ atributo, cd, falha })|null,
       origem ("objeto" | "superficie"), alvos: [{ nome, dano }] (quem está
       nas casas, quando quem chama passa `entidades`; sem elas, []) }
   Uma superfície sem fim tem `rodadas: null` (a poça da planta).
   ============================================================ */
import {
  garantirGrade, dentro, ehParede, quadradosDe, direcaoDe, ocupacaoDe,
  alturaEm, OBJETOS_DO_CENARIO, DANO_DA_QUEDA, PLANTAS,
} from "./grid.js";
import { destinoDoEmpurrao, rolarDisputa } from "./disputa.js";
import { criarCondicao } from "./condicoes.js";
import { multiplicadorDano, perfilDe, resistenciasEquipadas } from "./danos.js";
import { deslocamentoDeCriatura } from "./movimento.js";
import { sorteDaCasa } from "./semente.js";

/* ============================================================
   AS SUPERFÍCIES — o que cada chão faz a quem o pisa

     rodadas       — quanto dura (a rodada acaba em `passarRodada`);
     danoAoEntrar  — o dano de entrar na casa (andando ou empurrado);
     danoPorTurno  — o dano de começar o turno nela;
     elemento      — o tipo desse dano (a resistência e a fraqueza contam);
     teste         — o teste de Destreza de quem entra ou começa o turno
                     nela, e a condição de quem falha (null: nenhum);
     evitam        — os inimigos não entram nela de livre vontade
                     (`casasQueSeEvitam` → `moverInimigos`, grid.js);
     acaba         — o que fica quando a duração acaba (o gelo derrete em
                     água, a água eletrificada volta a ser água);
     efeito        — a palavra do que o chão faz, para a seta e a casa
                     (formas.md §CB 18): arde, envenena, atordoa, derruba.

   Os números são FIXOS, e não dados, pela lei do veredito: a seta do
   empurrão diz «entra no fogo, 3 de dano» e o fogo cumpre-o à letra. O
   único dado é o teste de Destreza, e a previsão mostra-lhe a chance.

   A ESCALA. O fogo do chão (3) é menos de metade do golpe médio de um
   comum (danoBaseDaAmeaca, 5 + d4 − 1) e dura duas rodadas: é o preço de
   FICAR, não um segundo golpe. O inimigo sai dele (ou não entra), e é por
   isso que ele vale — muda onde se está, não quanto se tira. */
export const SUPERFICIES = {
  oleo: { nome: "óleo", rodadas: 10, danoAoEntrar: 0, danoPorTurno: 0, elemento: null, teste: { atributo: "destreza", cd: 10, falha: "caido" }, evitam: false, acaba: null, efeito: "derruba" },
  agua: { nome: "água", rodadas: 6, danoAoEntrar: 0, danoPorTurno: 0, elemento: null, teste: null, evitam: false, acaba: null, efeito: null },
  gelo: { nome: "gelo", rodadas: 3, danoAoEntrar: 0, danoPorTurno: 0, elemento: null, teste: { atributo: "destreza", cd: 12, falha: "caido" }, evitam: false, acaba: "agua", efeito: "derruba" },
  fogo: { nome: "fogo", rodadas: 2, danoAoEntrar: 3, danoPorTurno: 3, elemento: "fogo", teste: null, evitam: true, acaba: null, efeito: "arde" },
  veneno: { nome: "veneno", rodadas: 3, danoAoEntrar: 2, danoPorTurno: 2, elemento: "veneno", teste: null, evitam: true, acaba: null, efeito: "envenena" },
  eletrica: { nome: "água eletrificada", rodadas: 1, danoAoEntrar: 3, danoPorTurno: 3, elemento: "raio", teste: { atributo: "destreza", cd: 12, falha: "atordoado" }, evitam: true, acaba: "agua", efeito: "atordoa" },
};

/* O chão que cada agente deixa quando não encontra com que reagir. O raio
   não deixa nada: ele só existe na água. `agua` e `oleo` não são elementos
   de golpe — são o que o barril derrama — e entram pela mesma porta. */
export const SUPERFICIE_DO_ELEMENTO = { fogo: "fogo", gelo: "gelo", veneno: "veneno", agua: "agua", oleo: "oleo", raio: null };

/* A MARCA DO ATAQUE: o que um golpe com elemento deixa no chão.
     · o golpe de ÁREA deixa o chão do elemento nas casas a até `raioCasas`
       do ponto de impacto (a bola de fogo de 6 m pinta 9 casas, não 81 — o
       tabuleiro inteiro em chamas seria um mapa, e não uma jogada);
     · o SOPRO (área sem ponto de impacto: o cone) pinta todas as casas que
       queimou — o dragão é o dono do chão por onde passa;
     · o golpe de ALVO ÚNICO não deixa nada: só reage com o que já lá está
       (a seta de fogo no óleo explode-o). É o que impede todo o mago de
       virar um incendiário, e faz do barril um plano. */
export const MARCA_DO_ATAQUE = { raioCasas: 1, alvoUnicoDeixa: false };

/* ============================================================
   AS REAÇÕES — par → resultado. A chave é `agente>superfície`.

     tipo     — o evento (a tela e o `jogo` leem-no);
     vira     — o chão que fica nas casas que reagiram (null: nenhum);
     mancha   — a reação corre a mancha inteira (as casas ligadas do mesmo
                chão, pelos oito vizinhos): o fogo corre o óleo todo, o
                raio corre a água toda — é o que faz o charco ser armadilha;
     dano     — o que a reação faz a quem está nas casas dela (elemento);
     rodadas  — quanto dura o chão novo (sem ele, o de `SUPERFICIES`);
     teste    — quem lá está faz o teste do chão novo (a água eletrificada
                atordoa quem falha);
     doChao   — só quem pisa o chão apanha (quem voa passa por cima).
   ============================================================ */
export const REACOES_ELEMENTARES = {
  "fogo>oleo": { tipo: "explode", vira: "fogo", mancha: true, dano: 4, elemento: "fogo", rodadas: 3, teste: false, doChao: false },
  "oleo>fogo": { tipo: "explode", vira: "fogo", mancha: false, dano: 4, elemento: "fogo", rodadas: 3, teste: false, doChao: false },
  "fogo>veneno": { tipo: "explode", vira: "fogo", mancha: true, dano: 4, elemento: "fogo", rodadas: 2, teste: false, doChao: false },
  "veneno>fogo": { tipo: "explode", vira: "fogo", mancha: false, dano: 4, elemento: "fogo", rodadas: 2, teste: false, doChao: false },
  "raio>agua": { tipo: "eletrifica", vira: "eletrica", mancha: true, dano: 3, elemento: "raio", rodadas: null, teste: true, doChao: true },
  "gelo>agua": { tipo: "congela", vira: "gelo", mancha: true, dano: 0, elemento: null, rodadas: null, teste: false, doChao: true },
  "gelo>eletrica": { tipo: "congela", vira: "gelo", mancha: true, dano: 0, elemento: null, rodadas: null, teste: false, doChao: true },
  "fogo>gelo": { tipo: "derrete", vira: "agua", mancha: false, dano: 0, elemento: null, rodadas: null, teste: false, doChao: true },
  "fogo>agua": { tipo: "apaga", vira: "agua", mancha: false, dano: 0, elemento: null, rodadas: null, teste: false, doChao: true },
  "agua>fogo": { tipo: "apaga", vira: "agua", mancha: false, dano: 0, elemento: null, rodadas: null, teste: false, doChao: true },
  "gelo>fogo": { tipo: "apaga", vira: "agua", mancha: false, dano: 0, elemento: null, rodadas: null, teste: false, doChao: true },
};

/* ---------------- os ajudantes ---------------- */
const lista = (x) => (Array.isArray(x) ? x : []);
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const chave = (x, y) => `${x},${y}`;
const deChave = (k) => { const [x, y] = k.split(",").map(Number); return { x, y }; };
const VIZINHOS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
const temPos = (e) => !!e && e.x != null && e.y != null && Number.isFinite(Number(e.x)) && Number.isFinite(Number(e.y));
const dePe = (e) => !!e && !e.derrotado && !(e.vida != null && Number(e.vida) <= 0);
const voa = (e) => { try { return !!deslocamentoDeCriatura(e).voando; } catch { return false; } };
const rodadasDe = (tipo, permanente) => (permanente ? null : SUPERFICIES[tipo].rodadas);

/* o mapa das superfícies por casa, lido com desconfiança (o save é de quem joga) */
function mapaDe(superficies) {
  const m = new Map();
  for (const s of lista(superficies)) {
    if (!obj(s) || !temPos(s) || !Object.hasOwn(SUPERFICIES, s.tipo)) continue;
    const r = s.rodadas == null ? null : Math.max(0, Math.floor(Number(s.rodadas) || 0));
    const c = { x: Number(s.x), y: Number(s.y), tipo: s.tipo, rodadas: r };
    if (s.permanente === true || r == null) { c.permanente = true; c.rodadas = null; }
    else if (s.volta === true) c.volta = true;
    m.set(chave(c.x, c.y), c);
  }
  return m;
}
const listaDe = (m) => [...m.values()].map((c) => ({ ...c }));

/* as casas a até `raio` (Chebyshev) de uma casa, dentro do campo e fora da parede */
function casasEmVolta(grade, x, y, raio) {
  const out = [];
  const r = Math.max(0, Math.floor(Number(raio) || 0));
  for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) {
    const cx = x + dx, cy = y + dy;
    if (!dentro(grade, cx, cy) || ehParede(grade, cx, cy)) continue;
    out.push({ x: cx, y: cy });
  }
  return out;
}

/* a mancha: as casas ligadas (oito vizinhos) com o mesmo chão de `k` */
function manchaDe(mapa, k) {
  const tipo = mapa.get(k).tipo;
  const vistas = new Set([k]);
  const fila = [k];
  while (fila.length) {
    const { x, y } = deChave(fila.shift());
    for (const [dx, dy] of VIZINHOS) {
      const n = chave(x + dx, y + dy);
      if (vistas.has(n)) continue;
      const c = mapa.get(n);
      if (c && c.tipo === tipo) { vistas.add(n); fila.push(n); }
    }
  }
  return [...vistas];
}

/* o dano que chega ao corpo: a fraqueza, a resistência e a imunidade dele,
   e a resistência do que veste (a mesma conta do golpe) */
function danoNoCorpo(dano, elemento, ent) {
  const d = Math.max(0, Number(dano) || 0);
  if (!d) return 0;
  const p = perfilDe(ent || {});
  const resist = [...lista(p.resist), ...resistenciasEquipadas(ent)];
  const { mult } = multiplicadorDano(elemento || "fisico", { ...p, resist });
  return Math.max(0, Math.round(d * mult));
}

/* O TESTE DE DESTREZA, e a chance dele. O d20 sem as pontas do golpe: é um
   teste de mesa (5e), d20 + Destreza contra a CD. Quem já está na condição
   que o teste daria não a ganha outra vez. */
const modDestreza = (ent) => {
  const e = ent || {};
  const v = e.atributos && e.atributos.destreza != null ? e.atributos.destreza : e.des;
  return Number.isFinite(Number(v)) ? Number(v) : 0;
};
const chanceDoTeste = (ent, teste) => Math.max(0, Math.min(1, (21 + modDestreza(ent) - teste.cd) / 20));
function rolarTeste(ent, teste, sorte) {
  const d20 = 1 + Math.floor((typeof sorte === "function" ? sorte() : sorteDaCasa()) * 20);
  const total = d20 + modDestreza(ent);
  return { atributo: teste.atributo, cd: teste.cd, d20, total, passou: total >= teste.cd, falha: teste.falha };
}

/* ============================================================
   APLICAR UM ELEMENTO A CASAS — o golpe, o sopro, o barril, a explosão

   `estado`: { grade, superficies, vistas (= reacoesVistas), entidades? }.
   `pedido`: { casas, elemento, deixa (padrão true), centro }
     · reage com o que está em TODAS as casas (os objetos primeiro, depois
       o chão) — a reação corre a mancha, e a explosão de um barril aplica
       o fogo dela às casas à volta, que podem ter outro barril: a cadeia
       anda até parar, com um teto de passos para nunca prender a mesa;
     · e, onde não reagiu, deixa o chão do elemento (`SUPERFICIE_DO_ELEMENTO`)
       se `deixa` — só nas casas a até `MARCA_DO_ATAQUE.raioCasas` de
       `centro`, quando há centro (o golpe de área); em todas, sem ele (o
       sopro, o barril que derrama).
   Devolve { grade, superficies, vistas, eventos } — a grade nova só muda
   nos objetos (e no estorvo do objeto que desapareceu).
   ============================================================ */
const TETO_DA_CADEIA = 64;
export function aplicarElemento(estado, pedido) {
  const e = obj(estado) || {};
  const p = obj(pedido) || {};
  const grade = e.grade == null ? null : e.grade;
  const g = garantirGrade(grade);
  const mapa = mapaDe(e.superficies);
  const objs = g ? new Map(g.objetos) : new Map();
  const vistas = lista(e.vistas).filter((x) => typeof x === "string");
  const eventos = [];
  const entidades = lista(e.entidades);
  const evento = (ev) => {
    const primeira = !vistas.includes(ev.tipo);
    if (primeira) vistas.push(ev.tipo);
    const pronto = { objeto: null, elemento: null, doChao: false, teste: null, ...ev, origem: ev.objeto ? "objeto" : "superficie", primeira };
    /* os alvos sem o teste (o dano é certo; o teste rola-o `feridosDoEvento`) */
    pronto.alvos = feridosDoEvento({ ...pronto, teste: null }, entidades).map((f) => ({ nome: f.nome, dano: f.dano }));
    eventos.push(pronto);
  };

  const fila = [{
    casas: lista(p.casas), agente: p.elemento, deixa: p.deixa !== false,
    centro: temPos(p.centro) ? { x: Number(p.centro.x), y: Number(p.centro.y) } : null,
  }];
  let passos = 0;
  while (fila.length && passos++ < TETO_DA_CADEIA) {
    const { casas, agente, deixa, centro } = fila.shift();
    if (typeof agente !== "string" || !agente) continue;
    const feitas = new Set();
    const unicas = [];
    for (const c of casas) {
      if (!temPos(c)) continue;
      const x = Math.floor(Number(c.x)), y = Math.floor(Number(c.y));
      if (!dentro(grade, x, y) || ehParede(grade, x, y)) continue;
      const k = chave(x, y);
      if (unicas.some((u) => u.k === k)) continue;
      unicas.push({ x, y, k });
    }
    for (const { x, y, k } of unicas) {
      /* 1. o objeto da casa */
      const o = objs.get(k);
      const def = o ? OBJETOS_DO_CENARIO[o.tipo] : null;
      const ro = def && def.aoElemento ? def.aoElemento[agente] : null;
      if (ro) {
        if (ro.vira) objs.set(k, { ...o, tipo: ro.vira }); else objs.delete(k);
        const area = casasEmVolta(grade, x, y, ro.raio);
        evento({ tipo: ro.tipo, casas: area, dano: ro.dano || 0, elemento: ro.elemento || null, objeto: o.tipo });
        if (ro.agente) fila.push({ casas: area, agente: ro.agente, deixa: true, centro: null });
      }
      /* 2. o chão da casa */
      if (feitas.has(k)) continue;
      const s = mapa.get(k);
      const reacao = s ? REACOES_ELEMENTARES[`${agente}>${s.tipo}`] : null;
      if (reacao) {
        const ks = reacao.mancha ? manchaDe(mapa, k) : [k];
        for (const kk of ks) {
          feitas.add(kk);
          const antes = mapa.get(kk);
          if (!reacao.vira) { mapa.delete(kk); continue; }
          if (antes.tipo === reacao.vira) continue;
          const perm = !!antes.permanente || !!antes.volta;
          const rod = reacao.rodadas != null ? reacao.rodadas : SUPERFICIES[reacao.vira].rodadas;
          const nova = { x: antes.x, y: antes.y, tipo: reacao.vira, rodadas: rod };
          /* o charco que a planta trouxe volta a ser charco: a água
             eletrificada e o gelo acabam em água permanente outra vez */
          if (perm && SUPERFICIES[reacao.vira].acaba) nova.volta = true;
          if (perm && reacao.vira === "agua") { nova.rodadas = null; nova.permanente = true; }
          mapa.set(kk, nova);
        }
        evento({
          tipo: reacao.tipo, casas: ks.map(deChave), dano: reacao.dano || 0, elemento: reacao.elemento || null,
          doChao: !!reacao.doChao, teste: reacao.teste && SUPERFICIES[reacao.vira] && SUPERFICIES[reacao.vira].teste ? { ...SUPERFICIES[reacao.vira].teste } : null,
        });
        continue;
      }
      /* 3. onde não reagiu, o chão do elemento */
      const fica = SUPERFICIE_DO_ELEMENTO[agente];
      if (!deixa || !fica) continue;
      if (centro && Math.max(Math.abs(x - centro.x), Math.abs(y - centro.y)) > MARCA_DO_ATAQUE.raioCasas) continue;
      if (s && s.tipo === fica) { if (!s.permanente) mapa.set(k, { ...s, rodadas: SUPERFICIES[fica].rodadas }); continue; }
      mapa.set(k, { x, y, tipo: fica, rodadas: SUPERFICIES[fica].rodadas });
    }
  }

  /* a grade nova: os objetos de agora, e o estorvo de quem desapareceu */
  /* só se escreve quando um objeto mudou: até lá a grade é a que entrou (e
     os objetos continuam a sair da planta, em garantirGrade) */
  let gradeNova = grade;
  const mudouObjeto = g && ([...g.objetos].some(([k, o]) => !objs.has(k) || objs.get(k).tipo !== o.tipo));
  if (mudouObjeto && obj(grade)) {
    const sumiram = [...g.objetos.keys()].filter((k) => !objs.has(k));
    gradeNova = {
      ...grade,
      objetos: [...objs.values()].map((o) => ({ x: o.x, y: o.y, tipo: o.tipo })),
      estorvos: lista(grade.estorvos).filter((k) => !sumiram.includes(k)),
    };
  }
  return { grade: gradeNova, superficies: listaDe(mapa), vistas, eventos };
}

/* O GOLPE COM ELEMENTO, pela marca da tabela: a área com ponto de impacto
   deixa chão perto dele; o sopro (área sem centro) em todas as casas; o
   alvo único só reage. `golpe`: { elemento, casas (as da área, ou a do
   alvo), centro, area (bool) }. */
export function marcaDoAtaque(estado, golpe) {
  const gp = obj(golpe) || {};
  const area = gp.area === true;
  return aplicarElemento(estado, {
    casas: lista(gp.casas), elemento: gp.elemento, centro: area ? gp.centro : null,
    deixa: area || MARCA_DO_ATAQUE.alvoUnicoDeixa,
  });
}

/* ============================================================
   QUEM O EVENTO APANHA — o dano e o teste, corpo a corpo

   `entidades`: os de pé com casa (os dois lados). Quem voa não apanha o
   que é do chão (a água eletrificada). Devolve [{ nome, dano, elemento,
   condicao, teste }] — quem fia aplica (o dano pela porta de sempre, a
   condição na ficha).
   ============================================================ */
export function feridosDoEvento(evento, entidades, opcoes) {
  const ev = obj(evento);
  if (!ev) return [];
  const o = opcoes == null ? {} : opcoes;
  const casas = new Set(lista(ev.casas).filter(temPos).map((c) => chave(c.x, c.y)));
  const out = [];
  for (const ent of lista(entidades)) {
    if (!dePe(ent) || !temPos(ent)) continue;
    if (!quadradosDe(ent).some((q) => casas.has(chave(q.x, q.y)))) continue;
    if (ev.doChao && voa(ent)) continue;
    const dano = danoNoCorpo(ev.dano, ev.elemento, ent);
    let teste = null, condicao = null;
    if (ev.teste) {
      teste = rolarTeste(ent, ev.teste, o.sorte);
      if (!teste.passou) condicao = criarCondicao(ev.teste.falha, { origem: ev.tipo });
    }
    if (!dano && !condicao && !teste) continue;
    out.push({ nome: ent.nome, dano, elemento: ev.elemento, condicao, teste });
  }
  return out;
}

/* ============================================================
   O CHÃO DE QUEM ENTRA OU COMEÇA O TURNO — `momento`: "entrar" | "turno"

   Cada chão debaixo do corpo conta uma vez (o grande com um pé no fogo e
   outro no óleo apanha os dois). Quem voa passa por cima de tudo. Devolve
   { dano, tipos, condicoes, testes } — ou null quando o chão não faz nada.
   ============================================================ */
export function efeitoDaCasa(superficies, ent, opcoes) {
  const o = opcoes == null ? {} : opcoes;
  if (!temPos(ent) || voa(ent)) return null;
  const mapa = mapaDe(superficies);
  const tipos = [];
  for (const q of quadradosDe(ent)) {
    const s = mapa.get(chave(q.x, q.y));
    if (s && !tipos.includes(s.tipo)) tipos.push(s.tipo);
  }
  if (!tipos.length) return null;
  const turno = o.momento === "turno";
  let dano = 0;
  const condicoes = [], testes = [];
  for (const tipo of tipos) {
    const S = SUPERFICIES[tipo];
    dano += danoNoCorpo(turno ? S.danoPorTurno : S.danoAoEntrar, S.elemento, ent);
    if (S.teste && !lista(ent.condicoes).some((c) => c && c.id === S.teste.falha)) {
      const r = rolarTeste(ent, S.teste, o.sorte);
      testes.push({ tipo, ...r });
      if (!r.passou) { const c = criarCondicao(S.teste.falha, { origem: tipo }); if (c) condicoes.push(c); }
    }
  }
  if (!dano && !condicoes.length && !testes.length) return null;
  return { dano, tipos, condicoes, testes };
}

/* A RODADA PASSA: cada chão perde uma rodada; o que acaba vira o que a
   tabela diz (`acaba`) ou some. O da planta não acaba. Devolve
   { superficies, acabaram: [{ x, y, tipo, vira }] }. */
export function passarRodada(superficies) {
  const mapa = mapaDe(superficies);
  const acabaram = [];
  for (const [k, c] of [...mapa]) {
    if (c.permanente) continue;
    const r = c.rodadas - 1;
    if (r > 0) { mapa.set(k, { ...c, rodadas: r }); continue; }
    const vira = SUPERFICIES[c.tipo].acaba || null;
    const volta = !!c.volta;
    acabaram.push({ x: c.x, y: c.y, tipo: c.tipo, vira });
    if (!vira) { mapa.delete(k); continue; }
    mapa.set(k, volta && vira === "agua"
      ? { x: c.x, y: c.y, tipo: vira, rodadas: null, permanente: true }
      : { x: c.x, y: c.y, tipo: vira, rodadas: rodadasDe(vira, false) });
  }
  /* o `volta` (o charco de nascença que está gelado ou eletrificado)
     viaja com a casa enquanto ela não acaba, e devolve-a à água de sempre */
  return { superficies: listaDe(mapa), acabaram };
}

/* As casas onde ninguém entra de livre vontade (`evitam`), para o passo
   dos inimigos (`moverInimigos(..., { evitar })`, grid.js). */
export function casasQueSeEvitam(superficies) {
  const s = new Set();
  for (const c of mapaDe(superficies).values()) if (SUPERFICIES[c.tipo].evitam) s.add(chave(c.x, c.y));
  return s;
}

/* O chão de nascença da planta (a poça da caverna, o charco do matagal):
   permanente, e só onde a planta o declara. Sem grade, nada. */
export function superficiesDaPlanta(grade) {
  const g = obj(grade);
  const p = g && Object.hasOwn(PLANTAS, g.cenario) ? PLANTAS[g.cenario] : null;
  const out = [];
  for (const [x0, y0, x1, y1, tipo] of lista(p && p.superficies)) {
    if (!Object.hasOwn(SUPERFICIES, tipo)) continue;
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
      if (ehParede(grade, x, y)) continue;
      out.push({ x, y, tipo, rodadas: null, permanente: true });
    }
  }
  return out;
}

/* ============================================================
   O EMPURRÃO NO CENÁRIO (CB16) — a casa onde pára e o que lhe acontece lá

   A geometria é a do empurrão de sempre (`destinoDoEmpurrao`, disputa.js —
   a MESMA função que `empurrar` usa, logo a casa prevista é a casa real).
   Por cima dela, nesta ordem:
     1. a COLISÃO — parou contra a parede ou contra outro corpo: os dois
        levam `DANO_DA_QUEDA.colisao` (a borda não fere);
     2. a QUEDA — a casa de chegada é mais baixa: `DANO_DA_QUEDA.porDegrau`
        pelos degraus, e caído de `derrubaDesde` para cima;
     3. o OBJETO da casa de chegada (`aoEmpurrao`): o barril tomba e
        derrama, o candeeiro tomba e acende, o caixote parte — e o que ele
        deixa reage com o chão (o candeeiro no óleo explode);
     4. o CHÃO onde pára, depois disso tudo: entrar no fogo arde.
   `previsaoDoEmpurrao` diz tudo isto ANTES do clique, sem rolar nada (o
   teste do chão vem com a chance); `empurraoNoCenario` faz o mesmo e rola
   o teste. Chama-se o segundo só depois de `empurrar(...)` ter vencido.
   ============================================================ */
function noCenario(args, prever) {
  const a = obj(args) || {};
  const grade = a.grade == null ? null : a.grade;
  const quem = a.quem == null ? null : a.quem;
  const alvo = a.alvo == null ? null : a.alvo;
  const entidades = lista(a.entidades);
  if (!temPos(quem) || !temPos(alvo)) return null;
  const d = destinoDoEmpurrao({ grade, quem, alvo, entidades });
  const de = { x: Number(alvo.x), y: Number(alvo.y) };
  const para = d.ok && d.para ? d.para : de;
  const movido = { ...alvo, x: para.x, y: para.y };
  const danoDe = new Map();
  const parcelas = { colisao: 0, queda: 0, reacao: 0, superficie: 0 };
  const somar = (nome, n, parcela) => {
    if (!(n > 0)) return;
    danoDe.set(nome, (danoDe.get(nome) || 0) + n);
    if (parcela && nome === alvo.nome) parcelas[parcela] += n;
  };
  const condsDe = new Map();
  const juntarCond = (nome, c) => { if (c) condsDe.set(nome, [...(condsDe.get(nome) || []), c]); };

  /* 1. a colisão */
  let colide = null;
  if (d.bloqueio) {
    const dir = direcaoDe(quem, alvo);
    const fora = new Set(quadradosDe(movido).map((q) => chave(q.x + dir.x, q.y + dir.y)));
    const C = DANO_DA_QUEDA.colisao;
    if (d.bloqueio === "ocupado") {
      const outro = entidades.find((e) => e && e !== alvo && dePe(e) && temPos(e)
        && !(e.x === alvo.x && e.y === alvo.y && String(e.nome || "") === String(alvo.nome || ""))
        && quadradosDe(e).some((q) => fora.has(chave(q.x, q.y))));
      if (outro) {
        colide = outro.nome || null;
        somar(alvo.nome, danoNoCorpo(C.ocupado, DANO_DA_QUEDA.elemento, alvo), "colisao");
        somar(outro.nome, danoNoCorpo(C.ocupado, DANO_DA_QUEDA.elemento, outro));
      }
    } else if (d.bloqueio === "parede") {
      colide = "parede";
      somar(alvo.nome, danoNoCorpo(C.parede, DANO_DA_QUEDA.elemento, alvo), "colisao");
    }
  }

  /* 2. a queda */
  const corpo = (pos) => Math.max(0, ...quadradosDe({ ...alvo, x: pos.x, y: pos.y }).map((q) => alturaEm(grade, q.x, q.y)));
  const queda = Math.max(0, corpo(de) - corpo(para));
  if (queda > 0) {
    const tab = DANO_DA_QUEDA.porDegrau;
    somar(alvo.nome, danoNoCorpo(tab[Math.min(queda, tab.length - 1)], DANO_DA_QUEDA.elemento, alvo), "queda");
    if (queda >= DANO_DA_QUEDA.derrubaDesde) juntarCond(alvo.nome, criarCondicao("caido", { origem: "queda" }));
  }

  /* 3. o objeto da casa de chegada */
  let estado = { grade, superficies: lista(a.superficies), vistas: lista(a.vistas), eventos: [] };
  let objeto = null;
  const g = garantirGrade(grade);
  if (g && (para.x !== de.x || para.y !== de.y)) {
    for (const q of quadradosDe(movido)) {
      const k = chave(q.x, q.y);
      const o = g.objetos.get(k);
      const def = o ? OBJETOS_DO_CENARIO[o.tipo] : null;
      const r = def ? def.aoEmpurrao : null;
      if (!r) continue;
      objeto = o.tipo;
      const objetos = [...g.objetos.values()].filter((x) => chave(x.x, x.y) !== k).map((x) => ({ x: x.x, y: x.y, tipo: x.tipo }));
      if (r.vira) objetos.push({ x: o.x, y: o.y, tipo: r.vira });
      const gradeSem = obj(grade) ? { ...grade, objetos, estorvos: r.vira ? lista(grade.estorvos) : lista(grade.estorvos).filter((e) => e !== k) } : grade;
      const area = casasEmVolta(grade, o.x, o.y, r.raio);
      const vistas = [...estado.vistas];
      const primeira = !vistas.includes(r.tipo);
      if (primeira) vistas.push(r.tipo);
      const evObj = { tipo: r.tipo, casas: area, dano: r.dano || 0, elemento: null, objeto: o.tipo, doChao: false, teste: null, primeira };
      const depois = r.agente
        ? aplicarElemento({ grade: gradeSem, superficies: estado.superficies, vistas }, { casas: area, elemento: r.agente, deixa: true })
        : { grade: gradeSem, superficies: estado.superficies, vistas, eventos: [] };
      estado = { ...depois, eventos: [evObj, ...depois.eventos] };
      break;
    }
  }
  /* o que as reações do objeto fazem a quem lá está (o empurrado incluído,
     já na casa nova) */
  const naMesa = entidades.map((e) => (e === alvo || (e && e.x === alvo.x && e.y === alvo.y && e.nome === alvo.nome) ? movido : e));
  if (!naMesa.includes(movido)) naMesa.push(movido);
  const testes = [];
  for (const ev of estado.eventos) {
    if (prever) {
      for (const f of feridosDoEvento({ ...ev, teste: null }, naMesa)) somar(f.nome, f.dano, "reacao");
      if (ev.teste) testes.push({ ...ev.teste, de: ev.tipo });
    } else {
      for (const f of feridosDoEvento(ev, naMesa, { sorte: a.sorte })) { somar(f.nome, f.dano, "reacao"); juntarCond(f.nome, f.condicao); }
    }
  }

  /* 4. o chão onde pára */
  const mapa = mapaDe(estado.superficies);
  const chao = quadradosDe(movido).map((q) => mapa.get(chave(q.x, q.y))).find(Boolean) || null;
  const mudou = para.x !== de.x || para.y !== de.y;
  if (mudou) {
    if (prever) {
      const ef = efeitoDaCasa(estado.superficies, movido, { momento: "entrar", sorte: () => 0.999 });
      if (ef) {
        somar(alvo.nome, ef.dano, "superficie");
        for (const t of ef.testes) testes.push({ atributo: t.atributo, cd: t.cd, falha: t.falha, de: t.tipo });
      }
    } else {
      const ef = efeitoDaCasa(estado.superficies, movido, { momento: "entrar", sorte: a.sorte });
      if (ef) { somar(alvo.nome, ef.dano, "superficie"); for (const c of ef.condicoes) juntarCond(alvo.nome, c); }
    }
  }
  return {
    d, de, para, queda, colide, objeto, chao: chao ? chao.tipo : null, testes,
    estado, danoDe, condsDe, parcelas, mudou,
  };
}

/* A PREVISÃO (a lei do veredito): { casas, para, queda, dano, superficie,
   colide } — e ainda `de`, `objeto` (o que tomba na casa de chegada),
   `reacoes` (os tipos que vão acontecer), `teste` ({ atributo, cd, falha,
   chance } do chão, ou null), `derruba` e `outros` ([{ nome, dano }]: quem
   mais leva — o corpo contra o qual bate, quem está na explosão). */
/* A CHANCE DA DISPUTA, exata: as 400 faces dos dois d20 passadas pela
   MESMA `rolarDisputa` que o empurrão rola (um gerador que devolve cada
   face por ordem) — a conta da tela não pode ser outra que a do dado. */
function chanceDaDisputa(quem, alvo) {
  const F = 20;
  let ganha = 0, total = 0;
  for (let i = 0; i < F; i++) for (let j = 0; j < F; j++) {
    const faces = [(i + 0.5) / F, (j + 0.5) / F];
    let n = 0;
    const r = rolarDisputa({ quem, alvo, sorte: () => faces[Math.min(n++, 1)] });
    if (!r.ok) return null;
    total++;
    if (r.venceu) ganha++;
  }
  return total ? ganha / total : null;
}

/* `colideCom`: contra o quê ("parede" | "corpo" | null); `colide` diz o nome.
   `danos`: as parcelas do dano do empurrado ({ colisao, queda, reacao,
   superficie }, a soma é `dano`). `efeito`: a palavra do chão onde pára
   (`SUPERFICIES[...].efeito`). `chance`: a de vencer a disputa (null quando
   não há disputa possível). */
export function previsaoDoEmpurrao(args) {
  const r = noCenario(args, true);
  if (!r) return null;
  const alvo = args.alvo;
  const t = r.testes[0] || null;
  let chance = null;
  try { chance = chanceDaDisputa(args.quem, alvo); } catch { chance = null; }
  return {
    chance,
    danos: { ...r.parcelas },
    colideCom: r.colide == null ? null : r.colide === "parede" ? "parede" : "corpo",
    efeito: r.mudou && r.chao ? SUPERFICIES[r.chao].efeito || null : null,
    casas: r.d.ok ? r.d.casas : 0,
    de: r.de,
    para: r.para,
    queda: r.queda,
    dano: r.danoDe.get(alvo.nome) || 0,
    superficie: r.chao,
    colide: r.colide,
    objeto: r.objeto,
    reacoes: r.estado.eventos.map((e) => e.tipo),
    derruba: r.queda >= DANO_DA_QUEDA.derrubaDesde,
    teste: t ? { atributo: t.atributo, cd: t.cd, falha: t.falha, chance: chanceDoTeste(alvo, t) } : null,
    outros: [...r.danoDe].filter(([n]) => n !== alvo.nome).map(([nome, dano]) => ({ nome, dano })),
  };
}

/* O EMPURRÃO CUMPRIDO: a mesma conta, com o teste rolado. Devolve
   { para, queda, colide, dano (o do empurrado), feridos: [{ nome, dano,
   condicoes }] (o empurrado primeiro), grade, superficies, vistas, eventos }
   — quem fia aplica o dano, as condições, e guarda os três estados. */
export function empurraoNoCenario(args) {
  const r = noCenario(args, false);
  if (!r) return null;
  const nome = args.alvo.nome;
  const nomes = [nome, ...[...new Set([...r.danoDe.keys(), ...r.condsDe.keys()])].filter((n) => n !== nome)];
  return {
    para: r.para, queda: r.queda, colide: r.colide,
    dano: r.danoDe.get(nome) || 0,
    feridos: nomes.map((n) => ({ nome: n, dano: r.danoDe.get(n) || 0, condicoes: r.condsDe.get(n) || [] }))
      .filter((f) => f.nome === nome || f.dano > 0 || f.condicoes.length),
    grade: r.estado.grade, superficies: r.estado.superficies, vistas: r.estado.vistas, eventos: r.estado.eventos,
  };
}

/* ============================================================
   A PREVISÃO DO OBJETO APONTADO (formas.md §CB 18) — o que acontece se o
   golpe com `elemento` lhe chegar: a reação, as casas, o dano, o que fica,
   e quem apanha. É a MESMA `aplicarElemento` que o golpe cumpre (o alvo
   único: só reage, não deixa chão), sem rolar nada.
   `estado`: { grade, superficies, vistas, entidades }; `alvo`: { x, y,
   elemento }. Devolve null quando a casa não tem objeto.
   ============================================================ */
export function previsaoDoObjeto(estado, alvo) {
  const e = obj(estado) || {};
  const a = obj(alvo) || {};
  if (!temPos(a)) return null;
  const g = garantirGrade(e.grade == null ? null : e.grade);
  const o = g ? g.objetos.get(chave(Number(a.x), Number(a.y))) : null;
  if (!o) return null;
  const def = OBJETOS_DO_CENARIO[o.tipo];
  const r = def.aoElemento ? def.aoElemento[a.elemento] || null : null;
  const depois = aplicarElemento(e, { casas: [{ x: o.x, y: o.y }], elemento: a.elemento, deixa: false });
  const porNome = new Map();
  for (const ev of depois.eventos) for (const f of ev.alvos) porNome.set(f.nome, (porNome.get(f.nome) || 0) + f.dano);
  return {
    objeto: o.tipo, nome: def.nome, etiquetas: [...def.etiquetas],
    reacao: r ? r.tipo : null, casas: r ? casasEmVolta(e.grade, o.x, o.y, r.raio) : [],
    dano: r ? r.dano || 0 : 0, depois: r ? r.vira : o.tipo,
    eventos: depois.eventos, alvos: [...porNome].map(([nome, dano]) => ({ nome, dano })),
  };
}

/* OS PERIGOS DO CAMINHO: as casas de `casas` com chão que faz alguma coisa
   a quem entra — [{ x, y, tipo, dano, teste }] (o dano já pela resistência
   de `ent`; `teste`: { atributo, cd, falha, chance } ou null). Quem voa
   não tem perigo nenhum no chão. Lido por `caminhoComProvocacoes`
   (vez-na-mesa.js), para a linha do caminho acender o fogo antes do passo. */
export function perigosNoCaminho(superficies, casas, ent) {
  if (voa(ent)) return [];
  const mapa = mapaDe(superficies);
  const out = [];
  for (const c of lista(casas)) {
    if (!temPos(c)) continue;
    const s = mapa.get(chave(Number(c.x), Number(c.y)));
    if (!s) continue;
    const S = SUPERFICIES[s.tipo];
    const dano = danoNoCorpo(S.danoAoEntrar, S.elemento, ent);
    const teste = S.teste ? { ...S.teste, chance: chanceDoTeste(ent, S.teste) } : null;
    if (!dano && !teste) continue;
    out.push({ x: s.x, y: s.y, tipo: s.tipo, dano, teste });
  }
  return out;
}
