/* A INTENÇÃO DO INIMIGO (CB6, 09/11/2026) — src/intencao.js e o parâmetro
   `intencoes` de `turnoDosInimigos` (combate.js)

   Into the Breach: a ameaça anunciada e cumprida. Esta suíte prova:
   §1 as tabelas (os tipos, a mente que esconde, os sopros, o recurso);
   §2 o anunciado é o cumprido: com a mesa como estava, toda intenção se
      cumpre — o alvo de cada golpe, golpe a golpe —, na ordem do App
      (o passo de `moverInimigos`, depois a vez deles);
   §3 quando o herói muda as condições, manda o recurso escrito: o alvo
      caiu, saiu do alcance, a provocação;
   §4 o sopro pinta as casas, queima quem lá ficou, e quem saiu escapa;
   §5 a previsão da intenção bate com a rolagem (±3 pp);
   §6 a mente que esconde, e a ameaça somada por alvo;
   §7 a régua de combate com a intenção: o que muda, e que nenhum dente cai;
   §8 determinismo, imutabilidade, lixo. */
import * as I from "../src/intencao.js";
import { turnoDosInimigos, RECURSO_DA_INTENCAO, ataquesDoInimigo } from "../src/combate.js";
import { moverInimigos } from "../src/grid.js";
import { abrirOCombate } from "../src/motor/combate-do-turno.js";
import { DEGRAUS } from "../src/degraus.js";
import { criaturasDoGenero } from "../src/bestiario.js";
import { rng, hashSemente } from "../src/semente.js";
import { simularCombate, medir, INTENCAO_NA_REGUA, CATRACA_DE_UMA_VIDA, linhaDaMetrica } from "./regua-combate.mjs";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const S = (s) => rng(hashSemente(s));

const pers = (nivel = 6) => ({
  nome: "Bran", classe: "Guerreiro", nivel, vida: 60, vidaMax: 60, atributos: { forca: 3, destreza: 2, vigor: 3 }, equipados: {}, condicoes: [],
  grupo: [{ nome: "Elma", classe: "Mago", nivel, vida: 34, vidaMax: 34, atributos: {}, condicoes: [] }],
});
function luta(crus, semente, nivel = 6, situacao = "declarada") {
  const p = pers(nivel);
  const r = abrirOCombate({ inimigosCrus: crus, pers: p, situacao, planta: { bioma: "planicie", emViagem: true }, sementeDaAbertura: semente },
    { sorteDoTurno: (k) => S(`${semente}|${k}`) });
  return { comb: r.combateNoRef, p };
}
const ctxDe = (p, semente, extra) => ({ jogador: p, grupo: p.grupo, gdJogador: 0, sorte: S(`int|${semente}`), ...(extra || {}) });
/* a vez deles na ordem do App: o passo, depois os golpes */
function vezDeles(comb, p, intencoes, semente, extra) {
  const e = extra || {};
  const heroi = e.heroi || comb.heroi;
  const mv = moverInimigos(comb.grade, comb.inimigos, heroi, [heroi, ...(comb.aliados || [])]);
  return turnoDosInimigos({ inimigos: mv.inimigos, jogador: p, grupo: e.grupo || p.grupo, grade: comb.grade, heroi, aliados: comb.aliados, rodada: comb.rodada || 1, provocado: !!e.provocado, intencoes, sorte: S(`exe|${semente}`) });
}

/* ============================================================ */
sec("§1 as tabelas");
{
  const T = I.INTENCAO_DO_INIMIGO;
  t("os quatro tipos", J(T.tipos) === J(["atacar", "sopro", "aproximar", "fugir"]));
  t("só a mente brilhante esconde o alvo (e é um degrau que existe)", J(T.escondeAlvo) === J(["brilhante"]) && T.escondeAlvo.every((d) => DEGRAUS.some((x) => x.id === d)));
  const banco = criaturasDoGenero("Fantasia medieval") || [];
  for (const [nome, s] of Object.entries(I.SOPROS_DO_BESTIARIO)) {
    const c = banco.find((x) => x.nome === nome);
    t(`${nome}: existe no bestiário, e o sopro vale os golpes do multiataque que troca (${s.multDano})`, !!c && s.multDano === ataquesDoInimigo(c.ameaca, c.nivelRef) && s.recarga >= 2 && s.raioM > 0);
  }
  t("o recurso tem uma regra para cada mudança", ["alvoCaiu", "foraDeAlcance", "provocado", "aproximar", "soproVazio"].every((k) => typeof RECURSO_DA_INTENCAO[k] === "string") && Object.isFrozen(RECURSO_DA_INTENCAO));
}

/* ============================================================ */
sec("§2 o anunciado é o cumprido");
{
  const nomes = ["Lobo", "Bandido", "Goblin", "Atirador", "Esqueleto"];
  let lutas = 0, golpes = 0, quebras = 0, aproximar = 0, aproxComGolpe = 0;
  for (let i = 0; i < 60; i++) {
    const n = 2 + (i % 3);
    const crus = Array.from({ length: n }, (_, k) => ({ nome: `${nomes[(i + k) % nomes.length]} ${k + 1}`, ameaca: k % 2 ? "comum" : "fraco", nivel: 4 }));
    const { comb, p } = luta(crus, `cumpre|${i}`, 6, i % 2 ? "declarada" : "emboscada");
    const ints = I.intencoesDaRodada(comb, ctxDe(p, i));
    const acoes = vezDeles(comb, p, ints, i);
    lutas++;
    for (const it of ints.lista) {
      const meus = acoes.filter((a) => a.inimigo === it.inimigo);
      if (it.tipo === "aproximar") { aproximar++; if (meus.length) aproxComGolpe++; continue; }
      if (it.tipo !== "atacar") continue;
      /* o golpe anunciado «a caminho» (perdido) não sai com a mesa parada */
      const certos = it.alvos.filter((x) => !x.perdido);
      if (meus.length !== certos.length) quebras++;
      meus.forEach((a, g) => { golpes++; if (a.intencao !== "cumprida" || a.alvoNome !== certos[g].nome || a.alvoRef !== certos[g].ref) quebras++; });
    }
  }
  t(`em ${lutas} lutas, ${golpes} golpes anunciados caem todos onde se disse`, golpes > 50 && quebras === 0, `${quebras} quebras`);
  t(`quem anunciou que se aproximava não golpeia (${aproximar} anúncios)`, aproxComGolpe === 0);
  const { comb, p } = luta([{ nome: "Lobo 1", ameaca: "comum", nivel: 4 }], "bal|1", 6, "emboscada");
  const ints = I.intencoesDaRodada(comb, ctxDe(p, "bal"));
  const ac = vezDeles(comb, p, ints, "bal");
  const bal = I.balancoDasIntencoes(ints, ac, comb.inimigos);
  t("o balanço diz «cumprida» quando foi", bal.length === 1 && (bal[0].desfecho === "cumprida" || bal[0].desfecho === "aproximou"), J(bal));
  t("sem intenções, a vez deles é a de sempre (a ação não ganha a chave)", vezDeles(comb, p, null, "bal").every((a) => !("intencao" in a)));
}

/* ============================================================ */
sec("§3 o herói muda as condições: o recurso escrito");
{
  /* um lobo colado no herói, a Elma ao lado */
  const achar = (pred) => {
    for (let i = 0; i < 80; i++) {
      const L = luta([{ nome: "Lobo 1", ameaca: "comum", nivel: 4 }, { nome: "Lobo 2", ameaca: "comum", nivel: 4 }], `rec|${i}`, 6, "emboscada");
      const ints = I.intencoesDaRodada(L.comb, ctxDe(L.p, `rec|${i}`));
      const it = ints.lista.find(pred);
      if (it) return { ...L, ints, it, i };
    }
    return null;
  };
  const naElma = achar((x) => x.tipo === "atacar" && x.alvos.some((a) => a.nome === "Elma"));
  if (naElma) {
    const grupo = naElma.p.grupo.map((g) => ({ ...g, vida: 0 }));
    const ac = vezDeles(naElma.comb, naElma.p, naElma.ints, "rec-a", { grupo }).filter((a) => a.inimigo === naElma.it.inimigo);
    t("a Elma caiu antes da vez dele: «alvoCaiu», e a mesma mente escolhe outro", ac.length > 0 && ac.every((a) => a.intencao === "alvoCaiu" || a.intencao === "cumprida") && ac.some((a) => a.intencao === "alvoCaiu") && ac.every((a) => a.alvoNome !== "Elma"), J(ac.map((a) => [a.alvoNome, a.intencao])));
  } else t("achou-se uma luta com um lobo na Elma", false);
  const noHeroi = achar((x) => x.tipo === "atacar" && x.alvos.every((a) => a.ref === "jogador"));
  if (noHeroi) {
    /* os inimigos já andaram (as casas do anúncio) e o herói, depois, saiu-lhes
       do alcance: a vez deles corre sem passo novo */
    const C = noHeroi.comb;
    const postos = moverInimigos(C.grade, C.inimigos, C.heroi, [C.heroi, ...(C.aliados || [])]).inimigos;
    let longe = null;
    for (let x = C.grade.largura - 1; x >= 0 && !longe; x--) for (let y = C.grade.altura - 1; y >= 0 && !longe; y--) {
      const livre = !postos.some((e) => e.x === x && e.y === y) && !(C.aliados || []).some((a) => a.x === x && a.y === y);
      if (livre && postos.every((e) => Math.max(Math.abs(e.x - x), Math.abs(e.y - y)) > 2)) longe = { ...C.heroi, x, y };
    }
    const ac = turnoDosInimigos({ inimigos: postos, jogador: noHeroi.p, grupo: noHeroi.p.grupo, grade: C.grade, heroi: longe, aliados: C.aliados, rodada: 1, intencoes: noHeroi.ints, sorte: S("rec-b") })
      .filter((a) => a.inimigo === noHeroi.it.inimigo);
    const bal = I.balancoDasIntencoes(noHeroi.ints, ac, postos).find((b) => b.inimigo === noHeroi.it.inimigo);
    t("o herói saiu do alcance: nenhum golpe nele, quem golpeia é por «foraDeAlcance», e o balanço diz porquê",
      !!longe && ac.every((a) => a.alvoRef !== "jogador" && a.intencao === "foraDeAlcance") && bal.desfecho === "mudou" && bal.porque === "foraDeAlcance", J({ longe, ac: ac.map((a) => [a.alvoNome, a.intencao]), bal }));
    const prov = vezDeles(noHeroi.comb, noHeroi.p, noHeroi.ints, "rec-c", { provocado: true }).filter((a) => a.inimigo === noHeroi.it.inimigo);
    t("a provocação manda sobre a intenção (o recurso diz «provocado»)", prov.length > 0 && prov.every((a) => a.intencao === "provocado" && a.alvoRef === "jogador"));
  } else t("achou-se uma luta com um lobo no herói", false);
}

/* ============================================================ */
sec("§4 o sopro pinta as casas, e quem sai escapa");
{
  const { comb, p } = luta([{ nome: "Dragão Jovem", ameaca: "lendario", nivel: 10 }], "sopro|1", 12, "encontro");
  const ints = I.intencoesDaRodada(comb, ctxDe(p, "sopro"));
  const it = ints.lista[0];
  t("na rodada 1 o dragão anuncia o sopro, com as casas e o dano", it.tipo === "sopro" && it.area.length > 5 && it.vista.area.length === it.area.length && it.vista.dano && it.vista.dano.min > 0, J(it.vista && it.vista.dano));
  const dentro = it.area.some((q) => q.x === comb.heroi.x && q.y === comb.heroi.y);
  const acoes = turnoDosInimigos({ inimigos: comb.inimigos, jogador: p, grupo: p.grupo, grade: comb.grade, heroi: comb.heroi, aliados: comb.aliados, rodada: 1, intencoes: ints, sorte: S("sopro-exe") });
  t("quem ficou nas casas leva o sopro (área, cumprida)", dentro && acoes.some((a) => a.alvoRef === "jogador" && a.area === true && a.intencao === "cumprida"));
  t("o sopro é a vez inteira: um golpe por alvo, nunca o multiataque junto", acoes.every((a) => a.area === true) && new Set(acoes.map((a) => a.alvoNome)).size === acoes.length);
  /* todos saem das casas */
  const area = new Set(it.area.map((q) => `${q.x},${q.y}`));
  const fora = (ent) => { for (let x = 0; x < comb.grade.largura; x++) for (let y = 0; y < comb.grade.altura; y++) if (!area.has(`${x},${y}`) && !(x === comb.inimigos[0].x && y === comb.inimigos[0].y) && (Math.abs(x - comb.inimigos[0].x) > 1 || Math.abs(y - comb.inimigos[0].y) > 1)) return { ...ent, x, y }; return ent; };
  const heroiFora = fora(comb.heroi);
  const aliadosFora = comb.aliados.map((a) => { const f = fora(a); return f.x === heroiFora.x && f.y === heroiFora.y ? { ...f, y: f.y === 0 ? 1 : 0 } : f; });
  const vazio = turnoDosInimigos({ inimigos: comb.inimigos, jogador: p, grupo: p.grupo, grade: comb.grade, heroi: heroiFora, aliados: aliadosFora, rodada: 1, intencoes: ints, sorte: S("sopro-exe") });
  t("todos saíram das casas: ninguém leva dano", vazio.length === 0, J(vazio.map((a) => a.alvoNome)));
  t("e o balanço diz «esquivaram»", I.balancoDasIntencoes(ints, vazio, comb.inimigos)[0].desfecho === "esquivaram");
  const r2 = I.intencoesDaRodada({ ...comb, rodada: 2 }, ctxDe(p, "sopro2"));
  const r4 = I.intencoesDaRodada({ ...comb, rodada: 4 }, ctxDe(p, "sopro4"));
  t("a recarga: na rodada 2 não há sopro, na 4 há outra vez", r2.lista[0].tipo !== "sopro" && r4.lista[0].tipo === "sopro");
  t("sem tabuleiro não há sopro (a área precisa de casas)", I.intencoesDaRodada({ ...comb, grade: null }, ctxDe(p, "s0")).lista[0].tipo !== "sopro");
}

/* ============================================================ */
sec("§5 a previsão da intenção bate com a rolagem");
{
  let caso = null;
  for (let i = 0; i < 80 && !caso; i++) {
    const L = luta([{ nome: "Bandido 1", ameaca: "comum", nivel: 5 }], `prev|${i}`, 6, "emboscada");
    const ints = I.intencoesDaRodada(L.comb, ctxDe(L.p, `prev|${i}`));
    const it = ints.lista[0];
    if (it.tipo === "atacar") caso = { ...L, ints, it, i };
  }
  if (caso) {
    const p0 = caso.it.previsao[0];
    let acertos = 0, golpesN = 0;
    const N = 4000;
    for (let k = 0; k < N; k++) {
      const ac = vezDeles(caso.comb, caso.p, caso.ints, `prev-exe|${k}`).filter((a) => a.alvoNome === p0.nome);
      for (const a of ac) { golpesN++; if (a.r.resultado === "acerta" || a.r.resultado === "critico") acertos++; }
    }
    t(`a chance anunciada (${(p0.chance * 100).toFixed(1)}%) é a rolada (${(acertos / golpesN * 100).toFixed(1)}%)`, golpesN >= N && Math.abs(p0.chance - acertos / golpesN) <= 0.03);
    t("o dano anunciado é o da ameaça (comum: 5–8; o crítico até 16)", J(caso.it.vista.dano) === J({ min: 5, max: 16 }), J(caso.it.vista.dano));
  } else t("achou-se um bandido que ataca na rodada 1", false);
}

/* ============================================================ */
sec("§6 a mente que esconde, e a ameaça somada");
{
  const { comb, p } = luta([{ nome: "Lobo 1", ameaca: "comum", nivel: 4 }, { nome: "Lobo 2", ameaca: "comum", nivel: 4 }], "esc|3", 6, "emboscada");
  const brilhante = { ...comb, inimigos: comb.inimigos.map((e, i) => (i === 0 ? { ...e, degrau: "brilhante" } : e)) };
  const ints = I.intencoesDaRodada(brilhante, ctxDe(p, "esc"));
  const o1 = ints.lista.find((x) => x.inimigo === "Lobo 1");
  t("a mente brilhante mostra o tipo e esconde o alvo", o1.escondeAlvo === true && (o1.tipo !== "atacar" || o1.vista.alvo === null) && o1.vista.abate === null);
  t("e a ameaça somada não a conta (o jogador não a pode somar)", ints.porAlvo.every((a) => !a.de.includes("Lobo 1")));
  const normal = I.intencoesDaRodada(comb, ctxDe(p, "esc"));
  t("a ameaça somada: por alvo, quem o ameaça, ordenada pela chance de queda", Array.isArray(normal.porAlvo) && normal.porAlvo.every((a, i) => i === 0 || a.abate <= normal.porAlvo[i - 1].abate) && normal.porAlvo.every((a) => a.de.length > 0 && a.golpes > 0));
}

/* ============================================================ */
sec("§7 a régua de combate com a intenção");
{
  /* MOVIDA (09/11, CB lote 1, oficial), E O MOTIVO: o App passou a anunciar a
     intenção no começo de cada rodada e a cumpri-la no revide, e a régua mede o
     jogo de hoje — logo o anúncio LIGA (era `=== false` «até o App anunciar»).
     A segunda asserção dizia «omitir = false explícito»; omitir passa a ser o
     ligado explícito, e a régua sem anúncio continua a medir-se pela opção. */
  t("a régua mede o jogo de hoje: o App anuncia, e o anúncio está ligado", INTENCAO_NA_REGUA.ligado === true);
  const s = "umavida|7";
  t("ligada, omitir é o mesmo que o anúncio explícito", J(simularCombate("justo", s)) === J(simularCombate("justo", s, { comIntencao: true })));
  t("ligada, a mesma semente dá o mesmo combate", J(simularCombate("justo", s, { comIntencao: true })) === J(simularCombate("justo", s, { comIntencao: true })));
  const K = CATRACA_DE_UMA_VIDA;
  const com = medir("justo", { n: 300, comIntencao: true });
  t(`com o anúncio, nenhum dente da catraca cai: PV do grupo ${com.pvGrupo.media.toFixed(2)} ≤ ${K.tetoDePvDoGrupo}`, com.pvGrupo.media <= K.tetoDePvDoGrupo);
  t(`e as quedas ${com.quedas.media.toFixed(3)} ≥ ${K.pisoDeQuedas}`, com.quedas.media >= K.pisoDeQuedas);
  console.log(`  ..  [medida] justo com o anúncio: vitória ${linhaDaMetrica(com.vitoria, 3)} · PV ${linhaDaMetrica(com.pvGrupo, 2)} · quedas ${linhaDaMetrica(com.quedas, 3)} (o retrato e o porquê em INTENCAO_NA_REGUA)`);
}

/* ============================================================ */
sec("§8 determinismo, imutabilidade, lixo");
{
  const { comb, p } = luta([{ nome: "Lobo 1", ameaca: "comum", nivel: 4 }, { nome: "Bandido 2", ameaca: "comum", nivel: 4 }], "det|1", 6, "emboscada");
  const antes = J(comb), antesP = J(p);
  const a = I.intencoesDaRodada(comb, ctxDe(p, "x")), b = I.intencoesDaRodada(comb, ctxDe(p, "x"));
  t("a mesma semente, o mesmo anúncio", J(a) === J(b));
  t("imutável: o combate e o herói ficam como vieram", J(comb) === antes &&J(p) === antesP);
  t("o anúncio não come a sorte da casa (corre na sua)", (() => { const x = S("casa"); const y = S("casa"); I.intencoesDaRodada(comb, ctxDe(p, "y")); return x() === y(); })());
  t("lixo: null sem combate ou sem herói", I.intencoesDaRodada(null, {}) === null && I.intencoesDaRodada(comb, null) === null && I.intencoesDaRodada(comb, { jogador: null }) === null);
  t("sem inimigos de pé: lista vazia", J(I.intencoesDaRodada({ ...comb, inimigos: [] }, ctxDe(p, "z"))) === J({ rodada: 1, lista: [], porAlvo: [] }));
  t("o balanço com lixo: lista vazia, nunca exceção", J(I.balancoDasIntencoes(null, null, null)) === "[]");
  const fug = I.intencoesDaRodada({ ...comb, inimigos: comb.inimigos.map((e) => ({ ...e, vida: 1 })) }, ctxDe(p, "f", { comFuga: true, sorte: () => 0 }));
  t("com a fuga ligada, o ferido abaixo do limiar anuncia que foge", fug.lista.every((x) => x.tipo === "fugir"));
  t("e sem ela (a régua), ninguém anuncia fuga", I.intencoesDaRodada({ ...comb, inimigos: comb.inimigos.map((e) => ({ ...e, vida: 1 })) }, ctxDe(p, "f", { sorte: () => 0 })).lista.every((x) => x.tipo !== "fugir"));
}

/* ============================================================ */
sec("§9 sem a pílula (comPrevisao: false, CB lote 2) — a mesma escolha, ao byte");
{
  /* A régua do poder corre o anúncio sem a previsão de cada intenção (o
     número da pílula, que só a tela lê): eram as convoluções da pílula a
     metade do tempo dela. O que a régua e a execução leem — o tipo, os alvos
     de cada golpe, a área do sopro, e a ameaça somada (`porAlvo`, que o
     herói que lê consulta) — tem de ser o mesmo, em 60 lutas sorteadas. */
  const TIPOS = [["Lobo", "comum"], ["Bandido", "comum"], ["Orc", "competente"], ["Ogro", "elite"], ["Dragão Jovem", "lendario"], ["Atirador", "comum"]];
  const r = S("sem-pilula");
  let iguais = 0, comPilula = 0;
  const essencia = (x) => J({ lista: x.lista.map((it) => ({ inimigo: it.inimigo, tipo: it.tipo, alvos: it.alvos, alvo: it.alvo, golpes: it.golpes, area: it.area || null, vistaAlvo: it.vista.alvo, vistaTipo: it.vista.tipo })), porAlvo: x.porAlvo });
  for (let i = 0; i < 60; i++) {
    const n = 1 + Math.floor(r() * 4), [nome, ameaca] = TIPOS[Math.floor(r() * TIPOS.length)];
    const { comb, p } = luta(Array.from({ length: n }, (_, k) => ({ nome: `${nome} ${k + 1}`, ameaca, nivel: 3 + Math.floor(r() * 8) })), `pil|${i}`, 3 + Math.floor(r() * 8));
    const com = I.intencoesDaRodada(comb, ctxDe(p, `pil|${i}`)), sem = I.intencoesDaRodada(comb, ctxDe(p, `pil|${i}`, { comPrevisao: false }));
    if (essencia(com) === essencia(sem)) iguais++;
    if (com.lista.some((it) => it.tipo === "atacar" && it.previsao.length) && sem.lista.every((it) => it.tipo !== "atacar" || it.previsao.length === 0)) comPilula++;
  }
  t(`a escolha, os alvos, a área e a ameaça somada são os mesmos em ${iguais} de 60 lutas`, iguais === 60);
  t(`e só a pílula sai (${comPilula} lutas com golpe anunciado: com a previsão, e sem ela vazia)`, comPilula > 20);
}

console.log(`\na intenção do inimigo: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
