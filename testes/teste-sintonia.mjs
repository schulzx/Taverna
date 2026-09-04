import {
  MAX_SINTONIA, pedeSintonia, garantirSintonia, estaSintonizado, candidatos,
  alternarSintonia, sintoniaInicial, atributosValem, poderAtivo, resumoSintoniaPrompt,
} from "../src/sintonia.js";
import { bonusEquip, migrarPersonagem } from "../src/regras-jogo.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const I = (nome, raridade, extra = {}) => ({ nome, raridade, tipo: "anel", ...extra });

console.log("\n[1. O QUE PEDE SINTONIA]");
ok(!pedeSintonia(I("Espada Curta", "comum")), "aço comum não pede — é só um bom pedaço de metal");
ok(!pedeSintonia(I("Adaga Boa", "incomum")), "incomum sem poder também não");
ok(pedeSintonia(I("Anel do Corvo", "raro")), "raro pede");
/* v9.80: A RÉGUA MUDOU, E DE PROPÓSITO. Enquanto `poder` era um texto
   de enfeite lido por ninguém, "tem poder escrito" e "é raro" davam quase
   na mesma. Agora TODO item de incomum para cima carrega uma linha de
   poder de verdade — e manter a régua antiga faria o couro incomum ocupar
   um dos TRÊS lugares de sintonia, um teto que existe para as peças que
   mudam o jogo, não para as que ajudam um pouco. */
ok(!pedeSintonia(I("Espada +1", "incomum", { poder: "A lâmina queima." })), "o texto do poder não pede mais sintonia sozinho — quem pede é o degrau");
ok(pedeSintonia(I("Botas Aladas", "lendario", { concede: "Voo" })), "mas o que CONCEDE um poder pede sempre, venha de onde vier");
ok(!pedeSintonia(I("Relíquia", "lendario", { sintoniza: false })), "a marca explícita manda");
ok(!pedeSintonia(null) && !pedeSintonia({}), "entrada inválida não quebra");

console.log("\n[2. AS TRÊS VAGAS]");
const heroi = {
  equipados: { arma: I("Lâmina Ígnea", "raro", { poder: "queima", atributos: { forca: 2 } }), armadura: I("Cota Simples", "comum", { atributos: { defesa: 2 } }) },
  equipamento: [I("Anel do Corvo", "raro", { atributos: { destreza: 2 } }), I("Amuleto Antigo", "epico", { atributos: { intelecto: 3 } }), I("Manopla Menor", "raro", { atributos: { forca: 1 } })],
  sintonizados: [],
};
ok(candidatos(heroi).length === 4, `quatro objetos de poder e ${MAX_SINTONIA} vagas — é aí que nasce a decisão`);
ok(!candidatos(heroi).some((i) => i.nome === "Cota Simples"), "a cota comum não entra na conta");
let p = { ...heroi, sintonizados: [] };
for (const n of ["Lâmina Ígnea", "Anel do Corvo", "Amuleto Antigo"]) {
  const r = alternarSintonia(p, n); p = { ...p, sintonizados: r.sintonizados };
}
ok(p.sintonizados.length === 3, "encheu as três");
const excede = alternarSintonia(p, "Manopla Menor");
ok(!excede.ok && /solte um antes/.test(excede.motivo), `a quarta é recusada: "${excede.motivo}"`);
ok(alternarSintonia(p, "Lâmina Ígnea").ok, "mas soltar uma das que estão lá é livre");
ok(!alternarSintonia(p, "Item Fantasma").ok, "item que não está com você é recusado");

console.log("\n[3. O QUE FICA TRANCADO É O PODER, NÃO O AÇO]");
ok(atributosValem(p, heroi.equipados.armadura), "a cota comum vale sempre — nem pede sintonia");
ok(atributosValem(p, heroi.equipados.arma), "a lâmina sintonizada empresta o atributo dela");
const semSint = { ...heroi, sintonizados: [] };
ok(!atributosValem(semSint, heroi.equipados.arma), "a mesma lâmina, dormente, não empresta");
ok(poderAtivo(p, heroi.equipados.arma) === "queima", "o poder responde quando sintonizado");
ok(poderAtivo(semSint, heroi.equipados.arma) === "", "e cala quando dorme");
/* a prova que importa: a conta de atributo muda */
const comFogo = bonusEquip({ ...heroi, sintonizados: ["Lâmina Ígnea"] }, "forca");
const semFogo = bonusEquip({ ...heroi, sintonizados: [] }, "forca");
console.log(`  Força vinda do equipamento: sintonizado +${comFogo} · dormente +${semFogo}`);
ok(comFogo > semFogo, "sintonizar muda o número de verdade, não só o texto");
ok(bonusEquip({ ...heroi, sintonizados: [] }, "defesa") === 2, "e a armadura comum continua protegendo — o teto não vira 'seu equipamento não funciona'");

console.log("\n[4. HIGIENE]");
ok(garantirSintonia({ ...heroi, sintonizados: ["Item Que Vendi"] }).length === 0, "item que saiu da mochila perde a sintonia sozinho");
ok(garantirSintonia({ ...heroi, sintonizados: ["Anel do Corvo", "Anel do Corvo"] }).length === 1, "duplicata some");
ok(garantirSintonia({ ...heroi, sintonizados: candidatos(heroi).map((i) => i.nome) }).length === MAX_SINTONIA, "save adulterado é aparado no teto");
ok(garantirSintonia(null).length === 0, "personagem nulo não quebra");
ok(estaSintonizado(p, I("Faca", "comum")), "o que não pede sintonia conta como sempre inteiro");

console.log("\n[5. MIGRAÇÃO]");
const mig = migrarPersonagem({ nome: "Vera", classe: "Mago", nivel: 12, ...heroi, sintonizados: undefined });
console.log("  sintonizados na migração: " + mig.sintonizados.join(", "));
ok(mig.sintonizados.length === MAX_SINTONIA, "save antigo acorda com as três vagas cheias");
ok(mig.sintonizados.includes("Amuleto Antigo"), "e pega os de maior raridade primeiro — ninguém acorda com o equipamento apagado");
ok(mig.sintoniaVersao === 1, "marca a versão");
ok(migrarPersonagem({ ...mig, sintonizados: [] }).sintonizados.length === 0, "migrar de novo não re-preenche: a escolha do jogador manda");

console.log("\n[6. O QUE O MESTRE RECEBE]");
ok(resumoSintoniaPrompt({ equipados: {}, equipamento: [] }) === "", "sem objetos de poder, nada no prompt");
const rp = resumoSintoniaPrompt(p);
console.log("  " + rp.slice(0, 140));
ok(/DORMENTES/.test(rp), "diz quais estão dormentes");
ok(/Nunca descreva o efeito mágico de um item dormente/.test(rp), "e proíbe o Mestre de acordar a magia sozinho");
ok(rp.length < 600, `enxuto: ${rp.length} caracteres`);


/* ---------------- O SELO NA BOLSA (v9.194) ----------------
   `aba-bolsa-v2` foi redesenhada a partir do que a bolsa faz — moedas, o que
   está no corpo por slot com raridade e ficha de combate, o que está na
   mochila, e os consumíveis e componentes que não competem por sintonia.

   E aí apareceu o buraco. A regra da sintonia é DURA: o herói só sustenta
   três objetos de poder, e os demais ficam dormentes — continuam aço e
   couro, mas a magia não responde, e o prompt PROÍBE o Mestre de narrar o
   poder de um item dormente. A bolsa nunca dizia qual era qual. O jogador
   equipava a Coroa Perdida, lia "concede Invisibilidade" no próprio cartão,
   e ficava esperando um poder que estava desligado. A contagem morava noutro
   painel, longe do objeto. */
console.log("\n[o selo de sintonia na bolsa]");
{
  const { readFileSync } = await import("node:fs");
  const APP = readFileSync("../src/App.jsx", "utf8").replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  ok(/\{pedeSintonia\(it\) && \(\(\) => \{/.test(APP), "o selo só aparece em peça que PEDE sintonia");
  ok(/const ligado = estaSintonizado\(personagem, it\);/.test(APP), "e lê o estado da mesma função do resto da casa");
  ok(/✦ sintonizado — o poder responde/.test(APP), "diz quando o poder responde");
  ok(/○ dormente — é só metal enquanto não sintonizar/.test(APP), "e diz quando ele dorme");
  ok(/Você sustenta \$\{MAX_SINTONIA\} objetos de poder ao mesmo tempo/.test(APP), "o porquê vem do teto da tabela, não de um número digitado");

  /* e a régua da tela é a mesma da regra: item que não pede sintonia está
     sempre inteiro, e por isso não ganha selo nenhum */
  const coroa = I("Coroa Perdida", "lendario", { poderes: [{ id: "x", nome: "Sussurro" }] });
  /* a coroa precisa estar COM o herói: `alternarSintonia` recebe a chave e
     recusa item que não está na mão — foi assim que esta régua nasceu errada */
  const p = migrarPersonagem({ nome: "Prova", nivel: 5, equipados: { amuleto: coroa }, sintonizados: [] });
  ok(estaSintonizado(p, I("Espada Curta", "comum")) === true, "aço comum está sempre inteiro");
  ok(pedeSintonia(I("Espada Curta", "comum")) === false, "e por isso não recebe selo");
  ok(pedeSintonia(coroa) === true, "a peça de poder pede");
  const solto = { ...p, sintonizados: [] };
  ok(estaSintonizado(solto, coroa) === false, "e dorme enquanto não for sintonizada");
  const r = alternarSintonia(solto, "Coroa Perdida");
  ok(r.ok && estaSintonizado({ ...solto, sintonizados: r.sintonizados }, coroa) === true, "sintonizar acende o selo");
  ok(alternarSintonia({ ...solto, sintonizados: r.sintonizados }, "Coroa Perdida").acao === "soltou", "e soltar apaga de novo");
}
console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
