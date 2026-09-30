/* ============================================================
   A SONDA DA LUTA SEM ESPADA (Fase MM · MM9) — a palavra na régua

   A PERGUNTA QUE ELA RESPONDE: com a palavra a dobrar o bando, as lutas
   contra quem ouve (o astuto) passam a acabar mais cedo por conversa? E
   quanto — em rodadas, em dano no herói, em lutas que acabam com gente
   rendida em vez de morta? E contra quem NÃO ouve (o bicho, o fanático),
   nada muda, como a tabela promete?

   A MESA É A DA RÉGUA, SEM TABULEIRO. A palavra não é de distância nem de
   linha de visão: é de vontade, e a vontade não mora na grade. Por isso a
   sonda não monta planta (a régua de Uma Vida também não). Peças de
   produção, e nenhuma regra nasce aqui:
     · o herói: o Guerreiro da régua (`CENARIOS_DA_REGUA.duro.heroi`), com
       Intimidação treinada — o Guerreiro escolhe-a do pool dele, e quem
       joga para falar escolhe-a;
     · o golpe: `resolverAtaque`, `danoDaClasse`; os inimigos:
       `turnoDosInimigos`, com a prioridade da intenção do bando
       (`intencaoDaVez`), como o App e a régua fazem;
     · a palavra: `vereditoDaPalavra` (a chance, antes do clique) e
       `ouvirAPalavra` (o que o teste rolado faz ao bando).

   DOIS MODOS, o mesmo herói e a mesma sorte:
     espada   só bate — o jogo até MM9, quando a palavra não mudava nada;
     palavra  fala quando a chance de a palavra mover o bando é boa
              (`LIMIAR_DE_FALAR`) e há com quem falar; senão, bate. Falar
              gasta a AÇÃO (`PALAVRA_NA_LUTA`): nessa rodada não há golpe.
   ============================================================ */

import { comSorteTravada, CENARIOS_DA_REGUA } from "./regua-combate.mjs";
import { turnoDosInimigos, resolverAtaque, danoDe, danoDaClasse, ataquesPorTurno, pvEsperadoJogador, perfilCombate } from "../src/combate.js";
import { completarInimigo } from "../src/bestiario.js";
import { elementoDaArma, perfilDe } from "../src/danos.js";
import { modDoGolpe } from "../src/itens.js";
import { DEFESA_DA_ARMADURA } from "../src/prontos.js";
import { bonusDePericia, periciaPorId } from "../src/pericias.js";
import { intencaoDaVez, menteDaCriatura } from "../src/adversario.js";
import { PESO_AMEACA } from "../src/orcamento.js";
import { tickCondicoes } from "../src/condicoes.js";
import { vereditoDaPalavra, ouvirAPalavra, TIPOS_DE_PALAVRA, PALAVRA_NA_LUTA } from "../src/sem-espada.js";

/* ---------------- AS TABELAS DA SONDA ---------------- */
export const LUTAS_SEM_ESPADA = {
  astutos: { inimigos: ["Soldado", "Soldado"] },        // astuto declarado no bestiário
  brutos: { inimigos: ["Adversário", "Adversário"] },   // comum sem declaração: bruto
  animais: { inimigos: ["Lobo", "Lobo"] },
  fanaticos: { inimigos: ["Cultista", "Cultista"] },
};
export const AMOSTRA_SEM_ESPADA = { n: 200, prefixo: "mm9", tetoDeRodadas: 20, ameaca: "comum", nivel: 5 };
export const MODOS_SEM_ESPADA = ["espada", "palavra"];
/* fala quando a palavra tem ao menos esta chance de passar. 70%: o
   jogador que fala quando a coisa está a favor — com 50%, falar a cada
   rodada contra quem ainda está inteiro custava ao herói +42% de dano no
   cenário dos astutos (a ação gasta a falar é um golpe que não sai). */
export const LIMIAR_DE_FALAR = 0.7;
/* DOIS JOGADORES, o mesmo corpo (o Guerreiro da régua): o que mete medo
   (Intimidação treinada, a Força dele) e o que também sabe falar
   (Persuasão treinada e Presença 3, a de um Bardo). A tabela diz que o
   astuto ouve o argumento sem desconto; só o segundo o pode provar. */
export const HEROIS_SEM_ESPADA = {
  intimidador: { presenca: null, treinadas: ["intimidacao"] },
  orador: { presenca: 3, treinadas: ["intimidacao", "persuasao"] },
};

/* O RETRATO — medido a 200 lutas por cenário e modo (sementes
   `mm9|0..199`), no dia em que a regra entrou (30/09/2026), com o jogador
   que fala a 70%. `dano` é o que o herói leva por luta; `porPalavra` a
   fração das lutas em que alguém se rendeu ou fugiu pela palavra.
   A LEITURA: o orador contra astutos acaba a luta em 15% menos rodadas
   com o mesmo dano (+1,7%), e 99% delas com gente rendida; o intimidador
   contra astutos paga (+17% de dano, +6% de rodadas) — a ameaça custa ao
   astuto (+2) e é a única palavra que ele sabe. Contra brutos, a ameaça é
   a língua deles: −12% de rodadas, +13% de dano. O bicho quase não muda
   (43% das lutas com um lobo a fugir, dano igual), e o fanático não muda
   nada — é a tabela a funcionar. */
export const RETRATO_SEM_ESPADA = {
  n: 200,
  intimidador: {
    astutos: { espada: { dano: 12.09, rodadas: 4.05, vitoria: 0.995 }, palavra: { dano: 14.2, rodadas: 4.31, vitoria: 0.99, porPalavra: 0.865, rendidos: 1.31 } },
    brutos: { espada: { dano: 12.4, rodadas: 4.1, vitoria: 1 }, palavra: { dano: 14.02, rodadas: 3.6, vitoria: 0.98, porPalavra: 0.98, rendidos: 1.72 } },
    animais: { espada: { dano: 15.73, rodadas: 4.63, vitoria: 0.975 }, palavra: { dano: 15.69, rodadas: 4.64, vitoria: 0.97, porPalavra: 0.43, rendidos: 0 } },
    fanaticos: { espada: { dano: 12.58, rodadas: 4.13, vitoria: 1 }, palavra: { dano: 12.58, rodadas: 4.13, vitoria: 1, porPalavra: 0, rendidos: 0 } },
  },
  orador: {
    astutos: { espada: { dano: 12.09, rodadas: 4.05, vitoria: 0.995 }, palavra: { dano: 12.29, rodadas: 3.46, vitoria: 0.99, porPalavra: 0.99, rendidos: 1.77 } },
  },
};
/* O LIMITE: o dano no herói, falando, fica a menos de 20% do de quem só
   bate — a palavra muda a luta, não a torna um atalho nem uma armadilha. */
export const LIMITE_SEM_ESPADA = { variacao: 0.2 };

/* ---------------- A MESA ---------------- */
function fichaDoHeroi(perfil = "intimidador") {
  const h = CENARIOS_DA_REGUA.duro.heroi;
  const p = HEROIS_SEM_ESPADA[perfil] || HEROIS_SEM_ESPADA.intimidador;
  const vidaMax = pvEsperadoJogador(h.nivel, h.vigor);
  const peca = (nome, tipo) => (nome ? { nome, tipo, ...(tipo === "arma" ? {} : { atributos: { defesa: DEFESA_DA_ARMADURA[nome] || 1 } }) } : null);
  const equipados = {};
  if (h.arma) equipados.arma = peca(h.arma, "arma");
  if (h.armadura) equipados.armadura = peca(h.armadura, "armadura");
  if (h.escudo) equipados.escudo = peca(h.escudo, "escudo");
  return {
    nome: h.nome, classe: h.classe, nivel: h.nivel, atributos: { ...h.atributos, ...(p.presenca != null ? { presenca: p.presenca } : {}) },
    vida: vidaMax, vidaMax, condicoes: [], efeitos: [], guardas: [], inventario: [], equipados,
    pericias: { treinadas: [...p.treinadas], especialistas: [] },
  };
}

function fichasDosInimigos(nomes) {
  const { ameaca, nivel } = AMOSTRA_SEM_ESPADA;
  return nomes.map((base, i) => ({ ...completarInimigo({ nome: `${base} ${i + 1}`, ameaca, nivel }, nivel), derrotado: false, condicoes: [] }));
}

/* o bônus do herói num tipo de palavra: o atributo da perícia + o treino */
function modDaPalavra(heroi, tipo) {
  const per = periciaPorId(tipo);
  const attr = per ? per.atributo : "presenca";
  return bonusDePericia(heroi, tipo, (heroi.atributos || {})[attr] || 0).total;
}

/* ---------------- UMA LUTA ---------------- */
export function lutaSemEspada(cenarioId, semente, modo, { limiar = LIMIAR_DE_FALAR, perfil = "intimidador" } = {}) {
  const cen = LUTAS_SEM_ESPADA[cenarioId];
  return comSorteTravada(`${semente}|${cenarioId}|mm9`, () => {
    let heroi = fichaDoHeroi(perfil);
    let inimigos = fichasDosInimigos(cen.inimigos);
    const quantosEram = inimigos.length;
    const vivos = () => inimigos.filter((e) => !e.derrotado && (e.vida || 0) > 0);
    let intencao = "", danoNoHeroi = 0, falas = 0, rodada = 1, derrubouAgora = false, porPalavra = 0;
    const nv = heroi.nivel;
    const bonusAtk = modDoGolpe(heroi, heroi.equipados.arma) + 2 + Math.floor((nv - 1) / 4);
    const situacao = () => {
      const vv = vivos();
      if (!vv.length) return null;
      const voz = vv.reduce((a, b) => ((b.nivel || 0) + PESO_AMEACA[b.ameaca] * 10 > (a.nivel || 0) + PESO_AMEACA[a.ameaca] * 10 ? b : a), vv[0]);
      const mente = menteDaCriatura(voz.nome, "", null);
      const somaVida = vv.reduce((s, x) => s + (x.vida || 0), 0), somaMax = vv.reduce((s, x) => s + (x.vidaMax || x.vida || 1), 0) || 1;
      return {
        nome: voz.nome, ameaca: voz.ameaca, ehBicho: mente === "besta", ehMorto: mente === "morto", pensa: mente !== "besta" && mente !== "morto",
        rodada, quantos: vv.length, quantosEram, minhaVida: (voz.vida || 0) / (voz.vidaMax || 1), vidaDosMeus: somaVida / somaMax,
        heroiVida: (heroi.vida || 0) / (heroi.vidaMax || 1), heroiCaido: (heroi.vida || 0) <= 0, heroiSozinho: true, quantosDoOutroLado: 1,
        temConjurador: perfilCombate(heroi.classe).tipo === "conjurador", alguemFerido: (heroi.vida || 0) < (heroi.vidaMax || 1) * 0.5,
        temLider: vv.length > 1, liderCaiu: false, saidas: 2,
      };
    };
    for (; rodada <= AMOSTRA_SEM_ESPADA.tetoDeRodadas; rodada++) {
      if (!vivos().length) break;
      /* a vontade do bando, antes de tudo: a vida pode tê-la vergado */
      const s0 = situacao();
      const v0 = s0 ? intencaoDaVez(s0, { antes: intencao }) : null;
      if (v0 && v0.intencao) intencao = v0.intencao.id;
      /* ---- 1. O HERÓI: fala, ou bate ---- */
      if ((heroi.vida || 0) > 0) {
        let falou = false;
        if (modo === "palavra") {
          const opcoes = Object.keys(TIPOS_DE_PALAVRA).map((tipo) => ({ tipo, mod: modDaPalavra(heroi, tipo) }))
            .map((o) => ({ ...o, v: vereditoDaPalavra({ inimigos, tipo: o.tipo, mod: o.mod, intencao, situacao: s0, impressionou: derrubouAgora }) }))
            .filter((o) => o.v.pode && o.v.chance >= limiar)
            .sort((a, b) => b.v.chance - a.v.chance);
          if (opcoes.length && PALAVRA_NA_LUTA.custo === "acao") {
            const o = opcoes[0];
            const d20 = 1 + Math.floor(Math.random() * 20);
            const total = d20 + o.mod;
            const critico = d20 === 20, passou = critico || (d20 !== 1 && total >= o.v.cd);
            const res = ouvirAPalavra({ inimigos, tipo: o.tipo, passou, margem: total - o.v.cd, critico, intencao, situacao: s0 });
            inimigos = res.inimigos;
            if (res.intencao) intencao = res.intencao;
            if (res.rendidos.length || res.fogem.length) porPalavra = 1;
            falas++; falou = true;
          }
        }
        derrubouAgora = false;
        if (!falou) {
          for (let i = 0; i < ataquesPorTurno(heroi.classe, nv); i++) {
            const vv = vivos();
            if (!vv.length) break;
            const alvo = [...vv].sort((a, b) => (a.vida || 0) - (b.vida || 0))[0];
            const r = resolverAtaque({
              atacante: heroi.nome, alvo, ehAtacanteInimigo: false, bonusAtaque: bonusAtk,
              danoBase: danoDaClasse(heroi.classe, nv, Math.round(danoDe(heroi, false) / 2)),
              condAtacante: heroi.condicoes, condAlvo: alvo.condicoes || [], tipoDano: elementoDaArma(heroi), perfilAlvo: perfilDe(alvo),
            });
            if (r.dano > 0) {
              inimigos = inimigos.map((e) => (e.nome !== alvo.nome ? e : { ...e, vida: Math.max(0, e.vida - r.dano), derrotado: e.vida - r.dano <= 0 }));
              if (alvo.vida - r.dano <= 0 || r.critico) derrubouAgora = true;
            }
          }
        }
      }
      if (!vivos().length) break;
      /* ---- 2. OS INIMIGOS ---- */
      const acoes = turnoDosInimigos({ inimigos: vivos(), jogador: heroi, grupo: [], gdJogador: 0, grade: null, heroi: null, aliados: [], rodada, provocado: false, prioridade: (v0 && v0.intencao && v0.intencao.alvo) || "" });
      for (const a of acoes) {
        if (a.r && a.r.dano > 0 && a.alvoRef === "jogador") { heroi = { ...heroi, vida: Math.max(0, (heroi.vida || 0) - a.r.dano) }; danoNoHeroi += a.r.dano; }
      }
      if ((heroi.condicoes || []).length) heroi = { ...heroi, condicoes: tickCondicoes(heroi.condicoes).condicoes };
      if ((heroi.vida || 0) <= 0) break;
    }
    const rendidos = inimigos.filter((e) => e.rendido).length;
    const fugidos = inimigos.filter((e) => e.fugiu).length;
    return {
      danoNoHeroi, vitoria: vivos().length ? 0 : 1, rodadas: Math.min(rodada, AMOSTRA_SEM_ESPADA.tetoDeRodadas),
      falas, rendidos, fugidos, porPalavra, mortos: inimigos.filter((e) => e.derrotado && !e.rendido && !e.fugiu).length,
    };
  });
}

/* ---------------- A MEDIDA ---------------- */
export function sondarSemEspada({ n = AMOSTRA_SEM_ESPADA.n, prefixo = AMOSTRA_SEM_ESPADA.prefixo, cenarios = Object.keys(LUTAS_SEM_ESPADA), limiar = LIMIAR_DE_FALAR, perfil = "intimidador" } = {}) {
  const out = {};
  for (const c of cenarios) {
    out[c] = {};
    for (const modo of MODOS_SEM_ESPADA) {
      const soma = { dano: 0, vitoria: 0, rodadas: 0, falas: 0, rendidos: 0, fugidos: 0, porPalavra: 0, mortos: 0 };
      for (let i = 0; i < n; i++) {
        const r = lutaSemEspada(c, `${prefixo}|${i}`, modo, { limiar, perfil });
        soma.dano += r.danoNoHeroi; soma.vitoria += r.vitoria; soma.rodadas += r.rodadas; soma.falas += r.falas;
        soma.rendidos += r.rendidos; soma.fugidos += r.fugidos; soma.porPalavra += r.porPalavra; soma.mortos += r.mortos;
      }
      out[c][modo] = Object.fromEntries(Object.entries(soma).map(([k, v]) => [k, v / n]));
    }
  }
  return out;
}

if (process.argv[1] && process.argv[1].endsWith("sonda-sem-espada.mjs")) {
  const t0 = Date.now();
  for (const perfil of Object.keys(HEROIS_SEM_ESPADA)) {
    const m = sondarSemEspada({ perfil });
    for (const [c, porModo] of Object.entries(m)) for (const [modo, x] of Object.entries(porModo)) {
      console.log(`${perfil.padEnd(11)} ${c.padEnd(10)} ${modo.padEnd(8)} dano ${x.dano.toFixed(2).padStart(6)} · vitória ${(x.vitoria * 100).toFixed(1)}% · rodadas ${x.rodadas.toFixed(2)} · falas ${x.falas.toFixed(2)} · rendidos ${x.rendidos.toFixed(2)} · fugidos ${x.fugidos.toFixed(2)} · mortos ${x.mortos.toFixed(2)} · acabou pela palavra ${(x.porPalavra * 100).toFixed(1)}%`);
    }
  }
  console.log(`(${Date.now() - t0} ms)`);
}
