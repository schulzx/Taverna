/* ============================================================
   A SONDA DO FURTIVO (Fase MM · MM6) — o Ladino no tabuleiro

   A PERGUNTA QUE ELA RESPONDE: o Ataque Furtivo era "sempre, por classe";
   passou a ser a regra do 5e (vantagem OU aliado colado no alvo, e
   nenhuma desvantagem). Em quantos golpes ele continua a somar, e quanto
   dano por luta o Ladino perde? E, com a Ação Ardilosa (esconder-se como
   ação bônus), quanto ele recupera?

   POR QUE NÃO É A RÉGUA DE UMA VIDA (`regua-combate.mjs`). A régua não tem
   tabuleiro — `TABULEIRO_NA_REGUA.temGrade` é `false`, e ela o confessa —,
   e as duas portas da regra nova são de TABULEIRO: o aliado "colado no
   alvo" é distância, e esconder-se exige cobertura ou nenhuma linha de
   visão. Medir o furtivo sem grade daria 0% de aliado por construção.

   ENTÃO ESTA SONDA MONTA O TABULEIRO COM AS PEÇAS DE PRODUÇÃO — nenhuma
   regra nasce aqui:
     · a planta e o posicionamento: `montarGrade`, `posicionar` (grid.js);
     · o passo de todo mundo: `moverInimigos` (grid.js), a mesma função que
       o App usa para os inimigos E para os companheiros (App, a vez do
       mundo: os inimigos andam para o herói; o grupo anda para o inimigo
       mais perto do herói);
     · o golpe: `resolverAtaque`, `danoDaClasse`, `vereditoDoFurtivo`;
     · os inimigos e o grupo: `turnoDosInimigos` (com grade) e
       `turnoDosCompanheiros`;
     · esconder-se: `nascerEscondido`, `oculto`, `revisarEscondido`
       (escondido.js), com a furtividade de `bonusDePericia`.
   A sorte é a da régua (`comSorteTravada`): a mesma semente dá a mesma
   luta em qualquer máquina.

   O QUE ELA SIMPLIFICA, E DIZ: o grupo não lança buff nem ergue guarda
   (só bate e cura); ninguém usa abrigo; o herói caído não rola a morte
   (fica caído até alguém o curar). Os três valem igual para os três
   modos — o que a sonda compara é a REGRA do furtivo, e a diferença entre
   modos não depende de nenhum deles.

   O JOGADOR QUE ELA SIMULA joga bem, e igual nos três modos: vai ao
   inimigo que já tem um aliado colado (se houver), e entre as casas
   coladas no alvo prefere a que tem cobertura. É o Ladino que a regra
   pede — "esconde-se, flanqueia" — e é o mesmo nos três modos, para que
   a posição não seja a diferença.
   ============================================================ */

import { resolverAtaque, danoDe, danoDaClasse, vereditoDoFurtivo, turnoDosInimigos, turnoDosCompanheiros, pvEsperadoJogador } from "../src/combate.js";
import { montarGrade, posicionar, moverInimigos, distanciaM, caminhar, ocupacaoDe, temCobertura, alcanceNatural, DESLOCAMENTO_PADRAO, m2q } from "../src/grid.js";
import { garantirFichaCompanheiro } from "../src/companheiros.js";
import { completarInimigo } from "../src/bestiario.js";
import { tickCondicoes } from "../src/condicoes.js";
import { elementoDaArma, perfilDe } from "../src/danos.js";
import { modDoGolpe } from "../src/itens.js";
import { DEFESA_DA_ARMADURA } from "../src/prontos.js";
import { bonusDePericia } from "../src/pericias.js";
import { nascerEscondido, oculto, revisarEscondido, estadoEscondido, custoDeEsconder } from "../src/escondido.js";
import { CENARIOS_DA_REGUA, comSorteTravada } from "./regua-combate.mjs";

/* ---------------- AS TABELAS DA SONDA ---------------- */

/* O Ladino é o pronto "A Sombra" (prontos.js: Adaga, Gibão de Couro,
   furtividade de ladrão) levado ao nível 5 da régua, com a Destreza no 3
   pelo mesmo degrau que o Guerreiro da régua tem a Força no 3. O grupo e
   os inimigos são os da régua, sem cópia. */
export const LADINO_DA_SONDA = {
  nome: "Sombra", classe: "Ladino", nivel: 5,
  atributos: { forca: 1, destreza: 3, vigor: 3, intelecto: 0, presenca: 0, percepcao: 2 },
  vigor: 3, arma: "Adaga", armadura: "Gibão de Couro",
  pericias: { treinadas: ["furtividade"], especialistas: [] },
};

/* As plantas: uma luta de cada lugar, em rodízio pela semente. Os textos
   são os que `cenarioDe` lê; a masmorra entra pela porta dela. */
export const PLANTAS_DA_SONDA = [
  { local: "taverna" }, { emMasmorra: true }, { local: "floresta" }, { local: "estrada" },
  { local: "cidade" }, { local: "caverna" }, { local: "ruina" },
];

/* Os três modos. `antes` é o jogo até MM6 (furtivo sempre); `regra` é a
   regra do 5e sem se esconder; `ardilosa` é a regra com a Ação Ardilosa. */
export const MODOS_DA_SONDA = ["antes", "regra", "ardilosa"];

/* As lutas: o `justo` da régua (4 elites nível 6) no molde histórico
   (sem Adversário — com ele o `justo` está no piso, e a régua já diz
   porquê), o `brando` (3 comuns nível 5) e um terceiro que a régua não
   tem e que esta regra precisa: o Ladino SOZINHO. Uma Vida começa sem
   grupo, e sem aliado a única porta do furtivo é a vantagem — é o caso em
   que a regra morde, e medir só com grupo esconderia exatamente ele. Dois
   comuns de nível 5 contra um herói de nível 5 é a luta que um só aguenta. */
export const SOZINHO_DA_SONDA = {
  id: "sozinho", grupo: [],
  inimigos: { quantos: 2, ameaca: "comum", nivel: 5, base: "Adversário" },
};
export const LUTAS_DA_SONDA = { cenarios: ["justo", "brando", "sozinho"], n: 140, prefixo: "mm6", tetoDeRodadas: 20 };
/* O RETRATO — o que a sonda mediu a 140 lutas por cenário e modo
   (sementes `mm6|0..139`), no dia em que a regra entrou (29/09/2026).
   `furtivo` é a fração dos golpes do Ladino em que o furtivo somou;
   `queda` é a perda do dano por luta contra o `antes`; `vitoria` é a
   fração das lutas ganhas. A suíte de MM6 refaz a medida numa amostra
   menor (para caber no `npm test`) e confere que ela continua perto
   daqui — é a catraca do "joga diferente, não pior". */
export const RETRATO_DO_FURTIVO = {
  n: 140,
  justo:   { antes: { furtivo: 1, vitoria: 0.579 }, regra: { furtivo: 0.945, queda: 0.018 }, ardilosa: { furtivo: 0.962, queda: -0.046 } },
  brando:  { antes: { furtivo: 1, vitoria: 1 },     regra: { furtivo: 0.997, queda: 0.003 }, ardilosa: { furtivo: 1, queda: -0.090 } },
  sozinho: { antes: { furtivo: 1, vitoria: 0.914 }, regra: { furtivo: 0, queda: 0.211, vitoria: 0.614 }, ardilosa: { furtivo: 0.403, queda: 0.050, vitoria: 0.836 } },
};

const cenarioDaSonda = (id) => (id === SOZINHO_DA_SONDA.id ? SOZINHO_DA_SONDA : CENARIOS_DA_REGUA[id]);

/* ---------------- A MESA ---------------- */

function fichaDoLadino() {
  const h = LADINO_DA_SONDA;
  const vidaMax = pvEsperadoJogador(h.nivel, h.vigor);
  return {
    nome: h.nome, classe: h.classe, nivel: h.nivel, atributos: { ...h.atributos },
    vida: vidaMax, vidaMax, condicoes: [], efeitos: [], guardas: [], inventario: [],
    pericias: { treinadas: [...h.pericias.treinadas], especialistas: [...h.pericias.especialistas] },
    equipados: {
      arma: { nome: h.arma, tipo: "arma" },
      armadura: { nome: h.armadura, tipo: "armadura", atributos: { defesa: DEFESA_DA_ARMADURA[h.armadura] || 1 } },
    },
  };
}

function fichasDoGrupo(cen) {
  return cen.grupo.map((g) => {
    const vidaMax = pvEsperadoJogador(g.nivel, g.vigor);
    return garantirFichaCompanheiro({
      nome: g.nome, classe: g.classe, nivel: g.nivel, atributos: { ...g.atributos },
      vida: vidaMax, vidaMax, condicoes: [], efeitos: [], guardas: [], inventario: [], equipados: {}, morrendo: false,
    });
  });
}

function fichasDosInimigos(cen) {
  const { quantos, ameaca, nivel, base } = cen.inimigos;
  return Array.from({ length: quantos }, (_, i) => ({
    ...completarInimigo({ nome: `${base} ${i + 1}`, ameaca, nivel }, nivel), derrotado: false, condicoes: [],
  }));
}

/* ---------------- O PASSO DO LADINO ----------------
   Vai ao alvo e, entre as casas coladas nele que alcança neste turno,
   prefere a que tem cobertura; se nenhuma colada se alcança, anda o
   quanto der, pela mesma `moverInimigos` de todo mundo. */
function passoDoLadino(grade, lad, alvo, todos) {
  if (distanciaM(lad, alvo) <= alcanceNatural(lad)) {
    if (temCobertura(grade, lad.x, lad.y)) return lad;
  }
  const ocupados = ocupacaoDe(todos, lad);
  const teto = m2q(DESLOCAMENTO_PADRAO);
  const alc = m2q(alcanceNatural(lad));
  const lado = Math.max(1, Math.round(alvo.lado || 1));
  let melhor = null;
  /* só as casas coladas no alvo — o anel à volta dele —, e dessas só as
     que o passo de 9 m cobre; é o mesmo conjunto, sem varrer o mapa */
  for (let x = alvo.x - alc; x <= alvo.x + lado - 1 + alc; x++) {
    for (let y = alvo.y - alc; y <= alvo.y + lado - 1 + alc; y++) {
      const aqui = { ...lad, x, y };
      if (Math.max(Math.abs(x - lad.x), Math.abs(y - lad.y)) > teto) continue;
      if (distanciaM(aqui, alvo) > alcanceNatural(lad)) continue;
      const cob = temCobertura(grade, x, y);
      if (melhor && (melhor.cob || !cob)) continue;
      if (x !== lad.x || y !== lad.y) {
        const r = caminhar(grade, lad, { x, y }, { ocupados, deslocamentoM: DESLOCAMENTO_PADRAO });
        if (!r.ok) continue;
      }
      melhor = { x, y, cob };
    }
  }
  if (melhor) return { ...lad, x: melhor.x, y: melhor.y };
  const mv = moverInimigos(grade, [{ ...lad }], alvo, todos);
  return { ...lad, x: mv.inimigos[0].x, y: mv.inimigos[0].y };
}

/* ---------------- UMA LUTA ---------------- */

export function lutaDoLadino(cenarioId, semente, modo) {
  const cen = cenarioDaSonda(cenarioId);
  const planta = PLANTAS_DA_SONDA[Math.abs(Number(String(semente).split("|").pop()) || 0) % PLANTAS_DA_SONDA.length];
  return comSorteTravada(`${semente}|${cenarioId}`, () => {
    const grade = montarGrade(planta);
    let heroi = fichaDoLadino();
    let grupo = fichasDoGrupo(cen);
    const pos = posicionar(grade, {
      heroi: { nome: heroi.nome, tamanho: "medio" },
      grupo: grupo.map((c) => ({ nome: c.nome, vida: c.vida, tamanho: "medio" })),
      inimigos: fichasDosInimigos(cen),
    });
    let lugar = pos.heroi;
    let aliados = pos.grupo;
    let inimigos = pos.inimigos;
    const vivos = () => inimigos.filter((e) => !e.derrotado && (e.vida || 0) > 0);
    const aliadosComVida = () => aliados.map((a, i) => ({ ...a, vida: (grupo[i] || {}).vida || 0, condicoes: (grupo[i] || {}).condicoes || [] }));
    const ferir = (nome, dano) => {
      inimigos = inimigos.map((e) => (e.nome !== nome ? e : { ...e, vida: Math.max(0, e.vida - dano), derrotado: e.vida - dano <= 0 }));
    };
    let danoDoLadino = 0, golpes = 0, comFurtivo = 0, escondeu = 0, rodada = 1;
    const nv = heroi.nivel;
    const bonusAtk = modDoGolpe(heroi, heroi.equipados.arma) + 2 + Math.floor((nv - 1) / 4);
    for (; rodada <= LUTAS_DA_SONDA.tetoDeRodadas; rodada++) {
      if (!vivos().length) break;
      /* ---- 1. O LADINO ---- */
      if ((heroi.vida || 0) > 0) {
        const colados = aliadosComVida().filter((a) => a.vida > 0);
        const flanqueado = vivos().filter((e) => colados.some((a) => distanciaM(a, e) <= 1.5));
        const escolha = (flanqueado.length ? flanqueado : vivos()).sort((a, b) => distanciaM(a, lugar) - distanciaM(b, lugar))[0];
        const todos = [lugar, ...aliados, ...vivos()];
        lugar = passoDoLadino(grade, lugar, escolha, todos);
        if (distanciaM(lugar, escolha) <= alcanceNatural(lugar)) {
          /* a Ação Ardilosa: esconder-se ANTES do golpe, com a ação bônus */
          if (modo === "ardilosa" && custoDeEsconder(heroi) === "bonus" && !estadoEscondido(heroi)) {
            const mod = bonusDePericia(heroi, "furtividade", heroi.atributos.destreza);
            const total = 1 + Math.floor(Math.random() * 20) + (Number(mod) || 0);
            const ns = nascerEscondido(heroi, { total, grade, heroi: lugar, inimigos: vivos() });
            if (ns.ok) { heroi = ns.pers; escondeu++; }
          }
          const vant = oculto(heroi, escolha, { grade, heroi: lugar });
          const v = vereditoDoFurtivo({
            classe: heroi.classe, nivel: nv, alvo: escolha, aliados: colados,
            vantagem: vant, condAtacante: heroi.condicoes, condAlvo: escolha.condicoes,
          });
          const soma = modo === "antes" ? true : v.soma;
          const r = resolverAtaque({
            atacante: heroi.nome, alvo: escolha, ehAtacanteInimigo: false, bonusAtaque: bonusAtk,
            danoBase: danoDaClasse(heroi.classe, nv, Math.round(danoDe(heroi, false) / 2), { furtivo: soma }),
            condAtacante: heroi.condicoes, condAlvo: escolha.condicoes || [],
            tipoDano: elementoDaArma(heroi), perfilAlvo: perfilDe(escolha), vantagem: vant,
          });
          golpes++;
          if (soma) comFurtivo++;
          if (r.dano > 0) { ferir(escolha.nome, r.dano); danoDoLadino += r.dano; }
          /* atacou, apareceu — o que `romperPorGatilho(…, "atacar")` faz no App */
          heroi = { ...heroi, condicoes: (heroi.condicoes || []).filter((c) => c.id !== "escondido") };
        }
      }
      if (!vivos().length) break;
      /* ---- 2. OS INIMIGOS: andam, procuram, batem ---- */
      const mv = moverInimigos(grade, inimigos, lugar, [lugar, ...aliados]);
      inimigos = mv.inimigos;
      const rv = revisarEscondido(heroi, { grade, heroi: lugar, inimigos: vivos() });
      heroi = rv.pers;
      const acoes = turnoDosInimigos({
        inimigos: vivos(), jogador: heroi, grupo: grupo.filter((g) => (g.vida || 0) > 0).length ? grupo : [],
        gdJogador: 0, grade, heroi: lugar, aliados, rodada, provocado: false, prioridade: "",
      });
      for (const a of acoes) {
        if (!(a.r && a.r.dano > 0)) continue;
        if (a.alvoRef === "jogador") heroi = { ...heroi, vida: Math.max(0, (heroi.vida || 0) - a.r.dano) };
        else if (a.alvoRef === "grupo") grupo = grupo.map((g) => (g.nome === a.alvoNome ? { ...g, vida: Math.max(0, (g.vida || 0) - a.r.dano) } : g));
      }
      /* ---- 3. O GRUPO: anda para o inimigo mais perto do herói, e age ---- */
      const alvoDeles = vivos().sort((a, b) => distanciaM(a, lugar) - distanciaM(b, lugar))[0];
      if (alvoDeles) {
        const vivosAli = aliados.map((a, i) => ({ ...a, vida: (grupo[i] || {}).vida || 0, i }));
        const mvA = moverInimigos(grade, vivosAli, alvoDeles, [lugar, ...vivos()]);
        aliados = mvA.inimigos.map(({ vida, i, ...resto }) => resto);
      }
      const acoesComp = turnoDosCompanheiros({
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
      /* ---- 4. O RELÓGIO ---- */
      if ((heroi.condicoes || []).length) heroi = { ...heroi, condicoes: tickCondicoes(heroi.condicoes).condicoes };
      if (!vivos().length) break;
      if ((heroi.vida || 0) <= 0 && !grupo.some((g) => (g.vida || 0) > 0)) break;
    }
    return { danoDoLadino, golpes, comFurtivo, escondeu, vitoria: vivos().length ? 0 : 1, rodadas: Math.min(rodada, LUTAS_DA_SONDA.tetoDeRodadas) };
  });
}

/* ---------------- A MEDIDA ----------------
   Por cenário e por modo: dano do Ladino por luta, a fração dos golpes
   com furtivo, e a queda do dano contra o `antes`. */
export function sondarFurtivo({ n = LUTAS_DA_SONDA.n, prefixo = LUTAS_DA_SONDA.prefixo, cenarios = LUTAS_DA_SONDA.cenarios } = {}) {
  const out = {};
  for (const c of cenarios) {
    out[c] = {};
    for (const modo of MODOS_DA_SONDA) {
      let dano = 0, golpes = 0, com = 0, esc = 0, vit = 0;
      for (let i = 0; i < n; i++) {
        const r = lutaDoLadino(c, `${prefixo}|${i}`, modo);
        dano += r.danoDoLadino; golpes += r.golpes; com += r.comFurtivo; esc += r.escondeu; vit += r.vitoria;
      }
      out[c][modo] = { danoPorLuta: dano / n, golpesPorLuta: golpes / n, comFurtivo: golpes ? com / golpes : 0, escondeuPorLuta: esc / n, vitoria: vit / n };
    }
    const a = out[c].antes.danoPorLuta;
    for (const modo of MODOS_DA_SONDA) out[c][modo].queda = a ? 1 - out[c][modo].danoPorLuta / a : 0;
  }
  return out;
}

/* rodado direto (`node sonda-do-furtivo.mjs`), imprime a tabela */
if (process.argv[1] && process.argv[1].endsWith("sonda-do-furtivo.mjs")) {
  const t0 = Date.now();
  const m = sondarFurtivo();
  for (const [c, porModo] of Object.entries(m)) {
    for (const [modo, x] of Object.entries(porModo)) {
      console.log(`${c.padEnd(7)} ${modo.padEnd(9)} dano/luta ${x.danoPorLuta.toFixed(2).padStart(6)} · golpes ${x.golpesPorLuta.toFixed(2)} · furtivo em ${(x.comFurtivo * 100).toFixed(1)}% · escondeu ${x.escondeuPorLuta.toFixed(2)} · queda ${(x.queda * 100).toFixed(1)}% · vitória ${(x.vitoria * 100).toFixed(1)}%`);
    }
  }
  console.log(`(${Date.now() - t0} ms)`);
}
