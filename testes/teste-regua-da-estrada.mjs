/* A RÉGUA DA ESTRADA (CB1, 09/11/2026) — src/encontros.js

   A pessoa partiu pelo mapa e abriu-se, sem uma palavra, uma luta contra um
   Dragão Ancião. A tabela da estrada só lia o nível do herói (do 14 para
   cima, 100% do perigo era lendário), e o mapa dizia «perigo baixo» a uma
   estrada que dava um dragão. Duas réguas para uma pergunta. Esta suíte
   prova que agora há uma:

   §1 a tabela, e a criatura medida pela régua dos lugares (PERIGO_POR_NIVEL);
   §2 o mapa e o encontro concordam em mil estradas (a régua do mapa,
      `perigoDaEstradaComMotivo`, é o teto do que a estrada dá);
   §3 a tabela de §1.3 da planta vira catraca: no topo o lendário é raro e
      nunca 100%; zero investidas acima de 2× em 4000 trechos por nível;
   §4 sem estrada, os níveis 1 a 7 dão a lista de antes, criatura a criatura;
   §5 o herói que passou a estrada; o que não é encontro não sai; a região pesa;
   §6 o que nunca investe: o lendário, o `importante`, o «a evitar»;
   §7 determinismo e lixo;
   §8 a medida do nível 1 (a regra é da CB13 — aqui só o número). */
import * as E from "../src/encontros.js";
import { PERIGO_POR_NIVEL } from "../src/regiao.js";
import { perigoDaEstradaComMotivo } from "../src/mapa-vivo.js";
import { TERRENO_VIAGEM } from "../src/geografia.js";
import { criaturasDoGenero, completarInimigo } from "../src/bestiario.js";
import { pesoDe } from "../src/orcamento.js";
import { TETO_DO_DESPROPORCIONAL } from "../src/emboscada.js";
import { rng, hashSemente } from "../src/semente.js";
import { perfilCombate } from "../src/combate.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const G = "Fantasia medieval";
const PER = PERIGO_POR_NIVEL.map((p) => p.id);
const ix = (p) => PER.indexOf(p);
const semente = (s) => rng(hashSemente(s));
const solo = (nivel) => ({ nivel, atributos: {}, grupo: [] });

sec("§1 a tabela, e a criatura pela régua dos lugares");
{
  const T = E.AMEACA_DA_ESTRADA;
  t("o lendário é zero nos degraus baixo e médio", T.lendario.baixo === 0 && T.lendario.medio === 0);
  t("e raro no alto e no mortal (nunca a regra)", T.lendario.alto > 0 && T.lendario.alto < 0.2 && T.lendario.mortal > 0 && T.lendario.mortal < 0.25);
  t("todo degrau do mapa tem a sua parcela", PER.every((p) => typeof T.lendario[p] === "number"));
  t("a janela é a de antes (−4 a +2)", T.janela.abaixo === 4 && T.janela.acima === 2);
  t("«a evitar» acima de 2× a capacidade", T.aEvitarAcima === 2 && /nunca investe/.test(T.porque));
  const B = criaturasDoGenero(G);
  const acha = (n) => B.find((c) => c.nome === n);
  t("o Dragão Jovem é de estrada alta", E.perigoDaCriatura(acha("Dragão Jovem")) === "alto");
  t("o Dragão Ancião é de estrada mortal", E.perigoDaCriatura(acha("Dragão Ancião")) === "mortal");
  t("o lobo é de estrada baixa", E.perigoDaCriatura(acha("Lobo")) === "baixo");
  t("a criatura mede-se como o lugar (PERIGO_POR_NIVEL, o mesmo corte)", B.every((c) => { const p = PERIGO_POR_NIVEL.find((x) => c.nivelRef <= x.ate); return E.perigoDaCriatura(c) === p.id; }));
  t("aceita o número também", E.perigoDaCriatura(8) === "alto" && E.perigoDaCriatura(12) === "mortal");
  const r = E.reguaDaEstrada({ perigo: "medio" }, 1);
  t("a régua de uma estrada média para o nível 1: teto 7, piso 4, janela 1..4", r.teto === 7 && r.piso === 4 && r.janela.lo === 1 && r.janela.hi === 4, J(r));
  const s = E.reguaDaEstrada(null, 14);
  t("sem estrada, o degrau é o do topo da janela do herói", s.peloNivel === true && s.perigo === "mortal", J(s));
}

sec("§2 o mapa e o encontro concordam em mil estradas");
{
  const r = semente("cb1|mil-estradas");
  const chaos = Object.keys(TERRENO_VIAGEM);
  const pontas = [...PER, "baixo"]; /* o povoado é "baixo" (PERIGO_NA_ESTRADA) */
  let estradas = 0, perigos = 0, acima = 0, rotuloErrado = 0, dragaoEmBaixa = 0, ancioesNoTopo = 0;
  const exemplo = [];
  for (let i = 0; i < 1000; i++) {
    const pa = pontas[Math.floor(r() * pontas.length)], pb = pontas[Math.floor(r() * pontas.length)];
    const chao = chaos[Math.floor(r() * chaos.length)];
    const nivel = 1 + Math.floor(r() * 20);
    const mapa = perigoDaEstradaComMotivo(pa, pb, chao);
    if (!mapa) continue;
    estradas++;
    for (let k = 0; k < 20; k++) {
      const enc = E.rolarEncontro(G, nivel, null, r, { perigo: mapa.perigo });
      if (enc.tipo !== "perigo") continue;
      perigos++;
      if (ix(enc.perigo) > ix(mapa.perigo)) { acima++; if (exemplo.length < 3) exemplo.push(`${mapa.perigo}→${enc.criatura}`); }
      if (enc.estrada !== mapa.perigo) rotuloErrado++;
      if (/Dragão/.test(enc.criatura) && ix(mapa.perigo) < ix("alto")) dragaoEmBaixa++;
      if (enc.criatura === "Dragão Ancião" && mapa.perigo === "mortal") ancioesNoTopo++;
    }
  }
  t(`mil estradas (${estradas} com perigo dito), ${perigos} encontros de perigo rolados`, estradas === 1000 && perigos > 4000);
  t("nenhuma criatura acima do degrau que o mapa pinta", acima === 0, exemplo.join(", "));
  t("o encontro diz de que degrau de estrada veio, e é o do mapa", rotuloErrado === 0);
  t("o mapa nunca diz baixo ou médio a uma estrada que dá um dragão", dragaoEmBaixa === 0);
  t("e a estrada mortal pode trazer o Ancião ao herói alto (decisão de 09/11)", ancioesNoTopo > 0, String(ancioesNoTopo));
}

sec("§3 a tabela de §1.3 vira catraca (4000 trechos por nível)");
{
  for (const nivel of [1, 5, 8, 11, 14, 17, 20]) {
    const r = semente(`cb1|nivel|${nivel}`);
    let perigo = 0, lend = 0, investeAcima = 0, investeLenda = 0, nomes = new Set();
    for (let i = 0; i < 4000; i++) {
      const enc = E.rolarEncontro(G, nivel, null, r, { perigo: "mortal" });
      if (enc.tipo !== "perigo") continue;
      perigo++;
      nomes.add(enc.criatura);
      if (enc.ameaca === "lendario") lend++;
      const inv = E.investidaDaEstrada(enc, { sorte: r, pers: solo(nivel) });
      if (inv.investe && inv.razao > 2) investeAcima++;
      if (inv.investe && (enc.ameaca === "lendario" || enc.importante)) investeLenda++;
    }
    const parte = lend / perigo;
    t(`nv ${nivel}: lendário ${(parte * 100).toFixed(1)}% do perigo, abaixo de 20% (era até 100%)`, parte <= E.AMEACA_DA_ESTRADA.lendario.mortal + 0.05);
    t(`nv ${nivel}: zero investidas acima de 2× e zero lendas a investir`, investeAcima === 0 && investeLenda === 0, `${investeAcima}/${investeLenda}`);
    if (nivel >= 14) t(`nv ${nivel}: a estrada dá mais do que o dragão (${nomes.size} criaturas)`, nomes.size >= 3, [...nomes].join(", "));
  }
}

sec("§4 sem estrada, os níveis 1 a 7 dão a lista de antes");
{
  for (const nivel of [1, 2, 3, 4, 5, 6, 7]) {
    const r = semente(`cb1|antes|${nivel}`);
    let fora = 0, vistos = 0;
    for (let i = 0; i < 1500; i++) {
      const enc = E.rolarEncontro(G, nivel, null, r);
      if (enc.tipo !== "perigo") continue;
      vistos++;
      if (!(enc.nivelRef <= nivel + 2 && enc.nivelRef >= Math.max(1, nivel - 4))) fora++;
    }
    t(`nv ${nivel}: ${vistos} perigos, todos na janela de antes (nível−4 a nível+2)`, vistos > 300 && fora === 0, String(fora));
  }
}

sec("§5 o herói que passou a estrada, o que não é encontro, e a região");
{
  const r = semente("cb1|forte");
  let alto = 0, lend = 0, n = 0;
  for (let i = 0; i < 3000; i++) {
    const enc = E.rolarEncontro(G, 14, null, r, { perigo: "baixo" });
    if (enc.tipo !== "perigo") continue;
    n++;
    if (enc.nivelRef > 3) alto++;
    if (enc.ameaca === "lendario") lend++;
  }
  t(`entre duas aldeias, o herói de nível 14 encontra o que a estrada tem (${n} perigos, nada acima de 3, nada lendário)`, n > 500 && alto === 0 && lend === 0);
  const r2 = semente("cb1|desproporcional");
  let pesado = 0;
  for (const nivel of [1, 2, 3, 8, 14, 20]) for (const p of PER) for (let i = 0; i < 600; i++) {
    const enc = E.rolarEncontro(G, nivel, null, r2, { perigo: p });
    if (enc.tipo === "perigo" && pesoDe({ ameaca: enc.ameaca, nivel: enc.nivelRef }, nivel) > TETO_DO_DESPROPORCIONAL) pesado++;
  }
  t("nenhuma criatura que sozinha pesa mais que o teto do desproporcional (3×)", pesado === 0, String(pesado));
  const conta = (quem) => {
    const r3 = semente("cb1|regiao");
    let lobo = 0, tot = 0;
    for (let i = 0; i < 6000; i++) {
      const enc = E.rolarEncontro(G, 2, null, r3, { perigo: "baixo", quem });
      if (enc.tipo !== "perigo") continue;
      tot++;
      if (enc.criatura === "Lobo") lobo++;
    }
    return lobo / tot;
  };
  const sem = conta(undefined), com = conta(["Lobo"]);
  t(`os bichos das pontas pesam mais (Lobo: ${(sem * 100).toFixed(0)}% → ${(com * 100).toFixed(0)}%)`, com > sem * 1.8);
  t("e o peso da região não fura o teto (o Dragão nomeado numa estrada baixa não sai)", (() => {
    const r4 = semente("cb1|regiao-teto");
    for (let i = 0; i < 3000; i++) { const e = E.rolarEncontro(G, 3, null, r4, { perigo: "baixo", quem: ["Dragão Ancião"] }); if (e.tipo === "perigo" && /Dragão/.test(e.criatura)) return false; }
    return true;
  })());
}

sec("§6 o que nunca investe");
{
  const lenda = { tipo: "perigo", criatura: "Dragão Ancião", ameaca: "lendario", quantos: 1, importante: true };
  const i1 = E.investidaDaEstrada(lenda, { sorte: () => 0, pers: solo(14) });
  t("o Dragão Ancião, com a sorte toda a favor, não investe", i1.investe === false && i1.naoInveste === "lendario", J(i1.naoInveste));
  t("e sem a ficha do herói também não", E.investidaDaEstrada(lenda, { sorte: () => 0 }).investe === false);
  const lich = E.investidaDaEstrada({ tipo: "perigo", criatura: "Comandante", ameaca: "elite", quantos: 1 }, { sorte: () => 0, pers: { nivel: 20, grupo: [{ vida: 10 }, { vida: 10 }, { vida: 10 }] } });
  t("o `importante` (o Comandante, da ficha) não investe", lich.investe === false && lich.naoInveste === "importante" && lich.importante === true, J(lich));
  const bando = E.investidaDaEstrada({ tipo: "perigo", criatura: "Goblin", ameaca: "fraco", quantos: 4 }, { sorte: () => 0, pers: solo(1) });
  t(`o bando que pesa mais que 2× (${bando.razao}×) é «a evitar» e não investe`, bando.aEvitar === true && bando.investe === false && bando.naoInveste === "aEvitar");
  const lobo = E.investidaDaEstrada({ tipo: "perigo", criatura: "Lobo", ameaca: "fraco", quantos: 2 }, { sorte: () => 0, pers: solo(3) });
  t("o resto investe como antes (a tabela de 1 em 3)", lobo.investe === true && lobo.aEvitar === false && !("naoInveste" in lobo));
  t("o encontro rolado leva o `importante` da ficha", (() => {
    const r = semente("cb1|imp");
    for (let i = 0; i < 4000; i++) { const e = E.rolarEncontro(G, 14, null, r, { perigo: "mortal" }); if (e.tipo === "perigo" && e.criatura === "Dragão Ancião") return e.importante === true; }
    return false;
  })());
}

sec("§7 determinismo e lixo");
{
  const cinquenta = () => { const r = semente("cb1|det"); return J(Array.from({ length: 50 }, () => E.rolarEncontro(G, 14, null, r, { perigo: "mortal" }))); };
  const a = cinquenta(), b = cinquenta();
  t("a mesma semente, a mesma estrada", a === b);
  let estourou = false;
  try {
    E.reguaDaEstrada(null, null); E.reguaDaEstrada({}, "x"); E.reguaDaEstrada({ perigo: "lixo", quem: "x" }, -3); E.reguaDaEstrada([], 99);
    E.rolarEncontro(G, 5, null, semente("x"), null); E.rolarEncontro(G, 5, null, semente("x"), { perigo: 7, quem: [null, 3, ""] });
    E.rolarEncontro("Outro Mundo", 20, null, semente("y"), { perigo: "mortal" });
    E.perigoDaCriatura(null); E.perigoDaCriatura({}); E.investidaDaEstrada({ tipo: "perigo", criatura: "Inventado", quantos: 2 }, { pers: null });
  } catch (e) { estourou = e; }
  t("lixo não estoura", !estourou, String(estourou));
  t("o degrau de lixo é null", E.perigoDaCriatura(null) === null && E.perigoDaCriatura({}) === null);
  t("a régua de lixo cai no nível 1", (() => { const x = E.reguaDaEstrada(null, null); return x.janela.lo === 1 && x.perigo === "baixo"; })());
  const sobre = { perigo: "alto", quem: ["Lobo"] };
  E.rolarEncontro(G, 9, null, semente("z"), sobre);
  t("imutável: a estrada recebida fica como veio", sobre.perigo === "alto" && sobre.quem.length === 1 && sobre.quem[0] === "Lobo");
}

sec("§8 a medida do nível 1 (a regra é da CB13)");
{
  /* A planta (§3.11): «no nível 1, todo bicho cai num golpe». Aqui só o
     número, para a CB13 ter de onde partir: a parte dos encontros de
     perigo do nível 1 em que cada inimigo cai com um golpe médio do herói
     marcial (o dado da classe padrão + 3 de atributo), e a luta acaba na
     primeira rodada se forem todos de uma só cabeça. */
  const p = perfilCombate("");
  const golpe = (p.dadoBase + 1) / 2 + 3;
  const r = semente("cb1|nivel1");
  let n = 0, umGolpe = 0, umaRodada = 0;
  for (let i = 0; i < 4000; i++) {
    const enc = E.rolarEncontro(G, 1, null, r);
    if (enc.tipo !== "perigo") continue;
    n++;
    const f = completarInimigo({ nome: enc.criatura, ameaca: enc.ameaca }, 1);
    if (f.vidaMax <= golpe) { umGolpe++; if (enc.quantos === 1) umaRodada++; }
  }
  const pct = (x) => `${((x / n) * 100).toFixed(1)}%`;
  console.log(`     nível 1: ${n} perigos · cada inimigo cai num golpe médio (${golpe}) em ${pct(umGolpe)} · luta de uma rodada só em ${pct(umaRodada)}`);
  t("a medida existe e é um número", n > 0 && Number.isFinite(umGolpe / n) && Number.isFinite(umaRodada / n));
}

console.log(`\na régua da estrada: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
