/* QUEM É QUEM (v9.22)

   Caso real, de um save de verdade: o Mestre apresentou Yorick como um velho
   camponês e o capitão da guarda como um gnomo chamado Halvard. Cenas
   depois, Yorick reapareceu como capitão da guarda — e o registro ACEITOU,
   porque `mesclarNPC` sobrescrevia `papel` como sobrescreve qualquer campo.

   Papel não é estado mutável como `local` ou `status`: e identidade. Pode
   mudar na ficcao (um campones VIRA guarda), mas isso e um acontecimento —
   e acontecimento passa pelo sistema, nao por uma sobrescrita silenciosa. */

import { mesclarNPC, criarNPC, mesmoPapel, palavrasDoPapel, quemTemOPapel } from "../src/npcs.js";
import { detectarPapelTrocado, violacoesDoTurno } from "../src/portao.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

const npcs = {
  Yorick: criarNPC("Yorick", { papel: "velho camponês", relacao: "conhecido", local: "Aldoria" }),
  Halvard: criarNPC("Halvard", { papel: "capitão da guarda", relacao: "conhecido", local: "Aldoria" }),
  Iris: criarNPC("Iris", { papel: "taverneira", relacao: "amiga", local: "Aldoria" }),
};

console.log("\n[1. A RÉGUA DO QUE É O MESMO PAPEL]");
ok(mesmoPapel("capitão da guarda", "o capitão"), "\"capitão da guarda\" e \"o capitão\" são a mesma pessoa dita de dois jeitos");
ok(mesmoPapel("velho camponês", "camponês"), "\"velho camponês\" e \"camponês\" também");
ok(!mesmoPapel("velho camponês", "capitão da guarda"), "camponês e capitão NÃO — foi essa a troca");
ok(!mesmoPapel("taverneira", "ferreira"), "taverneira e ferreira, idem");
ok(mesmoPapel("", "qualquer coisa") && mesmoPapel("qualquer coisa", ""), "sem informação de um dos lados, não afirmo diferença — na dúvida o portão não morde");
ok(palavrasDoPapel("o velho camponês da vila").join() === "velho,campones,vila" || palavrasDoPapel("o velho camponês da vila").includes("campones"),
   `as palavras que importam saem limpas: ${palavrasDoPapel("o velho camponês da vila").join(", ")}`);

console.log("\n[2. O REGISTRO PARA DE SER SOBRESCRITO]");
const antes = npcs.Yorick;
const depois = mesclarNPC(antes, { papel: "capitão da guarda", local: "Ponte do Sul" });
ok(depois.papel === "velho camponês", "o papel do registro RESISTE — era exatamente aqui que Yorick virava capitão");
ok(depois.local === "Ponte do Sul", "mas o resto atualiza normalmente: lugar é estado, papel é identidade");
ok(depois._papelConflito && depois._papelConflito.agora === "capitão da guarda", "e o conflito fica registrado para quem quiser agir sobre ele");
const refina = mesclarNPC(antes, { papel: "camponês idoso" });
ok(refina.papel === "camponês idoso" && !refina._papelConflito, "reformular o MESMO papel passa — não é troca, é sinônimo");
const vazio = mesclarNPC(criarNPC("Novo", {}), { papel: "ferreiro" });
ok(vazio.papel === "ferreiro" && !vazio._papelConflito, "quem ainda não tinha papel recebe o primeiro sem atrito");

console.log("\n[3. QUEM JÁ OCUPA O CARGO]");
ok(quemTemOPapel(npcs, "capitão da guarda", "Yorick").nome === "Halvard", "o cargo tem dono, e ele tem nome");
ok(quemTemOPapel(npcs, "capitão da guarda", "Halvard") === null, "e o próprio dono não conta como conflito consigo mesmo");
ok(quemTemOPapel(npcs, "alquimista") === null, "cargo sem dono devolve null");

console.log("\n[4. O CÃO DE GUARDA]");
const caso = detectarPapelTrocado("Yorick, o capitão da guarda, cruza a praça e ergue a mão.", npcs);
console.log(`  ${caso[0].nome}: registro diz "${caso[0].registrado}", texto diz "${caso[0].dito}" — cargo de ${caso[0].dono}`);
ok(caso.length === 1 && caso[0].dono === "Halvard", "pega a troca E aponta de quem é o cargo");
ok(detectarPapelTrocado("Yorick, o velho camponês, cruza a praça.", npcs).length === 0, "o papel certo passa");
ok(detectarPapelTrocado("Yorick cruza a praça e ergue a mão.", npcs).length === 0, "sem aposto, sem acusação — a maior parte das frases");
ok(detectarPapelTrocado("O capitão da guarda Yorick ergue a mão.", npcs).length === 1, "e pega também com o cargo ANTES do nome");
ok(detectarPapelTrocado("Halvard, o capitão da guarda, ergue a mão.", npcs).length === 0, "o capitão de verdade continua capitão");
ok(detectarPapelTrocado("Iris, a taverneira, enche a caneca.", npcs).length === 0, "e cada um no seu lugar");
ok(detectarPapelTrocado("Contam que Yorick, o capitão da guarda, foi corajoso.", npcs).length === 0,
   "menção (\"contam que…\") não vira acusação — a mesma régua do resto do portão");
ok(detectarPapelTrocado("", npcs).length === 0 && detectarPapelTrocado("texto", null).length === 0, "entradas vazias não quebram");
const morto = { ...npcs, Yorick: { ...npcs.Yorick, status: "morto" } };
ok(detectarPapelTrocado("Yorick, o capitão da guarda, cruza a praça.", morto).length === 0, "morto não entra aqui — cai no cão de guarda de morte");

console.log("\n[5. NO PORTÃO INTEIRO]");
const v = violacoesDoTurno("Yorick, o capitão da guarda, cruza a praça e ergue a mão para o grupo parar.", {
  npcs, mapa: { cidades: [], rotas: [] }, cidadeAtual: "Aldoria",
});
const vp = v.find((x) => x.id === "papel");
ok(!!vp, "a violação entra no portão junto das outras");
ok(vp.aviso === "", "e é CALADA para o jogador — continuidade é encanamento");
ok(/Halvard/.test(vp.nota) && /Halvard/.test(vp.regra), "a nota e a regra dizem de quem é o cargo — é o que dá ao conserto o que reescrever");
ok(/velho camponês/.test(vp.regra), "e mandam tratar Yorick pelo papel do registro");
ok(vp.lembrete.length > 40, "o lembrete seco vai junto");
ok(violacoesDoTurno("Yorick, o velho camponês, cruza a praça e ergue a mão para o grupo parar.", {
  npcs, mapa: { cidades: [], rotas: [] }, cidadeAtual: "Aldoria",
}).every((x) => x.id !== "papel"), "narrativa coerente não paga conserto nenhum");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
