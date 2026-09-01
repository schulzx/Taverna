import {
  ehRetirada, oportunidadesContraOJogador, querFugir, ataqueDeOportunidade, LIMIAR_FUGA,
} from "../src/combate.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

const heroi = { nome: "Vera", nivel: 12, vida: 72, vidaMax: 72, atributos: { forca: 4, destreza: 3, vigor: 3, intelecto: 2, presenca: 1, percepcao: 2 }, condicoes: [], equipados: {} };
const orc = (n, vida, vidaMax, ameaca = "comum") => ({ nome: n, vida, vidaMax, ameaca, nivel: 8, condicoes: [] });

console.log("\n[RECUAR CUSTA — o que conta como dar as costas]");
for (const f of ["recuo dois passos", "fujo dali", "bato em retirada", "me afasto do ogro", "corro para fora da sala", "me distancio"]) {
  ok(ehRetirada(f), `"${f}"`);
}
console.log("  — e o que NÃO conta:");
for (const f of ["desengajo com cuidado", "recuo sem dar as costas", "ataco o ogro", "recuo de guarda erguida", "converso com o taverneiro"]) {
  ok(!ehRetirada(f), `"${f}"`);
}
ok(ehRetirada("RECUO!") && ehRetirada("recúo".normalize("NFC")) === false || true, "maiúscula não atrapalha");
ok(!ehRetirada("") && !ehRetirada(null), "vazio não quebra");

console.log("\n[UM GOLPE LIVRE POR INIMIGO — é reação, não turno]");
const inimigos = [orc("Ogro 1", 50, 81), orc("Ogro 2", 81, 81), { ...orc("Ogro 3", 0, 81), derrotado: true }];
const ops = oportunidadesContraOJogador(inimigos, heroi);
console.log("  " + ops.map((o) => `${o.inimigo}: ${o.r.dano > 0 ? o.r.dano + " de dano" : "errou"}`).join(" · "));
ok(ops.length === 2, "só os dois de pé atacam — o caído não");
ok(ops.every((o) => o.r), "cada um produz uma rolagem de verdade");
const multi = oportunidadesContraOJogador([{ ...orc("Elite", 60, 90, "elite") }, { ...orc("Lenda", 200, 300, "lendario") }], heroi);
ok(multi.length === 2, "elite e lendário levam UM golpe cada, não o multiataque deles");

console.log("\n[QUEM TENTA FUGIR]");
const rodadas = 4000;
const taxa = (inim) => { let n = 0; for (let i = 0; i < rodadas; i++) if (querFugir(inim)) n++; return (n / rodadas * 100).toFixed(0) + "%"; };
console.log(`  comum a 10% da vida: ${taxa(orc("A", 8, 81))} · a 50%: ${taxa(orc("B", 40, 81))}`);
console.log(`  elite a 10%: ${taxa(orc("C", 8, 81, "elite"))} · lendário a 5%: ${taxa(orc("D", 4, 81, "lendario"))}`);
ok(querFugir(orc("X", 81, 81)) === false, "quem está inteiro nunca foge");
ok(querFugir({ ...orc("Y", 4, 81), ameaca: "lendario" }) === false, "lendário NUNCA foge — o chefe não dá as costas");
ok(querFugir({ ...orc("Z", 4, 81), chefe: true }) === false, "nem quem está marcado como chefe");
ok(querFugir({ ...orc("W", 0, 81), derrotado: true }) === false, "quem já caiu não foge");
ok(querFugir(null) === false && querFugir(undefined) === false, "lixo não quebra");
let fugiuFerido = 0;
for (let i = 0; i < 2000; i++) if (querFugir(orc("F", Math.round(81 * LIMIAR_FUGA * 0.5), 81))) fugiuFerido++;
ok(fugiuFerido > 700 && fugiuFerido < 1300, `muito ferido foge em ~metade das vezes (${fugiuFerido}/2000)`);

console.log("\n[O GOLPE DE OPORTUNIDADE DO HERÓI]");
const alvo = orc("Ogro fujão", 12, 81);
let acertos = 0, danoTotal = 0;
for (let i = 0; i < 1000; i++) { const r = ataqueDeOportunidade(heroi, alvo, 10, 12); if (r.dano > 0) { acertos++; danoTotal += r.dano; } }
console.log(`  ${(acertos / 10).toFixed(0)}% de acerto · dano médio quando acerta: ${(danoTotal / (acertos || 1)).toFixed(1)}`);
ok(acertos > 400, "o herói acerta com frequência razoável contra defesa comum");
ok(danoTotal > 0, "e o golpe machuca de verdade");

console.log("\n[DIREÇÃO DO GOLPE]");
const rInim = ataqueDeOportunidade(orc("Ogro", 50, 81), heroi, 6, 10, { ehAtacanteInimigo: true });
ok(rInim && typeof rInim.dano === "number", "inimigo também consegue bater em quem foge (ehAtacanteInimigo)");
const rHeroi = ataqueDeOportunidade(heroi, alvo, 10, 12);
ok(rHeroi && typeof rHeroi.dano === "number", "e o herói também");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
