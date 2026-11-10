/* teste-regua-do-nivel1.mjs (CB13, Fase CB lote 2, 10/11/2026) — a régua do começo

   A pessoa jogou a primeira luta e a planta mediu (mente/plano-combate-e-
   viagem.md §2.1, §3.11): no nível 1 todo bicho da estrada caía num golpe,
   e numa luta de uma rodada não há nada a decidir. A regra: um comum aguenta
   2 golpes, um fraco cai num, e a luta do começo dura o bastante para haver
   uma decisão — SEM ficar mais mortal (a 13.ª sessão já pagou um começo
   mortal: teste-dano-da-ameaca.mjs).

   O conserto são duas tabelas em combate.js, e só no começo: `PV_NO_COMECO`
   (o piso de 12 PV do comum, nos níveis 1 e 2 do herói) e `DANO_NO_COMECO`
   (o comum de nível 1 e 2 bate 3 + d4 − 1). Esta suíte é a catraca delas,
   medida nos cenários do começo (`CENARIOS_DO_COMECO`, regua-combate.mjs):
   a Iara, vestida como o jogo a veste, e o Dunstan.

   MEDIDO (10/11, 1000 lutas por cenário, sementes «nivel1|i»; o «antes» é
   esta mesma suíte com as duas tabelas desligadas — `ateNivel: 0`):
                          antes (8 PV, golpe 5)          depois (12 PV, golpe 3)
     um Bandido           uma rodada 83,3% · 1,19 r       59,9% · 1,46 r
     dois Bandidos        uma rodada 34,5% · 1,86 r       5,4% · 2,65 r
                          a Iara cai 4,5%                 3,4%
     um Bandido, só       uma rodada 57,1% · 1,65 r       23,1% · 2,28 r
     dois Bandidos, só    a Iara cai 16,2% · 2,91 r       16,2% · 4,13 r
     três Lobos           1,4% · 2,59 r                   igual (o fraco não mudou)
   A luta dura mais em todos, e o perigo fica onde estava ou desce. Os tetos
   da tabela são o «antes» com a margem do resorteio. */
import { PV_NO_COMECO, DANO_NO_COMECO, danoBaseDaAmeaca, DANO_DA_AMEACA, pvEsperadoInimigo, pvEsperadoJogador } from "../src/combate.js";
import { completarInimigo } from "../src/bestiario.js";
import { danoDoGolpe, previsaoDoAtaque, danoDoInimigo } from "../src/previsao.js";
import { simularCombate, CENARIOS_DO_COMECO, fichaDoGrupo } from "./regua-combate.mjs";

let bons = 0, maus = 0;
const t = (nome, cond, extra = "") => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "  — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const pct = (x) => (x * 100).toFixed(1) + "%";

/* A CATRACA, e o porquê de cada número:
   umaRodada — a parte das vitórias na rodada 1 (a luta sem decisão);
   rodadas   — a duração média da luta de dois Bandidos (antes 1,90);
   cai       — a Iara a 0 PV: o teto é o número de ANTES do conserto, com uma
               margem de resorteio (±1,4 pp a 5%, ±2,5 a 19%) — a luta do
               começo não pode ficar mais mortal do que era. */
const REGUA_DO_NIVEL1 = Object.freeze({
  n: 1000,
  umaRodada: Object.freeze({ doisBandidos: 0.12, umBandidoSo: 0.3, umBandido: 0.7 }),
  rodadasDoisBandidos: 2.4,   /* antes 1,86 */
  cai: Object.freeze({ doisBandidos: 0.045 + 0.013, doisBandidosSo: 0.162 + 0.023, tresLobos: 0.014 + 0.008 }),
});

sec("1. AS TABELAS — o comum do começo aguenta dois golpes, o fraco cai num");
{
  t("PV_NO_COMECO: o piso do comum, só nos níveis 1 e 2", Object.isFrozen(PV_NO_COMECO) && PV_NO_COMECO.ateNivel === 2 && PV_NO_COMECO.piso.comum === 12 && !("fraco" in PV_NO_COMECO.piso));
  t("DANO_NO_COMECO: o comum de nível 1 e 2 bate 3 + d4 − 1", Object.isFrozen(DANO_NO_COMECO) && DANO_NO_COMECO.ateNivel === 2 && DANO_NO_COMECO.dano.comum === 3);
  const iara = { ...CENARIOS_DO_COMECO.umBandido.heroi };
  const ficha = { ...iara, equipados: { arma: { nome: iara.arma, tipo: "arma" } } };
  const golpe = previsaoDoAtaque({ alvo: { vida: 99, defesa: 0 }, bonusAtaque: 99, dano: danoDoGolpe(ficha) }).dano.medio;
  const comum = completarInimigo({ nome: "Bandido", ameaca: "comum", nivel: 1 }, 1).vidaMax;
  const fraco = completarInimigo({ nome: "Lobo", ameaca: "fraco", nivel: 1 }, 1).vidaMax;
  console.log(`     o golpe médio da Iara (Espada Longa): ${golpe} · o comum do nível 1: ${comum} PV · o fraco: ${fraco} PV`);
  t(`um comum do nível 1 aguenta um golpe médio e cai em dois (${comum} PV contra ${golpe})`, comum > golpe && comum <= 2 * golpe);
  t(`um fraco cai num golpe médio (${fraco} PV)`, fraco <= golpe);
  t("no nível 2 o piso só manda se a conta der menos (dá 13), e do 3 em diante a conta de sempre manda", pvEsperadoInimigo(2, "comum") === Math.max(12, Math.round(pvEsperadoJogador(2, 1) * 0.7)) && pvEsperadoInimigo(3, "comum") === Math.min(Math.max(4, Math.round(pvEsperadoJogador(3, 1) * 0.7)), 16 + 3 * 6));
  t("o fraco, o competente, o elite e o lendário não mudam em nível nenhum (as réguas do poder e de Uma Vida ficam byte a byte)",
    [1, 2, 3, 5, 10].every((nv) => ["fraco", "competente", "elite", "lendario"].every((a) => {
      const mult = { fraco: 0.35, competente: 1.0, elite: 1.6, lendario: 2.6 }[a];
      const pv = Math.max(4, Math.round(pvEsperadoJogador(nv, 1) * mult));
      return pvEsperadoInimigo(nv, a) === (a === "fraco" ? Math.min(pv, 10 + nv * 4) : pv);
    })));
  t("o golpe do comum do começo, e o de nível 3 que bate como sempre", danoBaseDaAmeaca({ ameaca: "comum", nivel: 1 }) === 3 && danoBaseDaAmeaca({ ameaca: "comum", nivel: 2 }) === 3 && danoBaseDaAmeaca({ ameaca: "comum", nivel: 3 }) === DANO_DA_AMEACA.comum);
  t("o que não diz nível bate pela tabela da ameaça (o Narrador abre luta sem nível)", danoBaseDaAmeaca({ ameaca: "comum" }) === DANO_DA_AMEACA.comum && danoBaseDaAmeaca({ ameaca: "fraco", nivel: 1 }) === DANO_DA_AMEACA.fraco && danoBaseDaAmeaca(null) === DANO_DA_AMEACA.comum);
  t("a previsão lê o mesmo golpe (danoDoInimigo: 3 + d4 − 1 → 3 a 6)", (() => { const p = previsaoDoAtaque({ alvo: { vida: 99, defesa: 0 }, bonusAtaque: 99, dano: danoDoInimigo({ ameaca: "comum", nivel: 1 }) }); return p.dano.min === 3 && p.dano.max === 6; })());
  t("o Dunstan entra vestido pelo kit da classe", fichaDoGrupo(CENARIOS_DO_COMECO.umBandido).every((g) => g.equipados && g.equipados.arma));
}

sec("2. A LUTA DO COMEÇO — dura, e não mata mais do que matava");
const M = {};
for (const [id, cen] of Object.entries(CENARIOS_DO_COMECO)) {
  let uma = 0, rod = 0, vit = 0, cai = 0;
  for (let i = 0; i < REGUA_DO_NIVEL1.n; i++) {
    const r = simularCombate(cen, `nivel1|${i}`);
    if (r.vitoria && r.rodadas <= 1) uma++;
    rod += r.rodadas; vit += r.vitoria; cai += r.quedaDoHeroi;
  }
  const n = REGUA_DO_NIVEL1.n;
  M[id] = { umaRodada: uma / n, rodadas: rod / n, vitoria: vit / n, cai: cai / n };
  console.log(`     ${id}: uma rodada ${pct(M[id].umaRodada)} · ${M[id].rodadas.toFixed(2)} rodadas · vitória ${pct(M[id].vitoria)} · a Iara cai ${pct(M[id].cai)}`);
}
{
  const R = REGUA_DO_NIVEL1;
  t(`dois Bandidos quase nunca acabam numa rodada (${pct(M.doisBandidos.umaRodada)}; antes 34,5%)`, M.doisBandidos.umaRodada <= R.umaRodada.doisBandidos);
  t(`e duram ${M.doisBandidos.rodadas.toFixed(2)} rodadas (antes 1,86)`, M.doisBandidos.rodadas >= R.rodadasDoisBandidos);
  t(`um Bandido contra a Iara sozinha já não cai na primeira (${pct(M.umBandidoSo.umaRodada)}; antes 57,1%)`, M.umBandidoSo.umaRodada <= R.umaRodada.umBandidoSo);
  t(`um Bandido contra os dois cai menos na rodada 1 (${pct(M.umBandido.umaRodada)}; antes 83,3% — dois a bater num só ainda o derrubam muitas vezes, e é honesto dizê-lo)`, M.umBandido.umaRodada <= R.umaRodada.umBandido);
  t(`não ficou mais mortal: dois Bandidos derrubam a Iara acompanhada em ${pct(M.doisBandidos.cai)} (antes 4,5%)`, M.doisBandidos.cai <= R.cai.doisBandidos);
  t(`e sozinha em ${pct(M.doisBandidosSo.cai)} (antes 16,2%)`, M.doisBandidosSo.cai <= R.cai.doisBandidosSo);
  t(`os três Lobos (fracos, que a CB13 não tocou) continuam onde estavam (${pct(M.tresLobos.cai)})`, M.tresLobos.cai <= R.cai.tresLobos);
  t("mas a luta ainda se perde às vezes: dois Bandidos contra a Iara sozinha não são de graça", M.doisBandidosSo.vitoria < 0.95);
}

console.log(`\na régua do nível 1: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
