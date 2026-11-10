/* ============================================================
   O TURNO DELES, CONTADO (CB12 — Fase CB, lote 2, 10/11/2026)

   A pessoa jogou e o turno dos inimigos era uma RAJADA: entre um clique e o
   estado seguinte, todos agiam de uma vez, e o único rasto era um número
   que subia (mente/plano-combate-e-viagem.md §2.1: «o Bandido 3 agiu e não
   deixou rasto nenhum na tela»). BG3 e XCOM contam o turno deles em passos:
   quem age, por onde anda, em quem bate, e o dado. formas.md §CB 17.2 pôs a
   forma; este módulo dá os dados, e só os dados (a frase é da tela,
   `FRASE_DO_PASSO`).

   O ESTADO NÃO ESPERA PELA ANIMAÇÃO. A rajada aplica-se como hoje, por
   inteiro, antes do primeiro passo; `passosDoTurno` lê o que JÁ aconteceu
   (as ações de `turnoDosInimigos` depois de o App lhes aplicar a reação e o
   abrigo, os movimentos, as fugas, o turno do grupo) e devolve-o arrumado
   por quem age. Não rola nada, não decide nada: o resultado é o de hoje,
   byte a byte, e a suíte prova-o (a vida de cada um no fim dos passos é a
   vida que a rajada deixou).

   A ORDEM É A EM QUE O MOTOR JOGOU: quem fugiu (a fuga corre antes de tudo,
   `resolverRevide`), depois cada inimigo pela ordem da lista da luta (a de
   `turnoDosInimigos`), depois o grupo pela ordem do grupo. É também a ordem
   de `filaDaRodada` (vez-na-mesa.js). Não é a da iniciativa rolada — o motor
   não a segue dentro da rodada (tela-de-batalha.js#faixaDaVez), e passos por
   outra ordem contariam golpes com uma vida «antes» que já não era a dele.

   CADA PASSO (formas.md §CB 17.5):
     { quem, lado ("inimigo"|"aliado"), tipo ("atacar"|"sopro"|"aproximar"|
       "fugir"|"nada", e no aliado "curar"|"proteger"), de, para, caminho
       (inclui de e para; [] se não andou), metros, golpes: [{ alvo,
       alvoOnde, dado: { natural, dados, bonus, total, defesa, modo } | null,
       acertam, salvam (as faces do d20 que acertam e as que salvam quem leva
       — §CB 17.8: o d20 que pode derrubar o herói rola com as faces que o
       salvam acesas), abateAnunciado (a chance de abate que a intenção
       anunciou sobre esse alvo, ou null), evento (eventoDoGolpe) }], area,
       intencao ("cumprida" | um valor de RECURSO_DA_INTENCAO | null), emTi }

   E O TEMPO: `duracaoDosPassos` é a regra dos 4 s (formas.md §CB 17.2): a
   soma dos passos, e se passar o teto, cada passo encolhe por igual até ao
   piso; se nem assim, quem só anda anda junto; e no teto o resto pousa de
   uma vez. Os números moram em `TURNO_DELES` (estilo.js, do `aprendiz`) e
   entram por argumento; a duração do golpe é a do golpe sentido
   (`somaDoGolpe`, batalha-na-tela.js).

   O GOLPE DA HABILIDADE NA MESA (o resto do lote 1): `golpeDaHabilidade` dá,
   para o golpe de uma habilidade, o que o golpe de arma já dava — o d20 na
   bandeja (`lancamentoDoAtaque`) e o evento do golpe — e um evento por cada
   corpo que a área ou a gémea apanharam com o mesmo dano.
   ============================================================ */
import { eventoDoGolpe, RECURSO_DA_INTENCAO } from "./combate.js";
import { facesQueAcertam } from "./previsao.js";
import { caminhar, ocupacaoDe, distanciaM } from "./grid.js";
import { lancamentoDoAtaque } from "./motor/a-bandeja.js";
import { somaDoGolpe, variacaoDoGolpe } from "./batalha-na-tela.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const lista = (x) => (Array.isArray(x) ? x : []);
const fin = (x) => x !== null && x !== "" && typeof x !== "boolean" && Number.isFinite(Number(x));
const casa = (e) => (obj(e) && fin(e.x) && fin(e.y) ? { x: Number(e.x), y: Number(e.y) } : null);
const FACES = Array.from({ length: 20 }, (_, i) => i + 1);

/* o que o aliado fez, na língua dos passos */
export const TIPO_DO_ALIADO = Object.freeze({ ataque: "atacar", habilidade: "atacar", cura: "curar", pocao: "curar", buff: "proteger", guarda: "proteger" });

/* o d20 de um golpe, separado do total (o que o dado pousa no alvo) */
function dadoDe(r) {
  const x = obj(r);
  if (!x || x.tipo === "impedido" || !fin(x.d20) || Number(x.d20) < 1 || Number(x.d20) > 20) return null;
  return { natural: Number(x.d20), dados: lista(x.dados).map(Number), bonus: Number(x.bonus) || 0, total: fin(x.total) ? Number(x.total) : null, defesa: fin(x.ca) ? Number(x.ca) : null, modo: x.modo || null };
}

/* o caminho de quem andou: a busca do passo (`caminhar`, sem teto — já andou),
   com quem estava na mesa a ocupar; sem grade, ou sem caminho achado, a reta */
function caminhoDe(grade, ent, para, todos) {
  const de = casa(ent);
  if (!de || !para || (de.x === para.x && de.y === para.y)) return { caminho: [], metros: 0 };
  if (grade) {
    try {
      const ocupados = ocupacaoDe(lista(todos).filter((e) => e && e.nome !== ent.nome), null);
      const chk = caminhar(grade, ent, para, { ocupados, deslocamentoM: 999 });
      if (chk.ok) return { caminho: [de, ...chk.caminho.map((q) => ({ x: q.x, y: q.y }))], metros: chk.custoM };
    } catch { /* a reta */ }
  }
  return { caminho: [de, para], metros: distanciaM(de, para) };
}

/* ============================================================
   passosDoTurno(acoes, ctx)
   `acoes`: o que `turnoDosInimigos` devolveu, DEPOIS de o App lhe aplicar a
     reação e o abrigo (é `a.r.dano` que diz o que chegou ao corpo).
   `ctx`: {
     antes, depois — os inimigos da luta antes e depois do passo deles
                     (`combPos.inimigos` à entrada e depois de `moverInimigos`);
     aliadosAntes, aliadosDepois — as casas do grupo (`combate.aliados`);
     grade, heroi (o nome do herói),
     fugas — [{ nome, r, morreu }]: quem anunciou fugir, com o golpe livre do
             herói (`golpeDeOportunidadeDoHeroi`);
     intencoes — a lista anunciada (`combate.intencoes.lista`);
     vidas, vidaMax — { nome: n } de todos à entrada da vez deles;
     companheiros — o que `turnoDosCompanheiros` devolveu (opcional) }.
   ============================================================ */
export function passosDoTurno(acoes, ctx) {
  const c = obj(ctx) || {};
  const as = lista(acoes).filter(obj);
  const antes = lista(c.antes).filter(obj), depois = lista(c.depois).filter(obj);
  const alAntes = lista(c.aliadosAntes).filter(obj), alDepois = lista(c.aliadosDepois).filter(obj);
  const ints = lista(c.intencoes).filter(obj);
  const vida = { ...(obj(c.vidas) || {}) };
  const vidaMax = obj(c.vidaMax) || {};
  const heroi = typeof c.heroi === "string" ? c.heroi : "";
  const todos = [...antes, ...alAntes];
  const golpeDe = (a, quem, lado) => {
    const r = a.r;
    const alvo = String(a.alvoNome || (r && r.alvo) || "");
    const vAntes = fin(vida[alvo]) ? Number(vida[alvo]) : null;
    const dano = Math.max(0, Number(r && r.dano) || 0);
    if (vAntes != null) vida[alvo] = Math.max(0, vAntes - dano);
    const dado = dadoDe(r);
    const acertam = dado ? facesQueAcertam(dado.bonus, dado.defesa, 20) : [];
    const it = ints.find((x) => x.inimigo === quem);
    const anunciou = it && obj(it.vista) && it.vista.alvo === alvo && fin(it.vista.abate) ? Number(it.vista.abate) : null;
    return {
      alvo, alvoOnde: casa(a.alvoOnde),
      dado, acertam, salvam: dado ? FACES.filter((f) => !acertam.includes(f)) : [],
      abateAnunciado: anunciou,
      evento: eventoDoGolpe(r, { vidaAntes: vAntes, vidaMax: vidaMax[alvo], lado, golpeNome: a.golpeNome || "" }),
    };
  };
  const passos = [];

  /* 1. quem fugiu: o golpe livre é do herói, e conta-se no passo de quem foge */
  for (const f of lista(c.fugas).filter(obj)) {
    const ent = antes.find((e) => e.nome === f.nome) || {};
    const golpes = f.r ? [golpeDe({ r: f.r, alvoNome: f.nome, alvoOnde: casa(ent) }, f.nome, "heroi")] : [];
    passos.push({ quem: String(f.nome), lado: "inimigo", tipo: "fugir", de: casa(ent), para: null, caminho: [], metros: 0, golpes, area: null, intencao: null, emTi: false });
  }
  const fugiram = new Set(passos.map((p) => p.quem));

  /* 2. cada inimigo, pela ordem da lista da luta */
  for (const ent of antes) {
    if (fugiram.has(ent.nome)) continue;
    const meus = as.filter((a) => a.inimigo === ent.nome && !a.perdido);
    const dep = depois.find((e) => e.nome === ent.nome);
    const para = casa(dep) || casa(ent);
    const anda = caminhoDe(c.grade || null, ent, para, todos);
    const it = ints.find((x) => x.inimigo === ent.nome) || null;
    if (!meus.length && !anda.caminho.length && !it) continue;
    const golpes = meus.map((a) => golpeDe(a, ent.nome, a.virado ? "aliado" : "inimigo"));
    const recursos = meus.map((a) => a.intencao).filter((x) => x && x !== "cumprida");
    const tipo = it ? it.tipo : meus.length ? "atacar" : anda.caminho.length ? "aproximar" : "nada";
    const intencao = !it ? null
      : it.tipo === "sopro" && !meus.length ? RECURSO_DA_INTENCAO.soproVazio
        : recursos.length ? (RECURSO_DA_INTENCAO[recursos[0]] || recursos[0])
          : it.tipo === "aproximar" ? RECURSO_DA_INTENCAO.aproximar
            : meus.length ? "cumprida" : null;
    passos.push({
      quem: String(ent.nome), lado: "inimigo", tipo,
      de: casa(ent), para: anda.caminho.length ? para : casa(ent), caminho: anda.caminho, metros: anda.metros,
      golpes, area: it && Array.isArray(it.area) ? it.area.map((q) => ({ x: q.x, y: q.y })) : null,
      intencao, emTi: !!heroi && golpes.some((g) => g.alvo === heroi),
      /* caiu antes da vez dele (o golpe livre de quem recuou para disparar) */
      ...(!meus.length && dep && (dep.derrotado || Number(dep.vida) <= 0) ? { caiu: true } : {}),
    });
  }

  /* 3. o grupo, pela ordem do grupo (o que `turnoDosCompanheiros` fez) */
  const comps = lista(c.companheiros).filter(obj);
  const nomesDoGrupo = [...new Set([...alAntes.map((a) => a.nome), ...comps.map((a) => a.companheiro)].filter(Boolean))];
  for (const nome of nomesDoGrupo) {
    const ent = alAntes.find((a) => a.nome === nome) || { nome };
    const para = casa(alDepois.find((a) => a.nome === nome)) || casa(ent);
    const anda = caminhoDe(c.grade || null, ent, para, todos);
    const feitos = comps.filter((a) => a.companheiro === nome);
    if (!feitos.length && !anda.caminho.length) continue;
    const golpes = [];
    for (const a of feitos) {
      if ((a.tipo === "ataque" || a.tipo === "habilidade") && a.r) golpes.push(golpeDe({ r: a.r, alvoNome: a.alvoNome, golpeNome: a.habilidade ? a.habilidade.nome : "" }, nome, "aliado"));
      if (a.tipo === "cura" && a.alvo && fin(vida[a.alvo])) vida[a.alvo] = Math.min(fin(vidaMax[a.alvo]) ? Number(vidaMax[a.alvo]) : Infinity, Number(vida[a.alvo]) + (Number(a.valor) || 0));
    }
    const primeiro = feitos[0];
    passos.push({
      quem: String(nome), lado: "aliado", tipo: primeiro ? (TIPO_DO_ALIADO[primeiro.tipo] || "nada") : "aproximar",
      de: casa(ent), para: anda.caminho.length ? para : casa(ent), caminho: anda.caminho, metros: anda.metros,
      golpes, area: null, intencao: null, emTi: false,
      ...(primeiro && primeiro.tipo === "cura" ? { cura: { alvo: primeiro.alvo, valor: Number(primeiro.valor) || 0 } } : {}),
    });
  }
  return passos;
}

/* ============================================================
   duracaoDosPassos(passos, { velocidade, reduzido, tabela })
   `tabela`: TURNO_DELES (formas.md §CB 17.3 — teto, pisoDoPasso, realce,
   porCasa, andarTeto, soproPinta, respiro, fim, acelerado, reduzido.passo).
   `velocidade`: 1 ou 2 (o 2× corta tudo a metade, o teto incluído).
   Devolve { total, fator (o encolher por igual, 1 sem encolher), juntos
   (houve quem só andava a andar junto), pousaDesde (o índice a partir do
   qual o resto pousa de uma vez, ou null), passos: [{ i: [índices], ms }] }.
   Sem tabela, null (a tela cala a conta e pousa tudo).
   ============================================================ */
const soAnda = (p) => obj(p) && !lista(p.golpes).length && !obj(p.cura) && lista(p.caminho).length > 0 && (p.tipo === "aproximar" || p.tipo === "nada");
function golpeMs(g) {
  const v = variacaoDoGolpe(obj(g) && g.evento);
  return v ? (Number(v.soma) || 0) : (somaDoGolpe("acerto") || 0);
}
export function duracaoDosPassos(passos, o) {
  const c = obj(o) || {};
  const T = obj(c.tabela);
  if (!T) return null;
  const ps = lista(passos).filter(obj);
  const k = Number(c.velocidade) === 2 ? (fin(T.acelerado) ? Number(T.acelerado) : 0.5) : 1;
  const teto = Number(T.teto) * k, piso = Number(T.pisoDoPasso) * k, fim = (Number(T.fim) || 0) * k;
  const bruto = (p) => {
    if (c.reduzido === true) return Number(obj(T.reduzido) && T.reduzido.passo) || 0;
    const casas = Math.max(0, lista(p.caminho).length - 1);
    const andar = Math.min(Number(T.andarTeto) || 0, (Number(T.porCasa) || 0) * casas);
    const gs = lista(p.golpes);
    const golpe = p.tipo === "sopro" ? (Number(T.soproPinta) || 0) + (gs.length ? Math.max(...gs.map(golpeMs)) : 0) : gs.reduce((s, g) => s + golpeMs(g), 0);
    return (Number(T.realce) || 0) + andar + golpe + (Number(T.respiro) || 0);
  };
  let grupos = ps.map((p, i) => ({ i: [i], ms: bruto(p) * k }));
  const soma = (gs) => gs.reduce((s, g) => s + g.ms, 0);
  let fator = 1, juntos = false, pousaDesde = null;
  if (soma(grupos) + fim > teto) {
    /* (a) encolher por igual, até ao piso */
    fator = Math.max(0, (teto - fim) / soma(grupos));
    grupos = grupos.map((g) => ({ ...g, ms: Math.max(piso, g.ms * fator) }));
    /* (b) quem só anda anda junto (os que só andam, seguidos, num passo só) */
    if (soma(grupos) + fim > teto) {
      const novos = [];
      for (const g of grupos) {
        const ult = novos[novos.length - 1];
        if (ult && soAnda(ps[g.i[0]]) && soAnda(ps[ult.i[ult.i.length - 1]])) { ult.i.push(...g.i); ult.ms = Math.max(ult.ms, g.ms); juntos = true; }
        else novos.push({ i: [...g.i], ms: g.ms });
      }
      grupos = novos;
    }
    /* (c) no teto, o resto pousa de uma vez */
    if (soma(grupos) + fim > teto) {
      let acc = 0, corte = grupos.length;
      for (let j = 0; j < grupos.length; j++) { if (acc + grupos[j].ms + fim > teto) { corte = j; break; } acc += grupos[j].ms; }
      if (corte < grupos.length) {
        pousaDesde = grupos[corte].i[0];
        grupos = [...grupos.slice(0, corte), { i: grupos.slice(corte).flatMap((g) => g.i), ms: 0, pousa: true }];
      }
    }
  }
  grupos = grupos.map((g) => ({ ...g, ms: Math.floor(g.ms) }))   /* 10/11: floor, não round — arredondar cada grupo para cima fazia a soma passar o teto por 1–4 ms (check-turno-deles: 492 de 9000) */;
  return { total: Math.round(soma(grupos) + fim), fator: Math.round(fator * 1000) / 1000, juntos, pousaDesde, passos: grupos };
}

/* ============================================================
   golpeDaHabilidade(r, ctx) — o golpe da habilidade na mesa
   `r`: o resultado de `resolverAtaque` do golpe da habilidade; `ctx`: {
   habilidade (o nome, para o rótulo do dado e o nome do golpe), criticoEm
   (`criticoMinimo` do herói), vidaAntes, vidaMax (do alvo), atingidos
   ([{ nome, vidaAntes, vidaMax }]: quem a área ou a gémea apanharam, com o
   MESMO dano — o App aplica r.dano a cada um) }.
   Devolve { lancamento (para `aBandeja`, ou null se o golpe nem rolou),
   eventos: [o do alvo, e um por atingido, com `area: true`] }.
   ============================================================ */
export function golpeDaHabilidade(r, ctx) {
  const x = obj(r);
  if (!x) return null;
  const c = obj(ctx) || {};
  const nome = typeof c.habilidade === "string" ? c.habilidade : obj(c.habilidade) && c.habilidade.nome ? String(c.habilidade.nome) : "";
  let lanc = null;
  try { lanc = lancamentoDoAtaque(x, { criticoEm: c.criticoEm, rotulo: nome ? `${nome}${x.alvo ? ` → ${x.alvo}` : ""}` : undefined }); } catch { lanc = null; }
  const principal = eventoDoGolpe(x, { vidaAntes: c.vidaAntes, vidaMax: c.vidaMax, lado: "heroi", golpeNome: nome });
  const outros = lista(c.atingidos).filter((a) => obj(a) && a.nome && a.nome !== x.alvo)
    .map((a) => ({ ...eventoDoGolpe({ ...x, alvo: a.nome }, { vidaAntes: a.vidaAntes, vidaMax: a.vidaMax, lado: "heroi", golpeNome: nome }), area: true }));
  return { lancamento: lanc, eventos: [principal, ...outros].filter(Boolean) };
}
