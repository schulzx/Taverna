import {
  PERICIAS, periciaPorId, periciasDoAtributo, lequeDaClasse, periciasDoAntecedente,
  garantirPericias, periciasIniciais, limiteTreinadas, limiteEspecialistas,
  bonusDePericia, passivoDe, resolucaoAutomatica, resumoPericiasPrompt,
} from "../src/pericias.js";
import { detectarPedidoDeTeste, detectarPericiaPedida, envelopeDoTeste } from "../src/testes.js";
import { migrarPersonagem } from "../src/regras-jogo.js";
import { bonusProficiencia } from "../src/regras.js";
import { ATRIBUTOS } from "../src/constantes.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[1. O CATÁLOGO]");
ok(PERICIAS.length === 18, `18 perícias (${PERICIAS.length})`);
ok(ATRIBUTOS.every((a) => periciasDoAtributo(a.id).length === 3), "três por atributo, sem atributo órfão");
ok(new Set(PERICIAS.map((p) => p.id)).size === 18, "nenhum id repetido");
ok(PERICIAS.every((p) => p.nome && p.desc && p.icone && ATRIBUTOS.some((a) => a.id === p.atributo)), "toda perícia tem nome, descrição, ícone e um atributo que existe");

console.log("\n[2. O LEQUE DA CLASSE]");
for (const c of ["Guerreiro", "Mago", "Ladino", "Bardo", "Clérigo", "Caçador", "Monge", "Druida", "Feiticeiro", "Bruxo", "Engenheiro", "Invocador"]) {
  const l = lequeDaClasse(c);
  ok(l.pool.length >= l.escolhas && l.pool.every((id) => periciaPorId(id)), `${c}: ${l.escolhas} escolhas num leque de ${l.pool.length} — todas existem`);
}
ok(lequeDaClasse("Ladino").escolhas === 4, "o Ladino escolhe mais que todo mundo — é o que ele é");
ok(lequeDaClasse("Classe Inventada").pool.length === 18, "classe desconhecida não quebra: leque completo");

console.log("\n[3. O PASSADO]");
ok(periciasDoAntecedente("ladrao").includes("prestidigitacao"), "por id: o filho da guilda sabe mãos leves");
ok(periciasDoAntecedente("Filho da Guilda dos Dedos").includes("prestidigitacao"), "e por NOME também — é o que a ficha guarda de verdade");
ok(periciasDoAntecedente("Erudito de Arquivo").includes("investigacao"), "acento e maiúscula não atrapalham");
ok(periciasDoAntecedente("").length === 0 && periciasDoAntecedente(null).length === 0, "sem antecedente não quebra");

console.log("\n[4. A FICHA — dois heróis de mesma Destreza, resultados diferentes]");
const ladino = { classe: "Ladino", nivel: 8, antecedente: "Filho da Guilda dos Dedos", pericias: { treinadas: ["furtividade", "prestidigitacao"], especialistas: ["furtividade"] } };
const monge = { classe: "Monge", nivel: 8, antecedente: "Acólito Fugitivo", pericias: { treinadas: ["acrobacia"], especialistas: [] } };
const modDex = 4;
const bl = bonusDePericia(ladino, "furtividade", modDex);
const bm = bonusDePericia(monge, "furtividade", modDex);
console.log(`  mesma Destreza +${modDex}: Ladino especialista rola +${bl.total}, Monge leigo rola +${bm.total}`);
ok(bl.total > bm.total, "o Ladino furta melhor — que era o buraco inteiro");
ok(bl.total === modDex + bonusProficiencia(8) * 2, "especialista dobra a proficiência");
ok(bonusDePericia(ladino, "prestidigitacao", modDex).total === modDex + bonusProficiencia(8), "treinada soma uma vez");
ok(bm.total === modDex, "sem treino é só o atributo — nem penalidade, nem brinde");
ok(bonusDePericia(ladino, "inexistente", 3).total === 3, "perícia que não existe não quebra");

console.log("\n[5. LIMITES]");
ok(limiteEspecialistas(1) === 0 && limiteEspecialistas(5) === 0, "especialista não existe antes do nível 6");
ok(limiteEspecialistas(6) === 1 && limiteEspecialistas(11) === 1, "uma do 6 ao 11");
ok(limiteEspecialistas(12) === 2 && limiteEspecialistas(20) === 2, "duas do 12 em diante — e para por aí");
const g = { classe: "Guerreiro", antecedente: "Soldado Reformado", nivel: 3 };
ok(limiteTreinadas(g) === 2 + 2, "Guerreiro + Soldado = 2 da classe + 2 do passado");
ok(limiteTreinadas({ ...g, classesExtras: ["Mago"] }) === 5, "multiclasse abre UMA a mais, não o leque inteiro");
ok(garantirPericias({ pericias: { treinadas: ["furtividade"], especialistas: ["arcanismo"] } }).especialistas.length === 0, "especialista sem treino é descartado — a segunda camada assenta na primeira");
ok(garantirPericias({ pericias: { treinadas: ["furtividade", "furtividade", "lixo"] } }).treinadas.length === 1, "duplicata e lixo somem");
ok(garantirPericias(null).treinadas.length === 0, "personagem nulo não quebra");

console.log("\n[6. MIGRAÇÃO — nenhum save antigo acorda leigo em tudo]");
const antigo = { nome: "Vera", classe: "Ladino", antecedente: "Filho da Guilda dos Dedos", nivel: 12, atributos: { destreza: 3 } };
const mig = migrarPersonagem(antigo);
console.log("  treinadas após migrar:", mig.pericias.treinadas.map((i) => periciaPorId(i).nome).join(", "));
ok(mig.pericias.treinadas.length === limiteTreinadas(mig), "recebe exatamente o que a classe e o passado já justificavam");
ok(periciasDoAntecedente("Filho da Guilda dos Dedos").every((id) => mig.pericias.treinadas.includes(id)), "e o passado entra primeiro — foi ele que aconteceu");
ok(mig.periciasVersao === 1, "marca a versão");
const remig = migrarPersonagem({ ...mig, pericias: { treinadas: ["arcanismo"], especialistas: [] } });
ok(remig.pericias.treinadas.join() === "arcanismo", "migrar de novo NÃO sobrescreve a escolha do jogador");

console.log("\n[7. PASSIVO — o que ele nota sem rolar]");
const observador = { classe: "Caçador", nivel: 10, pericias: { treinadas: ["percepcao"], especialistas: ["percepcao"] } };
ok(passivoDe(observador, "percepcao", 4) === 10 + 4 + bonusProficiencia(10) * 2, "10 + bônus, com especialista dobrado");
ok(passivoDe({}, "percepcao", 0) === 10, "leigo sem atributo: passivo 10");

console.log("\n[8. SUCESSO E FALHA AUTOMÁTICOS]");
ok(resolucaoAutomatica(9, 10) === "sucesso", "bônus 9 contra dificuldade 10: nem um 1 natural falha — não se rola");
ok(resolucaoAutomatica(8, 10) === null, "bônus 8: o 1 natural ainda falha, então o dado decide");
ok(resolucaoAutomatica(4, 25) === "falha", "bônus 4 contra 25: nem um 20 alcança — falha sem rolar");
ok(resolucaoAutomatica(5, 25) === null, "bônus 5 + 20 = 25 empata a dificuldade — ainda vale rolar");
ok(resolucaoAutomatica(30, null) === null, "sem dificuldade definida não há automático");
ok(resolucaoAutomatica(30, 5, { permitir: false }) === null, "rito e achado desligam a regra: dificuldade de catálogo é para enfrentar");
/* o caso que motivou a regra */
const lendario = { classe: "Guerreiro", nivel: 15, pericias: { treinadas: ["atletismo"], especialistas: ["atletismo"] } };
const modAtl = bonusDePericia(lendario, "atletismo", 5).total;
console.log(`  nível 15 especialista em Atletismo: +${modAtl}`);
ok(resolucaoAutomatica(modAtl, 14) === "sucesso", "o lendário não tropeça mais em porta de celeiro (dif. 14)");
ok(resolucaoAutomatica(modAtl, 22) === null, "mas contra dificuldade 22 ele ainda rola — o desafio real continua real");

console.log("\n[9. PEDIR PELA PERÍCIA, NÃO PELO ATRIBUTO]");
ok(detectarPericiaPedida("peço um teste de Furtividade") === "furtividade", "pelo nome");
ok(detectarPericiaPedida("quero rolar para me esgueirar até a porta") === "furtividade", "pelo verbo");
ok(detectarPericiaPedida("faço um teste de Arcanismo") === "arcanismo", "arcanismo");
ok(detectarPericiaPedida("teste de intuição para ver se ele mente") === "intuicao", "intuição");
ok(detectarPericiaPedida("olho ao redor") === null, "frase comum não vira perícia");
const p1 = detectarPedidoDeTeste("peço um teste de Furtividade para passar pelos guardas");
ok(p1 && p1.pericia === "furtividade" && p1.tipo === "destreza", "o pedido leva a perícia E o atributo dela");
ok(p1.motivo === "passar pelos guardas", `o motivo sai limpo: "${p1.motivo}"`);
const p2 = detectarPedidoDeTeste("peço um teste de força para arrombar");
ok(p2 && p2.tipo === "forca", "pedido sem perícia nomeada continua funcionando (comportamento antigo)");
ok(detectarPedidoDeTeste("ataco o ogro") === null, "ação comum não vira pedido de teste");

console.log("\n[10. O ENVELOPE]");
const envAuto = envelopeDoTeste({ tipo: "forca", pericia: "atletismo", motivo: "escalar o muro", mod: 19, dc: 12, resultado: "sucesso", automatico: true, nivelTreino: "especialista" });
ok(/SEM DADO/.test(envAuto), "o envelope automático se anuncia como tal");
ok(/ESPECIALISTA/.test(envAuto), "e leva o selo do treino");
ok(!/d20/.test(envAuto), "sem dado significa sem dado: nenhum número de rolagem no texto");
const envFalha = envelopeDoTeste({ tipo: "percepcao", pericia: "percepcao", motivo: "achar a passagem", valor: 4, mod: 6, total: 10, dc: 16, resultado: "falha", nivelTreino: "nenhum" });
ok(/NÃO revela nada/.test(envFalha), "a regra dura da falha continua inteira");
ok(/NÃO tenho treino/.test(envFalha), "e o Mestre sabe que ele é leigo nisso");
ok(/Percepção \(Percepção\)/.test(envFalha) || /Percepção/.test(envFalha), "o rótulo mostra a perícia");

console.log("\n[11. O QUE O MESTRE RECEBE]");
const resumo = resumoPericiasPrompt(ladino, () => 4);
console.log("  " + resumo.split("\n").slice(0, 3).join("\n  "));
ok(/ESPECIALISTA/.test(resumo) && /Furtividade/.test(resumo), "diz em que ele é especialista");
ok(/SEM TREINO em:/.test(resumo), "e em que ele é leigo — o lado que o Mestre mais esquecia");
ok(/PASSIVOS/.test(resumo), "e os passivos, para não pedir teste do que ele nota de graça");
ok(resumoPericiasPrompt({}, () => 0) === "", "ficha sem perícia não polui o prompt");
ok(resumo.length < 900, `enxuto: ${resumo.length} caracteres por turno`);

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
