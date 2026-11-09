/* ============================================================
   A PREVISÃO DO GOLPE (CB5, 09/11/2026) — o veredito antes do clique

   A pessoa jogou duas lutas e escreveu o que dói: ataca-se às cegas. O
   botão diz «Atacar», o dado rola, e só DEPOIS o jogador fica a saber que
   tinha 35% de acertar e que o golpe nunca derrubaria o lobo. A lei da
   casa diz que toda ação irreversível mostra o resultado antes; o golpe
   era a exceção mais frequente do jogo. BG3 e XCOM 2 resolvem com o mesmo
   gesto — o número sobre o alvo antes do clique: «78% · 6–13 · abate».

   ESTE MÓDULO NÃO TEM CONTA PRÓPRIA, e é essa a regra dele. A previsão é
   `resolverAtaque` (combate.js) lido ao contrário: os MESMOS termos (o
   bónus, a defesa com a cobertura e o `protegido`, os lados do dado por
   `ladosDoDado`, a face do crítico, o 1 que erra sempre, os modificadores
   de condição de cada lado, a fraqueza e a resistência por
   `multiplicadorDano`, o piso zero, o arredondar), aplicados não a UM
   dado rolado mas a TODOS — face por face no d20, e valor por valor no
   dano. O resultado é exato, não estimado; e a suíte
   (`teste-previsao.mjs`) prova-o por amostragem contra a rolagem de
   verdade, com a sorte semeada.

   O DANO COMO DISTRIBUIÇÃO. `resolverAtaque` recebe `danoBase` já rolado;
   a previsão precisa da forma dele. Daí uma gramática pequena (a `forma`):
       número            — um valor fixo;
       { dado, n }       — n dados de `dado` faces, somados;
       { soma: [...] }   — a soma das partes;
       { metade: f }     — Math.round(f / 2) (o meio-atributo do golpe);
       { piso: k, de: f }— Math.max(k, f) (o «nunca menos de 1»);
       { vezes: m, de: f}— Math.round(f × m) (o combo, o dobro do limiar).
   `danoDoGolpe` e `danoDaHabilidade` escrevem, nesta gramática, a MESMA
   conta que o App rola em `resolverAtaqueJogador` e no golpe da
   habilidade — linha a linha, com o porquê de cada parcela ao lado.

   O QUE ELE DEVOLVE: a chance de acertar (com e sem o crítico), o dano
   (mínimo, médio, máximo) de um acerto e de um crítico, o dano esperado,
   a chance de ABATER (o golpe deixa o alvo a zero), o que a vantagem e a
   cobertura mudam, e — para o turno inteiro — a chance de abater com
   todos os golpes do herói. E o golpe livre que o caminho provoca
   (`golpesLivresAoAndar`), pela regra que o App aplica ao andar.

   Puro: sem sorte nenhuma (a previsão não rola dado), sem tocar no que
   recebe, lixo dá `null`.
   ============================================================ */
import {
  ladosDoDado, modificadoresDeCondicao, defesaDe, perfilCombate, dadosDeDano,
  dadosDoFurtivo, vereditoDoFurtivo, ataquesPorTurno, bonusContraOJogador, DANO_DA_AMEACA,
} from "./combate.js";
import { DEFESA_NUA, danoDaForma } from "./habilidades.js";
import { multiplicadorDano, perfilDe, resistenciasEquipadas, elementoDaArma } from "./danos.js";
import { danoDaArma, modDoGolpe } from "./itens.js";
import { bonusDeArma, bonusDeDano, tipoDeDanoDaHabilidade } from "./combos.js";
import { danoExtraDeDadiva, criticoMinimo, ataquesExtras } from "./dadivas.js";
import { bonusDivino, imunePorEscopo } from "./divindades.js";
import { valorParaHabilidade } from "./atributos.js";
import { classeDaHabilidade } from "./classes.js";
import { estaInvisivel } from "./gatilhos.js";
import { oculto } from "./escondido.js";
import { bonusDefesaEm, adjacentes } from "./grid.js";

/* ---------------- A TABELA ----------------
   `casas` — as casas decimais das probabilidades devolvidas (4: um
     centésimo de ponto percentual; mais do que isto é ruído para a tela, e
     menos esconderia a diferença entre 0,4% e nada);
   `casasDoMedio` — as do dano médio;
   `tetoDoDano` — o maior valor que a distribuição do dano aceita somar
     antes de desistir (folga de segurança contra uma forma podre: o maior
     golpe real desta casa fica abaixo de 300). */
export const PREVISAO_DO_ATAQUE = {
  casas: 4,
  casasDoMedio: 2,
  tetoDoDano: 5000,
  porque: "a previsão é a conta do golpe lida face a face: o número sobre o alvo é o que o dado vai cumprir",
};

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const lista = (x) => (Array.isArray(x) ? x : []);
const fin = (x) => x !== null && x !== "" && typeof x !== "boolean" && Number.isFinite(Number(x));
const arred = (p, c = PREVISAO_DO_ATAQUE.casas) => { const f = 10 ** c; return Math.round(p * f) / f; };

/* ---------------- A DISTRIBUIÇÃO ----------------
   Um Map valor → probabilidade. As operações são as da gramática acima. */
const constante = (k) => new Map([[k, 1]]);
function convolver(a, b) {
  const out = new Map();
  for (const [x, p] of a) for (const [y, q] of b) { const k = x + y; out.set(k, (out.get(k) || 0) + p * q); }
  return out;
}
function mapear(a, f) {
  const out = new Map();
  for (const [x, p] of a) { const k = f(x); out.set(k, (out.get(k) || 0) + p); }
  return out;
}
function dados(faces, n) {
  const F = Math.floor(Number(faces)), N = Math.floor(Number(n));
  if (!(F >= 1) || !(N >= 0)) return null;
  const um = new Map();
  for (let i = 1; i <= F; i++) um.set(i, 1 / F);
  let d = constante(0);
  for (let i = 0; i < N; i++) d = convolver(d, um);
  return d;
}
/* a forma → a distribuição; `null` para a forma podre */
function distDe(forma) {
  if (fin(forma)) return constante(Number(forma));
  const f = obj(forma);
  if (!f) return null;
  if (fin(f.dado)) return dados(f.dado, f.n == null ? 1 : f.n);
  if (Array.isArray(f.soma)) {
    let d = constante(0);
    for (const parte of f.soma) { const x = distDe(parte); if (!x) return null; d = convolver(d, x); }
    return d;
  }
  if (f.metade !== undefined) { const x = distDe(f.metade); return x ? mapear(x, (v) => Math.round(v / 2)) : null; }
  if (fin(f.piso)) { const x = distDe(f.de); return x ? mapear(x, (v) => Math.max(Number(f.piso), v)) : null; }
  if (fin(f.vezes)) { const x = distDe(f.de); return x ? mapear(x, (v) => Math.round(v * Number(f.vezes))) : null; }
  return null;
}
const resumo = (d) => {
  if (!d || !d.size) return null;
  let min = Infinity, max = -Infinity, soma = 0, massa = 0;
  for (const [x, p] of d) { if (p <= 0) continue; min = Math.min(min, x); max = Math.max(max, x); soma += x * p; massa += p; }
  if (!massa) return null;
  return { min, medio: arred(soma / massa, PREVISAO_DO_ATAQUE.casasDoMedio), max };
};

/* AS FACES QUE ACERTAM (formas.md §CB 3 e §CB 15): quem joga RPG de mesa
   pensa em «preciso de 6», não em «78%». As faces do d20 que acertam, pela
   regra de `resolverAtaque`: o 1 nunca; da face do crítico para cima,
   sempre; as outras, se a face mais o bónus chega à defesa (a defesa JÁ com
   a cobertura e o `protegido`, como o `ca` do resultado). Uma lista só, lida
   pela previsão (as 20 faces acesas na coluna) e pelo dado do golpe na
   bandeja (`lancamentoDoAtaque`, motor/a-bandeja.js) — duas contas seriam
   duas respostas para «que faces acertam?». */
export function facesQueAcertam(bonus, defesa, criticoEm) {
  const b = Number(bonus) || 0, d = Number(defesa);
  if (!Number.isFinite(d)) return [];
  const crit = Math.max(2, Math.min(20, Number(criticoEm) || 20));
  const out = [];
  for (let f = 2; f <= 20; f++) if (f >= crit || f + b >= d) out.push(f);
  return out;
}

/* ============================================================
   O NÚCLEO — `resolverAtaque`, face a face
   `args`: os MESMOS de `resolverAtaque` (atacante, alvo, ehAtacanteInimigo,
   bonusAtaque, vantagem, desvantagem, condAtacante, condAlvo, tipoDano,
   perfilAlvo, resistAlvo, bonusDefesaAlvo, criticoEm, ignoraArmadura), com
   `dano` (a forma) no lugar de `danoBase`, mais:
     vidaAlvo    — a vida a vencer para abater (sem ela, a do alvo);
     escopoImune — o golpe atravessa sem ferir (`imunePorEscopo`: o App zera
                   o dano depois do dado; aqui zera-se antes).
   Interno, para devolver também a distribuição do dano final (o turno a
   soma golpe a golpe). */
function previsaoComDist(args) {
  const a = obj(args);
  if (!a) return null;
  const alvo = obj(a.alvo);
  if (!alvo) return null;
  const condAtacante = lista(a.condAtacante), condAlvo = lista(a.condAlvo);
  const tipoDano = a.tipoDano || "fisico";
  const lados = ladosDoDado({ alvo, vantagem: a.vantagem, desvantagem: a.desvantagem, condAtacante, condAlvo, tipoDano });
  const vidaBruta = fin(a.vidaAlvo) ? Number(a.vidaAlvo) : Number(alvo.vida);
  const vida = Number.isFinite(vidaBruta) ? Math.max(0, vidaBruta) : null;
  const zero = constante(0);
  const vazio = (motivo) => ({
    previsao: {
      [motivo]: true, chance: 0, chanceCritico: 0, modo: null, bonus: Number(a.bonusAtaque) || 0, defesa: null, faces: [], criticoEm: null,
      dano: null, danoCritico: null, danoEsperado: 0, abate: vida === 0 ? 1 : 0, imune: false,
    },
    final: zero,
  });
  if (lados.impedido) return vazio("impedido");
  if (lados.intocavel) return vazio("intocavel");

  const modAtk = modificadoresDeCondicao(condAtacante);
  const modAlvo = modificadoresDeCondicao(condAlvo);
  const bonus = Number(a.bonusAtaque) || 0;
  const ca = (a.ignoraArmadura ? DEFESA_NUA : defesaDe(alvo, !a.ehAtacanteInimigo)) + (Number(a.bonusDefesaAlvo) || 0) + modAlvo.defesa;
  const critEm = Math.max(2, Math.min(20, Number(a.criticoEm) || 20));
  const base = distDe(a.dano);
  if (!base) return null;
  if ([...base.keys()].some((x) => Math.abs(x) > PREVISAO_DO_ATAQUE.tetoDoDano)) return null;

  /* o d20, face a face: vantagem é o maior de dois, desvantagem o menor */
  const pFace = (v) => (lados.vantagem ? (2 * v - 1) / 400 : lados.desvantagem ? (41 - 2 * v) / 400 : 1 / 20);
  let pAcerto = 0, pCritico = 0;
  for (let v = 1; v <= 20; v++) {
    if (v === 1) continue;                         // o desastre: erra sempre
    if (v >= critEm) pCritico += pFace(v);
    else if (v + bonus >= ca) pAcerto += pFace(v);
  }

  /* o dano, valor a valor — a mesma ordem de `resolverAtaque` */
  const perfil = a.perfilAlvo || null;
  const resist = lista(a.resistAlvo);
  let mult = 1;
  if (perfil || resist.length) {
    if (perfil) mult = multiplicadorDano(tipoDano, perfil).mult;
    if (mult > 0 && resist.includes(tipoDano)) mult *= 0.5;
  }
  const imune = mult === 0 || a.escopoImune === true;
  const final = (bruto) => {
    let x = Math.max(0, Math.round(bruto));
    if (x > 0 && (perfil || resist.length)) {
      if (mult === 0) x = 0;
      else if (mult !== 1) x = Math.max(1, Math.round(x * mult));
    }
    return a.escopoImune === true ? 0 : x;
  };
  const ex = modAtk.danoExtra - modAtk.danoReduzido, recv = modAlvo.danoRecebidoExtra;
  const dAcerto = mapear(base, (b) => final(b + ex + recv));
  const dCritico = mapear(base, (b) => final((b + ex) * 2 + recv));

  const tudo = new Map([[0, 1 - pAcerto - pCritico]]);
  for (const [x, p] of dAcerto) tudo.set(x, (tudo.get(x) || 0) + p * pAcerto);
  for (const [x, p] of dCritico) tudo.set(x, (tudo.get(x) || 0) + p * pCritico);
  let esperado = 0, abate = 0;
  for (const [x, p] of tudo) { esperado += x * p; if (vida != null && x >= vida) abate += p; }

  return {
    previsao: {
      chance: arred(pAcerto + pCritico),
      chanceCritico: arred(pCritico),
      modo: lados.vantagem ? "vantagem" : lados.desvantagem ? "desvantagem" : null,
      bonus, defesa: ca,
      /* as faces do d20 que acertam, e a do crítico (a coluna acende-as) */
      faces: facesQueAcertam(bonus, ca, critEm), criticoEm: critEm,
      dano: pAcerto > 0 ? resumo(dAcerto) : null,
      danoCritico: pCritico > 0 ? resumo(dCritico) : null,
      danoEsperado: arred(esperado, PREVISAO_DO_ATAQUE.casasDoMedio),
      abate: vida == null ? null : arred(abate),
      imune,
      ...(mult !== 1 && !imune ? { mult } : {}),
    },
    final: tudo,
  };
}

export function previsaoDoAtaque(args) {
  const r = previsaoComDist(args);
  return r ? r.previsao : null;
}

/* A chance de a SOMA de vários golpes chegar à vida (o turno inteiro, ou
   os golpes livres de vários inimigos). Soma-se com teto na vida: passar
   dela já é abater, e o teto mantém a conta pequena. */
function abateDaSoma(finais, vida) {
  if (!(vida >= 0)) return null;
  if (vida === 0) return 1;
  let acc = constante(0);
  for (const d of finais) acc = mapear(convolver(acc, d), (v) => Math.min(vida, v));
  return arred(acc.get(vida) || 0);
}

/* ============================================================
   AS FORMAS DO DANO DO HERÓI — a conta do App, na gramática
   ============================================================ */

/* O GOLPE DE ARMA (App.jsx, `resolverAtaqueJogador`), parcela a parcela:
     danoDaClasse(classe, nível, round(danoDe(herói) / 2), { furtivo })
       = max(1, ndados × d(dado da classe) + round((2 + atributo + bónus da
         arma + dados da arma) / 2))     — `danoDe` e `danoDaClasse`, combate.js;
     + bonusDeArma(herói).bonus          — o buff físico (combos.js);
     + danoExtraDeDadiva(herói)          — a dádiva e o poder do item;
     + danoDaForma(herói)                — a garra da forma assumida.
   `opcoes.furtivo === false` tira os dados do Ataque Furtivo — o mesmo
   `vf.soma` que o App passa a `danoDaClasse`. */
export function danoDoGolpe(pers, opcoes) {
  const p = obj(pers);
  if (!p) return null;
  const o = obj(opcoes) || {};
  const nv = Number(p.nivel) || 1;
  const arma = (p.equipados && p.equipados.arma) || null;
  const dadoArma = danoDaArma(arma);
  const atr = modDoGolpe(p, arma);
  const bonusDaArma = (arma && arma.atributos && arma.atributos.dano) || 0;
  const perfil = perfilCombate(p.classe);
  const nd = dadosDeDano(p.classe, nv) - (o.furtivo === false ? dadosDoFurtivo(p.classe, nv) : 0);
  const daClasse = { piso: 1, de: { soma: [{ dado: perfil.dadoBase, n: nd }, { metade: { soma: [2 + atr + bonusDaArma, { dado: dadoArma.faces, n: dadoArma.n }] } }] } };
  return { soma: [daClasse, bonusDeArma(p).bonus + danoExtraDeDadiva(p) + danoDaForma(p)] };
}

/* A HABILIDADE E A MAGIA (App.jsx, o golpe da habilidade):
     h.danoBase + d4 − 1                 — quando a ficha da habilidade traz o
                                           dano;
     ou danoDaClasse(classe dona, nível, atributo) + custo × 3
                                         — os dados da classe DONA da
                                           habilidade, com o atributo dela;
     × 2 no limiar que dobra (`opcoes.dobra`);
     + bonusDeDano(herói, h).bonus       — o buff da escola certa;
     × o combo (`opcoes.combo.mult`, arredondado);
     + danoExtraDeDadiva(herói). */
export function danoDaHabilidade(pers, hab, opcoes) {
  const p = obj(pers), h = obj(hab);
  if (!p || !h) return null;
  const o = obj(opcoes) || {};
  const nv = Number(p.nivel) || 1;
  let f;
  if (h.danoBase != null && fin(h.danoBase)) f = { soma: [Number(h.danoBase) - 1, { dado: 4 }] };
  else {
    const classe = classeDaHabilidade(h.nome) || p.classe;
    const atr = valorParaHabilidade(p, h);
    f = { soma: [{ piso: 1, de: { soma: [{ dado: perfilCombate(classe).dadoBase, n: dadosDeDano(classe, nv) }, atr] } }, Math.max(0, Number(h.custo) || 0) * 3] };
  }
  if (o.dobra === true) f = { vezes: 2, de: f };
  const bd = bonusDeDano(p, h).bonus;
  if (bd) f = { soma: [f, bd] };
  const combo = obj(o.combo);
  if (combo && fin(combo.mult)) f = { vezes: Number(combo.mult), de: f };
  return { soma: [f, danoExtraDeDadiva(p)] };
}

/* O GOLPE DE UM INIMIGO (`danoDe(inimigo, true)`, combate.js): o dano da
   ameaça (`DANO_DA_AMEACA`, comum para o que a tabela não tem) + d4 − 1.
   `mult` (opcional): o sopro, `Math.round(danoDe × mult)` — a conta que
   `turnoDosInimigos` rola para a área anunciada (CB6). */
export function danoDoInimigo(inim, mult) {
  const a = inim && inim.ameaca;
  const base = Object.hasOwn(DANO_DA_AMEACA, a) && Number.isFinite(DANO_DA_AMEACA[a]) ? DANO_DA_AMEACA[a] : DANO_DA_AMEACA.comum;
  const f = { soma: [base - 1, { dado: 4 }] };
  return fin(mult) && Number(mult) !== 1 ? { vezes: Number(mult), de: f } : f;
}

/* VÁRIOS GOLPES NO MESMO ALVO (o multiataque anunciado, CB6): a previsão
   de cada um e a chance de a soma o abater. `golpes`: a lista dos `args`
   de `previsaoDoAtaque`; `vida`: a do alvo. */
export function previsaoDeVariosGolpes(golpes, vida) {
  const finais = [], porGolpe = [];
  for (const g of lista(golpes)) { const r = previsaoComDist(g); if (r) { porGolpe.push(r.previsao); finais.push(r.final); } }
  if (!porGolpe.length) return null;
  return {
    porGolpe,
    danoEsperado: arred(porGolpe.reduce((s, p) => s + p.danoEsperado, 0), PREVISAO_DO_ATAQUE.casasDoMedio),
    abate: abateDaSoma(finais, Math.max(0, Number(vida) || 0)),
  };
}

/* ============================================================
   A PREVISÃO DO HERÓI — o golpe, a magia, a habilidade
   `ctx`:
     acao        — "golpe" (padrão) | "habilidade";
     habilidade  — a habilidade (para "habilidade");
     grade, meuLugar — o tabuleiro e a casa do herói (`comb.grade`,
                   `comb.heroi`); sem eles, sem cobertura nem esconderijo;
     gdJogador   — o grau divino do herói (`grauDe`);
     penalidade  — a do alcance por faixa, a do veredito do golpe
                   (`vereditoDoGolpe(...).aoAlcance[i].penalidade`);
     estorvado   — o herói ataca torto (`ataqueEstorvado` do App: sem treino
                   na arma ou na armadura);
     aliados     — os aliados com posição, vida e condições (o furtivo);
     ignora, combo, dobra — o que a habilidade fura, o combo e o limiar
                   (as mesmas peças que o App já calcula antes do golpe);
     andaDe, inimigos — se o herói vai andar antes de golpear: a casa de
                   onde sai e os inimigos (os golpes livres do caminho).
   Devolve a previsão do PRIMEIRO golpe (o que o clique faz primeiro) com:
     golpes      — quantos golpes o turno tem (o ataque extra, a dádiva);
     abateNoTurno— a chance de os golpes do turno, todos no alvo, o abaterem;
     cobertura   — a defesa que o lugar do alvo lhe dá;
     seVantagem  — { chance, abate } com vantagem (se ainda não a tem);
     semCobertura— { chance, abate } com o alvo em campo aberto (se a tem);
     golpesLivres— os golpes que o caminho provoca (se `andaDe`).
   ============================================================ */
export function previsaoDoHeroi(pers, alvo, ctx) {
  const p = obj(pers), al = obj(alvo);
  if (!p || !al) return null;
  const c = obj(ctx) || {};
  const grade = c.grade || null;
  const meuLugar = obj(c.meuLugar) || { nome: p.nome, x: null, y: null };
  const gdJ = Number(c.gdJogador) || 0;
  const gdAlvo = Math.max(0, Number(al.gd) || 0);
  const nv = Number(p.nivel) || 1;
  let cobertura = 0;
  try { cobertura = Number(bonusDefesaEm(grade, al)) || 0; } catch { cobertura = 0; }
  const escopoImune = imunePorEscopo(gdJ, gdAlvo);
  let argsDe, golpes;

  if (c.acao === "habilidade") {
    const h = obj(c.habilidade);
    if (!h) return null;
    const ignora = obj(c.ignora);
    const atr = valorParaHabilidade(p, h);
    const dano = danoDaHabilidade(p, h, { dobra: c.dobra === true, combo: c.combo });
    golpes = 1;
    argsDe = (i, mudar) => ({
      alvo: al, ehAtacanteInimigo: false,
      bonusAtaque: atr + 2 + Math.floor((nv - 1) / 4) + bonusDivino(gdJ, gdAlvo),
      dano, condAtacante: lista(p.condicoes), condAlvo: lista(al.condicoes),
      tipoDano: tipoDeDanoDaHabilidade(h, p), perfilAlvo: perfilDe(al), resistAlvo: resistenciasEquipadas(al),
      bonusDefesaAlvo: ignora && ignora.cobertura ? 0 : (mudar && mudar.semCobertura ? 0 : cobertura),
      ignoraArmadura: !!(ignora && ignora.armadura),
      criticoEm: criticoMinimo(p), escopoImune,
      vantagem: !!(mudar && mudar.vantagem),
    });
  } else {
    const arma = (p.equipados && p.equipados.arma) || null;
    const bonusAtk = modDoGolpe(p, arma) + 2 + Math.floor((nv - 1) / 4) - (Number(c.penalidade) || 0) + bonusDivino(gdJ, gdAlvo);
    const estorvado = c.estorvado === true;
    const invisivel = estaInvisivel(p);
    golpes = ataquesPorTurno(p.classe, nv) + ataquesExtras(p);
    argsDe = (i, mudar) => {
      let esc = false;
      try { esc = i === 0 && !!oculto(p, al, { grade, heroi: meuLugar }); } catch { esc = false; }
      const vantagem = invisivel || esc || !!(mudar && mudar.vantagem);
      let vf = null;
      try {
        vf = vereditoDoFurtivo({
          classe: p.classe, nivel: nv, alvo: al, aliados: lista(c.aliados), vantagem, desvantagem: estorvado,
          condAtacante: lista(p.condicoes), condAlvo: lista(al.condicoes), tipoDano: elementoDaArma(p),
        });
      } catch { vf = null; }
      return {
        alvo: al, ehAtacanteInimigo: false, bonusAtaque: bonusAtk,
        dano: danoDoGolpe(p, vf ? { furtivo: vf.soma } : null),
        condAtacante: lista(p.condicoes), condAlvo: lista(al.condicoes),
        tipoDano: elementoDaArma(p), perfilAlvo: perfilDe(al),
        bonusDefesaAlvo: mudar && mudar.semCobertura ? 0 : cobertura,
        criticoEm: criticoMinimo(p), desvantagem: estorvado, vantagem, escopoImune,
      };
    };
  }

  const primeiro = previsaoComDist(argsDe(0, null));
  if (!primeiro) return null;
  const vida = Math.max(0, Number(al.vida) || 0);
  const turno = (mudar) => {
    const finais = [];
    for (let i = 0; i < golpes; i++) { const r = previsaoComDist(argsDe(i, mudar)); if (r) finais.push(r.final); }
    return abateDaSoma(finais, vida);
  };
  const out = { ...primeiro.previsao, golpes, abateNoTurno: turno(null), cobertura };
  if (primeiro.previsao.modo !== "vantagem") {
    const v = previsaoComDist(argsDe(0, { vantagem: true }));
    if (v) out.seVantagem = { chance: v.previsao.chance, abate: v.previsao.abate, abateNoTurno: turno({ vantagem: true }) };
  }
  if (cobertura > 0 && !(c.acao === "habilidade" && obj(c.ignora) && c.ignora.cobertura)) {
    const s = previsaoComDist(argsDe(0, { semCobertura: true }));
    if (s) out.semCobertura = { chance: s.previsao.chance, abate: s.previsao.abate, abateNoTurno: turno({ semCobertura: true }) };
  }
  if (c.andaDe && Array.isArray(c.inimigos)) out.golpesLivres = golpesLivresAoAndar(c.andaDe, c.inimigos, p, { gdJogador: gdJ });
  return out;
}

/* ============================================================
   O GOLPE LIVRE QUE O CAMINHO PROVOCA
   A regra é a do App ao andar (`moverPara`): quem está colado na casa de
   onde o herói SAI (`adjacentes`, grid.js — o alcance natural de cada um,
   o ogro prende de 3 m) leva um golpe livre, pela porta
   `oportunidadesContraOJogador` → `ataqueDeOportunidade` (combate.js): o
   bónus de `bonusContraOJogador`, o dano da ameaça, a defesa do herói, a
   desvantagem de quem não o vê. Cada golpe com a previsão dele, e o todo:
   a chance de ALGUM acertar, o dano esperado, e a chance de a soma o
   derrubar.
   `de`: a casa de onde sai; `inimigos`: os da luta; `ficha`: o herói.
   ============================================================ */
export function golpesLivresAoAndar(de, inimigos, ficha, opcoes) {
  const f = obj(ficha), d = obj(de);
  if (!f || !d) return null;
  const gd = Number(obj(opcoes) && opcoes.gdJogador) || 0;
  let colados = [];
  try { colados = adjacentes(d, lista(inimigos)); } catch { colados = []; }
  const quem = [], finais = [];
  for (const e of colados) {
    const r = previsaoComDist({
      alvo: f, ehAtacanteInimigo: true, bonusAtaque: bonusContraOJogador(e, gd), dano: danoDoInimigo(e),
      condAtacante: lista(e.condicoes), condAlvo: lista(f.condicoes),
      tipoDano: perfilDe(e).ataque, resistAlvo: resistenciasEquipadas(f), desvantagem: estaInvisivel(f),
    });
    if (!r) continue;
    quem.push({ nome: e.nome, chance: r.previsao.chance, dano: r.previsao.dano, danoCritico: r.previsao.danoCritico, danoEsperado: r.previsao.danoEsperado });
    finais.push(r.final);
  }
  const nenhum = quem.reduce((s, q) => s * (1 - q.chance), 1);
  return {
    quem,
    chanceDeAlgum: arred(quem.length ? 1 - nenhum : 0),
    danoEsperado: arred(quem.reduce((s, q) => s + q.danoEsperado, 0), PREVISAO_DO_ATAQUE.casasDoMedio),
    abate: abateDaSoma(finais, Math.max(0, Number(f.vida) || 0)),
  };
}
