/* teste-dano-da-ameaca.mjs (29/10/2026, a 13.ª sessão de prova) — o «fraco» morde como fraco

   O DEFEITO (relatório da 13.ª, defeito 6): três Ratos Gigantes «fracos», 4 PV
   cada, deixaram a Iara — guerreira nova, 20 PV — a 0 e sangrando, na primeira
   luta da vida dela. A causa estava numa tabela sem nome dentro de `danoDe`
   (combate.js): o golpe médio do fraco era 4,5 contra 6,5 do comum (69%), quando
   toda a escala da casa — `PESO_AMEACA` do orçamento e o PV de
   `pvEsperadoInimigo` — diz que o fraco vale METADE de um comum. O conserto é um
   número: fraco 3 → 2 em `DANO_DA_AMEACA` (golpe médio 3,5, 54%).

   A CATRACA mede pela régua permanente (`regua-combate.mjs`, com o Adversário
   ligado, como na mesa), 1000 sementes, a ficha da 13.ª: a Guerreira de nível 1
   (20 PV, Espada Longa, sem armadura — o kit da casa) com o Caçador de 12 PV.

   MEDIDA (29/10), «cai» = a heroína chega a 0 PV na luta:
                                 antes (fraco 3)   depois (fraco 2)
     3 ratos, com o companheiro       10,8%             4,4%
     3 ratos, sozinha                 32,4%            18,5%
     4 ratos, com o companheiro       35,8%            21,4%
     2 bandidos, com o companheiro    24,0%            24,0%   (comum: não mexe)
     3 bandidos, com o companheiro    73,0%            73,0%
   Falha antes: no HEAD de antes, `DANO_DA_AMEACA` não existe (a tabela era
   anónima) e 3 ratos derrubam a heroína acompanhada em 10,8% das lutas. */
import { DANO_DA_AMEACA, BONUS_AMEACA, bonusDeAmeaca, danoDe, defesaDe, pvEsperadoInimigo } from "../src/combate.js";
import { PESO_AMEACA, avaliarEncontro } from "../src/orcamento.js";
import { completarInimigo } from "../src/bestiario.js";
import { simularCombate, sorteDaSemente } from "./regua-combate.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const ORDEM = ["fraco", "comum", "competente", "elite", "lendario"];
/* o golpe médio: base + d4 − 1 → base + 1,5 */
const medio = (a) => DANO_DA_AMEACA[a] + 1.5;

sec("1. A TABELA — o dano segue a escala da ameaça");
{
  t("congelada, com as cinco ameaças e só elas", Object.isFrozen(DANO_DA_AMEACA) && Object.keys(DANO_DA_AMEACA).join() === ORDEM.join());
  t("inteira e crescente do fraco ao lendário", ORDEM.every((a, i) => Number.isInteger(DANO_DA_AMEACA[a]) && (i === 0 || DANO_DA_AMEACA[a] > DANO_DA_AMEACA[ORDEM[i - 1]])));
  /* A REGRA QUE O FRACO QUEBRAVA: a mordida dele, medida contra a do comum,
     fica perto do que ele PESA contra o comum (0,35 / 0,7 = 0,5) — e do que
     ele aguenta (o PV de pvEsperadoInimigo usa os mesmos multiplicadores).
     Antes: 4,5 / 6,5 = 0,69. */
  const razaoDano = medio("fraco") / medio("comum");
  const razaoPeso = PESO_AMEACA.fraco / PESO_AMEACA.comum;
  const razaoPv = pvEsperadoInimigo(1, "fraco") / pvEsperadoInimigo(1, "comum");
  t(`o golpe médio do fraco é ${(razaoDano * 100).toFixed(0)}% do comum — a ±10 pontos do peso dele (${(razaoPeso * 100).toFixed(0)}%)`, Math.abs(razaoDano - razaoPeso) <= 0.1, `peso ${razaoPeso}, PV ${razaoPv.toFixed(2)}`);
  t(`e não morde mais, em proporção, do que aguenta (PV do fraco = ${(razaoPv * 100).toFixed(0)}% do comum)`, razaoDano <= razaoPv + 0.1);
  /* os de cima ficam ABAIXO da proporção do peso (e elite/lendário somam
     multiataque): é por isso que esta etapa não os tocou */
  t("competente, elite e lendário não passam da proporção do peso deles", ["competente", "elite", "lendario"].every((a) => medio(a) / medio("comum") <= PESO_AMEACA[a] / PESO_AMEACA.comum));
  const r = sorteDaSemente("dano|fraco");
  const golpes = Array.from({ length: 4000 }, () => danoDe({ ameaca: "fraco" }, true, r));
  const m = golpes.reduce((s, x) => s + x, 0) / golpes.length;
  t(`danoDe do fraco rola de 2 a 5 (média ${m.toFixed(2)} ≈ 3,5)`, Math.min(...golpes) === 2 && Math.max(...golpes) === 5 && Math.abs(m - 3.5) < 0.1);
  t("a ameaça que ninguém conhece bate como o comum (5 a 8)", (() => { const g = Array.from({ length: 400 }, () => danoDe({ ameaca: "???" }, true, r)); return Math.min(...g) === 5 && Math.max(...g) === 8; })());
}

sec("2. A CATRACA DA 13.ª — três fracos não derrubam a heroína nova");
const IARA = { nome: "Iara", classe: "Guerreiro", nivel: 1, vidaMax: 20, vigor: 3, atributos: { forca: 2, destreza: 1, vigor: 3, intelecto: 1, presenca: 2, percepcao: 3 }, arma: "Espada Longa", armadura: null, escudo: null };
const DUNSTAN = { nome: "Dunstan", classe: "Caçador", nivel: 1, vidaMax: 12, vigor: 2, atributos: { forca: 1, destreza: 3, vigor: 2, intelecto: 0, presenca: 0, percepcao: 2 } };
const N = 1000;
function medir(inimigos, grupo) {
  let cai = 0, venc = 0, dano = 0;
  for (let i = 0; i < N; i++) {
    const r = simularCombate({ id: "ratos13", heroi: IARA, grupo, inimigos, tetoDeRodadas: 20 }, `ratos13|${i}`);
    if (r.rodadaDaQuedaDoHeroi != null) cai++;
    if (r.vitoria) venc++;
    dano += r.pvHeroiMax - r.pvHeroi;
  }
  return { cai: cai / N, venc: venc / N, dano: dano / N };
}
const pct = (x) => (x * 100).toFixed(1) + "%";
{
  /* a promessa: o orçamento chama a luta da 13.ª «médio» — «vai doer e vai gastar» */
  const ratos = [1, 2, 3].map((i) => completarInimigo({ nome: `Rato Gigante ${i}` }, 1));
  const fx = avaliarEncontro(ratos, { nivel: 1, grupo: [{ vida: 12 }] });
  t(`três Ratos Gigantes ao lado de um companheiro são «${fx.faixa.id}» (razão ${fx.razao}), como na 13.ª`, fx.faixa.id === "medio");

  const R3 = { quantos: 3, ameaca: "fraco", nivel: 1, base: "Rato Gigante" };
  const a = medir(R3, [DUNSTAN]);
  const so = medir(R3, []);
  const r4 = medir({ ...R3, quantos: 4 }, [DUNSTAN]);
  const b2 = medir({ quantos: 2, ameaca: "comum", nivel: 2, base: "Bandido" }, [DUNSTAN]);
  const b3 = medir({ quantos: 3, ameaca: "comum", nivel: 2, base: "Bandido" }, [DUNSTAN]);
  console.log(`     3 ratos c/ companheiro: cai ${pct(a.cai)}, vence ${pct(a.venc)}, perde ${a.dano.toFixed(1)} PV · sozinha: cai ${pct(so.cai)}`);
  console.log(`     4 ratos: cai ${pct(r4.cai)} · 2 bandidos: cai ${pct(b2.cai)} · 3 bandidos: cai ${pct(b3.cai)}`);
  t(`três fracos derrubam a guerreira nova acompanhada em menos de 7% das lutas (${pct(a.cai)}; antes 10,8%)`, a.cai < 0.07);
  t(`e sozinha em menos de 25% (${pct(so.cai)}; antes 32,4%)`, so.cai < 0.25);
  /* SEM FICAR TRIVIAL: «médio» continua a doer — a luta custa PV — e as
     faixas de cima continuam a morder */
  t(`mas a luta ainda dói: ela perde em média ≥ 4 PV dos 20 (${a.dano.toFixed(1)})`, a.dano >= 4);
  t(`quatro ratos («difícil») ainda a derrubam em mais de 10% (${pct(r4.cai)})`, r4.cai > 0.1);
  t(`e o que o conserto não tocou continua onde estava: dois Bandidos (médio) 15–35% (${pct(b2.cai)}), três (mortal) acima de 60% (${pct(b3.cai)})`, b2.cai >= 0.15 && b2.cai <= 0.35 && b3.cai > 0.6);
  t("o perigo segue a faixa: 3 ratos < 4 ratos < 3 bandidos", a.cai < r4.cai && r4.cai < b3.cai);
}

sec("3. O DEGRAU QUE A TABELA TEM — o «ou» que apagava o zero");
{
  /* 29/10 (a 13.ª, item 4 do que ficou): `bonusDeAmeaca` era
     `BONUS_AMEACA[a] || 3`. Um degrau que valesse 0 virava 3 — nenhum vale
     hoje (o menor é o fraco, 1) —, e uma ameaça com nome de coisa herdada do
     objeto atravessava: "toString" devolvia uma função, e `defesaDe` e `danoDe`
     davam NaN.
     Falha antes: a tabela não era exportada, o segundo argumento não
     existia (o 0 virava 3), "toString" era uma função e o dano era NaN. */
  t("a tabela do bónus é exportada, congelada, com as cinco ameaças, crescente", Object.isFrozen(BONUS_AMEACA) && Object.keys(BONUS_AMEACA).join() === ORDEM.join() && ORDEM.every((a, i) => i === 0 || BONUS_AMEACA[a] > BONUS_AMEACA[ORDEM[i - 1]]));
  t("nenhum degrau real é 0 hoje (o menor, o fraco, é 1)", ORDEM.every((a) => BONUS_AMEACA[a] > 0) && BONUS_AMEACA.fraco === 1);
  t("cada ameaça lê o seu degrau", ORDEM.every((a) => bonusDeAmeaca(a) === BONUS_AMEACA[a]));
  const comZero = { ...BONUS_AMEACA, fraco: 0 };
  t("um degrau 0 na tabela vale 0, não o comum", bonusDeAmeaca("fraco", comZero) === 0, String(bonusDeAmeaca("fraco", comZero)));
  t("o que a tabela não tem é o comum, por nome", [undefined, null, "", "???", 7].every((a) => bonusDeAmeaca(a) === BONUS_AMEACA.comum));
  t("o que o objeto herda não é degrau: «toString» e «constructor» são o comum", bonusDeAmeaca("toString") === BONUS_AMEACA.comum && bonusDeAmeaca("constructor") === BONUS_AMEACA.comum, typeof bonusDeAmeaca("toString"));
  const r = sorteDaSemente("dano|herdado");
  const g = Array.from({ length: 200 }, () => danoDe({ ameaca: "toString" }, true, r));
  t("e o dano do inimigo também: «toString» bate como o comum (5 a 8), não NaN", g.every(Number.isFinite) && Math.min(...g) === 5 && Math.max(...g) === 8);
  t("e a defesa: «toString» defende como o comum (11), não NaN", defesaDe({ ameaca: "toString" }, true) === 11 && defesaDe({ ameaca: "fraco" }, true) === 10 && defesaDe({ ameaca: "lendario" }, true) === 13, String(defesaDe({ ameaca: "toString" }, true)));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
