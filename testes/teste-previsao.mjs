/* A PREVISÃO DO GOLPE (CB5, 09/11/2026) — src/previsao.js

   «78% · 6–13 · abate», sobre o alvo, antes do clique. A previsão não tem
   conta própria: é `resolverAtaque` lido face a face, e o dano é a forma
   da MESMA conta que o App rola. Esta suíte prova que o número dito é o
   número que o dado cumpre:

   §1 a tabela e o núcleo: o d20 face a face bate com `chanceDeAcerto`
      (fuga.js), a vantagem, a desvantagem, o 1 e o crítico;
   §2 a forma do dano do herói é a conta do App — a distribuição exata
      contra 20 000 rolagens da linha do App (`danoDaClasse` + …);
   §3 a previsão bate com a rolagem verdadeira, por amostragem (±3 pp na
      chance, no crítico e no abate; ±3% no dano médio): o golpe, a
      vantagem, a desvantagem, a cobertura, o crítico em 19, o Ataque
      Furtivo com o aliado colado, a magia contra a fraqueza;
   §4 a previsão do herói: o turno, a vantagem e a cobertura que mudam;
   §5 o golpe livre que o caminho provoca, contra `oportunidadesContraOJogador`;
   §6 o evento do golpe (CB7): a forma estável que a tela lê;
   §7 determinismo, imutabilidade e lixo. */
import * as P from "../src/previsao.js";
import {
  resolverAtaque, danoDe, danoDaClasse, vereditoDoFurtivo, oportunidadesContraOJogador,
  eventoDoGolpe, EVENTO_DO_GOLPE, ataquesPorTurno, defesaDe, danoBaseDaAmeaca } from "../src/combate.js";
import { chanceDeAcerto } from "../src/fuga.js";
import { completarInimigo } from "../src/bestiario.js";
import { perfilDe, elementoDaArma, resistenciasEquipadas } from "../src/danos.js";
import { bonusDeArma, bonusDeDano, tipoDeDanoDaHabilidade } from "../src/combos.js";
import { danoExtraDeDadiva } from "../src/dadivas.js";
import { danoDaForma } from "../src/habilidades.js";
import { modDoGolpe } from "../src/itens.js";
import { valorParaHabilidade } from "../src/atributos.js";
import { rng, hashSemente, comSorte } from "../src/semente.js";
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const N = 20000;
const perto = (a, b, tol) => Math.abs(a - b) <= tol;

const arma = (nome) => ({ nome, tipo: "arma" });
const GUERREIRO = { nome: "Bran", classe: "Guerreiro", nivel: 5, vida: 44, vidaMax: 44, atributos: { forca: 3, destreza: 2, vigor: 3 }, equipados: { arma: arma("Espada Longa") }, condicoes: [], efeitos: [] };
const LADINO = { nome: "Iara", classe: "Ladino", nivel: 6, vida: 30, vidaMax: 30, atributos: { forca: 0, destreza: 3 }, equipados: { arma: arma("Adaga") }, condicoes: [], efeitos: [] };
const MAGO = { nome: "Elma", classe: "Mago", nivel: 5, vida: 26, vidaMax: 26, atributos: { intelecto: 3, destreza: 1 }, equipados: {}, condicoes: [], efeitos: [] };
const lobo = (extra) => ({ ...completarInimigo({ nome: "Lobo", ameaca: "comum" }, 5), derrotado: false, condicoes: [], ...(extra || {}) });
const troll = () => ({ ...completarInimigo({ nome: "Troll", ameaca: "elite" }, 5), derrotado: false, condicoes: [] });

/* a linha do App (`resolverAtaqueJogador`), rolada N vezes com a sorte semeada */
function amostrarGolpe(pers, alvo, o, semente) {
  let acerto = 0, crit = 0, abate = 0, soma = 0;
  const vida = alvo.vida;
  for (let i = 0; i < N; i++) {
    const rolar = rng(hashSemente(`${semente}|${i}`));
    comSorte(rolar, () => {
      const nv = pers.nivel;
      const vantagem = !!o.vantagem;
      let vf = null;
      try { vf = vereditoDoFurtivo({ classe: pers.classe, nivel: nv, alvo, aliados: o.aliados || [], vantagem, desvantagem: !!o.estorvado, condAtacante: pers.condicoes || [], condAlvo: alvo.condicoes || [], tipoDano: elementoDaArma(pers) }); } catch { vf = null; }
      const r = resolverAtaque({
        rolar, atacante: pers.nome, alvo, ehAtacanteInimigo: false,
        bonusAtaque: modDoGolpe(pers, pers.equipados.arma) + 2 + Math.floor((nv - 1) / 4),
        danoBase: danoDaClasse(pers.classe, nv, Math.round(danoDe(pers, false, rolar) / 2), vf ? { furtivo: vf.soma } : null) + bonusDeArma(pers).bonus + danoExtraDeDadiva(pers) + danoDaForma(pers),
        condAtacante: pers.condicoes || [], condAlvo: alvo.condicoes || [], tipoDano: elementoDaArma(pers), perfilAlvo: perfilDe(alvo),
        bonusDefesaAlvo: o.cobertura || 0, desvantagem: !!o.estorvado, vantagem,
      });
      if (r.resultado === "acerta" || r.resultado === "critico" || r.resultado === "imune") acerto++;
      if (r.resultado === "critico") crit++;
      if (r.dano >= vida) abate++;
      soma += r.dano;
    });
  }
  return { chance: acerto / N, critico: crit / N, abate: abate / N, medio: soma / N };
}
function confere(nome, prev, am) {
  const ok = prev && perto(prev.chance, am.chance, 0.03) && perto(prev.chanceCritico, am.critico, 0.02) && perto(prev.abate, am.abate, 0.03) && perto(prev.danoEsperado, am.medio, Math.max(0.15, am.medio * 0.03));
  t(`${nome}: dito ${prev && (prev.chance * 100).toFixed(1)}% · abate ${prev && (prev.abate * 100).toFixed(1)}% · ${prev && prev.danoEsperado} — rolado ${(am.chance * 100).toFixed(1)}% · ${(am.abate * 100).toFixed(1)}% · ${am.medio.toFixed(2)}`, ok, J({ prev, am }));
}

/* ============================================================ */
sec("§1 a tabela e o núcleo, face a face");
{
  t("a tabela tem as casas e o teto", P.PREVISAO_DO_ATAQUE.casas === 4 && P.PREVISAO_DO_ATAQUE.tetoDoDano > 300);
  const alvo = lobo();
  let difere = 0;
  for (let bonus = -4; bonus <= 14; bonus++) for (const modo of ["", "v", "d"]) for (const crit of [20, 19, 18]) {
    const p = P.previsaoDoAtaque({ alvo, ehAtacanteInimigo: false, bonusAtaque: bonus, dano: 5, vantagem: modo === "v", desvantagem: modo === "d", criticoEm: crit });
    const c = chanceDeAcerto({ bonus, defesa: defesaDe(alvo, true), vantagem: modo === "v", desvantagem: modo === "d", criticoEm: crit });
    if (!p || !perto(p.chance, c, 1e-4)) difere++;
  }
  t("a chance é a de `chanceDeAcerto` (fuga.js) em 171 combinações de bónus, modo e crítico", difere === 0, `${difere} diferenças`);
  const p20 = P.previsaoDoAtaque({ alvo, bonusAtaque: 99, dano: 5 });
  t("o 1 erra sempre (a chance para nos 95%)", p20.chance === 0.95);
  const p0 = P.previsaoDoAtaque({ alvo, bonusAtaque: -99, dano: 5 });
  t("o crítico acerta sempre (5%, todos críticos)", p0.chance === 0.05 && p0.chanceCritico === 0.05);
  t("o dano de um acerto e o do crítico (fixo 5: 5 e 10)", p20.dano.min === 5 && p20.dano.max === 5 && p20.danoCritico.min === 10);
  const imp = P.previsaoDoAtaque({ alvo, bonusAtaque: 5, dano: 5, condAtacante: [{ id: "atordoado", nome: "Atordoado" }] });
  t("quem perdeu a ação não acerta (impedido)", !!imp && imp.impedido === true && imp.chance === 0);
  const imune = P.previsaoDoAtaque({ alvo, bonusAtaque: 5, dano: 5, escopoImune: true });
  t("o escopo divino: acerta, e não fere", imune.chance > 0 && imune.danoEsperado === 0 && imune.imune === true);
  const fr = P.previsaoDoAtaque({ alvo: troll(), bonusAtaque: 5, dano: 10, tipoDano: "fogo", perfilAlvo: perfilDe(troll()) });
  t("a fraqueza multiplica (×1,5) e diz o multiplicador", fr.dano.min === 15 && fr.mult === 1.5);
}

/* ============================================================ */
sec("§2 a forma do dano é a conta do App");
{
  for (const pers of [GUERREIRO, LADINO]) for (const furtivo of [null, false]) {
    const forma = P.danoDoGolpe(pers, furtivo === false ? { furtivo: false } : null);
    const prev = P.previsaoDoAtaque({ alvo: lobo({ vida: 999 }), bonusAtaque: 99, dano: forma });
    let soma = 0, min = Infinity, max = -Infinity;
    for (let i = 0; i < N; i++) {
      const rolar = rng(hashSemente(`forma|${pers.nome}|${furtivo}|${i}`));
      const v = comSorte(rolar, () => danoDaClasse(pers.classe, pers.nivel, Math.round(danoDe(pers, false, rolar) / 2), furtivo === false ? { furtivo: false } : null) + bonusDeArma(pers).bonus + danoExtraDeDadiva(pers) + danoDaForma(pers));
      soma += v; min = Math.min(min, v); max = Math.max(max, v);
    }
    t(`${pers.classe}${furtivo === false ? " sem furtivo" : ""}: o dano ${prev.dano.min}–${prev.dano.max} (média ${prev.dano.medio}) é o que a linha do App rola (${min}–${max}, ${(soma / N).toFixed(2)})`,
      prev.dano.min === min && prev.dano.max === max && perto(prev.dano.medio, soma / N, 0.08));
  }
  const h = { nome: "Raio de Fogo", custo: 2 };
  const forma = P.danoDaHabilidade(MAGO, h);
  const prev = P.previsaoDoAtaque({ alvo: lobo({ vida: 999 }), bonusAtaque: 99, dano: forma });
  let soma = 0;
  for (let i = 0; i < N; i++) {
    const rolar = rng(hashSemente(`hab|${i}`));
    soma += comSorte(rolar, () => danoDaClasse(MAGO.classe, MAGO.nivel, valorParaHabilidade(MAGO, h)) + 2 * 3 + bonusDeDano(MAGO, h).bonus + danoExtraDeDadiva(MAGO));
  }
  t(`a magia: média ${prev.dano.medio} contra ${(soma / N).toFixed(2)} da linha do App`, perto(prev.dano.medio, soma / N, 0.1));
  const comBase = P.danoDaHabilidade(MAGO, { nome: "Golpe Fixo", danoBase: 8 });
  const pb = P.previsaoDoAtaque({ alvo: lobo({ vida: 999 }), bonusAtaque: 99, dano: comBase });
  t("a habilidade com dano na ficha: danoBase + d4 − 1 (8–11)", pb.dano.min === 8 && pb.dano.max === 11);
  const dobro = P.previsaoDoAtaque({ alvo: lobo({ vida: 999 }), bonusAtaque: 99, dano: P.danoDaHabilidade(MAGO, { nome: "Golpe Fixo", danoBase: 8 }, { dobra: true }) });
  t("o limiar que dobra dobra (16–22)", dobro.dano.min === 16 && dobro.dano.max === 22);
}

/* ============================================================ */
sec("§3 a previsão bate com a rolagem verdadeira (por amostragem)");
{
  const vivo = (v) => lobo({ vida: v });
  confere("o golpe do guerreiro no lobo (vida 12)", P.previsaoDoHeroi(GUERREIRO, vivo(12), {}), amostrarGolpe(GUERREIRO, vivo(12), {}, "g1"));
  const cego = lobo({ vida: 14, condicoes: [{ id: "cego", nome: "Cego" }] });
  confere("com vantagem (o alvo cego)", P.previsaoDoHeroi(GUERREIRO, cego, {}), amostrarGolpe(GUERREIRO, cego, {}, "g2"));
  confere("com desvantagem (estorvado)", P.previsaoDoHeroi(GUERREIRO, vivo(12), { estorvado: true }), amostrarGolpe(GUERREIRO, vivo(12), { estorvado: true }, "g3"));
  /* a cobertura e o crítico em 19 pelo núcleo, com a forma do golpe */
  {
    const alvo = vivo(12);
    const forma = P.danoDoGolpe(GUERREIRO, null);
    const prev = P.previsaoDoAtaque({ alvo, ehAtacanteInimigo: false, bonusAtaque: 5, dano: forma, bonusDefesaAlvo: 2, criticoEm: 19, tipoDano: "fisico", perfilAlvo: perfilDe(alvo) });
    let ac = 0, cr = 0, ab = 0, soma = 0;
    for (let i = 0; i < N; i++) {
      const rolar = rng(hashSemente(`nucleo|${i}`));
      comSorte(rolar, () => {
        const r = resolverAtaque({ rolar, atacante: "Bran", alvo, ehAtacanteInimigo: false, bonusAtaque: 5, danoBase: danoDaClasse(GUERREIRO.classe, 5, Math.round(danoDe(GUERREIRO, false, rolar) / 2)), bonusDefesaAlvo: 2, criticoEm: 19, tipoDano: "fisico", perfilAlvo: perfilDe(alvo) });
        if (r.resultado === "acerta" || r.resultado === "critico") ac++;
        if (r.resultado === "critico") cr++;
        if (r.dano >= 12) ab++;
        soma += r.dano;
      });
    }
    confere("a cobertura (+2) e o crítico em 19", prev, { chance: ac / N, critico: cr / N, abate: ab / N, medio: soma / N });
  }
  /* o Ataque Furtivo com o aliado colado */
  {
    const alvo = lobo({ vida: 16, x: 5, y: 5 });
    const aliados = [{ nome: "Bran", x: 5, y: 6, vida: 30, condicoes: [] }];
    const prev = P.previsaoDoHeroi(LADINO, alvo, { aliados });
    const sem = P.previsaoDoHeroi(LADINO, alvo, { aliados: [] });
    confere("o Ataque Furtivo com o aliado colado", prev, amostrarGolpe(LADINO, alvo, { aliados }, "f1"));
    confere("e sem o aliado (o furtivo não soma)", sem, amostrarGolpe(LADINO, alvo, { aliados: [] }, "f2"));
    t("o aliado colado sobe o dano dito", prev.danoEsperado > sem.danoEsperado);
  }
  /* a magia contra a fraqueza */
  {
    const h = { nome: "Raio de Fogo", custo: 2 };
    const alvo = { ...troll(), vida: 20 };
    const prev = P.previsaoDoHeroi(MAGO, alvo, { acao: "habilidade", habilidade: h });
    let ac = 0, cr = 0, ab = 0, soma = 0;
    for (let i = 0; i < N; i++) {
      const rolar = rng(hashSemente(`magia|${i}`));
      comSorte(rolar, () => {
        const atr = valorParaHabilidade(MAGO, h);
        const r = resolverAtaque({ rolar, atacante: "Elma", alvo, ehAtacanteInimigo: false, bonusAtaque: atr + 2 + 1, danoBase: danoDaClasse(MAGO.classe, 5, atr) + 6 + bonusDeDano(MAGO, h).bonus + danoExtraDeDadiva(MAGO),
          condAtacante: [], condAlvo: [], tipoDano: tipoDeDanoDaHabilidade(h, MAGO), perfilAlvo: perfilDe(alvo), resistAlvo: resistenciasEquipadas(alvo), bonusDefesaAlvo: 0, criticoEm: 20 });
        if (r.resultado === "acerta" || r.resultado === "critico") ac++;
        if (r.resultado === "critico") cr++;
        if (r.dano >= 20) ab++;
        soma += r.dano;
      });
    }
    confere("a magia de fogo no troll (a fraqueza)", prev, { chance: ac / N, critico: cr / N, abate: ab / N, medio: soma / N });
    t("e a previsão diz a fraqueza", prev.mult === 1.5);
  }
}

/* ============================================================ */
sec("§4 a previsão do herói: o turno, a vantagem, a cobertura");
{
  const alvo = lobo({ vida: 20 });
  const p = P.previsaoDoHeroi(GUERREIRO, alvo, {});
  t("o turno tem os golpes da classe (o guerreiro de nível 5 dá 2)", p.golpes === ataquesPorTurno("Guerreiro", 5));
  t("os dois golpes abatem mais do que um", p.abateNoTurno > p.abate, `${p.abate} → ${p.abateNoTurno}`);
  t("a vantagem diz quanto sobe", !!p.seVantagem && p.seVantagem.chance > p.chance && p.seVantagem.abateNoTurno >= p.abateNoTurno);
  t("sem cobertura, não há linha da cobertura", p.cobertura === 0 && !("semCobertura" in p));
  /* o abate do turno, por amostragem (os dois golpes no mesmo alvo) */
  let caiu = 0;
  for (let i = 0; i < N; i++) {
    const rolar = rng(hashSemente(`turno|${i}`));
    let vida = 20;
    comSorte(rolar, () => {
      for (let g = 0; g < 2; g++) {
        const r = resolverAtaque({ rolar, atacante: "Bran", alvo, ehAtacanteInimigo: false, bonusAtaque: 3 + 2 + 1, danoBase: danoDaClasse("Guerreiro", 5, Math.round(danoDe(GUERREIRO, false, rolar) / 2)), condAtacante: [], condAlvo: [], tipoDano: "fisico", perfilAlvo: perfilDe(alvo) });
        vida -= r.dano;
      }
    });
    if (vida <= 0) caiu++;
  }
  t(`o abate do turno dito (${(p.abateNoTurno * 100).toFixed(1)}%) é o rolado (${(caiu / N * 100).toFixed(1)}%)`, perto(p.abateNoTurno, caiu / N, 0.03));
  const pen = P.previsaoDoHeroi(GUERREIRO, alvo, { penalidade: 2 });
  t("a penalidade da faixa desce a chance", pen.chance < p.chance && pen.bonus === p.bonus - 2);
  const deus = P.previsaoDoHeroi(GUERREIRO, { ...alvo, gd: 4 }, { gdJogador: 0 });
  t("o alvo três degraus acima: acerta e não fere", deus.imune === true && deus.danoEsperado === 0 && deus.abateNoTurno === 0);
}

/* ============================================================ */
sec("§5 o golpe livre que o caminho provoca");
{
  const heroi = { ...GUERREIRO, condicoes: [] };
  const de = { nome: "Bran", x: 5, y: 5 };
  const colado = lobo({ nome: "Lobo 1", x: 5, y: 6 });
  const longe = lobo({ nome: "Lobo 2", x: 12, y: 12 });
  const g = P.golpesLivresAoAndar(de, [colado, longe], heroi, {});
  t("só quem está colado na casa de onde se sai golpeia", g.quem.length === 1 && g.quem[0].nome === "Lobo 1");
  let ac = 0;
  for (let i = 0; i < N; i++) {
    const ops = oportunidadesContraOJogador([colado], heroi, 0, { rolar: rng(hashSemente(`op|${i}`)) });
    if (ops[0].r.dano > 0 || ops[0].r.resultado === "acerta" || ops[0].r.resultado === "critico") ac++;
  }
  t(`a chance dita (${(g.quem[0].chance * 100).toFixed(1)}%) é a rolada por oportunidadesContraOJogador (${(ac / N * 100).toFixed(1)}%)`, perto(g.quem[0].chance, ac / N, 0.03));
  /* MOVIDA (10/11, CB13), E O MOTIVO: o Lobo é comum de nível 1, e o comum do
     começo bate mais leve (DANO_NO_COMECO, combate.js: 3 + d4 − 1). A intenção
     fica: o dano previsto é o da leitura única que o golpe rola. */
  t("o dano do lobo é o da ameaça, pela leitura do golpe (o comum de nível 1: 3 + d4 − 1, 3–6)", g.quem[0].dano.min === danoBaseDaAmeaca(colado) && g.quem[0].dano.max === danoBaseDaAmeaca(colado) + 3 && danoBaseDaAmeaca(colado) === 3);
  t("ninguém colado: nada a pagar", P.golpesLivresAoAndar({ x: 0, y: 0 }, [longe], heroi, {}).chanceDeAlgum === 0);
  const pv = P.previsaoDoHeroi(GUERREIRO, lobo({ vida: 10 }), { andaDe: de, inimigos: [colado, longe] });
  t("a previsão do herói que anda leva os golpes livres junto", !!pv.golpesLivres && pv.golpesLivres.quem.length === 1);
}

/* ============================================================ */
sec("§6 o evento do golpe (CB7)");
{
  const alvo = troll();
  const crit = resolverAtaque({ rolar: () => 0.999, atacante: "Elma", alvo, bonusAtaque: 5, danoBase: 10, tipoDano: "fogo", perfilAlvo: perfilDe(alvo) });
  const e = eventoDoGolpe(crit, { vidaAntes: 20, vidaMax: 59, lado: "heroi" });
  t("o crítico de fogo no troll: desfecho, dano, fraqueza", e.desfecho === "critico" && e.critico === true && e.fraqueza === "fraqueza" && e.dano === 30 && e.elemento === "fogo", J(e));
  t("e o abate, com a vida antes", e.abate === true && e.vidaDepois === 0 && e.peso === Math.min(1, 30 / 59));
  const erro = eventoDoGolpe(resolverAtaque({ rolar: () => 0.3, atacante: "Bran", alvo, bonusAtaque: -10, danoBase: 5 }), { vidaAntes: 59, vidaMax: 59 });
  t("o erro: desfecho erro, dano 0, não abate", erro.desfecho === "erro" && erro.dano === 0 && erro.abate === false && erro.fraqueza === null);
  const desastre = eventoDoGolpe(resolverAtaque({ rolar: () => 0, atacante: "Bran", alvo, bonusAtaque: 50, danoBase: 5 }), {});
  t("o 1 natural é erro, com desastre: true; sem vida, abate null (não se sabe)", desastre.desfecho === "erro" && desastre.desastre === true && desastre.abate === null);
  const imp = eventoDoGolpe(resolverAtaque({ atacante: "Bran", alvo, bonusAtaque: 5, danoBase: 5, condAtacante: [{ id: "atordoado", nome: "Atordoado" }] }), {});
  t("o impedido", imp.desfecho === "impedido");
  const im = eventoDoGolpe({ tipo: "ataque", resultado: "imune", dano: 0, mult: 0, tipoDano: "veneno" }, {});
  t("o imune", im.desfecho === "imune" && im.fraqueza === "imune");
  const res = eventoDoGolpe({ tipo: "ataque", resultado: "acerta", dano: 3, mult: 0.5, tipoDano: "fogo" }, {});
  t("o que resiste", res.fraqueza === "resiste");
  t("a forma é estável: a versão, e sempre as mesmas chaves", e.versao === EVENTO_DO_GOLPE.versao && J(Object.keys(e)) === J(Object.keys(erro)) && J(Object.keys(e)) === J(Object.keys(desastre)));
  t("o golpe comum não ganha a chave mult (só quando o multiplicador morde)", !("mult" in resolverAtaque({ rolar: () => 0.9, atacante: "x", alvo: lobo(), bonusAtaque: 5, danoBase: 5 })));
  t("lixo: null", eventoDoGolpe(null) === null && eventoDoGolpe(undefined, null) === null);
}

/* ============================================================ */
sec("§7 determinismo, imutabilidade, lixo");
{
  const alvo = lobo({ vida: 12 });
  const a = J(P.previsaoDoHeroi(GUERREIRO, alvo, {})), b = J(P.previsaoDoHeroi(GUERREIRO, alvo, {}));
  t("a mesma entrada, a mesma previsão (sem sorte nenhuma)", a === b);
  const antesP = J(GUERREIRO), antesA = J(alvo);
  P.previsaoDoHeroi(GUERREIRO, alvo, { estorvado: true });
  P.golpesLivresAoAndar({ x: 5, y: 5 }, [alvo], GUERREIRO, {});
  t("imutável: o herói e o alvo ficam como vieram", J(GUERREIRO) === antesP && J(alvo) === antesA);
  t("lixo: null em toda porta", P.previsaoDoAtaque(null) === null && P.previsaoDoAtaque({}) === null && P.previsaoDoHeroi(null, alvo) === null && P.previsaoDoHeroi(GUERREIRO, null) === null
    && P.golpesLivresAoAndar(null, [], GUERREIRO) === null && P.danoDoGolpe(null) === null && P.danoDaHabilidade(GUERREIRO, null) === null);
  t("a forma podre dá null, não NaN", P.previsaoDoAtaque({ alvo, bonusAtaque: 5, dano: { podre: true } }) === null && P.previsaoDoAtaque({ alvo, bonusAtaque: 5, dano: { dado: -3 } }) === null);
  t("a habilidade sem habilidade: null", P.previsaoDoHeroi(MAGO, alvo, { acao: "habilidade" }) === null);
  t("opções nulas não estouram (`= {}` não cobre null)", !!P.previsaoDoHeroi(GUERREIRO, alvo, null) && !!P.danoDoGolpe(GUERREIRO, null));
  const varios = P.previsaoDeVariosGolpes([{ alvo, bonusAtaque: 99, dano: 6 }, { alvo, bonusAtaque: 99, dano: 6 }], 12);
  t("vários golpes: a soma abate quando os dois acertam (0,95²)", perto(varios.abate, 0.9025 + 2 * 0.95 * 0.05 * 0, 0.06) && varios.porGolpe.length === 2);
  t("o dano do inimigo pela ameaça (o comum: 5–8) e o sopro vezes dois (10–16)",
    J(P.previsaoDoAtaque({ alvo, bonusAtaque: 99, dano: P.danoDoInimigo({ ameaca: "comum" }) }).dano) === J({ min: 5, medio: 6.5, max: 8 })
    && P.previsaoDoAtaque({ alvo, bonusAtaque: 99, dano: P.danoDoInimigo({ ameaca: "comum" }, 2) }).dano.max === 16);
}

/* ============================================================ */
sec("§CB lote 2 · a soma dos golpes num vetor — a mesma conta, ao byte");
{
  /* CB lote 2 (10/11): `abateDaSoma` (previsao.js) passou do Map de valor →
     chance a um vetor (a régua do poder com o anúncio somava os golpes de
     cinco lendários a cada rodada). A prova é contra o previsao.js de ANTES,
     lido do git no commit fixo (89a1649, o lote 1 no ar), com os mesmos
     módulos de hoje por baixo: `previsaoDeVariosGolpes` igual, ao byte, em
     1500 somas sorteadas (1 a 12 golpes, as cinco ameaças, o sopro dobrado,
     vida de 0 a 220, vantagem e desvantagem). */
  const RAIZ = new URL("..", import.meta.url);
  /* 10/11: a prova limpa corre de um `git archive`, sem .git — ali o histórico
     não existe, e esta prova de equivalência (contra o ficheiro de ANTES) salta
     com aviso. Na árvore real corre sempre. Não é uma regra: é a prova de que
     uma otimização não mudou a conta, e essa prova vive onde há histórico. */
  let textoDoGit = null;
  try { textoDoGit = execSync("git show 89a1649:src/previsao.js", { cwd: RAIZ, encoding: "utf8", maxBuffer: 1 << 26, stdio: ["ignore", "pipe", "ignore"] }); } catch { textoDoGit = null; }
  if (textoDoGit == null) { console.log("  --  saltada: sem histórico do git (prova limpa); corre na árvore real"); }
  else {
  const texto = textoDoGit.split(String.fromCharCode(13)).join("")
    .replace(/from "\.\/([^"]+)"/g, (_, m) => `from "${new URL("../src/" + m, import.meta.url).href}"`);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "taverna-previsao-"));
  const arq = path.join(dir, "previsao-antes.mjs");
  fs.writeFileSync(arq, texto);
  const V = await import(pathToFileURL(arq).href);
  const r = rng(hashSemente("cb2|vetor"));
  const amz = ["fraco", "comum", "competente", "elite", "lendario"];
  let iguais = 0, n = 0;
  for (let i = 0; i < 1500; i++) {
    const ng = 1 + Math.floor(r() * 12), vida = Math.floor(r() * 221);
    const golpes = Array.from({ length: ng }, () => ({ alvo: { vida, defesa: 10 + Math.floor(r() * 10) }, ehAtacanteInimigo: true, bonusAtaque: Math.floor(r() * 12), dano: P.danoDoInimigo({ ameaca: amz[Math.floor(r() * 5)], nivel: 5 }, r() < 0.2 ? 2 : 1), vantagem: r() < 0.2, desvantagem: r() < 0.2 }));
    n++;
    if (JSON.stringify(P.previsaoDeVariosGolpes(golpes, vida)) === JSON.stringify(V.previsaoDeVariosGolpes(golpes, vida))) iguais++;
  }
  fs.rmSync(dir, { recursive: true, force: true });
  t(`o vetor dá o mesmo do Map de antes em ${iguais} de ${n} somas`, iguais === n);
  }
}

console.log(`\na previsão do golpe: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
