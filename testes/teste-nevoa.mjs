import {
  gerarGeografia, garantirGeografia, resumoGeografiaPrompt,
  cidadesConhecidas, descobrirCidade, descobrirRegiao, regioesDoMapa,
} from "../src/geografia.js";
import { mapasAVenda } from "../src/mercado.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

const SEM = "taverna|teste-nevoa";
let mapa = gerarGeografia(SEM, "Fantasia medieval");
console.log(`\nMundo gerado: ${mapa.cidades.length} cidades em ${[...new Set(mapa.cidades.map((c) => c.regiao))].length} regiões`);

console.log("\n[1. O MUNDO NASCE NO ESCURO]");
ok(mapa.cidades.every((c) => c.descoberta === false), "nenhuma cidade nasce descoberta");
ok(cidadesConhecidas(mapa).length === 0, "o herói não conhece nada ainda");
ok(resumoGeografiaPrompt(mapa, "") === "", "sem cidade conhecida, o Mestre não recebe geografia nenhuma");

/* o App abre a primeira — é a casa do herói */
mapa = { ...mapa, cidades: mapa.cidades.map((c, i) => (i === 0 ? { ...c, descoberta: true } : c)) };
const casa = mapa.cidades[0];
console.log(`  casa do herói: ${casa.nome} (${casa.regiao})`);

console.log("\n[2. O PROMPT SÓ CONTA O QUE ELE CONHECE]");
const p1 = resumoGeografiaPrompt(mapa, "");
ok(p1.includes(casa.nome), "a cidade conhecida aparece");
const outra = mapa.cidades.find((c) => c.descoberta === false);
ok(!p1.includes(outra.nome), `e ${outra.nome}, que ele nunca viu, NÃO aparece`);
ok(/AINDA NO ESCURO: existem \d+ lugar/.test(p1), "mas o Mestre sabe QUANTOS faltam");
ok(/NUNCA invente o nome/.test(p1), "e é proibido de inventar o nome deles");
console.log(`  prompt com 1 cidade: ${p1.length} caracteres`);

console.log("\n[3. ROTA NÃO ENTREGA DESTINO]");
const linhasRota = p1.split("\n").filter((l) => l.startsWith("• ") && l.includes("↔"));
const nomesOcultos = mapa.cidades.filter((c) => c.descoberta === false).map((c) => c.nome);
ok(linhasRota.every((l) => !nomesOcultos.some((n) => l.includes(n))), `nenhuma das ${linhasRota.length} rotas mostradas cita cidade desconhecida`);

console.log("\n[4. VIAJAR ABRE]");
const antes = cidadesConhecidas(mapa).length;
const r1 = descobrirCidade(mapa, outra.nome);
mapa = r1.mapa;
ok(r1.nova === outra.nome, `chegar em ${outra.nome} revelou o lugar`);
ok(cidadesConhecidas(mapa).length === antes + 1, "e só ele — uma cidade por vez");
ok(descobrirCidade(mapa, outra.nome).nova === null, "chegar de novo não anuncia nada duas vezes");
ok(descobrirCidade(mapa, "Cidade Que Não Existe").nova === null, "nome inexistente não quebra");
ok(descobrirCidade(null, "x").nova === null, "mapa nulo não quebra");

console.log("\n[5. O MAPA COMPRADO ABRE A REGIÃO INTEIRA]");
const ocultasR = regioesDoMapa(mapa, { conhecidas: false });
console.log(`  regiões ainda no escuro: ${ocultasR.join(", ") || "nenhuma"}`);
ok(ocultasR.length > 0, "há regiões inteiras por descobrir");
const alvoR = ocultasR[0];
const quantasNaRegiao = mapa.cidades.filter((c) => c.regiao === alvoR).length;
const r2 = descobrirRegiao(mapa, alvoR);
mapa = r2.mapa;
ok(r2.novas.length === quantasNaRegiao, `o mapa de ${alvoR} abriu as ${quantasNaRegiao} cidades dela de uma vez`);
ok(descobrirRegiao(mapa, alvoR).novas.length === 0, "comprar de novo não abre nada");
ok(descobrirRegiao(mapa, "Região Fantasma").novas.length === 0, "região inexistente não quebra");

console.log("\n[6. O QUE O CARTÓGRAFO VENDE]");
const porRegiao = {};
for (const c of mapa.cidades) if (c.regiao) porRegiao[c.regiao] = (porRegiao[c.regiao] || 0) + 1;
const mapas = mapasAVenda(regioesDoMapa(mapa, { conhecidas: false }), porRegiao);
mapas.slice(0, 4).forEach((m) => console.log(`  ${m.icone} ${m.nome} — ◉ ${m.preco} · ${m.descricao}`));
ok(mapas.every((m) => m.tipo === "mapa" && m.regiao), "todo mapa carrega a região que abre");
ok(mapas.every((m) => m.preco > 0), "e tem preço");
ok(!mapas.some((m) => m.regiao === alvoR), "a região já comprada sai da prateleira");
const maior = [...mapas].sort((a, b) => b.preco - a.preco)[0];
const menor = [...mapas].sort((a, b) => a.preco - b.preco)[0];
ok(!maior || !menor || porRegiao[maior.regiao] >= porRegiao[menor.regiao], "região com mais cidades custa mais caro");

console.log("\n[7. MIGRAÇÃO — nenhum save existente pode perder o mapa]");
/* é o que o App faz quando o save não traz nevoaVersao */
const antigo = { cidades: mapa.cidades.map(({ descoberta, ...c }) => c), regioes: mapa.regioes, rotas: mapa.rotas, continente: mapa.continente };
ok(antigo.cidades.every((c) => c.descoberta === undefined), "save antigo nem tinha o campo");
ok(cidadesConhecidas(antigo).length === antigo.cidades.length, "sem o campo, tudo conta como conhecido — ninguém perde mapa por descuido");
const migrado = { ...antigo, cidades: antigo.cidades.map((c) => ({ ...c, descoberta: true })) };
ok(cidadesConhecidas(migrado).length === migrado.cidades.length, "e a migração explícita revela tudo");
ok(!/AINDA NO ESCURO/.test(resumoGeografiaPrompt(migrado, "")), "quem já conhecia o mundo não vê aviso de névoa");
const g = garantirGeografia(antigo, SEM);
ok(cidadesConhecidas(g).length === g.cidades.length, "garantirGeografia não apaga o que já era conhecido");

console.log("\n[8. TUDO DESCOBERTO = COMPORTAMENTO ANTIGO]");
const cheio = { ...mapa, cidades: mapa.cidades.map((c) => ({ ...c, descoberta: true })) };
const pCheio = resumoGeografiaPrompt(cheio, "Ordem do Corvo");
ok(cheio.cidades.every((c) => pCheio.includes(c.nome)), "com tudo aberto, todas as cidades voltam ao prompt");
ok(!/AINDA NO ESCURO/.test(pCheio), "e o aviso de névoa some");
ok(pCheio.includes("Ordem do Corvo"), "a facção do jogador continua no cabeçalho");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
