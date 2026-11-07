/* O DADO DE USO (07/11/2026) — src/dado-de-uso.js

   Os mantimentos na mesa: a face sai da contagem, por tabela, e num 1 o
   dado encolhe (uma unidade a mais perdida). A contagem continua a ser a
   verdade e o save não muda. Esta suíte prova:
   §1 a face em cada limiar (rações e água em dias, tochas em unidades);
   §2 o fim do dia: come como comerODia, e o 1 que encolhe;
   §3 nada a encolher abaixo de zero, e sem dado onde nada há a estragar;
   §4 a tocha que se acende;
   §5 o determinismo pela semente;
   §6 o null e o lixo;
   §7 a bandeja: o papel "uso", os usos alinhados, o desfecho;
   §8 A MEDIDA — a perda esperada de dias com o padrão 10/10, de 1 a 4
      bocas, não passa do teto (DADO_DE_USO.medida.teto), nem a de
      passagens com luz com 10 tochas. */
import { DADO_DE_USO, faceDoDadoDeUso, oFimDoDia, aTochaQueSeAcende } from "../src/dado-de-uso.js";
import { comerODia } from "../src/ermos.js";
import { A_BANDEJA, lancamentoDoDadoDeUso, aLinhaDoLancamento } from "../src/motor/a-bandeja.js";
import { rng as rngCru, hashSemente } from "../src/semente.js";
/* a semente passa pelo hash, como a da casa: o LCG cru com sementes
   seguidas (1, 2, 3…) dá primeiros números quase iguais, e a suíte
   mediria o gerador em vez da regra */
const rng = (s) => rngCru(hashSemente("dado-de-uso|" + s));

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

/* geradores fixos: `um` faz cair o 1 em qualquer face; `alto` a face cheia */
const um = () => 0;
const alto = () => 0.9999;
const ficha = (r, a, tochas = 0, extra = {}) => ({ nome: "Ana", suprimentos: { racoes: r, agua: a, tochas, kit: true }, exaustao: 0, ...extra });

sec("§1 a face em cada limiar");
{
  /* rações e água: dias = contagem ÷ bocas (para baixo) */
  const casosDias = [[0, null], [1, 4], [2, 6], [3, 6], [4, 8], [5, 8], [6, 10], [20, 10]];
  for (const [dias, face] of casosDias) {
    t(`${dias} dia(s) de ração a uma boca → ${face ? "d" + face : "sem dado"}`, faceDoDadoDeUso("racoes", { racoes: dias }, 1) === face);
    t(`${dias} dia(s) de água a três bocas → ${face ? "d" + face : "sem dado"}`, faceDoDadoDeUso("agua", { agua: dias * 3 + 2 }, 3) === face);
  }
  t("dias contam para baixo: 7 rações a 4 bocas é 1 dia (d4)", faceDoDadoDeUso("racoes", { racoes: 7 }, 4) === 4);
  t("3 rações a 4 bocas é zero dias: sem dado", faceDoDadoDeUso("racoes", { racoes: 3 }, 4) === null);
  /* tochas: unidades, as bocas não pesam */
  const casosTochas = [[0, null], [1, 4], [2, 4], [3, 6], [4, 6], [5, 8], [12, 8]];
  for (const [n, face] of casosTochas) t(`${n} tocha(s) → ${face ? "d" + face : "sem dado"}`, faceDoDadoDeUso("tochas", { tochas: n }, 4) === face);
  t("as faces da tabela são todas faces da bandeja", Object.values(DADO_DE_USO.degraus).flat().every((d) => A_BANDEJA.faces.includes(d.faces)));
  t("os degraus descem do maior para o menor", Object.values(DADO_DE_USO.degraus).every((ds) => ds.every((d, i) => i === 0 || (d.desde < ds[i - 1].desde && d.faces < ds[i - 1].faces))));
}

sec("§2 o fim do dia: come, e o 1 que encolhe");
{
  const p = ficha(10, 10, 5);
  const seco = oFimDoDia(p, 2, alto);
  const comeu = comerODia(p, 2);
  t("sem 1, a ficha é a de comerODia", J(seco.pers) === J(comeu.pers) && J(seco.consumo) === J(comeu.consumo), J(seco.pers));
  t("os dois dados rolam, com a face de antes de comer (5 dias → d8)", seco.lancamentos.length === 1 && J(seco.lancamentos[0].dados.map((d) => d.faces)) === "[8,8]", J(seco.lancamentos));
  t("e na face cheia nada se perde nem se diz", seco.msgs.length === 0 && seco.pers.suprimentos.racoes === 8 && seco.pers.suprimentos.agua === 8);
  const mau = oFimDoDia(p, 2, um);
  t("num 1, perde-se uma a mais de cada, depois de comer", mau.pers.suprimentos.racoes === 7 && mau.pers.suprimentos.agua === 7, J(mau.pers.suprimentos));
  t("as tochas não rolam ao fim do dia", mau.pers.suprimentos.tochas === 5 && mau.lancamentos[0].dados.length === 2);
  t("uma linha por dado que encolhe, das falas da tabela", mau.msgs.length === 2 && DADO_DE_USO.falas.racoes.includes(mau.msgs[0]) && DADO_DE_USO.falas.agua.includes(mau.msgs[1]), J(mau.msgs));
  t("a ficha recebida fica", J(p) === J(ficha(10, 10, 5)));
  t("o resto da ficha passa intacto", mau.pers.nome === "Ana" && mau.pers.suprimentos.kit === true);
  /* um só encolhe: a água tem 1 dia, a ração 5 — o gerador dá 1 só ao 2.º dado */
  let k = 0;
  const so2 = () => (k++ === 1 ? 0 : 0.9999);
  const meio = oFimDoDia(ficha(10, 3, 0), 1, so2);
  t("ração d10 e água d6 (3 dias): só a água encolhe", J(meio.lancamentos[0].dados.map((d) => d.faces)) === "[10,6]" && meio.pers.suprimentos.racoes === 9 && meio.pers.suprimentos.agua === 1, J(meio.pers.suprimentos));
  t("a perda é DADO_DE_USO.perde, e encolhe em DADO_DE_USO.encolheEm", DADO_DE_USO.perde === 1 && DADO_DE_USO.encolheEm === 1);
}

sec("§3 nada abaixo de zero, e sem dado onde nada há a estragar");
{
  /* 1 ração a 1 boca: d4 antes; come-se e fica zero — nada a estragar, não rola */
  const ultimo = oFimDoDia(ficha(1, 1, 0), 1, um);
  t("o último dia come-se e nenhum dado rola", ultimo.lancamentos.length === 0 && ultimo.pers.suprimentos.racoes === 0 && ultimo.pers.suprimentos.agua === 0, J(ultimo));
  /* 3 rações a 2 bocas: 1 dia, d4; come 2, sobra 1, o 1 leva-a */
  const sobra = oFimDoDia(ficha(3, 3, 0), 2, um);
  t("sobra 1 e o 1 leva-a: zero, nunca −1", sobra.pers.suprimentos.racoes === 0 && sobra.pers.suprimentos.agua === 0, J(sobra.pers.suprimentos));
  const fome = oFimDoDia(ficha(0, 5, 0), 1, um);
  t("sem ração: a fome de comerODia, e só a água rola", fome.lancamentos[0].dados.length === 1 && fome.lancamentos[0].usos[0] === "agua" && fome.pers.suprimentos.racoes === 0 && fome.msgs[0].startsWith("🥖 Comida acabou"), J(fome));
  const nada = oFimDoDia(ficha(0, 0, 0), 3, um);
  t("sem nada: nenhum dado, e a exaustão de sempre", nada.lancamentos.length === 0 && nada.pers.exaustao === 2);
  let neg = true;
  for (let r = 0; r <= 12; r++) for (let b = 1; b <= 4; b++) {
    const x = oFimDoDia(ficha(r, r, 0), b, um).pers.suprimentos;
    if (x.racoes < 0 || x.agua < 0) neg = false;
  }
  t("varrido de 0 a 12 com 1 a 4 bocas, sempre ≥ 0", neg);
}

sec("§4 a tocha que se acende");
{
  const boa = aTochaQueSeAcende(6, 5, alto);
  t("6 → 5: rola o d8 (face de antes) e nada se perde", boa.tochas === 5 && boa.lancamento.dados[0].faces === 8 && boa.msgs.length === 0, J(boa));
  const ma = aTochaQueSeAcende(4, 3, um);
  t("4 → 3 num 1: o d6 encolhe e fica 2", ma.tochas === 2 && ma.lancamento.dados[0].faces === 6 && DADO_DE_USO.falas.tochas.includes(ma.msgs[0]), J(ma));
  const ult = aTochaQueSeAcende(2, 1, um);
  t("2 → 1 num 1: era a última, e a linha diz", ult.tochas === 0 && ult.msgs.includes(DADO_DE_USO.ultimaTocha), J(ult));
  const apagou = aTochaQueSeAcende(1, 0, um);
  t("1 → 0: não há tocha a acender, não rola", apagou.tochas === 0 && apagou.lancamento === null && apagou.msgs.length === 0);
  const escuro = aTochaQueSeAcende(0, 0, um);
  t("no escuro não rola", escuro.lancamento === null && escuro.tochas === 0);
  const cauteloso = aTochaQueSeAcende(5, 3, um);
  t("o passo cauteloso (2 de uma vez) encolhe sobre o que ficou", cauteloso.tochas === 2 && cauteloso.lancamento.dados[0].faces === 8);
}

sec("§5 o determinismo pela semente");
{
  const p = ficha(10, 10, 0);
  const a = oFimDoDia(p, 1, rng(1234)), b = oFimDoDia(p, 1, rng(1234));
  t("mesma semente, mesma noite", J(a) === J(b));
  let difere = false;
  for (let s = 1; s < 60 && !difere; s++) if (J(oFimDoDia(p, 1, rng(s))) !== J(a)) difere = true;
  t("sementes diferentes dão noites diferentes", difere);
  const ta = aTochaQueSeAcende(7, 6, rng(99)), tb = aTochaQueSeAcende(7, 6, rng(99));
  t("mesma semente, mesma tocha", J(ta) === J(tb));
  /* a fala também sai da semente: as três variantes aparecem */
  const falas = new Set();
  for (let s = 1; s < 400; s++) { const x = oFimDoDia(ficha(10, 0, 0), 1, rng(s)); for (const m of x.msgs) if (m.startsWith("🥖 ") && !m.includes("acabou")) falas.add(m); }
  t("as três falas da ração aparecem pela semente", falas.size === DADO_DE_USO.falas.racoes.length, J([...falas]));
  let fora = false;
  for (let s = 1; s < 300; s++) for (const l of oFimDoDia(p, 1, rng(s)).lancamentos) for (const d of l.dados) if (d.valor < 1 || d.valor > d.faces) fora = true;
  t("nenhum dado cai fora da face", !fora);
}

sec("§6 o null e o lixo");
{
  t("faceDoDadoDeUso aguenta null, tipo estranho e bocas lixo",
    faceDoDadoDeUso("racoes", null, 1) === null && faceDoDadoDeUso("ouro", { ouro: 9 }) === null &&
    faceDoDadoDeUso("racoes", { racoes: 8 }, null) === 10 && faceDoDadoDeUso("racoes", { racoes: "6" }, "x") === 10 && faceDoDadoDeUso("agua", { agua: -4 }, 1) === null);
  let ok = true, r;
  try { r = oFimDoDia(null, 2, um); } catch (e) { ok = false; }
  t("oFimDoDia(null) não estoura e não rola", ok && r.lancamentos.length === 0 && Array.isArray(r.msgs));
  try { r = oFimDoDia({ suprimentos: null }, undefined, um); } catch (e) { ok = false; }
  t("suprimentos null e bocas undefined", ok && r.lancamentos.length === 0);
  try { r = oFimDoDia(ficha(8, 8, 0), NaN, "nao-e-funcao"); } catch (e) { ok = false; }
  t("bocas NaN contam como 1 e um rng que não é função cai na sorte da casa", ok && r.consumo.racoes === 1 && r.pers.suprimentos.racoes <= 7);
  try { r = oFimDoDia(ficha(8, 8, 0), 1, () => NaN); } catch (e) { ok = false; }
  t("um gerador que devolve NaN não põe dado fora da face", ok && r.lancamentos[0].dados.every((d) => d.valor >= 1 && d.valor <= d.faces));
  const tq = aTochaQueSeAcende(null, undefined, um);
  t("aTochaQueSeAcende(null, undefined) não rola", tq.lancamento === null && tq.tochas === 0);
}

sec("§7 a bandeja");
{
  const l = oFimDoDia(ficha(10, 10, 0), 1, um).lancamentos[0];
  t("o lançamento vai pelo papel \"uso\"", l.papel === "uso" && A_BANDEJA.papeis.includes("uso") && l.dados.every((d) => d.papel === "uso"));
  t("os usos seguem alinhados com os dados", J(l.usos) === J(["racoes", "agua"]));
  t("o 1 é falha, e o alvo é o menor que salva", l.desfecho === "falha" && l.alvo === DADO_DE_USO.encolheEm + 1 && l.total === 1);
  t("o rótulo é o da tabela", l.rotulo === DADO_DE_USO.rotulos.dia);
  const b = oFimDoDia(ficha(10, 10, 0), 1, alto).lancamentos[0];
  t("a face cheia é sucesso", b.desfecho === "sucesso" && b.total === 10);
  t("a linha que o jogador lê", aLinhaDoLancamento(b) === "Os mantimentos · 10 · 10 · precisa de 2", aLinhaDoLancamento(b));
  t("o construtor recusa o dado falso", lancamentoDoDadoDeUso("x", [{ faces: 7, valor: 3 }, { faces: 6, valor: 0 }]) === null && lancamentoDoDadoDeUso("x", null) === null);
}

sec("§8 A MEDIDA — quanto o dado de uso encurta a viagem");
{
  /* A conta exata (programação dinâmica sobre rações × água): os dias em
     que todas as bocas comem e bebem, até à primeira fome ou sede, com o
     risco da tabela; contra os dias de hoje, floor(padrão ÷ bocas). */
  const { padrao, bocas: BOCAS, teto } = DADO_DE_USO.medida;
  const P = DADO_DE_USO.encolheEm, PERDE = DADO_DE_USO.perde;
  const diasComDado = (b) => {
    const memo = new Map();
    const E = (r, a) => {
      const k = r + "," + a;
      if (memo.has(k)) return memo.get(k);
      if (r < b || a < b) { memo.set(k, 0); return 0; }
      const r1 = r - b, a1 = a - b;
      const ramos = (tipo, resto, antes) => {
        const f = faceDoDadoDeUso(tipo, { [tipo]: antes }, b);
        if (!f || resto <= 0) return [[1, resto]];
        return [[P / f, Math.max(0, resto - PERDE)], [1 - P / f, resto]];
      };
      let v = 0;
      for (const [pr, rr] of ramos("racoes", r1, r)) for (const [pa, aa] of ramos("agua", a1, a)) v += pr * pa * (1 + E(rr, aa));
      memo.set(k, v);
      return v;
    };
    return E(padrao, padrao);
  };
  let pior = 0;
  for (const b of BOCAS) {
    const hoje = Math.floor(padrao / b);
    const com = diasComDado(b);
    const perda = 1 - com / hoje;
    pior = Math.max(pior, perda);
    /* o custo extra esperado por dia, em unidades de cada mantimento */
    console.log(`       ${b} boca(s): ${hoje} dias hoje → ${com.toFixed(2)} com o dado (−${(perda * 100).toFixed(1)}%), ≈ ${((hoje - com) * b / Math.max(com, 1)).toFixed(2)} unidade(s) extra por dia`);
    t(`${b} boca(s): a perda esperada não passa de ${teto * 100}%`, perda <= teto, (perda * 100).toFixed(1) + "%");
  }
  console.log(`       pior caso: ${(pior * 100).toFixed(1)}%`);

  /* a conta bate com o jogo jogado: a mesma viagem, em 3000 sementes, pela função de verdade */
  for (const b of [1, 2]) {
    let soma = 0;
    const N = 3000;
    for (let s = 1; s <= N; s++) {
      const r = rng(7000 + s);
      let p = ficha(padrao, padrao, 0), dias = 0;
      for (;;) {
        const x = oFimDoDia(p, b, r);
        if (x.pers.exaustao > 0) break;
        dias++; p = x.pers;
      }
      soma += dias;
    }
    const exato = diasComDado(b), jogado = soma / N;
    t(`${b} boca(s): a conta exata (${exato.toFixed(2)}) bate com 3000 viagens jogadas (${jogado.toFixed(2)})`, Math.abs(exato - jogado) < 0.15);
  }

  /* as tochas: passagens com luz, com 10 tochas, contra 10 de hoje */
  const passagens = (n) => {
    const memo = new Map();
    const E = (x) => {
      if (x <= 0) return 0;
      if (memo.has(x)) return memo.get(x);
      const d = x - 1, f = faceDoDadoDeUso("tochas", { tochas: x });
      const v = 1 + (d > 0 && f ? (P / f) * E(Math.max(0, d - PERDE)) + (1 - P / f) * E(d) : E(d));
      memo.set(x, v);
      return v;
    };
    return E(n);
  };
  for (const n of [3, 5, padrao, 20]) {
    const com = passagens(n), perda = 1 - com / n;
    console.log(`       ${n} tochas: ${com.toFixed(2)} passagens com luz (−${(perda * 100).toFixed(1)}%)`);
    t(`${n} tochas: a perda de luz não passa de ${teto * 100}%`, perda <= teto, (perda * 100).toFixed(1) + "%");
  }
}

console.log(`\n${bons} ok · ${maus} falhas`);
if (maus) process.exit(1);
