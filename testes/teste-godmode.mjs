import { interpretar, lerNumero, textoDeAjuda, textoDesconhecido, cravarNivel, cravarGD, COMANDOS } from "../src/godmode.js";
import { pontosNoNivel } from "../src/classes.js";
import { pontosAtributoNoNivel } from "../src/atributos.js";
import { GRAUS, grauDe } from "../src/divindades.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[o que É e o que NÃO É comando]");
ok(interpretar("ataco o orc") === null, "ação normal não é comando — passa direto para o Mestre");
ok(interpretar("e/ou vou pela esquerda") === null, "barra no meio da frase não conta");
ok(interpretar("/nivel 20").cmd === "nivel", "/nivel é reconhecido");
ok(interpretar("  /GD 4  ").cmd === "gd", "maiúscula e espaço não atrapalham");
ok(interpretar("/nível 20").cmd === "nivel", "acento também é aceito");
ok(interpretar("/").cmd === "ajuda", "só a barra abre a ajuda");
const desc = interpretar("/naoexiste");
ok(desc.cmd === null && desc.desconhecido === "naoexiste", "comando inválido é identificado, não executado");
ok(/não existe/.test(textoDesconhecido("naoexiste")), "e devolve mensagem de erro");
ok(/Você quis dizer/.test(textoDesconhecido("nive")), `sugere o parecido: ${textoDesconhecido("nive").slice(0, 60)}…`);

console.log("\n[argumentos]");
const i1 = interpretar("/combate Dragão Ancião 16 3");
ok(i1.args.length === 4 && i1.bruto === "Dragão Ancião 16 3", `argumentos e texto bruto: "${i1.bruto}"`);
ok(lerNumero("+5").relativo && lerNumero("+5").valor === 5, "+5 é relativo");
ok(!lerNumero("5").relativo && lerNumero("5").valor === 5, "5 é absoluto");
ok(!lerNumero("abc").ok, "texto que não é número é recusado");
ok(lerNumero("", 3).ok && lerNumero("", 3).valor === 3, "vazio cai no padrão");

console.log("\n[cravar nível — subir e descer]");
const base = { nivel: 1, vidaMax: 14, manaMax: 8, pontosHab: 0, pontosAtr: 0, xp: 500 };
const sobe = cravarNivel(base, 20, { pontosNoNivel, pontosAtributoNoNivel });
console.log(`  nv 1 → 20: PV ${sobe.pers.vidaMax}, PM ${sobe.pers.manaMax}, ${sobe.pers.pontosHab} pontos de hab, ${sobe.pers.pontosAtr} de atributo`);
ok(sobe.pers.nivel === 20, "chega ao 20");
ok(sobe.pers.vida === sobe.pers.vidaMax && sobe.pers.mana === sobe.pers.manaMax, "chega com vida e mana cheias");
ok(sobe.pers.pontosHab === 49 && sobe.pers.pontosAtr === 38, "credita exatamente os pontos que 19 níveis dariam (49 e 38)");
const desce = cravarNivel(sobe.pers, 5, { pontosNoNivel, pontosAtributoNoNivel });
console.log(`  20 → 5: PV ${desce.pers.vidaMax}, ${desce.pers.pontosHab} pontos de hab`);
ok(desce.pers.nivel === 5 && desce.pers.vidaMax > 0, "descer também funciona, sem PV negativo");
ok(desce.pers.pontosHab >= 0 && desce.pers.pontosAtr >= 0, "e nunca deixa pontos negativos");
ok(cravarNivel(base, 99, { pontosNoNivel, pontosAtributoNoNivel }).pers.nivel === 20, "acima de 20 é travado no 20");
ok(cravarNivel(base, -5, { pontosNoNivel, pontosAtributoNoNivel }).pers.nivel === 1, "abaixo de 1 é travado no 1");
ok(cravarNivel(base, 1, { pontosNoNivel, pontosAtributoNoNivel }).delta === 0, "cravar o nível atual não muda nada");

console.log("\n[cravar GD]");
const dv = { despertar: false, fieis: 0, pf: 0, grausGanhos: 0 };
for (const g of [1, 2, 3, 4]) {
  const r = cravarGD(dv, g, { grausPorFieis: (x) => (GRAUS[x] || GRAUS[0]).fieis });
  console.log(`  /gd ${g} → GD ${grauDe(r)}, ${r.fieis} fiéis, despertou: ${r.despertar}`);
  if (grauDe(r) !== g) { falhas++; console.log("    FALHA: grau errado"); }
}
const g4 = cravarGD(dv, 4, { grausPorFieis: (x) => (GRAUS[x] || GRAUS[0]).fieis });
ok(g4.despertar, "cravar GD desperta a ascensão sozinho");
ok(g4.grausGanhos === 4, "usa a MESMA porta do deicídio (grausGanhos), não um caminho paralelo");
const rico = cravarGD({ ...dv, fieis: 5000000 }, 1, { grausPorFieis: (x) => (GRAUS[x] || GRAUS[0]).fieis });
ok(rico.fieis === 5000000, "não reduz fiéis de quem já tinha mais");
ok(cravarGD(dv, 9, { grausPorFieis: (x) => (GRAUS[x] || GRAUS[0]).fieis }).grausGanhos === 4, "acima de 4 é travado");

console.log("\n[a ajuda]");
const aj = textoDeAjuda();
ok(COMANDOS.every((c) => aj.includes(`/${c.cmd}`)), `todos os ${COMANDOS.length} comandos aparecem na ajuda`);
ok(/não gasta turno nem tokens/.test(aj), "a ajuda diz que não custa nada");
ok(new Set(COMANDOS.map((c) => c.cmd)).size === COMANDOS.length, "nenhum comando duplicado na tabela");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
