/* Sonda final: os modulos que nunca foram sondados. */
const S = "../src/";
const A = [];
const anota = (grau, o) => A.push({ grau, o });
const sec = (s) => console.log("\n=== " + s + " ===\n");

const rel = await import(S + "relogios.js");
const mis = await import(S + "missoes.js");
const cor = await import(S + "correio.js");
const dec = await import(S + "decretos.js");
const rei = await import(S + "reino.js");
const fam = await import(S + "fama.js");
const con = await import(S + "conquistas.js");
const leg = await import(S + "legado.js");
const enc = await import(S + "encontros.js");
const erm = await import(S + "ermos.js");
const gri = await import(S + "grimorio.js");
const mag = await import(S + "magias.js");
const her = await import(S + "heroismo.js");
const ora = await import(S + "oraculo.js");
const sin = await import(S + "sintonia.js");
const vin = await import(S + "vinculos.js");
const orc = await import(S + "orcamento.js");
const geo = await import(S + "geografia.js");
const mapa = geo.gerarGeografia("final|sonda", null);

sec("RELÓGIOS (as ameaças de longo prazo)");
{
  let r = rel.criarRelogio ? rel.criarRelogio("A cheia chega", 6) : null;
  console.log("criar:", JSON.stringify(r));
  if (r) {
    for (let i = 0; i < 8; i++) r = (rel.tiquear ? rel.tiquear(r, 1) : r);
    console.log("depois de 8 tiques:", JSON.stringify(r));
    if (r && (r.atual || 0) > (r.total || 0)) anota("baixo", "relógio passa do próprio limite em vez de estourar e parar");
  }
  console.log("exports:", Object.keys(rel).join(", "));
}

sec("MISSÕES (as etapas que o sistema confere)");
{
  console.log("exports:", Object.keys(mis).join(", "));
  if (mis.TIPOS_ETAPA) console.log("tipos de etapa:", JSON.stringify(Object.keys(mis.TIPOS_ETAPA)));
  const m = mis.criarMissao ? mis.criarMissao({ titulo: "T", etapas: [{ tipo: "ir_a", alvo: "Casa do Norte" }, { tipo: "derrotar", alvo: "Lobo", quantos: 2 }] }) : null;
  if (m && mis.conferirEtapas) {
    let r1 = mis.conferirEtapas([m], { cidade: "Casa do Norte", derrotados: [], bolsa: [], npcsFalados: [], dia: 1 });
    console.log("ao chegar na cidade:", JSON.stringify((r1.missoes || r1)[0]?.etapas?.map((e) => e.feito)));
    let r2 = mis.conferirEtapas((r1.missoes || r1), { cidade: "Casa do Norte", derrotados: ["Lobo", "Lobo"], bolsa: [], npcsFalados: [], dia: 1 });
    console.log("depois de 2 lobos:", JSON.stringify((r2.missoes || r2)[0]?.etapas?.map((e) => e.feito)), "· status", (r2.missoes || r2)[0]?.status);
  }
}

sec("ENCONTROS E ERMOS (o que aparece na estrada)");
{
  const biomas = ["planicie", "floresta", "montanha", "deserto", "pantano", "costa", "gelo", "colina"];
  for (const b of biomas) {
    const e = enc.sortearEncontro ? enc.sortearEncontro(b, 8, "Fantasia medieval") : null;
    const t = erm.feicaoDoErmo ? erm.feicaoDoErmo("s", b) : null;
    console.log(`${b.padEnd(10)} encontro: ${e ? (e.nome || e.texto || JSON.stringify(e)).slice(0, 46) : "—"}`);
    if (!e) anota("medio", `bioma "${b}" não gera encontro nenhum na estrada`);
  }
  console.log("exports encontros:", Object.keys(enc).join(", "));
}

sec("GRIMÓRIO E MAGIAS PREPARADAS");
{
  console.log("magias no grimório:", (gri.GRIMORIO || gri.MAGIAS || []).length);
  if (mag.limiteDePreparadas) for (const nv of [1, 5, 10, 20]) console.log(`  nv${nv}: prepara ${mag.limiteDePreparadas({ classe: "Mago", nivel: nv })}`);
  const semCirculo = (gri.GRIMORIO || []).filter((m) => m.circulo == null);
  if (semCirculo.length) anota("baixo", `${semCirculo.length} magias do grimório sem círculo`);
}

sec("HEROÍSMO, FAMA, CONQUISTAS, LEGADO");
{
  console.log("heroísmo — exports:", Object.keys(her).join(", "));
  console.log("conquistas no catálogo:", (con.CONQUISTAS || []).length);
  const semCond = (con.CONQUISTAS || []).filter((c) => !c.checa && !c.cond && !c.quando);
  if (semCond.length) anota("medio", `${semCond.length} conquistas sem regra que as desbloqueie`);
  for (const f of [0, 20, 50, 100, 200]) console.log(`  fama ${String(f).padStart(3)} → ${JSON.stringify(fam.patamarFama ? fam.patamarFama(f) : "?")}`);
  console.log("legado — exports:", Object.keys(leg).join(", "));
}

sec("SINTONIA E ORÁCULO");
{
  console.log("sintonia:", Object.keys(sin).join(", "));
  if (sin.limiteDeSintonia) for (const nv of [1, 10, 20]) console.log(`  nv${nv}: sintoniza ${sin.limiteDeSintonia({ nivel: nv })}`);
  console.log("oráculo:", Object.keys(ora).join(", "));
}

sec("VÍNCULOS (o que o companheiro sente)");
{
  console.log("exports:", Object.keys(vin).join(", "));
  if (vin.NIVEIS_VINCULO) console.log("níveis:", JSON.stringify(vin.NIVEIS_VINCULO.map ? vin.NIVEIS_VINCULO.map((x) => x.rotulo || x.nome || x) : Object.keys(vin.NIVEIS_VINCULO)));
}

sec("REINO, DECRETOS, ORÇAMENTO, CORREIO");
{
  console.log("reino:", Object.keys(rei).join(", "));
  console.log("decretos no catálogo:", (dec.DECRETOS || []).length);
  console.log("correio:", Object.keys(cor).join(", "));
  if (orc.avaliarEncontro) {
    for (const nv of [1, 10, 20]) {
      const av = orc.avaliarEncontro([{ nome: "X", nivel: nv, ameaca: "elite" }], nv, { gasto: 0, lutas: 0 });
      console.log(`  encontro elite nv${nv}: ${JSON.stringify(av).slice(0, 110)}`);
    }
  }
}

console.log("\n\n=== ACHADOS ===\n");
if (!A.length) console.log("nada torto nesta sonda.");
for (const a of A) console.log(`[${a.grau}] ${a.o}`);
