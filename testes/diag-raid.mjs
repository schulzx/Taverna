const R = await import("../src/raids.js");
const heroi = (n) => ({ nome: "Íris", nivel: n, grupo: [] });
const base = R.abrirRaid({ semente: "d1", pers: heroi(18), npcs: {} }).raid;
let raid = R.garantirRaid({ ...base, fase: "luta" });
console.log(`hoste ${raid.hoste.length} · horda ${raid.horda} · frente ${R.forcaDaFrente(raid.hoste).toFixed(1)}`);
let v = 0;
while (!raid.rompeu && v++ < 30) {
  const r = R.rodadaDaFrente(raid, { rnd: Math.random });
  raid = r.raid;
  const dePe = raid.hoste.filter((h) => !h.caido && !h.morto).length;
  console.log(`r${raid.rodada}: horda ${raid.horda} · abateu ${r.abatidos} · frente ${r.frente} · de pé ${dePe} · mortos ${raid.mortos.length} · ledger ${r.ledger.map(l=>l.tipo).join(",")}`);
}
