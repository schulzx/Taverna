/* ============================================================
   A SONDA DOS ATIRADORES (Fase MM · MM7) — o arqueiro no tabuleiro

   A PERGUNTA QUE ELA RESPONDE: o Atirador (e o Mago) passou a ficar no
   posto e disparar em vez de vir colar no herói. A luta ficou DIFERENTE —
   ou só mais difícil, ou mais fácil? Quanto dano o herói leva por luta,
   quantas lutas ganha, quantas rodadas dura?

   O MOLDE É O DE MM6 (`sonda-do-furtivo.mjs`): a régua de Uma Vida não tem
   tabuleiro (`TABULEIRO_NA_REGUA.temGrade` é `false`), e esta regra é toda
   de tabuleiro — distância, linha de visão, cobertura, quem está colado.
   Então a sonda monta a planta com as PEÇAS DE PRODUÇÃO e nenhuma regra
   nasce aqui:
     · a planta e o posicionamento: `montarGrade`, `posicionar`;
     · o passo de todo mundo: `moverInimigos` — a mesma que o App usa para
       os inimigos, para o grupo, e que aqui move também o herói;
     · o golpe: `resolverAtaque`, `danoDaClasse`, `turnoDosInimigos`,
       `turnoDosCompanheiros`;
     · o golpe de oportunidade no recuo: a conta que o App já faz em quem
       foge (`resolverRevide`, o bloco de `querFugir`), com o mesmo bônus e
       o mesmo dano — é a fiação que MM7 pede ao App, simulada como se
       estivesse ligada, para o número medir o jogo que vai ao ar.
   A sorte é a da régua (`comSorteTravada`): a mesma semente dá a mesma
   luta em qualquer máquina.

   O "ANTES" É O CÓDIGO DE ANTES, NÃO UMA IMITAÇÃO. `sondarAtiradores`
   aceita a raiz dos módulos; o retrato do antes foi medido com a árvore
   de `HEAD` antes de MM7 (`git archive`), pelas mesmas funções desta
   sonda. A suíte (`teste-mm7-atiradores.mjs`) mede só o depois, numa
   amostra menor, e compara com o retrato.

   O JOGADOR QUE ELA SIMULA é o Guerreiro da régua, e joga simples: vai ao
   inimigo mais perto e bate nele. Não procura cobertura nem caça o
   arqueiro de propósito — é o jogador que MENOS ganha com a mudança, e é
   por isso que é ele: se a luta não ficou muito mais dura para ele, não
   ficou para ninguém.
   ============================================================ */

import { comSorteTravada, CENARIOS_DA_REGUA } from "./regua-combate.mjs";

/* ---------------- AS TABELAS DA SONDA ---------------- */

/* As plantas: uma luta de cada lugar, em rodízio pela semente. */
export const PLANTAS_DOS_ATIRADORES = [
  { local: "taverna" }, { emMasmorra: true }, { local: "floresta" }, { local: "estrada" },
  { local: "cidade" }, { local: "caverna" }, { local: "ruina" },
];

/* As lutas. O herói e o grupo são os da régua (sem cópia); os inimigos são
   comuns de nível 5 do bestiário, pelo nome — é o nome que os faz
   atiradores. `dupla` é Uma Vida no começo (o herói sozinho, um de perto e
   um de longe); `conjurador` é a mesma com um Mago no lugar do Atirador;
   `bando` é o grupo contra dois de perto e dois de longe. */
export const LUTAS_DOS_ATIRADORES = {
  dupla: { grupo: false, inimigos: ["Soldado", "Atirador"] },
  conjurador: { grupo: false, inimigos: ["Soldado", "Mago"] },
  bando: { grupo: true, inimigos: ["Soldado", "Soldado", "Atirador", "Atirador"] },
};
export const AMOSTRA_DOS_ATIRADORES = { n: 140, prefixo: "mm7", tetoDeRodadas: 20, ameaca: "comum", nivel: 5 };

/* O RETRATO — medido a 140 lutas por cenário (sementes `mm7|0..139`), no
   dia em que a regra entrou (29/09/2026). `antes` com a árvore de HEAD
   (c06d904, v9.311), `depois` com MM7. `dano` é o dano que o HERÓI leva
   por luta; `danoGrupo` o que o grupo leva (só no `bando`); `vitoria` a
   fração das lutas ganhas; `rodadas` a média de rodadas. */
export const RETRATO_DOS_ATIRADORES = {
  n: 140,
  antes: {
    dupla:      { dano: 13.03, danoGrupo: 0,    vitoria: 0.993, rodadas: 4.98 },
    conjurador: { dano: 10.64, danoGrupo: 0,    vitoria: 1,     rodadas: 4.99 },
    bando:      { dano: 16.35, danoGrupo: 8.00, vitoria: 1,     rodadas: 4.37 },
  },
  depois: {
    dupla:      { dano: 11.57, danoGrupo: 0,    vitoria: 0.993, rodadas: 4.66 },
    conjurador: { dano: 12.01, danoGrupo: 0,    vitoria: 0.993, rodadas: 4.74 },
    bando:      { dano: 13.71, danoGrupo: 7.36, vitoria: 1,     rodadas: 4.00 },
  },
  /* o mesmo depois SEM o golpe de oportunidade no recuo — o jogo enquanto a
     fiação do App não chega. O conjurador passa do limite (+29%): é por
     isso que a fiação não é enfeite. */
  semOportunidade: {
    dupla:      { dano: 13.11 },
    conjurador: { dano: 13.76 },
    bando:      { dano: 16.02 },
  },
};
/* O LIMITE — a luta tem de ficar DIFERENTE, não mais dura nem mais mole:
   o dano no herói de cada cenário fica a menos de 20% do antes, para os
   dois lados. */
export const LIMITE_DOS_ATIRADORES = { variacao: 0.2 };

/* ---------------- OS MÓDULOS ----------------
   A raiz é argumento para o retrato do antes poder correr sobre a árvore
   de HEAD; por padrão é `src/`. */
export async function carregar(raiz = new URL("../src/", import.meta.url).href) {
  const r = raiz.endsWith("/") ? raiz : raiz + "/";
  const [combate, grid, companheiros, bestiario, condicoes, danos, itens, prontos, combos] = await Promise.all(
    ["combate", "grid", "companheiros", "bestiario", "condicoes", "danos", "itens", "prontos", "combos"].map((m) => import(r + m + ".js")));
  return { combate, grid, companheiros, bestiario, condicoes, danos, itens, prontos, combos };
}

/* ---------------- A MESA ---------------- */

function fichaDoHeroi(M) {
  const h = CENARIOS_DA_REGUA.duro.heroi;
  const vidaMax = M.combate.pvEsperadoJogador(h.nivel, h.vigor);
  const peca = (nome, tipo) => (nome ? { nome, tipo, ...(tipo === "arma" ? {} : { atributos: { defesa: M.prontos.DEFESA_DA_ARMADURA[nome] || 1 } }) } : null);
  const equipados = {};
  if (h.arma) equipados.arma = peca(h.arma, "arma");
  if (h.armadura) equipados.armadura = peca(h.armadura, "armadura");
  if (h.escudo) equipados.escudo = peca(h.escudo, "escudo");
  return {
    nome: h.nome, classe: h.classe, nivel: h.nivel, atributos: { ...h.atributos },
    vida: vidaMax, vidaMax, condicoes: [], efeitos: [], guardas: [], inventario: [], equipados,
  };
}

function fichasDoGrupo(M, comGrupo) {
  if (!comGrupo) return [];
  return CENARIOS_DA_REGUA.duro.grupo.map((g) => {
    const vidaMax = M.combate.pvEsperadoJogador(g.nivel, g.vigor);
    return M.companheiros.garantirFichaCompanheiro({
      nome: g.nome, classe: g.classe, nivel: g.nivel, atributos: { ...g.atributos },
      vida: vidaMax, vidaMax, condicoes: [], efeitos: [], guardas: [], inventario: [], equipados: {}, morrendo: false,
    });
  });
}

function fichasDosInimigos(M, nomes) {
  const { ameaca, nivel } = AMOSTRA_DOS_ATIRADORES;
  const conta = {};
  return nomes.map((base) => {
    conta[base] = (conta[base] || 0) + 1;
    const nome = nomes.filter((n) => n === base).length > 1 ? `${base} ${conta[base]}` : base;
    return { ...M.bestiario.completarInimigo({ nome, ameaca, nivel }, nivel), derrotado: false, condicoes: [] };
  });
}

/* ---------------- O PASSO DO HERÓI ----------------
   O jogador escolhe a casa, e a tela mostra-lhe por onde se chega: ele
   contorna o balcão. `moverInimigos` é gulosa em linha reta (o comentário
   dela o diz: "é guloso e basta") e prendia o herói atrás de uma parede
   com o arqueiro do outro lado — a sonda media um jogador que não existe.
   Aqui: o mapa de passos até o alvo (paredes só), e das casas que o passo
   de 9 m cobre (`custosDe`, a mesma busca da tela) fica a mais perto dele
   pelo caminho; no empate, a que custou menos. Sem regra nova: é só a
   escolha de casa que um jogador faz com o tabuleiro à frente. */
function passoDoHeroi(G, grade, lugar, alvo, outros) {
  if (!alvo || G.distanciaM(lugar, alvo) <= G.alcanceNatural(lugar)) return lugar;
  const g = G.garantirGrade(grade);
  if (!g) return lugar;
  const k = (x, y) => x + "," + y;
  const passos = new Map();
  let fila = [];
  for (let x = 0; x < g.largura; x++) for (let y = 0; y < g.altura; y++) {
    if (G.ehParede(grade, x, y)) continue;
    if (G.distanciaM({ ...lugar, x, y }, alvo) <= G.alcanceNatural(lugar)) { passos.set(k(x, y), 0); fila.push({ x, y }); }
  }
  while (fila.length) {
    const prox = [];
    for (const a of fila) for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const nx = a.x + dx, ny = a.y + dy;
      if ((!dx && !dy) || !G.dentro(grade, nx, ny) || G.ehParede(grade, nx, ny) || passos.has(k(nx, ny))) continue;
      passos.set(k(nx, ny), passos.get(k(a.x, a.y)) + 1);
      prox.push({ x: nx, y: ny });
    }
    fila = prox;
  }
  const custos = G.custosDe(grade, lugar, { ocupados: G.ocupacaoDe(outros, lugar) });
  let melhor = null;
  for (const [chave, custoM] of custos) {
    const p = passos.get(chave);
    if (p == null) continue;
    if (!melhor || p < melhor.p || (p === melhor.p && custoM < melhor.c)) melhor = { chave, p, c: custoM };
  }
  const aqui = passos.get(k(lugar.x, lugar.y));
  if (!melhor || (aqui != null && aqui <= melhor.p)) return lugar;
  const [x, y] = melhor.chave.split(",").map(Number);
  return { ...lugar, x, y };
}

/* ---------------- UMA LUTA ---------------- */

/* `comOportunidade`: o recuo cobra o golpe do herói (a fiação que MM7 pede
   ao App). Desligado, mede o jogo como fica ENQUANTO a fiação não chega. */
export function lutaDosAtiradores(M, cenarioId, semente, { comOportunidade = true } = {}) {
  const cen = LUTAS_DOS_ATIRADORES[cenarioId];
  const { combate: C, grid: G } = M;
  const planta = PLANTAS_DOS_ATIRADORES[Math.abs(Number(String(semente).split("|").pop()) || 0) % PLANTAS_DOS_ATIRADORES.length];
  return comSorteTravada(`${semente}|${cenarioId}`, () => {
    const grade = G.montarGrade(planta);
    let heroi = fichaDoHeroi(M);
    let grupo = fichasDoGrupo(M, cen.grupo);
    const pos = G.posicionar(grade, {
      heroi: { nome: heroi.nome, tamanho: "medio" },
      grupo: grupo.map((c) => ({ nome: c.nome, vida: c.vida, tamanho: "medio" })),
      inimigos: fichasDosInimigos(M, cen.inimigos),
    });
    let lugar = pos.heroi;
    let aliados = pos.grupo;
    let inimigos = pos.inimigos;
    const vivos = () => inimigos.filter((e) => !e.derrotado && (e.vida || 0) > 0);
    const ferir = (nome, dano) => {
      inimigos = inimigos.map((e) => (e.nome !== nome ? e : { ...e, vida: Math.max(0, e.vida - dano), derrotado: e.vida - dano <= 0 }));
    };
    let danoNoHeroi = 0, danoNoGrupo = 0, recuos = 0, oportunidades = 0, disparos = 0, disparosColados = 0, rodada = 1;
    const nv = heroi.nivel;
    const arma = heroi.equipados.arma;
    const bonusAtk = M.itens.modDoGolpe(heroi, arma) + 2 + Math.floor((nv - 1) / 4);
    for (; rodada <= AMOSTRA_DOS_ATIRADORES.tetoDeRodadas; rodada++) {
      if (!vivos().length) break;
      /* ---- 1. O HERÓI: vai ao mais perto e bate ---- */
      if ((heroi.vida || 0) > 0) {
        const alvo0 = [...vivos()].sort((a, b) => G.distanciaM(a, lugar) - G.distanciaM(b, lugar))[0];
        lugar = passoDoHeroi(G, grade, lugar, alvo0, [...aliados, ...vivos()]);
        const nAt = C.ataquesPorTurno(heroi.classe, nv);
        for (let i = 0; i < nAt; i++) {
          const perto = vivos().filter((e) => G.distanciaM(lugar, e) <= G.alcanceNatural(lugar))
            .sort((a, b) => (a.vida || 0) - (b.vida || 0));
          if (!perto.length) break;
          const alvo = perto[0];
          const r = C.resolverAtaque({
            atacante: heroi.nome, alvo, ehAtacanteInimigo: false, bonusAtaque: bonusAtk,
            danoBase: C.danoDaClasse(heroi.classe, nv, Math.round(C.danoDe(heroi, false) / 2)),
            condAtacante: heroi.condicoes, condAlvo: alvo.condicoes || [],
            tipoDano: M.danos.elementoDaArma(heroi), perfilAlvo: M.danos.perfilDe(alvo),
          });
          if (r.dano > 0) ferir(alvo.nome, r.dano);
        }
      }
      if (!vivos().length) break;
      /* ---- 2. OS INIMIGOS: andam (o recuo provoca), e golpeiam ---- */
      const mv = G.moverInimigos(grade, inimigos, lugar, [lugar, ...aliados]);
      inimigos = mv.inimigos;
      for (const m of mv.movimentos) {
        if (m.recua) recuos++;
        if (!comOportunidade || !m.provoca || (heroi.vida || 0) <= 0) continue;
        const e = inimigos.find((x) => x.nome === m.nome);
        if (!e || e.derrotado) continue;
        /* a conta do App (resolverRevide, o golpe em quem foge) */
        const bonusOp = Math.max(heroi.atributos.forca || 0, heroi.atributos.destreza || 0) + 2 + Math.floor((nv - 1) / 4);
        const dOp = C.danoDaClasse(heroi.classe, nv, Math.round(C.danoDe(heroi, false) / 2)) + M.combos.bonusDeArma(heroi).bonus;
        const r = C.ataqueDeOportunidade(heroi, e, bonusOp, dOp, { tipoDano: M.danos.elementoDaArma(heroi) });
        oportunidades++;
        if (r.dano > 0) ferir(e.nome, r.dano);
      }
      if (!vivos().length) break;
      const grupoDePe = grupo.filter((g) => (g.vida || 0) > 0);
      const acoes = C.turnoDosInimigos({
        inimigos: vivos(), jogador: heroi, grupo: grupoDePe.length ? grupo : [],
        gdJogador: 0, grade, heroi: lugar, aliados, rodada, provocado: false, prioridade: "",
      });
      for (const a of acoes) {
        if (a.deLonge) { disparos++; if (a.r && a.r.modo === "desvantagem") disparosColados++; }
        if (!(a.r && a.r.dano > 0)) continue;
        if (a.alvoRef === "jogador") { heroi = { ...heroi, vida: Math.max(0, (heroi.vida || 0) - a.r.dano) }; danoNoHeroi += a.r.dano; }
        else if (a.alvoRef === "grupo") { grupo = grupo.map((g) => (g.nome === a.alvoNome ? { ...g, vida: Math.max(0, (g.vida || 0) - a.r.dano) } : g)); danoNoGrupo += a.r.dano; }
      }
      /* ---- 3. O GRUPO: anda para o inimigo mais perto do herói, e age ---- */
      if (grupo.length) {
        const alvoDeles = [...vivos()].sort((a, b) => G.distanciaM(a, lugar) - G.distanciaM(b, lugar))[0];
        if (alvoDeles) {
          const vivosAli = aliados.map((a, i) => ({ ...a, vida: (grupo[i] || {}).vida || 0, i }));
          const mvA = G.moverInimigos(grade, vivosAli, alvoDeles, [lugar, ...vivos()]);
          aliados = mvA.inimigos.map(({ vida, i, ...resto }) => resto);
        }
        const acoesComp = C.turnoDosCompanheiros({
          grupo: grupo.filter((g) => (g.vida || 0) > 0), inimigos: vivos(),
          jogadorCaido: (heroi.vida || 0) <= 0, jogadorNome: heroi.nome, jogador: heroi, rodada, provocado: false, comFuria: [],
        });
        for (const ac of acoesComp) {
          if ((ac.tipo === "ataque" || ac.tipo === "habilidade") && ac.r && ac.r.dano > 0) ferir(ac.alvoNome, ac.r.dano);
          else if (ac.tipo === "cura") {
            const valor = ac.valor || 0;
            if (ac.alvo === heroi.nome) heroi = { ...heroi, vida: Math.min(heroi.vidaMax, Math.max(0, heroi.vida) + valor) };
            else grupo = grupo.map((g) => (g.nome === ac.alvo ? { ...g, vida: Math.min(g.vidaMax, Math.max(0, g.vida) + valor) } : g));
          }
          if (ac.custo) grupo = grupo.map((g) => (g.nome === ac.companheiro ? { ...g, mana: Math.max(0, (g.mana || 0) - ac.custo) } : g));
        }
      }
      /* ---- 4. O RELÓGIO ---- */
      if ((heroi.condicoes || []).length) heroi = { ...heroi, condicoes: M.condicoes.tickCondicoes(heroi.condicoes).condicoes };
      if (!vivos().length) break;
      if ((heroi.vida || 0) <= 0 && !grupo.some((g) => (g.vida || 0) > 0)) break;
    }
    return {
      danoNoHeroi, danoNoGrupo, vitoria: vivos().length ? 0 : 1,
      rodadas: Math.min(rodada, AMOSTRA_DOS_ATIRADORES.tetoDeRodadas),
      recuos, oportunidades, disparos, disparosColados,
    };
  });
}

/* ---------------- A MEDIDA ---------------- */
export function sondarAtiradores(M, { n = AMOSTRA_DOS_ATIRADORES.n, prefixo = AMOSTRA_DOS_ATIRADORES.prefixo, cenarios = Object.keys(LUTAS_DOS_ATIRADORES), comOportunidade = true } = {}) {
  const out = {};
  for (const c of cenarios) {
    const soma = { dano: 0, danoGrupo: 0, vitoria: 0, rodadas: 0, recuos: 0, oportunidades: 0, disparos: 0, disparosColados: 0 };
    for (let i = 0; i < n; i++) {
      const r = lutaDosAtiradores(M, c, `${prefixo}|${i}`, { comOportunidade });
      soma.dano += r.danoNoHeroi; soma.danoGrupo += r.danoNoGrupo; soma.vitoria += r.vitoria; soma.rodadas += r.rodadas;
      soma.recuos += r.recuos; soma.oportunidades += r.oportunidades; soma.disparos += r.disparos; soma.disparosColados += r.disparosColados;
    }
    out[c] = Object.fromEntries(Object.entries(soma).map(([k, v]) => [k, v / n]));
  }
  return out;
}

/* rodado direto: `node sonda-dos-atiradores.mjs [raiz-dos-modulos]` */
if (process.argv[1] && process.argv[1].endsWith("sonda-dos-atiradores.mjs")) {
  const t0 = Date.now();
  const raiz = process.argv[2] ? new URL("file:///" + process.argv[2].replace(/\\/g, "/").replace(/^\/+/, "") + "/").href : undefined;
  const M = await carregar(raiz);
  const m = sondarAtiradores(M);
  for (const [c, x] of Object.entries(m)) {
    console.log(`${c.padEnd(11)} dano no herói ${x.dano.toFixed(2).padStart(6)} · no grupo ${x.danoGrupo.toFixed(2).padStart(6)} · vitória ${(x.vitoria * 100).toFixed(1)}% · rodadas ${x.rodadas.toFixed(2)} · disparos ${x.disparos.toFixed(2)} (colados ${x.disparosColados.toFixed(2)}) · recuos ${x.recuos.toFixed(2)} · oportunidades ${x.oportunidades.toFixed(2)}`);
  }
  console.log(`(${Date.now() - t0} ms)`);
}
