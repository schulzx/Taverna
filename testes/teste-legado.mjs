import {
  custoDeVoltar, MAX_VOLTAS, formasDeVoltar, CICATRIZES_DA_MORTE, sortearCicatrizDaMorte,
  aplicarVolta, nivelDoHerdeiro, heranca, envelopeDoHerdeiro, resumoLegadoPrompt,
} from "../src/legado.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

const morto = {
  nome: "Vera", nivel: 12, vidaMax: 72, vida: 0, moedas: 900, voltas: 0, cicatrizes: [],
  equipamento: [
    { nome: "Faca Velha", raridade: "comum" },
    { nome: "Corda", raridade: "incomum" },
    { nome: "Lâmina Ígnea", raridade: "raro", poder: "queima" },
    { nome: "Coroa Perdida", raridade: "lendario" },
  ],
};

console.log("\n[1. O PREÇO DE VOLTAR]");
console.log("  " + [0, 1, 2, 3].map((v) => `${v}ª volta: ◉ ${custoDeVoltar({ ...morto, voltas: v }).moedas}`).join(" · "));
ok(custoDeVoltar({ ...morto, voltas: 1 }).moedas > custoDeVoltar(morto).moedas, "a segunda volta custa mais que a primeira — senão morrer vira taxa");
ok(custoDeVoltar({ ...morto, nivel: 20 }).moedas > custoDeVoltar({ ...morto, nivel: 3 }).moedas, "e o mundo cobra mais caro por gente importante");
ok(custoDeVoltar({ ...morto, voltas: 3 }).possivel === false, `depois de ${MAX_VOLTAS} voltas não há uma quarta`);
ok(/nao havera|não haverá/i.test(custoDeVoltar({ ...morto, voltas: 3 }).motivo), "e o sistema diz isso na cara");

console.log("\n[2. AS FORMAS DE VOLTAR]");
const c = custoDeVoltar(morto).moedas;
ok(formasDeVoltar(morto, { moedas: c }).opcoes.some((o) => o.id === "ouro"), "com ouro no bolso, dá para pagar");
ok(formasDeVoltar(morto, { moedas: 0, cofre: c }).opcoes.some((o) => o.id === "ouro"), "o cofre da guilda também conta");
ok(!formasDeVoltar(morto, { moedas: c - 1 }).possivel, "um a menos e não dá");
ok(formasDeVoltar(morto, { moedas: 0, gd: 2, pf: 100 }).opcoes.some((o) => o.id === "fe"),
   "quem tem grau divino volta pela própria fé — é o caminho divino significando algo numa hora em que importa");
ok(!formasDeVoltar(morto, { moedas: 0, gd: 0, pf: 999 }).opcoes.some((o) => o.id === "fe"), "sem grau divino, fé não paga");
ok(!formasDeVoltar({ ...morto, voltas: 3 }, { moedas: 999999 }).possivel, "e nem ouro compra a quarta");

console.log("\n[3. A CICATRIZ QUE NÃO SARA]");
ok(CICATRIZES_DA_MORTE.length >= 5 && CICATRIZES_DA_MORTE.every((x) => x.nome && x.desc), "o catálogo tem nome e efeito");
const v1 = aplicarVolta(morto);
console.log(`  voltou com ${v1.vida}/${v1.vidaMax} PV e a marca: ${v1.cicatrizes[0].nome}`);
ok(v1.morto === false && v1.morrendo === false, "volta vivo");
ok(v1.vida > 0 && v1.vida < v1.vidaMax, "com uma fração do PV, não inteiro");
ok(v1.voltas === 1, "conta a volta");
ok(v1.cicatrizes.length === 1 && v1.cicatrizes[0].daMorte, "e ganha uma cicatriz marcada como sendo da morte");
const v2 = aplicarVolta(v1);
ok(v2.cicatrizes.length === 2 && v2.cicatrizes[0].nome !== v2.cicatrizes[1].nome, "a segunda volta traz outra cicatriz, não a mesma");
ok(sortearCicatrizDaMorte(CICATRIZES_DA_MORTE), "com o catálogo esgotado, ainda devolve alguma — nunca quebra");

console.log("\n[4. O HERDEIRO]");
ok(nivelDoHerdeiro(20) === 10 && nivelDoHerdeiro(12) === 6, "começa na metade do que a lenda alcançou");
ok(nivelDoHerdeiro(1) === 3 && nivelDoHerdeiro(4) === 3, "com piso 3 — começar do zero num mundo de nível 20 seria suicídio, não recomeço");
const h = heranca(morto, { mapa: { cidades: [{ faccao: "Ordem do Corvo" }, { faccao: "Ordem do Corvo" }, { faccao: "outra" }] }, guilda: { nivel: 2 }, faccaoJogador: "Ordem do Corvo" });
console.log(`  herda: nível ${h.nivel} · ◉ ${h.moedas} · ${h.equipamento.length} itens · ${h.dominios} domínios`);
console.log(`  fica no túmulo: ${h.guardado.join(", ")}`);
ok(h.moedas < morto.moedas, "herda parte das moedas, não tudo");
ok(h.equipamento.every((i) => !i.poder), "e só o equipamento SEM poder passa de mão");
ok(h.guardado.includes("Lâmina Ígnea") && h.guardado.includes("Coroa Perdida"),
   "os objetos de poder vão para o túmulo — viram o tesouro que a PRÓXIMA aventura procura");
ok(h.dominios === 2, "os domínios da facção continuam contados: o MUNDO atravessa");
ok(h.guilda === true && h.faccao === "Ordem do Corvo", "guilda e facção também");

console.log("\n[5. O ENVELOPE DO HERDEIRO]");
const env = envelopeDoHerdeiro("Vera", "Corin", h);
console.log("  " + env.split("\n")[0].slice(0, 120));
ok(/o mundo NÃO foi reiniciado/i.test(env), "diz que o mundo continua");
ok(/2 cidade/.test(env), "e conta os domínios que continuam sendo da facção");
ok(/Lâmina Ígnea/.test(env), "cita o que foi enterrado — vira gancho de aventura");
ok(/nunca com intimidade que Corin não construiu/i.test(env), "e proíbe as pessoas de tratarem o rosto novo como velho conhecido");

console.log("\n[6. O QUE O MESTRE RECEBE]");
ok(resumoLegadoPrompt(morto) === "", "quem nunca morreu não tem nada a dizer");
const rp = resumoLegadoPrompt(v2);
console.log("  " + rp.slice(0, 130));
ok(/2 vez/.test(rp), "diz quantas voltas");
ok(/sem transformar em tema/.test(rp), "e pede que apareça sem virar monólogo");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
