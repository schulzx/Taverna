import {
  HEROISMO_MAX, GASTOS, gastoPorId, FONTES, garantirHeroismo, ganharHeroismo,
  podeGastar, gastarHeroismo, validarDeclaracao, envelopeDeclaracao, envelopeRefazer,
  resumoHeroismoPrompt,
} from "../src/heroismo.js";
import { migrarPersonagem } from "../src/regras-jogo.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[1. O CATÁLOGO DE GASTOS]");
ok(GASTOS.length === 4, `quatro gastos (${GASTOS.length})`);
ok(GASTOS.every((g) => g.id && g.custo >= 1 && g.rotulo && g.desc && g.quando), "todos com id, custo, rótulo, descrição e quando cabe");
ok(gastoPorId("declarar").custo === 2, "declarar custa o dobro — é o único que mexe no mundo");
ok(GASTOS.filter((g) => g.custo === 1).length === 3, "os três que mexem só no dado custam 1");
ok(gastoPorId("nao_existe") === null, "gasto inexistente devolve null");

console.log("\n[2. O SALDO]");
ok(garantirHeroismo({}) === 0 && garantirHeroismo(null) === 0, "ficha sem campo começa em 0");
ok(garantirHeroismo({ heroismo: 99 }) === HEROISMO_MAX, `saldo corrompido é aparado no teto (${HEROISMO_MAX})`);
ok(garantirHeroismo({ heroismo: -5 }) === 0, "negativo vira 0");
ok(garantirHeroismo({ heroismo: 2.7 }) === 2, "fracionário é truncado");

console.log("\n[3. GANHAR]");
const g0 = ganharHeroismo({ heroismo: 0 }, "desastre");
console.log("  " + g0.msg);
ok(g0.pers.heroismo === 1 && /falha crítica/.test(g0.msg), "falha crítica rende 1 e explica por quê");
ok(ganharHeroismo({ heroismo: 0 }, "sobreviveu").pers.heroismo === 1, "voltar de um 0 PV rende");
ok(ganharHeroismo({ heroismo: 0 }, "missao").pers.heroismo === 1, "missão concluída rende");
ok(ganharHeroismo({ heroismo: 0 }, "nivel").pers.heroismo === 1, "subir de nível rende");
const cheio = ganharHeroismo({ heroismo: HEROISMO_MAX }, "desastre");
ok(cheio.pers.heroismo === HEROISMO_MAX && cheio.msg === "", "no teto não ganha nem avisa — nada de mensagem vazia na tela");
ok(ganharHeroismo({ heroismo: 1 }, "fonte_inventada").msg === "", "fonte desconhecida não dá nada");

console.log("\n[4. O DESCANSO É PISO, NÃO SOMA]");
ok(ganharHeroismo({ heroismo: 0 }, "descanso").pers.heroismo === 1, "quem acorda zerado acorda com 1");
ok(ganharHeroismo({ heroismo: 3 }, "descanso").pers.heroismo === 3, "quem tinha 3 continua com 3 — acampar não é fábrica");
ok(ganharHeroismo({ heroismo: 2 }, "descanso").pers.heroismo === 2, "e quem tinha 2 também não sobe");
ok(ganharHeroismo({ heroismo: 2 }, "descanso").msg === "", "sem ganho, sem mensagem");

console.log("\n[5. GASTAR]");
ok(podeGastar({ heroismo: 1 }, "refazer") && !podeGastar({ heroismo: 1 }, "declarar"), "1 ponto paga refazer mas não declarar");
const gasto = gastarHeroismo({ heroismo: 3 }, "declarar");
ok(gasto.ok && gasto.pers.heroismo === 1 && gasto.restam === 1, "declarar tira 2 e devolve o que restou");
const semSaldo = gastarHeroismo({ heroismo: 0 }, "refazer");
ok(!semSaldo.ok && /custa 1, você tem 0/.test(semSaldo.motivo), `sem saldo explica: "${semSaldo.motivo}"`);
ok(semSaldo.pers.heroismo === 0, "e não mexe na ficha");
ok(!gastarHeroismo({ heroismo: 3 }, "voar").ok, "gasto inexistente é recusado");

console.log("\n[6. A DECLARAÇÃO — pequena de propósito]");
const bons = [
  "há uma escada de serviço nos fundos da taverna",
  "chove forte lá fora desde a tarde",
  "o taverneiro deve um favor ao meu antigo regimento",
  "existe um alçapão sob o tapete, fechado a cadeado",
];
bons.forEach((t) => ok(validarDeclaracao(t).ok, `aceita: "${t.slice(0, 45)}…"`));
const ruins = [
  ["mato o chefe agora", "matar não é detalhe, é desfecho"],
  ["o ogro morre de susto", "morte também não"],
  ["acho o tesouro escondido aqui", "achar o tesouro resolve a cena"],
  ["todos se rendem para mim", "rendição em massa é vitória, não cenário"],
  ["sou invisível", "poder novo não é detalhe de cenário"],
  ["ok", "curto demais para ser um fato"],
  ["a".repeat(300), "longo demais — isso é uma cena, não um detalhe"],
];
ruins.forEach(([t, porque]) => ok(!validarDeclaracao(t).ok, `recusa (${porque}): "${t.slice(0, 30)}…"`));
ok(validarDeclaracao("").motivo && validarDeclaracao(null).motivo, "vazio e nulo são recusados com motivo");

console.log("\n[7. OS ENVELOPES]");
const env = envelopeDeclaracao("há uma escada de serviço nos fundos");
console.log("  " + env.split("\n")[0].slice(0, 110) + "…");
ok(/OBRIGATÓRIA/.test(env), "a declaração chega marcada como obrigatória");
ok(/NÃO nega/.test(env) && /NÃO cobra um teste/.test(env), "e proíbe negar e cobrar teste pelo que já foi pago");
ok(/deixe que EU a use/.test(env), "e impede o Mestre de usar a abertura no lugar do jogador");
const envR = envelopeRefazer({ rotulo: "Furtividade", primeiro: 3, segundo: 17, mod: 6, dc: 15 });
ok(/o segundo, que é o que vale, deu 17/.test(envR), "o refazer diz qual dado vale");
ok(/Não mencione sistema, ponto nem rolagem/.test(envR), "e proíbe o Mestre de citar a mecânica");
ok(!/ponto de heroísmo\b.*narre/i.test(envR.split("Narre")[1] || ""), "a instrução de narrar não repete a mecânica");

console.log("\n[8. O QUE O MESTRE RECEBE]");
ok(resumoHeroismoPrompt({ heroismo: 0 }) === "", "sem pontos, nada no prompt");
const rp = resumoHeroismoPrompt({ heroismo: 2 });
ok(/2\/3/.test(rp), "com pontos, o saldo aparece");
ok(/nunca concede, nunca tira/.test(rp), "e o Mestre é proibido de mexer no recurso");
ok(rp.length < 260, `curto: ${rp.length} caracteres`);

console.log("\n[9. MIGRAÇÃO]");
const antigo = migrarPersonagem({ nome: "Vera", classe: "Mago", nivel: 12 });
ok(antigo.heroismo === 1, "save antigo entra com 1 ponto — conhecer o recurso não pode depender de uma falha crítica");
ok(antigo.heroismoVersao === 1, "marca a versão");
const remig = migrarPersonagem({ ...antigo, heroismo: 0 });
ok(remig.heroismo === 0, "migrar de novo NÃO devolve ponto gasto");
ok(migrarPersonagem({ ...antigo, heroismo: 9 }).heroismo === HEROISMO_MAX, "e apara saldo corrompido");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
