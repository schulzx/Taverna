import { aflicaoDe, rolarAflicao, golpesDeCriatura, golpeDaVez, PORTADORES } from "../src/aflicoes.js";
import { perfilDeCriatura } from "../src/danos.js";
import { CRIATURAS_FANTASIA } from "../src/bestiario.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[armas e itens] o que cada uma carrega:");
for (const [fonte, esperado] of [
  ["Adaga Envenenada", "envenenado"],
  ["Espada Flamejante fisico", "queimando"],
  ["Maça de Guerra", "atordoado"],
  ["Machado Serrilhado", "sangrando"],
  ["Lâmina Gélida gelo", "lento"],
  ["Rede de Caçador", "agarrado"],
  ["Espada Longa", null],
  ["Adaga Comum", null],
  ["Cajado do Basilisco", "paralisado"],
]) {
  const a = aflicaoDe(fonte);
  ok((a ? a.cond : null) === esperado, `"${fonte}" → ${a ? a.cond : "nada"} (esperado ${esperado || "nada"})`);
}

console.log("\n[habilidades] do catálogo de classes:");
for (const [nome, desc, esperado] of [
  ["Toque Gélido", "Dano e reduz a velocidade do alvo.", "lento"],
  ["Rajada de Fogo", "Dano em área a inimigos próximos.", "queimando"],
  ["Investida", "Avança e ataca, derrubando o alvo se acertar.", "caido"],
  ["Grito de Guerra", "Aliados ganham vantagem no próximo ataque.", "inspirado"],
  ["Postura Defensiva", "Reduz o dano recebido no próximo turno.", "protegido"],
  ["Lentidão", "O alvo perde uma ação por 2 turnos.", "lento"],
  ["Ataque Furtivo", "Dano extra ao atacar de surpresa.", "furtivo"],
  ["Projétil Arcano", "Dardo de energia que raramente erra.", null],
]) {
  const a = aflicaoDe(`${nome} ${desc}`);
  ok((a ? a.cond : null) === esperado, `"${nome}" → ${a ? a.cond : "nada"} (esperado ${esperado || "nada"})`);
}

console.log("\n[criaturas] golpes do catálogo + aflição embutida:");
for (const c of CRIATURAS_FANTASIA.slice(0, 8)) {
  const p = perfilDeCriatura(c.nome, c.desc);
  const golpes = golpesDeCriatura(c.nome, p.ataque, c.ameaca);
  const afl = golpes.map((g) => { const a = aflicaoDe(g); return a ? a.cond : "—"; });
  console.log(`  ${c.nome.padEnd(16)} [${p.ataque}] ${golpes.join(" / ")}  →  ${afl.join(" / ")}`);
}
const g1 = golpesDeCriatura("Aranha Gigante", "veneno", "comum");
const g2 = golpesDeCriatura("Aranha Gigante", "veneno", "comum");
ok(JSON.stringify(g1) === JSON.stringify(g2), "o mesmo bicho usa sempre o mesmo repertório (determinístico)");

console.log("\n[o dado que decide] adaga envenenada contra um alvo:");
const alvo = { nome: "Goblin", nivel: 2, condicoes: [], atributos: {} };
let aplicou = 0, resistiu = 0, nemTentou = 0;
for (let i = 0; i < 400; i++) {
  const r = rolarAflicao({ fonte: "Adaga Envenenada", nomeFonte: "Adaga Envenenada", atacante: "Vera", alvo, alvoNome: "Goblin" });
  if (!r) nemTentou++; else if (r.aplicou) aplicou++; else resistiu++;
}
console.log(`  em 400 golpes: ${nemTentou} sem tentativa, ${resistiu} resistidos, ${aplicou} envenenados`);
ok(nemTentou > 120 && nemTentou < 240, "nem todo golpe tenta afligir (~45% não tentam)");
ok(aplicou > 30 && resistiu > 30, "quando tenta, às vezes passa e às vezes o alvo resiste");

const forte = { nome: "Golem", nivel: 12, condicoes: [], atributos: { vigor: 5 } };
let passouNoForte = 0;
for (let i = 0; i < 300; i++) { const r = rolarAflicao({ fonte: "Adaga Envenenada", atacante: "Vera", alvo: forte, sempre: true }); if (r && r.aplicou) passouNoForte++; }
console.log(`  contra um golem nível 12 (vigor 5): ${passouNoForte}/300 passaram`);
ok(passouNoForte < 90, "alvo resistente raramente é envenenado");

const jaEnvenenado = { nome: "Goblin", nivel: 2, condicoes: [{ id: "envenenado", nome: "Envenenado" }], atributos: {} };
ok(rolarAflicao({ fonte: "Adaga Envenenada", atacante: "Vera", alvo: jaEnvenenado, sempre: true }) === null, "não empilha a mesma condição");

console.log("\n[buffs] não têm resistência:");
const buff = rolarAflicao({ fonte: "Grito de Guerra Aliados ganham vantagem", nomeFonte: "Grito de Guerra", atacante: "Vera", sempre: true });
ok(buff && buff.aplicou && buff.escopo === "aliados" && buff.cond.id === "inspirado", `Grito de Guerra → ${buff && buff.cond.nome} em ${buff && buff.escopo}`);
const furia = rolarAflicao({ fonte: "Fúria Ancestral", nomeFonte: "Fúria", atacante: "Doran", sempre: true });
ok(furia && furia.escopo === "proprio" && furia.cond.id === "enfurecido", `Fúria → ${furia && furia.cond.nome} em quem usou`);

console.log("\n[texto que o Mestre recebe]:");
const r = rolarAflicao({ fonte: "Mordida peçonhenta Aranha", nomeFonte: "Mordida peçonhenta (Aranha Gigante)", atacante: "Aranha Gigante", alvo: { nome: "Vera", nivel: 5, condicoes: [], atributos: { vigor: 2 } }, alvoNome: "você", sempre: true });
console.log("  " + (r ? r.texto : "-"));
console.log("  " + (r ? r.nota : "-"));

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
